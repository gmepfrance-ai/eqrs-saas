'use strict';
/* Retargete tous les CTA d'authentification vers le sous-domaine app.gmep-france.eu.
   - Toute référence auth/login.html (avec préfixe relatif) → https://app.gmep-france.eu/#/login
   - Toute référence auth/register.html (avec préfixe relatif) → https://app.gmep-france.eu/#/register
   - Ajoute rel="noopener" sur les liens externes créés (si pas déjà présent).
   Ignore les fichiers dans auth/ eux-mêmes (traités à part en redirections). */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = '/home/user/workspace/gmep-site';
const APP_LOGIN = 'https://app.gmep-france.eu/#/login';
const APP_REGISTER = 'https://app.gmep-france.eu/#/register';

// Tous les fichiers HTML hors auth/
const files = execSync(`find ${ROOT} -name '*.html' -not -path '*/auth/*' -not -path '*/.git/*'`, { encoding: 'utf8' })
  .trim().split('\n').filter(Boolean);

let total = 0;
const report = [];
files.forEach(fp => {
  let html = fs.readFileSync(fp, 'utf8');
  const orig = html;
  let n = 0;

  // login : href="...auth/login.html" (préfixe optionnel ../ ou ../../)
  html = html.replace(/href="(?:\.\.\/)*auth\/login\.html"/g, m => { n++; return `href="${APP_LOGIN}"`; });
  // register
  html = html.replace(/href="(?:\.\.\/)*auth\/register\.html"/g, m => { n++; return `href="${APP_REGISTER}"`; });

  if (n > 0) {
    // Ajouter rel="noopener" sur ces liens externes si absent (et pas de target manipulé)
    html = html.replace(
      new RegExp(`href="${APP_LOGIN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"(?!.*rel=)`, 'g'),
      `href="${APP_LOGIN}" rel="noopener"`
    );
    html = html.replace(
      new RegExp(`href="${APP_REGISTER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"(?!.*rel=)`, 'g'),
      `href="${APP_REGISTER}" rel="noopener"`
    );
    fs.writeFileSync(fp, html, 'utf8');
    total += n;
    const rel = path.relative(ROOT, fp);
    report.push(`OK (${n}): ${rel}`);
  }
});
console.log(report.join('\n'));
console.log(`\nTotal liens retargetés : ${total} dans ${report.length} fichier(s).`);
