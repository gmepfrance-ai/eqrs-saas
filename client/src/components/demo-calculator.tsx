import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { ChevronRight, Lock, FlaskConical, AlertTriangle, Settings2 } from "lucide-react";

// ── Substance data ──────────────────────────────────────────────────────────
const DEMO_SUBSTANCES: Record<
  string,
  {
    Da: number;
    Dw: number;
    H: number;           // Henry dimensionless (H')
    VTR_inhal: number;   // mg/m³ (seuil)
    ERU_inhal: number;   // (µg/m³)⁻¹ (sans seuil)
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

// ── Default building/soil parameters (same as full model BAT_DEFAULTS) ──────
const DEFAULTS = {
  LB: 10,           // Longueur bâtiment (m)
  WB: 10,           // Largeur bâtiment (m)
  HB: 2.5,          // Hauteur sous plafond (m)
  ER: 0.45,         // Taux de renouvellement d'air (h⁻¹)
  Lcrack: 0.15,     // Épaisseur du dallage (m)
  eta: 0.0002,      // Fraction de fissure
  Zcrack: 0.15,     // Profondeur fissure (m)
  n: 0.35,          // Porosité totale du sol
  theta_w: 0.15,    // Teneur en eau volumique
  kv: 1e-12,        // Perméabilité du sol (m²)
  dP: 4,            // Dépression du bâtiment (Pa)
  mu: 1.81e-5,      // Viscosité dynamique de l'air (Pa·s)
  LT: 2,            // Distance source-dalle (m)
};

// ── Exposure parameters (adulte, same as full model) ────────────────────────
const EXPOSURE = {
  P: 70,             // Poids corporel (kg)
  ED: 30,            // Durée d'exposition (ans)
  EF: 350,           // Fréquence d'exposition (j/an)
  AT_seuil: 30,      // Période de moyennage seuil (ans) = ED
  AT_sansseuil: 70,  // Période de moyennage sans seuil (ans) = vie entière
  Fi: 0.8,           // Fraction de temps à l'intérieur
};

// ── J&E calculation (aligned with full model) ───────────────────────────────
interface CalcResult {
  alpha: number;
  alpha_eff: number;
  Qbuilding: number;
  Cindoor_sg: number;
  Cindoor_gw: number;
  Cindoor_JE: number;
  CI_seuil: number;
  CI_sansseuil: number;
  QD_inhal: number;
  ERI_inhal: number;
  isVolatile: boolean;
}

function calculateJE(
  substanceName: string,
  Csg: number,   // µg/m³ sol-gaz
  Cgw: number,   // µg/L eaux souterraines
  LT: number,    // distance source-dalle (m)
  Lcrack: number, // épaisseur dallage (m)
  n: number,      // porosité totale
  theta_w: number // teneur en eau volumique
): CalcResult {
  const substance = DEMO_SUBSTANCES[substanceName];

  if (!substance.volatile) {
    return {
      alpha: 0, alpha_eff: 0, Qbuilding: 0,
      Cindoor_sg: 0, Cindoor_gw: 0, Cindoor_JE: 0,
      CI_seuil: 0, CI_sansseuil: 0,
      QD_inhal: 0, ERI_inhal: 0, isVolatile: false,
    };
  }

  const { Da, Dw, H, VTR_inhal, ERU_inhal } = substance;

  // Building params
  const { LB, WB, HB, ER, eta, kv, dP, mu } = DEFAULTS;
  // Zcrack (profondeur fissure pour Qsoil) est un paramètre SÉPARÉ de Lcrack (épaisseur dalle)
  // Dans le modèle J&E, Zcrack est la profondeur sous la dalle où les fissures se forment
  // Lcrack est l'épaisseur de la dalle (barrière diffusive)
  // On garde Zcrack fixe à la valeur par défaut du modèle complet
  const Zcrack = DEFAULTS.Lcrack; // 0.15 m (profondeur fissure, fixe)

  // Derived building values
  const AB = LB * WB;
  const Qbuilding = (LB * WB * HB * ER) / 3600;
  const Acrack = eta * AB;
  const Xcrack = 2 * (LB + WB);
  const rcrack = Xcrack > 0 ? (eta * AB) / Xcrack : 0;

  // Porosité à l'air = porosité totale - teneur en eau
  const theta_a = Math.max(n - theta_w, 0.01);

  // Step 1: Effective diffusion (Millington-Quirk)
  let Deff = 0;
  if (n > 0 && H > 0) {
    Deff =
      (Da * Math.pow(theta_a, 10 / 3)) / (n * n) +
      (Dw * Math.pow(theta_w, 10 / 3)) / (n * n) / H;
  }
  const Deff_crack = Deff;

  // Step 2: Qsoil (Nazaroff)
  let Qsoil = 0;
  if (rcrack > 0 && Zcrack > 0 && mu > 0) {
    const ln_arg = (2 * Zcrack) / rcrack;
    Qsoil = ln_arg > 0
      ? (2 * Math.PI * kv * dP * Zcrack) / (mu * Math.log(ln_arg))
      : 0;
  }

  // Step 3: Péclet numbers
  let Pe_sol = 0;
  let Pe_crack = 0;
  let A_param = 0;

  // Quand LT ≤ 0 (source directement sous la dalle), on impose LT_min = 0.001 m
  // pour éviter la division par zéro. Physiquement : plus de résistance du sol,
  // seule la dalle atténue → α élevé (proche de 1).
  const LT_eff = Math.max(LT, 0.001);

  if (Qbuilding > 0 && Deff > 0 && AB > 0) {
    A_param = (Deff * AB) / (Qbuilding * LT_eff);
    Pe_sol = (Qsoil * LT_eff) / (Deff * AB);
  }

  if (Deff_crack > 0 && Acrack > 0) {
    Pe_crack = (Qsoil * Lcrack) / (Deff_crack * Acrack);
  }

  // Step 4: Alpha (attenuation factor)
  const expPeSol = Math.exp(Pe_sol);
  const expPeCrack = Math.exp(Pe_crack);
  const numerator = A_param * expPeSol * Pe_crack;
  const denominator = (expPeCrack - 1) + A_param * expPeSol * Pe_crack;
  const alpha = denominator !== 0 ? numerator / denominator : 0;

  // No lateral dilution in demo (LH = 0 → delta = 1)
  const delta = 1;
  const alpha_eff = alpha * delta;

  // Step 5: Indoor concentrations (same as full model)
  // Sol-gaz: Cindoor = α_eff × Csg
  const Cindoor_sg = isFinite(alpha_eff) ? alpha_eff * Csg : 0;
  // Nappe: Cindoor = α_eff × H' × Ceau × 1000  (µg/L → µg/m³)
  const Cindoor_gw = isFinite(alpha_eff) ? alpha_eff * H * Cgw * 1000 : 0;

  // J&E uses MAX of the two contributions (same as full model: CairJE = max(ci.solGaz, ci.nappe))
  const Cindoor_JE = Math.max(Cindoor_sg, Cindoor_gw);

  // Step 6: Concentration d'inhalation (CI) — same as full model
  // CI = CairJE × Fi × (EF/365) × (ED/AT)
  const { Fi, EF, ED, AT_seuil, AT_sansseuil } = EXPOSURE;
  const CI_seuil = Cindoor_JE * Fi * (EF / 365) * (ED / AT_seuil);       // µg/m³
  const CI_sansseuil = Cindoor_JE * Fi * (EF / 365) * (ED / AT_sansseuil); // µg/m³

  // Step 7: QD Inhalation (Quotient de Danger) — seuil
  // QD = (CI / 1000) / VTR   (CI µg/m³ → mg/m³, VTR en mg/m³)
  const QD_inhal = VTR_inhal > 0 ? (CI_seuil / 1000) / VTR_inhal : 0;

  // Step 8: ERI Inhalation (Excès de Risque Individuel) — sans seuil
  // ERI = CI_sansseuil × ERU_inhal   (CI en µg/m³, ERU en (µg/m³)⁻¹)
  const ERI_inhal = ERU_inhal > 0 ? CI_sansseuil * ERU_inhal : 0;

  return {
    alpha: isFinite(alpha) ? alpha : 0,
    alpha_eff: isFinite(alpha_eff) ? alpha_eff : 0,
    Qbuilding,
    Cindoor_sg,
    Cindoor_gw,
    Cindoor_JE,
    CI_seuil,
    CI_sansseuil,
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
  const [LT, setLT] = useState<string>(String(DEFAULTS.LT));
  const [Lcrack, setLcrack] = useState<string>(String(DEFAULTS.Lcrack));
  const [porosity, setPorosity] = useState<string>(String(DEFAULTS.n));
  const [thetaW, setThetaW] = useState<string>(String(DEFAULTS.theta_w));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<CalcResult | null>(null);
  const [calculated, setCalculated] = useState(false);

  function handleCalculate() {
    const csgVal = parseFloat(Csg) || 0;
    const cgwVal = parseFloat(Cgw) || 0;
    const ltVal = parseFloat(LT) || DEFAULTS.LT;
    const lcrackVal = parseFloat(Lcrack) || DEFAULTS.Lcrack;
    const nVal = parseFloat(porosity) || DEFAULTS.n;
    const twVal = parseFloat(thetaW) || DEFAULTS.theta_w;
    const res = calculateJE(substance, csgVal, cgwVal, ltVal, lcrackVal, nVal, twVal);
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
              min="0"
              step="any"
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2"
              value={LT}
              onChange={(e) => setLT(e.target.value)}
              placeholder="2"
            />
          </div>

          {/* Épaisseur dallage */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              {t("demo_slab_thickness")}
            </label>
            <input
              type="number"
              min="0.01"
              step="any"
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2"
              value={Lcrack}
              onChange={(e) => setLcrack(e.target.value)}
              placeholder="0.15"
            />
          </div>

          {/* Toggle advanced parameters */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs font-medium transition-colors"
            style={{ color: "#1A365D" }}
          >
            <Settings2 className="w-3.5 h-3.5" />
            {t("demo_advanced_params")}
            <span className="ml-0.5">{showAdvanced ? "▲" : "▼"}</span>
          </button>

          {showAdvanced && (
            <div className="space-y-3 pl-2 border-l-2" style={{ borderColor: "#cbd5e1" }}>
              {/* Porosité totale */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  {t("demo_porosity")}
                </label>
                <input
                  type="number"
                  min="0.01"
                  max="0.99"
                  step="0.01"
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2"
                  value={porosity}
                  onChange={(e) => setPorosity(e.target.value)}
                  placeholder="0.35"
                />
              </div>

              {/* Teneur en eau */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  {t("demo_water_content")}
                </label>
                <input
                  type="number"
                  min="0.01"
                  max="0.99"
                  step="0.01"
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2"
                  value={thetaW}
                  onChange={(e) => setThetaW(e.target.value)}
                  placeholder="0.15"
                />
              </div>
            </div>
          )}

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
              <UpgradeBanner t={t} />
            </div>
          ) : result ? (
            // Volatile substance — show results
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
                  value={fmtSci(result.alpha_eff)}
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
