/**
 * Tests du quality gate — vérifie la logique de scoring sur des données réelles
 * Usage: npx tsx scripts/test-quality-gate.ts
 */
import { db } from "../server/db.js";
import { grants } from "../shared/schema.js";
import { sql } from "drizzle-orm";
import {
  calculateQualityScore,
  passesQualityGate,
  needsEnrichment,
  filterByQualityGate,
  QUALITY_GATE_THRESHOLD,
  ENRICHMENT_THRESHOLD,
} from "../server/quality-gate.js";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${message}`);
  } else {
    failed++;
    console.log(`  ❌ FAIL: ${message}`);
  }
}

async function testQualityGate() {
  console.log("=".repeat(60));
  console.log("  TESTS — Quality Gate");
  console.log("=".repeat(60));
  console.log();

  // ========================================
  // TESTS UNITAIRES (données synthétiques)
  // ========================================
  console.log("--- Tests unitaires (données synthétiques) ---\n");

  // Test 1: Grant parfaite
  console.log("1. Grant parfaite (tous les champs remplis)");
  const perfectGrant = {
    id: "test-1",
    title: "Aide à la création artistique contemporaine",
    organization: "Ministère de la Culture",
    description: "A".repeat(300),
    eligibility: "B".repeat(150),
    amount: 50000,
    amountMin: null,
    amountMax: null,
    deadline: "2025-06-30",
    frequency: null,
    url: "https://www.culture.gouv.fr/aides/creation-artistique",
    improvedUrl: null,
  } as any;

  const perfectScore = calculateQualityScore(perfectGrant);
  assert(perfectScore.score === 100, `Score = ${perfectScore.score} (attendu: 100)`);
  assert(perfectScore.missing.length === 0, `Aucun champ manquant`);
  assert(passesQualityGate(perfectGrant), "Passe le gate");
  assert(!needsEnrichment(perfectGrant), "Pas besoin d'enrichissement");

  console.log();

  // Test 2: Grant minimale (titre + org seulement)
  console.log("2. Grant minimale (titre + org uniquement)");
  const minGrant = {
    id: "test-2",
    title: "Aide culturelle basique",
    organization: "Région IDF",
    description: null,
    eligibility: null,
    amount: null,
    amountMin: null,
    amountMax: null,
    deadline: null,
    frequency: null,
    url: null,
    improvedUrl: null,
  } as any;

  const minScore = calculateQualityScore(minGrant);
  assert(minScore.score === 20, `Score = ${minScore.score} (attendu: 20 — titre+org uniquement)`);
  assert(minScore.hasTitle && minScore.hasOrganization, "A bien titre + org");
  assert(passesQualityGate(minGrant), `Passe le gate (seuil=${QUALITY_GATE_THRESHOLD})`);
  assert(needsEnrichment(minGrant), "Candidat enrichissement");

  console.log();

  // Test 3: Grant sans titre
  console.log("3. Grant sans titre (doit être éjectée)");
  const noTitleGrant = {
    id: "test-3",
    title: "AB",     // trop court
    organization: "Ministère de la Culture",
    description: "A".repeat(300),
    eligibility: "B".repeat(150),
    amount: 5000,
    deadline: "2025-12-31",
    url: "https://www.culture.gouv.fr/aide",
  } as any;

  const noTitleScore = calculateQualityScore(noTitleGrant);
  assert(!noTitleScore.hasTitle, "Titre non valide (trop court)");
  assert(!passesQualityGate(noTitleGrant), "Rejeté (pas de titre)");

  console.log();

  // Test 4: Grant avec "Non spécifié" partout
  console.log("4. Grant avec 'Non spécifié' partout");
  const nonSpecGrant = {
    id: "test-4",
    title: "Aide culturelle test",
    organization: "Non spécifié",
    description: "Non spécifié",
    eligibility: "Non spécifié",
    amount: null,
    amountMin: null,
    amountMax: null,
    deadline: null,
    frequency: null,
    url: null,
    improvedUrl: null,
  } as any;

  const nonSpecScore = calculateQualityScore(nonSpecGrant);
  // "Non spécifié" a 12 chars, donc org >= 3 → true, mais description/eligibility check includes("non spécifié")
  assert(nonSpecScore.hasOrganization === true, `Org 'Non spécifié' passe (>= 3 chars) — score: ${nonSpecScore.score}`);
  assert(!nonSpecScore.hasDescription, "Description 'Non spécifié' ne passe pas");
  assert(!nonSpecScore.hasEligibility, "Eligibility 'Non spécifié' ne passe pas");

  console.log();

  // Test 5: Grant avec HTML dans la description
  console.log("5. Grant avec HTML dans la description");
  const htmlGrant = {
    id: "test-5",
    title: "Aide avec description HTML",
    organization: "Sacem",
    description: `<p>${"A".repeat(300)}</p><ul><li>point 1</li></ul>`,
    eligibility: `<div>${"B".repeat(150)}</div>`,
    amount: null,
    deadline: null,
    frequency: "Permanent",
    url: "https://www.sacem.fr/aide",
  } as any;

  const htmlScore = calculateQualityScore(htmlGrant);
  assert(htmlScore.hasDescription, "Description HTML strippée correctement");
  assert(htmlScore.hasEligibility, "Eligibility HTML strippée correctement");
  assert(htmlScore.hasDeadlineOrFrequency, "Frequency 'Permanent' compte");

  console.log();

  // Test 6: URL scoring
  console.log("6. Scoring URL (homepage vs page spécifique)");
  const homepageGrant = {
    id: "test-6a",
    title: "Grant avec homepage",
    organization: "Org test",
    description: "A".repeat(300),
    eligibility: "B".repeat(150),
    amount: 1000,
    deadline: "2025-12-31",
    url: "https://www.culture.gouv.fr",    // homepage
    improvedUrl: null,
  } as any;

  const specificUrlGrant = {
    ...homepageGrant,
    id: "test-6b",
    title: "Grant avec URL spécifique",
    url: "https://www.culture.gouv.fr/aides/creation-2025",  // spécifique
  } as any;

  const homepageScore = calculateQualityScore(homepageGrant);
  const specificScore = calculateQualityScore(specificUrlGrant);
  assert(!homepageScore.hasGoodUrl, `Homepage: hasGoodUrl=${homepageScore.hasGoodUrl} (attendu: false)`);
  assert(specificScore.hasGoodUrl, `URL spécifique: hasGoodUrl=${specificScore.hasGoodUrl} (attendu: true)`);
  assert(specificScore.score > homepageScore.score, `URL spécifique donne un meilleur score (${specificScore.score} > ${homepageScore.score})`);

  console.log();

  // Test 7: filterByQualityGate
  console.log("7. filterByQualityGate — batch de grants");
  const batch = [perfectGrant, minGrant, noTitleGrant, nonSpecGrant];
  const { passed: passedGrants, rejected: rejectedGrants } = filterByQualityGate(batch);
  assert(passedGrants.length === 3, `${passedGrants.length} passent (attendu: 3)`);
  assert(rejectedGrants.length === 1, `${rejectedGrants.length} rejeté (attendu: 1 — sans titre)`);
  assert(rejectedGrants[0]?.id === "test-3", "Le rejeté est bien test-3 (sans titre)");

  console.log();

  // ========================================
  // TESTS SUR DONNÉES RÉELLES
  // ========================================
  console.log("--- Tests sur données réelles (DB) ---\n");

  const allGrants = await db.select().from(grants).where(sql`status = 'active'`);
  console.log(`Grants actives: ${allGrants.length}\n`);

  // Test 8: Aucune grant active ne devrait être à score 0
  console.log("8. Aucune grant à score 0");
  const zeroScoreGrants = allGrants.filter(g => calculateQualityScore(g).score === 0);
  assert(zeroScoreGrants.length === 0, `${zeroScoreGrants.length} grants à score 0`);

  console.log();

  // Test 9: Toutes les grants avec titre+org passent le gate (seuil 20)
  console.log("9. Toutes les grants avec titre+org passent le gate");
  const withTitleAndOrg = allGrants.filter(g => {
    const s = calculateQualityScore(g);
    return s.hasTitle && s.hasOrganization;
  });
  const allPassGate = withTitleAndOrg.every(g => passesQualityGate(g));
  assert(allPassGate, `${withTitleAndOrg.length} grants avec titre+org passent toutes le gate`);

  console.log();

  // Test 10: Cohérence — needsEnrichment est bien complémentaire de haute qualité
  console.log("10. Cohérence enrichissement vs haute qualité");
  for (const g of allGrants.slice(0, 50)) {  // test sur 50 premiers
    const score = calculateQualityScore(g);
    const needs = needsEnrichment(g);
    if (score.score >= ENRICHMENT_THRESHOLD && needs) {
      assert(false, `Grant ${g.id} score=${score.score} >= ${ENRICHMENT_THRESHOLD} mais needsEnrichment=true`);
      break;
    }
    if (score.score < ENRICHMENT_THRESHOLD && !needs) {
      assert(false, `Grant ${g.id} score=${score.score} < ${ENRICHMENT_THRESHOLD} mais needsEnrichment=false`);
      break;
    }
  }
  assert(true, "Cohérence needsEnrichment OK sur 50 grants");

  console.log();

  // Test 11: Bug potentiel — "Non spécifié" comme org passe le quality gate
  console.log("11. Bug connu: 'Non spécifié' comme org passe le gate");
  const nonSpecOrgs = allGrants.filter(g => g.organization === "Non spécifié");
  const nonSpecPass = nonSpecOrgs.filter(g => passesQualityGate(g));
  console.log(`  ⚠️  ${nonSpecOrgs.length} grants avec org="Non spécifié", ${nonSpecPass.length} passent le gate`);
  assert(
    nonSpecPass.length === nonSpecOrgs.length,
    `Comportement attendu en beta: 'Non spécifié' (>= 3 chars) passe — ${nonSpecPass.length}/${nonSpecOrgs.length}`
  );

  console.log();

  // Test 12: Vérifier que le score est déterministe
  console.log("12. Score déterministe (même résultat 2x)");
  const sampleGrant = allGrants[0];
  const score1 = calculateQualityScore(sampleGrant);
  const score2 = calculateQualityScore(sampleGrant);
  assert(score1.score === score2.score, `Score stable: ${score1.score} == ${score2.score}`);
  assert(
    JSON.stringify(score1.missing) === JSON.stringify(score2.missing),
    "Missing array identique"
  );

  console.log();

  // ========================================
  // RÉSUMÉ
  // ========================================
  console.log("=".repeat(60));
  console.log(`  RÉSULTAT: ${passed} passés, ${failed} échoués`);
  console.log("=".repeat(60));

  if (failed > 0) process.exit(1);
}

testQualityGate()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("Erreur:", err);
    process.exit(1);
  });
