"""Photographie l'atelier de l'Alchimiste (enquête 2).  python3 atelier.py <dist> <prefixe> [tailles…] [bulles=1] [glisse=1]"""
import os
VU = os.path.dirname(os.path.abspath(__file__))      # les captures s'écrivent ici, à côté de l'outil
POLICES = os.environ.get('BRUMEVAL_POLICES')       # (facultatif) une feuille de style avec les vraies polices du jeu, pour des captures fidèles hors ligne
import sys, json
sys.path.insert(0, VU)
from playwright.sync_api import sync_playwright
import voir
DIST, PRE = sys.argv[1], sys.argv[2]
OPT = dict(a.split('=') for a in sys.argv[3:] if '=' in a)
noms = [a for a in sys.argv[3:] if a in voir.T] or ['tablette']
with sync_playwright() as p:
    b = p.chromium.launch()
    for n in noms:
        pg, errs = voir.ouvrir(b, voir.T[n])
        try:
            pg.evaluate("""() => { var S = M.S; S.fioles = 3; M.P().tutoCueillette = 'fini'; M.UI.modal = null; M.P().onglet = 'role'; M.sauver(); M.render(); }""")
            pg.wait_for_timeout(1800)
            pg.screenshot(path=f'{VU}/{PRE}-{n}.png')
            info = pg.evaluate("""() => { var o = M.S.atelier.objets.filter(o => o.t === 'chaudron')[0]; var el = document.querySelector('#atelier-ici [data-obj=ch]'); var r = el && el.getBoundingClientRect(); return JSON.stringify({o:o, r:r && [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]}); }""")
            print(n, info, errs[:4])
            if OPT.get('glisse'):
                el = pg.locator('#atelier-ici [data-obj=ch]').first; bb = el.bounding_box()
                cx, cy = bb['x'] + bb['width'] / 2, bb['y'] + bb['height'] * 0.6
                pg.mouse.move(cx, cy); pg.mouse.down(); pg.wait_for_timeout(700); pg.mouse.move(cx - 150, cy + 120, steps=8); pg.wait_for_timeout(200); pg.mouse.up(); pg.wait_for_timeout(700)
                pg.screenshot(path=f'{VU}/{PRE}-{n}-glisse.png')
                print(' après glisse', pg.evaluate("() => JSON.stringify(M.S.atelier.objets.filter(o => o.t === 'chaudron')[0])"))
                pg.mouse.move(cx, cy); pg.mouse.down(); pg.mouse.move(cx - 160, cy + 130, steps=6); pg.mouse.up(); pg.wait_for_timeout(600)
                print(' après glisse rapide', pg.evaluate("() => JSON.stringify(M.S.atelier.objets.filter(o => o.t === 'chaudron')[0])"))
            if OPT.get('bulles'):
                pg.locator('#atelier-ici [data-obj=ch]').first.click(); pg.wait_for_timeout(800)
                pg.screenshot(path=f'{VU}/{PRE}-{n}-bulles.png')
        except Exception as e:
            print(n, 'ERR', str(e)[:300], errs[:4]); pg.screenshot(path=f'{VU}/{PRE}-{n}-err.png')
        pg.context.close()
    b.close()
