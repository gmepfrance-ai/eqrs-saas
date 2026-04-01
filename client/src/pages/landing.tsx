import { GmepHeader } from "@/components/gmep-header";
import { GmepFooter } from "@/components/gmep-footer";
import { Button } from "@/components/ui/button";
import {
  Beaker,
  Shield,
  Zap,
  BarChart3,
  ChevronRight,
  Check,
} from "lucide-react";

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function LandingPage() {
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
            <span>Modèle EPA J&amp;E (2004)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 leading-tight">
            Modélisation EQRS
            <br />
            <span className="text-[#2ecc71]">Johnson &amp; Ettinger</span>
          </h1>
          <p className="text-base sm:text-lg text-white/80 max-w-xl mx-auto mb-8 leading-relaxed">
            Outil professionnel d'évaluation quantitative des risques sanitaires
            liés à l'intrusion de vapeurs dans les bâtiments. Calculs en temps
            réel, 74 substances, conformité réglementaire.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              data-testid="button-cta-register"
              size="lg"
              className="bg-[#2ecc71] hover:bg-[#27ae60] text-white font-semibold px-8"
              onClick={() => (window.location.hash = "#/register")}
            >
              Commencer l'essai gratuit
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
            <Button
              data-testid="button-cta-pricing"
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
              onClick={() => scrollToSection("pricing")}
            >
              Voir les tarifs
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20 px-4 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-xl font-bold text-foreground mb-2">
              Un outil complet de modélisation environnementale
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Conforme aux recommandations de l'EPA et aux exigences
              réglementaires françaises.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<Beaker className="w-5 h-5" />}
              title="74 substances"
              description="Base de données complète incluant COV, métaux, HAP et autres polluants réglementaires."
            />
            <FeatureCard
              icon={<Zap className="w-5 h-5" />}
              title="Calculs temps réel"
              description="Résultats instantanés : QD, ERI, VLEP, facteur d'atténuation et concentrations intérieures."
            />
            <FeatureCard
              icon={<BarChart3 className="w-5 h-5" />}
              title="Analyse de sensibilité"
              description="Étude paramétrique sur 8 variables clés pour évaluer l'incertitude du modèle."
            />
            <FeatureCard
              icon={<Shield className="w-5 h-5" />}
              title="Modèle J&E EPA 2004"
              description="Implémentation fidèle du modèle Johnson & Ettinger publié par l'US EPA."
            />
          </div>
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
              Tarifs simples et transparents
            </h2>
            <p className="text-sm text-muted-foreground">
              Accédez à l'outil EQRS complet. Sans engagement.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Monthly */}
            <div className="bg-white rounded-lg border border-border p-6 flex flex-col shadow-sm">
              <div className="text-sm font-medium text-muted-foreground mb-1">
                Mensuel
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-extrabold text-foreground">
                  245€
                </span>
                <span className="text-sm text-muted-foreground">/mois</span>
              </div>
              <p className="text-xs text-muted-foreground mb-6">
                Facturation mensuelle, résiliable à tout moment.
              </p>
              <ul className="space-y-2 mb-6 flex-1">
                <PricingItem>Accès complet à l'outil EQRS</PricingItem>
                <PricingItem>74 substances disponibles</PricingItem>
                <PricingItem>Licence mono-poste (1 clé d'activation)</PricingItem>
                <PricingItem>Mises à jour incluses</PricingItem>
                <PricingItem>Support par e-mail</PricingItem>
              </ul>
              <Button
                data-testid="button-subscribe-monthly"
                className="w-full bg-primary hover:bg-primary/90"
                onClick={() => (window.location.hash = "#/register")}
              >
                S'abonner
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
                Économisez 15%
              </div>
              <div className="text-sm font-medium text-muted-foreground mb-1">
                Annuel
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-extrabold text-foreground">
                  2 499€
                </span>
                <span className="text-sm text-muted-foreground">/an</span>
              </div>
              <p className="text-xs text-muted-foreground mb-6">
                Soit ~208€/mois. Facturation annuelle.
              </p>
              <ul className="space-y-2 mb-6 flex-1">
                <PricingItem>Accès complet à l'outil EQRS</PricingItem>
                <PricingItem>74 substances disponibles</PricingItem>
                <PricingItem>Licence mono-poste (1 clé d'activation)</PricingItem>
                <PricingItem>Mises à jour incluses</PricingItem>
                <PricingItem>Support prioritaire</PricingItem>
              </ul>
              <Button
                data-testid="button-subscribe-annual"
                className="w-full text-white font-semibold"
                style={{ background: "#2ecc71" }}
                onClick={() => (window.location.hash = "#/register")}
              >
                S'abonner
              </Button>
            </div>
          </div>

          {/* Conditions d'utilisation */}
          <div className="mt-10 max-w-2xl mx-auto">
            <div className="bg-white/80 rounded-lg border border-border p-5 text-xs text-muted-foreground leading-relaxed">
              <h4 className="font-semibold text-foreground text-sm mb-3">Conditions de licence</h4>
              <ul className="space-y-1.5 list-disc list-inside">
                <li>Le tarif indiqué correspond à <strong className="text-foreground">un seul poste de travail</strong> (ordinateur unique).</li>
                <li>Chaque abonnement donne droit à <strong className="text-foreground">une clé d'activation unique</strong>, liée à un seul poste.</li>
                <li>La clé d'activation est strictement personnelle et incessible. Elle ne peut être partagée, transférée ou utilisée simultanément sur plusieurs postes.</li>
                <li>Pour une utilisation sur plusieurs postes, une licence supplémentaire doit être souscrite pour chaque poste additionnel.</li>
                <li>Toute utilisation frauduleuse (partage de clé, accès simultanés multiples) entraînera la suspension immédiate de l'abonnement sans remboursement.</li>
                <li>Le logiciel EQRS Johnson & Ettinger est la propriété exclusive de la SARL G.M.E.P. Toute reproduction, diffusion ou rétro-ingénierie est interdite.</li>
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
