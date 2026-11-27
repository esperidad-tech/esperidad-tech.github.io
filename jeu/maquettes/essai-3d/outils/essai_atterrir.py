import time
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    pg = b.new_page(viewport={'width': 844, 'height': 390}); err = []
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.goto('http://localhost:8766/index.html'); pg.evaluate(\"choisir('barde')\")
    for i in range(200):
        if pg.evaluate('!!(window.__essai&&window.__essai.pret)'): break
        time.sleep(0.5)
    for cas, pouce in [('pouce poussé', 1), ('pouce lâché au saut', 0), ('saut depuis l\'arrêt', 0)]:
        x0 = 3.5 if cas != "saut depuis l'arrêt" else 5
        pg.evaluate('window.__pilote = true; __essai.h.sautR = 0; __essai.h.x = %f; __essai.h.y = 7.4; __essai.h.a = 0; __essai.joy.mx = %d; __essai.joy.my = 0; __essai.avancer(1.2)' % (x0, 0 if cas == "saut depuis l'arrêt" else 1))
        pg.evaluate('__essai.joy.mx = %d; __essai.sauter(1, 0)' % pouce)
        xs = []
        for k in range(30):
            pg.evaluate('__essai.avancer(1/30)'); xs.append(pg.evaluate('[__essai.h.x, !!__essai.h.saut, __essai.loco.allure]'))
        dx = [round((xs[k][0] - xs[k - 1][0]) * 30, 1) for k in range(1, len(xs))]
        print(cas, ': vitesse image par image (pas/s) :', dx)
        print('   en l\'air / saut :', ''.join('S' if v[1] else '.' for v in xs), ' allure fin :', xs[-1][2])
    print(err[:3]); b.close()
