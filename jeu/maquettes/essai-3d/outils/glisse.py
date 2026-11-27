# Les pieds glissent-ils ? Pour chaque poussée du pouce : 3 s de jeu image par image, la position des orteils ;
# quand un pied est posé (au plus bas), il ne doit presque pas bouger. python3 glisse.py 0.25,0.5,0.8,1.0
import sys, time, json
import numpy as np
from playwright.sync_api import sync_playwright
MS = [float(x) for x in sys.argv[1].split(',')]
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    pg = b.new_page(viewport={'width': 640, 'height': 300}); err = []
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.goto('http://localhost:8765/index.html')
    for i in range(200):
        if pg.evaluate('!!(window.__essai&&window.__essai.pret)'): break
        time.sleep(0.5)
    pg.evaluate('window.__pilote = true; __essai.avancer(0.5)')
    for m in MS:
        pg.evaluate('__essai.h.x = 2; __essai.h.y = 7.5; __essai.joy.mx = %f; __essai.joy.my = 0; __essai.avancer(1.0)' % m)
        data = pg.evaluate('(() => { const o = []; for (let i = 0; i < 150; i++) { __essai.avancer(1 / 60); o.push([__essai.pieds(), __essai.h.x]); } return o; })()')
        hx = np.array([d[1] for d in data]); v = np.median(np.diff(hx)) * 60
        res = []
        for pied in ('LeftToeBase', 'RightToeBase'):
            P = np.array([d[0][pied] for d in data]); z = P[:, 2]; pos = P[:, :2]
            sol = z < z.min() + 0.025
            sp = np.linalg.norm(np.diff(pos, axis=0), axis=1) * 60
            ok = sol[1:] & sol[:-1]
            res.append(sp[ok])
        g = np.concatenate(res)
        print('pouce %.2f : avance %.2f pas/s ; pied posé : glisse %.2f pas/s (médiane), %.2f (9 sur 10) ; poids %s' % (m, v, np.median(g), np.percentile(g, 90), json.dumps({k: (round(v_, 2) if isinstance(v_, (int, float)) else v_) for k, v_ in pg.evaluate('__essai.loco').items()})))
    pg.evaluate('__essai.joy.mx = 0')
    print('erreurs', err[:3]); b.close()
