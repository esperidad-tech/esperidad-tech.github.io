#!/usr/bin/env python3
"""Des captures de la v2 (téléphone couché, tablette), en mode seul, avec le pilote automatique.
   python3 tests/voir.py [secondes]  → /tmp/p3v2/*.png ; affiche les erreurs de la page"""
import os, sys
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
PAGE = 'file://' + os.path.join(os.path.dirname(ICI), 'phase3.html')
OUT = os.environ.get('P3_SORTIE', '/tmp/p3v2'); os.makedirs(OUT, exist_ok=True)
duree = float(sys.argv[1]) if len(sys.argv) > 1 else 40
with sync_playwright() as p:
    b = p.chromium.launch()
    for nom, (w, h) in {'tel': (844, 390), 'tab': (1180, 820)}.items():
        ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2, has_touch=True, is_mobile=True)
        pg = ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
        pg.on('console', lambda m: errs.append('console: ' + m.text[:200]) if m.type == 'error' else None)
        pg.goto(PAGE); pg.wait_for_timeout(300)
        pg.screenshot(path=OUT + '/0-debut-' + nom + '.png')
        pg.evaluate("localStorage.clear()")
        pg.evaluate("Object.assign(__p3.reglages, {mode:'seul', role:'barde', debut:2, vie:'court'})")
        pg.evaluate("__p3.demarrer()")
        pg.evaluate("window.__pil = new Pilote({reaction:0.5, relais:0.8}); window.__pilote = function(S){ return __pil.manette(S); }; 0")
        # accélère : avance le temps de la partie à la main
        pg.evaluate("__p3.fige = true")
        for i in range(int(duree / 5)):
            pg.evaluate("(function(){ var S=__p3.S; for (var k=0;k<100;k++){ var e=__pil.manette(S); __p3.P3.pas(S,0.05,e); S.cris.forEach(function(c){ if(c.sym && S.T>c.t+1 && __p3.P3.vivant(S)) __p3.P3.taper(S,c.de,c.sym); }); } __p3.caler(); })()")
            pg.wait_for_timeout(60)
        pg.evaluate("__p3.fige = false"); pg.wait_for_timeout(400)
        pg.screenshot(path=OUT + '/1-combat-' + nom + '.png')
        st = pg.evaluate("(function(){var S=__p3.S; return {T:S.T, etat:S.etat, boss:S.boss, pv:S.h.pv, mort:S.h.mort, infos:__p3.P3.mesInfos(S).length, cris:S.cris.length, stats:S.stats};})()")
        print(nom, st)
        # attendre une bulle de mon villageois
        for k in range(200):
            n = pg.evaluate("(function(){ var S=__p3.S; for (var k=0;k<4;k++){ __p3.P3.pas(S,0.05,null);} __p3.caler(); return __p3.P3.mesInfos(S).length + (S.cris.length ? 10 : 0); })()")
            if n % 10 >= 1 and n >= 10: break
            pg.wait_for_timeout(20)
        pg.wait_for_timeout(200)
        pg.screenshot(path=OUT + '/2-bulles-' + nom + '.png')
        print(nom, 'erreurs :', errs[:5])
        ctx.close()
    b.close()
