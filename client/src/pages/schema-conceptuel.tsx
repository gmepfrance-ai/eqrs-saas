import { V2Header } from "@/components/v2-header";
import { V2Footer } from "@/components/v2-footer";
import { useAuth } from "@/lib/auth";

/** Page produit — Schéma Conceptuel (IEM + Plan de Gestion) */
export default function SchemaConceptuelPage() {
  const { user, token } = useAuth();

  function subscribe() {
    localStorage.setItem("pending_plan", "schema_conceptuel_annual");
    window.location.hash = "#/subscribe-schema-conceptuel";
  }

  function startTrial() {
    if (!user || !token) {
      window.location.hash = "#/register";
      return;
    }
    window.location.href = `/api/schema-conceptuel-tool?token=${token}`;
  }

  return (
    <div className="v2-page" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <V2Header />

      {/* === HERO === */}
      <section className="v2-hero">
        <div className="container">
          <div className="v2-hero-grid">
            <div>
              <span className="v2-hero-badge" style={{ background: "linear-gradient(135deg,#39e07a 0%,#1a5276 100%)", color: "#fff" }}>
                OUTIL IEM + PG
              </span>
              <h1>Schéma Conceptuel — Source › Vecteur › Cible</h1>
              <p className="lead">
                Outil de visualisation interactive du modèle conceptuel SSP pour la réalisation des{" "}
                <strong>Interprétations de l'État des Milieux (IEM)</strong> et des <strong>Plans de Gestion (PG)</strong> selon
                la méthodologie nationale MEEM/MTES 2017. Connexion native <strong>EQRS V31.05</strong> + <strong>EQRS ECOTOX V8</strong>.
                Idéal pour les BE SSP, hydrogéologues, industriels HSE/ICPE et collectivités, aménageurs et promoteurs.
              </p>
              <div className="v2-hero-cta">
                <button className="v2-btn v2-btn-primary" style={{ cursor: "pointer", border: "none" }} onClick={subscribe}>
                  S'abonner — 850 € HT/an
                </button>
                <button className="v2-btn v2-btn-outline" style={{ cursor: "pointer", border: "none" }} onClick={startTrial}>Essai gratuit 14 jours</button>
                <a href="#/contact" className="v2-btn v2-btn-outline">Démo sur demande</a>
              </div>
            </div>
            <div className="v2-hero-mock" aria-hidden="true">
              <div className="v2-hero-mock-head">
                <span className="dot" style={{ background: "#ed5d5d" }}></span>
                <span className="dot" style={{ background: "#f5b94d" }}></span>
                <span className="dot" style={{ background: "#62c87f" }}></span>
                <span className="label">schéma · conceptuel</span>
              </div>
              <svg viewBox="0 0 280 120" style={{ width: "100%", height: "auto", fontFamily: "Inter,sans-serif" }}>
                <rect x="8" y="20" width="74" height="80" rx="8" fill="rgba(192,57,43,0.18)" stroke="#c0392b" strokeWidth="1.5" />
                <text x="45" y="16" fontSize="9" fill="rgba(255,255,255,0.7)" textAnchor="middle">SOURCE</text>
                <text x="45" y="55" fontSize="8" fill="#fff" textAnchor="middle">Sols pollués</text>
                <text x="45" y="70" fontSize="8" fill="#fff" textAnchor="middle">Eaux sout.</text>
                <rect x="103" y="20" width="74" height="80" rx="8" fill="rgba(245,185,77,0.18)" stroke="#f5b94d" strokeWidth="1.5" />
                <text x="140" y="16" fontSize="9" fill="rgba(255,255,255,0.7)" textAnchor="middle">VECTEUR</text>
                <text x="140" y="55" fontSize="8" fill="#fff" textAnchor="middle">Intrusion vap.</text>
                <text x="140" y="70" fontSize="8" fill="#fff" textAnchor="middle">Chaîne troph.</text>
                <rect x="198" y="20" width="74" height="80" rx="8" fill="rgba(61,224,122,0.18)" stroke="#39e07a" strokeWidth="1.5" />
                <text x="235" y="16" fontSize="9" fill="rgba(255,255,255,0.7)" textAnchor="middle">CIBLE</text>
                <text x="235" y="55" fontSize="8" fill="#fff" textAnchor="middle">Adultes/enfants</text>
                <text x="235" y="70" fontSize="8" fill="#fff" textAnchor="middle">Faune / AEP</text>
                <path d="M82 60h21" stroke="#39e07a" strokeWidth="2" markerEnd="url(#ah)" />
                <path d="M177 60h21" stroke="#39e07a" strokeWidth="2" markerEnd="url(#ah)" />
                <defs>
                  <marker id="ah" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0 0l6 3-6 3z" fill="#39e07a" />
                  </marker>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* === 1. PRÉSENTATION + GRAND SCHÉMA === */}
      <section className="v2-section">
        <div className="container">
          <div className="v2-section-head">
            <span className="v2-section-eyebrow">Présentation</span>
            <h2>Le modèle conceptuel SSP visualisé en un coup d'œil</h2>
            <p>
              Un schéma SVG interactif structuré en trois sections — sources, vecteurs et cibles — alimenté directement par les
              résultats des modules EQRS.
            </p>
          </div>

          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: 32, marginBottom: 32 }}>
            <svg viewBox="0 0 900 300" style={{ width: "100%", height: "auto", fontFamily: "Inter,sans-serif" }} role="img" aria-label="Schéma conceptuel Source Vecteur Cible">
              {/* SOURCE */}
              <rect x="20" y="40" width="240" height="220" rx="14" fill="#fdecea" stroke="#c0392b" strokeWidth="2" />
              <text x="140" y="30" fontSize="15" fontWeight="700" fill="#c0392b" textAnchor="middle">SOURCES / MILIEUX</text>
              <g fontSize="13" fill="#1f2937">
                <text x="44" y="80">• Sols pollués</text>
                <text x="44" y="112">• Eaux souterraines</text>
                <text x="44" y="144">• Eaux superficielles</text>
                <text x="44" y="176">• Sols saturés</text>
              </g>
              {/* VECTEUR */}
              <rect x="330" y="40" width="240" height="220" rx="14" fill="#fff7e8" stroke="#d97706" strokeWidth="2" />
              <text x="450" y="30" fontSize="15" fontWeight="700" fill="#d97706" textAnchor="middle">VECTEURS / VOIES</text>
              <g fontSize="12.5" fill="#1f2937">
                <text x="352" y="76">• Intrusion de vapeurs</text>
                <text x="352" y="104">• Ingestion de sol / d'eau</text>
                <text x="352" y="132">• Inhalation de poussières</text>
                <text x="352" y="160">• Contact cutané</text>
                <text x="352" y="188">• Chaîne trophique</text>
                <text x="352" y="216">• Transfert nappe → captage</text>
              </g>
              {/* CIBLE */}
              <rect x="640" y="40" width="240" height="220" rx="14" fill="#eafaf1" stroke="#1a5276" strokeWidth="2" />
              <text x="760" y="30" fontSize="15" fontWeight="700" fill="#1a5276" textAnchor="middle">CIBLES</text>
              <g fontSize="13" fill="#1f2937">
                <text x="664" y="80">• Adultes</text>
                <text x="664" y="112">• Enfants</text>
                <text x="664" y="144">• Salariés</text>
                <text x="664" y="176">• Faune (V8 ECOTOX)</text>
                <text x="664" y="208">• Captages AEP (TSN)</text>
              </g>
              {/* Flèches */}
              <path d="M260 150h70" stroke="#1a5276" strokeWidth="3" markerEnd="url(#arr)" />
              <path d="M570 150h70" stroke="#1a5276" strokeWidth="3" markerEnd="url(#arr)" />
              <defs>
                <marker id="arr" markerWidth="10" markerHeight="10" refX="8" refY="4" orient="auto">
                  <path d="M0 0l9 4-9 4z" fill="#1a5276" />
                </marker>
              </defs>
            </svg>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {[
              { t: "3 sections structurées", d: "Sources / milieux, vecteurs / voies de transfert et cibles — la grille de lecture standard d'un diagnostic SSP." },
              { t: "SVG interactif", d: "Représentation graphique dynamique des liaisons source → vecteur → cible, avec mise en évidence des voies retenues et écartées." },
              { t: "Intégration EQRS", d: "Connexion native à EQRS V31.05 (voies humaines) et EQRS ECOTOX V8 (voies écotox : sol → ver → oiseau, eau → poisson)." },
            ].map((f) => (
              <div key={f.t} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: 24 }}>
                <h3 style={{ margin: "0 0 8px 0", color: "#0e2f44" }}>{f.t}</h3>
                <p style={{ margin: 0, fontSize: 14.5, color: "#374151", lineHeight: 1.6 }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === 2. APPLICATION IEM + PG === */}
      <section className="v2-section bg-soft">
        <div className="container">
          <div className="v2-section-head">
            <span className="v2-section-eyebrow">Application</span>
            <h2>Au service de l'IEM et du Plan de Gestion</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {[
              { t: "Interprétation de l'État des Milieux (IEM)", d: "Visualisation des voies et cibles à investiguer selon la méthodologie ANSES IEM 2018, pour justifier le périmètre d'étude avant les calculs EQRS." },
              { t: "Plan de Gestion (PG)", d: "Représentation graphique du modèle conceptuel à intégrer au PG selon la méthodologie nationale SSP MEEM/MTES 2017." },
              { t: "Justification scientifique", d: "Argumentation des hypothèses retenues (voies retenues vs écartées) et validation du périmètre d'étude avant les calculs EQRS lourds." },
            ].map((f) => (
              <div key={f.t} style={{ background: "#fff", borderRadius: 14, padding: 24, borderLeft: "4px solid #1a5276" }}>
                <h3 style={{ margin: "0 0 8px 0", color: "#0e2f44" }}>{f.t}</h3>
                <p style={{ margin: 0, fontSize: 14.5, color: "#374151", lineHeight: 1.6 }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === 3. ENCADRÉ — POURQUOI OBLIGATOIRE === */}
      <section className="v2-section">
        <div className="container" style={{ maxWidth: 820 }}>
          <div style={{ background: "linear-gradient(135deg,#eef4fa 0%,#e3edf7 100%)", borderLeft: "6px solid #1a5276", borderRadius: 14, padding: "32px 36px" }}>
            <h2 style={{ color: "#1a5276", marginTop: 0 }}>Pourquoi le schéma conceptuel est obligatoire</h2>
            <p style={{ color: "#1f2937", fontSize: "1.02rem" }}>
              Dans tout <strong>diagnostic SSP approfondi</strong>, le schéma conceptuel n'est pas une option : il constitue le
              socle méthodologique imposé par la démarche nationale de gestion des sites et sols pollués.
            </p>
            <ul style={{ color: "#1f2937", lineHeight: 1.8 }}>
              <li>Il <strong>conditionne la pertinence des calculs</strong> : sans liaison source-vecteur-cible identifiée, aucune évaluation des risques n'est recevable.</li>
              <li>Il <strong>structure l'IEM et le Plan de Gestion</strong> en explicitant les voies d'exposition retenues et écartées.</li>
              <li>Il <strong>sécurise la traçabilité</strong> des hypothèses et la cohérence de l'ensemble de l'étude.</li>
              <li>Il offre un <strong>support de communication intuitif</strong>, lisible par des interlocuteurs non spécialistes.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* === 4. FONCTIONNALITÉS SPÉCIALES === */}
      <section className="v2-section bg-soft">
        <div className="container">
          <div className="v2-section-head">
            <span className="v2-section-eyebrow">Fonctionnalités spéciales</span>
            <h2>Visualiser, synthétiser, exporter</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {[
              { t: "Visualisation SVG", d: "Schéma standardisé de type INERIS/BRGM, vectoriel et net à toutes les échelles, recevable par les acteurs concernés." },
              { t: "Synthèse cumulée par cible", d: "Somme des contributions (voies × polluants) par cible, avec aperçu des résultats EQRS associés (doses, QD, ERI)." },
              { t: "Export PNG / PDF", d: "Export du schéma en PNG ou PDF pour intégration directe dans les rapports de bureau d'études." },
            ].map((f) => (
              <div key={f.t} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: 24 }}>
                <h3 style={{ margin: "0 0 8px 0", color: "#0e2f44" }}>{f.t}</h3>
                <p style={{ margin: 0, fontSize: 14.5, color: "#374151", lineHeight: 1.6 }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === 5. TARIF === */}
      <section className="v2-section">
        <div className="container">
          <div className="v2-section-head">
            <span className="v2-section-eyebrow">Tarif</span>
            <h2>Abonnez-vous au Schéma Conceptuel</h2>
          </div>
          <div className="v2-pricing-grid" style={{ maxWidth: 520, margin: "0 auto" }}>
            <div className="v2-price-card featured">
              <span className="v2-badge">IEM + PG</span>
              <h3>Abonnement annuel</h3>
              <p className="sub">Visualisation Source › Vecteur › Cible</p>
              <div className="v2-price-amount">
                <span className="currency">€</span>850
              </div>
              <div className="v2-price-period">HT / an</div>
              <ul className="v2-price-features">
                <li>Schéma SVG interactif Source › Vecteur › Cible</li>
                <li>Application IEM (ANSES 2018) + PG (MEEM/MTES 2017)</li>
                <li>Connexion native EQRS V31.05 + ECOTOX V8</li>
                <li>Synthèse cumulée par cible</li>
                <li>Export PNG / PDF</li>
                <li>Formation à distance + études de cas utilisateur</li>
              </ul>
              <button className="v2-btn v2-btn-primary v2-btn-block" style={{ cursor: "pointer", border: "none" }} onClick={subscribe}>
                S'abonner
              </button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 24 }}>
            <button className="v2-btn v2-btn-ghost" style={{ cursor: "pointer", border: "none" }} onClick={startTrial}>Essai gratuit 14 jours</button>
            <a href="#/contact" className="v2-btn v2-btn-ghost">Démo sur demande</a>
          </div>
        </div>
      </section>

      {/* === 6. NOTE TECHNIQUE PDF === */}
      <section className="v2-section bg-soft">
        <div className="container">
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "32px", textAlign: "center", maxWidth: 820, margin: "0 auto" }}>
            <h3 style={{ marginTop: 0, color: "#0e2f44" }}>Note technique — Schéma Conceptuel</h3>
            <p style={{ color: "#374151", lineHeight: 1.6 }}>
              Téléchargez la note technique : structuration Source › Vecteur › Cible, articulation IEM / Plan de Gestion et
              connexion aux modules EQRS.
            </p>
            <a href="/notes-techniques/Note_Technique_Schema_Conceptuel.pdf" target="_blank" rel="noopener noreferrer" className="v2-btn v2-btn-primary">
              Télécharger la note technique (PDF)
            </a>
          </div>
        </div>
      </section>

      {/* === 7. CAS D'USAGE === */}
      <section className="v2-section">
        <div className="container" style={{ maxWidth: 820 }}>
          <div className="v2-section-head">
            <span className="v2-section-eyebrow">Cas d'usage</span>
            <h2>Un support de communication efficace</h2>
          </div>
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "28px 32px" }}>
            <h3 style={{ marginTop: 0, color: "#0e2f44" }}>Pour qui ?</h3>
            <ul style={{ margin: 0, paddingLeft: 20, color: "#374151", lineHeight: 1.8, fontSize: 14.5 }}>
              <li><strong>Communication avec les autorités compétentes</strong> — un schéma intuitif et standardisé, facilement compréhensible lors de l'instruction d'un dossier.</li>
              <li><strong>Échanges avec les acteurs locaux</strong> — un support clair pour expliquer le modèle conceptuel et les voies d'exposition.</li>
              <li><strong>Travail interne du bureau d'études</strong> — validation du périmètre d'étude avant le lancement des calculs EQRS.</li>
              <li><strong>Intégration au rapport</strong> — export PNG/PDF prêt à insérer dans l'IEM ou le Plan de Gestion.</li>
            </ul>
          </div>
        </div>
      </section>

      <V2Footer />
    </div>
  );
}
