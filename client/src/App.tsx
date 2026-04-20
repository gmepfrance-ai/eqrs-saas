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
      <Route path="/stats" component={StatsPage} />
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
