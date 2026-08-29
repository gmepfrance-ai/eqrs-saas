'use strict';
/* Injecte un bloc SEO uniforme (canonical + Open Graph + Twitter Card + og:image)
   dans toutes les pages HTML du site GMEP, avant </head>. */
const fs = require('fs');
const path = require('path');

const ROOT = '/home/user/workspace/gmep-site';
const BASE = 'https://www.gmep-france.eu';
const OG_IMG = BASE + '/assets/img/og-image.png';

const FILES = [
  'index.html', 'tarifs.html', 'contact.html', 'mentions-legales.html', 'cgv.html',
  'plaquette/index.html',
  'outils/eqrs-v31-05-ecotox.html', 'outils/eqrs-v8-ecotox-humain.html', 'outils/eqrs-je.html',
  'outils/rabattement-v15-87.html', 'outils/rabattement-v15-85.html',
  'outils/tsn-transfert-sol-nappe.html', 'outils/domenico.html', 'outils/schema-conceptuel.html',
  'outils/rabattement/index.html'
];

function urlFor(rel) {
  if (rel === 'index.html') return BASE + '/';
  if (rel.endsWith('/index.html')) return BASE + '/' + rel.slice(0, -'index.html'.length);
  return BASE + '/' + rel;
}

function extract(html, re) {
  const m = html.match(re);
  return m ? (m[1] || '').replace(/\s+/g, ' ').trim() : '';
}

// Supprime les anciennes balises SEO partielles (canonical, og:*, twitter:*, sauf og:image déjà ok)
function stripOldSeo(html) {
  return html.split('\n').filter(line => {
    const t = line.trim();
    return !/ rel="canonical"/i.test(t)
      && !/ property="og:/i.test(t)
      && !/ name="twitter:/i.test(t);
  }).join('\n');
}

let report = [];
FILES.forEach(rel => {
  const fp = path.join(ROOT, rel);
  if (!fs.existsSync(fp)) { report.push(`SKIP (absent): ${rel}`); return; }
  let html = fs.readFileSync(fp, 'utf8');

  const title = extract(html, /<title>([\s\S]*?)<\/title>/i) || 'GMEP — Logiciels de modélisation environnementale';
  const desc = extract(html, /<meta\s+name="description"\s+content="([^"]*)"/i)
            || extract(html, /<meta\s+content="([^"]*)"\s+name="description"/i)
            || 'Logiciels SaaS de modélisation environnementale pour bureaux d\'études : EQRS, ECOTOX, rabattement de nappe. Conforme EPA, ANSES, Loi sur l\'Eau.';
  const canonical = urlFor(rel);

  html = stripOldSeo(html);

  const block = `
<!-- SEO : canonical + Open Graph + Twitter Card -->
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:url" content="${canonical}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="${OG_IMG}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="GMEP — Logiciels de modélisation environnementale">
<meta property="og:site_name" content="GMEP">
<meta property="og:locale" content="fr_FR">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${OG_IMG}">
`;

  if (/<\/head>/i.test(html)) {
    html = html.replace(/<\/head>/i, block + '</head>');
  } else {
    report.push(`WARN (no </head>): ${rel}`); return;
  }

  fs.writeFileSync(fp, html, 'utf8');
  report.push(`OK: ${rel}  →  ${canonical}`);
});

console.log(report.join('\n'));
