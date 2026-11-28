# Étape 5 : le masque de l'éclatement de chaque endroit (une ellipse douce autour du cristal, sans les autres cristaux de la même image)
import cv2, numpy as np, json
spots = json.load(open('/tmp/cr2/spots.json')); P = cv2.imread('/mnt/user-data/uploads/b5e242e6-image.png').astype(np.float32)
OUT = '/tmp/essai3d/site/nuit/cr/'; CH = {}
for s, sp in enumerate(spots):
    k = sp['k']
    if k not in CH:
        C = cv2.imread('/tmp/cr2/C%d.png' % k).astype(np.float32)
        d = cv2.GaussianBlur(np.abs(C - P).max(2), (0, 0), 2.5); CH[k] = (d > 28).astype(np.uint8)
    x0, y0, w, h = sp['eclat']['rect']; tw, th = sp['eclat']['tuile']
    autres = CH[k][y0:y0 + h, x0:x0 + w].copy()
    x, y, zw, zh = sp['rect']; z = np.load('/tmp/cr2/zone%d.npy' % s).astype(np.uint8)
    mien = np.zeros_like(autres); mien[y - y0:y - y0 + zh, x - x0:x - x0 + zw] = z
    autres[cv2.dilate(mien, np.ones((41, 41), np.uint8)) > 0] = 0; autres[:max(0, 700 - y0)] = autres[:max(0, 700 - y0)] * 0
    autres = cv2.dilate(autres, np.ones((31, 31), np.uint8))
    fx, fy = sp['pied']; top = sp['corps_haut']; cx = fx - x0; cy = (fy + top) / 2 - y0
    yy, xx = np.mgrid[0:h, 0:w]; rx = w * 0.42; ry = h * 0.46
    e = np.clip((1 - np.hypot((xx - cx) / rx, (yy - cy) / ry)) / 0.35, 0, 1)
    m = e * (1 - cv2.GaussianBlur(autres.astype(np.float32), (0, 0), 12))
    cv2.imwrite(OUT + 'k%02d.png' % s, cv2.resize((np.clip(m, 0, 1) * 255).astype(np.uint8), (tw, th), interpolation=cv2.INTER_AREA))
print('ok')
