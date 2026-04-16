/**
 * Système de scraping automatique des organismes français
 * pour enrichir la base de données de subventions culturelles
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import { db } from './db';
import { organismsTracking, grants } from '@shared/schema';
import { eq } from 'drizzle-orm';

export interface ScrapedGrant {
  title: string;
  organization: string;
  description?: string;
  eligibility?: string;
  amount?: number;
  amountMin?: number;
  amountMax?: number;
  deadline?: string;
  url?: string;
  grantType?: string[];
  eligibleSectors?: string[];
}

export interface ScraperResult {
  success: boolean;
  grantsFound: ScrapedGrant[];
  grantsAdded: number;
  error?: string;
}

/**
 * Interface pour les scrapers spécifiques
 */
export interface OrganismScraper {
  scrape(browser: Browser): Promise<ScrapedGrant[]>;
}

/**
 * Liste des organismes prioritaires à scraper
 */
export const PRIORITY_ORGANISMS = [
  {
    name: 'MonProjetMusique',
    type: 'aggregator',
    sector: ['music'],
    website: 'https://www.monprojetmusique.fr/aides/'
  },
  {
    name: 'Centre National de la Musique (CNM)',
    type: 'professional_org',
    sector: ['music'],
    website: 'https://cnm.fr/aides-financieres/'
  },
  {
    name: 'SACEM',
    type: 'professional_org',
    sector: ['music'],
    website: 'https://www.sacem.fr'
  },
  {
    name: 'ADAMI',
    type: 'professional_org',
    sector: ['music', 'performing_arts'],
    website: 'https://www.adami.fr'
  },
  {
    name: 'SPEDIDAM',
    type: 'professional_org',
    sector: ['music'],
    website: 'https://www.spedidam.fr'
  },
  {
    name: 'Ministère de la Culture - DRAC',
    type: 'ministry',
    sector: ['all_arts'],
    website: 'https://www.culture.gouv.fr'
  },
  {
    name: 'SCPP',
    type: 'professional_org',
    sector: ['music'],
    website: 'https://www.scpp.fr'
  },
  {
    name: 'SPPF',
    type: 'professional_org',
    sector: ['music'],
    website: 'https://www.sppf.com'
  },
  {
    name: 'SACD',
    type: 'professional_org',
    sector: ['theater', 'cinema'],
    website: 'https://www.sacd.fr'
  },
  {
    name: 'ADAGP',
    type: 'professional_org',
    sector: ['visual_arts'],
    website: 'https://www.adagp.fr'
  },
  {
    name: 'ARTCENA',
    type: 'professional_org',
    sector: ['theater', 'circus', 'street_arts'],
    website: 'https://www.artcena.fr'
  }
];

/**
 * Initialiser les organismes dans la base de données
 */
export async function initializeOrganisms() {
  console.log('📋 Initialisation des organismes...');
  
  for (const org of PRIORITY_ORGANISMS) {
    // Vérifier si l'organisme existe déjà
    const existing = await db.select()
      .from(organismsTracking)
      .where(eq(organismsTracking.name, org.name))
      .limit(1);
    
    if (existing.length === 0) {
      await db.insert(organismsTracking).values({
        name: org.name,
        type: org.type,
        sector: org.sector,
        website: org.website,
        status: 'pending',
      });
      console.log(`  ✅ ${org.name} ajouté`);
    } else {
      console.log(`  ℹ️  ${org.name} existe déjà`);
    }
  }
  
  console.log('✅ Organismes initialisés\n');
}

/**
 * Lancer le scraping d'un organisme avec retry mechanism
 */
