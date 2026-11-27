import time, os
from playwright.sync_api import sync_playwright
from PIL import Image
W, H, DSF = 844, 390, 2
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    pg = b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=DSF); err = []
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.goto('http://localhost:8766/index.html')
    for i in range(200):
        if pg.evaluate('!!(window.__essai&&window.__essai.pret)'): break
        time.sleep(0.5)
    pg.evaluate('window.__pilote = true; window.__zoom = 2.6; __essai.taille(); __essai.h.x = 3.5; __essai.h.y = 7.4; __essai.joy.mx = 1; __essai.joy.my = 0; __essai.avancer(1.2)')
    x = [pg.evaluate('__essai.h.x')]; pg.evaluate('__essai.sauter(1, 0)'); ims = []; vit = []
    for k in range(28):
        pg.evaluate('__essai.avancer(1/30)'); x.append(pg.evaluate('__essai.h.x')); vit.append(round((x[-1] - x[-2]) * 30, 1))
        if k >= 12 and k < 28 and k % 2 == 0:
            e = pg.evaluate('__essai.ecran(__essai.h.x, __essai.h.y, 0.8)'); pg.screenshot(path='/tmp/sorts/_.png'); im = Image.open('/tmp/sorts/_.png')
            cx, cy = e['x'] * DSF, e['y'] * DSF; ims.append(im.crop((int(cx - 120 * DSF), int(cy - 140 * DSF), int(cx + 120 * DSF), int(cy + 100 * DSF))).resize((240, 240)))
    S = Image.new('RGB', (240 * len(ims), 240))
    for j, im in enumerate(ims): S.paste(im, (240 * j, 0))
    S.save('/tmp/sorts/atterrissage.png'); print(vit, err[:3]); b.close()
