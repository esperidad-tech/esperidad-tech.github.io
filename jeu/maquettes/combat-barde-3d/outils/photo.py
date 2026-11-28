# photo.py <dossier site> <sortie.png> [largeur hauteur] : la page chargée, cinq golems placés à des moments de leur marche, une photo
import sys, time, json, subprocess
from playwright.sync_api import sync_playwright
site, sortie = sys.argv[1], sys.argv[2]; W, H = (int(sys.argv[3]), int(sys.argv[4])) if len(sys.argv) > 4 else (420, 909)
srv = subprocess.Popen(['python3', '-m', 'http.server', '8772'], cwd=site, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
try:
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        pg = b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=2); err = []
        pg.on('pageerror', lambda e: err.append(str(e))); pg.on('console', lambda m: err.append(m.text[:300]) if m.type == 'error' else None)
        pg.goto('http://localhost:8772/index.html'); pg.wait_for_function('window.PRET', timeout=120000)
        print('pas', json.dumps(pg.evaluate('window.PAS')))
        pg.evaluate("""() => { const E = window.essai; E.fige = true; E.regler(100);
          ['rodeur','faucheur','belier','porte-dalle','colosse'].forEach(n => E.sortir(n));
          // chacun à un endroit différent de son chemin (en temps de musique)
          [[0, 14.0], [1, 19.0], [2, 7.5], [3, 24.0], [4, 30.0]].forEach(([i, t]) => E.animer(i, t));
          E.rendre(); }""")
        pg.evaluate("document.getElementById('lancer').style.display='none'"); time.sleep(0.5); pg.screenshot(path=sortie)
        print('erreurs', err[:5]); b.close()
finally: srv.terminate()
