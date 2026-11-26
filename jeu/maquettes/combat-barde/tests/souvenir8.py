# le niveau de dessin : la page s'en souvient-elle, et retente-t-elle un cran au-dessus une fois sur quatre ? (version 8)
import pathlib
from playwright.sync_api import sync_playwright
url = (pathlib.Path(__file__).resolve().parent.parent / 'combat-barde.html').as_uri()
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--autoplay-policy=no-user-gesture-required'])
    ctx = nav.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pg = ctx.new_page(); err = []; pg.on('pageerror', lambda e: err.append(str(e)))
    pg.goto(url); pg.wait_for_timeout(500); vus = [pg.evaluate('__barde.qualite().n')]
    pg.evaluate("localStorage.setItem('barde-qualite', 0)")
    for i in range(5):
        pg.reload(); pg.wait_for_timeout(500); vus.append(pg.evaluate('__barde.qualite().n'))
    print('niveaux au fil des lancers :', vus, '| mémoire :', pg.evaluate("[localStorage.getItem('barde-qualite'), localStorage.getItem('barde-lancers')]"), '| erreurs :', err or 'aucune'); nav.close()
