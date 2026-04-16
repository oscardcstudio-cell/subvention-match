import { Client } from "@notionhq/client";

/**
 * Script pour lister toutes les pages Notion avec leurs titres
 */

async function listAllPages() {
  const notionApiKey = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!notionApiKey || !databaseId) {
    console.error("❌ NOTION_API_KEY ou NOTION_DATABASE_ID manquants");
    process.exit(1);
  }

  const client = new Client({
    auth: notionApiKey,
    notionVersion: "2025-09-03",
  });

  console.log("🔍 Récupération de toutes les pages...\n");

  // Récupérer le database pour avoir le data_source_id
  const database: any = await client.databases.retrieve({ 
    database_id: databaseId 
  });
  
  const dataSourceId = database.data_sources?.[0]?.id || databaseId;

  // Récupérer toutes les pages
  let allPages: any[] = [];
  let hasMore = true;
  let startCursor: string | undefined = undefined;

  while (hasMore) {
    const response: any = await (client as any).dataSources.query({
      data_source_id: dataSourceId,
      start_cursor: startCursor,
      page_size: 100,
    });

    // Filtrer les pages non archivées
    const nonArchived = response.results.filter((p: any) => !p.archived);
    allPages = allPages.concat(nonArchived);
    hasMore = response.has_more;
    startCursor = response.next_cursor;
  }

  console.log(`📚 Total : ${allPages.length} pages actives\n`);
  console.log("=" .repeat(80));

  // Extraire et afficher chaque page
  const pagesInfo = allPages.map((page, index) => {
    const title = page.properties?.["Nom de la subvention"]?.title?.[0]?.plain_text || "⚠️ SANS TITRE";
    const organisme = page.properties?.["Organisme"]?.rich_text?.[0]?.plain_text || "Sans organisme";
    
    return {
      num: index + 1,
      id: page.id,
      title,
      organisme,
      created: page.created_time?.split('T')[0] || 'N/A',
    };
  });

  // Afficher toutes les pages
  pagesInfo.forEach(p => {
    console.log(`${p.num}. "${p.title}"`);
    console.log(`   Organisme: ${p.organisme}`);
    console.log(`   Créé: ${p.created}`);
    console.log(`   ID: ${p.id}`);
    console.log("");
  });

  // Grouper par titre exact
  const grouped = new Map<string, any[]>();
  pagesInfo.forEach(item => {
    if (!grouped.has(item.title)) {
      grouped.set(item.title, []);
    }
    grouped.get(item.title)!.push(item);
  });

  // Afficher les doublons
  console.log("=" .repeat(80));
  console.log("🔍 ANALYSE DES DOUBLONS:\n");
  
  let duplicateCount = 0;
  grouped.forEach((pages, title) => {
    if (pages.length > 1) {
      console.log(`⚠️  "${title}" : ${pages.length} occurrences`);
      pages.forEach(p => {
        console.log(`    #${p.num} - ${p.organisme} (créé ${p.created})`);
      });
      console.log("");
      duplicateCount += pages.length - 1;
    }
  });

  if (duplicateCount === 0) {
    console.log("✅ Aucun doublon trouvé - tous les titres sont uniques!");
  } else {
    console.log(`📊 Total: ${duplicateCount} doublons à supprimer`);
  }
}

listAllPages().catch(console.error);
