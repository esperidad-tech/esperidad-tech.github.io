import time, os, sys
from playwright.sync_api import sync_playwright
from PIL import Image
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'])
    pg = b.new_page(viewport={'width': 1688, 'height': 780}, device_scale_factor=1)
    pg.goto('http://localhost:8766/index.html'); pg.evaluate("choisir('barde')")
    for i in range(240):
        if pg.evaluate('!!(window.__essai&&window.__essai.pret)'): break
        time.sleep(0.5)
    for i in range(60):
        if pg.evaluate('!!(__essai.armure.coup && __essai.CP.info && __essai.CP.el.readyState >= 2 && __essai.CP.zone)'): break
        time.sleep(0.5)
    pg.evaluate('window.__pilote = true; __essai.h.x = 14.0; __essai.h.y = 11.0; __essai.h.a = -Math.PI/2; __essai.avancer(1.0); __essai.coupDePoing()')
    A, B = [], []; t = 0
    for T in [0.6, 1.2, 1.7, 2.0, 2.15, 2.4, 2.8, 3.3, 3.36, 3.5, 3.65, 3.8, 3.95, 4.1, 4.3, 4.6, 5.0, 5.4]:
        pg.evaluate('__essai.avancer(%f)' % (T - t)); t = T; time.sleep(0.15)
        e = pg.evaluate('[__essai.ecran(10.62, -9.45, 2.0), __essai.ecran(10.62, -9.45, 5.8), __essai.ecran(__essai.h.x, __essai.h.y, 0), __essai.ecran(__essai.h.x, __essai.h.y, 2.0)]')
        im = pg.screenshot()
        open('/tmp/v6/_.png', 'wb').write(im); I = Image.open('/tmp/v6/_.png')
        H = e[0]['y'] - e[1]['y']; cx = e[0]['x']
        if T <= 3.3: A.append((T, I.crop((int(cx - H * 0.8), int(e[1]['y'] - H * 0.2), int(cx + H * 0.8), int(e[0]['y'] + H * 0.25))).resize((300, 270))))
        if T >= 3.3: h2 = e[2]['y'] - e[3]['y']; B.append((T, I.crop((int(e[2]['x'] - h2 * 1.2), int(e[3]['y'] - h2 * 0.9), int(e[2]['x'] + h2 * 1.2), int(e[2]['y'] + h2 * 0.3))).resize((240, 264))))
    b.close()
from PIL import ImageDraw
def planche(L, w, h, n, f):
    o = Image.new('RGB', (w * n, h * ((len(L) + n - 1) // n)))
    for i, (T, im) in enumerate(L): d = ImageDraw.Draw(im); d.text((4, 4), '%.2f' % T, fill=(255, 255, 0)); o.paste(im, ((i % n) * w, (i // n) * h))
    o.save(f)
planche(A, 300, 270, 4, '/tmp/v6/grosbec.png'); planche(B, 240, 264, 6, '/tmp/v6/barde.png')
