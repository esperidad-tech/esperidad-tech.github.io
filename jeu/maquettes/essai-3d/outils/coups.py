# coups.py : pour chaque mouvement du Pisteur, la vitesse de la main droite et du pied droit, la hauteur des pieds et du bassin (repère du modèle, mètres)
import time, sys, json
from playwright.sync_api import sync_playwright
noms = sys.argv[1].split(',')
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    pg = b.new_page(viewport={'width': 640, 'height': 320}); err = []
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.goto('http://localhost:8766/index.html'); pg.evaluate("choisir('pisteur')")
    for i in range(200):
        if pg.evaluate('!!(window.__essai&&window.__essai.pret)'): break
        time.sleep(0.5)
    pg.evaluate('window.__pilote = true')
    res = {}
    for n in noms:
        d = pg.evaluate("__essai.poser('%s', 0).duree" % n); pts = []
        k = 0
        while k / 30 <= d + 1e-6:
            pg.evaluate("__essai.poser('%s', %f)" % (n, k / 30))
            pts.append([k / 30, pg.evaluate("__essai.osM(['RightHand','LeftHand','RightToeBase','LeftToeBase','Hips','Head'])")]); k += 1
        res[n] = {'duree': d, 'pts': pts}
    json.dump(res, open('/tmp/pisteur/coups.json', 'w')); print('erreurs', err[:3]); b.close()
