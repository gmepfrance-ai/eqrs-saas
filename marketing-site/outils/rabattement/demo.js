/* ════════════════════════════════════════════════════════════
   GMEP — UI de la démo interactive
   - Gestion onglets, formulaire, calcul, carte Leaflet
   - Branche le bouton "Générer PDF" sur pdf-generator.js
   ════════════════════════════════════════════════════════════ */

let LAST_RESULT = null;
let LEAFLET_MAP = null;

// ─── Remplissage des selects (substrat + département) ───
function fillSelects() {
  const sb = document.getElementById("inp-substrat");
  const dp = document.getElementById("inp-dept");
  if (sb && !sb.options.length) {
    const ph = document.createElement("option");
    ph.value = ""; ph.textContent = "— Sélectionner un substrat —"; ph.disabled = true; ph.selected = true;
    sb.appendChild(ph);
    Object.keys(BASE_GEO).forEach(name => {
      const opt = document.createElement("option");
      opt.value = name; opt.textContent = name;
      sb.appendChild(opt);
    });
  }
  if (dp && !dp.options.length) {
    const ph = document.createElement("option");
    ph.value = ""; ph.textContent = "— Sélectionner un département —"; ph.disabled = true; ph.selected = true;
    dp.appendChild(ph);
    Object.entries(CLIMAT).forEach(([code, info]) => {
      const opt = document.createElement("option");
      opt.value = code; opt.textContent = `${code} — ${info.dept}`;
      dp.appendChild(opt);
    });
  }
}

// ─── Lecture du formulaire ───
function readForm() {
  const get = id => parseFloat(document.getElementById(id).value.replace(',', '.'));
  const getStr = id => document.getElementById(id).value.trim();
  return {
    // identification
    projet: getStr("inp-projet") || "Projet sans titre",
    mo: getStr("inp-mo") || "—",
    be: getStr("inp-be") || "GMEP",
    commune: getStr("inp-commune") || "—",
    dept: getStr("inp-dept"),
    zre: getStr("inp-zre") || "auto",
    // géo
    substrat: getStr("inp-substrat"),
    // ouvrage
    ns: get("inp-ns"),
    ff: get("inp-ff"),
    prof_puits: get("inp-prof-puits"),
    diam_int: get("inp-diam-int") / 1000, // mm → m
    rayon_inf: get("inp-rayon-inf"),
    t_pompage: get("inp-t-pompage"),
    t_exp: get("inp-t-exp"),
    V_jour_retenu: get("inp-v-jour-retenu"),
    Q_cycle: get("inp-q-cycle"),
    // coords Lambert 93 (optionnel)
    x_l93: get("inp-x"),
    y_l93: get("inp-y"),
    // identifications complémentaires (pour PDF dossier)
    mo_adresse: getStr("inp-mo-adresse"),
    mo_tel: getStr("inp-mo-tel"),
    mo_email: getStr("inp-mo-email"),
    travaux: getStr("inp-travaux"),
    travaux_siret: getStr("inp-travaux-siret"),
    travaux_adresse: getStr("inp-travaux-adresse"),
    forage: getStr("inp-forage"),
    forage_siret: getStr("inp-forage-siret"),
    forage_adresse: getStr("inp-forage-adresse"),
    // équipements ouvrage détaillés
    diam_ext: get("inp-diam-ext"),
    alt_tete: get("inp-alt-tete"),
    alt_fond: get("inp-alt-fond"),
    type_captage: getStr("inp-type-captage")
  };
}

