"""Vérifie l'atelier dans le vrai jeu : création d'un Alchimiste, onglet atelier, cueillette, ouverture du carton."""
import os, json
from playwright.sync_api import sync_playwright
URL = 'file://' + os.path.join(os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(os.path.dirname(__file__), '..', 'dist')), 'index.html')
OUT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
err = []
with sync_playwright() as p:
    b = p.chromium.launch()
    for vp in [{'width':800,'height':1280}, {'width':1280,'height':800}]:
        pg = b.new_context(viewport=vp).new_page(); pg.set_default_timeout(6000)
        pg.on('pageerror', lambda e: err.append(str(e)))
        pg.on('console', lambda m: err.append(m.text) if m.type == 'error' and 'ERR_TUNNEL' not in m.text else None)
        pg.goto(URL)
        pg.click('[data-act=creer]'); pg.click('[data-act=crea-role][data-r=alchimiste]'); pg.click('[data-act=crea-suite]'); pg.fill('#nom', 'Alicia'); pg.click('[data-act=crea-fin]')
        pg.click('[data-act=nouvelle-enquete]'); pg.click('[data-act=commencer]')
        pg.wait_for_timeout(400)
        print(vp['width'], 'onglets:', pg.eval_on_selector_all('[data-act=onglet]', 'l=>l.map(x=>x.dataset.o||x.textContent.trim())'))
        # onglet atelier
        o = pg.locator('[data-act=onglet]', has_text='Atelier')
        if o.count(): o.first.click()
        pg.wait_for_timeout(600)
        print('  atelier-ici:', pg.locator('#atelier-ici').count(), 'ingr:', pg.evaluate('() => M.ingr()'), 'fioles:', pg.evaluate('() => M.S.fioles'))
        pg.screenshot(path=f'{OUT}/verif-atelier-jeu-{vp["width"]}-1.png')
        # cueillette sur la place, puis retour à l'atelier
        pg.evaluate("() => { M.A['cueillir']({dataset:{id:'place'}}); }"); pg.wait_for_timeout(300)
        print('  après cueillette:', pg.evaluate('() => M.ingr()'), 'carnet:', pg.evaluate('() => M.P().carnet.slice(-1).map(function(n){return n.t})'))
        pg.evaluate("() => { M.UI.modal = null; M.render(); }"); pg.wait_for_timeout(500)
        # toucher le carton
        c = pg.locator('#atelier-ici [class*=carton]')
        print('  cartons visibles:', c.count())
        if c.count(): c.first.click(); pg.wait_for_timeout(900)
        pg.screenshot(path=f'{OUT}/verif-atelier-jeu-{vp["width"]}-2.png')
        print('  objets posés:', pg.evaluate('() => (M.S.atelier.objets||[]).length'), 'cartons:', pg.evaluate('() => JSON.stringify(M.S.atelier.cartons)'))
        # recharger : l'atelier est-il sauvegardé ?
        pg.reload(); pg.wait_for_timeout(600)
        print('  après rechargement, objets:', pg.evaluate('() => M.S && M.S.atelier ? M.S.atelier.objets.length : "?"'))
    print('ERREURS', err)
    b.close()
