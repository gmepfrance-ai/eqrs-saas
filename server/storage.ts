import {
  type User,
  type SafeUser,
  type Session,
  type Subscription,
} from "@shared/schema";
import * as fs from "fs";
import * as path from "path";

// JSON file-based storage (works everywhere, no native modules needed)
const DB_PATH = path.join(process.cwd(), "db.json");

interface DBData {
  users: User[];
  sessions: Session[];
  subscriptions: Subscription[];
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
  getUser(id: number): User | undefined;
  getUserByEmail(email: string): User | undefined;
  createUser(email: string, passwordHash: string, name: string): User;
  toSafeUser(user: User): SafeUser;

  // Sessions
  createSession(token: string, userId: number, expiresAt: string): Session;
  getSessionByToken(token: string): Session | undefined;
  deleteSession(token: string): void;
  deleteExpiredSessions(): void;

  // Subscriptions
  getSubscriptionByUserId(userId: number): Subscription | undefined;
  getSubscriptionByStripeCustomerId(stripeCustomerId: string): Subscription | undefined;
  getSubscriptionByStripeSubscriptionId(stripeSubscriptionId: string): Subscription | undefined;
  createSubscription(userId: number, data: Partial<Subscription>): Subscription;
  updateSubscription(id: number, data: Partial<Subscription>): Subscription | undefined;
  activateSubscriptionForUser(userId: number, plan: string): Subscription;
}

export class DatabaseStorage implements IStorage {
  // Users
  getUser(id: number): User | undefined {
    return db.users.find((u) => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return db.users.find((u) => u.email === email);
  }

  createUser(email: string, passwordHash: string, name: string): User {
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

  toSafeUser(user: User): SafeUser {
    const { passwordHash, ...safe } = user;
    return safe;
  }

  // Sessions
  createSession(token: string, userId: number, expiresAt: string): Session {
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

  getSessionByToken(token: string): Session | undefined {
    return db.sessions.find((s) => s.token === token);
  }

  deleteSession(token: string): void {
    db.sessions = db.sessions.filter((s) => s.token !== token);
    saveDB(db);
  }

  deleteExpiredSessions(): void {
    const now = new Date().toISOString();
    db.sessions = db.sessions.filter((s) => s.expiresAt > now);
    saveDB(db);
  }

  // Subscriptions
  getSubscriptionByUserId(userId: number): Subscription | undefined {
    return db.subscriptions.find((s) => s.userId === userId);
  }

  getSubscriptionByStripeCustomerId(stripeCustomerId: string): Subscription | undefined {
    return db.subscriptions.find((s) => s.stripeCustomerId === stripeCustomerId);
  }

  getSubscriptionByStripeSubscriptionId(stripeSubscriptionId: string): Subscription | undefined {
    return db.subscriptions.find((s) => s.stripeSubscriptionId === stripeSubscriptionId);
  }

  createSubscription(userId: number, data: Partial<Subscription>): Subscription {
    const sub: Subscription = {
      id: db.nextSubscriptionId++,
      userId,
      stripeCustomerId: data.stripeCustomerId || null,
      stripeSubscriptionId: data.stripeSubscriptionId || null,
      status: data.status || "inactive",
      plan: data.plan || null,
      currentPeriodEnd: data.currentPeriodEnd || null,
      createdAt: new Date().toISOString(),
    };
    db.subscriptions.push(sub);
    saveDB(db);
    return sub;
  }

  updateSubscription(id: number, data: Partial<Subscription>): Subscription | undefined {
    const idx = db.subscriptions.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;

    const sub = db.subscriptions[idx];
    if (data.stripeCustomerId !== undefined) sub.stripeCustomerId = data.stripeCustomerId;
    if (data.stripeSubscriptionId !== undefined) sub.stripeSubscriptionId = data.stripeSubscriptionId;
    if (data.status !== undefined) sub.status = data.status;
    if (data.plan !== undefined) sub.plan = data.plan;
    if (data.currentPeriodEnd !== undefined) sub.currentPeriodEnd = data.currentPeriodEnd;

    db.subscriptions[idx] = sub;
    saveDB(db);
    return sub;
  }

  activateSubscriptionForUser(userId: number, plan: string): Subscription {
    const existing = this.getSubscriptionByUserId(userId);
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    if (existing) {
      existing.status = "active";
      existing.plan = plan;
      existing.currentPeriodEnd = endDate.toISOString();
      const idx = db.subscriptions.findIndex((s) => s.id === existing.id);
      db.subscriptions[idx] = existing;
      saveDB(db);
      return existing;
    }

    return this.createSubscription(userId, {
      status: "active",
      plan,
      currentPeriodEnd: endDate.toISOString(),
    });
  }
}

export const storage = new DatabaseStorage();
