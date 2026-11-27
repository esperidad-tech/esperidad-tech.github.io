import time, sys
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.webkit.launch(); pg = b.new_page(viewport={'width': 844, 'height': 390}); err = []
    pg.on('pageerror', lambda e: err.append('PAGE ' + str(e)[:300])); pg.on('console', lambda m: err.append(m.type + ' ' + m.text[:200]) if m.type in ('error',) else None)
    pg.goto('http://localhost:8767/index.html'); pg.wait_for_timeout(400); pg.click('button[data-q="barde"]')
    for i in range(160):
        if pg.evaluate('!!(window.__essai&&window.__essai.pret)'): print('prêt', i / 2); break
        time.sleep(0.5)
    else: print('PAS PRÊT', err); b.close(); sys.exit()
    pg.evaluate('window.__pilote = true; __essai.avancer(0.3)'); pg.click('#bVague')
    pg.evaluate("__essai.avancer(4.9)"); pg.wait_for_timeout(300); pg.evaluate("__essai.avancer(0.8)"); pg.wait_for_timeout(200); pg.screenshot(path='/tmp/vague/wk-vague.png')
    print("vidéo", pg.evaluate("__essai.video()"))
    print(err[:6]); b.close()
