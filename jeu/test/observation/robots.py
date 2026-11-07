"""Robots des jeux d'observation : ils jouent avec la vraie souris (événements pointer)."""
import time, random, math
from commun import etat

def fini(page):
    return page.query_selector('.mj-resultat') is not None

def clic(page, x, y):
    page.mouse.click(x, y)

def glisser(page, x0, y0, x1, y1, pas=10):
    page.mouse.move(x0, y0)
    page.mouse.down()
    for k in range(1, pas + 1):
        page.mouse.move(x0 + (x1 - x0) * k / pas, y0 + (y1 - y0) * k / pas)
        page.wait_for_timeout(16)
    page.mouse.up()

def pas_differences(page, e, mode):
    if mode == 'parfait':
        reste = [d for d in e['diffs'] if not d['ok']]
        if not reste:
            page.wait_for_timeout(80); return
        d = random.choice(reste); k = random.randint(0, 1)
        clic(page, d['ecran'][k]['x'], d['ecran'][k]['y'])
        page.wait_for_timeout(200)
    else:
        r = random.choice(e['rect'])
        clic(page, r['x'] + 8 + random.random() * (r['w'] - 16), r['y'] + 8 + random.random() * (r['h'] - 16))
        page.wait_for_timeout(520)

def robot_differences(page, mode='parfait', limite=150, journal=None):
    t0 = time.time()
    while time.time() - t0 < limite and not fini(page):
        e = etat(page)
        if not e or e['jeu'] != 'differences':
            page.wait_for_timeout(80); continue
        pas_differences(page, e, mode)

def robot_double(page, mode='parfait', limite=200, verifs=None):
    t0 = time.time()
    while time.time() - t0 < limite and not fini(page):
        e = etat(page)
        if not e or e['jeu'] != 'double' or e['verrou']:
            page.wait_for_timeout(50); continue
        if verifs is not None:
            verifs.append((len(set(e['pile']) & set(e['carte'])), e['nbCommuns'], len(set(e['pile'])), len(e['pile']), len(set(e['carte'])), len(e['carte'])))
        if mode == 'parfait':
            liste = e['posCarte'] if random.random() < 0.5 else e['posPile']
            s = next(s for s in liste if s['id'] == e['commun'])
            clic(page, s['x'], s['y'])
            page.wait_for_timeout(120)
        else:
            choix = [s for s in e['posCarte'] if s['id'] != e['commun']] if random.random() < 0.85 else e['posCarte']
            s = random.choice(choix)
            clic(page, s['x'], s['y'])
            page.wait_for_timeout(650)

def robot_insectes(page, mode='parfait', limite=200, bonus=False, journal=None):
    """parfait : écrase les mauvais (jamais si un gentil est collé contre), range les gentils si c'est demandé.
       Si le jeu enchaîne sur les différences, il les joue aussi.  étourdi : tape sur tout ce qui bouge."""
    t0 = time.time()
    while time.time() - t0 < limite and not fini(page):
        e = etat(page)
        if not e:
            page.wait_for_timeout(80); continue
        if e['jeu'] == 'differences':
            if journal is not None and 'differences' not in journal: journal.append('differences')
            pas_differences(page, e, 'parfait'); continue
        if e['jeu'] != 'insectes':
            page.wait_for_timeout(80); continue
        ins = [b for b in e['insectes'] if b['etat'] not in ('traine',)]
        if mode == 'etourdi':
            if ins:
                b = random.choice(ins)
                clic(page, b['x'], b['y'])
            page.wait_for_timeout(300); continue
        mauvais = [b for b in ins if not b['bon'] and b['etat'] != 'mort']
        bons = [b for b in ins if b['bon']]
        cible = None
        for b in mauvais:
            if all(math.hypot(b['x'] - g['x'], b['y'] - g['y']) > 60 for g in bons):
                cible = b; break
        if cible:
            clic(page, cible['x'], cible['y'])
            if journal is not None: journal.append('splat ' + cible['esp'] + (' (teinté)' if cible['teinte'] else ''))
            page.wait_for_timeout(110); continue
        if bons and ((e['ranger'] and e['tues'] >= e['totalMauvais']) or (bonus and e['ranges'] < 1)):
            g = bons[0]
            if all(math.hypot(g['x'] - b['x'], g['y'] - b['y']) > 60 for b in mauvais):
                glisser(page, g['x'], g['y'], e['bocalBon']['x'], e['bocalBon']['y'])
                if journal is not None: journal.append('rangé ' + g['esp'])
                page.wait_for_timeout(150); continue
        page.wait_for_timeout(70)
