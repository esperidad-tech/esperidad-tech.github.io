"""Les outils de la pub (jeu/pub/) : un petit serveur, une page de la taille d'une tablette, et « filmer » un écran du jeu AU RALENTI
   (le temps de la page est ralenti k fois, les photos sont prises aussi vite que possible, puis rangées à 30 images par seconde de jeu)."""
import os, sys, time, json, threading, http.server, socketserver, functools, shutil
S = '/home/claude/brumeval/brumeval-sources'; SITE = '/home/claude/esperidad-tech.github.io/brumeval'
DIST = os.environ.get('BRUMEVAL_DIST') or S + '/d-pub'
PLANS = '/tmp/pub/plans'; L, H, DSF = 800, 500, 1.25
def serveur(racine):
    class Muet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Muet, directory=racine)); srv.daemon_threads = True
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return 'http://127.0.0.1:%d/' % srv.server_address[1]
# le temps de la page, k fois plus lent (k < 1) : les horloges, les minuteries, les images d'animation ; le CSS est ralenti à part (CDP)
RALENTI = """(() => { var K = 1, pn = performance.now.bind(performance), D = Date, dn = Date.now.bind(Date), raf = window.requestAnimationFrame.bind(window), st = window.setTimeout.bind(window), si = window.setInterval.bind(window);
  var rp = pn(), vp = rp, rd = dn(), vd = rd;                                  /* le temps vrai et le temps de la page, au dernier changement de vitesse */
  function P(){ return vp + (pn() - rp) * K; }
  performance.now = P; Date.now = function(){ return vd + (dn() - rd) * K; };
  window.requestAnimationFrame = function(f){ return raf(function(){ f(P()); }); };
  window.setTimeout = function(f, d){ var a = Array.prototype.slice.call(arguments, 2); return st.apply(window, [f, (d || 0) / K].concat(a)); };
  window.setInterval = function(f, d){ var a = Array.prototype.slice.call(arguments, 2); return si.apply(window, [f, (d || 0) / K].concat(a)); };
  window.__ralentir = function(k){ vp = P(); rp = pn(); vd = Date.now(); rd = dn(); K = k; }; })();"""
def page(b, l=L, h=H, dsf=DSF, ralenti=None, tactile=True):
    cx = b.new_context(viewport={'width': l, 'height': h}, device_scale_factor=dsf, has_touch=tactile, is_mobile=False)
    pg = cx.new_page(); pg.set_default_timeout(15000)
    pg.add_init_script("window.BRUMEVAL_SANS_TUTO = true; try{ speechSynthesis.speak = function(){}; }catch(e){}")
    pg._k = 1
    if ralenti:
        pg.add_init_script(RALENTI); pg._cdp = cx.new_cdp_session(pg); pg._cdp.send('Animation.enable')
    return pg
def lent(pg, k):
    """à partir de maintenant, le temps de la page va k fois moins vite (k = 1 : normal)"""
    for f in pg.frames:
        try: f.evaluate('(k) => { if(window.__ralentir) window.__ralentir(k); }', k)
        except Exception: pass
    pg._cdp.send('Animation.setPlaybackRate', {'playbackRate': k}); pg._k = k
def filmer(pg, nom, duree, clip=None):
    """filme « duree » secondes DE JEU ; rend le nombre d'images (30 par seconde de jeu) rangées dans PLANS/nom/0000.jpg…"""
    d = os.path.join(PLANS, nom); shutil.rmtree(d, ignore_errors=True); os.makedirs(d + '/brut')
    k = pg._k; t0 = time.time(); prises = []
    while True:
        t = (time.time() - t0) * k
        if t > duree: break
        f = '%s/brut/%05d.jpg' % (d, len(prises)); pg.screenshot(path=f, type='jpeg', quality=92, **({'clip': clip} if clip else {})); prises.append((t, f))
    n = int(duree * 30)
    for i in range(n):
        t = i / 30.0; j = min(range(len(prises)), key=lambda q: abs(prises[q][0] - t)); shutil.copy(prises[j][1], '%s/%04d.jpg' % (d, i))
    shutil.rmtree(d + '/brut'); print(nom, ':', len(prises), 'photos →', n, 'images', flush=True)
    return n
def photo(pg, nom, i=0, clip=None):
    d = os.path.join(PLANS, nom); os.makedirs(d, exist_ok=True); pg.screenshot(path='%s/%04d.jpg' % (d, i), type='jpeg', quality=93, **({'clip': clip} if clip else {}))
def heros(pg, nom, role, url):
    pg.goto(url); pg.click('[data-act=creer]'); pg.click('[data-act=crea-role][data-r=%s]' % role); pg.click('[data-act=crea-suite]'); pg.fill('#nom', nom); pg.click('[data-act=crea-fin]')
def enquete(pg, n, moment=0):
    pg.evaluate("() => { M.S.heros.joueur = 'adulte'; M.sauver(); M.UI.ecran = 'reglages'; M.render(); }")
    pg.click('[data-act=mode-test][data-i="%d"]' % n); pg.click('#voile [data-act=confirmer-oui]')
    pg.click('[data-act=nouvelle-enquete]'); pg.wait_for_timeout(200)
    if pg.locator('[data-act=lettre-suite]').count(): pg.click('[data-act=lettre-suite]')
    pg.click('[data-act=commencer]'); pg.wait_for_timeout(500)
    pg.evaluate("(m) => { M.UI.modal = null; M.P().moment = m; M.sauver(); M.UI.ecran = 'enquete'; M.render(); }", moment)
