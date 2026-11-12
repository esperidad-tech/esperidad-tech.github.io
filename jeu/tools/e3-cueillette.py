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

# Un endroit se nomme par sa plante ; quand elle en a plusieurs : 'oseille' est le premier, 'oseille#1' le deuxième (data-n, carte.js).
def _sel(pid):
    i, _, n = pid.partition('#')
    return f'.ca-cachette[data-id="{i}"]' + (f'[data-n="{n}"]' if n else ':not([data-n])')

def ronds(pg):
    return pg.evaluate("() => [].map.call(document.querySelectorAll('#carte-ici .ca-cachette'), function(c){ return c.dataset.id + (c.dataset.n ? '#' + c.dataset.n : ''); })")

def connues(pg):
    return pg.evaluate("() => [].filter.call(document.querySelectorAll('#carte-ici .ca-cach-pastille'), function(g){ return !g.classList.contains('ca-cach-inconnue'); }).map(function(g){ return g.dataset.cachette + (g.dataset.n ? '#' + g.dataset.n : ''); })")

def grises(pg):
    return pg.evaluate("() => [].map.call(document.querySelectorAll('#carte-ici .ca-cach-pastille.ca-cach-grise'), function(g){ return g.dataset.cachette + (g.dataset.n ? '#' + g.dataset.n : ''); })")

def rayons(pg, pid):
    """le rayon du rond à toucher, et celui du rond qui s'affiche (son trait compris), en mesures de la carte ; et s'ils sont au même endroit"""
    return pg.evaluate("""(sel) => {
      var c = document.querySelector('#carte-ici ' + sel), i = c.dataset.id, n = c.dataset.n || '';
      var g = [].filter.call(document.querySelectorAll('#carte-ici .ca-cach-pastille'), function(g){ return g.dataset.cachette === i && (g.dataset.n || '') === n; })[0], r = g.querySelector('circle');
      var t = /translate\\(\\s*(-?[\\d.]+)[ ,]+(-?[\\d.]+)/.exec(g.getAttribute('transform') || '');
      return {touche:+c.getAttribute('r'), affiche:+r.getAttribute('r') + (+r.getAttribute('stroke-width')) / 2, meme:!!t && +t[1] === +c.getAttribute('cx') && +t[2] === +c.getAttribute('cy')};
    }""", _sel(pid))

def carnet(pg):
    """tout ce qui est écrit dans le Carnet (les missions), puis retour à la carte"""
    pg.evaluate("() => { M.UI.modal = null; M.P().onglet = 'carnet'; M.render(); }"); pg.wait_for_timeout(250)
    if pg.locator('.b-missions.plie').count():   # (repliées au départ : on les déplie)
        pg.locator('.b-missions.plie .b-mi-plier').first.click(force=True); pg.wait_for_timeout(250)
    t = pg.evaluate("() => [].map.call(document.querySelectorAll('.b-missions'), function(s){ return s.innerText.replace(/\\s+/g, ' '); }).join(' ')")
    carte(pg)
    return t

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
    return pg.evaluate("""([sel, dx, dy]) => {
      var c = document.querySelector('#carte-ici ' + sel), vue = document.querySelector('#carte-ici .ca-vue'), monde = document.querySelector('#carte-ici .ca-monde');
      if(!c) return null;
      var svg = c.ownerSVGElement, k = monde.getBoundingClientRect().width / svg.viewBox.baseVal.width, ox = +svg.getAttribute('data-ox') || 0, oy = +svg.getAttribute('data-oy') || 0;
      var x = (+c.getAttribute('cx') + ox + dx) * k, y = (+c.getAttribute('cy') + oy + dy) * k;
      vue.scrollLeft = x + monde.offsetLeft - vue.clientWidth / 2; vue.scrollTop = y + monde.offsetTop - vue.clientHeight / 2;
      var R = monde.getBoundingClientRect();
      return {x:R.left + x, y:R.top + y, k:k, r:+c.getAttribute('r') * k};
    }""", [_sel(pid), dx, dy])

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
    avant = texte(pg); bt = pg.locator(f'#voile [data-act=cueillir-plante][data-id={pid.partition("#")[0]}]')
    if not bt.count(): return avant, None
    lib = bt.inner_text()
    bt.tap(); pg.wait_for_timeout(400)
    return avant + ' | ' + lib, texte(pg)

