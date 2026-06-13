import { V2Header } from "@/components/v2-header";
import { V2Footer } from "@/components/v2-footer";

/** Page produit — Rabattement V15.85 (modélisation multicouche IA + Loi sur l'Eau) */
export default function RabattementV1585Page() {
  function subscribe() {
    localStorage.setItem("pending_plan", "rabattement_annual");
    window.location.hash = "#/subscribe-rabattement";
  }

  function startTrial() {
    localStorage.setItem("pending_plan", "rabattement_trial");
    window.location.hash = "#/subscribe-rabattement";
  }

  const cellTd: React.CSSProperties = { padding: "8px", border: "1px solid #d1dce8" };
  const cellTdC: React.CSSProperties = { ...cellTd, textAlign: "center" };
  const cellTh: React.CSSProperties = { padding: "10px", textAlign: "center", border: "1px solid #0e2f44", width: "22%" };

  return (
    <div className="v2-page" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <V2Header />

      {/* === HERO === */}
      <section className="v2-hero">
        <div className="container">
          <div className="v2-hero-grid">
            <div>
              <span className="v2-hero-badge" style={{ background: "linear-gradient(135deg,#39e07a 0%,#1a5276 100%)", color: "#fff" }}>
                ASSISTANT IA INTÉGRÉ
              </span>
              <h1>Rabattement V15.85 — Modélisation multicouche IA</h1>
              <p className="lead">
                Modélisation de rabattement de nappe <strong>multicouche</strong> assistée par intelligence artificielle.
                42 lithologies intégrées, jusqu'à 15 couches, formules <strong>Forchheimer/Dupuit</strong>, <strong>Mode A/B</strong>,
                rayon de Sichardt automatique, recalage piézométrique terrain et <strong>Dossier Loi sur l'Eau (IOTA R.214-1)</strong>{" "}
                généré automatiquement. Pensé pour les BE SSP, les hydrogéologues, les industriels HSE/ICPE et les
                collectivités, aménageurs et promoteurs. Validation terrain Oucques-la-Nouvelle.
              </p>
              <div className="v2-hero-cta">
                <button className="v2-btn v2-btn-primary" style={{ cursor: "pointer", border: "none" }} onClick={subscribe}>
                  S'abonner — 1 500 € HT/an
                </button>
                <button className="v2-btn v2-btn-outline" style={{ cursor: "pointer", border: "none" }} onClick={startTrial}>Essai gratuit 14 jours</button>
                <a href="#/contact" className="v2-btn v2-btn-outline">Démo sur demande</a>
              </div>
            </div>
            <div className="v2-hero-mock" aria-hidden="true">
              <div className="v2-hero-mock-head">
                <span className="dot" style={{ background: "#ed5d5d" }}></span>
                <span className="dot" style={{ background: "#f5b94d" }}></span>
                <span className="dot" style={{ background: "#62c87f" }}></span>
                <span className="label">rabattement · v15.85</span>
              </div>
              <div className="v2-hero-mock-row"><span className="l">Mode</span><span className="v">A — Q imposé</span></div>
              <div className="v2-hero-mock-row"><span className="l">Couches</span><span className="v">3 / 15</span></div>
              <div className="v2-hero-mock-row"><span className="l">K_max</span><span className="v">5 × 10⁻⁴ m/s</span></div>
              <div className="v2-hero-mock-row"><span className="l">R (Sichardt)</span><span className="v">212 m</span></div>
              <div className="v2-hero-mock-result"><strong>Rabattement s</strong><span>2,4 m — calculé</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* === 1. PRÉSENTATION === */}
      <section className="v2-section">
        <div className="container">
          <div className="v2-section-head">
            <span className="v2-section-eyebrow">Présentation</span>
            <h2>Rabattement V15.85 — la modélisation multicouche simplifiée</h2>
            <p>
              Une approche analytique Forchheimer/Dupuit, 42 lithologies prêtes à l'emploi et un assistant IA pour interpréter
              les résultats et suggérer les paramètres.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {[
              { t: "42 lithologies intégrées", d: "Liste déroulante VLOOKUP avec perméabilités K typiques par famille lithologique, jusqu'à 15 couches par forage (de / à / lithologie / K)." },
              { t: "Forchheimer / Dupuit", d: "Q_i = 2π·K_i·e_sat_i·s / ln(R/r) × 3600, bilan multicouche Q_total = Σ Q_i sur 15 couches, saturation automatique par couche." },
              { t: "Mode A / Mode B", d: "Mode A : débit Q imposé → rabattement s calculé. Mode B : rabattement s imposé → débit Q et volumes calculés." },
              { t: "Assistant IA intégré", d: "Interprétation automatique des résultats et suggestions de paramètres pour fiabiliser la modélisation, soutenues par la formation à distance et des études de cas utilisateur." },
            ].map((f) => (
              <div key={f.t} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: 24 }}>
                <h3 style={{ margin: "0 0 8px 0", color: "#0e2f44" }}>{f.t}</h3>
                <p style={{ margin: 0, fontSize: 14.5, color: "#374151", lineHeight: 1.6 }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === 2. FONCTIONNALITÉS CLÉS === */}
      <section className="v2-section bg-soft">
        <div className="container">
          <div className="v2-section-head">
            <span className="v2-section-eyebrow">Fonctionnalités clés</span>
            <h2>Du terrain au Dossier Loi sur l'Eau</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {[
              { t: "Recalage piézométrique terrain", d: "Le niveau statique (NS) mesuré sur site est prioritaire sur les données BRGM pour un calage fidèle aux conditions réelles." },
              { t: "Rayon de Sichardt automatique", d: "R = 3000 × s × √(K_max) calculé automatiquement à partir du rabattement et de la perméabilité maximale des couches." },
              { t: "Coupe géologique illustrée", d: "Tableau lithologie (de/à/libellé), arrivées d'eau (profondeur/débit), légende colorée par famille, algorithme anti-chevauchement des annotations. Synchronisation Lambert 93 bidirectionnelle." },
              { t: "Génération PDF Dossier Loi sur l'Eau", d: "Production automatique du Dossier de Déclaration Loi sur l'Eau, avec cartographie IGN / BRGM / ZNIEFF intégrée." },
            ].map((f) => (
              <div key={f.t} style={{ background: "#fff", borderRadius: 14, padding: 24, borderLeft: "4px solid #1a5276" }}>
                <h3 style={{ margin: "0 0 8px 0", color: "#0e2f44" }}>{f.t}</h3>
                <p style={{ margin: 0, fontSize: 14.5, color: "#374151", lineHeight: 1.6 }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === 3. COMPARATIF === */}
      <section className="v2-section">
        <div className="container">
          <div className="v2-section-head">
            <span className="v2-section-eyebrow">Comparatif</span>
            <h2>Rabattement V15.85 vs MODFLOW vs MARTHE</h2>
            <p>Un outil « Tier 1 » analytique complémentaire des codes numériques lourds — accessible aux bureaux d'études non spécialistes de la modélisation.</p>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, background: "#fff", borderRadius: 10, overflow: "hidden" }}>
              <thead>
                <tr style={{ background: "#1a5276", color: "#fff" }}>
                  <th style={{ padding: 10, textAlign: "left", border: "1px solid #0e2f44" }}>Critère</th>
                  <th style={cellTh}>MODFLOW (USGS)</th>
                  <th style={cellTh}>MARTHE (BRGM)</th>
                  <th style={{ ...cellTh, background: "#39e07a", color: "#0e2f44" }}>Rabattement V15.85</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Méthode", "Différences finies 3D", "Volumes finis 3D", "Analytique Forchheimer/Dupuit", "#999", "#999"],
                  ["Maillage", "Milliers de mailles", "Jusqu'à 3000×3000×999", "Aucun maillage", "#c0392b", "#c0392b"],
                  ["Niveau d'expertise requis", "Modélisateur expérimenté", "Modélisateur expérimenté", "BE SSP non spécialiste", "#c0392b", "#c0392b"],
                  ["Temps de mise en œuvre", "Semaines/mois", "Semaines/mois", "Minutes", "#c0392b", "#c0392b"],
                  ["Lithologies prêtes à l'emploi", "✗", "✗", "✓ 42 lithologies", "#c0392b", "#c0392b"],
                  ["Assistant IA", "✗", "✗", "✓", "#c0392b", "#c0392b"],
                  ["Rayon de Sichardt automatique", "Manuel", "Manuel", "✓ auto", "#999", "#999"],
                  ["Recalage piézométrique terrain", "Multi-points lourd", "Multi-points lourd", "✓ NS terrain prioritaire", "#999", "#999"],
                  ["Conformité IOTA R.214-1", "✗ (générique)", "✗ (générique)", "✓ native", "#c0392b", "#c0392b"],
                  ["Génération Dossier Loi sur l'Eau", "✗", "✗", "✓ PDF auto", "#c0392b", "#c0392b"],
                ].map((r, i) => (
                  <tr key={r[0]} style={i % 2 ? { background: "#f8fafc" } : undefined}>
                    <td style={cellTd}>{r[0]}</td>
                    <td style={{ ...cellTdC, color: r[4] }}>{r[1]}</td>
                    <td style={{ ...cellTdC, color: r[5] }}>{r[2]}</td>
                    <td style={{ ...cellTdC, color: "#27ae60", fontWeight: 600 }}>{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ fontSize: 12, color: "#666", marginTop: 14, lineHeight: 1.6 }}>
              <strong>Sources :</strong> USGS MODFLOW, BRGM MARTHE, Code de l'environnement R.214-1.
            </p>
          </div>
        </div>
      </section>

      {/* === 4. CADRE RÉGLEMENTAIRE === */}
      <section className="v2-section">
        <div className="container" style={{ maxWidth: 820 }}>
          <div className="v2-section-head">
            <span className="v2-section-eyebrow">Conformité réglementaire</span>
            <h2>Cadre normatif</h2>
          </div>
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "28px 32px" }}>
            <h3 style={{ marginTop: 0, color: "#0e2f44" }}>Références appliquées</h3>
            <ul style={{ margin: 0, paddingLeft: 20, color: "#374151", lineHeight: 1.8, fontSize: 14.5 }}>
              <li><strong>Loi sur l'Eau</strong> — Code de l'environnement L.214-1 et suivants.</li>
              <li><strong>IOTA</strong> — Installations, Ouvrages, Travaux et Activités soumis à déclaration / autorisation.</li>
              <li><strong>R.214-1 du Code de l'environnement</strong> — rubrique relative aux sondages, forages, puits et prélèvements en nappe.</li>
              <li><strong>Dossier de Déclaration Loi sur l'Eau</strong> — généré automatiquement par l'outil.</li>
              <li><strong>Formule de Forchheimer / Dupuit</strong> — modélisation analytique multicouche du rabattement.</li>
              <li><strong>Rayon d'influence de Sichardt</strong> — R = 3000 × s × √(K_max).</li>
              <li><strong>Référentiels IGN / BRGM / ZNIEFF</strong> — cartographie intégrée.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* === 5. TARIF === */}
      <section className="v2-section bg-soft">
        <div className="container">
          <div className="v2-section-head">
            <span className="v2-section-eyebrow">Tarif</span>
            <h2>Abonnez-vous à Rabattement V15.85</h2>
          </div>
          <div className="v2-pricing-grid" style={{ maxWidth: 520, margin: "0 auto" }}>
            <div className="v2-price-card featured">
              <span className="v2-badge">Loi sur l'Eau</span>
              <h3>Abonnement annuel</h3>
              <p className="sub">Modélisation multicouche IA + Dossier Loi sur l'Eau</p>
              <div className="v2-price-amount">
                <span className="currency">€</span>1 500
              </div>
              <div className="v2-price-period">HT / an</div>
              <ul className="v2-price-features">
                <li>42 lithologies, 15 couches max</li>
                <li>Mode A / B, Forchheimer/Dupuit</li>
                <li>Rayon de Sichardt automatique</li>
                <li>Assistant IA intégré</li>
                <li>Génération PDF Dossier Loi sur l'Eau</li>
                <li>Formation à distance + études de cas utilisateur</li>
              </ul>
              <button className="v2-btn v2-btn-primary v2-btn-block" style={{ cursor: "pointer", border: "none" }} onClick={subscribe}>
                S'abonner
              </button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 24 }}>
            <button className="v2-btn v2-btn-ghost" style={{ cursor: "pointer", border: "none" }} onClick={startTrial}>Essai gratuit 14 jours</button>
            <a href="#/contact" className="v2-btn v2-btn-ghost">Démo sur demande</a>
          </div>
        </div>
      </section>

      {/* === 6. NOTE TECHNIQUE PDF === */}
      <section className="v2-section">
        <div className="container">
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "32px", textAlign: "center", maxWidth: 820, margin: "0 auto" }}>
            <h3 style={{ marginTop: 0, color: "#0e2f44" }}>Note technique — Rabattement V15.85</h3>
            <p style={{ color: "#374151", lineHeight: 1.6 }}>
              Téléchargez la note technique : formulation Forchheimer/Dupuit multicouche, méthode de recalage piézométrique,
              rayon de Sichardt et constitution du Dossier Loi sur l'Eau.
            </p>
            <a href="/notes-techniques/Note_Technique_Rabattement_V15_85.pdf" target="_blank" rel="noopener noreferrer" className="v2-btn v2-btn-primary">
              Télécharger la note technique (PDF)
            </a>
          </div>
        </div>
      </section>

      {/* === 7. CAS D'USAGE === */}
      <section className="v2-section bg-soft">
        <div className="container" style={{ maxWidth: 820 }}>
          <div className="v2-section-head">
            <span className="v2-section-eyebrow">Cas d'usage</span>
            <h2>Validation terrain — Oucques-la-Nouvelle</h2>
          </div>
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "28px 32px" }}>
            <h3 style={{ marginTop: 0, color: "#0e2f44" }}>Configuration testée</h3>
            <ul style={{ margin: 0, paddingLeft: 20, color: "#374151", lineHeight: 1.8, fontSize: 14.5 }}>
              <li><strong>Site</strong> — Oucques-la-Nouvelle (Loir-et-Cher).</li>
              <li><strong>Couches modélisées</strong> — 3 couches saturées sur 15 disponibles.</li>
              <li><strong>Perméabilité maximale</strong> — K_max = 5 × 10⁻⁴ m/s.</li>
              <li><strong>Recalage</strong> — niveau statique terrain prioritaire sur données BRGM.</li>
              <li><strong>Sortie</strong> — bilan Q_total multicouche, rayon de Sichardt et Dossier Loi sur l'Eau générés automatiquement.</li>
            </ul>
          </div>
        </div>
      </section>

      <V2Footer />
    </div>
  );
}
