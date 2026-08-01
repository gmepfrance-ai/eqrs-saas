/* ════════════════════════════════════════════════════════════════════════════
   GMEP — Générateur PDF (jsPDF) — Logiciel Rabattement v15.61
   Refonte alignée structure & mise en page du dossier de référence
   (~ 25-30 pages, A4 portrait)

   Structure :
     PAGE 1   — Garde (bandeau bleu, intervenants 4 col., réf dossier auto)
     PAGE 2   — Sommaire (8 sections numérotées)
     PAGE 3   — 1. Objet de l'étude
     PAGE 4   — 2.1 Caractéristiques de l'ouvrage
     PAGE 5   — 2.2 Paramètres hydrogéologiques
     PAGES 6-8 — 2bis Schémas SVG (coupe puits, cône Dupuit-Thiem, schéma conceptuel)
     PAGE 9   — Localisation (carte capturée Leaflet ou cadre placeholder)
     PAGES 10-12 — 3. Méthodes (Theis & Dupuit) + abaques
     PAGES 13-14 — 4. Résultats (rabattement, débits, volumes, bilan)
     PAGES 15-19 — 5. Vérification réglementaire (5.1 à 5.6 - rubriques IOTA)
     PAGES 20-22 — 6. Sensibilité environnementale (cadres éditables)
     PAGE 23  — 7. Préconisations techniques
     PAGE 24-25 — 8. Conclusion (synthèse + visa GMEP)
     PAGES 26-28 — Lexique des abréviations

   ════════════════════════════════════════════════════════════════════════════ */

// ─── Palette PDF (alignée référence) ───
const BLUE   = [38, 79, 122];   // #264F7A — bandeau header
const BLUE_D = [29, 53, 87];    // #1D3557 — titres sections
const BLUE_L = [232, 240, 250]; // bleu très clair — tables alternées
const ORANGE = [212, 130,  74]; // #D4824A — header tables hydrogéo
const GREEN_BG = [216, 242, 226]; // cadres "OK"
const GREEN_DK = [ 39, 121,  85]; // bordure verte
const ORANGE_BG = [253, 235, 220];
const ORANGE_DK = [212, 130, 74];
const RED_BG = [253, 224, 224];
const RED_DK = [192,  60,  60];
const GREY   = [102, 102, 102];
const GREY_L = [240, 240, 240];
const GREY_LL = [248, 250, 252];
const BLACK  = [33, 33, 33];

// Marges A4
const M_LEFT = 15;
const M_RIGHT = 15;
const M_TOP = 24;       // sous header
const M_BOTTOM = 22;    // au-dessus footer

// ─── Identité dossier ───
const REF_PREFIX = "DE";

function genRef() {
  // 11 chiffres : YYYYMMDDHHM + random 1 chiffre
  const d = new Date();
  const stamp = d.getFullYear().toString()
    + String(d.getMonth() + 1).padStart(2, "0")
    + String(d.getDate()).padStart(2, "0")
    + String(d.getHours()).padStart(2, "0")
    + String(d.getMinutes()).padStart(2, "0")
    + String(Math.floor(Math.random() * 10));
  return REF_PREFIX + stamp;
}

// ─── Sanitization texte (WinAnsi safe) ───
function safeText(s) {
  if (s == null) return "";
  return String(s)
    .replace(/\u00A0/g, " ").replace(/\u202F/g, " ").replace(/\u2009/g, " ")
    .replace(/\u2013/g, "-").replace(/\u2014/g, "-")
    .replace(/\u03C0/g, "pi").replace(/\u03B7/g, "eta")
    .replace(/\u00B7/g, ".").replace(/\u2212/g, "-")
    .replace(/\u00AB/g, '"').replace(/\u00BB/g, '"')
    .replace(/\u2192/g, "->").replace(/\u2190/g, "<-")
    .replace(/\u2264/g, "<=").replace(/\u2265/g, ">=")
    .replace(/\u2248/g, "~").replace(/\u00D7/g, "x")
    .replace(/\u00B1/g, "+/-")
    .replace(/\u26A0\uFE0F?/g, "!")
    .replace(/[\u2600-\u27BF]/g, "");
}

// ─── Helpers formatage ───
function fmtN(v, dec) {
  if (v == null || isNaN(v) || !isFinite(v)) return "—";
  if (dec == null) dec = 2;
  return v.toFixed(dec).replace(".", ",");
}
function fmtInt(v) {
  if (v == null || isNaN(v) || !isFinite(v)) return "—";
  return Math.round(v).toLocaleString("fr-FR");
}
function fmtExp(v) {
  if (v == null || isNaN(v) || !isFinite(v)) return "—";
  if (v === 0) return "0";
  const s = v.toExponential(2);
  return s.replace("e", "x10^").replace("+0", "").replace("-0", "-").replace("+", "");
}
function valOrFill(v) {
  if (v == null || v === "" || v === "—") return "[ à compléter ]";
  return v;
}

// ─── Capture carte Leaflet (si visible) ───
async function captureMap() {
  return new Promise((resolve) => {
    const mapEl = document.getElementById("map");
    if (!mapEl || !window.html2canvas) { resolve(null); return; }
    html2canvas(mapEl, { useCORS: true, allowTaint: true, scale: 2 })
      .then(c => resolve(c.toDataURL("image/jpeg", 0.85)))
      .catch(() => resolve(null));
  });
}

// ═══════════════════════════════════════════════════════════════════════════
//                          PRIMITIVES DE MISE EN PAGE
// ═══════════════════════════════════════════════════════════════════════════

function pageW(doc) { return doc.internal.pageSize.getWidth(); }
function pageH(doc) { return doc.internal.pageSize.getHeight(); }

// Header récurrent en haut de page (sauf garde)
function drawHeader(doc, ctx) {
  const w = pageW(doc);
  // Bandeau bleu (15 mm)
  doc.setFillColor(...BLUE);
  doc.rect(0, 0, w, 15, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("G.M.E.P", M_LEFT, 9);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  // Texte gauche : abréger le libellé pour ne pas déborder vers la droite
  const regimeShort = ctx.regimeLibelle === "Dossier de demande d'autorisation IOTA" ? "Demande d'autorisation IOTA"
                    : ctx.regimeLibelle === "Dossier de déclaration IOTA"             ? "Déclaration IOTA"
                    : (ctx.regimeLibelle || "Hors nomenclature IOTA");
  doc.text(safeText("-  Dossier technique  -  " + regimeShort), M_LEFT + 18, 9);
  // Réf + commune à droite
  doc.setFontSize(9);
  const right = `Réf. : ${ctx.ref}    |    ${ctx.commune || "—"}`;
  doc.text(safeText(right), w - M_RIGHT, 9, { align: "right" });
  doc.setTextColor(...BLACK);
}

// Footer récurrent
function drawFooter(doc, ctx, pageNum) {
  const w = pageW(doc), h = pageH(doc);
  doc.setDrawColor(...BLUE);
  doc.setLineWidth(0.4);
  doc.line(M_LEFT, h - 16, w - M_RIGHT, h - 16);
  // Ligne 1 (haute) : G.M.E.P en bold (gauche) + MO/date au centre + Page à droite
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...BLUE_D);
  doc.text("G.M.E.P", M_LEFT, h - 11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GREY);
  // MO au centre, sur ligne haute (h - 11) pour ne pas chevaucher l'adresse
  const moTxt = `MO : ${ctx.mo || "—"}   |   ${ctx.date}`;
  doc.text(moTxt, w / 2, h - 11, { align: "center" });
  // Page X à droite, sur ligne haute
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BLUE_D);
  doc.text(`Page ${pageNum}`, w - M_RIGHT, h - 11, { align: "right" });
  // Ligne 2 (basse) : adresse complète, sur toute la largeur centrée
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...GREY);
  doc.text("SARL G.M.E.P  -  9 rue de la Marne, 79400 Saint-Maixent-l'École  -  gmep.france@gmail.com  -  www.gmep-france.eu", w / 2, h - 6, { align: "center" });
  doc.setTextColor(...BLACK);
}

// Wrapper : nouvelle page courante avec header/footer
function newPage(doc, ctx) {
  doc.addPage();
  ctx.pageNum++;
  drawHeader(doc, ctx);
  drawFooter(doc, ctx, ctx.pageNum);
}

// Bandeau titre section (style bleu plein largeur)
function sectionBanner(doc, y, title) {
  const w = pageW(doc);
  doc.setFillColor(...BLUE);
  doc.rect(M_LEFT, y, w - M_LEFT - M_RIGHT, 9, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(safeText(title), M_LEFT + 4, y + 6.2);
  doc.setTextColor(...BLACK);
  return y + 14;
}

// Sous-titre type "1.1 Foo"
function subTitle(doc, y, title) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...BLUE_D);
  doc.text(safeText(title), M_LEFT, y);
  doc.setTextColor(...BLACK);
  return y + 6;
}

// Paragraphe justifié simple (rendu jsPDF = renvoi à la ligne sur largeur)
function paragraph(doc, y, txt, opts) {
  opts = opts || {};
  const w = pageW(doc);
  const maxW = w - M_LEFT - M_RIGHT - (opts.indent || 0);
  doc.setFont("helvetica", opts.bold ? "bold" : "normal");
  doc.setFontSize(opts.size || 10);
  doc.setTextColor(...(opts.color || BLACK));
  const lines = doc.splitTextToSize(safeText(txt), maxW);
  doc.text(lines, M_LEFT + (opts.indent || 0), y);
  doc.setTextColor(...BLACK);
  return y + lines.length * (opts.lineH || 4.5);
}

// Tableau 2 colonnes Paramètre / Valeur (style référence)
// rows = [[label, value], ...]
function table2Col(doc, y, rows, opts) {
  opts = opts || {};
  const w = pageW(doc);
  const fullW = w - M_LEFT - M_RIGHT;
  const colW1 = opts.colW1 || fullW * 0.42;
  const colW2 = fullW - colW1;
  const rowH = opts.rowH || 7;
  const header = opts.header;        // [labelHdr, valueHdr] ou null
  const orange = opts.orange;        // true => header orange

  let cy = y;
  if (header) {
    doc.setFillColor(...(orange ? ORANGE : BLUE));
    doc.rect(M_LEFT, cy, fullW, rowH, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text(safeText(header[0]), M_LEFT + 3, cy + rowH - 2);
    doc.text(safeText(header[1]), M_LEFT + colW1 + 3, cy + rowH - 2);
    cy += rowH;
    doc.setTextColor(...BLACK);
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  rows.forEach((row, i) => {
    // Découpe valeur sur 2 lignes max
    const valLines = doc.splitTextToSize(safeText(row[1] != null ? row[1] : "—"), colW2 - 6);
    const lines = Math.max(1, valLines.length);
    const h = Math.max(rowH, lines * 5 + 2);
    if (i % 2 === 0) {
      doc.setFillColor(...GREY_LL);
      doc.rect(M_LEFT, cy, fullW, h, "F");
    }
    // Bordure cellule label (subtile)
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.1);
    doc.line(M_LEFT + colW1, cy, M_LEFT + colW1, cy + h);
    // Label
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BLUE_D);
    doc.text(safeText(row[0]), M_LEFT + 3, cy + 5);
    // Valeur
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...BLACK);
    doc.text(valLines, M_LEFT + colW1 + 3, cy + 5);
    cy += h;
  });
  // Cadre extérieur
  doc.setDrawColor(...BLUE);
  doc.setLineWidth(0.3);
  doc.rect(M_LEFT, y + (header ? rowH : 0), fullW, cy - y - (header ? rowH : 0));
  return cy + 3;
}

