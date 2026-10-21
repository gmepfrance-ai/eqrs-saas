#!/usr/bin/env python3
"""Tests de la mise à jour automatique des VTR ANSES (lecture de la base, conversions, table publiée, logiciels)."""
import json, os, re, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'scripts', 'vtr_sync'))
import sync_vtr_anses as S

OK = []; KO = []
def check(nom, cond):
    (OK if cond else KO).append(nom); print(('  ✓ ' if cond else '  ✗ ') + nom)
def proche(a, b): return a is not None and b is not None and abs(a - b) <= 1e-9 + 1e-6 * abs(b)

print('Lecture des nombres et des unités de la base ANSES')
check('7,8.10-4', proche(S.lire_nombre('7,8.10-4'), 7.8e-4))
check('3.10-4', proche(S.lire_nombre('3.10-4'), 3e-4))
check('1e-06', proche(S.lire_nombre('1e-06'), 1e-6))
check('« Absence de VTR » ignorée', S.lire_nombre('Absence de VTR') is None)
check('« ≤ 5 » ignorée', S.lire_nombre('≤ 5 ') is None)
check('page : 10 -6 (µg.m -3 ) -1', S.lire_valeur_page('10 -6 (µg.m -3 ) -1') == (1e-6, '(µg/m3)-1'))
check('page : 3,4.10 -3 (mg.m -3 ) -1', proche(S.lire_valeur_page('3,4.10 -3 (mg.m -3 ) -1')[0], 3.4e-3))
check('page : 0,003 mg.kg pc −1 .j −1', S.lire_valeur_page('0,003 mg.kg pc −1 .j −1') == (0.003, 'mg/kg pc/j'))
check('µg/m3 → mg/m3', proche(S.convertir(9.7, 'µg/m3', 'inhal', 'seuil')[0], 0.0097))
check('µg/kg pc/sem → mg/kg/j', proche(S.convertir(4, 'µg/kg pc/sem', 'orale', 'seuil')[0], 4e-3 / 7))
check('(mg/m3)-1 → (µg/m3)-1', proche(S.convertir(0.0038, '(mg/m3)-1', 'inhal', 'sansseuil')[0], 3.8e-6))
check('(µg/kg pc/j)-1 → (mg/kg/j)-1', proche(S.convertir(6e-5, '(µg/kg pc/j)-1', 'orale', 'sansseuil')[0], 0.06))
check('unité inconnue refusée', S.convertir(1, 'ppm', 'inhal', 'seuil')[0] is None)

print('Table publiée vtr/vtr-anses.json')
d = json.load(open('vtr/vtr-anses.json', encoding='utf-8'))
sub = d['substances']
check('schéma 1 et unités des logiciels', d['schema'] == 1 and d['unites'] == {'inhal': 'mg/m3', 'orale': 'mg/kg/j', 'eruInhal': '(µg/m3)-1', 'eruOral': '(mg/kg/j)-1'})
check('au moins 40 VTR', sum(len(v) for v in sub.values()) >= 40)
check('TCE inhalation 3,2 mg/m³ (ANSES 2018)', proche(sub['Trichloroéthylène (TCE)']['inhal']['valeur'], 3.2))
check('TCE ERU 10⁻⁶ (µg/m³)⁻¹', proche(sub['Trichloroéthylène (TCE)']['eruInhal']['valeur'], 1e-6))
check('PCE inhalation 0,4 mg/m³', proche(sub['Tétrachloroéthylène (PCE)']['inhal']['valeur'], 0.4))
check('Benzène ERU 1,6×10⁻⁶ (ANSES 2024)', proche(sub['Benzène']['eruInhal']['valeur'], 1.6e-6))
check('Chlorure de vinyle ERU 3,8×10⁻⁶', proche(sub['Chlorure de vinyle']['eruInhal']['valeur'], 3.8e-6))
check('Chrome VI ERU oral corrigé (0,5 et non 500)', proche(sub['Chrome VI']['eruOral']['valeur'], 0.5))
check('dates des sources renseignées', bool(d.get('base_anses_date')) and 'page_anses_maj' in d and bool(d.get('genere_le')))
mk = 'marketing-site/vtr/vtr-anses.json'
check('copie publiée sur www identique', os.path.exists(mk) and json.load(open(mk, encoding='utf-8')) == d)

print('Logiciels')
for f in ['eqrs-tool.html', 'eqrs-v31-ecotox-tool.html', 'eqrs-v8-humain-tool.html']:
    s = open(f, encoding='utf-8').read()
    m = re.search(r'^const VTR_ANSES_EMBARQUEE = (.*);$', s, flags=re.M)
    emb = json.loads(m.group(1).replace('<\\/', '</')) if m else {}
    check(f + ' : table intégrée à jour', emb.get('genere_le') == d.get('genere_le') and emb.get('substances', {}).keys() == sub.keys())
    check(f + ' : chargement automatique au démarrage', 'majVTRAnsesEnLigne' in s and "'/api/vtr/anses'" in s and 'gmep_vtr_anses_cache' in s)
    check(f + ' : contrôle des unités reçues', "U.inhal !== 'mg/m3'" in s)
print()
print('%d/%d vérifications réussies' % (len(OK), len(OK) + len(KO)))
sys.exit(1 if KO else 0)
