"""La scène du dessous se tait pendant un film (Bible §13.66 ; Romain, 17 novembre : sur Chrome, le film du puits ramait et celui de
la fin du donjon est resté figé sur sa première image alors qu'il se jouait).
  - pendant le film : tout ce qui est dans <body> à côté de l'écran du film est caché (visibility:hidden), les animations en cours du
    dessous sont en pause (CSS et Web Animations), celles de l'écran du film (le rond jaune d'attente, le fondu) ne le sont pas ;
  - à la fin (le film fini, « Passer ➜ », ou le film qui n'arrive pas) : tout revient comme avant (la visibilité d'origine, y compris
    une valeur posée à la main ; les animations repartent) ; une animation annulée pendant le film reste annulée ;
  - le film joue vraiment pendant ce temps (le temps avance), et le jeu d'en dessous n'a rien perdu (l'accueil est là).
   BRUMEVAL_DIST=<dossier construit> python3 tools/cine-dessous.py"""
import sys, os, shutil
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist'))
URL = 'file://' + os.path.join(DIST, 'index.html'); CINE = os.path.join(ICI, '..', 'cine', 'sortie')
echecs, erreurs = [], []
def verifier(cond, quoi):
    print('  ✓' if cond else '  ✗', quoi, flush=True)
    if not cond: echecs.append(quoi)
PREPARER = """() => {
  var s = document.createElement('style'); s.textContent = '@keyframes tst{0%{transform:translateX(0)}100%{transform:translateX(200px)}}'; document.head.appendChild(s);
  function boite(id, st){ var d = document.createElement('div'); d.id = id; d.style.cssText = 'position:fixed;left:10px;top:' + (st || 10) + 'px;width:30px;height:30px;background:red'; document.body.appendChild(d); return d; }
  var a = boite('t-css', 10); a.style.animation = 'tst 5s linear infinite';           /* une animation CSS */
  var b = boite('t-wa', 60); window.__wa = b.animate([{opacity:1}, {opacity:.2}], {duration:4000, iterations:Infinity});   /* une Web Animation */
  var c = boite('t-annulee', 110); window.__ann = c.animate([{opacity:1}, {opacity:.5}], {duration:4000, iterations:Infinity});
  var d = boite('t-main', 160); d.style.visibility = 'visible';                         /* une visibilité posée à la main */
  return true; }"""
ETAT = """() => {
  var ec = document.querySelector('.cine-ecran'), v = document.querySelector('.cine-ecran video');
  var cache = Array.from(document.body.children).filter(function(e){ return e !== ec && !e.contains(ec) && e.tagName !== 'SCRIPT' && e.tagName !== 'STYLE'; });
  var dessous = document.getAnimations().filter(function(a){ var t = a.effect && a.effect.target; return t && !(ec && ec.contains(t)); });
  var du_film = document.getAnimations().filter(function(a){ var t = a.effect && a.effect.target; return t && ec && ec.contains(t); });
  return {ecran:!!ec, temps:v ? v.currentTime : -1, joue:v ? !v.paused : false,
    tousCaches:cache.length > 0 && cache.every(function(e){ return getComputedStyle(e).visibility === 'hidden'; }), nbCaches:cache.length,
    enMarche:dessous.filter(function(a){ return a.playState === 'running'; }).length, enPause:dessous.filter(function(a){ return a.playState === 'paused'; }).length,
    filmEnMarche:du_film.filter(function(a){ return a.playState === 'running'; }).length, filmEnPause:du_film.filter(function(a){ return a.playState === 'paused'; }).length,
    wa:window.__wa.playState, ann:window.__ann.playState,
    visTest:['t-css', 't-wa', 't-annulee', 't-main'].map(function(i){ return document.getElementById(i).style.visibility + '|' + getComputedStyle(document.getElementById(i)).visibility; }),
    accueil:!!document.querySelector('[data-act=creer]')}; }"""
