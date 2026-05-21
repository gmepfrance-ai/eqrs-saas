import { V2Header } from "@/components/v2-header";
import { V2Footer } from "@/components/v2-footer";

/** Landing page v2 — design marketing GMEP repris du site v2 */
export default function LandingPage() {
  return (
    <div className="v2-page" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <V2Header />

      {/* === HERO === */}
      <section className="v2-hero">
        <div className="container">
          <div className="v2-hero-grid">
            <div>
              <span className="v2-hero-badge">Conformité EPA · ANSES · Loi sur l'Eau</span>
              <h1>
                Trois outils de <span className="accent">modélisation environnementale</span>{" "}
                professionnelle
              </h1>
              <p className="lead">
                Logiciels SaaS conformes EPA, ANSES et Loi sur l'Eau, pour bureaux d'études
                environnementaux et hydrogéologues. Calculs en temps réel, dossiers PDF prêts à
                déposer.
              </p>
              <div className="v2-hero-cta">
                <a
                  href="#/tarifs"
                  className="v2-btn v2-btn-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("v2-outils")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Découvrir nos outils
                </a>
                <a href="#/register" className="v2-btn v2-btn-outline">
                  Essai gratuit
                </a>
              </div>
            </div>
            <div className="v2-hero-mock" aria-hidden="true">
              <div className="v2-hero-mock-head">
                <span className="dot" style={{ background: "#ed5d5d" }}></span>
                <span className="dot" style={{ background: "#f5b94d" }}></span>
                <span className="dot" style={{ background: "#62c87f" }}></span>
                <span className="label">gmep · console</span>
              </div>
              <div className="v2-hero-mock-row">
                <span className="l">Substance</span>
                <span className="v">Trichloroéthylène</span>
              </div>
              <div className="v2-hero-mock-row">
                <span className="l">α (facteur d'atténuation)</span>
                <span className="v">2,4 × 10⁻⁴</span>
              </div>
              <div className="v2-hero-mock-row">
                <span className="l">Cc(x) à 100 m</span>
                <span className="v">12,8 µg/L</span>
              </div>
              <div className="v2-hero-mock-row">
                <span className="l">Q Theis corrigé</span>
                <span className="v">106,22 m³/h</span>
              </div>
              <div className="v2-hero-mock-result">
                <strong>STATUT IOTA</strong>
                <span>AUTORISATION</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === NOS TROIS LOGICIELS === */}
      <section className="v2-section" id="v2-outils">
        <div className="container">
          <div className="v2-section-head">
            <span className="v2-section-eyebrow">Catalogue</span>
            <h2>Nos trois logiciels</h2>
            <p>
              Trois moteurs de calcul indépendants, conçus pour les contraintes réelles du terrain.
              Démos interactives disponibles dans le navigateur, sans installation.
            </p>
          </div>
          <div className="v2-tools-grid">
            {/* Carte 1 : EQRS J&E */}
            <article className="v2-tool-card">
              <div className="v2-tool-icon" aria-hidden="true">
                <svg viewBox="0 0 32 32" fill="none">
                  <circle cx="9" cy="22" r="3.2" fill="#2563eb" />
                  <circle cx="22" cy="22" r="3.2" fill="#2563eb" />
                  <circle cx="16" cy="11" r="3.6" fill="#1a2b4a" />
                  <path d="M16 14l-5 6M16 14l5 6" stroke="#1a2b4a" strokeWidth="1.6" />
                  <path
                    d="M5 6c1 1.5 0 3 1 4M27 6c1 1.5 0 3 1 4M13 5c1 1.5 0 3 1 4"
                    stroke="#3ddc84"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3>EQRS Johnson &amp; Ettinger</h3>
              <p>
                Intrusion de vapeurs dans les bâtiments. 74 substances (COV, HAP, métaux). Conforme
                EPA 2004 / ANSES 2018.
              </p>
              <div className="v2-tool-price">À partir de 208 € HT/mois</div>
              <a
                href="#/app"
                className="v2-btn v2-btn-blue"
                onClick={() => localStorage.setItem("pending_plan", "monthly")}
              >
                Découvrir →
              </a>
            </article>

            {/* Carte 2 : Domenico */}
            <article className="v2-tool-card">
              <div className="v2-tool-icon" aria-hidden="true">
                <svg viewBox="0 0 32 32" fill="none">
                  <rect x="2" y="6" width="28" height="6" rx="1" fill="#a16207" />
                  <rect x="2" y="12" width="28" height="6" rx="1" fill="#2563eb" opacity="0.7" />
                  <rect x="2" y="18" width="28" height="8" rx="1" fill="#1a2b4a" />
                  <path d="M22 4v22" stroke="#3ddc84" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="22" cy="20" r="2" fill="#3ddc84" />
                </svg>
              </div>
              <h3>Transfert Sol → Nappe → Captage</h3>
              <p>
                Modèle Domenico 1987. 24 polluants (BTEX, HAP, PFAS, métaux). Courbe d'atténuation
                Cc(x), DAF, gradient hydraulique.
              </p>
              <div className="v2-tool-price">850 € HT/an</div>
              <a href="#/subscribe-tsn" className="v2-btn v2-btn-blue">
                Découvrir →
              </a>
            </article>

            {/* Carte 3 : Rabattement (NOUVEAU) */}
            <article className="v2-tool-card">
              <span className="v2-badge">NOUVEAU</span>
              <div className="v2-tool-icon" aria-hidden="true">
                <svg viewBox="0 0 32 32" fill="none">
                  <path d="M3 14h26" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="2 2" />
                  <path d="M3 20h26" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="2 2" />
                  <rect x="13" y="3" width="6" height="22" rx="1" fill="#1a2b4a" />
                  <path
                    d="M16 14c-2 2-4 5-4 8a4 4 0 008 0c0-3-2-6-4-8z"
                    fill="#3ddc84"
                  />
                  <path
                    d="M10 26c2-3 5-3 6-2 1-1 4-1 6 2"
                    stroke="#2563eb"
                    strokeWidth="1.5"
                    fill="none"
                  />
                </svg>
              </div>
              <h3>Rabattement de nappe</h3>
              <p>
                Theis + Dupuit-Thiem. Classification IOTA automatique (R.214-1). Carte OpenStreetMap
                + dossier DDT 27 pages.
              </p>
              <div className="v2-tool-price">1 100 € HT/an</div>
              <a href="#/subscribe-rabattement" className="v2-btn v2-btn-blue">
                Découvrir →
              </a>
            </article>
          </div>
        </div>
      </section>

      {/* === POURQUOI GMEP === */}
      <section className="v2-section bg-soft">
        <div className="container">
          <div className="v2-section-head">
            <span className="v2-section-eyebrow">Pourquoi GMEP</span>
            <h2>Pensé par et pour les bureaux d'études</h2>
          </div>
          <div className="v2-why-grid">
            <div className="v2-why-item">
              <div className="v2-why-icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2l9 4v6c0 5-3.5 9-9 10-5.5-1-9-5-9-10V6l9-4z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 12l3 3 5-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3>Conformité réglementaire</h3>
              <p>EPA 2004, ANSES 2018, articles L.214-1 et R.214-1 du Code de l'environnement.</p>
            </div>
            <div className="v2-why-item">
              <div className="v2-why-icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  <path
                    d="M12 7v5l3 2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3>Calculs en temps réel</h3>
              <p>Saisie → résultat instantané. Étude paramétrique sur 8 variables pour J&amp;E.</p>
            </div>
            <div className="v2-why-item">
              <div className="v2-why-icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 3h9l5 5v13a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15 3v5h5M9 13h6M9 17h4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3>PDF prêts à déposer</h3>
              <p>Dossiers de 27 pages pour DDT, IEM sites pollués, rapports d'étude.</p>
            </div>
            <div className="v2-why-item">
              <div className="v2-why-icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  <path
                    d="M8 12l3 3 5-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3>Essai gratuit sans CB</h3>
              <p>8 à 14 jours d'accès complet, aucune carte bancaire requise.</p>
            </div>
          </div>
        </div>
      </section>

      {/* === BANNIÈRE CTA === */}
      <section className="v2-section">
        <div className="container">
          <div className="v2-cta-band">
            <h2>Essai gratuit 8 à 14 jours</h2>
            <p>
              Testez les démos interactives dans votre navigateur. Aucune installation, aucune carte
              bancaire.
            </p>
            <a href="#/register" className="v2-btn v2-btn-primary">
              Créer mon compte
            </a>
          </div>
        </div>
      </section>

      <V2Footer />
    </div>
  );
}
