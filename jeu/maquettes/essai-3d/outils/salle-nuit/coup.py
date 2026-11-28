# coup.py <vidéo> <dossier> : une zone du coup de poing (vidéos de Romain, 28 nov. 1 h 11) : chaque image recalée sur la peinture de la place (comme vague.py),
# puis la carte de ce qui change (pour trouver la zone et le moment de l'explosion).
import cv2, numpy as np, glob, json
P = cv2.imread('/mnt/user-data/uploads/b5e242e6-image.png')
import sys
F = sys.argv[1]; OUT = sys.argv[2]
S = 0.25
g = lambda im: cv2.GaussianBlur(cv2.cvtColor(im, cv2.COLOR_BGR2GRAY).astype(np.float32), (5, 5), 0)
ref = g(cv2.resize(P, None, fx=S, fy=S))
M = np.zeros(ref.shape, np.uint8); M[:int(700 * S), :] = 255; M[:, int(1700 * S):int(3500 * S)] = 0   # (le haut du décor, sans le temple ni les colonnes de lumière)
cap = cv2.VideoCapture(F); W = np.eye(2, 3, dtype=np.float32); i = 0; Ws = []
Pf = P.astype(np.float32)
diffs = []
while True:
    ok, im = cap.read()
    if not ok: break
    big = cv2.resize(im, (4384, 1872), interpolation=cv2.INTER_CUBIC)
    try: _, W = cv2.findTransformECC(ref, g(cv2.resize(big, None, fx=S, fy=S)), W.copy(), cv2.MOTION_AFFINE, (3, 60, 1e-5), M, 5)
    except cv2.error: pass
    Ws.append(W.copy())
    Wf = W.copy(); Wf[:, 2] /= S
    al = cv2.warpAffine(big, Wf, (4384, 1872), flags=cv2.INTER_LINEAR | cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REPLICATE)
    cv2.imwrite(OUT + '/f%03d.png' % i, al)
    d = np.abs(cv2.GaussianBlur(al, (9, 9), 0).astype(np.float32) - cv2.GaussianBlur(P, (9, 9), 0).astype(np.float32)).max(axis=2)
    diffs.append(cv2.resize(d, (1096, 468), interpolation=cv2.INTER_AREA))
    i += 1
D = np.array(diffs); np.save(OUT + '/diffs.npy', D)
print(i, 'images ; recalage début', np.round(Ws[0], 4).tolist(), 'fin', np.round(Ws[-1], 4).tolist())
# ce qui change, image par image (hors du haut de l'image) : pour le calendrier
for k in range(0, i, 6): print('%.2f s' % (k / 24), 'pixels qui changent (>40) :', int((D[k] > 40).sum()), ' max', int(D[k].max()))
