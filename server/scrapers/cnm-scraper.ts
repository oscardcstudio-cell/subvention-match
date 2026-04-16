/**
 * Scraper spécifique pour le Centre National de la Musique (CNM)
 * URL: https://cnm.fr/aides-financieres/
 */

import { Browser, Page } from 'puppeteer';
import { OrganismScraper, ScrapedGrant } from '../scraping-system';

export class CNMScraper implements OrganismScraper {
  private baseUrl = 'https://cnm.fr/aides-financieres/';
  
  async scrape(browser: Browser): Promise<ScrapedGrant[]> {
    const page = await browser.newPage();
    const grants: ScrapedGrant[] = [];
    
    try {
      console.log(`  🌐 Accès à ${this.baseUrl}`);
      await page.goto(this.baseUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Attendre que le contenu soit chargé
      await page.waitForSelector('.aide-card, .aid-item, article', { timeout: 10000 }).catch(() => {
        console.log('  ⚠️  Sélecteurs par défaut non trouvés, tentative avec sélecteurs génériques...');
      });
      
      // Extraire les informations des aides
      const aidElements = await page.$$('.aide-card, .aid-item, article, .card');
      
      console.log(`  📋 ${aidElements.length} éléments trouvés`);
      
      for (const element of aidElements) {
        try {
          // Titre de l'aide
          const titleEl = await element.$('h2, h3, h4, .title, .aide-title');
          const title = titleEl ? await titleEl.evaluate(el => el.textContent?.trim() || '') : '';
          
          if (!title) continue;
          
          // Description
          const descEl = await element.$('p, .description, .aide-description');
          const description = descEl ? await descEl.evaluate(el => el.textContent?.trim() || '') : '';
          
          // URL de l'aide
          const linkEl = await element.$('a[href]');
          const relativeUrl = linkEl ? await linkEl.evaluate(el => el.getAttribute('href') || '') : '';
          const url = relativeUrl.startsWith('http') ? relativeUrl : `https://cnm.fr${relativeUrl}`;
          
          // Type d'aide (essayer d'extraire depuis les tags/badges)
          const tagsEls = await element.$$('.tag, .badge, .category');
          const tags: string[] = [];
          for (const tagEl of tagsEls) {
            const tag = await tagEl.evaluate(el => el.textContent?.trim() || '');
            if (tag) tags.push(tag);
          }
          
          grants.push({
            title: title,
            organization: 'Centre National de la Musique (CNM)',
            description: description || undefined,
            eligibility: 'Aide destinée aux professionnels de la musique (artistes, producteurs, labels). Consulter le site du CNM pour les critères spécifiques.',
            url: url || this.baseUrl,
            grantType: tags.length > 0 ? tags : ['Aide musicale'],
            eligibleSectors: ['music'],
          });
          
        } catch (error) {
          console.log(`  ⚠️  Erreur extraction élément:`, error);
          continue;
        }
      }
      
      // Si aucune aide trouvée avec les sélecteurs, utiliser une approche fallback
      if (grants.length === 0) {
        console.log('  🔄 Fallback: extraction manuelle des liens d\'aides...');
        
        const links = await page.$$('a[href*="/aides-financieres/"]');
        
        for (const link of links) {
          const text = await link.evaluate(el => el.textContent?.trim() || '');
          const href = await link.evaluate(el => el.getAttribute('href') || '');
          
          if (text.length > 10 && !text.toLowerCase().includes('accueil')) {
            grants.push({
              title: text,
              organization: 'Centre National de la Musique (CNM)',
              eligibility: 'Aide destinée aux professionnels de la musique (artistes, producteurs, labels). Consulter le site du CNM pour les critères spécifiques.',
              url: href.startsWith('http') ? href : `https://cnm.fr${href}`,
              grantType: ['Aide musicale'],
              eligibleSectors: ['music'],
            });
          }
        }
      }
      
    } catch (error) {
      console.error('  ❌ Erreur scraping CNM:', error);
      throw error;
    } finally {
      await page.close();
    }
    
    return grants;
  }
}
