import sys
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    pg = b.new_page(viewport={'width': 844, 'height': 390}, device_scale_factor=1); err = []
    pg.on('pageerror', lambda e: err.append(str(e))); pg.on('console', lambda m: err.append(m.text[:160]) if m.type == 'error' else None)
    pg.goto('http://localhost:8766/index.html')
    import time
    for i in range(120):
        if pg.evaluate('!!(window.__essai&&window.__essai.pret)'): print('OK prêt après', i / 2, 's'); break
        time.sleep(0.5)
    else: print('PAS PRÊT', pg.evaluate("document.getElementById('charge').textContent"))
    pg.wait_for_timeout(1500); pg.keyboard.press('2'); pg.wait_for_timeout(900)
    pg.screenshot(path='/tmp/barde3d/csp.png'); print(err[:6]); b.close()
