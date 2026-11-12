"""Les banderoles de la fête, le tir à l'arc vu de face (mj-visee.js) : le robot joue dans la salle des mini-jeux, puis dans le jeu.
1. la salle, sur une tablette couchée : l'accueil en images (le film, le 🔊, le bouton jaune) ; la place et ses cinq anneaux
   (chacun son rond jaune, assez gros pour un doigt, et son vent) ; on touche un anneau : la vue de tir ; un doigt posé en haut ne
   fait rien, un doigt posé en bas bande l'arc ; le curseur naît à côté de l'anneau et suit le doigt avec du retard ; lever le doigt
   tire ; dans le trou, dans le bois, à côté ; le minuteur tire tout seul ; le vent compte (viser en plein milieu ne suffit pas) ;
   les cinq anneaux : « La place est décorée ! » ;
2. les niveaux : du 1 au 10 l'anneau rapetisse et le vent forcit, et rien d'autre ne change ;
3. trop de flèches perdues : la partie s'arrête ;
4. un téléphone debout, une tablette debout, un téléphone couché : tout tient dans l'écran, on y tire ;
5. le jeu (index.html) : le mini-jeu lancé par le moteur, en plein écran, la pause (le minuteur s'arrête), la fin.
   BRUMEVAL_DIST=<dossier construit> python3 tools/visee.py"""
import sys, os, json
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
def libre(pg): return V(pg, 'v.anneaux.filter(function(a){ return !a.fait; })[0].i')
def choisir(pg, i):
    pg.click('.vs-cible[data-i="%d"]' % i); return attendre(pg, 'vise')
def poser(pg):
    """pose le doigt en bas de l'écran : l'arc se bande ; rend l'endroit du doigt"""
    r, m = scene(pg), V(pg, 'v.mesures()'); x0, y0 = r[0] + m['W'] / 2, r[1] + m['zone'] + 40
    pg.mouse.move(x0, y0); pg.mouse.down(); pg.wait_for_timeout(300)
    return x0, y0
def amener(pg, x0, y0, ex=0, ey=0, compter_le_vent=True):
    """glisse le doigt pour que le curseur aille au milieu de l'anneau (moins ce que le vent poussera), décalé de (ex, ey) unités du monde"""
    m, c, i = V(pg, 'v.mesures()'), V(pg, 'v.curseur()'), V(pg, 'v.mesures().actif')
    vent = V(pg, 'v.anneaux[%d].vent' % i) if compter_le_vent else 0
    bx, by = m['C'][0] + (ex - vent * V(pg, 'v.DEV')) * m['sV'], m['C'][1] + ey * m['sV']
    dx, dy = bx - c['bx'], by - c['by']
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