// ─── Onglets ───
function activateTab(tab) {
  document.querySelectorAll(".demo-tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
  document.querySelector(`.demo-tab[data-tab="${tab}"]`)?.classList.add("active");
  document.getElementById(`panel-${tab}`)?.classList.add("active");
  if (tab === "carte" && LAST_RESULT) renderMap();
}

// ─── Échappement HTML (défense XSS) ───
function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"); }

// ─── Affichage des résultats ───
function renderResults(r) {
  const fmtSI = v => fmt(v, 6); // pour valeurs SI
  const html = `
    <div class="result-grid">
      <div class="card">
        <h4>Paramètres hydrauliques</h4>
        <table class="kv">
          <tr><td>Substrat</td><td><strong>${esc(r.inputs.substrat)}</strong></td></tr>
          <tr><td>Type de nappe</td><td>${r.geo.type}</td></tr>
          <tr><td>Transmissivité T</td><td>${fmtSI(r.T)} m²/s</td></tr>
          <tr><td>Coefficient d'emmagasinement S</td><td>${fmtSI(r.S)}</td></tr>
          <tr><td>Rabattement requis s</td><td><strong>${fmt(r.s, 2)} m</strong></td></tr>
          <tr><td>Rayon puits r</td><td>${fmt(r.r_puits, 3)} m</td></tr>
          <tr><td>Rayon d'influence R</td><td>${fmt(r.R, 1)} m</td></tr>
          <tr><td>Durée pompage</td><td>${fmtInt(r.inputs.t_pompage)} h</td></tr>
          <tr><td>u (Theis)</td><td>${fmtSI(r.u)}</td></tr>
          <tr><td>W(u)</td><td>${fmt(r.Wu, 4)}</td></tr>
        </table>
      </div>

      <div class="card">
        <h4>Débits calculés</h4>
        <table class="kv">
          <tr><td>Q Theis (brut)</td><td>${fmt(r.Q_theis, 2)} m³/h</td></tr>
          <tr><td>Q Theis corrigé (η=0,70)</td><td><strong>${fmt(r.Q_theis_corr, 2)} m³/h</strong></td></tr>
          <tr><td>Q Dupuit-Thiem (brut)</td><td>${fmt(r.Q_dupuit, 2)} m³/h</td></tr>
          <tr><td>Q Dupuit corrigé</td><td><strong>${fmt(r.Q_dupuit_corr, 2)} m³/h</strong></td></tr>
          ${r.Q_floor > 0 ? `<tr><td>Q plancher (V jour retenu / t)</td><td>${fmt(r.Q_floor, 2)} m³/h</td></tr>` : ""}
          ${r.Q_cycle > 0 ? `<tr><td>Q cycle pompe</td><td>${fmt(r.Q_cycle, 2)} m³/h</td></tr>` : ""}
          <tr><td>Débit base recommandé</td><td><strong>${fmt(r.Q_base, 3)} m³/h</strong></td></tr>
          <tr><td>Plage recommandée (±15 %)</td><td><strong>${fmt(r.Q_min, 3)} – ${fmt(r.Q_max, 3)} m³/h</strong></td></tr>
        </table>
      </div>

      <div class="card">
        <h4>Volumes prélevés</h4>
        <table class="kv">
          <tr><td>Volume jour (×${r.inputs.t_exp} h)</td><td>${fmtInt(r.V_jour)} m³/j</td></tr>
          <tr><td>Volume mois</td><td>${fmtInt(r.V_mois)} m³/mois</td></tr>
          <tr><td>Volume annuel</td><td><strong>${fmtInt(r.V_an)} m³/an</strong></td></tr>
        </table>
      </div>

      <div class="card">
        <h4>Bilan hydrique (zone d'influence)</h4>
        <table class="kv">
          <tr><td>Climat — station</td><td>${r.clim.station}</td></tr>
          <tr><td>Pluie P / ETP / Recharge R</td><td>${r.clim.P} / ${r.clim.ETP} / ${r.clim.R} mm/an</td></tr>
          <tr><td>Surface zone d'influence</td><td>${fmtInt(r.surface_inf)} m²</td></tr>
          <tr><td>Volume recharge / an</td><td>${fmtInt(r.V_recharge)} m³</td></tr>
          <tr><td>Ratio prélèvement / recharge</td><td>${fmt(r.ratio * 100, 1)} %</td></tr>
        </table>
      </div>

      <div class="card iota-card iota-${r.iota_type}">
        <h4>Classification IOTA — Article R.214-1 du Code de l'environnement</h4>
        <div class="iota-status">${r.iota_status}</div>
        <table class="iota-table">
          <thead>
            <tr><th>Rubrique</th><th>Libellé</th><th>Seuil</th><th>Statut</th></tr>
          </thead>
          <tbody>
            ${r.iota_table.map(row => `
              <tr>
                <td><code>${row.code}</code></td>
                <td>${row.libelle}</td>
                <td>${row.seuil}</td>
                <td><span class="iota-pill ${row.class_st}">${row.statut}</span></td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
  document.getElementById("panel-resultats").innerHTML = html;
}

// ─── Carte Leaflet ───
function renderMap() {
  const r = LAST_RESULT;
  if (!r || !r.inputs.x_l93 || !r.inputs.y_l93) {
    document.getElementById("panel-carte").innerHTML =
      `<div class="empty">Saisissez les coordonnées Lambert 93 (X, Y) pour afficher la carte.</div>`;
    return;
  }
  const { lon, lat } = lambert93_to_wgs84(r.inputs.x_l93, r.inputs.y_l93);
  document.getElementById("panel-carte").innerHTML = `<div id="map" style="height:480px;border-radius:12px;overflow:hidden;"></div>
    <div class="map-legend">
      <span><b>X L93</b> ${fmtInt(r.inputs.x_l93)} m</span>
      <span><b>Y L93</b> ${fmtInt(r.inputs.y_l93)} m</span>
      <span><b>WGS84</b> ${lat.toFixed(5)}, ${lon.toFixed(5)}</span>
    </div>`;
  if (LEAFLET_MAP) { LEAFLET_MAP.remove(); LEAFLET_MAP = null; }
  LEAFLET_MAP = L.map("map").setView([lat, lon], 16);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
    maxZoom: 19
  }).addTo(LEAFLET_MAP);
  L.marker([lat, lon]).addTo(LEAFLET_MAP)
    .bindPopup(`<b>${esc(r.inputs.projet)}</b><br>${esc(r.inputs.commune)}`).openPopup();
  L.circle([lat, lon], { radius: r.R, color: "#2a7ab5", fillOpacity: 0.1 })
    .addTo(LEAFLET_MAP).bindTooltip(`Zone d'influence ${fmt(r.R,0)} m`);
}

