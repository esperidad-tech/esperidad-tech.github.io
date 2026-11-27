# Prépare la place de nuit pour l'essai 3D : le fond (sans le Barde peint), les deux lanternes découpées,
# les crevasses (image + masque), les cases où l'on peut marcher, et les repères (lumières, armure) -> site/nuit/
import cv2, numpy as np, json, base64, sys
from camera import *
# (à lancer depuis outils/salle-nuit ; les images de Romain sont dans origine/nuit, en JPEG)
ORI = '../../origine/nuit/'
OUT = '../../site/nuit/'
A = cv2.imread(ORI + 'place-vide.jpg')           # la place vide
B = cv2.imread(ORI + 'place-lanternes.jpg')      # avec les lanternes (et le Barde peint)
C = cv2.imread(ORI + 'place-crevasses.jpg')      # les deux crevasses
K = 4096 / W                                       # (les textures : 4096 px de large au plus, pour les téléphones)

# 1. le fond : B, le Barde peint remplacé par la place vide (A), à la même lumière
x0, y0, x1, y1 = 2140, 970, 2255, 1150
fond = B.copy()
anneau = np.zeros(B.shape[:2], bool); anneau[y0 - 30:y1 + 30, x0 - 30:x1 + 30] = True; anneau[y0:y1, x0:x1] = False
gain = B[anneau].reshape(-1, 3).astype(float).mean(0) / A[anneau].reshape(-1, 3).astype(float).mean(0)
m = np.zeros(B.shape[:2], np.float32); m[y0:y1, x0:x1] = 1; m = cv2.GaussianBlur(m, (31, 31), 0)[:, :, None]
fond = (B * (1 - m) + np.clip(A * gain, 0, 255) * m).astype(np.uint8)
print('gain du raccord', gain.round(3))
cv2.imwrite(OUT + 'fond.jpg', cv2.resize(fond, (4096, round(H * K)), interpolation=cv2.INTER_AREA), [cv2.IMWRITE_JPEG_QUALITY, 87])

# 2. les lanternes découpées (masques faits par rembg, isnet) : un masque par lanterne, en coordonnées de l'image
pil = []
for nom, (cx0, cy0), f in [('g', (860, 980), ORI + 'pg_masque.png'), ('d', (3110, 1010), ORI + 'pd_masque2.png')]:
    mk = cv2.imread(f, 0).astype(np.float32)
    if nom == 'g':   # (le reflet d'un cristal pris en trop, au-dessus du toit)
        yy, xx = np.mgrid[0:mk.shape[0], 0:mk.shape[1]]
        mk[(xx > 116) & (xx < 182) & (yy < 0.6 * (xx - 120) + 74)] = 0
    n, lab, st, _ = cv2.connectedComponentsWithStats((mk > 128).astype(np.uint8))
    garde = 1 + np.argmax(st[1:, 4]); mk[lab != garde] = 0
    ys, xs = np.nonzero(mk > 128)
    bas = ys.max(); xb = xs[ys > bas - 60].mean()
    pied = (cx0 + xb, cy0 + bas - 40)           # (le milieu du socle, posé sur le sol)
    X, D = sol(*pied)
    cv2.imwrite(OUT + 'pilier-' + nom + '.png', mk.astype(np.uint8))
    rect = [cx0, cy0, mk.shape[1], mk.shape[0]]
    # la lanterne : les pixels chauds et clairs
    cc = B[cy0:cy0 + mk.shape[0], cx0:cx0 + mk.shape[1]].astype(int)
    k = (cc[:, :, 2] > 200) & (cc[:, :, 1] > 140) & (cc[:, :, 0] < 170)
    ly, lx = np.nonzero(k); vl = cy0 + ly.mean()
    zl = fsolve(lambda z: proj(X, D, z[0])[1] - vl, [2.5])[0]
    zt = fsolve(lambda z: proj(X, D, z[0])[1] - (cy0 + ys.min()), [3.5])[0]
    pil.append({'nom': nom, 'x': X, 'd': D, 'rect': rect, 'lanterne': zl, 'haut': zt,
                'gauche': sol(cx0 + xs.min(), pied[1])[0], 'droite': sol(cx0 + xs.max(), pied[1])[0]})
    print('pilier', nom, 'pied', np.round(pied), 'monde', round(X, 2), round(D, 2), 'lanterne à', round(zl, 2), 'm, haut', round(zt, 2))

