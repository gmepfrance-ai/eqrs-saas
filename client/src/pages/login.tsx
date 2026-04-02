import { useState } from "react";
import { GmepHeader } from "@/components/gmep-header";
import { GmepFooter } from "@/components/gmep-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { Loader2, Mail, Lock } from "lucide-react";
import { Link } from "wouter";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      const msg = err.message || "";
      // Extract the message part after the status code
      const match = msg.match(/^\d+:\s*(.+)/);
      if (match) {
        try {
          const parsed = JSON.parse(match[1]);
          setError(parsed.message || "Erreur de connexion");
        } catch {
          setError(match[1] || "Erreur de connexion");
        }
      } else {
        setError("Erreur de connexion. Veuillez réessayer.");
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
              <h2 className="text-lg font-bold text-foreground" data-testid="text-login-title">
                Connexion
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Accédez à votre espace EQRS
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div
                  data-testid="text-login-error"
                  className="bg-destructive/10 text-destructive text-xs rounded-md p-3 border border-destructive/20"
                >
                  {error}
                </div>
              )}

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
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 text-sm"
                    required
                  />
                </div>
              </div>

              <Button
                data-testid="button-login"
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Se connecter
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-3">
              <Link
                href="/forgot-password"
                data-testid="link-forgot-password"
                className="text-primary hover:underline"
              >
                Mot de passe oublié ?
              </Link>
            </p>

            <p className="text-center text-xs text-muted-foreground mt-2">
              Pas encore de compte ?{" "}
              <Link
                href="/register"
                data-testid="link-to-register"
                className="text-primary hover:underline font-medium"
              >
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>

      <GmepFooter />
    </div>
  );
}
