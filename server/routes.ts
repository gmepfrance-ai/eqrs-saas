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

// Load Rabattement tool HTML at startup
let rabattementToolHtml = "";
try {
  rabattementToolHtml = fs.readFileSync(
    path.resolve(process.cwd(), "rabattement-tool.html"),
    "utf-8"
  );
} catch (e) {
  console.error("Warning: Could not load rabattement-tool.html", e);
}

// Load EQRS V31.05 + ECOTOX V8 tool HTML at startup (NEW V8 calculator with ecotoxicology module)
let eqrsV31EcotoxToolHtml = "";
try {
  eqrsV31EcotoxToolHtml = fs.readFileSync(
    path.resolve(process.cwd(), "eqrs-v31-ecotox-tool.html"),
    "utf-8"
  );
} catch (e) {
  console.error("Warning: Could not load eqrs-v31-ecotox-tool.html", e);
}

// Load Schéma Conceptuel tool HTML at startup
let schemaConceptuelToolHtml = "";
try {
  schemaConceptuelToolHtml = fs.readFileSync(
    path.resolve(process.cwd(), "schema-conceptuel-tool.html"),
    "utf-8"
  );
} catch (e) {
  console.error("Warning: Could not load schema-conceptuel-tool.html", e);
}

// Load Piézomètres tool HTML at startup
let piezometresToolHtml = "";
try {
  piezometresToolHtml = fs.readFileSync(
    path.resolve(process.cwd(), "piezometres-tool.html"),
    "utf-8"
  );
} catch (e) {
  console.error("Warning: Could not load piezometres-tool.html", e);
}

