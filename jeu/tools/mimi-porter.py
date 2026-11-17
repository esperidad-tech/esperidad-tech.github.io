"""Porter Mimi, AVEC DE VRAIS GESTES DU DOIGT (Romain, 17 novembre : « elle demande qu'on la porte vers son panier. Mais on ne peut
plus la porter. Du coup, on ne peut pas réussir ce qu'elle demande. »). Le robot de Mimi (mimi.py) passait par un raccourci
(`_poserSur`) : il disait « ça marche » alors qu'au doigt, c'était impossible. Ici, rien que le doigt :
- un toucher, le doigt qu'on laisse, le doigt qui gratte large : elle n'est pas soulevée ;
- le doigt posé sur elle qui s'en va : elle est soulevée (elle pend, les pattes ballantes), elle suit le doigt ;
- lâchée par terre : elle s'assoit là ;
- son envie de sieste (la bulle au panier) : portée jusqu'à son panier, elle pétrit, s'endort, « Pile poil ! » ;
- lâchée un peu à côté du panier : elle s'y retrouve quand même ;
- le coussin aussi est un coin douillet ;
- endormie, on la soulève : elle se réveille ;
- au téléphone, le panier hors de l'écran : au bord, la pièce défile, on arrive au panier ;
- la brosse en main : le doigt qui déborde ne la soulève pas ; le bain : on frotte encore quand elle bondit dehors, on ne la rattrape pas ;
- aucun message d'erreur.
   BRUMEVAL_DIST=<dossier construit> python3 tools/mimi-porter.py [iphone]"""
import sys, os, time
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist')), 'index.html') + '#test'
OUT = os.path.join(ICI, '..', 'test', 'mimi-porter'); os.makedirs(OUT, exist_ok=True)
TEL = 'iphone' in sys.argv
erreurs, echecs = [], []
n = [0]
V = "Atelier._vue()"
CHAT = "M.S.atelier.objets.filter(function(o){ return o.t === 'chat'; })[0]"

def shot(pg, nom):
    n[0] += 1; pg.screenshot(path=f'{OUT}/{"tel-" if TEL else ""}{n[0]:02d}-{nom}.png')

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
    pg.evaluate("() => { window.__lus = []; M.lire = function(t){ window.__lus.push(String(t)); }; }")
    pg.evaluate("() => { M.UI.modal = null; M.P().onglet = 'role'; M.render(); }"); pg.wait_for_timeout(1200)
    return pg

def chat(pg, cid): return pg.evaluate(f"() => {V}._chat('{cid}')")
def classes(pg, cid): return pg.evaluate(f"() => {{ var d = document.querySelector('#atelier-ici [data-obj=\"{cid}\"]'); return d ? d.className : ''; }}")
def toast(pg): return pg.evaluate("() => { var t = document.querySelector('#atelier-ici .at-toast'); return t && !t.hidden ? t.textContent : ''; }")
def sur(pg, cid): return pg.evaluate(f"() => {{ var c = M.S.atelier.objets.filter(function(o){{ return o.id === '{cid}'; }})[0]; return c && c.sur ? c.sur.o : null; }}")
def calme(pg, cid, pose='assis'):
    pg.evaluate(f"() => {{ var a = {V}; a._finJouet(); a._reveil('{cid}'); a._dehors('{cid}'); a._pose('{cid}', '{pose}'); }}"); pg.wait_for_timeout(250)
def point(pg, cid, quoi):
    q = pg.evaluate(f"() => {V}._ptChat('{cid}', '{quoi}')")
    return (q[0], q[1]) if q else None
def voir(pg, oid, dy=60):
    pg.evaluate(f"() => {{ var a = {V}, p = a._pos('{oid}'); if(p) a._voir(p.x, p.y - {dy}); }}"); pg.wait_for_timeout(400)
def sur_chat(pg, cid, quoi, pose='assis', bouger=True):
    """une place où on la voit, et un point du dessin qui est bien sur elle (pas caché par un meuble, une bulle)"""
    q = None
    for i in range(8):
        if bouger: calme(pg, cid, pose); voir(pg, cid)
        pg.wait_for_timeout(900); q = point(pg, cid, quoi)
        if q and pg.evaluate(f"() => {{ var e = document.elementFromPoint({q[0]}, {q[1]}), o = e && e.closest('[data-obj]'); return !!o && o.getAttribute('data-obj') === '{cid}' && !e.closest('.at-bulle'); }}"): return q
        bouger = True
    return q
