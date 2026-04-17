import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Lock, Loader2, Calendar, ArrowRight, MapPin, ChevronDown, Mail, Phone, FileText, TrendingUp, Clock, Target, Lightbulb, PlayCircle, ExternalLink, BookOpen, Sparkles, Download } from "lucide-react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { GrantResult } from "@shared/schema";
import { ChatRefinement } from "@/components/ChatRefinement";
import { trackResultsViewed, trackCheckoutStarted, trackPdfDownloaded, trackMatchFeedback } from "@/lib/analytics";
import { safeExternalUrl } from "@/lib/safe-url";

// Fonction pour extraire les emails propres du HTML brut
function extractCleanEmail(rawContact: string): string {
  if (!rawContact) return '';
  
  // Si c'est déjà un email propre (sans HTML)
  if (rawContact.match(/^[^\s<>]+@[^\s<>]+\.[^\s<>]+$/)) {
    return rawContact;
  }
  
  // Chercher un email dans le HTML avec pattern mailto:
  const mailtoMatch = rawContact.match(/mailto:([^"'\s<>]+)/i);
  if (mailtoMatch) {
    // Décoder les entités HTML comme &#64; → @
    return mailtoMatch[1].replace(/&#64;/g, '@').replace(/&amp;/g, '&');
  }
  
  // Chercher un email standard dans le texte
  const emailMatch = rawContact.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (emailMatch) {
    return emailMatch[1];
  }
  
  // Si aucun email trouvé, nettoyer les balises HTML et retourner le texte
  const cleanText = rawContact.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return cleanText.length < 100 ? cleanText : '';
}

// Fonction pour extraire les numéros de téléphone du HTML brut
function extractCleanPhone(rawPhone: string): string {
  if (!rawPhone) return '';
  
  // Si c'est déjà un numéro propre
  if (rawPhone.match(/^[\d\s.+-]+$/)) {
    return rawPhone;
  }
  
  // Chercher un numéro de téléphone français
  const phoneMatch = rawPhone.match(/(\d{2}[\s.]?\d{2}[\s.]?\d{2}[\s.]?\d{2}[\s.]?\d{2})/);
  if (phoneMatch) {
    return phoneMatch[1];
  }
  
  return '';
}

// Composant pour tronquer intelligemment le contenu long
function TruncatedContent({ content, maxLength = 600 }: { content: string; maxLength?: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Nettoyer le HTML pour compter les caractères
  const plainText = content.replace(/<[^>]*>/g, '').trim();
  const isTooLong = plainText.length > maxLength;
  
  // Si pas trop long, afficher normalement
  if (!isTooLong) {
    return <FormattedGrantContent content={content} />;
  }
  
  // Si trop long et pas expanded, tronquer
  if (!isExpanded) {
    // Trouver un bon point de coupe (au plus proche de maxLength, à la fin d'une phrase)
    let cutPoint = maxLength;
    const nextPeriod = plainText.indexOf('.', cutPoint);
    const nextExclamation = plainText.indexOf('!', cutPoint);
    const nextQuestion = plainText.indexOf('?', cutPoint);
    
    const candidates = [nextPeriod, nextExclamation, nextQuestion].filter(p => p > 0 && p < cutPoint + 100);
    if (candidates.length > 0) {
      cutPoint = Math.min(...candidates) + 1;
    }
    
    // Tronquer le HTML intelligemment
    const truncatedContent = content.substring(0, cutPoint) + '...';
    
    return (
      <div>
        <FormattedGrantContent content={truncatedContent} />
        <button
          onClick={() => setIsExpanded(true)}
          className="text-[#06D6A0] hover:text-[#05b589] font-medium text-sm mt-2 flex items-center gap-1"
        >
          Voir plus <ChevronDown className="h-4 w-4" />
        </button>
      </div>
    );
  }
  
  // Si expanded, tout afficher
  return (
    <div>
      <FormattedGrantContent content={content} />
      <button
        onClick={() => setIsExpanded(false)}
        className="text-[#06D6A0] hover:text-[#05b589] font-medium text-sm mt-2 flex items-center gap-1"
      >
        Voir moins <ChevronDown className="h-4 w-4 rotate-180" />
      </button>
    </div>
  );
}

// Composant pour formatter le contenu scrapé de manière hiérarchisée
function FormattedGrantContent({ content }: { content: string }) {
  // Parser le HTML et extraire le texte de manière structurée
  const parseContent = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const elements: JSX.Element[] = [];

    // Fonction pour extraire le texte propre
    const cleanText = (text: string) => text.trim().replace(/\s+/g, ' ');

    // Parcourir les éléments et créer une structure hiérarchisée
    const processElement = (element: Element, level: number = 0) => {
      const tag = element.tagName.toLowerCase();
      const text = cleanText(element.textContent || '');
      
      if (!text) return;

      // Titres (h1-h6)
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
        elements.push(
          <h3 key={elements.length} className="font-bold text-gray-900 mt-4 first:mt-0 mb-2 text-base">
            {text}
          </h3>
        );
      }
      // Paragraphes
      else if (tag === 'p') {
        elements.push(
          <p key={elements.length} className="text-gray-700 mb-3 leading-relaxed">
            {text}
          </p>
        );
      }
      // Listes
      else if (tag === 'ul' || tag === 'ol') {
        const items = Array.from(element.querySelectorAll('li')).map(li => cleanText(li.textContent || ''));
        if (items.length > 0) {
          elements.push(
            <ul key={elements.length} className="space-y-2 mb-3 ml-4">
              {items.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-700">
                  <span className="text-[#06D6A0] mt-1 flex-shrink-0">•</span>
                  <span className="flex-1">{item}</span>
                </li>
              ))}
            </ul>
          );
        }
      }
      // Liens
      else if (tag === 'a') {
        const href = element.getAttribute('href');
        if (href && text) {
          elements.push(
            <a 
              key={elements.length} 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#06D6A0] underline hover:no-underline inline-flex items-center gap-1"
            >
              {text}
              <ExternalLink className="h-3 w-3" />
            </a>
          );
        }
      }
      // Strong/Bold
      else if (tag === 'strong' || tag === 'b') {
        elements.push(
          <strong key={elements.length} className="font-bold text-gray-900">
            {text}
          </strong>
        );
      }
    };

    // Parcourir tous les éléments directs du body
    Array.from(doc.body.children).forEach((el, idx) => {
      processElement(el, 0);
    });

    // Si pas d'éléments structurés, afficher le texte brut proprement
    if (elements.length === 0) {
      const plainText = cleanText(doc.body.textContent || '');
      if (plainText) {
        // Séparer par lignes et créer des paragraphes
        const paragraphs = plainText.split(/\n+/).filter(p => p.trim());
        paragraphs.forEach((para, idx) => {
          elements.push(
            <p key={idx} className="text-gray-700 mb-3 leading-relaxed">
              {para}
            </p>
          );
        });
      }
    }

    return elements;
  };

  const formattedContent = parseContent(content);

  return (
    <div className="space-y-2">
      {formattedContent.length > 0 ? formattedContent : (
        <p className="text-gray-700 leading-relaxed">
          {content.replace(/<[^>]*>/g, '').trim()}
        </p>
      )}
    </div>
  );
}

export default function ResultsPage() {
  const { language, setLanguage, t } = useLanguage();
  const [, setLocation] = useLocation();
  const [sessionId, setSessionId] = useState<string>("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [grantsCount, setGrantsCount] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("sessionId");
    if (id) {
      setSessionId(id);
    } else {
      setLocation("/");
    }
  }, [setLocation]);

  const { data, isLoading } = useQuery<{ 
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
  }>({
    queryKey: ["/api/results", sessionId],
    enabled: !!sessionId,
  });

  const results = data?.results || [];
  const submission = data?.submission;
  // TEMPORAIRE : Débloquer tous les résultats pour les tests
  const isPaid = true; // data?.isPaid || false;
  const visibleResults = isPaid ? results : results.slice(0, 1);
  const hasLockedResults = !isPaid && results.length > 1;

  // Initialiser le compteur au premier chargement + analytics
  useEffect(() => {
    if (results.length > 0 && grantsCount === 0) {
      setGrantsCount(results.length);
      trackResultsViewed({ matchCount: results.length, sessionId });
    }
  }, [results, grantsCount, sessionId]);

  const handleUnlock = () => {
    trackCheckoutStarted({ sessionId });
    setLocation(`/checkout?sessionId=${sessionId}`);
  };

  const handleCountUpdate = (newCount: number) => {
    setGrantsCount(newCount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-black mx-auto" />
          <p className="text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

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
          <LanguageToggle language={language} onLanguageChange={setLanguage} />
        </div>
      </header>

      {/* Main */}
      <main className="pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 md:pb-24 px-4 sm:px-6 md:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Title */}
          <div className="mb-8 sm:mb-12 md:mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-tight mb-3 sm:mb-4">
              {grantsCount > 0 ? grantsCount : results.length}
              <br />
              <span className="text-[#06D6A0]">
                {language === "fr" 
                  ? `SUBVENTION${(grantsCount > 0 ? grantsCount : results.length) > 1 ? 'S' : ''}`
                  : `GRANT${(grantsCount > 0 ? grantsCount : results.length) > 1 ? 'S' : ''}`
                }
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">
              {language === "fr" ? "Pour votre profil artistique" : "For your artistic profile"}
            </p>
          </div>

          {/* Résumé du projet */}
          {submission?.projectDescription && (
            <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                {language === "fr" ? "Votre projet" : "Your project"}
              </h3>
              <p className="text-gray-800 leading-relaxed">
                {submission.projectDescription}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {submission.status?.map((s, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-gray-200 rounded-full text-gray-600">
                    {s.replace(/-/g, ' ')}
                  </span>
                ))}
                {submission.artisticDomain?.map((d, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-[#06D6A0]/10 text-[#06D6A0] rounded-full">
                    {d.replace(/-/g, ' ')}
                  </span>
                ))}
                {submission.region && (
                  <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
                    {submission.region}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Conseil structure */}
          {submission && (
            <div className="mb-8 sm:mb-12 p-5 sm:p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Lightbulb className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-900 mb-2">
                    {language === "fr" ? "Conseil structure" : "Structure advice"}
                  </h3>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    {(() => {
                      const status = submission.status?.[0] || '';
                      const isInternational = submission.isInternational === 'oui';
                      
                      if (status === 'association') {
                        return language === "fr" 
                          ? "Votre association vous donne accès au maximum de subventions. Vous êtes éligible à toutes les aides françaises et européennes."
                          : "Your association gives you access to the maximum grants. You are eligible for all French and European funding.";
                      }
                      if (status === 'micro-entreprise' || status === 'artiste-auto') {
                        return language === "fr"
                          ? "En tant qu'indépendant, vous êtes éligible à la plupart des aides françaises. Pour accéder aux financements européens (Creative Europe), envisagez de créer une association ou de vous associer avec une structure existante."
                          : "As a freelancer, you are eligible for most French grants. To access European funding (Creative Europe), consider creating an association or partnering with an existing structure.";
                      }
                      if (status === 'porteur-projet') {
                        return language === "fr"
                          ? "En tant que porteur de projet, nous vous conseillons de créer une association (loi 1901) pour maximiser vos chances. Cela vous ouvrira l'accès aux aides régionales, nationales et européennes."
                          : "As a project leader, we advise you to create an association to maximize your chances. This will give you access to regional, national and European grants.";
                      }
                      if (status === 'artiste-auteur') {
                        return language === "fr"
                          ? "Votre statut d'artiste-auteur vous permet d'accéder aux aides de la Maison des Artistes, ADAGP, et aux bourses de création. Pour des projets plus ambitieux, une association peut être un bon complément."
                          : "Your artist-author status allows you to access grants from Maison des Artistes, ADAGP, and creation grants. For larger projects, an association can be a good complement.";
                      }
                      return language === "fr"
                        ? "Pour maximiser vos chances d'obtenir des financements, nous vous conseillons de créer une association (loi 1901). C'est gratuit, simple, et cela vous ouvre l'accès à un maximum de subventions."
                        : "To maximize your funding chances, we advise creating an association. It's free, simple, and opens access to maximum grants.";
                    })()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Chat Modal */}
          <AnimatePresence>
            {isChatOpen && (
              <ChatRefinement
                sessionId={sessionId}
                initialCount={results.length}
                onCountUpdate={handleCountUpdate}
                onClose={() => setIsChatOpen(false)}
              />
            )}
          </AnimatePresence>

          {/* Unlock Block */}
          {hasLockedResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 sm:mb-12 md:mb-16"
            >
              <div className="border-2 border-black p-6 sm:p-8 md:p-12 text-center">
                <Lock className="h-10 w-10 sm:h-12 sm:w-12 text-black mx-auto mb-4 sm:mb-6" />
                <h3 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">
                  {language === "fr" 
                    ? `${results.length - 1} subventions supplémentaires`
                    : `${results.length - 1} more grants`
                  }
                </h3>
                <p className="text-gray-600 text-base sm:text-lg mb-6 sm:mb-8">
                  {language === "fr"
                    ? "Accédez aux détails complets et aux liens de candidature"
                    : "Access full details and application links"
                  }
                </p>
                <div className="text-4xl sm:text-5xl font-bold mb-6 sm:mb-8">€2</div>
                <Button
                  size="lg"
                  className="bg-black text-white hover:bg-gray-800 rounded-full px-8 sm:px-10 py-5 sm:py-6 text-base sm:text-lg group w-full sm:w-auto"
                  onClick={handleUnlock}
                  data-testid="button-unlock"
                >
                  {language === "fr" ? "Débloquer maintenant" : "Unlock now"}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Results */}
          <div className="space-y-8">
            {visibleResults.map((grant, index) => (
              <motion.div
                key={grant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GrantCard grant={grant} index={index} language={language} t={t} sessionId={sessionId} />
              </motion.div>
            ))}
          </div>

          {/* Bottom Unlock Button */}
          {hasLockedResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 sm:mt-12 md:mt-16"
            >
              <div className="border-2 border-black p-6 sm:p-8 md:p-12 text-center">
                <Lock className="h-10 w-10 sm:h-12 sm:w-12 text-black mx-auto mb-4 sm:mb-6" />
                <h3 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">
                  {language === "fr" 
                    ? `Débloquez ${results.length - 1} ${results.length - 1 > 1 ? 'subventions supplémentaires' : 'subvention supplémentaire'}`
                    : `Unlock ${results.length - 1} more ${results.length - 1 > 1 ? 'grants' : 'grant'}`
                  }
                </h3>
                <p className="text-gray-600 text-base sm:text-lg mb-6 sm:mb-8">
                  {language === "fr"
                    ? "Accédez à tous les détails et liens de candidature pour seulement 2€"
                    : "Access all details and application links for only €2"
                  }
                </p>
                <div className="text-4xl sm:text-5xl font-bold mb-6 sm:mb-8">€2</div>
                <Button
                  size="lg"
                  className="bg-black text-white hover:bg-gray-800 rounded-full px-8 sm:px-10 py-5 sm:py-6 text-base sm:text-lg group w-full sm:w-auto"
                  onClick={handleUnlock}
                  data-testid="button-unlock-bottom"
                >
                  {language === "fr" ? "Voir toutes les subventions" : "View all grants"}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Boutons Affiner et Exporter - En bas de page */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 sm:mt-12 md:mt-16 flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              size="lg"
              variant="outline"
              onClick={() => setIsChatOpen(true)}
              className="border-2 border-black text-black hover:bg-black hover:text-white rounded-xl px-8 py-6 text-base font-bold transition-all"
              data-testid="button-open-chat"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              {language === "fr" ? "Affiner mes résultats (gratuit)" : "Refine my results (free)"}
            </Button>
            
            <SendEmailButton language={language} />
          </motion.div>
        </div>
      </main>
    </div>
  );
}

function SendEmailButton({ language }: { language: string }) {
  const { toast } = useToast();
  const sendEmailMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      return apiRequest("POST", `/api/send-email/${sessionId}`, {});
    },
    onSuccess: () => {
      toast({
        title: language === "fr" ? "Succès !" : "Success!",
        description: language === "fr" 
          ? "Email envoyé avec le PDF de vos subventions"
          : "Email sent with your grants PDF",
      });
    },
    onError: (error: any) => {
      toast({
        title: language === "fr" ? "Erreur" : "Error",
        description: error?.message || (language === "fr" ? "Impossible d'envoyer l'email" : "Failed to send email"),
        variant: "destructive",
      });
    },
  });

  const handleSendEmail = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const sessionId = searchParams.get("sessionId");
    if (sessionId) {
      sendEmailMutation.mutate(sessionId);
    }
  };

  return (
    <Button
      size="lg"
      variant="default"
      onClick={handleSendEmail}
      disabled={sendEmailMutation.isPending}
      className="bg-[#06D6A0] hover:bg-[#06D6A0]/90 text-white rounded-xl px-8 py-6 text-base font-bold transition-all"
      data-testid="button-send-email"
    >
      {sendEmailMutation.isPending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          {language === "fr" ? "Envoi..." : "Sending..."}
        </>
      ) : (
        <>
          <Mail className="mr-2 h-5 w-5" />
          {language === "fr" ? "Envoyer par email" : "Send by email"}
        </>
      )}
    </Button>
  );
}

function GrantCard({ grant, index, language, t, sessionId }: {
  grant: GrantResult;
  index: number;
  language: string;
  t: any;
  sessionId: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState<"relevant" | "not_relevant" | null>(null);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border border-gray-200 hover:border-black transition-all group" data-testid={`card-grant-${grant.id}`}>
        {/* Vue condensée - Toujours visible */}
        <div className="p-6">
          {/* En-tête compact */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                {grant.matchScore && (
                  <Badge className="bg-[#118AB2] text-white text-xs">
                    {grant.matchScore}% match
                  </Badge>
                )}
              </div>
              
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight leading-tight mb-2 break-words line-clamp-3" data-testid={`text-grant-title-${grant.id}`}>
                {grant.title}
              </h2>
              
              <p className="text-sm text-gray-600 break-words" data-testid={`text-grant-org-${grant.id}`}>
                {grant.organization}
              </p>
            </div>
            
            <div className="flex-shrink-0 text-right max-w-[140px]">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                {language === "fr" ? "Montant" : "Amount"}
              </div>
              <div className="text-base font-bold text-black leading-tight" data-testid={`badge-grant-amount-${grant.id}`}>
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
            </div>
          </div>

          {/* Deadline compact */}
          {grant.deadline && (
            <div className="mb-4 flex items-center gap-2 text-xs text-gray-600">
              <Calendar className="h-3.5 w-3.5" />
              <span data-testid={`text-grant-deadline-${grant.id}`}>
                {(() => {
                  const isOpen = new Date(grant.deadline) >= new Date();
                  return isOpen 
                    ? `${language === "fr" ? "Jusqu'au" : "Until"} ${grant.deadline}`
                    : grant.frequency || (language === "fr" ? "Session fermée" : "Closed");
                })()}
              </span>
            </div>
          )}

          {/* Match IA - VERSION COURTE */}
          {grant.matchReason && (
            <div className="bg-[#06D6A0]/5 border-l-2 border-[#06D6A0] p-3 mb-4">
              <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
                {grant.matchReason}
              </p>
            </div>
          )}

          {/* Feedback qualite du match (beta) */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-gray-400">
              {language === "fr" ? "Ce match est-il pertinent ?" : "Is this match relevant?"}
            </span>
            <button
              onClick={() => {
                setFeedback("relevant");
                trackMatchFeedback({ grantId: grant.grantId || grant.id, sessionId, rating: "relevant" });
                fetch("/api/feedback", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ sessionId, grantId: grant.grantId || grant.id, rating: "relevant" }),
                }).catch(() => {});
              }}
              className={`p-1.5 rounded-full transition-all ${
                feedback === "relevant"
                  ? "bg-green-100 text-green-600 scale-110"
                  : "text-gray-300 hover:text-green-500 hover:bg-green-50"
              }`}
              aria-label="Pertinent"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M1 8.25a1.25 1.25 0 1 1 2.5 0v7.5a1.25 1.25 0 1 1-2.5 0v-7.5ZM5.5 6v9.25a2.5 2.5 0 0 0 2.05 2.46l.41.07a14.4 14.4 0 0 0 5.6-.07l.31-.06a2 2 0 0 0 1.55-1.58l.78-4.67a1.5 1.5 0 0 0-1.48-1.75h-3.22V4.5a2.25 2.25 0 0 0-2.25-2.25.75.75 0 0 0-.67.42L5.5 6Z" />
              </svg>
            </button>
            <button
              onClick={() => {
                setFeedback("not_relevant");
                trackMatchFeedback({ grantId: grant.grantId || grant.id, sessionId, rating: "not_relevant" });
                fetch("/api/feedback", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ sessionId, grantId: grant.grantId || grant.id, rating: "not_relevant" }),
                }).catch(() => {});
              }}
              className={`p-1.5 rounded-full transition-all ${
                feedback === "not_relevant"
                  ? "bg-red-100 text-red-500 scale-110"
                  : "text-gray-300 hover:text-red-400 hover:bg-red-50"
              }`}
              aria-label="Pas pertinent"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M18.905 12.75a1.25 1.25 0 0 1-2.5 0v-7.5a1.25 1.25 0 0 1 2.5 0v7.5ZM14.405 14.5V5.25a2.5 2.5 0 0 0-2.05-2.46l-.41-.07a14.4 14.4 0 0 0-5.6.07l-.31.06a2 2 0 0 0-1.55 1.58l-.78 4.67a1.5 1.5 0 0 0 1.48 1.75h3.22v5.25a2.25 2.25 0 0 0 2.25 2.25.75.75 0 0 0 .67-.42l2.58-5.13Z" />
              </svg>
            </button>
            {feedback && (
              <span className="text-xs text-gray-400 ml-1">
                {language === "fr" ? "Merci !" : "Thanks!"}
              </span>
            )}
          </div>

          {/* Bouton compact */}
          <CollapsibleTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full border border-gray-300 hover:border-black rounded-full text-sm"
              data-testid={`button-toggle-details-${grant.id}`}
            >
              {isOpen 
                ? (language === "fr" ? "Masquer" : "Hide")
                : (language === "fr" ? "Voir les détails" : "View details")
              }
              <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
        </div>

        {/* SECTION DÉPLIABLE - Détails complets */}
        <CollapsibleContent>
          <div className="px-5 sm:px-7 md:px-10 pb-5 sm:pb-7 md:pb-10 space-y-6 sm:space-y-8 border-t border-gray-200 pt-5 sm:pt-7 md:pt-10 bg-white">
            
            {/* Description */}
            {grant.description && (
              <div>
                <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-3 sm:mb-4 font-bold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {language === "fr" ? "Description" : "Description"}
                </h4>
                <div 
                  className="text-sm sm:text-base text-gray-700 leading-relaxed space-y-3 break-words overflow-hidden" 
                  data-testid={`text-grant-description-${grant.id}`}
                >
                  <TruncatedContent content={grant.description} maxLength={600} />
                </div>
              </div>
            )}

            {/* Éligibilité */}
            {grant.eligibility && (
              <div>
                <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-3 sm:mb-4 font-bold">
                  {language === "fr" ? "Critères d'éligibilité" : "Eligibility criteria"}
                </h4>
                <div className="text-sm sm:text-base text-gray-700 leading-relaxed space-y-3 break-words overflow-hidden" data-testid={`text-grant-eligibility-${grant.id}`}>
                  <TruncatedContent content={grant.eligibility} maxLength={600} />
                </div>
              </div>
            )}

            {/* Documents requis */}
            {(grant.requirements || (grant.obligatoryDocuments && grant.obligatoryDocuments.length > 0)) && (
              <div>
                <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-4 font-bold">
                  {language === "fr" ? "Dossier à fournir" : "Required documents"}
                </h4>
                {grant.requirements && (
                  <div className="text-sm sm:text-base text-gray-700 mb-3 space-y-2 break-words overflow-hidden">
                    <TruncatedContent content={grant.requirements} maxLength={400} />
                  </div>
                )}
                {grant.obligatoryDocuments && grant.obligatoryDocuments.length > 0 && (
                  <ul className="space-y-2">
                    {grant.obligatoryDocuments.map((doc, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-[#06D6A0] mt-1 flex-shrink-0">•</span>
                        <span className="flex-1 break-words">{doc}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Statistiques */}
            {(grant.acceptanceRate || grant.annualBeneficiaries || grant.successProbability) && (
              <div className="bg-gray-50 p-4 sm:p-5 md:p-6 rounded-lg">
                <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-3 sm:mb-4 font-bold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  {language === "fr" ? "Statistiques" : "Statistics"}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  {grant.acceptanceRate && (
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-black">{grant.acceptanceRate}%</div>
                      <div className="text-xs text-gray-500 uppercase">
                        {language === "fr" ? "Taux d'acceptation" : "Acceptance rate"}
                      </div>
                    </div>
                  )}
                  {grant.annualBeneficiaries && (
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-black">{grant.annualBeneficiaries}</div>
                      <div className="text-xs text-gray-500 uppercase">
                        {language === "fr" ? "Bénéficiaires/an" : "Beneficiaries/year"}
                      </div>
                    </div>
                  )}
                  {grant.successProbability && (
                    <div>
                      <div className="text-base sm:text-lg font-bold text-black">{grant.successProbability}</div>
                      <div className="text-xs text-gray-500 uppercase">
                        {language === "fr" ? "Probabilité" : "Probability"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Processus et délais */}
            {(grant.processingTime || grant.responseDelay || grant.applicationDifficulty) && (
              <div>
                <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-4 font-bold flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {language === "fr" ? "Processus" : "Process"}
                </h4>
                <div className="space-y-2 text-sm text-gray-700">
                  {grant.processingTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">{language === "fr" ? "Durée d'instruction:" : "Processing time:"}</span>
                      <span className="font-medium">{grant.processingTime}</span>
                    </div>
                  )}
                  {grant.responseDelay && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">{language === "fr" ? "Délai de réponse:" : "Response delay:"}</span>
                      <span className="font-medium">{grant.responseDelay}</span>
                    </div>
                  )}
                  {grant.applicationDifficulty && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">{language === "fr" ? "Difficulté:" : "Difficulty:"}</span>
                      <Badge className={`${
                        grant.applicationDifficulty.toLowerCase().includes('facile') || grant.applicationDifficulty.toLowerCase().includes('easy') 
                          ? 'bg-green-100 text-green-700'
                          : grant.applicationDifficulty.toLowerCase().includes('modérée') || grant.applicationDifficulty.toLowerCase().includes('moderate')
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {grant.applicationDifficulty}
                      </Badge>
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
                  {language === "fr" ? "Conseils de préparation" : "Preparation tips"}
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">{grant.preparationAdvice}</p>
              </div>
            )}

            {/* Ressources d'aide au dépôt de dossier */}
            {grant.helpResources && grant.helpResources.length > 0 && (
              <div className="bg-purple-50 border-l-4 border-purple-400 p-4 sm:p-5 md:p-6">
                <h4 className="text-xs uppercase tracking-widest text-purple-700 mb-3 sm:mb-4 font-bold flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {language === "fr" ? "Ressources d'aide" : "Help resources"}
                </h4>
                <div className="space-y-2 sm:space-y-3">
                  {grant.helpResources.map((resource, idx) => {
                    const safeUrl = safeExternalUrl(resource.url);
                    if (!safeUrl) return null;
                    return (
                    <a
                      key={idx}
                      href={safeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow group"
                      data-testid={`link-help-resource-${idx}`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {resource.type === 'video' && <PlayCircle className="h-5 w-5 text-purple-600" />}
                        {resource.type === 'pdf' && <FileText className="h-5 w-5 text-red-600" />}
                        {resource.type === 'guide' && <BookOpen className="h-5 w-5 text-blue-600" />}
                        {resource.type === 'tutorial' && <Lightbulb className="h-5 w-5 text-yellow-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 group-hover:text-purple-700 transition-colors">
                          {resource.title}
                        </div>
                        {resource.description && (
                          <div className="text-xs text-gray-500 mt-1">
                            {resource.description}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 uppercase mt-1">
                          {resource.type === 'video' && (language === "fr" ? "Vidéo" : "Video")}
                          {resource.type === 'pdf' && "PDF"}
                          {resource.type === 'guide' && (language === "fr" ? "Guide" : "Guide")}
                          {resource.type === 'tutorial' && (language === "fr" ? "Tutoriel" : "Tutorial")}
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-colors flex-shrink-0" />
                    </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Retours d'expérience */}
            {grant.experienceFeedback && (
              <div>
                <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-3 sm:mb-4 font-bold">
                  {language === "fr" ? "Retours d'expérience" : "Experience feedback"}
                </h4>
                <p className="text-sm text-gray-600 italic">{grant.experienceFeedback}</p>
              </div>
            )}

            {/* Contact */}
            {(() => {
              const cleanEmail = extractCleanEmail(grant.contactEmail || '');
              const cleanPhone = extractCleanPhone(grant.contactPhone || '');
              if (!cleanEmail && !cleanPhone) return null;
              
              return (
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-4 font-bold">
                    {language === "fr" ? "Contact" : "Contact"}
                  </h4>
                  <div className="space-y-2">
                    {cleanEmail && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <a href={`mailto:${cleanEmail}`} className="hover:underline break-all">
                          {cleanEmail}
                        </a>
                      </div>
                    )}
                    {cleanPhone && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <a href={`tel:${cleanPhone.replace(/\s/g, '')}`} className="hover:underline">
                          {cleanPhone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Tags / Catégories */}
            {grant.tags && grant.tags.length > 0 && (
              <div>
                <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-4 font-bold">
                  {language === "fr" ? "Catégories" : "Categories"}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {grant.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="text-sm px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-full">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* BOUTON CANDIDATER - En bas de la section dépliable */}
            {safeExternalUrl(grant.url) && grant.url !== "#" && (
              <div className="pt-4 sm:pt-6 border-t border-gray-200">
                <Button
                  size="lg"
                  className="w-full bg-black text-white hover:bg-gray-800 rounded-full py-5 sm:py-6 group text-sm sm:text-base"
                  asChild
                  data-testid={`button-apply-${grant.id}`}
                >
                  <a href={safeExternalUrl(grant.url)} target="_blank" rel="noopener noreferrer">
                    {language === "fr" ? "Candidater maintenant" : "Apply now"}
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
