import { Resend } from 'resend';

// Lazy-init so the server can boot without RESEND_API_KEY (e.g. smoke tests).
// Calls to sendGrantsEmail will throw explicitly if the key is missing.
let resend: Resend | null = null;
function getResend(): Resend {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured — emails disabled.");
    }
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

interface EmailData {
  to: string;
  grantsCount: number;
  pdfBuffer: Buffer;
}

interface FallbackEmailData {
  to: string;
  grants: Array<{
    title: string;
    organization: string;
    amount?: number | null;
    amountMin?: number | null;
    amountMax?: number | null;
    deadline?: string | null;
    matchScore?: number;
    matchReason?: string;
    url?: string | null;
    improvedUrl?: string | null;
    eligibility: string;
  }>;
}

export async function sendGrantsEmail(data: EmailData): Promise<void> {
  const { to, grantsCount, pdfBuffer } = data;

  try {
    const result = await getResend().emails.send({
      from: 'SubventionMatch <noreply@send.odcstudio.fr>', // Change to your verified domain
      to,
      subject: `Vos ${grantsCount} subventions culturelles personnalisées`,
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="font-size: 32px; font-weight: 300; color: #6B5F4C; letter-spacing: -0.5px; margin-bottom: 10px;">
              Subvention<strong style="font-weight: 700;">Match</strong>
            </h1>
            <p style="color: #666; font-size: 16px;">Vos subventions culturelles personnalisées</p>
          </div>

          <div style="background: #f8f7f5; border-radius: 12px; padding: 32px; margin-bottom: 30px;">
            <h2 style="font-size: 24px; font-weight: 700; color: #1a1a1a; margin-bottom: 16px;">
              🎉 Vos résultats sont prêts !
            </h2>
            <p style="font-size: 16px; color: #4a4a4a; margin-bottom: 20px;">
              Nous avons trouvé <strong style="color: #6B5F4C;">${grantsCount} subventions</strong> qui correspondent à votre profil et à votre projet artistique.
            </p>
            <p style="font-size: 15px; color: #4a4a4a;">
              Vous trouverez en pièce jointe un PDF détaillé avec :
            </p>
            <ul style="margin-left: 20px; margin-top: 12px; color: #4a4a4a;">
              <li style="margin-bottom: 8px;">La description complète de chaque subvention</li>
              <li style="margin-bottom: 8px;">Les critères d'éligibilité</li>
              <li style="margin-bottom: 8px;">Les montants disponibles</li>
              <li style="margin-bottom: 8px;">Les documents requis</li>
              <li style="margin-bottom: 8px;">Les conseils pour maximiser vos chances</li>
              <li style="margin-bottom: 8px;">Les liens directs pour postuler</li>
            </ul>
          </div>

          <div style="background: white; border: 2px solid #B8A48E; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
            <p style="font-size: 14px; font-weight: 600; color: #6B5F4C; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
              💡 Conseil
            </p>
            <p style="font-size: 15px; color: #4a4a4a;">
              Commencez par les subventions avec le score de correspondance le plus élevé. Elles sont les plus adaptées à votre profil !
            </p>
          </div>

          <div style="background: #FFF4D6; border: 1px solid #FFD166; border-radius: 12px; padding: 20px; margin-bottom: 20px; text-align: center;">
            <p style="font-size: 14px; color: #073B4C; margin: 0 0 10px; font-weight: 600;">
              🧪 SubventionMatch est en beta
            </p>
            <p style="font-size: 13px; color: #4a4a4a; margin: 0 0 12px;">
              Votre avis nous aide à améliorer l'outil. Un résultat qui ne colle pas ? Une idée ?
            </p>
            <a href="https://subvention-match-production.up.railway.app/?feedback=1" style="display: inline-block; background: #073B4C; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600;">
              💬 Donner un retour
            </a>
          </div>

          <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e5e5;">
            <p style="font-size: 14px; color: #666; margin-bottom: 8px;">
              Besoin d'aide ? Nous sommes là pour vous accompagner.
            </p>
            <p style="font-size: 12px; color: #999;">
              © ${new Date().getFullYear()} SubventionMatch - Tous droits réservés
            </p>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: 'subventions-culturelles.pdf',
          content: pdfBuffer,
        },
      ],
    });

    // Le SDK Resend retourne { data, error } au lieu de throw — on doit checker explicitement.
    // Sans ça, des erreurs comme "testing mode — recipient not allowed" passent inaperçues.
    if (result.error) {
      const msg = `Resend API error: ${result.error.name} — ${result.error.message}`;
      console.error(`❌ ${msg}`);
      throw new Error(msg);
    }

    console.log(`✅ Email sent successfully to ${to} (id: ${result.data?.id})`);
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw error;
  }
}

