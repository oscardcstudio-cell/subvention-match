import { db } from './db';
import { grants } from '@shared/schema';
import { eq } from 'drizzle-orm';

interface QualityIssue {
  grantId: string;
  grantTitle: string;
  field: string;
  issue: string;
  severity: 'critical' | 'warning' | 'info';
  currentValue?: string | number;
  expectedValue?: string;
}

interface EnrichmentRequest {
  grantId: string;
  issues: QualityIssue[];
}

interface EnrichmentResult {
  success: boolean;
  grantId: string;
  changes: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
  error?: string;
}

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  console.warn('⚠️ OPENROUTER_API_KEY manquante - enrichissement IA désactivé');
}

async function callDeepSeek(prompt: string): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY manquante');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://subventionmatch.com',
      'X-Title': 'SubventionMatch',
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert en subventions culturelles françaises. Ton rôle est d\'améliorer la qualité et la clarté des informations de subventions pour les rendre plus accessibles aux artistes et associations culturelles.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur OpenRouter: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

function stripHtml(html: string | null): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
}

export async function enrichGrant(grantId: string, issues: QualityIssue[]): Promise<EnrichmentResult> {
  try {
    console.log(`🤖 Enrichissement de la subvention #${grantId}...`);
    
    // Récupérer la subvention
    const [grant] = await db.select().from(grants).where(eq(grants.id, grantId));
    
    if (!grant) {
      return {
        success: false,
        grantId,
        changes: [],
        error: 'Subvention non trouvée'
      };
    }

    const changes: EnrichmentResult['changes'] = [];
    const updates: any = {};

    // Identifier les problèmes à corriger
    const hasLongTitle = issues.some(i => i.field === 'title' && i.issue.toLowerCase().includes('long'));
    const hasLongDescription = issues.some(i => i.field === 'description' && i.issue.toLowerCase().includes('long'));
    const hasShortDescription = issues.some(i => i.field === 'description' && i.issue.toLowerCase().includes('court'));
    const hasMissingDescription = issues.some(i => i.field === 'description' && (i.issue.toLowerCase().includes('manquant') || i.issue.toLowerCase().includes('manquante')));
    const hasLongEligibility = issues.some(i => i.field === 'eligibility' && i.issue.toLowerCase().includes('long'));
    const hasShortEligibility = issues.some(i => i.field === 'eligibility' && i.issue.toLowerCase().includes('court'));
    const hasMissingEligibility = issues.some(i => i.field === 'eligibility' && (i.issue.toLowerCase().includes('manquant') || i.issue.toLowerCase().includes('manquants') || i.issue.toLowerCase().includes('manquante')));
    const hasMissingOrg = issues.some(i => i.field === 'organization' && i.issue.toLowerCase().includes('manquant'));

    console.log(`🔍 Problèmes détectés pour #${grantId}:`, { 
      hasLongTitle, 
      hasLongDescription,
      hasShortDescription,
      hasMissingDescription,
      hasLongEligibility,
      hasShortEligibility, 
      hasMissingEligibility, 
      hasMissingOrg,
      totalIssues: issues.length,
      issues: issues.map(i => `${i.field}: ${i.issue}`)
    });

    // 0. ENRICHIR L'ORGANISATION SI MANQUANTE
    if (hasMissingOrg && (!grant.organization || grant.organization === 'Inconnu' || grant.organization === '')) {
      console.log(`🏢 Recherche de l'organisation pour #${grantId}...`);
      const prompt = `Trouve le nom de l'organisme (fondation, ministère, collectivité, etc.) qui propose cette subvention culturelle française :
TITRE : "${grant.title}"
DESCRIPTION : "${stripHtml(grant.description).substring(0, 1000)}"

Réponds UNIQUEMENT avec le nom de l'organisme, pas de phrases.`;
      const org = await callDeepSeek(prompt);
      const cleanOrg = org.trim().replace(/^["']|["']$/g, '');
      if (cleanOrg && cleanOrg.length < 100 && !cleanOrg.toLowerCase().includes('inconnu')) {
        updates.organization = cleanOrg;
        changes.push({ field: 'organization', oldValue: grant.organization || '(manquant)', newValue: cleanOrg });
      }
    }

    // 1. ENRICHIR LE TITRE SI TROP LONG
    if (hasLongTitle && grant.title) {
      console.log(`📝 Raccourcissement du titre pour #${grantId}...`);
      const titleText = stripHtml(grant.title);
      const prompt = `Réécris ce titre de subvention culturelle pour qu'il soit percutant et fasse moins de 80 caractères.
TITRE ORIGINAL : "${titleText}"
CONSEIL : Garde les mots-clés essentiels (ex: résidence, création, aide, etc.).
Réponds UNIQUEMENT avec le nouveau titre.`;
      const newTitle = await callDeepSeek(prompt);
      const cleanTitle = newTitle.trim().replace(/^["']|["']$/g, '');
      if (cleanTitle && cleanTitle.length < titleText.length) {
        updates.title = cleanTitle;
        changes.push({ field: 'title', oldValue: titleText, newValue: cleanTitle });
      }
    }

    // 2. RÉSUMER LA DESCRIPTION SI TROP LONGUE
    if (hasLongDescription && grant.description) {
      console.log(`📝 Synthèse de la description pour #${grantId}...`);
      const descText = stripHtml(grant.description);
      const prompt = `Synthétise cette description de subvention culturelle en un paragraphe clair de maximum 1500 caractères.
Garde les informations cruciales sur l'objectif de l'aide.
Utilise un ton professionnel et informatif.
DESCRIPTION : "${descText.substring(0, 4000)}"

Réponds UNIQUEMENT avec la description synthétisée.`;
      const newDesc = await callDeepSeek(prompt);
      if (newDesc && newDesc.length > 100) {
        updates.description = `<p>${newDesc.trim()}</p>`;
        changes.push({ field: 'description', oldValue: '(trop longue)', newValue: 'Description synthétisée par IA' });
      }
    }

    // 2b. ENRICHIR LA DESCRIPTION SI TROP COURTE OU MANQUANTE
    if ((hasShortDescription || hasMissingDescription) && grant.title) {
      console.log(`📝 Enrichissement de la description pour #${grantId}...`);
      const titleText = stripHtml(grant.title);
      const currentDesc = grant.description ? stripHtml(grant.description) : '';
      const eligText = grant.eligibility ? stripHtml(grant.eligibility) : '';
      
      const prompt = `Génère une description complète (200-500 caractères) pour cette subvention culturelle française.

TITRE : "${titleText}"
DESCRIPTION ACTUELLE : "${currentDesc}"
ÉLIGIBILITÉ : "${eligText.substring(0, 500)}"
ORGANISME : "${grant.organization || 'Non spécifié'}"

CONSIGNES :
- Explique l'objectif de cette aide culturelle
- Mentionne le type de projets soutenus
- Utilise un ton professionnel et informatif
- Entre 200 et 500 caractères
- Réponds UNIQUEMENT avec la description, pas de préambule.`;

      const newDesc = await callDeepSeek(prompt);
      if (newDesc && newDesc.length >= 100) {
        updates.description = `<p>${newDesc.trim()}</p>`;
        changes.push({ 
          field: 'description', 
          oldValue: hasMissingDescription ? '(manquante)' : '(trop courte)', 
          newValue: 'Description enrichie par IA' 
        });
      }
    }

    // 3. RÉSUMER L'ÉLIGIBILITÉ SI TROP LONGUE
    if (hasLongEligibility && grant.eligibility) {
      console.log(`⚖️ Synthèse de l'éligibilité pour #${grantId}...`);
      const eligText = stripHtml(grant.eligibility);
      const prompt = `Synthétise ces critères d'éligibilité pour une subvention culturelle.
Fais une liste à puces concise (max 1000 caractères).
ÉLIGIBILITÉ ACTUELLE : "${eligText}"

Réponds UNIQUEMENT avec la liste à puces.`;
      const newElig = await callDeepSeek(prompt);
      if (newElig && newElig.length > 50) {
        updates.eligibility = `<ul>${newElig.trim().split('\n').filter(l => l.trim()).map(l => `<li>${l.replace(/^[*-]\s*/, '')}</li>`).join('')}</ul>`;
        changes.push({ field: 'eligibility', oldValue: '(trop longue)', newValue: 'Critères synthétisés par IA' });
      }
    }

    // 4. COMPLÉTER L'ÉLIGIBILITÉ SI MANQUANTE
    if (hasMissingEligibility && !grant.eligibility && grant.description) {
      console.log(`⚖️ Extraction de l'éligibilité pour #${grantId}...`);
      const descText = stripHtml(grant.description);
      const prompt = `À partir de cette description de subvention culturelle française, extrais les critères d'éligibilité précis.
CONSIGNES :
- Identifie les bénéficiaires (statut juridique, type de structure)
- Précise les domaines artistiques concernés
- Liste les conditions de localisation ou de projet
- Format : Liste à puces (<ul>/<li>) de maximum 500 caractères.
- Réponds UNIQUEMENT avec le code HTML de la liste.

DESCRIPTION : "${descText.substring(0, 3000)}"`;

      const eligibility = await callDeepSeek(prompt);
      const cleanEligibility = eligibility.trim().replace(/^["']|["']$/g, '');
      
      if (cleanEligibility && cleanEligibility.length > 20 && !cleanEligibility.toLowerCase().includes('non spécifié')) {
        updates.eligibility = cleanEligibility;
        changes.push({
          field: 'eligibility',
          oldValue: '(manquant)',
          newValue: 'Critères extraits par IA'
        });
      }
    }

    // 4b. ENRICHIR L'ÉLIGIBILITÉ SI TROP COURTE
    if (hasShortEligibility && grant.eligibility && grant.title) {
      console.log(`⚖️ Enrichissement de l'éligibilité pour #${grantId}...`);
      const currentElig = stripHtml(grant.eligibility);
      const titleText = stripHtml(grant.title);
      const descText = grant.description ? stripHtml(grant.description) : '';
      
      const prompt = `Enrichis ces critères d'éligibilité pour cette subvention culturelle française.

TITRE : "${titleText}"
ÉLIGIBILITÉ ACTUELLE : "${currentElig}"
DESCRIPTION : "${descText.substring(0, 1000)}"
ORGANISME : "${grant.organization || 'Non spécifié'}"

CONSIGNES :
- Développe les critères existants avec plus de détails
- Ajoute des critères logiques basés sur le contexte (type de bénéficiaires, conditions)
- Format : Liste à puces claire (100-400 caractères)
- Réponds UNIQUEMENT avec la liste à puces, pas de préambule.`;

      const newElig = await callDeepSeek(prompt);
      if (newElig && newElig.length >= 50) {
        updates.eligibility = `<ul>${newElig.trim().split('\n').filter(l => l.trim()).map(l => `<li>${l.replace(/^[*-]\s*/, '')}</li>`).join('')}</ul>`;
        changes.push({ 
          field: 'eligibility', 
          oldValue: '(trop courte)', 
          newValue: 'Critères enrichis par IA' 
        });
      }
    }

    // Appliquer les mises à jour si des changements ont été faits
    if (Object.keys(updates).length > 0) {
      await db.update(grants)
        .set(updates)
        .where(eq(grants.id, grantId));
      
      console.log(`✅ Subvention #${grantId} enrichie avec succès (${changes.length} changements)`);
    } else {
      console.log(`ℹ️ Aucun changement nécessaire pour la subvention #${grantId}`);
    }

    return {
      success: true,
      grantId,
      changes
    };

  } catch (error) {
    console.error(`❌ Erreur lors de l'enrichissement de la subvention #${grantId}:`, error);
    return {
      success: false,
      grantId,
      changes: [],
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

export async function enrichMultipleGrants(requests: EnrichmentRequest[]): Promise<EnrichmentResult[]> {
  console.log(`🚀 Enrichissement de ${requests.length} subventions...`);
  
  const results: EnrichmentResult[] = [];
  
  // Traiter les subventions une par une pour éviter de surcharger l'API
  for (const request of requests) {
    const result = await enrichGrant(request.grantId, request.issues);
    results.push(result);
    
    // Pause de 1 seconde entre chaque appel pour respecter les limites de l'API
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  const successful = results.filter(r => r.success).length;
  console.log(`✅ Enrichissement terminé : ${successful}/${requests.length} réussis`);
  
  return results;
}
