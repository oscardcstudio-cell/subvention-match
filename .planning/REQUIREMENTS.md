# Requirements: SubventionMatch

**Defined:** 2026-04-18
**Core Value:** Un artiste reçoit en < 3 minutes une liste courte d'aides réellement pertinentes pour son profil.

## v1.1 Requirements — Validation signal beta

Milestone opérationnel : collecter du signal pour décider go/no-go sur la suite. Pas de build de features V2 ici.

### Feedback & Signal

- [x] **FEEDBACK-01**: User voit un nudge discret (non-bloquant, skippable) proposant de noter la pertinence des matches après les résultats
- [x] **FEEDBACK-02**: User peut rejoindre une waitlist qualifiée en indiquant (a) quelles features il paierait, (b) combien €/mois (slider ou options)
- [x] **FEEDBACK-03**: Admin peut consulter un dashboard minimal des feedbacks collectés (match + beta + waitlist qualifiée)

### Cap & Scarcity

- [x] **CAP-01**: Compteur "X / 150 places" visible sur homepage + header du formulaire, basé sur emails uniques en DB  *(API ready — UI plan 01-03)*
- [x] **CAP-02**: Quand le cap est atteint, le formulaire bascule sur la waitlist et affiche un état "beta complète"
- [x] **CAP-03**: Le cap est configurable via variable d'env `BETA_CAP` (défaut 150), sans redeploy nécessaire pour changer la valeur en prod

### Growth & Recruitment

- [ ] **GROWTH-01**: Founder dispose d'un template de post réutilisable (variantes Reddit FR / Facebook groupes / LinkedIn) et d'un pitch landing dédié
- [ ] **GROWTH-02**: 50 vrais users supplémentaires recrutés via canaux ciblés sur la durée du milestone (objectif ~75-80 uniques total)
- [ ] **GROWTH-03**: Sources d'acquisition trackées (param UTM ou `source` en DB) pour savoir quel canal convertit

### Research & Decision

- [ ] **RESEARCH-01**: 5 entretiens qualitatifs 30min menés avec users cibles (priorité : multi-rôles, entrepreneurs culturels, intermittents)
- [ ] **RESEARCH-02**: Synthèse écrite des entretiens + métriques quanti (NPS maison, intention de payer, complétion, retention) dans `.planning/strategy/VALIDATION-REPORT.md`
- [ ] **RESEARCH-03**: Décision documentée go/no-go (continuer sur prospecting V2 / pivoter / lâcher) avec critères quanti + quali explicites

## v2 Requirements — Post-validation (si go)

Déférés, pas dans ce milestone.

### Prospecting élargi (blue ocean Path 3)

- **PROSP-01**: Module prospecting privé (agents, galeries, labels, éditeurs) — 30 acteurs par discipline en MVP
- **PROSP-02**: Score "adéquation carrière" (émergent/confirmé/consolidation) au-delà de l'éligibilité
- **PROSP-03**: Élargissement cible "industrie culturelle" (entrepreneur, freelance, intermittent)

### Monétisation

- **MONEY-01**: Tier Pro payant (8-15€/mois) — matching illimité + PDF + suivi
- **MONEY-02**: Tier Carrière (30-50€/mois) — prospecting privé + post-attribution
- **MONEY-03**: Offre institution B2B2C (écoles, sociétés d'auteurs)

### Post-attribution (blue ocean Path 4)

- **POST-01**: Rappels rapport d'activité
- **POST-02**: Templates bilan / renouvellement

## Out of Scope

| Feature | Reason |
|---------|--------|
| Gros redesign post-résultats UX | Retours partagés, statuer après les 5 entretiens |
| Fin du beta gratuit / paiement réel | Waitlist qualifiée suffit pour sonder l'intention |
| Scraper de nouveaux dispositifs | 877 grants suffisent pour valider le signal ; ajouter du volume = bruit |
| Refonte prompt DeepSeek | Quality gate + enrichissement actuels suffisent pour ce milestone |
| Intégration avec outils tiers (Notion, Airtable…) | Hors scope validation signal |
| Entretiens users > 5 | Diminishing returns sur 3 semaines ; concentrer sur qualité de synthèse |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FEEDBACK-01 | Phase 1 | Complete |
| FEEDBACK-02 | Phase 1 | Complete (01-01) |
| FEEDBACK-03 | Phase 1 | Complete (01-01) |
| CAP-01 | Phase 1 | API ready (01-01), UI pending (01-03) |
| CAP-02 | Phase 1 | Complete |
| CAP-03 | Phase 1 | Complete (01-01) |
| GROWTH-01 | Phase 2 | Pending |
| GROWTH-02 | Phase 2 | Pending |
| GROWTH-03 | Phase 2 | Pending |
| RESEARCH-01 | Phase 3 | Pending |
| RESEARCH-02 | Phase 3 | Pending |
| RESEARCH-03 | Phase 3 | Pending |

**Coverage:**
- v1.1 requirements: 12 total
- Mapped to phases: 12
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-18*
*Last updated: 2026-04-19 after 01-01 execution (FEEDBACK-02, FEEDBACK-03, CAP-03 complete)*
