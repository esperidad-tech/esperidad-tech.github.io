#!/usr/bin/env python3
"""Des captures de la v4 (grand iPhone couché, petit iPhone couché, tablette), en mode seul, avec le pilote automatique.
   python3 tests/voir.py [tailles]  → /tmp/p3v4/*.png ; affiche les erreurs de la page
   Les moments : le combat ; la partie faible qui bouge (sur MA tablette) ; un coup juste ; un rebond ; la grosse zone (l'annonce, la frappe) ;
   la méga attaque (la charge chez celui qui prévient) ; la charge de l'attaque ; le tambour du premier combat ; le film."""
import os, sys
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
PAGE = 'file://' + os.path.join(os.path.dirname(ICI), 'phase3.html')
OUT = os.environ.get('P3_SORTIE', '/tmp/p3v4'); os.makedirs(OUT, exist_ok=True)
TAILLES = {'max': (932, 430), 'tel': (852, 393), 'tab': (1180, 820)}
quoi = sys.argv[1].split(',') if len(sys.argv) > 1 else list(TAILLES)
PAS = "(function(n){ var S=__p3.S; for (var k=0;k<n;k++){ var e=__pil.manette(S); __p3.P3.pas(S,0.05,e); S.cris.forEach(function(c){ if(c.sym && S.T>c.t+1 && __p3.P3.vivant(S)) __p3.P3.taper(S,c.de,c.sym); }); } __p3.caler(); })"
MOMENTS = [
  ('faible', "__p3.P3.partMontree(S) && S.T > __p3.P3.partMontree(S).tA + 0.5"),
  ('touche', "__p3.P3.dernier(S,'touche',0.12)"),
  ('rebond', "__p3.P3.dernier(S,'rebond',0.12)"),
  ('zone-annonce', "(function(){ var z=S.su.zones.filter(function(z){return z.tA<=S.T && S.T<z.tI;})[0]; return z && (S.T-z.tA)/(z.tI-z.tA) > 0.7; })()"),
  ('zone-frappe', "__p3.P3.dernier(S,'zone',0.25)"),
  ('mega-charge', "(function(){ var m=S.su.megas.filter(function(m){return m.tA<=S.T && S.T<m.tI && m.donneur===S.moi;})[0]; return m && (S.T-m.tA) > 1.6; })()"),
  ('charge', "S.h.lance && S.h.lance.quoi==='sort' && S.h.lance.t > 2"),
  ('vol', "S.tirs.length && !S.tirs[0].retour && S.tirs[0].t > 0.2"),
]
with sync_playwright() as p:
    b = p.chromium.launch()
    for nom in quoi:
        w, h = TAILLES[nom]
        ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2, has_touch=True, is_mobile=True)
        pg = ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
        pg.on('console', lambda m: errs.append('console: ' + m.text[:200]) if m.type == 'error' else None)
        pg.goto(PAGE); pg.wait_for_timeout(300)
        pg.screenshot(path=OUT + '/0-debut-' + nom + '.png')
        pg.evaluate("localStorage.clear()")
        # le tambour du premier combat
        pg.evaluate("Object.assign(__p3.reglages, {mode:'seul', role:'barde', debut:1, vie:'normal', eclairs1: 0})"); pg.evaluate("__p3.demarrer()")
        pg.evaluate("window.__pil = new Pilote({reaction:0.5, relais:0.8}); window.__pilote = function(S){ return __pil.manette(S); }; 0")
        pg.evaluate("__p3.fige = true"); pg.evaluate(PAS + "(1262)"); pg.evaluate("__p3.fige = false"); pg.wait_for_timeout(500)
        pg.screenshot(path=OUT + '/1-tambour-' + nom + '.png')
        pg.evaluate("__p3.fige = true"); pg.evaluate(PAS + "(220)"); pg.evaluate("__p3.fige = false"); pg.wait_for_timeout(300)
        pg.screenshot(path=OUT + '/1-film-' + nom + '.png')
        # le deuxième combat
        pg.evaluate("Object.assign(__p3.reglages, {mode:'seul', role:'barde', debut:2, vie:'long', eclairs1: 30})"); pg.evaluate("__p3.demarrer()")
        pg.evaluate("window.__pil = new Pilote({reaction:0.5, relais:0.8}); 0")
        pg.evaluate("__p3.fige = true"); pg.evaluate(PAS + "(500)"); pg.evaluate("__p3.fige = false"); pg.wait_for_timeout(600)
        pg.screenshot(path=OUT + '/2-combat-' + nom + '.png')
        for m, test in MOMENTS:
            pg.evaluate("__p3.fige = true"); ok = False
            for k in range(3000):
                ok = pg.evaluate("(function(){ var S=__p3.S; for (var i=0;i<3;i++){ " + PAS + "(1); if (" + test + ") return true; } return false; })()")
                if ok: break
            pg.evaluate("__p3.fige = false"); pg.wait_for_timeout(90)
            pg.screenshot(path=OUT + '/3-' + m + '-' + nom + '.png')
            print(nom, m, 'vu' if ok else 'PAS VU', round(pg.evaluate("__p3.S.T"), 1), 'ips', pg.evaluate("__p3.ips"))
        print(nom, 'erreurs :', errs[:5])
        ctx.close()
    b.close()
