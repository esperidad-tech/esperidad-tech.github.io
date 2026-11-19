"""Enquête 3 : LE VIEUX PLAN D'ODETTE, DANS LA PAGE DU GRAND LIVRE (19 novembre, 11 h 01 ; Bible §13.78) — Playwright, au doigt.
Le Sage, avec le code « Le vieux plan d'Odette » : la page EST le plan (plus de petit dessin, plus de bouton « Regarder le plan de tout
près », plus de fenêtre par-dessus le jeu, plus de textes « étui de cuir », « dans la marge », « le Pisteur a ouvert un passage ») ;
le matin : ni noms, ni titre, ni toiles, ni tombes, ni feu de camp ; une seule note codée (les dalles, N B B N B N) ; un doigt fait
glisser le plan sans tourner la page, deux doigts (ou la molette) l'approchent ; toucher une salle (« l'encre a tant pâli ») ; la pierre
de Tim, prise dans la poche et promenée sur le plan, réveille SON encre (la roue, l'œil) et pas celle de la rune ; la loupe des dalles,
déchiffrée ; la nuit après le départ : les noms ; le code de la rune → la poche → la rune réveille ce qu'il faut prendre dans les salles ;
le coin retrouvé. Tablette (souris) et téléphone (vrais événements tactiles).
   BRUMEVAL_DIST=<dossier construit> python3 tools/e3-vieuxplan.py"""
import sys, os, json
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist')), 'index.html') + '#test'
OUT = os.path.join(ICI, '..', 'test', 'e3-vieuxplan'); os.makedirs(OUT, exist_ok=True)
erreurs, echecs = [], []
TEL = {'width': 390, 'height': 844}
TAB = {'width': 1180, 'height': 820}
PAGE = '#livre-ici .lv-page.on'

def verifier(cond, quoi):
    print('  ✓' if cond else '  ✗', quoi)
    if not cond: echecs.append(quoi)

def shot(pg, nom):
    pg.wait_for_timeout(350); pg.screenshot(path=f'{OUT}/{nom}.png')

def ev(pg, act, data=None):
    pg.evaluate(f"() => {{ M.A['{act}']({{dataset:{json.dumps(data or {})}, closest:function(){{ return null; }}}}); }}"); pg.wait_for_timeout(150)

def texte(pg, sel='#voile'):
    return pg.evaluate(f"() => {{ var e = document.querySelector('{sel}'); return e ? e.innerText.replace(/\\s+/g, ' ') : ''; }}")

def code(pg, cle):
    seq = pg.evaluate(f"() => M.code('{cle}')")
    pg.evaluate("() => { M.UI.modal = null; M.P().onglet = 'code'; M.render(); }"); pg.wait_for_timeout(150)
    for s in seq: ev(pg, 'sym', {'s': s})
    pg.wait_for_timeout(350); t = texte(pg)
    return t

def fermer(pg):
    pg.evaluate("() => { M.UI.modal = null; M.render(); }"); pg.wait_for_timeout(120)

def page(pg, pid):
    pg.evaluate(f"() => {{ M.P().onglet = 'role'; M.UI.modal = null; M.render(); M.livreAller('{pid}', true); }}"); pg.wait_for_timeout(450)
    return texte(pg, PAGE)

def pages(pg):
    return pg.evaluate("() => { M.P().onglet = 'role'; M.UI.modal = null; M.render(); return [].map.call(document.querySelectorAll('#livre-ici .lv-page'), function(x){ return x.dataset.id || ''; }); }")

def sans_son(pg, sel=PAGE):
    """les textes de plus de 3 mots sans leur 🔊"""
    return pg.evaluate(f"""() => [].filter.call(document.querySelectorAll('{sel} .lv-texte, {sel} .vp-faux'), function(p){{ return p.innerText.trim().split(/\\s+/).length > 3 && !p.querySelector('.b-lire'); }}).map(function(p){{ return p.innerText.slice(0, 40); }})""")

def etat(pg):
    return pg.evaluate("() => window.__vp.etat()")

def dit(pg):
    return texte(pg, PAGE + ' .vp-dit')

