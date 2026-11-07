import sys, os
from playwright.sync_api import sync_playwright
from PIL import Image
base = os.path.dirname(os.path.abspath(__file__))
url = 'file://' + base + '/index.html?anim=0'
out = sys.argv[1] if len(sys.argv) > 1 else base
sections = sys.argv[2].split(',') if len(sys.argv) > 2 else None
with sync_playwright() as p:
    b = p.chromium.launch()
    for (w, hgt, nom, dsf) in [(800, 1280, 'tablette', 1), (390, 844, 'tel', 2)]:
        pg = b.new_page(viewport={'width': w, 'height': hgt}, device_scale_factor=dsf)
        errs = []
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(url)
        pg.wait_for_timeout(600)
        print(nom, 'erreurs:', errs)
        full = os.path.join(out, f'_full-{nom}.png')
        pg.screenshot(path=full, full_page=True)
        im = Image.open(full)
        ids = sections or ['roles','ages','cf','cm','niveaux','bustes','pnj','humeurs']
        for sid in ids:
            el = pg.query_selector('#' + sid)
            if el:
                bb = el.bounding_box()
                im.crop((int(bb['x']*dsf), int(bb['y']*dsf), int((bb['x']+bb['width'])*dsf), int((bb['y']+bb['height'])*dsf))).save(os.path.join(out, f'{nom}-{sid}.png'))
        pg.close()
    b.close()
