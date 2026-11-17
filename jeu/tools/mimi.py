"""Mimi, le Tamagotchi refait le 16 novembre (Bible §12.65) et son pantin articulé (§12.66), dans le vrai jeu, au doigt (Playwright).
- le pantin : ses morceaux (cuisse, mollet, pied…), ses poses où il glisse, sa toilette, ses yeux qui suivent le doigt, un bond en plusieurs temps, ses jeux ;
- le bouton 🐾 et, au-dessus, sa jauge de bonheur (la seule jauge qu'on voit) ;
- un petit toucher : une réaction tout de suite, au hasard, jamais deux fois la même de suite ; il ne la soulève pas (la porter : mimi-porter.py) ;
- le doigt posé : la tête (frotte, ronronne, puis pétrit), le ventre (sur le dos, elle attrape), la queue (« Pas la queue ! », elle s'en va) ;
- les planchers : son bonheur ne descend jamais sous 8, ses besoins sous 25 ; une vieille sauvegarde repart de 30 au plus ;
- la jauge seule (§12.69) : la lassitude ; les cinq familles cachées et ce que les coffrets apportent ; l'envie cachée une minute, son manège, puis sa bulle dorée ; « Pile poil ! » ; la barre pleine : un coffret, autant de fois qu'on la remplit ; le coffret doré d'une famille complète ;
- la boutique (des pièces d'or) : la pâtée, puis la gamelle qui demande quoi servir ; plus un seul habit (17 novembre) ;
- les objets de soin viennent des coffrets : la brosse ; la brosse au doigt ; le bain ; les friandises ;
- l'appareil photo à côté du 🐾 et l'album à compléter (§12.70) : une photo par pose, « Dommage, c'était la même ! », le compteur, les cadres vides ;
  à trois photos, des yeux en cadeau ; un pelage dans un coffret ; la garde-robe : son pelage, ses yeux, et elle change pour de bon ;
- le coffret : elle sort par la chatière, revient, le pose ; on l'ouvre : une chose de plus, et son bonheur redescend ; les sept jouets, chacun joué ;
- la litière : sale, un toucher la nettoie ;
- aucun message d'erreur.
   BRUMEVAL_DIST=<dossier construit> python3 tools/mimi.py [iphone]"""
import sys, os, json, time
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist')), 'index.html') + '#test'
OUT = os.path.join(ICI, '..', 'test', 'mimi'); os.makedirs(OUT, exist_ok=True)
TEL = 'iphone' in sys.argv
erreurs, echecs = [], []
n = [0]

def shot(pg, nom):
    n[0] += 1; pg.wait_for_timeout(300); pg.screenshot(path=f'{OUT}/{"tel-" if TEL else ""}{n[0]:02d}-{nom}.png')

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

V = "Atelier._vue()"
def mimi(pg): return pg.evaluate(f"() => {V}._mimi()")
def chat_id(pg): return pg.evaluate("() => (M.S.atelier.objets.filter(function(o){ return o.t === 'chat'; })[0] || {}).id || null")
def chat(pg, cid): return pg.evaluate(f"() => {V}._chat('{cid}')")
def classes(pg, cid): return pg.evaluate(f"() => {{ var d = document.querySelector('#atelier-ici [data-obj=\"{cid}\"]'); return d ? d.className : ''; }}")
def toast(pg): return pg.evaluate("() => { var t = document.querySelector('#atelier-ici .at-toast'); return t && !t.hidden ? t.textContent : ''; }")
def calme(pg, cid, pose='assis'):
    """elle s'assoit tranquillement à une place qu'on voit (et ne bouge plus d'elle-même pendant 30 secondes)"""
    pg.evaluate(f"() => {{ var a = {V}; a._finJouet(); a._reveil('{cid}'); a._dehors('{cid}'); a._pose('{cid}', '{pose}'); }}"); pg.wait_for_timeout(250)
def boite(pg, cid):
    return pg.evaluate(f"() => {{ var d = document.querySelector('#atelier-ici [data-obj=\"{cid}\"] svg'); if(!d) return null; var r = d.getBoundingClientRect(); return {{x:r.left, y:r.top, w:r.width, h:r.height}}; }}")
def point(pg, cid, quoi):
    """un point du pantin de Mimi, à l'écran : 'tete', 'dos', 'ventre', 'queue', 'h' (les hanches), 's' (les épaules)"""
    q = pg.evaluate(f"() => {V}._ptChat('{cid}', '{quoi}')")
    return (q[0], q[1]) if q else None
def pantin(pg, cid): return pg.evaluate(f"() => {V}._pantin('{cid}')")
def voir_chat(pg, cid):
    """amène le chat au milieu de l'écran (la pièce glisse)"""
    pg.evaluate(f"""() => {{ var a = {V}, p = a._pos('{cid}'); if(p) a._voir(p.x, p.y - 60); }}""")
    pg.wait_for_timeout(400)
def sur_chat(pg, cid, quoi, pose='assis'):
    """la pose, une place où on la voit, et un point du dessin qui est bien sur elle (pas caché par un meuble, une bulle)"""
    for i in range(8):
        calme(pg, cid, pose); voir_chat(pg, cid); pg.wait_for_timeout(500)
        pg.wait_for_timeout(450); q = point(pg, cid, quoi)
        if q and pg.evaluate(f"() => {{ var e = document.elementFromPoint({q[0]}, {q[1]}), o = e && e.closest('[data-obj]'); return !!o && o.getAttribute('data-obj') === '{cid}' && !e.closest('.at-bulle'); }}"): return q
    return q
def visible(pg, cid):
    """le pantin est vraiment dessiné (il a une taille à l'écran)"""
    return pg.evaluate(f"() => {{ var g = document.querySelector('#atelier-ici [data-obj=\"{cid}\"] .mi-rac'); if(!g) return false; var r = g.getBoundingClientRect(); return r.width > 20 && r.height > 14; }}")
def ouvrir_barre(pg):
    """la barre de Mimi, ouverte pour de bon (le bouton 🐾 l'ouvre et la referme : on ne le touche que si elle est fermée)"""
    for i in range(4):
        if pg.evaluate("() => { var b = document.querySelector('#atelier-ici .at-mimi-barre'); return !!b && !b.hidden; }"): break
        pg.locator('#atelier-ici .at-mimi-bt').click(force=True); pg.wait_for_timeout(350)
    pg.wait_for_timeout(100)
def tap(pg, x, y):
    pg.mouse.move(x, y); pg.mouse.down(); pg.wait_for_timeout(60); pg.mouse.up(); pg.wait_for_timeout(120)
