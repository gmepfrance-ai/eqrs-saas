#!/usr/bin/env python3
"""
Test automatique — Effets cumulés par organe cible et par catégorie d'individus
(correctif GMEP 2026-10, outils EQRS V7 J&E, V9 ECOTOX, V9 Humain Tier 3).

Verrouille :
  1. le calcul du HI par organe pour les adultes, les enfants et les salariés ;
  2. la table des organes alignée sur les noms exacts de la base de substances ;
  3. le cumul des sources gaz du sol + nappe (et non le maximum) ;
  4. le coefficient d'atténuation propre à chaque substance ;
  5. la présence de la page « organes » dans l'export PDF ;
  6. la hiérarchie des VTR (ANSES en priorité, note DGS/DGPR du 31/10/2014).
"""
import os, re, sys
TOOL_FILES = ["eqrs-tool.html", "eqrs-v31-ecotox-tool.html", "eqrs-v8-humain-tool.html"]
CHECKS = [
    ("Catégories adultes / enfants / salariés", r"const RECEPTEURS_ORG = \[\['adulte','Adultes'\],\['enfant','Enfants'\],\['salarie','Salariés'\]\]", True),
    ("Boucle par catégorie dans computeMelangeOrgane", r"RECEPTEURS_ORG\.forEach\(\(\[rec, lab\]\)", True),
    ("Table organes : clé TCE exacte", r"'Trichloroéthylène \(TCE\)':\{inhal:\['DEV','IMMU'\]", True),
    ("Table organes : clé PCE exacte", r"'Tétrachloroéthylène \(PCE\)':\{inhal:\['NERV'\]", True),
    ("Fonction organesPour (voie)", r"function organesPour\(name, voie\)", True),
    ("ERI par site de cancer", r"const CANCERS_CIBLES = \{", True),
    ("Cumul des sources gaz du sol + nappe", r"const CairJE = ci\.solGaz \+ ci\.nappe;", True),
    ("Alpha propre à chaque substance", r"function alphaPourSubstance\(name\)", True),
    ("Hiérarchie VTR ANSES (note DGS 2014)", r"function appliquerHierarchieVTR\(mode\)", True),
    ("VTR ANSES TCE 3,2 mg/m³", r'"Trichloroéthylène \(TCE\)":\{"inhal":\{"valeur":3\.2,', True),
    ("ANSES par défaut", r"localStorage\.getItem\('gmep_vtr_mode'\) \|\| 'anses'", True),
    ("Page PDF organes", r"INDEX DE DANGER \(HI\) PAR ORGANE CIBLE ET PAR CATEGORIE", True),
    ("Ancien bug : maximum des sources", r"const CairJE = Math\.max\(ci\.solGaz, ci\.nappe\);", False),
    ("Ancien bug : lecture QD par substance (_ad)", r"qd_inhal_je_ad", False),
]
def main():
    fails = 0; total = 0
    base = os.path.dirname(os.path.abspath(__file__))
    for tf in TOOL_FILES:
        fp = os.path.join(base, tf)
        if not os.path.exists(fp):
            print(f"⚠ {tf} absent — ignoré"); continue
        s = open(fp, encoding="utf-8").read()
        print(f"\n== {tf}")
        for name, pat, req in CHECKS:
            total += 1
            ok = bool(re.search(pat, s)) == req
            print(("  ✓ PASS: " if ok else "  ✗ FAIL: ") + name)
            fails += 0 if ok else 1
    print(f"\n{total - fails}/{total} vérifications réussies")
    return fails
if __name__ == "__main__":
    sys.exit(1 if main() else 0)
