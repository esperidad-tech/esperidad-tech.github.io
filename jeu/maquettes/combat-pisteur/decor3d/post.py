# Après le rendu : les contours (la charte du jeu), le halo des feux, les couleurs, le noir autour de la salle.
from PIL import Image, ImageFilter
import numpy as np

FOND = (3, 4, 6)
TRAIT = np.array([10, 11, 20], np.float32) / 255

def lire(p):
    im = Image.open(p); a = np.asarray(im).astype(np.float32)
    return a / (65535.0 if a.max() > 255 else 255.0)

def flou(a, r):
    if a.ndim == 2:
        return np.asarray(Image.fromarray((np.clip(a, 0, 1) * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(r)), np.float32) / 255
    return np.dstack([flou(a[..., i], r) for i in range(a.shape[2])])

def dilater(m, n):
    im = Image.fromarray((m * 255).astype('uint8'))
    for _ in range(n): im = im.filter(ImageFilter.MaxFilter(3))
    return np.asarray(im, np.float32) / 255

def contours(idp, prof, k):
    """les traits : épais et sombres sur les silhouettes (un saut de profondeur), fins entre deux pièces qui se touchent"""
    idc = idp[..., :3]; al = idp[..., 3] if idp.shape[2] > 3 else np.ones(idp.shape[:2], np.float32)
    d = prof[..., 0]
    def diff(a):
        e = np.zeros(a.shape[:2], np.float32)
        for ax in (0, 1):
            dd = np.abs(np.diff(a, axis=ax)); dd = dd.max(-1) if dd.ndim == 3 else dd
            if ax == 0: e[:-1] = np.maximum(e[:-1], dd); e[1:] = np.maximum(e[1:], dd)
            else: e[:, :-1] = np.maximum(e[:, :-1], dd); e[:, 1:] = np.maximum(e[:, 1:], dd)
        return e
    e_id = (diff(idc) > 0.06).astype(np.float32)
    e_al = (diff(al) > 0.3).astype(np.float32)
    dp = diff(d)                               # 1/60 de la plage par pas de profondeur
    saut = np.clip((dp - 0.0035) / 0.006, 0, 1) * e_id
    n = np.clip(diff(prof[..., 1:3]), 0, 1); pli = (n > 0.22).astype(np.float32) * (1 - e_id)
    fin = flou(e_id, 0.55 * k) * 0.36
    gros = flou(dilater(np.maximum(saut, e_al), max(0, int(round(k - 1)))), 0.6 * k) * 0.95
    plis = flou(pli, 0.5 * k) * 0.16
    return np.clip(np.maximum(np.maximum(fin, gros), plis), 0, 1)

def halo(rgb, k, seuil=0.78, force=0.55):
    """le halo des flammes et des fioles : ce qui brille déborde un peu"""
    lum = rgb.max(-1); m = np.clip((lum - seuil) / (1 - seuil), 0, 1)[..., None]
    src = rgb * m
    h = flou(src, 5 * k) * 0.6 + flou(src, 14 * k) * 0.5 + flou(src, 34 * k) * 0.45
    return 1 - (1 - rgb) * (1 - np.clip(h * force, 0, 1))

def couleurs(rgb, contraste=1.08, sat=1.14, gamma=0.96):
    g = rgb.mean(-1, keepdims=True); rgb = g + (rgb - g) * sat
    rgb = np.clip(rgb, 0, 1) ** gamma
    rgb = 0.5 + (rgb - 0.5) * contraste
    return np.clip(rgb, 0, 1)

def vignette(rgb, k, force=0.34):
    H, W = rgb.shape[:2]; yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    cx, cy = W / 2, H * 0.56; d = np.sqrt(((xx - cx) / (W * 0.56)) ** 2 + ((yy - cy) / (H * 0.6)) ** 2)
    v = 1 - force * np.clip((d - 0.55) / 0.6, 0, 1) ** 1.6
    bleu = np.array([0.9, 0.95, 1.08], np.float32)
    return rgb * (v[..., None] * (1 - (1 - v[..., None]) * (1 - bleu) * 0))

def finir(base, dst, fond=True, traits=1.0, cadre=True):
    """base.png (+ base_id.png, base_prof.png) → l'image finie. fond=False : un obstacle détouré (on garde la transparence)."""
    im = lire(base + '.png'); H, W = im.shape[:2]; k = W / 1324.0
    rgb, al = im[..., :3], im[..., 3]
    try: idp, prof = lire(base + '_id.png'), lire(base + '_prof.png'); c = contours(idp, prof, k) * traits
    except FileNotFoundError: c = np.zeros((H, W), np.float32)
    rgb = couleurs(rgb)
    if fond:
        rgb = halo(rgb, k)
        rgb = rgb * (1 - c[..., None]) + TRAIT * c[..., None]
        rgb = vignette(rgb, k)
        f = np.array(FOND, np.float32) / 255; rgb = rgb * al[..., None] + f * (1 - al[..., None])
        if cadre:
            x0, x1, y0, y1 = int(round(15.7 * k)), int(round(1308.3 * k)), int(round(66 * k)), int(round(822 * k))
            rgb[:y0] = f; rgb[y1:] = f; rgb[:, :x0] = f; rgb[:, x1:] = f
        Image.fromarray((np.clip(rgb, 0, 1) * 255).astype('uint8')).save(dst)
    else:
        rgb = rgb * (1 - c[..., None]) + TRAIT * c[..., None]
        rgb = vignette(rgb, k)
        al = np.maximum(al, np.clip(c * 1.05, 0, 1))        # le trait du contour déborde un peu de la pièce
        out = np.dstack([rgb, al]); Image.fromarray((np.clip(out, 0, 1) * 255).astype('uint8'), 'RGBA').save(dst)

def cadrer(src, dst):
    im = Image.open(src).convert('RGBA'); W, H = im.size; k = W / 1324.0
    bg = Image.new('RGBA', im.size, FOND + (255,)); bg.alpha_composite(im); a = np.asarray(bg).copy()
    x0, x1, y0, y1 = int(round(15.7 * k)), int(round(1308.3 * k)), int(round(66 * k)), int(round(822 * k))
    a[:y0] = FOND + (255,); a[y1:] = FOND + (255,); a[:, :x0] = FOND + (255,); a[:, x1:] = FOND + (255,)
    Image.fromarray(a).convert('RGB').save(dst)

if __name__ == '__main__':
    import sys; finir(sys.argv[1], sys.argv[2], traits=float(sys.argv[3]) if len(sys.argv) > 3 else 1.0)
