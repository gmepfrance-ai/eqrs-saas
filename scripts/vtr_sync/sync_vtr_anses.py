#!/usr/bin/env python3
"""Synchronisation automatique des VTR de l'ANSES pour les logiciels EQRS GMEP.

Étapes :
  1. lit la page « Liste des valeurs toxicologiques de référence » de l'ANSES (VTR construites par l'ANSES,
     tableau mis à jour en continu) et la base Excel des VTR construites et choisies par l'ANSES ;
  2. retient les VTR chroniques, population générale, inhalation et voie orale ;
  3. rattache chaque ligne aux substances des logiciels (n° CAS, puis nom : la base contient des CAS erronés) ;
  4. convertit les unités dans celles des logiciels :
       à seuil inhalation mg/m³, à seuil orale mg/kg/j, ERU inhalation (µg/m³)-1, ERU orale (mg/kg/j)-1 ;
  5. applique la hiérarchie de la note DGS/DGPR du 31/10/2014 parmi les VTR de la base :
       VTR construites par l'ANSES (ou l'Afssa) d'abord, puis VTR sélectionnées par l'ANSES ;
       à valeur égale de priorité, la plus récente ;
  6. contrôle chaque valeur (unité connue, nombre lisible, variation d'un facteur > 10 par rapport à la
     version précédente) ; une valeur douteuse n'est pas appliquée, elle est signalée ;
  7. écrit vtr/vtr-anses.json (lu par les logiciels au démarrage) et un compte rendu des changements.

Usage : python3 sync_vtr_anses.py [--xlsx fichier.xlsx] [--sortie vtr/vtr-anses.json] [--rapport rapport.md]
Code retour : 0 = aucun changement, 10 = base mise à jour, 1 = erreur.
"""
import argparse, datetime, hashlib, io, json, os, re, sys, unicodedata, urllib.request

ICI = os.path.dirname(os.path.abspath(__file__))
RACINE = os.path.abspath(os.path.join(ICI, '..', '..'))
PAGE_ANSES = 'https://www.anses.fr/fr/content/liste-des-valeurs-toxicologiques-de-reference-vtr'
XLSX_DEFAUT = 'https://www.anses.fr/sites/default/files/BDD-VTR-Anses-juin2025.xlsx'
UA = {'User-Agent': 'GMEP-EQRS-VTR-sync/1.0 (+https://www.gmep-france.eu)'}
FACTEUR_ALERTE = 10.0


def norm(t):
    t = unicodedata.normalize('NFKD', str(t or '')).encode('ascii', 'ignore').decode().lower()
    t = t.replace('’', "'").replace('\n', ' ')
    return re.sub(r'\s+', ' ', t).strip()


def nom_court(t):
    t = norm(t)
    t = re.sub(r'\([^)]*\)', ' ', t)
    t = re.sub(r'\bet (ses )?composes\b', ' ', t)
    return re.sub(r'\s+', ' ', t).strip(' ,;-')


def lire_nombre(v):
    """Lit les formats de la base : 0.0034 ; 1,5 ; 7,8.10-4 ; 3.10-4 ; 1e-06. Renvoie None si illisible."""
    if v is None:
        return None
    if isinstance(v, (int, float)):
        return float(v)
    s = str(v).strip().replace('\u00a0', '').replace(' ', '')
    if not s or any(c in s for c in '<>≤≥~') or s.lower().startswith('absence'):
        return None
    m = re.fullmatch(r'([0-9]+(?:[.,][0-9]+)?)[.,x×]10(?:\^)?([-−]?[0-9]+)', s)
    if m:
        return float(m.group(1).replace(',', '.')) * 10 ** int(m.group(2).replace('−', '-'))
    try:
        return float(s.replace(',', '.'))
    except ValueError:
        return None


def norm_unite(u):
    u = str(u or '').replace('µ', 'u').replace('μ', 'u').replace('³', '3').replace('−', '-')
    return norm(u).replace(' ', '')


