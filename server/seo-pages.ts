/**
 * SEO Pages — Server-side HTML pour les pages programmatiques
 * Routes: GET /subventions/:domain/:region
 *
 * Génère du HTML complet (pas la SPA) pour éviter le délai d'indexation JS.
 * Contient: bloc réponse directe, liste des vraies aides DB, FAQ schema JSON-LD.
 * Indexé par Google Wave 1 (HTML pur) et citable par Perplexity/AI Overviews.
 */

import { db } from "./db.js";
import { grants } from "../shared/schema.js";
import { isNotNull } from "drizzle-orm";
import type { Express, Request, Response } from "express";

// Mots-clés par domaine — même logique que ai-matcher.ts
const DOMAIN_KEYWORDS: Record<string, string[]> = {
  "musique": [
    "musique", "musical", "musicien", "phonograph", "chanson", "concert",
    "album", "tournée", "tournee", "festival", "cnm", "sacem", "spedidam", "adami",
    "musiques actuelles", "enregistrement", "compositeur", "interprète", "interprete",
    "programmation", "programmateur", "salle de concert", "smac", "diffusion musicale",
  ],
  "audiovisuel": [
    "audiovisuel", "cinéma", "cinema", "cinématograph", "film", "court métrage",
    "long métrage", "cnc", "documentaire", "série", "serie", "animation",
  ],
  "spectacle-vivant": [
    "spectacle vivant", "théâtre", "theatre", "danse", "cirque",
    "chorégraph", "compagnie", "dramatique", "marionnette", "festival",
    "spedidam", "arts de la rue", "arts du mouvement",
  ],
  "arts-plastiques": [
    "arts plastiques", "arts visuels", "plasticien", "sculpt",
    "peinture", "peintre", "exposition", "galerie", "artiste visuel",
    "centre d'art", "cnap",
  ],
  "arts-numeriques": [
    "numérique", "numerique", "digital", "multimedia", "multimédia",
    "interactif", "jeu vidéo", "jeu video", "arts numériques", "nouvelles technologies",
    "réalité virtuelle", "immersion",
  ],
  "ecriture": [
    "écriture", "ecriture", "écrivain", "ecrivain", "auteur", "autrice",
    "littér", "litter", "roman", "édition", "edition", "livre", "cnl",
    "manuscrit", "poésie", "poesie", "bande dessinée",
  ],
  "patrimoine": [
    "patrimoine", "monument", "restauration", "musée", "musee",
    "archéo", "conservation", "historique", "architectural",
  ],
  "metiers-art": [
    "métiers d'art", "metiers d'art", "artisanat", "artisan", "savoir-faire",
    "inma", "craft", "ébénisterie", "lutherie", "céramique", "tapisserie",
  ],
  "transversal": [], // vide = tout passe (domaine générique)
};

// ─── Mappings domaines ────────────────────────────────────────────────────────

export const DOMAIN_META: Record<string, { label: string; labelLong: string; orgs: string }> = {
  "musique":           { label: "Musique",          labelLong: "la musique et les artistes musicaux",           orgs: "ADAMI, Sacem, CNM, Spedidam" },
  "spectacle-vivant":  { label: "Spectacle vivant",  labelLong: "le spectacle vivant, le théâtre et la danse",   orgs: "CNM, DRAC, Fonds SACD, Région" },
  "audiovisuel":       { label: "Audiovisuel",       labelLong: "le cinéma, la vidéo et l'audiovisuel",           orgs: "CNC, Creative Europe MEDIA, Région" },
  "arts-plastiques":   { label: "Arts visuels",      labelLong: "les arts visuels et plastiques",                orgs: "CNAP, ADAGP, DRAC, Fondation de France" },
  "ecriture":          { label: "Écriture",          labelLong: "l'écriture, la littérature et l'édition",        orgs: "CNL, SGDL, ADAGP, Sofia" },
  "arts-numeriques":   { label: "Arts numériques",   labelLong: "les arts numériques et la création digitale",   orgs: "CNAP, Région, Fondation de France" },
  "patrimoine":        { label: "Patrimoine",        labelLong: "la valorisation et la restauration du patrimoine", orgs: "DRAC, Fondation du Patrimoine, Région" },
  "metiers-art":       { label: "Métiers d'art",     labelLong: "les métiers d'art et l'artisanat culturel",     orgs: "INMA, Région, Département" },
  "transversal":       { label: "Culture",           labelLong: "les projets culturels transversaux",             orgs: "DRAC, Fondation de France, Région" },
};

