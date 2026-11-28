# essai_coup.py : le coup de poing de Grosbec (sa vidéo de zone, l'impact) et le Barde projeté ; photos /tmp/v6
import time, json, os, sys
from playwright.sync_api import sync_playwright
os.makedirs('/tmp/v6', exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'])
    pg = b.new_page(viewport={'width': 844, 'height': 390}, device_scale_factor=2); err = []
    pg.on('pageerror', lambda e: err.append(str(e))); pg.on('console', lambda m: err.append(m.text[:300]) if m.type == 'error' else None)
    pg.goto('http://localhost:8766/index.html'); pg.evaluate("choisir('barde')")
    for i in range(240):
        if pg.evaluate('!!(window.__essai&&window.__essai.pret)'): break
        time.sleep(0.5)
    for i in range(60):
        if pg.evaluate('!!(__essai.armure.coup && __essai.CP.info && __essai.CP.el.readyState >= 1)'): break
        time.sleep(0.5)
    print('prêt', pg.evaluate('[!!__essai.armure.coup, !!__essai.CP.info, __essai.CP.el.readyState, __essai.armure.coup && __essai.armure.coup.getClip().duration]'))
    x, y = (float(sys.argv[1]), float(sys.argv[2])) if len(sys.argv) > 2 else (14.0, 11.0)
    print('héros', x, y, 'dans la zone', pg.evaluate('__essai.dansZoneCoup(%f, %f)' % (x, y)), 'libre', pg.evaluate('__essai.libre(%f, %f)' % (x, y)))
    pg.evaluate('window.__pilote = true; __essai.h.x = %f; __essai.h.y = %f; __essai.avancer(1.0)' % (x, y))
    r = pg.evaluate('''(() => { const A = __essai.armure, m = A.m, V = A.lampes[0].position.constructor, v = new V(), out = []; __essai.coupDePoing();
      for (let n = 0; n < 420; n++) { __essai.avancer(1 / 60); let zl = 0; m.getObjectByName('LeftHand').getWorldPosition(v); zl = v.z; m.getObjectByName('RightHand').getWorldPosition(v);
        out.push([__essai.CP.t, A.coup.time, zl, v.z, __essai.CP.el.currentTime, __essai.proj ? __essai.proj.t : -1]); }
      return out; })()''')
    json.dump(r, open('/tmp/v6/trace.json', 'w'))
    print('erreurs', err[:6]); b.close()
import numpy as np
o = np.array(r); zm = np.minimum(o[:, 2], o[:, 3]); k = int(np.argmin(zm))
print('mains au plus bas : t coup %.2f (film %.2f), z %.2f (palier 2.0)' % (o[k, 0], o[k, 1], zm[k]))
pr = np.nonzero(o[:, 5] >= 0)[0]; print('projeté à', ('%.2f s' % o[pr[0], 0]) if len(pr) else 'jamais')
for i in range(0, 420, 30): print('t %.2f film %.2f mains %.2f/%.2f vidéo %.2f proj %.2f' % tuple(o[i]))
