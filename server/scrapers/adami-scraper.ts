/**
 * Scraper pour l'ADAMI (Société pour l'Administration des Droits des Artistes et Musiciens Interprètes)
 * URL: https://www.adami.fr
 */

import { Browser } from 'puppeteer';
import { OrganismScraper, ScrapedGrant } from '../scraping-system';

export class ADAMIScraper implements OrganismScraper {
  private baseUrl = 'https://www.adami.fr/aides-actions/';
  
  async scrape(browser: Browser): Promise<ScrapedGrant[]> {
    const page = await browser.newPage();
    const grants: ScrapedGrant[] = [];
    
    try {
      console.log(`  🌐 Accès à ${this.baseUrl}`);
      await page.goto(this.baseUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      await page.waitForSelector('article, .aid-card', { timeout: 10000 }).catch(() => {
        console.log('  ⚠️  Sélecteurs non trouvés, utilisation de sélecteurs génériques...');
      });
      
      const aidElements = await page.$$('article, .aid-card, .aid-item');
      
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
          const url = relativeUrl.startsWith('http') ? relativeUrl : `https://www.adami.fr${relativeUrl}`;
          
          grants.push({
            title,
            organization: 'ADAMI',
            description: description || undefined,
            eligibility: 'Aide réservée aux artistes-interprètes (musiciens, comédiens, danseurs) membres de l\'ADAMI. Consulter le site pour les critères spécifiques.',
            url,
            grantType: ['Aide aux artistes-interprètes'],
            eligibleSectors: ['music', 'performing_arts'],
          });
        } catch (error) {
          console.log(`  ⚠️  Erreur extraction élément:`, error);
          continue;
        }
      }
      
    } catch (error) {
      console.error('  ❌ Erreur scraping ADAMI:', error);
      throw error;
    } finally {
      await page.close();
    }
    
    return grants;
  }
}
