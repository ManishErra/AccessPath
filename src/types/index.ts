export type IssueCategory =
  | 'Lift / Elevator'
  | 'Ramp'
  | 'Pathway / Obstruction'
  | 'Signage / Directions'
  | 'Accessible Washroom'
  | 'Entrance / Door'
  | 'Other';

export const ISSUE_CATEGORIES: IssueCategory[] = [
  'Lift / Elevator',
  'Ramp',
  'Pathway / Obstruction',
  'Signage / Directions',
  'Accessible Washroom',
  'Entrance / Door',
  'Other',
];

export type ReportStatus = 'Active' | 'Under review' | 'Resolved' | 'Archived';

export const REPORT_STATUSES: ReportStatus[] = [
  'Active',
  'Under review',
  'Resolved',
  'Archived',
];

export type ReportSource = 'Sample' | 'User-submitted';

export type ReporterContext =
  | 'Experienced it'
  | 'Observed it'
  | 'Someone informed me';

export const REPORTER_CONTEXTS: ReporterContext[] = [
  'Experienced it',
  'Observed it',
  'Someone informed me',
];

export interface StatusEvent {
  status: ReportStatus;
  at: string; // ISO timestamp
  note?: string;
}

export interface AccessibilityReport {
  id: string;
  location: string;
  locationAliases: string[];
  locationDetail?: string;
  category: IssueCategory;
  title: string;
  description: string;
  reportedAt: string; // ISO timestamp
  status: ReportStatus;
  source: ReportSource;
  isSample: boolean;
  reporterContext?: ReporterContext;
  photoDataUrl?: string;
  statusHistory: StatusEvent[];
  isLocalDeviceSubmission?: boolean;
}

export type StatusFilter = 'All' | ReportStatus;
export type CategoryFilter = 'All' | IssueCategory;
export type SortOrder = 'newest' | 'oldest';

export interface SearchFilters {
  query: string;
  status: StatusFilter;
  category: CategoryFilter;
  sortBy: SortOrder;
}

