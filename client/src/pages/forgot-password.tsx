import { useState } from "react";
import { GmepHeader } from "@/components/gmep-header";
import { GmepFooter } from "@/components/gmep-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Lock, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

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
          setInfo("Un code de réinitialisation a été envoyé à votre adresse e-mail. Vérifiez votre boîte de réception (et les spams).");
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
      if (!res.ok) {
        setError(data.message || "Erreur");
      } else {
        setStep("done");
      }
    } catch {
      setError("Erreur de connexion au serveur");
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
            
            {step === "done" ? (
              <div className="text-center py-4">
                <CheckCircle2 className="w-12 h-12 text-[#2ecc71] mx-auto mb-4" />
                <h2 className="text-lg font-bold text-foreground mb-2">
                  Mot de passe modifié
                </h2>
                <p className="text-xs text-muted-foreground mb-6">
                  Votre mot de passe a été réinitialisé avec succès.
                </p>
                <Button
                  className="w-full"
                  onClick={() => (window.location.hash = "#/login")}
                >
                  Se connecter
                </Button>
              </div>
            ) : step === "reset" ? (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-lg font-bold text-foreground">
                    Nouveau mot de passe
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Entrez le code reçu par e-mail et votre nouveau mot de passe
                  </p>
                </div>

                <form onSubmit={handleReset} className="space-y-4">
                  {info && (
                    <div className="bg-[#2ecc71]/10 text-[#27ae60] text-xs rounded-md p-3 border border-[#2ecc71]/20 font-mono text-center tracking-wider">
                      {info}
                    </div>
                  )}
                  {error && (
                    <div className="bg-destructive/10 text-destructive text-xs rounded-md p-3 border border-destructive/20">
                      {error}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="code" className="text-xs font-medium">
                      Code de vérification
                    </Label>
                    <Input
                      id="code"
                      data-testid="input-reset-code"
                      type="text"
                      placeholder="123456"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="text-sm text-center tracking-widest font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="new-password" className="text-xs font-medium">
                      Nouveau mot de passe
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="new-password"
                        data-testid="input-new-password"
                        type="password"
                        placeholder="Min. 8 caractères"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-9 text-sm"
                        required
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
                      />
                    </div>
                  </div>

                  <Button
                    data-testid="button-reset-password"
                    type="submit"
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Réinitialiser le mot de passe
                  </Button>
                </form>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-lg font-bold text-foreground">
                    Mot de passe oublié
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Entrez votre adresse e-mail pour recevoir un code de réinitialisation
                  </p>
                </div>

                <form onSubmit={handleRequestCode} className="space-y-4">
                  {error && (
                    <div className="bg-destructive/10 text-destructive text-xs rounded-md p-3 border border-destructive/20">
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
                        data-testid="input-forgot-email"
                        type="email"
                        placeholder="vous@exemple.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9 text-sm"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    data-testid="button-send-code"
                    type="submit"
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Envoyer le code
                  </Button>
                </form>
              </>
            )}

            <p className="text-center text-xs text-muted-foreground mt-4">
              <Link
                href="/login"
                className="text-primary hover:underline"
              >
                Retour à la connexion
              </Link>
            </p>
          </div>
        </div>
      </div>

      <GmepFooter />
    </div>
  );
}
