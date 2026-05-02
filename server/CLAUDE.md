# server/ — SubventionMatch

## Règles critiques

- **`shared/schema.ts` est la source de vérité DB** — toute modif de schema passe par là, jamais directement en SQL manuel
- **Jamais de DROP column dans une migration** — ajouter uniquement (zero-downtime). Si suppression vraiment nécessaire : demander à Oscar
- **`ai-matcher.ts` contient le pipeline critique** — tout changement au prompt DeepSeek ou aux seuils du quality gate doit être testé manuellement sur quelques profils réels avant push

## Fichiers à connaître avant de toucher

- `ai-matcher.ts` : pipeline matching complet (filtre → quality gate → DeepSeek → enrichissement)
- `quality-gate.ts` : score 0-100, seuil 60 — ne pas baisser ce seuil sans analyse impact
- `pdf-generator.ts` : toujours passer `formData` à la génération (sinon résumé absent du PDF)
- `routes-old.ts` : **code mort** (15+ erreurs TS) — peut être supprimé, ne jamais modifier

## Conventions
- TypeScript ESM (`import`/`export`)
- Scripts standalone s'exécutent via `tsx server/<script>.ts`
- Path alias `@shared/` → `shared/`
