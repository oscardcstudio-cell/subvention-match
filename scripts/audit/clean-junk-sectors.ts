/**
 * Nettoie les valeurs hors-vocabulaire dans eligible_sectors et grant_type.
 * Les imports Aides-Territoires ont pollué ces champs avec des types
 * d'audience (Commune, Intercommunalité, entreprise, festival, ...) et des
 * typologies fines (Aide a la creation, Subvention directe, ...).
 *
 * Le deep-enricher saute ces champs s'ils sont déjà remplis, donc tant qu'on
 * n'a pas viré le bruit il n'écrira rien.
 */
import { db } from "../../server/db";
import { grants } from "../../shared/schema";
import { eq, sql } from "drizzle-orm";

const VALID_SECTORS = new Set([
  "musique", "audiovisuel", "spectacle-vivant", "arts-plastiques",
  "arts-numeriques", "ecriture", "patrimoine", "pluridisciplinaire",
]);
const VALID_TYPES = new Set([
  "creation", "diffusion", "residence", "production", "ecriture",
  "equipement", "formation", "mobilite", "structuration", "manifestation",
]);

// Mapping souple (normaliser quelques valeurs)
const SECTOR_REMAP: Record<string, string> = {
  "musique": "musique",
  "audiovisuel": "audiovisuel",
  "cinema": "audiovisuel",
  "cinéma": "audiovisuel",
  "court metrage": "audiovisuel",
  "documentaire": "audiovisuel",
  "video": "audiovisuel",
  "theatre": "spectacle-vivant",
  "théâtre": "spectacle-vivant",
  "danse": "spectacle-vivant",
  "spectacle vivant": "spectacle-vivant",
  "arts de la rue": "spectacle-vivant",
  "cirque": "spectacle-vivant",
  "marionnette": "spectacle-vivant",
  "arts visuels": "arts-plastiques",
  "arts plastiques": "arts-plastiques",
  "peinture": "arts-plastiques",
  "photographie": "arts-plastiques",
  "sculpture": "arts-plastiques",
  "art contemporain": "arts-plastiques",
  "installation": "arts-plastiques",
  "performance": "arts-plastiques",
  "arts numeriques": "arts-numeriques",
  "arts numériques": "arts-numeriques",
  "multimedia": "arts-numeriques",
  "art numerique": "arts-numeriques",
  "realite virtuelle": "arts-numeriques",
  "réalité virtuelle": "arts-numeriques",
  "jeu video": "arts-numeriques",
  "jeu vidéo": "arts-numeriques",
  "livre": "ecriture",
  "litterature": "ecriture",
  "littérature": "ecriture",
  "poesie": "ecriture",
  "poésie": "ecriture",
  "traduction": "ecriture",
  "edition": "ecriture",
  "roman": "ecriture",
  "bande dessinée": "ecriture",
  "bd": "ecriture",
  "patrimoine": "patrimoine",
  "tous secteurs culturels": "pluridisciplinaire",
  "interdisciplinaire": "pluridisciplinaire",
  "pluridisciplinaire": "pluridisciplinaire",
  "pop": "musique",
  "jazz": "musique",
  "rap": "musique",
  "danse hip-hop": "spectacle-vivant",
};

const TYPE_REMAP: Record<string, string> = {
  "aide a la creation": "creation",
  "aide à la création": "creation",
  "aide a la production": "production",
  "aide à la production": "production",
  "aide a la diffusion": "diffusion",
  "aide à la diffusion": "diffusion",
  "residence": "residence",
  "résidence": "residence",
  "aide a l'edition": "ecriture",
  "aide a l'ecriture": "ecriture",
  "aide à l'écriture": "ecriture",
  "manifestation": "manifestation",
  "festival": "manifestation",
  "evenementiel": "manifestation",
  "diffusion": "diffusion",
  "aide au developpement": "production",
  "cooperation": "mobilite",
  "coopération": "mobilite",
};

function cleanArray(arr: string[] | null, remap: Record<string, string>, valid: Set<string>): string[] | null {
  if (!arr || arr.length === 0) return null;
  const out = new Set<string>();
  for (const x of arr) {
    const norm = x.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    const rem = remap[norm] || remap[x.toLowerCase().trim()];
    if (rem && valid.has(rem)) out.add(rem);
    else if (valid.has(norm)) out.add(norm);
    // else: drop (junk)
  }
  return out.size > 0 ? [...out] : null;
}

async function main() {
  const rows = await db.select().from(grants).where(eq(grants.status, "active"));

  let sectorsCleaned = 0, sectorsNulled = 0;
  let typesCleaned = 0, typesNulled = 0;

  for (const g of rows) {
    const newSectors = cleanArray(g.eligibleSectors as string[] | null, SECTOR_REMAP, VALID_SECTORS);
    const newTypes = cleanArray(g.grantType as string[] | null, TYPE_REMAP, VALID_TYPES);

    const update: any = {};
    const oldSectors = g.eligibleSectors ?? null;
    const oldTypes = g.grantType ?? null;

    if (JSON.stringify(newSectors) !== JSON.stringify(oldSectors)) {
      update.eligibleSectors = newSectors;
      if (newSectors === null && oldSectors !== null) sectorsNulled++;
      else if (newSectors !== null) sectorsCleaned++;
    }
    if (JSON.stringify(newTypes) !== JSON.stringify(oldTypes)) {
      update.grantType = newTypes;
      if (newTypes === null && oldTypes !== null) typesNulled++;
      else if (newTypes !== null) typesCleaned++;
    }

    if (Object.keys(update).length > 0) {
      await db.update(grants).set({ ...update, updatedAt: new Date() }).where(eq(grants.id, g.id));
    }
  }

  console.log(`sectors: ${sectorsCleaned} nettoyés, ${sectorsNulled} réinitialisés à null`);
  console.log(`types:   ${typesCleaned} nettoyés, ${typesNulled} réinitialisés à null`);
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
