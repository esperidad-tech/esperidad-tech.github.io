# detourer.py <vidéo sur fond vert> <sortie (dossier)> <largeur> <hauteur> [début s] [fin s]
# Détourage d'une vidéo sur fond vert, réglé pour elle (règle de Romain : « très précis, vraiment propre ») :
#  1) une « plaque » du fond vert sans rien devant : pour chaque pixel, son vert le plus pur sur toute la vidéo (la caméra ne bouge pas),
#     lissée — l'éclairage inégal du fond est ainsi connu pixel par pixel, au lieu d'un vert moyen ;
#  2) l'opacité vient de « combien ce pixel est encore vert » comparé à la plaque à cet endroit : une ombre portée devient du noir
#     transparent (une vraie ombre), la poussière et les bords flous deviennent transparents en partie au lieu d'être coupés net ;
#  3) la couleur est « démélangée » de la plaque, les bords prennent la couleur de l'intérieur (pas de liseré vert ou bleu-vert dû à la
#     compression), puis le vert qui reste est retiré ;
#  4) points isolés retirés. Aucun lissage dans le temps (il laissait des traînées fantômes derrière ce qui bouge).
# Sortie : des images côte à côte, couleur | opacité (le jeu lit les deux moitiés) + une fiche de contrôle toutes les 6 images
# (sur blanc, gris foncé et un morceau de la place).
import cv2, numpy as np, sys, os
F, OUT = sys.argv[1], sys.argv[2]; W, H = int(sys.argv[3]), int(sys.argv[4])
T0 = float(sys.argv[5]) if len(sys.argv) > 5 else 0; T1 = float(sys.argv[6]) if len(sys.argv) > 6 else 1e9
os.makedirs(OUT, exist_ok=True); os.makedirs(OUT + '/controle', exist_ok=True)

def images():
    if F.lower().endswith(('.png', '.jpg')):          # une image seule (la plaque vient alors de la vidéo d'origine : PLAQUE=…)
        yield cv2.resize(cv2.imread(F), (W, H), interpolation=cv2.INTER_AREA).astype(np.float32); return
    cap = cv2.VideoCapture(F); fps = cap.get(cv2.CAP_PROP_FPS) or 24; k = 0
    while True:
        ok, im = cap.read()
        if not ok: return
        t = k / fps; k += 1
        if T0 - 1e-6 <= t <= T1 + 1e-6: yield cv2.resize(im, (W, H), interpolation=cv2.INTER_AREA).astype(np.float32)

def dominance(f): return f[..., 1] - np.maximum(f[..., 0], f[..., 2])

# 1) la plaque : au pixel près, la couleur au moment où il est le plus vert
best = None; plaque = None
for f in ([] if os.environ.get('PLAQUE') else images()):
    d = cv2.GaussianBlur(dominance(f), (5, 5), 0)
    if best is None: best = d.copy(); plaque = f.copy(); continue
    m = d > best; best[m] = d[m]; plaque[m] = f[m]
if os.environ.get('PLAQUE'): plaque = cv2.imread(os.environ['PLAQUE']).astype(np.float32)
else:
    # les pixels jamais verts de toute la vidéo (un objet qui reste) : leur fond est deviné à partir du vert autour
    jamais = (best < 0.6 * np.median(best)).astype(np.uint8)
    jamais = cv2.dilate(jamais, np.ones((9, 9), np.uint8))
    plaque = cv2.inpaint(cv2.medianBlur(plaque.astype(np.uint8), 5), jamais, 12, cv2.INPAINT_TELEA)
    plaque = cv2.GaussianBlur(plaque.astype(np.float32), (0, 0), 9)
    print('pixels jamais verts :', int(jamais.sum()))
dp = np.maximum(dominance(plaque), 20)
cv2.imwrite(OUT + '/plaque.png', plaque.astype(np.uint8))

place = cv2.resize(cv2.imread('/mnt/user-data/uploads/b5e242e6-image.png')[1100:1700, 1400:2600], (W, H)).astype(np.float32)
n = 0
for f in images():
    a = np.clip(1 - dominance(f) / dp, 0, 1)
    a = np.clip((a - 0.05) / 0.9, 0, 1)                        # bruit du fond à 0, cœur des objets à 1
    m = (a > 0.06).astype(np.uint8); nn, lab, st, _ = cv2.connectedComponentsWithStats(m, connectivity=8)
    a[np.isin(lab, np.where(st[:, 4] < 5)[0]) & (lab > 0)] = 0  # points isolés
    aa = np.maximum(a, 1e-3)[..., None]
    c = np.clip((f - (1 - aa) * plaque) / aa, 0, 255)
    # bords : la couleur de l'intérieur, tirée vers l'extérieur (moyenne pondérée par l'opacité)
    P = cv2.GaussianBlur(c * a[..., None] ** 2, (0, 0), 1.6); Q = cv2.GaussianBlur(a ** 2, (0, 0), 1.6)[..., None]
    ext = P / np.maximum(Q, 1e-4); w = np.clip((0.9 - a) / 0.6, 0, 1)[..., None]
    c = c * (1 - w) + ext * w
    # le vert restant : jamais plus que la moyenne rouge/bleu sur les bords et le translucide, jamais plus que le max ailleurs
    B, G, R = c[..., 0], c[..., 1], c[..., 2]
    G[:] = np.where(a < 0.97, np.minimum(G, (R + B) / 2 + 4), np.minimum(G, np.maximum(R, B) + 4))
    # le translucide (poussière, ombre) : sa couleur calculée est peu sûre (le bruit de la vidéo est multiplié) → ramenée vers le gris
    lum = (0.11 * B + 0.59 * G + 0.3 * R)[..., None]; s = np.clip((a - 0.12) / 0.6, 0, 1)[..., None] ** 0.7
    c = lum + (c - lum) * s
    # bords de l'image : l'opacité s'éteint doucement (sinon un bord droit se verrait dans le jeu)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    bord = np.clip(xx / 26, 0, 1) * np.clip((W - 1 - xx) / 26, 0, 1) * np.clip(yy / 18, 0, 1) * np.clip((H - 1 - yy) / 60, 0, 1)
    a = a * (bord * bord * (3 - 2 * bord))
    # sous le transparent, la couleur des voisins (pour qu'aucun noir ne bave au filtrage)
    P = cv2.GaussianBlur(c * a[..., None], (0, 0), 6); Q = cv2.GaussianBlur(a, (0, 0), 6)[..., None]
    rem = P / np.maximum(Q, 1e-4); vide = (a < 0.02)[..., None]
    c = np.where(vide, rem, c)
    cv2.imwrite(f'{OUT}/f{n:03d}.png', np.dstack([np.clip(c, 0, 255), a * 255]).round().astype(np.uint8))
    if n % 6 == 0:
        A = a[..., None]; fonds = [np.full_like(c, 245), np.full_like(c, 40), place]
        cv2.imwrite(f'{OUT}/controle/c{n:03d}.jpg', np.hstack([(c * A + b * (1 - A)).astype(np.uint8) for b in fonds]), [cv2.IMWRITE_JPEG_QUALITY, 90])
    n += 1
print(n, 'images détourées ; vert du fond de', dominance(plaque).min().round(), 'à', dominance(plaque).max().round())
