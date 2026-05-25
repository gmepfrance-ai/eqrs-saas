import { V2Header } from "@/components/v2-header";
import { V2Footer } from "@/components/v2-footer";
import { useTranslation } from "@/lib/i18n";

/** Page contact v2 — formulaire mailto + coordonnées + carte OSM */
export default function ContactPage() {
  const { t } = useTranslation();
  const dtStyle = {
    fontWeight: 600,
    color: "#1a2b4a",
    fontSize: 13,
    textTransform: "uppercase" as const,
    letterSpacing: "0.04em",
    marginTop: 12,
  };
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
          <h1 style={{ color: "#fff" }}>{t("contact.hero.title")}</h1>
          <p className="lead" style={{ color: "rgba(255,255,255,0.85)", maxWidth: 680, margin: "0 auto" }}>
            {t("contact.hero.lead")}
          </p>
        </div>
      </section>

      <section className="v2-section">
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.4fr 1fr",
              gap: 48,
            }}
            className="v2-contact-grid"
          >
            <form
              action="mailto:gmep.france@gmail.com"
              method="post"
              encType="text/plain"
            >
              <div className="v2-form-field">
                <label htmlFor="ct-nom">{t("contact.form.name")}</label>
                <input type="text" id="ct-nom" name="nom" required />
              </div>
              <div className="v2-form-field">
                <label htmlFor="ct-email">{t("contact.form.email")}</label>
                <input
                  type="email"
                  id="ct-email"
                  name="email"
                  required
                  placeholder={t("contact.form.emailPh")}
                />
              </div>
              <div className="v2-form-field">
                <label htmlFor="ct-societe">{t("contact.form.company")}</label>
                <input type="text" id="ct-societe" name="societe" />
              </div>
              <div className="v2-form-field">
                <label htmlFor="ct-tel">{t("contact.form.phone")}</label>
                <input type="tel" id="ct-tel" name="telephone" />
              </div>
              <div className="v2-form-field">
                <label htmlFor="ct-msg">{t("contact.form.message")}</label>
                <textarea
                  id="ct-msg"
                  name="message"
                  rows={6}
                  required
                  placeholder={t("contact.form.messagePh")}
                />
              </div>
              <button type="submit" className="v2-btn v2-btn-primary">
                {t("contact.form.send")}
              </button>
              <p style={{ fontSize: 12.5, color: "#6b7280", marginTop: 12 }}>
                {t("contact.form.gdprBefore")}{" "}
                <a href="#/mentions-legales">{t("contact.form.gdprLink")}</a>.
              </p>
            </form>

            <aside
              style={{
                background: "#f5f5f5",
                padding: 32,
                borderRadius: 14,
              }}
            >
              <h3 style={{ marginTop: 0 }}>{t("contact.info.title")}</h3>
              <dl>
                <dt style={dtStyle}>{t("contact.info.address")}</dt>
                <dd style={{ margin: "4px 0 0", color: "#4b5563" }}>
                  SARL G.M.E.P
                  <br />
                  9 rue de la Marne
                  <br />
                  79400 Saint-Maixent-l'École
                </dd>
                <dt style={dtStyle}>{t("contact.info.phoneLabel")}</dt>
                <dd style={{ margin: "4px 0 0", color: "#4b5563" }}>
                  <a href="tel:+33607737233">06 07 73 72 33</a> ({t("contact.info.phoneManager")})
                  <br />
                  <a href="tel:+33549165382">05 49 16 53 82</a> ({t("contact.info.phoneOffice")})
                </dd>
                <dt style={dtStyle}>{t("contact.info.email")}</dt>
                <dd style={{ margin: "4px 0 0", color: "#4b5563" }}>
                  <a href="mailto:gmep.france@gmail.com">gmep.france@gmail.com</a>
                </dd>
                <dt style={dtStyle}>{t("contact.info.hours")}</dt>
                <dd style={{ margin: "4px 0 0", color: "#4b5563" }}>
                  {t("contact.info.hoursValue")}
                  <br />
                  {t("contact.info.hoursTime")}
                </dd>
                <dt style={dtStyle}>{t("contact.info.siren")}</dt>
                <dd style={{ margin: "4px 0 0", color: "#4b5563" }}>753 097 625</dd>
              </dl>
              <div
                style={{
                  marginTop: 16,
                  borderRadius: 10,
                  overflow: "hidden",
                  border: "1px solid #e5e7eb",
                  aspectRatio: "16/10",
                }}
              >
                <iframe
                  src="https://www.openstreetmap.org/export/embed.html?bbox=-0.215%2C46.405%2C-0.195%2C46.420&layer=mapnik&marker=46.4125%2C-0.2050"
                  title="9 rue de la Marne, 79400 Saint-Maixent-l'École"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  style={{ width: "100%", height: "100%", border: 0 }}
                />
              </div>
            </aside>
          </div>
        </div>
      </section>

      <V2Footer />
    </div>
  );
}
