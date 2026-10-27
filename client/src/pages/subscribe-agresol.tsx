import { V2Header } from "@/components/v2-header";
import { navigateTo } from "@/lib/navigation";
import { V2Footer } from "@/components/v2-footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Check, Layers, ArrowLeft, CreditCard, Loader2 } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";

function PricingItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Check className="w-3.5 h-3.5 text-[#0f6e56] flex-shrink-0 mt-0.5" />
      <span>{children}</span>
    </li>
  );
}

export default function SubscribeAgresolPage() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [trialLoading, setTrialLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleTrial() {
    if (!user || !token) {
      localStorage.setItem("pending_plan", "agresol_trial");
      navigateTo("/register");
      return;
    }
    setTrialLoading(true);
    setError("");
    try {
      await apiRequest("POST", `/api/agresol-trial/activate?token=${token}`, {});
      window.location.href = `/api/agresol-tool?token=${token}`;
    } catch (err: any) {
      const msg = err.message || "";
      if (msg.startsWith("409:") || msg.toLowerCase().includes("déjà un accès")) {
        window.location.href = `/api/agresol-tool?token=${token}`;
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
      localStorage.setItem("pending_plan", "agresol_annual");
      navigateTo("/register");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await apiRequest("POST", `/api/stripe/create-checkout?token=${token}`, { plan: "agresol_annual" });
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

  function handleBack() {
    if (user && token) {
      navigateTo(`/dashboard?token=${token}&checkout=cancel`);
    } else {
      navigateTo("/");
    }
  }

  return (
    <div className="v2-page min-h-screen flex flex-col bg-background">
      <V2Header />
      <div className="flex-1 px-4 py-12 max-w-lg mx-auto w-full">
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> {user ? "Retour au tableau de bord" : "Retour"}
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{ background: "#0f6e56" }}>
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-foreground">AGRESOL</h1>
            <p className="text-xs text-muted-foreground">Agressivité des eaux, des gaz du sol et des sols acides sur les fondations</p>
          </div>
        </div>

        <div className="rounded-xl border-2 p-6 shadow-md relative bg-white" style={{ borderColor: "#0f6e56" }}>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold text-white px-4 py-1 rounded-full" style={{ background: "#0f6e56" }}>
            Licence annuelle
          </div>

          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-4xl font-extrabold text-foreground">1 250€</span>
            <span className="text-sm text-muted-foreground">HT/an</span>
          </div>
          <p className="text-xs text-muted-foreground mb-6">Facturation annuelle. Résiliable à l'échéance.</p>

          <ul className="space-y-2 mb-6 text-sm">
            <PricingItem>Chimie de la nappe : pH, CO₂ agressif, NH₄⁺, Mg²⁺, SO₄²⁻ — tableau 2 de la NF EN 206+A2/CN</PricingItem>
            <PricingItem>Import automatique des rapports de laboratoire (PDF texte, Excel, CSV)</PricingItem>
            <PricingItem>Gaz du sol et COHV : équilibre avec l'eau interstitielle, acidité produite par la dégradation</PricingItem>
            <PricingItem>Sols acides et sulfures (pyrite, acidité Baumann-Gully, H₂S) — FD P18-011</PricingItem>
            <PricingItem>Venting, sparging et ISCO : effets sur l'agressivité des eaux</PricingItem>
            <PricingItem>Gradient d'oxydant (O₂) et potentiel redox autour des ouvrages, réglables par couche</PricingItem>
            <PricingItem>Classe d'exposition au contact de chaque pieu, longrine ou radier</PricingItem>
            <PricingItem>Géolocalisation IGN, cadastre et banque du sous-sol du BRGM</PricingItem>
            <PricingItem>Rapport d'étude au format G.M.E.P en PDF, repères de suivi de la nappe</PricingItem>
            <PricingItem>Index des études, export / import JSON</PricingItem>
            <PricingItem>Support par e-mail + mises à jour normatives</PricingItem>
          </ul>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-md p-3 mb-4">
              {error}
            </div>
          )}

          <Button
            className="w-full text-white font-semibold text-sm py-3"
            style={{ background: "#0f6e56" }}
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
            {user ? "Essai gratuit 14 jours" : "S'inscrire + Essai gratuit 14 jours"}
          </Button>

          {!user && (
            <p className="text-center text-xs text-muted-foreground mt-3">
              Déjà un compte ?{" "}
              <button
                className="text-primary hover:underline font-medium"
                onClick={() => { localStorage.setItem("pending_plan", "agresol_annual"); navigateTo("/login"); }}
              >
                Se connecter
              </button>
            </p>
          )}
        </div>

        <div className="mt-4 bg-teal-50 border border-teal-100 rounded-lg p-4 text-xs text-teal-800">
          <strong>Note :</strong> AGRESOL est disponible en licence annuelle (1 250 € HT/an), également incluse dans les packs de la suite SSP. AGRESOL indique les classes d'exposition correspondant à la chimie mesurée et modélisée ; le choix de la classe, des bétons, des enrobages et des dispositions constructives relève du géotechnicien, du bureau d'études structure et de l'entreprise de génie civil. L'essai gratuit de 14 jours donne accès à toutes les fonctionnalités sans engagement.
        </div>
      </div>
      <V2Footer />
    </div>
  );
}
