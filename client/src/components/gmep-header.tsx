import { Link } from "wouter";
import { useAuth } from "@/lib/auth";

export function GmepLogo({ size = 44 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      aria-label="Logo G.M.E.P"
    >
      <rect
        x="2"
        y="2"
        width="40"
        height="40"
        rx="6"
        fill="rgba(255,255,255,0.12)"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1.5"
      />
      <path
        d="M10 32V18l4-4h5l-5 9h5l-7 9z"
        fill="#2ecc71"
        opacity="0.9"
      />
      <path
        d="M22 14h12M22 22h10M22 30h8"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />
      <circle
        cx="35"
        cy="32"
        r="4"
        fill="none"
        stroke="#2ecc71"
        strokeWidth="1.5"
      />
      <path
        d="M33.5 32l1 1 2-2"
        stroke="#2ecc71"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GmepHeader() {
  const { user, token, logout } = useAuth();

  return (
    <header
      className="text-white px-4 sm:px-8 py-4 flex items-center gap-4 flex-wrap"
      style={{
        background:
          "linear-gradient(135deg, #0e2f44 0%, #1a5276 50%, #2471a3 100%)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
    >
      <div
        className="flex items-center gap-3 cursor-pointer flex-shrink-0"
        onClick={() => {
          if (user && token) {
            window.location.hash = `#/dashboard?token=${token}`;
          } else {
            window.location.hash = "#/";
          }
        }}
      >
        <GmepLogo />
        <div>
          <div className="text-xl font-extrabold tracking-wider leading-none">
            G.M.E.P
          </div>
          <div className="text-[0.52rem] tracking-widest opacity-70 uppercase mt-px">
            Global Management of Environmental Project
          </div>
        </div>
      </div>

      <div className="w-px h-9 bg-white/25 flex-shrink-0 hidden sm:block" />

      <div className="hidden sm:block">
        <h1 className="text-base font-bold tracking-tight">
          EQRS — Modèle Johnson &amp; Ettinger
        </h1>
        <p className="text-xs opacity-85 mt-0.5">
          Évaluation Quantitative des Risques Sanitaires • Intrusion de vapeurs
        </p>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {user ? (
          <>
            <span className="text-xs opacity-80 hidden sm:inline">
              {user.name}
            </span>
            <button
              data-testid="button-logout"
              onClick={logout}
              className="text-xs bg-white/15 hover:bg-white/25 rounded px-3 py-1.5 transition-colors"
            >
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              data-testid="link-login"
              className="text-xs bg-white/15 hover:bg-white/25 rounded px-3 py-1.5 transition-colors"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              data-testid="link-register"
              className="text-xs bg-[#2ecc71] hover:bg-[#27ae60] text-white rounded px-3 py-1.5 transition-colors font-medium"
            >
              Inscription
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
