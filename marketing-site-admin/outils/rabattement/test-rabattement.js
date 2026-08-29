#!/usr/bin/env node
/* ════════════════════════════════════════════════════════════════════════════
   Test offline (Node) — bug Rabattement : plage Q recommandée vide / nulle
   Cas validé sur tableur GMEP v15.60 :
     NS = 1,70 m / TN ; FF = 2,80 m / TN  → s = 1,10 m
     Diamètre intérieur = 112 mm (r = 0,056 m)
     R = 10 m ; t_pompage = 24 h
     T = 1e-6 m²/s ; S = 0,05
     V_journalier_retenu / plancher = 20,547945 m³/j
     t_exploit = 24 h/j
   Attendus :
     Q base recommandée ≈ 0,856164 m³/h
     Q_min ≈ 0,727740 m³/h ;  Q_max ≈ 0,984589 m³/h
   ════════════════════════════════════════════════════════════════════════════ */

const { calculer, BASE_GEO } = require("./calculs.js");

// Substrat synthétique pour faire correspondre exactement T=1e-6, S=0,05 demandés
BASE_GEO["__TEST_NAPPE__"] = {
  famille: "Test", type: "Libre",
  K: 1e-7, T: 1e-6,
  Sc: 0.05, Sl: 0.05, ne: 0.05, ep: 10
};

const params = {
  substrat: "__TEST_NAPPE__",
  dept: "79",
  zre: "non",
  ns: 1.7,
  ff: 2.8,
  diam_int: 0.112,
  rayon_inf: 10,
  t_pompage: 24,
  t_exp: 24,
  V_jour_retenu: 20.547945,
  Q_cycle: 0
};

const r = calculer(params);

const EXPECTED_BASE  = 0.856164;
const EXPECTED_QMIN  = 0.727740;
const EXPECTED_QMAX  = 0.984589;
const TOL = 1e-4;

function fmt(x) { return (x == null || !isFinite(x)) ? "—" : x.toFixed(6); }
function approx(a, b, tol) { return Math.abs(a - b) <= tol; }

console.log("── Cas test Rabattement — bug plage Q nulle (correctif v15.61.1) ──");
console.log("");
console.log("Paramètres : NS=1.7, FF=2.8, r=0.056 m, R=10 m, t=24 h,");
console.log("             T=1e-6 m²/s, S=0.05, V_journalier_retenu=20.547945 m³/j, t_exp=24 h.");
console.log("");
console.log(" Rabattement s         :", fmt(r.s), "m   (attendu 1.100000)");
console.log(" Q Theis (brut)        :", fmt(r.Q_theis),         "m³/h");
console.log(" Q Theis corrigé       :", fmt(r.Q_theis_corr),    "m³/h");
console.log(" Q Dupuit (brut)       :", fmt(r.Q_dupuit),        "m³/h");
console.log(" Q Dupuit corrigé      :", fmt(r.Q_dupuit_corr),   "m³/h");
console.log(" Q plancher (V/t_exp)  :", fmt(r.Q_floor),         "m³/h  (attendu 0.856164)");
console.log(" Q cycle pompe         :", fmt(r.Q_cycle),         "m³/h");
console.log(" Q BASE recommandée    :", fmt(r.Q_base),          "m³/h  (attendu " + EXPECTED_BASE.toFixed(6) + ")");
console.log(" Q_min (base * 0,85)   :", fmt(r.Q_min),           "m³/h  (attendu " + EXPECTED_QMIN.toFixed(6) + ")");
console.log(" Q_max (base * 1,15)   :", fmt(r.Q_max),           "m³/h  (attendu " + EXPECTED_QMAX.toFixed(6) + ")");
console.log(" V journalier          :", fmt(r.V_jour),          "m³/j  (attendu 20.547945)");
console.log("");

const checks = [
  ["Q_base ~ 0.856164",  approx(r.Q_base,  EXPECTED_BASE, TOL)],
  ["Q_min  ~ 0.727740",  approx(r.Q_min,   EXPECTED_QMIN, TOL)],
  ["Q_max  ~ 0.984589",  approx(r.Q_max,   EXPECTED_QMAX, TOL)],
  ["Q_base != 0",        r.Q_base > 0],
  ["V_jour ~ 20.547945", approx(r.V_jour,  20.547945,     1e-4)],
  ["s = 1.10",           approx(r.s,       1.10,          1e-9)]
];
let allPass = true;
checks.forEach(([label, ok]) => {
  console.log(" " + (ok ? "✓" : "✗") + "  " + label);
  if (!ok) allPass = false;
});

// Second test : sans plancher → on doit retomber sur l'ancien comportement (Theis/Dupuit seuls)
console.log("");
console.log("── Régression : sans plancher renseigné, ancien comportement préservé ──");
const r2 = calculer({ ...params, V_jour_retenu: 0, Q_cycle: 0 });
const oldBase = Math.max(r2.Q_theis_corr, r2.Q_dupuit_corr);
const okReg = approx(r2.Q_base, oldBase, 1e-9);
console.log(" Q_base (sans plancher):", fmt(r2.Q_base), " | max(Theis, Dupuit):", fmt(oldBase));
console.log(" " + (okReg ? "✓" : "✗") + "  Q_base == max(Q_theis_corr, Q_dupuit_corr)");
if (!okReg) allPass = false;

console.log("");
if (allPass) {
  console.log("RÉSULTAT : ✓ TOUS LES TESTS PASSENT — correctif validé.");
  process.exit(0);
} else {
  console.log("RÉSULTAT : ✗ ÉCHEC — un ou plusieurs tests ont échoué.");
  process.exit(1);
}
