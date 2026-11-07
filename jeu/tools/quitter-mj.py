"""Quitter le jeu pendant un mini-jeu le fait compter comme raté (Romain, 5 novembre, 12 h 31 ; moteur-actions.js : P.mjOuvert, M.rateQuitte).
Pisteur, enquête 2, l'après-midi : la clairière, « Le champ de coquelicots » (le mini-jeu des traces) ; on recharge la page en plein jeu.
Usage : python3 tools/quitter-mj.py   (BRUMEVAL_DIST=/chemin) ; termine par « ÉCHECS [] »."""
import os
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist')), 'index.html')
echecs, erreurs = [], []
def ok(c, q):
    print(('  ✓ ' if c else '  ✗ ') + q)
    if not c: echecs.append(q)
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_context(viewport={'width': 390, 'height': 844}).new_page(); pg.set_default_timeout(8000)
    pg.on('pageerror', lambda e: erreurs.append(str(e)))
    pg.goto(URL)
    pg.click('[data-act=creer]'); pg.click('[data-act=crea-role][data-r=pisteur]'); pg.click('[data-act=crea-suite]'); pg.fill('#nom', 'Naim'); pg.click('[data-act=crea-fin]')
    pg.evaluate("() => { M.UI.ecran = 'reglages'; M.render(); }"); pg.click('[data-act=mode-test][data-i="2"]'); pg.click('#voile [data-act=confirmer-oui]')
    pg.click('[data-act=nouvelle-enquete]'); pg.click('[data-act=commencer]'); pg.wait_for_timeout(300)
    if pg.evaluate('() => !!(M.tutoTalentForce && M.tutoTalentForce())'):
        pg.click('.b-entete .b-et-heros', force=True); pg.wait_for_timeout(200); pg.click('[data-act=hr-arbre]', force=True); pg.wait_for_timeout(200)
        tid = pg.evaluate("() => DONNEES.TALENTS_PAR_ROLE[M.role()][2][0]")
        pg.click(f'[data-act=hr-talent][data-id={tid}]', force=True); pg.wait_for_timeout(150); pg.click('#voile [data-act=talent]', force=True); pg.wait_for_timeout(300)
    pg.evaluate("() => { var P = M.P(); P.moment = 1; P.actions = M.actionsMax(); P.onglet = 'carte'; M.UI.ecran = 'enquete'; M.UI.modal = null; M.sauver(); M.render(); }")
    pg.wait_for_timeout(500)
    act0 = pg.evaluate('() => M.P().actions')
    pg.evaluate("() => { var e = document.querySelector('#carte-ici [data-act=lieu][data-id=clairiere]'); e.dispatchEvent(new MouseEvent('click', {bubbles:true})); }")
    pg.wait_for_timeout(600)
    pg.click('#voile [data-act=explorer]'); pg.wait_for_timeout(500)
    pg.click('#voile [data-act=point][data-id=champ]'); pg.wait_for_timeout(500)
    pg.click('#voile [data-act=mj-go]'); pg.wait_for_timeout(500)
    if pg.locator('#voile [data-act=mj-potion]').count(): pg.click('#voile [data-act=mj-potion][data-id=""]'); pg.wait_for_timeout(300)
    if pg.locator('#voile [data-act=mj-auto]').count(): pg.click('#voile [data-act=mj-auto][data-oui=""]'); pg.wait_for_timeout(300)
    ok(pg.evaluate("() => !document.getElementById('mj-plein').hidden"), 'le mini-jeu des traces est lancé')
    ok(pg.evaluate("() => !!M.P().mjOuvert && M.P().mjOuvert.act === 'point'"), 'il est noté comme ouvert (P.mjOuvert)')
    act1 = pg.evaluate('() => M.P().actions')
    pg.reload(); pg.wait_for_timeout(1500)
    ok(pg.evaluate("() => !M.P().mjOuvert"), 'au retour : plus de mini-jeu ouvert')
    ok(pg.evaluate("() => (M.P().essais || {})['pisteur:clairiere:champ'] === 1"), 'au retour : un essai raté de compté')
    ok(pg.evaluate("() => M.P().vus['pisteur:clairiere:champ'] === 'rate' || !!M.P().vus['pisteur:clairiere:champ:partiel']"), 'au retour : le point est « raté » (à l\'E2, un seul essai : l\'indice partiel)')
    ok(pg.evaluate("() => M.P().actions") == act1, f'pas d\'action dépensée deux fois ({act0} → {act1} → {pg.evaluate("() => M.P().actions")})')
    ok(pg.evaluate("() => !!(M.UI.modal && M.UI.modal.type === 'decouverte' && M.UI.modal.rate)"), 'la fenêtre « Raté » s\'ouvre, avec la dernière chance')
    pg.screenshot(path=os.path.join(ICI, '..', 'test', 'quitter-mj.png'))
    b.close()
print('ÉCHECS', echecs)
print('ERREURS', erreurs[:5])
