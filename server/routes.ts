// SECTIONS
// L13   — Imports & rate limiters : déclarations, rate limiters par route, utils (masks, requireAdmin)
// L113  — Helpers & init           : formatGrantToResult, Stripe init, processSubmissionAsync (background)
// L248  — Bootstrap routes         : SEO pages, OG image, health checks (/api/health, /api/health/deep)
// L335  — Core user flow           : submit-form, chat-refine IA, results polling
// L628  — Feedback & beta          : match feedback, beta feedback, waitlist, beta capacity, dashboard admin
// L909  — Paiement Stripe          : create-checkout-session, webhook stripe
// L1050 — Grants CRUD              : create/read/update/delete/stats grants (public + admin)
// L1255 — PDF & email              : serve PDF (sessionId + signed token), send-email, test flow admin
// L1619 — Enrichissement IA        : status/start/stats enrichissement, liste grants enrichies
// L1720 — Data admin               : organisms, URL fixer, HTML cleaner, deadlines, refresh scheduler

import type { Express } from "express";
import { createServer, type Server } from "http";
import { insertFormSubmissionSchema, userFormInputSchema, matchFeedback, betaFeedback, betaWaitlist, formSubmissions, type InsertGrant, type Grant, type GrantResult, type FormSubmission } from "@shared/schema";
import { sanitizeFormBody, findBlockedField } from "./content-filter";
import { storage } from "./storage";
import { grantStorage } from "./grant-storage";
import { matchGrantsWithAI } from "./ai-matcher";
import { generateGrantsPDF, generateAndSaveGrantsPDF, submissionToPdfFormData } from "./pdf-generator";
import { sendGrantsEmail, sendGrantsEmailFallback } from "./email-service";
import { testApiConnection, fetchAides } from "./aides-territoires-api";
import { getGrantsStatistics, getOverallStats } from "./stats";
import { enrichMultipleGrants } from "./ai-enricher";
import { analyzeDataQuality } from "./data-quality-analyzer";
import { createPdfToken, verifyPdfToken } from "./pdf-token";
import { isEuropeanGrant } from "@shared/grant-classification";
import { registerSeoRoutes } from "./seo-pages.js";
import Stripe from "stripe";
import express from "express";
import rateLimit from "express-rate-limit";

// --- Rate limiters ---
// Protège les routes coûteuses (IA, Stripe, email) contre les abus.
// windowMs = fenêtre glissante en ms, max = requêtes autorisées par fenêtre.
const formSubmitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,                   // 10 soumissions / 15 min / IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de soumissions. Réessayez dans quelques minutes." },
});

const aiChatLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,                   // 30 messages chat / 5 min / IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de requêtes. Attendez un moment." },
});

const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de tentatives de paiement." },
});

const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 h
  max: 5,                     // 5 emails / h / IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Limite d'envoi d'emails atteinte. Réessayez plus tard." },
});

// Le sessionId (UUID v4 random) sert de capacité d'accès au PDF. L'entropie
// (122 bits) rend la devinette infaisable, mais on ajoute un rate limit pour
// bloquer tout balayage anormal et détecter les tentatives.
// TODO: fix plus solide = tokens signés à courte durée (JWT) au lieu d'exposer
// le sessionId dans les URLs.
const pdfDownloadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 min
  max: 30,                    // 30 téléchargements / 15 min / IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de téléchargements. Réessayez dans quelques minutes." },
});

// Valide qu'une string ressemble à un UUID v4 (défense en profondeur).
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Utilitaires pour masquer les données sensibles dans les logs
const DEBUG_MODE = process.env.NODE_ENV === "development";
function maskEmail(email: string): string {
  if (!email) return "[no-email]";
  const [user, domain] = email.split("@");
  return `${user.slice(0, 2)}***@${domain}`;
}
function maskSessionId(sessionId: string): string {
  if (!sessionId) return "[no-session]";
  return `${sessionId.slice(0, 8)}...`;
}

// Protection basique des routes admin. Pas de fallback hardcodé: si ADMIN_TOKEN
// n'est pas défini, toutes les routes admin sont bloquées (fail-closed).
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
if (!ADMIN_TOKEN) {
  console.warn("⚠️  ADMIN_TOKEN is not set — admin routes are disabled.");
}
function requireAdmin(req: any, res: any, next: any) {
  if (!ADMIN_TOKEN) {
    return res.status(503).json({ error: "Admin désactivé: ADMIN_TOKEN manquant sur le serveur." });
  }
  const token = req.headers['x-admin-token'] || req.query.admin_token;
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: "Accès non autorisé. Token admin requis." });
  }
  next();
}

/**
 * Convert Grant from DB to GrantResult format
 */
function formatGrantToResult(grant: Grant): GrantResult {
  // Format amount as string
  let amountStr = "Montant variable";
  if (grant.amountMin && grant.amountMax) {
    amountStr = `${grant.amountMin.toLocaleString()} - ${grant.amountMax.toLocaleString()} €`;
  } else if (grant.amount) {
    amountStr = `${grant.amount.toLocaleString()} €`;
  }

  return {
    id: grant.id,
    grantId: grant.id,
    title: grant.title,
    organization: grant.organization,
    amount: amountStr,
    deadline: grant.deadline || "Permanent",
    frequency: grant.frequency || undefined,
    nextSession: grant.nextSession || undefined,
    description: grant.description || undefined,
    eligibility: grant.eligibility,
    requirements: grant.requirements || undefined,
    obligatoryDocuments: grant.obligatoryDocuments || undefined,
    url: grant.url || undefined,
    improvedUrl: grant.improvedUrl || undefined,
    helpResources: grant.helpResources as any || undefined,
    contactEmail: grant.contactEmail || undefined,
    contactPhone: grant.contactPhone || undefined,
    grantType: grant.grantType || undefined,
    eligibleSectors: grant.eligibleSectors || undefined,
    geographicZone: grant.geographicZone || undefined,
    maxFundingRate: grant.maxFundingRate || undefined,
    coFundingRequired: grant.coFundingRequired || undefined,
    cumulativeAllowed: grant.cumulativeAllowed || undefined,
    processingTime: grant.processingTime || undefined,
    responseDelay: grant.responseDelay || undefined,
    applicationDifficulty: grant.applicationDifficulty || undefined,
    acceptanceRate: grant.acceptanceRate || undefined,
    annualBeneficiaries: grant.annualBeneficiaries || undefined,
    successProbability: grant.successProbability || undefined,
    preparationAdvice: grant.preparationAdvice || undefined,
    experienceFeedback: grant.experienceFeedback || undefined,
  };
}

// Initialize Stripe only if key is available (optional for beta/free mode)
const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey 
  ? new Stripe(stripeKey, { apiVersion: "2025-10-29.clover" })
  : null;

const isStripeEnabled = !!stripe;
if (!isStripeEnabled) {
  console.log("⚠️  Stripe non configuré - Mode gratuit uniquement");
}

/**
 * Run the heavy post-submission work (AI matching, PDF, email) asynchronously
 * so the HTTP response can return quickly. The client polls /api/results/:id
 * which returns {status: "pending"} until this finishes.
 */
