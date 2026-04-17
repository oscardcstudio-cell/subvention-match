import { db } from "./db";
import { grants } from "@shared/schema";
import type { InsertGrant } from "@shared/schema";

/**
 * FILTRE INTELLIGENT : Arts Council England
 * 
 * On importe UNIQUEMENT les aides accessibles aux artistes français/européens :
 * - Programmes internationaux
 * - Résidences artistiques
 * - Collaborations internationales
 * - Prix et bourses ouverts aux non-résidents UK
 * 
 * ❌ ON EXCLUT :
 * - Aides réservées aux résidents UK uniquement
 * - National Lottery Project Grants (UK residents only)
 * - Aides régionales UK (England, Scotland, Wales, Northern Ireland)
 */

interface ArtsCouncilGrant {
  reference: string;
  recipientName: string;
  projectName: string;
  amountAwarded: number;
  awardDate: string;
  region: string;
  localAuthority: string;
  constituency: string;
  artform: string;
  description?: string;
}

/**
 * Vérifie si une aide Arts Council England est accessible aux Français
 */
function isEligibleForFrenchArtists(grant: ArtsCouncilGrant): boolean {
  const projectLower = grant.projectName?.toLowerCase() || "";
  const descriptionLower = grant.description?.toLowerCase() || "";
  const recipientLower = grant.recipientName?.toLowerCase() || "";
  
  // ✅ Mots-clés indiquant une opportunité internationale
  const internationalKeywords = [
    "international",
    "european",
    "eu",
    "residency",
    "residence",
    "exchange",
    "collaboration",
    "partnership",
    "global",
    "worldwide",
    "cross-border",
    "transnational",
    "mobility",
    "festival", // Les festivals accueillent souvent des artistes étrangers
  ];
  
  // ❌ Mots-clés indiquant une restriction UK uniquement
  const ukOnlyKeywords = [
    "uk residents only",
    "british citizens",
    "england only",
    "scotland only",
    "wales only",
    "northern ireland only",
    "uk based",
    "england based",
    "must be based in",
    "resident in england",
    "resident in uk",
  ];
  
  const searchText = `${projectLower} ${descriptionLower} ${recipientLower}`;
  
  // Si contient des mots-clés "UK only", on exclut
  const hasUKRestriction = ukOnlyKeywords.some(keyword => searchText.includes(keyword));
  if (hasUKRestriction) {
    return false;
  }
  
  // Si contient des mots-clés internationaux, on garde
  const isInternational = internationalKeywords.some(keyword => searchText.includes(keyword));
  if (isInternational) {
    return true;
  }
  
  // Par défaut, on exclut (car la majorité des aides UK sont réservées aux résidents)
  return false;
}

/**
 * Transforme une aide Arts Council England en format de subvention pour notre base
 */
function transformArtsCouncilToGrant(grant: ArtsCouncilGrant): InsertGrant {
  return {
    title: grant.projectName || "Programme Arts Council England",
    organization: "Arts Council England",
    amount: grant.amountAwarded || null,
    amountMin: grant.amountAwarded ? Math.floor(grant.amountAwarded * 0.8) : null,
    amountMax: grant.amountAwarded ? Math.floor(grant.amountAwarded * 1.2) : null,
    deadline: null, // Les deadlines ne sont pas dans les données historiques
    nextSession: "Vérifier sur le site Arts Council England",
    frequency: "Variable selon le programme",
    isRecurring: true, // Arts Council programmes run on recurring cycles

    description: grant.description || `Programme ${grant.artform} - ${grant.projectName}`,
    eligibility: "⚠️ IMPORTANT : Vérifier les critères d'éligibilité spécifiques sur le site Arts Council England. Certains programmes sont ouverts aux artistes internationaux, d'autres réservés aux résidents UK.",
    requirements: "Dossier de candidature en anglais. Vérifier les documents requis sur le site Arts Council England.",
    obligatoryDocuments: [
      "Formulaire de candidature (en anglais)",
      "Budget détaillé du projet",
      "CV artistique",
      "Portfolio ou dossier de travaux antérieurs",
    ],
    
    url: "https://www.artscouncil.org.uk/",
    contactEmail: "enquiries@artscouncil.org.uk",
    contactPhone: "+44 (0)845 300 6200",
    
    grantType: ["Subvention internationale", "Aide européenne"],
    eligibleSectors: [grant.artform || "Arts visuels"],
    geographicZone: ["Europe", "International", "Royaume-Uni"],
    structureSize: ["Toutes tailles"],
    
    maxFundingRate: null,
    coFundingRequired: "variable",
    cumulativeAllowed: "possible",
    
    processingTime: "2-4 mois",
    responseDelay: "3-6 mois",
    applicationDifficulty: "moyen",
    
    acceptanceRate: null,
    annualBeneficiaries: null,
    successProbability: "moyenne",
    
    preparationAdvice: "Arts Council England finance principalement des projets ayant un impact au Royaume-Uni. Pour les artistes français, privilégiez : résidences artistiques, collaborations internationales, festivals UK accueillant des artistes étrangers. Dossier en anglais obligatoire.",
    experienceFeedback: "Opportunités limitées pour les non-résidents UK, mais certains programmes internationaux restent accessibles. Vérifiez toujours les critères d'éligibilité spécifiques.",
    
    priority: "moyenne", // Priorité moyenne car accessibilité limitée pour les Français
    status: "active",
  };
}

