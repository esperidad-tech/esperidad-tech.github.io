"""Le tableau de liège du Barde et le nouveau Carnet (Playwright).
Téléphone tactile 390×844 : glisser du bac, toucher (couleurs), déplacer, fil rouge, couper, remettre au bac,
rechargement, journal de l'enquête 1 (lecture seule). Carnet : visages qui s'ouvrent et se ferment, relectures
rangées chez le bon habitant, « Autres », « Mes indices ». Puis 360×740 (tactile) et 1280×800 (souris).
Aucune voix ne doit partir toute seule."""
import os, json
from playwright.sync_api import sync_playwright
URL = 'file://' + os.path.join(os.environ['BRUMEVAL_DIST'], 'index.html')
OUT = os.path.dirname(os.path.abspath(__file__)) + '/captures'
os.makedirs(OUT, exist_ok=True)
erreurs, echecs = [], []
def verif(c, msg):
    print(('  OK  ' if c else '  ✗✗ ') + msg, flush=True)
    if not c: echecs.append(msg)
def ev(pg, js): return pg.evaluate(js)
def fermer(pg): pg.evaluate("() => { M.UI.modal = null; M.render(); }"); pg.wait_for_timeout(100)
def act(pg, a, data): pg.evaluate(f"() => M.A['{a}']({{dataset:{json.dumps(data)}}})"); pg.wait_for_timeout(120)
def question(pg, pnj, i): act(pg, 'question', {'p': pnj, 'i': str(i)}); fermer(pg)

def creer(b, w, h, tactile, nom='Barde', role='barde'):
    ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2, has_touch=tactile, is_mobile=tactile)
    pg = ctx.new_page(); pg.set_default_timeout(30000)
    pg.on('console', lambda m: erreurs.append(f'[{w}] {m.text}') if m.type == 'error' and 'ERR_' not in m.text and 'fonts' not in m.text else None)
    pg.on('pageerror', lambda e: erreurs.append(f'[{w}] PAGEERROR {e}'))
    pg.add_init_script('window.BRUMEVAL_SANS_TUTO = true')   # ce banc teste d'autres systèmes : l'enquête 1 sans le tutoriel guidé (tools/tuto.py teste le tutoriel)
    pg.goto(URL)
    pg.click('[data-act=creer]'); pg.click(f'[data-act=crea-role][data-r={role}]'); pg.click('[data-act=crea-suite]')
    pg.fill('#nom', nom); pg.click('[data-act=crea-fin]')
    pg.click('[data-act=nouvelle-enquete]'); pg.click('[data-act=commencer]'); pg.wait_for_timeout(400)
    pg.evaluate("""() => {
      MJ.lancer = function(el, type, params, fin){ setTimeout(function(){ fin({reussi:true, score:1, essais:1}); }, 30); return {arreter:function(){}}; };
      window.__voix = 0; var l = M.lire; M.lire = function(){ window.__voix++; return l.apply(this, arguments); };
      if(window.speechSynthesis){ var sp = speechSynthesis.speak.bind(speechSynthesis); speechSynthesis.speak = function(u){ window.__voix++; return sp(u); }; }
    }""")
    return pg, ctx

def centre(pg, sel):
    loc = pg.locator(sel).first
    if 'lg-bac-carte' in sel: loc.scroll_into_view_if_needed(); pg.wait_for_timeout(150)   # le bac défile de côté
    if '.lg-monde .lg-carte' in sel:   # une photo du tableau : un point où on la voit vraiment (pas sous une autre)
        x, y = ev(pg, """(sel) => { var e = document.querySelector(sel), r = e.getBoundingClientRect();
          var fs = [.5, .3, .7, .15, .85];
          for(var a = 0; a < fs.length; a++) for(var b = 0; b < fs.length; b++){ var x = r.left + r.width * fs[b], y = r.top + r.height * fs[a], h = document.elementFromPoint(x, y); if(h && e.contains(h)) return [x, y]; }
          return [r.left + r.width / 2, r.top + r.height / 2]; }""".replace('(sel) =>', '() =>').replace('document.querySelector(sel)', 'document.querySelector(' + json.dumps(sel) + ')'))
        return x, y
    bb = loc.bounding_box(); return bb['x'] + bb['width'] / 2, bb['y'] + bb['height'] / 2
def glisser(pg, cdp, x0, y0, x1, y1, pas=14, pendant=None):
    """Un vrai doigt (CDP) : touchStart, des touchMove, touchEnd. pendant() est appelé juste avant de lever le doigt."""
    cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x0, 'y': y0}]})
    for i in range(1, pas + 1):
        cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': x0 + (x1 - x0) * i / pas, 'y': y0 + (y1 - y0) * i / pas}]})
        pg.wait_for_timeout(16)
    r = pendant() if pendant else None
    cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
    pg.wait_for_timeout(450)   # un vrai doigt ne retouche pas l'écran dans la foulée
    return r
def souris(pg, x0, y0, x1, y1, pas=14):
    pg.mouse.move(x0, y0); pg.mouse.down()
    for i in range(1, pas + 1): pg.mouse.move(x0 + (x1 - x0) * i / pas, y0 + (y1 - y0) * i / pas); pg.wait_for_timeout(16)
    pg.mouse.up(); pg.wait_for_timeout(200)
