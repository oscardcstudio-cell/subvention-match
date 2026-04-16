import { useQuery } from "@tanstack/react-query";
import { Loader2, BookOpen, FileText, PlayCircle, Lightbulb, ExternalLink, ArrowLeft, ChevronDown, ChevronUp, FolderOpen, Globe } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import type { GrantResult } from "@shared/schema";
import { useState } from "react";

export default function EnrichedResultsPage() {
  const [, setLocation] = useLocation();
  const [expandedGrants, setExpandedGrants] = useState<Set<string>>(new Set());

  const { data: grants, isLoading } = useQuery<GrantResult[]>({
    queryKey: ["/api/demo-enriched"],
  });

  const toggleExpanded = (grantId: string) => {
    setExpandedGrants(prev => {
      const newSet = new Set(prev);
      if (newSet.has(grantId)) {
        newSet.delete(grantId);
      } else {
        newSet.add(grantId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
          <p className="text-gray-500">Chargement des subventions enrichies...</p>
        </div>
      </div>
    );
  }

  if (!grants || grants.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-500">Aucune subvention enrichie trouvée</p>
          <Button onClick={() => setLocation("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Subventions Enrichies</h1>
            <p className="text-sm text-gray-500 mt-1">
              {grants.length} subventions avec ressources d'aide
            </p>
          </div>
          <Button variant="outline" onClick={() => setLocation("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {grants.map((grant, index) => (
            <div
              key={grant.id}
              className="border border-gray-200 hover:border-black transition-all p-6"
              data-testid={`card-enriched-grant-${index}`}
            >
              {/* Header */}
              <div className="mb-6">
                <div className="text-xs font-mono text-gray-400 mb-2">
                  №{String(index + 1).padStart(2, '0')}
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                  {grant.title}
                </h2>
                <div className="text-lg text-gray-600">
                  {grant.organization}
                </div>
              </div>

              {/* Ressources d'aide */}
              {grant.helpResources && grant.helpResources.length > 0 && (() => {
                const isExpanded = expandedGrants.has(grant.id);
                const maxInitial = 3;
                const displayedResources = isExpanded 
                  ? grant.helpResources 
                  : grant.helpResources.slice(0, maxInitial);
                const hasMore = grant.helpResources.length > maxInitial;
                
                return (
                  <div className="bg-purple-50 border-l-4 border-purple-400 p-5">
                    <h3 className="text-xs uppercase tracking-widest text-purple-700 mb-4 font-bold flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Ressources d'aide ({grant.helpResources.length})
                    </h3>
                    <div className="space-y-3">
                      {displayedResources.map((resource, idx) => (
                        <a
                          key={idx}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow group"
                          data-testid={`link-resource-${index}-${idx}`}
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            {resource.type === 'video' && (
                              <PlayCircle className="h-5 w-5 text-purple-600" />
                            )}
                            {resource.type === 'pdf' && (
                              <FileText className="h-5 w-5 text-red-600" />
                            )}
                            {resource.type === 'guide' && (
                              <BookOpen className="h-5 w-5 text-blue-600" />
                            )}
                            {resource.type === 'tutorial' && (
                              <Lightbulb className="h-5 w-5 text-yellow-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 group-hover:text-purple-700 transition-colors">
                              {resource.title}
                            </div>
                            {resource.description && (
                              <div className="text-xs text-gray-500 mt-1">
                                {resource.description}
                              </div>
                            )}
                            <div className="text-xs text-gray-400 uppercase mt-1">
                              {resource.type === 'video' && 'Vidéo'}
                              {resource.type === 'pdf' && 'PDF'}
                              {resource.type === 'guide' && 'Guide'}
                              {resource.type === 'tutorial' && 'Tutoriel'}
                            </div>
                          </div>
                          <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-colors flex-shrink-0" />
                        </a>
                      ))}
                      
                      {hasMore && (
                        <button
                          onClick={() => toggleExpanded(grant.id)}
                          className="w-full text-center py-2 text-xs font-medium text-purple-700 hover:text-purple-900 transition-colors flex items-center justify-center gap-1"
                          data-testid={`button-toggle-resources-${index}`}
                        >
                          {isExpanded ? (
                            <>
                              Voir moins
                              <ChevronUp className="h-3 w-3" />
                            </>
                          ) : (
                            <>
                              Voir {grant.helpResources.length - maxInitial} de plus
                              <ChevronDown className="h-3 w-3" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* URLs */}
              <div className="mt-4 flex flex-wrap gap-3">
                {grant.improvedUrl && (
                  <a
                    href={grant.improvedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-col items-center gap-1 px-8 py-3 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 hover:shadow-md transition-all"
                    data-testid={`link-improved-url-${index}`}
                  >
                    <FolderOpen className="h-6 w-6" strokeWidth={1.5} />
                    <span className="text-sm font-bold">Dossier</span>
                  </a>
                )}
                
                {grant.url && (
                  <a
                    href={grant.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-col items-center gap-1 px-5 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 hover:shadow-md transition-all"
                    data-testid={`link-base-url-${index}`}
                  >
                    <Globe className="h-6 w-6" strokeWidth={1.5} />
                    <span className="text-sm font-bold">Site</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
