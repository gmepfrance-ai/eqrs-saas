import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const sessions = sqliteTable("sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  token: text("token").notNull().unique(),
  userId: integer("user_id").notNull().references(() => users.id),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const subscriptions = sqliteTable("subscriptions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  status: text("status").notNull().default("inactive"), // 'active', 'canceled', 'past_due', 'trialing', 'inactive'
  plan: text("plan"), // 'monthly', 'annual'
  currentPeriodEnd: text("current_period_end"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  passwordHash: true,
}).extend({
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  name: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Adresse e-mail invalide"),
});

export const loginSchema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  createdAt: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// Safe user type (without password hash)
export type SafeUser = Omit<User, "passwordHash">;
