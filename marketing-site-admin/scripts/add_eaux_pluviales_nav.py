#!/usr/bin/env python3
"""Ajoute l'entrée menu + footer 'Eaux pluviales' en copiant le prefix exact d'un lien existant."""
import os, re

ROOT = "/home/user/workspace/gmep-site"
MENU_ANCHOR = '<div class="nav-dropdown-menu" role="menu">'

html_files = []
for dirpath, dirs, files in os.walk(ROOT):
    if "/.git" in dirpath or dirpath.endswith("/.git"):
        continue
    for f in files:
        if f.endswith(".html"):
            rel = os.path.relpath(os.path.join(dirpath, f), ROOT)
            html_files.append(rel)
html_files.sort()

menu_count = foot_count = 0
for rel in html_files:
    if rel == "outils/eaux-pluviales-dle-gep.html":
        continue
    full = os.path.join(ROOT, rel)
    with open(full, "r", encoding="utf-8") as fh:
        content = fh.read()
    original = content

    # ---- MENU ----
    idx = content.find(MENU_ANCHOR)
    if idx != -1 and "eaux-pluviales-dle-gep.html" not in content[idx:idx+3000]:
        after = content[idx:idx+3000]
        m = re.search(r'href="([^"]*?outils/[^"]+)"', after)
        if m:
            sample = m.group(1)                       # ex ../outils/eqrs-v31-05-ecotox.html
            prefix = sample.rsplit("/", 1)[0] + "/"   # ex ../outils/
            new_href = prefix + "eaux-pluviales-dle-gep.html"
            entry = (f'          <a href="{new_href}" role="menuitem">'
                     'Eaux pluviales — DLE &amp; GEP v2.1'
                     '<span class="nav-mi-desc">Loi sur l\'Eau + module IA Porchet · NOUVEAU</span></a>\n')
            end = content.index("\n", idx + len(MENU_ANCHOR))
            content = content[:end+1] + entry + content[end+1:]
            menu_count += 1

    # ---- FOOTER (bloc "Nos outils") ----
    foot = re.search(r'(<h6>Nos outils</h6>\s*<ul>)(.*?)(</ul>)', content, re.I | re.S)
    if foot and "eaux-pluviales-dle-gep.html" not in foot.group(2):
        blk = foot.group(2)
        fm = re.search(r'href="([^"]*?outils/[^"]+)"', blk)
        if fm:
            fhref = fm.group(1)
            fprefix = fhref.rsplit("/", 1)[0] + "/"
            new_fhref = fprefix + "eaux-pluviales-dle-gep.html"
            fentry = f'\n          <li><a href="{new_fhref}">Eaux pluviales — DLE &amp; GEP v2.1</a></li>'
            newblk = foot.group(1) + fentry + foot.group(2) + foot.group(3)
            content = content[:foot.start()] + newblk + content[foot.end():]
            foot_count += 1

    if content != original:
        with open(full, "w", encoding="utf-8") as fh:
            fh.write(content)

print(f"Menu: {menu_count} pages | Footer: {foot_count} pages")
