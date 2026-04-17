import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ArrowRight, ChevronDown, Calendar, Target, FileText, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

function ExampleGrantCard({ language }: { language: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [buttonState, setButtonState] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (buttonState !== 'idle') return;
    
    setButtonState('loading');
    
    setTimeout(() => {
      setButtonState('success');
      
      // Ouvrir le lien après validation
      setTimeout(() => {
        window.open(
          'https://www.culture.gouv.fr/fr/catalogue-des-demarches-et-subventions/subvention/aides-aux-equipes-independantes-aides-deconcentrees-au-spectacle-vivant-adsv',
          '_blank',
          'noopener,noreferrer'
        );
        setButtonState('idle');
      }, 500);
    }, 1000);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="bg-gradient-to-br from-[#06D6A0]/10 to-[#06D6A0]/5 border-2 border-[#06D6A0] rounded-lg">
        {/* Header - Toujours visible */}
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#06D6A0] text-white flex items-center justify-center font-bold">
              ✓
            </div>
            <h3 className="text-xl font-bold text-[#073B4C]">
              {language === "fr" ? "Subvention matchée" : "Matched grant"}
            </h3>
          </div>

          <h4 className="text-3xl font-bold text-[#073B4C] mb-4">
            {language === "fr" 
              ? "ADSV - Aides aux équipes indépendantes"
              : "ADSV - Support for independent teams"
            }
          </h4>

          <div className="text-lg text-gray-600 mb-6">
            {language === "fr" ? "Ministère de la Culture" : "Ministry of Culture"}
          </div>

          {/* Montant */}
          <div className="mb-6">
            <div className="text-sm text-gray-500 uppercase tracking-wide mb-1">
              {language === "fr" ? "Montant" : "Amount"}
            </div>
            <div className="text-2xl font-bold text-[#073B4C]">
              {language === "fr" ? "Variable selon projet" : "Variable per project"}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {language === "fr" ? "56M€ distribués en 2021 à 1,412 équipes" : "€56M distributed in 2021 to 1,412 teams"}
            </div>
          </div>

          {/* Deadline */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-full text-sm">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">
                {language === "fr" ? "Permanente" : "Permanent"}
              </span>
            </div>
          </div>

          {/* Match IA */}
          <div className="bg-[#06D6A0]/20 border-l-4 border-[#06D6A0] p-5 mb-6">
            <h5 className="text-xs uppercase tracking-widest text-[#06D6A0] font-bold flex items-center gap-2 mb-2">
              <Target className="h-4 w-4" />
              {language === "fr" ? "Pourquoi cette subvention ?" : "Why this grant?"}
            </h5>
            <p className="text-sm text-gray-700 leading-relaxed">
              {language === "fr"
                ? "Votre projet de création pluridisciplinaire correspond parfaitement aux critères ADSV. Cette aide permanente soutient les équipes indépendantes en danse, théâtre, musique, cirque et arts de la rue. Budget de 45k€ compatible."
                : "Your multidisciplinary creation project perfectly matches ADSV criteria. This permanent grant supports independent teams in dance, theater, music, circus and street arts. €45k budget is compatible."
              }
            </p>
          </div>

          {/* Bouton dérouler */}
          <CollapsibleTrigger asChild>
            <Button 
              variant="outline" 
              size="lg"
              className="w-full border-2 border-[#06D6A0] hover:border-[#06D6A0] hover:bg-[#06D6A0]/10 rounded-full py-5 mb-4"
            >
              <span className="font-medium">
                {isOpen 
                  ? (language === "fr" ? "Masquer les détails" : "Hide details")
                  : (language === "fr" ? "Voir tous les détails" : "View all details")
                }
              </span>
              <ChevronDown className={`ml-2 h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>

          {/* Bouton accéder à la subvention */}
          <Button 
            className={`w-full rounded-lg py-6 font-semibold text-base shadow-sm transition-all ${
              buttonState === 'success' 
                ? 'bg-green-600 hover:bg-green-600' 
                : 'bg-[#06D6A0] hover:bg-[#06D6A0]/90'
            } text-white`}
            size="lg"
            onClick={handleButtonClick}
            disabled={buttonState !== 'idle'}
          >
            {buttonState === 'loading' && (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {language === "fr" ? "Vérification..." : "Checking..."}
              </>
            )}
            {buttonState === 'success' && (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {language === "fr" ? "Accès autorisé !" : "Access granted!"}
              </>
            )}
            {buttonState === 'idle' && (
              <>
                {language === "fr" ? "Accéder à la subvention" : "Access the grant"}
                <ExternalLink className="ml-2 h-4 w-4 inline-block" />
              </>
            )}
          </Button>
        </div>

        {/* Section dépliable */}
        <CollapsibleContent>
          <div className="px-8 pb-8 space-y-6 border-t border-[#06D6A0]/30 pt-8">
            {/* Description */}
            <div>
              <h5 className="text-xs uppercase tracking-widest text-gray-400 mb-3 font-bold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {language === "fr" ? "Description" : "Description"}
              </h5>
              <p className="text-base text-gray-700 leading-relaxed">
                {language === "fr"
                  ? "Le dispositif ADSV constitue le socle de la politique du ministère de la Culture en faveur des équipes artistiques. Il soutient les artistes et équipes indépendants pour qu'ils puissent développer leur travail de création et en faire bénéficier le public le plus large possible."
                  : "The ADSV program is the cornerstone of the Ministry of Culture's policy for artistic teams. It supports independent artists and teams so they can develop their creative work and share it with the widest possible audience."
                }
              </p>
            </div>

            {/* Éligibilité */}
            <div>
              <h5 className="text-xs uppercase tracking-widest text-gray-400 mb-3 font-bold">
                {language === "fr" ? "Critères d'éligibilité" : "Eligibility criteria"}
              </h5>
              <p className="text-sm text-gray-700 leading-relaxed">
                {language === "fr"
                  ? "Artistes, collectifs, compagnies ou ensembles professionnels en danse, musique, théâtre, cirque et arts de la rue. Associations, entreprises privées ou structures culturelles établies en France."
                  : "Professional artists, collectives, companies or ensembles in dance, music, theater, circus and street arts. Associations, private companies or cultural structures established in France."
                }
              </p>
            </div>

            {/* Documents requis */}
            <div>
              <h5 className="text-xs uppercase tracking-widest text-gray-400 mb-3 font-bold">
                {language === "fr" ? "Dossier à fournir" : "Required documents"}
              </h5>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-[#06D6A0] mt-1 flex-shrink-0">•</span>
                  <span>{language === "fr" ? "Présentation du projet artistique" : "Artistic project presentation"}</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-[#06D6A0] mt-1 flex-shrink-0">•</span>
                  <span>{language === "fr" ? "Budget prévisionnel" : "Budget forecast"}</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-[#06D6A0] mt-1 flex-shrink-0">•</span>
                  <span>{language === "fr" ? "Calendrier de diffusion (min. 3-8 représentations)" : "Performance schedule (min. 3-8 shows)"}</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-[#06D6A0] mt-1 flex-shrink-0">•</span>
                  <span>{language === "fr" ? "Partenariats avec lieux de spectacle" : "Partnerships with venues"}</span>
                </li>
              </ul>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

interface GrantsStats {
  total: number;
  euGrants: number;
  frenchGrants: number;
  withDeadline: number;
  withUrl: number;
}

export default function Home() {
  const { language, setLanguage, t } = useLanguage();

  // Récupérer les statistiques détaillées depuis l'API
  const { data: statsData } = useQuery<GrantsStats>({
    queryKey: ["/api/grants/stats"],
  });

  // Utiliser les valeurs de la DB si disponibles, sinon valeurs par défaut
  const grantsCount = statsData?.total ?? 274;
  const euGrantsCount = statsData?.euGrants ?? 0;
  const frenchGrantsCount = statsData?.frenchGrants ?? 21;

  return (
    <div className="min-h-screen bg-white">
      {/* Header Minimal */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <a href="/" data-testid="link-home" className="group">
            <span className="text-lg sm:text-xl font-light tracking-tight text-[#073B4C]">
              Subvention<span className="font-bold">Match</span>
            </span>
          </a>
          <div className="flex items-center gap-3">
            <Link href="/notes">
              <Button variant="outline" size="sm" data-testid="button-notes" className="gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Notes</span>
              </Button>
            </Link>
            <LanguageToggle language={language} onLanguageChange={setLanguage} />
          </div>
        </div>
      </header>

      {/* Hero - Nouvelle palette */}
      <section className="pt-32 sm:pt-40 md:pt-48 pb-16 sm:pb-24 md:pb-32 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-white via-[#FFD166]/5 to-[#06D6A0]/5">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-12 sm:space-y-16">
            {/* Titre */}
            <div className="space-y-6">
              <h1 className="text-[3.5rem] sm:text-[5rem] md:text-[6rem] lg:text-[7rem] leading-[0.85] font-bold tracking-tighter text-[#073B4C]">
                {language === "fr" ? (
                  <>
                    TROUVEZ
                    <br />
                    VOTRE
                    <br />
                    SUBVENTION
                  </>
                ) : (
                  <>
                    FIND
                    <br />
                    YOUR
                    <br />
                    GRANT
                  </>
                )}
              </h1>
            </div>

            {/* Description */}
            <div className="space-y-3 text-base sm:text-lg text-gray-600 max-w-2xl leading-relaxed">
              <p>
                {language === "fr" 
                  ? "Ton partenaire pour trouver la meilleure subvention à ton projet."
                  : "Your partner to find the best grant for your project."
                }
              </p>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 gap-4 max-w-3xl mx-auto">
              {/* Total subventions */}
              <div className="col-span-2 p-6 sm:p-8 bg-gradient-to-br from-[#06D6A0]/10 to-[#06D6A0]/5 rounded-lg border-2 border-[#06D6A0]/30">
                <div className="text-5xl sm:text-6xl font-bold tracking-tighter text-[#06D6A0]">274</div>
                <div className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide mt-2 font-medium">
                  {language === "fr" ? "Subventions disponibles" : "Available grants"}
                </div>
              </div>

              {/* Organismes partenaires */}
              <div className="p-5 sm:p-6 bg-white rounded-lg border-2 border-gray-200">
                <div className="text-3xl sm:text-4xl font-bold tracking-tighter text-[#073B4C]">24</div>
                <div className="text-xs text-gray-600 uppercase tracking-wide mt-2 font-medium leading-tight">
                  {language === "fr" ? "Organismes" : "Partner organizations"}
                </div>
              </div>

              {/* Budget total */}
              <div className="p-5 sm:p-6 bg-white rounded-lg border-2 border-gray-200">
                <div className="text-3xl sm:text-4xl font-bold tracking-tighter text-[#073B4C]">€6.3M</div>
                <div className="text-xs text-gray-600 uppercase tracking-wide mt-2 font-medium">
                  {language === "fr" ? "Budget total accessible" : "Total accessible budget"}
                </div>
              </div>

              {/* Montant moyen */}
              <div className="p-5 sm:p-6 bg-white rounded-lg border-2 border-gray-200">
                <div className="text-2xl sm:text-3xl font-bold tracking-tighter text-[#073B4C]">€24K</div>
                <div className="text-xs text-gray-600 uppercase tracking-wide mt-2 font-medium">
                  {language === "fr" ? "Montant moyen" : "Average amount"}
                </div>
              </div>
            </div>

            {/* Section "Je suis..." */}
            <div className="space-y-6 pt-8 flex flex-col items-center">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#073B4C]">
                {language === "fr" ? "Je suis..." : "I am..."}
              </h2>
              
              <div className="flex flex-col gap-3 w-full max-w-md">
                <Link href="/form?domain=musique">
                  <Badge 
                    variant="outline" 
                    className="px-5 py-3 text-base cursor-pointer hover:bg-[#06D6A0]/10 hover:border-[#06D6A0] transition-all hover:scale-105"
                    data-testid="badge-musician"
                  >
                    🎵 {language === "fr" ? "un musicien" : "a musician"}
                  </Badge>
                </Link>
                
                <Link href="/form?domain=ecriture">
                  <Badge 
                    variant="outline" 
                    className="px-5 py-3 text-base cursor-pointer hover:bg-[#06D6A0]/10 hover:border-[#06D6A0] transition-all hover:scale-105"
                    data-testid="badge-writer"
                  >
                    ✍️ {language === "fr" ? "un écrivain" : "a writer"}
                  </Badge>
                </Link>
                
                <Link href="/form?domain=arts-plastiques">
                  <Badge 
                    variant="outline" 
                    className="px-5 py-3 text-base cursor-pointer hover:bg-[#06D6A0]/10 hover:border-[#06D6A0] transition-all hover:scale-105"
                    data-testid="badge-visual-artist"
                  >
                    🎨 {language === "fr" ? "un artiste" : "an artist"}
                  </Badge>
                </Link>
                
                <Link href="/form?domain=spectacle-vivant">
                  <Badge 
                    variant="outline" 
                    className="px-5 py-3 text-base cursor-pointer hover:bg-[#06D6A0]/10 hover:border-[#06D6A0] transition-all hover:scale-105"
                    data-testid="badge-performer"
                  >
                    🎭 {language === "fr" ? "un comédien" : "an actor"}
                  </Badge>
                </Link>
                
                <Link href="/form?domain=audiovisuel">
                  <Badge 
                    variant="outline" 
                    className="px-5 py-3 text-base cursor-pointer hover:bg-[#06D6A0]/10 hover:border-[#06D6A0] transition-all hover:scale-105"
                    data-testid="badge-filmmaker"
                  >
                    🎬 {language === "fr" ? "un cinéaste" : "a filmmaker"}
                  </Badge>
                </Link>
                
                <Link href="/form?domain=arts-numeriques">
                  <Badge 
                    variant="outline" 
                    className="px-5 py-3 text-base cursor-pointer hover:bg-[#06D6A0]/10 hover:border-[#06D6A0] transition-all hover:scale-105"
                    data-testid="badge-digital-artist"
                  >
                    💻 {language === "fr" ? "un artiste numérique" : "a digital artist"}
                  </Badge>
                </Link>

                <Link href="/form?domain=patrimoine">
                  <Badge 
                    variant="outline" 
                    className="px-5 py-3 text-base cursor-pointer hover:bg-[#06D6A0]/10 hover:border-[#06D6A0] transition-all hover:scale-105"
                    data-testid="badge-heritage"
                  >
                    🏛️ {language === "fr" ? "dans le patrimoine" : "in heritage"}
                  </Badge>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works - Nouvelle palette */}
      <section className="py-24 px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4">
              <h2 className="text-5xl font-bold tracking-tighter leading-tight text-[#073B4C]">
                {language === "fr" ? "COMMENT ÇA MARCHE" : "HOW IT WORKS"}
              </h2>
            </div>
            
            <div className="lg:col-span-8 space-y-8">
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 text-5xl font-bold text-black">
                  1
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-bold mb-2 text-[#073B4C]">
                    {language === "fr" ? "Remplissez le formulaire" : "Fill the form"}
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {language === "fr"
                      ? "13 questions sur votre profil, projet, budget et besoins."
                      : "13 questions about your profile, project, budget and needs."
                    }
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 text-5xl font-bold text-black">
                  2
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-bold mb-2 text-[#073B4C]">
                    {language === "fr" ? "IA analyse et matche" : "AI analyzes and matches"}
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {language === "fr"
                      ? `Notre IA analyse ${grantsCount} subventions pour trouver les meilleures pour vous.`
                      : `Our AI analyzes ${grantsCount} grants to find the best matches for you.`
                    }
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 text-5xl font-bold text-black">
                  3
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-bold mb-2 text-[#073B4C]">
                    {language === "fr" ? "Accédez aux résultats" : "Access results"}
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {language === "fr"
                      ? "1 résultat gratuit, puis 2€ par subventions."
                      : "1 free result, then €2 per grant."
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Example Section */}
      <section className="py-24 px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="space-y-8">
            <div>
              <h2 className="text-5xl font-bold tracking-tighter leading-tight text-[#073B4C] mb-8">
                {language === "fr" ? "VOIR LE MATCHING EN ACTION" : "SEE MATCHING IN ACTION"}
              </h2>
            </div>
            
            <div className="space-y-8">
              {/* Input Example */}
              <div className="bg-white border-2 border-gray-200 rounded-lg p-8">
                <h3 className="text-xl font-bold text-[#073B4C] mb-4">
                  {language === "fr" ? "Décrivez votre projet" : "Describe your project"}
                </h3>
                <p className="text-gray-700 text-lg leading-relaxed italic">
                  {language === "fr" 
                    ? "\"Je suis une compagnie de théâtre contemporain basée à Lyon. Nous préparons une création sur la mémoire collective qui mêle théâtre, vidéo et musique live. Budget estimé : 45 000€.\""
                    : "\"I'm a contemporary theater company based in Lyon. We're preparing a creation about collective memory that mixes theater, video and live music. Estimated budget: €45,000.\""
                  }
                </p>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="text-[#06D6A0] text-4xl font-bold">↓</div>
              </div>

              {/* Output Example */}
              <ExampleGrantCard language={language} />
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon - Carnet d'adresses artistique */}
      <section className="py-24 px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden border-2 border-[#118AB2]/20 rounded-2xl p-8 sm:p-12 bg-gradient-to-br from-[#118AB2]/5 via-white to-[#06D6A0]/5">
            {/* Badge Coming Soon */}
            <div className="inline-flex items-center gap-2 bg-[#118AB2]/10 text-[#118AB2] px-4 py-1.5 rounded-full text-sm font-semibold mb-6 tracking-wide uppercase">
              <span className="w-2 h-2 bg-[#118AB2] rounded-full animate-pulse" />
              {language === "fr" ? "Bientot disponible" : "Coming soon"}
            </div>

            <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter text-[#073B4C] mb-4 leading-tight">
              {language === "fr" ? (
                <>TROUVEZ AUSSI<br /><span className="text-[#118AB2]">QUI REPRESENTE VOTRE ART</span></>
              ) : (
                <>ALSO FIND<br /><span className="text-[#118AB2]">WHO REPRESENTS YOUR ART</span></>
              )}
            </h2>

            <p className="text-lg text-gray-600 mb-8 max-w-2xl leading-relaxed">
              {language === "fr"
                ? "Une subvention finance votre projet. Mais il vous faut aussi les bonnes personnes pour le representer et le diffuser. Bientot, SubventionMatch vous connectera directement avec les professionnels de votre secteur."
                : "A grant funds your project. But you also need the right people to represent and distribute it. Soon, SubventionMatch will connect you directly with professionals in your field."
              }
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {[
                { icon: "🎨", label: language === "fr" ? "Galeries d'art" : "Art galleries", desc: language === "fr" ? "Par style, region et ouverture aux emergents" : "By style, region and openness to emerging artists" },
                { icon: "🎵", label: language === "fr" ? "Labels & producteurs" : "Labels & producers", desc: language === "fr" ? "Par genre musical et type de contrat" : "By music genre and contract type" },
                { icon: "📚", label: language === "fr" ? "Maisons d'edition" : "Publishers", desc: language === "fr" ? "Par genre litteraire et politique editoriale" : "By literary genre and editorial policy" },
                { icon: "🎭", label: language === "fr" ? "Agents & tourneurs" : "Agents & bookers", desc: language === "fr" ? "Par discipline et reseau de diffusion" : "By discipline and distribution network" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-white/60 rounded-xl border border-gray-100">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <div className="font-semibold text-[#073B4C]">{item.label}</div>
                    <div className="text-sm text-gray-500">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-sm text-gray-400 italic">
              {language === "fr"
                ? "Le meme matching IA que pour vos subventions, applique a l'ecosysteme artistique professionnel."
                : "The same AI matching as for your grants, applied to the professional artistic ecosystem."
              }
            </p>
          </div>
        </div>
      </section>

      {/* Test Flow Section - Nouvelle palette */}
      <section className="py-32 px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold tracking-tighter mb-6 text-[#073B4C]">
              {language === "fr" ? "TESTER LE" : "TEST THE"}
              <br />
              <span className="text-[#118AB2]">
                {language === "fr" ? "FLOW" : "FLOW"}
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              {language === "fr" 
                ? "Prévisualisez les pages de résultats avant et après paiement" 
                : "Preview result pages before and after payment"
              }
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <Link href="/results?sessionId=test-unpaid">
              <div className="group border-2 border-gray-200 hover:border-[#EF476F] transition-all p-10 cursor-pointer h-full flex flex-col rounded-lg" data-testid="link-test-unpaid">
                <div className="flex-1">
                  <div className="text-4xl font-bold mb-4 group-hover:text-[#EF476F] transition-colors text-[#073B4C]">
                    01
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-[#073B4C]">
                    {language === "fr" ? "Résultats floutés" : "Blurred results"}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {language === "fr"
                      ? "Vue avec 1 résultat gratuit + paywall pour débloquer le reste"
                      : "View with 1 free result + paywall to unlock the rest"
                    }
                  </p>
                  <div className="mt-4">
                    <Badge className="bg-[#FFD166]/20 text-[#FFD166] border-[#FFD166]/30 rounded-md">
                      {language === "fr" ? "Non payé" : "Unpaid"}
                    </Badge>
                  </div>
                </div>
                <div className="mt-8 flex items-center text-sm font-medium group-hover:translate-x-2 transition-transform text-[#073B4C]">
                  {language === "fr" ? "Voir la démo" : "View demo"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Link>

            <Link href="/results?sessionId=test-paid">
              <div className="group border-2 border-[#06D6A0] hover:border-[#06D6A0]/80 transition-all p-10 cursor-pointer h-full flex flex-col bg-[#06D6A0]/5 rounded-lg" data-testid="link-test-paid">
                <div className="flex-1">
                  <div className="text-4xl font-bold mb-4 group-hover:text-[#06D6A0]/80 transition-colors text-[#06D6A0]">
                    02
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-[#073B4C]">
                    {language === "fr" ? "Résultats complets" : "Full results"}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {language === "fr"
                      ? "Vue après paiement avec tous les détails débloqués"
                      : "View after payment with all details unlocked"
                    }
                  </p>
                  <div className="mt-4">
                    <Badge className="bg-[#06D6A0]/20 text-[#06D6A0] border-[#06D6A0]/30 rounded-md">
                      {language === "fr" ? "Payé ✓" : "Paid ✓"}
                    </Badge>
                  </div>
                </div>
                <div className="mt-8 flex items-center text-sm font-medium group-hover:translate-x-2 transition-transform text-[#073B4C]">
                  {language === "fr" ? "Voir la démo" : "View demo"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Link>

            <Link href="/stats">
              <div className="group border-2 border-[#118AB2] hover:border-[#118AB2]/80 transition-all p-10 cursor-pointer h-full flex flex-col bg-[#118AB2]/5 rounded-lg" data-testid="link-stats">
                <div className="flex-1">
                  <div className="text-4xl font-bold mb-4 group-hover:text-[#118AB2]/80 transition-colors text-[#118AB2]">
                    03
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-[#073B4C]">
                    {language === "fr" ? "Statistiques DB" : "DB Statistics"}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {language === "fr"
                      ? "Visualisez les stats de la base de données avec graphiques et taux de remplissage"
                      : "View database stats with charts and fill rates"
                    }
                  </p>
                  <div className="mt-4">
                    <Badge className="bg-[#118AB2]/20 text-[#118AB2] border-[#118AB2]/30 rounded-md">
                      {language === "fr" ? "Analytics 📊" : "Analytics 📊"}
                    </Badge>
                  </div>
                </div>
                <div className="mt-8 flex items-center text-sm font-medium group-hover:translate-x-2 transition-transform text-[#073B4C]">
                  {language === "fr" ? "Voir les stats" : "View stats"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Minimal - Nouvelle palette */}
      <footer className="py-16 px-8 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm text-gray-600">
            © 2026 SubventionMatch
          </div>
          <div className="flex gap-8 text-sm text-gray-600 items-center">
            <Link href="/api-status" className="hover:text-[#118AB2] transition-colors" data-testid="link-api-status">
              {language === "fr" ? "Monitoring APIs" : "API Monitoring"}
            </Link>
            <a 
              href="/api/example-pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-[#118AB2] transition-colors"
              data-testid="link-example-pdf"
            >
              {language === "fr" ? "📄 Exemple PDF" : "📄 PDF Example"}
            </a>
            <Link 
              href="/data-quality"
              className="hover:text-[#118AB2] transition-colors"
              data-testid="link-data-quality"
            >
              {language === "fr" ? "📊 Qualité des données" : "📊 Data Quality"}
            </Link>
            <Link href="/mentions-legales" className="hover:text-[#118AB2] transition-colors">Mentions legales</Link>
            <Link href="/cgv" className="hover:text-[#118AB2] transition-colors">CGV</Link>
            <Link href="/confidentialite" className="hover:text-[#118AB2] transition-colors">{t.footerPrivacy}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
