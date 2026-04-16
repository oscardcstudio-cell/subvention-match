import { Client } from "@notionhq/client";

/**
 * Script pour détecter et supprimer les doublons dans Notion
 * Détecte les doublons même avec variations (espaces, casse, accents)
 */

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Normaliser les espaces multiples
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[\-_]/g, ' '); // Remplacer - et _ par espace
}

async function cleanDuplicates() {
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

  console.log("🔍 Récupération de toutes les pages...");

  // Récupérer le database pour avoir le data_source_id
  const database: any = await client.databases.retrieve({ 
    database_id: databaseId 
  });
  
  const dataSourceId = database.data_sources?.[0]?.id || databaseId;
  console.log(`📊 Data source ID: ${dataSourceId}`);

  // Récupérer toutes les pages (non archivées uniquement)
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

  console.log(`📚 ${allPages.length} pages actives trouvées`);

  // Extraire titre et organisme de chaque page
  const pagesWithInfo = allPages.map(page => {
    const title = page.properties?.["Nom de la subvention"]?.title?.[0]?.plain_text || "Sans titre";
    const organisme = page.properties?.["Organisme"]?.rich_text?.[0]?.plain_text || "";
    
    return {
      id: page.id,
      title,
      organisme,
      normalizedTitle: normalizeTitle(title),
      normalizedOrg: normalizeTitle(organisme),
      created: page.created_time,
      page,
    };
  });

  // Grouper par titre normalisé
  const groupedByTitle = new Map<string, any[]>();
  pagesWithInfo.forEach(item => {
    if (!groupedByTitle.has(item.normalizedTitle)) {
      groupedByTitle.set(item.normalizedTitle, []);
    }
    groupedByTitle.get(item.normalizedTitle)!.push(item);
  });

  // Trouver les doublons
  const duplicates: any[] = [];
  groupedByTitle.forEach((pages, normalizedTitle) => {
    if (pages.length > 1) {
      duplicates.push({ 
        normalizedTitle,
        originalTitle: pages[0].title,
        count: pages.length, 
        pages 
      });
    }
  });

  console.log(`\n🔍 ${duplicates.length} groupes de doublons trouvés :\n`);

  if (duplicates.length === 0) {
    console.log("✅ Aucun doublon trouvé !");
    return;
  }

  duplicates.forEach(dup => {
    console.log(`\n📄 "${dup.originalTitle}" : ${dup.count} occurrences`);
    dup.pages.forEach((p: any) => {
      console.log(`   - "${p.title}" (${p.organisme || 'sans organisme'}) - créé le ${p.created.split('T')[0]}`);
    });
  });

  console.log(`\n🗑️ Suppression des doublons (garde la plus ancienne)...\n`);

  let deleted = 0;

  for (const dup of duplicates) {
    // Trier par date de création, garder la plus ancienne
    const sorted = dup.pages.sort((a: any, b: any) => 
      new Date(a.created).getTime() - new Date(b.created).getTime()
    );
    
    const toKeep = sorted[0];
    const toDelete = sorted.slice(1);
    
    console.log(`  ✅ GARDE : "${toKeep.title}" (créé le ${toKeep.created.split('T')[0]})`);
    
    for (const page of toDelete) {
      try {
        await client.pages.update({
          page_id: page.id,
          archived: true,
        });
        console.log(`  🗑️  SUPPRIME : "${page.title}" (créé le ${page.created.split('T')[0]})`);
        deleted++;
      } catch (error: any) {
        console.error(`  ❌ Erreur pour "${page.title}" : ${error.message}`);
      }
    }
    console.log("");
  }

  console.log(`\n✅ Nettoyage terminé : ${deleted} doublons archivés sur ${allPages.length} pages`);
  console.log(`📊 Il reste ${allPages.length - deleted} pages uniques`);
}

cleanDuplicates().catch(console.error);
