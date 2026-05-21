#!/usr/bin/env python3
"""Generate CGV PDF for G.M.E.P SARL — to be served as static download."""
import os
import urllib.request
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.lib.enums import TA_JUSTIFY, TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, KeepTogether
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Download Inter font for embedding
OUT_DIR = os.path.dirname(os.path.abspath(__file__))
FONT_DIR = "/tmp/fonts"
os.makedirs(FONT_DIR, exist_ok=True)

FONT_URLS = {
    "Inter-Regular": "https://github.com/rsms/inter/raw/master/docs/font-files/Inter-Regular.ttf",
    "Inter-Bold": "https://github.com/rsms/inter/raw/master/docs/font-files/Inter-Bold.ttf",
}
for name, url in FONT_URLS.items():
    fp = os.path.join(FONT_DIR, name + ".ttf")
    if not os.path.exists(fp):
        try:
            urllib.request.urlretrieve(url, fp)
        except Exception as e:
            print(f"WARN: could not download {name}: {e}")

try:
    pdfmetrics.registerFont(TTFont("Inter", os.path.join(FONT_DIR, "Inter-Regular.ttf")))
    pdfmetrics.registerFont(TTFont("Inter-Bold", os.path.join(FONT_DIR, "Inter-Bold.ttf")))
    FONT_BODY = "Inter"
    FONT_BOLD = "Inter-Bold"
except Exception:
    FONT_BODY = "Helvetica"
    FONT_BOLD = "Helvetica-Bold"

# Output destination
OUT_PATH = os.path.join(
    os.path.dirname(OUT_DIR),
    "client", "public",
    "CGV_GMEP_2026.pdf",
)
os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)

# --- Styles
styles = getSampleStyleSheet()
TEXT = "#28251D"
MUTED = "#7A7974"
ACCENT = "#01696F"

style_title = ParagraphStyle(
    "Title", parent=styles["Title"],
    fontName=FONT_BOLD, fontSize=22, leading=28,
    textColor=TEXT, spaceAfter=8, alignment=TA_CENTER,
)
style_subtitle = ParagraphStyle(
    "Subtitle", parent=styles["Normal"],
    fontName=FONT_BODY, fontSize=10, leading=14,
    textColor=MUTED, alignment=TA_CENTER, spaceAfter=24,
)
style_h2 = ParagraphStyle(
    "H2", parent=styles["Heading2"],
    fontName=FONT_BOLD, fontSize=13, leading=18,
    textColor=ACCENT, spaceBefore=14, spaceAfter=6,
)
style_body = ParagraphStyle(
    "Body", parent=styles["BodyText"],
    fontName=FONT_BODY, fontSize=10, leading=15,
    textColor=TEXT, alignment=TA_JUSTIFY, spaceAfter=6,
)
style_li = ParagraphStyle(
    "LI", parent=style_body, leftIndent=18, bulletIndent=6,
)
style_footer = ParagraphStyle(
    "Footer", parent=styles["Normal"],
    fontName=FONT_BODY, fontSize=8, leading=11,
    textColor=MUTED, alignment=TA_CENTER,
)

# --- Document
doc = SimpleDocTemplate(
    OUT_PATH, pagesize=A4,
    leftMargin=22*mm, rightMargin=22*mm,
    topMargin=22*mm, bottomMargin=22*mm,
    title="Conditions Générales de Vente — G.M.E.P SARL",
    author="Perplexity Computer",
)

flow = []

flow.append(Paragraph("Conditions générales de vente", style_title))
flow.append(Paragraph(
    "SARL G.M.E.P — Version en vigueur janvier 2026",
    style_subtitle,
))

def h2(t): flow.append(Paragraph(t, style_h2))
def p(t): flow.append(Paragraph(t, style_body))
def li(t): flow.append(Paragraph("•&nbsp;&nbsp;" + t, style_li))

