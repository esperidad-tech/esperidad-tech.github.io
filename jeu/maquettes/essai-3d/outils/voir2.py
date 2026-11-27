import sys
from playwright.sync_api import sync_playwright
from PIL import Image
W, H = 844, 390
def coupe(pg, nom):
    pg.screenshot(path='/tmp/barde3d/z.png')
    v = pg.evaluate('__essai.vue'); k = W / v['Ws']
    sx, sy = (v['hx'] - v['camX']) * k * 2, (v['hy'] - v['camY']) * k * 2
    Image.open('/tmp/barde3d/z.png').crop((int(sx - 130), int(sy - 220), int(sx + 130), int(sy + 40))).save('/tmp/barde3d/' + nom + '.png')
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    pg = b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=2); err = []
    pg.on('pageerror', lambda e: err.append(str(e))); pg.on('console', lambda m: err.append(m.text) if m.type == 'error' else None)
    pg.on('requestfailed', lambda r: err.append('échec ' + r.url)); pg.on('response', lambda r: err.append('404 ' + r.url) if r.status == 404 else None)
    pg.goto('http://localhost:8765/index.html'); pg.wait_for_function('window.__essai&&window.__essai.pret', timeout=180000)
    pg.wait_for_timeout(1500); coupe(pg, 'z-repos')
    for nom, touches in (('bas', ['ArrowDown']), ('droite', ['ArrowRight']), ('haut', ['ArrowUp']), ('gauche', ['ArrowLeft'])):
        for t in touches: pg.keyboard.down(t)
        pg.wait_for_timeout(800); coupe(pg, 'z-' + nom)
        for t in touches: pg.keyboard.up(t)
        pg.wait_for_timeout(300)
    pg.evaluate("__essai.lancer('glace')"); pg.wait_for_timeout(500); coupe(pg, 'z-glace')
    print(err[:8]); b.close()
ims = [Image.open('/tmp/barde3d/z-%s.png' % n) for n in ('repos', 'bas', 'droite', 'haut', 'gauche', 'glace')]
c = Image.new('RGB', (260 * 6, 260))
for i, im in enumerate(ims): c.paste(im, (i * 260, 0))
c.save('/tmp/barde3d/z-grille.png')
