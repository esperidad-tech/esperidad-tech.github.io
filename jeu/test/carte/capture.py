import sys, os
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(ICI, 'index.html')
erreurs = []
with sync_playwright() as p:
    b = p.chromium.launch()
    for (w, h, nom) in [(390, 844, 'tel'), (800, 1280, 'tab')]:
        pg = b.new_page(viewport={'width': w, 'height': h}, device_scale_factor=2 if w < 500 else 1)
        pg.on('console', lambda m: erreurs.append(m.type + ': ' + m.text) if m.type in ('error', 'warning') else None)
        pg.on('pageerror', lambda e: erreurs.append('pageerror: ' + str(e)))
        pg.goto(URL)
        pg.wait_for_timeout(1200)
        pg.locator('#exemple > svg').screenshot(path=os.path.join(ICI, f'exemple-{nom}.png'))
        if nom == 'tab':
            cartes = pg.locator('#moments .bloc > svg')
            for i in range(cartes.count()):
                cartes.nth(i).screenshot(path=os.path.join(ICI, f'moment-{i}.png'))
            ds = pg.locator('#dessous .bloc > svg')
            for i in range(ds.count()):
                ds.nth(i).screenshot(path=os.path.join(ICI, f'dessous-{i}.png'))
            # test de clic
            pg.locator('#exemple [data-act="lieu"][data-id="lavoir"]').first.click(force=True)
            print('journal:', pg.locator('#journal').inner_text())
            pg.locator('#exemple [data-act="maison"][data-id="L5"]').first.click(force=True)
            print('journal:', pg.locator('#journal').inner_text())
        pg.close()
    b.close()
print('erreurs:', erreurs if erreurs else 'aucune')
