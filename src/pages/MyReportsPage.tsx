import React, { useState } from 'react';
import { useRouter } from '../router';
import { AccessibilityReport } from '../types';
import { getMyReportsWithStatus, deleteLocalReport } from '../services/storage';
import { StatusBadge } from '../components/StatusBadge';
import {
  Bookmark,
  PlusCircle,
  Trash2,
  ExternalLink,
  MapPin,
  Calendar,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface MyReportsPageProps {
  onReportsChanged: () => void;
}

export const MyReportsPage: React.FC<MyReportsPageProps> = ({ onReportsChanged }) => {
  const { navigateToReport, navigateToSubmit } = useRouter();
  const initialData = getMyReportsWithStatus();
  const [reports, setReports] = useState<AccessibilityReport[]>(initialData.reports);
  const [storageStatus, setStorageStatus] = useState<'ok' | 'storage_unavailable' | 'storage_read_error'>(initialData.status);
  const [storageError, setStorageError] = useState<string | null>(
    initialData.status !== 'ok' ? initialData.error || 'Unable to access browser storage.' : null
  );
  const [deleteCandidate, setDeleteCandidate] = useState<AccessibilityReport | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  React.useEffect(() => {
    const current = getMyReportsWithStatus();
    setReports(current.reports);
    setStorageStatus(current.status);
    setStorageError(current.status !== 'ok' ? current.error || 'Unable to access browser storage.' : null);
  }, []);

  const handleDeleteConfirm = () => {
    if (!deleteCandidate) return;
    setDeleteError(null);

    const result = deleteLocalReport(deleteCandidate.id);
    if (!result.success) {
      setDeleteError(result.error || 'Failed to remove report from browser storage.');
      setDeleteCandidate(null);
      return;
    }

    const refreshed = getMyReportsWithStatus();
    setReports(refreshed.reports);
    setStorageStatus(refreshed.status);
    setStorageError(refreshed.status !== 'ok' ? refreshed.error || 'Unable to access browser storage.' : null);
    setDeleteCandidate(null);
    onReportsChanged();
  };

  return (
    <main id="main-content" tabIndex={-1} style={{ padding: '2rem 0 4rem 0' }}>
      <div className="container" style={{ maxWidth: '860px' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Bookmark size={24} color="var(--color-accent)" />
            <h1 style={{ fontSize: '1.875rem', color: 'var(--color-primary)' }}>
              My Submitted Reports
            </h1>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
            Accessibility barriers reported from this browser and device session.
          </p>
        </div>

        {/* Explicit Prototype Limitation Notice */}
        <div
          role="note"
          aria-label="Local device limitation notice"
          style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderLeft: '4px solid #2563eb',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          <Info size={20} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
          <div style={{ fontSize: '0.875rem', color: '#1e40af', lineHeight: 1.5 }}>
            <strong>Local Storage Prototype Limitation:</strong> These reports exist solely in this browser&apos;s localStorage cache. They are <em>not</em> synchronized to a cloud server and are <em>not</em> received or monitored by actual university administrators or maintenance teams.
          </div>
        </div>

        {storageError && (
          <div
            role="alert"
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
            }}
          >
            <AlertTriangle size={16} />
            <span>{storageError}</span>
          </div>
        )}

        {deleteError && (
          <div
            role="alert"
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
            }}
          >
            <AlertTriangle size={16} />
            <span>{deleteError}</span>
          </div>
        )}

        {/* Reports List */}
        {reports.length > 0 ? (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
              }}
            >
              <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                {reports.length} {reports.length === 1 ? 'report' : 'reports'} submitted locally
              </span>

              <button
                onClick={() => navigateToSubmit()}
                className="btn btn-accent btn-sm"
                style={{ gap: '0.35rem' }}
              >
                <PlusCircle size={14} />
                <span>Submit another report</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="card"
                  style={{
                    padding: '1.25rem 1.5rem',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          fontWeight: 700,
                          fontSize: '1.05rem',
                          color: 'var(--color-primary)',
                        }}
                      >
                        <MapPin size={16} color="var(--color-accent)" />
                        <span>{report.location}</span>
                        {report.locationDetail && (
                          <span style={{ fontWeight: 400, fontSize: '0.8125rem', color: 'var(--color-text-subtle)' }}>
                            &bull; {report.locationDetail}
                          </span>
                        )}
                      </div>

                      <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginTop: '0.25rem' }}>
                        {report.title}
                      </h2>
                    </div>

                    <StatusBadge status={report.status} />
                  </div>

                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--color-text-muted)',
                      lineHeight: 1.5,
                    }}
                  >
                    {report.description}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.5rem',
                      borderTop: '1px solid var(--color-border)',
                      paddingTop: '0.75rem',
                      fontSize: '0.8125rem',
                      color: 'var(--color-text-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar size={13} />
                        <span>
                          {new Date(report.reportedAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </span>
                      <span>Category: {report.category}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => navigateToReport(report.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ gap: '0.25rem' }}
                      >
                        <span>View Details</span>
                        <ExternalLink size={13} />
                      </button>

                      <button
                        onClick={() => setDeleteCandidate(report)}
                        className="btn btn-danger btn-sm"
                        style={{ gap: '0.25rem' }}
                        aria-label={`Delete report: ${report.title}`}
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Empty state */
          <div
            className="card"
            style={{
              padding: '3.5rem 2rem',
              textAlign: 'center',
              backgroundColor: '#ffffff',
            }}
          >
            {storageStatus !== 'ok' ? (
              <>
                <AlertTriangle size={42} color="#dc2626" style={{ margin: '0 auto 1rem auto' }} />
                <h2 style={{ fontSize: '1.25rem', color: '#991b1b', marginBottom: '0.5rem' }}>
                  {storageStatus === 'storage_unavailable'
                    ? 'Browser Storage Unavailable'
                    : 'Storage Read Error'}
                </h2>
                <p
                  style={{
                    color: 'var(--color-text-muted)',
                    maxWidth: '480px',
                    margin: '0 auto 1.5rem auto',
                    fontSize: '0.9375rem',
                    lineHeight: 1.5,
                  }}
                >
                  {storageError || 'Could not access browser localStorage to read saved reports. Please check your browser storage settings.'}
                </p>
              </>
            ) : (
              <>
                <Bookmark size={42} color="var(--color-text-subtle)" style={{ margin: '0 auto 1rem auto' }} />
                <h2 style={{ fontSize: '1.25rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                  No Reports Submitted Yet
                </h2>
                <p
                  style={{
                    color: 'var(--color-text-muted)',
                    maxWidth: '480px',
                    margin: '0 auto 1.5rem auto',
                    fontSize: '0.9375rem',
                    lineHeight: 1.5,
                  }}
                >
                  You haven&apos;t created any accessibility reports in this browser session. When you submit an issue, it will be listed here.
                </p>
                <button
                  onClick={() => navigateToSubmit()}
                  className="btn btn-accent"
                  style={{ gap: '0.35rem' }}
                >
                  <PlusCircle size={16} />
                  <span>Submit your first report</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setDeleteCandidate(null)}
        >
          <div
            style={{
              maxWidth: '480px',
              width: '100%',
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-lg)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b91c1c', marginBottom: '0.75rem' }}>
              <AlertTriangle size={22} />
              <h2 id="delete-dialog-title" style={{ fontSize: '1.25rem', color: 'var(--color-primary)' }}>
                Confirm Deletion
              </h2>
            </div>

            <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Are you sure you want to delete the report &ldquo;<strong>{deleteCandidate.title}</strong>&rdquo; for <strong>{deleteCandidate.location}</strong>? This action will permanently remove it from this device&apos;s local storage.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="btn btn-danger"
              >
                Yes, Delete Report
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

