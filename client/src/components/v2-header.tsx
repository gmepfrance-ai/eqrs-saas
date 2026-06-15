import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useTranslation, type Lang } from "@/lib/i18n";

/** Header v2 — design marine sombre, menu Accueil/Outils/Tarifs/Contact */
export function V2Header() {
  const { user, token, logout } = useAuth();
  const { lang, setLang, t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const LANGUAGES: { code: Lang; label: string; title: string }[] = [
    { code: "fr", label: "FR", title: "Français" },
    { code: "en", label: "GB", title: "English" },
    { code: "es", label: "ES", title: "Español" },
  ];

  // Ferme les menus quand on clique en dehors
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest(".v2-nav-dropdown")) setDropdownOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const goDashboard = () => {
    if (user && token) {
      window.location.hash = `#/dashboard?token=${token}`;
    } else {
      window.location.hash = "#/";
    }
  };

  return (
    <header className={`v2-header ${menuOpen ? "menu-open" : ""}`} role="banner">
      <div className="container">
        <a
          href="#/"
          className="v2-brand"
          aria-label="Accueil GMEP"
          onClick={(e) => {
            e.preventDefault();
            goDashboard();
          }}
        >
          <svg className="v2-brand-logo" viewBox="0 0 120 32" role="img" aria-label="G.M.E.P">
            <g transform="translate(0,2)">
              <path
                d="M10 0c-3 4-5.5 7.5-5.5 11A5.5 5.5 0 1 0 15.5 11c0-3.5-2.5-7-5.5-11z"
                fill="#39e07a"
              />
              <ellipse cx="8.5" cy="12.5" rx="1.6" ry="2.4" fill="rgba(255,255,255,0.55)" />
            </g>
            <text
              x="22"
              y="22"
              fontFamily="Inter, system-ui, sans-serif"
              fontSize="17"
              fontWeight="700"
              letterSpacing="0.5"
              fill="#ffffff"
            >
              G.M.E.P
            </text>
          </svg>
          <span className="v2-brand-tag">{t("nav.brandTag")}</span>
        </a>

        <nav className="v2-nav-center" aria-label={t("nav.home")}>
          <a href="#/">{t("nav.home")}</a>
          <div className={`v2-nav-dropdown ${dropdownOpen ? "open" : ""}`}>
            <button
              className="v2-nav-trigger"
              type="button"
              aria-haspopup="true"
              onClick={(e) => {
                e.stopPropagation();
                setDropdownOpen((v) => !v);
              }}
            >
              {t("nav.tools")}
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path
                  d="M2 4l3 3 3-3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className="v2-nav-dropdown-menu" role="menu">
              <a href="#/app" onClick={() => setDropdownOpen(false)}>
                {t("nav.tools.eqrs")}
                <span className="v2-nav-mi-desc">{t("nav.tools.eqrs.desc")}</span>
              </a>
              <a href="#/subscribe-tsn" onClick={() => setDropdownOpen(false)}>
                {t("nav.tools.tsn")}
                <span className="v2-nav-mi-desc">{t("nav.tools.tsn.desc")}</span>
              </a>
              <a href="#/subscribe-rabattement" onClick={() => setDropdownOpen(false)}>
                {t("nav.tools.rabattement")}
                <span className="v2-nav-mi-desc">{t("nav.tools.rabattement.desc")}</span>
              </a>
              <a href="#/eqrs-v31-05-ecotox" onClick={() => setDropdownOpen(false)}>
                {t("nav.tools.eqrsEcotox")}
                <span className="v2-nav-mi-desc">{t("nav.tools.eqrsEcotox.desc")}</span>
              </a>
              <a href="#/rabattement-v15-85" onClick={() => setDropdownOpen(false)}>
                {t("nav.tools.rabattement1585")}
                <span className="v2-nav-mi-desc">{t("nav.tools.rabattement1585.desc")}</span>
              </a>
              <a href="#/tsn-transfert-sol-nappe" onClick={() => setDropdownOpen(false)}>
                {t("nav.tools.tsnSolNappe")}
                <span className="v2-nav-mi-desc">{t("nav.tools.tsnSolNappe.desc")}</span>
              </a>
              <a href="#/subscribe-piezometres" onClick={() => setDropdownOpen(false)}>
                {t("nav.tools.piezometres")}
                <span className="v2-nav-mi-desc">{t("nav.tools.piezometres.desc")}</span>
              </a>
              <a href="#/schema-conceptuel" onClick={() => setDropdownOpen(false)}>
                {t("nav.tools.schemaConceptuel")}
                <span className="v2-nav-mi-desc">{t("nav.tools.schemaConceptuel.desc")}</span>
              </a>
            </div>
          </div>
          <a href="#/tarifs">{t("nav.pricing")}</a>
          <a href="#/cgv">{t("nav.cgv")}</a>
          <a href="#/contact">{t("nav.contact")}</a>
        </nav>

        <div className="v2-nav-right">
          <div className="v2-lang-switcher" role="group" aria-label="Choix de langue">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                className={`v2-lang-btn${lang === l.code ? " active" : ""}`}
                data-lang={l.code}
                title={l.title}
                aria-pressed={lang === l.code}
                onClick={() => setLang(l.code)}
              >
                {l.label}
              </button>
            ))}
          </div>
          {user ? (
            <>
              <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, marginRight: 8 }}>
                {user.name}
              </span>
              <a
                href="#/dashboard"
                className="v2-btn-header-outline"
                onClick={(e) => {
                  e.preventDefault();
                  goDashboard();
                }}
              >
                {t("nav.myArea")}
              </a>
              <button
                onClick={logout}
                className="v2-btn-header-cta"
                style={{ cursor: "pointer", border: "none" }}
                data-testid="button-logout"
              >
                {t("header.logout")}
              </button>
            </>
          ) : (
            <>
              <a href="#/login" className="v2-btn-header-outline" data-testid="link-login">
                {t("header.login")}
              </a>
              <a href="#/register" className="v2-btn-header-cta" data-testid="link-register">
                {t("header.register")}
              </a>
            </>
          )}
        </div>

        <button
          className="v2-burger"
          type="button"
          aria-label="Menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M3 6h18M3 12h18M3 18h18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
