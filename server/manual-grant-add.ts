/**
 * Script manuel pour ajouter une subvention à la base
 * Usage: tsx server/manual-grant-add.ts
 */

import { grantStorage } from "./grant-storage";
import type { InsertGrant } from "@shared/schema";

async function addManualGrant() {
  // Exemple de subvention à ajouter
  const grant: InsertGrant = {
    title: "Aide aux projets artistiques numériques - DRAC",
    organization: "DRAC (Direction Régionale des Affaires Culturelles)",
    amount: 15000,
    deadline: "2025-12-31",
    description: "Soutien aux projets artistiques intégrant le numérique",
    eligibility: "Artistes professionnels résidant en France",
    url: "https://www.culture.gouv.fr/",
    grantType: ["Création", "Innovation"],
    eligibleSectors: ["Arts numériques", "Arts visuels"],
    geographicZone: ["National"],
    status: "active",
  };

  console.log("📝 Ajout d'une nouvelle subvention...\n");
  console.log(`Titre: ${grant.title}`);
  console.log(`Organisme: ${grant.organization}\n`);

  try {
    const created = await grantStorage.createGrant(grant);
    console.log(`✅ Subvention ajoutée avec succès !`);
    console.log(`ID: ${created.id}`);
  } catch (error: any) {
    console.error(`❌ Erreur:`, error.message);
  }
}

addManualGrant();
