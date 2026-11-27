# vitesse des pieds au sol, le héros sur place (la vitesse du mouvement lui-même, dans le jeu)
import sys, time
import numpy as np
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    pg = b.new_page(viewport={'width': 640, 'height': 300})
    pg.goto('http://localhost:8765/index.html')
    for i in range(200):
        if pg.evaluate('!!(window.__essai&&window.__essai.pret)'): break
        time.sleep(0.5)
    pg.evaluate('window.__pilote = true; window.__surplace = true; __essai.avancer(0.5)')
    for m in [float(x) for x in sys.argv[1].split(',')]:
        pg.evaluate('__essai.joy.mx = %f; __essai.joy.my = 0; __essai.avancer(1.0)' % m)
        data = pg.evaluate('(() => { const o = []; for (let i = 0; i < 150; i++) { __essai.avancer(1 / 60); o.push(__essai.pieds()); } return o; })()')
        out = []
        for pied in ('LeftToeBase', 'RightToeBase'):
            P = np.array([d[pied] for d in data]); z = P[:, 2]
            for seuil in (0.01, 0.025, 0.05):
                sol = z < z.min() + seuil; vx = np.diff(P[:, 0]) * 60; ok = sol[1:] & sol[:-1]
                out.append('%s<%.3f: vx %.2f (n=%d)' % (pied[:4], seuil, np.median(vx[ok]) if ok.any() else 0, ok.sum()))
        print('pouce %.2f (vitesse voulue %.2f) :' % (m, 3.6 * m), ' | '.join(out))
    b.close()
