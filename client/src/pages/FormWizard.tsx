import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formDataSchema, type FormData } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { trackFormStarted, trackFormSubmitted } from "@/lib/analytics";

const frenchRegions = [
  "Auvergne-Rhône-Alpes",
  "Bourgogne-Franche-Comté",
  "Bretagne",
  "Centre-Val de Loire",
  "Corse",
  "Grand Est",
  "Hauts-de-France",
  "Île-de-France",
  "Normandie",
  "Nouvelle-Aquitaine",
  "Occitanie",
  "Pays de la Loire",
  "Provence-Alpes-Côte d'Azur",
];

// Phrases rassurantes pour chaque question
const helpTexts = {
  status: {
    fr: "On demande ça pour trouver des aides adaptées à votre structure juridique. Pas de jugement, juste du matching intelligent.",
    en: "We ask this to find grants that match your legal structure. No judgment, just smart matching."
  },
  artisticDomain: {
    fr: "Votre discipline artistique nous aide à filtrer les 342 subventions. Les cases à cocher évitent les fautes de frappe.",
    en: "Your artistic discipline helps us filter the 342 grants. Checkboxes prevent typos."
  },
  projectDescription: {
    fr: "Quelques lignes suffisent. L'IA comprend le contexte, pas besoin d'un roman. Vos mots, votre style.",
    en: "A few lines are enough. The AI understands context, no need for a novel. Your words, your style."
  },
  projectType: {
    fr: "Création, production, résidence... Ça change tout niveau éligibilité. Plusieurs choix possibles, on sait que les projets sont hybrides.",
    en: "Creation, production, residency... It changes everything eligibility-wise. Multiple choices allowed, we know projects are hybrid."
  },
  projectStage: {
    fr: "Certaines aides ne financent que les projets naissants, d'autres préfèrent le concret. Soyez honnête, on est là pour matcher.",
    en: "Some grants only fund early-stage projects, others prefer concrete ones. Be honest, we're here to match."
  },
  region: {
    fr: "Beaucoup de subventions sont régionales. Votre localisation = des aides que d'autres n'ont pas. Géo-avantage.",
    en: "Many grants are regional. Your location = grants others don't have. Geo-advantage."
  },
  isInternational: {
    fr: "Les projets internationaux débloquent des budgets spécifiques. Oui/Non, simple et efficace.",
    en: "International projects unlock specific budgets. Yes/No, simple and effective."
  },
  innovation: {
    fr: "L'innovation débloque des financements tech, artistiques ou écolo. Si rien ne matche, skip et scrollez.",
    en: "Innovation unlocks tech, artistic or eco funding. If nothing matches, skip and scroll."
  },
  socialDimension: {
    fr: "Inclusion, éducation, territoire... Les projets à impact social ont leurs propres lignes budgétaires. Optionnel, mais puissant.",
    en: "Inclusion, education, territory... Social impact projects have their own budgets. Optional, but powerful."
  },
  urgency: {
    fr: "Les deadlines des aides varient. Votre timing nous aide à prioriser les subventions encore ouvertes.",
    en: "Grant deadlines vary. Your timing helps us prioritize open grants."
  },
  aidTypes: {
    fr: "Subvention cash, résidence logée, accompagnement... Chaque type a ses avantages. Cochez ce qui vous intéresse.",
    en: "Cash grant, residency, mentoring... Each type has advantages. Check what interests you."
  },
  geographicScope: {
    fr: "Local, national, européen... L'échelle de votre projet ouvre des portes différentes. Pensez grand ou petit, les deux marchent.",
    en: "Local, national, European... Your project's scale opens different doors. Think big or small, both work."
  },
  email: {
    fr: "Votre email pour recevoir les résultats. On ne spam pas, on ne revend rien. Juste vos subventions matchées, point.",
    en: "Your email to receive results. We don't spam, we don't sell. Just your matched grants, period."
  }
};

