import os
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist')), 'index.html')
OUT = os.path.join(ICI, '..', 'test', 'integ')
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_context(viewport={'width': 390, 'height': 844}).new_page(); pg.set_default_timeout(6000)
    pg.goto(URL); pg.wait_for_timeout(1200); pg.screenshot(path=f'{OUT}/c0.png')
    pg.click('[data-act=creer]'); pg.wait_for_timeout(600); pg.screenshot(path=f'{OUT}/c1.png')
    pg.click('[data-act=crea-role][data-r=alchimiste]'); pg.wait_for_timeout(600); pg.screenshot(path=f'{OUT}/c2.png')
    pg.mouse.wheel(0, 500); pg.wait_for_timeout(300); pg.screenshot(path=f'{OUT}/c3.png')
    b.close()
