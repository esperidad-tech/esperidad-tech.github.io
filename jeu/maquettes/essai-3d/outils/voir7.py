# courir avec le luth sur le dos, puis lancer et repartir en courant (le luth se range en courant)
import time
from playwright.sync_api import sync_playwright
from PIL import Image
W, H = 844, 390; DSF = 4
def coupe(pg):
    pg.screenshot(path='/tmp/barde3d/z.png'); v = pg.evaluate('__essai.vue'); k = W / v['Ws']
    sx, sy = (v['hx'] - v['camX']) * k * DSF, (v['hy'] - v['camY']) * k * DSF; f = DSF / 3
    return Image.open('/tmp/barde3d/z.png').crop((int(sx - 220 * f), int(sy - 620 * f), int(sx + 220 * f), int(sy + 40 * f))).resize((300, 450))
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
    pg.keyboard.down('ArrowLeft'); pg.evaluate('__essai.avancer(0.6)'); ims.append(coupe(pg)); pg.evaluate('__essai.avancer(0.25)'); ims.append(coupe(pg)); pg.keyboard.up('ArrowLeft')
    pg.keyboard.down('ArrowDown'); pg.evaluate('__essai.avancer(0.5)'); ims.append(coupe(pg)); pg.keyboard.up('ArrowDown')
    pg.evaluate("__essai.avancer(0.2); __essai.lancer('glace'); __essai.avancer(1.8)")
    pg.keyboard.down('ArrowRight'); pg.evaluate('__essai.avancer(0.3)'); ims.append(coupe(pg)); pg.evaluate('__essai.avancer(0.4)'); ims.append(coupe(pg)); pg.keyboard.up('ArrowRight')
    print('erreurs', err[:4], pg.evaluate('__essai.h.luth')); b.close()
c = Image.new('RGB', (300 * len(ims), 450))
for i, im in enumerate(ims): c.paste(im, (i * 300, 0))
c.save('/tmp/barde3d/course-luth.png')
