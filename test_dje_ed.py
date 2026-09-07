#!/usr/bin/env python3
"""
Test automatique — Vérification du bug DJE Ingestion/Contact (ED manquant)

Ce test verrouille la correction du bug critique où le paramètre ED
(durée d'exposition) était absent des formules DJE Ingestion et DJE Contact.

Sans ED, la DJE était sous-estimée d'un facteur 30 (adulte), 6 (enfant), 25 (salarie).
Les QD et ERI étaient donc sous-évalués → risque sanitaire sous-estimé.

Référence : US EPA Exposure Factors Handbook, formule DJE ingestion :
  DJE = C × IR × EF × ED / (BW × AT × 365)

Le test vérifie que p.ED est bien présent dans toutes les formules DJE.
"""

import re
import sys
import os

# Fichiers outil à tester
TOOL_FILES = [
    "eqrs-v31-ecotox-tool.html",
    "eqrs-v8-humain-tool.html",
]

# Patterns à vérifier (chaque formule DJE doit contenir p.ED)
DJE_PATTERNS = [
    # computeDJEIngestion — voie sol (seuil et sans seuil)
    {
        "name": "DJE Ingestion sol (seuil)",
        "pattern": r"djeSol:\s*denom\s*>\s*0\s*\?\s*Csol\s*\*\s*p\.IRs\s*\*\s*p\.EF\s*\*\s*p\.ED\s*/\s*denom",
        "required": True,
    },
    {
        "name": "DJE Ingestion eau (seuil)",
        "pattern": r"djeEau:\s*denom\s*>\s*0\s*\?\s*\(Ceau\s*/\s*1000\)\s*\*\s*p\.IRw\s*\*\s*p\.EF\s*\*\s*p\.ED\s*/\s*denom",
        "required": True,
    },
    {
        "name": "DJE Ingestion sol (sans seuil)",
        "pattern": r"djeSol_ss:\s*denom_ss\s*>\s*0\s*\?\s*Csol\s*\*\s*p\.IRs\s*\*\s*p\.EF\s*\*\s*p\.ED\s*/\s*denom_ss",
        "required": True,
    },
    {
        "name": "DJE Ingestion eau (sans seuil)",
        "pattern": r"djeEau_ss:\s*denom_ss\s*>\s*0\s*\?\s*\(Ceau\s*/\s*1000\)\s*\*\s*p\.IRw\s*\*\s*p\.EF\s*\*\s*p\.ED\s*/\s*denom_ss",
        "required": True,
    },
    # computeDJEContact — voie cutanée (seuil et sans seuil)
    {
        "name": "DJE Contact cutané (seuil)",
        "pattern": r"dje:\s*denom\s*>\s*0\s*\?\s*Csol\s*\*\s*p\.Scut\s*\*\s*p\.AF\s*\*\s*p\.ABS\s*\*\s*1e-6\s*\*\s*p\.EF\s*\*\s*p\.ED\s*/\s*denom",
        "required": True,
    },
    {
        "name": "DJE Contact cutané (sans seuil)",
        "pattern": r"dje_ss:\s*denom_ss\s*>\s*0\s*\?\s*Csol\s*\*\s*p\.Scut\s*\*\s*p\.AF\s*\*\s*p\.ABS\s*\*\s*1e-6\s*\*\s*p\.EF\s*\*\s*p\.ED\s*/\s*denom_ss",
        "required": True,
    },
]

# Patterns anti-régression : vérifier que l'ancien bug n'est pas revenu
ANTI_REGRESSION_PATTERNS = [
    {
        "name": "Ancien bug DJE sol sans ED",
        "pattern": r"djeSol:\s*denom\s*>\s*0\s*\?\s*Csol\s*\*\s*p\.IRs\s*\*\s*p\.EF\s*/\s*denom\s*:",
        "required": False,  # Ne doit PAS être présent
    },
    {
        "name": "Ancien bug DJE eau sans ED",
        "pattern": r"djeEau:\s*denom\s*>\s*0\s*\?\s*\(Ceau\s*/\s*1000\)\s*\*\s*p\.IRw\s*\*\s*p\.EF\s*/\s*denom\s*:",
        "required": False,
    },
    {
        "name": "Ancien bug DJE contact sans ED",
        "pattern": r"dje:\s*denom\s*>\s*0\s*\?\s*Csol\s*\*\s*p\.Scut\s*\*\s*p\.AF\s*\*\s*p\.ABS\s*\*\s*1e-6\s*\*\s*p\.EF\s*/\s*denom\s*:",
        "required": False,
    },
]

