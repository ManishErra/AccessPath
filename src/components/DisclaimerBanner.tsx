import React from 'react';
import { Info } from 'lucide-react';

interface DisclaimerBannerProps {
  compact?: boolean;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ compact = false }) => {
  return (
    <div
      role="note"
      aria-label="Campus accessibility disclaimer"
      className={`callout callout-disclaimer ${compact ? 'callout-compact' : ''}`}
      style={{
        borderLeft: '4px solid #0f766e',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: compact ? '0.625rem 1rem' : '0.875rem 1.25rem',
        backgroundColor: '#f8fafc',
        borderRadius: '0.5rem',
        border: '1px solid #cbd5e1',
        borderLeftWidth: '4px',
        margin: '1rem 0',
      }}
    >
      <Info
        size={compact ? 18 : 20}
        color="#0f766e"
        style={{ flexShrink: 0, marginTop: '2px' }}
        aria-hidden="true"
      />
      <div style={{ fontSize: compact ? '0.8125rem' : '0.875rem', lineHeight: '1.45', color: '#334155' }}>
        <strong>Accessibility Advisory:</strong> Reports are user-submitted and may not reflect current conditions. <em>No report does not mean a route or building is accessible.</em>
      </div>
    </div>
  );
};

