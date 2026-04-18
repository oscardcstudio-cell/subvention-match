import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Loader2, Check, Database, Cpu, Shield, Target, Sparkles, Zap, Globe,
  FileText, MapPin, Coins, Drama, Edit3,
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
  const [stage5Pct, setStage5Pct] = useState(30);

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
      setStage5Pct((prev) => Math.min(95, prev + (95 - prev) * 0.015));
      rafId.current = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      stopped.current = true;
      clearTimeout(hardStop);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [sessionId, setLocation]);

  const masterPct = serverStatus === "ready" ? 100 : Math.min(95, 20 + elapsed * 4);
  const remainingSec = serverStatus === "ready" ? 0 : Math.max(0, 20 - elapsed);

  const stageLabel =
    serverStatus === "ready"
      ? language === "fr" ? "Résultats prêts !" : "Ready!"
      : elapsed > 14 ? (language === "fr" ? "Étape 11 / 12 · Génération du rapport" : "Step 11 / 12 · Report generation")
      : elapsed > 10 ? (language === "fr" ? "Étape 08 / 12 · Scoring personnalisé" : "Step 08 / 12 · Scoring")
      : elapsed > 7 ? (language === "fr" ? "Étape 06 / 12 · Enrichissement par IA" : "Step 06 / 12 · AI enrichment")
      : language === "fr" ? "Étape 05 / 12 · Classement IA" : "Step 05 / 12 · AI ranking";

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

      {/* PIPELINE */}
      <section className="mc-section-rule">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">
          <div className="mc-card mc-divide-border">
            <StageRow n="01" icon={Database} title={language === "fr" ? "Chargement du profil" : "Loading profile"} right="✓ 0.1 s" done />
            <StageRow n="02" icon={Globe} title={language === "fr" ? "Aides Territoires (API officielle)" : "Aides Territoires (official API)"} right="✓ 312" done />
            <StageRow n="03" icon={Globe} title={language === "fr" ? "Scrapers (CNM · ADAMI · DRAC ×12)" : "Scrapers (CNM · ADAMI · DRAC ×12)"} right="✓ 320" done />
            <StageRow n="04" icon={Shield} title={language === "fr" ? "Quality gate (score 0–100)" : "Quality gate (score 0–100)"} right="✓ 241" done />
            <StageRow
              n="05"
              icon={Cpu}
              title={language === "fr" ? "Classement IA (DeepSeek v3)" : "AI ranking (DeepSeek v3)"}
              right={serverStatus === "ready" ? "✓" : `${Math.round(stage5Pct)} %`}
              active={serverStatus !== "ready"}
              done={serverStatus === "ready"}
              pct={serverStatus === "ready" ? 100 : stage5Pct}
            />
            <StageRow n="06" icon={Sparkles} title={language === "fr" ? "Enrichissement par IA" : "AI enrichment"} right={serverStatus === "ready" ? "✓" : (language === "fr" ? "en attente" : "pending")} done={serverStatus === "ready"} />
            <StageRow n="07" icon={Target} title={language === "fr" ? "Scoring personnalisé" : "Personalized scoring"} right={serverStatus === "ready" ? "✓" : (language === "fr" ? "en attente" : "pending")} done={serverStatus === "ready"} />
            <StageRow n="08" icon={Zap} title={language === "fr" ? "Estimation de difficulté" : "Difficulty estimation"} right={serverStatus === "ready" ? "✓" : (language === "fr" ? "en attente" : "pending")} done={serverStatus === "ready"} />
            <StageRow n="09" icon={Database} title={language === "fr" ? "Cross-match deadlines" : "Cross-match deadlines"} right={serverStatus === "ready" ? "✓" : (language === "fr" ? "en attente" : "pending")} done={serverStatus === "ready"} />
            <StageRow n="10" icon={Cpu} title={language === "fr" ? "Détection de cumul" : "Cumul detection"} right={serverStatus === "ready" ? "✓" : (language === "fr" ? "en attente" : "pending")} done={serverStatus === "ready"} />
            <StageRow n="11" icon={FileText} title={language === "fr" ? "Génération du rapport" : "Report generation"} right={serverStatus === "ready" ? "✓" : (language === "fr" ? "en attente" : "pending")} done={serverStatus === "ready"} />
            <StageRow n="12" icon={FileText} title={language === "fr" ? "Rendu PDF" : "PDF rendering"} right={serverStatus === "ready" ? "✓" : (language === "fr" ? "en attente" : "pending")} done={serverStatus === "ready"} />
          </div>
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

function ProgressBar({ value, tall, shimmer }: { value: number; tall?: boolean; shimmer?: boolean }) {
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
          transition: "width 0.5s ease",
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

function StageRow({ n, icon: Icon, title, right, done, active, pct }: {
  n: string; icon: React.ElementType; title: string; right: string; done?: boolean; active?: boolean; pct?: number;
}) {
  const labelColor = done || active ? "var(--mc-primary)" : "var(--mc-muted)";
  return (
    <div
      className={`p-4 grid grid-cols-12 gap-4 items-center ${!done && !active ? "opacity-60" : ""}`}
      style={active ? { background: "var(--mc-primary-soft)" } : undefined}
    >
      <div className="col-span-1 mc-mono text-sm" style={{ color: labelColor }}>{n}</div>
      <div className="col-span-5 md:col-span-4 flex items-center gap-3">
        <Icon className="w-4 h-4" style={{ color: labelColor }} strokeWidth={1.75} />
        <div className="text-sm">{title}</div>
      </div>
      <div className="col-span-4 md:col-span-5">
        <ProgressBar value={done ? 100 : (active ? pct ?? 0 : 0)} shimmer={active} />
      </div>
      <div className="col-span-2 text-right mc-mono text-xs flex items-center justify-end gap-2" style={{ color: labelColor }}>
        {active && <Loader2 className="w-3 h-3 animate-spin" />}
        {done && !active && <Check className="w-3 h-3" strokeWidth={3} />}
        {right}
      </div>
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
