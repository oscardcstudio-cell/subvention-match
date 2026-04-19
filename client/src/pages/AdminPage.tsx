import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, FileText, AlertTriangle } from "lucide-react";
import { SubmissionCard, type AdminSubmission } from "@/components/admin/SubmissionCard";

type BetaFeedback = {
  id: number;
  email?: string;
  createdAt: string;
  [key: string]: unknown;
};

type BetaWaitlistEntry = {
  id: number;
  email: string;
  pricingIntent?: string;
  triggerFeatures?: string[];
  createdAt: string;
};

type FeedbackDashboard = {
  betaCapacity: { count: number; cap: number; isFull: boolean };
  matchFeedback: { byRating: Array<{ rating: string; total: number }>; totalVotes: number };
  recentBetaFeedback: BetaFeedback[];
  qualifiedWaitlist: BetaWaitlistEntry[];
  sourceBreakdown: Array<{ source: string | null; total: number }>;
};

export default function AdminPage() {
  const adminToken =
    typeof window !== "undefined"
      ? localStorage.getItem("adminToken") ||
        new URLSearchParams(window.location.search).get("admin_token") ||
        ""
      : "";

  const {
    data: submissions,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery<AdminSubmission[]>({
    queryKey: ["/api/admin/submissions"],
  });

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery<FeedbackDashboard>({
    queryKey: ["/api/admin/feedback-dashboard", adminToken],
    queryFn: async () => {
      const res = await fetch("/api/admin/feedback-dashboard", {
        headers: { "x-admin-token": adminToken },
      });
      if (!res.ok) throw new Error("Non autorisé");
      return res.json();
    },
    enabled: !!adminToken,
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

        {/* Signal beta dashboard */}
        {dashboardLoading && adminToken && (
          <div className="mt-8 flex items-center gap-2 text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Chargement Signal beta…
          </div>
        )}
        {dashboardData && (
          <section className="max-w-7xl mx-auto py-8 border-t border-gray-200 mt-8" data-testid="feedback-dashboard">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Signal beta</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {/* Cap beta */}
              <Card className="p-5">
                <div className="text-sm font-medium text-gray-500 mb-1">Cap beta</div>
                <div className="text-3xl font-bold">
                  {dashboardData.betaCapacity.count} / {dashboardData.betaCapacity.cap}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {dashboardData.betaCapacity.isFull ? "COMPLET" : "Places disponibles"}
                </div>
              </Card>
              {/* Match feedback */}
              <Card className="p-5">
                <div className="text-sm font-medium text-gray-500 mb-1">Match feedback</div>
                <div className="text-3xl font-bold">{dashboardData.matchFeedback.totalVotes}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {dashboardData.matchFeedback.byRating.map((r) => `${r.rating}: ${r.total}`).join(" · ")}
                </div>
              </Card>
              {/* Waitlist qualifiée */}
              <Card className="p-5">
                <div className="text-sm font-medium text-gray-500 mb-1">Waitlist qualifiée</div>
                <div className="text-3xl font-bold">
                  {dashboardData.qualifiedWaitlist.filter((e) => e.pricingIntent).length}
                </div>
                <div className="text-xs text-gray-400 mt-1">avec intention de payer renseignée</div>
              </Card>
            </div>

            {/* Source breakdown (GROWTH-03) */}
            {dashboardData.sourceBreakdown && dashboardData.sourceBreakdown.length > 0 && (
              <div className="mb-8">
                <h3 className="text-base font-semibold text-gray-800 mb-3">Sources d'acquisition</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {dashboardData.sourceBreakdown.map((s, idx) => (
                    <Card key={idx} className="p-3">
                      <div className="text-xs text-gray-500 truncate" title={s.source ?? "(direct)"}>
                        {s.source ?? "(direct / inconnue)"}
                      </div>
                      <div className="text-2xl font-bold">{Number(s.total)}</div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Tableau waitlist qualifiée */}
            {dashboardData.qualifiedWaitlist.length > 0 && (
              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-3">Waitlist qualifiée</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b">
                        <th className="pb-2 pr-4">Email</th>
                        <th className="pb-2 pr-4">Prix €/mois</th>
                        <th className="pb-2 pr-4">Features</th>
                        <th className="pb-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.qualifiedWaitlist.map((e) => (
                        <tr key={e.id} className="border-b border-gray-100">
                          <td className="py-2 pr-4 text-gray-700">{e.email}</td>
                          <td className="py-2 pr-4">{e.pricingIntent || "—"}</td>
                          <td className="py-2 pr-4 text-xs text-gray-500">
                            {e.triggerFeatures ? e.triggerFeatures.join(", ") : "—"}
                          </td>
                          <td className="py-2 text-xs text-gray-400">
                            {new Date(e.createdAt).toLocaleDateString("fr-FR")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
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
