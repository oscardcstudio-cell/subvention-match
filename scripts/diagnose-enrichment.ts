/**
 * Script de diagnostic complet de l'enrichissement
 * Usage: npx tsx scripts/diagnose-enrichment.ts
 */
import { db } from "../server/db.js";
import { grants } from "../shared/schema.js";
import { sql, eq } from "drizzle-orm";
import { calculateQualityScore, QUALITY_GATE_THRESHOLD, ENRICHMENT_THRESHOLD } from "../server/quality-gate.js";

async function diagnose() {
  console.log("=".repeat(70));
  console.log("  DIAGNOSTIC ENRICHISSEMENT — SubventionMatch");
  console.log("=".repeat(70));
  console.log();

  // 1. Stats globales
  const allGrants = await db.select().from(grants).where(sql`status = 'active'`);
  const total = allGrants.length;
  console.log(`GRANTS ACTIVES: ${total}`);
  console.log();

  // 2. Enrichment status breakdown
  const statusCounts = { pending: 0, in_progress: 0, completed: 0, failed: 0, null_or_empty: 0 };
  for (const g of allGrants) {
    const s = g.enrichmentStatus as string | null;
    if (!s || s === "") statusCounts.null_or_empty++;
    else if (s in statusCounts) (statusCounts as any)[s]++;
  }
  console.log("ENRICHMENT STATUS:");
  console.log(`  pending:       ${statusCounts.pending}`);
  console.log(`  in_progress:   ${statusCounts.in_progress}`);
  console.log(`  completed:     ${statusCounts.completed}`);
  console.log(`  failed:        ${statusCounts.failed}`);
  console.log(`  null/vide:     ${statusCounts.null_or_empty}`);
  console.log();

  // 3. Quality scores distribution
  const scores = allGrants.map(g => {
    const breakdown = calculateQualityScore(g);
    return { id: g.id, title: g.title?.substring(0, 60), score: breakdown.score, missing: breakdown.missing };
  });

  const scoreBuckets = { "0-19": 0, "20-39": 0, "40-59": 0, "60-79": 0, "80-100": 0 };
  for (const s of scores) {
    if (s.score < 20) scoreBuckets["0-19"]++;
    else if (s.score < 40) scoreBuckets["20-39"]++;
    else if (s.score < 60) scoreBuckets["40-59"]++;
    else if (s.score < 80) scoreBuckets["60-79"]++;
    else scoreBuckets["80-100"]++;
  }
  const avgScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;

  console.log(`QUALITY SCORES (seuil passage: ${QUALITY_GATE_THRESHOLD}, seuil enrichissement: ${ENRICHMENT_THRESHOLD}):`);
  console.log(`  Score moyen: ${avgScore.toFixed(1)}/100`);
  Object.entries(scoreBuckets).forEach(([range, count]) => {
    const pct = ((count / total) * 100).toFixed(1);
    const bar = "█".repeat(Math.round(count / total * 40));
    console.log(`  ${range.padEnd(8)}: ${String(count).padStart(4)} (${pct.padStart(5)}%) ${bar}`);
  });
  console.log();

  // 4. Qui passe le quality gate?
  const passGate = scores.filter(s => s.score >= QUALITY_GATE_THRESHOLD).length;
  const needsEnrich = scores.filter(s => s.score >= QUALITY_GATE_THRESHOLD && s.score < ENRICHMENT_THRESHOLD).length;
  const highQuality = scores.filter(s => s.score >= ENRICHMENT_THRESHOLD).length;
  const rejected = scores.filter(s => s.score < QUALITY_GATE_THRESHOLD).length;

  console.log("FILTRAGE:");
  console.log(`  Passe le gate (>=${QUALITY_GATE_THRESHOLD}):       ${passGate}/${total} (${((passGate/total)*100).toFixed(1)}%)`);
  console.log(`  Haute qualité (>=${ENRICHMENT_THRESHOLD}):    ${highQuality}/${total} (${((highQuality/total)*100).toFixed(1)}%)`);
  console.log(`  Candidat enrichissement:  ${needsEnrich}/${total} (${((needsEnrich/total)*100).toFixed(1)}%)`);
  console.log(`  Rejeté (<${QUALITY_GATE_THRESHOLD}):             ${rejected}/${total} (${((rejected/total)*100).toFixed(1)}%)`);
  console.log();

  // 5. Top raisons de champs manquants
  const reasonCounts = new Map<string, number>();
  for (const s of scores) {
    for (const m of s.missing) {
      reasonCounts.set(m, (reasonCounts.get(m) || 0) + 1);
    }
  }
  const sortedReasons = Array.from(reasonCounts.entries()).sort((a, b) => b[1] - a[1]);
  console.log("TOP CHAMPS MANQUANTS:");
  for (const [reason, count] of sortedReasons) {
    const pct = ((count / total) * 100).toFixed(1);
    console.log(`  ${reason.padEnd(35)}: ${String(count).padStart(4)} (${pct}%)`);
  }
  console.log();

  // 6. Taux de remplissage des champs clés
  const fields = [
    { name: "title", label: "Titre", get: (g: any) => g.title?.trim() },
    { name: "organization", label: "Organisation", get: (g: any) => g.organization?.trim() },
    { name: "description", label: "Description", get: (g: any) => g.description?.replace(/<[^>]*>/g, "").trim() },
    { name: "eligibility", label: "Éligibilité", get: (g: any) => g.eligibility?.replace(/<[^>]*>/g, "").trim() },
    { name: "amount", label: "Montant (any)", get: (g: any) => g.amount || g.amountMin || g.amountMax },
    { name: "deadline", label: "Deadline", get: (g: any) => g.deadline?.trim() },
    { name: "frequency", label: "Fréquence", get: (g: any) => g.frequency?.trim() },
    { name: "url", label: "URL", get: (g: any) => g.url?.trim() },
    { name: "improvedUrl", label: "URL améliorée", get: (g: any) => g.improvedUrl?.trim() },
    { name: "contactEmail", label: "Email contact", get: (g: any) => g.contactEmail?.trim() },
    { name: "helpResources", label: "Ressources aide", get: (g: any) => Array.isArray(g.helpResources) && g.helpResources.length > 0 ? "yes" : null },
    { name: "preparationAdvice", label: "Conseils prép.", get: (g: any) => g.preparationAdvice?.trim() },
    { name: "experienceFeedback", label: "Retours exp.", get: (g: any) => g.experienceFeedback?.trim() },
    { name: "processingTime", label: "Délai traitement", get: (g: any) => g.processingTime?.trim() },
    { name: "eligibleSectors", label: "Secteurs", get: (g: any) => Array.isArray(g.eligibleSectors) && g.eligibleSectors.length > 0 ? "yes" : null },
    { name: "grantType", label: "Type subvention", get: (g: any) => Array.isArray(g.grantType) && g.grantType.length > 0 ? "yes" : null },
    { name: "geographicZone", label: "Zone géo", get: (g: any) => Array.isArray(g.geographicZone) && g.geographicZone.length > 0 ? "yes" : null },
  ];

  console.log("TAUX DE REMPLISSAGE:");
  for (const f of fields) {
    const filled = allGrants.filter(g => {
      const val = f.get(g);
      return val && val !== "" && val !== "Non spécifié" && val !== "Inconnu";
    }).length;
    const pct = ((filled / total) * 100).toFixed(1);
    const bar = "█".repeat(Math.round(filled / total * 30));
    console.log(`  ${f.label.padEnd(20)}: ${String(filled).padStart(4)}/${total} (${pct.padStart(5)}%) ${bar}`);
  }
  console.log();

  // 7. Descriptions — longueur moyenne et distribution
  const descLengths = allGrants
    .map(g => (g.description || "").replace(/<[^>]*>/g, "").trim().length)
    .filter(l => l > 0);
  const avgDesc = descLengths.length > 0 ? descLengths.reduce((a, b) => a + b, 0) / descLengths.length : 0;
  const shortDesc = descLengths.filter(l => l < 200).length;
  const longDesc = descLengths.filter(l => l > 2000).length;
  const goodDesc = descLengths.filter(l => l >= 200 && l <= 2000).length;

  console.log("DESCRIPTIONS:");
  console.log(`  Longueur moyenne: ${avgDesc.toFixed(0)} chars`);
  console.log(`  Trop courtes (<200): ${shortDesc}`);
  console.log(`  Bonne longueur (200-2000): ${goodDesc}`);
  console.log(`  Trop longues (>2000): ${longDesc}`);
  console.log(`  Vides: ${total - descLengths.length}`);
  console.log();

  // 8. Eligibility — idem
  const eligLengths = allGrants
    .map(g => (g.eligibility || "").replace(/<[^>]*>/g, "").trim().length)
    .filter(l => l > 0);
  const avgElig = eligLengths.length > 0 ? eligLengths.reduce((a, b) => a + b, 0) / eligLengths.length : 0;
  const shortElig = eligLengths.filter(l => l < 100).length;
  const longElig = eligLengths.filter(l => l > 2000).length;
  const goodElig = eligLengths.filter(l => l >= 100 && l <= 2000).length;

  console.log("ÉLIGIBILITÉ:");
  console.log(`  Longueur moyenne: ${avgElig.toFixed(0)} chars`);
  console.log(`  Trop courtes (<100): ${shortElig}`);
  console.log(`  Bonne longueur (100-2000): ${goodElig}`);
  console.log(`  Trop longues (>2000): ${longElig}`);
  console.log(`  Vides: ${total - eligLengths.length}`);
  console.log();

  // 9. Top 10 pires grants (score le plus bas)
  const worst = scores.sort((a, b) => a.score - b.score).slice(0, 10);
  console.log("10 PIRES GRANTS (candidats prioritaires pour enrichissement):");
  for (const w of worst) {
    console.log(`  [${w.score}/100] ${w.title} — manque: ${w.missing.join(", ")}`);
  }
  console.log();

  // 10. Organisations "Non spécifié" ou vides
  const badOrgs = allGrants.filter(g =>
    !g.organization ||
    g.organization === "Non spécifié" ||
    g.organization === "Inconnu" ||
    g.organization.trim() === ""
  );
  console.log(`ORGANISATIONS PROBLÉMATIQUES: ${badOrgs.length}/${total}`);
  if (badOrgs.length > 0) {
    const sample = badOrgs.slice(0, 5);
    for (const g of sample) {
      console.log(`  - [org="${g.organization || "(vide)"}"] ${g.title?.substring(0, 60)}`);
    }
    if (badOrgs.length > 5) console.log(`  ... et ${badOrgs.length - 5} de plus`);
  }
  console.log();

  console.log("=".repeat(70));
  console.log("  FIN DU DIAGNOSTIC");
  console.log("=".repeat(70));
}

diagnose()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("Erreur:", err);
    process.exit(1);
  });
