# essai_pisteur.py : le Pisteur, image par image (le temps du jeu exact) : les coups sur le mannequin, l'ombre, le saut par-dessus un muret
import time, sys, os
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw
W, H, DSF = 844, 390, 2
os.makedirs('/tmp/pisteur/ph', exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    pg = b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=DSF); err = []
    pg.on('pageerror', lambda e: err.append(str(e))); pg.on('console', lambda m: err.append(m.text[:200]) if m.type == 'error' else None)
    pg.goto('http://localhost:8766/index.html'); pg.evaluate("choisir('pisteur')")
    for i in range(200):
        if pg.evaluate('!!(window.__essai&&window.__essai.pret)'): break
        time.sleep(0.5)
    pg.evaluate('window.__pilote = true; window.__zoom = 2.6; __essai.taille(); __essai.h.x = 9; __essai.h.y = 6.3; __essai.h.a = -1.5708; __essai.avancer(0.5)')
    photos = []
    def photo(titre, cx=None, cy=None, r=120):
        if cx is None: cx, cy = pg.evaluate('[__essai.h.x, __essai.h.y]')
        e = pg.evaluate('__essai.ecran(%f, %f, 0.8)' % (cx, cy)); pg.screenshot(path='/tmp/pisteur/_.png'); im = Image.open('/tmp/pisteur/_.png')
        x, y = e['x'] * DSF, e['y'] * DSF; c = im.crop((int(x - r * DSF), int(y - (r + 20) * DSF), int(x + r * DSF), int(y + (r - 20) * DSF))).resize((240, 240))
        ImageDraw.Draw(c).text((4, 4), titre, fill='yellow'); photos.append(c)
    av = lambda s: pg.evaluate('__essai.avancer(%f)' % s)
    # la dague en trois temps sur le mannequin (9 ; 4,9) : il est à 1,4 pas
    for k in range(3):
        pg.evaluate("__essai.frapper('dague')"); av(0.12); photo('dague %d a' % (k + 1), 9, 5.6); av(0.14); photo('dague %d b' % (k + 1), 9, 5.6); av(0.5)
        print('rang', pg.evaluate('__essai.h.rang'))
    pg.evaluate("__essai.frapper('assomme')"); av(0.3); photo('assomme', 9, 5.6); av(0.5); photo('étoiles', 9, 5.6); av(1.0)
    # l'ombre : accroupi, il tourne autour, puis l'embuscade
    pg.evaluate('__essai.basculerOmbre()'); av(0.4); photo('ombre', 9, 5.6)
    pg.evaluate('__essai.joy.mx = 0.6; __essai.joy.my = 0'); av(0.5); photo('furtif', 9, 5.6); pg.evaluate('__essai.joy.mx = 0'); av(0.6); photo('guet', 9, 5.6)
    pg.evaluate("__essai.frapper('dague')"); av(0.3); photo('embuscade', 9, 5.6); av(0.8)
    print('ombre après embuscade', pg.evaluate('__essai.h.ombre'))
    # le saut par-dessus le muret (5,4 ; 7,0) : il court vers lui depuis la droite... depuis le haut
    pg.evaluate('__essai.h.x = 5.4; __essai.h.y = 4.6; __essai.h.a = 1.5708; __essai.joy.mx = 0; __essai.joy.my = 1'); av(0.8)
    pg.evaluate('__essai.sauter(0, 1)')
    for k in range(5): av(0.12); photo('saut %d' % k, 5.4, 6.6)
    pg.evaluate('__essai.joy.my = 0'); av(0.5); photo('après', 5.4, 7.6)
    print('position après le saut', pg.evaluate('[__essai.h.x, __essai.h.y]'))
    # la course
    pg.evaluate('__essai.h.x = 3; __essai.h.y = 9.2; __essai.joy.mx = 1; __essai.joy.my = 0'); av(0.8); photo('course'); pg.evaluate('__essai.joy.mx = 0.4'); av(0.8); photo('marche'); pg.evaluate('__essai.joy.mx = 0'); av(0.6); photo('garde')
    n = len(photos); cols = 6; S = Image.new('RGB', (240 * cols, 240 * ((n + cols - 1) // cols)))
    for i, c in enumerate(photos): S.paste(c, (240 * (i % cols), 240 * (i // cols)))
    S.save(sys.argv[1] if len(sys.argv) > 1 else '/tmp/pisteur/planche.png'); print('erreurs', err[:5]); b.close()
