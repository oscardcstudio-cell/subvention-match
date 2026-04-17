import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Calendar, ArrowRight, MapPin, ChevronDown, Mail, Phone, FileText, TrendingUp, Clock, Target, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { GrantResult } from "@shared/schema";
import { safeExternalUrl } from "@/lib/safe-url";

// Données simulées pour la démo
const DEMO_RESULTS: GrantResult[] = [
  {
    id: "demo-1",
    title: "Aide aux auteurs - Centre National du Livre",
    organization: "Centre National du Livre (CNL)",
    amount: "4 000 - 10 000 €",
    deadline: "2025-12-31",
    frequency: "Permanent",
    description: "<p>Le dispositif \"Aide aux auteurs\" comprend trois volets : <br> - les bourses d'aide à la création littéraire ; <br> - les bourses d'aide à la création de bandes dessinées ; <br> - les résidences de médiation littéraire. <br> C'est-à-dire les subventions permettant de soutenir la littérature en région.</p> <h2>Présentation du dispositif</h2> <h3>Qu'est-ce que l'aide aux auteurs ?</h3> <p>Les projets de créations et de résidences littéraires et de médiation sont soutenus dans la mesure où ils sont de nature à dynamiser la création littéraire en région Grand Est, de faire émerger et connaître des talents, de contribuer à la qualité et au rayonnement de la vie littéraire. <strong>Le terme de \"littéraire\" s'entend ici au sens large et concerne aussi bien les auteurs de bande dessinée que de texte.</strong></p>",
    eligibility: "Être auteur professionnel justifiant d'au moins deux ouvrages publiés chez un éditeur établi",
    requirements: "Dossier de candidature comprenant projet détaillé, budget prévisionnel, justificatifs de publications",
    obligatoryDocuments: ["CV littéraire", "Projet de création détaillé (5-10 pages)", "Budget prévisionnel", "Justificatifs de publications antérieures"],
    url: "https://centrenationaldulivre.fr",
    contactEmail: "bourses@centrenationaldulivre.fr",
    contactPhone: "01 53 38 53 00",
    grantType: ["Bourse de création"],
    eligibleSectors: ["Littérature", "Bande dessinée"],
    geographicZone: ["France entière"],
    maxFundingRate: 100,
    processingTime: "2-3 mois",
    responseDelay: "3 mois",
    applicationDifficulty: "moyen",
    acceptanceRate: 35,
    annualBeneficiaries: 120,
    successProbability: "Moyenne à bonne",
    preparationAdvice: "Pour maximiser vos chances, détaillez précisément votre projet d'ateliers créatifs pour enfants dans le domaine des arts numériques et plastiques. Mettez en avant votre expérience d'auto-entrepreneur et votre approche pédagogique innovante. Incluez un calendrier réaliste et un budget détaillé.",
    experienceFeedback: "Les dossiers retenus sont ceux qui démontrent une vraie originalité du projet et une démarche professionnelle aboutie.",
    matchScore: 85,
    matchReason: "Cette aide correspond parfaitement à votre profil d'artiste auto-entrepreneur dans les arts numériques et plastiques. Votre projet d'ateliers créatifs pour enfants s'inscrit dans la médiation culturelle, un axe fort du CNL.",
    tags: ["Création", "Médiation", "Littérature"],
  },
  {
    id: "demo-2",
    title: "DRAC Île-de-France - Soutien aux projets artistiques innovants",
    organization: "Direction Régionale des Affaires Culturelles (DRAC) Île-de-France",
    amount: "8 000 - 25 000 €",
    deadline: "2025-11-30",
    frequency: "Annuel - 2 sessions",
    nextSession: "2026-05-15",
    description: "<p>La DRAC Île-de-France soutient les projets artistiques innovants qui participent au développement de la création contemporaine et à la diffusion des œuvres auprès de tous les publics.</p><p>Cette aide s'adresse aux artistes et structures culturelles de la région qui portent des projets ambitieux dans tous les domaines artistiques.</p>",
    eligibility: "Artistes professionnels et associations culturelles implantés en Île-de-France, portant un projet de création ou de diffusion innovant",
    requirements: "Dossier complet avec description du projet, budget détaillé, plan de financement",
    obligatoryDocuments: ["Formulaire CERFA", "Budget prévisionnel", "RIB", "Statuts (pour associations)"],
    url: "https://www.culture.gouv.fr/Regions/DRAC-Ile-de-France",
    contactEmail: "drac.idf@culture.gouv.fr",
    contactPhone: "01 56 06 50 00",
    grantType: ["Subvention de fonctionnement", "Aide à la création"],
    eligibleSectors: ["Arts plastiques", "Arts numériques", "Spectacle vivant"],
    geographicZone: ["Île-de-France"],
    region: "Île-de-France",
    maxFundingRate: 70,
    coFundingRequired: "oui",
    processingTime: "3-4 mois",
    responseDelay: "4 mois",
    applicationDifficulty: "difficile",
    acceptanceRate: 25,
    annualBeneficiaries: 85,
    successProbability: "Moyenne",
    preparationAdvice: "Mettez en avant le caractère innovant de votre approche pédagogique mêlant arts numériques et plastiques. Détaillez l'impact social de vos ateliers pour enfants. Préparez un budget rigoureux et identifiez vos cofinanceurs potentiels (région, département, fondations).",
    experienceFeedback: "Les projets financés démontrent une réelle innovation artistique et un ancrage territorial fort.",
    matchScore: 78,
    matchReason: "Votre localisation en Île-de-France et votre projet dans les arts numériques correspondent aux priorités de la DRAC. Le volet médiation auprès des enfants est un atout majeur.",
    tags: ["Innovation", "Création", "Médiation"],
  },
  {
    id: "demo-3",
    title: "Fonds de dotation Culture & Diversité - Éducation artistique",
    organization: "Fonds de dotation Culture & Diversité",
    amount: "2 000 - 8 000 €",
    deadline: "2026-01-15",
    description: "<p>Le Fonds Culture & Diversité finance des projets d'éducation artistique et culturelle destinés aux jeunes issus de milieux modestes.</p><p>L'objectif est de favoriser l'accès à la culture pour tous et de soutenir l'émergence de nouveaux talents.</p>",
    eligibility: "Artistes et associations portant des projets d'éducation artistique destinés aux jeunes de 6 à 25 ans en zones prioritaires",
    requirements: "Projet détaillé, budget, engagement des partenaires éducatifs",
    url: "https://www.cultureetdiversite.com",
    contactEmail: "contact@cultureetdiversite.com",
    grantType: ["Mécénat"],
    eligibleSectors: ["Tous domaines artistiques"],
    geographicZone: ["France entière"],
    maxFundingRate: 80,
    processingTime: "1-2 mois",
    responseDelay: "2 mois",
    applicationDifficulty: "facile",
    acceptanceRate: 45,
    annualBeneficiaries: 60,
    successProbability: "Bonne",
    preparationAdvice: "Votre projet d'ateliers créatifs pour enfants est parfaitement aligné avec la mission du fonds. Insistez sur la dimension sociale et l'accessibilité. Si possible, établissez un partenariat avec une école ou centre social en zone prioritaire pour renforcer votre candidature.",
    matchScore: 92,
    matchReason: "Excellente correspondance ! Votre projet de création d'ateliers pour enfants dans les arts plastiques et numériques répond exactement aux objectifs du fonds. La dimension éducative et l'accessibilité sont des critères prioritaires.",
    tags: ["Éducation", "Jeunesse", "Inclusion"],
  },
];

