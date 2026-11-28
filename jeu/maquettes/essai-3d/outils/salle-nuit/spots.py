# Étape 2 : les endroits peints (pieds des cristaux, choisis à la main sur les 5 paires), leurs masques, leurs découpes.
import cv2, numpy as np, json, sys
sys.path.insert(0, '/tmp/salle/gen')
from camera import *
P = cv2.imread('/mnt/user-data/uploads/b5e242e6-image.png').astype(np.float32)
# (paire, pied x, pied y) en pixels de la peinture ; les cristaux couchés, ceux sur les massifs ou collés aux lanternes sont écartés
PIEDS = [(0, 1780, 1290), (0, 2190, 1030), (0, 2550, 1130), (0, 2700, 1570),
         (1, 1800, 1240), (1, 2760, 1000), (1, 2740, 1700),
         (2, 1400, 1300), (2, 1650, 1580), (2, 2900, 1340), (2, 2620, 1550),
         (3, 1680, 1090), (3, 2200, 1000), (3, 2670, 1100), (3, 1370, 1420), (3, 2520, 1580),
         (4, 1580, 1140), (4, 2700, 1100), (4, 1690, 1580), (4, 2730, 1500)]
EXCLUS = [(1, 1478, 846), (1, 1387, 847), (2, 2190, 1200), (2, 2080, 1240), (2, 2320, 1170), (2, 1800, 1120), (2, 2010, 1050), (2, 2200, 990), (2, 2330, 990), (2, 2550, 1100), (2, 2390, 1110), (2, 2440, 1160), (2, 2360, 1200),
          (2, 850, 1550), (2, 3400, 1560), (3, 2210, 1240), (3, 2050, 1260), (3, 2380, 1220), (3, 2930, 900)]   # (couchés, petits, sur les massifs, contre les lanternes)
IMG = {}
def img(k):
    if k not in IMG: IMG[k] = (cv2.imread('/tmp/cr2/C%d.png' % k).astype(np.float32), cv2.imread('/tmp/cr2/R%d.png' % k).astype(np.float32))
    return IMG[k]
spots = []
for s, (k, fx, fy) in enumerate(PIEDS):
    C, R = img(k)
    d = cv2.GaussianBlur(np.maximum(np.abs(C - P).max(2), np.abs(R - P).max(2)), (0, 0), 2.5)
    chg = (d > 28).astype(np.uint8); chg[:250] = 0
    # attribuer chaque pixel changé au pied le plus proche de la même paire (le cristal monte au-dessus de son pied)
    autres = [(x, y) for (kk, x, y) in PIEDS + EXCLUS if kk == k]
    yy, xx = np.mgrid[0:1872, 0:4384]
    def dist(x, y): dy = np.where(yy < y, (y - yy) * 0.35, (yy - y) * 1.0); return np.hypot(xx - x, dy)
    dm = dist(fx, fy); proche = np.ones_like(chg, bool)
    for (ox, oy) in autres:
        if (ox, oy) != (fx, fy): proche &= dm < dist(ox, oy)
    n, lab, st, _ = cv2.connectedComponentsWithStats((chg & proche).astype(np.uint8))
    # la composante qui touche le pied, plus les morceaux proches (fissures)
    # la grande tache qui contient le pied, puis les morceaux qui la touchent presque (les bouts de fissures)
    cand = [i for i in range(1, n) if st[i, 4] >= 150 and st[i, 0] - 60 <= fx <= st[i, 0] + st[i, 2] + 60 and st[i, 1] - 60 <= fy <= st[i, 1] + st[i, 3] + 60]
    main = max(cand, key=lambda i: st[i, 4])
    zone = (lab == main).astype(np.uint8); proche_main = cv2.dilate(zone, np.ones((61, 61), np.uint8))
    for i in range(1, n):
        if i != main and st[i, 4] >= 150 and (proche_main[lab == i]).any(): zone[lab == i] = 1
    ys, xs = np.nonzero(zone)
    x0, x1, y0, y1 = xs.min() - 40, xs.max() + 40, ys.min() - 40, ys.max() + 40
    x0, y0 = max(0, x0), max(250, y0); x1, y1 = min(4384, x1), min(1872, y1)
    spots.append(dict(k=k, pied=[fx, fy], rect=[int(x0), int(y0), int(x1 - x0), int(y1 - y0)]))
    np.save('/tmp/cr2/zone%d.npy' % s, zone[y0:y1, x0:x1])
    print(s, k, (fx, fy), 'cadre', spots[-1]['rect'])
vis = {}
for s_, sp in enumerate(spots):
    k = sp['k']
    if k not in vis: vis[k] = img(k)[0].copy() * 0.55
    x, y, w, h = sp['rect']; z = np.load('/tmp/cr2/zone%d.npy' % s_).astype(bool)
    col = np.array([(0, 255, 255), (255, 0, 255), (0, 255, 0), (255, 128, 0), (0, 128, 255)][s_ % 5], np.float32)
    v = vis[k][y:y + h, x:x + w]; v[z] = v[z] * 0.4 + col * 0.6
    cv2.rectangle(vis[k], (x, y), (x + w, y + h), col.tolist(), 4); cv2.circle(vis[k], tuple(sp['pied']), 12, (255, 255, 255), -1)
for k, v in vis.items(): cv2.imwrite('/tmp/cr2/zones%d.jpg' % k, cv2.resize(v.astype(np.uint8), (1461, 624))[200:])
json.dump(spots, open('/tmp/cr2/spots.json', 'w'))
