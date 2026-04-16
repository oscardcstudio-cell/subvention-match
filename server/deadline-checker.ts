import { grantStorage } from "./grant-storage";

interface DeadlineCheckResult {
  total: number;
  expired: { id: string; title: string; deadline: string }[];
  soonExpiring: { id: string; title: string; deadline: string; daysLeft: number }[];
  permanent: number;
  unparseable: number;
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
        deadline: grant.deadline
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

export async function archiveExpiredGrants(): Promise<{ archived: number; titles: string[] }> {
  const checkResult = await checkDeadlines();
  const archived: string[] = [];
  
  for (const grant of checkResult.expired) {
    await grantStorage.updateGrant(grant.id, { status: 'archived' });
    archived.push(grant.title);
    console.log(`📦 Archived expired grant: ${grant.title} (deadline: ${grant.deadline})`);
  }
  
  return { archived: archived.length, titles: archived };
}
