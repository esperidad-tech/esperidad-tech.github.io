"""Banc d'essai : « Superposer les plans » et « La grille de déduction » (mj-sage-plans.js).
Usage : python3 test/sage-plans/essai.py [nom_du_test ...]
Lance build.py, copie dist/salle-mini-jeux.html et dist/index.html dans test/sage-plans/dist-test/
(d'autres ateliers reconstruisent dist/ en même temps), puis teste ces copies.
Écrit test/sage-plans/resultats.json et des captures dans test/sage-plans/captures/."""
import os, sys, json, math, time, shutil, subprocess
from playwright.sync_api import sync_playwright

ICI = os.path.dirname(os.path.abspath(__file__))
JEU = os.path.abspath(os.path.join(ICI, '..', '..'))
COPIE = os.path.join(ICI, 'dist-test')
SALLE = 'file://' + os.path.join(COPIE, 'salle-mini-jeux.html')
INDEX = 'file://' + os.path.join(COPIE, 'index.html')
def construire():
    subprocess.run([sys.executable, os.path.join(JEU, 'build.py')], check=True, cwd=JEU, stdout=subprocess.DEVNULL)
    os.makedirs(COPIE, exist_ok=True)
    for f in ('salle-mini-jeux.html', 'index.html'):
        shutil.copy(os.path.join(JEU, 'dist', f), os.path.join(COPIE, f))
        with open(os.path.join(COPIE, f), encoding='utf-8') as fh:
            assert 'mj-sage-plans.js' in fh.read(), f + ' : mj-sage-plans.js absent du build'
CAPT = os.path.join(ICI, 'captures')
os.makedirs(CAPT, exist_ok=True)
TAILLES = {'tel': (390, 844), 'tab': (800, 1280), 'pay': (1280, 800)}
IGNORER = ('ERR_TUNNEL_CONNECTION_FAILED', 'fonts.g', 'ERR_NAME_NOT_RESOLVED', 'ERR_INTERNET_DISCONNECTED', 'net::ERR_')

AIDE_JS = r'''
window.__lancer = function(type, n, mods, extra, direct){
  var plein = document.getElementById('test-plein');
  if(!plein){ plein = document.createElement('div'); plein.id = 'test-plein'; plein.style.cssText = 'position:fixed;inset:0;z-index:200;background:#080a19;display:flex;justify-content:center;padding:8px'; document.body.appendChild(plein); }
  if(window.__partie){ try{ window.__partie.arreter(); }catch(e){} }
  plein.innerHTML = '<div class="sl-cadre" style="height:100%;max-width:820px;width:100%;display:flex"></div>';
  var params = MJ.reglages(type, n, mods || {});
  if(extra) Object.keys(extra).forEach(function(k){ params[k] = extra[k]; });
  window.__fins = [];
  if(direct){
    /* appel direct de def.jouer : on compte les appels à fin */
    var cadre = document.createElement('div'); cadre.className = 'mj mj-' + type; cadre.innerHTML = '<div class="mj-scene"><div class="mj-zone"></div></div>';
    plein.firstChild.appendChild(cadre);
    window.__partie = MJ.TYPES[type].jouer(cadre.querySelector('.mj-zone'), params, function(res){ window.__fins.push(res); });
  } else {
    window.__partie = MJ.lancer(plein.firstChild, type, params, function(res){ window.__fins.push(res); }, {sansIntro:true});
  }
  return JSON.parse(JSON.stringify(params, function(k, v){ return k === 'lignes' ? undefined : v; }));
};
window.__racine = function(sel){ return document.querySelector('#test-plein ' + sel); };
'''

resultats = {}
def ok(nom, cond, info=''):
    resultats.setdefault(nom, []).append({'ok': bool(cond), 'info': info})
    print(('  ✓ ' if cond else '  ✗ ') + nom + (' — ' + str(info) if info else ''))
    return cond

def nouvelle_page(b, taille='tab', touch=False, url=SALLE):
    w, h = TAILLES[taille] if isinstance(taille, str) else taille
    ctx = b.new_context(viewport={'width': w, 'height': h}, has_touch=touch, device_scale_factor=1)
    pg = ctx.new_page()
    errs = []
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and not any(x in m.text for x in IGNORER) else None)
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
    pg.goto(url)
    pg.add_script_tag(content=AIDE_JS)
    return ctx, pg, errs

def etat(pg):
    return pg.evaluate("() => __racine('.mjp').__test.etat()")

def attendre_pret_grille(pg, t=20):
    pg.wait_for_function("() => { const r = __racine('.mjg'); return r && r.dataset.pret === '1'; }", timeout=t * 1000)

# ---------------------------------------------------------------- PLANS
def t_plans_exact(b):
    ctx, pg, errs = nouvelle_page(b)
    p = pg.evaluate("() => __lancer('plans', 5, {}, null, true)")
    pg.wait_for_timeout(300)
    e0 = etat(pg)
    ok('plans: départ décalé (erreur > 4×tolérance)', e0['erreur'] > 4 * p['tolerance'], 'erreur %.1f tol %.1f' % (e0['erreur'], p['tolerance']))
    pg.evaluate("() => __racine('.mjp').__test.poser({s:1, th:0, tx:0, ty:0})")
    pg.wait_for_function("() => __fins.length > 0", timeout=8000)
    fins = pg.evaluate("() => __fins")
    ok('plans: transformation exacte → gagné', fins[0]['reussi'] is True, fins[0].get('detail'))
    pg.wait_for_timeout(600)
    ok('plans: fin appelée une seule fois', len(pg.evaluate("() => __fins")) == 1)
    ok('plans: classe gagne + secret visible', pg.evaluate("() => __racine('.mjp').classList.contains('gagne') && !!__racine('.sec-part.vu')"))
    ctx.close(); return errs

