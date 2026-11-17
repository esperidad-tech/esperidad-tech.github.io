"""Les quatre films des héros (17 novembre) : filmer les extraits du jeu, rôle par rôle (de vraies images du jeu construit, DIST, et du
   donjon en ligne dans le dépôt du site).   python3 capturer-heros.py [plan …]   → /tmp/pub/plans/<plan>/0000.jpg …
   Un robot à la fois (flock /tmp/brumeval-pw.lock). Les plans de la pub (capturer.py : heros, roles, accueil, gateau…) servent aussi."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from outils_heros import *
from playwright.sync_api import sync_playwright
OBJ = 'objets=sage:cristal-lune,sage:baton-chene,pisteur:fleches-argent,pisteur:fleches-lourdes'
SCENE = {'x': 0, 'y': 9, 'width': 800, 'height': 342}
# ------------------------------------------------------------------ LE DONJON
def dj(b, h, dsf=2.0):
    U = serveur(SITE); d = page(b, 800, 500, dsf, ralenti=True); d.goto(U + 'donjon/' + h); return d
def cacher(d, quoi=('bande', 'haut')):
    d.evaluate("(q) => { q.forEach(function(i){ var c = document.getElementById(i); if(c) c.style.visibility = 'hidden'; }); }", list(quoi))
def entree(b):
    d = dj(b, '?nouveau=1&sanscombat=1&potions=toutes'); d.wait_for_timeout(4000); d.locator('[data-act=sac-pret]').first.click(force=True); d.wait_for_timeout(3500)
    cacher(d, ('bande',)); d.evaluate("() => { document.querySelectorAll('[data-act=pave], [data-act=objets], [data-act=repartir]').forEach(function(e){ e.style.visibility = 'hidden'; }); }")
    lent(d, .25); filmer2(d, 'dj-entree', 2.2, SCENE); d.context.close()
def combat(b, nom, salle, qui, carte, cible, duree=5.0, avant=(), k=.12):
    """un geste d'un héros dans un vrai combat : on choisit le héros, sa carte, puis on touche la cible PENDANT qu'on filme (au ralenti).
       avant : les gestes des amis juste avant (pas filmés) — [(héros, carte, cible), …] : c'est eux qui ouvrent le point faible."""
    d = dj(b, '?combat=%s&potions=toutes&%s' % (salle, OBJ)); d.wait_for_selector('#combat.ouvert', timeout=90000); d.wait_for_timeout(4500)
    def zones():
        return d.evaluate("() => Array.from(document.querySelectorAll('.zone[data-act=perso]')).map(function(z){ var r = z.getBoundingClientRect(); return {t:z.getAttribute('data-type'), id:z.getAttribute('data-id'), x:r.x + r.width / 2, y:r.y + r.height / 2}; })")
    def choisir(q, c):
        d.locator('#bande button', has_text=q).first.click(force=True); d.wait_for_timeout(900)
        d.locator('#bande button', has_text=c).first.click(force=True); d.wait_for_timeout(700)
    def toucher(pg, cb):
        if cb is None: return
        t, i = cb.split(':'); l = [z for z in zones() if z['t'] == t]
        z = next((x for x in l if x['id'] == i), None) or l[0]
        pg.evaluate("([t, id]) => { var z = document.querySelector('.zone[data-act=perso][data-type=' + t + '][data-id=\"' + id + '\"]'); z.click(); }", [z['t'], z['id']])
    for q, c, cb in avant:
        choisir(q, c); toucher(d, cb)
        for _ in range(120):
            d.wait_for_timeout(150)
            if not d.evaluate("() => DJ.Combat.etat().occupe"): break
        d.wait_for_timeout(500)
    choisir(qui, carte)
    print(nom, d.evaluate("() => { var e = DJ.Combat.etat(); return [e.mode, e.geste, JSON.stringify(e.photo.betes.map(function(b){ return [b.id, b.type, b.pv, b.ouvert, Object.keys(b.etats)]; }))]; }"))
    cacher(d)
    lent(d, k); filmer2(d, nom, duree, SCENE, [(.25, lambda pg: toucher(pg, cible))])
    print(nom, d.evaluate("() => { var e = DJ.Combat.etat(); return JSON.stringify(e.photo.betes.map(function(b){ return [b.id, b.pv, b.mort]; })); }")); d.context.close()
# ------------------------------------------------------------------ LE PISTEUR
def V(pg, expr): return pg.evaluate("() => { var v = document.querySelector('.vs').__visee; return " + expr + "; }")
def p_visee(b):
    """un tir réussi, du choix de l'anneau à « Dans l'anneau ! » (le robot vise avec v.viser, comme tools/visee.py)"""
    q = salle(b, '#jeu=visee&n=4', dsf=2, attente=1500); V(q, 'v.tremble(0)')
    z = boite(q, '.vs'); clip = cadre(z)
    i = V(q, 'v.anneaux.filter(function(a){ return !a.fait; })[0].i'); etat = {}
    def choisir(pg): pg.click('.vs-cible[data-i="%d"]' % i, force=True)
    def poser(pg):
        m = V(pg, 'v.mesures()'); etat['x0'], etat['y0'] = z['x'] + m['W'] / 2, z['y'] + m['zone'] + 40
        pg.mouse.move(etat['x0'], etat['y0']); pg.mouse.down()
    def amener(pg):
        c, but = V(pg, 'v.curseur()'), V(pg, 'v.viser(0, 0, false)'); dx, dy = but[0] - c['bx'], but[1] - c['by']
        for s in range(1, 9): pg.mouse.move(etat['x0'] + dx * s / 8, etat['y0'] + dy * s / 8)
    lent(q, .15); filmer2(q, 'p-visee', 7.5, clip, [(.5, choisir), (1.6, poser), (2.1, amener), (4.3, lambda pg: pg.mouse.up())])
    print('p-visee', V(q, 'JSON.stringify(v.mesures().faits)')); q.context.close()
