import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, AlertTriangle, Info, XCircle, CheckCircle, TrendingDown, TrendingUp, Sparkles, Trash2, Link, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { safeExternalUrl } from "@/lib/safe-url";

// Token admin via variable d'environnement (défini dans Replit Secrets)
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || "";

async function adminRequest(method: string, url: string, body?: any) {
  if (!ADMIN_TOKEN) {
    throw new Error("Token admin non configuré. Définissez VITE_ADMIN_TOKEN dans les secrets.");
  }
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Token': ADMIN_TOKEN,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res;
}

interface QualityIssue {
  grantId: string;
  grantTitle: string;
  field: string;
  issue: string;
  severity: 'critical' | 'warning' | 'info';
  currentValue?: string | number;
  expectedValue?: string;
}

interface QualityReport {
  totalGrants: number;
  grantsAnalyzed: number;
  issuesFound: QualityIssue[];
  summary: {
    critical: number;
    warnings: number;
    info: number;
  };
  fieldStats: {
    [key: string]: {
      total: number;
      filled: number;
      empty: number;
      tooShort: number;
      tooLong: number;
      avgLength: number;
    };
  };
}

interface HtmlAnalysis {
  total: number;
  withHtml: { field: string; count: number }[];
  examples: { id: string; title: string; field: string; sample: string }[];
}

interface GrantWithUrlIssue {
  id: string;
  title: string;
  organization: string;
  url: string;
  improvedUrl?: string;
  issue: string;
}

interface DeadlineCheckResult {
  total: number;
  expired: { id: string; title: string; deadline: string }[];
  soonExpiring: { id: string; title: string; deadline: string; daysLeft: number }[];
  permanent: number;
  unparseable: number;
}

interface RefreshStatus {
  lastRefresh: string | null;
  nextScheduledRefresh: string | null;
  isRunning: boolean;
  lastResult: {
    organismsScraped: number;
    newGrantsFound: number;
    expiredArchived: number;
    errors: string[];
  } | null;
}