def t_plans_faux(b):
    ctx, pg, errs = nouvelle_page(b)
    p = pg.evaluate("() => __lancer('plans', 5, {}, null, true)")
    tol = p['tolerance']
    # juste hors tolérance mais dans l'aimant : l'aimant ramène à la solution au lâcher
    d_aimant = tol * (1 + (p['aimant'] - 1) / 2)
    pg.evaluate("(d) => { const t = __racine('.mjp').__test; t.poser({s:1, th:0, tx:d, ty:0}); }", d_aimant)
    pg.wait_for_timeout(1500)
    ok('plans: hors tolérance (sans lâcher) → pas gagné', len(pg.evaluate("() => __fins")) == 0 and not etat(pg)['termine'])
    pg.evaluate("() => __racine('.mjp').__test.lacher()")
    pg.wait_for_function("() => __fins.length > 0", timeout=8000)
    ok('plans: lâché tout près → l\'aimant aligne et c\'est gagné', pg.evaluate("() => __fins[0].reussi") is True)
    # mauvaise position franche
    pg.evaluate("() => __lancer('plans', 5, {}, null, true)")
    pg.evaluate("(d) => { const t = __racine('.mjp').__test; t.poser({s:1.08, th:4, tx:d, ty:-d}); t.lacher(); }", tol * 3)
    pg.wait_for_timeout(2500)
    ok('plans: mauvaise transformation → pas gagné', len(pg.evaluate("() => __fins")) == 0, 'erreur %.1f' % etat(pg)['erreur'])
    pg.evaluate("() => __racine('.mjp').__test.temps(0.4)")
    pg.wait_for_function("() => __fins.length > 0", timeout=6000)
    pg.wait_for_timeout(1200)
    fins = pg.evaluate("() => __fins")
    ok('plans: bougie éteinte → raté, fin une seule fois', len(fins) == 1 and fins[0]['reussi'] is False, fins[0].get('message'))
    # arreter : plus jamais de fin
    pg.evaluate("() => __lancer('plans', 5, {}, null, true)")
    pg.evaluate("() => { __racine('.mjp').__test.temps(0.3); __partie.arreter(); }")
    pg.wait_for_timeout(2000)
    ok('plans: arreter() → fin jamais appelée', len(pg.evaluate("() => __fins")) == 0)
    pg.evaluate("() => __lancer('plans', 5, {}, null, true)")
    pg.evaluate("() => { __racine('.mjp').__test.poser({s:1, th:0, tx:0, ty:0}); }")
    pg.wait_for_function("() => __racine('.mjp.gagne')", timeout=5000)
    pg.evaluate("() => __partie.arreter()")
    pg.wait_for_timeout(3500)
    ok('plans: arreter() pendant la révélation → fin jamais appelée', len(pg.evaluate("() => __fins")) == 0)
    ctx.close(); return errs

def toucher(cdp, typ, pts):
    cdp.send('Input.dispatchTouchEvent', {'type': typ, 'touchPoints': [{'x': x, 'y': y, 'id': i, 'radiusX': 4, 'radiusY': 4, 'force': 1} for (i, x, y) in pts]})

def deux_doigts(pg, cdp, cx, cy, d0, d1, a0, a1, etapes=14, pause=16):
    def pts(d, a):
        r = math.radians(a)
        return [(0, cx - math.cos(r) * d / 2, cy - math.sin(r) * d / 2), (1, cx + math.cos(r) * d / 2, cy + math.sin(r) * d / 2)]
    toucher(cdp, 'touchStart', pts(d0, a0))
    for k in range(1, etapes + 1):
        t = k / etapes
        toucher(cdp, 'touchMove', pts(d0 + (d1 - d0) * t, a0 + (a1 - a0) * t))
        pg.wait_for_timeout(pause)
    toucher(cdp, 'touchEnd', [])

