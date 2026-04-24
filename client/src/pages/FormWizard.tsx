import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formDataSchema, type FormData } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { trackFormStarted, trackFormSubmitted } from "@/lib/analytics";
import { BetaCapCounter } from "@/components/BetaCapCounter";
import { captureAcquisitionSource, getAcquisitionSource } from "@/lib/useAcquisitionSource";
import {
  Music, Headphones, Pen, Palette, Wrench, Drama, Sparkles, Ticket, Film, Cpu,
  Landmark, Building, Megaphone, ArrowLeft, ArrowRight, Check, Loader2,
} from "lucide-react";

const REGIONS = [
  "Auvergne-Rhône-Alpes", "Bourgogne-Franche-Comté", "Bretagne", "Centre-Val de Loire",
  "Corse", "Grand Est", "Hauts-de-France", "Île-de-France", "Normandie",
  "Nouvelle-Aquitaine", "Occitanie", "Pays de la Loire", "Provence-Alpes-Côte d'Azur", "Outre-mer",
];

type StepId = "status" | "domain" | "description" | "type" | "region" | "email" | "optional";
const STEPS: { id: StepId; num: string; label: string }[] = [
  { id: "status",      num: "01", label: "Profil" },
  { id: "domain",      num: "02", label: "Discipline" },
  { id: "description", num: "03", label: "Description" },
  { id: "type",        num: "04", label: "Type projet" },
  { id: "region",      num: "05", label: "Région" },
  { id: "email",       num: "06", label: "Email" },
  { id: "optional",    num: "07", label: "Optionnel" },
];

const STATUS_OPTIONS = [
  { value: "compagnie", icon: Drama, label: "Compagnie / collectif" },
  { value: "artiste-auteur", icon: Music, label: "Artiste individuel" },
  { value: "lieu-culturel", icon: Building, label: "Lieu culturel / structure" },
  { value: "collectif", icon: Megaphone, label: "Organisateur d'événements" },
  { value: "label", icon: Headphones, label: "Label / maison d'édition" },
  { value: "association", icon: Sparkles, label: "Association culturelle" },
];

const DOMAIN_OPTIONS = [
  { value: "spectacle-vivant", label: "Spectacle vivant", icon: Drama },
  { value: "musique", label: "Musique", icon: Music },
  { value: "audiovisuel", label: "Audiovisuel", icon: Film },
  { value: "arts-plastiques", label: "Arts visuels", icon: Palette },
  { value: "ecriture", label: "Livre & édition", icon: Pen },
  { value: "arts-numeriques", label: "Arts numériques", icon: Cpu },
  { value: "patrimoine", label: "Patrimoine", icon: Landmark },
  { value: "metiers-art", label: "Métiers d'art", icon: Wrench },
  { value: "transversal", label: "Transversal", icon: Ticket },
];

const TYPE_OPTIONS = [
  { value: "creation", label: "Création", desc: "Écriture, composition, répétition" },
  { value: "production", label: "Production", desc: "Captation, fabrication" },
  { value: "diffusion", label: "Diffusion", desc: "Tournée, exposition" },
  { value: "residence", label: "Résidence", desc: "Accueil, R&D artistique" },
  { value: "education", label: "Éducation & médiation", desc: "Ateliers, transmission" },
  { value: "evenementiel", label: "Festival / événement", desc: "Organisation, programmation" },
];

const STAGE_OPTIONS = [
  { value: "idee", label: "Idée / concept" },
  { value: "en-cours", label: "En cours" },
  { value: "finalisation", label: "Finalisation" },
  { value: "pret", label: "Prêt à diffuser" },
];

const PROFILE_PRESETS: Record<string, { status?: string[]; artisticDomain?: string[]; projectType?: string[] }> = {
  "orga-soiree":    { status: ["collectif"], artisticDomain: ["musique"], projectType: ["evenementiel", "diffusion"] },
  "dj-producteur":  { status: ["artiste-auteur"], artisticDomain: ["musique"], projectType: ["creation", "production", "diffusion"] },
  "danseur":        { status: ["artiste-auteur"], artisticDomain: ["spectacle-vivant"], projectType: ["creation", "diffusion"] },
  "compagnie":      { status: ["compagnie"], artisticDomain: ["spectacle-vivant"], projectType: ["creation", "production"] },
  "lieu-culturel":  { status: ["lieu-culturel"], projectType: ["evenementiel", "diffusion"] },
  "artisan-art":    { status: ["artiste-auteur"], artisticDomain: ["metiers-art"], projectType: ["creation", "production"] },
};