def cadre(pg, oid):
    return pg.evaluate(f"() => {{ var d = document.querySelector('#atelier-ici [data-obj=\"{oid}\"]'); if(!d) return null; var r = d.getBoundingClientRect(); return {{x:r.left, y:r.top, w:r.width, h:r.height}}; }}")
def ecran(pg): return pg.evaluate("() => { var p = document.querySelector('#atelier-ici .at-piece') || document.querySelector('#atelier-ici'); var r = p.getBoundingClientRect(); return {x:r.left, y:r.top, w:r.width, h:r.height, W:innerWidth, H:innerHeight}; }")
def glisser(pg, a, b, pas=18, ms=22):
    for i in range(1, pas + 1):
        pg.mouse.move(a[0] + (b[0] - a[0]) * i / pas, a[1] + (b[1] - a[1]) * i / pas); pg.wait_for_timeout(ms)

def dessus(pg, oid, x, y):
    """ce point de l'écran est-il bien SUR ce meuble (et pas sous un bouton de l'écran, ni sous un autre meuble) ?"""
    return pg.evaluate("([id, x, y]) => { var e = document.elementFromPoint(x, y), o = e && e.closest('[data-obj]'); return !!o && o.getAttribute('data-obj') === id && !e.closest('button'); }", [oid, x, y])
def libre(pg, x, y):
    """là, on peut lâcher le doigt : bien dans la pièce, ni sur un bouton de l'écran, ni sur le bouton de la chambre ou l'arche
    (lâchée là, elle changerait de pièce — c'est voulu dans le jeu, pas dans ce robot)"""
    e = ecran(pg)
    # (à moins de 44 points du bord de l'écran, la pièce défile pendant qu'on porte : le meuble glisserait sous le doigt)
    if not (e['x'] + 64 < x < e['x'] + e['w'] - 64 and e['y'] + 64 < y < e['y'] + e['h'] - 64): return False
    return not pg.evaluate("""([x, y]) => [[0, 0], [14, 0], [-14, 0], [0, 14], [0, -14]].some(function(d){ return document.elementsFromPoint(x + d[0], y + d[1]).some(function(e){
      return (e.tagName === 'BUTTON' && !e.closest('[data-obj]')) || (e.closest && (e.closest('.at-arche') || e.closest('.at-salle') || e.closest('.at-coin'))); }); })""", [x, y])
