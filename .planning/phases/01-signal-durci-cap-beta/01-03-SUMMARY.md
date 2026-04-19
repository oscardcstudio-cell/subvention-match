---
phase: 01-signal-durci-cap-beta
plan: "03"
subsystem: ui
tags: [react, tanstack-query, beta-cap, waitlist, homepage, form-wizard]

requires:
  - phase: 01-signal-durci-cap-beta
    plan: "01"
    provides: "/api/beta/capacity and /api/waitlist/qualified routes (plan 01-01)"

provides:
  - "BetaCapCounter component (client/src/components/BetaCapCounter.tsx) consuming /api/beta/capacity"
  - "Homepage QualifiedWaitlistSection capturing email + pricingIntent + triggerFeatures, POSTing to /api/waitlist/qualified"
  - "FormWizard header displays BetaCapCounter"
  - "FormWizard cap gate: isFull renders waitlist screen instead of form"

affects:
  - ui
  - homepage
  - form-wizard
  - waitlist

tech-stack:
  added: []
  patterns:
    - "BetaCapCounter as shared component imported in multiple pages (not redefined locally)"
    - "Cap gate pattern: all hooks declared first, conditional return after for isFull check"
    - "QualifiedWaitlistSection adapts copy/CTA based on isFull while always posting to same endpoint"

key-files:
  created:
    - client/src/components/BetaCapCounter.tsx
  modified:
    - client/src/pages/Home.tsx
    - client/src/pages/FormWizard.tsx

key-decisions:
  - "BetaCapCounter hidden on mobile in FormWizard header (hidden md:inline-flex) to avoid crowding the 4-element header row"
  - "QualifiedWaitlistSection reads its own capacityData query independently (not prop-drilled) for clean separation"
  - "Cap gate in FormWizard uses simple email-only form (no pricing/features) since it's a minimal friction gate"

patterns-established:
  - "Shared counter component: single canonical file, imported everywhere, never redefined inline"
  - "Always-same-endpoint pattern: QualifiedWaitlistSection posts to /api/waitlist/qualified regardless of isFull"

requirements-completed: [FEEDBACK-02, CAP-01, CAP-02, CAP-03]

duration: 3min
completed: 2026-04-19
---

# Phase 01 Plan 03: Cap Counter + Waitlist Gate Summary

**BetaCapCounter component + qualified waitlist on homepage + FormWizard cap gate — real-time X/150 places display and isFull bascule**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-19T01:02:04Z
- **Completed:** 2026-04-19T01:05:04Z
- **Tasks:** 2
- **Files modified:** 3 (1 created, 2 modified)

## Accomplishments

- Created `BetaCapCounter.tsx` as a reusable component with pulsing dot and "X / 150 places" display (or red "Beta complete" when isFull)
- Replaced the simple `BetaWaitlistSection` on the homepage with `QualifiedWaitlistSection` that captures email + pricingIntent radio buttons + triggerFeatures checkboxes (max 3), always POSTing to `/api/waitlist/qualified`
- Added `BetaCapCounter` to the FormWizard header and implemented the cap gate: when `isFull`, the entire wizard is replaced by a clean waitlist screen

## Task Commits

1. **Task 1: BetaCapCounter + QualifiedWaitlistSection** - `2aceaed` (feat)
2. **Task 2: FormWizard header counter + cap gate** - `3f7c393` (feat)

**Plan metadata:** see final docs commit

## Files Created/Modified

- `client/src/components/BetaCapCounter.tsx` - Reusable component polling /api/beta/capacity every 60s
- `client/src/pages/Home.tsx` - BetaCapCounter in hero; QualifiedWaitlistSection replacing BetaWaitlistSection
- `client/src/pages/FormWizard.tsx` - useQuery for capacity; BetaCapCounter in header; isFull cap gate

## Decisions Made

- BetaCapCounter hidden on mobile in FormWizard (`hidden md:inline-flex`) to avoid overcrowding the 4-element header
- QualifiedWaitlistSection owns its own capacityData query rather than receiving isFull as a prop — cleaner coupling
- Cap gate form in FormWizard is email-only (no pricing/features sliders) — keeping the friction minimal at the gate itself; the qualified data is captured on the homepage form instead

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None. Build passed with 0 errors (2 pre-existing schema.ts duplicate-key warnings unrelated to this plan).

## Self-Check: PASSED

- FOUND: client/src/components/BetaCapCounter.tsx
- FOUND: Task 1 commit 2aceaed
- FOUND: Task 2 commit 3f7c393
- Build: clean (npm run build exits 0)

## Next Phase Readiness

- CAP-01/02/03 and FEEDBACK-02 are complete
- Plan 01-02 (nudge match_feedback) can proceed independently
- `/api/beta/capacity` and `/api/waitlist/qualified` must be deployed (plan 01-01) for the UI to function in production

---
*Phase: 01-signal-durci-cap-beta*
*Completed: 2026-04-19*
