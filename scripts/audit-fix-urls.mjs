/**
 * Audit + fix des URLs — version Node pure (pas tsx)
 * Lit les grants depuis la DB via pg directement, vérifie les URLs avec curl.
 *
 * Usage: node scripts/audit-fix-urls.mjs [--dry-run] [--limit N]
 */
import pg from "pg";
import { execSync } from "child_process";

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const limitIdx = args.indexOf("--limit");
const LIMIT = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : Infinity;

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

function getHomepage(url) {
  try { const u = new URL(url); return `${u.protocol}//${u.hostname}`; } catch { return null; }
}

function checkUrl(url) {
  const homepage = getHomepage(url);
  if (!url.startsWith("http")) return { status: "error", code: null, finalUrl: null, homepage };

  try {
    let raw;
    try {
      raw = execSync(
        `curl -sk -L -o NUL -w "%{http_code} %{url_effective}" --max-time 10 --user-agent "Mozilla/5.0" "${url}"`,
        { timeout: 15_000, encoding: "utf-8" }
      ).trim();
    } catch (e) {
      // curl may exit non-zero even with valid output (e.g. exit 23 on Windows)
      raw = (e.stdout || "").trim();
      if (!raw) {
        if (e.message?.includes("timed out")) return { status: "timeout", code: null, finalUrl: null, homepage };
        return { status: "error", code: null, finalUrl: null, homepage };
      }
    }

    const spaceIdx = raw.indexOf(" ");
    const code = parseInt(raw.substring(0, spaceIdx), 10);
    const finalUrl = raw.substring(spaceIdx + 1);

    if (isNaN(code) || code === 0) return { status: "error", code: null, finalUrl: null, homepage };

    if (code >= 200 && code < 400) {
      const isRedirect = finalUrl && finalUrl !== url;
      return { status: isRedirect ? "redirect" : "ok", code, finalUrl: isRedirect ? finalUrl : null, homepage };
    }
    return { status: "dead", code, finalUrl: null, homepage };
  } catch (e) {
    return { status: "error", code: null, finalUrl: null, homepage };
  }
}

async function run() {
  const startTime = Date.now();
  console.log("=".repeat(60));
  console.log("  AUDIT & FIX URLs — SubventionMatch");
  if (DRY_RUN) console.log("  (DRY RUN)");
  console.log("=".repeat(60));
  console.log();

  const { rows } = await pool.query(
    `SELECT id, title, url, improved_url FROM grants WHERE status = 'active' AND url IS NOT NULL AND url != '#' AND url != '' ORDER BY title`
  );

  let allGrants = rows;
  console.log(`Grants avec URL: ${allGrants.length}`);
  if (LIMIT < Infinity) { allGrants = allGrants.slice(0, LIMIT); console.log(`Limite: ${LIMIT}`); }
  console.log();

  const stats = { ok: 0, redirect: 0, dead: 0, timeout: 0, error: 0, fixed: 0, homepageFallback: 0 };
  const deadUrls = [];

  for (let i = 0; i < allGrants.length; i++) {
    const grant = allGrants[i];
    const url = grant.improved_url || grant.url;
    const shortTitle = (grant.title || "").substring(0, 45);

    process.stdout.write(`[${i + 1}/${allGrants.length}] ${shortTitle}... `);

    const result = checkUrl(url);
    stats[result.status]++;

    switch (result.status) {
      case "ok":
        console.log("\u2705");
        break;
      case "redirect":
        console.log(`\uD83D\uDD04 \u2192 ${result.finalUrl?.substring(0, 60)}`);
        if (!DRY_RUN && result.finalUrl) {
          await pool.query("UPDATE grants SET improved_url = $1, updated_at = NOW() WHERE id = $2", [result.finalUrl, grant.id]);
          stats.fixed++;
        }
        break;
      case "dead":
        console.log(`\uD83D\uDC80 ${result.code}`);
        deadUrls.push({ title: shortTitle, url, code: result.code });
        if (!DRY_RUN && result.homepage) {
          const homeResult = checkUrl(result.homepage);
          if (homeResult.status === "ok" || homeResult.status === "redirect") {
            const fallback = homeResult.finalUrl || result.homepage;
            await pool.query("UPDATE grants SET improved_url = $1, updated_at = NOW() WHERE id = $2", [fallback, grant.id]);
            stats.homepageFallback++;
            console.log(`  \u2192 fallback: ${fallback}`);
          }
        }
        break;
      case "timeout":
        console.log("\u23F1\uFE0F timeout");
        break;
      case "error":
        console.log("\u274C erreur");
        break;
    }

    // Pause
    if (i < allGrants.length - 1) await new Promise(r => setTimeout(r, 200));

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
  console.log(`  Redirects: ${stats.redirect}`);
  console.log(`  Dead (404/5xx): ${stats.dead}`);
  console.log(`  Timeout: ${stats.timeout}`);
  console.log(`  Erreur réseau: ${stats.error}`);
  console.log(`  URLs mises à jour (redirect): ${stats.fixed}`);
  console.log(`  Fallback homepage: ${stats.homepageFallback}`);

  if (deadUrls.length > 0) {
    console.log(`\n  URLs mortes (${deadUrls.length}):`);
    for (const d of deadUrls.slice(0, 30)) {
      console.log(`    [${d.code}] ${d.title} \u2192 ${d.url.substring(0, 70)}`);
    }
    if (deadUrls.length > 30) console.log(`    ... et ${deadUrls.length - 30} de plus`);
  }
  console.log("=".repeat(60));

  await pool.end();
}

run().catch(e => { console.error("Fatal:", e); process.exit(1); });
