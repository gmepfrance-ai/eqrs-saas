'use strict';
/* Corrige le footer malformé : <li>...Expertise...Blog...</li> (2 liens dans 1 <li>)
   → deux <li> distincts. Détecte automatiquement le préfixe. */
const fs = require('fs');
const { execSync } = require('child_process');
const ROOT = '/home/user/workspace/gmep-site';

const files = execSync(`find ${ROOT} -name '*.html' -not -path '*/.git/*' -not -path '*/auth/*'`, { encoding: 'utf8' })
  .trim().split('\n').filter(Boolean);

// <li><a href="PREF expertise.html"[opt aria]>Expertise</a>  WS  <a href="PREF blog/index.html">Blog</a></li>
const re = /(<li><a href="((?:\.\.\/)*)expertise\.html"(?:[^>]*)?>Expertise<\/a>)\s*\n\s*(<a href="\2blog\/index\.html">Blog<\/a><\/li>)/g;

let fixed = 0;
files.forEach(fp => {
  let html = fs.readFileSync(fp, 'utf8');
  let count = 0;
  html = html.replace(re, (m, a, pref, b) => {
    count++;
    return `<li><a href="${pref}expertise.html">Expertise</a></li>\n          <li><a href="${pref}blog/index.html">Blog</a></li>`;
  });
  if (count > 0) {
    fs.writeFileSync(fp, html, 'utf8');
    fixed++;
    console.log(`FIXED (${count}): ${fp.replace(ROOT+'/','')}`);
  }
});
console.log(`\nTotal : ${fixed} fichier(s) corrigés.`);
