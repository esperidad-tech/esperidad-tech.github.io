import time, sys
from playwright.sync_api import sync_playwright
from PIL import Image
W, H, DSF = 844, 390, 2
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    pg = b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=DSF); err = []
    pg.on('pageerror', lambda e: err.append(str(e))); pg.on('console', lambda m: err.append(m.text[:200]) if m.type == 'error' else None)
    pg.goto('http://localhost:8766/index.html'); pg.evaluate("choisir('pisteur')")
    for i in range(200):
        if pg.evaluate('!!(window.__essai&&window.__essai.pret)'): break
        time.sleep(0.5)
    pg.evaluate('window.__pilote = true; window.__zoom = 3.2; __essai.taille(); __essai.h.x = 9; __essai.h.y = 7.6; __essai.avancer(0.5)')
    ims = []
    for a in [1.5708, 0, -1.5708, 3.14159, 0.8]:
        pg.evaluate('__essai.h.a = %f; __essai.avancer(0.6)' % a)
        e = pg.evaluate('__essai.ecran(__essai.h.x, __essai.h.y, 0.8)'); pg.screenshot(path='/tmp/pisteur/_.png'); im = Image.open('/tmp/pisteur/_.png')
        cx, cy = e['x'] * DSF, e['y'] * DSF; ims.append(im.crop((int(cx - 110 * DSF), int(cy - 130 * DSF), int(cx + 110 * DSF), int(cy + 90 * DSF))).resize((300, 300)))
    S = Image.new('RGB', (300 * len(ims), 300))
    for j, im in enumerate(ims): S.paste(im, (300 * j, 0))
    S.save(sys.argv[1] if len(sys.argv) > 1 else '/tmp/pisteur/vues-jeu.png'); pg.screenshot(path='/tmp/pisteur/salle.png'); print(err[:5]); b.close()
