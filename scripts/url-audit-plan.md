# Brief — Audit URLs massif (pour nouvelle conversation)

## Contexte

SubventionMatch matche des utilisateurs avec 264 subventions culturelles françaises. Les URLs de ces grants sont critiques : c'est là que l'utilisateur clique pour déposer son dossier.

Problème trouvé en beta test : plusieurs grants renvoient vers une homepage générique au lieu de la page spécifique de la subvention. L'utilisateur reçoit le PDF, clique sur le lien, arrive sur `cnc.fr` au lieu de `cnc.fr/professionnels/aides-et-financements/cinema/ecriture/aide-a-lecriture-de-scenario`. Ça rend la subvention inutilisable.

## État actuel (à vérifier au début de la session)

Lancer d'abord pour avoir les chiffres à jour :
```bash
set -a && source .env && set +a && node scripts/audit-fix-urls.mjs --dry-run
```

Historique connu (16 avril 2026) :
- 246/264 URLs retournent HTTP 200
- 18/264 URLs mortes (404) → ont été remplacées par fallback homepage
- 6/264 URLs ont redirect → mises à jour vers URL finale

## Limites du premier audit

Le script actuel (`scripts/audit-fix-urls.mjs`) vérifie seulement :
1. Le HTTP status code (200 = OK)
2. Si redirect, met à jour vers l'URL finale
3. Si 404, remplace par la homepage du domaine

**Ce qu'il ne vérifie PAS** :
- Que la page est sémantiquement la bonne (un 200 peut pointer vers une page générique de recherche)
- Que le titre de la page correspond au titre de la grant
- Que la page n'est pas une "soft 404" (HTTP 200 mais contenu "page introuvable")

Résultat : les 18 dead URLs ont été remplacées par la homepage de l'organisme, ce qui donne
l'illusion d'un lien valide mais l'utilisateur atterrit sur `cnc.fr` au lieu de la page d'aide.

## Objectif de cette session

Pour chaque grant, garantir que l'URL pointe vers la **page officielle spécifique** de la subvention, pas une homepage générique.

## Plan d'action (4 couches)

### Couche 1 — Validation sémantique

Améliorer `audit-fix-urls.mjs` :
1. GET la page (pas juste HEAD)
2. Extraire le `<title>` et `<h1>`
3. Calculer un score de match avec le titre de la grant (tokenizer + Jaccard ou similaire)
4. Si score < seuil → marquer comme "suspicious", logger dans `scripts/url-suspicious.csv`
5. Détecter les soft 404 : keywords dans le body (`"404"`, `"introuvable"`, `"page not found"`, `"n'existe plus"`)

Créer une nouvelle table `grants_url_audit` avec :
```sql
grant_id, original_url, final_url, http_status, title_match_score,
is_soft_404, audit_timestamp, needs_review (bool)
```

### Couche 2 — Re-fetch API Aides Territoires

Pour chaque grant qui vient de cette source, re-fetcher via l'API avec le titre et comparer :
- Si l'API renvoie une URL différente et valide → update DB
- Sinon → passer à couche 3

Script : `scripts/refetch-api-urls.ts`

Utiliser `AIDES_ET_TERRITOIRES_API_KEY` dans `.env`.

### Couche 3 — Recherche web ciblée

Pour les grants "suspicious" ou dead :
1. Faire une recherche Google/Brave Search API avec `"<titre grant>" <organisme> site:<domain>`
   Ex: `"Aide à l'écriture de scénario" CNC site:cnc.fr`
2. Prendre les 3 premiers résultats
3. Valider chacun avec couche 1 (scrape + title match)
4. Garder le meilleur score

Nécessite : API key Brave Search (plus simple) ou Google Custom Search. ~$5 pour 1000 requêtes.

Script : `scripts/web-search-urls.ts`

### Couche 4 — Scraping ciblé des 7 gros organismes

Les organismes suivants concentrent beaucoup de grants et ont des sites structurés :
- CNC (`cnc.fr`)
- CNM (`cnm.fr`)
- CNAP (`cnap.fr`)
- CNL (`centrenationaldulivre.fr`)
- SACEM (`sacem.fr`)
- ADAMI (`adami.fr`)
- SPEDIDAM (`spedidam.fr`)
- DRAC (`culture.gouv.fr/...`)

Pour chacun, scraper leur page "liste des aides" avec Puppeteer (déjà disponible dans le projet : `server/grant-scraper.ts`). Extraire tous les liens d'aide avec titre + URL.

Ensuite matcher avec nos grants par titre (fuzzy match) et mettre à jour les URLs.

Script : `scripts/scrape-big-orgs.ts`

### Couche 5 — Review queue manuel

Pour tout ce qui reste en "needs_review", créer :
- Route admin `/admin/url-review` qui affiche les grants suspects
- Pour chacune : titre, organisme, URL actuelle (iframe), champ pour coller la bonne URL, bouton "Valider"
- 3-4 min par grant max → 18 grants ≈ 1h de review humaine