def p_pistage(b):
    q = salle(b, '#jeu=pistage&n=3&v=apresmidi', dsf=2, attente=3500); z = q.evaluate(ZONE); clip = cadre(z)
    q.add_style_tag(content='.pg-dit{visibility:hidden !important}')
    q.mouse.move(z['x'] + z['width'] * .5, z['y'] + z['height'] * .92); q.mouse.down(); q.wait_for_timeout(300)
    lent(q, .15); filmer2(q, 'p-pistage', 3.4, clip); q.context.close()
def p_cachette(b):
    q = salle(b, '#jeu=cachette&n=4&v=foret', dsf=2, attente=4500); z = q.evaluate(ZONE); clip = cadre(z)
    ET = "() => { var t = document.querySelector('.mja-terrain'); return t && t.mjaEtat ? t.mjaEtat() : null; }"; dern = [-9]
    def courir(pg, t):
        if t - dern[0] < .9: return
        e = pg.evaluate(ET)
        if not e or e.get('course') or e.get('passage'): return
        c = [x for x in e['couv'] if x['acc'] and x['sur']]
        if c: m = max(c, key=lambda x: x['k']); pg.evaluate("(i) => document.querySelector('.mja-terrain').mjaCourir(i)", m['i']); dern[0] = t
    lent(q, .15); filmer2(q, 'p-cachette', 6.0, clip, chaque=courir); q.context.close()
def p_oie(b):
    """l'oie de Gaspard : le robot joue pour de vrai (il lit les obstacles qui arrivent : mjaEtat) — il change de voie, saute, se baisse"""
    q = salle(b, '#jeu=poursuite&n=3&v=oie', dsf=2, attente=500); z = q.evaluate(ZONE); clip = cadre(z, haut=1)
    ET = "() => { var t = document.querySelector('.mja-terrain'); var e = t && t.mjaEtat ? t.mjaEtat() : null; return e ? {voie:e.voie, faites:e.faites, vagues:e.vagues} : null; }"; fait = {}
    def touche(pg, k): pg.evaluate("(k) => { var b = document.querySelector('.mja-pb[data-k=' + k + ']'); ['pointerdown', 'pointerup', 'click'].forEach(function(n){ b.dispatchEvent(new PointerEvent(n, {bubbles:true, cancelable:true, pointerId:1})); }); }", k)
    def jouer(pg, t):
        e = pg.evaluate(ET)
        if not e: return
        for i, v in enumerate(e['vagues']):
            cle = e['faites'] + i
            if v['p'] > .97 or v['p'] < .5: continue
            dans = [o for o in v['objs'] if o['voie'] == e['voie'] and o['genre'] != 'boost']
            if not dans: continue
            if any(o['genre'] == 'bloc' for o in dans):
                if fait.get((cle, 'b')): continue
                libres = [x for x in (0, 1, 2) if not any(o['voie'] == x and o['genre'] == 'bloc' for o in v['objs'])]
                if libres: but = min(libres, key=lambda x: abs(x - e['voie'])); touche(pg, 'g' if but < e['voie'] else 'd'); fait[(cle, 'b')] = 1
            elif v['p'] > .76 and not fait.get((cle, 's')):
                if all(o['genre'] == 'bas' for o in dans): touche(pg, 'h'); fait[(cle, 's')] = 1
                elif all(o['genre'] == 'haut' for o in dans): touche(pg, 'b'); fait[(cle, 's')] = 1
    lent(q, .15); filmer2(q, 'p-oie', 7.0, clip, chaque=jouer); q.context.close()
def p_interieur(b):
    """chez Odette, au soleil (enquête 3, l'après-midi) : le rayon, la poussière qui danse, trois dalles qu'on enfonce — PAS les trois bonnes
       (le film ne donne pas la solution) : la lune, l'étoile, la lyre, et « Clac ! », elles remontent"""
    pg = jeu(b, 'pisteur', 3, 1, l=620, h=640, dsf=2.6, ralenti=True)
    ev(pg, 'maison', {'id': 'L2'}); pg.wait_for_timeout(300)
    pg.locator('#voile [data-act=point][data-id=cachette]').first.click(); pg.wait_for_timeout(300)
    pg.locator('#voile [data-act=mj-go]').click(); pg.wait_for_timeout(900); pg.locator('#mj-plein .mj-go').click(); pg.wait_for_timeout(1800)
    pg.add_style_tag(content='.in-bulle{visibility:hidden !important}')
    clip = boite(pg, '.in-piece'); print('p-interieur', clip)
    def dalle(sg):
        def f(pg_):
            q = pg_.evaluate("(sg) => { var r = document.querySelector('.in-dalle[data-signe=' + sg + '] .in-touche').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }", sg); pg_.mouse.click(q[0], q[1])
        return f
    lent(pg, .12); filmer2(pg, 'p-interieur', 3.6, clip, [(.5, dalle('lune')), (1.2, dalle('etoile')), (1.9, dalle('lyre'))]); pg.context.close()
def p_cabane(b):
    pg = jeu(b, 'pisteur', 3, 1, l=1000, h=542, dsf=2.2); onglet(pg, 'role'); pg.wait_for_timeout(1200)
    z = pg.evaluate("() => { var h = document.querySelector('.b-tete, header'), n = document.querySelector('.b-onglets, nav'); var a = h ? h.getBoundingClientRect().bottom : 52, c = n ? n.getBoundingClientRect().top : innerHeight - 62; return {x:0, y:a, width:innerWidth, height:c - a}; }"); print('p-cabane zone', z)
    photo(pg, 'p-cabane', 0, cadre(z))
    # la garde-robe : on touche le héros
    pg.locator('[data-act=perso]').first.click(force=True); pg.wait_for_timeout(1200); vue(pg, 'x-perso'); photo(pg, 'p-habits', 0, cadre(z))
    pg.context.close()
