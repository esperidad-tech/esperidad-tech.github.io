from playwright.sync_api import sync_playwright
from PIL import Image
W, H = 844, 390
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    pg = b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=2)
    pg.goto('http://localhost:8765/index.html'); pg.wait_for_function('window.__essai&&window.__essai.pret', timeout=180000)
    ims = []
    for (x, y) in ((1.55, 5.0), (1.55, 6.3), (16.45, 5.0)):
        pg.evaluate('([x,y])=>{__essai.h.x=x;__essai.h.y=y;}', [x, y]); pg.wait_for_timeout(1500)
        pg.screenshot(path='/tmp/barde3d/z.png'); v = pg.evaluate('__essai.vue'); k = W / v['Ws']
        sx, sy = (v['hx'] - v['camX']) * k * 2, (v['hy'] - v['camY']) * k * 2
        ims.append(Image.open('/tmp/barde3d/z.png').crop((int(sx - 150), int(sy - 260), int(sx + 150), int(sy + 40))))
    b.close()
c = Image.new('RGB', (900, 300))
for i, im in enumerate(ims): c.paste(im, (i * 300, 0))
c.save('/tmp/barde3d/z-cache.png')
