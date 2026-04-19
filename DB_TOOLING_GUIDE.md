# État de l'art — Gestion de bases de données

**Contexte** : PostgreSQL (Supabase) + Drizzle ORM + Node.js/Express, déployé Railway. ~470 subventions, ~250 soumissions. Contenu : texte long (HTML embarqué), `text[]`, JSONB. Workflows : seed CSV, scraping Puppeteer, matching IA, admin dashboard.

Volume actuel = petit. La plupart des outils "big data" sont **overkill** — ils sont listés pour référence, avec un seuil d'activation clair.

---

## 1. Outils d'administration (GUI)

- **Supabase Studio** (intégré) — *Pour toi, 90% du temps.* Editor SQL, table editor, RLS, logs, storage, schema viz. Lent sur grosses tables (>100k rows) et éditeur SQL limité vs DataGrip. Aucune install. [supabase.com/docs/guides/platform](https://supabase.com/docs/guides/platform)
- **pgAdmin 4** — *Standard ouvert, gratuit.* Couvre tout Postgres (EXPLAIN visualizer, server stats). UI datée, plus lourd que DBeaver. Utile si tu dois admin fin (vacuum, roles).
- **DBeaver Community** — *Meilleur compromis gratuit multi-DB.* ER diagrams, data transfer, SQL editor correct. Java = RAM gourmand. Bon pour comparer Postgres ↔ autres sources.
- **TablePlus** — *Payant (~89$), Mac/Win.* UX rapide, filtres inline, multi-onglets, diff schema. Idéal si tu fais de la DB quotidiennement. Pas collaboratif.
- **Postico 2** — *Mac-only, natif, minimal.* Parfait pour lecture/petites éditions. Pas d'outil d'admin avancé.
- **DataGrid (JetBrains)** — *Top-tier payant.* Autocomplete/refactor SQL excellent, multi-DB. ~100$/an. Overkill sauf si tu vis dedans.

**Reco** : reste sur Supabase Studio + TablePlus (ou DBeaver gratuit) pour les sessions de debug locales.

---

## 2. Outils CLI

- **`psql`** — client officiel. Indispensable pour scripts CI, `\copy` (import CSV côté client), `\d+ table`, `EXPLAIN ANALYZE`. Connexion via le "connection string" Supavisor de Supabase.
- **`pg_dump` / `pg_restore`** — backup/restore logique. `pg_dump --format=custom --no-owner --no-acl -d $DB > dump.pgc` puis `pg_restore -d ... dump.pgc`. Supabase fait des backups managed, mais garde un dump local hebdo.
- **`pg_bulkload`** — 2-4× plus rapide que COPY, mais extension C à compiler côté serveur → **pas dispo sur Supabase**. Ignore.
- **`supabase` CLI** — essentiel : `supabase db pull/push/diff`, `supabase db dump`, migrations locales avec Docker. Permet de tester un schéma avant de l'appliquer en prod. [supabase.com/docs/reference/cli](https://supabase.com/docs/reference/cli)
- **`railway` CLI** — `railway run <cmd>` injecte les env vars prod, `railway logs`, `railway connect`. Utile pour lancer un script de seed avec la vraie config.

---

## 3. ORM & migrations

**Drizzle : `push` vs `migrate`** (consensus 2026 : [orm.drizzle.team/docs/migrations](https://orm.drizzle.team/docs/migrations))

- **`drizzle-kit push`** — applique le schéma TS directement à la DB, sans fichier. Parfait **en dev/prototypage**. Dangereux en prod : pas d'audit trail, risque de data loss silencieux.
- **`drizzle-kit generate`** + **`migrate`** — génère un fichier SQL versionné (commit dans git), appliqué via `migrate`. **C'est ce que tu dois utiliser en prod** (Railway deploy hook). Un seul flux, contrôle total, rollback possible.

Règle simple : `push` en local, `generate` + PR review + `migrate` en déploiement.

**Alternatives** :
- **Prisma** — plus mature, meilleur tooling (Studio), mais runtime plus lourd et moins flexible sur SQL brut. Si tu démarrais aujourd'hui tu pouvais choisir l'un ou l'autre — Drizzle gagne en vitesse et proximité SQL.
- **Kysely** — query builder type-safe sans génération. Complément utile à Drizzle pour requêtes dynamiques complexes (filtres admin). Pas de migration système intégré.

**Seed** : garde un script Node dédié (`tsx scripts/seed.ts`) qui lit ton CSV et fait `db.insert().values(batches)` par chunks de 500. `drizzle-kit` ne gère pas le seed.

---

## 4. Import / export massif

Pour 470-50k rows, **n'importe quelle méthode marche**. Au-delà, ça compte.

- **`COPY` / `\copy`** — l'arme standard Postgres. `\copy grants FROM 'file.csv' WITH (FORMAT csv, HEADER true, NULL '', QUOTE '"', ESCAPE '"')`. [postgresql.org/docs/current/sql-copy.html](https://www.postgresql.org/docs/current/sql-copy.html)
- **`pg-copy-streams`** (Node) — pour ingérer un gros CSV en streaming depuis ton backend : `copyFrom('COPY table FROM STDIN CSV')`. Rapide mais brittle : tu dois aligner l'ordre/encoding des colonnes à la perfection. [npmjs.com/package/pg-copy-streams](https://www.npmjs.com/package/pg-copy-streams)
- **`pgloader`** — utile **seulement** pour migrer depuis MySQL/SQLite/MSSQL. Si c'est CSV → Postgres, `\copy` suffit.
- **Supabase Import UI** — OK pour <10k lignes occasionnelles. Pas d'idempotence, pas d'ETL.

**Pitfalls HTML embarqué / text[]** :
- Encoding : force **UTF-8 sans BOM** (`iconv -f WINDOWS-1252 -t UTF-8`).
- Quotes HTML dans le texte : utilise `QUOTE '"'` + `ESCAPE '"'` (doubler les guillemets CSV).
- `NULL` vs `""` : `NULL ''` dans COPY traite champ vide comme NULL.
- `text[]` : sérialiser en littéral Postgres `{"item1","item2"}` côté CSV, ou importer en JSON puis `UPDATE ... SET col = ARRAY(...)`.
- JSONB : préfère un staging `text` + `UPDATE SET jsonb_col = val::jsonb` pour isoler les erreurs de parsing.

Pour ton seed de grants, script Node avec Drizzle `insert().values(chunk)` reste le plus maintenable tant que <10k lignes.

---

## 5. Observabilité et qualité

- **`pg_stat_statements`** — activé par défaut sur Supabase. Visible dans **Database → Query Performance**. Trie par `total_exec_time`, `calls`, `mean_exec_time`. Premier réflexe quand une page rame.
- **Supabase Observability** — logs (API, DB, auth), slow queries, advisors (index manquants, RLS désactivées). Gratuit, à checker 1×/semaine.
- **Backups** — Supabase fait daily auto; **PITR** (Point-In-Time Recovery) est sur plan Pro. Complète avec `pg_dump` hebdo vers S3/Railway volume.
- **Monitoring externe** — overkill aujourd'hui. Quand tu scaleras : **Better Stack** (logs + uptime, bon prix) ou **Grafana Cloud** (metrics Postgres via exporter). Datadog = cher et granulaire, reste sur Better Stack tant que tu es seul.
- **Data quality** — Great Expectations / Soda Core sont des frameworks Python overkill ici. Pour toi : écris 5-10 assertions SQL simples (`SELECT COUNT(*) FROM grants WHERE deadline < NOW() AND is_active`) dans un cron job qui ping Slack.

---

## 6. Pratiques pour la croissance

- **Indexing** :
  - `btree` (défaut) pour égalité/range/ORDER BY sur `deadline`, `status`, `created_at`.
  - **GIN** pour `text[]` (`CREATE INDEX ON grants USING GIN(tags)`), JSONB (`USING GIN(data jsonb_path_ops)`) et full-text (`to_tsvector`).
  - **`pg_trgm` + GIN** pour ILIKE/similarity sur les descriptions.
  - Vérifier les index inutilisés : `SELECT * FROM pg_stat_user_indexes WHERE idx_scan = 0;`.
- **Partitionnement** — *overkill <10M rows*. Envisage quand `submissions` dépasse 1M (partition par `created_at` mensuel).
- **Read replicas** — disponibles plan Team Supabase. Attends d'avoir un vrai hot-path read (>100 req/s).
- **Connection pooling** — Supabase fournit **Supavisor** (remplace pgBouncer). Utilise la connection string "transaction mode" port 6543 depuis Railway. Évite le double-pooling : réduis ton pool applicatif (Drizzle `pg` pool ~5-10). [supabase.com/docs/guides/database/connecting-to-postgres](https://supabase.com/docs/guides/database/connecting-to-postgres)
- **Cache Redis** — Upstash ou Railway Redis. Cache les matchs IA (clé = hash de profil + version du catalogue grants) et la liste des subventions actives, TTL 15 min. Gros levier dès que le matching coûte.
- **Archivage** — quand `submissions` > 500k, déplace les lignes `status=archived` + >6 mois vers `submissions_archive` (même schéma, autre table) avec `INSERT ... SELECT` + `DELETE`. Garde les requêtes courantes rapides.

---

**Sources clés** : [Drizzle docs](https://orm.drizzle.team/docs/migrations) · [PostgreSQL COPY](https://www.postgresql.org/docs/current/sql-copy.html) · [Supabase Connection Management](https://supabase.com/docs/guides/database/connection-management) · [pg-copy-streams](https://www.npmjs.com/package/pg-copy-streams) · [Supavisor](https://github.com/supabase/supavisor)