// Tableau multi-colonnes générique
function tableN(doc, y, rows, opts) {
  opts = opts || {};
  const w = pageW(doc);
  const fullW = w - M_LEFT - M_RIGHT;
  const widths = opts.widths;
  const total = widths.reduce((a, b) => a + b, 0);
  const colW = widths.map(p => p / total * fullW);
  const header = opts.header || null;
  const rowH = opts.rowH || 7;
  const orange = opts.orange;

  let cy = y;
  if (header) {
    doc.setFillColor(...(orange ? ORANGE : BLUE));
    doc.rect(M_LEFT, cy, fullW, rowH, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    let cx = M_LEFT;
    header.forEach((label, i) => {
      doc.text(safeText(label), cx + 3, cy + rowH - 2);
      cx += colW[i];
    });
    cy += rowH;
    doc.setTextColor(...BLACK);
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  rows.forEach((row, i) => {
    // Hauteur ligne (max wrapped lines)
    let maxLines = 1;
    const wrapped = row.map((cell, j) => {
      const lines = doc.splitTextToSize(safeText(cell != null ? cell : "—"), colW[j] - 6);
      maxLines = Math.max(maxLines, lines.length);
      return lines;
    });
    const h = Math.max(rowH, maxLines * 4.5 + 2.5);
    if (i % 2 === 0) {
      doc.setFillColor(...GREY_LL);
      doc.rect(M_LEFT, cy, fullW, h, "F");
    }
    // séparateurs colonnes
    let cx = M_LEFT;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.1);
    wrapped.forEach((lines, j) => {
      if (j > 0) doc.line(cx, cy, cx, cy + h);
      doc.setTextColor(...BLACK);
      doc.text(lines, cx + 3, cy + 5);
      cx += colW[j];
    });
    cy += h;
  });
  doc.setDrawColor(...BLUE);
  doc.setLineWidth(0.3);
  doc.rect(M_LEFT, y + (header ? rowH : 0), fullW, cy - y - (header ? rowH : 0));
  return cy + 3;
}

// Cadre rempli (info / warning / success) avec texte intérieur
function calloutBox(doc, y, text, kind) {
  const w = pageW(doc);
  const fullW = w - M_LEFT - M_RIGHT;
  let bg = GREEN_BG, dk = GREEN_DK;
  if (kind === "warn") { bg = ORANGE_BG; dk = ORANGE_DK; }
  if (kind === "danger") { bg = RED_BG; dk = RED_DK; }
  if (kind === "info") { bg = BLUE_L; dk = BLUE; }
  const lines = doc.splitTextToSize(safeText(text), fullW - 10);
  const h = lines.length * 4.5 + 6;
  doc.setFillColor(...bg);
  doc.setDrawColor(...dk);
  doc.setLineWidth(0.6);
  doc.rect(M_LEFT, y, fullW, h, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...dk);
  doc.text(lines, M_LEFT + 5, y + 5);
  doc.setTextColor(...BLACK);
  return y + h + 3;
}

// Cadre éditable (placeholder à compléter — fond blanc, contour pointillé)
function editableBox(doc, y, minHeight, prompt) {
  const w = pageW(doc);
  const fullW = w - M_LEFT - M_RIGHT;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  // Wrap du texte d'invite
  const safePrompt = safeText(prompt);
  const lines = doc.splitTextToSize(safePrompt, fullW - 8);
  // Hauteur nécessaire : 5 (top padding) + 4.2*nbLines + 8 (bas pour saisie manuelle minimale)
  const needed = 5 + lines.length * 4.2 + 8;
  const height = Math.max(minHeight, needed);
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(160, 160, 160);
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.setLineWidth(0.4);
  doc.rect(M_LEFT, y, fullW, height, "FD");
  doc.setLineDashPattern([], 0);
  doc.setTextColor(...GREY);
  doc.text(lines, M_LEFT + 4, y + 5);
  doc.setTextColor(...BLACK);
  return y + height + 3;
}

// ═══════════════════════════════════════════════════════════════════════════
//                           SCHÉMAS SVG via jsPDF
// ═══════════════════════════════════════════════════════════════════════════

// (A) Coupe schématique puits/piézomètre — vue en coupe simplifiée
function drawWellCrossSection(doc, x0, y0, w, h, data) {
  const d = data || {};
  doc.setDrawColor(...BLACK);
  doc.setLineWidth(0.4);

  // Cadre fond
  doc.setFillColor(252, 252, 250);
  doc.rect(x0, y0, w, h, "F");
  doc.rect(x0, y0, w, h);

  // Sol (terrain naturel hachuré)
  const tnY = y0 + 18;
  doc.setLineWidth(0.3);
  doc.line(x0, tnY, x0 + w, tnY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("TN", x0 + 2, tnY - 1);

  // Puits (rectangle vertical)
  const wellW = 14;
  const wellX = x0 + w / 2 - wellW / 2;
  const wellH = h - 28;
  const wellY = tnY;

  // Margelle / capot (au-dessus du TN)
  doc.setFillColor(190, 190, 190);
  doc.rect(wellX - 3, wellY - 6, wellW + 6, 6, "F");
  doc.rect(wellX - 3, wellY - 6, wellW + 6, 6);
  doc.setFontSize(7);
  doc.text("Capot étanche", wellX + wellW + 5, wellY - 2);

  // Massif filtrant (silice 2-4 mm)
  doc.setFillColor(255, 230, 180);
  doc.rect(wellX, wellY, wellW, wellH, "F");

  // Bentonite (3-5 m sup)
  doc.setFillColor(110, 70, 50);
  doc.rect(wellX, wellY, wellW, 8, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text("Bentonite", wellX + 0.6, wellY + 5);
  doc.setTextColor(...BLACK);

  // Tubage PVC (lignes verticales noires - tubes pleins en haut)
  doc.setLineWidth(0.6);
  doc.line(wellX + 2, wellY + 8, wellX + 2, wellY + wellH - 4);
  doc.line(wellX + wellW - 2, wellY + 8, wellX + wellW - 2, wellY + wellH - 4);

  // Crépine (lignes horizontales) sur la moitié basse
  const crepY = wellY + wellH * 0.55;
  doc.setLineWidth(0.3);
  for (let cy = crepY; cy < wellY + wellH - 6; cy += 1.6) {
    doc.line(wellX + 2.5, cy, wellX + wellW - 2.5, cy);
  }
  // Bouchon fond
  doc.setFillColor(80, 80, 80);
  doc.rect(wellX + 2, wellY + wellH - 4, wellW - 4, 3, "F");

  // Niveau statique (NS) — ligne bleue horizontale en dehors du puits
  const nsY = wellY + 22;
  doc.setDrawColor(30, 100, 200);
  doc.setLineWidth(0.5);
  doc.line(x0 + 6, nsY, wellX - 1, nsY);
  doc.line(wellX + wellW + 1, nsY, x0 + w - 6, nsY);
  // triangles NS
  doc.setFillColor(30, 100, 200);
  doc.triangle(x0 + 8, nsY, x0 + 11, nsY - 2, x0 + 11, nsY + 2, "F");
  doc.setFontSize(7);
  doc.setTextColor(30, 100, 200);
  doc.text(`NS ${d.ns != null ? fmtN(d.ns, 2) + " m" : "[--]"}`, x0 + 12, nsY - 1);
  doc.setTextColor(...BLACK);

  // Niveau dynamique (ND) plus bas
  const ndY = nsY + 10;
  doc.setDrawColor(150, 80, 30);
  doc.setLineDashPattern([1, 1], 0);
  doc.line(x0 + 6, ndY, wellX - 1, ndY);
  doc.line(wellX + wellW + 1, ndY, x0 + w - 6, ndY);
  doc.setLineDashPattern([], 0);
  doc.setFontSize(7);
  doc.setTextColor(150, 80, 30);
  doc.text(`ND (rabattement s = ${d.s != null ? fmtN(d.s, 2) + " m" : "[--]"})`, wellX + wellW + 4, ndY - 1);
  doc.setTextColor(...BLACK);

  // Fond de fouille (cote)
  const ffY = nsY + 16;
  doc.setDrawColor(...RED_DK);
  doc.setLineDashPattern([2, 1], 0);
  doc.line(x0 + 6, ffY, x0 + w - 6, ffY);
  doc.setLineDashPattern([], 0);
  doc.setFontSize(7);
  doc.setTextColor(...RED_DK);
  doc.text(`Fond de fouille ${d.ff != null ? fmtN(d.ff, 2) + " m" : "[--]"}`, x0 + w - 6, ffY - 1, { align: "right" });
  doc.setTextColor(...BLACK);

  // Cote profondeur puits (flèche vert à droite du puits)
  doc.setDrawColor(60, 60, 60);
  doc.setLineWidth(0.3);
  doc.line(wellX - 8, wellY, wellX - 8, wellY + wellH);
  doc.triangle(wellX - 8, wellY, wellX - 9.5, wellY + 2, wellX - 6.5, wellY + 2, "F");
  doc.triangle(wellX - 8, wellY + wellH, wellX - 9.5, wellY + wellH - 2, wellX - 6.5, wellY + wellH - 2, "F");
  doc.setFontSize(7);
  doc.text(`Profondeur ${d.prof != null ? fmtN(d.prof, 1) + " m" : "[--]"}`, wellX - 12, wellY + wellH / 2, { align: "right" });

  // Légende (en bas)
  const lgY = y0 + h - 6;
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("Légende :", x0 + 2, lgY);
  doc.setFont("helvetica", "normal");
  // Bentonite swatch
  doc.setFillColor(110, 70, 50); doc.rect(x0 + 18, lgY - 3, 4, 3, "F");
  doc.text("Bentonite", x0 + 23, lgY);
  // Massif filtrant
  doc.setFillColor(255, 230, 180); doc.rect(x0 + 43, lgY - 3, 4, 3, "FD");
  doc.text("Massif filtrant silice 2-4 mm", x0 + 48, lgY);
  // Crépine
  doc.text("|||  Crépine PVC", x0 + 105, lgY);
}

// (B) Cône de rabattement Dupuit-Thiem — coupe verticale
function drawDrawdownCone(doc, x0, y0, w, h, data) {
  const d = data || {};
  doc.setDrawColor(...BLACK);
  doc.setLineWidth(0.4);
  doc.setFillColor(252, 252, 250);
  doc.rect(x0, y0, w, h, "F");
  doc.rect(x0, y0, w, h);

  // TN
  const tnY = y0 + 12;
  doc.line(x0, tnY, x0 + w, tnY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("TN", x0 + 2, tnY - 1);

  // NS initial horizontal (toute la largeur)
  const nsY = tnY + 14;
  doc.setDrawColor(30, 100, 200);
  doc.setLineWidth(0.5);
  doc.line(x0 + 5, nsY, x0 + w - 5, nsY);
  doc.setFontSize(7);
  doc.setTextColor(30, 100, 200);
  doc.text(`NS initial ${d.ns != null ? fmtN(d.ns, 2) + " m" : ""}`, x0 + 6, nsY - 1);
  doc.setTextColor(...BLACK);

  // Puits central
  const wellX = x0 + w / 2;
  const wellTop = tnY;
  const wellBottom = y0 + h - 14;
  doc.setLineWidth(0.6);
  doc.line(wellX - 2, wellTop, wellX - 2, wellBottom);
  doc.line(wellX + 2, wellTop, wellX + 2, wellBottom);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("Puits", wellX, wellTop - 1, { align: "center" });

  // Cône (courbe logarithmique approchée par segments)
  doc.setDrawColor(150, 80, 30);
  doc.setLineWidth(0.6);
  const sMax = 24; // amplitude graphique
  const rPxLeft = wellX - x0 - 5;
  const rPxRight = x0 + w - 5 - wellX;
  // côté gauche
  const N = 40;
  let px = wellX - 2, py = nsY + sMax;
  doc.line(wellX - 2, nsY, wellX - 2, py);
  for (let i = 1; i <= N; i++) {
    const t = i / N;
    const rPx = t * rPxLeft;
    // forme log : ln(R/r) → s décroissant
    const s = sMax * (1 - Math.log(1 + 9 * t) / Math.log(10));
    const nx = wellX - 2 - rPx;
    const ny = nsY + Math.max(0, s);
    doc.line(px, py, nx, ny);
    px = nx; py = ny;
  }
  // côté droit
  px = wellX + 2; py = nsY + sMax;
  doc.line(wellX + 2, nsY, wellX + 2, py);
  for (let i = 1; i <= N; i++) {
    const t = i / N;
    const rPx = t * rPxRight;
    const s = sMax * (1 - Math.log(1 + 9 * t) / Math.log(10));
    const nx = wellX + 2 + rPx;
    const ny = nsY + Math.max(0, s);
    doc.line(px, py, nx, ny);
    px = nx; py = ny;
  }

  // Cotes : rabattement s (vertical au centre)
  doc.setDrawColor(60, 60, 60);
  doc.setLineWidth(0.3);
  doc.line(wellX + 4, nsY, wellX + 4, nsY + sMax);
  doc.triangle(wellX + 4, nsY, wellX + 2.8, nsY + 2, wellX + 5.2, nsY + 2, "F");
  doc.triangle(wellX + 4, nsY + sMax, wellX + 2.8, nsY + sMax - 2, wellX + 5.2, nsY + sMax - 2, "F");
  doc.setFontSize(7);
  doc.text(`s = ${d.s != null ? fmtN(d.s, 2) + " m" : "[--]"}`, wellX + 6, nsY + sMax / 2);

  // Cote R (rayon d'influence — flèche horizontale en bas)
  const arrY = nsY + sMax + 5;
  doc.line(wellX, arrY, x0 + w - 6, arrY);
  doc.triangle(x0 + w - 6, arrY, x0 + w - 8, arrY - 1, x0 + w - 8, arrY + 1, "F");
  doc.triangle(wellX, arrY, wellX + 2, arrY - 1, wellX + 2, arrY + 1, "F");
  doc.setFontSize(7);
  doc.text(`R = ${d.R != null ? fmtN(d.R, 1) + " m" : "[--]"}`, (wellX + x0 + w) / 2, arrY + 4, { align: "center" });

  // Légende
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(`Hypothèse Dupuit-Thiem : Q = 2.pi.T.s / ln(R/r)   |   T = ${d.T != null ? fmtExp(d.T) + " m²/s" : "[--]"}`,
    x0 + 4, y0 + h - 3);
}

// (C) Schéma conceptuel — Puits + 2 piézomètres P1, P2 en vue de dessus
function drawConceptualLayout(doc, x0, y0, w, h, data) {
  const d = data || {};
  doc.setDrawColor(...BLACK);
  doc.setLineWidth(0.4);
  doc.setFillColor(252, 252, 250);
  doc.rect(x0, y0, w, h, "F");
  doc.rect(x0, y0, w, h);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Vue en plan — Puits et piézomètres de suivi", x0 + 4, y0 + 6);

  // Cercles zone d'influence (recentrés vers la gauche pour laisser place au tableau à droite)
  const cx = x0 + w * 0.28;
  const cy = y0 + h * 0.55;
  doc.setDrawColor(30, 100, 200);
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.setLineWidth(0.4);
  doc.circle(cx, cy, 22);
  doc.setLineDashPattern([], 0);

  doc.setDrawColor(150, 80, 30);
  doc.setLineWidth(0.3);
  doc.circle(cx, cy, 8);

  // Puits central
  doc.setFillColor(...RED_DK);
  doc.circle(cx, cy, 1.6, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...RED_DK);
  doc.text("Puits", cx + 2, cy - 1);

  // P1
  const p1x = cx - 12, p1y = cy - 10;
  doc.setFillColor(30, 100, 200);
  doc.circle(p1x, p1y, 1.4, "F");
  doc.setTextColor(30, 100, 200);
  doc.text("P1", p1x - 4, p1y - 1);

  // P2
  const p2x = cx + 15, p2y = cy + 6;
  doc.circle(p2x, p2y, 1.4, "F");
  doc.text("P2", p2x + 2, p2y);

  doc.setTextColor(...BLACK);
  // Légende cercles (sous le schéma, pas à côté)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(`R = ${d.R != null ? fmtN(d.R, 0) + " m" : "[--]"}`, cx, cy + 26);
  doc.text("C\u00f4ne de rabattement", cx - 8, y0 + h - 4);

  // Tableau récapitulatif à droite (largement à droite, hors zone cercle)
  const tx = x0 + w * 0.58;
  const ty = y0 + 14;
  const tw = w * 0.40;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setFillColor(...BLUE);
  doc.rect(tx, ty, tw, 5, "F");
  doc.setTextColor(255, 255, 255);
  doc.text("Ouvrage", tx + 1, ty + 3.5);
  doc.text("Dist.", tx + 18, ty + 3.5);
  doc.text("Rabatt.", tx + 32, ty + 3.5);
  doc.setTextColor(...BLACK);
  doc.setFont("helvetica", "normal");
  const rows = [
    ["Puits", "0 m", `${d.s != null ? fmtN(d.s, 2) + " m" : "—"}`],
    ["P1",    "[à compléter]", "—"],
    ["P2",    "[à compléter]", "—"]
  ];
  let yy = ty + 5;
  rows.forEach((r, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(...GREY_LL);
      doc.rect(tx, yy, tw, 5, "F");
    }
    doc.text(r[0], tx + 1, yy + 3.5);
    doc.text(r[1], tx + 18, yy + 3.5);
    doc.text(r[2], tx + 32, yy + 3.5);
    yy += 5;
  });
}

// ═══════════════════════════════════════════════════════════════════════════
//                                  PAGE DE GARDE
// ═══════════════════════════════════════════════════════════════════════════

function buildCover(doc, ctx, r) {
  const w = pageW(doc), h = pageH(doc);
  const inp = r.inputs;

  // Bandeau bleu haut
  doc.setFillColor(...BLUE);
  doc.rect(0, 0, w, 38, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("G.M.E.P", w / 2, 18, { align: "center" });
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Bureau d'études en environnement et hydrogéologie", w / 2, 25, { align: "center" });
  doc.text("9 rue de la Marne  |  79400 Saint-Maixent-l'École  |  gmep.france@gmail.com", w / 2, 32, { align: "center" });
  doc.setTextColor(...BLACK);

  // Titres
  let y = 56;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BLUE_D);
  doc.setFontSize(22);
  doc.text("Rabattement d'une nappe souterraine", w / 2, y, { align: "center" });
  y += 12;
  doc.setFontSize(15);
  doc.text("DOSSIER TECHNIQUE — " + (ctx.regimeUpper || "HORS NOMENCLATURE IOTA"), w / 2, y, { align: "center" });
  y += 9;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...BLACK);
  doc.text("Articles L.214-1 à L.214-6 du Code de l'environnement", w / 2, y, { align: "center" });
  y += 5;
  doc.text("Nomenclature IOTA — R.214-1 du Code de l'environnement", w / 2, y, { align: "center" });

  // Tableau référence dossier (rectangle)
  y += 10;
  const refRows = [
    ["Référence dossier", ctx.ref],
    ["Commune", inp.commune || "[ à compléter ]"],
    ["Département", inp.dept ? `${inp.dept}${r.clim && r.clim.dept ? " — " + r.clim.dept : ""}` : "[ à compléter ]"],
    ["Date d'édition", ctx.date],
    ["Version", "v15.61"]
  ];
  y = table2Col(doc, y, refRows, { colW1: (w - M_LEFT - M_RIGHT) * 0.38 });

  // Intervenants — 4 colonnes
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...BLUE_D);
  doc.text("Intervenants", M_LEFT, y);
  doc.setTextColor(...BLACK);
  y += 4;

  const interv = [
    [
      "Maître d'ouvrage",
      inp.mo || "[ MO à compléter ]",
      (inp.mo_adresse || "Adresse :\n[ à compléter ]")
        + "\n" + (inp.mo_tel ? "Tél : " + inp.mo_tel : "Tél : [ à compléter ]")
        + "\n" + (inp.mo_email ? "Email : " + inp.mo_email : "Email : [ à compléter ]")
    ],
    [
      "Entreprise travaux",
      inp.travaux || "[ à compléter ]",
      (inp.travaux_adresse || "Adresse :\n[ à compléter ]")
        + "\n" + (inp.travaux_siret ? "SIRET : " + inp.travaux_siret : "SIRET : [ à compléter ]")
    ],
    [
      "Bureau d'études",
      inp.be || "G.M.E.P",
      "SARL G.M.E.P\n9 rue de la Marne\n79400 Saint-Maixent-l'École\nSIRET 75309762500010\ngmep.france@gmail.com"
    ],
    [
      "Société de forage",
      inp.forage || "[ à compléter ]",
      (inp.forage_adresse || "Adresse :\n[ à compléter ]")
        + "\n" + (inp.forage_siret ? "SIRET : " + inp.forage_siret : "SIRET : [ à compléter ]")
    ]
  ];
  // 4 colonnes uniformes — pour chacune : header bleu + nom gras + corps
  const fullW = w - M_LEFT - M_RIGHT;
  const colW = fullW / 4;
  const colH = 56;
  for (let i = 0; i < 4; i++) {
    const cx = M_LEFT + i * colW;
    // header
    doc.setFillColor(...BLUE);
    doc.rect(cx, y, colW, 7, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(safeText(interv[i][0]), cx + colW / 2, y + 5, { align: "center" });
    // corps
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...BLUE);
    doc.setLineWidth(0.3);
    doc.rect(cx, y + 7, colW, colH - 7);
    doc.setTextColor(...BLUE_D);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    const nameLines = doc.splitTextToSize(safeText(interv[i][1]), colW - 4);
    doc.text(nameLines, cx + 2, y + 12);
    doc.setTextColor(...BLACK);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    const bodyY = y + 12 + nameLines.length * 4;
    const bodyLines = doc.splitTextToSize(safeText(interv[i][2]), colW - 4);
    doc.text(bodyLines, cx + 2, bodyY);
  }
  y += colH + 6;

  // Cadre conclusion préliminaire
  doc.setFillColor(...GREEN_BG);
  doc.setDrawColor(...GREEN_DK);
  doc.setLineWidth(0.6);
  doc.rect(M_LEFT, y, fullW, 24, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...GREEN_DK);
  doc.text("Statut réglementaire pré-calculé", w / 2, y + 8, { align: "center" });
  doc.setFontSize(13);
  doc.text(safeText(r.iota_status), w / 2, y + 17, { align: "center" });
  doc.setTextColor(...BLACK);
  y += 28;

  // Logo / signature pied de garde
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(...GREY);
  doc.text("Document généré automatiquement par GMEP Logiciel Rabattement v15.61 — www.gmep-france.eu",
    w / 2, h - 12, { align: "center" });
  doc.text("Ce dossier doit être complété et vérifié avant tout dépôt en DDT.",
    w / 2, h - 7, { align: "center" });
  doc.setTextColor(...BLACK);
}

// ═══════════════════════════════════════════════════════════════════════════
//                                  SOMMAIRE
// ═══════════════════════════════════════════════════════════════════════════

function buildToc(doc, ctx) {
  let y = M_TOP + 4;
  y = sectionBanner(doc, y, "SOMMAIRE");
  const items = [
    ["1.",   "Objet de l'étude",                                              3],
    ["2.",   "Données du projet",                                              4],
    ["2.1",  "Caractéristiques de l'ouvrage",                                  4],
    ["2.2",  "Paramètres hydrogéologiques",                                    5],
    ["2bis", "Schémas techniques et contexte géographique",                    6],
    ["3.",   "Méthodes de calcul",                                            10],
    ["3.1",  "Méthode de Theis (régime transitoire)",                         10],
    ["3.2",  "Méthode de Dupuit-Thiem (régime permanent)",                    11],
    ["4.",   "Résultats des calculs",                                         13],
    ["4.1",  "Rabattement et débits",                                         13],
    ["4.2",  "Bilan volumétrique",                                            14],
    ["5.",   "Vérification réglementaire — Nomenclature IOTA",                15],
    ["5.1",  "Rubrique 1.1.1.0 — Création d'ouvrage",                         15],
    ["5.2",  "Rubrique 1.1.2.0 — Prélèvements",                               16],
    ["5.3",  "Rubrique 1.3.1.0 — Zone de Répartition des Eaux (ZRE)",         17],
    ["5.4",  "Rubrique 2.x.x.0 — Rejet des eaux d'exhaure",                   18],
    ["5.5",  "Masse d'eau souterraine concernée (référentiel SANDRE)",        19],
    ["5.6",  "Régime cumulé & délais d'instruction",                          20],
    ["6.",   "Sensibilité environnementale — ZNIEFF et Natura 2000",          21],
    ["7.",   "Préconisations techniques",                                     24],
    ["8.",   "Conclusion — Synthèse",                                         26],
    ["—",    "Lexique des abréviations",                                      28]
  ];
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  const w = pageW(doc);
  const fullW = w - M_LEFT - M_RIGHT;
  items.forEach((it, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(...GREY_LL);
      doc.rect(M_LEFT, y - 4, fullW, 6, "F");
    }
    doc.setTextColor(...BLUE_D);
    doc.setFont("helvetica", "bold");
    doc.text(it[0], M_LEFT + 4, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...BLACK);
    doc.text(safeText(it[1]), M_LEFT + 22, y);
    // pointillé droite
    doc.setTextColor(...GREY);
    doc.setFontSize(8);
    doc.text("p. " + it[2], w - M_RIGHT - 4, y, { align: "right" });
    doc.setFontSize(10.5);
    doc.setTextColor(...BLACK);
    y += 6;
  });

  // Note
  y += 6;
  paragraph(doc, y,
    "Ce dossier technique a pour objet d'évaluer la nécessité d'une procédure de déclaration ou d'autorisation au titre de la Loi sur l'Eau pour un projet de rabattement temporaire de nappe. Les sections 1 à 5 sont calculées automatiquement à partir des paramètres saisis. Les sections 6, 7 et 8 sont à compléter par l'opérateur en s'appuyant sur les bases de données officielles (INPN, BRGM, IGN, SANDRE).",
    { size: 9, color: GREY });
}

