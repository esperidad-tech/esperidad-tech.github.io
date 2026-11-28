import time
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.webkit.launch()
    pg = b.new_page(viewport={'width': 844, 'height': 390}, device_scale_factor=2); err = []
    pg.on('pageerror', lambda e: err.append(str(e))); pg.on('console', lambda m: err.append(m.text[:200]) if m.type == 'error' else None)
    pg.goto('http://localhost:8766/index.html'); pg.evaluate("choisir('barde')")
    for i in range(240):
        if pg.evaluate('!!(window.__essai&&window.__essai.pret&&window.__essai.vague.pret)'): print('prêt', i/2); break
        time.sleep(0.5)
    else: print('pas prêt')
    pg.evaluate('window.__pilote = true; window.__tirage = [[4,6],[9,4.5],[15.5,6],[6,11],[12.5,10],[17,13]]; __essai.h.x = 12.6; __essai.h.y = 11.4; __essai.avancer(0.3); __essai.lancerVague()')
    for d in (3.0, 3.0, 4.0, 5.0, 4.0):
        pg.evaluate('__essai.avancer(%f)' % d); time.sleep(0.4)
        print(pg.evaluate('[__essai.vague.t.toFixed(2), __essai.vague.tw.toFixed(2), JSON.stringify(__essai.cristaux().map(c=>c.etat))]'))
    pg.screenshot(path='/tmp/cr/webkit.png')
    print('erreurs', err[:8]); b.close()
