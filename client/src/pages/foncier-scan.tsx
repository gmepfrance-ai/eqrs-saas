import { useState, useEffect } from "react";
import { navigateTo } from "@/lib/navigation";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import {
  MapPinned,
  AlertTriangle,
  Layers,
  FileSpreadsheet,
  Ruler,
  Landmark,
  ArrowRight,
  Loader2,
  Mail,
  Phone,
} from "lucide-react";

/**
 * FONCIER-SCAN — page de présentation dédiée aux services développement
 * (promoteurs, aménageurs, enseignes commerciales).
 *
 * Cette page est volontairement autonome : identité visuelle, discours et
 * parcours d'abonnement propres, sans rattachement au catalogue des outils
 * SSP / hydrogéologie, qui ne s'adresse pas aux mêmes utilisateurs.
 */

const NAVY = "#0d1b24";
const NAVY_2 = "#132736";
const AMBRE = "#e2a35e";
const AMBRE_CLAIR = "#f0c08a";

function Pastille({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block text-[11px] font-semibold uppercase tracking-[0.12em] px-3 py-1 rounded-full"
      style={{ background: "rgba(226,163,94,0.14)", color: AMBRE_CLAIR }}
    >
      {children}
    </span>
  );
}

function Carte({
  icone,
  titre,
  children,
}: {
  icone: React.ReactNode;
  titre: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl p-6 h-full"
      style={{ background: NAVY_2, border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
        style={{ background: "rgba(226,163,94,0.14)", color: AMBRE }}
      >
        {icone}
      </div>
      <h3 className="text-[15px] font-bold text-white mb-2">{titre}</h3>
      <p className="text-[13.5px] leading-relaxed" style={{ color: "#a8bcc9" }}>
        {children}
      </p>
    </div>
  );
}

export default function FoncierScanPage() {
  const { user, token } = useAuth();
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    document.title =
      "FONCIER-SCAN — recherche de fonciers et risque pollution | G.M.E.P";
  }, []);

  async function demarrerEssai() {
    if (!user || !token) {
      localStorage.setItem("pending_plan", "foncier_scan_trial");
      navigateTo("/register");
      return;
    }
    setChargement(true);
    setErreur("");
    try {
      await apiRequest(
        "POST",
        `/api/foncier-scan-trial/activate?token=${token}`,
        {}
      );
      window.location.href = `/api/foncier-scan-tool?token=${token}`;
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.startsWith("409:") || msg.toLowerCase().includes("déjà un accès")) {
        window.location.href = `/api/foncier-scan-tool?token=${token}`;
        return;
      }
      setErreur(
        "L'activation de l'essai a échoué. Écrivez-nous à gmep.france@gmail.com."
      );
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: NAVY }}>
      {/* Barre d'en-tête propre au produit */}
      <header
        className="px-5 py-3 flex items-center gap-4 flex-wrap"
        style={{
          background: "rgba(0,0,0,0.25)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <svg viewBox="0 0 120 32" height="26" aria-label="G.M.E.P">
          <path
            d="M10 0c-3 4-5.5 7.5-5.5 11A5.5 5.5 0 1 0 15.5 11c0-3.5-2.5-7-5.5-11z"
            fill="#39e07a"
          />
          <ellipse cx="8.5" cy="12.5" rx="1.6" ry="2.4" fill="rgba(255,255,255,0.55)" />
          <text
            x="22"
            y="22"
            fill="#ffffff"
            fontFamily="Inter, sans-serif"
            fontWeight="700"
            fontSize="17"
            letterSpacing=".5"
          >
            G.M.E.P
          </text>
        </svg>
        <span
          className="text-[11.5px] leading-snug"
          style={{ color: "#8ba3b4", borderLeft: "1px solid rgba(255,255,255,0.14)", paddingLeft: "14px" }}
        >
          Outils de gestion développés par G.M.E.P
          <br />
          Éditeur de logiciels SSP et hydrologie
        </span>
        <div className="ml-auto flex items-center gap-2">
          {user && token ? (
            <a
              href={`/api/foncier-scan-tool?token=${token}`}
              className="text-[13px] font-semibold px-4 py-2 rounded-lg"
              style={{ background: AMBRE, color: NAVY }}
            >
              Ouvrir l'outil
            </a>
          ) : (
            <button
              onClick={() => navigateTo("/login")}
              className="text-[13px] font-medium px-4 py-2 rounded-lg"
              style={{ color: "#cfe0ea", border: "1px solid rgba(255,255,255,0.18)" }}
            >
              Se connecter
            </button>
          )}
        </div>
      </header>

      <main className="flex-1">
        {/* Bandeau principal */}
        <section className="px-5 py-16 max-w-[1080px] mx-auto">
          <Pastille>Logiciel destiné aux services développement</Pastille>
          <h1
            className="mt-5 font-extrabold text-white"
            style={{ fontSize: "clamp(30px, 5vw, 46px)", lineHeight: 1.12, maxWidth: "20ch" }}
          >
            FONCIER-SCAN
          </h1>
          <p
            className="mt-4 text-[17px] leading-relaxed"
            style={{ color: "#b8cbd8", maxWidth: "62ch" }}
          >
            Identifier, dans une agglomération donnée, les fonciers qui
            correspondent réellement à un programme — et mesurer immédiatement
            le risque de pollution qui pèsera sur l'opération.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={demarrerEssai}
              disabled={chargement}
              className="inline-flex items-center gap-2 font-bold text-[14.5px] px-6 py-3.5 rounded-lg"
              style={{ background: AMBRE, color: NAVY }}
            >
              {chargement ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              {user ? "Démarrer l'essai de 8 jours" : "Créer un compte et essayer 8 jours"}
            </button>
            <button
              onClick={() => navigateTo("/subscribe-foncier-scan")}
              className="text-[14px] font-medium px-6 py-3.5 rounded-lg"
              style={{ color: "#cfe0ea", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              Tarif et abonnement
            </button>
            <span className="text-[12.5px]" style={{ color: "#7f97a8" }}>
              Sans carte bancaire · aucune installation
            </span>
          </div>

          {erreur && (
            <p className="mt-4 text-[13px]" style={{ color: "#ffb3a7" }}>
              {erreur}
            </p>
          )}
        </section>

        {/* Origine de l'outil — retour d'expérience */}
        <section
          className="px-5 py-14"
          style={{ background: NAVY_2, borderTop: "1px solid rgba(255,255,255,0.07)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="max-w-[1080px] mx-auto grid md:grid-cols-[1.15fr_1fr] gap-10 items-start">
            <div>
              <Pastille>Origine de l'outil</Pastille>
              <h2 className="mt-4 text-[26px] font-extrabold text-white leading-tight">
                Né du retour d'expérience du concepteur, pas d'un cahier des
                charges théorique
              </h2>
              <div
                className="mt-5 space-y-4 text-[14.5px] leading-relaxed"
                style={{ color: "#b8cbd8" }}
              >
                <p>
                  FONCIER-SCAN a été conçu par Eric Azulay, responsable
                  conception et modélisation de G.M.E.P, à partir de plusieurs
                  années d'études de pollution, de diagnostics de sites et de
                  dossiers réglementaires menés pour le compte de promoteurs,
                  d'aménageurs et de collectivités.
                </p>
                <p>
                  Ces missions font toutes apparaître la même difficulté côté
                  développement foncier : la recherche du terrain et
                  l'appréciation du risque environnemental sont conduites
                  séparément. Le foncier est sécurisé, parfois signé, puis les
                  antécédents industriels se révèlent — ancienne installation
                  classée, activité BASIAS non répertoriée dans l'acte, secteur
                  d'information sur les sols grevant la parcelle. Le programme
                  est alors renégocié, retardé, ou abandonné.
                </p>
                <p>
                  L'outil répond à ce besoin précis, exprimé par les services
                  développement eux-mêmes : voir sur une même carte les fonciers
                  compatibles avec le programme et leur passif environnemental,
                  avant l'engagement.
                </p>
              </div>
            </div>

            <div
              className="rounded-xl p-6"
              style={{ background: "rgba(226,163,94,0.07)", border: "1px solid rgba(226,163,94,0.25)" }}
            >
              <h3 className="text-[15px] font-bold mb-4" style={{ color: AMBRE_CLAIR }}>
                Le risque pris en compte en amont
              </h3>
              <ul className="space-y-3 text-[13.5px] leading-relaxed" style={{ color: "#c9dae5" }}>
                <li>
                  <strong className="text-white">Fonciers dégradés</strong> —
                  remblais, anciennes emprises industrielles, friches en cours
                  de reconversion.
                </li>
                <li>
                  <strong className="text-white">Anciennes ICPE</strong> —
                  installations classées cessées, dont la mémoire conditionne le
                  coût de dépollution et les obligations du maître d'ouvrage.
                </li>
                <li>
                  <strong className="text-white">Secteurs d'information sur les sols (SIS)</strong>{" "}
                  — servitude d'information qui impose une attestation de prise
                  en compte de la pollution pour tout projet de construction.
                </li>
                <li>
                  <strong className="text-white">
                    BASIAS, BASOL, CASIAS, cessations d'activité
                  </strong>{" "}
                  — antécédents consultés parcelle par parcelle, avec la
                  distance au projet.
                </li>
              </ul>
              <p className="mt-5 text-[12.5px]" style={{ color: "#8ba3b4" }}>
                L'outil signale le risque et le documente. Il ne remplace ni un
                diagnostic de pollution, ni une étude de sols : il indique quand
                l'engager, et sur quel terrain.
              </p>
            </div>
          </div>
        </section>

        {/* Ce que fait l'outil */}
        <section className="px-5 py-16 max-w-[1080px] mx-auto">
          <Pastille>Fonctions</Pastille>
          <h2 className="mt-4 text-[26px] font-extrabold text-white leading-tight">
            Une recherche par nom d'agglomération, six critères métier
          </h2>
          <div className="mt-9 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Carte icone={<MapPinned className="w-4 h-4" />} titre="Recherche par agglomération">
              Saisir le nom d'une agglomération de plus de 20 000 habitants et
              obtenir les fonciers disponibles qui répondent aux caractéristiques
              du programme recherché.
            </Carte>
            <Carte icone={<Ruler className="w-4 h-4" />} titre="Trois programmes calibrés">
              Logements et résidences de 3 000 à 4 000 m², restauration rapide de
              2 000 à 5 000 m², commerce alimentaire de 5 000 à 10 000 m².
            </Carte>
            <Carte icone={<Landmark className="w-4 h-4" />} titre="ZAC et ronds-points d'entrée">
              Filtrage des terrains situés dans une ZAC ou à proximité
              immédiate, et des implantations sur les ronds-points d'entrée
              d'agglomération.
            </Carte>
            <Carte icone={<AlertTriangle className="w-4 h-4" />} titre="Passif environnemental">
              Antécédents ICPE, BASIAS, BASOL, CASIAS et secteurs d'information
              sur les sols rapprochés de chaque parcelle examinée.
            </Carte>
            <Carte icone={<Layers className="w-4 h-4" />} titre="Données parcellaires complètes">
              Numéro de parcelle, coordonnées Lambert 93 X/Y, altitude NGF,
              adresse, nature des activités actuelles ou passées, contact et
              prix de vente du foncier.
            </Carte>
            <Carte icone={<FileSpreadsheet className="w-4 h-4" />} titre="Restitution exploitable">
              Cartographie sur fonds IGN, tableau de comparaison, fiche foncier
              détaillée et export pour le comité d'engagement.
            </Carte>
          </div>
        </section>

        {/* Appel à l'action */}
        <section
          className="px-5 py-14"
          style={{ background: NAVY_2, borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="max-w-[1080px] mx-auto text-center">
            <h2 className="text-[24px] font-extrabold text-white">
              Essayer l'outil sur votre propre secteur
            </h2>
            <p className="mt-3 text-[14.5px]" style={{ color: "#b8cbd8" }}>
              Huit jours d'accès complet, sans carte bancaire. Rien à installer :
              l'outil s'ouvre depuis votre compte.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <button
                onClick={demarrerEssai}
                disabled={chargement}
                className="inline-flex items-center gap-2 font-bold text-[14.5px] px-6 py-3.5 rounded-lg"
                style={{ background: AMBRE, color: NAVY }}
              >
                {chargement ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
                Démarrer l'essai de 8 jours
              </button>
              <button
                onClick={() => navigateTo("/subscribe-foncier-scan")}
                className="text-[14px] font-medium px-6 py-3.5 rounded-lg"
                style={{ color: "#cfe0ea", border: "1px solid rgba(255,255,255,0.2)" }}
              >
                Voir le tarif
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Pied de page propre au produit */}
      <footer
        className="px-5 py-10"
        style={{ background: "rgba(0,0,0,0.3)", borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="max-w-[1080px] mx-auto grid sm:grid-cols-2 gap-8">
          <div>
            <p className="text-[13px] font-bold text-white mb-1">
              Contact pour renseignements
            </p>
            <p className="text-[13px] leading-relaxed" style={{ color: "#a8bcc9" }}>
              Eric Azulay — responsable conception et modélisation
              <br />
              SARL G.M.E.P — 9 rue de la Marne, 79400 Saint-Maixent-l'École
            </p>
            <p className="mt-2 text-[13px] flex flex-wrap gap-x-4 gap-y-1" style={{ color: "#a8bcc9" }}>
              <a href="tel:+33606637233" className="inline-flex items-center gap-1.5 hover:text-white">
                <Phone className="w-3.5 h-3.5" /> 06 06 63 72 33
              </a>
              <a href="tel:+33549168382" className="inline-flex items-center gap-1.5 hover:text-white">
                <Phone className="w-3.5 h-3.5" /> 05 49 16 83 82
              </a>
              <a href="mailto:gmep.france@gmail.com" className="inline-flex items-center gap-1.5 hover:text-white">
                <Mail className="w-3.5 h-3.5" /> gmep.france@gmail.com
              </a>
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-[12.5px]" style={{ color: "#8ba3b4" }}>
              Outils de gestion développés par G.M.E.P
              <br />
              Éditeur de logiciels SSP et hydrologie
            </p>
            <p className="mt-3 text-[12px]" style={{ color: "#6f879a" }}>
              SIREN 753 097 625 ·{" "}
              <a href="#/mentions-legales" className="hover:text-white underline">
                Mentions légales
              </a>{" "}
              ·{" "}
              <a href="#/cgv" className="hover:text-white underline">
                CGV
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
