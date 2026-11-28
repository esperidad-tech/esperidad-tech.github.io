# assembler_brise.py : les images détourées du cristal qui se brise → la vidéo du jeu (couleur | opacité).
#  - images 0 à 53 : il se fissure, éclate, les morceaux tombent (après, la vidéo d'origine les fait partir en paillettes : refusé,
#    Romain ne veut ni évaporation ni fumée) ;
#  - puis les morceaux restent par terre un court instant et disparaissent (simple effacement, 0,4 s) ;
#  - nettoyage : le caillou qui flotte et la tache de fond retouchée (immobiles depuis l'image 0) sont retirés ; ce qui bouge est gardé.
import cv2, numpy as np, os
D = '/tmp/hf/briseK'; OUT = '/tmp/hf/briseJeu'; os.makedirs(OUT + '/img', exist_ok=True)
W, H = 432, 768; DER, TIENT, EFF = 50, 8, 10

def lire(p):
    im = cv2.imread(p, cv2.IMREAD_UNCHANGED).astype(np.float32); return im[..., :3], im[..., 3] / 255

pl = cv2.imread('/tmp/hf/chuteJeu/cristal-plante.png', cv2.IMREAD_UNCHANGED).astype(np.float32); pa = pl[..., 3] / 255
garde = cv2.dilate((pa > 0.02).astype(np.uint8), np.ones((11, 11), np.uint8)).astype(np.float32)
c0, a0 = lire(f'{D}/f000.png')
# le caillou qui flotte (immobile, à gauche) : sa zone, retirée de chaque image sauf là où passe un morceau violet
roc = np.zeros_like(a0, np.uint8); roc[485:560, 95:160] = (a0[485:560, 95:160] > 0.15)
roc = cv2.GaussianBlur(cv2.dilate(roc, np.ones((9, 9), np.uint8)).astype(np.float32), (0, 0), 2)
print('image 0 / cristal planté — écart d\'opacité moyen', round(float(np.abs(a0 * garde - pa).mean()), 4),
      'max', round(float(np.abs(a0 * garde - pa).max()), 3))

def emballer(c, a):
    return np.hstack([np.clip(c, 0, 255), np.repeat((a * 255)[..., None], 3, 2)]).round().astype(np.uint8)

n = 0; dern = None
for k in range(DER + 1):
    c, a = lire(f'{D}/f{k:03d}.png')
    bouge = (np.abs(a - a0) > 0.12) | (np.abs(c - c0).max(2) * np.maximum(a, a0) > 30)
    bouge = cv2.dilate(cv2.morphologyEx(bouge.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)), np.ones((9, 9), np.uint8))
    keep = np.clip(cv2.GaussianBlur(np.maximum(garde, bouge.astype(np.float32)), (0, 0), 2), 0, 1)
    a = a * keep
    B, G, R = c[..., 0], c[..., 1], c[..., 2]
    violet = np.clip(cv2.GaussianBlur(((a > 0.4) & (B - G > 25)).astype(np.float32), (0, 0), 2) * 2, 0, 1)
    a = a * (1 - roc * (1 - violet))
    # le halo blanc des morceaux (une lueur sur le vert) : gardé mais discret, sinon il fait un contour blanc sur la place sombre
    L = 0.11 * B + 0.59 * G + 0.3 * R; sat = (np.max(c, 2) - np.min(c, 2)) / np.maximum(np.max(c, 2), 1)
    lueur = np.clip((L - 130) / 70, 0, 1) * np.clip((0.65 - a) / 0.35, 0, 1) * np.clip(1 - sat * 2, 0, 1)
    a = a * (1 - 0.65 * lueur)
    if k == 0: a = pa.copy(); c = np.where(pa[..., None] > 0.01, pl[..., :3], c)   # la première image = exactement le cristal planté
    cv2.imwrite(f'{OUT}/img/f{n:03d}.png', emballer(c, a)); n += 1; dern = (c, a)
c, a = dern
for i in range(TIENT): cv2.imwrite(f'{OUT}/img/f{n:03d}.png', emballer(c, a)); n += 1
for i in range(EFF):
    t = (i + 1) / EFF; t = t * t * (3 - 2 * t)
    cv2.imwrite(f'{OUT}/img/f{n:03d}.png', emballer(c, a * (1 - t))); n += 1
print('images', n, '=', round(n / 24, 2), 's')
