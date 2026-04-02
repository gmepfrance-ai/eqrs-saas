import { z } from "zod";

// Types
export interface User {
  id: number;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
}

export interface Session {
  id: number;
  token: string;
  userId: number;
  expiresAt: string;
  createdAt: string;
}

export interface Subscription {
  id: number;
  userId: number;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  status: string;
  plan: string | null;
  currentPeriodEnd: string | null;
  createdAt: string;
}

// Validation schemas
export const insertUserSchema = z.object({
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  name: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Adresse e-mail invalide"),
});

export const loginSchema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

// Derived types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SafeUser = Omit<User, "passwordHash">;
