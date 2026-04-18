# SubventionMatch

## What This Is

SubventionMatch est une plateforme de matching IA entre créatifs indépendants français (musiciens, écrivains, cinéastes, plasticiens, auteurs BD…) et dispositifs de financement culturel. L'utilisateur remplit un profil, un pipeline (quality gate + DeepSeek) sélectionne les aides les plus pertinentes, génère un PDF dossier et des conseils personnalisés. Actuellement en beta gratuite (ex-prototype Replit migré vers GitHub + Railway + Supabase).

## Core Value

Un artiste reçoit en < 3 minutes une liste courte d'aides réellement pertinentes pour son profil, sans avoir à naviguer le maquis administratif.

## Requirements

### Validated

<!-- Livré en v1.0 beta (lancement 2026-04-16) — validation quantitative en cours -->

- ✓ Formulaire de profil multi-étapes (status, domaine, projet, région, contraintes) — v1.0
- ✓ Pipeline de matching IA (filtre deadline → quality gate 0-100 → DeepSeek top matches → enrichissement) — v1.0
- ✓ Catalogue ~877 dispositifs (836 actifs), alimenté par scrapers (ADAMI, CNM, Sacem, Spedidam, Ministère Culture) + Aides Territoires API + imports manuels — v1.0
- ✓ Génération PDF dossier via Puppeteer — v1.0
- ✓ Email Resend (envoi résultats) — v1.0
- ✓ Feedback beta (table `beta_feedback` + `match_feedback`) — v1.0
- ✓ Waitlist emails (table `beta_waitlist`) — v1.0
- ✓ Stripe intégré en mode beta gratuit — v1.0
- ✓ Déploiement Railway auto depuis main, Docker multi-stage avec Chromium — v1.0

### Active

<!-- Milestone v1.1 — Validation signal beta -->

- [ ] **FEEDBACK-01**: Nudge discret (non-bloquant) pour inciter au match_feedback après résultats
- [ ] **FEEDBACK-02**: Waitlist qualifiée — capturer l'intention de payer X€/mois pour quelles features
- [ ] **CAP-01**: Cap beta à 150 users uniques avec compteur "X / 150 places" visible
- [ ] **CAP-02**: Bascule automatique vers waitlist quand le cap est atteint
- [ ] **GROWTH-01**: Template de post + landing pitch pour campagne de recrutement
- [ ] **GROWTH-02**: +50 vrais users recrutés via canaux ciblés (Facebook groupes, Reddit FR, LinkedIn)
- [ ] **RESEARCH-01**: 5 entretiens qualitatifs 30min avec users cibles multi-rôles / entrepreneurs culturels
- [ ] **RESEARCH-02**: Synthèse + décision go/no-go argumentée par la data

### Out of Scope

- **Module prospecting privé (agents, galeries, labels)** — prématuré, c'est ce que ce milestone cherche à valider AVANT de construire
- **Refonte UX post-résultats** — les retours sont partagés, décider après les 5 entretiens
- **Monétisation réelle (fin du beta gratuit)** — la waitlist v1.1 sert à sonder, pas à vendre
- **Extension multi-rôles "entrepreneur/freelance/intermittent"** — signal à confirmer d'abord, build en v1.2 si go

## Context

- **Genèse** : prototype Replit migré vers stack industrielle (GitHub oscardcstudio-cell / Railway / Supabase) en avril 2026.
- **Beta launch** : 2026-04-16. Au 2026-04-18 : 50 submissions, ~25-30 vrais users uniques (hors tests).
- **Signaux qualitatifs (14 beta_feedback) — 2 alignés avec vision BLUE_OCEAN** :
  1. "L'idéal serait que l'IA fasse toutes les démarches pour toi" → valide pivot "agent de carrière"
  2. "Pouvoir faire le process en tant qu'entrepreneur/freelance/intermittent" → valide élargissement cible
- **Signaux faibles** : PDF perçu comme peu utile ; match_feedback utilisé 1 fois sur 50 (feature invisible).
- **Stratégie** : `.planning/strategy/BLUE_OCEAN.md` (Kim & Mauborgne, score actuel 4/10 → plan 10/10 via catégorie "OS du financement créatif").
- **Concurrents** : SubventIA (120€/an, asso, principal concurrent direct), MAPi (B2B entreprise cher), Aides-Territoires (gratuit, UX admin), Instrumentl (US premium).

## Constraints

- **Tech stack** : React+Vite (client), Express TS ESM (server), Drizzle ORM / Supabase Postgres, DeepSeek via OpenRouter, Puppeteer, Resend, Stripe. Railway auto-deploy main. — Défini, ne pas changer pour ce milestone.
- **Budget** : solo founder, temps limité, coûts LLM/infra à surveiller. — Le cap beta 150 protège contre l'emballement des coûts.
- **Données** : ~877 grants en DB, qualité hétérogène (URLs génériques, éligibilité vague). — Le quality gate + prompt DeepSeek compensent ; qualité matching dépend en dernier ressort du prompt.
- **Timeline milestone** : 2-3 semaines max pour statuer go/no-go. — Au-delà, fatigue founder + signal froid.
- **Taille catalogue** : rester niche qualifiée (500-800 grants de qualité > 11 000 bruités). — Position stratégique blue ocean, ne pas courir au volume.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Migration Neon → Postgres standard (Supabase) | Indépendance du provider, compatible multi-host | ✓ Good |
| Admin token fail-closed (503 si absent) | Fuite hypothétique du repo = pas de prise admin | ✓ Good |
| Beta gratuite (Stripe en mode test) | Minimiser friction pour valider signal usage avant pricing | — Pending (valider ce milestone) |
| Catalogue = niche qualifiée, pas volume brut | Éviter red ocean "11 700 aides" ; différenciation matching | — Pending |
| Cap beta 150 users en v1.1 | Créer rareté + protéger coûts + filtrer curieux | — Pending |
| Skip research pour v1.1 | Milestone opérationnel (pas feature nouvelle), BLUE_OCEAN.md déjà fait | ✓ Good |

## Current Milestone: v1.1 Validation signal beta

**Goal:** Décider go/no-go sur la suite du projet en collectant du signal qualitatif et quantitatif sur 2-3 semaines.

**Target features:**
- Collecte de signal durcie (suggestion, non-friction)
- Cap beta 150 + waitlist qualifiée
- Campagne recrutement +50 users
- 5 entretiens qualitatifs + décision argumentée

---
*Last updated: 2026-04-18 after milestone v1.1 kickoff*
