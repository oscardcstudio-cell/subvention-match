/**
 * Script d'import ciblé des aides culturelles
 * Importe par organismes français spécifiques + échantillon Creative Europe
 * Usage: tsx server/import-targeted-grants.ts
 */

import { fetchAides, testApiConnection } from "./aides-territoires-api";
import { grantStorage } from "./grant-storage";
import type { InsertGrant } from "@shared/schema";
import { isEuropeanGrant } from "@shared/grant-classification";

/**
 * Transforme une aide de l'API vers notre schéma
 */
function transformAidToGrant(aid: any): InsertGrant {
  let amount: number | null = null;
  let amountMin: number | null = null;
  let amountMax: number | null = null;
  
  let frequency = "Permanent";
  if (aid.recurrence === "oneoff") {
    frequency = "Ponctuel";
  } else if (aid.recurrence === "recurring") {
    frequency = "Récurrent";
  }

  const grantTypes: string[] = aid.aid_types || [];
  const eligibleSectors: string[] = aid.targeted_audiences || [];
  
  const geographicZone: string[] = [];
  if (aid.perimeter?.name) {
    geographicZone.push(aid.perimeter.name);
  }
  if (aid.perimeter?.scale) {
    geographicZone.push(aid.perimeter.scale);
  }

  const organization = (aid.financers && aid.financers.length > 0)
    ? aid.financers.map((f: any) => typeof f === "string" ? f : f.name).join(", ")
    : "Non spécifié";

  return {
    title: aid.name || "Sans titre",
    organization,
    amount,
    amountMin,
    amountMax,
    deadline: aid.submission_deadline || null,
    nextSession: aid.recurrence === "recurring" ? "Voir le site" : null,
    frequency,
    isRecurring: aid.recurrence !== "oneoff", // oneoff = ponctuel, sinon recurring/permanent

    description: aid.description || null,
    eligibility: aid.eligibility || "Non spécifié",
    requirements: aid.project_examples || null,
    obligatoryDocuments: null,
    
    url: aid.application_url || aid.origin_url || null,
    contactEmail: aid.contact || null,
    contactPhone: null,
    
    grantType: grantTypes.length > 0 ? grantTypes : null,
    eligibleSectors: eligibleSectors.length > 0 ? eligibleSectors : null,
    geographicZone: geographicZone.length > 0 ? geographicZone : null,
    
    maxFundingRate: aid.subvention_rate_upper_bound || null,
    coFundingRequired: null,
    cumulativeAllowed: null,
    
    processingTime: null,
    responseDelay: null,
    applicationDifficulty: null,
    
    acceptanceRate: null,
    annualBeneficiaries: null,
    successProbability: null,
    
    preparationAdvice: null,
    experienceFeedback: null,
    
    priority: "moyenne",
    status: "active",
  };
}

/**
 * Récupérer toutes les aides pour une recherche donnée
 */
async function fetchAllAidsForSearch(searchText: string): Promise<any[]> {
  const allAids: any[] = [];
  let page = 1;
  const pageSize = 50;

  console.log(`   🔍 Recherche: "${searchText}"`);

  while (true) {
    const response = await fetchAides({
      text: searchText,
      page,
      page_size: pageSize,
    });

    allAids.push(...response.results);
    console.log(`      Page ${page}: ${response.results.length} aides`);

    if (!response.next || allAids.length >= 200) {
      break;
    }

    page++;
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log(`   ✅ Total: ${allAids.length} aides\n`);
  return allAids;
}

/**
 * Dédupliquer les aides par titre et organisation
 */
function deduplicateAids(aids: any[]): any[] {
  const seen = new Set<string>();
  const unique: any[] = [];

  for (const aid of aids) {
    const key = `${aid.name}|${aid.financers?.join(",") || ""}`;
    
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(aid);
    }
  }

  return unique;
}

/**
 * Import ciblé des aides culturelles
 */