def t_plans_gestes(b):
    ctx, pg, errs = nouvelle_page(b, 'tab', touch=True)
    cdp = ctx.new_cdp_session(pg)
    pg.evaluate("() => __lancer('plans', 7, {}, null, true)")
    pg.wait_for_timeout(400)
    box = pg.evaluate("() => { const r = __racine('.mjp-svg').getBoundingClientRect(); return {x:r.x, y:r.y, w:r.width, h:r.height}; }")
    k = 400 / box['w']
    cx, cy = box['x'] + box['w'] / 2, box['y'] + box['h'] / 2
    pg.evaluate("() => __racine('.mjp').__test.poser({s:1, th:0, tx:0, ty:0})")
    pg.evaluate("() => __racine('.mjp').__test.poser({s:0.8, th:20, tx:-40, ty:30})")
    e0 = etat(pg)
    # un doigt : glisser de 60 px vers la droite, 30 px vers le bas
    toucher(cdp, 'touchStart', [(0, cx, cy)])
    for i in range(1, 11):
        toucher(cdp, 'touchMove', [(0, cx + 6 * i, cy + 3 * i)]); pg.wait_for_timeout(12)
    toucher(cdp, 'touchEnd', [])
    e1 = etat(pg)
    ok('plans: un doigt déplace (tx, ty)', abs(e1['tx'] - e0['tx'] - 60 * k) < 1.5 and abs(e1['ty'] - e0['ty'] - 30 * k) < 1.5 and abs(e1['th'] - e0['th']) < .01,
       'Δ=(%.1f, %.1f) attendu (%.1f, %.1f)' % (e1['tx'] - e0['tx'], e1['ty'] - e0['ty'], 60 * k, 30 * k))
    # deux doigts : pincer (écarter ×1,5)
    deux_doigts(pg, cdp, cx, cy, 160, 240, 0, 0)
    e2 = etat(pg)
    ok('plans: pincer à deux doigts zoome', abs(e2['s'] / e1['s'] - 1.5) < 0.03, 's %.3f → %.3f' % (e1['s'], e2['s']))
    # deux doigts : tourner de 30°
    deux_doigts(pg, cdp, cx, cy, 200, 200, 10, 40)
    e3 = etat(pg)
    ok('plans: tourner à deux doigts', abs((e3['th'] - e2['th']) - 30) < 1.0 and abs(e3['s'] / e2['s'] - 1) < .02, 'θ %.1f → %.1f' % (e2['th'], e3['th']))
    pg.screenshot(path=os.path.join(CAPT, 'gestes-tab.png'))
    # boutons
    avant = etat(pg)
    pg.click('#test-plein [data-rot="1"]'); pg.wait_for_timeout(80)
    pg.click('#test-plein [data-zoom="1"]'); pg.wait_for_timeout(80)
    pg.click('#test-plein [data-dep="1,0"]'); pg.wait_for_timeout(80)
    apres = etat(pg)
    ok('plans: boutons ⟳ + ▶ (petits pas précis)', abs(apres['th'] - avant['th'] - .25) < .01 and abs(apres['s'] / avant['s'] - math.exp(.0025)) < 1e-4,
       'Δθ %.3f°, ×%.4f' % (apres['th'] - avant['th'], apres['s'] / avant['s']))
    # appui long : de plus en plus vite
    btn = pg.query_selector('#test-plein [data-rot="-1"]').bounding_box()
    pg.mouse.move(btn['x'] + btn['width'] / 2, btn['y'] + btn['height'] / 2); pg.mouse.down(); pg.wait_for_timeout(1200); pg.mouse.up()
    long = etat(pg)
    ok('plans: appui long sur ⟲ tourne vite', apres['th'] - long['th'] > 6, 'Δθ %.1f°' % (apres['th'] - long['th']))
    # réglette de rotation
    pg.evaluate("() => { const r = __racine('[data-range=\"rot\"]'); r.value = '12.5'; r.dispatchEvent(new Event('input', {bubbles:true})); r.dispatchEvent(new Event('change', {bubbles:true})); }")
    ok('plans: réglette de rotation', abs(etat(pg)['th'] - 12.5) < .01, 'θ = %.2f' % etat(pg)['th'])
    pg.evaluate("() => { const r = __racine('[data-range=\"zoom\"]'); r.value = '0.25'; r.dispatchEvent(new Event('input', {bubbles:true})); }")
    ok('plans: réglette de zoom', abs(etat(pg)['s'] - 2 ** .25) < .001, 's = %.3f' % etat(pg)['s'])
    # souris : glisser et molette
    pg.evaluate("() => __racine('.mjp').__test.poser({s:1, th:0, tx:30, ty:30})")
    pg.mouse.move(cx, cy); pg.mouse.down(); pg.mouse.move(cx - 20, cy - 10, steps=5); pg.mouse.up()
    m1 = etat(pg)
    pg.mouse.move(cx, cy); pg.mouse.wheel(0, -100); pg.wait_for_timeout(100)
    m2 = etat(pg)
    ok('plans: souris (glisser + molette)', abs(m1['tx'] - (30 - 20 * k)) < 1 and m2['s'] > 1.05, 'tx %.1f s %.3f' % (m1['tx'], m2['s']))
    # geste complet jusqu'à la victoire, au doigt seulement (niveau 5 : un seul calque, rotation et zoom)
    pg.evaluate("() => __lancer('plans', 5, {}, null, true)")
    pg.wait_for_timeout(300)
    pg.evaluate("() => __racine('.mjp').__test.poser({s:1/1.2, th:-15, tx:0, ty:0})")
    deux_doigts(pg, cdp, cx, cy, 150, 180, 0, 15, etapes=20)
    pg.wait_for_function("() => __fins.length > 0", timeout=6000)
    ok('plans: aligné au doigt (pincer + tourner) → gagné', pg.evaluate("() => __fins[0].reussi") is True)
    ctx.close(); return errs

def t_plans_multi(b):
    ctx, pg, errs = nouvelle_page(b)
    p = pg.evaluate("() => __lancer('plans', 10, {}, null, true)")
    t = pg.evaluate("() => { const t = __racine('.mjp').__test; return {couches:t.couches, feuilles:t.feuilles}; }")
    ok('plans n=10: trois calques', t['couches'] == 3 and p['couches'] == 3, t['feuilles'])
    ok('plans n=10: parchemins brûlés, au moins 3 repères visibles chacun', all(f['brule'] and f['visibles'] >= 3 for f in t['feuilles']))
    departs = []
    for j in range(3):
        e = etat(pg)
        ok('plans n=10: calque %d actif' % (j + 1), e['k'] == j)
        departs.append((round(e['s'], 3), round(e['th'], 1), round(e['tx'], 1), round(e['ty'], 1)))
        pg.evaluate("() => __racine('.mjp').__test.poser({s:1, th:0, tx:0, ty:0})")
        if j == 0:
            pg.wait_for_function("() => __racine('.mjp').__test.etat().k === 1 && !__racine('.mjp').__test.etat().pause", timeout=6000)
            pg.wait_for_timeout(200)
            pg.screenshot(path=os.path.join(CAPT, 'multicouche-tab.png'))
            ok('plans n=10: après le 1er calque, pas encore gagné', len(pg.evaluate("() => __fins")) == 0 and pg.evaluate("() => __racine('.sec-part.vu') !== null"))
        elif j == 1:
            pg.wait_for_function("() => __racine('.mjp').__test.etat().k === 2 && !__racine('.mjp').__test.etat().pause", timeout=6000)
    ok('plans n=10: chaque calque a son propre décalage', len(set(departs)) == 3, departs)
    pg.wait_for_function("() => __racine('.mjp.gagne')", timeout=6000)
    pg.wait_for_timeout(1500)
    pg.screenshot(path=os.path.join(CAPT, 'revelation-tab.png'))
    pg.wait_for_function("() => __fins.length > 0", timeout=6000)
    ok('plans n=10: les trois calques posés → gagné', pg.evaluate("() => __fins[0].reussi") is True)
    ctx.close(); return errs

