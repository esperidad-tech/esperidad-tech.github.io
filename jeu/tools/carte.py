"""La carte plein écran (onglet Carte) : glisser au doigt, ronds touchables, carte du Pisteur qui se dévoile en E1.
Usage : python3 tools/carte.py   (BRUMEVAL_DIST=/chemin pour tester une autre construction)
Captures dans test/carte-plein/. Termine par « ERREURS : [] » si tout va bien."""
import sys, os, json
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist')), 'index.html')
OUT = os.path.join(ICI, '..', 'test', 'carte-plein')
os.makedirs(OUT, exist_ok=True)
erreurs = []
TEL = [(390, 844), (360, 740)]
TAILLES = [(390, 844), (360, 740), (844, 390), (800, 1280), (1280, 800)]
SURFACE = ['place', 'mairie', 'clocher', 'taverne', 'boulangerie', 'poste', 'atelier', 'herboristerie', 'ruelle', 'lavoir', 'potager',
           'foret', 'chene', 'clairiere', 'puits', 'moulin', 'pont', 'lisiere']

def verif(ok, msg):
    print(('  ok  ' if ok else '  ÉCHEC ') + msg)
    if not ok: erreurs.append(msg)

def tactile(W, H):
    return min(W, H) < 600

def creer(b, role, W, H, n=1, touch=None):
    touch = tactile(W, H) if touch is None else touch
    ctx = b.new_context(viewport={'width': W, 'height': H}, has_touch=touch, is_mobile=touch)
    pg = ctx.new_page()
    pg.set_default_timeout(15000)
    tag = f'{role}{n}-{W}x{H}'
    pg.on('console', lambda m: erreurs.append(f'[{tag}] {m.text}') if m.type == 'error' and 'ERR_' not in m.text and 'fonts' not in m.text else None)
    pg.on('pageerror', lambda e: erreurs.append(f'[{tag}] PAGEERROR {e}'))
    pg.goto(URL)
    pg.click('[data-act=creer]'); pg.click(f'[data-act=crea-role][data-r={role}]'); pg.click('[data-act=crea-hasard]'); pg.click('[data-act=crea-suite]'); pg.fill('#nom', role.capitalize()); pg.click('[data-act=crea-fin]')
    if n > 1:
        # (l'accueil d'un héros débutant n'a plus de bouton Réglages, Romain 4 novembre : on ouvre les Réglages directement pour le Mode test)
        pg.evaluate("() => { M.UI.ecran = 'reglages'; M.render(); }"); pg.click(f'[data-act=mode-test][data-i="{n}"]'); pg.click('#voile [data-act=confirmer-oui]')
    pg.click('[data-act=nouvelle-enquete]'); pg.click('[data-act=commencer]')
    if n == 2: pg.evaluate("() => { if(M.tutoTalentForce && M.tutoTalentForce()){ M.A.talent({dataset:{id:DONNEES.TALENTS_PAR_ROLE[M.role()][2][0]}}); M.UI.modal = null; M.render(); } }")   # le talent forcé du début de l'enquête 2 (tools/tuto.py)
    pg.evaluate("""() => {
      MJ.lancer = function(el, type, params, fin){ setTimeout(function(){ fin({reussi:true, score:1, essais:1}); }, 30); return {arreter:function(){}}; };
      window.__sons = []; var s0 = M.son; M.son = function(t){ window.__sons.push(t); return s0.apply(this, arguments); };
    }""")
    pg._touch = touch
    return pg

def onglet_carte(pg):
    pg.click('[data-act=onglet][data-o=carte]'); pg.wait_for_timeout(250)

def fermer(pg):
    pg.wait_for_timeout(120)
    if pg.is_visible('#voile .b-fermer'): pg.click('#voile .b-fermer')
    pg.wait_for_timeout(150)

def visibles(pg):
    return pg.evaluate("() => Array.from(document.querySelectorAll('#carte-ici g.ca-lieu[data-lieu]')).map(function(g){ return g.dataset.lieu; })")

def mesure(pg):
    return pg.evaluate("""() => { var ici = document.getElementById('carte-ici'), v = ici.querySelector('.ca-vue'), m = ici.querySelector('.ca-monde');
      var h = document.querySelector('.b-entete').getBoundingClientRect(), n = document.querySelector('.b-onglets').getBoundingClientRect(), r = ici.getBoundingClientRect();
      var svg = m.querySelector('svg');
      return {sl:v.scrollLeft, st:v.scrollTop, vw:v.clientWidth, vh:v.clientHeight, mw:m.offsetWidth, mh:m.offsetHeight,
        haut:r.top, bas:r.bottom, gauche:r.left, larg:r.width, entete:h.bottom, nav:n.top, rayon:getComputedStyle(svg).borderTopLeftRadius,
        calque:!!svg.querySelector('.ca-calque'), page:document.documentElement.scrollHeight, ih:innerHeight}; }""")

def toucher(pg, x, y):
    if pg._touch: pg.touchscreen.tap(x, y)
    else: pg.mouse.click(x, y)

def viser(pg, sel):
    """Fait glisser la carte pour mettre l'élément au milieu, puis renvoie le centre du morceau qui se touche le mieux"""
    return pg.evaluate("""(sel) => { var el = document.querySelector(sel); if(!el) return null;
      el.scrollIntoView({block:'center', inline:'center'});
      var r = el.getBoundingClientRect(); return {x:r.left + r.width / 2, y:r.top + r.height / 2, w:r.width, h:r.height}; }""", sel)

def qui_est_la(pg, x, y):
    return pg.evaluate("([x, y]) => { var e = document.elementFromPoint(x, y); e = e && e.closest('[data-act]'); return e ? [e.dataset.act, e.dataset.id] : null; }", [x, y])

def toucher_lieu(pg, id, quoi='etiquette'):
    """Touche pour de vrai (doigt ou souris) l'étiquette d'un lieu, ou un de ses marqueurs. Renvoie le modal ouvert."""
    sel = f'#carte-ici g.ca-lieu[data-lieu="{id}"] .ca-etiq-lieu' if quoi == 'etiquette' else f'#carte-ici g.ca-marqueur.ca-pose[data-lieu="{id}"] .ca-flotte > circle'
    p = viser(pg, sel)
    if not p: return None, None
    pg.wait_for_timeout(80)
    p = pg.evaluate("(sel) => { var r = document.querySelector(sel).getBoundingClientRect(); return {x:r.left + r.width / 2, y:r.top + r.height / 2}; }", sel)
    dessus = qui_est_la(pg, p['x'], p['y'])
    toucher(pg, p['x'], p['y'])
    pg.wait_for_timeout(250)
    m = pg.evaluate("() => M.UI.modal && {type:M.UI.modal.type, id:M.UI.modal.id}")
    return dessus, m

def glisser_doigt(pg, x0, y0, x1, y1, n=14):
    cdp = pg.context.new_cdp_session(pg)
    cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x0, 'y': y0}]})
    for i in range(1, n + 1):
        cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': x0 + (x1 - x0) * i / n, 'y': y0 + (y1 - y0) * i / n}]})
        pg.wait_for_timeout(16)
    cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
    pg.wait_for_timeout(500)

def pincer(pg, cx, cy, d0, d1, n=12):
    """Deux doigts (vrais événements tactiles CDP) : écartés de d0 à d1 px, autour de (cx, cy)"""
    cdp = pg.context.new_cdp_session(pg)
    pts = lambda d: [{'x': cx - d / 2, 'y': cy, 'id': 1}, {'x': cx + d / 2, 'y': cy, 'id': 2}]
    cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': pts(d0)})
    for i in range(1, n + 1):
        cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': pts(d0 + (d1 - d0) * i / n)})
        pg.wait_for_timeout(16)
    cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
    pg.wait_for_timeout(450)

