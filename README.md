# AccessPath — Campus Accessibility Information & Issue Reporting

> **"Know before you go. Report what you find."**

AccessPath is a clean, modern, responsive campus accessibility information and issue-reporting web prototype. It helps students check user-reported accessibility barriers (elevators, ramps, pathways, signage, accessible washrooms) for campus buildings before traveling there, and provides a simple way to report barriers they encounter.

---

## ⚠️ Important Scope & Prototype Disclaimers

1. **Student Project Prototype:** AccessPath is an academic project prototype developed for coursework (**INT335-12**). It is **not** an official Lovely Professional University (LPU) service and is not connected to university maintenance or security departments.
2. **User-Submitted & Unverified:** All accessibility reports reflect student/visitor observations and are **not independently verified**. Conditions may change quickly or vary by floor.
3. **Absence of Report ≠ Accessible:** An empty search result for a block or building **does not guarantee or confirm that the location is barrier-free**.
4. **Sample / Demo Data:** Initial records loaded from `data/sample_reports.json` are fictional demonstration content and are clearly tagged with a **Sample report (Demo)** badge.
5. **No GPS / No Telemetry:** The app does **not** track GPS, indoor positioning, or real-time elevator sensors. Location discovery is purely text/alias-based.
6. **Zero Personal Identifiers:** No student IDs, names, or contact numbers are collected or shown.
7. **Local Storage Persistence:** Reports are stored locally in the browser's `localStorage`. They do not sync across devices or to external cloud servers.

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Modular CSS architecture with custom design tokens (`src/styles/variables.css` and `src/styles/global.css`)
- **Icons:** Lucide React
- **Persistence:** Abstracted Storage Service (`src/services/storage.ts`) using browser `localStorage`
- **Routing:** Robust Hash-based client router (`src/router.tsx`) supporting direct linking, parameters, and back/forward navigation
- **Testing:** Vitest test suite (`npm test`) covering search normalization, validation, and storage operations

### Directory Structure
```
AccessPath/
├── data/
│   └── sample_reports.json         # Seed demo records
├── docs/                           # Product specifications & research context
│   ├── 01_PRODUCT_REQUIREMENTS.md
│   ├── 02_USER_FLOWS.md
│   ├── 03_DATA_MODEL.md
│   ├── 04_SEARCH_AND_CONTENT_RULES.md
│   ├── 05_UI_DESIGN_GUIDE.md
│   ├── 06_TEST_PLAN.md
│   ├── 07_RESEARCH_CONTEXT_AND_LIMITATIONS.md
│   └── 08_PRESENTATION_DEMO_SCRIPT.md
├── public/
│   └── favicon.svg                 # Custom AccessPath brand icon
├── src/
│   ├── components/                 # Reusable UI components
│   │   ├── DisclaimerBanner.tsx    # Prominent advisory banner
│   │   ├── Footer.tsx              # Footer with disclaimer & reset button
│   │   ├── Navbar.tsx              # Sticky accessible header with mobile drawer
│   │   ├── PhotoUploadField.tsx    # Accessible photo upload with instant preview & invalidation
│   │   ├── ReportCard.tsx          # Accessible report card
│   │   ├── SourceBadge.tsx         # Sample vs User-submitted badge
│   │   └── StatusBadge.tsx         # Active, Review, Resolved, Archived badge
│   ├── data/
│   │   └── seedReports.ts          # Typed seed reports
│   ├── pages/                      # Page views
│   │   ├── AboutPage.tsx           # How it works & research context
│   │   ├── DemoModerationPage.tsx  # Local triage & status history editor
│   │   ├── HomePage.tsx            # Hero, quick search, recent cards, stats
│   │   ├── MyReportsPage.tsx       # Locally submitted issues & delete action
│   │   ├── ReportDetailPage.tsx    # Full report view, audit log, photo modal
│   │   ├── SearchPage.tsx          # Multi-filter search & empty state notice
│   │   └── SubmitReportPage.tsx    # Structured form with photo preview
│   ├── services/
│   │   ├── search.ts               # Search normalization and matching
│   │   ├── storage.ts              # LocalStorage service layer & alias generator
│   │   └── __tests__/              # Search & storage unit tests
│   ├── styles/
│   │   ├── global.css              # Global styles, typography, accessibility
│   │   └── variables.css           # Color tokens, radii, shadows, spacing
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces & types
│   ├── utils/
│   │   ├── validation.ts           # Form & photo upload validation
│   │   └── __tests__/              # Validation unit tests
│   ├── App.tsx                     # Main app root & page router integration
│   ├── main.tsx                    # Entry point
│   └── router.tsx                  # Typed hash-based router hook
├── index.html                      # Semantic HTML entry with accessible metadata
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Quick Start & Run Instructions

Ensure you have **Node.js (v18+)** and **npm** installed.

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your web browser.

### 3. Run Production Build
```bash
npm run build
```
Compiles TypeScript and outputs optimized production assets to `dist/`.

### 4. Preview Production Build
```bash
npm run preview
```
Serves the production build locally at `http://localhost:4173`.

