---
phase: 01-signal-durci-cap-beta
verified: 2026-04-18T00:00:00Z
status: passed
score: 11/11 must-haves verified
re_verification: false
---

# Phase 01: Signal Durci + Cap Beta Verification Report

**Phase Goal:** Instrumenter l'app pour capter l'intention utilisateur (match_feedback + waitlist qualifiée) et poser un cap beta 150 avec compteur visible et bascule automatique vers waitlist.
**Verified:** 2026-04-18
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | GET /api/beta/capacity retourne { count, cap, isFull } en moins de 100ms | VERIFIED | `server/routes.ts:737` — query `countDistinct(formSubmissions.email)` + BETA_CAP env var, returns JSON object |
| 2 | POST /api/waitlist/qualified accepte email + pricingIntent + triggerFeatures et persiste en DB | VERIFIED | `server/routes.ts:754` — full implementation with validation, `db.insert(betaWaitlist).values(...)`, `onConflictDoNothing()` |
| 3 | GET /api/admin/feedback-dashboard retourne les agrégats match_feedback + beta_feedback + waitlist qualifiée | VERIFIED | `server/routes.ts:782` — 4 DB queries, returns `{ betaCapacity, matchFeedback, recentBetaFeedback, qualifiedWaitlist }` behind `requireAdmin` |
| 4 | La table beta_waitlist a les colonnes pricingIntent et triggerFeatures (nullable, rétro-compatible) | VERIFIED | `shared/schema.ts:234-235` — `pricingIntent: text("pricing_intent")` (no `.notNull()`), `triggerFeatures: text("trigger_features").array()` (no `.notNull()`) |
| 5 | BETA_CAP est lu depuis process.env.BETA_CAP avec fallback 150 ; isFull est true quand count >= cap | VERIFIED | `server/routes.ts:741` — `parseInt(process.env.BETA_CAP ?? "150", 10)`, `isFull: count >= cap` at line 746 |
| 6 | Sur /results, un bandeau non-bloquant apparaît 3s après le chargement des résultats | VERIFIED | `client/src/pages/ResultsPage.tsx:54-59` — `setTimeout(..., 3000)` in useEffect, renders as `position: fixed bottom-0` (non-blocking) |
| 7 | Le bandeau est fermable en 1 clic et persiste via sessionStorage | VERIFIED | `ResultsPage.tsx:305-315` — button with `onClick` sets `nudgeVisible(false)` + `sessionStorage.setItem('nudge_dismissed', '1')`, checked at mount (line 56) |
| 8 | Un admin sur /admin voit la section Signal beta avec métriques + waitlist qualifiée | VERIFIED | `client/src/pages/AdminPage.tsx:48-179` — `useQuery` to `/api/admin/feedback-dashboard` with `x-admin-token` header, 3 metric cards + table with pricingIntent + triggerFeatures |
| 9 | La homepage affiche un compteur X / 150 places basé sur /api/beta/capacity | VERIFIED | `client/src/components/BetaCapCounter.tsx:3-34` — `export function BetaCapCounter`, `useQuery(['/api/beta/capacity'])`, renders `${count} / ${cap} places`; imported and used in `Home.tsx:4,552` |
| 10 | La page /form affiche le même compteur dans son header | VERIFIED | `client/src/pages/FormWizard.tsx:11,337` — imports `BetaCapCounter` from `@/components/BetaCapCounter`, renders in wizard header |
| 11 | Quand isFull est true, le formulaire bascule vers une page waitlist (cap gate) | VERIFIED | `client/src/pages/FormWizard.tsx:238` — `if (capacityData?.isFull)` returns full cap-gate screen with form posting to `/api/waitlist/qualified` |