/**
 * Fallback : envoie les resultats en HTML dans le corps de l'email quand le PDF
 * n'a pas pu etre genere (Puppeteer timeout, memoire, etc.).
 * L'utilisateur recoit quand meme ses matches — juste pas en PDF.
 */
export async function sendGrantsEmailFallback(data: FallbackEmailData): Promise<void> {
  const { to, grants } = data;

  const grantsHtml = grants.map((g, i) => {
    let amount = "Montant variable";
    if (g.amountMin && g.amountMax) amount = `${g.amountMin.toLocaleString()} - ${g.amountMax.toLocaleString()} euros`;
    else if (g.amount) amount = `${g.amount.toLocaleString()} euros`;

    const link = g.improvedUrl || g.url;

    return `
      <div style="background:#f8f7f5;border-radius:8px;padding:20px;margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px;">
          <h3 style="font-size:16px;font-weight:700;color:#1a1a1a;margin:0;">${i + 1}. ${g.title}</h3>
          ${g.matchScore ? `<span style="background:#118AB2;color:white;font-size:12px;padding:2px 8px;border-radius:99px;">${g.matchScore}%</span>` : ""}
        </div>
        <p style="font-size:13px;color:#666;margin:4px 0 8px;">${g.organization} &middot; ${amount}</p>
        ${g.deadline ? `<p style="font-size:13px;color:#666;margin:0 0 8px;">Deadline : ${g.deadline}</p>` : ""}
        ${g.matchReason ? `<p style="font-size:14px;color:#4a4a4a;margin:8px 0;border-left:3px solid #06D6A0;padding-left:12px;">${g.matchReason}</p>` : ""}
        <p style="font-size:13px;color:#555;margin:8px 0 0;">${g.eligibility.slice(0, 200)}${g.eligibility.length > 200 ? "..." : ""}</p>
        ${link ? `<a href="${link}" style="display:inline-block;margin-top:10px;font-size:13px;color:#118AB2;text-decoration:none;">Voir la subvention &rarr;</a>` : ""}
      </div>`;
  }).join("");

  try {
    const result = await getResend().emails.send({
      from: 'SubventionMatch <noreply@send.odcstudio.fr>',
      to,
      subject: `Vos ${grants.length} subventions culturelles personnalisees`,
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;line-height:1.6;color:#1a1a1a;max-width:600px;margin:0 auto;padding:40px 20px;">
          <div style="text-align:center;margin-bottom:40px;">
            <h1 style="font-size:32px;font-weight:300;color:#6B5F4C;letter-spacing:-0.5px;margin-bottom:10px;">
              Subvention<strong style="font-weight:700;">Match</strong>
            </h1>
          </div>
          <div style="background:white;border:1px solid #e5e5e5;border-radius:12px;padding:24px;margin-bottom:20px;">
            <h2 style="font-size:20px;margin-bottom:16px;">Vos ${grants.length} subventions personnalisees</h2>
            <p style="font-size:14px;color:#666;margin-bottom:16px;">
              Le PDF n'a pas pu etre genere cette fois-ci. Voici vos resultats directement dans cet email.
            </p>
          </div>
          ${grantsHtml}
          <div style="text-align:center;margin-top:40px;padding-top:30px;border-top:1px solid #e5e5e5;">
            <p style="font-size:12px;color:#999;">&copy; ${new Date().getFullYear()} SubventionMatch</p>
          </div>
        </body>
        </html>
      `,
    });

    if (result.error) {
      const msg = `Resend API error: ${result.error.name} — ${result.error.message}`;
      console.error(`❌ ${msg}`);
      throw new Error(msg);
    }

    console.log(`✅ Fallback email (HTML only) sent to ${to} (id: ${result.data?.id})`);
  } catch (error) {
    console.error('❌ Failed to send fallback email:', error);
    throw error;
  }
}
