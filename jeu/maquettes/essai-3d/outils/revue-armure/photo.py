# photos de l'armure 3D sur la place : toute la place, puis le haut des marches de plus près (comme sur le téléphone)
import sys, time, json, math, subprocess
from playwright.sync_api import sync_playwright
NJ = json.load(open('/tmp/revue/nuit.json'))
def img_de(x, y, z):
    s, c = math.sin(NJ['phi']), math.cos(NJ['phi']); X = x - NJ['xoff']; D = NJ['dmax'] - y; Zr = z - NJ['camH']
    zc = D * c - Zr * s; yu = D * s + Zr * c; return NJ['cx'] + NJ['f'] * X / zc, NJ['cy'] - NJ['f'] * yu / zc
suf = sys.argv[5] if len(sys.argv) > 5 else ''
A = NJ['armure']; haut = float(sys.argv[2]) if len(sys.argv) > 2 else 3.1
u0, v0 = img_de(A['x'], A['y'], A['z']); u1, v1 = img_de(A['x'], A['y'], A['z'] + haut); print('armure : pieds', round(u0), round(v0), 'tête', round(u1), round(v1), 'hauteur à l’écran', round(v0 - v1), 'px de peinture')
srv = subprocess.Popen(['python3', '-m', 'http.server', '8770'], cwd='/tmp/revue', stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
try:
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        pg = b.new_page(viewport={'width': 2192, 'height': 936}); err = []
        pg.on('pageerror', lambda e: err.append(str(e))); pg.on('console', lambda m: err.append(m.text[:200]) if m.type == 'error' else None)
        pg.goto('http://localhost:8770/index.html'); pg.wait_for_function('window.fondPret', timeout=60000)
        print('animations', pg.evaluate("charger('%s', %f, %s, %s)" % (sys.argv[1], haut, sys.argv[3] if len(sys.argv) > 3 else '0.5', sys.argv[4] if len(sys.argv) > 4 else '0')), 'taille du modèle', pg.evaluate('window.taille'))
        pg.evaluate('cadre(0, 0, %d, %d); dessiner()' % (NJ['image'][0], NJ['image'][1])); pg.screenshot(path='/tmp/revue/place%s.png' % suf)
        # comme dans le jeu : une fenêtre de ~1900 px de peinture de large autour du haut des marches
        w = 1900; h = w * 936 / 2192; x0 = u0 - w / 2; y0 = 260
        pg.evaluate('cadre(%f, %f, %f, %f); dessiner()' % (x0, y0, x0 + w, y0 + h)); pg.screenshot(path='/tmp/revue/marches%s.png' % suf)
        w = 700; h = w * 936 / 2192; x0 = u0 - w / 2; y0 = (v0 + v1) / 2 - h / 2
        pg.evaluate('cadre(%f, %f, %f, %f); dessiner()' % (x0, y0, x0 + w, y0 + h)); pg.screenshot(path='/tmp/revue/pres%s.png' % suf)
        print('durée', pg.evaluate('window.dur'), 'erreurs', [e for e in err if '404' not in e][:5]); b.close()
finally: srv.terminate()
