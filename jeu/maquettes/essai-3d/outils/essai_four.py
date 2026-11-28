import sys, time
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'])
    pg = b.new_page(viewport={'width': 844, 'height': 390}, device_scale_factor=2); err = []
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.goto('http://localhost:8766/index.html'); pg.evaluate("choisir('barde')")
    for i in range(200):
        if pg.evaluate('!!(window.__essai&&window.__essai.pret&&window.__essai.vague.pret)'): break
        time.sleep(0.5)
    time.sleep(1)
    pg.evaluate('window.__pilote = true; window.__tirage = [[10.5,6.5],[7,9]]; __essai.h.x = 10.6; __essai.h.y = 3.5; window.__zoom = 2.2; __essai.avancer(0.5); __essai.lancerVague()')
    for nom, d in [('f0-mains', 2.2), ('f1', 4.6), ('f2', 0.7), ('f3', 0.7), ('f4', 1.0), ('f5', 1.4), ('f6', 1.4)]:
        pg.evaluate('__essai.avancer(%f)' % d); time.sleep(0.45); pg.screenshot(path='/tmp/cr/%s.png' % nom)
    print(err); b.close()
