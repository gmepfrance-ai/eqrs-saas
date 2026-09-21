import { useState } from "react";
import { navigateTo } from "@/lib/navigation";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { Check, ArrowLeft, CreditCard, Loader2, MapPinned } from "lucide-react";

/**
 * FONCIER-SCAN — page d'abonnement dédiée.
 * Produit dissocié du catalogue SSP / hydrogéologie : licence annuelle propre,
 * aucun accès accordé par l'abonnement groupé de la suite.
 */

const NAVY = "#0d1b24";
const NAVY_2 = "#132736";
const AMBRE = "#e2a35e";

function Ligne({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: AMBRE }} />
      <span>{children}</span>
    </li>
  );
}

export default function SubscribeFoncierScanPage() {
  const { user, token } = useAuth();
  const [chargement, setChargement] = useState(false);
  const [essaiEnCours, setEssaiEnCours] = useState(false);
  const [erreur, setErreur] = useState("");

  async function demarrerEssai() {
    if (!user || !token) {
      localStorage.setItem("pending_plan", "foncier_scan_trial");
      navigateTo("/register");
      return;
    }
    setEssaiEnCours(true);
    setErreur("");
    try {
      await apiRequest("POST", `/api/foncier-scan-trial/activate?token=${token}`, {});
      window.location.href = `/api/foncier-scan-tool?token=${token}`;
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.startsWith("409:") || msg.toLowerCase().includes("déjà un accès")) {
        window.location.href = `/api/foncier-scan-tool?token=${token}`;
        return;
      }
      const m = msg.match(/^\d+:\s*(.+)/);
      if (m) {
        try {
          setErreur(JSON.parse(m[1]).message || m[1]);
        } catch {
          setErreur(m[1]);
        }
      } else {
        setErreur("Erreur lors de l'activation de l'essai.");
      }
    } finally {
      setEssaiEnCours(false);
    }
  }

  async function sabonner() {
    if (!user || !token) {
      localStorage.setItem("pending_plan", "foncier_scan_annual");
      navigateTo("/register");
      return;
    }
    setChargement(true);
    setErreur("");
    try {
      const res = await apiRequest("POST", `/api/stripe/create-checkout?token=${token}`, {
        plan: "foncier_scan_annual",
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setErreur(data.message || "Erreur lors de la création du paiement");
      }
    } catch {
      setErreur("Erreur lors de la création du paiement. Veuillez réessayer.");
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: NAVY }}>
      <div className="flex-1 px-4 py-12 max-w-lg mx-auto w-full">
        <button
          onClick={() => navigateTo("/foncier-scan")}
          className="flex items-center gap-1 text-xs mb-8"
          style={{ color: "#8ba3b4" }}
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Retour à la présentation
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: AMBRE, color: NAVY }}
          >
            <MapPinned className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">FONCIER-SCAN</h1>
            <p className="text-xs" style={{ color: "#8ba3b4" }}>
              Recherche de fonciers et risque pollution — licence annuelle
            </p>
          </div>
        </div>

        <div
          className="rounded-xl p-6 shadow-md relative"
          style={{ background: NAVY_2, border: `2px solid ${AMBRE}` }}
        >
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold px-4 py-1 rounded-full"
            style={{ background: AMBRE, color: NAVY }}
          >
            Licence annuelle
          </div>

          <div className="flex items-baseline gap-1 mb-1 mt-2">
            <span className="text-4xl font-extrabold text-white">2 500 €</span>
            <span className="text-sm" style={{ color: "#8ba3b4" }}>
              HT/an/poste
            </span>
          </div>
          <p className="text-xs mb-6" style={{ color: "#8ba3b4" }}>
            3 000 € TTC/an (TVA 20 %). Facturation annuelle, résiliable à
            l'échéance.
          </p>

          <ul className="space-y-2 mb-6 text-sm" style={{ color: "#c9dae5" }}>
            <Ligne>Recherche des fonciers par nom d'agglomération (plus de 20 000 habitants)</Ligne>
            <Ligne>Trois programmes : logements et résidences 3 000-4 000 m², restauration rapide 2 000-5 000 m², commerce alimentaire 5 000-10 000 m²</Ligne>
            <Ligne>Filtres ZAC, proximité immédiate de ZAC et ronds-points d'entrée d'agglomération</Ligne>
            <Ligne>Antécédents ICPE, BASIAS, BASOL, CASIAS et secteurs d'information sur les sols</Ligne>
            <Ligne>Parcelle, Lambert 93 X/Y, altitude NGF, adresse, activités passées, contact, prix du foncier</Ligne>
            <Ligne>Cartographie sur fonds IGN, tableau comparatif et fiche foncier</Ligne>
            <Ligne>Licence mono-poste, mises à jour incluses, support par courriel</Ligne>
          </ul>

          {erreur && (
            <div
              className="text-xs rounded-md p-3 mb-4"
              style={{ background: "rgba(255,120,100,0.12)", border: "1px solid rgba(255,120,100,0.35)", color: "#ffbdb0" }}
            >
              {erreur}
            </div>
          )}

          <button
            className="w-full font-semibold text-sm py-3 rounded-lg inline-flex items-center justify-center gap-2"
            style={{ background: AMBRE, color: NAVY }}
            disabled={chargement}
            onClick={sabonner}
          >
            {chargement ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CreditCard className="w-4 h-4" />
            )}
            {user ? "Procéder au paiement" : "S'inscrire et s'abonner"}
          </button>

          <div className="relative my-4 flex items-center">
            <div className="flex-1 border-t" style={{ borderColor: "rgba(255,255,255,0.14)" }} />
            <span className="mx-3 text-xs" style={{ color: "#8ba3b4" }}>
              ou
            </span>
            <div className="flex-1 border-t" style={{ borderColor: "rgba(255,255,255,0.14)" }} />
          </div>

          <button
            className="w-full text-sm font-medium py-3 rounded-lg inline-flex items-center justify-center gap-2"
            style={{ color: "#cfe0ea", border: "1px solid rgba(255,255,255,0.22)" }}
            disabled={essaiEnCours}
            onClick={demarrerEssai}
          >
            {essaiEnCours ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {user ? "Essai gratuit 8 jours" : "S'inscrire + essai gratuit 8 jours"}
          </button>

          {!user && (
            <p className="text-center text-xs mt-3" style={{ color: "#8ba3b4" }}>
              Déjà un compte ?{" "}
              <button
                className="underline font-medium"
                style={{ color: AMBRE }}
                onClick={() => {
                  localStorage.setItem("pending_plan", "foncier_scan_annual");
                  navigateTo("/login");
                }}
              >
                Se connecter
              </button>
            </p>
          )}
        </div>

        <div
          className="mt-4 rounded-lg p-4 text-xs leading-relaxed"
          style={{ background: "rgba(226,163,94,0.08)", border: "1px solid rgba(226,163,94,0.25)", color: "#d8c3a6" }}
        >
          <strong className="text-white">À noter :</strong> FONCIER-SCAN est un
          produit distinct de la suite SSP et hydrogéologie de G.M.E.P. Son
          abonnement est indépendant et n'est pas compris dans l'abonnement
          groupé de la suite. Renseignements : Eric Azulay —{" "}
          <a href="tel:+33606637233" className="underline">
            06 06 63 72 33
          </a>{" "}
          ·{" "}
          <a href="mailto:gmep.france@gmail.com" className="underline">
            gmep.france@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
