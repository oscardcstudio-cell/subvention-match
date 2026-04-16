/**
 * Système de scraping intelligent pour améliorer les URLs et extraire les ressources d'aide
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import { execSync } from 'child_process';

// Trouve le chemin de Chromium système (env > `which chromium` > bundled puppeteer Chrome)
function getChromiumPath(): string | undefined {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }
  try {
    const p = execSync('which chromium').toString().trim();
    return p || undefined;
  } catch {
    return undefined; // let puppeteer use its bundled Chrome
  }
}

export interface HelpResource {
  type: 'video' | 'pdf' | 'guide' | 'tutorial';
  url: string;
  title: string;
  description?: string;
}

export interface ScrapeResult {
  improvedUrl: string | null;
  helpResources: HelpResource[];
  success: boolean;
  error?: string;
}

// Mots-clés pour identifier des ressources d'aide
const HELP_KEYWORDS = {
  tutorial: ['tutoriel', 'tutorial', 'guide', 'comment', 'mode d\'emploi', 'pas à pas'],
  video: ['vidéo', 'video', 'webinaire', 'webinar', 'présentation'],
  pdf: ['télécharger', 'download', 'notice', 'formulaire', 'dossier'],
};

/**
 * Scrape une URL de subvention pour extraire ressources et URL améliorée
 */
