"""Les cinématiques en film dans le combat de Léo (Bible §13.45) : python3 test-cine.py   (sous le verrou : flock /tmp/brumeval-pw.lock …)

Sur une tablette 1024 x 768, avec les vraies vidéos (jeu/cine/sortie/*.mp4, données au lecteur par CineLecteur.essai) :
  - fin de la phase 1 : le film part tout seul, en 21:9 entre deux bandes noires ; il avance ; ses bruitages partent à l'heure
    (le moteur de son du donjon : DJ.bruit) ; « Passer ➜ » ; après lui, la phase 2 (Léo, 6 000) et les outils ramassés ;
  - fin de la phase 2 : les sous-titres (« Très bien… », « Je n'ai pas le choix. ») dans la bande noire, avec le nom de Léo et un 🔊 ;
    toucher 🔊 arrête le film et lit la phrase (jamais toute seule) ; il repart ; après lui, la phase 3 ;
  - la victoire : le film de Léo qui parle, sans « Passer » la première fois ; ses dix sous-titres sont ses cinq phrases validées,
    mot pour mot ; à la fin du film : la victoire (leo:phase = 4, leo:finVu = 1) ;
  - sans film (pas d'internet) : l'ancienne scène, dessinée en direct ;
  - aucune erreur JavaScript."""
import os, sys
from playwright.sync_api import sync_playwright

ICI = os.path.dirname(os.path.abspath(__file__))
PAGE = 'file://' + os.path.join(ICI, 'sortie', 'index.html')
FILMS = os.path.join(os.path.dirname(os.path.dirname(ICI)), 'cine', 'sortie')
CAP = os.path.join(ICI, 'captures'); os.makedirs(CAP, exist_ok=True)
ERREURS, OK = [], []
OBJETS = 'objets=sage:cristal-lune,sage:baton-chene,pisteur:fleches-lourdes,pisteur:fleches-argent&potions=toutes&graine=7'


def verifie(cond, quoi):
    (OK if cond else ERREURS).append(quoi)
    print(('  ok  ' if cond else '  ÉCHEC  ') + quoi, flush=True)


def ouvrir(nav, q):
    ctx = nav.new_context(viewport={'width': 1024, 'height': 768}, device_scale_factor=1, has_touch=True, is_mobile=True)
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
    pg.on('console', lambda m: errs.append(m.type + ': ' + m.text[:160]) if m.type in ('error', 'warning') and 'ERR_' not in m.text else None)
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    pg.route('**/fonts.gstatic.com/**', lambda r: r.fulfill(status=404, body=''))
    pg.add_init_script("""window.__parle = 0; window.__bruits = [];
      try{ speechSynthesis.speak = function(u){ window.__parle++; window.__dit = u.text; }; }catch(e){}""")
    pg.goto(PAGE + q)
    pg.wait_for_function("() => window.DJ && DJ.Leo && DJ.Leo.etat() && !DJ.Leo.etat().cine", timeout=90000)
    pg.evaluate("() => { var b = DJ.bruit; DJ.bruit = function(id){ window.__bruits.push(id); return b.apply(this, arguments); }; }")
    return ctx, pg, errs


def film(pg, nom):
    pg.evaluate("(u) => { CineLecteur.essai = u; }", 'file://' + os.path.join(FILMS, nom + '.mp4'))


def attendre_film(pg):
    pg.wait_for_selector('.cine-ecran video', timeout=20000)
    pg.wait_for_function("() => { var v = document.querySelector('.cine-ecran video'); return v && v.currentTime > .3; }", timeout=20000)