def zoom(pg, sel='#carte-ici'):
    return pg.evaluate(f"""() => {{ var c = document.querySelector('{sel}'), m = c.querySelector('.ca-monde'), v = c.querySelector('.ca-vue');
      return {{k: m.offsetWidth / 1000, mw: m.offsetWidth, mh: m.offsetHeight, vw: v.clientWidth, vh: v.clientHeight, sl: v.scrollLeft, st: v.scrollTop, ox: m.offsetLeft, oy: m.offsetTop}}; }}""")

def sous(z, px, py):
    """le point de la carte (unités) sous le point (px, py) de la vue"""
    return ((z['sl'] + px - z['ox']) / z['k'], (z['st'] + py - z['oy']) / z['k'])

def explorer(pg, id, points):
    pg.evaluate("() => { M.P().actions = 9; M.sauver(); }")
    dessus, m = toucher_lieu(pg, id)
    verif(m and m['type'] == 'lieu' and m['id'] == id, f'E1 Pisteur : toucher le rond « {id} » sur la carte ouvre ce lieu ({dessus}, {m})')
    pg.click(f'#voile [data-act=explorer][data-id={id}]')
    for p in points:
        pg.click(f'#voile [data-act=point][data-id={p}]')
        pg.wait_for_timeout(200)
        if pg.is_visible('#voile .b-decouverte .btn.grand'):
            pg.click('#voile .b-decouverte .btn.grand'); pg.wait_for_timeout(150)
    fermer(pg)
    pg.wait_for_timeout(1300)   # le temps que les nouveaux lieux surgissent

def cabane_carte(pg):
    """Ouvre la cabane du Pisteur et la fait glisser jusqu'à la carte des sous-sols du chevalet"""
    pg.click('[data-act=onglet][data-o=role]'); pg.wait_for_timeout(500)
    for i in range(5):
        if pg.is_visible('.cb-fleche.d'): pg.click('.cb-fleche.d'); pg.wait_for_timeout(600)
    pg.wait_for_timeout(1300)   # le temps que ce qui est nouveau sous terre surgisse

def ss_cabane(pg, etoile=False):
    return pg.evaluate("(e) => Array.from(document.querySelectorAll('#cabane-carte [data-ss]')).map(function(g){ return g.dataset.ss + (e && g.classList.contains('ca-apparait') ? '*' : ''); }).sort()", etoile)

def toucher_murale(pg, sel, pos, cadre='#cabane-carte'):
    """Amène un point de la carte murale au milieu de son cadre, puis le touche pour de vrai"""
    pg.evaluate(f"([x, y]) => {{ var h = M.UI.carteMurale; if(h) h.allerVers({{x:x, y:y}}, false); }}", pos); pg.wait_for_timeout(250)
    p = pg.evaluate(f"(s) => {{ var e = document.querySelector('{cadre} ' + s); if(!e) return null; var r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }}", sel)
    if not p: return None
    toucher(pg, p[0], p[1]); pg.wait_for_timeout(300)
    return pg.evaluate("() => M.UI.modal && {type:M.UI.modal.type, id:M.UI.modal.id, t:M.UI.modal.t || ''}")

def bouton_zoom(pg, sens, sel='#carte-ici'):
    b_ = f'{sel} .ca-zoom-{"plus" if sens > 0 else "moins"}'
    if not pg.is_visible(b_) or not pg.is_enabled(b_): return False
    pg.click(b_); pg.wait_for_timeout(380)
    return True

def entrer_code(pg, code):
    seq = pg.evaluate(f"() => M.code('{code}')")
    pg.click('[data-act=onglet][data-o=code]')
    for s in seq: pg.click(f'[data-act=sym][data-s={s}]')
    pg.wait_for_timeout(450)
    t = pg.evaluate("() => M.UI.modal && M.UI.modal.t || ''")
    fermer(pg)
    return t