def p_code(b):
    """une trouvaille et son code de trois dessins, à donner à un ami (enquête 1 : les poils de la fenêtre, pour l'Alchimiste)"""
    pg = jeu(b, 'pisteur', 1, 0, l=1000, h=640, dsf=2.4)
    lieu(pg, 'mairie'); pg.locator('#voile [data-act=point][data-id=fenetre]').first.click(); pg.wait_for_timeout(500)
    if pg.locator('#voile [data-act=mj-go]').count():
        pg.locator('#voile [data-act=mj-go]').click(); pg.wait_for_timeout(900)
        if pg.locator('#mj-plein .mj-go').count(): pg.locator('#mj-plein .mj-go').click(); pg.wait_for_timeout(900)
        pg.evaluate("() => window.__finir(true)"); pg.wait_for_timeout(900)
        c = pg.locator('#mj-plein .mj-continuer')
        if c.count(): c.first.click(); pg.wait_for_timeout(700)
    pg.add_style_tag(content='.b-toast, .b-recomp, .gr-toast{display:none !important}')
    pg.wait_for_timeout(600); vue(pg, 'x-code')
    m = pg.evaluate("() => { var best = null; document.querySelectorAll('#voile *').forEach(function(e){ var r = e.getBoundingClientRect(); if(r.width > 400 && r.width < innerWidth - 60 && r.height > 300 && (!best || r.width * r.height > best.width * best.height)) best = {x:r.x, y:r.y, width:r.width, height:r.height}; }); return best; }"); print('p-code fenêtre', m)
    photo(pg, 'p-code', 0, {'x': m['x'] - 8, 'y': m['y'] - 8, 'width': m['width'] + 16, 'height': m['height'] + 16})
    print('p-code', pg.evaluate("() => { var v = document.querySelector('#voile'); return v ? v.innerText.replace(/\\s+/g, ' ').slice(0, 200) : ''; }")); pg.context.close()
# ------------------------------------------------------------------ L'ALCHIMISTE
def zone_jeu(pg):
    """la place du jeu entre le bandeau du haut et les onglets du bas"""
    return pg.evaluate("() => { var h = document.querySelector('.b-tete, header'), n = document.querySelector('.b-onglets, nav'); var a = h ? h.getBoundingClientRect().bottom : 52, c = n ? n.getBoundingClientRect().top : innerHeight - 62; return {x:0, y:a, width:innerWidth, height:c - a}; }")
def a_code(b, nom='a-code', role='alchimiste', cle='obj:fil', n=1):
    """un ami donne son code : on tape les trois dessins, et « Tu as reçu… » (enquête 1 : les poils de la fenêtre, le code du Pisteur)"""
    pg = jeu(b, role, n, 0, l=600, h=470, dsf=3.0, ralenti=True)
    seq = pg.evaluate("(c) => M.code(c)", cle); onglet(pg, 'code'); pg.wait_for_timeout(500); z = zone_jeu(pg); print(nom, seq, z)
    def sym(k):
        def f(pg_):
            e = pg_.locator('[data-act=sym][data-s=%s]' % seq[k]).first
            try: e.click(force=True, timeout=1500)
            except Exception: ev(pg_, 'sym', {'s': seq[k]})
        return f
    lent(pg, .2); filmer2(pg, nom, 3.6, z, [(.4, sym(0)), (.9, sym(1)), (1.4, sym(2))]); pg.context.close()
def a_cueillette(b):
    """une plante cachée sur la carte : on touche le bon endroit, elle surgit (enquête 3 : l'oseille, près de l'herboristerie)"""
    pg = jeu(b, 'alchimiste', 3, 1, l=1000, h=542, dsf=2.0, ralenti=True, tactile=True); onglet(pg, 'carte'); pg.wait_for_timeout(900)
    r = pg.evaluate("() => { var v = document.querySelector('#carte-ici .ca-vue').getBoundingClientRect(); return [v.left + v.width / 2, v.top + v.height / 2]; }"); pg.mouse.move(r[0], r[1])
    for i in range(9): pg.mouse.wheel(0, -240); pg.wait_for_timeout(120)
    PT = """() => { var c = document.querySelector('#carte-ici .ca-cachette[data-id="oseille"]'), vue = document.querySelector('#carte-ici .ca-vue'), monde = document.querySelector('#carte-ici .ca-monde'); if(!c) return null;
      var svg = c.ownerSVGElement, k = monde.getBoundingClientRect().width / svg.viewBox.baseVal.width, ox = +svg.getAttribute('data-ox') || 0, oy = +svg.getAttribute('data-oy') || 0;
      var x = (+c.getAttribute('cx') + ox) * k, y = (+c.getAttribute('cy') + oy) * k;
      vue.scrollLeft = x + monde.offsetLeft - vue.clientWidth / 2; vue.scrollTop = y + monde.offsetTop - vue.clientHeight / 2 + 40;
      var R = monde.getBoundingClientRect(); return {x:R.left + x, y:R.top + y}; }"""
    pg.evaluate(PT); pg.wait_for_timeout(600); q = pg.evaluate(PT); z = zone_jeu(pg); print('a-cueillette', q, z)
    lent(pg, .2); filmer2(pg, 'a-cueillette', 3.2, cadre(z), [(.7, lambda pg_: pg_.touchscreen.tap(q['x'], q['y']))])
    print('a-cueillette', pg.evaluate("() => JSON.stringify(M.plantes())")); pg.context.close()
