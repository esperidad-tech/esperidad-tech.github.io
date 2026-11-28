import cv2, numpy as np, json, sys
sys.path.insert(0, '/tmp/salle/gen')
from camera import *
P = cv2.imread('/mnt/user-data/uploads/b5e242e6-image.png').astype(np.float32)
sol_poly = np.array([(1240, 955), (3140, 955), (3900, 1872), (560, 1872)], np.int32)
out = {}
for k in range(5):
    C = cv2.imread('/tmp/cr2/C%d.png' % k).astype(np.float32)
    d = cv2.GaussianBlur(np.abs(C - P).max(2), (0, 0), 3)
    m = (d > 40).astype(np.uint8); m[:250] = 0
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8)); m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m)
    vis = cv2.resize(C.astype(np.uint8), (2192, 936)); L = []
    for i in range(1, n):
        x, y, w, h, a = st[i]
        if a < 3000: continue
        ys, xs = np.nonzero(lab == i)
        # le pied : le bas du corps du cristal (on prend la colonne la plus haute, puis son bas)
        haut = ys.min(); col = xs[ys < haut + 30].mean()
        bande = (np.abs(xs - col) < max(25, w * 0.12)); pied_y = ys[bande].max() - 15; pied_x = xs[bande & (ys > pied_y - 40)].mean()
        dedans = cv2.pointPolygonTest(sol_poly, (float(pied_x), float(pied_y)), False) >= 0
        X, D = sol(pied_x, pied_y)
        L.append(dict(i=int(i), bbox=[int(x), int(y), int(w), int(h)], pied=[float(pied_x), float(pied_y)], jeu=[float(X + 9.8), float(39.8 - D)], sol=bool(dedans), aire=int(a)))
        cv2.rectangle(vis, (x // 2, y // 2), ((x + w) // 2, (y + h) // 2), (0, 255, 255) if dedans else (0, 0, 255), 2)
        cv2.circle(vis, (int(pied_x) // 2, int(pied_y) // 2), 5, (0, 255, 0), -1); cv2.putText(vis, str(i), (x // 2 + 3, y // 2 + 18), 0, 0.7, (0, 255, 255), 2)
    cv2.imwrite('/tmp/cr2/det%d.jpg' % k, vis[150:, 200:2000]); out[k] = L
    for c in L: print(k, c['i'], c['bbox'], 'pied', [round(v) for v in c['pied']], 'jeu', [round(v, 1) for v in c['jeu']], 'sol' if c['sol'] else 'HORS')
json.dump(out, open('/tmp/cr2/detect.json', 'w'))
