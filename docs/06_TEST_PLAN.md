# QA Test Plan

## Search
- Search “Block 34”.
- Search “B34”.
- Search “Block 33”.
- Search “lift”.
- Search “ramp”.
- Search an unknown block and confirm the empty-state disclaimer.
- Search with mixed case and extra spaces.
- Combine status and category filters.

## Submit report
- Submit valid report without photo.
- Submit valid report with supported image.
- Try empty required fields.
- Try too-short description.
- Try unsupported file type and oversized file.
- Confirm success message.
- Confirm report appears in Home/Search/My Reports after refresh.
- Confirm public UI does not reveal private reporter information.

## Status and history
- Change sample/user report from Active to Under review.
- Add status note.
- Confirm history event appears.
- Change to Resolved and verify original report content remains.

## Responsive/accessibility
- Test narrow mobile viewport and desktop.
- Navigate with keyboard only.
- Confirm visible focus.
- Confirm labels, error text, and buttons have accessible names.
- Confirm no horizontal overflow.
- Confirm sample and local-only disclaimers are visible.

## Build
- Run npm install.
- Run npm run dev.
- Run npm run build.
- Resolve all errors and warnings that affect functionality.
