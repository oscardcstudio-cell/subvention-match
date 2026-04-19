#!/usr/bin/env node
// Génère une page HTML avec 8 boutons "Poster sur r/<sub>" pré-remplis.
// Ouvre scripts/reddit-launcher.html dans Chrome → tu cliques chaque bouton,
// Reddit s'ouvre avec titre + texte déjà remplis, tu valides "Post".

import { writeFileSync } from "fs";
import { resolve } from "path";

const POSTS = [
  {
    sub: "MusiciensFrancophones",
    discipline: "Musique",
    title: "J'ai fait un outil qui mâche le boulot des aides culturelles, vous me dites si c'est utile ?",
    body: `Salut la commu !

Je suis musicien (et un peu dev) et j'en avais marre de me taper des PDFs de la DRAC, des appels à projet ADAMI/Sacem/CNM dispersés sur 30 sites, et de finir par rater des trucs faute de temps.

J'ai monté un outil simple : tu remplis ton profil en 3 min (statut, projet, région), une IA croise avec ~870 dispositifs de financement français (subventions, bourses, résidences, prix), et tu ressors avec une short-list pertinente + un PDF dossier prêt-à-envoyer.

C'est en **beta gratuite**, limité à 150 testeurs (objectif : recueillir des retours, pas vendre). Pas d'inscription, juste ton email à la fin pour recevoir tes résultats.

Si vous testez, ce qui m'intéresse vraiment c'est : est-ce que les aides proposées sont **réellement adaptées** à votre profil, ou est-ce que ça envoie n'importe quoi ? Tout retour bienvenu.

👉 https://mecene.cool/?source=reddit-musiciensfrancophones

(Mods : si je suis hors-sujet, dites-le, je supprime sans souci.)`,
  },
  {
    sub: "ecriture",
    discipline: "Écriture / littérature",
    title: "Outil gratuit pour trouver les bourses/résidences d'écriture (CNL, SGDL, régions…) — beta, retours bienvenus",
    body: `Salut,

Petit projet perso que je partage en beta : un matcher de financements pour auteurs / écrivains indépendants (CNL, SGDL, ADAGP, bourses régionales, résidences, prix, appels à projet éditeurs).

Concrètement : 3 min de profilage (genre, projet en cours, statut, région), une IA filtre ~870 dispositifs français, tu ressors avec ce qui colle vraiment à ton parcours + un PDF dossier prêt-à-envoyer.

J'ai galéré pendant des années à savoir ce qui existait au-delà du CNL — entre les bourses régionales mal référencées, les résidences en province qu'on découvre 3 mois trop tard, les appels à projet d'éditeurs jamais centralisés. L'idée c'est d'arrêter ça.

**Beta gratuite, 150 places**, juste ton email à la fin. Pas de pub, pas de revente.

👉 https://mecene.cool/?source=reddit-ecriture

Le retour qui m'aiderait le plus : est-ce que tu trouves au moins UNE opportunité que tu ne connaissais pas ?

(Mods : si je suis hors-sujet, dites-le, je supprime sans souci.)`,
  },
  {
    sub: "Photographie",
    discipline: "Photo",
    title: "Outil gratuit pour matcher bourses/résidences photo (CNAP, fondations, régions) — beta",
    body: `Hello les photographes,

Je partage un side-project en beta : un matcher de financements pour photographes indépendants français.

3 min de profilage (statut intermittent / auteur / micro-entrepreneur, type de projet — documentaire, fiction, plasticien, presse —, région, urgence), une IA croise avec ~870 dispositifs (CNAP, DRAC, fondations privées, résidences, bourses régionales, programmes EU…) et te sort une short-list ciblée + PDF dossier.

Pas de Brouillon Project éparpillé, pas de PDF à parcourir un par un sur les sites des régions.

**Beta gratuite, 150 places**, juste ton email à la fin.

👉 https://mecene.cool/?source=reddit-photographie

Si tu testes, le retour qui me sert vraiment : est-ce que les aides proposées sont **adaptées** à ton profil photo ou ça part en cacahuète ?

(Mods : si HS, ping-moi, je supprime.)`,
  },
  {
    sub: "dessin",
    discipline: "Illustration / arts visuels",
    title: "Beta d'un outil pour trouver bourses/résidences/appels à projet en illustration — vos retours ?",
    body: `Hello,

Side-project en beta : matcher de financements pour illustrateurs / dessinateurs / artistes visuels indépendants.

3 min de profilage (illustration jeunesse, BD, presse, art contemporain, animation, etc. + statut + région), l'IA croise avec ~870 dispositifs (ADAGP, CNAP, fondations, prix d'illustration, résidences, bourses régionales, appels d'éditeurs).

Pour le moment c'est en beta gratuite, 150 places. Juste ton email à la fin pour recevoir les résultats par mail + un PDF dossier.

👉 https://mecene.cool/?source=reddit-dessin

Le retour qui me sert : est-ce que les aides matchent ton style/parcours, ou ça te propose des trucs à côté ?

(Mods : si HS, supprimez sans souci.)`,
  },
  {
    sub: "bd",
    discipline: "BD",
    title: "Outil pour matcher bourses/aides BD (CNL, SGDL, fondations, festivals…) — beta gratuite",
    body: `Salut la commu BD,

J'ai monté en beta un outil qui matche le profil d'un·e auteur·ice BD avec les financements français disponibles : CNL (bourses création/résidence/découverte), SGDL, ADAGP, fondations privées, prix d'édition, résidences (MEL, Maison des Auteurs Angoulême, etc.), appels d'éditeurs.

3 min de profilage (genre BD, statut auteur, région, projet en cours), l'IA filtre ~870 dispositifs et te sort ce qui te concerne + PDF dossier.

**Beta gratuite, 150 places**, juste l'email à la fin.

👉 https://mecene.cool/?source=reddit-bd

Retour le plus utile : est-ce qu'il manque une aide BD majeure que tu connais et qui n'apparaît pas chez moi ?

(Mods : si HS, je supprime.)`,
  },
  {
    sub: "cinemaFR",
    discipline: "Cinéma",
    title: "Beta d'un outil pour trouver aides ciné (CNC, régions, fondations) — vos retours ?",
    body: `Hello,

Side-project en beta : matcher de financements pour cinéastes / réalisateur·ices / scénaristes indépendants.

3 min de profilage (court / long / doc / animation, statut, région, étape du projet), l'IA croise avec ~870 dispositifs (CNC — aides écriture / développement / production / distribution, fonds régionaux, fondations, programmes EU type Creative Europe MEDIA).

Pour le moment c'est gratuit (beta 150 places), juste l'email à la fin.

👉 https://mecene.cool/?source=reddit-cinemafr

Retour qui m'aiderait : est-ce que l'outil propose des aides au bon stade de ton projet (écriture vs production vs distribution) ?

(Mods : si HS, ping-moi, je supprime.)`,
  },
  {
    sub: "AutoEntrepreneur",
    discipline: "Multi-disciplines micro",
    title: "Outil gratuit pour matcher subventions culturelles si tu es créatif en micro-entreprise",
    body: `Salut,

Beaucoup de créatif·ves ici sont en micro (illustrateurs, photographes, vidéastes, musiciens, formateurs, etc.). Souvent on rate les subventions / bourses / aides parce que c'est éclaté entre 30 portails (DRAC, CNAP, ADAGP, ADAMI, Sacem, fondations, EU, régions).

J'ai monté un outil en beta : 3 min de profilage (statut micro-entrepreneur, domaine, projet, région), l'IA filtre ~870 dispositifs et te sort une short-list adaptée + un PDF dossier prêt-à-envoyer.

**Gratuit, beta 150 places**, juste l'email à la fin.

👉 https://mecene.cool/?source=reddit-autoentrepreneur

Retour qui m'intéresse : est-ce que les aides proposées sont vraiment compatibles avec un statut micro (vs. demander une asso ou un SIRET commercial) ?

(Mods : si HS, je supprime.)`,
  },
  {
    sub: "Freelance_France",
    discipline: "Multi-disciplines freelance",
    title: "Outil gratuit pour matcher subventions culturelles sur ton profil — beta, retours bienvenus",
    body: `Hello,

Je partage un projet perso que j'ai lancé en beta : un matcher de subventions culturelles françaises pour artistes/créatifs indépendants (musique, écriture, cinéma, arts visuels, BD, etc.).

Tu remplis ton profil (statut intermittent / auteur / micro-entrepreneur / salarié, projet, région, urgence), l'IA filtre ~870 dispositifs (DRAC, CNC, Sacem, ADAMI, fondations, EU, régions…), tu ressors avec ce qui te concerne réellement + un PDF dossier exportable.

**Beta gratuite, 150 places**, juste ton email pour recevoir les résultats. Pas de pub, pas de revente d'email, je veux juste comprendre si l'outil sert à quelque chose.

Si ça t'intéresse : https://mecene.cool/?source=reddit-freelance-france

Retour le plus utile pour moi : est-ce que tu trouves au moins UNE aide que tu n'aurais pas trouvée seul·e en cherchant à la main ?`,
  },
];

