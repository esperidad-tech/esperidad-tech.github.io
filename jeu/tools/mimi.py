"""Mimi, le Tamagotchi refait le 16 novembre (Bible §12.65) et son pantin articulé (§12.66), dans le vrai jeu, au doigt (Playwright).
- le pantin : ses morceaux (cuisse, mollet, pied…), ses poses où il glisse, sa toilette, ses yeux qui suivent le doigt, un bond en plusieurs temps, ses jeux ;
- le bouton 🐾 et le cœur de son bonheur ;
- un petit toucher : une réaction tout de suite, au hasard, jamais deux fois la même de suite ; elle ne se soulève plus ;
- le doigt posé : la tête (frotte, ronronne, puis pétrit), le ventre (sur le dos, elle attrape), la queue (« Pas la queue ! », elle s'en va) ;
- les planchers : son bonheur ne descend jamais sous 34, ses besoins sous 25 ; une vieille sauvegarde garde un bonheur ;
- la boutique (des pièces d'or) : la pâtée, puis la gamelle qui demande quoi servir ; un habit ;
- la variété : cinq soins différents → la brosse ; la brosse au doigt ; le bain ; les friandises ; l'appareil photo et l'album ;
- le coffret : elle sort par la chatière, revient, le pose ; on l'ouvre : un jouet ; les sept jouets, chacun joué ;
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
    verifier('at-leve' not in cl2, 'le doigt qu\'on laisse ne la soulève plus')
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
    verifier(r['bh'] >= 34 and min(r['b'].values()) >= 25, f'oubliée longtemps : son bonheur reste ≥ 34, ses besoins ≥ 25 ({r})')
    verifier(pg.evaluate(f"() => document.querySelector('#atelier-ici [data-obj=\"{cid}\"]').className.indexOf('at-c-triste') < 0"), 'elle n\'est jamais triste')
    vieux = pg.evaluate("() => { var e = Atelier.etatNeuf(); var c = {id:'o99', t:'chat', x:600, y:700, v:0, b:{faim:60, soif:80, amour:40, jeu:20, dodo:100}}; e.objets.push(c); Atelier.normaliser(e); return {bh:c.bh, b:c.b, mimi:e.mimi}; }")
    verifier(vieux['bh'] == 60 and 'dodo' not in vieux['b'] and vieux['b']['propre'] == 80 and vieux['mimi']['jouets'] == ['pelote'], f'une vieille sauvegarde : son bonheur vient de ses anciens besoins ({vieux["bh"]}), la pelote')
    # --- la boutique : la pâtée ; la gamelle demande quoi servir ---
    pg.evaluate("() => { M.S.or = 20; M.sauver(); }")
    calme(pg, cid)
    pg.locator('#atelier-ici .at-mimi-bt').click(force=True); pg.wait_for_timeout(500)
    verifier(pg.locator('#atelier-ici .at-mimi-barre:not([hidden])').count() == 1, 'le bouton 🐾 ouvre la barre de Mimi (pas un écran à part)')
    tailles = pg.evaluate("() => [].map.call(document.querySelectorAll('#atelier-ici .at-mb-bt'), function(b){ var r = b.getBoundingClientRect(); return Math.min(r.width, r.height); })")
    verifier(tailles and min(tailles) >= 48, f'ses boutons font au moins 48 points ({min(tailles) if tailles else None})')
    shot(pg, 'barre')
    pg.locator('#atelier-ici [data-mimi=shop]').click(); pg.wait_for_timeout(500)
    verifier(pg.locator('#atelier-ici .at-f-boutique').count() == 1, 'la boutique de Mimi')
    shot(pg, 'boutique')
    pg.locator('#atelier-ici [data-achat="n:pate"]').click(); pg.wait_for_timeout(400)
    verifier(pg.evaluate("() => M.S.or") == 16 and 'pate' in mimi(pg)['mimi']['nour'], 'la pâtée achetée : 4 pièces d\'or')
    hab = pg.evaluate("() => { var b = document.querySelector('#atelier-ici [data-achat^=\"h:\"]'); return b ? b.getAttribute('data-achat') : null; }")
    if hab:
        pg.locator(f'#atelier-ici [data-achat="{hab}"]').click(); pg.wait_for_timeout(400)
        verifier(hab[2:] in pg.evaluate("() => M.S.atelier.garde.a"), f'un habit acheté ({hab[2:]})')
    pg.evaluate("() => { M.S.or = 1; }")
    pg.locator('#atelier-ici [data-achat="n:poisson"]').click(); pg.wait_for_timeout(300)
    verifier('pièce' in toast(pg) and 'poisson' not in mimi(pg)['mimi']['nour'], f'pas assez de pièces : rien n\'est acheté ({toast(pg)[:50]})')
    pg.evaluate("() => { var g = document.querySelector('#atelier-ici .at-grim .at-fermer'); if(g) g.click(); }"); pg.wait_for_timeout(300)
    gid = pg.evaluate("() => (M.S.atelier.objets.filter(function(o){ return o.t === 'gamelle'; })[0] || {}).id")
    pg.evaluate(f"() => {{ var g = M.S.atelier.objets.filter(function(o){{ return o.id === '{gid}'; }})[0]; g.plein = 0; var p = {V}._pos('{gid}'); {V}._voir(p.x, p.y); }}"); pg.wait_for_timeout(400)
    pg.evaluate(f"() => {{ var o = M.S.atelier.objets.filter(function(x){{ return x.t === 'chat'; }})[0]; o.b.faim = 100; }}")
    pg.locator(f'#atelier-ici [data-obj="{gid}"]').click(force=True); pg.wait_for_timeout(500)
    nb = pg.locator('#atelier-ici .at-bulles-nour .at-bulle-pa').count()
    verifier(nb == 2, f'la gamelle demande quoi servir : croquettes ou pâtée ({nb})')
    shot(pg, 'gamelle')
    if nb: pg.locator('#atelier-ici [data-bulle="nour:pate"]').click(); pg.wait_for_timeout(400)
    verifier(pg.evaluate(f"() => {{ var g = M.S.atelier.objets.filter(function(o){{ return o.id === '{gid}'; }})[0]; return g.plein && g.nour; }}") == 'pate', 'la pâtée est dans la gamelle')
    # --- la variété : cinq soins différents → la brosse ---
    pg.evaluate("() => { var a = Atelier._vue(); a._soigner('eau', 5, 'soif'); a._soigner('repas', 6, 'faim'); a._soigner('caresse', 4, 'amour'); a._soigner('jouet', 10, 'jeu'); a._soigner('eau', 5, 'soif'); }")
    pg.wait_for_timeout(2400)
    m = mimi(pg)
    verifier('brosse' in m['mimi']['soins'], f'cinq soins différents : un nouvel objet de soin arrive, la brosse ({m["mimi"]["soins"]})')
    pg.evaluate("() => { var a = Atelier._vue(); a._soigner('eau', 5, 'soif'); a._soigner('eau', 5, 'soif'); a._soigner('eau', 5, 'soif'); }")
    verifier(mimi(pg)['tama']['varie'] <= 20, 'toujours le même soin : la variété ne monte pas')
    # --- la brosse, au doigt ---
    a = sur_chat(pg, cid, 'h')
    pg.locator('#atelier-ici .at-mimi-bt').click(force=True); pg.wait_for_timeout(400)
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
    pg.evaluate("() => { var c = M.S.atelier.tama.coffret; if(c) Atelier._vue()._voir(c.x, c.y); }"); pg.wait_for_timeout(500)
    shot(pg, 'coffret')
    j0 = len(m['mimi']['jouets'])
    cq = pg.evaluate("() => { var r = document.querySelector('#atelier-ici .at-coffret svg').getBoundingClientRect(); var x = r.left + r.width / 2, y = r.top + r.height * .6, e = document.elementFromPoint(x, y); return {x:x, y:y, sur:!!(e && e.closest('.at-coffret'))}; }")
    verifier(cq['sur'], 'le coffret se voit et se touche (rien devant)')
    tap(pg, cq['x'], cq['y']); pg.wait_for_timeout(700)
    m = mimi(pg)
    verifier(len(m['mimi']['jouets']) == j0 + 1 and not m['tama'].get('coffret'), f'on l\'ouvre : un nouveau jouet ({m["mimi"]["jouets"]})')
    verifier(pg.evaluate("() => Atelier._vue()._peutSortir(Atelier._vue()._mimi && (M.S.atelier.objets.filter(function(o){ return o.t === 'chat'; })[0].id))") is False, 'pas un deuxième coffret dans le même moment')
    # --- les sept jouets ---
    pg.evaluate("() => { M.S.atelier.mimi.jouets = ['pelote','plume','laser','souris','grelot','carton','herbe']; }")
    for j in ['plume', 'laser', 'souris', 'grelot', 'carton', 'herbe', 'pelote']:
        calme(pg, cid); voir_chat(pg, cid)
        pg.locator('#atelier-ici .at-mimi-bt').click(force=True); pg.wait_for_timeout(300)
        pg.locator(f'#atelier-ici [data-mimi="j:{j}"]').click(); pg.wait_for_timeout(500)
        if j in ('plume', 'laser'):
            r0 = pg.evaluate("() => { var p = document.querySelector('#atelier-ici .at-piece').getBoundingClientRect(); return {x:p.left, y:p.top, w:p.width, h:p.height}; }")
            pg.mouse.move(r0['x'] + r0['w'] * .3, r0['y'] + r0['h'] * .82); pg.mouse.down()
            for i in range(14): pg.mouse.move(r0['x'] + r0['w'] * (.3 + .04 * i), r0['y'] + r0['h'] * (.82 - .01 * (i % 3)), steps=3); pg.wait_for_timeout(150)
            pg.wait_for_timeout(900); pg.mouse.up()
        if j == 'carton':
            dedans = False
            for i in range(28):            # (elle marche jusqu'au carton, se ramasse, saute : jusqu'à sept secondes)
                pg.wait_for_timeout(250); dedans = 'at-dans-boite' in classes(pg, cid)
                if dedans: break
            pg.wait_for_timeout(500)
            shot(pg, 'carton')
            if pg.locator('#atelier-ici .at-boite').count(): pg.locator('#atelier-ici .at-boite').click(force=True)
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
    pg.locator('#atelier-ici .at-mimi-bt').click(force=True); pg.wait_for_timeout(300)
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
    pg.locator('#atelier-ici .at-mimi-bt').click(force=True); pg.wait_for_timeout(300)
    pg.locator('#atelier-ici [data-mimi="s:friandises"]').click(); pg.wait_for_timeout(3600)
    verifier('friandises' in mimi(pg)['tama']['derniers'], 'les friandises : elle donne la patte, puis croque')
    pg.locator('#atelier-ici .at-mimi-bt').click(force=True); pg.wait_for_timeout(300)
    pg.locator('#atelier-ici [data-mimi="s:friandises"]').click(); pg.wait_for_timeout(300)
    verifier('ventre' in toast(pg), 'pas deux fois de suite : « gare au petit ventre tout rond »')
    # --- la photo et l'album ---
    calme(pg, cid, 'dos')
    pg.locator('#atelier-ici .at-mimi-bt').click(force=True); pg.wait_for_timeout(300)
    pg.locator('#atelier-ici [data-mimi="s:photo"]').click(); pg.wait_for_timeout(600)
    verifier(len(mimi(pg)['mimi']['album']) == 1 and mimi(pg)['mimi']['album'][0]['pose'] == 'dos', 'une photo : elle va dans l\'album (sur le dos)')
    pg.locator('#atelier-ici .at-mimi-bt').click(force=True); pg.wait_for_timeout(300)
    pg.locator('#atelier-ici [data-mimi="album"]').click(); pg.wait_for_timeout(600)
    verifier(pg.locator('#atelier-ici .at-album .at-photo').count() == 1, 'l\'album montre la photo')
    shot(pg, 'album')
    pg.evaluate("() => { var g = document.querySelector('#atelier-ici .at-grim .at-fermer'); if(g) g.click(); }"); pg.wait_for_timeout(300)
    # --- la litière ---
    lid = pg.evaluate("() => (M.S.atelier.objets.filter(function(o){ return o.t === 'litiere'; })[0] || {}).id")
    if lid:
        pg.evaluate(f"() => {{ var l = M.S.atelier.objets.filter(function(o){{ return o.id === '{lid}'; }})[0]; l.sale = 1; var a = Atelier._vue(); a.maj({{}}); var p = a._pos('{lid}'); a._voir(p.x, p.y); }}"); pg.wait_for_timeout(500)
        shot(pg, 'litiere-sale')
        pg.locator(f'#atelier-ici [data-obj="{lid}"]').click(force=True); pg.wait_for_timeout(1200)
        verifier(not pg.evaluate(f"() => M.S.atelier.objets.filter(function(o){{ return o.id === '{lid}'; }})[0].sale"), 'la litière sale : un toucher, la pelle passe')
    verifier(all('Touche' not in t for t in pg.evaluate("() => window.__lus || []")), 'aucun texte lu ne dit « Touche … »')
    b.close()
print('ERREURS', erreurs)
print('ÉCHECS', len(echecs), echecs)
sys.exit(1 if echecs or erreurs else 0)
