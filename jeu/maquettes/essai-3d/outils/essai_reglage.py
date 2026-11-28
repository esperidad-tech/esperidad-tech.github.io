import time
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    pg = b.new_page(viewport={'width': 1024, 'height': 768}, device_scale_factor=2); err = []
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.goto('http://localhost:8766/index.html'); pg.evaluate("choisir('barde')")
    for i in range(200):
        if pg.evaluate('!!(window.__essai&&window.__essai.pret)'): break
        time.sleep(0.5)
    for k in range(8):
        time.sleep(3); print(pg.evaluate("[__essai.ips, JSON.stringify(__essai.QUAL), document.getElementById('ips').textContent, __essai.rendu.domElement.width]"))
    print(err); b.close()
