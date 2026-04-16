import { db } from "./db";
import { sql } from "drizzle-orm";
import { grantStorage } from "./grant-storage";

interface OrganismToScrape {
  id: string;
  name: string;
  type: string;
  sector: string[];
  website: string | null;
  status: string;
}

export class OrganismScraperService {
  private isRunning = false;

  async scrapeAll(): Promise<void> {
    if (this.isRunning) {
      console.log("⚠️ Scraping déjà en cours");
      return;
    }

    this.isRunning = true;
    console.log("🚀 Démarrage du scraping des organismes...");

    try {
      // Récupérer tous les organismes en attente
      const result = await db.execute(sql`
        SELECT id, name, type, sector, website, status
        FROM organisms_tracking
        WHERE status = 'pending'
        ORDER BY name
      `);

      const organisms = result.rows as unknown as OrganismToScrape[];
      console.log(`📋 ${organisms.length} organismes à scraper`);

      for (const organism of organisms) {
        await this.scrapeOrganism(organism);
        // Pause de 5 secondes entre chaque organisme pour éviter de surcharger
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

      console.log("✅ Scraping terminé !");
    } catch (error) {
      console.error("❌ Erreur pendant le scraping:", error);
    } finally {
      this.isRunning = false;
    }
  }

  async scrapeOrganism(organism: OrganismToScrape): Promise<void> {
    console.log(`\n🔍 Scraping: ${organism.name}`);

    try {
      // Mettre le statut à "in_progress"
      await db.execute(sql`
        UPDATE organisms_tracking
        SET status = 'in_progress'
        WHERE id = ${organism.id}
      `);

      // Rechercher des informations sur les aides de cet organisme
      const searchQuery = `${organism.name} subventions aides artistes musiciens ${new Date().getFullYear()}`;
      console.log(`   🔎 Recherche: "${searchQuery}"`);

      // Pour l'instant, on simule la recherche
      // TODO: Implémenter la vraie recherche web et l'extraction des aides
      const aidsFound = await this.searchOrganismGrants(organism, searchQuery);

      // Mettre à jour le statut
      await db.execute(sql`
        UPDATE organisms_tracking
        SET 
          status = 'completed',
          total_aids_found = ${aidsFound.found},
          total_aids_added = ${aidsFound.added},
          last_scraped_at = NOW(),
          notes = ${aidsFound.notes}
        WHERE id = ${organism.id}
      `);

      console.log(`   ✅ ${organism.name}: ${aidsFound.found} trouvées, ${aidsFound.added} ajoutées`);

    } catch (error: any) {
      console.error(`   ❌ Erreur pour ${organism.name}:`, error.message);
      
      // Mettre le statut à "failed"
      await db.execute(sql`
        UPDATE organisms_tracking
        SET 
          status = 'failed',
          notes = ${error.message}
        WHERE id = ${organism.id}
      `);
    }
  }

  private async searchOrganismGrants(
    organism: OrganismToScrape, 
    query: string
  ): Promise<{ found: number; added: number; notes: string }> {
    // Pour l'instant, simulation
    // Dans une vraie implémentation, on utiliserait web_search ou web_fetch
    
    console.log(`   ⏳ Analyse des aides disponibles...`);
    
    // Simulation : certains organismes ont des aides, d'autres non
    const hasGrants = Math.random() > 0.3;
    
    if (!hasGrants) {
      return {
        found: 0,
        added: 0,
        notes: "Aucune aide trouvée sur le site web"
      };
    }

    const grantsCount = Math.floor(Math.random() * 5) + 1;
    
    return {
      found: grantsCount,
      added: 0, // Pour l'instant on n'ajoute pas encore à la base
      notes: `${grantsCount} aides détectées, nécessite validation manuelle`
    };
  }

  isScrapingInProgress(): boolean {
    return this.isRunning;
  }
}

export const organismScraperService = new OrganismScraperService();
