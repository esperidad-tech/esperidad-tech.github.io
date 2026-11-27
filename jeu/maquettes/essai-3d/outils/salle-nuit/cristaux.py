# Les cristaux de la vague (27 novembre, 23 h 40) : découpés dans l'image de Romain aux quatre cristaux plantés
# (origine/nuit/place-cristaux.jpg), redressés (ils tombent du plafond : Romain les veut droits), puis faits en 3D par
# Higgsfield (image_to_3d, texturé, 8000 triangles, 30 crédits chacun) ; la texture réduite à 1024 px, le .glb rangé en
# base64 dans site/nuit/cristal-*.json. La fissure sous chaque cristal : le sol de la même image « déplié » vu de dessus
# avec la caméra de la peinture, les traits très sombres gardés -> site/nuit/fissure.png.
# (à lancer depuis outils/salle-nuit ; il faut rembg : pip install rembg onnxruntime)
import cv2, numpy as np, io, base64, json
from camera import *
ORI = '../../origine/nuit/'; OUT = '../../site/nuit/'
im = cv2.imread(ORI + 'place-cristaux.jpg')
CADRES = {'violet': ((2080, 560, 260, 560), 3.4), 'turquoise': ((2500, 1120, 420, 560), 32.5), 'vert': ((2380, 600, 380, 640), 22.5)}
def decoupe():
    from rembg import remove, new_session
    from PIL import Image
    s = new_session('isnet-general-use')
    for n, ((x, y, w, h), angle) in CADRES.items():
        c = Image.fromarray(cv2.cvtColor(im[y:y + h, x:x + w], cv2.COLOR_BGR2RGB))
        m = np.array(remove(c, session=s, only_mask=True)).astype(np.float32)[:, :, None] / 255
        a = (np.array(c)[:, :, ::-1] * m + 255 * (1 - m)).astype(np.uint8)
        big = cv2.copyMakeBorder(a, 300, 300, 300, 300, cv2.BORDER_CONSTANT, value=(255, 255, 255))
        r = cv2.warpAffine(big, cv2.getRotationMatrix2D((big.shape[1] / 2, big.shape[0] / 2), angle, 1), (big.shape[1], big.shape[0]), borderValue=(255, 255, 255))
        ys, xs = np.nonzero(cv2.cvtColor(r, cv2.COLOR_BGR2GRAY) < 235); r = r[ys.min() - 30:ys.max() + 30, xs.min() - 30:xs.max() + 30]
        S = max(r.shape[:2]); q = np.full((S, S, 3), 255, np.uint8); q[(S - r.shape[0]) // 2:(S - r.shape[0]) // 2 + r.shape[0], (S - r.shape[1]) // 2:(S - r.shape[1]) // 2 + r.shape[1]] = r
        cv2.imwrite(ORI + 'cristal-%s-droit.png' % n, cv2.resize(q, (768, 768)))
def fissure():
    X0, D0 = sol(2745, 1590); N, S = 512, 5.0
    gx, gy = np.meshgrid(np.linspace(-S / 2, S / 2, N), np.linspace(-S / 2, S / 2, N)); X = X0 + gx; D = D0 - gy
    zc = D * c + CH * s; t = cv2.remap(im, (CX + F * X / zc).astype(np.float32), (CY - F * (D * s - CH * c) / zc).astype(np.float32), cv2.INTER_LINEAR)
    lum = cv2.cvtColor(t, cv2.COLOR_BGR2GRAY).astype(np.float32); moy = cv2.GaussianBlur(lum, (0, 0), 14); hsv = cv2.cvtColor(t, cv2.COLOR_BGR2HSV)
    cri = cv2.dilate(cv2.morphologyEx(((hsv[:, :, 1] > 70) & (hsv[:, :, 0] > 70) & (hsv[:, :, 0] < 105) & (hsv[:, :, 2] > 70)).astype(np.uint8), cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8)), np.ones((9, 9), np.uint8))
    dur = ((lum < 32) & (lum < 0.55 * moy)).astype(np.uint8); dur[cri > 0] = 0
    n, lab, st, _ = cv2.connectedComponentsWithStats(dur); a = np.clip(cv2.GaussianBlur(np.isin(lab, [i for i in range(1, n) if st[i, 4] > 60]).astype(np.float32), (0, 0), 1.2) * 1.6, 0, 1)
    cx, cy, R = 222, 252, 215; a = a[cy - R:cy + R, cx - R:cx + R]; yy, xx = np.mgrid[-R:R, -R:R]; r = np.hypot(xx, yy) / R
    a = np.maximum(a * np.clip((1 - r) / 0.3, 0, 1), 0.6 * np.clip(1 - r / 0.18, 0, 1) ** 1.5)
    out = np.zeros((2 * R, 2 * R, 4), np.uint8); out[:, :, :3] = (22, 8, 16); out[:, :, 3] = (a * 255).astype(np.uint8); out = cv2.resize(out, (512, 512), interpolation=cv2.INTER_AREA)
    # (puis des traits qui relient chaque morceau de fissure au point d'impact, caché sous le cristal)
    m = (out[:, :, 3] > 127).astype(np.uint8); n, lab, st, _ = cv2.connectedComponentsWithStats(m); rng = np.random.default_rng(3)
    for i in range(1, n):
        if st[i, 4] < 40: continue
        ys, xs = np.nonzero(lab == i); d = np.hypot(xs - 256, ys - 256); k = np.argmin(d)
        if d[k] < 30 or d[k] > 200: continue
        p1 = np.array([xs[k], ys[k]], float); p0 = 256 + (p1 - 256) * 0.12; nr = np.array([-(p1 - p0)[1], (p1 - p0)[0]]); nr /= np.linalg.norm(nr)
        pts = [p0] + [p0 + (p1 - p0) * j / 8 + nr * rng.normal(0, 3) for j in range(1, 8)] + [p1]
        for j in range(len(pts) - 1): cv2.line(out, tuple(np.int32(pts[j])), tuple(np.int32(pts[j + 1])), (22, 8, 16, 255), int(round(2 + 3 * j / len(pts))), cv2.LINE_AA)
    cv2.imwrite(OUT + 'fissure.png', out)
if __name__ == '__main__':
    import sys
    if 'decoupe' in sys.argv: decoupe()
    fissure()
