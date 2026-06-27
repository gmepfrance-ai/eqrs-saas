import { V2Header } from "@/components/v2-header";
import { navigateTo } from "@/lib/navigation";
import { V2Footer } from "@/components/v2-footer";
import { useTranslation } from "@/lib/i18n";

/** Tarifs v2 — 4 cartes simples avec lien vers register / subscribe */
export default function TarifsPage() {
  const { t } = useTranslation();

  function startPlan(plan: string, path: string) {
    localStorage.setItem("pending_plan", plan);
    navigateTo(path); // navigateTo normalise un éventuel "#/xxx" en "/xxx"
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
          <h1 style={{ color: "#fff" }}>{t("tarifs.hero.title")}</h1>
          <p className="lead" style={{ color: "rgba(255,255,255,0.85)", maxWidth: 720, margin: "0 auto" }}>
            {t("tarifs.hero.lead")}
          </p>
        </div>
      </section>

      {/* Grille tarifs */}
      <section className="v2-section">
        <div className="container">
          <div className="v2-pricing-grid">
            {/* NOUVEAU — EQRS V31.05 + ECOTOX V8 */}
            <div className="v2-price-card featured">
              <span className="v2-badge">{t("tarifs.eqrsV31.badge")}</span>
              <h3>{t("v2.tools.eqrs_v31.title")}</h3>
              <p className="sub">{t("tarifs.eqrsV31.sub")}</p>
              <div className="v2-price-amount">
                <span className="currency">€</span>395
              </div>
              <div className="v2-price-period">{t("tarifs.eqrsMonthly.period")}</div>
              <ul className="v2-price-features">
                <li>{t("tarifs.eqrsV31.f1")}</li>
                <li>{t("tarifs.eqrsV31.f2")}</li>
                <li>{t("tarifs.eqrsV31.f3")}</li>
                <li>{t("tarifs.eqrsV31.f4")}</li>
              </ul>
              <button
                className="v2-btn v2-btn-primary v2-btn-block"
                onClick={() => startPlan("eqrs_v31_ecotox_monthly", "#/register")}
              >
                {t("tarifs.subscribe")}
              </button>
            </div>

            {/* NOUVEAU — Rabattement V15.85 multicouche IA */}
            <div className="v2-price-card">
              <span className="v2-badge" style={{ background: "#2563eb", color: "#fff" }}>
                {t("tarifs.rabattementV15.badge")}
              </span>
              <h3>{t("v2.tools.rabattement_v15.title")}</h3>
              <p className="sub">{t("tarifs.rabattementV15.sub")}</p>
              <div className="v2-price-amount">
                <span className="currency">€</span>1 500
              </div>
              <div className="v2-price-period">{t("tarifs.tsn.period")}</div>
              <ul className="v2-price-features">
                <li>{t("tarifs.rabattementV15.f1")}</li>
                <li>{t("tarifs.rabattementV15.f2")}</li>
                <li>{t("tarifs.rabattementV15.f3")}</li>
                <li>{t("tarifs.rabattementV15.f4")}</li>
              </ul>
              <button
                className="v2-btn v2-btn-blue v2-btn-block"
                onClick={() => startPlan("rabattement_annual", "#/register")}
              >
                {t("tarifs.subscribe")}
              </button>
            </div>

            {/* NOUVEAU — TSN Transfert Sol → Nappe */}
            <div className="v2-price-card">
              <span className="v2-badge" style={{ background: "#2563eb", color: "#fff" }}>
                {t("tarifs.tsnNew.badge")}
              </span>
              <h3>{t("v2.tools.tsn_new.title")}</h3>
              <p className="sub">{t("tarifs.tsnNew.sub")}</p>
              <div className="v2-price-amount">
                <span className="currency">€</span>1 100
              </div>
              <div className="v2-price-period">{t("tarifs.tsn.period")}</div>
              <ul className="v2-price-features">
                <li>{t("tarifs.tsnNew.f1")}</li>
                <li>{t("tarifs.tsnNew.f2")}</li>
                <li>{t("tarifs.tsnNew.f3")}</li>
                <li>{t("tarifs.tsnNew.f4")}</li>
              </ul>
              <button
                className="v2-btn v2-btn-blue v2-btn-block"
                onClick={() => startPlan("tsn_annual", "#/register")}
              >
                {t("tarifs.subscribe")}
              </button>
            </div>

            {/* NOUVEAU — Schéma Conceptuel IEM + PG */}
            <div className="v2-price-card">
              <span className="v2-badge" style={{ background: "#2563eb", color: "#fff" }}>
                {t("tarifs.schema.badge")}
              </span>
              <h3>{t("v2.tools.schema.title")}</h3>
              <p className="sub">{t("tarifs.schema.sub")}</p>
              <div className="v2-price-amount">
                <span className="currency">€</span>850
              </div>
              <div className="v2-price-period">{t("tarifs.tsn.period")}</div>
              <ul className="v2-price-features">
                <li>{t("tarifs.schema.f1")}</li>
                <li>{t("tarifs.schema.f2")}</li>
                <li>{t("tarifs.schema.f3")}</li>
                <li>{t("tarifs.schema.f4")}</li>
              </ul>
              <button
                className="v2-btn v2-btn-blue v2-btn-block"
                onClick={() => startPlan("schema_conceptuel_annual", "#/register")}
              >
                {t("tarifs.subscribe")}
              </button>
            </div>

            {/* J&E Mensuel */}
            <div className="v2-price-card">
              <h3>{t("v2.tools.eqrs.title")}</h3>
              <p className="sub">{t("tarifs.eqrsMonthly.sub")}</p>
              <div className="v2-price-amount">
                <span className="currency">€</span>245
              </div>
              <div className="v2-price-period">{t("tarifs.eqrsMonthly.period")}</div>
              <ul className="v2-price-features">
                <li>{t("tarifs.eqrsMonthly.f1")}</li>
                <li>{t("tarifs.eqrsMonthly.f2")}</li>
                <li>{t("tarifs.eqrsMonthly.f3")}</li>
                <li>{t("tarifs.eqrsMonthly.f4")}</li>
                <li>{t("tarifs.eqrsMonthly.f5")}</li>
                <li>{t("tarifs.eqrsMonthly.f6")}</li>
              </ul>
              <button
                className="v2-btn v2-btn-blue v2-btn-block"
                onClick={() => startPlan("monthly", "#/register")}
              >
                {t("tarifs.subscribe")}
              </button>
            </div>

            {/* J&E Annuel */}
            <div className="v2-price-card featured">
              <span className="v2-badge">{t("tarifs.eqrsAnnual.badge")}</span>
              <h3>{t("v2.tools.eqrs.title")}</h3>
              <p className="sub">{t("tarifs.eqrsAnnual.sub")}</p>
              <div className="v2-price-amount">
                <span className="currency">€</span>2 499
              </div>
              <div className="v2-price-period">{t("tarifs.eqrsAnnual.period")}</div>
              <ul className="v2-price-features">
                <li>{t("tarifs.eqrsAnnual.f1")}</li>
                <li>{t("tarifs.eqrsAnnual.f2")}</li>
                <li>{t("tarifs.eqrsAnnual.f3")}</li>
                <li>{t("tarifs.eqrsAnnual.f4")}</li>
                <li>{t("tarifs.eqrsAnnual.f5")}</li>
              </ul>
              <button
                className="v2-btn v2-btn-primary v2-btn-block"
                onClick={() => startPlan("annual", "#/register")}
              >
                {t("tarifs.subscribe")}
              </button>
            </div>

            {/* Domenico */}
            <div className="v2-price-card">
              <h3>{t("v2.tools.tsn.title")}</h3>
              <p className="sub">{t("tarifs.tsn.sub")}</p>
              <div className="v2-price-amount">
                <span className="currency">€</span>850
              </div>
              <div className="v2-price-period">{t("tarifs.tsn.period")}</div>
              <ul className="v2-price-features">
                <li>{t("tarifs.tsn.f1")}</li>
                <li>{t("tarifs.tsn.f2")}</li>
                <li>{t("tarifs.tsn.f3")}</li>
                <li>{t("tarifs.tsn.f4")}</li>
                <li>{t("tarifs.tsn.f5")}</li>
              </ul>
              <button
                className="v2-btn v2-btn-blue v2-btn-block"
                onClick={() => navigateTo("/subscribe-tsn")}
              >
                {t("tarifs.subscribe")}
              </button>
            </div>

            {/* Rabattement */}
            <div className="v2-price-card">
              <span className="v2-badge" style={{ background: "#2563eb", color: "#fff" }}>
                {t("tarifs.rabattement.badge")}
              </span>
              <h3>{t("v2.tools.rabattement.title")}</h3>
              <p className="sub">{t("tarifs.rabattement.sub")}</p>
              <div className="v2-price-amount">
                <span className="currency">€</span>1 100
              </div>
              <div className="v2-price-period">{t("tarifs.tsn.period")}</div>
              <ul className="v2-price-features">
                <li>{t("tarifs.rabattement.f1")}</li>
                <li>{t("tarifs.rabattement.f2")}</li>
                <li>{t("tarifs.rabattement.f3")}</li>
                <li>{t("tarifs.rabattement.f4")}</li>
                <li>{t("tarifs.rabattement.f5")}</li>
              </ul>
              <button
                className="v2-btn v2-btn-blue v2-btn-block"
                onClick={() => navigateTo("/subscribe-rabattement")}
              >
                {t("tarifs.subscribe")}
              </button>
            </div>
          </div>

          <p style={{ textAlign: "center", marginTop: 32, fontSize: 13.5, color: "#6b7280" }}>
            {t("tarifs.vatNote")}
          </p>

          {/* Conditions de licence — mono-poste */}
          <div
            style={{
              marginTop: 40,
              padding: "24px 28px",
              background: "#fff7ed",
              border: "1px solid #fed7aa",
              borderRadius: 12,
              maxWidth: 880,
              margin: "40px auto 0",
            }}
          >
            <h3 style={{ margin: "0 0 12px 0", fontSize: 17, color: "#9a3412" }}>
              {t("tarifs.license.title")}
            </h3>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: "#7c2d12", lineHeight: 1.7 }}>
              <li>
                {t("tarifs.license.b1.before")}<strong>{t("tarifs.license.b1.strong")}</strong>{t("tarifs.license.b1.after")}
              </li>
              <li>{t("tarifs.license.b2")}</li>
              <li>
                {t("tarifs.license.b3.before")}<strong>{t("tarifs.license.b3.strong")}</strong>{t("tarifs.license.b3.after")}
              </li>
              <li>{t("tarifs.license.b4")}</li>
            </ul>
          </div>
        </div>
      </section>

      <V2Footer />
    </div>
  );
}
