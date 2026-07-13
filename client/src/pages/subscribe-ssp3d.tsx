import { V2Header } from "@/components/v2-header";
import { navigateTo } from "@/lib/navigation";
import { V2Footer } from "@/components/v2-footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Check, Box, ArrowLeft, CreditCard, Loader2 } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";

function PricingItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Check className="w-3.5 h-3.5 text-[#0891b2] flex-shrink-0 mt-0.5" />
      <span>{children}</span>
    </li>
  );
}

export default function SubscribeSsp3dPage() {
  const { user, token } = useAuth();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [loading, setLoading] = useState(false);
  const [trialLoading, setTrialLoading] = useState(false);
  const [error, setError] = useState("");

  const plan = billingCycle === "annual" ? "ssp3d_annual" : "ssp3d_monthly";

  async function handleTrial() {
    if (!user || !token) {
      localStorage.setItem("pending_plan", "ssp3d_trial");
      navigateTo("/register");
      return;
    }
    setTrialLoading(true);
    setError("");
    try {
      await apiRequest("POST", `/api/ssp3d-trial/activate?token=${token}`, {});
      window.location.href = `/api/ssp3d-tool?token=${token}`;
    } catch (err: any) {
      const msg = err.message || "";
      if (msg.startsWith("409:") || msg.toLowerCase().includes("déjà un accès")) {
        window.location.href = `/api/ssp3d-tool?token=${token}`;
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
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{ background: "#0891b2" }}>
            <Box className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-foreground">3D_SSP — Superposition 3D pollution sols/nappe</h1>
            <p className="text-xs text-muted-foreground">Visualisation 3D interactive · imports SAR³ / TNS / MSP · rapport PDF</p>
          </div>
        </div>

        {/* Toggle mensuel / annuel */}
        <div className="flex justify-center gap-2 mb-6">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              billingCycle === "monthly"
                ? "bg-[#0891b2] text-white border-[#0891b2]"
                : "bg-white text-muted-foreground border-border hover:border-[#0891b2]"
            }`}
          >
            Mensuel — 250 € HT/mois
          </button>
          <button
            onClick={() => setBillingCycle("annual")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              billingCycle === "annual"
                ? "bg-[#0891b2] text-white border-[#0891b2]"
                : "bg-white text-muted-foreground border-border hover:border-[#0891b2]"
            }`}
          >
            Annuel — 2 400 € HT/an
          </button>
        </div>

        <div className="rounded-xl border-2 p-6 shadow-md relative bg-white" style={{ borderColor: "#0891b2" }}>
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold text-white px-4 py-1 rounded-full"
            style={{ background: "#0891b2" }}
          >
            {billingCycle === "annual" ? "Annuel — 20 % d'économie" : "Mensuel — sans engagement"}
          </div>

          <div className="flex items-baseline gap-1 mb-1">
            {billingCycle === "annual" ? (
              <>
                <span className="text-4xl font-extrabold text-foreground">2 400 €</span>
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
            <PricingItem>Import direct des fichiers JSON SAR³, TNS et MSP</PricingItem>
            <PricingItem>Superposition 3D de la source de pollution des sols et de la nappe</PricingItem>
            <PricingItem>Positionnement par rapport aux ouvrages, bâtiments, voiries et espaces verts</PricingItem>
            <PricingItem>Interpolation IDW des concentrations en volume 3D</PricingItem>
            <PricingItem>Plan de gestion des terres excavées (classification 17 05 04 / 17 05 03*)</PricingItem>
            <PricingItem>Exagération verticale ajustable et navigation caméra libre</PricingItem>
            <PricingItem>Export du rapport PDF illustré</PricingItem>
            <PricingItem>Éditeur de données manuel intégré</PricingItem>
            <PricingItem>Mises à jour incluses</PricingItem>
            <PricingItem>Support par e-mail</PricingItem>
          </ul>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-md p-3 mb-4">
              {error}
            </div>
          )}

          <Button
            className="w-full text-white font-semibold text-sm py-3"
            style={{ background: "#0891b2" }}
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

        <div className="mt-4 bg-cyan-50 border border-cyan-100 rounded-lg p-4 text-xs text-cyan-800">
          <strong>Essai gratuit 8 jours</strong> — Aucune carte bancaire requise pour démarrer. Accès complet au logiciel 3D_SSP pendant 8 jours.
        </div>
      </div>
      <V2Footer />
    </div>
  );
}
