# AccessPath — Antigravity Build Package

This package is the complete product brief and implementation guide for building a polished, working **prototype** of AccessPath.

## What to do
1. Extract this ZIP.
2. Open the extracted `AccessPath_Antigravity_Starter` folder in Antigravity.
3. Open `ANTIGRAVITY_MASTER_PROMPT.md`.
4. Copy the entire prompt into Antigravity and ask it to build the app in the open folder.
5. Let it inspect all files in this package before coding.

## Product in one sentence
AccessPath is a campus accessibility information and issue-reporting prototype: students can search a building/block by name or keyword, read reports about accessibility barriers at that location, and submit a new report with an optional photo.

## Important scope decision
This prototype **does not require a complete LPU campus map, GPS, live tracking, or a verified block-by-block facilities directory**. It uses text/keyword search over stored reports and clearly labels information as user-reported.

## Accuracy and ethics
- Do not invent official LPU facility data, building details, verified accessibility status, interview quotes, participant identities, or report histories.
- Seed examples are clearly marked as demonstration/sample data.
- Never show a sample report as a verified current condition.
- Use dates and status labels transparently.
- Do not expose reporter identity in public report cards.
- Do not claim that an issue has been fixed unless a user changes its status in the prototype.

## Recommended deliverable
A responsive, attractive web prototype that runs locally, with:
- Home/dashboard
- Search by block/building/keyword
- Search results and report detail
- Submit issue form
- My reports (local demo)
- Admin/moderation view (demo-only)
- About/help and clear limitations
- Local persistence so demo actions survive refresh
- Sample data and a polished demo flow

See `docs/` for full requirements and `data/` for sample content.
