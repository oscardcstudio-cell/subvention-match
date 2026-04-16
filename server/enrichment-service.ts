import { grantStorage } from "./grant-storage";
import type { Grant } from "@shared/schema";

interface EnrichmentResult {
  grantId: string;
  title: string;
  status: 'success' | 'failed' | 'no_changes';
  changes?: {
    amountMin?: number;
    amountMax?: number;
    amount?: number;
    deadline?: string;
    processingTime?: string;
    contactEmail?: string;
    contactPhone?: string;
    maxFundingRate?: number;
    annualBeneficiaries?: number;
    applicationDifficulty?: string;
    preparationAdvice?: string;
  };
  error?: string;
}

export class EnrichmentService {
  private isRunning = false;
  private currentBatch: string[] = [];
  
  async enrichGrant(grant: Grant): Promise<EnrichmentResult> {
    try {
      console.log(`🔍 Enrichissement de: ${grant.title}`);
      
      // Marquer comme en cours
      await grantStorage.updateEnrichmentStatus(grant.id, 'in_progress');
      
      // Recherche web pour trouver les infos manquantes
      const searchQuery = this.buildSearchQuery(grant);
      console.log(`   Query: ${searchQuery}`);
      
      // TODO: Appeler web_search ici via une fonction externe
      // Pour l'instant, on simule avec un délai
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Extraire les données (à implémenter avec de vraies données)
      const enrichedData = await this.extractEnrichedData(grant, searchQuery);
      
      if (!enrichedData || Object.keys(enrichedData).length === 0) {
        await grantStorage.updateEnrichmentStatus(grant.id, 'completed');
        return {
          grantId: grant.id,
          title: grant.title,
          status: 'no_changes'
        };
      }
      
      // Mettre à jour la subvention
      await grantStorage.updateGrantData(grant.id, enrichedData);
      await grantStorage.updateEnrichmentStatus(grant.id, 'completed');
      
      console.log(`✅ Enrichi: ${grant.title}`);
      
      return {
        grantId: grant.id,
        title: grant.title,
        status: 'success',
        changes: enrichedData
      };
      
    } catch (error: any) {
      console.error(`❌ Erreur enrichissement ${grant.title}:`, error.message);
      
      await grantStorage.updateEnrichmentStatus(grant.id, 'failed', error.message);
      
      return {
        grantId: grant.id,
        title: grant.title,
        status: 'failed',
        error: error.message
      };
    }
  }
  
  private buildSearchQuery(grant: Grant): string {
    // Construire une requête de recherche intelligente
    const org = grant.organization;
    const titleShort = grant.title.substring(0, 80);
    
    // Chercher les infos manquantes spécifiques
    const missingInfo: string[] = [];
    
    if (!grant.amount && !grant.amountMin && !grant.amountMax) {
      missingInfo.push("montant");
    }
    if (!grant.deadline) {
      missingInfo.push("deadline");
    }
    if (!grant.contactEmail) {
      missingInfo.push("contact");
    }
    
    const infoQuery = missingInfo.length > 0 
      ? missingInfo.join(" ") 
      : "informations pratiques";
    
    return `${titleShort} ${org} ${infoQuery} 2024 2025`;
  }
  
  private async extractEnrichedData(grant: Grant, searchQuery: string): Promise<any> {
    // Pour l'instant, retour vide
    // Cette fonction sera améliorée pour parser les résultats web
    return null;
  }
  
  async enrichBatch(grants: Grant[], batchSize: number = 5): Promise<EnrichmentResult[]> {
    const results: EnrichmentResult[] = [];
    
    // Traiter par lots de {batchSize}
    for (let i = 0; i < grants.length; i += batchSize) {
      const batch = grants.slice(i, i + batchSize);
      console.log(`\n📦 Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(grants.length / batchSize)}`);
      
      const batchResults = await Promise.all(
        batch.map(grant => this.enrichGrant(grant))
      );
      
      results.push(...batchResults);
      
      // Pause entre les batches pour éviter rate limiting
      if (i + batchSize < grants.length) {
        console.log("⏳ Pause 3s avant prochain batch...");
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    return results;
  }
  
  async enrichAll(): Promise<void> {
    if (this.isRunning) {
      throw new Error("Un enrichissement est déjà en cours");
    }
    
    this.isRunning = true;
    
    try {
      // Récupérer toutes les subventions à enrichir (status pending ou failed)
      const grants = await grantStorage.getGrantsToEnrich();
      console.log(`📊 ${grants.length} subventions à enrichir`);
      
      if (grants.length === 0) {
        console.log("✅ Toutes les subventions sont déjà enrichies");
        return;
      }
      
      // Enrichir par batches de 5
      const results = await this.enrichBatch(grants, 5);
      
      // Statistiques
      const success = results.filter(r => r.status === 'success').length;
      const failed = results.filter(r => r.status === 'failed').length;
      const noChanges = results.filter(r => r.status === 'no_changes').length;
      
      console.log(`\n📈 Résultats:`);
      console.log(`   ✅ Succès: ${success}`);
      console.log(`   ❌ Échecs: ${failed}`);
      console.log(`   ⚪ Sans changement: ${noChanges}`);
      
    } finally {
      this.isRunning = false;
    }
  }
  
  getStatus() {
    return {
      isRunning: this.isRunning,
      currentBatch: this.currentBatch
    };
  }
}

export const enrichmentService = new EnrichmentService();
