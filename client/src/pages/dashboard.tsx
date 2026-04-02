import { useState } from "react";
import { GmepHeader } from "@/components/gmep-header";
import { GmepFooter } from "@/components/gmep-footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import {
  Loader2,
  CreditCard,
  ExternalLink,
  Check,
  AlertCircle,
  Beaker,
  Settings,
} from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user, token, subscription, refreshUser, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [activateLoading, setActivateLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Check for checkout result in URL
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("checkout=success")) {
      setMessage("Paiement réussi ! Votre abonnement est maintenant actif.");
      refreshUser();
    } else if (hash.includes("checkout=cancel")) {
      setMessage("Paiement annulé.");
    }
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <GmepHeader />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
        <GmepFooter />
      </div>
    );
  }

  const isActive = subscription?.status === "active" || subscription?.status === "trialing";

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
    <div className="min-h-screen flex flex-col bg-background">
      <GmepHeader />

      <div className="flex-1 px-4 py-8 max-w-3xl mx-auto w-full">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-foreground" data-testid="text-dashboard-welcome">
            Bonjour, {user.name}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Bienvenue dans votre espace EQRS Johnson &amp; Ettinger.
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

        {/* Active subscription: show tool access */}
        {isActive && (
          <div className="mb-8">
            <div className="bg-card border border-card-border rounded-lg p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                  style={{ background: "#2ecc71" }}
                >
                  <Beaker className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    Outil EQRS Johnson &amp; Ettinger
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    {subscription?.status === "trialing" ? (
                      <>
                        <span className="text-amber-600 font-semibold">Essai gratuit</span> — Vous bénéficiez d'un accès gratuit pendant 14 jours (jusqu'au {subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString("fr-FR") : ""}). Souscrivez un abonnement avant la fin de l'essai pour continuer.
                      </>
                    ) : (
                      "Votre abonnement est actif. Vous pouvez accéder à l'outil de modélisation."
                    )}
                  </p>
                  <Button
                    data-testid="button-access-tool"
                    className="bg-[#2ecc71] hover:bg-[#27ae60] text-white font-semibold"
                    onClick={() =>
                      (window.location.hash = `#/app?token=${token}`)
                    }
                  >
                    <Beaker className="w-4 h-4 mr-2" />
                    Accéder à l'outil EQRS
                  </Button>
                </div>
              </div>
            </div>

            {/* Subscription info */}
            <div className="bg-card border border-card-border rounded-lg p-5 shadow-sm mt-4">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Mon abonnement
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Statut</span>
                  <span
                    data-testid="text-subscription-status"
                    className="inline-flex items-center gap-1 font-medium text-[#2ecc71]"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Actif
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Formule</span>
                  <span className="font-medium text-foreground">
                    {subscription?.plan === "trial" ? "Essai gratuit (14 jours)" : subscription?.plan === "annual" ? "Annuel (2 499€/an)" : "Mensuel (245€/mois)"}
                  </span>
                </div>
                {subscription?.currentPeriodEnd && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Prochain renouvellement
                    </span>
                    <span className="font-medium text-foreground">
                      {new Date(
                        subscription.currentPeriodEnd
                      ).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                )}
                {(subscription as any)?.licenseKey && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Clé d'activation</span>
                      <span className="font-mono font-bold text-foreground bg-muted px-3 py-1 rounded text-sm tracking-wider">
                        {(subscription as any).licenseKey}
                      </span>
                    </div>
                    <p className="text-[0.65rem] text-muted-foreground mt-1">
                      Cette clé est liée à votre poste de travail. Ne la partagez pas.
                    </p>
                  </div>
                )}
              </div>
              {subscription?.status === "trialing" ? (
                <div className="mt-4 pt-3 border-t border-border">
                  <p className="text-xs text-amber-600 font-medium mb-3">Passez à un abonnement payant pour continuer après l'essai :</p>
                  <div className="flex gap-2">
                    <Button
                      data-testid="button-upgrade-monthly"
                      size="sm"
                      className="bg-[#2ecc71] hover:bg-[#27ae60] text-white text-xs"
                      disabled={checkoutLoading}
                      onClick={() => handleCheckout("monthly")}
                    >
                      Mensuel — 245€/mois
                    </Button>
                    <Button
                      data-testid="button-upgrade-annual"
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      disabled={checkoutLoading}
                      onClick={() => handleCheckout("annual")}
                    >
                      Annuel — 2 499€/an (-15%)
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 pt-3 border-t border-border">
                  <button
                    data-testid="button-manage-subscription"
                    onClick={handlePortal}
                    disabled={portalLoading}
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                  >
                    {portalLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <ExternalLink className="w-3 h-3" />
                    )}
                    Gérer mon abonnement
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* No subscription: show pricing */}
        {!isActive && (
          <div className="mb-8">
            <div className="bg-orange-50 border border-orange-200 rounded-md p-4 mb-6">
              <p className="text-sm text-orange-800 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Abonnement requis pour accéder à l'outil EQRS
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Monthly */}
              <div className="bg-card border border-card-border rounded-lg p-5 shadow-sm">
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  Mensuel
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-extrabold text-foreground">
                    245€
                  </span>
                  <span className="text-xs text-muted-foreground">/mois</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  Résiliable à tout moment
                </p>
                <Button
                  data-testid="button-checkout-monthly"
                  className="w-full"
                  disabled={checkoutLoading === "monthly"}
                  onClick={() => handleCheckout("monthly")}
                >
                  {checkoutLoading === "monthly" ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <CreditCard className="w-4 h-4 mr-2" />
                  )}
                  S'abonner
                </Button>
              </div>

              {/* Annual */}
              <div
                className="rounded-lg border-2 p-5 shadow-sm relative"
                style={{ borderColor: "#2ecc71", background: "hsl(var(--card))" }}
              >
                <div
                  className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[0.65rem] font-semibold text-white px-2.5 py-0.5 rounded-full"
                  style={{ background: "#2ecc71" }}
                >
                  -15%
                </div>
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  Annuel
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-extrabold text-foreground">
                    2 499€
                  </span>
                  <span className="text-xs text-muted-foreground">/an</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  Soit ~208€/mois
                </p>
                <Button
                  data-testid="button-checkout-annual"
                  className="w-full text-white font-semibold"
                  style={{ background: "#2ecc71" }}
                  disabled={checkoutLoading === "annual"}
                  onClick={() => handleCheckout("annual")}
                >
                  {checkoutLoading === "annual" ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <CreditCard className="w-4 h-4 mr-2" />
                  )}
                  S'abonner
                </Button>
              </div>
            </div>

            {/* Conditions de licence */}
            <div className="mt-4 bg-muted/50 rounded-md p-3 text-[0.7rem] text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Conditions :</strong> Tarif par poste de travail. Chaque abonnement donne droit à une clé d'activation unique, liée à un seul poste. Pour plusieurs postes, une licence supplémentaire est requise par poste.
            </div>


          </div>
        )}
      </div>

      <GmepFooter />
    </div>
  );
}
