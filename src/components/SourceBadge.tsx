import React from 'react';
import { FlaskConical, UserCheck } from 'lucide-react';

interface SourceBadgeProps {
  isSample: boolean;
  source?: string;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({ isSample }) => {
  if (isSample) {
    return (
      <span
        className="badge badge-sample"
        title="Sample demonstration record for interface testing — not an independently verified fact"
      >
        <FlaskConical size={12} aria-hidden="true" />
        <span>Sample / Demo – Not Verified</span>
      </span>
    );
  }

  return (
    <span
      className="badge badge-user"
      title="Submitted by a student or visitor via this browser prototype"
    >
      <UserCheck size={12} aria-hidden="true" />
      <span>User-submitted</span>
    </span>
  );
};
