# Data Model

## Report
```ts
type IssueCategory =
  | "Lift / Elevator"
  | "Ramp"
  | "Pathway / Obstruction"
  | "Signage / Directions"
  | "Accessible Washroom"
  | "Entrance / Door"
  | "Other";

type ReportStatus = "Active" | "Under review" | "Resolved" | "Archived";

type ReportSource = "Sample" | "User-submitted";

interface StatusEvent {
  status: ReportStatus;
  at: string; // ISO timestamp
  note?: string;
}

interface AccessibilityReport {
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
  reporterContext?: "Experienced it" | "Observed it" | "Someone informed me";
  photoDataUrl?: string;
  statusHistory: StatusEvent[];
}
```

## Storage keys
- `accesspath.reports.v1`: report array
- `accesspath.demo.initialized.v1`: seed initialization marker

## Rules
- Seed data must use `isSample: true` and `source: "Sample"`.
- User-submitted reports must use `isSample: false` and `source: "User-submitted"`.
- Never put reporter name, phone number, student ID, email, or other personal details in public report cards.
- Status changes append to `statusHistory`.
- Store ISO timestamps and format them for display.
- A sample record must never be presented as an official verified campus fact.
