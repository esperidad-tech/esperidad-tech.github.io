import time, json, math, subprocess
from playwright.sync_api import sync_playwright
NJ = json.load(open('/tmp/revue/nuit.json'))
def img_de(x, y, z):
    s, c = math.sin(NJ['phi']), math.cos(NJ['phi']); X = x - NJ['xoff']; D = NJ['dmax'] - y; Zr = z - NJ['camH']
    zc = D * c - Zr * s; yu = D * s + Zr * c; return NJ['cx'] + NJ['f'] * X / zc, NJ['cy'] - NJ['f'] * yu / zc
A = NJ['armure']; u, v = img_de(A['x'], A['y'], A['z'] + 1.6)
srv = subprocess.Popen(['python3', '-m', 'http.server', '8772'], cwd='/tmp/revue', stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
try:
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        pg = b.new_page(viewport={'width': 2192, 'height': 936}); pg.goto('http://localhost:8772/index.html'); pg.wait_for_function('window.fondPret', timeout=60000)
        h = 300; w = h * 2192 / 936
        import sys
        for fic in sys.argv[1:]:
            for t in (2.0, 4.0):
                pg.evaluate("poser('%s.glb', 'parle.glb', %f, 0)" % (fic, t)); pg.evaluate('cadre(%f, %f, %f, %f); dessiner()' % (u - w / 2, v - h / 2, u + w / 2, v + h / 2))
                pg.screenshot(path='/tmp/revue/q-%s-%03d.png' % (fic, int(t*10)), clip={'x': 696, 'y': 0, 'width': 800, 'height': 936})
        b.close()
finally: srv.terminate()
