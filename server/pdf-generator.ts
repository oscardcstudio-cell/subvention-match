import puppeteer from 'puppeteer';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import type { Grant, FormSubmission } from '../shared/schema';
import { resolveApplicationUrls, type ApplicationUrl } from './url-fallback';
import { calculateQualityScore } from './quality-gate';

interface GrantWithMatch extends Grant {
  matchScore?: number;
  matchReason?: string;
}

/**
 * Snapshot du profil utilisateur pour le rappel en haut du PDF.
 * Inclut TOUS les champs matching-pertinents pour que l'utilisateur puisse,
 * en relisant le PDF des semaines plus tard, retrouver instantanément le
 * contexte de quel projet il a soumis.
 */
interface FormData {
  // Profil
  status?: string[];
  statusOther?: string;
  artisticDomain?: string[];
  artisticDomainOther?: string;
  age?: number;

  // Projet
  projectDescription?: string;
  projectType?: string[];
  projectTypeOther?: string;
  projectStage?: string;

  // Localisation
  region: string;
  isInternational?: string;

  // Spécificités
  innovation?: string[];
  innovationOther?: string;
  socialDimension?: string[];
  socialDimensionOther?: string;

  // Besoins
  urgency?: string;
  aidTypes?: string[];
  aidTypesOther?: string;
  geographicScope?: string[];

  email: string;
}

interface PDFData {
  grants: GrantWithMatch[];
  userEmail: string;
  formData?: FormData;
}

/**
 * Convertit une FormSubmission (DB) en FormData (PDF).
 * Centralise le mapping pour éviter qu'il dérive entre les ~5 endroits où on
 * génère un PDF. Quand on ajoute un champ au formulaire, on n'a qu'à
 * l'ajouter ici.
 */
export function submissionToPdfFormData(submission: FormSubmission): FormData {
  return {
    status: submission.status ?? undefined,
    statusOther: submission.statusOther ?? undefined,
    artisticDomain: submission.artisticDomain ?? undefined,
    artisticDomainOther: submission.artisticDomainOther ?? undefined,
    age: submission.age ?? undefined,
    projectDescription: submission.projectDescription ?? undefined,
    projectType: submission.projectType ?? undefined,
    projectTypeOther: submission.projectTypeOther ?? undefined,
    projectStage: submission.projectStage ?? undefined,
    region: submission.region,
    isInternational: submission.isInternational ?? undefined,
    innovation: submission.innovation ?? undefined,
    innovationOther: submission.innovationOther ?? undefined,
    socialDimension: submission.socialDimension ?? undefined,
    socialDimensionOther: submission.socialDimensionOther ?? undefined,
    urgency: submission.urgency ?? undefined,
    aidTypes: submission.aidTypes ?? undefined,
    aidTypesOther: submission.aidTypesOther ?? undefined,
    geographicScope: submission.geographicScope ?? undefined,
    email: submission.email,
  };
}

