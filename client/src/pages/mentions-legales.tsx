import { V2Header } from "@/components/v2-header";
import { V2Footer } from "@/components/v2-footer";

export default function MentionsLegalesPage() {
  return (
    <div className="v2-page" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <V2Header />
      <main style={{ flex: 1 }}>
        <div className="v2-legal-page">
          <div className="container">
            <article>
              <h1>Mentions légales</h1>
              <p className="updated">Dernière mise à jour : janvier 2026</p>

              <h2>1. Éditeur du site</h2>
              <p>
                <strong>SARL G.M.E.P</strong> — Global Management of Environmental Project<br />
                Siège social : 9 rue de la Marne, 79400 Saint-Maixent-l'École, France<br />
                SIREN : 753 097 625 — SIRET : 75309762500010<br />
                Forme juridique : Société à responsabilité limitée (SARL)<br />
                Capital social : 5 000 €<br />
                Téléphone : 06 07 73 72 33 — Email :{" "}
                <a href="mailto:gmep.france@gmail.com">gmep.france@gmail.com</a>
                <br />
                Directeur de la publication : Eric Azulay, gérant.
              </p>

              <h2>2. Hébergeur</h2>
              <p>
                Railway Corp. — 548 Market St PMB 80435, San Francisco, CA 94104, États-Unis —{" "}
                <a href="https://railway.com" target="_blank" rel="noopener noreferrer">
                  railway.com
                </a>
                . Données stockées sur infrastructure européenne.
              </p>

              <h2>3. Propriété intellectuelle</h2>
              <p>
                L'ensemble des contenus présents sur ce site (textes, images, logos, logiciels SaaS
                EQRS Johnson &amp; Ettinger, Transfert Sol → Nappe → Captage, Rabattement de nappe,
                codes sources, schémas, illustrations) est la propriété exclusive de la SARL
                G.M.E.P, sauf mention contraire. Toute reproduction, diffusion, modification,
                transmission ou utilisation, même partielle, sans autorisation écrite préalable de
                la SARL G.M.E.P est strictement interdite et constitue une contrefaçon sanctionnée
                par les articles L.335-2 et suivants du Code de la propriété intellectuelle.
              </p>

              <h2>4. Données personnelles (RGPD)</h2>
              <p>
                Les données personnelles collectées via les formulaires (inscription, contact,
                paiement) sont traitées conformément au Règlement (UE) 2016/679 (RGPD) et à la loi
                « Informatique et Libertés » du 6 janvier 1978 modifiée.
              </p>
              <h3>Responsable du traitement</h3>
              <p>SARL G.M.E.P — gmep.france@gmail.com</p>
              <h3>DPO (Délégué à la Protection des Données)</h3>
              <p>
                <em>À désigner selon les volumes traités.</em> En l'absence de DPO désigné, les
                demandes peuvent être adressées au gérant : gmep.france@gmail.com.
              </p>
              <h3>Finalités du traitement</h3>
              <ul>
                <li>Gestion des comptes utilisateurs (essais et abonnés).</li>
                <li>Facturation et exécution des contrats d'abonnement SaaS.</li>
                <li>Réponse aux demandes de contact.</li>
                <li>Statistiques anonymisées d'utilisation du site.</li>
              </ul>
              <h3>Vos droits</h3>
              <p>
                Vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, de
                portabilité et d'opposition concernant vos données personnelles. Vous pouvez
                exercer ces droits à tout moment en écrivant à{" "}
                <a href="mailto:gmep.france@gmail.com">gmep.france@gmail.com</a>. Vous disposez
                également du droit d'introduire une réclamation auprès de la CNIL (
                <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">
                  www.cnil.fr
                </a>
                ).
              </p>
              <h3>Durée de conservation</h3>
              <p>
                Les données des comptes d'essai sont conservées pour la durée de l'essai (8 à 14
                jours) puis supprimées sauf souscription. Les données des abonnés sont conservées
                pendant toute la durée du contrat puis archivées 10 ans pour obligations
                comptables et fiscales.
              </p>

              <h2>5. Cookies</h2>
              <p>
                Ce site dépose uniquement des cookies techniques nécessaires à son fonctionnement
                (session, authentification, paiement Stripe). Aucun cookie de mesure d'audience ou
                publicitaire n'est utilisé sans votre consentement explicite. Vous pouvez
                configurer votre navigateur pour bloquer les cookies à tout moment.
              </p>

              <h2>6. Paiement sécurisé</h2>
              <p>
                Les paiements sont traités par <strong>Stripe Payments Europe Ltd</strong>{" "}
                (PCI-DSS niveau 1). Aucune donnée bancaire (numéro de carte, CVV) ne transite ni
                n'est stockée par la SARL G.M.E.P.
              </p>

              <h2>7. Limitation de responsabilité</h2>
              <p>
                Les logiciels GMEP fournissent des calculs sur la base de modèles scientifiques
                reconnus (EPA 2004, Domenico 1987, Theis, Dupuit-Thiem). Ils constituent une aide
                à la décision pour les bureaux d'études et hydrogéologues — l'utilisateur reste
                responsable de l'interprétation, de la validation et de l'usage des résultats
                produits dans ses livrables réglementaires.
              </p>

              <h2>8. Droit applicable</h2>
              <p>
                Les présentes mentions légales sont régies par le droit français. Tout litige
                relèvera du Tribunal judiciaire de Niort, sauf disposition d'ordre public
                contraire.
              </p>
            </article>
          </div>
        </div>
      </main>
      <V2Footer />
    </div>
  );
}