// ─── Mappings régions ─────────────────────────────────────────────────────────

export const REGION_SLUGS: Record<string, string> = {
  "auvergne-rhone-alpes":       "Auvergne-Rhône-Alpes",
  "bourgogne-franche-comte":    "Bourgogne-Franche-Comté",
  "bretagne":                   "Bretagne",
  "centre-val-de-loire":        "Centre-Val de Loire",
  "corse":                      "Corse",
  "grand-est":                  "Grand Est",
  "hauts-de-france":            "Hauts-de-France",
  "ile-de-france":              "Île-de-France",
  "normandie":                  "Normandie",
  "nouvelle-aquitaine":         "Nouvelle-Aquitaine",
  "occitanie":                  "Occitanie",
  "pays-de-la-loire":           "Pays de la Loire",
  "provence-alpes-cote-d-azur": "Provence-Alpes-Côte d'Azur",
  "outre-mer":                  "Outre-mer",
};

// ─── Requête DB ───────────────────────────────────────────────────────────────

async function getGrantsForPage(domain: string, region: string) {
  // Récupère toutes les grants actives — filtre domaine + région en JS
  const rows = await db
    .select({
      title: grants.title,
      organization: grants.organization,
      amount: grants.amount,
      deadline: grants.deadline,
      description: grants.description,
      url: grants.url,
      improvedUrl: grants.improvedUrl,
      geographicZone: grants.geographicZone,
      isRecurring: grants.isRecurring,
      eligibleSectors: grants.eligibleSectors,
    })
    .from(grants)
    .where(isNotNull(grants.title))
    .limit(300);

  const domainKeywords = DOMAIN_KEYWORDS[domain] ?? [];
  const regionNorm = region.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  const relevant = rows.filter(g => {
    // Filtre domaine — si pas de mots-clés (transversal) → tout passe
    if (domainKeywords.length > 0) {
      const haystack = [
        g.title ?? "",
        g.description ?? "",
        (g.eligibleSectors ?? []).join(" "),
      ].join(" ").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
      if (!domainKeywords.some(kw => haystack.includes(kw))) return false;
    }

    // Filtre région — nationale ou compatible
    const zones = (g.geographicZone ?? []).map(z =>
      z.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    );
    if (zones.length === 0) return true; // pas de zone = nationale
    const isNational = zones.some(z =>
      ["national", "france", "international", "europe"].some(k => z.includes(k))
    );
    if (isNational) return true;
    return zones.some(z => z.includes(regionNorm) || regionNorm.includes(z));
  });

  return relevant.slice(0, 12);
}

// ─── Template HTML ────────────────────────────────────────────────────────────

