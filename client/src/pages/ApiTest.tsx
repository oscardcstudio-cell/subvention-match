import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2, ExternalLink } from "lucide-react";
import { safeExternalUrl } from "@/lib/safe-url";

interface SampleAid {
  id: string;
  name: string;
  description: string;
  financers: string;
  perimeter: string;
  deadline: string | null;
  url: string;
}

interface ApiTestResponse {
  success: boolean;
  message: string;
  totalCount?: number;
  sampleAids?: SampleAid[];
  error?: string;
}

export default function ApiTest() {
  const { data, isLoading, isError, refetch } = useQuery<ApiTestResponse>({
    queryKey: ["/api/test-aides-territoires"],
    retry: false,
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Test API Aides et Territoires</h1>
          <p className="text-gray-600">
            Vérifiez la connexion avec l'API Aides et Territoires
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
              {!isLoading && data?.success && <CheckCircle className="h-5 w-5 text-green-600" />}
              {!isLoading && (isError || !data?.success) && <XCircle className="h-5 w-5 text-red-600" />}
              État de la connexion
            </CardTitle>
            <CardDescription>
              Authentification et récupération des données de test
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading && (
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Test en cours...</span>
              </div>
            )}

            {!isLoading && data && (
              <>
                <div className="flex items-start gap-3">
                  {data.success ? (
                    <Badge className="bg-green-100 text-green-800 border-green-300">
                      ✓ Connexion réussie
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800 border-red-300">
                      ✗ Échec de connexion
                    </Badge>
                  )}
                </div>

                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-sm font-mono">{data.message}</p>
                  {data.error && (
                    <p className="text-sm font-mono text-red-600 mt-2">
                      Erreur: {data.error}
                    </p>
                  )}
                </div>

                {data.totalCount !== undefined && (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-[#118AB2]">
                      {data.totalCount.toLocaleString()}
                    </span>
                    <span className="text-gray-600">
                      aides culturelles trouvées dans l'API
                    </span>
                  </div>
                )}

                {data.sampleAids && data.sampleAids.length > 0 && (
                  <div className="space-y-4 mt-6">
                    <h3 className="font-semibold text-lg">
                      Exemples d'aides récupérées ({data.sampleAids.length})
                    </h3>
                    
                    <div className="space-y-3">
                      {data.sampleAids.map((aid) => (
                        <Card key={aid.id} className="border-l-4 border-l-[#118AB2]">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base">
                              {aid.name}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              ID: {aid.id}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <p className="text-sm text-gray-700">
                              {aid.description}
                            </p>
                            
                            <div className="flex flex-wrap gap-2 text-xs">
                              {aid.financers && (
                                <Badge variant="outline">
                                  💰 {aid.financers}
                                </Badge>
                              )}
                              {aid.perimeter && (
                                <Badge variant="outline">
                                  📍 {aid.perimeter}
                                </Badge>
                              )}
                              {aid.deadline && (
                                <Badge variant="outline">
                                  📅 {new Date(aid.deadline).toLocaleDateString('fr-FR')}
                                </Badge>
                              )}
                            </div>

                            {safeExternalUrl(aid.url) && (
                              <a
                                href={safeExternalUrl(aid.url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-[#118AB2] hover:underline"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Voir l'aide
                              </a>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {isError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">
                  Erreur lors de la connexion à l'API. Vérifiez que la clé API est correctement configurée.
                </p>
              </div>
            )}

            <div className="pt-4">
              <Button
                onClick={() => refetch()}
                disabled={isLoading}
                className="bg-[#118AB2] hover:bg-[#0d6d8a]"
                data-testid="button-retry-test"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Test en cours...
                  </>
                ) : (
                  "Relancer le test"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-sm mb-2">ℹ️ À propos de ce test</h3>
          <ul className="text-xs text-gray-700 space-y-1">
            <li>• Authentification avec votre token API (X-AUTH-TOKEN)</li>
            <li>• Récupération d'un Bearer Token (valable 24h)</li>
            <li>• Recherche d'aides culturelles via l'API</li>
            <li>• Affichage de 5 exemples d'aides</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