export default function FormWizard() {
  const { language, t } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isExtended, setIsExtended] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Analytics: track que l'utilisateur a ouvert le formulaire
  useEffect(() => { trackFormStarted(); }, []);

  // Extraire le paramètre domain de l'URL
  const urlParams = new URLSearchParams(window.location.search);
  const domainParam = urlParams.get('domain') || '';
  
  // États pour les questions optionnelles dépliables
  const [showInnovation, setShowInnovation] = useState(false);
  const [showSocial, setShowSocial] = useState(false);
  const [showUrgency, setShowUrgency] = useState(false);
  const [showProjectStage, setShowProjectStage] = useState(false);
  const [showAidTypes, setShowAidTypes] = useState(false);
  const [showScope, setShowScope] = useState(false);
  
  // États pour dérouler les options supplémentaires
  const [showMoreStatus, setShowMoreStatus] = useState(false);
  const [showMoreDomain, setShowMoreDomain] = useState(false);
  const [showMoreType, setShowMoreType] = useState(false);
  
  // Toasts déjà affichés pour éviter les doublons
  const [shownToasts, setShownToasts] = useState<Set<string>>(new Set());

  const form = useForm<FormData>({
    resolver: zodResolver(formDataSchema),
    mode: "onChange",
    defaultValues: {
      status: [],
      statusOther: "",
      artisticDomain: [],
      artisticDomainOther: "",
      projectDescription: "",
      projectType: [],
      projectTypeOther: "",
      projectStage: "",
      region: "Île-de-France",
      isInternational: "",
      innovation: [],
      innovationOther: "",
      socialDimension: [],
      socialDimensionOther: "",
      urgency: "",
      aidTypes: [],
      aidTypesOther: "",
      geographicScope: [],
      email: "",
    },
  });

  // Tags suggérés par domaine artistique - basés sur les termes réels des subventions
  const tagsByDomain: Record<string, { fr: string[], en: string[] }> = {
    musique: {
      fr: ["album", "EP", "concert", "tournée", "festival", "enregistrement", "studio", "mixage", "mastering", "composition", "arrangement", "clip", "live", "streaming", "résidence musicale", "coproduction", "diffusion", "label", "production", "showcase"],
      en: ["album", "EP", "concert", "tour", "festival", "recording", "studio", "mixing", "mastering", "composition", "arrangement", "music video", "live", "streaming", "musical residency", "coproduction", "distribution", "label", "production", "showcase"]
    },
    ecriture: {
      fr: ["roman", "nouvelle", "essai", "poésie", "BD", "bande dessinée", "scénario", "théâtre", "biographie", "récit", "publication", "édition", "manuscrit", "écriture", "livre", "ouvrage", "traduction", "résidence d'écriture", "atelier d'écriture", "prix littéraire"],
      en: ["novel", "short story", "essay", "poetry", "comic", "graphic novel", "screenplay", "theater", "biography", "narrative", "publication", "publishing", "manuscript", "writing", "book", "work", "translation", "writing residency", "writing workshop", "literary prize"]
    },
    "arts-plastiques": {
      fr: ["exposition", "installation", "peinture", "sculpture", "photographie", "art contemporain", "galerie", "vernissage", "œuvre", "série", "catalogue", "commissariat", "résidence artistique", "atelier", "plasticien", "création", "art visuel", "performance", "collection", "biennale"],
      en: ["exhibition", "installation", "painting", "sculpture", "photography", "contemporary art", "gallery", "opening", "artwork", "series", "catalog", "curating", "artistic residency", "studio", "visual artist", "creation", "visual art", "performance", "collection", "biennial"]
    },
    "spectacle-vivant": {
      fr: ["spectacle", "théâtre", "mise en scène", "représentation", "tournée", "création scénique", "compagnie", "festival", "résidence", "atelier", "masterclass", "diffusion", "scène", "troupe", "danse", "cirque", "marionnettes", "arts de la rue", "performance", "dramaturgie"],
      en: ["show", "theater", "staging", "performance", "tour", "stage creation", "company", "festival", "residency", "workshop", "masterclass", "distribution", "stage", "troupe", "dance", "circus", "puppetry", "street arts", "performance", "dramaturgy"]
    },
    audiovisuel: {
      fr: ["film", "documentaire", "court-métrage", "long-métrage", "réalisation", "production", "scénario", "tournage", "montage", "post-production", "festival", "diffusion", "animation", "web-série", "podcast", "vidéo", "image", "son", "cinéma", "création audiovisuelle"],
      en: ["film", "documentary", "short film", "feature film", "directing", "production", "screenplay", "shooting", "editing", "post-production", "festival", "distribution", "animation", "web series", "podcast", "video", "image", "sound", "cinema", "audiovisual creation"]
    },
    "arts-numeriques": {
      fr: ["art numérique", "installation interactive", "réalité virtuelle", "VR", "AR", "réalité augmentée", "jeu vidéo", "création numérique", "média art", "web art", "net art", "vidéo mapping", "son interactif", "performance numérique", "intelligence artificielle", "IA", "NFT", "blockchain", "métavers", "création digitale"],
      en: ["digital art", "interactive installation", "virtual reality", "VR", "AR", "augmented reality", "video game", "digital creation", "media art", "web art", "net art", "video mapping", "interactive sound", "digital performance", "artificial intelligence", "AI", "NFT", "blockchain", "metaverse", "digital creation"]
    },
    patrimoine: {
      fr: ["restauration", "conservation", "patrimoine culturel", "monument historique", "valorisation", "sauvegarde", "rénovation", "inventaire", "archive", "collection", "musée", "médiation culturelle", "transmission", "mémoire", "patrimoine matériel", "patrimoine immatériel", "site culturel", "histoire", "tradition", "exposition patrimoniale"],
      en: ["restoration", "conservation", "cultural heritage", "historical monument", "enhancement", "preservation", "renovation", "inventory", "archive", "collection", "museum", "cultural mediation", "transmission", "memory", "tangible heritage", "intangible heritage", "cultural site", "history", "tradition", "heritage exhibition"]
    }
  };

  // Récupérer les tags contextuels selon le domaine sélectionné
  const getContextualTags = () => {
    if (domainParam && tagsByDomain[domainParam]) {
      return tagsByDomain[domainParam][language as 'fr' | 'en'];
    }
    // Tags génériques si pas de domaine spécifié
    return [
      ...(tagsByDomain.musique[language as 'fr' | 'en'].slice(0, 5)),
      ...(tagsByDomain.ecriture[language as 'fr' | 'en'].slice(0, 5)),
      ...(tagsByDomain['arts-plastiques'][language as 'fr' | 'en'].slice(0, 5)),
      ...(tagsByDomain['spectacle-vivant'][language as 'fr' | 'en'].slice(0, 5))
    ];
  };

  const suggestedTags = getContextualTags();

  const [suggestedTagsVisible, setSuggestedTagsVisible] = useState<string[]>([]);
  const projectDescription = form.watch("projectDescription");

  // Pré-remplir le domaine artistique selon le paramètre URL
  useEffect(() => {
    if (domainParam) {
      // Mapper les paramètres URL vers les valeurs du formulaire
      const domainMapping: Record<string, string> = {
        'musique': 'musique',
        'ecriture': 'ecriture',
        'arts-plastiques': 'arts-plastiques',
        'spectacle-vivant': 'spectacle-vivant',
        'audiovisuel': 'audiovisuel',
        'arts-numeriques': 'arts-numeriques',
        'patrimoine': 'patrimoine'
      };
      
      const mappedDomain = domainMapping[domainParam];
      if (mappedDomain) {
        form.setValue('artisticDomain', [mappedDomain]);
      }
    }
  }, [domainParam, form]);

  const submitMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/submit-form", data);
      return response.json();
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

  const totalSteps = isExtended ? 7 : 6;
  // Steps: 0=Statut, 1=Domaine, 2=Description, 3=Type, 4=Région, 5=Email+Submit, 6=OptionalExtended

  // Detect scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const scrollTop = containerRef.current.scrollTop;
      const sectionHeight = window.innerHeight;
      const rawStep = Math.round(scrollTop / sectionHeight);
      
      // Limiter strictement entre 0 et totalSteps - 1
      const newStep = Math.max(0, Math.min(rawStep, totalSteps - 1));
      
      if (newStep !== currentStep) {
        setCurrentStep(newStep);
        // Déclenche le mode étendu dès qu'on dépasse l'étape email (5)
        if (newStep >= 5 && !isExtended) {
          setIsExtended(true);
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [currentStep, totalSteps, isExtended]);

  const onSubmit = async (data: FormData) => {
    console.log("🚀 Soumission du formulaire:", data);
    trackFormSubmitted({
      artisticDomain: data.artisticDomain?.join(", "),
      region: data.region,
    });
    submitMutation.mutate(data);
  };

  // Log des erreurs de validation (seulement les clés pour éviter les références circulaires)
  const errors = form.formState.errors;
  if (Object.keys(errors).length > 0) {
    const errorKeys = Object.keys(errors);
    const errorMessages = errorKeys.map(key => `${key}: ${(errors as any)[key]?.message || 'invalide'}`);
    console.log("❌ Erreurs de validation:", errorMessages.join(", "));
  }

  const status = form.watch("status");
  const artisticDomain = form.watch("artisticDomain");
  const projectType = form.watch("projectType");
  const projectStage = form.watch("projectStage");
  const region = form.watch("region");
  const innovation = form.watch("innovation");
  const socialDimension = form.watch("socialDimension");
  const urgency = form.watch("urgency");
  const aidTypes = form.watch("aidTypes");
  const geographicScope = form.watch("geographicScope");

  const helpTextKeys = ["status", "artisticDomain", "projectDescription", "projectType", "projectStage", "region", "isInternational", "innovation", "socialDimension", "urgency", "aidTypes", "geographicScope", "email"] as const;

  // Nombre réel de subventions actives (fetch au mount)
  const [totalGrants, setTotalGrants] = useState(264);
  useEffect(() => {
    fetch("/api/grants/stats")
      .then(r => r.json())
      .then(d => { if (d?.total) setTotalGrants(d.total); })
      .catch(() => { /* fallback: keep 264 */ });
  }, []);

  const grantCount = totalGrants;

  // Fonction de gamification - Affiche un toast encourageant selon le choix
  const showUnlockToast = (choice: string, field: string) => {
    const toastKey = `${field}-${choice}`;
    
    // Éviter les doublons
    if (shownToasts.has(toastKey)) return;
    
    // Messages de gamification (désactivés — les chiffres hardcoded
    // étaient potentiellement trompeurs vs la vraie DB)
    const unlockMessages: Record<string, { fr: { title: string; description: string }, en: { title: string; description: string } }> = {};

    const message = unlockMessages[toastKey];
    if (message) {
      const content = language === 'fr' ? message.fr : message.en;
      toast({
        title: content.title,
        description: content.description,
        duration: 2500,
      });
      
      // Marquer comme affiché
      setShownToasts(prev => new Set(prev).add(toastKey));
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 overflow-hidden">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-8 py-6 bg-white shadow-sm">
        <div className="flex flex-col items-center gap-4 max-w-6xl mx-auto w-full">
          <div className="flex flex-col items-center gap-1">
            <a href="/" className="text-xl font-light tracking-tight text-black" data-testid="link-home">
              Subvention<span className="font-bold">Match</span>
            </a>
            <motion.span 
              key={grantCount}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-xs text-gray-400 font-medium tracking-wide"
            >
              {language === "fr" 
                ? `${grantCount} subvention${grantCount > 1 ? 's' : ''} disponible${grantCount > 1 ? 's' : ''}` 
                : `${grantCount} grant${grantCount > 1 ? 's' : ''} available`}
            </motion.span>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center justify-center gap-3 relative w-full max-w-md mx-auto">
            {Array.from({ length: totalSteps }).map((_, index) => (
                <motion.div
                  key={index}
                  className="relative"
                  initial={index > 5 ? { opacity: 0, scale: 0 } : false}
                  animate={{
                    scale: currentStep === index ? 1.5 : 1,
                    opacity: 1,
                  }}
                  transition={
                    index > 5 && isExtended
                      ? {
                          opacity: { duration: 0.3, delay: (index - 6) * 0.1 },
                          scale: {
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                            delay: (index - 6) * 0.1,
                          },
                        }
                      : {
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        }
                  }
                >
                  <div 
                    className={`rounded-full transition-colors ${
                      currentStep === index 
                        ? 'bg-black' 
                        : currentStep > index 
                          ? 'bg-black/60' 
                          : 'bg-black/20'
                    }`}
                    style={{
                      width: index > 5 ? `${Math.max(4, 8 - (index - 5) * 1)}px` : '8px',
                      height: index > 5 ? `${Math.max(4, 8 - (index - 5) * 1)}px` : '8px',
                    }}
                  />
                </motion.div>
            ))}
            
            {/* Bouton rond de validation au bout de la timeline - uniquement quand étendu */}
            <AnimatePresence>
              {isExtended && (
                <motion.button
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={submitMutation.isPending}
                  className="bg-black text-white rounded-full hover:bg-gray-800 transition-all shadow-lg hover:scale-110 active:scale-95 flex items-center justify-center ml-2"
                  style={{
                    width: '32px',
                    height: '32px',
                  }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ 
                    duration: 0.3,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                  data-testid="button-timeline-submit"
                >
                  {submitMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span className="text-sm font-bold">✓</span>
                  )}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Scroll Hint - Centered */}
      {currentStep < totalSteps - 1 && (
        <motion.div
          className="fixed bottom-8 left-0 right-0 z-40 pointer-events-none"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="flex flex-col items-center gap-2 text-gray-400 max-w-7xl mx-auto">
            <span className="text-xs uppercase tracking-widest">
              {language === "fr" ? "Scroll" : "Scroll"}
            </span>
            <ChevronDown className="h-5 w-5 animate-bounce" />
          </div>
        </motion.div>
      )}


      {/* Scrollable Container with Snap */}
      <div 
        ref={containerRef}
        className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth"
      >
        {/* Section 1: Status */}
        <section className="h-screen snap-start snap-always flex items-start justify-center px-8 pt-32 pb-16 w-full max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-6xl w-full flex flex-col items-center"
              >
                {/* Question - Centré */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-8 w-full max-w-2xl"
                >
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-black">
                    {language === "fr" ? "Quel est votre statut ?" : "What is your status?"}
                  </h2>
                  
                  <div className="space-y-3">
                    {/* Top 3 choices */}
                    {["porteur-projet", "artiste-auteur", "association"].map((item, idx) => (
                      <motion.label
                        key={item}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 + idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                        className="flex items-center gap-4 p-4 bg-white border border-gray-200 hover:border-black cursor-pointer transition-all group"
                        data-testid={`checkbox-status-${item}`}
                      >
                        <Checkbox
                          checked={status?.includes(item)}
                          onCheckedChange={(checked) => {
                            const newValue = checked ? [...(status || []), item] : status?.filter((value) => value !== item) || [];
                            form.setValue("status", newValue, { shouldValidate: true });
                            
                            // Gamification toast
                            if (checked) {
                              showUnlockToast(item, 'status');
                            }
                          }}

                        />
                        <span className="text-base font-medium text-black group-hover:translate-x-1 transition-transform">
                          {item === "porteur-projet" && t.porteurProjet}
                          {item === "artiste-auteur" && t.artisteAuteur}
                          {item === "association" && t.association}
                        </span>
                      </motion.label>
                    ))}
                    
                    {/* Additional options */}
                    <AnimatePresence>
                      {showMoreStatus && (
                        <>
                          {["artiste-auto", "micro-entreprise", "collectif"].map((item, idx) => (
                            <motion.label
                              key={item}
                              initial={{ opacity: 0, height: 0, y: -10 }}
                              animate={{ opacity: 1, height: "auto", y: 0 }}
                              exit={{ opacity: 0, height: 0, y: -10 }}
                              transition={{ duration: 0.3, delay: idx * 0.05 }}
                              className="flex items-center gap-4 p-4 bg-white border border-gray-200 hover:border-black cursor-pointer transition-all group"
                              data-testid={`checkbox-status-${item}`}
                            >
                              <Checkbox
                                checked={status?.includes(item)}
                                onCheckedChange={(checked) => {
                                  const newValue = checked ? [...(status || []), item] : status?.filter((value) => value !== item) || [];
                                  form.setValue("status", newValue, { shouldValidate: true });
                                  
                                  // Gamification toast
                                  if (checked) {
                                    showUnlockToast(item, 'status');
                                  }
                                }}
                              />
                              <span className="text-base font-medium text-black group-hover:translate-x-1 transition-transform">
                                {item === "artiste-auto" && t.artisteAutoEntrepreneur}
                                {item === "micro-entreprise" && t.microEntreprise}
                                {item === "collectif" && t.collectif}
                              </span>
                            </motion.label>
                          ))}
                        </>
                      )}
                    </AnimatePresence>
                    
                    {/* Show more button */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowMoreStatus(!showMoreStatus)}
                        className="w-full text-sm text-gray-500 hover:text-black"
                      >
                        {showMoreStatus 
                          ? (language === "fr" ? "Voir moins d'options" : "See fewer options")
                          : (language === "fr" ? "Voir plus d'options" : "See more options")
                        }
                        <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${showMoreStatus ? 'rotate-180' : ''}`} />
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Help Text - En bas */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-12 max-w-2xl w-full text-center space-y-4"
                >
                  <p className="text-base text-gray-600 leading-relaxed">
                    {helpTexts.status[language as 'fr' | 'en']}
                  </p>
                  <p className="text-sm text-gray-400">
                    {language === "fr" ? "🔒 Vos données restent privées" : "🔒 Your data stays private"}
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Section 2: Artistic Domain (NEW) */}
        <section className="h-screen snap-start snap-always flex items-start justify-center px-8 pt-32 pb-16 w-full max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step-1-domain"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-6xl w-full flex flex-col items-center"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-8 w-full max-w-2xl"
                >
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-black">
                    {language === "fr" ? "Votre domaine artistique ?" : "Your artistic domain?"}
                  </h2>

                  <div className="space-y-3">
                    {/* Top 3 choices */}
                    {["musique", "arts-plastiques", "spectacle-vivant"].map((item, idx) => (
                      <motion.label
                        key={item}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 + idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                        className="flex items-center gap-4 p-4 bg-white border border-gray-200 hover:border-black cursor-pointer transition-all group"
                        data-testid={`checkbox-domain-${item}`}
                      >
                        <Checkbox
                          checked={artisticDomain?.includes(item)}
                          onCheckedChange={(checked) => {
                            const newValue = checked ? [...(artisticDomain || []), item] : artisticDomain?.filter((value) => value !== item) || [];
                            form.setValue("artisticDomain", newValue, { shouldValidate: true });
                          }}
                        />
                        <span className="text-base font-medium text-black group-hover:translate-x-1 transition-transform">
                          {item === "musique" && t.musique}
                          {item === "arts-plastiques" && t.artsPlastiques}
                          {item === "spectacle-vivant" && t.spectacleVivant}
                        </span>
                      </motion.label>
                    ))}

                    {/* Additional options */}
                    <AnimatePresence>
                      {showMoreDomain && (
                        <>
                          {["ecriture", "audiovisuel", "arts-numeriques", "patrimoine"].map((item, idx) => (
                            <motion.label
                              key={item}
                              initial={{ opacity: 0, height: 0, y: -10 }}
                              animate={{ opacity: 1, height: "auto", y: 0 }}
                              exit={{ opacity: 0, height: 0, y: -10 }}
                              transition={{ duration: 0.3, delay: idx * 0.05 }}
                              className="flex items-center gap-4 p-4 bg-white border border-gray-200 hover:border-black cursor-pointer transition-all group"
                              data-testid={`checkbox-domain-${item}`}
                            >
                              <Checkbox
                                checked={artisticDomain?.includes(item)}
                                onCheckedChange={(checked) => {
                                  const newValue = checked ? [...(artisticDomain || []), item] : artisticDomain?.filter((value) => value !== item) || [];
                                  form.setValue("artisticDomain", newValue, { shouldValidate: true });
                                }}
                              />
                              <span className="text-base font-medium text-black group-hover:translate-x-1 transition-transform">
                                {item === "ecriture" && t.ecriture}
                                {item === "audiovisuel" && t.audiovisuel}
                                {item === "arts-numeriques" && t.artsNumeriques}
                                {item === "patrimoine" && t.patrimoine}
                              </span>
                            </motion.label>
                          ))}
                        </>
                      )}
                    </AnimatePresence>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowMoreDomain(!showMoreDomain)}
                        className="w-full text-sm text-gray-500 hover:text-black"
                      >
                        {showMoreDomain
                          ? (language === "fr" ? "Voir moins d'options" : "See fewer options")
                          : (language === "fr" ? "Voir plus d'options" : "See more options")
                        }
                        <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${showMoreDomain ? 'rotate-180' : ''}`} />
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-12 max-w-2xl w-full text-center space-y-4"
                >
                  <p className="text-base text-gray-600 leading-relaxed">
                    {helpTexts.artisticDomain[language as 'fr' | 'en']}
                  </p>
                  <p className="text-sm text-gray-400">
                    {language === "fr" ? "🔒 Vos données restent privées" : "🔒 Your data stays private"}
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Section 3: Project Description */}
        <section className="h-screen snap-start snap-always flex items-start justify-center px-8 pt-32 pb-16 w-full max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {currentStep === 2 && (
              <motion.div
                key="step-2-desc"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-6xl w-full flex flex-col items-center"
              >
                {/* Question - Centré */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-8 w-full max-w-2xl"
                >
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-black">
                    {language === "fr" ? "Décrivez votre projet" : "Describe your project"}
                  </h2>
                  
                  <div className="space-y-4">
                    <Textarea
                      value={projectDescription || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        form.setValue("projectDescription", value, { shouldValidate: true });
                        
                        // Générer des suggestions basées sur le texte
                        const text = value.toLowerCase();
                        
                        // Afficher les tags qui ne sont pas déjà dans le texte
                        const relevant = suggestedTags.filter((tag: string) => 
                          !text.includes(tag.toLowerCase()) && 
                          text.length > 5 // Seulement si l'utilisateur a tapé quelque chose
                        ).slice(0, 6); // Max 6 suggestions
                        
                        setSuggestedTagsVisible(relevant);
                      }}
                      placeholder={language === "fr" ? "Quelques mots suffisent..." : "A few words are enough..."}
                      className="w-full min-h-[200px] text-lg p-4 bg-white backdrop-blur-sm border-gray-200 text-black placeholder:text-gray-400 resize-none"
                      data-testid="textarea-project-description"
                    />
                    
                    {/* Tags suggérés */}
                    {suggestedTagsVisible.length > 0 && projectDescription && projectDescription.length > 5 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-wrap gap-2"
                      >
                        <span className="text-xs text-gray-400 w-full mb-1">
                          {language === "fr" ? "Suggestions :" : "Suggestions:"}
                        </span>
                        {suggestedTagsVisible.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              const currentText = form.getValues("projectDescription");
                              const newText = currentText ? `${currentText} ${tag}` : tag;
                              form.setValue("projectDescription", newText);
                              
                              // Retirer le tag des suggestions
                              setSuggestedTagsVisible(prev => prev.filter(t => t !== tag));
                            }}
                            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-[#06D6A0] hover:text-white text-gray-700 rounded-full transition-all border border-gray-200 hover:border-[#06D6A0]"
                            data-testid={`tag-${tag}`}
                          >
                            + {tag}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                {/* Help Text - En bas */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-12 max-w-2xl w-full text-center space-y-4"
                >
                  <p className="text-base text-gray-600 leading-relaxed">
                    {helpTexts.projectDescription[language as 'fr' | 'en']}
                  </p>
                  <p className="text-sm text-gray-400">
                    {language === "fr" ? "🔒 Vos données restent privées" : "🔒 Your data stays private"}
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Section 4: Project Type */}
        <section className="h-screen snap-start snap-always flex items-start justify-center px-8 pt-32 pb-16 w-full max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {currentStep === 3 && (
              <motion.div
                key="step-3-type"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-6xl w-full flex flex-col items-center"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-8 w-full max-w-2xl"
                >
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-black">
                    {language === "fr" ? "Type de projet ?" : "Project type?"}
                  </h2>
                  
                  <div className="space-y-3">
                    {/* Top 3 choices */}
                    {["creation", "production", "diffusion"].map((item, idx) => (
                      <motion.label
                        key={item}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 + idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                        className="flex items-center gap-4 p-4 bg-white border border-gray-200 hover:border-black cursor-pointer transition-all group"
                        data-testid={`checkbox-type-${item}`}
                      >
                        <Checkbox
                          checked={projectType?.includes(item)}
                          onCheckedChange={(checked) => {
                            const newValue = checked ? [...(projectType || []), item] : projectType?.filter((value) => value !== item) || [];
                            form.setValue("projectType", newValue, { shouldValidate: true });
                          }}

                        />
                        <span className="text-base font-medium text-black group-hover:translate-x-1 transition-transform">
                          {item === "creation" && (language === "fr" ? "Création" : "Creation")}
                          {item === "production" && (language === "fr" ? "Production" : "Production")}
                          {item === "diffusion" && (language === "fr" ? "Diffusion" : "Distribution")}
                        </span>
                      </motion.label>
                    ))}
                    
                    {/* Additional options */}
                    <AnimatePresence>
                      {showMoreType && (
                        <>
                          {["residence", "formation"].map((item, idx) => (
                            <motion.label
                              key={item}
                              initial={{ opacity: 0, height: 0, y: -10 }}
                              animate={{ opacity: 1, height: "auto", y: 0 }}
                              exit={{ opacity: 0, height: 0, y: -10 }}
                              transition={{ duration: 0.3, delay: idx * 0.05 }}
                              className="flex items-center gap-4 p-4 bg-white border border-gray-200 hover:border-black cursor-pointer transition-all group"
                              data-testid={`checkbox-type-${item}`}
                            >
                              <Checkbox
                                checked={projectType?.includes(item)}
                                onCheckedChange={(checked) => {
                                  const newValue = checked ? [...(projectType || []), item] : projectType?.filter((value) => value !== item) || [];
                                  form.setValue("projectType", newValue, { shouldValidate: true });
                                }}
                              />
                              <span className="text-base font-medium text-black group-hover:translate-x-1 transition-transform">
                                {item === "residence" && (language === "fr" ? "Résidence" : "Residency")}
                                {item === "formation" && (language === "fr" ? "Formation" : "Training")}
                              </span>
                            </motion.label>
                          ))}
                        </>
                      )}
                    </AnimatePresence>
                    
                    {/* Show more button */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowMoreType(!showMoreType)}
                        className="w-full text-sm text-gray-500 hover:text-black"
                      >
                        {showMoreType 
                          ? (language === "fr" ? "Voir moins d'options" : "See fewer options")
                          : (language === "fr" ? "Voir plus d'options" : "See more options")
                        }
                        <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${showMoreType ? 'rotate-180' : ''}`} />
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-12 max-w-2xl w-full text-center space-y-4"
                >
                  <p className="text-base text-gray-600 leading-relaxed">
                    {helpTexts.projectType[language as 'fr' | 'en']}
                  </p>
                  <p className="text-sm text-gray-400">
                    {language === "fr" ? "🔒 Vos données restent privées" : "🔒 Your data stays private"}
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Section 5: Région */}
        <section className="h-screen snap-start snap-always flex items-start justify-center px-8 pt-32 pb-16 w-full max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {currentStep === 4 && (
              <motion.div
                key="step-4-region"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-6xl w-full flex flex-col items-center"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-8 w-full max-w-2xl"
                >
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-black">
                    {language === "fr" ? "Région ?" : "Region?"}
                  </h2>
                  
                  <Select
                    value={form.watch("region")}
                    onValueChange={(value) => form.setValue("region", value, { shouldValidate: true })}
                  >
                    <SelectTrigger 
                      className="w-full text-lg px-6 py-6 bg-white border-2 border-gray-200 focus:border-black text-black h-auto"
                      data-testid="select-region"
                    >
                      <SelectValue placeholder={language === "fr" ? "Sélectionnez votre région" : "Select your region"} />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {frenchRegions.map((region) => (
                        <SelectItem 
                          key={region} 
                          value={region}
                          className="text-base py-3 cursor-pointer hover:bg-gray-100"
                        >
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-12 max-w-2xl w-full text-center space-y-4"
                >
                  <p className="text-base text-gray-600 leading-relaxed">
                    {helpTexts.region[language as 'fr' | 'en']}
                  </p>
                  <p className="text-sm text-gray-400">
                    {language === "fr" ? "🔒 Vos données restent privées" : "🔒 Your data stays private"}
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Section 6: Email + Submit (always accessible, extended mode shows optional questions after) */}
        <section className="h-screen snap-start snap-always flex items-start justify-center px-8 pt-32 pb-16 w-full max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {currentStep === 5 && (
              <motion.div
                key="step-5-email"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-2xl w-full mx-auto text-center"
              >
                <motion.h2
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-black mb-6"
                >
                  {language === "fr" ? "Votre email ?" : "Your email?"}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-lg text-gray-600 mb-8"
                >
                  {language === "fr"
                    ? "Pour recevoir votre PDF personnalisé avec toutes les subventions matchées."
                    : "To receive your personalized PDF with all matched grants."
                  }
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="mb-6"
                >
                  <Input
                    {...form.register("email")}
                    type="email"
                    placeholder={language === "fr" ? "votre@email.com" : "your@email.com"}
                    className="w-full text-lg px-8 py-6 bg-white border-2 border-gray-200 focus:border-black text-black placeholder:text-gray-400 rounded-full text-center"
                    data-testid="input-email"
                  />
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="text-sm text-gray-400 leading-relaxed mb-8 max-w-md mx-auto"
                >
                  {language === "fr"
                    ? "🔒 Vos données restent privées. Pas de spam."
                    : "🔒 Your data stays private. No spam."
                  }
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center gap-4"
                >
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      const formErrors = form.formState.errors;
                      if (Object.keys(formErrors).length > 0) {
                        toast({
                          title: language === "fr" ? "Formulaire incomplet" : "Incomplete form",
                          description: language === "fr"
                            ? "Veuillez remplir tous les champs obligatoires"
                            : "Please fill all required fields",
                          variant: "destructive",
                          duration: 2500,
                        });
                        return;
                      }
                      form.handleSubmit(onSubmit)();
                    }}
                    disabled={submitMutation.isPending}
                    className="px-12 py-5 bg-[#06D6A0] hover:bg-[#06D6A0]/90 text-white font-bold text-lg rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid="button-submit-early"
                  >
                    {submitMutation.isPending ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>{language === "fr" ? "Analyse en cours..." : "Analyzing..."}</span>
                      </div>
                    ) : (
                      language === "fr" ? "Voir mes résultats" : "See my results"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!isExtended) setIsExtended(true);
                      // Smooth scroll to next section
                      setTimeout(() => {
                        if (containerRef.current) {
                          containerRef.current.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
                        }
                      }, 100);
                    }}
                    className="text-sm text-gray-500 hover:text-black underline underline-offset-4"
                    data-testid="button-refine"
                  >
                    {language === "fr" ? "Ou affiner avec des questions optionnelles ↓" : "Or refine with optional questions ↓"}
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>


        {/* Section 7: Questions optionnelles (toutes sur une page avec toggles) */}
        {isExtended && (
        <section className="min-h-screen snap-start snap-always flex items-start justify-center px-8 pt-32 pb-16 bg-gray-50 relative w-full max-w-7xl mx-auto">
          <motion.div
            key="step-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl w-full space-y-12 py-20"
          >
            <motion.h2
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-black text-center mb-12 bg-white px-8 py-6 rounded-lg shadow-sm"
            >
              {language === "fr" ? "Questions optionnelles" : "Optional questions"}
            </motion.h2>

            {/* Innovation */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setShowInnovation(!showInnovation)}
                className="w-full text-left p-6 hover:bg-gray-50 transition-colors flex items-center justify-between group"
                data-testid="toggle-innovation"
              >
                <h3 className="text-2xl font-bold text-black group-hover:text-indigo-600 transition-colors">
                  {language === "fr" ? "Innovation ?" : "Innovation?"}
                </h3>
                <span className="text-2xl text-gray-400 group-hover:text-indigo-600 transition-all transform group-hover:scale-110">
                  {showInnovation ? "−" : "+"}
                </span>
              </button>
              <AnimatePresence>
                {showInnovation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3 px-6 pb-6"
                  >
                    {["numerique", "technologique", "sociale", "artistique"].map((item) => (
                      <label
                        key={item}
                        className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 hover:border-black cursor-pointer transition-all group rounded-lg"
                        data-testid={`checkbox-innovation-${item}`}
                      >
                        <Checkbox
                          checked={innovation?.includes(item) ?? false}
                          onCheckedChange={(checked) => {
                            const currentValue = innovation ?? [];
                            const newValue = checked ? [...currentValue, item] : currentValue.filter((value) => value !== item);
                            form.setValue("innovation", newValue, { shouldValidate: true });
                            
                            // Gamification toast
                            if (checked) {
                              showUnlockToast(item, 'innovation');
                            }
                          }}

                        />
                        <span className="text-base font-medium text-black">
                          {item === "numerique" && (language === "fr" ? "Numérique" : "Digital")}
                          {item === "technologique" && (language === "fr" ? "Technologique" : "Technological")}
                          {item === "sociale" && (language === "fr" ? "Sociale" : "Social")}
                          {item === "artistique" && (language === "fr" ? "Artistique" : "Artistic")}
                        </span>
                      </label>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dimension sociale */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setShowSocial(!showSocial)}
                className="w-full text-left p-6 hover:bg-gray-50 transition-colors flex items-center justify-between group"
                data-testid="toggle-social"
              >
                <h3 className="text-2xl font-bold text-black group-hover:text-indigo-600 transition-colors">
                  {language === "fr" ? "Dimension sociale ?" : "Social dimension?"}
                </h3>
                <span className="text-2xl text-gray-400 group-hover:text-indigo-600 transition-all transform group-hover:scale-110">
                  {showSocial ? "−" : "+"}
                </span>
              </button>
              <AnimatePresence>
                {showSocial && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3 px-6 pb-6"
                  >
                    {["inclusion", "accessibilite", "education", "environnement"].map((item) => (
                      <label
                        key={item}
                        className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 hover:border-black cursor-pointer transition-all group rounded-lg"
                        data-testid={`checkbox-social-${item}`}
                      >
                        <Checkbox
                          checked={socialDimension?.includes(item)}
                          onCheckedChange={(checked) => {
                            const newValue = checked ? [...(socialDimension || []), item] : socialDimension?.filter((value) => value !== item) || [];
                            form.setValue("socialDimension", newValue, { shouldValidate: true });
                          }}

                        />
                        <span className="text-base font-medium text-black">
                          {item === "inclusion" && (language === "fr" ? "Inclusion" : "Inclusion")}
                          {item === "accessibilite" && (language === "fr" ? "Accessibilité" : "Accessibility")}
                          {item === "education" && (language === "fr" ? "Éducation" : "Education")}
                          {item === "environnement" && (language === "fr" ? "Environnement" : "Environment")}
                        </span>
                      </label>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Urgence */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setShowUrgency(!showUrgency)}
                className="w-full text-left p-6 hover:bg-gray-50 transition-colors flex items-center justify-between group"
                data-testid="toggle-urgency"
              >
                <h3 className="text-2xl font-bold text-black group-hover:text-indigo-600 transition-colors">
                  {language === "fr" ? "Urgence ?" : "Urgency?"}
                </h3>
                <span className="text-2xl text-gray-400 group-hover:text-indigo-600 transition-all transform group-hover:scale-110">
                  {showUrgency ? "−" : "+"}
                </span>
              </button>
              <AnimatePresence>
                {showUrgency && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-6"
                  >
                    <RadioGroup
                      value={urgency}
                      onValueChange={(value) => form.setValue("urgency", value, { shouldValidate: true })}
                      className="space-y-3"
                    >
                      {["immediat", "court-terme", "long-terme"].map((item) => (
                        <label
                          key={item}
                          className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 hover:border-black cursor-pointer transition-all group rounded-lg"
                          data-testid={`radio-urgency-${item}`}
                        >
                          <RadioGroupItem value={item} className="" />
                          <span className="text-base font-medium text-black">
                            {item === "immediat" && (language === "fr" ? "Immédiat (< 1 mois)" : "Immediate (< 1 month)")}
                            {item === "court-terme" && (language === "fr" ? "Court terme (1-6 mois)" : "Short term (1-6 months)")}
                            {item === "long-terme" && (language === "fr" ? "Long terme (> 6 mois)" : "Long term (> 6 months)")}
                          </span>
                        </label>
                      ))}
                    </RadioGroup>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Stade du projet */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setShowProjectStage(!showProjectStage)}
                className="w-full text-left p-6 hover:bg-gray-50 transition-colors flex items-center justify-between group"
                data-testid="toggle-projectstage"
              >
                <h3 className="text-2xl font-bold text-black group-hover:text-indigo-600 transition-colors">
                  {language === "fr" ? "Stade du projet ?" : "Project stage?"}
                </h3>
                <span className="text-2xl text-gray-400 group-hover:text-indigo-600 transition-all transform group-hover:scale-110">
                  {showProjectStage ? "−" : "+"}
                </span>
              </button>
              <AnimatePresence>
                {showProjectStage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-6"
                  >
                    <RadioGroup
                      value={projectStage}
                      onValueChange={(value) => form.setValue("projectStage", value, { shouldValidate: true })}
                      className="space-y-3"
                    >
                      {["idee", "en-cours", "finalise"].map((item) => (
                        <label
                          key={item}
                          className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 hover:border-black cursor-pointer transition-all group rounded-lg"
                          data-testid={`radio-stage-${item}`}
                        >
                          <RadioGroupItem value={item} className="" />
                          <span className="text-base font-medium text-black">
                            {item === "idee" && (language === "fr" ? "Idée / Concept" : "Idea / Concept")}
                            {item === "en-cours" && (language === "fr" ? "En cours de développement" : "In development")}
                            {item === "finalise" && (language === "fr" ? "Projet finalisé" : "Finalized project")}
                          </span>
                        </label>
                      ))}
                    </RadioGroup>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Types d'aides */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setShowAidTypes(!showAidTypes)}
                className="w-full text-left p-6 hover:bg-gray-50 transition-colors flex items-center justify-between group"
                data-testid="toggle-aidtypes"
              >
                <h3 className="text-2xl font-bold text-black group-hover:text-indigo-600 transition-colors">
                  {language === "fr" ? "Types d'aides ?" : "Aid types?"}
                </h3>
                <span className="text-2xl text-gray-400 group-hover:text-indigo-600 transition-all transform group-hover:scale-110">
                  {showAidTypes ? "−" : "+"}
                </span>
              </button>
              <AnimatePresence>
                {showAidTypes && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3 px-6 pb-6"
                  >
                    {["subvention", "pret", "bourse", "prix", "residence"].map((item) => (
                      <label
                        key={item}
                        className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 hover:border-black cursor-pointer transition-all group rounded-lg"
                        data-testid={`checkbox-aidtype-${item}`}
                      >
                        <Checkbox
                          checked={aidTypes?.includes(item) ?? false}
                          onCheckedChange={(checked) => {
                            const currentValue = aidTypes ?? [];
                            const newValue = checked ? [...currentValue, item] : currentValue.filter((value) => value !== item);
                            form.setValue("aidTypes", newValue, { shouldValidate: true });
                          }}

                        />
                        <span className="text-base font-medium text-black">
                          {item === "subvention" && (language === "fr" ? "Subvention" : "Grant")}
                          {item === "pret" && (language === "fr" ? "Prêt" : "Loan")}
                          {item === "bourse" && (language === "fr" ? "Bourse" : "Scholarship")}
                          {item === "prix" && (language === "fr" ? "Prix" : "Award")}
                          {item === "residence" && (language === "fr" ? "Résidence" : "Residency")}
                        </span>
                      </label>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Portée géographique */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setShowScope(!showScope)}
                className="w-full text-left p-6 hover:bg-gray-50 transition-colors flex items-center justify-between group"
                data-testid="toggle-scope"
              >
                <h3 className="text-2xl font-bold text-black group-hover:text-indigo-600 transition-colors">
                  {language === "fr" ? "Portée géographique ?" : "Geographic scope?"}
                </h3>
                <span className="text-2xl text-gray-400 group-hover:text-indigo-600 transition-all transform group-hover:scale-110">
                  {showScope ? "−" : "+"}
                </span>
              </button>
              <AnimatePresence>
                {showScope && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3 px-6 pb-6"
                  >
                    {["local", "regional", "national", "europeen", "international"].map((item) => (
                      <label
                        key={item}
                        className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 hover:border-black cursor-pointer transition-all group rounded-lg"
                        data-testid={`checkbox-scope-${item}`}
                      >
                        <Checkbox
                          checked={geographicScope?.includes(item) ?? false}
                          onCheckedChange={(checked) => {
                            const currentValue = geographicScope ?? [];
                            const newValue = checked ? [...currentValue, item] : currentValue.filter((value) => value !== item);
                            form.setValue("geographicScope", newValue, { shouldValidate: true });
                          }}

                        />
                        <span className="text-base font-medium text-black">
                          {item === "local" && (language === "fr" ? "Local" : "Local")}
                          {item === "regional" && (language === "fr" ? "Régional" : "Regional")}
                          {item === "national" && (language === "fr" ? "National" : "National")}
                          {item === "europeen" && (language === "fr" ? "Européen" : "European")}
                          {item === "international" && (language === "fr" ? "International" : "International")}
                        </span>
                      </label>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* Submit button at the bottom of optional questions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex justify-center pt-8"
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  const formErrors = form.formState.errors;
                  if (Object.keys(formErrors).length > 0) {
                    toast({
                      title: language === "fr" ? "Formulaire incomplet" : "Incomplete form",
                      description: language === "fr"
                        ? "Veuillez remplir tous les champs obligatoires"
                        : "Please fill all required fields",
                      variant: "destructive",
                      duration: 2500,
                    });
                    return;
                  }
                  form.handleSubmit(onSubmit)();
                }}
                disabled={submitMutation.isPending}
                className="px-12 py-5 bg-[#06D6A0] hover:bg-[#06D6A0]/90 text-white font-bold text-lg rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="button-submit-refined"
              >
                {submitMutation.isPending ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>{language === "fr" ? "Analyse en cours..." : "Analyzing..."}</span>
                  </div>
                ) : (
                  language === "fr" ? "Découvrir mes résultats affinés" : "Discover my refined results"
                )}
              </button>
            </motion.div>
          </motion.div>
        </section>
        )}
      </div>
    </div>
  );
}