def labo(b):
    q = page(b, 1000, 428, 2.0, ralenti=True); q.goto('file://' + DIST + '/labo.html'); q.wait_for_function('!!window.__labo'); q.wait_for_timeout(2000)
    q.evaluate("() => { document.querySelectorAll('button, div, a').forEach(function(e){ if(e.children.length < 3 && /^\\s*Maquette/.test(e.textContent || '')) e.style.display = 'none'; }); window.__labo.mimi.calme = true; var g = document.querySelector('.intro-go'); if(g) g.click(); ['bReglages', 'bRecommencer', 'bPlein', 'bSon', 'bQuitter'].forEach(function(i){ var e = document.getElementById(i); if(e) e.style.visibility = 'hidden'; }); }")
    q.wait_for_timeout(500); return q
def clic(sel):
    return lambda pg: pg.click(sel, force=True, timeout=3000)
def a_loupe(b):
    """le fil de la fenêtre sous la loupe : on ouvre le tiroir des fils, on compare, c'est de la laine tricotée"""
    q = labo(b); lent(q, .2)
    filmer2(q, 'a-loupe', 8.6, None, [(.3, clic('#ech-fil')), (.8, clic('#gLoupe')), (2.9, clic('#tir-g .facade')), (4.3, clic('#tir-g [data-casier="fils"]')), (5.1, clic('[data-ech="fils:tricot"]'))])
    print('a-loupe', q.evaluate("() => JSON.stringify(window.__labo.etat().trouves)")); q.context.close()
def a_micro(b):
    """le microscope : les grains accrochés au fil, qu'on prélève un à un"""
    q = labo(b); q.click('#ech-fil', force=True); q.wait_for_timeout(400)
    def prendre(pg):
        g = pg.evaluate("() => { var S = window.__labo.etat(); var l = S.dos[S.dc].items[10].filter(function(i){ return !i.pris && !(i.min > 10); }); return l.length ? {x:l[0].x, y:l[0].y} : null; }")
        if not g: return
        pg.evaluate("g => { var S = window.__labo.etat(); S.cx = g.x; S.cy = g.y; window.__labo.rendre(); }", g)
        bx = pg.locator('#lentille').bounding_box(); pg.mouse.click(bx['x'] + bx['width'] / 2, bx['y'] + bx['height'] / 2)
    lent(q, .2); filmer2(q, 'a-micro', 5.4, None, [(.3, clic('#gMicro')), (2.0, prendre), (3.1, prendre), (4.2, prendre)]); q.context.close()
def a_etabli(b):
    """une potion sur l'établi, image par image : une photo à chaque geste (et une au milieu de chaque geste)"""
    q = page(b, 1000, 428, 2.0); q.goto('file://' + DIST + '/etabli.html'); q.wait_for_function('!!(window.__etabli && document.querySelector("#g-planche"))'); q.wait_for_timeout(1500)
    q.evaluate("() => { document.querySelectorAll('button, div, a').forEach(function(e){ if(e.children.length < 3 && /^\\s*Maquette/.test(e.textContent || '')) e.style.display = 'none'; }); ['bReglages', 'bRecommencer', 'bNuit', 'bSon', 'bQuitter'].forEach(function(i){ var e = document.getElementById(i); if(e) e.style.visibility = 'hidden'; }); var c = document.querySelector('.carte.intro .b-jaune'); if(c) c.click(); }"); q.wait_for_timeout(600)
    n = [0]
    def image(): photo(q, 'a-etabli', n[0]); n[0] += 1
    def libre():
        for _ in range(150):
            if q.evaluate("() => window.__etabli.libre()"): return
            q.wait_for_timeout(60)
    def toucher(sel, au_milieu=True):
        m = q.evaluate("(s) => { var e = document.querySelector(s); if(!e) return null; var r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }", sel)
        if not m: print('  introuvable', sel); return
        q.mouse.click(m[0], m[1])
        if au_milieu: q.wait_for_timeout(230); image()
        libre(); q.wait_for_timeout(120); image()
    def outil(o): toucher('#g-' + o + ' > rect[fill=transparent]')
    R = q.evaluate("() => window.PLANTES_DONNEES"); pid = os.environ.get('POTION', 'acide'); r = R['RE'][pid]; print('a-etabli', pid, r['plante'], r['partie'], [(e['o'], e.get('liq'), e.get('feu')) for e in r['etapes']])
    import shutil; shutil.rmtree(os.path.join(PLANS, 'a-etabli'), ignore_errors=True); image()
    k = r['plante']
    if q.evaluate("(k) => !!document.querySelector('#pendue-' + k)", k): toucher('#pendue-' + k + ' > rect[fill=transparent]'); q.wait_for_timeout(400)
    toucher('#plante-' + k + ' .prise'); q.wait_for_timeout(700); image()
    pt = q.evaluate("""(pa) => { var g = document.querySelector('.plante.zoom .pl-pa[data-pa=' + pa + ']'); if(!g) return null; var r = g.getBoundingClientRect();
      for(var i = 6; i >= 1; i--) for(var a = 0; a < 12; a++){ var d = (6 - i)/6, x = r.left + r.width/2 + Math.cos(a/12*6.283)*r.width/2*d, y = r.top + r.height/2 + Math.sin(a/12*6.283)*r.height/2*d, el = document.elementFromPoint(x, y);
        if(el && el.closest('.pl-pa') && el.closest('.pl-pa').getAttribute('data-pa') === pa) return [x, y]; } return null; }""", r['partie'])
    if pt: q.mouse.click(pt[0], pt[1]); q.wait_for_timeout(250); image(); libre(); image()
    for e in r['etapes']:
        o = e['o']
        if e.get('verse'): outil('cruche'); outil(o)
        else:
            if q.evaluate("() => window.__etabli.etat().ou") != o: outil(o)
            if o in ('marmite', 'alambic'):
                if e.get('liq') == 'eau': outil('cruche'); outil(o)
                if e.get('liq') == 'huile': outil('huilier'); outil(o)
                for _ in range(e.get('feu', 0)): outil('buches'); outil(o)
                if e.get('feu', 0): outil('allumettes'); outil(o)
            if o not in ('filtre', 'sechoir', 'fiole'): outil(o)
        q.wait_for_timeout(200); image()
    for _ in range(40):
        if pid in q.evaluate("() => Object.keys(window.__etabli.etat().faites)"): break
        q.wait_for_timeout(100)
    q.wait_for_timeout(500); image(); q.wait_for_timeout(600); image()
    print('a-etabli :', n[0], 'images ; faite :', pid in q.evaluate("() => Object.keys(window.__etabli.etat().faites)")); q.context.close()
