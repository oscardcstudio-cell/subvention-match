/**
 * Script de simulation de 5 profils types
 * Test le flow complet : formulaire → IA → PDF → Email
 */

const API_URL = "http://localhost:5000/api/test-submit-and-send";

// 5 profils types différents
const testProfiles = [
  {
    name: "Marie - Artiste plasticienne",
    data: {
      sessionId: crypto.randomUUID(),
      email: "oscar.decouvreaux@gmail.com",
      status: ["artiste-auteur"],
      artisticDomain: ["arts-visuels"],
      region: "Nouvelle-Aquitaine",
      projectDescription: "Création d'une série de sculptures interactives mêlant art et technologie, pour une exposition dans des galeries d'art contemporain de la région.",
      projectType: ["creation"],
      projectStage: "en-cours",
      urgency: "3-mois",
      isInternational: "non",
      innovation: ["numerique"],
      aidTypes: ["subvention"],
      geographicScope: ["regional"],
    }
  },
  {
    name: "Thomas - Compagnie de théâtre",
    data: {
      sessionId: crypto.randomUUID(),
      email: "oscar.decouvreaux@gmail.com",
      status: ["association"],
      artisticDomain: ["spectacle-vivant"],
      region: "Île-de-France",
      projectDescription: "Production d'une pièce de théâtre contemporaine sur les enjeux climatiques, avec une tournée dans les lycées franciliens pour sensibiliser les jeunes.",
      projectType: ["diffusion", "production"],
      projectStage: "planification",
      urgency: "6-mois",
      isInternational: "non",
      innovation: ["classique"],
      socialDimension: ["education", "environnement"],
      aidTypes: ["subvention", "aide-production"],
      geographicScope: ["regional"],
    }
  },
  {
    name: "Sophie - Musicienne professionnelle",
    data: {
      sessionId: crypto.randomUUID(),
      email: "oscar.decouvreaux@gmail.com",
      status: ["artiste-auteur"],
      artisticDomain: ["musique"],
      region: "Provence-Alpes-Côte d'Azur",
      projectDescription: "Enregistrement d'un album de jazz fusion avec des musiciens internationaux, mêlant influences méditerranéennes et africaines.",
      projectType: ["creation", "production"],
      projectStage: "developpe",
      urgency: "3-mois",
      isInternational: "oui",
      innovation: ["innovation-artistique"],
      aidTypes: ["subvention", "avance-remboursable"],
      geographicScope: ["regional", "national", "international"],
    }
  },
  {
    name: "Lucas - Producteur audiovisuel",
    data: {
      sessionId: crypto.randomUUID(),
      email: "oscar.decouvreaux@gmail.com",
      status: ["entreprise"],
      artisticDomain: ["audiovisuel"],
      region: "Grand Est",
      projectDescription: "Production d'un documentaire sur les artisans d'art de la région Grand Est, valorisant les savoir-faire traditionnels et leur transmission.",
      projectType: ["production"],
      projectStage: "planification",
      urgency: "12-mois",
      isInternational: "non",
      innovation: ["classique"],
      socialDimension: ["patrimoine", "transmission"],
      aidTypes: ["subvention", "aide-production"],
      geographicScope: ["regional"],
    }
  },
  {
    name: "Emma - Jeune créatrice mode",
    data: {
      sessionId: crypto.randomUUID(),
      email: "oscar.decouvreaux@gmail.com",
      status: ["auto-entrepreneur"],
      artisticDomain: ["arts-visuels"],
      region: "Bretagne",
      projectDescription: "Lancement d'une collection de mode éco-responsable utilisant des matériaux recyclés, avec des collaborations avec des artistes locaux pour les motifs.",
      projectType: ["creation"],
      projectStage: "idee",
      urgency: "6-mois",
      isInternational: "non",
      innovation: ["innovation-sociale", "innovation-environnementale"],
      socialDimension: ["environnement", "economie-circulaire"],
      aidTypes: ["subvention", "pret"],
      geographicScope: ["regional", "national"],
    }
  },
];

async function runSimulation(profile: typeof testProfiles[0], index: number) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`🧪 SIMULATION ${index + 1}/5: ${profile.name}`);
  console.log(`${"=".repeat(60)}\n`);
  
  console.log("📋 Profil:");
  console.log(`   Statut: ${profile.data.status.join(", ")}`);
  console.log(`   Domaine: ${profile.data.artisticDomain.join(", ")}`);
  console.log(`   Région: ${profile.data.region}`);
  console.log(`   Projet: ${profile.data.projectDescription.substring(0, 80)}...`);
  console.log("");

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profile.data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Request failed");
    }

    const result = await response.json();
    
    console.log("✅ SUCCÈS!");
    console.log(`   Session ID: ${result.sessionId}`);
    console.log(`   Subventions matchées: ${result.grantsCount}`);
    console.log(`   Email envoyé à: ${result.email}`);
    console.log(`   Message: ${result.message}`);
    
    return result;
  } catch (error) {
    console.error("❌ ERREUR:", error instanceof Error ? error.message : error);
    throw error;
  }
}

async function runAllSimulations() {
  console.log("\n");
  console.log("╔" + "═".repeat(58) + "╗");
  console.log("║" + " ".repeat(10) + "TEST DES 5 PROFILS TYPES" + " ".repeat(24) + "║");
  console.log("╚" + "═".repeat(58) + "╝");
  
  const results = [];
  
  for (let i = 0; i < testProfiles.length; i++) {
    try {
      const result = await runSimulation(testProfiles[i], i);
      results.push({ success: true, ...result });
      
      // Pause entre chaque simulation pour ne pas surcharger l'API
      if (i < testProfiles.length - 1) {
        console.log("\n⏳ Pause de 3 secondes...");
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } catch (error) {
      results.push({ 
        success: false, 
        profile: testProfiles[i].name,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  // Résumé final
  console.log(`\n\n${"=".repeat(60)}`);
  console.log("📊 RÉSUMÉ FINAL");
  console.log(`${"=".repeat(60)}\n`);
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Réussis: ${successful}/${testProfiles.length}`);
  console.log(`❌ Échoués: ${failed}/${testProfiles.length}\n`);
  
  if (successful > 0) {
    console.log("🎉 Tests réussis:");
    results.filter(r => r.success).forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.grantsCount} subventions matchées`);
    });
  }
  
  if (failed > 0) {
    console.log("\n⚠️  Tests échoués:");
    results.filter(r => !r.success).forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.profile}: ${r.error}`);
    });
  }
  
  console.log("\n📧 Vérifiez votre boîte email (oscar.decouvreaux@gmail.com)");
  console.log("   Vous devriez avoir reçu 5 emails avec les PDFs!\n");
}

// Exécuter les simulations
runAllSimulations()
  .then(() => {
    console.log("✅ Toutes les simulations sont terminées!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erreur fatale:", error);
    process.exit(1);
  });