def debut(b, vue):
    tactile = vue is TEL
    pg = b.new_context(viewport=vue, has_touch=tactile, device_scale_factor=2 if tactile else 1).new_page()
    pg._doigt = tactile
    pg.set_default_timeout(8000)
    pg.on('console', lambda m: erreurs.append(f'{m.text}') if m.type == 'error' and 'net::' not in m.text and 'fonts' not in m.text and 'ERR_TUNNEL' not in m.text else None)
    pg.on('pageerror', lambda e: erreurs.append(f'PAGEERROR {e}'))
    pg.add_init_script("window.BRUMEVAL_SANS_TUTO = true;")
    pg.goto(URL)
    pg.click('[data-act=creer]'); pg.click('[data-act=crea-role][data-r=sage]'); pg.click('[data-act=crea-suite]'); pg.fill('#nom', 'Sage'); pg.click('[data-act=crea-fin]')
    pg.evaluate("() => { M.S.heros.joueur = 'adulte'; M.sauver(); M.UI.ecran = 'reglages'; M.render(); }")
    pg.click('[data-act=mode-test][data-i="3"]'); pg.click('#voile [data-act=confirmer-oui]')
    pg.click('[data-act=nouvelle-enquete]'); pg.click('[data-act=lettre-suite]'); pg.click('[data-act=commencer]'); pg.wait_for_timeout(600)
    pg.evaluate("() => { M.lire = function(){}; M.lireAuto = function(){}; }")
    return pg

# ---- les gestes : de vrais événements (la souris sur la tablette, le doigt sur le téléphone) ----
def cdp(pg):
    if not hasattr(pg, '_cdp'): pg._cdp = pg.context.new_cdp_session(pg)
    return pg._cdp

def trajet(pg, pts, pas=16):
    """Un doigt (ou la souris, bouton enfoncé) qui suit les points (à l'écran)."""
    x0, y0 = pts[0]
    if pg._doigt:
        c = cdp(pg)
        c.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x0, 'y': y0}]})
        for (xa, ya), (xb, yb) in zip(pts, pts[1:]):
            n = max(2, int(((xb - xa) ** 2 + (yb - ya) ** 2) ** .5 / pas))
            for i in range(1, n + 1):
                c.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': xa + (xb - xa) * i / n, 'y': ya + (yb - ya) * i / n}]})
        c.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
    else:
        pg.mouse.move(x0, y0); pg.mouse.down()
        for (xa, ya), (xb, yb) in zip(pts, pts[1:]):
            n = max(2, int(((xb - xa) ** 2 + (yb - ya) ** 2) ** .5 / pas))
            pg.mouse.move(xb, yb, steps=n)
        pg.mouse.up()
    pg.wait_for_timeout(350)

def tap(pg, x, y):
    if pg._doigt: pg.touchscreen.tap(x, y)
    else: pg.mouse.click(x, y)
    pg.wait_for_timeout(300)

def pincer(pg, cx, cy, d0, d1, n=12):
    c = cdp(pg)
    pts = lambda d: [{'x': cx - d / 2, 'y': cy, 'id': 1}, {'x': cx + d / 2, 'y': cy, 'id': 2}]
    c.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': pts(d0)})
    for i in range(1, n + 1):
        c.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': pts(d0 + (d1 - d0) * i / n)})
        pg.wait_for_timeout(16)
    c.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
    pg.wait_for_timeout(400)

def rect(pg, sel):
    return pg.evaluate(f"() => {{ var e = document.querySelector('{sel}'); if(!e) return null; var r = e.getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; }}")

def ecran(pg, x, y):
    """où est ce point du plan, à l'écran (le cadre du plan d'abord ramené à l'écran, comme le ferait le joueur)"""
    pg.evaluate("() => { var e = document.querySelector('#livre-ici .lv-page.on [data-vp]'); if(e) e.scrollIntoView({block:'nearest'}); }"); pg.wait_for_timeout(120)
    e = pg.evaluate(f"() => window.__vp.versEcran({x}, {y})"); return e['x'], e['y']