h2("1. Objet du contrat")
p("Les présentes conditions générales de vente (CGV) régissent la mise à disposition, "
  "par la SARL G.M.E.P (ci-après « l'Éditeur »), au profit du client (ci-après « l'Abonné »), "
  "de logiciels en mode SaaS (Software as a Service) : <b>EQRS Johnson &amp; Ettinger</b>, "
  "<b>Transfert Sol → Nappe → Captage</b> et <b>Rabattement de nappe</b>. "
  "La souscription à un abonnement entraîne l'acceptation pleine et entière des présentes CGV.")

h2("2. Prix et modalités de paiement")
p("Les prix sont indiqués en euros, hors taxes (HT). La TVA applicable dépend du pays "
  "de facturation de l'Abonné (cf. mentions de la page Tarifs et art. 278, 294, 259-1 du CGI).")
li("<b>EQRS Johnson &amp; Ettinger</b> — mensuel : 245 € HT/mois ; annuel : 2 499 € HT/an.")
li("<b>Transfert Sol → Nappe → Captage</b> — annuel : 850 € HT/an.")
li("<b>Rabattement de nappe</b> — annuel : 1 100 € HT/an.")
p("Le paiement s'effectue exclusivement par carte bancaire via <b>Stripe Payments Europe Ltd</b>, "
  "prestataire certifié PCI-DSS. Une facture conforme est transmise à l'Abonné par e-mail "
  "dans les 48 h ouvrées suivant le paiement.")

h2("3. Durée et résiliation")
p("L'abonnement <b>mensuel</b> est conclu pour une durée d'un mois, renouvelable par tacite "
  "reconduction sauf résiliation par l'Abonné avant l'échéance via son espace client ou par "
  "e-mail à gmep.france@gmail.com.")
p("L'abonnement <b>annuel</b> est conclu pour une durée d'un an, sans renouvellement automatique. "
  "À l'échéance, l'Abonné peut souscrire à nouveau s'il le souhaite.")
p("En cas de manquement grave de l'une des parties (impayé, usage frauduleux), l'autre partie "
  "peut résilier de plein droit après mise en demeure restée sans effet 15 jours.")

h2("4. Droit de rétractation")
p("Conformément à l'article L.221-28 du Code de la consommation, le droit de rétractation "
  "ne s'applique pas aux contrats de fourniture d'un contenu numérique non fourni sur un "
  "support matériel dont l'exécution a commencé après accord préalable exprès de l'Abonné. "
  "L'Abonné renonce expressément à son droit de rétractation en demandant l'accès immédiat "
  "au service après paiement.")
p("Pour les clients professionnels (B2B), le droit de rétractation prévu pour les "
  "consommateurs ne s'applique pas (art. L.221-3 C. consom.).")

h2("5. Accès au service")
p("L'accès est ouvert immédiatement après validation du paiement, via les identifiants créés "
  "par l'Abonné. L'Éditeur s'engage à une disponibilité raisonnable du service (cible : 99 % "
  "hors maintenances planifiées) sans pour autant garantir une disponibilité ininterrompue.")

h2("6. Essai gratuit")
p("Un essai gratuit est offert avant souscription (8 jours pour Rabattement et Transfert Sol → "
  "Nappe → Captage, 14 jours pour EQRS J&amp;E). Il donne accès à une version limitée "
  "(PDF marqués « DÉMO », fonctionnalités réduites pour EQRS J&amp;E). Aucune carte bancaire "
  "n'est requise pour activer l'essai.")

h2("7. Propriété intellectuelle")
p("Les logiciels et leurs contenus sont la propriété exclusive de la SARL G.M.E.P. "
  "L'abonnement confère un droit d'usage personnel, non exclusif et non transmissible. "
  "Toute reproduction, redistribution, ingénierie inverse ou revente est interdite et "
  "passible de poursuites au titre des articles L.335-2 et suivants du Code de la propriété "
  "intellectuelle.")

h2("8. Données personnelles")
p("L'Éditeur traite les données personnelles de l'Abonné conformément au RGPD (Règlement UE "
  "2016/679) et à la loi Informatique et Libertés modifiée. Les finalités, durées de "
  "conservation, sous-traitants et droits de l'Abonné (accès, rectification, effacement, "
  "portabilité, opposition) sont détaillés dans les <b>Mentions légales et politique de "
  "confidentialité</b> accessibles sur www.gmep-france.eu/#/mentions-legales.")