// Load MSP GMEP tool HTML at startup
let mspToolHtml = "";
try {
  mspToolHtml = fs.readFileSync(
    path.resolve(process.cwd(), "msp-tool.html"),
    "utf-8"
  );
} catch (e) {
  console.error("Warning: Could not load msp-tool.html", e);
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
const STRIPE_PRICE_RABATTEMENT_ANNUAL =
  process.env.STRIPE_PRICE_RABATTEMENT_ANNUAL || "price_1TZT293A2g3lkch9bGF7hcgA";
const STRIPE_PRICE_EQRS_V31_ECOTOX_MONTHLY =
  process.env.STRIPE_PRICE_EQRS_V31_ECOTOX_MONTHLY || "";
const STRIPE_PRICE_SCHEMA_CONCEPTUEL_ANNUAL =
  process.env.STRIPE_PRICE_SCHEMA_CONCEPTUEL_ANNUAL || "";
const STRIPE_PRICE_PIEZOMETRES_ANNUAL =
  process.env.STRIPE_PRICE_PIEZOMETRES_ANNUAL || "";
const STRIPE_PRICE_MSP_MONTHLY =
  process.env.STRIPE_PRICE_MSP_MONTHLY || "price_1TlY2z3A2g3lkch9xdWCjChC";
const STRIPE_PRICE_MSP_ANNUAL =
  process.env.STRIPE_PRICE_MSP_ANNUAL || "price_1TlY523A2g3lkch9r3B65h5U";
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

// Comptes admin/exemptés de la limite d'essai
const ADMIN_EMAILS = new Set([
  "gmep.france@gmail.com",
]);
function isAdminEmail(email?: string | null): boolean {
  return !!email && ADMIN_EMAILS.has(email.toLowerCase());
}

// Helper : page HTML de redirection automatique vers une page subscribe quand l'essai est expiré
function trialExpiredHtml(subscribePath: string, toolName: string, duration: number): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Période d'essai terminée — G.M.E.P</title>
  <meta http-equiv="refresh" content="3;url=${subscribePath}">
  <style>
    body { font-family: Inter, -apple-system, sans-serif; background:#0e2f44; color:#fff; display:flex; align-items:center; justify-content:center; min-height:100vh; margin:0; padding:24px; }
    .card { max-width:520px; background:#1a5276; padding:40px; border-radius:16px; text-align:center; box-shadow:0 20px 60px rgba(0,0,0,0.4); }
    h1 { font-size:24px; margin:0 0 16px; }
    p { font-size:16px; line-height:1.6; margin:12px 0; color:#cce0f0; }
    .badge { display:inline-block; background:#fff2cc; color:#0e2f44; padding:6px 14px; border-radius:20px; font-weight:600; font-size:13px; margin-bottom:20px; }
    .btn { display:inline-block; background:#39e07a; color:#0e2f44; text-decoration:none; padding:14px 28px; border-radius:8px; font-weight:700; margin-top:24px; font-size:16px; }
    .small { font-size:13px; color:#9bb8c8; margin-top:20px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Essai terminé</div>
    <h1>⏰ Votre période d'essai de ${duration} jours est terminée</h1>
    <p>Merci d'avoir testé <strong>${toolName}</strong>.</p>
    <p>Pour continuer à utiliser cet outil sans interruption, souscrivez à un abonnement.</p>
    <a href="${subscribePath}" class="btn">Souscrire maintenant →</a>
    <p class="small">Redirection automatique dans 3 secondes...</p>
  </div>
</body>
</html>`;
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
      // Marquer la subscription comme expirée en BDD
      try { await storage.updateSubscription(sub.id, { status: "expired" }); } catch {}
      // Rediriger l'utilisateur vers la page d'abonnement EQRS J&E
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(403).send(trialExpiredHtml("/#/tarifs", "EQRS Johnson & Ettinger", 14));
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
  // Bypass admin
  if (isAdminEmail((req.user as any).email)) return next();
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
      try { await storage.updateSubscription(tsnSub.id, { status: "expired" }); } catch {}
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(403).send(trialExpiredHtml("/#/subscribe-tsn", "TSN — Transfert Sol-Nappe", 8));
    }
  }
  next();
}

// Middleware spécifique au tool Rabattement de nappe
async function requireRabattementSubscription(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) return res.status(401).json({ message: "Authentification requise" });
  // Bypass admin
  if (isAdminEmail((req.user as any).email)) return next();
  const subs = await storage.getSubscriptionsByUserId(req.user.id);
  const rabSub = subs.find(
    (s) => (s.tool === "rabattement" || s.tool === "bundle") &&
           (s.status === "active" || s.status === "trialing")
  );
  if (!rabSub) {
    return res.status(403).json({ message: "Abonnement Rabattement de nappe requis pour accéder à cet outil" });
  }
  if (rabSub.status === "trialing" && rabSub.currentPeriodEnd) {
    if (new Date(rabSub.currentPeriodEnd) < new Date()) {
      try { await storage.updateSubscription(rabSub.id, { status: "expired" }); } catch {}
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(403).send(trialExpiredHtml("/#/subscribe-rabattement", "Rabattement V15.85", 8));
    }
  }
  next();
}

// Middleware spécifique au tool MSP — Modélisation Sources de Pollution
async function requireMspSubscription(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) return res.status(401).json({ message: "Authentification requise" });
  if (isAdminEmail((req.user as any).email)) return next();
  const subs = await storage.getSubscriptionsByUserId(req.user.id);
  const mspSub = subs.find(
    (s) => s.tool === "msp" && (s.status === "active" || s.status === "trialing")
  );
  if (!mspSub) {
    return res.status(403).json({ message: "Abonnement MSP requis pour accéder à cet outil" });
  }
  if (mspSub.status === "trialing" && mspSub.currentPeriodEnd) {
    if (new Date(mspSub.currentPeriodEnd) < new Date()) {
      try { await storage.updateSubscription(mspSub.id, { status: "expired" }); } catch {}
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(403).send(trialExpiredHtml("/#/subscribe-msp", "MSP — Modélisation Sources de Pollution des Sols", 8));
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

// Injecte le mode essai dans l'outil TSN : bannière + limitation à 3 molécules (PCE, TCE, Benzène)
function injectTsnTrialMode(html: string, daysLeft: number, token: string): string {
  const subscribeUrl = `/#/subscribe-tsn`;
  const banner = `
<div id="tsn-trial-banner" style="position:fixed;top:0;left:0;right:0;z-index:99999;background:#1e8449;color:#fff;padding:10px 20px;display:flex;align-items:center;justify-content:space-between;font-family:sans-serif;font-size:13px;box-shadow:0 2px 8px rgba(0,0,0,0.3)">
  <span>&#9888;&#65039; <strong>Mode Essai Gratuit</strong> — ${daysLeft} jour${daysLeft > 1 ? "s" : ""} restant${daysLeft > 1 ? "s" : ""} — Limité à 3 molécules (PCE, TCE, Benzène)</span>
  <a href="${subscribeUrl}" style="background:#fff;color:#1e8449;padding:5px 14px;border-radius:20px;font-weight:700;text-decoration:none;font-size:12px;">S'abonner — 850€ HT/an</a>
</div>
<style>body { padding-top: 46px !important; }</style>`;

  // Limiter à 3 molécules : surveiller le select via setInterval — simple et robuste
  // N'interfère PAS avec l'initialisation de l'outil (pas de Object.defineProperty)
  const trialScript = `
<script>
(function() {
  var TRIAL_MOLS = ["Perchloroéthylène (PCE)", "Trichloroéthylène (TCE)", "Benzène"];
  var _limited = false;

  function limitMolecules() {
    var sel = document.getElementById('sel-polluant');
    if (!sel || sel.options.length === 0) return false;
    if (sel.options.length <= 3) { _limited = true; return true; } // déjà limité
    // Supprimer toutes les options sauf les 3 molécules d'essai
    var toRemove = [];
    for (var i = 0; i < sel.options.length; i++) {
      var txt = sel.options[i].text.trim();
      var keep = TRIAL_MOLS.some(function(m) { return txt === m; });
      if (!keep) toRemove.push(i);
    }
    for (var j = toRemove.length - 1; j >= 0; j--) sel.remove(toRemove[j]);
    // Supprimer les optgroups vides
    var groups = sel.querySelectorAll('optgroup');
    groups.forEach(function(g) { if (g.children.length === 0) g.remove(); });
    // Sélectionner PCE par défaut
    if (sel.options.length > 0 && !sel.value) sel.selectedIndex = 0;
    // Déclencher le changement pour mettre à jour les paramètres
    sel.dispatchEvent(new Event('change'));
    _limited = true;
    return true;
  }

  // Surveiller toutes les 200ms jusqu'à ce que le select soit peuplé et limité
  var _tries = 0;
  var _interval = setInterval(function() {
    _tries++;
    if (limitMolecules() || _tries > 50) clearInterval(_interval);
  }, 200);

  // Re-vérifier après chaque clic sur le modal ("Continuer avec l'essai")
  document.addEventListener('click', function(e) {
    if (e.target && (e.target.id === 'lic-trial-btn' || e.target.closest && e.target.closest('#lic-trial-btn'))) {
      setTimeout(limitMolecules, 300);
      setTimeout(limitMolecules, 800);
    }
  }, true);
})();
</script>`;

  // Bannière dans <body>, script dans </body> (après tout le code de l'outil)
  let result = html.replace("<body>", "<body>\n" + banner);
  result = result.replace("</body>", trialScript + "\n</body>");
  return result;
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
        hasPriceTsnAnnual: !!process.env.STRIPE_PRICE_TSN_ANNUAL || true,
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

  // ── Admin Stats (essais / conversions) ─────────────────
  // Middleware admin : exige token + email admin
  async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
    await requireAuth(req, res, () => {
      if (!isAdminEmail(req.user?.email)) {
        return res.status(403).json({ message: "Accès refusé : réservé aux administrateurs" });
      }
      next();
    });
  }

  // Endpoint JSON : statistiques complètes
  app.get("/api/admin/stats", requireAdmin as any, async (req: AuthRequest, res: Response) => {
    try {
      const anyStorage = storage as any;
      if (typeof anyStorage.getAdminStats !== "function") {
        return res.status(501).json({ message: "Stats admin disponibles uniquement avec PostgreSQL" });
      }
      const stats = await anyStorage.getAdminStats();
      res.json(stats);
    } catch (err: any) {
      console.error("[ADMIN STATS ERROR]", err);
      res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
  });

  // Page HTML dashboard (sert l'app, l'auth se fait côté JS)
  app.get("/admin-stats", (_req: Request, res: Response) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    res.send(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>Dashboard Admin — GMEP</title>
  <style>
    *{box-sizing:border-box}
    body{margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f4f6f8;color:#0e2f44}
    header{background:#1a5276;color:#fff;padding:20px 32px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
    header h1{margin:0;font-size:20px}
    header .sub{font-size:13px;color:#cfe2ec}
    main{padding:24px 32px;max-width:1400px;margin:0 auto}
    .login{max-width:420px;margin:80px auto;background:#fff;padding:32px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.08)}
    .login h2{margin-top:0;color:#1a5276}
    .login input{width:100%;padding:10px 12px;border:1px solid #d0d7de;border-radius:6px;font-size:14px;margin:6px 0 14px}
    .login button{background:#1a5276;color:#fff;border:none;padding:11px 24px;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;width:100%}
    .login button:hover{background:#0e2f44}
    .err{color:#c0392b;font-size:13px;margin-top:8px}
    .kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-bottom:24px}
    .kpi{background:#fff;padding:18px;border-radius:8px;border-left:4px solid #1a5276;box-shadow:0 1px 3px rgba(0,0,0,0.05)}
    .kpi .label{font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px}
    .kpi .value{font-size:28px;font-weight:bold;color:#1a5276;margin-top:6px}
    .kpi.green{border-left-color:#39e07a}
    .kpi.green .value{color:#0e6b3c}
    .kpi.orange{border-left-color:#e67e22}
    .kpi.orange .value{color:#a04a14}
    .kpi.red{border-left-color:#c0392b}
    .kpi.red .value{color:#922b1f}
    section{background:#fff;padding:20px;border-radius:8px;margin-bottom:18px;box-shadow:0 1px 3px rgba(0,0,0,0.05)}
    section h2{margin-top:0;color:#1a5276;font-size:16px;border-bottom:2px solid #fff2cc;padding-bottom:8px}
    table{width:100%;border-collapse:collapse;font-size:13px}
    th,td{text-align:left;padding:8px 10px;border-bottom:1px solid #e9eef2}
    th{background:#f8fafc;color:#1a5276;font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:0.3px}
    tr:hover td{background:#fafbfc}
    .badge{display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600}
    .badge.trialing{background:#fff2cc;color:#7d6608}
    .badge.active{background:#d4edda;color:#155724}
    .badge.expired{background:#f8d7da;color:#721c24}
    .badge.canceled{background:#e9ecef;color:#495057}
    .small{font-size:12px;color:#64748b}
    button.refresh{background:#1a5276;color:#fff;border:none;padding:8px 18px;border-radius:6px;font-size:13px;cursor:pointer}
    button.refresh:hover{background:#0e2f44}
    button.logout{background:transparent;color:#fff;border:1px solid #fff;padding:6px 14px;border-radius:6px;font-size:12px;cursor:pointer}
  </style>
</head>
<body>
<div id="app"></div>
<script>
(function(){
  var TOKEN_KEY = 'gmep_admin_token';
  var app = document.getElementById('app');

  function fmt(d){ if(!d) return ''; var x=new Date(d); return x.toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}); }
  function fmtDate(d){ if(!d) return ''; var x=new Date(d); return x.toLocaleDateString('fr-FR'); }
  function daysLeft(end){ if(!end) return ''; var ms=new Date(end)-new Date(); var d=Math.ceil(ms/86400000); return d>0?d+' j':'expiré'; }
  function toolLabel(t){ var m={je:'EQRS V7 J&E',eqrs_v31:'EQRS V31+ECOTOX',tsn:'TSN',rabattement:'Rabattement V15.85',schema:'Schéma Conceptuel',bundle:'Bundle'}; return m[t]||t||'?'; }

  function showLogin(errMsg){
    app.innerHTML = '<div class="login">' +
      '<h2>Dashboard Admin GMEP</h2>' +
      '<p class="small">Accès réservé à gmep.france@gmail.com</p>' +
      '<input id="em" type="email" placeholder="Email" autocomplete="username"/>' +
      '<input id="pw" type="password" placeholder="Mot de passe" autocomplete="current-password"/>' +
      '<button onclick="doLogin()">Se connecter</button>' +
      (errMsg?'<div class="err">'+errMsg+'</div>':'') +
    '</div>';
  }

  window.doLogin = async function(){
    var em = document.getElementById('em').value.trim();
    var pw = document.getElementById('pw').value;
    try{
      var r = await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:em,password:pw})});
      var d = await r.json();
      if(!r.ok){ showLogin(d.message||'Erreur'); return; }
      if(em.toLowerCase()!=='gmep.france@gmail.com'){ showLogin('Accès réservé à l’administrateur.'); return; }
      localStorage.setItem(TOKEN_KEY, d.token);
      loadDashboard();
    }catch(e){ showLogin('Erreur réseau : '+e.message); }
  };

  window.doLogout = function(){ localStorage.removeItem(TOKEN_KEY); showLogin(null); };

  async function loadDashboard(){
    var token = localStorage.getItem(TOKEN_KEY);
    if(!token){ showLogin(null); return; }
    app.innerHTML = '<div style="padding:60px;text-align:center;color:#64748b">Chargement…</div>';
    try{
      var r = await fetch('/api/admin/stats',{headers:{'x-auth-token':token}});
      if(r.status===401||r.status===403){ localStorage.removeItem(TOKEN_KEY); showLogin('Session expirée ou non autorisée.'); return; }
      var data = await r.json();
      renderDashboard(data);
    }catch(e){ app.innerHTML='<div style="padding:60px;color:#c0392b">Erreur : '+e.message+'</div>'; }
  }

  function renderDashboard(d){
    var html = '<header>' +
      '<div><h1>Dashboard Admin GMEP</h1><div class="sub">Généré le '+fmt(d.generated_at)+'</div></div>' +
      '<div><button class="refresh" onclick="loadDashboard()">Rafraîchir</button> <button class="logout" onclick="doLogout()">Déconnexion</button></div>' +
    '</header><main>';

    html += '<div class="kpis">' +
      '<div class="kpi"><div class="label">Utilisateurs inscrits</div><div class="value">'+d.total_users+'</div></div>' +
      '<div class="kpi"><div class="label">Total essais démarrés</div><div class="value">'+d.total_trials_started+'</div></div>' +
      '<div class="kpi orange"><div class="label">Essais en cours</div><div class="value">'+d.total_active_trials+'</div></div>' +
      '<div class="kpi red"><div class="label">Essais expirés</div><div class="value">'+d.total_expired_trials+'</div></div>' +
      '<div class="kpi green"><div class="label">Abonnements payants</div><div class="value">'+d.total_paying+'</div></div>' +
      '<div class="kpi green"><div class="label">Taux conversion</div><div class="value">'+d.conversion_rate_pct+' %</div></div>' +
    '</div>';

    // Essais 14 derniers jours par outil
    html += '<section><h2>Essais démarrés ces 14 derniers jours par outil</h2>';
    if(d.trials_last_14_days.length===0){ html += '<p class="small">Aucun essai démarré sur cette période.</p>'; }
    else { html += '<table><thead><tr><th>Outil</th><th>Nb essais</th></tr></thead><tbody>';
      d.trials_last_14_days.forEach(function(r){ html += '<tr><td>'+toolLabel(r.tool)+'</td><td><strong>'+r.started_14d+'</strong></td></tr>'; });
      html += '</tbody></table>'; }
    html += '</section>';

    // Répartition par outil et statut
    html += '<section><h2>Répartition par outil et statut</h2><table><thead><tr><th>Outil</th><th>Statut</th><th>Nombre</th></tr></thead><tbody>';
    d.by_tool_status.forEach(function(r){ html += '<tr><td>'+toolLabel(r.tool)+'</td><td><span class="badge '+r.status+'">'+r.status+'</span></td><td>'+r.count+'</td></tr>'; });
    html += '</tbody></table></section>';

    // Essais en cours détaillés
    html += '<section><h2>Essais en cours ('+d.active_trials.length+')</h2>';
    if(d.active_trials.length===0){ html += '<p class="small">Aucun essai actif en ce moment.</p>'; }
    else { html += '<table><thead><tr><th>User ID</th><th>Outil</th><th>Plan</th><th>Démarré</th><th>Fin</th><th>Jours restants</th></tr></thead><tbody>';
      d.active_trials.forEach(function(r){ html += '<tr><td>#'+r.user_id+'</td><td>'+toolLabel(r.tool)+'</td><td class="small">'+(r.plan||'')+'</td><td>'+fmtDate(r.created_at)+'</td><td>'+fmtDate(r.current_period_end)+'</td><td><strong>'+daysLeft(r.current_period_end)+'</strong></td></tr>'; });
      html += '</tbody></table>'; }
    html += '</section>';

    // Détails utilisateurs
    html += '<section><h2>Détails utilisateurs ('+d.detailed_users.length+' lignes)</h2><table><thead><tr><th>Email</th><th>Nom</th><th>Inscrit</th><th>Outil</th><th>Statut</th><th>Fin essai/abo</th><th>Paid</th></tr></thead><tbody>';
    d.detailed_users.forEach(function(r){
      html += '<tr><td><strong>'+(r.email||'')+'</strong></td><td>'+(r.name||'')+'</td><td>'+fmtDate(r.user_created_at)+'</td><td>'+toolLabel(r.tool)+'</td><td>'+(r.status?'<span class="badge '+r.status+'">'+r.status+'</span>':'<span class="small">aucun</span>')+'</td><td>'+fmtDate(r.current_period_end)+'</td><td>'+(r.has_paid?'✓':'')+'</td></tr>';
    });
    html += '</tbody></table></section>';

    html += '</main>';
    app.innerHTML = html;
  }

  // Init
  if(localStorage.getItem(TOKEN_KEY)){ loadDashboard(); } else { showLogin(null); }
})();
</script>
</body>
</html>`);
  });

  // Endpoint trigger pour cron : envoi email digest (protégé par secret URL)
  app.get("/api/admin/send-daily-digest", async (req: Request, res: Response) => {
    const secret = req.query.secret as string;
    const expected = process.env.ADMIN_DIGEST_SECRET || "gmep-digest-2026-secret";
    if (secret !== expected) {
      return res.status(403).json({ message: "Secret invalide" });
    }
    try {
      const anyStorage = storage as any;
      if (typeof anyStorage.getAdminStats !== "function") {
        return res.status(501).json({ message: "Stats admin disponibles uniquement avec PostgreSQL" });
      }
      const stats = await anyStorage.getAdminStats();
      const resendKey = process.env.RESEND_API_KEY;
      if (!resendKey) {
        return res.status(503).json({ message: "Resend non configuré" });
      }
      const toolLabels: Record<string,string> = {je:'EQRS V7 J&E',eqrs_v31:'EQRS V31+ECOTOX',tsn:'TSN',rabattement:'Rabattement V15.85',schema:'Schéma Conceptuel',piezometres:'Piézomètres v2.9c',msp:'MSP Pollution des Sols',bundle:'Bundle'};
      const tl = (t:string)=>toolLabels[t]||t||'?';
      let rowsTools = '';
      for (const r of stats.trials_last_14_days) {
        rowsTools += `<tr><td style="padding:6px 10px;border-bottom:1px solid #eee">${tl(r.tool)}</td><td style="padding:6px 10px;border-bottom:1px solid #eee"><strong>${r.started_14d}</strong></td></tr>`;
      }
      let rowsActive = '';
      for (const r of stats.active_trials.slice(0, 50)) {
        const left = r.current_period_end ? Math.max(0, Math.ceil((+new Date(r.current_period_end) - +new Date())/86400000)) : '';
        rowsActive += `<tr><td style="padding:6px 10px;border-bottom:1px solid #eee">#${r.user_id}</td><td style="padding:6px 10px;border-bottom:1px solid #eee">${tl(r.tool)}</td><td style="padding:6px 10px;border-bottom:1px solid #eee">${new Date(r.current_period_end).toLocaleDateString('fr-FR')}</td><td style="padding:6px 10px;border-bottom:1px solid #eee"><strong>${left} j</strong></td></tr>`;
      }
      const html = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#0e2f44;background:#f4f6f8;padding:20px">
<table style="max-width:640px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden">
<tr><td style="background:#1a5276;color:#fff;padding:20px"><h2 style="margin:0">Dashboard quotidien GMEP</h2><p style="margin:4px 0 0;font-size:12px;color:#cfe2ec">${new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p></td></tr>
<tr><td style="padding:20px">
<table style="width:100%;border-collapse:collapse">
<tr><td style="padding:10px;background:#f8fafc;border-radius:4px"><strong>${stats.total_users}</strong> utilisateurs inscrits</td><td style="padding:10px;background:#f8fafc;border-radius:4px"><strong>${stats.total_trials_started}</strong> essais démarrés</td></tr>
<tr><td style="padding:10px;background:#fff2cc;border-radius:4px"><strong>${stats.total_active_trials}</strong> essais en cours</td><td style="padding:10px;background:#f8d7da;border-radius:4px"><strong>${stats.total_expired_trials}</strong> essais expirés</td></tr>
<tr><td style="padding:10px;background:#d4edda;border-radius:4px"><strong>${stats.total_paying}</strong> abonnés payants</td><td style="padding:10px;background:#d4edda;border-radius:4px">Conversion : <strong>${stats.conversion_rate_pct}%</strong></td></tr>
</table>
<h3 style="color:#1a5276;margin-top:24px">Essais démarrés ces 14 derniers jours</h3>
<table style="width:100%;border-collapse:collapse"><thead><tr style="background:#f8fafc"><th style="text-align:left;padding:8px">Outil</th><th style="text-align:left;padding:8px">Nombre</th></tr></thead><tbody>${rowsTools||'<tr><td colspan="2" style="padding:10px;color:#64748b">Aucun essai cette période</td></tr>'}</tbody></table>
<h3 style="color:#1a5276;margin-top:24px">Essais en cours (top 50)</h3>
<table style="width:100%;border-collapse:collapse"><thead><tr style="background:#f8fafc"><th style="text-align:left;padding:8px">User</th><th style="text-align:left;padding:8px">Outil</th><th style="text-align:left;padding:8px">Fin</th><th style="text-align:left;padding:8px">Reste</th></tr></thead><tbody>${rowsActive||'<tr><td colspan="4" style="padding:10px;color:#64748b">Aucun essai actif</td></tr>'}</tbody></table>
<p style="margin-top:24px;font-size:12px;color:#64748b">Dashboard complet : <a href="https://www.gmep-france.eu/admin-stats">www.gmep-france.eu/admin-stats</a></p>
</td></tr></table></body></html>`;
      const { Resend } = require("resend");
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: "GMEP Dashboard <noreply@gmep-france.eu>",
        to: ["gmep.france@gmail.com"],
        subject: `Dashboard GMEP — ${new Date().toLocaleDateString('fr-FR')} — ${stats.total_active_trials} essais en cours, ${stats.total_paying} payants`,
        html,
      });
      res.json({ sent: true, stats: { active: stats.total_active_trials, paying: stats.total_paying } });
    } catch (err: any) {
      console.error("[DAILY DIGEST ERROR]", err);
      res.status(500).json({ message: "Erreur envoi digest", error: err.message });
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

      // ─── ACTIVATION AUTOMATIQUE DES 5 ESSAIS à l'inscription ──────────────
      // EQRS V7 Johnson & Ettinger : 14 jours
      const trial14 = new Date(); trial14.setDate(trial14.getDate() + 14);
      const trial8 = new Date(); trial8.setDate(trial8.getDate() + 8);

      // 1. EQRS V7 J&E (tool='je' ou null pour compat légacy) — 14 jours
      await storage.createSubscription(user.id, {
        status: "trialing",
        plan: "trial",
        tool: "je",
        currentPeriodEnd: trial14.toISOString(),
      });

      // 2. EQRS V31.05 + ECOTOX — 14 jours
      await storage.createSubscription(user.id, {
        status: "trialing",
        plan: "eqrs_v31_ecotox_trial",
        tool: "eqrs_v31",
        currentPeriodEnd: trial14.toISOString(),
      });

      // 3. TSN — 8 jours
      await storage.createSubscription(user.id, {
        status: "trialing",
        plan: "tsn_trial",
        tool: "tsn",
        currentPeriodEnd: trial8.toISOString(),
      });

      // 4. Rabattement V15.85 — 8 jours
      await storage.createSubscription(user.id, {
        status: "trialing",
        plan: "rabattement_trial",
        tool: "rabattement",
        currentPeriodEnd: trial8.toISOString(),
      });

      // 5. Schéma Conceptuel — 14 jours
      await storage.createSubscription(user.id, {
        status: "trialing",
        plan: "schema_conceptuel_trial",
        tool: "schema",
        currentPeriodEnd: trial14.toISOString(),
      });

      // 6. GMEP Piézomètres v2.9c — 8 jours
      await storage.createSubscription(user.id, {
        status: "trialing",
        plan: "piezometres_trial",
        tool: "piezometres",
        currentPeriodEnd: trial8.toISOString(),
      });

      const token = crypto.randomUUID();
      const expiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ).toISOString();
      await storage.createSession(token, user.id, expiresAt);

      // Email de bienvenue avec essai gratuit
      try {
        const resendKey = process.env.RESEND_API_KEY;
        if (resendKey) {
          const { Resend } = require("resend");
          const resend = new Resend(resendKey);
          await resend.emails.send({
            from: "GMEP <noreply@gmep-france.eu>",
            to: email,
            subject: "Bienvenue sur GMEP — Vos 7 essais gratuits sont activés",
            html: `
              <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:20px;">
                <div style="background:#1a365d;color:white;padding:24px;border-radius:8px 8px 0 0;text-align:center;">
                  <h2 style="margin:0;font-size:20px;">G.M.<span style="color:#39e07a;">E</span>.P</h2>
                  <p style="margin:4px 0 0;font-size:13px;opacity:0.85;">Suite logicielle environnementale — 9 outils intégrés</p>
                </div>
                <div style="background:#f8f9fa;padding:28px;border:1px solid #e2e8f0;border-radius:0 0 8px 8px;">
                  <p style="font-size:16px;">Bonjour ${name},</p>
                  <p>Votre compte GMEP a bien été créé. Tous nos <strong>9 logiciels sont activés en essai gratuit</strong>, sans engagement, sans carte bancaire.</p>
                  <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
                    <tr style="background:#e8f4fd;"><td style="padding:10px;border:1px solid #cce0f0;font-weight:bold;">Compte</td><td style="padding:10px;border:1px solid #cce0f0;">${email}</td></tr>
                    <tr><td style="padding:10px;border:1px solid #e2e8f0;font-weight:bold;">EQRS V7 Johnson &amp; Ettinger</td><td style="padding:10px;border:1px solid #e2e8f0;">14 jours — 208 € HT/mois</td></tr>
                    <tr style="background:#f8f9fa;"><td style="padding:10px;border:1px solid #e2e8f0;font-weight:bold;">EQRS V31.05 + ECOTOX V8</td><td style="padding:10px;border:1px solid #e2e8f0;">14 jours — 395 € HT/mois</td></tr>
                    <tr><td style="padding:10px;border:1px solid #e2e8f0;font-weight:bold;">TSN Transfert Sol-Nappe</td><td style="padding:10px;border:1px solid #e2e8f0;">8 jours — 1 100 € HT/an</td></tr>
                    <tr style="background:#f8f9fa;"><td style="padding:10px;border:1px solid #e2e8f0;font-weight:bold;">Rabattement V15.85</td><td style="padding:10px;border:1px solid #e2e8f0;">8 jours — 1 500 € HT/an</td></tr>
                    <tr><td style="padding:10px;border:1px solid #e2e8f0;font-weight:bold;">GMEP Piézomètres v2.9c</td><td style="padding:10px;border:1px solid #e2e8f0;">8 jours — 1 100 € HT/an</td></tr>
                    <tr style="background:#f8f9fa;"><td style="padding:10px;border:1px solid #e2e8f0;font-weight:bold;">Schéma Conceptuel</td><td style="padding:10px;border:1px solid #e2e8f0;">14 jours — 850 € HT/an</td></tr>
                    <tr><td style="padding:10px;border:1px solid #e2e8f0;font-weight:bold;">MSP — Pollution des Sols</td><td style="padding:10px;border:1px solid #e2e8f0;">8 jours — 250 € HT/mois ou 2 760 € HT/an</td></tr>
                  </table>
                  <p style="font-size:13px;color:#64748b;">À l'expiration de chaque essai, l'outil affiche une page d'avertissement et vous propose de souscrire l'abonnement correspondant. Vous restez maître du choix : aucun prélèvement automatique.</p>
                  <div style="text-align:center;margin:28px 0;">
                    <a href="https://www.gmep-france.eu/#/dashboard" style="background:#1a365d;color:white;padding:14px 32px;border-radius:6px;font-weight:bold;text-decoration:none;font-size:15px;">Accéder à mon espace</a>
                  </div>
                  <p style="font-size:13px;color:#64748b;">Pour toute question : <a href="mailto:gmep.france@gmail.com">gmep.france@gmail.com</a> — Tél. 06 07 73 72 33</p>
                  <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;">
                  <p style="font-size:11px;color:#94a3b8;text-align:center;">© 2026 SARL G.M.E.P — 9 rue de la Marne, 79400 Saint-Maixent-l'École</p>
                </div>
              </div>
            `,
          });
          console.log(`[WELCOME EMAIL] Sent to ${email}`);
        }
      } catch (emailErr: any) {
        console.error("[WELCOME EMAIL] Failed:", emailErr.message);
      }

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
    const rabattementSub = subs.find(s => s.tool === "rabattement");
      return res.json({
        user: req.user,
        subscription: sub || null,
      tsnSubscription: tsnSub || null,
      rabattementSubscription: rabattementSub || null,
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
          plan === "rabattement_annual" ? STRIPE_PRICE_RABATTEMENT_ANNUAL :
          plan === "tsn_annual" ? STRIPE_PRICE_TSN_ANNUAL :
          plan === "annual" ? STRIPE_PRICE_ANNUAL :
          plan === "eqrs_v31_ecotox_monthly" ? STRIPE_PRICE_EQRS_V31_ECOTOX_MONTHLY :
          plan === "schema_conceptuel_annual" ? STRIPE_PRICE_SCHEMA_CONCEPTUEL_ANNUAL :
          plan === "piezometres_annual" ? STRIPE_PRICE_PIEZOMETRES_ANNUAL :
          plan === "msp_monthly" ? STRIPE_PRICE_MSP_MONTHLY :
          plan === "msp_annual" ? STRIPE_PRICE_MSP_ANNUAL :
          STRIPE_PRICE_MONTHLY;


        // Déterminer le tool associé au plan
        const tool =
          plan === "rabattement_annual" ? "rabattement" :
          plan === "tsn_annual" ? "tsn" :
          plan === "eqrs_v31_ecotox_monthly" ? "eqrs_v31" :
          plan === "schema_conceptuel_annual" ? "schema" :
          plan === "piezometres_annual" ? "piezometres" :
          plan === "msp_monthly" ? "msp" :
          plan === "msp_annual" ? "msp" :
          "je";

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
          // ── Stripe Tax ───────────────────────────────────────────────────────────────────────────
          // automatic_tax: calcule TVA automatiquement selon adresse client.
          // Pour particulier FR: 20% TVA. Pour entreprise UE avec n° TVA: 0%
          // (autoliquidation). Pour hors UE: 0% (export services).
          automatic_tax: { enabled: true },
          // billing_address_collection: 'required' force la collecte de l'adresse
          // de facturation pour que Stripe puisse calculer la TVA correctement.
          billing_address_collection: "required",
          // tax_id_collection: permet aux entreprises UE d'entrer leur n° TVA
          // intracommunautaire pour bénéficier de l'autoliquidation.
          tax_id_collection: { enabled: true },
          // customer_update: stocke l'adresse et le n° TVA sur le client Stripe
          // pour les abonnements futurs.
          customer_update: { address: "auto", name: "auto" },
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
          const priceIdFromStripe = subscription.items.data[0]?.price?.id;
          const plan =
            priceIdFromStripe === STRIPE_PRICE_RABATTEMENT_ANNUAL ? "rabattement_annual" :
            priceIdFromStripe === STRIPE_PRICE_TSN_ANNUAL ? "tsn_annual" :
            (STRIPE_PRICE_EQRS_V31_ECOTOX_MONTHLY && priceIdFromStripe === STRIPE_PRICE_EQRS_V31_ECOTOX_MONTHLY) ? "eqrs_v31_ecotox_monthly" :
            (STRIPE_PRICE_SCHEMA_CONCEPTUEL_ANNUAL && priceIdFromStripe === STRIPE_PRICE_SCHEMA_CONCEPTUEL_ANNUAL) ? "schema_conceptuel_annual" :
            (STRIPE_PRICE_PIEZOMETRES_ANNUAL && priceIdFromStripe === STRIPE_PRICE_PIEZOMETRES_ANNUAL) ? "piezometres_annual" :
            priceIdFromStripe === STRIPE_PRICE_MSP_MONTHLY ? "msp_monthly" :
            priceIdFromStripe === STRIPE_PRICE_MSP_ANNUAL ? "msp_annual" :
            priceIdFromStripe === STRIPE_PRICE_ANNUAL ? "annual" : "monthly";
          const tool =
            plan === "rabattement_annual" ? "rabattement" :
            plan === "tsn_annual" ? "tsn" :
            plan === "eqrs_v31_ecotox_monthly" ? "eqrs_v31" :
            plan === "schema_conceptuel_annual" ? "schema" :
            plan === "piezometres_annual" ? "piezometres" :
            (plan === "msp_monthly" || plan === "msp_annual") ? "msp" :
            "je";

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
            const isNewActivation = sub.status !== "active" && subscription.status === "active";
            await storage.updateSubscription(sub.id, {
              stripeSubscriptionId: subscription.id,
              status: subscription.status === "active" ? "active" : subscription.status,
              plan,
              tool,
              currentPeriodEnd: new Date(
                (subscription as any).current_period_end * 1000
              ).toISOString(),
            });

            // Envoyer email d'activation uniquement lors de la première activation
            if (isNewActivation && event.type === "customer.subscription.created") {
              try {
                const user = await storage.getUser(sub.userId);
                const resendKey = process.env.RESEND_API_KEY;
                if (user && resendKey) {
                  const { Resend } = require("resend");
                  const resend = new Resend(resendKey);
                  const toolName =
                    tool === "rabattement" ? "Rabattement de nappe — Theis + Dupuit-Thiem" :
                    tool === "tsn" ? "TSN — Transfert Sol vers Nappe" :
                    "EQRS — Johnson & Ettinger";
                  const toolUrl = "https://www.gmep-france.eu/#/dashboard";
                  const planLabel =
                    plan === "rabattement_annual" ? "Annuel — 1 100 € HT/an" :
                    plan === "tsn_annual" ? "Annuel — 850 € HT/an" :
                    plan === "annual" ? "Annuel — 2 499 € HT/an" :
                    "Mensuel — 245 € HT/mois";
                  const periodEnd = new Date((subscription as any).current_period_end * 1000)
                    .toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

                  await resend.emails.send({
                    from: "GMEP <noreply@gmep-france.eu>",
                    to: user.email,
                    subject: `✅ Votre accès ${toolName} est activé`,
                    html: `
                      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:20px;">
                        <div style="background:#1a365d;color:white;padding:24px;border-radius:8px 8px 0 0;text-align:center;">
                          <h2 style="margin:0;font-size:20px;">G.M.E.P</h2>
                          <p style="margin:4px 0 0;font-size:13px;opacity:0.85;">${toolName}</p>
                        </div>
                        <div style="background:#f8f9fa;padding:28px;border:1px solid #e2e8f0;border-radius:0 0 8px 8px;">
                          <p style="font-size:16px;">Bonjour ${user.name || ""},</p>
                          <p>Votre abonnement <strong>${toolName}</strong> est maintenant <strong style="color:#1a7a3c;">actif</strong>.</p>
                          <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
                            <tr style="background:#e8f4fd;"><td style="padding:10px;border:1px solid #cce0f0;font-weight:bold;">Outil</td><td style="padding:10px;border:1px solid #cce0f0;">${toolName}</td></tr>
                            <tr><td style="padding:10px;border:1px solid #e2e8f0;font-weight:bold;">Plan</td><td style="padding:10px;border:1px solid #e2e8f0;">${planLabel}</td></tr>
                            <tr style="background:#f8f9fa;"><td style="padding:10px;border:1px solid #e2e8f0;font-weight:bold;">Valide jusqu'au</td><td style="padding:10px;border:1px solid #e2e8f0;">${periodEnd}</td></tr>
                            <tr><td style="padding:10px;border:1px solid #e2e8f0;font-weight:bold;">Compte</td><td style="padding:10px;border:1px solid #e2e8f0;">${user.email}</td></tr>
                          </table>
                          <div style="text-align:center;margin:28px 0;">
                            <a href="${toolUrl}" style="background:#1a365d;color:white;padding:14px 32px;border-radius:6px;font-weight:bold;text-decoration:none;font-size:15px;">Accéder à mon logiciel</a>
                          </div>
                          <p style="font-size:13px;color:#64748b;">Connectez-vous avec votre adresse e-mail et votre mot de passe sur <a href="https://www.gmep-france.eu">www.gmep-france.eu</a>.</p>
                          <p style="font-size:13px;color:#64748b;">Pour toute question : <a href="mailto:gmep.france@gmail.com">gmep.france@gmail.com</a> — Tél. 06 07 73 72 33</p>
                          <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;">
                          <p style="font-size:11px;color:#94a3b8;text-align:center;">© 2026 SARL G.M.E.P — 9 rue de la Marne, 79400 Saint-Maixent-l'École</p>
                        </div>
                      </div>
                    `,
                  });
                  console.log(`[ACTIVATION EMAIL] Sent to ${user.email} for tool=${tool} plan=${plan}`);
                }
              } catch (emailErr: any) {
                console.error("[ACTIVATION EMAIL] Failed:", emailErr.message);
              }
            }
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
        "default-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: https://fonts.googleapis.com https://fonts.gstatic.com https://unpkg.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://*.geopf.fr https://*.eaufrance.fr https://hubeau.eaufrance.fr https://api-adresse.data.gouv.fr https://geo.api.gouv.fr; img-src 'self' data: blob: https://*.geopf.fr https://*.tile.openstreetmap.org https://*.openstreetmap.org https://unpkg.com; connect-src 'self' https://*.geopf.fr https://hubeau.eaufrance.fr https://*.eaufrance.fr https://api-adresse.data.gouv.fr https://geo.api.gouv.fr"
      );
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      res.setHeader("Content-Type", "text/html; charset=utf-8");

      return res.send(protectToolHtml(tsnToolHtml));
    }
  );

  // ── TSN Trial : activer essai 8 jours ─────────────────────────────────
  app.post(
    "/api/tsn-trial/activate",
    requireAuth as any,
    async (req: AuthRequest, res: Response) => {
      try {
        const subs = await storage.getSubscriptionsByUserId(req.user!.id);
        const existing = subs.find(s => s.tool === "tsn");
        if (existing && (existing.status === "active" || existing.status === "trialing")) {
          return res.status(409).json({ message: "Vous avez déjà un accès TSN actif ou en cours d'essai." });
        }
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 8);
        let sub;
        if (existing) {
          sub = await storage.updateSubscription(existing.id, {
            status: "trialing",
            plan: "tsn_trial",
            tool: "tsn",
            currentPeriodEnd: trialEnd.toISOString(),
          });
        } else {
          sub = await storage.createSubscription(req.user!.id, {
            status: "trialing",
            plan: "tsn_trial",
            tool: "tsn",
            currentPeriodEnd: trialEnd.toISOString(),
          });
        }
        return res.json({ message: "Essai TSN activé (8 jours, 3 molécules)", subscription: sub });
      } catch (err: any) {
        return res.status(500).json({ message: err.message });
      }
    }
  );

  // ── TSN Trial : accès outil en mode essai (3 molécules) ───────────────
  app.get(
    "/api/tsn-trial",
    requireAuth as any,
    async (req: AuthRequest, res: Response) => {
      if (!tsnToolHtml) return res.status(500).json({ message: "Outil TSN non disponible" });
      // Bypass admin: accès complet sans limite, mais via la route complète (pas mode essai)
      if (isAdminEmail((req.user as any).email)) {
        res.setHeader("X-Frame-Options", "SAMEORIGIN");
        res.setHeader("Content-Security-Policy", "default-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: https://fonts.googleapis.com https://fonts.gstatic.com https://unpkg.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://*.geopf.fr https://*.eaufrance.fr https://hubeau.eaufrance.fr https://api-adresse.data.gouv.fr https://geo.api.gouv.fr; img-src 'self' data: blob: https://*.geopf.fr https://*.tile.openstreetmap.org https://*.openstreetmap.org https://unpkg.com; connect-src 'self' https://*.geopf.fr https://hubeau.eaufrance.fr https://*.eaufrance.fr https://api-adresse.data.gouv.fr https://geo.api.gouv.fr");
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        return res.send(protectToolHtml(tsnToolHtml));
      }
      const subs = await storage.getSubscriptionsByUserId(req.user!.id);
      const tsnSub = subs.find(s => s.tool === "tsn" && s.status === "trialing");
      if (!tsnSub) return res.status(403).json({ message: "Aucun essai TSN actif." });
      if (tsnSub.currentPeriodEnd && new Date(tsnSub.currentPeriodEnd) < new Date()) {
        try { await storage.updateSubscription(tsnSub.id, { status: "expired" }); } catch {}
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        return res.status(403).send(trialExpiredHtml("/#/subscribe-tsn", "TSN — Transfert Sol-Nappe", 8));
      }
      const daysLeft = tsnSub.currentPeriodEnd
        ? Math.max(0, Math.ceil((new Date(tsnSub.currentPeriodEnd).getTime() - Date.now()) / 86400000))
        : 0;
      const trialHtml = injectTsnTrialMode(tsnToolHtml, daysLeft, req.query.token as string);
      res.setHeader("X-Frame-Options", "SAMEORIGIN");
      res.setHeader("Content-Security-Policy", "default-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: https://fonts.googleapis.com https://fonts.gstatic.com https://unpkg.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://*.geopf.fr https://*.eaufrance.fr https://hubeau.eaufrance.fr https://api-adresse.data.gouv.fr https://geo.api.gouv.fr; img-src 'self' data: blob: https://*.geopf.fr https://*.tile.openstreetmap.org https://*.openstreetmap.org https://unpkg.com; connect-src 'self' https://*.geopf.fr https://hubeau.eaufrance.fr https://*.eaufrance.fr https://api-adresse.data.gouv.fr https://geo.api.gouv.fr");
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.send(protectToolHtml(trialHtml));
    }
  );

  // ── Rabattement Tool Route (abonnés actifs) ───────────────────────
  // Page publique DEBRIDEE (acces libre, version complete) : tout visiteur
  // accede a la version complete, sans authentification ni abonnement.
  const serveRabattementPublic = (_req: Request, res: Response) => {
    if (!rabattementToolHtml) {
      return res.status(500).json({ message: "Outil Rabattement non disponible" });
    }
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: https://fonts.googleapis.com https://fonts.gstatic.com https://*.tile.openstreetmap.org https://unpkg.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net"
    );
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.send(protectToolHtml(rabattementToolHtml));
  };
  app.get("/rabattement", serveRabattementPublic);
  app.get("/rabattement-tool.html", serveRabattementPublic);
  app.get("/logiciel-rabattement", serveRabattementPublic);

  app.get(
    "/api/rabattement-tool",
    requireAuth as any,
    requireRabattementSubscription as any,
    (req: AuthRequest, res: Response) => {
      if (!rabattementToolHtml) {
        return res.status(500).json({ message: "Outil Rabattement non disponible" });
      }

      res.setHeader("X-Frame-Options", "SAMEORIGIN");
      res.setHeader(
        "Content-Security-Policy",
        "default-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: https://fonts.googleapis.com https://fonts.gstatic.com https://*.tile.openstreetmap.org https://unpkg.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net"
      );
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      res.setHeader("Content-Type", "text/html; charset=utf-8");

      return res.send(protectToolHtml(rabattementToolHtml));
    }
  );

  // ── Rabattement Trial : activer essai 8 jours ───────────────────────────
  app.post(
    "/api/rabattement-trial/activate",
    requireAuth as any,
    async (req: AuthRequest, res: Response) => {
      try {
        const subs = await storage.getSubscriptionsByUserId(req.user!.id);
        const existing = subs.find(s => s.tool === "rabattement");
        if (existing && (existing.status === "active" || existing.status === "trialing")) {
          return res.status(409).json({ message: "Vous avez déjà un accès Rabattement actif ou en cours d'essai." });
        }
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 8);
        let sub;
        if (existing) {
          sub = await storage.updateSubscription(existing.id, {
            status: "trialing",
            plan: "rabattement_trial",
            tool: "rabattement",
            currentPeriodEnd: trialEnd.toISOString(),
          });
        } else {
          sub = await storage.createSubscription(req.user!.id, {
            status: "trialing",
            plan: "rabattement_trial",
            tool: "rabattement",
            currentPeriodEnd: trialEnd.toISOString(),
          });
        }
        return res.json({ message: "Essai Rabattement activé (8 jours)", subscription: sub });
      } catch (err: any) {
        return res.status(500).json({ message: err.message });
      }
    }
  );

  // ── EQRS V31.05 + ECOTOX Trial : activer essai 14 jours ────────────────
  app.post(
    "/api/eqrs-v31-ecotox-trial/activate",
    requireAuth as any,
    async (req: AuthRequest, res: Response) => {
      try {
        const subs = await storage.getSubscriptionsByUserId(req.user!.id);
        const existing = subs.find(s => s.tool === "eqrs_v31");
        if (existing && (existing.status === "active" || existing.status === "trialing")) {
          return res.status(409).json({ message: "Vous avez déjà un accès EQRS V31.05 + ECOTOX actif ou en cours d'essai." });
        }
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 14);
        let sub;
        if (existing) {
          sub = await storage.updateSubscription(existing.id, {
            status: "trialing",
            plan: "eqrs_v31_ecotox_trial",
            tool: "eqrs_v31",
            currentPeriodEnd: trialEnd.toISOString(),
          });
        } else {
          sub = await storage.createSubscription(req.user!.id, {
            status: "trialing",
            plan: "eqrs_v31_ecotox_trial",
            tool: "eqrs_v31",
            currentPeriodEnd: trialEnd.toISOString(),
          });
        }
        return res.json({ message: "Essai EQRS V31.05 + ECOTOX activé (14 jours)", subscription: sub });
      } catch (err: any) {
        return res.status(500).json({ message: err.message });
      }
    }
  );

  // ── EQRS V31.05 + ECOTOX Tool : accès outil (essai ou abonné) ──────────
  app.get(
    "/api/eqrs-v31-ecotox-tool",
    requireAuth as any,
    async (req: AuthRequest, res: Response) => {
      // CORRECTIF v16.3 : utilise le calculateur V8 avec module écotox (pas l'ancien V7)
      if (!eqrsV31EcotoxToolHtml) return res.status(500).json({ message: "Outil EQRS V31.05 + ECOTOX non disponible" });
      if (!isAdminEmail((req.user as any).email)) {
        const subs = await storage.getSubscriptionsByUserId(req.user!.id);
        const toolSub = subs.find(s => s.tool === "eqrs_v31" && (s.status === "active" || s.status === "trialing"));
        if (!toolSub) {
          return res.status(403).json({ message: "Abonnement EQRS V31.05 + ECOTOX requis pour accéder à cet outil." });
        }
        if (toolSub.status === "trialing" && toolSub.currentPeriodEnd && new Date(toolSub.currentPeriodEnd) < new Date()) {
          try { await storage.updateSubscription(toolSub.id, { status: "expired" }); } catch {}
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          return res.status(403).send(trialExpiredHtml("/#/subscribe-eqrs-v31-ecotox", "EQRS V31.05 + Extension ECOTOX", 14));
        }
      }
      res.setHeader("X-Frame-Options", "SAMEORIGIN");
      res.setHeader(
        "Content-Security-Policy",
        "default-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: https://fonts.googleapis.com https://fonts.gstatic.com https://cdnjs.cloudflare.com https://unpkg.com"
      );
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.send(protectToolHtml(eqrsV31EcotoxToolHtml));
    }
  );

  // ── Schéma Conceptuel Trial : activer essai 14 jours ───────────────────
  app.post(
    "/api/schema-conceptuel-trial/activate",
    requireAuth as any,
    async (req: AuthRequest, res: Response) => {
      try {
        const subs = await storage.getSubscriptionsByUserId(req.user!.id);
        const existing = subs.find(s => s.tool === "schema");
        if (existing && (existing.status === "active" || existing.status === "trialing")) {
          return res.status(409).json({ message: "Vous avez déjà un accès Schéma Conceptuel actif ou en cours d'essai." });
        }
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 14);
        let sub;
        if (existing) {
          sub = await storage.updateSubscription(existing.id, {
            status: "trialing",
            plan: "schema_conceptuel_trial",
            tool: "schema",
            currentPeriodEnd: trialEnd.toISOString(),
          });
        } else {
          sub = await storage.createSubscription(req.user!.id, {
            status: "trialing",
            plan: "schema_conceptuel_trial",
            tool: "schema",
            currentPeriodEnd: trialEnd.toISOString(),
          });
        }
        return res.json({ message: "Essai Schéma Conceptuel activé (14 jours)", subscription: sub });
      } catch (err: any) {
        return res.status(500).json({ message: err.message });
      }
    }
  );

  // ── Schéma Conceptuel Tool : accès outil (essai ou abonné) ─────────────
  app.get(
    "/api/schema-conceptuel-tool",
    requireAuth as any,
    async (req: AuthRequest, res: Response) => {
      // CORRECTIF v16.3 : utilise le HTML du Schéma Conceptuel dédié (pas l'ancien EQRS V7)
      if (!schemaConceptuelToolHtml) return res.status(500).json({ message: "Outil Schéma Conceptuel non disponible" });
      if (!isAdminEmail((req.user as any).email)) {
        const subs = await storage.getSubscriptionsByUserId(req.user!.id);
        const toolSub = subs.find(s => s.tool === "schema" && (s.status === "active" || s.status === "trialing"));
        if (!toolSub) {
          return res.status(403).json({ message: "Abonnement Schéma Conceptuel requis pour accéder à cet outil." });
        }
        if (toolSub.status === "trialing" && toolSub.currentPeriodEnd && new Date(toolSub.currentPeriodEnd) < new Date()) {
          try { await storage.updateSubscription(toolSub.id, { status: "expired" }); } catch {}
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          return res.status(403).send(trialExpiredHtml("/#/subscribe-schema-conceptuel", "Schéma Conceptuel", 14));
        }
      }
      res.setHeader("X-Frame-Options", "SAMEORIGIN");
      res.setHeader(
        "Content-Security-Policy",
        "default-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: https://fonts.googleapis.com https://fonts.gstatic.com https://cdnjs.cloudflare.com https://unpkg.com"
      );
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.send(protectToolHtml(schemaConceptuelToolHtml));
    }
  );

  // ── GMEP Piézomètres v2.9c : accès outil (essai ou abonné) ──────
  app.get(
    "/api/piezometres-tool",
    requireAuth as any,
    async (req: AuthRequest, res: Response) => {
      if (!piezometresToolHtml) return res.status(500).json({ message: "Outil GMEP Piézomètres non disponible" });
      if (!isAdminEmail((req.user as any).email)) {
        const subs = await storage.getSubscriptionsByUserId(req.user!.id);
        const toolSub = subs.find(s => s.tool === "piezometres" && (s.status === "active" || s.status === "trialing"));
        if (!toolSub) {
          return res.status(403).json({ message: "Abonnement GMEP Piézomètres requis pour accéder à cet outil." });
        }
        if (toolSub.status === "trialing" && toolSub.currentPeriodEnd && new Date(toolSub.currentPeriodEnd) < new Date()) {
          try { await storage.updateSubscription(toolSub.id, { status: "expired" }); } catch {}
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          return res.status(403).send(trialExpiredHtml("/#/subscribe-piezometres", "GMEP Piézomètres v2.9c", 8));
        }
      }
      res.setHeader("X-Frame-Options", "SAMEORIGIN");
      res.setHeader(
        "Content-Security-Policy",
        "default-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: https://fonts.googleapis.com https://fonts.gstatic.com https://cdnjs.cloudflare.com https://unpkg.com"
      );
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.send(protectToolHtml(piezometresToolHtml));
    }
  );

  // ── GMEP Piézomètres : activation essai 8 jours ────────────────────────────────────────
  app.post(
    "/api/piezometres-trial/activate",
    requireAuth as any,
    async (req: AuthRequest, res: Response) => {
      try {
        const subs = await storage.getSubscriptionsByUserId(req.user!.id);
        const existing = subs.find(s => s.tool === "piezometres" && (s.status === "active" || s.status === "trialing"));
        if (existing) {
          return res.status(409).json({ message: "Vous avez déjà un accès GMEP Piézomètres actif ou en cours d'essai." });
        }
        const trialEnd = new Date(); trialEnd.setDate(trialEnd.getDate() + 8);
        const sub = await storage.createSubscription(req.user!.id, {
          status: "trialing",
          plan: "piezometres_trial",
          tool: "piezometres",
          currentPeriodEnd: trialEnd.toISOString(),
        });
        return res.json({ message: "Essai GMEP Piézomètres activé (8 jours)", subscription: sub });
      } catch (err: any) {
        return res.status(500).json({ message: err.message || "Erreur lors de l'activation de l'essai" });
      }
    }
  );


  // ══════════════════════════════════════════════════════════════════════
  // MSP GMEP — Modélisation Sources de Pollution des Sols
  // ══════════════════════════════════════════════════════════════════════

  // ── MSP : activation essai 8 jours ──────────────────────────────────
  app.post(
    "/api/msp-trial/activate",
    requireAuth as any,
    async (req: AuthRequest, res: Response) => {
      try {
        const subs = await storage.getSubscriptionsByUserId(req.user!.id);
        const existing = subs.find(s => s.tool === "msp");
        if (existing && (existing.status === "active" || existing.status === "trialing")) {
          return res.status(409).json({ message: "Vous avez déjà un accès MSP actif ou en cours d'essai." });
        }
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 8);
        let sub;
        if (existing) {
          sub = await storage.updateSubscription(existing.id, {
            status: "trialing",
            plan: "msp_trial",
            tool: "msp",
            currentPeriodEnd: trialEnd.toISOString(),
          });
        } else {
          sub = await storage.createSubscription(req.user!.id, {
            status: "trialing",
            plan: "msp_trial",
            tool: "msp",
            currentPeriodEnd: trialEnd.toISOString(),
          });
        }

        // Email de confirmation activation essai MSP
        try {
          const resendKey = process.env.RESEND_API_KEY;
          if (resendKey) {
            const { Resend } = require("resend");
            const resend = new Resend(resendKey);
            const user = await storage.getUser(req.user!.id);
            const trialEndFr = trialEnd.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
            await resend.emails.send({
              from: "GMEP <noreply@gmep-france.eu>",
              to: req.user!.email,
              subject: "MSP GMEP — Votre essai gratuit de 8 jours est activé",
              html: `
                <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:20px;">
                  <div style="background:#1a365d;color:white;padding:24px;border-radius:8px 8px 0 0;text-align:center;">
                    <h2 style="margin:0;font-size:20px;">G.M.E.P</h2>
                    <p style="margin:4px 0 0;font-size:13px;opacity:0.85;">MSP — Modélisation Sources de Pollution des Sols</p>
                  </div>
                  <div style="background:#f8f9fa;padding:28px;border:1px solid #e2e8f0;border-radius:0 0 8px 8px;">
                    <p style="font-size:16px;">Bonjour ${user?.name || req.user!.email},</p>
                    <p>Votre essai gratuit <strong>MSP GMEP</strong> est maintenant actif. Accès complet au logiciel pendant <strong>8 jours</strong>.</p>
                    <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
                      <tr style="background:#e8f4fd;"><td style="padding:10px;border:1px solid #cce0f0;font-weight:bold;">Outil</td><td style="padding:10px;border:1px solid #cce0f0;">MSP — Modélisation Sources de Pollution</td></tr>
                      <tr><td style="padding:10px;border:1px solid #e2e8f0;font-weight:bold;">Durée essai</td><td style="padding:10px;border:1px solid #e2e8f0;">8 jours</td></tr>
                      <tr style="background:#f8f9fa;"><td style="padding:10px;border:1px solid #e2e8f0;font-weight:bold;">Accès jusqu'au</td><td style="padding:10px;border:1px solid #e2e8f0;"><strong>${trialEndFr}</strong></td></tr>
                      <tr><td style="padding:10px;border:1px solid #e2e8f0;font-weight:bold;">Compte</td><td style="padding:10px;border:1px solid #e2e8f0;">${req.user!.email}</td></tr>
                    </table>
                    <p style="font-size:13px;color:#64748b;">Après les 8 jours, l'accès est bloqué. Vous recevrez un rappel à J-2 et J-0.</p>
                    <div style="text-align:center;margin:28px 0;">
                      <a href="https://www.gmep-france.eu/#/dashboard" style="background:#16a34a;color:white;padding:14px 32px;border-radius:6px;font-weight:bold;text-decoration:none;font-size:15px;">Accéder à MSP GMEP →</a>
                    </div>
                    <p style="font-size:13px;color:#64748b;">Référentiels : Arrêté 12/12/2014 (ISDI) · Décret 2023-1408 (VSA/VSB)</p>
                    <p style="font-size:13px;color:#64748b;">Pour toute question : <a href="mailto:contact@gmep-france.eu">contact@gmep-france.eu</a> — Tél. 06 07 73 72 33</p>
                    <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;">
                    <p style="font-size:11px;color:#94a3b8;text-align:center;">© 2026 SARL G.M.E.P — 9 rue de la Marne, 79400 Saint-Maixent-l'École</p>
                  </div>
                </div>
              `,
            });
            console.log(`[MSP TRIAL EMAIL] Sent to ${req.user!.email}`);
          }
        } catch (emailErr: any) {
          console.error("[MSP TRIAL EMAIL] Failed:", emailErr.message);
        }

        return res.json({ message: "Essai MSP activé (8 jours)", subscription: sub });
      } catch (err: any) {
        return res.status(500).json({ message: err.message || "Erreur lors de l'activation de l'essai" });
      }
    }
  );

  // ── MSP : accès outil (essai ou abonné) ────────────────────────────
  app.get(
    "/api/msp-tool",
    requireAuth as any,
    async (req: AuthRequest, res: Response) => {
      if (!mspToolHtml) return res.status(503).json({ message: "Outil MSP non disponible — fichier msp-tool.html manquant" });
      if (!isAdminEmail((req.user as any).email)) {
        const subs = await storage.getSubscriptionsByUserId(req.user!.id);
        const mspSub = subs.find(s => s.tool === "msp" && (s.status === "active" || s.status === "trialing"));
        if (!mspSub) {
          return res.status(403).json({ message: "Abonnement MSP requis pour accéder à cet outil." });
        }
        if (mspSub.status === "trialing" && mspSub.currentPeriodEnd && new Date(mspSub.currentPeriodEnd) < new Date()) {
          try { await storage.updateSubscription(mspSub.id, { status: "expired" }); } catch {}
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          return res.status(403).send(trialExpiredHtml("/#/subscribe-msp", "MSP — Modélisation Sources de Pollution des Sols", 8));
        }
      }
      res.setHeader("X-Frame-Options", "SAMEORIGIN");
      res.setHeader(
        "Content-Security-Policy",
        "default-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: https://fonts.googleapis.com https://fonts.gstatic.com https://cdnjs.cloudflare.com https://unpkg.com"
      );
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.send(protectToolHtml(mspToolHtml));
    }
  );

  // ── MSP : cron rappels trial expiration (J-2 et J-0) ──────────────
  // Déclenché par URL externe protégée — Railway Cron ou Perplexity Scheduler
  // GET /api/admin/send-msp-trial-reminders?secret=xxx
  app.get("/api/admin/send-msp-trial-reminders", async (req: Request, res: Response) => {
    const secret = req.query.secret as string;
    const expected = process.env.ADMIN_DIGEST_SECRET || "gmep-digest-2026-secret";
    if (secret !== expected) return res.status(403).json({ message: "Secret invalide" });
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) return res.status(503).json({ message: "Resend non configuré" });
    const { Resend } = require("resend");
    const resend = new Resend(resendKey);
    const results: any[] = [];
    try {
      const anyStorage = storage as any;
      let trialingSubs: any[] = [];
      if (typeof anyStorage.getAllTrialingSubscriptionsByTool === "function") {
        trialingSubs = await anyStorage.getAllTrialingSubscriptionsByTool("msp");
      } else if (typeof anyStorage.getAllSubscriptions === "function") {
        const all = await anyStorage.getAllSubscriptions();
        trialingSubs = all.filter((s: any) => s.tool === "msp" && s.status === "trialing");
      }

      const now = new Date();
      for (const sub of trialingSubs) {
        if (!sub.currentPeriodEnd) continue;
        const end = new Date(sub.currentPeriodEnd);
        const daysLeft = (end.getTime() - now.getTime()) / 86400000;
        const isJ2 = daysLeft >= 1.5 && daysLeft < 2.5;
        const isJ0 = daysLeft >= 0 && daysLeft < 0.5;
        if (!isJ2 && !isJ0) continue;

        let user: any = null;
        try { user = await storage.getUser(sub.userId); } catch {}
        if (!user || !user.email) continue;

        const endFr = end.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
        const subject = isJ2
          ? "MSP GMEP — Il vous reste 2 jours d'essai"
          : "MSP GMEP — Votre essai expire aujourd'hui";
        const urgenceColor = isJ0 ? "#dc2626" : "#f59e0b";
        const urgenceLabel = isJ0 ? "Expire aujourd'hui" : "2 jours restants";

        const html = `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:20px;">
            <div style="background:#1a365d;color:white;padding:24px;border-radius:8px 8px 0 0;text-align:center;">
              <h2 style="margin:0;font-size:20px;">G.M.E.P</h2>
              <p style="margin:4px 0 0;font-size:13px;opacity:0.85;">MSP — Modélisation Sources de Pollution des Sols</p>
            </div>
            <div style="background:#f8f9fa;padding:28px;border:1px solid #e2e8f0;border-radius:0 0 8px 8px;">
              <div style="background:${urgenceColor};color:white;padding:8px 16px;border-radius:6px;text-align:center;font-weight:bold;font-size:14px;margin-bottom:20px;">${urgenceLabel}</div>
              <p style="font-size:16px;">Bonjour ${user.name || user.email},</p>
              <p>${isJ0
                ? "Votre essai gratuit <strong>MSP GMEP</strong> expire <strong>aujourd'hui</strong>. Après expiration, l'accès est bloqué."
                : `Votre essai gratuit <strong>MSP GMEP</strong> se termine dans <strong>2 jours</strong> (le ${endFr}).`
              }</p>
              <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
                <tr style="background:#e8f4fd;"><td style="padding:10px;border:1px solid #cce0f0;font-weight:bold;">Essai valable jusqu'au</td><td style="padding:10px;border:1px solid #cce0f0;"><strong>${endFr}</strong></td></tr>
                <tr><td style="padding:10px;border:1px solid #e2e8f0;font-weight:bold;">Mensuel</td><td style="padding:10px;border:1px solid #e2e8f0;">250 € HT/mois — 300 € TTC</td></tr>
                <tr style="background:#f8f9fa;"><td style="padding:10px;border:1px solid #e2e8f0;font-weight:bold;">Annuel</td><td style="padding:10px;border:1px solid #e2e8f0;">2 760 € HT/an — 3 312 € TTC (2 mois offerts)</td></tr>
              </table>
              <div style="text-align:center;margin:28px 0;">
                <a href="https://www.gmep-france.eu/#/subscribe-msp" style="background:#16a34a;color:white;padding:14px 32px;border-radius:6px;font-weight:bold;text-decoration:none;font-size:15px;">S'abonner — Accès permanent →</a>
              </div>
              <p style="font-size:13px;color:#64748b;">Pour toute question : <a href="mailto:contact@gmep-france.eu">contact@gmep-france.eu</a> — Tél. 06 07 73 72 33</p>
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;">
              <p style="font-size:11px;color:#94a3b8;text-align:center;">© 2026 SARL G.M.E.P — 9 rue de la Marne, 79400 Saint-Maixent-l'École</p>
            </div>
          </div>
        `;

        try {
          await resend.emails.send({ from: "GMEP <noreply@gmep-france.eu>", to: user.email, subject, html });
          results.push({ userId: sub.userId, email: user.email, type: isJ0 ? "J-0" : "J-2", sent: true });
          console.log(`[MSP REMINDER ${isJ0 ? "J-0" : "J-2"}] Sent to ${user.email}`);
        } catch (emailErr: any) {
          results.push({ userId: sub.userId, email: user.email, type: isJ0 ? "J-0" : "J-2", sent: false, error: emailErr.message });
        }
      }
      return res.json({ processed: trialingSubs.length, reminders_sent: results.filter(r => r.sent).length, results });
    } catch (err: any) {
      console.error("[MSP REMINDER CRON ERROR]", err);
      return res.status(500).json({ message: "Erreur cron rappels MSP", error: err.message });
    }
  });

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
