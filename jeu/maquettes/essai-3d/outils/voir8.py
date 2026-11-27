# la main gauche sur le manche, sous plusieurs angles (le Barde tourné), pendant qu'il joue
import sys, time, math
from playwright.sync_api import sync_playwright
from PIL import Image
W, H = 844, 390; DSF = 5
angles = [math.pi / 2, math.pi / 2 + 0.8, math.pi / 2 - 0.8, -math.pi / 2, 0.0]
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    pg = b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=DSF); err = []
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.goto('http://localhost:8765/index.html')
    for i in range(200):
        if pg.evaluate('!!(window.__essai&&window.__essai.pret)'): break
        time.sleep(0.5)
    pg.evaluate('window.__zoom = 3.2; __essai.taille(); window.__pilote = true; __essai.avancer(0.5)')
    ims = []
    for a in angles:
        pg.evaluate('window.__face = %f; __essai.h.a = %f' % (a, a))
        pg.evaluate("__essai.lancer('feu'); __essai.avancer(1.4)"); pg.wait_for_timeout(200)
        pg.screenshot(path='/tmp/barde3d/z.png'); v = pg.evaluate('__essai.vue'); k = W / v['Ws']
        sx, sy = (v['hx'] - v['camX']) * k * DSF, (v['hy'] - v['camY']) * k * DSF; f = DSF / 3
        ims.append(Image.open('/tmp/barde3d/z.png').crop((int(sx - 230 * f), int(sy - 480 * f), int(sx + 230 * f), int(sy - 150 * f))).resize((460, 330)))
        pg.evaluate('__essai.avancer(2.5)')
    print('erreurs', err[:3]); b.close()
c = Image.new('RGB', (460 * 3, 330 * 2))
for i, im in enumerate(ims): c.paste(im, ((i % 3) * 460, (i // 3) * 330))
c.save('/tmp/barde3d/mains.png')
