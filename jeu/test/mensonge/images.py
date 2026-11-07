"""Images successives du visage pendant une phrase mensongère (vérifie que tout bouge vraiment).
python3 test/mensonge/images.py [villageois] [signe]  ->  captures/images-<villageois>-<signe>.png"""
import os, sys, io
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw

ICI = os.path.dirname(os.path.abspath(__file__))
pnj = sys.argv[1] if len(sys.argv) > 1 else 'margot'
signe = sys.argv[2] if len(sys.argv) > 2 else 'coin'
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 800, 'height': 1280})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file://' + ICI + '/index.html?niv=10')
    pg.wait_for_timeout(300)
    # une seule phrase, mensongère, pour suivre son déroulé
    pg.evaluate("lancer({sansIntro:true, niv:10, pnj:'%s', signes:['%s'], repliques:[{texte:'Je ne suis jamais allé au moulin, je le jure.', ment:true}]})" % (pnj, signe))
    pg.wait_for_function("() => { const r = document.querySelector('.mjb-mensonge'); return r && r.dataset.phrase === '0'; }")
    sc = pg.evaluate("(() => { const s = document.querySelector('.mjb-mensonge').__scen[0]; return {D:s.D, ev:s.ev.map(x => [x.id, +x.t.toFixed(2), +x.actif.toFixed(2)]), couche:s.couche ? [s.couche.id, +s.couche.t.toFixed(2), +s.couche.actif.toFixed(2)] : null}; })()")
    print(sc)
    images = []
    bb = pg.locator('.mjb-m-visage').bounding_box()
    t0 = pg.evaluate('performance.now()')
    while True:
        etat = pg.evaluate("(() => { const r = document.querySelector('.mjb-mensonge'); return [r.classList.contains('verdict'), r.__signeActif, performance.now()]; })()")
        if etat[0]: break
        png = pg.screenshot(clip=bb)
        images.append((Image.open(io.BytesIO(png)).convert('RGB').resize((200, 200)), round((etat[2] - t0) / 1000, 1), etat[1]))
        pg.wait_for_timeout(120)
    b.close()
cols = 8
rows = (len(images) + cols - 1) // cols
planche = Image.new('RGB', (cols * 206, rows * 226), '#131932')
d = ImageDraw.Draw(planche)
for i, (im, tt, actif) in enumerate(images):
    x, y = (i % cols) * 206, (i // cols) * 226
    planche.paste(im, (x + 3, y + 3))
    d.text((x + 6, y + 206), ('t=%.1f s' % tt) + ('  SIGNE ' + str(actif) if actif else ''), fill='#ff8fb3' if actif else '#a6aed8')
out = os.path.join(ICI, 'captures', 'images-%s-%s.png' % (pnj, signe))
planche.save(out)
print(out, 'erreurs:', errs)
