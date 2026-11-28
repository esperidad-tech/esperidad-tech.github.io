# caler.py <vidéo> <dossier de sortie> [début s] [fin s]
# Cale une vidéo de Romain AU PIXEL sur la peinture de la place (sa règle : « quand on les superpose ou qu'on fait un fondu, on ne voit
# aucune différence »), à la moitié de la taille de la peinture (2192 × 936, la taille des vidéos du jeu) :
#  1. sa première image : étirée / tournée sur la peinture (ECC affine), puis déformée finement point par point (flux optique DIS,
#     lissé : on corrige les petites différences de perspective et de « respiration » de la génération, pas le contenu) ;
#  2. chaque image suivante : recalée sur la première (ECC affine, sans les endroits qui changent), pour suivre la petite dérive ;
#  3. les couleurs : courbe par canal qui fait correspondre la première image à la peinture, là où rien ne change ;
#  4. sortie : les images recalées (PNG), la première image corrigée (ref.png : le jeu s'en sert pour ne montrer que ce qui change),
#     et une fiche de contrôle (écarts avant / après, gros plans en alternance).
import cv2, numpy as np, sys, os, json
F, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
T0 = float(sys.argv[3]) if len(sys.argv) > 3 else 0.0; T1 = float(sys.argv[4]) if len(sys.argv) > 4 else 1e9
W, H = 2192, 936; w, h = W // 2, H // 2
P = cv2.resize(cv2.imread('/mnt/user-data/uploads/b5e242e6-image.png'), (W, H), interpolation=cv2.INTER_AREA)
gris = lambda im: cv2.cvtColor(im, cv2.COLOR_BGR2GRAY).astype(np.float32)
def detail(im):   # (pour comparer des images aux couleurs différentes : les contours, pas les teintes)
    g = gris(im); g = g - cv2.GaussianBlur(g, (0, 0), 6); return cv2.GaussianBlur(g, (0, 0), 1.2)
cap = cv2.VideoCapture(F); fps = cap.get(cv2.CAP_PROP_FPS) or 24
frames = []; t = 0; k = 0
while True:
    ok, im = cap.read()
    if not ok: break
    t = k / fps; k += 1
    if T0 - 1e-6 <= t <= T1 + 1e-6: frames.append(cv2.resize(im, (W, H), interpolation=cv2.INTER_AREA))
print(len(frames), 'images gardées de', k, '; fps', fps)
f0 = frames[0]; pq, f0q = cv2.resize(P, (w, h), interpolation=cv2.INTER_AREA), cv2.resize(f0, (w, h), interpolation=cv2.INTER_AREA)
crit = (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 200, 1e-6)
# 1. première image → peinture : affine puis flux fin
A0 = np.eye(2, 3, dtype=np.float32)
_, A0 = cv2.findTransformECC(detail(pq), detail(f0q), A0, cv2.MOTION_AFFINE, crit, None, 5)
A0f = A0.copy(); A0f[:, 2] *= 2
f0a = cv2.warpAffine(f0, A0f, (W, H), flags=cv2.INTER_LINEAR | cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REPLICATE)
dis = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
n8 = lambda d: cv2.normalize(d, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
fl = dis.calc(n8(detail(P)), n8(detail(f0a)), None)          # peinture(x) ≈ f0a(x + fl(x))
fl = np.dstack([cv2.GaussianBlur(fl[..., i], (0, 0), 18) for i in range(2)])   # (lissé : la forme générale, pas les détails)
fl = np.clip(fl, -12, 12)
gx, gy = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
X, Y = gx + fl[..., 0], gy + fl[..., 1]                       # (où lire, dans f0a, chaque pixel de la peinture)
# (et dans l'image d'origine : à travers l'affine A0f)
def compose(Ak):   # Ak : image k ← image 0 (en coordonnées pleines) ; renvoie les cartes de lecture dans l'image k
    M0 = np.vstack([A0f, [0, 0, 1]]); Mk = np.vstack([Ak, [0, 0, 1]]); M = Mk @ M0
    return (M[0, 0] * X + M[0, 1] * Y + M[0, 2]).astype(np.float32), (M[1, 0] * X + M[1, 1] * Y + M[1, 2]).astype(np.float32)
# 2. chaque image → la première (sans ce qui change)
Aks = []; Ak = np.eye(2, 3, dtype=np.float32); d0 = detail(f0q)
for i, fr in enumerate(frames):
    fq = cv2.resize(fr, (w, h), interpolation=cv2.INTER_AREA)
    ch = (cv2.GaussianBlur(np.abs(fq.astype(np.float32) - f0q.astype(np.float32)).max(axis=2), (0, 0), 3) < 18).astype(np.uint8) * 255
    try: _, Ak = cv2.findTransformECC(d0, detail(fq), Ak.copy(), cv2.MOTION_AFFINE, crit, ch, 5)
    except cv2.error: pass
    A = Ak.copy(); A[:, 2] *= 2; Aks.append(A)
# 3. couleurs : courbes par canal (là où la peinture et la première image se ressemblent)
mx, my = compose(np.eye(2, 3, dtype=np.float32)); r0 = cv2.remap(f0, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
lut = np.zeros((3, 256), np.uint8)
for c in range(3):
    a, b = r0[..., c].ravel(), P[..., c].ravel()
    qs = np.linspace(0.2, 99.8, 120); xa, xb = np.percentile(a, qs), np.percentile(b, qs)
    xa, idx = np.unique(xa, return_index=True); xb = xb[idx]
    lut[c] = np.clip(np.interp(np.arange(256), xa, xb), 0, 255).astype(np.uint8)
corr = lambda im: np.dstack([cv2.LUT(im[..., c], lut[c]) for c in range(3)])
# 4. sortie
ecarts = []
for i, fr in enumerate(frames):
    mx, my = compose(Aks[i]); o = corr(cv2.remap(fr, mx, my, cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE))
    cv2.imwrite(f'{OUT}/f{i:03d}.png', o)
    if i == 0: cv2.imwrite(f'{OUT}/ref.png', o); ref = o
mes = lambda a: float(np.abs(detail(a) - detail(P)).mean())
avant = cv2.resize(frames[0], (W, H)); cal_aff = f0a
print('écart des contours avec la peinture : brut %.2f, affine seule %.2f, calée %.2f' % (mes(avant), mes(cal_aff), mes(ref)))
print('écart des couleurs (moyenne absolue) : affine %.1f, calée+couleurs %.1f' % (float(np.abs(cal_aff.astype(int) - P).mean()), float(np.abs(ref.astype(int) - P).mean())))
json.dump({ 'images': len(frames), 'fps': fps, 'debut': T0, 'flux_max': float(np.abs(fl).max()) }, open(f'{OUT}/info.json', 'w'))
# fiche : 6 gros plans, peinture | vidéo calée | différence ×4
pts = [(300, 300), (1000, 250), (1800, 300), (400, 700), (1100, 650), (1800, 700)]; rows = []
for (x, y) in pts:
    a, b = P[y - 90:y + 90, x - 140:x + 140], ref[y - 90:y + 90, x - 140:x + 140]
    d = np.clip(np.abs(a.astype(int) - b.astype(int)) * 4, 0, 255).astype(np.uint8)
    rows.append(np.hstack([a, b, d]))
cv2.imwrite(f'{OUT}/controle.jpg', np.vstack(rows))
