"""Les trois films du début des enquêtes (« debut1 », « debut2 », « debut3 » ; Bible §13.69 ; Romain, 18 novembre : « une cinématique à chaque
   début d'enquête, comme un générique d'épisode », « qu'on puisse la passer ») — sur une tablette, avec les vraies vidéos (copiées dans
   <dossier construit>/cine/).
  - pour chaque enquête : on touche le bouton de l'enquête, le film part tout seul (21:9, deux bandes noires, « Passer ➜ »), la lettre du
    maire attend derrière ; les sous-titres ont leur 🔊, jamais de lecture toute seule ; des enfants ont le temps de lire ;
  - à la fin du film : la lettre, son bouton, et « 🎬 Revoir le film » ; la page rechargée : le film ne repart pas ;
  - « 🎬 Revoir le film » le rejoue ; « Passer ➜ » ramène à la lettre ; puis l'enquête commence comme avant ;
  - sans le film (il n'arrive pas) : la lettre tout de suite ;
  - un robot ordinaire (sans BRUMEVAL_AVEC_FILM_DEBUT) ne voit pas le film partir : les autres essais ne changent pas ;
  - servi comme sur le site : le film de la prochaine enquête est téléchargé d'avance dès l'accueil, la bande-son joue avec la vidéo ;
  - les films ne disent rien de plus que le jeu (pas un nom de coupable dans les sous-titres).
   BRUMEVAL_DIST=<dossier construit> python3 tools/debut-films.py"""
import sys, os, json, shutil, threading, http.server, socketserver, functools
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist'))
URL = 'file://' + os.path.join(DIST, 'index.html') + '#test'
SORTIE = os.path.join(ICI, '..', 'cine', 'sortie')
OUT = os.path.join(ICI, '..', 'test', 'debut-films'); os.makedirs(OUT, exist_ok=True)
erreurs, echecs = [], []
# ce que chaque film doit dire en premier (qui, un bout du texte, à quelle seconde le chercher)
FILMS = {1: ('debut1', 'Le maire', 'Elle a disparu', 30.6), 2: ('debut2', 'La lavandière', 'toute rouge', 21.0), 3: ('debut3', 'Le maire', 'reçu une lettre', 7.4)}
# les noms qu'un film du début ne doit jamais écrire (les coupables, les secrets des enquêtes)
INTERDITS = ['Tim', 'Bastien', 'Léo', 'Leo', 'Mélusine', 'chien', 'moulin', 'cape']

def verifier(cond, quoi):
    print('  ✓' if cond else '  ✗', quoi, flush=True)
    if not cond: echecs.append(quoi)

def tablette(b, nom, role, enquete, url=None, avec=True):
    pg = b.new_context(viewport={'width': 1180, 'height': 820}, has_touch=True).new_page()
    pg.set_default_timeout(9000)
    pg.on('console', lambda m: erreurs.append(f'[{nom}] {m.text}') if m.type == 'error' and 'net::' not in m.text and 'fonts' not in m.text and 'ERR_' not in m.text and 'Failed to load' not in m.text and 'fetching the sc' not in m.text else None)
    pg.on('pageerror', lambda e: erreurs.append(f'[{nom}] PAGEERROR {e}'))
    pg.add_init_script("window.BRUMEVAL_SANS_TUTO = true; window.BRUMEVAL_SANS_DONJON = true; window.__parle = 0; try{ speechSynthesis.speak = function(){ window.__parle++; }; }catch(e){}"
                       + (" window.BRUMEVAL_AVEC_FILM_DEBUT = true;" if avec else ""))
    pg.goto(url or URL)
    pg.click('[data-act=creer]'); pg.click(f'[data-act=crea-role][data-r={role}]'); pg.click('[data-act=crea-suite]'); pg.fill('#nom', nom); pg.click('[data-act=crea-fin]')
    if enquete > 1:
        pg.evaluate("() => { M.S.heros.joueur = 'adulte'; M.sauver(); M.UI.ecran = 'reglages'; M.render(); }")
        pg.click(f'[data-act=mode-test][data-i="{enquete}"]'); pg.click('#voile [data-act=confirmer-oui]')
    pg.evaluate("() => { window.__lus = []; M.lire = function(t){ window.__lus.push(String(t)); }; M.UI.modal = null; M.UI.ecran = 'accueil'; M.render(); }")
    return pg

