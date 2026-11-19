# Search, Content, and Trust Rules

## Search matching
Search across:
- location
- locationAliases
- locationDetail
- category
- title
- description

Normalize:
- lowercase
- trim leading/trailing spaces
- collapse repeated spaces
- treat punctuation and hyphens as separators

Examples:
- “Block 34”, “block-34”, “B34”, and “B-34” should match only where the record explicitly contains relevant aliases.
- “lift” should match relevant issue category/title/description.
- “ramp” should match relevant reports.
Do not create a global rule that every number or alias maps to a building unless that alias exists in the record.

## Empty results
Always say: “No reports found for this search. This does not confirm that the location is accessible.”

## Trust labels
- Sample report: fictional data inserted to demonstrate the app.
- User-submitted: submitted by a user of this local prototype.
- Active: currently marked active in the prototype, not independently verified.
- Under review: marked under review in this local demo only.
- Resolved: marked resolved in the prototype; do not imply university verification.
- Archived: hidden from active attention but retained in the demo history.

## Report wording
Prefer:
- “A user reported…”
- “Reported on…”
- “Status in this prototype…”
Avoid:
- “Block is inaccessible.”
- “The lift is broken” unless explicitly a report description.
- “Verified issue”, “fixed by LPU”, or “official status” unless supported by a real verified integration (not in this prototype).

## Privacy and safety
- Do not request disability diagnosis or medical details.
- Do not require real name or student ID.
- Warn users not to photograph identifiable people or capture private information.
- Avoid public display of reporter identity.
