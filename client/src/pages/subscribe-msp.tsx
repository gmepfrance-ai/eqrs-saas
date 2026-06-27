import { V2Header } from "@/components/v2-header";
import { navigateTo } from "@/lib/navigation";
import { V2Footer } from "@/components/v2-footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Check, MapPin, ArrowLeft, CreditCard, Loader2 } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";

function PricingItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Check className="w-3.5 h-3.5 text-[#16a34a] flex-shrink-0 mt-0.5" />
      <span>{children}</span>
    </li>
  );
}

export default function SubscribeMspPage() {
  const { user, token } = useAuth();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [loading, setLoading] = useState(false);
  const [trialLoading, setTrialLoading] = useState(false);
  const [error, setError] = useState("");

  const plan = billingCycle === "annual" ? "msp_annual" : "msp_monthly";

  async function handleTrial() {
    if (!user || !token) {
      localStorage.setItem("pending_plan", "msp_trial");
      navigateTo("/register");
      return;
    }
    setTrialLoading(true);
    setError("");
    try {
      await apiRequest("POST", `/api/msp-trial/activate?token=${token}`, {});
      window.location.href = `/api/msp-tool?token=${token}`;
    } catch (err: any) {
      const msg = err.message || "";
      if (msg.startsWith("409:") || msg.toLowerCase().includes("déjà un accès")) {
        window.location.href = `/api/msp-tool?token=${token}`;
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
      localStorage.setItem("pending_plan", plan);
      navigateTo("/register");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await apiRequest("POST", `/api/stripe/create-checkout?token=${token}`, { plan });
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
          onClick={() => {
            if (user && token) navigateTo(`/dashboard?token=${token}&checkout=cancel`);
            else navigateTo("/");
          }}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> {user ? "Retour au tableau de bord" : "Retour"}
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{ background: "#16a34a" }}>
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-foreground">MSP — Modélisation de la Pollution des Sols</h1>
            <p className="text-xs text-muted-foreground">Diagnostic ISDI · Arrêté 12/12/2014 · Décret 2023-1408</p>
          </div>
        </div>

        {/* Toggle mensuel / annuel */}
        <div className="flex justify-center gap-2 mb-6">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              billingCycle === "monthly"
                ? "bg-[#16a34a] text-white border-[#16a34a]"
                : "bg-white text-muted-foreground border-border hover:border-[#16a34a]"
            }`}
          >
            Mensuel — 250 € HT/mois
          </button>
          <button
            onClick={() => setBillingCycle("annual")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              billingCycle === "annual"
                ? "bg-[#16a34a] text-white border-[#16a34a]"
                : "bg-white text-muted-foreground border-border hover:border-[#16a34a]"
            }`}
          >
            Annuel — 2 760 € HT/an
          </button>
        </div>

        <div className="rounded-xl border-2 p-6 shadow-md relative bg-white" style={{ borderColor: "#16a34a" }}>
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold text-white px-4 py-1 rounded-full"
            style={{ background: "#16a34a" }}
          >
            {billingCycle === "annual" ? "Annuel — 2 mois offerts" : "Mensuel — sans engagement"}
          </div>

          <div className="flex items-baseline gap-1 mb-1">
            {billingCycle === "annual" ? (
              <>
                <span className="text-4xl font-extrabold text-foreground">2 760 €</span>
                <span className="text-sm text-muted-foreground">HT/an</span>
              </>
            ) : (
              <>
                <span className="text-4xl font-extrabold text-foreground">250 €</span>
                <span className="text-sm text-muted-foreground">HT/mois</span>
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-6">
            {billingCycle === "annual"
              ? "Facturation annuelle. Résiliable à l'échéance."
              : "Facturation mensuelle. Résiliable à tout moment."}
          </p>

          <ul className="space-y-2 mb-6 text-sm">
            <PricingItem>Saisie multi-sondages avec profils de concentrations</PricingItem>
            <PricingItem>Comparaison automatique aux seuils ISDI (Arrêté 12/12/2014)</PricingItem>
            <PricingItem>Comparaison VSA/VSB (Décret 2023-1408)</PricingItem>
            <PricingItem>Identification des zones de purge obligatoire</PricingItem>
            <PricingItem>Interpolation IDW 2D/3D et cartographie colorimétrique</PricingItem>
            <PricingItem>Calcul automatique des volumes et masses de terres</PricingItem>
            <PricingItem>Rapport PDF complet livrable client (6 pages)</PricingItem>
            <PricingItem>Export CSV / GeoJSON</PricingItem>
            <PricingItem>Mises à jour réglementaires incluses</PricingItem>
            <PricingItem>Support par e-mail</PricingItem>
          </ul>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-md p-3 mb-4">
              {error}
            </div>
          )}

          <Button
            className="w-full text-white font-semibold text-sm py-3"
            style={{ background: "#16a34a" }}
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
            {user ? "Essai gratuit 8 jours" : "S'inscrire + Essai gratuit 8 jours"}
          </Button>

          {!user && (
            <p className="text-center text-xs text-muted-foreground mt-3">
              Déjà un compte ?{" "}
              <button
                className="text-primary hover:underline font-medium"
                onClick={() => { localStorage.setItem("pending_plan", plan); navigateTo("/login"); }}
              >
                Se connecter
              </button>
            </p>
          )}
        </div>

        <div className="mt-4 bg-green-50 border border-green-100 rounded-lg p-4 text-xs text-green-800">
          <strong>Essai gratuit 8 jours</strong> — Aucune carte bancaire requise pour démarrer. Accès complet au logiciel MSP pendant 8 jours.
        </div>
      </div>
      <V2Footer />
    </div>
  );
}
