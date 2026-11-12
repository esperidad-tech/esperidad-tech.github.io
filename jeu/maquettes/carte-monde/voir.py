"""Photographie la page du modèle. python3 voir.py [tuiles|ecrans|brume] [dossier de sortie]
tuiles : la carte sans brume, en six morceaux à taille réelle (pour regarder les détails) ; ecrans : téléphone et tablettes, avec et sans brume ;
brume : la vue d'ensemble avec toute la brume, quelques zones levées, sans brume."""
import sys, os
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(ICI, os.environ.get('PAGE', 'carte-monde.html'))
quoi = sys.argv[1] if len(sys.argv) > 1 else 'ecrans'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/carte-essai/vues'
os.makedirs(OUT, exist_ok=True)
erreurs = []
def page(b, w, h, tactile=False):
    pg = b.new_context(viewport={'width': w, 'height': h}, has_touch=tactile).new_page()
    pg.on('console', lambda m: erreurs.append(m.text[:200]) if m.type == 'error' and 'fonts' not in m.text and 'net::' not in m.text else None)
    pg.on('pageerror', lambda e: erreurs.append('PAGEERROR ' + str(e)[:300]))
    pg.goto(URL); pg.wait_for_timeout(700)
    return pg
with sync_playwright() as p:
    b = p.chromium.launch()
    if quoi == 'tuiles':
        pg = page(b, 1000, 1056)
        pg.evaluate("() => { __carte.lever(['no','n','ne','o','e','so','s','se']); __carte.V.kMax = 1; __carte.poser(1, {x:500, y:500}); document.querySelector('.mo-zoom').style.display='none'; }")
        pg.wait_for_timeout(2600)
        for j in range(2):
            for i in range(3):
                pg.evaluate(f"() => {{ var v = document.getElementById('vue'); v.scrollLeft = {i*1000}; v.scrollTop = {j*1000}; }}")
                pg.wait_for_timeout(250)
                pg.screenshot(path=f'{OUT}/tuile-{j}{i}.png', clip={'x':0,'y':56,'width':1000,'height':1000})
    elif quoi == 'brume':
        pg = page(b, 1500, 1056)
        pg.wait_for_timeout(500); pg.screenshot(path=f'{OUT}/ensemble-brume.png')
        pg.evaluate("() => __carte.lever(['o','ne'])"); pg.wait_for_timeout(2800); pg.screenshot(path=f'{OUT}/ensemble-deux-zones.png')
        pg.evaluate("() => __carte.lever(['no','n','ne','o','e','so','s','se'])"); pg.wait_for_timeout(2800); pg.screenshot(path=f'{OUT}/ensemble-sans-brume.png')
    else:
        for nom, (w, h) in {'tel': (390, 844), 'ipad-couche': (1180, 820), 'ipad-debout': (820, 1180), 'android-couche': (1280, 800)}.items():
            pg = page(b, w, h, True)
            pg.screenshot(path=f'{OUT}/{nom}-brume.png')
            pg.evaluate("() => __carte.lever(['no','n','ne','o','e','so','s','se'])"); pg.wait_for_timeout(2800)
            pg.screenshot(path=f'{OUT}/{nom}-sans-brume.png')
            print(nom, pg.evaluate("() => [document.getElementById('vue').clientWidth, document.getElementById('vue').clientHeight, +__carte.V.k.toFixed(3), +__carte.V.kMin.toFixed(3), __carte.V.kMax]"))
            pg.context.close()
    b.close()
print('ERREURS :', erreurs if erreurs else 'aucune')
