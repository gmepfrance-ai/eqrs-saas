import {
  type User,
  type SafeUser,
  type Session,
  type Subscription,
} from "@shared/schema";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

function generateLicenseKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const segment = () => Array.from({ length: 4 }, () => chars[crypto.randomInt(chars.length)]).join("");
  return `EQRS-${segment()}-${segment()}-${segment()}`;
}

// JSON file-based storage (works everywhere, no native modules needed)
const DB_PATH = path.join(process.cwd(), "db.json");

interface PageView {
  date: string;
  country: string;
  countryCode: string;
  city: string;
  path: string;
  ip: string;
}

interface DBData {
  users: User[];
  sessions: Session[];
  subscriptions: Subscription[];
  pageViews: PageView[];
  nextUserId: number;
  nextSessionId: number;
  nextSubscriptionId: number;
}

function loadDB(): DBData {
  try {
    if (fs.existsSync(DB_PATH)) {
      return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
    }
  } catch (e) {
    console.error("Error loading DB, creating new one:", e);
  }
  return {
    users: [],
    sessions: [],
    subscriptions: [],
    pageViews: [],
    nextUserId: 1,
    nextSessionId: 1,
    nextSubscriptionId: 1,
  };
}

function saveDB(data: DBData): void {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Error saving DB:", e);
  }
}

