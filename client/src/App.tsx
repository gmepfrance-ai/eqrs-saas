import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "@/lib/hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { useEffect } from "react";
import { LanguageProvider } from "@/lib/i18n";
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import ForgotPasswordPage from "@/pages/forgot-password";
import StatsPage from "@/pages/stats";
import DashboardPage from "@/pages/dashboard";
import ToolPage from "@/pages/tool";
import TsnPage from "@/pages/tsn";
import SubscribeTsnPage from "@/pages/subscribe-tsn";
import RabattementPage from "@/pages/rabattement";
import SubscribeRabattementPage from "@/pages/subscribe-rabattement";
import TarifsPage from "@/pages/tarifs";
import ContactPage from "@/pages/contact";
import MentionsLegalesPage from "@/pages/mentions-legales";
import CgvPage from "@/pages/cgv";
import EqrsV3105EcotoxPage from "@/pages/eqrs-v31-05-ecotox";
import RabattementV1585Page from "@/pages/rabattement-v15-85";
import TsnTransfertSolNappePage from "@/pages/tsn-transfert-sol-nappe";
import SchemaConceptuelPage from "@/pages/schema-conceptuel";
import SubscribeEqrsV31EcotoxPage from "@/pages/subscribe-eqrs-v31-ecotox";
import SubscribeSchemaConceptuelPage from "@/pages/subscribe-schema-conceptuel";
import SubscribePiezometresPage from "@/pages/subscribe-piezometres";
import SubscribeMspPage from "@/pages/subscribe-msp";
import NotFound from "@/pages/not-found";

const API_BASE_TRACK = "__PORT_5000__".startsWith("__") ? "" : "__PORT_5000__";

function usePageTracker() {
  useEffect(() => {
    const track = () => {
      const path = window.location.hash.replace(/#/, "").split("?")[0] || "/";
      fetch(`${API_BASE_TRACK}/api/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      }).catch(() => {});
    };
    track();
    window.addEventListener("hashchange", track);
    return () => window.removeEventListener("hashchange", track);
  }, []);
}

function AppRouter() {
  usePageTracker();
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/app" component={ToolPage} />
      <Route path="/tsn" component={TsnPage} />
      <Route path="/subscribe-tsn" component={SubscribeTsnPage} />
      <Route path="/rabattement" component={RabattementPage} />
      <Route path="/subscribe-rabattement" component={SubscribeRabattementPage} />
      <Route path="/stats" component={StatsPage} />
      <Route path="/tarifs" component={TarifsPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/mentions-legales" component={MentionsLegalesPage} />
      <Route path="/cgv" component={CgvPage} />
      <Route path="/eqrs-v31-05-ecotox" component={EqrsV3105EcotoxPage} />
      <Route path="/rabattement-v15-85" component={RabattementV1585Page} />
      <Route path="/tsn-transfert-sol-nappe" component={TsnTransfertSolNappePage} />
      <Route path="/schema-conceptuel" component={SchemaConceptuelPage} />
      <Route path="/subscribe-eqrs-v31-ecotox" component={SubscribeEqrsV31EcotoxPage} />
      <Route path="/subscribe-schema-conceptuel" component={SubscribeSchemaConceptuelPage} />
      <Route path="/subscribe-piezometres" component={SubscribePiezometresPage} />
      <Route path="/subscribe-msp" component={SubscribeMspPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <LanguageProvider>
          <Router hook={useHashLocation}>
            <AuthProvider>
              <AppRouter />
            </AuthProvider>
          </Router>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
