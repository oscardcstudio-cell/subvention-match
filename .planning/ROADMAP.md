# Roadmap: SubventionMatch v1.1 — Validation signal beta

**Milestone:** v1.1
**Created:** 2026-04-18
**Window:** 2-3 semaines
**Goal:** Décider go/no-go sur la suite du projet en collectant du signal quanti + 5 entretiens quali.

## Phase Overview

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | Signal durci + cap beta | Instrumenter l'app pour capter intention et protéger l'emballement | FEEDBACK-01/02/03, CAP-01/02/03 | 4 |
| 2 | Campagne recrutement | +50 users via canaux ciblés FR, tracking source | GROWTH-01/02/03 | 4 |
| 3 | Synthèse & décision | 5 entretiens, rapport, décision argumentée | RESEARCH-01/02/03 | 4 |

## Phase Details

### Phase 1 — Signal durci + cap beta

**Goal:** Rendre le signal utilisable (nudge match_feedback + waitlist qualifiée) et poser le cap beta 150 avec compteur visible et bascule automatique.

**Requirements:** FEEDBACK-01, FEEDBACK-02, FEEDBACK-03, CAP-01, CAP-02, CAP-03

**Success criteria:**
1. Un user qui arrive sur `/results` voit un nudge non-bloquant (skippable en 1 clic) pour noter les matches proposés, et le taux d'utilisation du match_feedback passe au-dessus de 10 % sur les nouvelles submissions
2. La waitlist capture au minimum 3 champs qualifiés : email, intention de payer (€/mois), feature(s) qui déclencherait le paiement
3. La homepage et le header du formulaire affichent le compteur `X / 150 places` en temps réel, basé sur `count(distinct email)` dans `form_submissions`
4. Quand le cap est atteint (testé en settant `BETA_CAP=1` en staging), le form bascule automatiquement sur la waitlist sans régression

### Phase 2 — Campagne recrutement

**Goal:** Recruter +50 vrais users via canaux ciblés (Facebook groupes, Reddit FR, LinkedIn, forums spécialisés) avec tracking source.

**Requirements:** GROWTH-01, GROWTH-02, GROWTH-03

**Success criteria:**
1. Un template de post founder-friendly existe, testé sur au moins 2 variantes (Reddit vs Facebook) avec pitch adapté au canal
2. Chaque submission enregistre sa source d'acquisition (param UTM `source` capturé côté client, stocké en DB sur la submission ou sur un nouveau champ)
3. +50 nouveaux users uniques recrutés dans la fenêtre du milestone (total ~75-80 uniques), vérifié via `count(distinct email)` post-campagne
4. Un tableau récap compare les canaux : submissions / canal, taux de complétion du form, taux de paiement beta

### Phase 3 — Synthèse & décision

**Goal:** 5 entretiens qualitatifs ciblés, consolidation quanti + quali, décision go/no-go argumentée dans un document.

**Requirements:** RESEARCH-01, RESEARCH-02, RESEARCH-03

**Success criteria:**
1. 5 entretiens 30 min menés avec des users cibles (priorité multi-rôles / entrepreneurs culturels / intermittents), notes brutes archivées
2. Rapport `.planning/strategy/VALIDATION-REPORT.md` publié contenant : métriques quanti (complétion, retention, NPS maison, intention de payer), synthèse quali, citations marquantes, alignement avec BLUE_OCEAN.md
3. Décision explicite go / pivot / no-go documentée avec critères chiffrés (seuils d'acceptation définis AVANT les entretiens pour éviter le biais de confirmation)
4. Si "go" : identification des features V2 prioritaires (prospecting privé ? élargissement multi-rôles ? post-attribution ?) avec REQ-IDs draft pour la milestone v1.2

## Dependencies

- **Phase 1 → Phase 2** : la campagne de recrutement ne démarre qu'après le cap et le tracking source sont en place (sinon on rate l'attribution des sources).
- **Phase 2 → Phase 3** : les entretiens ciblent préférentiellement les users recrutés en phase 2 + les power users déjà en DB.

## Risks

- **Risque 1 : pas assez de signal** — si la campagne ramène < 20 users, la décision restera approximative. Mitigation : inclure les users existants et accepter un rapport de "signal faible, continuer 2 semaines de plus" comme verdict valide.
- **Risque 2 : biais de confirmation** — le founder veut que ça marche. Mitigation : critères go/no-go écrits AVANT les entretiens, en Phase 1.
- **Risque 3 : PDF / match_feedback restent sous-utilisés malgré le nudge** — c'est un résultat valide, pas un échec : ça informe la décision sur quoi garder/couper.

---
*Created: 2026-04-18*
