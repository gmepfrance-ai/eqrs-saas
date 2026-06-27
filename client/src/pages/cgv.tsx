import { V2Header } from "@/components/v2-header";
import { V2Footer } from "@/components/v2-footer";
import { useTranslation } from "@/lib/i18n";

export default function CgvPage() {
  const { t } = useTranslation();
  return (
    <div className="v2-page" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <V2Header />
      <main style={{ flex: 1 }}>
        <div className="v2-legal-page">
          <div className="container">
            <article>
              <h1>{t("cgv.title")}</h1>
              <p className="updated">{t("cgv.updated")}</p>
              <div style={{ margin: "16px 0 24px 0" }}>
                <a
                  href="/CGV_GMEP_2026.pdf"
                  download="CGV_GMEP_2026.pdf"
                  className="v2-btn v2-btn-blue"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}
                  data-testid="button-download-cgv"
                >
                  {t("cgv.download")}
                </a>
              </div>

              <h2>{t("cgv.s1.title")}</h2>
              <p>
                {t("cgv.s1.p1.before")}
                <strong>EQRS Johnson &amp; Ettinger</strong>,{" "}
                <strong>Transfert Sol → Nappe → Captage</strong> et{" "}
                <strong>Rabattement de nappe</strong>
                {t("cgv.s1.p1.after")}
              </p>

              <h2>{t("cgv.s2.title")}</h2>
              <p>{t("cgv.s2.p1")}</p>
              <ul>
                <li>
                  <strong>EQRS Johnson &amp; Ettinger</strong> {t("cgv.s2.li1")}
                </li>
                <li>
                  <strong>Transfert Sol → Nappe → Captage</strong> {t("cgv.s2.li2")}
                </li>
                <li>
                  <strong>Rabattement de nappe</strong> {t("cgv.s2.li3")}
                </li>
              </ul>
              <p>
                {t("cgv.s2.p2.before")}
                <strong>{t("cgv.s2.p2.strong")}</strong>
                {t("cgv.s2.p2.after")}
              </p>

              <h2>{t("cgv.s3.title")}</h2>
              <p>
                {t("cgv.s3.p1.before")}
                <strong>{t("cgv.s3.p1.strong")}</strong>
                {t("cgv.s3.p1.after")}
              </p>
              <p>
                {t("cgv.s3.p2.before")}
                <strong>{t("cgv.s3.p2.strong")}</strong>
                {t("cgv.s3.p2.after")}
              </p>
              <p>{t("cgv.s3.p3")}</p>

              <h2>{t("cgv.s4.title")}</h2>
              <p>{t("cgv.s4.p1")}</p>

              <h2>{t("cgv.s5.title")}</h2>
              <p>{t("cgv.s5.p1")}</p>

              <h2>{t("cgv.s6.title")}</h2>
              <p>{t("cgv.s6.p1")}</p>

              <h2>{t("cgv.s7.title")}</h2>
              <p>
                {t("cgv.s7.p1.before")}
                <strong>{t("cgv.s7.p1.strong1")}</strong>
                {t("cgv.s7.p1.middle")}
                <strong>{t("cgv.s7.p1.strong2")}</strong>
                {t("cgv.s7.p1.after")}
              </p>
              <p>
                {t("cgv.s7.p2.before")}
                <strong>{t("cgv.s7.p2.strong")}</strong>
                {t("cgv.s7.p2.after")}
              </p>
              <p>
                {t("cgv.s7.p3.before")}
                <strong>{t("cgv.s7.p3.strong1")}</strong>
                {t("cgv.s7.p3.middle")}
                <strong>{t("cgv.s7.p3.strong2")}</strong>
                {t("cgv.s7.p3.after")}
              </p>
              <p>
                {t("cgv.s7.p4")}{" "}
                <a href="mailto:gmep.france@gmail.com">gmep.france@gmail.com</a>.
              </p>

              <h2>{t("cgv.s8.title")}</h2>
              <p>
                {t("cgv.s8.p1.before")}
                <a href="/mentions-legales">{t("cgv.s8.p1.link")}</a>
                {t("cgv.s8.p1.after")}
              </p>

              <h2>{t("cgv.s9.title")}</h2>
              <p>{t("cgv.s9.p1")}</p>

              <h2>{t("cgv.s10.title")}</h2>
              <p>{t("cgv.s10.p1")}</p>

              <h2>{t("cgv.s11.title")}</h2>
              <p>{t("cgv.s11.p1")}</p>

              <h2>{t("cgv.s12.title")}</h2>
              <p>
                {t("cgv.s12.p1.before")}
                <strong>{t("cgv.s12.p1.strong")}</strong>
                {t("cgv.s12.p1.after")}
              </p>

              <h2>{t("cgv.s13.title")}</h2>
              <p>
                {t("cgv.s13.p1.before")}
                <a href="mailto:gmep.france@gmail.com">gmep.france@gmail.com</a>
                {t("cgv.s13.p1.after")}
              </p>
            </article>
          </div>
        </div>
      </main>
      <V2Footer />
    </div>
  );
}
