#!/usr/bin/env python3
"""
Ajoute l'application 'Modélisation Essai de Porchet' (nav + footer) sur toutes
les pages du site, et renomme le produit 'Eaux pluviales — DLE & GEP v2.1' en
'Modélisation GEP — DLE & Loi sur l'Eau' dans les menus / pieds de page.

Ne touche PAS au contenu détaillé des fiches produit elles-mêmes (hero, tarif,
sections) — cela est fait manuellement pour eaux-pluviales-dle-gep.html et
pour la nouvelle page porchet-essai-permeabilite.html.
"""
import re
import glob
import os

ROOT = "/home/user/workspace/site_repo"

NAV_RE = re.compile(
    r'<a href="([./]*)outils/eaux-pluviales-dle-gep\.html" role="menuitem">'
    r'Eaux pluviales — DLE &amp; GEP v2\.1'
    r'<span class="nav-mi-desc">Loi sur l&#39;Eau \+ module IA Porchet(?: · NOUVEAU)?</span></a>'
)
# Some files may use a literal apostrophe instead of &#39;
NAV_RE2 = re.compile(
    r'<a href="([./]*)outils/eaux-pluviales-dle-gep\.html" role="menuitem">'
    r"Eaux pluviales — DLE &amp; GEP v2\.1"
    r'<span class="nav-mi-desc">Loi sur l\'Eau \+ module IA Porchet(?: · NOUVEAU)?</span></a>'
)

FOOTER_RE = re.compile(
    r'<li><a href="([./]*)outils/eaux-pluviales-dle-gep\.html">'
    r'Eaux pluviales — DLE &amp; GEP v2\.1</a></li>'
)

changed_files = []

for path in glob.glob(os.path.join(ROOT, "**", "*.html"), recursive=True):
    with open(path, encoding="utf-8") as f:
        content = f.read()
    original = content

    def nav_repl(m):
        prefix = m.group(1)
        gep_new = (
            f'<a href="{prefix}outils/eaux-pluviales-dle-gep.html" role="menuitem">'
            f'Modélisation GEP — DLE &amp; Loi sur l&#39;Eau'
            f'<span class="nav-mi-desc">Dimensionnement EP + dossiers DLE/GEP · NOUVEAU</span></a>'
        )
        porchet_new = (
            f'\n          <a href="{prefix}outils/porchet-essai-permeabilite.html" role="menuitem">'
            f'Modélisation Essai de Porchet'
            f'<span class="nav-mi-desc">Calcul K terrain + comparaison GEP · NOUVEAU</span></a>'
        )
        return gep_new + porchet_new

    content = NAV_RE.sub(nav_repl, content)
    content = NAV_RE2.sub(nav_repl, content)

    def footer_repl(m):
        prefix = m.group(1)
        gep_new = (
            f'<li><a href="{prefix}outils/eaux-pluviales-dle-gep.html">'
            f'Modélisation GEP — DLE &amp; Loi sur l&#39;Eau</a></li>'
        )
        porchet_new = (
            f'\n          <li><a href="{prefix}outils/porchet-essai-permeabilite.html">'
            f'Modélisation Essai de Porchet</a></li>'
        )
        return gep_new + porchet_new

    content = FOOTER_RE.sub(footer_repl, content)

    if content != original:
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        changed_files.append(path)

print(f"{len(changed_files)} fichiers modifiés :")
for p in changed_files:
    print(" -", os.path.relpath(p, ROOT))
