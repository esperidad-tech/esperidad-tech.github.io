# Redresse la peinture de la salle du Pisteur : dans l'image de Higgsfield, les verticales
# (portes, poteaux du mur du bas, murs cassés) se rejoignent vers un point loin sous l'image
# (comme une photo prise en penchant l'appareil vers le bas). On « remet l'appareil droit » :
# une transformation projective qui envoie ce point à l'infini. Les lignes droites restent droites,
# les verticales deviennent verticales. Le bas de l'image garde sa taille, le haut rétrécit un peu.
# Usage : python3 redresser.py entree.png sortie.png
import cv2, numpy as np, sys
W, H = 4384, 1872
XV, YV = 2267.0, 9056.0           # point où se rejoignent les verticales (mesuré sur 17 objets)
S = 1 - H / YV                    # le bas de l'image garde sa largeur
M = np.array([[S, -XV / YV, XV * (1 - S)], [0, S, 0], [0, -1 / YV, 1]])
def point(x, y):
    p = M @ np.array([x, y, 1.0]); return p[0] / p[2], p[1] / p[2]
if __name__ == '__main__':
    a = cv2.imread(sys.argv[1], cv2.IMREAD_UNCHANGED)
    interp = cv2.INTER_NEAREST if a.ndim == 2 else cv2.INTER_LANCZOS4
    # les coins du haut découverts prennent la couleur du fond de la peinture (le noir bleuté des coins)
    fond = 0 if a.ndim == 2 else tuple(float(c) for c in np.median(np.concatenate([a[:60, :200].reshape(-1, a.shape[2]), a[:60, -200:].reshape(-1, a.shape[2])]), 0))
    b = cv2.warpPerspective(a, M, (W, H), flags=interp, borderMode=cv2.BORDER_CONSTANT, borderValue=fond)
    cv2.imwrite(sys.argv[2], b)
