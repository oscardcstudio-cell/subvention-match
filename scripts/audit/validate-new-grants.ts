/**
 * Vérification qualité des grants ajoutées pendant cette session.
 *
 * Identifie les grants créées récemment (via la présence d'organismes ou
 * patterns de titre typiques des waves 0-27) et contrôle :
 * - Champs critiques remplis (title, org, description, eligibility, url)
 * - URL valide (http/https)
 * - Montant cohérent (amount OU amountMin+amountMax OU null explicite)
 * - Description suffisamment fournie (>100 chars)
 * - Eligibility suffisamment fournie (>80 chars)
 * - Deadline présente (même si texte libre)
 * - grantType non vide
 * - eligibleSectors non vide
 * - geographicZone non vide
 */
import { db } from "../../server/db.js";
import { grants } from "../../shared/schema.js";
import { sql, eq, and, desc } from "drizzle-orm";

type Issue = {
  id: string;
  title: string;
  org: string;
  problems: string[];
};

async function main() {
  // Liste d'organismes que j'ai ajoutés dans mes seeds (vagues 0 à 27).
  // On cherche les grants dont l'organisation COMMENCE PAR un de ces patterns.
  // C'est plus fiable que de filtrer sur createdAt car les grants importées
  // depuis Aides Territoires API peuvent aussi avoir des createdAt récents.
  const MY_ORG_PATTERNS = [
    "Région Île-de-France", "Pictanovo", "Région Auvergne-Rhône-Alpes",
    "Région Nouvelle-Aquitaine", "Région Occitanie", "Bpifrance",
    "Creative Europe", "Centre national de la danse",
    "SACD —", "SGDL —", "Institut français", "Fondation Louis Roederer",
    "Fondation Daniel et Nina Carasso", "Artagon", "Fondation des Artistes",
    "CNAP — Centre", "ADAGP —", "Fondation de France",
    "Région Hauts-de-France", "DRAC Hauts-de-France", "DRAC Normandie",
    "Région Normandie", "Région Centre-Val de Loire", "Région Bourgogne-Franche-Comté",
    "Région Pays de la Loire", "Région Bretagne",
    "Creative Europe Culture", "Culture Moves Europe",
    "Perform Europe", "Music Moves Europe",
    "Région Guadeloupe", "Collectivité Territoriale de Martinique",
    "Collectivité Territoriale de Guyane", "Région Réunion", "DAC La Réunion",
    "ARTCENA / DGCA", "Association des CNAREP", "SACD & DGCA",
    "Fondation Jean-Luc Lagardère", "Gens d'Images", "HSBC France",
    "BnF — Bibliothèque",
    "Ministère de la Culture / DRAC", "Collectivité de Corse",
    "Ville de Paris", "Département de Seine-Saint-Denis",
    "OIF —", "AFD ", "British Council",
    "Goethe-Institut", "ASP (Agence", "Ministère du Travail",
    "CNM — Centre National de la Musique", "SPEDIDAM —", "SACEM",
    "Fondation du Patrimoine", "Fondation VMF",
    "Vieilles Maisons Françaises", "Association des Centres Chorégraphiques",
    "Association des CDCN", "Collectif La Danse en Grande Forme",
    "Département du Nord × Villa Marguerite", "La Chartreuse",
    "Eurimages", "Sociétés de Financement", "Fondation Beaumarchais",
    "Groupe Emerige", "SCAM —", "AWARE ×",
    "Conseil départemental des Bouches", "Préfecture des Bouches",
    "Conseil départemental de la Gironde", "Conseil départemental du Rhône",
    "Métropole de Lyon", "Département du Nord",
    "Académie de France à Rome", "Institut français du Japon",
    "Cité internationale de la bande dessinée", "Villa Médicis ×",
    "CALQ ×", "Fondation Bettencourt Schueller", "Fondation Banque Populaire",
    "Printemps de Bourges", "Francofolies", "ADAMI —",
    "Nantes Métropole", "Ville de Bordeaux", "Toulouse Métropole",
    "Ville de Strasbourg", "Eurométropole de Strasbourg",
    "Métropole Européenne de Lille", "Montpellier Méditerranée",
    "Ville de Marseille", "Ville de Lyon",
    "Fondation Orange", "Fondation SNCF", "Fondation Groupe RATP",
    "SPPF —", "SCPP —", "Canon × Visa", "CICR (Comité",
    "Magnum Foundation", "CNL — Centre National du Livre",
    "Fondation Simone et Cino Del Duca", "Fondation François Schneider",
    "Académie des Beaux-Arts", "Drawing Now Paris", "Fondation Aurelie Nemours",
    "IRCAM —", "DRAC Auvergne-Rhône-Alpes ×", "Festival International de Théâtre de Rue",
    "FEVIS ×", "Académie française",
    "Ateliers Médicis", "Pictet Group",
    "Casa de Velázquez", "Cité internationale des arts",
    "Fondation Art Explora", "ADAGP × Cité", "Fondation Daniel Langlois",
    "Villa Noailles", "Ministère de la Culture × Cité de l'architecture",
    "Association du Prix Albert Londres", "COAL —",
  ];

  // Récupération de toutes les grants, puis filtre par prefix org (plus simple
  // qu'une requête SQL complexe avec 100+ LIKE).
  const all = await db
    .select()
    .from(grants)
    .where(eq(grants.status, "active"));

  // Double filtre : UUID (36 chars) ET organisme matché. Les grants
  // d'Aides Territoires API peuvent avoir le même nom d'organisme mais
  // ID numérique court.
  const recent = all.filter((g) => {
    if (g.id.length !== 36) return false;
    return MY_ORG_PATTERNS.some((p) => g.organization.includes(p));
  });

  console.log(`\n=== ${recent.length} grants (UUID + orgs ciblés waves 0-27) ===\n`);

  const issues: Issue[] = [];

  for (const g of recent) {
    const problems: string[] = [];

    // 1. Titre
    if (!g.title || g.title.length < 10) problems.push("TITLE: absent ou trop court");

    // 2. Organisation
    if (!g.organization || g.organization.length < 3) problems.push("ORG: absente ou trop courte");

    // 3. Description
    if (!g.description) problems.push("DESCRIPTION: absente");
    else if (g.description.length < 100) problems.push(`DESCRIPTION: trop courte (${g.description.length} chars)`);

    // 4. Eligibility
    if (!g.eligibility) problems.push("ELIGIBILITY: absente");
    else if (g.eligibility.length < 80) problems.push(`ELIGIBILITY: trop courte (${g.eligibility.length} chars)`);

    // 5. URL
    if (!g.url) problems.push("URL: absente");
    else if (!g.url.startsWith("http")) problems.push(`URL: format invalide (${g.url.slice(0, 40)})`);

    // 6. Montant
    const hasAmount = g.amount !== null || g.amountMin !== null || g.amountMax !== null;
    if (!hasAmount) problems.push("AMOUNT: tous null (pas explicitement 0 ou null cohérent)");

    // 7. Deadline
    if (!g.deadline) problems.push("DEADLINE: absente");

    // 8. grantType
    if (!g.grantType || g.grantType.length === 0) problems.push("GRANT_TYPE: absent");

    // 9. eligibleSectors
    if (!g.eligibleSectors || g.eligibleSectors.length === 0) problems.push("ELIGIBLE_SECTORS: absent");

    // 10. geographicZone
    if (!g.geographicZone || g.geographicZone.length === 0) problems.push("GEO_ZONE: absent");

    // 11. preparationAdvice (conseil — ajoute de la valeur mais pas critique)
    if (!g.preparationAdvice) problems.push("PREP_ADVICE: absent (recommandé)");

    if (problems.length > 0) {
      issues.push({
        id: g.id,
        title: g.title,
        org: g.organization,
        problems,
      });
    }
  }

  // === Résultats ===
  const total = recent.length;
  const withIssues = issues.length;
  const clean = total - withIssues;

  console.log(`📊 Stats :`);
  console.log(`  ✅ Grants sans problème : ${clean}/${total} (${((clean / total) * 100).toFixed(0)}%)`);
  console.log(`  ⚠️  Grants avec problèmes : ${withIssues}/${total} (${((withIssues / total) * 100).toFixed(0)}%)\n`);

  // Breakdown des types de problèmes
  const problemCounts: Record<string, number> = {};
  for (const issue of issues) {
    for (const p of issue.problems) {
      const key = p.split(":")[0];
      problemCounts[key] = (problemCounts[key] || 0) + 1;
    }
  }

  console.log(`📋 Fréquence des types de problèmes :`);
  Object.entries(problemCounts)
    .sort(([, a], [, b]) => b - a)
    .forEach(([k, n]) => console.log(`  ${n.toString().padStart(3)} × ${k}`));

  // Top 20 des grants les plus problématiques
  if (issues.length > 0) {
    console.log(`\n📝 Top grants à corriger (affichage des 20 premières) :\n`);
    const sortedIssues = issues.sort((a, b) => b.problems.length - a.problems.length);
    for (const issue of sortedIssues.slice(0, 20)) {
      console.log(`  • [${issue.org}]`);
      console.log(`    ${issue.title.slice(0, 70)}`);
      console.log(`    ID: ${issue.id}`);
      for (const p of issue.problems) {
        console.log(`    ⚠️  ${p}`);
      }
      console.log("");
    }
  }

  // Critiques vs non-critiques
  const critical = ["TITLE", "ORG", "DESCRIPTION", "ELIGIBILITY", "URL", "AMOUNT", "DEADLINE", "GRANT_TYPE", "ELIGIBLE_SECTORS", "GEO_ZONE"];
  const criticalIssuesCount = issues.filter((i) =>
    i.problems.some((p) => critical.includes(p.split(":")[0])),
  ).length;

  console.log(`\n🚨 Grants avec AU MOINS UN problème CRITIQUE : ${criticalIssuesCount}/${total}`);
  console.log(`   (problèmes critiques = title, org, description, eligibility, url, amount, deadline, grantType, eligibleSectors, geographicZone)`);

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
