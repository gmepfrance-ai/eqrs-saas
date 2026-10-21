#!/usr/bin/env python3
"""Recopie la table vtr/vtr-anses.json dans les trois logiciels EQRS (table de secours hors connexion)
et dans le site vitrine (marketing-site/vtr/vtr-anses.json)."""
import json, os, re, shutil, sys
ICI = os.path.dirname(os.path.abspath(__file__)); RACINE = os.path.abspath(os.path.join(ICI, '..', '..'))
OUTILS = ['eqrs-tool.html', 'eqrs-v31-ecotox-tool.html', 'eqrs-v8-humain-tool.html']
GARDER = ('schema', 'unites', 'base_anses_date', 'page_anses_maj', 'genere_le', 'base_anses_sha256', 'alertes')


def compacte(d):
    c = {k: d[k] for k in GARDER if k in d}
    c['substances'] = {n: {k: {x: e[x] for x in ('valeur', 'unite', 'source', 'valide_gmep', 'a_verifier') if x in e}
                           for k, e in o.items()} for n, o in d['substances'].items()}
    return json.dumps(c, ensure_ascii=False, separators=(',', ':'))


def main():
    src = os.path.join(RACINE, 'vtr', 'vtr-anses.json')
    d = json.load(open(src, encoding='utf-8'))
    js = compacte(d).replace('</', '<\\/')
    for f in OUTILS:
        p = os.path.join(RACINE, f); s = open(p, encoding='utf-8').read()
        n = len(re.findall(r'^const VTR_ANSES_EMBARQUEE = .*;$', s, flags=re.M))
        if n != 1:
            print('ERREUR : marqueur VTR_ANSES_EMBARQUEE absent ou multiple dans', f); return 1
        s = re.sub(r'^const VTR_ANSES_EMBARQUEE = .*;$', lambda m: 'const VTR_ANSES_EMBARQUEE = ' + js + ';', s, flags=re.M)
        open(p, 'w', encoding='utf-8').write(s)
    os.makedirs(os.path.join(RACINE, 'marketing-site', 'vtr'), exist_ok=True)
    shutil.copyfile(src, os.path.join(RACINE, 'marketing-site', 'vtr', 'vtr-anses.json'))
    print('Table du %s intégrée dans %d logiciels' % (d.get('genere_le'), len(OUTILS)))
    return 0


if __name__ == '__main__':
    sys.exit(main())
