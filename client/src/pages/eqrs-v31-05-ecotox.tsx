import { V2Header } from "@/components/v2-header";
import { navigateTo } from "@/lib/navigation";
import { V2Footer } from "@/components/v2-footer";
import { useAuth } from "@/lib/auth";

/** Page produit — EQRS V9 + ECOTOX V9 V8 (HHRA + ERE) */
export default function EqrsV3105EcotoxPage() {
  const { user, token } = useAuth();

  function subscribe() {
    localStorage.setItem("pending_plan", "eqrs_v31_ecotox_monthly");
    navigateTo("/subscribe-eqrs-v31-ecotox");
  }

  function startTrial() {
    if (!user || !token) {
      navigateTo("/register");
      return;
    }
    window.location.href = `/api/eqrs-v31-ecotox-tool?token=${token}`;
  }

  const cellTd: React.CSSProperties = { padding: "8px", border: "1px solid #d1dce8" };
  const cellTdC: React.CSSProperties = { ...cellTd, textAlign: "center" };
  const cellTh: React.CSSProperties = { padding: "10px", textAlign: "center", border: "1px solid #0e2f44", width: "20%" };

  return (
    <div className="v2-page" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <V2Header />

      {/* === HERO === */}
      <section className="v2-hero">
        <div className="container">
          <div className="v2-hero-grid">
            <div>
              <span className="v2-hero-badge" style={{ background: "linear-gradient(135deg,#39e07a 0%,#1a5276 100%)", color: "#fff" }}>
                NOUVEAU — Extension ECOTOX V9 disponible
              </span>
              <h1>EQRS V9 + ECOTOX V9</h1>
              <p className="lead">
                La <strong>référence française HHRA + ERE</strong>. 104 substances en risque sanitaire humain + 47 substances écotox Tier 3
                écotox, approche <strong>Tier 1 et Tier 2</strong>, et 5 modules avancés exclusifs : <strong>Monte-Carlo</strong>,{" "}
                <strong>calcul inverse</strong>, <strong>simulation temporelle 70 ans</strong>, <strong>chaîne trophique</strong> et{" "}
                <strong>mélange par organe</strong>. Conçu pour les BE SSP, les industriels HSE/ICPE, les hydrogéologues et les
                collectivités, aménageurs et promoteurs.
              </p>
              <div className="v2-hero-cta">
                <button className="v2-btn v2-btn-primary" style={{ cursor: "pointer", border: "none" }} onClick={subscribe}>
                  S'abonner — 395 € HT/mois
                </button>
                <button className="v2-btn v2-btn-outline" style={{ cursor: "pointer", border: "none" }} onClick={startTrial}>
                  Essai gratuit 8 jours
                </button>
              </div>
            </div>
            <div className="v2-hero-mock" aria-hidden="true">
              <div className="v2-hero-mock-head">
                <span className="dot" style={{ background: "#ed5d5d" }}></span>
                <span className="dot" style={{ background: "#f5b94d" }}></span>
                <span className="dot" style={{ background: "#62c87f" }}></span>
                <span className="label">eqrs · v31.05 · ecotox</span>
              </div>
              <div className="v2-hero-mock-row"><span className="l">Substance</span><span className="v">Plomb (Pb)</span></div>
              <div className="v2-hero-mock-row"><span className="l">Σ QD (humain, enfant)</span><span className="v">0,42 — vigilance</span></div>
              <div className="v2-hero-mock-row"><span className="l">Récepteur écotox</span><span className="v">🐦 Rouge-gorge</span></div>
              <div className="v2-hero-mock-row"><span className="l">PEC / PNEC (Tier 2)</span><span className="v">0,8</span></div>
              <div className="v2-hero-mock-result"><strong>RQ écologique</strong><span>🟠 faible — &lt; 1</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* === 1. PRÉSENTATION === */}
      <section className="v2-section">
        <div className="container">
          <div className="v2-section-head">
            <span className="v2-section-eyebrow">Présentation</span>
            <h2>EQRS V9 — l'évaluation des risques sanitaires nouvelle génération</h2>
            <p>
              104 substances paramétrées, 22 onglets interactifs, rapport PDF 14 pages et cartographie Leaflet native.
              Toutes les VTR sont issues du référentiel ANSES et tenues à jour.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {[
              { t: "104 substances", d: "70 substances de base + 30 substances émergentes : PFAS suite UE 2020 (20 substances), phtalates, retardateurs de flamme, pesticides récents et dioxines individuelles." },
              { t: "22 onglets interactifs", d: "Paramètres, localisation cartographique, VTR seuil/sans seuil, concentrations, modèle J&E, DJE, résultats QD/ERI, VLEP, et les 5 modules avancés." },
              { t: "Rapport PDF 14 pages", d: "Notes de calcul, tableaux VTR à seuil et sans seuil, détail QD/ERI par voie et par cible, localisation cartographique — prêt à transmettre aux autorités compétentes." },
              { t: "Cartographie Leaflet 1.9.4", d: "Fonds OSM / Plan IGN v2 / BD ORTHO, conversion Lambert 93 ↔ WGS84 (proj4js), marqueurs site et récepteurs, ellipse de panache Domenico, export PNG." },
            ].map((f) => (
              <div key={f.t} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: 24 }}>
                <h3 style={{ margin: "0 0 8px 0", color: "#0e2f44" }}>{f.t}</h3>
                <p style={{ margin: 0, fontSize: 14.5, color: "#374151", lineHeight: 1.6 }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === 2. NOUVEAUTÉ V9 — MODULE ECOTOX === */}
      <section
        className="v2-section"
        style={{ background: "linear-gradient(180deg,#f0fff4 0%,#e8f5ec 100%)", borderTop: "3px solid #39e07a", borderBottom: "3px solid #39e07a" }}
      >
        <div className="container">
          <div className="v2-section-head">
            <span className="v2-section-eyebrow" style={{ background: "#1a5276", color: "#fff", padding: "4px 12px", borderRadius: 4, letterSpacing: "0.5px" }}>
              NOUVEAUTÉ V9 — MODULE ECOTOX
            </span>
            <h2>Le risque écologique (ERE) ajouté au risque sanitaire (HHRA)</h2>
            <p>
              Là où EQRS V9 évalue le <strong>risque sanitaire humain</strong> (QD, ERI, VLEP), l'extension ECOTOX V9 ajoute
              le <strong>risque écologique</strong> par quotient PEC/PNEC et transferts trophiques vers la faune sauvage — dans
              la même interface.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {[
              { t: "Tier 1 — 7 récepteurs sentinelles", d: "Quotient PEC/PNEC sur le sol (plantes terrestres, vers de terre Eisenia fetida, micro-organismes), l'eau superficielle (poisson, daphnie D. magna, algue P. subcapitata) et l'eau souterraine (macro-invertébrés hyporhéiques)." },
              { t: "Tier 2 — 5 prédateurs trophiques", d: "Transferts trophiques (Sample & Suter ORNL/TM-13391) sur 🐦 Rouge-gorge, 🐭 Musaraigne, 🐹 Campagnol, 🦩 Héron et 🦦 Loutre." },
              { t: "Cascade PNEC", d: "Dérivation hiérarchisée des PNEC : INERIS → ECHA REACH (R.10) → US EPA Eco-SSL. 47 substances en V9 : PFAS, métaux, HAP, PCB/dioxines, BTEX, solvants chlorés, pesticides." },
              { t: "Code couleur RQ", d: "Risk Quotient lisible : 🟢 < 0,1 négligeable, 🟠 < 1 faible, 🔴 ≥ 1 potentiel — pour chaque récepteur et chaque substance." },
            ].map((f) => (
              <div key={f.t} style={{ background: "#fff", borderRadius: 14, padding: 24, borderLeft: "4px solid #39e07a" }}>
                <h3 style={{ margin: "0 0 8px 0", color: "#0e2f44" }}>{f.t}</h3>
                <p style={{ margin: 0, fontSize: 14.5, color: "#374151", lineHeight: 1.6 }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === 3. COMPARATIF === */}
      <section className="v2-section bg-soft">
        <div className="container">
          <div className="v2-section-head">
            <span className="v2-section-eyebrow">Comparatif</span>
            <h2>EQRS V9 + ECOTOX vs MODUL'ERS vs RISC5</h2>
            <p>Le seul outil français combinant HHRA (humain) et ERE (écologique) dans une même interface.</p>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, background: "#fff", borderRadius: 10, overflow: "hidden" }}>
              <thead>
                <tr style={{ background: "#1a5276", color: "#fff" }}>
                  <th style={{ padding: 10, textAlign: "left", border: "1px solid #0e2f44" }}>Critère</th>
                  <th style={cellTh}>RISC5</th>
                  <th style={cellTh}>MODUL'ERS (INERIS)</th>
                  <th style={{ ...cellTh, width: "22%", background: "#39e07a", color: "#0e2f44" }}>EQRS V9 + ECOTOX</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Dernière mise à jour", "2014 (gelé)", "Actif", "Juin 2026", "#c0392b", "#27ae60"],
                  ["Plateforme", "Windows desktop", "Windows + clé USB", "Web + Excel", "#999", "#999"],
                  ["Accompagnement", "Tutoriels en ligne", "Formation présentielle", "Formation à distance + études de cas utilisateur", "#999", "#999"],
                  ["Substances couvertes", "Bibliothèque US EPA", "~100 (INERIS)", "104 HHRA + 47 ECOTOX", "#999", "#999"],
                  ["PFAS UE 2020 (20 subst.)", "✗", "Partiel", "✓", "#c0392b", "#999"],
                  ["Calcul inverse (Cmax pour QD/ERI cible)", "Partiel", "✗", "✓", "#999", "#c0392b"],
                  ["Monte-Carlo 1000 tirages", "Limité", "✓", "✓ (+visuel)", "#999", "#27ae60"],
                  ["Simulation temporelle 70 ans", "Partiel", "✓", "✓ DeVaull 2007", "#999", "#27ae60"],
                  ["Chaîne trophique humaine", "✗", "✓", "✓ Trapp + Travis + INCA 3", "#c0392b", "#27ae60"],
                  ["Écotoxicologie Tier 1 + 2", "✗", "Partiel", "✓ ECOTOX V9", "#c0392b", "#999"],
                  ["Cascade PNEC INERIS/ECHA/EPA", "✗", "INERIS uniquement", "✓ Triple cascade", "#c0392b", "#999"],
                  ["Cartographie Leaflet + IGN + BRGM", "✗", "Partiel", "✓ native", "#c0392b", "#999"],
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
              <strong>Sources :</strong> INERIS MODUL'ERS, RISC5 User's Guide Nov 2014, substances.ineris.fr, ECHA REACH,
              US EPA Eco-SSL.
            </p>
          </div>
        </div>
      </section>

      {/* === 4. CADRE RÉGLEMENTAIRE === */}
      <section className="v2-section">
        <div className="container" style={{ maxWidth: 820 }}>
          <div className="v2-section-head">
            <span className="v2-section-eyebrow">Conformité réglementaire</span>
            <h2>Cadre normatif et scientifique</h2>
          </div>
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "28px 32px" }}>
            <h3 style={{ marginTop: 0, color: "#0e2f44" }}>Références appliquées</h3>
            <ul style={{ margin: 0, paddingLeft: 20, color: "#374151", lineHeight: 1.8, fontSize: 14.5 }}>
              <li><strong>INERIS ERS 2021</strong> — cadre national d'évaluation des risques sanitaires (ICPE, ARR, IEM).</li>
              <li><strong>INERIS DRC-09-103096-09387C</strong> — cumul des QD par organe cible et des ERI par effet cancérigène.</li>
              <li><strong>INERIS DRC-08-94882</strong> — méthodologie d'évaluation des risques écologiques (ERE).</li>
              <li><strong>US EPA RAGS Part A §8.2 / §8.3</strong> — sommation par organe / par type de cancer.</li>
              <li><strong>US EPA Mixture Risk Assessment 2000</strong> — mélange par organe cible.</li>
              <li><strong>US EPA IRIS 2024</strong> — 5 nouvelles ERU cancérogènes (PFOA, PFOS, DEHP, 2,3,7,8-TCDD, bromodichlorométhane).</li>
              <li><strong>ANSES 2018 + INCA 3</strong> — VTR, méthodologie IEM et rations alimentaires (chaîne trophique).</li>
              <li><strong>ECHA REACH Technical Guidance R.10</strong> — dérivation des PNEC.</li>
              <li><strong>US EPA Eco-SSL OSWER 9285.7-55</strong> — Ecological Soil Screening Levels.</li>
              <li><strong>Sample & Suter ORNL/TM-13391</strong> — transferts trophiques faune sauvage.</li>
              <li><strong>OECD TG 201/202/203/207/208/222</strong> — essais d'écotoxicité.</li>
              <li><strong>OFB 2016</strong> — paramètres ESO/ESU hyporhéiques. <strong>Méthodologie nationale SSP MEEM/MTES 2017</strong>.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* === 5. TARIF === */}
      <section className="v2-section bg-soft">
        <div className="container">
          <div className="v2-section-head">
            <span className="v2-section-eyebrow">Tarif</span>
            <h2>Abonnez-vous à EQRS V9 + ECOTOX</h2>
          </div>
          <div className="v2-pricing-grid" style={{ maxWidth: 520, margin: "0 auto" }}>
            <div className="v2-price-card featured">
              <span className="v2-badge">HHRA + ERE</span>
              <h3>Abonnement mensuel</h3>
              <p className="sub">EQRS V9 + extension ECOTOX V9</p>
              <div className="v2-price-amount">
                <span className="currency">€</span>395
              </div>
              <div className="v2-price-period">HT / mois</div>
              <ul className="v2-price-features">
                <li>104 substances HHRA + 47 substances écotox Tier 3</li>
                <li>5 modules avancés (Monte-Carlo, calcul inverse, temporel, trophique, mélange)</li>
                <li>Écotoxicologie Tier 1 + Tier 2</li>
                <li>Rapport PDF 14 pages + cartographie Leaflet</li>
                <li>Formation à distance + études de cas utilisateur</li>
                <li>Mises à jour réglementaires incluses</li>
              </ul>
              <button className="v2-btn v2-btn-primary v2-btn-block" style={{ cursor: "pointer", border: "none" }} onClick={subscribe}>
                S'abonner
              </button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 24 }}>
            <button className="v2-btn v2-btn-ghost" style={{ cursor: "pointer", border: "none" }} onClick={startTrial}>Essai gratuit 8 jours</button>
            <a href="/contact" className="v2-btn v2-btn-ghost">Demander une démo</a>
          </div>
        </div>
      </section>

      {/* === 6. NOTE TECHNIQUE PDF === */}
      <section className="v2-section">
        <div className="container">
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "32px", textAlign: "center", maxWidth: 820, margin: "0 auto" }}>
            <h3 style={{ marginTop: 0, color: "#0e2f44" }}>Note technique — EQRS V9 + ECOTOX</h3>
            <p style={{ color: "#374151", lineHeight: 1.6 }}>
              Téléchargez la note technique complète : architecture des 22 onglets, méthodologie HHRA et ERE, références
              scientifiques et exemples de calcul.
            </p>
            <a href="/notes-techniques/Note_Technique_EQRS_V9_ECOTOX.pdf" target="_blank" rel="noopener noreferrer" className="v2-btn v2-btn-primary">
              Télécharger la note technique (PDF)
            </a>
          </div>
        </div>
      </section>

      <V2Footer />
    </div>
  );
}