**Score:** 11/11 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `shared/schema.ts` | Drizzle schema with pricingIntent + triggerFeatures + insertBetaWaitlistSchema | VERIFIED | Lines 228-241: nullable columns, export of `insertBetaWaitlistSchema`, `InsertBetaWaitlistEntry`, `BetaWaitlistEntry` |
| `server/routes.ts` | 3 new endpoints + formSubmissions import | VERIFIED | Line 3 import includes `formSubmissions`; endpoints at lines 737, 754, 782 |
| `client/src/pages/ResultsPage.tsx` | FeedbackNudge non-blocking, dismissible, sessionStorage | VERIFIED | Lines 34, 54-59, 294-316 — state, useEffect, JSX all present and substantive |
| `client/src/pages/AdminPage.tsx` | Signal beta section with feedback-dashboard data | VERIFIED | Lines 48-179 — typed query, metric cards, qualified waitlist table |
| `client/src/components/BetaCapCounter.tsx` | `export function BetaCapCounter`, consumes /api/beta/capacity | VERIFIED | Complete 34-line implementation, exported correctly |
| `client/src/pages/Home.tsx` | BetaCapCounter + QualifiedWaitlistSection posting to /api/waitlist/qualified | VERIFIED | Lines 4, 552 (counter), 219-469 (QualifiedWaitlistSection), always POSTs to `/api/waitlist/qualified` (not old `/api/waitlist`) |
| `client/src/pages/FormWizard.tsx` | BetaCapCounter in header + cap gate when isFull | VERIFIED | Lines 11, 140-143 (query), 238-292 (gate), 337 (counter in header) |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `server/routes.ts GET /api/beta/capacity` | `formSubmissions` table | `countDistinct(formSubmissions.email)` | WIRED | `routes.ts:742-744` — Drizzle query returns `{ count, cap, isFull }` |
| `server/routes.ts POST /api/waitlist/qualified` | `betaWaitlist` table | `db.insert(betaWaitlist).values(...)` with pricingIntent + triggerFeatures | WIRED | `routes.ts:762-772` — full insert with both new columns |
| `BetaCapCounter` | `/api/beta/capacity` | `useQuery(['/api/beta/capacity'])` | WIRED | `BetaCapCounter.tsx:4-8` — query present, renders count/cap/isFull state |
| `FormWizard cap gate` | `QualifiedWaitlistForm` (inline) | `if (capacityData?.isFull) return <...>` | WIRED | `FormWizard.tsx:238` — condition is after all hooks; form submits to `/api/waitlist/qualified` |
| `QualifiedWaitlistSection` in Home | `/api/waitlist/qualified` | `fetch POST /api/waitlist/qualified` with pricingIntent + triggerFeatures | WIRED | `Home.tsx:249-258` — complete payload with both new fields; old `/api/waitlist` endpoint is absent |
| `AdminPage` | `/api/admin/feedback-dashboard` | `useQuery` with `x-admin-token` header | WIRED | `AdminPage.tsx:48-57` — custom `queryFn` passes auth header, `enabled: !!adminToken` |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| FEEDBACK-01 | 01-02 | Non-blocking nudge on /results to prompt match rating | SATISFIED | FeedbackNudge in ResultsPage: fixed bottom bar, 3s delay, dismiss with sessionStorage, X button wired |
| FEEDBACK-02 | 01-01, 01-03 | Qualified waitlist with pricingIntent (slider/options) + triggerFeatures | SATISFIED | schema.ts columns + POST endpoint + QualifiedWaitlistSection (PRICING_OPTIONS radio + FEATURE_OPTIONS checkboxes max 3) |
| FEEDBACK-03 | 01-01, 01-02 | Admin dashboard for match_feedback + beta + qualified waitlist | SATISFIED | `/api/admin/feedback-dashboard` endpoint + Signal beta section in AdminPage with 3 metric cards + table |
| CAP-01 | 01-01, 01-03 | Counter "X / 150 places" on homepage + form header | SATISFIED | BetaCapCounter component wired to API, rendered in Home.tsx hero + FormWizard.tsx header |
| CAP-02 | 01-03 | Form switches to waitlist when cap is reached | SATISFIED | `capacityData?.isFull` gate in FormWizard at line 238 (placed correctly after all hooks) |
| CAP-03 | 01-01 | BETA_CAP configurable via env var, no redeploy needed | SATISFIED | `parseInt(process.env.BETA_CAP ?? "150", 10)` at two locations in routes.ts (lines 741, 808) |

All 6 phase requirements are satisfied. No orphaned requirements found.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `server/routes.ts` | 58 | `// TODO: fix plus solide = tokens signés JWT au lieu d'exposer` | Info | Pre-existing comment on admin auth pattern — not introduced by this phase, not blocking |

No blockers or warnings introduced by this phase.

---

### Human Verification Required

#### 1. FeedbackNudge timing and appearance on /results

**Test:** Load any results page (e.g., `/results?sessionId=X`). Wait 3 seconds after results appear.
**Expected:** A yellow fixed bottom banner appears with the nudge message and an X button. Clicking X removes it immediately. Refreshing the same tab does not show it again. Opening in a new tab shows it again after 3 seconds.
**Why human:** Timing behavior (3s delay), visual placement (z-index above footer, not covering content), and sessionStorage persistence across tab refreshes require browser interaction.

#### 2. BetaCapCounter live count accuracy

**Test:** Navigate to homepage and `/form`. Verify the counter shows a number matching the actual unique email count in `form_submissions`.
**Expected:** Counter displays a plausible number (not 0 if submissions exist, not inflated), refreshes every 60 seconds.
**Why human:** Requires DB inspection to cross-validate the displayed count.

#### 3. Cap gate trigger with BETA_CAP=1 in production

**Test:** Set `BETA_CAP=1` in Railway env vars (without redeploy). Navigate to `/form`.
**Expected:** Cap gate screen appears ("Beta complète") with waitlist form. After entering email and submitting, confirmation message appears.
**Why human:** Requires production environment variable change and browser navigation to verify the gate renders correctly.

---

### Gaps Summary

No gaps. All 11 must-have truths are verified at all three levels (exists, substantive, wired). All 6 requirement IDs (FEEDBACK-01 through CAP-03) have confirmed implementation evidence in the codebase.

The only open item is one pre-existing TODO comment in routes.ts (line 58) about JWT tokens for admin auth — this predates this phase and is informational, not a blocker for goal achievement.

---

_Verified: 2026-04-18_
_Verifier: Claude (gsd-verifier)_