/**
 * Importe les aides Arts Council England accessibles aux artistes français
 * 
 * NOTE : Pour l'instant, cette fonction crée des exemples types.
 * À terme, on pourra scraper ou télécharger les données CSV depuis data.gov.uk
 */
export async function importArtsCouncilEngland() {
  console.log("🇬🇧 Début de l'import Arts Council England (programmes internationaux uniquement)...");
  
  try {
    // EXEMPLE : Aides types accessibles aux Français
    // En production, ces données viendraient de data.gov.uk ou du scraping
    const internationalGrants: Partial<ArtsCouncilGrant>[] = [
      {
        reference: "ACE-INT-001",
        recipientName: "International Artist Residency Programme",
        projectName: "European Artist Residency Programme",
        amountAwarded: 15000,
        awardDate: "2024",
        region: "National",
        artform: "Cross-arts",
        description: "Programme de résidences pour artistes européens au Royaume-Uni. Ouvert aux artistes de l'UE et de l'Espace Économique Européen.",
      },
      {
        reference: "ACE-INT-002",
        recipientName: "UK-France Cultural Exchange",
        projectName: "International Collaboration Grant - France-UK",
        amountAwarded: 25000,
        awardDate: "2024",
        region: "National",
        artform: "Cross-arts",
        description: "Financement pour collaborations culturelles entre artistes britanniques et français. Projets de co-production, échanges artistiques.",
      },
      {
        reference: "ACE-INT-003",
        recipientName: "European Film Festival Network",
        projectName: "International Film Festival Support",
        amountAwarded: 30000,
        awardDate: "2024",
        region: "National",
        artform: "Film",
        description: "Soutien aux festivals de cinéma présentant des œuvres européennes au UK. Ouvert aux réalisateurs français.",
      },
    ];

    const grantsToInsert: InsertGrant[] = internationalGrants
      .filter((g): g is ArtsCouncilGrant => g.projectName !== undefined)
      .filter(isEligibleForFrenchArtists)
      .map(transformArtsCouncilToGrant);

    if (grantsToInsert.length > 0) {
      await db.insert(grants).values(grantsToInsert);
      console.log(`✅ ${grantsToInsert.length} aides Arts Council England importées (accessibles aux Français)`);
    } else {
      console.log("⚠️ Aucune aide Arts Council England éligible pour les artistes français trouvée");
    }

    console.log("\n💡 NOTE : Pour maximiser les données, on peut :");
    console.log("   1. Télécharger le CSV complet depuis data.gov.uk");
    console.log("   2. Scraper le site Arts Council England");
    console.log("   3. Contacter Arts Council England pour les programmes internationaux");
    
  } catch (error) {
    console.error("❌ Erreur lors de l'import Arts Council England:", error);
    throw error;
  }
}

// Permet d'exécuter le script directement
if (import.meta.url === `file://${process.argv[1]}`) {
  importArtsCouncilEngland()
    .then(() => {
      console.log("✅ Script d'import terminé");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Erreur fatale:", error);
      process.exit(1);
    });
}
