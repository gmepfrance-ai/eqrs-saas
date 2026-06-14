import { V2Header } from "@/components/v2-header";
import { V2Footer } from "@/components/v2-footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Check, FlaskConical, ArrowLeft, CreditCard, Loader2 } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";

function PricingItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Check className="w-3.5 h-3.5 text-[#2ecc71] flex-shrink-0 mt-0.5" />
      <span>{children}</span>
    </li>
  );
}

export default function SubscribeEqrsV31EcotoxPage() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [trialLoading, setTrialLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleTrial() {
    if (!user || !token) {
      localStorage.setItem("pending_plan", "eqrs_v31_ecotox_trial");
      window.location.hash = "#/register";
      return;
    }
    setTrialLoading(true);
    setError("");
    try {
      await apiRequest("POST", `/api/eqrs-v31-ecotox-trial/activate?token=${token}`, {});
      window.location.href = `/api/eqrs-v31-ecotox-tool?token=${token}`;
    } catch (err: any) {
      const msg = err.message || "";
      // Si l'utilisateur a déjà un essai/abonnement actif (409), on ouvre directement l'outil
      if (msg.startsWith("409:") || msg.toLowerCase().includes("déjà un accès")) {
        window.location.href = `/api/eqrs-v31-ecotox-tool?token=${token}`;
        return;
      }
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
      localStorage.setItem("pending_plan", "eqrs_v31_ecotox_monthly");
      window.location.hash = "#/register";
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await apiRequest("POST", `/api/stripe/create-checkout?token=${token}`, { plan: "eqrs_v31_ecotox_monthly" });
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
    <div className="v2-page min-h-screen flex flex-col bg-background">
      <V2Header />
      <div className="flex-1 px-4 py-12 max-w-lg mx-auto w-full">
        <button
          onClick={() => (window.location.hash = "#/")}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Retour
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{ background: "#1a5276" }}>
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-foreground">EQRS V31.05 + ECOTOX V8</h1>
            <p className="text-xs text-muted-foreground">HHRA + ERE — 104 substances + écotoxicologie — Abonnement mensuel</p>
          </div>
        </div>

        <div className="rounded-xl border-2 p-6 shadow-md relative bg-white" style={{ borderColor: "#2ecc71" }}>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold text-white px-4 py-1 rounded-full" style={{ background: "#2ecc71" }}>
            HHRA + ERE — Abonnement mensuel
          </div>

          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-4xl font-extrabold text-foreground">395€</span>
            <span className="text-sm text-muted-foreground">HT/mois</span>
          </div>
          <p className="text-xs text-muted-foreground mb-6">Facturation mensuelle. Résiliable à tout moment.</p>

          <ul className="space-y-2 mb-6 text-sm">
            <PricingItem>104 substances HHRA + 12 substances écotox</PricingItem>
            <PricingItem>5 modules avancés (Monte-Carlo, calcul inverse, temporel, trophique, mélange)</PricingItem>
            <PricingItem>Écotoxicologie Tier 1 (7 récepteurs) + Tier 2 (5 prédateurs)</PricingItem>
            <PricingItem>Cascade PNEC INERIS / ECHA REACH / US EPA Eco-SSL</PricingItem>
            <PricingItem>Rapport PDF 14 pages + cartographie Leaflet IGN/BRGM</PricingItem>
            <PricingItem>Conformité INERIS ERS 2021, ANSES 2018, US EPA RAGS</PricingItem>
            <PricingItem>Formation à distance + études de cas utilisateur</PricingItem>
            <PricingItem>Mises à jour réglementaires incluses</PricingItem>
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
            {user ? "Démarrer mon essai 14 jours" : "S'inscrire + Essai gratuit 14 jours"}
          </Button>

          {!user && (
            <p className="text-center text-xs text-muted-foreground mt-3">
              Déjà un compte ?{" "}
              <button
                className="text-primary hover:underline font-medium"
                onClick={() => { localStorage.setItem("pending_plan", "eqrs_v31_ecotox_monthly"); window.location.hash = "#/login"; }}
              >
                Se connecter
              </button>
            </p>
          )}
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4 text-xs text-blue-800">
          <strong>Note :</strong> l'essai gratuit de 14 jours et l'abonnement utilisent le même compte. Si vous testez déjà un autre logiciel GMEP, votre mot de passe reste identique.
        </div>
      </div>
      <V2Footer />
    </div>
  );
}
