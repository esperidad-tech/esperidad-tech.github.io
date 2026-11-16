"""Enquête 2 : la cinématique du rassemblement au Vieux Chêne (le film « chene », Bible §12.63 ; Romain, 16 novembre) — sur une tablette,
   avec la vraie vidéo (copiée dans <dossier construit>/cine/).
  - le Sage, la nuit, « Rassembler le village » : le film part (21:9, deux bandes noires, « Passer ➜ »), la fenêtre attend derrière ;
    les sous-titres (Gaspard, Silas, le maire) avec leur 🔊, jamais de lecture toute seule, le nom de Léo nulle part ;
  - à la fin du film : la fenêtre habituelle (le texte, le code à donner) ; la page rechargée : le film ne repart pas ;
  - « Passer ➜ » : la fenêtre tout de suite ;
  - sans le film : la fenêtre, comme avant, avec sa petite scène dessinée ;
  - un équipier tape le code : le film, puis « Tu as reçu : Le récit du rassemblement » ;
  - servi comme sur le site : le film est téléchargé d'avance dès que la nuit tombe (pas avant), la bande-son joue avec la vidéo.
   BRUMEVAL_DIST=<dossier construit> python3 tools/e2-film.py"""
import sys, os, json, shutil, threading, http.server, socketserver, functools
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist'))
URL = 'file://' + os.path.join(DIST, 'index.html') + '#test'
FILM = os.path.join(ICI, '..', 'cine', 'sortie', 'chene.mp4')
OUT = os.path.join(ICI, '..', 'test', 'e2-film'); os.makedirs(OUT, exist_ok=True)
erreurs, echecs = [], []

def verifier(cond, quoi):
    print('  ✓' if cond else '  ✗', quoi, flush=True)
    if not cond: echecs.append(quoi)

def debut(b, nom, role, url=None, moment=2):
    pg = b.new_context(viewport={'width': 1180, 'height': 820}, has_touch=True).new_page()
    pg.set_default_timeout(9000)
    pg.on('console', lambda m: erreurs.append(f'[{nom}] {m.text}') if m.type == 'error' and 'net::' not in m.text and 'fonts' not in m.text and 'ERR_' not in m.text and 'Failed to load' not in m.text and 'fetching the script' not in m.text else None)
    pg.on('pageerror', lambda e: erreurs.append(f'[{nom}] PAGEERROR {e}'))
    pg.add_init_script("window.BRUMEVAL_SANS_TUTO = true; window.BRUMEVAL_SANS_DONJON = true; window.__parle = 0; try{ speechSynthesis.speak = function(){ window.__parle++; }; }catch(e){}")
    pg.goto(url or URL)
    pg.click('[data-act=creer]'); pg.click(f'[data-act=crea-role][data-r={role}]'); pg.click('[data-act=crea-suite]'); pg.fill('#nom', nom); pg.click('[data-act=crea-fin]')
    pg.evaluate("() => { M.S.heros.joueur = 'adulte'; M.sauver(); M.UI.ecran = 'reglages'; M.render(); }")
    pg.click('[data-act=mode-test][data-i="2"]'); pg.click('#voile [data-act=confirmer-oui]')
    pg.click('[data-act=nouvelle-enquete]'); pg.wait_for_timeout(200)
    if pg.locator('[data-act=lettre-suite]').count(): pg.click('[data-act=lettre-suite]')
    pg.click('[data-act=commencer]'); pg.wait_for_timeout(500)
    pg.evaluate("() => { window.__lus = []; M.lire = function(t){ window.__lus.push(String(t)); }; window.__sons = []; var s = CineLecteur.sonJeu; CineLecteur.sonJeu = function(id){ window.__sons.push(id); return s(id); }; }")
    pg.evaluate("(m) => { M.UI.modal = null; M.P().moment = m; M.sauver(); M.UI.ecran = 'enquete'; M.render(); }", moment)
    return pg

def rassembler(pg):
    pg.evaluate("() => { M.UI.modal = null; M.A['ouvrir-page']({dataset:{id:'rassemblement'}, closest:function(){ return null; }}); }")

