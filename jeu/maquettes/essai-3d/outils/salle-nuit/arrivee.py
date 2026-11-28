# La carte « quand le feu arrive ici », refaite d'après les images recalées de sa vidéo (/tmp/vague2/f###.png, lignes 250 à 1870 à moitié de taille).
# Le feu, c'est l'anneau de flammes (très clair, orange) ou la lave qui reste derrière ; pas la lueur de la boule de feu sur les dalles au début
# (images 0 à 29 : la place est éclairée, elle ne brûle pas). 1/8 de la taille de la peinture, en images de la vidéo ; 255 = jamais.
import cv2, numpy as np, glob
P = cv2.imread('/mnt/user-data/uploads/b5e242e6-image.png')
P8 = cv2.resize(P, (548, 234), interpolation=cv2.INTER_AREA).astype(np.float32)
N = len(glob.glob('/tmp/vague2/f[0-9][0-9][0-9].png'))
arr = np.full((234, 548), 255, np.uint8)
for i in range(N):
    f = cv2.imread('/tmp/vague2/f%03d.png' % i)
    s8 = P8.copy(); s8[31:233] = cv2.resize(f, (548, 202), interpolation=cv2.INTER_AREA).astype(np.float32)
    B, G, R = s8[:, :, 0], s8[:, :, 1], s8[:, :, 2]
    anneau = (R > 200) & (G > 100) & (R - B > 110)
    lave = (R > 85) & (R > 1.6 * B) & (R - P8[:, :, 2] > 30)
    brule = (anneau & (i >= 30)) | (lave & (i >= 40))
    arr[brule & (arr == 255)] = i
arr = cv2.medianBlur(arr, 5)
cv2.imwrite('/tmp/essai3d/site/nuit/arrivee.png', arr)
v = arr.astype(np.float32); vis = np.where(arr == 255, 0, 60 + v * 1.5).astype(np.uint8)
cv2.imwrite('/tmp/v3/arr_new.png', cv2.resize(vis, (1096, 468), interpolation=cv2.INTER_NEAREST))
print(N, 'images ;', (arr < 255).mean().round(3), 'de la carte brûle ; premières', np.unique(arr)[:6])
# Et l'image de secours (si la vidéo ne défile pas, sur certains iPhone) : la place à moitié de taille, avec la dernière image de sa vidéo
# (la place en lave) à la place des lignes 250 à 1870 ; le jeu la pose selon la carte ci-dessus.
F = cv2.imread('/tmp/essai3d/site/nuit/fond.jpg')
S = cv2.resize(F, (2192, 936), interpolation=cv2.INTER_AREA); S[125:935] = cv2.imread('/tmp/vague2/f%03d.png' % (N - 1))[:810]
cv2.imwrite('/tmp/essai3d/site/nuit/feu.jpg', S, [cv2.IMWRITE_JPEG_QUALITY, 86])
