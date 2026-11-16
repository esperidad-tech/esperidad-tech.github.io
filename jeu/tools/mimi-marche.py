"""La marche de Mimi dans ses huit vues (Bible §12.68), dans le vrai jeu (Playwright) :
- elle s'éloigne : on la voit de dos ; elle vient vers nous : de face ; en biais : de trois-quarts ; de côté : de profil ;
- le demi-tour : elle passe par ses autres vues, une image après l'autre ; son dessin n'est jamais retourné « à plat » ;
- au pas, au trot, au galop ; sa vitesse (elle traverse l'atelier en moins de deux secondes au galop) ;
- une planche d'images de chaque marche (jeu/test/mimi/marche-*.png) ;
- aucun message d'erreur.
   BRUMEVAL_DIST=<dossier construit> python3 tools/mimi-marche.py [iphone]"""
import sys, os, time
from playwright.sync_api import sync_playwright
from PIL import Image
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist')), 'index.html') + '#test'
OUT = os.path.join(ICI, '..', 'test', 'mimi'); os.makedirs(OUT, exist_ok=True)
TEL = 'iphone' in sys.argv
erreurs, echecs = [], []
V = "Atelier._vue()"

def verifier(cond, quoi):
    print('  ✓' if cond else '  ✗', quoi, flush=True)
    if not cond: echecs.append(quoi)

def debut(b):
    vp = {'width': 390, 'height': 844} if TEL else {'width': 1180, 'height': 820}
    pg = b.new_context(viewport=vp, has_touch=True, device_scale_factor=2 if TEL else 1).new_page()
    pg.set_default_timeout(9000)
    pg.on('console', lambda m: erreurs.append(m.text) if m.type == 'error' and 'net::' not in m.text and 'fonts' not in m.text and 'ERR_TUNNEL' not in m.text and 'Failed to load' not in m.text else None)
    pg.on('pageerror', lambda e: erreurs.append(f'PAGEERROR {e}'))
    pg.add_init_script("window.BRUMEVAL_SANS_TUTO = true;")
    pg.goto(URL)
    pg.click('[data-act=creer]'); pg.click('[data-act=crea-role][data-r=alchimiste]'); pg.click('[data-act=crea-suite]'); pg.fill('#nom', 'Lia'); pg.click('[data-act=crea-fin]')
    pg.evaluate("() => { M.S.heros.joueur = 'adulte'; M.sauver(); M.UI.ecran = 'reglages'; M.render(); }")
    pg.click('[data-act=mode-test][data-i="2"]'); pg.click('#voile [data-act=confirmer-oui]')
    pg.click('[data-act=nouvelle-enquete]'); pg.wait_for_timeout(200)
    if pg.locator('[data-act=lettre-suite]').count(): pg.click('[data-act=lettre-suite]')
    pg.click('[data-act=commencer]'); pg.wait_for_timeout(500)
    pg.evaluate("() => { M.UI.modal = null; M.P().onglet = 'role'; M.render(); }"); pg.wait_for_timeout(1200)
    return pg

def pantin(pg, cid): return pg.evaluate(f"() => {V}._pantin('{cid}')")
def cadre(pg, cid):
    return pg.evaluate(f"() => {{ var d = document.querySelector('#atelier-ici [data-obj=\"{cid}\"] svg'); if(!d) return null; var r = d.getBoundingClientRect(); return {{x:r.left, y:r.top, w:r.width, h:r.height}}; }}")
def plat(pg, cid):
    """l'échelle du dessin en largeur, par rapport à sa hauteur : 1 (ou -1, en miroir) ; autre chose : il est écrasé"""
    return pg.evaluate(f"""() => {{ var g = document.querySelector('#atelier-ici [data-obj="{cid}"] .mi-rac'); if(!g) return null; var m = /scale\\(([-\\d.]+)[ ,]+([-\\d.]+)\\)/.exec(g.getAttribute('transform') || ''); return m ? Math.abs(+m[1] / +m[2]) : null; }}""")