// ═══════════════════════════════════════════════════════════════════════════
//                       SECTION 1 — Objet de l'étude
// ═══════════════════════════════════════════════════════════════════════════

function buildSection1(doc, ctx, r) {
  let y = M_TOP + 4;
  y = sectionBanner(doc, y, "1. OBJET DE L'ÉTUDE");
  const inp = r.inputs;
  y = paragraph(doc, y,
    `Le présent dossier technique a pour objet l'évaluation hydrogéologique d'un projet de rabattement de nappe sur la commune de ${inp.commune || "[ à compléter ]"} (département ${inp.dept || "—"}). Les calculs sont effectués selon les méthodes de Theis (régime transitoire) et de Dupuit-Thiem (régime permanent), à partir des paramètres hydrauliques du substrat retenu et de la géométrie de l'ouvrage projeté.`,
    { size: 10 });
  y += 2;
  y = paragraph(doc, y,
    "L'étude vise à déterminer si le projet relève d'une procédure réglementaire au titre de la Loi sur l'Eau (déclaration ou autorisation), conformément à la nomenclature IOTA définie à l'article R.214-1 du Code de l'environnement. Sont examinées les rubriques 1.1.1.0 (création d'ouvrage), 1.1.2.0 (prélèvements), 1.3.1.0 (Zone de Répartition des Eaux) et 2.x.x.0 (rejet des eaux d'exhaure).",
    { size: 10 });
  y += 5;

  // Tableau régime
  y = subTitle(doc, y, "Synthèse réglementaire");
  y = tableN(doc, y, [
    ["Code de l'environnement", "L.214-1 à L.214-6 / R.214-1", r.iota_status, "Voir §5"]
  ], {
    header: ["Texte", "Nomenclature applicable", "Régime calculé", "Référence"],
    widths: [25, 30, 25, 20]
  });

  y += 4;
  y = subTitle(doc, y, "Périmètre de l'étude");
  y = paragraph(doc, y,
    "— Modélisation hydraulique : calculs de rabattement, débit pompable et volume prélevé.\n— Vérification réglementaire : nomenclature IOTA, ZRE, masse d'eau SANDRE.\n— Sensibilité environnementale : ZNIEFF I/II, Natura 2000 (ZPS/ZSC) — à compléter.\n— Préconisations techniques : équipement de pompage, gestion des eaux d'exhaure, suivi piézométrique.",
    { size: 10 });
}