# Vérification des labels V9 (pas de V8/V31 dans le texte affiché)
LABEL_CHECKS = [
    {
        "name": "Title tag contient V9",
        "pattern": r"<title>EQRS V9",
        "required": True,
    },
    {
        "name": "H1 contient V9 (pas V8)",
        "pattern": r"<h1>EQRS V9",
        "required": True,
    },
    {
        "name": "Pas de 'EQRS V8' dans le texte affiché",
        "pattern": r">EQRS V8|EQRS V8 &mdash;|EQRS V8 </",
        "required": False,  # Ne doit PAS être présent
    },
    {
        "name": "Pas de 'ECOTOX V8' dans le texte affiché",
        "pattern": r"ECOTOX V8 Tier|Extension ECOTOX V8",
        "required": False,
    },
    {
        "name": "Pas de 'V31.05' dans le texte affiché",
        "pattern": r"V31\.05",
        "required": False,
    },
]


def run_tests():
    """Exécute tous les tests et retourne le nombre d'échecs."""
    failures = 0
    total = 0

    for tool_file in TOOL_FILES:
        filepath = os.path.join(os.path.dirname(__file__), "..", tool_file)
        if not os.path.exists(filepath):
            # Esser le chemin direct (déploiement Railway)
            filepath = tool_file
        if not os.path.exists(filepath):
            print(f"\n⚠ Fichier non trouvé: {tool_file} — ignoré (peut ne pas être dans ce répertoire)")
            continue

        with open(filepath, "r", encoding="latin-1") as f:
            content = f.read()

        print(f"\n{'='*60}")
        print(f"  {tool_file}")
        print(f"{'='*60}")

        # Tests DJE (ED présent)
        print(f"\n  --- Tests formules DJE (ED doit être présent) ---")
        for check in DJE_PATTERNS:
            total += 1
            found = bool(re.search(check["pattern"], content))
            if found == check["required"]:
                status = "✓ PASS" if found else "✓ PASS (absent comme attendu)"
                print(f"  {status}: {check['name']}")
            else:
                failures += 1
                if check["required"]:
                    print(f"  ✗ FAIL: {check['name']} — p.ED MANQUANT dans la formule !")
                else:
                    print(f"  ✗ FAIL: {check['name']} — pattern inattendu trouvé")

        # Tests anti-régression (ancien bug ne doit pas être revenu)
        print(f"\n  --- Tests anti-régression (ancien bug ne doit pas revenir) ---")
        for check in ANTI_REGRESSION_PATTERNS:
            total += 1
            found = bool(re.search(check["pattern"], content))
            if not found:
                print(f"  ✓ PASS: {check['name']} — ancien bug absent")
            else:
                failures += 1
                print(f"  ✗ FAIL: {check['name']} — RÉGRESSION détectée !")

        # Tests labels V9
        print(f"\n  --- Tests labels V9 ---")
        for check in LABEL_CHECKS:
            total += 1
            found = bool(re.search(check["pattern"], content))
            if found == check["required"]:
                status = "✓ PASS" if found else "✓ PASS (absent comme attendu)"
                print(f"  {status}: {check['name']}")
            else:
                failures += 1
                if check["required"]:
                    print(f"  ✗ FAIL: {check['name']} — label V9 manquant !")
                else:
                    print(f"  ✗ FAIL: {check['name']} — ancien label V8/V31 toujours présent !")

    # Résumé
    print(f"\n{'='*60}")
    print(f"  RÉSUMÉ: {total - failures}/{total} tests réussis")
    print(f"{'='*60}")

    if failures > 0:
        print(f"\n  ✗ {failures} test(s) en échec — CORRIGER avant déploiement !")
        return 1
    else:
        print(f"\n  ✓ Tous les tests réussissent — correction DJE verrouillée")
        return 0


if __name__ == "__main__":
    sys.exit(run_tests())