def a_chaudron(b):
    """le chaudron : le feu, la jauge, et on touille (un rond du doigt dans la marmite)"""
    import math
    q = salle(b, '#jeu=chaudron&n=1', dsf=2, attente=2500); z = q.evaluate(ZONE); clip = cadre(z, haut=1); print('a-chaudron', z)
    c = boite(q, '.mjc svg, .mj-zone svg') or z; cx, cy = z['x'] + z['width'] * .5, z['y'] + z['height'] * .66
    q.mouse.move(cx + 40, cy); q.mouse.down()
    def touille(pg, t): a = t * 7; pg.mouse.move(cx + 44 * math.cos(a), cy + 16 * math.sin(a))
    lent(q, .2); filmer2(q, 'a-chaudron', 3.4, clip, chaque=touille); q.context.close()
MIMI = "Atelier._vue()"
def a_mimi(b):
    """Mimi et son parc à chat : elle grimpe au toboggan et glisse (enquête 2 ; les cartons ouverts, ses affaires installées)"""
    pg = jeu(b, 'alchimiste', 2, 0, l=1000, h=542, dsf=3.2, ralenti=True); onglet(pg, 'role'); pg.wait_for_timeout(1200)
    def cartons():
        for i in range(120):
            if not pg.evaluate("() => { var k = document.querySelector('#atelier-ici .at-carton'); if(k) k.dispatchEvent(new MouseEvent('click', {bubbles:true})); return !!k; }"): break
            pg.wait_for_timeout(260); pg.evaluate("() => { var g = document.querySelector('#atelier-ici .at-grim .at-fermer'); if(g) g.click(); }")
    def installer(noms):
        for i in range(30):
            pg.evaluate("() => { var c = document.querySelector('#atelier-ici .at-coin'); if(c) c.dispatchEvent(new MouseEvent('click', {bubbles:true})); }"); pg.wait_for_timeout(350)
            k = pg.evaluate("(re) => { var l = [].slice.call(document.querySelectorAll('#atelier-ici [data-res]')); var b = l.filter(function(x){ return new RegExp(re).test(x.textContent); })[0]; if(b){ b.dispatchEvent(new MouseEvent('click', {bubbles:true})); return b.textContent; } return null; }", noms)
            pg.wait_for_timeout(400); pg.evaluate("() => { var g = document.querySelector('#atelier-ici .at-grim .at-fermer'); if(g) g.click(); }")
            if not k: break
    cartons(); installer('Gamelle|Litière|Distributeur|Panier')
    pg.evaluate("() => { var a = %s; if(a._salle() !== 0) a._allerSalle(0); M.S.atelier.tama.envieT = 1e9; M.S.atelier.tama.envie = null; M.S.atelier.tama.fam = {recre:1, ventre:1, belle:1, reine:1, envies:1}; return a._parcDonner(); }" % MIMI); pg.wait_for_timeout(700)
    cartons(); pg.wait_for_timeout(1200); installer('Tunnel|Hamac|Souris sur ressort|Cabane|Toboggan'); pg.wait_for_timeout(600)
    pg.evaluate("() => { var g = document.querySelector('#atelier-ici .at-fermer'); if(g) g.click(); }"); pg.wait_for_timeout(500)
    cid = pg.evaluate("() => (M.S.atelier.objets.filter(function(o){ return o.t === 'chat'; })[0] || {}).id || null")
    o = pg.evaluate("() => { var o = M.S.atelier.objets.filter(function(x){ return x.t === 'toboggan_chat'; })[0]; if(!o) return null; var p = %s._pos(o.id); return {id:o.id, x:p.x, y:p.y}; }" % MIMI); print('a-mimi', cid, o)
    pg.evaluate("([c]) => { var a = %s; a._finJouet(); a._reveil(c); a._dehors(c); a._pose(c, 'assis'); }" % MIMI, [cid]); pg.wait_for_timeout(300)
    if o: pg.evaluate("([x, y]) => %s._voir(x, y)" % MIMI, [o['x'], o['y'] - 60]); pg.wait_for_timeout(500)
    z = zone_jeu(pg); photo(pg, 'a-atelier', 0, cadre(z)); vue(pg, 'x-mimi')
    pg.add_style_tag(content='#atelier-ici .at-toast{visibility:hidden !important}')
    # de près : un cadre autour du toboggan (Mimi y grimpe par la gauche, glisse vers la droite)
    t = pg.evaluate("(id) => { var e = document.querySelector('#atelier-ici [data-obj=\"' + id + '\"]'); if(!e) return null; var r = e.getBoundingClientRect(); return {x:r.x, y:r.y, width:r.width, height:r.height}; }", o['id']) if o else None
    clip = cadre(z)
    if t:
        w = max(430, t['width'] * 2.6); h = w * 616 / 1440.; cx = t['x'] + t['width'] * .62; cy = t['y'] + t['height'] * .52
        x = min(max(z['x'], cx - w / 2), z['x'] + z['width'] - w); y = min(max(z['y'], cy - h / 2), z['y'] + z['height'] - h); clip = {'x': x, 'y': y, 'width': w, 'height': h}
    print('a-mimi toboggan', t, 'cadre', clip)
    lent(pg, .25); filmer2(pg, 'a-mimi', 14.0, clip, [(.3, lambda pg_: pg_.evaluate("([c]) => %s._parc(c, 'toboggan_chat')" % MIMI, [cid]))], qualite=90)
    pg.context.close()
