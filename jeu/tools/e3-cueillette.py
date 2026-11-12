"""La cueillette des sept plantes et la brume repoussée (Romain, 12 novembre ; Bible §13.26 ; src/cueillette.js, D.PLANTES) — Playwright.
Tout se fait AU DOIGT, sur la vraie carte : on touche l'endroit exact de chaque plante.
· L'Alchimiste de l'enquête 3, le matin : rien ne se voit sur la carte ; quatre endroits cachés (ceux du village), aucun au-delà de la brume ;
  toucher à côté n'ouvre pas de plante ; toucher juste : la pastille surgit, la bulle « Cueillir … » ; cueillir : la plante est sur l'établi ;
  le souci et le lin, trop tôt : une phrase, pas de bouton.
· Bertille : le point du clocher, la brume du nord et de l'ouest s'en va (une seule fois), la carte recule, les noms des lieux paraissent,
  les trois endroits lointains existent ; le gui, le pied-de-loup, la vesse-de-loup.
· L'après-midi : le souci et le lin. La nuit (une autre partie) : tout se cueille encore.
· Les missions du Carnet ; l'herbier du Sage (sept planches, « Où ? » et « Quand ? », chaque texte avec son 🔊, pas de code, pas un mot du donjon).
· L'enquête 2 : une curieuse trouve les quatre plantes du village à l'aveugle, les cueille, l'établi apparaît dans son atelier ; à l'enquête 3,
  elle les a déjà (plantes.js, M.S.herbier).
· Le Pisteur : aucun endroit caché sur sa carte.
   BRUMEVAL_DIST=<dossier construit> python3 tools/e3-cueillette.py [iphone]"""
import sys, os, json
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist')), 'index.html') + '#test'
OUT = os.path.join(ICI, '..', 'test', 'e3-cueillette'); os.makedirs(OUT, exist_ok=True)
IPHONE = 'iphone' in sys.argv[1:]
VP = {'width': 390, 'height': 760} if IPHONE else {'width': 1180, 'height': 820}
SUF = '-iphone' if IPHONE else ''
erreurs, echecs = [], []
n = [0]

def shot(pg, nom):
    n[0] += 1; pg.wait_for_timeout(350); pg.screenshot(path=f'{OUT}/{n[0]:02d}-{nom}{SUF}.png')

def verifier(cond, quoi):
    print('  ✓' if cond else '  ✗', quoi)
    if not cond: echecs.append(quoi)

def texte(pg, sel='#voile'):
    return pg.evaluate(f"() => {{ var e = document.querySelector('{sel}'); return e ? e.innerText.replace(/\\s+/g, ' ') : ''; }}")

def fermer(pg):
    pg.evaluate("() => { M.UI.modal = null; M.render(); }"); pg.wait_for_timeout(150)

def carte(pg):
    pg.evaluate("() => { M.UI.modal = null; M.P().onglet = 'carte'; M.render(); }"); pg.wait_for_timeout(350)

def debut(b, nom, role, enquete=3):
    pg = b.new_context(viewport=VP, has_touch=True).new_page()
    pg.set_default_timeout(9000)
    pg.on('console', lambda m: erreurs.append(f'[{nom}] {m.text}') if m.type == 'error' and 'net::' not in m.text and 'fonts' not in m.text and 'ERR_TUNNEL' not in m.text and 'Failed to load' not in m.text else None)
    pg.on('pageerror', lambda e: erreurs.append(f'[{nom}] PAGEERROR {e}'))
    pg.add_init_script("window.BRUMEVAL_SANS_TUTO = true;")
    pg.goto(URL)
    pg.click('[data-act=creer]'); pg.click(f'[data-act=crea-role][data-r={role}]'); pg.click('[data-act=crea-suite]'); pg.fill('#nom', nom); pg.click('[data-act=crea-fin]')
    pg.evaluate("() => { M.S.heros.joueur = 'adulte'; M.sauver(); M.UI.ecran = 'reglages'; M.render(); }")
    pg.click(f'[data-act=mode-test][data-i="{enquete}"]'); pg.click('#voile [data-act=confirmer-oui]')
    pg.click('[data-act=nouvelle-enquete]'); pg.wait_for_timeout(200)
    if pg.locator('[data-act=lettre-suite]').count(): pg.click('[data-act=lettre-suite]')
    pg.click('[data-act=commencer]'); pg.wait_for_timeout(500)
    pg.evaluate("() => { window.__lus = []; M.lire = function(t){ window.__lus.push(String(t)); }; M.lireAuto = function(){}; }")
    carte(pg)
    return pg

