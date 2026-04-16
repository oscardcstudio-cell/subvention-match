import { grants, type Grant, type InsertGrant } from "@shared/schema";
import { db } from "./db";
import { eq, sql, and, isNotNull } from "drizzle-orm";

export class GrantStorage {
  // Créer une subvention
  async createGrant(insertGrant: InsertGrant): Promise<Grant> {
    const [grant] = await db
      .insert(grants)
      .values(insertGrant)
      .returning();
    return grant;
  }

  // Récupérer toutes les subventions actives
  async getAllActiveGrants(): Promise<Grant[]> {
    const allGrants = await db
      .select()
      .from(grants)
      .where(eq(grants.status, "active"))
      .orderBy(grants.createdAt);
    return allGrants;
  }

  // Récupérer une subvention par ID
  async getGrantById(id: string): Promise<Grant | undefined> {
    const [grant] = await db
      .select()
      .from(grants)
      .where(eq(grants.id, id));
    return grant || undefined;
  }

  // Mettre à jour une subvention
  async updateGrant(id: string, updates: Partial<InsertGrant>): Promise<Grant | undefined> {
    const [grant] = await db
      .update(grants)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(grants.id, id))
      .returning();
    return grant || undefined;
  }

  // Supprimer une subvention (soft delete)
  async deleteGrant(id: string): Promise<void> {
    await db
      .update(grants)
      .set({ status: "archived", updatedAt: new Date() })
      .where(eq(grants.id, id));
  }

  // Recherche de subventions par filtres
  async searchGrants(filters: {
    eligibleSectors?: string[];
    geographicZone?: string[];
    grantType?: string[];
  }): Promise<Grant[]> {
    let query = db.select().from(grants).where(eq(grants.status, "active"));
    
    // Note: Pour des filtres plus complexes, il faudrait construire la requête dynamiquement
    // Pour l'instant, on retourne toutes les subventions actives
    const results = await query;
    return results;
  }

  // Compter le nombre total de subventions actives
  async countActiveGrants(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(grants)
      .where(eq(grants.status, "active"));
    return result[0]?.count || 0;
  }

  // Récupérer les subventions enrichies (avec ressources d'aide)
  async getEnrichedGrants(): Promise<Grant[]> {
    const enrichedGrants = await db
      .select()
      .from(grants)
      .where(
        and(
          eq(grants.status, "active"),
          isNotNull(grants.helpResources)
        )
      )
      .orderBy(grants.createdAt);
    return enrichedGrants;
  }

  // === Méthodes d'enrichissement ===
  
  // Récupérer les subventions à enrichir
  async getGrantsToEnrich(): Promise<Grant[]> {
    const grantsToEnrich = await db
      .select()
      .from(grants)
      .where(
        and(
          eq(grants.status, "active"),
          sql`(${grants.enrichmentStatus} = 'pending' OR ${grants.enrichmentStatus} = 'failed')`
        )
      )
      .orderBy(grants.createdAt);
    return grantsToEnrich;
  }

  // Mettre à jour le statut d'enrichissement
  async updateEnrichmentStatus(
    id: string, 
    status: 'pending' | 'in_progress' | 'completed' | 'failed',
    error?: string
  ): Promise<void> {
    await db
      .update(grants)
      .set({
        enrichmentStatus: status,
        enrichmentDate: status === 'completed' || status === 'failed' ? new Date() : undefined,
        enrichmentError: error || null,
        updatedAt: new Date(),
      })
      .where(eq(grants.id, id));
  }

  // Mettre à jour les données enrichies d'une subvention
  async updateGrantData(id: string, data: Partial<InsertGrant>): Promise<Grant | undefined> {
    return this.updateGrant(id, data);
  }

  // Récupérer les statistiques d'enrichissement
  async getEnrichmentStats(): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    failed: number;
  }> {
    const [stats] = await db
      .select({
        total: sql<number>`count(*)`,
        pending: sql<number>`count(*) filter (where ${grants.enrichmentStatus} = 'pending')`,
        inProgress: sql<number>`count(*) filter (where ${grants.enrichmentStatus} = 'in_progress')`,
        completed: sql<number>`count(*) filter (where ${grants.enrichmentStatus} = 'completed')`,
        failed: sql<number>`count(*) filter (where ${grants.enrichmentStatus} = 'failed')`,
      })
      .from(grants)
      .where(eq(grants.status, "active"));
    
    return {
      total: stats?.total || 0,
      pending: stats?.pending || 0,
      inProgress: stats?.inProgress || 0,
      completed: stats?.completed || 0,
      failed: stats?.failed || 0,
    };
  }
}

export const grantStorage = new GrantStorage();
