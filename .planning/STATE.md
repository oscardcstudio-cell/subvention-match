# STATE

## Current Position

Phase: 01-signal-durci-cap-beta
Plan: 01-01 complete (next: 01-02)
Status: Executing — plan 01-01 done, 01-02 queued
Last activity: 2026-04-19 — 01-01 (API layer) complete

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-18)

**Core value:** Un artiste reçoit en < 3 minutes une liste courte d'aides réellement pertinentes pour son profil.
**Current focus:** Validation signal beta (go/no-go sur la suite)

## Accumulated Context

- Beta launch 2026-04-16, 50 submissions, ~25-30 vrais users au 2026-04-18.
- 14 beta_feedback capturés, 2 signaux stratégiques forts alignés avec BLUE_OCEAN.md.
- Match_feedback quasi inutilisé (1 vote sur 50) → feature à rendre visible sans forcer.
- PDF perçu comme peu utile → à investiguer dans les entretiens quali.
- Stratégie blue ocean documentée dans `.planning/strategy/BLUE_OCEAN.md` (à relire avant tout dev V2).
- Cap beta 150 retenu pour créer rareté + protéger coûts LLM/Puppeteer.
- [01-01] Couche API posée : /api/beta/capacity, /api/waitlist/qualified, /api/admin/feedback-dashboard opérationnels. betaWaitlist étendu avec pricingIntent + triggerFeatures (migré en DB).

## Decisions

- [01-01] countDistinct(formSubmissions.email) pour le comptage beta — pas de table de comptage dédiée
- [01-01] BETA_CAP depuis process.env avec fallback 150 — configurable depuis Railway sans redéploiement
- [01-01] Colonnes pricingIntent/triggerFeatures nullable sans DEFAULT — rétro-compatible avec 50 enregistrements existants
- [01-01] waitlistLimiter partagé entre /api/waitlist et /api/waitlist/qualified

## Pending Todos

- FEEDBACK-01 : nudge match_feedback post-résultats (plan 01-02)
- CAP-02 : bascule UI waitlist quand cap plein (plan 01-02 ou 01-03)
- GROWTH-01 / GROWTH-02 : template post + recrutement +50 users
- RESEARCH-01 / RESEARCH-02 : 5 entretiens + synthèse go/no-go

## Blockers

Aucun.
