# Sources à scraper — Audit couverture (2026-04-18)

État actuel : **594 grants actives** après dédup + normalisation. Scrapers
dédiés : ADAMI, CNM, SACEM, SPEDIDAM, Ministère Culture, MonProjetMusique.
API : Aides-Territoires (source principale). Imports ponctuels : Arts Council
England, EU Funding.

## Gaps identifiés, par priorité

### 🔴 Priorité 1 — domaines sous-représentés

**Arts plastiques & visuels (69 grants)**
- [ ] **FRAC** — 22 Fonds Régionaux d'Art Contemporain, chacun a ses propres
  dispositifs (acquisition, résidence, production). Peu/pas couverts par AT.
- [ ] **Maison des Artistes** — aides sociales et bourses spécifiques MdA.
- [ ] **ADAGP** — aides aux auteurs d'art visuel (diffusion, production).
- [ ] **Fondation d'entreprise Ricard** — prix de la jeune création.
- [ ] **Prix / bourses privés** : Fondation Pernod Ricard, Cartier, LVMH,
  Galeries Lafayette, Fondation Antoine de Galbert.

**Arts numériques (77 grants — mais souvent en intersection avec audiovisuel)**
- [ ] **DICRéAM** — dispositif multimédia (CNC / Ministère Culture).
- [ ] **CNC fonds numériques** : XR, VR, jeu vidéo, animation interactive
  (peut-être déjà dans CNC scraper, à vérifier).
- [ ] **Paris Région Lab / Bpifrance** pour tech/culture.

### 🟡 Priorité 2 — grands absents génériques

**Fondations privées (très peu couvertes)**
- [ ] **Fondation de France** — mécénat culturel transversal.
- [ ] **Fondation Daniel & Nina Carasso** — alimentation durable + art
  citoyen (intersection socio-artistique).
- [ ] **Fondation BNP Paribas** — arts, patrimoine, spectacle vivant.
- [ ] **Fondation La Poste** — écriture épistolaire, musique vocale.
- [ ] **Fondation Jean-Luc Lagardère** — 10 bourses arts/médias/écriture.
- [ ] **Institut de France** — prix Académies (beaux-arts, sciences).

**International / Mobilité**
- [ ] **Institut français** — Villa Albertine (US), Villa Kujoyama (Japon),
  résidences arts & création croisés.
- [ ] **Bureau Export** (musique + audiovisuel export).
- [ ] **Programme Erasmus+ Culture**.
- [ ] **Europe Créative** : MEDIA, Culture, Cross-Sectoral — actuellement 1
  seule ligne en DB.
- [ ] **Casa de Velázquez**, **Villa Médicis**, **Académie de France à Rome**.
- [ ] **Pro Helvetia** (collabs Suisse), **British Council**, **Goethe-Institut**
  (collabs allemandes).

### 🟢 Priorité 3 — complément sectoriel

**Musique (168 déjà, mais compléter)**
- [ ] **FCM (Fonds de Création Musicale)** — absent.
- [ ] **AFDAS / FONPEPS** — formation/structuration artistes intermittents.
- [ ] **SOFIA** — bourses traduction (partiel, 1 ligne).
- [ ] **Scène SMAC** — DRAC régionales spécifiques musiques actuelles.

**Spectacle vivant (84 grants)**
- [ ] **CND (Centre National de la Danse)** — bourses, résidences, aide création.
- [ ] **ARCADI Île-de-France** — si encore actif après restructuration.
- [ ] **CnT (Centre national du Théâtre)** — fusionné avec Artcena : vérifier.
- [ ] **ONDA** (1 ligne) — à compléter avec tous les dispositifs.

**Audiovisuel (158 grants via CNC — bien couvert)**
- [ ] **Procirep–Angoa** — fonds aides producteurs/documentaire/création.
- [ ] **SCAM** bourses Brouillon d'un rêve (doc, écritures).
- [ ] **SACD** bourses auteurs dramatique / audiovisuel.

**Livre / écriture (111 grants — CNL bien, reste partiel)**
- [ ] **SGDL** — bourses auteurs (romans, récits, essai).
- [ ] **Résidences d'auteurs** régionales (diffuses, mal agrégées).

### 🔵 Priorité 4 — agrégateurs / méta-sources

- [ ] **Artcena** — base de données spectacle vivant (annuaire aides).
- [ ] **Profession Spectacle** — aides spectacle vivant.
- [ ] **Cultural Funding Index / Cultura Europa** — aides paneuropéennes.
- [ ] **Artfacts / e-flux** — prix et résidences internationaux.

## Recommandations techniques

1. **Avant de créer de nouveaux scrapers**, relancer les scrapers existants
   (ADAMI, CNM, SACEM, SPEDIDAM) pour vérifier qu'ils sont à jour. Ils
   auraient pu omettre de nouveaux dispositifs.
2. **Fondations privées** : pas d'API, donc Puppeteer + parsing manuel par
   foundation. 1 scraper par foundation (≤ 20 lignes de dispositifs chacune).
3. **Europe Créative** : l'EACEA a une API `/funding/tenders-opportunities`
   — préférer l'API au scraping HTML.
4. **FRAC régionaux** : 22 sites hétérogènes. Commencer par les plus actifs
   (FRAC IdF, FRAC PACA, FRAC Occitanie, FRAC Grand Est).

## Estimation d'effort (nouveau contenu)

| Source | Grants estimées | Effort scraper |
|---|---|---|
| Fondation de France | 5–10 | 1 jour |
| Fondations privées top-10 | 30–50 | 2–3 jours |
| FRAC (x5) | 15–25 | 2 jours |
| Institut français (Villas) | 8–12 | 1 jour |
| Europe Créative (API) | 30–60 | 1 jour |
| CND / ONDA / SCAM / SACD / Procirep | 20–30 | 1 jour |
| DICRéAM / CNC numérique | 5–10 | 0.5 jour |

Cible : passer de 594 à ~800 grants avec une vraie diversité sectorielle.
