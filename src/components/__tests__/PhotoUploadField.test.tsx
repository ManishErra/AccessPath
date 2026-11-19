import React, { useState } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { PhotoUploadField } from '../PhotoUploadField';
import { saveReport, initializeStorage } from '../../services/storage';
import { validateReportForm, ReportFormData } from '../../utils/validation';

// Controlled test wrapper for PhotoUploadField
const TestPhotoUploadWrapper: React.FC<{
  initialPhoto?: string;
  initialError?: string | null;
  onPhotoChanged?: (url: string | undefined) => void;
  onErrorChanged?: (err: string | null) => void;
}> = ({ initialPhoto, initialError, onPhotoChanged, onErrorChanged }) => {
  const [photo, setPhoto] = useState<string | undefined>(initialPhoto);
  const [error, setError] = useState<string | null>(initialError || null);

  return (
    <PhotoUploadField
      photoDataUrl={photo}
      onPhotoChange={(url) => {
        setPhoto(url);
        onPhotoChanged?.(url);
      }}
      photoError={error}
      onErrorChange={(err) => {
        setError(err);
        onErrorChanged?.(err);
      }}
    />
  );
};

describe('PhotoUploadField Component Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    initializeStorage();
    vi.restoreAllMocks();
  });

  it('1. Renders file input, upload prompt button, and accessible guidelines', () => {
    render(<TestPhotoUploadWrapper />);

    expect(screen.getByText(/Attach Photo/i)).toBeDefined();
    expect(screen.getByText(/Choose an image from your device/i)).toBeDefined();
    expect(screen.getByText(/Supported formats: JPEG, PNG, WebP, GIF/i)).toBeDefined();

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeDefined();
    expect(input.accept).toContain('image/jpeg');
  });

  it('2. Selecting a valid JPEG image renders preview and remove button', async () => {
    const mockDataUrl = 'data:image/jpeg;base64,mockValidJpegData';
    class MockFileReader {
      onload: ((e: ProgressEvent<FileReader>) => void) | null = null;
      readAsDataURL() {
        setTimeout(() => {
          this.onload?.({ target: { result: mockDataUrl } } as unknown as ProgressEvent<FileReader>);
        }, 0);
      }
    }
    vi.stubGlobal('FileReader', MockFileReader);

    render(<TestPhotoUploadWrapper />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['valid photo'], 'lift.jpg', { type: 'image/jpeg' });

    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
      await new Promise((r) => setTimeout(r, 10));
    });

    const previewImg = screen.getByAltText('Accessibility barrier preview') as HTMLImageElement;
    expect(previewImg).toBeDefined();
    expect(previewImg.src).toBe(mockDataUrl);
    expect(screen.getByRole('button', { name: /Remove attached photo/i })).toBeDefined();
  });

  it('2b. Selecting valid PNG and WebP images successfully reads and renders preview', async () => {
    let currentMock = '';
    class MultiFileReader {
      onload: ((e: ProgressEvent<FileReader>) => void) | null = null;
      readAsDataURL(file: File) {
        currentMock = `data:${file.type};base64,mock_${file.name}`;
        setTimeout(() => {
          this.onload?.({ target: { result: currentMock } } as unknown as ProgressEvent<FileReader>);
        }, 0);
      }
    }
    vi.stubGlobal('FileReader', MultiFileReader);

    // Test PNG
    const { unmount } = render(<TestPhotoUploadWrapper />);
    const inputPng = document.querySelector('input[type="file"]') as HTMLInputElement;
    const pngFile = new File(['png data'], 'ramp.png', { type: 'image/png' });

    await act(async () => {
      fireEvent.change(inputPng, { target: { files: [pngFile] } });
      await new Promise((r) => setTimeout(r, 10));
    });

    const pngImg = screen.getByAltText('Accessibility barrier preview') as HTMLImageElement;
    expect(pngImg.src).toContain('image/png');
    unmount();

    // Test WebP
    render(<TestPhotoUploadWrapper />);
    const inputWebp = document.querySelector('input[type="file"]') as HTMLInputElement;
    const webpFile = new File(['webp data'], 'signage.webp', { type: 'image/webp' });

    await act(async () => {
      fireEvent.change(inputWebp, { target: { files: [webpFile] } });
      await new Promise((r) => setTimeout(r, 10));
    });

    const webpImg = screen.getByAltText('Accessibility barrier preview') as HTMLImageElement;
    expect(webpImg.src).toContain('image/webp');
  });

  it('2c. Selecting a valid GIF image successfully reads and renders preview', async () => {
    const mockGifUrl = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    class GifFileReader {
      onload: ((e: ProgressEvent<FileReader>) => void) | null = null;
      readAsDataURL() {
        setTimeout(() => {
          this.onload?.({ target: { result: mockGifUrl } } as unknown as ProgressEvent<FileReader>);
        }, 0);
      }
    }
    vi.stubGlobal('FileReader', GifFileReader);

    render(<TestPhotoUploadWrapper />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const gifFile = new File(['gif image data'], 'barrier_animation.gif', { type: 'image/gif' });

    await act(async () => {
      fireEvent.change(input, { target: { files: [gifFile] } });
      await new Promise((r) => setTimeout(r, 10));
    });

    const gifImg = screen.getByAltText('Accessibility barrier preview') as HTMLImageElement;
    expect(gifImg).toBeDefined();
    expect(gifImg.src).toBe(mockGifUrl);
    expect(screen.getByRole('button', { name: /Remove attached photo/i })).toBeDefined();
  });

  it('3. Selecting an invalid file format rejects file and renders alert', async () => {
    render(<TestPhotoUploadWrapper />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const invalidFile = new File(['pdf document'], 'document.pdf', { type: 'application/pdf' });

    await act(async () => {
      fireEvent.change(input, { target: { files: [invalidFile] } });
    });

    expect(screen.queryByAltText('Accessibility barrier preview')).toBeNull();
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('JPEG, PNG, WebP, or GIF');
  });

  it('4. Selecting an oversized file (> 2 MB) displays size limit error', async () => {
    render(<TestPhotoUploadWrapper />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const oversizedFile = new File(['x'.repeat(100)], 'huge.jpg', { type: 'image/jpeg' });
    Object.defineProperty(oversizedFile, 'size', { value: 3 * 1024 * 1024 }); // 3 MB

    await act(async () => {
      fireEvent.change(input, { target: { files: [oversizedFile] } });
    });

    expect(screen.queryByAltText('Accessibility barrier preview')).toBeNull();
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('2.0 MB');
  });

  it('5. Clicking the Remove button removes attached photo and restores upload button', async () => {
    const existingPhoto = 'data:image/png;base64,existingPhoto';
    render(<TestPhotoUploadWrapper initialPhoto={existingPhoto} />);

    expect(screen.getByAltText('Accessibility barrier preview')).toBeDefined();
    const removeBtn = screen.getByRole('button', { name: /Remove attached photo/i });

    await act(async () => {
      fireEvent.click(removeBtn);
    });

    expect(screen.queryByAltText('Accessibility barrier preview')).toBeNull();
    expect(screen.getByText(/Choose an image from your device/i)).toBeDefined();
  });

  it('6. Handles FileReader onerror event by clearing photo and displaying error alert', async () => {
    class FailingFileReader {
      onerror: ((e: ProgressEvent<FileReader>) => void) | null = null;
      readAsDataURL() {
        setTimeout(() => {
          this.onerror?.(new Event('error') as unknown as ProgressEvent<FileReader>);
        }, 0);
      }
    }
    vi.stubGlobal('FileReader', FailingFileReader);

    render(<TestPhotoUploadWrapper />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['content'], 'test.png', { type: 'image/png' });

    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
      await new Promise((r) => setTimeout(r, 10));
    });

    expect(screen.queryByAltText('Accessibility barrier preview')).toBeNull();
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('Failed to read the selected image file');
  });

  it('7. Handles FileReader onabort event cleanly', async () => {
    class AbortingFileReader {
      onabort: ((e: ProgressEvent<FileReader>) => void) | null = null;
      readAsDataURL() {
        setTimeout(() => {
          this.onabort?.(new Event('abort') as unknown as ProgressEvent<FileReader>);
        }, 0);
      }
    }
    vi.stubGlobal('FileReader', AbortingFileReader);

    render(<TestPhotoUploadWrapper />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['content'], 'test.png', { type: 'image/png' });

    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
      await new Promise((r) => setTimeout(r, 10));
    });

    expect(screen.queryByAltText('Accessibility barrier preview')).toBeNull();
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('cancelled');
  });

  it('8. Rapid consecutive selections: an older slower read CANNOT overwrite a newer selection', async () => {
    // Simulate File 1 taking 50ms and File 2 taking 5ms
    let fileCount = 0;
    class RaceFileReader {
      onload: ((e: ProgressEvent<FileReader>) => void) | null = null;
      abort() {
        // aborted
      }
      readAsDataURL(_file: File) {
        fileCount++;
        const myIndex = fileCount;
        const delay = myIndex === 1 ? 50 : 5;
        setTimeout(() => {
          this.onload?.({
            target: { result: `data:image/jpeg;base64,photo_file_${myIndex}` },
          } as unknown as ProgressEvent<FileReader>);
        }, delay);
      }
    }
    vi.stubGlobal('FileReader', RaceFileReader);

    render(<TestPhotoUploadWrapper />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file1 = new File(['photo1'], 'photo1.jpg', { type: 'image/jpeg' });
    const file2 = new File(['photo2'], 'photo2.jpg', { type: 'image/jpeg' });

    // Select file 1
    await act(async () => {
      fireEvent.change(input, { target: { files: [file1] } });
    });

    // Immediately select file 2 before file 1 completes
    await act(async () => {
      fireEvent.change(input, { target: { files: [file2] } });
      // Wait for both timers to complete
      await new Promise((r) => setTimeout(r, 70));
    });

    // The rendered image MUST be photo_file_2, NEVER photo_file_1!
    const previewImg = screen.getByAltText('Accessibility barrier preview') as HTMLImageElement;
    expect(previewImg.src).toContain('photo_file_2');
    expect(previewImg.src).not.toContain('photo_file_1');
  });

  it('9. Selecting an invalid file after a valid one immediately clears the old image', async () => {
    const existingPhoto = 'data:image/jpeg;base64,firstValidPhoto';
    render(<TestPhotoUploadWrapper initialPhoto={existingPhoto} />);

    expect(screen.getByAltText('Accessibility barrier preview')).toBeDefined();

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const invalidFile = new File(['malicious.exe'], 'malicious.exe', { type: 'application/x-msdownload' });

    await act(async () => {
      fireEvent.change(input, { target: { files: [invalidFile] } });
    });

    // Prior photo MUST be cleared, NOT silently attached
    expect(screen.queryByAltText('Accessibility barrier preview')).toBeNull();
    const alert = screen.getByRole('alert');
    expect(alert).toBeDefined();
    expect(alert.textContent).toContain('JPEG, PNG, WebP, or GIF');
  });

  it('10. Report submission with and without an attached photo saves accurately to storage', () => {
    // A. Submission without photo
    const formWithoutPhoto: ReportFormData = {
      location: 'Block 34',
      locationDetail: '',
      category: 'Lift / Elevator',
      title: 'Lift button issue without photo',
      description: 'Button is loose and needs immediate inspection.',
      reporterContext: '',
      confirmedGuidelines: true,
      photoDataUrl: undefined,
    };
    const valWithout = validateReportForm(formWithoutPhoto);
    expect(valWithout.isValid).toBe(true);

    const saveWithout = saveReport({
      location: formWithoutPhoto.location,
      category: formWithoutPhoto.category as any,
      title: formWithoutPhoto.title,
      description: formWithoutPhoto.description,
      photoDataUrl: formWithoutPhoto.photoDataUrl,
    });
    expect(saveWithout.success).toBe(true);
    expect(saveWithout.report?.photoDataUrl).toBeUndefined();

    // B. Submission with photo
    const samplePhotoUrl = 'data:image/jpeg;base64,validBase64PhotoString';
    const formWithPhoto: ReportFormData = {
      location: 'Block 33',
      locationDetail: '',
      category: 'Ramp',
      title: 'Ramp signage missing with photo',
      description: 'No accessible ramp indicators posted at north stairs.',
      reporterContext: '',
      confirmedGuidelines: true,
      photoDataUrl: samplePhotoUrl,
    };
    const valWith = validateReportForm(formWithPhoto);
    expect(valWith.isValid).toBe(true);

    const saveWith = saveReport({
      location: formWithPhoto.location,
      category: formWithPhoto.category as any,
      title: formWithPhoto.title,
      description: formWithPhoto.description,
      photoDataUrl: formWithPhoto.photoDataUrl,
    });
    expect(saveWith.success).toBe(true);
    expect(saveWith.report?.photoDataUrl).toBe(samplePhotoUrl);
  });

  it('11. Storage quota failure while saving a report with photo reports quota exceeded cleanly', () => {
    let writeCount = 0;
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      writeCount++;
      if (writeCount === 1) {
        const quotaErr = new Error('The quota has been exceeded.');
        quotaErr.name = 'QuotaExceededError';
        throw quotaErr;
      }
    });

    try {
      const result = saveReport({
        location: 'Block 34',
        category: 'Lift / Elevator',
        title: 'Quota error photo report',
        description: 'Large photo exceeds quota during localStorage write attempt.',
        photoDataUrl: 'data:image/jpeg;base64,massivePhotoPayload',
      });

      expect(result.success).toBe(false);
      expect(result.isQuotaError).toBe(true);
      expect(result.error).toContain('quota exceeded');
    } finally {
      spy.mockRestore();
    }
  });
});
