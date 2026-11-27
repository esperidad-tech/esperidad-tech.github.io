import time, sys
from playwright.sync_api import sync_playwright
qui = sys.argv[1]
with sync_playwright() as p:
    b = p.webkit.launch()
    pg = b.new_page(viewport={'width': 844, 'height': 390}); err = []
    pg.on('pageerror', lambda e: err.append('PAGE ' + str(e)[:300])); pg.on('console', lambda m: err.append(m.type + ' ' + m.text[:200]) if m.type in ('error', 'warning') else None)
    pg.goto('http://localhost:8767/index.html'); pg.wait_for_timeout(500); pg.screenshot(path='/tmp/pisteur/wk-choix.png')
    pg.click('button[data-q="%s"]' % qui)
    for i in range(160):
        if pg.evaluate('!!(window.__essai&&window.__essai.pret)'): print('prêt', i / 2); break
        time.sleep(0.5)
    else: print('PAS PRÊT', pg.evaluate("document.getElementById('charge').textContent"))
    if qui == 'pisteur':
        pg.evaluate('window.__pilote = true; __essai.avancer(0.3); __essai.basculerOmbre(); __essai.avancer(0.6); __essai.joy.mx = 0.6; __essai.avancer(0.6); __essai.joy.mx = 0')
    else:
        pg.evaluate('window.__pilote = true; __essai.avancer(0.3); __essai.lancer("glace"); __essai.avancer(1.8)')
    pg.wait_for_timeout(400); pg.screenshot(path='/tmp/pisteur/wk-%s.png' % qui)
    print(err[:8]); b.close()
