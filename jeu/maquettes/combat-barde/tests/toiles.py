# combien de toiles la page crée-t-elle pendant le jeu ? (une page saine n'en crée presque plus une fois l'acte lancé)
import pathlib, sys
from playwright.sync_api import sync_playwright
page, acte = sys.argv[1], int(sys.argv[2])
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--autoplay-policy=no-user-gesture-required', '--disable-gpu'])
    pg = nav.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=3, is_mobile=True, has_touch=True).new_page()
    pg.add_init_script("window.__toiles = 0; const _c = document.createElement.bind(document); document.createElement = function (n) { if (String(n).toLowerCase() === 'canvas') window.__toiles++; return _c.apply(document, arguments); };")
    pg.goto(pathlib.Path(page).resolve().as_uri()); pg.wait_for_timeout(2500)
    for a in range(acte + 1):   # on joue un peu chaque acte avant, comme dans une vraie partie : les images s'accumulent
        pg.evaluate(f'__barde.nouvellePartie({a})'); pg.evaluate('__barde.robot(true,0.05,0.74,0.9)'); pg.wait_for_timeout(25000 if a < acte else 1000)
    suite = []
    for i in range(10):
        n0 = pg.evaluate('window.__toiles'); pg.wait_for_timeout(5000); suite.append(pg.evaluate('window.__toiles') - n0)
    print(page, '| acte', acte + 1, '| toiles créées toutes les 5 s :', suite, '| en réserve :', pg.evaluate('__barde.qualite().cuits')); nav.close()
