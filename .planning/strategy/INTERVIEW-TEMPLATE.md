# Template entretien qualitatif — 30 min

**Objectif** : valider/invalider 4 hypothèses produit avant la décision go/no-go.
**Format** : visio 30 min, questions ouvertes, ne PAS pitcher.
**Prio recrutement** : multi-rôles (musicien-producteur, écrivain-illustrateur), entrepreneurs culturels, intermittents qui jonglent avec auto-entreprise.

---

## Hypothèses à tester

| H | Description | Critère de validation |
|---|-------------|----------------------|
| H1 | Le matching IA est ressenti comme pertinent (au-delà du wow effect) | 3/5 user citent au moins 1 aide qu'ils n'auraient pas trouvée seuls |
| H2 | Le PDF dossier a une valeur réelle (pas juste un bonus marketing) | 3/5 disent qu'ils l'utiliseraient ou l'ont utilisé |
| H3 | Élargir aux opportunités privées (agents/galeries/labels) résonne | 3/5 valident sans qu'on les pousse, ou disent "ah ouais ça me parle" |
| H4 | Intention de payer existe entre 5 et 30€/mois | 3/5 disent "oui" ou "peut-être" à un montant dans cette fourchette |

---

## Script entretien (30 min)

### 1. Mise en confiance — 3 min
- "Merci de prendre le temps. Pas de bonne ou mauvaise réponse, je veux juste comprendre comment tu fonctionnes."
- "Je vais enregistrer pour ne pas tout noter à la main, ok ? L'enregistrement reste perso, jamais publié."
- "Tu peux me dire en 1 minute qui tu es, ce que tu fais, et où tu en es dans ta carrière ?"

### 2. Comment tu trouves les aides aujourd'hui ? — 5 min
- "Quand tu cherches une subvention, une bourse, un appel à projet — tu fais comment concrètement ?"
- "T'as des outils, des newsletters, des potes que tu sollicites ?"
- "Dernière fois que tu en as obtenu une — tu te souviens comment tu l'as trouvée ?"
- "Si je te dis 'DRAC', 'ADAMI', 'CNC', 'Sacem' — tu as un avis sur leurs sites ?"

→ **Écouter** : pain points spontanés, frustration vs résignation, niveau de débrouille.

### 3. Test du matcher en live — 8 min
- "Ouvre mecene.cool dans ton navigateur. Je te laisse remplir le formulaire pendant que tu m'expliques ce que tu fais et ce que tu trouves bizarre / chiant / cool."
- (silence pendant qu'il/elle remplit, intervenir uniquement si bloqué)
- À la fin : "Regarde tes 3 premiers résultats. Tu en connaissais combien ? Lesquels te paraissent vraiment adaptés à ton profil ? Lesquels sont à côté de la plaque ?"

→ **H1** : noter les noms d'aides citées comme "je connaissais pas / ça me parle".

### 4. Le PDF — 3 min
- "Clique sur 'Générer le dossier PDF' pour une aide. Regarde-le."
- "À quoi ça te sert ce truc concrètement ? Tu l'utiliserais ?"
- "Si je te le supprimais, tu serais déçu·e ou tu t'en foutrais ?"

→ **H2** : noter binaire "utile / fluff" + raison.

### 5. Élargissement — 5 min
- "Si l'outil ne te proposait pas QUE des subventions publiques, mais aussi des contacts d'agents, de galeries, de labels, d'éditeurs — qui matchent ton profil — ça t'intéresserait ?"
- (laisser réagir, ne pas pousser)
- "Quelles autres opportunités tu cherches dans ton métier en plus des subventions ?"

→ **H3** : noter spontanéité + niveau d'enthousiasme.

### 6. Pricing — 3 min
- "Aujourd'hui c'est en beta gratuite. Demain, si je devais le faire payer — combien tu mettrais MAX par mois pour avoir cet outil ?"
- (laisser répondre, ne pas suggérer)
- "Et qu'est-ce qui te ferait passer à l'acte de payer plutôt que de rester sur la version gratuite ?"

→ **H4** : noter le montant + le déclencheur.

### 7. Questions ouvertes — 3 min
- "Si tu pouvais ajouter UNE feature à cet outil, ce serait quoi ?"
- "Tu connaîtrais des amis artistes à qui tu en parlerais ?"
- "Une dernière chose qu'on n'a pas évoqué et que tu veux dire ?"

---

## Grille d'analyse post-entretien (à remplir 5 min après)

```yaml
user_id: [prenom-discipline-statut]
date: YYYY-MM-DD
duration_min: 30

# Citations marquantes (verbatim, au moins 3)
citations:
  - "[citation 1]"
  - "[citation 2]"
  - "[citation 3]"

# Évaluation hypothèses (validate / invalidate / unclear)
hypotheses:
  H1_matching_pertinent: validate | invalidate | unclear
  H2_pdf_utile: validate | invalidate | unclear
  H3_elargissement_resonne: validate | invalidate | unclear
  H4_intention_payer_5_30: validate | invalidate | unclear

# Surprises (ce qui n'était pas attendu)
surprises:
  - [surprise 1]

# Pain points cités spontanément
pain_points:
  - [pain 1]

# Features demandées
feature_requests:
  - [feature 1]

# Pricing déclaré (€/mois max)
pricing_max: 0

# Verdict global
verdict: enthousiaste | tiède | sceptique
recontact_post_v2: yes | no
```

---

## Logistique

- **Recrutement** : DM aux 5 power users de la DB (`oscarinternship`, etc. exclus car tests) + 5 nouveaux users de la campagne phase 2.
- **Outil** : Google Meet ou Whereby. Enregistrer audio (avec consentement explicite).
- **Cadence** : 2 entretiens/jour max sur 3 jours. Pause d'au moins 1 jour entre cadence et synthèse.
- **Compensation** : 20€ de carte cadeau Decitre/Fnac si l'entretien dure 30 min — symbolique mais montre que le temps est valorisé. Optionnel : on peut tester d'abord sans, ajouter si refus.

---

*Created: 2026-04-19 (autonomous overnight prep)*
