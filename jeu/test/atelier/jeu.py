"""L'atelier v4 dans le VRAI jeu (build BRUMEVAL_DIST ou dist/) : une Alchimiste, au téléphone.
Vérifie : l'enquête s'ouvre sur l'onglet du rôle (l'atelier), l'atelier remplit tout l'espace entre le bandeau et les onglets,
pas de sous-onglets, la page ne défile pas ; cueillette → des tas devant la porte ; un tas touché ; un objet reçu par code → la paillasse brille,
« Analyser » depuis la paillasse ; une potion → son flacon devant la porte, « Donner » ouvre le code du moteur ;
le message « Potion réussie » dit où est le flacon.
Usage : BRUMEVAL_DIST=… python3 jeu.py [390x844 360x740 …]"""
import sys, os, json
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', '..', 'dist'))
URL = 'file://' + os.path.join(DIST, 'index.html')
CAP = os.path.join(ICI, 'captures')
TAILLES = [tuple(int(v) for v in a.split('x')) for a in sys.argv[1:]] or [(390, 844), (360, 740), (844, 390), (1280, 800)]

def fermer(pg):
    pg.wait_for_timeout(150)
    if pg.is_visible('#voile .b-fermer'): pg.click('#voile .b-fermer')
    pg.wait_for_timeout(300)

def clic_atelier(pg, sel):
    pg.evaluate(f"() => document.querySelector('#atelier-ici {sel}').dispatchEvent(new MouseEvent('click', {{bubbles:true}}))")
    pg.wait_for_timeout(400)

