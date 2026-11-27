import numpy as np, sys
from scipy import ndimage
from PIL import Image
sys.path.insert(0, '/tmp/luth'); from glb import GLB
D = np.load('/tmp/luth/dos_D.npy'); h = 0.0025
Df = np.nan_to_num(D, nan=-1.0); gy, gx = np.gradient(Df); G = np.hypot(gx, gy)
lab, n = ndimage.label((G < 0.003) & ~np.isnan(D))
L = ndimage.binary_fill_holes(lab == lab[int(round((1.075 - 0.6) / h)), int(round((-0.1125 + 0.3) / h))])
L = ndimage.binary_closing(L, iterations=4); L = ndimage.binary_fill_holes(L)
Ld = ndimage.binary_dilation(L, iterations=3)          # + les bords (les flancs du luth)
# le dos sous le luth : on le devine en lissant depuis le tour (Laplace)
B = D.copy(); inconnu = Ld | np.isnan(D)
B[inconnu] = np.nan
conn = ~np.isnan(B)
F = np.where(conn, B, np.nanmean(B))
for it in range(3000):
    m = ndimage.uniform_filter(F, 3); F = np.where(conn, B, m)
np.save('/tmp/luth/L.npy', L); np.save('/tmp/luth/Ld.npy', Ld); np.save('/tmp/luth/dos_est.npy', F)
g = GLB('/home/claude/brumeval/brumeval-sources/jeu/maquettes/essai-3d/origine/glb/barde.glb')
P = g.lire(0).astype(float); I = g.lire(6).astype(int).reshape(-1, 3)
C = P[I].mean(1); cx, cy, cz = C[:, 0], -C[:, 2], C[:, 1]
j = np.clip(np.round((cz - 0.6) / h).astype(int), 0, 340); i = np.clip(np.round((cx + 0.3) / h).astype(int), 0, 240)
dedans = Ld[j, i] & (cz > 0.6) & (cx > -0.3) & (cx < 0.3)
marge = float(sys.argv[1]) if len(sys.argv) > 1 else 0.006
luth = dedans & (cy > F[j, i] + marge)
print('triangles du luth', luth.sum(), 'sur', len(I))
np.save('/tmp/luth/luth_tri.npy', luth)
# image de contrôle : points des triangles vus de dos et de côté
im = Image.new('RGB', (900, 700), (20, 20, 28)); px = im.load()
for k in range(len(C)):
    col = (255, 80, 60) if luth[k] else (150, 150, 160)
    u = int(225 - cx[k] * 600); v = int(680 - (cz[k] - 0.55) * 700)
    if 0 <= u < 450 and 0 <= v < 700 and (luth[k] or cy[k] > 0): px[u, v] = col
    u2 = int(675 - cy[k] * 600)
    if 450 <= u2 < 900 and 0 <= v < 700: px[u2, v] = col
im.save('/tmp/luth/classe.png')
