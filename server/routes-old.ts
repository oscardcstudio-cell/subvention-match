import type { Express } from "express";
import { z } from "zod";
import { insertFormSubmissionSchema, type InsertGrant, type Grant } from "@shared/schema";
import { storage } from "./storage";
import { grantStorage } from "./grant-storage";
import { matchGrantsWithAI } from "./ai-matcher";
import Stripe from "stripe";
import { fetchAllNotionGrants, fetchNotionPageAsGrant } from "./notion-sync";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export function registerRoutes(app: Express) {
  // Route pour soumettre le formulaire
  app.post("/api/submit-form", async (req, res) => {
    try {
      const validatedData = insertFormSubmissionSchema.parse(req.body);
      
      const submission = await storage.createSubmission(validatedData);
      
      // Matcher avec l'IA en utilisant PostgreSQL
      console.log("🤖 Démarrage du matching IA avec PostgreSQL...");
      const allGrants = await grantStorage.getAllActiveGrants();
      console.log(`📚 ${allGrants.length} subventions disponibles en base`);
      
      const matchedGrants = await matchGrantsWithAI(validatedData, allGrants);
      console.log(`✅ ${matchedGrants.length} subventions matchées par l'IA`);
      
      // Sauvegarder les résultats
      await storage.updateSubmissionResults(submission.sessionId, matchedGrants);
      console.log("💾 Résultats sauvegardés");

      res.json({ sessionId: submission.sessionId });
    } catch (error: any) {
      console.error("Erreur lors de la soumission:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // Route pour récupérer les résultats
  app.get("/api/results/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const submission = await storage.getSubmission(sessionId);

      if (!submission) {
        return res.status(404).json({ error: "Session not found" });
      }

      res.json({
        results: submission.results || [],
        isPaid: submission.isPaid || false,
      });
    } catch (error: any) {
      console.error("Erreur lors de la récupération:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Route pour créer une session de paiement Stripe
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
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
              unit_amount: 200,
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

  // Webhook Stripe pour confirmer le paiement
  app.post(
    "/api/webhook",
    async (req, res) => {
      const sig = req.headers["stripe-signature"] as string;
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!webhookSecret) {
        console.error("STRIPE_WEBHOOK_SECRET not configured");
        return res.status(500).send("Webhook secret not configured");
      }

      let event;

      try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } catch (err: any) {
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const sessionId = session.metadata?.sessionId;

        if (sessionId) {
          await storage.markAsPaid(sessionId);
          console.log(`✅ Payment confirmed for session ${sessionId}`);
        }
      }

      res.json({ received: true });
    }
  );

  // ==================== GRANTS MANAGEMENT ====================

  /**
   * POST /api/grants - Créer une nouvelle subvention
   */
  app.post("/api/grants", async (req, res) => {
    try {
      const grantData: InsertGrant = req.body;
      
      // Validation basique
      if (!grantData.title || !grantData.organization) {
        return res.status(400).json({ 
          error: "Title and organization are required" 
        });
      }

      const created = await grantStorage.createGrant(grantData);
      
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
  app.put("/api/grants/:id", async (req, res) => {
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
  app.delete("/api/grants/:id", async (req, res) => {
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

  // ==================== NOTION SYNC ====================

  /**
   * POST /api/sync/notion-webhook - Webhook pour synchroniser une page Notion
   */
  app.post("/api/sync/notion-webhook", async (req, res) => {
    try {
      const { page_id, action } = req.body;
      
      if (!page_id) {
        return res.status(400).json({ error: "page_id is required" });
      }

      console.log(`🔔 Webhook Notion reçu: ${action} pour page ${page_id}`);

      // Extraire les données de la page Notion
      const notionGrant = await fetchNotionPageAsGrant(page_id);
      
      if (!notionGrant) {
        return res.status(400).json({ 
          error: "Unable to extract grant data from Notion page" 
        });
      }

      const grantData: InsertGrant = {
        title: notionGrant.title,
        organization: notionGrant.organization,
        eligibility: notionGrant.eligibility || "",
        amount: notionGrant.amount,
        deadline: notionGrant.deadline,
        aidType: notionGrant.aidType || "Subvention",
        grantType: notionGrant.grantType || "",
        description: notionGrant.description || "",
        webLink: notionGrant.webLink || "",
        region: notionGrant.region || "",
        domains: notionGrant.domains || [],
        targetAudience: notionGrant.targetAudience || [],
        projectStages: notionGrant.projectStages || [],
      };

      // Selon l'action, créer ou mettre à jour
      if (action === "created" || action === "updated") {
        // Vérifier si la subvention existe déjà (basé sur le titre + organisme)
        const existingGrants = await grantStorage.getAllActiveGrants();
        const existing = existingGrants.find(
          (g: Grant) => g.title === grantData.title && g.organization === grantData.organization
        );

        if (existing) {
          // Mise à jour
          await grantStorage.updateGrant(existing.id, grantData);
          console.log(`✅ Subvention mise à jour : ${grantData.title}`);
          res.json({ 
            success: true, 
            action: "updated",
            message: "Grant updated successfully" 
          });
        } else {
          // Création
          const created = await grantStorage.createGrant(grantData);
          console.log(`✅ Nouvelle subvention créée : ${grantData.title}`);
          res.json({ 
            success: true, 
            action: "created",
            grant: created,
            message: "Grant created successfully" 
          });
        }
      } else if (action === "deleted") {
        // Trouver et archiver la subvention
        const existingGrants = await grantStorage.getAllActiveGrants();
        const existing = existingGrants.find(
          (g: Grant) => g.title === grantData.title && g.organization === grantData.organization
        );
        
        if (existing) {
          await grantStorage.deleteGrant(existing.id);
          console.log(`✅ Subvention archivée : ${grantData.title}`);
          res.json({ 
            success: true, 
            action: "archived",
            message: "Grant archived successfully" 
          });
        } else {
          res.json({ 
            success: true, 
            action: "not_found",
            message: "Grant not found in database" 
          });
        }
      } else {
        res.status(400).json({ error: "Invalid action. Use 'created', 'updated', or 'deleted'" });
      }

    } catch (error: any) {
      console.error("Error processing Notion webhook:", error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/sync/notion-full - Synchronisation complète Notion → PostgreSQL
   */
  app.post("/api/sync/notion-full", async (req, res) => {
    try {
      console.log("🔄 Démarrage de la synchronisation complète Notion → PostgreSQL");
      
      // Récupérer toutes les subventions depuis Notion
      const notionGrants = await fetchAllNotionGrants();
      console.log(`📚 ${notionGrants.length} subventions trouvées dans Notion`);

      let created = 0;
      let updated = 0;
      let errors = 0;

      // Pour chaque subvention Notion, la synchroniser en PostgreSQL
      for (const notionGrant of notionGrants) {
        try {
          // Vérifier si elle existe déjà
          const existingGrants = await grantStorage.getAllActiveGrants();
          const existing = existingGrants.find(
            (g: Grant) => g.title === notionGrant.title && g.organization === notionGrant.organization
          );

          const grantData: InsertGrant = {
            title: notionGrant.title,
            organization: notionGrant.organization,
            eligibility: notionGrant.eligibility || "",
            amount: notionGrant.amount,
            deadline: notionGrant.deadline,
            aidType: notionGrant.aidType || "Subvention",
            grantType: notionGrant.grantType || "",
            description: notionGrant.description || "",
            webLink: notionGrant.webLink || "",
            region: notionGrant.region || "",
            domains: notionGrant.domains || [],
            targetAudience: notionGrant.targetAudience || [],
            projectStages: notionGrant.projectStages || [],
          };

          if (existing) {
            await grantStorage.updateGrant(existing.id, grantData);
            updated++;
          } else {
            await grantStorage.createGrant(grantData);
            created++;
          }
        } catch (error: any) {
          console.error(`❌ Erreur pour "${notionGrant.title}":`, error.message);
          errors++;
        }
      }

      console.log(`✅ Synchronisation terminée: ${created} créées, ${updated} mises à jour, ${errors} erreurs`);

      res.json({
        success: true,
        created,
        updated,
        errors,
        total: notionGrants.length,
      });

    } catch (error: any) {
      console.error("Error syncing Notion grants:", error);
      res.status(500).json({ error: error.message });
    }
  });

}