// ═══════════════════════════════════════════════════════════════════════════
//             SECTION 2 — Données du projet (2.1 + 2.2)
// ═══════════════════════════════════════════════════════════════════════════

function buildSection2_1(doc, ctx, r) {
  let y = M_TOP + 4;
  y = sectionBanner(doc, y, "2. DONNÉES DU PROJET");
  const inp = r.inputs;

  y = subTitle(doc, y, "2.1  Caractéristiques de l'ouvrage");
  y = paragraph(doc, y,
    "Les caractéristiques géométriques et altimétriques de l'ouvrage projeté sont synthétisées ci-après. Ces données conditionnent l'ensemble des calculs hydrogéologiques présentés en sections 3 et 4.",
    { size: 10 });
  y += 2;

  const diaIntMm = inp.diam_int ? inp.diam_int * 1000 : null;
  const rows = [
    ["Diamètre intérieur (Ø int)",   diaIntMm != null ? `${fmtN(diaIntMm, 0)} mm` : "[ à compléter ]"],
    ["Diamètre extérieur (Ø ext)",   inp.diam_ext != null && !isNaN(inp.diam_ext) ? `${fmtN(inp.diam_ext, 0)} mm` : "[ à compléter ]"],
    ["Profondeur du forage",          inp.prof_puits != null && !isNaN(inp.prof_puits) ? `${fmtN(inp.prof_puits, 2)} m` : "[ à compléter ]"],
    ["Altimétrie tête d'ouvrage",     inp.alt_tete != null && !isNaN(inp.alt_tete) ? `${fmtN(inp.alt_tete, 2)} m NGF` : "[ à compléter ]"],
    ["Altimétrie fond de l'ouvrage",  inp.alt_fond != null && !isNaN(inp.alt_fond) ? `${fmtN(inp.alt_fond, 2)} m NGF` : "[ à compléter ]"],
    ["Rayon du puits r",              inp.diam_int != null ? `${fmtN(inp.diam_int / 2, 3)} m` : "[ à compléter ]"],
    ["Type de captage",               inp.type_captage || "Puits foré avec tubage PVC crépiné"],
    ["Niveau statique (NS / TN)",     inp.ns != null && !isNaN(inp.ns) ? `${fmtN(inp.ns, 2)} m` : "[ à compléter ]"],
    ["Fond de fouille (FF / TN)",     inp.ff != null && !isNaN(inp.ff) ? `${fmtN(inp.ff, 2)} m` : "[ à compléter ]"],
    ["Rabattement requis s = FF - NS", r.s != null && !isNaN(r.s) ? `${fmtN(r.s, 2)} m` : "—"],
    ["Rayon d'influence R (saisie)",  inp.rayon_inf != null && !isNaN(inp.rayon_inf) ? `${fmtN(inp.rayon_inf, 1)} m` : "—"],
    ["Durée de pompage prévue",       inp.t_pompage != null && !isNaN(inp.t_pompage) ? `${fmtN(inp.t_pompage, 0)} h` : "[ à compléter ]"]
  ];
  y = table2Col(doc, y, rows, { header: ["Paramètre", "Valeur"] });

  y += 3;
  y = subTitle(doc, y, "Équipements de l'ouvrage");
  y = paragraph(doc, y,
    "— Margelle bétonnée ou dalle périphérique étanche (rayon minimal 0,5 m).\n"
    + "— Capot verrouillé étanche aux eaux de ruissellement.\n"
    + "— Tubage plein PVC ou acier inox sur la partie supérieure (zone non saturée).\n"
    + "— Crépine sur la zone captée — fente adaptée à la granulométrie de l'aquifère.\n"
    + "— Massif filtrant de silice 2-4 mm sur toute la hauteur crépinée.\n"
    + "— Bouchon de bentonite (≥ 2 m) en partie supérieure pour étanchéité annulaire.\n"
    + "— Cimentation annulaire au-dessus du bouchon bentonite jusqu'au TN.",
    { size: 9.5 });
}

function buildSection2_2(doc, ctx, r) {
  let y = M_TOP + 4;
  y = subTitle(doc, y, "2.2  Paramètres hydrogéologiques");
  y = paragraph(doc, y,
    "Le substrat retenu fixe les paramètres hydrauliques utilisés dans les calculs. La transmissivité T est calculée comme le produit de la conductivité hydraulique K par l'épaisseur saturée e de l'aquifère.",
    { size: 10 });
  y += 2;

  const geo = r.geo || {};
  const rows = [
    ["Substrat retenu",            r.inputs.substrat || "[ à compléter ]"],
    ["Famille géologique",         geo.famille || "—"],
    ["Type de nappe",              geo.type || "—"],
    ["Conductivité hydraulique K", geo.K != null ? `${fmtExp(geo.K)} m/s` : "—"],
    ["Transmissivité T = K × e",   r.T != null ? `${fmtExp(r.T)} m²/s` : "—"],
    ["Coefficient d'emmagasinement S (captif)",  geo.S_captif != null ? fmtExp(geo.S_captif) : (r.S != null ? fmtExp(r.S) : "—")],
    ["Coefficient d'emmagasinement S (libre)",   geo.S_libre  != null ? fmtExp(geo.S_libre)  : "—"],
    ["Porosité efficace ne",       geo.ne != null ? fmtN(geo.ne, 3) : "—"],
    ["Épaisseur saturée e",        geo.ep != null ? `${fmtN(geo.ep, 1)} m` : "—"]
  ];
  y = table2Col(doc, y, rows, { header: ["Paramètre hydrogéologique", "Valeur"], orange: true });

  y += 3;
  y = subTitle(doc, y, "Données terrain");
  const dataRows = [
    ["Niveau statique NS",    r.inputs.ns != null ? `${fmtN(r.inputs.ns, 2)} m / TN` : "—"],
    ["Fond de fouille FF",    r.inputs.ff != null ? `${fmtN(r.inputs.ff, 2)} m / TN` : "—"],
    ["Rabattement s",         r.s  != null ? `${fmtN(r.s, 2)} m` : "—"],
    ["Rayon d'influence R",   r.R  != null ? `${fmtN(r.R, 1)} m` : "—"],
    ["Durée pompage",         r.inputs.t_pompage != null ? `${fmtN(r.inputs.t_pompage, 0)} h` : "—"],
    ["Heures d'exploitation/jour", r.inputs.t_exp != null ? `${fmtN(r.inputs.t_exp, 0)} h/j` : "—"]
  ];
  y = table2Col(doc, y, dataRows, { header: ["Donnée", "Valeur"] });
}

// ═══════════════════════════════════════════════════════════════════════════
//          SECTION 2bis — Schémas techniques (3 pages)
// ═══════════════════════════════════════════════════════════════════════════