function renderPage(domain: string, region: string, regionSlug: string, grants: Awaited<ReturnType<typeof getGrantsForPage>>): string {
  const dm = DOMAIN_META[domain];
  const title = `Subventions ${dm.label} ${region} 2026 — Mecene`;
  const description = `${grants.length} aides culturelles disponibles pour ${dm.labelLong} en ${region}. Financement par ${dm.orgs}. Analyse IA gratuite en 3 minutes.`;
  const canonical = `https://subvention-match-production.up.railway.app/subventions/${domain}/${regionSlug}`;
  const formUrl = `https://subvention-match-production.up.railway.app/form?domain=${domain}&region=${encodeURIComponent(region)}`;

  const grantItems = grants.map(g => {
    const deadlineStr = g.isRecurring ? "Permanente / récurrente" : (g.deadline ?? "Voir le site");
    return `
    <article class="grant-card">
      <div class="grant-header">
        <h3>${esc(g.title ?? "")}</h3>
        <div class="grant-org">${esc(g.organization ?? "")}</div>
      </div>
      <div class="grant-meta">
        ${g.amount ? `<span class="meta-tag">💰 ${esc(g.amount.toLocaleString("fr-FR") + " €")}</span>` : ""}
        <span class="meta-tag">📅 ${esc(deadlineStr)}</span>
        ${(g.geographicZone ?? []).length > 0 ? `<span class="meta-tag">📍 ${esc((g.geographicZone ?? []).join(", "))}</span>` : ""}
      </div>
      ${g.description ? `<p class="grant-desc">${esc(g.description.replace(/<[^>]*>/g, "").slice(0, 200))}…</p>` : ""}
      ${(g.improvedUrl ?? g.url) ? `<a href="${esc(g.improvedUrl ?? g.url ?? "")}" rel="noopener" class="grant-link">Accéder au dossier →</a>` : ""}
    </article>`;
  }).join("\n");

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `Quelles subventions existent pour ${dm.labelLong} en ${region} ?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `En ${region}, les artistes et structures actifs en ${dm.labelLong} peuvent bénéficier d'aides de ${dm.orgs}, ainsi que des dispositifs régionaux de la Région ${region} et des DRAC. Mecene référence ${grants.length} aides disponibles pour ce profil.`
        }
      },
      {
        "@type": "Question",
        "name": `Comment trouver des financements pour ${dm.labelLong} ?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Pour trouver des financements culturels en ${region}, renseignez votre profil sur Mecene (statut, domaine artistique, description du projet). L'IA analyse plus de 470 aides référencées et vous propose les plus pertinentes pour votre situation en 3 minutes. Le service est gratuit en beta.`
        }
      },
      {
        "@type": "Question",
        "name": `Quels organismes financent ${dm.labelLong} en ${region} ?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Les principaux organismes qui financent ${dm.labelLong} en ${region} sont : ${dm.orgs}, la Région ${region}, le Département et les collectivités locales, ainsi que des fondations privées comme la Fondation de France. Les aides nationales du Ministère de la Culture s'appliquent également à ${region}.`
        }
      }
    ]
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": title,
    "description": description,
    "url": canonical,
    "isPartOf": { "@type": "WebSite", "name": "Mecene", "url": "https://subvention-match-production.up.railway.app/" }
  };

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="canonical" href="${canonical}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="https://subvention-match-production.up.railway.app/og-image.png" />
  <meta property="og:locale" content="fr_FR" />
  <script type="application/ld+json">${JSON.stringify(faqSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(webPageSchema)}</script>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,system-ui,sans-serif;background:#0a0a0a;color:#e8e8e8;line-height:1.6}
    a{color:#06D6A0;text-decoration:none}
    a:hover{text-decoration:underline}
    .container{max-width:900px;margin:0 auto;padding:24px 20px}
    .nav{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #1f1f1f;margin-bottom:40px}
    .logo{font-weight:900;font-size:20px;letter-spacing:-0.5px}
    .logo span{color:#06D6A0}
    .breadcrumb{font-size:12px;color:#666;margin-bottom:24px}
    .breadcrumb a{color:#666}
    h1{font-size:clamp(28px,5vw,48px);font-weight:900;line-height:1.1;margin-bottom:16px}
    h1 span{color:#06D6A0}
    .answer-block{background:#111;border-left:3px solid #06D6A0;padding:20px 24px;margin:24px 0 40px;border-radius:0 8px 8px 0}
    .answer-block p{color:#aaa;font-size:15px;line-height:1.7}
    .stats-row{display:flex;gap:24px;flex-wrap:wrap;margin-bottom:40px}
    .stat{background:#111;border:1px solid #1f1f1f;border-radius:8px;padding:16px 20px;flex:1;min-width:120px}
    .stat-value{font-size:28px;font-weight:900;color:#06D6A0}
    .stat-label{font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.5px;margin-top:4px}
    .section-title{font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#666;margin-bottom:20px;padding-bottom:8px;border-bottom:1px solid #1f1f1f}
    .grant-card{background:#111;border:1px solid #1f1f1f;border-radius:8px;padding:20px;margin-bottom:12px;transition:border-color 0.15s}
    .grant-card:hover{border-color:#333}
    .grant-header h3{font-size:17px;font-weight:700;margin-bottom:4px}
    .grant-org{font-size:13px;color:#666;margin-bottom:12px}
    .grant-meta{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
    .meta-tag{font-size:12px;background:#1a1a1a;border:1px solid #2a2a2a;padding:4px 10px;border-radius:999px;color:#aaa}
    .grant-desc{font-size:13px;color:#777;margin-bottom:12px;line-height:1.5}
    .grant-link{font-size:13px;font-weight:600;color:#06D6A0}
    .cta-box{background:#0d1f18;border:1px solid rgba(6,214,160,0.3);border-radius:12px;padding:32px;margin:40px 0;text-align:center}
    .cta-box h2{font-size:24px;font-weight:900;margin-bottom:8px}
    .cta-box p{color:#888;margin-bottom:24px;font-size:14px}
    .cta-btn{display:inline-block;background:#06D6A0;color:#0a0a0a;font-weight:700;padding:14px 28px;border-radius:999px;font-size:15px}
    .cta-btn:hover{background:#04bfa0;text-decoration:none}
    .faq{margin:48px 0}
    .faq h2{font-size:22px;font-weight:800;margin-bottom:24px}
    .faq-item{margin-bottom:24px;padding-bottom:24px;border-bottom:1px solid #1f1f1f}
    .faq-item:last-child{border-bottom:none}
    .faq-q{font-size:16px;font-weight:700;margin-bottom:8px}
    .faq-a{font-size:14px;color:#888;line-height:1.7}
    footer{border-top:1px solid #1f1f1f;padding:24px 20px;text-align:center;font-size:12px;color:#444;margin-top:60px}
  </style>
</head>
<body>
  <nav class="nav">
    <a href="/" class="logo">Mecene<span>.</span></a>
    <a href="${formUrl}" class="cta-btn" style="padding:10px 20px;font-size:13px">Trouver mes subventions →</a>
  </nav>

  <main class="container">
    <div class="breadcrumb">
      <a href="/">Accueil</a> › <a href="/subventions/${domain}">Subventions ${dm.label}</a> › ${region}
    </div>

    <h1>Subventions <span>${dm.label}</span><br>${region} 2026</h1>

    <!-- Bloc réponse directe — optimisé AI Overview -->
    <div class="answer-block">
      <p>En ${region}, ${grants.length} aides culturelles sont disponibles pour ${dm.labelLong}. Les principaux financeurs sont ${dm.orgs}. Ces subventions couvrent la création, la production, la diffusion et les résidences artistiques. Pour savoir lesquelles correspondent à votre projet, Mecene analyse votre profil en 3 minutes et sélectionne les aides les plus pertinentes parmi plus de 470 dispositifs référencés en France.</p>
    </div>

    <div class="stats-row">
      <div class="stat">
        <div class="stat-value">${grants.length}</div>
        <div class="stat-label">Aides disponibles</div>
      </div>
      <div class="stat">
        <div class="stat-value">470+</div>
        <div class="stat-label">Aides analysées</div>
      </div>
      <div class="stat">
        <div class="stat-value">3 min</div>
        <div class="stat-label">Pour votre profil</div>
      </div>
      <div class="stat">
        <div class="stat-value">100%</div>
        <div class="stat-label">Gratuit en beta</div>
      </div>
    </div>

    <div class="section-title">${grants.length} aides ${dm.label} disponibles en ${region}</div>
    ${grantItems || `<p style="color:#666;font-size:14px">Aucune aide spécifique trouvée pour cette combinaison — <a href="${formUrl}">remplissez votre profil</a> pour un matching complet parmi les 470+ aides nationales.</p>`}

    <div class="cta-box">
      <h2>Trouvez vos subventions en 3 minutes</h2>
      <p>Mecene analyse votre profil et sélectionne les aides les plus pertinentes parmi 470+ dispositifs. Gratuit en beta.</p>
      <a href="${formUrl}" class="cta-btn">Lancer le matching gratuit →</a>
    </div>

    <div class="faq">
      <h2>Questions fréquentes</h2>
      ${faqSchema.mainEntity.map(q => `
      <div class="faq-item">
        <div class="faq-q">${esc(q.name)}</div>
        <div class="faq-a">${esc(q.acceptedAnswer.text)}</div>
      </div>`).join("")}
    </div>
  </main>

  <footer>
    © 2026 Mecene · <a href="/">Accueil</a> · <a href="/mentions-legales">Mentions légales</a>
    <div style="margin-top:8px">Données mises à jour régulièrement — <a href="/">Voir toutes les disciplines</a></div>
  </footer>
</body>
</html>`;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ─── Profils — pages ciblant les recherches naturelles (musicien subvention…) ─

export const PROFILE_META: Record<string, {
  label: string;       // "musicien"
  labelPlural: string; // "musiciens"
  labelDe: string;     // "de musicien" (pour titres)
  domain: string;      // clé dans DOMAIN_META
  orgs: string;        // organismes financeurs
  description: string; // phrase intro pour bloc réponse directe
}> = {
  "musicien": {
    label: "musicien", labelPlural: "musiciens", labelDe: "de musicien",
    domain: "musique",
    orgs: "ADAMI, Sacem, CNM, Spedidam",
    description: "musiciens, groupes, chanteurs et compositeurs — création, enregistrement, tournée, résidence",
  },
  "danseur": {
    label: "danseur", labelPlural: "danseurs", labelDe: "de danseur",
    domain: "spectacle-vivant",
    orgs: "Spedidam, DRAC, CNM, Région",
    description: "danseurs, chorégraphes et compagnies de danse — création chorégraphique, diffusion, résidence",
  },
  "comedien": {
    label: "comédien", labelPlural: "comédiens", labelDe: "de comédien",
    domain: "spectacle-vivant",
    orgs: "DRAC, Fonds SACD, Région, SACD",
    description: "comédiens, metteurs en scène et compagnies théâtrales — création, production, tournée",
  },
  "realisateur": {
    label: "réalisateur", labelPlural: "réalisateurs", labelDe: "de réalisateur",
    domain: "audiovisuel",
    orgs: "CNC, Creative Europe MEDIA, Région",
    description: "réalisateurs, cinéastes et documentaristes — développement, production, post-production",
  },
  "plasticien": {
    label: "plasticien", labelPlural: "plasticiens", labelDe: "de plasticien",
    domain: "arts-plastiques",
    orgs: "CNAP, ADAGP, DRAC, Fondation de France",
    description: "plasticiens, peintres, sculpteurs et artistes visuels — création, exposition, résidence",
  },
  "photographe": {
    label: "photographe", labelPlural: "photographes", labelDe: "de photographe",
    domain: "arts-plastiques",
    orgs: "CNAP, ADAGP, DRAC, Fondation de France",
    description: "photographes et artistes de l'image — création, exposition, édition photographique",
  },
  "ecrivain": {
    label: "écrivain", labelPlural: "écrivains", labelDe: "d'écrivain",
    domain: "ecriture",
    orgs: "CNL, SGDL, Sofia, ADAGP",
    description: "écrivains, auteurs et poètes — bourse d'écriture, résidence, aide à l'édition",
  },
  "artiste-numerique": {
    label: "artiste numérique", labelPlural: "artistes numériques", labelDe: "d'artiste numérique",
    domain: "arts-numeriques",
    orgs: "CNAP, Région, Fondation de France",
    description: "artistes numériques, créateurs interactifs et développeurs artistiques — création, résidence, diffusion",
  },
  "artisan-art": {
    label: "artisan d'art", labelPlural: "artisans d'art", labelDe: "d'artisan d'art",
    domain: "metiers-art",
    orgs: "INMA, Région, Département",
    description: "artisans d'art, luthiers, ébénistes et créateurs — formation, équipement, développement",
  },
  "artiste": {
    label: "artiste", labelPlural: "artistes", labelDe: "d'artiste",
    domain: "transversal",
    orgs: "DRAC, Fondation de France, Région, Collectivités",
    description: "artistes tous domaines — aides transversales à la création, mobilité, résidence, production",
  },
};

// ─── Template HTML — pages profil ────────────────────────────────────────────

function renderProfilePage(
  profileSlug: string,
  region: string,
  regionSlug: string,
  grantList: Awaited<ReturnType<typeof getGrantsForPage>>
): string {
  const pm = PROFILE_META[profileSlug];
  const title = `Subvention ${pm.label} ${region} 2026 — Mecene`;
  const description = `${grantList.length} aides disponibles pour ${pm.labelPlural} en ${region}. Financement par ${pm.orgs}. Matching IA gratuit en 3 minutes.`;
  const canonical = `https://subvention-match-production.up.railway.app/aides/${profileSlug}/${regionSlug}`;
  const formUrl = `https://subvention-match-production.up.railway.app/form?region=${encodeURIComponent(region)}`;

  const grantItems = grantList.map(g => {
    const deadlineStr = g.isRecurring ? "Permanente / récurrente" : (g.deadline ?? "Voir le site");
    return `
    <article class="grant-card">
      <div class="grant-header">
        <h3>${esc(g.title ?? "")}</h3>
        <div class="grant-org">${esc(g.organization ?? "")}</div>
      </div>
      <div class="grant-meta">
        ${g.amount ? `<span class="meta-tag">💰 ${esc(g.amount.toLocaleString("fr-FR") + " €")}</span>` : ""}
        <span class="meta-tag">📅 ${esc(deadlineStr)}</span>
        ${(g.geographicZone ?? []).length > 0 ? `<span class="meta-tag">📍 ${esc((g.geographicZone ?? []).join(", "))}</span>` : ""}
      </div>
      ${g.description ? `<p class="grant-desc">${esc(g.description.replace(/<[^>]*>/g, "").slice(0, 200))}…</p>` : ""}
      ${(g.improvedUrl ?? g.url) ? `<a href="${esc(g.improvedUrl ?? g.url ?? "")}" rel="noopener" class="grant-link">Accéder au dossier →</a>` : ""}
    </article>`;
  }).join("\n");

  const faqItems = [
    {
      q: `Quelles subventions existent pour ${pm.labelPlural} en ${region} ?`,
      a: `En ${region}, les ${pm.labelPlural} peuvent bénéficier d'aides de ${pm.orgs}, ainsi que des dispositifs régionaux de la Région ${region} et des DRAC. Mecene référence ${grantList.length} aides pour ce profil.`,
    },
    {
      q: `Comment trouver une aide ${pm.labelDe} en ${region} ?`,
      a: `Pour trouver des financements en tant que ${pm.label} en ${region}, renseignez votre profil sur Mecene : statut (intermittent, auto-entrepreneur, association…), description du projet, région. L'IA sélectionne les aides les plus pertinentes parmi 470+ dispositifs en 3 minutes. Gratuit en beta.`,
    },
    {
      q: `Existe-t-il des bourses spécifiques pour ${pm.labelPlural} ?`,
      a: `Oui. Les principaux organismes qui financent les ${pm.labelPlural} sont ${pm.orgs}. S'y ajoutent les aides régionales, les fondations privées et les dispositifs européens. Utilisez Mecene pour obtenir une liste personnalisée selon votre situation.`,
    },
  ];

  const faqSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a },
    })),
  });

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="canonical" href="${canonical}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="https://subvention-match-production.up.railway.app/og-image.png" />
  <meta property="og:locale" content="fr_FR" />
  <script type="application/ld+json">${faqSchema}</script>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,system-ui,sans-serif;background:#0a0a0a;color:#e8e8e8;line-height:1.6}
    a{color:#06D6A0;text-decoration:none}a:hover{text-decoration:underline}
    .container{max-width:900px;margin:0 auto;padding:24px 20px}
    .nav{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #1f1f1f;margin-bottom:40px}
    .logo{font-weight:900;font-size:20px;letter-spacing:-0.5px}.logo span{color:#06D6A0}
    .breadcrumb{font-size:12px;color:#666;margin-bottom:24px}.breadcrumb a{color:#666}
    h1{font-size:clamp(28px,5vw,48px);font-weight:900;line-height:1.1;margin-bottom:16px}
    h1 span{color:#06D6A0}
    .answer-block{background:#111;border-left:3px solid #06D6A0;padding:20px 24px;margin:24px 0 40px;border-radius:0 8px 8px 0}
    .stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin:32px 0}
    .stat{background:#111;border-radius:8px;padding:16px;text-align:center}
    .stat-value{font-size:28px;font-weight:900;color:#06D6A0}
    .stat-label{font-size:12px;color:#666;margin-top:4px;text-transform:uppercase;letter-spacing:.5px}
    .section-title{font-size:20px;font-weight:700;margin:40px 0 20px;padding-bottom:12px;border-bottom:1px solid #1f1f1f}
    .grant-card{background:#111;border-radius:8px;padding:20px 24px;margin-bottom:16px;border:1px solid #1f1f1f}
    .grant-header{margin-bottom:12px}
    .grant-card h3{font-size:16px;font-weight:700;line-height:1.3}
    .grant-org{font-size:13px;color:#666;margin-top:4px}
    .grant-meta{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}
    .meta-tag{font-size:12px;background:#1a1a1a;border:1px solid #2a2a2a;padding:4px 10px;border-radius:999px;white-space:nowrap}
    .grant-desc{font-size:14px;color:#aaa;line-height:1.5;margin-bottom:12px}
    .grant-link{font-size:13px;font-weight:600}
    .cta-box{background:#0d1f1a;border:1px solid #06D6A0;border-radius:12px;padding:32px;text-align:center;margin:40px 0}
    .cta-box h2{font-size:24px;font-weight:900;margin-bottom:12px}
    .cta-box p{color:#aaa;margin-bottom:24px}
    .cta-btn{display:inline-block;background:#06D6A0;color:#0a0a0a;font-weight:700;padding:14px 28px;border-radius:999px;font-size:15px}
    .faq{margin:40px 0}.faq h2{font-size:20px;font-weight:700;margin-bottom:20px}
    .faq-item{border-bottom:1px solid #1f1f1f;padding:20px 0}
    .faq-q{font-weight:600;margin-bottom:8px}
    .faq-a{color:#aaa;font-size:14px;line-height:1.6}
    footer{text-align:center;padding:32px 20px;color:#444;font-size:13px;border-top:1px solid #1f1f1f;margin-top:40px}
    @media(max-width:600px){.stats-row{grid-template-columns:repeat(2,1fr)}.nav{flex-direction:column;gap:12px;text-align:center}}
  </style>
</head>
<body>
  <nav class="nav">
    <a href="/" class="logo">Mecene<span>.</span></a>
    <a href="${formUrl}" style="background:#06D6A0;color:#0a0a0a;font-weight:700;padding:10px 20px;border-radius:999px;font-size:14px">Trouver mes aides →</a>
  </nav>
  <main class="container">
    <div class="breadcrumb">
      <a href="/">Mecene</a> › <a href="/aides/${profileSlug}">Aides ${pm.label}</a> › ${region}
    </div>
    <h1>Subvention <span>${esc(pm.label)}</span> ${esc(region)} 2026</h1>
    <p style="color:#aaa;margin-bottom:16px">${grantList.length} aides identifiées pour ${pm.labelPlural} en ${region}</p>

    <div class="answer-block">
      <p>En ${region}, les ${pm.labelPlural} peuvent accéder à des financements pour ${pm.description}. Les principaux organismes sont ${pm.orgs}, auxquels s'ajoutent les dispositifs régionaux et les fondations privées. Mecene référence ${grantList.length} aides pour ce profil et les analyse en 3 minutes selon votre situation spécifique.</p>
    </div>

    <div class="stats-row">
      <div class="stat"><div class="stat-value">${grantList.length}</div><div class="stat-label">Aides trouvées</div></div>
      <div class="stat"><div class="stat-value">470+</div><div class="stat-label">Aides analysées</div></div>
      <div class="stat"><div class="stat-value">3 min</div><div class="stat-label">Pour votre profil</div></div>
      <div class="stat"><div class="stat-value">100%</div><div class="stat-label">Gratuit en beta</div></div>
    </div>

    <div class="section-title">${grantList.length} aides pour ${pm.labelPlural} en ${region}</div>
    ${grantItems || `<p style="color:#666;font-size:14px">Aucune aide spécifique trouvée — <a href="${formUrl}">remplissez votre profil</a> pour un matching complet parmi les 470+ aides nationales.</p>`}

    <div class="cta-box">
      <h2>Matching personnalisé pour ${pm.labelPlural}</h2>
      <p>Renseignez votre projet (statut, description, région) et Mecene sélectionne les aides les plus pertinentes pour vous parmi 470+ dispositifs.</p>
      <a href="${formUrl}" class="cta-btn">Lancer le matching gratuit →</a>
    </div>

    <div class="faq">
      <h2>Questions fréquentes</h2>
      ${faqItems.map(f => `
      <div class="faq-item">
        <div class="faq-q">${esc(f.q)}</div>
        <div class="faq-a">${esc(f.a)}</div>
      </div>`).join("")}
    </div>

    <div style="margin-top:32px;padding:20px;background:#111;border-radius:8px">
      <p style="font-size:13px;color:#666;margin-bottom:12px">Voir par région :</p>
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        ${Object.entries(REGION_SLUGS).map(([slug, name]) =>
          `<a href="/aides/${profileSlug}/${slug}" style="font-size:13px;color:#666;background:#1a1a1a;padding:6px 12px;border-radius:999px">${name}</a>`
        ).join("")}
      </div>
    </div>
  </main>
  <footer>
    © 2026 Mecene · <a href="/">Accueil</a> · <a href="/mentions-legales">Mentions légales</a>
    <div style="margin-top:8px"><a href="/aides/${profileSlug}">Toutes les régions pour ${pm.labelPlural}</a></div>
  </footer>
</body>
</html>`;
}

// ─── Enregistrement des routes ────────────────────────────────────────────────

export function registerSeoRoutes(app: Express) {
  // Route par domaine + région
  app.get("/subventions/:domain/:region", async (req: Request, res: Response) => {
    const { domain, region: regionSlug } = req.params;

    if (!DOMAIN_META[domain]) return res.status(404).send("Domaine inconnu");
    const region = REGION_SLUGS[regionSlug];
    if (!region) return res.status(404).send("Région inconnue");

    try {
      const grantList = await getGrantsForPage(domain, region);
      const html = renderPage(domain, region, regionSlug, grantList);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
      return res.send(html);
    } catch (e) {
      console.error("SEO page error:", e);
      return res.status(500).send("Erreur serveur");
    }
  });

  // ── Routes profil (/aides/:profile/:region et /aides/:profile) ──────────────

  app.get("/aides/:profile/:region", async (req: Request, res: Response) => {
    const { profile, region: regionSlug } = req.params;
    const pm = PROFILE_META[profile];
    if (!pm) return res.status(404).send("Profil inconnu");
    const region = REGION_SLUGS[regionSlug];
    if (!region) return res.status(404).send("Région inconnue");

    try {
      const grantList = await getGrantsForPage(pm.domain, region);
      const html = renderProfilePage(profile, region, regionSlug, grantList);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
      return res.send(html);
    } catch (e) {
      console.error("SEO profile page error:", e);
      return res.status(500).send("Erreur serveur");
    }
  });

  app.get("/aides/:profile", (req: Request, res: Response) => {
    const { profile } = req.params;
    const pm = PROFILE_META[profile];
    if (!pm) return res.status(404).send("Profil inconnu");

    const regionLinks = Object.entries(REGION_SLUGS)
      .map(([slug, name]) => `<li><a href="/aides/${profile}/${slug}">Subvention ${pm.label} ${name}</a></li>`)
      .join("\n");

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Subvention ${esc(pm.label)} France 2026 — Aides et financements — Mecene</title>
  <meta name="description" content="Toutes les aides et subventions pour ${esc(pm.labelPlural)} en France. Financement par ${esc(pm.orgs)}. Matching IA gratuit en 3 minutes." />
  <link rel="canonical" href="https://subvention-match-production.up.railway.app/aides/${profile}" />
  <style>body{font-family:system-ui;background:#0a0a0a;color:#e8e8e8;max-width:800px;margin:0 auto;padding:40px 20px}a{color:#06D6A0}h1{font-size:36px;font-weight:900;margin-bottom:16px}ul{list-style:none;padding:0}li{padding:12px 0;border-bottom:1px solid #1f1f1f}li a{font-size:16px}</style>
</head>
<body>
  <div style="margin-bottom:24px"><a href="/">← Mecene</a></div>
  <h1>Subvention ${esc(pm.label)} par région</h1>
  <p style="color:#888;margin-bottom:32px">Financements pour ${esc(pm.labelPlural)} : ${esc(pm.orgs)}. Sélectionnez votre région.</p>
  <ul>${regionLinks}</ul>
  <div style="margin-top:40px;padding:24px;background:#111;border-radius:8px;text-align:center">
    <p style="margin-bottom:16px">Matching IA personnalisé pour ${esc(pm.labelPlural)} — 3 minutes</p>
    <a href="/form" style="background:#06D6A0;color:#0a0a0a;padding:12px 24px;border-radius:999px;font-weight:700">Lancer le matching gratuit →</a>
  </div>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.send(html);
  });

  // ── Routes domaine (/subventions/:domain) ─────────────────────────────────

  // Index domaine (ex: /subventions/musique)
  app.get("/subventions/:domain", (req: Request, res: Response) => {
    const { domain } = req.params;
    const dm = DOMAIN_META[domain];
    if (!dm) return res.status(404).send("Domaine inconnu");

    const regionLinks = Object.entries(REGION_SLUGS)
      .map(([slug, name]) => `<li><a href="/subventions/${domain}/${slug}">Subventions ${dm.label} ${name}</a></li>`)
      .join("\n");

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Subventions ${dm.label} France 2026 — Mecene</title>
  <meta name="description" content="Trouvez les subventions ${dm.labelLong} dans toutes les régions françaises. Mecene analyse 470+ aides culturelles." />
  <link rel="canonical" href="https://subvention-match-production.up.railway.app/subventions/${domain}" />
  <style>body{font-family:system-ui;background:#0a0a0a;color:#e8e8e8;max-width:800px;margin:0 auto;padding:40px 20px}a{color:#06D6A0}h1{font-size:36px;font-weight:900;margin-bottom:16px}ul{list-style:none;padding:0}li{padding:12px 0;border-bottom:1px solid #1f1f1f}li a{font-size:16px}</style>
</head>
<body>
  <div style="margin-bottom:24px"><a href="/">← Mecene</a></div>
  <h1>Subventions ${dm.label} par région</h1>
  <p style="color:#888;margin-bottom:32px">Sélectionnez votre région pour voir les aides disponibles.</p>
  <ul>${regionLinks}</ul>
  <div style="margin-top:40px;padding:24px;background:#111;border-radius:8px;text-align:center">
    <p style="margin-bottom:16px">Matching IA personnalisé — trouvez vos aides en 3 minutes</p>
    <a href="/form?domain=${domain}" style="background:#06D6A0;color:#0a0a0a;padding:12px 24px;border-radius:999px;font-weight:700">Lancer le matching →</a>
  </div>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.send(html);
  });
}
