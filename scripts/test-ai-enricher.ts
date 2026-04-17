/**
 * Tests de l'ai-enricher — vérifie les appels DeepSeek et le parsing
 * Usage: npx tsx scripts/test-ai-enricher.ts
 *
 * Ce test fait UN SEUL appel API réel (pour vérifier la connexion)
 * puis teste la logique de parsing/matching sans appels API.
 */
import { db } from "../server/db.js";
import { grants } from "../shared/schema.js";
import { sql, eq } from "drizzle-orm";

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

// Reproduce la logique de callDeepSeek pour tester
async function callDeepSeek(prompt: string): Promise<string> {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY manquante");

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://subventionmatch.com",
      "X-Title": "SubventionMatch",
    },
    body: JSON.stringify({
      model: "deepseek/deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "Tu es un expert en subventions culturelles françaises. Ton rôle est d'améliorer la qualité et la clarté des informations de subventions pour les rendre plus accessibles aux artistes et associations culturelles.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur OpenRouter: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
}

async function testAiEnricher() {
  console.log("=".repeat(60));
  console.log("  TESTS — AI Enricher");
  console.log("=".repeat(60));
  console.log();

  // ========================================
  // Test 1: Vérifier que l'API OpenRouter répond
  // ========================================
  console.log("1. Connexion OpenRouter / DeepSeek");
  const apiKey = process.env.OPENROUTER_API_KEY;
  assert(!!apiKey, `OPENROUTER_API_KEY est configurée (${apiKey?.substring(0, 8)}...)`);

  let apiWorks = false;
  try {
    const testResp = await callDeepSeek(
      'Réponds uniquement "OK" si tu reçois ce message.'
    );
    apiWorks = testResp.toLowerCase().includes("ok");
    assert(apiWorks, `API répond: "${testResp.substring(0, 50)}"`);
  } catch (e: any) {
    assert(false, `API erreur: ${e.message}`);
  }
  console.log();

  // ========================================
  // Test 2: Enrichissement d'organisation (test réel)
  // ========================================
  if (apiWorks) {
    console.log("2. Enrichissement d'organisation (appel réel)");

    // Trouver une grant sans org
    const [sampleGrant] = await db
      .select()
      .from(grants)
      .where(sql`status = 'active' AND organization = 'Non spécifié'`)
      .limit(1);

    if (sampleGrant) {
      console.log(`  Grant: "${sampleGrant.title?.substring(0, 60)}"`);
      const desc = (sampleGrant.description || "").replace(/<[^>]*>/g, "").substring(0, 1000);

      const prompt = `Trouve le nom de l'organisme (fondation, ministère, collectivité, etc.) qui propose cette subvention culturelle française :
TITRE : "${sampleGrant.title}"
DESCRIPTION : "${desc}"

Réponds UNIQUEMENT avec le nom de l'organisme, pas de phrases.`;

      try {
        const org = await callDeepSeek(prompt);
        const cleanOrg = org.trim().replace(/^["']|["']$/g, "");
        console.log(`  Réponse DeepSeek: "${cleanOrg}"`);
        assert(cleanOrg.length > 0, `Organisation trouvée: "${cleanOrg}"`);
        assert(cleanOrg.length < 100, `Longueur raisonnable: ${cleanOrg.length} chars`);
        assert(
          !cleanOrg.toLowerCase().includes("inconnu"),
          "Pas 'inconnu'"
        );
      } catch (e: any) {
        assert(false, `Erreur enrichissement org: ${e.message}`);
      }
    } else {
      console.log("  (aucune grant sans org trouvée — skip)");
    }
    console.log();

    // ========================================
    // Test 3: Enrichissement de description courte (test réel)
    // ========================================
    console.log("3. Enrichissement de description courte (appel réel)");

    const [shortDescGrant] = await db
      .select()
      .from(grants)
      .where(
        sql`status = 'active' AND length(regexp_replace(COALESCE(description, ''), '<[^>]*>', '', 'g')) < 200 AND length(regexp_replace(COALESCE(description, ''), '<[^>]*>', '', 'g')) > 10`
      )
      .limit(1);

    if (shortDescGrant) {
      const currentDesc = (shortDescGrant.description || "").replace(/<[^>]*>/g, "").trim();
      console.log(`  Grant: "${shortDescGrant.title?.substring(0, 60)}"`);
      console.log(`  Description actuelle (${currentDesc.length} chars): "${currentDesc.substring(0, 80)}..."`);

      const prompt = `Génère une description complète (200-500 caractères) pour cette subvention culturelle française.

TITRE : "${shortDescGrant.title}"
DESCRIPTION ACTUELLE : "${currentDesc}"
ÉLIGIBILITÉ : "${(shortDescGrant.eligibility || "").replace(/<[^>]*>/g, "").substring(0, 500)}"
ORGANISME : "${shortDescGrant.organization || "Non spécifié"}"

CONSIGNES :
- Explique l'objectif de cette aide culturelle
- Mentionne le type de projets soutenus
- Utilise un ton professionnel et informatif
- Entre 200 et 500 caractères
- Réponds UNIQUEMENT avec la description, pas de préambule.`;

      try {
        const newDesc = await callDeepSeek(prompt);
        console.log(`  Nouvelle description (${newDesc.length} chars): "${newDesc.substring(0, 100)}..."`);
        assert(newDesc.length >= 100, `Description enrichie >= 100 chars (${newDesc.length})`);
        assert(newDesc.length < 2000, `Description pas trop longue (${newDesc.length})`);
      } catch (e: any) {
        assert(false, `Erreur enrichissement description: ${e.message}`);
      }
    } else {
      console.log("  (aucune grant avec description courte — skip)");
    }
    console.log();
  } else {
    console.log("2-3. SKIP — API non fonctionnelle\n");
  }

  // ========================================
  // Test 4: Vérifier la logique de détection des issues dans ai-enricher
  // ========================================
  console.log("4. Logique de détection des issues (sans appel API)");

  // Simuler les issues telles que data-quality-analyzer les génère
  const testIssues = [
    { grantId: "test", grantTitle: "Test", field: "organization", issue: "Organisme manquant", severity: "critical" as const },
    { grantId: "test", grantTitle: "Test", field: "description", issue: "Description trop courte (50 chars, min: 200)", severity: "warning" as const },
    { grantId: "test", grantTitle: "Test", field: "eligibility", issue: "Éligibilité manquante", severity: "critical" as const },
    { grantId: "test", grantTitle: "Test", field: "title", issue: "Titre trop long (150 chars, max: 100)", severity: "warning" as const },
    { grantId: "test", grantTitle: "Test", field: "description", issue: "Description trop longue (3000 chars, max: 2000)", severity: "info" as const },
  ];

  // Reproduce la logique du ai-enricher pour détecter les issues
  const hasLongTitle = testIssues.some(i => i.field === "title" && i.issue.toLowerCase().includes("long"));
  const hasShortDescription = testIssues.some(i => i.field === "description" && i.issue.toLowerCase().includes("court"));
  const hasLongDescription = testIssues.some(i => i.field === "description" && i.issue.toLowerCase().includes("long"));
  const hasMissingDescription = testIssues.some(i => i.field === "description" && i.issue.toLowerCase().includes("manquant"));
  const hasMissingEligibility = testIssues.some(i => i.field === "eligibility" && i.issue.toLowerCase().includes("manquant"));
  const hasMissingOrg = testIssues.some(i => i.field === "organization" && i.issue.toLowerCase().includes("manquant"));

  assert(hasLongTitle, "Détecte 'titre trop long'");
  assert(hasShortDescription, "Détecte 'description trop courte'");
  assert(hasLongDescription, "Détecte 'description trop longue'");
  assert(!hasMissingDescription, "Pas de 'description manquante' (c'est 'trop courte')");
  assert(hasMissingEligibility, "Détecte 'éligibilité manquante'");
  assert(hasMissingOrg, "Détecte 'organisme manquant'");

  console.log();

  // ========================================
  // Test 5: Vérifier que le enricher ne modifie PAS la DB pendant nos tests
  // ========================================
  console.log("5. Vérifier l'état de la DB (pas de modifications)");
  const [checkGrant] = await db
    .select({ enrichmentStatus: grants.enrichmentStatus })
    .from(grants)
    .where(sql`status = 'active'`)
    .limit(1);
  assert(checkGrant?.enrichmentStatus === "pending", `EnrichmentStatus toujours 'pending' (${checkGrant?.enrichmentStatus})`);

  console.log();

  // ========================================
  // Test 6: Problèmes identifiés dans le code
  // ========================================
  console.log("6. Problèmes identifiés dans le code ai-enricher.ts");
  console.log("  ⚠️  L'enricher ne met PAS à jour enrichmentStatus après enrichissement");
  console.log("  ⚠️  enrichment-service.ts a un TODO et ne fait rien (juste un délai)");
  console.log("  ⚠️  Pas de retry si l'API échoue");
  console.log("  ⚠️  Pas de validation du résultat IA (hallucinations possibles)");
  console.log("  ⚠️  La détection 'manquante' vs 'manquants' vs 'manquant' est fragile");

  console.log();

  // ========================================
  // RÉSUMÉ
  // ========================================
  console.log("=".repeat(60));
  console.log(`  RÉSULTAT: ${passed} passés, ${failed} échoués`);
  console.log("=".repeat(60));

  if (failed > 0) process.exit(1);
}

testAiEnricher()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("Erreur:", err);
    process.exit(1);
  });
