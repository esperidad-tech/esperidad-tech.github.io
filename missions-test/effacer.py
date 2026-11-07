import os
from playwright.sync_api import sync_playwright
URL = 'file://' + os.path.join(os.environ['BRUMEVAL_DIST'], 'index.html')
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2).new_page(); pg.set_default_timeout(30000)
    pg.goto(URL)
    pg.click('[data-act=creer]'); pg.click('[data-act=crea-role][data-r=sage]'); pg.click('[data-act=crea-suite]')
    pg.fill('#nom', 'S'); pg.click('[data-act=crea-fin]'); pg.click('[data-act=nouvelle-enquete]'); pg.click('[data-act=commencer]')
    pg.click('[data-act=onglet][data-o=role]'); pg.wait_for_timeout(300)
    el = pg.locator('.tb-effacer'); el.scroll_into_view_if_needed()
    print('couleur :', pg.evaluate("() => getComputedStyle(document.querySelector('.tb-effacer')).color"))
    el.screenshot(path=os.path.dirname(os.path.abspath(__file__)) + '/captures/tableau-effacer.png')
    b.close()
