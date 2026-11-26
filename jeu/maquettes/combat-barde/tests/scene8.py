# des captures de la version 8 : un acte donné, quelques moments, sur un appareil donné
import pathlib, sys, time
from playwright.sync_api import sync_playwright
url = (pathlib.Path(__file__).resolve().parent.parent / 'combat-barde.html').as_uri()
acte = int(sys.argv[1]) if len(sys.argv) > 1 else 0
app = sys.argv[2] if len(sys.argv) > 2 else 'iphone'
moments = [float(x) for x in sys.argv[3].split(',')] if len(sys.argv) > 3 else [3, 8, 14]
mega = len(sys.argv) > 4 and sys.argv[4] == 'mega'
APP = {'iphone': dict(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True), 'ipad': dict(viewport={'width': 1024, 'height': 768}, device_scale_factor=2, has_touch=True)}
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--autoplay-policy=no-user-gesture-required'])
    pg = nav.new_context(**APP[app]).new_page(); err = []; pg.on('pageerror', lambda e: err.append(str(e)))
    pg.goto(url); pg.wait_for_timeout(900); pg.screenshot(path=f'vues/v8-{app}-intro.png')
    pg.evaluate(f'__barde.nouvellePartie({acte})'); pg.evaluate('__barde.robot(true,0.04,0.9,0.95)')
    if mega: pg.wait_for_timeout(2500); pg.evaluate("document.getElementById('bPause').click()"); pg.wait_for_timeout(400); pg.evaluate("document.getElementById('bMega').click()")
    t0 = time.time()
    for m in moments:
        pg.wait_for_timeout(max(0, int((m - (time.time() - t0)) * 1000))); pg.screenshot(path=f'vues/v8-{app}-a{acte}-{m:g}{"-mega" if mega else ""}.png')
    print(pg.evaluate('__barde.qualite()'), pg.evaluate('__barde.etat().mode'), 'erreurs :', err or 'aucune'); nav.close()