def L(pg): return ev(pg, "() => JSON.parse(JSON.stringify(M.P().liege || {}))")
def carte(k): return f'#liege-ici .lg-monde .lg-carte[data-k="{k}"]'
def bac(k): return f'#liege-ici .lg-bac-carte[data-k="{k}"]'
def classes(pg, k): return ev(pg, f"() => {{ var e = document.querySelector('{carte(k)}'); return e ? e.className : null; }}")
def toucher(pg, sel): x, y = centre(pg, sel); pg.touchscreen.tap(x, y); pg.wait_for_timeout(180)
def mesure(pg):
    return ev(pg, """() => { var i = document.getElementById('liege-ici'), r = i && i.getBoundingClientRect(), n = document.querySelector('.b-onglets').getBoundingClientRect();
      return {haut:Math.round(r.top), bas:Math.round(r.bottom), nav:Math.round(n.top), vh:innerHeight, sw:document.documentElement.scrollWidth, vw:innerWidth, sh:document.documentElement.scrollHeight}; }""")

with sync_playwright() as p:
    b = p.chromium.launch()
    # ================= Téléphone 390×844, au doigt =================
    B, ctx = creer(b, 390, 844, True)
    cdp = ctx.new_cdp_session(B)
    verif(B.is_visible('#liege-ici .lg-vue') and B.is_visible('#liege-ici .lg-bac'), 'Barde E1 : le premier onglet est le tableau de liège, avec le bac')
    m = mesure(B); print('  mesures 390 :', m)
    verif(abs(m['bas'] - m['nav']) <= 2 and m['sw'] <= m['vw'] and m['sh'] <= m['vh'] + 2, 'Plein écran entre le bandeau et les onglets, sans défilement de page')
    verif(B.locator('text=Y aller').count() == 0, 'Plus de bouton « 📍 Y aller »')
    ks = ev(B, "() => [].map.call(document.querySelectorAll('#liege-ici .lg-bac-carte'), function(e){ return e.dataset.k; })")
    print('  bac :', ks)
    gens = [k for k in ks if k.startswith('pnj:')]
    verif(gens == ['pnj:gaspard', 'pnj:basile', 'pnj:victor', 'pnj:melusine', 'pnj:odette', 'pnj:tim'], f'Bac E1 : seulement les 6 suspects ({len(gens)})')
    verif([k for k in ks if k.startswith('lieu:')] == ['lieu:' + x for x in ['mairie', 'place', 'boulangerie', 'foret', 'moulin', 'puits', 'chene', 'toits']], 'Bac E1 : les lieux qui comptent (E.liege), dans l\'ordre')
    fond = ev(B, f"() => {{ var c = getComputedStyle(document.querySelector('{bac('pnj:gaspard')}')); return [c.backgroundImage, c.color]; }}")
    verif('gradient' in fond[0] and fond[1] == 'rgb(238, 240, 255)', f'Bac : cartes bleues (thème du jeu), texte clair ({fond[1]})')
    verif(set(['lieu:moulin', 'lieu:puits', 'lieu:chene', 'lieu:toits', 'lieu:mairie', 'lieu:place']).issubset(ks), 'Bac : les lieux (choix du OÙ + lieux de l\'enquête)')
    verif(not [k for k in ks if k.startswith('obj:')], 'Bac : pas d\'objet tant qu\'on n\'en connaît aucun')
    met = ev(B, f"() => {{ var s = document.querySelector('{bac('pnj:gaspard')} small'); return [s.textContent, getComputedStyle(s).backgroundColor]; }}")
    verif(met[0] == '🍞 boulanger' and met[1] == 'rgb(255, 210, 63)', f'Carte de Gaspard : métier en jaune avec son icône ({met})')
    B.screenshot(path=f'{OUT}/liege-390-vide.png')
    # glisser du bac vers le haut
    x0, y0 = centre(B, bac('pnj:gaspard')); vb = B.locator('#liege-ici .lg-vue').bounding_box()
    glisser(B, cdp, x0, y0, vb['x'] + vb['width'] * .3, vb['y'] + vb['height'] * .4)
    verif('pnj:gaspard' in L(B).get('cartes', {}) and B.locator(carte('pnj:gaspard')).count() == 1 and B.locator(bac('pnj:gaspard')).count() == 0, 'Glisser Gaspard du bac vers le haut : il est épinglé, et quitte le bac')
    verif(B.locator(carte('pnj:gaspard') + ' .lg-epingle').count() == 1, 'La photo a sa punaise 📌')
    # glisser de côté dans le bac : ça défile, ça n'épingle pas
    x0, y0 = centre(B, bac('pnj:basile')); glisser(B, cdp, x0, y0, x0 - 140, y0 + 2)
    verif('pnj:basile' not in L(B).get('cartes', {}), 'Glisser de côté dans le bac : rien n\'est épinglé')
    # toucher une photo du bac : épinglée au milieu
    toucher(B, bac('pnj:tim')); toucher(B, bac('lieu:chene'))
    verif(set(['pnj:tim', 'lieu:chene']).issubset(L(B)['cartes']), 'Toucher une photo du bac l\'épingle au milieu du tableau')
    # le cycle des couleurs
    attendu = [('innocent', 1), ('surveiller', 2), ('suspect', 3), (None, 0)]
    for nom, s in attendu:
        toucher(B, carte('pnj:gaspard'))
        c = classes(B, 'pnj:gaspard'); st = L(B)['cartes']['pnj:gaspard']['s']
        ok = (('lg-s-' + nom) in c) if nom else ('lg-s-' not in c)
        verif(ok and st == s, f'Toucher Gaspard → {nom or "rien"} (s={st})')
    for i in range(3): toucher(B, carte('pnj:gaspard'))
    toucher(B, carte('pnj:tim'))
    verif('✓ innocent' in B.inner_text(carte('pnj:tim')) and '🎯 suspect' in B.inner_text(carte('pnj:gaspard')), 'Étiquettes ✓ innocent / 🎯 suspect sur les photos')
    # déplacer une photo
    avant = L(B)['cartes']['pnj:gaspard']; x0, y0 = centre(B, carte('pnj:gaspard'))
    glisser(B, cdp, x0, y0, x0 + 50, y0 + 30)
    apres = L(B)['cartes']['pnj:gaspard']
    verif(apres['x'] > avant['x'] + 40 and apres['y'] > avant['y'] + 20 and apres['s'] == 3, f'Déplacer Gaspard au doigt ({avant["x"]},{avant["y"]} → {apres["x"]},{apres["y"]}), sa couleur reste')
    # le fil rouge
    toucher(B, '[data-lg=bobine]')
    verif(B.locator('.lg-bobine.on').count() == 1 and B.is_visible('.lg-consigne'), 'Bobine 🧵 : mode fil, avec une consigne')
    toucher(B, carte('pnj:gaspard')); toucher(B, carte('pnj:tim'))
    f = L(B)['fils']
    verif(f == [['pnj:gaspard', 'pnj:tim']] and B.locator('#liege-ici .lg-fil').count() == 1, f'Deux photos touchées : un fil rouge les relie ({f})')
    verif(L(B)['cartes']['pnj:gaspard']['s'] == 3 and L(B)['cartes']['pnj:tim']['s'] == 1 and B.locator('.lg-bobine.on').count() == 0, 'Relier ne change pas les couleurs, la bobine se range')
    d1 = ev(B, "() => document.querySelector('#liege-ici .lg-fil').getAttribute('d')")
    x0, y0 = centre(B, carte('pnj:tim')); glisser(B, cdp, x0, y0, x0 - 70, y0 + 10)
    d2 = ev(B, "() => document.querySelector('#liege-ici .lg-fil').getAttribute('d')")
    verif(d1 != d2 and 'Q' in d2, 'Le fil suit la photo qu\'on déplace (et il pend un peu)')
    x0, y0 = centre(B, carte('lieu:chene')); glisser(B, cdp, x0, y0, vb['x'] + vb['width'] * .84, vb['y'] + vb['height'] * .22)   # le chêne en haut à droite
    toucher(B, '[data-lg=bobine]'); toucher(B, carte('pnj:gaspard')); toucher(B, carte('lieu:chene'))
    verif(len(L(B)['fils']) == 2, 'Un deuxième fil')
    B.screenshot(path=f'{OUT}/liege-390-fils.png')
    # couper un fil en le touchant
    # un point du fil gaspard–chêne qui passe sur le liège (pas sous une photo)
    pt = ev(B, """() => { var z = document.querySelector('#liege-ici [data-fil="1"]'), n = z.getTotalLength(), m = z.getScreenCTM();
      for(var t = .5, i = 0; i < 40; i++, t = .5 + (i % 2 ? 1 : -1) * Math.ceil(i / 2) * .012){ var q = z.getPointAtLength(n * t), x = q.x * m.a + q.y * m.c + m.e, y = q.x * m.b + q.y * m.d + m.f;
        if(document.elementFromPoint(x, y) === z) return {x:x, y:y}; } return null; }""")
    verif(pt is not None, 'Le fil passe sur le liège : on peut le toucher')
    if pt: B.touchscreen.tap(pt['x'], pt['y']); B.wait_for_timeout(250)
    verif(L(B)['fils'] == [['pnj:gaspard', 'pnj:tim']] and 'Fil coupé' in B.inner_text('body'), 'Toucher un fil le coupe (« ✂️ Fil coupé »)')
    # l'autre façon : relier encore les deux mêmes photos
    toucher(B, '[data-lg=bobine]'); toucher(B, carte('pnj:gaspard')); toucher(B, carte('lieu:chene'))
    verif(len(L(B)['fils']) == 2, 'Fil gaspard–chêne remis')
    toucher(B, '[data-lg=bobine]'); toucher(B, carte('lieu:chene')); toucher(B, carte('pnj:gaspard'))
    verif(L(B)['fils'] == [['pnj:gaspard', 'pnj:tim']] and B.locator('.lg-bobine.on').count() == 0, 'Bobine sur deux photos déjà reliées : le fil est coupé')
    # remettre une photo dans le bac : elle part avec ses fils ; le bac s'allume pendant le survol
    x0, y0 = centre(B, carte('pnj:tim')); bb = B.locator('#liege-ici .lg-bac').bounding_box()
    allume = glisser(B, cdp, x0, y0, bb['x'] + bb['width'] / 2, bb['y'] + bb['height'] / 2, pendant=lambda: B.locator('#liege-ici .lg-bac.lg-survol').count() == 1)
    verif(allume, 'Le bac s\'allume quand une photo passe dessus')
    verif('pnj:tim' not in L(B)['cartes'] and L(B)['fils'] == [] and B.locator(bac('pnj:tim')).count() == 1 and B.locator('#liege-ici .lg-bac.lg-survol').count() == 0, 'Photo remise au bac : enlevée du tableau, avec son fil, de retour dans le bac')
    # remettre Tim, un fil, et le sac
    toucher(B, bac('pnj:tim')); toucher(B, carte('pnj:tim'))
    toucher(B, '[data-lg=bobine]'); toucher(B, carte('pnj:gaspard')); toucher(B, carte('pnj:tim'))
    x0, y0 = centre(B, bac('lieu:mairie')); glisser(B, cdp, x0, y0, vb['x'] + vb['width'] * .75, vb['y'] + vb['height'] * .3)
    B.wait_for_timeout(300); toucher(B, '[data-lg=sac]')
    if ev(B, "() => M.UI.modal && M.UI.modal.type") != 'barde-sac':
        bb = B.locator('[data-lg=sac]').bounding_box(); print('  DEBUG sac', bb, ev(B, f"() => {{ var e = document.elementFromPoint({bb['x'] + bb['width'] / 2}, {bb['y'] + bb['height'] / 2}); return [e && e.outerHTML.slice(0, 100), M.UI.modal && M.UI.modal.type, document.querySelector('.lg-bobine').className]; }}"))
        B.screenshot(path=f'{OUT}/debug-sac.png')
    verif(ev(B, "() => M.UI.modal && M.UI.modal.type") == 'barde-sac' and 'Mon sac' in B.inner_text('#voile'), '🎒 Mes codes : ouvre le sac du Barde')
    fermer(B)
    # un objet connu arrive dans le bac
    for s in ev(B, "() => M.code('obj:affiche')"): act(B, 'sym', {'s': s})
    B.wait_for_timeout(400); fermer(B)
    B.click('[data-act=onglet][data-o=role]'); B.wait_for_timeout(300)
    verif(B.locator(bac('obj:affiche')).count() == 1, 'Un objet reçu (l\'affiche) apparaît dans le bac')
    B.screenshot(path=f'{OUT}/liege-390-tableau.png')
    # rechargement
    avant = L(B)
    B.reload(); B.wait_for_timeout(600)
    if B.is_visible('[data-act=reprendre]'): B.click('[data-act=reprendre]')
    B.click('[data-act=onglet][data-o=role]'); B.wait_for_timeout(400)
    verif(L(B) == avant and B.locator('#liege-ici .lg-monde .lg-carte').count() == len(avant['cartes']) and 'lg-s-suspect' in classes(B, 'pnj:gaspard') and B.locator('#liege-ici .lg-fil').count() == 1, 'Après rechargement : photos, places, couleurs et fil sont là')
    B.evaluate("""() => { window.__voix = 0; var l = M.lire; M.lire = function(){ window.__voix++; return l.apply(this, arguments); };
      if(window.speechSynthesis){ var sp = speechSynthesis.speak.bind(speechSynthesis); speechSynthesis.speak = function(u){ window.__voix++; return sp(u); }; }
      MJ.lancer = function(el, type, params, fin){ setTimeout(function(){ fin({reussi:true, score:1, essais:1}); }, 30); return {arreter:function(){}}; }; }""")
    # ================= Le zoom à deux doigts =================
    def zoom(pg): return ev(pg, "() => { var t = document.querySelector('#liege-ici .lg-monde').style.transform, m = /scale\\(([0-9.]+)\\)/.exec(t); return m ? +m[1] : 0; }")
    # au plus gros : le liège remplit la hauteur (comme avant) ; au plus petit : tout le cadre de bois (.lg-cadre), avec une marge de mur autour
    def bornes(pg): return ev(pg, """() => { var v = document.querySelector('#liege-ici .lg-vue'), c = document.querySelector('#liege-ici .lg-cadre'), w = v.clientWidth, h = v.clientHeight,
      m = Math.max(10, Math.min(24, Math.round(Math.min(w, h) * 0.05))); return {kmax:h / 900, kmin:Math.min(h / 900, (w - 2 * m) / c.offsetWidth, (h - 2 * m) / c.offsetHeight)}; }""")
    def decor(pg):   # marges du cadre dans la vue (positives = on voit du mur), et le mur couvre-t-il toute la vue ?
        return ev(pg, """() => { var v = document.querySelector('#liege-ici .lg-vue').getBoundingClientRect(), c = document.querySelector('#liege-ici .lg-cadre').getBoundingClientRect(),
          m = document.querySelector('#liege-ici .lg-mur').getBoundingClientRect();
          return {cadre:[c.left - v.left, c.top - v.top, v.right - c.right, v.bottom - c.bottom], mur:m.left <= v.left && m.top <= v.top && m.right >= v.right && m.bottom >= v.bottom}; }""")
    def liege_libre(pg):   # un point du liège sans photo ni fil
        return ev(pg, """() => { var v = document.querySelector('#liege-ici .lg-vue').getBoundingClientRect();
          for(var fy = .35; fy < .9; fy += .05) for(var fx = .3; fx < .8; fx += .04){ var x = v.left + v.width * fx, y = v.top + v.height * fy, e = document.elementFromPoint(x, y);
            if(e && e.classList.contains('lg-monde')) return [x, y]; } return null; }""")
    def pincer(pg, cdp, cx, cy, d0, d1, doigt1=None, pas=12):
        a = doigt1 or (cx - d0 / 2, cy); b = (cx + d0 / 2, cy)
        cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': a[0], 'y': a[1], 'id': 1}]}); pg.wait_for_timeout(60)
        cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': a[0], 'y': a[1], 'id': 1}, {'x': b[0], 'y': b[1], 'id': 2}]}); pg.wait_for_timeout(30)
        for i in range(1, pas + 1):
            e = (d1 - d0) * i / pas / 2
            cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': a[0] - e, 'y': a[1], 'id': 1}, {'x': b[0] + e, 'y': b[1], 'id': 2}]}); pg.wait_for_timeout(16)
        cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []}); pg.wait_for_timeout(450)
    kb = bornes(B); k0 = zoom(B); avant = L(B)
    vb = B.locator('#liege-ici .lg-vue').bounding_box(); cx, cy = vb['x'] + vb['width'] / 2, vb['y'] + vb['height'] * .82
    verif(abs(k0 - kb['kmax']) < 0.01, f'Zoom : au départ, comme avant (le tableau remplit la hauteur, k={k0:.3f})')
    verif(decor(B)['mur'], 'Le mur du bureau couvre toute la vue (jamais de vide)')
    pincer(B, cdp, cx, cy, 220, 90)
    k1 = zoom(B)
    verif(k1 < k0 - 0.05 and k1 >= kb['kmin'] - 0.001, f'Pincer (doigts qui se rapprochent) : le tableau rapetisse ({k0:.3f} → {k1:.3f})')
    verif(L(B) == avant, 'Pincer : aucune photo épinglée, enlevée, déplacée ou recolorée')
    pincer(B, cdp, cx, cy, 300, 20)
    m = ev(B, "() => { var a = document.querySelector('#liege-ici .lg-monde').getBoundingClientRect(), v = document.querySelector('#liege-ici .lg-vue').getBoundingClientRect(); return [a.left - v.left, a.top - v.top, v.right - a.right, v.bottom - a.bottom]; }")
    verif(abs(zoom(B) - kb['kmin']) < 0.002 and min(m) >= -1, f'Zoom au plus petit : on voit tout le tableau ({zoom(B):.3f}, marges {[round(x) for x in m]})')
    dc = decor(B)
    verif(min(dc['cadre']) >= 8 and dc['mur'], f'Zoom au plus petit : tout le cadre de bois, avec du mur tout autour (marges {[round(x) for x in dc["cadre"]]})')
    kz0 = zoom(B); pincer(B, cdp, cx, cy, 300, 20)
    verif(abs(zoom(B) - kz0) < 0.001 and decor(B)['mur'], 'Pincer encore : le tableau ne rapetisse plus, le mur couvre toujours tout')
    B.screenshot(path=f'{OUT}/liege-390-zoom-tout.png')
    # un pincement qui commence SUR une photo ne la touche pas
    g0 = L(B)['cartes']['pnj:gaspard']; gx, gy = centre(B, carte('pnj:gaspard'))
    pincer(B, cdp, gx + 60, gy, 120, 260, doigt1=(gx, gy))
    verif(L(B)['cartes']['pnj:gaspard'] == g0 and zoom(B) > kb['kmin'] + 0.02, 'Pincement commencé sur Gaspard : il ne bouge pas et ne change pas de couleur, le tableau zoome')
    # au zoom moyen : déplacer une photo, tirer un fil, épingler depuis le bac
    kz = zoom(B); x0, y0 = centre(B, carte('pnj:tim')); t0 = L(B)['cartes']['pnj:tim']
    glisser(B, cdp, x0, y0, x0 + 30, y0 + 20)
    t1 = L(B)['cartes']['pnj:tim']
    verif(abs((t1['x'] - t0['x']) - 30 / kz) < 6 and abs((t1['y'] - t0['y']) - 20 / kz) < 6, f'Zoomé : Tim se déplace sous le doigt ({t1["x"] - t0["x"]} ≈ {30 / kz:.0f})')
    toucher(B, '[data-lg=bobine]'); toucher(B, carte('lieu:chene')); toucher(B, carte('pnj:tim'))
    verif(len(L(B)['fils']) == 2, 'Zoomé : la bobine relie encore deux photos')
    toucher(B, bac('pnj:basile'))
    vis = ev(B, f"() => {{ var c = document.querySelector('{carte('pnj:basile')}'), v = document.querySelector('#liege-ici .lg-vue'); if(!c) return false; var a = c.getBoundingClientRect(), b = v.getBoundingClientRect(); return a.left >= b.left - 2 && a.right <= b.right + 2 && a.top >= b.top - 2 && a.bottom <= b.bottom + 2; }}")
    verif(vis, 'Zoomé : une photo touchée dans le bac s\'épingle là où on regarde')
    pincer(B, cdp, cx, cy, 40, 400)
    verif(abs(zoom(B) - kb['kmax']) < 0.002, 'Écarter les doigts : jamais plus gros qu\'avant (zoom de départ)')
    # au plus gros, glisser loin vers la droite : on va jusqu'au bord du cadre, pas plus loin (pas de mur à gauche) ; en hauteur, rien ne bouge
    pt = liege_libre(B); verif(pt is not None, 'Un coin de liège libre pour faire glisser')
    if pt:
        oy0 = ev(B, "() => document.querySelector('#liege-ici .lg-monde').getBoundingClientRect().top")
        glisser(B, cdp, pt[0], pt[1], pt[0] + 330, pt[1] + 40); B.wait_for_timeout(200)
        dc = decor(B); oy1 = ev(B, "() => document.querySelector('#liege-ici .lg-monde').getBoundingClientRect().top")
        verif(abs(dc['cadre'][0]) <= 1.5 and dc['mur'] and abs(oy1 - oy0) < 1, f'Glisser au bord : on voit le cadre de bois au bord, sans vide derrière ({round(dc["cadre"][0], 1)}), et en hauteur rien ne bouge')
        verif(ev(B, "() => document.querySelector('.lg-fleche.g').hidden && !document.querySelector('.lg-fleche.d').hidden"), 'Au bord gauche : la flèche ‹ se cache, la flèche › reste')
    B.screenshot(path=f'{OUT}/liege-390-apres-zoom.png')
    # ================= Le Carnet =================
    B.evaluate("() => { M.P().actions = 9; }")
    act(B, 'frapper', {'id': 'L2'}); question(B, 'odette', 0); question(B, 'odette', 1)
    B.evaluate("() => { M.P().actions = 9; }"); act(B, 'parler', {'id': 'basile'}); question(B, 'basile', 0); fermer(B)
    B.evaluate("""() => { var P = M.P(); P.revisions = (P.revisions || []).concat([
      {type:'mensonge', qui:'grosbec', nom:'Grosbec', titre:'Repérer le mensonge', bilan:'Tu as trouvé la phrase qui cloche.', phrases:[], ic:'🤥'},
      {type:'ragots', ic:'🍺', ragots:[{texte:'Gaspard a fait du pain toute la nuit.', qui:'margot', reponse:'vrai', avis:'vrai'}, {texte:'Le chien de la place a filé vers la forêt.', qui:'victor', reponse:'vrai', avis:'vrai'}]},
      {type:'depositions', scene:'À minuit', ic:'📜', depositions:[{qui:'gaspard', nom:'Gaspard', phrases:[{t:'J\\'étais devant mon four.', m:'v'}, {t:'Je n\\'ai rien entendu.', m:'r'}]}]},
      {type:'mots', titre:'La chanson de la fête', ic:'🎶', phrases:[{qui:'🎶', texte:'Quand la [brume] se lève'}]}]); M.sauver(); }""")
    B.click('[data-act=onglet][data-o=carnet]'); B.wait_for_timeout(300)
    verif(B.is_visible('.b-missions') and B.locator('.cn-gens').count() == 1, 'Carnet : « Mes missions » en haut, puis les habitants')
    verif(B.locator('.cn-gens > p, .cn-gens > h3 .b-lire, .cn-gens > .b-lire').count() == 0 and B.inner_text('.cn-gens h3').strip() == '👥 Les habitants', 'Carnet : juste le titre « Les habitants », sans phrase d\'explication')
    verif('À relire' not in B.inner_text('.b-carnet') and B.locator('[data-act=rayer]').count() == 0, 'Carnet : plus de bloc « À relire », plus de visages à rayer')
    verif(B.locator('.cn-dossier').count() == 1 and B.locator('.cn-autres').count() == 1, 'Carnet : tout est fermé au départ (seul « Autres » est ouvert)')
    B.screenshot(path=f'{OUT}/carnet-390-ferme.png', full_page=True)
    B.click('[data-act=carnet-pnj][data-id=odette]'); B.wait_for_timeout(250)
    od = '.cn-pnj.ouvert:has([data-id=odette])'
    verif(B.locator(od + ' .cn-rep').count() == 2 and B.locator(od + ' .cn-rep .b-lire').count() == 2, 'Odette ouverte : ses 2 réponses, chacune avec 🔊')
    verif('petite silhouette' in B.inner_text(od), 'Odette : on relit ce qu\'elle a dit (la silhouette sur les toits)')
    B.click('[data-act=carnet-pnj][data-id=basile]'); B.wait_for_timeout(250)
    verif(B.locator('.cn-pnj.ouvert').count() == 2, 'Deux visages ouverts en même temps')
    for pnj in ['margot', 'victor', 'gaspard', 'grosbec']: B.click(f'[data-act=carnet-pnj][data-id={pnj}]'); B.wait_for_timeout(200)
    verif('Gaspard a fait du pain' in B.inner_text('.cn-pnj.ouvert:has([data-id=margot])') and 'Le chien de la place' in B.inner_text('.cn-pnj.ouvert:has([data-id=victor])'), 'Ragots : chacun rangé sous celui qui l\'a raconté')
    verif('devant mon four' in B.inner_text('.cn-pnj.ouvert:has([data-id=gaspard])') and B.locator('.cn-pnj.ouvert:has([data-id=gaspard]) .cn-m-r').count() == 1, 'Déposition : rangée sous le témoin, avec ses marques')
    verif(B.locator('.cn-pnj.ouvert:has([data-id=grosbec]) [data-act=revoir]').count() == 1, 'Mensonge : rangé chez le maire, avec « 🔁 Relire »')
    verif('La chanson de la fête' in B.inner_text('.cn-autres'), '« 📝 Autres » : les mots perdus, liés à personne')
    notesQ = ev(B, "() => document.querySelector('.cn-indices').innerText")
    verif('silhouette' not in notesQ, 'Barde : les réponses ne sont pas répétées dans « Mes indices »')
    B.screenshot(path=f'{OUT}/carnet-390-ouvert.png', full_page=True)
    B.click('[data-act=carnet-pnj][data-id=odette]'); B.wait_for_timeout(250)
    verif(B.locator(od).count() == 0 and B.locator('.cn-pnj.ouvert:has([data-id=basile])').count() == 1, 'Retoucher Odette la referme (Basile reste ouvert)')
    ip = ev(B, "() => String(M.etapesMission().findIndex(function(e){ return e.piste; }))")   # la première piste (l'enquête 1 a maintenant 6 étapes avant elle : le tutoriel)
    B.click(f'.b-missions [data-act=mission-coche][data-i="{ip}"]'); B.wait_for_timeout(200)
    verif(B.locator('.b-missions li.piste.coche').count() == 1, f'Carnet : la case d\'une piste se coche à la main (étape {ip})')
    B.click(f'.b-missions [data-act=mission-coche][data-i="{ip}"]'); B.wait_for_timeout(200)
    verif(B.locator('.b-missions li.piste.coche').count() == 0, '… et se décoche')
    verif(ev(B, "() => window.__voix") == 0, 'Aucune voix ne part toute seule (tableau, carnet)')
    # ================= Enquête 2 : le tableau de l'enquête 1 reste dans le journal =================
    n1 = len(L(B)['cartes']); nf1 = len(L(B)['fils'])
    B.click('[data-act=onglet][data-o=code]')
    for s in ev(B, "() => M.code('suite:0')"): B.click(f'#app [data-act=sym][data-s={s}]')
    B.wait_for_timeout(500)
    for i in range(14):
        if B.is_visible('[data-act=fin-suite]'): B.click('[data-act=fin-suite]'); B.wait_for_timeout(60)
    if B.is_visible('#voile .b-fermer'): B.click('#voile .b-fermer')
    if B.is_visible('[data-act=commencer]'): B.click('[data-act=commencer]'); B.wait_for_timeout(300)
    verif(ev(B, "() => M.P().id") == 2, 'Le Barde est passé à l\'enquête 2')
    B.click('[data-act=onglet][data-o=role]'); B.wait_for_timeout(300)
    verif(B.locator('#liege-ici .lg-monde .lg-carte').count() == 0 and B.locator('#liege-ici .lg-bac-carte').count() > 8, 'Enquête 2 : un tableau tout neuf, le bac plein')
    B.click('[data-act=onglet][data-o=carnet]'); B.wait_for_timeout(200)
    B.click('[data-act=journal][data-e="1"]'); B.wait_for_timeout(300)
    verif(B.locator('.lg-jr .lg-carte').count() == n1 and B.locator('.lg-jr .lg-fil').count() == nf1, f'Journal « Enquête 1 » : le tableau de liège est gardé ({n1} photos, {nf1} fils)')
    verif(B.locator('.lg-jr [data-lg], .lg-jr [data-fil], .lg-jr .lg-bac').count() == 0, 'Journal : en lecture seule (ni bac, ni bobine, ni fil à couper)')
    verif(ev(B, "() => document.documentElement.scrollWidth <= innerWidth"), 'Journal : pas de défilement de côté')
    B.screenshot(path=f'{OUT}/liege-journal-E1.png', full_page=True)
    ctx.close()
    # ================= 360×740, au doigt =================
    B, ctx = creer(b, 360, 740, True); cdp = ctx.new_cdp_session(B)
    m = mesure(B); print('  mesures 360 :', m)
    verif(abs(m['bas'] - m['nav']) <= 2 and m['sw'] <= m['vw'] and m['sh'] <= m['vh'] + 2, '360×740 : plein écran, sans défilement de page')
    vb = B.locator('#liege-ici .lg-vue').bounding_box()
    for k, fx in [('pnj:odette', .2), ('pnj:melusine', .5), ('lieu:moulin', .8)]:
        x0, y0 = centre(B, bac(k)); glisser(B, cdp, x0, y0, vb['x'] + vb['width'] * fx, vb['y'] + vb['height'] * .45)
    verif(len(L(B)['cartes']) == 3, '360 : trois photos glissées du bac')
    pan = ev(B, "() => !document.querySelector('.lg-fleche.d').hidden")
    if pan:
        ox = ev(B, "() => document.querySelector('.lg-monde').style.transform")
        B.wait_for_timeout(300); toucher(B, '.lg-fleche.d')
        B.wait_for_timeout(450)
        if ev(B, "() => document.querySelector('.lg-monde').style.transform") == ox:
            bb = B.locator('.lg-fleche.d').bounding_box(); print('  DEBUG flèche', bb, ev(B, f"() => {{ var e = document.elementFromPoint({bb['x'] + bb['width'] / 2}, {bb['y'] + bb['height'] / 2}); return [e && e.outerHTML.slice(0, 100), M.UI.modal && M.UI.modal.type]; }}"))
            B.screenshot(path=f'{OUT}/debug-fleche.png')
        verif(ev(B, "() => document.querySelector('.lg-monde').style.transform") != ox, '360 : la flèche › fait glisser le tableau')
        toucher(B, '.lg-fleche.g'); B.wait_for_timeout(450)
    toucher(B, carte('pnj:odette')); toucher(B, carte('pnj:melusine')); toucher(B, carte('pnj:melusine'))
    B.screenshot(path=f'{OUT}/liege-360.png')
    B.click('[data-act=onglet][data-o=carnet]'); B.wait_for_timeout(250)
    B.click('[data-act=carnet-pnj][data-id=odette]'); B.wait_for_timeout(200)
    verif(ev(B, "() => document.documentElement.scrollWidth <= innerWidth"), '360 : Carnet sans défilement de côté')
    B.screenshot(path=f'{OUT}/carnet-360.png', full_page=True)
    ctx.close()
    # ================= 1280×800, à la souris =================
    B, ctx = creer(b, 1280, 800, False)
    m = mesure(B); print('  mesures 1280 :', m)
    verif(abs(m['bas'] - m['nav']) <= 2 and m['sw'] <= m['vw'] and m['sh'] <= m['vh'] + 2, '1280×800 : plein écran, sans défilement de page')
    vb = B.locator('#liege-ici .lg-vue').bounding_box()
    pos = [('pnj:gaspard', .15, .3), ('pnj:tim', .4, .55), ('pnj:odette', .62, .3), ('lieu:chene', .85, .5), ('lieu:toits', .3, .75)]
    for k, fx, fy in pos:
        x0, y0 = centre(B, bac(k)); souris(B, x0, y0, vb['x'] + vb['width'] * fx, vb['y'] + vb['height'] * fy)
    verif(len(L(B)['cartes']) == 5, '1280 : cinq photos glissées à la souris')
    B.click(carte('pnj:tim')); B.click(carte('pnj:tim')); B.click(carte('pnj:tim')); B.click(carte('pnj:odette'))
    B.click('[data-lg=bobine]'); B.click(carte('pnj:tim')); B.click(carte('lieu:chene'))
    B.click('[data-lg=bobine]'); B.click(carte('pnj:gaspard')); B.click(carte('pnj:odette'))
    verif(len(L(B)['fils']) == 2 and L(B)['cartes']['pnj:tim']['s'] == 3, '1280 : couleurs et fils à la souris')
    x0, y0 = centre(B, carte('lieu:toits')); bb = B.locator('#liege-ici .lg-bac').bounding_box()
    souris(B, x0, y0, bb['x'] + bb['width'] / 2, bb['y'] + bb['height'] / 2)
    verif('lieu:toits' not in L(B)['cartes'], '1280 : remettre une photo au bac à la souris')
    B.screenshot(path=f'{OUT}/liege-1280.png')
    kk = zoom(B); kb = bornes(B); vb = B.locator('#liege-ici .lg-vue').bounding_box()
    B.mouse.move(vb['x'] + vb['width'] / 2, vb['y'] + vb['height'] / 2); B.keyboard.down('Control'); B.mouse.wheel(0, 300); B.keyboard.up('Control'); B.wait_for_timeout(300)
    dc = decor(B)
    verif(abs(kk - kb['kmax']) < 0.002 and abs(zoom(B) - kb['kmin']) < 0.002 and min(dc['cadre']) >= 8 and dc['mur'], f'1280 : Ctrl + molette dézoome jusqu\'à voir tout le cadre, avec du mur autour ({kk:.3f} → {zoom(B):.3f}, marges {[round(x) for x in dc["cadre"]]})')
    B.mouse.move(vb['x'] + vb['width'] / 2, vb['y'] + vb['height'] / 2); B.keyboard.down('Control'); B.mouse.wheel(0, -600); B.keyboard.up('Control'); B.wait_for_timeout(300)
    verif(abs(zoom(B) - kk) < 0.002, f'1280 : en zoomant, jamais plus gros qu\'avant ({zoom(B):.3f})')
    B.click('[data-act=onglet][data-o=carnet]'); B.wait_for_timeout(250)
    B.screenshot(path=f'{OUT}/carnet-1280.png', full_page=True)
    verif(ev(B, "() => window.__voix") == 0, '1280 : aucune voix ne part toute seule')
    # ================= Tablette en hauteur (820×1180) : zoom aux doigts et à la molette =================
    B, ctx = creer(b, 820, 1180, True); cdp = ctx.new_cdp_session(B)
    vb = B.locator('#liege-ici .lg-vue').bounding_box()
    for k, fx, fy in [('pnj:gaspard', .15, .3), ('pnj:tim', .4, .6), ('pnj:odette', .7, .3), ('lieu:chene', .9, .55), ('lieu:mairie', .25, .8)]:
        x0, y0 = centre(B, bac(k)); glisser(B, cdp, x0, y0, vb['x'] + vb['width'] * fx, vb['y'] + vb['height'] * fy)
    toucher(B, carte('pnj:tim')); toucher(B, carte('pnj:tim')); toucher(B, carte('pnj:tim')); toucher(B, carte('pnj:odette'))
    toucher(B, '[data-lg=bobine]'); toucher(B, carte('pnj:tim')); toucher(B, carte('lieu:chene'))
    B.screenshot(path=f'{OUT}/liege-tablette.png')
    kb = bornes(B); k0 = zoom(B); avant = L(B)
    pincer(B, cdp, vb['x'] + vb['width'] / 2, vb['y'] + vb['height'] * .9, 300, 60)
    verif(zoom(B) < k0 - 0.05 and L(B) == avant, f'Tablette : pincer rapetisse le tableau ({k0:.3f} → {zoom(B):.3f}) sans rien changer aux photos')
    B.screenshot(path=f'{OUT}/liege-tablette-zoom.png')
    k1 = zoom(B); B.mouse.move(vb['x'] + vb['width'] / 2, vb['y'] + vb['height'] / 2); B.keyboard.down('Control'); B.mouse.wheel(0, -300); B.keyboard.up('Control'); B.wait_for_timeout(300)
    verif(zoom(B) > k1, f'Tablette : Ctrl + molette zoome ({k1:.3f} → {zoom(B):.3f})')
    ctx.close()
    # ================= Le Carnet du Pisteur : 📜 Mon fil d'aventure (360 et 1280) =================
    for w, h, t in [(360, 740, True), (1280, 800, False)]:
        Pi, ctx = creer(b, w, h, t, 'Pisteur', 'pisteur')
        Pi.evaluate("() => { M.P().actions = 9; }")
        act(Pi, 'explorer', {'id': 'mairie'})
        for pt in ['massif', 'fenetre', 'gouttiere']: act(Pi, 'point', {'l': 'mairie', 'id': pt}); Pi.wait_for_timeout(150); fermer(Pi)
        Pi.click('[data-act=onglet][data-o=carnet]'); Pi.wait_for_timeout(300)
        verif(Pi.locator('.cn-fil > li').count() == 4 and Pi.locator('.cn-gens, .cn-indices').count() == 0 and Pi.locator('.cn-ev-obj .b-code').count() == 1, f'{w} : Carnet du Pisteur = missions + fil d\'aventure (4 entrées, le code du fil), sans visages')
        verif(ev(Pi, "() => document.documentElement.scrollWidth <= innerWidth"), f'{w} : fil d\'aventure sans défilement de côté')
        Pi.screenshot(path=f'{OUT}/pisteur-fil-{w}.png', full_page=True)
        verif(ev(Pi, "() => window.__voix") == 0, f'{w} : Pisteur, aucune voix toute seule')
        ctx.close()
    print('ERREURS :', erreurs)
    print('ÉCHECS :', echecs)
    b.close()
