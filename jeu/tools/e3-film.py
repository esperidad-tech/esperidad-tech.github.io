"""Enquête 3 : la cinématique du maire, en film, au début de la fin (Bible §13.45) — sur une tablette, avec la vraie vidéo
   (copiée dans <dossier construit>/cine/ ; sans elle, le robot vérifie que les quatre images d'avant restent).
  - la fin commence : le film part tout seul, en 21:9 entre deux bandes noires, avec « Passer ➜ » ; ses bruitages (le moteur de son
    de l'Atelier, dans le jeu) ; les sous-titres du maire et de Silas, avec leur 🔊 ; jamais de lecture toute seule ;
  - à la fin du film : on arrive au cachot (les quatre images qu'il remplace sont sautées), puis « Fin de l'enquête 3 » ;
  - sans le film : les quatre images, comme avant ;
  - LA BANDE-SON (servie comme sur le site, par un petit serveur) : elle est là et joue avec la vidéo ; plus de bruitages un par un.
   BRUMEVAL_DIST=<dossier construit> python3 tools/e3-film.py"""
import sys, os, json, shutil, threading, http.server, socketserver, functools
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist'))
URL = 'file://' + os.path.join(DIST, 'index.html') + '#test'
FILM = os.path.join(ICI, '..', 'cine', 'sortie', 'finMaire.mp4')
OUT = os.path.join(ICI, '..', 'test', 'e3-film'); os.makedirs(OUT, exist_ok=True)
erreurs, echecs = [], []

def verifier(cond, quoi):
    print('  ✓' if cond else '  ✗', quoi, flush=True)
    if not cond: echecs.append(quoi)

def debut(b, nom, role, url=None):
    pg = b.new_context(viewport={'width': 1180, 'height': 820}, has_touch=True).new_page()
    pg.set_default_timeout(9000)
    pg.on('console', lambda m: erreurs.append(f'[{nom}] {m.text}') if m.type == 'error' and 'net::' not in m.text and 'fonts' not in m.text and 'ERR_' not in m.text and 'Failed to load' not in m.text and 'fetching the script' not in m.text else None)   # (le service worker n'est ajouté qu'à la mise en ligne)
    pg.on('pageerror', lambda e: erreurs.append(f'[{nom}] PAGEERROR {e}'))
    pg.add_init_script("window.BRUMEVAL_SANS_TUTO = true; window.BRUMEVAL_SANS_DONJON = true; window.__parle = 0; try{ speechSynthesis.speak = function(){ window.__parle++; }; }catch(e){}")
    pg.goto(url or URL)
    pg.click('[data-act=creer]'); pg.click(f'[data-act=crea-role][data-r={role}]'); pg.click('[data-act=crea-suite]'); pg.fill('#nom', nom); pg.click('[data-act=crea-fin]')
    pg.evaluate("() => { M.S.heros.joueur = 'adulte'; M.sauver(); M.UI.ecran = 'reglages'; M.render(); }")
    pg.click('[data-act=mode-test][data-i="3"]'); pg.click('#voile [data-act=confirmer-oui]')
    pg.click('[data-act=nouvelle-enquete]'); pg.wait_for_timeout(200)
    if pg.locator('[data-act=lettre-suite]').count(): pg.click('[data-act=lettre-suite]')
    pg.click('[data-act=commencer]'); pg.wait_for_timeout(500)
    pg.evaluate("() => { window.__lus = []; var l = M.lire; M.lire = function(t){ window.__lus.push(String(t)); }; window.__sons = []; var s = CineLecteur.sonJeu; CineLecteur.sonJeu = function(id){ window.__sons.push(id); return s(id); }; }")
    return pg

def fin(pg):
    pg.evaluate("() => { M.UI.modal = null; M.A['fin-sage']({dataset:{n:1}, closest:function(){ return null; }}); }"); pg.wait_for_timeout(300)

