import { V2Header } from "@/components/v2-header";
import { V2Footer } from "@/components/v2-footer";
import { useTranslation } from "@/lib/i18n";

export default function MentionsLegalesPage() {
  const { t } = useTranslation();
  return (
    <div className="v2-page" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <V2Header />
      <main style={{ flex: 1 }}>
        <div className="v2-legal-page">
          <div className="container">
            <article>
              <h1>{t("ml.title")}</h1>
              <p className="updated">{t("ml.updated")}</p>

              <h2>{t("ml.s1.title")}</h2>
              <p>
                <strong>{t("ml.s1.line1")}</strong><br />
                {t("ml.s1.line2")}<br />
                {t("ml.s1.line3")}<br />
                {t("ml.s1.line4")}<br />
                {t("ml.s1.line5")}<br />
                {t("ml.s1.line6")}{" "}
                <a href="mailto:gmep.france@gmail.com">gmep.france@gmail.com</a>
                <br />
                {t("ml.s1.line7")}
              </p>

              <h2>{t("ml.s2.title")}</h2>
              <p>
                {t("ml.s2.p1.before")}
                <a href="https://railway.com" target="_blank" rel="noopener noreferrer">
                  railway.com
                </a>
                {t("ml.s2.p1.after")}
              </p>

              <h2>{t("ml.s3.title")}</h2>
              <p>{t("ml.s3.p1")}</p>

              <h2>{t("ml.s4.title")}</h2>
              <p>{t("ml.s4.p1")}</p>
              <h3>{t("ml.s4.controller")}</h3>
              <p>{t("ml.s4.controllerVal")}</p>
              <h3>{t("ml.s4.dpo")}</h3>
              <p>{t("ml.s4.dpoVal")}</p>
              <h3>{t("ml.s4.purposes")}</h3>
              <ul>
                <li>{t("ml.s4.purpose1")}</li>
                <li>{t("ml.s4.purpose2")}</li>
                <li>{t("ml.s4.purpose3")}</li>
                <li>{t("ml.s4.purpose4")}</li>
              </ul>
              <h3>{t("ml.s4.rights")}</h3>
              <p>
                {t("ml.s4.rightsP")}{" "}
                <a href="mailto:gmep.france@gmail.com">gmep.france@gmail.com</a> — CNIL :{" "}
                <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">
                  www.cnil.fr
                </a>
                .
              </p>
              <h3>{t("ml.s4.retention")}</h3>
              <p>{t("ml.s4.retentionP")}</p>

              <h2>{t("ml.s5.title")}</h2>
              <p>{t("ml.s5.p1")}</p>

              <h2>{t("ml.s6.title")}</h2>
              <p>
                {t("ml.s6.p1.before")}
                <strong>{t("ml.s6.p1.strong")}</strong>
                {t("ml.s6.p1.after")}
              </p>

              <h2>{t("ml.s7.title")}</h2>
              <p>{t("ml.s7.p1")}</p>

              <h2>{t("ml.s8.title")}</h2>
              <p>{t("ml.s8.p1")}</p>
            </article>
          </div>
        </div>
      </main>
      <V2Footer />
    </div>
  );
}
