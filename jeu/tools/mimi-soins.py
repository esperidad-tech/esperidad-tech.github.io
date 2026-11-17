"""Les soins refaits de Mimi (Bible §12.75 ; Romain, 16 novembre : « la brosse, elle est pas très bien faite. Le bain, on voit même pas
de bain […] Les friandises, quand on les lance, on les voit pas »), dans le vrai jeu, au doigt (Playwright) :
- le baquet : il arrive, elle y saute (plouf), elle est DEDANS (le devant du baquet devant elle, le fond derrière) ; on frotte : la mousse
  monte ; elle bondit dehors, s'ébroue, des flaques qui sèchent ; toute propre ;
- des gros plans de chaque moment (à regarder) ;
- aucun message d'erreur.
   BRUMEVAL_DIST=<dossier construit> python3 tools/mimi-soins.py [iphone]"""
import sys, os, time
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist')), 'index.html') + '#test'
OUT = os.path.join(ICI, '..', 'test', 'mimi-soins'); os.makedirs(OUT, exist_ok=True)
TEL = 'iphone' in sys.argv
erreurs, echecs = [], []
n = [0]
V = "Atelier._vue()"
CHAT = "M.S.atelier.objets.filter(function(o){ return o.t === 'chat'; })[0]"

def verifier(cond, quoi):
    print('  ✓' if cond else '  ✗', quoi, flush=True)
    if not cond: echecs.append(quoi)

def shot(pg, nom, zone=None):
    """une capture ; zone : un gros plan autour de ce cadre (x, y, w, h), deux fois plus grand"""
    n[0] += 1; f = f'{OUT}/{"tel-" if TEL else ""}{n[0]:02d}-{nom}.png'
    if zone:
        x, y, w, h = zone; m = 0.5
        clip = {'x': max(0, x - w * m), 'y': max(0, y - h * m), 'width': w * (1 + 2 * m), 'height': h * (1 + 2 * m)}
        pg.screenshot(path=f, clip=clip)
    else: pg.screenshot(path=f)

def debut(b):
    vp = {'width': 390, 'height': 844} if TEL else {'width': 1180, 'height': 820}
    pg = b.new_context(viewport=vp, has_touch=True, device_scale_factor=2).new_page()
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
    pg.evaluate("() => { window.__lus = []; M.lire = function(t){ window.__lus.push(String(t)); }; }")
    pg.evaluate("() => { M.UI.modal = null; M.P().onglet = 'role'; M.render(); }"); pg.wait_for_timeout(1200)
    return pg

def chat(pg, cid): return pg.evaluate(f"() => {V}._chat('{cid}')")
def classes(pg, cid): return pg.evaluate(f"() => {{ var d = document.querySelector('#atelier-ici [data-obj=\"{cid}\"]'); return d ? d.className : ''; }}")
def calme(pg, cid, pose='assis'):
    pg.evaluate(f"() => {{ var a = {V}; a._finJouet(); a._reveil('{cid}'); a._dehors('{cid}'); a._pose('{cid}', '{pose}'); }}"); pg.wait_for_timeout(250)
def point(pg, cid, quoi):
    q = pg.evaluate(f"() => {V}._ptChat('{cid}', '{quoi}')")
    return (q[0], q[1]) if q else None
def voir(pg, oid, dy=60):
    pg.evaluate(f"() => {{ var a = {V}, p = a._pos('{oid}'); if(p) a._voir(p.x, p.y - {dy}); }}"); pg.wait_for_timeout(400)
def cadre_sel(pg, sel):
    return pg.evaluate("(s) => { var d = document.querySelector(s); if(!d) return null; var r = d.getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; }", sel)
def attendre(pg, f, s):
    t0 = time.time()
    while time.time() - t0 < s:
        if f(): return round(time.time() - t0, 1)
        pg.wait_for_timeout(150)
    return None
