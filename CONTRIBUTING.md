# Contribuer à SubventionMatch

Merci de l'intérêt ! Ce projet est open source sous licence AGPL-3.0-or-later.

## Quoi contribuer

Les contributions bienvenues, par ordre d'utilité :

1. **Sources de subventions** — connaissance d'une aide manquante, d'une API régionale,
   d'un nouveau scraper à écrire → ouvre une issue avec le lien vers la source.
2. **Qualité des données** — erreurs sur des fiches existantes (deadline, montant, URL
   cassée, éligibilité mal décrite) → issue ou PR sur `server/quality-gate.ts`.
3. **Amélioration du matching** — le prompt dans `server/ai-matcher.ts` est le cœur du
   produit. Propositions d'amélioration, benchmarks, cas limites → PR avec exemples avant/après.
4. **Code** — bugs, perfs, UI, i18n. Les erreurs TypeScript pré-existantes (voir AUDIT.md)
   sont un terrain d'entrée facile.
5. **Documentation** — le README, la config Railway, les guides DB.

## Setup

Voir [README.md — Développement local](README.md#développement-local). Tu auras besoin
d'un compte [OpenRouter](https://openrouter.ai) (matching IA) et d'un Postgres local
ou Supabase gratuit.

## Conventions

- **TypeScript ESM partout** (`import`/`export`, pas de `require`)
- **Commits** : messages en anglais ou français, au présent impératif (`fix: ...`,
  `add: ...`, `refactor: ...`). Voir `git log` pour le style.
- **PR** : une PR = une préoccupation. Décris le "pourquoi" plus que le "quoi"
  (le diff parle de lui-même).
- **Pas de dépendances frivoles** : avant d'ajouter un package, vérifie qu'on ne peut
  pas le faire en 20 lignes.

## Pipeline de matching (lecture recommandée avant PR IA)

Le flow critique vit dans `server/ai-matcher.ts` :

1. Filtre par deadline (grants ouvertes ou récurrentes)
2. Quality gate (`server/quality-gate.ts`) — score 0-100, seuil 60
3. Appel DeepSeek pour sélectionner les top matches
4. Enrichissement à la volée pour les fiches sous le seuil 80 (persisté en DB)
5. Enrichissement personnalisé (advice + difficulty) par profil utilisateur

La règle n°1 du prompt est la **pertinence sectorielle** : ne jamais proposer une
aide dont le domaine est incompatible avec le profil du demandeur (ex : aide au
mobilier pour un écrivain). Toute PR touchant au prompt doit être accompagnée
d'exemples de profils de test.

## Signaler un bug

Ouvre une [issue GitHub](https://github.com/oscardcstudio-cell/subvention-match/issues)
avec :
- Ce que tu attendais
- Ce qui s'est passé
- Étapes pour reproduire
- Si pertinent : navigateur / version Node / logs

## Sécurité

Si tu découvres une faille, **ne l'ouvre pas en issue publique**. Voir [SECURITY.md](SECURITY.md).