const buildUrl = (sub, title, body) =>
  `https://www.reddit.com/r/${sub}/submit?type=TEXT&title=${encodeURIComponent(title)}&text=${encodeURIComponent(body)}`;

const cards = POSTS.map((p, i) => `
  <div class="card">
    <div class="day">J${i + 1}</div>
    <div class="content">
      <div class="sub">r/${p.sub}</div>
      <div class="discipline">${p.discipline}</div>
      <div class="title">${p.title.replace(/</g, "&lt;")}</div>
      <a class="btn" href="${buildUrl(p.sub, p.title, p.body)}" target="_blank">📝 Ouvrir Reddit pré-rempli</a>
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
  .day { font-size: 22px; font-weight: 700; color: #ff4500; min-width: 48px; text-align: center; padding-top: 4px; }
  .content { flex: 1; }
  .sub { font-size: 16px; font-weight: 600; }
  .discipline { font-size: 12px; color: #888; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
  .title { font-size: 15px; margin: 8px 0 12px; line-height: 1.4; }
  .btn { display: inline-block; background: #ff4500; color: white; padding: 10px 18px; border-radius: 999px; text-decoration: none; font-weight: 600; font-size: 14px; }
  .btn:hover { background: #ff5722; }
  details { margin-top: 12px; }
  summary { cursor: pointer; color: #888; font-size: 12px; }
  pre { background: #0d0d0d; padding: 12px; border-radius: 6px; white-space: pre-wrap; font-family: ui-monospace, monospace; font-size: 12px; line-height: 1.5; color: #ccc; margin-top: 8px; }
  .reminder { background: #1a1a1a; border-left: 3px solid #ff4500; padding: 12px 16px; margin: 24px 0; font-size: 13px; line-height: 1.6; }
</style>
</head>
<body>
  <h1>🚀 Campagne Reddit — SubventionMatch</h1>
  <p class="lead">8 subs, 1 par jour. Clique sur le bouton, vérifie le post pré-rempli sur Reddit, valide. Ne poste qu'un sub par jour pour éviter le filtre anti-spam Reddit.</p>

  <div class="reminder">
    <strong>Règles d'or</strong> : 1 sub / jour max · répondre aux commentaires sous 24h · heures FR : 8-10h ou 19-21h · ne pas oublier de te connecter à Reddit avant de cliquer (sinon t'auras une page de login d'abord).
  </div>

  ${cards}

  <p class="lead" style="margin-top:32px; font-size: 12px;">Tracking conversion : <a href="http://localhost:5000/admin?admin_token=YOUR_TOKEN" style="color:#ff4500">/admin → Sources d'acquisition</a></p>
</body>
</html>`;

const outPath = resolve(process.cwd(), "scripts/reddit-launcher.html");
writeFileSync(outPath, html);
console.log("✓ Generated:", outPath);
console.log("Open in browser:", `file:///${outPath.replace(/\\/g, "/")}`);
