/* ════════════════════════════════════════════════════════════
   GMEP — Moteur de calcul Rabattement (Theis + Dupuit-Thiem)
   Reproduit la logique du tableur v15.60
   ════════════════════════════════════════════════════════════ */

// ─── Base géologique (extrait du tableur 'Base Géologique') ───
// Format : nom → { famille, type_nappe, K (m/s), T (m²/s), S_captif, S_libre, ne, epaisseur (m) }
const BASE_GEO = {
  "Calcaire karstifié":           { famille: "Carbonatée",  type: "Libre",   K: 1e-3,  T: 5e-2,  Sc: 1e-4, Sl: 0.05, ne: 0.05, ep: 30 },
  "Calcaire fissuré":             { famille: "Carbonatée",  type: "Libre",   K: 5e-5,  T: 1e-3,  Sc: 1e-4, Sl: 0.03, ne: 0.03, ep: 25 },
  "Craie":                        { famille: "Carbonatée",  type: "Libre",   K: 1e-4,  T: 3e-3,  Sc: 1e-4, Sl: 0.02, ne: 0.02, ep: 40 },
  "Sables et graviers (alluvions)":{ famille: "Détritique", type: "Libre",   K: 5e-4,  T: 2e-2,  Sc: 1e-4, Sl: 0.15, ne: 0.18, ep: 15 },
  "Sables fins":                  { famille: "Détritique",  type: "Libre",   K: 1e-5,  T: 3e-4,  Sc: 1e-4, Sl: 0.10, ne: 0.12, ep: 10 },
  "Grès":                         { famille: "Détritique",  type: "Captive", K: 1e-6,  T: 2e-5,  Sc: 5e-5, Sl: 0.05, ne: 0.05, ep: 50 },
  "Argiles":                      { famille: "Imperméable", type: "Aucune",  K: 1e-9,  T: 3e-8,  Sc: 1e-5, Sl: 0.01, ne: 0.01, ep: 20 },
  "Marnes":                       { famille: "Semi-perméable",type:"Captive",K: 1e-8,  T: 3e-7,  Sc: 1e-5, Sl: 0.02, ne: 0.02, ep: 25 },
  "Granite altéré":               { famille: "Cristalline", type: "Libre",   K: 1e-5,  T: 3e-4,  Sc: 1e-4, Sl: 0.02, ne: 0.02, ep: 20 },
  "Granite fissuré":              { famille: "Cristalline", type: "Libre",   K: 1e-6,  T: 3e-5,  Sc: 5e-5, Sl: 0.005,ne: 0.005,ep: 30 },
  "Schistes":                     { famille: "Cristalline", type: "Captive", K: 1e-7,  T: 3e-6,  Sc: 1e-5, Sl: 0.01, ne: 0.01, ep: 25 },
  "Basalte":                      { famille: "Volcanique",  type: "Libre",   K: 5e-5,  T: 1.5e-3,Sc: 1e-4, Sl: 0.05, ne: 0.05, ep: 30 },
  "Remblais"                    : { famille: "Anthropique", type: "Libre",   K: 1e-4,  T: 3e-3,  Sc: 1e-4, Sl: 0.10, ne: 0.12, ep: 5  }
};

// ─── Climat par département (extrait Climat.csv tableur) ───
const CLIMAT = {
  "41": { dept: "Loir-et-Cher",    station: "Blois",         P: 641, ETP: 720, R: 150 },
  "79": { dept: "Deux-Sèvres",     station: "Niort",         P: 815, ETP: 770, R: 180 },
  "75": { dept: "Paris",           station: "Paris-Montsouris",P: 637, ETP: 760, R: 110 },
  "33": { dept: "Gironde",         station: "Bordeaux-Mérignac",P: 950,ETP: 820, R: 220 },
  "13": { dept: "Bouches-du-Rhône",station: "Marseille",     P: 540, ETP: 1100,R: 80  },
  "59": { dept: "Nord",            station: "Lille",         P: 740, ETP: 660, R: 250 },
  "69": { dept: "Rhône",           station: "Lyon-Bron",     P: 830, ETP: 820, R: 170 },
  "44": { dept: "Loire-Atlantique",station: "Nantes",        P: 820, ETP: 760, R: 200 },
  "31": { dept: "Haute-Garonne",   station: "Toulouse-Blagnac",P: 630,ETP: 950, R: 90  },
  "06": { dept: "Alpes-Maritimes", station: "Nice",          P: 770, ETP: 1050,R: 110 },
  "67": { dept: "Bas-Rhin",        station: "Strasbourg",    P: 670, ETP: 720, R: 140 },
  "35": { dept: "Ille-et-Vilaine", station: "Rennes",        P: 700, ETP: 720, R: 180 },
  "76": { dept: "Seine-Maritime",  station: "Rouen",         P: 800, ETP: 690, R: 230 },
  "57": { dept: "Moselle",         station: "Metz",          P: 730, ETP: 720, R: 170 },
  "63": { dept: "Puy-de-Dôme",     station: "Clermont-Ferrand",P: 580,ETP: 770, R: 100 }
};

