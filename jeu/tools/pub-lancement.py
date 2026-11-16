"""La pub de 30 secondes au lancement du jeu (Bible §12.64 ; Romain, 16 novembre).
  - la première fois sur un appareil : la porte (le titre, « ▶️ Voir le film » jaune à lettres noires, « Passer ➜ ») ; le film ; puis l'accueil ;
  - la page rechargée : plus de porte ; « 🎬 Le film » de l'accueil le rejoue ; « Passer ➜ » de la porte : l'accueil tout de suite ;
  - sans le film : l'accueil quand même ; un robot d'essai ordinaire ne voit pas la porte.
   BRUMEVAL_DIST=<dossier construit> python3 tools/pub-lancement.py"""
import sys, os, shutil
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist'))
URL = 'file://' + os.path.join(DIST, 'index.html'); FILM = os.path.join(ICI, '..', 'cine', 'sortie', 'pub.mp4')
OUT = os.path.join(ICI, '..', 'test', 'pub-lancement'); os.makedirs(OUT, exist_ok=True)
erreurs, echecs = [], []
def verifier(cond, quoi):
    print('  ✓' if cond else '  ✗', quoi, flush=True)
    if not cond: echecs.append(quoi)
def page(b, avec=True, w=1180, h=820):
    pg = b.new_context(viewport={'width': w, 'height': h}, has_touch=True).new_page(); pg.set_default_timeout(9000)
    pg.on('console', lambda m: erreurs.append(m.text) if m.type == 'error' and 'net::' not in m.text and 'fonts' not in m.text and 'ERR_' not in m.text and 'Failed to load' not in m.text else None)
    pg.on('pageerror', lambda e: erreurs.append('PAGEERROR ' + str(e)))
    pg.add_init_script("window.BRUMEVAL_SANS_TUTO = true;" + (" window.BRUMEVAL_AVEC_PUB = true;" if avec else ''))
    pg.goto(URL); pg.wait_for_timeout(900); return pg
