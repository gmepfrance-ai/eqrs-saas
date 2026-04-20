import { useState } from "react";
import { GmepHeader } from "@/components/gmep-header";
import { GmepFooter } from "@/components/gmep-footer";
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
} from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user, token, subscription, tsnSubscription, refreshUser, loading: authLoading } = useAuth();
  const { t } = useTranslation();
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

  // Auto-checkout ou auto-essai si un plan est passé dans l'URL après inscription/connexion
  useEffect(() => {
    if (!token || authLoading) return;
    const hash = window.location.hash;
    const match = hash.match(/checkout=([a-z_]+)/);
    if (match && match[1] && match[1] !== "success" && match[1] !== "cancel") {
      const plan = match[1];
      window.location.hash = hash.replace(/[&?]?checkout=[a-z_]+/, "");
      if (plan === "tsn_trial") {
        // Activer l'essai TSN puis rediriger vers l'outil
        fetch(`/api/tsn-trial/activate?token=${token}`, { method: "POST", headers: {"Content-Type":"application/json"} })
          .then(r => r.json())
          .then(() => { window.location.href = `/api/tsn-trial?token=${token}`; })
          .catch(() => { window.location.hash = "#/subscribe-tsn"; });
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
  const isTsnActive = tsnSubscription?.status === "active" || tsnSubscription?.status === "trialing";

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

        {/* Outils disponibles */}
        {(isActive || isTsnActive) && (
          <div className="mb-8">
            {isActive && (
            <div className="bg-card border border-card-border rounded-lg p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0" style={{ background: "#1a5276" }}>
                  <Beaker className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-foreground mb-1">{t("dashboard.toolTitle")}</h3>
                  <p className="text-xs text-muted-foreground mb-1">Modèle J&E EPA 2004 — 74 substances</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    {subscription?.status === "trialing" ? (
                      <><span className="text-amber-600 font-semibold">{t("dashboard.trial.label")}</span>{" "}
                      — Essai jusqu'au {subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString("fr-FR") : ""}</>
                    ) : (
                      <>Abonnement actif — {subscription?.plan === "annual" ? "245€ HT/mois (annuel)" : "245€ HT/mois"} — expire le {subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString("fr-FR") : ""}</>
                    )}
                  </p>
                  <Button data-testid="button-access-tool" className="text-white font-semibold" style={{background:"#1a5276"}}
                    onClick={() => (window.location.hash = `#/app?token=${token}`)}>
                    <Beaker className="w-4 h-4 mr-2" />{t("dashboard.accessTool")}
                  </Button>
                </div>
              </div>
            </div>
            )}

            {/* Outil TSN */}
            {isTsnActive && (
            <div className="bg-card border border-card-border rounded-lg p-6 shadow-sm mt-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0" style={{ background: "#1e8449" }}>
                  <Droplets className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-foreground mb-1">{t("dashboard.tsnTitle")}</h3>
                  <p className="text-xs text-muted-foreground mb-1">
                    {tsnSubscription?.plan === "tsn_trial" ? "Mode Essai — 3 molécules (PCE, TCE, Benzène)" : "Modèle Domenico (1987) — 24 polluants"}
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    {tsnSubscription?.status === "trialing" ? (
                      <><span className="text-amber-600 font-semibold">Essai gratuit</span>{" "}
                      — Essai jusqu'au {tsnSubscription?.currentPeriodEnd ? new Date(tsnSubscription.currentPeriodEnd).toLocaleDateString("fr-FR") : ""}</>
                    ) : (
                      <>Abonnement actif — 1 100€ HT/an — expire le {tsnSubscription?.currentPeriodEnd ? new Date(tsnSubscription.currentPeriodEnd).toLocaleDateString("fr-FR") : ""}</>
                    )}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {tsnSubscription?.plan === "tsn_trial" ? (
                      <Button data-testid="button-access-tsn-trial" style={{ background: "#1e8449" }}
                        className="text-white font-semibold hover:opacity-90"
                        onClick={() => { window.location.href = `/api/tsn-trial?token=${token}`; }}>
                        <Droplets className="w-4 h-4 mr-2" />Accéder à l'essai (3 molécules)
                      </Button>
                    ) : (
                      <Button data-testid="button-access-tsn" style={{ background: "#1e8449" }}
                        className="text-white font-semibold hover:opacity-90"
                        onClick={() => (window.location.hash = `#/tsn?token=${token}`)}>
                        <Droplets className="w-4 h-4 mr-2" />{t("dashboard.accessTsn")}
                      </Button>
                    )}
                    {tsnSubscription?.status === "trialing" && (
                      <Button size="sm" variant="outline" className="text-xs border-[#1e8449] text-[#1e8449]"
                        onClick={() => (window.location.hash = "#/subscribe-tsn")}>
                        S'abonner — 1 100€ HT/an
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            )}

            {/* Subscription info */}
            <div className="bg-card border border-card-border rounded-lg p-5 shadow-sm mt-4">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                {t("dashboard.mySubscription")}
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("dashboard.status")}</span>
                  <span
                    data-testid="text-subscription-status"
                    className="inline-flex items-center gap-1 font-medium text-[#2ecc71]"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {t("dashboard.statusActive")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("dashboard.plan")}</span>
                  <span className="font-medium text-foreground">
                    {subscription?.plan === "trial"
                      ? "Essai gratuit (14 jours)"
                      : subscription?.plan === "annual"
                      ? "Annuel (2 499€/an)"
                      : "Mensuel (245€/mois)"}
                  </span>
                </div>
                {subscription?.currentPeriodEnd && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("dashboard.nextRenewal")}
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
                      <span className="text-muted-foreground">{t("dashboard.licenseKey")}</span>
                      <span className="font-mono font-bold text-foreground bg-muted px-3 py-1 rounded text-sm tracking-wider">
                        {(subscription as any).licenseKey}
                      </span>
                    </div>
                    <p className="text-[0.65rem] text-muted-foreground mt-1">
                      {t("dashboard.licenseWarning")}
                    </p>
                  </div>
                )}
              </div>
              {subscription?.status === "trialing" ? (
                <div className="mt-4 pt-3 border-t border-border">
                  <p className="text-xs text-amber-600 font-medium mb-3">{t("dashboard.upgradePrompt")}</p>
                  <div className="flex gap-2">
                    <Button
                      data-testid="button-upgrade-monthly"
                      size="sm"
                      className="bg-[#2ecc71] hover:bg-[#27ae60] text-white text-xs"
                      disabled={!!checkoutLoading}
                      onClick={() => handleCheckout("monthly")}
                    >
                      {t("landing.pricing.monthly")} — 245€/{t("landing.pricing.perMonth").replace("/", "")}
                    </Button>
                    <Button
                      data-testid="button-upgrade-annual"
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      disabled={!!checkoutLoading}
                      onClick={() => handleCheckout("annual")}
                    >
                      {t("landing.pricing.annual")} — 2 499€/{t("landing.pricing.perYear").replace("/", "")} (-15%)
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
                    {t("dashboard.manageSubscription")}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* No subscription: show pricing */}
        {(!isActive || !isTsnActive) && (
          <div className="mb-8">
            <div className="bg-orange-50 border border-orange-200 rounded-md p-4 mb-6">
              <p className="text-sm text-orange-800 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Souscrivez à un ou plusieurs outils ci-dessous
              </p>
            </div>

            {/* ── EQRS J&E ── */}
            {!isActive && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded flex items-center justify-center text-white" style={{background:"#1a5276"}}><Beaker className="w-3.5 h-3.5"/></div>
                <span className="text-sm font-bold text-foreground">EQRS Johnson & Ettinger</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="bg-card border border-card-border rounded-lg p-4 shadow-sm">
                  <div className="text-xs font-medium text-muted-foreground mb-1">Mensuel</div>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-xl font-extrabold text-foreground">245€</span>
                    <span className="text-xs text-muted-foreground">HT/mois</span>
                  </div>
                  <Button data-testid="button-checkout-monthly" className="w-full" size="sm"
                    disabled={checkoutLoading === "monthly"} onClick={() => handleCheckout("monthly")}>
                    {checkoutLoading === "monthly" ? <Loader2 className="w-3 h-3 animate-spin mr-1"/> : <CreditCard className="w-3 h-3 mr-1"/>}
                    S'abonner
                  </Button>
                </div>
                <div className="rounded-lg border-2 p-4 shadow-sm relative" style={{borderColor:"#3b82f6", background:"hsl(var(--card))"}}>
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-[0.6rem] font-semibold text-white px-2 py-0.5 rounded-full" style={{background:"#3b82f6"}}>-15%</div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">Annuel</div>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-xl font-extrabold text-foreground">2 499€</span>
                    <span className="text-xs text-muted-foreground">HT/an</span>
                  </div>
                  <Button data-testid="button-checkout-annual" className="w-full text-white font-semibold" size="sm"
                    style={{background:"#3b82f6"}} disabled={checkoutLoading === "annual"} onClick={() => handleCheckout("annual")}>
                    {checkoutLoading === "annual" ? <Loader2 className="w-3 h-3 animate-spin mr-1"/> : <CreditCard className="w-3 h-3 mr-1"/>}
                    S'abonner
                  </Button>
                </div>
              </div>
            </div>
            )}

            {/* ── Transfert Sol→Nappe ── */}
            {!isTsnActive && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded flex items-center justify-center text-white" style={{background:"#1e8449"}}><Droplets className="w-3.5 h-3.5"/></div>
                <span className="text-sm font-bold text-foreground">Transfert Sol → Nappe → Captage</span>
              </div>
              <div className="rounded-lg border-2 p-4 shadow-sm relative" style={{borderColor:"#2ecc71", background:"hsl(var(--card))"}}>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-[0.6rem] font-semibold text-white px-2 py-0.5 rounded-full" style={{background:"#2ecc71"}}>Annuel uniquement</div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Licence annuelle</div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-xl font-extrabold text-foreground">1 100€</span>
                  <span className="text-xs text-muted-foreground">HT/an</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">Rapport PDF + schéma conceptuel + éditeur intégré</p>
                <Button data-testid="button-checkout-tsn" className="w-full text-white font-semibold" size="sm"
                  style={{background:"#2ecc71"}} disabled={checkoutLoading === "tsn_annual"} onClick={() => handleCheckout("tsn_annual")}>
                  {checkoutLoading === "tsn_annual" ? <Loader2 className="w-3 h-3 animate-spin mr-1"/> : <CreditCard className="w-3 h-3 mr-1"/>}
                  S'abonner
                </Button>
              </div>
            </div>
            )}

            {/* Conditions de licence */}
            <div className="mt-4 bg-muted/50 rounded-md p-3 text-[0.7rem] text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Conditions :</strong> {t("dashboard.conditions")}
            </div>
          </div>
        )}
      </div>

      <GmepFooter />
    </div>
  );
}
