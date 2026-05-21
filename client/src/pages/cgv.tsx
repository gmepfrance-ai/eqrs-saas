import { V2Header } from "@/components/v2-header";
import { V2Footer } from "@/components/v2-footer";

export default function CgvPage() {
  return (
    <div className="v2-page" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <V2Header />
      <main style={{ flex: 1 }}>
        <div className="v2-legal-page">
          <div className="container">
            <article>
              <h1>Conditions générales de vente</h1>
              <p className="updated">Version en vigueur — mai 2026 (rév. licence mono-poste)</p>
              <div style={{ margin: "16px 0 24px 0" }}>
                <a
                  href="/CGV_GMEP_2026.pdf"
                  download="CGV_GMEP_2026.pdf"
                  className="v2-btn v2-btn-blue"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}
                  data-testid="button-download-cgv"
                >
                  ⬇ Télécharger les CGV (PDF — 3 pages)
                </a>
              </div>

              <h2>1. Objet du contrat</h2>
              <p>
                Les présentes conditions générales de vente (CGV) régissent la mise à disposition,
                par la SARL G.M.E.P (ci-après « l'Éditeur »), au profit du client (ci-après
                « l'Abonné »), de logiciels en mode SaaS (Software as a Service) :{" "}
                <strong>EQRS Johnson &amp; Ettinger</strong>,{" "}
                <strong>Transfert Sol → Nappe → Captage</strong> et{" "}
                <strong>Rabattement de nappe</strong>. La souscription à un abonnement entraîne
                l'acceptation pleine et entière des présentes CGV.
              </p>

              <h2>2. Prix et modalités de paiement</h2>
              <p>
                Les prix sont indiqués en euros, hors taxes (HT). La TVA applicable dépend du pays
                de facturation de l'Abonné (cf. mentions de la page Tarifs et art. 278, 294, 259-1
                du CGI).
              </p>
              <ul>
                <li>
                  <strong>EQRS Johnson &amp; Ettinger</strong> — mensuel : 245 € HT/mois ; annuel :
                  2 499 € HT/an.
                </li>
                <li>
                  <strong>Transfert Sol → Nappe → Captage</strong> — annuel : 850 € HT/an.
                </li>
                <li>
                  <strong>Rabattement de nappe</strong> — annuel : 1 100 € HT/an.
                </li>
              </ul>
              <p>
                Le paiement s'effectue exclusivement par carte bancaire via{" "}
                <strong>Stripe Payments Europe Ltd</strong>, prestataire certifié PCI-DSS. Une
                facture conforme est transmise à l'Abonné par e-mail dans les 48 h ouvrées suivant
                le paiement.
              </p>

              <h2>3. Durée et résiliation</h2>
              <p>
                L'abonnement <strong>mensuel</strong> est conclu pour une durée d'un mois,
                renouvelable par tacite reconduction sauf résiliation par l'Abonné avant
                l'échéance via son espace client ou par e-mail à gmep.france@gmail.com.
              </p>
              <p>
                L'abonnement <strong>annuel</strong> est conclu pour une durée d'un an, sans
                renouvellement automatique. À l'échéance, l'Abonné peut souscrire à nouveau s'il
                le souhaite.
              </p>
              <p>
                En cas de manquement grave de l'une des parties (impayé, usage frauduleux),
                l'autre partie peut résilier de plein droit après mise en demeure restée sans
                effet 15 jours.
              </p>

              <h2>4. Accès au service</h2>
              <p>
                L'accès est ouvert immédiatement après validation du paiement, via les
                identifiants créés par l'Abonné. L'Éditeur s'engage à une disponibilité
                raisonnable du service (cible : 99 % hors maintenances planifiées) sans pour
                autant garantir une disponibilité ininterrompue.
              </p>

              <h2>5. Essai gratuit</h2>
              <p>
                Un essai gratuit est offert avant souscription (8 jours pour Rabattement, 14 jours
                pour EQRS J&amp;E et Domenico). Il donne accès à une version limitée (PDF marqués
                « DÉMO », fonctionnalités réduites pour J&amp;E). Aucune carte bancaire n'est
                requise pour activer l'essai.
              </p>

              <h2>6. Propriété intellectuelle</h2>
              <p>
                Les logiciels et leurs contenus sont la propriété exclusive de la SARL G.M.E.P.
                L'abonnement confère un droit d'usage personnel, non exclusif et non
                transmissible. Toute reproduction, redistribution, ingénierie inverse ou revente
                est interdite et passible de poursuites au titre des articles L.335-2 et suivants
                du Code de la propriété intellectuelle.
              </p>

              <h2>7. Licence mono-poste et clé d'activation</h2>
              <p>
                Chaque abonnement souscrit (EQRS Johnson &amp; Ettinger, Transfert Sol → Nappe →
                Captage, Rabattement de nappe) ouvre droit à <strong>une licence mono-poste</strong>{" "}
                associée à une <strong>clé d'activation unique</strong>, strictement liée à un seul
                poste de travail (ordinateur).
              </p>
              <p>
                La clé d'activation est <strong>personnelle, incessible et non partageable</strong>.
                Elle ne peut être transférée, communiquée à un tiers, ni utilisée simultanément
                sur plusieurs ordinateurs. Toute tentative d'usage sur plusieurs postes avec une
                même clé entraîne la suspension immédiate de l'accès, sans remboursement.
              </p>
              <p>
                Pour une utilisation sur <strong>N postes</strong> au sein d'une même entreprise,
                l'Abonné doit souscrire <strong>N abonnements distincts</strong>, chacun bénéficiant
                de sa propre clé d'activation et de la durée (mensuelle ou annuelle) choisie. Chaque
                licence supplémentaire est facturée au même tarif unitaire que la première.
              </p>
              <p>
                Le remplacement d'un poste (changement de matériel, panne, vol) ouvre droit à une
                nouvelle clé d'activation sur demande écrite à{" "}
                <a href="mailto:gmep.france@gmail.com">gmep.france@gmail.com</a>, sans surcoût,
                dans la limite d'un transfert par an et par licence.
              </p>

              <h2>8. Données personnelles</h2>
              <p>
                L'Éditeur traite les données personnelles de l'Abonné conformément au RGPD. Voir{" "}
                <a href="#/mentions-legales">mentions légales</a> pour le détail des finalités,
                durées et droits de l'Abonné.
              </p>

              <h2>9. Confidentialité des calculs</h2>
              <p>
                Les paramètres saisis par l'Abonné (données de projet, coordonnées, valeurs de
                calcul) restent strictement confidentiels. Les calculs s'exécutent côté
                navigateur (client) ou sur un serveur dédié, sans réutilisation à des fins
                commerciales par l'Éditeur.
              </p>

              <h2>10. Limitation de responsabilité</h2>
              <p>
                Les résultats produits par les logiciels constituent une aide à la décision.
                L'Abonné conserve la responsabilité pleine et entière de leur interprétation,
                validation et utilisation dans ses livrables professionnels et réglementaires
                (rapports IEM, dossiers Loi sur l'Eau, etc.). La responsabilité de l'Éditeur ne
                pourra être engagée pour des dommages indirects (perte de chiffre d'affaires,
                perte de chance, etc.) résultant d'une mauvaise interprétation ou d'un usage
                inadapté des résultats.
              </p>

              <h2>11. Force majeure</h2>
              <p>
                Aucune des parties ne pourra être tenue responsable d'une inexécution résultant
                d'un cas de force majeure au sens de l'article 1218 du Code civil.
              </p>

              <h2>12. Droit applicable et juridiction</h2>
              <p>
                Les présentes CGV sont soumises au droit français. À défaut de résolution
                amiable, tout litige relèvera de la compétence exclusive du{" "}
                <strong>Tribunal judiciaire de Niort</strong>, nonobstant pluralité de défendeurs
                ou appel en garantie.
              </p>

              <h2>13. Contact</h2>
              <p>
                Pour toute question sur les présentes CGV :{" "}
                <a href="mailto:gmep.france@gmail.com">gmep.france@gmail.com</a> — SARL G.M.E.P, 9
                rue de la Marne, 79400 Saint-Maixent-l'École.
              </p>
            </article>
          </div>
        </div>
      </main>
      <V2Footer />
    </div>
  );
}
