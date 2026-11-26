#!/usr/bin/env python3
"""Captures de moments précis : automates qui arrivent, coup de bec, phase 3, défaite, victoire."""
import sys, json, pathlib
from playwright.sync_api import sync_playwright

ici = pathlib.Path(__file__).resolve().parent
url = (ici.parent / 'combat-barde.html').resolve().as_uri()
cap = ici / 'captures'; cap.mkdir(exist_ok=True)
quoi = sys.argv[1] if len(sys.argv) > 1 else 'sbires'
app = sys.argv[2] if len(sys.argv) > 2 else 'iphone'
tailles = {'iphone': dict(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True),
           'tablette': dict(viewport={'width': 1024, 'height': 768}, device_scale_factor=1, has_touch=True),
           'paysage': dict(viewport={'width': 844, 'height': 390}, device_scale_factor=2, is_mobile=True, has_touch=True)}
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--autoplay-policy=no-user-gesture-required'])
    pg = nav.new_context(**tailles[app]).new_page()
    err = []
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.goto(url); pg.wait_for_timeout(800); pg.click('#bGo')
    snap = lambda nom: pg.screenshot(path=str(cap / f'{quoi}-{app}-{nom}.png'))
    et = lambda: pg.evaluate('__barde.etat()')
    if quoi == 'sbires':
        for t in [11, 14, 18, 24]:
            pg.wait_for_timeout((t - (0 if t == 11 else prev)) * 1000) if False else None
        pg.wait_for_timeout(11000); snap('11s')
        pg.wait_for_timeout(3000); snap('14s')
        pg.wait_for_timeout(4000); snap('18s')
        pg.wait_for_timeout(6000); snap('24s'); print(et())
    elif quoi == 'phase3':
        pg.evaluate('__barde.robot(true, 0.03, 0.9, 0.9)')
        pg.wait_for_timeout(9000)
        for _ in range(2):
            pg.evaluate("__barde.pause()"); pg.click('#bPhase'); pg.wait_for_timeout(300)
        pg.wait_for_timeout(24000); snap('a'); print(et())
        pg.wait_for_timeout(5000); snap('b'); print(et())
    elif quoi == 'defaite':
        pg.evaluate('__barde.robot(true, 0.2, 0.3, 0.3)')
        for i in range(40):
            pg.wait_for_timeout(2000); e = et()
            if i % 5 == 0: print(i * 2, e['coeurs'], e['sbires'], e['casque'], e['etat'])
            if e['etat'] == 'fin': break
        pg.wait_for_timeout(3000); snap('fin'); print(et())
    elif quoi == 'victoire':
        pg.evaluate('__barde.robot(true, 0.02, 0.97, 1.0)')
        for i in range(120):
            pg.wait_for_timeout(2000); e = et()
            if i % 10 == 0: print(i * 2, 's', e['casque'], e['coeurs'], e['phase'], e['bpm'], e['sec'], e['st']['solos'])
            if e['victoire'] and i % 2 == 0: snap(f'v{i}')
            if e['etat'] == 'fin': break
        pg.wait_for_timeout(1500); snap('fin'); print(et())
    elif quoi == 'bec':
        pg.evaluate('__barde.robot(true, 0.03, 0.95, 0.9)')
        pg.wait_for_timeout(8000)
        pg.evaluate("__barde.pause()"); pg.click('#bPhase'); pg.wait_for_timeout(200)
        pg.evaluate('__barde.robot(false)')
        for i in range(60):
            pg.wait_for_timeout(500)
            b = pg.evaluate('__barde.G.bec && __barde.G.bec.impact - __barde.G.beat.n')
            if b in (1, 2): snap(f'compte{b}');
            if b == 1: break
        print(et())
    print('erreurs :', err or 'aucune')
    nav.close()
