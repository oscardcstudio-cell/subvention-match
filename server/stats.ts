import { db } from "./db";
import { grants } from "@shared/schema";
import { sql } from "drizzle-orm";

// Statistiques détaillées sur le taux de remplissage des colonnes
export async function getGrantsStatistics() {
  const allGrants = await db.select().from(grants).where(sql`status = 'active'`);
  const total = allGrants.length;

  if (total === 0) {
    return { total: 0, columns: [] };
  }

  // Liste des colonnes à analyser (exclure id et timestamps)
  const columnsToAnalyze = [
    { name: "title", label: "Titre", type: "text" },
    { name: "organization", label: "Organisation", type: "text" },
    { name: "amount", label: "Montant", type: "number" },
    { name: "amountMin", label: "Montant Min", type: "number" },
    { name: "amountMax", label: "Montant Max", type: "number" },
    { name: "deadline", label: "Deadline", type: "text" },
    { name: "nextSession", label: "Prochaine Session", type: "text" },
    { name: "frequency", label: "Fréquence", type: "text" },
    { name: "description", label: "Description", type: "text" },
    { name: "eligibility", label: "Éligibilité", type: "text" },
    { name: "requirements", label: "Exigences", type: "text" },
    { name: "obligatoryDocuments", label: "Documents Obligatoires", type: "array" },
    { name: "url", label: "URL", type: "text" },
    { name: "improvedUrl", label: "URL Améliorée", type: "text" },
    { name: "helpResources", label: "Ressources d'Aide", type: "json" },
    { name: "contactEmail", label: "Email Contact", type: "text" },
    { name: "contactPhone", label: "Téléphone Contact", type: "text" },
    { name: "grantType", label: "Type de Subvention", type: "array" },
    { name: "eligibleSectors", label: "Secteurs Éligibles", type: "array" },
    { name: "geographicZone", label: "Zone Géographique", type: "array" },
    { name: "structureSize", label: "Taille Structure", type: "array" },
    { name: "maxFundingRate", label: "Taux de Financement Max", type: "number" },
    { name: "coFundingRequired", label: "Cofinancement Requis", type: "text" },
    { name: "cumulativeAllowed", label: "Cumul Autorisé", type: "text" },
    { name: "processingTime", label: "Durée d'Instruction", type: "text" },
    { name: "responseDelay", label: "Délai de Réponse", type: "text" },
    { name: "applicationDifficulty", label: "Difficulté du Dossier", type: "text" },
    { name: "acceptanceRate", label: "Taux d'Acceptation", type: "text" },
    { name: "annualBeneficiaries", label: "Bénéficiaires Annuels", type: "text" },
    { name: "successProbability", label: "Probabilité de Succès", type: "text" },
    { name: "preparationAdvice", label: "Conseils de Préparation", type: "text" },
    { name: "experienceFeedback", label: "Retours d'Expérience", type: "text" },
    { name: "priority", label: "Priorité", type: "text" },
    { name: "status", label: "Statut", type: "text" },
  ];

  const stats = columnsToAnalyze.map((col) => {
    const filled = allGrants.filter((grant: any) => {
      const value = grant[col.name];
      
      if (value === null || value === undefined) return false;
      
      if (col.type === "array") {
        return Array.isArray(value) && value.length > 0;
      }
      
      if (col.type === "json") {
        return value !== null && typeof value === "object" && Object.keys(value).length > 0;
      }
      
      if (col.type === "text") {
        return typeof value === "string" && value.trim().length > 0;
      }
      
      if (col.type === "number") {
        return typeof value === "number" || (typeof value === "string" && !isNaN(parseFloat(value)));
      }
      
      return false;
    }).length;

    return {
      name: col.name,
      label: col.label,
      type: col.type,
      filled,
      empty: total - filled,
      percentage: Math.round((filled / total) * 100),
    };
  });

  // Trier par pourcentage décroissant
  stats.sort((a, b) => b.percentage - a.percentage);

  return {
    total,
    columns: stats,
  };
}

// Récupérer les statistiques globales
export async function getOverallStats() {
  const result = await db
    .select({
      total: sql<number>`count(*)::int`,
      withAmount: sql<number>`count(CASE WHEN amount IS NOT NULL THEN 1 END)::int`,
      withDeadline: sql<number>`count(CASE WHEN deadline IS NOT NULL AND deadline != '' THEN 1 END)::int`,
      permanent: sql<number>`count(CASE WHEN frequency = 'Permanent' THEN 1 END)::int`,
      avgAmount: sql<number>`avg(CASE WHEN amount IS NOT NULL AND amount > 0 THEN amount END)::int`,
      withContactEmail: sql<number>`count(CASE WHEN contact_email IS NOT NULL AND contact_email != '' THEN 1 END)::int`,
      withProcessingTime: sql<number>`count(CASE WHEN processing_time IS NOT NULL AND processing_time != '' THEN 1 END)::int`,
      withPreparationAdvice: sql<number>`count(CASE WHEN preparation_advice IS NOT NULL AND preparation_advice != '' THEN 1 END)::int`,
    })
    .from(grants)
    .where(sql`status = 'active'`);

  return result[0];
}