with sync_playwright() as p:
    b = p.chromium.launch()

    # ---------- 1. Plein écran, rien d'autre, et on la fait glisser (téléphones) ----------
    print('1. Plein écran et glisser au doigt')
    for W, H in TEL:
        pg = creer(b, 'sage', W, H, 2)
        onglet_carte(pg); pg.wait_for_timeout(500)
        m = mesure(pg)
        verif(abs(m['haut'] - m['entete']) <= 2 and abs(m['bas'] - m['nav']) <= 2 and m['gauche'] == 0 and abs(m['larg'] - W) <= 1, f'{W}×{H} : la carte remplit tout entre le bandeau et les onglets ({m["haut"]:.0f}-{m["bas"]:.0f} / {m["entete"]:.0f}-{m["nav"]:.0f})')
        verif(m['rayon'] in ('0px', '0') and not m['calque'], f'{W}×{H} : pas de cadre (coins {m["rayon"]}, calque {m["calque"]})')
        verif(m['mw'] >= 1.8 * m['vw'] and m['mh'] >= 1.4 * m['vh'], f'{W}×{H} : la carte est bien plus grande que l\'écran ({m["mw"]}×{m["mh"]} pour {m["vw"]}×{m["vh"]})')
        verif(m['page'] <= m['ih'] + 1, f'{W}×{H} : la page elle-même ne défile pas ({m["page"]} / {m["ih"]})')
        reste = pg.evaluate("() => [document.querySelectorAll('.b-lieu-chip, .b-lieux-liste').length, document.querySelectorAll('.b-aide-carte').length, /Touche un lieu/.test(document.querySelector('.b-contenu').textContent)]")
        verif(reste == [0, 0, False], f'{W}×{H} : plus de liste de lieux ni de « Touche un lieu… » ({reste})')
        pg.screenshot(path=f'{OUT}/01-sage-{W}x{H}-carte.png')
        a = mesure(pg)
        cx, cy = W / 2, (a['haut'] + a['bas']) / 2
        glisser_doigt(pg, cx + 100, cy + 120, cx - 80, cy - 100)
        b2 = mesure(pg)
        verif(b2['sl'] - a['sl'] > 120 and b2['st'] - a['st'] > 140, f'{W}×{H} : glisser le doigt déplace la carte (de {a["sl"]},{a["st"]} à {b2["sl"]},{b2["st"]})')
        verif(not pg.evaluate("() => !!M.UI.modal"), f'{W}×{H} : glisser n\'ouvre aucun lieu')
        glisser_doigt(pg, cx - 120, cy - 150, cx + 120, cy + 150)
        c = mesure(pg)
        verif(c['sl'] < b2['sl'] and c['st'] < b2['st'], f'{W}×{H} : et dans l\'autre sens ({c["sl"]},{c["st"]})')
        pg.screenshot(path=f'{OUT}/02-sage-{W}x{H}-glisse.png')
        # la carte garde l'endroit où on regardait, après avoir ouvert puis fermé un lieu
        avant = mesure(pg)
        pg.evaluate("() => M.A.lieu({dataset:{id:'mairie'}})"); fermer(pg)
        apres = mesure(pg)
        verif(abs(apres['sl'] - avant['sl']) <= 3 and abs(apres['st'] - avant['st']) <= 3, f'{W}×{H} : après une fenêtre, la carte reste où elle était ({avant["sl"]},{avant["st"]} → {apres["sl"]},{apres["st"]})')
        pg.context.close()
    # À la souris (ordinateur) : on attrape la carte et on la tire, sans ouvrir le lieu sous la souris
    pg = creer(b, 'sage', 390, 844, 2, touch=False)
    onglet_carte(pg); pg.wait_for_timeout(400)
    pg.evaluate("() => { var v = document.querySelector('.ca-vue'); v.scrollLeft = 100; v.scrollTop = 100; }"); pg.wait_for_timeout(100)
    q = pg.evaluate("() => { var r = document.querySelector('#carte-ici g.ca-lieu[data-lieu=mairie] .ca-etiq-lieu').getBoundingClientRect(); return {x:r.left + r.width / 2, y:r.top + r.height / 2}; }")
    a = mesure(pg)
    pg.mouse.move(q['x'], q['y']); pg.mouse.down(); pg.mouse.move(q['x'] - 60, q['y'] - 60, steps=6); pg.mouse.move(q['x'] - 120, q['y'] - 140, steps=6); pg.mouse.up()
    pg.wait_for_timeout(200)
    m = mesure(pg)
    verif(m['sl'] - a['sl'] > 90 and m['st'] - a['st'] > 100 and not pg.evaluate("() => !!M.UI.modal"), f'souris : tirer la carte la déplace sans ouvrir de lieu ({a["sl"]},{a["st"]} → {m["sl"]},{m["st"]})')
    pg.context.close()

    # ---------- 2. Ronds et étiquettes faciles à toucher, partout ----------
    print('2. Ronds touchables')
    for W, H in TAILLES:
        for role, n in (('pisteur', 2), ('barde', 2)):
            pg = creer(b, role, W, H, n)
            onglet_carte(pg); pg.wait_for_timeout(500)
            if not tactile(W, H):
                m = mesure(pg)
                verif(abs(m['mw'] - m['vw']) <= 1 and (W < H or m['mh'] > m['vh'] * 1.5), f'{role} {W}×{H} : tablette, la carte en grand sur toute la largeur ({m["mw"]}×{m["mh"]} dans {m["vw"]}×{m["vh"]})')
            pg.screenshot(path=f'{OUT}/10-{role}{n}-{W}x{H}.png')
            ids = pg.evaluate("() => Array.from(document.querySelectorAll('#carte-ici g.ca-lieu.ca-clic')).map(function(g){ return g.dataset.lieu; })")
            petits, rates = [], []
            for id in ids:
                taille = pg.evaluate(f"""() => {{ var g = document.querySelector('#carte-ici g.ca-zone[data-zone="{id}"]'), best = [0, 0];
                  g.querySelectorAll('.ca-hit').forEach(function(h){{ var r = h.getBoundingClientRect(); if(Math.min(r.width, r.height) > Math.min(best[0], best[1])) best = [r.width, r.height]; }});
                  var e = g.querySelector('.ca-hit-etiq'), re = e ? e.getBoundingClientRect() : null;
                  return [Math.round(best[0]), Math.round(best[1]), re ? Math.round(re.width) : 0, re ? Math.round(re.height) : 0]; }}""")
                if min(taille[0], taille[1]) < 48 or (tactile(W, H) and min(taille[2], taille[3]) < 48): petits.append((id, taille))
                dessus, mo = toucher_lieu(pg, id)
                if not (dessus and dessus[1] == id and mo and mo['type'] == 'lieu' and mo['id'] == id): rates.append((id, dessus, mo))
                fermer(pg)
            verif(not petits, f'{role} {W}×{H} : les {len(ids)} lieux ont une zone à toucher d\'au moins 48 px {petits}')
            verif(not rates, f'{role} {W}×{H} : toucher chaque étiquette ouvre le bon lieu (rien ne la cache) {rates}')
            mq = pg.evaluate("() => Array.from(document.querySelectorAll('#carte-ici g.ca-marqueur.ca-pose[data-act=lieu]')).map(function(g){ return g.dataset.lieu; })")
            mpetits, mrates = [], []
            for id in dict.fromkeys(mq):
                t = pg.evaluate(f"() => {{ var r = document.querySelector('#carte-ici g.ca-zone-mq[data-zone-mq=\"{id}\"] circle.ca-hit').getBoundingClientRect(); return Math.round(Math.min(r.width, r.height)); }}")
                if tactile(W, H) and t < 48: mpetits.append((id, t))
                dessus, mo = toucher_lieu(pg, id, 'marqueur')
                if not (mo and mo['type'] == 'lieu' and mo['id'] == id): mrates.append((id, dessus, mo))
                fermer(pg)
            if role == 'barde': verif(len(mq) >= 4, f'barde {W}×{H} : les visages des habitants sont sur la carte ({len(mq)})')
            verif(not mpetits and not mrates, f'{role} {W}×{H} : les marqueurs (visages, ✨) se touchent et ouvrent le bon lieu {mpetits} {mrates}')
            # aucune étiquette de lieu n'est cachée par un marqueur
            cache = pg.evaluate("""() => { var l = [], et = Array.from(document.querySelectorAll('#carte-ici .ca-etiq-lieu rect')).map(function(r){ return [r.closest('g.ca-lieu').dataset.lieu, r.getBBox()]; });
              document.querySelectorAll('#carte-ici g.ca-marqueur.ca-pose').forEach(function(m){ var b = m.getBBox(), t = m.transform.baseVal.consolidate().matrix;
                var x0 = t.e + b.x * t.a, y0 = t.f + b.y * t.d, x1 = x0 + b.width * t.a, y1 = y0 + b.height * t.d;
                et.forEach(function(e){ var r = e[1]; if(x0 < r.x + r.width - 2 && x1 > r.x + 2 && y0 < r.y + r.height - 2 && y1 > r.y + 2) l.push(m.dataset.lieu + ' sur ' + e[0]); }); });
              return l; }""")
            verif(not cache, f'{role} {W}×{H} : aucun marqueur ne cache une étiquette {cache}')
            pg.context.close()

    # Tablette (tactile) qu'on tourne : couchée, la carte prend toute la largeur et on la fait glisser de haut en bas au doigt
    pg = creer(b, 'barde', 800, 1280, 2, touch=True)
    onglet_carte(pg)
    m0 = mesure(pg)
    verif(abs(m0['mw'] - m0['vw']) <= 1 and m0['mh'] <= m0['vh'] + 1, f'tablette debout : toute la largeur, toute la carte visible ({m0["mw"]}×{m0["mh"]} dans {m0["vw"]}×{m0["vh"]})')
    pg.set_viewport_size({'width': 1280, 'height': 800}); pg.wait_for_timeout(600)
    m = mesure(pg)
    verif(abs(m['mw'] - m['vw']) <= 1 and m['mh'] > m['vh'] * 1.5 and abs(m['bas'] - m['nav']) <= 2, f'tablette couchée : la carte en grand sur toute la largeur ({m["mw"]}×{m["mh"]} dans {m["vw"]}×{m["vh"]})')
    cy = (m['haut'] + m['bas']) / 2
    glisser_doigt(pg, 640, cy + 180, 640, cy - 180)
    m2 = mesure(pg)
    verif(m2['st'] - m['st'] > 200 and not pg.evaluate("() => !!M.UI.modal"), f'tablette couchée : on la fait glisser au doigt de haut en bas ({m["st"]} → {m2["st"]})')
    pg.screenshot(path=f'{OUT}/11-barde1-tournee-1280x800.png')
    pg.context.close()

    # ---------- 3. Enquête 1, Pisteur : la carte se dévoile pas à pas ----------
    print('3. E1 Pisteur : la carte se dévoile')
    pg = creer(b, 'pisteur', 390, 844)
    verif('ca-badge' in pg.inner_html('.b-onglets [data-o=carte]'), 'E1 Pisteur : une pastille ✨ sur l\'onglet Carte au début')
    verif(not pg.evaluate("() => (M.P().carteVue || {}).mairie"), 'la carte murale de la cabane (premier onglet) ne gâche pas la surprise de l\'onglet Carte')
    onglet_carte(pg); pg.wait_for_timeout(300)
    v = visibles(pg)
    verif(v == ['mairie'], f'au début, seulement la mairie ({v})')
    verif(pg.evaluate("() => !!document.querySelector('#carte-ici g.ca-lieu[data-lieu=mairie].ca-apparait .ca-nouveau')"), 'la mairie surgit avec « Nouveau ! »')
    pg.wait_for_timeout(700)
    verif('magie' in pg.evaluate("() => window.__sons"), 'un petit son quand un lieu apparaît')
    pg.screenshot(path=f'{OUT}/20-pisteur-e1-debut.png')
    verif(not pg.evaluate("() => !!document.querySelector('#carte-ici .ca-marqueur')"), 'rien d\'autre sur la carte (pas de marqueur)')
    explorer(pg, 'mairie', ['massif', 'fenetre', 'gouttiere'])
    v = visibles(pg)
    verif(v == ['place', 'mairie'], f'mairie faite → la place apparaît ({v})')
    verif(pg.evaluate("() => !!document.querySelector('g.ca-lieu[data-lieu=place].ca-apparait') && !document.querySelector('g.ca-lieu[data-lieu=mairie].ca-apparait')"), 'seule la place surgit (la mairie est déjà connue)')
    pg.screenshot(path=f'{OUT}/21-pisteur-e1-place.png')
    explorer(pg, 'place', ['fontaine', 'affiche'])
    v = visibles(pg)
    verif(sorted(v) == ['mairie', 'place'], f'place faite, fin du matin : rien de nouveau, rien d\'ouvert ({v})')
    verif(pg.evaluate("() => document.querySelectorAll('#carte-ici g.ca-lieu.ca-clic').length") == 0, 'tutoriel : le matin fini, plus aucun lieu ne se touche')
    entrer_code(pg, 'moment:1'); onglet_carte(pg); pg.wait_for_timeout(1300)
    v = visibles(pg)
    verif(sorted(v) == ['boulangerie', 'mairie', 'place'], f'l\'après-midi → la boulangerie ({v})')
    verif(pg.evaluate("() => [].map.call(document.querySelectorAll('#carte-ici g.ca-lieu.ca-clic'), function(g){ return g.dataset.lieu; })") == ['boulangerie'], 'tutoriel : un seul lieu ouvert, la boulangerie (la mairie et la place restent, grisées)')
    # recharger la page : ce qui est dévoilé le reste
    pg.reload(); pg.wait_for_timeout(400)
    if pg.is_visible('[data-act=reprendre]'): pg.click('[data-act=reprendre]')
    pg.evaluate("""() => { MJ.lancer = function(el, type, params, fin){ setTimeout(function(){ fin({reussi:true, score:1, essais:1}); }, 30); return {arreter:function(){}}; };
      window.__sons = []; var s0 = M.son; M.son = function(t){ window.__sons.push(t); return s0.apply(this, arguments); }; }""")
    onglet_carte(pg)
    v = visibles(pg)
    verif(sorted(v) == ['boulangerie', 'mairie', 'place'], f'après rechargement, la carte est la même ({v})')
    verif(not pg.evaluate("() => !!document.querySelector('.ca-apparait')"), 'après rechargement, rien ne resurgit')
    explorer(pg, 'boulangerie', ['sol', 'four'])
    v = visibles(pg)
    ouv = lambda: pg.evaluate("() => [].map.call(document.querySelectorAll('#carte-ici g.ca-lieu.ca-clic'), function(g){ return g.dataset.lieu; })")
    bon = pg.evaluate("() => M.tutoEtat().bonus.map(function(b){ return b.lieu; })")
    verif(bon == ['clocher'], f'en attendant le plan (une action libre), le tutoriel propose la mission bonus du clocher ({bon})')
    verif(sorted(v) == ['boulangerie', 'clocher', 'foret', 'mairie', 'place'], f'boulangerie faite → l\'entrée de la forêt, et le clocher de la mission bonus ({v})')
    verif(sorted(ouv()) == ['clocher', 'foret'] and pg.evaluate("() => !!document.querySelector('#carte-ici g.ca-marqueur[data-lieu=clocher]') && !!document.querySelector('#carte-ici g.ca-lieu[data-lieu=foret].ca-verrouille')"),
          f'se touchent : le clocher, avec son ✨, et la forêt au cadenas (qui dit ce qu\'elle attend) ({ouv()})')
    verif(pg.evaluate("() => !!document.querySelector('g.ca-lieu[data-lieu=foret].ca-verrouille .ca-cadenas')"), 'la forêt est fermée à clé 🔒 tant qu\'il n\'a pas le plan')
    pg.screenshot(path=f'{OUT}/22-pisteur-e1-foret-fermee.png')
    dessus, m = toucher_lieu(pg, 'foret')
    verif(m and m['id'] == 'foret' and pg.is_visible('#voile .b-verrou'), 'toucher la forêt fermée explique ce qu\'il faut')
    fermer(pg)
    # le plan de la forêt (code du Sage)
    t = entrer_code(pg, 'info:carte')
    verif('carrefour' in t.lower() and 'chêne' not in t.lower() and 'moulin' not in t.lower(), f'le message ne nomme que ce que la carte montre : « {t} »')
    onglet_carte(pg)
    verif(not pg.evaluate("() => !!document.querySelector('g.ca-lieu[data-lieu=foret].ca-verrouille')"), 'avec le plan, la forêt s\'ouvre')
    v = visibles(pg)
    verif(sorted(v) == ['boulangerie', 'clocher', 'foret', 'mairie', 'place'], f'toujours pas les chemins, et le clocher reste (un lieu dévoilé ne se recache pas) ({v})')
    verif(ouv() == ['foret'], f'la forêt ouverte : c\'est la seule chose à toucher, le bonus attend ({ouv()})')
    explorer(pg, 'foret', ['carrefour', 'ch_moulin', 'ch_puits', 'ch_chene', 'buisson'])
    entrer_code(pg, 'moment:2'); onglet_carte(pg); pg.wait_for_timeout(1300)
    v = visibles(pg)
    verif(sorted(v) == ['boulangerie', 'chene', 'clocher', 'foret', 'mairie', 'place'], f'forêt faite, le soir → le bout du chemin du Vieux Chêne ({v})')
    verif(pg.evaluate("() => !!document.querySelector('g.ca-lieu[data-lieu=chene].ca-apparait') && !document.querySelector('g.ca-lieu[data-lieu=puits], g.ca-lieu[data-lieu=moulin]')"), 'le Vieux Chêne surgit seul (tutoriel : un seul lieu à la fois)')
    pg.screenshot(path=f'{OUT}/23-pisteur-e1-chemins.png')
    # pas de pastille ✨ quand on regarde déjà la carte
    verif('ca-badge' not in pg.inner_html('.b-onglets [data-o=carte]'), 'pas de pastille quand les lieux sont déjà vus')
    verif(not pg.query_selector('#carte-ici .ca-couches'), 'l\'onglet Carte n\'a pas de bouton Village / Sous-sols : le village seulement')
    explorer(pg, 'chene', ['racines'])
    pg.wait_for_timeout(400)
    verif(pg.is_visible('.tu-bandeau [data-act=tuto-fait]'), 'il reste « Raconte tout au Sage » : le bandeau a son bouton « ✔ C\'est fait »')
    pg.click('.tu-bandeau [data-act=tuto-fait]'); pg.wait_for_timeout(300); onglet_carte(pg); pg.wait_for_timeout(1300)
    verif(ouv() == ['clocher'] and len(visibles(pg)) < len(SURFACE), f'trame finie, des actions en trop le soir : d\'abord la mission bonus du clocher, seule à toucher ({ouv()})')
    dessus, m = toucher_lieu(pg, 'clocher')
    pg.click('#voile [data-act=bonus][data-id=ballon]'); pg.wait_for_timeout(500); fermer(pg)
    verif(pg.evaluate("() => M.P().bonus.ballon") == 'ok', f'la mission bonus est jouée ({pg.evaluate("() => M.P().bonus.ballon")})')
    onglet_carte(pg); pg.wait_for_timeout(1300)
    v = visibles(pg)
    verif(sorted(v) == sorted(SURFACE), f'toutes ses missions faites → toute la carte ({len(v)} lieux)')
    verif(pg.evaluate("() => M.P().carteVue['*'] === 1"), 'la carte entière est mémorisée')
    pg.screenshot(path=f'{OUT}/24-pisteur-e1-tout.png')
    # le courant d'air froid du Vieux Chêne : un « ? » sur la carte des sous-sols de sa CABANE (jamais dans l'onglet Carte)
    verif(not pg.query_selector('#carte-ici [data-ss]') and not pg.query_selector('#carte-ici .ca-couches'), 'l\'onglet Carte ne montre jamais les sous-sols')
    verif('cb-onglet-badge' in pg.inner_html('.b-onglets [data-o=role]') and 'ca-badge' not in pg.inner_html('.b-onglets [data-o=carte]'), 'le courant d\'air froid → une pastille ✨ sur l\'onglet Cabane, pas sur l\'onglet Carte')
    cabane_carte(pg)
    ss = ss_cabane(pg, True)
    verif(ss == ['q_chene*'], f'cabane : sur le chevalet, seulement le « ? » sous le Vieux Chêne, qui surgit ({ss})')
    verif('magie' in pg.evaluate("() => window.__sons"), 'cabane : un petit son quand le « ? » apparaît')
    pg.screenshot(path=f'{OUT}/26-pisteur-e1-sous-sols-cabane.png')
    mo = toucher_murale(pg, 'g.ca-lieu[data-ss=q_chene] circle:nth-child(2)', [286, 186])
    verif(mo and 'air froid' in mo['t'], f'toucher le « ? » relit ce qu\'il a senti ({mo})')
    fermer(pg)
    verif(pg.evaluate("() => M.S.sousSols.vus.q_chene === 1 && !M.P().sousSols && M.nouveauxSousSols() === 0"), 'la découverte est gardée pour toute la saison (dans le héros, pas dans l\'enquête), et comptée comme vue')
    onglet_carte(pg)
    verif(len(visibles(pg)) == len(SURFACE), 'l\'onglet Carte montre toujours tout le village')
    # décocher une mission ne recache rien
    pg.evaluate("() => { var i = M.etapesMission().length - 2; M.P().mission.coches = {}; M.sauver(); M.render(); }")
    verif(sorted(visibles(pg)) == sorted(SURFACE), 'un lieu dévoilé ne se recache jamais')
    pg.context.close()

    # Une vieille sauvegarde (sans P.carteVue ni missions) se charge, et la carte se dévoile depuis là où il en est
    pg = creer(b, 'pisteur', 800, 1280)
    pg.evaluate("() => { var P = M.P(); P.vus['pisteur:mairie:massif'] = 'ok'; P.vus['pisteur:mairie:fenetre'] = 'ok'; P.vus['pisteur:mairie:gouttiere'] = 'ok'; delete P.carteVue; delete P.mission; M.sauver(); }")
    pg.reload(); pg.wait_for_timeout(300)
    if pg.is_visible('[data-act=reprendre]'): pg.click('[data-act=reprendre]')
    onglet_carte(pg); pg.wait_for_timeout(1300)
    v = visibles(pg)
    verif(sorted(v) == ['mairie', 'place'], f'vieille sauvegarde : elle se charge, la carte montre la mairie et la place ({v})')
    pg.screenshot(path=f'{OUT}/25-pisteur-e1-tablette.png')
    pg.context.close()

    # Les autres rôles en E1 (le tutoriel, 12.2) : la carte se dévoile aussi, un seul lieu ouvert à la fois, celui de l'étape en cours
    def ouverts(pg): return pg.evaluate("() => [].map.call(document.querySelectorAll('#carte-ici g.ca-lieu.ca-clic'), function(g){ return g.dataset.lieu; })")
    def maisons(pg): return pg.evaluate("() => [].map.call(document.querySelectorAll('#carte-ici [data-act=maison]'), function(g){ return g.dataset.id; }).filter(function(x, i, l){ return l.indexOf(x) === i; })")
    for role in ('alchimiste', 'barde', 'sage'):
        pg = creer(b, role, 390, 844)
        pg.evaluate("() => { var P = M.P(); P.onglet = 'carte'; M.sauver(); M.render(); }"); pg.wait_for_timeout(600)
        # (Romain, 5 novembre : plus de registre à attendre, le visage d'Odette est sur sa maison) le Barde commence tout de suite chez Odette :
        # seule sa maison se touche
        debut_m = ['L2'] if role == 'barde' else []
        verif(visibles(pg) == [] and ouverts(pg) == [] and maisons(pg) == debut_m, f'E1 {role} : au début, rien à toucher sur la carte{" sauf la maison d Odette" if debut_m else ""} ({visibles(pg)}, maisons {maisons(pg)})')
        if role == 'alchimiste':
            pg.evaluate("() => { M.majMission(); M.P().mission.coches[0] = 1; M.sauver(); M.render(); }"); pg.wait_for_timeout(1300)   # l'atelier installé
            verif(visibles(pg) == ['lisiere'] and ouverts(pg) == ['lisiere'] and pg.evaluate("() => !!document.querySelector('g.ca-lieu[data-lieu=lisiere].ca-apparait')"), f'E1 alchimiste : puis la lisière, seule, qui surgit ({visibles(pg)})')
        if role == 'barde':
            pg.evaluate("() => { M.P().actions = 9; }")   # (plus d'adresse à noter : le visage d'Odette est sur sa maison, Romain, 5 novembre)
            pg.evaluate("() => M.A.frapper({dataset:{id:'L2'}})"); pg.evaluate("() => { [1, 2, 3].forEach(function(i){ M.A.question({dataset:{p:'odette', i:String(i)}}); M.UI.modal = null; }); M.render(); }")
            onglet_carte(pg); pg.wait_for_timeout(1300)
            verif(ouverts(pg) == ['potager'] and maisons(pg) == [] and pg.evaluate("() => !!document.querySelector('#carte-ici .ca-marqueur[data-lieu=potager]')"), f'E1 barde : Odette faite → le potager, avec la tête de Basile ({ouverts(pg)})')
        if role == 'sage':
            pg.evaluate("() => { M.majMission(); M.P().mission.coches[0] = 1; M.P().vus['page:recettes'] = 1; M.sauver(); M.render(); }"); pg.wait_for_timeout(1300)
            verif(visibles(pg) == ['mairie'] and ouverts(pg) == ['mairie'], f'E1 sage : après la lecture, la mairie (le balcon), seule ({visibles(pg)})')
        pg.screenshot(path=f'{OUT}/27-e1-{role}-tuto.png')
        pg.context.close()

    # ---------- 4. Enquête 2 : tout est visible pour le Pisteur ----------
    print('4. E2 : tout est visible')
    for W, H in ((390, 844), (800, 1280)):
        pg = creer(b, 'pisteur', W, H, 2)
        # en E2, la pastille ✨ ne parle plus du village : seulement des sous-sols pas encore regardés
        ss_neufs = pg.evaluate("() => M.sousSolsDecouverts().some(function(id){ return !M.S.sousSols.montres[id]; })")
        verif('ca-badge' not in pg.inner_html('.b-onglets [data-o=carte]') and (not ss_neufs or 'cb-onglet-badge' in pg.inner_html('.b-onglets [data-o=role]')), f'E2 Pisteur {W}×{H} : les sous-sols pas encore vus ont leur ✨ sur l\'onglet Cabane, pas sur l\'onglet Carte ({ss_neufs})')
        onglet_carte(pg); pg.wait_for_timeout(300)
        v = visibles(pg)
        # (la nouvelle enquête 2, § 12.11, n'a plus de crypte : le Vieux Chêne, gardé, a son cadenas à la place)
        verif(all(x in v for x in SURFACE), f'E2 Pisteur {W}×{H} : tous les lieux ({len(v)})')
        verif(not pg.evaluate("() => !!document.querySelector('.ca-apparait')"), f'E2 Pisteur {W}×{H} : rien ne surgit')
        verif(pg.evaluate("() => !!document.querySelector('g.ca-lieu[data-lieu=chene].ca-verrouille .ca-cadenas')"), f'E2 Pisteur {W}×{H} : le Vieux Chêne, gardé, a son cadenas 🔒')
        dessus, m = toucher_lieu(pg, 'chene')
        verif(m and m['id'] == 'chene', f'E2 Pisteur {W}×{H} : le Vieux Chêne se touche ({m})')
        fermer(pg)
        pg.screenshot(path=f'{OUT}/30-pisteur-e2-{W}x{H}.png')
        pg.context.close()

    # ---------- 5. Les sous-sols du Pisteur (lui seul) ----------
    print('5. Sous-sols')
    for role in ('barde', 'sage', 'alchimiste'):
        pg = creer(b, role, 390, 844, 2)
        onglet_carte(pg)
        verif(not pg.is_visible('#carte-ici .ca-couches') and not pg.evaluate("() => M.fouilleGratuite('crypte')"), f'E2 {role} : pas de carte des sous-sols')
        pg.context.close()
    # (Le passage secret vers les sous-sols de la cabane se testait avec la crypte de l'ancienne enquête 2 et le tunnel de l'enquête 3 :
    #  la nouvelle enquête 2 n'a pas de passage vers les sous-sols, l'enquête 3 est en cours d'écriture. À refaire avec la nouvelle enquête 3.)
    for W, H in ():
        pg = creer(b, 'pisteur', W, H, 2)
        cabane_carte(pg)
        ss = ss_cabane(pg)
        verif(ss == ['q_chene', 'q_puits'], f'E2 Pisteur {W}×{H} : sur le chevalet de la cabane, les deux « ? » de l\'enquête 1, pas encore la crypte ({ss})')
        t = entrer_code(pg, 'info:passage_crypte')
        verif('cabane' in t, f'E2 Pisteur {W}×{H} : le message dit que la crypte est sur la carte des sous-sols de la cabane (« {t} »)')
        onglet_carte(pg); pg.wait_for_timeout(300)
        verif('crypte' not in visibles(pg) and len([x for x in SURFACE if x in visibles(pg)]) == len(SURFACE), f'E2 Pisteur {W}×{H} : la crypte quitte la carte du village (pas de doublon)')
        pg.evaluate("() => { window.__sons = []; }")
        cabane_carte(pg)
        ss = ss_cabane(pg, True)
        verif('crypte*' in ss and 'escalier_crypte*' in ss and 'entree_clocher*' in ss and 'q_chene' in ss, f'E2 Pisteur {W}×{H} : le passage trouvé → la crypte sous le clocher surgit sur le chevalet ({ss})')
        verif('magie' in pg.evaluate("() => window.__sons"), f'E2 Pisteur {W}×{H} : un petit son quand le passage apparaît')
        pg.screenshot(path=f'{OUT}/40-pisteur-e2-sous-sols-{W}x{H}.png')
        a0 = pg.evaluate("() => M.P().actions")
        m = toucher_murale(pg, 'g.ca-lieu[data-lieu=crypte] .ca-etiq-lieu', [665, 650])
        verif(m and m['id'] == 'crypte' and pg.is_visible('#voile [data-act=explorer][data-id=crypte]') and 'gratuit' in pg.inner_text('#voile [data-act=explorer][data-id=crypte]'), f'E2 Pisteur {W}×{H} : toucher la crypte ouvre le lieu, « Fouiller · gratuit » ({m})')
        pg.screenshot(path=f'{OUT}/41-pisteur-e2-crypte-{W}x{H}.png')
        pg.click('#voile [data-act=explorer][data-id=crypte]'); pg.wait_for_timeout(250)
        verif(pg.evaluate("() => M.P().actions") == a0 and pg.is_visible('#voile [data-act=point][data-id=coffre]'), f'E2 Pisteur {W}×{H} : fouiller la crypte ne coûte aucune action ({a0} → {pg.evaluate("() => M.P().actions")})')
        pg.evaluate("() => { var P = M.P(); P.actions = 0; P.vus['explore:crypte'] = -1; M.sauver(); M.render(); }")   # plus d'action, un autre moment
        b0 = '#voile [data-act=explorer][data-id=crypte]'
        verif(pg.is_visible(b0) and not pg.is_disabled(b0) and 'gratuit' in pg.inner_text(b0), f'E2 Pisteur {W}×{H} : même sans action, on peut fouiller à nouveau sous terre')
        fermer(pg)
        # une défaite efface les sous-sols avec le héros
        if W == 390:
            pg.evaluate("() => { M.recommencer(); }")
            verif(not pg.evaluate("() => M.S.sousSols"), 'après une défaite (nouveau héros), la carte des sous-sols repart de zéro')
        pg.context.close()
    # (Enquête 3 : le vieux tunnel du pont au moulin — l'enquête 3 est en cours d'écriture, pas jouable : test laissé de côté)

    # ---------- 6. La carte murale de la cabane (#cabane-carte, M.carteMurale) ----------
    print('6. Carte murale')
    for W, H, cw, ch in ((390, 844, 300, 250), (844, 390, 226, 163), (800, 1280, 520, 400)):
        pg = creer(b, 'pisteur', W, H, 2)
        pg.wait_for_timeout(600)
        # la vraie cabane (premier onglet du Pisteur), quand elle est là : sa carte murale est accrochée
        reel = pg.evaluate("""() => { var c = document.querySelector('#cabane-ici #cabane-carte'); if(!c) return null;
          var v = c.querySelector('.ca-vue'), mo = c.querySelector('.ca-monde'), sw = c.querySelector('.ca-zoom button');
          var r = c.getBoundingClientRect(), rv = v ? v.getBoundingClientRect() : null;
          return {vues:c.querySelectorAll('.ca-vue').length, bouton:sw ? Math.round(sw.getBoundingClientRect().height) : 0, monde:mo ? [mo.offsetWidth, mo.offsetHeight] : null,
            cadre:[c.clientWidth, c.clientHeight], dedans:!!rv && Math.abs(rv.height - c.clientHeight) < 2 && Math.abs(rv.width - c.clientWidth) < 2}; }""")   # tout l'intérieur du cadre (sa bordure est à la cabane)
        if reel is not None:
            verif(reel['vues'] == 1 and reel['bouton'] >= 30 and reel['monde'] and reel['dedans'], f'vraie cabane {W}×{H} : la carte des sous-sols remplit son cadre, avec ses boutons ＋ / − ({reel})')
            pg.screenshot(path=f'{OUT}/51-vraie-cabane-{W}x{H}.png')
            # deux doigts dans le cadre de la vraie cabane (quand son milieu est à l'écran)
            # la partie du cadre qui est à l'écran, loin des flèches ‹ › de la cabane (52 px sur les bords)
            q = pg.evaluate("""() => { var r = document.querySelector('#cabane-ici #cabane-carte').getBoundingClientRect();
              var x0 = Math.max(r.left, 64), x1 = Math.min(r.right, innerWidth - 64), y0 = Math.max(r.top, 70), y1 = Math.min(r.bottom, innerHeight - 80);
              return (x1 - x0 > 120 && y1 - y0 > 60) ? [(x0 + x1) / 2, (y0 + y1) / 2, x1 - x0, y1 - y0] : null; }""")
            if q and tactile(W, H):
                k0 = zoom(pg, '#cabane-ici #cabane-carte')['k']
                d = min(q[2], 220) * .8   # doigts côte à côte : seule la largeur compte
                pincer(pg, q[0], q[1], d, d * .55)
                k1 = zoom(pg, '#cabane-ici #cabane-carte')['k']
                verif(abs(k1 - k0) < 0.005 and pg.evaluate("() => visualViewport.scale") == 1 and not pg.evaluate("() => !!M.UI.modal"), f'vraie cabane {W}×{H} : deux doigts ne zooment ni la carte du chevalet, ni la page ({k0:.2f} → {k1:.2f})')
                if pg.is_visible('#cabane-carte .ca-zoom-moins'):
                    bouton_zoom(pg, -1, '#cabane-ici #cabane-carte')
                    k2 = zoom(pg, '#cabane-ici #cabane-carte')['k']
                    verif(k2 < k0 - 0.02, f'vraie cabane {W}×{H} : le bouton − dézoome la carte du chevalet ({k0:.2f} → {k2:.2f})')
        # un cadre d'essai, de taille connue
        pg.evaluate(f"""() => {{ var d = document.createElement('div'); d.id = 'essai-carte'; d.style.cssText = 'position:fixed;left:30px;top:80px;width:{cw}px;height:{ch}px;z-index:5'; document.body.appendChild(d); M.carteMurale(d); }}""")
        pg.wait_for_timeout(400)
        m = pg.evaluate("() => { var d = document.getElementById('essai-carte'), v = d.querySelector('.ca-vue'), mo = d.querySelector('.ca-monde'), sw = d.querySelector('.ca-zoom'); return [v.clientWidth, v.clientHeight, mo.offsetWidth, mo.offsetHeight, sw ? Math.round(sw.getBoundingClientRect().width) : 0, !!(M.UI.carteMurale && M.UI.carteMurale.ajuster)]; }")
        verif(m[0] == cw and m[1] == ch and m[2] > cw and m[3] > ch and 0 < m[4] <= cw - 8 and m[5], f'cadre {cw}×{ch} ({W}×{H}) : la carte le remplit, plus grande que lui ({m[2]}×{m[3]}), boutons ＋ / − de {m[4]} px qui tiennent dedans')
        if tactile(W, H):
            l0 = pg.evaluate("() => [document.querySelector('#essai-carte .ca-vue').scrollLeft, document.querySelector('#essai-carte .ca-vue').scrollTop]")
            glisser_doigt(pg, 30 + cw * .7, 80 + ch * .75, 30 + cw * .25, 80 + ch * .35)
            l1 = pg.evaluate("() => [document.querySelector('#essai-carte .ca-vue').scrollLeft, document.querySelector('#essai-carte .ca-vue').scrollTop]")
            verif(l1[0] > l0[0] + 40 or l1[1] > l0[1] + 30, f'cadre {cw}×{ch} : on la fait glisser au doigt ({l0} → {l1})')
        pg.screenshot(path=f'{OUT}/50-cadre-{cw}x{ch}-ecran-{W}x{H}.png')
        pg.evaluate(f"() => {{ document.getElementById('essai-carte').style.width = '{cw + 60}px'; }}"); pg.wait_for_timeout(400)
        verif(pg.evaluate("() => document.querySelector('#essai-carte .ca-vue').clientWidth") == cw + 60, f'cadre {cw}×{ch} : il change de taille, la carte suit')
        mo = toucher_murale(pg, 'g.ca-lieu[data-ss=q_chene] circle:nth-child(2)', [286, 186], '#essai-carte')
        verif(mo and mo['type'] == 'info' and 'air froid' in mo['t'], f'cadre {cw}×{ch} : toucher un « ? » des sous-sols sur la carte murale le relit ({mo})')
        fermer(pg)
        if tactile(W, H):
            # la fenêtre ouverte a refait le rendu : on raccroche le cadre d'essai (la vraie cabane, elle, est redessinée à chaque rendu)
            pg.evaluate("() => { var d = document.getElementById('essai-carte'); d.innerHTML = ''; M.carteMurale(d); }"); pg.wait_for_timeout(300)
            k0 = zoom(pg, '#essai-carte')['k']
            pincer(pg, 30 + cw / 2, 80 + ch / 2, 160, 90)
            k1 = zoom(pg, '#essai-carte')['k']
            verif(abs(k1 - k0) < 0.005 and not pg.evaluate("() => !!M.UI.modal"), f'cadre {cw}×{ch} : deux doigts ne zooment pas la carte murale ({k0:.2f} → {k1:.2f})')
            bouton_zoom(pg, -1, '#essai-carte')
            k2 = zoom(pg, '#essai-carte')['k']
            verif(k2 < k0 - 0.05, f'cadre {cw}×{ch} : le bouton − la dézoome ({k0:.2f} → {k2:.2f})')
        pg.context.close()

    # La carte de la cabane en grand (sur un chevalet, presque plein écran) : tablette couchée, deux doigts
    pg = creer(b, 'pisteur', 1280, 800, 2, touch=True)
    pg.evaluate("() => { var d = document.createElement('div'); d.id = 'essai-carte'; d.style.cssText = 'position:fixed;left:60px;top:90px;width:1100px;height:560px;z-index:5'; document.body.appendChild(d); M.carteMurale(d); }")
    pg.wait_for_timeout(400)
    g0 = zoom(pg, '#essai-carte')
    verif(abs(g0['mw'] - g0['vw']) <= 1 and g0['mh'] > g0['vh'], f'grand cadre 1100×560 : la carte prend toute la largeur ({g0["mw"]}×{g0["mh"]})')
    for i in range(6): bouton_zoom(pg, -1, '#essai-carte')
    g1 = zoom(pg, '#essai-carte')
    verif(g1['mh'] <= g1['vh'] + 1 and g1['mw'] <= g1['vw'] + 1 and not pg.evaluate("() => !!M.UI.modal") and pg.is_disabled('#essai-carte .ca-zoom-moins'), f'grand cadre : − jusqu\'au bout → toute la carte dans le cadre, pas plus ({g1["mw"]}×{g1["mh"]})')
    for i in range(6): bouton_zoom(pg, 1, '#essai-carte')
    verif(abs(zoom(pg, '#essai-carte')['k'] - g0['k']) < 0.01 and pg.is_disabled('#essai-carte .ca-zoom-plus'), 'grand cadre : ＋ jusqu\'au bout → retour à la taille de départ, pas plus')
    pg.context.close()

    # ---------- 7. Le zoom : boutons ＋ / − ; deux doigts ne font rien (Romain, 3 novembre) ; jamais de zoom de la page ----------
    print('7. Zoom aux boutons')
    for W, H in ((390, 844), (360, 740), (1280, 800)):
        pg = creer(b, 'sage', W, H, 2, touch=True)
        meta = pg.evaluate("() => document.querySelector('meta[name=viewport]').content")
        verif('user-scalable=no' in meta and 'maximum-scale=1' in meta, f'{W}×{H} : la page interdit le zoom ({meta})')
        onglet_carte(pg); pg.wait_for_timeout(400)
        a = mesure(pg); z0 = zoom(pg)
        cx, cy = W / 2, (a['haut'] + a['bas']) / 2
        px, py = z0['vw'] / 2, z0['vh'] / 2
        m0 = sous(z0, px, py)
        verif(abs(z0['mw'] - 1000 * z0['k']) < 2, f'{W}×{H} : on commence à la taille de départ (k = {z0["k"]:.2f})')
        bz = pg.evaluate("() => { var p = document.querySelector('#carte-ici .ca-zoom-plus'), m = document.querySelector('#carte-ici .ca-zoom-moins'), r = m.getBoundingClientRect(), n = document.querySelector('.b-onglets').getBoundingClientRect(); return [p.disabled, m.disabled, Math.round(r.width), Math.round(r.height), r.bottom <= n.top, r.right <= innerWidth]; }")
        verif(bz[0] and not bz[1] and min(bz[2], bz[3]) >= 48 and bz[4] and bz[5], f'{W}×{H} : boutons ＋ (grisé au départ) et − bien visibles, au-dessus des onglets ({bz})')
        # deux doigts : rien ne zoome, et l'image de la carte ne s'étire pas (elle ne sort jamais de l'écran)
        pincer(pg, cx, cy, 200, 120)
        z1 = zoom(pg)
        tr = pg.evaluate("() => document.querySelector('#carte-ici .ca-monde > svg').style.transform || ''")
        verif(abs(z1['k'] - z0['k']) < 0.005 and tr in ('', 'none') and not pg.evaluate("() => !!M.UI.modal"), f'{W}×{H} : deux doigts ne zooment plus la carte, ne l\'étirent pas ({z0["k"]:.2f} → {z1["k"]:.2f}, « {tr} »)')
        pg.evaluate("() => { var v = document.querySelector('#carte-ici .ca-vue'); v.scrollLeft = (v.scrollWidth - v.clientWidth) / 2; v.scrollTop = (v.scrollHeight - v.clientHeight) / 2; }"); pg.wait_for_timeout(100)
        z0 = zoom(pg); m0 = sous(z0, px, py)
        bouton_zoom(pg, -1)
        z1 = zoom(pg); m1 = sous(z1, px, py)
        verif(z0['k'] * 0.5 < z1['k'] < z0['k'] * 0.85 and not pg.evaluate("() => !!M.UI.modal"), f'{W}×{H} : le bouton − dézoome d\'un cran, sans ouvrir de lieu ({z0["k"]:.2f} → {z1["k"]:.2f})')
        verif(abs(m1[0] - m0[0]) < 15 and abs(m1[1] - m0[1]) < 15 or z1['mw'] <= z1['vw'] + 1, f'{W}×{H} : on zoome autour du milieu de l\'écran ({m0[0]:.0f},{m0[1]:.0f} → {m1[0]:.0f},{m1[1]:.0f})')
        n = 0
        while bouton_zoom(pg, -1) and n < 8: n += 1
        z2 = zoom(pg)
        verif(n <= 4 and pg.is_disabled('#carte-ici .ca-zoom-moins') and z2['mw'] <= z2['vw'] + 1 and z2['mh'] <= z2['vh'] + 1 and (abs(z2['mw'] - z2['vw']) <= 1 or abs(z2['mh'] - z2['vh']) <= 1), f'{W}×{H} : en quelques crans, toute la carte tient dans l\'écran, pas plus ({z2["mw"]}×{z2["mh"]} dans {z2["vw"]}×{z2["vh"]}, − grisé)')
        fond = pg.evaluate("() => getComputedStyle(document.getElementById('carte-ici')).backgroundImage")
        verif('63, 127, 179' in fond or '43, 95, 143' in fond, f'{W}×{H} : autour de la carte, du bleu ({fond[:60]})')
        pg.screenshot(path=f'{OUT}/60-zoom-min-{W}x{H}.png')
        n = 0
        while bouton_zoom(pg, 1) and n < 8: n += 1
        z3 = zoom(pg)
        verif(abs(z3['k'] - z0['k']) < 0.005 and pg.is_disabled('#carte-ici .ca-zoom-plus'), f'{W}×{H} : au plus près, la taille de départ, pas plus ({z3["k"]:.3f} / {z0["k"]:.3f})')
        bouton_zoom(pg, -1)
        # zoomé à moitié : on touche toujours les lieux, on glisse à un doigt, et le zoom reste après une fenêtre
        zm = zoom(pg)
        dessus, mo = toucher_lieu(pg, 'mairie')
        verif(mo and mo['id'] == 'mairie', f'{W}×{H} : zoomée, toucher la mairie l\'ouvre ({mo})')
        fermer(pg)
        za = zoom(pg)
        verif(abs(za['k'] - zm['k']) < 0.01, f'{W}×{H} : le zoom reste après avoir fermé la fenêtre ({zm["k"]:.2f} → {za["k"]:.2f})')
        place = za['mh'] - za['vh']
        if place > 40:
            bas = za['st'] < place / 2   # on glisse du côté où il reste de la carte
            glisser_doigt(pg, cx, cy + (100 if bas else -100), cx, cy - (100 if bas else -100)); pg.wait_for_timeout(400)
            st = zoom(pg)['st']
            verif(abs(st - za['st']) >= min(60, place / 2 - 2), f'{W}×{H} : un doigt fait toujours glisser la carte ({za["st"]} → {st}, place {place})')
        # pincer juste sur une étiquette n'ouvre rien
        q = viser(pg, '#carte-ici g.ca-lieu[data-lieu=place] .ca-etiq-lieu'); pg.wait_for_timeout(100)
        q = pg.evaluate("() => { var r = document.querySelector('#carte-ici g.ca-lieu[data-lieu=place] .ca-etiq-lieu').getBoundingClientRect(); return {x:r.left + r.width / 2, y:r.top + r.height / 2}; }")
        pincer(pg, q['x'], q['y'], 60, 90, n=4)
        verif(not pg.evaluate("() => !!M.UI.modal"), f'{W}×{H} : pincer sur une étiquette n\'ouvre pas le lieu')
        # pincer sur le bandeau ou les onglets : la page ne zoome pas, tout reste en place
        for nom, y in (('bandeau', 28), ('onglets', H - 32)):
            avant = pg.evaluate("() => [document.querySelector('.b-entete').getBoundingClientRect().bottom, document.querySelector('.b-onglets').getBoundingClientRect().top]")
            pincer(pg, W / 2, y, 80, 300)
            apres = pg.evaluate("() => [visualViewport.scale, document.querySelector('.b-entete').getBoundingClientRect().bottom, document.querySelector('.b-onglets').getBoundingClientRect().top, getComputedStyle(document.querySelector('.b-entete')).touchAction]")
            verif(apres[0] == 1 and abs(apres[1] - avant[0]) < 1 and abs(apres[2] - avant[1]) < 1 and not pg.evaluate("() => !!M.UI.modal"), f'{W}×{H} : pincer sur le {nom} ne zoome pas la page ({apres})')
        pg.context.close()
    # même hors de la carte (onglet du rôle, Code) : la page ne zoome pas
    pg = creer(b, 'barde', 390, 844, 2, touch=True)
    for o in ('role', 'code', 'carnet'):
        pg.click(f'[data-act=onglet][data-o={o}]'); pg.wait_for_timeout(300)
        pincer(pg, 195, 420, 80, 320)
        verif(pg.evaluate("() => visualViewport.scale") == 1, f'onglet {o} : pincer ne zoome pas la page')
    # l'onglet Code : seulement le titre et le pavé
    pg.click('[data-act=onglet][data-o=code]'); pg.wait_for_timeout(200)
    c = pg.evaluate("() => { var s = document.querySelector('.b-code-page'); return [s.querySelector('h2').textContent, s.querySelectorAll('p').length, s.querySelectorAll('.b-pave [data-act=sym]').length]; }")
    verif('Entrer un code' in c[0] and c[1] == 0 and c[2] >= 9, f'onglet Code : seulement le titre et le pavé ({c})')
    pg.context.close()
    b.close()
print('ERREURS :', erreurs)
