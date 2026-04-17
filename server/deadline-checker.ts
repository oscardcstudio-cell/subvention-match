import { grantStorage } from "./grant-storage";
import type { Grant } from "@shared/schema";

interface DeadlineCheckResult {
  total: number;
  expired: { id: string; title: string; deadline: string; isRecurring: boolean }[];
  soonExpiring: { id: string; title: string; deadline: string; daysLeft: number }[];
  permanent: number;
  unparseable: number;
}

/**
 * Determine if a grant is recurring (same logic as ai-matcher.ts).
 * isRecurring DB flag is authoritative; falls back to frequency heuristic.
 */
function isGrantRecurring(grant: Grant): boolean {
  if (grant.isRecurring === true) return true;
  if (grant.isRecurring === false) return false;

  if (!grant.frequency || grant.frequency.trim() === '') return false;
  const freq = grant.frequency.toLowerCase();

  const recurringKw = [
    'annuel', 'récurrent', 'permanent', 'régulier',
    'chaque année', 'toute l\'année', 'sessions',
    'appels à projets réguliers', 'variable selon',
  ];
  const oneOffKw = ['ponctuel', 'unique', 'one-shot', 'exceptionnel'];

  if (oneOffKw.some(k => freq.includes(k))) return false;
  if (recurringKw.some(k => freq.includes(k))) return true;
  return false;
}

/**
 * Bump a deadline string forward by one year.
 * Handles ISO (2025-03-15), French (15/03/2025), and text (15 mars 2025) formats.
 * Returns the bumped string in the same format, or null if unparseable.
 */
function bumpDeadlineOneYear(deadline: string): string | null {
  // ISO: 2025-03-15
  const isoMatch = deadline.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1]) + 1;
    return `${year}-${isoMatch[2]}-${isoMatch[3]}`;
  }

  // French: 15/03/2025
  const frMatch = deadline.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (frMatch) {
    const year = parseInt(frMatch[3]) + 1;
    return `${frMatch[1]}/${frMatch[2]}/${year}`;
  }

  // French text: "15 mars 2025"
  const textMatch = deadline.match(/(\d{1,2}\s+\w+\s+)(\d{4})/);
  if (textMatch) {
    const year = parseInt(textMatch[2]) + 1;
    return `${textMatch[1]}${year}`;
  }

  return null;
}

// Parse various French date formats to a Date object
function parseDeadline(deadline: string): Date | null {
  if (!deadline) return null;
  
  const cleanDeadline = deadline.trim().toLowerCase();
  
  // Skip permanent/recurring ones
  const permanentKeywords = [
    'toute l\'année', 'permanent', 'sessions', 'appels', 
    'annuels', 'annuel', 'régulières', 'ponctuels', 
    'spécifiques', 'dossiers', 'chaque année'
  ];
  if (permanentKeywords.some(k => cleanDeadline.includes(k))) {
    return null; // Permanent, no expiry
  }
  
  // Try ISO format: 2025-12-31
  const isoMatch = deadline.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]));
  }
  
  // Try French format: 31/12/2025
  const frMatch = deadline.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (frMatch) {
    return new Date(parseInt(frMatch[3]), parseInt(frMatch[2]) - 1, parseInt(frMatch[1]));
  }
  
  // Try French text: "7 mars 2025"
  const frMonths: Record<string, number> = {
    'janvier': 0, 'février': 1, 'mars': 2, 'avril': 3,
    'mai': 4, 'juin': 5, 'juillet': 6, 'août': 7,
    'septembre': 8, 'octobre': 9, 'novembre': 10, 'décembre': 11
  };
  
  const textMatch = deadline.match(/(\d{1,2})\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+(\d{4})/i);
  if (textMatch) {
    const month = frMonths[textMatch[2].toLowerCase()];
    if (month !== undefined) {
      return new Date(parseInt(textMatch[3]), month, parseInt(textMatch[1]));
    }
  }
  
  // Try range format: "12 janvier - 2 mars 2026" -> take end date
  const rangeMatch = deadline.match(/(\d{1,2})\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+(\d{4})/gi);
  if (rangeMatch && rangeMatch.length > 0) {
    const lastDate = rangeMatch[rangeMatch.length - 1];
    const parts = lastDate.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/i);
    if (parts) {
      const month = frMonths[parts[2].toLowerCase()];
      if (month !== undefined) {
        return new Date(parseInt(parts[3]), month, parseInt(parts[1]));
      }
    }
  }
  
  return null;
}