with sync_playwright() as p:
    b = p.chromium.launch()
    os.makedirs(os.path.join(DIST, 'cine'), exist_ok=True)
    avec = os.path.exists(FILM)
    verifier(avec, 'la vidéo finMaire.mp4 existe (jeu/cine/sortie)')
    if avec: shutil.copy(FILM, os.path.join(DIST, 'cine', 'finMaire.mp4'))
    print('— 1. Avec le film')
    pg = debut(b, 'Sage', 'sage')
    fin(pg)
    pg.wait_for_selector('.cine-ecran video', timeout=15000)
    # (on laisse passer les premiers pas — l'écho à 0,9 s, la lanterne, le premier pas dans l'escalier à 2,7 s — avant de sauter plus loin)
    pg.wait_for_function("() => { var v = document.querySelector('.cine-ecran video'); return v && v.currentTime > 3.0; }", timeout=20000)
    r = pg.evaluate("""() => { var c = document.querySelector('.cine-cadre').getBoundingClientRect();
      return {ratio:c.width / c.height, haut:c.top, bas:innerHeight - c.bottom, passer:!!document.querySelector('[data-cine=passer]'), slide:M.P().fin.slide}; }""")
    verifier(abs(r['ratio'] - 1440 / 616) < .02 and r['haut'] > 60 and abs(r['haut'] - r['bas']) < 2 and r['passer'] and r['slide'] == 0, f'la fin commence : le film, en 21:9 entre deux bandes noires, « Passer ➜ » ({r})')
    pg.evaluate("() => { document.querySelector('.cine-ecran video').currentTime = 11.5; }")
    pg.wait_for_function("() => { var s = document.querySelector('.cine-st'); return s && s.classList.contains('on'); }", timeout=10000)
    st = pg.evaluate("() => ({qui:document.querySelector('.cine-qui').textContent, txt:document.querySelector('.cine-txt').textContent, lire:!!document.querySelector('.cine-st [data-cine=lire]')})")
    pg.screenshot(path=os.path.join(OUT, '1-maire.png'))
    verifier(st['qui'] == 'Le maire' and 'Que s\'est-il passé ici' in st['txt'] and st['lire'], f'le sous-titre du maire, avec son 🔊 ({st})')
    s = pg.evaluate("() => window.__sons.slice()")
    verifier(len(s) >= 3 and 'cinePasEscalier' in s, f'les bruitages du film partent (le moteur de l\'Atelier, dans le jeu) ({s[:6]})')
    verifier(pg.evaluate("() => window.__lus.length + window.__parle") == 0, 'aucune lecture vocale toute seule')
    pg.tap('.cine-st [data-cine=lire]', force=True); pg.wait_for_timeout(250)
    verifier(pg.evaluate("() => document.querySelector('.cine-ecran video').paused && window.__lus.length === 1"), '🔊 : le film s\'arrête, la réplique est lue')
    pg.evaluate("() => { var v = document.querySelector('.cine-ecran video'); v.play(); v.currentTime = 16.6; }"); pg.wait_for_timeout(600)
    pg.screenshot(path=os.path.join(OUT, '2-bague.png'))
    pg.evaluate("() => { var v = document.querySelector('.cine-ecran video'); v.currentTime = v.duration - .3; }")
    pg.wait_for_function("() => !document.querySelector('.cine-ecran') && M.P().fin.filmFait", timeout=15000); pg.wait_for_timeout(300)
    d = pg.evaluate("() => ({slide:M.P().fin.slide, prison:!!document.querySelector('.b-fin-slide .b-prison')})")
    pg.screenshot(path=os.path.join(OUT, '3-cachot.png'))
    verifier(d['slide'] == 4 and d['prison'], f'à la fin du film : le cachot (les quatre images qu\'il remplace sont sautées) ({d})')
    pg.locator('[data-act=fin-suite]').click(); pg.wait_for_timeout(300)
    verifier('Fin de l\'enquête 3' in pg.inner_text('.b-fin-slide'), '« Fin de l\'enquête 3 »')
    pg.reload(); pg.wait_for_timeout(1200)
    verifier(not pg.query_selector('.cine-ecran'), 'la page rechargée : le film ne repart pas')
    print('— 2. Sans le film')
    try: os.remove(os.path.join(DIST, 'cine', 'finMaire.mp4'))
    except OSError: pass
    pg2 = debut(b, 'Sage2', 'sage')
    fin(pg2); pg2.wait_for_timeout(1500)
    d = pg2.evaluate("() => ({slide:M.P().fin.slide, film:!!document.querySelector('.cine-ecran'), fait:M.P().fin.filmFait, scene:!!document.querySelector('.b-fin-slide .sf-scene')})")
    verifier(d['slide'] == 0 and not d['film'] and d['fait'] and d['scene'], f'le film n\'arrive pas : les images d\'avant, comme avant ({d})')
    b.close()
    print('— 3. La bande-son (servie comme sur le site)')
    PISTE = FILM[:-4] + '.mp3'
    verifier(os.path.exists(PISTE), 'la bande-son finMaire.mp3 existe (jeu/cine/sortie)')
    if avec: shutil.copy(FILM, os.path.join(DIST, 'cine', 'finMaire.mp4'))
    if os.path.exists(PISTE): shutil.copy(PISTE, os.path.join(DIST, 'cine', 'finMaire.mp3'))
    class Muet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Muet, directory=DIST))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    b = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    pg3 = debut(b, 'Sage3', 'sage', 'http://127.0.0.1:%d/index.html#test' % srv.server_address[1])
    fin(pg3)
    pg3.wait_for_selector('.cine-ecran video', timeout=15000)
    pg3.wait_for_function("() => { var v = document.querySelector('.cine-ecran video'); return v && v.currentTime > 3.0; }", timeout=20000)
    r = pg3.evaluate("() => ({d:Object.assign({}, CineLecteur.dernier), sons:window.__sons.slice(), ctx:M.audioCtx() && M.audioCtx().state})")
    verifier(r['d'].get('bande') and r['d'].get('joue') and r['ctx'] == 'running', f'la bande-son est là et joue avec la vidéo ({r["d"]}, {r["ctx"]})')
    verifier(r['sons'] == [] and r['d'].get('bruitages') == 0, f'plus aucun bruitage joué un par un ({r["sons"][:4]})')
    pg3.evaluate("() => { var v = document.querySelector('.cine-ecran video'); v.currentTime = v.duration - .3; }")
    pg3.wait_for_function("() => !document.querySelector('.cine-ecran') && M.P().fin.filmFait", timeout=15000)
    verifier(pg3.evaluate("() => CineLecteur.dernier.joue") is False and pg3.evaluate("() => M.P().fin.slide") == 4, 'à la fin du film : la bande-son s\'arrête, le cachot')
    b.close(); srv.shutdown()
    for f in ('finMaire.mp4', 'finMaire.mp3'):
        try: os.remove(os.path.join(DIST, 'cine', f))
        except OSError: pass
print('\nerreurs :', erreurs[:5])
print('ÉCHECS :', echecs) if echecs else print('tout est bon')
sys.exit(1 if (echecs or erreurs) else 0)
