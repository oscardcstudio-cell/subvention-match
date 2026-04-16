import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, PlayCircle, CheckCircle2, XCircle, Clock, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EnrichmentStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  failed: number;
}

interface Grant {
  id: string;
  title: string;
  organization: string;
  enrichmentStatus: string | null;
  enrichmentDate: string | null;
  enrichmentError: string | null;
  amount: number | null;
  amountMin: number | null;
  amountMax: number | null;
  deadline: string | null;
  contactEmail: string | null;
  processingTime: string | null;
  applicationDifficulty: string | null;
}

interface Organism {
  id: string;
  name: string;
  type: string;
  sector: string[];
  website: string | null;
  status: string;
  totalAidsFound: number;
  totalAidsAdded: number;
  lastScrapedAt: string | null;
  notes: string | null;
}

interface OrganismStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  failed: number;
  totalAidsFound: number;
  totalAidsAdded: number;
}

function StatusBadge({ status }: { status: string | null }) {
  if (!status || status === "pending") {
    return <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" />En attente</Badge>;
  }
  if (status === "in_progress") {
    return <Badge className="gap-1 bg-blue-600"><Loader2 className="w-3 h-3 animate-spin" />En cours</Badge>;
  }
  if (status === "completed") {
    return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle2 className="w-3 h-3" />Enrichie</Badge>;
  }
  if (status === "failed") {
    return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />Échec</Badge>;
  }
  return <Badge variant="outline">{status}</Badge>;
}

