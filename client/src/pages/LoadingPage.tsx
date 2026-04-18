import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Loader2, Target, Sparkles, Globe, MapPin, Drama, Edit3,
} from "lucide-react";

const MAX_WAIT_MS = 60_000; // Hard timeout
const POLL_INTERVAL_MS = 2_000;

type SubmissionSummary = {
  projectDescription?: string | null;
  status?: string[] | null;
  artisticDomain?: string[] | null;
  projectType?: string[] | null;
  region?: string | null;
  isInternational?: string | null;
};

type ResultsSnapshot = {
  status: "pending" | "ready";
  results: unknown[];
  submission?: SubmissionSummary;
};

export default function LoadingPage() {
  const { language } = useLanguage();
  const [, setLocation] = useLocation();

  const searchParams = new URLSearchParams(window.location.search);
  const sessionId = searchParams.get("sessionId");

  const start = useRef(Date.now());
  const rafId = useRef<number | null>(null);
  const stopped = useRef(false);

  const [elapsed, setElapsed] = useState(0);
  const [submission, setSubmission] = useState<SubmissionSummary | null>(null);
  const [serverStatus, setServerStatus] = useState<"pending" | "ready">("pending");
  const [matchesReady, setMatchesReady] = useState(0);

  useEffect(() => {
    if (!sessionId) {
      setLocation("/");
      return;
    }

    const redirect = () => {
      if (stopped.current) return;
      stopped.current = true;
      if (rafId.current) cancelAnimationFrame(rafId.current);
      setLocation(`/results?sessionId=${sessionId}`);
    };

    const hardStop = setTimeout(redirect, MAX_WAIT_MS);

    const poll = async () => {
      if (stopped.current) return;
      try {
        const res = await fetch(`/api/results/${sessionId}`);
        if (res.ok) {
          const data = (await res.json()) as ResultsSnapshot;
          if (data.submission) setSubmission(data.submission);
          if (data.status === "ready") {
            setServerStatus("ready");
            setMatchesReady(Array.isArray(data.results) ? data.results.length : 5);
            setTimeout(redirect, 600);
            return;
          }
        }
      } catch {
        // network blip — keep polling
      }
      if (!stopped.current) setTimeout(poll, POLL_INTERVAL_MS);
    };
    poll();

    const tick = () => {
      if (stopped.current) return;
      const e = (Date.now() - start.current) / 1000;
      setElapsed(e);
      rafId.current = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      stopped.current = true;
      clearTimeout(hardStop);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [sessionId, setLocation]);

  // Asymptotique : part de 0, monte vite au début, se tasse près de 97, jamais
  // de plateau sec ni de saut. Quand le serveur répond, on saute à 100.
  // Constante 9 = "temps caractéristique" en secondes (à t=9s on est à ~63%,
  // à t=20s à ~89%, à t=30s à ~96%).
  const masterPct = serverStatus === "ready"
    ? 100
    : 97 * (1 - Math.exp(-elapsed / 9));
  const remainingSec = serverStatus === "ready" ? 0 : Math.max(0, 20 - elapsed);

  const stageLabel = serverStatus === "ready"
    ? (language === "fr" ? "Résultats prêts" : "Ready")
    : elapsed > 14 ? (language === "fr" ? "Génération du rapport" : "Report generation")
    : elapsed > 10 ? (language === "fr" ? "Scoring personnalisé" : "Personalized scoring")
    : elapsed > 7 ? (language === "fr" ? "Enrichissement par IA" : "AI enrichment")
    : (language === "fr" ? "Classement IA" : "AI ranking");

  return (
    <div className="min-h-screen" style={{ background: "var(--mc-bg)", color: "var(--mc-text)" }}>
      <div className="mc-mono text-xs text-center py-2 px-4" style={{ background: "var(--mc-warn)", color: "var(--mc-bg)" }}>
        [ BETA ] &nbsp;&nbsp;
        {language === "fr"
          ? "Le matching prend 10 à 30 secondes. Ne fermez pas cette page."
          : "Matching takes 10–30 seconds. Don't close this page."}
      </div>

      <header className="mc-section-rule">
        <div className="max-w-6xl mx-auto px-6 md:px-8 h-14 flex items-center justify-between">
          <div className="mc-display text-lg">Mecene<span style={{ color: "var(--mc-primary)" }}>.</span></div>
          <div className="mc-mono text-xs uppercase tracking-widest flex items-center gap-2" style={{ color: "var(--mc-muted)" }}>
            <span className="mc-pulse-dot" />
            {language === "fr" ? "Pipeline actif" : "Pipeline running"}
          </div>
        </div>
      </header>

      {/* HERO */}
      <section>
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-16">
          <div className="flex items-center gap-3 mc-mono text-xs uppercase tracking-widest mb-8" style={{ color: "var(--mc-primary)" }}>
            <Loader2 className="w-4 h-4 animate-spin" />
            {language === "fr" ? "Matching en cours" : "Matching in progress"}
            <span style={{ color: "var(--mc-muted-2)" }}>·</span>
            <span style={{ color: "var(--mc-muted)" }}>{elapsed.toFixed(1)} s</span>
            <span style={{ color: "var(--mc-muted-2)" }}>·</span>
            <span style={{ color: "var(--mc-muted)" }}>~ {Math.ceil(remainingSec)} s {language === "fr" ? "restantes" : "left"}</span>
          </div>
          <h1 className="mc-display text-[48px] md:text-[92px]">
            {language === "fr" ? (
              <>ON CROISE VOTRE PROFIL<br />AVEC NOS 632 AIDES<span style={{ color: "var(--mc-primary)" }}>.</span></>
            ) : (
              <>WE'RE CROSSING YOUR PROFILE<br />AGAINST OUR 632 GRANTS<span style={{ color: "var(--mc-primary)" }}>.</span></>
            )}
          </h1>

          <div className="mt-10 grid md:grid-cols-12 gap-6 items-end">
            <div className="md:col-span-9">
              <div className="flex items-baseline justify-between mb-3">
                <div className="mc-mono text-xs uppercase tracking-widest" style={{ color: "var(--mc-muted)" }}>{stageLabel}</div>
                <div className="mc-mono text-xs uppercase tracking-widest" style={{ color: "var(--mc-primary)" }}>{Math.round(masterPct)} %</div>
              </div>
              <ProgressBar value={masterPct} tall shimmer={serverStatus !== "ready"} />
            </div>
            <div className="md:col-span-3 text-right">
              <div className="mc-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: "var(--mc-muted-2)" }}>ETA</div>
              <div className="mc-display text-4xl">00:{String(Math.ceil(remainingSec)).padStart(2, "0")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* HORIZONTAL KPI BAND */}
      <section className="mc-section-rule" style={{ borderBottom: "1px solid var(--mc-border)" }}>
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x" style={{ borderColor: "var(--mc-border)", color: "var(--mc-text)" }}>
          <KpiCell label={language === "fr" ? "Dispositifs scannés" : "Grants scanned"} value="632" sub={language === "fr" ? "✓ base complète" : "✓ full base"} />
          <KpiCell label={language === "fr" ? "Passent le quality gate" : "Pass quality gate"} value="241" sub={language === "fr" ? "Seuil 60 / 100" : "Threshold 60 / 100"} />
          <KpiCell label={language === "fr" ? "Candidats retenus" : "Candidates kept"} value="34" sub={language === "fr" ? "Filtre sectoriel" : "Sector filter"} />
          <KpiCell
            label={language === "fr" ? "Matches trouvés" : "Matches found"}
            value={serverStatus === "ready" ? String(matchesReady) : "…"}
            sub={serverStatus === "ready"
              ? (language === "fr" ? "✓ top stabilisé" : "✓ top stable")
              : (language === "fr" ? "top 5 en route…" : "top 5 loading…")}
            highlight
          />
        </div>
      </section>

      {/* PROJECT SUMMARY */}
      <section className="mc-section-rule">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">
          <div className="mc-mono text-xs uppercase tracking-widest mb-4 flex items-center justify-between" style={{ color: "var(--mc-muted)" }}>
            <span>/ {language === "fr" ? "On a bien compris votre projet ?" : "Did we get your project right?"}</span>
            <a href="/form" className="inline-flex items-center gap-1.5 hover:text-white transition" style={{ color: "var(--mc-accent)" }}>
              <Edit3 className="w-3.5 h-3.5" /> {language === "fr" ? "Modifier" : "Edit"}
            </a>
          </div>
          <div className="mc-card p-6 md:p-8">
            {submission ? (
              <>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-5">
                  {submission.status && submission.status.length > 0 && (
                    <Field icon={Drama} label={language === "fr" ? "Profil" : "Profile"} value={submission.status.join(" · ")} />
                  )}
                  {submission.artisticDomain && submission.artisticDomain.length > 0 && (
                    <Field icon={Sparkles} label={language === "fr" ? "Disciplines" : "Disciplines"} value={submission.artisticDomain.join(" · ")} />
                  )}
                  {submission.projectType && submission.projectType.length > 0 && (
                    <Field icon={Target} label={language === "fr" ? "Type de projet" : "Project type"} value={submission.projectType.join(" · ")} />
                  )}
                  {submission.region && (
                    <Field icon={MapPin} label={language === "fr" ? "Localisation" : "Location"} value={submission.region} />
                  )}
                  {submission.isInternational && (
                    <Field icon={Globe} label={language === "fr" ? "International" : "International"} value={labelInternational(submission.isInternational)} />
                  )}
                </div>
                {submission.projectDescription && (
                  <div className="mt-6 pt-5 border-t" style={{ borderColor: "var(--mc-border)" }}>
                    <div className="mc-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--mc-muted)" }}>
                      {language === "fr" ? "Description" : "Description"}
                    </div>
                    <p className="text-sm italic leading-relaxed" style={{ color: "var(--mc-muted)" }}>
                      « {submission.projectDescription} »
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-sm" style={{ color: "var(--mc-muted)" }}>
                {language === "fr" ? "Chargement de votre profil…" : "Loading your profile…"}
              </div>
            )}
          </div>
          <p className="mc-mono text-[10px] uppercase tracking-widest mt-3" style={{ color: "var(--mc-muted-2)" }}>
            {language === "fr"
              ? "Si quelque chose cloche, cliquez sur « Modifier » — le matching sera relancé."
              : "If anything looks off, click \"Edit\" — matching will restart."}
          </p>
        </div>
      </section>

      {/* TIPS */}
      <section className="mc-section-rule">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">
          <div className="mc-mono text-xs uppercase tracking-widest mb-5" style={{ color: "var(--mc-muted)" }}>
            {language === "fr" ? "Pendant que vous attendez" : "While you wait"}
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <Tip title={language === "fr" ? "Le saviez-vous ?" : "Did you know?"} body={language === "fr"
              ? "La DRAC Auvergne-Rhône-Alpes instruit environ 800 dossiers par an et en finance un sur trois. Un bon dossier change la donne."
              : "DRAC ARA processes ~800 applications a year and funds one in three. A good application changes everything."} />
            <Tip title={language === "fr" ? "Conseil de pro" : "Pro tip"} body={language === "fr"
              ? "Une subvention ne couvre jamais 100 % d'un budget. Prévoyez 30 à 50 % de cofinancement."
              : "A grant never covers 100% of a budget. Plan 30–50% co-financing."} />
            <Tip title={language === "fr" ? "Ressource" : "Resource"} body={language === "fr"
              ? "Le guide « Monter un dossier ADSV » arrive. On vous l'enverra quand il sort."
              : "The \"Build an ADSV application\" guide is in progress."} />
          </div>
        </div>
      </section>

      <footer className="mc-section-rule">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-6 mc-mono text-xs uppercase tracking-widest flex flex-wrap justify-between gap-4" style={{ color: "var(--mc-muted)" }}>
          <span>© 2026 Mecene</span>
          <span>{language === "fr" ? "Résultats à venir. Ne fermez pas la page." : "Results incoming. Don't close the page."}</span>
        </div>
      </footer>
    </div>
  );
}

function labelInternational(v: string): string {
  if (v === "non") return "Uniquement France";
  if (v === "tournee") return "Tournée / coproduction";
  if (v === "export") return "Export / diffusion étranger";
  return v;
}

function ProgressBar({ value, tall, shimmer, animated }: { value: number; tall?: boolean; shimmer?: boolean; animated?: boolean }) {
  // `animated` = false (défaut) quand on update la value soi-même à 60fps via
  // requestAnimationFrame → pas de transition CSS, sinon elle se ré-applique
  // à chaque frame et donne un effet de retard / figement.
  // `animated` = true pour les barres qui ne changent que de loin en loin.
  return (
    <div
      style={{
        position: "relative",
        height: tall ? 12 : 6,
        background: "var(--mc-border)",
        borderRadius: 999,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "0 auto 0 0",
          width: `${value}%`,
          background: "var(--mc-primary)",
          borderRadius: 999,
          transition: animated ? "width 0.5s ease" : undefined,
          backgroundImage: shimmer
            ? "linear-gradient(90deg, transparent 0%, rgba(255,255,255,.15) 50%, transparent 100%)"
            : undefined,
          backgroundSize: "200% 100%",
          animation: shimmer ? "mc-shimmer 1.6s linear infinite" : undefined,
        }}
      />
      <style>{`@keyframes mc-shimmer { to { background-position: -200% 0; } }`}</style>
    </div>
  );
}

function KpiCell({ label, value, sub, highlight }: { label: string; value: string; sub: string; highlight?: boolean }) {
  return (
    <div className="p-6 md:p-8">
      <div className="mc-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: "var(--mc-muted)" }}>{label}</div>
      <div className="mc-display text-4xl md:text-5xl" style={{ color: highlight ? "var(--mc-primary)" : undefined }}>{value}</div>
      <div className="mc-mono text-[10px] uppercase tracking-widest mt-2" style={{ color: highlight ? "var(--mc-primary)" : "var(--mc-muted)" }}>{sub}</div>
    </div>
  );
}

function Field({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div>
      <div className="mc-mono text-[10px] uppercase tracking-widest mb-1 flex items-center gap-2" style={{ color: "var(--mc-muted)" }}>
        <Icon className="w-3.5 h-3.5" /> {label}
      </div>
      <div className="text-sm">{value}</div>
    </div>
  );
}

function Tip({ title, body }: { title: string; body: string }) {
  return (
    <div className="mc-card p-5">
      <div className="mc-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--mc-primary)" }}>{title}</div>
      <p className="text-sm leading-relaxed" style={{ color: "var(--mc-muted)" }}>{body}</p>
    </div>
  );
}
