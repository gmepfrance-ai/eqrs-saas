import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { ChevronRight, Lock, FlaskConical, AlertTriangle } from "lucide-react";

// ── Substance data ──────────────────────────────────────────────────────────
const DEMO_SUBSTANCES: Record<
  string,
  {
    Da: number;
    Dw: number;
    H: number;
    VTR_inhal: number;
    ERU_inhal: number;
    M: number;
    volatile: boolean;
  }
> = {
  Benzène: {
    Da: 8.8e-6,
    Dw: 9.8e-10,
    H: 0.228,
    VTR_inhal: 0.03,
    ERU_inhal: 7.8e-6,
    M: 78.11,
    volatile: true,
  },
  Toluène: {
    Da: 8.7e-6,
    Dw: 8.6e-10,
    H: 0.272,
    VTR_inhal: 5,
    ERU_inhal: 0,
    M: 92.14,
    volatile: true,
  },
  "Trichloroéthylène (TCE)": {
    Da: 7.9e-6,
    Dw: 1.03e-9,
    H: 0.422,
    VTR_inhal: 0.002,
    ERU_inhal: 4.1e-6,
    M: 131.39,
    volatile: true,
  },
  Naphtalène: {
    Da: 6.0e-6,
    Dw: 7.5e-10,
    H: 0.02,
    VTR_inhal: 0.003,
    ERU_inhal: 3.4e-5,
    M: 128.17,
    volatile: true,
  },
  Plomb: {
    Da: 0,
    Dw: 0,
    H: 0,
    VTR_inhal: 0,
    ERU_inhal: 1.2e-5,
    M: 207.2,
    volatile: false,
  },
};

const SUBSTANCE_NAMES = Object.keys(DEMO_SUBSTANCES);

// ── J&E calculation ─────────────────────────────────────────────────────────
interface CalcResult {
  alpha: number;
  Qbuilding: number;
  Cindoor_sg: number;
  Cindoor_gw: number;
  QD_inhal: number;
  ERI_inhal: number;
  isVolatile: boolean;
}