# ------------------------------------------------------------------ LE BARDE
PLEIN = {'x': 0, 'y': 0, 'width': 760, 'height': 640}
def sans_bulles(pg):
    pg.add_style_tag(content='.b-toast, .b-annonce, .b-recomp, .gr-toast, #toast, .toast{display:none !important}'); pg.evaluate("() => { if(window.M) M.toast = function(){}; }")
def b_carte(b):
    """la carte du village, les habitants chez eux : on touche la boulangerie, Gaspard est là (enquête 1)"""
    pg = jeu(b, 'barde', 1, 0, l=1000, h=542, dsf=2.0, ralenti=True); onglet(pg, 'carte'); pg.wait_for_timeout(900); sans_bulles(pg)
    r = pg.evaluate("() => { var v = document.querySelector('#carte-ici .ca-vue').getBoundingClientRect(); return [v.left + v.width / 2, v.top + v.height / 2]; }"); pg.mouse.move(r[0], r[1])
    for i in range(4): pg.mouse.wheel(0, -240); pg.wait_for_timeout(150)
    pg.evaluate("() => { var e = document.querySelector('#carte-ici g.ca-lieu[data-lieu=boulangerie]'), vue = document.querySelector('#carte-ici .ca-vue'); if(!e) return; var r = e.getBoundingClientRect(), v = vue.getBoundingClientRect(); vue.scrollLeft += r.left + r.width / 2 - (v.left + v.width / 2); vue.scrollTop += r.top + r.height / 2 - (v.top + v.height / 2); }"); pg.wait_for_timeout(600)
    z = zone_jeu(pg)
    lent(pg, .2); filmer2(pg, 'b-carte', 3.0, cadre(z), [(1.2, lambda pg_: pg_.locator('#carte-ici g.ca-lieu[data-lieu=boulangerie] .ca-etiq-lieu').first.click(force=True))]); pg.context.close()
def b_parler(b):
    """une conversation : on entre, on pose une question, la réponse s'écrit (enquête 1 : Gaspard, le boulanger)"""
    pg = jeu(b, 'barde', 1, 0, l=760, h=640, dsf=2.2, ralenti=True); sans_bulles(pg); ev(pg, 'lieu', {'id': 'boulangerie'}); pg.wait_for_timeout(400)
    lent(pg, .1); filmer2(pg, 'b-parler', 5.0, PLEIN, [(.4, clic('#voile [data-act=parler][data-id=gaspard]')), (1.5, clic('#voile [data-act=question][data-p=gaspard][data-i="0"]'))]); pg.context.close()
def b_ment(b):
    """un menteur démasqué (enquête 2 : Farinel et sa sieste — un petit mensonge qui ne dit rien de l'enquête)"""
    pg = jeu(b, 'barde', 2, 0, l=760, h=640, dsf=2.2, ralenti=True); sans_bulles(pg); ev(pg, 'lieu', {'id': 'moulin'}); pg.wait_for_timeout(300); ev(pg, 'parler', {'id': 'farinel'}); pg.wait_for_timeout(700)
    lent(pg, .1); filmer2(pg, 'b-ment', 7.5, PLEIN, [(.4, clic('#voile [data-act=question][data-p=farinel][data-i="1"]')), (2.6, clic('#voile [data-act=bd-ment]'))]); pg.context.close()
def b_liege(b):
    """le tableau de liège, image par image : les photos s'épinglent une à une, puis les fils rouges (ce que le Barde y met ne dit rien : c'est son bloc-notes)"""
    pg = jeu(b, 'barde', 1, 0, l=1000, h=542, dsf=2.2); sans_bulles(pg)
    C = [('pnj:gaspard', 150, 190, 1), ('lieu:boulangerie', 90, 500, 0), ('pnj:victor', 520, 160, 2), ('pnj:tim', 900, 200, 0), ('lieu:toits', 1230, 180, 0), ('pnj:melusine', 500, 480, 0), ('pnj:basile', 870, 510, 0), ('lieu:mairie', 1240, 480, 0)]
    FILS = [['pnj:gaspard', 'lieu:boulangerie'], ['pnj:tim', 'lieu:toits'], ['pnj:basile', 'lieu:mairie']]
    import shutil; shutil.rmtree(os.path.join(PLANS, 'b-liege-anim'), ignore_errors=True); n = 0
    def poser(k, nf):
        pg.evaluate("([C, F]) => { var P = M.P(); P.liege = {cartes:{}, fils:F, z:C.length + 1}; C.forEach(function(c, i){ P.liege.cartes[c[0]] = {x:c[1], y:c[2], s:c[3], z:i + 1}; }); M.sauver(); M.UI.modal = null; P.onglet = 'role'; M.render(); }", [[list(c) for c in C[:k]], FILS[:nf]])
        pg.wait_for_timeout(450)
    poser(0, 0); z = zone_jeu(pg); clip = cadre(z)
    for k in range(0, len(C) + 1): poser(k, 0); photo(pg, 'b-liege-anim', n, clip); n += 1
    for f in range(1, len(FILS) + 1): poser(len(C), f); photo(pg, 'b-liege-anim', n, clip); n += 1
    photo(pg, 'b-liege', 0, clip); vue(pg, 'x-liege'); print('b-liege :', n, 'images'); pg.context.close()
