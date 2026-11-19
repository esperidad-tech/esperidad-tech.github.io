"""LE TIROIR SE TOUCHE DIRECTEMENT (Romain, 19 novembre, 9 h 23 : « qu'on puisse appuyer sur la loupe pour analyser ou directement sur le
tiroir […] quand on appuie sur le tiroir, ça met la loupe directement sur le truc à analyser »). Un échantillon choisi, un tiroir touché :
la loupe s'y pose et ce tiroir s'ouvre. Sans échantillon : le tiroir se secoue. Et au labo, Mimi ne miaule plus.
   BRUMEVAL_DIST=<dossier construit> python3 tools/labo-tiroir.py"""
import os, sys
from playwright.sync_api import sync_playwright
D = os.environ.get('BRUMEVAL_DIST', os.path.join(os.path.dirname(__file__), '..', 'dist'))
echecs = []
def verifier(c, q):
    print('  ✓' if c else '  ✗', q)
    if not c: echecs.append(q)
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_context(viewport={'width': 1180, 'height': 820}, has_touch=True).new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file://' + os.path.abspath(os.path.join(D, 'index.html'))); pg.wait_for_timeout(600)
    pg.click('[data-act=creer]'); pg.click('[data-act=crea-role][data-r=alchimiste]'); pg.click('[data-act=crea-suite]'); pg.fill('#nom', 'Alicia'); pg.click('[data-act=crea-fin]')
    pg.click('[data-act=nouvelle-enquete]'); pg.click('[data-act=commencer]'); pg.wait_for_timeout(400)
    pg.evaluate("() => { M.tutoPermet = function(){ return true; }; M.S.laboIntro = 1; M.P().recus['obj:fil'] = 1; M.sauver(); }")
    pg.evaluate("() => M.ouvrirLabo()"); pg.wait_for_timeout(1500)
    f = next((x for x in pg.frames if x.parent_frame is not None), None)
    f.wait_for_function('() => !!window.__labo', timeout=8000)
    f.evaluate("() => { window.__labo.mimi.calme = true; if(window.GUIDE) GUIDE.fini = true; var i = document.querySelector('.intro'); if(i) i.remove(); }")
    pg.wait_for_timeout(400)
    etat = lambda: f.evaluate("() => { var S = window.__labo.etat(); return {mode:S.mode, sel:S.sel, tiroir:S.tiroir}; }")
    f.click('[data-act=tiroir][data-t=g]', force=True); pg.wait_for_timeout(800)
    verifier(etat()['mode'] is None, 'sans échantillon choisi : le tiroir ne fait rien (il se secoue)')
    lame = f.locator('#scene [data-act=lame]').first
    t = lame.get_attribute('data-t'); lame.click(force=True); pg.wait_for_timeout(700)
    verifier(etat()['sel'] == t, f'un échantillon choisi ({t})')
    f.click('[data-act=tiroir][data-t=d]', force=True); pg.wait_for_timeout(2600)
    e = etat()
    verifier(e['mode'] == 'loupe' and e['tiroir'] == 'd', f'(19 novembre) le tiroir touché : la loupe se pose, ce tiroir s\'ouvre ({e})')
    pg.screenshot(path=os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'test', 'labo-tiroir.png'))
    src = f.evaluate("() => (window.mimiPart || '').toString() + (window.mimiPrend || '').toString()")
    verifier("son('miaou')" not in src, '(19 novembre) Mimi ne miaule plus au labo')
    verifier(not errs, f'pas d\'erreur ({errs[:2]})')
    b.close()
print('ÉCHECS :', echecs)
