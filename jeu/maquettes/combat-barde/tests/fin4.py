import pathlib, time
from playwright.sync_api import sync_playwright
url = (pathlib.Path(__file__).resolve().parent.parent / 'combat-barde.html').as_uri()
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--autoplay-policy=no-user-gesture-required'])
    pg = nav.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True).new_page()
    err = []; pg.on('pageerror', lambda e: err.append(str(e)))
    pg.goto(url); pg.wait_for_timeout(600); pg.evaluate('__barde.nouvellePartie(3)'); pg.evaluate('__barde.robot(true,0.04,0.9,0.95)')
    pg.wait_for_timeout(4000); pg.click('#bPause'); pg.wait_for_timeout(300); pg.click('#bCouper')
    t0 = time.time(); vus = set(); carte = False
    while time.time() - t0 < 130:
        pg.wait_for_timeout(1000); e = pg.evaluate('__barde.etat()')
        carte = carte or pg.evaluate("!document.getElementById('carte').classList.contains('cache')")
        cle = (e['mode'], e['sec']); el = int(time.time() - t0)
        if cle not in vus or (e['sec'] in ('TD', 'TM') and el % 8 == 0):
            vus.add(cle); pg.screenshot(path=f'captures3/fin-{el:03d}-{e["mode"]}-{e["sec"]}.png'); print(el, cle, e['etat'])
        if e['etat'] == 'fin': pg.wait_for_timeout(2500); pg.screenshot(path='captures3/fin-ecran.png'); print('écran de fin'); break
    print('carte vue :', carte, '| erreurs :', err or 'aucune'); nav.close()
