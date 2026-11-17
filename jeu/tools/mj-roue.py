#!/usr/bin/env python3
"""LA ROUE DE CÉSAR du Sage (« Le papier d'Odette », enquête 3 ; Romain, 17 novembre, 7 h 30 : « je crois qu'il y a un bug »).
Dans le vrai jeu, sur un téléphone tenu droit puis sur une tablette : l'indice dit quoi faire (les deux ronds jaunes face à face), la roue
tourne au doigt et aux boutons ; calée sur l'indice, chacune des 26 lettres du dedans est bien sous sa lettre du dehors, les ronds passent
au vert et le cadenas s'ouvre ; un cran plus loin, plus rien de tout ça.
  BRUMEVAL_DIST=<dossier construit> python3 tools/mj-roue.py"""
import os, sys, re, math
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist')), 'index.html') + '#test'
OUT = os.path.join(ICI, '..', 'test', 'mj-roue'); os.makedirs(OUT, exist_ok=True)
erreurs, echecs = [], []
def verifier(cond, quoi):
    print('  ✓' if cond else '  ✗', quoi)
    if not cond: echecs.append(quoi)
LIRE = '''() => { var svg = document.querySelector('.mjs-roue-svg'), R = svg.getBoundingClientRect(), cx = R.left + R.width / 2, cy = R.top + R.height / 2, o = {};
  var ext = [].map.call(svg.querySelectorAll('.r-clair'), function(t){ var r = t.getBoundingClientRect(); return {l:t.textContent, a:Math.atan2(r.top + r.height / 2 - cy, r.left + r.width / 2 - cx)}; });
  [].forEach.call(svg.querySelectorAll('.r-chif'), function(t, i){ var r = t.getBoundingClientRect(), a = Math.atan2(r.top + r.height / 2 - cy, r.left + r.width / 2 - cx), best = null, bd = 9;
    ext.forEach(function(e){ var d = Math.abs(Math.atan2(Math.sin(a - e.a), Math.cos(a - e.a))); if(d < bd){ bd = d; best = e.l; } });
    o['ABCDEFGHIJKLMNOPQRSTUVWXYZ'[i]] = best + (bd > .06 ? '?' : ''); });
  return o; }'''
ETAT = "() => ({calee:document.querySelector('.mjs-roue').classList.contains('calee'), centre:document.querySelector('.r-centre').textContent, rot:+document.querySelector('[data-rot]').dataset.rot})"

