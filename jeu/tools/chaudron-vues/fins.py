"""Les fins du chaudron (boum, gel, réussite) dans l'atelier, et le chaudron dans la salle des mini-jeux.
   python3 fins.py <dist> <prefixe> [tablette|telephone] [salle=1]"""
import os
VU = os.path.dirname(os.path.abspath(__file__))      # les captures s'écrivent ici, à côté de l'outil
POLICES = os.environ.get('BRUMEVAL_POLICES')       # (facultatif) une feuille de style avec les vraies polices du jeu, pour des captures fidèles hors ligne
import sys
sys.path.insert(0, VU)
from playwright.sync_api import sync_playwright
import voir
DIST, PRE = sys.argv[1], sys.argv[2]
noms = [a for a in sys.argv[3:] if a in voir.T] or ['tablette']
OPT = dict(a.split('=') for a in sys.argv[3:] if '=' in a)
API = "MJ.TYPES.chaudron._dernier.api"
def partir(b, n):
    pg, errs = voir.ouvrir(b, voir.T[n], 1.5)
    voir.chaudron(pg)
    pg.get_by_text("C'est parti").first.click(force=True); pg.wait_for_timeout(5500)
    return pg, errs
with sync_playwright() as p:
    b = p.chromium.launch()
    for n in noms:
        if OPT.get('salle'):
            pg = b.new_context(viewport={'width':voir.T[n][0],'height':voir.T[n][1]}, device_scale_factor=1.5).new_page(); pg.set_default_timeout(9000)
            errs = []; pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)[:300]))
            pg.on('console', lambda m: errs.append(m.text[:300]) if m.type == 'error' and 'net::' not in m.text and 'fonts' not in m.text and 'ERR_' not in m.text else None)
            pg.goto('file://' + DIST + '/salle-mini-jeux.html'); POLICES and pg.add_style_tag(path=POLICES); pg.wait_for_timeout(600)
            pg.click('[data-jeu=chaudron]'); pg.wait_for_timeout(1200)
            pg.screenshot(path=f'{VU}/{PRE}-{n}-salle-intro.png')
            pg.get_by_text("C'est parti").first.click(force=True); pg.wait_for_timeout(6500)
            pg.screenshot(path=f'{VU}/{PRE}-{n}-salle.png'); print(n, 'salle', errs[:4]); pg.context.close(); continue
        # 1. boum
        pg, errs = partir(b, n)
        pg.evaluate(f"() => {{ var a = {API}; a.buches(5); a.chaleur(99); a.vitesse(8); }}"); pg.wait_for_timeout(900)
        pg.screenshot(path=f'{VU}/{PRE}-{n}-boum1.png'); pg.wait_for_timeout(2600)
        pg.screenshot(path=f'{VU}/{PRE}-{n}-boum2.png'); print(n, 'boum', errs[:4]); pg.context.close()
        # 2. gel
        pg, errs = partir(b, n)
        pg.evaluate(f"() => {{ var a = {API}; a.buches(0); a.chaleur(1); a.vitesse(-8); }}"); pg.wait_for_timeout(900)
        pg.screenshot(path=f'{VU}/{PRE}-{n}-gel1.png'); pg.wait_for_timeout(2600)
        pg.screenshot(path=f'{VU}/{PRE}-{n}-gel2.png'); print(n, 'gel', errs[:4]); pg.context.close()
        # 3. réussite : on verse ce qui est dans la zone, la barre tenue dans le vert ; puis on cherche la zone de fin
        pg, errs = partir(b, n)
        fini = False
        for i in range(140):
            r = pg.evaluate(f"() => {{ var a = {API}, z = a.dansZone(); a.buches(3); if(!document.querySelector('.mjc').classList.contains('mjc-phase-fin')) a.chaleur(45); if(z.length) a.verser(z[0]); return [z.length, document.querySelector('.mjc').className.indexOf('mjc-phase-fin') >= 0, !!document.querySelector('.mj-resultat')]; }}")
            if r[1] or r[2]: break
            pg.wait_for_timeout(400)
        print(n, 'phase de fin après', i, 'tours')
        pg.wait_for_timeout(600); pg.screenshot(path=f'{VU}/{PRE}-{n}-fin0.png')
        for h in [45, 70, 20, 82, 8, 58, 32, 92]:
            if pg.locator('.mj-resultat').count(): break
            pg.evaluate(f"(h) => {{ var a = {API}; a.buches(3); a.pause(true); a.chaleur(h); a.pause(false); }}", h)
            for k in range(8):
                pg.evaluate(f"(h) => {{ var a = {API}; a.chaleur(h); }}", h); pg.wait_for_timeout(400)
                if k == 4: pg.screenshot(path=f'{VU}/{PRE}-{n}-fin-h{h}.png')
                if pg.locator('.mj-resultat').count() or pg.locator('.mjc-fin:not([hidden])').count(): fini = True; break
            if fini: break
        pg.wait_for_timeout(700); pg.screenshot(path=f'{VU}/{PRE}-{n}-fin1.png'); pg.wait_for_timeout(2500)
        pg.screenshot(path=f'{VU}/{PRE}-{n}-fin2.png'); print(n, 'réussite', fini, errs[:4]); pg.context.close()
    b.close()