### 5. Run Test Suite
```bash
npm test
```
Executes all 85 automated unit and integration tests across 6 test suites:
- `storage.test.ts` (40 tests): Storage fallback data-loss protection (save, update, and delete abort without overwriting corrupted/unreadable storage with seed fallback data), transactional atomicity, key snapshots and rollback on write/removal failure (including rollback failure handling), quota limit recovery, sample protection from deletion, strict device deletion permissions, initialization safety against missing flags or outdated seed versions, sample record deduplication across repeated initializations, safe handling of missing storage keys, preserving user reports during resets, My Reports error diagnostics (`storage_unavailable`, `storage_read_error`), proving `getAllReportsWithStatus` returns empty results on corrupted storage rather than fallback sample data, and distinguishing between `not_found` and `storage_read_error` in `getReportByIdWithStatus`.
- `search.test.ts` (16 tests): Keyword matching, alias generation (`B34`, `B-34`, `Block 34`), whole-word boundary verification (ensuring `Block 3` never matches `Block 34` or `Block 33`; `Block 33` never matches `Block 34`), multi-category filters, empty state behavior, and comprehensive multi-block verification (`Block 3`, `Block 33`, `Block 34`, `B33`, `B34`, `B-34`, `Block-34`, `Block34`, `Lift`, `Ramp`, `Signage`, `Pathway`, `Block 99`).
- `PhotoUploadField.test.tsx` (13 tests): Rendered React component integration tests with `@testing-library/react` and `jsdom` covering valid JPEG, PNG, WebP, and animated GIF selections, instant clearing of old image when an invalid or oversized file is selected, FileReader `onload`/`onerror`/`onabort` handling, manual removal, race-condition cancellation protection against rapid consecutive file selections, submissions with and without photos, and storage quota failure reporting.
- `validation.test.ts` (12 tests): Form validation rules, payload boundaries, and photo upload restrictions.
- `exactUserJourney.test.tsx` (3 tests): Rendered end-to-end user journey (Open -> Search Block 34 -> Open report -> Return to search -> Submit report -> View confirmation -> My Reports -> Moderate -> Verify updated status), edge cases (invalid form submissions, Block 99 empty search results disclaimer, and browser refresh persistence), and storage failure UI handling (verifying global storage error banner and ReportDetailPage storage read error card without fallback samples).
- `userFlow.test.ts` (1 test): Complete integration flow from submission to moderation update.

---

## 📱 Features & Screen Overview

### 1. Home / Dashboard (`#/`)
- Original AccessPath wordmark and accessible navigation.
- Tagline: *"Know before you go. Report what you find."*
- Prominent search bar with Enter-key and button submission.
- Quick issue category filter chips (Lift, Ramp, Obstruction, Washroom, etc.).
- Real-time demo statistics calculated from local data (not fake live sensor telemetry).
- Recently reported issues cards with clear **Sample / Demo – Not Verified** tags.
- Prominent accessibility advisory banner.

### 2. Search (`#/search`)
- Robust text matching across block numbers, aliases, categories, and descriptions.
- Supports aliases and keywords: `"Block 34"`, `"B34"`, `"B-34"`, `"Block 33"`, `"B33"`, `"lift"`, `"ramp"`, `"signage"`, `"pathway"`.
- Prevents false-positive matches (e.g. searching "Block 4" does not falsely match "Block 34").
- Multi-dimensional filters: Status (`All`, `Active`, `Under review`, `Resolved`, `Archived`), Issue Category, and Sort Order (`Newest`, `Oldest`).
- Helpful empty state with mandatory advisory:
  > *"No reports found for this search. This does not confirm that the location is accessible."*

