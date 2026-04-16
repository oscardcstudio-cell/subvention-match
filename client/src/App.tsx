import { Switch, Route } from "wouter";
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
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/form" component={FormWizard} />
      <Route path="/loading" component={LoadingPage} />
      <Route path="/results" component={ResultsPage} />
      <Route path="/demo" component={DemoResultsPage} />
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
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
