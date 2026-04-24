import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { LanguageToggle } from "@/components/LanguageToggle";
import {
  Loader2, Calendar, ArrowRight, Coins, Zap, Target, Check, ExternalLink,
  FileText, Filter, ChevronDown, ThumbsUp, ThumbsDown, Mail, X,
} from "lucide-react";
import type { GrantResult } from "@shared/schema";
import { trackResultsViewed, trackMatchFeedback, trackPdfDownloaded } from "@/lib/analytics";

type ResultsResponse = {
  results: GrantResult[];
  isPaid: boolean;
  submission?: {
    projectDescription?: string;
    status?: string[];
    artisticDomain?: string[];
    projectType?: string[];
    region?: string;
    isInternational?: string;
  };
};

export default function ResultsPage() {
  const { language, setLanguage } = useLanguage();
  const [, setLocation] = useLocation();
  const [sessionId, setSessionId] = useState<string>("");
  const [sortBy, setSortBy] = useState<"score" | "deadline" | "amount">("score");
  const [feedbackSent, setFeedbackSent] = useState<Record<string, "up" | "down">>({});
  const [nudgeVisible, setNudgeVisible] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("sessionId");
    if (id) setSessionId(id);
    else setLocation("/");
  }, [setLocation]);

  const { data, isLoading, isError } = useQuery<ResultsResponse>({
    queryKey: ["/api/results", sessionId],
    enabled: !!sessionId,
  });

  const results = data?.results || [];

  useEffect(() => {
    if (results.length) {
      trackResultsViewed({ matchCount: results.length, sessionId });
    }
  }, [results.length, sessionId]);

  useEffect(() => {
    if (!results.length) return;
    if (sessionStorage.getItem('nudge_dismissed') === '1') return;
    const t = setTimeout(() => setNudgeVisible(true), 3000);
    return () => clearTimeout(t);
  }, [results.length]);
  const sorted = [...results].sort((a, b) => {
    if (sortBy === "score") return (b.matchScore || 0) - (a.matchScore || 0);
    if (sortBy === "deadline") {
      const da = new Date(a.deadline).getTime() || Infinity;
      const db = new Date(b.deadline).getTime() || Infinity;
      return da - db;
    }
    return 0;
  });

  const feedbackMutation = useMutation({
    mutationFn: async ({ grantId, vote }: { grantId: string; vote: "up" | "down" }) => {
      const rating = vote === "up" ? "relevant" : "not_relevant";
      await apiRequest("POST", "/api/match-feedback", { sessionId, grantId, rating });
      trackMatchFeedback({ grantId, sessionId, rating });
    },
  });

  const handleFeedback = (grantId: string, vote: "up" | "down") => {
    if (feedbackSent[grantId]) return;
    setFeedbackSent((s) => ({ ...s, [grantId]: vote }));
    feedbackMutation.mutate({ grantId, vote });
  };

  const pdfUrl = sessionId ? `/api/pdf/${sessionId}` : "";

  // Synthèse
  const avgScore = sorted.length
    ? Math.round(sorted.reduce((a, r) => a + (r.matchScore || 0), 0) / sorted.length)
    : 0;
  const nextDeadline = sorted
    .map((r) => new Date(r.deadline))
    .filter((d) => !isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime())[0];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--mc-bg)", color: "var(--mc-text)" }}>
        <div className="flex items-center gap-3 mc-mono text-sm uppercase tracking-widest" style={{ color: "var(--mc-muted)" }}>
          <Loader2 className="w-4 h-4 animate-spin" /> {language === "fr" ? "Chargement des résultats…" : "Loading results…"}
        </div>
      </div>
    );
  }

  if (isError || (!isLoading && !data)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ background: "var(--mc-bg)", color: "var(--mc-text)" }}>
        <div className="mc-mono text-sm uppercase tracking-widest" style={{ color: "var(--mc-muted)" }}>
          {language === "fr" ? "Impossible de charger les résultats." : "Unable to load results."}
        </div>
        <a href="/" className="mc-btn-primary px-6 py-3 rounded-lg text-sm" style={{ textDecoration: "none" }}>
          {language === "fr" ? "Retour à l'accueil" : "Back to home"}
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--mc-bg)", color: "var(--mc-text)" }}>
      <div className="mc-mono text-xs text-center py-2 px-4" style={{ background: "var(--mc-warn)", color: "var(--mc-bg)" }}>
        [ BETA ] &nbsp;&nbsp;
        {language === "fr"
          ? "Vos retours améliorent le matching. Pouce haut / bas sur chaque résultat."
          : "Your feedback improves matching. Thumb up/down each result."}
      </div>

      <header className="sticky top-0 z-40 backdrop-blur border-b" style={{ background: "rgba(10,10,10,0.85)", borderColor: "var(--mc-border)" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-8 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3" style={{ textDecoration: "none", color: "var(--mc-text)" }}>
            <div className="mc-display text-lg">Mecene<span style={{ color: "var(--mc-primary)" }}>.</span></div>
          </a>
          <nav className="hidden md:flex items-center gap-6 mc-mono text-xs uppercase tracking-widest" style={{ color: "var(--mc-muted)" }}>
            <a href="#matches" className="hover:text-white transition">Top matches</a>
            <a href="#pdf" className="hover:text-white transition">Rapport PDF</a>
          </nav>
          <div className="flex items-center gap-2">
            <LanguageToggle language={language} onLanguageChange={setLanguage} />
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackPdfDownloaded({ sessionId })}
              className="mc-btn-ghost text-xs uppercase tracking-widest mc-mono px-3 py-1.5 rounded-full inline-flex items-center gap-2"
              style={{ textDecoration: "none" }}
            >
              <FileText className="w-3.5 h-3.5" /> {language === "fr" ? "Télécharger PDF" : "Download PDF"}
            </a>
          </div>
        </div>
      </header>

      {/* Summary */}
      <section>
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-14">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-8">
              <div className="mc-mono text-xs uppercase tracking-widest mb-6 md:mb-8" style={{ color: "var(--mc-primary)" }}>
                / 01 — {language === "fr" ? "Résultats pour votre projet" : "Results for your project"}
              </div>
              <h1 className="mc-display text-[56px] md:text-[96px]">
                {results.length} MATCH{results.length > 1 ? "ES" : ""}<br />
                {language === "fr" ? "TROUVÉS" : "FOUND"}<span style={{ color: "var(--mc-primary)" }}>.</span>
              </h1>
            </div>
            <div className="col-span-12 md:col-span-4">
              <div className="mc-mono text-xs uppercase tracking-widest mb-6" style={{ color: "var(--mc-muted)" }}>
                {language === "fr" ? "Synthèse" : "Summary"}
              </div>
              <div className="mc-card mc-divide-border">
                <SynthRow label={language === "fr" ? "Matches" : "Matches"} value={String(results.length)} color="primary" />
                <SynthRow label={language === "fr" ? "Score moyen" : "Avg score"} value={`${avgScore}%`} />
                <SynthRow
                  label={language === "fr" ? "Deadline la + proche" : "Next deadline"}
                  value={nextDeadline ? nextDeadline.toLocaleDateString(language === "fr" ? "fr-FR" : "en-US", { day: "numeric", month: "short" }) : "—"}
                  size="md"
                />
              </div>
            </div>
          </div>

          {/* Project recap */}
          {data?.submission && (
            <div className="mt-10">
              <div className="mc-mono text-xs uppercase tracking-widest mb-4 flex items-center justify-between" style={{ color: "var(--mc-muted)" }}>
                <span>/ {language === "fr" ? "Votre projet" : "Your project"}</span>
                <button
                  onClick={() => setLocation("/form")}
                  className="inline-flex items-center gap-1.5 hover:text-white transition"
                  style={{ color: "var(--mc-accent)" }}
                >
                  ✎ {language === "fr" ? "Modifier" : "Edit"}
                </button>
              </div>
              <div className="mc-card p-6 md:p-8">
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-5">
                  {data.submission.status && data.submission.status.length > 0 && (
                    <RecapField label={language === "fr" ? "Profil" : "Profile"} value={data.submission.status.join(" · ")} />
                  )}
                  {data.submission.artisticDomain && data.submission.artisticDomain.length > 0 && (
                    <RecapField label={language === "fr" ? "Disciplines" : "Disciplines"} value={data.submission.artisticDomain.join(" · ")} />
                  )}
                  {data.submission.projectType && data.submission.projectType.length > 0 && (
                    <RecapField label={language === "fr" ? "Type de projet" : "Project type"} value={data.submission.projectType.join(" · ")} />
                  )}
                  {data.submission.region && (
                    <RecapField label={language === "fr" ? "Localisation" : "Location"} value={data.submission.region} />
                  )}
                  {data.submission.isInternational && (
                    <RecapField label={language === "fr" ? "International" : "International"} value={labelInternational(data.submission.isInternational, language)} />
                  )}
                </div>
                {data.submission.projectDescription && (
                  <div className="mt-6 pt-5 border-t" style={{ borderColor: "var(--mc-border)" }}>
                    <div className="mc-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--mc-muted)" }}>
                      {language === "fr" ? "Description" : "Description"}
                    </div>
                    <p className="text-sm italic leading-relaxed" style={{ color: "var(--mc-muted)" }}>
                      « {data.submission.projectDescription} »
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Filters */}
      <section className="border-t border-b" style={{ borderColor: "var(--mc-border)" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="mc-mono text-xs uppercase tracking-widest inline-flex items-center gap-2" style={{ color: "var(--mc-muted)" }}>
              <Filter className="w-3.5 h-3.5" /> {language === "fr" ? "Trier par :" : "Sort by:"}
            </span>
            <button onClick={() => setSortBy("score")} className={`mc-chip transition ${sortBy === "score" ? "mc-chip-primary" : ""}`} style={sortBy !== "score" ? { background: "var(--mc-panel)", color: "var(--mc-muted)" } : undefined}>
              {language === "fr" ? "Score décroissant" : "Score ↓"}
            </button>
            <button onClick={() => setSortBy("deadline")} className={`mc-chip transition ${sortBy === "deadline" ? "mc-chip-primary" : ""}`} style={sortBy !== "deadline" ? { background: "var(--mc-panel)", color: "var(--mc-muted)" } : undefined}>
              {language === "fr" ? "Deadline proche" : "Soonest deadline"}
            </button>
          </div>
          <div className="mc-mono text-xs uppercase tracking-widest" style={{ color: "var(--mc-muted)" }}>
            {results.length} {language === "fr" ? "résultats" : "results"}
          </div>
        </div>
      </section>

      {/* Matches */}
      <section id="matches">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-14 space-y-4">
          {sorted.map((grant, i) => (
            <MatchCard
              key={grant.id}
              grant={grant}
              rank={i + 1}
              top={i === 0}
              feedback={feedbackSent[grant.id]}
              onFeedback={(vote) => handleFeedback(grant.id, vote)}
              language={language}
              userRegion={data?.submission?.region}
            />
          ))}
        </div>
      </section>

      {/* PDF CTA */}
      <section id="pdf" className="border-t" style={{ borderColor: "var(--mc-border)" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-8 py-20 grid md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-7">
            <div className="mc-mono text-xs uppercase tracking-widest mb-6" style={{ color: "var(--mc-primary)" }}>/ 02 — {language === "fr" ? "Rapport complet" : "Full report"}</div>
            <h2 className="mc-display text-4xl md:text-5xl">
              {language === "fr" ? <>TÉLÉCHARGEZ<br />VOTRE <span style={{ color: "var(--mc-primary)" }}>PDF</span>.</> : <>DOWNLOAD<br />YOUR <span style={{ color: "var(--mc-primary)" }}>PDF</span>.</>}
            </h2>
            <p className="mt-6 leading-relaxed max-w-md" style={{ color: "var(--mc-muted)" }}>
              {language === "fr"
                ? "Tous vos matches, leurs critères, deadlines, conseils de dépôt. 100 % gratuit pendant la beta."
                : "All your matches, criteria, deadlines, tips. 100% free during beta."}
            </p>
          </div>
          <div className="md:col-span-5">
            <div className="mc-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-4 h-4" style={{ color: "var(--mc-primary)" }} />
                <div>
                  <div className="font-bold">Rapport_Mecene_{sessionId.slice(0, 8)}.pdf</div>
                  <div className="text-xs mc-mono" style={{ color: "var(--mc-muted)" }}>
                    {language === "fr" ? `${results.length} matches · généré à l'instant` : `${results.length} matches · just generated`}
                  </div>
                </div>
              </div>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackPdfDownloaded({ sessionId })}
                className="mc-btn-primary w-full py-3 rounded-lg text-sm inline-flex items-center justify-center gap-2"
                style={{ textDecoration: "none" }}
              >
                <FileText className="w-3.5 h-3.5" /> {language === "fr" ? "Télécharger le PDF" : "Download PDF"}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FeedbackNudge */}
      {nudgeVisible && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-4 px-6 py-3 mc-mono text-xs uppercase tracking-widest"
          style={{ background: "var(--mc-warn)", color: "var(--mc-bg)" }}
        >
          <span>
            {language === "fr"
              ? "Aidez-nous : les pouces haut/bas sur chaque résultat prennent 5 secondes."
              : "Help us: thumbs up/down on each result takes 5 seconds."}
          </span>
          <button
            onClick={() => {
              setNudgeVisible(false);
              sessionStorage.setItem('nudge_dismissed', '1');
            }}
            className="flex-shrink-0 hover:opacity-70 transition-opacity"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t" style={{ borderColor: "var(--mc-border)" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 mc-mono text-xs uppercase tracking-widest flex flex-wrap justify-between gap-4" style={{ color: "var(--mc-muted)" }}>
          <span>© 2026 Mecene</span>
          <span className="flex flex-wrap gap-4 md:gap-6">
            <a href="/" className="hover:text-white transition" style={{ textDecoration: "none", color: "inherit" }}>Accueil</a>
            <a href="/mentions-legales" className="hover:text-white transition" style={{ textDecoration: "none", color: "inherit" }}>
              {language === "fr" ? "Mentions légales" : "Legal"}
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}

function RecapField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mc-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: "var(--mc-muted)" }}>{label}</div>
      <div className="text-sm">{value}</div>
    </div>
  );
}

