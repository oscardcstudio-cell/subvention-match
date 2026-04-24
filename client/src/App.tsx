import { Switch, Route, useLocation } from "wouter";
import { lazy, Suspense, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CookieBanner } from "@/components/CookieBanner";
import { FeedbackWidget } from "@/components/FeedbackWidget";

// ── Critical path — eager loaded ─────────────────────────────────────────────
import Home from "@/pages/Home";
import FormWizard from "@/pages/FormWizard";
import LoadingPage from "@/pages/LoadingPage";
import ResultsPage from "@/pages/ResultsPage";

// ── Non-critical — lazy loaded (split into separate chunks) ──────────────────
const DemoResultsPage     = lazy(() => import("@/pages/DemoResultsPage"));
const CardPreviewPage     = lazy(() => import("@/pages/CardPreviewPage"));
const EnrichedResultsPage = lazy(() => import("@/pages/EnrichedResultsPage"));
const ResultsGraphPage    = lazy(() => import("@/pages/ResultsGraphPage"));
const CheckoutPage        = lazy(() => import("@/pages/CheckoutPage"));
const AdminPage           = lazy(() => import("@/pages/AdminPage"));
const GrantsAdminPage     = lazy(() => import("@/pages/GrantsAdminPage"));
const Stats               = lazy(() => import("@/pages/Stats"));
const EnrichmentMonitor   = lazy(() => import("@/pages/EnrichmentMonitor"));
const ApiMonitoring       = lazy(() => import("@/pages/ApiMonitoring"));
const ApiTest             = lazy(() => import("@/pages/ApiTest"));
const DataQuality         = lazy(() => import("@/pages/DataQuality"));
const Notes               = lazy(() => import("@/pages/Notes"));
const TestFormWithResults = lazy(() => import("@/pages/TestFormWithResults"));
const DocumentationPage   = lazy(() => import("@/pages/DocumentationPage"));
const AchrafProfile       = lazy(() => import("@/pages/AchrafProfile"));
const NotFound            = lazy(() => import("@/pages/not-found"));

// Named exports from LegalPages — on extrait chaque export comme default
const MentionsLegales        = lazy(() => import("@/pages/LegalPages").then(m => ({ default: m.MentionsLegales })));
const CGV                    = lazy(() => import("@/pages/LegalPages").then(m => ({ default: m.CGV })));
const PolitiqueConfidentialite = lazy(() => import("@/pages/LegalPages").then(m => ({ default: m.PolitiqueConfidentialite })));

/**
 * Scroll window to top on every route change.
 * Wouter doesn't do this automatically. Without this, a user who
 * scrolled down the homepage and clicks a profile card lands on /form
 * still scrolled to the bottom — confusing.
 */
function ScrollToTopOnRouteChange() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location]);
  return null;
}

// Fallback minimal dark — évite le flash blanc pendant le chargement d'un chunk
const PageFallback = <div className="min-h-screen" style={{ background: "var(--mc-bg)" }} />;

function Router() {
  return (
    <Suspense fallback={PageFallback}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/form" component={FormWizard} />
        <Route path="/loading" component={LoadingPage} />
        <Route path="/results" component={ResultsPage} />
        <Route path="/demo" component={DemoResultsPage} />
        <Route path="/card-preview" component={CardPreviewPage} />
        <Route path="/enriched" component={EnrichedResultsPage} />
        <Route path="/results-graph" component={ResultsGraphPage} />
        <Route path="/checkout" component={CheckoutPage} />
        <Route path="/admin" component={AdminPage} />
        <Route path="/admin/grants" component={GrantsAdminPage} />
        <Route path="/stats" component={Stats} />
        <Route path="/enrichment-monitor" component={EnrichmentMonitor} />
        <Route path="/api-status" component={ApiMonitoring} />
        <Route path="/api-test" component={ApiTest} />
        <Route path="/data-quality" component={DataQuality} />
        <Route path="/notes" component={Notes} />
        <Route path="/test-form" component={TestFormWithResults} />
        <Route path="/documentation" component={DocumentationPage} />
        <Route path="/mentions-legales" component={MentionsLegales} />
        <Route path="/cgv" component={CGV} />
        <Route path="/confidentialite" component={PolitiqueConfidentialite} />
        <Route path="/achraf" component={AchrafProfile} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <ScrollToTopOnRouteChange />
          <Toaster />
          <Router />
          <FeedbackWidget />
          <CookieBanner />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
