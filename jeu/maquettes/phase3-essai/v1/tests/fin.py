#!/usr/bin/env python3
"""La fin de partie et les manches dures, dans un navigateur.   python3 tests/fin.py
  1. départ à la manche 7 sur un téléphone : captures des cartes en même temps ;
  2. le boss tombe : le symbole s'affiche, le héros passe en soutien (plus d'éléments), sa case se remplit ;
  3. on tape les trois autres symboles : la victoire."""
import os, sys
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
PAGE = 'file://' + os.path.join(os.path.dirname(ICI), 'phase3-essai.html')
SORTIE = os.environ.get('P3_SORTIE', '/tmp/p3'); os.makedirs(SORTIE, exist_ok=True)
soucis = []
def non(c, m):
    if not c: soucis.append(m); print('  ✗', m)
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, has_touch=True, is_mobile=True)
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(PAGE); pg.wait_for_timeout(200)
    pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_timeout(200)
    pg.locator('.heros-choix').nth(3).tap(force=True)
    pg.locator('.pave button', has_text='5').tap(force=True)
    pg.locator('.choix button', has_text='7').tap(force=True)
    pg.locator('button.jaune', has_text='Prêt').tap(force=True)
    pg.locator('button.go').tap(force=True)
    vus = 0
    for k in range(60):
        pg.wait_for_timeout(250)
        n = pg.locator('.carte').count()
        if n >= 2 and vus < 2:
            vus += 1; pg.screenshot(path=SORTIE + '/8-manche7-deux-cartes-%d.png' % vus)
    non(vus >= 1, 'à la manche 7, une tablette a parfois deux cartes en même temps')
    # le boss tombe
    pg.evaluate("__p3.P.joueur.mort=false; __p3.P.joueur.vie=100; __p3.P.joueur.boss=1; __p3.P.joueur.faible={elem:'tout',part:'tout'}")
    pg.locator('.elem').nth(1).tap(force=True); pg.locator('.part-zone[data-p="2"]').tap(force=True)
    pg.wait_for_timeout(1500)
    non(pg.evaluate("__p3.P.joueur.boss") == 0, 'le boss tombe')
    pg.screenshot(path=SORTIE + '/9-symbole.png')
    mon = pg.evaluate("__p3.P3.SYMB[__p3.P.monSymbole()][1]")
    non(pg.locator('.case[data-r="sage"]').text_content() == mon, 'ma case a mon symbole')
    non(pg.locator('.elem').first.is_disabled(), 'en soutien, plus d\'éléments')
    for ro in ['pisteur', 'alchimiste', 'barde']:
        i = pg.evaluate("__p3.P.symboles['" + ro + "']")
        pg.locator('.case[data-r="' + ro + '"]').tap(force=True); pg.wait_for_timeout(150)
        pg.locator('.symboles button').nth(i).tap(force=True); pg.wait_for_timeout(150)
    pg.wait_for_timeout(300)
    non(pg.locator('.victoire').count() == 1, 'la victoire')
    pg.screenshot(path=SORTIE + '/10-victoire.png')
    non(not errs, 'erreurs : ' + str(errs[:5]))
    b.close()
print('SOUCIS', len(soucis)); sys.exit(1 if soucis else 0)