h2("9. Confidentialité des calculs")
p("Les paramètres saisis par l'Abonné (données de projet, coordonnées, valeurs de calcul) "
  "restent strictement confidentiels. Les calculs s'exécutent côté navigateur (client) ou "
  "sur un serveur dédié, sans réutilisation à des fins commerciales par l'Éditeur.")

h2("10. Limitation de responsabilité")
p("Les résultats produits par les logiciels constituent une aide à la décision. L'Abonné "
  "conserve la responsabilité pleine et entière de leur interprétation, validation et "
  "utilisation dans ses livrables professionnels et réglementaires (rapports IEM, dossiers "
  "Loi sur l'Eau, etc.).")
p("La responsabilité de l'Éditeur ne pourra être engagée pour des dommages indirects "
  "(perte de chiffre d'affaires, perte de chance, etc.) résultant d'une mauvaise "
  "interprétation ou d'un usage inadapté des résultats. En tout état de cause, la "
  "responsabilité de l'Éditeur est plafonnée au montant des sommes effectivement versées "
  "par l'Abonné au titre des 12 derniers mois.")

h2("11. Force majeure")
p("Aucune des parties ne pourra être tenue responsable d'une inexécution résultant d'un cas "
  "de force majeure au sens de l'article 1218 du Code civil (notamment : interruption "
  "généralisée d'internet, attaque cyber-criminelle massive, décision administrative "
  "imposant l'arrêt du service).")

h2("12. Médiation et résolution amiable")
p("Conformément à l'article L.612-1 du Code de la consommation, en cas de litige non résolu "
  "à l'amiable avec un consommateur, l'Abonné peut saisir gratuitement le médiateur de la "
  "consommation. L'Éditeur invite les Abonnés à formuler toute réclamation préalable à "
  "gmep.france@gmail.com.")

h2("13. Droit applicable et juridiction")
p("Les présentes CGV sont soumises au droit français. À défaut de résolution amiable, tout "
  "litige relèvera de la compétence exclusive du <b>Tribunal judiciaire de Niort</b>, "
  "nonobstant pluralité de défendeurs ou appel en garantie. Pour les Abonnés consommateurs, "
  "les règles de compétence territoriale prévues par le Code de procédure civile demeurent "
  "applicables.")

h2("14. Modifications des CGV")
p("L'Éditeur se réserve le droit de modifier les présentes CGV. Les Abonnés en cours seront "
  "informés par e-mail au moins 30 jours avant l'entrée en vigueur des modifications. "
  "Le maintien de l'abonnement après cette période vaut acceptation des nouvelles CGV.")

h2("15. Contact")
p("Pour toute question sur les présentes CGV :")
p("<b>SARL G.M.E.P</b><br/>"
  "9 rue de la Marne — 79400 Saint-Maixent-l'École, France<br/>"
  "E-mail : <a href='mailto:gmep.france@gmail.com' color='#01696F'>gmep.france@gmail.com</a><br/>"
  "Site : <a href='https://www.gmep-france.eu' color='#01696F'>www.gmep-france.eu</a>")

flow.append(Spacer(1, 20))
flow.append(Paragraph(
    "— Document généré le 21 mai 2026 — © SARL G.M.E.P — Tous droits réservés —",
    style_footer,
))

def _on_page(canvas, doc):
    canvas.saveState()
    canvas.setFont(FONT_BODY, 8)
    canvas.setFillColor("#7A7974")
    canvas.drawString(22*mm, 12*mm, "CGV — SARL G.M.E.P — Janvier 2026")
    canvas.drawRightString(A4[0]-22*mm, 12*mm, f"Page {doc.page}")
    canvas.restoreState()

doc.build(flow, onFirstPage=_on_page, onLaterPages=_on_page)
print(f"OK -> {OUT_PATH}")
print(f"Size: {os.path.getsize(OUT_PATH)} bytes")
