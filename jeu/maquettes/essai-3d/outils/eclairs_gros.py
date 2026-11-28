import time
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'])
    pg = b.new_page(viewport={'width': 1200, 'height': 600}, device_scale_factor=2)
    pg.goto('http://localhost:8766/index.html'); pg.evaluate("choisir('barde')")
    for i in range(240):
        if pg.evaluate('!!(window.__essai&&window.__essai.pret)'): break
        time.sleep(0.5)
    for i in range(80):
        if pg.evaluate('!!(__essai.armure.coup && __essai.CP.zones && __essai.CP.ecl.el.readyState >= 2)'): break
        time.sleep(0.5)
    out = []
    for cote in ('droite', 'gauche'):
        pg.evaluate("window.__pilote = true; window.__zoom = 3.0; __essai.h.x = 10.6; __essai.h.y = 1.0; __essai.avancer(1.5); __essai.coupDePoing('%s')" % cote); t = 0
        for T in (0.5, 1.1, 1.6, 1.95, 2.18):
            pg.evaluate('__essai.avancer(%f)' % (T - t)); t = T; time.sleep(0.5); pg.evaluate('__essai.avancer(1/60)'); t += 1 / 60; time.sleep(0.15)
            e = pg.evaluate('[__essai.ecran(10.62, -9.45, 2.0), __essai.ecran(10.62, -9.45, 6.4)]'); H = e[0]['y'] - e[1]['y']; cx = e[0]['x']
            pg.screenshot(path='/tmp/v6/_e.png', clip={'x': cx - H * 0.7, 'y': e[1]['y'] - H * 0.1, 'width': H * 1.4, 'height': H * 0.95})
            im = Image.open('/tmp/v6/_e.png').copy().resize((360, 244)); ImageDraw.Draw(im).text((6, 6), '%s %.2f' % (cote, T), fill=(255, 255, 0)); out.append(im)
        pg.evaluate('__essai.avancer(5.0)')
    b.close()
o = Image.new('RGB', (360 * 5, 244 * 2))
for i, im in enumerate(out): o.paste(im, ((i % 5) * 360, (i // 5) * 244))
o.save('/tmp/v6/eclairs.jpg', quality=88)
