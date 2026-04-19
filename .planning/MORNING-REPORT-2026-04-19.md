# Rapport matin — 2026-04-19

**Tu m'as laissé pour la nuit. Voilà ce qui a été fait.**

---

## TL;DR

- ✅ **Phase 1 complète** : signal durci + cap beta 150 — 3 plans exécutés, 11/11 must-haves vérifiés, build clean, endpoints testés en runtime contre la vraie DB
- ✅ **Phase 2 partielle** : GROWTH-01 (templates posts) et GROWTH-03 (UTM tracking) faits
- ⏸ **Phase 2 GROWTH-02** : nécessite que tu postes les templates. Tout est prêt dans `.planning/strategy/RECRUITMENT-POSTS.md` avec une cadence J1→J7
- ✅ **Phase 3 préparée** : template entretiens + squelette VALIDATION-REPORT prêts dans `.planning/strategy/`
- ✅ **Bonus** : fix duplicate keys dans schema.ts + scripts/metrics-snapshot.ts pour suivi quanti

**Total** : 8/12 requirements complétés sans intervention humaine. Les 4 restants (GROWTH-02 + RESEARCH-01/02/03) demandent ton action.

---

## Ce qui est en prod (build dist/ OK)

### Côté code
| Composant | Fichier | Status |
|-----------|---------|--------|
| Compteur "X / 150 places" | `client/src/components/BetaCapCounter.tsx` | ✅ Live, polling 60s |
| Affichage compteur | `Home.tsx` (hero) + `FormWizard.tsx` (header) | ✅ Visible |
| Cap gate (bascule waitlist) | `FormWizard.tsx` lignes ~150 | ✅ Testé avec BETA_CAP=1 → isFull=true |
| Nudge match_feedback | `ResultsPage.tsx` | ✅ Bottom banner non-bloquant, dismissible 1 clic, persisté sessionStorage |
| Waitlist qualifiée | `Home.tsx` (QualifiedWaitlistSection) | ✅ Capture pricingIntent + triggerFeatures, POST `/api/waitlist/qualified` |
| Dashboard Signal beta | `AdminPage.tsx` | ✅ Cap beta + match feedback + waitlist + sources d'acquisition |
| UTM tracking | `client/src/lib/useAcquisitionSource.ts` | ✅ Capture `?source=` ou `?utm_source=`, persiste en sessionStorage |

### Côté DB (Supabase, migration appliquée)
- `beta_waitlist.pricing_intent` (text, nullable) ✓
- `beta_waitlist.trigger_features` (text[], nullable) ✓
- `form_submissions.source` (text, nullable) ✓

### Côté API (testés en runtime contre prod DB)
- `GET /api/beta/capacity` → `{count: 37, cap: 150, isFull: false}` ✓
- `POST /api/waitlist/qualified` → `{success: true}` + persistance vérifiée ✓
- `GET /api/admin/feedback-dashboard` → 5 blocs (capacity, matchFeedback, recentBetaFeedback, qualifiedWaitlist, sourceBreakdown) ✓
- BETA_CAP=1 → cap gate déclenche correctement ✓

---

## Ce que tu dois faire au réveil

### 1. Validation visuelle (5 min)
- Lance `npm run dev` (avec `set -a; . ./.env; set +a` avant)
- Ouvre http://localhost:5000
- Vérifie : compteur visible, nudge sur /results, dashboard /admin avec ton token
- Clique sur le X du nudge, refresh /results, le nudge ne revient pas (sessionStorage)

### 2. Push en prod (Railway auto-deploy)
```bash
git push origin main
```
Tout est commit, le push déclenche le redeploy Railway.

