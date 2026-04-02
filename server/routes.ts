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
const STRIPE_WEBHOOK_SECRET =
  process.env.STRIPE_WEBHOOK_SECRET || "whsec_placeholder";

// ── Auth middleware ─────────────────────────────────────
interface AuthRequest extends Request {
  user?: { id: number; email: string; name: string; createdAt: string };
}

function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token =
    (req.query.token as string) || req.headers["x-auth-token"] as string;

  if (!token) {
    return res.status(401).json({ message: "Authentification requise" });
  }

  const session = storage.getSessionByToken(token);
  if (!session) {
    return res.status(401).json({ message: "Session invalide ou expirée" });
  }

  if (new Date(session.expiresAt) < new Date()) {
    storage.deleteSession(token);
    return res.status(401).json({ message: "Session expirée, veuillez vous reconnecter" });
  }

  const user = storage.getUser(session.userId);
  if (!user) {
    return res.status(401).json({ message: "Utilisateur introuvable" });
  }

  req.user = storage.toSafeUser(user) as any;
  next();
}

function requireSubscription(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({ message: "Authentification requise" });
  }

  const sub = storage.getSubscriptionByUserId(req.user.id);
  if (!sub || (sub.status !== "active" && sub.status !== "trialing")) {
    return res
      .status(403)
      .json({ message: "Abonnement actif requis pour accéder à cet outil" });
  }
  // Check if trial has expired
  if (sub.status === "trialing" && sub.currentPeriodEnd) {
    if (new Date(sub.currentPeriodEnd) < new Date()) {
      return res
        .status(403)
        .json({ message: "Votre période d'essai gratuit de 14 jours est terminée. Veuillez souscrire un abonnement pour continuer." });
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

  // ── Password reset codes (in-memory, expire after 15 min) ──
  const resetCodes = new Map<string, { code: string; expiresAt: number }>();

  // Forgot password - generate code
  app.post("/api/auth/forgot-password", (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "E-mail requis" });

    const user = storage.getUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists - still return success
      return res.json({ message: "Si un compte existe avec cet e-mail, un code de réinitialisation a été généré." });
    }

    // Generate 6-digit code
    const code = String(Math.floor(100000 + Math.random() * 900000));
    resetCodes.set(email, { code, expiresAt: Date.now() + 15 * 60 * 1000 });

    // Log the code (in production, this would be sent by email)
    console.log(`[PASSWORD RESET] Code for ${email}: ${code}`);

    return res.json({ 
      message: "Si un compte existe avec cet e-mail, un code de réinitialisation a été généré.",
      // In dev/demo mode, return the code directly (remove in production with real email)
      _code: code
    });
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

      const user = storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      const hash = await bcrypt.hash(newPassword, 12);
      (user as any).passwordHash = hash;

      // Persist to disk
      const fs = require("fs");
      const dbPath = require("path").join(process.cwd(), "db.json");
      if (fs.existsSync(dbPath)) {
        const db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
        const idx = db.users.findIndex((u: any) => u.email === email);
        if (idx >= 0) {
          db.users[idx].passwordHash = hash;
          fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
        }
      }

      // Remove used code
      resetCodes.delete(email);

      return res.json({ message: "Mot de passe modifié avec succès" });
    } catch (err: any) {
      return res.status(500).json({ message: "Erreur interne" });
    }
  });

  // Health check
  app.get("/api/health", (req: Request, res: Response) => {
    try {
      const testUser = storage.getUserByEmail("health@test.com");
      res.json({ 
        status: "ok", 
        time: new Date().toISOString(), 
        dbWorks: true,
        stripeConfigured: isStripeConfigured,
        hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
        stripeKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 10) || "not set",
        hasPriceMonthly: !!process.env.STRIPE_PRICE_MONTHLY,
        hasPriceAnnual: !!process.env.STRIPE_PRICE_ANNUAL,
        hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
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

      const existing = storage.getUserByEmail(email);
      if (existing) {
        return res
          .status(409)
          .json({ message: "Un compte avec cet e-mail existe déjà" });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const user = storage.createUser(email, passwordHash, name);

      // Auto-login: create session
      // Create 14-day free trial subscription
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 14);
      storage.createSubscription(user.id, {
        status: "trialing",
        plan: "trial",
        currentPeriodEnd: trialEnd.toISOString(),
      });

      const token = crypto.randomUUID();
      const expiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ).toISOString();
      storage.createSession(token, user.id, expiresAt);

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

      const user = storage.getUserByEmail(email);
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
      storage.deleteExpiredSessions();

      const token = crypto.randomUUID();
      const expiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ).toISOString();
      storage.createSession(token, user.id, expiresAt);

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
    (req: AuthRequest, res: Response) => {
      const sub = storage.getSubscriptionByUserId(req.user!.id);
      return res.json({
        user: req.user,
        subscription: sub || null,
      });
    }
  );

  // Logout
  app.post(
    "/api/auth/logout",
    requireAuth as any,
    (req: AuthRequest, res: Response) => {
      const token =
        (req.query.token as string) || req.headers["x-auth-token"] as string;
      if (token) {
        storage.deleteSession(token);
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
          plan === "annual" ? STRIPE_PRICE_ANNUAL : STRIPE_PRICE_MONTHLY;

        // Get or create Stripe customer
        let sub = storage.getSubscriptionByUserId(req.user!.id);
        let customerId = sub?.stripeCustomerId;

        if (!customerId) {
          const customer = await stripe.customers.create({
            email: req.user!.email,
            name: req.user!.name,
            metadata: { userId: req.user!.id.toString() },
          });
          customerId = customer.id;

          if (sub) {
            storage.updateSubscription(sub.id, {
              stripeCustomerId: customerId,
            });
          } else {
            sub = storage.createSubscription(req.user!.id, {
              stripeCustomerId: customerId,
            });
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
          const sub = storage.getSubscriptionByStripeCustomerId(customerId);

          if (sub) {
            const plan =
              subscription.items.data[0]?.price?.id === STRIPE_PRICE_ANNUAL
                ? "annual"
                : "monthly";
            storage.updateSubscription(sub.id, {
              stripeSubscriptionId: subscription.id,
              status: subscription.status === "active" ? "active" : subscription.status,
              plan,
              currentPeriodEnd: new Date(
                subscription.current_period_end * 1000
              ).toISOString(),
            });
          }
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          const sub = storage.getSubscriptionByStripeSubscriptionId(
            subscription.id
          );
          if (sub) {
            storage.updateSubscription(sub.id, { status: "canceled" });
          }
          break;
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;
          const customerId = invoice.customer as string;
          const sub = storage.getSubscriptionByStripeCustomerId(customerId);
          if (sub) {
            storage.updateSubscription(sub.id, { status: "past_due" });
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
        const sub = storage.getSubscriptionByUserId(req.user!.id);
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
        "default-src 'self' 'unsafe-inline' 'unsafe-eval'"
      );
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      res.setHeader("Content-Type", "text/html; charset=utf-8");

      return res.send(protectToolHtml(eqrsToolHtml));
    }
  );

  // ── Dev route: reset password ──────────
  if (!isStripeConfigured) {
    app.post("/api/dev/reset-password", async (req: Request, res: Response) => {
      try {
        const { email, newPassword, secret } = req.body;
        if (secret !== "gmep-admin-2026") return res.status(403).json({ message: "Accès refusé" });
        const user = storage.getUserByEmail(email);
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
        const hash = await bcrypt.hash(newPassword, 12);
        (user as any).passwordHash = hash;
        const fs = require("fs");
        const dbPath = require("path").join(process.cwd(), "db.json");
        if (fs.existsSync(dbPath)) {
          const db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
          const idx = db.users.findIndex((u: any) => u.email === email);
          if (idx >= 0) { db.users[idx].passwordHash = hash; fs.writeFileSync(dbPath, JSON.stringify(db, null, 2)); }
        }
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
      (req: AuthRequest, res: Response) => {
        const plan = (req.body && req.body.plan) ? req.body.plan : "monthly";
        const sub = storage.activateSubscriptionForUser(req.user!.id, plan);
        return res.json({
          message: "Abonnement activé (mode développement)",
          subscription: sub,
        });
      }
    );
  }

  return httpServer;
}
