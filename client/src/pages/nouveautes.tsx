import { V2Header } from "@/components/v2-header";
import { V2Footer } from "@/components/v2-footer";
import { navigateTo } from "@/lib/navigation";

/** Page publique "Nouveautés / Notes de version" — notes de version v15.89 du logiciel de rabattement. */
export default function NouveautesPage() {
  const improvements: { title: string; body: string }[] = [
    {
      title: "Moteur de choix de substratum automatique",
      body:
        "le logiciel détermine désormais automatiquement le substratum (mur de l'aquifère) le plus pertinent à partir des données saisies (coupes, niveaux, formations géologiques). Ce moteur intelligent réduit les erreurs de saisie manuelle, accélère la préparation du modèle et fiabilise le calcul du rabattement en sélectionnant la base hydrogéologique la plus cohérente.",
    },
    {
      title: "Correction du bug d'aquifère aberrant",
      body:
        "résolution d'une anomalie qui pouvait, dans certaines configurations, retenir une épaisseur ou une profondeur d'aquifère incohérente (valeur aberrante) et fausser le calcul du rabattement et de la zone d'influence. Les résultats sont désormais cohérents et robustes quelles que soient les données géologiques fournies.",
    },
    {
      title: "Génération PDF fiabilisée",
      body:
        "le bouton de téléchargement du dossier PDF est désormais accessible directement depuis l'onglet Résultats, avec un export complet sans interruption.",
    },
    {
      title: "Lanceur Windows renforcé",
      body:
        "la version bureautique (Excel + script) gère désormais correctement les chemins OneDrive et la détection automatique de Python, sans fermeture intempestive de la fenêtre.",
    },
    {
      title: "Résolution géographique corrigée",
      body:
        "conversion Lambert 93 → WGS84 et tracé de la zone d'influence plus précis sur la carte.",
    },
    {
      title: "Robustesse Excel",
      body:
        "correction du déclenchement de la génération depuis la feuille Sommaire et fiabilisation des liens internes du classeur.",
    },
  ];

  return (
    <div className="v2-page" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <V2Header />

      {/* Hero */}
      <section
        style={{
          background: "linear-gradient(135deg, #0d1b2e 0%, #1a2b4a 100%)",
          color: "#fff",
          padding: "64px 0",
        }}
      >
        <div className="container" style={{ textAlign: "center" }}>
          <h1 style={{ color: "#fff" }}>Nouveautés du logiciel de rabattement</h1>
          <p className="lead" style={{ color: "rgba(255,255,255,0.85)", maxWidth: 760, margin: "0 auto" }}>
            Suivez les dernières évolutions de notre logiciel de modélisation du rabattement de nappe
            (méthode TSN). Ces améliorations sont disponibles dès maintenant pour les abonnés et les
            utilisateurs en essai gratuit de 8 jours.
          </p>
        </div>
      </section>

      <main style={{ flex: 1 }}>
        <section className="v2-section">
          <div className="container" style={{ maxWidth: 860 }}>
            {/* Carte version */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderLeft: "4px solid #2563eb",
                borderRadius: 12,
                padding: "28px 32px",
                boxShadow: "0 1px 3px rgba(0,0,0,.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px 16px",
                  marginBottom: 20,
                }}
              >
                <span
                  style={{
                    background: "#2563eb",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.03em",
                    textTransform: "uppercase",
                    padding: "5px 12px",
                    borderRadius: 999,
                    whiteSpace: "nowrap",
                  }}
                >
                  Nouveauté v15.89
                </span>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0d1b2e", margin: 0 }}>
                  Évolutions du logiciel de rabattement
                </h2>
                <span style={{ fontSize: 13.5, color: "#6b7280", marginLeft: "auto" }}>Juin 2026</span>
              </div>

              <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 14 }}>
                {improvements.map((item) => (
                  <li key={item.title} style={{ fontSize: 15, lineHeight: 1.6, color: "#1f2937" }}>
                    <strong style={{ color: "#1d4ed8" }}>{item.title}</strong> — {item.body}
                  </li>
                ))}
              </ul>
            </div>

            {/* Encart abonnement */}
            <div
              style={{
                marginTop: 40,
                padding: "28px 32px",
                background: "#f0f7ff",
                border: "1px solid #bfdbfe",
                borderRadius: 12,
                textAlign: "center",
              }}
            >
              <h3 style={{ margin: "0 0 12px 0", fontSize: 18, color: "#0d1b2e" }}>
                Essai gratuit de 8 jours
              </h3>
              <p style={{ margin: "0 auto 24px", maxWidth: 640, fontSize: 14.5, color: "#374151", lineHeight: 1.7 }}>
                Essai gratuit de 8 jours, puis abonnement annuel 1 500 € HT/an renouvelable
                (renouvellement manuel sans reconduction ni prélèvement automatique). Projets et
                calculs illimités pendant toute la durée de l'abonnement.
              </p>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,
                  justifyContent: "center",
                }}
              >
                <button
                  className="v2-btn v2-btn-primary"
                  onClick={() => navigateTo("/tarifs")}
                >
                  Découvrir les tarifs
                </button>
                <button
                  className="v2-btn v2-btn-blue"
                  onClick={() => navigateTo("/subscribe-rabattement")}
                >
                  Essai gratuit 8 jours
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <V2Footer />
    </div>
  );
}
