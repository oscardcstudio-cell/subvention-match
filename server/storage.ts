import { formSubmissions, type FormSubmission, type InsertFormSubmission, type GrantResult, type UserFormInput } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  createFormSubmission(submission: UserFormInput): Promise<FormSubmission>;
  getFormSubmission(sessionId: string): Promise<FormSubmission | undefined>;
  getAllSubmissions(): Promise<FormSubmission[]>;
  updateFormResults(sessionId: string, results: GrantResult[]): Promise<void>;
  markAsPaid(sessionId: string): Promise<void>;
  savePdfPath(sessionId: string, pdfPath: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async createFormSubmission(userInput: UserFormInput): Promise<FormSubmission> {
    const sessionId = randomUUID();
    
    // Fournir des valeurs par défaut pour les champs optionnels
    const submissionData = {
      sessionId,
      status: userInput.status || [],
      statusOther: userInput.statusOther || null,
      artisticDomain: userInput.artisticDomain || [],
      artisticDomainOther: userInput.artisticDomainOther || null,
      projectDescription: userInput.projectDescription || "",
      projectType: userInput.projectType || [],
      projectTypeOther: userInput.projectTypeOther || null,
      projectStage: userInput.projectStage || "",
      region: userInput.region, // OBLIGATOIRE - pas de valeur par défaut
      isInternational: userInput.isInternational || "",
      innovation: userInput.innovation || null,
      innovationOther: userInput.innovationOther || null,
      socialDimension: userInput.socialDimension || null,
      socialDimensionOther: userInput.socialDimensionOther || null,
      urgency: userInput.urgency || null,
      aidTypes: userInput.aidTypes || null,
      aidTypesOther: userInput.aidTypesOther || null,
      geographicScope: userInput.geographicScope || null,
      email: userInput.email, // OBLIGATOIRE - pas de valeur par défaut
      results: null,
    };
    
    const [submission] = await db
      .insert(formSubmissions)
      .values(submissionData)
      .returning();
    return submission;
  }

  async getFormSubmission(sessionId: string): Promise<FormSubmission | undefined> {
    const [submission] = await db
      .select()
      .from(formSubmissions)
      .where(eq(formSubmissions.sessionId, sessionId));
    return submission || undefined;
  }

  async getAllSubmissions(): Promise<FormSubmission[]> {
    const submissions = await db
      .select()
      .from(formSubmissions)
      .orderBy(formSubmissions.createdAt);
    return submissions.reverse();
  }

  async updateFormResults(sessionId: string, results: GrantResult[]): Promise<void> {
    await db
      .update(formSubmissions)
      .set({ results: results as any })
      .where(eq(formSubmissions.sessionId, sessionId));
  }

  async markAsPaid(sessionId: string): Promise<void> {
    await db
      .update(formSubmissions)
      .set({ isPaid: "true" })
      .where(eq(formSubmissions.sessionId, sessionId));
  }

  async savePdfPath(sessionId: string, pdfPath: string): Promise<void> {
    await db
      .update(formSubmissions)
      .set({ pdfPath })
      .where(eq(formSubmissions.sessionId, sessionId));
  }
}

export const storage = new DatabaseStorage();