with sync_playwright() as p:
    b = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    os.makedirs(os.path.join(DIST, 'cine'), exist_ok=True)
    for f in ('puits.mp4', 'puits.mp3'):
        src = os.path.join(CINE, f)
        if os.path.exists(src): shutil.copy(src, os.path.join(DIST, 'cine', f))
    verifier(os.path.exists(os.path.join(DIST, 'cine', 'puits.mp4')), 'la vidéo puits.mp4 est là (jeu/cine/sortie)')
    pg = b.new_context(viewport={'width': 1180, 'height': 820}, has_touch=True).new_page(); pg.set_default_timeout(9000)
    pg.on('console', lambda m: erreurs.append(m.text) if m.type == 'error' and 'net::' not in m.text and 'fonts' not in m.text and 'ERR_' not in m.text and 'Failed to load' not in m.text else None)
    pg.on('pageerror', lambda e: erreurs.append('PAGEERROR ' + str(e)))
    pg.add_init_script("window.BRUMEVAL_SANS_TUTO = true;")
    pg.goto(URL); pg.wait_for_timeout(1200)
    pg.evaluate(PREPARER); pg.wait_for_timeout(300)
    avant = pg.evaluate(ETAT)
    verifier(avant['enMarche'] >= 2 and avant['accueil'], f'avant le film : les animations du dessous tournent, l\'accueil est là ({avant["enMarche"]} en marche)')

    print('— 1. Pendant le film')
    pg.evaluate("() => { window.__fin = null; M.jouerFilm('puits', function(r){ window.__fin = r || 'ok'; }); }")
    pg.wait_for_selector('.cine-ecran video', timeout=15000)
    pg.wait_for_function("() => { var v = document.querySelector('.cine-ecran video'); return v && v.currentTime > 1.0; }", timeout=25000)
    pg.wait_for_timeout(800)
    e1 = pg.evaluate(ETAT)
    verifier(e1['tousCaches'] and e1['nbCaches'] >= 3, f'tout ce qui est dans <body> à côté du film est caché ({e1["nbCaches"]} éléments)')
    verifier(e1['enMarche'] == 0 and e1['enPause'] >= 2, f'les animations du dessous sont en pause ({e1["enPause"]} en pause, {e1["enMarche"]} en marche)')
    verifier(e1['wa'] == 'paused', 'la Web Animation d\'essai est en pause')
    verifier(e1['filmEnPause'] == 0, f'les animations du film lui-même ne sont pas en pause ({e1["filmEnPause"]})')
    verifier(e1['joue'] and e1['temps'] > 1.0, f'le film joue ({e1["temps"]:.2f} s)')
    pg.evaluate("() => { window.__ann.cancel(); }")                        # annulée pendant le film : elle le reste
    t1 = e1['temps']; pg.wait_for_timeout(1500); e1b = pg.evaluate(ETAT)
    verifier(e1b['temps'] > t1 + 1.0, f'le film avance ({t1:.2f} → {e1b["temps"]:.2f} s)')
    pg.screenshot(path=os.path.join(ICI, '..', 'test', 'cine-dessous-film.png')) if os.path.isdir(os.path.join(ICI, '..', 'test')) else None

    print('— 2. « Passer ➜ » : tout revient')
    pg.tap('[data-cine=passer]', force=True); pg.wait_for_function("() => !document.querySelector('.cine-ecran')", timeout=8000); pg.wait_for_timeout(300)
    e2 = pg.evaluate(ETAT)
    verifier(pg.evaluate("() => window.__fin") == 'passe', 'le film répond « passe »')
    verifier(not e2['ecran'] and e2['accueil'], 'l\'écran du film est parti, l\'accueil est là')
    verifier(e2['wa'] == 'running', 'la Web Animation repart')
    verifier(e2['ann'] == 'idle', 'l\'animation annulée pendant le film reste annulée')
    verifier(e2['enMarche'] >= 2 and e2['enPause'] == 0, f'les animations du dessous tournent de nouveau ({e2["enMarche"]} en marche, {e2["enPause"]} en pause)')
    verifier(e2['visTest'][3].startswith('visible|'), f'la visibilité posée à la main revient ({e2["visTest"][3]})')
    verifier(all(v.startswith('|') or v.startswith('visible|') for v in e2['visTest']), f'plus rien de caché ({e2["visTest"]})')
    verifier(pg.evaluate("() => Array.from(document.body.children).filter(function(e){ return e.style.visibility === 'hidden'; }).length") == 0, 'plus aucun élément de <body> en visibility:hidden')

    print('— 3. Le film fini tout seul')
    pg.evaluate("() => { window.__fin = null; M.jouerFilm('puits', function(r){ window.__fin = r || 'ok'; }); }")
    pg.wait_for_selector('.cine-ecran video', timeout=15000)
    pg.wait_for_function("() => { var v = document.querySelector('.cine-ecran video'); return v && v.currentTime > .5; }", timeout=25000)
    pg.evaluate("() => { var v = document.querySelector('.cine-ecran video'); v.currentTime = v.duration - .3; }")
    pg.wait_for_function("() => !document.querySelector('.cine-ecran')", timeout=15000); pg.wait_for_timeout(300)
    e3 = pg.evaluate(ETAT)
    verifier(pg.evaluate("() => window.__fin") == 'fini' and e3['accueil'] and e3['wa'] == 'running', 'fini : le jeu est revenu, la Web Animation tourne')
    verifier(pg.evaluate("() => Array.from(document.body.children).filter(function(e){ return e.style.visibility === 'hidden'; }).length") == 0, 'plus rien de caché après la fin')

    print('— 4. Le film qui n\'arrive pas')
    pg.evaluate("() => { window.__fin = null; window.CineLecteur.essai = 'cine/nexiste-pas.mp4'; M.jouerFilm('puits', function(r){ window.__fin = r || 'ok'; }); }")
    pg.wait_for_function("() => window.__fin !== null", timeout=25000); pg.wait_for_timeout(400)
    e4 = pg.evaluate(ETAT)
    verifier(pg.evaluate("() => window.__fin") == 'echec' and not e4['ecran'], 'le film n\'arrive pas : « echec », l\'écran du film est parti')
    verifier(e4['accueil'] and e4['wa'] == 'running' and pg.evaluate("() => Array.from(document.body.children).filter(function(e){ return e.style.visibility === 'hidden'; }).length") == 0, 'et le jeu d\'en dessous est intact')
    pg.evaluate("() => { window.CineLecteur.essai = null; }")

    print('— 5. Deux films de suite, puis une page chargée d\'animations')
    pg.evaluate("() => { window.__fin = null; M.jouerFilm('puits', function(r){ window.__fin = r || 'ok'; }); }")
    pg.wait_for_selector('.cine-ecran video', timeout=15000); pg.wait_for_timeout(600)
    pg.tap('[data-cine=passer]', force=True); pg.wait_for_function("() => !document.querySelector('.cine-ecran')", timeout=8000)
    pg.evaluate("() => { window.__fin = null; M.jouerFilm('puits', function(r){ window.__fin = r || 'ok'; }); }")
    pg.wait_for_selector('.cine-ecran video', timeout=15000); pg.wait_for_timeout(600)
    pg.tap('[data-cine=passer]', force=True); pg.wait_for_function("() => !document.querySelector('.cine-ecran')", timeout=8000); pg.wait_for_timeout(300)
    e5 = pg.evaluate(ETAT)
    verifier(e5['accueil'] and e5['wa'] == 'running' and e5['visTest'][3].startswith('visible|'), 'après deux films de suite, tout est revenu')
    verifier(not erreurs, f'aucune erreur dans la page ({erreurs[:3]})')
    b.close()
print('\n', 'ÉCHECS :' if echecs else 'TOUT EST VERT', echecs if echecs else '')
sys.exit(1 if echecs else 0)
