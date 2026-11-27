# le sort filmé pas à pas (temps du jeu exact) ; python3 voir5.py face|dos feu|glace "0,0.15,…"
import sys, time
from playwright.sync_api import sync_playwright
from PIL import Image
W, H = 844, 390; DSF = 5
face = sys.argv[1] == 'face'; q = sys.argv[2]; TS = [float(x) for x in sys.argv[3].split(',')]
zoom = float(sys.argv[4]) if len(sys.argv) > 4 else 3.2
def coupe(pg):
    pg.screenshot(path='/tmp/barde3d/z.png'); v = pg.evaluate('__essai.vue'); k = W / v['Ws']
    sx, sy = (v['hx'] - v['camX']) * k * DSF, (v['hy'] - v['camY']) * k * DSF
    f = DSF / 3
    return Image.open('/tmp/barde3d/z.png').crop((int(sx - 200 * f), int(sy - 600 * f), int(sx + 200 * f), int(sy - 200 * f))).resize((400, 400))
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    pg = b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=DSF); err = []
    pg.on('pageerror', lambda e: err.append(str(e))); pg.on('console', lambda m: err.append(m.text[:200]) if m.type == 'error' else None)
    pg.goto('http://localhost:8765/index.html')
    for i in range(200):
        if pg.evaluate('!!(window.__essai&&window.__essai.pret)'): break
        time.sleep(0.5)
    pg.evaluate('window.__zoom = %f; __essai.taille(); window.__pilote = true' % zoom)
    if face: pg.evaluate('window.__face = true; __essai.h.a = Math.PI/2')
    pg.evaluate('__essai.avancer(1.0)'); pg.wait_for_timeout(300)
    ims = []; tcur = 0; lance = False
    for tt in TS:
        if not lance and tt >= 0: pg.evaluate("__essai.lancer('%s')" % q); lance = True
        pg.evaluate('__essai.avancer(%f)' % (tt - tcur)); tcur = tt; pg.wait_for_timeout(250); ims.append(coupe(pg))
    print('erreurs', err[:5], 'état', pg.evaluate('__essai.h.luth'))
    b.close()
n = len(ims); cols = min(5, n); rows = (n + cols - 1) // cols
c = Image.new('RGB', (400 * cols, 400 * rows))
for i, im in enumerate(ims): c.paste(im, ((i % cols) * 400, (i // cols) * 400))
c.save('/tmp/barde3d/haut-%s-%s.png' % (sys.argv[1], q))
