#!/usr/bin/env node
// Génère une page HTML avec 7 boutons "Poster sur r/<sub>" pré-remplis.
// Ouvre scripts/reddit-launcher.html dans Chrome → tu cliques chaque bouton,
// Reddit s'ouvre avec titre + texte déjà remplis, tu valides "Post".
//
// Tous les posts utilisent le tone personnel d'Oscar (template v2 — validé sur
// r/MusiciensFrancophones) : title simple, parenthèse coûts, "Je l'ai appelé Mecene".

import { writeFileSync } from "fs";
import { resolve } from "path";

const TITLE = "J'ai fait un site pour trouver des subventions";
const URL_BASE = "https://subvention-match-production.up.railway.app";

// Template partagé. On ne swap que {identite}, {institutions}, {private_actors}, {source}.
const buildBody = ({ identite, institutions, private_actors, source }) => `Salut!

Je suis ${identite} (et un peu dev) et j'en avais marre de me taper des ${institutions} dispersés sur 30 sites, et de finir par rater des trucs faute de temps. Du coup j'ai utilisé claude pour scraper toutes les aides qui existent en France et je me suis dit que ça serait cool d'en faire profiter les autres.

Donc voilà vous êtes les bienvenus pour le tester gratos, j'espère qu'il trouvera des bails pour vous! Et si ça marche bien je pense ptet faire une boîte pour développer la recherche de ${private_actors} qui colleraient avec votre projet!

hésitez pas à me faire vos retours pour me dire si les aides proposées sont pertinentes c'est le plus important. (ça me coûte de l'argent à chaque formulaire pour que l'IA fasse la recherche du coup je dois limiter le nombre de testeurs)

Voici le lien pour tester le chercheur de subventions ! Je l'ai appelé Mecene : ${URL_BASE}/?source=${source}`;

const POSTS = [
  {
    sub: "MusiciensFrancophones",
    discipline: "Musique",
    title: TITLE,
    body: buildBody({
      identite: "musicien",
      institutions: "PDFs de la DRAC, des appels à projet ADAMI/Sacem/CNM",
      private_actors: "labels et agents d'artistes",
      source: "reddit-musiciensfrancophones",
    }),
    status: "posté J1 (2026-04-20)",
  },
  {
    sub: "Photographie",
    discipline: "Photo",
    title: TITLE,
    body: buildBody({
      identite: "photographe",
      institutions: "sites du CNAP, DRAC arts visuels, SAIF, ADAGP, fondations, résidences, prix Niépce/Nadar",
      private_actors: "galeries et agents photo",
      source: "reddit-photographie",
    }),
  },
  {
    sub: "Freelance_France",
    discipline: "Freelances créatifs",
    title: TITLE,
    body: buildBody({
      identite: "créatif freelance",
      institutions: "PDFs de la DRAC, CNL, CNAP, ADAMI, Sacem, fondations, résidences, bourses régionales",
      private_actors: "collectifs, galeries, labels et agents",
      source: "reddit-freelance-france",
    }),
  },
  {
    sub: "ecriture",
    discipline: "Écriture",
    title: TITLE,
    body: buildBody({
      identite: "dev dans le milieu culturel, j'ai plein de potes qui écrivent",
      institutions: "sites du CNL, SGDL, ADAGP, bourses régionales, résidences, prix littéraires",
      private_actors: "agents littéraires et éditeurs",
      source: "reddit-ecriture",
    }),
  },
  {
    sub: "dessin",
    discipline: "Illustration",
    title: TITLE,
    body: buildBody({
      identite: "illustrateur (et un peu dev)",
      institutions: "sites de l'ADAGP, CNAP, fondations, prix d'illustration, résidences, bourses régionales",
      private_actors: "galeries, agents et éditeurs",
      source: "reddit-dessin",
    }),
  },
  {
    sub: "bd",
    discipline: "BD",
    title: TITLE,
    body: buildBody({
      identite: "dev mais je lis beaucoup de BD",
      institutions: "sites du CNL, SGDL, ADAGP, fondations, Maison des Auteurs d'Angoulême, prix d'édition, résidences",
      private_actors: "éditeurs, agents et festivals",
      source: "reddit-bd",
    }),
  },
  {
    sub: "cinemaFR",
    discipline: "Cinéma",
    title: TITLE,
    body: buildBody({
      identite: "dev dans le visuel, j'ai des potes cinéastes",
      institutions: "aides CNC (écriture/développement/production/distribution), fonds régionaux, fondations, Creative Europe MEDIA",
      private_actors: "producteurs, agents et sélectionneurs de festivals",
      source: "reddit-cinemafr",
    }),
  },
];

