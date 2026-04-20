import { GmepHeader } from "@/components/gmep-header";
import { GmepFooter } from "@/components/gmep-footer";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { DemoCalculator } from "@/components/demo-calculator";
import {
  Beaker,
  Shield,
  Zap,
  BarChart3,
  ChevronRight,
  Check,
  Droplets,
  FlaskConical,
} from "lucide-react";

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function LandingPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <GmepHeader />

      {/* Hero */}
      <section
        className="relative py-20 sm:py-28 px-4 text-center text-white overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, #0e2f44 0%, #1a5276 40%, #2471a3 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
            <Beaker className="w-4 h-4" />
            <span>{t("landing.hero.badge")}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 leading-tight">
            {t("landing.hero.title1")}
            <br />
            <span className="text-[#2ecc71]">{t("landing.hero.title2")}</span>
          </h1>
          <p className="text-base sm:text-lg text-white/80 max-w-xl mx-auto mb-8 leading-relaxed">
            {t("landing.hero.desc")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              data-testid="button-cta-register"
              size="lg"
              className="bg-[#2ecc71] hover:bg-[#27ae60] text-white font-semibold px-8"
              onClick={() => (window.location.hash = "#/register")}
            >
              {t("landing.hero.cta")}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
            <Button
              data-testid="button-cta-pricing"
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
              onClick={() => scrollToSection("pricing")}
            >
              {t("landing.hero.seePricing")}
            </Button>
          </div>
          <p className="mt-4 text-sm text-white/60">{t("landing.hero.trial")}</p>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20 px-4 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-xl font-bold text-foreground mb-2">
              {t("landing.features.title")}
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              {t("landing.features.subtitle")}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<Beaker className="w-5 h-5" />}
              title={t("landing.features.substances.title")}
              description={t("landing.features.substances.desc")}
            />
            <FeatureCard
              icon={<Zap className="w-5 h-5" />}
              title={t("landing.features.realtime.title")}
              description={t("landing.features.realtime.desc")}
            />
            <FeatureCard
              icon={<BarChart3 className="w-5 h-5" />}
              title={t("landing.features.sensitivity.title")}
              description={t("landing.features.sensitivity.desc")}
            />
            <FeatureCard
              icon={<Shield className="w-5 h-5" />}
              title={t("landing.features.model.title")}
              description={t("landing.features.model.desc")}
            />
          </div>
        </div>
      </section>

      {/* Nos deux outils */}
      <section className="py-16 sm:py-20 px-4 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-xl font-bold text-foreground mb-2">Deux modules de modélisation</h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Chaque abonnement donne accès aux deux outils professionnels.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-8 mb-16">
            {/* Outil 1 — J&E */}
            <div className="bg-card border border-card-border rounded-xl p-6 shadow-sm flex flex-col">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white mb-4" style={{background:"#1a5276"}}>
                <Beaker className="w-5 h-5" />
              </div>
              <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-700 rounded-full px-3 py-0.5 text-xs font-medium mb-3 w-fit">
                Modèle EPA J&E (2004)
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">EQRS Johnson & Ettinger</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1">
                Évaluation Quantitative des Risques Sanitaires liés à l'intrusion de vapeurs dans les bâtiments.
                74 substances (COV, HAP, métaux), calcul du facteur d'atténuation α, QD, ERI, VLEP. 
                Conformité réglementaire française et internationale.
              </p>
              <ul className="space-y-1.5 text-xs text-foreground">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#2ecc71]"/>74 substances réglementaires</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#2ecc71]"/>Facteur d'atténuation α (J&E)</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#2ecc71]"/>QD, ERI, VLEP en temps réel</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#2ecc71]"/>Analyse de sensibilité (8 paramètres)</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#2ecc71]"/>Rapport PDF complet</li>
              </ul>
            </div>
            {/* Outil 2 — TSN */}
            <div className="bg-card border border-card-border rounded-xl p-6 shadow-sm flex flex-col" style={{borderColor:"rgba(46,204,113,0.3)"}}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white mb-4" style={{background:"#1e8449"}}>
                <Droplets className="w-5 h-5" />
              </div>
              <div className="inline-flex items-center gap-1.5 bg-green-50 border border-green-100 text-green-700 rounded-full px-3 py-0.5 text-xs font-medium mb-3 w-fit">
                Modèle Domenico (1987)
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">Transfert Sol → Nappe → Captage</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1">
                Modélisation du transfert de polluants depuis la source de pollution vers la nappe souterraine et le captage d'eau potable.
                Calcul des concentrations Cc,1 (lixiviat), Cc,2 (nappe) et Cc,3 (captage) selon Domenico.
              </p>
              <ul className="space-y-1.5 text-xs text-foreground">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#2ecc71]"/>24 polluants (COHV, BTEX, HAP, PFAS, Métaux)</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#2ecc71]"/>24 types de sol avec propriétés hydrauliques</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#2ecc71]"/>Profil d'atténuation Cc(x) graphique</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#2ecc71]"/>DAF, gradient hydraulique, pluviométrie</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#2ecc71]"/>Rapport PDF éditeur de texte intégré</li>
              </ul>
            </div>
          </div>

          {/* Demo J&E */}
          <DemoCalculator />
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        className="py-16 sm:py-20 px-4"
        style={{ background: "hsl(200 10% 94%)" }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-xl font-bold text-foreground mb-2">
              {t("landing.pricing.title")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("landing.pricing.subtitle")}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-full px-4 py-1.5 text-sm font-medium">
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              {t("landing.pricing.trialBadge")}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Monthly */}
            <div className="bg-white rounded-lg border border-border p-6 flex flex-col shadow-sm">
              <div className="text-sm font-medium text-muted-foreground mb-1">
                {t("landing.pricing.monthly")}
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-extrabold text-foreground">
                  245€
                </span>
                <span className="text-sm text-muted-foreground">{t("landing.pricing.perMonth")}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-6">
                {t("landing.pricing.monthlyBilling")}
              </p>
              <ul className="space-y-2 mb-6 flex-1">
                <PricingItem>{t("landing.pricing.fullAccess")}</PricingItem>
                <PricingItem>{t("landing.pricing.substances")}</PricingItem>
                <PricingItem>{t("landing.pricing.license")}</PricingItem>
                <PricingItem>{t("landing.pricing.updates")}</PricingItem>
                <PricingItem>{t("landing.pricing.emailSupport")}</PricingItem>
              </ul>
              <Button
                data-testid="button-subscribe-monthly"
                className="w-full bg-primary hover:bg-primary/90"
                onClick={() => (window.location.hash = "#/register")}
              >
                {t("landing.pricing.subscribe")}
              </Button>
            </div>

            {/* Annual */}
            <div
              className="rounded-lg border-2 p-6 flex flex-col shadow-sm relative"
              style={{
                borderColor: "#2ecc71",
                background: "white",
              }}
            >
              <div
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold text-white px-3 py-0.5 rounded-full"
                style={{ background: "#2ecc71" }}
              >
                {t("landing.pricing.save15")}
              </div>
              <div className="text-sm font-medium text-muted-foreground mb-1">
                {t("landing.pricing.annual")}
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-extrabold text-foreground">
                  2 499€
                </span>
                <span className="text-sm text-muted-foreground">{t("landing.pricing.perYear")}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-6">
                {t("landing.pricing.annualEquiv")}
              </p>
              <ul className="space-y-2 mb-6 flex-1">
                <PricingItem>{t("landing.pricing.fullAccess")}</PricingItem>
                <PricingItem>{t("landing.pricing.substances")}</PricingItem>
                <PricingItem>{t("landing.pricing.license")}</PricingItem>
                <PricingItem>{t("landing.pricing.updates")}</PricingItem>
                <PricingItem>{t("landing.pricing.prioritySupport")}</PricingItem>
              </ul>
              <Button
                data-testid="button-subscribe-annual"
                className="w-full text-white font-semibold"
                style={{ background: "#2ecc71" }}
                onClick={() => (window.location.hash = "#/register")}
              >
                {t("landing.pricing.subscribe")}
              </Button>
            </div>
          </div>

          {/* Conditions d'utilisation */}
          <div className="mt-10 max-w-2xl mx-auto">
            <div className="bg-white/80 rounded-lg border border-border p-5 text-xs text-muted-foreground leading-relaxed">
              <h4 className="font-semibold text-foreground text-sm mb-3">{t("landing.conditions.title")}</h4>
              <ul className="space-y-1.5 list-disc list-inside">
                <li>{t("landing.conditions.item1")}</li>
                <li>{t("landing.conditions.item2")}</li>
                <li>{t("landing.conditions.item3")}</li>
                <li>{t("landing.conditions.item4")}</li>
                <li>{t("landing.conditions.item5")}</li>
                <li>{t("landing.conditions.item6")}</li>
              </ul>
              <p className="mt-3 text-[0.65rem] opacity-70">
                © 2023–2026 SARL G.M.E.P — SIREN 753 097 625 — 9 rue de la Marne, 79400 Saint-Maixent-l'École
              </p>
            </div>
          </div>
        </div>
      </section>

      <GmepFooter />
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-card border border-card-border rounded-lg p-5 shadow-sm">
      <div
        className="w-9 h-9 rounded-md flex items-center justify-center text-white mb-3"
        style={{ background: "#1a5276" }}
      >
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function PricingItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-xs text-foreground">
      <Check className="w-4 h-4 text-[#2ecc71] flex-shrink-0 mt-0.5" />
      <span>{children}</span>
    </li>
  );
}
