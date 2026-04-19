# Roadmap: SubventionMatch

## Milestones

- ✅ **v1.0 Beta Launch** - Shipped 2026-04-16 (hors flow GSD)
- 🚧 **v1.1 Validation signal beta** - Phases 1-3 (in progress)

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Décision go/no-go à prendre sur 2-3 semaines. Milestone opérationnel, pas feature-driven.

- [x] **Phase 1: Signal durci + cap beta** - Instrumenter l'app pour capter intention et protéger coûts
- [ ] **Phase 2: Campagne recrutement** - +50 vrais users via canaux FR ciblés avec tracking source
- [ ] **Phase 3: Synthèse & décision** - 5 entretiens quali + rapport + décision go/no-go argumentée

## Phase Details

### Phase 1: Signal durci + cap beta
**Goal**: Instrumenter l'app pour capter l'intention utilisateur (match_feedback + waitlist qualifiée) et poser un cap beta 150 avec compteur visible et bascule automatique vers waitlist.
**Depends on**: Nothing (first phase)
**Requirements**: FEEDBACK-01, FEEDBACK-02, FEEDBACK-03, CAP-01, CAP-02, CAP-03
**Success Criteria** (what must be TRUE):
  1. Un user qui arrive sur /results voit un nudge non-bloquant (skippable en 1 clic) pour noter les matches, et le taux d'utilisation de match_feedback dépasse 10 % sur les nouvelles submissions
  2. La waitlist capture email + intention de payer (€/mois) + feature(s) déclencheuse(s) du paiement
  3. Homepage et header du formulaire affichent "X / 150 places" en temps réel basé sur count(distinct email) de form_submissions
  4. Quand BETA_CAP est atteint (testé via BETA_CAP=1 en staging), le form bascule automatiquement sur la waitlist sans régression
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Schema Drizzle étendu + 3 endpoints API (capacity, waitlist qualifiée, admin dashboard)
- [x] 01-02-PLAN.md — Nudge match_feedback sur ResultsPage + section Signal beta dans AdminPage
- [x] 01-03-PLAN.md — BetaCapCounter (Home + FormWizard) + QualifiedWaitlistSection + cap gate

### Phase 2: Campagne recrutement
**Goal**: Recruter +50 vrais users via canaux ciblés (groupes Facebook, Reddit FR, LinkedIn, forums spécialisés) avec tracking de la source d'acquisition.
**Depends on**: Phase 1
**Requirements**: GROWTH-01, GROWTH-02, GROWTH-03
**Success Criteria** (what must be TRUE):
  1. Un template de post founder-friendly existe, testé sur au moins 2 variantes (Reddit vs Facebook) avec pitch adapté au canal
  2. Chaque submission enregistre sa source d'acquisition (param UTM source capturé côté client, stocké en DB)
  3. +50 nouveaux users uniques recrutés dans la fenêtre du milestone (total ~75-80 uniques), vérifié via count(distinct email) post-campagne
  4. Un récap compare les canaux : submissions / canal, taux de complétion, taux de paiement beta
**Plans**: TBD

Plans:
- [ ] 02-01: TBD

### Phase 3: Synthèse & décision
**Goal**: Mener 5 entretiens qualitatifs ciblés, consolider quanti + quali, publier une décision go/no-go argumentée.
**Depends on**: Phase 2
**Requirements**: RESEARCH-01, RESEARCH-02, RESEARCH-03
**Success Criteria** (what must be TRUE):
  1. 5 entretiens 30 min menés avec des users cibles (priorité multi-rôles / entrepreneurs culturels / intermittents), notes brutes archivées
  2. Rapport .planning/strategy/VALIDATION-REPORT.md publié avec métriques quanti + synthèse quali + citations + alignement BLUE_OCEAN.md
  3. Décision explicite go / pivot / no-go documentée avec critères chiffrés (seuils définis AVANT les entretiens pour éviter le biais de confirmation)
  4. Si "go" : identification des features V2 prioritaires avec REQ-IDs draft pour la milestone v1.2
**Plans**: TBD

Plans:
- [ ] 03-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Signal durci + cap beta | v1.1 | 1/3 | In progress | - |
| 2. Campagne recrutement | v1.1 | 0/TBD | Not started | - |
| 3. Synthèse & décision | v1.1 | 0/TBD | Not started | - |
