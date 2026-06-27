/** Footer v2 — coordonnées GMEP + liens outils */
import { useTranslation } from "@/lib/i18n";

export function V2Footer() {
  const { t } = useTranslation();
  return (
    <footer className="v2-footer" role="contentinfo">
      <div className="container">
        <div className="v2-footer-grid">
          <div className="v2-footer-company">
            <strong>G.M.E.P</strong>
            {t("v2.footer.companyName")}<br />
            {t("v2.footer.companyFull")}<br />
            {t("v2.footer.address")}<br />
            {t("v2.footer.city")}<br />
            {t("v2.footer.siren")}<br />
            {t("v2.footer.phoneLabel")} <a href="tel:+33607737233">06 07 73 72 33</a><br />
            <a href="mailto:gmep.france@gmail.com">gmep.france@gmail.com</a>
          </div>
          <div className="v2-footer-col">
            <h6>{t("v2.footer.colTools")}</h6>
            <ul>
              <li>
                <a href="/app">{t("v2.footer.linkEqrs")}</a>
              </li>
              <li>
                <a href="/tsn">{t("v2.footer.linkTsn")}</a>
              </li>
              <li>
                <a href="/rabattement">{t("v2.footer.linkRabattement")}</a>
              </li>
            </ul>
          </div>
          <div className="v2-footer-col">
            <h6>{t("v2.footer.colCompany")}</h6>
            <ul>
              <li><a href="/tarifs">{t("v2.footer.linkPricing")}</a></li>
              <li><a href="/mentions-legales">{t("v2.footer.linkMentions")}</a></li>
              <li><a href="/cgv">{t("v2.footer.linkCgv")}</a></li>
              <li><a href="/CGV_GMEP_2026.pdf" download="CGV_GMEP_2026.pdf">{t("v2.footer.linkCgvPdf")}</a></li>
              <li><a href="/contact">{t("v2.footer.linkContact")}</a></li>
            </ul>
          </div>
          <div className="v2-footer-col v2-footer-legal">
            <p>{t("v2.footer.copyright")}</p>
            <p>{t("v2.footer.repro")}</p>
            <p className="credit">{t("v2.footer.credit")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
