import React, { useRef } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import { validatePhotoFile } from '../utils/validation';

export interface PhotoUploadFieldProps {
  photoDataUrl?: string;
  onPhotoChange: (dataUrl: string | undefined) => void;
  photoError?: string | null;
  onErrorChange: (error: string | null) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
}

export interface PhotoSelectionCallbacks {
  setPhotoDataUrl: (url: string | undefined) => void;
  setPhotoError: (err: string | null) => void;
  resetFileInput: () => void;
  FileReaderClass?: typeof FileReader;
}

export interface PhotoSelectionOptions {
  selectionId?: number;
  getCurrentSelectionId?: () => number;
  activeReaderRef?: { current: FileReader | null };
}

/**
 * Core photo selection logic used by PhotoUploadField and SubmitReportPage.
 * Ensures that whenever an invalid file is selected, any previously attached photo
 * is cleared immediately and cannot remain silently attached.
 * Also protects against race conditions where older FileReader reads could overwrite newer selections.
 */
export function handlePhotoSelection(
  file: File | undefined,
  callbacks: PhotoSelectionCallbacks,
  options?: PhotoSelectionOptions
): void {
  callbacks.setPhotoError(null);

  if (!file) {
    return;
  }

  const validation = validatePhotoFile(file);
  if (!validation.isValid) {
    // Clear previous valid photo immediately so it cannot silently remain attached
    callbacks.setPhotoDataUrl(undefined);
    callbacks.setPhotoError(validation.error || 'Invalid file format or file size exceeded.');
    callbacks.resetFileInput();
    if (options?.activeReaderRef) {
      options.activeReaderRef.current = null;
    }
    return;
  }

  const ReaderClass = callbacks.FileReaderClass || FileReader;
  const reader = new ReaderClass();
  if (options?.activeReaderRef) {
    options.activeReaderRef.current = reader;
  }

  const mySelectionId = options?.selectionId;

  reader.onload = (event: ProgressEvent<FileReader>) => {
    // If a newer selection was triggered, discard this result
    if (options?.getCurrentSelectionId && mySelectionId !== undefined) {
      if (options.getCurrentSelectionId() !== mySelectionId) {
        return;
      }
    }
    if (options?.activeReaderRef) {
      options.activeReaderRef.current = null;
    }
    callbacks.setPhotoDataUrl(event.target?.result as string);
  };

  reader.onerror = () => {
    if (options?.getCurrentSelectionId && mySelectionId !== undefined) {
      if (options.getCurrentSelectionId() !== mySelectionId) {
        return;
      }
    }
    if (options?.activeReaderRef) {
      options.activeReaderRef.current = null;
    }
    callbacks.setPhotoDataUrl(undefined);
    callbacks.setPhotoError('Failed to read the selected image file. Please try another image.');
    callbacks.resetFileInput();
  };

  reader.onabort = () => {
    if (options?.getCurrentSelectionId && mySelectionId !== undefined) {
      if (options.getCurrentSelectionId() !== mySelectionId) {
        return;
      }
    }
    if (options?.activeReaderRef) {
      options.activeReaderRef.current = null;
    }
    callbacks.setPhotoDataUrl(undefined);
    callbacks.setPhotoError('Image upload was interrupted or cancelled.');
    callbacks.resetFileInput();
  };

  reader.readAsDataURL(file);
}

/**
 * Core photo removal logic used by PhotoUploadField.
 */
export function handlePhotoRemoval(callbacks: {
  setPhotoDataUrl: (url: string | undefined) => void;
  setPhotoError: (err: string | null) => void;
  resetFileInput: () => void;
}): void {
  callbacks.setPhotoDataUrl(undefined);
  callbacks.setPhotoError(null);
  callbacks.resetFileInput();
}

export const PhotoUploadField: React.FC<PhotoUploadFieldProps> = ({
  photoDataUrl,
  onPhotoChange,
  photoError,
  onErrorChange,
  inputRef,
}) => {
  const internalRef = useRef<HTMLInputElement>(null);
  const fileInputRef = inputRef || internalRef;
  const selectionIdRef = useRef<number>(0);
  const activeReaderRef = useRef<FileReader | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    selectionIdRef.current += 1;
    const currentId = selectionIdRef.current;

    if (activeReaderRef.current) {
      try {
        activeReaderRef.current.abort();
      } catch {}
      activeReaderRef.current = null;
    }

    const file = e.target.files?.[0];
    handlePhotoSelection(
      file,
      {
        setPhotoDataUrl: onPhotoChange,
        setPhotoError: onErrorChange,
        resetFileInput: () => {
          if (fileInputRef.current) fileInputRef.current.value = '';
        },
      },
      {
        selectionId: currentId,
        getCurrentSelectionId: () => selectionIdRef.current,
        activeReaderRef,
      }
    );
  };

  const onRemove = () => {
    selectionIdRef.current += 1;
    if (activeReaderRef.current) {
      try {
        activeReaderRef.current.abort();
      } catch {}
      activeReaderRef.current = null;
    }

    handlePhotoRemoval({
      setPhotoDataUrl: onPhotoChange,
      setPhotoError: onErrorChange,
      resetFileInput: () => {
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
    });
  };

  return (
    <div className="form-group">
      <label htmlFor="field-photo" className="form-label">
        Attach Photo <span style={{ fontWeight: 400, color: 'var(--color-text-subtle)' }}>(Optional, max 2.0 MB)</span>
      </label>

      <input
        ref={fileInputRef}
        id="field-photo"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={onFileChange}
        style={{ display: 'none' }}
      />

      {photoDataUrl ? (
        <div
          style={{
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            backgroundColor: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            alignItems: 'flex-start',
          }}
        >
          <div style={{ position: 'relative', maxWidth: '320px', width: '100%' }}>
            <img
              src={photoDataUrl}
              alt="Accessibility barrier preview"
              style={{
                width: '100%',
                maxHeight: '220px',
                objectFit: 'cover',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid #cbd5e1',
              }}
            />
            <button
              type="button"
              onClick={onRemove}
              className="btn btn-secondary btn-sm"
              style={{
                position: 'absolute',
                top: '0.5rem',
                right: '0.5rem',
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                color: '#ffffff',
                borderColor: 'transparent',
                padding: '0.25rem 0.5rem',
                gap: '0.25rem',
              }}
              aria-label="Remove attached photo"
            >
              <X size={14} />
              <span>Remove</span>
            </button>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Photo attached. It will be stored in your browser session with this report.
          </span>
        </div>
      ) : (
        <div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-secondary"
            style={{ gap: '0.4rem', width: '100%', padding: '0.875rem' }}
          >
            <Upload size={18} />
            <span>Choose an image from your device</span>
          </button>
          <span className="form-hint" style={{ marginTop: '0.25rem', display: 'block' }}>
            Supported formats: JPEG, PNG, WebP, GIF. Please do NOT photograph identifiable faces.
          </span>
        </div>
      )}

      {photoError && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--color-danger)',
            fontSize: '0.8125rem',
            marginTop: '0.4rem',
          }}
        >
          <AlertCircle size={15} />
          <span>{photoError}</span>
        </div>
      )}
    </div>
  );
};

