# essai_nuit2.py : derrière la lanterne, marcher jusqu'au bord de la crevasse, sauter par-dessus, une note de feu
import sys, time, os
from playwright.sync_api import sync_playwright
os.makedirs('/tmp/nuit', exist_ok=True)
W, H, DSF = 844, 390, 2
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    pg = b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=DSF); err = []
    pg.on('pageerror', lambda e: err.append(str(e))); pg.on('console', lambda m: err.append(m.text[:300]) if m.type == 'error' else None)
    pg.goto('http://localhost:8766/index.html'); pg.evaluate("choisir('barde')")
    for i in range(200):
        if pg.evaluate('!!(window.__essai&&window.__essai.pret)'): break
        time.sleep(0.5)
    pg.evaluate('window.__pilote = true; __essai.avancer(0.3)')
    pg.screenshot(path='/tmp/nuit/a-depart.png')
    pg.evaluate('__essai.h.x=2.5; __essai.h.y=15.3; __essai.h.a=0; __essai.avancer(1)'); pg.screenshot(path='/tmp/nuit/b-moitie-cache.png')
    pg.evaluate('__essai.h.x=4.0; __essai.h.y=16.8; __essai.avancer(1)'); pg.screenshot(path='/tmp/nuit/c-devant-lanterne.png')
    pg.evaluate('__essai.h.x=10.5; __essai.h.y=12; __essai.avancer(0.3); __essai.fissurer(); __essai.avancer(2.5)')
    pg.evaluate('__essai.joy.mx=-1; __essai.joy.my=0; __essai.avancer(2.0)'); print('arrêté au bord à x =', pg.evaluate('__essai.h.x'))
    pg.screenshot(path='/tmp/nuit/d-bord.png')
    pg.evaluate('__essai.sauter(-1, 0)'); pos=[]
    for k in range(12):
        pg.evaluate('__essai.avancer(1/15)'); pos.append(round(pg.evaluate('__essai.h.x'), 2))
        if k == 5: pg.screenshot(path='/tmp/nuit/e-saut.png')
    pg.evaluate('__essai.joy.mx=0; __essai.avancer(0.6)'); print('saut :', pos, 'arrivé à', pg.evaluate('[__essai.h.x, __essai.h.y, __essai.libre(__essai.h.x, __essai.h.y)]'))
    pg.screenshot(path='/tmp/nuit/f-apres-saut.png')
    pg.evaluate("__essai.lancer('feu'); __essai.avancer(3.25)"); pg.screenshot(path='/tmp/nuit/g-feu.png')
    pg.evaluate('__essai.avancer(0.5)'); pg.screenshot(path='/tmp/nuit/h-feu2.png')
    pg.evaluate('__essai.h.x=10.5; __essai.h.y=18.6; __essai.avancer(1.5)'); pg.screenshot(path='/tmp/nuit/i-devant.png')
    print('fen', pg.evaluate('[__essai.fen.x0,__essai.fen.y0,__essai.fen.x1,__essai.fen.y1]'))
    print('erreurs', err[:8]); b.close()
