import os
VU = os.path.dirname(os.path.abspath(__file__))      # les captures s'écrivent ici, à côté de l'outil
POLICES = os.environ.get('BRUMEVAL_POLICES')       # (facultatif) une feuille de style avec les vraies polices du jeu, pour des captures fidèles hors ligne
import sys
sys.path.insert(0, VU); sys.argv = ['x', sys.argv[1] if len(sys.argv) > 1 else 'dist', 'z']
import voir
from playwright.sync_api import sync_playwright
from PIL import Image
H = [5, 18, 45, 70, 82, 95]
with sync_playwright() as p:
    b = p.chromium.launch()
    pg, errs = voir.ouvrir(b, (1180, 820), 1.5)
    voir.chaudron(pg)
    pg.get_by_text("C'est parti").first.click(force=True); pg.wait_for_timeout(5500)
    ims = []
    for h in H:
        pg.evaluate("(h) => { var a = MJ.TYPES.chaudron._dernier.api; a.buches(h > 60 ? 5 : (h < 25 ? 1 : 3)); a.pause(true); a.chaleur(h); }", h); pg.wait_for_timeout(1300)
        pg.screenshot(path=VU + '/z.png', clip={'x':300, 'y':250, 'width':580, 'height':560})
        ims.append(Image.open(VU + '/z.png').copy())
        print(h, pg.evaluate("() => document.querySelector('.mjc').className.replace(/mjc-(sans|cible|revele)\\S*/g, '')"))
    w, hh = ims[0].size
    planche = Image.new('RGB', (w * 3, hh * 2))
    for i, im in enumerate(ims): planche.paste(im, ((i % 3) * w, (i // 3) * hh))
    planche.save(VU + '/zones.png'); print(planche.size, errs[:3])
    b.close()