with sync_playwright() as p:
    b = p.chromium.launch()
    PL = None
    # ======================================================================== le matin
    print('— L\'Alchimiste, le matin : rien ne se voit ; au village, trois plantes en quatre endroits')
    pg = debut(b, 'Alchi', 'alchimiste')
    PL = pg.evaluate("() => DONNEES.PLANTES")
    verifier(pg.evaluate("() => M.E().id === 3 && M.momentId() === 'matin'"), 'enquête 3, le matin')
    verifier(sorted(ronds(pg)) == ['lin', 'oseille', 'oseille#1', 'souci'], f'quatre endroits cachés sur la carte, ceux du village : l\'oseille (deux endroits), le souci, le lin ({ronds(pg)})')
    verifier('melisse' not in ronds(pg), 'la mélisse n\'est plus au village : elle ne pousse que derrière la brume')
    verifier(connues(pg) == [], 'aucune pastille de plante ne se voit')
    verifier(pg.evaluate("() => [].every.call(document.querySelectorAll('#carte-ici .ca-cachette'), function(c){ return c.getAttribute('opacity') === '0'; })"), 'les ronds à toucher sont invisibles')
    verifier(pg.evaluate("() => document.querySelectorAll('#carte-ici canvas.ca-nuages').length") == 1 and pg.evaluate("() => M.brumeLevee().length") == 0, 'toute la brume est là (une seule toile de brume, aucune zone levée)')
    shot(pg, 'matin-rien-ne-se-voit')
    mi = pg.evaluate("() => M.etapesMission().map(function(m){ return m.t; })")
    verifier(any('sept plantes' in t and 'herbier du Sage' in t for t in mi) and any('Anselme' in t and 'brume' in t and 'peut-être' in t for t in mi), 'ses missions : les sept plantes (l\'herbier du Sage), et « Anselme pourra peut-être t\'aider » pour la brume')
    tc = carnet(pg)
    verifier('sept plantes' in tc and 'Rapporte de la mélisse' not in tc, f'la mission de la tisane d\'Anselme n\'est pas encore dans le Carnet (elle arrive après Bertille) ({tc[:60]})')
    zoomer(pg)
    # L'ENDROIT À TOUCHER EST EXACTEMENT LE ROND QUI S'AFFICHE (Romain, 15 h 37) : pas plus grand, au même endroit
    for pid in ronds(pg):
        ry = rayons(pg, pid)
        verifier(abs(ry['touche'] - ry['affiche']) < 0.06 and ry['meme'] and ry['touche'] <= 24, f'{pid} : le rond à toucher est exactement le rond qui s\'affiche ({ry["touche"]} et {ry["affiche"]})')
    R = rayons(pg, 'oseille')['touche']
    # toucher juste à côté : rien (à droite, à 1,2 fois le rayon : la rivière ; en bas à gauche, à 1,27 fois : la lavande de l'herboriste)
    for dx, dy, ou in [(R * 1.2, 0, 'à droite, à 1,2 fois le rayon'), (-R * 0.9, R * 0.9, 'en biais, à 1,27 fois le rayon')]:
        toucher(pg, 'oseille', dx, dy)
        m = bulle(pg)
        verifier(not m or m['type'] != 'cachette', f'toucher juste à côté de l\'oseille ({ou}) : pas de plante ({m})')
        verifier(connues(pg) == [], 'et toujours aucune pastille')
        fermer(pg); carte(pg); zoomer(pg)
    # toucher juste dedans, près du bord
    q = toucher(pg, 'oseille', R * 0.85, 0)
    m = bulle(pg); t = texte(pg)
    verifier(m and m['type'] == 'cachette' and m['id'] == 'oseille' and m['bulle'], f'toucher juste dedans (à 0,85 fois le rayon) : la bulle de l\'oseille, sur la carte ({m})')
    verifier('fer de flèche' in t and 'Cueillir de l\'oseille' in t, f'« … de l\'oseille ! » et le bouton « Cueillir de l\'oseille » ({t[:110]})')
    verifier(pg.evaluate("() => { var b = document.querySelector('#voile [data-act=cueillir-plante]'); return !!b && /rgb\\(17, 17, 17\\)/.test(getComputedStyle(b).color); }"), 'le bouton est jaune, texte noir')
    verifier(connues(pg) == ['oseille'] and pg.evaluate("() => !!M.S.cachettesVues.oseille"), 'sa pastille est apparue sur la carte, et le jeu s\'en souvient (pour toute la saison)')
    # (depuis 15 h 37, le rond à toucher n'est pas plus grand que la pastille : « beaucoup plus resserré ». Sur un téléphone, au plus gros zoom, il
    #  ne fait que 36 px — dit à Romain ; si c'est trop dur : laisser le téléphone zoomer plus, ou grossir pastille et rond ensemble, R_CACHETTE)
    verifier(q and q['r'] * 2 >= (34 if IPHONE else 44), f'au plus gros zoom, le rond à toucher fait {q and round(q["r"] * 2)} px (au moins {34 if IPHONE else 44})')
    shot(pg, 'oseille-trouvee')
    av, ap = cueillir(pg, 'oseille', 'oseille')
    verifier(ap is not None and 'Cueilli' in ap and 'établi' in ap and pg.evaluate("() => M.plantes().oseille") == 1 and pg.evaluate("() => !!M.P().vus['plante:oseille']"), f'cueillie : « ça t\'attend sur l\'établi », une oseille sur l\'établi ({(ap or "")[:60]})')
    verifier(grises(pg) == ['oseille'], 'sa pastille devient grise')
    toucher(pg, 'oseille'); t = texte(pg)
    verifier('Cueilli' in t and pg.locator('#voile [data-act=cueillir-plante]').count() == 0 and pg.evaluate("() => M.plantes().oseille") == 1, 'la retoucher ce matin : déjà cueillie, pas de deuxième')
    # le deuxième endroit de l'oseille (au bord gauche du potager, les pieds dans le ruisseau) : la même plante, sa propre pastille
    toucher(pg, 'oseille#1'); m = bulle(pg); t = texte(pg)
    verifier(m and m['type'] == 'cachette' and m['id'] == 'oseille' and 'Cueilli' in t and pg.locator('#voile [data-act=cueillir-plante]').count() == 0 and pg.evaluate("() => M.plantes().oseille") == 1,
             f'le deuxième endroit de l\'oseille : c\'est bien de l\'oseille, déjà cueillie ce matin ({t[:60]})')
    verifier(sorted(connues(pg)) == ['oseille', 'oseille#1'] and pg.evaluate("() => !!M.S.cachettesVues['oseille#1']"), 'chaque endroit trouvé a sa pastille')
    # le souci et le lin (pas avant l'après-midi)
    for pid, mot in [('souci', 'dorment encore'), ('lin', 'rosée')]:
        toucher(pg, pid); t = texte(pg)
        verifier(mot in t and pg.locator('#voile [data-act=cueillir-plante]').count() == 0 and not pg.evaluate(f"() => M.plantes().{pid} || 0"), f'{pid}, le matin : trop tôt (« {mot} »), pas de bouton ({t[:80]})')
    verifier(sorted(connues(pg)) == ['lin', 'oseille', 'oseille#1', 'souci'], 'les quatre endroits du village sont trouvés')
    shot(pg, 'village-quatre-trouvees')
    # ======================================================================== Bertille
    print('— Bertille : la brume recule, au nord et à l\'ouest')
    pg.evaluate("() => { M.UI.modal = null; M.render(); M.A.lieu({dataset:{id:'clocher'}, closest:function(){ return null; }}); }"); pg.wait_for_timeout(300)
    pts = pg.evaluate("() => [].map.call(document.querySelectorAll('#voile [data-act=point]'), function(b){ return b.dataset.id; })")
    verifier(pts == ['bertille'], f'au clocher : monter voir Anselme (et pas encore de mélisse à lui porter) ({pts})')
    pg.locator('#voile [data-act=point][data-id=bertille]').click(); pg.wait_for_timeout(400)
    t = texte(pg)
    verifier('Bertille' in t and 'DING' in t and 'tisane de mélisse' in t and 'derrière la brume' in t and pg.locator('#voile .b-lire').count() >= 1, f'la scène d\'Anselme (il veut une tisane de mélisse, qui ne pousse plus que derrière la brume), avec son 🔊 ({t[:90]})')
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
    verifier('Rucher' in noms, 'le Rucher (où pousse la mélisse) est dans la zone ouverte')
    verifier(sorted(ronds(pg)) == ['gui', 'lin', 'lycopode', 'melisse', 'oseille', 'oseille#1', 'souci', 'vesse'], f'huit endroits cachés maintenant, pour sept plantes ({len(ronds(pg))})')
    verifier(sorted(connues(pg)) == ['lin', 'oseille', 'oseille#1', 'souci'], 'les quatre lointaines ne se voient pas')
    verifier('Rapporte de la mélisse' in carnet(pg), 'la mission « Rapporte de la mélisse à Anselme » est arrivée dans le Carnet')
    zoomer(pg)
    for pid in ['melisse', 'gui', 'lycopode', 'vesse']:
        ry = rayons(pg, pid)
        verifier(abs(ry['touche'] - ry['affiche']) < 0.06 and ry['meme'], f'{pid} : le rond à toucher est exactement le rond qui s\'affiche')
    for pid, mot, ok in [('melisse', 'citron', 'mélisse'), ('gui', 'échelle', 'gui'), ('lycopode', 'grande pierre', 'lycopode'), ('vesse', 'boule brune', 'vesse-de-loup')]:
        av, ap = cueillir(pg, pid, ok)
        verifier(ap is not None and mot in av and ok in av and pg.evaluate(f"() => M.plantes().{pid}") == 1, f'{ok} : « {mot} », cueilli ({av[:80]})')
        if pid == 'melisse': shot(pg, 'melisse-au-rucher')
        if pid == 'gui': shot(pg, 'gui-au-verger')
    # ---------- la tisane d'Anselme : on lui rapporte de la mélisse (et on garde la sienne pour l'établi) ----------
    print('— La tisane d\'Anselme')
    or0 = pg.evaluate("() => M.S.or")
    pg.evaluate("() => { M.UI.modal = null; M.render(); M.A.lieu({dataset:{id:'clocher'}, closest:function(){ return null; }}); }"); pg.wait_for_timeout(300)
    pts = pg.evaluate("() => [].map.call(document.querySelectorAll('#voile [data-act=point]'), function(b){ return b.dataset.id; })")
    verifier('tisane' in pts, f'au clocher, avec de la mélisse : « Porter la mélisse à Anselme » ({pts})')
    pg.locator('#voile [data-act=point][data-id=tisane]').click(); pg.wait_for_timeout(400)
    t = texte(pg)
    verifier('CITRON' in t and 'tisane' in t and pg.locator('#voile .b-lire').count() >= 1, f'Anselme a sa mélisse, avec le 🔊 ({t[:90]})')
    verifier(pg.evaluate("() => M.S.or") == or0 + 3 and pg.evaluate("() => M.plantes().melisse") == 1, 'trois pièces d\'or, et la mélisse reste à l\'Alchimiste pour son établi')
    shot(pg, 'tisane')
    fermer(pg)
    verifier(pg.evaluate("() => { M.majMission && M.majMission(); return M.etapesMission().some(function(m){ return /Rapporte de la mélisse/.test(m.t) && m.fait.some(M.condMission); }); }"), 'la mission de la tisane se coche')
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
    verifier(pn.evaluate("() => M.momentId()") == 'nuit' and len(ronds(pn)) == 8, 'la nuit, Bertille sonnée : les huit endroits')
    for pid in ['oseille#1', 'souci', 'melisse', 'lin', 'lycopode', 'vesse', 'gui']:
        av, ap = cueillir(pn, pid, pid); k = pid.partition('#')[0]
        verifier(ap is not None and pn.evaluate(f"() => M.plantes().{k}") == 1, f'{pid} se cueille la nuit' + (' (par son deuxième endroit)' if '#' in pid else ''))
    shot(pn, 'nuit')
    # sans Bertille, la nuit : seulement les quatre du village ; on peut encore aller voir Anselme
    ps = debut(b, 'SansCloche', 'alchimiste')
    ps.evaluate("() => { M.P().moment = 2; M.sauver(); M.render(); }"); carte(ps)
    verifier(len(ronds(ps)) == 4, 'la nuit, sans Bertille : les quatre endroits du village seulement')
    ps.evaluate("() => { M.A.lieu({dataset:{id:'clocher'}, closest:function(){ return null; }}); }"); ps.wait_for_timeout(300)
    verifier(ps.locator('#voile [data-act=point][data-id=bertille]').count() == 1, 'la nuit, on peut encore monter voir Anselme')
    # ======================================================================== le Barde : dès le matin, Anselme fait appeler l'Alchimiste
    print('— Le Barde : Anselme fait appeler l\'Alchimiste')
    bd = debut(b, 'Barde', 'barde')
    bd.evaluate("() => { M.UI.modal = null; M.render(); M.A.lieu({dataset:{id:'clocher'}, closest:function(){ return null; }}); }"); bd.wait_for_timeout(300)
    t = texte(bd)
    verifier('VA ME CHERCHER L\'ALCHIMISTE' in t and 'SERVICE' in t, f'le matin, au clocher : « Va me chercher l\'Alchimiste : j\'ai un service à lui demander ! » ({t[:120]})')
    verifier(ronds(bd) == [], 'le Barde : aucun endroit caché sur sa carte')
    # ======================================================================== le Sage : l'herbier
    print('— Le Sage : l\'herbier des Fondateurs')
    sg = debut(b, 'Sage', 'sage')
    verifier(ronds(sg) == [], 'le Sage : aucun endroit caché sur sa carte')
    sg.evaluate("() => { M.P().onglet = 'role'; M.UI.modal = null; M.render(); M.livreAller('herbier', true); }"); sg.wait_for_timeout(500)
    h = sg.evaluate("""() => { var u = document.querySelector('#livre-ici .lv-page.on .lv-herbier'); if(!u) return null;
      return {n:u.children.length, plantes:[].map.call(u.children, function(li){ return li.dataset.plante; }), dessins:u.querySelectorAll('.lv-herb-planche svg').length,
        lire:u.querySelectorAll('.b-lire').length, ou:u.querySelectorAll('.lv-herb-ou').length, quand:u.querySelectorAll('.lv-herb-quand').length, t:u.innerText.replace(/\\s+/g, ' '),
        page:document.querySelector('#livre-ici .lv-page.on').innerText.replace(/\\s+/g, ' '), donne:document.querySelectorAll('#livre-ici .lv-page.on .b-donne').length}; }""")
    verifier(h is not None and h['n'] == 7 and h['plantes'] == ['oseille', 'souci', 'lin', 'melisse', 'lycopode', 'vesse', 'gui'], f'la page de l\'herbier : sept planches, les trois du village d\'abord ({h and h["plantes"]})')
    if h:
        verifier(h['dessins'] == 7 and h['ou'] == 7 and h['quand'] == 7 and h['lire'] == 14, f'chaque plante : son dessin, « Où ? », « Quand ? », et un 🔊 par texte ({h["dessins"]} dessins, {h["lire"]} 🔊)')
        verifier(all(PL[k]['ou'] in h['t'] and PL[k]['vit'] in h['t'] and PL[k]['quand'] in h['t'] for k in PL), 'où elle vit, son indice et le moment de chacune y sont')
        bas = h['page'].lower()
        # (Romain, 15 h 37) l'herbier ne dit plus l'endroit : ni le nom du lieu, ni le détail du dessin
        dits = [m for m in ['cinq pierres', 'rond des sorcières', 'verger', 'rucher', 'ruche', 'lavoir', 'lavande', 'ruisseau', 'rivière', 'échelle', 'à l\'ouest', 'au nord'] if m in bas]
        verifier(dits == [], f'l\'herbier ne nomme aucun endroit de la carte : des indices seulement ({dits})')
        verifier(all(m in bas for m in ['bruyère', 'incantations', 'herboristes', 'épouvantail', 'potagers', 'abeilles', 'pommiers']) and bas.count('brume') >= 4, 'les indices de Romain y sont (plaines, pierres et bruyère, incantations, herboristes, épouvantail, potagers), et « au-delà de la brume » pour les quatre lointaines')
        verifier(not any(m in bas for m in ['donjon', 'potion', 'crypte', 'monstre', 'code']), 'pas un mot du donjon, des potions ni d\'un code')
        verifier(h['donne'] == 0, 'plus de code à donner')
        verifier(sg.evaluate("() => { M.majMission && M.majMission(); return M.etapesMission().some(function(m){ return /herbier/.test(m.t) && !!(m.fait && m.fait.some(M.condMission)); }); }"), 'sa mission « Lis l\'herbier à l\'Alchimiste » se coche')
    shot(sg, 'herbier')
    sg.evaluate("() => { var p = document.querySelector('#livre-ici .lv-page.on'); if(p){ p.scrollTop = 99999; } window.scrollTo(0, 99999); }"); shot(sg, 'herbier-bas')
    # ======================================================================== l'enquête 2 : une curieuse
    print('— L\'enquête 2 : une curieuse trouve les plantes du village')
    p2 = debut(b, 'Curieuse', 'alchimiste', 2)
    verifier(p2.evaluate("() => M.E().id") == 2 and sorted(ronds(p2)) == ['lin', 'oseille', 'oseille#1', 'souci'], f'enquête 2 : les quatre endroits du village existent déjà — l\'oseille, le souci, le lin ({ronds(p2)})')
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
    verifier(sorted(ronds(p2)) == ['lin', 'oseille', 'oseille#1', 'souci'] and p2.evaluate("() => M.brumeLevee().length") == 0, 'enquête 2 : jamais les quatre lointaines, jamais de brume levée')
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
