import pathlib
from playwright.sync_api import sync_playwright
url = (pathlib.Path(__file__).resolve().parent.parent / 'combat-barde.html').as_uri()
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--autoplay-policy=no-user-gesture-required'])
    pg = nav.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True).new_page()
    err = []; pg.on('pageerror', lambda e: err.append(str(e)))
    et = lambda: pg.evaluate('__barde.etat()')
    pg.goto(url); pg.wait_for_timeout(600); pg.click('#bGo'); pg.evaluate('__barde.robot(true,0.03,0.9,0.9)')
    pg.wait_for_timeout(12000); a = et()
    pg.click('#bPause'); pg.wait_for_timeout(800)
    pg.click('#bRegler'); pg.wait_for_timeout(300); pg.click('#bCalibGo')
    for i in range(12): pg.wait_for_timeout(500); pg.click('#zoneCalib')
    pg.wait_for_timeout(1500); res = pg.inner_text('#resCalib'); pg.click('#bCalibFin'); pg.wait_for_timeout(300)
    pg.click('#bCouper'); pg.wait_for_timeout(3000); b = et()
    carte = pg.evaluate("!document.getElementById('carte').classList.contains('cache')")
    pg.wait_for_timeout(6000); c = et()  # (version 4 : plus de carte, la relance part seule)
    pg.click('#bPause'); pg.wait_for_timeout(1000); pg.click('#bReprendre'); pg.wait_for_timeout(5000); d = et()
    print('combat', a['mode'], a['sec'], '| calibrage', res, '| après « couper »', b['mode'], 'carte visible', carte)
    print('relance', c['mode'], c['sec'], c['relance'], '| après pause', d['mode'], d['sec'], d['relance'])
    # défaite à l'acte II puis reprise à l'acte II
    pg.evaluate('__barde.nouvellePartie(1)'); pg.evaluate('__barde.robot(true,0.25,0.2,0.2)')
    for i in range(60):
        pg.wait_for_timeout(1000)
        if pg.evaluate("!document.getElementById('fin').classList.contains('cache')"): break
    txt = pg.inner_text('#bRejouer'); deb = pg.evaluate("!document.getElementById('bDebut').classList.contains('cache')")
    pg.screenshot(path='captures2/defaite.png')
    pg.click('#bRejouer'); pg.wait_for_timeout(1500); e = et()
    print('défaite :', txt, '| bouton début visible', deb, '| reprise à l\'acte', e['acte'], e['etat'], e['coeurs'])
    print('erreurs :', err or 'aucune'); nav.close()
