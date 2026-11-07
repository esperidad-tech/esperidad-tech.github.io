import os
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist')), 'index.html')
OUT = os.path.join(ICI, '..', 'test', 'integ'); os.makedirs(OUT, exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch()
    for role, lieu, pt in [('pisteur', 'mairie', 'massif')]:
        pg = b.new_context(viewport={'width': 800, 'height': 1280}).new_page(); pg.set_default_timeout(6000)
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(URL)
        pg.click('[data-act=creer]'); pg.click(f'[data-act=crea-role][data-r={role}]'); pg.click('[data-act=crea-suite]')
        pg.fill('#nom', 'Naim'); pg.click('[data-act=crea-fin]')
        pg.click('[data-act=nouvelle-enquete]'); pg.click('[data-act=commencer]')
        pg.click('[data-act=onglet][data-o=carte]'); pg.click(f'#carte-ici g.ca-lieu[data-lieu={lieu}] .ca-etiq-lieu'); pg.click(f'#voile [data-act=explorer]'); pg.click(f'#voile [data-act=point][data-id={pt}]')
        pg.wait_for_timeout(700); pg.screenshot(path=f'{OUT}/{role}-intro.png')
        pg.click('.mj-go'); pg.wait_for_timeout(1500); pg.screenshot(path=f'{OUT}/{role}-jeu.png')
        print(role, errs)
    b.close()
