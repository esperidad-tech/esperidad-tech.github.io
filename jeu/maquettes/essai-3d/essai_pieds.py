# essai_pieds.py : les pieds de l'armure (hauteur et glissement sur la boucle et pendant qu'il parle) + gros plans ; /tmp/v5
import time, json, sys
from playwright.sync_api import sync_playwright
import numpy as np
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    pg = b.new_page(viewport={'width': 844, 'height': 390}, device_scale_factor=3); err = []
    pg.on('pageerror', lambda e: err.append(str(e))); pg.on('console', lambda m: err.append(m.text[:300]) if m.type == 'error' else None)
    pg.goto('http://localhost:8766/index.html'); pg.evaluate("choisir('barde')")
    for i in range(240):
        if pg.evaluate('!!(window.__essai&&window.__essai.pret)'): break
        time.sleep(0.5)
    for i in range(40):
        if pg.evaluate('!!(__essai.armure.parle)'): break
        time.sleep(0.5)
    r = pg.evaluate('''(() => { window.__pilote = true; const A = __essai.armure, S = A.peau, V = A.lampes[0].position.constructor, v = new V(), out = [];
      for (let n = 0; n < 1200; n++) { if (n === 300) __essai.parleGrosbec(); __essai.avancer(1 / 60); const row = [];
        for (const p of A.pieds) { let z = 1e9, sx = 0, sy = 0; for (const i of p.sommets) { S.getVertexPosition(i, v); S.localToWorld(v); z = Math.min(z, v.z); sx += v.x; sy += v.y; } row.push(z, sx / p.sommets.length, sy / p.sommets.length); }
        out.push(row); }
      return out; })()''')
    o = np.array(r)
    for k, n in enumerate(['gauche z', 'gauche x', 'gauche y', 'droit z', 'droit x', 'droit y']):
        print('%-9s attente %.3f..%.3f   parole %.3f..%.3f' % (n, o[:300, k].min(), o[:300, k].max(), o[300:, k].min(), o[300:, k].max()))
    pg.evaluate('__essai.avancer(1.0)'); time.sleep(0.3)
    e = pg.evaluate('[__essai.ecran(10.62, -9.45, 2.0), __essai.ecran(10.62, -9.45, 5.8)]')
    cx, yb, yh = e[0]['x'], e[0]['y'], e[1]['y']; H = yb - yh
    pg.screenshot(path='/tmp/v5/a-pieds.png', clip={'x': cx - H * 0.45, 'y': yb - H * 0.25, 'width': H * 0.9, 'height': H * 0.45})
    pg.screenshot(path='/tmp/v5/a-entier.png', clip={'x': cx - H * 0.9, 'y': yh - H * 0.15, 'width': H * 1.8, 'height': H * 1.6})
    print('erreurs', err[:5]); b.close()