export default function EnrichmentMonitor() {
  const { toast } = useToast();
  const [showAllEnriched, setShowAllEnriched] = useState(false);
  const previousPending = useRef<number | null>(null);
  const previousInProgress = useRef<number | null>(null);

  const { data: stats, isLoading: statsLoading } = useQuery<EnrichmentStats>({
    queryKey: ['/api/enrichment/stats'],
    refetchInterval: 5000,
  });

  // Détecter quand l'enrichissement est terminé avec succès
  useEffect(() => {
    if (stats && previousInProgress.current !== null && previousPending.current !== null) {
      // Si on avait des subventions en cours et maintenant il n'y en a plus
      if (previousInProgress.current > 0 && stats.inProgress === 0 && stats.pending === 0) {
        toast({
          title: "✅ Enrichissement terminé !",
          description: `${stats.completed} subventions enrichies avec succès`,
          duration: 5000,
        });
      }
      // Si on avait des subventions en attente et maintenant elles sont toutes enrichies
      else if (previousPending.current > 0 && stats.pending === 0 && previousInProgress.current === 0 && stats.inProgress === 0) {
        toast({
          title: "✅ Enrichissement terminé !",
          description: `Toutes les subventions ont été enrichies`,
          duration: 5000,
        });
      }
    }
    previousPending.current = stats?.pending ?? null;
    previousInProgress.current = stats?.inProgress ?? null;
  }, [stats, toast]);

  const { data: grants = [], isLoading: grantsLoading } = useQuery<Grant[]>({
    queryKey: ['/api/enrichment/grants'],
    refetchInterval: 5000,
  });

  const { data: organismStats, isLoading: organismStatsLoading } = useQuery<OrganismStats>({
    queryKey: ['/api/organisms/stats'],
    refetchInterval: 5000,
  });

  const { data: organisms = [], isLoading: organismsLoading } = useQuery<Organism[]>({
    queryKey: ['/api/organisms'],
    refetchInterval: 5000,
  });

  const startEnrichmentMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/enrichment/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 10 }),
      });
      if (!response.ok) throw new Error('Échec du démarrage');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "🚀 Enrichissement démarré",
        description: "Le processus d'enrichissement automatique a commencé",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/enrichment/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/enrichment/grants'] });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const startOrganismScrapingMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/organisms/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Échec du démarrage');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "🏛️ Scraping des organismes démarré",
        description: "Le système va parcourir les 24 organismes automatiquement",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/organisms/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/organisms'] });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const pendingGrants = grants.filter(g => !g.enrichmentStatus || g.enrichmentStatus === 'pending');
  
  // Trier les subventions enrichies par date décroissante (plus récentes en premier)
  const completedGrants = grants
    .filter(g => g.enrichmentStatus === 'completed')
    .sort((a, b) => {
      if (!a.enrichmentDate) return 1;
      if (!b.enrichmentDate) return -1;
      return new Date(b.enrichmentDate).getTime() - new Date(a.enrichmentDate).getTime();
    });
  
  const failedGrants = grants.filter(g => g.enrichmentStatus === 'failed');

  // Afficher les 10 dernières enrichies par défaut, ou toutes si showAllEnriched
  const displayedEnriched = showAllEnriched ? completedGrants : completedGrants.slice(0, 10);
  
  // Afficher les 10 prochaines à enrichir
  const nextToEnrich = pendingGrants.slice(0, 10);

  if (statsLoading || grantsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Chargement...</span>
        </div>
      </div>
    );
  }

  const completionPercent = stats ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Monitoring de l'enrichissement</h1>
          <p className="text-muted-foreground">
            Suivi en temps réel de l'enrichissement automatique des {stats?.total} subventions
          </p>
        </div>

        {/* Encadré Organismes */}
        <Card className="mb-6 border-2 border-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🏛️ Organismes français (24 organismes nationaux prioritaires)
            </CardTitle>
            <CardDescription>
              Scraping automatique des organismes pour découvrir de nouvelles subventions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {organismStatsLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Chargement...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Total</div>
                  <div className="text-2xl font-bold">{organismStats?.total || 0}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">En attente</div>
                  <div className="text-2xl font-bold text-yellow-600">{organismStats?.pending || 0}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Complétés</div>
                  <div className="text-2xl font-bold text-green-600">{organismStats?.completed || 0}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Aides trouvées</div>
                  <div className="text-2xl font-bold text-blue-600">{organismStats?.totalAidsFound || 0}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Aides ajoutées</div>
                  <div className="text-2xl font-bold text-purple-600">{organismStats?.totalAidsAdded || 3}</div>
                </div>
              </div>
            )}
            
            <div className="mt-4">
              <Button 
                onClick={() => startOrganismScrapingMutation.mutate()}
                disabled={startOrganismScrapingMutation.isPending || (organismStats?.pending || 0) === 0}
                variant="default"
                size="lg"
                className="w-full"
                data-testid="button-start-organism-scraping"
              >
                {startOrganismScrapingMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Lancement...
                  </>
                ) : (
                  <>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Scraper automatiquement les {organismStats?.pending || 0} organismes restants
                  </>
                )}
              </Button>
            </div>

            {!organismsLoading && organisms.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="text-sm font-medium">Organismes en cours de scraping :</div>
                <div className="flex flex-wrap gap-2">
                  {organisms.slice(0, 10).map((org) => (
                    <Badge 
                      key={org.id} 
                      variant={org.status === 'completed' ? 'default' : org.status === 'pending' ? 'secondary' : 'outline'}
                      className="text-xs"
                    >
                      {org.name} {org.status === 'completed' && `(${org.totalAidsAdded})`}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card data-testid="card-stats-pending">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">En attente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pending || 0}</div>
            </CardContent>
          </Card>

          <Card data-testid="card-stats-completed">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Enrichies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.completed || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">{completionPercent}% complété</p>
            </CardContent>
          </Card>

          <Card data-testid="card-stats-failed">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Échecs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats?.failed || 0}</div>
            </CardContent>
          </Card>

          <Card data-testid="card-stats-progress">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">En cours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats?.inProgress || 0}</div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <Button 
            onClick={() => startEnrichmentMutation.mutate()}
            disabled={startEnrichmentMutation.isPending || (stats?.inProgress || 0) > 0}
            size="lg"
            data-testid="button-start-enrichment"
          >
            {startEnrichmentMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Démarrage...
              </>
            ) : (
              <>
                <PlayCircle className="mr-2 h-4 w-4" />
                Lancer l'enrichissement ({pendingGrants.length} restantes)
              </>
            )}
          </Button>
        </div>

        <div className="space-y-6">
          {/* Prochaines subventions à enrichir */}
          {nextToEnrich.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Prochaines à enrichir ({pendingGrants.length} en attente)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nextToEnrich.map((grant) => (
                  <GrantCard key={grant.id} grant={grant} />
                ))}
              </div>
              <div className="mt-4 text-sm text-muted-foreground text-center">
                {pendingGrants.length > 10 && `+ ${pendingGrants.length - 10} autres subventions en attente`}
              </div>
            </div>
          )}

          {/* Dernières subventions enrichies */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                Dernières subventions enrichies ({displayedEnriched.length}/{completedGrants.length})
              </h2>
              {completedGrants.length > 10 && (
                <Button 
                  variant="outline" 
                  onClick={() => setShowAllEnriched(!showAllEnriched)}
                  data-testid="button-toggle-enriched"
                >
                  {showAllEnriched ? (
                    <>
                      <ChevronUp className="mr-2 h-4 w-4" />
                      Masquer
                    </>
                  ) : (
                    <>
                      <ChevronDown className="mr-2 h-4 w-4" />
                      Voir toutes les enrichies ({completedGrants.length})
                    </>
                  )}
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedEnriched.map((grant) => (
                <GrantCard key={grant.id} grant={grant} />
              ))}
            </div>
            {displayedEnriched.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Aucune subvention enrichie pour le moment
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function GrantCard({ grant }: { grant: Grant }) {
  // Vérifier si un champ contient du HTML (pas une vraie donnée propre)
  const isHtml = (text: string | null) => {
    if (!text) return false;
    return text.includes('<') || text.includes('>') || text.length > 150;
  };

  // Extraire un email d'un texte HTML si possible
  const extractEmail = (text: string | null): string | null => {
    if (!text) return null;
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
    const match = text.match(emailRegex);
    return match ? match[1] : null;
  };

  const cleanEmail = grant.contactEmail && !isHtml(grant.contactEmail) 
    ? grant.contactEmail 
    : extractEmail(grant.contactEmail);

  const hasData = grant.amount || grant.amountMin || grant.deadline || cleanEmail || grant.processingTime || grant.applicationDifficulty;

  return (
    <Card className="hover-elevate" data-testid={`card-grant-${grant.id}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2 mb-2">
          <StatusBadge status={grant.enrichmentStatus} />
          {hasData && <Badge variant="outline" className="gap-1"><CheckCircle2 className="w-3 h-3" />Données</Badge>}
        </div>
        <CardTitle className="text-base leading-tight line-clamp-2">{grant.title}</CardTitle>
        <CardDescription className="text-xs">{grant.organization}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {grant.amount && (
          <div className="text-sm">
            <span className="text-muted-foreground">💰 </span>
            <span className="font-medium">{grant.amount.toLocaleString()} €</span>
          </div>
        )}
        {(grant.amountMin || grant.amountMax) && (
          <div className="text-sm">
            <span className="text-muted-foreground">💰 </span>
            <span className="font-medium">
              {grant.amountMin?.toLocaleString() || '?'} - {grant.amountMax?.toLocaleString() || '?'} €
            </span>
          </div>
        )}
        {grant.deadline && (
          <div className="text-sm">
            <span className="text-muted-foreground">📅 </span>
            <span className="font-medium">{grant.deadline}</span>
          </div>
        )}
        {grant.processingTime && (
          <div className="text-sm">
            <span className="text-muted-foreground">⏱️ </span>
            <span className="font-medium">{grant.processingTime}</span>
          </div>
        )}
        {cleanEmail && (
          <div className="text-sm">
            <span className="text-muted-foreground">📧 </span>
            <span className="font-medium text-xs">{cleanEmail}</span>
          </div>
        )}
        {grant.applicationDifficulty && (
          <div className="text-sm">
            <span className="text-muted-foreground">📊 </span>
            <Badge variant="outline" className="text-xs">{grant.applicationDifficulty}</Badge>
          </div>
        )}
        {grant.enrichmentError && (
          <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950 p-2 rounded">
            <div className="flex items-start gap-1">
              <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span className="text-xs">{grant.enrichmentError}</span>
            </div>
          </div>
        )}
        {grant.enrichmentDate && (
          <div className="text-xs text-muted-foreground">
            Enrichie le {new Date(grant.enrichmentDate).toLocaleDateString('fr-FR')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
