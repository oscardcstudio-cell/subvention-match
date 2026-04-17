/**
 * Script d'import des aides culturelles depuis l'API Aides et Territoires
 * Utilisation: tsx server/import-cultural-grants.ts
 */

import { fetchAides, testApiConnection } from "./aides-territoires-api";
import { grantStorage } from "./grant-storage";
import type { InsertGrant } from "@shared/schema";

// Mots-clés culturels pour filtrer les aides pertinentes
const CULTURAL_KEYWORDS = [
  // Domaines artistiques
  "culture", "culturel", "culturelle", "art", "arts", "artiste", "artistique",
  "musique", "musical", "musicale", "musicien", "concert", "festival",
  "théâtre", "spectacle", "scène", "danse", "chorégraphie",
  "cinéma", "film", "audiovisuel", "vidéo", "production",
  "photographie", "photo", "exposition", "galerie",
  "littérature", "livre", "édition", "écriture", "auteur",
  "patrimoine", "monument", "historique", "restauration",
  "musée", "collection", "conservation",
  "cirque", "marionnette", "rue",
  
  // Secteurs spécifiques
  "création", "créateur", "créative", "créatif",
  "production artistique", "diffusion culturelle",
  "médiation culturelle", "éducation artistique",
  "résidence artistique", "atelier",
  "tournée", "spectacle vivant",
  
  // Structures
  "compagnie", "troupe", "ensemble",
  "label", "maison de disque",
  "salle de spectacle", "lieu culturel",
];

// Thèmes culturels identifiés dans l'API
const CULTURAL_THEMES = [
  "arts-plastiques-et-photographie",
  "spectacle-vivant",
  "patrimoine-et-monuments-historiques",
  "culture-et-identite-collective",
  "bibliotheques-et-livres",
  "musee",
  "medias-et-communication",
];

/**
 * Vérifie si une aide est culturelle
 */
function isCulturalAid(aid: any): boolean {
  const searchText = `
    ${aid.name || ""} 
    ${aid.description || ""} 
    ${aid.eligibility || ""}
    ${aid.targeted_audiences?.join(" ") || ""}
    ${aid.aid_types?.join(" ") || ""}
  `.toLowerCase();

  // Vérifier si au moins un mot-clé culturel est présent
  return CULTURAL_KEYWORDS.some(keyword => searchText.includes(keyword));
}

/**
 * Transforme une aide de l'API vers notre schéma
 */
function transformAidToGrant(aid: any): InsertGrant {
  // Extraire le montant
  let amount: number | null = null;
  let amountMin: number | null = null;
  let amountMax: number | null = null;

  // L'API peut avoir des champs comme subvention_rate_lower_bound, subvention_rate_upper_bound
  // Mais pas toujours de montant fixe - on va utiliser les infos disponibles
  
  // Déterminer la fréquence
  let frequency = "Permanent";
  if (aid.recurrence === "oneoff") {
    frequency = "Ponctuel";
  } else if (aid.recurrence === "recurring") {
    frequency = "Récurrent";
  }

  // Types d'aide
  const grantTypes: string[] = aid.aid_types || [];
  
  // Secteurs éligibles (targeted_audiences)
  const eligibleSectors: string[] = aid.targeted_audiences || [];
  
  // Zone géographique
  const geographicZone: string[] = [];
  if (aid.perimeter?.name) {
    geographicZone.push(aid.perimeter.name);
  }
  if (aid.perimeter?.scale) {
    geographicZone.push(aid.perimeter.scale);
  }

  // Financeurs
  const organization = aid.financers?.map((f: any) => f.name).join(", ") || "Non spécifié";

  return {
    title: aid.name || "Sans titre",
    organization,
    amount,
    amountMin,
    amountMax,
    deadline: aid.submission_deadline || null,
    nextSession: aid.recurrence === "recurring" ? "Voir le site" : null,
    frequency,
    isRecurring: aid.recurrence !== "oneoff",

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
 * Import des aides culturelles
 */
async function importCulturalGrants() {
  console.log("🚀 Démarrage de l'import des aides culturelles...\n");

  // Test de connexion
  console.log("🔐 Test de connexion à l'API...");
  const testResult = await testApiConnection();
  if (!testResult.success) {
    console.error("❌ Échec de connexion:", testResult.message);
    return;
  }
  console.log("✅ Connexion réussie!\n");

  // Statistiques
  let totalFetched = 0;
  let culturalCount = 0;
  let importedCount = 0;
  let page = 1;
  const pageSize = 100;
  const MAX_IMPORTS = 1000; // Limite à 1000 aides les plus pertinentes

  console.log("📚 Récupération des aides par pagination...\n");
  console.log(`🎯 Objectif: Importer les ${MAX_IMPORTS} aides culturelles les plus pertinentes\n`);

  try {
    while (importedCount < MAX_IMPORTS) {
      console.log(`📄 Page ${page}...`);
      
      // Récupérer une page d'aides
      const response = await fetchAides({
        page,
        page_size: pageSize,
      });

      totalFetched += response.results.length;

      // Filtrer les aides culturelles
      const culturalAids = response.results.filter(isCulturalAid);
      culturalCount += culturalAids.length;

      console.log(`   → ${response.results.length} aides récupérées, ${culturalAids.length} culturelles`);

      // Importer dans la base de données (avec limite)
      for (const aid of culturalAids) {
        if (importedCount >= MAX_IMPORTS) {
          console.log(`\n🎯 Limite de ${MAX_IMPORTS} aides atteinte - arrêt de l'import\n`);
          break;
        }
        
        try {
          const grant = transformAidToGrant(aid);
          await grantStorage.createGrant(grant);
          importedCount++;
        } catch (error) {
          console.error(`   ⚠️  Erreur import aide ${aid.id}:`, error instanceof Error ? error.message : error);
        }
      }
      
      // Sortir de la boucle si limite atteinte
      if (importedCount >= MAX_IMPORTS) {
        break;
      }

      // Vérifier s'il y a une page suivante
      if (!response.next) {
        console.log("\n✅ Fin de la pagination - toutes les pages récupérées\n");
        break;
      }

      page++;
      
      // Limite de sécurité (éviter les boucles infinies)
      if (page > 50) {
        console.log("\n⚠️  Limite de 50 pages atteinte - arrêt préventif\n");
        break;
      }

      // Pause pour éviter de surcharger l'API
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Résumé final
    console.log("═══════════════════════════════════════════════");
    console.log("📊 RÉSUMÉ DE L'IMPORT");
    console.log("═══════════════════════════════════════════════");
    console.log(`Total aides récupérées:     ${totalFetched.toLocaleString()}`);
    console.log(`Aides culturelles filtrées: ${culturalCount.toLocaleString()}`);
    console.log(`Aides importées en DB:      ${importedCount.toLocaleString()}`);
    console.log("═══════════════════════════════════════════════\n");

    // Vérifier le total en base
    const dbCount = await grantStorage.countActiveGrants();
    console.log(`✅ Vérification: ${dbCount} aides actives dans la base de données\n`);

  } catch (error) {
    console.error("❌ Erreur lors de l'import:", error);
    throw error;
  }
}

// Exécuter l'import si le script est lancé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  importCulturalGrants()
    .then(() => {
      console.log("✅ Import terminé avec succès!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Erreur fatale:", error);
      process.exit(1);
    });
}

export { importCulturalGrants };