### 3. Report Detail (`#/report/:id`)
- Full title, description, location, specific area detail, and reporter context.
- Status badge and sample badge.
- Interactive enlarged photo viewer.
- Status history audit log showing all historical status changes, timestamps, and moderation notes.
- Direct quick links to "Report similar issue" or "Open in Demo Moderation".

### 4. Submit Report (`#/submit`)
- Structured form:
  - Location / Block (required free text)
  - Specific location details (optional)
  - Issue category selector (required)
  - Short summary title (required)
  - Description (required, minimum 15 characters, maximum 1000 characters)
  - Photo upload (optional, supports JPEG/PNG/WebP/GIF, max 2.0 MB, live preview with remove button)
  - Reporting perspective selector (*"I experienced it" / "I observed it" / "Someone informed me"*)
  - Required privacy acknowledgment checkbox
- Accessible inline error validation and clear success screen.

### 5. My Reports (`#/my-reports`)
- Displays reports submitted from this specific browser/device.
- Explicit limitation notice explaining that records exist in browser cache only.
- Delete action with an accessible confirmation dialog.

### 6. Demo Moderation (`#/moderation`)
- Clearly labeled: *"Demo moderation — local only"*.
- Interactive triage queue with status filtering.
- Ability to change status (*Active*, *Under review*, *Resolved*, *Archived*) and attach internal notes.
- Audit history is appended without modifying the original user submission.
- "Reset Demo Seed Data" action to restore initial demo state.

### 7. About & Research Context (`#/about`)
- Step-by-step walkthrough of the product workflow.
- Research context from student project findings (Block 34 lift floor coverage, Block 33 lift absence, ramp directions clarity).
- Citation of public university information (LPU Disability Support Office, infrastructure statements) explaining the practical gap AccessPath addresses.
- Clear disclosure of scope boundaries and future possibilities.

---

## ♿ Accessibility & Design Details

- **Semantic Landmarks:** `<main id="main-content">`, `<header>`, `<nav>`, `<footer>`, `<article>`, `<section>`, `<form>`.
- **Keyboard Navigation:** Skip link to main content (`.skip-link`), visible `:focus-visible` outline rings with contrast.
- **Screen Reader Announcements:** `aria-live="polite"`, `role="status"`, `role="alert"`, descriptive `aria-label` tags.
- **Form Association:** All form inputs have explicit `<label htmlFor="...">`, `aria-describedby` hints, and `aria-invalid` error states.
- **Color Contrast:** Deep navy (`#0F172A`) against warm light background (`#F8FAFC`), accessible teal accents (`#0F766E`), and dual icon/text status indicators (not relying on color alone).
- **Reduced Motion:** Fully honors `prefers-reduced-motion` media queries.

---

## 🧪 Classroom Demo Script

For a 2-minute project presentation:
1. Open the homepage: Explain that AccessPath is a student-built prototype for checking campus accessibility barriers before traveling to a building, without relying on GPS or full maps.
2. Search **"B34"**: Open the Block 34 lift record; highlight the **Sample / Demo – Not Verified** badge, report timestamp, and unverified advisory notice.
3. Search **"ramp"** or **"signage"**: Show how keyword matching searches across categories and descriptions.
4. Search an unrecorded block (e.g. **"Block 99"**): Demonstrate the required empty-state advisory (*"No reports found... This does not confirm that the location is accessible"*).
5. Submit a new report: Fill out a sample issue (e.g. "Block 14", category "Ramp", title "Handrail loose"), attach an image, and submit. Confirm it appears immediately in My Reports and Search.
6. Open **My Reports**: Show that the report is stored locally in this browser.
7. Open **Demo Moderation**: Select a report, update its status from *Active* to *Under review*, enter a note ("Dispatched facilities inspection"), and verify the audit history updates without altering original text.
8. Conclude on the **About** page: Outline project research context (Block 34, Block 33, ramp directions) and the future roadmap for university partnership.

