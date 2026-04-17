/**
 * Audit + fix des URLs des grants
 * - Vérifie chaque URL (HEAD request)
 * - Si 404/dead → remplace par la homepage du domaine
 * - Si redirect → met à jour avec l'URL finale
 *
 * Usage: npx tsx scripts/audit-fix-urls.ts [--dry-run] [--limit N]
 */
import { db } from "../server/db.js";
import { grants } from "../shared/schema.js";
import { sql, eq } from "drizzle-orm";

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const limitIdx = args.indexOf("--limit");
const LIMIT = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : Infinity;

type UrlStatus = "ok" | "redirect" | "dead" | "timeout" | "error";

interface CheckResult {
  status: UrlStatus;
  httpCode: number | null;
  finalUrl: string | null;
  homepage: string | null;
}

function getHomepage(url: string): string | null {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.hostname}`;
  } catch {
    return null;
  }
}

async function checkUrl(url: string): Promise<CheckResult> {
  const homepage = getHomepage(url);

  // Skip les URLs relatives non résolues
  if (!url.startsWith("http")) {
    return { status: "error", httpCode: null, finalUrl: null, homepage };
  }

  // Utilise child_process curl car Node fetch a des bugs avec pg pool sur Windows
  const { execSync } = await import("child_process");

  try {
    const result = execSync(
      `curl -sI -L -o /dev/null -w "%{http_code} %{url_effective}" --max-time 10 --user-agent "Mozilla/5.0 (compatible; SubventionMatch/1.0)" "${url}"`,
      { timeout: 15_000, encoding: "utf-8" }
    ).trim();

    const [codeStr, finalUrl] = result.split(" ", 2);
    const code = parseInt(codeStr, 10);

    if (code >= 200 && code < 400) {
      const isRedirect = finalUrl && finalUrl !== url;
      return { status: isRedirect ? "redirect" : "ok", httpCode: code, finalUrl: isRedirect ? finalUrl : null, homepage };
    }

    return { status: "dead", httpCode: code, finalUrl: null, homepage };
  } catch (e: any) {
    if (e.message?.includes("timed out")) {
      return { status: "timeout", httpCode: null, finalUrl: null, homepage };
    }
    return { status: "error", httpCode: null, finalUrl: null, homepage };
  }
}

async function run() {
  const startTime = Date.now();

  console.log("=".repeat(60));
  console.log("  AUDIT & FIX URLs — SubventionMatch");
  if (DRY_RUN) console.log("  (DRY RUN)");
  console.log("=".repeat(60));
  console.log();

  let allGrants = await db
    .select({ id: grants.id, title: grants.title, url: grants.url, improvedUrl: grants.improvedUrl })
    .from(grants)
    .where(sql`status = 'active' AND url IS NOT NULL AND url != '#' AND url != ''`);

  console.log(`Grants avec URL: ${allGrants.length}`);
  if (LIMIT < Infinity) {
    allGrants = allGrants.slice(0, LIMIT);
    console.log(`Limite: ${LIMIT}`);
  }
  console.log();

  const stats = { ok: 0, redirect: 0, dead: 0, timeout: 0, error: 0, fixed: 0, homepageFallback: 0 };
  const deadUrls: { title: string; url: string; code: number | null }[] = [];

  for (let i = 0; i < allGrants.length; i++) {
    const grant = allGrants[i];
    const url = grant.improvedUrl || grant.url!;
    const shortTitle = (grant.title || "").substring(0, 45);

    process.stdout.write(`[${i + 1}/${allGrants.length}] ${shortTitle}... `);

    const result = await checkUrl(url);
    stats[result.status]++;

    switch (result.status) {
      case "ok":
        console.log("✅");
        break;

      case "redirect":
        console.log(`🔄 → ${result.finalUrl?.substring(0, 60)}`);
        if (!DRY_RUN && result.finalUrl) {
          await db.update(grants).set({ improvedUrl: result.finalUrl, updatedAt: new Date() }).where(eq(grants.id, grant.id));
          stats.fixed++;
        }
        break;

      case "dead":
        console.log(`💀 ${result.httpCode}`);
        deadUrls.push({ title: shortTitle, url, code: result.httpCode });

        // Fallback homepage
        if (!DRY_RUN && result.homepage) {
          // Vérifier que la homepage marche
          const homeCheck = await checkUrl(result.homepage);
          if (homeCheck.status === "ok" || homeCheck.status === "redirect") {
            const fallbackUrl = homeCheck.finalUrl || result.homepage;
            await db.update(grants).set({ improvedUrl: fallbackUrl, updatedAt: new Date() }).where(eq(grants.id, grant.id));
            stats.homepageFallback++;
            console.log(`  → fallback homepage: ${fallbackUrl}`);
          }
        }
        break;

      case "timeout":
        console.log("⏱️ timeout");
        break;

      case "error":
        console.log("❌ erreur réseau");
        break;
    }

    // Pause entre requêtes
    await new Promise((r) => setTimeout(r, 300));

    if ((i + 1) % 50 === 0) {
      const elapsed = ((Date.now() - startTime) / 60000).toFixed(1);
      console.log(`\n--- ${i + 1}/${allGrants.length} | ok=${stats.ok} dead=${stats.dead} redirect=${stats.redirect} | ${elapsed}m ---\n`);
    }
  }

  const elapsed = ((Date.now() - startTime) / 60000).toFixed(1);
  console.log("\n" + "=".repeat(60));
  console.log("  RÉSUMÉ");
  console.log("=".repeat(60));
  console.log(`  Durée: ${elapsed} min`);
  console.log(`  OK: ${stats.ok}`);
  console.log(`  Redirects (mis à jour): ${stats.redirect}`);
  console.log(`  Dead (404/5xx): ${stats.dead}`);
  console.log(`  Timeout: ${stats.timeout}`);
  console.log(`  Erreur réseau: ${stats.error}`);
  console.log(`  URLs mises à jour: ${stats.fixed}`);
  console.log(`  Fallback homepage: ${stats.homepageFallback}`);

  if (deadUrls.length > 0) {
    console.log(`\n  URLs mortes (${deadUrls.length}):`);
    for (const d of deadUrls.slice(0, 20)) {
      console.log(`    [${d.code}] ${d.title} → ${d.url.substring(0, 70)}`);
    }
    if (deadUrls.length > 20) console.log(`    ... et ${deadUrls.length - 20} de plus`);
  }
  console.log("=".repeat(60));
}

run()
  .then(() => process.exit(0))
  .catch((e) => { console.error("Erreur:", e); process.exit(1); });
