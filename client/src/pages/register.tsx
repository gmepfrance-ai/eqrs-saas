import { useState } from "react";
import { GmepHeader } from "@/components/gmep-header";
import { GmepFooter } from "@/components/gmep-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { Loader2, Mail, Lock, User } from "lucide-react";
import { Link } from "wouter";

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password);
    } catch (err: any) {
      const msg = err.message || "";
      const match = msg.match(/^\d+:\s*(.+)/);
      if (match) {
        try {
          const parsed = JSON.parse(match[1]);
          setError(parsed.message || "Erreur lors de l'inscription");
        } catch {
          setError(match[1] || "Erreur lors de l'inscription");
        }
      } else {
        setError("Erreur lors de l'inscription. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <GmepHeader />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="bg-card border border-card-border rounded-lg p-6 shadow-sm">
            <div className="text-center mb-6">
              <h2 className="text-lg font-bold text-foreground" data-testid="text-register-title">
                Créer un compte
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Inscrivez-vous pour accéder à l'outil EQRS
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div
                  data-testid="text-register-error"
                  className="bg-destructive/10 text-destructive text-xs rounded-md p-3 border border-destructive/20"
                >
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-medium">
                  Nom complet
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    data-testid="input-name"
                    type="text"
                    placeholder="Jean Dupont"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-9 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium">
                  Adresse e-mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    data-testid="input-email"
                    type="email"
                    placeholder="vous@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    data-testid="input-password"
                    type="password"
                    placeholder="Min. 8 caractères"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 text-sm"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm-password" className="text-xs font-medium">
                  Confirmer le mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    data-testid="input-confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9 text-sm"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <Button
                data-testid="button-register"
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Créer mon compte
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-4">
              Déjà un compte ?{" "}
              <Link
                href="/login"
                data-testid="link-to-login"
                className="text-primary hover:underline font-medium"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>

      <GmepFooter />
    </div>
  );
}