// ─── Fonction de puits W(u) de Theis — série de Taylor (Excel-compatible) ───
function wellFunction(u) {
  if (u <= 0) return 0;
  if (u > 5) {
    // Asymptote pour u grand : W(u) ≈ e^-u / u × (1 - 1/u + 2/u² - 6/u³)
    return Math.exp(-u) / u * (1 - 1/u + 2/(u*u) - 6/(u*u*u));
  }
  // Série pour u petit (la même que dans le tableur)
  return -0.5772156649 - Math.log(u) - u
       + (u*u)/4 - (u*u*u)/18 + Math.pow(u,4)/96
       - Math.pow(u,5)/600 + Math.pow(u,6)/4320
       - Math.pow(u,7)/35280 + Math.pow(u,8)/322560;
}

// ─── Calcul principal ───
function calculer(p) {
  // p = paramètres saisis par l'utilisateur
  const geo = BASE_GEO[p.substrat] || BASE_GEO["Calcaire karstifié"];
  const clim = CLIMAT[p.dept] || CLIMAT["41"];

  // Paramètres de base
  const ns = p.ns;                          // niveau statique
  const ff = p.ff;                          // fond de fouille (ou NDC pour AEP)
  const r_puits = p.diam_int / 2;           // rayon puits
  const R = p.rayon_inf;                    // rayon d'influence
  const t_h = p.t_pompage;                  // temps pompage en h
  const t_s = t_h * 3600;                   // en secondes
  const T = geo.T;                          // transmissivité (m²/s)
  const S = (geo.type === "Captive") ? geo.Sc : geo.Sl;

  // Rabattement requis
  const s = Math.max(0, ff - ns);

  // Theis : u = r²·S / (4·T·t)
  const u = (r_puits * r_puits * S) / (4 * T * t_s);
  const Wu = wellFunction(u);

  // Q Theis (m³/s) = 4π T s / W(u)
  const Q_theis_si = (s > 0 && Wu > 0 && T > 0) ? (4 * Math.PI * T * s) / Wu : 0;
  const Q_theis = Q_theis_si * 3600;        // m³/h

  // Q Dupuit-Thiem (régime permanent) = 2π T s / ln(R/r)
  const Q_dupuit_si = (s > 0 && R > r_puits && T > 0) ? (2 * Math.PI * T * s) / Math.log(R / r_puits) : 0;
  const Q_dupuit = Q_dupuit_si * 3600;      // m³/h

  // Corrections
  const eta = 0.7;                          // rendement hydraulique
  const f_K = 0.95;                         // correction perméabilité
  const Q_theis_corr = Q_theis * eta;
  const Q_dupuit_corr = Q_dupuit * eta;

  // ─── Plancher opérationnel ──────────────────────────────────────────────
  // Le débit de Theis/Dupuit peut être très faible dans les nappes de faible
  // transmissivité — en pratique le pompage est dimensionné sur le volume
  // journalier retenu (plancher hydraulique) divisé par les heures d'exploit.,
  // éventuellement aussi sur le débit de cycle de la pompe si renseigné.
  // Référence : feuille de calcul GMEP v15.60 (validation tableur).
  const t_exp = p.t_exp || 24;              // heures/j
  // V_jour_retenu : plancher journalier saisi par l'utilisateur (m³/j)
  const V_jour_retenu_in = (p.V_jour_retenu != null && !isNaN(p.V_jour_retenu) && p.V_jour_retenu > 0)
    ? p.V_jour_retenu : 0;
  // Q_cycle : débit imposé par le cycle de pompe si déjà fixé (m³/h)
  const Q_cycle = (p.Q_cycle != null && !isNaN(p.Q_cycle) && p.Q_cycle > 0) ? p.Q_cycle : 0;
  const Q_floor = (V_jour_retenu_in > 0 && t_exp > 0) ? (V_jour_retenu_in / t_exp) : 0;

  // Base de dimensionnement de la pompe = max(Theis corr, Dupuit corr, Q_cycle, V/t)
  // ─ correction du bug v15.61 : auparavant seuls Theis & Dupuit étaient considérés,
  //   ce qui pouvait renvoyer 0,00 m³/h dans des nappes peu productives, en contradiction
  //   avec le volume journalier réellement retenu (plancher opérationnel).
  const Q_base = Math.max(Q_theis_corr, Q_dupuit_corr, Q_cycle, Q_floor);

  // Débits recommandés ± 15 %
  const Q_min = Q_base * 0.85;
  const Q_max = Q_base * 1.15;

  // Volumes — si plancher journalier retenu, il prend le pas (cohérence
  // avec le débit recommandé qui s'en déduit) ; sinon Q_theis_corr × t_exp.
  const V_jour = Q_floor > 0 ? V_jour_retenu_in : Q_theis_corr * t_exp;
  const V_mois = V_jour * 30;
  const V_an = V_jour * 365;

  // Bilan hydrique
  const P_eff = Math.max(clim.P - clim.ETP, 0);
  const R_eff = clim.R * f_K;
  const surface_inf = Math.PI * R * R;
  const V_recharge = surface_inf * R_eff / 1000;
  const ratio = V_an > 0 && V_recharge > 0 ? V_an / V_recharge : 0;

  // ─── Statut ZRE (Zone de Répartition des Eaux) ───
  // p.zre : "oui" (commune classée ZRE), "non" (hors ZRE), ou "auto" (déduit par département présomptif)
  const ZRE_DEPTS_PRESUMPTIVE = ["41","45","28","18","36","37","86","79","17"];  // ZRE Beauce + sous-bassins Loire-Bretagne
  let zre_applicable;  // true / false / null (indéterminé)
  if (p.zre === "oui")      zre_applicable = true;
  else if (p.zre === "non") zre_applicable = false;
  else                       zre_applicable = ZRE_DEPTS_PRESUMPTIVE.includes(p.dept) ? null : false;  // null = présomption à confirmer

  // En ZRE : seuils abaissés — autorisation à partir de 8 m³/h, déclaration en deçà
  // Statut 1.3.1.0 : si Q ≥ 8 m³/h ET commune en ZRE → AUTORISATION ; sinon Déclaration (en ZRE) ou Non applicable
  let zre_regime;
  if (zre_applicable === true) {
    zre_regime = Q_theis_corr >= 8 ? "AUTORISATION" : "DÉCLARATION";
  } else if (zre_applicable === false) {
    zre_regime = "Non applicable";
  } else {
    zre_regime = Q_theis_corr >= 8 ? "À VÉRIFIER" : "Non applicable";  // présomption mais Q dépasse seuil
  }

  // Classification IOTA — régime le plus contraignant (cumulatif)
  let iota_status, iota_type;
  if (s <= 0) {
    iota_status = "HORS NOMENCLATURE";
    iota_type = "hors";
  } else if (V_an < 10000 && Q_theis_corr < 8) {
    iota_status = "HORS NOMENCLATURE";
    iota_type = "hors";
  } else if (V_an < 200000) {
    iota_status = "DÉCLARATION";
    iota_type = "declaration";
  } else {
    iota_status = "AUTORISATION";
    iota_type = "autorisation";
  }

  // Override ZRE : si ZRE OUI confirmé et Q ≥ 8 m³/h → AUTORISATION (règle 1.3.1.0 plus contraignante)
  if (zre_applicable === true && Q_theis_corr >= 8) {
    iota_status = "AUTORISATION";
    iota_type = "autorisation";
  }

  // Tableau IOTA détaillé
  const iota_table = [
    {
      code: "1.1.1.0",
      libelle: "Prélèvement permanent ou temporaire en eaux souterraines",
      seuil: "10 000 m³/an",
      statut: V_an >= 200000 ? "AUTORISATION" : (V_an >= 10000 ? "DÉCLARATION" : "Non applicable"),
      class_st: V_an >= 200000 ? "st-autor" : (V_an >= 10000 ? "st-declar" : "st-ok")
    },
    {
      code: "1.1.2.0",
      libelle: "Prélèvement supérieur à 10 % du QMNA5",
      seuil: "8 m³/h",
      statut: Q_theis_corr >= 8 ? "VIGILANCE" : "Non applicable",
      class_st: Q_theis_corr >= 8 ? "st-warn" : "st-ok"
    },
    {
      code: "1.3.1.0",
      libelle: "Prélèvement en Zone de Répartition des Eaux (ZRE)",
      seuil: "8 m³/h",
      statut: (Q_theis_corr >= 8 && ["41","45","28","18","36"].includes(p.dept)) ? "VIGILANCE ZRE" : "Non applicable",
      class_st: (Q_theis_corr >= 8 && ["41","45","28","18","36"].includes(p.dept)) ? "st-warn" : "st-ok"
    },
    {
      code: "2.1.5.0",
      libelle: "Rejet d'eaux pluviales (surface > 1 ha)",
      seuil: "1 ha",
      statut: "Non applicable",
      class_st: "st-ok"
    },
    {
      code: "3.1.5.0",
      libelle: "Travaux dans le lit d'un cours d'eau",
      seuil: "—",
      statut: "Non applicable",
      class_st: "st-ok"
    }
  ];

  return {
    inputs: p,
    geo,
    clim,
    s, T, S, r_puits, R, t_s, u, Wu,
    zre_applicable, zre_regime,
    Q_theis, Q_dupuit, Q_theis_corr, Q_dupuit_corr,
    Q_cycle, Q_floor, Q_base,
    V_jour_retenu: V_jour_retenu_in,
    Q_min, Q_max,
    V_jour, V_mois, V_an,
    P_eff, R_eff, surface_inf, V_recharge, ratio,
    iota_status, iota_type, iota_table
  };
}

