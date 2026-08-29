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
  tool: string | null;       // "je" | "tsn" | "bundle"
  currentPeriodEnd: string | null;
  licenseKey: string | null;
  createdAt: string;
  reminderJ3SentAt?: string | null;
  reminderExpirySentAt?: string | null;
}

// Codes d'essai administration (DREAL / DRIEAT / ARS / DDT) — campagne
// d'information réglementaire, site "Bis" sans tarifs (administration.gmep-france.eu)
export interface TrialCode {
  id: number;
  code: string;
  organismeType: string;      // "DREAL" | "DRIEAT" | "ARS" | "DDT"
  organismeNom: string;       // ex. "DREAL Auvergne-Rhône-Alpes"
  contactEmail: string | null;
  status: string;             // "unused" | "used" | "expired"
  userId: number | null;
  usedAt: string | null;
  expiresTrialAt: string | null;
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
