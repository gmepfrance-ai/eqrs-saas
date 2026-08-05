#!/usr/bin/env python3
"""
Transforme une copie de marketing-site/ en marketing-site-admin/ :
- Supprime tous les blocs de tarifs ("Tarif" + pricing-grid) et les remplace
  par un bloc "Contactez l'\u00e9diteur pour un devis".
- Remplace tous les CTA d'inscription/essai standard (app.gmep-france.eu/#/register)
  par un lien vers /essai-administration.html (formulaire code + compte).
- Ajoute une bannière "Version pr\u00e9sent\u00e9e aux administrations" + meta noindex
  sur toutes les pages HTML.
- Force robots.txt à interdire l'indexation (site priv\u00e9, non destin\u00e9 au SEO public).

Usage: python3 scripts/build-marketing-admin.py
Doit être exécuté depuis la racine du repo eqrs-saas, avec marketing-site-admin/
déjà créé comme copie de marketing-site/.
"""
import re
import os

ROOT = os.path.join(os.path.dirname(__file__), "..", "marketing-site-admin")
ROOT = os.path.abspath(ROOT)

PRICING_BLOCK_RE = re.compile(
    r'<section class="bg-soft">(?:(?!</section>).)*?section-eyebrow">Tarif</span>(?:(?!</section>).)*?</section>',
    re.DOTALL,
)

CONTACT_PRICING_BLOCK = '''<section class="bg-soft">
  <div class="container">
    <div class="section-head">
      <span class="section-eyebrow">Tarification</span>
      <h2>Devis sur demande auprès de l'éditeur</h2>
    </div>
    <div style="max-width:640px;margin:0 auto;text-align:center;">
      <p style="font-size:1.05rem;line-height:1.6;">Cette version d'information, présentée aux services de l'État (DREAL, DRIEAT, ARS, DDT/DDTM), ne diffuse pas de tarif public. Pour toute demande de devis ou d'abonnement, adressez-vous directement à l'éditeur du logiciel :</p>
      <p style="margin:20px 0;"><a href="mailto:gmep.france@gmail.com" class="btn btn-primary">gmep.france@gmail.com</a></p>
      <p style="font-size:0.95rem;color:#64748b;">Un essai fonctionnel réel de 15 jours est disponible sur présentation d'un code d'accès unique transmis à votre organisme.</p>
      <div class="text-center mt-6">
        <a href="/essai-administration.html" class="btn btn-ghost">J'ai reçu un code d'essai — Activer mon accès</a>
      </div>
    </div>
  </div>
</section>'''

# Liens CTA vers l'inscription/l'app à remplacer par le parcours code d'essai
REGISTER_LINK_RE = re.compile(r'https://app\.gmep-france\.eu/#/register')

NOINDEX_META = '<meta name="robots" content="noindex, nofollow">'

ADMIN_BANNER = '''<div style="background:#1a365d;color:#fff;text-align:center;padding:10px 16px;font-size:0.85rem;">
  Version d'information présentée aux services de l'État (DREAL · DRIEAT · ARS · DDT/DDTM) — sans tarif public. Essai fonctionnel réel de 15 jours sur code d'accès. Pour un devis, contactez l'éditeur : <a href="mailto:gmep.france@gmail.com" style="color:#7fd6ff;">gmep.france@gmail.com</a>
</div>'''


def process_file(path: str) -> None:
    with open(path, "r", encoding="utf-8") as f:
        html = f.read()
    original = html

    # 1. Supprimer les blocs de tarifs
    html = PRICING_BLOCK_RE.sub(CONTACT_PRICING_BLOCK, html)

    # 2. Rediriger les CTA d'inscription vers le parcours d'essai administration
    html = REGISTER_LINK_RE.sub("/essai-administration.html", html)

    # 3. Ajouter noindex si pas déjà présent
    if "noindex" not in html and "<head>" in html:
        html = html.replace("<head>", f"<head>\n  {NOINDEX_META}", 1)

    # 4. Ajouter la bannière juste après <body ...>
    if "essai-administration" not in html[:200] and re.search(r"<body[^>]*>", html) and "Version d'information présentée" not in html:
        html = re.sub(r"(<body[^>]*>)", r"\1\n" + ADMIN_BANNER, html, count=1)

    if html != original:
        with open(path, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"  modifié : {os.path.relpath(path, ROOT)}")


def main():
    count = 0
    for dirpath, _dirnames, filenames in os.walk(ROOT):
        for fn in filenames:
            if fn.endswith(".html"):
                process_file(os.path.join(dirpath, fn))
                count += 1
    print(f"Terminé. {count} fichiers HTML examinés.")

    # robots.txt : interdire toute indexation
    robots_path = os.path.join(ROOT, "robots.txt")
    with open(robots_path, "w", encoding="utf-8") as f:
        f.write("User-agent: *\nDisallow: /\n")
    print("robots.txt mis à jour (Disallow: /)")

    # Supprimer sitemap.xml (inutile, site non indexable)
    sitemap_path = os.path.join(ROOT, "sitemap.xml")
    if os.path.exists(sitemap_path):
        os.remove(sitemap_path)
        print("sitemap.xml supprimé")


if __name__ == "__main__":
    main()