def porter(pg, cid, oid, dx=0, dy=0, photo=None, loin=False, bords=None):
    """le doigt posé sur son dos, puis qui s'en va jusqu'au meuble oid ; on lâche. Le meuble est d'abord amené au milieu de l'écran
    (pas sous les boutons du bas : lâchée sur le bouton 🛏️, elle partirait dans la chambre), et Mimi posée quelque part à l'écran.
    loin (au téléphone) : le meuble est hors de l'écran — le doigt va au bord, la pièce défile, on arrive au meuble.
    bords : plusieurs endroits du meuble où lâcher (des décalages depuis son milieu) — le premier qui est libre à l'écran.
    Renvoie ce qu'on a vu juste avant de lâcher : soulevée ? la pièce a défilé ? (echec : aucune place pour faire le geste)"""
    off = [dx, dy]
    def cible():
        c = cadre(pg, oid)
        return None if not c else (c['x'] + c['w'] / 2 + off[0], c['y'] + c['h'] * 0.45 + off[1])
    # (Mimi va s'asseoir à côté du meuble, à une distance choisie — pas au hasard : sinon, un coup sur dix, elle est déjà dessus,
    #  ou derrière le chaudron, et c'est le robot qui se trompe, pas le jeu)
    q = t = None
    po = pg.evaluate(f"() => {V}._pos('{oid}')")
    for sg, d in ((1, 230), (-1, 230), (1, 300), (-1, 300), (1, 170), (-1, 170), (1, 360), (-1, 360)) if not loin else ((1, 520), (-1, 520), (1, 420), (-1, 420)):
        if po['x'] < 600: sg = sg
        else: sg = -sg
        x, y = po['x'] + sg * d, po['y'] + 34
        pg.evaluate(f"() => {{ var a = {V}; a._finJouet(); a._reveil('{cid}'); a._va('{cid}', {x}, {y}, 2); }}")
        attendre(pg, lambda: not chat(pg, cid)['anim'], 6)
        pg.evaluate(f"() => {V}._pose('{cid}', 'assis')"); pg.wait_for_timeout(500)
        pc = pg.evaluate(f"() => {V}._pos('{cid}')")
        if abs(pc['x'] - po['x']) < d * 0.6: continue      # (un mur, un meuble : elle n'a pas pu aller jusque-là)
        if loin: pg.evaluate(f"() => {V}._voir({pc['x'] + (40 if pc['x'] > po['x'] else -40)}, {pc['y'] - 70})")
        else: pg.evaluate(f"() => {V}._voir({(pc['x'] + po['x']) / 2}, {po['y'] - 20})")      # (le meuble au milieu de l'écran, en hauteur aussi : loin des boutons du bas)
        pg.wait_for_timeout(900)
        q = point(pg, cid, 'dos'); t = cible()
        sur_elle = q and pg.evaluate(f"() => {{ var e = document.elementFromPoint({q[0]}, {q[1]}), o = e && e.closest('[data-obj]'); return !!o && o.getAttribute('data-obj') === '{cid}' && !e.closest('.at-bulle'); }}")
        if not (sur_elle and t): continue
        if loin: break
        trouve = False
        for b in (bords or [(dx, dy)]):      # (le meuble est bien sous le doigt à l'arrivée : ni bouton, ni autre meuble devant)
            off[:] = [b[0], b[1]]; t = cible()
            # (et un vrai trajet : le doigt doit bien s'éloigner d'elle — à moins de trente points de son pelage, ce sont des gratouilles)
            loin_d_elle = t and abs(t[0] - q[0]) + abs(t[1] - q[1]) > 150
            if t and loin_d_elle and libre(pg, *t) and dessus(pg, oid, t[0] - off[0] * 0.5, t[1] - off[1] * 0.5): trouve = True; break
        if trouve: break
        t = None
    vu = {'levee': False, 'portee': False, 'defile': False, 'tenu': False, 'echec': False, 'bouton': False}
    if not q or not t:
        print('   (le robot n\'a pas trouvé de place pour faire le geste)', flush=True); vu['echec'] = True
        return vu
    pg.mouse.move(*q); pg.mouse.down(); pg.wait_for_timeout(140)
    e = ecran(pg)
    def dedans(t): return t and e['x'] + 30 < t[0] < e['x'] + e['w'] - 30 and e['y'] + 30 < t[1] < e['y'] + e['h'] - 30
    ici = q
    if not dedans(t):
        # (le meuble n'est pas à l'écran : le doigt va au bord, de son côté, et attend que la pièce défile)
        bord = (e['x'] + e['w'] - 16 if t[0] > e['x'] + e['w'] / 2 else e['x'] + 16, min(max(q[1], e['y'] + 150), e['y'] + e['h'] - 260))
        glisser(pg, ici, bord); ici = bord
        t0 = time.time()
        while time.time() - t0 < 9:
            pg.mouse.move(bord[0], bord[1] + (1 if int((time.time() - t0) * 10) % 2 else -1)); pg.wait_for_timeout(120)
            t = cible()
            if t and e['x'] + 90 < t[0] < e['x'] + e['w'] - 90: break
        vu['defile'] = True
    mi = (ici[0] + (t[0] - ici[0]) * 0.55, ici[1] + (t[1] - ici[1]) * 0.55 - 30)
    glisser(pg, ici, mi); pg.wait_for_timeout(300)
    t = cible() or t
    glisser(pg, mi, t); pg.wait_for_timeout(120)
    t2 = cible() or t
    if abs(t2[0] - t[0]) + abs(t2[1] - t[1]) > 4: glisser(pg, t, t2, pas=6); t = t2
    pg.wait_for_timeout(350)
    cl = classes(pg, cid); vu['levee'] = 'at-leve' in cl; vu['portee'] = 'at-c-portee' in cl; vu['tenu'] = chat(pg, cid)['tenu']
    vu['bouton'] = not libre(pg, *t); vu['off'] = [round(off[0]), round(off[1])]; vu['t'] = [round(t[0]), round(t[1])]
    if photo: shot(pg, photo)
    pg.mouse.up(); pg.wait_for_timeout(350)
    return vu