# conversions vers les unités des logiciels
def convertir(valeur, unite, voie, typ):
    u = norm_unite(unite)
    if typ == 'seuil' and voie == 'inhal':
        f = {'mg/m3': 1, 'ug/m3': 1e-3, 'ng/m3': 1e-6}.get(u)
        return (valeur * f, 'mg/m3') if f else (None, None)
    if typ == 'seuil' and voie == 'orale':
        u2 = u.replace('pc', '').replace('cn-', '').replace('equivalentbore', '')
        f = {'mg/kg/j': 1, 'ug/kg/j': 1e-3, 'ng/kg/j': 1e-6,
             'mg/kg/sem': 1 / 7, 'ug/kg/sem': 1e-3 / 7, 'ng/kg/sem': 1e-6 / 7}.get(u2)
        return (valeur * f, 'mg/kg/j') if f else (None, None)
    if typ == 'sansseuil' and voie == 'inhal':
        f = {'(ug/m3)-1': 1, '(mg/m3)-1': 1e-3, '(ng/m3)-1': 1e3}.get(u)
        return (valeur * f, '(µg/m3)-1') if f else (None, None)
    if typ == 'sansseuil' and voie == 'orale':
        u2 = u.replace('pc', '')
        f = {'(mg/kg/j)-1': 1, '(ug/kg/j)-1': 1e3, '(ng/kg/j)-1': 1e6}.get(u2)
        return (valeur * f, '(mg/kg/j)-1') if f else (None, None)
    return (None, None)


MOIS = ['janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre']


def lire_page(html_txt):
    """Lit le tableau des VTR construites par l'ANSES sur la page de l'ANSES. Renvoie (date, lignes)."""
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(html_txt, 'html.parser')
    txt = soup.get_text(' ', strip=True)
    m = re.search(r'Mise à jour\s*:\s*([A-Za-zéèûôÉ]+\s+\d{4})', txt)
    date_page = m.group(1) if m else None
    t = soup.find('table')
    if t is None:
        raise RuntimeError('Tableau des VTR introuvable sur la page ANSES')
    G, span = [], {}
    for ri, tr in enumerate(t.find_all('tr')):
        row, ci, k = [], 0, 0
        cells = tr.find_all(['td', 'th'])
        while k < len(cells) or (ri, ci) in span:
            if (ri, ci) in span:
                row.append(span.pop((ri, ci))); ci += 1; continue
            c = cells[k]; k += 1
            tx = re.sub(r'\s+', ' ', c.get_text(' ', strip=True))
            rs = int(c.get('rowspan', 1) or 1); cs = int(c.get('colspan', 1) or 1)
            for _ in range(cs):
                row.append(tx)
                for r in range(1, rs): span[(ri + r, ci)] = tx
                ci += 1
        G.append(row)
    out = []
    for r in G:
        if len(r) < 4 or not re.fullmatch(r'\d{4}', r[1].strip()):
            continue
        nom_brut, annee, typ, val = r[0], r[1].strip(), norm(r[2]), r[3]
        voie = 'Inhalation' if 'inhalation' in typ else ('Voie orale' if 'orale' in typ else '')
        if 'inhalation' in typ and 'orale' in typ:
            continue
        if 'long terme a seuil' in typ:
            t2 = 'Long terme à seuil'
        elif ('sans seuil' in typ or 'cancerogene' in typ) and 'court' not in typ and 'moyen' not in typ:
            t2 = 'Long terme sans seuil (cancérogène)'
        else:
            continue
        v, u = lire_valeur_page(val)
        if v is None:
            continue
        cas = re.findall(r'\b\d{2,7}-\d{2}-\d\b', nom_brut)
        nom = re.sub(r'\(?\s*CAS[^)]*\)?', ' ', nom_brut).strip()
        out.append({'nom': nom, 'cas': ' '.join(cas), 'org': 'Anses', 'annee': annee, 'type': t2, 'voie': voie,
                    'pop': 'Population générale', 'valeur': v, 'unite': u, 'expertise': 'Page ANSES « Liste des VTR » (%s)' % (date_page or '')})
    return date_page, out


