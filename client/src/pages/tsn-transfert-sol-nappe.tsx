import { V2Header } from "@/components/v2-header";
import { V2Footer } from "@/components/v2-footer";
import { useAuth } from "@/lib/auth";

/** Page produit — TSN Transfert Sol → Nappe → Captage AEP (Domenico 1987) */
export default function TsnTransfertSolNappePage() {
  const { user, token } = useAuth();

  function subscribe() {
    localStorage.setItem("pending_plan", "tsn_annual");
    window.location.hash = "#/subscribe-tsn";
  }

  async function startTrial() {
    if (!user || !token) {
      localStorage.setItem("pending_plan", "tsn_trial");
      window.location.hash = "#/register";
      return;
    }
    try {
      const res = await fetch(`/api/tsn-trial/activate?token=${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok || res.status === 409) {
        window.location.href = `/api/tsn-trial?token=${token}`;
        return;
      }
      window.location.hash = "#/subscribe-tsn";
    } catch {
      window.location.hash = "#/subscribe-tsn";
    }
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
                API HUB'EAU NATIVE
              </span>
              <h1>TSN — Transfert Sol → Nappe</h1>
              <p className="lead">
                Évaluation <strong>Tier 1 analytique</strong> de l'impact d'un site sites &amp; sols pollués (SSP) sur les cibles
                AEP, puits et forages. Modèle <strong>Domenico 1987</strong>, <strong>API Hub'eau native</strong>, conformité{" "}
                <strong>IOTA R.214-1</strong>, cartographie isodistances 500 à 3000 m. Destiné aux BE SSP, hydrogéologues,
                industriels HSE/ICPE et collectivités, aménageurs et promoteurs. <strong>30 minutes</strong> là où MODFLOW demande{" "}
                <strong>plusieurs semaines</strong>.
              </p>
              <div className="v2-hero-cta">
                <button className="v2-btn v2-btn-primary" style={{ cursor: "pointer", border: "none" }} onClick={subscribe}>
                  S'abonner — 1 100 € HT/an
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
                <span className="label">tsn · sol → nappe</span>
              </div>
              <div className="v2-hero-mock-row"><span className="l">Modèle</span><span className="v">Domenico 1987</span></div>
              <div className="v2-hero-mock-row"><span className="l">Cible (Hub'eau)</span><span className="v">Captage AEP — 1 250 m</span></div>
              <div className="v2-hero-mock-row"><span className="l">Cc(x) aval</span><span className="v">4,1 µg/L</span></div>
              <div className="v2-hero-mock-row"><span className="l">Délai d'analyse</span><span className="v">~ 30 min</span></div>
              <div className="v2-hero-mock-result"><strong>Criticité cible</strong><span>🟠 moyenne</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* === 1. PRÉSENTATION === */}
      <section className="v2-section">
        <div className="container">
          <div className="v2-section-head">
            <span className="v2-section-eyebrow">Présentation</span>
            <h2>TSN — l'évaluation rapide de l'impact sur les cibles AEP</h2>
            <p>
              Une solution analytique Domenico 1987 connectée aux API publiques Hub'eau pour identifier automatiquement les
              puits, forages et captages dans le rayon d'analyse.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {[
              { t: "Modèle Domenico 1987", d: "Solution analytique de la concentration aval Cc(x) d'un panache, sans maillage : une source ponctuelle, quelques paramètres physiques (K, n, dispersivité, gradient)." },
              { t: "API Hub'eau native", d: "Récupération automatique des puits, forages et stations qualité (eaufrance.fr) situés dans le rayon d'analyse autour de la source." },
              { t: "Lambert 93 ↔ WGS84", d: "Coordonnées Lambert 93 (EPSG:2154) par cible avec conversion proj4 vers WGS84 pour la cartographie." },
              { t: "Cibles AEP", d: "Puits privés, forages d'alimentation en eau potable et captages prioritaires automatiquement positionnés et hiérarchisés par criticité." },
            ].map((f) => (
              <div key={f.t} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: 24 }}>
                <h3 style={{ margin: "0 0 8px 0", color: "#0e2f44" }}>{f.t}</h3>
                <p style={{ margin: 0, fontSize: 14.5, color: "#374151", lineHeight: 1.6 }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === 2. FONCTIONNALITÉS === */}
      <section className="v2-section bg-soft">
        <div className="container">
          <div className="v2-section-head">
            <span className="v2-section-eyebrow">Fonctionnalités</span>
            <h2>Cartographie et rapport prêts pour le dossier réglementaire</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {[
              { t: "Cartographie isodistances", d: "Source au centre, cercles d'isodistances 500 / 1000 / 1500 / 2000 / 2500 / 3000 m, échelle adaptative et légende intégrée dans le rapport PDF." },
              { t: "Marqueurs de criticité", d: "Cibles colorées selon leur criticité (haute / moyenne / faible) en fonction de la concentration aval estimée et de la distance." },
              { t: "Rose des vents & azimut", d: "Flèche d'azimut d'écoulement et rose des vents pour visualiser le sens de transfert du panache vers les cibles." },
              { t: "Logique IOTA R.214-1", d: "Cadre IOTA strict (Code de l'environnement R.214-1) appliqué nativement pour produire un dossier conforme." },
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
            <h2>TSN vs MODFLOW vs MARTHE</h2>
            <p>Un outil de screening « Tier 1 » : <strong>30 minutes</strong> contre <strong>plusieurs semaines</strong> pour une modélisation numérique complète.</p>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, background: "#fff", borderRadius: 10, overflow: "hidden" }}>
              <thead>
                <tr style={{ background: "#1a5276", color: "#fff" }}>
                  <th style={{ padding: 10, textAlign: "left", border: "1px solid #0e2f44" }}>Critère</th>
                  <th style={cellTh}>MODFLOW (USGS)</th>
                  <th style={cellTh}>MARTHE (BRGM)</th>
                  <th style={{ ...cellTh, background: "#39e07a", color: "#0e2f44" }}>TSN (GMEP)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Méthode", "Différences finies 3D", "Volumes finis 3D", "Analytique Domenico 1987", "#999", "#999", false],
                  ["Temps de mise en œuvre", "Plusieurs semaines", "Plusieurs semaines", "~ 30 minutes", "#c0392b", "#c0392b", true],
                  ["Maillage", "Discrétisation lourde", "Maillage gigogne", "Aucun maillage", "#c0392b", "#c0392b", false],
                  ["Expertise requise", "Modélisateur expérimenté", "Modélisateur expérimenté", "BE SSP non spécialiste", "#c0392b", "#c0392b", false],
                  ["Intégration API publiques", "✗", "✗", "✓ Hub'eau", "#c0392b", "#c0392b", false],
                  ["Conformité IOTA R.214-1", "✗ (générique)", "✗ (générique)", "✓ native", "#c0392b", "#c0392b", false],
                  ["Cartographie cibles AEP", "Piézométrie détaillée", "Cartes panache", "✓ isodistances + cibles", "#999", "#999", false],
                  ["Cas d'usage idéal", "Grandes nappes régionales", "Hydrosystèmes complexes", "Impact site SSP sur cible AEP", "#999", "#999", false],
                ].map((r, i) => (
                  <tr key={r[0] as string} style={i % 2 ? { background: "#f8fafc" } : undefined}>
                    <td style={cellTd}>{r[6] ? <strong>{r[0]}</strong> : r[0]}</td>
                    <td style={{ ...cellTdC, color: r[4] as string }}>{r[1]}</td>
                    <td style={{ ...cellTdC, color: r[5] as string }}>{r[2]}</td>
                    <td style={{ ...cellTdC, color: "#27ae60", fontWeight: r[6] ? 700 : 600 }}>{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ fontSize: 12, color: "#666", marginTop: 14, lineHeight: 1.6 }}>
              <strong>Sources :</strong> USGS MODFLOW, BRGM MARTHE, API Hub'eau, Code de l'environnement R.214-1.
            </p>
          </div>
        </div>
      </section>

      {/* === 4. APPLICATIONS === */}
      <section className="v2-section">
        <div className="container" style={{ maxWidth: 820 }}>
          <div className="v2-section-head">
            <span className="v2-section-eyebrow">Applications</span>
            <h2>Pour quels usages ?</h2>
          </div>
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "28px 32px" }}>
            <h3 style={{ marginTop: 0, color: "#0e2f44" }}>Cas d'usage type</h3>
            <ul style={{ margin: 0, paddingLeft: 20, color: "#374151", lineHeight: 1.8, fontSize: 14.5 }}>
              <li><strong>Impact d'un site SSP sur captage AEP</strong> — évaluation rapide d'un captage situé à 500-3000 m de la source.</li>
              <li><strong>Réutilisation de terres excavées</strong> — évaluation du transfert vers la nappe avant réemploi.</li>
              <li><strong>Étude d'impact ESO (Eaux Souterraines) ICPE</strong> — screening de risque pour projet d'installation classée.</li>
              <li><strong>Dossier Loi sur l'Eau (IOTA R.214-1)</strong> — justification de l'impact sur les eaux souterraines.</li>
              <li><strong>Outil « Tier 1 » complémentaire</strong> — aide à la décision avant une modélisation numérique lourde (MODFLOW / MARTHE).</li>
            </ul>
          </div>
        </div>
      </section>

      {/* === 5. TARIF === */}
      <section className="v2-section bg-soft">
        <div className="container">
          <div className="v2-section-head">
            <span className="v2-section-eyebrow">Tarif</span>
            <h2>Abonnez-vous à TSN</h2>
          </div>
          <div className="v2-pricing-grid" style={{ maxWidth: 520, margin: "0 auto" }}>
            <div className="v2-price-card featured">
              <span className="v2-badge">API Hub'eau</span>
              <h3>Abonnement annuel</h3>
              <p className="sub">Transfert Sol-Nappe-Captage AEP — Domenico 1987</p>
              <div className="v2-price-amount">
                <span className="currency">€</span>1 100
              </div>
              <div className="v2-price-period">HT / an</div>
              <ul className="v2-price-features">
                <li>Modèle Domenico 1987 analytique</li>
                <li>API Hub'eau native (puits, forages, qualité)</li>
                <li>Cartographie isodistances + criticité</li>
                <li>Conversion Lambert 93 ↔ WGS84</li>
                <li>Conformité IOTA R.214-1</li>
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
            <h3 style={{ marginTop: 0, color: "#0e2f44" }}>Note technique — TSN Transfert Sol-Nappe</h3>
            <p style={{ color: "#374151", lineHeight: 1.6 }}>
              Téléchargez la note technique : équation de Domenico 1987, paramétrage du panache, intégration des API Hub'eau
              et méthode de hiérarchisation des cibles AEP.
            </p>
            <a href="/notes-techniques/Note_Technique_TSN.pdf" target="_blank" rel="noopener noreferrer" className="v2-btn v2-btn-primary">
              Télécharger la note technique (PDF)
            </a>
          </div>
        </div>
      </section>

      <V2Footer />
    </div>
  );
}
