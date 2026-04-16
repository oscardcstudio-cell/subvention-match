import { Client } from "@notionhq/client";
import type { GrantResult } from "@shared/schema";

// Initialize Notion client
let notionClient: Client | null = null;

function getNotionClient(): Client {
  if (!notionClient) {
    if (!process.env.NOTION_API_KEY) {
      throw new Error("Missing required secret: NOTION_API_KEY");
    }
    notionClient = new Client({
      auth: process.env.NOTION_API_KEY,
    });
  }
  return notionClient;
}

// Helper function to extract text from Notion rich text
function extractRichText(richText: any): string {
  if (!richText || !Array.isArray(richText)) return "";
  return richText.map((text: any) => text.plain_text).join("");
}

// Helper function to extract number from Notion number property
function extractNumber(number: any): number | null {
  return number !== null && number !== undefined ? number : null;
}

// Helper function to extract date from Notion date property
function extractDate(date: any): string {
  if (!date || !date.start) return "";
  return date.start;
}

// Helper function to extract multi-select values
function extractMultiSelect(multiSelect: any): string[] {
  if (!multiSelect || !Array.isArray(multiSelect)) return [];
  return multiSelect.map((item: any) => item.name);
}

// Helper function to extract select value
function extractSelect(select: any): string {
  return select?.name || "";
}

// Helper function to extract URL
function extractUrl(url: any): string {
  return url || "";
}

/**
 * Fetch a Notion page by ID and transform it into GrantResult format
 */
export async function fetchNotionPage(pageId: string): Promise<GrantResult> {
  try {
    const client = getNotionClient();
    
    // Fetch the page properties
    const response = await client.pages.retrieve({ page_id: pageId });
    
    if (!("properties" in response)) {
      throw new Error("Invalid Notion page response");
    }

    const props = response.properties;

    // Extract fields - using exact Notion property names
    const title = extractRichText((props["Nom de la subvention"] as any)?.title);
    const organization = extractRichText((props["Organisme"] as any)?.rich_text);
    const montant = extractNumber((props["Montant"] as any)?.number);
    const deadline = extractDate((props["Date de soumission"] as any)?.date);
    const description = extractRichText((props["Nature de l'aide"] as any)?.rich_text);
    const eligibility = extractRichText((props["Critères d'éligibilité"] as any)?.rich_text);
    const url = extractUrl((props["Lien web"] as any)?.url);
    const tags = extractMultiSelect((props["Type de subvention"] as any)?.multi_select);

    // Format amount as string with euros
    const amountStr = montant ? `${montant.toLocaleString('fr-FR')}€` : "Montant variable";

    return {
      id: pageId,
      title: title || "Sans titre",
      organization: organization || "Organisme non spécifié",
      amount: amountStr,
      deadline: deadline || "Date à confirmer",
      description: description || "",
      eligibility: eligibility || "",
      url: url || "",
      tags: tags.length > 0 ? tags : undefined,
    };
  } catch (error: any) {
    console.error(`Error fetching Notion page ${pageId}:`, error.message);
    throw new Error(`Failed to fetch Notion page: ${error.message}`);
  }
}

/**
 * Fetch multiple Notion pages by their IDs
 */
export async function fetchNotionPages(pageIds: string[]): Promise<GrantResult[]> {
  const results: GrantResult[] = [];
  
  for (const pageId of pageIds) {
    try {
      const grant = await fetchNotionPage(pageId);
      results.push(grant);
    } catch (error: any) {
      console.error(`Failed to fetch page ${pageId}, skipping:`, error.message);
      // Continue with other pages even if one fails
    }
  }
  
  return results;
}

/**
 * Fetch all grants from Notion database
 */
export async function fetchAllGrants(databaseId: string): Promise<GrantResult[]> {
  try {
    const client = getNotionClient();
    const results: GrantResult[] = [];
    
    console.log(`📚 Récupération de toutes les subventions depuis Notion...`);

    // Step 1: Retrieve database to get data source ID (new API 2025-09-03)
    const database: any = await client.databases.retrieve({ 
      database_id: databaseId 
    });
    
    // Get the first data source ID
    const dataSourceId = database.data_sources?.[0]?.id || databaseId;
    console.log(`📊 Data source ID: ${dataSourceId}`);

    let hasMore = true;
    let startCursor: string | undefined = undefined;
    let pageCount = 0;

    // Step 2: Query the data source with pagination
    while (hasMore) {
      const response: any = await (client as any).dataSources.query({
        data_source_id: dataSourceId,
        start_cursor: startCursor,
        page_size: 100,
      });

      // Process each page
      for (const page of response.results) {
        try {
          if ("properties" in page) {
            const props = page.properties;

            // Extract fields - using exact Notion property names
            const title = extractRichText((props["Nom de la subvention"] as any)?.title);
            const organization = extractRichText((props["Organisme"] as any)?.rich_text);
            const montant = extractNumber((props["Montant"] as any)?.number);
            const deadline = extractDate((props["Date de soumission"] as any)?.date);
            const description = extractRichText((props["Nature de l'aide"] as any)?.rich_text);
            const eligibility = extractRichText((props["Critères d'éligibilité"] as any)?.rich_text);
            const url = extractUrl((props["Lien web"] as any)?.url);
            const tags = extractMultiSelect((props["Type de subvention"] as any)?.multi_select);

            // Format amount
            const amountStr = montant ? `${montant.toLocaleString('fr-FR')}€` : "Montant variable";

            results.push({
              id: page.id,
              title: title || "Sans titre",
              organization: organization || "Organisme non spécifié",
              amount: amountStr,
              deadline: deadline || "Date à confirmer",
              description: description || "",
              eligibility: eligibility || "",
              url: url || "",
              tags: tags.length > 0 ? tags : undefined,
            });
          }
        } catch (error: any) {
          console.error(`Erreur extraction page ${page.id}:`, error.message);
          // Continue with other pages
        }
      }

      pageCount += response.results.length;
      hasMore = response.has_more;
      startCursor = response.next_cursor || undefined;
    }

    console.log(`✅ ${results.length} subventions récupérées depuis Notion (${pageCount} pages traitées)`);
    return results;
  } catch (error: any) {
    console.error("❌ Erreur récupération base Notion:", error.message);
    throw new Error(`Failed to fetch Notion database: ${error.message}`);
  }
}

// In-memory cache for grants (to avoid hitting Notion API too often)
let grantsCache: { data: GrantResult[]; timestamp: number } | null = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

/**
 * Get all grants with caching
 */
export async function getAllGrantsCached(databaseId: string): Promise<GrantResult[]> {
  const now = Date.now();
  
  // Check cache validity
  if (grantsCache && (now - grantsCache.timestamp) < CACHE_DURATION) {
    console.log(`📦 Utilisation du cache (${grantsCache.data.length} subventions)`);
    return grantsCache.data;
  }

  // Fetch fresh data
  const grants = await fetchAllGrants(databaseId);
  
  // Update cache
  grantsCache = {
    data: grants,
    timestamp: now,
  };

  return grants;
}
