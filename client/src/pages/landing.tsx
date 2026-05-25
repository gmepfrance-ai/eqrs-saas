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