export async function checkDeadlines(): Promise<DeadlineCheckResult> {
  const allGrants = await grantStorage.getAllActiveGrants();
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  const result: DeadlineCheckResult = {
    total: allGrants.length,
    expired: [],
    soonExpiring: [],
    permanent: 0,
    unparseable: 0
  };
  
  for (const grant of allGrants) {
    if (!grant.deadline) {
      result.permanent++;
      continue;
    }
    
    const deadlineDate = parseDeadline(grant.deadline);
    
    if (deadlineDate === null) {
      // Could be permanent/recurring or unparseable
      const cleanDeadline = grant.deadline.toLowerCase();
      const permanentKeywords = [
        'toute l\'année', 'permanent', 'sessions', 'appels', 
        'annuels', 'annuel', 'régulières', 'ponctuels'
      ];
      if (permanentKeywords.some(k => cleanDeadline.includes(k))) {
        result.permanent++;
      } else {
        result.unparseable++;
      }
      continue;
    }
    
    if (deadlineDate < now) {
      result.expired.push({
        id: grant.id,
        title: grant.title,
        deadline: grant.deadline,
        isRecurring: isGrantRecurring(grant),
      });
    } else if (deadlineDate < thirtyDaysFromNow) {
      const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
      result.soonExpiring.push({
        id: grant.id,
        title: grant.title,
        deadline: grant.deadline,
        daysLeft
      });
    }
  }
  
  return result;
}

/**
 * Process expired grants:
 * - Recurring grants → bump deadline +1 year, keep active
 * - One-shot grants  → archive (status = 'archived')
 */
export async function archiveExpiredGrants(): Promise<{
  archived: number;
  titles: string[];
  bumped: number;
  bumpedTitles: string[];
}> {
  const checkResult = await checkDeadlines();
  const archived: string[] = [];
  const bumpedTitles: string[] = [];

  for (const grant of checkResult.expired) {
    if (grant.isRecurring) {
      // Recurring — bump the deadline forward by one year
      const newDeadline = bumpDeadlineOneYear(grant.deadline);
      if (newDeadline) {
        await grantStorage.updateGrant(grant.id, {
          deadline: newDeadline,
          nextSession: `Prochaine session estimée : ${newDeadline}`,
        });
        bumpedTitles.push(grant.title);
        console.log(`🔄 Bumped recurring grant deadline: ${grant.title} → ${newDeadline}`);
      } else {
        // Can't parse the date format — clear deadline so it stays visible
        await grantStorage.updateGrant(grant.id, {
          deadline: null,
          nextSession: 'Récurrent — prochaine session à confirmer',
        });
        bumpedTitles.push(grant.title);
        console.log(`🔄 Cleared unparseable deadline for recurring grant: ${grant.title}`);
      }
    } else {
      // One-shot — archive it
      await grantStorage.updateGrant(grant.id, { status: 'archived' });
      archived.push(grant.title);
      console.log(`📦 Archived expired one-shot grant: ${grant.title} (deadline: ${grant.deadline})`);
    }
  }

  if (bumpedTitles.length > 0) {
    console.log(`🔄 ${bumpedTitles.length} grants récurrentes bumpées à l'année prochaine`);
  }

  return {
    archived: archived.length,
    titles: archived,
    bumped: bumpedTitles.length,
    bumpedTitles,
  };
}
