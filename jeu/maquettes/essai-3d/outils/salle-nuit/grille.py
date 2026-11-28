# grille.py : les cases du sol où l'on marche, refaites (28 novembre, Romain : « le Barde peut passer derrière la lanterne droite,
# mais pas la gauche »). Le bord gauche de la zone de marche suit maintenant le dallage de la peinture jusqu'aux massifs (il passait
# juste contre la lanterne gauche) ; la grille commence à x = −3 (elle commençait à 0). Les crevasses : les mêmes cases, décalées.
import json, math, base64, numpy as np, cv2
FIC = '/tmp/essai3d/site/nuit/nuit.json'
NJ = json.load(open(FIC)); G = NJ['grille']; PAS = G['pas']; NX0, NY = G['nx'], G['ny']
X0 = -3.0; DEC = int(round(-X0 / PAS)); NX = NX0 + DEC
def img(x, y, z=0):
    ph = NJ['phi']; s, c = math.sin(ph), math.cos(ph); X = x - NJ['xoff']; D = NJ['dmax'] - y; Zr = z - NJ['camH']; zc = D * c - Zr * s; yu = D * s + Zr * c
    return NJ['cx'] + NJ['f'] * X / zc, NJ['cy'] - NJ['f'] * yu / zc
marche = np.array([(1290, 972), (3090, 972), (3765, 1805), (480, 1805)], np.float32)   # (le coin bas gauche : 730 → 480, jusqu'aux massifs)
dec = lambda b, nx: np.unpackbits(np.frombuffer(base64.b64decode(b), np.uint8))[:nx * NY].reshape(NY, nx)
crv0 = dec(G['crevasse'], NX0); lib0 = dec(G['libre'], NX0)
lib = np.zeros((NY, NX), np.uint8); crv = np.zeros((NY, NX), np.uint8); crv[:, DEC:] = crv0
W, H = NJ['image']
for j in range(NY):
    for i in range(NX):
        gx, gy = X0 + (i + 0.5) * PAS, (j + 0.5) * PAS
        if NJ['dmax'] - gy < 5: continue
        u, v = img(gx, gy)
        if not (0 <= u < W and 0 <= v < H): continue
        if cv2.pointPolygonTest(marche, (float(u), float(v)), False) >= 0 and all(math.hypot(gx - NJ['xoff'] - p['x'], (NJ['dmax'] - gy) - p['d']) > 0.85 for p in NJ['piliers']): lib[j, i] = 1
print('cases libres', int(lib0.sum()), '→', int(lib.sum()), '; anciennes gardées :', int((lib[:, DEC:] & lib0).sum()))
bits = lambda a: base64.b64encode(np.packbits(a.flatten())).decode()
NJ['grille'] = {'pas': PAS, 'nx': NX, 'ny': NY, 'x0': X0, 'libre': bits(lib), 'crevasse': bits(crv)}
json.dump(NJ, open(FIC, 'w'))
