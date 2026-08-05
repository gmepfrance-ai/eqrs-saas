'use strict';
/* Corrige le footer malformé : <li>...Tarifs...Expertise...</li> (2 liens dans 1 <li>)
   → deux <li> distincts. Gère les préfixes '', '../', '../../'. */
const fs = require('fs');
const path = require('path');
const ROOT = '/home/user/workspace/gmep-site';

const FILES = [
  'index.html', 'tarifs.html', 'contact.html', 'mentions-legales.html', 'cgv.html',
  'plaquette/index.html',
  'outils/eqrs-v31-05-ecotox.html', 'outils/eqrs-v8-ecotox-humain.html', 'outils/eqrs-je.html',
  'outils/rabattement-v15-87.html', 'outils/rabattement-v15-85.html',
  'outils/tsn-transfert-sol-nappe.html', 'outils/domenico.html', 'outils/schema-conceptuel.html',
  'outils/rabattement/index.html'
];

// pattern : <li><a href="PREF tarifs.html">Tarifs</a>  (newline+spaces) <a href="PREF expertise.html">Expertise</a></li>
const re = /(<li><a href="((?:\.\.\/)*)tarifs\.html">Tarifs<\/a>)\s*\n\s*(<a href="\2expertise\.html"[^>]*>Expertise<\/a><\/li>)/g;

let report = [];
FILES.forEach(rel => {
  const fp = path.join(ROOT, rel);
  if (!fs.existsSync(fp)) return;
  let html = fs.readFileSync(fp, 'utf8');
  let count = 0;
  html = html.replace(re, (m, a, pref, b) => {
    count++;
    return `<li><a href="${pref}tarifs.html">Tarifs</a></li>\n          <li><a href="${pref}expertise.html">Expertise</a></li>`;
  });
  if (count > 0) {
    fs.writeFileSync(fp, html, 'utf8');
    report.push(`FIXED (${count}): ${rel}`);
  }
});
console.log(report.join('\n') || 'Aucune correction nécessaire.');
