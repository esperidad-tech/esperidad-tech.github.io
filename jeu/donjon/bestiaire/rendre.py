"""Bestiaire : python3 rendre.py [id ...] -> fiches/<id>.png (2x) ; sans argument : toutes les bêtes + la planche."""
import sys, os, glob
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
os.makedirs(os.path.join(ICI, 'fiches'), exist_ok=True)
BASE = open(os.path.join(ICI, 'base.js')).read()
BETES = sorted(glob.glob(os.path.join(ICI, 'betes', '*.js')))
JEU = os.environ.get('JEU', '/home/claude/brumeval/brumeval-sources/d-rapide/index.html')
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 560, 'height': 760}, device_scale_factor=2)
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file://' + JEU); pg.wait_for_timeout(300)
    pg.add_script_tag(content=BASE)
    for f in BETES:  # une balise par bête : une erreur dans un fichier ne casse pas les autres
        try: pg.add_script_tag(content=open(f).read())
        except Exception as e: print('ERREUR dans', os.path.basename(f), e)
    ids = sys.argv[1:] or pg.evaluate("Object.keys(BESTIAIRE)")
    for i in ids:
        pg.evaluate("(i) => { document.body.innerHTML = '<div style=\"position:fixed;inset:0;background:#000\">' + BT.fiche(i) + '</div>'; document.body.style.margin = 0; }", i)
        pg.wait_for_timeout(250)
        pg.screenshot(path=os.path.join(ICI, 'fiches', i + '.png'))
        print(i, errs); errs.clear()
    b.close()
