# essai_webkit_vague3.py : la vague dans WebKit (moteur de l'iPhone), en temps réel ; photos /tmp/v3/wk-*.png
import time, sys
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.webkit.launch(); pg = b.new_page(viewport={'width': 844, 'height': 390}); err = []
    pg.on('pageerror', lambda e: err.append('PAGE ' + str(e)[:300])); pg.on('console', lambda m: err.append(m.type + ' ' + m.text[:200]) if m.type in ('error', 'warning') else None)
    pg.goto('http://localhost:8766/index.html'); pg.wait_for_timeout(400); pg.click('button[data-q="barde"]')
    for i in range(200):
        if pg.evaluate('!!(window.__essai&&window.__essai.pret&&window.__essai.vague.pret)'): print('prêt', i / 2); break
        time.sleep(0.5)
    else: print('PAS PRÊT', err); b.close(); sys.exit()
    pg.evaluate('window.__tirage = [0,9,12]'); pg.click('#bVague')
    for k, att in enumerate([3.5, 2.0, 2.0, 2.0, 2.5]):
        pg.wait_for_timeout(int(att * 1000)); pg.screenshot(path='/tmp/v3/wk-%d.png' % k)
        print(k, pg.evaluate('[__essai.vague.t.toFixed(2), __essai.vague.tw.toFixed(2), !!__essai.vague.secours, JSON.stringify(__essai.cristaux().map(c=>c.etat)), __essai.video()]'))
    pg.wait_for_timeout(3000); print('fin', pg.evaluate('[__essai.vague.t, document.getElementById("bVague").className]'))
    print(err[:8]); b.close()
