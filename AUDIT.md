# Audit SubventionMatch — Import depuis Replit vers GitHub + Railway

Date : 2026-04-16

## Résumé

| Zone | Statut |
|---|---|
| Structure fichiers (client / server / shared) | ✅ Complet |
| Build (vite + esbuild) | ✅ OK après fixes |
| TypeScript strict (`npm run check`) | ⚠️ Erreurs pré-existantes non bloquantes |
| DB driver (Supabase) | ✅ Fix appliqué |
| Puppeteer en prod | ✅ Fix appliqué (Dockerfile avec Chromium) |
| Sécurité (secrets, admin token) | ✅ Fix appliqué |
| Déploiement Railway | 🟡 À tester une fois les env vars en place |

---

## Fixes appliqués avant le push GitHub

### 1. Driver base de données — Neon → Postgres standard (Supabase)
**Fichier** : `server/db.ts`

Avant : `@neondatabase/serverless` avec websocket `ws`. Fonctionne uniquement avec Neon.

Après : `pg` + `drizzle-orm/node-postgres`. Compatible avec n'importe quel Postgres (Supabase, Railway Postgres, RDS, etc.). SSL activé automatiquement si l'URL contient `supabase.com`, `neon.tech`, ou `sslmode=require`.

### 2. Puppeteer — chemins hardcodés supprimés
**Fichiers** : `server/pdf-generator.ts`, `server/url-fixer.ts`, `server/grant-scraper.ts`

Avant :
- `pdf-generator.ts` → `/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium` (chemin Nix Replit)
- `url-fixer.ts` → `/home/runner/.cache/puppeteer/chrome/linux-142.0.7444.162/chrome-linux64/chrome` (chemin Replit runner)

Après : utilisent `process.env.PUPPETEER_EXECUTABLE_PATH` (défini à `/usr/bin/chromium` dans le `Dockerfile`), avec fallback sur le Chrome bundled de Puppeteer en dev local.

### 3. `.gitignore` élargi
Ajout de `.env`, `*.sql`, `database_export.sql`, `.replit`, `.config/`, `.upm/`, `.agents/`, `replit.md`, etc. Le dump SQL de 6.4 MB (qui contient potentiellement des `form_submissions` avec emails) n'est **pas** committé.

### 4. Admin token — plus de fallback hardcodé
**Fichier** : `server/routes.ts`

Avant : `const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "subventionmatch-admin-2025"` → toute personne qui trouve le repo ou lit `.replit` a accès aux routes admin.

Après : si `ADMIN_TOKEN` absent, toutes les routes admin renvoient `503`. Fail-closed.

### 5. `nanoid` ajouté aux deps, deps Neon retirées
`server/vite.ts` importait `nanoid` sans qu'il soit déclaré dans `package.json` (transitive via drizzle-orm). Maintenant déclaré explicitement. Retrait de `@neondatabase/serverless` qui n'est plus utilisé.

### 6. Dockerfile multi-stage pour Railway
Debian slim + Chromium + libs X11/fonts/Pango/Cairo requises par Puppeteer. Dev deps sont éliminées après le build avec `npm prune --omit=dev`. Le serveur tourne avec `dumb-init` pour bien gérer les signaux.

### 7. Healthcheck `/api/health`
Endpoint simple (sans hit DB) pour que Railway puisse vérifier que l'app tourne.

### 8. `.env.example`
Exemple clair de toutes les vars requises, avec le format Supabase pooler (`pgbouncer=true&sslmode=require`).

### 9. README.md de déploiement
Instructions Supabase + Railway + variables d'env.

---

## Points pré-existants NON corrigés (à ta discrétion)

### A. `server/routes-old.ts` — code legacy cassé
Ce fichier n'est importé nulle part mais provoque 15 erreurs TypeScript (API désalignée avec le storage actuel). Build passe quand même car `tsc --noEmit` n'est pas dans le pipeline. **Recommandation** : supprimer le fichier.

### B. `AdminPage.tsx` et `ai-matcher.ts` — gestion des `null` manquante
6 erreurs "possibly null" sur des champs optionnels (`status`, `artisticDomain`, etc.) du formulaire. Les données sont OK à l'exécution (le code fait des `.length` après un `|| []` implicite ou dans un contexte où la valeur existe), mais le type checker n'est pas content. **Impact** : aucun, sauf si tu réactives `tsc` dans le pipeline CI.

### C. `FormPage.tsx` — type `string[] | undefined` utilisé comme tableau
3 erreurs. Même problème que B.

### D. Script `dev` Unix-only
`"dev": "NODE_ENV=development tsx server/index.ts"` ne marche pas sur Windows natif (l'assignation inline n'est pas parsée par cmd). OK sur Railway (Linux) et WSL. Ajoute `cross-env` si tu veux dev sous Windows.

### E. Puppeteer léger (500 MB+ en image Docker)
L'image Docker va peser ~500-700 MB à cause de Chromium + libs. C'est **normal** pour Puppeteer. Si le temps de build devient un problème, on peut passer à une image `browserless/chrome` distante.

### F. Bundle client 1.23 MB (348 KB gzippé)
Vite warn que c'est > 500 KB. Pas bloquant. Optimisation possible via `build.rollupOptions.output.manualChunks` — pas prioritaire.

### G. `VITE_STRIPE_PUBLIC_KEY` et `VITE_ADMIN_TOKEN` — build-time
Ces deux variables doivent être présentes **au moment du `npm run build`**. Sur Railway, ça veut dire qu'elles doivent être définies **avant le premier déploiement**. Si tu les ajoutes après, il faut redéployer pour les inclure dans le bundle client.

### H. `server/index.ts` utilise `reusePort: true`
Option Node.js 20+ qui peut causer `ENOTSUP` sur certaines plateformes. Sur Linux Railway ça marche, mais à garder en tête.

### I. Démarrage scheduler auto-refresh au boot
`server/index.ts:72` lance un scheduler hebdomadaire dès le démarrage. Sur Railway, si l'app reboot souvent (déploiements fréquents), le scheduler est réinitialisé à chaque fois. Pour un cron fiable, envisage Railway Cron ou un job externe.

---

## Checklist avant le premier déploiement Railway

- [ ] Projet Supabase créé, pooler URI récupérée
- [ ] Schéma poussé : `DATABASE_URL="<supabase-uri>" npm run db:push`
- [ ] Données importées : `psql "<supabase-uri>" < database_export.sql`
- [ ] Railway project créé, lié au repo GitHub
- [ ] Variables d'env renseignées sur Railway (voir `.env.example`)
- [ ] Premier build OK, logs clean
- [ ] Healthcheck `/api/health` répond 200
- [ ] Webhook Stripe pointé sur `https://<domaine>/api/webhook/stripe`, secret mis à jour
- [ ] Test form → résultats → paiement → email de bout en bout
