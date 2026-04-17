# Checklist de déploiement SubventionMatch

Projet GitHub : https://github.com/oscardcstudio-cell/subvention-match
Projet Railway : https://railway.com/project/95e9f8cb-1c55-4106-bc98-29f8541f161d
URL publique : https://subvention-match-production.up.railway.app

---

## 1. Supabase — création de la DB

1. https://supabase.com/dashboard → **New Project**
2. Nom : `subvention-match`, région : **Paris (eu-west-3)** (ping minimal depuis Railway eu-west-4)
3. Génère un mot de passe fort (à garder).
4. Attends ~2 min que la DB soit ready.
5. **Project Settings → Database → Connection string** :
   - Copie la ligne **"Connection pooler"** (`aws-0-eu-west-3.pooler.supabase.com:6543`)
   - Remplace `[YOUR-PASSWORD]` par le password ci-dessus
   - Ajoute `?pgbouncer=true&sslmode=require` à la fin
   - Format final :
     ```
     postgresql://postgres.abcdefgh:PASSWORD@aws-0-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
     ```

## 2. Pousser le schéma + seed CSV

Depuis `C:\Users\oscar\APPS\subvention_match\` :

```bash
# Pousse le schéma (crée les 3 tables : grants, form_submissions, organisms_tracking)
DATABASE_URL="<url-supabase-ci-dessus>" npm run db:push

# Vérifie dans Supabase Studio → Table Editor que les tables sont bien créées

# Seed les 241 subventions depuis le CSV (via psql — préférable à \copy qui rame sur les grosses chaînes HTML)
# Option A — directement depuis l'UI Supabase : Table Editor → grants → Insert → Import CSV
# Option B — via psql depuis ton terminal :
PGPASSWORD="<mot-de-passe-supabase>" psql \
  "postgresql://postgres.abcdefgh@aws-0-eu-west-3.pooler.supabase.com:6543/postgres?sslmode=require" \
  -c "\copy grants(id,title,organization,amount,amount_min,amount_max,deadline,next_session,frequency,description,eligibility,requirements,obligatory_documents,url,grant_type,eligible_sectors,geographic_zone,priority,status) FROM 'grants_241_actives.csv' WITH (FORMAT csv, HEADER true, NULL '', QUOTE '\"', ESCAPE '\"')"
```

> **Pitfall** : le CSV contient du HTML avec des guillemets doubles. Les guillemets doublés (`""`) en CSV = un vrai `"` en base. psql gère ça nativement avec `ESCAPE '"'`. Si ça plante sur une ligne, c'est souvent un `\n` dans une cellule mal quoté.

## 3. Secrets à récupérer depuis Replit

Va dans ton ancien Replit `subvention-match` → **Tools → Secrets**. Copie ces valeurs :

| Replit secret | → Railway var | Format attendu |
|---|---|---|
| `STRIPE_SECRET_KEY` | idem | `sk_live_...` ou `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | idem | `whsec_...` (à régénérer après avoir branché le nouveau domaine) |
| `VITE_STRIPE_PUBLIC_KEY` | idem | `pk_live_...` ou `pk_test_...` ⚠️ **build-time** |
| `RESEND_API_KEY` | idem | `re_...` |
| `OPENROUTER_API_KEY` | idem | `sk-or-...` |
| `AIDES_ET_TERRITOIRES_API_KEY` | idem | token alphanum 40+ chars |

Plus 2 nouveaux :
| Nouvelle var | Valeur |
|---|---|
| `DATABASE_URL` | L'URL Supabase de l'étape 1 |
| `ADMIN_TOKEN` | Génère un token fort : `openssl rand -hex 32` |
| `VITE_ADMIN_TOKEN` | **Même valeur** que `ADMIN_TOKEN` (build-time, exposé au client) |

## 4. Injection des secrets dans Railway

Deux façons :

**A. Via CLI (rapide)** — depuis ta machine, dans le dossier du projet :
```bash
railway variables \
  --set "DATABASE_URL=postgresql://..." \
  --set "STRIPE_SECRET_KEY=sk_..." \
  --set "STRIPE_WEBHOOK_SECRET=whsec_..." \
  --set "VITE_STRIPE_PUBLIC_KEY=pk_..." \
  --set "RESEND_API_KEY=re_..." \
  --set "OPENROUTER_API_KEY=sk-or-..." \
  --set "AIDES_ET_TERRITOIRES_API_KEY=..." \
  --set "ADMIN_TOKEN=..." \
  --set "VITE_ADMIN_TOKEN=..."
