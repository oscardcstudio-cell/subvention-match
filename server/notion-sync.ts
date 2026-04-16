import { type InsertGrant } from "@shared/schema";
import { Client } from "@notionhq/client";

/**
 * Get Notion client instance
 */
function getNotionClient(): Client {
  if (!process.env.NOTION_API_KEY) {
    throw new Error("NOTION_API_KEY not set");
  }
  
  return new Client({
    auth: process.env.NOTION_API_KEY,
    notionVersion: "2025-09-03",
  });
}

/**
 * Extrait le texte d'une propriété rich_text Notion
 */
function extractRichText(richText: any): string {
  if (!richText || !Array.isArray(richText)) return "";
  return richText.map((rt: any) => rt.plain_text || "").join("");
}

/**
 * Extrait un nombre d'une propriété number Notion
 */
function extractNumber(num: any): number | null {
  return num ?? null;
}

/**
 * Extrait une date d'une propriété date Notion
 */
function extractDate(date: any): string | null {
  return date?.start || null;
}

/**
 * Extrait une URL d'une propriété url Notion
 */
function extractUrl(url: any): string | null {
  return url || null;
}

/**
 * Extrait un tableau de multi_select Notion
 */
function extractMultiSelect(multiSelect: any): string[] {
  if (!Array.isArray(multiSelect)) return [];
  return multiSelect.map((item: any) => item.name || "").filter(Boolean);
}

/**
 * Transforme une page Notion en objet Grant pour PostgreSQL
 */
export function transformNotionPageToGrant(page: any): InsertGrant | null {
  try {
    if (!("properties" in page)) {
      console.warn("Page Notion sans propriétés:", page.id);
      return null;
    }

    const props = page.properties;

    // Champs obligatoires
    const title = extractRichText(props["Nom de la subvention"]?.title);
    const organization = extractRichText(props["Organisme"]?.rich_text);
    const eligibility = extractRichText(props["Critères d'éligibilité"]?.rich_text);

    if (!title || !organization || !eligibility) {
      console.warn("Page Notion avec champs obligatoires manquants:", page.id);
      return null;
    }

    // Construction de l'objet Grant
    const grant: InsertGrant = {
      // Informations principales
      title,
      organization,
      amount: extractNumber(props["Montant"]?.number),
      amountMin: extractNumber(props["montant_minimum"]?.number),
      amountMax: null, // Pas de champ max dans Notion
      deadline: extractDate(props["Date de soumission"]?.date),
      nextSession: extractDate(props["prochaine_session"]?.date),
      frequency: extractRichText(props["frequence_appels"]?.rich_text),

      // Description
      description: extractRichText(props["Nature de l'aide"]?.rich_text) || 
                   extractRichText(props["Natude l'aide"]?.rich_text), // Gérer la typo
      eligibility,
      requirements: extractRichText(props["Dossier à fournir"]?.rich_text),
      obligatoryDocuments: extractRichText(props["documents_obligatoires"]?.rich_text)?.split(",").map(d => d.trim()).filter(Boolean) || null,

      // Métadonnées
      url: extractUrl(props["Lien web"]?.url),
      contactEmail: extractRichText(props["E-mail"]?.rich_text) || extractRichText(props["Contact"]?.rich_text),
      contactPhone: extractRichText(props["contact_telephone"]?.rich_text),

      // Filtres et catégories
      grantType: extractMultiSelect(props["Type de subvention"]?.multi_select),
      eligibleSectors: extractRichText(props["secteurs_eligibles"]?.rich_text)?.split(",").map(s => s.trim()).filter(Boolean) || null,
      geographicZone: extractRichText(props["zone_geographique"]?.rich_text)?.split(",").map(z => z.trim()).filter(Boolean) || null,
      structureSize: extractRichText(props["taille_structure"]?.rich_text)?.split(",").map(t => t.trim()).filter(Boolean) || null,

      // Paramètres financiers
      maxFundingRate: extractNumber(props["taux_financement_max"]?.number),
      coFundingRequired: extractRichText(props["cofinancement_requis"]?.rich_text),
      cumulativeAllowed: extractRichText(props["Exigence et cumul"]?.rich_text),

      // Processus
      processingTime: extractRichText(props["duree_instruction"]?.rich_text),
      responseDelay: extractRichText(props["delai_reponse"]?.rich_text),
      applicationDifficulty: extractRichText(props["difficulte_dossier"]?.rich_text),

      // Statistiques
      acceptanceRate: extractNumber(props["taux_acceptation"]?.number),
      annualBeneficiaries: extractNumber(props["nombre_beneficiaires_annuel"]?.number),
      successProbability: extractRichText(props["probabilite_succes"]?.rich_text),

      // Conseils
      preparationAdvice: extractRichText(props["conseils_preparation"]?.rich_text),
      experienceFeedback: extractRichText(props["retours_experience"]?.rich_text),

      // Métadonnées système
      priority: extractRichText(props["priorite"]?.rich_text),
      status: extractRichText(props["Statut"]?.rich_text) === "Archivée" ? "archived" : "active",
    };

    return grant;
  } catch (error) {
    console.error("Erreur lors de la transformation de la page Notion:", error);
    return null;
  }
}

/**
 * Récupère une page Notion par ID et la transforme en Grant
 */
export async function fetchNotionPageAsGrant(pageId: string): Promise<InsertGrant | null> {
  try {
    const client = getNotionClient();
    const page = await client.pages.retrieve({ page_id: pageId });
    return transformNotionPageToGrant(page);
  } catch (error) {
    console.error(`Erreur lors de la récupération de la page Notion ${pageId}:`, error);
    return null;
  }
}

/**
 * Récupère toutes les subventions depuis Notion
 */
export async function fetchAllNotionGrants(): Promise<InsertGrant[]> {
  try {
    const client = getNotionClient();
    const databaseId = process.env.NOTION_DATABASE_ID;
    
    if (!databaseId) {
      throw new Error("NOTION_DATABASE_ID not set");
    }

    console.log("📚 Récupération de toutes les subventions depuis Notion...");

    // Récupérer le database pour avoir le data_source_id
    const database: any = await client.databases.retrieve({ 
      database_id: databaseId 
    });
    
    const dataSourceId = database.data_sources?.[0]?.id || databaseId;
    console.log(`📊 Data source ID: ${dataSourceId}`);

    // Récupérer toutes les pages (non archivées)
    let allPages: any[] = [];
    let hasMore = true;
    let startCursor: string | undefined = undefined;

    while (hasMore) {
      const response: any = await (client as any).dataSources.query({
        data_source_id: dataSourceId,
        start_cursor: startCursor,
        page_size: 100,
      });

      const nonArchived = response.results.filter((p: any) => !p.archived);
      allPages = allPages.concat(nonArchived);
      hasMore = response.has_more;
      startCursor = response.next_cursor;
    }

    console.log(`✅ ${allPages.length} subventions récupérées depuis Notion (${allPages.length} pages traitées)`);

    // Transformer les pages en grants
    const grants: InsertGrant[] = [];
    for (const page of allPages) {
      const grant = transformNotionPageToGrant(page);
      if (grant) {
        grants.push(grant);
      }
    }

    return grants;
  } catch (error) {
    console.error("Erreur lors de la récupération des subventions Notion:", error);
    return [];
  }
}