def t_plans_aides(b):
    ctx, pg, errs = nouvelle_page(b, 'tab', touch=True)
    cdp = ctx.new_cdp_session(pg)
    for essai in range(3):
        p = pg.evaluate("() => __lancer('plans', 9, {echelle:1}, null, true)")
        e = etat(pg)
        ok('plans aide « echelle »: taille déjà juste et bloquée', abs(e['s'] - 1) < 1e-9 and p['echelleBloquee'], 's=%.3f θ=%.1f' % (e['s'], e['th']))
    ok('plans aide « echelle »: commandes de zoom remplacées par 🔒', pg.evaluate("() => !__racine('[data-zoom]') && !!__racine('.mjp-reg.verrou')"))
    box = pg.evaluate("() => { const r = __racine('.mjp-svg').getBoundingClientRect(); return {x:r.x, y:r.y, w:r.width, h:r.height}; }")
    cx, cy = box['x'] + box['w'] / 2, box['y'] + box['h'] / 2
    e0 = etat(pg)
    deux_doigts(pg, cdp, cx, cy, 150, 250, 0, 20)
    e1 = etat(pg)
    ok('plans aide « echelle »: le pincement ne change pas la taille, la rotation marche', abs(e1['s'] - 1) < 1e-9 and abs(e1['th'] - e0['th'] - 20) < 1, 's=%.3f Δθ=%.1f' % (e1['s'], e1['th'] - e0['th']))
    p = pg.evaluate("() => __lancer('plans', 9, {rotation:1}, null, true)")
    e = etat(pg)
    ok('plans aide « rotation »: rotation déjà juste et bloquée', abs(e['th']) < 1e-9 and p['rotationBloquee'] and pg.evaluate("() => !__racine('[data-rot]')"))
    deux_doigts(pg, cdp, cx, cy, 160, 200, 0, 35)
    e1 = etat(pg)
    ok('plans aide « rotation »: torsion sans effet, zoom oui', abs(e1['th']) < 1e-9 and abs(e1['s'] / e['s'] - 1.25) < .03, 'θ=%.2f s×%.3f' % (e1['th'], e1['s'] / e['s']))
    p2 = pg.evaluate("() => __lancer('plans', 9, {rotation:1, echelle:1}, null, true)")
    e = etat(pg)
    ok('plans: les deux aides → il ne reste qu\'à glisser', abs(e['th']) < 1e-9 and abs(e['s'] - 1) < 1e-9)
    p3 = pg.evaluate("() => __lancer('plans', 9, {aide:2, zone:1.5, temps:4}, null, true)")
    p0 = pg.evaluate("() => MJ.reglages('plans', 9, {})")
    ok('plans aides zone/aide/temps: tolérance ×1,5, aimant fort, 2 repères montrés, +20 s',
       abs(p3['tolerance'] / p0['tolerance'] - 1.5) < 1e-6 and p3['aimant'] == 2.5 and p3['temps'] == p0['temps'] + 20 and
       pg.evaluate("() => document.querySelectorAll('#test-plein .mjp-aide-base .aide-anneau').length") == 2)
    pg.screenshot(path=os.path.join(CAPT, 'aide-reperes-tab.png'))
    ctx.close(); return errs

def t_plans_enquete(b):
    ctx, pg, errs = nouvelle_page(b, 'tab', url=INDEX)
    pg.add_script_tag(content=AIDE_JS)
    params = pg.evaluate("() => ENQUETES[3].pages.find(p => p.id === 'plan').params")
    pg.evaluate("(x) => __lancer('plans', 5, {}, x, true)", params)
    t = pg.evaluate("() => { const t = __racine('.mjp').__test; return {carte:t.carte, secret:t.secret}; }")
    ok('e3 « Les vieux plans du moulin » → carte moulin, secret sous les meules', t == {'carte': 'moulin', 'secret': 'meules'}, t)
    pg.evaluate("() => __racine('.mjp').__test.poser({s:1, th:0, tx:0, ty:0})")
    pg.wait_for_function("() => __fins.length > 0", timeout=8000)
    pg.screenshot(path=os.path.join(CAPT, 'e3-meules.png'))
    ok('e3: gagné, le secret est « la cave sous les meules »', 'cave sous les meules' in pg.evaluate("() => __fins[0].detail").lower())
    # ancien paramètre seul (passage) : toujours compris
    pg.evaluate("() => __lancer('plans', 5, {}, {passage:'la cave sous les meules'}, true)")
    ok('ancien params {passage} → carte du moulin', pg.evaluate("() => __racine('.mjp').__test.carte") == 'moulin')
    ctx.close(); return errs

