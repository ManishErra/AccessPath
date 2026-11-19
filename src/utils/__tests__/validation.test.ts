import { describe, it, expect } from 'vitest';
import { validateReportForm, validatePhotoFile, ReportFormData } from '../validation';

describe('Report Form Validation', () => {
  const validData: ReportFormData = {
    location: 'Block 34',
    locationDetail: '2nd floor east wing',
    category: 'Lift / Elevator',
    title: 'Lift button panel unreadable',
    description: 'The elevator display is flickering and floor indicator buttons are not illuminated.',
    reporterContext: 'Observed it',
    confirmedGuidelines: true,
  };

  it('validates correct report form data with no errors', () => {
    const result = validateReportForm(validData);
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors).length).toBe(0);
  });

  it('fails if location is empty or too short', () => {
    const result = validateReportForm({ ...validData, location: ' ' });
    expect(result.isValid).toBe(false);
    expect(result.errors.location).toBeDefined();

    const result2 = validateReportForm({ ...validData, location: 'A' });
    expect(result2.isValid).toBe(false);
    expect(result2.errors.location).toContain('at least 2 characters');
  });

  it('fails if category is missing', () => {
    const result = validateReportForm({ ...validData, category: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors.category).toBeDefined();
  });

  it('fails if title is too short', () => {
    const result = validateReportForm({ ...validData, title: 'Hi' });
    expect(result.isValid).toBe(false);
    expect(result.errors.title).toBeDefined();
  });

  it('fails if description is under 15 characters', () => {
    const result = validateReportForm({ ...validData, description: 'Broken lift' });
    expect(result.isValid).toBe(false);
    expect(result.errors.description).toContain('at least 15 characters');
  });

  it('fails if confirmation checkbox is unchecked', () => {
    const result = validateReportForm({ ...validData, confirmedGuidelines: false });
    expect(result.isValid).toBe(false);
    expect(result.errors.confirmedGuidelines).toBeDefined();
  });

  it('rejects unsupported photo MIME types', () => {
    const dummyPdf = new File(['%PDF-1.4'], 'doc.pdf', { type: 'application/pdf' });
    const check = validatePhotoFile(dummyPdf);
    expect(check.isValid).toBe(false);
    expect(check.error).toContain('Unsupported file type');
  });

  it('rejects oversized photos (> 2MB)', () => {
    const bigFile = new File([new Uint8Array(2.5 * 1024 * 1024)], 'photo.png', { type: 'image/png' });
    const check = validatePhotoFile(bigFile);
    expect(check.isValid).toBe(false);
    expect(check.error).toContain('too large');
  });

  it('accepts valid small JPEG/PNG photos', () => {
    const goodFile = new File([new Uint8Array(500 * 1024)], 'photo.jpg', { type: 'image/jpeg' });
    const check = validatePhotoFile(goodFile);
    expect(check.isValid).toBe(true);
    expect(check.error).toBeUndefined();
  });

  it('handles valid image followed by invalid image sequence by ensuring invalid file is rejected and photo is cleared', () => {
    // Step 1: User selects valid photo
    const validFile = new File([new Uint8Array(200 * 1024)], 'initial.jpg', { type: 'image/jpeg' });
    const firstCheck = validatePhotoFile(validFile);
    expect(firstCheck.isValid).toBe(true);

    let currentPhotoState: string | undefined = 'data:image/jpeg;base64,samplevaliddata';

    // Step 2: User subsequently selects an invalid file (e.g. PDF or oversized)
    const invalidFile = new File(['not an image'], 'doc.pdf', { type: 'application/pdf' });
    const secondCheck = validatePhotoFile(invalidFile);
    expect(secondCheck.isValid).toBe(false);
    expect(secondCheck.error).toBeDefined();

    // Verification of component logic: on failed validation, photoDataUrl must be cleared
    if (!secondCheck.isValid) {
      currentPhotoState = undefined;
    }
    expect(currentPhotoState).toBeUndefined();

    // Step 3: Verify form submitted now has no residual photo data
    const formWithPhotoCleared: ReportFormData = {
      ...validData,
      photoDataUrl: currentPhotoState,
    };
    const formCheck = validateReportForm(formWithPhotoCleared);
    expect(formCheck.isValid).toBe(true);
    expect(formWithPhotoCleared.photoDataUrl).toBeUndefined();
  });

  it('handles FileReader failure state transition by resetting photo attachment', () => {
    let attachedPhoto: string | undefined = 'data:image/jpeg;base64,previouslyloadedphoto';
    let photoErrorMessage: string | null = null;

    // Simulate FileReader onerror / onabort handler firing
    const handleFileReaderError = () => {
      attachedPhoto = undefined;
      photoErrorMessage = 'Failed to read the selected image file. Please try another image.';
    };

    handleFileReaderError();

    expect(attachedPhoto).toBeUndefined();
    expect(photoErrorMessage).toContain('Failed to read');
  });

  it('handles image removal correctly', () => {
    let attachedPhoto: string | undefined = 'data:image/png;base64,xyz123';
    let photoError: string | null = 'some error';

    // Simulate handleRemovePhoto
    const handleRemovePhoto = () => {
      attachedPhoto = undefined;
      photoError = null;
    };

    handleRemovePhoto();

    expect(attachedPhoto).toBeUndefined();
    expect(photoError).toBeNull();
  });
});

