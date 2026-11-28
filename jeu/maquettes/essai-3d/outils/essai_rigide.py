# essai_rigide.py <fichier armure .json> <préfixe> : Grosbec parle, photos de près toutes les secondes
import sys, time
from playwright.sync_api import sync_playwright
fic, pre = sys.argv[1], sys.argv[2]
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    pg = b.new_page(viewport={'width': 844, 'height': 390}, device_scale_factor=2); err = []
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.route('**/armure.json', lambda r: r.fulfill(path='/tmp/essai3d/site/' + fic, content_type='application/json'))
    pg.goto('http://localhost:8766/index.html'); pg.evaluate("window.__zoom = 2.6; choisir('barde')")
    for i in range(240):
        if pg.evaluate('!!(window.__essai&&window.__essai.pret)'): break
        time.sleep(0.5)
    time.sleep(1.5)
    pg.evaluate('window.__pilote = true; __essai.h.x = 10.6; __essai.h.y = 3.2; __essai.avancer(0.5); __essai.parleGrosbec()')
    for k in range(10):
        pg.evaluate('__essai.avancer(1.0)'); time.sleep(0.25); pg.screenshot(path='/tmp/v5/%s%d.png' % (pre, k))
    print('erreurs', err[:3]); b.close()