def promener(pg, pid, encre):
    """Prendre la pierre dans la poche, la porter au-dessus de la note d'encre (la pierre est dessinée au-dessus du doigt : le doigt passe
    74 px plus bas), et la balader en zigzag sur toute la note."""
    n = [e for e in pg.evaluate("() => window.__vp.encres()") if e['id'] == encre][0]; bo = n['b']
    pg.evaluate(f"() => window.__vp.centrer({bo['x'] + bo['w'] / 2}, {bo['y'] + bo['h'] / 2})"); pg.wait_for_timeout(200)
    r = rect(pg, f"{PAGE} .vp-pierre[data-vp-pierre={pid}]")
    pts = [(r[0] + r[2] / 2, r[1] + r[3] / 2)]
    z = etat(pg)['vue']['z']; rangs = max(2, int(bo['h'] * z / 50) + 1)
    for k in range(rangs + 1):
        y = bo['y'] + bo['h'] * k / rangs
        xa, xb = (bo['x'], bo['x'] + bo['w']) if k % 2 == 0 else (bo['x'] + bo['w'], bo['x'])
        for x in (xa, xb):
            sx, sy = ecran(pg, x, y); pts.append((sx, sy + 74))
    trajet(pg, pts)

def lancer(b, vue, nom):
    print(f'— {nom}')
    pg = debut(b, vue)
    # ------------------------------------------------------------------ le matin
    verifier('vieuxplan' not in pages(pg), 'sans le code du Pisteur : pas de vieux plan')
    code(pg, 'obj:vieux_plan'); fermer(pg)
    t = page(pg, 'vieuxplan')
    verifier(pg.locator(PAGE + ' [data-vp]').count() == 1 and pg.locator(PAGE + ' .vp-couche svg.plan-svg').count() == 1, 'la page EST le grand plan')
    verifier(not any(x in t for x in ('étui de cuir', 'marge', 'ne parlent', 'a ouvert le passage', 'voix haute', 'Regarder le plan', 'Refermer')) and pg.locator(PAGE + ' [data-act=ds-plan], ' + PAGE + ' .pp-plan, ' + PAGE + ' .ds-plan-nuit').count() == 0,
             f'plus aucun des textes enlevés, plus de petit dessin, plus de bouton pour dérouler ({t[:80]})')
    verifier(pg.evaluate("() => !document.getElementById('donjon-plan-cadre')"), 'aucune fenêtre par-dessus le jeu')
    svg = pg.evaluate("() => document.querySelector('.vp-couche svg.plan-svg').textContent")
    verifier(not any(x in svg for x in ('galerie', 'Fondateurs', 'réserve', 'bassin', 'canaux')), f'le matin : ni noms, ni titre ({svg[:60]})')
    verifier(pg.locator(PAGE + ' [data-note]').count() == 1 and pg.locator(PAGE + ' [data-note=dalles]').count() == 1, 'une seule note codée : les dalles')
    verifier(pg.locator(PAGE + ' .vp-pierre').count() == 1 and pg.locator(PAGE + ' .vp-pierre[data-vp-pierre=tim].b-guide').count() == 1, 'dans la poche : la pierre de Tim seule, avec le rond jaune')
    verifier(not sans_son(pg), f'chaque texte a son 🔊 ({sans_son(pg)})')
    shot(pg, f'{nom}-matin')
    # deux doigts (la molette) approchent le plan ; un doigt le fait glisser, sans tourner la page
    v1 = etat(pg)['vue']; r = rect(pg, PAGE + ' [data-vp]')
    verifier(r[1] + r[3] < TAB['height'] if not pg._doigt else r[1] + r[3] < TEL['height'], f'le plan est à l\'écran sans faire défiler ({[round(q) for q in r]})')
    if pg._doigt:
        pincer(pg, r[0] + r[2] / 2, r[1] + r[3] / 2, 80, 220)
    else:
        pg.mouse.move(r[0] + r[2] / 2, r[1] + r[3] / 2); pg.mouse.wheel(0, -500); pg.wait_for_timeout(300)
    v2 = etat(pg)['vue']
    verifier(v2['z'] > v1['z'] * 1.3, f'{"deux doigts" if pg._doigt else "la molette"} approchent le plan ({v1["z"]:.2f} → {v2["z"]:.2f})')
    trajet(pg, [(r[0] + r[2] * .7, r[1] + r[3] * .5), (r[0] + r[2] * .3, r[1] + r[3] * .45)])
    v3 = etat(pg)['vue']
    verifier(v3['cx'] > v2['cx'] + 40 and pg.evaluate("() => M.livrePage()") == 'vieuxplan', f'un doigt fait glisser le plan, et la page ne tourne pas ({round(v2["cx"])} → {round(v3["cx"])})')
    pg.locator(PAGE + ' [data-act=vp-zoom][data-z="-1"]').click(); pg.wait_for_timeout(350)
    verifier(etat(pg)['vue']['z'] < v3['z'], 'le bouton － l\'éloigne')
    # toucher une salle : l'encre a pâli
    pg.evaluate("() => window.__vp.centrer(1440, 760)"); pg.wait_for_timeout(250)
    x, y = ecran(pg, 1440, 750); tap(pg, x, y)
    verifier('pâli' in dit(pg) and not sans_son(pg), f'toucher une salle : « L\'encre a tant pâli… » ({dit(pg)[:60]})')
    # toucher une pierre de la poche sans la faire glisser : le conteur dit quoi faire
    pg.locator(PAGE + ' .vp-pierre[data-vp-pierre=tim]').click(); pg.wait_for_timeout(250)
    verifier('glisser' in dit(pg) and 'Touche' not in dit(pg), f'toucher la pierre : « prends-la, et fais-la glisser » ({dit(pg)[:60]})')
    # la pierre de Tim sur l'encre de la rune : rien
    promener(pg, 'tim', 'bourse')
    verifier(etat(pg)['revelees'] == [], 'la pierre de Tim sur l\'encre de la rune : rien n\'apparaît')
    # la pierre de Tim sur la roue : son encre se réveille
    promener(pg, 'tim', 'roue')
    e = etat(pg)
    verifier('roue' in e['revelees'] and pg.evaluate("() => M.P().vus['encre:roue'] === 1") and 'se réveille' in dit(pg) and '3 à droite' in dit(pg), f'la pierre de Tim promenée sur la roue : « L\'encre se réveille : la roue : 3 à droite… » ({dit(pg)[:70]})')
    verifier(pg.evaluate("() => { var g = document.querySelector('.vp-encre[data-encre=roue]'); return !!g && !g.getAttribute('mask'); }") and pg.locator(PAGE + ' .vp-pierre[data-vp-pierre=tim].b-guide').count() == 0, 'la note s\'allume en entier ; plus de rond jaune sur la pierre')
    shot(pg, f'{nom}-roue')
    promener(pg, 'tim', 'oeil')
    verifier('oeil' in etat(pg)['revelees'] and 'œil' in dit(pg), f'et l\'œil ({dit(pg)[:50]})')
    # la loupe des dalles
    nd = pg.evaluate("() => CARTE_DONJON.PLAN.notes.filter(function(n){ return n.id === 'dalles'; })[0]")
    pg.evaluate(f"() => window.__vp.centrer({nd['x']}, {nd['y']})"); pg.wait_for_timeout(250)
    x, y = ecran(pg, nd['x'], nd['y']); tap(pg, x, y)
    verifier(pg.locator(PAGE + ' .vp-loupe').count() == 1 and pg.locator(PAGE + ' .vp-l').count() == 6 and not sans_son(pg), 'toucher la note codée : la loupe, sous le plan (six signes, la grille, des lettres)')
    for l in 'NBBNBX':
        pg.locator(PAGE + f' .vp-clavier [data-l="{l}"]').click(); pg.wait_for_timeout(60)
    verifier(pg.locator(PAGE + ' .vp-faux').count() == 1 and not etat(pg)['lu'] and not sans_son(pg), 'une erreur : « ça ne veut rien dire »')
    pg.locator(PAGE + ' .vp-l[data-i="5"]').click(); pg.locator(PAGE + ' .vp-clavier [data-l="N"]').click(); pg.wait_for_timeout(250)
    verifier(etat(pg)['lu'] == ['dalles'] and pg.locator(PAGE + ' [data-vp].vp-lu-dalles').count() == 1 and 'N B B, N B N' in dit(pg), f'déchiffrée : « N B B, N B N », le crayon l\'écrit sur le plan ({dit(pg)[:50]})')
    pg.locator(PAGE + ' [data-act=vp-loupe-fermer]').click(); pg.wait_for_timeout(200)
    verifier(pg.locator(PAGE + ' .vp-loupe').count() == 0, 'la loupe se referme')
    # tout reste au fil des moments : l'après-midi, la page la garde
    pg.evaluate("() => { M.P().moment = 1; M.sauver(); }")
    page(pg, 'vieuxplan')
    verifier(set(etat(pg)['revelees']) == {'roue', 'oeil'} and etat(pg)['lu'] == ['dalles'] and pg.locator(PAGE + ' [data-vp].vp-jour').count() == 1, 'l\'après-midi : toujours là, toujours sans noms ; ce qui est réveillé le reste')
    # ------------------------------------------------------------------ la nuit
    pg.evaluate("() => { M.P().moment = 2; M.sauver(); }")
    page(pg, 'vieuxplan')
    verifier(pg.locator(PAGE + ' [data-vp].vp-jour').count() == 1, 'la nuit, avant le départ : le plan reste muet')
    code(pg, 'info:on_descend'); fermer(pg)
    page(pg, 'vieuxplan')
    svg = pg.evaluate("() => document.querySelector('.vp-couche svg.plan-svg').textContent")
    verifier(pg.locator(PAGE + ' [data-vp].vp-nuit').count() == 1 and 'galerie' in svg and 'Fondateurs' in svg, 'la nuit, le départ donné : les noms des salles, le titre')
    pg.evaluate("() => window.__vp.centrer(1440, 760)"); pg.wait_for_timeout(250)
    x, y = ecran(pg, 1440, 750); tap(pg, x, y)
    verifier('salle' in dit(pg).lower() and 'rats' in dit(pg), f'toucher une salle : son nom ({dit(pg)[:60]})')
    shot(pg, f'{nom}-nuit')
    verifier(pg.locator(PAGE + ' .vp-pierre[data-vp-pierre=rune]').count() == 0, 'pas encore de pierre de rune')
    t = code(pg, 'donjon:rune:lumiere')
    verifier('Une pierre de rune' in t and 'Promène-la' in t and pg.locator('#voile [data-act=ds-livre][data-id=vieuxplan]').count() == 1, f'le code de la rune : « Promène-la sur le vieux plan » ({t[:60]})')
    pg.locator('#voile [data-act=ds-livre]').click(); pg.wait_for_timeout(500)
    verifier(pg.evaluate("() => M.livrePage()") == 'vieuxplan' and pg.locator(PAGE + ' .vp-pierre[data-vp-pierre=rune].b-guide').count() == 1, 'le Grand Livre s\'ouvre sur le plan ; la pierre de rune est dans la poche, avec le rond jaune')
    promener(pg, 'rune', 'roue')
    verifier(set(etat(pg)['revelees']) == {'roue', 'oeil'}, 'la rune ne réveille pas l\'encre de Tim')
    for k in ('bourse', 'carquois', 'batons'):
        promener(pg, 'rune', k)
        verifier(k in etat(pg)['revelees'], f'la rune réveille « {k} » ({dit(pg)[:60]})')
    shot(pg, f'{nom}-rune')
    # le coin retrouvé
    t = code(pg, 'donjon:page:dechiree')
    verifier('morceau' in t and pg.locator('#voile [data-act=ds-plan]').count() == 1, 'le morceau perdu : « Regarder le plan »')
    pg.locator('#voile [data-act=ds-plan]').click(); pg.wait_for_timeout(500)
    verifier(pg.evaluate("() => M.livrePage()") == 'vieuxplan' and pg.locator(PAGE + ' .vp-coin').count() == 1 and 'recollent' in dit(pg), f'le Grand Livre s\'ouvre sur le plan : le coin est à sa place ({dit(pg)[:50]})')
    pg.evaluate("() => { var P = M.P(); window.__vp.encres().forEach(function(n){ P.vus['encre:' + n.id] = 1; }); M.sauver(); }")
    page(pg, 'vieuxplan'); pg.evaluate("() => window.__vp.centrer(1560, 875, 0.01)")
    shot(pg, f'{nom}-tout')
    pg.context.close()

with sync_playwright() as p:
    b = p.chromium.launch()
    lancer(b, TAB, 'tablette')
    lancer(b, TEL, 'telephone')
    b.close()

print()
for e in erreurs[:12]: print('  !', e)
if echecs or erreurs:
    print(f'✗ {len(echecs)} échec(s), {len(erreurs)} erreur(s)'); sys.exit(1)
print('✓ e3-vieuxplan : tout est bon')
