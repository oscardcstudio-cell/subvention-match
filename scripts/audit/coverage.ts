import { db } from "../../server/db";
import { sql } from "drizzle-orm";

async function main() {
  // Répartition par domaine (heuristique sur title+description)
  const sectors = await db.execute(sql`
    SELECT
      COUNT(*) FILTER (WHERE lower(title || coalesce(description,'')) ~ 'music|sacem|spedidam|cnm|adami|phonograph|album|concert|festival') as musique,
      COUNT(*) FILTER (WHERE lower(title || coalesce(description,'')) ~ 'cinema|cnc|audiovisuel|film|documentaire|court.m') as audiovisuel,
      COUNT(*) FILTER (WHERE lower(title || coalesce(description,'')) ~ 'theatre|théâtre|danse|cirque|spectacle.vivant') as spectacle_vivant,
      COUNT(*) FILTER (WHERE lower(title || coalesce(description,'')) ~ 'arts.plastiques|arts.visuels|plasticien|sculpt|peinture|exposition|galerie|cnap') as arts_plastiques,
      COUNT(*) FILTER (WHERE lower(title || coalesce(description,'')) ~ 'numérique|numerique|digital|jeu.vidéo|jeu.video|gaming') as arts_numeriques,
      COUNT(*) FILTER (WHERE lower(title || coalesce(description,'')) ~ 'cnl|écriture|ecriture|édition|edition|livre|roman|bd|bande.dessinée|littér|litter|poésie') as ecriture,
      COUNT(*) FILTER (WHERE lower(title || coalesce(description,'')) ~ 'patrimoine|monument|restauration|musée|archéo|conservation') as patrimoine
    FROM grants WHERE status='active'
  `);
  console.log("=== COUVERTURE DOMAINES (heuristique) ===");
  console.log(JSON.stringify(sectors.rows, null, 2));

  // Répartition géographique heuristique
  const regions = await db.execute(sql`
    SELECT organization, COUNT(*) as c
    FROM grants WHERE status='active' AND organization ~* 'régional|regional|départemental|departemental|region|département|departement'
    GROUP BY organization ORDER BY c DESC
  `);
  console.log("\n=== ORGANISMES RÉGIONAUX/DÉPARTEMENTAUX ===");
  for (const r of regions.rows as any[]) {
    console.log(`  ${r.c}x | ${r.organization}`);
  }

  // Freshness — date de dernière import/update
  const fresh = await db.execute(sql`
    SELECT
      DATE(created_at) as day, COUNT(*) as created
    FROM grants
    GROUP BY day ORDER BY day DESC LIMIT 10
  `);
  console.log("\n=== DERNIERS IMPORTS ===");
  for (const r of fresh.rows as any[]) console.log(`  ${r.day}  ${r.created}`);

  // Grants with URL not reachable domain?  Just listing distinct domains
  const tracking = await db.execute(sql`SELECT COUNT(*) FROM organisms_tracking`);
  console.log("\norganisms_tracking rows:", tracking.rows);

  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
