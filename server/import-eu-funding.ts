import { db } from "./db";
import { grants } from "@shared/schema";
import type { InsertGrant } from "@shared/schema";

interface EUFundingProject {
  reference: string;
  summary?: string;
  content?: string;
  title?: string | null;
  url?: string;
  metadata?: {
    keywords?: string[];
    typesOfAction?: string[];
    budgetOverview?: string[];
    programmePeriod?: string[];
    callDeadline?: string[];
    identifier?: string[];
    tags?: string[];
  };
}

interface EUFundingResponse {
  apiVersion: string;
  totalResults: number;
  pageNumber: number;
  pageSize: number;
  results: EUFundingProject[];
}

/**
 * Récupère les projets Creative Europe depuis l'API EU Funding & Tenders
 */
async function fetchCreativeEuropeProjects(
  pageNumber: number = 1,
  pageSize: number = 50
): Promise<EUFundingResponse | null> {
  const apiUrl = "https://api.tech.ec.europa.eu/search-api/prod/rest/search";
  
  try {
    // Construction de la requête pour Creative Europe (code 43108390)
    const queryBody = {
      bool: {
        must: [
          { terms: { type: ["1", "2"] } }, // Types de projets
          { term: { programmePeriod: "2021 - 2027" } },
          { terms: { frameworkProgramme: ["43108390"] } }, // Creative Europe
        ],
      },
    };

    const formData = new FormData();
    formData.append("query", new Blob([JSON.stringify(queryBody)], { type: "application/json" }));
    formData.append("language", new Blob([JSON.stringify(["en", "fr"])], { type: "application/json" }));

    const response = await fetch(
      `${apiUrl}?apiKey=SEDIA&text=culture&pageSize=${pageSize}&pageNumber=${pageNumber}`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      console.error(`Erreur API EU Funding: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error("Détails:", errorText);
      return null;
    }

    const data = await response.json();
    return data as EUFundingResponse;
  } catch (error) {
    console.error("Erreur lors de la récupération des données EU Funding:", error);
    return null;
  }
}

/**
 * Transforme un projet EU Funding en format de subvention pour notre base
 */
function transformEUProjectToGrant(project: EUFundingProject): InsertGrant {
  // Utiliser summary ou content comme titre
  const projectTitle = project.summary || project.content || "Programme Creative Europe";
  
  // Extraire les mots-clés
  const keywords = project.metadata?.keywords || [];
  const typesOfAction = project.metadata?.typesOfAction || [];
  
  // Déterminer les secteurs éligibles basés sur les mots-clés
  const eligibleSectors: string[] = [];
  const keywordStr = keywords.join(" ").toLowerCase();
  
  if (keywordStr.includes("visual") || keywordStr.includes("art")) eligibleSectors.push("Arts visuels");
  if (keywordStr.includes("music") || keywordStr.includes("audio")) eligibleSectors.push("Musique");
  if (keywordStr.includes("film") || keywordStr.includes("cinema") || keywordStr.includes("video")) eligibleSectors.push("Cinéma et audiovisuel");
  if (keywordStr.includes("heritage") || keywordStr.includes("cultural")) eligibleSectors.push("Patrimoine culturel");
  if (keywordStr.includes("literature") || keywordStr.includes("book")) eligibleSectors.push("Littérature et édition");
  if (keywordStr.includes("performance") || keywordStr.includes("theatre") || keywordStr.includes("dance")) eligibleSectors.push("Spectacle vivant");
  if (keywordStr.includes("game") || keywordStr.includes("digital")) eligibleSectors.push("Numérique et jeux vidéo");
  
  // Si aucun secteur trouvé, ajouter "Culture et création" comme défaut
  if (eligibleSectors.length === 0) {
    eligibleSectors.push("Culture et création");
  }

  // Construire une description enrichie
  const description = `${projectTitle}. ${keywords.length > 0 ? `Mots-clés : ${keywords.slice(0, 5).join(", ")}` : ""}${typesOfAction.length > 0 ? ` Type d'action : ${typesOfAction[0]}` : ""}`;

  return {
    title: projectTitle.substring(0, 200), // Limiter la longueur
    organization: "Commission Européenne - Creative Europe",
    amount: null, // Montant variable selon l'appel
    amountMin: 50000, // Estimation minimum typique pour Creative Europe
    amountMax: 500000, // Estimation maximum typique
    deadline: null, // Les deadlines ne sont pas dans les résultats de recherche
    nextSession: "Consulter le portail EU Funding & Tenders pour les prochaines deadlines",
    frequency: "Appels à projets réguliers - généralement 1-2 fois par an",
    isRecurring: true,

    description,
    eligibility: "⚠️ STRUCTURE OBLIGATOIRE : Creative Europe finance uniquement les organisations (associations, entreprises, collectifs, institutions). Les artistes individuels doivent candidater via une structure légale (association loi 1901, SARL, SAS, collectif avec SIRET). États membres UE et pays associés uniquement. Les artistes français sont éligibles s'ils ont une structure juridique.",
    requirements: "Dossier de candidature en anglais via le portail EU Funding & Tenders. Partenariat européen souvent requis (minimum 3 partenaires de 3 pays UE différents). Budget détaillé et plan de travail obligatoires.",
    obligatoryDocuments: [
      "Formulaire de candidature EU (en anglais)",
      "Budget détaillé du projet sur toute la durée",
      "Plan de travail (work packages)",
      "CV des porteurs de projet et partenaires clés",
      "Lettres d'engagement des partenaires",
      "Documents légaux (statuts, SIRET/SIREN, etc.)",
    ],
    
    url: project.url || `https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/programmes/crea`,
    contactEmail: "EACEA-CREATIVE-EUROPE@ec.europa.eu",
    contactPhone: "+32 2 299 11 11",
    
    grantType: ["Subvention européenne", "Coopération internationale", "Aide à la création"],
    eligibleSectors,
    geographicZone: ["Union Européenne", "Europe", "International"],
    structureSize: ["PME", "Associations", "Organisations culturelles", "Collectifs"],
    
    maxFundingRate: 60, // 60% pour la plupart des actions Creative Europe
    coFundingRequired: "oui",
    cumulativeAllowed: "oui",
    
    processingTime: "4-6 mois d'évaluation",
    responseDelay: "6-8 mois entre la deadline et la notification",
    applicationDifficulty: "difficile",
    
    acceptanceRate: 15, // Taux d'acceptation typique autour de 10-20%
    annualBeneficiaries: null,
    successProbability: "moyenne",
    
    preparationAdvice: "🇪🇺 CONSEILS CREATIVE EUROPE :\n\n1. **Anticipation** : Commencez 3-4 mois avant la deadline\n2. **Partenariat** : Constituez un consortium solide avec des partenaires expérimentés de différents pays UE\n3. **Dimension européenne** : Montrez clairement l'impact transnational et la valeur ajoutée européenne\n4. **Budget** : Soyez réaliste et détaillé (vérification rigoureuse)\n5. **Impact** : Définissez des indicateurs mesurables et ambitieux\n6. **Langue** : Dossier en anglais uniquement, faites relire par un natif\n7. **Réseaux** : Contactez les Creative Europe Desks pour accompagnement gratuit",
    experienceFeedback: "Programme très compétitif mais offrant des montants significatifs (50k-500k€). Favorise les projets innovants avec forte dimension européenne. Partenariats de qualité essentiels. Budget et planification doivent être irréprochables. Taux de succès ~15% mais soutien de grande qualité si accepté.",
    
    priority: "haute",
    status: "active",
  };
}

/**
 * Importe les projets Creative Europe dans la base de données
 */
export async function importEUFunding() {
  console.log("🇪🇺 Début de l'import des données EU Funding & Tenders (Creative Europe)...");
  
  let totalImported = 0;
  let pageNumber = 1;
  const pageSize = 50;

  try {
    // Première requête pour connaître le nombre total
    const firstPage = await fetchCreativeEuropeProjects(pageNumber, pageSize);
    
    if (!firstPage || !firstPage.results) {
      console.error("❌ Impossible de récupérer les données de l'API EU Funding");
      return;
    }

    console.log(`📊 ${firstPage.totalResults} projets trouvés`);

    // Traiter la première page
    const grantsToInsert: InsertGrant[] = firstPage.results.map(transformEUProjectToGrant);
    
    if (grantsToInsert.length > 0) {
      await db.insert(grants).values(grantsToInsert);
      totalImported += grantsToInsert.length;
      console.log(`✅ Page 1 importée: ${grantsToInsert.length} subventions`);
    }

    // Calculer le nombre de pages restantes
    const totalPages = Math.ceil(firstPage.totalResults / pageSize);
    
    // Importer les pages suivantes (limité à 10 pages = 500 subventions)
    const maxPages = Math.min(totalPages, 10);
    
    for (let page = 2; page <= maxPages; page++) {
      const pageData = await fetchCreativeEuropeProjects(page, pageSize);
      
      if (!pageData || !pageData.results) {
        console.warn(`⚠️ Impossible de récupérer la page ${page}`);
        continue;
      }

      const pageGrants = pageData.results.map(transformEUProjectToGrant);
      
      if (pageGrants.length > 0) {
        await db.insert(grants).values(pageGrants);
        totalImported += pageGrants.length;
        console.log(`✅ Page ${page} importée: ${pageGrants.length} subventions`);
      }

      // Pause pour ne pas surcharger l'API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n✨ Import terminé: ${totalImported} subventions EU Funding importées avec succès!`);
    console.log(`💡 Note: Import limité aux ${maxPages} premières pages (${totalImported} subventions). Pour importer plus, augmentez maxPages.`);
    
  } catch (error) {
    console.error("❌ Erreur lors de l'import EU Funding:", error);
    throw error;
  }
}

// Permet d'exécuter le script directement
if (import.meta.url === `file://${process.argv[1]}`) {
  importEUFunding()
    .then(() => {
      console.log("✅ Script d'import terminé");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Erreur fatale:", error);
      process.exit(1);
    });
}
