"""Les banderoles de la fête, le tir à l'arc vu de face (mj-visee.js) : le robot joue dans la salle des mini-jeux, puis dans le jeu.
1. la salle, sur une tablette couchée : l'accueil en images (le film, le 🔊, le bouton jaune) ; la place et ses cinq anneaux
   (chacun son rond jaune, assez gros pour un doigt, et son vent : une force et un sens) ; on touche un anneau : la vue de tir,
   les confettis qui passent dans le sens du vent, d'autant plus vite qu'il est fort ; un doigt posé en haut ne fait rien, un doigt
   posé en bas bande l'arc et on s'approche un peu ; le curseur naît à côté de l'anneau, suit le doigt avec du retard, et tremble
   tout seul ; lever le doigt tire ; dans le trou (la flèche passe derrière l'anneau et retombe), dans le bois, à côté ; le minuteur
   tire tout seul ; le vent compte (viser en plein milieu ne suffit pas) ; les cinq anneaux : « La place est décorée ! » ;
2. les niveaux : du 1 au 10 l'anneau rapetisse ; le vent va de 1 à 3 au niveau 1, de 1 à 4 ensuite, de 1 à 12 au niveau 10 ;
3. trop de flèches perdues : la partie s'arrête ;
4. un téléphone debout, une tablette debout, un téléphone couché : tout tient dans l'écran, on y tire ;
5. le jeu (index.html) : le mini-jeu lancé par le moteur, en plein écran, la pause (le minuteur s'arrête), la fin.
Le robot vise sans trembler (v.tremble(0)), sauf quand il vérifie le tremblement.
   BRUMEVAL_DIST=<dossier construit> python3 tools/visee.py"""
import sys, os, json, math
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist'))
SALLE = 'file://' + os.path.join(DIST, 'salle-mini-jeux.html') + '#jeu=visee&n='
JEU = 'file://' + os.path.join(DIST, 'index.html')
PHOTOS = os.path.join(ICI, '..', 'test')
erreurs, echecs = [], []

def verifier(cond, quoi):
    print('  ✓' if cond else '  ✗', quoi)
    if not cond: echecs.append(quoi)
def page(b, w, h):
    pg = b.new_context(viewport={'width': w, 'height': h}, has_touch=False).new_page(); pg.set_default_timeout(8000)
    pg.on('console', lambda m: erreurs.append(m.text) if m.type == 'error' and 'net::' not in m.text and 'fonts' not in m.text and 'ERR_TUNNEL' not in m.text else None)
    pg.on('pageerror', lambda e: erreurs.append(f'PAGEERROR {e}'))
    return pg