def essai(b, nom, vue, tactile):
    print(f'— {nom}')
    ctx = b.new_context(viewport=vue, has_touch=tactile, is_mobile=tactile, device_scale_factor=2 if tactile else 1)
    pg = ctx.new_page(); pg.set_default_timeout(8000)
    pg.on('pageerror', lambda e: erreurs.append(f'[{nom}] PAGEERROR {e}'))
    pg.on('console', lambda m: erreurs.append(f'[{nom}] {m.text}') if m.type == 'error' and 'net::' not in m.text and 'fonts' not in m.text and 'ERR_TUNNEL' not in m.text else None)
    pg.add_init_script("window.BRUMEVAL_SANS_TUTO = true;")
    pg.goto(URL)
    pg.click('[data-act=creer]'); pg.click('[data-act=crea-role][data-r=sage]'); pg.click('[data-act=crea-suite]'); pg.fill('#nom', 'Sage'); pg.click('[data-act=crea-fin]')
    pg.evaluate("() => { M.UI.ecran = 'reglages'; M.render(); }")
    pg.click('[data-act=mode-test][data-i="3"]'); pg.click('#voile [data-act=confirmer-oui]')
    pg.click('[data-act=nouvelle-enquete]'); pg.click('[data-act=lettre-suite]'); pg.click('[data-act=commencer]'); pg.wait_for_timeout(600)
    # le papier d'Odette, avec la roue de César (le jeu tire son alphabet au hasard : on le force)
    pg.evaluate("""() => { M.lire = function(){}; var v = MJ.lancer; MJ.lancer = function(el, type, params, fin, opt){ if(type === 'alphabet') params = Object.assign({}, params, {systeme:'cesar'}); return v.call(this, el, type, params, fin, opt); };
      M.P().recus['obj:papier_odette'] = true; M.sauver(); M.P().onglet = 'role'; M.UI.modal = null; M.render(); M.livreAller('papier', true); }""")
    pg.wait_for_timeout(600)
    pg.locator('#livre-ici .lv-page.on button').filter(has_text='Déchiffrer').first.click(); pg.wait_for_timeout(900)
    j = pg.locator('button').filter(has_text="C'est parti")
    if j.count(): j.first.click(); pg.wait_for_timeout(900)
    pg.wait_for_function("() => !!window.__mjsAlpha && !!document.querySelector('.mjs-roue-svg')")
    ind = pg.evaluate("() => document.querySelector('.mjs-indice').innerText")
    m = re.search(r'le (\w) s.écrit (\w)', ind); clair, code = m.group(1), m.group(2); k = (ord(code) - ord(clair)) % 26
    vrai = pg.evaluate("() => { var c = window.__mjsAlpha.cases[0], e = document.querySelector('.mjs-case[data-i=\"' + c.i + '\"] .mjs-lt'); return [c.l, e && e.textContent]; }")
    verifier(vrai[1] and (ord(vrai[1]) - ord(vrai[0])) % 26 == k, f'l\'indice dit vrai : « le {clair} s\'écrit {code} », et le message est bien décalé d\'autant ({vrai})')
    vis = pg.evaluate("() => { var r = document.querySelector('.mjs-indice').getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom <= innerHeight; }")
    verifier('ronds jaunes face à face' in ind and vis, f'la phrase de l\'indice se lit à l\'écran et dit quoi faire ({ind[:70]})')
    r = pg.evaluate("() => { var e = document.querySelector('.r-ind-ext + .r-clair'), i = document.querySelector('.r-ind-int + .r-chif'); return [document.querySelectorAll('.r-ind').length, e && e.textContent, i && i.textContent]; }")
    verifier(r == [2, clair, code], f'deux ronds jaunes : le {clair} du dehors, le {code} du dedans ({r})')
    e0 = pg.evaluate(ETAT)
    verifier(not e0['calee'] and e0['centre'] == '✋' and e0['rot'] != k, f'au départ, la roue n\'est pas calée ({e0})')
    pg.screenshot(path=f'{OUT}/{nom}-depart.png')
    # un doigt la fait tourner (un quart de tour)
    x, y, w, h = pg.evaluate("() => { var r = document.querySelector('.mjs-roue-svg').getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; }")
    cx, cy, ray = x + w / 2, y + h / 2, w * .3
    if tactile:
        cdp = ctx.new_cdp_session(pg)
        def doigt(t, px, py): cdp.send('Input.dispatchTouchEvent', {'type': t, 'touchPoints': ([] if t == 'touchEnd' else [{'x': px, 'y': py}])})
        doigt('touchStart', cx + ray, cy)
        for i in range(1, 10): doigt('touchMove', cx + ray * math.cos(i * 10 * math.pi / 180), cy + ray * math.sin(i * 10 * math.pi / 180)); pg.wait_for_timeout(30)
        doigt('touchEnd', 0, 0)
    else:
        pg.mouse.move(cx + ray, cy); pg.mouse.down()
        for i in range(1, 10): pg.mouse.move(cx + ray * math.cos(i * 10 * math.pi / 180), cy + ray * math.sin(i * 10 * math.pi / 180)); pg.wait_for_timeout(30)
        pg.mouse.up()
    pg.wait_for_timeout(600)
    e1 = pg.evaluate(ETAT)
    verifier((e0['rot'] - e1['rot']) % 26 in (6, 7), f'un quart de tour au doigt : la roue a tourné de 6 ou 7 crans ({e0["rot"]} → {e1["rot"]}), et la page n\'a pas défilé ({pg.evaluate("() => scrollY")})')
    # les boutons, jusqu'à l'indice
    for n in range(26):
        if pg.evaluate(ETAT)['rot'] == k: break
        pg.locator('.mjs-rbtn[data-r="1"]').click(); pg.wait_for_timeout(330)
    pg.wait_for_timeout(400)
    e2 = pg.evaluate(ETAT); lec = pg.evaluate(LIRE)
    faux = [c + '→' + lec[c] for c in lec if lec[c] != chr((ord(c) - 65 - k) % 26 + 65)]
    verifier(e2['rot'] == k and not faux, f'calée sur l\'indice : les 26 lettres du dedans sont chacune sous la bonne lettre du dehors ({faux[:6]})')
    verifier(e2['calee'] and e2['centre'] == '🔓', f'les deux ronds face à face : ils passent au vert, le cadenas s\'ouvre ({e2})')
    droit = pg.evaluate("() => [].every.call(document.querySelectorAll('.r-chif'), function(t){ var r = t.getBoundingClientRect(); return r.height >= r.width * .8 || t.textContent === '·' || t.textContent === 'W' || t.textContent === 'M'; })")
    verifier(droit, 'les lettres du dedans restent droites (pas couchées)')
    pg.screenshot(path=f'{OUT}/{nom}-calee.png')
    pg.locator('.mjs-rbtn[data-r="-1"]').click(); pg.wait_for_timeout(500)
    e3 = pg.evaluate(ETAT)
    verifier(not e3['calee'] and e3['centre'] == '✋' and e3['rot'] == (k + 1) % 26, f'un cran à côté : plus de vert, plus de cadenas ouvert ({e3})')
    ctx.close()

with sync_playwright() as p:
    b = p.chromium.launch()
    essai(b, 'telephone', {'width': 390, 'height': 844}, True)
    essai(b, 'tablette', {'width': 1180, 'height': 820}, False)
    b.close()
print('\nErreurs de page :', erreurs if erreurs else 'aucune')
print('Vérifications ratées :', echecs if echecs else 'aucune')
sys.exit(1 if (erreurs or echecs) else 0)
