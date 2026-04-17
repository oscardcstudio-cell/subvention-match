import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Structure des Subventions
          </h1>
          <p className="text-muted-foreground">
            Liste complète des champs disponibles pour chaque subvention culturelle
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informations principales</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Champ</th>
                  <th className="text-left py-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr><td className="py-2 font-mono text-xs">title</td><td className="py-2">Titre de la subvention</td></tr>
                <tr><td className="py-2 font-mono text-xs">organization</td><td className="py-2">Organisme qui propose l'aide</td></tr>
                <tr><td className="py-2 font-mono text-xs">amount</td><td className="py-2">Montant en euros (si fixe)</td></tr>
                <tr><td className="py-2 font-mono text-xs">amountMin / amountMax</td><td className="py-2">Montant min/max (si variable)</td></tr>
                <tr><td className="py-2 font-mono text-xs">deadline</td><td className="py-2">Date limite de soumission</td></tr>
                <tr><td className="py-2 font-mono text-xs">nextSession</td><td className="py-2">Prochaine session si récurrent</td></tr>
                <tr><td className="py-2 font-mono text-xs">frequency</td><td className="py-2">Fréquence (annuel, permanent, etc.)</td></tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contenu descriptif</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Champ</th>
                  <th className="text-left py-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr><td className="py-2 font-mono text-xs">description</td><td className="py-2">Nature de l'aide</td></tr>
                <tr><td className="py-2 font-mono text-xs">eligibility</td><td className="py-2">Critères d'éligibilité</td></tr>
                <tr><td className="py-2 font-mono text-xs">requirements</td><td className="py-2">Dossier à fournir</td></tr>
                <tr><td className="py-2 font-mono text-xs">obligatoryDocuments</td><td className="py-2">Liste des documents obligatoires</td></tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact et liens</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Champ</th>
                  <th className="text-left py-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr><td className="py-2 font-mono text-xs">url</td><td className="py-2">Lien web de base</td></tr>
                <tr><td className="py-2 font-mono text-xs">improvedUrl</td><td className="py-2">URL améliorée (trouvée par scraping)</td></tr>
                <tr><td className="py-2 font-mono text-xs">helpResources</td><td className="py-2">Ressources d'aide (guides, FAQ...)</td></tr>
                <tr><td className="py-2 font-mono text-xs">contactEmail / contactPhone</td><td className="py-2">Coordonnées de contact</td></tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Filtres et catégories</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Champ</th>
                  <th className="text-left py-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr><td className="py-2 font-mono text-xs">grantType</td><td className="py-2">Type de subvention</td></tr>
                <tr><td className="py-2 font-mono text-xs">eligibleSectors</td><td className="py-2">Secteurs éligibles</td></tr>
                <tr><td className="py-2 font-mono text-xs">geographicZone</td><td className="py-2">Zone géographique</td></tr>
                <tr><td className="py-2 font-mono text-xs">structureSize</td><td className="py-2">Taille de structure éligible</td></tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Paramètres financiers</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Champ</th>
                  <th className="text-left py-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr><td className="py-2 font-mono text-xs">maxFundingRate</td><td className="py-2">Taux de financement max (%)</td></tr>
                <tr><td className="py-2 font-mono text-xs">coFundingRequired</td><td className="py-2">Cofinancement requis</td></tr>
                <tr><td className="py-2 font-mono text-xs">cumulativeAllowed</td><td className="py-2">Cumul autorisé avec d'autres aides</td></tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Processus</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Champ</th>
                  <th className="text-left py-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr><td className="py-2 font-mono text-xs">processingTime</td><td className="py-2">Durée d'instruction</td></tr>
                <tr><td className="py-2 font-mono text-xs">responseDelay</td><td className="py-2">Délai de réponse</td></tr>
                <tr><td className="py-2 font-mono text-xs">applicationDifficulty</td><td className="py-2">Difficulté du dossier (facile, moyen, difficile)</td></tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistiques</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Champ</th>
                  <th className="text-left py-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr><td className="py-2 font-mono text-xs">acceptanceRate</td><td className="py-2">Taux d'acceptation (%)</td></tr>
                <tr><td className="py-2 font-mono text-xs">annualBeneficiaries</td><td className="py-2">Nombre de bénéficiaires/an</td></tr>
                <tr><td className="py-2 font-mono text-xs">successProbability</td><td className="py-2">Probabilité de succès</td></tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conseils</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Champ</th>
                  <th className="text-left py-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr><td className="py-2 font-mono text-xs">preparationAdvice</td><td className="py-2">Conseils de préparation</td></tr>
                <tr><td className="py-2 font-mono text-xs">experienceFeedback</td><td className="py-2">Retours d'expérience</td></tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métadonnées système</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Champ</th>
                  <th className="text-left py-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr><td className="py-2 font-mono text-xs">priority</td><td className="py-2">Priorité (haute, moyenne, basse)</td></tr>
                <tr><td className="py-2 font-mono text-xs">status</td><td className="py-2">active, inactive, archived</td></tr>
                <tr><td className="py-2 font-mono text-xs">enrichmentStatus</td><td className="py-2">Statut d'enrichissement IA</td></tr>
                <tr><td className="py-2 font-mono text-xs">enrichmentDate</td><td className="py-2">Date du dernier enrichissement</td></tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              <strong>Enrichissement IA :</strong> titre, description, éligibilité, organisation
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              <strong>Données factuelles (non traitées par l'IA) :</strong> montants, deadline, documents requis, URL, contacts, taux d'acceptation
            </p>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground pt-8">
          Mécène - Base de données de subventions culturelles françaises
        </div>
      </div>
    </div>
  );
}
