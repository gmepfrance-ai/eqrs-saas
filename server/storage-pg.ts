import { Pool } from "pg";
import * as crypto from "crypto";
import {
  type User,
  type SafeUser,
  type Session,
  type Subscription,
} from "@shared/schema";
import { type IStorage } from "./storage";

function generateLicenseKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const segment = () =>
    Array.from({ length: 4 }, () => chars[crypto.randomInt(chars.length)]).join("");
  return `EQRS-${segment()}-${segment()}-${segment()}`;
}

interface PageView {
  date: string;
  country: string;
  countryCode: string;
  city: string;
  path: string;
  ip: string;
}

// Convert snake_case DB rows to camelCase objects
function rowToUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    name: row.name,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };
}

function rowToSession(row: any): Session {
  return {
    id: row.id,
    token: row.token,
    userId: row.user_id,
    expiresAt: row.expires_at instanceof Date ? row.expires_at.toISOString() : row.expires_at,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };
}

function rowToSubscription(row: any): Subscription {
  return {
    id: row.id,
    userId: row.user_id,
    stripeCustomerId: row.stripe_customer_id,
    stripeSubscriptionId: row.stripe_subscription_id,
    status: row.status,
    plan: row.plan,
    currentPeriodEnd: row.current_period_end instanceof Date
      ? row.current_period_end.toISOString()
      : row.current_period_end,
    licenseKey: row.license_key,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };
}

function rowToPageView(row: any): PageView {
  return {
    date: row.date instanceof Date ? row.date.toISOString() : row.date,
    country: row.country,
    countryCode: row.country_code,
    city: row.city,
    path: row.path,
    ip: row.ip,
  };
}

