"""Les trois bulles de la paillasse, dans le vrai jeu (Romain, 10 novembre) : on touche la paillasse de l'atelier, trois bulles
se posent (Analyser, Forme, Couleur) ; Forme et Couleur changent la table tout de suite, Analyser ouvre le panneau, toucher ailleurs
les ferme. Sur un ordinateur, un téléphone couché et un téléphone debout, au doigt.
  BRUMEVAL_DIST=<dossier de build> python3 tools/bulles-paillasse.py     (captures dans jeu/test/paillasse/)"""
import sys, os, json
from playwright.sync_api import sync_playwright
D = os.path.abspath(os.environ.get('BRUMEVAL_DIST') or (len(sys.argv) > 1 and sys.argv[1]) or os.path.join(os.path.dirname(__file__), '..', 'dist')); URL = 'file://' + os.path.join(D, 'index.html')
ICI = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'test', 'paillasse'); os.makedirs(ICI, exist_ok=True)
err = []; R = {}
with sync_playwright() as p:
    b = p.chromium.launch()
    for nom, vp, tactile in [('ordi', {'width':1280,'height':800}, False), ('iphone', {'width':844,'height':390}, True), ('debout', {'width':390,'height':844}, True)]:
        ctx = b.new_context(viewport=vp, device_scale_factor=2, has_touch=tactile, is_mobile=tactile); pg = ctx.new_page(); pg.set_default_timeout(8000)
        pg.on('pageerror', lambda e: err.append(str(e)))
        pg.on('console', lambda m: err.append(m.text) if m.type == 'error' and 'ERR_TUNNEL' not in m.text and 'Failed to load' not in m.text else None)
        pg.goto(URL)
        pg.click('[data-act=creer]'); pg.click('[data-act=crea-role][data-r=alchimiste]'); pg.click('[data-act=crea-suite]'); pg.fill('#nom', 'Alicia'); pg.click('[data-act=crea-fin]')
        pg.click('[data-act=nouvelle-enquete]'); pg.click('[data-act=commencer]'); pg.wait_for_timeout(400)
        o = pg.locator('[data-act=onglet]', has_text='Atelier')
        if o.count(): o.first.click()
        pg.wait_for_timeout(700)
        # hors tutoriel : on coupe le guidage pour essayer librement
        pg.evaluate("() => { if(window.Atelier && Atelier.guider){ Atelier.guider(null); Atelier.guider = function(){ return false; }; } }")
        st = lambda: pg.evaluate("() => { var o = M.S.atelier.objets.filter(o => o.id === 'pa')[0]; return o.st || 0; }")
        def au_doigt(sel, fx, fy):
            bb = pg.locator(sel).first.bounding_box()
            x, y = bb['x'] + bb['width']*fx, bb['y'] + bb['height']*fy
            if 4 < x < vp['width'] - 4 and 60 < y < vp['height'] - 60:
                (pg.touchscreen.tap(x, y) if tactile else pg.mouse.click(x, y)); return 'doigt'
            pg.wait_for_timeout(750)   # hors de l'écran : le clic « sans doigt » du jeu (clavier, robot)
            pg.evaluate("s => document.querySelector(s).dispatchEvent(new MouseEvent('click', {bubbles:true}))", sel); return 'clic'
        def toucher(sel): return au_doigt(sel, .5, .5)
        def toucher_pa(): return au_doigt('#atelier-ici [data-at=analyses]', .3, .55)
        r = {}
        r['comment'] = toucher_pa(); pg.wait_for_timeout(800)
        r['bulles'] = pg.locator('.at-bulle-pa').count(); r['panneau'] = pg.locator('.at-f-analyses').count()
        pg.screenshot(path=f'{ICI}/bulles-{nom}-1.png')
        r['st0'] = st(); toucher('[data-bulle=forme]'); pg.wait_for_timeout(500); r['st_forme'] = st()
        toucher('[data-bulle=couleur]'); pg.wait_for_timeout(500); r['st_couleur'] = st(); r['encore'] = pg.locator('.at-bulle-pa').count()
        pg.screenshot(path=f'{ICI}/bulles-{nom}-2.png')
        toucher('[data-bulle=aller]'); pg.wait_for_timeout(600); r['panneau2'] = pg.locator('.at-f-analyses').count(); r['bulles2'] = pg.locator('.at-bulle-pa').count()
        pg.screenshot(path=f'{ICI}/bulles-{nom}-3.png')
        f = pg.locator('.at-grim:not([hidden]) .at-fermer')
        if f.count(): f.first.click(force=True); pg.wait_for_timeout(400)
        # toucher ailleurs : elles s'en vont
        toucher_pa(); pg.wait_for_timeout(700); r['rouvertes'] = pg.locator('.at-bulle-pa').count()
        bb = pg.locator('#atelier-ici .at-piece').first.bounding_box()
        (pg.touchscreen.tap(bb['x'] + bb['width']*.8, bb['y'] + bb['height']*.25) if tactile else pg.mouse.click(bb['x'] + bb['width']*.8, bb['y'] + bb['height']*.25)); pg.wait_for_timeout(400); r['ailleurs'] = pg.locator('.at-bulle-pa').count()
        r['sauve'] = pg.evaluate("() => { var o = JSON.parse(JSON.stringify(M.S.atelier.objets.filter(o => o.id === 'pa')[0])); return o.st; }")
        R[nom] = r; ctx.close()
    ok = all(r['bulles'] == 3 and r['panneau'] == 0 and r['st_forme'] % 5 == (r['st0'] + 1) % 5 and r['st_forme'] % 8 == r['st0'] % 8 and r['st_couleur'] % 5 == r['st_forme'] % 5 and r['st_couleur'] % 8 == (r['st_forme'] + 1) % 8
             and r['encore'] == 3 and r['panneau2'] == 1 and r['bulles2'] == 0 and r['rouvertes'] == 3 and r['ailleurs'] == 0 for r in R.values())
    print(json.dumps(R)); print('ERREURS', err); print('ÉCHECS' if (err or not ok) else 'tout est bon')
    b.close()