def tenir(pg, x, y, ms, bouge=0):
    pg.mouse.move(x, y); pg.mouse.down()
    t0 = time.time(); i = 0
    while (time.time() - t0) * 1000 < ms:
        i += 1
        if bouge: pg.mouse.move(x + (bouge if i % 2 else -bouge), y + (2 if i % 2 else -2))
        pg.wait_for_timeout(100)
    return lambda: pg.mouse.up()

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = debut(b)
    # --- les cartons : on les ouvre tous (les affaires de Mimi en sortent) ---
    for i in range(90):
        if not pg.evaluate("() => { var k = document.querySelector('#atelier-ici .at-carton'); if(k) k.dispatchEvent(new MouseEvent('click', {bubbles:true})); return !!k; }"): break
        pg.wait_for_timeout(260)
        pg.evaluate("() => { var g = document.querySelector('#atelier-ici .at-grim .at-fermer'); if(g) g.click(); }")
    # (ce qui est sorti des cartons attend dans le carton du coin 📦 : on installe les affaires de Mimi)
    for i in range(30):
        pg.evaluate("() => { var c = document.querySelector('#atelier-ici .at-coin'); if(c) c.dispatchEvent(new MouseEvent('click', {bubbles:true})); }"); pg.wait_for_timeout(350)
        k = pg.evaluate("""() => { var l = [].slice.call(document.querySelectorAll('#atelier-ici [data-res]')); var b = l.filter(function(x){ return /Gamelle|Litière|Distributeur|Panier/.test(x.textContent); })[0];
          if(b){ b.dispatchEvent(new MouseEvent('click', {bubbles:true})); return b.textContent; } return null; }""")
        pg.wait_for_timeout(400)
        pg.evaluate("() => { var g = document.querySelector('#atelier-ici .at-grim .at-fermer'); if(g) g.click(); }")
        if not k: break
    pg.evaluate(f"() => {{ var a = {V}; if(a._salle() !== 0) a._allerSalle(0); }}"); pg.wait_for_timeout(600)
    cid = chat_id(pg)
    print('chat', cid, 'objets', pg.evaluate("() => M.S.atelier.objets.map(function(o){ return o.t; }).join(',')"))
    verifier(cid is not None, 'Mimi est dans l\'atelier')
    types = pg.evaluate("() => M.S.atelier.objets.map(function(o){ return o.t; })")
    verifier('litiere' in types, 'sa litière est sortie de son carton')
    # --- le dessin ---
    morceaux = pg.evaluate(f"() => {{ var d = document.querySelector('#atelier-ici [data-obj=\"{cid}\"]'), n = function(s){{ return d.querySelectorAll(s).length; }}; return {{rac:n('.mi-rac'), queue:n('.mi-queue g[data-m^=q]'), cuisse:n('[data-m=j1c]'), mollet:n('[data-m=j1j]'), pied:n('[data-m=j1p]'), doigts:n('[data-m=j1t]'), bras:n('[data-m=a1b]'), avb:n('[data-m=a1a]'), tete:n('.mi-tete')}}; }}")
    print('   pantin :', morceaux, pantin(pg, cid))
    verifier(morceaux['rac'] == 1 and morceaux['tete'] == 1 and pantin(pg, cid) is not None, 'Mimi est un pantin articulé, monté et vivant')
    verifier(morceaux['queue'] == 6 and morceaux['cuisse'] == 2 and morceaux['mollet'] == 2 and morceaux['pied'] == 2 and morceaux['doigts'] == 2 and morceaux['bras'] == 2 and morceaux['avb'] == 2, 'une patte de derrière : la cuisse, le mollet, le pied, les doigts ; devant : le bras, l\'avant-bras, la main ; la queue en six morceaux')
    bt = pg.evaluate("() => { var b = document.querySelector('#atelier-ici .at-mimi-bt'); if(!b || b.hidden) return null; var r = b.getBoundingClientRect(); return {w:r.width, bh:b.style.getPropertyValue('--bh')}; }")
    verifier(bt is not None and bt['w'] >= 48 and bt['bh'] != '', f'le bouton 🐾, et le cœur de son bonheur autour ({bt})')
    voir_chat(pg, cid); calme(pg, cid); voir_chat(pg, cid)
    shot(pg, 'atelier')
    # --- un petit toucher : une réaction tout de suite, au hasard, jamais deux fois la même ---
    reacs = []
    for i in range(7):
        q = sur_chat(pg, cid, 'dos')
        tap(pg, *q)
        c = chat(pg, cid); reacs.append(c['reac'] if c else None)
        pg.wait_for_timeout(700)
    print('   réactions :', reacs)
    verifier(len(set(r for r in reacs if r)) >= 4 and all(reacs[i] != reacs[i + 1] for i in range(len(reacs) - 1)), 'sept petits touchers : des réactions variées, jamais deux fois la même de suite')
    verifier('at-leve' not in classes(pg, cid), 'un toucher ne la soulève pas')
    # --- le doigt posé sur la tête : elle se frotte, ronronne, puis pétrit ---
    pg.wait_for_timeout(2200)        # (les petites suites des réactions d'avant se finissent)
    bh0 = mimi(pg)['bh']
    q = sur_chat(pg, cid, 'tete')
    lacher = tenir(pg, *q, 1200, bouge=3)
    cl1 = classes(pg, cid); z = chat(pg, cid)['caresse']
    if z != 'tete':
        print('   (sous le doigt :', pg.evaluate(f"() => {{ var e = document.elementFromPoint({q[0]}, {q[1]}); return e ? e.tagName + ' ' + (e.getAttribute('class') || '') + ' / ' + ((e.closest('[data-obj]') || e.closest('[data-at]') || {{}}).className || '') : null; }}"), ')')
    pg.wait_for_timeout(1700); cl2 = classes(pg, cid)
    shot(pg, 'gratte-tete')
    lacher(); pg.wait_for_timeout(400)
    verifier(z == 'tete' and 'at-x-tete' in cl1 and 'at-c-ronron' in cl1, f'le doigt posé sur la tête : elle se frotte et ronronne ({z})')
    verifier('at-x-petrit' in cl2, 'au bout de deux secondes : elle pétrit')
    verifier('at-leve' not in cl2, 'le doigt qu\'on laisse sur elle ne la soulève pas')
    verifier(mimi(pg)['bh'] > bh0, f'les gratouilles : son bonheur monte ({bh0} → {mimi(pg)["bh"]})')
    # --- le ventre : sur le dos, elle attrape le doigt ---
    q = sur_chat(pg, cid, 'ventre')
    lacher = tenir(pg, *q, 1600, bouge=2)
    c = chat(pg, cid); cl = classes(pg, cid)
    shot(pg, 'ventre')
    lacher(); pg.wait_for_timeout(300)
    verifier(c['pose'] == 'dos' and 'at-c-dos' in cl and visible(pg, cid) and 'at-x-attrape' in cl, f'le ventre : elle se roule sur le dos et attrape le doigt ({c["pose"]})')
    pg.wait_for_timeout(1500)
    verifier(chat(pg, cid)['pose'] != 'dos', 'le doigt parti : elle se relève')
    # --- la queue : « Pas la queue ! », puis elle s'en va ---
    q = sur_chat(pg, cid, 'queue')
    p0 = pg.evaluate(f"() => {V}._pos('{cid}')")
    lacher = tenir(pg, *q, 600)
    cl = classes(pg, cid)
    pg.wait_for_timeout(1400)
    lacher(); pg.wait_for_timeout(1800)
    p1 = pg.evaluate(f"() => {V}._pos('{cid}')")
    verifier('at-x-agace' in cl, 'la queue : oreilles en arrière, la queue fouette')
    verifier(abs(p1['x'] - p0['x']) > 30, f'on insiste : elle s\'éloigne un peu ({round(p0["x"])} → {round(p1["x"])})')
    for po in ['assis', 'marche', 'dort', 'dos', 'pain', 'lave', 'griffe']:
        calme(pg, cid, po); pg.wait_for_timeout(120)
        g1 = pantin(pg, cid); pg.wait_for_timeout(900); g2 = pantin(pg, cid)
        verifier(visible(pg, cid) and g2['nom'] == po and not g2['glisse'], f'la pose « {po} » : le pantin y glisse ({"en cours" if g1["glisse"] else "?"}), puis s\'y tient {g2["gestes"]}')
    calme(pg, cid, 'lave'); pg.wait_for_timeout(700)
    verifier('toilette' in pantin(pg, cid)['gestes'], 'elle fait sa toilette (un geste qui tourne)')
    shot(pg, 'toilette')
    # --- le pantin : ses yeux suivent le doigt ; un saut en plusieurs temps ; ses jeux ---
    calme(pg, cid); voir_chat(pg, cid); pg.wait_for_timeout(700)
    t = point(pg, cid, 'tete')
    def pupille(): return pg.evaluate(f"() => document.querySelector('#atelier-ici [data-obj=\"{cid}\"] [data-m=pupG]').getAttribute('transform')")
    pr = pg.evaluate("() => { var p = document.querySelector('#atelier-ici .at-piece').getBoundingClientRect(); return {x:p.left, y:p.top, w:p.width, h:p.height}; }")
    pg.mouse.move(pr['x'] + 12, max(pr['y'] + 12, t[1] - 90)); pg.wait_for_timeout(500); pa = pupille()
    pg.mouse.move(pr['x'] + pr['w'] - 12, min(pr['y'] + pr['h'] - 12, t[1] + 60)); pg.wait_for_timeout(500); pb = pupille()
    verifier(pa != pb, f'ses yeux suivent le doigt ({pa} → {pb})')
    calme(pg, cid, 'marche'); pg.wait_for_timeout(500)
    ok = pg.evaluate(f"() => {V}._jouer('{cid}', 'bondir')"); vus = set(); haut = 0
    y0 = boite(pg, cid)['y']
    for i in range(34):
        pg.wait_for_timeout(60)
        g = pantin(pg, cid); bb = boite(pg, cid)
        if g and 'saut' in g['gestes']: vus.add('saut')
        if bb: haut = max(haut, y0 - bb['y'])
    verifier(ok and 'saut' in vus and haut > 8, f'un bond : elle se ramasse, s\'élance, retombe (le geste « saut », {round(haut)} px de haut)')
    for jeu, geste in [('galipette', 'galipette'), ('etire', 'etire'), ('cache', 'cache'), ('queue', 'tourne')]:
        calme(pg, cid); pg.wait_for_timeout(400)
        pg.evaluate(f"() => {V}._jouer('{cid}', '{jeu}')"); pg.wait_for_timeout(350)
        g = pantin(pg, cid)
        verifier(g and geste in g['gestes'], f'son jeu « {jeu} » : le geste « {geste} » ({g["gestes"] if g else None})')
        if jeu == 'etire': shot(pg, 'etire')
        pg.wait_for_timeout(1900)
    calme(pg, cid)
    # --- les planchers ---
    r = pg.evaluate(f"""() => {{ var a = {V}, o = M.S.atelier.objets.filter(function(x){{ return x.t === 'chat'; }})[0];
      o.bh = 0; Object.keys(o.b).forEach(function(k){{ o.b[k] = 0; }}); for(var i = 0; i < 80; i++) a._tama(60); var m = a._mimi(); return {{bh:m.bh, b:m.b}}; }}""")
    verifier(8 <= r['bh'] <= 12 and min(r['b'].values()) >= 25, f'oubliée longtemps : son bonheur descend bas mais reste ≥ 8, ses besoins ≥ 25 ({r})')
    verifier(pg.evaluate(f"() => document.querySelector('#atelier-ici [data-obj=\"{cid}\"]').className.indexOf('at-c-triste') < 0"), 'elle n\'est jamais triste')
    vieux = pg.evaluate("() => { var e = Atelier.etatNeuf(); var c = {id:'o99', t:'chat', x:600, y:700, v:0, b:{faim:60, soif:80, amour:40, jeu:20, dodo:100}}; e.objets.push(c); Atelier.normaliser(e); return {bh:c.bh, b:c.b, mimi:e.mimi}; }")
    verifier(vieux['bh'] == 30 and 'dodo' not in vieux['b'] and vieux['b']['propre'] == 80 and vieux['mimi']['jouets'] == ['pelote'], f'une vieille sauvegarde : son bonheur repart de 30 au plus ({vieux["bh"]}), la pelote')
    neuf = pg.evaluate("() => { var e = Atelier.etatNeuf(); var c = {id:'o98', t:'chat', x:600, y:700, v:0}; e.objets.push(c); Atelier.normaliser(e); return {bh:c.bh, c:e.tama.c === undefined, fam:e.tama.fam, v:e.tama.v, soins:e.mimi.soins}; }")
    verifier(neuf['bh'] == 15 and neuf['c'] and neuf['fam'] == {} and neuf['v'] == 3 and neuf['soins'] == ['photo'], f'un chat tout neuf : un bonheur de 15, plus de cœurs, aucune famille complète, l\'appareil photo ({neuf})')
    # --- la boutique : la pâtée ; la gamelle demande quoi servir ---
    pg.evaluate("() => { M.S.or = 20; M.sauver(); }")
    calme(pg, cid)
    ouvrir_barre(pg)
    verifier(pg.locator('#atelier-ici .at-mimi-barre:not([hidden])').count() == 1, 'le bouton 🐾 ouvre la barre de Mimi (pas un écran à part)')
    tailles = pg.evaluate("() => [].map.call(document.querySelectorAll('#atelier-ici .at-mb-bt'), function(b){ var r = b.getBoundingClientRect(); return Math.min(r.width, r.height); })")
    verifier(tailles and min(tailles) >= 48, f'ses boutons font au moins 48 points ({min(tailles) if tailles else None})')
    shot(pg, 'barre')
    pg.locator('#atelier-ici [data-mimi=shop]').click(); pg.wait_for_timeout(500)
    verifier(pg.locator('#atelier-ici .at-f-boutique').count() == 1, 'la boutique de Mimi')
    shot(pg, 'boutique')
    pg.locator('#atelier-ici [data-achat="n:pate"]').click(); pg.wait_for_timeout(400)
    verifier(pg.evaluate("() => M.S.or") == 16 and 'pate' in mimi(pg)['mimi']['nour'], 'la pâtée achetée : 4 pièces d\'or')
    # (17 novembre, Romain : plus un seul habit dans la boutique — ils se gagnent)
    bq = pg.evaluate("() => { var f = document.querySelector('#atelier-ici .at-f-boutique'); return {hab:document.querySelectorAll('#atelier-ici [data-achat^=\"h:\"]').length, titres:[].map.call(f.querySelectorAll('.at-ach-g > b'), function(b){ return b.textContent; }), art:f.querySelectorAll('[data-achat]').length}; }")
    verifier(bq['hab'] == 0 and bq['titres'] == ['Ses petits plats', 'Ses coins douillets'] and bq['art'] >= 5, f'la boutique : ses petits plats, ses coins douillets — plus un seul habit ({bq})')
    verifier(pg.evaluate(f"() => {{ var a = {V}, n = M.S.atelier.garde.a.length; a._acheter('h:beret'); return M.S.atelier.garde.a.length === n && M.S.atelier.garde.a.indexOf('beret') < 0; }}"), 'un habit ne s\'achète plus, même en trichant')
    pg.evaluate("() => { M.S.or = 1; }")
    pg.locator('#atelier-ici [data-achat="n:poisson"]').click(); pg.wait_for_timeout(300)
    verifier('pièce' in toast(pg) and 'poisson' not in mimi(pg)['mimi']['nour'], f'pas assez de pièces : rien n\'est acheté ({toast(pg)[:50]})')
    pg.evaluate("() => { var g = document.querySelector('#atelier-ici .at-grim .at-fermer'); if(g) g.click(); }"); pg.wait_for_timeout(300)
    gid = pg.evaluate("() => (M.S.atelier.objets.filter(function(o){ return o.t === 'gamelle'; })[0] || {}).id")
    pg.evaluate(f"() => {{ var g = M.S.atelier.objets.filter(function(o){{ return o.id === '{gid}'; }})[0]; g.plein = 0; var p = {V}._pos('{gid}'); {V}._voir(p.x, p.y); }}"); pg.wait_for_timeout(400)
    pg.evaluate(f"() => {{ var o = M.S.atelier.objets.filter(function(x){{ return x.t === 'chat'; }})[0]; o.b.faim = 100; }}")
    for i in range(8):                      # (si Mimi s'est assise pile devant sa gamelle, on la pose ailleurs : le robot doit toucher la gamelle, pas elle)
        libre = pg.evaluate(f"() => {{ var d = document.querySelector('#atelier-ici [data-obj=\"{gid}\"]'); if(!d) return false; var r = d.getBoundingClientRect(), e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2), o = e && e.closest('[data-obj]'); return !!o && o.getAttribute('data-obj') === '{gid}'; }}")
        if libre: break
        calme(pg, cid); pg.evaluate(f"() => {{ var a = {V}, p = a._pos('{gid}'); a._voir(p.x, p.y); }}"); pg.wait_for_timeout(400)
    pg.locator(f'#atelier-ici [data-obj="{gid}"]').click(force=True); pg.wait_for_timeout(500)
    nb = pg.locator('#atelier-ici .at-bulles-nour .at-bulle-pa').count()
    verifier(nb == 2, f'la gamelle demande quoi servir : croquettes ou pâtée ({nb})')
    shot(pg, 'gamelle')
    if nb: pg.locator('#atelier-ici [data-bulle="nour:pate"]').click(); pg.wait_for_timeout(400)
    verifier(pg.evaluate(f"() => {{ var g = M.S.atelier.objets.filter(function(o){{ return o.id === '{gid}'; }})[0]; return g.plein && g.nour; }}") == 'pate', 'la pâtée est dans la gamelle')
    # --- les objets de soin viennent des coffrets (plus de jauge cachée de la variété) : celui-ci apporte la brosse ---
    m = mimi(pg)
    verifier('brosse' not in m['mimi']['soins'] and 'varie' not in m['tama'] and 'pts' not in m['tama'], f'pas encore de brosse ; la jauge cachée de la variété n\'existe plus ({m["mimi"]["soins"]})')
    calme(pg, cid)
    ok = pg.evaluate(f"() => Atelier._vue()._cadeau('{cid}', 's:brosse')")
    t0 = time.time()
    while time.time() - t0 < 34 and not mimi(pg)['tama'].get('coffret'): pg.wait_for_timeout(500)
    pg.wait_for_timeout(600)
    pg.evaluate("() => { var c = M.S.atelier.tama.coffret; if(c) Atelier._vue()._voir(c.x, c.y); }"); pg.wait_for_timeout(500)
    cq = pg.evaluate("() => { var e = document.querySelector('#atelier-ici .at-coffret svg'); if(!e) return null; var r = e.getBoundingClientRect(); return {x:r.left + r.width / 2, y:r.top + r.height * .6}; }")
    if cq: tap(pg, cq['x'], cq['y']); pg.wait_for_timeout(700)
    m = mimi(pg)
    verifier(ok and 'brosse' in m['mimi']['soins'] and 'brosse' in toast(pg), f'un coffret apporte la brosse ({m["mimi"]["soins"]} ; {toast(pg)[:70]})')
    shot(pg, 'coffret-brosse')
    # --- la brosse, au doigt ---
    a = sur_chat(pg, cid, 'h')
    ouvrir_barre(pg)
    pg.locator('#atelier-ici [data-mimi="s:brosse"]').click(); pg.wait_for_timeout(400)
    verifier(mimi(pg)['outil'] == 'brosse', 'la brosse est prise')
    pg.evaluate(f"() => {{ M.S.atelier.objets.filter(function(x){{ return x.t === 'chat'; }})[0].b.propre = 40; }}")
    a = point(pg, cid, 'h'); bpt = point(pg, cid, 's')
    print('   (sous la brosse :', pg.evaluate(f"() => {{ var e = document.elementFromPoint({a[0]}, {a[1]}); return e ? ((e.closest('[data-obj]') || {{}}).className || e.className) : null; }}"), ')')
    pg.mouse.move(*a); pg.mouse.down()
    for i in range(30):
        pg.mouse.move(*(bpt if i % 2 == 0 else a), steps=4); pg.wait_for_timeout(60)
    shot(pg, 'brosse'); pg.mouse.up(); pg.wait_for_timeout(600)
    m = mimi(pg)
    verifier(m['outil'] is None and m['b']['propre'] >= 99, f'dix coups de brosse : un pelage tout propre ({m["b"]["propre"]})')
    # --- le coffret : elle sort par la chatière et revient ---
    calme(pg, cid)
    pg.evaluate("() => { var a = Atelier._vue(); a._cadeauPret(); }")
    ok = pg.evaluate(f"() => Atelier._vue()._cadeau('{cid}')")
    verifier(ok, 'bien heureuse : elle part chercher un coffret')
    t0 = time.time()
    while time.time() - t0 < 30 and not mimi(pg)['tama'].get('coffret'): pg.wait_for_timeout(500)
    m = mimi(pg)
    verifier(bool(m['tama'].get('coffret')) and pg.locator('#atelier-ici .at-coffret').count() == 1, f'elle revient et pose un coffret ({round(time.time() - t0)} s)')
    pg.wait_for_timeout(700)
    vu = pg.evaluate(f"""() => {{ var d = document.querySelector('#atelier-ici [data-obj="{cid}"]'); if(!d) return null; var c = getComputedStyle(d); return {{op:c.opacity, vis:c.visibility}}; }}""")
    verifier(vu is not None and vu['op'] == '1' and vu['vis'] == 'visible', f'et on la voit de nouveau (elle ne reste pas invisible après sa sortie) ({vu})')
    pg.evaluate("() => { var c = M.S.atelier.tama.coffret; if(c) Atelier._vue()._voir(c.x, c.y); }"); pg.wait_for_timeout(500)
    shot(pg, 'coffret')
    COMPTE = "() => { var e = M.S.atelier; return e.mimi.jouets.length + e.mimi.nour.length + e.mimi.soins.length + e.garde.a.length + e.tama.recus.length + e.mimi.peaux.p.length + e.mimi.peaux.y.length; }"
    j0 = pg.evaluate(COMPTE)
    cq = pg.evaluate("() => { var r = document.querySelector('#atelier-ici .at-coffret svg').getBoundingClientRect(); var x = r.left + r.width / 2, y = r.top + r.height * .6, e = document.elementFromPoint(x, y); return {x:x, y:y, sur:!!(e && e.closest('.at-coffret'))}; }")
    verifier(cq['sur'], 'le coffret se voit et se touche (rien devant)')
    tap(pg, cq['x'], cq['y']); pg.wait_for_timeout(700)
    m = mimi(pg)
    verifier(pg.evaluate(COMPTE) == j0 + 1 and not m['tama'].get('coffret'), f'on l\'ouvre : une chose de plus pour elle ({toast(pg)[:70]})')
    verifier(m['bh'] == 30, f'et son bonheur redescend à 30 ({m["bh"]})')
    verifier(pg.evaluate(f"() => Atelier._vue()._peutSortir('{cid}')") is False, 'sa barre n\'est plus pleine : elle ne repart pas')
    calme(pg, cid)
    verifier(pg.evaluate(f"() => {{ var a = Atelier._vue(); a._cadeauPret(); return a._peutSortir('{cid}'); }}") is True, 'sa barre de nouveau pleine, dans le même moment : elle peut repartir (pas de limite)')
    pg.evaluate("() => { M.S.atelier.objets.filter(function(x){ return x.t === 'chat'; })[0].bh = 30; }")
    # --- les sept jouets ---
    pg.evaluate("() => { M.S.atelier.mimi.jouets = ['pelote','plume','laser','souris','grelot','carton','herbe']; }")
    for j in ['plume', 'laser', 'souris', 'grelot', 'carton', 'herbe', 'pelote']:
        calme(pg, cid); voir_chat(pg, cid)
        ouvrir_barre(pg)
        pg.locator(f'#atelier-ici [data-mimi="j:{j}"]').click(); pg.wait_for_timeout(500)
        if j in ('plume', 'laser'):
            r0 = pg.evaluate("() => { var p = document.querySelector('#atelier-ici .at-piece').getBoundingClientRect(); return {x:p.left, y:p.top, w:p.width, h:p.height}; }")
            pg.mouse.move(r0['x'] + r0['w'] * .3, r0['y'] + r0['h'] * .82); pg.mouse.down()
            for i in range(14): pg.mouse.move(r0['x'] + r0['w'] * (.3 + .04 * i), r0['y'] + r0['h'] * (.82 - .01 * (i % 3)), steps=3); pg.wait_for_timeout(150)
            pg.wait_for_timeout(900); pg.mouse.up()
        if j == 'carton':
            dedans = False
            for i in range(48):            # (elle marche jusqu'au carton — parfois posé loin, faute de place —, se ramasse, saute : jusqu'à douze secondes)
                pg.wait_for_timeout(250); dedans = 'at-dans-boite' in classes(pg, cid)
                if dedans: break
            pg.wait_for_timeout(500)
            shot(pg, 'carton')
            # (le carton est parfois posé hors de l'écran du téléphone : on le touche là où il est, sans passer par la souris du robot)
            pg.evaluate("() => { var d = document.querySelector('#atelier-ici .at-boite'); if(!d) return; var r = d.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2; ['pointerdown', 'pointerup', 'click'].forEach(function(n){ d.dispatchEvent(new PointerEvent(n, {bubbles:true, clientX:x, clientY:y, pointerId:1, isPrimary:true})); }); }")
            pg.wait_for_timeout(400)
            verifier(dedans, 'le carton : elle saute dedans')
        else:
            pg.wait_for_timeout(2600)
            shot(pg, 'jouet-' + j)
        actif = mimi(pg)['jouet']
        verifier(actif == j or j == 'pelote', f'{j} : on joue avec ({actif})')
        if j != 'pelote': pg.evaluate("() => Atelier._vue()._finJouet()")
        pg.wait_for_timeout(500)
    # --- le bain ---
    pg.evaluate("() => { M.S.atelier.mimi.soins = ['brosse','bain','friandises','griffoir','photo']; M.S.atelier.objets.filter(function(x){ return x.t === 'chat'; })[0].b.propre = 30; }")
    calme(pg, cid); voir_chat(pg, cid)
    ouvrir_barre(pg)
    pg.locator('#atelier-ici [data-mimi="s:bain"]').click(); pg.wait_for_timeout(3500)
    verifier(mimi(pg)['bain'] and pg.locator('#atelier-ici .at-bain').count() == 1, 'le bain : la baignoire, elle saute dedans')
    voir_chat(pg, cid); pg.wait_for_timeout(600)
    a = point(pg, cid, 'h'); bpt = point(pg, cid, 's')
    print('   (sous l\'éponge :', pg.evaluate(f"() => {{ var e = document.elementFromPoint({a[0]}, {a[1]}); return e ? ((e.closest('[data-obj]') || {{}}).className || e.className) : null; }}"), ')')
    pg.mouse.move(*a); pg.mouse.down()
    for i in range(30):
        pg.mouse.move(*(bpt if i % 2 == 0 else a), steps=4); pg.wait_for_timeout(60)
    shot(pg, 'bain'); pg.mouse.up(); pg.wait_for_timeout(2200)
    m = mimi(pg)
    verifier(not m['bain'] and m['b']['propre'] >= 99, f'on frotte : de la mousse, puis elle bondit dehors, toute propre ({m["b"]["propre"]})')
    # --- les friandises ---
    calme(pg, cid)
    ouvrir_barre(pg)
    pg.locator('#atelier-ici [data-mimi="s:friandises"]').click(); pg.wait_for_timeout(3600)
    verifier('friandises' in mimi(pg)['tama']['las'], 'les friandises : elle donne la patte, puis croque')
    ouvrir_barre(pg)
    pg.locator('#atelier-ici [data-mimi="s:friandises"]').click(); pg.wait_for_timeout(300)
    verifier('ventre' in toast(pg), 'pas deux fois de suite : « gare au petit ventre tout rond »')
    # --- l'appareil photo (à côté du 🐾) et l'album à compléter : une photo par pose ---
    CHATJS = "M.S.atelier.objets.filter(function(x){ return x.t === 'chat'; })[0]"
    pg.wait_for_timeout(6500)      # (la friandise d'avant a encore son mot à dire : dans trois secondes elle se lèche, puis elle a une idée — on attend que ce soit passé)
    pg.evaluate("() => { M.S.atelier.mimi.album = []; M.S.atelier.mimi.peaux = {p:[], y:[]}; Atelier._vue()._humeur(); }")
    bt = pg.evaluate("() => { var b = document.querySelector('#atelier-ici .at-photo-bt'), p = document.querySelector('#atelier-ici .at-mimi-bt'); if(!b || b.hidden) return null; var r = b.getBoundingClientRect(), q = p.getBoundingClientRect(); return {w:Math.round(r.width), acote:r.left >= q.right - 2 && r.left - q.right < 30 && Math.abs((r.top + r.bottom) / 2 - (q.top + q.bottom) / 2) < 12, dedans:r.right <= innerWidth && r.bottom <= innerHeight}; }")
    verifier(bt is not None and bt['w'] >= 48 and bt['acote'] and bt['dedans'], f'l\'appareil photo : un bouton à côté du 🐾 ({bt})')
    def photo(pose, x=None):
        calme(pg, cid, pose)
        if x: pg.evaluate(f"() => {{ document.querySelector('#atelier-ici [data-obj=\"{cid}\"]').classList.add('{x}'); }}")
        pg.locator('#atelier-ici .at-photo-bt').click(); pg.wait_for_timeout(450)
        if x: pg.evaluate(f"() => {{ document.querySelector('#atelier-ici [data-obj=\"{cid}\"]').classList.remove('{x}'); }}")
        return toast(pg)
    t1 = photo('dos')
    al = mimi(pg)['mimi']['album']
    verifier(len(al) == 1 and al[0]['k'] == 'dos' and 'nouvelle photo' in t1 and '1 sur 15' in t1, f'une photo, sur le dos : elle va dans l\'album ({t1[:80]})')
    t2 = photo('dos')
    verifier(len(mimi(pg)['mimi']['album']) == 1 and 'Dommage' in t2 and 'la même' in t2, f'la même pose : « Dommage, c\'était la même ! », rien de plus dans l\'album ({t2[:70]})')
    np1 = pg.evaluate("() => document.querySelector('#atelier-ici .at-photo-n').textContent")
    verifier(np1 == '1/15', f'sous l\'appareil : où en est l\'album ({np1})')
    t3 = photo('pain')
    t4 = photo('assis', 'at-x-miaou')
    m = mimi(pg)
    verifier([f['k'] for f in m['mimi']['album']] == ['dos', 'pain', 'miaou'] and m['mimi']['peaux']['y'] == [0] and 'cadeau' in t4 and 'yeux' in t4, f'trois photos : un cadeau, de nouveaux yeux ({t4[:120]})')
    shot(pg, 'photo-cadeau')
    ouvrir_barre(pg)
    verifier(pg.locator('#atelier-ici [data-mimi="s:photo"]').count() == 0, 'plus de « Photo » dans ses soins : l\'appareil a son bouton')
    pg.locator('#atelier-ici [data-mimi="album"]').click(); pg.wait_for_timeout(600)
    f = pg.evaluate("() => { var A = document.querySelector('#atelier-ici .at-album'); if(!A) return null; return {cadres:A.querySelectorAll('.at-photo').length, vides:A.querySelectorAll('.at-photo-vide').length, images:A.querySelectorAll('.at-photo:not(.at-photo-vide) svg').length, n:(document.querySelector('#atelier-ici .at-album-n') || {}).textContent, large:A.scrollWidth <= A.clientWidth + 10}; }")
    verifier(f is not None and f['cadres'] == 15 and f['vides'] == 12 and f['images'] == 3 and '3 sur 15' in f['n'] and f['large'], f'l\'album : quinze cadres, trois photos, douze cadres vides, « 3 sur 15 » ({f})')
    shot(pg, 'album')
    pg.evaluate("() => { var g = document.querySelector('#atelier-ici .at-grim .at-fermer'); if(g) g.click(); }"); pg.wait_for_timeout(300)
    # (une pose rare : au galop)
    calme(pg, cid); voir_chat(pg, cid)
    p0 = chat(pg, cid)['pos']
    pg.evaluate(f"() => {V}._va('{cid}', {p0['x'] + (300 if p0['x'] < 600 else -300)}, {p0['y']}, 4.2)"); pg.wait_for_timeout(320)
    pg.locator('#atelier-ici .at-photo-bt').click(); pg.wait_for_timeout(450)
    tg = toast(pg); al = [f['k'] for f in mimi(pg)['mimi']['album']]
    verifier('galop' in al and 'rare' in tg, f'au galop : « Ventre à terre », une pose rare ({tg[:80]})')
    calme(pg, cid)
    # --- son pelage, ses yeux : dans sa garde-robe ; elle change pour de bon ---
    pg.evaluate("() => { M.S.atelier.mimi.peaux.p = [3]; }")
    DESSIN = f"() => {{ var d = document.querySelector('#atelier-ici [data-obj=\"{cid}\"] svg'); var h = d ? d.innerHTML : ''; return {{v:{CHATJS}.v, blanc:h.indexOf('atg-mim3') >= 0, roux:h.indexOf('atg-mim0)') >= 0, bleus:h.indexOf('atg-mimz0') >= 0}}; }}"
    pg.evaluate(f"() => {V}._garde('{cid}')"); pg.wait_for_timeout(500)
    g = pg.evaluate("() => { var l = [].map.call(document.querySelectorAll('#atelier-ici [data-peau]'), function(b){ return b.getAttribute('data-peau') + (b.classList.contains('on') ? '*' : ''); }); return {l:l, verrous:document.querySelectorAll('#atelier-ici .at-garde-verrou').length}; }")
    verifier(g['l'] == ['p:0*', 'p:3', 'y:-1*', 'y:0'] and g['verrous'] >= 2, f'sa garde-robe : son pelage (le sien, et la blanche gagnée), ses yeux (les siens, et les bleus) ; le reste est à gagner ({g})')
    shot(pg, 'garde-peaux')
    pg.locator('#atelier-ici [data-peau="p:3"]').click(); pg.wait_for_timeout(500)
    pg.locator('#atelier-ici [data-peau="y:0"]').click(); pg.wait_for_timeout(500)
    d1 = pg.evaluate(DESSIN)
    verifier(d1 == {'v': 103, 'blanc': True, 'roux': False, 'bleus': True}, f'on touche : la voilà blanche comme neige, aux yeux bleus ({d1})')
    shot(pg, 'garde-blanche')
    pg.evaluate("() => { var g = document.querySelector('#atelier-ici .at-grim .at-fermer'); if(g) g.click(); }"); pg.wait_for_timeout(300)
    voir_chat(pg, cid); pg.wait_for_timeout(300); shot(pg, 'blanche')
    pg.evaluate(f"() => {V}._garde('{cid}')"); pg.wait_for_timeout(400)
    g = pg.evaluate("() => [].map.call(document.querySelectorAll('#atelier-ici [data-peau]'), function(b){ return b.getAttribute('data-peau') + (b.classList.contains('on') ? '*' : ''); })")
    verifier(g == ['p:0', 'p:3*', 'y:-1', 'y:0*'], f'son pelage roux n\'est pas perdu : elle peut y revenir ({g})')
    pg.locator('#atelier-ici [data-peau="p:0"]').click(); pg.wait_for_timeout(400)
    pg.locator('#atelier-ici [data-peau="y:-1"]').click(); pg.wait_for_timeout(400)
    d2 = pg.evaluate(DESSIN)
    verifier(d2 == {'v': 0, 'blanc': False, 'roux': True, 'bleus': False}, f'et la revoilà rousse, avec ses yeux à elle ({d2})')
    pg.evaluate("() => { var g = document.querySelector('#atelier-ici .at-grim .at-fermer'); if(g) g.click(); }"); pg.wait_for_timeout(300)
    # (un pelage dans un coffret)
    calme(pg, cid)
    ok = pg.evaluate(f"() => Atelier._vue()._cadeau('{cid}', 'p:4')")
    t0 = time.time()
    while time.time() - t0 < 34 and not mimi(pg)['tama'].get('coffret'): pg.wait_for_timeout(500)
    pg.wait_for_timeout(600)
    pg.evaluate("() => { var c = M.S.atelier.tama.coffret; if(c) Atelier._vue()._voir(c.x, c.y); }"); pg.wait_for_timeout(500)
    cq = pg.evaluate("() => { var e = document.querySelector('#atelier-ici .at-coffret svg'); if(!e) return null; var r = e.getBoundingClientRect(); return {x:r.left + r.width / 2, y:r.top + r.height * .6}; }")
    if cq: tap(pg, cq['x'], cq['y']); pg.wait_for_timeout(700)
    m = mimi(pg)
    verifier(ok and 4 in m['mimi']['peaux']['p'] and 'pelage' in toast(pg) and m['mimi'].get('peauNeuve') == 1, f'un coffret apporte un pelage ({toast(pg)[:90]})')
    pg.evaluate(f"() => {{ {CHATJS}.bh = 30; }}")
    # --- la litière ---
    lid = pg.evaluate("() => (M.S.atelier.objets.filter(function(o){ return o.t === 'litiere'; })[0] || {}).id")
    if lid:
        pg.evaluate(f"() => {{ var l = M.S.atelier.objets.filter(function(o){{ return o.id === '{lid}'; }})[0]; l.sale = 1; var a = Atelier._vue(); a.maj({{}}); var p = a._pos('{lid}'); a._voir(p.x, p.y); }}"); pg.wait_for_timeout(500)
        shot(pg, 'litiere-sale')
        pg.locator(f'#atelier-ici [data-obj="{lid}"]').click(force=True); pg.wait_for_timeout(1200)
        verifier(not pg.evaluate(f"() => M.S.atelier.objets.filter(function(o){{ return o.id === '{lid}'; }})[0].sale"), 'la litière sale : un toucher, la pelle passe')
    # ============ LA JAUGE SEULE (§12.69) : la barre de bonheur, les familles et les envies cachées, le coffret quand la barre est pleine ============
    CHAT = "M.S.atelier.objets.filter(function(x){ return x.t === 'chat'; })[0]"
    HABITS = ['collier_rouge', 'collier_bleu', 'collier_vert', 'clochette', 'noeud_pap_violet', 'noeud_pap_jaune', 'foulard', 'noeud_rose', 'noeud_bleu', 'sorciere', 'beret', 'fete', 'fleurs', 'perles', 'arc', 'couronne', 'mage']
    RIGOLOS = pg.evaluate("() => Object.keys(MimiPantin.HABITS)")      # (17 novembre : les habits rigolos — ils viennent du travail de l'Alchimiste, pas des coffrets : mimi-habits.py)
    pg.evaluate("() => { var g = document.querySelector('#atelier-ici .at-grim .at-fermer'); if(g) g.click(); }"); pg.wait_for_timeout(300)
    calme(pg, cid); voir_chat(pg, cid)
    pg.evaluate(f"""() => {{ var a = {V}, t = M.S.atelier.tama, o = {CHAT};
      t.las = {{}}; t.envie = null; t.envieT = 1e9; t.coffret = null; t.dehors = null; t.fam = {{}};
      o.bh = 15; Object.keys(o.b).forEach(function(k){{ o.b[k] = 100; }}); a._envie(null); }}""")
    pg.wait_for_timeout(900)
    # --- à l'écran : la jauge de bonheur, et rien d'autre (ni cœurs, ni liste, ni envie) ---
    j = pg.evaluate("""() => { var b = document.querySelector('#atelier-ici .at-mimi-bt'), ja = b && b.querySelector('.at-mimi-jauge'); if(!ja) return null;
      var r = ja.getBoundingClientRect(), f = ja.querySelector('b').getBoundingClientRect(), bt = b.getBoundingClientRect();
      return {l:Math.round(r.width), h:Math.round(r.height), rempli:Math.round(f.width / (r.width * ja.clientWidth / ja.offsetWidth) * 100), dessus:r.bottom <= bt.top + 2, dedans:r.top >= 0 && r.left >= 0 && r.right <= innerWidth,
        coeurs:document.querySelectorAll('#atelier-ici .at-mimi-coeurs, #atelier-ici .at-mb-coeurs, #atelier-ici .at-co-ligne').length}; }""")
    verifier(j is not None and j['l'] >= 60 and j['h'] >= 12 and j['dessus'] and j['dedans'] and 11 <= j['rempli'] <= 19, f'au-dessus du bouton 🐾 : sa jauge de bonheur, toujours là, remplie à 15 sur 100 ({j})')
    verifier(j is not None and j['coeurs'] == 0, 'plus aucun cœur à l\'écran')
    shot(pg, 'jauge')
    ouvrir_barre(pg)
    nb = pg.locator('#atelier-ici [data-mimi=coeurs], #atelier-ici [data-mimi=envie]').count()
    verifier(nb == 0 and pg.locator('#atelier-ici .at-mb-barre').count() == 1 and pg.locator('#atelier-ici [data-mimi="album"]').count() == 1, 'dans sa barre : son bonheur, ses affaires, son album ; ni cœurs ni envie')
    shot(pg, 'barre')
    pg.locator('#atelier-ici [data-mimi=x]').click(); pg.wait_for_timeout(300)
    # --- la lassitude : refaire la même chose rapporte de moins en moins ; ça s'oublie avec le temps de jeu ---
    r = pg.evaluate(f"""() => {{ var a = {V}, o = {CHAT}, l = []; for(var i = 0; i < 4; i++){{ var b0 = o.bh; a._soigner('griffoir', 10, 'jeu'); l.push(Math.round((o.bh - b0) * 100) / 100); }} return l; }}""")
    verifier(r == [5, 2.5, 1.25, 0.5], f'le même soin quatre fois de suite : de moins en moins de bonheur ({r})')
    r = pg.evaluate(f"""() => {{ var a = {V}; for(var i = 0; i < 10; i++) a._tama(15); return a._lasse('griffoir'); }}""")
    verifier(abs(r - 0.25) < 0.02, f'deux minutes et demie de jeu plus tard : un cran de lassitude oublié ({r})')
    pg.evaluate(f"""() => {{ var o = {CHAT}; M.S.atelier.tama.las = {{}}; o.bh = 15; Object.keys(o.b).forEach(function(k){{ o.b[k] = 100; }}); }}""")
    # --- ses cinq familles (cachées) : tout ce qui existe est dans une famille, une seule ; ce que les coffrets apportent ---
    f = pg.evaluate(f"""() => {{ var e = M.S.atelier, g = JSON.stringify([e.mimi.jouets, e.mimi.nour, e.mimi.soins, e.garde.a, e.tama.recus]);
      e.mimi.jouets = ['pelote']; e.mimi.nour = ['croquettes']; e.mimi.soins = ['photo']; e.garde.a = []; e.tama.recus = []; var px = e.mimi.peaux; e.mimi.peaux = {{p:[], y:[]}};
      var coussins = e.objets.filter(function(o){{ return o.t === 'coussin'; }}).length + e.cartons.filter(function(k){{ return (k.reste || []).indexOf('coussin') >= 0; }}).length;
      var r = {V}._familles().reste, v = JSON.parse(g);
      e.mimi.jouets = v[0]; e.mimi.nour = v[1]; e.mimi.soins = v[2]; e.garde.a = v[3]; e.tama.recus = v[4]; e.mimi.peaux = px;
      return {{reste:r, coussins:coussins}}; }}""")
    tout = [c for k in f['reste'] for c in f['reste'][k]]
    attendu = ['j:' + x for x in ['plume', 'laser', 'souris', 'grelot', 'carton', 'herbe']] + ['n:' + x for x in ['pate', 'poisson', 'festin']] + ['s:' + x for x in ['brosse', 'bain', 'friandises', 'griffoir']] + ['a:' + x for x in HABITS] + ['p:3', 'p:4', 'p:5', 'p:6', 'y:2', 'y:4'] + ([] if f['coussins'] else ['c:coussin'])
    verifier(sorted(f['reste'].keys()) == ['belle', 'envies', 'recre', 'reine', 'ventre'] and len(RIGOLOS) >= 18 and sorted(tout) == sorted(attendu) and len(set(tout)) == len(tout),
        f'cinq familles (les habits rigolos n\'y sont pas) ; chaque jouet, plat, objet de soin et habit est dans une famille, une seule — et quatre pelages, deux couleurs d\'yeux ({ {k: len(v) for k, v in f["reste"].items()} })')
    f = pg.evaluate(f"() => {V}._familles()")
    l = pg.evaluate(f"() => {{ var a = {V}, l = []; for(var i = 0; i < 60; i++) l.push(a._contenu()); return l; }}")
    reste = [c for k in f['reste'] for c in f['reste'][k]]
    verifier(all(x['c'] in reste for x in l) and len(set(x['c'] for x in l)) >= 6, f'dans un coffret : toujours une chose qu\'elle n\'a pas, tirée dans ses familles ({sorted(set(x["c"] for x in l))[:8]}…)')
    o = pg.evaluate(f"""() => {{ var e = M.S.atelier, a = {V}, g = e.mimi.soins, r = [];
      [['photo'], ['brosse', 'photo'], ['brosse', 'bain', 'photo']].forEach(function(l){{ e.mimi.soins = l; var vus = {{}}; for(var i = 0; i < 80; i++){{ var c = a._contenu().c; if(a._familles().reste.belle.indexOf(c) >= 0) vus[c] = 1; }} r.push(Object.keys(vus)); }});
      e.mimi.soins = g; return r; }}""")
    verifier(o[0] == ['s:brosse'] and o[1] == ['s:bain'] and len(o[2]) > 1 and all(x[:2] in ('a:', 'p:', 'y:') for x in o[2]), f'« toute belle » : d\'abord la brosse, puis le bain, puis le reste au hasard ({o[0]}, {o[1]}, {len(o[2])} autres)')
    # --- les envies : d'abord cachée (ni bulle, ni rien dans sa barre) ; on la devine à ce qu'elle fait ---
    l = pg.evaluate(f"() => {V}._enviesPossibles()")
    verifier('caresse' in l and 'jouet:pelote' in l and 'dodo' in l and 'bain' in l, f'ce dont elle peut avoir envie ({l})')
    BULLE = f"() => {{ var b = document.querySelector('#atelier-ici [data-obj=\"{cid}\"] .at-bulle'); return b && !b.hidden ? {{k:b.getAttribute('data-bulle'), envie:b.classList.contains('at-envie'), ic:b.textContent}} : null; }}"
    calme(pg, cid); voir_chat(pg, cid)
    e = pg.evaluate(f"() => {V}._envie('jouet:laser')"); pg.wait_for_timeout(300)
    verifier(e == {'k': 'jouet:laser', 'd': False, 'f': 'recre'} and pg.evaluate(BULLE) is None, f'une envie toute neuve : elle ne la dit pas (pas de bulle) ({e})')
    # (son manège, famille par famille)
    lieux = pg.evaluate("() => { var a = Atelier._vue(), r = {}; M.S.atelier.objets.forEach(function(o){ if(['gamelle', 'eau', 'litiere', 'distributeur', 'panier', 'coussin', 'pouf', 'arbre_chat', 'griffoir', 'lit'].indexOf(o.t) >= 0){ var p = a._pos(o.id); (r[o.t] = r[o.t] || []).push([p.x, p.y]); } }); return r; }")
    def pres_de(types, d=150):
        c = chat(pg, cid)['pos'] or {}
        return any(abs(c.get('x', 1e9) - x) < d and abs(c.get('y', 1e9) - y) < 90 for t in types for (x, y) in lieux.get(t, []))
    def manege(k, fam, attente=6.5, quoi=None):
        calme(pg, cid); voir_chat(pg, cid)
        pg.evaluate(f"() => {{ {V}._envie('{k}'); }}")
        s = pg.evaluate(f"() => {V}._envieSigne('{cid}')")
        t0 = time.time(); ok = False
        while time.time() - t0 < attente and not ok:
            pg.wait_for_timeout(300); ok = quoi() if quoi else True
        voir_chat(pg, cid); pg.wait_for_timeout(350); shot(pg, 'signe-' + fam)
        verifier(s == fam and ok and pg.evaluate(BULLE) is None, f'envie « {k} » : son manège montre « {fam} », sans bulle ({s}, {chat(pg, cid)["pose"]})')
    manege('repas:croquettes', 'ventre', quoi=lambda: not chat(pg, cid)['anim'] and pres_de(['gamelle', 'eau', 'litiere', 'distributeur']))
    manege('brosse', 'belle', quoi=lambda: chat(pg, cid)['pose'] == 'lave')
    g = pantin(pg, cid)
    verifier(g and 'toilette' in g['gestes'], f'toute belle : elle fait sa toilette ({g["gestes"] if g else None})')
    manege('dodo', 'reine', quoi=lambda: not chat(pg, cid)['anim'] and pres_de(['panier', 'coussin', 'pouf', 'arbre_chat', 'griffoir', 'lit']) and not chat(pg, cid)['dort'])
    manege('caresse', 'calin', quoi=lambda: not chat(pg, cid)['anim'])
    manege('jouet:laser', 'recre', attente=1.2)
    # (une minute de jeu sans qu'on trouve : sa bulle dorée le dit)
    calme(pg, cid); voir_chat(pg, cid)
    e = pg.evaluate(f"() => {{ var a = {V}; a._envie('jouet:laser'); for(var i = 0; i < 3; i++) a._tama(15); return a._envie(); }}")
    verifier(e['d'] is False and pg.evaluate(BULLE) is None, 'quarante-cinq secondes : toujours rien')
    e = pg.evaluate(f"() => {{ var a = {V}; a._tama(15); return a._envie(); }}"); pg.wait_for_timeout(300)
    bu = pg.evaluate(BULLE)
    verifier(e['d'] is True and bu is not None and bu['k'] == 'envie' and bu['envie'] and '🔴' in bu['ic'], f'une minute : sa bulle dorée la dit ({bu})')
    shot(pg, 'envie')
    pg.evaluate(f"() => {{ var b = document.querySelector('#atelier-ici [data-obj=\"{cid}\"] .at-bulle'); if(b) b.click(); }}"); pg.wait_for_timeout(400)
    verifier('point rouge' in toast(pg), f'on touche la bulle : le conteur raconte son envie ({toast(pg)[:70]})')
    # (pile poil : devinée, elle rapporte plus que dite)
    r = pg.evaluate(f"""() => {{ var a = {V}, o = {CHAT}; M.S.atelier.tama.las = {{}}; o.bh = 20; a._envie('jouet:laser');
      var b0 = o.bh; a._soigner('jouet:grelot', 10, 'jeu'); var b1 = o.bh, e1 = a._envie(); a._soigner('jouet:laser', 10, 'jeu'); var b2 = o.bh, e2 = a._envie();
      var fl = [].map.call(document.querySelectorAll('#atelier-ici .at-flotte'), function(x){{ return x.textContent; }}).join('|');
      M.S.atelier.tama.las = {{}}; a._envie('jouet:plume', true); a._soigner('jouet:plume', 10, 'jeu');
      return {{autre:Math.round((b1 - b0) * 100) / 100, devinee:Math.round((b2 - b1) * 100) / 100, dite:Math.round((o.bh - b2) * 100) / 100, reste:e1 && e1.k, apres:e2, fl:fl, fin:a._envie()}}; }}""")
    verifier(r['reste'] == 'jouet:laser' and r['autre'] == 5 and r['apres'] is None and r['fin'] is None, f'un autre jouet de la même famille : elle est contente, sans plus, et l\'envie reste ; le bon : elle est exaucée ({r})')
    verifier(r['devinee'] == 21 and r['dite'] == 15, f'devinée avant qu\'elle le dise : 16 de bonheur en plus ; après sa bulle : 10 ({r["devinee"]}, {r["dite"]})')
    verifier('Pile poil' in r['fl'] and 'Pile ça' not in r['fl'], f'« Pile poil ! » ({r["fl"]})')
    pg.wait_for_timeout(500); shot(pg, 'pile-poil')
    # (ce qu'elle fait d'elle-même ne compte pas : il faut que ce soit nous)
    r = pg.evaluate(f"""() => {{ var a = {V}; M.S.atelier.tama.las = {{}}; a._envie('griffoir'); a._soigner('griffoir:seule', 6, 'jeu'); var e1 = a._envie(); a._soigner('griffoir', 6, 'jeu'); return {{seule:e1 && e1.k, nous:a._envie(), las:a._lasse('griffoir')}}; }}""")
    verifier(r['seule'] == 'griffoir' and r['nous'] is None and r['las'] <= 0.25, f'elle fait ses griffes toute seule : ce n\'est pas « pile poil » ; quand c\'est nous qui l\'y invitons, si ({r})')
    # (des gratouilles : au bout de quatre bonnes secondes sur la tête)
    pg.evaluate(f"() => {{ {CHAT}.bh = 20; {V}._envie('caresse'); M.S.atelier.tama.las = {{}}; }}"); pg.wait_for_timeout(300)
    calme(pg, cid); q = sur_chat(pg, cid, 'tete')
    lacher = tenir(pg, *q, 5600, bouge=3)
    lacher(); pg.wait_for_timeout(400)
    verifier(pg.evaluate(f"() => {V}._envie()") is None, 'son envie de gratouilles : exaucée au bout de quelques secondes')
    # (une sieste douillette : on la porte dans son panier ; elle pétrit, tourne sur elle-même, s'endort)
    pid = pg.evaluate("() => (M.S.atelier.objets.filter(function(o){ return o.t === 'panier'; })[0] || {}).id || null")
    verifier(pid is not None, 'son panier est là')
    if pid:
        pg.evaluate(f"() => {{ var a = {V}; M.S.atelier.tama.las = {{}}; {CHAT}.bh = 20; a._reveil('{cid}'); a._envie('dodo'); a._poserSur('{cid}', '{pid}'); var p = a._pos('{pid}'); a._voir(p.x, p.y - 40); }}")
        pg.wait_for_timeout(900); shot(pg, 'panier-petrit')
        t0 = time.time(); e = 1
        while time.time() - t0 < 9 and e is not None:
            pg.wait_for_timeout(500); e = pg.evaluate(f"() => {V}._envie()")
        c = chat(pg, cid)
        verifier(e is None and c['dort'], f'son envie de sieste : portée dans son panier, elle s\'y endort, pile poil ({round(time.time() - t0, 1)} s)')
        shot(pg, 'panier-dort')
    # --- la barre pleine : elle file chercher un coffret, toute seule ; on l'ouvre : la barre redescend ---
    calme(pg, cid); voir_chat(pg, cid)
    pg.evaluate(f"() => {{ var a = {V}; M.S.atelier.tama.las = {{}}; {CHAT}.bh = 60; a._envie(null); a._soigner('eau', 5, 'soif'); }}")
    verifier(pg.evaluate(f"() => {V}._peutSortir('{cid}')") is False, 'sa barre à moitié pleine : elle ne part pas')
    pg.wait_for_timeout(3000)
    verifier(not mimi(pg)['tama'].get('dehors'), 'et elle n\'est pas partie')
    # (toutes ses familles sont complètes, sauf le ventre plein, où il ne manque que le festin : le coffret sera doré)
    pg.evaluate(f"""() => {{ var e = M.S.atelier, a = {V};
      e.mimi.jouets = ['pelote', 'plume', 'laser', 'souris', 'grelot', 'carton', 'herbe']; e.mimi.soins = ['brosse', 'bain', 'friandises', 'griffoir', 'photo'];
      e.mimi.nour = ['croquettes', 'pate', 'poisson']; e.garde.a = {json.dumps(HABITS)}.concat(Object.keys(MimiPantin.HABITS)); e.tama.recus = ['c:coussin']; e.mimi.peaux = {{p:[3, 4, 5, 6], y:[0, 2, 4]}}; e.tama.fam = {{}}; a._tama(15); }}""")
    f = pg.evaluate(f"() => {V}._familles()")
    verifier(f['fam'] == {'recre': 1, 'belle': 1, 'reine': 1, 'envies': 1} and f['reste']['ventre'] == ['n:festin'], f'quatre familles complètes (notées, sans bruit), il ne manque que le festin ({f["fam"]}, {f["reste"]["ventre"]})')
    calme(pg, cid); voir_chat(pg, cid)
    pg.evaluate(f"() => {{ var a = {V}; M.S.atelier.tama.las = {{}}; M.S.atelier.tama.envie = null; {CHAT}.bh = 97; a._soigner('jouet:carton', 10, 'jeu'); }}")
    pg.wait_for_timeout(900)
    plein = pg.evaluate("() => { var b = document.querySelector('#atelier-ici .at-mimi-bt'), ja = b.querySelector('.at-mimi-jauge'), r = ja.getBoundingClientRect(), f = ja.querySelector('b').getBoundingClientRect(); return {plein:b.classList.contains('plein'), rempli:Math.round(f.width / (r.width * ja.clientWidth / ja.offsetWidth) * 100)}; }")
    verifier(plein['plein'] and plein['rempli'] >= 97, f'sa jauge est pleine, et dorée ({plein})')
    t0 = time.time(); parti = None
    while time.time() - t0 < 6 and not parti:
        pg.wait_for_timeout(300); parti = mimi(pg)['tama'].get('dehors')
    verifier(bool(parti) and parti.get('c') == 'n:festin' and parti.get('g') == 1, f'la barre pleine : elle file chercher un coffret, toute seule ({round(time.time() - t0, 1)} s ; {parti})')
    verifier('moustaches' in toast(pg), f'le conteur le dit ({toast(pg)[:70]})')
    pg.wait_for_timeout(700); shot(pg, 'barre-pleine')
    t0 = time.time()
    while time.time() - t0 < 36 and not mimi(pg)['tama'].get('coffret'): pg.wait_for_timeout(500)
    m = mimi(pg)
    verifier(bool(m['tama'].get('coffret')) and m['tama']['coffret'].get('g') == 1 and pg.locator('#atelier-ici .at-coffret-grand').count() == 1, f'la dernière chose d\'une famille : elle revient avec un grand coffret doré ({round(time.time() - t0)} s)')
    pg.wait_for_timeout(700)
    vu = pg.evaluate(f"""() => {{ var d = document.querySelector('#atelier-ici [data-obj="{cid}"]'); if(!d) return null; var c = getComputedStyle(d); return {{op:c.opacity, vis:c.visibility}}; }}""")
    verifier(vu is not None and vu['op'] == '1' and vu['vis'] == 'visible', f'et on la voit, à côté de son grand coffret (elle ne reste pas invisible) ({vu})')
    verifier(m['bh'] >= 99, f'tant qu\'il n\'est pas ouvert, sa barre reste pleine ({m["bh"]})')
    pg.evaluate("() => { var c = M.S.atelier.tama.coffret; if(c) Atelier._vue()._voir(c.x, c.y); }"); pg.wait_for_timeout(500)
    shot(pg, 'grand-coffret')
    cq = pg.evaluate("() => { var r = document.querySelector('#atelier-ici .at-coffret svg').getBoundingClientRect(); var x = r.left + r.width / 2, y = r.top + r.height * .6, e = document.elementFromPoint(x, y); return {x:x, y:y, sur:!!(e && e.closest('.at-coffret'))}; }")
    verifier(cq['sur'], 'le grand coffret se voit et se touche')
    tap(pg, cq['x'], cq['y']); pg.wait_for_timeout(800)
    m = mimi(pg); f = pg.evaluate(f"() => {V}._familles()")
    verifier(not m['tama'].get('coffret') and 'festin' in m['mimi']['nour'] and f['fam'].get('ventre') == 1, f'on l\'ouvre : le festin ; sa famille « le ventre plein » est complète ({f["fam"]})')
    verifier('garde-manger est complet' in toast(pg), f'le conteur le dit ({toast(pg)[-70:]})')
    verifier(m['bh'] == 30, f'et hop, son bonheur redescend à 30 ({m["bh"]})')
    pg.wait_for_timeout(800)
    vide = pg.evaluate("() => { var b = document.querySelector('#atelier-ici .at-mimi-bt'), ja = b.querySelector('.at-mimi-jauge'), r = ja.getBoundingClientRect(), f = ja.querySelector('b').getBoundingClientRect(); return {plein:b.classList.contains('plein'), rempli:Math.round(f.width / (r.width * ja.clientWidth / ja.offsetWidth) * 100)}; }")
    verifier(not vide['plein'] and 26 <= vide['rempli'] <= 34, f'sa jauge le montre ({vide})')
    shot(pg, 'grand-ouvert')
    # (elle a tout : les coffrets apportent des friandises ; et sa barre de nouveau pleine, elle repart — dans le même moment)
    verifier(pg.evaluate(f"() => {V}._contenu()") == {'c': 'f:'}, 'elle a tout : dans le prochain coffret, des friandises')
    calme(pg, cid); voir_chat(pg, cid)
    pg.evaluate(f"() => {{ var a = {V}; M.S.atelier.tama.las = {{}}; {CHAT}.bh = 97; a._soigner('jouet:plume', 10, 'jeu'); }}")
    t0 = time.time(); parti = None
    while time.time() - t0 < 6 and not parti:
        pg.wait_for_timeout(300); parti = mimi(pg)['tama'].get('dehors')
    verifier(bool(parti) and not parti.get('g'), f'sa barre de nouveau pleine, dans le même moment : elle repart aussitôt ({round(time.time() - t0, 1)} s ; {parti})')
    t0 = time.time()
    while time.time() - t0 < 36 and not mimi(pg)['tama'].get('coffret'): pg.wait_for_timeout(500)
    verifier(bool(mimi(pg)['tama'].get('coffret')), f'et elle rapporte encore un coffret ({round(time.time() - t0)} s)')
    nb = pg.evaluate("() => document.querySelectorAll('#atelier-ici .at-mimi-coeurs, #atelier-ici .at-mb-coeurs, #atelier-ici .at-co-ligne, #atelier-ici .at-mb-envie').length")
    verifier(nb == 0, 'du début à la fin : ni cœurs, ni liste, ni envie affichée')
    verifier(all('Touche' not in t for t in pg.evaluate("() => window.__lus || []")), 'aucun texte lu ne dit « Touche … »')
    b.close()
print('ERREURS', erreurs)
print('ÉCHECS', len(echecs), echecs)
sys.exit(1 if echecs or erreurs else 0)