// ─── Trigger calcul ───
function runCalcul() {
  try {
    const p = readForm();
    if (!p.substrat || !p.dept) {
      alert("Merci de sélectionner un substrat et un département.");
      return;
    }
    if (isNaN(p.ns) || isNaN(p.ff) || isNaN(p.diam_int) || isNaN(p.rayon_inf) || isNaN(p.t_pompage)) {
      alert("Merci de renseigner toutes les valeurs hydrauliques (NS, FF, diamètre, rayon d'influence, durée pompage).");
      return;
    }
    LAST_RESULT = calculer(p);
    renderResults(LAST_RESULT);
    activateTab("resultats");
  } catch (e) {
    console.error(e);
    alert("Erreur de calcul : " + e.message);
  }
}

// ─── Trigger PDF (avec contrôle quota) ───
async function runPdf() {
  if (!LAST_RESULT) {
    alert("Veuillez d'abord lancer le calcul.");
    return;
  }
  try {
    await window.GMEP_Quota.ensureCanGeneratePdf();
  } catch(e) {
    return; // utilisateur annule ou expiré
  }
  try {
    const btn = document.getElementById("btn-pdf");
    btn.disabled = true; btn.textContent = "Génération en cours…";
    await window.GMEP_PDF.generate(LAST_RESULT);
    btn.disabled = false; btn.textContent = "Télécharger le PDF de démonstration";
    window.GMEP_Quota.refreshQuotaBanner();
  } catch(e) {
    console.error(e);
    alert("Erreur génération PDF : " + e.message);
    const btn = document.getElementById("btn-pdf");
    btn.disabled = false; btn.textContent = "Télécharger le PDF de démonstration";
  }
}

// ─── Vidage des champs pour que l'utilisateur saisisse SES propres valeurs ───
function resetFormForOwnExample() {
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
  // Identification : à compléter par l'utilisateur
  set("inp-projet", "");
  set("inp-mo", "");
  set("inp-be", "");
  set("inp-commune", "");
  // Paramètres hydrauliques : valeurs neutres par défaut, à ajuster
  set("inp-ns", "");
  set("inp-ff", "");
  set("inp-prof-puits", "");
  set("inp-diam-int", "");
  set("inp-rayon-inf", "");
  set("inp-t-pompage", "");
  set("inp-t-exp", "");
  set("inp-v-jour-retenu", "");
  set("inp-q-cycle", "");
  // Coordonnées Lambert 93 : à saisir par l'utilisateur (confidentialité)
  set("inp-x", "");
  set("inp-y", "");
  // Focus sur le 1er champ
  document.getElementById("inp-projet")?.focus();
  document.getElementById("inp-projet")?.scrollIntoView({ behavior: "smooth", block: "center" });
}

