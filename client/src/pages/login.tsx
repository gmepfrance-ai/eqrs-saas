import { useState } from "react";
import { V2Header } from "@/components/v2-header";
import { V2Footer } from "@/components/v2-footer";
import { useAuth } from "@/lib/auth";

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
    <div className="v2-page" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <V2Header />
      <div className="v2-auth-wrap" style={{ flex: 1 }}>
        <div className="v2-auth-card">
          <h1>Connexion</h1>
          <p className="sub">Accédez à votre espace abonné pour utiliser les logiciels GMEP.</p>

          {error && (
            <div className="alert" data-testid="text-login-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="v2-form-field">
              <label htmlFor="login-email">Adresse email</label>
              <input
                type="email"
                id="login-email"
                data-testid="input-email"
                required
                autoComplete="username"
                placeholder="prenom.nom@bureau-etudes.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="v2-form-field">
              <label htmlFor="login-password">Mot de passe</label>
              <input
                type="password"
                id="login-password"
                data-testid="input-password"
                required
                minLength={8}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="hint">Au moins 8 caractères.</span>
            </div>
            <button
              type="submit"
              className="v2-btn v2-btn-primary v2-btn-block"
              data-testid="button-login"
              disabled={loading}
            >
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>

          <p className="form-foot">
            <a href="#/forgot-password" data-testid="link-forgot-password">
              Mot de passe oublié ?
            </a>
          </p>
          <p className="form-foot">
            Pas encore de compte ?{" "}
            <a href="#/register" data-testid="link-to-register">
              Créer un compte
            </a>
          </p>
        </div>
      </div>
      <V2Footer />
    </div>
  );
}
