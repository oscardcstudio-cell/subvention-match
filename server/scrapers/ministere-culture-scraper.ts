/**
 * Scraper pour le Ministère de la Culture - DRAC
 * URL: https://www.culture.gouv.fr
 */

import { Browser } from 'puppeteer';
import { OrganismScraper, ScrapedGrant } from '../scraping-system';

export class MinistereCultureScraper implements OrganismScraper {
  private baseUrl = 'https://www.culture.gouv.fr/Aides-demarches';
  
  async scrape(browser: Browser): Promise<ScrapedGrant[]> {
    const page = await browser.newPage();
    const grants: ScrapedGrant[] = [];
    
    try {
      console.log(`  🌐 Accès à ${this.baseUrl}`);
      await page.goto(this.baseUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      await page.waitForSelector('article, .aid-card', { timeout: 10000 }).catch(() => {
        console.log('  ⚠️  Sélecteurs non trouvés, utilisation de sélecteurs génériques...');
      });
      
      const aidElements = await page.$$('article, .aid-card, .demarche-item');
      
      console.log(`  📋 ${aidElements.length} éléments trouvés`);
      
      for (const element of aidElements) {
        try {
          const titleEl = await element.$('h2, h3, h4, .title');
          const title = titleEl ? await titleEl.evaluate(el => el.textContent?.trim() || '') : '';
          
          if (!title || title.length < 10) continue;
          
          const descEl = await element.$('p, .description');
          const description = descEl ? await descEl.evaluate(el => el.textContent?.trim() || '') : '';
          
          const linkEl = await element.$('a[href]');
          const relativeUrl = linkEl ? await linkEl.evaluate(el => el.getAttribute('href') || '') : '';
          const url = relativeUrl.startsWith('http') ? relativeUrl : `https://www.culture.gouv.fr${relativeUrl}`;
          
          grants.push({
            title,
            organization: 'Ministère de la Culture - DRAC',
            description: description || undefined,
            eligibility: 'Aide publique du Ministère de la Culture accessible aux artistes et structures culturelles. Consulter la DRAC de votre région pour les critères spécifiques.',
            url,
            grantType: ['Aide publique'],
            eligibleSectors: ['all_arts'],
          });
        } catch (error) {
          console.log(`  ⚠️  Erreur extraction élément:`, error);
          continue;
        }
      }
      
    } catch (error) {
      console.error('  ❌ Erreur scraping Ministère de la Culture:', error);
      throw error;
    } finally {
      await page.close();
    }
    
    return grants;
  }
}
