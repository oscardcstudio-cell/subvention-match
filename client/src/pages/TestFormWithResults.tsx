import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Loader2, RefreshCw, ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface SubmitResponse {
  sessionId: string;
}

interface ResultsResponse {
  matches: Array<{
    grant: any;
    matchScore: number;
    reasoning: string;
  }>;
}

const testFormData = {
  status: ["Artiste indépendant"],
  statusOther: "",
  artisticDomain: ["Musique", "Danse"],
  projectDescription: "Un projet innovant de création pluridisciplinaire combinant la musique et la danse contemporaine, avec une dimension d'inclusion sociale pour les jeunes en difficulté.",
  projectType: ["Création", "Résidence"],
  projectStage: "En cours de financement",
  region: "Île-de-France",
  isInternational: "Oui",
  innovation: ["Innovation artistique"],
  socialDimension: ["Inclusion et éducation"],
  urgency: "3-6 mois",
  aidTypes: ["Subvention cash", "Résidence logée"],
  geographicScope: ["National", "Régional"],
  email: "test@example.com"
};

export default function TestFormWithResults() {
  const { language } = useLanguage();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(true);

  // Soumettre le formulaire automatiquement au chargement
  useEffect(() => {
    const submitTestForm = async () => {
      try {
        const response = await apiRequest("POST", "/api/submit-form", testFormData) as unknown as SubmitResponse;
        setSessionId(response.sessionId);
        setIsSubmitting(false);
      } catch (error) {
        console.error("Erreur lors de la soumission:", error);
        setIsSubmitting(false);
      }
    };

    submitTestForm();
  }, []);

  // Récupérer les résultats
  const { data: results, isLoading } = useQuery<ResultsResponse>({
    queryKey: ["/api/results", sessionId],
    enabled: !!sessionId,
    retry: 3,
    retryDelay: 1000,
  });

  const handleRefresh = () => {
    window.location.reload();
  };

  if (isSubmitting || isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#118AB2] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {language === "fr" ? "Analyse en cours..." : "Analyzing..."}
          </h2>
          <p className="text-gray-600">
            {language === "fr" ? "L'IA analyse votre profil contre 211 subventions" : "AI is analyzing your profile against 211 grants"}
          </p>
        </div>
      </div>
    );
  }

  const matchedGrants = results?.matches || [];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 md:px-8 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-xl font-bold text-[#073B4C]">
            {language === "fr" ? "Test - Simulation Complète" : "Test - Full Simulation"}
          </h1>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="gap-2"
            data-testid="button-refresh-test"
          >
            <RefreshCw className="h-4 w-4" />
            {language === "fr" ? "Recommencer" : "Retry"}
          </Button>
        </div>
      </header>

      <main className="pt-24 pb-12 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
        {/* Résumé du formulaire */}
        <Card className="mb-8 p-6 bg-blue-50 border-blue-200">
          <h2 className="text-lg font-bold text-[#073B4C] mb-4">
            {language === "fr" ? "Profil testé" : "Test Profile"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold text-gray-700">Status:</span> {testFormData.status.join(", ")}
            </div>
            <div>
              <span className="font-semibold text-gray-700">Domaines:</span> {testFormData.artisticDomain.join(", ")}
            </div>
            <div className="md:col-span-2">
              <span className="font-semibold text-gray-700">Description:</span>
              <p className="text-gray-600 mt-1">{testFormData.projectDescription}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Région:</span> {testFormData.region}
            </div>
            <div>
              <span className="font-semibold text-gray-700">International:</span> {testFormData.isInternational ? "Oui" : "Non"}
            </div>
          </div>
        </Card>

        {/* Résultats */}
        <h2 className="text-3xl font-bold text-[#073B4C] mb-6">
          {language === "fr" 
            ? `${matchedGrants.length} subventions matchées` 
            : `${matchedGrants.length} grants matched`
          }
        </h2>

        {matchedGrants.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-600">{language === "fr" ? "Aucune subvention trouvée" : "No grants found"}</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {matchedGrants.map((match: any, index: number) => {
              const grant = match.grant || match;
              const matchScore = match.matchScore || 85;
              const reasoning = match.reasoning || "Correspondance identifiée avec vos critères";

              return (
                <Card 
                  key={index} 
                  className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-[#06D6A0]"
                  data-testid={`card-grant-${index}`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-[#06D6A0] text-white">
                          {matchScore}% {language === "fr" ? "match" : "match"}
                        </Badge>
                      </div>
                      <h3 className="text-2xl font-bold text-[#073B4C]">
                        {grant.title || grant.name}
                      </h3>
                      <p className="text-gray-600 text-lg mt-1">
                        {grant.organization}
                      </p>
                    </div>
                  </div>

                  {/* Matching reason */}
                  <div className="bg-[#06D6A0]/10 border-l-4 border-[#06D6A0] p-4 mb-4">
                    <div className="flex gap-2 items-start">
                      <Target className="h-5 w-5 text-[#06D6A0] flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-[#06D6A0] mb-1">
                          {language === "fr" ? "Pourquoi cette subvention ?" : "Why this grant?"}
                        </h4>
                        <p className="text-gray-700 text-sm">{reasoning}</p>
                      </div>
                    </div>
                  </div>

                  {/* Key info grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {grant.amount && (
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          {language === "fr" ? "Montant" : "Amount"}
                        </div>
                        <div className="font-bold text-lg text-[#073B4C]">{grant.amount}</div>
                      </div>
                    )}
                    {grant.deadline && (
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          {language === "fr" ? "Deadline" : "Deadline"}
                        </div>
                        <div className="font-bold text-[#06D6A0]">{grant.deadline}</div>
                      </div>
                    )}
                    {grant.eligibility && (
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          {language === "fr" ? "Éligibilité" : "Eligibility"}
                        </div>
                        <div className="text-sm text-gray-700">{grant.eligibility}</div>
                      </div>
                    )}
                    {grant.region && (
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          {language === "fr" ? "Région" : "Region"}
                        </div>
                        <div className="text-sm text-gray-700">{grant.region}</div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {grant.description && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wide">
                        {language === "fr" ? "Description" : "Description"}
                      </h4>
                      <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                        {grant.description}
                      </p>
                    </div>
                  )}

                  {/* CTA */}
                  {grant.applicationUrl && (
                    <Button 
                      className="w-full bg-[#06D6A0] hover:bg-[#06D6A0]/90 text-white"
                      data-testid={`button-access-grant-${index}`}
                    >
                      {language === "fr" ? "Accéder à la subvention" : "Access the grant"}
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
