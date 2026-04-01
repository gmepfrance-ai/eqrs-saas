import {
  type User,
  type SafeUser,
  type Session,
  type Subscription,
  users,
  sessions,
  subscriptions,
} from "@shared/schema";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, and, lt } from "drizzle-orm";

const sqlite = new Database("data.db");
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite);

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
    return db.select().from(users).where(eq(users.id, id)).get();
  }

  getUserByEmail(email: string): User | undefined {
    return db.select().from(users).where(eq(users.email, email)).get();
  }

  createUser(email: string, passwordHash: string, name: string): User {
    return db
      .insert(users)
      .values({
        email,
        passwordHash,
        name,
        createdAt: new Date().toISOString(),
      })
      .returning()
      .get();
  }

  toSafeUser(user: User): SafeUser {
    const { passwordHash, ...safe } = user;
    return safe;
  }

  // Sessions
  createSession(token: string, userId: number, expiresAt: string): Session {
    return db
      .insert(sessions)
      .values({
        token,
        userId,
        expiresAt,
        createdAt: new Date().toISOString(),
      })
      .returning()
      .get();
  }

  getSessionByToken(token: string): Session | undefined {
    return db.select().from(sessions).where(eq(sessions.token, token)).get();
  }

  deleteSession(token: string): void {
    db.delete(sessions).where(eq(sessions.token, token)).run();
  }

  deleteExpiredSessions(): void {
    const now = new Date().toISOString();
    db.delete(sessions).where(lt(sessions.expiresAt, now)).run();
  }

  // Subscriptions
  getSubscriptionByUserId(userId: number): Subscription | undefined {
    return db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .get();
  }

  getSubscriptionByStripeCustomerId(stripeCustomerId: string): Subscription | undefined {
    return db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeCustomerId, stripeCustomerId))
      .get();
  }

  getSubscriptionByStripeSubscriptionId(stripeSubscriptionId: string): Subscription | undefined {
    return db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
      .get();
  }

  createSubscription(userId: number, data: Partial<Subscription>): Subscription {
    return db
      .insert(subscriptions)
      .values({
        userId,
        stripeCustomerId: data.stripeCustomerId || null,
        stripeSubscriptionId: data.stripeSubscriptionId || null,
        status: data.status || "inactive",
        plan: data.plan || null,
        currentPeriodEnd: data.currentPeriodEnd || null,
        createdAt: new Date().toISOString(),
      })
      .returning()
      .get();
  }

  updateSubscription(id: number, data: Partial<Subscription>): Subscription | undefined {
    const updateData: Record<string, any> = {};
    if (data.stripeCustomerId !== undefined) updateData.stripeCustomerId = data.stripeCustomerId;
    if (data.stripeSubscriptionId !== undefined) updateData.stripeSubscriptionId = data.stripeSubscriptionId;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.plan !== undefined) updateData.plan = data.plan;
    if (data.currentPeriodEnd !== undefined) updateData.currentPeriodEnd = data.currentPeriodEnd;

    if (Object.keys(updateData).length === 0) return this.getSubscriptionByUserId(data.userId || 0);

    return db
      .update(subscriptions)
      .set(updateData)
      .where(eq(subscriptions.id, id))
      .returning()
      .get();
  }

  activateSubscriptionForUser(userId: number, plan: string): Subscription {
    const existing = this.getSubscriptionByUserId(userId);
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);
    
    if (existing) {
      return db
        .update(subscriptions)
        .set({
          status: "active",
          plan,
          currentPeriodEnd: endDate.toISOString(),
        })
        .where(eq(subscriptions.id, existing.id))
        .returning()
        .get()!;
    }
    
    return this.createSubscription(userId, {
      status: "active",
      plan,
      currentPeriodEnd: endDate.toISOString(),
    });
  }
}

export const storage = new DatabaseStorage();
