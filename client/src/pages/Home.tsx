import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Music, Headphones, Pen, Palette, Wrench, Drama, Sparkles, Ticket, Film,
  Cpu, Landmark, Building, Megaphone, Image as ImageIcon, Disc, BookOpen, Users,
  ArrowRight, Check, ExternalLink, FileText, Target, MessageSquare, Calendar,
  Coins, Zap,
} from "lucide-react";

interface GrantsStats {
  total: number;
  euGrants: number;
  frenchGrants: number;
  withDeadline: number;
  withUrl: number;
}

/** ------------------------------------------------------------------
 *  Example Grant Card (preserved logic, new look)
 *  ------------------------------------------------------------------ */
function ExampleGrantCard({ language }: { language: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [buttonState, setButtonState] = useState<"idle" | "loading" | "success">("idle");

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (buttonState !== "idle") return;
    setButtonState("loading");
    setTimeout(() => {
      setButtonState("success");
      setTimeout(() => {
        window.open(
          "https://www.culture.gouv.fr/fr/catalogue-des-demarches-et-subventions/subvention/aides-aux-equipes-independantes-aides-deconcentrees-au-spectacle-vivant-adsv",
          "_blank",
          "noopener,noreferrer"
        );
        setButtonState("idle");
      }, 500);
    }, 1000);
  };

  return (
    <div className="mc-card overflow-hidden" style={{ borderColor: "var(--mc-primary)" }}>
      <div className="p-8" style={{ background: "var(--mc-primary-soft)" }}>
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "var(--mc-primary)", color: "var(--mc-bg)" }}
          >
            <Check className="w-4 h-4" strokeWidth={3} />
          </div>
          <div className="mc-mono text-xs uppercase tracking-widest" style={{ color: "var(--mc-primary)" }}>
            {language === "fr" ? "Match · 92 %" : "Match · 92%"}
          </div>
        </div>

        <h3 className="mc-display text-xl sm:text-3xl md:text-4xl mb-3 break-words">
          {language === "fr"
            ? "ADSV — AIDES AUX ÉQUIPES INDÉPENDANTES"
            : "ADSV — SUPPORT FOR INDEPENDENT TEAMS"}
        </h3>
        <div className="text-sm mb-6" style={{ color: "var(--mc-muted)" }}>
          {language === "fr" ? "Ministère de la Culture · Spectacle vivant" : "Ministry of Culture · Performing arts"}
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="mc-card-soft p-4">
            <div className="flex items-center gap-2 mc-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: "var(--mc-muted)" }}>
              <Coins className="w-3.5 h-3.5" /> {language === "fr" ? "Montant" : "Amount"}
            </div>
            <div className="font-semibold">
              {language === "fr" ? "Variable selon projet" : "Variable per project"}
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--mc-muted)" }}>
              {language === "fr" ? "56 M€ distribués en 2021" : "€56M distributed in 2021"}
            </div>
          </div>
          <div className="mc-card-soft p-4">
            <div className="flex items-center gap-2 mc-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: "var(--mc-muted)" }}>
              <Calendar className="w-3.5 h-3.5" /> Deadline
            </div>
            <div className="font-semibold" style={{ color: "var(--mc-primary)" }}>
              {language === "fr" ? "Permanente" : "Permanent"}
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--mc-muted)" }}>
              {language === "fr" ? "Dossier à tout moment" : "Apply anytime"}
            </div>
          </div>
          <div className="mc-card-soft p-4">
            <div className="flex items-center gap-2 mc-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: "var(--mc-muted)" }}>
              <Zap className="w-3.5 h-3.5" /> {language === "fr" ? "Difficulté" : "Difficulty"}
            </div>
            <div className="font-semibold">{language === "fr" ? "Modérée" : "Moderate"}</div>
            <div className="text-xs mt-1" style={{ color: "var(--mc-muted)" }}>
              {language === "fr" ? "Budget 45 k€ compatible" : "€45k budget compatible"}
            </div>
          </div>
        </div>

        <div className="border-l-2 pl-5 py-2 mb-6" style={{ borderColor: "var(--mc-primary)" }}>
          <div className="flex items-center gap-2 mc-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--mc-primary)" }}>
            <Target className="w-3.5 h-3.5" />
            {language === "fr" ? "Pourquoi cette subvention ?" : "Why this grant?"}
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--mc-muted)" }}>
            {language === "fr"
              ? "Votre projet pluridisciplinaire (théâtre + vidéo + musique) correspond parfaitement aux critères ADSV. Cette aide permanente soutient les équipes indépendantes en danse, théâtre, musique, cirque et arts de la rue. Budget de 45 k€ compatible."
              : "Your multidisciplinary creation project perfectly matches ADSV criteria. This permanent grant supports independent teams in dance, theater, music, circus and street arts. €45k budget is compatible."}
          </p>
        </div>

        {isOpen && (
          <div className="mb-6 space-y-4 text-sm">
            <div>
              <div className="mc-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: "var(--mc-muted-2)" }}>
                {language === "fr" ? "Description" : "Description"}
              </div>
              <p className="leading-relaxed" style={{ color: "var(--mc-muted)" }}>
                {language === "fr"
                  ? "Le dispositif ADSV constitue le socle de la politique du ministère de la Culture en faveur des équipes artistiques. Il soutient les artistes et équipes indépendants pour qu'ils puissent développer leur travail de création."
                  : "The ADSV program is the cornerstone of the Ministry of Culture's policy for artistic teams. It supports independent artists and teams in developing their creative work."}
              </p>
            </div>
            <div>
              <div className="mc-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--mc-muted-2)" }}>
                {language === "fr" ? "Dossier à fournir" : "Required documents"}
              </div>
              <ul className="space-y-1.5" style={{ color: "var(--mc-muted)" }}>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "var(--mc-primary)" }} />
                  <span>{language === "fr" ? "Présentation du projet artistique" : "Artistic project presentation"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "var(--mc-primary)" }} />
                  <span>{language === "fr" ? "Budget prévisionnel détaillé" : "Detailed budget forecast"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "var(--mc-primary)" }} />
                  <span>{language === "fr" ? "Calendrier de diffusion (min. 3-8 représentations)" : "Performance schedule (min. 3-8 shows)"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "var(--mc-primary)" }} />
                  <span>{language === "fr" ? "Partenariats avec lieux de spectacle" : "Partnerships with venues"}</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="mc-btn-ghost px-5 py-3 rounded-lg text-sm flex-1"
            data-testid="button-toggle-details"
          >
            {isOpen
              ? (language === "fr" ? "Masquer les détails ↑" : "Hide details ↑")
              : (language === "fr" ? "Voir tous les détails ↓" : "View all details ↓")}
          </button>
          <button
            className="mc-btn-primary px-5 py-3 rounded-lg text-sm flex-1 inline-flex items-center justify-center gap-2"
            onClick={handleButtonClick}
            disabled={buttonState !== "idle"}
            data-testid="button-access-grant"
          >
            {buttonState === "loading" && (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {language === "fr" ? "Vérification…" : "Checking…"}
              </>
            )}
            {buttonState === "success" && (
              <>
                <Check className="w-4 h-4" strokeWidth={3} />
                {language === "fr" ? "Accès autorisé !" : "Access granted!"}
              </>
            )}
            {buttonState === "idle" && (
              <>
                {language === "fr" ? "Accéder au dossier" : "Access the grant"}
                <ExternalLink className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/** ------------------------------------------------------------------
 *  Beta Waitlist Section (preserved fetch to /api/waitlist)
 *  ------------------------------------------------------------------ */
function BetaWaitlistSection({ language, grantsCount }: { language: string; grantsCount: number }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "loading" || status === "success") return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "homepage-pricing" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur");
      }
      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || (language === "fr" ? "Erreur" : "Error"));
    }
  };

  return (
    <section id="pricing" className="mc-section-rule">
      <div className="max-w-5xl mx-auto px-6 md:px-8 py-24 text-center">
        <div className="mc-chip mc-chip-warn inline-flex mc-mono text-xs uppercase tracking-widest mb-8">
          [ BETA ] — {language === "fr" ? "Version en test" : "Test version"}
        </div>
        <h2 className="mc-display text-4xl sm:text-5xl md:text-7xl">
          {language === "fr" ? (
            <>
              100 % GRATUIT<br />
              <span style={{ color: "var(--mc-primary)" }}>PENDANT LA BETA.</span>
            </>
          ) : (
            <>
              100% FREE<br />
              <span style={{ color: "var(--mc-primary)" }}>DURING THE BETA.</span>
            </>
          )}
        </h2>
        <p className="mt-8 text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--mc-muted)" }}>
          {language === "fr"
            ? "Le matching s'améliore de jour en jour avec chaque projet testé. Tant qu'on n'atteint pas 80 % de résultats vraiment pertinents, tout reste gratuit."
            : "Matching improves every day with each project tested. Until we reach 80% truly relevant results, everything stays free."}
        </p>

        <div className="grid md:grid-cols-3 gap-4 mt-14">
          <div className="mc-card p-6 text-left">
            <div className="flex items-center gap-3 mb-3">
              <Target className="w-6 h-6" style={{ color: "var(--mc-primary)" }} strokeWidth={1.5} />
              <div className="mc-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--mc-primary)" }}>01</div>
            </div>
            <div className="text-xl font-bold mb-2">
              {language === "fr" ? "Tous vos matches" : "All your matches"}
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--mc-muted)" }}>
              {language === "fr" ? "Aucun résultat flouté. Tout est débloqué." : "No blurred results. Everything unlocked."}
            </p>
          </div>
          <div className="mc-card p-6 text-left">
            <div className="flex items-center gap-3 mb-3">
              <FileText className="w-6 h-6" style={{ color: "var(--mc-primary)" }} strokeWidth={1.5} />
              <div className="mc-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--mc-primary)" }}>02</div>
            </div>
            <div className="text-xl font-bold mb-2">
              {language === "fr" ? "Votre rapport PDF" : "Your PDF report"}
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--mc-muted)" }}>
              {language === "fr" ? "Téléchargeable, partageable avec votre équipe." : "Downloadable, shareable with your team."}
            </p>
          </div>
          <div className="mc-card p-6 text-left">
            <div className="flex items-center gap-3 mb-3">
              <MessageSquare className="w-6 h-6" style={{ color: "var(--mc-primary)" }} strokeWidth={1.5} />
              <div className="mc-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--mc-primary)" }}>03</div>
            </div>
            <div className="text-xl font-bold mb-2">
              {language === "fr" ? "Un canal direct" : "A direct channel"}
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--mc-muted)" }}>
              {language === "fr" ? "Vos retours nous font progresser." : "Your feedback drives us forward."}
            </p>
          </div>
        </div>

        <div className="mc-card mt-12 p-8 md:p-10 text-left">
          <div className="grid md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-6">
              <div className="mc-mono text-xs uppercase tracking-widest mb-3" style={{ color: "var(--mc-muted)" }}>
                / V1 — {language === "fr" ? "à venir" : "coming soon"}
              </div>
              <h3 className="mc-display text-3xl">
                {language === "fr" ? (
                  <>PRÉVENEZ-MOI<br />QUAND LA V1 SORT.</>
                ) : (
                  <>NOTIFY ME<br />WHEN V1 LAUNCHES.</>
                )}
              </h3>
            </div>
            <div className="md:col-span-6">
              <p className="text-sm mb-4 leading-relaxed" style={{ color: "var(--mc-muted)" }}>
                {language === "fr"
                  ? "Vous serez informé(e) en avant-première, avec un tarif de lancement réservé aux beta-testeurs."
                  : "You'll get early access with a launch price reserved for beta testers."}
              </p>
              {status === "success" ? (
                <div className="mc-card-soft p-4 flex items-center gap-3" style={{ borderColor: "var(--mc-primary)" }}>
                  <Check className="w-5 h-5" style={{ color: "var(--mc-primary)" }} strokeWidth={3} />
                  <p className="text-sm">
                    {language === "fr" ? "C'est noté ! On vous tiendra au courant." : "You're in! We'll keep you posted."}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    required
                    placeholder={language === "fr" ? "votre@email.com" : "your@email.com"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === "loading"}
                    className="mc-input flex-1 rounded-full px-5 py-3 text-sm disabled:opacity-60"
                    style={{
                      background: "var(--mc-bg)",
                      border: "1px solid var(--mc-border)",
                      color: "var(--mc-text)",
                    }}
                    data-testid="input-waitlist-email"
                  />
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="mc-btn-primary px-6 py-3 rounded-full text-sm mc-mono uppercase tracking-widest disabled:opacity-60"
                    data-testid="button-waitlist-submit"
                  >
                    {status === "loading"
                      ? (language === "fr" ? "Envoi…" : "Sending…")
                      : (language === "fr" ? "Me prévenir" : "Notify me")}
                  </button>
                </form>
              )}
              {status === "error" && (
                <p className="text-sm mt-3" style={{ color: "var(--mc-danger)" }}>{errorMsg}</p>
              )}
              <p className="text-xs mt-3" style={{ color: "var(--mc-muted-2)" }}>
                {language === "fr"
                  ? "Email uniquement pour la notification V1. Aucun spam, aucune revente."
                  : "Email only for V1 notification. No spam, no reselling."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** ------------------------------------------------------------------
 *  Home
 *  ------------------------------------------------------------------ */
export default function Home() {
  const { language, setLanguage, t } = useLanguage();

  const { data: statsData } = useQuery<GrantsStats>({
    queryKey: ["/api/grants/stats"],
  });
  const grantsCount = statsData?.total ?? 473;

  const profiles = [
    { href: "/form?domain=musique",            icon: Music,       label: language === "fr" ? "un musicien" : "a musician", test: "badge-musician" },
    { href: "/form?profile=dj-producteur",     icon: Headphones,  label: language === "fr" ? "un DJ / producteur" : "a DJ / producer", test: "badge-dj-producer" },
    { href: "/form?domain=ecriture",           icon: Pen,         label: language === "fr" ? "un écrivain" : "a writer", test: "badge-writer" },
    { href: "/form?domain=arts-plastiques",    icon: Palette,     label: language === "fr" ? "un artiste" : "an artist", test: "badge-visual-artist" },
    { href: "/form?profile=artisan-art",       icon: Wrench,      label: language === "fr" ? "un artisan d'art" : "a craft artisan", test: "badge-craftsperson" },
    { href: "/form?domain=spectacle-vivant",   icon: Drama,       label: language === "fr" ? "un comédien" : "an actor", test: "badge-performer" },
    { href: "/form?profile=danseur",           icon: Sparkles,    label: language === "fr" ? "un danseur" : "a dancer", test: "badge-dancer" },
    { href: "/form?profile=compagnie",         icon: Ticket,      label: language === "fr" ? "une compagnie" : "a company", test: "badge-company" },
    { href: "/form?domain=audiovisuel",        icon: Film,        label: language === "fr" ? "un cinéaste" : "a filmmaker", test: "badge-filmmaker" },
    { href: "/form?domain=arts-numeriques",    icon: Cpu,         label: language === "fr" ? "un artiste numérique" : "a digital artist", test: "badge-digital-artist" },
    { href: "/form?domain=patrimoine",         icon: Landmark,    label: language === "fr" ? "dans le patrimoine" : "in heritage", test: "badge-heritage" },
    { href: "/form?profile=lieu-culturel",     icon: Building,    label: language === "fr" ? "un lieu culturel" : "a cultural venue", test: "badge-venue" },
    { href: "/form?profile=orga-soiree",       icon: Megaphone,   label: language === "fr" ? "un organisateur d'événements" : "an event organizer", test: "badge-event-organizer" },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "var(--mc-bg)", color: "var(--mc-text)" }}>
      {/* Beta banner */}
      <div className="mc-mono text-xs text-center py-2 px-4" style={{ background: "var(--mc-warn)", color: "var(--mc-bg)" }}>
        [ BETA ] &nbsp;&nbsp;
        {language === "fr"
          ? "Version beta — vos retours sont précieux, utilisez le bouton « Feedback » en bas à droite"
          : "Beta version — your feedback matters, use the \"Feedback\" button at the bottom right"}
      </div>

      {/* Header */}
      <header
        className="mc-section-rule sticky top-0 z-40 backdrop-blur"
        style={{ background: "rgba(10,10,10,0.85)" }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-8 h-14 flex items-center justify-between">
          <a href="/" data-testid="link-home" className="flex items-center gap-3">
            <div className="mc-display text-lg">
              Mecene<span style={{ color: "var(--mc-primary)" }}>.</span>
            </div>
            <span className="mc-chip mc-chip-warn mc-mono text-[10px] uppercase tracking-widest px-2 py-0.5">
              v0.9 / beta
            </span>
          </a>
          <nav className="hidden md:flex items-center gap-6 mc-mono text-xs uppercase tracking-widest" style={{ color: "var(--mc-muted)" }}>
            <a href="#comparaison" className="hover:text-white transition">Méthode</a>
            <a href="#how" className="hover:text-white transition">3 étapes</a>
            <a href="#example" className="hover:text-white transition">Exemple</a>
            <a href="#pricing" className="hover:text-white transition">Tarifs</a>
          </nav>
          <div className="flex items-center gap-2">
            <LanguageToggle language={language} onLanguageChange={setLanguage} />
            <Link href="/form">
              <Button className="mc-btn-primary mc-mono text-xs uppercase tracking-widest px-4 py-1.5 rounded-full h-auto">
                {language === "fr" ? "Commencer" : "Start"} →
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section>
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-20 md:py-32 grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-9">
            <div className="mc-mono text-xs uppercase tracking-widest mb-8 md:mb-10" style={{ color: "var(--mc-primary)" }}>
              — {language === "fr" ? "l'IA qui a lu les 473 PDFs pour vous" : "the AI that read 473 PDFs so you don't have to"}
            </div>
            <h1 className="mc-display text-[38px] sm:text-[56px] md:text-[108px] leading-none">
              {language === "fr" ? (
                <>
                  VOUS AVEZ<br />L'ŒUVRE<span style={{ color: "var(--mc-primary)" }}>.</span>
                  <br />
                  ON TROUVE<br />L'ARGENT<span style={{ color: "var(--mc-primary)" }}>.</span>
                </>
              ) : (
                <>
                  YOU'VE GOT<br />THE WORK<span style={{ color: "var(--mc-primary)" }}>.</span>
                  <br />
                  WE FIND<br />THE MONEY<span style={{ color: "var(--mc-primary)" }}>.</span>
                </>
              )}
            </h1>
            <p className="mt-8 md:mt-10 max-w-xl text-lg leading-relaxed" style={{ color: "var(--mc-muted)" }}>
              {language === "fr"
                ? "Chaque aide vérifiée une à une par nos équipes : deadline réelle, montant précis, lien direct vers le bon dossier. Vous décrivez votre projet, vous recevez votre top 5 matché — en 3 minutes."
                : "Every grant verified one by one by our team: real deadline, precise amount, direct link. Describe your project, get your top 5 matches — in 3 minutes."}
            </p>

            <div className="mt-10 flex flex-wrap gap-2">
              <span className="mc-chip mc-chip-accent">
                <span className="mc-pulse-dot" style={{ background: "var(--mc-accent)" }} />
                {language === "fr" ? "Base mise à jour cette semaine" : "Database updated this week"}
              </span>
              <span className="mc-chip mc-chip-warn font-semibold">
                {language === "fr" ? "Gratuit pendant la beta" : "Free during beta"}
              </span>
              <span className="mc-chip" style={{ background: "var(--mc-panel)", color: "var(--mc-muted)" }}>
                {language === "fr" ? "Sans carte bancaire · Sans abonnement" : "No credit card · No subscription"}
              </span>
            </div>
          </div>

          <div className="col-span-12 md:col-span-3">
            <div className="mc-mono text-xs uppercase tracking-widest mb-6" style={{ color: "var(--mc-muted)" }}>
              {language === "fr" ? "Index · temps réel" : "Index · real time"}
            </div>
            <div className="mc-divide-border">
              <div className="py-4 flex items-baseline justify-between">
                <span className="text-xs uppercase tracking-widest" style={{ color: "var(--mc-muted)" }}>
                  {language === "fr" ? "Subventions" : "Grants"}
                </span>
                <span className="mc-display text-4xl" style={{ color: "var(--mc-primary)" }}>{grantsCount}</span>
              </div>
              <div className="py-4 flex items-baseline justify-between">
                <span className="text-xs uppercase tracking-widest" style={{ color: "var(--mc-muted)" }}>
                  {language === "fr" ? "Organismes" : "Organizations"}
                </span>
                <span className="mc-display text-4xl">30<span style={{ color: "var(--mc-muted)" }}>+</span></span>
              </div>
              <div className="py-4 flex items-baseline justify-between">
                <span className="text-xs uppercase tracking-widest" style={{ color: "var(--mc-muted)" }}>
                  {language === "fr" ? "Budget accessible" : "Accessible budget"}
                </span>
                <span className="mc-display text-4xl">30M<span style={{ color: "var(--mc-muted)" }}>€</span></span>
              </div>
              <div className="py-4 flex items-baseline justify-between">
                <span className="text-xs uppercase tracking-widest" style={{ color: "var(--mc-muted)" }}>
                  {language === "fr" ? "Montant médian" : "Median"}
                </span>
                <span className="mc-display text-4xl">60K<span style={{ color: "var(--mc-muted)" }}>€</span></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* JE SUIS... */}
      <section className="mc-section-rule">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-20">
          <div className="grid grid-cols-12 gap-6 mb-10">
            <div className="col-span-12 md:col-span-3">
              <div className="mc-mono text-xs uppercase tracking-widest" style={{ color: "var(--mc-muted)" }}>/ 01</div>
              <h2 className="mc-display text-5xl mt-3">{language === "fr" ? "JE SUIS..." : "I AM..."}</h2>
            </div>
            <div className="col-span-12 md:col-span-9 flex items-end">
              <p className="max-w-xl" style={{ color: "var(--mc-muted)" }}>
                {language === "fr"
                  ? "Cliquez sur votre profil pour pré-remplir le formulaire. 13 questions adaptées à votre domaine, pas une de plus."
                  : "Click your profile to pre-fill the form. 13 questions tailored to your field, not one more."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {profiles.map((p) => {
              const Icon = p.icon;
              return (
                <Link key={p.test} href={p.href}>
                  <a
                    data-testid={p.test}
                    className="mc-card hover:border-[var(--mc-primary)] transition px-5 py-4 flex items-center gap-3 cursor-pointer"
                    style={{ textDecoration: "none", color: "var(--mc-text)" }}
                  >
                    <Icon className="w-[18px] h-[18px] flex-shrink-0" style={{ color: "var(--mc-muted)" }} strokeWidth={1.75} />
                    <span>{p.label}</span>
                  </a>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* POURQUOI PAS CHATGPT */}
      <section id="comparaison" className="mc-section-rule">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-24">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-4">
              <div className="mc-mono text-xs uppercase tracking-widest" style={{ color: "var(--mc-muted)" }}>
                / 02 — {language === "fr" ? "La question qu'on nous pose le plus" : "The question we hear most"}
              </div>
              <h2 className="mc-display text-4xl md:text-5xl mt-4">
                {language === "fr" ? (
                  <>« ET POURQUOI<br />PAS JUSTE<br />CHATGPT ? »</>
                ) : (
                  <>"WHY NOT<br />JUST USE<br />CHATGPT?"</>
                )}
              </h2>
              <p className="mt-8 max-w-sm leading-relaxed" style={{ color: "var(--mc-muted)" }}>
                {language === "fr"
                  ? "On adore les IA généralistes. Imbattables pour rédiger votre dossier. Mais pour "
                  : "We love general-purpose AIs. Unbeatable for drafting your application. But for "}
                <span style={{ color: "var(--mc-text)" }}>
                  {language === "fr" ? "trouver la bonne subvention" : "finding the right grant"}
                </span>
                {language === "fr"
                  ? ", il y a trois choses qu'elles ne peuvent pas faire — et on les fait."
                  : ", there are three things they can't do — and we do."}
              </p>
            </div>

            <div className="col-span-12 md:col-span-8 space-y-4">
              <ComparisonRow
                num="01"
                title={language === "fr" ? "Une base à jour" : "A current database"}
                left={language === "fr"
                  ? "Sa connaissance s'arrête début 2025. Elle peut citer des aides qui n'existent plus, ou donner des informations qui ne sont plus valables."
                  : "Its knowledge stopped in early 2025. It may mention programs that no longer exist, or give info that's no longer valid."}
                right={language === "fr"
                  ? <><span style={{ color: "var(--mc-primary)" }} className="font-semibold">{grantsCount} subventions</span> vérifiées une à une par nos équipes. Base revue chaque semaine, nouvelles aides ajoutées en continu.</>
                  : <><span style={{ color: "var(--mc-primary)" }} className="font-semibold">{grantsCount} grants</span> verified one by one by our team. Database reviewed every week, new grants added continuously.</>}
              />
              <ComparisonRow
                num="02"
                title={language === "fr" ? "Des montants et deadlines précis" : "Precise amounts and deadlines"}
                leftItalic
                left={language === "fr"
                  ? "« Le montant se situe entre 5 000 et 50 000 € environ. La date limite varie selon les sessions, renseignez-vous sur le site officiel. »"
                  : "\"The amount is roughly between €5,000 and €50,000. The deadline varies by session, check the official website.\""}
                right={language === "fr"
                  ? <>« <span style={{ color: "var(--mc-primary)" }}>8 000 € – 45 000 €</span>. Prochaine deadline : <span style={{ color: "var(--mc-text)" }}>23 juin 2026</span>. Dossier à déposer ici. »</>
                  : <>"<span style={{ color: "var(--mc-primary)" }}>€8,000 – €45,000</span>. Next deadline: <span style={{ color: "var(--mc-text)" }}>June 23, 2026</span>. Submit here."</>}
              />
              <ComparisonRow
                num="03"
                title={language === "fr" ? "La finesse métier" : "Industry nuance"}
                left={language === "fr"
                  ? "Propose les mêmes aides à un DJ électro, un quatuor à cordes et un compositeur de musique de film. Mélange souvent spectacle vivant et audiovisuel."
                  : "Suggests the same grants to an electronic DJ, a string quartet and a film composer. Often mixes up performing arts and audiovisual."}
                right={language === "fr"
                  ? "Entraîné uniquement sur la culture. Sait qu'un DJ, un compositeur classique et un musicien de film n'ont pas accès aux mêmes dispositifs."
                  : "Trained only on cultural grants. Knows a DJ, a classical composer and a film composer don't qualify for the same programs."}
              />
            </div>
          </div>

          <div className="mt-10 mc-card-soft p-6 md:p-8 text-center">
            <p className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
              {language === "fr" ? (
                <>Utilisez <span className="font-bold" style={{ color: "var(--mc-text)" }}>ChatGPT</span> pour rédiger votre dossier.<br />
                Utilisez <span className="font-bold" style={{ color: "var(--mc-primary)" }}>Mecene</span> pour savoir lequel remplir.</>
              ) : (
                <>Use <span className="font-bold" style={{ color: "var(--mc-text)" }}>ChatGPT</span> to draft your application.<br />
                Use <span className="font-bold" style={{ color: "var(--mc-primary)" }}>Mecene</span> to know which one to fill.</>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="mc-section-rule">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-24 grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-4">
            <div className="mc-mono text-xs uppercase tracking-widest" style={{ color: "var(--mc-muted)" }}>/ 03</div>
            <h2 className="mc-display text-4xl md:text-5xl mt-4">
              {language === "fr" ? <>COMMENT<br />ÇA MARCHE.</> : <>HOW IT<br />WORKS.</>}
            </h2>
          </div>

          <div className="col-span-12 md:col-span-8 mc-divide-border">
            <HowStep num="01" color="muted-2"
              title={language === "fr" ? "Remplissez le formulaire" : "Fill the form"}
              desc={language === "fr" ? "13 questions sur votre profil, projet, budget et besoins." : "13 questions about your profile, project, budget and needs."} />
            <HowStep num="02" color="muted-2"
              title={language === "fr" ? "Notre IA croise votre profil avec la base" : "Our AI cross-references your profile with the database"}
              desc={language === "fr"
                ? `Elle compare votre profil, votre discipline et votre budget aux ${grantsCount} aides répertoriées. Deadline, éligibilité, montant : chaque critère est vérifié.`
                : `It compares your profile, discipline and budget against our ${grantsCount} listed grants. Every criterion is checked.`} />
            <HowStep num="03" color="primary"
              title={language === "fr" ? "Recevez votre top 5 personnalisé" : "Receive your personalized top 5"}
              desc={language === "fr"
                ? "Vos matches s'affichent avec deadline, montant, éligibilité et lien direct vers le bon dossier. 100 % gratuit pendant la beta."
                : "Your matches appear with deadline, amount, eligibility and direct link. 100% free during beta."} />
          </div>
        </div>
      </section>

      {/* EXAMPLE */}
      <section id="example" className="mc-section-rule">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-24">
          <div className="grid grid-cols-12 gap-6 mb-10">
            <div className="col-span-12 md:col-span-4">
              <div className="mc-mono text-xs uppercase tracking-widest" style={{ color: "var(--mc-muted)" }}>/ 04</div>
              <h2 className="mc-display text-4xl md:text-5xl mt-4">
                {language === "fr" ? <>VOIR LE<br />MATCHING<br />EN ACTION.</> : <>SEE THE<br />MATCHING<br />IN ACTION.</>}
              </h2>
            </div>
            <div className="col-span-12 md:col-span-8 flex items-end">
              <p className="max-w-xl" style={{ color: "var(--mc-muted)" }}>
                {language === "fr"
                  ? "Un exemple réel : compagnie de théâtre contemporain, Lyon, création pluridisciplinaire, budget 45 k€."
                  : "A real example: contemporary theater company, Lyon, multidisciplinary creation, €45k budget."}
              </p>
            </div>
          </div>

          <div className="mc-card p-6 md:p-8 mb-6">
            <div className="mc-mono text-xs uppercase tracking-widest mb-3" style={{ color: "var(--mc-muted)" }}>
              INPUT · {language === "fr" ? "Décrivez votre projet" : "Describe your project"}
            </div>
            <p className="text-base md:text-lg italic leading-relaxed" style={{ color: "var(--mc-muted)" }}>
              {language === "fr"
                ? "« Je suis une compagnie de théâtre contemporain basée à Lyon. Nous préparons une création sur la mémoire collective qui mêle théâtre, vidéo et musique live. Budget estimé : 45 000 €. »"
                : "\"I'm a contemporary theater company based in Lyon. We're preparing a creation about collective memory that mixes theater, video and live music. Estimated budget: €45,000.\""}
            </p>
          </div>

          <div className="flex justify-center py-4">
            <div className="mc-mono text-xs uppercase tracking-widest" style={{ color: "var(--mc-muted)" }}>
              ── {language === "fr" ? "matching" : "matching"} ──
            </div>
          </div>

          <ExampleGrantCard language={language} />
        </div>
      </section>

      {/* BETA WAITLIST */}
      <BetaWaitlistSection language={language} grantsCount={grantsCount} />

      {/* COMING SOON */}
      <section className="mc-section-rule">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-24">
          <div className="grid grid-cols-12 gap-6 mb-10">
            <div className="col-span-12 md:col-span-4">
              <div className="mc-mono text-xs uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: "var(--mc-accent)" }}>
                <span className="mc-pulse-dot" style={{ background: "var(--mc-accent)" }} />
                / 05 — {language === "fr" ? "Bientôt disponible" : "Coming soon"}
              </div>
              <h2 className="mc-display text-4xl md:text-5xl">
                {language === "fr" ? (
                  <>TROUVEZ AUSSI<br /><span style={{ color: "var(--mc-accent)" }}>QUI REPRÉSENTE<br />VOTRE ART.</span></>
                ) : (
                  <>ALSO FIND<br /><span style={{ color: "var(--mc-accent)" }}>WHO REPRESENTS<br />YOUR ART.</span></>
                )}
              </h2>
            </div>
            <div className="col-span-12 md:col-span-8 flex items-end">
              <p className="max-w-2xl leading-relaxed" style={{ color: "var(--mc-muted)" }}>
                {language === "fr"
                  ? "Une subvention finance votre projet. Mais il vous faut aussi les bonnes personnes pour le représenter et le diffuser. Bientôt, Mecene vous connectera directement avec les professionnels de votre secteur."
                  : "A grant funds your project. But you also need the right people to represent and distribute it. Soon, Mecene will connect you directly with professionals in your field."}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              { icon: ImageIcon, label: language === "fr" ? "Galeries d'art" : "Art galleries", desc: language === "fr" ? "Par style, région et ouverture aux émergents" : "By style, region and openness to emerging artists" },
              { icon: Disc, label: language === "fr" ? "Labels & producteurs" : "Labels & producers", desc: language === "fr" ? "Par genre musical et type de contrat" : "By music genre and contract type" },
              { icon: BookOpen, label: language === "fr" ? "Maisons d'édition" : "Publishers", desc: language === "fr" ? "Par genre littéraire et politique éditoriale" : "By literary genre and editorial policy" },
              { icon: Users, label: language === "fr" ? "Agents & tourneurs" : "Agents & bookers", desc: language === "fr" ? "Par discipline et réseau de diffusion" : "By discipline and distribution network" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="mc-card p-6">
                  <Icon className="w-7 h-7 mb-4" style={{ color: "var(--mc-accent)" }} strokeWidth={1.5} />
                  <div className="font-bold mb-1">{item.label}</div>
                  <div className="text-sm" style={{ color: "var(--mc-muted)" }}>{item.desc}</div>
                </div>
              );
            })}
          </div>
          <p className="mt-8 text-sm italic" style={{ color: "var(--mc-muted-2)" }}>
            {language === "fr"
              ? "Le même matching IA que pour vos subventions, appliqué à l'écosystème artistique professionnel."
              : "The same AI matching as for your grants, applied to the professional artistic ecosystem."}
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mc-section-rule" style={{ background: "var(--mc-text)", color: "var(--mc-bg)" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-24 md:py-28 grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 md:col-span-9">
            <div className="mc-mono text-xs uppercase tracking-widest mb-6 md:mb-8" style={{ color: "rgba(0,0,0,0.5)" }}>
              / 06 — {language === "fr" ? "Commencer" : "Get started"}
            </div>
            <h2 className="mc-display text-[44px] sm:text-[64px] md:text-[128px]">
              {language === "fr" ? <>PRÊT ?<br />C'EST PARTI.</> : <>READY?<br />LET'S GO.</>}
            </h2>
          </div>
          <div className="col-span-12 md:col-span-3">
            <Link href="/form">
              <a
                className="block w-full text-center py-5 mc-mono text-sm uppercase tracking-widest rounded-full transition hover:bg-[var(--mc-primary)] hover:text-[var(--mc-bg)]"
                style={{ background: "var(--mc-bg)", color: "var(--mc-text)", textDecoration: "none" }}
              >
                {language === "fr" ? "Lancer le matching" : "Start matching"} →
              </a>
            </Link>
            <p className="mc-mono text-xs mt-4" style={{ color: "rgba(0,0,0,0.6)" }}>
              3 min · {language === "fr" ? "gratuit · sans CB" : "free · no credit card"}
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-10 mc-mono text-xs uppercase tracking-widest flex flex-wrap justify-between gap-4" style={{ color: "var(--mc-muted)" }}>
          <span>© 2026 Mecene</span>
          <span className="flex flex-wrap gap-4 md:gap-6">
            <Link href="/api-status"><a className="hover:text-white transition" data-testid="link-api-status">API status</a></Link>
            <a href="/api/example-pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white transition" data-testid="link-example-pdf">
              {language === "fr" ? "Exemple PDF" : "PDF example"}
            </a>
            <Link href="/data-quality"><a className="hover:text-white transition" data-testid="link-data-quality">
              {language === "fr" ? "Qualité des données" : "Data quality"}
            </a></Link>
            <Link href="/mentions-legales"><a className="hover:text-white transition">
              {language === "fr" ? "Mentions légales" : "Legal"}
            </a></Link>
            <Link href="/cgv"><a className="hover:text-white transition">CGV</a></Link>
            <Link href="/confidentialite"><a className="hover:text-white transition">{t.footerPrivacy}</a></Link>
          </span>
        </div>
      </footer>
    </div>
  );
}

/** Small helpers (local components) */
function ComparisonRow({ num, title, left, right, leftItalic }: {
  num: string; title: string;
  left: React.ReactNode; right: React.ReactNode;
  leftItalic?: boolean;
}) {
  return (
    <div className="mc-card overflow-hidden">
      <div className="mc-mono text-xs uppercase tracking-widest px-6 py-3 border-b" style={{ color: "var(--mc-muted)", borderColor: "var(--mc-border)" }}>
        {num} — {title}
      </div>
      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x" style={{ borderColor: "var(--mc-border)" }}>
        <div className="p-6">
          <div className="mc-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--mc-muted-2)" }}>Une IA généraliste</div>
          <p className={`text-sm leading-relaxed ${leftItalic ? "italic" : ""}`} style={{ color: "var(--mc-muted)" }}>{left}</p>
        </div>
        <div className="p-6" style={{ background: "var(--mc-primary-soft)" }}>
          <div className="flex items-center gap-2 mc-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--mc-primary)" }}>
            <span className="mc-pulse-dot" />
            Mecene
          </div>
          <p className="text-sm leading-relaxed">{right}</p>
        </div>
      </div>
    </div>
  );
}

function HowStep({ num, color, title, desc }: { num: string; color: "muted-2" | "primary"; title: string; desc: string }) {
  const c = color === "primary" ? "var(--mc-primary)" : "var(--mc-muted-2)";
  return (
    <div className="py-8 grid grid-cols-[auto_1fr] gap-6">
      <div className="mc-display text-6xl" style={{ color: c }}>{num}</div>
      <div>
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-lg leading-relaxed" style={{ color: "var(--mc-muted)" }}>{desc}</p>
      </div>
    </div>
  );
}
