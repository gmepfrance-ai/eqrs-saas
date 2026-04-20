import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import Stripe from "stripe";

// Load EQRS tool HTML at startup
let eqrsToolHtml = "";
try {
  eqrsToolHtml = fs.readFileSync(
    path.resolve(process.cwd(), "eqrs-tool.html"),
    "utf-8"
  );
} catch (e) {
  console.error("Warning: Could not load eqrs-tool.html", e);
}

// Load TSN tool HTML at startup
let tsnToolHtml = "";
try {
  tsnToolHtml = fs.readFileSync(
    path.resolve(process.cwd(), "tsn-tool.html"),
    "utf-8"
  );
} catch (e) {
  console.error("Warning: Could not load tsn-tool.html", e);
}

// Stripe setup
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder";
const isStripeConfigured =
  stripeSecretKey !== "sk_test_placeholder" && stripeSecretKey.startsWith("sk_");

let stripe: Stripe | null = null;
if (isStripeConfigured) {
  stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" as any });
}

const STRIPE_PRICE_MONTHLY =
  process.env.STRIPE_PRICE_MONTHLY || "price_monthly_placeholder";
const STRIPE_PRICE_ANNUAL =
  process.env.STRIPE_PRICE_ANNUAL || "price_annual_placeholder";
const STRIPE_PRICE_TSN_ANNUAL =
  process.env.STRIPE_PRICE_TSN_ANNUAL || "price_1TOK7o3A2g3lkch9UDnnjOWw";
const STRIPE_WEBHOOK_SECRET =
  process.env.STRIPE_WEBHOOK_SECRET || "whsec_placeholder";

// ── Auth middleware ─────────────────────────────────────
interface AuthRequest extends Request {
  user?: { id: number; email: string; name: string; createdAt: string };
}

async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token =
    (req.query.token as string) || req.headers["x-auth-token"] as string;

  if (!token) {
    return res.status(401).json({ message: "Authentification requise" });
  }

  const session = await storage.getSessionByToken(token);
  if (!session) {
    return res.status(401).json({ message: "Session invalide ou expirée" });
  }

  if (new Date(session.expiresAt) < new Date()) {
    await storage.deleteSession(token);
    return res.status(401).json({ message: "Session expirée, veuillez vous reconnecter" });
  }

  const user = await storage.getUser(session.userId);
  if (!user) {
    return res.status(401).json({ message: "Utilisateur introuvable" });
  }

  req.user = storage.toSafeUser(user) as any;
  next();
}

async function requireSubscription(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({ message: "Authentification requise" });
  }

  const sub = await storage.getSubscriptionByUserId(req.user.id);
  if (!sub || (sub.status !== "active" && sub.status !== "trialing")) {
    return res
      .status(403)
      .json({ message: "Abonnement actif requis pour accéder à cet outil" });
  }
  if (sub.status === "trialing" && sub.currentPeriodEnd) {
    if (new Date(sub.currentPeriodEnd) < new Date()) {
      return res
        .status(403)
        .json({ message: "Votre période d'essai gratuit de 14 jours est terminée. Veuillez souscrire un abonnement pour continuer." });
    }
  }
  next();
}

// Middleware spécifique au tool TSN
async function requireTsnSubscription(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) return res.status(401).json({ message: "Authentification requise" });
  const subs = await storage.getSubscriptionsByUserId(req.user.id);
  const tsnSub = subs.find(
    (s) => (s.tool === "tsn" || s.tool === "bundle") &&
           (s.status === "active" || s.status === "trialing")
  );
  if (!tsnSub) {
    return res.status(403).json({ message: "Abonnement Transfert Sol→Nappe requis pour accéder à cet outil" });
  }
  if (tsnSub.status === "trialing" && tsnSub.currentPeriodEnd) {
    if (new Date(tsnSub.currentPeriodEnd) < new Date()) {
      return res.status(403).json({ message: "Votre période d'essai est terminée. Veuillez souscrire un abonnement." });
    }
  }
  next();
}

