#!/usr/bin/env python3
"""Un robot joue une partie entière (version 2) et mesure la durée.
Usage : python3 partie.py [secondes_max] [appareil] [precision] [assiduite] [solo] [acte_depart]"""
import sys, time, json, pathlib
from playwright.sync_api import sync_playwright

ici = pathlib.Path(__file__).resolve().parent
url = (ici.parent / 'combat-barde.html').resolve().as_uri()
duree = float(sys.argv[1]) if len(sys.argv) > 1 else 720
app = sys.argv[2] if len(sys.argv) > 2 else 'iphone'
prec = float(sys.argv[3]) if len(sys.argv) > 3 else 0.05
assid = float(sys.argv[4]) if len(sys.argv) > 4 else 0.85
solo = float(sys.argv[5]) if len(sys.argv) > 5 else 0.85
acte0 = int(sys.argv[6]) if len(sys.argv) > 6 else 0
tag = f'{app}-p{int(prec*1000)}'
tailles = {'iphone': dict(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True),
           'tablette': dict(viewport={'width': 1024, 'height': 768}, device_scale_factor=1, has_touch=True)}
cap = ici / 'captures3'; cap.mkdir(exist_ok=True)
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--autoplay-policy=no-user-gesture-required'])
    pg = nav.new_context(**tailles[app]).new_page()
    err = []
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.goto(url); pg.wait_for_timeout(800)
    pg.screenshot(path=str(cap / f'{tag}-00-explication.png'), full_page=False)
    if acte0: pg.evaluate(f'__barde.nouvellePartie({acte0})')
    else: pg.click('#bGo')
    pg.evaluate(f'__barde.robot(true, {prec}, {assid}, {solo})')
    t0 = time.time(); journal = []; k = 0; prochaine = 20; vus = set()
    while time.time() - t0 < duree:
        pg.wait_for_timeout(1000)
        e = pg.evaluate('__barde.etat()'); el = int(time.time() - t0); journal.append((el, e))
        cle = (e['mode'], e['acte'], (e['relance'] or {}).get('sec'))
        if e['etat'] == 'carte':
            pg.screenshot(path=str(cap / f'{tag}-carte-acte{e["acte"]}.png'))
            pg.wait_for_timeout(1500); pg.click('#bRelancer')
        elif cle not in vus or el > prochaine:
            vus.add(cle); prochaine = el + 45; k += 1
            pg.screenshot(path=str(cap / f'{tag}-{k:02d}-{e["mode"]}-a{e["acte"]}-{el}s.png'))
        if e['etat'] == 'fin':
            pg.wait_for_timeout(2500); pg.screenshot(path=str(cap / f'{tag}-zz-fin.png')); break
    fin = pg.evaluate('__barde.etat()')
    nav.close()
print('erreurs :', err or 'aucune')
print('fin :', json.dumps({k: fin[k] for k in ['etat', 'mode', 'acte', 'coeurs', 'victoire', 'temps', 'st']}, ensure_ascii=False))
dern = None
for el, e in journal:
    cle = (e['mode'], e['acte'], e['sec'] if e['mode'] == 'relance' else '')
    if cle != dern: print(f"{el:4d}s  {e['mode']:9s} acte {e['acte']} {e['sec']:3s} bpm {e['bpm']} cœurs {e['coeurs']} groupes {e['groupe']} relance {e['relance']} niv {e['niveau']} méga {e['mega']}"); dern = cle
