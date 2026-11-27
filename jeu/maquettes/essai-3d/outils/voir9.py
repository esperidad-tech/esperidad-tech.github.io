# marcher (pouce à 25 %), entre-deux (45 %), courir (100 %) : quelques images de chaque, vues de côté
import sys, time
from playwright.sync_api import sync_playwright
from PIL import Image
W, H = 844, 390; DSF = 4
def coupe(pg):
    pg.screenshot(path='/tmp/barde3d/z.png'); v = pg.evaluate('__essai.vue'); k = W / v['Ws']
    sx, sy = (v['hx'] - v['camX']) * k * DSF, (v['hy'] - v['camY']) * k * DSF; f = DSF / 3
    return Image.open('/tmp/barde3d/z.png').crop((int(sx - 220 * f), int(sy - 620 * f), int(sx + 220 * f), int(sy + 40 * f))).resize((220, 330))
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    pg = b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=DSF); err = []
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.goto('http://localhost:8765/index.html')
    for i in range(200):
        if pg.evaluate('!!(window.__essai&&window.__essai.pret)'): break
        time.sleep(0.5)
    pg.evaluate('window.__zoom = 3.2; __essai.taille(); window.__pilote = true; __essai.h.x = 3; __essai.h.y = 7.5; __essai.avancer(0.5)')
    rangs = []
    for m in (0.25, 0.45, 1.0):
        pg.evaluate('__essai.h.x = 3; __essai.joy.mx = %f; __essai.joy.my = 0; __essai.avancer(0.6)' % m)
        ims = []
        for i in range(6):
            pg.evaluate('__essai.avancer(0.1)'); ims.append(coupe(pg))
        print('pouce', m, 'poids', pg.evaluate('JSON.stringify(__essai.loco)'))
        rangs.append(ims)
    pg.evaluate('__essai.joy.mx = 0; __essai.avancer(0.5)'); print('arrêt', pg.evaluate('JSON.stringify(__essai.loco)'))
    print('erreurs', err[:3]); b.close()
c = Image.new('RGB', (220 * 6, 330 * 3))
for r, ims in enumerate(rangs):
    for i, im in enumerate(ims): c.paste(im, (i * 220, r * 330))
c.save('/tmp/barde3d/allures.png')
