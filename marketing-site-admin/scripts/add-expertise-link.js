'use strict';
/* Ajoute le lien "Expertise" dans le nav (après Tarifs) et le footer (colonne Société)
   de toutes les pages HTML, avec chemin relatif correct selon la profondeur. */
const fs = require('fs');
const path = require('path');

const ROOT = '/home/user/workspace/gmep-site';
const FILES = [
  'index.html', 'tarifs.html', 'contact.html', 'mentions-legales.html', 'cgv.html',
  'outils/eqrs-v31-05-ecotox.html', 'outils/eqrs-v8-ecotox-humain.html', 'outils/eqrs-je.html',
  'outils/rabattement-v15-87.html', 'outils/rabattement-v15-85.html',
  'outils/tsn-transfert-sol-nappe.html', 'outils/domenico.html', 'outils/schema-conceptuel.html',
  'outils/rabattement/index.html'
];

function prefixFor(rel) {
  // profondeur relative pour revenir à la racine
  const depth = rel.split('/').length - 1; // index.html=0, outils/x.html=1, outils/rabattement/index.html=2
  return depth === 0 ? '' : '../'.repeat(depth);
}

let report = [];
FILES.forEach(rel => {
  const fp = path.join(ROOT, rel);
  if (!fs.existsSync(fp)) { report.push(`SKIP: ${rel}`); return; }
  let html = fs.readFileSync(fp, 'utf8');
  const p = prefixFor(rel);
  const expNav = `<a href="${p}expertise.html">Expertise</a>`;
  const expFooter = `<li><a href="${p}expertise.html">Expertise</a></li>`;

  let changed = false;

  // NAV : insérer après le lien Tarifs (../tarifs.html ou tarifs.html), si pas déjà présent
  if (!html.includes(`href="${p}expertise.html"`)) {
    const navRe = new RegExp(`(<a href="${p.replace(/\./g,'\\.')}tarifs\\.html">Tarifs</a>)`, 'g');
    if (navRe.test(html)) {
      html = html.replace(navRe, `$1\n      ${expNav}`);
      changed = true;
    }
  }

  // FOOTER : insérer dans la colonne Société après le <li> Tarifs, si présent et pas déjà
  const footTarifLi = `<li><a href="${p}tarifs.html">Tarifs</a></li>`;
  if (html.includes(footTarifLi) && !html.includes(expFooter)) {
    html = html.replace(footTarifLi, `${footTarifLi}\n          ${expFooter}`);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(fp, html, 'utf8');
    report.push(`OK: ${rel} (prefix="${p}")`);
  } else {
    report.push(`NOCHANGE: ${rel} (prefix="${p}")`);
  }
});
console.log(report.join('\n'));
