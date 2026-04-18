import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Loader2, Check, Database, Cpu, Shield, Target, Sparkles, Zap, Globe,
  FileText, MapPin, Coins, Drama, Edit3,
} from "lucide-react";

type Stage = { n: string; title: string; icon: React.ElementType; done?: boolean; active?: boolean };

const TOTAL_MS = 14000;

export default function LoadingPage() {
  const { language } = useLanguage();
  const [, setLocation] = useLocation();

  const searchParams = new URLSearchParams(window.location.search);
  const sessionId = searchParams.get("sessionId");

  const start = useRef(Date.now());
  const rafId = useRef<number | null>(null);
  const stopped = useRef(false);

  const [elapsed, setElapsed] = useState(0);
  const [matches, setMatches] = useState(0);
  const [stage5Pct, setStage5Pct] = useState(42);

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

    const hardStop = setTimeout(redirect, TOTAL_MS + 500);

    const tick = () => {
      if (stopped.current) return;
      const e = (Date.now() - start.current) / 1000;
      if (e >= TOTAL_MS / 1000) { redirect(); return; }

      setElapsed(e);
      setStage5Pct(Math.min(100, 42 + (e / 14) * 58));
      if (e > 13) setMatches(5);
      else if (e > 11) setMatches(4);
      else if (e > 9) setMatches(3);
      else if (e > 7) setMatches(2);
      else if (e > 5) setMatches(1);

      rafId.current = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      stopped.current = true;
      clearTimeout(hardStop);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [sessionId, setLocation]);

  const remaining = Math.max(0, TOTAL_MS / 1000 - elapsed);
  const masterPct = Math.min(100, (elapsed / (TOTAL_MS / 1000)) * 100);

  const stageLabel =
    elapsed > 14 ? "Étape 11 / 12 · Génération du rapport"
    : elapsed > 10 ? "Étape 08 / 12 · Scoring personnalisé"
    : elapsed > 7 ? "Étape 06 / 12 · Enrichissement par IA"
    : "Étape 05 / 12 · Classement IA";

  return (
    <div className="min-h-screen" style={{ background: "var(--mc-bg)", color: "var(--mc-text)" }}>
      <div className="mc-mono text-xs text-center py-2 px-4" style={{ background: "var(--mc-warn)", color: "var(--mc-bg)" }}>
        [ BETA ] &nbsp;&nbsp;
        {language === "fr"
          ? "Le matching prend 10 à 20 secondes. Ne fermez pas cette page."
          : "Matching takes 10–20 seconds. Don't close this page."}
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
            <span style={{ color: "var(--mc-muted)" }}>~ {Math.ceil(remaining)} s {language === "fr" ? "restantes" : "left"}</span>
          </div>
          <h1 className="mc-display text-[48px] md:text-[92px]">
            {language === "fr" ? (
              <>ON CROISE VOTRE PROFIL<br />AVEC 473 AIDES<span style={{ color: "var(--mc-primary)" }}>.</span></>
            ) : (
              <>WE'RE CROSSING YOUR PROFILE<br />AGAINST 473 GRANTS<span style={{ color: "var(--mc-primary)" }}>.</span></>
            )}
          </h1>

          <div className="mt-10 grid md:grid-cols-12 gap-6 items-end">
            <div className="md:col-span-9">
              <div className="flex items-baseline justify-between mb-3">
                <div className="mc-mono text-xs uppercase tracking-widest" style={{ color: "var(--mc-muted)" }}>{stageLabel}</div>
                <div className="mc-mono text-xs uppercase tracking-widest" style={{ color: "var(--mc-primary)" }}>{Math.round(masterPct)} %</div>
              </div>
              <ProgressBar value={masterPct} tall shimmer />
            </div>
            <div className="md:col-span-3 text-right">
              <div className="mc-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: "var(--mc-muted-2)" }}>ETA</div>
              <div className="mc-display text-4xl">00:{String(Math.ceil(remaining)).padStart(2, "0")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* SUMMARY + KPIs */}
      <section className="mc-section-rule">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-7">
            <div className="mc-mono text-xs uppercase tracking-widest mb-4 flex items-center justify-between" style={{ color: "var(--mc-muted)" }}>
              <span>/ {language === "fr" ? "On a bien compris votre projet ?" : "Did we get your project right?"}</span>
              <a href="/form" className="inline-flex items-center gap-1.5 hover:text-white transition" style={{ color: "var(--mc-accent)" }}>
                <Edit3 className="w-3.5 h-3.5" /> {language === "fr" ? "Modifier" : "Edit"}
              </a>
            </div>
            <div className="mc-card p-6 md:p-8">
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
                <Field icon={Drama} label="Profil" value="Compagnie de théâtre contemporain" />
                <Field icon={Sparkles} label="Disciplines" value="Spectacle vivant · Musique · Audiovisuel" />
                <Field icon={Target} label="Type de projet" value="Création · Production · (en cours)" />
                <Field icon={MapPin} label="Localisation" value="Lyon · Auvergne-Rhône-Alpes" />
                <Field icon={Coins} label="Budget" value="25 000 € – 60 000 €" />
                <Field icon={Globe} label="International" value="Tournée / coproduction envisagée" />
              </div>
              <div className="mt-6 pt-5 border-t" style={{ borderColor: "var(--mc-border)" }}>
                <div className="mc-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--mc-muted)" }}>Description</div>
                <p className="text-sm italic leading-relaxed" style={{ color: "var(--mc-muted)" }}>
                  « Je suis une compagnie de théâtre contemporain basée à Lyon. Nous préparons une création
                  sur la mémoire collective qui mêle théâtre, vidéo et musique live. »
                </p>
              </div>
            </div>
            <p className="mc-mono text-[10px] uppercase tracking-widest mt-3" style={{ color: "var(--mc-muted-2)" }}>
              {language === "fr"
                ? "Si quelque chose cloche, cliquez sur « Modifier » — le matching sera relancé."
                : "If anything looks off, click \"Edit\" — matching will restart."}
            </p>
          </div>

          <div className="col-span-12 md:col-span-5">
            <div className="mc-mono text-xs uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: "var(--mc-muted)" }}>
              <span className="mc-pulse-dot" /> {language === "fr" ? "Chiffres du matching en direct" : "Live matching stats"}
            </div>
            <div className="mc-card mc-divide-border">
              <KpiRow label={language === "fr" ? "Dispositifs scannés" : "Grants scanned"} value="473" sub={language === "fr" ? "✓ base complète" : "✓ full base"} />
              <KpiRow label={language === "fr" ? "Passent le quality gate" : "Pass quality gate"} value="241" sub="Seuil 60 / 100" />
              <KpiRow label={language === "fr" ? "Candidats retenus" : "Candidates kept"} value="34" sub={language === "fr" ? "Filtre sectoriel appliqué" : "Sector filter applied"} />
              <KpiRow
                label={language === "fr" ? "Matches trouvés" : "Matches found"}
                value={String(matches)}
                sub={matches >= 5 ? (language === "fr" ? "✓ top 5 stabilisé" : "✓ top 5 stable") : (language === "fr" ? "top 5 en route…" : "top 5 loading…")}
                highlight
              />
            </div>
          </div>
        </div>
      </section>

      {/* PIPELINE */}
      <section className="mc-section-rule">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">
          <div className="mc-card mc-divide-border">
            <StageRow n="01" icon={Database} title="Chargement du profil" right="✓ 0.1 s" done />
            <StageRow n="02" icon={Globe} title="Aides Territoires (API officielle)" right="✓ 312 trouvés" done />
            <StageRow n="03" icon={Globe} title="Scrapers (CNM · ADAMI · DRAC ×12)" right="✓ 161 trouvés" done />
            <StageRow n="04" icon={Shield} title="Quality gate (score 0–100)" right="✓ 241 passent" done />
            <StageRow n="05" icon={Cpu} title="Classement IA (DeepSeek v3)" right={`${Math.round(stage5Pct)} %`} active pct={stage5Pct} />
            <StageRow n="06" icon={Sparkles} title="Enrichissement par IA (×10)" right="en attente" />
            <StageRow n="07" icon={Target} title="Scoring personnalisé" right="en attente" />
            <StageRow n="08" icon={Zap} title="Estimation de difficulté" right="en attente" />
            <StageRow n="09" icon={Database} title="Cross-match deadlines" right="en attente" />
            <StageRow n="10" icon={Cpu} title="Détection de cumul" right="en attente" />
            <StageRow n="11" icon={FileText} title="Génération du rapport" right="en attente" />
            <StageRow n="12" icon={FileText} title="Rendu PDF" right="en attente" />
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
              : "DRAC Auvergne-Rhône-Alpes processes around 800 applications yearly and funds one in three. A good application changes everything."} />
            <Tip title={language === "fr" ? "Conseil de pro" : "Pro tip"} body={language === "fr"
              ? "Une subvention ne couvre jamais 100 % d'un budget. Prévoyez 30 à 50 % de cofinancement (apport en nature, billetterie, coproduction)."
              : "A grant never covers 100% of a budget. Plan 30–50% co-financing (in-kind, ticketing, co-production)."} />
            <Tip title={language === "fr" ? "Ressource" : "Resource"} body={language === "fr"
              ? "Le guide « Monter un dossier ADSV » est en cours de rédaction. On vous l'enverra quand il sortira."
              : "The \"Build an ADSV application\" guide is in progress. We'll send it when it launches."} />
          </div>
        </div>
      </section>

      <footer className="mc-section-rule">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-6 mc-mono text-xs uppercase tracking-widest flex flex-wrap justify-between gap-4" style={{ color: "var(--mc-muted)" }}>
          <span>© 2026 Mecene</span>
          <span>{language === "fr" ? "Résultats dans ~14 s. Ne fermez pas la page." : "Results in ~14s. Don't close the page."}</span>
        </div>
      </footer>
    </div>
  );
}

function ProgressBar({ value, tall, shimmer }: { value: number; tall?: boolean; shimmer?: boolean }) {
  return (
    <div
      className={shimmer ? "mc-shimmer" : ""}
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
          transition: "width 0.4s ease",
        }}
      />
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

function KpiRow({ label, value, sub, highlight }: { label: string; value: string; sub: string; highlight?: boolean }) {
  return (
    <div className="p-5 flex items-baseline justify-between">
      <div>
        <div className="mc-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--mc-muted)" }}>{label}</div>
        <div className="text-xs mt-1" style={{ color: highlight ? "var(--mc-primary)" : "var(--mc-muted)" }}>{sub}</div>
      </div>
      <div className="mc-display text-4xl" style={{ color: highlight ? "var(--mc-primary)" : undefined }}>{value}</div>
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