// ─── Conversion Lambert 93 → WGS84 (pour la carte) ───
// Algorithme officiel IGN reproduit du module VBA GMEP_Geo.Lambert93ToWGS84
function lambert93_to_wgs84(x, y) {
  const n = 0.7256077650532670;
  const c = 11754255.4261;
  const xs = 700000;
  const ys = 12655612.0499;
  const lon0 = 3 * Math.PI / 180;
  const e = 0.0818191910428158;

  const dx = x - xs;
  const dy = y - ys;
  const r = Math.sqrt(dx*dx + dy*dy);
  // Formule officielle IGN : gamma = atan( (x-xs) / (ys-y) )
  const gamma = Math.atan2(dx, ys - y);

  const lon = lon0 + gamma / n;
  const latIso = -1/n * Math.log(Math.abs(r/c));
  let phi = 2 * Math.atan(Math.exp(latIso)) - Math.PI/2;
  for (let i = 0; i < 10; i++) {
    const dphi = 0.5 * Math.log((1 + Math.sin(phi))/(1 - Math.sin(phi)))
               - e/2 * Math.log((1 + e*Math.sin(phi))/(1 - e*Math.sin(phi)))
               - latIso;
    phi = phi - dphi * Math.cos(phi) * (1 - e*e*Math.sin(phi)*Math.sin(phi)) / (1 - e*e);
    if (Math.abs(dphi) < 1e-13) break;
  }
  return { lon: lon * 180 / Math.PI, lat: phi * 180 / Math.PI };
}

// Format helpers
function fmt(v, dec = 2) {
  if (v == null || isNaN(v) || !isFinite(v)) return "—";
  if (Math.abs(v) >= 1e6) return v.toExponential(2);
  if (Math.abs(v) < 0.01 && v !== 0) return v.toExponential(2);
  return v.toFixed(dec).replace('.', ',');
}
function fmtInt(v) {
  if (v == null || isNaN(v) || !isFinite(v)) return "—";
  return Math.round(v).toLocaleString('fr-FR');
}

// Export Node (tests offline) — sans effet côté navigateur
if (typeof module !== "undefined" && module.exports) {
  module.exports = { calculer, BASE_GEO, CLIMAT, wellFunction, lambert93_to_wgs84, fmt, fmtInt };
}