def marche(pg, cid, nom, de, vers, vite=1, photos=8):
    """elle part de « de » (x, y du plancher) et va à « vers » : les vues qu'on a vues en chemin, l'allure, la durée, une planche d'images"""
    # (elle file d'abord au point de départ, et s'y arrête)
    pg.evaluate(f"() => {{ var a = {V}; a._finJouet(); a._reveil('{cid}'); a._dehors('{cid}'); a._va('{cid}', {de[0]}, {de[1]}, 7); }}")
    for i in range(40):
        pg.wait_for_timeout(100)
        if not pg.evaluate(f"() => {V}._chat('{cid}').anim"): break
    pg.evaluate(f"() => {{ var a = {V}; a._voir(600, 700); }}"); pg.wait_for_timeout(500)
    pg.evaluate(f"() => {V}._va('{cid}', {vers[0]}, {vers[1]}, {vite})")
    t0 = time.time(); vues, allures, plats, images = [], set(), [], []
    while time.time() - t0 < 14:
        p = pantin(pg, cid)
        if not p: break
        c = pg.evaluate(f"() => {V}._chat('{cid}')")
        if p['marche']:
            vues.append(p['vue'])
            if p['allure']: allures.add(p['allure'])
        k = plat(pg, cid)
        if k is not None: plats.append(round(k, 2))
        if len(images) < photos and p['marche'] and len(vues) % 2 == 0:
            r = cadre(pg, cid)
            if r and r['w'] > 10:
                clip = {'x': max(0, r['x'] - r['w'] * .25), 'y': max(0, r['y'] - r['h'] * .15), 'width': r['w'] * 1.5, 'height': r['h'] * 1.3}
                f = f'{OUT}/_m.png'; pg.screenshot(path=f, clip=clip); images.append(Image.open(f).copy())
        if not c['anim'] and time.time() - t0 > 0.4: break
        pg.wait_for_timeout(40)
    duree = time.time() - t0
    if images:
        h = 150; l = [im.resize((max(1, int(im.width * h / im.height)), h)) for im in images]
        pl = Image.new('RGB', (sum(i.width for i in l), h), '#333'); x = 0
        for i in l: pl.paste(i, (x, 0)); x += i.width
        pl.save(f'{OUT}/{"tel-" if TEL else ""}marche-{nom}.png')
    compte = {v: vues.count(v) for v in set(vues)}
    return {'vues': compte, 'allures': sorted(allures), 'plats': sorted(set(plats)), 'duree': round(duree, 2)}

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = debut(b)
    for i in range(90):
        if not pg.evaluate("() => { var k = document.querySelector('#atelier-ici .at-carton'); if(k) k.dispatchEvent(new MouseEvent('click', {bubbles:true})); return !!k; }"): break
        pg.wait_for_timeout(260)
        pg.evaluate("() => { var g = document.querySelector('#atelier-ici .at-grim .at-fermer'); if(g) g.click(); }")
    pg.evaluate(f"() => {{ var a = {V}; if(a._salle() !== 0) a._allerSalle(0); }}"); pg.wait_for_timeout(600)
    cid = pg.evaluate("() => (M.S.atelier.objets.filter(function(o){ return o.t === 'chat'; })[0] || {}).id || null")
    verifier(cid is not None, 'Mimi est là')
    def principale(r): return max(r['vues'], key=r['vues'].get) if r['vues'] else None
    # --- les quatre grandes directions, et les biais ---
    r = marche(pg, cid, 'fond', (620, 835), (640, 580)); print('   vers le fond :', r)
    verifier(principale(r) == 'dos', f'elle s\'éloigne vers le fond : on la voit de dos ({r["vues"]})')
    verifier(r['plats'] == [1.0], f'son dessin n\'est jamais écrasé ni retourné à plat ({r["plats"]})')
    r = marche(pg, cid, 'devant', (640, 585), (620, 835)); print('   vers nous :', r)
    verifier(principale(r) == 'face', f'elle vient vers nous : on la voit de face ({r["vues"]})')
    r = marche(pg, cid, 'droite', (300, 760), (900, 765)); print('   vers la droite :', r)
    verifier(principale(r) == 'profil' and r['allures'] == ['pas'], f'de côté : de profil, au pas ({r["vues"]}, {r["allures"]})')
    pas_duree = r['duree']
    r = marche(pg, cid, 'biais-face', (420, 620), (800, 790)); print('   en biais, vers nous :', r)
    verifier(principale(r) == 'tqf', f'en biais vers nous : de trois-quarts face ({r["vues"]})')
    r = marche(pg, cid, 'biais-dos', (800, 800), (430, 630)); print('   en biais, vers le fond :', r)
    verifier(principale(r) == 'tqd', f'en biais vers le fond : de trois-quarts dos ({r["vues"]})')
    verifier(r['plats'] == [1.0], f'toujours un vrai dessin ({r["plats"]})')
    # --- le trot, le galop ---
    r = marche(pg, cid, 'trot', (300, 770), (900, 765), 2.2); print('   au trot :', r)
    verifier(r['allures'] == ['trot'], f'plus vite : elle trotte ({r["allures"]})')
    r = marche(pg, cid, 'galop', (250, 770), (950, 765), 4.2); print('   au galop :', r)
    verifier(r['allures'] == ['course'] and r['duree'] < 2.2, f'encore plus vite : elle galope, et traverse l\'atelier en {r["duree"]} s (au pas : {pas_duree} s)')
    # --- le demi-tour, à l'arrêt : elle passe par ses autres vues ---
    pg.evaluate(f"() => {{ var a = {V}; a._reveil('{cid}'); a._pose('{cid}', 'marche'); }}"); pg.wait_for_timeout(900)
    c0 = pantin(pg, cid)['cap']
    pg.evaluate(f"() => {{ var d = document.querySelector('#atelier-ici [data-obj=\"{cid}\"]'); d.classList.toggle('at-c-gauche'); }}")
    caps, plats = [], set()
    for i in range(40):
        q = pantin(pg, cid); caps.append(q['cap']); k = plat(pg, cid)
        if k is not None: plats.add(round(k, 2))
        pg.wait_for_timeout(16)
    suite = [c for i, c in enumerate(caps) if i == 0 or c != caps[i - 1]]
    print('   demi-tour :', c0, '→', suite)
    verifier(len(suite) >= 4 and suite[-1] == (4 if c0 == 0 else 0) and 2 in suite, f'le demi-tour : elle passe par trois dessins, dont la vue de face ({suite})')
    verifier(plats == {1.0}, f'aucune image retournée à plat pendant le demi-tour ({sorted(plats)})')
    b.close()
print('ERREURS', erreurs)
print('ÉCHECS', len(echecs), echecs)
sys.exit(1 if echecs or erreurs else 0)
