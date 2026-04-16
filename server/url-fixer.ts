import puppeteer from 'puppeteer';
import { grantStorage } from './grant-storage';

interface UrlFixResult {
  grantId: string;
  title: string;
  originalUrl: string;
  foundUrl: string | null;
  method: string;
  success: boolean;
}

const KEYWORDS_PRIORITY = [
  'candidature', 'candidater', 'postuler', 'deposer', 'demande',
  'formulaire', 'inscription', 'appel-a-projet', 'appel-a-candidature',
  'subvention', 'aide', 'dispositif', 'soutien', 'financement',
  'dossier', 'conditions', 'eligibilite', 'beneficiaires'
];

async function findBestUrl(baseUrl: string, grantTitle: string, organization: string): Promise<{ url: string | null; method: string }> {
  if (!baseUrl || baseUrl === '(manquante)') {
    return { url: null, method: 'no_base_url' };
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    const links = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a[href]'));
      return anchors.map(a => ({
        href: (a as HTMLAnchorElement).href,
        text: a.textContent?.trim().toLowerCase() || ''
      })).filter(link => link.href && !link.href.startsWith('javascript:'));
    });

    const titleWords = grantTitle.toLowerCase().split(/\s+/).filter(w => w.length > 4);
    
    let bestMatch: { url: string; score: number } | null = null;
    
    for (const link of links) {
      const urlLower = link.href.toLowerCase();
      const textLower = link.text;
      let score = 0;
      
      for (const keyword of KEYWORDS_PRIORITY) {
        if (urlLower.includes(keyword)) score += 10;
        if (textLower.includes(keyword)) score += 5;
      }
      
      for (const word of titleWords) {
        if (urlLower.includes(word)) score += 3;
        if (textLower.includes(word)) score += 2;
      }
      
      const pathDepth = (link.href.match(/\//g) || []).length;
      if (pathDepth > 3) score += pathDepth;
      
      if (urlLower.includes('accueil') || urlLower.includes('home') || urlLower === baseUrl) {
        score -= 20;
      }
      
      if (score > 0 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { url: link.href, score };
      }
    }

    await browser.close();
    
    if (bestMatch && bestMatch.score >= 10) {
      return { url: bestMatch.url, method: 'crawl_found' };
    }
    
    return { url: null, method: 'no_match_found' };
    
  } catch (error: any) {
    if (browser) await browser.close();
    console.error(`❌ URL fix error for ${baseUrl}:`, error.message);
    return { url: null, method: 'crawl_error' };
  }
}

export async function fixAllUrls(limit: number = 10): Promise<{
  processed: number;
  fixed: number;
  failed: number;
  results: UrlFixResult[];
}> {
  const allGrants = await grantStorage.getAllActiveGrants();
  
  const grantsToFix = allGrants.filter(grant => {
    const url = grant.url || '';
    if (!url) return true;
    if (url.match(/^https?:\/\/[^\/]+\/?$/)) return true;
    if (url.includes('/accueil') || url.includes('/home')) return true;
    if (!url.includes('subvention') && !url.includes('aide') && 
        !url.includes('dispositif') && !url.includes('appel') &&
        !url.includes('candidat') && !url.includes('soutien')) return true;
    return false;
  }).slice(0, limit);

  console.log(`🔧 Fixing URLs for ${grantsToFix.length} grants...`);
  
  const results: UrlFixResult[] = [];
  let fixed = 0;
  let failed = 0;

  for (const grant of grantsToFix) {
    console.log(`  → Processing: ${grant.title.substring(0, 50)}...`);
    
    const { url: foundUrl, method } = await findBestUrl(
      grant.url || '', 
      grant.title, 
      grant.organization
    );
    
    const result: UrlFixResult = {
      grantId: grant.id,
      title: grant.title,
      originalUrl: grant.url || '(manquante)',
      foundUrl,
      method,
      success: !!foundUrl
    };
    
    // Toujours marquer comme traité pour le batch pour éviter les boucles
    await grantStorage.updateGrant(grant.id, { 
      url: foundUrl || grant.url, // Keep old or set new
      improvedUrl: foundUrl || (grant.url ? grant.url + '#no-match' : 'failed')
    });

    if (foundUrl) {
      fixed++;
      console.log(`    ✅ Fixed: ${foundUrl}`);
    } else {
      failed++;
      console.log(`    ❌ No match found (${method})`);
    }
    
    results.push(result);
    
    // Marquer l'URL comme améliorée dans tous les cas pour ne plus l'afficher dans la liste des problèmes
    // même si le crawl a échoué (évite de boucler sur les mêmes erreurs)
    if (!foundUrl) {
      await grantStorage.updateGrant(grant.id, { 
        improvedUrl: grant.url || 'failed' 
      });
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`🔧 URL fixing complete: ${fixed} fixed, ${failed} failed`);
  
  return {
    processed: grantsToFix.length,
    fixed,
    failed,
    results
  };
}

export async function fixSingleUrl(grantId: string): Promise<UrlFixResult | null> {
  const grant = await grantStorage.getGrantById(grantId);
  if (!grant) return null;
  
  const { url: foundUrl, method } = await findBestUrl(
    grant.url || '', 
    grant.title, 
    grant.organization
  );
  
  if (foundUrl) {
    await grantStorage.updateGrant(grant.id, { 
      improvedUrl: foundUrl 
    });
  }
  
  return {
    grantId: grant.id,
    title: grant.title,
    originalUrl: grant.url || '(manquante)',
    foundUrl,
    method,
    success: !!foundUrl
  };
}
