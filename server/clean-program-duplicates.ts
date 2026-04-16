import { Client } from "@notionhq/client";

/**
 * Script pour supprimer les doublons de programmes
 * Garde 1 seule version de chaque programme (la plus complète)
 */

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    // Enlever les années
    .replace(/\b(202[0-9]|203[0-9])\b/g, '')
    .replace(/\b(2025 2026|2026)\b/g, '')
    // Enlever les codes
    .replace(/crea media \d+ devvgim/g, '')
    // Normaliser les variations
    .replace(/video games? (&|and|et) immersive content/g, 'jeux video contenus immersifs')
    .replace(/development|developpement/g, '')
    .replace(/\(cnc\)/g, 'cnc')
    .replace(/\(faci\)/g, '')
    .replace(/aide a la (production|ecriture)/g, '')
    .replace(/[-_\(\)]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getProgram(title: string): string {
  const normalized = normalizeTitle(title);
  
  if (normalized.includes('creative europe') && normalized.includes('media')) {
    return 'creative-europe-media';
  }
  if (normalized.includes('fonds') && normalized.includes('creation immersive')) {
    return 'fonds-creation-immersive-cnc';
  }
  if (normalized.includes('aide individuelle') && normalized.includes('creation')) {
    return 'aide-individuelle-creation';
  }
  
  return normalized;
}

async function cleanProgramDuplicates() {
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

  const database: any = await client.databases.retrieve({ 
    database_id: databaseId 
  });
  
  const dataSourceId = database.data_sources?.[0]?.id || databaseId;

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

  console.log(`📚 ${allPages.length} pages actives trouvées\n`);

  // Extraire infos et grouper par programme
  const pagesWithInfo = allPages.map(page => {
    const title = page.properties?.["Nom de la subvention"]?.title?.[0]?.plain_text || "";
    const organisme = page.properties?.["Organisme"]?.rich_text?.[0]?.plain_text || "";
    const eligibility = page.properties?.["Critères d'éligibilité"]?.rich_text?.[0]?.plain_text || "";
    const amount = page.properties?.["Montant"]?.number || 0;
    
    // Score de complétude (pour choisir la meilleure version)
    const completenessScore = 
      (title.length > 0 ? 1 : 0) +
      (organisme.length > 0 ? 1 : 0) +
      (eligibility.length > 50 ? 2 : 0) + // Critères détaillés = +2
      (amount > 0 ? 1 : 0);
    
    return {
      id: page.id,
      title,
      organisme,
      program: getProgram(title),
      created: page.created_time,
      completenessScore,
      page,
    };
  });

  // Grouper par programme
  const grouped = new Map<string, any[]>();
  pagesWithInfo.forEach(item => {
    if (!grouped.has(item.program)) {
      grouped.set(item.program, []);
    }
    grouped.get(item.program)!.push(item);
  });

  // Trouver les programmes en doublon
  const duplicatePrograms: any[] = [];
  grouped.forEach((pages, program) => {
    if (pages.length > 1) {
      duplicatePrograms.push({ program, count: pages.length, pages });
    }
  });

  console.log(`🔍 ${duplicatePrograms.length} programmes en doublon trouvés :\n`);

  if (duplicatePrograms.length === 0) {
    console.log("✅ Aucun doublon de programme trouvé !");
    return;
  }

  duplicatePrograms.forEach(dup => {
    console.log(`📦 Programme : ${dup.program}`);
    console.log(`   ${dup.count} versions trouvées :`);
    dup.pages.forEach((p: any, i: number) => {
      console.log(`   ${i + 1}. "${p.title}" (score: ${p.completenessScore})`);
    });
    console.log("");
  });

  console.log(`🗑️ Suppression des doublons (garde la version la plus complète)...\n`);

  let deleted = 0;

  for (const dup of duplicatePrograms) {
    // Trier par score de complétude (desc), puis par date (plus ancienne)
    const sorted = dup.pages.sort((a: any, b: any) => {
      if (b.completenessScore !== a.completenessScore) {
        return b.completenessScore - a.completenessScore;
      }
      return new Date(a.created).getTime() - new Date(b.created).getTime();
    });
    
    const toKeep = sorted[0];
    const toDelete = sorted.slice(1);
    
    console.log(`✅ GARDE : "${toKeep.title}"`);
    console.log(`   Score de complétude: ${toKeep.completenessScore}/5`);
    
    for (const page of toDelete) {
      try {
        await client.pages.update({
          page_id: page.id,
          archived: true,
        });
        console.log(`  🗑️  Supprimé : "${page.title}"`);
        deleted++;
      } catch (error: any) {
        console.error(`  ❌ Erreur pour "${page.title}" : ${error.message}`);
      }
    }
    console.log("");
  }

  console.log(`✅ Nettoyage terminé : ${deleted} doublons archivés`);
  console.log(`📊 Il reste ${allPages.length - deleted} subventions uniques`);
}

cleanProgramDuplicates().catch(console.error);
