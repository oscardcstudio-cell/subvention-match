import puppeteer from 'puppeteer';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import type { Grant } from '../shared/schema';

interface GrantWithMatch extends Grant {
  matchScore?: number;
  matchReason?: string;
}

interface FormData {
  status?: string[];
  artisticDomain?: string[];
  region: string;
  projectDescription?: string;
  projectType?: string[];
  projectStage?: string;
  isInternational?: string;
  urgency?: string;
  email: string;
}

interface PDFData {
  grants: GrantWithMatch[];
  userEmail: string;
  formData?: FormData;
}

export async function generateGrantsPDF(data: PDFData): Promise<Buffer> {
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
    
    // Generate HTML from template
    const html = generatePDFHTML(data);
    
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Generate PDF with same styling as website
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm',
      },
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

function formatAmount(grant: Grant): string {
  if (grant.amountMin && grant.amountMax) {
    return `${grant.amountMin.toLocaleString()} - ${grant.amountMax.toLocaleString()} €`;
  } else if (grant.amount) {
    return `${grant.amount.toLocaleString()} €`;
  }
  return "Montant variable";
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
  
  // Simple HTML formatting for PDF without external dependencies
  let formatted = content;
  
  // Replace headings
  formatted = formatted.replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, 
    '<h3 style="font-weight: 800; color: #111827; margin: 20px 0 10px 0; font-size: 18px; border-bottom: 2px solid #f3f4f6; padding-bottom: 6px; letter-spacing: -0.01em;">$1</h3>');
  
  // Replace paragraphs
  formatted = formatted.replace(/<p[^>]*>(.*?)<\/p>/gi, 
    '<p style="margin-bottom: 12px; line-height: 1.6; color: #374151; font-size: 14px;">$1</p>');
  
  // Replace list items
  formatted = formatted.replace(/<li[^>]*>(.*?)<\/li>/gi, 
    '<li style="margin-bottom: 8px; padding-left: 20px; position: relative; color: #374151; font-size: 14px;"><span style="position: absolute; left: 0; color: #06D6A0; font-weight: bold;">•</span>$1</li>');
  
  // Replace ul/ol
  formatted = formatted.replace(/<ul[^>]*>/gi, '<ul style="margin: 8px 0; padding-left: 0; list-style: none;">');
  formatted = formatted.replace(/<ol[^>]*>/gi, '<ul style="margin: 8px 0; padding-left: 0; list-style: none;">');
  formatted = formatted.replace(/<\/ol>/gi, '</ul>');
  
  // Replace strong/b
  formatted = formatted.replace(/<(strong|b)[^>]*>(.*?)<\/(strong|b)>/gi, 
    '<strong style="font-weight: 700; color: #000;">$2</strong>');
  
  // Replace br
  formatted = formatted.replace(/<br\s*\/?>/gi, '<br>');
  
  // If still has HTML, it's good. If not, wrap in paragraph
  if (!formatted.includes('<')) {
    formatted = `<p style="margin-bottom: 8px; line-height: 1.8; color: #374151;">${formatted}</p>`;
  }
  
  return formatted;
}