def film_en_cours(pg, apres=1.0):
    pg.wait_for_selector('.cine-ecran video', timeout=15000)
    pg.wait_for_function("(a) => { var v = document.querySelector('.cine-ecran video'); return v && v.currentTime > a; }", arg=apres, timeout=25000)

def sous_titre(pg, t):
    pg.evaluate("(t) => { var v = document.querySelector('.cine-ecran video'); v.currentTime = t; }", t)
    pg.wait_for_function("() => { var s = document.querySelector('.cine-st'); return s && s.classList.contains('on'); }", timeout=10000); pg.wait_for_timeout(350)
    return pg.evaluate("() => ({qui:document.querySelector('.cine-qui').textContent, txt:document.querySelector('.cine-txt').textContent, lire:!!document.querySelector('.cine-st [data-cine=lire]')})")

def fin_du_film(pg):
    pg.evaluate("() => { var v = document.querySelector('.cine-ecran video'); v.play(); v.currentTime = v.duration - .3; }")
    pg.wait_for_function("() => !document.querySelector('.cine-ecran')", timeout=15000); pg.wait_for_timeout(400)

def copier(noms):
    os.makedirs(os.path.join(DIST, 'cine'), exist_ok=True)
    for n in noms:
        for ext in ('.mp4', '.mp3'):
            f = os.path.join(SORTIE, n + ext)
            if os.path.exists(f): shutil.copy(f, os.path.join(DIST, 'cine', n + ext))

mots = lambda t: len([m for m in t.replace('’', "'").split() if any(c.isalpha() for c in m)])

