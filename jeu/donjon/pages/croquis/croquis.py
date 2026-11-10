"""Le croquis « carnet d'explorateur » d'un monstre : python3 croquis.py rat gardien …   (depuis jeu/donjon/pages/croquis/)

1. `python3 seuls.py rat gardien …` rend chaque monstre du bestiaire seul, sur fond blanc (dans seuls/<id>.png) ;
2. ce script en tire un dessin à l'encre brune sur vieux papier : croquis-<id>.png (560 px de large).
Essai du 10 novembre (20 h 58) pour Romain, qui veut des monstres « dessinés à la main, à l'ancienne, comme dans un carnet ».
En attente de sa validation : rien n'est encore dans le jeu."""
import sys, os
import numpy as np
from PIL import Image, ImageFilter, ImageOps
ICI = os.path.dirname(os.path.abspath(__file__))


def croquis(nom, graine=3):
    im = Image.open(os.path.join(ICI, 'seuls', nom + '.png')).convert('RGB')
    a0 = np.asarray(im).astype(np.float32)
    nb = (a0.min(axis=2) < 244); ys, xs = np.where(nb)                      # le cadre du dessin : là où ce n'est pas blanc
    im = im.crop((max(0, xs.min() - 40), max(0, ys.min() - 40), min(im.width, xs.max() + 40), min(im.height, ys.max() + 40)))
    g = ImageOps.grayscale(im)
    a = np.asarray(g).astype(np.float32)
    fl = np.asarray(g.filter(ImageFilter.GaussianBlur(7))).astype(np.float32)
    trait = np.clip(a * 255.0 / (fl + 1.0), 0, 255)                           # le trait : l'image divisée par son flou
    trait = 255 - np.clip((255 - trait) * 2.2, 0, 255)
    ton = 255 - np.clip((255 - a) * 0.30, 0, 255)                             # un gris léger de crayon dans les parties sombres
    W, H = g.size
    rnd = np.random.RandomState(graine)
    yy, xx = np.mgrid[0:H, 0:W]
    hach = ((xx + yy) % 9 < 2)                                                # des hachures en biais
    ton = np.where((a < 120) & hach, 255 - np.clip((255 - a) * 0.55, 0, 255), ton)
    t = Image.fromarray(np.minimum(trait, ton).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7))
    M = 70; PW, PH = W + 2 * M, H + 2 * M                                     # la page du carnet
    papier = np.zeros((PH, PW, 3), np.float32); papier[:] = (238, 225, 193)
    br = rnd.normal(0, 6, (PH // 5 + 1, PW // 5 + 1))
    br = np.asarray(Image.fromarray((br + 128).clip(0, 255).astype(np.uint8)).resize((PW, PH), Image.BICUBIC)).astype(np.float32) - 128
    papier += br[:, :, None]
    y2, x2 = np.mgrid[0:PH, 0:PW]; d = np.hypot((x2 - PW / 2) / (PW / 2), (y2 - PH / 2) / (PH / 2))
    papier *= (1 - 0.20 * np.clip(d - 0.6, 0, 1))[:, :, None]
    k = np.ones((PH, PW), np.float32); k[M:M + H, M:M + W] = np.asarray(t).astype(np.float32) / 255.0
    encre = np.array([62, 42, 28], np.float32)
    res = papier * k[:, :, None] + encre * (1 - k[:, :, None]) * 0.92 + papier * (1 - k[:, :, None]) * 0.08
    img = Image.fromarray(res.clip(0, 255).astype(np.uint8))
    img = img.resize((560, int(560 * PH / PW)), Image.LANCZOS)
    img.save(os.path.join(ICI, 'croquis-%s.png' % nom))
    return img.size


if __name__ == '__main__':
    for n in sys.argv[1:]:
        print(n, croquis(n))