def sous_titre(pg, t):
    pg.evaluate("(t) => { var v = document.querySelector('.cine-ecran video'); v.currentTime = t; }", t)
    pg.wait_for_function("() => { var s = document.querySelector('.cine-st'); return s && s.classList.contains('on'); }", timeout=10000); pg.wait_for_timeout(350)
    return pg.evaluate("() => ({qui:document.querySelector('.cine-qui').textContent, txt:document.querySelector('.cine-txt').textContent, lire:!!document.querySelector('.cine-st [data-cine=lire]')})")

def fin_du_film(pg):
    pg.evaluate("() => { var v = document.querySelector('.cine-ecran video'); v.play(); v.currentTime = v.duration - .3; }")
    pg.wait_for_function("() => !document.querySelector('.cine-ecran')", timeout=15000); pg.wait_for_timeout(400)

with sync_playwright() as p:
    b = p.chromium.launch()
    os.makedirs(os.path.join(DIST, 'cine'), exist_ok=True)
    avec = os.path.exists(FILM)
    verifier(avec, 'la vidéo chene.mp4 existe (jeu/cine/sortie)')
    if avec: shutil.copy(FILM, os.path.join(DIST, 'cine', 'chene.mp4'))
    print('— 1. Le Sage rassemble le village : le film')
    pg = debut(b, 'Sage', 'sage')
    verifier(pg.evaluate("() => M.E().id === 2 && M.momentId() === 'nuit' && !M.P().pages.rassemblement && !!(window.CINE_INFOS && CINE_INFOS.chene)"), 'enquête 2, la nuit ; le jeu connaît le film (CINE_INFOS.chene)')
    rassembler(pg)
    pg.wait_for_selector('.cine-ecran video', timeout=15000)
    pg.wait_for_function("() => { var v = document.querySelector('.cine-ecran video'); return v && v.currentTime > 1.2; }", timeout=25000)
    r = pg.evaluate("""() => { var c = document.querySelector('.cine-cadre').getBoundingClientRect();
      return {ratio:c.width / c.height, haut:c.top, bas:innerHeight - c.bottom, passer:!!document.querySelector('[data-cine=passer]'), fenetre:!!M.UI.modal, page:!!M.P().pages.rassemblement, code:!!M.P().objets['_info:rassemblement']}; }""")
    verifier(abs(r['ratio'] - 1440 / 616) < .02 and r['haut'] > 60 and abs(r['haut'] - r['bas']) < 2 and r['passer'], f'le film, en 21:9 entre deux bandes noires, avec « Passer ➜ » ({r})')
    verifier(not r['fenetre'] and r['page'] and r['code'], 'pendant le film : pas de fenêtre ; la page est déjà faite et le code déjà gardé (rien ne se perd si on ferme le jeu)')
    pg.screenshot(path=os.path.join(OUT, '1-marche.png'))
    st = sous_titre(pg, 3.4)
    verifier(st['qui'] == 'Gaspard' and 'Tous au Vieux Chêne' in st['txt'] and st['lire'], f'le sous-titre de Gaspard, avec son 🔊 ({st})')
    pg.screenshot(path=os.path.join(OUT, '2-gaspard.png'))
    st = sous_titre(pg, 40.0)
    verifier(st['qui'] == 'Silas' and 'vapeurs toxiques' in st['txt'] and st['lire'], f'Silas : « Ce sont des vapeurs toxiques ! » ({st})')
    pg.screenshot(path=os.path.join(OUT, '3-silas.png'))
    st = sous_titre(pg, 50.4)
    verifier(st['qui'] == 'Le maire' and 'La zone est condamnée' in st['txt'] and st['lire'], f'le maire : « La zone est condamnée. » ({st})')
    pg.screenshot(path=os.path.join(OUT, '4-maire.png'))
    verifier(pg.evaluate("() => window.__lus.length + window.__parle") == 0, 'aucune lecture vocale toute seule')
    pg.tap('.cine-st [data-cine=lire]', force=True); pg.wait_for_timeout(250)
    verifier(pg.evaluate("() => document.querySelector('.cine-ecran video').paused && window.__lus.length === 1"), '🔊 : le film s\'arrête, la réplique est lue')
    I = pg.evaluate("() => CINE_INFOS.chene")
    mots = lambda t: len([m for m in t.replace('\u2019', "'").split() if any(c.isalpha() for c in m)])
    lent = [(s[2], mots(s[2]), round(s[1] - s[0], 1)) for s in I['sousTitres'] if mots(s[2]) > 6 or (s[1] - s[0]) < 1.2 + .3 * mots(s[2])]
    verifier(not lent, f'des enfants lisent : six mots au plus par réplique, et chacune reste au moins 1,2 s + 0,3 s par mot ({lent})')
    verifier(not any('Léo' in s[2] or 'Léo' in (s[3] or '') or 'Leo' in (s[3] or '') for s in I['sousTitres']), 'le nom de Léo n\'est écrit nulle part dans le film')
    fin_du_film(pg)
    d = pg.evaluate("() => { var m = M.UI.modal || {}; return {type:m.type, titre:m.titre, code:m.code, texte:(document.querySelector('#voile') || {}).innerText || ''}; }")
    pg.screenshot(path=os.path.join(OUT, '5-fenetre.png'))
    verifier(d['code'] == 'info:rassemblement' and 'Rassembler le village' in (d['titre'] or '') and 'PFFFT' in d['texte'], f'à la fin du film : la fenêtre habituelle, le texte et le code à donner ({d["type"]}, {d["titre"]}, {d["code"]})')
    pg.reload(); pg.wait_for_timeout(1200)
    verifier(not pg.query_selector('.cine-ecran') and pg.evaluate("() => !!M.P().pages.rassemblement"), 'la page rechargée : le film ne repart pas, la page reste faite')

    print('— 2. « Passer ➜ »')
    pg = debut(b, 'Sage2', 'sage')
    rassembler(pg)
    pg.wait_for_selector('.cine-ecran [data-cine=passer]', timeout=15000); pg.wait_for_timeout(700)
    pg.tap('[data-cine=passer]', force=True)
    pg.wait_for_function("() => !document.querySelector('.cine-ecran') && M.UI.modal && M.UI.modal.code === 'info:rassemblement'", timeout=8000)
    verifier(True, '« Passer ➜ » : la fenêtre tout de suite, avec le code')

    print('— 3. Un équipier tape le code')
    code = pg.evaluate("() => M.codesEnquete(M.E()).parId['info:rassemblement']")
    pi = debut(b, 'Pisteur', 'pisteur')
    pi.evaluate("(c) => { M.UI.modal = null; M.UI.saisie = c.slice(0, 2); M.A.sym({dataset:{s:c[2]}}); }", code)
    pi.wait_for_selector('.cine-ecran video', timeout=15000)
    pi.wait_for_function("() => { var v = document.querySelector('.cine-ecran video'); return v && v.currentTime > 1; }", timeout=25000)
    verifier(pi.evaluate("() => !M.UI.modal && !!M.P().recus['info:rassemblement']"), 'le Pisteur tape le code : le film part, le code est déjà noté')
    fin_du_film(pi)
    d = pi.evaluate("() => { var m = M.UI.modal || {}; return {type:m.type, titre:m.titre}; }")
    verifier(d['type'] == 'info' and 'Le récit du rassemblement' in (d['titre'] or ''), f'puis la fenêtre « Tu as reçu : Le récit du rassemblement » ({d})')
    pi.evaluate("(c) => { M.UI.modal = null; M.UI.saisie = c.slice(0, 2); M.A.sym({dataset:{s:c[2]}}); }", code); pi.wait_for_timeout(900)
    verifier(pi.evaluate("() => !document.querySelector('.cine-ecran') && M.UI.modal && M.UI.modal.titre === 'Déjà reçu'"), 'le même code une deuxième fois : « Déjà reçu », pas de film')

    print('— 4. Sans le film')
    try: os.remove(os.path.join(DIST, 'cine', 'chene.mp4'))
    except OSError: pass
    pg = debut(b, 'Sage3', 'sage')
    rassembler(pg)
    pg.wait_for_function("() => !document.querySelector('.cine-ecran') && M.UI.modal && M.UI.modal.code === 'info:rassemblement'", timeout=30000); pg.wait_for_timeout(300)
    d = pg.evaluate("() => ({scene:!!document.querySelector('#voile .illu, #voile [class*=illu], #voile svg, #voile .b-illu'), illu:M.UI.modal.illu})")
    pg.screenshot(path=os.path.join(OUT, '6-sans-film.png'))
    verifier(d['illu'] == 'rassemblement', f'le film n\'arrive pas : la fenêtre s\'ouvre quand même, avec sa petite scène dessinée ({d})')
    b.close()

    print('— 5. Servi comme sur le site : téléchargé d\'avance la nuit, la bande-son avec la vidéo')
    PISTE = FILM[:-4] + '.mp3'
    verifier(os.path.exists(PISTE), 'la bande-son chene.mp3 existe (jeu/cine/sortie)')
    if avec: shutil.copy(FILM, os.path.join(DIST, 'cine', 'chene.mp4'))
    if os.path.exists(PISTE): shutil.copy(PISTE, os.path.join(DIST, 'cine', 'chene.mp3'))
    class Muet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Muet, directory=DIST))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    b = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    U = 'http://127.0.0.1:%d/index.html#test' % srv.server_address[1]
    pj = debut(b, 'SageJour', 'sage', U, moment=0)
    verifier(pj.evaluate("() => M.momentId() === 'matin' && !(M.UI.filmsPrevus || {}).chene"), 'le matin : le film n\'est pas encore téléchargé')
    pj.evaluate("() => { M.P().moment = 2; M.sauver(); M.render(); }")
    verifier(pj.evaluate("() => !!(M.UI.filmsPrevus || {}).chene"), 'la nuit tombe : le film est demandé d\'avance')
    ok = pj.evaluate("() => Promise.all([CineLecteur.precharger('cine/chene.mp4'), CineLecteur.prechargerPiste('cine/chene.mp3')]).then(function(r){ return [String(r[0]).slice(0, 5), r[1] ? r[1].byteLength : 0]; })")
    verifier(ok[0] == 'blob:' and ok[1] > 100000, f'le film et sa bande-son sont en mémoire avant qu\'on en ait besoin ({ok})')
    rassembler(pj)
    pj.wait_for_selector('.cine-ecran video', timeout=15000)
    pj.wait_for_function("() => { var v = document.querySelector('.cine-ecran video'); return v && v.currentTime > 2.0; }", timeout=20000)
    r = pj.evaluate("() => ({d:Object.assign({}, CineLecteur.dernier), sons:window.__sons.slice(), ctx:M.audioCtx() && M.audioCtx().state})")
    verifier(r['d'].get('bande') and r['d'].get('joue') and r['ctx'] == 'running', f'la bande-son est là et joue avec la vidéo ({r["d"]}, {r["ctx"]})')
    verifier(r['sons'] == [], f'aucun bruitage joué un par un ({r["sons"][:4]})')
    pj.screenshot(path=os.path.join(OUT, '7-site.png'))
    fin_du_film(pj)
    verifier(pj.evaluate("() => CineLecteur.dernier.joue === false && M.UI.modal && M.UI.modal.code === 'info:rassemblement'"), 'à la fin : la bande-son s\'arrête, la fenêtre s\'ouvre')
    b.close(); srv.shutdown()
    for f in ('chene.mp4', 'chene.mp3'):
        try: os.remove(os.path.join(DIST, 'cine', f))
        except OSError: pass
print('\nerreurs :', erreurs[:5])
print('ÉCHECS :', echecs) if echecs else print('tout est bon')
sys.exit(1 if echecs or erreurs else 0)