def par_terre(pg, q, coins, loin=120):
    """un point de l'écran loin des coins douillets (le panier, le coussin) et assez loin d'elle — à côté si on peut (du côté du milieu
    de la pièce d'abord), sinon plus haut sur le plancher (un téléphone est étroit)"""
    e = ecran(pg); cs = [cadre(pg, c) for c in coins]; sg = 1 if q[0] < e['x'] + e['w'] / 2 else -1
    for d in ((200 * sg, -10), (270 * sg, -10), (140 * sg, -10), (-200 * sg, -10), (-140 * sg, -10), (120 * sg, -150), (-120 * sg, -150), (0, -190), (120 * sg, 150), (-120 * sg, 150)):
        x, y = q[0] + d[0], q[1] + d[1]
        if not (e['x'] + 60 < x < e['x'] + e['w'] - 60 and e['y'] + 150 < y < e['y'] + e['h'] - 150): continue
        # (ni sur un bouton de l'écran, ni sur l'arche de la chambre : lâchée là, elle changerait de pièce)
        if pg.evaluate("([x, y]) => document.elementsFromPoint(x, y).some(function(e){ return e.tagName === 'BUTTON' || (e.closest && (e.closest('.at-arche') || e.closest('.at-salle'))); })", [x, y]): continue
        if all(c is None or x < c['x'] - loin or x > c['x'] + c['w'] + loin or y < c['y'] - 150 or y > c['y'] + c['h'] + 170 for c in cs): return (x, y)
    return (q[0] + 200 * sg, q[1] - 10)

def installer(pg, motif):
    """sort du carton du coin 📦 ce dont le nom dit « motif »"""
    for i in range(12):
        pg.evaluate("() => { var c = document.querySelector('#atelier-ici .at-coin'); if(c) c.dispatchEvent(new MouseEvent('click', {bubbles:true})); }"); pg.wait_for_timeout(350)
        k = pg.evaluate("""(m) => { var l = [].slice.call(document.querySelectorAll('#atelier-ici [data-res]')); var b = l.filter(function(x){ return new RegExp(m).test(x.textContent); })[0];
          if(b){ b.dispatchEvent(new MouseEvent('click', {bubbles:true})); return b.textContent; } return null; }""", motif)
        pg.wait_for_timeout(400)
        pg.evaluate("() => { var g = document.querySelector('#atelier-ici .at-grim .at-fermer'); if(g) g.click(); }")
        if not k: break

