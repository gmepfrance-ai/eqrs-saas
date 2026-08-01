/**
 * Backend Stripe — GMEP (SARL G.M.E.P)
 * ----------------------------------------------------------------------
 * Endpoints :
 *   GET  /api/health                  → healthcheck
 *   POST /api/create-checkout-session → crée une session Stripe Checkout
 *   POST /api/webhook-stripe          → reçoit les événements Stripe
 *
 * Lancement local :
 *   cp .env.example .env  (puis renseigner les clés)
 *   npm install
 *   npm start
 *
 * Test avec carte fictive Stripe : 4242 4242 4242 4242 / 12/34 / CVC 123
 */

'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');

const PORT = process.env.PORT || 3001;
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const SITE_URL = process.env.SITE_URL || 'http://localhost:8080';
const SUCCESS_PATH = process.env.SUCCESS_PATH || '/tarifs.html?status=success&session={CHECKOUT_SESSION_ID}';
const CANCEL_PATH = process.env.CANCEL_PATH || '/tarifs.html?status=cancel';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const ENABLE_STRIPE_TAX = (process.env.ENABLE_STRIPE_TAX || 'false').toLowerCase() === 'true';

if (!STRIPE_KEY || STRIPE_KEY.includes('REMPLACEZ')) {
  console.warn('[GMEP] ⚠ STRIPE_SECRET_KEY non configurée — voir .env.example');
}

const stripe = STRIPE_KEY ? new Stripe(STRIPE_KEY, { apiVersion: '2024-06-20' }) : null;

// Mapping plan → Price ID Stripe
const PLAN_TO_PRICE = {
  je_monthly:         process.env.STRIPE_PRICE_JE_MONTHLY,
  je_annual:          process.env.STRIPE_PRICE_JE_ANNUAL,
  domenico_annual:    process.env.STRIPE_PRICE_DOMENICO_ANNUAL,
  rabattement_annual: process.env.STRIPE_PRICE_RABATTEMENT_ANNUAL,
  // Module HUMAIN Tier 3 — juin 2026
  humain_monthly:     process.env.STRIPE_PRICE_HUMAIN_MONTHLY,
  humain_annual:      process.env.STRIPE_PRICE_HUMAIN_ANNUAL,
  // Modélisation GEP — DLE & Loi sur l'Eau (ex Eaux pluviales v2.1, 5 500 € HT/an) — juillet 2026
  eaux_pluviales_annual: process.env.STRIPE_PRICE_EAUX_PLUVIALES_ANNUAL,
  // Modélisation Essai de Porchet — juillet 2026
  porchet_annual:     process.env.STRIPE_PRICE_PORCHET_ANNUAL,
  // 3D_SSP — juillet 2026
  ssp3d_monthly:      process.env.STRIPE_PRICE_SSP3D_MONTHLY,
  ssp3d_annual:       process.env.STRIPE_PRICE_SSP3D_ANNUAL
};

const PLAN_LABELS = {
  je_monthly:         'EQRS Johnson & Ettinger — Mensuel',
  je_annual:          'EQRS Johnson & Ettinger — Annuel',
  domenico_annual:    'Transfert Sol → Nappe → Captage — Annuel',
  rabattement_annual: 'Rabattement de nappe — Annuel',
  // Module HUMAIN Tier 3 — juin 2026
  humain_monthly:     'EQRS V8 + ECOTOX + Module HUMAIN Tier 3 — Mensuel (550 € HT/mois)',
  humain_annual:      'EQRS V8 + ECOTOX + Module HUMAIN Tier 3 — Annuel (5 200 € HT/an)',
  // Modélisation GEP — DLE & Loi sur l'Eau (ex Eaux pluviales v2.1) — juillet 2026
  eaux_pluviales_annual: 'Modélisation GEP — DLE & Loi sur l\'Eau — Annuel (5 500 € HT/an)',
  // Modélisation Essai de Porchet — juillet 2026
  porchet_annual:     'Modélisation Essai de Porchet — Annuel (550 € HT/an)',
  // 3D_SSP — juillet 2026
  ssp3d_monthly:      '3D_SSP — Modélisation 3D intégrée — Mensuel (250 € HT/mois)',
  ssp3d_annual:       '3D_SSP — Modélisation 3D intégrée — Annuel (2 400 € HT/an)'
};

// Plans bénéficiant d'une période d'essai gratuite (en jours) avant le premier prélèvement
const PLAN_TRIAL_DAYS = {
  ssp3d_monthly: 8,
  ssp3d_annual:  8,
  porchet_annual: 8
};

