import { useState } from "react";
import { navigateTo } from "@/lib/navigation";
import { V2Header } from "@/components/v2-header";
import { V2Footer } from "@/components/v2-footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";
import { apiRequest } from "@/lib/queryClient";
import {
  Loader2,
  CreditCard,
  ExternalLink,
  Check,
  AlertCircle,
  Beaker,
  Settings,
  Droplets,
  Waves,
  MapPin,
} from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user, token, subscription, tsnSubscription, rabattementSubscription, refreshUser, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [activateLoading, setActivateLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Check for checkout result in URL (query string)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    if (checkout === "success") {
      setMessage("Paiement réussi ! Votre abonnement est maintenant actif.");
      refreshUser();
    } else if (checkout === "cancel") {
      setMessage("Paiement annulé.");
    }
  }, []);

  // Auto-checkout ou auto-essai si un plan est passé dans l'URL après inscription/connexion
  useEffect(() => {
    if (!token || authLoading) return;
    const params = new URLSearchParams(window.location.search);
    const plan = params.get("checkout");
    if (plan && plan !== "success" && plan !== "cancel") {
      // Retirer le paramètre checkout de l'URL sans recharger la page
      params.delete("checkout");
      const cleanSearch = params.toString();
      window.history.replaceState(
        null,
        "",
        window.location.pathname + (cleanSearch ? `?${cleanSearch}` : "")
      );
      if (plan === "tsn_trial") {
        // Activer l'essai TSN puis rediriger vers l'outil
        fetch(`/api/tsn-trial/activate?token=${token}`, { method: "POST", headers: {"Content-Type":"application/json"} })
          .then(r => r.json())
          .then(() => { window.location.href = `/api/tsn-trial?token=${token}`; })
          .catch(() => { navigateTo("/subscribe-tsn"); });
      } else if (plan === "rabattement_trial") {
        fetch(`/api/rabattement-trial/activate?token=${token}`, { method: "POST", headers: {"Content-Type":"application/json"} })
          .then(r => r.json())
          .then(() => { window.location.href = `/api/rabattement-tool?token=${token}`; })
          .catch(() => { navigateTo("/subscribe-rabattement"); });
      } else if (plan === "eqrs_v31_ecotox_trial") {
        fetch(`/api/eqrs-v31-ecotox-trial/activate?token=${token}`, { method: "POST", headers: {"Content-Type":"application/json"} })
          .then(r => r.json())
          .then(() => { window.location.href = `/api/eqrs-v31-ecotox-tool?token=${token}`; })
          .catch(() => { navigateTo("/subscribe-eqrs-v31-ecotox"); });
      } else if (plan === "schema_conceptuel_trial") {
        fetch(`/api/schema-conceptuel-trial/activate?token=${token}`, { method: "POST", headers: {"Content-Type":"application/json"} })
          .then(r => r.json())
          .then(() => { window.location.href = `/api/schema-conceptuel-tool?token=${token}`; })
          .catch(() => { navigateTo("/subscribe-schema-conceptuel"); });
      } else if (plan === "msp_trial") {
        fetch(`/api/msp-trial/activate?token=${token}`, { method: "POST", headers: {"Content-Type":"application/json"} })
          .then(r => r.json())
          .then(() => { window.location.href = `/api/msp-tool?token=${token}`; })
          .catch(() => { navigateTo("/subscribe-msp"); });
      } else if (plan === "eaux_pluviales_trial") {
        fetch(`/api/eaux-pluviales-trial/activate?token=${token}`, { method: "POST", headers: {"Content-Type":"application/json"} })
          .then(r => r.json())
          .then(() => { window.location.href = `/api/eaux-pluviales-tool?token=${token}`; })
          .catch(() => { navigateTo("/subscribe-eaux-pluviales"); });
      } else {
        handleCheckout(plan);
      }
    }
  }, [token, authLoading]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  if (authLoading || !user) {
    return (
      <div className="v2-page min-h-screen flex flex-col bg-background">
        <V2Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
        <V2Footer />
      </div>
    );
  }

  const isActive = subscription?.status === "active" || subscription?.status === "trialing";
  const isTsnActive = tsnSubscription?.status === "active" || tsnSubscription?.status === "trialing";
  const isRabattementActive = rabattementSubscription?.status === "active" || rabattementSubscription?.status === "trialing";

  async function handleCheckout(plan: string) {
    setCheckoutLoading(plan);
    try {
      const res = await apiRequest(
        "POST",
        `/api/stripe/create-checkout?token=${token}`,
        { plan }
      );
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank");
      } else {
        setMessage(data.message || "Erreur lors de la création du paiement");
      }
    } catch (err: any) {
      const msg = err.message || "";
      const match = msg.match(/^\d+:\s*(.+)/);
      if (match) {
        try {
          const parsed = JSON.parse(match[1]);
          setMessage(parsed.message || "Erreur");
        } catch {
          setMessage(match[1]);
        }
      } else {
        setMessage("Configuration Stripe en cours. Utilisez le mode démo ci-dessous.");
      }
    } finally {
      setCheckoutLoading(null);
    }
  }

  async function handleDevActivate() {
    setActivateLoading(true);
    try {
      await apiRequest("POST", `/api/dev/activate?token=${token}`, {
        plan: "monthly",
      });
      await refreshUser();
      setMessage("Abonnement activé en mode démonstration !");
    } catch (err: any) {
      setMessage("Erreur lors de l'activation.");
    } finally {
      setActivateLoading(false);
    }
  }

  async function handlePortal() {
    setPortalLoading(true);
    try {
      const res = await apiRequest(
        "GET",
        `/api/stripe/portal?token=${token}`
      );
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank");
      } else {
        setMessage(data.message || "Erreur");
      }
    } catch (err: any) {
      setMessage("Portail de gestion non disponible en mode démo.");
    } finally {
      setPortalLoading(false);
    }
  }

  return (
    <div className="v2-page min-h-screen flex flex-col bg-background">
      <V2Header />

      <div className="flex-1 px-4 py-8 max-w-3xl mx-auto w-full">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-foreground" data-testid="text-dashboard-welcome">
            {t("dashboard.hello")} {user.name}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("dashboard.welcome")}
          </p>
        </div>

        {/* Messages */}
        {message && (
          <div
            data-testid="text-dashboard-message"
            className="bg-primary/5 border border-primary/20 text-primary text-sm rounded-md p-3 mb-6 flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {message}
          </div>
        )}

        {/* ─── SECTION SIMPLIFIÉE : Vos 5 outils ───────────────────── */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4">Vos logiciels GMEP — Tous en essai gratuit</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* EQRS V7 J&E */}
            <div className="bg-white border-2 border-[#1a5276] rounded-lg p-4 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded bg-[#1a5276] text-white flex items-center justify-center text-xs font-bold">V7</div>
                <h3 className="text-sm font-bold text-foreground">EQRS V7 Johnson &amp; Ettinger</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">74 substances — Calcul QD &amp; ERI — EPA 2004</p>
              <p className="text-xs mb-3"><span className="text-amber-600 font-semibold">Essai 8 jours</span> — 208 € HT/mois ensuite</p>
              <button className="w-full bg-[#1a5276] text-white py-2 rounded font-semibold text-sm hover:bg-[#0e2f44]"
                onClick={() => { window.location.href = `/api/tool?token=${token}`; }}>
                Accéder →
              </button>
            </div>

            {/* EQRS V9 + ECOTOX V9 */}
            <div className="bg-white border-2 border-[#1a5276] rounded-lg p-4 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded bg-[#1a5276] text-white flex items-center justify-center text-xs font-bold">V9</div>
                <h3 className="text-sm font-bold text-foreground">EQRS V9 + ECOTOX V9</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">104 substances HHRA + 47 écotox Tier 3 — PFAS, PCB, métaux</p>
              <p className="text-xs mb-3"><span className="text-amber-600 font-semibold">Essai 8 jours</span> — 395 € HT/mois ensuite</p>
              <button className="w-full bg-[#1a5276] text-white py-2 rounded font-semibold text-sm hover:bg-[#0e2f44]"
                onClick={() => { window.location.href = `/api/eqrs-v31-ecotox-tool?token=${token}`; }}>
                Accéder →
              </button>
            </div>

            {/* TSN */}
            <div className="bg-white border-2 border-[#1e8449] rounded-lg p-4 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded bg-[#1e8449] text-white flex items-center justify-center text-xs font-bold">TSN</div>
                <h3 className="text-sm font-bold text-foreground">TSN Transfert Sol-Nappe</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Domenico 1987 — Hub'eau — IOTA R.214-1</p>
              <p className="text-xs mb-3"><span className="text-amber-600 font-semibold">Essai 8 jours</span> — 1 100 € HT/an ensuite</p>
              <button className="w-full bg-[#1e8449] text-white py-2 rounded font-semibold text-sm hover:opacity-90"
                onClick={() => { window.location.href = `/api/tsn-tool?token=${token}`; }}>
                Accéder →
              </button>
            </div>

            {/* Rabattement V15.89 */}
            <div className="bg-white border-2 border-[#1a365d] rounded-lg p-4 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded bg-[#1a365d] text-white flex items-center justify-center text-xs font-bold">RAB</div>
                <h3 className="text-sm font-bold text-foreground">Rabattement V15.89</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Forchheimer multicouche — IA — Loi sur l'Eau</p>
              <p className="text-xs mb-3"><span className="text-amber-600 font-semibold">Essai 8 jours</span> — 1 500 € HT/an ensuite</p>
              <button className="w-full bg-[#1a365d] text-white py-2 rounded font-semibold text-sm hover:opacity-90"
                onClick={() => { window.location.href = `/api/rabattement-tool?token=${token}`; }}>
                Accéder →
              </button>
            </div>

            {/* Piézomètres v2.9c */}
            <div className="bg-white border-2 border-[#0e6b3c] rounded-lg p-4 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded bg-[#0e6b3c] text-white flex items-center justify-center text-xs font-bold">PZ</div>
                <h3 className="text-sm font-bold text-foreground">GMEP Piézomètres v2.9c</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Dimensionnement — Loi sur l'Eau — IOTA R.214-1</p>
              <p className="text-xs mb-3"><span className="text-amber-600 font-semibold">Essai 8 jours</span> — 1 100 € HT/an ensuite</p>
              <button className="w-full bg-[#0e6b3c] text-white py-2 rounded font-semibold text-sm hover:opacity-90"
                onClick={() => { window.location.href = `/api/piezometres-tool?token=${token}`; }}>
                Accéder →
              </button>
            </div>

            {/* Schéma Conceptuel */}
            <div className="bg-white border-2 border-[#6f42c1] rounded-lg p-4 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded bg-[#6f42c1] text-white flex items-center justify-center text-xs font-bold">SC</div>
                <h3 className="text-sm font-bold text-foreground">Schéma Conceptuel</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">SVG Source › Vecteur › Cible — IEM + PG</p>
              <p className="text-xs mb-3"><span className="text-amber-600 font-semibold">Essai 8 jours</span> — 850 € HT/an ensuite</p>
              <button className="w-full bg-[#6f42c1] text-white py-2 rounded font-semibold text-sm hover:opacity-90"
                onClick={() => { window.location.href = `/api/schema-conceptuel-tool?token=${token}`; }}>
                Accéder →
              </button>
            </div>

            {/* MSP — Modélisation Sources de Pollution des Sols */}
            <div className="bg-white border-2 border-[#16a34a] rounded-lg p-4 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded bg-[#16a34a] text-white flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-foreground">MSP — Pollution des Sols</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">ISDI · Arrêté 12/12/2014 · Décret 2023-1408 · Purge IDW</p>
              <p className="text-xs mb-3"><span className="text-amber-600 font-semibold">Essai 8 jours</span> — 250 € HT/mois ou 2 760 € HT/an</p>
              <button className="w-full bg-[#16a34a] text-white py-2 rounded font-semibold text-sm hover:opacity-90"
                onClick={() => { window.location.href = `/api/msp-tool?token=${token}`; }}>
                Accéder →
              </button>
            </div>

            {/* Eaux Pluviales DLE/GEP v2.1 */}
            <div className="bg-white border-2 border-[#1A6FB5] rounded-lg p-4 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded bg-[#1A6FB5] text-white flex items-center justify-center text-xs font-bold">EP</div>
                <h3 className="text-sm font-bold text-foreground">Eaux Pluviales DLE/GEP v2.1</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Loi sur l'Eau IOTA 2.1.5.0 / 3.3.1.0 — IA Porchet — Bassin rétention</p>
              <p className="text-xs mb-3"><span className="text-amber-600 font-semibold">Essai 8 jours</span> — 3 500 € HT/an ensuite</p>
              <button className="w-full bg-[#1A6FB5] text-white py-2 rounded font-semibold text-sm hover:opacity-90"
                onClick={() => {
                  fetch(`/api/eaux-pluviales-trial/activate?token=${token}`, { method: "POST", headers: {"Content-Type":"application/json"} })
                    .then(() => { window.location.href = `/api/eaux-pluviales-tool?token=${token}`; })
                    .catch(() => { window.location.href = `/api/eaux-pluviales-tool?token=${token}`; });
                }}>
                Accéder →
              </button>
            </div>
            {/* EQRS V9 + ECOTOX V9 + Module HUMAIN Tier 3 */}
            <div className="bg-white border-2 border-[#2ECC71] rounded-lg p-4 shadow-sm hover:shadow-md transition" style={{position:"relative"}}>
              <span className="absolute top-2 right-2 bg-[#2ECC71] text-white text-xs font-bold px-2 py-0.5 rounded-full">NOUVEAU — Tier 3</span>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded bg-[#2ECC71] text-white flex items-center justify-center text-xs font-bold">HUM</div>
                <h3 className="text-sm font-bold text-foreground">EQRS V9 + Module HUMAIN</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Voie alimentaire humaine — 47 substances Tier 3 — PFAS, PCB, métaux, HAP</p>
              <p className="text-xs mb-3"><span className="text-amber-600 font-semibold">Essai 8 jours</span> — 550 € HT/mois ensuite</p>
              <button className="w-full text-white py-2 rounded font-semibold text-sm hover:opacity-90" style={{backgroundColor:"#2ECC71"}}
                onClick={() => { window.location.href = `/api/eqrs-v8-humain-tool?token=${token}`; }}>
                Accéder →
              </button>
            </div>

          </div>
          <p className="text-xs text-muted-foreground mt-3 italic">
            À l'expiration de chaque essai, l'outil affiche une page d'avertissement avec le bouton pour souscrire l'abonnement correspondant. Aucun prélèvement automatique.
          </p>
        </div>

      </div>

      <V2Footer />
    </div>
  );
}