def attendre(pg, f, s):
    t0 = time.time()
    while time.time() - t0 < s:
        if f(): return round(time.time() - t0, 1)
        pg.wait_for_timeout(250)
    return None

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = debut(b)
    for i in range(90):
        if not pg.evaluate("() => { var k = document.querySelector('#atelier-ici .at-carton'); if(k) k.dispatchEvent(new MouseEvent('click', {bubbles:true})); return !!k; }"): break
        pg.wait_for_timeout(260)
        pg.evaluate("() => { var g = document.querySelector('#atelier-ici .at-grim .at-fermer'); if(g) g.click(); }")
    pg.evaluate("() => { M.S.atelier.reserve.push({id:'cz1', t:'coussin', st:0, v:0}); }")
    installer(pg, 'Gamelle|Litière|Distributeur|Panier|Coussin')
    pg.evaluate(f"() => {{ var a = {V}; if(a._salle() !== 0) a._allerSalle(0); }}"); pg.wait_for_timeout(600)
    cid = pg.evaluate(f"() => ({CHAT} || {{}}).id || null")
    pid = pg.evaluate("() => (M.S.atelier.objets.filter(function(o){ return o.t === 'panier'; })[0] || {}).id || null")
    zid = pg.evaluate("() => (M.S.atelier.objets.filter(function(o){ return o.t === 'coussin'; })[0] || {}).id || null")
    print('chat', cid, 'panier', pid, 'coussin', zid, flush=True)
    verifier(cid and pid and zid, 'Mimi, son panier et un coussin sont dans l\'atelier')
    pg.evaluate(f"() => {{ var a = {V}; a._envie(null); M.S.atelier.tama.las = {{}}; {CHAT}.bh = 20; }}")

    # --- ce qui ne la soulève pas ---
    q = sur_chat(pg, cid, 'dos')
    pg.mouse.move(*q); pg.mouse.down(); pg.wait_for_timeout(60); pg.mouse.up(); pg.wait_for_timeout(300)
    verifier('at-leve' not in classes(pg, cid) and not chat(pg, cid)['tenu'], 'un toucher : elle n\'est pas soulevée')
    pg.wait_for_timeout(1800)
    q = sur_chat(pg, cid, 'tete')
    pg.mouse.move(*q); pg.mouse.down(); pg.wait_for_timeout(1300)
    c1 = chat(pg, cid)
    # (on gratte large : le doigt déborde un peu d'elle, des deux côtés)
    bo = cadre(pg, cid); large = 34
    for i in range(10):
        pg.mouse.move(q[0] + (large if i % 2 else -large), q[1] + (3 if i % 2 else -3), steps=5); pg.wait_for_timeout(90)
    c2 = chat(pg, cid); cl = classes(pg, cid)
    pg.mouse.up(); pg.wait_for_timeout(400)
    verifier(c1['caresse'] is not None and not c1['tenu'], f'le doigt qu\'on laisse sur elle : des gratouilles ({c1["caresse"]}), elle n\'est pas soulevée')
    verifier('at-leve' not in cl and not c2['tenu'], f'on gratte large (le doigt va et vient de {large} px de chaque côté de sa tête : il déborde de son pelage) : elle n\'est pas soulevée')

    # --- le doigt posé sur elle qui s'en va : on la porte ; lâchée par terre, elle s'assoit là ---
    q = sur_chat(pg, cid, 'dos')
    p0 = pg.evaluate(f"() => {V}._pos('{cid}')")
    but = par_terre(pg, q, [pid, zid])
    pg.mouse.move(*q); pg.mouse.down(); pg.wait_for_timeout(140)
    doigt = ((q[0] + but[0]) / 2 + (0 if abs(but[0] - q[0]) > 100 else 90 * (1 if q[0] < ecran(pg)['W'] / 2 else -1)), (q[1] + but[1]) / 2 - 70)
    glisser(pg, q, doigt)
    pg.wait_for_timeout(600)
    cl = classes(pg, cid); c = chat(pg, cid)
    shot(pg, 'portee')
    bc = cadre(pg, cid)
    verifier('at-leve' in cl and 'at-c-portee' in cl and c['tenu'], 'le doigt posé sur elle s\'en va : elle est soulevée, elle pend au bout de nos bras')
    verifier(bc['x'] - 30 < doigt[0] < bc['x'] + bc['w'] + 30 and bc['y'] - 30 < doigt[1] < bc['y'] + bc['h'] + 30, f'elle suit le doigt (elle est sous lui : {bc}, le doigt {doigt})')
    glisser(pg, doigt, but); pg.mouse.up(); pg.wait_for_timeout(900)
    p1 = pg.evaluate(f"() => {V}._pos('{cid}')"); c = chat(pg, cid); cl = classes(pg, cid)
    verifier(not c['tenu'] and 'at-leve' not in cl and 'at-c-portee' not in cl and c['pose'] == 'assis', f'lâchée : elle est assise ({c["pose"]})')
    verifier(abs(p1['x'] - p0['x']) + abs(p1['y'] - p0['y']) > 50, f'… là où on l\'a posée (de {round(p0["x"])}, {round(p0["y"])} à {round(p1["x"])}, {round(p1["y"])})')
    shot(pg, 'lachee')

    # --- son envie de sieste : la bulle, le conteur, et on la porte jusqu'à son panier ---
    pg.evaluate(f"() => {{ var a = {V}; M.S.atelier.tama.las = {{}}; {CHAT}.bh = 20; a._envie('dodo', true); window.__lus = []; }}"); pg.wait_for_timeout(300)
    bul = None
    for i in range(10):
        calme(pg, cid); voir(pg, cid); pg.wait_for_timeout(600)
        bul = pg.evaluate(f"() => {{ var d = document.querySelector('#atelier-ici [data-obj=\"{cid}\"] .at-bulle'); if(!d || d.hidden) return null; var r = d.getBoundingClientRect(); if(r.width < 4) return null; var x = r.left + r.width / 2, y = r.top + r.height / 2, e = document.elementFromPoint(x, y); return e && e.closest('.at-bulle') === d ? [x, y] : null; }}")
        if bul: break      # (sa bulle est bien sous le doigt : pas derrière le chaudron, pas sous un bouton)
    if not bul: print('   (pas de bulle :', classes(pg, cid), pg.evaluate(f"() => {{ var d = document.querySelector('#atelier-ici [data-obj=\"{cid}\"] .at-bulle'); return d ? d.outerHTML.slice(0, 200) : null; }}"), pg.evaluate(f"() => {V}._envie()"), ')')
    if bul:
        pg.mouse.move(*bul); pg.mouse.down(); pg.wait_for_timeout(60); pg.mouse.up(); pg.wait_for_timeout(500)
        t = toast(pg); print('   le conteur :', t)
        verifier('porter' in t and 'doigt' in t, 'sa bulle au panier : le conteur dit qu\'on la porte, et comment')
        verifier('at-dispo' in classes(pg, pid), '… et son panier brille')
        shot(pg, 'bulle-panier')
        pg.wait_for_timeout(1200)
    else: verifier(False, 'sa bulle au panier est là')
    vu = porter(pg, cid, pid, photo='vers-panier', bords=[(0, 0), (0, -0.25 * cadre(pg, pid)['h']), (0, 0.2 * cadre(pg, pid)['h'])])
    print('   en route :', vu)
    verifier(vu['levee'] and vu['tenu'], 'on la porte vers son panier')
    pg.wait_for_timeout(500)
    verifier(sur(pg, cid) == pid, f'lâchée sur son panier : elle y est ({sur(pg, cid)})')
    shot(pg, 'panier-petrit')
    pile = [False]
    def dort_et_pile():
        if pg.evaluate("() => [].slice.call(document.querySelectorAll('#atelier-ici .at-flotte')).some(function(x){ return /Pile poil/.test(x.textContent); })"): pile[0] = True
        return chat(pg, cid)['dort'] and pile[0]
    d = attendre(pg, dort_et_pile, 8)
    verifier(chat(pg, cid)['dort'], f'elle pétrit, tourne sur elle-même et s\'endort ({d} s)')
    verifier(pg.evaluate(f"() => {V}._envie()") is None, 'son envie de sieste est exaucée')
    verifier(pile[0], '« Pile poil ! » s\'envole au-dessus d\'elle')
    shot(pg, 'panier-dort')

    # --- au téléphone : le panier est hors de l'écran — le doigt au bord, la pièce défile, on y arrive ---
    if TEL:
        pg.evaluate(f"() => {{ var a = {V}; M.S.atelier.tama.las = {{}}; a._reveil('{cid}'); a._envie('dodo', true); }}")
        vu = porter(pg, cid, pid, loin=True, photo='au-bord')
        print('   au bord de l\'écran :', vu)
        pg.wait_for_timeout(500)
        if vu['bouton']: print('   (le panier s\'est arrêté sous un bouton de l\'écran : pas de verdict)')
        else:
            verifier(vu['defile'] and vu['levee'], 'le panier hors de l\'écran : le doigt au bord, la pièce défile, elle est toujours dans nos bras')
            verifier(sur(pg, cid) == pid, f'… et lâchée sur son panier, elle y est ({sur(pg, cid)})')
        attendre(pg, lambda: chat(pg, cid)['dort'], 6)
    # --- endormie, on la soulève : elle se réveille ; lâchée un peu à côté du panier : elle s'y retrouve ---
    verifier(chat(pg, cid)['dort'], '(elle dort dans son panier)')
    voir(pg, cid); pg.wait_for_timeout(500)
    q = point(pg, cid, 'dos') or (cadre(pg, cid)['x'] + cadre(pg, cid)['w'] / 2, cadre(pg, cid)['y'] + cadre(pg, cid)['h'] / 2)
    but = par_terre(pg, q, [pid, zid])
    pg.mouse.move(*q); pg.mouse.down(); pg.wait_for_timeout(500)
    glisser(pg, q, but); pg.wait_for_timeout(300)
    c = chat(pg, cid)
    verifier(c['tenu'] and not c['dort'], 'endormie, on la soulève : elle se réveille')
    pg.mouse.up(); pg.wait_for_timeout(1200)
    verifier(sur(pg, cid) is None and chat(pg, cid)['pose'] == 'assis', f'lâchée par terre, loin du panier : elle reste par terre ({sur(pg, cid)})')
    pc = cadre(pg, pid); zc = cadre(pg, zid)
    cote = -1 if zc and zc['x'] + zc['w'] / 2 > pc['x'] + pc['w'] / 2 else 1      # (du côté où il n'y a pas le coussin d'abord)
    vu = porter(pg, cid, pid, bords=[(sg * (pc['w'] * 0.5 - 2), k * pc['h']) for sg in (cote, -cote) for k in (0.3, 0.05, -0.2)])
    pg.wait_for_timeout(500)
    if sur(pg, cid) != pid: print('   (AU BORD :', vu, 'décalage', vu.get('off'), 'doigt', vu.get('t'), cote, pc, pg.evaluate(f"() => {{ var a = {V}; return [a._pos('{cid}'), a._pos('{pid}'), a._k ? a._k() : null]; }}"), cadre(pg, cid), ')'); shot(pg, 'debug-bord')
    verifier(sur(pg, cid) == pid, f'lâchée au bord du panier (pas dans le creux) : elle s\'y retrouve quand même ({sur(pg, cid)})')
    d = attendre(pg, lambda: chat(pg, cid)['dort'], 6)
    verifier(d is not None, f'… et s\'y endort ({d} s)')

    # --- le coussin aussi ---
    pg.evaluate(f"() => {{ var a = {V}; M.S.atelier.tama.las = {{}}; a._reveil('{cid}'); a._envie('dodo', true); }}")
    vu = porter(pg, cid, zid, photo='vers-coussin', bords=[(0, 0), (0, -0.25 * cadre(pg, zid)['h']), (0, 0.2 * cadre(pg, zid)['h'])])
    pg.wait_for_timeout(500)
    if sur(pg, cid) != zid: print('   (pas sur le coussin :', vu, pg.evaluate(f"() => {{ var a = {V}; return [a._pos('{cid}'), a._pos('{zid}'), a._pos('{pid}')].map(function(p){{ return p ? [Math.round(p.x), Math.round(p.y)] : null; }}); }}"), chat(pg, cid), ')', flush=True); shot(pg, 'pas-sur-le-coussin')
    verifier(sur(pg, cid) == zid, f'portée sur un coussin : elle y est ({sur(pg, cid)})')
    d = attendre(pg, lambda: chat(pg, cid)['dort'], 6)
    d2 = attendre(pg, lambda: pg.evaluate(f"() => {V}._envie()") is None, 6)
    verifier(d is not None and d2 is not None, f'elle s\'y endort, et son envie de sieste est exaucée ({d} s, {d2} s)')
    voir(pg, cid); shot(pg, 'coussin-dort')

    # --- elle n'est pas là pour ça : la brosse en main, le doigt qui déborde ne la soulève pas ---
    r = pg.evaluate(f"() => {{ var a = {V}; a._reveil('{cid}'); M.S.atelier.mimi.soins = ['brosse', 'bain', 'friandises', 'photo']; return true; }}")
    calme(pg, cid); voir(pg, cid)
    pg.evaluate("() => { var b = document.querySelector('#atelier-ici .at-mimi-bt'); if(b) b.dispatchEvent(new MouseEvent('click', {bubbles:true})); }"); pg.wait_for_timeout(400)
    ok = pg.evaluate("() => { var b = document.querySelector('#atelier-ici .at-mimi-barre [data-mimi=\"s:brosse\"]'); if(b){ b.dispatchEvent(new MouseEvent('click', {bubbles:true})); return true; } return [].slice.call(document.querySelectorAll('#atelier-ici .at-mimi-barre button')).map(function(x){ return x.outerHTML.slice(0, 90); }); }")
    pg.wait_for_timeout(500)
    if ok is True:
        q = sur_chat(pg, cid, 'dos', bouger=False)
        pg.mouse.move(*q); pg.mouse.down(); pg.wait_for_timeout(200)
        glisser(pg, q, (q[0] + 170, q[1] - 40)); pg.wait_for_timeout(200)
        c = chat(pg, cid); cl = classes(pg, cid)
        pg.mouse.up(); pg.wait_for_timeout(300)
        verifier('at-leve' not in cl and not c['tenu'], 'la brosse en main : le doigt qui s\'en va ne la soulève pas')
        # (on finit le coup de brosse, comme un joueur : la brosse se range toute seule — sinon elle resterait en main pour le bain)
        for i in range(14):      # (de sa tête vers sa queue : dans le sens du poil)
            if not pg.evaluate("() => Atelier._vue()._mimi().outil"): break
            t1, h1 = point(pg, cid, 's'), point(pg, cid, 'h')
            pg.mouse.move(t1[0] - (h1[0] - t1[0]) * 0.4, t1[1] - (h1[1] - t1[1]) * 0.4); pg.mouse.down()
            pg.mouse.move(h1[0] + (h1[0] - t1[0]) * 0.3, h1[1] + (h1[1] - t1[1]) * 0.3, steps=6); pg.wait_for_timeout(90)
            pg.mouse.up(); pg.wait_for_timeout(140)
        pg.wait_for_timeout(1200)
    else:
        print('   (la brosse : bouton pas trouvé)', ok)
    # --- le bain : on frotte encore quand elle bondit dehors — on ne la rattrape pas en plein saut, et elle finit toute propre ---
    # (c'est le robot de Mimi, au téléphone, qui l'a vu : le doigt « loin d'elle » la soulevait au moment où ELLE s'en allait)
    pg.evaluate(f"() => {{ var a = {V}; a._finJouet(); {CHAT}.b.propre = 30; }}")
    calme(pg, cid); voir(pg, cid)
    pg.evaluate("() => { var b = document.querySelector('#atelier-ici .at-mimi-bt'); if(b && document.querySelector('#atelier-ici .at-mimi-barre').hidden) b.dispatchEvent(new MouseEvent('click', {bubbles:true})); }"); pg.wait_for_timeout(400)
    pg.evaluate("() => { var b = document.querySelector('#atelier-ici .at-mimi-barre [data-mimi=\"s:bain\"]'); if(b) b.dispatchEvent(new MouseEvent('click', {bubbles:true})); }"); pg.wait_for_timeout(3600)
    if pg.evaluate("() => !!document.querySelector('#atelier-ici .at-bain')"):
        d = attendre(pg, lambda: 'at-dans-bain' in classes(pg, cid), 8)      # (on frotte quand elle est DANS la baignoire)
        if d is None: print('   (elle n\'est pas entrée dans la baignoire :', classes(pg, cid), chat(pg, cid), ')', flush=True)
        voir(pg, cid); pg.wait_for_timeout(600)
        a = point(pg, cid, 'h'); bpt = point(pg, cid, 's'); levee = False
        print('   (sous le doigt, pour frotter :', pg.evaluate(f"() => {{ var e = document.elementFromPoint({a[0]}, {a[1]}); return e ? ((e.closest('[data-obj]') || {{}}).className || e.className || e.tagName) : null; }}"), [round(v) for v in a], ')', flush=True)
        pg.mouse.move(*a); pg.mouse.down()
        for i in range(44):
            pg.mouse.move(*(bpt if i % 2 == 0 else a), steps=4); pg.wait_for_timeout(60)
            if 'at-leve' in classes(pg, cid) or chat(pg, cid)['tenu']: levee = True
            if i == 6: shot(pg, 'bain')
        pg.mouse.up(); pg.wait_for_timeout(2400)
        pr = pg.evaluate(f"() => {CHAT}.b.propre")
        verifier(not levee, 'le bain : on frotte encore quand elle bondit dehors — elle n\'est pas rattrapée en plein saut')
        verifier(pr >= 99 and not pg.evaluate("() => !!document.querySelector('#atelier-ici .at-bain')"), f'… et elle en sort toute propre ({pr})')
    else: verifier(False, 'le bain arrive')
    print('ERREURS :', erreurs[:6])
    verifier(not erreurs, 'aucun message d\'erreur')
    b.close()
print(f'\n{len(echecs)} échec(s)' + (' : ' + ' | '.join(echecs) if echecs else ''))
sys.exit(1 if echecs else 0)
