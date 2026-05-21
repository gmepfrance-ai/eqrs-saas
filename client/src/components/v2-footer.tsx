/** Footer v2 — coordonnées GMEP + liens outils */
export function V2Footer() {
  return (
    <footer className="v2-footer" role="contentinfo">
      <div className="container">
        <div className="v2-footer-grid">
          <div className="v2-footer-company">
            <strong>G.M.E.P</strong>
            SARL G.M.E.P<br />
            Global Management of Environmental Project<br />
            9 rue de la Marne<br />
            79400 Saint-Maixent-l'École<br />
            SIREN 753 097 625<br />
            Tél. <a href="tel:+33607737233">06 07 73 72 33</a><br />
            <a href="mailto:gmep.france@gmail.com">gmep.france@gmail.com</a>
          </div>
          <div className="v2-footer-col">
            <h6>Nos outils</h6>
            <ul>
              <li>
                <a href="#/app">EQRS Johnson &amp; Ettinger</a>
              </li>
              <li>
                <a href="#/tsn">Transfert Sol → Nappe → Captage</a>
              </li>
              <li>
                <a href="#/rabattement">Rabattement de nappe IOTA</a>
              </li>
            </ul>
          </div>
          <div className="v2-footer-col">
            <h6>Société</h6>
            <ul>
              <li><a href="#/tarifs">Tarifs</a></li>
              <li><a href="#/mentions-legales">Mentions légales</a></li>
              <li><a href="#/cgv">CGV</a></li>
              <li><a href="/CGV_GMEP_2026.pdf" download="CGV_GMEP_2026.pdf">CGV (PDF)</a></li>
              <li><a href="#/contact">Contact</a></li>
            </ul>
          </div>
          <div className="v2-footer-col v2-footer-legal">
            <p>© 2023–2026 G.M.E.P — Tous droits réservés.</p>
            <p>
              Tous nos logiciels sont la propriété exclusive de la SARL G.M.E.P. Toute reproduction,
              diffusion ou utilisation, même partielle, sans autorisation écrite préalable est interdite.
            </p>
            <p className="credit">Conception et développement : Eric Azulay — Gérant SARL G.M.E.P</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