# ---------------------------------------------------------------- GRILLE
VERIF_JS = r'''
(n) => {
  const G = MJ.grilleLogique;
  /* sémantique indépendante : lit les indices structurés sur la solution décodée */
  function verifSem(E){
    const M = E.M, s = E.sol, h = (p, c, i) => s[G.cel(M, c, p, i)] === 1;
    const k = M.pers.length;
    const pos = (c, p) => M.cats[c].items.findIndex((it, i) => h(p, c, i));
    const qui = (c, i) => [...Array(k).keys()].filter(p => h(p, c, i));
    const suj = (q, x) => x.p !== undefined ? x.p : qui(x.c, x.i)[0];
    return E.indices.every(q => {
      switch(q.t){
        case 'est': case 'pasfaux': return h(q.p, q.c, q.i);
        case 'nest': case 'contre': return !h(q.p, q.c, q.i);
        case 'nini': return !h(q.p, q.c, q.i[0]) && !h(q.p, q.c, q.i[1]);
        case 'nini_p': return !h(q.p[0], q.c, q.i) && !h(q.p[1], q.c, q.i);
        case 'ou': return M.cats[q.c].mode === 'un' ? (h(q.p, q.c, q.i[0]) || h(q.p, q.c, q.i[1])) : (h(q.p, q.c, q.i[0]) !== h(q.p, q.c, q.i[1]));
        case 'ou_p': return M.cats[q.c].mode === 'un' ? (h(q.p[0], q.c, q.i) || h(q.p[1], q.c, q.i)) : (h(q.p[0], q.c, q.i) !== h(q.p[1], q.c, q.i));
        case 'meme': return qui(q.c1, q.i1).every(p => h(p, q.c2, q.i2) === (q.s !== false));
        case 'si': { const a = h(q.a.p, q.a.c, q.a.i) === q.a.s, b = h(q.b.p, q.b.c, q.b.i) === q.b.s; return !a || b; }
        case 'soit': { const a = h(q.a.p, q.a.c, q.a.i) === q.a.s, b = h(q.b.p, q.b.c, q.b.i) === q.b.s; return a !== b; }
        case 'compte': return qui(q.c, q.i).length === q.n;
        case 'rcompte': return M.cats[q.c].items.filter((it, i) => h(q.p, q.c, i)).length === q.n;
        case 'croise': { const part = M.cats[q.c].items.some((it, i) => h(q.p, q.c, i) && h(q.q, q.c, i)); return q.neg ? !part : part; }
        case 'apres': {
          const a = suj(q, q.a), b = suj(q, q.b); if(a === b) return !!q.neg;
          const ja = pos(q.c, a), jb = pos(q.c, b);
          const v = q.rel === 'juste' ? ja === jb + 1 : q.rel === 'justeAvant' ? ja + 1 === jb : q.rel === 'apres' ? ja > jb : ja < jb;
          return q.neg ? !v : v;
        }
      }
      return false;
    });
  }
  return verifSem;
}
'''