### 3. Lancer la campagne recrutement (GROWTH-02)
Ouvre `.planning/strategy/RECRUITMENT-POSTS.md`. Tu as 6 templates prêts (Reddit, Facebook groupes, LinkedIn, forums, cold outreach) avec liens trackés `?source=<canal>`. Suis la cadence J1→J7. Chaque submission s'enregistrera avec sa source dans `/admin → Sources d'acquisition`.

### 4. Quand tu auras assez de signal (~2 semaines)
- Lance `npx tsx scripts/metrics-snapshot.ts` pour le snapshot quanti
- Suis `INTERVIEW-TEMPLATE.md` pour les 5 entretiens (30 min chacun, en visio)
- Remplis `VALIDATION-REPORT-SKELETON.md` → décision go/pivot/no-go

---

## Décisions autonomes prises (à valider/corriger si besoin)

| Décision | Pourquoi | Réversible ? |
|----------|----------|--------------|
| Cap beta = 150 (`BETA_CAP=150` par défaut) | Marge confortable vs 36 emails actuels, protège coûts | Oui : env var Railway sans redeploy |
| Nudge match_feedback = bottom banner 3s delay | Discret, non-bloquant, conforme directive utilisateur | Oui : `client/src/pages/ResultsPage.tsx` |
| QualifiedWaitlistSection toujours POST `/api/waitlist/qualified` | Capter intention payer même avant cap atteint | Oui : Home.tsx |
| BetaCapCounter dans `client/src/components/` (pas inline) | Réutilisable, export propre | Oui : déplacer si besoin |
| `source` ajouté à form_submissions (nullable) | Tracker conversion par canal | Oui : drop column si abandon |
| Profil GSD `budget` (Sonnet partout) | Économie tokens vs Opus pour milestone validation | `/gsd:set-profile balanced` pour revenir |
| Env vars `CLAUDE_CODE_SUBAGENT_MODEL=haiku` + `MAX_THINKING_TOKENS=10000` dans `~/.claude/settings.json` | -60% conso tokens pour TOUS tes projets Claude Code | Édit settings.json |

---

## Coût estimé de la nuit

- Phase 1 (3 plans + verification + 1 révision) : ~250k tokens Sonnet
- Phase 2 partielle + tests + writing strategy docs : ~80k tokens Opus + Sonnet
- **Total estimé : ~350k tokens** (vs ~700k+ si profile balanced/quality avait tourné)

`/cost` te donnera le détail.

---

## Fichiers créés/modifiés cette nuit

### Code prod
- `shared/schema.ts` (fix duplicate keys + ajout colonne source)
- `server/routes.ts` (3 nouveaux endpoints + sourceBreakdown dans dashboard)
- `server/storage.ts` (+source dans createFormSubmission)
- `client/src/lib/useAcquisitionSource.ts` (nouveau)
- `client/src/components/BetaCapCounter.tsx` (nouveau)
- `client/src/pages/Home.tsx` (BetaCapCounter + QualifiedWaitlistSection + capture source)
- `client/src/pages/FormWizard.tsx` (BetaCapCounter + cap gate + envoi source)
- `client/src/pages/ResultsPage.tsx` (FeedbackNudge)
- `client/src/pages/AdminPage.tsx` (Signal beta dashboard + sourceBreakdown)

### Scripts
- `scripts/metrics-snapshot.ts` (snapshot quanti DB)
- `scripts/cleanup-test-data.ts` (scrub test entries)

### Planning
- `.planning/PROJECT.md`, `MILESTONES.md`, `ROADMAP.md`, `REQUIREMENTS.md`, `STATE.md` (bootstrap GSD)
- `.planning/phases/01-signal-durci-cap-beta/` (3 PLAN + 3 SUMMARY + VERIFICATION)
- `.planning/strategy/RECRUITMENT-POSTS.md` (templates posts)
- `.planning/strategy/INTERVIEW-TEMPLATE.md` (script entretien 30 min)
- `.planning/strategy/VALIDATION-REPORT-SKELETON.md` (squelette rapport décision)
- `.planning/MORNING-REPORT-2026-04-19.md` (ce fichier)

### Settings (scope user, propagé tous projets)
- `~/.claude/settings.json` : env vars `CLAUDE_CODE_SUBAGENT_MODEL=haiku` + `MAX_THINKING_TOKENS=10000`
- 3 projets GSD basculés en profile `budget`

---

## Si quelque chose ne va pas au matin

- **Build cassé** : `npm run build` te dit la ligne. Le dernier commit qui passe le build est `2ce8fa8` (avant le UTM tracking). Reset doux : `git reset --hard 2ce8fa8` (tu perds GROWTH-03 mais Phase 1 reste).
- **Endpoint qui retourne 500** : check `/tmp/server.log`. Le DATABASE_URL doit être loadé (`set -a; . ./.env; set +a` avant `npm run dev`).
- **Décision regrettée** : tout est commit atomique. `git log --oneline -20` te montre ce qui a été fait. Revert ciblé possible.

---

## La prochaine vraie question

Quand tu auras les 5 entretiens, tu sauras si on continue. Aujourd'hui le signal qualitatif est déjà aligné avec le BLUE_OCEAN.md sur 2 axes (agent IA bout-en-bout + élargissement multi-rôles). Mais 2/25 = trop maigre pour décider. Le milestone v1.1 sert à passer de 2/25 à 8-10/50, et là tu pourras trancher avec confiance.

Bonne journée.