const COUNTRY_TO_BILLING = {
  FR:       { country: 'FR' },
  'FR-DOM': { country: 'FR' },   // DROM : facturation FR mais TVA gérée par Stripe Tax
  EU:       { country: null },   // détecté côté Stripe Checkout
  INTL:     { country: null }
};

const app = express();

// CORS — autoriser le frontend statique
app.use(cors({ origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN.split(',').map(s => s.trim()) }));

// ─── Webhook Stripe : body brut requis pour la vérification de signature ───
app.post('/api/webhook-stripe',
  express.raw({ type: 'application/json' }),
  function (req, res) {
    if (!stripe || !WEBHOOK_SECRET || WEBHOOK_SECRET.includes('REMPLACEZ')) {
      console.warn('[Webhook] Stripe non configuré — événement ignoré.');
      return res.status(200).send('ok');
    }
    const sig = req.headers['stripe-signature'];
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, WEBHOOK_SECRET);
    } catch (err) {
      console.error('[Webhook] Signature invalide :', err.message);
      return res.status(400).send('Webhook Error: ' + err.message);
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('[Webhook] ✓ Paiement réussi :', {
          id: session.id,
          customer_email: session.customer_details && session.customer_details.email,
          amount_total: session.amount_total,
          currency: session.currency,
          plan: session.metadata && session.metadata.plan
        });
        // TODO : activer le compte utilisateur en base ici.
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.error('[Webhook] ✗ Échec paiement :', invoice.id, invoice.customer_email);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        console.log('[Webhook] Abonnement résilié :', sub.id);
        break;
      }
      default:
        console.log('[Webhook] Événement reçu :', event.type);
    }
    res.status(200).json({ received: true });
  }
);

// JSON parser pour les autres routes
app.use(express.json({ limit: '100kb' }));

// ─── Healthcheck ───
app.get('/api/health', function (req, res) {
  res.status(200).json({
    status: 'ok',
    stripe_configured: !!stripe,
    plans_configured: Object.fromEntries(
      Object.entries(PLAN_TO_PRICE).map(([k, v]) => [k, !!(v && !v.includes('REMPLACEZ'))])
    ),
    timestamp: new Date().toISOString()
  });
});

// ─── Création de session Stripe Checkout ───
// DÉSACTIVÉ (juillet 2026) : ce flux créait une session de paiement anonyme,
// sans compte utilisateur associé dans l'application — un abonnement pouvait
// donc être payé sans qu'aucun accès ne soit jamais provisionné. Tout le tunnel
// d'abonnement (inscription + essai + paiement) passe désormais par
// app.gmep-france.eu, qui rattache correctement chaque abonnement à un compte.
// Voir assets/js/stripe-checkout.js (redirection vers l'application).
app.post('/api/create-checkout-session', async function (req, res) {
  return res.status(410).json({
    error: 'endpoint_desactive',
    message: "Ce point d'accès n'est plus utilisé. Pour souscrire, inscrivez-vous sur https://app.gmep-france.eu."
  });
});


// ─── Service des fichiers statiques (site GMEP) ───
// Toutes les routes /api/* sont déjà définies au-dessus et passent en priorité.
const STATIC_ROOT = __dirname;
app.use(express.static(STATIC_ROOT, {
  extensions: ['html'],
  setHeaders: function (res, filepath) {
    if (filepath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    } else if (/\.(css|js|svg|png|jpg|jpeg|webp|woff2?)$/i.test(filepath)) {
      // Les assets du site marketing portent des noms stables (non hachés) :
      // max-age court pour limiter la fenêtre de validité d'une version obsolète.
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }
  }
}));

// Fallback 404 — JSON pour /api/*, sinon page d'accueil
app.use(function (req, res) {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'not_found', path: req.path });
  }
  res.status(404).sendFile(path.join(STATIC_ROOT, 'index.html'));
});

// ─── Démarrage du serveur ───
app.listen(PORT, '0.0.0.0', function () {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  GMEP — Site complet (statique + API Stripe)');
  console.log('  Port    : ' + PORT);
  console.log('  Site    : ' + SITE_URL);
  console.log('  Stripe  : ' + (stripe ? 'configuré ✓' : 'NON configuré ✗'));
  console.log('  Tax auto: ' + (ENABLE_STRIPE_TAX ? 'activée' : 'désactivée'));
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});
