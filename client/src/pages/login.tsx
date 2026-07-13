import { useState, useEffect } from "react";
import { V2Header } from "@/components/v2-header";
import { V2Footer } from "@/components/v2-footer";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useTranslation();

  // Récupère un plan transmis depuis le site marketing (ex: ?plan=ssp3d_monthly)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const plan = params.get("plan");
    if (plan) {
      localStorage.setItem("pending_plan", plan);
    }
  }, []);
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
          setError(parsed.message || t("login.errorDefault"));
        } catch {
          setError(match[1] || t("login.errorDefault"));
        }
      } else {
        setError(t("login.errorGeneric"));
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
          <h1>{t("login.title")}</h1>
          <p className="sub">{t("login.sub")}</p>

          {error && (
            <div className="alert" data-testid="text-login-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="v2-form-field">
              <label htmlFor="login-email">{t("login.email")}</label>
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
              <label htmlFor="login-password">{t("login.password")}</label>
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
              <span className="hint">{t("login.passwordHint")}</span>
            </div>
            <button
              type="submit"
              className="v2-btn v2-btn-primary v2-btn-block"
              data-testid="button-login"
              disabled={loading}
            >
              {loading ? t("login.submitting") : t("login.submit")}
            </button>
          </form>

          <p className="form-foot">
            <a href="/forgot-password" data-testid="link-forgot-password">
              {t("login.forgot")}
            </a>
          </p>
          <p className="form-foot">
            {t("login.noAccount")}{" "}
            <a href="/register" data-testid="link-to-register">
              {t("login.createAccount")}
            </a>
          </p>
        </div>
      </div>
      <V2Footer />
    </div>
  );
}