def b_marche(b):
    """le marché aux fleurs (enquête 3, le matin) : Fortuné fait son boniment, on marchande"""
    pg = jeu(b, 'barde', 3, 0, l=760, h=640, dsf=2.2, ralenti=True); onglet(pg, 'carte'); pg.wait_for_timeout(4500)
    d = pg.locator('#voile [data-act=ma-debut]')
    if d.count(): d.first.click(force=True); pg.wait_for_timeout(900)
    sans_bulles(pg); ev(pg, 'lieu', {'id': 'place'}); pg.wait_for_timeout(400)
    lent(pg, .1); filmer2(pg, 'b-marche', 5.5, PLEIN, [(.4, clic('#voile [data-act=parler][data-id=fortune]')), (2.6, lambda pg_: pg_.locator('#voile [data-act=ma-fortune]', has_text='un prix').first.click(force=True, timeout=3000))]); pg.context.close()
def b_fete(b):
    """la nuit (enquête 3) : la carte aux lanternes, puis la fête sur la place — tout le village a un mot à glisser à l'oreille du Barde"""
    pg = jeu(b, 'barde', 3, 2, l=1000, h=542, dsf=2.0); onglet(pg, 'carte'); pg.wait_for_timeout(1500); sans_bulles(pg); pg.wait_for_timeout(300)
    photo(pg, 'b-nuit', 0, cadre(zone_jeu(pg))); pg.context.close()
    pg = jeu(b, 'barde', 3, 2, l=760, h=640, dsf=2.2, ralenti=True); sans_bulles(pg); onglet(pg, 'carte'); pg.wait_for_timeout(600)
    lent(pg, .1); filmer2(pg, 'b-fete', 4.6, PLEIN, [(.3, lambda pg_: ev(pg_, 'lieu', {'id': 'place'})), (2.2, clic('#voile [data-act=gd-fete][data-id=gaspard]'))]); pg.context.close()
# ------------------------------------------------------------------ LE SAGE
def livre_aller(pg, pid): pg.evaluate("(p) => { M.P().onglet = 'role'; M.UI.modal = null; M.render(); M.livreAller(p, true); }", pid)
def s_livre(b):
    """le Grand Livre (enquête 1) : on tourne les pages — le tableau d'enquête, la lettre du maire, les habitants"""
    pg = jeu(b, 'sage', 1, 0, l=1000, h=542, dsf=2.0, ralenti=True); sans_bulles(pg); onglet(pg, 'role'); pg.wait_for_timeout(900); z = {'x': 0, 'y': 62, 'width': 1000, 'height': 414}
    photo(pg, 's-grandlivre', 0, cadre(z))
    def tourner(pid): return lambda pg_: pg_.evaluate("(p) => M.livreAller(p)", pid)
    lent(pg, .2); filmer2(pg, 's-livre', 4.2, cadre(z), [(.8, tourner('lettre')), (2.0, tourner('habitants')), (3.2, tourner('bibliotheque'))]); pg.context.close()
def s_moment(b):
    """c'est le Sage qui fait avancer la journée : « Passer à l'après-midi », et le code à dire à toute l'équipe (enquête 1)"""
    pg = jeu(b, 'sage', 1, 0, l=760, h=640, dsf=2.2, ralenti=True); sans_bulles(pg); livre_aller(pg, 'codes'); pg.wait_for_timeout(700)
    lent(pg, .12); filmer2(pg, 's-moment', 5.0, PLEIN, [(.5, clic('.lv-page.on [data-act=moment-suivant]')), (2.2, clic('#voile [data-act=passer-moment]'))]); pg.context.close()
def s_accuse(b):
    """l'accusation (enquête 1) : la page, le bouton, les six visages — le film ne désigne personne"""
    pg = jeu(b, 'sage', 1, 1, l=760, h=640, dsf=2.2, ralenti=True); sans_bulles(pg); livre_aller(pg, 'accusation'); pg.wait_for_timeout(700)
    lent(pg, .12); filmer2(pg, 's-accuse', 3.6, PLEIN, [(.8, clic('.lv-page.on [data-act=accuser]'))]); pg.context.close()
def s_alphabet(b):
    """l'alphabet secret : le robot connaît le message (le crochet __mjsAlpha) et tape les lettres une à une"""
    q = salle(b, '#jeu=alphabet&n=2', dsf=2, attente=1500); q.wait_for_function('() => !!window.__mjsAlpha', timeout=8000); z = boite(q, '.mj-zone') or q.evaluate(ZONE); print('s-alphabet', z)
    a = q.evaluate("() => ({message:__mjsAlpha.message, cases:__mjsAlpha.cases})"); cases = [c for c in a['cases'] if not c['donne']]; print('  message', a['message'], len(cases), 'cases')
    etat = {'k': 0, 't': .3}
    def taper(pg, t):
        if etat['k'] >= len(cases) or t < etat['t']: return
        c = cases[etat['k']]; pg.click('.mjs-case[data-i="%d"]' % c['i'], force=True); pg.click('.mjs-t[data-l="%s"]' % c['l'], force=True); etat['k'] += 1; etat['t'] = t + .22
        if etat['k'] == len(cases): etat['fin'] = t
    def valider(pg, t):
        taper(pg, t)
        if etat.get('fin') is not None and not etat.get('ok') and t > etat['fin'] + .5: etat['ok'] = 1; pg.click('.mjs-valider', force=True)
    duree = min(9.0, .3 + len(cases) * .24 + 3.0)
    lent(q, .15); filmer2(q, 's-alphabet', duree, z, chaque=valider); q.context.close()
