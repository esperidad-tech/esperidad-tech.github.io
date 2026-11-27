# la main droite au moment où la note part : avant / pendant le geste, de profil et de dos (vue du jeu)
import time
from playwright.sync_api import sync_playwright
from PIL import Image
W, H = 844, 390; DSF = 5
ims = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    pg = b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=DSF)
    pg.goto('http://localhost:8765/index.html')
    for i in range(200):
        if pg.evaluate('!!(window.__essai&&window.__essai.pret)'): break
        time.sleep(0.5)
    pg.evaluate('window.__zoom = 3.2; __essai.taille(); window.__pilote = true; __essai.avancer(0.3)')
    for face in ('0.0', 'false'):
        pg.evaluate('window.__face = %s; __essai.h.x = 9; __essai.h.y = 7.6; __essai.avancer(0.5)' % face)
        pg.evaluate("__essai.lancer('glace')")
        for t in (1.4, 1.62, 1.75, 2.0):
            pg.evaluate('__essai.avancer(%f)' % (t - (pg.evaluate('__essai.h.sortT || 1.5') if False else 0)))
        # (on refait proprement : temps absolus)
        pg.evaluate('__essai.avancer(3)')
        pg.evaluate("__essai.lancer('glace')"); last = 0
        for t in (1.4, 1.6, 1.72, 1.95):
            pg.evaluate('__essai.avancer(%f)' % (t - last)); last = t; pg.wait_for_timeout(150)
            pg.screenshot(path='/tmp/barde3d/z.png'); v = pg.evaluate('__essai.vue'); k = W / v['Ws']
            sx, sy = (v['hx'] - v['camX']) * k * DSF, (v['hy'] - v['camY']) * k * DSF; f = DSF / 3
            ims.append(Image.open('/tmp/barde3d/z.png').crop((int(sx - 260 * f), int(sy - 600 * f), int(sx + 260 * f), int(sy - 140 * f))).resize((340, 300)))
        pg.evaluate('__essai.avancer(3)')
    b.close()
c = Image.new('RGB', (340 * 4, 300 * 2))
for i, im in enumerate(ims): c.paste(im, ((i % 4) * 340, (i // 4) * 300))
c.save('/tmp/barde3d/geste.png')
