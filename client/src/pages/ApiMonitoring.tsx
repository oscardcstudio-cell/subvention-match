import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ExternalLink, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { safeExternalUrl } from "@/lib/safe-url";

interface ApiStatus {
  name: string;
  description: string;
  status: "available" | "pending" | "blocked" | "testing";
  url?: string;
  docUrl?: string;
  notes: string;
  keyRequired: boolean;
  lastChecked?: string;
}

export default function ApiMonitoring() {
  const { language, setLanguage } = useLanguage();

  const apis: ApiStatus[] = [
    {
      name: "Aides-Territoires API",
      description: "🇫🇷 342+ subventions culturelles françaises avec filtres avancés",
      status: "pending",
      url: "https://aides-territoires.beta.gouv.fr/api",
      docUrl: "https://aides-territoires.beta.gouv.fr/data/",
      notes: "Demande de clé API envoyée. En attente de réponse de l'équipe Aides-Territoires.",
      keyRequired: true,
      lastChecked: new Date().toLocaleDateString("fr-FR"),
    },
    {
      name: "EU Funding & Tenders API (Creative Europe)",
      description: "🇪🇺 2,44 milliards € - Subventions culturelles européennes 2021-2027",
      status: "available",
      url: "https://api.tech.ec.europa.eu/search-api/prod/rest/search",
      docUrl: "https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/programmes/crea",
      notes: "✅ ACCÈS LIBRE : Clé API publique 'SEDIA' disponible sans inscription. Programme Creative Europe (culture + média). Format JSON. Endpoint : POST /search-api/prod/rest/search. Permet de rechercher tous les appels à projets et subventions culturelles de l'UE. Budget 2,44 milliards €.",
      keyRequired: false,
      lastChecked: new Date().toLocaleDateString("fr-FR"),
    },
    {
      name: "Arts Council England Open Data",
      description: "🇬🇧 Grants for the Arts Awards - données ouvertes UK",
      status: "available",
      url: "https://www.data.gov.uk/dataset/dc0214fb-9b8a-40ba-ad41-10d4d2ecba54/grants-for-the-arts-awards-arts-council-england",
      docUrl: "https://www.artscouncil.org.uk/ProjectGrants/project-grants-data",
      notes: "✅ ACCÈS LIBRE : Données téléchargeables en CSV/JSON depuis data.gov.uk. Contient : montants, bénéficiaires, projets, régions, artforms. National Lottery Project Grants (£1,000-£100,000). Pas d'API temps réel mais exports réguliers.",
      keyRequired: false,
      lastChecked: new Date().toLocaleDateString("fr-FR"),
    },
    {
      name: "API Data.Subvention",
      description: "🇫🇷 6 milliards € de subventions, 58 000 versements annuels (toutes associations)",
      status: "blocked",
      url: "https://datasubvention.beta.gouv.fr",
      docUrl: "https://geode-chipmunk-29c.notion.site/Documentation-API-Guide-d-int-gration-1511788663a380a8b199cc98864b4dfd",
      notes: "❌ ACCÈS IMPOSSIBLE : Strictement réservé aux agents publics du gouvernement français. Nécessite un SIRET d'administration publique. ProConnect refuse les structures de droit privé. Validation manuelle requise (api@datasubvention.beta.gouv.fr). Compte consommateur avec token illimité pour intégrations. Limite : 80 requêtes/minute.",
      keyRequired: true,
      lastChecked: new Date().toLocaleDateString("fr-FR"),
    },
    {
      name: "API Démarches Ministère Culture",
      description: "🇫🇷 350+ démarches et aides culturelles du MinCulture",
      status: "testing",
      url: "https://www.culture.gouv.fr/api/doc",
      docUrl: "https://www.culture.gouv.fr/api/doc",
      notes: "Utilise l'API Aides-Territoires en backend. Documentation technique disponible mais dépend de la clé Aides-Territoires.",
      keyRequired: true,
      lastChecked: new Date().toLocaleDateString("fr-FR"),
    },
  ];

  const getStatusBadge = (status: ApiStatus["status"]) => {
    switch (status) {
      case "available":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300 rounded-md flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5" />
            {language === "fr" ? "Disponible" : "Available"}
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-orange-100 text-orange-800 border-orange-300 rounded-md flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {language === "fr" ? "En attente" : "Pending"}
          </Badge>
        );
      case "blocked":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300 rounded-md flex items-center gap-1.5">
            <XCircle className="h-3.5 w-3.5" />
            {language === "fr" ? "Bloqué" : "Blocked"}
          </Badge>
        );
      case "testing":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-300 rounded-md flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" />
            {language === "fr" ? "À tester" : "Testing"}
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/">
            <a data-testid="link-home" className="group">
              <span className="text-lg sm:text-xl font-light tracking-tight text-black">
                Subvention<span className="font-bold">Match</span>
              </span>
            </a>
          </Link>
          <LanguageToggle language={language} onLanguageChange={setLanguage} />
        </div>
      </header>

      {/* Main */}
      <main className="pt-32 sm:pt-40 md:pt-48 pb-16 sm:pb-24 md:pb-32 px-4 sm:px-6 md:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Title */}
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter leading-tight mb-4">
              {language === "fr" ? "MONITORING" : "MONITORING"}
              <br />
              <span className="text-indigo-600">
                {language === "fr" ? "APIs" : "APIs"}
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl">
              {language === "fr" 
                ? "Suivi des APIs de subventions culturelles françaises pour alimenter notre base de données."
                : "Tracking French cultural grant APIs to populate our database."
              }
            </p>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="text-3xl font-bold text-indigo-600">
                {apis.filter(a => a.status === "available").length}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {language === "fr" ? "Disponible" : "Available"}
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="text-3xl font-bold text-orange-600">
                {apis.filter(a => a.status === "pending").length}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {language === "fr" ? "En attente" : "Pending"}
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="text-3xl font-bold text-red-600">
                {apis.filter(a => a.status === "blocked").length}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {language === "fr" ? "Bloqué" : "Blocked"}
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="text-3xl font-bold text-blue-600">
                {apis.filter(a => a.status === "testing").length}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {language === "fr" ? "À tester" : "Testing"}
              </div>
            </div>
          </div>

          {/* API List */}
          <div className="space-y-6">
            {apis.map((api, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:border-indigo-300 transition-colors"
                data-testid={`api-card-${index}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-black">{api.name}</h3>
                      {getStatusBadge(api.status)}
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{api.description}</p>
                  </div>
                </div>

                {/* Notes */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700 leading-relaxed">{api.notes}</p>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1.5">
                    {api.keyRequired ? (
                      <>
                        <XCircle className="h-4 w-4 text-orange-500" />
                        <span>{language === "fr" ? "Clé API requise" : "API key required"}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{language === "fr" ? "Accès libre" : "Open access"}</span>
                      </>
                    )}
                  </div>
                  {api.lastChecked && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      <span>
                        {language === "fr" ? "Vérifié le" : "Checked on"} {api.lastChecked}
                      </span>
                    </div>
                  )}
                </div>

                {/* Links */}
                <div className="flex flex-wrap gap-3">
                  {safeExternalUrl(api.url) && (
                    <a
                      href={safeExternalUrl(api.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                      data-testid={`link-api-${index}`}
                    >
                      {language === "fr" ? "Accéder à l'API" : "Access API"}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {api.docUrl && (
                    <a
                      href={api.docUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-700 transition-colors"
                      data-testid={`link-doc-${index}`}
                    >
                      {language === "fr" ? "Documentation" : "Documentation"}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Back button */}
          <div className="mt-12 text-center">
            <Link href="/">
              <Button
                variant="outline"
                className="rounded-md"
                data-testid="button-back-home"
              >
                {language === "fr" ? "← Retour à l'accueil" : "← Back to home"}
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