function labelInternational(v: string, language: string) {
  if (v === "non") return language === "fr" ? "Uniquement France" : "France only";
  if (v === "tournee") return language === "fr" ? "Tournée / coproduction" : "Tour / coproduction";
  if (v === "export") return language === "fr" ? "Export / diffusion étranger" : "Export / foreign";
  return v;
}

function SynthRow({ label, value, color, size }: { label: string; value: string; color?: "primary"; size?: "md" }) {
  const valueSize = size === "md" ? "text-2xl" : "text-3xl";
  return (
    <div className="p-5 flex items-baseline justify-between gap-3">
      <span className="text-xs uppercase tracking-widest" style={{ color: "var(--mc-muted)" }}>{label}</span>
      <span className={`mc-display ${valueSize}`} style={color === "primary" ? { color: "var(--mc-primary)" } : undefined}>{value}</span>
    </div>
  );
}

export function MatchCard({ grant, rank, top, feedback, onFeedback, language, userRegion }: {
  grant: GrantResult;
  rank: number;
  top: boolean;
  feedback: "up" | "down" | undefined;
  onFeedback: (v: "up" | "down") => void;
  language: string;
  userRegion?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const score = grant.matchScore || 0;
  const applyUrl = grant.applicationUrl || grant.improvedUrl || grant.url;

  return (
    <article className="mc-card overflow-hidden" style={top ? { borderColor: "var(--mc-primary)" } : undefined}>
      <div className="p-6 md:p-8 grid grid-cols-12 gap-6">
        {/* Score */}
        <div className="col-span-12 md:col-span-2">
          <div className="mc-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: top ? "var(--mc-primary)" : "var(--mc-muted)" }}>
            / Match · {String(rank).padStart(2, "0")}
          </div>
          <ScoreRing value={score} active={top} />
        </div>

        {/* Content */}
        <div className="col-span-12 md:col-span-7">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {top && (
              <span className="mc-chip mc-chip-primary">
                <Check className="w-3 h-3" strokeWidth={3} /> {language === "fr" ? "Meilleur match" : "Top match"}
              </span>
            )}
            {grant.isRecurring && <span className="mc-chip" style={{ background: "var(--mc-primary-soft)", color: "var(--mc-primary)", borderColor: "rgba(6,214,160,0.3)" }}>{language === "fr" ? "Permanente" : "Permanent"}</span>}
            {grant.region && <span className="mc-chip" style={{ background: "var(--mc-panel)", color: "var(--mc-muted)" }}>{grant.region}</span>}
          </div>
          <h2 className="mc-display text-2xl md:text-3xl mb-2 uppercase">{grant.title}</h2>
          <div className="mb-5" style={{ color: "var(--mc-muted)" }}>{grant.organization}</div>

          {grant.matchReason && (
            <div className="border-l-2 pl-5 py-2 mb-5" style={{ borderColor: top ? "var(--mc-primary)" : "var(--mc-muted)" }}>
              <div className="flex items-center gap-2 mc-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: top ? "var(--mc-primary)" : "var(--mc-muted)" }}>
                <Target className="w-3 h-3" /> {language === "fr" ? "Pourquoi ce match" : "Why this match"}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--mc-muted)" }}>{grant.matchReason}</p>
            </div>
          )}

          {grant.description && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mc-btn-ghost inline-flex items-center gap-2 px-4 py-2 rounded-full mc-mono text-xs uppercase tracking-widest"
            >
              {expanded ? (language === "fr" ? "Masquer les détails" : "Hide details") : (language === "fr" ? "Voir tous les détails" : "View all details")}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
            </button>
          )}

          {expanded && (
            <div className="mt-5 space-y-4 text-sm">
              {grant.description && (
                <div>
                  <div className="mc-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: "var(--mc-muted-2)" }}>
                    {language === "fr" ? "Description" : "Description"}
                  </div>
                  <p className="leading-relaxed" style={{ color: "var(--mc-muted)" }}>{grant.description.replace(/<[^>]*>/g, "")}</p>
                </div>
              )}
              {grant.eligibility && (
                <div>
                  <div className="mc-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: "var(--mc-muted-2)" }}>
                    {language === "fr" ? "Éligibilité" : "Eligibility"}
                  </div>
                  <p className="leading-relaxed" style={{ color: "var(--mc-muted)" }}>{grant.eligibility.replace(/<[^>]*>/g, "")}</p>
                </div>
              )}
              {grant.obligatoryDocuments && grant.obligatoryDocuments.length > 0 && (
                <div>
                  <div className="mc-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--mc-muted-2)" }}>
                    {language === "fr" ? "Dossier à fournir" : "Required documents"}
                  </div>
                  <ul className="space-y-1.5" style={{ color: "var(--mc-muted)" }}>
                    {grant.obligatoryDocuments.map((doc, i) => (
                      <li key={i} className="inline-flex items-start gap-2 w-full">
                        <Check className="w-3 h-3 mt-1 flex-shrink-0" style={{ color: "var(--mc-primary)" }} strokeWidth={3} />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {grant.contactEmail && (
                <div className="inline-flex items-start gap-2 text-sm" style={{ color: "var(--mc-muted)" }}>
                  <Mail className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>
                    {grant.contactEmail}
                    {grant.region && userRegion && grant.region.toLowerCase() !== userRegion.toLowerCase() && (
                      <span className="ml-2 mc-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--mc-muted-2)" }}>
                        {grant.region}
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Metrics & CTA */}
        <div className="col-span-12 md:col-span-3 flex flex-col">
          <MetricBox icon={Coins} label={language === "fr" ? "Montant" : "Amount"} value={grant.amount} />
          <MetricBox
            icon={Calendar}
            label="Deadline"
            value={grant.deadlineStatus === 'passed-recurring' && grant.nextSession ? `~${grant.nextSession}` : grant.deadline}
            highlight={grant.isRecurring}
            notice={grant.deadlineNotice}
            noticeTone={
              grant.deadlineStatus === 'urgent' || grant.deadlineStatus === 'short-recurring'
                ? 'warn'
                : grant.deadlineStatus === 'passed-recurring'
                ? 'info'
                : undefined
            }
          />
          {grant.applicationDifficulty && (
            <MetricBox icon={Zap} label={language === "fr" ? "Difficulté" : "Difficulty"} value={grant.applicationDifficulty} />
          )}
          {applyUrl && (
            <a
              href={applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mc-btn-primary px-5 py-3 rounded-lg text-sm inline-flex items-center justify-center gap-2 mt-auto"
              style={{ textDecoration: "none" }}
            >
              {language === "fr" ? "Accéder au dossier" : "Access the application"} <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Feedback strip */}
      <div className="border-t px-6 md:px-8 py-3 flex items-center justify-between" style={{ borderColor: "var(--mc-border)" }}>
        <div className="mc-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--mc-muted)" }}>
          {language === "fr" ? "Ce match est-il pertinent ?" : "Is this match relevant?"}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onFeedback("up")}
            disabled={!!feedback}
            className="mc-btn-ghost inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs disabled:opacity-50"
            style={feedback === "up" ? { borderColor: "var(--mc-primary)", color: "var(--mc-primary)" } : undefined}
          >
            <ThumbsUp className="w-3 h-3" /> {language === "fr" ? "Pertinent" : "Relevant"}
          </button>
          <button
            onClick={() => onFeedback("down")}
            disabled={!!feedback}
            className="mc-btn-ghost inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs disabled:opacity-50"
            style={feedback === "down" ? { borderColor: "var(--mc-danger)", color: "var(--mc-danger)" } : undefined}
          >
            <ThumbsDown className="w-3 h-3" /> {language === "fr" ? "Hors-sujet" : "Off-topic"}
          </button>
        </div>
      </div>
    </article>
  );
}

function ScoreRing({ value, active }: { value: number; active: boolean }) {
  const color = active ? "var(--mc-primary)" : "var(--mc-text)";
  return (
    <div
      style={{
        display: "grid",
        placeItems: "center",
        width: 56,
        height: 56,
        borderRadius: 999,
        background: `conic-gradient(${color} ${value}%, var(--mc-border) 0)`,
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", inset: 3, borderRadius: 999, background: "var(--mc-panel)" }} />
      <span className="mc-display text-xl relative z-10" style={{ color }}>{value}</span>
    </div>
  );
}

function MetricBox({
  icon: Icon, label, value, highlight, notice, noticeTone,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  highlight?: boolean;
  notice?: string;
  noticeTone?: 'warn' | 'info';
}) {
  const noticeColor =
    noticeTone === 'warn' ? 'var(--mc-danger, #d97706)' :
    noticeTone === 'info' ? 'var(--mc-muted)' : undefined;
  return (
    <div className="mc-card-soft p-4 mb-3">
      <div className="flex items-center gap-2 mc-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: "var(--mc-muted)" }}>
        <Icon className="w-3 h-3" /> {label}
      </div>
      <div className="font-bold" style={highlight ? { color: "var(--mc-primary)" } : undefined}>{value}</div>
      {notice && (
        <div className="mt-2 text-xs leading-snug" style={{ color: noticeColor }}>
          {notice}
        </div>
      )}
    </div>
  );
}
