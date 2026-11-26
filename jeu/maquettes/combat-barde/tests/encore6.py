import pathlib, time
from playwright.sync_api import sync_playwright
url = (pathlib.Path(__file__).resolve().parent.parent / 'combat-barde.html').as_uri()
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--autoplay-policy=no-user-gesture-required'])
    pg = nav.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True).new_page()
    err = []; pg.on('pageerror', lambda e: err.append(str(e)))
    pg.goto(url); pg.wait_for_timeout(600); pg.evaluate('__barde.nouvellePartie(3)'); pg.evaluate('__barde.robot(true,0.04,0.9,0.95)')
    pg.wait_for_timeout(4000); pg.click('#bPause'); pg.wait_for_timeout(300); pg.click('#bCouper')
    t0 = time.time(); n = 0
    while time.time() - t0 < 130:
        pg.wait_for_timeout(250); e = pg.evaluate('__barde.etat()')
        if e['sec'] in ('TR', 'TN') and n < 8: pg.screenshot(path=f'captures3/encore-{n}.png'); n += 1
        if n >= 8: break
    print('captures :', n, '| erreurs :', err or 'aucune'); nav.close()
