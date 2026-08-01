# GMEP — Site officiel www.gmep-france.eu

Site multi-outils SaaS de la **SARL G.M.E.P** (Saint-Maixent-l'École, FR).
Trois outils de modélisation environnementale + paiement en ligne par Stripe.

## Outils proposés

| Outil                                       | Référentiel                       | Tarif         |
| ------------------------------------------- | --------------------------------- | ------------- |
| EQRS Johnson & Ettinger                     | US EPA 2004 + ANSES 2018          | 245 €/mois ou 2 499 €/an |
| Transfert Sol → Nappe → Captage (Domenico)  | Domenico 1987                     | 850 €/an      |
| Rabattement de nappe (Theis + Dupuit-Thiem) | IOTA R.214-1 — Code environnement | 1 100 €/an    |

## Architecture

```
Frontend statique (HTML/CSS/JS)  ──┐
                                    ├──► Express (server.js) ──► Railway
Backend Stripe (/api/*)          ──┘                          (https://www.gmep-france.eu)
                                                                       │
                                                                       └──► Stripe Checkout
```

Un seul service Node.js sert à la fois :
- Les pages HTML, CSS, JS, images (statique)
- L'API Stripe (`/api/create-checkout-session`, `/api/webhook-stripe`, `/api/health`)

## Déploiement (Railway)

1. **Forker / cloner ce dépôt sur GitHub** (gmepfrance-ai/gmep-france-site)
2. Aller sur [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
3. Sélectionner le dépôt → Railway détecte Node.js et déploie automatiquement
4. Configurer les variables d'environnement (voir `.env.example`)
5. Ajouter le domaine personnalisé `www.gmep-france.eu` dans Settings → Networking → Custom Domain
6. Configurer le DNS OVH : CNAME `www` → `<projet>.up.railway.app`

## Variables d'environnement requises (Railway)

Voir `.env.example`. Variables minimales :

- `STRIPE_SECRET_KEY` (sk_live_xxx)
- `STRIPE_WEBHOOK_SECRET` (whsec_xxx)
- 4 Price IDs : `STRIPE_PRICE_JE_MONTHLY`, `STRIPE_PRICE_JE_ANNUAL`, `STRIPE_PRICE_DOMENICO_ANNUAL`, `STRIPE_PRICE_RABATTEMENT_ANNUAL`
- `ENABLE_STRIPE_TAX=true`
- `SITE_URL=https://www.gmep-france.eu`
- `CORS_ORIGIN=https://www.gmep-france.eu`

## Webhook Stripe

Créer le webhook dans Dashboard Stripe → Developers → Webhooks :
- URL : `https://www.gmep-france.eu/api/webhook-stripe`
- Événements : `checkout.session.completed`, `invoice.payment_failed`, `customer.subscription.deleted`
- Copier le secret `whsec_xxx` dans `STRIPE_WEBHOOK_SECRET`

## Développement local

```bash
cp .env.example .env  # puis renseigner les clés Stripe test
npm install
npm start  # http://localhost:3001
```

## Identité

**SARL G.M.E.P** — 9 rue de la Marne, 79400 Saint-Maixent-l'École
SIREN 753 097 625 · SIRET 75309762500010
Tél 06 07 73 72 33 · gmep.france@gmail.com
Gérant : Eric Azulay — Ingénieur sites et sols pollués

© 2023–2026 SARL G.M.E.P. Tous droits réservés.