def lire_valeur_page(val):
    """'3,4.10 -3 (mg.m -3 ) -1' ; '10 -6 (µg.m -3 ) -1' ; '9,7 µg.m -3' ; '0,003 mg.kg pc −1 .j −1'."""
    s = val.replace('−', '-').replace('\u00a0', ' ').strip()
    if norm(s).startswith(('pas de', 'absence')):
        return None, None
    m = re.match(r'^\s*()10\s*(-\s*\d+)(?![.,]\d)', s) or re.match(r'^\s*(\d+(?:[.,]\d+)?)?\s*(?:[.,x×]?\s*10\s*(-\s*\d+))?', s)
    if not m or (m.group(1) is None and m.group(2) is None):
        return None, None
    mant = float(m.group(1).replace(',', '.')) if m.group(1) else 1.0
    v = mant * (10 ** int(m.group(2).replace(' ', '')) if m.group(2) else 1)
    reste = s[m.end():].replace(' ', '').lower().replace('μ', 'µ')
    masse = 'mg' if reste.lstrip('(').startswith('mg') else ('µg' if reste.lstrip('(').startswith(('µg', 'ug')) else ('ng' if reste.lstrip('(').startswith('ng') else None))
    if masse is None:
        return None, None
    eru = ')-1' in reste
    if 'm-3' in reste:
        u = '%s/m3' % masse
    elif 'kg' in reste:
        u = '%s/kg pc/%s' % (masse, 'sem' if 'sem' in reste else 'j')
    else:
        return None, None
    return v, ('(%s)-1' % u if eru else u)


