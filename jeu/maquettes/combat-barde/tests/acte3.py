# l'acte III sur la durée (le souci de l'iPhone de Romain, 24 nov., 22 h 25) : un robot paresseux laisse venir tous les golems dans tous
# leurs états ; on compte les images de golems repeintes pendant le jeu, et les images par seconde, seconde par seconde
import pathlib, sys, time
from playwright.sync_api import sync_playwright
url = (pathlib.Path(__file__).resolve().parent.parent / 'combat-barde.html').as_uri() + (sys.argv[2] if len(sys.argv) > 2 else '')
acte = int(sys.argv[1]) if len(sys.argv) > 1 else 2
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--autoplay-policy=no-user-gesture-required', '--disable-gpu'])
    pg = nav.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=3, is_mobile=True, has_touch=True).new_page(); err = []; pg.on('pageerror', lambda e: err.append(str(e)))
    cdp = pg.context.new_cdp_session(pg); cdp.send('Emulation.setCPUThrottlingRate', {'rate': 2})
    pg.goto(url); pg.wait_for_timeout(2500); pg.evaluate(f'__barde.nouvellePartie({acte})'); pg.evaluate('__barde.robot(true,0.05,0.74,0.9)')
    suite = []
    for i in range(14):
        pg.wait_for_timeout(5000); q = pg.evaluate('__barde.qualite()'); e = pg.evaluate('__barde.etat()'); suite.append((q['cuits'], q.get('cuites'), q['ips'], q['n'], e['mode'], e['coeurs']))
        if e['etat'] != 'jeu': break
    pg.screenshot(path='vues/acte3.png')
    print('toutes les 5 s (en réserve, peintes en tout, images/s, niveau, mode, cœurs) :'); print(suite); print('erreurs :', err or 'aucune'); nav.close()