export class PgStorage implements IStorage {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes("railway") || process.env.DATABASE_URL?.includes("neon")
        ? { rejectUnauthorized: false }
        : false,
    });
    // Run auto-migration at startup
    this.initializeTables().catch((err) => {
      console.error("Failed to initialize PostgreSQL tables:", err);
    });
  }

  private async initializeTables(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          name TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS sessions (
          id SERIAL PRIMARY KEY,
          token TEXT UNIQUE NOT NULL,
          user_id INTEGER REFERENCES users(id),
          expires_at TIMESTAMPTZ NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS subscriptions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          stripe_customer_id TEXT,
          stripe_subscription_id TEXT,
          status TEXT DEFAULT 'inactive',
          plan TEXT,
          current_period_end TIMESTAMPTZ,
          license_key TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS page_views (
          id SERIAL PRIMARY KEY,
          date TIMESTAMPTZ DEFAULT NOW(),
          country TEXT,
          country_code TEXT,
          city TEXT,
          path TEXT,
          ip TEXT
        );
      `);
      console.log("[PgStorage] Tables initialized successfully");
    } finally {
      client.release();
    }
  }

  // ── Users ─────────────────────────────────────────────

  async getUser(id: number): Promise<User | undefined> {
    const result = await this.pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0] ? rowToUser(result.rows[0]) : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0] ? rowToUser(result.rows[0]) : undefined;
  }

  async getUserCount(): Promise<number> {
    const result = await this.pool.query("SELECT COUNT(*) as count FROM users");
    return parseInt(result.rows[0].count, 10);
  }

  async getAllUserEmails(): Promise<string[]> {
    const result = await this.pool.query("SELECT email FROM users ORDER BY id");
    return result.rows.map((r) => r.email);
  }

  async createUser(email: string, passwordHash: string, name: string): Promise<User> {
    const result = await this.pool.query(
      "INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING *",
      [email, passwordHash, name]
    );
    return rowToUser(result.rows[0]);
  }

  async updateUserPassword(email: string, newPasswordHash: string): Promise<void> {
    await this.pool.query(
      "UPDATE users SET password_hash = $1 WHERE email = $2",
      [newPasswordHash, email]
    );
  }

  toSafeUser(user: User): SafeUser {
    const { passwordHash, ...safe } = user;
    return safe;
  }

  // ── Sessions ───────────────────────────────────────────

  async createSession(token: string, userId: number, expiresAt: string): Promise<Session> {
    const result = await this.pool.query(
      "INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3) RETURNING *",
      [token, userId, expiresAt]
    );
    return rowToSession(result.rows[0]);
  }

  async getSessionByToken(token: string): Promise<Session | undefined> {
    const result = await this.pool.query(
      "SELECT * FROM sessions WHERE token = $1",
      [token]
    );
    return result.rows[0] ? rowToSession(result.rows[0]) : undefined;
  }

  async deleteSession(token: string): Promise<void> {
    await this.pool.query("DELETE FROM sessions WHERE token = $1", [token]);
  }

  async deleteExpiredSessions(): Promise<void> {
    await this.pool.query("DELETE FROM sessions WHERE expires_at < NOW()");
  }

  // ── Subscriptions ──────────────────────────────────────

  async getSubscriptionByUserId(userId: number): Promise<Subscription | undefined> {
    const result = await this.pool.query(
      "SELECT * FROM subscriptions WHERE user_id = $1",
      [userId]
    );
    return result.rows[0] ? rowToSubscription(result.rows[0]) : undefined;
  }

  async getSubscriptionByStripeCustomerId(stripeCustomerId: string): Promise<Subscription | undefined> {
    const result = await this.pool.query(
      "SELECT * FROM subscriptions WHERE stripe_customer_id = $1",
      [stripeCustomerId]
    );
    return result.rows[0] ? rowToSubscription(result.rows[0]) : undefined;
  }

  async getSubscriptionByStripeSubscriptionId(stripeSubscriptionId: string): Promise<Subscription | undefined> {
    const result = await this.pool.query(
      "SELECT * FROM subscriptions WHERE stripe_subscription_id = $1",
      [stripeSubscriptionId]
    );
    return result.rows[0] ? rowToSubscription(result.rows[0]) : undefined;
  }

  async createSubscription(userId: number, data: Partial<Subscription>): Promise<Subscription> {
    const licenseKey = data.licenseKey || generateLicenseKey();
    const result = await this.pool.query(
      `INSERT INTO subscriptions (user_id, stripe_customer_id, stripe_subscription_id, status, plan, current_period_end, license_key)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        userId,
        data.stripeCustomerId || null,
        data.stripeSubscriptionId || null,
        data.status || "inactive",
        data.plan || null,
        data.currentPeriodEnd || null,
        licenseKey,
      ]
    );
    return rowToSubscription(result.rows[0]);
  }

  async updateSubscription(id: number, data: Partial<Subscription>): Promise<Subscription | undefined> {
    // Build SET clause dynamically only for provided fields
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.stripeCustomerId !== undefined) {
      fields.push(`stripe_customer_id = $${idx++}`);
      values.push(data.stripeCustomerId);
    }
    if (data.stripeSubscriptionId !== undefined) {
      fields.push(`stripe_subscription_id = $${idx++}`);
      values.push(data.stripeSubscriptionId);
    }
    if (data.status !== undefined) {
      fields.push(`status = $${idx++}`);
      values.push(data.status);
    }
    if (data.plan !== undefined) {
      fields.push(`plan = $${idx++}`);
      values.push(data.plan);
    }
    if (data.currentPeriodEnd !== undefined) {
      fields.push(`current_period_end = $${idx++}`);
      values.push(data.currentPeriodEnd);
    }
    if (data.licenseKey !== undefined) {
      fields.push(`license_key = $${idx++}`);
      values.push(data.licenseKey);
    }

    if (fields.length === 0) {
      return this.getSubscriptionByUserId(id);
    }

    values.push(id);
    const result = await this.pool.query(
      `UPDATE subscriptions SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );
    return result.rows[0] ? rowToSubscription(result.rows[0]) : undefined;
  }

  async activateSubscriptionForUser(userId: number, plan: string): Promise<Subscription> {
    const existing = await this.getSubscriptionByUserId(userId);
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    if (existing) {
      const licenseKey = existing.licenseKey || generateLicenseKey();
      const result = await this.pool.query(
        `UPDATE subscriptions SET status = 'active', plan = $1, current_period_end = $2, license_key = $3
         WHERE id = $4 RETURNING *`,
        [plan, endDate.toISOString(), licenseKey, existing.id]
      );
      return rowToSubscription(result.rows[0]);
    }

    return this.createSubscription(userId, {
      status: "active",
      plan,
      currentPeriodEnd: endDate.toISOString(),
    });
  }

  // ── Page Views ─────────────────────────────────────────

  async addPageView(view: {
    country: string;
    countryCode: string;
    city: string;
    path: string;
    ip: string;
  }): Promise<void> {
    await this.pool.query(
      `INSERT INTO page_views (country, country_code, city, path, ip) VALUES ($1, $2, $3, $4, $5)`,
      [view.country, view.countryCode, view.city, view.path, view.ip]
    );
  }

  async getPageViews(): Promise<PageView[]> {
    const result = await this.pool.query(
      "SELECT * FROM page_views ORDER BY date DESC LIMIT 10000"
    );
    return result.rows.map(rowToPageView);
  }

  async getViewStats(): Promise<{
    byCountry: Record<string, number>;
    byDate: Record<string, number>;
    total: number;
    byCity: Record<string, number>;
  }> {
    const [countryRes, dateRes, totalRes, cityRes] = await Promise.all([
      this.pool.query(
        "SELECT country, COUNT(*) as count FROM page_views GROUP BY country ORDER BY count DESC"
      ),
      this.pool.query(
        "SELECT DATE(date) as d, COUNT(*) as count FROM page_views GROUP BY d ORDER BY d"
      ),
      this.pool.query("SELECT COUNT(*) as total FROM page_views"),
      this.pool.query(
        "SELECT city, country_code, COUNT(*) as count FROM page_views GROUP BY city, country_code ORDER BY count DESC LIMIT 30"
      ),
    ]);

    const byCountry: Record<string, number> = {};
    for (const row of countryRes.rows) {
      byCountry[row.country || "Inconnu"] = parseInt(row.count, 10);
    }

    const byDate: Record<string, number> = {};
    for (const row of dateRes.rows) {
      const dateStr =
        row.d instanceof Date
          ? row.d.toISOString().split("T")[0]
          : String(row.d);
      byDate[dateStr] = parseInt(row.count, 10);
    }

    const byCity: Record<string, number> = {};
    for (const row of cityRes.rows) {
      const cityLabel = row.city
        ? `${row.city} (${row.country_code})`
        : (row.country_code || "Inconnu");
      byCity[cityLabel] = parseInt(row.count, 10);
    }

    const total = parseInt(totalRes.rows[0].total, 10);

    return { byCountry, byDate, total, byCity };
  }
}
