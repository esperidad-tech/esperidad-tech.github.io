"""Ouvre le chaudron de l'atelier (enquête 2, recette de l'encre au niveau 1) et le photographie à plusieurs tailles.
   python3 voir.py <dossier construit> <prefixe> [tailles…]   (les états : h=<chaleur> buches=<n>)"""
import os
VU = os.path.dirname(os.path.abspath(__file__))      # les captures s'écrivent ici, à côté de l'outil
POLICES = os.environ.get('BRUMEVAL_POLICES')       # (facultatif) une feuille de style avec les vraies polices du jeu, pour des captures fidèles hors ligne
import sys, json
from playwright.sync_api import sync_playwright
DIST, PRE = sys.argv[1], sys.argv[2]
T = {'tablette':(1180,820), 'telephone':(393,852), 'ipad':(820,1180), 'paysage':(852,393), 'se':(375,667), 'ordi':(1440,900)}
noms = [a for a in sys.argv[3:] if a in T] or ['tablette', 'telephone']
OPT = dict(a.split('=') for a in sys.argv[3:] if '=' in a)
URL = 'file://' + DIST + '/index.html#test'
def ouvrir(b, vp, dpr=2):
    pg = b.new_context(viewport={'width':vp[0],'height':vp[1]}, device_scale_factor=dpr).new_page(); pg.set_default_timeout(9000)
    errs = []
    pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)[:300]))
    pg.on('console', lambda m: errs.append(m.text[:300]) if m.type == 'error' and 'net::' not in m.text and 'fonts' not in m.text and 'ERR_' not in m.text else None)
    pg.goto(URL)
    POLICES and pg.add_style_tag(path=POLICES)
    pg.click('[data-act=creer]'); pg.click('[data-act=crea-role][data-r=alchimiste]'); pg.click('[data-act=crea-suite]'); pg.fill('#nom', 'Lia'); pg.click('[data-act=crea-fin]')
    pg.evaluate("() => { M.UI.ecran = 'reglages'; M.render(); }"); pg.click('[data-act=mode-test][data-i="2"]'); pg.click('#voile [data-act=confirmer-oui]')
    pg.click('[data-act=nouvelle-enquete]'); pg.wait_for_timeout(500)
    for _ in range(5):
        for sel in ['[data-act=lettre-suite]', '[data-act=commencer]']:
            if pg.locator(sel).count():
                try: pg.click(sel, force=True)
                except Exception: pass
        pg.wait_for_timeout(400)
    return pg, errs
def chaudron(pg, stock=None, potion='revelatrice', niveau=1):
    besoin = pg.evaluate("() => DONNEES.RECETTES['verite'].ingr")
    pg.evaluate("""(b) => { var S = M.S; S.fioles = 3; M.P().tutoCueillette = 'fini'; var fx = S.atelier.objets.filter(o => o.cases && o.cases.length)[0];
      b.forEach((x, i) => { fx.cases[i].i[x[0]] = (fx.cases[i].i[x[0]] || 0) + x[1] + 1; }); M.UI.modal = null; M.P().onglet = 'role'; M.sauver(); M.render(); }""", besoin)
    pg.wait_for_timeout(1500)
    pg.evaluate("""(o) => { var l0 = MJ.lancer; MJ.lancer = function(el, type, p, fin, op){ if(type === 'chaudron'){ var q = MJ.reglages('chaudron', o.niveau, {}); for(var k in q) p[k] = q[k]; p.potion = o.potion; p.connue = true; p.stock = o.stock; p.onVerse = function(){}; op = op || {}; op.titre = '🫙 Encre révélatrice'; op.tutoriel = false; } return l0.call(this, el, type, p, fin, op); }; }""", {'stock': stock or {'eau':3, 'miel':2, 'baies':4}, 'potion': potion, 'niveau': niveau})
    pg.locator('#atelier-ici [data-obj=ch]').first.click(); pg.wait_for_timeout(700)
    pg.locator('#atelier-ici .at-bulle-pa', has_text='Préparer').first.click(force=True); pg.wait_for_timeout(700)
    pg.locator('#atelier-ici .at-ch-go[data-r="verite"]').first.click(force=True); pg.wait_for_timeout(1500)
if __name__ == '__main__':
    with sync_playwright() as p:
        b = p.chromium.launch()
        for n in noms:
            pg, errs = ouvrir(b, T[n])
            try:
                stock = json.loads(OPT['stock']) if 'stock' in OPT else None
                chaudron(pg, stock, OPT.get('potion', 'revelatrice'), int(OPT.get('niveau', 1)))
                pg.screenshot(path=f'{VU}/{PRE}-{n}-intro.png')
                pg.get_by_text("C'est parti").first.click(force=True); pg.wait_for_timeout(float(OPT.get('attente', 6.5)) * 1000)
                if 'h' in OPT or 'buches' in OPT:
                    pg.evaluate("(o) => { var a = MJ.TYPES.chaudron._dernier.api; if(o.buches) a.buches(+o.buches); if(o.h){ a.pause(true); a.chaleur(+o.h); } }", OPT); pg.wait_for_timeout(900)
                pg.screenshot(path=f'{VU}/{PRE}-{n}.png')
                print(n, 'ok', pg.evaluate("() => { var r = document.querySelector('.at-mj').getBoundingClientRect(), s = document.querySelector('.mjc-scene').getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height), 'scene', Math.round(s.width), Math.round(s.height)].join(' '); }"), errs[:4])
            except Exception as e:
                print(n, 'ERR', str(e)[:300], errs[:4]); pg.screenshot(path=f'{VU}/{PRE}-{n}-err.png')
            pg.context.close()
        b.close()