# 3. les crevasses : la bande de sol repeinte (C), et le trou lui-même (pour les collisions)
def flou(x, r): return cv2.GaussianBlur(x, (0, 0), r)
d = np.abs(flou(C.astype(np.float32), 3) - flou(fond.astype(np.float32), 3)).max(2)
sol_poly = np.array([(1240, 955), (3140, 955), (3900, 1872), (560, 1872)], np.int32)
zone = np.zeros((H, W), np.uint8); cv2.fillPoly(zone, [sol_poly], 1)
for p in pil:   # (pas les lanternes)
    rx, ry, rw, rh = p['rect']; mk = cv2.imread(OUT + 'pilier-' + p['nom'] + '.png', 0)
    big = np.zeros((H, W), np.uint8); big[ry:ry + rh, rx:rx + rw] = (mk > 60); big = cv2.dilate(big, np.ones((25, 25), np.uint8)); zone[big > 0] = 0
bande = ((flou(d, 6) > 22) & (zone > 0)).astype(np.uint8)
bande = cv2.morphologyEx(bande, cv2.MORPH_CLOSE, np.ones((41, 41), np.uint8))
n, lab, st, _ = cv2.connectedComponentsWithStats(bande)
bande = np.isin(lab, [i for i in range(1, n) if st[i, 4] > 20000]).astype(np.uint8)
bande = cv2.dilate(bande, np.ones((21, 21), np.uint8)) * zone
alpha = np.clip(flou(bande.astype(np.float32), 9) * 1.6, 0, 1)
ys, xs = np.nonzero(alpha > 0.01); bx0, by0, bx1, by1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
print('crevasses : cadre', bx0, by0, bx1, by1)
kc = K
cw, ch = round((bx1 - bx0) * kc), round((by1 - by0) * kc)
cv2.imwrite(OUT + 'crev.jpg', cv2.resize(C[by0:by1, bx0:bx1], (cw, ch), interpolation=cv2.INTER_AREA), [cv2.IMWRITE_JPEG_QUALITY, 86])
cv2.imwrite(OUT + 'crev-a.png', cv2.resize((alpha[by0:by1, bx0:bx1] * 255).astype(np.uint8), (cw, ch), interpolation=cv2.INTER_AREA))
# le trou : sombre, ou qui brille violet / bleu-vert (les cristaux au fond)
hsv = cv2.cvtColor(C, cv2.COLOR_BGR2HSV).astype(int); lum = cv2.cvtColor(C, cv2.COLOR_BGR2GRAY).astype(int)
fondL = flou(cv2.cvtColor(fond, cv2.COLOR_BGR2GRAY).astype(np.float32), 25)
trou = ((lum < 0.55 * fondL) | ((hsv[:, :, 1] > 110) & ((hsv[:, :, 0] > 120) | ((hsv[:, :, 0] > 80) & (hsv[:, :, 0] < 100))) & (hsv[:, :, 2] > 90))) & (bande > 0)
trou = trou.astype(np.uint8)
trou = cv2.morphologyEx(trou, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
trou = cv2.morphologyEx(trou, cv2.MORPH_CLOSE, np.ones((25, 25), np.uint8))
n, lab, st, _ = cv2.connectedComponentsWithStats(trou)
trou = np.isin(lab, [i for i in range(1, n) if st[i, 4] > 6000]).astype(np.uint8)
cv2.imwrite('/tmp/trou.png', trou * 255)
vis = C.copy(); vis[trou > 0] = (vis[trou > 0] * 0.4 + np.array([0, 0, 255]) * 0.6).astype(np.uint8)
cv2.polylines(vis, [sol_poly], True, (0, 255, 255), 3)
cv2.imwrite('/tmp/trou_vis.jpg', cv2.resize(vis[850:1872, 500:3950], None, fx=0.5, fy=0.5))

# 4. les cases du sol (0,2 pas) : où l'on peut marcher, où sont les crevasses
XOFF, DMAX = 9.8, 39.8           # x du jeu = X + XOFF ; y du jeu = DMAX - D (le fond de la place vers y = 0)
PAS = 0.2; NX, NY = 110, 100
marche = np.array([(1290, 972), (3090, 972), (3765, 1805), (730, 1805)], np.float32)
def dans(poly, u, v): return cv2.pointPolygonTest(poly, (float(u), float(v)), False) >= 0
lib = np.zeros((NY, NX), np.uint8); crv = np.zeros((NY, NX), np.uint8)
for j in range(NY):
    for i in range(NX):
        gx, gy = (i + 0.5) * PAS, (j + 0.5) * PAS
        X, D = gx - XOFF, DMAX - gy
        if D < 5: continue
        u, v = proj(X, D)
        if not (0 <= u < W and 0 <= v < H): continue
        if dans(marche, u, v) and all(np.hypot(X - p['x'], (D - p['d']) * 1.0) > 0.85 for p in pil): lib[j, i] = 1
        if trou[int(v), int(u)]: crv[j, i] = 1
from scipy import ndimage as ndi
crv = ndi.binary_closing(crv, np.ones((3, 3)), iterations=2)
crv = ndi.binary_fill_holes(crv)
crv = ndi.binary_opening(crv, np.ones((4, 4))).astype(np.uint8)   # (les petites fêlures sur les côtés : on les enjambe)
crv = ndi.binary_dilation(crv, np.ones((3, 3))).astype(np.uint8)   # (un peu plus large : on s'arrête sur le bord, pas au-dessus du vide)
def bits(a): return base64.b64encode(np.packbits(a.flatten())).decode()
# la place de l'armure : en haut des marches, devant la porte du temple (une estimation : la peinture n'est pas d'aplomb là-bas)
Xa, Da = sol(2190, 690, 2.0)
porte = sol(2165, 560, 4.0)
J = {
  'image': [W, H], 'tex': 4096 / W, 'f': F, 'cx': CX, 'cy': CY, 'phi': float(PHI), 'camH': float(CH), 'xoff': XOFF, 'dmax': DMAX,
  'grille': {'pas': PAS, 'nx': NX, 'ny': NY, 'libre': bits(lib), 'crevasse': bits(crv)},
  'piliers': [{k: (float(v) if isinstance(v, (float, np.floating)) else v) for k, v in p.items()} for p in pil],
  'crev': [int(bx0), int(by0), int(bx1 - bx0), int(by1 - by0)],
  'armure': {'x': float(Xa + XOFF), 'y': float(DMAX - Da), 'z': 2.0},
  'porte': {'x': float(porte[0] + XOFF), 'y': float(DMAX - porte[1]), 'z': 4.0},
  'depart': {'x': float(0.87 + XOFF), 'y': float(DMAX - 33.74)},
}
json.dump(J, open(OUT + 'nuit.json', 'w'))
print('cases libres', lib.sum(), 'crevasse', crv.sum(), 'armure', J['armure'], 'porte', J['porte'])
vis = np.zeros((NY, NX, 3), np.uint8); vis[lib > 0] = (90, 90, 90); vis[(crv > 0) & (lib > 0)] = (40, 40, 255); vis[(crv > 0) & (lib == 0)] = (40, 40, 120)
cv2.imwrite('/tmp/grille.png', cv2.resize(vis, None, fx=5, fy=5, interpolation=cv2.INTER_NEAREST))
