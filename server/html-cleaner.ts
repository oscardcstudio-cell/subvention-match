/**
 * Service de nettoyage HTML pour les descriptions de subventions
 * Convertit le HTML brut en texte propre et lisible
 */

import { db } from './db';
import { grants } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

interface CleaningResult {
  grantId: string;
  title: string;
  fieldsClean: string[];
  originalLength: number;
  cleanedLength: number;
}

interface BatchCleaningReport {
  totalProcessed: number;
  totalCleaned: number;
  totalSkipped: number;
  results: CleaningResult[];
  errors: string[];
}

/**
 * Nettoie le HTML et convertit en texte propre
 */
function cleanHtml(html: string | null): string {
  if (!html) return '';
  
  let text = html;
  
  // Remplacer les balises de structure par des espaces/retours
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/p>/gi, '\n\n');
  text = text.replace(/<\/li>/gi, '\n');
  text = text.replace(/<\/div>/gi, '\n');
  text = text.replace(/<\/h[1-6]>/gi, '\n\n');
  
  // Convertir les listes en puces
  text = text.replace(/<li[^>]*>/gi, '• ');
  
  // Supprimer toutes les autres balises HTML
  text = text.replace(/<[^>]*>/g, '');
  
  // Décoder les entités HTML courantes
  text = text.replace(/&nbsp;/gi, ' ');
  text = text.replace(/&amp;/gi, '&');
  text = text.replace(/&lt;/gi, '<');
  text = text.replace(/&gt;/gi, '>');
  text = text.replace(/&quot;/gi, '"');
  text = text.replace(/&#39;/gi, "'");
  text = text.replace(/&euro;/gi, '€');
  text = text.replace(/&rsquo;/gi, "'");
  text = text.replace(/&lsquo;/gi, "'");
  text = text.replace(/&rdquo;/gi, '"');
  text = text.replace(/&ldquo;/gi, '"');
  text = text.replace(/&ndash;/gi, '–');
  text = text.replace(/&mdash;/gi, '—');
  text = text.replace(/&hellip;/gi, '...');
  text = text.replace(/&#\d+;/g, ''); // Supprimer les entités numériques restantes
  
  // Nettoyer les espaces multiples et lignes vides
  text = text.replace(/[ \t]+/g, ' ');
  text = text.replace(/\n\s*\n\s*\n/g, '\n\n');
  text = text.replace(/^\s+|\s+$/gm, '');
  
  return text.trim();
}

/**
 * Vérifie si un texte contient du HTML
 */
function containsHtml(text: string | null): boolean {
  if (!text) return false;
  return /<[^>]+>/.test(text);
}

/**
 * Nettoie une subvention spécifique
 */
export async function cleanGrantHtml(grantId: string): Promise<CleaningResult | null> {
  const [grant] = await db.select().from(grants).where(eq(grants.id, grantId));
  
  if (!grant) return null;
  
  const fieldsToClean = ['description', 'eligibility', 'requirements'] as const;
  const updates: Partial<typeof grant> = {};
  const cleanedFields: string[] = [];
  let originalLength = 0;
  let cleanedLength = 0;
  
  for (const field of fieldsToClean) {
    const value = grant[field];
    if (value && containsHtml(value)) {
      const original = value;
      const cleaned = cleanHtml(value);
      
      if (cleaned !== original) {
        (updates as any)[field] = cleaned;
        cleanedFields.push(field);
        originalLength += original.length;
        cleanedLength += cleaned.length;
      }
    }
  }
  
  if (Object.keys(updates).length > 0) {
    await db.update(grants)
      .set(updates)
      .where(eq(grants.id, grantId));
    
    return {
      grantId,
      title: grant.title,
      fieldsClean: cleanedFields,
      originalLength,
      cleanedLength
    };
  }
  
  return null;
}

/**
 * Nettoie le HTML de toutes les subventions actives en batch
 */
export async function cleanAllGrantsHtml(): Promise<BatchCleaningReport> {
  console.log('🧹 Nettoyage HTML des subventions en cours...');
  
  const allGrants = await db.select().from(grants).where(sql`status = 'active'`);
  
  const report: BatchCleaningReport = {
    totalProcessed: allGrants.length,
    totalCleaned: 0,
    totalSkipped: 0,
    results: [],
    errors: []
  };
  
  for (const grant of allGrants) {
    try {
      const result = await cleanGrantHtml(grant.id);
      
      if (result) {
        report.results.push(result);
        report.totalCleaned++;
        console.log(`✅ Nettoyé: ${grant.title.substring(0, 50)}... (${result.originalLength} → ${result.cleanedLength} chars)`);
      } else {
        report.totalSkipped++;
      }
    } catch (error) {
      const errorMsg = `Erreur pour ${grant.id}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`;
      report.errors.push(errorMsg);
      console.error(`❌ ${errorMsg}`);
    }
  }
  
  console.log(`\n📊 Rapport de nettoyage HTML:`);
  console.log(`   - Total traité: ${report.totalProcessed}`);
  console.log(`   - Nettoyé: ${report.totalCleaned}`);
  console.log(`   - Ignoré (pas de HTML): ${report.totalSkipped}`);
  console.log(`   - Erreurs: ${report.errors.length}`);
  
  return report;
}

/**
 * Analyse combien de subventions contiennent du HTML
 */
export async function analyzeHtmlPresence(): Promise<{
  total: number;
  withHtml: { field: string; count: number }[];
  examples: { id: string; title: string; field: string; sample: string }[];
}> {
  const allGrants = await db.select().from(grants).where(sql`status = 'active'`);
  
  const fieldsToCheck = ['description', 'eligibility', 'requirements'] as const;
  const htmlCounts: Record<string, number> = {};
  const examples: { id: string; title: string; field: string; sample: string }[] = [];
  
  fieldsToCheck.forEach(f => htmlCounts[f] = 0);
  
  for (const grant of allGrants) {
    for (const field of fieldsToCheck) {
      const value = (grant as any)[field];
      if (value && containsHtml(value)) {
        htmlCounts[field]++;
        
        // Garder un exemple par champ (max 3 par champ)
        const fieldExamples = examples.filter(e => e.field === field);
        if (fieldExamples.length < 3) {
          examples.push({
            id: grant.id,
            title: grant.title,
            field,
            sample: value.substring(0, 200)
          });
        }
      }
    }
  }
  
  return {
    total: allGrants.length,
    withHtml: Object.entries(htmlCounts).map(([field, count]) => ({ field, count })),
    examples
  };
}
