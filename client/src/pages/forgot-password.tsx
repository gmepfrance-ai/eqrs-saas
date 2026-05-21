import { useState } from "react";
import { V2Header } from "@/components/v2-header";
import { V2Footer } from "@/components/v2-footer";

const API_BASE = "__PORT_5000__".startsWith("__") ? "" : "__PORT_5000__";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "reset" | "done">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Erreur");
      } else {
        if (data._code) {
          setCode(data._code);
          setInfo(`Votre code de réinitialisation est : ${data._code}`);
        } else {
          setInfo(
            "Un code de réinitialisation a été envoyé à votre adresse e-mail. Vérifiez votre boîte de réception (et les spams).",
          );
        }
        setStep("reset");
      }
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if (newPassword.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.message || "Erreur");
      else setStep("done");
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="v2-page" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <V2Header />
      <div className="v2-auth-wrap" style={{ flex: 1 }}>
        <div className="v2-auth-card">
          {step === "done" ? (
            <>
              <h1>Mot de passe réinitialisé</h1>
              <p className="sub">Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
              <button
                className="v2-btn v2-btn-primary v2-btn-block"
                onClick={() => (window.location.hash = "#/login")}
              >
                Se connecter
              </button>
            </>
          ) : step === "reset" ? (
            <>
              <h1>Nouveau mot de passe</h1>
              <p className="sub">Saisissez le code reçu par email et votre nouveau mot de passe.</p>
              {info && (
                <div
                  className="alert"
                  style={{ background: "rgba(61,220,132,0.1)", borderColor: "rgba(61,220,132,0.3)", color: "#15803d" }}
                >
                  {info}
                </div>
              )}
              {error && <div className="alert">{error}</div>}
              <form onSubmit={handleReset}>
                <div className="v2-form-field">
                  <label htmlFor="code">Code de vérification</label>
                  <input
                    type="text"
                    id="code"
                    data-testid="input-reset-code"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="123456"
                    style={{ textAlign: "center", letterSpacing: "0.3em", fontFamily: "monospace" }}
                  />
                </div>
                <div className="v2-form-field">
                  <label htmlFor="new-password">Nouveau mot de passe</label>
                  <input
                    type="password"
                    id="new-password"
                    data-testid="input-new-password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <span className="hint">Au moins 8 caractères.</span>
                </div>
                <div className="v2-form-field">
                  <label htmlFor="confirm-password">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    id="confirm-password"
                    data-testid="input-confirm-password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="v2-btn v2-btn-primary v2-btn-block"
                  data-testid="button-reset-password"
                  disabled={loading}
                >
                  {loading ? "Réinitialisation…" : "Réinitialiser"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1>Mot de passe oublié</h1>
              <p className="sub">Saisissez votre email pour recevoir un code de réinitialisation.</p>
              {error && <div className="alert">{error}</div>}
              <form onSubmit={handleRequestCode}>
                <div className="v2-form-field">
                  <label htmlFor="email">Adresse email</label>
                  <input
                    type="email"
                    id="email"
                    data-testid="input-forgot-email"
                    required
                    placeholder="prenom.nom@bureau-etudes.fr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="v2-btn v2-btn-primary v2-btn-block"
                  data-testid="button-send-code"
                  disabled={loading}
                >
                  {loading ? "Envoi…" : "Envoyer le code"}
                </button>
              </form>
            </>
          )}
          <p className="form-foot">
            <a href="#/login">Retour à la connexion</a>
          </p>
        </div>
      </div>
      <V2Footer />
    </div>
  );
}
