// ══════════════════════════════════════════════════════════════════════
// AGRESOL — agressivité des eaux souterraines, des gaz du sol et des sols
// acides vis-à-vis des fondations (NF EN 206+A2/CN, FD P18-011).
// Sources de l'application : dossier agresol/ (application multi-fichiers).
// L'application et le rapport sont servis en une page HTML autonome (CSS et
// scripts intégrés) par /api/agresol-tool et /api/agresol-rapport (accès
// abonné ou essai). Les bibliothèques publiques (pdf.js, SheetJS, Paged.js)
// sont servies sous /agresol/vendor/, le relais BRGM sous /agresol/api/brgm/*.
// ══════════════════════════════════════════════════════════════════════
import type { Express, Response } from "express";
import express from "express";
import fs from "fs";
import path from "path";
import { createRequire } from "module";

const ROOT = path.resolve(process.cwd(), "agresol");
const LOCAL_SCRIPTS = /<script src="(?!vendor\/)([\w.-]+\.js)"><\/script>/g;

function inlinePage(file: string): string {
  let html = fs.readFileSync(path.join(ROOT, file), "utf-8");
  html = html.replace(/<link rel="stylesheet" href="(style\.css)">/g, (_m, f) =>
    `<style>\n${fs.readFileSync(path.join(ROOT, f), "utf-8")}\n</style>`);
  html = html.replace(LOCAL_SCRIPTS, (_m, f) => {
    const src = fs.readFileSync(path.join(ROOT, f), "utf-8").replace(/<\/script/gi, "<\\/script");
    return `<script>\n${src}\n</script>`;
  });
  // Les chemins relatifs restants (vendor/…, api/brgm/…) pointent vers /agresol/
  html = html.replace(/<head>/i, `<head>\n<base href="/agresol/">`);
  return html;
}

let toolHtml = "";
let rapportHtml = "";
try {
  toolHtml = inlinePage("index.html");
  rapportHtml = inlinePage("rapport.html");
} catch (e) {
  console.error("Warning: Could not load AGRESOL (dossier agresol/)", e);
}

let relay: { bss: Function; log: Function; carte: Function } | null = null;
try {
  const req = createRequire(path.resolve(process.cwd(), "package.json"));
  relay = req(path.join(ROOT, "relay.cjs"));
} catch (e) {
  console.error("Warning: Could not load AGRESOL relay (agresol/relay.cjs)", e);
}

const CSP =
  "default-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: https://fonts.googleapis.com https://fonts.gstatic.com; " +
  "connect-src 'self' https://data.geopf.fr https://apicarto.ign.fr https://api-adresse.data.gouv.fr; " +
  "img-src 'self' data: blob: https:; worker-src 'self' blob:";

type Deps = {
  requireAuth: any;
  storage: any;
  isAdminEmail: (email: string) => boolean;
  protectToolHtml: (html: string) => string;
  trialExpiredHtml: (subscribePath: string, toolName: string, duration: number) => string;
};

export const AGRESOL_NAME = "AGRESOL — Agressivité des eaux et des gaz du sol sur les fondations";

