/**
 * Backfill script: add is_recurring column and infer value from frequency text.
 *
 * Usage: npx tsx scripts/backfill-is-recurring.ts
 *
 * Safe to run multiple times (idempotent).
 * 1. ALTER TABLE grants ADD COLUMN IF NOT EXISTS is_recurring boolean DEFAULT false
 * 2. Set is_recurring = true for grants whose frequency indicates recurring
 * 3. Set is_recurring = false for grants whose frequency indicates one-shot
 */

import { db } from "../server/db";
import { grants } from "@shared/schema";
import { sql } from "drizzle-orm";

const RECURRING_KEYWORDS = [
  "annuel",
  "récurrent",
  "permanent",
  "régulier",
  "chaque année",
  "toute l'année",
  "sessions",
  "appels à projets réguliers",
  "variable selon",
];

const ONE_OFF_KEYWORDS = ["ponctuel", "unique", "one-shot", "exceptionnel"];

function classifyFrequency(
  frequency: string | null
): "recurring" | "one-off" | "unknown" {
  if (!frequency || frequency.trim() === "") return "unknown";
  const freq = frequency.toLowerCase();

  if (ONE_OFF_KEYWORDS.some((k) => freq.includes(k))) return "one-off";
  if (RECURRING_KEYWORDS.some((k) => freq.includes(k))) return "recurring";
  return "unknown";
}

async function main() {
  console.log("🔧 Backfill is_recurring...\n");

  // Step 1: ensure column exists (Drizzle push may have already created it)
  await db.execute(
    sql`ALTER TABLE grants ADD COLUMN IF NOT EXISTS is_recurring boolean DEFAULT false`
  );
  console.log("✅ Column is_recurring exists\n");

  // Step 2: fetch all grants
  const allGrants = await db.select().from(grants);
  console.log(`📊 ${allGrants.length} grants in DB\n`);

  let setRecurring = 0;
  let setOneOff = 0;
  let unknown = 0;

  for (const grant of allGrants) {
    const classification = classifyFrequency(grant.frequency);

    if (classification === "recurring" && grant.isRecurring !== true) {
      await db
        .update(grants)
        .set({ isRecurring: true })
        .where(sql`id = ${grant.id}`);
      setRecurring++;
      console.log(
        `  🔄 ${grant.title.substring(0, 50)}... → recurring (frequency: "${grant.frequency}")`
      );
    } else if (classification === "one-off" && grant.isRecurring !== false) {
      await db
        .update(grants)
        .set({ isRecurring: false })
        .where(sql`id = ${grant.id}`);
      setOneOff++;
      console.log(
        `  ⏹️  ${grant.title.substring(0, 50)}... → one-off (frequency: "${grant.frequency}")`
      );
    } else if (classification === "unknown") {
      unknown++;
    }
  }

  console.log(`\n📊 Résultat :`);
  console.log(`   🔄 ${setRecurring} grants marquées récurrentes`);
  console.log(`   ⏹️  ${setOneOff} grants marquées ponctuelles`);
  console.log(
    `   ❓ ${unknown} grants sans frequency (laissées à false par défaut)`
  );
  console.log(`\n✅ Backfill terminé.`);

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Backfill failed:", err);
  process.exit(1);
});
