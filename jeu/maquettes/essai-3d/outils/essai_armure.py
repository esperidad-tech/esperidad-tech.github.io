# essai_armure.py : l'armure 3D au pied des marches (lanternes, ombre, rayon d'Elyra) ; photos /tmp/v5
import sys, time, os
from playwright.sync_api import sync_playwright
os.makedirs('/tmp/v5', exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    pg = b.new_page(viewport={'width': 844, 'height': 390}, device_scale_factor=2); err = []
    pg.on('pageerror', lambda e: err.append(str(e))); pg.on('console', lambda m: err.append(m.text[:300]) if m.type == 'error' else None)
    pg.goto('http://localhost:8766/index.html'); pg.evaluate("choisir('barde')")
    for i in range(240):
        if pg.evaluate('!!(window.__essai&&window.__essai.pret)'): print('prêt', i/2); break
        time.sleep(0.5)
    else: print('PAS PRÊT', err); b.close(); sys.exit()
    print('armure', pg.evaluate('[!!__essai.armure.m, __essai.armure.lampes.length, __essai.armure.lampes.map(l=>[l.position.x.toFixed(2),l.position.y.toFixed(2),l.position.z.toFixed(2)])]'))
    pg.evaluate('window.__pilote = true; __essai.avancer(1.0)'); time.sleep(0.4); pg.screenshot(path='/tmp/v5/1-depart.png')
    pg.evaluate('__essai.h.x = 10.5; __essai.h.y = 2.5; __essai.avancer(1.5)'); time.sleep(0.4); pg.screenshot(path='/tmp/v5/2-pres.png')
    pg.evaluate('__essai.h.x = 6.5; __essai.h.y = 1.0; __essai.avancer(1.5)'); time.sleep(0.4); pg.screenshot(path='/tmp/v5/3-cote.png')
    pg.evaluate('__essai.h.x = 14; __essai.h.y = 12; __essai.avancer(1.5)'); time.sleep(0.4); pg.screenshot(path='/tmp/v5/4-loin.png')
    print('erreurs', err[:6]); b.close()
