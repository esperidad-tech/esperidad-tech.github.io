# Étape 3 : pour chaque endroit, la découpe couleur + rouge (côte à côte), le masque (R : ce qui change, G : le corps du cristal)
import cv2, numpy as np, json, sys
sys.path.insert(0, '/tmp/salle/gen')
from camera import *
from scipy.optimize import fsolve
from rembg import remove, new_session
from PIL import Image
ses = new_session('isnet-general-use')
spots = json.load(open('/tmp/cr2/spots.json'))
OUT = '/tmp/essai3d/site/nuit/cr/'
IMG = {}
for s, sp in enumerate(spots):
    k = sp['k']
    if k not in IMG: IMG[k] = (cv2.imread('/tmp/cr2/C%d.png' % k), cv2.imread('/tmp/cr2/R%d.png' % k))
    C, R = IMG[k]; x, y, w, h = sp['rect']; fx, fy = sp['pied']
    c = C[y:y + h, x:x + w]; r = R[y:y + h, x:x + w]
    zone = np.load('/tmp/cr2/zone%d.npy' % s).astype(np.uint8)
    reg = cv2.GaussianBlur(cv2.dilate(zone, np.ones((7, 7), np.uint8)).astype(np.float32), (0, 0), 3)
    # le corps : ce que rembg isole, dans la zone, au-dessus du pied (+ un peu)
    m = np.array(remove(Image.fromarray(cv2.cvtColor(c, cv2.COLOR_BGR2RGB)), session=ses, only_mask=True)).astype(np.float32) / 255
    m *= cv2.dilate(zone, np.ones((9, 9), np.uint8))
    m[int(fy - y + 25):, :] *= 0
    nb, lab, st, _ = cv2.connectedComponentsWithStats((m > 0.5).astype(np.uint8))
    if nb > 1: garde = 1 + np.argmax(st[1:, 4]); m *= cv2.dilate((lab == garde).astype(np.uint8), np.ones((5, 5), np.uint8))
    corps = np.clip(m, 0, 1)
    ys, xs = np.nonzero(corps > 0.5); haut = ys.min() + y
    X, D = sol(fx, fy); zt = float(fsolve(lambda z: proj(X, D, z[0])[1] - haut, [3.0])[0])
    bas = corps[max(0, int(fy - y) - 60):int(fy - y), :]; bx = np.nonzero(bas.max(0) > 0.5)[0]
    larg = (sol(x + bx.max(), fy)[0] - sol(x + bx.min(), fy)[0]) if len(bx) else 1.0
    sp.update(jeu=[float(X + 9.8), float(39.8 - D)], haut=zt, larg=float(larg), corps_haut=int(haut), d=float(D), X=float(X))
    cv2.imwrite(OUT + 'c%02d.jpg' % s, np.hstack([c, r]), [cv2.IMWRITE_JPEG_QUALITY, 88])
    mk = np.zeros((h, w, 3), np.uint8); mk[:, :, 2] = np.clip(reg * 255, 0, 255); mk[:, :, 1] = np.clip(corps * 255, 0, 255)
    cv2.imwrite(OUT + 'm%02d.png' % s, mk)
    print(s, 'pied jeu', [round(v, 1) for v in sp['jeu']], 'haut %.1f m, large %.1f m' % (zt, larg))
json.dump(spots, open('/tmp/cr2/spots.json', 'w'))