function buildSchemas(doc, ctx, r) {
  // Page schéma A : coupe puits
  let y = M_TOP + 4;
  y = sectionBanner(doc, y, "2bis. SCHÉMAS TECHNIQUES");
  y = subTitle(doc, y, "A.  Coupe schématique du puits et du piézomètre");
  y = paragraph(doc, y,
    "La coupe schématique ci-dessous illustre la configuration projetée : tubage PVC plein en partie supérieure, crépine sur la zone captée, massif filtrant de silice 2-4 mm, et bouchon de bentonite en tête. Les niveaux d'eau (statique et dynamique) ainsi que la cote du fond de fouille sont positionnés pour faciliter l'interprétation.",
    { size: 9.5 });
  const w = pageW(doc);
  const drawW = w - M_LEFT - M_RIGHT;
  drawWellCrossSection(doc, M_LEFT, y, drawW, 130, {
    ns: r.inputs.ns, ff: r.inputs.ff, prof: r.inputs.prof_puits, s: r.s
  });

  // Page schéma B : cône Dupuit-Thiem
  newPage(doc, ctx);
  y = M_TOP + 4;
  y = subTitle(doc, y, "B.  Cône de rabattement (Dupuit-Thiem, régime permanent)");
  y = paragraph(doc, y,
    "Le rabattement induit par le pompage prend la forme d'un cône de dépression centré sur l'ouvrage. Sa géométrie suit la solution analytique de Dupuit-Thiem en régime permanent : s(r) = Q / (2.pi.T) . ln(R/r). Le rayon d'influence R correspond à la distance à laquelle le rabattement devient négligeable.",
    { size: 9.5 });
  drawDrawdownCone(doc, M_LEFT, y, drawW, 110, { ns: r.inputs.ns, s: r.s, R: r.R, T: r.T });

  // Page schéma C : conceptuel + cartes
  newPage(doc, ctx);
  y = M_TOP + 4;
  y = subTitle(doc, y, "C.  Schéma conceptuel — Puits et piézomètres de suivi");
  y = paragraph(doc, y,
    "Configuration recommandée : au moins deux piézomètres de suivi (P1, P2) implantés à des distances croissantes du puits, dans le périmètre du cône de rabattement. Leurs relevés permettront de valider en phase chantier les hypothèses hydrauliques de la présente note.",
    { size: 9.5 });
  drawConceptualLayout(doc, M_LEFT, y, drawW, 70, { R: r.R, s: r.s });
  y += 76;

  y = subTitle(doc, y, "Contexte géographique — Cartes de référence");
  y = paragraph(doc, y,
    "Les cartes officielles à joindre au dossier (cadres ci-dessous) sont à générer depuis les portails IGN Géoportail, BRGM InfoTerre, SANDRE Eau France et Hub'Eau. À reporter manuellement ou via l'onglet « Carte » du logiciel.",
    { size: 9, color: GREY });
  // 5 placeholders mini
  const halfW = (drawW - 4) / 2;
  const mapH = 22;
  const labels = [
    "Carte 1 — Localisation générale (IGN Géoportail PLANIGNV2, échelle 1:100 000)",
    "Carte 2 — Topographique (IGN PLANIGNV2, échelle 1:25 000)",
    "Carte 3 — Géologique (BRGM InfoTerre, échelle 1:50 000)",
    "Carte 4 — Hydrologique (IGN + SANDRE, échelle 1:25 000)",
    "Carte 5 — Masses d'eau souterraine DCE (Eau France MDO + BRGM BSS)"
  ];
  for (let i = 0; i < labels.length; i++) {
    const col = i % 2, row = Math.floor(i / 2);
    const cx = M_LEFT + col * (halfW + 4);
    const cy = y + row * (mapH + 3);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(160, 160, 160);
    doc.setLineDashPattern([1.5, 1.5], 0);
    doc.setLineWidth(0.4);
    doc.rect(cx, cy, halfW, mapH, "FD");
    doc.setLineDashPattern([], 0);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(...GREY);
    const lines = doc.splitTextToSize(labels[i], halfW - 4);
    doc.text(lines, cx + 2, cy + 5);
    doc.setTextColor(...BLACK);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//          PAGE Localisation — capture carte Leaflet si dispo
// ═══════════════════════════════════════════════════════════════════════════

async function buildLocation(doc, ctx, r) {
  let y = M_TOP + 4;
  y = sectionBanner(doc, y, "2ter. LOCALISATION CARTOGRAPHIQUE");
  const inp = r.inputs;

  if (inp.x_l93 && inp.y_l93) {
    const wgs = lambert93_to_wgs84(inp.x_l93, inp.y_l93);
    y = table2Col(doc, y, [
      ["X Lambert 93",       `${fmtInt(inp.x_l93)} m`],
      ["Y Lambert 93",       `${fmtInt(inp.y_l93)} m`],
      ["Latitude WGS84",     wgs.lat.toFixed(5) + "°"],
      ["Longitude WGS84",    wgs.lon.toFixed(5) + "°"],
      ["Rayon d'influence",  r.R != null ? `${fmtN(r.R, 0)} m` : "—"]
    ], { header: ["Paramètre", "Valeur"] });
  } else {
    y = calloutBox(doc, y, "Coordonnées Lambert 93 non saisies. Renseignez X et Y dans l'onglet « Saisie » pour activer la carte automatique.", "warn");
  }

  // Capture carte si visible
  let mapImg = null;
  if (inp.x_l93 && inp.y_l93) {
    const mapEl = document.getElementById("map");
    if (mapEl && mapEl.offsetParent !== null) {
      mapImg = await captureMap();
    }
  }
  const w = pageW(doc);
  const drawW = w - M_LEFT - M_RIGHT;
  if (mapImg) {
    doc.addImage(mapImg, "JPEG", M_LEFT, y, drawW, 110);
  } else {
    doc.setDrawColor(160, 160, 160);
    doc.setFillColor(252, 252, 252);
    doc.setLineDashPattern([1.5, 1.5], 0);
    doc.rect(M_LEFT, y, drawW, 110, "FD");
    doc.setLineDashPattern([], 0);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(...GREY);
    doc.text("Affichez l'onglet « Carte » dans l'application avant de générer le PDF pour insérer ici la carte de situation.",
      w / 2, y + 55, { align: "center", maxWidth: drawW - 20 });
    doc.setTextColor(...BLACK);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//          SECTION 3 — Méthodes de calcul (Theis & Dupuit)
// ═══════════════════════════════════════════════════════════════════════════

function buildSection3(doc, ctx, r) {
  let y = M_TOP + 4;
  y = sectionBanner(doc, y, "3. MÉTHODES DE CALCUL");

  y = subTitle(doc, y, "3.1  Méthode de Theis — Régime transitoire");
  y = paragraph(doc, y,
    "La méthode de Theis (1935) permet de calculer le débit Q nécessaire pour atteindre un rabattement s en régime transitoire dans un aquifère captif homogène et isotrope. L'expression analytique est :",
    { size: 10 });
  y += 1;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...BLUE_D);
  doc.text("Q = 4.pi.T.s / W(u)        avec        u = r².S / (4.T.t)", pageW(doc) / 2, y + 4, { align: "center" });
  doc.setTextColor(...BLACK);
  y += 10;

  y = paragraph(doc, y,
    "où W(u) est la fonction de puits (well function), T la transmissivité, S le coefficient d'emmagasinement, r le rayon du puits et t la durée de pompage. La fonction W(u) est évaluée par développement en série pour u < 1, et par approximation asymptotique pour u >> 1.",
    { size: 10 });
  y += 2;

  y = table2Col(doc, y, [
    ["Rayon du puits r",            r.r_puits != null ? `${fmtN(r.r_puits, 3)} m` : "—"],
    ["Durée de pompage t",          r.t_s != null ? `${fmtN(r.t_s / 3600, 1)} h (${fmtInt(r.t_s)} s)` : "—"],
    ["Variable u",                  r.u != null ? fmtExp(r.u) : "—"],
    ["Fonction de puits W(u)",      r.Wu != null ? fmtN(r.Wu, 4) : "—"],
    ["Débit Theis brut Q",          r.Q_theis != null ? `${fmtN(r.Q_theis, 2)} m³/h` : "—"],
    ["Rendement η",                 "0,70"],
    ["Débit Theis corrigé Q × η",   r.Q_theis_corr != null ? `${fmtN(r.Q_theis_corr, 2)} m³/h` : "—"]
  ], { header: ["Paramètre Theis", "Valeur"] });

  y += 3;
  y = subTitle(doc, y, "3.2  Méthode de Dupuit-Thiem — Régime permanent");
  y = paragraph(doc, y,
    "La méthode de Dupuit-Thiem (1906) décrit le régime permanent. Elle suppose un cône de rabattement stabilisé avec un rayon d'influence R fini. L'expression analytique est :",
    { size: 10 });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...BLUE_D);
  doc.text("Q = 2.pi.T.s / ln(R/r)", pageW(doc) / 2, y + 4, { align: "center" });
  doc.setTextColor(...BLACK);
  y += 10;

  y = table2Col(doc, y, [
    ["Rayon d'influence R",        r.R != null ? `${fmtN(r.R, 1)} m` : "—"],
    ["Débit Dupuit brut Q",        r.Q_dupuit != null ? `${fmtN(r.Q_dupuit, 2)} m³/h` : "—"],
    ["Débit Dupuit corrigé Q × η", r.Q_dupuit_corr != null ? `${fmtN(r.Q_dupuit_corr, 2)} m³/h` : "—"]
  ], { header: ["Paramètre Dupuit-Thiem", "Valeur"] });
}

// ═══════════════════════════════════════════════════════════════════════════
//          SECTION 4 — Résultats
// ═══════════════════════════════════════════════════════════════════════════

function buildSection4(doc, ctx, r) {
  let y = M_TOP + 4;
  y = sectionBanner(doc, y, "4. RÉSULTATS DES CALCULS");

  y = subTitle(doc, y, "4.1  Rabattement, débits et fourchette recommandée");
  y = paragraph(doc, y,
    "Les deux méthodes de calcul (Theis et Dupuit-Thiem) convergent vers une fourchette de débit recommandée. Cette fourchette intègre une marge de ±15 % pour absorber les incertitudes sur les paramètres hydrauliques et tenir compte des variations saisonnières du niveau piézométrique.",
    { size: 10 });
  y += 2;

  const res4Rows = [
    ["Rabattement requis s",            r.s != null ? `${fmtN(r.s, 2)} m` : "—"],
    ["Débit Theis corrigé",             r.Q_theis_corr != null ? `${fmtN(r.Q_theis_corr, 3)} m³/h` : "—"],
    ["Débit Dupuit-Thiem corrigé",      r.Q_dupuit_corr != null ? `${fmtN(r.Q_dupuit_corr, 3)} m³/h` : "—"]
  ];
  if (r.Q_floor != null && r.Q_floor > 0) {
    res4Rows.push(["Q plancher = V journalier retenu / t_exploit", `${fmtN(r.Q_floor, 3)} m³/h`]);
  }
  if (r.Q_cycle != null && r.Q_cycle > 0) {
    res4Rows.push(["Q cycle pompe (saisie)", `${fmtN(r.Q_cycle, 3)} m³/h`]);
  }
  res4Rows.push(
    ["Débit base recommandé = max(Theis, Dupuit, cycle, plancher)",
      r.Q_base != null ? `${fmtN(r.Q_base, 3)} m³/h` : "—"],
    ["Plage Q recommandée (±15 %)",
      (r.Q_min != null && r.Q_max != null) ? `${fmtN(r.Q_min, 3)} — ${fmtN(r.Q_max, 3)} m³/h` : "—"]
  );
  y = table2Col(doc, y, res4Rows, { header: ["Résultat hydraulique", "Valeur"] });

  y += 3;
  y = subTitle(doc, y, "4.2  Bilan volumétrique");
  y = paragraph(doc, y,
    "Les volumes journalier, mensuel et annuel sont calculés à partir du débit corrigé et de la durée d'exploitation effective. Le ratio prélèvement / recharge évalue la pression sur la ressource.",
    { size: 10 });
  y += 2;
  const tExp = r.inputs.t_exp || 24;
  y = table2Col(doc, y, [
    ["Durée d'exploitation journalière", `${tExp} h/jour`],
    ["Volume journalier (Vj = Q × t)",   r.V_jour != null ? `${fmtInt(r.V_jour)} m³/j` : "—"],
    ["Volume mensuel (30 j)",            r.V_mois != null ? `${fmtInt(r.V_mois)} m³/mois` : "—"],
    ["Volume annuel (365 j)",            r.V_an   != null ? `${fmtInt(r.V_an)} m³/an` : "—"],
    ["Surface du cône d'influence",      r.surface_inf != null ? `${fmtInt(r.surface_inf)} m²` : "—"],
    ["Volume recharge équivalent",       r.V_recharge != null ? `${fmtInt(r.V_recharge)} m³/an` : "—"],
    ["Ratio prélèvement / recharge",     r.ratio != null ? `${fmtN(r.ratio * 100, 1)} %` : "—"]
  ], { header: ["Bilan volumétrique", "Valeur"] });

  // Conclusion 4
  y += 3;
  const sValid = r.s != null && r.s > 0;
  if (!sValid) {
    y = calloutBox(doc, y,
      "Rabattement nul ou négatif : le fond de fouille est situé au-dessus du niveau d'eau. Aucun pompage gravitaire n'est physiquement requis pour la mise hors d'eau du chantier.",
      "info");
  } else {
    y = calloutBox(doc, y,
      `Rabattement effectif s = ${fmtN(r.s, 2)} m sur un rayon d'influence de ${fmtN(r.R, 0)} m. Volume prélevé annuel estimé : ${fmtInt(r.V_an)} m³/an.`,
      "info");
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//          SECTION 5 — Vérification réglementaire IOTA
// ═══════════════════════════════════════════════════════════════════════════

function buildSection5(doc, ctx, r) {
  let y = M_TOP + 4;
  y = sectionBanner(doc, y, "5. VÉRIFICATION RÉGLEMENTAIRE — NOMENCLATURE IOTA");
  y = paragraph(doc, y,
    "La nomenclature IOTA (Installations, Ouvrages, Travaux et Activités) définie à l'article R.214-1 du Code de l'Environnement fixe les seuils de déclaration et d'autorisation pour les prélèvements d'eaux souterraines, ainsi que pour les rejets associés. Le présent rabattement de nappe relève simultanément de plusieurs rubriques, examinées ci-après.",
    { size: 10 });
  y += 4;

  // 5.1 — 1.1.1.0
  y = subTitle(doc, y, "5.1  Rubrique 1.1.1.0 — Sondage, forage, puits ou ouvrage souterrain");
  y = paragraph(doc, y,
    "Intitulé réglementaire (R.214-1) : sondages, forages, y compris les essais de pompage, création de puits ou d'ouvrage souterrain non destiné à un usage domestique, exécutés en vue de la recherche, surveillance ou prélèvement d'eaux souterraines. Rubrique sans seuil de volume — toute création d'ouvrage de prélèvement non domestique est soumise à déclaration.",
    { size: 9.5 });
  y = tableN(doc, y, [["Déclaration (D)", "Tout ouvrage non domestique", "Sans seuil"]],
    { header: ["Régime", "Condition", "Seuil"], widths: [20, 50, 20] });
  y = calloutBox(doc, y,
    "Les ouvrages de rabattement (puits, pointes filtrantes ou tranchées drainantes) projetés relèvent de la rubrique 1.1.1.0 — DÉCLARATION, indépendamment du volume.",
    "info");

  // 5.2 — 1.1.2.0
  newPage(doc, ctx);
  y = M_TOP + 4;
  y = subTitle(doc, y, "5.2  Rubrique 1.1.2.0 — Prélèvements permanents ou temporaires");
  y = paragraph(doc, y,
    "Intitulé réglementaire (R.214-1) : prélèvements permanents ou temporaires issus d'un forage, puits ou ouvrage souterrain dans un système aquifère, à l'exclusion des nappes d'accompagnement de cours d'eau, par pompage, drainage, dérivation ou tout autre procédé. Le volume total prélevé étant :",
    { size: 9.5 });
  y = tableN(doc, y, [
    ["Autorisation (A)",  "Volume annuel prélevé",   "≥ 200 000 m³/an"],
    ["Déclaration (D)",   "Volume annuel prélevé",   "≥ 10 000 et < 200 000 m³/an"],
    ["Hors nomenclature", "Volume annuel prélevé",   "< 10 000 m³/an"]
  ], { header: ["Régime", "Condition", "Seuil annuel"], widths: [20, 35, 35] });

  y += 2;
  y = subTitle(doc, y, "Calcul du volume annuel prévisionnel");
  y = table2Col(doc, y, [
    ["Débit pompé Q (Theis, corrigé η)",   r.Q_theis_corr != null ? `${fmtN(r.Q_theis_corr, 2)} m³/h` : "—"],
    ["Durée d'exploitation journalière",   `${r.inputs.t_exp || 24} h/jour`],
    ["Volume journalier Vj",               r.V_jour != null ? `${fmtInt(r.V_jour)} m³/j` : "—"],
    ["Volume mensuel (30 j)",              r.V_mois != null ? `${fmtInt(r.V_mois)} m³/mois` : "—"],
    ["Volume annuel V = Vj × 365",         r.V_an != null ? `${fmtInt(r.V_an)} m³/an` : "—"],
    ["Comparaison seuil déclaration",      r.V_an != null && r.V_an < 10000 ? "< 10 000 m³/an" : (r.V_an != null && r.V_an < 200000 ? "≥ 10 000 et < 200 000" : "≥ 200 000")],
    ["Statut réglementaire 1.1.2.0",       r.V_an >= 200000 ? "AUTORISATION" : (r.V_an >= 10000 ? "DÉCLARATION" : "HORS NOMENCLATURE")]
  ], { header: ["Paramètre", "Valeur"] });

  // 5.3 — ZRE
  newPage(doc, ctx);
  y = M_TOP + 4;
  y = subTitle(doc, y, "5.3  Rubrique 1.3.1.0 — Zone de Répartition des Eaux (ZRE)");
  y = paragraph(doc, y,
    "Les Zones de Répartition des Eaux (ZRE) sont des secteurs où les ressources hydriques sont insuffisantes par rapport aux besoins. Dans ces zones, les seuils sont abaissés : autorisation à partir de 8 m³/h en capacité totale, déclaration en deçà.",
    { size: 9.5 });
  y = tableN(doc, y, [
    ["Autorisation (A)", "Capacité totale maximale", "≥ 8 m³/h"],
    ["Déclaration (D)",  "Capacité totale maximale", "< 8 m³/h"]
  ], { header: ["Régime", "Condition (capacité totale)", "Seuil"], widths: [20, 50, 20] });

  // Statut ZRE pré-calculé + régime résultant pour le projet
  const zreCommuneLabel = r.zre_applicable === true  ? "OUI — commune classée ZRE (saisie utilisateur)"
                        : r.zre_applicable === false ? "NON — hors périmètre ZRE"
                        : "À VÉRIFIER — département à ZRE présomptives (Beauce / Loire-Bretagne)";
  const debitInfo = `Débit Q calculé (Theis corrigé) = ${fmtN(r.Q_theis_corr, 2)} m³/h — ${r.Q_theis_corr >= 8 ? "DÉPASSE" : "INFÉRIEUR À"} le seuil ZRE de 8 m³/h.`;
  y = tableN(doc, y, [
    ["Statut ZRE de la commune", zreCommuneLabel],
    ["Débit projet vs seuil ZRE",  debitInfo],
    ["Régime résultant 1.3.1.0",   r.zre_regime]
  ], { header: ["Paramètre", "Valeur"], widths: [40, 50] });

  // Callout d'alerte si AUTORISATION ZRE
  if (r.zre_applicable === true && r.Q_theis_corr >= 8) {
    y = calloutBox(doc, y,
      `⚠ La commune ${ctx.commune} est classée en Zone de Répartition des Eaux et le débit projeté (${fmtN(r.Q_theis_corr, 2)} m³/h) dépasse le seuil de 8 m³/h. Le projet est donc soumis à AUTORISATION au titre de la rubrique 1.3.1.0 (article R.214-1 du Code de l'environnement). Référence de l'arrêté préfectoral fondateur à indiquer dans le dossier déposé en DDT(M).`,
      "danger");
  } else if (r.zre_applicable === null) {
    y = editableBox(doc, y, 18,
      "À confirmer : vérifier le classement ZRE de la commune sur le registre officiel (Agence de l'Eau) par code INSEE et reporter la référence de l'arrêté préfectoral fondateur.");
  }

  // 5.4 — Rejet eaux exhaure (nouvelle page pour clarté)
  newPage(doc, ctx);
  y = M_TOP + 4;
  y = subTitle(doc, y, "5.4  Rejet des eaux d'exhaure — Rubriques 2.x.x.0");
  y = paragraph(doc, y,
    "Les eaux pompées dans le cadre du rabattement (eaux d'exhaure) doivent faire l'objet d'un exutoire dûment identifié. Selon le mode de rejet retenu, plusieurs rubriques de la nomenclature IOTA peuvent s'appliquer.",
    { size: 9.5 });
  y = tableN(doc, y, [
    ["2.1.5.0", "Rejet d'eaux pluviales superficielles ou bassin versant", "D : 1 ≤ S < 20 ha  |  A : S ≥ 20 ha"],
    ["2.2.1.0", "Rejet en eau douce superficielle modifiant le régime",     "D : 2 000 ≤ Q < 10 000 m³/j  |  A : Q ≥ 10 000"],
    ["2.2.3.0", "Rejet superficiel de substances polluantes",                "Selon flux (DBO5, DCO, MES, HC, métaux)"],
    ["2.3.1.0", "Rejet dans les eaux souterraines",                          "Autorisation systématique (interdit hors dérogation)"]
  ], { header: ["Rubrique", "Objet", "Seuils (D / A)"], widths: [12, 45, 33] });

  // 5.5 — SANDRE
  newPage(doc, ctx);
  y = M_TOP + 4;
  y = subTitle(doc, y, "5.5  Masse d'eau souterraine concernée — Référentiel SANDRE");
  y = paragraph(doc, y,
    "L'identification de la masse d'eau souterraine impactée est nécessaire pour l'instruction du dossier au titre de la Directive-Cadre sur l'Eau (DCE) et du SDAGE applicable. La résolution est effectuée automatiquement à partir des coordonnées Lambert 93 via le référentiel SANDRE / Hub'Eau.",
    { size: 9.5 });
  y = editableBox(doc, y, 40,
    "À compléter automatiquement par requête Hub'Eau ou manuellement :\n— Code SANDRE (DCE) :\n— Libellé de la masse d'eau :\n— District hydrographique :\n— SDAGE / SAGE de référence :\n— État quantitatif / qualitatif (dernier état DCE)");

  // 5.6 — Régime cumulé (nouvelle page pour éviter chevauchement)
  newPage(doc, ctx);
  y = M_TOP + 4;
  y = subTitle(doc, y, "5.6  Régime cumulé et délais d'instruction");
  y = paragraph(doc, y,
    "La nomenclature IOTA étant cumulative, le projet relève du régime le plus contraignant parmi les rubriques applicables. Les seuils de bascule sont rappelés ci-dessous.",
    { size: 9.5 });
  // Régime calculé par rubrique
  const reg112 = r.V_an >= 200000 ? "AUTORISATION" : (r.V_an >= 10000 ? "DÉCLARATION" : "Hors nomenclature");
  y = tableN(doc, y, [
    ["1.1.1.0 — Forage / ouvrage",    "Sans seuil (ouvrage non domestique)",                          "DÉCLARATION"],
    ["1.1.2.0 — Prélèvement (V annuel)", "≥ 200 000 m³/an : Autorisation  |  ≥ 10 000 et < 200 000 : Déclaration", reg112],
    ["1.3.1.0 — ZRE",                 "≥ 8 m³/h : Autorisation  |  < 8 m³/h : Déclaration",            r.zre_regime]
  ], { header: ["Rubrique", "Seuil de bascule", "Régime calculé"], widths: [22, 48, 20] });

  // Commentaire régime retenu — détaillé par cas (ZRE, volume, hors nomenclature)
  const sValid = r.s != null && r.s > 0;
  const zreTrigger = r.zre_applicable === true && r.Q_theis_corr >= 8;
  let regimeText, regimeKind;
  if (!sValid) {
    regimeText = "→ RÉGIME RETENU : HORS NOMENCLATURE — Le fond de fouille est situé au-dessus du niveau d'eau, aucun pompage gravitaire n'est requis. La rubrique 1.1.1.0 ne s'applique qu'en cas de création d'ouvrage temporaire d'épuisement de chantier en cas de remontée piézométrique saisonnière avérée.";
    regimeKind = "info";
  } else if (zreTrigger && r.V_an < 200000) {
    regimeText = `→ RÉGIME RETENU : AUTORISATION (ZRE) — La commune ${ctx.commune} est classée en Zone de Répartition des Eaux et le débit projeté Q = ${fmtN(r.Q_theis_corr, 2)} m³/h dépasse le seuil de 8 m³/h. La rubrique 1.3.1.0 emporte la classification au régime d'autorisation (article R.214-1, plus contraignant que la 1.1.2.0). Volume annuel : ${fmtInt(r.V_an)} m³/an. La création d'ouvrage (1.1.1.0) reste à déclarer indépendamment du volume.`;
    regimeKind = "danger";
  } else if (zreTrigger) {
    regimeText = `→ RÉGIME RETENU : AUTORISATION — Cumul des rubriques 1.1.2.0 (V = ${fmtInt(r.V_an)} m³/an ≥ 200 000) et 1.3.1.0 ZRE (Q = ${fmtN(r.Q_theis_corr, 2)} m³/h ≥ 8 m³/h sur commune ${ctx.commune} classée ZRE). La création d'ouvrage (1.1.1.0) reste à déclarer indépendamment du volume.`;
    regimeKind = "danger";
  } else if (r.iota_status === "AUTORISATION") {
    regimeText = `→ RÉGIME RETENU : AUTORISATION — Volume annuel calculé ${fmtInt(r.V_an)} m³/an ≥ 200 000 m³/an, débit Q = ${fmtN(r.Q_theis_corr, 2)} m³/h. La création d'ouvrage (1.1.1.0) reste à déclarer indépendamment du volume.`;
    regimeKind = "danger";
  } else if (r.iota_status === "DÉCLARATION") {
    regimeText = `→ RÉGIME RETENU : DÉCLARATION — Volume annuel calculé ${fmtInt(r.V_an)} m³/an (entre 10 000 et 200 000 m³/an), débit Q = ${fmtN(r.Q_theis_corr, 2)} m³/h. La création d'ouvrage (1.1.1.0) est également soumise à déclaration.`;
    regimeKind = "warn";
  } else {
    regimeText = `→ RÉGIME RETENU : HORS NOMENCLATURE — Volume annuel calculé ${fmtInt(r.V_an)} m³/an < 10 000 m³/an et débit Q = ${fmtN(r.Q_theis_corr, 2)} m³/h < 8 m³/h.`;
    regimeKind = "info";
  }
  y = calloutBox(doc, y, regimeText, regimeKind);
}

// ═══════════════════════════════════════════════════════════════════════════
//          SECTION 6 — Sensibilité environnementale (cadres éditables)
// ═══════════════════════════════════════════════════════════════════════════

function buildSection6(doc, ctx, r) {
  let y = M_TOP + 4;
  y = sectionBanner(doc, y, "6. SENSIBILITÉ ENVIRONNEMENTALE — ZNIEFF ET NATURA 2000");
  y = paragraph(doc, y,
    "Dans le cadre de la Loi sur l'Eau (articles L.214-1 à L.214-6 du Code de l'Environnement), l'analyse des zonages environnementaux constitue un élément essentiel de l'évaluation des incidences du projet sur les milieux naturels. Conformément à l'article R.122-5 du Code de l'Environnement et aux dispositions de la Directive Habitats (92/43/CEE) et Oiseaux (79/409/CEE), l'identification des zones à statut réglementaire dans un rayon de 5 km autour du site est nécessaire.",
    { size: 9.5 });
  y += 3;
  y = paragraph(doc, y,
    `Le site est localisé sur la commune de ${r.inputs.commune || "[ à compléter ]"}, coordonnées Lambert 93 : X = ${r.inputs.x_l93 != null ? fmtInt(r.inputs.x_l93) + " m" : "[ à compléter ]"}, Y = ${r.inputs.y_l93 != null ? fmtInt(r.inputs.y_l93) + " m" : "[ à compléter ]"}. La prospection doit être menée à partir des bases de données officielles : INPN/PatriNat (MNHN), AgriMap (DREAL), DOCOB officiels, services de l'État.`,
    { size: 9.5 });
  y += 3;

  y = subTitle(doc, y, "6.1  ZNIEFF de Type I (rayon 5 km)");
  y = paragraph(doc, y,
    "Les ZNIEFF de Type I correspondent aux secteurs de plus grande valeur écologique, identifiés sur la présence d'espèces et d'habitats rares, remarquables ou protégés. À identifier sur INPN.",
    { size: 9, color: GREY });
  y = editableBox(doc, y, 30,
    "Pour chaque ZNIEFF de Type I dans le rayon de 5 km — nom, code INPN, surface (ha), distance au site, habitats remarquables, espèces déterminantes :");

  y = subTitle(doc, y, "6.2  ZNIEFF de Type II (proximité)");
  y = paragraph(doc, y,
    "Les ZNIEFF de Type II désignent de grands ensembles naturels riches et peu modifiés, offrant des potentialités biologiques importantes.",
    { size: 9, color: GREY });
  y = editableBox(doc, y, 25, "Identification des ZNIEFF de Type II à proximité — nom, surface, distance, habitats remarquables :");

  newPage(doc, ctx);
  y = M_TOP + 4;
  y = subTitle(doc, y, "6.3  Zone Natura 2000 (ZPS / ZSC)");
  y = paragraph(doc, y,
    "Les zones Natura 2000 incluent les Zones de Protection Spéciale (ZPS, Directive Oiseaux 79/409/CEE) et les Zones Spéciales de Conservation (ZSC, Directive Habitats 92/43/CEE). Tout plan ou projet susceptible d'affecter significativement un site Natura 2000 doit faire l'objet d'une évaluation des incidences (art. L.414-4 du Code de l'Environnement).",
    { size: 9.5 });
  y = editableBox(doc, y, 50,
    "Pour chaque site Natura 2000 dans le rayon de 5 km — Nom, Code européen (FRxxxxxxx), Type (ZPS/ZSC), Surface (ha), Désignation (arrêté), Rapport au site (sur la commune / commune voisine / hors périmètre), Habitats représentés, Espèces Annexe I :");

  y = subTitle(doc, y, "6.4  Évaluation des incidences Natura 2000");
  y = paragraph(doc, y,
    "Conformément à l'article L.414-4 du Code de l'Environnement (transposition Directive Habitats), tout plan ou projet susceptible d'affecter de manière significative un site Natura 2000 doit faire l'objet d'une évaluation des incidences. L'évaluation s'appuie sur les caractéristiques du projet et les enjeux des sites identifiés.",
    { size: 9.5 });
  y = editableBox(doc, y, 60,
    "Évaluation des incidences (à rédiger après identification des sites) :\n— Nature du projet :\n— Volume annuel prélevé :\n— Impact sur la ZPS (habitats, espèces d'oiseaux) :\n— Impact sur la ZSC (habitats, espèces) :\n— Enjeux ornithologiques communs (Annexe I) :\n— Conclusion (significatif / non significatif) :");

  newPage(doc, ctx);
  y = M_TOP + 4;
  y = subTitle(doc, y, "Tableau récapitulatif des zonages environnementaux");
  y = tableN(doc, y, [
    ["ZNIEFF I",   "[ à compléter ]", "[ code ]", "ZNIEFF Type I",    "[ ha ]", "[ rapport ]"],
    ["ZNIEFF II",  "[ à compléter ]", "[ code ]", "ZNIEFF Type II",   "[ ha ]", "[ rapport ]"],
    ["N2000 ZPS",  "[ à compléter ]", "[ FRxxx ]", "ZPS - Dir. Oiseaux", "[ ha ]", "[ rapport ]"],
    ["N2000 ZSC",  "[ à compléter ]", "[ FRxxx ]", "ZSC - Dir. Habitats", "[ ha ]", "[ rapport ]"]
  ], { header: ["Zonage", "Nom", "Code", "Type", "Surface", "Rapport au site"], widths: [12, 22, 12, 18, 10, 18] });
  y += 3;
  paragraph(doc, y,
    "Note réglementaire : en application de l'article R.414-19 du Code de l'Environnement, les projets soumis à simple déclaration au titre de la Loi sur l'Eau et dont l'évaluation préalable conclut à l'absence d'incidence significative ne sont pas tenus de déposer un dossier d'évaluation des incidences complète. La présente analyse, jointe au dossier de déclaration, satisfait à cette obligation.",
    { size: 8, color: GREY });
}

// ═══════════════════════════════════════════════════════════════════════════
//          SECTION 7 — Préconisations techniques
// ═══════════════════════════════════════════════════════════════════════════

function buildSection7(doc, ctx, r) {
  let y = M_TOP + 4;
  y = sectionBanner(doc, y, "7. PRÉCONISATIONS TECHNIQUES");

  y = subTitle(doc, y, "7.1  Équipement de pompage");
  const qMin = r.Q_min, qMax = r.Q_max, qNom = (r.Q_base != null ? r.Q_base : r.Q_theis_corr);
  y = paragraph(doc, y,
    `Le débit de dimensionnement de la pompe est compris dans la fourchette suivante : ${qMin != null ? fmtN(qMin, 3) : "—"} m³/h à ${qMax != null ? fmtN(qMax, 3) : "—"} m³/h. Il est recommandé de choisir une pompe immergée de débit nominal de ${qNom != null ? fmtN(qNom, 3) : "—"} m³/h, avec une marge de sécurité de ±15 %. Le débit base est calculé comme le maximum entre Theis corrigé, Dupuit corrigé, le débit de cycle de la pompe et le débit-plancher déduit du volume journalier retenu (V/t_exploit) — afin de garantir la cohérence du dimensionnement avec le plancher hydraulique opérationnel.`,
    { size: 9.5 });
  y = paragraph(doc, y,
    "La pompe devra être équipée de :\n— Un clapet anti-retour en partie basse.\n— Un pressostat de contrôle de niveau (protection anti-désamorçage).\n— Un débitmètre volumétrique agréé conforme aux exigences réglementaires.\n— Un boîtier de télégestion en cas d'usage industriel ou agricole intensif.\n— Un système de régulation à vitesse variable (recommandé pour optimiser la consommation énergétique).",
    { size: 9.5 });
  y += 3;

  y = subTitle(doc, y, "7.2  Système d'exhaure et d'évacuation des eaux");
  y = paragraph(doc, y,
    `Le rabattement de nappe induit un flux journalier d'eaux d'exhaure de l'ordre de ${r.V_jour != null ? fmtInt(r.V_jour) : "—"} m³/j. La gestion de ce volume doit être formalisée dans le dossier de déclaration.`,
    { size: 9.5 });
  y = paragraph(doc, y,
    "Pré-traitement avant rejet :\n— Bassin de décantation dimensionné pour un temps de transit minimal de 24 à 48 h.\n— Déshuileur / séparateur à hydrocarbures si présence d'engins thermiques au droit du chantier.\n— Filtration complémentaire (sable, géotextile) si la teneur en MES excède les seuils de l'exutoire.\n— Contrôle des paramètres pH, conductivité, MES, hydrocarbures totaux avant rejet.\n\nModes d'évacuation envisageables (à arrêter dans le dossier) :\n— Rejet en milieu superficiel (fossé, cours d'eau) — rubrique 2.2.1.0.\n— Rejet en réseau pluvial communal sur convention écrite avec le gestionnaire — rubrique 2.1.5.0.\n— Infiltration via bassin tampon à fond perméable (sous réserve compatibilité ZRE et qualité des eaux).\n— Réinjection partielle dans la nappe — rubrique 2.3.1.0 (autorisation requise).",
    { size: 9.5 });

  newPage(doc, ctx);
  y = M_TOP + 4;
  y = subTitle(doc, y, "7.3  Suivi piézométrique");
  y = paragraph(doc, y,
    "Il est fortement recommandé de mettre en place un suivi régulier du niveau piézométrique de la nappe, notamment :\n— Mesure du niveau statique avant chaque campagne de pompage.\n— Suivi du niveau dynamique en cours de pompage (fréquence minimale : toutes les heures).\n— Mesure du niveau de remontée après arrêt du pompage.\n— Enregistrement et archivage des données sur une durée minimale de 5 ans.",
    { size: 9.5 });
  y += 3;

  y = subTitle(doc, y, "7.4  Protection et tête de puits");
  y = paragraph(doc, y,
    "La tête d'ouvrage devra être protégée contre les pollutions superficielles par :\n— Une margelle bétonnée ou une dalle périphérique étanche (rayon minimal 0,5 m).\n— Un capot verrouillé étanche aux eaux de ruissellement.\n— Un espace annulaire cimenté sur au moins 2 m (bentonite ≥ 2 m).",
    { size: 9.5 });
  y = paragraph(doc, y,
    `L'altimétrie de la tête d'ouvrage doit être supérieure au niveau des plus hautes eaux connues sur le site${r.inputs.alt_tete != null ? " (cote saisie : " + fmtN(r.inputs.alt_tete, 2) + " m NGF)" : ""}.`,
    { size: 9.5 });
}

// ═══════════════════════════════════════════════════════════════════════════
//          SECTION 8 — Conclusion
// ═══════════════════════════════════════════════════════════════════════════

function buildSection8(doc, ctx, r) {
  let y = M_TOP + 4;
  y = sectionBanner(doc, y, "8. CONCLUSION — SYNTHÈSE");
  const sValid = r.s != null && r.s > 0;
  y = paragraph(doc, y,
    `Le présent dossier établit les paramètres de fonctionnement du projet de rabattement de nappe situé sur la commune de ${r.inputs.commune || "[ à compléter ]"}${r.inputs.dept ? " (département " + r.inputs.dept + ")" : ""}. Les calculs réalisés selon les méthodes de Theis (régime transitoire) et de Dupuit-Thiem (régime permanent), sur la base des paramètres hydrogéologiques du substrat « ${r.inputs.substrat || "—"} », montrent que le captage est compatible avec les ressources en eau disponibles dans les conditions hydrauliques définies.`,
    { size: 10 });
  y += 3;

  y = paragraph(doc, y,
    sValid
      ? `Le volume annuel prévisionnel de ${fmtInt(r.V_an)} m³/an positionne le projet en régime ${r.iota_status} au titre de la nomenclature IOTA (article R.214-1 du Code de l'environnement).`
      : "Le rabattement requis est nul ou négatif : le fond de fouille est situé au-dessus du niveau d'eau, aucun pompage gravitaire n'est physiquement requis. Le projet ne sollicite donc pas la ressource en eau souterraine et n'active aucune rubrique de la nomenclature IOTA liée au prélèvement.",
    { size: 10, bold: true });
  y += 3;

  y = subTitle(doc, y, "Tableau de synthèse");
  y = table2Col(doc, y, [
    ["Substrat géologique",                  r.inputs.substrat || "—"],
    ["Transmissivité calculée T",            r.T != null ? `${fmtExp(r.T)} m²/s` : "—"],
    ["Conductivité hydraulique K",           r.geo && r.geo.K != null ? `${fmtExp(r.geo.K)} m/s` : "—"],
    ["Coefficient d'emmagasinement S",       r.S != null ? fmtExp(r.S) : "—"],
    ["Rabattement visé s",                   r.s != null ? `${fmtN(r.s, 2)} m` : "—"],
    ["Débit Theis (transitoire) corrigé",    r.Q_theis_corr != null ? `${fmtN(r.Q_theis_corr, 3)} m³/h` : "—"],
    ["Débit Dupuit-Thiem (permanent) corrigé", r.Q_dupuit_corr != null ? `${fmtN(r.Q_dupuit_corr, 3)} m³/h` : "—"],
    ["Débit base recommandé",                r.Q_base != null ? `${fmtN(r.Q_base, 3)} m³/h` : "—"],
    ["Fourchette recommandée (±15 %)",       (r.Q_min != null && r.Q_max != null) ? `${fmtN(r.Q_min, 3)} à ${fmtN(r.Q_max, 3)} m³/h` : "—"],
    ["Volume journalier",                    r.V_jour != null ? `${fmtInt(r.V_jour)} m³/j` : "—"],
    ["Volume annuel estimé",                 r.V_an != null ? `${fmtInt(r.V_an)} m³/an` : "—"],
    ["Statut IOTA retenu",                   r.iota_status]
  ], { header: ["Paramètre", "Valeur"] });

  // Bloc Visa
  newPage(doc, ctx);
  y = M_TOP + 4;
  y = subTitle(doc, y, "Établi par et visa");
  const w = pageW(doc);
  const fullW = w - M_LEFT - M_RIGHT;
  const halfW = (fullW - 4) / 2;
  const boxH = 70;
  // Gauche : Établi par
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...BLUE);
  doc.setLineWidth(0.4);
  doc.rect(M_LEFT, y, halfW, boxH);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BLUE_D);
  doc.text("Établi par :", M_LEFT + 4, y + 7);
  doc.setTextColor(...BLACK);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  const estab = [
    "SARL G.M.E.P",
    "9 rue de la Marne",
    "79400 Saint-Maixent-l'École",
    "Tél : 05 49 16 53 82 / 06 97 73 72 33",
    "gmep.france@gmail.com",
    "SIRET 75309762500010",
    "",
    `Le ${ctx.date}`
  ];
  estab.forEach((line, i) => doc.text(safeText(line), M_LEFT + 4, y + 16 + i * 5.5));

  // Droite : Visa
  doc.rect(M_LEFT + halfW + 4, y, halfW, boxH);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BLUE_D);
  doc.text("Visa :", M_LEFT + halfW + 8, y + 7);
  doc.setTextColor(...BLACK);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(...GREY);
  doc.text("[ Signature et cachet ]", M_LEFT + halfW + 4 + halfW / 2, y + boxH / 2, { align: "center" });
  doc.setTextColor(...BLACK);
}

// ═══════════════════════════════════════════════════════════════════════════
//          LEXIQUE
// ═══════════════════════════════════════════════════════════════════════════

function buildLexique(doc, ctx) {
  let y = M_TOP + 4;
  y = sectionBanner(doc, y, "LEXIQUE DES ABRÉVIATIONS");
  y = paragraph(doc, y, "Liste des abréviations, acronymes et symboles utilisés dans le présent dossier, classés par thématique.", { size: 9, color: GREY });
  y += 3;

  y = subTitle(doc, y, "Réglementation — Loi sur l'Eau");
  y = tableN(doc, y, [
    ["IOTA",   "Installations, Ouvrages, Travaux et Activités (R.214-1 CE)"],
    ["D",      "Déclaration au titre de la Loi sur l'Eau"],
    ["A",      "Autorisation environnementale (R.181-13 CE)"],
    ["ZRE",    "Zone de Répartition des Eaux (R.211-71 CE)"],
    ["ICPE",   "Installation Classée pour la Protection de l'Environnement"],
    ["DDT(M)", "Direction Départementale des Territoires (et de la Mer)"],
    ["DREAL",  "Direction Régionale de l'Environnement, de l'Aménagement et du Logement"],
    ["AELB",   "Agence de l'Eau Loire-Bretagne"],
    ["SDAGE",  "Schéma Directeur d'Aménagement et de Gestion des Eaux"],
    ["SAGE",   "Schéma d'Aménagement et de Gestion des Eaux"],
    ["DCE",    "Directive Cadre sur l'Eau (2000/60/CE)"],
    ["AEP",    "Alimentation en Eau Potable"]
  ], { header: ["Abréviation", "Signification"], widths: [18, 82] });

  newPage(doc, ctx);
  y = M_TOP + 4;
  y = subTitle(doc, y, "Hydrogéologie — Calculs de rabattement");
  y = tableN(doc, y, [
    ["NS",  "Niveau Statique de la nappe (cote du toit de la nappe au repos)"],
    ["ND",  "Niveau Dynamique de la nappe (cote en cours de pompage)"],
    ["TN",  "Terrain Naturel — cote de référence à la tête de l'ouvrage"],
    ["NGF", "Nivellement Général de la France — référence altimétrique nationale"],
    ["s",   "Rabattement de nappe (m) = NS - ND"],
    ["R",   "Rayon d'influence du pompage (m)"],
    ["Q",   "Débit de pompage (m³/h ou m³/s)"],
    ["K",   "Conductivité hydraulique ou perméabilité de Darcy (m/s)"],
    ["T",   "Transmissivité de l'aquifère (m²/s) — T = K × épaisseur"],
    ["S",   "Coefficient d'emmagasinement (sans unité)"],
    ["ne",  "Porosité efficace ou drainable (%)"],
    ["u",   "Variable adimensionnelle de Theis : u = r².S / (4.T.t)"],
    ["W(u)", "Fonction de puits de Theis (well function)"]
  ], { header: ["Abréviation", "Signification"], widths: [18, 82] });

  y += 4;
  y = subTitle(doc, y, "Bases de données — géoréférentiels");
  y = tableN(doc, y, [
    ["BSS",     "Banque du Sous-Sol (BRGM — infoterre.brgm.fr)"],
    ["BRGM",    "Bureau de Recherches Géologiques et Minières"],
    ["BDLISA",  "Base de Données des Limites des Systèmes Aquifères (BRGM)"],
    ["SANDRE",  "Service d'Administration Nationale des Données et Référentiels sur l'Eau"],
    ["IGN",     "Institut National de l'Information Géographique et Forestière"],
    ["INSEE",   "Institut National de la Statistique et des Études Économiques"],
    ["Hub'Eau", "Plateforme nationale d'accès aux données de l'eau (api.hubeau.eaufrance.fr)"]
  ], { header: ["Abréviation", "Signification"], widths: [18, 82] });

  newPage(doc, ctx);
  y = M_TOP + 4;
  y = subTitle(doc, y, "Coordonnées géoréférencées");
  y = tableN(doc, y, [
    ["L93",   "Lambert 93 (EPSG:2154) — système de projection légal français"],
    ["WGS84", "World Geodetic System 1984 (EPSG:4326) — latitude/longitude internationale"],
    ["EPSG",  "European Petroleum Survey Group (codes officiels des systèmes géodésiques)"]
  ], { header: ["Abréviation", "Signification"], widths: [18, 82] });

  y += 4;
  y = subTitle(doc, y, "Milieux et habitats naturels");
  y = tableN(doc, y, [
    ["ZNIEFF",   "Zone Naturelle d'Intérêt Écologique, Faunistique et Floristique"],
    ["Natura 2000", "Réseau européen de sites protégés (Directives Habitats et Oiseaux)"],
    ["ZSC",      "Zone Spéciale de Conservation (Natura 2000 — Directive Habitats)"],
    ["ZPS",      "Zone de Protection Spéciale (Natura 2000 — Directive Oiseaux)"]
  ], { header: ["Abréviation", "Signification"], widths: [18, 82] });

  y += 4;
  y = subTitle(doc, y, "Paramètres physico-chimiques (rejets)");
  y = tableN(doc, y, [
    ["MES",  "Matières En Suspension"],
    ["DBO5", "Demande Biochimique en Oxygène sur 5 jours"],
    ["DCO",  "Demande Chimique en Oxygène"],
    ["pH",   "Potentiel hydrogène (acidité / basicité)"]
  ], { header: ["Abréviation", "Signification"], widths: [18, 82] });
}

// ═══════════════════════════════════════════════════════════════════════════
//                                ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════════

async function generate(r) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // Monkey-patch doc.text pour sécuriser tous les textes (WinAnsi)
  const _origText = doc.text.bind(doc);
  doc.text = function(text, x, y, opts) {
    if (Array.isArray(text)) text = text.map(safeText);
    else text = safeText(text);
    return _origText(text, x, y, opts);
  };
  const _origSplit = doc.splitTextToSize.bind(doc);
  doc.splitTextToSize = function(text, width, opts) {
    return _origSplit(safeText(text), width, opts);
  };

  const date = new Date().toLocaleDateString("fr-FR");

  // Libellé dynamique du régime IOTA pour la garde + tous les en-têtes
  let regimeLibelle, regimeUpper;
  if (r.iota_status === "AUTORISATION") {
    regimeLibelle = "Dossier de demande d'autorisation IOTA";
    regimeUpper   = "DOSSIER DE DEMANDE D'AUTORISATION IOTA";
  } else if (r.iota_status === "DÉCLARATION") {
    regimeLibelle = "Dossier de déclaration IOTA";
    regimeUpper   = "DOSSIER DE DÉCLARATION IOTA";
  } else {
    regimeLibelle = "Hors nomenclature IOTA";
    regimeUpper   = "HORS NOMENCLATURE IOTA";
  }

  const ctx = {
    ref: genRef(),
    commune: r.inputs.commune || "—",
    mo: r.inputs.mo || "—",
    date: date,
    regimeLibelle,
    regimeUpper,
    pageNum: 1  // page 1 = couverture, sans header/footer
  };

  // ──── PAGE 1 — Couverture
  buildCover(doc, ctx, r);

  // ──── PAGE 2 — Sommaire
  newPage(doc, ctx);
  buildToc(doc, ctx);

  // ──── PAGE 3 — Section 1
  newPage(doc, ctx);
  buildSection1(doc, ctx, r);

  // ──── PAGE 4 — Section 2.1
  newPage(doc, ctx);
  buildSection2_1(doc, ctx, r);

  // ──── PAGE 5 — Section 2.2
  newPage(doc, ctx);
  buildSection2_2(doc, ctx, r);

  // ──── PAGES 6-8 — Schémas
  newPage(doc, ctx);
  buildSchemas(doc, ctx, r);
  // (les 2 autres pages internes sont créées par newPage à l'intérieur de buildSchemas)

  // ──── PAGE 9 — Localisation
  newPage(doc, ctx);
  await buildLocation(doc, ctx, r);

  // ──── PAGES 10-12 — Méthodes
  newPage(doc, ctx);
  buildSection3(doc, ctx, r);

  // ──── PAGES 13-14 — Résultats
  newPage(doc, ctx);
  buildSection4(doc, ctx, r);

  // ──── PAGES 15-19 — Vérification IOTA
  newPage(doc, ctx);
  buildSection5(doc, ctx, r);

  // ──── PAGES 20-22 — Environnement
  newPage(doc, ctx);
  buildSection6(doc, ctx, r);

  // ──── PAGES 23 — Préconisations
  newPage(doc, ctx);
  buildSection7(doc, ctx, r);

  // ──── PAGES 24-25 — Conclusion
  newPage(doc, ctx);
  buildSection8(doc, ctx, r);

  // ──── PAGES 26-28 — Lexique
  newPage(doc, ctx);
  buildLexique(doc, ctx);

  // Sauvegarde
  const safeName = (r.inputs.projet || "rabattement").replace(/[^a-zA-Z0-9\-_]/g, "_").substring(0, 40);
  doc.save(`GMEP_Dossier_Rabattement_${ctx.ref}_${safeName}.pdf`);
}

window.GMEP_PDF = { generate };
