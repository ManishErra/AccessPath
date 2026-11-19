import { IssueCategory, ISSUE_CATEGORIES, ReporterContext } from '../types';

export interface ReportFormData {
  location: string;
  locationDetail: string;
  category: IssueCategory | '';
  title: string;
  description: string;
  reporterContext: ReporterContext | '';
  photoDataUrl?: string;
  confirmedGuidelines: boolean;
}

export interface ValidationErrors {
  location?: string;
  category?: string;
  title?: string;
  description?: string;
  photo?: string;
  confirmedGuidelines?: string;
}

export const MAX_PHOTO_BYTES = 2 * 1024 * 1024; // 2MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function validateReportForm(data: ReportFormData): {
  isValid: boolean;
  errors: ValidationErrors;
} {
  const errors: ValidationErrors = {};

  // Location validation
  const locationTrimmed = data.location.trim();
  if (!locationTrimmed) {
    errors.location = 'Please specify a campus block or building (e.g. "Block 34").';
  } else if (locationTrimmed.length < 2) {
    errors.location = 'Location name must be at least 2 characters.';
  } else if (locationTrimmed.length > 100) {
    errors.location = 'Location name cannot exceed 100 characters.';
  }

  // Category validation
  if (!data.category) {
    errors.category = 'Please select an accessibility issue category.';
  } else if (!ISSUE_CATEGORIES.includes(data.category as IssueCategory)) {
    errors.category = 'Invalid issue category selected.';
  }

  // Title validation
  const titleTrimmed = data.title.trim();
  if (!titleTrimmed) {
    errors.title = 'Please enter a brief summary title for this issue.';
  } else if (titleTrimmed.length < 4) {
    errors.title = 'Title must be at least 4 characters.';
  } else if (titleTrimmed.length > 120) {
    errors.title = 'Title cannot exceed 120 characters.';
  }

  // Description validation
  const descTrimmed = data.description.trim();
  if (!descTrimmed) {
    errors.description = 'Please describe the accessibility issue you observed.';
  } else if (descTrimmed.length < 15) {
    errors.description = `Please provide a bit more detail (at least 15 characters, currently ${descTrimmed.length}).`;
  } else if (descTrimmed.length > 1000) {
    errors.description = 'Description cannot exceed 1000 characters.';
  }

  // Checkbox confirmation
  if (!data.confirmedGuidelines) {
    errors.confirmedGuidelines =
      'You must confirm that this report does not contain personal or sensitive information.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validatePhotoFile(file: File): { isValid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Unsupported file type. Please upload a JPEG, PNG, WebP, or GIF image.',
    };
  }

  if (file.size > MAX_PHOTO_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `File is too large (${sizeMb} MB). Maximum allowed image size is 2.0 MB.`,
    };
  }

  return { isValid: true };
}