def ronds(pg):
    return pg.evaluate("() => [].map.call(document.querySelectorAll('#carte-ici .ca-cachette'), function(c){ return c.dataset.id; })")

def connues(pg):
    return pg.evaluate("() => [].filter.call(document.querySelectorAll('#carte-ici .ca-cach-pastille'), function(g){ return !g.classList.contains('ca-cach-inconnue'); }).map(function(g){ return g.dataset.cachette; })")

def grises(pg):
    return pg.evaluate("() => [].map.call(document.querySelectorAll('#carte-ici .ca-cach-pastille.ca-cach-grise'), function(g){ return g.dataset.cachette; })")

def echelle(pg):
    return pg.evaluate("() => { var m = document.querySelector('#carte-ici .ca-monde'), s = m && m.querySelector('svg'); return m && s ? m.getBoundingClientRect().width / s.viewBox.baseVal.width : 0; }")

def zoomer(pg):
    """le plus gros zoom (on vise au doigt). Plus de boutons ＋ / − depuis le 12 novembre (Bible §14.6) : la molette, au milieu de la carte."""
    r = pg.evaluate("() => { var v = document.querySelector('#carte-ici .ca-vue').getBoundingClientRect(); return [v.left + v.width / 2, v.top + v.height / 2]; }")
    pg.mouse.move(r[0], r[1])
    k0 = 0
    for i in range(14):
        pg.mouse.wheel(0, -240); pg.wait_for_timeout(90)
        k = echelle(pg)
        if abs(k - k0) < 1e-4: break
        k0 = k
    pg.wait_for_timeout(200)

def point(pg, pid, dx=0, dy=0):
    """là où est l'endroit de cette plante, à l'écran (après l'avoir amené au milieu de la carte) ; dx, dy : un écart, en mesures de la carte"""
    return pg.evaluate("""([pid, dx, dy]) => {
      var c = document.querySelector('#carte-ici .ca-cachette[data-id="' + pid + '"]'), vue = document.querySelector('#carte-ici .ca-vue'), monde = document.querySelector('#carte-ici .ca-monde');
      if(!c) return null;
      var svg = c.ownerSVGElement, k = monde.getBoundingClientRect().width / svg.viewBox.baseVal.width, ox = +svg.getAttribute('data-ox') || 0, oy = +svg.getAttribute('data-oy') || 0;
      var x = (+c.getAttribute('cx') + ox + dx) * k, y = (+c.getAttribute('cy') + oy + dy) * k;
      vue.scrollLeft = x + monde.offsetLeft - vue.clientWidth / 2; vue.scrollTop = y + monde.offsetTop - vue.clientHeight / 2;
      var R = monde.getBoundingClientRect();
      return {x:R.left + x, y:R.top + y, k:k, r:+c.getAttribute('r') * k};
    }""", [pid, dx, dy])

def toucher(pg, pid, dx=0, dy=0):
    q = point(pg, pid, dx, dy); pg.wait_for_timeout(220)
    q = point(pg, pid, dx, dy)   # (la carte a fini de glisser)
    if not q: return None
    pg.touchscreen.tap(q['x'], q['y']); pg.wait_for_timeout(450)
    return q

def bulle(pg):
    return pg.evaluate("() => { var m = M.UI.modal; return m ? {type:m.type, id:m.id || null, bulle:!!m.bulle} : null; }")

def moment(pg, i):
    pg.evaluate(f"() => {{ M.UI.modal = null; M.P().moment = {i}; M.sauver(); M.render(); }}"); pg.wait_for_timeout(300); carte(pg)

def cueillir(pg, pid, mot):
    """touche l'endroit, puis le bouton jaune ; rend le texte de la bulle avant et après"""
    toucher(pg, pid)
    avant = texte(pg); bt = pg.locator(f'#voile [data-act=cueillir-plante][data-id={pid}]')
    if not bt.count(): return avant, None
    lib = bt.inner_text()
    bt.tap(); pg.wait_for_timeout(400)
    return avant + ' | ' + lib, texte(pg)

