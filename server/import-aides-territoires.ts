import { db } from "./db";
import { grants } from "@shared/schema";
import { sql } from "drizzle-orm";

const AIDES_TERRITOIRES_API = "https://aides-territoires.beta.gouv.fr/api/aids/";

interface AidesTerritoriesAid {
  id: string;
  name: string;
  name_initial?: string;
  description: string;
  eligibility?: string;
  perimeter?: {
    name: string;
    scale: string;
  };
  financers?: Array<{
    name: string;
    id: number;
  }>;
  aid_types?: string[];
  targeted_audiences?: string[];
  programs?: string[];
  submission_deadline?: string;
  start_date?: string;
  recurrence?: string;
  url: string;
  origin_url?: string;
  contact?: string;
  contact_email?: string;
  contact_phone?: string;
  subvention_rate_lower_bound?: number;
  subvention_rate_upper_bound?: number;
  subvention_comment?: string;
  loan_amount?: number;
  recoverable_advance_amount?: number;
  status?: string;
  categories?: string[];
}

interface AidesTerritoriesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AidesTerritoriesAid[];
}

async function fetchAidesFromAPI(page: number = 1): Promise<AidesTerritoriesResponse> {
  const params = new URLSearchParams({
    // Filtre culture, artiste, création
    text: "artiste culture création",
    page_size: "50",
    page: page.toString(),
  });

  const response = await fetch(`${AIDES_TERRITOIRES_API}?${params}`, {
    headers: {
      'Accept': 'application/json',
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur API: ${response.status} ${response.statusText}\n${errorText}`);
  }

  return response.json();
}

function mapAideToGrant(aide: AidesTerritoriesAid): any {
  // Mapper les types d'aides
  const grantTypes: string[] = [];
  if (aide.aid_types) {
    aide.aid_types.forEach(type => {
      if (type.includes("subvention")) grantTypes.push("subvention");
      if (type.includes("prêt") || type.includes("pret")) grantTypes.push("pret");
      if (type.includes("bourse")) grantTypes.push("bourse");
      if (type.includes("prix")) grantTypes.push("prix");
      if (type.includes("résidence") || type.includes("residence")) grantTypes.push("residence");
    });
  }

  // Déterminer la zone géographique
  const geographicZone: string[] = [];
  if (aide.perimeter) {
    const scale = aide.perimeter.scale?.toLowerCase();
    if (scale?.includes("commune") || scale?.includes("local")) geographicZone.push("local");
    if (scale?.includes("région") || scale?.includes("region")) geographicZone.push("regional");
    if (scale?.includes("national") || scale?.includes("france")) geographicZone.push("national");
    if (scale?.includes("europ")) geographicZone.push("europeen");
    if (scale?.includes("international")) geographicZone.push("international");
  }

  // Secteurs éligibles basés sur les audiences ciblées
  const eligibleSectors: string[] = [];
  if (aide.targeted_audiences) {
    aide.targeted_audiences.forEach(audience => {
      const audienceLower = audience.toLowerCase();
      if (audienceLower.includes("artiste")) eligibleSectors.push("artiste");
      if (audienceLower.includes("association")) eligibleSectors.push("association");
      if (audienceLower.includes("entreprise") || audienceLower.includes("pme")) eligibleSectors.push("entreprise");
      if (audienceLower.includes("collectivité")) eligibleSectors.push("collectivite");
      if (audienceLower.includes("établissement")) eligibleSectors.push("etablissement");
    });
  }

  return {
    title: aide.name || aide.name_initial || "Sans titre",
    organization: aide.financers?.[0]?.name || "Non spécifié",
    amount: aide.loan_amount || aide.recoverable_advance_amount || null,
    amountMin: null,
    amountMax: null,
    // Note: subvention_comment souvent contient des montants textuels (ex: "plafonné à 5000€")
    // qui seront extraits par le script enrich-amounts.ts
    deadline: aide.submission_deadline || null,
    nextSession: aide.start_date || null,
    frequency: aide.recurrence || null,
    isRecurring: aide.recurrence !== "oneoff" && aide.recurrence != null,

    description: aide.description || null,
    eligibility: aide.eligibility || "Voir le site web de l'aide pour les critères d'éligibilité",
    requirements: null,
    obligatoryDocuments: null,
    
    url: aide.url || aide.origin_url || null,
    contactEmail: aide.contact_email || null,
    contactPhone: aide.contact_phone || null,
    
    grantType: grantTypes.length > 0 ? grantTypes : ["subvention"],
    eligibleSectors: eligibleSectors.length > 0 ? eligibleSectors : null,
    geographicZone: geographicZone.length > 0 ? geographicZone : null,
    structureSize: null,
    
    maxFundingRate: aide.subvention_rate_upper_bound || null,
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
    status: aide.status === "published" ? "active" : "inactive",
  };
}

async function importAides(maxPages: number = 5) {
  console.log("🚀 Démarrage de l'import depuis Aides-Territoires...\n");
  
  let totalImported = 0;
  let totalErrors = 0;
  
  for (let page = 1; page <= maxPages; page++) {
    try {
      console.log(`📄 Récupération de la page ${page}...`);
      const response = await fetchAidesFromAPI(page);
      
      console.log(`   Trouvé: ${response.results.length} aides sur cette page`);
      console.log(`   Total dans l'API: ${response.count} aides culturelles\n`);
      
      if (response.results.length === 0) {
        console.log("✅ Aucune aide sur cette page, arrêt.");
        break;
      }
      
      // Insérer chaque aide dans la base
      for (const aide of response.results) {
        try {
          const grantData = mapAideToGrant(aide);
          
          // Vérifier si l'aide existe déjà (basé sur le titre et l'organisation)
          const existing = await db
            .select()
            .from(grants)
            .where(sql`${grants.title} = ${grantData.title} AND ${grants.organization} = ${grantData.organization}`)
            .limit(1);
          
          if (existing.length > 0) {
            console.log(`   ⏭️  Déjà existant: ${grantData.title}`);
            continue;
          }
          
          await db.insert(grants).values(grantData);
          totalImported++;
          console.log(`   ✅ Importé: ${grantData.title}`);
          
        } catch (error) {
          totalErrors++;
          console.error(`   ❌ Erreur pour ${aide.name}:`, error);
        }
      }
      
      // Pause entre les pages pour ne pas surcharger l'API
      if (response.next && page < maxPages) {
        console.log("\n⏳ Pause de 2 secondes avant la prochaine page...\n");
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else if (!response.next) {
        console.log("\n✅ Toutes les pages ont été récupérées.");
        break;
      }
      
    } catch (error) {
      console.error(`❌ Erreur lors de la récupération de la page ${page}:`, error);
      totalErrors++;
    }
  }
  
  console.log("\n" + "=".repeat(50));
  console.log("📊 RÉSUMÉ DE L'IMPORT");
  console.log("=".repeat(50));
  console.log(`✅ Subventions importées: ${totalImported}`);
  console.log(`❌ Erreurs: ${totalErrors}`);
  console.log("=".repeat(50) + "\n");
}

// Lancer l'import si exécuté directement
if (import.meta.url === `file://${process.argv[1]}`) {
  const maxPages = parseInt(process.argv[2] || "5");
  console.log(`\n🎯 Import de ${maxPages} pages depuis Aides-Territoires\n`);
  
  importAides(maxPages)
    .then(() => {
      console.log("✅ Import terminé avec succès!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Erreur fatale:", error);
      process.exit(1);
    });
}

export { importAides, fetchAidesFromAPI, mapAideToGrant };
