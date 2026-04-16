import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, RefreshCw, Search, ExternalLink, Euro, MapPin, Building2, Calendar, Users, TrendingUp } from "lucide-react";
import type { Grant } from "@shared/schema";
import { useState } from "react";

export default function GrantsAdminPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);

  const { data: grants, isLoading, refetch } = useQuery<Grant[]>({
    queryKey: ["/api/admin/grants"],
  });

  // Filtrer les subventions
  const filteredGrants = grants?.filter(grant => {
    const matchesSearch = searchTerm === "" || 
      grant.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grant.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grant.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesOrg = selectedOrg === null || grant.organization === selectedOrg;
    
    return matchesSearch && matchesOrg;
  });

  // Statistiques
  const totalGrants = grants?.length || 0;
  const organizations = grants ? Array.from(new Set(grants.map(g => g.organization))).sort() : [];
  const euGrants = grants?.filter(g => g.organization.includes("Commission Européenne")).length || 0;
  const frenchGrants = grants?.filter(g => !g.organization.includes("Commission Européenne")).length || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Base de Subventions</h1>
              <p className="text-sm text-gray-500 mt-1">
                {totalGrants} subvention(s) disponible(s)
              </p>
            </div>
            <Button onClick={() => refetch()} variant="outline" data-testid="button-refresh">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="hover-elevate">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-3xl font-bold text-gray-900">{totalGrants}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">🇪🇺 Européennes</p>
                  <p className="text-3xl font-bold text-blue-600">{euGrants}</p>
                </div>
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">🇫🇷 Françaises</p>
                  <p className="text-3xl font-bold text-indigo-600">{frenchGrants}</p>
                </div>
                <MapPin className="h-8 w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par titre, organisation, description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>

              {/* Filtre par organisation */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedOrg === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedOrg(null)}
                  data-testid="button-filter-all"
                >
                  Toutes ({totalGrants})
                </Button>
                <Button
                  variant={selectedOrg === "Commission Européenne - Creative Europe" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedOrg(selectedOrg === "Commission Européenne - Creative Europe" ? null : "Commission Européenne - Creative Europe")}
                  data-testid="button-filter-eu"
                >
                  🇪🇺 EU ({euGrants})
                </Button>
                <Button
                  variant={selectedOrg !== null && selectedOrg !== "Commission Européenne - Creative Europe" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    const firstFrenchOrg = organizations.find(o => !o.includes("Commission Européenne"));
                    setSelectedOrg(selectedOrg && !selectedOrg.includes("Commission Européenne") ? null : firstFrenchOrg || null);
                  }}
                  data-testid="button-filter-fr"
                >
                  🇫🇷 FR ({frenchGrants})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des subventions */}
        <div className="space-y-4">
          {filteredGrants && filteredGrants.length > 0 ? (
            filteredGrants.map((grant) => (
              <GrantCard key={grant.id} grant={grant} />
            ))
          ) : (
            <Card className="p-12 text-center">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucune subvention trouvée</p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

function GrantCard({ grant }: { grant: Grant }) {
  const isEU = grant.organization.includes("Commission Européenne");
  
  return (
    <Card className="hover-elevate" data-testid={`card-grant-${grant.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {isEU && <Badge className="bg-blue-100 text-blue-700">🇪🇺 EU</Badge>}
              {grant.priority === "haute" && <Badge className="bg-red-100 text-red-700">Priorité haute</Badge>}
              <Badge variant="outline" className="text-xs">{grant.status}</Badge>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{grant.title}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building2 className="h-4 w-4" />
              {grant.organization}
            </div>
          </div>
          {grant.url && (
            <Button variant="outline" size="sm" asChild>
              <a href={grant.url} target="_blank" rel="noopener noreferrer" data-testid={`button-view-${grant.id}`}>
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Montant */}
        {(grant.amount || grant.amountMin || grant.amountMax) && (
          <div className="flex items-center gap-2">
            <Euro className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium">
              {grant.amount 
                ? `${grant.amount.toLocaleString('fr-FR')} €`
                : grant.amountMin && grant.amountMax
                ? `${grant.amountMin.toLocaleString('fr-FR')} € - ${grant.amountMax.toLocaleString('fr-FR')} €`
                : "Montant variable"}
            </span>
          </div>
        )}

        {/* Description */}
        {grant.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{grant.description}</p>
        )}

        {/* Secteurs éligibles */}
        {grant.eligibleSectors && grant.eligibleSectors.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {grant.eligibleSectors.slice(0, 5).map((sector, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {sector}
              </Badge>
            ))}
            {grant.eligibleSectors.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{grant.eligibleSectors.length - 5}
              </Badge>
            )}
          </div>
        )}

        {/* Zones géographiques */}
        {grant.geographicZone && grant.geographicZone.length > 0 && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <div className="flex flex-wrap gap-1">
              {grant.geographicZone.map((zone, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {zone}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Deadline */}
        {grant.deadline && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            Deadline: {grant.deadline}
          </div>
        )}

        {/* Difficulté */}
        {grant.applicationDifficulty && (
          <div className="flex items-center gap-2">
            <Badge 
              className={
                grant.applicationDifficulty === "facile" 
                  ? "bg-green-100 text-green-700"
                  : grant.applicationDifficulty === "moyen"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }
            >
              Difficulté: {grant.applicationDifficulty}
            </Badge>
          </div>
        )}

        {/* Taux de financement */}
        {grant.maxFundingRate && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-gray-400" />
            <span>Financement max: {grant.maxFundingRate}%</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