def barre(pg, quoi):
    pg.evaluate("() => { var b = document.querySelector('#atelier-ici .at-mimi-bt'); if(b && document.querySelector('#atelier-ici .at-mimi-barre').hidden) b.dispatchEvent(new MouseEvent('click', {bubbles:true})); }"); pg.wait_for_timeout(400)
    return pg.evaluate("(q) => { var b = document.querySelector('#atelier-ici .at-mimi-barre [data-mimi=\"' + q + '\"]'); if(b){ b.dispatchEvent(new MouseEvent('click', {bubbles:true})); return true; } return false; }", quoi)

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = debut(b)
    for i in range(90):
        if not pg.evaluate("() => { var k = document.querySelector('#atelier-ici .at-carton'); if(k) k.dispatchEvent(new MouseEvent('click', {bubbles:true})); return !!k; }"): break
        pg.wait_for_timeout(260)
        pg.evaluate("() => { var g = document.querySelector('#atelier-ici .at-grim .at-fermer'); if(g) g.click(); }")
    pg.evaluate(f"() => {{ var a = {V}; if(a._salle() !== 0) a._allerSalle(0); }}"); pg.wait_for_timeout(600)
    cid = pg.evaluate(f"() => ({CHAT} || {{}}).id || null")
    verifier(cid is not None, 'Mimi est dans l\'atelier')
    pg.evaluate(f"() => {{ M.S.atelier.mimi.soins = ['brosse', 'bain', 'friandises', 'photo']; {CHAT}.b.propre = 30; }}")

    # ================= LE BAQUET =================
    calme(pg, cid); voir(pg, cid)
    verifier(barre(pg, 's:bain'), 'le bain, dans sa barre 🐾')
    pg.wait_for_timeout(450)
    z = cadre_sel(pg, '#atelier-ici .at-bain')
    verifier(z is not None and pg.locator('#atelier-ici .at-bain-dos').count() == 1, f'le baquet arrive : deux morceaux, le fond et le devant ({z})')
    shot(pg, 'baquet-arrive')
    m0 = pg.evaluate("() => { var g = document.querySelector('#atelier-ici .at-bain .at-bain-mousse'); return g ? getComputedStyle(g).transform : null; }")
    verifier(m0 and m0.startswith('matrix(0.03'), f'pas encore de mousse dans le baquet ({m0})')
    d = attendre(pg, lambda: 'at-dans-bain' in classes(pg, cid), 9)
    verifier(d is not None, f'elle y saute ({d} s)')
    pg.wait_for_timeout(250); shot(pg, 'baquet-plouf')
    pg.wait_for_timeout(900)
    zs = pg.evaluate(f"""() => {{ var c = document.querySelector('#atelier-ici [data-obj="{cid}"]'), f = document.querySelector('#atelier-ici .at-bain'), d = document.querySelector('#atelier-ici .at-bain-dos');
      return [parseInt(d.style.zIndex), parseInt(c.style.zIndex), parseInt(f.style.zIndex)]; }}""")
    verifier(zs[0] < zs[1] < zs[2], f'elle est DEDANS : le fond derrière elle, le devant devant elle ({zs})')
    voir(pg, cid, dy=40); pg.wait_for_timeout(500)
    z = cadre_sel(pg, '#atelier-ici .at-bain')
    shot(pg, 'baquet-dedans', z); shot(pg, 'baquet-dedans-piece')
    # (on frotte : la mousse monte)
    a = point(pg, cid, 'h'); bpt = point(pg, cid, 's')
    sous = pg.evaluate(f"([x, y]) => {{ var e = document.elementFromPoint(x, y); return e ? (e.getAttribute('class') || e.tagName) + ' / ' + ((e.closest('[data-obj]') || {{getAttribute:function(){{ return null; }}}}).getAttribute('data-obj')) + ' / ' + (e.closest('[class]') ? e.closest('[class]').className : '') : null; }}", list(a))
    print('   (sous le doigt, pour frotter :', sous, a, bpt, ')', flush=True)
    pg.mouse.move(*a); pg.mouse.down()
    for i in range(5):
        pg.mouse.move(*(bpt if i % 2 == 0 else a), steps=4); pg.wait_for_timeout(70)
    mo = pg.evaluate("() => { var f = document.querySelector('#atelier-ici .at-bain'); return f ? f.style.getPropertyValue('--bain-mousse') : null; }")
    shot(pg, 'baquet-mousse', cadre_sel(pg, '#atelier-ici .at-bain'))
    verifier(mo and 0.2 < float(mo) < 1, f'on frotte : la mousse monte ({mo})')
    for i in range(30):
        pg.mouse.move(*(bpt if i % 2 == 0 else a), steps=4); pg.wait_for_timeout(60)
        if not pg.evaluate("() => !!Atelier._vue()._mimi().bain"): break
    pg.mouse.up(); pg.wait_for_timeout(700)
    shot(pg, 'baquet-sortie')
    pg.wait_for_timeout(900)
    fl = pg.locator('#atelier-ici .at-flaque-eau').count()
    shot(pg, 'baquet-flaques')
    pr = pg.evaluate(f"() => {CHAT}.b.propre")
    verifier(pr >= 99, f'elle sort toute propre ({pr})')
    verifier(fl >= 2, f'elle s\'ébroue : des flaques par terre ({fl})')
    pg.wait_for_timeout(1500)
    verifier(pg.locator('#atelier-ici .at-bain, #atelier-ici .at-bain-dos').count() == 0, 'le baquet s\'en va')
    # ================= LA BROSSE, DANS LE SENS DU POIL =================
    pg.wait_for_timeout(2500)
    pg.evaluate(f"() => {{ {CHAT}.b.propre = 30; }}")
    calme(pg, cid); voir(pg, cid); pg.wait_for_timeout(600)
    verifier(barre(pg, 's:brosse'), 'la brosse, dans sa barre 🐾'); pg.wait_for_timeout(500)
    tete, hanches = point(pg, cid, 's'), point(pg, cid, 'h')
    def flottes(): return pg.evaluate("() => [].map.call(document.querySelectorAll('#atelier-ici .at-flotte'), function(x){ return x.textContent; })")
    def coups(): return pg.evaluate("() => { var v = Atelier._vue(); return v._outil ? v._outil() : null; }")
    # (à rebrousse-poil : de la queue vers la tête)
    dx, dy = tete[0] - hanches[0], tete[1] - hanches[1]
    pg.mouse.move(hanches[0] - dx * 0.4, hanches[1] - dy * 0.4); pg.mouse.down()
    pg.mouse.move(tete[0] + dx * 0.5, tete[1] + dy * 0.5, steps=10); pg.wait_for_timeout(120)
    f1 = flottes(); cl = classes(pg, cid)
    shot(pg, 'brosse-rebours', cadre_sel(pg, f'#atelier-ici [data-obj="{cid}"]'))
    pg.mouse.up(); pg.wait_for_timeout(300)
    verifier(any('Frrr' in x for x in f1) and 'at-x-agace' in cl, f'à rebrousse-poil : « Frrr ! », les oreilles en arrière ({f1})')
    verifier(pg.evaluate(f"() => {CHAT}.b.propre") < 40, 'à rebrousse-poil : ça ne compte pas')
    # (dans le sens du poil : de la tête vers la queue, en levant le doigt entre deux coups)
    n0 = 0
    print('   (sa vue :', pg.evaluate(f"() => ({V}._pantin('{cid}') || {{}}).vue"), ', épaules → hanches :', round(((hanches[0] - tete[0]) ** 2 + (hanches[1] - tete[1]) ** 2) ** 0.5), 'points )')
    for i in range(14):
        tete, hanches = point(pg, cid, 's'), point(pg, cid, 'h')
        dx, dy = hanches[0] - tete[0], hanches[1] - tete[1]
        # (un vrai coup de brosse, d'au moins 80 points : vue de face, ses épaules et ses hanches sont tout près l'une de l'autre à l'écran)
        ln = max(1, (dx * dx + dy * dy) ** 0.5); L = max(ln * 1.7, 80); ux, uy = dx / ln, dy / ln; mx, my = (tete[0] + hanches[0]) / 2, (tete[1] + hanches[1]) / 2
        pg.mouse.move(mx - ux * L / 2, my - uy * L / 2); pg.mouse.down()
        pg.mouse.move(mx + ux * L / 2, my + uy * L / 2, steps=6); pg.wait_for_timeout(90)
        if i == 4: shot(pg, 'brosse-sens', cadre_sel(pg, f'#atelier-ici [data-obj="{cid}"]'))
        pg.mouse.up(); pg.wait_for_timeout(140)
        if not pg.evaluate("() => Atelier._vue()._mimi().outil"): n0 = i + 1; break
    pr = pg.evaluate(f"() => {CHAT}.b.propre")
    verifier(n0 and pr >= 99, f'dans le sens du poil : en {n0} coups de brosse, un pelage tout propre, la brosse se range ({pr})')
    # (vue de face — elle vient vers nous et s'assoit, face à nous — : de sa tête vers son ventre, ça compte aussi)
    pg.wait_for_timeout(1500)
    pg.evaluate(f"() => {{ {CHAT}.b.propre = 30; }}")
    calme(pg, cid)
    # (elle remonte vers le fond, puis revient tout droit vers nous : elle s'assoit face à nous)
    pg.evaluate(f"() => {V}._va('{cid}', 600, 600)")
    attendre(pg, lambda: not pg.evaluate(f"() => {V}._chat('{cid}').anim"), 8); pg.wait_for_timeout(400)
    pg.evaluate(f"() => {V}._va('{cid}', 600, 800)")
    attendre(pg, lambda: not pg.evaluate(f"() => {V}._chat('{cid}').anim"), 8); pg.wait_for_timeout(500)
    voir(pg, cid); pg.wait_for_timeout(500)
    barre(pg, 's:brosse'); pg.wait_for_timeout(500)
    tete, hanches = point(pg, cid, 's'), point(pg, cid, 'h')
    vue = pg.evaluate(f"() => ({V}._pantin('{cid}') || {{}}).vue")
    print('   (de face ? sa vue :', vue, ', épaules', [round(v) for v in tete], 'hanches', [round(v) for v in hanches], ')')
    cad = cadre_sel(pg, f'#atelier-ici [data-obj="{cid}"]')
    n1 = 0
    for i in range(14):
        # (un coup de brosse tout droit vers le bas, sur elle : du haut de sa tête jusqu'à ses pattes)
        tete, hanches = point(pg, cid, 's'), point(pg, cid, 'h')
        mx = (tete[0] + hanches[0]) / 2
        pg.mouse.move(mx, tete[1] - 22); pg.mouse.down()
        pg.mouse.move(mx, hanches[1] + 34, steps=6); pg.wait_for_timeout(90)
        pg.mouse.up(); pg.wait_for_timeout(140)
        if not pg.evaluate("() => Atelier._vue()._mimi().outil"): n1 = i + 1; break
    shot(pg, 'brosse-de-face', cad)
    pr = pg.evaluate(f"() => {CHAT}.b.propre")
    verifier(n1 and pr >= 99, f'assise face à nous ({vue}) : de sa tête vers ses pattes, ça compte aussi — en {n1} coups ({pr})')
    if not n1: pg.evaluate("() => { var v = Atelier._vue(); if(v._finJouet) v._finJouet(); }"); pg.mouse.click(5, 5)
    # (l'aller-retour, le doigt posé : ça marche aussi, le retour ne compte pas)
    pg.wait_for_timeout(1500)
    pg.evaluate(f"() => {{ {CHAT}.b.propre = 30; }}")
    calme(pg, cid); voir(pg, cid); pg.wait_for_timeout(600)
    barre(pg, 's:brosse'); pg.wait_for_timeout(500)
    tete, hanches = point(pg, cid, 's'), point(pg, cid, 'h')
    pg.mouse.move(*tete); pg.mouse.down()
    for i in range(40):
        pg.mouse.move(*(hanches if i % 2 == 0 else tete), steps=4); pg.wait_for_timeout(60)
        if not pg.evaluate("() => Atelier._vue()._mimi().outil"): break
    pg.mouse.up(); pg.wait_for_timeout(500)
    pr = pg.evaluate(f"() => {CHAT}.b.propre"); f2 = flottes()
    verifier(pr >= 99, f'l\'aller-retour, le doigt posé : ça marche aussi ({pr})')

    # ================= LA FRIANDISE QU'ON VOIT VOLER =================
    for rate in (False, True):
        pg.wait_for_timeout(3500)
        pg.evaluate("() => { M.S.atelier.tama.friand = 0; M.S.atelier.tama.las = {}; }")
        calme(pg, cid); voir(pg, cid); pg.wait_for_timeout(500)
        pg.evaluate("() => { var b = document.querySelector('#atelier-ici .at-mimi-bt'); if(b && document.querySelector('#atelier-ici .at-mimi-barre').hidden) b.dispatchEvent(new MouseEvent('click', {bubbles:true})); }"); pg.wait_for_timeout(400)
        pg.evaluate("(r) => { var vrai = Math.random; Math.random = function(){ return r ? 0.1 : 0.9; }; var b = document.querySelector('#atelier-ici .at-mimi-barre [data-mimi=\"s:friandises\"]'); b.dispatchEvent(new MouseEvent('click', {bubbles:true})); Math.random = vrai; }", rate)
        pg.wait_for_timeout(380)
        bi = cadre_sel(pg, '#atelier-ici .at-biscuit')
        shot(pg, 'friandise-vole' + ('-ratee' if rate else ''))
        verifier(bi is not None and bi[2] > 8, f'la friandise' + (' (ratée)' if rate else '') + f' : on la voit voler ({bi})')
        if not rate:
            pg.wait_for_timeout(330)
            shot(pg, 'friandise-attrape', cadre_sel(pg, f'#atelier-ici [data-obj="{cid}"]'))
            d = attendre(pg, lambda: any('Crac' in x for x in flottes()), 2)
            verifier(d is not None, f'elle l\'attrape au vol : « Crac ! »')
        else:
            pg.wait_for_timeout(1100)
            shot(pg, 'friandise-tapie', cadre_sel(pg, f'#atelier-ici [data-obj="{cid}"]'))
            d = attendre(pg, lambda: any('Attrap' in x for x in flottes()), 3)
            verifier(d is not None, f'ratée : elle se tapit et lui saute dessus : « Attrapée ! »')
        d = attendre(pg, lambda: 'friandises' in pg.evaluate("() => M.S.atelier.tama.las || {}"), 3.6)
        verifier(d is not None, 'ça compte : elle a eu sa friandise')
        verifier(pg.locator('#atelier-ici .at-biscuit').count() == 0, 'le biscuit ne traîne pas')
    print('ERREURS :', erreurs[:6])
    verifier(not erreurs, 'aucun message d\'erreur')
    b.close()
print(f'\n{len(echecs)} échec(s)' + (' : ' + ' | '.join(echecs) if echecs else ''))
sys.exit(1 if echecs else 0)
