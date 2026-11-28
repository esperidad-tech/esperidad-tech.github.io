import sys, time, json, math, subprocess
from playwright.sync_api import sync_playwright
NJ = json.load(open('/tmp/revue/nuit.json'))
def img_de(x, y, z):
    s, c = math.sin(NJ['phi']), math.cos(NJ['phi']); X = x - NJ['xoff']; D = NJ['dmax'] - y; Zr = z - NJ['camH']
    zc = D * c - Zr * s; yu = D * s + Zr * c; return NJ['cx'] + NJ['f'] * X / zc, NJ['cy'] - NJ['f'] * yu / zc
A = NJ['armure']; u, v = img_de(A['x'], A['y'], A['z'] + 2.75)
srv = subprocess.Popen(['python3', '-m', 'http.server', '8771'], cwd='/tmp/revue', stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
out = []
try:
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        for fic in sys.argv[1:]:
            for rot in (0, 0.8, 1.57):
                pg = b.new_page(viewport={'width': 600, 'height': 600}); pg.goto('http://localhost:8771/index.html'); pg.wait_for_function('window.fondPret', timeout=60000)
                pg.evaluate("document.getElementById('c').style.width='600px'")
                pg.evaluate("charger('%s', 3.1, -1, %f)" % (fic, rot))
                w = 110; pg.evaluate('cadre(%f, %f, %f, %f); dessiner()' % (u - w / 2 * 2192 / 936, v - w / 2, u + w / 2 * 2192 / 936, v + w / 2))
                n = '/tmp/revue/tete-%s-%.1f.png' % (fic.split('.')[0], rot); pg.screenshot(path=n, clip={'x': 0, 'y': 0, 'width': 600, 'height': 256}); out.append(n); pg.close()
        b.close()
finally: srv.terminate()
print(out)
