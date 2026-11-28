# assembler_chute.py : les images détourées de la chute → la vidéo du jeu (couleur | opacité côte à côte) + l'image du cristal planté.
#  - la poussière s'éteint en rond autour du point d'impact (sinon un voile rectangulaire se verrait sur la place) ;
#  - les 6 premières images apparaissent en fondu (le cristal se forme en tombant) ;
#  - de l'image 66 à 84, les rochers encore en l'air s'effacent et l'on passe au cristal planté nettoyé (il ne bouge plus) ;
#  - le cristal planté : seulement le cristal, son tas de gravats et les cailloux posés par terre (le caillou qui flottait est retiré).
import cv2, numpy as np, os, subprocess, sys
D = '/tmp/hf/chuteK'; P = '/tmp/hf/planteK/f000.png'; OUT = '/tmp/hf/chuteJeu'; os.makedirs(OUT + '/img', exist_ok=True)
W, H = 432, 768; CX, CY = 209, 640; FIN = 84; DEB, FON = 66, 84

def lire(p):
    im = cv2.imread(p, cv2.IMREAD_UNCHANGED).astype(np.float32); return im[..., :3], im[..., 3] / 255

# le cristal planté, nettoyé
pc, pa = lire(P)
n, lab, st, cen = cv2.connectedComponentsWithStats((pa > 0.6).astype(np.uint8), 8)
grand = 1 + np.argmax(st[1:, 4]); bx, by, bw, bh = st[grand, :4]; sol = by + bh - 30
garde = np.zeros_like(pa, np.uint8)
for i in range(1, n):
    x, y, w, h, s = st[i]; cy = y + h / 2
    if i == grand or (cy > sol - 70 and abs(cen[i][0] - CX) < 170 and (y > 560)): garde[lab == i] = 1
garde = cv2.GaussianBlur(cv2.dilate(garde, np.ones((9, 9), np.uint8)).astype(np.float32), (0, 0), 2)
pa = pa * np.clip(garde, 0, 1)
print('cristal planté : pied à', (CX, by + bh), '— boîte', (bx, by, bw, bh))

yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
ry = np.where(yy < CY, 430.0, 140.0)
r = np.sqrt(((xx - CX) / 200) ** 2 + ((yy - CY) / ry) ** 2)
rond = 1 - np.clip((r - 0.3) / 0.7, 0, 1); rond = rond * rond * (3 - 2 * rond)

def emballer(c, a):  # couleur | opacité
    return np.hstack([np.clip(c, 0, 255), np.repeat((a * 255)[..., None], 3, 2)]).round().astype(np.uint8)

for k in range(FIN + 1):
    c, a = lire(f'{D}/f{k:03d}.png')
    # les objets (rochers, éclats) : des taches pleines et petites — eux gardent leur opacité ; la poussière (grande nappe) s'éteint en rond
    n_, lab_, st_, _ = cv2.connectedComponentsWithStats((a > 0.85).astype(np.uint8), 8)
    obj = np.isin(lab_, np.where((st_[:, 4] >= 3) & (st_[:, 4] < 2500))[0]) & (lab_ > 0)
    obj = np.clip(cv2.GaussianBlur(cv2.dilate(obj.astype(np.uint8), np.ones((5, 5), np.uint8)).astype(np.float32), (0, 0), 1.5), 0, 1)
    a = a * np.maximum(rond, obj)
    if k < 6: a = a * (k + 1) / 7
    if k >= DEB:
        w = np.clip((k - DEB) / (FON - DEB), 0, 1); w = w * w * (3 - 2 * w)
        c = c * (1 - w) + pc * w; a = a * (1 - w) + pa * w
    cv2.imwrite(f'{OUT}/img/f{k:03d}.png', emballer(c, a))
cv2.imwrite(f'{OUT}/cristal-plante.jpg', emballer(pc, pa), [cv2.IMWRITE_JPEG_QUALITY, 92])
cv2.imwrite(f'{OUT}/cristal-plante.png', np.dstack([pc, pa * 255]).round().astype(np.uint8))
print('images', FIN + 1)