ko = []
with sync_playwright() as p:
    b = p.chromium.launch()
    for (w, h) in TAILLES:
        pg = b.new_context(viewport={'width': w, 'height': h}).new_page(); pg.set_default_timeout(8000); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'ERR_TUNNEL' not in m.text else None)
        def v(ok, msg):
            print(('  ok  ' if ok else '  KO  ') + msg)
            if not ok: ko.append(f'{w}x{h} : {msg}')
        print(f'== jeu {w}x{h} ==')
        pg.goto(URL)
        pg.click('[data-act=creer]'); pg.click('[data-act=crea-role][data-r=alchimiste]'); pg.click('[data-act=crea-suite]'); pg.fill('#nom', 'Alicia'); pg.click('[data-act=crea-fin]')
        pg.click('[data-act=nouvelle-enquete]'); pg.click('[data-act=commencer]')
        pg.wait_for_timeout(700)
        fermer(pg)
        ongl = pg.eval_on_selector_all('[data-act=onglet]', 'l => l.map(x => x.dataset.o)')
        v(ongl[:1] == ['role'] and pg.evaluate("() => M.P().onglet") == 'role', f"l'enquête s'ouvre sur l'onglet du rôle, en premier : {ongl}")
        v(pg.locator('#atelier-ici .at').count() == 1, "l'atelier est monté")
        v(pg.locator('[data-act=sous-atelier]').count() == 0, "pas de sous-onglets « Mon atelier » / « Potions et analyses »")
        r = pg.evaluate("""() => { const a = document.querySelector('#atelier-ici .at').getBoundingClientRect(), n = document.querySelector('.b-onglets').getBoundingClientRect(), t = document.querySelector('.b-entete').getBoundingClientRect();
          return {haut:Math.round(a.top), bas:Math.round(a.bottom), g:Math.round(a.left), d:Math.round(a.right), nav:Math.round(n.top), entete:Math.round(t.bottom), defile:document.documentElement.scrollHeight - innerHeight, defx:document.documentElement.scrollWidth - innerWidth}; }""")
        v(abs(r['haut'] - r['entete']) <= 2 and abs(r['bas'] - r['nav']) <= 2 and r['g'] == 0 and r['d'] == w, f"l'atelier remplit tout entre le bandeau ({r['entete']}) et les onglets ({r['nav']}) : {r['haut']}..{r['bas']}, {r['g']}..{r['d']}")
        v(r['defile'] <= 0 and r['defx'] <= 0, f"la page ne défile pas ({r['defile']}, {r['defx']})")
        pg.screenshot(path=os.path.join(CAP, f'jeu-{w}x{h}-1-atelier.png'))
        # cueillette → le carton près de la porte
        pg.evaluate("() => { M.A['cueillir']({dataset:{id:'place'}}); }"); pg.wait_for_timeout(300)
        pg.evaluate("() => { M.UI.modal = null; M.render(); }"); pg.wait_for_timeout(600)
        n = pg.evaluate("() => Object.values(M.S.atelier.panier).reduce((a, b) => a + b, 0)")
        tas = pg.evaluate("() => [...document.querySelectorAll('#atelier-ici .at-tas')].map(e => e.dataset.tas)")
        nk = pg.evaluate("() => Object.keys(M.S.atelier.panier).length")
        v(n > 0 and len(tas) == nk and pg.locator('#atelier-ici .at-tas-neuf').count() == 1, f"cueillette : {n} ingrédient(s) posés devant la porte, {len(tas)} tas, « Nouveau ! »")
        pg.screenshot(path=os.path.join(CAP, f'jeu-{w}x{h}-2-cueillette.png'))
        clic_atelier(pg, '.at-tas')
        v(pg.evaluate("() => !document.querySelector('#atelier-ici .at-grim').hidden"), "toucher un tas : « Ta cueillette »")
        pg.screenshot(path=os.path.join(CAP, f'jeu-{w}x{h}-3-cueillette.png'))
        pg.evaluate("() => document.querySelector('#atelier-ici .at-grim .at-fermer').click()"); pg.wait_for_timeout(200)
        # un objet reçu par code → la table d'analyse
        oid = pg.evaluate("() => { var E = M.E(); return Object.keys(E.analyses || {}).filter(function(k){ return E.objets[k] && !E.analyses[k].mj && !E.analyses[k].besoin; })[0]; }")
        pg.evaluate(f"() => {{ M.P().recus['obj:{oid}'] = true; M.sauver(); M.render(); }}"); pg.wait_for_timeout(500)
        v(pg.evaluate("() => document.querySelector('#atelier-ici [data-obj=pa]').classList.contains('at-attente')"), "objet reçu : la paillasse brille")
        clic_atelier(pg, '[data-at=analyses]')
        an = pg.locator(f'#atelier-ici [data-act=analyser][data-id={oid}]')
        v(an.count() == 1 and an.is_visible(), "paillasse : « Analyser » visible")
        pg.screenshot(path=os.path.join(CAP, f'jeu-{w}x{h}-4-analyses.png'))
        if an.count():
            av = pg.evaluate("() => M.P().actions")
            an.click(); pg.wait_for_timeout(400)
            v(pg.evaluate("() => M.P().actions") == av - 1 and pg.evaluate(f"() => !!M.P().analyses['{oid}']"), "« Analyser » : le moteur fait l'analyse (1 action)")
            pg.screenshot(path=os.path.join(CAP, f'jeu-{w}x{h}-5-analyse-faite.png'))
            fermer(pg)
        # une potion → son flacon devant la porte, « Donner »
        pg.evaluate("() => { M.S.potions.revelatrice = (M.S.potions.revelatrice || 0) + 1; M.sauver(); M.render(); }"); pg.wait_for_timeout(500)
        v(pg.evaluate("() => !!document.querySelector('#atelier-ici .at-flacon[data-pot=revelatrice]') && !document.querySelector('#atelier-ici .at-armoire')"), "la potion : un flacon devant la porte (plus d'armoire)")
        v('devant la porte' in pg.evaluate("() => Atelier.OU_POTIONS || ''"), "le message du moteur dit où est le flacon")
        clic_atelier(pg, '.at-flacon[data-pot=revelatrice]')
        d = pg.locator('#atelier-ici [data-act=donner-potion][data-id=revelatrice]')
        v(d.count() == 1 and d.is_visible(), "flacon touché : « Donner » visible")
        pg.screenshot(path=os.path.join(CAP, f'jeu-{w}x{h}-6-potions.png'))
        if d.count():
            d.click(); pg.wait_for_timeout(400)
            v(pg.locator('#voile').count() > 0 and pg.locator('#voile [data-act=potion-donnee]').count() == 1, "« Donner » : le moteur montre le code")
            pg.screenshot(path=os.path.join(CAP, f'jeu-{w}x{h}-7-code.png'))
        v(not errs, f'console sans erreur {errs[:3]}')
        pg.close()
    b.close()
print('ERREURS :', ko)
