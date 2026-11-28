import sys, time
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    pg = b.new_page(viewport={'width': 844, 'height': 390}); pg.goto('http://localhost:8766/index.html'); pg.evaluate("choisir('barde')")
    for i in range(200):
        if pg.evaluate('!!(window.__essai&&window.__essai.pret&&window.__essai.vague.pret)'): break
        time.sleep(0.5)
    print('héros', pg.evaluate('[__essai.h.x, __essai.h.y]'))
    pg.evaluate('window.__pilote = true; window.__tirage = [0,9,12]; __essai.avancer(0.3); __essai.lancerVague()')
    vu = 0
    for k in range(110):
        r = pg.evaluate('__essai.avancer(0.1), [__essai.vague.t.toFixed(1), __essai.vague.tw.toFixed(1), __essai.vague.touche.toFixed(2), !!__essai.abrite(), __essai.arriveFeu(__essai.h.x, __essai.h.y).toFixed(2), JSON.stringify(__essai.cristaux().map(c=>c.etat))]')
        if float(r[2]) > 0.85 or k % 10 == 0: print(r)
    b.close()
