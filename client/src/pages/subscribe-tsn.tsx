import { GmepHeader } from "@/components/gmep-header";
import { GmepFooter } from "@/components/gmep-footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";
import { Check, Droplets, ArrowLeft, CreditCard, Loader2 } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

function PricingItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Check className="w-3.5 h-3.5 text-[#2ecc71] flex-shrink-0 mt-0.5" />
      <span>{children}</span>
    </li>
  );
}

export default function SubscribeTsnPage() {
  const { user, token } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [trialLoading, setTrialLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleTrial() {
    if (!user || !token) {
      localStorage.setItem("pending_plan", "tsn_trial");
      window.location.hash = "#/register";
      return;
    }
    setTrialLoading(true);
    setError("");
    try {
      await apiRequest("POST", `/api/tsn-trial/activate?token=${token}`, {});
      // Rediriger vers l'outil en mode essai
      window.location.href = `/api/tsn-trial?token=${token}`;
    } catch (err: any) {
      const msg = err.message || "";
      const match = msg.match(/^\d+:\s*(.+)/);
      if (match) {
        try { setError(JSON.parse(match[1]).message || match[1]); }
        catch { setError(match[1]); }
      } else {
        setError("Erreur lors de l'activation de l'essai.");
      }
    } finally {
      setTrialLoading(false);
    }
  }

  async function handleSubscribe() {
    if (!user || !token) {
      // Mémoriser le plan et rediriger vers inscription
      localStorage.setItem("pending_plan", "tsn_annual");
      window.location.hash = "#/register";
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await apiRequest("POST", `/api/stripe/create-checkout?token=${token}`, { plan: "tsn_annual" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.message || "Erreur lors de la création du paiement");
      }
    } catch (err: any) {
      setError("Erreur lors de la création du paiement. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <GmepHeader />
      <div className="flex-1 px-4 py-12 max-w-lg mx-auto w-full">
        <button
          onClick={() => (window.location.hash = "#/")}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Retour
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{ background: "#1e8449" }}>
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-foreground">Transfert Sol → Nappe → Captage</h1>
            <p className="text-xs text-muted-foreground">Modèle Domenico (1987) — Licence annuelle</p>
          </div>
        </div>

        <div className="rounded-xl border-2 p-6 shadow-md relative bg-white" style={{ borderColor: "#2ecc71" }}>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold text-white px-4 py-1 rounded-full" style={{ background: "#2ecc71" }}>
            Licence annuelle
          </div>

          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-4xl font-extrabold text-foreground">1 100€</span>
            <span className="text-sm text-muted-foreground">HT/an</span>
          </div>
          <p className="text-xs text-muted-foreground mb-6">Facturation annuelle. Résiliable à l'échéance.</p>

          <ul className="space-y-2 mb-6 text-sm">
            <PricingItem>Transfert Sol→Nappe→Captage complet</PricingItem>
            <PricingItem>24 polluants (COHV, BTEX, HAP, PFAS, Métaux)</PricingItem>
            <PricingItem>24 types de sol avec propriétés hydrauliques</PricingItem>
            <PricingItem>Rapport PDF + éditeur de texte intégré</PricingItem>
            <PricingItem>Schéma conceptuel automatique</PricingItem>
            <PricingItem>Licence mono-poste + mises à jour</PricingItem>
            <PricingItem>Support par e-mail</PricingItem>
          </ul>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-md p-3 mb-4">
              {error}
            </div>
          )}

          <Button
            className="w-full text-white font-semibold text-sm py-3"
            style={{ background: "#2ecc71" }}
            disabled={loading}
            onClick={handleSubscribe}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CreditCard className="w-4 h-4 mr-2" />}
            {user ? "Procéder au paiement" : "S'inscrire et s'abonner"}
          </Button>

          <div className="relative my-4 flex items-center">
            <div className="flex-1 border-t border-border" />
            <span className="mx-3 text-xs text-muted-foreground">ou</span>
            <div className="flex-1 border-t border-border" />
          </div>

          <Button
            variant="outline"
            className="w-full text-sm font-medium"
            disabled={trialLoading}
            onClick={handleTrial}
          >
            {trialLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {user ? "Essai gratuit 8 jours (3 molécules)" : "S'inscrire + Essai gratuit 8 jours"}
          </Button>

          {!user && (
            <p className="text-center text-xs text-muted-foreground mt-3">
              Déjà un compte ?{" "}
              <button
                className="text-primary hover:underline font-medium"
                onClick={() => { localStorage.setItem("pending_plan", "tsn_annual"); window.location.hash = "#/login"; }}
              >
                Se connecter
              </button>
            </p>
          )}
        </div>

        <div className="mt-4 bg-green-50 border border-green-100 rounded-lg p-4 text-xs text-green-800">
          <strong>Note :</strong> L'outil Transfert Sol→Nappe est disponible uniquement en licence annuelle. Aucun abonnement mensuel pour ce module.
        </div>
      </div>
      <GmepFooter />
    </div>
  );
}