def test(nav):
    for n in ('a12', 'b23', 'finLeo'):
        verifie(os.path.exists(os.path.join(FILMS, n + '.mp4')), f'la vidéo {n}.mp4 existe')
    print('— 1. Fin de la phase 1 : le film')
    ctx, pg, errs = ouvrir(nav, '?combat=leo&vu=1&phase=1&' + OBJETS)
    film(pg, 'a12')
    pg.evaluate("() => { var c = DJ.Leo._E().c; c.leo.pv = 6030; DJ.Leo.agir('pisteur', 'dague'); }")
    attendre_film(pg)
    r = pg.evaluate("""() => { var e = document.querySelector('.cine-ecran'), c = document.querySelector('.cine-cadre').getBoundingClientRect();
      return {plein:e.getBoundingClientRect().width === innerWidth && e.getBoundingClientRect().height === innerHeight, ratio:c.width / c.height,
              haut:c.top, bas:innerHeight - c.bottom, passer:!!e.querySelector('[data-cine=passer]'), fond:getComputedStyle(e).backgroundColor}; }""")
    verifie(r['plein'] and abs(r['ratio'] - 1440 / 616) < .02 and r['haut'] > 100 and abs(r['haut'] - r['bas']) < 2 and r['fond'] == 'rgb(0, 0, 0)',
            f'le film en plein écran, en 21:9, entre deux bandes noires ({r})')
    verifie(r['passer'], 'un bouton « Passer ➜ »')
    pg.wait_for_function("() => document.querySelector('.cine-ecran video').currentTime > 1.6", timeout=20000)
    pg.screenshot(path=os.path.join(CAP, 'cine-a12.png'))
    b = pg.evaluate("() => window.__bruits.slice()")
    verifie('leoChute' in b and 'cineOutils' in b, f'les bruitages partent à l\'heure (le moteur du donjon) ({b})')
    pg.tap('[data-cine=passer]', force=True)
    pg.wait_for_function("() => DJ.Leo.etat().phase === 2 && !DJ.Leo.etat().cine", timeout=30000)
    e = pg.evaluate("() => { var e = DJ.Leo.etat(), p = e.photo; return {nom:document.querySelector('#leo-barre em').textContent, pv:p.leo.pv, film:!!document.querySelector('.cine-ecran')}; }")
    verifie(e['nom'] == 'Léo' and e['pv'] == 6000 and not e['film'], f'après le film : la phase 2, « Léo », 6 000 ({e})')

    print('— 2. Fin de la phase 2 : les sous-titres, le 🔊')
    film(pg, 'b23')
    pg.evaluate("() => { var c = DJ.Leo._E().c; c.leo.pv = 3030; DJ.Leo.agir('pisteur', 'fleche', 'leo'); }")
    attendre_film(pg)
    pg.evaluate("() => { document.querySelector('.cine-ecran video').currentTime = 3.7; }")
    pg.wait_for_function("() => { var s = document.querySelector('.cine-st'); return s && s.classList.contains('on'); }", timeout=10000)
    r = pg.evaluate("""() => { var s = document.querySelector('.cine-st'), c = document.querySelector('.cine-cadre').getBoundingClientRect(), b = s.getBoundingClientRect();
      return {txt:s.querySelector('.cine-txt').textContent, qui:s.querySelector('.cine-qui').textContent, lire:!!s.querySelector('[data-cine=lire]'), dessous:b.top >= c.bottom - 1}; }""")
    pg.screenshot(path=os.path.join(CAP, 'cine-b23.png'))
    verifie(r['txt'] == '« Très bien… »' and r['qui'] == 'Léo' and r['lire'] and r['dessous'], f'le sous-titre, dans la bande noire du bas, avec qui parle et son 🔊 ({r})')
    verifie(pg.evaluate("() => window.__parle") == 0, 'aucune lecture vocale toute seule')
    pg.tap('.cine-st [data-cine=lire]', force=True); pg.wait_for_timeout(300)
    r = pg.evaluate("() => ({pause:document.querySelector('.cine-ecran video').paused, parle:window.__parle, dit:window.__dit})")
    verifie(r['pause'] and r['parle'] == 1 and 'Très bien' in (r['dit'] or ''), f'🔊 : le film s\'arrête et la phrase est lue ({r})')
    pg.wait_for_function("() => !document.querySelector('.cine-ecran video').paused", timeout=10000)
    verifie(True, 'puis le film repart')
    pg.tap('[data-cine=passer]', force=True)
    pg.wait_for_function("() => DJ.Leo.etat().phase === 3 && !DJ.Leo.etat().cine", timeout=30000)
    verifie(pg.evaluate("() => DJ.Leo.etat().photo.leo.pv") == 3000, 'après le film : la phase 3')

    print('— 3. La victoire : Léo parle (le film)')
    film(pg, 'finLeo')
    pg.evaluate("() => { DJ.Leo._E().c.leo.pv = 5; }")
    attendre_film(pg)
    verifie(not pg.query_selector('[data-cine=passer]'), 'la première fois, pas de « Passer » (c\'est l\'histoire)')
    st = pg.evaluate("() => CINE_INFOS.finLeo.sousTitres.map(function(s){ return s[2]; }).join(' ')")
    aveux = pg.evaluate("() => DJ.Leo.AVEUX.join(' ')")
    verifie(st == aveux, 'ses sous-titres sont ses cinq phrases validées par Romain, mot pour mot')
    pg.evaluate("() => { var v = document.querySelector('.cine-ecran video'); v.currentTime = 30.9; }"); pg.wait_for_timeout(700)
    pg.screenshot(path=os.path.join(CAP, 'cine-finleo.png'))
    pg.evaluate("() => { var v = document.querySelector('.cine-ecran video'); v.currentTime = v.duration - .3; }")
    pg.wait_for_function("() => window.RESULTAT === 'victoire'", timeout=20000)
    e = pg.evaluate("() => [window.PARTIE.faits['leo:phase'], window.PARTIE.faits['leo:finVu'], !!document.querySelector('.cine-ecran')]")
    verifie(e[0] == 4 and e[1] == 1, f'à la fin du film : la victoire, gardée ({e})')
    verifie(pg.evaluate("() => window.__parle") == 1, 'aucune autre lecture vocale toute seule')
    verifie(errs == [], f'aucune erreur ni avertissement JavaScript {errs[:3]}')
    ctx.close()

    print('— 4. Sans film : l\'ancienne scène')
    ctx, pg, errs = ouvrir(nav, '?combat=leo&vu=1&phase=1&' + OBJETS)
    pg.evaluate("() => { CineLecteur.essai = ''; var c = DJ.Leo._E().c; c.leo.pv = 6030; DJ.Leo.agir('pisteur', 'dague'); }")
    pg.wait_for_selector('#leo-cine [data-act=l-passer]', timeout=20000)
    verifie(not pg.query_selector('.cine-ecran'), 'le film n\'arrive pas : la scène dessinée en direct, comme avant')
    pg.tap('#leo-cine [data-act=l-passer]', force=True)
    pg.wait_for_function("() => DJ.Leo.etat().phase === 2 && !DJ.Leo.etat().cine", timeout=30000)
    verifie(errs == [], f'aucune erreur ni avertissement JavaScript {errs[:3]}')
    ctx.close()


with sync_playwright() as p:
    nav = p.chromium.launch()
    try: test(nav)
    finally: nav.close()
print('\n%d vérifications, %d échecs' % (len(OK) + len(ERREURS), len(ERREURS)))
for e in ERREURS: print('  ÉCHEC :', e)
sys.exit(1 if ERREURS else 0)
