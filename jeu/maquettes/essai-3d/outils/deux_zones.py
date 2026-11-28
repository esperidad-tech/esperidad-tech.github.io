import time, sys
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'])
    pg = b.new_page(viewport={'width': 844, 'height': 390}, device_scale_factor=2); err = []
    pg.on('pageerror', lambda e: err.append(str(e))); pg.on('console', lambda m: err.append(m.text[:200]) if m.type == 'error' else None)
    pg.goto('http://localhost:8766/index.html'); pg.evaluate("choisir('barde')")
    for i in range(240):
        if pg.evaluate('!!(window.__essai&&window.__essai.pret)'): break
        time.sleep(0.5)
    for i in range(80):
        if pg.evaluate('!!(__essai.armure.coup && __essai.CP.zones && __essai.CP.zones.gauche.el.readyState >= 2 && __essai.CP.zones.droite.el.readyState >= 2 && __essai.CP.ecl.el.readyState >= 2)'): break
        time.sleep(0.5)
    out = []
    for cote, (x, y) in (('gauche', (6.0, 11.0)), ('droite', (15.0, 11.0))):
        pg.evaluate("window.__pilote = true; __essai.h.x = %f; __essai.h.y = %f; __essai.h.a = -Math.PI/2; __essai.avancer(1.2); __essai.coupDePoing('%s')" % (x, y, cote))
        print(cote, 'dans la zone :', pg.evaluate('__essai.dansZoneCoup(%f, %f)' % (x, y)), ' vise %.2f rad' % pg.evaluate('__essai.armure.vise'))
        t = 0
        for T in (0.9, 1.7, 2.12, 3.0, 3.5, 4.1):
            pg.evaluate('__essai.avancer(%f)' % (T - t)); t = T; time.sleep(0.6); pg.evaluate('__essai.avancer(1/60)'); t += 1 / 60; time.sleep(0.2)
            pg.screenshot(path='/tmp/v6/_z.png'); im = Image.open('/tmp/v6/_z.png').copy().resize((844, 390)); ImageDraw.Draw(im).text((8, 60), '%s %.1f' % (cote, T), fill=(255, 255, 0)); out.append(im)
        print('  projeté :', pg.evaluate('!!__essai.proj'), ' erreurs', err[:3])
        pg.evaluate('__essai.avancer(4.0)')
    b.close()
o = Image.new('RGB', (844 * 3, 390 * 4))
for i, im in enumerate(out): o.paste(im, ((i % 3) * 844, (i // 3) * 390))
o.resize((1266, 780)).save('/tmp/v6/deux-zones.jpg', quality=85)