def trouver_url_xlsx():
    try:
        req = urllib.request.Request(PAGE_ANSES, headers=UA)
        html = urllib.request.urlopen(req, timeout=60).read().decode('utf-8', 'ignore')
        liens = re.findall(r'href="([^"]+BDD[^"]*VTR[^"]*\.xlsx)"', html, flags=re.I)
        if liens:
            u = liens[0]
            return u if u.startswith('http') else 'https://www.anses.fr' + u
    except Exception as e:  # le site peut être indisponible : on garde l'URL connue
        print('Page ANSES non lue :', e, file=sys.stderr)
    # le fichier n'est pas toujours lié depuis la page : essai des noms mensuels récents
    auj = datetime.date.today()
    for k in range(0, 30):
        mois = (auj.month - 1 - k) % 12; an = auj.year + ((auj.month - 1 - k) // 12)
        u = 'https://www.anses.fr/sites/default/files/BDD-VTR-Anses-%s%d.xlsx' % (MOIS[mois], an)
        try:
            req = urllib.request.Request(u, headers=UA, method='HEAD')
            if urllib.request.urlopen(req, timeout=30).status == 200:
                return u
        except Exception:
            pass
    return XLSX_DEFAUT


def telecharger(url):
    req = urllib.request.Request(url, headers=UA)
    return urllib.request.urlopen(req, timeout=120).read()


def lire_base(contenu):
    import openpyxl
    wb = openpyxl.load_workbook(io.BytesIO(contenu), read_only=True, data_only=True)
    ws = wb.worksheets[0]
    date_maj, entete, lignes = None, None, []
    for r in ws.iter_rows(values_only=True):
        cells = list(r)
        if entete is None:
            if cells and norm(cells[0]).startswith('date de mise a jour'):
                d = cells[1]
                date_maj = d.date().isoformat() if hasattr(d, 'date') else str(d)
            if cells and norm(cells[0]).startswith(('susbtance', 'substance')):
                entete = [norm(c) for c in cells]
            continue
        if not any(cells) or not cells[0]:
            continue
        lignes.append(cells)
    if entete is None:
        raise RuntimeError("Structure de la base ANSES non reconnue (ligne d'en-tête introuvable)")
    idx = {}
    for i, h in enumerate(entete):
        if h.startswith(('susbtance', 'substance')): idx['nom'] = i
        elif 'cas' in h: idx['cas'] = i
        elif 'organisme' in h: idx['org'] = i
        elif 'date' in h and 'construction' in h: idx['annee'] = i
        elif 'type' in h: idx['type'] = i
        elif 'voie' in h: idx['voie'] = i
        elif 'population' in h: idx['pop'] = i
        elif 'valeur' in h: idx['valeur'] = i
        elif 'unite' in h: idx['unite'] = i
        elif 'remarque' in h: idx['remarque'] = i
        elif 'expertise' in h: idx['expertise'] = i
    manquants = {'nom', 'cas', 'org', 'type', 'voie', 'pop', 'valeur', 'unite'} - set(idx)
    if manquants:
        raise RuntimeError('Colonnes manquantes dans la base ANSES : %s' % ', '.join(sorted(manquants)))
    g = lambda c, k: c[idx[k]] if k in idx and idx[k] < len(c) else None
    out = []
    for c in lignes:
        out.append({k: g(c, k) for k in idx})
    return date_maj, out


def classer(l):
    """Renvoie (voie, type) pour une VTR chronique population générale, sinon None."""
    if 'generale' not in norm(l['pop']):
        return None
    t, v, u = norm(l['type']), norm(l['voie']), norm(l['unite'])
    voie = 'inhal' if 'inhalation' in v else ('orale' if 'orale' in v else None)
    if voie is None or not t.startswith('long terme'):
        return None
    if ')-1' in norm_unite(l['unite']):
        return voie, 'sansseuil'
    if 'sans seuil' in t and 'et sans' not in t:
        return None  # VTR « sans seuil » exprimée en concentration : non intégrable telle quelle
    return voie, 'seuil'


def rattacher(lignes, substances, alias):
    """Associe chaque substance des logiciels aux lignes de la base (CAS, puis nom)."""
    res = {}
    for nom, cas in substances.items():
        noms = {nom_court(nom)} | {norm(a) for a in alias.get(nom, [])}
        par = re.findall(r'\(([^)]*)\)', nom)
        noms |= {norm(p) for p in par if len(p) > 2}
        trouv = []
        for l in lignes:
            cas_l = re.split(r'[\s,;/]+', str(l['cas'] or ''))
            n_l = nom_court(l['nom'])
            if (cas and cas in cas_l) or n_l in noms or norm(l['nom']) in noms:
                trouv.append(l)
        res[nom] = trouv
    return res


def priorite(l):
    org = norm(l['org'])
    construite = org.startswith('anses') or org.startswith('afssa') or org.startswith('afsset')
    try:
        annee = int(re.findall(r'(\d{4})', str(l.get('annee') or ''))[0])
    except IndexError:
        annee = 0
    return (1 if construite else 0, annee)


def libelle_source(l):
    org = str(l['org'] or '').strip()
    annee = str(l.get('annee') or '').strip()
    construite = priorite(l)[0] == 1
    return ('%s %s' % (org, annee)).strip() + ('' if construite else ', sélection ANSES')


def corriger_unite(l, voie, typ, corrections):
    for c in corrections.get('unite', []):
        cas_l = re.split(r'[\s,;/]+', str(l['cas'] or ''))
        if c['cas'] in cas_l and c['voie'] == voie and c['type'] == typ and norm_unite(l['unite']) == norm_unite(c['de']):
            return c['vers'], c['motif']
    return l['unite'], None


def construire(lignes, substances, corrections, precedent):
    rat = rattacher(lignes, substances, corrections.get('alias', {}))
    exclus = {(e['substance'], e['voie'], e['type']) for e in corrections.get('exclure', [])}
    entrees, alertes, notes = {}, [], []
    prev = (precedent or {}).get('substances', {})
    cle = {('inhal', 'seuil'): 'inhal', ('orale', 'seuil'): 'orale', ('inhal', 'sansseuil'): 'eruInhal', ('orale', 'sansseuil'): 'eruOral'}
    for nom, ls in rat.items():
        cand = {}
        for l in ls:
            k = classer(l)
            if not k or (nom,) + k in exclus:
                continue
            v = lire_nombre(l['valeur'])
            if v is None or v <= 0:
                continue
            unite, motif = corriger_unite(l, k[0], k[1], corrections)
            vc, uc = convertir(v, unite, k[0], k[1])
            if vc is None:
                alertes.append({'substance': nom, 'champ': cle[k], 'motif': "Unité non reconnue : %s" % l['unite'], 'ligne': str(l['nom'])})
                continue
            if motif:
                notes.append({'substance': nom, 'champ': cle[k], 'correction': motif})
            cand.setdefault(cle[k], []).append((priorite(l), vc, uc, l))
        for champ, lst in cand.items():
            # priorité ANSES construite, puis la plus récente ; à égalité la plus protectrice
            lst.sort(key=lambda x: (x[0], -x[1] if champ in ('inhal', 'orale') else x[1]), reverse=True)
            pr, vc, uc, l = lst[0]
            e = {'valeur': float('%.6g' % vc), 'unite': uc, 'source': libelle_source(l),
                 'organisme': str(l['org'] or '').strip(), 'annee': str(l.get('annee') or '').strip(),
                 'construite_anses': pr[0] == 1, 'expertise': str(l.get('expertise') or '').strip()[:240]}
            ancien = prev.get(nom, {}).get(champ)
            if ancien:
                r = e['valeur'] / ancien['valeur'] if ancien['valeur'] else 1
                if r > FACTEUR_ALERTE or r < 1 / FACTEUR_ALERTE:
                    alertes.append({'substance': nom, 'champ': champ,
                                    'motif': 'Variation d\'un facteur %.3g par rapport à la version précédente (%g → %g %s) : valeur non appliquée, à vérifier' % (r, ancien['valeur'], e['valeur'], uc)})
                    e = dict(ancien)
                    e['a_verifier'] = True
                else:
                    # même valeur : l'effet critique et l'organe cible validés restent valables
                    e['valide_gmep'] = bool(ancien.get('valide_gmep')) and ancien['valeur'] == e['valeur']
            else:
                e['valide_gmep'] = False
            entrees.setdefault(nom, {})[champ] = e
    return entrees, alertes, notes


def comparer(ancien, nouveau):
    ch = []
    a, n = (ancien or {}).get('substances', {}), nouveau['substances']
    for s in sorted(set(a) | set(n)):
        for c in ('inhal', 'orale', 'eruInhal', 'eruOral'):
            x, y = a.get(s, {}).get(c), n.get(s, {}).get(c)
            if x and not y:
                ch.append('- %s, %s : VTR retirée (%g %s, %s)' % (s, c, x['valeur'], x['unite'], x['source']))
            elif y and not x:
                ch.append('- %s, %s : nouvelle VTR %g %s (%s)' % (s, c, y['valeur'], y['unite'], y['source']))
            elif x and y and (x['valeur'] != y['valeur'] or x['source'] != y['source']):
                ch.append('- %s, %s : %g → %g %s (%s → %s)' % (s, c, x['valeur'], y['valeur'], y['unite'], x['source'], y['source']))
    return ch


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--xlsx')
    ap.add_argument('--sortie', default=os.path.join(RACINE, 'vtr', 'vtr-anses.json'))
    ap.add_argument('--rapport', default=os.path.join(RACINE, 'vtr', 'dernier-rapport.md'))
    ap.add_argument('--page', help='copie locale de la page ANSES (HTML)')
    ap.add_argument('--sans-page', action='store_true')
    ap.add_argument('--valider', action='store_true', help='marque toutes les valeurs comme validées par GMEP')
    a = ap.parse_args()
    substances = json.load(open(os.path.join(ICI, 'substances_outils.json'), encoding='utf-8'))
    corrections = json.load(open(os.path.join(ICI, 'corrections_gmep.json'), encoding='utf-8'))
    precedent = json.load(open(a.sortie, encoding='utf-8')) if os.path.exists(a.sortie) else None
    if a.xlsx:
        url, contenu = 'fichier local ' + os.path.basename(a.xlsx), open(a.xlsx, 'rb').read()
    else:
        url = trouver_url_xlsx(); contenu = telecharger(url)
    date_maj, lignes = lire_base(contenu)
    if len(lignes) < 100:
        raise RuntimeError('Base ANSES anormalement courte (%d lignes) : mise à jour refusée' % len(lignes))
    date_page, lignes_page, html_page = None, [], b''
    if not a.sans_page:
        if a.page:
            html_page = open(a.page, 'rb').read()
        else:
            html_page = telecharger(PAGE_ANSES)
        date_page, lignes_page = lire_page(html_page.decode('utf-8', 'ignore'))
        if len(lignes_page) < 30:
            raise RuntimeError('Tableau de la page ANSES anormalement court (%d VTR) : mise à jour refusée' % len(lignes_page))
    sha = hashlib.sha256(contenu + b'|' + json.dumps(lignes_page, sort_keys=True, default=str).encode()).hexdigest()
    lignes = lignes + lignes_page
    entrees, alertes, notes = construire(lignes, substances, corrections, precedent)
    if a.valider:
        for s in entrees.values():
            for e in s.values():
                e['valide_gmep'] = True
    nouveau = {
        'schema': 1,
        'titre': 'VTR de l\'ANSES retenues par les logiciels EQRS GMEP (hiérarchie de la note DGS/DGPR du 31/10/2014)',
        'base_anses_date': date_maj, 'base_anses_url': url if url.startswith('http') else XLSX_DEFAUT,
        'base_anses_sha256': sha, 'page_anses': PAGE_ANSES, 'page_anses_maj': date_page,
        'nb_vtr_page': len(lignes_page),
        'unites': {'inhal': 'mg/m3', 'orale': 'mg/kg/j', 'eruInhal': '(µg/m3)-1', 'eruOral': '(mg/kg/j)-1'},
        'substances': entrees, 'alertes': alertes, 'corrections_appliquees': notes,
    }
    changements = comparer(precedent, nouveau)
    identique = precedent is not None and json.dumps({k: precedent.get(k) for k in ('base_anses_sha256', 'substances', 'alertes')}, sort_keys=True) == \
        json.dumps({k: nouveau.get(k) for k in ('base_anses_sha256', 'substances', 'alertes')}, sort_keys=True)
    if identique:
        print('Base ANSES inchangée (%s, sha256 %s)' % (date_maj, sha[:12]))
        return 0
    nouveau['genere_le'] = datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).strftime('%Y-%m-%dT%H:%M:%SZ')
    os.makedirs(os.path.dirname(a.sortie), exist_ok=True)
    json.dump(nouveau, open(a.sortie, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    nb = sum(len(v) for v in entrees.values())
    rap = ['# Mise à jour automatique des VTR ANSES', '',
           '- Base Excel ANSES du %s (%s)' % (date_maj, nouveau['base_anses_url']),
           '- Page ANSES des VTR construites, mise à jour : %s (%d VTR lues)' % (date_page or 'non lue', len(lignes_page)),
           '- %d VTR retenues pour %d substances des logiciels' % (nb, len(entrees)), '',
           '## Changements', ''] + (changements or ['- aucun changement de valeur']) + ['', '## Valeurs à vérifier', ''] + \
          (['- %s, %s : %s' % (x['substance'], x['champ'], x['motif']) for x in alertes] or ['- aucune']) + \
          ['', '## Corrections GMEP appliquées', ''] + (['- %s, %s : %s' % (x['substance'], x['champ'], x['correction']) for x in notes] or ['- aucune']) + \
          ['', 'Les organes cibles des VTR nouvelles ou modifiées sont signalés « à vérifier » dans les logiciels tant qu\'ils n\'ont pas été validés par GMEP.']
    open(a.rapport, 'w', encoding='utf-8').write('\n'.join(rap) + '\n')
    print('\n'.join(rap))
    return 10


if __name__ == '__main__':
    try:
        sys.exit(main())
    except Exception as e:
        print('ERREUR :', e, file=sys.stderr)
        sys.exit(1)