def t_grille_200(b):
    ctx, pg, errs = nouvelle_page(b)
    pg.evaluate("() => { window.__verifSem = (" + VERIF_JS + ")(); }")
    niveaux = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    stats = {}
    total_ok = 0
    t0 = time.time()
    for j in range(200):
        n = niveaux[j % 10]
        pg.evaluate("(n) => __lancer('grille', n, {}, null, true)", n)
        attendre_pret_grille(pg)
        r = pg.evaluate(r'''() => {
          const t = __racine('.mjg').__test, E = t.E, G = MJ.grilleLogique;
          const sols = G.compter(E.M, E.indices, 3);
          const unique = sols.length === 1 && !sols.coupe && sols[0].every((x, j) => x === E.sol[j]);
          const sem = __verifSem(E);
          /* le robot entre la solution en touchant les cases : vide → ✗ → ✓ */
          E.sol.forEach((v, x) => { if(v === 1){ const b = __racine('.mjg-case[data-x="' + x + '"]'); b.click(); b.click(); } });
          __racine('.mjg-valider').click();
          return {unique, sem, gagne: __racine('.mjg').classList.contains('gagne'), nInd: E.indices.length, k: E.M.pers.length, cats: E.M.cats.length,
                  multi: E.M.cats.some(C => C.mode === 'multi'), types: E.indices.map(q => q.t)};
        }''')
        s = stats.setdefault(n, {'n': 0, 'ok': 0, 'indices': [], 'k': r['k'], 'cats': r['cats'], 'multi': r['multi'], 'types': {}})
        s['n'] += 1; s['indices'].append(r['nInd'])
        for ty in r['types']: s['types'][ty] = s['types'].get(ty, 0) + 1
        if r['unique'] and r['sem'] and r['gagne']:
            s['ok'] += 1; total_ok += 1
        else:
            print('    échec', n, r)
        if j % 20 == 19:
            pg.wait_for_function("() => __fins.length > 0", timeout=5000)
            assert pg.evaluate("() => __fins.length === 1 && __fins[0].reussi === true")
    ok('grille: 200 énigmes générées (n=1…10) : solution unique, indices vrais, le robot gagne', total_ok == 200, '%d/200 en %.0f s' % (total_ok, time.time() - t0))
    resultats['grille_courbe'] = {str(n): {'personnes': s['k'], 'categories': s['cats'] + 1, 'multi': s['multi'], 'indices_min': min(s['indices']),
                                           'indices_med': sorted(s['indices'])[len(s['indices']) // 2], 'indices_max': max(s['indices']), 'types': s['types']} for n, s in stats.items()}
    for n, s in sorted(stats.items()):
        print('    n=%d: %d pers., %d catégories%s, indices %d–%d (méd. %d)' % (n, s['k'], s['cats'] + 1, ' (lieux multiples)' if s['multi'] else '', min(s['indices']), max(s['indices']), sorted(s['indices'])[len(s['indices']) // 2]))
    ctx.close(); return errs

def entrer(pg, cases):
    pg.evaluate("(xs) => xs.forEach(x => { const b = __racine('.mjg-case[data-x=\"' + x + '\"]'); b.click(); b.click(); })", cases)

def t_grille_coeurs(b):
    ctx, pg, errs = nouvelle_page(b)
    pg.evaluate("() => __lancer('grille', 5, {}, null, true)")
    attendre_pret_grille(pg)
    r = pg.evaluate(r'''() => {
      const t = __racine('.mjg').__test, E = t.E, M = E.M, G = MJ.grilleLogique;
      /* une réponse complète mais fausse : deux personnes échangent leur objet */
      const faux = Array.from(E.sol), c = M.cats.findIndex(C => C.mode === 'un');
      const i0 = M.cats[c].items.findIndex((it, i) => faux[G.cel(M, c, 0, i)] === 1), i1 = M.cats[c].items.findIndex((it, i) => faux[G.cel(M, c, 1, i)] === 1);
      faux[G.cel(M, c, 0, i0)] = 0; faux[G.cel(M, c, 1, i1)] = 0; faux[G.cel(M, c, 0, i1)] = 1; faux[G.cel(M, c, 1, i0)] = 1;
      return {faux: faux.map((v, x) => v ? x : -1).filter(x => x >= 0), coeurs: t.coeurs()};
    }''')
    c0 = r['coeurs']
    # incomplet : pas de cœur perdu
    pg.click('#test-plein .mjg-valider')
    ok('grille: valider une grille incomplète ne coûte pas de cœur', pg.evaluate("() => __racine('.mjg').__test.coeurs()") == c0, pg.inner_text('#test-plein .mjg-message'))
    entrer(pg, r['faux'])
    pg.click('#test-plein .mjg-valider')
    pg.wait_for_timeout(300)
    c1 = pg.evaluate("() => __racine('.mjg').__test.coeurs()")
    ok('grille: une mauvaise réponse coûte un cœur', c1 == c0 - 1, '%d → %d' % (c0, c1))
    pg.screenshot(path=os.path.join(CAPT, 'coeur-perdu.png'))
    for _ in range(c1):
        pg.click('#test-plein .mjg-valider'); pg.wait_for_timeout(150)
    pg.wait_for_function("() => __fins.length > 0", timeout=5000)
    pg.wait_for_timeout(500)
    fins = pg.evaluate("() => __fins")
    ok('grille: plus de cœurs → raté, fin une seule fois', len(fins) == 1 and fins[0]['reussi'] is False)
    # mod erreurs : +cœurs
    p = pg.evaluate("() => __lancer('grille', 10, {erreurs:2}, null, true)")
    p0 = pg.evaluate("() => MJ.reglages('grille', 10, {})")
    ok('grille mod « erreurs »: +2 cœurs', p['coeurs'] == p0['coeurs'] + 2, '%d → %d' % (p0['coeurs'], p['coeurs']))
    # arreter → jamais de fin
    pg.evaluate("() => __lancer('grille', 3, {}, null, true)")
    attendre_pret_grille(pg)
    pg.evaluate("() => { const E = __racine('.mjg').__test.E; E.sol.forEach((v, x) => { if(v){ const b = __racine('.mjg-case[data-x=\"' + x + '\"]'); b.click(); b.click(); } }); __racine('.mjg-valider').click(); __partie.arreter(); }")
    pg.wait_for_timeout(2500)
    ok('grille: arreter() juste après la victoire → fin jamais appelée', len(pg.evaluate("() => __fins")) == 0)
    ctx.close(); return errs

def t_grille_aides(b):
    ctx, pg, errs = nouvelle_page(b)
    pg.evaluate("() => __lancer('grille', 7, {aide:2, revele:true}, null, true)")
    attendre_pret_grille(pg)
    r = pg.evaluate(r'''() => {
      const t = __racine('.mjg').__test, E = t.E, M = E.M, G = MJ.grilleLogique;
      __racine('.mjg-pouce').click();
      const m = __racine('.mjg').__test.marques;
      const poses = m.map((v, x) => v >= 0 ? x : -1).filter(x => x >= 0);
      const justes = poses.every(x => m[x] === E.sol[x]);
      return {poses: poses.length, justes, msg: __racine('.mjg-message').textContent, reste: __racine('.mjg-pouce b').textContent};
    }''')
    ok('grille aide: 💡 révèle une déduction juste (et ses croix)', r['poses'] >= 1 and r['justes'], r['msg'] + ' / ' + r['reste'])
    r2 = pg.evaluate(r'''() => {
      const t = __racine('.mjg').__test, E = t.E, M = E.M, G = MJ.grilleLogique;
      /* une ✓ fausse dans une catégorie « un » : croix automatiques + contradiction visible */
      let x = -1; for(let y = 0; y < M.N; y++){ const d = G.decode(M, y); if(M.cats[d.c].mode === 'un' && E.sol[y] === 0 && t.marques[y] === -1){ x = y; break; } }
      const b = __racine('.mjg-case[data-x="' + x + '"]'); b.click(); b.click();
      const d = G.decode(M, x), m = __racine('.mjg').__test.marques;
      const ligne = M.cats[d.c].items.map((it, i) => m[G.cel(M, d.c, d.p, i)]);
      return {ligne, conflit: document.querySelectorAll('#test-plein .mjg-case.conflit, #test-plein .mjg-ind.faux').length};
    }''')
    ok('grille aide: croix automatiques autour d\'une ✓', r2['ligne'].count(1) == 1 and r2['ligne'].count(0) == len(r2['ligne']) - 1, r2['ligne'])
    # révèle : forcer une contradiction visible (deux ✓ sur une même ligne « un » sans croix auto)
    pg.evaluate("() => __lancer('grille', 4, {revele:true}, null, true)")
    attendre_pret_grille(pg)
    n = pg.evaluate(r'''() => {
      const t = __racine('.mjg').__test, M = t.E.M, G = MJ.grilleLogique;
      [G.cel(M, 0, 0, 0), G.cel(M, 0, 0, 1)].forEach(x => { const b = __racine('.mjg-case[data-x="' + x + '"]'); b.click(); b.click(); });
      return document.querySelectorAll('#test-plein .mjg-case.conflit').length;
    }''')
    ok('grille mod « revele »: les contradictions s\'allument', n >= 2, '%d cases en rouge' % n)
    pg.evaluate("() => __lancer('grille', 4, {}, null, true)")
    attendre_pret_grille(pg)
    n2 = pg.evaluate(r'''() => { const t = __racine('.mjg').__test, M = t.E.M, G = MJ.grilleLogique;
      [G.cel(M, 0, 0, 0), G.cel(M, 0, 0, 1)].forEach(x => { const b = __racine('.mjg-case[data-x="' + x + '"]'); b.click(); b.click(); });
      return document.querySelectorAll('#test-plein .mjg-case.conflit').length + document.querySelectorAll('#test-plein .mjg-case.x').length; }''')
    ok('grille sans aide: ni croix automatiques ni contradictions montrées', n2 == 0)
    # barrer un indice
    pg.click('#test-plein .mjg-ind-btn')
    ok('grille: toucher un indice le barre', pg.evaluate("() => __racine('.mjg-ind').classList.contains('barre')"))
    ctx.close(); return errs

def t_grille_fixe(b):
    ctx, pg, errs = nouvelle_page(b, 'tab', url=INDEX)
    pg.add_script_tag(content=AIDE_JS)
    params = pg.evaluate("() => ENQUETES[2].bonus.find(x => x.id === 'casse').params")
    # écran d'intro : les réglages décrivent l'énigme fournie (4 personnes, 9 indices)
    intro = pg.evaluate(r'''(x) => { const plein = document.createElement('div'); plein.id = 'intro-test'; plein.style.cssText = 'position:fixed;inset:0;z-index:300;display:flex';
      document.body.appendChild(plein); const p = MJ.reglages('grille', 4, {}); Object.keys(x).forEach(k => p[k] = x[k]);
      const partie = MJ.lancer(plein, 'grille', p, function(){}, {});
      const t = plein.querySelector('.mj-reglages').innerText + ' | ' + plein.querySelector('.mj-consigne').innerText; partie.arreter(); plein.remove(); return t; }''', params)
    ok('e2: l\'intro décrit l\'énigme fournie (4 personnes, 9 indices, consigne du maire)', '9' in intro and 'Corbeau' in intro, intro.replace('\n', ' ')[:140])
    pg.evaluate("(x) => __lancer('grille', 4, {}, x, false)", params)
    attendre_pret_grille(pg)
    r = pg.evaluate(r'''() => {
      const t = __racine('.mjg').__test, E = t.E, G = MJ.grilleLogique;
      const sols = G.compter(E.M, E.indices, 3);
      const minimal = E.indices.every(q => G.compter(E.M, E.indices.filter(x => x !== q), 2).length > 1);
      return {fixe: !!E.fixe, n: E.indices.length, cats: E.M.cats.map(C => C.id), unique: sols.length === 1 && sols[0].every((x, j) => x === E.sol[j]), minimal,
              textes: E.indices.map(q => q.texte)};
    }''')
    ok('e2 « Le casse-tête du maire »: énigme fixe 4 personnes × lieu/objet/moment, 9 indices', r['fixe'] and r['n'] == 9 and r['cats'] == ['lieu', 'objet', 'moment'], r['cats'])
    ok('e2: solution unique et chaque indice nécessaire', r['unique'] and r['minimal'])
    ok('e2: aucun indice ne nomme la coupable (Mélusine)', not any('lusine' in t for t in r['textes']))
    pg.screenshot(path=os.path.join(CAPT, 'e2-casse-tab.png'))
    pg.evaluate("() => { const E = __racine('.mjg').__test.E; E.sol.forEach((v, x) => { if(v){ const b = __racine('.mjg-case[data-x=\"' + x + '\"]'); b.click(); b.click(); } }); __racine('.mjg-valider').click(); }")
    pg.wait_for_selector('#test-plein .mj-resultat.ok', timeout=5000)
    det = pg.inner_text('#test-plein .mj-resultat')
    ok('e2: réussie → confirme un indice (lettres sans timbre) sans donner la solution', 'timbre' in det and 'lusine' not in det, det.replace('\n', ' ')[:120])
    pg.click('#test-plein .mj-continuer')
    fins = pg.evaluate("() => __fins")
    ok('e2: résultat transmis au moteur (reussi, note)', len(fins) == 1 and fins[0]['reussi'] and 'timbre' in (fins[0].get('note') or ''))
    # ancien format (chaînes) : toujours compris
    ancien = {'personnes': ['Victor', 'Iris', 'Gaspard'], 'lieux': ['la poste', 'le jardin', 'le fournil'],
              'indices': ['Victor trie les lettres.', 'Iris ne travaille pas au fournil.', 'Gaspard a toujours chaud.'],
              'solution': {'Victor': 'la poste', 'Iris': 'le jardin', 'Gaspard': 'le fournil'}}
    pg.evaluate("(x) => __lancer('grille', 4, {}, x, true)", ancien)
    attendre_pret_grille(pg)
    pg.evaluate("() => { const E = __racine('.mjg').__test.E; E.sol.forEach((v, x) => { if(v){ const b = __racine('.mjg-case[data-x=\"' + x + '\"]'); b.click(); b.click(); } }); __racine('.mjg-valider').click(); }")
    pg.wait_for_function("() => __fins.length > 0", timeout=5000)
    ok('ancien format de params (textes) : jouable et gagnable', pg.evaluate("() => __fins[0].reussi") is True)
    ctx.close(); return errs

# ---------------------------------------------------------------- TAILLES, CONSOLE, DÉMOS
def t_tailles(b):
    tous = []
    for nom, (w, h) in TAILLES.items():
        for jeu, niv in (('plans', 3), ('plans', 10), ('grille', 3), ('grille', 10)):
            ctx = b.new_context(viewport={'width': w, 'height': h}, has_touch=True)
            pg = ctx.new_page(); errs = []
            pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and not any(x in m.text for x in IGNORER) else None)
            pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
            pg.goto(SALLE)
            pg.click('[data-niv="%d"]' % niv)
            pg.click('[data-jeu="%s"]' % jeu)
            pg.wait_for_timeout(1200)
            pg.screenshot(path=os.path.join(CAPT, '%s-%d-%s-intro.png' % (jeu, niv, nom)))
            pg.click('.mj-go')
            if jeu == 'grille':
                pg.wait_for_selector('.mjg[data-pret="1"]', timeout=20000)
            pg.wait_for_timeout(700)
            # tout tient dans le cadre .mj, sans défilement horizontal
            mesure = pg.evaluate('''(jeu) => {
              const mj = document.querySelector('.mj'), r = mj.getBoundingClientRect();
              const root = document.querySelector(jeu === 'plans' ? '.mjp' : '.mjg');
              const sel = jeu === 'plans' ? '.mjp-carte, .mjp-b, .mjp-range, .mjp-reg' : '.mjg-case, .mjg-valider, .mjg-onglet';
              const hors = [...document.querySelectorAll(sel)].filter(e => { const q = e.getBoundingClientRect(); if(!q.width) return false;
                 return q.left < r.left - 1 || q.right > r.right + 1 || (jeu === 'plans' && (q.top < r.top - 1 || q.bottom > r.bottom + 1)); }).length;
              const petites = [...document.querySelectorAll(jeu === 'plans' ? '.mjp-b' : '.mjg-case:not(.cache)')].filter(e => { const q = e.getBoundingClientRect(); return q.width && (q.height < 44 || q.width < 38); }).length;
              return {hors, petites, scrollX: document.documentElement.scrollWidth > innerWidth + 1, carte: jeu === 'plans' ? document.querySelector('.mjp-carte').getBoundingClientRect().width : 0};
            }''', jeu)
            ok('%s n=%d à %dx%d : tient dans le cadre, cibles assez grandes' % (jeu, niv, w, h), mesure['hors'] == 0 and mesure['petites'] == 0 and not mesure['scrollX'], mesure)
            # un peu d'interaction
            if jeu == 'plans':
                box = pg.query_selector('.mjp-svg').bounding_box()
                pg.mouse.move(box['x'] + box['width'] / 2, box['y'] + box['height'] / 2); pg.mouse.down()
                pg.mouse.move(box['x'] + box['width'] / 2 + 30, box['y'] + box['height'] / 2 + 20, steps=4); pg.mouse.up()
                pg.click('.mjp-b.droite')
                if pg.query_selector('[data-rot="1"]'): pg.click('[data-rot="1"]')
            else:
                cs = pg.query_selector_all('.mjg-case:not(.cache)')
                for c in cs[:3]: c.click()
                if pg.query_selector('.mjg.onglets .mjg-onglet:not(.on)'): pg.click('.mjg.onglets .mjg-onglet:not(.on)')
                pg.click('.mjg-ind-btn')
            pg.wait_for_timeout(300)
            pg.screenshot(path=os.path.join(CAPT, '%s-%d-%s.png' % (jeu, niv, nom)))
            ok('%s n=%d à %dx%d : aucune erreur console' % (jeu, niv, w, h), not errs, errs[:3])
            tous += errs
            ctx.close()
    return tous

def t_demos(b):
    ctx, pg, errs = nouvelle_page(b)
    for jeu in ('plans', 'grille'):
        pg.goto(SALLE)
        pg.click('[data-niv="4"]'); pg.click('[data-jeu="%s"]' % jeu)
        pg.wait_for_timeout(2600)
        pg.screenshot(path=os.path.join(CAPT, 'demo-%s.png' % jeu))
        ok('démo %s affichée' % jeu, pg.evaluate("() => !!document.querySelector('.mj-demo .mjsp-demo') && !document.querySelector('.mj-demo').hidden"))
    ctx.close(); return errs

TESTS = {
    'plans_exact': t_plans_exact, 'plans_faux': t_plans_faux, 'plans_gestes': t_plans_gestes, 'plans_multi': t_plans_multi,
    'plans_aides': t_plans_aides, 'plans_enquete': t_plans_enquete,
    'grille_200': t_grille_200, 'grille_coeurs': t_grille_coeurs, 'grille_aides': t_grille_aides, 'grille_fixe': t_grille_fixe,
    'tailles': t_tailles, 'demos': t_demos,
}

if __name__ == '__main__':
    choix = sys.argv[1:] or list(TESTS)
    construire()
    erreurs_console = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        for nom in choix:
            print('▶', nom)
            try:
                erreurs_console += TESTS[nom](b) or []
            except Exception as e:
                ok(nom + ' (exception)', False, repr(e)[:300])
        b.close()
    ok('aucune erreur console dans tous les tests', not erreurs_console, erreurs_console[:5])
    n_ok = sum(1 for k, v in resultats.items() if isinstance(v, list) for x in v if x['ok'])
    n_ko = sum(1 for k, v in resultats.items() if isinstance(v, list) for x in v if not x['ok'])
    print('\n%d vérifications réussies, %d ratées' % (n_ok, n_ko))
    with open(os.path.join(ICI, 'resultats.json'), 'w', encoding='utf-8') as f:
        json.dump(resultats, f, ensure_ascii=False, indent=1)
    sys.exit(1 if n_ko else 0)
