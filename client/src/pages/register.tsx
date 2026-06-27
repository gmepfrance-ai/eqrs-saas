import { useState } from "react";
import { V2Header } from "@/components/v2-header";
import { V2Footer } from "@/components/v2-footer";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";

export default function RegisterPage() {
  const { register } = useAuth();
  const { t } = useTranslation();
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
      setError(t("register.errCgu"));
      return;
    }
    if (password.length < 8) {
      setError(t("register.errPwd"));
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
          setError(parsed.message || t("register.errDefault"));
        } catch {
          setError(match[1] || t("register.errDefault"));
        }
      } else {
        setError(t("register.errGeneric"));
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
          <h1>{t("register.title")}</h1>
          <p className="sub">{t("register.sub")}</p>

          {error && (
            <div className="alert" data-testid="text-register-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="v2-form-field">
              <label htmlFor="reg-nom">{t("register.name")}</label>
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
              <label htmlFor="reg-email">{t("register.email")}</label>
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
              <label htmlFor="reg-societe">{t("register.company")}</label>
              <input
                type="text"
                id="reg-societe"
                value={societe}
                onChange={(e) => setSociete(e.target.value)}
              />
            </div>
            <div className="v2-form-field">
              <label htmlFor="reg-password">{t("register.password")}</label>
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
              <span className="hint">{t("register.passwordHint")}</span>
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
                  {t("register.cgu.before")}<a href="/cgv">{t("register.cgu.cgvLink")}</a>
                  {t("register.cgu.middle")}
                  <a href="/mentions-legales">{t("register.cgu.mlLink")}</a>
                  {t("register.cgu.after")}
                </span>
              </label>
            </div>
            <button
              type="submit"
              className="v2-btn v2-btn-primary v2-btn-block"
              data-testid="button-register"
              disabled={loading}
            >
              {loading ? t("register.submitting") : t("register.submit")}
            </button>
          </form>

          <p className="form-foot">
            {t("register.already")}{" "}
            <a href="/login" data-testid="link-to-login">
              {t("register.signIn")}
            </a>
          </p>
        </div>
      </div>
      <V2Footer />
    </div>
  );
}
