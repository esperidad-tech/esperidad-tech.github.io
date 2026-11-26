import pathlib
from playwright.sync_api import sync_playwright
url = (pathlib.Path(__file__).resolve().parent.parent / 'combat-barde.html').as_uri()
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--autoplay-policy=no-user-gesture-required'])
    pg = nav.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True).new_page()
    err = []; pg.on('pageerror', lambda e: err.append(str(e)))
    pg.goto(url); pg.wait_for_timeout(600); pg.evaluate('__barde.nouvellePartie(3)'); pg.evaluate('__barde.robot(true,0.05,0.7,0.9)')
    pg.wait_for_timeout(6000); pg.click('#bPause'); pg.wait_for_timeout(300); pg.click('#bMega')
    for i in range(10):
        pg.wait_for_timeout(1500); e = pg.evaluate('__barde.etat()')
        if e['mega']: pg.screenshot(path=f'captures3/mega-{i}.png'); print(i, e['sec'], e['coeurs'], e['niveau']); 
    print('erreurs :', err or 'aucune'); nav.close()