with sync_playwright() as p:
    b = p.chromium.launch()
    # ---------------------------------------------------------------- 1. la salle, tablette couchée
    print('1. la salle, sur une tablette couchée (niveau 5)')
    pg = page(b, 1180, 820); pg.goto(SALLE + '5'); pg.wait_for_timeout(700)
    verifier(pg.locator('.mj-demo .vsd, .vsd').count() >= 1, 'l\'accueil montre le film d\'explication')
    verifier(pg.locator('.mj-btn-lire, .mj-lire-consigne').count() >= 1, 'la phrase de l\'accueil a son 🔊')
    coul = pg.evaluate("() => { var c = getComputedStyle(document.querySelector('.mj-go')); return [c.backgroundImage + c.backgroundColor, c.color]; }")
    verifier('rgb(26' in coul[1] or 'rgb(0, 0, 0)' in coul[1] or 'rgb(2' in coul[1] or 'rgb(3' in coul[1] or 'rgb(1' in coul[1], f'le bouton pour lancer est jaune à texte sombre {coul[1]}')
    verifier(not pg.evaluate("() => /^\\s*Touche/.test(document.querySelector('.mj-accueil, .mj').innerText)"), 'la phrase ne commence pas par « Touche »')
    pg.screenshot(path=os.path.join(PHOTOS, 'visee-accueil.png'))
    pg.click('.mj-go'); pg.wait_for_timeout(700)
    verifier(etat(pg) == 'large' and pg.locator('.vs-cible').count() == 5, 'la place : cinq anneaux à toucher')
    t = pg.evaluate("() => [].map.call(document.querySelectorAll('.vs-cible'), function(e){ var r = e.getBoundingClientRect(); return Math.min(r.width, r.height); })")
    verifier(min(t) >= 44, f'chaque anneau est assez gros pour un doigt ({min(t):.0f} px au plus petit)')
    verifier(pg.locator('.vs-etiq').count() == 5, 'chaque anneau montre son vent')
    d = pg.evaluate(DEDANS); verifier(not d['hors'] and d['bas'] <= d['h'] + 1, f'tout tient dans l\'écran {d if d["hors"] else ""}')
    m = V(pg, 'v.mesures()'); verifier(m['fleches'] == 7 and V(pg, 'v.p.anneaux') == 5, 'sept flèches pour cinq anneaux')
    vents = V(pg, 'v.anneaux.map(function(a){ return a.vent; })')
    verifier(any(v > 0 for v in vents) and any(v < 0 for v in vents), f'le vent ne souffle pas toujours du même côté {vents}')
    pg.screenshot(path=os.path.join(PHOTOS, 'visee-place.png'))
    # on touche un anneau : la vue de tir
    i = libre(pg); verifier(choisir(pg, i), 'toucher un anneau : on le vise de près')
    verifier(pg.locator('.vs-vent b').inner_text().strip() == str(abs(vents[i])), 'le vent de cet anneau est écrit au-dessus')
    r, m = scene(pg), V(pg, 'v.mesures()')
    pg.mouse.move(r[0] + m['C'][0], r[1] + m['C'][1]); pg.mouse.down(); pg.wait_for_timeout(250)
    verifier(etat(pg) == 'vise', 'un doigt posé sur l\'anneau ne fait rien : on ne touche pas la cible')
    pg.mouse.up(); pg.wait_for_timeout(100)
    x0, y0 = poser(pg)
    verifier(etat(pg) == 'bande', 'un doigt posé en bas : l\'arc se bande')
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
    pg.wait_for_timeout(500); pg.screenshot(path=os.path.join(PHOTOS, 'visee-vol.png'))
    attendre(pg, 'large'); m = V(pg, 'v.mesures()')
    verifier(m['faits'] == [i] and m['fleches'] == 6, 'bien visé, vent compris : la flèche passe dans l\'anneau, la banderole y reste')
    verifier(pg.locator('.vs-cible').count() == 4, 'cet anneau-là ne se vise plus')
    # dans le bois, puis à côté
    i = libre(pg); choisir(pg, i)
    n, fl = tirer(pg, V(pg, 'v.p.trou + v.p.bois / 2'), 0)
    verifier(n == 1 and fl == 5, 'dans le bois de l\'anneau : flèche perdue')
    choisir(pg, i); n, fl = tirer(pg, 0, -V(pg, 'v.p.trou + v.p.bois + 10'))
    verifier(n == 1 and fl == 4, 'à côté de l\'anneau : flèche perdue')
    # le vent compte : un fort vent, on vise en plein milieu sans en tenir compte
    forts = [a for a in range(5) if abs(vents[a]) * V(pg, 'v.DEV') > V(pg, 'v.p.trou') and not V(pg, 'v.anneaux[%d].fait' % a)]
    if forts:
        choisir(pg, forts[0]); n, fl = tirer(pg, 0, 0, compter_le_vent=False)
        verifier(n == 1, f'viser en plein milieu sans compter le vent ({vents[forts[0]]}) : raté')
    pg.context.close()
    # le minuteur tire tout seul, puis les cinq anneaux
    print('   le minuteur, puis les cinq anneaux (niveau 3)')
    pg = page(b, 1180, 820); pg.goto(SALLE + '3'); pg.wait_for_timeout(600); pg.click('.mj-go'); pg.wait_for_timeout(700)
    choisir(pg, 0); x0, y0 = poser(pg); amener(pg, x0, y0); duree = V(pg, 'v.p.duree')
    pg.wait_for_timeout(int(duree * 1000) - 2200 - 500); verifier(etat(pg) == 'bande', 'tant que le minuteur n\'a pas fini, la flèche attend')
    pg.wait_for_timeout(900); verifier(etat(pg) in ('vol', 'impact'), f'au bout de {duree:.0f} secondes, la flèche part toute seule')
    pg.mouse.up(); attendre(pg, 'large'); verifier(V(pg, 'v.mesures().faits.length') == 1, 'et elle compte comme une autre')
    for k in range(4):
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
    verifier(all(vmax[k] <= vmax[k + 1] for k in range(9)) and vmax[0] <= 1 and vmax[9] >= 8 and vmin[9] >= 5, f'le vent forcit ({vmin[0]}–{vmax[0]} → {vmin[9]}–{vmax[9]})')
    verifier(len({(x['anneaux'], x['fleches'], x['duree']) for x in regl}) == 1, 'rien d\'autre ne change : cinq anneaux, sept flèches, le même minuteur')
    pg.context.close()
    # ---------------------------------------------------------------- 3. trop de flèches perdues
    print('3. trop de flèches perdues (niveau 10)')
    pg = page(b, 1180, 820); pg.goto(SALLE + '10'); pg.wait_for_timeout(600); pg.click('.mj-go'); pg.wait_for_timeout(700)
    for k in range(3):
        choisir(pg, 0); n, fl = tirer(pg, 0, -V(pg, 'v.p.trou + v.p.bois + 10'))
    verifier(n == 0 and fl == 4 and etat(pg) == 'fin', 'trois flèches perdues : il n\'en reste plus assez pour cinq anneaux, la partie s\'arrête')
    pg.wait_for_selector('.mj-resultat', timeout=8000); pg.wait_for_timeout(200)
    txt = pg.evaluate("() => { var r = document.querySelector('.mj-resultat'); return r ? r.innerText.replace(/\\s+/g, ' ') : ''; }")
    verifier('flèches' in txt and 'cinq' not in txt and '5 anneaux' in txt, f'la fin le dit ({txt[:70]})')
    pg.context.close()
    # ---------------------------------------------------------------- 4. les autres écrans
    print('4. les autres écrans')
    for (w, h, nom) in [(390, 844, 'téléphone debout'), (820, 1180, 'tablette debout'), (844, 390, 'téléphone couché')]:
        pg = page(b, w, h); pg.goto(SALLE + '4'); pg.wait_for_timeout(600); pg.click('.mj-go'); pg.wait_for_timeout(700)
        d = pg.evaluate(DEDANS); t = pg.evaluate("() => [].map.call(document.querySelectorAll('.vs-cible'), function(e){ var r = e.getBoundingClientRect(); return Math.min(r.width, r.height); })")
        verifier(not d['hors'] and d['bas'] <= d['h'] + 1 and min(t) >= 44, f'{nom} : tout tient dans l\'écran, les anneaux se touchent au doigt ({min(t):.0f} px) {d["hors"] or ""}')
        choisir(pg, libre(pg)); n, fl = tirer(pg)
        verifier(n == 1 and fl == 6, f'{nom} : on y tire, la flèche passe')
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
    pg.click('.mj-go'); pg.wait_for_timeout(700)
    verifier(pg.locator('#mj-plein .vs-cible').count() == 5, 'les cinq anneaux')
    d = pg.evaluate(DEDANS); verifier(not d['hors'] and not d['defile'], f'tout tient dans l\'écran {d if d["hors"] or d["defile"] else ""}')
    choisir(pg, 0); x0, y0 = poser(pg); amener(pg, x0, y0)
    if pg.locator('.mj-btn-pause').count():
        t0 = V(pg, 'v.curseur().reste'); pg.mouse.up(); pg.wait_for_timeout(30)
    # (lever le doigt tire : pour la pause, on recommence sur un autre anneau, le doigt posé par le programme)
    attendre(pg, 'large'); verifier(V(pg, 'v.mesures().faits.length') == 1, 'on y joue : un anneau')
    pg.screenshot(path=os.path.join(PHOTOS, 'visee-jeu.png'))
    if pg.locator('.mj-btn-pause').count():
        choisir(pg, 1)
        pg.evaluate("""() => { var s = document.querySelector('.vs'), r = s.getBoundingClientRect(), m = s.__visee.mesures();
          s.dispatchEvent(new PointerEvent('pointerdown', {bubbles:true, pointerId:7, clientX:r.left + m.W / 2, clientY:r.top + m.zone + 40, button:0, isPrimary:true})); }""")
        pg.wait_for_timeout(600); ok = etat(pg) == 'bande'
        pg.click('.mj-btn-pause'); pg.wait_for_timeout(300)
        verifier(ok and pg.evaluate("() => !!M.mjPause"), 'la pause, l\'arc bandé : le mini-jeu se met de côté')
        t0 = V(pg, 'v.curseur().reste'); pg.wait_for_timeout(1500); t1 = V(pg, 'v.curseur().reste')
        verifier(abs(t0 - t1) < .05, f'pendant la pause, le minuteur s\'arrête ({t0:.2f} → {t1:.2f})')
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