export function registerAgresolRoutes(app: Express, d: Deps) {
  // Accès : abonnement AGRESOL (essai ou annuel), offre groupée (bundle) ou packs SSP
  async function checkAccess(req: any, res: Response): Promise<boolean> {
    if (d.isAdminEmail(req.user.email)) return true;
    const subs = await d.storage.getSubscriptionsByUserId(req.user.id);
    const sub = subs.find((s: any) => (s.tool === "agresol" || s.tool === "bundle") && (s.status === "active" || s.status === "trialing"));
    if (!sub) {
      res.status(403).json({ message: "Abonnement AGRESOL requis pour accéder à cet outil." });
      return false;
    }
    if (sub.status === "trialing" && sub.currentPeriodEnd && new Date(sub.currentPeriodEnd) < new Date()) {
      try { await d.storage.updateSubscription(sub.id, { status: "expired" }); } catch {}
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.status(403).send(d.trialExpiredHtml("/#/subscribe-agresol", "AGRESOL", 14));
      return false;
    }
    return true;
  }

  function sendPage(res: Response, html: string, token: string) {
    const inject = `<script>window.AGRESOL_SAAS=true;window.AGRESOL_RAPPORT_URL=${JSON.stringify("/api/agresol-rapport?token=" + encodeURIComponent(token))};</script>`;
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Content-Security-Policy", CSP);
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(d.protectToolHtml(html.replace(/<head>/i, "<head>\n" + inject)));
  }

  // ── Essai gratuit 14 jours ───────────────────────────────────────────
  app.post("/api/agresol-trial/activate", d.requireAuth, async (req: any, res: Response) => {
    try {
      const subs = await d.storage.getSubscriptionsByUserId(req.user.id);
      const existing = subs.find((s: any) => s.tool === "agresol");
      if (existing && (existing.status === "active" || existing.status === "trialing")) {
        return res.status(409).json({ message: "Vous avez déjà un accès AGRESOL actif ou en cours d'essai." });
      }
      if (existing && existing.plan === "agresol_trial") {
        return res.status(403).json({ message: "L'essai gratuit AGRESOL a déjà été utilisé sur ce compte : souscrivez l'abonnement annuel pour continuer." });
      }
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 14);
      const data = { status: "trialing", plan: "agresol_trial", tool: "agresol", currentPeriodEnd: trialEnd.toISOString() };
      const sub = existing
        ? await d.storage.updateSubscription(existing.id, data)
        : await d.storage.createSubscription(req.user.id, data);

      try {
        const resendKey = process.env.RESEND_API_KEY;
        if (resendKey) {
          const { Resend } = require("resend");
          const resend = new Resend(resendKey);
          const user = await d.storage.getUser(req.user.id);
          const fin = trialEnd.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
          await resend.emails.send({
            from: "GMEP <noreply@gmep-france.eu>",
            to: req.user.email,
            subject: "GMEP AGRESOL — Votre essai gratuit de 14 jours est activé",
            html: `
              <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:20px;">
                <div style="background:#0f6e56;color:white;padding:24px;border-radius:8px 8px 0 0;text-align:center;">
                  <h2 style="margin:0;font-size:20px;">G.M.E.P</h2>
                  <p style="margin:4px 0 0;font-size:13px;opacity:0.85;">AGRESOL — Agressivité des eaux et des gaz du sol sur les fondations</p>
                </div>
                <div style="background:#f8f9fa;padding:28px;border:1px solid #e2e8f0;border-radius:0 0 8px 8px;">
                  <p style="font-size:16px;">Bonjour ${user?.name || req.user.email},</p>
                  <p>Votre essai gratuit <strong>AGRESOL</strong> est maintenant actif. Accès complet au logiciel pendant <strong>14 jours</strong>, jusqu'au <strong>${fin}</strong>.</p>
                  <p style="font-size:13px;color:#64748b;">Après les 14 jours, l'accès est bloqué. Abonnement : 1 250 € HT/an.</p>
                  <div style="text-align:center;margin:28px 0;">
                    <a href="https://app.gmep-france.eu/dashboard" style="background:#0f6e56;color:white;padding:14px 32px;border-radius:6px;font-weight:bold;text-decoration:none;font-size:15px;">Accéder à AGRESOL →</a>
                  </div>
                  <p style="font-size:13px;color:#64748b;">Classes d'exposition XA (NF EN 206+A2/CN, FD P18-011) au contact de chaque ouvrage : eaux souterraines, gaz du sol, sols acides, effets du venting et du sparging, rapport d'étude.</p>
                  <p style="font-size:13px;color:#64748b;">Pour toute question : <a href="mailto:gmep.france@gmail.com">gmep.france@gmail.com</a> — Tél. 06 07 73 72 33</p>
                </div>
              </div>`,
          });
        }
      } catch (emailErr: any) {
        console.error("[AGRESOL TRIAL EMAIL] Failed:", emailErr.message);
      }
      return res.json({ message: "Essai AGRESOL activé (14 jours)", subscription: sub });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || "Erreur lors de l'activation de l'essai" });
    }
  });

  // ── Application et rapport (essai ou abonné) ─────────────────────────
  app.get("/api/agresol-tool", d.requireAuth, async (req: any, res: Response) => {
    if (!toolHtml) return res.status(503).json({ message: "AGRESOL non disponible — dossier agresol/ manquant" });
    if (!(await checkAccess(req, res))) return;
    sendPage(res, toolHtml, String(req.query.token || ""));
  });
  app.get("/api/agresol-rapport", d.requireAuth, async (req: any, res: Response) => {
    if (!rapportHtml) return res.status(503).json({ message: "Rapport AGRESOL non disponible" });
    if (!(await checkAccess(req, res))) return;
    sendPage(res, rapportHtml, String(req.query.token || ""));
  });

  // ── Bibliothèques publiques (pdf.js, SheetJS, Paged.js) ──────────────
  app.use("/agresol/vendor", express.static(path.join(ROOT, "vendor"), { maxAge: "7d", fallthrough: false }));

  // ── Relais BRGM (banque du sous-sol, logs géologiques, carte géologique) ──
  // Données publiques du BRGM ; paramètres validés par le relais (coordonnées
  // Lambert 93, référence BSS). Limitation simple par adresse IP.
  const hits = new Map<string, { n: number; t: number }>();
  for (const [name, fn] of [["bss", "bss"], ["log", "log"], ["carte", "carte"]] as const) {
    app.get(`/agresol/api/brgm/${name}`, async (req: any, res: Response) => {
      const ip = String(req.headers["x-forwarded-for"] || req.ip || "").split(",")[0].trim();
      const now = Date.now();
      const h = hits.get(ip);
      if (h && now - h.t < 60000) { if (++h.n > 60) return res.status(429).json({ erreur: "trop de requêtes, réessayer dans une minute" }); }
      else hits.set(ip, { n: 1, t: now });
      if (hits.size > 5000) hits.clear();
      if (!relay) return res.status(503).json({ erreur: "relais BRGM indisponible" });
      try {
        const out = await (relay as any)[fn](req.query);
        res.setHeader("Cache-Control", "public, max-age=3600");
        return res.json(out);
      } catch (err: any) {
        return res.status(502).json({ erreur: String(err?.message || err) });
      }
    });
  }
}
