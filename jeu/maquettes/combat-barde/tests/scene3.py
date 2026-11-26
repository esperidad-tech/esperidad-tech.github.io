import pathlib
from playwright.sync_api import sync_playwright
url = (pathlib.Path(__file__).resolve().parent.parent / 'combat-barde.html').as_uri()
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--autoplay-policy=no-user-gesture-required'])
    pg = nav.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True).new_page()
    err = []; pg.on('pageerror', lambda e: err.append(str(e)))
    pg.goto(url); pg.wait_for_timeout(600); pg.evaluate('__barde.nouvellePartie(2)'); pg.evaluate('__barde.robot(true, 0.04, 0.45, 0.9)')
    for t in range(14, 46, 4):
        pg.wait_for_timeout(4000)
        st = pg.evaluate("({f: __barde.G.sbires.filter(s=>s.type==='fonceur').map(s=>s.etat+(s.gele?'*':'')), l: __barde.G.sbires.filter(s=>s.type==='lanceur').length, p: __barde.G.proj.length, c: __barde.G.coeurs})")
        print(t, st)
        pg.screenshot(path=f'captures2/scene3-{t}s.png')
    print('erreurs :', err or 'aucune'); nav.close()