let db = loadDB();

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserCount(): Promise<number>;
  getAllUserEmails(): Promise<string[]>;
  createUser(email: string, passwordHash: string, name: string): Promise<User>;
  updateUserPassword(email: string, newPasswordHash: string): Promise<void>;
  toSafeUser(user: User): SafeUser;

  // Sessions
  createSession(token: string, userId: number, expiresAt: string): Promise<Session>;
  getSessionByToken(token: string): Promise<Session | undefined>;
  deleteSession(token: string): Promise<void>;
  deleteExpiredSessions(): Promise<void>;

  // Subscriptions
  getSubscriptionByUserId(userId: number): Promise<Subscription | undefined>;
  getSubscriptionsByUserId(userId: number): Promise<Subscription[]>;
  getSubscriptionByUserIdAndTool(userId: number, tool: string): Promise<Subscription | undefined>;
  getSubscriptionByStripeCustomerId(stripeCustomerId: string): Promise<Subscription | undefined>;
  getSubscriptionByStripeSubscriptionId(stripeSubscriptionId: string): Promise<Subscription | undefined>;
  createSubscription(userId: number, data: Partial<Subscription>): Promise<Subscription>;
  updateSubscription(id: number, data: Partial<Subscription>): Promise<Subscription | undefined>;
  activateSubscriptionForUser(userId: number, plan: string): Promise<Subscription>;
  activateSubscriptionForUserAndTool(userId: number, plan: string, tool: string): Promise<Subscription>;

  // Page Views
  addPageView(view: { country: string; countryCode: string; city: string; path: string; ip: string }): Promise<void>;
  getPageViews(): Promise<PageView[]>;
  getViewStats(): Promise<{ byCountry: Record<string, number>; byDate: Record<string, number>; total: number; byCity: Record<string, number> }>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    return db.users.find((u) => u.id === id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return db.users.find((u) => u.email === email);
  }

  async getUserCount(): Promise<number> {
    return db.users.length;
  }

  async getAllUserEmails(): Promise<string[]> {
    return db.users.map((u) => u.email);
  }

  async createUser(email: string, passwordHash: string, name: string): Promise<User> {
    const user: User = {
      id: db.nextUserId++,
      email,
      passwordHash,
      name,
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    saveDB(db);
    return user;
  }

  async updateUserPassword(email: string, newPasswordHash: string): Promise<void> {
    const user = db.users.find((u) => u.email === email);
    if (user) {
      user.passwordHash = newPasswordHash;
      saveDB(db);
    }
  }

  toSafeUser(user: User): SafeUser {
    const { passwordHash, ...safe } = user;
    return safe;
  }

  // Sessions
  async createSession(token: string, userId: number, expiresAt: string): Promise<Session> {
    const session: Session = {
      id: db.nextSessionId++,
      token,
      userId,
      expiresAt,
      createdAt: new Date().toISOString(),
    };
    db.sessions.push(session);
    saveDB(db);
    return session;
  }

  async getSessionByToken(token: string): Promise<Session | undefined> {
    return db.sessions.find((s) => s.token === token);
  }

  async deleteSession(token: string): Promise<void> {
    db.sessions = db.sessions.filter((s) => s.token !== token);
    saveDB(db);
  }

  async deleteExpiredSessions(): Promise<void> {
    const now = new Date().toISOString();
    db.sessions = db.sessions.filter((s) => s.expiresAt > now);
    saveDB(db);
  }

  // Subscriptions
  async getSubscriptionByUserId(userId: number): Promise<Subscription | undefined> {
    return db.subscriptions.find((s) => s.userId === userId);
  }

  async getSubscriptionsByUserId(userId: number): Promise<Subscription[]> {
    return db.subscriptions.filter((s) => s.userId === userId);
  }

  async getSubscriptionByUserIdAndTool(userId: number, tool: string): Promise<Subscription | undefined> {
    const subs = db.subscriptions.filter((s) => s.userId === userId);
    // "bundle" donne accès aux deux outils
    return subs.find((s) => s.tool === tool || s.tool === "bundle");
  }

  async getSubscriptionByStripeCustomerId(stripeCustomerId: string): Promise<Subscription | undefined> {
    return db.subscriptions.find((s) => s.stripeCustomerId === stripeCustomerId);
  }

  async getSubscriptionByStripeSubscriptionId(stripeSubscriptionId: string): Promise<Subscription | undefined> {
    return db.subscriptions.find((s) => s.stripeSubscriptionId === stripeSubscriptionId);
  }

  async createSubscription(userId: number, data: Partial<Subscription>): Promise<Subscription> {
    const sub: Subscription = {
      id: db.nextSubscriptionId++,
      userId,
      stripeCustomerId: data.stripeCustomerId || null,
      stripeSubscriptionId: data.stripeSubscriptionId || null,
      status: data.status || "inactive",
      plan: data.plan || null,
      tool: data.tool || null,
      currentPeriodEnd: data.currentPeriodEnd || null,
      licenseKey: data.licenseKey || generateLicenseKey(),
      createdAt: new Date().toISOString(),
    };
    db.subscriptions.push(sub);
    saveDB(db);
    return sub;
  }

  async updateSubscription(id: number, data: Partial<Subscription>): Promise<Subscription | undefined> {
    const idx = db.subscriptions.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;

    const sub = db.subscriptions[idx];
    if (data.stripeCustomerId !== undefined) sub.stripeCustomerId = data.stripeCustomerId;
    if (data.stripeSubscriptionId !== undefined) sub.stripeSubscriptionId = data.stripeSubscriptionId;
    if (data.status !== undefined) sub.status = data.status;
    if (data.plan !== undefined) sub.plan = data.plan;
    if (data.tool !== undefined) sub.tool = data.tool;
    if (data.currentPeriodEnd !== undefined) sub.currentPeriodEnd = data.currentPeriodEnd;
    if (data.licenseKey !== undefined) sub.licenseKey = data.licenseKey;

    db.subscriptions[idx] = sub;
    saveDB(db);
    return sub;
  }

  async activateSubscriptionForUser(userId: number, plan: string): Promise<Subscription> {
    return this.activateSubscriptionForUserAndTool(userId, plan, "je");
  }

  async activateSubscriptionForUserAndTool(userId: number, plan: string, tool: string): Promise<Subscription> {
    const endDate = new Date();
    if (plan === "monthly") {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // Chercher un abonnement existant pour ce tool
    const existing = db.subscriptions.find((s) => s.userId === userId && s.tool === tool);
    if (existing) {
      existing.status = "active";
      existing.plan = plan;
      existing.tool = tool;
      existing.currentPeriodEnd = endDate.toISOString();
      if (!existing.licenseKey) existing.licenseKey = generateLicenseKey();
      const idx = db.subscriptions.findIndex((s) => s.id === existing.id);
      db.subscriptions[idx] = existing;
      saveDB(db);
      return existing;
    }

    return this.createSubscription(userId, {
      status: "active",
      plan,
      tool,
      currentPeriodEnd: endDate.toISOString(),
    });
  }

  // Page Views
  async addPageView(view: { country: string; countryCode: string; city: string; path: string; ip: string }): Promise<void> {
    if (!db.pageViews) db.pageViews = [];
    db.pageViews.push({
      ...view,
      date: new Date().toISOString(),
    });
    // Keep only last 10000 views to avoid file growing too large
    if (db.pageViews.length > 10000) {
      db.pageViews = db.pageViews.slice(-10000);
    }
    saveDB(db);
  }

  async getPageViews(): Promise<PageView[]> {
    return db.pageViews || [];
  }

  async getViewStats(): Promise<{ byCountry: Record<string, number>; byDate: Record<string, number>; total: number; byCity: Record<string, number> }> {
    const views = db.pageViews || [];
    const byCountry: Record<string, number> = {};
    const byDate: Record<string, number> = {};
    const byCity: Record<string, number> = {};

    for (const v of views) {
      const country = v.country || "Inconnu";
      byCountry[country] = (byCountry[country] || 0) + 1;
      const date = v.date.split("T")[0];
      byDate[date] = (byDate[date] || 0) + 1;
      const city = v.city ? `${v.city} (${v.countryCode})` : country;
      byCity[city] = (byCity[city] || 0) + 1;
    }

    return { byCountry, byDate, total: views.length, byCity };
  }
}

// Use PostgreSQL if DATABASE_URL is set, otherwise fall back to JSON
import { PgStorage } from "./storage-pg";

export const storage: IStorage = process.env.DATABASE_URL
  ? new PgStorage()
  : new DatabaseStorage();
