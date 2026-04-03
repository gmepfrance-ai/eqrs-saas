import { useTranslation } from "@/lib/i18n";

export function GmepFooter() {
  const { t } = useTranslation();

  return (
    <footer
      className="text-white/85 px-4 sm:px-8 py-5 text-xs leading-relaxed flex flex-wrap gap-4 sm:gap-8 items-start mt-auto"
      style={{ background: "#0e2f44" }}
    >
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <svg
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-7 h-7 flex-shrink-0"
        >
          <rect
            x="1"
            y="1"
            width="26"
            height="26"
            rx="4"
            fill="rgba(255,255,255,0.1)"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="1"
          />
          <path
            d="M6 21V12l3-3h3l-3 6h3l-5 6z"
            fill="#2ecc71"
            opacity="0.8"
          />
          <path
            d="M14 9h8M14 15h6M14 21h5"
            stroke="#fff"
            strokeWidth="1.3"
            strokeLinecap="round"
            opacity="0.5"
          />
        </svg>
        <strong className="text-sm tracking-wide">G.M.E.P</strong>
      </div>

      <div className="flex-1 min-w-[200px]">
        SARL G.M.E.P — Global Management of Environmental Project
        <br />
        9 rue de la Marne, 79400 Saint-Maixent-l'École • SIREN 753 097 625
        <br />
        Tél. 06 07 73 72 33 • gmep.france@gmail.com • www.gmep-france.com
      </div>

      <div className="flex-1 min-w-[250px] text-right opacity-70 text-[0.7rem] leading-relaxed">
        © 2023–2026 G.M.E.P — {t("footer.rights")}
        <br />
        {t("footer.legal")}
        <br />
        {t("footer.repro")}
        <br />
        {t("footer.conception")} : Eric Azulay — Gérant SARL G.M.E.P
      </div>
    </footer>
  );
}