export async function scrapeGrantUrl(url: string, grantTitle: string): Promise<ScrapeResult> {
  let browser: Browser | null = null;
  
  try {
    console.log(`🔍 Scraping: ${url.substring(0, 60)}...`);
    
    browser = await puppeteer.launch({
      headless: true,
      executablePath: getChromiumPath(),
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });
    
    const page = await browser.newPage();
    
    // Timeout de 30 secondes
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 30000,
    });
    
    // Extraire les ressources d'aide
    const helpResources = await extractHelpResources(page, grantTitle);
    
    // Chercher une URL plus spécifique si on est sur une page générique
    const improvedUrl = await findBetterUrl(page, url, grantTitle);
    
    await browser.close();
    
    return {
      improvedUrl,
      helpResources,
      success: true,
    };
    
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    
    console.error(`❌ Erreur de scraping pour ${url}:`, error);
    
    return {
      improvedUrl: null,
      helpResources: [],
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Extrait les ressources d'aide (vidéos, PDFs, tutoriels)
 */
async function extractHelpResources(page: Page, grantTitle: string): Promise<HelpResource[]> {
  const resources: HelpResource[] = [];
  
  try {
    // 1. Extraire les vidéos
    const videos = await page.evaluate(() => {
      const videoElements: Array<{ url: string; title: string }> = [];
      
      // Vidéos <video> avec src
      document.querySelectorAll('video[src]').forEach(v => {
        const video = v as HTMLVideoElement;
        videoElements.push({
          url: video.src,
          title: video.title || video.getAttribute('aria-label') || 'Vidéo tutoriel',
        });
      });
      
      // Vidéos <source> dans <video>
      document.querySelectorAll('video source[src]').forEach(s => {
        const source = s as HTMLSourceElement;
        videoElements.push({
          url: source.src,
          title: source.title || 'Vidéo tutoriel',
        });
      });
      
      // Liens YouTube/Vimeo
      document.querySelectorAll('a[href*="youtube.com"], a[href*="youtu.be"], a[href*="vimeo.com"]').forEach(a => {
        const link = a as HTMLAnchorElement;
        videoElements.push({
          url: link.href,
          title: link.textContent?.trim() || link.title || 'Vidéo explicative',
        });
      });
      
      // iframes YouTube/Vimeo
      document.querySelectorAll('iframe[src*="youtube.com"], iframe[src*="vimeo.com"]').forEach(iframe => {
        const frame = iframe as HTMLIFrameElement;
        videoElements.push({
          url: frame.src,
          title: frame.title || 'Vidéo tutoriel',
        });
      });
      
      return videoElements;
    });
    
    videos.forEach(v => {
      resources.push({
        type: 'video',
        url: v.url,
        title: v.title,
      });
    });
    
    // 2. Extraire les PDFs
    const pdfs = await page.evaluate(() => {
      const pdfLinks: Array<{ url: string; title: string }> = [];
      
      document.querySelectorAll('a[href*=".pdf"], a[href*="PDF"]').forEach(a => {
        const link = a as HTMLAnchorElement;
        const text = link.textContent?.trim() || link.title || '';
        
        // Filtrer les PDFs pertinents (guides, formulaires, notices)
        const isRelevant = /guide|formulaire|notice|dossier|tutoriel|aide|candidat/i.test(text);
        
        if (isRelevant || text.length < 100) {
          pdfLinks.push({
            url: link.href,
            title: text.substring(0, 100) || 'Document PDF',
          });
        }
      });
      
      return pdfLinks;
    });
    
    pdfs.forEach(p => {
      resources.push({
        type: 'pdf',
        url: p.url,
        title: p.title,
      });
    });
    
    // 3. Chercher des liens de tutoriels/guides
    const guides = await page.evaluate(() => {
      const guideLinks: Array<{ url: string; title: string }> = [];
      
      // Chercher des liens avec mots-clés d'aide
      const keywords = /tutoriel|tutorial|guide|comment|aide|candidat|mode d'emploi|pas à pas/i;
      
      document.querySelectorAll('a').forEach(a => {
        const link = a as HTMLAnchorElement;
        const text = link.textContent?.trim() || '';
        const href = link.href;
        
        // Exclure les PDFs et vidéos déjà capturés
        if (href.includes('.pdf') || href.includes('youtube') || href.includes('vimeo')) {
          return;
        }
        
        if (keywords.test(text) && text.length < 100) {
          guideLinks.push({
            url: href,
            title: text.substring(0, 100),
          });
        }
      });
      
      return guideLinks.slice(0, 3); // Max 3 guides
    });
    
    guides.forEach(g => {
      resources.push({
        type: 'guide',
        url: g.url,
        title: g.title,
      });
    });
    
    console.log(`   ✅ Trouvé ${resources.length} ressources d'aide`);
    
  } catch (error) {
    console.error('   ⚠️  Erreur extraction ressources:', error);
  }
  
  return resources;
}

/**
 * Cherche une URL plus spécifique si on est sur une page générique
 */
async function findBetterUrl(page: Page, currentUrl: string, grantTitle: string): Promise<string | null> {
  try {
    // Si l'URL actuelle est déjà bonne (contient des mots-clés spécifiques), on garde
    const urlLower = currentUrl.toLowerCase();
    if (
      urlLower.includes('demarches-simplifiees') ||
      urlLower.includes('/aide/') ||
      urlLower.includes('/candidat') ||
      urlLower.includes('/formulaire') ||
      urlLower.includes('/projet')
    ) {
      return null; // URL déjà bonne
    }
    
    // Chercher un lien plus spécifique sur la page
    const betterLink = await page.evaluate((title) => {
      const links = Array.from(document.querySelectorAll('a'));
      
      // Chercher un lien qui correspond au titre de la subvention
      const titleWords = title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      
      for (const link of links) {
        const href = (link as HTMLAnchorElement).href;
        const text = link.textContent?.toLowerCase() || '';
        
        // Si le lien contient plusieurs mots du titre ET des mots-clés d'action
        const matchingWords = titleWords.filter(word => text.includes(word) || href.includes(word));
        const hasActionKeywords = /candidat|demande|formulaire|dossier|déposer|postuler/i.test(text);
        
        if (matchingWords.length >= 2 && hasActionKeywords) {
          return href;
        }
      }
      
      // Sinon, chercher un lien "candidater" ou "déposer un dossier"
      for (const link of links) {
        const text = link.textContent?.toLowerCase() || '';
        if (/candidat|déposer.*dossier|faire.*demande|postuler/i.test(text)) {
          return (link as HTMLAnchorElement).href;
        }
      }
      
      return null;
    }, grantTitle);
    
    if (betterLink && betterLink !== currentUrl) {
      console.log(`   🔗 URL améliorée trouvée: ${betterLink.substring(0, 60)}...`);
      return betterLink;
    }
    
  } catch (error) {
    console.error('   ⚠️  Erreur recherche URL améliorée:', error);
  }
  
  return null;
}

/**
 * Batch scraping : scrape plusieurs URLs en parallèle (avec limite de concurrence)
 */
export async function batchScrapeGrants(
  grants: Array<{ id: string; url: string; title: string }>,
  concurrency = 3
): Promise<Map<string, ScrapeResult>> {
  const results = new Map<string, ScrapeResult>();
  
  // Traiter par batch pour éviter de surcharger
  for (let i = 0; i < grants.length; i += concurrency) {
    const batch = grants.slice(i, i + concurrency);
    
    console.log(`\n📦 Batch ${Math.floor(i / concurrency) + 1}/${Math.ceil(grants.length / concurrency)}`);
    
    const batchPromises = batch.map(grant => 
      scrapeGrantUrl(grant.url, grant.title)
        .then(result => ({ id: grant.id, result }))
    );
    
    const batchResults = await Promise.all(batchPromises);
    
    batchResults.forEach(({ id, result }) => {
      results.set(id, result);
    });
    
    // Pause entre les batches
    if (i + concurrency < grants.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  return results;
}
