import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Form submission schema
export const formSubmissions = pgTable("form_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  
  // Profile - OPTIONNELS
  status: text("status").array(),
  statusOther: text("status_other"),
  artisticDomain: text("artistic_domain").array(),
  artisticDomainOther: text("artistic_domain_other"),
  age: integer("age"), // Âge de l'utilisateur (optionnel, pour aides -25 ans)
  
  // Project details - OPTIONNELS
  projectDescription: text("project_description"),
  projectType: text("project_type").array(),
  projectTypeOther: text("project_type_other"),
  projectStage: text("project_stage"),
  
  // Location - région OBLIGATOIRE, reste optionnel
  region: text("region").notNull(),
  isInternational: text("is_international"),
  
  // Specifics (choix multiples) - OPTIONNELS
  innovation: text("innovation").array(),
  innovationOther: text("innovation_other"),
  socialDimension: text("social_dimension").array(),
  socialDimensionOther: text("social_dimension_other"),
  
  // Needs - OPTIONNELS
  urgency: text("urgency"),
  aidTypes: text("aid_types").array(),
  aidTypesOther: text("aid_types_other"),
  geographicScope: text("geographic_scope").array(),
  
  // Contact
  email: text("email").notNull(),
  
  // Results and payment
  results: jsonb("results"),
  isPaid: text("is_paid").default("false").notNull(),
  pdfPath: text("pdf_path"), // Chemin du PDF généré
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFormSubmissionSchema = createInsertSchema(formSubmissions).omit({
  id: true,
  createdAt: true,
});

// Schema for user input - TOUTES les questions sont optionnelles sauf l'email
export const userFormInputSchema = createInsertSchema(formSubmissions)
  .omit({
    id: true,
    sessionId: true,
    createdAt: true,
    results: true,
    isPaid: true,
    pdfPath: true,
  })
  .extend({
    // Rendre tous les champs optionnels sauf email et région
    status: z.array(z.string()).optional(),
    statusOther: z.string().optional(),
    artisticDomain: z.array(z.string()).optional(),
    artisticDomainOther: z.string().optional(),
    age: z.number().int().min(1).max(120).optional(), // Âge optionnel pour aides -25 ans
    projectDescription: z.string().optional(),
    projectType: z.array(z.string()).optional(),
    projectTypeOther: z.string().optional(),
    projectStage: z.string().optional(),
    region: z.string().min(1, "La région est obligatoire"), // Champ OBLIGATOIRE
    isInternational: z.string().optional(),
    email: z.string().email(), // Champ OBLIGATOIRE
  });

export type InsertFormSubmission = z.infer<typeof insertFormSubmissionSchema>;
export type UserFormInput = z.infer<typeof userFormInputSchema>;
export type FormSubmission = typeof formSubmissions.$inferSelect;

// Grants/Subventions table - Toutes les subventions culturelles françaises
export const grants = pgTable("grants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Informations principales
  title: text("title").notNull(),
  organization: text("organization").notNull(),
  amount: integer("amount"), // Montant en euros (null = variable)
  amountMin: integer("amount_min"), // Montant minimum si variable
  amountMax: integer("amount_max"), // Montant maximum si variable
  deadline: text("deadline"), // Date limite de soumission
  nextSession: text("next_session"), // Prochaine session si récurrent
  frequency: text("frequency"), // Fréquence des appels (annuel, permanent, etc.)
  isRecurring: boolean("is_recurring").default(false), // true = annuel/récurrent, false = ponctuel (one-shot)

  // Description
  description: text("description"), // Nature de l'aide
  eligibility: text("eligibility").notNull(), // Critères d'éligibilité
  requirements: text("requirements"), // Dossier à fournir
  obligatoryDocuments: text("obligatory_documents").array(), // Documents obligatoires
  
  // Métadonnées
  url: text("url"), // Lien web de base
  improvedUrl: text("improved_url"), // URL améliorée trouvée par scraping (plus spécifique)
  helpResources: jsonb("help_resources"), // Ressources d'aide extraites par scraping [{type, url, title}]
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  
  // Filtres et catégories
  grantType: text("grant_type").array(), // Type de subvention
  eligibleSectors: text("eligible_sectors").array(), // Secteurs éligibles
  geographicZone: text("geographic_zone").array(), // Zone géographique
  structureSize: text("structure_size").array(), // Taille structure éligible
  
  // Paramètres financiers
  maxFundingRate: integer("max_funding_rate"), // Taux de financement max (%)
  coFundingRequired: text("co_funding_required"), // Cofinancement requis (oui/non)
  cumulativeAllowed: text("cumulative_allowed"), // Exigence et cumul
  
  // Processus
  processingTime: text("processing_time"), // Durée d'instruction
  responseDelay: text("response_delay"), // Délai de réponse
  applicationDifficulty: text("application_difficulty"), // Difficulté du dossier (facile, moyen, difficile)
  
  // Statistiques
  acceptanceRate: integer("acceptance_rate"), // Taux d'acceptation (%)
  annualBeneficiaries: integer("annual_beneficiaries"), // Nombre de bénéficiaires annuel
  successProbability: text("success_probability"), // Probabilité de succès
  
  // Conseils
  preparationAdvice: text("preparation_advice"), // Conseils de préparation
  experienceFeedback: text("experience_feedback"), // Retours d'expérience
  
  // Métadonnées système
  priority: text("priority"), // Priorité (haute, moyenne, basse)
  status: text("status").default("active").notNull(), // active, inactive, archived
  
  // Enrichissement automatique
  enrichmentStatus: text("enrichment_status").default("pending"), // pending, in_progress, completed, failed
  enrichmentDate: timestamp("enrichment_date"), // Date du dernier enrichissement
  enrichmentError: text("enrichment_error"), // Message d'erreur si échec
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertGrantSchema = createInsertSchema(grants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertGrant = z.infer<typeof insertGrantSchema>;
export type Grant = typeof grants.$inferSelect;

// Table de tracking des organismes pour l'enrichissement automatique
export const organismsTracking = pgTable("organisms_tracking", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // foundation, collectivity, professional_org, ministry, etc.
  sector: text("sector").array(), // music, visual_arts, theater, etc.
  website: text("website"),
  status: text("status").default("pending").notNull(), // pending, in_progress, completed, failed
  totalAidsFound: integer("total_aids_found"),
  totalAidsAdded: integer("total_aids_added"),
  lastScrapedAt: timestamp("last_scraped_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertOrganismTrackingSchema = createInsertSchema(organismsTracking).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertOrganismTracking = z.infer<typeof insertOrganismTrackingSchema>;
export type OrganismTracking = typeof organismsTracking.$inferSelect;

// Feedback qualité des matches — les beta testeurs votent pertinent/pas pertinent
// sur chaque subvention proposée. Sert à tuner le prompt IA et mesurer la qualité.
export const matchFeedback = pgTable("match_feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  grantId: varchar("grant_id").notNull(),
  rating: text("rating").notNull(), // 'relevant' | 'not_relevant'
  comment: text("comment"), // commentaire libre optionnel
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMatchFeedbackSchema = createInsertSchema(matchFeedback).omit({
  id: true,
  createdAt: true,
});
export type InsertMatchFeedback = z.infer<typeof insertMatchFeedbackSchema>;
export type MatchFeedback = typeof matchFeedback.$inferSelect;

// Feedback general des beta testeurs (bugs, suggestions)
export const betaFeedback = pgTable("beta_feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // 'bug' | 'suggestion'
  message: text("message").notNull(),
  page: text("page"), // page d'ou le feedback a ete envoye
  userAgent: text("user_agent"),
  resolved: text("resolved").default("false"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type BetaFeedback = typeof betaFeedback.$inferSelect;

// Beta waitlist — emails captures depuis la homepage pour etre preven\u0301es quand la V1 payante sort
export const betaWaitlist = pgTable("beta_waitlist", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  source: text("source"), // ex: 'homepage-pricing', 'homepage-hero'
  notified: text("notified").default("false").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type BetaWaitlistEntry = typeof betaWaitlist.$inferSelect;

// Grant/Subvention result schema (from AI matching)
export const grantResultSchema = z.object({
  id: z.string(),
  grantId: z.string().optional(),
  
  // Infos principales
  title: z.string(),
  organization: z.string(),
  amount: z.string(),
  deadline: z.string(),
  frequency: z.string().optional(),
  isRecurring: z.boolean().optional(),
  nextSession: z.string().optional(),
  
  // Description et éligibilité
  description: z.string().optional(),
  eligibility: z.string().optional(),
  requirements: z.string().optional(),
  obligatoryDocuments: z.array(z.string()).optional(),
  
  // Contact et URLs
  url: z.string().optional(),
  improvedUrl: z.string().optional(),
  applicationUrl: z.string().optional(),
  helpResources: z.array(z.object({
    type: z.enum(['video', 'pdf', 'guide', 'tutorial']),
    url: z.string(),
    title: z.string(),
    description: z.string().optional(),
  })).optional(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  
  // Catégories et filtres
  grantType: z.array(z.string()).optional(),
  eligibleSectors: z.array(z.string()).optional(),
  geographicZone: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  region: z.string().optional(),
  
  // Paramètres financiers
  maxFundingRate: z.number().optional(),
  coFundingRequired: z.string().optional(),
  cumulativeAllowed: z.string().optional(),
  
  // Processus
  processingTime: z.string().optional(),
  responseDelay: z.string().optional(),
  applicationDifficulty: z.string().optional(),
  
  // Statistiques
  acceptanceRate: z.number().optional(),
  annualBeneficiaries: z.number().optional(),
  successProbability: z.string().optional(),
  
  // Conseils
  preparationAdvice: z.string().optional(),
  experienceFeedback: z.string().optional(),
  
  // Match IA
  matchScore: z.number().optional(),
  matchReason: z.string().optional(),
});

export type GrantResult = z.infer<typeof grantResultSchema>;

// Form data for frontend
export const formDataSchema = z.object({
  // Section 1: Profil créatif - OPTIONNEL
  status: z.array(z.string()).optional(),
  statusOther: z.string().optional(),
  artisticDomain: z.array(z.string()).optional(),
  artisticDomainOther: z.string().optional(),
  age: z.number().int().min(1).max(120).optional(), // Âge optionnel pour aides -25 ans
  
  // Section 2: Projet - OPTIONNEL
  projectDescription: z.string().optional(),
  projectType: z.array(z.string()).optional(),
  projectTypeOther: z.string().optional(),
  projectStage: z.string().optional(),
  
  // Section 3: Localisation - RÉGION OBLIGATOIRE, reste optionnel
  region: z.string().min(1, "Région requise"),
  isInternational: z.string().optional(),
  
  // Section 4: Spécificités (choix multiples) - OPTIONNELLES
  innovation: z.array(z.string()).optional(),
  innovationOther: z.string().optional(),
  socialDimension: z.array(z.string()).optional(),
  socialDimensionOther: z.string().optional(),
  
  // Section 5: Besoins - OPTIONNELS
  urgency: z.string().optional(),
  aidTypes: z.array(z.string()).optional(),
  aidTypesOther: z.string().optional(),
  geographicScope: z.array(z.string()).optional(),
  
  // Section 6: Contact - EMAIL OBLIGATOIRE
  email: z.string().email("Email valide requis"),
});

export type FormData = z.infer<typeof formDataSchema>;
