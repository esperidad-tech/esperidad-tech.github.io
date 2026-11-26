import pathlib, time
from playwright.sync_api import sync_playwright
url = (pathlib.Path(__file__).resolve().parent.parent / 'combat-barde.html').as_uri()
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--autoplay-policy=no-user-gesture-required'])
    pg = nav.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True).new_page()
    err = []; pg.on('pageerror', lambda e: err.append(str(e)))
    pg.goto(url); pg.wait_for_timeout(600); pg.click('#bGo'); pg.evaluate('__barde.robot(true,0.05,0.9,0.55)')
    pg.wait_for_timeout(3000); pg.click('#bPause'); pg.wait_for_timeout(300); pg.click('#bCouper'); pg.wait_for_timeout(2500)
    pg.click('#bRelancer'); t0 = time.time(); vus = set()
    while time.time() - t0 < 75:
        pg.wait_for_timeout(700); e = pg.evaluate('__barde.etat()')
        r = e['relance'] or {}; cle = (e['mode'], r.get('k'), r.get('essai'))
        if cle not in vus: vus.add(cle); pg.screenshot(path=f"captures3/rel-{int(time.time()-t0)}s-k{r.get('k')}-e{r.get('essai')}.png"); print(int(time.time()-t0), cle, e['sec'], e['st']['cales'])
    print('erreurs :', err or 'aucune'); nav.close()
