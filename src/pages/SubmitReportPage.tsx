import React, { useState, useRef } from 'react';
import { useRouter } from '../router';
import {
  ISSUE_CATEGORIES,
  REPORTER_CONTEXTS,
  IssueCategory,
  ReporterContext,
} from '../types';
import { saveReport } from '../services/storage';
import {
  ReportFormData,
  validateReportForm,
  ValidationErrors,
} from '../utils/validation';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { PhotoUploadField } from '../components/PhotoUploadField';
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Shield,
  AlertTriangle,
} from 'lucide-react';

interface SubmitReportPageProps {
  onReportSubmitted: () => void;
}

export const SubmitReportPage: React.FC<SubmitReportPageProps> = ({ onReportSubmitted }) => {
  const { route, navigateToReport, navigate } = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialLoc = route.name === 'submit' ? route.initialLocation || '' : '';
  const initialCat = route.name === 'submit' ? (route.initialCategory as IssueCategory) || '' : '';

  const [formData, setFormData] = useState<ReportFormData>({
    location: initialLoc,
    locationDetail: '',
    category: initialCat,
    title: '',
    description: '',
    reporterContext: '',
    photoDataUrl: undefined,
    confirmedGuidelines: false,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const result = validateReportForm(formData);

    if (!result.isValid) {
      setErrors(result.errors);
      // Focus first error element
      const firstErrorKey = Object.keys(result.errors)[0];
      const el = document.getElementById(`field-${firstErrorKey}`);
      if (el) el.focus();
      return;
    }

    setErrors({});

    // Save to storage
    const saveResult = saveReport({
      location: formData.location,
      locationDetail: formData.locationDetail,
      category: formData.category as IssueCategory,
      title: formData.title,
      description: formData.description,
      reporterContext: formData.reporterContext
        ? (formData.reporterContext as ReporterContext)
        : undefined,
      photoDataUrl: formData.photoDataUrl,
    });

    if (!saveResult.success || !saveResult.report) {
      setSubmitError(saveResult.error || 'Failed to save report to local storage.');
      // Scroll to error
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    setSubmittedReportId(saveResult.report.id);
    onReportSubmitted();
  };

  if (submittedReportId) {
    return (
      <main id="main-content" className="container" style={{ padding: '3.5rem 0' }}>
        <div
          className="card"
          style={{
            maxWidth: '640px',
            margin: '0 auto',
            padding: '2.5rem',
            textAlign: 'center',
            backgroundColor: '#ffffff',
          }}
          role="status"
          aria-live="polite"
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#d1fae5',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669',
              marginBottom: '1.25rem',
            }}
          >
            <CheckCircle2 size={36} aria-hidden="true" />
          </div>

          <h1 style={{ fontSize: '1.625rem', color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
            Report Submitted Successfully
          </h1>

          <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            Thank you for sharing campus accessibility observations. Your report for{' '}
            <strong>{formData.location}</strong> has been saved locally on this browser and is now visible in Search and My Reports.
          </p>

          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '2rem',
              fontSize: '0.8125rem',
              color: 'var(--color-text-subtle)',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontWeight: 600, color: 'var(--color-primary)' }}>
              <Shield size={16} color="var(--color-accent)" />
              <span>Local Demonstration Notice</span>
            </div>
            <p style={{ marginTop: '0.25rem', lineHeight: 1.5 }}>
              This is a student prototype. In a future production deployment with university integration, this would enter the moderation queue for campus facilities. For now, it is stored in your device&apos;s local storage.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigateToReport(submittedReportId)}
              className="btn btn-primary"
              style={{ gap: '0.35rem' }}
            >
              <span>View Submitted Report</span>
              <ArrowRight size={15} />
            </button>

            <button
              onClick={() => navigate('#/my-reports')}
              className="btn btn-secondary"
            >
              Go to My Reports
            </button>

            <button
              onClick={() => {
                setSubmittedReportId(null);
                setSubmitError(null);
                setFormData({
                  location: '',
                  locationDetail: '',
                  category: '',
                  title: '',
                  description: '',
                  reporterContext: '',
                  photoDataUrl: undefined,
                  confirmedGuidelines: false,
                });
              }}
              className="btn btn-secondary"
            >
              Submit Another Report
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" tabIndex={-1} style={{ padding: '2rem 0 4rem 0' }}>
      <div className="container" style={{ maxWidth: '780px' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.875rem', color: 'var(--color-primary)', marginBottom: '0.35rem' }}>
            Report an Accessibility Issue
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
            Help fellow campus students navigate by documenting physical or informational barriers. No student ID, password, or login required.
          </p>
        </div>

        {/* Advisory banner */}
        <DisclaimerBanner compact />

        {/* Submission Error Banner */}
        {submitError && (
          <div
            role="alert"
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderLeft: '4px solid #dc2626',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
            }}
          >
            <AlertTriangle size={22} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
            <div>
              <strong style={{ color: '#991b1b', fontSize: '0.9375rem' }}>
                Storage Error — Report Could Not Be Saved
              </strong>
              <p style={{ fontSize: '0.875rem', color: '#b91c1c', marginTop: '0.25rem', lineHeight: 1.5 }}>
                {submitError}
              </p>
            </div>
          </div>
        )}

        {/* Submit Form Card */}
        <div
          className="card"
          style={{
            backgroundColor: '#ffffff',
            padding: '2rem',
            border: '1px solid var(--color-border)',
          }}
        >
          <form onSubmit={handleSubmit} noValidate>
            {/* Field: Location */}
            <div className="form-group">
              <label htmlFor="field-location" className="form-label">
                Location / Block / Building <span className="required" aria-hidden="true">*</span>
              </label>
              <input
                id="field-location"
                type="text"
                className="form-input"
                placeholder="e.g. Block 34, Block 33, Central Library, Food Court 1"
                value={formData.location}
                onChange={(e) => {
                  setFormData({ ...formData, location: e.target.value });
                  setSubmitError(null);
                  if (errors.location) setErrors({ ...errors, location: undefined });
                }}
                aria-required="true"
                aria-invalid={!!errors.location}
                aria-describedby={errors.location ? 'error-location' : 'hint-location'}
              />
              <span id="hint-location" className="form-hint">
                Enter the standard block number or building name (e.g., &ldquo;Block 34&rdquo;).
              </span>
              {errors.location && (
                <div id="error-location" className="form-error" role="alert">
                  <AlertCircle size={14} aria-hidden="true" />
                  <span>{errors.location}</span>
                </div>
              )}
            </div>

            {/* Field: Location Detail (optional) */}
            <div className="form-group">
              <label htmlFor="field-locationDetail" className="form-label">
                Specific Location Details <span style={{ fontWeight: 400, color: 'var(--color-text-subtle)' }}>(Optional)</span>
              </label>
              <input
                id="field-locationDetail"
                type="text"
                className="form-input"
                placeholder="e.g. Near ground floor east entrance, lift next to Room 204"
                value={formData.locationDetail}
                onChange={(e) => {
                  setFormData({ ...formData, locationDetail: e.target.value });
                  setSubmitError(null);
                }}
                aria-describedby="hint-locationDetail"
              />
              <span id="hint-locationDetail" className="form-hint">
                Specify floor, corridor, entrance, or nearby landmark if helpful.
              </span>
            </div>

            {/* Field: Category */}
            <div className="form-group">
              <label htmlFor="field-category" className="form-label">
                Issue Category <span className="required" aria-hidden="true">*</span>
              </label>
              <select
                id="field-category"
                className="form-select"
                value={formData.category}
                onChange={(e) => {
                  setFormData({ ...formData, category: e.target.value as IssueCategory });
                  setSubmitError(null);
                  if (errors.category) setErrors({ ...errors, category: undefined });
                }}
                aria-required="true"
                aria-invalid={!!errors.category}
                aria-describedby={errors.category ? 'error-category' : 'hint-category'}
              >
                <option value="">-- Select issue category --</option>
                {ISSUE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <span id="hint-category" className="form-hint">
                Select the physical or navigational barrier observed.
              </span>
              {errors.category && (
                <div id="error-category" className="form-error" role="alert">
                  <AlertCircle size={14} aria-hidden="true" />
                  <span>{errors.category}</span>
                </div>
              )}
            </div>

            {/* Field: Short Title */}
            <div className="form-group">
              <label htmlFor="field-title" className="form-label">
                Short Summary Title <span className="required" aria-hidden="true">*</span>
              </label>
              <input
                id="field-title"
                type="text"
                className="form-input"
                placeholder="e.g. Lift does not serve upper floor, Ramp blocked by construction materials"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  setSubmitError(null);
                  if (errors.title) setErrors({ ...errors, title: undefined });
                }}
                maxLength={120}
                aria-required="true"
                aria-invalid={!!errors.title}
                aria-describedby={errors.title ? 'error-title' : 'hint-title'}
              />
              <span id="hint-title" className="form-hint">
                A concise one-line summary ({formData.title.length}/120 characters).
              </span>
              {errors.title && (
                <div id="error-title" className="form-error" role="alert">
                  <AlertCircle size={14} aria-hidden="true" />
                  <span>{errors.title}</span>
                </div>
              )}
            </div>

            {/* Field: Description */}
            <div className="form-group">
              <label htmlFor="field-description" className="form-label">
                Detailed Description <span className="required" aria-hidden="true">*</span>
              </label>
              <textarea
                id="field-description"
                className="form-textarea"
                rows={4}
                placeholder="Describe what you experienced or observed. Explain whether a wheelchair, crutches, or walker can pass, what alternative access was found, or if signage was missing."
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  setSubmitError(null);
                  if (errors.description) setErrors({ ...errors, description: undefined });
                }}
                maxLength={1000}
                aria-required="true"
                aria-invalid={!!errors.description}
                aria-describedby={errors.description ? 'error-description' : 'hint-description'}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.8125rem',
                  color: 'var(--color-text-subtle)',
                }}
              >
                <span id="hint-description">
                  Minimum 15 characters. Factual and objective description.
                </span>
                <span>{formData.description.length}/1000</span>
              </div>
              {errors.description && (
                <div id="error-description" className="form-error" role="alert">
                  <AlertCircle size={14} aria-hidden="true" />
                  <span>{errors.description}</span>
                </div>
              )}
            </div>

            {/* Field: Optional Photo Upload */}
            <PhotoUploadField
              photoDataUrl={formData.photoDataUrl}
              onPhotoChange={(url) => {
                setFormData((prev) => ({ ...prev, photoDataUrl: url }));
                setSubmitError(null);
              }}
              photoError={photoError}
              onErrorChange={(err) => setPhotoError(err)}
              inputRef={fileInputRef}
            />

            {/* Field: Reporter Context */}
            <div className="form-group">
              <label htmlFor="field-reporterContext" className="form-label">
                I am reporting this as… <span style={{ fontWeight: 400, color: 'var(--color-text-subtle)' }}>(Context only, not proof)</span>
              </label>
              <select
                id="field-reporterContext"
                className="form-select"
                value={formData.reporterContext}
                onChange={(e) => {
                  setFormData({ ...formData, reporterContext: e.target.value as ReporterContext });
                  setSubmitError(null);
                }}
                aria-describedby="hint-reporterContext"
              >
                <option value="">-- Select perspective (Optional) --</option>
                {REPORTER_CONTEXTS.map((ctx) => (
                  <option key={ctx} value={ctx}>
                    {ctx}
                  </option>
                ))}
              </select>
              <span id="hint-reporterContext" className="form-hint">
                Helps readers understand if you directly experienced this or were told about it.
              </span>
            </div>

            {/* Checkbox: Privacy & Conduct Agreement */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                margin: '1.5rem 0',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.625rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  lineHeight: 1.45,
                  color: 'var(--color-text-main)',
                }}
              >
                <input
                  id="field-confirmedGuidelines"
                  type="checkbox"
                  checked={formData.confirmedGuidelines}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmedGuidelines: e.target.checked });
                    setSubmitError(null);
                    if (errors.confirmedGuidelines) {
                      setErrors({ ...errors, confirmedGuidelines: undefined });
                    }
                  }}
                  style={{
                    marginTop: '0.15rem',
                    width: '18px',
                    height: '18px',
                    accentColor: 'var(--color-accent)',
                  }}
                  aria-invalid={!!errors.confirmedGuidelines}
                  aria-describedby={errors.confirmedGuidelines ? 'error-confirmedGuidelines' : undefined}
                />
                <span>
                  <strong>Privacy &amp; Safety Confirmation:</strong> I understand this is a user-submitted report and should <strong>not</strong> include personal names, student registration numbers, passwords, medical diagnoses, or sensitive personal information.
                </span>
              </label>

              {errors.confirmedGuidelines && (
                <div
                  id="error-confirmedGuidelines"
                  className="form-error"
                  role="alert"
                  style={{ marginTop: '0.5rem', paddingLeft: '1.75rem' }}
                >
                  <AlertCircle size={14} aria-hidden="true" />
                  <span>{errors.confirmedGuidelines}</span>
                </div>
              )}
            </div>

            {/* Submit Action */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => navigate('#/')}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-accent"
                style={{ padding: '0.75rem 1.75rem', fontSize: '1rem' }}
              >
                Submit Accessibility Report
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};
