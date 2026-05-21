import { V2Header } from "@/components/v2-header";
import { V2Footer } from "@/components/v2-footer";

/** Page contact v2 — formulaire mailto + coordonnées + carte OSM */
export default function ContactPage() {
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
          <h1 style={{ color: "#fff" }}>Contactez-nous</h1>
          <p className="lead" style={{ color: "rgba(255,255,255,0.85)", maxWidth: 680, margin: "0 auto" }}>
            Une question sur un outil, un devis sur mesure, un partenariat ? Écrivez-nous, nous
            répondons sous 48h ouvrées.
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
                <label htmlFor="ct-nom">Nom *</label>
                <input type="text" id="ct-nom" name="nom" required />
              </div>
              <div className="v2-form-field">
                <label htmlFor="ct-email">Email *</label>
                <input
                  type="email"
                  id="ct-email"
                  name="email"
                  required
                  placeholder="prenom.nom@bureau-etudes.fr"
                />
              </div>
              <div className="v2-form-field">
                <label htmlFor="ct-societe">Société</label>
                <input type="text" id="ct-societe" name="societe" />
              </div>
              <div className="v2-form-field">
                <label htmlFor="ct-tel">Téléphone</label>
                <input type="tel" id="ct-tel" name="telephone" />
              </div>
              <div className="v2-form-field">
                <label htmlFor="ct-msg">Message *</label>
                <textarea
                  id="ct-msg"
                  name="message"
                  rows={6}
                  required
                  placeholder="Décrivez votre besoin…"
                />
              </div>
              <button type="submit" className="v2-btn v2-btn-primary">
                Envoyer le message
              </button>
              <p style={{ fontSize: 12.5, color: "#6b7280", marginTop: 12 }}>
                En soumettant ce formulaire, vous acceptez que vos données soient utilisées pour
                répondre à votre demande. Conformité RGPD — voir{" "}
                <a href="#/mentions-legales">mentions légales</a>.
              </p>
            </form>

            <aside
              style={{
                background: "#f5f5f5",
                padding: 32,
                borderRadius: 14,
              }}
            >
              <h3 style={{ marginTop: 0 }}>Coordonnées</h3>
              <dl>
                <dt
                  style={{
                    fontWeight: 600,
                    color: "#1a2b4a",
                    fontSize: 13,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    marginTop: 12,
                  }}
                >
                  Adresse
                </dt>
                <dd style={{ margin: "4px 0 0", color: "#4b5563" }}>
                  SARL G.M.E.P
                  <br />
                  9 rue de la Marne
                  <br />
                  79400 Saint-Maixent-l'École
                </dd>
                <dt
                  style={{
                    fontWeight: 600,
                    color: "#1a2b4a",
                    fontSize: 13,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    marginTop: 12,
                  }}
                >
                  Téléphone
                </dt>
                <dd style={{ margin: "4px 0 0", color: "#4b5563" }}>
                  <a href="tel:+33607737233">06 07 73 72 33</a> (gérant)
                  <br />
                  <a href="tel:+33549165382">05 49 16 53 82</a> (siège)
                </dd>
                <dt
                  style={{
                    fontWeight: 600,
                    color: "#1a2b4a",
                    fontSize: 13,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    marginTop: 12,
                  }}
                >
                  Email
                </dt>
                <dd style={{ margin: "4px 0 0", color: "#4b5563" }}>
                  <a href="mailto:gmep.france@gmail.com">gmep.france@gmail.com</a>
                </dd>
                <dt
                  style={{
                    fontWeight: 600,
                    color: "#1a2b4a",
                    fontSize: 13,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    marginTop: 12,
                  }}
                >
                  Horaires
                </dt>
                <dd style={{ margin: "4px 0 0", color: "#4b5563" }}>
                  Lundi au vendredi
                  <br />9 h 00 — 18 h 00
                </dd>
                <dt
                  style={{
                    fontWeight: 600,
                    color: "#1a2b4a",
                    fontSize: 13,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    marginTop: 12,
                  }}
                >
                  SIREN
                </dt>
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
                  title="Carte — 9 rue de la Marne, 79400 Saint-Maixent-l'École"
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