```
Railway va redéployer automatiquement.

**B. Via dashboard Railway** → projet → service `subvention-match` → **Variables** → **Raw Editor** → colle toutes les `KEY=VALUE` d'un coup → **Update Variables**.

⚠️ **`VITE_STRIPE_PUBLIC_KEY` et `VITE_ADMIN_TOKEN` doivent être définies AVANT le build** car elles sont bundlées dans le JS client. Si tu les ajoutes après, redéploie (`railway up` ou push GitHub).

## 5. Brancher le webhook Stripe

Une fois l'URL Railway active :

1. https://dashboard.stripe.com → **Developers → Webhooks → Add endpoint**
2. URL : `https://subvention-match-production.up.railway.app/api/webhook/stripe`
3. Events : `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Récupère le **Signing secret** (`whsec_...`)
5. Mets-le à jour dans Railway : `railway variables --set "STRIPE_WEBHOOK_SECRET=whsec_..."`

## 6. Tests de bout en bout

```bash
# Healthcheck
curl https://subvention-match-production.up.railway.app/api/health
# → {"status":"ok","uptime":...}

# Nombre de grants
curl https://subvention-match-production.up.railway.app/api/grants/count
# → {"count":241}

# Test admin (avec ton token)
curl -H "x-admin-token: <TON_ADMIN_TOKEN>" \
  https://subvention-match-production.up.railway.app/api/admin/grants | head -c 500
```

Puis dans le navigateur :
- [ ] `/` — homepage charge
- [ ] `/form` — formulaire fonctionne, soumission crée une session
- [ ] `/results/<sessionId>` — résultats IA affichés (nécessite `OPENROUTER_API_KEY`)
- [ ] `/checkout` — Stripe redirige vers checkout session
- [ ] Après paiement de test → email reçu avec PDF attaché
- [ ] `/data-quality` — dashboard admin accessible (nécessite `VITE_ADMIN_TOKEN`)

## 7. Beta-test setup (avril 2026)

Avant le prochain deploy, il faut pousser les 2 nouvelles tables vers Supabase :

```bash
DATABASE_URL="<url-supabase>" npm run db:push
```

Cela va creer :
- `match_feedback` — votes pertinent/pas pertinent des testeurs sur chaque match
- `beta_feedback` — bugs et suggestions du widget flottant

Nouvelles variables d'environnement **optionnelles** (build-time, redeploy apres ajout) :

| Variable | Source | Effet si absente |
|---|---|---|
| `SENTRY_DSN` | https://sentry.io → Project → DSN | Pas de error tracking |
| `VITE_SENTRY_DSN` | Meme DSN | Pas de error tracking client |
| `VITE_POSTHOG_KEY` | https://eu.posthog.com → Project Settings | Pas d'analytics |
| `VITE_POSTHOG_HOST` | `https://eu.i.posthog.com` | Default EU |

## 8. Sur du long terme

- **Domaine custom** : `railway domain <votre-domaine.fr>` puis ajouter un CNAME chez ton registrar.
- **Backups Supabase** : le plan Free fait des backups journaliers sur 7 jours. Pour PITR (Point-In-Time Recovery) il faut passer Pro.
- **Migrations futures** : passe de `drizzle-kit push` à `drizzle-kit generate` + `migrate` (voir `DB_TOOLING_GUIDE.md` §3).
