# MASTER BUILD PROMPT — ACCESSPATH

You are a senior full-stack product engineer, UI/UX designer, and QA engineer. Build the complete working prototype described in this folder. First read `README_FIRST.md` and every file in `docs/` and `data/`. Do not start coding until you understand the scope.

## Mission
Build **AccessPath**, a clean, modern, responsive campus accessibility information and issue-reporting web app. It helps a student check user-reported accessibility barriers for a campus building/block before going there, and lets students report an issue they encounter.

This is a student project prototype, not an official LPU service. Make that clear in the UI and footer.

## Non-negotiable scope
1. No full-campus map is required.
2. No GPS, location tracking, route navigation, or live lift telemetry.
3. Search is text/keyword based and must work with building aliases and issue keywords.
4. Results are based on saved reports. Do not imply that an empty result means a location is accessible.
5. Sample reports must be labelled **Demo data** or **Sample report**.
6. No fabricated official building facility inventory, no invented verified facts, and no claims that LPU has or lacks a particular facility at a particular block unless it is supplied as a verified record.
7. Do not collect real student identity in the prototype. Use an optional display alias only for local demo, and never show it publicly.
8. Make the app usable with keyboard and screen readers: semantic HTML, labels, visible focus, good contrast, accessible validation, alt text, and responsive layouts.

## Build approach
- Inspect the existing folder before choosing a stack.
- If empty, use React + Vite + TypeScript, with a simple, maintainable component structure.
- Use CSS modules or a clean global CSS system; do not add heavy UI libraries unless genuinely useful.
- Use localStorage for prototype persistence. Keep storage access behind a small service layer so a backend can replace it later.
- Use only dependencies that are necessary. Do not require API keys, paid services, or network access.
- Make the app run with standard commands (`npm install`, `npm run dev`, `npm run build`).
- Add a useful `package.json`, README, and clear setup instructions.
- If the environment already contains a suitable stack, preserve it rather than replacing it unnecessarily.

## Required screens and behavior

### A. Home / Dashboard
- Brand mark and name: AccessPath.
- Short tagline: “Know before you go. Report what you find.”
- Primary search field: “Search a block, building, or issue…”
- Search button and Enter-key support.
- Quick issue category chips.
- “Recently reported” cards using demo or locally submitted records.
- Clear CTA: “Report an accessibility issue”.
- A prominent, calm disclaimer: “Reports are user-submitted and may not reflect current conditions. No report does not mean a route or building is accessible.”
- Do not display fake live counts. If counts are shown, calculate them from local data and label them “reports in this demo”.

### B. Search
- Search by block/building names, aliases, issue categories, keywords, and description.
- Normalize case, whitespace, punctuation, and common forms such as “Block 34”, “B34”, “block-34”.
- Search should match location aliases and issue text.
- Show a helpful empty state: “No reports found for this search. This does not confirm that the location is accessible.”
- Provide filters: status (All / Active / Resolved), category, and sort newest first.
- Search results should show location, issue category, short description, report date, status, and “Sample” badge where appropriate.
- Make the location search robust without using GPS.

### C. Report detail
- Show the full report description, selected location, category, date/time, status, optional image, and sample/demo marker.
- Show status history if available.
- Provide a clear note that the report is not independently verified.
- Provide a “Report similar issue” or “Submit another report” action.
- Never display personal contact details or private reporter information.

### D. Submit report
Fields:
- Location/block/building (required; free text, e.g. “Block 34”)
- Optional location detail (e.g. “near the main entrance”, “ground floor corridor”)
- Issue category (required): Lift / Elevator; Ramp; Pathway / Obstruction; Signage / Directions; Accessible Washroom; Entrance / Door; Other
- Short title (required)
- Description (required, sensible minimum length and maximum length)
- Optional photo upload (image only, preview before submit, size limit with friendly error)
- Optional “I am reporting this as…” selector: I experienced it / I observed it / Someone informed me. This is context, not proof.
- Checkbox confirming: “I understand this is a user-submitted report and should not include personal or sensitive information.”
- Submit button.
Validation:
- Required fields and character limits.
- Reject unsupported file types and oversized files.
- Show inline errors and an accessible success confirmation.
- Save locally with unique ID, createdAt, initial status `Active`, source `User-submitted`.
- Do not require account creation.

### E. My Reports
- In this prototype, show reports submitted in this browser/device only.
- Make this limitation explicit.
- Allow the local demo user to view their submitted reports.
- If deletion is implemented, confirm before deleting.
- Do not imply reports are synced across devices or visible to a real university team.

### F. Demo Admin / Moderation
- Clearly mark this as “Demo moderation — local only”.
- Allow status changes among Active, Under review, Resolved, and Archived.
- Add an optional status note.
- Keep a small status history in local storage.
- This is not a real administrative workflow and must not imply university staff are monitoring reports.
- Do not allow a status change to silently erase the original report.

### G. About / How it works
Explain:
1. Search a block or keyword.
2. Read reports and check dates/status.
3. Submit an issue with optional photo.
4. Reports are user-submitted and need verification.
Explain prototype limitations and future possibilities without claiming they exist now.

## UX / visual direction
- Design should feel like a credible university product, not a generic admin dashboard.
- Calm, confident, modern, welcoming.
- Use a restrained palette: deep navy/indigo, accessible teal accent, warm off-white background, neutral surfaces.
- Strong typography, clear spacing, rounded cards, subtle borders/shadows, crisp icons.
- Mobile-first responsive design, but polished desktop layout.
- Use consistent status chips: Active, Under review, Resolved, Archived.
- Use clear labels and helpful empty/loading/error states.
- Avoid clutter, excessive gradients, tiny text, and decorative animations.
- Provide a coherent navigation bar and footer.
- Use real text, not lorem ipsum.
- Do not use copyrighted university logos unless a logo asset is explicitly supplied. Use a simple original AccessPath wordmark/icon.

## Data and search requirements
Use `data/sample_reports.json` as initial demo seed data. The data is fictional illustrative content and must carry `isSample: true`. If a user clears local data, offer a reset-to-demo-data action.
Create a normalized search utility that:
- matches location, aliases, category, title, description, and location detail;
- supports “Block 34”, “B34”, “B-34” variations where aliases are supplied;
- ignores case and excess spaces;
- returns only records matching selected filters.
Do not infer that a location has a lift/ramp from a report unless the report specifically says so.

## Architecture
Keep code organized, for example:
- `src/components/`
- `src/pages/`
- `src/services/storage.ts`
- `src/services/search.ts`
- `src/types/`
- `src/data/`
- `src/styles/`
- `src/utils/`
Use TypeScript types for reports, categories, statuses, and history.
Add basic tests for search normalization/matching and form validation if the project setup allows.

## Final quality checklist
Before finishing:
1. Run the app and resolve compile/runtime errors.
2. Run production build.
3. Test navigation and all forms.
4. Test search with “Block 34”, “B34”, “lift”, and “ramp”.
5. Submit a report and confirm it appears after refresh.
6. Change a report status in demo moderation and confirm history updates.
7. Check mobile and desktop layouts.
8. Check keyboard-only use and form labels.
9. Ensure sample data is labelled and disclaimers are visible.
10. Update README with exact run instructions and explain local-only demo behavior.

## Final response expected from you
When implementation is complete, tell me:
- files created and main features,
- exact commands to run,
- what was tested,
- any limitations or unfinished items.
Do not merely provide a plan. Build the working prototype in this folder now.
