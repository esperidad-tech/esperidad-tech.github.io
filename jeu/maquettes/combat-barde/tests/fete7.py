# la fête de la fin : les six boutons pendant le tube, les éclairs sur Grosbec
import pathlib, time
from playwright.sync_api import sync_playwright
url = (pathlib.Path(__file__).resolve().parent.parent / 'combat-barde.html').as_uri()
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--autoplay-policy=no-user-gesture-required'])
    pg = nav.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True).new_page()
    err = []; pg.on('pageerror', lambda e: err.append(str(e)))
    pg.goto(url); pg.wait_for_timeout(600); pg.evaluate('__barde.nouvellePartie(3)'); pg.evaluate('__barde.robot(true,0.04,0.9,0.95)')
    pg.wait_for_timeout(4000); pg.click('#bPause'); pg.wait_for_timeout(300); pg.click('#bCouper')
    t0 = time.time(); vu = False; n = 0; presses = 0
    while time.time() - t0 < 140:
        pg.wait_for_timeout(200); e = pg.evaluate('__barde.etat()')
        visible = pg.evaluate("!document.getElementById('jam').classList.contains('cache')")
        if visible and not vu:
            vu = True; pg.wait_for_timeout(1500); pg.screenshot(path='captures3/fete-00-boutons.png'); print('boutons visibles à', e['sec'])
        if visible and e['sec'] in ('TD', 'TM', 'TN', 'TF') and n < 12:
            i = n % 6; pg.locator('#jam .jam').nth(i).dispatch_event('pointerdown'); presses += 1
            pg.wait_for_timeout(120 if i in (1, 2, 4) else 250); pg.screenshot(path=f'captures3/fete-{n + 1:02d}-bouton{i}.png'); n += 1
        elif visible and e['sec'] in ('TM', 'TN'):
            for i in range(6): pg.locator('#jam .jam').nth(i).dispatch_event('pointerdown'); presses += 1
        if e['etat'] == 'fin': pg.wait_for_timeout(2500); pg.screenshot(path='captures3/fete-fin.png'); print('écran de fin ; boutons cachés :', pg.evaluate("document.getElementById('jam').classList.contains('cache')")); break
    print('appuis :', presses, '| erreurs :', err or 'aucune'); nav.close()