export default function DataQuality() {
  const [expandedIssues, setExpandedIssues] = useState(false);
  const [editingUrlId, setEditingUrlId] = useState<string | null>(null);
  const [newUrl, setNewUrl] = useState("");
  const { toast } = useToast();
  
  const { data: report, isLoading, error, refetch } = useQuery<QualityReport>({
    queryKey: ['/api/data-quality'],
    refetchOnWindowFocus: false,
  });

  const { data: htmlAnalysis } = useQuery<HtmlAnalysis>({
    queryKey: ['/api/html-analysis'],
    refetchOnWindowFocus: false,
  });

  const { data: urlIssues, refetch: refetchUrls } = useQuery<{ total: number; grants: GrantWithUrlIssue[] }>({
    queryKey: ['/api/grants-with-issues'],
    refetchOnWindowFocus: false,
  });

  // Query pour les deadlines
  const { data: deadlines, isLoading: deadlinesLoading, refetch: refetchDeadlines } = useQuery<DeadlineCheckResult>({
    queryKey: ['/api/check-deadlines'],
    queryFn: async () => {
      const res = await adminRequest('GET', '/api/check-deadlines');
      if (!res.ok) throw new Error('Erreur lors de la vérification des deadlines');
      return res.json();
    },
    refetchOnWindowFocus: false,
  });

  // Query pour le statut de rafraîchissement
  const { data: refreshStatus, refetch: refetchRefreshStatus } = useQuery<RefreshStatus>({
    queryKey: ['/api/refresh-status'],
    queryFn: async () => {
      const res = await adminRequest('GET', '/api/refresh-status');
      if (!res.ok) throw new Error('Erreur');
      return res.json();
    },
    refetchOnWindowFocus: false,
  });

  // Mutation pour archiver les subventions expirées
  const archiveExpiredMutation = useMutation({
    mutationFn: async () => {
      const res = await adminRequest('POST', '/api/archive-expired', {});
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Erreur serveur' }));
        throw new Error(error.error || 'Erreur lors de l\'archivage');
      }
      return await res.json();
    },
    onSuccess: (result: any) => {
      toast({
        title: "Archivage terminé",
        description: `${result.archived} subventions expirées archivées`,
      });
      refetchDeadlines();
      queryClient.invalidateQueries({ queryKey: ['/api/data-quality'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite",
        variant: "destructive",
      });
    },
  });

  // Mutation pour lancer un rafraîchissement complet
  const runRefreshMutation = useMutation({
    mutationFn: async () => {
      const res = await adminRequest('POST', '/api/run-refresh', {});
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Erreur serveur' }));
        throw new Error(error.error || 'Erreur lors du rafraîchissement');
      }
      return await res.json();
    },
    onSuccess: (result: any) => {
      toast({
        title: "Rafraîchissement terminé",
        description: `${result.organismsScraped} organismes scrapés, ${result.newGrantsFound} nouvelles subventions, ${result.expiredArchived} archivées`,
      });
      refetchDeadlines();
      refetchRefreshStatus();
      queryClient.invalidateQueries({ queryKey: ['/api/data-quality'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite",
        variant: "destructive",
      });
    },
  });

  // Mutation pour nettoyer le HTML
  const cleanHtmlMutation = useMutation({
    mutationFn: async () => {
      const res = await adminRequest('POST', '/api/clean-html', {});
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Erreur serveur' }));
        throw new Error(error.error || 'Erreur lors du nettoyage');
      }
      return await res.json();
    },
    onSuccess: (result: any) => {
      toast({
        title: "Nettoyage HTML terminé",
        description: `${result.totalCleaned} subventions nettoyées sur ${result.totalProcessed}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/data-quality'] });
      queryClient.invalidateQueries({ queryKey: ['/api/html-analysis'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite",
        variant: "destructive",
      });
    },
  });

  // Mutation pour enrichir une seule subvention
  const enrichGrantMutation = useMutation({
    mutationFn: async ({ grantId, issues }: { grantId: string; issues: QualityIssue[] }) => {
      const res = await adminRequest('POST', `/api/enrich-grant/${grantId}`, { issues });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Erreur serveur' }));
        throw new Error(error.error || 'Erreur lors de l\'enrichissement');
      }
      return await res.json();
    },
    onSuccess: (result: any) => {
      if (result.success) {
        toast({
          title: "Enrichissement réussi",
          description: `${result.changes.length} champ(s) amélioré(s)`,
        });
        queryClient.invalidateQueries({ queryKey: ['/api/data-quality'] });
      } else {
        toast({
          title: "Échec de l'enrichissement",
          description: result.error || "Une erreur s'est produite",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite",
        variant: "destructive",
      });
    },
  });

  // Mutation pour enrichir plusieurs subventions
  const enrichMultipleMutation = useMutation({
    mutationFn: async (requests: { grantId: string; issues: QualityIssue[] }[]) => {
      const res = await adminRequest('POST', '/api/enrich-multiple', { requests });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Erreur serveur' }));
        throw new Error(error.error || 'Erreur lors de l\'enrichissement multiple');
      }
      return await res.json();
    },
    onSuccess: (results: any[]) => {
      const successful = results.filter((r: any) => r.success).length;
      toast({
        title: "Enrichissement terminé",
        description: `${successful}/${results.length} subventions enrichies`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/data-quality'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite",
        variant: "destructive",
      });
    },
  });

  // Mutation pour mettre à jour une URL
  const updateUrlMutation = useMutation({
    mutationFn: async ({ grantId, url }: { grantId: string; url: string }) => {
      const res = await adminRequest('PATCH', `/api/grants/${grantId}/url`, { url, improvedUrl: url });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Erreur serveur' }));
        throw new Error(error.error || 'Erreur lors de la mise à jour');
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "URL mise à jour",
        description: "L'URL a été corrigée avec succès",
      });
      setEditingUrlId(null);
      setNewUrl("");
      refetchUrls();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite",
        variant: "destructive",
      });
    },
  });

  // Mutation pour DeepSearch IA des URLs
  const deepSearchUrlsMutation = useMutation({
    mutationFn: async (limit: number = 30) => {
      const res = await adminRequest('POST', '/api/deepsearch-urls', { limit });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Erreur serveur' }));
        throw new Error(error.error || 'Erreur lors du DeepSearch IA');
      }
      return await res.json();
    },
    onSuccess: (result: any) => {
      toast({
        title: "DeepSearch IA terminé",
        description: `${result.success} URLs trouvées sur ${result.processed} traitées`,
      });
      refetchUrls();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur IA",
        description: error.message || "Une erreur s'est produite lors du DeepSearch",
        variant: "destructive",
      });
    },
  });

  // Mutation pour corriger toutes les URLs automatiquement
  const fixAllUrlsMutation = useMutation({
    mutationFn: async (limit: number = 20) => {
      console.log("🚀 Lancement de la correction de toutes les URLs, limit:", limit);
      const res = await adminRequest('POST', '/api/fix-urls', { limit });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Erreur serveur' }));
        console.error("❌ Erreur correction toutes URLs:", error);
        throw new Error(error.error || 'Erreur lors de la correction');
      }
      return await res.json();
    },
    onSuccess: (result: any) => {
      console.log("✅ Correction terminée:", result);
      toast({
        title: "Correction terminée",
        description: `${result.fixed} URLs corrigées sur ${result.processed} traitées`,
      });
      refetchUrls();
    },
    onError: (error: any) => {
      console.error("❌ Mutation error fixAllUrls:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite",
        variant: "destructive",
      });
    },
  });

  // Mutation pour rechercher une URL avec DeepSearch IA (single grant)
  const deepSearchSingleMutation = useMutation({
    mutationFn: async (grantId: string) => {
      const res = await adminRequest('POST', `/api/deepsearch-url/${grantId}`, {});
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Erreur serveur' }));
        throw new Error(error.error || 'Erreur DeepSearch');
      }
      return await res.json();
    },
    onSuccess: (result: any) => {
      if (result.success) {
        toast({
          title: "URL trouvée par IA",
          description: `${result.foundUrl?.substring(0, 60)}...`,
        });
      } else {
        toast({
          title: "Aucune URL trouvée",
          description: result.method === 'api_key_missing' ? 'Clé API manquante' : 'L\'IA n\'a pas trouvé d\'URL',
          variant: "destructive",
        });
      }
      refetchUrls();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur DeepSearch",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation pour corriger une URL spécifique (crawl - legacy)
  const fixSingleUrlMutation = useMutation({
    mutationFn: async (grantId: string) => {
      const res = await adminRequest('POST', `/api/fix-url/${grantId}`, {});
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Erreur serveur' }));
        throw new Error(error.error || 'Erreur lors de la correction');
      }
      return await res.json();
    },
    onSuccess: (result: any) => {
      if (result.success) {
        toast({
          title: "URL trouvée",
          description: `Nouvelle URL: ${result.foundUrl?.substring(0, 50)}...`,
        });
      } else {
        toast({
          title: "Aucune URL trouvée",
          description: `Méthode: ${result.method}`,
          variant: "destructive",
        });
      }
      refetchUrls();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite",
        variant: "destructive",
      });
    },
  });

  // Fonction pour enrichir toutes les subventions problématiques
  const enrichAllProblematic = () => {
    console.log("🟢 Bouton enrichir cliqué");
    
    if (!report) {
      console.log("❌ Pas de report");
      return;
    }

    const grantIssuesMap = new Map<string, QualityIssue[]>();
    
    report.issuesFound
      .filter(issue => issue.severity === 'critical' || issue.severity === 'warning')
      .forEach(issue => {
        const existing = grantIssuesMap.get(issue.grantId) || [];
        grantIssuesMap.set(issue.grantId, [...existing, issue]);
      });

    const requests = Array.from(grantIssuesMap.entries()).map(([grantId, issues]) => ({
      grantId,
      issues,
    }));

    console.log(`📊 ${requests.length} subventions à enrichir`);

    if (requests.length === 0) {
      toast({
        title: "Aucune subvention à enrichir",
        description: "Aucun problème critique ou warning détecté",
      });
      return;
    }

    toast({
      title: "Enrichissement lancé",
      description: `${requests.length} subventions vont être enrichies. Cela peut prendre quelques minutes...`,
    });

    enrichMultipleMutation.mutate(requests);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-black mx-auto mb-4" />
          <p className="text-gray-600">Analyse des données en cours...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Erreur lors de l'analyse des données</p>
          <Button onClick={() => refetch()} className="mt-4">Réessayer</Button>
        </div>
      </div>
    );
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      warning: 'bg-orange-100 text-orange-800 border-orange-200',
      info: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return colors[severity as keyof typeof colors] || '';
  };

  const issuesByField: Record<string, QualityIssue[]> = {};
  report.issuesFound.forEach(issue => {
    if (!issuesByField[issue.field]) {
      issuesByField[issue.field] = [];
    }
    issuesByField[issue.field].push(issue);
  });

  const getFieldName = (field: string): string => {
    const names: Record<string, string> = {
      title: 'Titre',
      description: 'Description',
      eligibility: 'Éligibilité',
      requirements: 'Documents requis',
      amount: 'Montant',
      deadline: 'Deadline',
      url: 'URL',
      contactEmail: 'Contact',
      preparationAdvice: 'Conseils',
      experienceFeedback: 'Retours d\'expérience',
      helpResources: 'Ressources d\'aide',
    };
    return names[field] || field;
  };

  const totalHtmlCount = htmlAnalysis?.withHtml.reduce((sum, item) => sum + item.count, 0) || 0;

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Qualité des données</h1>
              <p className="text-gray-600 mt-1">Analyse des {report.totalGrants} subventions actives</p>
            </div>
            <Button onClick={() => refetch()} variant="outline" data-testid="button-refresh">
              Actualiser
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" data-testid="tab-overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="deadlines" data-testid="tab-deadlines">
              Fraîcheur {deadlines?.expired.length ? `(${deadlines.expired.length} ⚠️)` : ''}
            </TabsTrigger>
            <TabsTrigger value="html" data-testid="tab-html">Nettoyage HTML ({totalHtmlCount})</TabsTrigger>
            <TabsTrigger value="urls" data-testid="tab-urls">URLs ({urlIssues?.total || 0})</TabsTrigger>
            <TabsTrigger value="enrichment" data-testid="tab-enrichment">Enrichissement IA</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="border border-gray-200 p-6 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Total subventions</span>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-3xl font-bold" data-testid="text-total-grants">{report.totalGrants}</div>
                <div className="text-xs text-gray-500 mt-1">Analysées: {report.grantsAnalyzed}</div>
              </div>

              <div className="border border-red-200 bg-red-50 p-6 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-red-700">Critiques</span>
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="text-3xl font-bold text-red-700" data-testid="text-critical-count">{report.summary.critical}</div>
                <div className="text-xs text-red-600 mt-1">Nécessitent une action immédiate</div>
              </div>

              <div className="border border-orange-200 bg-orange-50 p-6 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-orange-700">Avertissements</span>
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                </div>
                <div className="text-3xl font-bold text-orange-700" data-testid="text-warning-count">{report.summary.warnings}</div>
                <div className="text-xs text-orange-600 mt-1">À corriger si possible</div>
              </div>

              <div className="border border-blue-200 bg-blue-50 p-6 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-blue-700">Informations</span>
                  <Info className="h-5 w-5 text-blue-500" />
                </div>
                <div className="text-3xl font-bold text-blue-700" data-testid="text-info-count">{report.summary.info}</div>
                <div className="text-xs text-blue-600 mt-1">Points d'amélioration</div>
              </div>
            </div>

            <div className="border border-gray-200 p-6 rounded-md">
              <h2 className="text-xl font-bold mb-4">Statistiques par champ</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(report.fieldStats).map(([field, stats]) => {
                  const fillRate = ((stats.filled / stats.total) * 100).toFixed(1);
                  const isCritical = parseFloat(fillRate) < 50;
                  const isGood = parseFloat(fillRate) > 90;
                  
                  return (
                    <div key={field} className="border border-gray-200 p-4 rounded-md">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm">{getFieldName(field)}</span>
                        {isGood ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : isCritical ? (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        ) : null}
                      </div>
                      
                      <div className="mb-2">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Taux de remplissage</span>
                          <span className={`font-semibold ${
                            isGood ? 'text-green-600' : isCritical ? 'text-red-600' : 'text-orange-600'
                          }`}>
                            {fillRate}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              isGood ? 'bg-green-500' : isCritical ? 'bg-red-500' : 'bg-orange-500'
                            }`}
                            style={{ width: `${fillRate}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Rempli:</span>
                          <span className="ml-1 font-semibold">{stats.filled}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Vide:</span>
                          <span className="ml-1 font-semibold">{stats.empty}</span>
                        </div>
                        {stats.tooShort > 0 && (
                          <div>
                            <span className="text-gray-500">Trop court:</span>
                            <span className="ml-1 font-semibold text-orange-600">{stats.tooShort}</span>
                          </div>
                        )}
                        {stats.tooLong > 0 && (
                          <div>
                            <span className="text-gray-500">Trop long:</span>
                            <span className="ml-1 font-semibold text-blue-600">{stats.tooLong}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="deadlines" className="space-y-6">
            {/* Section Rafraîchissement automatique */}
            <div className="border border-blue-200 bg-blue-50 p-6 rounded-md">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-blue-800">🔄 Rafraîchissement automatique</h3>
                  <p className="text-blue-600 mt-1">
                    Scanner les fondations et organismes pour mettre à jour les appels à projets.
                  </p>
                  {refreshStatus?.lastRefresh && (
                    <p className="text-xs text-blue-500 mt-2">
                      Dernier scan : {new Date(refreshStatus.lastRefresh).toLocaleDateString('fr-FR', { 
                        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}
                    </p>
                  )}
                </div>
                <Button 
                  onClick={() => runRefreshMutation.mutate()}
                  disabled={runRefreshMutation.isPending || refreshStatus?.isRunning}
                  className="bg-blue-600 hover:bg-blue-700"
                  data-testid="button-run-refresh"
                >
                  {runRefreshMutation.isPending || refreshStatus?.isRunning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scan en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Lancer le scan complet
                    </>
                  )}
                </Button>
              </div>
              {refreshStatus?.lastResult && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="bg-white p-3 rounded text-center">
                    <div className="text-xl font-bold text-blue-700">{refreshStatus.lastResult.organismsScraped}</div>
                    <div className="text-xs text-gray-600">Organismes scannés</div>
                  </div>
                  <div className="bg-white p-3 rounded text-center">
                    <div className="text-xl font-bold text-green-600">{refreshStatus.lastResult.newGrantsFound}</div>
                    <div className="text-xs text-gray-600">Nouvelles subventions</div>
                  </div>
                  <div className="bg-white p-3 rounded text-center">
                    <div className="text-xl font-bold text-red-600">{refreshStatus.lastResult.expiredArchived}</div>
                    <div className="text-xs text-gray-600">Expirées archivées</div>
                  </div>
                </div>
              )}
            </div>

            {/* Section Deadlines */}
            <div className="border border-gray-200 p-6 rounded-md">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium">Fraîcheur des données</h3>
                  <p className="text-gray-600 mt-1">
                    Vérification des deadlines pour éviter d'envoyer des subventions clôturées aux clients.
                  </p>
                </div>
                <Button 
                  onClick={() => archiveExpiredMutation.mutate()}
                  disabled={archiveExpiredMutation.isPending || !deadlines?.expired.length}
                  className="bg-red-600 hover:bg-red-700"
                  data-testid="button-archive-expired"
                >
                  {archiveExpiredMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Archivage...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Archiver les expirées ({deadlines?.expired.length || 0})
                    </>
                  )}
                </Button>
              </div>

              {deadlinesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : deadlines ? (
                <div className="space-y-6">
                  {/* Statistiques */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-md text-center">
                      <div className="text-2xl font-bold text-gray-800">{deadlines.total}</div>
                      <div className="text-sm text-gray-600">Total actives</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-md text-center">
                      <div className="text-2xl font-bold text-red-600">{deadlines.expired.length}</div>
                      <div className="text-sm text-red-600">Expirées ⚠️</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-md text-center">
                      <div className="text-2xl font-bold text-orange-600">{deadlines.soonExpiring.length}</div>
                      <div className="text-sm text-orange-600">Expirent dans 30j</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-md text-center">
                      <div className="text-2xl font-bold text-green-600">{deadlines.permanent}</div>
                      <div className="text-sm text-green-600">Permanentes</div>
                    </div>
                  </div>

                  {/* Liste des expirées */}
                  {deadlines.expired.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                      <h4 className="font-medium text-red-800 mb-3">
                        🚨 Subventions expirées ({deadlines.expired.length})
                      </h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {deadlines.expired.map((grant) => (
                          <div key={grant.id} className="flex items-center justify-between bg-white p-2 rounded border border-red-100">
                            <span className="text-sm text-gray-800 truncate flex-1">{grant.title}</span>
                            <Badge variant="destructive" className="ml-2">{grant.deadline}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Liste des bientôt expirées */}
                  {deadlines.soonExpiring.length > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
                      <h4 className="font-medium text-orange-800 mb-3">
                        ⏰ Expirent dans les 30 prochains jours ({deadlines.soonExpiring.length})
                      </h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {deadlines.soonExpiring.map((grant) => (
                          <div key={grant.id} className="flex items-center justify-between bg-white p-2 rounded border border-orange-100">
                            <span className="text-sm text-gray-800 truncate flex-1">{grant.title}</span>
                            <div className="flex items-center gap-2 ml-2">
                              <Badge variant="outline" className="text-orange-600 border-orange-300">
                                {grant.daysLeft}j restants
                              </Badge>
                              <span className="text-xs text-gray-500">{grant.deadline}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {deadlines.expired.length === 0 && deadlines.soonExpiring.length === 0 && (
                    <div className="text-center py-8 text-green-600">
                      <CheckCircle className="h-12 w-12 mx-auto mb-2" />
                      <p className="font-medium">Toutes les subventions sont à jour !</p>
                      <p className="text-sm text-gray-500 mt-1">Aucune deadline expirée ou proche détectée.</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Erreur lors du chargement des deadlines</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="html" className="space-y-6">
            <div className="border border-gray-200 p-6 rounded-md">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">Nettoyage du HTML</h2>
                  <p className="text-gray-600 mt-1">
                    Les descriptions contiennent des balises HTML brutes. Ce nettoyage les convertit en texte propre.
                  </p>
                </div>
                <Button 
                  onClick={() => cleanHtmlMutation.mutate()}
                  disabled={cleanHtmlMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                  data-testid="button-clean-html"
                >
                  {cleanHtmlMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Nettoyage...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Nettoyer tout le HTML
                    </>
                  )}
                </Button>
              </div>

              {htmlAnalysis && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    {htmlAnalysis.withHtml.map(item => (
                      <div key={item.field} className="border border-gray-200 p-4 rounded-md">
                        <div className="text-2xl font-bold text-blue-600">{item.count}</div>
                        <div className="text-sm text-gray-600">{getFieldName(item.field)} avec HTML</div>
                      </div>
                    ))}
                  </div>

                  {htmlAnalysis.examples.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-semibold mb-3">Exemples de contenu HTML :</h3>
                      <div className="space-y-3">
                        {htmlAnalysis.examples.slice(0, 5).map((example, idx) => (
                          <div key={idx} className="bg-gray-50 p-3 rounded-md">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{getFieldName(example.field)}</Badge>
                              <span className="text-sm font-medium truncate">{example.title}</span>
                            </div>
                            <pre className="text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap bg-gray-100 p-2 rounded">
                              {example.sample}...
                            </pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="urls" className="space-y-6">
            <div className="border border-gray-200 p-6 rounded-md">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">URLs problématiques</h2>
                  <p className="text-gray-600 mt-1">
                    Certaines URLs pointent vers des homepages au lieu des formulaires de candidature.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => deepSearchUrlsMutation.mutate(urlIssues?.total || 10)}
                    disabled={deepSearchUrlsMutation.isPending || !urlIssues?.total}
                    className="bg-indigo-600 hover:bg-indigo-700"
                    data-testid="button-deepsearch-urls"
                  >
                    {deepSearchUrlsMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        DeepSearch IA...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        DeepSearch IA ({urlIssues?.total || 0})
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {urlIssues && urlIssues.grants.length > 0 ? (
                <div className="space-y-3">
                  {urlIssues.grants.map((grant) => (
                    <div key={grant.id} className="border border-gray-200 p-4 rounded-md">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{grant.title}</div>
                          <div className="text-sm text-gray-500">{grant.organization}</div>
                          <Badge variant="outline" className="mt-2 text-orange-600 border-orange-300">
                            {grant.issue}
                          </Badge>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          {grant.url !== '(manquante)' && safeExternalUrl(grant.url) && (
                            <a
                              href={safeExternalUrl(grant.url)}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                            >
                              URL actuelle <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          {editingUrlId === grant.id ? (
                            <div className="flex gap-2">
                              <Input
                                value={newUrl}
                                onChange={(e) => setNewUrl(e.target.value)}
                                placeholder="Nouvelle URL..."
                                className="w-64"
                                data-testid={`input-url-${grant.id}`}
                              />
                              <Button 
                                size="sm" 
                                onClick={() => updateUrlMutation.mutate({ grantId: grant.id, url: newUrl })}
                                disabled={!newUrl || updateUrlMutation.isPending}
                                data-testid={`button-save-url-${grant.id}`}
                              >
                                Sauver
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => { setEditingUrlId(null); setNewUrl(""); }}
                              >
                                Annuler
                              </Button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => deepSearchSingleMutation.mutate(grant.id)}
                                disabled={deepSearchSingleMutation.isPending}
                                data-testid={`button-auto-fix-url-${grant.id}`}
                              >
                                {deepSearchSingleMutation.isPending ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <>
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    IA
                                  </>
                                )}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => { setEditingUrlId(grant.id); setNewUrl(grant.improvedUrl || ""); }}
                                data-testid={`button-edit-url-${grant.id}`}
                              >
                                <Link className="h-3 w-3 mr-1" />
                                Manuel
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      {grant.improvedUrl && (
                        <div className="mt-2 text-xs text-green-600">
                          URL corrigée: {grant.improvedUrl}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Aucune URL problématique détectée
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="enrichment" className="space-y-6">
            <div className="border border-gray-200 p-6 rounded-md">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">Enrichissement IA automatique</h2>
                  <p className="text-gray-600 mt-1">
                    Utilise DeepSeek pour résumer les textes trop longs et compléter les champs manquants.
                  </p>
                </div>
                <Button 
                  onClick={enrichAllProblematic}
                  disabled={enrichMultipleMutation.isPending}
                  className="bg-[#06D6A0] hover:bg-[#05b589]"
                  data-testid="button-enrich-all"
                >
                  {enrichMultipleMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enrichissement...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Enrichir automatiquement
                    </>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="border border-orange-200 bg-orange-50 p-4 rounded-md">
                  <div className="text-2xl font-bold text-orange-600">{report.summary.warnings}</div>
                  <div className="text-sm text-gray-600">Textes trop longs à résumer</div>
                </div>
                <div className="border border-red-200 bg-red-50 p-4 rounded-md">
                  <div className="text-2xl font-bold text-red-600">{report.summary.critical}</div>
                  <div className="text-sm text-gray-600">Champs critiques à compléter</div>
                </div>
              </div>

              <Collapsible open={expandedIssues} onOpenChange={setExpandedIssues}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Problèmes détectés ({report.issuesFound.length})</h3>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" size="sm">
                      {expandedIssues ? 'Masquer' : 'Afficher'}
                    </Button>
                  </CollapsibleTrigger>
                </div>

                <CollapsibleContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {Object.entries(issuesByField).map(([field, issues]) => (
                      <div key={field} className="border-l-4 border-gray-300 pl-4">
                        <h4 className="font-semibold mb-2">
                          {getFieldName(field)} <span className="text-gray-500 text-sm">({issues.length})</span>
                        </h4>
                        
                        <div className="space-y-2">
                          {issues.slice(0, 5).map((issue, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-2 bg-gray-50 rounded-md">
                              {getSeverityIcon(issue.severity)}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className={`text-xs ${getSeverityBadge(issue.severity)}`}>
                                    {issue.severity}
                                  </Badge>
                                  <span className="text-sm truncate">{issue.grantTitle}</span>
                                </div>
                                <p className="text-xs text-gray-600">{issue.issue}</p>
                              </div>
                            </div>
                          ))}
                          {issues.length > 5 && (
                            <p className="text-xs text-gray-500 italic">
                              ... et {issues.length - 5} autres
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
