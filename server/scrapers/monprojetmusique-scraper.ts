/**
 * Scraper spécifique pour MonProjetMusique.fr
 * URL: https://www.monprojetmusique.fr/aides/
 * 
 * Ce site agrège les aides de nombreux organismes français pour la musique.
 */

import { Browser, Page } from 'puppeteer';
import { OrganismScraper, ScrapedGrant } from '../scraping-system';

export class MonProjetMusiqueScraper implements OrganismScraper {
  private baseUrl = 'https://www.monprojetmusique.fr/aides/';
  
  async scrape(browser: Browser): Promise<ScrapedGrant[]> {
    const page = await browser.newPage();
    const grants: ScrapedGrant[] = [];
    
    try {
      console.log(`  🌐 Accès à ${this.baseUrl}`);
      
      // Récupérer le nombre total de pages
      await page.goto(this.baseUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      const totalPages = await this.getTotalPages(page);
      console.log(`  📄 ${totalPages} pages à parcourir`);
      
      // Parcourir toutes les pages
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        console.log(`  📖 Page ${pageNum}/${totalPages}...`);
        
        const pageUrl = pageNum === 1 
          ? this.baseUrl 
          : `${this.baseUrl}page/${pageNum}/`;
        
        if (pageNum > 1) {
          await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        }
        
        // Extraire les liens des aides sur cette page
        const grantLinks = await page.evaluate(() => {
          const links: { url: string; title: string; organization: string }[] = [];
          
          // Les aides sont dans des liens avec la classe "list-item-aides"
          document.querySelectorAll('a.list-item-aides').forEach(el => {
            const link = el as HTMLAnchorElement;
            const href = link.href;
            
            // Extraire le titre depuis h3.title
            const titleEl = link.querySelector('h3.title');
            const title = titleEl?.textContent?.trim() || '';
            
            // Extraire l'organisation depuis h4.subtitle
            const orgEl = link.querySelector('h4.subtitle');
            const organization = orgEl?.textContent?.trim() || '';
            
            if (title && title.length > 3 && !links.some(l => l.url === href)) {
              links.push({
                url: href,
                title,
                organization: organization || 'Non spécifié'
              });
            }
          });
          
          return links;
        });
        
        console.log(`    → ${grantLinks.length} aides trouvées sur cette page`);
        
        // Récupérer les détails de chaque aide
        for (const grantLink of grantLinks) {
          try {
            const grantDetails = await this.scrapeGrantDetails(browser, grantLink.url, grantLink.title, grantLink.organization);
            if (grantDetails) {
              grants.push(grantDetails);
            }
          } catch (error) {
            console.log(`    ⚠️  Erreur pour ${grantLink.title}:`, error);
          }
          
          // Petite pause entre chaque aide pour éviter de surcharger le serveur
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
    } catch (error) {
      console.error('  ❌ Erreur scraping MonProjetMusique:', error);
      throw error;
    } finally {
      await page.close();
    }
    
    // Dédupliquer par titre + organisation
    const uniqueGrants = this.deduplicateGrants(grants);
    console.log(`  ✅ ${uniqueGrants.length} aides uniques extraites`);
    
    return uniqueGrants;
  }
  
  private async getTotalPages(page: Page): Promise<number> {
    try {
      const lastPageNumber = await page.evaluate(() => {
        // Chercher les liens de pagination
        const paginationLinks = document.querySelectorAll('a[href*="/aides/page/"]');
        let maxPage = 1;
        
        paginationLinks.forEach(link => {
          const href = (link as HTMLAnchorElement).href;
          const match = href.match(/\/page\/(\d+)/);
          if (match) {
            const pageNum = parseInt(match[1], 10);
            if (pageNum > maxPage) {
              maxPage = pageNum;
            }
          }
        });
        
        return maxPage;
      });
      
      return lastPageNumber;
    } catch {
      return 1;
    }
  }
  
  private async scrapeGrantDetails(
    browser: Browser, 
    url: string, 
    title: string, 
    organization: string
  ): Promise<ScrapedGrant | null> {
    const detailPage = await browser.newPage();
    
    try {
      await detailPage.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
      
      const details = await detailPage.evaluate(() => {
        // Vérifier que c'est bien une page de détail d'aide (contient les marqueurs attendus)
        const pageText = document.body.textContent || '';
        const isBeneficiaryPage = pageText.includes('Bénéficiaire') && pageText.includes('Type de projet');
        
        if (!isBeneficiaryPage) {
          return null; // Ce n'est pas une vraie page d'aide
        }
        
        // Description principale - chercher les paragraphes après le titre h1
        const h1 = document.querySelector('h1');
        let description = '';
        if (h1) {
          const paragraphs = document.querySelectorAll('article p, .entry-content p, main p');
          const descParts: string[] = [];
          paragraphs.forEach(p => {
            const text = p.textContent?.trim() || '';
            if (text && text.length > 20 && !text.includes('Bénéficiaire :') && !text.includes('Type de projet :')) {
              descParts.push(text);
            }
          });
          description = descParts.join(' ').substring(0, 1500);
        }
        
        // Bénéficiaire
        const beneficiaryMatch = pageText.match(/Bénéficiaire\s*:\s*([^\n]+)/);
        const beneficiaryText = beneficiaryMatch ? beneficiaryMatch[1].trim() : '';
        
        // Type de projet
        const projectTypeMatch = pageText.match(/Type de projet\s*:\s*([^\n]+)/);
        const projectTypeText = projectTypeMatch ? projectTypeMatch[1].trim() : '';
        
        // Organisme
        const organismeMatch = pageText.match(/Organisme\s*:\s*\n?\s*([^\n]+)/);
        const organismeText = organismeMatch ? organismeMatch[1].trim() : '';
        
        // Lien vers la fiche complète (organisme source)
        const officialLink = document.querySelector('a[href*="sacem.fr"], a[href*="cnm.fr"], a[href*="adami.fr"], a[href*="spedidam.fr"], a[href*="culture.gouv.fr"], a[href*="aide-aux-projets"]');
        const officialUrl = officialLink ? (officialLink as HTMLAnchorElement).href : '';
        
        return {
          description,
          beneficiary: beneficiaryText,
          projectType: projectTypeText,
          officialUrl,
          detectedOrg: organismeText
        };
      });
      
      // Si la page n'est pas une vraie page d'aide, retourner null
      if (!details) {
        return null;
      }
      
      // Déterminer les secteurs éligibles
      const eligibleSectors = this.determineEligibleSectors(details.projectType, title);
      
      // Construire le type d'aide
      const grantType = this.determineGrantType(details.projectType, title);
      
      // Utiliser l'organisation détectée si disponible
      const finalOrg = details.detectedOrg || organization || 'MonProjetMusique';
      
      return {
        title,
        organization: finalOrg,
        description: details.description || undefined,
        eligibility: details.beneficiary ? `Bénéficiaires: ${details.beneficiary}` : undefined,
        url: details.officialUrl || url,
        grantType,
        eligibleSectors,
      };
      
    } catch (error) {
      // En cas d'erreur, retourner les infos de base
      return {
        title,
        organization: organization || 'MonProjetMusique',
        url,
        grantType: ['Aide musicale'],
        eligibleSectors: ['music'],
      };
    } finally {
      await detailPage.close();
    }
  }
  
  private determineEligibleSectors(projectType: string, title: string): string[] {
    const sectors = ['music'];
    const combinedText = `${projectType} ${title}`.toLowerCase();
    
    if (combinedText.includes('spectacle') || combinedText.includes('scène')) {
      sectors.push('performing_arts');
    }
    if (combinedText.includes('audiovisuel') || combinedText.includes('vidéo') || combinedText.includes('clip')) {
      sectors.push('audiovisual');
    }
    if (combinedText.includes('festival')) {
      sectors.push('festivals');
    }
    if (combinedText.includes('export') || combinedText.includes('international')) {
      sectors.push('international');
    }
    
    return Array.from(new Set(sectors));
  }
  
  private determineGrantType(projectType: string, title: string): string[] {
    const types: string[] = [];
    const combinedText = `${projectType} ${title}`.toLowerCase();
    
    if (combinedText.includes('production')) types.push('Production');
    if (combinedText.includes('création') || combinedText.includes('commande')) types.push('Création');
    if (combinedText.includes('diffusion') || combinedText.includes('programmation')) types.push('Diffusion');
    if (combinedText.includes('résidence') || combinedText.includes('bourse')) types.push('Résidence/Bourse');
    if (combinedText.includes('formation')) types.push('Formation');
    if (combinedText.includes('export') || combinedText.includes('international')) types.push('Export');
    if (combinedText.includes('festival')) types.push('Festival');
    if (combinedText.includes('enregistrement') || combinedText.includes('phonographique')) types.push('Enregistrement');
    if (combinedText.includes('accompagnement')) types.push('Accompagnement');
    
    return types.length > 0 ? types : ['Aide musicale'];
  }
  
  private deduplicateGrants(grants: ScrapedGrant[]): ScrapedGrant[] {
    const seen = new Map<string, ScrapedGrant>();
    
    for (const grant of grants) {
      const key = `${grant.title.toLowerCase()}-${grant.organization.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.set(key, grant);
      }
    }
    
    return Array.from(seen.values());
  }
}
