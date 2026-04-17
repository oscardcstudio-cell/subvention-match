# Mécène — Instructions Claude Code

> Ancien nom : SubventionMatch. Rebrandé en avril 2026.
> Le dossier / repo GitHub garde encore le nom `subvention-match` pour l'instant.

## Philosophie

Ce projet part d'un prototype Replit migré vers GitHub + Railway. Le code existant
n'est pas sacré : **réécrire et restructurer librement** quand c'est justifié.
Préférer un refactor propre à un patch qui empile de la dette technique.

## Stack

- **Client** : React + Vite + Tailwind (SPA)
- **Server** : Express TypeScript ESM, Drizzle ORM (PostgreSQL / Supabase)
- **IA** : DeepSeek via OpenRouter (matching + enrichissement)
- **PDF** : Puppeteer (Chromium dans Docker)
- **Email** : Resend
- **Paiement** : Stripe (mode beta gratuit actuellement)
- **Déploiement** : Railway (auto-deploy main), Supabase DB

## Architecture

```
client/          → SPA React (Vite build → dist/public/)
server/          → Express API + scrapers + enrichissement + PDF
shared/schema.ts → Drizzle schema (source de vérité DB)
```

Le server bundle via esbuild en un seul `dist/index.js` (ESM).

## Conventions

- TypeScript ESM partout (`import`/`export`, pas de `require`)
- Path alias : `@shared/` → `shared/`
- Les scripts standalone (scrapers, enrichissement, audit) sont dans `server/` et
  s'exécutent via `tsx server/<script>.ts`
- `routes-old.ts` est du code mort (15+ erreurs TS), peut être supprimé

## Pipeline de matching (important)

Le flow critique est dans `server/ai-matcher.ts` :
1. Filtre par deadline (grants ouvertes/récurrentes)
2. Quality gate (`server/quality-gate.ts`) — score 0-100, seuil 60
3. Envoi à DeepSeek pour sélection des top matches
4. Enrichissement à la volée des matches sous le seuil 80 (persisté en DB)
5. Enrichissement personnalisé (advice/difficulty) par profil utilisateur

Le prompt DeepSeek est CRITIQUE pour la qualité des résultats. La règle n°1 est
la pertinence sectorielle : ne jamais proposer une aide dont le domaine est
incompatible avec le profil (ex: mobilier pour un écrivain).

## PDF

`server/pdf-generator.ts` génère le HTML + Puppeteer pour le PDF.
`submissionToPdfFormData()` centralise le mapping submission → PDF.
Toujours passer `formData` à la génération de PDF (sinon le résumé du projet
n'apparaît pas).

## Erreurs TypeScript pré-existantes

- `AdminPage.tsx`, `FormPage.tsx` : `possibly null` sur arrays optionnels (non bloquant)
- `routes-old.ts` : 15+ erreurs (fichier mort, à supprimer)
- `routes.ts:94` : Stripe API version mismatch (cosmétique)

Aucune de ces erreurs n'empêche le build (`esbuild` ne fait pas de type checking).

## Données

~470 grants en DB (241 actives). Sources : Aides Territoires API, scrapers
(ADAMI, CNM, Sacem, Spedidam, Ministère Culture, Mon Projet Musique),
import EU funding, import manuel.

Les données sont souvent incomplètes (URLs génériques, descriptions courtes,
éligibilité vague). Le quality gate + enrichissement IA compensent, mais la
qualité des résultats dépend en dernier ressort du prompt de matching.
