/* GMEP — stripe-checkout.js : redirection vers l'inscription/connexion de l'application
 *
 * Usage côté HTML :
 *   <button onclick="GmepCheckout.start('je_monthly', 'FR')">S'abonner</button>
 *
 * Le paiement Stripe (checkout + webhook + provisioning du compte) est désormais
 * entièrement géré par l'application app.gmep-france.eu, pas par ce site.
 * Ce script redirige donc vers l'inscription/connexion de l'application avec le
 * plan choisi transmis en paramètre, pour que l'abonnement soit rattaché au bon
 * compte utilisateur (l'ancien flux de paiement anonyme de ce site est désactivé).
 */

(function () {
  'use strict';

  // URL de l'application SaaS où se déroule désormais tout le tunnel d'abonnement.
  const APP_BASE = (typeof window.GMEP_APP_BASE === 'string') ? window.GMEP_APP_BASE : 'https://app.gmep-france.eu';

  // Correspondance entre les identifiants de plan utilisés sur ce site marketing
  // et les identifiants de plan attendus par l'application (app.gmep-france.eu).
  const PLAN_TO_APP_PLAN = {
    je_monthly:            'monthly',
    je_annual:             'annual',
    domenico_annual:       'tsn_annual',
    rabattement_annual:    'rabattement_annual',
    ecotox_monthly:        'eqrs_v31_ecotox_monthly',
    humain_monthly:        'humain_monthly',
    humain_annual:         'humain_annual',
    eaux_pluviales_annual: 'eaux_pluviales_annual',
    porchet_annual:        'porchet_annual',
    anc_annual:            'anc_annual',
    ssp3d_monthly:         'ssp3d_monthly',
    ssp3d_annual:          'ssp3d_annual'
  };

  const PLAN_LABELS = {
    je_monthly:          'EQRS Johnson & Ettinger — Abonnement mensuel',
    je_annual:           'EQRS Johnson & Ettinger — Abonnement annuel',
    domenico_annual:     'Transfert Sol → Nappe → Captage — Abonnement annuel',
    rabattement_annual:  'Rabattement de nappe — Abonnement annuel',
    // Nouveaux plans EQRS V8 — juin 2026
    ecotox_monthly:      'EQRS V8 + ECOTOX V8 — Abonnement mensuel (395 € HT/mois)',
    ecotox_annual:       'EQRS V8 + ECOTOX V8 — Abonnement annuel (3 900 € HT/an)',
    humain_monthly:      'EQRS V8 + ECOTOX + Module HUMAIN Tier 3 — Abonnement mensuel (550 € HT/mois)',
    humain_annual:       'EQRS V8 + ECOTOX + Module HUMAIN Tier 3 — Abonnement annuel (5 200 € HT/an)',
    // Modélisation GEP — DLE & Loi sur l'Eau (ex Eaux pluviales v2.1) — juillet 2026
    eaux_pluviales_annual:'Modélisation GEP — DLE & Loi sur l\'Eau — Abonnement annuel (5 500 € HT/an)',
    // Modélisation Essai de Porchet — juillet 2026
    porchet_annual:      'Modélisation Essai de Porchet — Abonnement annuel (550 € HT/an)',
    // Dimensionnement ANC — Assainissement Individuel & Collectif — août 2026
    anc_annual:          'Dimensionnement ANC — Assainissement Individuel & Collectif — Abonnement annuel (550 € HT/an)',
    // 3D_SSP — juillet 2026
    ssp3d_monthly:       '3D_SSP — Modélisation 3D intégrée — Abonnement mensuel (250 € HT/mois)',
    ssp3d_annual:        '3D_SSP — Modélisation 3D intégrée — Abonnement annuel (2 400 € HT/an)'
  };

  // Calcul TVA selon pays (identique à demo.js du module Rabattement)
  const COUNTRY_VAT = {
    'FR':     { rate: 0.20, label: 'TVA 20 %',           note: 'TVA française au taux normal de 20 % (art. 278 du CGI).' },
    'FR-DOM': { rate: 0.00, label: 'TVA non applicable', note: 'TVA non applicable dans les DROM pour les prestations de services numériques (art. 294 du CGI).' },
    'EU':     { rate: 0.00, label: 'TVA non applicable', note: 'Autoliquidation par le client professionnel (art. 196 directive 2006/112/CE).' },
    'INTL':   { rate: 0.00, label: 'TVA non applicable', note: 'Opération hors champ de la TVA française — prestation de service hors UE (art. 259-1 du CGI).' }
  };

  function showToast(msg) {
    if (window.GmepToast) window.GmepToast(msg);
    else alert(msg);
  }

  /**
   * Redirige vers l'inscription (ou connexion) de l'application avec le plan
   * choisi en paramètre. C'est l'application qui gère ensuite la création du
   * compte, l'activation de l'essai gratuit et le paiement Stripe.
   * @param {string} planId  - je_monthly | je_annual | domenico_annual | rabattement_annual | ...
   * @param {string} country - FR | FR-DOM | EU | INTL (conservé pour compatibilité, non utilisé ici)
   */
  function start(planId, country) {
    const appPlan = PLAN_TO_APP_PLAN[planId];
    if (!PLAN_LABELS[planId] || !appPlan) {
      console.error('[GmepCheckout] Plan inconnu ou non disponible dans l\'application :', planId);
      showToast("Plan inconnu — veuillez réessayer ou contacter gmep.france@gmail.com.");
      return;
    }

    // Désactive le bouton appelant si présent, pendant la redirection
    const trigger = document.activeElement;
    if (trigger && trigger.tagName === 'BUTTON') {
      trigger.disabled = true;
      trigger.textContent = 'Redirection…';
    }

    // Redirige vers la page d'inscription de l'application. Le paramètre ?plan=
    // est lu par l'application au chargement pour déclencher automatiquement
    // l'abonnement (ou l'essai gratuit) une fois le compte créé/connecté.
    window.location.href = APP_BASE + '/#/register?plan=' + encodeURIComponent(appPlan);
  }

  // Recalcule l'affichage TVA d'une carte tarif
  function updateVatDisplay(cardEl) {
    if (!cardEl) return;
    const select = cardEl.querySelector('.country-select select');
    const htEl   = cardEl.querySelector('[data-ht]');
    const tvaLabelEl = cardEl.querySelector('[data-tva-label]');
    const tvaValEl   = cardEl.querySelector('[data-tva-val]');
    const ttcValEl   = cardEl.querySelector('[data-ttc-val]');
    const noteEl     = cardEl.querySelector('[data-vat-note]');

    if (!select || !htEl) return;
    const ht = parseFloat(htEl.getAttribute('data-ht'));
    const info = COUNTRY_VAT[select.value] || COUNTRY_VAT.FR;
    const tva = ht * info.rate;
    const ttc = ht + tva;

    const fmt = function (v) {
      return v.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
    };
    if (tvaLabelEl) tvaLabelEl.textContent = info.label;
    if (tvaValEl)   tvaValEl.textContent   = fmt(tva);
    if (ttcValEl)   ttcValEl.textContent   = fmt(ttc);
    if (noteEl)     noteEl.textContent     = info.note;
  }

  function initVatSelectors() {
    document.querySelectorAll('.price-card').forEach(function (card) {
      const sel = card.querySelector('.country-select select');
      if (!sel) return;
      sel.addEventListener('change', function () { updateVatDisplay(card); });
      updateVatDisplay(card);
    });
  }

  // Init quand DOM prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVatSelectors);
  } else {
    initVatSelectors();
  }

  // Expose API publique
  window.GmepCheckout = {
    start: start,
    COUNTRY_VAT: COUNTRY_VAT,
    updateVatDisplay: updateVatDisplay
  };

})();