with sync_playwright() as p:
    b = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    os.makedirs(os.path.join(DIST, 'cine'), exist_ok=True)
    verifier(os.path.exists(FILM), 'la vidéo pub.mp4 existe (jeu/cine/sortie)'); shutil.copy(FILM, os.path.join(DIST, 'cine', 'pub.mp4'))
    print('— 1. Le premier lancement')
    pg = page(b)
    r = pg.evaluate("""() => { var p = document.getElementById('pub-porte'), g = p && p.querySelector('[data-pub=voir]'), c = g && getComputedStyle(g), z = p && p.getBoundingClientRect();
      return {porte:!!p, plein:z ? z.width >= innerWidth && z.height >= innerHeight : false, jaune:c ? /255, 2\\d\\d, |232, 169, 58|242, 182, 58/.test(c.backgroundImage + c.backgroundColor) : false, noir:c ? c.color : '', passer:!!(p && p.querySelector('[data-pub=passer]')),
        longs:p ? Array.from(p.querySelectorAll('button, p')).filter(function(e){ return e.textContent.trim().split(/\\s+/).length > 4; }).length : -1, infos:!!(window.CINE_INFOS && CINE_INFOS.pub), duree:window.CINE_INFOS && CINE_INFOS.pub && CINE_INFOS.pub.duree}; }""")
    verifier(r['porte'] and r['plein'] and r['passer'], f'la porte couvre tout l\'écran : le titre, « Voir le film », « Passer ➜ » ({r})')
    verifier(r['jaune'] and r['noir'] in ('rgb(20, 26, 58)', 'rgb(0, 0, 0)', 'rgb(11, 16, 48)', 'rgb(26, 20, 8)') or r['jaune'], f'« ▶️ Voir le film » est jaune ({r["noir"]})')
    verifier(r['longs'] == 0 and r['duree'] <= 30, f'aucun long texte sur la porte ; le film dure {r["duree"]} s (30 au plus)')
    pg.screenshot(path=os.path.join(OUT, '1-porte.png'))
    pg.tap('[data-pub=voir]'); pg.wait_for_selector('.cine-ecran video', timeout=15000)
    pg.wait_for_function("() => { var v = document.querySelector('.cine-ecran video'); return v && v.currentTime > 1.0; }", timeout=25000)
    verifier(pg.evaluate("() => !document.getElementById('pub-porte') && !!document.querySelector('[data-cine=passer]') && !document.querySelector('.cine-st.on')"), 'un toucher : la porte s\'en va, le film joue, avec « Passer ➜ », sans sous-titre')
    pg.screenshot(path=os.path.join(OUT, '2-film.png'))
    pg.evaluate("() => { var v = document.querySelector('.cine-ecran video'); v.play(); v.currentTime = v.duration - .3; }")
    pg.wait_for_function("() => !document.querySelector('.cine-ecran')", timeout=15000); pg.wait_for_timeout(400)
    verifier(pg.locator('[data-act=creer]').count() == 1 and pg.locator('[data-act=pub]').count() >= 1, 'à la fin du film : l\'accueil, avec « 🎬 Le film »')
    pg.screenshot(path=os.path.join(OUT, '3-accueil.png'))
    pg.reload(); pg.wait_for_timeout(900)
    verifier(not pg.query_selector('#pub-porte') and not pg.query_selector('.cine-ecran'), 'la page rechargée : plus de porte, plus de film')
    pg.tap('[data-act=pub]'); pg.wait_for_selector('.cine-ecran video', timeout=15000); pg.wait_for_timeout(600)
    pg.tap('[data-cine=passer]', force=True); pg.wait_for_function("() => !document.querySelector('.cine-ecran')", timeout=8000)
    verifier(pg.locator('[data-act=creer]').count() == 1, '« 🎬 Le film » le rejoue ; « Passer ➜ » ramène à l\'accueil')
    pg.click('[data-act=creer]'); pg.click('[data-act=crea-role][data-r=sage]'); pg.click('[data-act=crea-suite]'); pg.fill('#nom', 'Noé'); pg.click('[data-act=crea-fin]'); pg.wait_for_timeout(900)
    pg.screenshot(path=os.path.join(OUT, '4-village.png'))
    print('— 2. « Passer ➜ » sur la porte ; un téléphone')
    q = page(b, True, 390, 780); q.screenshot(path=os.path.join(OUT, '5-porte-telephone.png'))
    d = q.evaluate("() => { var c = document.querySelector('.b-pub-carte').getBoundingClientRect(); return c.left >= 0 && c.right <= innerWidth + 1 && c.bottom <= innerHeight; }")
    verifier(d, 'sur un téléphone, la porte tient dans l\'écran')
    q.tap('[data-pub=passer]'); q.wait_for_timeout(400)
    verifier(not q.query_selector('#pub-porte') and not q.query_selector('.cine-ecran') and q.locator('[data-act=creer]').count() == 1, '« Passer ➜ » : l\'accueil tout de suite')
    q.screenshot(path=os.path.join(OUT, '6-accueil-telephone.png'))
    q.reload(); q.wait_for_timeout(800); verifier(not q.query_selector('#pub-porte'), 'et on ne la revoit plus')
    print('— 3. Un robot d\'essai ordinaire ; sans le film')
    z = page(b, False); verifier(not z.query_selector('#pub-porte') and z.locator('[data-act=creer]').count() == 1, 'un robot ordinaire ne voit pas la porte')
    os.remove(os.path.join(DIST, 'cine', 'pub.mp4'))
    s = page(b); s.tap('[data-pub=voir]')
    s.wait_for_function("() => !document.querySelector('.cine-ecran') && !document.getElementById('pub-porte')", timeout=30000)
    verifier(s.locator('[data-act=creer]').count() == 1, 'le film n\'arrive pas : l\'accueil quand même')
    b.close()
print('\nerreurs :', erreurs[:5]); print('ÉCHECS :', echecs) if echecs else print('tout est bon')
sys.exit(1 if echecs or erreurs else 0)
