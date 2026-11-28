# Coupe une planche en 4 vues aux creux entre les figures, puis met chaque vue au carré sur le fond.
import sys, numpy as np
from PIL import Image
src, outdir, nom = sys.argv[1], sys.argv[2], sys.argv[3]
im = Image.open(src).convert('RGB'); a = np.asarray(im).astype(int)
H, W, _ = a.shape
# couleur du fond : médiane des bords
bord = np.concatenate([a[:8].reshape(-1,3), a[-8:].reshape(-1,3), a[:, :8].reshape(-1,3), a[:, -8:].reshape(-1,3)])
fond = np.median(bord, axis=0)
diff = np.abs(a - fond).sum(axis=2) > 45
col = diff.sum(axis=0).astype(float)
k = np.ones(15)/15; col = np.convolve(col, k, mode='same')
coupes = []
for q in (1, 2, 3):
    c = int(W*q/4); lo, hi = c-260, c+260
    seg = col[lo:hi]
    m = seg.min()
    idx = np.where(seg <= m + 1)[0]          # le creux le plus large : on prend son milieu
    coupes.append(lo + int(idx.mean()))
bornes = [0] + coupes + [W]
noms = ['face', 'profil', 'dos', 'trois-quarts']
for i in range(4):
    x0, x1 = bornes[i], bornes[i+1]
    d = diff[:, x0:x1]
    ys, xs = np.where(d)
    y0, y1 = max(0, ys.min()-30), min(H, ys.max()+30)
    xa, xb = max(0, xs.min()-30), min(x1-x0, xs.max()+30)
    crop = im.crop((x0+xa, y0, x0+xb, y1))
    s = max(crop.size) + 60
    sq = Image.new('RGB', (s, s), tuple(int(v) for v in fond))
    sq.paste(crop, ((s-crop.width)//2, (s-crop.height)//2))
    sq.save(f'{outdir}/{nom}-{noms[i]}.png')
    print(nom, noms[i], 'colonnes', x0+xa, x0+xb, 'creux', col[bornes[i+1]-1] if i < 3 else '', 'taille', sq.size)
