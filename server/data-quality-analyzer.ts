/**
 * Script d'analyse de qualité des données de subventions
 * Scanne toutes les subventions et génère un rapport détaillé
 */

import { db } from './db';
import { grants } from '../shared/schema';
import { sql } from 'drizzle-orm';

// Critères de qualité
const QUALITY_CRITERIA = {
  title: {
    minLength: 10,
    maxLength: 100,
    name: 'Titre'
  },
  description: {
    minLength: 200,
    maxLength: 2000,
    name: 'Description'
  },
  eligibility: {
    minLength: 100,
    maxLength: 2000,
    name: 'Éligibilité'
  },
  organization: {
    minLength: 3,
    maxLength: 100,
    name: 'Organisme'
  }
};

interface QualityIssue {
  grantId: string;
  grantTitle: string;
  field: string;
  issue: string;
  severity: 'critical' | 'warning' | 'info';
  currentValue?: string | number;
  expectedValue?: string;
}

interface QualityReport {
  totalGrants: number;
  grantsAnalyzed: number;
  issuesFound: QualityIssue[];
  summary: {
    critical: number;
    warnings: number;
    info: number;
  };
  fieldStats: {
    [key: string]: {
      total: number;
      filled: number;
      empty: number;
      tooShort: number;
      tooLong: number;
      avgLength: number;
    };
  };
}

// Nettoyer le HTML pour compter les vrais caractères
function stripHTML(html: string | null): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
}

