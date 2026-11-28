# aisselle.py <prefixe> : l'armure en gros plan quand il lève le bras (coup de poing) et quand il parle (bras écartés)
import time, sys
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw
pre = sys.argv[1]
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    pg = b.new_page(viewport={'width': 1200, 'height': 600}, device_scale_factor=2)
    pg.goto('http://localhost:8766/index.html'); pg.evaluate("choisir('barde')")
    for i in range(240):
        if pg.evaluate('!!(window.__essai&&window.__essai.pret)'): break
        time.sleep(0.5)
    for i in range(60):
        if pg.evaluate('!!(__essai.armure.coup && __essai.armure.parle && __essai.CP.info)'): break
        time.sleep(0.5)
    pg.evaluate('window.__pilote = true; window.__zoom = 3.2; __essai.h.x = 10.6; __essai.h.y = 1.0; __essai.avancer(1.5); __essai.coupDePoing()')
    ims = []; t = 0
    for T in (0.7, 1.1, 1.5, 1.9):
        pg.evaluate('__essai.avancer(%f)' % (T - t)); t = T; time.sleep(0.2)
        e = pg.evaluate('[__essai.ecran(10.62, -9.45, 2.0), __essai.ecran(10.62, -9.45, 6.2)]'); H = e[0]['y'] - e[1]['y']; cx = e[0]['x']
        pg.screenshot(path='/tmp/v6/_a.png', clip={'x': cx - H * 0.55, 'y': e[1]['y'], 'width': H * 1.1, 'height': H * 0.75}); ims.append(('coup %.1f' % T, Image.open('/tmp/v6/_a.png').copy()))
    pg.evaluate('__essai.avancer(4.0); __essai.parleGrosbec()'); t = 0
    for T in (2.0, 3.5, 5.0, 6.5):
        pg.evaluate('__essai.avancer(%f)' % (T - t)); t = T; time.sleep(0.2)
        e = pg.evaluate('[__essai.ecran(10.62, -9.45, 2.0), __essai.ecran(10.62, -9.45, 6.2)]'); H = e[0]['y'] - e[1]['y']; cx = e[0]['x']
        pg.screenshot(path='/tmp/v6/_a.png', clip={'x': cx - H * 0.55, 'y': e[1]['y'], 'width': H * 1.1, 'height': H * 0.75}); ims.append(('parle %.1f' % T, Image.open('/tmp/v6/_a.png').copy()))
    b.close()
w, h = 420, 286; o = Image.new('RGB', (w * 4, h * 2))
for i, (n, im) in enumerate(ims): im = im.resize((w, h)); ImageDraw.Draw(im).text((6, 6), n, fill=(255, 255, 0)); o.paste(im, ((i % 4) * w, (i // 4) * h))
o.save('/tmp/v6/aisselle-%s.jpg' % pre, quality=88)