async function processSubmissionAsync(submission: FormSubmission): Promise<void> {
  try {
    console.log(`🤖 [background] matching IA démarré pour ${maskSessionId(submission.sessionId)}`);
    const allGrants = await grantStorage.getAllActiveGrants();
    console.log(`📚 [background] ${allGrants.length} subventions disponibles`);
    const formattedGrants = allGrants.map(formatGrantToResult);

    const matchedGrants = await matchGrantsWithAI(submission, formattedGrants);
    console.log(`✅ [background] ${matchedGrants.length} subventions matchées`);

    await storage.updateFormResults(submission.sessionId, matchedGrants);
    await storage.markAsPaid(submission.sessionId);
    console.log(`💾 [background] résultats sauvegardés + session marquée payée`);

    // PDF + email (best effort — don't fail the submission if email bounces).
    if (submission.email && matchedGrants.length > 0) {
      try {
        const grantsWithDetails = await Promise.all(
          matchedGrants.map(async (result: any) => {
            const grant = await grantStorage.getGrantById(result.grantId);
            return grant ? { ...grant, matchScore: result.matchScore, matchReason: result.matchReason } : null;
          })
        );
        const validGrants = grantsWithDetails.filter((g): g is NonNullable<typeof g> => g !== null);
        if (validGrants.length === 0) throw new Error("Aucune subvention valide trouvée");

        console.log(`📄 [background] génération PDF...`);
        const { buffer, path } = await generateAndSaveGrantsPDF(
          {
            grants: validGrants,
            userEmail: submission.email,
            formData: submissionToPdfFormData(submission),
          },
          submission.sessionId
        );
        await storage.savePdfPath(submission.sessionId, path);
        console.log(`✅ [background] PDF généré: ${path}`);

        await sendGrantsEmail({
          to: submission.email,
          grantsCount: matchedGrants.length,
          pdfBuffer: buffer,
        });
        console.log(`✅ [background] email envoyé`);
      } catch (pdfError: any) {
        console.error(`⚠️  [background] PDF/email erreur:`, pdfError.message);
        try {
          const grantsForFallback = await Promise.all(
            matchedGrants.map(async (result: any) => {
              const grant = await grantStorage.getGrantById(result.grantId);
              return grant ? { ...grant, matchScore: result.matchScore, matchReason: result.matchReason } : null;
            })
          );
          const validForFallback = grantsForFallback.filter((g): g is NonNullable<typeof g> => g !== null);
          if (validForFallback.length > 0) {
            await sendGrantsEmailFallback({ to: submission.email, grants: validForFallback });
            console.log(`📧 [background] fallback HTML email envoyé`);
          }
        } catch (fallbackError: any) {
          console.error(`❌ [background] fallback email aussi échoué:`, fallbackError.message);
        }
      }
    }
  } catch (err: any) {
    console.error(`❌ [background] matching échoué pour ${maskSessionId(submission.sessionId)}:`, err?.message || err);
    // Mark session as failed so /api/results can return a proper error
    try {
      await storage.updateFormResults(submission.sessionId, []);
    } catch {}
  }
}

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);

  // Pages SEO programmatiques (HTML pur, indexable Wave 1)
  registerSeoRoutes(app);

  // OG Image — génère un PNG 1200×630 depuis le SVG statique (cache en mémoire)
  let ogImageCache: Buffer | null = null;
  app.get("/og-image.png", async (_req, res) => {
    if (ogImageCache) {
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Cache-Control", "public, max-age=86400");
      return res.send(ogImageCache);
    }
    try {
      const puppeteer = await import("puppeteer");
      const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || undefined;
      const browser = await puppeteer.default.launch({
        headless: true, executablePath,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
      });
      const page = await browser.newPage();
      await page.setViewport({ width: 1200, height: 630 });
      const svgPath = new URL("../../client/public/og-image.svg", import.meta.url).pathname;
      await page.goto(`file://${svgPath}`, { waitUntil: "load" });
      const buffer = await page.screenshot({ type: "png" });
      await browser.close();
      ogImageCache = Buffer.from(buffer);
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Cache-Control", "public, max-age=86400");
      return res.send(ogImageCache);
    } catch (e) {
      console.error("OG image generation failed:", e);
      return res.status(500).send("OG image generation failed");
    }
  });

  // Health check endpoint pour Railway / uptime monitoring.
  // Pas de DB hit pour rester rapide et disponible même si Supabase est down.
  app.get("/api/health", (_req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
  });

  // Deep health check — vérifie que tous les services externes répondent.
  // Utile pour alerter AVANT qu'un utilisateur tombe sur une erreur.
  app.get("/api/health/deep", async (_req, res) => {
    const checks: Record<string, { ok: boolean; ms?: number; error?: string }> = {};

    // 1. Database (Supabase via pg pool)
    const dbStart = Date.now();
    try {
      const { pool } = await import("./db");
      await pool.query("SELECT 1");
      checks.database = { ok: true, ms: Date.now() - dbStart };
    } catch (e: any) {
      checks.database = { ok: false, ms: Date.now() - dbStart, error: e.message };
    }

    // 2. OpenRouter (AI matching)
    const aiStart = Date.now();
    try {
      if (!process.env.OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY missing");
      const r = await fetch("https://openrouter.ai/api/v1/models", {
        headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
        signal: AbortSignal.timeout(5000),
      });
      checks.openrouter = { ok: r.ok, ms: Date.now() - aiStart, ...(!r.ok && { error: `HTTP ${r.status}` }) };
    } catch (e: any) {
      checks.openrouter = { ok: false, ms: Date.now() - aiStart, error: e.message };
    }

    // 3. Stripe
    checks.stripe = { ok: isStripeEnabled };
    if (!isStripeEnabled) checks.stripe.error = "STRIPE_SECRET_KEY missing";

    // 4. Resend (email)
    checks.resend = { ok: !!process.env.RESEND_API_KEY };
    if (!process.env.RESEND_API_KEY) checks.resend.error = "RESEND_API_KEY missing";

    const allOk = Object.values(checks).every((c) => c.ok);
    res.status(allOk ? 200 : 503).json({
      status: allOk ? "ok" : "degraded",
      uptime: process.uptime(),
      checks,
    });
  });

  // Route pour soumettre le formulaire (MODE GRATUIT - BETA)
  app.post("/api/submit-form", formSubmitLimiter, async (req, res) => {
    try {
      const sanitizedBody = sanitizeFormBody(req.body);
      const blockedField = findBlockedField(sanitizedBody);
      if (blockedField) {
        return res.status(400).json({ error: "Contenu inapproprié détecté. Veuillez reformuler." });
      }
      const validatedData = userFormInputSchema.parse(sanitizedBody);

      const submission = await storage.createFormSubmission(validatedData);
      console.log(`📝 Nouvelle soumission: ${maskSessionId(submission.sessionId)}`);

      // RESPOND IMMEDIATELY so the client can navigate to /loading without
      // hanging on a 30+ second "Envoi…" spinner. The actual matching,
      // PDF generation and email send run in the background; the /results
      // endpoint returns {status: "pending"} until everything is ready.
      res.json({ sessionId: submission.sessionId });

      // ----- BACKGROUND: matching + PDF + email -------------------------------
      processSubmissionAsync(submission).catch((err) => {
        console.error("❌ [background] submission processing failed:", err);
      });
    } catch (error: any) {
      console.error("Erreur lors de la soumission:", error);
      if (!res.headersSent) {
        res.status(400).json({ error: error.message });
      }
    }
  });

  // Route pour affiner les résultats via chat IA
  app.post("/api/chat-refine", aiChatLimiter, async (req, res) => {
    try {
      const { sessionId, userMessage, conversationHistory } = req.body;

      if (!sessionId || !userMessage) {
        return res.status(400).json({ error: "sessionId et userMessage requis" });
      }

      // Récupérer la soumission existante
      const submission = await storage.getFormSubmission(sessionId);
      if (!submission) {
        return res.status(404).json({ error: "Session introuvable" });
      }

      // Appeler l'IA pour analyser la réponse et générer la prochaine question
      const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
      if (!OPENROUTER_API_KEY) {
        throw new Error("OPENROUTER_API_KEY manquante");
      }

      // Construire l'historique pour l'IA
      const messages = [
        {
          role: "system",
          content: `Tu es un assistant cool et sympa qui aide des artistes à trouver des subventions. Tu poses des questions courtes et décontractées pour affiner leur profil. Tutoie-les comme un pote ! 

Ton rôle :
1. Analyser la réponse de l'utilisateur
2. Poser UNE question pertinente pour affiner son profil (budget, timing, expérience, etc.)
3. Reste bref et cool - max 2 phrases

Style : décontracté, tutoiement, pas de jargon. Genre "Ok cool ! Et niveau budget, tu vises dans quelle tranche ?"

Questions possibles :
- Budget du projet
- Timing / urgence
- Expérience passée avec les subventions
- Dimension internationale / locale
- Objectifs précis du projet
- Type de structure (asso, auto-entrepreneur, etc.)

Réponds en JSON : { "nextQuestion": "ta question cool", "insights": "ce que tu as appris de leur réponse" }`
        },
        ...conversationHistory.map((msg: any) => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: "user",
          content: userMessage
        }
      ];

      const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://subventionmatch.fr",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat",
          messages,
          temperature: 0.7,
          max_tokens: 200,
        }),
      });

      if (!aiResponse.ok) {
        throw new Error(`OpenRouter API error: ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();
      const assistantReply = aiData.choices[0]?.message?.content || "Hmm, j'ai eu un bug... Répète ?";

      // Parser la réponse JSON (ou fallback sur texte brut si pas JSON)
      let nextQuestion = assistantReply;
      try {
        const parsed = JSON.parse(assistantReply);
        nextQuestion = parsed.nextQuestion || assistantReply;
      } catch (e) {
        // Si ce n'est pas du JSON, utiliser la réponse brute
      }

      const currentResults = submission.results as GrantResult[] || [];

      res.json({
        assistantMessage: nextQuestion,
        newCount: currentResults.length,
      });
    } catch (error: any) {
      console.error("Erreur chat-refine:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Route pour récupérer les résultats
  app.get("/api/results/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      // Sessions de test spéciales
      if (sessionId === "test-unpaid" || sessionId === "test-paid") {
        const testResults = [
          {
            id: "test-1",
            grantId: "grant-cnm",
            title: "Aide à la création musicale",
            organization: "Centre National de la Musique",
            amount: "5 000 - 25 000 €",
            deadline: "15 mars 2025",
            frequency: "Annuel - 3 sessions par an",
            matchScore: 95,
            matchReason: "Excellente correspondance avec votre profil de musicien indépendant et votre projet de création d'album. Le CNM finance spécifiquement ce type de projet avec un taux d'acceptation élevé pour les primo-demandeurs.",
            description: "Cette aide vise à soutenir la création d'œuvres musicales originales dans tous les genres musicaux (classique, jazz, musiques actuelles, musiques du monde, électronique). Elle couvre les frais de composition, d'arrangement, d'enregistrement studio et de production artistique.",
            eligibility: "Artistes-auteurs, compositeurs ou producteurs musicaux professionnels, affiliés à une société d'auteurs. Projet de création d'au moins 8 titres originaux. Budget prévisionnel entre 15 000€ et 80 000€.",
            requirements: "Dossier artistique complet avec maquettes, budget détaillé, planning de réalisation, lettres d'engagement des partenaires, attestations de droits d'auteur",
            obligatoryDocuments: [
              "Formulaire de demande complété",
              "Budget prévisionnel détaillé",
              "3-5 maquettes audio (MP3)",
              "CV artistique",
              "Attestation d'affiliation à une société d'auteurs (SACEM, SACD)",
              "RIB"
            ],
            url: "https://cnm.fr/aides-financieres/",
            contactEmail: "aides@cnm.fr",
            contactPhone: "01 53 59 22 00",
            grantType: ["Subvention directe", "Aide à la création"],
            eligibleSectors: ["Musique", "Arts du spectacle"],
            geographicZone: ["National"],
            region: "National",
            maxFundingRate: 70,
            coFundingRequired: "Oui - minimum 30% du budget",
            cumulativeAllowed: "Oui, avec d'autres aides publiques dans la limite de 80% du budget total",
            processingTime: "3 à 4 mois",
            responseDelay: "2 semaines après commission",
            applicationDifficulty: "Moyen",
            acceptanceRate: 45,
            annualBeneficiaries: 250,
            successProbability: "Élevée pour primo-demandeurs",
            preparationAdvice: "Soignez particulièrement la qualité artistique de vos maquettes et la cohérence de votre budget. Prévoyez des devis précis pour tous les postes importants. Mettez en avant votre parcours artistique et les retombées attendues du projet.",
            experienceFeedback: "Les lauréats soulignent l'importance d'un dossier très détaillé et d'une vraie originalité artistique. Le CNM valorise les projets ambitieux et innovants.",
            tags: ["Musique", "Création", "Production", "Enregistrement"]
          },
          {
            id: "test-2",
            grantId: "grant-drac",
            title: "Soutien aux projets artistiques",
            organization: "DRAC Île-de-France",
            amount: "3 000 - 15 000 €",
            deadline: "30 avril 2025",
            frequency: "Permanent - dépôt toute l'année",
            matchScore: 88,
            matchReason: "Votre projet de résidence artistique correspond parfaitement aux critères de la DRAC. Votre localisation en Île-de-France et votre dimension participative sont des atouts majeurs.",
            description: "Soutien aux projets de création et de diffusion artistique portés par des artistes professionnels ou des structures culturelles en Île-de-France. Priorité aux projets innovants, participatifs et contribuant au développement culturel territorial.",
            eligibility: "Artistes professionnels ou structures culturelles implantés en Île-de-France depuis au moins 1 an. Projet à dimension territoriale ou participative. Budget minimum de 8 000€.",
            requirements: "Note d'intention artistique, budget prévisionnel, plan de financement, CV, justificatifs d'implantation",
            obligatoryDocuments: [
              "Formulaire Cerfa n°12156*05",
              "Note d'intention (3 pages max)",
              "Budget prévisionnel",
              "Plan de financement",
              "Attestation INSEE (Kbis ou SIRET)",
              "Justificatif de domicile en Île-de-France"
            ],
            url: "https://www.culture.gouv.fr/Regions/DRAC-Ile-de-France/Aides-et-demarches-specifiques-Ile-de-France",
            contactEmail: "drac.idf@culture.gouv.fr",
            contactPhone: "01 56 06 50 00",
            region: "Île-de-France",
            maxFundingRate: 50,
            processingTime: "2 à 3 mois",
            responseDelay: "6 semaines",
            applicationDifficulty: "Facile",
            acceptanceRate: 60,
            annualBeneficiaries: 180,
            preparationAdvice: "Mettez en avant la dimension territoriale et participative de votre projet. La DRAC est sensible aux projets qui touchent les publics éloignés de la culture.",
            tags: ["Arts visuels", "Résidence", "Médiation culturelle"]
          },
          {
            id: "test-3",
            grantId: "grant-sacem",
            title: "Bourse aux projets innovants",
            organization: "SACEM",
            amount: "10 000 - 50 000 €",
            deadline: "20 mai 2025",
            frequency: "Annuel - 1 session",
            matchScore: 82,
            matchReason: "Votre approche innovante mêlant musique et arts numériques correspond parfaitement aux critères d'innovation de la SACEM. Le caractère expérimental de votre projet est un point fort.",
            description: "Bourse destinée à financer des projets musicaux particulièrement innovants utilisant les nouvelles technologies, explorant de nouveaux formats ou créant des passerelles entre disciplines artistiques.",
            eligibility: "Compositeurs membres de la SACEM. Projet innovant dans sa forme ou son contenu. Budget entre 30 000€ et 150 000€.",
            requirements: "Dossier de présentation complet, maquettes, partenariats confirmés, budget détaillé",
            url: "https://aide-aux-projets.sacem.fr/",
            contactEmail: "actionculturelle@sacem.fr",
            region: "National",
            maxFundingRate: 60,
            processingTime: "4 à 5 mois",
            applicationDifficulty: "Difficile",
            acceptanceRate: 25,
            annualBeneficiaries: 40,
            successProbability: "Moyenne - très sélectif",
            preparationAdvice: "Le jury est composé de professionnels exigeants. Votre projet doit être véritablement innovant et bien documenté. Les partenariats solides sont un plus.",
            tags: ["Innovation", "Numérique", "Expérimentation", "Interdisciplinaire"]
          },
          {
            id: "test-4",
            grantId: "grant-adami",
            title: "Aide à la diffusion",
            organization: "ADAMI",
            amount: "2 000 - 8 000 €",
            deadline: "10 juin 2025",
            matchScore: 75,
            matchReason: "Votre projet de tournée peut bénéficier du soutien ADAMI pour les artistes interprètes. Votre statut professionnel et votre planning de dates sont conformes aux critères.",
            description: "Aide destinée à soutenir la diffusion et la promotion des artistes interprètes à travers des tournées, concerts ou représentations en France et à l'international.",
            eligibility: "Artistes-interprètes professionnels affiliés à l'ADAMI. Minimum 5 dates programmées. Projet de diffusion sur 12 mois maximum.",
            url: "https://www.adami.fr/que-fait-ladami-pour-moi/cherche-financement-projet-artistique/",
            contactEmail: "contact@adami.fr",
            region: "National",
            processingTime: "6 à 8 semaines",
            applicationDifficulty: "Facile",
            acceptanceRate: 70,
            tags: ["Diffusion", "Tournée", "Concert", "Spectacle vivant"]
          }
        ];

        return res.json({
          results: testResults,
          isPaid: sessionId === "test-paid"
        });
      }
      
      const submission = await storage.getFormSubmission(sessionId);

      if (!submission) {
        return res.status(404).json({ error: "Session not found" });
      }

      // results is null while the background matching is still running;
      // the client polls this endpoint until status === "ready".
      const rawResults = submission.results as unknown as GrantResult[] | null;
      const isReady = Array.isArray(rawResults);

      res.json({
        status: isReady ? "ready" : "pending",
        results: isReady ? rawResults : [],
        isPaid: submission.isPaid || false,
        submission: {
          projectDescription: submission.projectDescription,
          status: submission.status,
          artisticDomain: submission.artisticDomain,
          projectType: submission.projectType,
          region: submission.region,
          isInternational: submission.isInternational,
        },
      });
    } catch (error: any) {
      console.error("Erreur lors de la récupération:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- Match feedback (beta quality tracking) ---
  // Les testeurs votent pertinent/pas pertinent sur chaque subvention proposée.
  const feedbackLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Trop de feedbacks envoyés." },
  });

  app.post("/api/feedback", feedbackLimiter, async (req, res) => {
    try {
      const { sessionId, grantId, rating, comment } = req.body;
      if (!sessionId || !grantId || !["relevant", "not_relevant"].includes(rating)) {
        return res.status(400).json({ error: "sessionId, grantId et rating (relevant|not_relevant) requis." });
      }
      const { db } = await import("./db");
      await db.insert(matchFeedback).values({ sessionId, grantId, rating, comment: comment || null });
      res.json({ success: true });
    } catch (error: any) {
      console.error("Erreur feedback:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Stats de feedback pour l'admin — taux de pertinence global + par subvention
  app.get("/api/admin/feedback-stats", requireAdmin, async (req, res) => {
    try {
      const { db } = await import("./db");
      const { sql } = await import("drizzle-orm");
      const stats = await db.execute(sql`
        SELECT
          COUNT(*)::integer AS total,
          SUM(CASE WHEN rating = 'relevant' THEN 1 ELSE 0 END)::integer AS relevant,
          SUM(CASE WHEN rating = 'not_relevant' THEN 1 ELSE 0 END)::integer AS not_relevant,
          ROUND(100.0 * SUM(CASE WHEN rating = 'relevant' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 1) AS relevance_rate
        FROM match_feedback
      `);
      const perGrant = await db.execute(sql`
        SELECT
          grant_id,
          COUNT(*)::integer AS votes,
          SUM(CASE WHEN rating = 'relevant' THEN 1 ELSE 0 END)::integer AS relevant,
          ROUND(100.0 * SUM(CASE WHEN rating = 'relevant' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 1) AS relevance_rate
        FROM match_feedback
        GROUP BY grant_id
        ORDER BY votes DESC
        LIMIT 50
      `);
      res.json({ overall: stats.rows[0], perGrant: perGrant.rows });
    } catch (error: any) {
      console.error("Erreur feedback stats:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- Beta feedback (bugs & suggestions du widget flottant) ---
  const betaFeedbackLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Trop de feedbacks envoyés." },
  });

  app.post("/api/beta-feedback", betaFeedbackLimiter, async (req, res) => {
    try {
      const { type, message, page, userAgent } = req.body;
      if (!type || !message) {
        return res.status(400).json({ error: "type et message requis" });
      }
      const { db } = await import("./db");
      await db.insert(betaFeedback).values({
        type,
        message: message.slice(0, 2000), // cap length
        page: page || null,
        userAgent: userAgent ? userAgent.slice(0, 500) : null,
      });
      console.log(`💬 Beta feedback (${type}): ${message.slice(0, 80)}...`);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Erreur beta-feedback:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Admin : consulter les feedbacks beta
  app.get("/api/admin/beta-feedback", requireAdmin, async (req, res) => {
    try {
      const { db } = await import("./db");
      const { desc } = await import("drizzle-orm");
      const feedbacks = await db.select().from(betaFeedback).orderBy(desc(betaFeedback.createdAt)).limit(100);
      res.json(feedbacks);
    } catch (error: any) {
      console.error("Erreur listing beta-feedback:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- Beta waitlist (email capture homepage pour notifier la V1) ---
  const waitlistLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Trop de tentatives." },
  });

  app.post("/api/waitlist", waitlistLimiter, async (req, res) => {
    try {
      const { email, source } = req.body;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || typeof email !== "string" || !emailRegex.test(email)) {
        return res.status(400).json({ error: "Email invalide" });
      }
      const { db } = await import("./db");
      await db
        .insert(betaWaitlist)
        .values({
          email: email.toLowerCase().trim().slice(0, 320),
          source: source ? String(source).slice(0, 80) : "homepage",
        })
        .onConflictDoNothing();
      console.log(`📬 Waitlist: ${email}`);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Erreur waitlist:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Admin : consulter la waitlist
  app.get("/api/admin/waitlist", requireAdmin, async (req, res) => {
    try {
      const { db } = await import("./db");
      const { desc } = await import("drizzle-orm");
      const entries = await db.select().from(betaWaitlist).orderBy(desc(betaWaitlist.createdAt)).limit(500);
      res.json(entries);
    } catch (error: any) {
      console.error("Erreur listing waitlist:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- Beta capacity + qualified waitlist + feedback dashboard ---

  // GET /api/beta/capacity — compteur emails uniques vs cap configurable
  // Lit BETA_CAP depuis process.env (défaut 150). isFull=true quand count >= cap.
  // Si ?source=X est fourni, retourne aussi un cap par source (BETA_CAP_PER_SOURCE,
  // défaut 25) pour éviter qu'une discipline monopolise la beta.
  app.get("/api/beta/capacity", async (req, res) => {
    try {
      const { db } = await import("./db");
      const { countDistinct, eq } = await import("drizzle-orm");
      const cap = parseInt(process.env.BETA_CAP ?? "150", 10);
      const capPerSource = parseInt(process.env.BETA_CAP_PER_SOURCE ?? "25", 10);

      const [row] = await db
        .select({ count: countDistinct(formSubmissions.email) })
        .from(formSubmissions);
      const count = Number(row?.count ?? 0);

      // Per-source: si ?source=X est dans l'URL, on calcule aussi son cap propre
      const sourceParam = typeof req.query.source === "string" ? req.query.source.slice(0, 80) : null;
      let perSource: { source: string; count: number; cap: number; isFull: boolean } | null = null;
      if (sourceParam) {
        const [srcRow] = await db
          .select({ count: countDistinct(formSubmissions.email) })
          .from(formSubmissions)
          .where(eq(formSubmissions.source, sourceParam));
        const srcCount = Number(srcRow?.count ?? 0);
        perSource = {
          source: sourceParam,
          count: srcCount,
          cap: capPerSource,
          isFull: srcCount >= capPerSource,
        };
      }

      // isFull = global plein OU source-specific plein (si source fournie)
      const isFull = count >= cap || (perSource?.isFull ?? false);
      res.json({ count, cap, isFull, perSource });
    } catch (error: any) {
      console.error("Erreur beta/capacity:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/waitlist/qualified — capture la waitlist enrichie avec intention de payer
  app.post("/api/waitlist/qualified", waitlistLimiter, async (req, res) => {
    try {
      const { email, source, pricingIntent, triggerFeatures } = req.body;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || typeof email !== "string" || !emailRegex.test(email)) {
        return res.status(400).json({ error: "Email invalide" });
      }
      const { db } = await import("./db");
      await db
        .insert(betaWaitlist)
        .values({
          email: email.toLowerCase().trim().slice(0, 320),
          source: source ? String(source).slice(0, 80) : "qualified-form",
          pricingIntent: pricingIntent ? String(pricingIntent).slice(0, 20) : null,
          triggerFeatures: Array.isArray(triggerFeatures)
            ? triggerFeatures.map((f: unknown) => String(f).slice(0, 50)).slice(0, 10)
            : null,
        })
        .onConflictDoNothing();
      console.log(`📬 Waitlist qualifiée: ${maskEmail(email)} | prix: ${pricingIntent} | features: ${triggerFeatures}`);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Erreur waitlist qualifiée:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/admin/feedback-dashboard — agrégats match_feedback + beta_feedback + waitlist qualifiée
  app.get("/api/admin/feedback-dashboard", requireAdmin, async (req, res) => {
    try {
      const { db } = await import("./db");
      const { desc, count, countDistinct } = await import("drizzle-orm");

      // match_feedback : votes par rating
      const matchVotes = await db
        .select({ rating: matchFeedback.rating, total: count() })
        .from(matchFeedback)
        .groupBy(matchFeedback.rating);

      // beta_feedback : 20 derniers
      const recentBetaFeedback = await db
        .select()
        .from(betaFeedback)
        .orderBy(desc(betaFeedback.createdAt))
        .limit(20);

      // waitlist qualifiée : toutes les entrées (max 200)
      const qualifiedWaitlist = await db
        .select()
        .from(betaWaitlist)
        .orderBy(desc(betaWaitlist.createdAt))
        .limit(200);

      // cap courant
      const cap = parseInt(process.env.BETA_CAP ?? "150", 10);
      const [capRow] = await db
        .select({ count: countDistinct(formSubmissions.email) })
        .from(formSubmissions);
      const betaCount = Number(capRow?.count ?? 0);

      // taux utilisation match_feedback (votes / soumissions)
      const totalVotes = matchVotes.reduce((s, r) => s + Number(r.total), 0);

      // Aggregation par source d'acquisition (GROWTH-03) avec emails uniques + cap par source
      const capPerSource = parseInt(process.env.BETA_CAP_PER_SOURCE ?? "25", 10);
      const sourceBreakdown = await db
        .select({ source: formSubmissions.source, total: countDistinct(formSubmissions.email) })
        .from(formSubmissions)
        .groupBy(formSubmissions.source)
        .orderBy(desc(countDistinct(formSubmissions.email)));

      const sourceBreakdownWithCap = sourceBreakdown.map((s) => ({
        source: s.source,
        count: Number(s.total),
        cap: capPerSource,
        isFull: Number(s.total) >= capPerSource,
      }));

      res.json({
        betaCapacity: { count: betaCount, cap, isFull: betaCount >= cap },
        matchFeedback: { byRating: matchVotes, totalVotes },
        recentBetaFeedback,
        qualifiedWaitlist,
        sourceBreakdown: sourceBreakdownWithCap,
        capPerSource,
      });
    } catch (error: any) {
      console.error("Erreur feedback-dashboard:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Route pour créer une session de paiement Stripe
  app.post("/api/create-checkout-session", checkoutLimiter, async (req, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ error: "Paiement non disponible (mode gratuit)" });
      }

      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({ error: "Session ID required" });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: "Accès complet aux résultats",
                description: "Débloquez toutes les subventions matchées",
              },
              unit_amount: 800,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.headers.origin}/results/${sessionId}?payment=success`,
        cancel_url: `${req.headers.origin}/results/${sessionId}?payment=cancelled`,
        metadata: {
          sessionId,
        },
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Erreur Stripe:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Webhook Stripe - Envoi automatique du PDF après paiement
  app.post("/api/webhook/stripe", express.raw({ type: "application/json" }), async (req, res) => {
    if (!stripe) {
      return res.status(503).send("Stripe not configured");
    }

    const sig = req.headers["stripe-signature"];

    if (!sig) {
      console.error("❌ No Stripe signature");
      return res.status(400).send("No signature");
    }

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );

      console.log(`🔔 Webhook received: ${event.type}`);

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const sessionId = session.metadata?.sessionId;

        if (!sessionId) {
          console.error("❌ No sessionId in metadata");
          return res.status(400).send("No sessionId");
        }

        console.log(`💳 Payment confirmed for session: ${maskSessionId(sessionId)}`);

        // Marquer la session comme payée
        await storage.markAsPaid(sessionId);
        console.log(`✅ Session ${maskSessionId(sessionId)} marked as paid`);

        // Récupérer les résultats et l'email
        const submission = await storage.getFormSubmission(sessionId);

        if (!submission) {
          console.error(`❌ Submission not found: ${sessionId}`);
          return res.status(404).send("Submission not found");
        }

        if (!submission.results || !Array.isArray(submission.results)) {
          console.error(`❌ No results for session: ${sessionId}`);
          return res.status(400).send("No results");
        }

        console.log(`📧 Preparing to send email to: ${maskEmail(submission.email)}`);
        console.log(`📋 Number of grants: ${submission.results.length}`);

        // Récupérer les informations complètes des subventions
        const grantsWithDetails = await Promise.all(
          submission.results.map(async (result: any) => {
            const grant = await grantStorage.getGrantById(result.grantId);
            return grant ? { ...grant, matchScore: result.matchScore } : null;
          })
        );

        const validGrants = grantsWithDetails.filter((g): g is NonNullable<typeof g> => g !== null);

        if (validGrants.length === 0) {
          console.error(`❌ No valid grants found for session: ${sessionId}`);
          return res.status(500).send("No valid grants");
        }

        // Générer et sauvegarder le PDF
        console.log("📄 Generating and saving PDF...");
        const { buffer: pdfBuffer, path: pdfPath } = await generateAndSaveGrantsPDF({
          grants: validGrants,
          userEmail: submission.email,
          formData: submissionToPdfFormData(submission),
        }, sessionId);
        console.log(`✅ PDF generated and saved (${pdfBuffer.length} bytes) at ${pdfPath}`);
        
        // Sauvegarder le chemin du PDF dans la base
        await storage.savePdfPath(sessionId, pdfPath);
        console.log(`✅ PDF path saved to database`);

        // Envoyer l'email avec le PDF
        console.log("📨 Sending email...");
        await sendGrantsEmail({
          to: submission.email,
          grantsCount: validGrants.length,
          pdfBuffer,
        });
        console.log(`✅ Email sent successfully to ${maskEmail(submission.email)}`);
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error("❌ Webhook error:", error);
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  });

  // ==================== GRANTS MANAGEMENT (pour Dust) ====================

  /**
   * POST /api/grants - Créer une nouvelle subvention (pour votre agent Dust)
   */
  app.post("/api/grants", requireAdmin, async (req, res) => {
    try {
      const grantData: InsertGrant = req.body;
      
      // Validation basique
      if (!grantData.title || !grantData.organization || !grantData.eligibility) {
        return res.status(400).json({ 
          error: "title, organization, and eligibility are required" 
        });
      }

      const created = await grantStorage.createGrant(grantData);
      
      console.log(`✅ Nouvelle subvention ajoutée : "${created.title}"`);
      
      res.status(201).json({ 
        success: true, 
        grant: created,
        message: "Grant created successfully" 
      });
    } catch (error: any) {
      console.error("Error creating grant:", error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/grants - Récupérer toutes les subventions actives
   */
  app.get("/api/grants", async (req, res) => {
    try {
      const grants = await grantStorage.getAllActiveGrants();
      res.json({ grants });
    } catch (error: any) {
      console.error("Error fetching grants:", error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/admin/grants - Route admin pour récupérer TOUTES les subventions
   */
  app.get("/api/admin/grants", requireAdmin, async (req, res) => {
    try {
      const grants = await grantStorage.getAllActiveGrants();
      res.json(grants);
    } catch (error: any) {
      console.error("Error fetching grants:", error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/grants/count - Récupérer le nombre total de subventions actives
   */
  app.get("/api/grants/count", async (req, res) => {
    try {
      const count = await grantStorage.countActiveGrants();
      res.json({ count });
    } catch (error: any) {
      console.error("Erreur lors du comptage des subventions:", error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/grants/stats - Récupérer les statistiques détaillées
   */
  app.get("/api/grants/stats", async (req, res) => {
    try {
      const allGrants = await grantStorage.getAllActiveGrants();
      
      const euCount = allGrants.filter(isEuropeanGrant).length;
      const stats = {
        total: allGrants.length,
        euGrants: euCount,
        frenchGrants: allGrants.length - euCount,
        withDeadline: allGrants.filter(g => g.deadline).length,
        withUrl: allGrants.filter(g => g.url).length,
      };
      
      res.json(stats);
    } catch (error: any) {
      console.error("Erreur lors de la récupération des stats:", error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/grants/stats-detail - Statistiques détaillées de remplissage par colonne
   */
  app.get("/api/grants/stats-detail", async (req, res) => {
    try {
      const stats = await getGrantsStatistics();
      const overall = await getOverallStats();
      
      res.json({
        overall,
        columns: stats.columns,
        total: stats.total,
      });
    } catch (error: any) {
      console.error("Erreur lors de la récupération des stats détaillées:", error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/grants/:id - Récupérer une subvention par ID
   */
  app.get("/api/grants/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const grant = await grantStorage.getGrantById(id);
      
      if (!grant) {
        return res.status(404).json({ error: "Grant not found" });
      }
      
      res.json({ grant });
    } catch (error: any) {
      console.error("Error fetching grant:", error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * PUT /api/grants/:id - Mettre à jour une subvention
   */
  app.put("/api/grants/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates: Partial<InsertGrant> = req.body;
      
      const updated = await grantStorage.updateGrant(id, updates);
      
      if (!updated) {
        return res.status(404).json({ error: "Grant not found" });
      }
      
      res.json({ 
        success: true, 
        grant: updated,
        message: "Grant updated successfully" 
      });
    } catch (error: any) {
      console.error("Error updating grant:", error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * DELETE /api/grants/:id - Archiver une subvention
   */
  app.delete("/api/grants/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await grantStorage.deleteGrant(id);
      
      res.json({ 
        success: true,
        message: "Grant archived successfully" 
      });
    } catch (error: any) {
      console.error("Error archiving grant:", error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/test-aides-territoires - Tester la connexion à l'API Aides et Territoires
   */
  app.get("/api/test-aides-territoires", async (req, res) => {
    try {
      console.log("🧪 Testing Aides et Territoires API...");
      const result = await testApiConnection();
      
      res.json({
        success: result.success,
        message: result.message,
        totalCount: result.totalCount,
        sampleAids: result.sampleAids?.map(aid => ({
          id: aid.id,
          name: aid.name,
          description: aid.description?.substring(0, 200) + "...",
          financers: aid.financers?.map(f => f.name).join(", "),
          perimeter: aid.perimeter?.name,
          deadline: aid.submission_deadline,
          url: aid.application_url,
        })),
      });
    } catch (error: any) {
      console.error("❌ API test failed:", error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  });

  /**
   * Helper: résout le pdfPath pour un sessionId, régénère le PDF si le cache
   * a été purgé (Railway /tmp est wipé à chaque restart), puis envoie le fichier.
   * Utilisé par les deux routes PDF (capability raw sessionId + token signé admin).
   */
  async function servePdfForSession(sessionId: string, res: any) {
    const submission = await storage.getFormSubmission(sessionId);
    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    const fs = await import("fs");
    const cacheMissing = !submission.pdfPath || !fs.existsSync(submission.pdfPath);
    let pdfPath = submission.pdfPath || "";

    if (cacheMissing) {
      const results = (submission.results as any[]) || [];
      if (results.length === 0) {
        return res.status(404).json({ error: "No grants matched — nothing to render." });
      }
      const grantsWithDetails = await Promise.all(
        results.map(async (result: any) => {
          const grant = await grantStorage.getGrantById(result.grantId);
          return grant
            ? { ...grant, matchScore: result.matchScore, matchReason: result.matchReason }
            : null;
        }),
      );
      const validGrants = grantsWithDetails.filter(
        (g): g is NonNullable<typeof g> => g !== null,
      );
      if (validGrants.length === 0) {
        return res.status(404).json({ error: "No valid grants resolvable from cached results." });
      }
      const { path: freshPath } = await generateAndSaveGrantsPDF(
        {
          grants: validGrants,
          userEmail: submission.email,
          formData: submissionToPdfFormData(submission),
        },
        sessionId,
      );
      await storage.savePdfPath(sessionId, freshPath);
      pdfPath = freshPath;
    }

    res.setHeader("Content-Disposition", `inline; filename="subventions_${sessionId}.pdf"`);
    const isAbsolute = pdfPath.startsWith("/") || /^[A-Za-z]:[\\/]/.test(pdfPath);
    if (isAbsolute) {
      res.sendFile(pdfPath);
    } else {
      res.sendFile(pdfPath, { root: process.cwd() });
    }
  }

  /**
   * GET /api/pdf/:sessionId - Capability sessionId (flow utilisateur).
   * Le sessionId (UUIDv4, 122 bits d'entropie) sert de bearer. Rate-limité et
   * validé par regex en défense en profondeur.
   */
  app.get("/api/pdf/:sessionId", pdfDownloadLimiter, async (req, res) => {
    try {
      const { sessionId } = req.params;
      if (!UUID_RE.test(sessionId)) {
        return res.status(400).json({ error: "Invalid session ID format." });
      }
      await servePdfForSession(sessionId, res);
    } catch (error: any) {
      console.error("Error serving PDF:", error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/pdf/signed/:token - Lien admin signé, à courte durée (15 min).
   * Utilisé quand l'admin partage un lien par ex. dans Slack ou un mail: si le
   * lien fuit, il expire vite et ne révèle pas le sessionId brut.
   */
  app.get("/api/pdf/signed/:token", pdfDownloadLimiter, async (req, res) => {
    try {
      const { token } = req.params;
      const verified = verifyPdfToken(token);
      if (!verified) {
        return res.status(401).json({ error: "Lien expiré ou invalide." });
      }
      await servePdfForSession(verified.sessionId, res);
    } catch (error: any) {
      console.error("Error serving signed PDF:", error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/send-email/:sessionId - Envoyer le PDF par email (génère le PDF si nécessaire)
   */
  app.post("/api/send-email/:sessionId", emailLimiter, async (req, res) => {
    try {
      const { sessionId } = req.params;
      console.log(`📧 [send-email] Recherche de la session: ${maskSessionId(sessionId)}`);
      
      const submission = await storage.getFormSubmission(sessionId);
      
      if (!submission) {
        console.log(`❌ [send-email] Submission not found for session: ${maskSessionId(sessionId)}`);
        return res.status(404).json({ error: "Submission not found" });
      }
      
      console.log(`📧 [send-email] Submission trouvée, pdfPath: ${submission.pdfPath ? "yes" : "no"}, email: ${maskEmail(submission.email)}`);
      
      let pdfBuffer: Buffer;

      // Check if the cached PDF file is still on disk (Railway /tmp is wiped
      // on every container restart, so a saved pdfPath may be stale).
      let cachedExists = false;
      if (submission.pdfPath) {
        const fs = await import('fs');
        cachedExists = fs.existsSync(submission.pdfPath);
        if (!cachedExists) {
          console.log(`⚠️ [send-email] Cached pdfPath ${submission.pdfPath} no longer exists — regenerating.`);
        }
      }

      // Si le PDF n'existe pas, le générer
      if (!submission.pdfPath || !cachedExists) {
        console.log(`📄 [send-email] Generating PDF for session: ${maskSessionId(sessionId)}...`);
        
        // Récupérer les détails complets des subventions
        const results = submission.results as any[] || [];
        const grantsWithDetails = await Promise.all(
          results.map(async (result: any) => {
            const grant = await grantStorage.getGrantById(result.grantId);
            return grant ? { ...grant, matchScore: result.matchScore, matchReason: result.matchReason } : null;
          })
        );
        
        const validGrants = grantsWithDetails.filter((g): g is NonNullable<typeof g> => g !== null);
        
        if (validGrants.length === 0) {
          return res.status(400).json({ error: "No valid grants found" });
        }
        
        const { buffer, path: pdfPath } = await generateAndSaveGrantsPDF({
          grants: validGrants,
          userEmail: submission.email,
          formData: submissionToPdfFormData(submission),
        }, sessionId);

        pdfBuffer = buffer;
        await storage.savePdfPath(sessionId, pdfPath);
        console.log(`✅ [send-email] PDF generated and saved at ${pdfPath}`);
      } else {
        const fs = await import('fs');
        pdfBuffer = fs.readFileSync(submission.pdfPath);
      }

      console.log(`📧 Sending email with PDF to ${maskEmail(submission.email)}...`);
      
      await sendGrantsEmail({
        to: submission.email,
        grantsCount: (submission.results as any[])?.length || 0,
        pdfBuffer: pdfBuffer,
      });
      
      res.json({ success: true, message: "Email sent successfully" });
    } catch (error: any) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/admin/submissions - Liste toutes les soumissions (Admin)
   */
  app.get("/api/admin/submissions", requireAdmin, async (req, res) => {
    try {
      const submissions = await storage.getAllSubmissions();
      // Enrichit chaque soumission avec une URL PDF signée courte durée.
      // Les composants admin l'utilisent pour que les liens partagés soient
      // périssables (15 min) sans exposer le sessionId brut.
      const enriched = submissions.map((s) => {
        const token = s.pdfPath ? createPdfToken(s.sessionId) : null;
        return {
          ...s,
          pdfSignedUrl: token ? `/api/pdf/signed/${token}` : null,
        };
      });
      res.json(enriched);
    } catch (error: any) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/test-submit-and-send - TEST MODE: Soumission + AI + PDF + Email
   * Permet de tester le flow complet sans payer
   */
  app.post("/api/test-submit-and-send", requireAdmin, async (req, res) => {
    try {
      console.log("🧪 TEST MODE: Starting full flow without payment...");
      
      const parsedData = insertFormSubmissionSchema.parse(req.body);
      // Convert null to undefined for array fields
      const validatedData = {
        ...parsedData,
        status: parsedData.status ?? undefined,
        artisticDomain: parsedData.artisticDomain ?? undefined,
        projectType: parsedData.projectType ?? undefined,
        innovation: parsedData.innovation ?? undefined,
        socialDimension: parsedData.socialDimension ?? undefined,
        aidTypes: parsedData.aidTypes ?? undefined,
        geographicScope: parsedData.geographicScope ?? undefined,
      } as any;
      const submission = await storage.createFormSubmission(validatedData);
      
      console.log(`📝 Form submitted with session: ${maskSessionId(submission.sessionId)}`);
      
      // Matcher avec l'IA
      console.log("🤖 Matching with AI...");
      const allGrants = await grantStorage.getAllActiveGrants();
      const formattedGrants = allGrants.map(formatGrantToResult);
      const matchedGrants = await matchGrantsWithAI(submission, formattedGrants);
      
      console.log(`✅ ${matchedGrants.length} grants matched`);
      
      // Sauvegarder les résultats
      await storage.updateFormResults(submission.sessionId, matchedGrants);
      
      // Marquer comme payé (mode test)
      await storage.markAsPaid(submission.sessionId);
      console.log("✅ Session marked as paid (test mode)");
      
      // Récupérer les détails complets des subventions
      const grantsWithDetails = await Promise.all(
        matchedGrants.map(async (result: any) => {
          const grant = await grantStorage.getGrantById(result.grantId);
          return grant ? { ...grant, matchScore: result.matchScore } : null;
        })
      );
      
      const validGrants = grantsWithDetails.filter((g): g is NonNullable<typeof g> => g !== null);
      
      if (validGrants.length === 0) {
        throw new Error("No valid grants found");
      }
      
      try {
        // Générer et sauvegarder le PDF
        console.log("📄 Generating and saving PDF...");
        const { buffer: pdfBuffer, path: pdfPath } = await generateAndSaveGrantsPDF({
          grants: validGrants,
          userEmail: submission.email,
          formData: submissionToPdfFormData(submission),
        }, submission.sessionId);
        console.log(`✅ PDF generated and saved (${pdfBuffer.length} bytes) at ${pdfPath}`);
        
        // Sauvegarder le chemin du PDF dans la base
        await storage.savePdfPath(submission.sessionId, pdfPath);
        console.log(`✅ PDF path saved to database`);
        
        // Envoyer l'email
        console.log(`📨 Sending email to ${maskEmail(submission.email)}...`);
        await sendGrantsEmail({
          to: submission.email,
          grantsCount: validGrants.length,
          pdfBuffer,
        });
        console.log("✅ Email sent successfully!");
      } catch (pdfError: any) {
        console.warn("⚠️  PDF/Email skipped (Chrome not available):", pdfError.message);
      }
      
      res.json({
        success: true,
        sessionId: submission.sessionId,
        grantsCount: matchedGrants.length,
        email: submission.email,
        matchedGrants: matchedGrants.map((g: any) => ({
          title: g.title,
          organization: g.organization,
          matchScore: g.matchScore,
          matchReason: g.matchReason,
        })),
        message: "Test completed successfully! Grants matched with AI.",
      });
    } catch (error: any) {
      console.error("❌ Test flow error:", error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  });

  // Route pour récupérer les subventions enrichies (démo)
  app.get("/api/demo-enriched", async (req, res) => {
    try {
      const enrichedGrants = await grantStorage.getEnrichedGrants();
      console.log(`📚 ${enrichedGrants.length} subventions enrichies récupérées`);
      
      const formattedGrants = enrichedGrants.map(formatGrantToResult);
      
      res.json(formattedGrants);
    } catch (error: any) {
      console.error("Erreur lors de la récupération des subventions enrichies:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Route pour envoyer un email de test
  app.post("/api/test-email", requireAdmin, async (req, res) => {
    try {
      const { email } = req.body;
      const testEmail = email || "oscarinternship@gmail.com";
      
      console.log(`📧 Envoi d'un email de test à ${maskEmail(testEmail)}...`);
      
      // Récupérer 5 subventions pour le test
      const allGrants = await grantStorage.getAllActiveGrants();
      const testGrants = allGrants.slice(0, 5).map(formatGrantToResult);
      
      // Ajouter des infos de matching fictives
      const grantsWithMatch = testGrants.map((grant, idx) => ({
        ...grant,
        matchScore: 90 - idx * 5,
        matchReason: `Subvention test ${idx + 1} - Correspond parfaitement à votre profil artistique et à votre localisation géographique.`
      }));
      
      // Générer le PDF
      console.log("📄 Génération du PDF de test...");
      const { buffer, path } = await generateAndSaveGrantsPDF(
        {
          grants: grantsWithMatch as any,
          userEmail: testEmail
        },
        `test-${Date.now()}`
      );
      
      console.log(`✅ PDF généré: ${path}`);
      
      // Envoyer l'email
      await sendGrantsEmail({
        to: testEmail,
        grantsCount: grantsWithMatch.length,
        pdfBuffer: buffer
      });
      
      console.log("✅ Email de test envoyé avec succès!");
      
      res.json({
        success: true,
        message: `Email envoyé à ${testEmail} avec ${grantsWithMatch.length} subventions`,
        email: testEmail,
        grantsCount: grantsWithMatch.length
      });
    } catch (error: any) {
      console.error("❌ Erreur lors de l'envoi de l'email de test:", error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  });

  // === ROUTES D'ENRICHISSEMENT ===
  
  // GET /api/enrichment/status - Statut du service d'enrichissement
  app.get("/api/enrichment/status", async (req, res) => {
    try {
      const stats = await grantStorage.getEnrichmentStats();
      res.json({
        isRunning: stats.inProgress > 0,
        pending: stats.pending,
        completed: stats.completed,
        failed: stats.failed,
      });
    } catch (error: any) {
      console.error("❌ Erreur statut enrichissement:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/enrichment/start - Lancer l'enrichissement automatique
  app.post("/api/enrichment/start", requireAdmin, async (req, res) => {
    try {
      const { limit: maxGrants } = req.body;

      // Analyser la qualité et grouper les issues
      const report = await analyzeDataQuality();
      const grantIssuesMap = new Map<string, any[]>();
      report.issuesFound
        .filter((i) => i.severity === "critical" || i.severity === "warning")
        .forEach((issue) => {
          const existing = grantIssuesMap.get(issue.grantId) || [];
          grantIssuesMap.set(issue.grantId, [...existing, issue]);
        });

      let requests = Array.from(grantIssuesMap.entries()).map(
        ([grantId, issues]) => ({ grantId, issues })
      );

      if (maxGrants && maxGrants > 0) {
        requests = requests.slice(0, maxGrants);
      }

      if (requests.length === 0) {
        return res.json({ success: true, message: "Aucune subvention à enrichir", count: 0 });
      }

      // Lancer en arrière-plan
      enrichMultipleGrants(requests).catch((err) => {
        console.error("❌ Erreur enrichissement batch:", err);
      });

      res.json({
        success: true,
        message: `Enrichissement démarré pour ${requests.length} subventions`,
        count: requests.length,
      });
    } catch (error: any) {
      console.error("❌ Erreur démarrage enrichissement:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/enrichment/stats - Stats d'enrichissement
  app.get("/api/enrichment/stats", async (req, res) => {
    try {
      const stats = await grantStorage.getEnrichmentStats();
      res.json(stats);
    } catch (error: any) {
      console.error("❌ Erreur stats enrichissement:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/enrichment/grants - Liste des subventions avec statut enrichissement
  app.get("/api/enrichment/grants", async (req, res) => {
    try {
      const allGrants = await grantStorage.getAllActiveGrants();
      
      // Formater pour l'affichage
      const grants = allGrants.map(grant => ({
        id: grant.id,
        title: grant.title,
        organization: grant.organization,
        enrichmentStatus: grant.enrichmentStatus,
        enrichmentDate: grant.enrichmentDate,
        enrichmentError: grant.enrichmentError,
        amount: grant.amount,
        amountMin: grant.amountMin,
        amountMax: grant.amountMax,
        deadline: grant.deadline,
        contactEmail: grant.contactEmail,
        processingTime: grant.processingTime,
        applicationDifficulty: grant.applicationDifficulty,
      }));
      
      res.json(grants);
    } catch (error: any) {
      console.error("❌ Erreur liste grants:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/organisms/stats - Stats des organismes
  app.get("/api/organisms/stats", async (req, res) => {
    try {
      const { db } = await import("./db");
      const { sql } = await import("drizzle-orm");
      const result = await db.execute(sql`
        SELECT 
          COUNT(*)::integer as total,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)::integer as pending,
          SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END)::integer as "inProgress",
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)::integer as completed,
          SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END)::integer as failed,
          SUM(COALESCE(total_aids_found, 0))::integer as "totalAidsFound",
          SUM(COALESCE(total_aids_added, 0))::integer as "totalAidsAdded"
        FROM organisms_tracking
      `);
      res.json(result.rows[0] || { total: 0, pending: 0, inProgress: 0, completed: 0, failed: 0, totalAidsFound: 0, totalAidsAdded: 0 });
    } catch (error: any) {
      console.error("❌ Error fetching organism stats:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/organisms - Liste des organismes
  app.get("/api/organisms", async (req, res) => {
    try {
      const { db } = await import("./db");
      const { sql } = await import("drizzle-orm");
      const result = await db.execute(sql`
        SELECT 
          id,
          name,
          type,
          sector,
          website,
          status,
          total_aids_found as "totalAidsFound",
          total_aids_added as "totalAidsAdded",
          last_scraped_at as "lastScrapedAt",
          notes
        FROM organisms_tracking
        ORDER BY 
          CASE status 
            WHEN 'in_progress' THEN 1
            WHEN 'pending' THEN 2
            WHEN 'completed' THEN 3
            WHEN 'failed' THEN 4
          END,
          name
      `);
      res.json(result.rows);
    } catch (error: any) {
      console.error("❌ Error fetching organisms:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/organisms/scrape - Lancer le scraping automatique des organismes
  app.post("/api/organisms/scrape", requireAdmin, async (req, res) => {
    try {
      const { organismScraperService } = await import("./organism-scraper");
      
      if (organismScraperService.isScrapingInProgress()) {
        return res.status(400).json({ error: "Scraping déjà en cours" });
      }

      // Lancer en arrière-plan
      organismScraperService.scrapeAll().catch(err => {
        console.error("❌ Erreur scraping organismes:", err);
      });

      res.json({ 
        success: true,
        message: "Scraping des organismes démarré en arrière-plan"
      });
    } catch (error: any) {
      console.error("❌ Error starting organism scraping:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/organisms/scrape/status - Statut du scraping
  app.get("/api/organisms/scrape/status", async (req, res) => {
    try {
      const { organismScraperService } = await import("./organism-scraper");
      res.json({ 
        isRunning: organismScraperService.isScrapingInProgress()
      });
    } catch (error: any) {
      console.error("❌ Error checking scraping status:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/download-database - Télécharger le SQL export
  app.get("/api/download-database", async (req, res) => {
    try {
      const path = await import("path");
      const filePath = path.resolve(process.cwd(), "database_export.sql");
      res.download(filePath, "subventionmatch_database.sql");
    } catch (error: any) {
      console.error("❌ Error downloading database:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/example-pdf - Générer et afficher un PDF d'exemple
  app.get("/api/example-pdf", async (req, res) => {
    try {
      // Récupérer 5 subventions pour l'exemple
      const allGrants = await grantStorage.searchGrants({});
      const exampleGrants = allGrants.slice(0, 5);

      if (exampleGrants.length === 0) {
        return res.status(404).json({ error: "Aucune subvention trouvée" });
      }

      // Générer le PDF avec des données de formulaire d'exemple
      const pdfBuffer = await generateGrantsPDF({
        grants: exampleGrants,
        userEmail: "exemple@email.fr",
        formData: {
          status: ["Artiste indépendant", "Association"],
          artisticDomain: ["Musique", "Spectacle vivant"],
          region: "Île-de-France",
          projectDescription: "Création d'un spectacle musical mêlant théâtre contemporain et musique électronique. Le projet vise à explorer la relation entre l'humain et la technologie à travers une performance immersive.",
          projectType: ["Création artistique", "Tournée"],
          projectStage: "En développement",
          isInternational: "Oui",
          urgency: "Moins de 3 mois",
          email: "exemple@email.fr",
        },
      });

      // Envoyer le PDF directement dans le navigateur
      res.contentType("application/pdf");
      res.setHeader("Content-Disposition", 'inline; filename="exemple_subventions.pdf"');
      res.send(pdfBuffer);
    } catch (error: any) {
      console.error("❌ Error generating example PDF:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/data-quality - Analyse de qualité des données
  app.get("/api/data-quality", async (req, res) => {
    try {
      const report = await analyzeDataQuality();
      res.json(report);
    } catch (error: any) {
      console.error("❌ Error analyzing data quality:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/html-analysis - Analyse la présence de HTML
  app.get("/api/html-analysis", async (req, res) => {
    try {
      const { analyzeHtmlPresence } = await import('./html-cleaner');
      const report = await analyzeHtmlPresence();
      res.json(report);
    } catch (error: any) {
      console.error("❌ Error analyzing HTML:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/clean-html - Nettoyer le HTML de toutes les subventions (ADMIN)
  app.post("/api/clean-html", requireAdmin, async (req, res) => {
    try {
      const { cleanAllGrantsHtml } = await import('./html-cleaner');
      const report = await cleanAllGrantsHtml();
      res.json(report);
    } catch (error: any) {
      console.error("❌ Error cleaning HTML:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/clean-html/:id - Nettoyer le HTML d'une subvention (ADMIN)
  app.post("/api/clean-html/:id", requireAdmin, async (req, res) => {
    try {
      const { cleanGrantHtml } = await import('./html-cleaner');
      const result = await cleanGrantHtml(req.params.id);
      res.json(result || { message: "Aucun HTML à nettoyer" });
    } catch (error: any) {
      console.error("❌ Error cleaning grant HTML:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/grants-with-issues - Liste les subventions avec problèmes d'URL
  app.get("/api/grants-with-issues", async (req, res) => {
    try {
      const allGrants = await grantStorage.getAllActiveGrants();
      
      const grantsWithIssues = allGrants.filter(grant => {
        // Ne pas afficher si une URL améliorée a déjà été traitée
        if (grant.improvedUrl) return false;

        const url = grant.url || '';
        // Si l'URL contient déjà des mots-clés de "profondeur", elle est probablement bonne
        if (url.includes('candidat') || url.includes('aide') || url.includes('subvention') || url.includes('dispositif') || url.includes('demande') || url.includes('formulaire')) {
          return false;
        }

        const isMissing = !url;
        const isHomepage = url && (
          url.match(/^https?:\/\/[^\/]+\/?$/) || // Juste le domaine
          url.includes('/accueil') ||
          url.includes('/home') ||
          (!url.includes('subvention') && !url.includes('aide') && !url.includes('dispositif') && !url.includes('appel'))
        );
        return isMissing || isHomepage;
      }).map(grant => ({
        id: grant.id,
        title: grant.title,
        organization: grant.organization,
        url: grant.url || '(manquante)',
        improvedUrl: grant.improvedUrl,
        issue: !grant.url ? 'URL manquante' : 'URL potentiellement générique'
      }));
      
      res.json({
        total: grantsWithIssues.length,
        grants: grantsWithIssues.slice(0, 50) // Limiter à 50 pour performance
      });
    } catch (error: any) {
      console.error("❌ Error fetching grants with URL issues:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/deepsearch-urls - Utiliser l'IA pour trouver les URLs (ADMIN)
  app.post("/api/deepsearch-urls", requireAdmin, async (req, res) => {
    try {
      const { limit = 30 } = req.body;
      const { deepSearchAllUrls } = await import('./ai-url-searcher');
      const result = await deepSearchAllUrls(limit);
      res.json(result);
    } catch (error: any) {
      console.error("❌ Error in deepsearch-urls:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/deepsearch-url/:id - DeepSearch IA pour une subvention spécifique (ADMIN)
  app.post("/api/deepsearch-url/:id", requireAdmin, async (req, res) => {
    try {
      const { deepSearchUrl } = await import('./ai-url-searcher');
      const result = await deepSearchUrl(req.params.id);
      res.json(result);
    } catch (error: any) {
      console.error("❌ Error in deepsearch-url single:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/check-deadlines - Vérifier les deadlines expirées (ADMIN)
  app.get("/api/check-deadlines", requireAdmin, async (req, res) => {
    try {
      const { checkDeadlines } = await import('./deadline-checker');
      const result = await checkDeadlines();
      res.json(result);
    } catch (error: any) {
      console.error("❌ Error checking deadlines:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/archive-expired - Archiver les subventions expirées (ADMIN)
  app.post("/api/archive-expired", requireAdmin, async (req, res) => {
    try {
      const { archiveExpiredGrants } = await import('./deadline-checker');
      const result = await archiveExpiredGrants();
      res.json(result);
    } catch (error: any) {
      console.error("❌ Error archiving expired grants:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/refresh-status - Statut du rafraîchissement automatique (ADMIN)
  app.get("/api/refresh-status", requireAdmin, async (req, res) => {
    try {
      const { autoRefreshScheduler } = await import('./auto-refresh-scheduler');
      const status = autoRefreshScheduler.getStatus();
      res.json(status);
    } catch (error: any) {
      console.error("❌ Error getting refresh status:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/run-refresh - Lancer un rafraîchissement manuel (ADMIN)
  app.post("/api/run-refresh", requireAdmin, async (req, res) => {
    try {
      const { autoRefreshScheduler } = await import('./auto-refresh-scheduler');
      const result = await autoRefreshScheduler.runManualRefresh();
      res.json(result);
    } catch (error: any) {
      console.error("❌ Error running refresh:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/fix-urls - Corriger automatiquement les URLs (ADMIN)
  app.post("/api/fix-urls", requireAdmin, async (req, res) => {
    try {
      const { limit = 10 } = req.body;
      const { fixAllUrls } = await import('./url-fixer');
      const report = await fixAllUrls(limit);
      res.json(report);
    } catch (error: any) {
      console.error("❌ Error fixing URLs:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/fix-url/:id - Corriger une URL spécifique (ADMIN)
  app.post("/api/fix-url/:id", requireAdmin, async (req, res) => {
    try {
      const { fixSingleUrl } = await import('./url-fixer');
      const result = await fixSingleUrl(req.params.id);
      if (!result) {
        return res.status(404).json({ error: "Subvention non trouvée" });
      }
      res.json(result);
    } catch (error: any) {
      console.error("❌ Error fixing single URL:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // PATCH /api/grants/:id/url - Mettre à jour l'URL d'une subvention (ADMIN)
  app.patch("/api/grants/:id/url", requireAdmin, async (req, res) => {
    try {
      const { url, improvedUrl } = req.body;
      const grantId = req.params.id;
      
      const updates: any = {};
      if (url !== undefined) updates.url = url;
      if (improvedUrl !== undefined) updates.improvedUrl = improvedUrl;
      
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "Aucune URL fournie" });
      }
      
      const { db } = await import('./db');
      const { grants } = await import('@shared/schema');
      const { eq } = await import('drizzle-orm');
      
      await db.update(grants)
        .set(updates)
        .where(eq(grants.id, grantId));
      
      res.json({ success: true, updated: updates });
    } catch (error: any) {
      console.error("❌ Error updating grant URL:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/enrich-grant/:id - Enrichir une subvention avec l'IA (ADMIN)
  app.post("/api/enrich-grant/:id", requireAdmin, async (req, res) => {
    try {
      const grantId = req.params.id;
      const { issues } = req.body;

      if (!issues || !Array.isArray(issues)) {
        return res.status(400).json({ error: "Issues array is required" });
      }

      const { enrichGrant } = await import('./ai-enricher');
      const result = await enrichGrant(grantId, issues);
      
      res.json(result);
    } catch (error: any) {
      console.error("❌ Error enriching grant:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/enrich-multiple - Enrichir plusieurs subventions en batch (ADMIN)
  app.post("/api/enrich-multiple", requireAdmin, async (req, res) => {
    try {
      const { requests } = req.body;

      if (!requests || !Array.isArray(requests)) {
        return res.status(400).json({ error: "Requests array is required" });
      }

      const { enrichMultipleGrants } = await import('./ai-enricher');
      const results = await enrichMultipleGrants(requests);
      
      res.json(results);
    } catch (error: any) {
      console.error("❌ Error enriching multiple grants:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/organisms - Lister tous les organismes de scraping
  app.get("/api/organisms", async (req, res) => {
    try {
      const { db } = await import('./db');
      const { organismsTracking } = await import('@shared/schema');
      
      const organisms = await db.select().from(organismsTracking);
      res.json(organisms);
    } catch (error: any) {
      console.error("❌ Error fetching organisms:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/scrape-organism/:id - Lancer le scraping d'un organisme
  app.post("/api/scrape-organism/:id", requireAdmin, async (req, res) => {
    try {
      const organismId = req.params.id;
      
      const { scrapeOrganism } = await import('./scraping-system');
      const result = await scrapeOrganism(organismId);
      
      res.json(result);
    } catch (error: any) {
      console.error("❌ Error scraping organism:", error);
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
