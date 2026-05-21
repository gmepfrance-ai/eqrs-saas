import { V2Header } from "@/components/v2-header";
import { V2Footer } from "@/components/v2-footer";

/** Tarifs v2 — 4 cartes simples avec lien vers register / subscribe */
export default function TarifsPage() {
  function startPlan(plan: string, hash: string) {
    localStorage.setItem("pending_plan", plan);
    window.location.hash = hash;
  }

  return (
    <div className="v2-page" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <V2Header />

      {/* Hero */}
      <section
        style={{
          background: "linear-gradient(135deg, #0d1b2e 0%, #1a2b4a 100%)",
          color: "#fff",
          padding: "64px 0",
        }}
      >
        <div className="container" style={{ textAlign: "center" }}>
          <h1 style={{ color: "#fff" }}>Tarifs et abonnements</h1>
          <p className="lead" style={{ color: "rgba(255,255,255,0.85)", maxWidth: 720, margin: "0 auto" }}>
            Quatre offres simples, sans engagement de durée et sans renouvellement automatique. Paiement
            sécurisé par Stripe.
          </p>
        </div>
      </section>

      {/* Grille tarifs */}
      <section className="v2-section">
        <div className="container">
          <div className="v2-pricing-grid">
            {/* J&E Mensuel */}
            <div className="v2-price-card">
              <h3>EQRS Johnson &amp; Ettinger</h3>
              <p className="sub">Abonnement mensuel — flexibilité maximale</p>
              <div className="v2-price-amount">
                <span className="currency">€</span>245
              </div>
              <div className="v2-price-period">HT / mois — résiliable à tout moment</div>
              <ul className="v2-price-features">
                <li>74 substances (COV, HAP, métaux)</li>
                <li>Calculs QD, ERI (adulte, enfant ADAF=3, salarié)</li>
                <li>Étude paramétrique 8 variables</li>
                <li>Conforme EPA 2004 / ANSES 2018</li>
                <li>Génération PDF</li>
                <li>Résiliable à tout moment</li>
              </ul>
              <button
                className="v2-btn v2-btn-blue v2-btn-block"
                onClick={() => startPlan("monthly", "#/register")}
              >
                S'abonner
              </button>
            </div>

            {/* J&E Annuel */}
            <div className="v2-price-card featured">
              <span className="v2-badge">Économisez 15 %</span>
              <h3>EQRS Johnson &amp; Ettinger</h3>
              <p className="sub">Abonnement annuel — meilleure valeur</p>
              <div className="v2-price-amount">
                <span className="currency">€</span>2 499
              </div>
              <div className="v2-price-period">HT / an (~208 € HT/mois)</div>
              <ul className="v2-price-features">
                <li>Toutes les fonctions du plan mensuel</li>
                <li>Économie de 441 € sur l'année</li>
                <li>Support prioritaire par email</li>
                <li>Mises à jour réglementaires incluses</li>
                <li>Facture annuelle unique</li>
              </ul>
              <button
                className="v2-btn v2-btn-primary v2-btn-block"
                onClick={() => startPlan("annual", "#/register")}
              >
                S'abonner
              </button>
            </div>

            {/* Domenico */}
            <div className="v2-price-card">
              <h3>Transfert Sol → Nappe → Captage</h3>
              <p className="sub">Modèle Domenico — licence annuelle</p>
              <div className="v2-price-amount">
                <span className="currency">€</span>1 100
              </div>
              <div className="v2-price-period">HT / an</div>
              <ul className="v2-price-features">
                <li>24 polluants (COHV, BTEX, HAP, PFAS, métaux)</li>
                <li>24 types de sols paramétrés</li>
                <li>Courbe d'atténuation Cc(x), DAF</li>
                <li>Éditeur PDF intégré</li>
                <li>Schéma conceptuel automatique</li>
              </ul>
              <button
                className="v2-btn v2-btn-blue v2-btn-block"
                onClick={() => (window.location.hash = "#/subscribe-tsn")}
              >
                S'abonner
              </button>
            </div>

            {/* Rabattement */}
            <div className="v2-price-card">
              <span className="v2-badge" style={{ background: "#2563eb", color: "#fff" }}>
                Nouveau
              </span>
              <h3>Rabattement de nappe</h3>
              <p className="sub">Theis + Dupuit-Thiem — licence annuelle</p>
              <div className="v2-price-amount">
                <span className="currency">€</span>1 100
              </div>
              <div className="v2-price-period">HT / an</div>
              <ul className="v2-price-features">
                <li>Modèles Theis (transitoire) et Dupuit-Thiem (permanent)</li>
                <li>Classification IOTA automatique (R.214-1)</li>
                <li>Cartographie OpenStreetMap</li>
                <li>Dossier Loi sur l'Eau prêt à déposer</li>
                <li>Essai gratuit 8 jours</li>
              </ul>
              <button
                className="v2-btn v2-btn-blue v2-btn-block"
                onClick={() => (window.location.hash = "#/subscribe-rabattement")}
              >
                S'abonner
              </button>
            </div>
          </div>

          <p style={{ textAlign: "center", marginTop: 32, fontSize: 13.5, color: "#6b7280" }}>
            TVA française au taux normal de 20 % (art. 278 du CGI). Facturation sécurisée par Stripe.
          </p>
        </div>
      </section>

      <V2Footer />
    </div>
  );
}
