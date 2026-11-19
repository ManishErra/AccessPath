import React, { useState } from 'react';
import { useRouter } from '../router';
import { AccessibilityReport } from '../types';
import { getReportByIdWithStatus } from '../services/storage';
import { StatusBadge } from '../components/StatusBadge';
import { SourceBadge } from '../components/SourceBadge';
import {
  MapPin,
  Calendar,
  Tag,
  Clock,
  ShieldAlert,
  ArrowLeft,
  PlusCircle,
  ShieldCheck,
  History,
  Info,
  Maximize2,
  X,
  AlertTriangle,
} from 'lucide-react';

interface ReportDetailPageProps {
  reportId: string;
  reports: AccessibilityReport[];
  storageStatus?: 'ok' | 'storage_unavailable' | 'storage_read_error';
  storageError?: string;
}

export const ReportDetailPage: React.FC<ReportDetailPageProps> = ({
  reportId,
  reports,
  storageStatus,
  storageError,
}) => {
  const { navigate, navigateToSearch, navigateToSubmit } = useRouter();
  const [photoModalOpen, setPhotoModalOpen] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && photoModalOpen) {
        setPhotoModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [photoModalOpen]);

  // Determine storage status and report
  const detailResult = getReportByIdWithStatus(reportId);
  const isStorageError =
    (storageStatus && storageStatus !== 'ok') ||
    (!detailResult.success && detailResult.status !== 'not_found');
  const errorMsg =
    storageError ||
    detailResult.error ||
    'Unable to access browser storage. Stored data may be unreadable or access is blocked.';

  // Storage read error state: do not silently display fallback sample data
  if (isStorageError) {
    return (
      <main id="main-content" className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem 2rem', maxWidth: '580px', margin: '0 auto' }}>
          <AlertTriangle size={48} color="#dc2626" style={{ margin: '0 auto 1rem auto' }} aria-hidden="true" />
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#991b1b' }}>Storage Read Error</h1>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            {errorMsg}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button onClick={() => navigateToSearch()} className="btn btn-secondary">
              Back to Search
            </button>
            <button onClick={() => navigate('#/')} className="btn btn-primary">
              Home
            </button>
          </div>
        </div>
      </main>
    );
  }

  const report =
    reports.find((r) => r.id === reportId) ||
    (detailResult.success ? detailResult.report : undefined);

  if (!report) {
    return (
      <main id="main-content" className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem 2rem', maxWidth: '580px', margin: '0 auto' }}>
          <ShieldAlert size={48} color="#b45309" style={{ margin: '0 auto 1rem auto' }} aria-hidden="true" />
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Report Not Found</h1>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
            The requested report ID ({reportId}) could not be located in your local prototype storage.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button onClick={() => navigateToSearch()} className="btn btn-secondary">
              Back to Search
            </button>
            <button onClick={() => navigate('#/')} className="btn btn-primary">
              Home
            </button>
          </div>
        </div>
      </main>
    );
  }

  const formattedDateTime = new Date(report.reportedAt).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <main id="main-content" tabIndex={-1} style={{ padding: '2rem 0 4rem 0' }}>
      <div className="container" style={{ maxWidth: '860px' }}>
        {/* Navigation Breadcrumb / Back button */}
        <div style={{ marginBottom: '1.25rem' }}>
          <button
            onClick={() => window.history.length > 1 ? window.history.back() : navigateToSearch()}
            className="btn btn-secondary btn-sm"
            style={{ gap: '0.35rem' }}
          >
            <ArrowLeft size={14} />
            <span>Back to previous list</span>
          </button>
        </div>

        {/* Unverified Notice Banner */}
        <div
          role="note"
          aria-label="Unverified advisory note"
          style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderLeft: '4px solid #d97706',
            borderRadius: 'var(--radius-md)',
            padding: '0.875rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          <Info size={20} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
          <div style={{ fontSize: '0.875rem', color: '#92400e', lineHeight: 1.5 }}>
            <strong>Advisory Notice:</strong> This report is user-submitted and is <em>not independently verified</em> by university administration or facility maintenance. Conditions may change quickly or vary by floor.
          </div>
        </div>

        {/* Main Report Card */}
        <article
          className="card"
          style={{
            padding: '2rem',
            backgroundColor: '#ffffff',
            marginBottom: '2rem',
          }}
        >
          {/* Header Meta */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem',
              borderBottom: '1px solid var(--color-border)',
              paddingBottom: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <StatusBadge status={report.status} />
              <SourceBadge isSample={report.isSample} />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8125rem',
                color: 'var(--color-text-subtle)',
              }}
            >
              <Calendar size={14} aria-hidden="true" />
              <span>Reported: {formattedDateTime}</span>
            </div>
          </div>

          {/* Location Header */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--color-primary)',
              }}
            >
              <MapPin size={22} color="var(--color-accent)" aria-hidden="true" />
              <span>{report.location}</span>
            </div>

            {report.locationDetail && (
              <p
                style={{
                  fontSize: '0.9375rem',
                  color: 'var(--color-text-muted)',
                  marginTop: '0.25rem',
                  fontStyle: 'italic',
                }}
              >
                Specific area: {report.locationDetail}
              </p>
            )}

            {report.locationAliases && report.locationAliases.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  marginTop: '0.5rem',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', fontWeight: 600 }}>
                  Recognized aliases:
                </span>
                {report.locationAliases.map((alias) => (
                  <span
                    key={alias}
                    style={{
                      fontSize: '0.75rem',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    {alias}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: '1.625rem',
              fontWeight: 700,
              color: 'var(--color-text-main)',
              marginBottom: '1rem',
              lineHeight: 1.3,
            }}
          >
            {report.title}
          </h1>

          {/* Category & Reporter Context Badges */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                backgroundColor: '#f1f5f9',
                borderRadius: '6px',
                color: '#334155',
                fontWeight: 600,
              }}
            >
              <Tag size={14} color="#0f766e" aria-hidden="true" />
              <span>Category: {report.category}</span>
            </div>

            {report.reporterContext && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.75rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  color: 'var(--color-text-muted)',
                  fontSize: '0.8125rem',
                }}
              >
                <span>Report context: <strong>{report.reporterContext}</strong> (Context only, not verified proof)</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>
              Report Details &amp; Observations
            </h2>
            <div
              style={{
                fontSize: '1rem',
                lineHeight: 1.65,
                color: 'var(--color-text-main)',
                backgroundColor: '#f8fafc',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                whiteSpace: 'pre-wrap',
              }}
            >
              {report.description}
            </div>
          </div>

          {/* Attached Photo Preview if available */}
          {report.photoDataUrl && (
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>
                Attached Photograph
              </h2>
              <div
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: '1px solid var(--color-border)',
                  maxWidth: '100%',
                }}
              >
                <img
                  src={report.photoDataUrl}
                  alt={`User submitted accessibility photograph for ${report.title}`}
                  style={{
                    maxHeight: '360px',
                    width: 'auto',
                    maxWidth: '100%',
                    display: 'block',
                    objectFit: 'cover',
                    cursor: 'pointer',
                  }}
                  onClick={() => setPhotoModalOpen(true)}
                />
                <button
                  type="button"
                  onClick={() => setPhotoModalOpen(true)}
                  className="btn btn-secondary btn-sm"
                  style={{
                    position: 'absolute',
                    bottom: '0.5rem',
                    right: '0.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.92)',
                    gap: '0.25rem',
                  }}
                  aria-label="Enlarge attached photo"
                >
                  <Maximize2 size={13} />
                  <span>Enlarge</span>
                </button>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', marginTop: '0.35rem' }}>
                Note: Photographs must not contain personally identifiable faces or private documents.
              </p>
            </div>
          )}

          {/* Status History Timeline */}
          <div
            style={{
              borderTop: '1px solid var(--color-border)',
              paddingTop: '1.5rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
              <History size={18} color="var(--color-accent)" />
              <h2 style={{ fontSize: '1.125rem', color: 'var(--color-primary)' }}>
                Status History in Prototype
              </h2>
            </div>

            {report.statusHistory && report.statusHistory.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {report.statusHistory.map((event, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      backgroundColor: '#f8fafc',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <div style={{ marginTop: '0.125rem' }}>
                      <Clock size={16} color="var(--color-text-subtle)" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '0.25rem',
                        }}
                      >
                        <StatusBadge status={event.status} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)' }}>
                          {new Date(event.at).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      {event.note && (
                        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                          Note: {event.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-subtle)' }}>
                No prior status transitions recorded.
              </p>
            )}
          </div>

          {/* Action Row */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid var(--color-border)',
              paddingTop: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigateToSubmit({ location: report.location, category: report.category })}
                className="btn btn-accent btn-sm"
                style={{ gap: '0.35rem' }}
              >
                <PlusCircle size={15} />
                <span>Report similar issue for {report.location}</span>
              </button>

              <button
                onClick={() => navigate(`#/moderation?id=${encodeURIComponent(report.id)}`)}
                className="btn btn-secondary btn-sm"
                style={{ gap: '0.35rem' }}
                title="Open this report in Demo Moderation mode to change its status"
              >
                <ShieldCheck size={15} color="#6b21a8" />
                <span>Demo Moderation</span>
              </button>
            </div>

            <button
              onClick={() => navigateToSearch()}
              className="btn btn-secondary btn-sm"
            >
              Back to search results
            </button>
          </div>
        </article>
      </div>

      {/* Photo Enlarge Modal */}
      {photoModalOpen && report.photoDataUrl && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged photograph view"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem',
          }}
          onClick={() => setPhotoModalOpen(false)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '900px',
              maxHeight: '90vh',
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              padding: '1rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem',
              }}
            >
              <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                Attached Photograph &bull; {report.location}
              </span>
              <button
                onClick={() => setPhotoModalOpen(false)}
                className="btn btn-secondary btn-sm"
                aria-label="Close photo preview"
                style={{ padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <img
              src={report.photoDataUrl}
              alt={report.title}
              style={{
                width: '100%',
                maxHeight: '75vh',
                objectFit: 'contain',
                borderRadius: 'var(--radius-md)',
              }}
            />
          </div>
        </div>
      )}
    </main>
  );
};

