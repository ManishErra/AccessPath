import React from 'react';
import { ReportStatus } from '../types';
import { AlertCircle, Clock, CheckCircle2, Archive } from 'lucide-react';

interface StatusBadgeProps {
  status: ReportStatus;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showIcon = true }) => {
  const getDetails = () => {
    switch (status) {
      case 'Active':
        return {
          className: 'badge-active',
          icon: <AlertCircle size={13} aria-hidden="true" />,
          label: 'Active',
        };
      case 'Under review':
        return {
          className: 'badge-review',
          icon: <Clock size={13} aria-hidden="true" />,
          label: 'Under review',
        };
      case 'Resolved':
        return {
          className: 'badge-resolved',
          icon: <CheckCircle2 size={13} aria-hidden="true" />,
          label: 'Resolved',
        };
      case 'Archived':
        return {
          className: 'badge-archived',
          icon: <Archive size={13} aria-hidden="true" />,
          label: 'Archived',
        };
      default:
        return {
          className: 'badge-active',
          icon: <AlertCircle size={13} aria-hidden="true" />,
          label: status,
        };
    }
  };

  const { className, icon, label } = getDetails();

  return (
    <span className={`badge ${className}`} title={`Status: ${label}`}>
      {showIcon && icon}
      <span>{label}</span>
    </span>
  );
};

