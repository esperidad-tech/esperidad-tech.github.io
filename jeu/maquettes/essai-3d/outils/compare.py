import time, numpy as np, sys
from playwright.sync_api import sync_playwright
from scipy.spatial.transform import Rotation as Rot
sys.path.insert(0, '/tmp/luth'); from glb import GLB
g = GLB('/tmp/essai3d/site/glb/anim-marche.glb'); N = g.j['nodes']; an = g.j['animations'][0]
par = {}
for i, n in enumerate(N):
    for c in n.get('children', []): par[c] = i
idx = {n.get('name'): i for i, n in enumerate(N)}
pistes = {}
for ch in an['channels']:
    smp = an['samplers'][ch['sampler']]; pistes[(ch['target']['node'], ch['target']['path'])] = (g.lire(smp['input']), g.lire(smp['output']))
def val(i, path, t, dflt):
    if (i, path) not in pistes: return np.array(N[i].get(path, dflt), float)
    tt, vv = pistes[(i, path)]; k = int(np.clip(np.searchsorted(tt, t), 1, len(tt) - 1)); a = np.clip((t - tt[k - 1]) / (tt[k] - tt[k - 1]), 0, 1)
    if path == 'rotation': return Rot.from_quat([vv[k - 1], vv[k]])[0 if a < 0.5 else 1].as_quat()
    return vv[k - 1] * (1 - a) + vv[k] * a
def M(i, t):
    m = np.eye(4); m[:3, :3] = Rot.from_quat(val(i, 'rotation', t, [0, 0, 0, 1])).as_matrix() @ np.diag(val(i, 'scale', t, [1, 1, 1])); m[:3, 3] = val(i, 'translation', t, [0, 0, 0]); return m
def W(i, t):
    m = M(i, t)
    while i in par: i = par[i]; m = M(i, t) @ m
    return m[:3, 3]
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    pg = b.new_page(viewport={'width': 640, 'height': 300})
    pg.goto('http://localhost:8765/index.html')
    for i in range(200):
        if pg.evaluate('!!(window.__essai&&window.__essai.pret)'): break
        time.sleep(0.5)
    pg.evaluate('window.__pilote = true')
    for t in (0.5, 1.0, 1.6, 2.2):
        r = pg.evaluate("__essai.poser('marche', %f)" % t)
        print('t=%.1f  jeu (modèle) orteil %s bassin %s   |  calcul %s %s' % (t, np.round(r['LeftToeBase'], 3), np.round(r['Hips'], 3), np.round(W(idx['LeftToeBase'], t), 3), np.round(W(idx['Hips'], t), 3)))
    b.close()
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    pg = b.new_page(viewport={'width': 640, 'height': 300})
    pg.goto('http://localhost:8765/index.html')
    for i in range(200):
        if pg.evaluate('!!(window.__essai&&window.__essai.pret)'): break
        time.sleep(0.5)
    pg.evaluate('window.__pilote = true')
    r = pg.evaluate("__essai.poser('marche', 1.0)")
    print('pistes', r['nbPistes'], r['pistes'], 'durée', r['duree'])
    for n in ('LeftUpLeg', 'LeftLeg', 'Hips'):
        print(n, 'jeu q', np.round(r[n + '_q'], 3), 'p', np.round(r[n + '_p'], 2), '| fichier q', np.round(val(idx[n], 'rotation', 1.0, [0,0,0,1]), 3), 'p', np.round(val(idx[n], 'translation', 1.0, [0,0,0]), 2))
    b.close()