export async function generateGrantsPDF(data: PDFData): Promise<Buffer> {
  // Résoudre la cascade URL (improvedUrl → url alive → mailto → Google) AVANT
  // la génération du HTML. Test HTTP HEAD en parallèle, ~500ms total pour 5-10 grants.
  console.log('🔗 Résolution des URLs d\'application en parallèle...');
  const applicationUrls = await resolveApplicationUrls(data.grants);

  // Prefer an OS-installed Chromium (Docker / Railway) via PUPPETEER_EXECUTABLE_PATH,
  // otherwise fall back to the Chrome bundled with puppeteer (local dev).
  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || undefined;

  const browser = await puppeteer.launch({
    headless: true,
    executablePath,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  try {
    const page = await browser.newPage();

    // Generate HTML from template (avec URLs résolues)
    const html = generatePDFHTML(data, applicationUrls);
    
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Marges à 0 pour que le fond dark Mecene aille jusqu'au bord (pas de
    // cadre blanc). Le padding visuel est géré par .container en CSS.
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

export async function generateAndSaveGrantsPDF(data: PDFData, sessionId: string): Promise<{ buffer: Buffer; path: string }> {
  const pdfBuffer = await generateGrantsPDF(data);

  // Save PDF to an ephemeral tmp dir. On Railway the container filesystem is
  // not persistent — PDFs here are only a short-term cache so we don't
  // regenerate them if the user re-triggers the same email. For durable
  // storage we should eventually upload to Supabase Storage or S3.
  const dir = process.env.PDF_OUTPUT_DIR || "/tmp/subvention-pdfs";
  const { mkdir } = await import("fs/promises");
  await mkdir(dir, { recursive: true });

  const filename = `grants_${sessionId}_${Date.now()}.pdf`;
  const pdfPath = join(dir, filename);

  await writeFile(pdfPath, pdfBuffer);

  return {
    buffer: pdfBuffer,
    path: pdfPath,
  };
}

function formatAmount(grant: GrantWithMatch): string {
  if (grant.amountMin && grant.amountMax) {
    return `${grant.amountMin.toLocaleString()} - ${grant.amountMax.toLocaleString()} €`;
  } else if (grant.amount) {
    return `${grant.amount.toLocaleString()} €`;
  }
  return "Variable selon dossier";
}

/**
 * Rendu transparent de la deadline.
 * Couvre tous les cas : date future, date passée + récurrence, juste une fréquence,
 * ou rien du tout (on dit honnêtement "à confirmer").
 */
function formatDeadlineLine(grant: GrantWithMatch): string {
  const today = new Date();

  if (grant.deadline) {
    try {
      const deadlineDate = new Date(grant.deadline);
      if (!isNaN(deadlineDate.getTime())) {
        if (deadlineDate >= today) {
          return `Jusqu'au ${grant.deadline}`;
        }
        // Date passée → on bascule sur la fréquence si dispo
        if (grant.frequency && grant.frequency.trim() !== '') {
          return `Session passée — appel ${grant.frequency.toLowerCase()}, prochaine session à confirmer`;
        }
        return `Dernière session : ${grant.deadline} — prochaine session à confirmer auprès de l'organisme`;
      }
    } catch {
      // Format de date non parsable → on affiche tel quel
      return grant.deadline;
    }
  }

  if (grant.frequency && grant.frequency.trim() !== '') {
    return `Appel ${grant.frequency.toLowerCase()} — date du prochain dépôt à confirmer`;
  }

  return `Date à confirmer auprès de l'organisme`;
}

function formatHTMLContent(content: string, maxLength?: number): string {
  // Si maxLength est défini, tronquer intelligemment le contenu
  if (maxLength) {
    const plainText = content.replace(/<[^>]*>/g, '').trim();
    
    if (plainText.length > maxLength) {
      // Trouver un bon point de coupe (à la fin d'une phrase)
      let cutPoint = maxLength;
      const nextPeriod = plainText.indexOf('.', cutPoint);
      const nextExclamation = plainText.indexOf('!', cutPoint);
      const nextQuestion = plainText.indexOf('?', cutPoint);
      
      const candidates = [nextPeriod, nextExclamation, nextQuestion].filter(p => p > 0 && p < cutPoint + 100);
      if (candidates.length > 0) {
        cutPoint = Math.min(...candidates) + 1;
      }
      
      // Tronquer le HTML
      content = content.substring(0, cutPoint) + '...';
    }
  }
  
  // Simple HTML formatting for PDF — couleurs alignées sur le thème Mecene
  // Swiss Dark. Contraste élevé (#F5F5F6 texte, #FFFFFF en gras) pour rester
  // lisible sur le fond #0A0A0A.
  let formatted = content;

  // Replace headings
  formatted = formatted.replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi,
    '<h3 style="font-family: Archivo, sans-serif; font-weight: 800; color: #F5F5F6; margin: 18px 0 10px 0; font-size: 16px; letter-spacing: -0.02em; text-transform: uppercase;">$1</h3>');

  // Replace paragraphs
  formatted = formatted.replace(/<p[^>]*>(.*?)<\/p>/gi,
    '<p style="margin-bottom: 10px; line-height: 1.7; color: #E5E5E7; font-size: 13px;">$1</p>');

  // Replace list items
  formatted = formatted.replace(/<li[^>]*>(.*?)<\/li>/gi,
    '<li style="margin-bottom: 8px; padding-left: 20px; position: relative; color: #E5E5E7; font-size: 13px; line-height: 1.6;"><span style="position: absolute; left: 0; color: #06D6A0; font-weight: bold;">→</span>$1</li>');

  // Replace ul/ol
  formatted = formatted.replace(/<ul[^>]*>/gi, '<ul style="margin: 10px 0; padding-left: 0; list-style: none;">');
  formatted = formatted.replace(/<ol[^>]*>/gi, '<ul style="margin: 10px 0; padding-left: 0; list-style: none;">');
  formatted = formatted.replace(/<\/ol>/gi, '</ul>');

  // Replace strong/b
  formatted = formatted.replace(/<(strong|b)[^>]*>(.*?)<\/(strong|b)>/gi,
    '<strong style="font-weight: 700; color: #FFFFFF;">$2</strong>');

  // Replace br
  formatted = formatted.replace(/<br\s*\/?>/gi, '<br>');

  // If still has HTML, it's good. If not, wrap in paragraph
  if (!formatted.includes('<')) {
    formatted = `<p style="margin-bottom: 8px; line-height: 1.75; color: #E5E5E7; font-size: 13px;">${formatted}</p>`;
  }

  return formatted;
}

function generatePDFHTML(data: PDFData, applicationUrls: Map<string, ApplicationUrl>): string {
  const { grants, userEmail, formData } = data;
  
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Vos Subventions — Mecene</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Archivo:wght@400;500;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
      <style>
        /* === Mecene Swiss Dark — tokens === */
        /* Contraste relevé par rapport au site : sur un PDF on lit sans
           lumière émise par l'écran, les gris paraissent plus ternes.
           --mc-muted passe de #8B8B92 à #B5B5BC pour rester lisible. */
        :root {
          --mc-bg: #0A0A0A;
          --mc-panel: #141416;
          --mc-panel-2: #1A1A1D;
          --mc-border: #2E2E33;
          --mc-border-soft: #1C1C1F;
          --mc-text: #F5F5F6;
          --mc-text-2: #E5E5E7;
          --mc-muted: #B5B5BC;
          --mc-muted-2: #7D7D84;
          --mc-primary: #06D6A0;
          --mc-primary-soft: rgba(6, 214, 160, 0.12);
          --mc-accent: #3BB3DB;
          --mc-accent-soft: rgba(59, 179, 219, 0.15);
          --mc-warn: #FFD166;
          --mc-danger: #EF476F;
        }

        @page { margin: 0; size: A4; }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        html, body {
          background: var(--mc-bg);
          min-height: 100%;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: var(--mc-text);
          line-height: 1.6;
          font-size: 13px;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .mc-display {
          font-family: 'Archivo', sans-serif;
          font-weight: 900;
          letter-spacing: -0.035em;
          line-height: 0.88;
        }
        .mc-mono {
          font-family: 'JetBrains Mono', monospace;
        }

        .container {
          max-width: 820px;
          margin: 0 auto;
          /* 15mm ≈ 57px top/bottom, 12mm ≈ 45px left/right pour l'espace
             respiratoire, maintenant que les marges A4 sont à 0. */
          padding: 57px 45px;
        }

        /* Header */
        .header {
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--mc-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-family: 'Archivo', sans-serif;
          font-weight: 900;
          letter-spacing: -0.035em;
          font-size: 22px;
          color: var(--mc-text);
        }

        .logo .dot { color: var(--mc-primary); }

        .header-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--mc-muted);
        }

        /* Title */
        .section-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--mc-primary);
          margin-bottom: 18px;
        }

        .title-section {
          margin-bottom: 45px;
        }

        .main-title {
          font-family: 'Archivo', sans-serif;
          font-weight: 900;
          font-size: 72px;
          line-height: 0.88;
          letter-spacing: -0.035em;
          margin-bottom: 16px;
          color: var(--mc-text);
          text-transform: uppercase;
        }

        .main-title .dot { color: var(--mc-primary); }

        .main-subtitle {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--mc-muted);
        }

        /* Form Summary */
        .form-summary {
          background: var(--mc-panel);
          border: 1px solid var(--mc-border);
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 40px;
          page-break-inside: avoid;
        }

        .form-summary-title {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--mc-primary);
          margin-bottom: 20px;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--mc-border);
        }

        .form-field {
          margin-bottom: 16px;
        }

        .form-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          text-transform: uppercase;
          color: var(--mc-muted);
          letter-spacing: 0.15em;
          margin-bottom: 6px;
          font-weight: 500;
          display: block;
        }

        .form-value {
          font-size: 13px;
          color: var(--mc-text);
          line-height: 1.6;
        }

        .form-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 6px;
        }

        .form-tag {
          display: inline-flex;
          align-items: center;
          background: var(--mc-primary-soft);
          color: var(--mc-primary);
          border: 1px solid rgba(6, 214, 160, 0.3);
          padding: 3px 10px;
          border-radius: 999px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.05em;
        }

        .project-description-block {
          background: var(--mc-panel-2);
          border: 1px solid var(--mc-border);
          border-left: 3px solid var(--mc-primary);
          padding: 16px 18px;
          margin-bottom: 18px;
          border-radius: 0 8px 8px 0;
        }

        .project-description-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          text-transform: uppercase;
          color: var(--mc-primary);
          letter-spacing: 0.2em;
          margin-bottom: 10px;
          font-weight: 500;
        }

        .project-description-text {
          font-size: 14px;
          color: var(--mc-text);
          line-height: 1.6;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px 28px;
        }

        .form-field-other {
          font-size: 11px;
          color: var(--mc-muted);
          font-style: italic;
          margin-top: 4px;
        }

        /* Grant Card */
        .grant-card {
          background: var(--mc-panel);
          border: 1px solid var(--mc-border);
          border-radius: 12px;
          margin-bottom: 24px;
          page-break-inside: avoid;
          overflow: hidden;
        }

        .grant-card-header {
          padding: 24px;
          border-bottom: 1px solid var(--mc-border);
        }

        .grant-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 14px;
        }

        .grant-info { flex: 1; }

        .match-badge {
          display: inline-flex;
          align-items: center;
          background: var(--mc-accent-soft);
          color: var(--mc-accent);
          border: 1px solid rgba(17, 138, 178, 0.3);
          padding: 3px 10px;
          border-radius: 999px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.05em;
          margin-bottom: 10px;
        }

        .grant-title {
          font-family: 'Archivo', sans-serif;
          font-weight: 900;
          font-size: 26px;
          line-height: 1.0;
          letter-spacing: -0.035em;
          color: var(--mc-text);
          margin-bottom: 10px;
          text-transform: uppercase;
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
          word-break: break-word;
        }

        .grant-organization {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 500;
          color: var(--mc-muted);
          text-transform: uppercase;
          letter-spacing: 0.2em;
        }

        .amount-box {
          text-align: right;
          flex-shrink: 0;
          max-width: 150px;
        }

        .amount-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          text-transform: uppercase;
          color: var(--mc-muted);
          letter-spacing: 0.2em;
          margin-bottom: 6px;
        }

        .amount-value {
          font-family: 'Archivo', sans-serif;
          font-weight: 800;
          font-size: 16px;
          color: var(--mc-primary);
          line-height: 1.2;
          letter-spacing: -0.02em;
        }

        .deadline-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--mc-muted);
          margin-bottom: 14px;
        }

        .match-reason {
          background: var(--mc-primary-soft);
          border-left: 2px solid var(--mc-primary);
          padding: 12px 14px;
          font-size: 13px;
          color: var(--mc-text);
          line-height: 1.6;
          border-radius: 0 4px 4px 0;
        }

        .grant-details {
          padding: 24px;
        }

        .detail-section {
          margin-bottom: 26px;
        }

        .detail-section:last-child { margin-bottom: 0; }

        .section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .section-title {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          text-transform: uppercase;
          color: var(--mc-primary);
          letter-spacing: 0.2em;
          font-weight: 500;
          margin-bottom: 12px;
          display: inline-block;
        }

        .section-content {
          font-size: 13px;
          color: var(--mc-text-2);
          line-height: 1.75;
        }

        .section-content p { margin-bottom: 10px; color: var(--mc-text-2); }
        .section-content strong { font-weight: 700; color: var(--mc-text); }

        .section-content ul {
          margin: 10px 0;
          padding-left: 0;
          list-style: none;
        }

        .section-content li {
          margin-bottom: 8px;
          padding-left: 20px;
          position: relative;
          color: var(--mc-text-2);
        }

        .section-content li::before {
          content: "→";
          color: var(--mc-primary);
          position: absolute;
          left: 0;
          font-weight: 700;
        }

        /* Stats Box */
        .stats-box {
          background: var(--mc-panel-2);
          border: 1px solid var(--mc-border);
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .stat-item { text-align: center; }

        .stat-value {
          font-family: 'Archivo', sans-serif;
          font-weight: 800;
          font-size: 18px;
          color: var(--mc-text);
          margin-bottom: 6px;
          letter-spacing: -0.02em;
        }

        .stat-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          text-transform: uppercase;
          color: var(--mc-muted);
          letter-spacing: 0.15em;
        }

        /* Apply Button */
        .apply-section {
          padding-top: 20px;
          border-top: 1px solid var(--mc-border);
          margin-top: 20px;
        }

        .apply-button {
          background: var(--mc-primary);
          color: #0A0A0A;
          padding: 14px 22px;
          text-align: center;
          border-radius: 999px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          display: block;
          text-decoration: none;
        }

        /* Footer */
        .footer {
          margin-top: 48px;
          padding-top: 24px;
          border-top: 1px solid var(--mc-border);
          text-align: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--mc-muted-2);
        }

        .footer-email {
          color: var(--mc-muted);
          margin-top: 6px;
        }

        /* Beta feedback */
        .beta-feedback {
          margin-top: 40px;
          padding: 24px;
          background: rgba(255, 209, 102, 0.08);
          border: 1px solid rgba(255, 209, 102, 0.3);
          border-radius: 12px;
          text-align: center;
          page-break-inside: avoid;
        }
        .beta-feedback h3 {
          font-family: 'Archivo', sans-serif;
          font-weight: 800;
          font-size: 16px;
          color: var(--mc-warn);
          margin: 0 0 10px;
          text-transform: uppercase;
          letter-spacing: -0.02em;
        }
        .beta-feedback p {
          font-size: 12px;
          color: var(--mc-muted);
          margin: 0 0 16px;
          line-height: 1.6;
        }
        .beta-feedback a {
          display: inline-block;
          background: var(--mc-warn);
          color: #0A0A0A;
          padding: 10px 22px;
          border-radius: 999px;
          text-decoration: none;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }

        .info-missing {
          font-style: italic;
          color: var(--mc-muted);
          font-size: 12px;
          padding: 10px 14px;
          background: var(--mc-panel-2);
          border: 1px solid var(--mc-border);
          border-radius: 6px;
          line-height: 1.5;
        }

        .info-missing-amount {
          font-size: 12px;
          color: var(--mc-muted);
          font-weight: 500;
        }

        .contact-recommendation {
          background: rgba(255, 209, 102, 0.08);
          border: 1px solid rgba(255, 209, 102, 0.25);
          border-left: 3px solid var(--mc-warn);
          padding: 12px 14px;
          margin-bottom: 14px;
          font-size: 12px;
          color: var(--mc-text);
          border-radius: 0 6px 6px 0;
        }

        .contact-recommendation-title {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 500;
          margin-bottom: 6px;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--mc-warn);
        }

        .contact-recommendation a {
          color: var(--mc-warn);
          text-decoration: underline;
          word-break: break-all;
        }

        .apply-button-hint {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          color: var(--mc-muted);
          text-align: center;
          margin-top: 8px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }

        /* Variants — kind != direct */
        .apply-button-mailto {
          background: var(--mc-warn) !important;
          color: #0A0A0A !important;
        }
        .apply-button-search {
          background: var(--mc-panel-2) !important;
          color: var(--mc-text) !important;
          border: 1px solid var(--mc-border);
        }
        .apply-button-none {
          background: var(--mc-panel-2) !important;
          color: var(--mc-muted-2) !important;
          border: 1px solid var(--mc-border);
          cursor: not-allowed;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="logo">Mecene<span class="dot">.</span></div>
          <div class="header-tag">/ Rapport subventions</div>
        </div>

        <!-- Title -->
        <div class="title-section">
          <div class="section-label">/ 01 — Résultats pour votre projet</div>
          <div class="main-title">
            ${grants.length} match${grants.length > 1 ? 'es' : ''}<br>
            trouvé${grants.length > 1 ? 's' : ''}<span class="dot">.</span>
          </div>
          <div class="main-subtitle">Pour votre profil artistique</div>
        </div>

        <!-- Form Summary : rappel du profil + projet pour que l'utilisateur
             retrouve instantanément le contexte de ce dossier -->
        ${formData ? `
          <div class="form-summary">
            <div class="form-summary-title">/ 02 — Votre profil &amp; projet</div>

            <!-- DESCRIPTION DU PROJET : mise en avant car c'est l'élément central
                 qui permet à l'utilisateur de reconnaître son dossier -->
            ${formData.projectDescription ? `
              <div class="project-description-block">
                <div class="project-description-label">Description du projet</div>
                <div class="project-description-text">${formData.projectDescription}</div>
              </div>
            ` : ''}

            <!-- Champs courts en grille 2 colonnes -->
            <div class="form-grid">
              <div class="form-field">
                <span class="form-label">Région</span>
                <div class="form-value">${formData.region}</div>
              </div>

              ${formData.projectStage ? `
                <div class="form-field">
                  <span class="form-label">Stade du projet</span>
                  <div class="form-value">${formData.projectStage}</div>
                </div>
              ` : ''}

              ${formData.isInternational ? `
                <div class="form-field">
                  <span class="form-label">Dimension internationale</span>
                  <div class="form-value">${formData.isInternational === 'Oui' ? 'Oui' : 'Non'}</div>
                </div>
              ` : ''}

              ${formData.urgency ? `
                <div class="form-field">
                  <span class="form-label">Urgence</span>
                  <div class="form-value">${formData.urgency}</div>
                </div>
              ` : ''}

              ${formData.age ? `
                <div class="form-field">
                  <span class="form-label">Âge</span>
                  <div class="form-value">${formData.age} ans</div>
                </div>
              ` : ''}
            </div>

            <!-- Champs multi-tags pleine largeur, un par bloc -->
            ${formData.status && formData.status.length > 0 ? `
              <div class="form-field" style="margin-top: 14px;">
                <span class="form-label">Statut</span>
                <div class="form-tags">
                  ${formData.status.map(s => `<span class="form-tag">${s}</span>`).join('')}
                </div>
                ${formData.statusOther ? `<div class="form-field-other">Précision : ${formData.statusOther}</div>` : ''}
              </div>
            ` : ''}

            ${formData.artisticDomain && formData.artisticDomain.length > 0 ? `
              <div class="form-field">
                <span class="form-label">Domaine artistique</span>
                <div class="form-tags">
                  ${formData.artisticDomain.map(d => `<span class="form-tag">${d}</span>`).join('')}
                </div>
                ${formData.artisticDomainOther ? `<div class="form-field-other">Précision : ${formData.artisticDomainOther}</div>` : ''}
              </div>
            ` : ''}

            ${formData.projectType && formData.projectType.length > 0 ? `
              <div class="form-field">
                <span class="form-label">Type de projet</span>
                <div class="form-tags">
                  ${formData.projectType.map(p => `<span class="form-tag">${p}</span>`).join('')}
                </div>
                ${formData.projectTypeOther ? `<div class="form-field-other">Précision : ${formData.projectTypeOther}</div>` : ''}
              </div>
            ` : ''}

            ${formData.aidTypes && formData.aidTypes.length > 0 ? `
              <div class="form-field">
                <span class="form-label">Types d'aide recherchés</span>
                <div class="form-tags">
                  ${formData.aidTypes.map(a => `<span class="form-tag">${a}</span>`).join('')}
                </div>
                ${formData.aidTypesOther ? `<div class="form-field-other">Précision : ${formData.aidTypesOther}</div>` : ''}
              </div>
            ` : ''}

            ${formData.geographicScope && formData.geographicScope.length > 0 ? `
              <div class="form-field">
                <span class="form-label">Périmètre géographique</span>
                <div class="form-tags">
                  ${formData.geographicScope.map(g => `<span class="form-tag">${g}</span>`).join('')}
                </div>
              </div>
            ` : ''}

            ${formData.innovation && formData.innovation.length > 0 ? `
              <div class="form-field">
                <span class="form-label">Innovation</span>
                <div class="form-tags">
                  ${formData.innovation.map(i => `<span class="form-tag">${i}</span>`).join('')}
                </div>
                ${formData.innovationOther ? `<div class="form-field-other">Précision : ${formData.innovationOther}</div>` : ''}
              </div>
            ` : ''}

            ${formData.socialDimension && formData.socialDimension.length > 0 ? `
              <div class="form-field">
                <span class="form-label">Dimension sociale</span>
                <div class="form-tags">
                  ${formData.socialDimension.map(s => `<span class="form-tag">${s}</span>`).join('')}
                </div>
                ${formData.socialDimensionOther ? `<div class="form-field-other">Précision : ${formData.socialDimensionOther}</div>` : ''}
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- Grants -->
        ${grants.map((grant, index) => {
          const amount = formatAmount(grant);
          const hasNumericAmount = !!(grant.amount || grant.amountMin || grant.amountMax);
          const deadlineLine = formatDeadlineLine(grant);
          const quality = calculateQualityScore(grant);
          const appUrl = applicationUrls.get(grant.id);

          return `
            <div class="grant-card">
              <!-- Card Header -->
              <div class="grant-card-header">
                <div class="grant-header-row">
                  <div class="grant-info">
                    ${grant.matchScore ? `<div class="match-badge">${grant.matchScore}% match</div>` : ''}
                    <h2 class="grant-title">${grant.title}</h2>
                    <div class="grant-organization">${grant.organization}</div>
                  </div>
                  <div class="amount-box">
                    <div class="amount-label">Montant</div>
                    ${hasNumericAmount
                      ? `<div class="amount-value">${amount.replace(' - ', '<br>à ')}</div>`
                      : `<div class="amount-value info-missing-amount">${amount}<br><span style="font-weight: 400; font-size: 10px;">à confirmer</span></div>`
                    }
                  </div>
                </div>

                <div class="deadline-row">
                  ⤳ ${deadlineLine}
                </div>

                ${grant.matchReason ? `
                  <div class="match-reason">
                    ${grant.matchReason}
                  </div>
                ` : ''}
              </div>

              <!-- Card Details -->
              <div class="grant-details">

                <!-- Description -->
                <div class="detail-section">
                  <div class="section-header">
                    <span class="section-title">Description</span>
                  </div>
                  <div class="section-content">
                    ${quality.hasDescription && grant.description
                      ? formatHTMLContent(grant.description, 600)
                      : `<div class="info-missing">ℹ️ Description complète non disponible — consultez le site officiel ou contactez ${grant.organization} pour le détail de cette aide.</div>`
                    }
                  </div>
                </div>

                <!-- Eligibility -->
                <div class="detail-section">
                  <div class="section-header">
                    <span class="section-title">Critères d'éligibilité</span>
                  </div>
                  <div class="section-content">
                    ${quality.hasEligibility && grant.eligibility
                      ? formatHTMLContent(grant.eligibility, 600)
                      : `<div class="info-missing">⚠️ Critères d'éligibilité à vérifier auprès de ${grant.organization}. L'information n'a pas été publiée de manière exhaustive sur les sources publiques que nous consultons.</div>`
                    }
                  </div>
                </div>

                <!-- Requirements -->
                ${grant.requirements || (grant.obligatoryDocuments && grant.obligatoryDocuments.length > 0) ? `
                  <div class="detail-section">
                    <div class="section-header">
                      <span class="section-title">Dossier et Documents</span>
                    </div>
                    <div class="section-content">
                      ${grant.requirements ? formatHTMLContent(grant.requirements) : ''}
                      ${grant.obligatoryDocuments && grant.obligatoryDocuments.length > 0 ? `
                        <p><strong>Documents obligatoires :</strong></p>
                        <ul>
                          ${grant.obligatoryDocuments.map(doc => `<li>${doc}</li>`).join('')}
                        </ul>
                      ` : ''}
                    </div>
                  </div>
                ` : ''}

                <!-- Stats & Process -->
                <div class="stats-box">
                  <div class="stats-grid">
                    <div class="stat-item">
                      <div class="stat-label">Difficulté</div>
                      <div class="stat-value" style="font-size: 14px;">${grant.applicationDifficulty || 'Moyenne'}</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-label">Taux d'acceptation</div>
                      <div class="stat-value" style="font-size: 14px;">${grant.acceptanceRate ? grant.acceptanceRate + '%' : 'N/A'}</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-label">Délai réponse</div>
                      <div class="stat-value" style="font-size: 14px;">${grant.responseDelay || 'Variable'}</div>
                    </div>
                  </div>
                </div>

                <!-- Contact direct recommandé : affiché DÈS qu'on a un email contact
                     OU que l'URL n'est pas une page directe (homepage/mailto/search/none),
                     pour qu'il y ait toujours un chemin humain en backup. -->
                ${(grant.contactEmail && grant.contactEmail.includes('@')) || (appUrl && appUrl.kind !== 'direct') ? `
                  <div class="contact-recommendation">
                    <div class="contact-recommendation-title">Contact direct recommandé</div>
                    ${grant.contactEmail && grant.contactEmail.includes('@')
                      ? `Pour confirmer les modalités à jour : <a href="mailto:${grant.contactEmail}">${grant.contactEmail}</a>${grant.contactPhone ? ` — ${grant.contactPhone}` : ''}`
                      : `Les modalités évoluent régulièrement. Contactez ${grant.organization} pour confirmer les détails actuels avant de candidater.`
                    }
                  </div>
                ` : ''}

                <!-- Apply Button (cascade URL : direct → homepage → mailto → search → none) -->
                ${appUrl ? `
                  <div class="apply-section">
                    <a href="${appUrl.href}" class="apply-button apply-button-${appUrl.kind}">
                      ${appUrl.label}
                    </a>
                    ${appUrl.hint ? `<div class="apply-button-hint">${appUrl.hint}</div>` : ''}
                    ${appUrl.kind !== 'none' && appUrl.kind !== 'mailto' ? `
                      <div style="text-align: center; margin-top: 8px;">
                        <a href="${appUrl.href}" style="font-size: 10px; color: #6b7280; text-decoration: none; word-break: break-all;">
                          ${appUrl.href.length > 80 ? appUrl.href.substring(0, 80) + '…' : appUrl.href}
                        </a>
                      </div>
                    ` : ''}
                  </div>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}

        <!-- Beta feedback box -->
        <div class="beta-feedback">
          <h3>Mecene est en beta</h3>
          <p>
            Un résultat pertinent ? Une subvention mal matchée ? Une idée ?<br/>
            Votre retour nous aide à améliorer le matching pour tous les artistes.
          </p>
          <a href="https://subvention-match-production.up.railway.app/?feedback=1">Donner un retour →</a>
        </div>

        <!-- Footer -->
        <div class="footer">
          <div>© ${new Date().getFullYear()} Mecene — Tous droits réservés</div>
          <div class="footer-email">Document généré pour : ${userEmail}</div>
        </div>
      </div>
    </body>
    </html>
  `;
}
