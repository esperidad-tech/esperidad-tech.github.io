#!/usr/bin/env python3
"""Des captures de la v3 (grand iPhone couché, petit iPhone couché, tablette), en mode seul, avec le pilote automatique.
   python3 tests/voir.py [secondes]  → /tmp/p3v3/*.png ; affiche les erreurs de la page"""
import os, sys
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
PAGE = 'file://' + os.path.join(os.path.dirname(ICI), 'phase3.html')
OUT = os.environ.get('P3_SORTIE', '/tmp/p3v3'); os.makedirs(OUT, exist_ok=True)
duree = float(sys.argv[1]) if len(sys.argv) > 1 else 40
AVANCE = "(function(n){ var S=__p3.S; for (var k=0;k<n;k++){ var e=__pil.manette(S); __p3.P3.pas(S,0.05,e); S.cris.forEach(function(c){ if(c.sym && S.T>c.t+1 && __p3.P3.vivant(S)) __p3.P3.taper(S,c.de,c.sym); }); } __p3.caler(); })"
with sync_playwright() as p:
    b = p.chromium.launch()
    for nom, (w, h) in {'max': (932, 430), 'tel': (852, 393), 'tab': (1180, 820)}.items():
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
        pg.evaluate("__p3.fige = true")
        for i in range(int(duree / 5)):
            pg.evaluate(AVANCE + "(100)"); pg.wait_for_timeout(40)
        pg.evaluate("__p3.fige = false"); pg.wait_for_timeout(300)
        pg.screenshot(path=OUT + '/1-combat-' + nom + '.png')
        st = pg.evaluate("(function(){var S=__p3.S; return {T:S.T, etat:S.etat, boss:S.boss, pv:S.h.pv, mort:S.h.mort, bulle:S.bulle && S.bulle.cle, stats:S.stats};})()")
        print(nom, st)
        # une bulle de chaque sorte : mon villageois (une info pour un ami), un robot (une info pour moi), l'endroit sûr
        pg.evaluate("__p3.fige = true")
        for sorte, test in [('villageois', "b.type==='villageois' && b.x.quoi!=='zone' && b.x.quoi!=='mega'"), ('robot', "b.type==='ami' && b.x && b.x.quoi!=='zone'"), ('zone', "b.x && b.x.quoi==='zone'"), ('mega', "b.x && b.x.quoi==='mega'")]:
            ok = False
            for k in range(600):
                ok = pg.evaluate("(function(){ var S=__p3.S; for (var k=0;k<2;k++){ " + AVANCE + "(1); var b=S.bulle; if (b && (S.T-b.debut)>0.3 && (" + test + ")) return true; } return false; })()")
                if ok: break
            pg.wait_for_timeout(120)
            pg.screenshot(path=OUT + '/2-bulle-' + sorte + '-' + nom + '.png')
            print(nom, sorte, 'trouvée' if ok else 'PAS trouvée', pg.evaluate("__p3.S.T"))
        pg.evaluate("__p3.fige = false")
        print(nom, 'erreurs :', errs[:5])
        ctx.close()
    b.close()