const buildUrl = (sub, title, body) =>
  `https://www.reddit.com/r/${sub}/submit?type=TEXT&title=${encodeURIComponent(title)}&text=${encodeURIComponent(body)}`;

const cards = POSTS.map((p, i) => `
  <div class="card ${p.status ? "done" : ""}">
    <div class="day">J${i + 1}</div>
    <div class="content">
      <div class="sub">r/${p.sub}</div>
      <div class="discipline">${p.discipline}${p.status ? ` · <span class="tag">${p.status}</span>` : ""}</div>
      <div class="title">${p.title.replace(/</g, "&lt;")}</div>
      ${p.status
        ? `<span class="posted">✓ Posté</span>`
        : `<a class="btn" href="${buildUrl(p.sub, p.title, p.body)}" target="_blank">📝 Ouvrir Reddit pré-rempli</a>`}
      <details>
        <summary>Voir le texte du post</summary>
        <pre>${p.body.replace(/</g, "&lt;")}</pre>
      </details>
    </div>
  </div>
`).join("");

const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Reddit Launcher — Campagne SubventionMatch</title>
<style>
  body { font-family: -apple-system, system-ui, sans-serif; max-width: 900px; margin: 0 auto; padding: 24px; background: #0d0d0d; color: #e8e8e8; }
  h1 { font-size: 24px; margin-bottom: 8px; }
  .lead { color: #888; margin-bottom: 32px; line-height: 1.5; }
  .card { display: flex; background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; padding: 18px; margin-bottom: 16px; gap: 18px; }
  .card.done { opacity: 0.5; }
  .day { font-size: 22px; font-weight: 700; color: #ff4500; min-width: 48px; text-align: center; padding-top: 4px; }
  .content { flex: 1; }
  .sub { font-size: 16px; font-weight: 600; }
  .discipline { font-size: 12px; color: #888; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
  .tag { color: #06D6A0; text-transform: none; font-weight: 600; }
  .title { font-size: 15px; margin: 8px 0 12px; line-height: 1.4; }
  .btn { display: inline-block; background: #ff4500; color: white; padding: 10px 18px; border-radius: 999px; text-decoration: none; font-weight: 600; font-size: 14px; }
  .btn:hover { background: #ff5722; }
  .posted { display: inline-block; color: #06D6A0; font-weight: 600; font-size: 13px; }
  details { margin-top: 12px; }
  summary { cursor: pointer; color: #888; font-size: 12px; }
  pre { background: #0d0d0d; padding: 12px; border-radius: 6px; white-space: pre-wrap; font-family: ui-monospace, monospace; font-size: 12px; line-height: 1.5; color: #ccc; margin-top: 8px; }
  .reminder { background: #1a1a1a; border-left: 3px solid #ff4500; padding: 12px 16px; margin: 24px 0; font-size: 13px; line-height: 1.6; }
</style>
</head>
<body>
  <h1>🚀 Campagne Reddit — SubventionMatch</h1>
  <p class="lead">7 subs, 1 par jour. Clique sur le bouton, vérifie le post pré-rempli sur Reddit, valide. Ne poste qu'un sub par jour pour éviter le filtre anti-spam Reddit.</p>

  <div class="reminder">
    <strong>Règles d'or</strong> : 1 sub / jour max · répondre aux commentaires sous 24h · heures FR : 8-10h ou 19-21h · ne pas oublier de te connecter à Reddit avant de cliquer.
  </div>

  ${cards}

  <p class="lead" style="margin-top:32px; font-size: 12px;">Tracking conversion : <a href="${URL_BASE}/admin" style="color:#ff4500">/admin → Sources d'acquisition</a></p>
</body>
</html>`;

const outPath = resolve(process.cwd(), "scripts/reddit-launcher.html");
writeFileSync(outPath, html);
console.log("✓ Generated:", outPath);
console.log("Open:", `file:///${outPath.replace(/\\/g, "/")}`);