function calculateJE(
  substanceName: string,
  Csg: number,  // µg/m³ sol-gaz
  Cgw: number,  // µg/L eaux souterraines
  LT: number    // distance source-dalle (m)
): CalcResult {
  const substance = DEMO_SUBSTANCES[substanceName];

  if (!substance.volatile) {
    return {
      alpha: 0,
      Qbuilding: 0,
      Cindoor_sg: 0,
      Cindoor_gw: 0,
      QD_inhal: 0,
      ERI_inhal: 0,
      isVolatile: false,
    };
  }

  const { Da, Dw, H, VTR_inhal, ERU_inhal } = substance;

  // Building & soil params
  const n = 0.35, θw = 0.15, θa = 0.20;
  const LB = 10, WB = 10, HB = 2.5, ER = 0.45;
  const kv = 1e-12, dP = 4, mu = 1.81e-5;
  const Lcrack = 0.15, eta = 0.0002, Zcrack = 0.15;

  const AB = LB * WB;
  const Qbuilding = (LB * WB * HB * ER) / 3600;
  const Acrack = eta * AB;
  const Xcrack = 2 * (LB + WB);
  const rcrack = (eta * AB) / Xcrack;

  const Deff =
    (Da * Math.pow(θa, 10 / 3)) / (n * n) +
    (Dw * Math.pow(θw, 10 / 3)) / (n * n) / H;

  const Qsoil =
    (2 * Math.PI * kv * dP * Zcrack) /
    (mu * Math.log((2 * Zcrack) / rcrack));

  const A = (Deff * AB) / (Qbuilding * LT);
  const Pe_sol = (Qsoil * LT) / (Deff * AB);
  const Pe_crack = (Qsoil * Lcrack) / (Deff * Acrack);

  const alpha =
    (A * Math.exp(Pe_sol) * Pe_crack) /
    (Math.exp(Pe_crack) - 1 + A * Math.exp(Pe_sol) * Pe_crack);

  // Indoor concentrations
  // sol-gaz: Cindoor = alpha * Csg
  const Cindoor_sg = isFinite(alpha) ? alpha * Csg : 0;

  // nappe: convert Cgw µg/L → µg/m³ in soil-gas via H (dimensionless)
  // Cgw_sg = Cgw * 1000 * H (µg/L → µg/m³ × H)
  const Cgw_sg = Cgw * 1000 * H; // equivalent soil-gas concentration
  const Cindoor_gw = isFinite(alpha) ? alpha * Cgw_sg : 0;

  // Total indoor (sum of contributions)
  const Cindoor_total = Cindoor_sg + Cindoor_gw;

  // Exposure factors
  const Fi = 0.8, EF = 350, ED = 30;
  const AT_nc = 30; // ans non-cancérigène
  const AT_c = 70;  // ans cancérigène

  // QD (Quotient de Danger) — non-cancérigène
  const QD_inhal =
    VTR_inhal > 0
      ? ((Cindoor_total * Fi * (EF / 365) * ED) / AT_nc / 1000) / VTR_inhal
      : 0;

  // ERI (Excès de Risque Individuel)
  const ERI_inhal =
    ERU_inhal > 0
      ? ((Cindoor_total * Fi * (EF / 365) * ED) / AT_c / 1000) * ERU_inhal
      : 0;

  return {
    alpha: isFinite(alpha) ? alpha : 0,
    Qbuilding,
    Cindoor_sg,
    Cindoor_gw,
    QD_inhal,
    ERI_inhal,
    isVolatile: true,
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmtSci(n: number): string {
  if (n === 0) return "0";
  if (!isFinite(n)) return "—";
  return n.toExponential(2);
}

function fmtFixed(n: number, decimals = 4): string {
  if (!isFinite(n)) return "—";
  return n.toFixed(decimals);
}

function QDColor(qd: number): string {
  if (qd < 1) return "#2ecc71";
  return "#e74c3c";
}

function ERIColor(eri: number): string {
  if (eri < 1e-6) return "#2ecc71";
  if (eri < 1e-5) return "#f39c12";
  return "#e74c3c";
}

function QDLabel(qd: number, t: (k: any) => string): string {
  if (qd < 1) return t("demo_acceptable");
  return t("demo_unacceptable");
}

function ERILabel(eri: number, t: (k: any) => string): string {
  if (eri < 1e-6) return t("demo_acceptable");
  if (eri < 1e-5) return t("demo_vigilance");
  return t("demo_unacceptable");
}

// ── Component ────────────────────────────────────────────────────────────────
export function DemoCalculator() {
  const { t } = useTranslation();

  const [substance, setSubstance] = useState<string>(SUBSTANCE_NAMES[0]);
  const [Csg, setCsg] = useState<string>("0");
  const [Cgw, setCgw] = useState<string>("0");
  const [LT, setLT] = useState<string>("2");
  const [result, setResult] = useState<CalcResult | null>(null);
  const [calculated, setCalculated] = useState(false);

  function handleCalculate() {
    const csgVal = parseFloat(Csg) || 0;
    const cgwVal = parseFloat(Cgw) || 0;
    const ltVal = parseFloat(LT) || 2;
    const res = calculateJE(substance, csgVal, cgwVal, ltVal);
    setResult(res);
    setCalculated(true);
  }

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-lg border border-border"
      style={{ background: "white" }}
    >
      {/* Header */}
      <div
        className="px-6 py-5 flex items-center gap-3"
        style={{
          background: "linear-gradient(135deg, #1A365D 0%, #1a5276 100%)",
        }}
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(46,204,113,0.15)", border: "1px solid rgba(46,204,113,0.35)" }}
        >
          <FlaskConical className="w-5 h-5" style={{ color: "#2ecc71" }} />
        </div>
        <div>
          <h2 className="text-base font-bold text-white leading-tight">
            {t("demo_title")}
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>
            {t("demo_subtitle")}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col md:flex-row">
        {/* ── Input panel ── */}
        <div
          className="md:w-2/5 flex-shrink-0 p-6 space-y-4 border-b md:border-b-0 md:border-r border-border"
          style={{ background: "#f8fafc" }}
        >
          {/* Substance */}
          <div>
            <label
              className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide"
              style={{ color: "#1A365D" }}
            >
              {t("demo_substance")}
            </label>
            <select
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
              style={{ focusRingColor: "#2ecc71" } as React.CSSProperties}
              value={substance}
              onChange={(e) => {
                setSubstance(e.target.value);
                setCalculated(false);
                setResult(null);
              }}
            >
              {SUBSTANCE_NAMES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Csg */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              {t("demo_soil_gas")}
            </label>
            <input
              type="number"
              min="0"
              step="any"
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2"
              value={Csg}
              onChange={(e) => setCsg(e.target.value)}
              placeholder="0"
            />
          </div>

          {/* Cgw */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              {t("demo_groundwater")}
            </label>
            <input
              type="number"
              min="0"
              step="any"
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2"
              value={Cgw}
              onChange={(e) => setCgw(e.target.value)}
              placeholder="0"
            />
          </div>

          {/* LT */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              {t("demo_distance")}
            </label>
            <input
              type="number"
              min="0.1"
              step="any"
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2"
              value={LT}
              onChange={(e) => setLT(e.target.value)}
              placeholder="2"
            />
          </div>

          {/* Calculate button */}
          <button
            onClick={handleCalculate}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-150 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #2ecc71, #27ae60)",
              boxShadow: "0 2px 8px rgba(46,204,113,0.35)",
            }}
          >
            {t("demo_calculate")}
          </button>

          {/* Locked substances teaser */}
          <div
            className="rounded-lg px-3 py-2.5 flex items-center gap-2.5"
            style={{ background: "#f0f7ff", border: "1px solid #bfdbfe" }}
          >
            <Lock className="w-4 h-4 flex-shrink-0" style={{ color: "#1A365D" }} />
            <p className="text-[11px] leading-relaxed" style={{ color: "#1A365D" }}>
              {t("demo_more_substances")}
            </p>
          </div>
        </div>

        {/* ── Results panel ── */}
        <div className="flex-1 p-6 flex flex-col">
          {!calculated ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-8">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: "#f0fdf4" }}
              >
                <FlaskConical className="w-6 h-6" style={{ color: "#2ecc71" }} />
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                {t("demo_enter_values")}
              </p>
            </div>
          ) : result && !result.isVolatile ? (
            // Non-volatile (Plomb)
            <div className="flex-1 flex flex-col items-center justify-center gap-4 py-6">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: "#fef9c3" }}
              >
                <AlertTriangle className="w-6 h-6" style={{ color: "#d97706" }} />
              </div>
              <p
                className="text-sm font-medium text-center max-w-xs"
                style={{ color: "#92400e" }}
              >
                {t("demo_non_volatile")}
              </p>
              {/* Still show ERI if applicable */}
              {substance === "Plomb" && (
                <div className="w-full mt-2">
                  <ResultRow
                    label={t("demo_eri")}
                    value="—"
                    color="#6b7280"
                    badge=""
                  />
                  <p className="text-[11px] text-muted-foreground mt-1 text-center">
                    (Voie d'exposition non applicable via inhalation de vapeurs)
                  </p>
                </div>
              )}
              {/* CTA */}
              <UpgradeBanner t={t} />
            </div>
          ) : result ? (
            // Volatile substance — show results with fade-in animation
            <div
              className="flex-1 flex flex-col gap-3"
              style={{ animation: "fadeInUp 0.35s ease both" }}
            >
              <h3 className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#1A365D" }}>
                {t("demo_results")}
              </h3>

              <div className="space-y-2 flex-1">
                <ResultRow
                  label={t("demo_alpha")}
                  value={fmtSci(result.alpha)}
                  color="#1A365D"
                  badge=""
                />
                <ResultRow
                  label={t("demo_cindoor_sg")}
                  value={`${fmtSci(result.Cindoor_sg)} µg/m³`}
                  color="#1A365D"
                  badge=""
                />
                <ResultRow
                  label={t("demo_cindoor_gw")}
                  value={`${fmtSci(result.Cindoor_gw)} µg/m³`}
                  color="#1A365D"
                  badge=""
                />

                {/* QD */}
                <div
                  className="rounded-lg p-3 flex items-center justify-between"
                  style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
                >
                  <span className="text-xs font-medium text-foreground">{t("demo_qd")}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-bold tabular-nums"
                      style={{ color: QDColor(result.QD_inhal) }}
                    >
                      {fmtFixed(result.QD_inhal, 3)}
                    </span>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                      style={{ background: QDColor(result.QD_inhal) }}
                    >
                      {QDLabel(result.QD_inhal, t)}
                    </span>
                  </div>
                </div>

                {/* ERI */}
                <div
                  className="rounded-lg p-3 flex items-center justify-between"
                  style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
                >
                  <span className="text-xs font-medium text-foreground">{t("demo_eri")}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-bold tabular-nums"
                      style={{ color: ERIColor(result.ERI_inhal) }}
                    >
                      {fmtSci(result.ERI_inhal)}
                    </span>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                      style={{ background: ERIColor(result.ERI_inhal) }}
                    >
                      {ERILabel(result.ERI_inhal, t)}
                    </span>
                  </div>
                </div>
              </div>

              {/* CTA banner */}
              <UpgradeBanner t={t} />
            </div>
          ) : null}
        </div>
      </div>

      {/* Fade-in keyframe injection */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function ResultRow({
  label,
  value,
  color,
  badge,
}: {
  label: string;
  value: string;
  color: string;
  badge: string;
}) {
  return (
    <div
      className="rounded-lg px-3 py-2.5 flex items-center justify-between"
      style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
    >
      <span className="text-xs font-medium text-foreground">{label}</span>
      <span className="text-sm font-semibold tabular-nums" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

function UpgradeBanner({ t }: { t: (k: any) => string }) {
  return (
    <a
      href="#/register"
      className="mt-2 flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-150 hover:opacity-90 group"
      style={{
        background: "linear-gradient(135deg, #1A365D 0%, #1a5276 100%)",
        textDecoration: "none",
      }}
    >
      <span className="text-xs font-semibold text-white leading-snug">
        {t("demo_upgrade")} →
      </span>
      <ChevronRight
        className="w-4 h-4 flex-shrink-0 text-white group-hover:translate-x-0.5 transition-transform"
      />
    </a>
  );
}
