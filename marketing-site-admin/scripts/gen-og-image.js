const sharp = require('sharp');
const fs = require('fs');

const W = 1200, H = 630;

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#16223d"/>
      <stop offset="1" stop-color="#1f3a5f"/>
    </linearGradient>
    <linearGradient id="drop" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#5cf09a"/>
      <stop offset="1" stop-color="#2bbf6a"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- accents décoratifs -->
  <circle cx="1090" cy="120" r="220" fill="#39e07a" opacity="0.06"/>
  <circle cx="1130" cy="540" r="160" fill="#2563eb" opacity="0.07"/>
  <path d="M0 600 Q300 540 600 600 T1200 580 L1200 630 L0 630 Z" fill="#0f1830" opacity="0.5"/>

  <!-- logo goutte -->
  <g transform="translate(80,70)">
    <path d="M46 0 C26 32 12 58 12 84 A46 46 0 0 0 104 84 C104 58 90 32 70 0 Z" fill="url(#drop)"/>
    <ellipse cx="38" cy="92" rx="9" ry="15" fill="rgba(255,255,255,0.5)"/>
    <text x="130" y="86" font-family="Inter, Arial, sans-serif" font-size="58" font-weight="800" letter-spacing="2" fill="#ffffff">G.M.E.P</text>
    <text x="132" y="124" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="500" fill="#9fb3d1">Global Management of Environmental Project</text>
  </g>

  <!-- titre principal -->
  <text x="80" y="300" font-family="Inter, Arial, sans-serif" font-size="64" font-weight="800" fill="#ffffff">Logiciels de modélisation</text>
  <text x="80" y="378" font-family="Inter, Arial, sans-serif" font-size="64" font-weight="800" fill="#ffffff">environnementale</text>

  <!-- sous-titre outils -->
  <text x="82" y="448" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="600" fill="#5cf09a">EQRS · ECOTOX · Rabattement de nappe · Loi sur l'Eau</text>

  <!-- bandeau conformité -->
  <rect x="80" y="498" width="760" height="64" rx="12" fill="#ffffff" opacity="0.08"/>
  <text x="104" y="540" font-family="Inter, Arial, sans-serif" font-size="25" font-weight="600" fill="#e7eefb">Conforme EPA · ANSES · INERIS · EFSA · Loi sur l'Eau</text>

  <!-- pied -->
  <text x="80" y="598" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="500" fill="#8aa0c0">www.gmep-france.eu — Bureaux d'études sites &amp; sols pollués</text>
</svg>`;

fs.writeFileSync('/home/user/workspace/gmep-site/assets/img/og-image.svg', svg);

sharp(Buffer.from(svg), { density: 144 })
  .resize(W, H, { fit: 'fill' })
  .png()
  .toFile('/home/user/workspace/gmep-site/assets/img/og-image.png')
  .then(info => console.log('OK', JSON.stringify(info)))
  .catch(e => { console.error('ERR', e.message); process.exit(1); });
