import { V2Header } from "@/components/v2-header";
import { navigateTo } from "@/lib/navigation";
import { V2Footer } from "@/components/v2-footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Check, ArrowLeft, CreditCard, Loader2, Leaf } from "lucide-react";
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

export default function SubscribeEqrsV8HumainPage() {
  const { user, token } = useAuth();
  const [loadingMonthly, setLoadingMonthly] = useState(false);
  const [loadingAnnual, setLoadingAnnual] = useState(false);
  const [trialLoading, setTrialLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleTrial() {
    if (!user || !token) {
      localStorage.setItem("pending_plan", "humain_monthly");
      navigateTo("/register");
      return;
    }
    setTrialLoading(true);
    setError("");
    try {
      await apiRequest("POST", `/api/eqrs-v8-humain-trial/activate?token=${token}`, {});
      window.location.href = `/api/eqrs-v8-humain-tool?token=${token}`;
    } catch (err: any) {
      const msg = err.message || "";
      if (msg.startsWith("409:") || msg.toLowerCase().includes("déjà un accès")) {
        window.location.href = `/api/eqrs-v8-humain-tool?token=${token}`;
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

  async function handleSubscribe(plan: "humain_monthly" | "humain_annual") {
    if (!user || !token) {
      localStorage.setItem("pending_plan", plan);
      navigateTo("/register");
      return;
    }
    plan === "humain_monthly" ? setLoadingMonthly(true) : setLoadingAnnual(true);
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
      setLoadingMonthly(false);
      setLoadingAnnual(false);
    }
  }

  return (
    <div className="v2-page min-h-screen flex flex-col bg-background">
      <V2Header />
      <div className="flex-1 px-4 py-12 max-w-2xl mx-auto w-full">
        <button
          onClick={() => {
            if (user && token) navigateTo(`/dashboard?token=${token}&checkout=cancel`);
            else navigateTo("/tarifs");
          }}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> {user ? "Retour au tableau de bord" : "Retour aux tarifs"}
        </button>

        {/* En-tête produit */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{ background: "#1a5226" }}>
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-foreground">EQRS V8 + ECOTOX + Module HUMAIN</h1>
            <p className="text-xs text-muted-foreground">Voie alimentaire humaine — chaîne trophique PFAS/PCB/métaux — Tier 3</p>
          </div>
        </div>

        {/* Badge NOUVEAU */}
        <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-xs font-semibold text-white" style={{ background: "#2ecc71" }}>
          ★ Premier logiciel français intégrant la voie alimentaire humaine (EFSA 2020)
        </div>

        {/* Grille 2 options : mensuel + annuel */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>

          {/* Card mensuel */}
          <div className="rounded-xl border-2 p-6 shadow-md relative bg-white" style={{ borderColor: "#2ecc71" }}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold text-white px-4 py-1 rounded-full whitespace-nowrap" style={{ background: "#2ecc71" }}>
              Mensuel
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-extrabold text-foreground">550€</span>
              <span className="text-sm text-muted-foreground">HT/mois</span>
            </div>
            <p className="text-xs text-muted-foreground mb-1">660 € TTC/mois (TVA 20 %)</p>
            <p className="text-xs text-muted-foreground mb-4">Résiliable à tout moment.</p>
            <Button
              className="w-full text-white font-semibold text-sm py-3"
              style={{ background: "#2ecc71" }}
              disabled={loadingMonthly}
              onClick={() => handleSubscribe("humain_monthly")}
            >
              {loadingMonthly ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CreditCard className="w-4 h-4 mr-2" />}
              {user ? "Procéder au paiement" : "S'inscrire et s'abonner"}
            </Button>
          </div>

          {/* Card annuel */}
          <div className="rounded-xl border-2 p-6 shadow-md relative bg-white" style={{ borderColor: "#f39c12" }}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold text-white px-4 py-1 rounded-full whitespace-nowrap" style={{ background: "#f39c12" }}>
              Annuel — Économie 1 400 €
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-extrabold text-foreground">5 200€</span>
              <span className="text-sm text-muted-foreground">HT/an</span>
            </div>
            <p className="text-xs text-muted-foreground mb-1">6 240 € TTC/an (~520 € TTC/mois)</p>
            <p className="text-xs text-muted-foreground mb-4">Facture annuelle unique.</p>
            <Button
              className="w-full font-semibold text-sm py-3 text-white"
              style={{ background: "#f39c12" }}
              disabled={loadingAnnual}
              onClick={() => handleSubscribe("humain_annual")}
            >
              {loadingAnnual ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CreditCard className="w-4 h-4 mr-2" />}
              {user ? "Procéder au paiement" : "S'inscrire et s'abonner"}
            </Button>
          </div>
        </div>

        {/* Fonctionnalités incluses */}
        <div className="rounded-xl border p-6 bg-white mb-6">
          <h3 className="font-bold text-sm mb-4" style={{ color: "#1a2b4a" }}>Fonctionnalités incluses — EQRS V8 + ECOTOX + Module HUMAIN</h3>
          <ul className="space-y-2 text-sm" style={{ columns: 2, columnGap: "2rem" }}>
            <PricingItem>Tout EQRS V8 + ECOTOX V8 inclus</PricingItem>
            <PricingItem>Voie végétale — TF sol→plante (Blaine 2014)</PricingItem>
            <PricingItem>Voie élevage — BTF fourrage→tissu (Battelle 2019)</PricingItem>
            <PricingItem>Voie aquatique — BAF eau→poisson (Burkhard 2021)</PricingItem>
            <PricingItem>7 substances : PFOS, PFOA, PCB, B[a]P, Cd, MeHg, As</PricingItem>
            <PricingItem>VTR EFSA 2020 — TWI PFAS somme 4 = 4,4 ng/kg/sem</PricingItem>
            <PricingItem>4 profils récepteurs (adulte, enfant, femme enceinte, pêcheur)</PricingItem>
            <PricingItem>QD + ERI alimentaires + sommation INERIS DRC-09-103096</PricingItem>
            <PricingItem>Note technique chaîne trophique + cas brochet PFOS incluse</PricingItem>
            <PricingItem>Formation initiale 1h incluse (annuel)</PricingItem>
            <PricingItem>Support prioritaire 72h ouvrées</PricingItem>
            <PricingItem>Mises à jour réglementaires EFSA incluses</PricingItem>
          </ul>
        </div>

        {/* Essai gratuit */}
        <div className="rounded-xl border p-5 bg-white mb-4">
          <div className="text-center mb-4">
            <span className="text-sm font-semibold text-muted-foreground">ou commencer avec</span>
          </div>
          <Button
            variant="outline"
            className="w-full text-sm font-medium"
            disabled={trialLoading}
            onClick={handleTrial}
          >
            {trialLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {user ? "Démarrer mon essai gratuit 8 jours" : "S'inscrire + Essai gratuit 8 jours (sans CB)"}
          </Button>
          {!user && (
            <p className="text-center text-xs text-muted-foreground mt-3">
              Déjà un compte ?{" "}
              <button
                className="text-primary hover:underline font-medium"
                onClick={() => { localStorage.setItem("pending_plan", "humain_monthly"); navigateTo("/login"); }}
              >
                Se connecter
              </button>
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-md p-3 mb-4">
            {error}
          </div>
        )}

        <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4 text-xs text-blue-800">
          <strong>Référence normative :</strong> INERIS DRC-09-103096-09387C. Validation terrain : brochet PFOS, BAF 7 200 L/kg (Burkhard 2021, Minnesota), QD pêcheur = 4,1 — risque chronique inacceptable confirmé.
        </div>
      </div>
      <V2Footer />
    </div>
  );
}
