import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, FileText, AlertTriangle } from "lucide-react";
import type { FormSubmission } from "@shared/schema";
import { SubmissionCard } from "@/components/admin/SubmissionCard";

export default function AdminPage() {
  const {
    data: submissions,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery<FormSubmission[]>({
    queryKey: ["/api/admin/submissions"],
  });

  // Premier chargement — on bloque l'UI.
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#06D6A0]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin — Soumissions</h1>
              <p className="text-sm text-gray-500 mt-1">
                {submissions?.length ?? 0} soumission(s) au total
              </p>
            </div>
            <Button
              onClick={() => refetch()}
              variant="outline"
              disabled={isFetching}
              data-testid="button-refresh"
            >
              {isFetching ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {isFetching ? "Chargement…" : "Actualiser"}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {isError ? (
          <ErrorState error={error} onRetry={() => refetch()} retrying={isFetching} />
        ) : !submissions || submissions.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            {submissions.map((submission) => (
              <SubmissionCard key={submission.sessionId} submission={submission} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="p-12 text-center">
      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500">Aucune soumission pour le moment</p>
    </Card>
  );
}

function ErrorState({
  error,
  onRetry,
  retrying,
}: {
  error: unknown;
  onRetry: () => void;
  retrying: boolean;
}) {
  const message =
    error instanceof Error ? error.message : "Impossible de charger les soumissions.";

  return (
    <Card className="p-12 text-center border-red-200 bg-red-50">
      <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
      <p className="text-red-700 font-medium mb-2">Une erreur est survenue</p>
      <p className="text-sm text-red-600 mb-6">{message}</p>
      <Button
        onClick={onRetry}
        variant="outline"
        disabled={retrying}
        data-testid="button-retry"
      >
        {retrying ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4 mr-2" />
        )}
        Réessayer
      </Button>
    </Card>
  );
}