export default function DemoResultsPage() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <a href="/" data-testid="link-home">
            <span className="text-lg sm:text-xl font-light tracking-tight text-black">
              Subvention<span className="font-bold">Match</span>
            </span>
          </a>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
              DÉMO
            </Badge>
            <LanguageToggle language={language} onLanguageChange={setLanguage} />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 md:pb-24 px-4 sm:px-6 md:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Title */}
          <div className="mb-8 sm:mb-12 md:mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-tight mb-3 sm:mb-4">
              {DEMO_RESULTS.length}
              <br />
              <span className="text-[#06D6A0]">
                {language === "fr" 
                  ? `SUBVENTION${DEMO_RESULTS.length > 1 ? 'S' : ''}`
                  : `GRANT${DEMO_RESULTS.length > 1 ? 'S' : ''}`
                }
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">
              {language === "fr" ? "Simulation de résultats enrichis par l'IA" : "AI-enriched results simulation"}
            </p>
          </div>

          {/* Results */}
          <div className="space-y-8">
            {DEMO_RESULTS.map((grant, index) => (
              <motion.div
                key={grant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GrantCard grant={grant} index={index} language={language} t={t} />
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function GrantCard({ grant, index, language, t }: { 
  grant: GrantResult; 
  index: number; 
  language: string;
  t: any;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border border-gray-200 hover:border-black transition-all group" data-testid={`card-grant-${grant.id}`}>
        {/* Header */}
        <div className="p-5 sm:p-7 md:p-10">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
            <div className="flex-1 min-w-0 w-full">
              {grant.matchScore && (
                <div className="mb-3 sm:mb-4">
                  <Badge className="bg-[#118AB2] text-white text-xs">
                    {grant.matchScore}% match
                  </Badge>
                </div>
              )}
              
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-4 sm:mb-5 md:mb-6" data-testid={`text-grant-title-${grant.id}`}>
                {grant.title}
              </h2>
              
              <div className="text-base sm:text-lg md:text-xl text-gray-600 font-medium mb-3 sm:mb-4" data-testid={`text-grant-org-${grant.id}`}>
                {grant.organization}
              </div>

              {grant.region && (
                <div className="flex items-center gap-2 text-gray-500">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{grant.region}</span>
                </div>
              )}
            </div>
            
            {/* MONTANT */}
            <div className="flex-shrink-0 text-left sm:text-right w-full sm:w-auto sm:max-w-[180px]">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1 sm:mb-2">
                {language === "fr" ? "Montant" : "Amount"}
              </div>
              <div className="text-xl sm:text-2xl font-bold text-black leading-tight" data-testid={`badge-grant-amount-${grant.id}`}>
                {(() => {
                  // Séparer le montant: chercher tiret ou "à"
                  let parts = grant.amount.split(' - ');
                  if (parts.length === 1) {
                    parts = grant.amount.split(' à ');
                  }
                  
                  if (parts.length === 2) {
                    return (
                      <>
                        <div>{parts[0]}</div>
                        <div>à {parts[1]}</div>
                      </>
                    );
                  }
                  // Si pas de séparateur, afficher normalement
                  return grant.amount;
                })()}
              </div>
              {grant.maxFundingRate && (
                <div className="text-sm text-gray-500 mt-1 sm:mt-2">
                  {language === "fr" ? "Jusqu'à" : "Up to"} {grant.maxFundingRate}%
                </div>
              )}
            </div>
          </div>

          {/* DEADLINE */}
          {grant.deadline && (
            <div className="mb-6 sm:mb-8 flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>
                {language === "fr" ? "Ouvert jusqu'au" : "Open until"} {grant.deadline}
              </span>
            </div>
          )}

          {/* MATCH IA */}
          {grant.matchReason && (
            <div className="bg-[#06D6A0]/5 border-l-4 border-[#06D6A0] p-4 sm:p-5 md:p-6 mb-6 sm:mb-8">
              <h4 className="text-xs uppercase tracking-widest text-[#06D6A0] font-bold flex items-center gap-2 mb-2 sm:mb-3">
                <Target className="h-4 w-4" />
                {language === "fr" ? "Pourquoi cette subvention ?" : "Why this grant?"}
              </h4>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-medium">
                {grant.matchReason}
              </p>
            </div>
          )}

          {/* BOUTON DÉROULER */}
          <CollapsibleTrigger asChild>
            <Button 
              variant="outline" 
              size="lg"
              className="w-full border-2 border-gray-200 hover:border-black rounded-full py-5 sm:py-6 group"
              data-testid={`button-toggle-details-${grant.id}`}
            >
              <span className="font-medium text-sm sm:text-base">
                {isOpen 
                  ? (language === "fr" ? "Masquer les détails" : "Hide details")
                  : (language === "fr" ? "Voir tous les détails" : "View all details")
                }
              </span>
              <ChevronDown className={`ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
        </div>

        {/* SECTION DÉPLIABLE */}
        <CollapsibleContent>
          <div className="px-5 sm:px-7 md:px-10 pb-5 sm:pb-7 md:pb-10 space-y-6 sm:space-y-8 border-t border-gray-200 pt-5 sm:pt-7 md:pt-10 bg-white">
            
            {/* Description */}
            {grant.description && (
              <div>
                <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-3 sm:mb-4 font-bold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Description
                </h4>
                <div 
                  className="text-base sm:text-lg text-gray-700 leading-relaxed prose prose-sm sm:prose-base max-w-none" 
                  dangerouslySetInnerHTML={{ __html: grant.description }}
                />
              </div>
            )}

            {/* Éligibilité */}
            {grant.eligibility && (
              <div>
                <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-3 sm:mb-4 font-bold">
                  Critères d'éligibilité
                </h4>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  {grant.eligibility}
                </p>
              </div>
            )}

            {/* Documents requis */}
            {grant.obligatoryDocuments && grant.obligatoryDocuments.length > 0 && (
              <div>
                <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-4 font-bold">
                  Documents obligatoires
                </h4>
                <ul className="space-y-2">
                  {grant.obligatoryDocuments.map((doc, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-[#06D6A0] mt-1">•</span>
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Statistiques */}
            {(grant.acceptanceRate || grant.annualBeneficiaries) && (
              <div className="bg-gray-50 p-4 sm:p-5 md:p-6 rounded-lg">
                <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-3 sm:mb-4 font-bold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Statistiques
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  {grant.acceptanceRate && (
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-[#06D6A0]">{grant.acceptanceRate}%</div>
                      <div className="text-xs text-gray-500 uppercase">Taux d'acceptation</div>
                    </div>
                  )}
                  {grant.annualBeneficiaries && (
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-[#06D6A0]">{grant.annualBeneficiaries}</div>
                      <div className="text-xs text-gray-500 uppercase">Bénéficiaires/an</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Processus */}
            {(grant.processingTime || grant.applicationDifficulty) && (
              <div>
                <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-4 font-bold flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Processus
                </h4>
                <div className="space-y-2 text-sm text-gray-700">
                  {grant.processingTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Durée d'instruction:</span>
                      <span className="font-medium">{grant.processingTime}</span>
                    </div>
                  )}
                  {grant.applicationDifficulty && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Difficulté:</span>
                      <Badge variant="secondary">{grant.applicationDifficulty}</Badge>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Conseils de préparation */}
            {grant.preparationAdvice && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 sm:p-5 md:p-6">
                <h4 className="text-xs uppercase tracking-widest text-blue-700 mb-2 sm:mb-3 font-bold flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Conseils personnalisés
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">{grant.preparationAdvice}</p>
              </div>
            )}

            {/* Contact */}
            {(grant.contactEmail || grant.contactPhone) && (
              <div>
                <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-4 font-bold">
                  Contact
                </h4>
                <div className="space-y-2">
                  {grant.contactEmail && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <a href={`mailto:${grant.contactEmail}`} className="hover:underline">
                        {grant.contactEmail}
                      </a>
                    </div>
                  )}
                  {grant.contactPhone && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <a href={`tel:${grant.contactPhone}`} className="hover:underline">
                        {grant.contactPhone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* BOUTON CANDIDATER */}
            {safeExternalUrl(grant.url) && (
              <div className="pt-4 sm:pt-6 border-t border-gray-200">
                <Button
                  size="lg"
                  className="w-full bg-black text-white hover:bg-gray-800 rounded-full py-5 sm:py-6 group text-sm sm:text-base"
                  asChild
                >
                  <a href={safeExternalUrl(grant.url)} target="_blank" rel="noopener noreferrer">
                    Candidater maintenant
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Button>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