// ─── Calcul TVA selon pays ───
const PRICE_HT = 1100;
const COUNTRY_VAT = {
  "FR":     { rate: 0.20, label: "TVA 20 %",        note: "TVA française au taux normal de 20 % (art. 278 du CGI)." },
  "FR-DOM": { rate: 0.00, label: "TVA non applicable", note: "TVA non applicable dans les DROM pour les prestations de services numériques (art. 294 du CGI)." },
  "EU":     { rate: 0.00, label: "TVA non applicable", note: "Autoliquidation par le client professionnel (art. 196 directive 2006/112/CE — fournir un numéro de TVA intracommunautaire valide)." },
  "INTL":   { rate: 0.00, label: "TVA non applicable", note: "Opération hors champ de la TVA française — prestation de service hors UE (art. 259-1 du CGI)." }
};

function fmtEUR(v) {
  return v.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "\u00A0€";
}

function updatePricing() {
  const sel = document.getElementById("buyer-country");
  if (!sel) return;
  const code = sel.value;
  const info = COUNTRY_VAT[code] || COUNTRY_VAT.FR;
  const ht = PRICE_HT;
  const tva = ht * info.rate;
  const ttc = ht + tva;

  document.getElementById("pb-tva-label").textContent = info.label;
  if (info.rate > 0) {
    document.getElementById("pb-tva-val").textContent = fmtEUR(tva);
    document.getElementById("pb-tva-row").style.display = "";
  } else {
    document.getElementById("pb-tva-val").textContent = "0,00\u00A0€";
    document.getElementById("pb-tva-row").style.display = "";
  }
  document.getElementById("pb-ttc-val").textContent = fmtEUR(ttc);
  document.getElementById("price-vat-note").textContent = info.note;

  // CTA dynamique — Paiement en ligne via gmep-france.eu (Stripe Checkout)
  // Le backend gmep-france.eu génère une session Stripe Checkout pour le plan rabattement_annual
  // et ajuste la TVA côté Stripe selon le pays de facturation reçu en paramètre.
  const CHECKOUT_BASE = "https://www.gmep-france.eu/#/register";
  const PLAN_ID = "rabattement_annual";

  const checkoutURL = `${CHECKOUT_BASE}?plan=${PLAN_ID}&country=${encodeURIComponent(code)}`;

  const btn = document.getElementById("btn-souscrire");
  if (btn) {
    if (info.rate > 0) {
      btn.textContent = `💳 Souscrire en ligne — ${fmtEUR(ttc)} TTC / an`;
    } else {
      btn.textContent = `💳 Souscrire en ligne — ${fmtEUR(ht)} HT / an`;
    }
    btn.href = checkoutURL;
    btn.target = "_blank";
    btn.rel = "noopener";
  }

  // Mise à jour des autres liens "Souscrire" du site (nav + bandeau bloqué)
  const lockBtn = document.getElementById("lock-souscrire");
  if (lockBtn) {
    lockBtn.href = checkoutURL;
  }
  // Le lien nav .nav-cta pointe sur #souscrire (ancrage interne) — on le laisse, c'est OK :
  // il amène l'utilisateur jusqu'à la carte tarif où il peut choisir son pays puis cliquer.
}

// ─── Init ───
document.addEventListener("DOMContentLoaded", () => {
  fillSelects();

  // Sync pays → TVA
  const countrySel = document.getElementById("buyer-country");
  if (countrySel) {
    countrySel.addEventListener("change", updatePricing);
    updatePricing();
  }

  document.querySelectorAll(".demo-tab").forEach(t => {
    t.addEventListener("click", () => activateTab(t.dataset.tab));
  });
  document.getElementById("btn-calc").addEventListener("click", runCalcul);
  document.getElementById("btn-pdf").addEventListener("click", runPdf);
  document.getElementById("btn-example").addEventListener("click", () => {
    resetFormForOwnExample();
  });

  window.GMEP_Quota.refreshQuotaBanner();

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", ev => {
      const tgt = document.querySelector(a.getAttribute("href"));
      if (tgt) { ev.preventDefault(); tgt.scrollIntoView({behavior:"smooth", block:"start"}); }
    });
  });
});
