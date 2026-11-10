"""Les trois bulles des meubles spéciaux de l'atelier, dans le vrai jeu (Romain, 10 novembre) : on touche la paillasse, le chaudron ou
le lutrin, trois bulles se posent (la jaune qui lance : Analyser / Préparer / Lire ; Forme ; Couleur). Forme et Couleur changent le meuble
tout de suite, la jaune ouvre son panneau (ou dit ce qui manque), toucher ailleurs les ferme, toucher un autre meuble fait passer les
bulles sur lui. Sur un ordinateur, un téléphone couché et un téléphone debout, au doigt.
  BRUMEVAL_DIST=<dossier de build> python3 tools/bulles-paillasse.py     (captures dans jeu/test/paillasse/)"""
import sys, os, json
from playwright.sync_api import sync_playwright
D = os.path.abspath(os.environ.get('BRUMEVAL_DIST') or (len(sys.argv) > 1 and sys.argv[1]) or os.path.join(os.path.dirname(__file__), '..', 'dist')); URL = 'file://' + os.path.join(D, 'index.html')
ICI = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'test', 'paillasse'); os.makedirs(ICI, exist_ok=True)
# meuble : (ce qu'on touche, où dans le meuble, nombre de formes, le mot de la bulle jaune, ce qui s'ouvre)
MEUBLES = {'pa': ('analyses', (.3, .55), 5, 'Analyser', '.at-f-analyses'),
           'ch': ('chaudron', (.5, .45), 3, 'Préparer', '.at-ch-titre, .at-toast.at-toast-on'),
           'lu': ('grimoire', (.5, .4), 3, 'Lire', '.at-livre')}
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
        def au_doigt(sel, fx, fy):
            bb = pg.locator(sel).first.bounding_box()
            x, y = bb['x'] + bb['width']*fx, bb['y'] + bb['height']*fy
            # (au doigt seulement si rien d'autre n'est posé à cet endroit : un carton devant le chaudron, par exemple)
            libre = pg.evaluate("a => { var e = document.elementFromPoint(a[1], a[2]), c = document.querySelector(a[0]); return !!(e && c && (c.contains(e) || e.closest('.at-bulle-pa') === c)); }", [sel, x, y])
            if libre and 4 < x < vp['width'] - 4 and 60 < y < vp['height'] - 60:
                (pg.touchscreen.tap(x, y) if tactile else pg.mouse.click(x, y)); return 'doigt'
            pg.wait_for_timeout(750)   # caché ou hors de l'écran : le clic « sans doigt » du jeu (clavier, robot)
            pg.evaluate("s => document.querySelector(s).dispatchEvent(new MouseEvent('click', {bubbles:true}))", sel); return 'clic'
        def toucher(sel): return au_doigt(sel, .5, .5)
        R[nom] = {}
        for idm, (at, (fx, fy), nf, mot, ouvre) in MEUBLES.items():
            st = lambda: pg.evaluate("i => { var o = M.S.atelier.objets.filter(o => o.id === i)[0]; return o.st || 0; }", idm)
            toucher_m = lambda: au_doigt(f'#atelier-ici [data-at={at}]', fx, fy)
            r = {'nf': nf}
            r['comment'] = toucher_m(); pg.wait_for_timeout(800)
            r['bulles'] = pg.locator('.at-bulle-pa').count(); r['jaune'] = (pg.locator('.at-bulle-go').first.inner_text() if pg.locator('.at-bulle-go').count() else '')
            r['mot'] = mot in r['jaune']; r['panneau'] = pg.locator(ouvre.split(',')[0]).count()
            pg.screenshot(path=f'{ICI}/bulles-{nom}-{idm}-1.png')
            r['st0'] = st(); toucher('[data-bulle=forme]'); pg.wait_for_timeout(500); r['st_forme'] = st()
            toucher('[data-bulle=couleur]'); pg.wait_for_timeout(500); r['st_couleur'] = st(); r['encore'] = pg.locator('.at-bulle-pa').count()
            pg.screenshot(path=f'{ICI}/bulles-{nom}-{idm}-2.png')
            toucher('[data-bulle=aller]'); pg.wait_for_timeout(600); r['panneau2'] = pg.locator(ouvre).count(); r['bulles2'] = pg.locator('.at-bulle-pa').count()
            r['peindre'] = pg.locator('.at-grim:not([hidden]) .at-peindre, .at-toast-peindre').count()      # plus de 🎨 dans les panneaux
            pg.screenshot(path=f'{ICI}/bulles-{nom}-{idm}-3.png')
            f = pg.locator('.at-grim:not([hidden]) .at-fermer')
            if f.count(): f.first.click(force=True); pg.wait_for_timeout(400)
            pg.wait_for_timeout(300)
            # toucher ailleurs : elles s'en vont
            toucher_m(); pg.wait_for_timeout(700); r['rouvertes'] = pg.locator('.at-bulle-pa').count()
            # (un endroit vide de la pièce : ni meuble, ni carton, ni bulle, ni bouton)
            vide = pg.evaluate("""() => { var R = document.querySelector('#atelier-ici .at-piece').getBoundingClientRect();
                for(var fy = .1; fy < .95; fy += .08) for(var fx = .92; fx > .05; fx -= .06){ var x = R.left + R.width*fx, y = R.top + R.height*fy, e = document.elementFromPoint(x, y);
                  if(e && e.closest('.at-piece') && !e.closest('.at-o, .at-bulle-pa, .at-carton, .at-tas, [data-at], .at-repere, button')) return [x, y]; }
                return null; }""")
            r['vide'] = bool(vide)
            if vide: (pg.touchscreen.tap(vide[0], vide[1]) if tactile else pg.mouse.click(vide[0], vide[1]))
            pg.wait_for_timeout(400); r['ailleurs'] = pg.locator('.at-bulle-pa').count()
            r['sauve'] = pg.evaluate("i => JSON.parse(JSON.stringify(M.S.atelier.objets.filter(o => o.id === i)[0])).st", idm)
            R[nom][idm] = r
        # d'un meuble à l'autre : les bulles passent sur le deuxième (jamais deux jeux de bulles)
        pg.evaluate("() => document.querySelector('#atelier-ici [data-at=chaudron]').dispatchEvent(new MouseEvent('click', {bubbles:true}))"); pg.wait_for_timeout(900)
        pg.evaluate("() => document.querySelector('#atelier-ici [data-at=grimoire]').dispatchEvent(new MouseEvent('click', {bubbles:true}))"); pg.wait_for_timeout(900)
        R[nom]['passe'] = {'bulles': pg.locator('.at-bulle-pa').count(), 'jaune': (pg.locator('.at-bulle-go').first.inner_text() if pg.locator('.at-bulle-go').count() else '')}
        ctx.close()
    def bon(r):
        nf = r['nf']
        return (r['bulles'] == 3 and r['mot'] and r['panneau'] == 0 and r['st_forme'] % nf == (r['st0'] + 1) % nf and r['st_forme'] % 8 == r['st0'] % 8
                and r['st_couleur'] % nf == r['st_forme'] % nf and r['st_couleur'] % 8 == (r['st_forme'] + 1) % 8
                and r['encore'] == 3 and r['panneau2'] >= 1 and r['bulles2'] == 0 and r['peindre'] == 0 and r['rouvertes'] == 3 and r['ailleurs'] == 0)
    ok = all(bon(R[n][i]) for n in R for i in MEUBLES) and all(R[n]['passe']['bulles'] == 3 and 'Lire' in R[n]['passe']['jaune'] for n in R)
    print(json.dumps(R, ensure_ascii=False)); print('ERREURS', err); print('ÉCHECS' if (err or not ok) else 'tout est bon')
    b.close()
