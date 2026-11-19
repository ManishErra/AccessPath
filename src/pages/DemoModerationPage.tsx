import React, { useState, useEffect } from 'react';
import { useRouter } from '../router';
import { AccessibilityReport, ReportStatus, REPORT_STATUSES } from '../types';
import { updateReportStatus, resetToDemoData, resetSampleDataOnly } from '../services/storage';
import { StatusBadge } from '../components/StatusBadge';
import { SourceBadge } from '../components/SourceBadge';
import {
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Edit3,
  MapPin,
  History,
} from 'lucide-react';

interface DemoModerationPageProps {
  reports: AccessibilityReport[];
  onReportsChanged: () => void;
}

export const DemoModerationPage: React.FC<DemoModerationPageProps> = ({
  reports,
  onReportsChanged,
}) => {
  const { route, navigateToReport } = useRouter();

  // If URL has focus id e.g. #/moderation?id=demo-b34-lift-001
  const initialFocusId = route.name === 'moderation' ? route.focusId : undefined;

  const [selectedReportId, setSelectedReportId] = useState<string | null>(
    initialFocusId || (reports.length > 0 ? reports[0].id : null)
  );

  const [newStatus, setNewStatus] = useState<ReportStatus>('Active');
  const [statusNote, setStatusNote] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'All' | ReportStatus>('All');

  const selectedReport = reports.find((r) => r.id === selectedReportId) || null;

  const [isErrorFeedback, setIsErrorFeedback] = useState(false);

  useEffect(() => {
    if (selectedReport) {
      setNewStatus(selectedReport.status);
      setStatusNote('');
    }
  }, [selectedReportId, reports]);

  const handleStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    const result = updateReportStatus(selectedReport.id, newStatus, statusNote);
    if (!result.success) {
      setIsErrorFeedback(true);
      setFeedbackMessage(result.error || 'Failed to update status in browser storage.');
      return;
    }

    setIsErrorFeedback(false);
    setFeedbackMessage(`Demo status updated to "${newStatus}" for ${selectedReport.location} (local prototype only — not verified by LPU).`);
    setTimeout(() => setFeedbackMessage(null), 4500);
    setStatusNote('');
    onReportsChanged();
  };

  const handleResetSampleOnly = () => {
    const confirmed = window.confirm(
      'Reset only the demo sample records to default? Your locally submitted reports in "My Reports" will be preserved.'
    );
    if (confirmed) {
      const res = resetSampleDataOnly();
      if (!res.success) {
        setIsErrorFeedback(true);
        setFeedbackMessage(res.error || 'Failed to refresh sample demo records.');
        return;
      }
      onReportsChanged();
      setIsErrorFeedback(false);
      setFeedbackMessage('Demo sample records refreshed. Your local reports were preserved.');
      setTimeout(() => setFeedbackMessage(null), 3500);
    }
  };

  const handleResetAllData = () => {
    const confirmed = window.confirm(
      'Full Reset: Reset all reports in local storage back to default demo seeds? All locally submitted reports will be removed.'
    );
    if (confirmed) {
      const res = resetToDemoData();
      if (!res.success) {
        setIsErrorFeedback(true);
        setFeedbackMessage(res.error || 'Failed to perform factory reset.');
        return;
      }
      onReportsChanged();
      setIsErrorFeedback(false);
      setFeedbackMessage('Storage completely restored to default demo seed data.');
      setTimeout(() => setFeedbackMessage(null), 3500);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (statusFilter !== 'All' && r.status !== statusFilter) return false;
    return true;
  });

  return (
    <main id="main-content" tabIndex={-1} style={{ padding: '2rem 0 4rem 0' }}>
      <div className="container">
        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <ShieldCheck size={26} color="#7c3aed" />
              <h1 style={{ fontSize: '1.875rem', color: 'var(--color-primary)' }}>
                Demo Moderation &bull; Local Only
              </h1>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
              Interactive simulation of campus issue triage, verification notes, and lifecycle tracking.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleResetSampleOnly}
              className="btn btn-secondary btn-sm"
              style={{ gap: '0.35rem' }}
              title="Reset sample records to default while preserving your submitted reports"
            >
              <RotateCcw size={14} />
              <span>Refresh Sample Data (Keep My Reports)</span>
            </button>

            <button
              onClick={handleResetAllData}
              className="btn btn-secondary btn-sm"
              style={{ gap: '0.35rem', color: '#b91c1c' }}
              title="Factory reset: clears all local reports and resets sample data"
            >
              <RotateCcw size={14} />
              <span>Full Factory Reset</span>
            </button>
          </div>
        </div>

        {/* Clear Notice Banner */}
        <div
          role="note"
          aria-label="Demo moderation advisory"
          style={{
            backgroundColor: '#faf5ff',
            border: '1px solid #e9d5ff',
            borderLeft: '4px solid #7c3aed',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          <AlertCircle size={20} color="#7c3aed" style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
          <div style={{ fontSize: '0.875rem', color: '#581c87', lineHeight: 1.5 }}>
            <strong>Demo Simulation Mode:</strong> This moderation tool operates <em>strictly in your local browser</em>. It demonstrates how a future university disability office or maintenance team could review tickets, assign investigation statuses, and log resolution notes. It is <strong>not</strong> connected to actual university staff.
          </div>
        </div>

        {feedbackMessage && (
          <div
            role="status"
            style={{
              padding: '0.75rem 1.25rem',
              backgroundColor: isErrorFeedback ? '#fef2f2' : '#d1fae5',
              border: `1px solid ${isErrorFeedback ? '#fecaca' : '#a7f3d0'}`,
              color: isErrorFeedback ? '#991b1b' : '#065f46',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 600,
            }}
          >
            {isErrorFeedback ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Two-Column Moderation Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
            alignItems: 'start',
          }}
        >
          {/* Column 1: Report Selection Queue */}
          <section aria-labelledby="queue-heading" className="card" style={{ padding: '1.25rem', backgroundColor: '#ffffff' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
              }}
            >
              <h2 id="queue-heading" style={{ fontSize: '1.125rem', color: 'var(--color-primary)' }}>
                Report Queue ({filteredReports.length})
              </h2>

              <select
                className="form-select"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', width: 'auto' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'All' | ReportStatus)}
                aria-label="Filter queue by status"
              >
                <option value="All">All statuses</option>
                {REPORT_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', maxHeight: '620px', overflowY: 'auto' }}>
              {filteredReports.map((r) => {
                const isSelected = r.id === selectedReportId;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedReportId(r.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedReportId(r.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    style={{
                      padding: '0.875rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                      backgroundColor: isSelected ? '#f0fdfa' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-primary)' }}>
                        {r.location}
                      </span>
                      <StatusBadge status={r.status} />
                    </div>

                    <p
                      style={{
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        color: 'var(--color-text-main)',
                        marginBottom: '0.25rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {r.title}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-subtle)' }}>
                      <span>{r.category}</span>
                      <SourceBadge isSample={r.isSample} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Column 2: Status Editing & Audit Trail */}
          <section aria-labelledby="editor-heading" className="card" style={{ padding: '1.75rem', backgroundColor: '#ffffff' }}>
            {selectedReport ? (
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    borderBottom: '1px solid var(--color-border)',
                    paddingBottom: '1rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase' }}>
                      Report ID: {selectedReport.id}
                    </span>
                    <h2 id="editor-heading" style={{ fontSize: '1.25rem', marginTop: '0.25rem', color: 'var(--color-primary)' }}>
                      {selectedReport.title}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                      <MapPin size={14} color="var(--color-accent)" />
                      <span>{selectedReport.location}</span>
                      {selectedReport.locationDetail && <span>({selectedReport.locationDetail})</span>}
                    </div>
                  </div>

                  <button
                    onClick={() => navigateToReport(selectedReport.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    View Public Card
                  </button>
                </div>

                {/* Original report summary */}
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-subtle)', marginBottom: '0.25rem' }}>
                    ORIGINAL USER DESCRIPTION (Retained intact)
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-main)', lineHeight: 1.5 }}>
                    {selectedReport.description}
                  </p>
                </div>

                {/* Status Change Form */}
                <form onSubmit={handleStatusUpdate}>
                  <div className="form-group">
                    <label htmlFor="mod-status-select" className="form-label">
                      Update Triage / Resolution Status
                    </label>
                    <select
                      id="mod-status-select"
                      className="form-select"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as ReportStatus)}
                    >
                      {REPORT_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                    <span className="form-hint">
                      Changing status records a new audit event without erasing prior history.
                    </span>
                  </div>

                  <div className="form-group">
                    <label htmlFor="mod-status-note" className="form-label">
                      Internal Moderation / Resolution Note <span style={{ fontWeight: 400, color: 'var(--color-text-subtle)' }}>(Optional)</span>
                    </label>
                    <textarea
                      id="mod-status-note"
                      className="form-textarea"
                      rows={3}
                      placeholder="e.g., Facility team inspected lift; sensor calibration scheduled for 18 Nov. Or: Ramp ramp-up signage confirmed restored."
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ gap: '0.35rem', width: '100%', marginBottom: '1.5rem' }}>
                    <Edit3 size={15} />
                    <span>Save Status &amp; Add History Event</span>
                  </button>
                </form>

                {/* History Timeline */}
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                    <History size={16} color="var(--color-accent)" />
                    <h3 style={{ fontSize: '0.9375rem', color: 'var(--color-primary)' }}>
                      Audit History Log ({selectedReport.statusHistory?.length || 0})
                    </h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedReport.statusHistory && selectedReport.statusHistory.length > 0 ? (
                      selectedReport.statusHistory.map((h, i) => (
                        <div
                          key={i}
                          style={{
                            padding: '0.625rem 0.875rem',
                            backgroundColor: '#f8fafc',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--color-border)',
                            fontSize: '0.8125rem',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                            <StatusBadge status={h.status} />
                            <span style={{ color: 'var(--color-text-subtle)', fontSize: '0.75rem' }}>
                              {new Date(h.at).toLocaleString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          {h.note && (
                            <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                              &ldquo;{h.note}&rdquo;
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-subtle)' }}>
                        No history entries found.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-subtle)' }}>
                Select a report from the queue to moderate its status.
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};
