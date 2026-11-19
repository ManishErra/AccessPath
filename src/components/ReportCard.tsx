import React from 'react';
import { AccessibilityReport } from '../types';
import { StatusBadge } from './StatusBadge';
import { SourceBadge } from './SourceBadge';
import { MapPin, Calendar, Tag, Image, ArrowRight } from 'lucide-react';

interface ReportCardProps {
  report: AccessibilityReport;
  onSelect: (id: string) => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report, onSelect }) => {
  const formattedDate = new Date(report.reportedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <article
      className="card report-card"
      style={{
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        position: 'relative',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
      onClick={() => onSelect(report.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(report.id);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View report: ${report.title} at ${report.location}`}
    >
      <div>
        {/* Top meta bar: Location & Badges */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.75rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontWeight: 700,
              fontSize: '1rem',
              color: 'var(--color-primary)',
            }}
          >
            <MapPin size={16} color="var(--color-accent)" aria-hidden="true" />
            <span>{report.location}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <StatusBadge status={report.status} />
            <SourceBadge isSample={report.isSample} />
          </div>
        </div>

        {/* Location Detail if present */}
        {report.locationDetail && (
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--color-text-subtle)',
              marginBottom: '0.5rem',
              fontStyle: 'italic',
            }}
          >
            {report.locationDetail}
          </p>
        )}

        {/* Title */}
        <h3
          style={{
            fontSize: '1.125rem',
            fontWeight: 600,
            color: 'var(--color-text-main)',
            marginBottom: '0.5rem',
            lineHeight: 1.3,
          }}
        >
          {report.title}
        </h3>

        {/* Description snippet */}
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--color-text-muted)',
            lineHeight: 1.5,
            marginBottom: '1rem',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {report.description}
        </p>
      </div>

      {/* Footer metadata & Action */}
      <div
        style={{
          borderTop: '1px solid var(--color-border)',
          paddingTop: '0.75rem',
          marginTop: 'auto',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          fontSize: '0.8125rem',
          color: 'var(--color-text-subtle)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Tag size={13} aria-hidden="true" />
            <span>{report.category}</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Calendar size={13} aria-hidden="true" />
            <time dateTime={report.reportedAt}>{formattedDate}</time>
          </span>
          {report.photoDataUrl && (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                color: 'var(--color-accent)',
                fontWeight: 600,
              }}
            >
              <Image size={13} aria-hidden="true" />
              <span>Photo</span>
            </span>
          )}
        </div>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontWeight: 600,
            color: 'var(--color-accent)',
          }}
        >
          <span>Details</span>
          <ArrowRight size={14} aria-hidden="true" />
        </span>
      </div>
    </article>
  );
};

