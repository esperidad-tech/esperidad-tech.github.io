import time, os, sys
from playwright.sync_api import sync_playwright
os.makedirs('/tmp/v6', exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'])
    pg = b.new_page(viewport={'width': 844, 'height': 390}, device_scale_factor=2); err = []
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.goto('http://localhost:8766/index.html'); pg.evaluate("choisir('barde')")
    for i in range(240):
        if pg.evaluate('!!(window.__essai&&window.__essai.pret)'): break
        time.sleep(0.5)
    for i in range(60):
        if pg.evaluate('!!(__essai.armure.coup && __essai.CP.info && __essai.CP.el.readyState >= 2)'): break
        time.sleep(0.5)
    x, y = float(sys.argv[1]), float(sys.argv[2])
    pg.evaluate('window.__pilote = true; __essai.h.x = %f; __essai.h.y = %f; __essai.h.a = -Math.PI/2; __essai.avancer(1.0); __essai.coupDePoing()' % (x, y))
    t = 0
    for T, nom in [(1.2, '1-elan'), (2.18, '2-impact'), (2.8, '3-fissures'), (3.45, '4-explosion'), (3.75, '5-en-lair'), (4.5, '6-retombe'), (5.6, '7-fin')]:
        pg.evaluate('__essai.avancer(%f)' % (T - t)); t = T; time.sleep(0.25)
        pg.screenshot(path='/tmp/v6/%s.png' % nom)
    print('erreurs', err[:5]); b.close()
