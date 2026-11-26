#!/usr/bin/env python3
"""Fait jouer un robot dans la maquette et prend des captures.
Usage : python3 robot.py [secondes] [appareil: iphone|tablette|pc] [precision_s] [assiduite] [solo]"""
import sys, time, json, pathlib
from playwright.sync_api import sync_playwright

ici = pathlib.Path(__file__).resolve().parent
page_html = (ici.parent / 'combat-barde.html').resolve()
duree = float(sys.argv[1]) if len(sys.argv) > 1 else 60
app = sys.argv[2] if len(sys.argv) > 2 else 'iphone'
prec = float(sys.argv[3]) if len(sys.argv) > 3 else 0.03
assid = float(sys.argv[4]) if len(sys.argv) > 4 else 0.95
solo = float(sys.argv[5]) if len(sys.argv) > 5 else 0.92
tailles = {'iphone': dict(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True),
           'tablette': dict(viewport={'width': 1024, 'height': 768}, device_scale_factor=1, has_touch=True),
           'pc': dict(viewport={'width': 1280, 'height': 800})}
cap = ici / 'captures'; cap.mkdir(exist_ok=True)
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome',
                            args=['--autoplay-policy=no-user-gesture-required', '--use-fake-ui-for-media-stream'])
    ctx = nav.new_context(**tailles[app])
    pg = ctx.new_page()
    erreurs = []
    pg.on('pageerror', lambda e: erreurs.append('page: ' + str(e)))
    pg.on('console', lambda m: erreurs.append('console: ' + m.text) if m.type == 'error' else None)
    pg.goto(page_html.as_uri())
    pg.wait_for_timeout(1200)
    pg.screenshot(path=str(cap / f'{app}-0-explication.png'))
    pg.click('#bGo')
    pg.evaluate(f'__barde.robot(true, {prec}, {assid}, {solo})')
    t0 = time.time(); k = 0; journal = []
    prochaine = 6
    while time.time() - t0 < duree:
        pg.wait_for_timeout(500)
        e = pg.evaluate('__barde.etat()')
        journal.append(e)
        el = time.time() - t0
        if el > prochaine:
            k += 1; prochaine += 9
            pg.screenshot(path=str(cap / f'{app}-{k:02d}-{e["mode"]}-{int(el)}s.png'))
        if e['etat'] == 'fin' and not e['victoire']:
            break
        if e['victoire'] and el > 3 and e['etat'] == 'fin':
            break
    pg.wait_for_timeout(1500)
    pg.screenshot(path=str(cap / f'{app}-zz-fin.png'))
    fin = pg.evaluate('__barde.etat()')
    nav.close()
print('erreurs :', erreurs or 'aucune')
print('fin :', json.dumps(fin, ensure_ascii=False))
modes = [(round(i * 0.5, 1), j['mode'], j['casque'], j['coeurs'], j['sbires'], j['bpm'], j['sec']) for i, j in enumerate(journal)]
for m in modes[::8]: print(m)