// ── Helper: inject anti-copy protections into EQRS HTML ──
function protectToolHtml(html: string): string {
  // Strip download meta hints
  let protected_html = html.replace(
    /<meta[^>]*content-disposition[^>]*>/gi,
    ""
  );

  // Add cache-busting + anti-copy
  const antiCopyScript = `
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
<script>
document.addEventListener('keydown', function(e) {
  if (e.ctrlKey && (e.key === 's' || e.key === 'S' || e.key === 'u' || e.key === 'U' || e.key === 'p' || e.key === 'P')) {
    e.preventDefault();
    return false;
  }
});
document.addEventListener('contextmenu', function(e) { e.preventDefault(); });
</script>`;

  // Inject before </head>
  protected_html = protected_html.replace("</head>", antiCopyScript + "\n</head>");

  return protected_html;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Attendre la migration DB avant d'enregistrer les routes
  if ((storage as any).ready) {
    await (storage as any).ready();
    console.log("[routes] DB migration complete, registering routes");
  }

  // ── SEO: Sitemap and robots.txt ──
  app.get("/sitemap.xml", (_req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.gmep-france.eu/</loc>
    <lastmod>2026-04-13</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.gmep-france.eu/#/register</loc>
    <lastmod>2026-04-13</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.gmep-france.eu/#/login</loc>
    <lastmod>2026-04-13</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`);
  });

  app.get("/robots.txt", (_req: Request, res: Response) => {
    res.setHeader("Content-Type", "text/plain");
    res.send("User-agent: *\nAllow: /\nSitemap: https://www.gmep-france.eu/sitemap.xml");
  });

  // ── Password reset codes (in-memory, expire after 15 min) ──
  const resetCodes = new Map<string, { code: string; expiresAt: number }>();

  // Forgot password - generate code
  app.post("/api/auth/forgot-password", async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "E-mail requis" });

    const user = await storage.getUserByEmail(email);
    if (!user) {
      console.log(`[PASSWORD RESET] No user found for email: ${email}`);
      // Don't reveal if email exists - still return success
      return res.json({ message: "Si un compte existe avec cet e-mail, un code de réinitialisation a été généré." });
    }
    console.log(`[PASSWORD RESET] User found: ${user.email} (id=${user.id})`);

    // Generate 6-digit code
    const code = String(Math.floor(100000 + Math.random() * 900000));
    resetCodes.set(email, { code, expiresAt: Date.now() + 15 * 60 * 1000 });

    // Send code by email using Resend API
    const resendKey = process.env.RESEND_API_KEY;
    const emailHtml = `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px;">
        <div style="background:#1a365d;color:white;padding:20px;border-radius:8px 8px 0 0;text-align:center;">
          <h2 style="margin:0;">G.M.E.P</h2>
          <p style="margin:4px 0 0;font-size:12px;opacity:0.8;">EQRS — Modèle Johnson & Ettinger</p>
        </div>
        <div style="background:#f8f9fa;padding:24px;border:1px solid #e2e8f0;border-radius:0 0 8px 8px;">
          <p>Bonjour,</p>
          <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
          <p>Votre code de vérification est :</p>
          <div style="background:#1a365d;color:white;font-size:32px;font-family:monospace;letter-spacing:8px;text-align:center;padding:16px;border-radius:8px;margin:16px 0;">
            ${code}
          </div>
          <p style="font-size:13px;color:#64748b;">Ce code est valable 15 minutes. Si vous n'avez pas demandé cette réinitialisation, ignorez cet e-mail.</p>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;">
          <p style="font-size:11px;color:#94a3b8;text-align:center;">© 2023–2026 SARL G.M.E.P — 9 rue de la Marne, 79400 Saint-Maixent-l'École</p>
        </div>
      </div>
    `;

    if (resendKey) {
      try {
        const { Resend } = require("resend");
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: "GMEP EQRS <noreply@gmep-france.eu>",
          to: email,
          subject: "EQRS - Code de réinitialisation de mot de passe",
          html: emailHtml,
        });
        console.log(`[PASSWORD RESET] Email sent to ${email}`);
      } catch (emailErr: any) {
        console.error(`[PASSWORD RESET] Email failed:`, emailErr.message);
      }
      return res.json({ message: "Un code de réinitialisation a été envoyé à votre adresse e-mail." });
    } else {
      console.log(`[PASSWORD RESET] Resend not configured. Code for ${email}: ${code}`);
      return res.json({
        message: "Code de réinitialisation généré.",
        _code: code
      });
    }
  });

  // Reset password with code
  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    try {
      const { email, code, newPassword } = req.body;
      if (!email || !code || !newPassword) {
        return res.status(400).json({ message: "Tous les champs sont requis" });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({ message: "Le mot de passe doit contenir au moins 8 caractères" });
      }

      const stored = resetCodes.get(email);
      if (!stored || stored.code !== code || stored.expiresAt < Date.now()) {
        return res.status(400).json({ message: "Code invalide ou expiré" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      const hash = await bcrypt.hash(newPassword, 12);

      // Update via storage (works for both JSON and PG)
      await storage.updateUserPassword(email, hash);

      // Remove used code
      resetCodes.delete(email);

      return res.json({ message: "Mot de passe modifié avec succès" });
    } catch (err: any) {
      return res.status(500).json({ message: "Erreur interne" });
    }
  });

  // ── Page view tracking ──────────────────────────
  app.post("/api/track", async (req: Request, res: Response) => {
    try {
      const ip = (req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "").split(",")[0].trim();
      const path = req.body?.path || "/";

      // Geolocation via free API
      let country = "Unknown", countryCode = "??", city = "";
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=country,countryCode,city`);
        if (geoRes.ok) {
          const geo = await geoRes.json() as any;
          country = geo.country || "Unknown";
          countryCode = geo.countryCode || "??";
          city = geo.city || "";
        }
      } catch {}

      await storage.addPageView({ country, countryCode, city, path, ip });
      return res.json({ ok: true });
    } catch {
      return res.json({ ok: true });
    }
  });

  // ── View statistics (admin only — your email) ──────
  app.get("/api/stats", async (req: Request, res: Response) => {
    const stats = await storage.getViewStats();

    // Sort countries by count descending
    const sortedCountries = Object.entries(stats.byCountry)
      .sort((a, b) => b[1] - a[1])
      .map(([country, count]) => ({ country, count }));

    const sortedDates = Object.entries(stats.byDate)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }));

    const sortedCities = Object.entries(stats.byCity)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([city, count]) => ({ city, count }));

    const pageViewsCount = (await storage.getPageViews()).length;

    return res.json({
      total: stats.total,
      byCountry: sortedCountries,
      byDate: sortedDates,
      byCity: sortedCities,
      users: pageViewsCount > 0 ? {
        totalUsers: 0, // placeholder
      } : null
    });
  });

  // Health check
  app.get("/api/health", async (req: Request, res: Response) => {
    try {
      const testUser = await storage.getUserByEmail("health@test.com");
      const totalUsers = await storage.getUserCount();
      const userEmails = await storage.getAllUserEmails();
      res.json({
        status: "ok",
        time: new Date().toISOString(),
        dbWorks: true,
        stripeConfigured: isStripeConfigured,
        hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
        stripeKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 10) || "not set",
        hasPriceMonthly: !!process.env.STRIPE_PRICE_MONTHLY,
        hasPriceAnnual: !!process.env.STRIPE_PRICE_ANNUAL,
        hasPriceTsnAnnual: !!process.env.STRIPE_PRICE_TSN_ANNUAL,
        hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        dbBackend: process.env.DATABASE_URL ? 'postgresql' : 'json',
        hasResendKey: !!process.env.RESEND_API_KEY,
        resendKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 8) || "not set",
        totalUsers,
        userEmails,
        port: process.env.PORT
      });
    } catch (err: any) {
      res.status(500).json({ status: "error", error: err.message, stack: err.stack });
    }
  });

  // ── Auth Routes ────────────────────────────────────────

  // Register
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        return res
          .status(400)
          .json({ message: "Tous les champs sont requis" });
      }

      if (password.length < 8) {
        return res.status(400).json({
          message: "Le mot de passe doit contenir au moins 8 caractères",
        });
      }

      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res
          .status(409)
          .json({ message: "Un compte avec cet e-mail existe déjà" });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await storage.createUser(email, passwordHash, name);

      // Create 14-day free trial subscription
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 14);
      await storage.createSubscription(user.id, {
        status: "trialing",
        plan: "trial",
        currentPeriodEnd: trialEnd.toISOString(),
      });

      const token = crypto.randomUUID();
      const expiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ).toISOString();
      await storage.createSession(token, user.id, expiresAt);

      return res.json({
        token,
        user: storage.toSafeUser(user),
      });
    } catch (err: any) {
      console.error("Register error:", err);
      return res
        .status(500)
        .json({ message: "Erreur interne du serveur" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "E-mail et mot de passe requis" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res
          .status(401)
          .json({ message: "E-mail ou mot de passe incorrect" });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res
          .status(401)
          .json({ message: "E-mail ou mot de passe incorrect" });
      }

      // Clean up expired sessions periodically
      await storage.deleteExpiredSessions();

      const token = crypto.randomUUID();
      const expiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ).toISOString();
      await storage.createSession(token, user.id, expiresAt);

      return res.json({
        token,
        user: storage.toSafeUser(user),
      });
    } catch (err: any) {
      console.error("Login error:", err);
      return res
        .status(500)
        .json({ message: "Erreur interne du serveur" });
    }
  });

  // Get current user
  app.get(
    "/api/auth/me",
    requireAuth as any,
    async (req: AuthRequest, res: Response) => {
      const subs = await storage.getSubscriptionsByUserId(req.user!.id);
    const sub = subs.find(s => s.tool === "je" || s.tool === null) || subs[0];
    const tsnSub = subs.find(s => s.tool === "tsn");
      return res.json({
        user: req.user,
        subscription: sub || null,
      tsnSubscription: tsnSub || null,
      });
    }
  );

  // Logout
  app.post(
    "/api/auth/logout",
    requireAuth as any,
    async (req: AuthRequest, res: Response) => {
      const token =
        (req.query.token as string) || req.headers["x-auth-token"] as string;
      if (token) {
        await storage.deleteSession(token);
      }
      return res.json({ message: "Déconnexion réussie" });
    }
  );

  // ── Stripe Routes ──────────────────────────────────────

  // Create checkout session
  app.post(
    "/api/stripe/create-checkout",
    requireAuth as any,
    async (req: AuthRequest, res: Response) => {
      if (!stripe || !isStripeConfigured) {
        return res.status(503).json({
          message: "Configuration Stripe en cours. Veuillez réessayer ultérieurement.",
        });
      }

      try {
        const { plan } = req.body;
        const priceId =
          plan === "tsn_annual" ? STRIPE_PRICE_TSN_ANNUAL :
          plan === "annual" ? STRIPE_PRICE_ANNUAL :
          STRIPE_PRICE_MONTHLY;


        // Déterminer le tool associé au plan
        const tool = plan === "tsn_annual" ? "tsn" : "je";

        // Chercher un abonnement existant pour ce tool (ou récupérer le customerId existant)
        const allSubs = await storage.getSubscriptionsByUserId(req.user!.id);
        let toolSub = allSubs.find(s => s.tool === tool);
        let anySub = allSubs[0]; // pour récupérer un customerId existant
        let customerId = toolSub?.stripeCustomerId || anySub?.stripeCustomerId;

        if (!customerId) {
          const customer = await stripe.customers.create({
            email: req.user!.email,
            name: req.user!.name,
            metadata: { userId: req.user!.id.toString() },
          });
          customerId = customer.id;
        }

        // Créer ou mettre à jour l'enregistrement d'abonnement pour ce tool
        try {
          if (!toolSub) {
            toolSub = await storage.createSubscription(req.user!.id, {
              stripeCustomerId: customerId,
              tool,
            });
          } else if (!toolSub.stripeCustomerId) {
            await storage.updateSubscription(toolSub.id, { stripeCustomerId: customerId });
          }
        } catch (subErr: any) {
          // Si la colonne tool n'existe pas encore, fallback sur l'ancien comportement
          console.warn("createSubscription with tool failed, falling back:", subErr.message);
          let fallbackSub = await storage.getSubscriptionByUserId(req.user!.id);
          if (!fallbackSub) {
            fallbackSub = await storage.createSubscription(req.user!.id, {
              stripeCustomerId: customerId,
            });
          } else if (!fallbackSub.stripeCustomerId) {
            await storage.updateSubscription(fallbackSub.id, { stripeCustomerId: customerId });
          }
        }

        const origin = `${req.protocol}://${req.get("host")}`;
        const token = req.query.token as string;

        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          payment_method_types: ["card"],
          line_items: [{ price: priceId, quantity: 1 }],
          mode: "subscription",
          success_url: `${origin}/#/dashboard?token=${token}&checkout=success`,
          cancel_url: `${origin}/#/dashboard?token=${token}&checkout=cancel`,
          metadata: { userId: req.user!.id.toString() },
        });

        return res.json({ url: session.url });
      } catch (err: any) {
        console.error("Stripe checkout error:", err);
        return res.status(500).json({
          message: "Erreur lors de la création de la session de paiement",
          detail: err?.message,
          code: err?.code,
        });
      }
    }
  );

  // Stripe webhook
  app.post("/api/stripe/webhook", async (req: Request, res: Response) => {
    if (!stripe || !isStripeConfigured) {
      return res.status(200).json({ received: true });
    }

    let event: Stripe.Event;
    try {
      const sig = req.headers["stripe-signature"] as string;
      event = stripe.webhooks.constructEvent(
        req.rawBody as any,
        sig,
        STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).json({ message: "Signature webhook invalide" });
    }

    try {
      switch (event.type) {
        case "customer.subscription.created":
        case "customer.subscription.updated": {
          const subscription = event.data.object as Stripe.Subscription;
          const customerId = subscription.customer as string;
          const priceIdFromStripe = subscription.items.data[0]?.price?.id;
          const plan =
            priceIdFromStripe === STRIPE_PRICE_TSN_ANNUAL ? "tsn_annual" :
            priceIdFromStripe === STRIPE_PRICE_ANNUAL ? "annual" : "monthly";
          const tool = plan === "tsn_annual" ? "tsn" : "je";

          // Chercher d'abord par stripe_subscription_id (le plus précis)
          let sub = await storage.getSubscriptionByStripeSubscriptionId(subscription.id);
          // Sinon chercher par customer_id + tool
          if (!sub) {
            const allSubs = await storage.getSubscriptionsByUserId ? null : null;
            const byCustomer = await storage.getSubscriptionByStripeCustomerId(customerId);
            if (byCustomer) {
              // Si le tool correspond ou si c'est le seul abonnement
              if (!byCustomer.tool || byCustomer.tool === tool) {
                sub = byCustomer;
              } else {
                // Chercher dans tous les abonnements de cet utilisateur
                const userSubs = await storage.getSubscriptionsByUserId(byCustomer.userId);
                sub = userSubs.find(s => s.tool === tool) ||
                      userSubs.find(s => s.stripeCustomerId === customerId && !s.stripeSubscriptionId);
              }
            }
          }

          if (sub) {
            await storage.updateSubscription(sub.id, {
              stripeSubscriptionId: subscription.id,
              status: subscription.status === "active" ? "active" : subscription.status,
              plan,
              tool,
              currentPeriodEnd: new Date(
                (subscription as any).current_period_end * 1000
              ).toISOString(),
            });
          }
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          const sub = await storage.getSubscriptionByStripeSubscriptionId(
            subscription.id
          );
          if (sub) {
            await storage.updateSubscription(sub.id, { status: "canceled" });
          }
          break;
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;
          const customerId = invoice.customer as string;
          const sub = await storage.getSubscriptionByStripeCustomerId(customerId);
          if (sub) {
            await storage.updateSubscription(sub.id, { status: "past_due" });
          }
          break;
        }
      }
    } catch (err: any) {
      console.error("Webhook processing error:", err);
    }

    return res.status(200).json({ received: true });
  });

  // Stripe customer portal
  app.get(
    "/api/stripe/portal",
    requireAuth as any,
    async (req: AuthRequest, res: Response) => {
      if (!stripe || !isStripeConfigured) {
        return res.status(503).json({
          message: "Configuration Stripe en cours. Veuillez réessayer ultérieurement.",
        });
      }

      try {
        const sub = await storage.getSubscriptionByUserId(req.user!.id);
        if (!sub?.stripeCustomerId) {
          return res.status(404).json({
            message: "Aucun abonnement Stripe trouvé",
          });
        }

        const origin = `${req.protocol}://${req.get("host")}`;
        const token = req.query.token as string;

        const portalSession = await stripe.billingPortal.sessions.create({
          customer: sub.stripeCustomerId,
          return_url: `${origin}/#/dashboard?token=${token}`,
        });

        return res.json({ url: portalSession.url });
      } catch (err: any) {
        console.error("Stripe portal error:", err);
        return res.status(500).json({
          message: "Erreur lors de l'accès au portail de gestion",
        });
      }
    }
  );

  // ── Protected Tool Route ───────────────────────────────

  app.get(
    "/api/tool",
    requireAuth as any,
    requireSubscription as any,
    (req: AuthRequest, res: Response) => {
      if (!eqrsToolHtml) {
        return res.status(500).json({ message: "Outil EQRS non disponible" });
      }

      res.setHeader("X-Frame-Options", "SAMEORIGIN");
      res.setHeader(
        "Content-Security-Policy",
        "default-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: https://fonts.googleapis.com https://fonts.gstatic.com https://cdnjs.cloudflare.com https://unpkg.com"
      );
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      res.setHeader("Content-Type", "text/html; charset=utf-8");

      return res.send(protectToolHtml(eqrsToolHtml));
    }
  );

  // ── Protected TSN Tool Route ─────────────────────────────

  app.get(
    "/api/tsn-tool",
    requireAuth as any,
    requireTsnSubscription as any,
    (req: AuthRequest, res: Response) => {
      if (!tsnToolHtml) {
        return res.status(500).json({ message: "Outil TSN non disponible" });
      }

      res.setHeader("X-Frame-Options", "SAMEORIGIN");
      res.setHeader(
        "Content-Security-Policy",
        "default-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: https://fonts.googleapis.com https://fonts.gstatic.com"
      );
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      res.setHeader("Content-Type", "text/html; charset=utf-8");

      return res.send(protectToolHtml(tsnToolHtml));
    }
  );

  // ── Dev route: reset password ──────────
  if (!isStripeConfigured) {
    app.post("/api/dev/reset-password", async (req: Request, res: Response) => {
      try {
        const { email, newPassword, secret } = req.body;
        if (secret !== "gmep-admin-2026") return res.status(403).json({ message: "Accès refusé" });
        const user = await storage.getUserByEmail(email);
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
        const hash = await bcrypt.hash(newPassword, 12);
        await storage.updateUserPassword(email, hash);
        return res.json({ message: "Mot de passe modifié" });
      } catch (err: any) {
        return res.status(500).json({ message: err.message });
      }
    });
  }

  // ── Dev route: manually activate subscription ───
  if (!isStripeConfigured) {
    app.post(
      "/api/dev/activate",
      requireAuth as any,
      async (req: AuthRequest, res: Response) => {
        const plan = (req.body && req.body.plan) ? req.body.plan : "monthly";
        const tool = plan === "tsn_annual" ? "tsn" : "je";
        const sub = await storage.activateSubscriptionForUserAndTool(req.user!.id, plan, tool);
        return res.json({
          message: "Abonnement activé (mode développement)",
          subscription: sub,
        });
      }
    );
  }

  return httpServer;
}
