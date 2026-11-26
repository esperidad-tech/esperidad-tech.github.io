#!/usr/bin/env python3
"""Les vrais gestes au doigt (écran tactile simulé) : python3 tests/gestes.py
glisser le doigt déplace le héros ; deux doigts à la fois (glisser + bouton) ; la potion ; couper ; le code tapé touche par touche."""
import pathlib
from playwright.sync_api import sync_playwright
ici = pathlib.Path(__file__).resolve().parent.parent
url = (ici / 'phase2-devant.html').as_uri()
ok, ko = [], []
def verif(nom, cond, info=''):
    (ok if cond else ko).append(nom); print(('OK  ' if cond else 'RATÉ') + ' ' + nom + (' ' + str(info) if info else ''))
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=3, is_mobile=True, has_touch=True)
    pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    cdp = ctx.new_cdp_session(pg)
    def touches(typ, pts):
        cdp.send('Input.dispatchTouchEvent', {'type': typ, 'touchPoints': [{'x': x, 'y': y, 'id': i} for i, x, y in pts]})
    pg.goto(url); pg.wait_for_timeout(300)
    pg.tap('#bGo'); pg.wait_for_timeout(300)
    pg.evaluate("__p2.S.attente = 999")   # l'armure ne fait rien pendant les essais de gestes
    x0 = pg.evaluate("__p2.S.h.x")
    touches('touchStart', [(0, 150, 500)])
    for k in range(1, 11): touches('touchMove', [(0, 150 + k * 6, 500)]); pg.wait_for_timeout(16)
    touches('touchEnd', []); pg.wait_for_timeout(400)
    x1 = pg.evaluate("__p2.S.h.x")
    verif('glisser à droite déplace le héros à droite', x1 - x0 > 60, f'{x0:.0f} -> {x1:.0f}')
    # deux doigts : on glisse ET on garde le bouton d'attaque (façon « bouton »)
    pg.evaluate("__p2.S.reg.facon = 'bouton'"); pg.wait_for_timeout(100)
    bt = pg.evaluate("(() => { const r = document.getElementById('bTape').getBoundingClientRect(); return [r.x + r.width/2, r.y + r.height/2]; })()")
    vie0 = pg.evaluate("__p2.S.vie")
    touches('touchStart', [(0, 200, 500)]); touches('touchStart', [(0, 200, 500), (1, bt[0], bt[1])])
    for k in range(1, 30): touches('touchMove', [(0, 200 - k * 3, 500), (1, bt[0], bt[1])]); pg.wait_for_timeout(16)
    pg.wait_for_timeout(1500)
    vie1 = pg.evaluate("__p2.S.vie"); x2 = pg.evaluate("__p2.S.h.x")
    touches('touchEnd', [])
    verif('deux doigts : le héros bouge et tape en même temps', vie1 < vie0 and x2 < x1 - 40, f'vie {vie0:.0f} -> {vie1:.0f}, x {x1:.0f} -> {x2:.0f}')
    # la potion : immobile, puis toute la vie
    pg.evaluate("__p2.S.h.pv = 30"); pg.tap('#bPotion'); pg.wait_for_timeout(2900)
    verif('la potion remet toute la vie après 2,5 s immobile', pg.evaluate("__p2.S.h.pv") == 100)
    pg.evaluate("__p2.S.h.pv = 30"); pg.tap('#bPotion'); pg.wait_for_timeout(300)
    touches('touchStart', [(0, 200, 500)])
    for k in range(1, 8): touches('touchMove', [(0, 200 + k * 8, 500)]); pg.wait_for_timeout(16)
    touches('touchEnd', []); pg.wait_for_timeout(2600)
    verif('bouger coupe la potion', pg.evaluate("__p2.S.h.pv") == 30)
    # couper le gros coup
    pg.evaluate("(() => { const S = __p2.S; S.att = {type:'grosCoup', t:1, prep:3.5, fin:4.1}; S.couperT = 0; })()")
    pg.tap('#bCouper'); pg.wait_for_timeout(100)
    verif('le bouton coupe le gros coup', pg.evaluate("__p2.S.att === null && __p2.S.couperT > 11"))
    # la bulle, le cri, le code tapé au doigt
    pg.evaluate("(() => { const S = __p2.S; S.h.pv = 100; __p2.P2.symboleTout(S); })()"); pg.wait_for_timeout(300)
    verif('le symbole : la bulle', pg.evaluate("__p2.S.phase") == 'bulle')
    pg.tap('#bPisteur'); pg.wait_for_timeout(100)
    cri = pg.evaluate("__p2.S.cri")
    verif('le bouton du Pisteur donne un code', cri is not None and len(cri) == 3, cri)
    pg.tap('#bCode'); pg.wait_for_timeout(100)
    verif('la fenêtre du code s\'ouvre, le combat ralentit', pg.evaluate("__p2.S.code.ouvert && __p2.S.lent < 1"))
    hx = pg.evaluate("__p2.S.h.x")
    touches('touchStart', [(0, 200, 600)])
    for k in range(1, 8): touches('touchMove', [(0, 200 + k * 10, 600)]); pg.wait_for_timeout(16)
    touches('touchEnd', []); pg.wait_for_timeout(200)
    verif('pendant qu\'on tape, on ne dirige plus son héros', abs(pg.evaluate("__p2.S.h.x") - hx) < 1)
    faux = [s for s in pg.evaluate("__p2.P2.SYMS") if s != cri[0]][0]
    for s in [faux, cri[1], cri[2]]:
        pg.locator('#fen .clavier button', has_text=s).first.tap(); pg.wait_for_timeout(80)
    verif('un mauvais code : la fenêtre se ferme, vitesse normale', pg.evaluate("!__p2.S.code.ouvert && __p2.S.lent === 1 && __p2.S.stats.mauvaisCodes === 1"))
    pg.wait_for_timeout(800)
    pg.evaluate("__p2.S.h.invul = 99")
    pg.tap('#bCode'); pg.wait_for_timeout(100)
    for s in cri:
        pg.locator('#fen .clavier button', has_text=s).first.tap(); pg.wait_for_timeout(80)
    verif('le bon code : la pièce tombe, la forme 2 arrive', pg.evaluate("__p2.S.phase") == 'transfo')
    pg.wait_for_timeout(3800)
    verif('forme 2, avec les boutons feu et glace', pg.evaluate("__p2.S.forme === 2 && __p2.S.phase === 'combat'") and pg.is_visible('#bFeu') and pg.is_visible('#bGlace'))
    # mort sous la bulle : le bouton du code grisé avec son chiffre
    pg.evaluate("(() => { const S = __p2.S; S.h.invul = 0; __p2.P2.symboleTout(S); S.h.pv = 1; S.danse.attente = 0; S.danse.pos = 0; S.danse.t = 0; S.danse.T = 1; S.h.x = 380; })()")
    pg.wait_for_timeout(3200)
    txt = pg.inner_text('#bCode .nb')
    verif('mort sous la bulle : bouton du code grisé, avec un chiffre', pg.evaluate("document.getElementById('bCode').classList.contains('bloque')") and txt.strip().isdigit(), txt)
    b.close()
print(f'{len(ok)} sur {len(ok) + len(ko)}', '| erreurs de la page :', errs or 'aucune')