with sync_playwright() as p:
    b = p.chromium.launch()
    noms = [FILMS[k][0] for k in FILMS]
    for n in noms: verifier(os.path.exists(os.path.join(SORTIE, n + '.mp4')), f'la vidéo {n}.mp4 existe (jeu/cine/sortie)')
    copier(noms)

    for k in (1, 2, 3):
        nom, qui, bout, quand = FILMS[k]
        print(f'— {k}. Enquête {k} : le film « {nom} »')
        pg = tablette(b, 'Robot%d' % k, ['sage', 'barde', 'pisteur'][k - 1], k)
        ok = pg.evaluate("(n) => !!(window.CINE_INFOS && CINE_INFOS[n]) && M.S.prochaine", nom)
        verifier(ok == k, f'le jeu connaît le film (CINE_INFOS.{nom}) ; la prochaine enquête est la {k} ({ok})')
        pg.click('[data-act=nouvelle-enquete]')
        film_en_cours(pg)
        r = pg.evaluate("""() => { var c = document.querySelector('.cine-cadre').getBoundingClientRect(), P = M.P();
          return {ratio:c.width / c.height, haut:c.top, bas:innerHeight - c.bottom, passer:!!document.querySelector('[data-cine=passer]'), enquete:P.id, etape:P.etape, note:P.filmDebut,
            src:document.querySelector('.cine-ecran video').currentSrc.split('/').pop(), lettre:!!document.querySelector('.b-lettre-page')}; }""")
        verifier(r['enquete'] == k and r['src'].startswith(nom + '.mp4'), f'on touche « Enquête {k} » : le film {nom} part tout seul ({r["src"]})')
        verifier(abs(r['ratio'] - 1440 / 616) < .02 and r['haut'] > 60 and abs(r['haut'] - r['bas']) < 2 and r['passer'], f'en 21:9 entre deux bandes noires, avec « Passer ➜ » (haut {r["haut"]:.0f}, bas {r["bas"]:.0f})')
        verifier(r['etape'] == 'lettre' and r['note'] == 1 and r['lettre'], 'derrière le film : la lettre attend ; le film est déjà noté « vu » (rien ne se perd si on ferme le jeu)')
        pg.screenshot(path=os.path.join(OUT, f'{k}-1-film.png'))
        st = sous_titre(pg, quand)
        verifier(st['qui'] == qui and bout in st['txt'] and st['lire'], f'le sous-titre, avec son 🔊 ({st})')
        pg.screenshot(path=os.path.join(OUT, f'{k}-2-sous-titre.png'))
        verifier(pg.evaluate("() => window.__lus.length + window.__parle") == 0, 'aucune lecture vocale toute seule')
        pg.tap('.cine-st [data-cine=lire]', force=True); pg.wait_for_timeout(250)
        verifier(pg.evaluate("() => document.querySelector('.cine-ecran video').paused && window.__lus.length === 1"), '🔊 : le film s\'arrête, la réplique est lue')
        I = pg.evaluate("(n) => CINE_INFOS[n]", nom)
        lent = [(s[2], mots(s[2]), round(s[1] - s[0], 1)) for s in I['sousTitres'] if mots(s[2]) > 6 or (s[1] - s[0]) < 1.2 + .3 * mots(s[2]) - .001]
        verifier(not lent, f'des enfants lisent : six mots au plus par réplique, et chacune reste au moins 1,2 s + 0,3 s par mot ({lent})')
        dit = ' '.join(s[2] + ' ' + (s[3] or '') for s in I['sousTitres'])
        trop = [x for x in INTERDITS if x.lower() in dit.lower()]
        verifier(not trop, f'le film n\'écrit aucun nom de coupable ni aucun indice de l\'enquête ({trop})')
        verifier(35 <= I['duree'] <= 42 and I.get('piste') == 1, f'le film dure {I["duree"]} s (entre 35 et 42) et il a sa bande-son')
        fin_du_film(pg)
        d = pg.evaluate("""() => ({lettre:!!document.querySelector('.b-lettre-page'), revoir:(document.querySelector('[data-act=film-debut]') || {}).textContent || '',
          suite:!!document.querySelector('.b-bas [data-act=commencer], .b-bas [data-act=lettre-suite]'), defile:document.documentElement.scrollHeight - innerHeight})""")
        pg.screenshot(path=os.path.join(OUT, f'{k}-3-lettre.png'))
        verifier(d['lettre'] and d['suite'] and 'Revoir le film' in d['revoir'], f'à la fin du film : la lettre, son bouton et « 🎬 Revoir le film » ({d})')
        verifier(d['defile'] <= 2, f'la lettre tient toujours dans l\'écran, sans défiler ({d["defile"]})')
        verifier(len([m for m in d['revoir'].split() if any(c.isalpha() for c in m)]) <= 3, '« Revoir le film » : trois mots, pas besoin de 🔊')
        pg.reload(); pg.wait_for_timeout(1500)
        verifier(not pg.query_selector('.cine-ecran') and pg.evaluate("() => M.P().etape === 'lettre' && M.P().filmDebut === 1"), 'la page rechargée : le film ne repart pas tout seul')
        pg.tap('[data-act=film-debut]'); film_en_cours(pg, .5)
        verifier(True, '« 🎬 Revoir le film » : il repart')
        pg.tap('[data-cine=passer]', force=True)
        pg.wait_for_function("() => !document.querySelector('.cine-ecran')", timeout=8000); pg.wait_for_timeout(300)
        verifier(pg.evaluate("() => !!document.querySelector('.b-lettre-page') && M.P().etape === 'lettre'"), '« Passer ➜ » : la lettre tout de suite')
        if pg.locator('[data-act=lettre-suite]').count(): pg.click('[data-act=lettre-suite]')
        pg.click('[data-act=commencer]'); pg.wait_for_timeout(500)
        verifier(pg.evaluate("() => M.P().etape === 'jeu' && !document.querySelector('.cine-ecran')"), 'puis l\'enquête commence, comme avant')
        pg.context.close()

    print('— 4. Un robot ordinaire (sans BRUMEVAL_AVEC_FILM_DEBUT)')
    pg = tablette(b, 'Ordinaire', 'sage', 2, avec=False)
    pg.click('[data-act=nouvelle-enquete]'); pg.wait_for_timeout(900)
    verifier(not pg.query_selector('.cine-ecran') and pg.evaluate("() => M.P().etape === 'lettre' && !M.P().filmDebut"), 'le film ne part pas : les autres essais du jeu ne changent pas')
    verifier(pg.locator('[data-act=film-debut]').count() == 1, 'mais le bouton « 🎬 Revoir le film » est là')
    pg.context.close()

    print('— 5. Sans le film (il n\'arrive pas)')
    for n in noms:
        for ext in ('.mp4', '.mp3'):
            try: os.remove(os.path.join(DIST, 'cine', n + ext))
            except OSError: pass
    pg = tablette(b, 'SansFilm', 'sage', 1)
    pg.click('[data-act=nouvelle-enquete]')
    pg.wait_for_function("() => !document.querySelector('.cine-ecran') && !M.UI.film && !!document.querySelector('.b-lettre-page')", timeout=30000); pg.wait_for_timeout(300)
    pg.screenshot(path=os.path.join(OUT, '5-sans-film.png'))
    verifier(pg.evaluate("() => M.P().etape === 'lettre'"), 'la vidéo manque : la lettre s\'affiche quand même, on peut commencer')
    pg.click('[data-act=commencer]'); pg.wait_for_timeout(400)
    verifier(pg.evaluate("() => M.P().etape === 'jeu'"), '… et l\'enquête commence')
    b.close()

    print('— 6. Servi comme sur le site : téléchargé d\'avance dès l\'accueil, la bande-son avec la vidéo')
    copier(noms)
    for n in noms: verifier(os.path.exists(os.path.join(SORTIE, n + '.mp3')), f'la bande-son {n}.mp3 existe (jeu/cine/sortie)')
    class Muet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Muet, directory=DIST))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    b = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    U = 'http://127.0.0.1:%d/index.html#test' % srv.server_address[1]
    pg = tablette(b, 'Site', 'sage', 2, U)
    verifier(pg.evaluate("() => !!(M.UI.filmsPrevus || {}).debut2 && !(M.UI.filmsPrevus || {}).debut1 && !(M.UI.filmsPrevus || {}).debut3"), 'à l\'accueil, avant l\'enquête 2 : son film (et lui seul) est demandé d\'avance')
    pg.click('[data-act=nouvelle-enquete]')
    film_en_cours(pg, 1.5)
    a = pg.evaluate("""() => { var v = document.querySelector('.cine-ecran video'), l = performance.getEntriesByType('resource').map(function(e){ return e.name.split('/').pop(); });
      return {piste:l.filter(function(n){ return n.indexOf('debut2.mp3') === 0; }).length, video:l.filter(function(n){ return n.indexOf('debut2.mp4') === 0; }).length, t:v.currentTime, muet:v.muted}; }""")
    verifier(a['video'] >= 1 and a['piste'] >= 1, f'le film et sa bande-son viennent du site ({a})')
    verifier(a['muet'], 'la vidéo reste muette : c\'est la bande-son qui joue (le volume des réglages compte)')
    fin_du_film(pg)
    verifier(pg.evaluate("() => !!document.querySelector('.b-lettre-page')"), 'à la fin : la lettre')
    b.close(); srv.shutdown()

for e in erreurs[:12]: print('ERREUR JS :', e)
if erreurs: echecs.append('des erreurs JavaScript')
print('\n' + ('TOUT EST BON' if not echecs else 'ÉCHECS : %d\n  - ' % len(echecs) + '\n  - '.join(echecs)))
sys.exit(1 if echecs else 0)
