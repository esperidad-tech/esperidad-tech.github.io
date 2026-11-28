# Nettoie une vue : enlève une ligne de sol fine dessinée en bas, et tout ce qui n'est pas la figure principale.
import sys, numpy as np
from PIL import Image
from scipy import ndimage
for p in sys.argv[1:]:
    im = Image.open(p).convert('RGB'); a = np.asarray(im).astype(int).copy()
    H, W, _ = a.shape
    fond = np.median(np.concatenate([a[:6].reshape(-1,3), a[:, :6].reshape(-1,3), a[:, -6:].reshape(-1,3)]), axis=0)
    m = np.abs(a - fond).sum(axis=2) > 45
    f = m.mean(axis=1)
    lignes = []
    for y in range(int(H*0.7), H):
        if f[y] > 0.6 and f[max(0,y-8)] < 0.35 and f[min(H-1,y+8)] < 0.35:   # une ligne fine, pas un corps large
            lignes.append(y)
    for y in lignes:
        a[y, m[y]] = fond; m[y] = False
    lab, n = ndimage.label(ndimage.binary_dilation(m, iterations=6))
    jete = 0
    if n > 1:
        tailles = ndimage.sum(m, lab, range(1, n+1))
        garde = 1 + int(np.argmax(tailles))
        for k in range(1, n+1):
            if k == garde: continue
            z = m & (lab == k)
            # on ne jette que les morceaux collés au bord gauche ou droit (les voisins de la planche)
            xs = np.where(z.any(axis=0))[0]
            if len(xs) and (xs.min() < W*0.12 or xs.max() > W*0.88):
                a[z] = fond; jete += int(z.sum())
    Image.fromarray(a.astype(np.uint8)).save(p)
    if lignes or jete: print(p.split('/')[-1], 'lignes', len(lignes), 'jeté', jete)