def V(pg, expr): return pg.evaluate("() => { var v = document.querySelector('.vs').__visee; return " + expr + "; }")
def etat(pg): return V(pg, 'v.etat()')
def scene(pg): return pg.evaluate("() => { var r = document.querySelector('.vs').getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; }")
def attendre(pg, e, ms=6000):
    for _ in range(ms // 100):
        if etat(pg) == e: return True
        pg.wait_for_timeout(100)
    return False
def lancer(pg, tremble=0):
    """le bouton jaune de l'accueil ; le bras du robot ne tremble pas, sauf si on le demande"""
    pg.click('.mj-go'); pg.wait_for_timeout(700); V(pg, 'v.tremble(%s)' % tremble)
def libre(pg): return V(pg, 'v.anneaux.filter(function(a){ return !a.fait; })[0].i')
def choisir(pg, i):
    pg.click('.vs-cible[data-i="%d"]' % i); return attendre(pg, 'vise')
def poser(pg):
    """pose le doigt en bas de l'écran : l'arc se bande ; rend l'endroit du doigt"""
    r, m = scene(pg), V(pg, 'v.mesures()'); x0, y0 = r[0] + m['W'] / 2, r[1] + m['zone'] + 40
    pg.mouse.move(x0, y0); pg.mouse.down(); pg.wait_for_timeout(450)
    return x0, y0
def amener(pg, x0, y0, ex=0, ey=0, compter_le_vent=True):
    """glisse le doigt pour que la flèche arrive à (ex, ey) unités du milieu de l'anneau (v.viser dit où mettre le curseur) ; rend l'endroit du doigt"""
    c, but = V(pg, 'v.curseur()'), V(pg, 'v.viser(%f, %f, %s)' % (ex, ey, 'false' if compter_le_vent else 'true'))
    dx, dy = but[0] - c['bx'], but[1] - c['by']
    for s in range(1, 11): pg.mouse.move(x0 + dx * s / 10, y0 + dy * s / 10); pg.wait_for_timeout(20)
    pg.wait_for_timeout(1900)   # le curseur a de l'inertie : on le laisse arriver
    return x0 + dx, y0 + dy
def tirer(pg, ex=0, ey=0, compter_le_vent=True):
    """un tir complet sur l'anneau visé ; rend (anneaux faits, flèches restantes) une fois revenu sur la place (ou à la fin)"""
    x0, y0 = poser(pg); amener(pg, x0, y0, ex, ey, compter_le_vent); pg.mouse.up()
    for _ in range(80):
        pg.wait_for_timeout(100)
        if etat(pg) in ('large', 'fin'): break
    m = V(pg, 'v.mesures()'); return len(m['faits']), m['fleches']
DEDANS = """() => { var s = document.querySelector('.vs').getBoundingClientRect(), d = document.documentElement, hors = [];
  [].forEach.call(document.querySelectorAll('.vs-cible, .vs-etiq, .vs-hud > *'), function(e){ var r = e.getBoundingClientRect(); if(r.width && (r.left < s.left - 1 || r.right > s.right + 1 || r.top < s.top - 1 || r.bottom > s.bottom + 1)) hors.push(e.className); });
  return {hors:hors, defile:d.scrollWidth > innerWidth + 1 || d.scrollHeight > innerHeight + 1, sw:s.width, sh:s.height, bas:s.bottom, h:innerHeight}; }"""
# où sont les confettis du vent (le milieu de chacun)
CONF = """() => [].map.call(document.querySelectorAll('.vs-souffle i'), function(e){ var m = /translate3d\\(([-\\d.]+)px, ?([-\\d.]+)px/.exec(e.style.transform); return m ? [+m[1], +m[2]] : null; })"""
def vitesse_confettis(pg, ms=160):
    """la vitesse des confettis, en pixels par seconde : (le long du vent, en travers) ; la médiane, sans ceux qui viennent de rentrer par l'autre bord"""
    i, a = V(pg, 'v.mesures().actif'), pg.evaluate(CONF); pg.wait_for_timeout(ms); b = pg.evaluate(CONF)
    va = V(pg, 'v.anneaux[%d].va' % i); ca, sa = math.cos(va), math.sin(va)
    l = sorted(((q[0] - p[0]) * ca + (q[1] - p[1]) * sa, abs(-(q[0] - p[0]) * sa + (q[1] - p[1]) * ca)) for p, q in zip(a, b) if p and q and math.hypot(q[0] - p[0], q[1] - p[1]) < 600)
    return l[len(l) // 2][0] * 1000 / ms, sorted(x[1] for x in l)[len(l) // 2] * 1000 / ms
# la flèche passée derrière l'anneau : est-elle dessinée, et à quelle hauteur ?
DERRIERE = """() => { var g = document.querySelector('.vs-fx-fond g'); if(!g || g.style.display === 'none') return null; var b = g.querySelector('.vs-f-fut').getBBox(); return b.width + b.height > 0 ? b.y + b.height / 2 : null; }"""

with sync_playwright() as p:
    b = p.chromium.launch()
    # ---------------------------------------------------------------- 1. la salle, tablette couchée
    print('1. la salle, sur une tablette couchée (niveau 5)')
    pg = page(b, 1180, 820); pg.goto(SALLE + '5'); pg.wait_for_timeout(700)
    verifier(pg.locator('.vsd').count() >= 1 and pg.locator('.vsd .vs-souffle i').count() > 10, 'l\'accueil montre le film d\'explication, avec les confettis du vent')
    verifier(pg.locator('.mj-btn-lire, .mj-lire-consigne').count() >= 1, 'la phrase de l\'accueil a son 🔊')
    coul = pg.evaluate("() => { var c = getComputedStyle(document.querySelector('.mj-go')); return [c.backgroundImage + c.backgroundColor, c.color]; }")
    verifier('rgb(26' in coul[1] or 'rgb(0, 0, 0)' in coul[1] or 'rgb(2' in coul[1] or 'rgb(3' in coul[1] or 'rgb(1' in coul[1], f'le bouton pour lancer est jaune à texte sombre {coul[1]}')
    verifier(not pg.evaluate("() => /^\\s*Touche/.test(document.querySelector('.mj-accueil, .mj').innerText)"), 'la phrase ne commence pas par « Touche »')
    pg.screenshot(path=os.path.join(PHOTOS, 'visee-accueil.png'))
    lancer(pg)
    verifier(etat(pg) == 'large' and pg.locator('.vs-cible').count() == 5, 'la place : cinq anneaux à toucher')
    t = pg.evaluate("() => [].map.call(document.querySelectorAll('.vs-cible'), function(e){ var r = e.getBoundingClientRect(); return Math.min(r.width, r.height); })")
    verifier(min(t) >= 44, f'chaque anneau est assez gros pour un doigt ({min(t):.0f} px au plus petit)')
    verifier(pg.locator('.vs-etiq').count() == 5 and pg.locator('.vs-etiq .vs-et-f').count() == 5, 'chaque anneau montre son vent : un chiffre et une petite flèche')
    d = pg.evaluate(DEDANS); verifier(not d['hors'] and d['bas'] <= d['h'] + 1, f'tout tient dans l\'écran {d if d["hors"] else ""}')
    m = V(pg, 'v.mesures()'); verifier(m['fleches'] == 7 and V(pg, 'v.p.anneaux') == 5, 'sept flèches pour cinq anneaux')
    vents = V(pg, 'v.anneaux.map(function(a){ return [a.vent, a.va]; })'); forces = [v[0] for v in vents]
    verifier(all(1 <= f <= 4 for f in forces) and len({round(v[1], 2) for v in vents}) == 5, f'chaque anneau a son vent : une force de 1 à 4, un sens à lui {[(v[0], round(math.degrees(v[1]))) for v in vents]}')
    pg.screenshot(path=os.path.join(PHOTOS, 'visee-place.png'))
    # on touche un anneau : la vue de tir, les confettis de son vent
    fort, faible = forces.index(max(forces)), forces.index(min(forces))
    i = fort; verifier(choisir(pg, i), 'toucher un anneau : on le vise de près')
    verifier(pg.locator('.vs-vent b').inner_text().strip() == str(forces[i]) and pg.locator('.vs-vent .vs-vent-d').count() == 1, 'le vent de cet anneau est écrit au-dessus, avec la flèche de son sens')
    verifier(pg.locator('.vs-souffle i').count() >= 40 and float(pg.evaluate("() => getComputedStyle(document.querySelector('.vs-souffle')).opacity")) > .9, 'des confettis passent derrière l\'anneau')
    sV = m['sV']; v1, t1 = vitesse_confettis(pg)
    verifier(v1 > 0 and abs(v1 - forces[i] * 26 * sV) < .25 * forces[i] * 26 * sV and t1 < .35 * v1 + 25, f'ils vont dans le sens du vent, à la vitesse de sa force (force {forces[i]} : {v1:.0f} px par seconde)')
    verifier(pg.evaluate("() => { var f = document.querySelector('.vs-fl .vs-f-fut'); return document.querySelector('.vs-fl').style.display !== 'none' && f.getAttribute('d').length > 10 && !document.querySelector('.vs-fl .vs-f-pl').getAttribute('d'); }"), 'sur l\'arc, on ne voit que le bout de la flèche (pas les plumes)')
    r, m = scene(pg), V(pg, 'v.mesures()')
    pg.mouse.move(r[0] + m['C'][0], r[1] + m['C'][1]); pg.mouse.down(); pg.wait_for_timeout(250)
    verifier(etat(pg) == 'vise', 'un doigt posé sur l\'anneau ne fait rien : on ne touche pas la cible')
    pg.mouse.up(); pg.wait_for_timeout(100)
    x0, y0 = poser(pg)
    verifier(etat(pg) == 'bande', 'un doigt posé en bas : l\'arc se bande')
    verifier(abs(V(pg, 'v.mesures().zoom') - 1.12) < .01, 'et on s\'approche un peu de l\'anneau')
    c = V(pg, 'v.curseur()'); ecart = ((c['x'] - m['C'][0]) ** 2 + (c['y'] - m['C'][1]) ** 2) ** .5
    verifier(ecart > 20 and 0 < c['x'] < m['W'] and 0 < c['y'] < m['H'], f'le curseur naît à côté de l\'anneau, dans l\'écran (à {ecart:.0f} px)')
    # l'inertie : le doigt saute de 120 px, le curseur n'y est pas tout de suite, mais il y arrive
    x0, y0 = x0 + 120, y0 - 40; pg.mouse.move(x0, y0); pg.wait_for_timeout(120); c1 = V(pg, 'v.curseur()')
    verifier(abs(c1['bx'] - c['bx'] - 120) < 2 and abs(c1['x'] - c['x']) < 60, f'le curseur suit le doigt avec du retard (il a fait {c1["x"] - c["x"]:.0f} px sur 120)')
    pg.wait_for_timeout(1700); c2 = V(pg, 'v.curseur()')
    verifier(abs(c2['x'] - c2['bx']) < 6 and abs(c2['y'] - c2['by']) < 6, 'puis il arrive où le doigt l\'attend')
    verifier(2 < c2['reste'] < 4, f'le minuteur tourne autour du curseur (reste {c2["reste"]:.1f} s)')
    pg.screenshot(path=os.path.join(PHOTOS, 'visee-tir.png'))
    amener(pg, x0, y0); pg.mouse.up(); pg.wait_for_timeout(120)
    verifier(etat(pg) == 'vol', 'lever le doigt : la flèche part')
    pg.wait_for_timeout(300)
    verifier(pg.evaluate("() => { var g = document.querySelector('.vs-fl'); return g.style.display !== 'none' && g.querySelector('.vs-f-pl').getAttribute('d').length > 10 && g.querySelector('.vs-f-tr').getAttribute('d').length > 10; }"), 'en vol, on la voit de derrière : ses plumes, sa traînée blanche')
    pg.screenshot(path=os.path.join(PHOTOS, 'visee-vol.png'))
    attendre(pg, 'impact'); ys = []
    for _ in range(14):
        y = pg.evaluate(DERRIERE); pg.wait_for_timeout(40)
        if y is not None: ys.append(y)
    verifier(len(ys) >= 3 and ys[-1] > ys[0] + 20, f'passée dans l\'anneau, elle continue derrière lui et retombe ({len(ys)} images, {ys[0] if ys else 0:.0f} → {ys[-1] if ys else 0:.0f})')
    attendre(pg, 'large'); m = V(pg, 'v.mesures()')
    verifier(m['faits'] == [i] and m['fleches'] == 6, 'bien visé, vent compris : la flèche passe dans l\'anneau, la banderole y reste')
    verifier(pg.locator('.vs-cible').count() == 4, 'cet anneau-là ne se vise plus')
    # un vent plus faible : des confettis plus lents
    if forces[faible] < forces[fort]:
        choisir(pg, faible); v2, t2 = vitesse_confettis(pg)
        verifier(0 < v2 < v1 * (forces[faible] + .5) / forces[fort], f'un vent plus faible, des confettis plus lents (force {forces[faible]} : {v2:.0f} px par seconde, contre {v1:.0f})')
        # dans le bois, puis à côté
        n, fl = tirer(pg, V(pg, 'v.p.trou + v.p.bois / 2'), 0)
    else:
        choisir(pg, libre(pg)); n, fl = tirer(pg, V(pg, 'v.p.trou + v.p.bois / 2'), 0)
    verifier(n == 1 and fl == 5, 'dans le bois de l\'anneau : flèche perdue')
    j = libre(pg); choisir(pg, j); n, fl = tirer(pg, 0, -V(pg, 'v.p.trou + v.p.bois + 10'))
    verifier(n == 1 and fl == 4, 'à côté de l\'anneau : flèche perdue')
    # le vent compte : un vent assez fort, on vise en plein milieu sans en tenir compte
    forts = [a for a in range(5) if forces[a] * V(pg, 'v.DEV') > V(pg, 'v.p.trou') and not V(pg, 'v.anneaux[%d].fait' % a)]
    if forts:
        choisir(pg, forts[0]); n, fl = tirer(pg, 0, 0, compter_le_vent=False)
        verifier(n == 1, f'viser en plein milieu sans compter le vent (force {forces[forts[0]]}) : raté')
    pg.context.close()
    # le bras tremble ; le minuteur tire tout seul ; puis les cinq anneaux
    print('   le bras qui tremble, le minuteur, puis les cinq anneaux (niveau 3)')
    pg = page(b, 1180, 820); pg.goto(SALLE + '3'); pg.wait_for_timeout(600); lancer(pg, tremble=1)
    choisir(pg, 0); x0, y0 = poser(pg); pg.wait_for_timeout(700); ec = []
    for _ in range(10):
        c = V(pg, 'v.curseur()'); ec.append(math.hypot(c['x'] - c['rx'], c['y'] - c['ry'])); pg.wait_for_timeout(150)
    verifier(max(ec) > 10 and max(ec) - min(ec) > 6, f'le doigt ne bouge pas, mais le curseur dérive tout seul (jusqu\'à {max(ec):.0f} px) : le bras tremble')
    V(pg, 'v.tremble(0)'); pg.wait_for_timeout(100); c = V(pg, 'v.curseur()'); duree = V(pg, 'v.p.duree')
    verifier(abs(c['x'] - c['rx']) < .5 and abs(c['y'] - c['ry']) < .5, '(le robot peut arrêter le tremblement pour viser)')
    verifier(etat(pg) == 'bande' and c['reste'] > 1, f'tant que le minuteur n\'a pas fini, la flèche attend (reste {c["reste"]:.1f} s)')
    pg.wait_for_timeout(int(c['reste'] * 1000) + 500); verifier(etat(pg) in ('vol', 'impact', 'retour'), f'au bout de {duree:.0f} secondes, la flèche part toute seule')
    pg.mouse.up(); attendre(pg, 'large'); verifier(V(pg, 'v.mesures().fleches') == 6, 'et elle compte comme une autre : une flèche de moins')
    n = 0
    while etat(pg) == 'large':
        choisir(pg, libre(pg)); n, fl = tirer(pg)
    verifier(n == 5 and etat(pg) == 'fin', 'les cinq anneaux portent la banderole')
    pg.wait_for_timeout(1500); pg.screenshot(path=os.path.join(PHOTOS, 'visee-fete.png'))
    pg.wait_for_selector('.mj-resultat', timeout=8000); pg.wait_for_timeout(200)
    txt = pg.evaluate("() => { var r = document.querySelector('.mj-resultat'); return r ? r.innerText.replace(/\\s+/g, ' ') : ''; }")
    verifier('La place est décorée' in txt, f'la fin : « La place est décorée ! » ({txt[:40]})')
    # ---------------------------------------------------------------- 2. les niveaux
    print('2. les niveaux')
    regl = pg.evaluate("() => { var l = []; for(var n = 1; n <= 10; n++) l.push(MJ.reglages('visee', n, null, {brut:true})); return l; }")   # le niveau brut, comme dans la salle
    trous, vmax, vmin = [x['trou'] for x in regl], [x['ventMax'] for x in regl], [x['ventMin'] for x in regl]
    verifier(all(trous[k] > trous[k + 1] for k in range(9)) and trous[0] > 2 * trous[9], f'l\'anneau rapetisse du niveau 1 au 10 ({trous[0]:.1f} → {trous[9]:.1f})')
    verifier(vmin == [1] * 10 and vmax == [3] + [4] * 8 + [12], f'le vent : de 1 à 3 au niveau 1, de 1 à 4 ensuite, de 1 à 12 au niveau 10 {vmax}')
    verifier(len({(x['anneaux'], x['fleches'], x['duree']) for x in regl}) == 1, 'rien d\'autre ne change : cinq anneaux, sept flèches, le même minuteur')
    pg.context.close()
    # ---------------------------------------------------------------- 3. trop de flèches perdues
    print('3. trop de flèches perdues (niveau 10)')
    pg = page(b, 1180, 820); pg.goto(SALLE + '10'); pg.wait_for_timeout(600); lancer(pg)
    f10 = V(pg, 'v.anneaux.map(function(a){ return a.vent; })')
    verifier(all(1 <= f <= 12 for f in f10), f'au niveau 10, des vents de 1 à 12 {f10}')
    for k in range(3):
        choisir(pg, 0); n, fl = tirer(pg, 0, -V(pg, 'v.p.trou + v.p.bois + 10'))
    verifier(n == 0 and fl == 4 and etat(pg) == 'fin', 'trois flèches perdues : il n\'en reste plus assez pour cinq anneaux, la partie s\'arrête')
    pg.wait_for_selector('.mj-resultat', timeout=8000); pg.wait_for_timeout(200)
    txt = pg.evaluate("() => { var r = document.querySelector('.mj-resultat'); return r ? r.innerText.replace(/\\s+/g, ' ') : ''; }")
    verifier('flèches' in txt and 'cinq' not in txt and '5 anneaux' in txt, f'la fin le dit ({txt[:70]})')
    pg.context.close()
    # le plus fort des vents, dans les quatre sens : on peut toujours amener le curseur où il faut
    print('   un vent de 12, vers le haut, le bas, la gauche, la droite (niveau 10)')
    pg = page(b, 1180, 820); pg.goto(SALLE + '10'); pg.wait_for_timeout(600); lancer(pg)
    pg.evaluate("() => { var v = document.querySelector('.vs').__visee; [0, Math.PI / 2, Math.PI, -Math.PI / 2].forEach(function(a, i){ var an = v.anneaux[i]; an.vent = 12; an.va = a; an.vx = 12 * Math.cos(a); an.vy = 12 * Math.sin(a); }); }")
    for k, nom in enumerate(['la droite', 'le bas', 'la gauche', 'le haut']):
        choisir(pg, k); n, fl = tirer(pg)
        verifier(n == k + 1, f'vent de 12 vers {nom} : en visant de l\'autre côté, la flèche passe')
        if k == 2: pg.screenshot(path=os.path.join(PHOTOS, 'visee-vent12.png'))
    pg.context.close()
    # ---------------------------------------------------------------- 4. les autres écrans
    print('4. les autres écrans')
    for (w, h, nom) in [(390, 844, 'téléphone debout'), (820, 1180, 'tablette debout'), (844, 390, 'téléphone couché')]:
        pg = page(b, w, h); pg.goto(SALLE + '10'); pg.wait_for_timeout(600); lancer(pg)
        d = pg.evaluate(DEDANS); t = pg.evaluate("() => [].map.call(document.querySelectorAll('.vs-cible'), function(e){ var r = e.getBoundingClientRect(); return Math.min(r.width, r.height); })")
        verifier(not d['hors'] and d['bas'] <= d['h'] + 1 and min(t) >= 44, f'{nom} : tout tient dans l\'écran, les anneaux se touchent au doigt ({min(t):.0f} px) {d["hors"] or ""}')
        # le pire des vents pour cet écran : force 12, vers le bas (il faut viser tout en haut)
        pg.evaluate("() => { var an = document.querySelector('.vs').__visee.anneaux[0]; an.vent = 12; an.va = Math.PI / 2; an.vx = 0; an.vy = 12; }")
        choisir(pg, 0); n, fl = tirer(pg)
        verifier(n == 1 and fl == 6, f'{nom} : on y tire, même contre un vent de 12 vers le bas, la flèche passe')
        pg.screenshot(path=os.path.join(PHOTOS, 'visee-%dx%d.png' % (w, h)))
        pg.context.close()
    # ---------------------------------------------------------------- 5. le jeu
    print('5. le jeu (index.html)')
    pg = page(b, 1180, 820); pg.goto(JEU)
    pg.click('[data-act=creer]'); pg.click('[data-act=crea-role][data-r=pisteur]'); pg.click('[data-act=crea-suite]'); pg.fill('#nom', 'Pisteur'); pg.click('[data-act=crea-fin]')
    pg.evaluate("() => { window.__fin = null; M.lancerMJ('visee', 4, null, {sansPotion:true, niveauFixe:4, titre:'Les banderoles'}, function(res){ window.__fin = res; }); }"); pg.wait_for_timeout(400)
    if pg.locator('#voile [data-act=mj-go]').count(): pg.click('#voile [data-act=mj-go]')
    elif pg.locator('#voile .b-aller').count(): pg.click('#voile .b-aller >> nth=0')
    pg.wait_for_timeout(500)
    verifier(pg.locator('#mj-plein .vsd').count() == 1 and pg.evaluate("() => { var p = document.getElementById('mj-plein'); return p.classList.contains('mj-fixe') && p.classList.contains('mj-large'); }"), 'le moteur ouvre le mini-jeu, en plein écran verrouillé, sur toute la largeur, avec le film')
    lancer(pg)
    verifier(pg.locator('#mj-plein .vs-cible').count() == 5, 'les cinq anneaux')
    d = pg.evaluate(DEDANS); verifier(not d['hors'] and not d['defile'], f'tout tient dans l\'écran {d if d["hors"] or d["defile"] else ""}')
    choisir(pg, 0); n, fl = tirer(pg)
    verifier(n == 1, 'on y joue : un anneau')
    pg.screenshot(path=os.path.join(PHOTOS, 'visee-jeu.png'))
    if pg.locator('.mj-btn-pause').count():
        choisir(pg, 1)
        # (lever le doigt tirerait : pour la pause, le doigt est posé par le programme, et reste posé)
        pg.evaluate("""() => { var s = document.querySelector('.vs'), r = s.getBoundingClientRect(), m = s.__visee.mesures();
          s.dispatchEvent(new PointerEvent('pointerdown', {bubbles:true, pointerId:7, clientX:r.left + m.W / 2, clientY:r.top + m.zone + 40, button:0, isPrimary:true})); }""")
        pg.wait_for_timeout(600); ok = etat(pg) == 'bande'
        pg.click('.mj-btn-pause'); pg.wait_for_timeout(300)
        verifier(ok and pg.evaluate("() => !!M.mjPause"), 'la pause, l\'arc bandé : le mini-jeu se met de côté')
        t0 = V(pg, 'v.curseur().reste'); c0 = pg.evaluate(CONF); pg.wait_for_timeout(1500); t1 = V(pg, 'v.curseur().reste'); c1 = pg.evaluate(CONF)
        verifier(abs(t0 - t1) < .05 and c0 == c1, f'pendant la pause, le minuteur et les confettis s\'arrêtent ({t0:.2f} → {t1:.2f})')
        pg.evaluate("() => M.reprendreMJ()"); pg.wait_for_timeout(2600)
        verifier(pg.evaluate("() => !M.mjPause && !MJT.enPause()") and pg.locator('#mj-plein .vs').count() == 1, 'on reprend (« 3, 2, 1 ») : la place est toujours là')
        for _ in range(90):
            pg.wait_for_timeout(100)
            if etat(pg) in ('large', 'fin'): break
        verifier(etat(pg) == 'large' and V(pg, 'v.mesures().fleches') == 5, 'le minuteur repart et la flèche finit par partir')
    else: verifier(False, 'le bouton pause')
    while etat(pg) == 'large' and V(pg, 'v.mesures().fleches') > 0:
        choisir(pg, libre(pg)); tirer(pg)
    pg.wait_for_timeout(2600); pg.click('.mj-continuer'); pg.wait_for_timeout(400)
    r = pg.evaluate("() => window.__fin")
    verifier(bool(r) and r.get('reussi') is True, 'la fin : réussi')
    verifier(pg.evaluate("() => document.getElementById('mj-plein').hidden"), 'le mini-jeu se referme')
    pg.context.close()
    b.close()
print('\nErreurs JS :', len(erreurs))
for e in erreurs[:12]: print('  ', e[:300])
print('Vérifications ratées :', len(echecs))
for e in echecs: print('  ✗', e)
sys.exit(1 if erreurs or echecs else 0)
