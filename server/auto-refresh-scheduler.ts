/**
 * Système de rafraîchissement automatique des subventions
 * Exécute les scrapers périodiquement pour garder les données à jour
 */

import { db } from './db';
import { organismsTracking, grants } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';
import { scrapeOrganism, scrapeAllPendingOrganisms } from './scraping-system';
import { archiveExpiredGrants, checkDeadlines } from './deadline-checker';

interface RefreshStatus {
  lastRefresh: Date | null;
  nextScheduledRefresh: Date | null;
  isRunning: boolean;
  lastResult: {
    organismsScraped: number;
    newGrantsFound: number;
    expiredArchived: number;
    recurringBumped: number;
    errors: string[];
  } | null;
}

class AutoRefreshScheduler {
  private static instance: AutoRefreshScheduler;
  private isRunning = false;
  private lastRefresh: Date | null = null;
  private lastResult: RefreshStatus['lastResult'] = null;
  private intervalId: NodeJS.Timeout | null = null;
  
  // Intervalle de rafraîchissement en millisecondes (30 jours par défaut)
  private refreshIntervalMs = 30 * 24 * 60 * 60 * 1000;
  
  private constructor() {}
  
  static getInstance(): AutoRefreshScheduler {
    if (!AutoRefreshScheduler.instance) {
      AutoRefreshScheduler.instance = new AutoRefreshScheduler();
    }
    return AutoRefreshScheduler.instance;
  }
  
  getStatus(): RefreshStatus {
    return {
      lastRefresh: this.lastRefresh,
      nextScheduledRefresh: this.lastRefresh 
        ? new Date(this.lastRefresh.getTime() + this.refreshIntervalMs)
        : null,
      isRunning: this.isRunning,
      lastResult: this.lastResult
    };
  }
  
  /**
   * Lancer un rafraîchissement complet manuellement
   */
  async runManualRefresh(): Promise<RefreshStatus['lastResult']> {
    if (this.isRunning) {
      throw new Error('Un rafraîchissement est déjà en cours');
    }
    
    this.isRunning = true;
    const startTime = new Date();
    console.log('🔄 Démarrage du rafraîchissement automatique...');
    
    const result: RefreshStatus['lastResult'] = {
      organismsScraped: 0,
      newGrantsFound: 0,
      expiredArchived: 0,
      recurringBumped: 0,
      errors: []
    };
    
    try {
      // Étape 1: Vérifier et archiver les subventions expirées
      console.log('\n📅 Étape 1: Vérification des deadlines...');
      try {
        const deadlineCheck = await checkDeadlines();
        console.log(`   - ${deadlineCheck.expired.length} subventions expirées détectées`);
        
        if (deadlineCheck.expired.length > 0) {
          const archiveResult = await archiveExpiredGrants();
          result.expiredArchived = archiveResult.archived;
          result.recurringBumped = archiveResult.bumped;
          console.log(`   ✅ ${archiveResult.archived} ponctuelles archivées, ${archiveResult.bumped} récurrentes bumpées`);
        }
      } catch (error: any) {
        console.error('   ❌ Erreur vérification deadlines:', error.message);
        result.errors.push(`Deadlines: ${error.message}`);
      }
      
      // Étape 2: Scraper les organismes prioritaires
      console.log('\n🕷️ Étape 2: Scraping des organismes...');
      try {
        const scraperResults = await scrapeAllPendingOrganisms();
        // scraperResults is an array of results per organism
        result.organismsScraped = scraperResults.length;
        result.newGrantsFound = scraperResults.reduce((sum, r) => sum + r.grantsAdded, 0);
        console.log(`   ✅ ${result.organismsScraped} organismes scrapés`);
        console.log(`   ✅ ${result.newGrantsFound} nouvelles subventions trouvées`);
      } catch (error: any) {
        console.error('   ❌ Erreur scraping:', error.message);
        result.errors.push(`Scraping: ${error.message}`);
      }
      
      // Mettre à jour le statut
      this.lastRefresh = startTime;
      this.lastResult = result;
      
      const duration = (new Date().getTime() - startTime.getTime()) / 1000;
      console.log(`\n✅ Rafraîchissement terminé en ${duration.toFixed(1)}s`);
      console.log(`   - Organismes scrapés: ${result.organismsScraped}`);
      console.log(`   - Nouvelles subventions: ${result.newGrantsFound}`);
      console.log(`   - Ponctuelles archivées: ${result.expiredArchived}`);
      console.log(`   - Récurrentes bumpées: ${result.recurringBumped}`);
      if (result.errors.length > 0) {
        console.log(`   - Erreurs: ${result.errors.length}`);
      }
      
      return result;
      
    } finally {
      this.isRunning = false;
    }
  }
  
  /**
   * Démarrer le scheduler automatique
   * Par défaut: toutes les semaines (7 jours) car les appels à projets changent souvent
   */
  startAutoRefresh(intervalDays: number = 7) {
    if (this.intervalId) {
      console.log('⚠️ Scheduler déjà actif');
      return;
    }
    
    this.refreshIntervalMs = intervalDays * 24 * 60 * 60 * 1000;
    
    console.log(`⏰ Scheduler démarré: rafraîchissement tous les ${intervalDays} jours`);
    console.log(`   📅 Prochain scan prévu: ${new Date(Date.now() + this.refreshIntervalMs).toLocaleDateString('fr-FR')}`);
    
    // Ne pas exécuter immédiatement au démarrage du serveur pour éviter de ralentir le boot
    // Le scan sera lancé manuellement ou après l'intervalle
    
    // Programmer les exécutions futures
    this.intervalId = setInterval(() => {
      console.log('🔄 Scan automatique hebdomadaire lancé...');
      this.runManualRefresh().catch(err => {
        console.error('Erreur rafraîchissement programmé:', err);
      });
    }, this.refreshIntervalMs);
  }
  
  /**
   * Arrêter le scheduler
   */
  stopAutoRefresh() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('⏹️ Scheduler arrêté');
    }
  }
}

export const autoRefreshScheduler = AutoRefreshScheduler.getInstance();
