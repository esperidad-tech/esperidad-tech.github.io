# essai_nuit3.py : le saut et les crevasses (jamais dedans : il passe, ou il retombe au bord de son côté)
import sys, time
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    pg = b.new_page(viewport={'width': 844, 'height': 390}); err = []
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.goto('http://localhost:8766/index.html'); pg.evaluate("choisir('barde')")
    for i in range(200):
        if pg.evaluate('!!(window.__essai&&window.__essai.pret)'): break
        time.sleep(0.5)
    pg.evaluate('window.__pilote = true; __essai.avancer(0.3); __essai.fissurer(); __essai.avancer(2)')
    for x0 in [8.1, 8.6, 9.2, 9.8, 10.4, 11.0]:
        pg.evaluate('__essai.h.x=%f; __essai.h.y=12; __essai.h.sautR=0; __essai.avancer(0.2); __essai.sauter(-1, 0); __essai.avancer(1.2)' % x0)
        r = pg.evaluate('[__essai.h.x, __essai.libre(__essai.h.x, 12), !!__essai.h.pousse]')
        print('départ x=%.1f -> arrivée x=%.2f (saut de %.2f), libre %s, poussé %s' % (x0, r[0], x0 - r[0], r[1], r[2]))
    print('erreurs', err[:5]); b.close()
