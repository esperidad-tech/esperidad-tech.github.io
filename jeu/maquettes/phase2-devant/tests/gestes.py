#!/usr/bin/env python3
"""Les vrais gestes au doigt (écran tactile simulé, téléphone couché) : python3 tests/gestes.py"""
import pathlib
from playwright.sync_api import sync_playwright
ici = pathlib.Path(__file__).resolve().parent.parent
url = (ici / 'phase2-devant.html').as_uri()
ok, ko = [], []
def verif(nom, c, info=''):
    (ok if c else ko).append(nom); print(('OK  ' if c else 'RATÉ') + ' ' + nom + (('  (' + str(info) + ')') if info != '' else ''))
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    ctx = b.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    cdp = ctx.new_cdp_session(pg)
    def doigts(typ, pts): cdp.send('Input.dispatchTouchEvent', {'type': typ, 'touchPoints': [{'x': x, 'y': y, 'id': i} for i, x, y in pts]})
    def centre(sel): return pg.evaluate(f"(() => {{ const r = document.querySelector('{sel}').getBoundingClientRect(); return [r.x + r.width/2, r.y + r.height/2]; }})()")
    pg.goto(url); pg.wait_for_timeout(300); pg.tap('#bGo'); pg.wait_for_timeout(300)
    pg.evaluate("(() => { const S = __p2.S; S.prochaine = 999; S.t3 = {rayon: 999, coque: 999, danse: 999, crev: 999}; })()")
    x0 = pg.evaluate("__p2.S.h.x")
    doigts('touchStart', [(0, 150, 250)])
    for k in range(1, 8): doigts('touchMove', [(0, 150 + k * 10, 250)]); pg.wait_for_timeout(16)
    pg.wait_for_timeout(600)
    x1 = pg.evaluate("__p2.S.h.x")
    verif('le pouce gauche fait courir le héros', x1 - x0 > 1.2, f'{x0:.1f} -> {x1:.1f}')
    g = centre('#bGlace'); doigts('touchStart', [(0, 220, 250), (1, g[0], g[1])]); pg.wait_for_timeout(50)
    verif('on ne lance pas un sort en courant', not pg.evaluate("!!__p2.S.h.lance"))
    doigts('touchEnd', [(0, 220, 250)]); doigts('touchEnd', []); pg.wait_for_timeout(100)
    s = centre('#bSaut'); xa = pg.evaluate("__p2.S.h.x")
    doigts('touchStart', [(0, 150, 250)])
    for k in range(1, 6): doigts('touchMove', [(0, 150 - k * 10, 250)]); pg.wait_for_timeout(16)
    doigts('touchStart', [(0, 100, 250), (1, s[0], s[1])]); pg.wait_for_timeout(450)
    xb = pg.evaluate("__p2.S.h.x"); doigts('touchEnd', [])
    verif('deux doigts : le saut part dans la direction du pouce', xa - xb > 2.5, f'{xa:.1f} -> {xb:.1f}')
    pg.wait_for_timeout(300)
    pg.tap('#bFeu'); pg.wait_for_timeout(4300)
    verif('immobile : la boule de feu part et fait 50', pg.evaluate("__p2.S.vie") == 950, pg.evaluate("__p2.S.vie"))
    pg.evaluate("__p2.S.h.pv = 40"); pg.tap('#bSoin'); pg.wait_for_timeout(2200)
    verif('le soin rend 50', pg.evaluate("__p2.S.h.pv") == 90)
    # toucher un réparateur pour le viser
    pg.evaluate("(() => { const S = __p2.S; S.reps = [{x: 11, y: 6.5}]; })()"); pg.wait_for_timeout(50)
    rx, ry = pg.evaluate("(() => { const v = __p2.vue; return [v.ox + 11 * v.T, v.oy + 6.5 * v.T * 0.62]; })()")
    pg.mouse.click(rx, ry)  # un toucher bref
    doigts('touchStart', [(0, rx, ry)]); doigts('touchEnd', []); pg.wait_for_timeout(50)
    verif('toucher un réparateur : il devient la cible', pg.evaluate("__p2.S.cible === __p2.S.reps[0]"))
    pg.tap('#bGlace'); pg.wait_for_timeout(2600)
    verif('le javelot le casse', pg.evaluate("__p2.S.reps.length") == 0)
    # la bulle, le Pisteur, le code
    pg.evaluate("__p2.P2.symboleTout(__p2.S)"); pg.wait_for_timeout(300)
    verif('le symbole : la bulle, le bouton du code', pg.is_visible('#bCode'))
    pg.tap('#bPisteur'); pg.wait_for_timeout(100); cri = pg.evaluate("__p2.S.cri")
    pg.tap('#bCode'); pg.wait_for_timeout(100)
    verif('la fenêtre du code : le combat au ralenti', pg.evaluate("__p2.S.code.ouvert && __p2.S.lent < 1"))
    for sym in cri: pg.locator('#fen .clavier button', has_text=sym).first.tap(); pg.wait_for_timeout(60)
    verif('le bon code : la bulle tombe, tiers suivant', pg.evaluate("__p2.S.phase") == 'transfo')
    pg.wait_for_timeout(2800)
    verif('le deuxième tiers commence', pg.evaluate("__p2.S.tiers === 2 && __p2.S.phase === 'combat'"))
    # la mort
    pg.evaluate("(() => { const S = __p2.S; S.h.pv = 10; S.ombres = [{x: S.h.x, y: S.h.y, t: 1.9}]; })()"); pg.wait_for_timeout(300)
    verif('mort : les boutons grisés, 10 s', pg.evaluate("__p2.S.h.mort > 9") and 'eteint' in pg.get_attribute('#bGlace', 'class'))
    b.close()
print(f'{len(ok)} sur {len(ok) + len(ko)} | erreurs de la page : {errs or "aucune"}')
