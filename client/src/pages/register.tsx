import { useState } from "react";
import { V2Header } from "@/components/v2-header";
import { V2Footer } from "@/components/v2-footer";
import { useAuth } from "@/lib/auth";

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [societe, setSociete] = useState("");
  const [password, setPassword] = useState("");
  const [cgu, setCgu] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!cgu) {
      setError("Veuillez accepter les CGV et la politique de confidentialité.");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setLoading(true);
    try {
      const fullName = societe ? `${name} (${societe})` : name;
      await register(fullName, email, password);
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
    <div className="v2-page" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <V2Header />
      <div className="v2-auth-wrap" style={{ flex: 1 }}>
        <div className="v2-auth-card">
          <h1>Créer un compte</h1>
          <p className="sub">Essai gratuit 8 à 14 jours, aucune carte bancaire requise.</p>

          {error && (
            <div className="alert" data-testid="text-register-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="v2-form-field">
              <label htmlFor="reg-nom">Nom complet</label>
              <input
                type="text"
                id="reg-nom"
                data-testid="input-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="v2-form-field">
              <label htmlFor="reg-email">Adresse email professionnelle</label>
              <input
                type="email"
                id="reg-email"
                data-testid="input-email"
                required
                autoComplete="email"
                placeholder="prenom.nom@bureau-etudes.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="v2-form-field">
              <label htmlFor="reg-societe">Société / bureau d'études</label>
              <input
                type="text"
                id="reg-societe"
                value={societe}
                onChange={(e) => setSociete(e.target.value)}
              />
            </div>
            <div className="v2-form-field">
              <label htmlFor="reg-password">Mot de passe</label>
              <input
                type="password"
                id="reg-password"
                data-testid="input-password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="hint">Au moins 8 caractères, incluant lettres et chiffres.</span>
            </div>
            <div className="v2-form-field">
              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  fontWeight: 400,
                  fontSize: 13.5,
                }}
              >
                <input
                  type="checkbox"
                  required
                  checked={cgu}
                  onChange={(e) => setCgu(e.target.checked)}
                  style={{ width: "auto", marginTop: 3 }}
                />
                <span>
                  J'accepte les <a href="#/cgv">CGV</a> et la politique de confidentialité (
                  <a href="#/mentions-legales">mentions légales</a>).
                </span>
              </label>
            </div>
            <button
              type="submit"
              className="v2-btn v2-btn-primary v2-btn-block"
              data-testid="button-register"
              disabled={loading}
            >
              {loading ? "Création en cours…" : "Créer mon compte"}
            </button>
          </form>

          <p className="form-foot">
            Déjà inscrit ?{" "}
            <a href="#/login" data-testid="link-to-login">
              Se connecter
            </a>
          </p>
        </div>
      </div>
      <V2Footer />
    </div>
  );
}
