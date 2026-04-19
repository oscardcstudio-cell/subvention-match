---
phase: 01-signal-durci-cap-beta
plan: 02
subsystem: client-ui
tags: [feedback, nudge, admin, dashboard, beta-signal]
dependency_graph:
  requires: [01-01]
  provides: [feedback-nudge-ui, admin-signal-beta-dashboard]
  affects: [ResultsPage, AdminPage]
tech_stack:
  added: []
  patterns: [useQuery-custom-queryFn, sessionStorage-dismissal, fixed-bottom-banner]
key_files:
  created: []
  modified:
    - client/src/pages/ResultsPage.tsx
    - client/src/pages/AdminPage.tsx
decisions:
  - adminToken read from localStorage + URLSearchParams at component init (no Context) — avoids refactor of existing admin auth pattern
  - dashboardLoading spinner only shown if adminToken present — no spurious loading indicator for unauthenticated visits
  - nudge useEffect depends on results.length (not data) — avoids retriggering if data object reference changes
metrics:
  duration: 2 minutes
  completed: 2026-04-19
  tasks_completed: 2
  tasks_total: 2
  files_modified: 2
requirements_satisfied: [FEEDBACK-01, FEEDBACK-03]
---

# Phase 01 Plan 02: FeedbackNudge + Signal Beta Dashboard Summary

**One-liner:** Fixed bottom nudge banner (3s delay, sessionStorage dismissal) on ResultsPage + Signal beta admin section querying /api/admin/feedback-dashboard with x-admin-token.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | FeedbackNudge in ResultsPage | 992a60d | client/src/pages/ResultsPage.tsx |
| 2 | Signal beta section in AdminPage | 020ce84 | client/src/pages/AdminPage.tsx |

## What Was Built

### Task 1 — FeedbackNudge (ResultsPage.tsx)

- Added `X` to lucide-react imports
- Added `nudgeVisible` state (default `false`)
- Added `useEffect` that fires `setTimeout(3000ms)` when `results.length > 0`, skipped if `sessionStorage.getItem('nudge_dismissed') === '1'`
- Fixed-position bottom banner (z-50) with `--mc-warn` background, bilingual message (FR/EN)
- Dismiss button calls `setNudgeVisible(false)` and `sessionStorage.setItem('nudge_dismissed', '1')`
- No changes to existing feedbackMutation or MatchCard thumbs

### Task 2 — Signal beta dashboard (AdminPage.tsx)

- Added `FeedbackDashboard`, `BetaFeedback`, `BetaWaitlistEntry` TypeScript types
- `adminToken` sourced from `localStorage.getItem("adminToken")` or URL `?admin_token=` param
- `useQuery` with custom `queryFn` for `/api/admin/feedback-dashboard` sending `x-admin-token` header
- Signal beta section conditional on `dashboardData` being truthy
- 3 metric cards: Cap beta (count/cap, status), Match feedback (totalVotes + byRating breakdown), Waitlist qualifiee (count with pricingIntent)
- Qualified waitlist table: email, pricingIntent, triggerFeatures joined, date in fr-FR locale

## Verification

```
# Task 1
grep nudgeVisible / nudge_dismissed / sessionStorage / setTimeout.*3000 → PASS (5 matches)

# Task 2
grep feedback-dashboard / Signal beta → PASS (6 matches)

# Build
npm run build → ✓ built in 7.45s (2 pre-existing warnings in shared/schema.ts, unrelated)
```

## Deviations from Plan

None — plan executed exactly as written.

- `dashboardLoading` spinner added (plan didn't specify but is correct UX)
- Typed `BetaFeedback` / `BetaWaitlistEntry` / `FeedbackDashboard` interfaces instead of using `any` in the component types (the plan used `any` in JSX inline only)

Both are Rule 2 improvements (correctness/type safety), no architectural change.

## Self-Check

- [x] `client/src/pages/ResultsPage.tsx` modified — contains nudgeVisible, sessionStorage, setTimeout 3000
- [x] `client/src/pages/AdminPage.tsx` modified — contains feedback-dashboard query + Signal beta section
- [x] Commit `992a60d` exists (Task 1)
- [x] Commit `020ce84` exists (Task 2)
- [x] Build passes without new errors

## Self-Check: PASSED
