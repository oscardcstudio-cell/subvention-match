/**
 * Seed the `grants` table from a CSV export (e.g. grants_241_actives.csv).
 *
 * Usage:
 *   DATABASE_URL="..." npx tsx scripts/seed-grants.ts [path/to/file.csv]
 *
 * Default path: ./grants_241_actives.csv at the repo root.
 *
 * The CSV is expected to match the column order:
 *   id, title, organization, amount, amount_min, amount_max, deadline,
 *   next_session, frequency, description, eligibility, requirements,
 *   obligatory_documents, url, grant_type, eligible_sectors,
 *   geographic_zone, priority, status
 */

import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import pg from "pg";

const { Pool } = pg;

const csvPath = process.argv[2] || path.resolve(process.cwd(), "grants_241_actives.csv");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL must be set.");
  process.exit(1);
}

if (!fs.existsSync(csvPath)) {
  console.error(`CSV not found at ${csvPath}`);
  process.exit(1);
}

const needsSSL = /supabase\.com|sslmode=require|neon\.tech/.test(process.env.DATABASE_URL);
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: needsSSL ? { rejectUnauthorized: false } : undefined,
});

function toNullable(s: string | undefined): string | null {
  if (s === undefined || s === null) return null;
  const trimmed = s.trim();
  return trimmed === "" ? null : trimmed;
}

function toInt(s: string | undefined): number | null {
  const v = toNullable(s);
  if (v === null) return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

/**
 * Postgres array literal like `{music,theater}` → JS array `["music","theater"]`.
 * Passing the literal straight through also works when bound to a `text[]`
 * column with the node-postgres driver (it auto-parses `{...}`), but we
 * normalize for safety.
 */
function parsePgArray(s: string | undefined): string[] | null {
  const v = toNullable(s);
  if (v === null) return null;
  if (!v.startsWith("{") || !v.endsWith("}")) return null;
  const inner = v.slice(1, -1);
  if (inner === "") return [];
  // Simple split — the CSV doesn't contain escaped commas in these fields.
  return inner.split(",").map((x) => x.replace(/^"|"$/g, "").trim()).filter(Boolean);
}

async function main() {
  const raw = fs.readFileSync(csvPath);
  const rows = parse(raw, {
    columns: true,
    bom: true,
    relax_quotes: true,
    relax_column_count: true,
  }) as Record<string, string>[];

  console.log(`Read ${rows.length} rows from ${path.basename(csvPath)}`);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Truncate first so reruns are idempotent.
    await client.query("TRUNCATE TABLE grants RESTART IDENTITY CASCADE");
    console.log("Truncated grants table.");

    const sql = `
      INSERT INTO grants (
        id, title, organization, amount, amount_min, amount_max, deadline,
        next_session, frequency, description, eligibility, requirements,
        obligatory_documents, url, grant_type, eligible_sectors,
        geographic_zone, priority, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12,
        $13, $14, $15, $16,
        $17, $18, COALESCE($19, 'active')
      )
    `;

    let inserted = 0;
    for (const r of rows) {
      const params = [
        toNullable(r.id),
        r.title?.trim() || "(sans titre)",
        r.organization?.trim() || "Non spécifié",
        toInt(r.amount),
        toInt(r.amount_min),
        toInt(r.amount_max),
        toNullable(r.deadline),
        toNullable(r.next_session),
        toNullable(r.frequency),
        toNullable(r.description),
        // eligibility is NOT NULL — fallback to a placeholder if missing.
        toNullable(r.eligibility) ?? "Non renseigné",
        toNullable(r.requirements),
        parsePgArray(r.obligatory_documents),
        toNullable(r.url),
        parsePgArray(r.grant_type),
        parsePgArray(r.eligible_sectors),
        parsePgArray(r.geographic_zone),
        toNullable(r.priority),
        toNullable(r.status),
      ];
      await client.query(sql, params);
      inserted++;
      if (inserted % 50 === 0) console.log(`  ${inserted}/${rows.length}…`);
    }

    await client.query("COMMIT");
    console.log(`✅ Seeded ${inserted} grants.`);

    const { rows: counts } = await client.query(
      "SELECT status, count(*)::int AS n FROM grants GROUP BY status ORDER BY status",
    );
    console.log("By status:", counts);
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
