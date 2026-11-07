import os
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist')), 'index.html')
OUT = os.path.join(ICI, '..', 'test', 'integ'); os.makedirs(OUT, exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_context(viewport={'width': 390, 'height': 844}).new_page(); pg.set_default_timeout(6000)
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(URL)
    pg.click('[data-act=creer]'); pg.click('[data-act=crea-role][data-r=sage]'); pg.click('[data-act=crea-suite]')
    pg.fill('#nom', 'Siham'); pg.click('[data-act=crea-fin]')
    pg.click('[data-act=ecran][data-e=reglages]'); pg.click('[data-act=mode-test][data-i="2"]'); pg.click('#voile [data-act=confirmer-oui]')
    pg.click('[data-act=nouvelle-enquete]'); pg.click('[data-act=commencer]')
    pg.evaluate("() => { M.P().recus['obj:cle_arch'] = true; }")
    # le Grand Livre se tourne page par page (livre.js) : M.livreAller(id, true) va directement à une page
    pg.click('[data-act=onglet][data-o=role]'); pg.evaluate("() => M.livreAller('livreor', true)"); pg.click('[data-act=ouvrir-page][data-id=livreor]'); pg.wait_for_timeout(300); pg.click('#voile .b-fermer')
    pg.wait_for_timeout(300); pg.screenshot(path=f'{OUT}/livreor.png', full_page=True)
    pg.evaluate("() => M.livreAller('archives', true)"); pg.click('[data-act=ouvrir-page][data-id=archives]'); pg.wait_for_timeout(300); pg.click('#voile .b-fermer')
    pg.evaluate("() => M.livreAller('secret', true)"); pg.click('[data-act=ouvrir-page][data-id=secret]'); pg.wait_for_timeout(600)
    pg.screenshot(path=f'{OUT}/secret-intro.png')
    pg.click('.mj-go'); pg.wait_for_timeout(600); pg.screenshot(path=f'{OUT}/secret-jeu.png')
    print(errs)
    b.close()