function generatePDFHTML(data: PDFData): string {
  const { grants, userEmail, formData } = data;
  
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Vos Subventions - SubventionMatch</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
          background: white;
          color: #1f2937;
          line-height: 1.6;
          font-size: 14px;
        }

        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 30px 20px;
        }

        /* Header */
        .header {
          margin-bottom: 40px;
          padding-bottom: 25px;
          border-bottom: 1px solid #e5e7eb;
        }

        .logo {
          font-size: 24px;
          font-weight: 300;
          color: #000;
          letter-spacing: -0.5px;
          margin-bottom: 6px;
        }

        .logo strong {
          font-weight: 700;
        }

        .subtitle {
          color: #6b7280;
          font-size: 13px;
        }

        /* Title */
        .title-section {
          margin-bottom: 35px;
        }

        .main-title {
          font-size: 42px;
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -1px;
          margin-bottom: 10px;
          color: #000;
        }

        .main-title .highlight {
          color: #06D6A0;
        }

        .main-subtitle {
          font-size: 16px;
          color: #6b7280;
        }

        /* Form Summary */
        .form-summary {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 24px;
          margin-bottom: 35px;
          page-break-inside: avoid;
        }

        .form-summary-title {
          font-size: 16px;
          font-weight: 700;
          color: #000;
          margin-bottom: 18px;
          padding-bottom: 12px;
          border-bottom: 2px solid #06D6A0;
        }

        .form-field {
          margin-bottom: 14px;
        }

        .form-label {
          font-size: 10px;
          text-transform: uppercase;
          color: #9ca3af;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
          font-weight: 600;
          display: block;
        }

        .form-value {
          font-size: 13px;
          color: #374151;
          line-height: 1.6;
        }

        .form-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 4px;
        }

        .form-tag {
          background: #06D6A0;
          color: white;
          padding: 3px 9px;
          border-radius: 3px;
          font-size: 11px;
          font-weight: 500;
        }

        /* Grant Card */
        .grant-card {
          background: white;
          border: 1px solid #e5e7eb;
          margin-bottom: 25px;
          page-break-inside: avoid;
        }

        .grant-card-header {
          padding: 20px 24px;
          border-bottom: 1px solid #f3f4f6;
        }

        .grant-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 14px;
        }

        .grant-info {
          flex: 1;
        }

        .match-badge {
          display: inline-block;
          background: #118AB2;
          color: white;
          padding: 3px 8px;
          border-radius: 3px;
          font-size: 10px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .grant-title {
          font-size: 24px;
          font-weight: 800;
          color: #000;
          margin-bottom: 8px;
          line-height: 1.2;
          letter-spacing: -0.02em;
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
          word-break: break-word;
        }

        .grant-organization {
          font-size: 15px;
          font-weight: 600;
          color: #4b5563;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .amount-box {
          text-align: right;
          flex-shrink: 0;
          max-width: 140px;
        }

        .amount-label {
          font-size: 9px;
          text-transform: uppercase;
          color: #9ca3af;
          letter-spacing: 0.5px;
          margin-bottom: 3px;
        }

        .amount-value {
          font-size: 14px;
          font-weight: 700;
          color: #000;
          line-height: 1.3;
        }

        .deadline-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #6b7280;
          margin-bottom: 12px;
        }

        .match-reason {
          background: rgba(6, 214, 160, 0.05);
          border-left: 2px solid #06D6A0;
          padding: 12px;
          font-size: 13px;
          color: #374151;
          line-height: 1.6;
        }

        /* Grant Details */
        .grant-details {
          padding: 20px 24px;
        }

        .detail-section {
          margin-bottom: 24px;
        }

        .detail-section:last-child {
          margin-bottom: 0;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 10px;
        }

        .section-title {
          font-size: 12px;
          text-transform: uppercase;
          color: #111827;
          letter-spacing: 1.5px;
          font-weight: 800;
          border-bottom: 2px solid #06D6A0;
          padding-bottom: 2px;
          margin-bottom: 12px;
          display: inline-block;
        }

        .section-icon {
          width: 14px;
          height: 14px;
          color: #9ca3af;
        }

        .section-content {
          font-size: 13px;
          color: #374151;
          line-height: 1.8;
        }

        .section-content p {
          margin-bottom: 8px;
        }

        .section-content strong {
          font-weight: 700;
          color: #000;
        }

        .section-content ul {
          margin: 8px 0;
          padding-left: 0;
          list-style: none;
        }

        .section-content li {
          margin-bottom: 6px;
          padding-left: 20px;
          position: relative;
        }

        .section-content li::before {
          content: "•";
          color: #06D6A0;
          position: absolute;
          left: 0;
          font-weight: 700;
        }

        /* Stats Box */
        .stats-box {
          background: #f9fafb;
          padding: 18px;
          border-radius: 6px;
          margin-bottom: 20px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .stat-item {
          text-align: center;
        }

        .stat-value {
          font-size: 20px;
          font-weight: 700;
          color: #000;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 9px;
          text-transform: uppercase;
          color: #9ca3af;
          letter-spacing: 0.5px;
        }

        /* Process Table */
        .process-table {
          width: 100%;
          border-collapse: collapse;
        }

        .process-table tr {
          border-bottom: 1px solid #f3f4f6;
        }

        .process-table tr:last-child {
          border-bottom: none;
        }

        .process-table td {
          padding: 8px 0;
          font-size: 13px;
        }

        .process-table td:first-child {
          color: #6b7280;
          width: 50%;
        }

        .process-table td:last-child {
          font-weight: 500;
          color: #000;
          text-align: right;
        }

        /* Colored Boxes */
        .advice-box {
          background: #eff6ff;
          border-left: 4px solid #3b82f6;
          padding: 14px;
          margin-bottom: 20px;
        }

        .advice-box-title {
          font-size: 9px;
          text-transform: uppercase;
          color: #3b82f6;
          letter-spacing: 1px;
          margin-bottom: 8px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .advice-box-content {
          font-size: 13px;
          color: #374151;
          line-height: 1.6;
        }

        .resources-box {
          background: #f5f3ff;
          border-left: 4px solid #a78bfa;
          padding: 14px;
          margin-bottom: 20px;
        }

        .resources-box-title {
          font-size: 9px;
          text-transform: uppercase;
          color: #7c3aed;
          letter-spacing: 1px;
          margin-bottom: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .resource-item {
          background: white;
          padding: 10px;
          border-radius: 5px;
          margin-bottom: 8px;
        }

        .resource-item:last-child {
          margin-bottom: 0;
        }

        .resource-title {
          font-size: 12px;
          font-weight: 600;
          color: #000;
          margin-bottom: 3px;
        }

        .resource-description {
          font-size: 11px;
          color: #6b7280;
          margin-bottom: 3px;
        }

        .resource-type {
          font-size: 9px;
          text-transform: uppercase;
          color: #9ca3af;
          margin-top: 3px;
        }

        .resource-url {
          font-size: 10px;
          color: #3b82f6;
          margin-top: 4px;
          word-break: break-all;
        }

        /* Contact */
        .contact-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #374151;
        }

        /* Apply Button */
        .apply-section {
          padding-top: 18px;
          border-top: 1px solid #e5e7eb;
          margin-top: 20px;
        }

        .apply-button {
          background: #000;
          color: white;
          padding: 14px 22px;
          text-align: center;
          border-radius: 50px;
          font-size: 13px;
          font-weight: 600;
          display: block;
          text-decoration: none;
        }

        /* Footer */
        .footer {
          margin-top: 40px;
          padding-top: 25px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          font-size: 11px;
          color: #9ca3af;
        }

        .footer-email {
          color: #6b7280;
          margin-top: 6px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="logo">
            Subvention<strong>Match</strong>
          </div>
          <div class="subtitle">
            Vos subventions culturelles personnalisées
          </div>
        </div>

        <!-- Title -->
        <div class="title-section">
          <div class="main-title">
            ${grants.length}<br>
            <span class="highlight">SUBVENTION${grants.length > 1 ? 'S' : ''}</span>
          </div>
          <div class="main-subtitle">Pour votre profil artistique</div>
        </div>

        <!-- Form Summary -->
        ${formData ? `
          <div class="form-summary">
            <div class="form-summary-title">📋 Votre profil</div>
            
            ${formData.status && formData.status.length > 0 ? `
              <div class="form-field">
                <span class="form-label">Statut</span>
                <div class="form-tags">
                  ${formData.status.map(s => `<span class="form-tag">${s}</span>`).join('')}
                </div>
              </div>
            ` : ''}

            ${formData.artisticDomain && formData.artisticDomain.length > 0 ? `
              <div class="form-field">
                <span class="form-label">Domaine artistique</span>
                <div class="form-tags">
                  ${formData.artisticDomain.map(d => `<span class="form-tag">${d}</span>`).join('')}
                </div>
              </div>
            ` : ''}

            <div class="form-field">
              <span class="form-label">Région</span>
              <div class="form-value">${formData.region}</div>
            </div>

            ${formData.projectDescription ? `
              <div class="form-field">
                <span class="form-label">Description du projet</span>
                <div class="form-value">${formData.projectDescription}</div>
              </div>
            ` : ''}

            ${formData.projectType && formData.projectType.length > 0 ? `
              <div class="form-field">
                <span class="form-label">Type de projet</span>
                <div class="form-tags">
                  ${formData.projectType.map(p => `<span class="form-tag">${p}</span>`).join('')}
                </div>
              </div>
            ` : ''}

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
          </div>
        ` : ''}

        <!-- Grants -->
        ${grants.map((grant, index) => {
          const amount = formatAmount(grant);
          
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
                    <div class="amount-value">${amount.replace(' - ', '<br>à ')}</div>
                  </div>
                </div>

                ${grant.deadline ? `
                  <div class="deadline-row">
                    📅 ${new Date(grant.deadline) >= new Date() 
                      ? `Jusqu'au ${grant.deadline}` 
                      : grant.frequency || 'Session fermée'
                    }
                  </div>
                ` : ''}

                ${grant.matchReason ? `
                  <div class="match-reason">
                    ${grant.matchReason}
                  </div>
                ` : ''}
              </div>

              <!-- Card Details -->
              <div class="grant-details">
                
                <!-- Description -->
                ${grant.description ? `
                  <div class="detail-section">
                    <div class="section-header">
                      <span class="section-icon">📄</span>
                      <span class="section-title">Description</span>
                    </div>
                    <div class="section-content">
                      ${formatHTMLContent(grant.description, 600)}
                    </div>
                  </div>
                ` : ''}

                <!-- Eligibility -->
                ${grant.eligibility ? `
                  <div class="detail-section">
                    <div class="section-header">
                      <span class="section-title">Critères d'éligibilité</span>
                    </div>
                    <div class="section-content">
                      ${formatHTMLContent(grant.eligibility, 600)}
                    </div>
                  </div>
                ` : ''}

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

                <!-- Apply Button -->
                ${grant.url || grant.improvedUrl ? `
                  <div class="apply-section">
                    <a href="${grant.improvedUrl || grant.url}" class="apply-button">
                      Candidater maintenant
                    </a>
                    <div style="text-align: center; margin-top: 8px;">
                      <a href="${grant.improvedUrl || grant.url}" style="font-size: 10px; color: #6b7280; text-decoration: none; word-break: break-all;">
                        ${grant.improvedUrl || grant.url}
                      </a>
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}

        <!-- Footer -->
        <div class="footer">
          <div>© 2025 SubventionMatch - Tous droits réservés</div>
          <div class="footer-email">Document généré pour: ${userEmail}</div>
        </div>
      </div>
    </body>
    </html>
  `;
}
