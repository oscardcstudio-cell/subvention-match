import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Home from "@/pages/Home";
import FormWizard from "@/pages/FormWizard";
import LoadingPage from "@/pages/LoadingPage";
import ResultsPage from "@/pages/ResultsPage";
import DemoResultsPage from "@/pages/DemoResultsPage";
import CardPreviewPage from "@/pages/CardPreviewPage";
import EnrichedResultsPage from "@/pages/EnrichedResultsPage";
import ResultsGraphPage from "@/pages/ResultsGraphPage";
import CheckoutPage from "@/pages/CheckoutPage";
import AdminPage from "@/pages/AdminPage";
import GrantsAdminPage from "@/pages/GrantsAdminPage";
import Stats from "@/pages/Stats";
import EnrichmentMonitor from "@/pages/EnrichmentMonitor";
import ApiMonitoring from "@/pages/ApiMonitoring";
import ApiTest from "@/pages/ApiTest";
import DataQuality from "@/pages/DataQuality";
import Notes from "@/pages/Notes";
import TestFormWithResults from "@/pages/TestFormWithResults";
import DocumentationPage from "@/pages/DocumentationPage";
import { MentionsLegales, CGV, PolitiqueConfidentialite } from "@/pages/LegalPages";
import { CookieBanner } from "@/components/CookieBanner";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import NotFound from "@/pages/not-found";

/**
 * Scroll window to top on every route change.
 * Wouter doesn't do this automatically. Without this, a user who
 * scrolled down the homepage and clicks a profile card lands on /form
 * still scrolled to the bottom — confusing.
 */
function ScrollToTopOnRouteChange() {
  const [location] = useLocation();
  useEffect(() => {
    // Use "instant" to avoid perceivable scroll-jank on navigation
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location]);
  return null;
}

function Router() {
  return (
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
      <Route component={NotFound} />
    </Switch>
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
