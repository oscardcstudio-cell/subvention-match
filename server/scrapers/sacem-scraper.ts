/**
 * Scraper pour la SACEM (Société des Auteurs, Compositeurs et Éditeurs de Musique)
 * URL: https://www.sacem.fr
 */

import { Browser } from 'puppeteer';
import { OrganismScraper, ScrapedGrant } from '../scraping-system';

export class SACEMScraper implements OrganismScraper {
  private baseUrl = 'https://www.sacem.fr/proteger-gerer/les-aides-la-creation';
  
  async scrape(browser: Browser): Promise<ScrapedGrant[]> {
    const page = await browser.newPage();
    const grants: ScrapedGrant[] = [];
    
    try {
      console.log(`  🌐 Accès à ${this.baseUrl}`);
      await page.goto(this.baseUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Attendre le chargement du contenu
      await page.waitForSelector('article, .aid-card, .help-item', { timeout: 10000 }).catch(() => {
        console.log('  ⚠️  Sélecteurs non trouvés, utilisation de sélecteurs génériques...');
      });
      
      // Extraire les aides (structure à adapter selon le site réel)
      const aidElements = await page.$$('article, .aid-card, .help-item');
      
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
          const url = relativeUrl.startsWith('http') ? relativeUrl : `https://www.sacem.fr${relativeUrl}`;
          
          grants.push({
            title,
            organization: 'SACEM',
            description: description || undefined,
            eligibility: 'Aide réservée aux auteurs, compositeurs et éditeurs membres de la SACEM. Consulter le site pour les critères spécifiques.',
            url,
            grantType: ['Aide à la création musicale'],
            eligibleSectors: ['music'],
          });
        } catch (error) {
          console.log(`  ⚠️  Erreur extraction élément:`, error);
          continue;
        }
      }
      
    } catch (error) {
      console.error('  ❌ Erreur scraping SACEM:', error);
      throw error;
    } finally {
      await page.close();
    }
    
    return grants;
  }
}
