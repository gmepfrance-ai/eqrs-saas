// Test offline de la régression "Pompe recommandée = 0,00 m³/h" sur le tool Rabattement.
// On reproduit ici la fonction `calculer(p)` extraite de rabattement-tool.html
// et on vérifie que pour le cas-test fourni (NS=1.7, FF=2.8, diam_int=112 mm,
// R=10, t_pompage=24 h, T=1e-6, S=0.05, t_exp=24, V_jour_retenu=20.547945),
// la base du débit pompé est ≈ 0.856164 m³/h avec une plage ≈ 0.727740 – 0.984589.
//
// Lancement : node scripts/test_rabattement_pump.cjs

"use strict";

const path = require("path");
const fs = require("fs");

// Substrat « cas-test » avec T=1e-6 m²/s, S=0.05 (nappe libre)
const BASE_GEO_TEST = { type: "Libre", T: 1e-6, Sc: 1e-4, Sl: 0.05, K: 1e-7 };
const CLIM_TEST     = { dept: "Test", station: "Test", P: 700, ETP: 700, R: 150 };

function wellFunction(u) {
  if (u <= 0) return 0;
  if (u > 5) {
    return Math.exp(-u) / u * (1 - 1/u + 2/(u*u) - 6/(u*u*u));
  }
  return -0.5772156649 - Math.log(u) - u
       + (u*u)/4 - (u*u*u)/18 + Math.pow(u,4)/96
       - Math.pow(u,5)/600 + Math.pow(u,6)/4320
       - Math.pow(u,7)/35280 + Math.pow(u,8)/322560;
}

function calculer(p) {
  const geo = BASE_GEO_TEST;
  const clim = CLIM_TEST;

  const ns = p.ns;
  const ff = p.ff;
  const r_puits = p.diam_int / 2;
  const R = p.rayon_inf;
  const t_h = p.t_pompage;
  const t_s = t_h * 3600;
  const T = geo.T;
  const S = (geo.type === "Captive") ? geo.Sc : geo.Sl;

  const s = Math.max(0, ff - ns);

  const u = (r_puits * r_puits * S) / (4 * T * t_s);
  const Wu = wellFunction(u);

  const Q_theis_si  = (s > 0 && Wu > 0 && T > 0) ? (4 * Math.PI * T * s) / Wu : 0;
  const Q_theis     = Q_theis_si * 3600;

  const Q_dupuit_si = (s > 0 && R > r_puits && T > 0) ? (2 * Math.PI * T * s) / Math.log(R / r_puits) : 0;
  const Q_dupuit    = Q_dupuit_si * 3600;

  const eta = 0.7;
  const Q_theis_corr  = Q_theis  * eta;
  const Q_dupuit_corr = Q_dupuit * eta;

  const t_exp = p.t_exp || 24;
  const V_jour_retenu = (p.v_jour_retenu && isFinite(p.v_jour_retenu) && p.v_jour_retenu > 0) ? p.v_jour_retenu : 0;
  const Q_plancher    = (V_jour_retenu > 0 && t_exp > 0) ? (V_jour_retenu / t_exp) : 0;
  const Q_cycle       = (p.q_cycle && isFinite(p.q_cycle) && p.q_cycle > 0) ? p.q_cycle : 0;

  const Q_base = Math.max(Q_theis_corr, Q_dupuit_corr, Q_cycle, Q_plancher);
  const Q_min  = Q_base * 0.85;
  const Q_max  = Q_base * 1.15;

  const V_jour_hydro = Q_theis_corr * t_exp;
  const V_jour = Math.max(V_jour_hydro, V_jour_retenu);

  return { s, u, Wu, Q_theis, Q_dupuit, Q_theis_corr, Q_dupuit_corr,
           Q_cycle, Q_plancher, Q_base, Q_min, Q_max, V_jour };
}

// Vérifie aussi que les sources HTML ont bien été patchées en cohérence
function assertSourcePatched() {
  const src = fs.readFileSync(path.join(__dirname, "..", "rabattement-tool.html"), "utf8");
  const checks = [
    ["Math.max(Q_theis_corr, Q_dupuit_corr, Q_cycle, Q_plancher)",
     "formule Q_base attendue dans calculer()"],
    ["inp-v-jour-retenu", "champ formulaire « plancher journalier »"],
    ["inp-q-cycle",       "champ formulaire « Q_cycle »"],
    ["Q_cycle, Q_plancher, Q_base, V_jour_retenu", "exposition dans return calculer()"],
    ["Q recommandé (base pompe)", "rendu HTML résultat — base pompe"],
    ["r.Q_base", "PDF — qNom basé sur Q_base"]
  ];
  for (const [needle, label] of checks) {
    if (!src.includes(needle)) {
      throw new Error(`Patch manquant: ${label} (chaîne « ${needle} » introuvable)`);
    }
  }
}

function approx(a, b, eps) { return Math.abs(a - b) <= eps; }

function run() {
  assertSourcePatched();

  // Cas-test issu du tableur de validation
  const r = calculer({
    ns: 1.7, ff: 2.8,
    diam_int: 0.112,
    rayon_inf: 10,
    t_pompage: 24,
    t_exp: 24,
    v_jour_retenu: 20.547945,
    q_cycle: 0
  });

  const expected = { Q_base: 0.856164, Q_min: 0.727740, Q_max: 0.984589 };
  const eps = 1e-4;

  const lines = [
    `s            = ${r.s.toFixed(6)} m`,
    `u            = ${r.u.toExponential(6)}`,
    `W(u)         = ${r.Wu.toFixed(6)}`,
    `Q_theis_corr = ${r.Q_theis_corr.toFixed(6)} m³/h`,
    `Q_dupuit_corr= ${r.Q_dupuit_corr.toFixed(6)} m³/h`,
    `Q_plancher   = ${r.Q_plancher.toFixed(6)} m³/h`,
    `Q_base       = ${r.Q_base.toFixed(6)} m³/h  (attendu ${expected.Q_base.toFixed(6)})`,
    `Q_min        = ${r.Q_min.toFixed(6)} m³/h  (attendu ${expected.Q_min.toFixed(6)})`,
    `Q_max        = ${r.Q_max.toFixed(6)} m³/h  (attendu ${expected.Q_max.toFixed(6)})`
  ];
  for (const l of lines) console.log(l);

  const ok =
    approx(r.Q_base, expected.Q_base, eps) &&
    approx(r.Q_min,  expected.Q_min,  eps) &&
    approx(r.Q_max,  expected.Q_max,  eps) &&
    r.Q_base > 0.5;

  // Cas dégénéré : sans plancher, on retombait sur ~0 (bug d'origine).
  const rNoFloor = calculer({
    ns: 1.7, ff: 2.8, diam_int: 0.112, rayon_inf: 10,
    t_pompage: 24, t_exp: 24
  });
  console.log(`\nContre-test (sans plancher) — Q_base = ${rNoFloor.Q_base.toFixed(6)} m³/h`);
  console.log(`   (valeur faible attendue : reproduit le comportement nominal sans plancher)`);

  if (!ok) {
    console.error("\n❌ Test ÉCHEC — la base pompe ne correspond pas à la valeur attendue.");
    process.exit(1);
  }
  console.log("\n✅ Test OK — base pompe et bornes ±15 % conformes au tableur de validation.");
}

run();