## Grants prioritaires à fixer en premier (les 18 dead de l'audit 16 avril)

```
[404] Accès des jeunes aux filières d'excellence → aides-territoires.beta.gouv.fr/aides/cordees-de-la-reussite/
[404] ADSV - Aides deconcentrees au spectacle vivan → culture.gouv.fr/Aides-Demarches/Appels-a-projets-Aides/Aid
[404] Aide a l'ecriture de scenario - CNC → cnc.fr/professionnels/aides-et-financements/cinema/ecritur
[404] Aide a la residence artistique - Fondation de → fondationdefrance.org/fr/cat-culture
[404] Aide au developpement d'artiste - CNM → cnm.fr/aides/aide-au-developpement-dartiste/
[404] Aide au premier catalogue - CNAP → cnap.fr/aides-et-commandes
[404] Aide au projet artistique et culturel - Regio → iledefrance.fr/aides-regionales-culture
[404] Aide aux projets - SPEDIDAM → spedidam.fr/aides-financieres/
[404] Aide individuelle a la creation - CNAP → cnap.fr/aides-et-commandes/aide-individuelle-a-la-creation
[404] Avance sur recettes avant realisation - CNC → cnc.fr/professionnels/aides-et-financements/cinema/product
[404] Bénéficier du fonds d'intervention d'urgence → aides-territoires.beta.gouv.fr/aides/patrimoine-fonds-dinterve
[404] Bourse de creation litteraire - CNL → centrenationaldulivre.fr/aides/bourse-de-creation
[404] Création et rénovation de lieux pour traditio → aides-territoires.beta.gouv.fr/aides/traditions-lieux-de-conse
[404] Favoriser la culture pour tous → aides-territoires.beta.gouv.fr/aides/37d1-favoriser-la-culture
[404] Promouvoir la culture et le savoir-faire alpi → aides-territoires.beta.gouv.fr/aides/promotion-de-la-culture-e
[404] Soutenir la conservation, la restauration et → aides-territoires.beta.gouv.fr/aides/patrimoine-plan-concerte-
[404] Soutenir les manifestations dites "Grands fes → aides-territoires.beta.gouv.fr/aides/60e1-soutenir-les-manifes
[404] Viser à la régulation des initiatives en mati → aides-territoires.beta.gouv.fr/aides/patrimoine-recherche-en-p
```

## Ordre d'exécution recommandé

1. **Commencer par la couche 4 (scraping ciblé)** — impact maximum, pas besoin d'API payante
   - Les 7 organismes couvrent ~50-80 grants
   - Puppeteer déjà installé, code d'exemple dans `server/grant-scraper.ts`
2. **Puis couche 1 (validation sémantique)** — amélioration du script existant
   - Ça produit la liste "needs_review" pour le reste
3. **Puis couche 2 (re-fetch API)** — pour les grants Aides Territoires
4. **Couche 3 (web search)** optionnelle, uniquement si budget API
5. **Couche 5 (review manuel)** — finir proprement les cas restants

## Infrastructure existante à réutiliser

- `server/db.ts` — connexion Drizzle/PG ✓
- `server/grant-scraper.ts` — Puppeteer wrapper ✓
- `scripts/audit-fix-urls.mjs` — base à enrichir ✓
- `scripts/diagnose-enrichment.ts` — template pour les diagnostics ✓
- Variables `.env` : `DATABASE_URL`, `OPENROUTER_API_KEY`, `AIDES_ET_TERRITOIRES_API_KEY` ✓

## Critères de succès

À la fin de cette session :
- [ ] 0 URLs "dead" (404/timeout) dans la DB
- [ ] 100% des URLs actives ont un title_match_score > 0.5
- [ ] Pour les grants des 7 gros organismes, 100% pointent vers la page spécifique de l'aide
- [ ] Queue de review manuelle vidée (ou documenté ce qui reste)
- [ ] Nouveau rapport de qualité généré : `scripts/url-quality-report.md`

## Checks sanity avant de lancer

Vérifier qu'on ne casse rien :
- [ ] Faire un backup DB (ou marquer les updates avec un timestamp rollback-friendly)
- [ ] Lancer sur un échantillon de 10 grants avant la full run
- [ ] Tester que le matcher (`ai-matcher.ts`) utilise toujours `improvedUrl` avec fallback sur `url`
- [ ] Vérifier que le PDF generator lit bien la bonne URL (`grant-scraper.ts` résolution URLs d'application)

## Prompt de démarrage pour la nouvelle conv

Copie-colle ça au début de la nouvelle conversation :

> Lis `scripts/url-audit-plan.md` et exécute ce plan dans l'ordre recommandé. Commence par la couche 4 (scraping ciblé des 7 gros organismes). Avant toute update DB, affiche-moi 5 exemples de matching pour validation. Le but est d'avoir des URLs qui pointent vers la page spécifique de chaque aide, pas vers une homepage.
