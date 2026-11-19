import React, { useState } from 'react';
import { useRouter } from '../router';
import { resetToDemoData, resetSampleDataOnly } from '../services/storage';
import { Compass, RotateCcw, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';

export const Footer: React.FC<{ onDataReset?: () => void }> = ({ onDataReset }) => {
  const { navigate, navigateToSearch, navigateToSubmit } = useRouter();
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetErrorMessage, setResetErrorMessage] = useState<string | null>(null);

  const handleResetSampleOnly = () => {
    setResetErrorMessage(null);
    const confirmed = window.confirm(
      'Refresh sample demo records? Your locally submitted reports in "My Reports" will NOT be deleted.'
    );
    if (confirmed) {
      const result = resetSampleDataOnly();
      if (result.success) {
        setResetMessage('Sample demo records refreshed (your local reports preserved).');
        setTimeout(() => setResetMessage(null), 4000);
        if (onDataReset) {
          onDataReset();
        } else {
          window.location.reload();
        }
      } else {
        setResetErrorMessage(result.error || 'Failed to refresh sample demo records.');
        setTimeout(() => setResetErrorMessage(null), 6000);
      }
    }
  };

  const handleResetAll = () => {
    setResetErrorMessage(null);
    const confirmed = window.confirm(
      'WARNING - Full Factory Reset: This will permanently delete ALL your locally submitted reports and restore default demo seed data. This action cannot be undone.\n\nDo you want to proceed with full reset?'
    );
    if (confirmed) {
      const result = resetToDemoData();
      if (result.success) {
        setResetMessage('All demo seed data restored successfully.');
        setTimeout(() => setResetMessage(null), 4000);
        if (onDataReset) {
          onDataReset();
        } else {
          window.location.reload();
        }
      } else {
        setResetErrorMessage(result.error || 'Failed to perform factory reset.');
        setTimeout(() => setResetErrorMessage(null), 6000);
      }
    }
  };

  return (
    <footer
      style={{
        marginTop: 'auto',
        backgroundColor: '#0f172a',
        color: '#94a3b8',
        borderTop: '1px solid #1e293b',
        padding: '3rem 0 2rem 0',
        fontSize: '0.875rem',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '2.5rem',
            marginBottom: '2.5rem',
          }}
        >
          {/* Col 1: About Prototype */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', marginBottom: '0.75rem' }}>
              <Compass size={22} color="#14b8a6" aria-hidden="true" />
              <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                Access<span style={{ color: '#14b8a6' }}>Path</span>
              </span>
            </div>
            <p style={{ color: '#94a3b8', lineHeight: 1.6, marginBottom: '1rem', fontSize: '0.8125rem' }}>
              An independent student coursework prototype for campus accessibility awareness and issue tracking.
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              <AlertTriangle size={13} />
              <span>Not an official LPU service</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.9375rem', fontWeight: 700, marginBottom: '0.875rem' }}>
              Prototype Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>
                <button
                  onClick={() => navigate('#/')}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
                >
                  Home / Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToSearch()}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
                >
                  Search Reports
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToSubmit()}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
                >
                  Submit an Issue
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('#/my-reports')}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
                >
                  My Local Reports
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('#/moderation')}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
                >
                  Demo Moderation (Local)
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('#/about')}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
                >
                  About &amp; Research Context
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Prototype Controls & Ethics */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.9375rem', fontWeight: 700, marginBottom: '0.875rem' }}>
              Demo Tools &amp; Data
            </h4>
            <p style={{ color: '#94a3b8', fontSize: '0.8125rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              All reports are stored locally in your browser storage. Fictional sample records are explicitly flagged.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }}>
              <button
                onClick={handleResetSampleOnly}
                className="btn btn-secondary btn-sm"
                style={{
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                  borderColor: '#334155',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
                title="Refresh sample records to default while preserving your submitted reports"
              >
                <RefreshCw size={13} />
                <span>Refresh Samples (Keep My Reports)</span>
              </button>

              <button
                onClick={handleResetAll}
                className="btn btn-secondary btn-sm"
                style={{
                  backgroundColor: '#1e293b',
                  color: '#f87171',
                  borderColor: '#451a1a',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.75rem',
                }}
                title="Factory reset: clears all local reports and resets demo seeds"
              >
                <RotateCcw size={13} />
                <span>Full Factory Reset</span>
              </button>
            </div>

            {resetMessage && (
              <p
                style={{ color: '#34d399', fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 500 }}
                role="status"
              >
                {resetMessage}
              </p>
            )}

            {resetErrorMessage && (
              <p
                style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 500 }}
                role="alert"
              >
                {resetErrorMessage}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Legal / Disclaimer Banner */}
        <div
          style={{
            borderTop: '1px solid #1e293b',
            paddingTop: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '0.75rem',
            color: '#64748b',
          }}
        >
          <div>
            <p style={{ color: '#94a3b8' }}>
              &copy; {new Date().getFullYear()} AccessPath Prototype &bull; INT335-12 Student Coursework Project.
            </p>
            <p style={{ marginTop: '0.25rem' }}>
              Notice: Reports are community-observed and not verified by university administration. An empty search result does not guarantee barrier-free accessibility.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={14} color="#14b8a6" />
            <span>Zero personal student identifiers collected</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