async function importTargetedGrants() {
  console.log("🎯 Démarrage de l'import ciblé des aides culturelles...\n");

  // Test de connexion
  console.log("🔐 Test de connexion à l'API...");
  const testResult = await testApiConnection();
  if (!testResult.success) {
    console.error("❌ Échec de connexion:", testResult.message);
    return;
  }
  console.log("✅ Connexion réussie!\n");

  // Définir les recherches ciblées
  const searches = [
    { name: "CNC (Centre National du Cinéma)", query: "CNC" },
    { name: "DRAC (Directions Régionales)", query: "DRAC" },
    { name: "Ministère de la Culture", query: "ministère culture" },
    { name: "Régions", query: "région culture" },
    { name: "CNM (Centre National Musique)", query: "CNM musique" },
    { name: "ADAGP", query: "ADAGP" },
    { name: "SACEM", query: "SACEM" },
    { name: "Creative Europe (échantillon)", query: "creative europe" },
  ];

  let allAids: any[] = [];
  let importedCount = 0;

  try {
    // Collecter les aides de toutes les recherches
    console.log("📚 Collecte des aides par organisme:\n");
    
    for (const search of searches) {
      console.log(`📂 ${search.name}`);
      const aids = await fetchAllAidsForSearch(search.query);
      allAids.push(...aids);
      
      // Petite pause entre les recherches
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log("═══════════════════════════════════════════════");
    console.log(`📊 Total collecté: ${allAids.length} aides`);
    console.log("═══════════════════════════════════════════════\n");

    // Dédupliquer
    console.log("🔄 Déduplication...");
    const uniqueAids = deduplicateAids(allAids);
    console.log(`✅ ${uniqueAids.length} aides uniques (${allAids.length - uniqueAids.length} doublons supprimés)\n`);

    // Limiter à 500 aides max
    const aidsToImport = uniqueAids.slice(0, 500);
    console.log(`🎯 Import de ${aidsToImport.length} aides dans la base de données...\n`);

    // Importer dans la base de données
    for (const aid of aidsToImport) {
      try {
        const grant = transformAidToGrant(aid);
        await grantStorage.createGrant(grant);
        importedCount++;
        
        if (importedCount % 50 === 0) {
          console.log(`   ✓ ${importedCount} aides importées...`);
        }
      } catch (error) {
        console.error(`   ⚠️  Erreur import aide ${aid.id}:`, error instanceof Error ? error.message : error);
      }
    }

    // Résumé final
    console.log("\n═══════════════════════════════════════════════");
    console.log("📊 RÉSUMÉ DE L'IMPORT CIBLÉ");
    console.log("═══════════════════════════════════════════════");
    console.log(`Aides collectées:        ${allAids.length.toLocaleString()}`);
    console.log(`Après déduplication:     ${uniqueAids.length.toLocaleString()}`);
    console.log(`Importées en DB:         ${importedCount.toLocaleString()}`);
    console.log("═══════════════════════════════════════════════\n");

    // Vérifier le total en base
    const dbCount = await grantStorage.countActiveGrants();
    console.log(`✅ Vérification: ${dbCount} aides actives dans la base de données\n`);

    // Statistiques par type
    const allGrants = await grantStorage.getAllActiveGrants();
    const euCount = allGrants.filter(isEuropeanGrant).length;
    const frCount = allGrants.length - euCount;

    console.log("📈 Répartition:");
    console.log(`   Aides françaises:    ${frCount}`);
    console.log(`   Aides européennes:   ${euCount}`);
    console.log("═══════════════════════════════════════════════\n");

  } catch (error) {
    console.error("❌ Erreur lors de l'import:", error);
    throw error;
  }
}

// Exécuter l'import si le script est lancé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  importTargetedGrants()
    .then(() => {
      console.log("✅ Import ciblé terminé avec succès!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Erreur fatale:", error);
      process.exit(1);
    });
}

export { importTargetedGrants };
