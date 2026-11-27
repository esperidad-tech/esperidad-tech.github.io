import time, sys, os
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw
W, H, DSF = 844, 390, 3
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    pg = b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=DSF); err = []
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.goto('http://localhost:8766/index.html'); pg.evaluate("choisir('pisteur')")
    for i in range(200):
        if pg.evaluate('!!(window.__essai&&window.__essai.pret)'): break
        time.sleep(0.5)
    pg.evaluate('window.__pilote = true; window.__zoom = 3.4; __essai.taille(); __essai.h.x = 7.8; __essai.h.y = 4.9; __essai.h.a = 0; __essai.avancer(0.5)')
    photos = []
    def photo(titre, cx, cy, r=80, z=0.8):
        e = pg.evaluate('__essai.ecran(%f, %f, %f)' % (cx, cy, z)); pg.screenshot(path='/tmp/pisteur/_.png'); im = Image.open('/tmp/pisteur/_.png')
        x, y = e['x'] * DSF, e['y'] * DSF; c = im.crop((int(x - r * DSF), int(y - r * DSF), int(x + r * DSF), int(y + r * DSF))).resize((260, 260))
        ImageDraw.Draw(c).text((4, 4), titre, fill='yellow'); photos.append(c)
    av = lambda s: pg.evaluate('__essai.avancer(%f)' % s)
    # vue de profil : le mannequin à droite
    for k in range(3):
        pg.evaluate("__essai.frapper('dague')")
        for j in range(3): av(0.1); photo('d%d %.1f' % (k + 1, (j + 1) * 0.1), 8.4, 4.9)
        av(0.6)
    # le saut de côté par-dessus le muret vertical (13 ; 6,4)
    pg.evaluate('__essai.h.x = 11.2; __essai.h.y = 6.4; __essai.h.a = 0; __essai.joy.mx = 1; __essai.joy.my = 0'); av(0.35)
    print('avant', pg.evaluate('[__essai.h.x, __essai.h.y, __essai.loco.v]'))
    pg.evaluate('__essai.sauter(1, 0)')
    for k in range(8): av(0.08); photo('saut %.2f' % ((k + 1) * 0.08), 13, 6.4, 110)
    print('après', pg.evaluate('[__essai.h.x, __essai.h.y]'))
    n = len(photos); cols = 6; S = Image.new('RGB', (260 * cols, 260 * ((n + cols - 1) // cols)))
    for i, c in enumerate(photos): S.paste(c, (260 * (i % cols), 260 * (i // cols)))
    S.save('/tmp/pisteur/planche2.png'); print('erreurs', err[:5]); b.close()
