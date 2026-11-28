# caler_image.py <image> <sortie.jpg> : une image de Romain calée au pixel sur la peinture de nuit (affine puis déformation fine), 2192 × 936
import cv2, numpy as np, sys
W, H = 2192, 936; w, h = W // 2, H // 2
P = cv2.resize(cv2.imread('/mnt/user-data/uploads/b5e242e6-image.png'), (W, H), interpolation=cv2.INTER_AREA)
I = cv2.resize(cv2.imread(sys.argv[1]), (W, H), interpolation=cv2.INTER_AREA)
gris = lambda im: cv2.cvtColor(im, cv2.COLOR_BGR2GRAY).astype(np.float32)
def detail(im):
    g = gris(im); g = g / (cv2.GaussianBlur(g, (0, 0), 12) + 8); g = g - cv2.GaussianBlur(g, (0, 0), 6); return cv2.GaussianBlur(g, (0, 0), 1.2)
crit = (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 300, 1e-7)
A = np.eye(2, 3, dtype=np.float32)
_, A = cv2.findTransformECC(detail(cv2.resize(P, (w, h))), detail(cv2.resize(I, (w, h))), A, cv2.MOTION_AFFINE, crit, None, 5)
A[:, 2] *= 2; Ia = cv2.warpAffine(I, A, (W, H), flags=cv2.INTER_LINEAR | cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REPLICATE)
n8 = lambda d: cv2.normalize(d, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
fl = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM).calc(n8(detail(P)), n8(detail(Ia)), None)
fl = np.clip(np.dstack([cv2.GaussianBlur(fl[..., i], (0, 0), 18) for i in range(2)]), -12, 12)
gx, gy = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
O = cv2.remap(Ia, gx + fl[..., 0], gy + fl[..., 1], cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
mes = lambda a: float(np.abs(detail(a) - detail(P)).mean())
print('écart des contours : brut %.3f, affine %.3f, calée %.3f ; déformation max %.1f px' % (mes(I), mes(Ia), mes(O), float(np.abs(fl).max())))
cv2.imwrite(sys.argv[2], O, [cv2.IMWRITE_JPEG_QUALITY, 88])
# contrôle : alternance peinture / image calée en gros plans (bords nets = bien calé)
rows = []
for (x, y) in ((1100, 250), (450, 620), (1700, 640), (1100, 800)):
    a, b = P[y - 90:y + 90, x - 160:x + 160], O[y - 90:y + 90, x - 160:x + 160]
    m = np.zeros_like(a); m[:, :160] = a[:, :160]; m[:, 160:] = b[:, 160:]   # (moitié peinture | moitié image : les lignes doivent se continuer)
    rows.append(np.hstack([a, b, m]))
cv2.imwrite(sys.argv[2].replace('.jpg', '-controle.jpg'), np.vstack(rows))
