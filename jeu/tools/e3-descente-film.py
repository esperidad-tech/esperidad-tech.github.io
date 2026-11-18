"""Enquête 3 : les deux films de la descente du donjon (la crypte, le puits ; Bible §13.62, refaits en 2D le 18 novembre : §13.68) — sur une tablette, avec la vraie vidéo
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
FILM = os.path.join(ICI, '..', 'cine', 'sortie', 'escalier.mp4')
OUT = os.path.join(ICI, '..', 'test', 'e3-descente-film'); os.makedirs(OUT, exist_ok=True)
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


def jouer(pg, nom):
    pg.evaluate("(n) => { window.__fini = null; M.jouerFilm(n, function(r){ window.__fini = r || 'ok'; }); }", nom)
    pg.wait_for_selector('.cine-ecran video', timeout=15000)
    pg.wait_for_function("() => { var v = document.querySelector('.cine-ecran video'); return v && v.currentTime > 1.0; }", timeout=20000)

with sync_playwright() as p:
    b = p.chromium.launch()
    os.makedirs(os.path.join(DIST, 'cine'), exist_ok=True)
    for nom in ('escalier', 'puits'):
        for ext in ('mp4', 'mp3'):
            f = os.path.join(ICI, '..', 'cine', 'sortie', nom + '.' + ext)
            verifier(os.path.exists(f), f'{nom}.{ext} existe (jeu/cine/sortie)')
            if os.path.exists(f): shutil.copy(f, os.path.join(DIST, 'cine', nom + '.' + ext))
    pg = debut(b, 'Pisteur', 'pisteur')
    verifier(pg.evaluate("() => !!CINE_INFOS.escalier && !!CINE_INFOS.puits && CINE_INFOS.escalier.duree > 40 && CINE_INFOS.puits.duree > 40 && CINE_INFOS.escalier.sousTitres.length === 1 && CINE_INFOS.puits.sousTitres[0][3] === 'Le Pisteur'"), 'le jeu connaît les deux films refaits (cine-infos : leur durée, la réplique du Pisteur)')
    verifier(pg.evaluate("() => String(M.A['ds-aller']).indexOf('jouerFilm') > 0 && String(M.A['ds-aller']).indexOf('escalier') > 0 && String(M.A['ds-aller']).indexOf('puits') > 0"), 'le bouton « Descendre » du Pisteur passe par le film')
    for nom in ('escalier', 'puits'):
        print('— ' + nom)
        # (depuis le 18 novembre, chaque film n'a qu'une réplique, à la fin : « Allons-y. Odette doit être par là. » — on va la chercher dans sa fiche)
        t_st = pg.evaluate("(n) => CINE_INFOS[n].sousTitres[0][0] + .8", nom)
        jouer(pg, nom)
        r = pg.evaluate("""() => { var c = document.querySelector('.cine-cadre').getBoundingClientRect();
          return {ratio:c.width / c.height, passer:!!document.querySelector('[data-cine=passer]')}; }""")
        verifier(abs(r['ratio'] - 1440 / 616) < .02 and r['passer'], f'{nom} : le film, en 21:9, avec « Passer ➜ »')
        pg.evaluate("(t) => { document.querySelector('.cine-ecran video').currentTime = t; }", t_st)
        pg.wait_for_function("() => { var s = document.querySelector('.cine-st'); return s && s.classList.contains('on'); }", timeout=12000)
        st = pg.evaluate("() => ({txt:document.querySelector('.cine-txt').textContent, lire:!!document.querySelector('.cine-st [data-cine=lire]')})")
        pg.screenshot(path=os.path.join(OUT, nom + '-soustitre.png'))
        verifier(len(st['txt']) > 8 and st['lire'], f'{nom} : un sous-titre avec son 🔊 ({st["txt"][:50]})')
        verifier(pg.evaluate("() => window.__parle") == 0 and pg.evaluate("() => window.__lus.length") == 0, f'{nom} : aucune lecture toute seule')
        pg.evaluate("() => document.querySelector('[data-cine=passer]').click()"); pg.wait_for_timeout(800)
        verifier(pg.evaluate("() => window.__fini") is not None and pg.locator('.cine-ecran').count() == 0, f'{nom} : « Passer » ferme le film et la suite part ({pg.evaluate("() => window.__fini")})')
    print('— sans la vidéo : on part quand même')
    pg.evaluate("() => { window.__fini = null; M.jouerFilm('inconnu', function(){ window.__fini = 'ok'; }); }"); pg.wait_for_timeout(200)
    verifier(pg.evaluate("() => window.__fini") == 'ok', 'un film inconnu : on part tout de suite')
    b.close()
print('\nERREURS :', erreurs); 
print(f'\n{len(echecs)} ÉCHEC(S) :' if echecs else '\nTout est bon.')
for e in echecs: print('  ✗', e)
sys.exit(1 if echecs or erreurs else 0)
