# STATE

## Current Position

Phase: 01-signal-durci-cap-beta
Plan: 01-03 complete (phase done — all 3 plans executed)
Status: Phase complete — awaiting go/no-go signal (GROWTH + RESEARCH plans)
Last activity: 2026-04-19 — 01-03 (BetaCapCounter + QualifiedWaitlist + cap gate) complete

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
- [01-02] FeedbackNudge intégré dans ResultsPage (3s delay, sessionStorage dismissal). Section Signal beta dans AdminPage (3 métriques + tableau waitlist qualifiée).
- [01-03] BetaCapCounter + QualifiedWaitlistSection sur la homepage. Cap gate dans FormWizard. Tous les endpoints /api/waitlist/qualified.

## Decisions

- [01-01] countDistinct(formSubmissions.email) pour le comptage beta — pas de table de comptage dédiée
- [01-01] BETA_CAP depuis process.env avec fallback 150 — configurable depuis Railway sans redéploiement
- [01-01] Colonnes pricingIntent/triggerFeatures nullable sans DEFAULT — rétro-compatible avec 50 enregistrements existants
- [01-01] waitlistLimiter partagé entre /api/waitlist et /api/waitlist/qualified
- [01-02] adminToken lu depuis localStorage + URLSearchParams au init du composant — pas de Context pour éviter un refactor de l'auth admin existante
- [01-02] nudge useEffect dépend de results.length (pas data) — évite le retriggering si la référence d'objet change
- [01-03] BetaCapCounter hidden md:inline-flex dans FormWizard header — évite le surencombrement mobile
- [01-03] QualifiedWaitlistSection lit sa propre capacityData query (pas de prop isFull) — couplage propre
- [01-03] Cap gate FormWizard : formulaire email uniquement (pas pricing/features) — friction minimale à la porte

## Pending Todos

- ~~FEEDBACK-01 : nudge match_feedback post-résultats (plan 01-02)~~ DONE
- ~~CAP-01/02/03 : compteur + waitlist qualifiée + cap gate (plan 01-03)~~ DONE
- GROWTH-01 / GROWTH-02 : template post + recrutement +50 users
- RESEARCH-01 / RESEARCH-02 : 5 entretiens + synthèse go/no-go

## Blockers

Aucun.