async function analyzeDataQuality(): Promise<QualityReport> {
  console.log('🔍 Analyse de qualité des données en cours...');
  
  // Filtrer uniquement les subventions actives (pas les archivées)
  const allGrants = await db.select().from(grants).where(sql`status = 'active'`);
  
  const issues: QualityIssue[] = [];
  const fieldStats: QualityReport['fieldStats'] = {};
  
  // Initialiser les stats pour chaque champ
  const fieldsToAnalyze = [
    'title', 'description', 'eligibility', 'requirements', 'organization',
    'amount', 'amountMin', 'amountMax', 'deadline', 'url', 'contactEmail',
    'preparationAdvice', 'experienceFeedback', 'helpResources'
  ];
  
  fieldsToAnalyze.forEach(field => {
    fieldStats[field] = {
      total: allGrants.length,
      filled: 0,
      empty: 0,
      tooShort: 0,
      tooLong: 0,
      avgLength: 0
    };
  });
  
  // Analyser chaque subvention
  for (const grant of allGrants) {
    // Analyse du titre
    const titleText = stripHTML(grant.title);
    const titleLength = titleText.length;
    
    if (titleLength < QUALITY_CRITERIA.title.minLength) {
      issues.push({
        grantId: grant.id,
        grantTitle: grant.title,
        field: 'title',
        issue: `Titre trop court (${titleLength} chars, min: ${QUALITY_CRITERIA.title.minLength})`,
        severity: 'warning',
        currentValue: titleLength
      });
      fieldStats.title.tooShort++;
    } else if (titleLength > QUALITY_CRITERIA.title.maxLength) {
      issues.push({
        grantId: grant.id,
        grantTitle: grant.title,
        field: 'title',
        issue: `Titre trop long (${titleLength} chars, max: ${QUALITY_CRITERIA.title.maxLength})`,
        severity: 'warning',
        currentValue: titleLength
      });
      fieldStats.title.tooLong++;
    }
    
    if (titleLength > 0) fieldStats.title.filled++;
    else fieldStats.title.empty++;
    
    // Analyse de la description
    const descText = stripHTML(grant.description);
    const descLength = descText.length;
    
    if (!grant.description || descLength === 0 || descText.toLowerCase().includes('non spécifié')) {
      issues.push({
        grantId: grant.id,
        grantTitle: grant.title,
        field: 'description',
        issue: 'Description manquante',
        severity: 'critical'
      });
      fieldStats.description.empty++;
    } else {
      fieldStats.description.filled++;
      
      if (descLength < QUALITY_CRITERIA.description.minLength) {
        issues.push({
          grantId: grant.id,
          grantTitle: grant.title,
          field: 'description',
          issue: `Description trop courte (${descLength} chars, min: ${QUALITY_CRITERIA.description.minLength})`,
          severity: 'warning',
          currentValue: descLength
        });
        fieldStats.description.tooShort++;
      } else if (descLength > QUALITY_CRITERIA.description.maxLength) {
        issues.push({
          grantId: grant.id,
          grantTitle: grant.title,
          field: 'description',
          issue: `Description trop longue (${descLength} chars, max: ${QUALITY_CRITERIA.description.maxLength})`,
          severity: 'info',
          currentValue: descLength
        });
        fieldStats.description.tooLong++;
      }
    }
    
    // Analyse de l'éligibilité
    const eligText = stripHTML(grant.eligibility);
    const eligLength = eligText.length;
    
    if (!grant.eligibility || eligLength === 0 || eligText.toLowerCase().includes('non spécifié')) {
      issues.push({
        grantId: grant.id,
        grantTitle: grant.title,
        field: 'eligibility',
        issue: 'Éligibilité manquante',
        severity: 'critical'
      });
      fieldStats.eligibility.empty++;
    } else {
      fieldStats.eligibility.filled++;
      
      if (eligLength < QUALITY_CRITERIA.eligibility.minLength) {
        issues.push({
          grantId: grant.id,
          grantTitle: grant.title,
          field: 'eligibility',
          issue: `Éligibilité trop courte (${eligLength} chars, min: ${QUALITY_CRITERIA.eligibility.minLength})`,
          severity: 'warning',
          currentValue: eligLength
        });
        fieldStats.eligibility.tooShort++;
      } else if (eligLength > QUALITY_CRITERIA.eligibility.maxLength) {
        issues.push({
          grantId: grant.id,
          grantTitle: grant.title,
          field: 'eligibility',
          issue: `Éligibilité trop longue (${eligLength} chars, max: ${QUALITY_CRITERIA.eligibility.maxLength})`,
          severity: 'info',
          currentValue: eligLength
        });
        fieldStats.eligibility.tooLong++;
      }
    }
    
    // Analyse de l'organisme
    if (!grant.organization || grant.organization.trim() === '' || grant.organization.toLowerCase() === 'inconnu' || grant.organization.toLowerCase() === 'non spécifié') {
      issues.push({
        grantId: grant.id,
        grantTitle: grant.title,
        field: 'organization',
        issue: 'Organisme manquant',
        severity: 'critical'
      });
      fieldStats.organization.empty++;
    } else if (grant.organization.length < QUALITY_CRITERIA.organization.minLength) {
      issues.push({
        grantId: grant.id,
        grantTitle: grant.title,
        field: 'organization',
        issue: `Nom d'organisme trop court (${grant.organization.length} chars)`,
        severity: 'warning'
      });
      fieldStats.organization.tooShort++;
    } else {
      fieldStats.organization.filled++;
    }

    // Analyse des documents requis
    if (!grant.requirements && (!grant.obligatoryDocuments || grant.obligatoryDocuments.length === 0)) {
      issues.push({
        grantId: grant.id,
        grantTitle: grant.title,
        field: 'requirements',
        issue: 'Aucun document requis spécifié',
        severity: 'warning'
      });
      fieldStats.requirements.empty++;
    } else {
      fieldStats.requirements.filled++;
    }
    
    // Analyse du montant
    if (!grant.amount && !grant.amountMin && !grant.amountMax) {
      issues.push({
        grantId: grant.id,
        grantTitle: grant.title,
        field: 'amount',
        issue: 'Montant non spécifié',
        severity: 'warning'
      });
      fieldStats.amount.empty++;
    } else {
      fieldStats.amount.filled++;
    }
    
    // Analyse de la deadline
    if (!grant.deadline && !grant.frequency) {
      issues.push({
        grantId: grant.id,
        grantTitle: grant.title,
        field: 'deadline',
        issue: 'Pas de deadline ni de fréquence',
        severity: 'info'
      });
      fieldStats.deadline.empty++;
    } else {
      fieldStats.deadline.filled++;
    }
    
    // Analyse de l'URL
    if (!grant.url || grant.url === '#') {
      issues.push({
        grantId: grant.id,
        grantTitle: grant.title,
        field: 'url',
        issue: 'URL manquante ou invalide',
        severity: 'warning'
      });
      fieldStats.url.empty++;
    } else {
      fieldStats.url.filled++;
    }
    
    // Analyse du contact
    if (!grant.contactEmail && !grant.contactPhone) {
      issues.push({
        grantId: grant.id,
        grantTitle: grant.title,
        field: 'contactEmail',
        issue: 'Aucun contact (email ou téléphone)',
        severity: 'info'
      });
      fieldStats.contactEmail.empty++;
    } else {
      fieldStats.contactEmail.filled++;
    }
    
    // Analyse des conseils de préparation
    if (!grant.preparationAdvice) {
      fieldStats.preparationAdvice.empty++;
    } else {
      fieldStats.preparationAdvice.filled++;
    }
    
    // Analyse du retour d'expérience
    if (!grant.experienceFeedback) {
      fieldStats.experienceFeedback.empty++;
    } else {
      fieldStats.experienceFeedback.filled++;
    }
    
    // Analyse des ressources d'aide
    const helpResources = grant.helpResources as any[];
    if (!helpResources || helpResources.length === 0) {
      fieldStats.helpResources.empty++;
    } else {
      fieldStats.helpResources.filled++;
    }
  }
  
  // Calculer les statistiques de summary
  const summary = {
    critical: issues.filter(i => i.severity === 'critical').length,
    warnings: issues.filter(i => i.severity === 'warning').length,
    info: issues.filter(i => i.severity === 'info').length
  };
  
  const report: QualityReport = {
    totalGrants: allGrants.length,
    grantsAnalyzed: allGrants.length,
    issuesFound: issues,
    summary,
    fieldStats
  };
  
  console.log('\n📊 RAPPORT DE QUALITÉ');
  console.log('===================');
  console.log(`Total de subventions: ${report.totalGrants}`);
  console.log(`Issues critiques: ${summary.critical}`);
  console.log(`Avertissements: ${summary.warnings}`);
  console.log(`Informations: ${summary.info}`);
  console.log('\n📈 STATISTIQUES PAR CHAMP:');
  
  Object.entries(fieldStats).forEach(([field, stats]) => {
    const fillRate = ((stats.filled / stats.total) * 100).toFixed(1);
    console.log(`\n${field}:`);
    console.log(`  Rempli: ${stats.filled}/${stats.total} (${fillRate}%)`);
    if (stats.tooShort > 0) console.log(`  Trop court: ${stats.tooShort}`);
    if (stats.tooLong > 0) console.log(`  Trop long: ${stats.tooLong}`);
  });
  
  return report;
}

// Export pour utilisation dans les routes
export { analyzeDataQuality };
