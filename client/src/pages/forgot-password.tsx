import { useState } from "react";
import { navigateTo } from "@/lib/navigation";
import { V2Header } from "@/components/v2-header";
import { V2Footer } from "@/components/v2-footer";
import { useTranslation } from "@/lib/i18n";

const API_BASE = "__PORT_5000__".startsWith("__") ? "" : "__PORT_5000__";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
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
        setError(data.message || t("fp.errServer"));
      } else {
        if (data._code) {
          setCode(data._code);
          setInfo(t("fp.infoCode").replace("{code}", data._code));
        } else {
          setInfo(t("fp.infoSent"));
        }
        setStep("reset");
      }
    } catch {
      setError(t("fp.errServer"));
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError(t("fp.errPwdMismatch"));
      return;
    }
    if (newPassword.length < 8) {
      setError(t("fp.errPwdShort"));
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
      if (!res.ok) setError(data.message || t("fp.errServer"));
      else setStep("done");
    } catch {
      setError(t("fp.errServer"));
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
              <h1>{t("fp.doneTitle")}</h1>
              <p className="sub">{t("fp.doneSub")}</p>
              <button
                className="v2-btn v2-btn-primary v2-btn-block"
                onClick={() => (navigateTo("/login")}
              >
                {t("fp.signIn")}
              </button>
            </>
          ) : step === "reset" ? (
            <>
              <h1>{t("fp.resetTitle")}</h1>
              <p className="sub">{t("fp.resetSub")}</p>
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
                  <label htmlFor="code">{t("fp.code")}</label>
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
                  <label htmlFor="new-password">{t("fp.newPwd")}</label>
                  <input
                    type="password"
                    id="new-password"
                    data-testid="input-new-password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <span className="hint">{t("login.passwordHint")}</span>
                </div>
                <div className="v2-form-field">
                  <label htmlFor="confirm-password">{t("fp.confirmPwd")}</label>
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
                  {loading ? t("fp.resetting") : t("fp.reset")}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1>{t("fp.title")}</h1>
              <p className="sub">{t("fp.sub")}</p>
              {error && <div className="alert">{error}</div>}
              <form onSubmit={handleRequestCode}>
                <div className="v2-form-field">
                  <label htmlFor="email">{t("fp.email")}</label>
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
                  {loading ? t("fp.sending") : t("fp.send")}
                </button>
              </form>
            </>
          )}
          <p className="form-foot">
            <a href="/login">{t("fp.back")}</a>
          </p>
        </div>
      </div>
      <V2Footer />
    </div>
  );
}
