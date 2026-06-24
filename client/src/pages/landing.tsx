import { V2Header } from "@/components/v2-header";
import { V2Footer } from "@/components/v2-footer";
import { useTranslation } from "@/lib/i18n";

/** Landing page v2 — design marketing GMEP repris du site v2 */
export default function LandingPage() {
  const { t } = useTranslation();
  return (
    <div className="v2-page" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <V2Header />

      {/* === HERO === */}
      <section className="v2-hero">
        <div className="container">
          <div className="v2-hero-grid">
            <div>
              <span className="v2-hero-badge">{t("v2.hero.badge")}</span>
              <h1>
                {t("v2.hero.title.part1")} <span className="accent">{t("v2.hero.title.accent")}</span>{" "}
                {t("v2.hero.title.part2")}
              </h1>
              <p className="lead">{t("v2.hero.lead")}</p>
              <div className="v2-hero-cta">
                <a
                  href="#/tarifs"
                  className="v2-btn v2-btn-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("v2-outils")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  {t("v2.hero.cta.discover")}
                </a>
                <a href="#/register" className="v2-btn v2-btn-outline">
                  {t("v2.hero.cta.trial")}
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
                <span className="l">{t("v2.hero.mock.substance")}</span>
                <span className="v">Trichloroéthylène</span>
              </div>
              <div className="v2-hero-mock-row">
                <span className="l">{t("v2.hero.mock.alpha")}</span>
                <span className="v">2,4 × 10⁻⁴</span>
              </div>
              <div className="v2-hero-mock-row">
                <span className="l">{t("v2.hero.mock.cc")}</span>
                <span className="v">12,8 µg/L</span>
              </div>
              <div className="v2-hero-mock-row">
                <span className="l">{t("v2.hero.mock.qtheis")}</span>
                <span className="v">106,22 m³/h</span>
              </div>
              <div className="v2-hero-mock-result">
                <strong>{t("v2.hero.mock.status")}</strong>
                <span>{t("v2.hero.mock.statusValue")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === NOS TROIS LOGICIELS === */}
      <section className="v2-section" id="v2-outils">
        <div className="container">
          <div className="v2-section-head">
            <span className="v2-section-eyebrow">{t("v2.tools.eyebrow")}</span>
            <h2>{t("v2.tools.title")}</h2>
            <p>{t("v2.tools.subtitle")}</p>
          </div>
          <div className="v2-tools-grid">
            {/* Carte NOUVELLE 1 : EQRS V31.05 + ECOTOX V8 */}
            <article className="v2-tool-card">
              <span className="v2-badge">{t("v2.tools.eqrs_v31.badge")}</span>
              <div className="v2-tool-icon" aria-hidden="true">
                <svg viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="13" stroke="#1a5276" strokeWidth="2" />
                  <path d="M16 9v7l5 3" stroke="#39e07a" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="16" cy="16" r="2" fill="#39e07a" />
                </svg>
              </div>
              <h3>{t("v2.tools.eqrs_v31.title")}</h3>
              <p>{t("v2.tools.eqrs_v31.desc")}</p>
              <p style={{ marginTop: "0.5rem", fontSize: "0.92rem", color: "#1a2b4a", fontWeight: 500 }}>
                ✓ {t("v2.tools.eqrs_v31.feat1")}<br />
                ✓ {t("v2.tools.eqrs_v31.feat2")}<br />
                ✓ {t("v2.tools.eqrs_v31.feat3")}
              </p>
              <div className="v2-tool-price">{t("v2.tools.eqrs_v31.price")}</div>
              <a href="#/eqrs-v31-05-ecotox" className="v2-btn v2-btn-blue">
                {t("v2.tools.eqrs_v31.cta")}
              </a>
              <div style={{ marginTop: "0.75rem", textAlign: "center" }}>
                <a href="/notes-techniques/Note_Technique_EQRS_V31_05_ECOTOX.pdf" target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.85rem", color: "#2563eb", textDecoration: "underline" }}>Télécharger la note technique</a>
              </div>
            </article>

            {/* Carte NOUVELLE 2 : Rabattement V15.85 multicouche IA */}
            <article className="v2-tool-card">
              <span className="v2-badge">{t("v2.tools.rabattement_v15.badge")}</span>
              <div className="v2-tool-icon" aria-hidden="true">
                <svg viewBox="0 0 32 32" fill="none">
                  <path d="M3 12h26" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="2 2" />
                  <path d="M3 20h26" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="2 2" />
                  <rect x="14" y="3" width="4" height="22" rx="1" fill="#1a2b4a" />
                  <path d="M16 13c-2 2-3.5 4.5-3.5 7a3.5 3.5 0 007 0c0-2.5-1.5-5-3.5-7z" fill="#39e07a" />
                </svg>
              </div>
              <h3>{t("v2.tools.rabattement_v15.title")}</h3>
              <p>{t("v2.tools.rabattement_v15.desc")}</p>
              <p style={{ marginTop: "0.5rem", fontSize: "0.92rem", color: "#1a2b4a", fontWeight: 500 }}>
                ✓ {t("v2.tools.rabattement_v15.feat1")}<br />
                ✓ {t("v2.tools.rabattement_v15.feat2")}<br />
                ✓ {t("v2.tools.rabattement_v15.feat3")}
              </p>
              <div className="v2-tool-price">{t("v2.tools.rabattement_v15.price")}</div>
              <a href="#/rabattement-v15-85" className="v2-btn v2-btn-blue">
                {t("v2.tools.rabattement_v15.cta")}
              </a>
              <div style={{ marginTop: "0.75rem", textAlign: "center" }}>
                <a href="/notes-techniques/Note_Technique_Rabattement_Comparatif.pdf" target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.85rem", color: "#2563eb", textDecoration: "underline" }}>Comparer les versions Rabattement</a>
              </div>
            </article>

            {/* Carte NOUVELLE 3 : TSN Transfert Sol → Nappe */}
            <article className="v2-tool-card">
              <span className="v2-badge">{t("v2.tools.tsn_new.badge")}</span>
              <div className="v2-tool-icon" aria-hidden="true">
                <svg viewBox="0 0 32 32" fill="none">
                  <rect x="2" y="6" width="28" height="6" rx="1" fill="#a16207" />
                  <rect x="2" y="12" width="28" height="6" rx="1" fill="#2563eb" opacity="0.7" />
                  <rect x="2" y="18" width="28" height="8" rx="1" fill="#1a2b4a" />
                  <circle cx="24" cy="22" r="3" fill="none" stroke="#39e07a" strokeWidth="1.5" />
                  <path d="M8 22h10" stroke="#39e07a" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h3>{t("v2.tools.tsn_new.title")}</h3>
              <p>{t("v2.tools.tsn_new.desc")}</p>
              <p style={{ marginTop: "0.5rem", fontSize: "0.92rem", color: "#1a2b4a", fontWeight: 500 }}>
                ✓ {t("v2.tools.tsn_new.feat1")}<br />
                ✓ {t("v2.tools.tsn_new.feat2")}<br />
                ✓ {t("v2.tools.tsn_new.feat3")}
              </p>
              <div className="v2-tool-price">{t("v2.tools.tsn_new.price")}</div>
              <a href="#/tsn-transfert-sol-nappe" className="v2-btn v2-btn-blue">
                {t("v2.tools.tsn_new.cta")}
              </a>
              <div style={{ marginTop: "0.75rem", textAlign: "center" }}>
                <a href="/notes-techniques/Note_Technique_TSN_Comparatif.pdf" target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.85rem", color: "#2563eb", textDecoration: "underline" }}>Comparer les versions TSN</a>
              </div>
            </article>

            {/* Carte NOUVELLE 4 : Schéma Conceptuel IEM + PG */}
            <article className="v2-tool-card">
              <span className="v2-badge">{t("v2.tools.schema.badge")}</span>
              <div className="v2-tool-icon" aria-hidden="true">
                <svg viewBox="0 0 32 32" fill="none">
                  <rect x="2" y="11" width="8" height="10" rx="1.5" fill="#c0392b" opacity="0.85" />
                  <rect x="12" y="11" width="8" height="10" rx="1.5" fill="#d97706" opacity="0.85" />
                  <rect x="22" y="11" width="8" height="10" rx="1.5" fill="#1a5276" opacity="0.85" />
                  <path d="M10 16h2M20 16h2" stroke="#39e07a" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h3>{t("v2.tools.schema.title")}</h3>
              <p>{t("v2.tools.schema.desc")}</p>
              <p style={{ marginTop: "0.5rem", fontSize: "0.92rem", color: "#1a2b4a", fontWeight: 500 }}>
                ✓ {t("v2.tools.schema.feat1")}<br />
                ✓ {t("v2.tools.schema.feat2")}<br />
                ✓ {t("v2.tools.schema.feat3")}
              </p>
              <div className="v2-tool-price">{t("v2.tools.schema.price")}</div>
              <a href="#/schema-conceptuel" className="v2-btn v2-btn-blue">
                {t("v2.tools.schema.cta")}
              </a>
              <div style={{ marginTop: "0.75rem", textAlign: "center" }}>
                <a href="/notes-techniques/Note_Technique_Schema_Conceptuel.pdf" target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.85rem", color: "#2563eb", textDecoration: "underline" }}>Télécharger la note technique</a>
              </div>
            </article>

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
              <h3>{t("v2.tools.eqrs.title")}</h3>
              <p>{t("v2.tools.eqrs.desc")}</p>
              <p style={{ marginTop: "0.5rem", fontSize: "0.92rem", color: "#1a2b4a", fontWeight: 500 }}>
                ✓ {t("v2.tools.eqrs.feat1")}<br />
                ✓ {t("v2.tools.eqrs.feat2")}<br />
                ✓ {t("v2.tools.eqrs.feat3")}
              </p>
              <div className="v2-tool-price">{t("v2.tools.eqrs.price")}</div>
              <a
                href="#/app"
                className="v2-btn v2-btn-blue"
                onClick={() => localStorage.setItem("pending_plan", "monthly")}
              >
                {t("v2.tools.eqrs.cta")}
              </a>
              <div style={{ marginTop: "0.75rem", display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" }}>
                <a
                  href="/Rapport_EQRS_Johnson_Ettinger.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "0.85rem", color: "#2563eb", textDecoration: "underline" }}
                >
                  {t("v2.tools.eqrs.linkReport")}
                </a>
                <a
                  href="/Schema_Conceptuel_Illustre.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "0.85rem", color: "#2563eb", textDecoration: "underline" }}
                >
                  {t("v2.tools.eqrs.linkSchema")}
                </a>
                <a
                  href="/GMEP_EQRS_v2_Complet.zip"
                  download="GMEP_EQRS_v2_Complet.zip"
                  style={{ fontSize: "0.85rem", color: "#2563eb", textDecoration: "underline" }}
                >
                  {t("v2.tools.eqrs.linkZip")}
                </a>
                <a
                  href="/notes-techniques/Note_Technique_EQRS_V7_JE.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "0.85rem", color: "#2563eb", textDecoration: "underline" }}
                >
                  Note technique J&amp;E
                </a>
              </div>
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
              <h3>{t("v2.tools.tsn.title")}</h3>
              <p>{t("v2.tools.tsn.desc")}</p>
              <div className="v2-tool-price">{t("v2.tools.tsn.price")}</div>
              <a href="#/subscribe-tsn" className="v2-btn v2-btn-blue">
                {t("v2.tools.eqrs.cta")}
              </a>
            </article>

            {/* Carte 3 : Rabattement (NOUVEAU) */}
            <article className="v2-tool-card">
              <span className="v2-badge">{t("v2.tools.rabattement.badgeNew")}</span>
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
              <h3>{t("v2.tools.rabattement.title")}</h3>
              <p>{t("v2.tools.rabattement.desc")}</p>
              <div className="v2-tool-price">{t("v2.tools.rabattement.price")}</div>
              <a href="#/subscribe-rabattement" className="v2-btn v2-btn-blue">
                {t("v2.tools.eqrs.cta")}
              </a>
            </article>

            {/* Carte 8 : GMEP Piézomètres v2.9c */}
            <article className="v2-tool-card">
              <span className="v2-badge">{t("v2.tools.piezometres.badge")}</span>
              <div className="v2-tool-icon" aria-hidden="true">
                <svg viewBox="0 0 32 32" fill="none">
                  <rect x="4" y="4" width="4" height="24" rx="1" fill="#0e6b3c" />
                  <rect x="14" y="8" width="4" height="20" rx="1" fill="#0e6b3c" />
                  <rect x="24" y="12" width="4" height="16" rx="1" fill="#0e6b3c" />
                  <path d="M2 22h28" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="2 2" />
                  <circle cx="6" cy="6" r="1.5" fill="#39e07a" />
                  <circle cx="16" cy="10" r="1.5" fill="#39e07a" />
                  <circle cx="26" cy="14" r="1.5" fill="#39e07a" />
                </svg>
              </div>
              <h3>{t("v2.tools.piezometres.title")}</h3>
              <p>{t("v2.tools.piezometres.desc")}</p>
              <p style={{ marginTop: "0.5rem", fontSize: "0.92rem", color: "#1a2b4a", fontWeight: 500 }}>
                ✓ {t("v2.tools.piezometres.feat1")}<br />
                ✓ {t("v2.tools.piezometres.feat2")}<br />
                ✓ {t("v2.tools.piezometres.feat3")}
              </p>
              <div className="v2-tool-price">{t("v2.tools.piezometres.price")}</div>
              <a href="#/subscribe-piezometres" className="v2-btn v2-btn-blue">
                {t("v2.tools.piezometres.cta")}
              </a>
              <div style={{ marginTop: "0.75rem", textAlign: "center" }}>
                <a href="/notes-techniques/Note_Technique_Piezometres_V29c.pdf" target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.85rem", color: "#2563eb", textDecoration: "underline" }}>Télécharger la note technique</a>
              </div>
            </article>

            {/* Carte MSP GMEP : Diagnostic & Modélisation Sources de Pollution */}
            <article className="v2-tool-card">
              <span className="v2-badge" style={{background:"#16a34a",color:"#fff"}}>NOUVEAU</span>
              <div className="v2-tool-icon" aria-hidden="true">
                <svg viewBox="0 0 32 32" fill="none">
                  <rect x="2" y="18" width="28" height="12" rx="1.5" fill="#a3c96b" opacity="0.5"/>
                  <rect x="2" y="12" width="28" height="6" rx="1" fill="#f59e0b" opacity="0.6"/>
                  <rect x="2" y="6" width="28" height="6" rx="1" fill="#ef4444" opacity="0.7"/>
                  <circle cx="10" cy="9" r="2.5" fill="#1a2b4a"/>
                  <circle cx="20" cy="15" r="2.5" fill="#1a2b4a"/>
                  <circle cx="14" cy="21" r="2.5" fill="#1a2b4a"/>
                  <path d="M10 9l10 6M20 15l-6 6" stroke="#3ddc84" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </div>
              <h3>{t("v2.tools.msp.title")}</h3>
              <p>{t("v2.tools.msp.desc")}</p>
              <p style={{ marginTop: "0.5rem", fontSize: "0.92rem", color: "#1a2b4a", fontWeight: 500 }}>
                ✓ {t("v2.tools.msp.feat1")}<br />
                ✓ {t("v2.tools.msp.feat2")}<br />
                ✓ {t("v2.tools.msp.feat3")}
              </p>
              <div className="v2-tool-price">{t("v2.tools.msp.price")}</div>
              <a href="/msp-gmep.html" className="v2-btn v2-btn-blue" style={{background:"#16a34a"}}>
                {t("v2.tools.msp.cta")}
              </a>
              <div style={{ marginTop: "0.75rem", textAlign: "center" }}>
                <a href="/notes-techniques/Note_Technique_MSP_GMEP.pdf" target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.85rem", color: "#2563eb", textDecoration: "underline" }}>Télécharger la note technique</a>
                <br />
                <a href="/notes-techniques/Exemple-rapport-modelisation-MSP.pdf" target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.85rem", color: "#16a34a", textDecoration: "underline", fontWeight: 500 }}>📄 Exemple de rapport — modélisation 3D</a>
                <br />
                <a href="/notes-techniques/Plaquette_MSP_Promoteurs_Enseignes.pdf" target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.85rem", color: "#16a34a", textDecoration: "underline", fontWeight: 500 }}>📋 Plaquette de présentation MSP GMEP</a>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* === POURQUOI GMEP === */}
      <section className="v2-section bg-soft">
        <div className="container">
          <div className="v2-section-head">
            <span className="v2-section-eyebrow">{t("v2.why.eyebrow")}</span>
            <h2>{t("v2.why.title")}</h2>
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
              <h3>{t("v2.why.compliance.title")}</h3>
              <p>{t("v2.why.compliance.desc")}</p>
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
              <h3>{t("v2.why.realtime.title")}</h3>
              <p>{t("v2.why.realtime.desc")}</p>
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
              <h3>{t("v2.why.pdf.title")}</h3>
              <p>{t("v2.why.pdf.desc")}</p>
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
              <h3>{t("v2.why.trial.title")}</h3>
              <p>{t("v2.why.trial.desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* === CONDITIONS DE LICENCE === */}
      <section className="v2-section" style={{ background: "#fffbeb" }}>
        <div className="container">
          <div
            style={{
              maxWidth: 920,
              margin: "0 auto",
              padding: "28px 32px",
              background: "#fff",
              border: "1px solid #fcd34d",
              borderRadius: 14,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <h2 style={{ margin: "0 0 16px 0", color: "#92400e", fontSize: 22 }}>
              {t("v2.license.title")}
            </h2>
            <p style={{ margin: "0 0 12px 0", fontSize: 15, color: "#451a03", lineHeight: 1.65 }}>
              {t("v2.license.p1.before")}
              <strong>{t("v2.license.p1.strong1")}</strong>
              {t("v2.license.p1.middle")}
              <strong>{t("v2.license.p1.strong2")}</strong>
              {t("v2.license.p1.after")}
            </p>
            <p style={{ margin: 0, fontSize: 15, color: "#451a03", lineHeight: 1.65 }}>
              {t("v2.license.p2.before")}
              <strong>{t("v2.license.p2.strong1")}</strong>
              {t("v2.license.p2.middle")}
              <strong>{t("v2.license.p2.strong2")}</strong>
              {t("v2.license.p2.after")}
            </p>
          </div>
        </div>
      </section>

      {/* === BANNIÈRE CTA === */}
      <section className="v2-section">
        <div className="container">
          <div className="v2-cta-band">
            <h2>{t("v2.cta.title")}</h2>
            <p>{t("v2.cta.desc")}</p>
            <a href="#/register" className="v2-btn v2-btn-primary">
              {t("v2.cta.btn")}
            </a>
          </div>
        </div>
      </section>

      <V2Footer />
    </div>
  );
}