with sync_playwright() as p:
    b = p.chromium.launch()
    PL = None
    # ======================================================================== le matin
    print('— L\'Alchimiste, le matin : rien ne se voit, quatre endroits cachés')
    pg = debut(b, 'Alchi', 'alchimiste')
    PL = pg.evaluate("() => DONNEES.PLANTES")
    verifier(pg.evaluate("() => M.E().id === 3 && M.momentId() === 'matin'"), 'enquête 3, le matin')
    verifier(sorted(ronds(pg)) == ['lin', 'melisse', 'oseille', 'souci'], f'quatre endroits cachés sur la carte, ceux du village ({ronds(pg)})')
    verifier(connues(pg) == [], 'aucune pastille de plante ne se voit')
    verifier(pg.evaluate("() => [].every.call(document.querySelectorAll('#carte-ici .ca-cachette'), function(c){ return c.getAttribute('opacity') === '0'; })"), 'les ronds à toucher sont invisibles')
    verifier(pg.evaluate("() => document.querySelectorAll('#carte-ici canvas.ca-nuages').length") == 1 and pg.evaluate("() => M.brumeLevee().length") == 0, 'toute la brume est là (une seule toile de brume, aucune zone levée)')
    shot(pg, 'matin-rien-ne-se-voit')
    mi = pg.evaluate("() => M.etapesMission().map(function(m){ return m.t; })")
    verifier(any('sept plantes' in t and 'herbier du Sage' in t for t in mi) and any('Anselme' in t and 'brume' in t for t in mi), 'ses missions : les sept plantes (l\'herbier du Sage), et Anselme pour la brume')
    zoomer(pg)
    # toucher à côté : deux fois le rayon plus loin
    q = toucher(pg, 'oseille', 95, 0)
    m = bulle(pg)
    verifier(not m or m['type'] != 'cachette', f'toucher à côté de l\'oseille (95 plus à droite) : pas de plante ({m})')
    verifier(connues(pg) == [], 'et toujours aucune pastille')
    fermer(pg); carte(pg); zoomer(pg)
    q = toucher(pg, 'oseille')
    m = bulle(pg); t = texte(pg)
    verifier(m and m['type'] == 'cachette' and m['id'] == 'oseille' and m['bulle'], f'toucher juste : la bulle de l\'oseille, sur la carte ({m})')
    verifier('fer de flèche' in t and 'Cueillir de l\'oseille' in t, f'« … de l\'oseille ! » et le bouton « Cueillir de l\'oseille » ({t[:110]})')
    verifier(pg.evaluate("() => { var b = document.querySelector('#voile [data-act=cueillir-plante]'); return !!b && /rgb\\(17, 17, 17\\)/.test(getComputedStyle(b).color); }"), 'le bouton est jaune, texte noir')
    verifier(connues(pg) == ['oseille'] and pg.evaluate("() => !!M.S.plantesVues.oseille"), 'sa pastille est apparue sur la carte, et le jeu s\'en souvient (pour toute la saison)')
    verifier(q and q['r'] * 2 >= 44, f'au plus gros zoom, le rond à toucher fait au moins 44 px ({q and round(q["r"] * 2)})')
    shot(pg, 'oseille-trouvee')
    av, ap = cueillir(pg, 'oseille', 'oseille')
    verifier(ap is not None and 'Cueilli' in ap and 'établi' in ap and pg.evaluate("() => M.plantes().oseille") == 1 and pg.evaluate("() => !!M.P().vus['plante:oseille']"), f'cueillie : « ça t\'attend sur l\'établi », une oseille sur l\'établi ({(ap or "")[:60]})')
    verifier(grises(pg) == ['oseille'], 'sa pastille devient grise')
    toucher(pg, 'oseille'); t = texte(pg)
    verifier('Cueilli' in t and pg.locator('#voile [data-act=cueillir-plante]').count() == 0 and pg.evaluate("() => M.plantes().oseille") == 1, 'la retoucher ce matin : déjà cueillie, pas de deuxième')
    # la mélisse (dès le matin), le souci et le lin (pas avant l'après-midi)
    av, ap = cueillir(pg, 'melisse', 'mélisse')
    verifier(ap is not None and 'citron' in av and pg.evaluate("() => M.plantes().melisse") == 1, f'la mélisse, dès le matin ({av[:70]})')
    for pid, mot in [('souci', 'dorment encore'), ('lin', 'rosée')]:
        toucher(pg, pid); t = texte(pg)
        verifier(mot in t and pg.locator('#voile [data-act=cueillir-plante]').count() == 0 and not pg.evaluate(f"() => M.plantes().{pid} || 0"), f'{pid}, le matin : trop tôt (« {mot} »), pas de bouton ({t[:80]})')
    verifier(sorted(connues(pg)) == ['lin', 'melisse', 'oseille', 'souci'], 'les quatre plantes du village sont trouvées')
    shot(pg, 'village-quatre-trouvees')
    # ======================================================================== Bertille
    print('— Bertille : la brume recule, au nord et à l\'ouest')
    pg.evaluate("() => { M.UI.modal = null; M.render(); M.A.lieu({dataset:{id:'clocher'}, closest:function(){ return null; }}); }"); pg.wait_for_timeout(300)
    pts = pg.evaluate("() => [].map.call(document.querySelectorAll('#voile [data-act=point]'), function(b){ return b.dataset.id; })")
    verifier(pts == ['bertille'], f'au clocher : demander à Anselme de chasser la brume ({pts})')
    pg.locator('#voile [data-act=point][data-id=bertille]').click(); pg.wait_for_timeout(400)
    t = texte(pg)
    verifier('Bertille' in t and 'DING' in t and 'TES TANTES' in t and pg.locator('#voile .b-lire').count() >= 1, f'la scène d\'Anselme, avec son 🔊 ({t[:90]})')
    verifier('Grosse Marie' not in t, 'Anselme ne sonne pas la Grosse Marie (elle, c\'est à minuit)')
    shot(pg, 'bertille')
    verifier(pg.evaluate("() => M.brumeLevee().join()") == 'n,o' and pg.evaluate("() => !M.P().vus['brume:n']"), 'la brume du nord et de l\'ouest est levée ; la carte ne l\'a pas encore montré')
    fermer(pg); carte(pg)
    pg.wait_for_timeout(300)
    verifier(pg.evaluate("() => document.querySelectorAll('#carte-ici .ca-brume-part').length") == 1, 'sur la carte : la brume d\'avant, posée par-dessus sur sa toile, qui s\'efface')
    verifier(pg.evaluate("() => !!M.P().vus['brume:n'] && !!M.P().vus['brume:o']"), 'les deux zones sont notées comme vues')
    verifier(pg.evaluate("() => { var v = document.querySelector('#carte-ici .ca-vue'), m = document.querySelector('#carte-ici .ca-monde').getBoundingClientRect(); return m.width <= v.clientWidth + 2 || m.height <= v.clientHeight + 2; }"), 'la carte a reculé tout entière, pour qu\'on voie la brume partir')
    verifier(pg.evaluate("() => { var c = document.querySelectorAll('#carte-ici canvas.ca-nuages'); return c.length === 2 && c[0].width > 100 && c[1].width > 100 && c[0] !== c[1]; }"), 'deux toiles peintes : la brume d\'après (dessous), la brume d\'avant (dessus)')
    shot(pg, 'la-brume-part')
    pg.wait_for_timeout(2600); shot(pg, 'la-brume-part-milieu')
    op = pg.evaluate("() => +getComputedStyle(document.querySelector('#carte-ici .ca-brume-part')).opacity")
    verifier(0 < op < 1, f'elle s\'efface doucement (à mi-chemin : {op:.2f})')
    pg.evaluate("() => M.render()"); pg.wait_for_timeout(200)
    verifier(pg.evaluate("() => document.querySelectorAll('#carte-ici .ca-brume-part').length") == 1 and abs(pg.evaluate("() => +getComputedStyle(document.querySelector('#carte-ici .ca-brume-part')).opacity") - op) < .35, 'un nouveau rendu pendant ce temps ne la fait pas recommencer')
    pg.wait_for_timeout(4200); shot(pg, 'la-brume-est-partie')
    pg.evaluate("() => M.render()"); pg.wait_for_timeout(300)
    verifier(pg.evaluate("() => document.querySelectorAll('#carte-ici .ca-brume-part').length") == 0, 'ensuite, ce dessin n\'est plus là')
    noms = pg.evaluate("() => document.querySelector('#carte-ici svg.ca-carte').textContent")
    verifier('Rond des Sorcières' in noms and 'Vieux verger' in noms and 'Cinq Pierres' in noms and 'Mine condamnée' not in noms and 'Bergerie' not in noms, 'les noms des lieux du nord et de l\'ouest paraissent ; ceux des autres zones, non')
    verifier(sorted(ronds(pg)) == ['gui', 'lin', 'lycopode', 'melisse', 'oseille', 'souci', 'vesse'], f'sept endroits cachés maintenant ({len(ronds(pg))})')
    verifier(sorted(connues(pg)) == ['lin', 'melisse', 'oseille', 'souci'], 'les trois lointaines ne se voient pas')
    zoomer(pg)
    for pid, mot, ok in [('gui', 'échelle', 'gui'), ('lycopode', 'bruyères', 'pied-de-loup'), ('vesse', 'boule brune', 'vesse-de-loup')]:
        av, ap = cueillir(pg, pid, ok)
        verifier(ap is not None and mot in av and ok in av and pg.evaluate(f"() => M.plantes().{pid}") == 1, f'{ok} : « {mot} », cueilli ({av[:80]})')
        if pid == 'gui': shot(pg, 'gui-au-verger')
    # la brume ne revient pas, et ne repart pas une deuxième fois
    carte(pg)
    verifier(pg.evaluate("() => document.querySelectorAll('#carte-ici .ca-brume-part').length") == 0 and 'Vieux verger' in pg.evaluate("() => document.querySelector('#carte-ici svg.ca-carte').textContent"), 'en rouvrant la carte : la brume ne repart pas une deuxième fois, les zones restent ouvertes')
    # ======================================================================== l'après-midi
    print('— L\'après-midi : le souci et le lin')
    moment(pg, 1); zoomer(pg)
    for pid, mot, ok in [('souci', 'grands ouverts', 'souci'), ('lin', 'tintent', 'lin')]:
        av, ap = cueillir(pg, pid, ok)
        verifier(ap is not None and mot in av and pg.evaluate(f"() => M.plantes().{pid}") == 1, f'{ok}, l\'après-midi : « {mot} », cueilli ({av[:80]})')
    verifier(pg.evaluate("() => ['oseille','souci','melisse','lin','lycopode','vesse','gui'].every(function(k){ return !!M.P().vus['plante:' + k]; })"), 'les sept plantes sont cueillies')
    mi = pg.evaluate("() => { M.majMission && M.majMission(); return M.etapesMission().filter(function(m){ return !!(m.fait && m.fait.some(M.condMission)); }).map(function(m){ return m.t; }); }")
    verifier(any('sept plantes' in t for t in mi) and any('Anselme' in t for t in mi), 'les deux missions se cochent (les sept plantes, Anselme)')
    toucher(pg, 'oseille'); t = texte(pg)
    verifier('déjà sur ton établi' in t and pg.locator('#voile [data-act=cueillir-plante]').count() == 0, f'l\'oseille, l\'après-midi : « Tu en as déjà sur ton établi » ({t[:60]})')
    shot(pg, 'apres-midi-tout-cueilli')
    # ======================================================================== la nuit (une autre partie) : rien n'est jamais trop tard
    print('— La nuit : tout se cueille encore')
    pn = debut(b, 'Nuit', 'alchimiste')
    pn.evaluate("() => { M.P().vus['alchimiste:clocher:bertille'] = 'ok'; M.P().vus['brume:n'] = 1; M.P().vus['brume:o'] = 1; M.P().moment = 2; M.sauver(); M.render(); }"); carte(pn); zoomer(pn)
    verifier(pn.evaluate("() => M.momentId()") == 'nuit' and len(ronds(pn)) == 7, 'la nuit, Bertille sonnée : les sept endroits')
    for pid in ['oseille', 'souci', 'melisse', 'lin', 'lycopode', 'vesse', 'gui']:
        av, ap = cueillir(pn, pid, pid)
        verifier(ap is not None and pn.evaluate(f"() => M.plantes().{pid}") == 1, f'{pid} se cueille la nuit')
    shot(pn, 'nuit')
    # sans Bertille, la nuit : seulement les quatre du village ; on peut encore aller voir Anselme
    ps = debut(b, 'SansCloche', 'alchimiste')
    ps.evaluate("() => { M.P().moment = 2; M.sauver(); M.render(); }"); carte(ps)
    verifier(len(ronds(ps)) == 4, 'la nuit, sans Bertille : les quatre du village seulement')
    ps.evaluate("() => { M.A.lieu({dataset:{id:'clocher'}, closest:function(){ return null; }}); }"); ps.wait_for_timeout(300)
    verifier(ps.locator('#voile [data-act=point][data-id=bertille]').count() == 1, 'la nuit, on peut encore demander à Anselme de sonner Bertille')
    # ======================================================================== le Sage : l'herbier
    print('— Le Sage : l\'herbier des Fondateurs')
    sg = debut(b, 'Sage', 'sage')
    verifier(ronds(sg) == [], 'le Sage : aucun endroit caché sur sa carte')
    sg.evaluate("() => { M.P().onglet = 'role'; M.UI.modal = null; M.render(); M.livreAller('herbier', true); }"); sg.wait_for_timeout(500)
    h = sg.evaluate("""() => { var u = document.querySelector('#livre-ici .lv-page.on .lv-herbier'); if(!u) return null;
      return {n:u.children.length, plantes:[].map.call(u.children, function(li){ return li.dataset.plante; }), dessins:u.querySelectorAll('.lv-herb-planche svg').length,
        lire:u.querySelectorAll('.b-lire').length, ou:u.querySelectorAll('.lv-herb-ou').length, quand:u.querySelectorAll('.lv-herb-quand').length, t:u.innerText.replace(/\\s+/g, ' '),
        page:document.querySelector('#livre-ici .lv-page.on').innerText.replace(/\\s+/g, ' '), donne:document.querySelectorAll('#livre-ici .lv-page.on .b-donne').length}; }""")
    verifier(h is not None and h['n'] == 7 and h['plantes'] == ['oseille', 'melisse', 'souci', 'lin', 'lycopode', 'vesse', 'gui'], f'la page de l\'herbier : sept planches, le village d\'abord ({h and h["plantes"]})')
    if h:
        verifier(h['dessins'] == 7 and h['ou'] == 7 and h['quand'] == 7 and h['lire'] == 14, f'chaque plante : son dessin, « Où ? », « Quand ? », et un 🔊 par texte ({h["dessins"]} dessins, {h["lire"]} 🔊)')
        verifier(all(PL[k]['ou'] in h['t'] and PL[k]['vit'] in h['t'] and PL[k]['quand'] in h['t'] for k in PL), 'où elle vit, l\'endroit précis et le moment de chacune y sont')
        bas = h['page'].lower()
        verifier(not any(m in bas for m in ['donjon', 'potion', 'crypte', 'monstre', 'code']), 'pas un mot du donjon, des potions ni d\'un code')
        verifier(h['donne'] == 0, 'plus de code à donner')
        verifier(sg.evaluate("() => { M.majMission && M.majMission(); return M.etapesMission().some(function(m){ return /herbier/.test(m.t) && !!(m.fait && m.fait.some(M.condMission)); }); }"), 'sa mission « Lis l\'herbier à l\'Alchimiste » se coche')
    shot(sg, 'herbier')
    sg.evaluate("() => { var p = document.querySelector('#livre-ici .lv-page.on'); if(p){ p.scrollTop = 99999; } window.scrollTo(0, 99999); }"); shot(sg, 'herbier-bas')
    # ======================================================================== l'enquête 2 : une curieuse
    print('— L\'enquête 2 : une curieuse trouve les plantes du village')
    p2 = debut(b, 'Curieuse', 'alchimiste', 2)
    verifier(p2.evaluate("() => M.E().id") == 2 and sorted(ronds(p2)) == ['lin', 'melisse', 'oseille', 'souci'], f'enquête 2 : les quatre endroits du village existent déjà ({ronds(p2)})')
    zoomer(p2)
    verifier(not p2.evaluate("() => M.etabliDispo()"), 'enquête 2, aucune plante : pas d\'établi dans l\'atelier')
    av, ap = cueillir(p2, 'oseille', 'oseille')
    verifier(ap is not None and 'Cueillir de l\'oseille' in av and 'établi' in ap and p2.evaluate("() => M.plantes().oseille") == 1, f'l\'oseille : trouvée à l\'aveugle, et cueillie pour de bon ({av[:80]})')
    verifier(connues(p2) == ['oseille'] and grises(p2) == ['oseille'], 'sa pastille reste sur la carte (grise : cueillie)')
    verifier(p2.evaluate("() => M.etabliDispo()") and p2.evaluate("() => M.S.herbier.plantes.oseille") == 2, 'l\'établi apparaît dans l\'atelier dès la première plante, et le jeu note où elle a été trouvée (enquête 2)')
    toucher(p2, 'souci'); t = texte(p2)
    verifier('dorment encore' in t and p2.locator('#voile [data-act=cueillir-plante]').count() == 0, 'le souci, le matin de l\'enquête 2 : trop tôt, comme à l\'enquête 3')
    shot(p2, 'enquete2-curieuse')
    p2.evaluate("() => { M.UI.modal = null; M.P().onglet = 'role'; M.render(); }"); p2.wait_for_timeout(900)
    verifier(p2.locator('#atelier-ici .at-etabli-p').count() == 1, 'l\'établi des plantes est posé dans l\'atelier de l\'enquête 2')
    shot(p2, 'enquete2-atelier')
    carte(p2)
    verifier(sorted(ronds(p2)) == ['lin', 'melisse', 'oseille', 'souci'] and p2.evaluate("() => M.brumeLevee().length") == 0, 'enquête 2 : jamais les trois lointaines, jamais de brume levée')
    # la même héroïne passe à l'enquête 3 : la pastille est déjà là, et la plante aussi
    fermer(p2)
    p2.evaluate("() => { M.UI.ecran = 'reglages'; M.render(); }"); p2.click('[data-act=mode-test][data-i="3"]'); p2.click('#voile [data-act=confirmer-oui]')
    p2.click('[data-act=nouvelle-enquete]'); p2.wait_for_timeout(200)
    if p2.locator('[data-act=lettre-suite]').count(): p2.click('[data-act=lettre-suite]')
    p2.click('[data-act=commencer]'); p2.wait_for_timeout(400); p2.evaluate("() => M.etabliDispo()"); carte(p2)
    verifier(p2.evaluate("() => M.E().id") == 3 and sorted(connues(p2)) == ['oseille', 'souci'], f'à l\'enquête 3, les endroits trouvés à l\'enquête 2 sont déjà marqués sur sa carte ({connues(p2)})')
    verifier(p2.evaluate("() => M.plantes().oseille") == 1 and p2.evaluate("() => !!M.P().vus['plante:oseille']") and p2.evaluate("() => M.etatCachette('oseille')") == 'deja', 'et elle l\'a déjà sur son établi : rien à recueillir')
    # ======================================================================== les autres rôles
    print('— Les autres rôles')
    pp = debut(b, 'Pisteur', 'pisteur')
    verifier(ronds(pp) == [] and pp.evaluate("() => M.brumeLevee().length") == 0, 'le Pisteur : aucun endroit caché, toute la brume')
    pp.evaluate("() => { M.A.lieu({dataset:{id:'potager'}, closest:function(){ return null; }}); }"); pp.wait_for_timeout(250)
    verifier(pp.locator('#voile [data-act=point][data-id=gui]').count() == 0, 'le Pisteur n\'a plus à grimper au pommier du potager')
    b.close()

print()
if erreurs: print('ERREURS DE CONSOLE :'); [print('  ', e) for e in erreurs[:12]]
print(f'ÉCHECS : {len(echecs)}' if echecs else 'Tout est bon.')
for e in echecs: print('  ✗', e)
sys.exit(1 if (echecs or erreurs) else 0)