export async function scrapeOrganism(organismId: string, retries: number = 2): Promise<ScraperResult> {
  let browser: Browser | null = null;
  
  try {
    // Récupérer l'organisme
    const [organism] = await db.select()
      .from(organismsTracking)
      .where(eq(organismsTracking.id, organismId));
    
    if (!organism) {
      return {
        success: false,
        grantsFound: [],
        grantsAdded: 0,
        error: 'Organisme non trouvé'
      };
    }
    
    console.log(`🤖 Scraping de ${organism.name}...`);
    
    // Mettre à jour le statut
    await db.update(organismsTracking)
      .set({ status: 'in_progress' })
      .where(eq(organismsTracking.id, organismId));
    
    // Lancer le navigateur avec timeout
    browser = await Promise.race([
      puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ],
        timeout: 30000 // 30s timeout for browser launch
      }),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Browser launch timeout')), 30000)
      )
    ]);
    
    // Charger le scraper spécifique
    const scraper = await loadScraperForOrganism(organism.name);
    
    if (!scraper) {
      throw new Error(`Pas de scraper disponible pour ${organism.name}`);
    }
    
    // Exécuter le scraping
    const scrapedGrants = await scraper.scrape(browser);
    console.log(`  📊 ${scrapedGrants.length} aides trouvées`);
    
    // Insérer les nouvelles subventions dans la base
    let grantsAdded = 0;
    for (const grant of scrapedGrants) {
      // Vérifier si la subvention existe déjà (par titre ET organisme pour éviter les faux doublons)
      const { and } = await import('drizzle-orm');
      const existing = await db.select()
        .from(grants)
        .where(and(
          eq(grants.title, grant.title),
          eq(grants.organization, grant.organization)
        ))
        .limit(1);
      
      if (existing.length === 0) {
        await db.insert(grants).values({
          ...grant,
          status: 'active',
        } as any);
        grantsAdded++;
      }
    }
    
    console.log(`  ✅ ${grantsAdded} nouvelles aides ajoutées`);
    
    // Mettre à jour le statut de l'organisme
    await db.update(organismsTracking)
      .set({
        status: 'completed',
        totalAidsFound: scrapedGrants.length,
        totalAidsAdded: grantsAdded,
        lastScrapedAt: new Date(),
      })
      .where(eq(organismsTracking.id, organismId));
    
    return {
      success: true,
      grantsFound: scrapedGrants as any,
      grantsAdded,
    };
    
  } catch (error) {
    console.error(`❌ Erreur lors du scraping:`, error);
    
    // Retry logic
    if (retries > 0) {
      console.log(`  🔄 Nouvelle tentative (${retries} restantes)...`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retry
      return scrapeOrganism(organismId, retries - 1);
    }
    
    // Mettre à jour le statut en erreur
    await db.update(organismsTracking)
      .set({
        status: 'failed',
        notes: error instanceof Error ? error.message : 'Erreur inconnue'
      })
      .where(eq(organismsTracking.id, organismId));
    
    return {
      success: false,
      grantsFound: [],
      grantsAdded: 0,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  } finally {
    // CRITICAL: Always close browser to avoid resource leaks
    if (browser) {
      try {
        await browser.close();
        console.log('  🔒 Browser fermé correctement');
      } catch (closeError) {
        console.error('  ⚠️  Erreur lors de la fermeture du browser:', closeError);
      }
    }
  }
}

/**
 * Charger le scraper spécifique pour un organisme
 */
async function loadScraperForOrganism(organismName: string): Promise<OrganismScraper | null> {
  try {
    switch (organismName) {
      case 'MonProjetMusique': {
        const { MonProjetMusiqueScraper } = await import('./scrapers/monprojetmusique-scraper');
        return new MonProjetMusiqueScraper();
      }
      case 'Centre National de la Musique (CNM)': {
        const { CNMScraper } = await import('./scrapers/cnm-scraper');
        return new CNMScraper();
      }
      case 'SACEM': {
        const { SACEMScraper } = await import('./scrapers/sacem-scraper');
        return new SACEMScraper();
      }
      case 'ADAMI': {
        const { ADAMIScraper } = await import('./scrapers/adami-scraper');
        return new ADAMIScraper();
      }
      case 'SPEDIDAM': {
        const { SPEDIDAMScraper } = await import('./scrapers/spedidam-scraper');
        return new SPEDIDAMScraper();
      }
      case 'Ministère de la Culture - DRAC': {
        const { MinistereCultureScraper } = await import('./scrapers/ministere-culture-scraper');
        return new MinistereCultureScraper();
      }
      default:
        console.log(`  ⚠️  Scraper non implémenté pour ${organismName}`);
        return null;
    }
  } catch (error) {
    console.error(`  ❌ Erreur chargement scraper pour ${organismName}:`, error);
    return null;
  }
}

/**
 * Scraper toutes les organismes en attente
 */
export async function scrapeAllPendingOrganisms() {
  console.log('🚀 Scraping de tous les organismes en attente...\n');
  
  const organisms = await db.select()
    .from(organismsTracking)
    .where(eq(organismsTracking.status, 'pending'));
  
  console.log(`📊 ${organisms.length} organismes en attente\n`);
  
  const results = [];
  
  for (const organism of organisms) {
    const result = await scrapeOrganism(organism.id);
    results.push({ organism: organism.name, ...result });
    
    // Pause de 2 secondes entre chaque organisme
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Statistiques finales
  const successful = results.filter(r => r.success).length;
  const totalGrantsAdded = results.reduce((sum, r) => sum + r.grantsAdded, 0);
  
  console.log('\n📈 Résultats finaux:');
  console.log(`  ✅ Succès: ${successful}/${organisms.length}`);
  console.log(`  📝 Total aides ajoutées: ${totalGrantsAdded}`);
  
  return results;
}
