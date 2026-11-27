# essai_nuit.py : la place de nuit (le Barde) — photos dans /tmp/nuit
import sys, time, os, json
from playwright.sync_api import sync_playwright
os.makedirs('/tmp/nuit', exist_ok=True)
W, H, DSF = 844, 390, 2
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    pg = b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=DSF); err = []
    pg.on('pageerror', lambda e: err.append(str(e))); pg.on('console', lambda m: err.append(m.text[:300]) if m.type in ('error', 'warning') else None)
    pg.goto('http://localhost:8766/index.html'); pg.evaluate("choisir('barde')")
    for i in range(200):
        if pg.evaluate('!!(window.__essai&&window.__essai.pret)'): print('prêt', i / 2, 's'); break
        time.sleep(0.5)
    else: print('PAS PRÊT', pg.evaluate("document.getElementById('charge').textContent"), err); b.close(); sys.exit()
    pg.evaluate('window.__pilote = true; __essai.avancer(0.5)')
    pg.screenshot(path='/tmp/nuit/depart.png')
    print('héros', pg.evaluate('[__essai.h.x, __essai.h.y]'), 'fen', pg.evaluate('[__essai.fen.x0,__essai.fen.y0,__essai.fen.x1,__essai.fen.y1]'))
    for nom, x, y in [('gauche-pilier', 6.2, 15.0), ('derriere-pilier', 1.75, 15.2), ('devant', 10.5, 18.5), ('fond-droite', 18, 2)]:
        pg.evaluate('__essai.h.x=%f; __essai.h.y=%f; __essai.avancer(1.5)' % (x, y)); pg.screenshot(path='/tmp/nuit/%s.png' % nom)
        print(nom, 'libre', pg.evaluate('__essai.libre(%f,%f)' % (x, y)))
    pg.evaluate('__essai.h.x=10.5; __essai.h.y=12; __essai.avancer(0.5); __essai.fissurer(); __essai.avancer(0.6)'); pg.screenshot(path='/tmp/nuit/fissure-0.6.png')
    pg.evaluate('__essai.avancer(1.6)'); pg.screenshot(path='/tmp/nuit/fissure-fin.png')
    print('erreurs', err[:8]); b.close()
