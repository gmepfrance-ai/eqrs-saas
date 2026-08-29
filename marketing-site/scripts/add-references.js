'use strict';
/* Insère une section "Références méthodologiques" avant le CTA final de chaque article,
   avec des liens officiels pertinents par article. */
const fs = require('fs');

const ROOT = '/home/user/workspace/gmep-site';
const CTA = '<div style="text-align:center;margin:40px 0;">';

const refs = {
  'blog/eqrs-calcul-qd-eri.html': [
    ['INERIS — Méthodologie ERS 2021', 'https://www.ineris.fr/fr/ers-2021-methodologie-evaluation-risques-sanitaires-sites-sols-pollues'],
    ['ANSES — Valeurs toxicologiques de référence (VTR)', 'https://www.anses.fr/fr/content/valeurs-toxicologiques-de-r%C3%A9f%C3%A9rence-vtr'],
    ['US EPA — RAGS Part A (Risk Assessment Guidance)', 'https://www.epa.gov/risk/risk-assessment-guidance-superfund-rags-part'],
    ['US EPA — Child-Specific Exposure Factors (ADAF)', 'https://www.epa.gov/risk/childrens-environmental-exposure-factors'],
  ],
  'blog/modele-johnson-ettinger-intrusion-vapeurs.html': [
    ['US EPA (2004) — Johnson & Ettinger model guidance', 'https://www.epa.gov/vaporintrusion/epas-vapor-intrusion-technical-guide'],
    ['US EPA — Vapor Intrusion Screening Level (VISL) calculator', 'https://www.epa.gov/vaporintrusion/visl-calculator'],
    ['ANSES — Avis sur l\'intrusion de vapeurs dans l\'air intérieur', 'https://www.anses.fr/fr/system/files/AIR-Vi2014sa0088.pdf'],
    ['INERIS — Guide sur la prise en compte de la voie d\'exposition par inhalation de vapeurs', 'https://www.ineris.fr/fr'],
  ],
  'blog/rabattement-nappe-calcul-debit.html': [
    ['Code de l\'environnement — Rubriques nappes / IOTA (R.214-1)', 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006837384/'],
    ['Ministère de la Transition écologique — Procédure Loi sur l\'Eau', 'https://www.ecologie.gouv.fr/politiques-publiques/loi-leau'],
    ['Hub\'Eau — API données piézométriques (Banque Nationale de l\'Eau)', 'https://hubeau.eaufrance.fr/'],
    ['BRGM — Méthodes d\'essais de pompage et hydrogéologie', 'https://www.brgm.fr/fr'],
  ],
  'blog/iem-arr-eqrs-differences.html': [
    ['Ministère / INERIS — Méthodologie nationale de gestion des sites et sols pollués', 'https://www.ecologie.gouv.fr/sites-et-sols-pollues'],
    ['INERIS — Guide sur le diagnostic des sites et sols pollués (IEM)', 'https://www.ineris.fr/fr/diagnostic-sites-sols-pollues'],
    ['Code de l\'environnement — ICPE (installations classées)', 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006071556/'],
    ['INERIS — Évaluation détaillée des risques (EDR)', 'https://www.ineris.fr/fr'],
  ],
};

function block(list) {
  const items = list.map(([t,u]) => `      <li><a href="${u}" rel="noopener" target="_blank">${t}</a></li>`).join('\n');
  return `
<section style="margin:40px 0;border-top:1px solid var(--border);padding-top:20px;" aria-labelledby="refs-title">
  <h2 id="refs-title" style="font-size:1.15rem;">Références méthodologiques</h2>
  <ul style="line-height:1.9;font-size:0.92rem;">
${items}
  </ul>
</section>

`;
}

let n = 0;
Object.entries(refs).forEach(([rel, list]) => {
  const fp = ROOT + '/' + rel;
  let html = fs.readFileSync(fp, 'utf8');
  if (html.includes('id="refs-title"')) { console.log(`SKIP (déjà): ${rel}`); return; }
  if (!html.includes(CTA)) { console.log(`WARN (pas de CTA): ${rel}`); return; }
  html = html.replace(CTA, block(list) + CTA);
  fs.writeFileSync(fp, html, 'utf8');
  n++;
  console.log(`OK: ${rel} (${list.length} références)`);
});
console.log(`\nTotal : ${n} article(s) mis à jour.`);