def s_runes(b):
    """assembler les runes : le robot tourne les tuiles puis les échange (le crochet __mjsRunes dit où va chacune)"""
    q = salle(b, '#jeu=runes&n=2', dsf=2, attente=1500); q.wait_for_function('() => !!window.__mjsRunes', timeout=8000); z = boite(q, '.mj-zone') or q.evaluate(ZONE); print('s-runes', z)
    def E(): return q.evaluate('() => window.__mjsRunes ? __mjsRunes.etat() : null')
    def centre(pos, k): bb = q.locator('.mjs-plateau').bounding_box(); c = bb['width'] / k; return bb['x'] + (pos % k + .5) * c, bb['y'] + (pos // k + .5) * c
    etat = {'t': .4}
    def jouer(pg, t):
        if t < etat['t']: return
        e = E()
        if not e: return
        k = e['k']; tourne = [x for x in e['tuiles'] if x['rot'] % 4 and not x.get('fixe')]
        if tourne: x, y = centre(tourne[0]['pos'], k); pg.mouse.click(x, y); etat['t'] = t + .28; return
        mal = [x for x in e['tuiles'] if x['pos'] != x['home']]
        if mal:
            x0, y0 = centre(mal[0]['pos'], k); x1, y1 = centre(mal[0]['home'], k); pg.mouse.move(x0, y0); pg.mouse.down()
            for i in range(1, 7): pg.mouse.move(x0 + (x1 - x0) * i / 6, y0 + (y1 - y0) * i / 6)
            pg.mouse.up(); etat['t'] = t + .45
    lent(q, .15); filmer2(q, 's-runes', 7.5, cadre(z), chaque=jouer); q.context.close()
def s_plans(b):
    """superposer les plans : le calque rouge glisse et tourne sur le vieux plan"""
    q = salle(b, '#jeu=plans&n=2', dsf=2, attente=2000); z = boite(q, '.mj-zone') or q.evaluate(ZONE); print('s-plans', z)
    bts = q.evaluate("() => [].map.call(document.querySelectorAll('.mj-zone button'), function(b){ var r = b.getBoundingClientRect(); return {t:b.textContent.trim().slice(0, 4), c:b.className, x:r.x + r.width / 2, y:r.y + r.height / 2}; })"); print('  boutons', [(x['t'], x['c'][:18]) for x in bts][:14])
    c = boite(q, '.mj-zone svg, .mj-zone canvas') or z; cx, cy = c['x'] + c['width'] * .45, c['y'] + c['height'] * .5
    import math
    q.mouse.move(cx, cy); q.mouse.down()
    def glisse(pg, t): pg.mouse.move(cx + 70 * math.sin(t * 1.6), cy + 40 * math.sin(t * 2.3))
    lent(q, .15); filmer2(q, 's-plans', 4.0, cadre(z), chaque=glisse); q.context.close()
def s_code(b):
    """un code reçu d'un ami (enquête 2 : les plans du moulin, que le Barde a obtenus) : ils arrivent dans le Grand Livre"""
    a_code(b, 's-code', 'sage', 'info:plans_moulin', n=2)
PLANS_ = {
    's-livre': s_livre, 's-moment': s_moment, 's-accuse': s_accuse, 's-alphabet': s_alphabet, 's-runes': s_runes, 's-plans': s_plans, 's-code': s_code,
    'b-carte': b_carte, 'b-parler': b_parler, 'b-ment': b_ment, 'b-liege': b_liege, 'b-marche': b_marche, 'b-fete': b_fete, 'b-code': lambda b: a_code(b, 'b-code', 'barde', 'obj:affiche'),
    'a-code': a_code, 'a-cueillette': a_cueillette, 'a-loupe': a_loupe, 'a-micro': a_micro, 'a-etabli': a_etabli, 'a-chaudron': a_chaudron, 'a-mimi': a_mimi,
    'p-visee': p_visee, 'p-pistage': p_pistage, 'p-cachette': p_cachette, 'p-oie': p_oie, 'p-interieur': p_interieur, 'p-cabane': p_cabane, 'p-code': p_code,
    'dj-entree': entree,
    'dj-crit': lambda b: combat(b, 'dj-crit', 'rats', 'Pisteur', 'Dague', 'bete:b1', avant=[('Sage', 'Rune de lumière', 'bete:b1')]),
    'dj-arc': lambda b: combat(b, 'dj-arc', 'canaux', 'Pisteur', 'Arc normal', 'bete:b2', avant=[('Alchimiste', 'Louche', 'bete:b2')]),
    'dj-feu': lambda b: combat(b, 'dj-feu', 'rats', 'Alchimiste', 'Feu', 'bete:b2', duree=5.5),
    'dj-huile': lambda b: combat(b, 'dj-huile', 'rats', 'Alchimiste', 'Huile', 'bete:b1'),
    'dj-bong': lambda b: combat(b, 'dj-bong', 'canaux', 'Alchimiste', 'Louche', 'bete:b2'),
    'dj-givre': lambda b: combat(b, 'dj-givre', 'toiles', 'Alchimiste', 'Givre', 'bete:b1'),
    'dj-lumiere': lambda b: combat(b, 'dj-lumiere', 'rats', 'Sage', 'Rune de lumière', 'bete:b1'),
    'dj-bouclier': lambda b: combat(b, 'dj-bouclier', 'rats', 'Sage', 'Bouclier de runes', 'heros:pisteur'),
    'dj-oeil': lambda b: combat(b, 'dj-oeil', 'rats', 'Sage', 'Rune de l', None),
}
if __name__ == '__main__':
    quoi = [a for a in sys.argv[1:] if not a.startswith('--')] or list(PLANS_)
    with sync_playwright() as p:
        b = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
        for n in quoi:
            try: PLANS_[n](b)
            except Exception as e: print('RATÉ', n, ':', str(e)[:400])
        b.close()
    if '--planches' in sys.argv:
        for n in quoi:
            try: planche(n, pas=9)
            except Exception as e: print('pas de planche', n, e)
