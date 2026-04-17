# SubventionMatch

Plateforme open source de matching IA entre artistes / associations culturelles
et subventions françaises.

- **Site** : https://subvention-match-production.up.railway.app
- **Licence** : [AGPL-3.0-or-later](LICENSE)

## Stack

- **Frontend** : React + TypeScript + Vite + Tailwind + shadcn/ui + wouter
- **Backend** : Node.js + Express + TypeScript (ESM)
- **Base de données** : PostgreSQL via Drizzle ORM (hébergé sur Supabase)
- **IA** : DeepSeek via OpenRouter pour le matching et l'enrichissement
- **Paiement** : Stripe (mode beta gratuit actuellement)
- **Emails** : Resend
- **PDF** : Puppeteer (Chromium headless)

## Architecture

```
subvention_match/
├── client/            # React + Vite (sert /dist/public en prod)
├── server/            # Express (sert l'API + les fichiers statiques)
│   ├── index.ts       # Bootstrap serveur
│   ├── routes.ts      # Toutes les routes /api/*
│   ├── ai-matcher.ts  # Pipeline de matching IA (quality gate + DeepSeek)
│   ├── db.ts          # Pool Postgres (pg) + Drizzle
│   └── scrapers/      # Scrapers Puppeteer par organisme
├── shared/schema.ts   # Schéma Drizzle partagé client + serveur
├── Dockerfile         # Image de production (Debian + Chromium)
└── railway.json       # Config Railway
```

## Développement local

```bash
# 1. Dépendances
npm install

# 2. Variables d'environnement
cp .env.example .env
# → renseigne DATABASE_URL, STRIPE_*, RESEND_API_KEY, OPENROUTER_API_KEY, ADMIN_TOKEN

# 3. Pousse le schéma en base
npm run db:push

# 4. Lance en dev (hot reload côté front + API)
npm run dev
```

L'app est servie sur `http://localhost:5000`.

> **Note Windows** : le script `dev` utilise la syntaxe Unix (`NODE_ENV=development tsx ...`). Sur Windows natif, utilise `cross-env` ou WSL.

## Déploiement Railway

L'app est conçue pour tourner sur [Railway](https://railway.com) via le `Dockerfile`.

### 1. Base de données — Supabase

1. Crée un projet sur [supabase.com](https://supabase.com)
2. Dans **Project Settings → Database**, récupère la **Connection pooler** URI (format `postgres.xxx:PW@aws-0-eu-west-3.pooler.supabase.com:6543/postgres`)
3. Ajoute `?pgbouncer=true&sslmode=require` à la fin
4. Pousse le schéma depuis ta machine :
   ```bash
   DATABASE_URL="<uri>" npm run db:push
   ```

### 2. Railway

1. **Settings → Environment** : renseigne toutes les variables de `.env.example`
2. Railway détecte le `Dockerfile` automatiquement
3. Le service écoute `$PORT` (injecté par Railway)
4. Healthcheck : `/api/health`

Pour le **webhook Stripe**, pointe-le vers `https://<ton-domaine-railway>/api/webhook/stripe` et copie le signing secret dans `STRIPE_WEBHOOK_SECRET`.

## Variables d'environnement

| Var | Obligatoire | Usage |
|---|---|---|
| `DATABASE_URL` | ✅ | Supabase Postgres (pooler URI, `sslmode=require`) |
| `STRIPE_SECRET_KEY` | ⚠️ | Sinon mode gratuit uniquement |
| `STRIPE_WEBHOOK_SECRET` | ⚠️ | Signing secret du webhook `/api/webhook/stripe` |
| `VITE_STRIPE_PUBLIC_KEY` | ⚠️ | **Build-time** — doit être présent au `npm run build` |
| `RESEND_API_KEY` | ⚠️ | Sinon pas d'emails post-paiement |
| `OPENROUTER_API_KEY` | ✅ | Matching IA + enrichissement |
| `AIDES_ET_TERRITOIRES_API_KEY` | — | Sync des aides |
| `ADMIN_TOKEN` | ⚠️ | Si absent, les routes admin sont **désactivées** (fail-closed) |
| `VITE_ADMIN_TOKEN` | ⚠️ | **Build-time** — doit matcher `ADMIN_TOKEN` |
| `N8N_WEBHOOK_URL` | — | Legacy |
| `PORT` | — | Injecté par Railway |
| `PUPPETEER_EXECUTABLE_PATH` | — | Défini dans le Dockerfile (`/usr/bin/chromium`) |

## Scripts

```bash
npm run dev     # dev (tsx watch + vite HMR)
npm run build   # vite build + esbuild server → dist/
npm run start   # node dist/index.js (production)
npm run check   # tsc (type check, pas bloquant)
npm run db:push # drizzle-kit push vers DATABASE_URL
```

## Contribuer

Les issues et PR sont les bienvenues. Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour les
conventions du projet (stack, commits, pipeline de matching).

Pour signaler une faille de sécurité, voir [SECURITY.md](SECURITY.md).

## Licence

Ce projet est distribué sous licence **GNU Affero General Public License v3.0 ou
ultérieure** (AGPL-3.0-or-later). Voir [LICENSE](LICENSE).

En pratique : tu peux utiliser, modifier et redistribuer ce code librement, **y
compris pour un usage commercial**. En contrepartie, si tu héberges une version
modifiée accessible via un réseau (SaaS), tu dois rendre publiques tes modifications
sous la même licence.

Copyright © 2026 Oscar DC Studio
