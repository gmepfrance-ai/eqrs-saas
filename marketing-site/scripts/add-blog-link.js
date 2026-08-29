'use strict';
/* Ajoute le lien "Blog" dans le nav (après Expertise) et le footer (colonne Société)
   des pages HTML standards du site, + ajoute les URLs du blog au sitemap. */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = '/home/user/workspace/gmep-site';
const FILES = [
  'index.html', 'tarifs.html', 'contact.html', 'mentions-legales.html', 'cgv.html', 'expertise.html',
  'outils/eqrs-v31-05-ecotox.html', 'outils/eqrs-v8-ecotox-humain.html', 'outils/eqrs-je.html',
  'outils/rabattement-v15-87.html', 'outils/rabattement-v15-85.html',
  'outils/tsn-transfert-sol-nappe.html', 'outils/domenico.html', 'outils/schema-conceptuel.html',
  'outils/rabattement/index.html'
];

function prefixFor(rel) {
  const depth = rel.split('/').length - 1;
  return depth === 0 ? '' : '../'.repeat(depth);
}

let report = [];
FILES.forEach(rel => {
  const fp = path.join(ROOT, rel);
  if (!fs.existsSync(fp)) { report.push(`SKIP: ${rel}`); return; }
  let html = fs.readFileSync(fp, 'utf8');
  const p = prefixFor(rel);
  const blogNav = `<a href="${p}blog/index.html">Blog</a>`;
  // footer : on insère après le <li> Expertise (déjà présent), avant Mentions légales
  const expLi = `<li><a href="${p}expertise.html">Expertise</a></li>`;
  const blogLi = `<li><a href="${p}blog/index.html">Blog</a></li>`;
  let changed = false;

  // NAV : après le lien Expertise, si pas déjà présent
  if (!html.includes(`href="${p}blog/index.html"`)) {
    const navRe = new RegExp(`(<a href="${p.replace(/\./g,'\\.')}expertise\\.html"[^>]*>Expertise</a>)`, 'g');
    if (navRe.test(html)) { html = html.replace(navRe, `$1\n      ${blogNav}`); changed = true; }
  }
  // FOOTER : après le <li> Expertise
  if (html.includes(expLi) && !html.includes(blogLi)) {
    html = html.replace(expLi, `${expLi}\n          ${blogLi}`); changed = true;
  }

  if (changed) { fs.writeFileSync(fp, html, 'utf8'); report.push(`OK: ${rel} (prefix="${p}")`); }
  else report.push(`NOCHANGE: ${rel}`);
});
console.log(report.join('\n'));

// ---- Sitemap : ajouter les URLs blog ----
const sm = path.join(ROOT, 'sitemap.xml');
let s = fs.readFileSync(sm, 'utf8');
const blogUrls = `  <!-- Blog / cluster de contenu -->\n  <url>\n    <loc>https://www.gmep-france.eu/blog/index.html</loc>\n    <lastmod>2026-07-03</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n  <url>\n    <loc>https://www.gmep-france.eu/blog/eqrs-calcul-qd-eri.html</loc>\n    <lastmod>2026-07-03</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n  <url>\n    <loc>https://www.gmep-france.eu/blog/modele-johnson-ettinger-intrusion-vapeurs.html</loc>\n    <lastmod>2026-07-03</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n  <url>\n    <loc>https://www.gmep-france.eu/blog/rabattement-nappe-calcul-debit.html</loc>\n    <lastmod>2026-07-03</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n  <url>\n    <loc>https://www.gmep-france.eu/blog/iem-arr-eqrs-differences.html</loc>\n    <lastmod>2026-07-03</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
if (!s.includes('/blog/index.html')) {
  // insérer avant la page expertise
  s = s.replace('  <!-- Page expertise / auteur -->', blogUrls + '\n  <!-- Page expertise / auteur -->');
  fs.writeFileSync(sm, s, 'utf8');
  console.log('\nSitemap mis à jour avec 5 URLs blog.');
} else {
  console.log('\nSitemap contient déjà les URLs blog.');
}
