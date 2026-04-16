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

export async function sendGrantsEmail(data: EmailData): Promise<void> {
  const { to, grantsCount, pdfBuffer } = data;

  try {
    await getResend().emails.send({
      from: 'SubventionMatch <onboarding@resend.dev>', // Change to your verified domain
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

    console.log(`✅ Email sent successfully to ${to}`);
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw error;
  }
}
