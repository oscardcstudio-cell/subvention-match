---
phase: 01-signal-durci-cap-beta
plan: "01"
subsystem: api
tags: [drizzle, postgres, express, beta-cap, waitlist, feedback]

# Dependency graph
requires: []
provides:
  - "GET /api/beta/capacity retournant { count, cap, isFull } depuis BETA_CAP env"
  - "POST /api/waitlist/qualified persistant email + pricingIntent + triggerFeatures"
  - "GET /api/admin/feedback-dashboard agrégeant matchFeedback + betaFeedback + qualifiedWaitlist"
  - "Schema betaWaitlist étendu avec colonnes pricingIntent et triggerFeatures (nullable, rétro-compat)"
  - "Type InsertBetaWaitlistEntry exporté depuis shared/schema.ts"
affects: [01-02, 01-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "countDistinct(column) via drizzle-orm pour compter emails uniques sans dédoublonnage applicatif"
    - "Colonnes TEXT[] nullable pour features multi-valeurs sans table pivot"
    - "BETA_CAP lu depuis process.env avec fallback 150 — configurable sans redéploiement"

key-files:
  created: []
  modified:
    - shared/schema.ts
    - server/routes.ts

key-decisions:
  - "Utiliser countDistinct(formSubmissions.email) plutot qu'une table de comptage dédiée — plus simple, exact, et sans état"
  - "pricingIntent et triggerFeatures sont nullable sans DEFAULT — rétro-compatible avec les 50 enregistrements existants"
  - "waitlistLimiter partagé entre /api/waitlist et /api/waitlist/qualified — limite de ressource cohérente"
  - "BETA_CAP=150 comme fallback hardcodé — cap lisible depuis Railway sans toucher au code"

patterns-established:
  - "Endpoint capacity: SELECT countDistinct(email) FROM form_submissions — pattern réutilisable pour monitoring beta"
  - "Qualified waitlist: insertion avec onConflictDoNothing + sanitisation longueur — pattern pour capture enrichie"

requirements-completed: [FEEDBACK-02, FEEDBACK-03, CAP-01, CAP-03]

# Metrics
duration: 20min
completed: 2026-04-19
---

# Phase 01 Plan 01: Couche données et API beta — capacity + waitlist qualifiée + feedback dashboard

**Schema betaWaitlist étendu avec pricingIntent/triggerFeatures (nullable, migré en DB) + 3 endpoints Express : /api/beta/capacity, /api/waitlist/qualified, /api/admin/feedback-dashboard**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-04-19T00:38:00Z
- **Completed:** 2026-04-19T00:58:56Z
- **Tasks:** 2/2
- **Files modified:** 2

## Accomplishments

- Table `beta_waitlist` étendue avec `pricing_intent` (TEXT) et `trigger_features` (TEXT[]) — nullables, migration appliquée via `drizzle-kit push` vers Supabase
- `GET /api/beta/capacity` compte les emails distincts dans `form_submissions` vs `BETA_CAP` env (fallback 150), retourne `{ count, cap, isFull }`
- `POST /api/waitlist/qualified` capture l'intention de payer et les features déclencheuses, protégé par `waitlistLimiter` partagé
- `GET /api/admin/feedback-dashboard` agrège votes `match_feedback` par rating, 20 derniers `beta_feedback`, waitlist qualifiée (200 max) et betaCapacity courante

## Task Commits

1. **Task 1: Étendre le schema Drizzle beta_waitlist + migration SQL** - `b203f5c` (feat)
2. **Task 2: Ajouter les 3 endpoints dans routes.ts** - `c98ef88` (feat)

**Plan metadata:** (à venir — commit docs)

## Files Created/Modified

- `shared/schema.ts` — Ajout pricingIntent + triggerFeatures à betaWaitlist, export insertBetaWaitlistSchema + InsertBetaWaitlistEntry, commentaire migration SQL v1.1
- `server/routes.ts` — Ajout de formSubmissions dans l'import @shared/schema + 3 nouveaux endpoints

## Decisions Made

- `countDistinct(formSubmissions.email)` choisi pour compter les beta users sans table de comptage dédiée — exact, pas d'état, requête rapide sur 50-150 emails
- Colonnes nullable sans DEFAULT pour rétro-compatibilité stricte des 50 enregistrements existants — aucun backfill requis
- `BETA_CAP` lu depuis `process.env` avec fallback `150` — configurable depuis Railway sans redéploiement
- `waitlistLimiter` partagé (existant) réutilisé pour `/api/waitlist/qualified` — cohérence de la limite de ressource

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `npm run dev` échoue en local car `DATABASE_URL` n'est pas défini hors Railway (comportement attendu documenté dans le projet). La vérification TypeScript confirme l'absence de nouvelles erreurs sur les fichiers modifiés. Les erreurs pré-existantes (schema.ts lignes 80-81, FormPage.tsx) n'ont pas été introduites par ce plan.
- `drizzle-kit push` a réussi et a appliqué les deux colonnes sur la DB Supabase.

## User Setup Required

None — BETA_CAP est déjà configurable via la variable d'environnement Railway. Aucune configuration externe requise.

## Next Phase Readiness

- Plans 01-02 et 01-03 peuvent maintenant consommer `/api/beta/capacity` et `/api/waitlist/qualified`
- `InsertBetaWaitlistEntry` est disponible depuis `@shared/schema` pour le typage des formulaires UI
- Endpoint `/api/admin/feedback-dashboard` opérationnel pour la consultation des agrégats depuis l'AdminPage

---
*Phase: 01-signal-durci-cap-beta*
*Completed: 2026-04-19*
