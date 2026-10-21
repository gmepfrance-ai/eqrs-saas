#!/usr/bin/env python3
"""
Test automatique — correctif GMEP 2026-10-21b (outils EQRS V7 J&E, V9 ECOTOX, V9 Humain Tier 3).

Verrouille :
  1. la coupe multicouche sous dallage (jusqu'à 3 couches, D_eff global = L_T / Σ L_i/D_eff,i) ;
  2. l'épaisseur de transfert propre à la voie nappe (L_T nappe) ;
  3. l'ERU de l'éthylbenzène (OEHHA 2007, 2,5×10⁻⁶ (µg/m³)⁻¹, choix INERIS) ;
  4. les ADAF de l'US EPA (2005) pondérés par l'âge, appliqués aux seules substances mutagènes
     (TCE : part « rein » de l'ERU ; chlorure de vinyle : ERU doublé dès l'enfance) ;
  5. la présence du CFC-11, du 1,2,4-triméthylbenzène et du mésitylène dans la base ;
  6. l'absence de l'ancienne règle « ADAF = 3 sur toute l'enfance ».
"""
import os, re, sys
TOOL_FILES = ["eqrs-tool.html", "eqrs-v31-ecotox-tool.html", "eqrs-v8-humain-tool.html"]
CHECKS = [
    ("Couches 1 à 3 dans les paramètres", r"c1_ep: 0, c1_n: 0\.35, c1_tw: 0\.15, c2_ep: 0", True),
    ("D_eff multicouche (moyenne harmonique)", r"if \(somme > 0\) \{ m\.Deff = b\.LT / somme;", True),
    ("L_T propre à la voie nappe", r"alphaPourSubstance\(s\.name, state\.bat\.LT_nappe\)", True),
    ("Voie nappe calculée avec alphaN", r"nappe: alphaN \* H \* eau \* 1000", True),
    ("ERU éthylbenzène OEHHA", r'"Éthylbenzène": \{eruOral:0\.011,eruInhal:2\.5e-06', True),
    ("Éthylbenzène dans la liste ERI", r'const ERI_SUBSTANCES = \["Benzène", "Éthylbenzène",', True),
    ("ADAF pondérés par l'âge", r"\[\[0, 2, 10\], \[2, 16, 3\], \[16, 200, 1\]\]", True),
    ("ADAF limités aux mutagènes", r"if \(MUTAGENES\.indexOf\(name\) < 0\) return 1;", True),
    ("ADAF TCE sur la part rein", r"Math\.min\(1, 1\.0e-6 / eru\)", True),
    ("Âge de début d'exposition (enfant 0 an)", r"enfant:  \{age0:0,", True),
    ("CFC-11 dans la base", r'"CFC-11": \{M:137\.37', True),
    ("1,2,4-Triméthylbenzène dans la base", r'"1,2,4-Triméthylbenzène": \{orale:0\.01,inhal:0\.06', True),
    ("Mésitylène dans la base", r'"Mésitylène": \{M:120\.19', True),
    ("Ancienne règle ADAF = 3 sur toute l'enfance", r"const ADAF = \{ adulte: 1, enfant: 3, salarie: 1 \};", False),
]
def adaf(a0, ed):
    s = 0.0
    for lo, hi, v in ((0, 2, 10), (2, 16, 3), (16, 200, 1)):
        s += max(0.0, min(hi, a0 + ed) - max(lo, a0)) * v
    return s / ed
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
    print("\n== valeurs de référence")
    for name, got, exp in (("ADAF enfant 0-6 ans", adaf(0, 6), 32 / 6), ("ADAF adulte 18-48 ans", adaf(18, 30), 1.0),
                           ("Facteur TCE US EPA enfant 0-6 ans", (1 - 1e-6 / 4.1e-6) + (1e-6 / 4.1e-6) * adaf(0, 6), 2.0569)):
        total += 1; ok = abs(got - exp) < 1e-3
        print(("  ✓ PASS: " if ok else "  ✗ FAIL: ") + f"{name} = {got:.4f}")
        fails += 0 if ok else 1
    print(f"\n{total - fails}/{total} vérifications réussies")
    return fails
if __name__ == "__main__":
    sys.exit(1 if main() else 0)