export default function FormWizard() {
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => { trackFormStarted(); }, []);

  const urlParams = new URLSearchParams(window.location.search);
  const domainParam = urlParams.get("domain") || "";
  const profileParam = urlParams.get("profile") || "";

  const form = useForm<FormData>({
    resolver: zodResolver(formDataSchema),
    mode: "onChange",
    defaultValues: {
      status: [],
      artisticDomain: [],
      projectDescription: "",
      projectType: [],
      projectStage: "",
      region: "Île-de-France",
      isInternational: "",
      innovation: [],
      socialDimension: [],
      urgency: "",
      aidTypes: [],
      geographicScope: [],
      email: "",
    },
  });

  // Pre-fill from URL params
  useEffect(() => {
    if (domainParam) form.setValue("artisticDomain", [domainParam]);
    const preset = PROFILE_PRESETS[profileParam];
    if (preset) {
      if (preset.status) form.setValue("status", preset.status);
      if (preset.artisticDomain) form.setValue("artisticDomain", preset.artisticDomain);
      if (preset.projectType) form.setValue("projectType", preset.projectType);
    }
  }, [domainParam, profileParam, form]);

  // Capture la source d'acquisition au mount (au cas où l'utilisateur arriverait
  // directement sur /form?source=reddit sans passer par la home)
  useEffect(() => {
    captureAcquisitionSource();
  }, []);

  const submitMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const source = getAcquisitionSource();
      const payload = source ? { ...data, source } : data;
      const res = await apiRequest("POST", "/api/submit-form", payload);
      return res.json();
    },
    onSuccess: (data) => {
      setLocation(`/loading?sessionId=${data.sessionId}`);
    },
    onError: (error: Error) => {
      toast({
        title: language === "fr" ? "Erreur" : "Error",
        description: error.message,
        variant: "destructive",
        duration: 2500,
      });
    },
  });

  // On lit la source d'acquisition pour passer le param ?source= au capacity check
  // → permet au backend d'imposer aussi le cap par source si dépassé.
  const currentSource = typeof window !== "undefined" ? getAcquisitionSource() : null;
  const { data: capacityData } = useQuery<{
    count: number;
    cap: number;
    isFull: boolean;
    perSource: { source: string; count: number; cap: number; isFull: boolean } | null;
  }>({
    queryKey: ["/api/beta/capacity", currentSource],
    queryFn: async () => {
      const url = currentSource
        ? `/api/beta/capacity?source=${encodeURIComponent(currentSource)}`
        : "/api/beta/capacity";
      const r = await fetch(url);
      return r.json();
    },
    staleTime: 60_000,
  });

  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistStatus, setWaitlistStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const [stepIdx, setStepIdx] = useState(0);
  const currentStep = STEPS[stepIdx];

  const handleNext = async () => {
    // Validate the fields that belong to the current step before advancing.
    // On the email step, trigger email validation; on region, trigger region.
    const stepFields: Record<StepId, (keyof FormData)[]> = {
      status: [],
      domain: [],
      description: [],
      type: [],
      region: ["region"],
      email: ["email"],
      optional: [],
    };
    const fieldsToCheck = stepFields[currentStep.id];
    if (fieldsToCheck.length > 0) {
      const valid = await form.trigger(fieldsToCheck as any);
      if (!valid) {
        // Focus the first invalid field
        const firstInvalid = fieldsToCheck.find((f) => (form.formState.errors as any)[f]);
        if (firstInvalid === "email") {
          toast({
            title: language === "fr" ? "Email invalide" : "Invalid email",
            description:
              language === "fr"
                ? "Indiquez une adresse email valide pour recevoir vos résultats."
                : "Please enter a valid email to receive your results.",
            variant: "destructive",
            duration: 3000,
          });
        }
        return;
      }
    }

    if (stepIdx < STEPS.length - 1) {
      setStepIdx(stepIdx + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Last step: validate email + region directly (don't rely on
    // form.formState.errors which may be stale if fields were never touched).
    const data = form.getValues();
    const emailValid = !!data.email && /^\S+@\S+\.\S+$/.test(data.email);
    const regionValid = !!data.region && data.region.trim().length > 0;

    if (!emailValid) {
      await form.trigger("email"); // populate errors for inline display on the step
      setStepIdx(5);
      window.scrollTo({ top: 0, behavior: "smooth" });
      toast({
        title: language === "fr" ? "Email requis" : "Email required",
        description:
          language === "fr"
            ? "On a besoin d'un email valide pour vous envoyer le rapport."
            : "We need a valid email to send you the report.",
        variant: "destructive",
        duration: 3500,
      });
      return;
    }
    if (!regionValid) {
      await form.trigger("region");
      setStepIdx(4);
      window.scrollTo({ top: 0, behavior: "smooth" });
      toast({
        title: language === "fr" ? "Région requise" : "Region required",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    trackFormSubmitted({
      artisticDomain: data.artisticDomain?.join(", "),
      region: data.region,
    });
    submitMutation.mutate(data);
  };

  const handlePrev = () => {
    if (stepIdx > 0) {
      setStepIdx(stepIdx - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Cap gate — shown AFTER all hooks (hooks must not be conditional)
  if (capacityData?.isFull) {
    // Distinction : cap par discipline atteint vs cap global atteint
    const sourceFull = capacityData.perSource?.isFull && capacityData.count < capacityData.cap;
    const headline = sourceFull
      ? `Beaucoup de monde sur cette catégorie déjà.`
      : `Les ${capacityData.cap} places beta sont prises.`;
    const subline = sourceFull
      ? `On garde des places pour d'autres disciplines (${capacityData.perSource?.count}/${capacityData.perSource?.cap} testeurs déjà inscrits via ce canal). Rejoignez la liste d'attente, on vous notifie quand on rouvre.`
      : `Rejoignez la liste d'attente prioritaire — les premiers inscrits seront les premiers servis quand de nouvelles places s'ouvrent.`;
    const chipLabel = sourceFull ? "[ CATÉGORIE COMPLÈTE ]" : "[ BETA COMPLÈTE ]";
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6"
        style={{ background: "var(--mc-bg)", color: "var(--mc-text)" }}
      >
        <div className="max-w-lg w-full">
          <div className="mc-chip mc-chip-warn inline-flex mc-mono text-xs uppercase tracking-widest mb-6">
            {chipLabel}
          </div>
          <h1 className="mc-display text-4xl mb-4">
            {headline}
          </h1>
          <p className="mb-8 leading-relaxed" style={{ color: "var(--mc-muted)" }}>
            {subline}
          </p>
          {waitlistStatus === "success" ? (
            <div className="mc-card p-5 flex items-center gap-3" style={{ borderColor: "var(--mc-primary)" }}>
              <Check className="w-5 h-5" style={{ color: "var(--mc-primary)" }} strokeWidth={3} />
              <p>Inscription confirmée. On vous prévient dès qu'une place se libère.</p>
            </div>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setWaitlistStatus("loading");
                try {
                  const res = await fetch("/api/waitlist/qualified", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: waitlistEmail, source: "form-cap-gate" }),
                  });
                  if (!res.ok) throw new Error("Erreur");
                  setWaitlistStatus("success");
                } catch {
                  setWaitlistStatus("error");
                }
              }}
              className="flex gap-3"
            >
              <input
                type="email"
                required
                value={waitlistEmail}
                onChange={(e) => setWaitlistEmail(e.target.value)}
                placeholder="votre@email.com"
                className="mc-input flex-1 rounded-full px-5 py-3 text-sm"
                style={{
                  background: "var(--mc-panel)",
                  border: "1px solid var(--mc-border)",
                  color: "var(--mc-text)",
                }}
              />
              <button
                type="submit"
                disabled={waitlistStatus === "loading"}
                className="mc-btn-primary px-6 py-3 rounded-full text-sm mc-mono uppercase tracking-widest"
              >
                {waitlistStatus === "loading" ? "…" : "Me prévenir"}
              </button>
            </form>
          )}
          {waitlistStatus === "error" && (
            <p className="text-sm mt-3" style={{ color: "var(--mc-danger, #ef4444)" }}>
              Une erreur s'est produite. Réessayez.
            </p>
          )}
          <p className="text-xs mt-4" style={{ color: "var(--mc-muted-2)" }}>
            Aucun spam. Email utilisé uniquement pour vous prévenir.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--mc-bg)", color: "var(--mc-text)" }}>
      {/* Banner */}
      <div className="mc-mono text-xs text-center py-2 px-4" style={{ background: "var(--mc-warn)", color: "var(--mc-bg)" }}>
        [ BETA ] &nbsp;&nbsp;
        {language === "fr"
          ? "Vos réponses ne sont jamais partagées. Bouton « Feedback » pour tout retour."
          : "Your answers are never shared. \"Feedback\" button for anything."}
      </div>

      {/* Header */}
      <header
        className="sticky top-0 z-40 backdrop-blur border-b"
        style={{ background: "rgba(10,10,10,0.85)", borderColor: "var(--mc-border)" }}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-8 min-h-14 py-3 flex items-center justify-between gap-4 flex-wrap md:flex-nowrap">
          <a href="/" className="flex items-center gap-3 flex-shrink-0" style={{ textDecoration: "none", color: "var(--mc-text)" }}>
            <div className="mc-display text-lg">Mecene<span style={{ color: "var(--mc-primary)" }}>.</span></div>
            <span
              className="mc-chip mc-chip-warn mc-mono text-[10px] uppercase tracking-widest px-2 py-0.5 hidden sm:inline-flex"
            >
              {language === "fr" ? "Formulaire" : "Form"}
            </span>
          </a>
          <BetaCapCounter className="hidden md:inline-flex" />
          <div className="mc-mono text-xs uppercase tracking-widest whitespace-nowrap" style={{ color: "var(--mc-muted)" }}>
            {language === "fr" ? "Étape" : "Step"} <span style={{ color: "var(--mc-text)" }}>{currentStep.num}</span> <span style={{ color: "var(--mc-muted-2)" }}>/</span> 07
          </div>
          <button
            onClick={() => setLocation("/")}
            className="mc-btn-ghost text-xs uppercase tracking-widest mc-mono px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0"
          >
            {language === "fr" ? "Sauvegarder" : "Save"}{" "}
            <span className="hidden md:inline">&amp; {language === "fr" ? "quitter" : "quit"}</span>
          </button>
        </div>
      </header>

      {/* Progress */}
      <div className="max-w-6xl mx-auto px-6 md:px-8 pt-6">
        <div className="flex gap-1.5">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className="h-1 flex-1 rounded-full"
              style={{ background: i <= stepIdx ? "var(--mc-primary)" : "var(--mc-border)" }}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <section>
        <div className="max-w-3xl mx-auto px-6 md:px-8 py-16 md:py-20">
          {currentStep.id === "status" && <StepStatus form={form} />}
          {currentStep.id === "domain" && <StepDomain form={form} />}
          {currentStep.id === "description" && <StepDescription form={form} />}
          {currentStep.id === "type" && <StepType form={form} />}
          {currentStep.id === "region" && <StepRegion form={form} />}
          {currentStep.id === "email" && <StepEmail form={form} />}
          {currentStep.id === "optional" && <StepOptional form={form} />}

          {/* Nav */}
          <div className="mt-14 pt-8 border-t flex items-center justify-between gap-4" style={{ borderColor: "var(--mc-border)" }}>
            <button
              onClick={handlePrev}
              disabled={stepIdx === 0}
              className="mc-btn-ghost inline-flex items-center gap-2 px-5 py-3 rounded-full mc-mono text-xs uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {language === "fr" ? "Précédent" : "Previous"}
            </button>
            <div className="hidden md:block text-xs mc-mono uppercase tracking-widest" style={{ color: "var(--mc-muted)" }}>
              {language === "fr" ? "Auto-sauvegardé" : "Auto-saved"}
            </div>
            <button
              onClick={handleNext}
              disabled={submitMutation.isPending}
              className="mc-btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-full mc-mono text-xs uppercase tracking-widest disabled:opacity-60"
            >
              {submitMutation.isPending
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {language === "fr" ? "Envoi…" : "Submitting…"}</>
                : (stepIdx === STEPS.length - 1
                    ? <>{language === "fr" ? "Lancer le matching" : "Launch matching"} <ArrowRight className="w-3.5 h-3.5" /></>
                    : <>{language === "fr" ? "Question suivante" : "Next"} <ArrowRight className="w-3.5 h-3.5" /></>)}
            </button>
          </div>
        </div>
      </section>

      {/* Step overview */}
      <section className="mc-section-rule">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-12">
          <div className="mc-mono text-xs uppercase tracking-widest mb-6" style={{ color: "var(--mc-muted)" }}>
            {language === "fr" ? "/ Progression · cliquez pour sauter" : "/ Progress · click to jump"}
          </div>
          <div className="grid md:grid-cols-7 gap-2">
            {STEPS.map((s, i) => {
              const state = i < stepIdx ? "done" : i === stepIdx ? "active" : "future";
              return (
                <button
                  key={s.id}
                  onClick={() => { setStepIdx(i); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className={`mc-card p-4 text-left ${state === "future" ? "opacity-60" : ""}`}
                  style={state === "active" ? { borderColor: "var(--mc-primary)", background: "var(--mc-primary-soft)" } : undefined}
                >
                  <div
                    className="mc-mono text-[10px] uppercase tracking-widest mb-2 flex items-center gap-1.5"
                    style={{ color: state === "done" || state === "active" ? "var(--mc-primary)" : "var(--mc-muted)" }}
                  >
                    {state === "done" && <Check className="w-3 h-3" strokeWidth={3} />}
                    {state === "active" && "•"}
                    {s.num}
                  </div>
                  <div className="text-xs" style={{ color: state === "active" ? "var(--mc-text)" : "var(--mc-muted)" }}>
                    {s.label}
                  </div>
                </button>
              );
            })}
          </div>
          <p className="mc-mono text-[10px] uppercase tracking-widest mt-6 text-center" style={{ color: "var(--mc-muted-2)" }}>
            {language === "fr"
              ? "7 questions · 3 minutes · aucune réponse n'est stockée sans votre email"
              : "7 questions · 3 minutes · no answer stored without your email"}
          </p>
        </div>
      </section>

      <footer className="border-t" style={{ borderColor: "var(--mc-border)" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 mc-mono text-xs uppercase tracking-widest flex flex-wrap justify-between gap-4" style={{ color: "var(--mc-muted)" }}>
          <span>© 2026 Mecene · {language === "fr" ? "Formulaire" : "Form"} v0.9</span>
          <span className="flex gap-6">
            <a href="/mentions-legales" className="hover:text-white transition" style={{ textDecoration: "none", color: "inherit" }}>
              {language === "fr" ? "Mentions légales" : "Legal"}
            </a>
            <a href="/confidentialite" className="hover:text-white transition" style={{ textDecoration: "none", color: "inherit" }}>
              {language === "fr" ? "Confidentialité" : "Privacy"}
            </a>
            <a href="/cgv" className="hover:text-white transition" style={{ textDecoration: "none", color: "inherit" }}>CGV</a>
          </span>
        </div>
      </footer>
    </div>
  );
}

/* === STEP COMPONENTS === */

function Hero({ num, eyebrow, title, intro, tip }: { num: string; eyebrow: string; title: React.ReactNode; intro: string; tip?: string }) {
  return (
    <>
      <div className="mc-mono text-xs uppercase tracking-widest mb-6" style={{ color: "var(--mc-primary)" }}>/ {num} — {eyebrow}</div>
      <h1 className="mc-display text-4xl md:text-6xl mb-6">{title}</h1>
      <p className="text-lg leading-relaxed max-w-xl" style={{ color: "var(--mc-muted)" }}>{intro}</p>
      {tip && (
        <div className="mt-8 mc-card-soft p-5 flex gap-3 items-start">
          <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--mc-accent)" }} />
          <div className="text-sm leading-relaxed" style={{ color: "var(--mc-muted)" }}>
            <span className="font-medium" style={{ color: "var(--mc-text)" }}>Conseil : </span>{tip}
          </div>
        </div>
      )}
    </>
  );
}

function StepStatus({ form }: { form: any }) {
  const values: string[] = form.watch("status") || [];
  const toggle = (v: string) => {
    const next = values.includes(v) ? values.filter(x => x !== v) : [v]; // single select
    form.setValue("status", next);
  };
  return (
    <>
      <Hero num="01" eyebrow="Qui êtes-vous ?"
        title={<>VOUS ÊTES<br />QUOI AU JUSTE<span style={{ color: "var(--mc-primary)" }}>?</span></>}
        intro="On adapte les questions à votre domaine. Pas de jargon administratif, on demande juste ce qu'il faut pour matcher."
        tip="On ne demande jamais de n° SIRET. Votre statut juridique (indépendant, collectif, association…) suffit."
      />
      <div className="mt-10">
        <label className="mc-mono text-xs uppercase tracking-widest mb-3 block" style={{ color: "var(--mc-muted)" }}>Votre profil principal</label>
        <div className="grid sm:grid-cols-2 gap-3">
          {STATUS_OPTIONS.map(({ value, icon: Icon, label }) => {
            const selected = values.includes(value);
            return (
              <button
                key={value}
                onClick={() => toggle(value)}
                className="mc-card px-5 py-4 text-left flex items-center gap-3 transition"
                style={selected
                  ? { borderColor: "var(--mc-primary)", background: "var(--mc-primary-soft)", color: "var(--mc-primary)" }
                  : { borderColor: "var(--mc-border)" }
                }
              >
                <Icon className="w-4 h-4" style={{ color: selected ? "var(--mc-primary)" : "var(--mc-muted)" }} strokeWidth={1.75} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

function StepDomain({ form }: { form: any }) {
  const values: string[] = form.watch("artisticDomain") || [];
  const toggle = (v: string) => {
    const next = values.includes(v) ? values.filter(x => x !== v) : [...values, v];
    form.setValue("artisticDomain", next);
  };
  return (
    <>
      <Hero num="02" eyebrow="Votre domaine artistique"
        title={<>QUELLE EST<br />VOTRE DISCIPLINE<span style={{ color: "var(--mc-primary)" }}>?</span></>}
        intro="Cochez tout ce qui s'applique. On sait que les projets sont souvent hybrides — un spectacle peut être musique + théâtre + audiovisuel à la fois."
        tip="Plusieurs choix possibles. La discipline détermine quelles aides sectorielles sont vérifiées en priorité."
      />
      <div className="mt-10">
        <label className="mc-mono text-xs uppercase tracking-widest mb-3 block" style={{ color: "var(--mc-muted)" }}>Cochez vos disciplines</label>
        <div className="grid sm:grid-cols-3 gap-3">
          {DOMAIN_OPTIONS.map(({ value, label }) => {
            const selected = values.includes(value);
            return (
              <button
                key={value}
                onClick={() => toggle(value)}
                className="mc-card px-4 py-3 text-sm flex items-center gap-2 transition"
                style={selected
                  ? { borderColor: "var(--mc-primary)", background: "var(--mc-primary-soft)", color: "var(--mc-primary)" }
                  : { borderColor: "var(--mc-border)" }
                }
              >
                {selected && <Check className="w-3.5 h-3.5" style={{ color: "var(--mc-primary)" }} strokeWidth={3} />}
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

function StepDescription({ form }: { form: any }) {
  const v = form.watch("projectDescription") || "";
  return (
    <>
      <Hero num="03" eyebrow="Votre projet"
        title={<>DÉCRIVEZ<br />VOTRE PROJET<span style={{ color: "var(--mc-primary)" }}>.</span></>}
        intro="Quelques lignes suffisent. L'IA comprend le contexte, pas besoin d'un roman. Vos mots, votre style."
        tip="Mentionnez votre discipline, votre intention artistique, l'étape du projet, et si possible un budget approximatif. Plus c'est précis, meilleurs sont les matches."
      />
      <div className="mt-10">
        <label className="mc-mono text-xs uppercase tracking-widest mb-3 block" style={{ color: "var(--mc-muted)" }}>Description du projet</label>
        <textarea
          {...form.register("projectDescription")}
          placeholder="Ex : Je suis une compagnie de théâtre contemporain basée à Lyon. Nous préparons une création sur la mémoire collective qui mêle théâtre, vidéo et musique live. Budget estimé : 45 000 €. Deadline souhaitée : rentrée 2026."
          className="mc-input w-full text-sm rounded-lg focus:outline-none"
          style={{
            background: "var(--mc-bg)",
            border: "1px solid var(--mc-border)",
            color: "var(--mc-text)",
            padding: "1.1rem 1.35rem",
            lineHeight: 1.55,
            minHeight: 180,
            resize: "vertical",
          }}
        />
        <div className="mt-2 flex justify-between mc-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--mc-muted-2)" }}>
          <span>Max. 1500 caractères</span>
          <span>{v.length} / 1500</span>
        </div>
      </div>
    </>
  );
}

function StepType({ form }: { form: any }) {
  const types: string[] = form.watch("projectType") || [];
  const stage: string = form.watch("projectStage") || "";
  const toggle = (v: string) => {
    const next = types.includes(v) ? types.filter(x => x !== v) : [...types, v];
    form.setValue("projectType", next);
  };
  return (
    <>
      <Hero num="04" eyebrow="Nature du projet"
        title={<>CRÉATION,<br />PRODUCTION,<br />DIFFUSION<span style={{ color: "var(--mc-primary)" }}>?</span></>}
        intro="Ça change tout côté éligibilité. Une aide à la création n'est pas la même qu'une aide à la diffusion. Plusieurs choix possibles."
        tip="Les projets hybrides sont courants. Cochez tout ce qui s'applique — on priorise ensuite selon votre description."
      />
      <div className="mt-10">
        <label className="mc-mono text-xs uppercase tracking-widest mb-3 block" style={{ color: "var(--mc-muted)" }}>Nature du projet (plusieurs choix)</label>
        <div className="grid sm:grid-cols-2 gap-3">
          {TYPE_OPTIONS.map(({ value, label, desc }) => {
            const selected = types.includes(value);
            return (
              <button
                key={value}
                onClick={() => toggle(value)}
                className="mc-card px-5 py-4 text-left transition"
                style={selected
                  ? { borderColor: "var(--mc-primary)", background: "var(--mc-primary-soft)" }
                  : undefined}
              >
                <div className="font-medium mb-1">{label}</div>
                <div className="text-xs" style={{ color: "var(--mc-muted)" }}>{desc}</div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-8">
        <label className="mc-mono text-xs uppercase tracking-widest mb-3 block" style={{ color: "var(--mc-muted)" }}>Stade d'avancement</label>
        <div className="flex flex-wrap gap-2">
          {STAGE_OPTIONS.map(({ value, label }) => {
            const selected = stage === value;
            return (
              <button
                key={value}
                onClick={() => form.setValue("projectStage", selected ? "" : value)}
                className="mc-card px-4 py-2 text-sm rounded-full transition"
                style={selected
                  ? { borderColor: "var(--mc-primary)", background: "var(--mc-primary-soft)", color: "var(--mc-primary)" }
                  : undefined}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

function RegionCombobox({ form }: { form: any }) {
  const current: string = form.watch("region") || "";
  const [query, setQuery] = useState(current);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = REGIONS.filter(r =>
    r.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const select = (r: string) => {
    form.setValue("region", r, { shouldValidate: true });
    setQuery(r);
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <input
        type="text"
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Ex : Provence-Alpes-Côte d'Azur…"
        className="mc-input w-full text-sm rounded-lg focus:outline-none"
        style={{ background: "var(--mc-bg)", border: "1px solid var(--mc-border)", color: "var(--mc-text)", padding: "0.9rem 1.25rem" }}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "var(--mc-panel)", border: "1px solid var(--mc-border)",
          borderRadius: 8, zIndex: 50, overflow: "hidden",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}>
          {filtered.map(r => (
            <button
              key={r}
              type="button"
              onClick={() => select(r)}
              className="w-full text-left px-4 py-2.5 text-sm transition"
              style={{ color: "var(--mc-text)", background: "transparent" }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--mc-border)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              {r}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StepRegion({ form }: { form: any }) {
  const inter: string = form.watch("isInternational") || "";
  return (
    <>
      <Hero num="05" eyebrow="Où êtes-vous ?"
        title={<>VOUS ÊTES<br />OÙ EN FRANCE<span style={{ color: "var(--mc-primary)" }}>?</span></>}
        intro="Beaucoup de subventions sont régionales ou municipales. Votre localisation = des aides que d'autres n'ont pas. Géo-avantage."
        tip="On utilise votre région et votre ville. Les DRAC et les mairies ont des enveloppes distinctes."
      />
      <div className="mt-10">
        <label className="mc-mono text-xs uppercase tracking-widest mb-3 block" style={{ color: "var(--mc-muted)" }}>Région administrative</label>
        <RegionCombobox form={form} />
      </div>
      <div className="mt-8">
        <label className="mc-mono text-xs uppercase tracking-widest mb-3 block" style={{ color: "var(--mc-muted)" }}>Votre projet a une dimension internationale ?</label>
        <div className="flex flex-wrap gap-2">
          {[
            { v: "non", l: "Non, uniquement France" },
            { v: "tournee", l: "Oui, tournée ou coproduction" },
            { v: "export", l: "Oui, export / diffusion à l'étranger" },
          ].map(({ v, l }) => {
            const sel = inter === v;
            return (
              <button
                key={v}
                onClick={() => form.setValue("isInternational", sel ? "" : v)}
                className="mc-card px-4 py-2 text-sm rounded-full transition"
                style={sel
                  ? { borderColor: "var(--mc-primary)", background: "var(--mc-primary-soft)", color: "var(--mc-primary)" }
                  : undefined}
              >
                {l}
              </button>
            );
          })}
        </div>
        <div className="mc-mono text-[10px] uppercase tracking-widest mt-3" style={{ color: "var(--mc-muted-2)" }}>
          → Si oui, on débloque Europe Créative et les aides Institut Français.
        </div>
      </div>
    </>
  );
}

function StepEmail({ form }: { form: any }) {
  const emailError = form.formState.errors.email?.message;
  return (
    <>
      <Hero num="06" eyebrow="Où envoyer votre rapport ?"
        title={<>ON VOUS ENVOIE<br />LE RAPPORT OÙ<span style={{ color: "var(--mc-primary)" }}>?</span></>}
        intro="Vos matches sont prêts. Donnez-nous un email et on vous les envoie en PDF. Gratuit pendant la beta — pas de carte bancaire."
        tip="Votre email ne sera utilisé que pour ce rapport et, si vous cochez la case, pour vous prévenir de la sortie V1. Aucun spam, aucune revente."
      />
      <div className="mt-10">
        <label className="mc-mono text-xs uppercase tracking-widest mb-3 block" style={{ color: "var(--mc-muted)" }}>
          Votre email <span style={{ color: "var(--mc-primary)" }}>*</span>
        </label>
        <input
          type="email"
          autoFocus
          {...form.register("email")}
          placeholder="votre@email.com"
          className="mc-input w-full text-sm rounded-lg focus:outline-none"
          style={{
            background: "var(--mc-bg)",
            border: `1px solid ${emailError ? "var(--mc-danger)" : "var(--mc-border)"}`,
            color: "var(--mc-text)",
            padding: "0.9rem 1.25rem",
          }}
        />
        {emailError && (
          <div className="mt-2 text-xs mc-mono uppercase tracking-widest" style={{ color: "var(--mc-danger)" }}>
            ↳ {typeof emailError === "string" ? emailError : "Email invalide"}
          </div>
        )}
      </div>
      <div className="mt-8 mc-card-soft p-4 flex gap-3 items-start">
        <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--mc-primary)" }} />
        <div className="text-sm leading-relaxed" style={{ color: "var(--mc-muted)" }}>
          <span className="font-medium" style={{ color: "var(--mc-text)" }}>Vous êtes à un clic.</span>{" "}
          Après soumission, le matching prend 10–20 secondes. Vous verrez les résultats en direct.
        </div>
      </div>
    </>
  );
}

function StepOptional({ form }: { form: any }) {
  const social: string[] = form.watch("socialDimension") || [];
  const toggleSocial = (v: string) => {
    const next = social.includes(v) ? social.filter(x => x !== v) : [...social, v];
    form.setValue("socialDimension", next);
  };
  return (
    <>
      <Hero num="07" eyebrow="Affiner (optionnel)"
        title={<>ON AFFINE<br />ENCORE<span style={{ color: "var(--mc-primary)" }}>?</span></>}
        intro="Ces questions débloquent des dispositifs plus spécifiques. Ignorez ce qui ne vous concerne pas — rien n'est obligatoire ici."
      />
      <div className="mt-10 space-y-4">
        <div className="mc-card p-5">
          <div className="mb-3">
            <div className="font-medium">Dimension sociale / inclusive</div>
            <div className="text-xs mt-1" style={{ color: "var(--mc-muted)" }}>Inclusion, éducation, territoire, égalité, accessibilité…</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { v: "inclusion", l: "Inclusion" },
              { v: "education", l: "Éducation" },
              { v: "territoire", l: "Territoire rural" },
              { v: "egalite", l: "Égalité F/H" },
            ].map(({ v, l }) => {
              const sel = social.includes(v);
              return (
                <button
                  key={v}
                  onClick={() => toggleSocial(v)}
                  className="mc-card-soft px-3 py-1.5 text-xs rounded-full transition"
                  style={sel
                    ? { borderColor: "var(--mc-primary)", background: "var(--mc-primary-soft)", color: "var(--mc-primary)" }
                    : undefined}
                >
                  {l}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mc-card p-5">
          <div className="font-medium">Urgence</div>
          <div className="text-xs mt-1 mb-3" style={{ color: "var(--mc-muted)" }}>On priorise les aides qui ferment bientôt.</div>
          <div className="flex flex-wrap gap-2">
            {[
              { v: "immediate", l: "Urgent (< 1 mois)" },
              { v: "court", l: "Court terme (1-3 mois)" },
              { v: "moyen", l: "Moyen terme (3-6 mois)" },
              { v: "pas-presse", l: "Pas pressé" },
            ].map(({ v, l }) => {
              const cur = form.watch("urgency") || "";
              const sel = cur === v;
              return (
                <button
                  key={v}
                  onClick={() => form.setValue("urgency", sel ? "" : v)}
                  className="mc-card-soft px-3 py-1.5 text-xs rounded-full transition"
                  style={sel
                    ? { borderColor: "var(--mc-primary)", background: "var(--mc-primary-soft)", color: "var(--mc-primary)" }
                    : undefined}
                >
                  {l}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mc-card p-5 text-sm" style={{ color: "var(--mc-muted)" }}>
          Vous pouvez aussi laisser ce formulaire tel quel — on lance le matching sur les données déjà saisies.
        </div>
      </div>
    </>
  );
}
