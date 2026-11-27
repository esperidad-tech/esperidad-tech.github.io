# La caméra de la peinture de Romain (place de nuit) : un appareil photo penché, calé sur les lignes du sol
import numpy as np
from scipy.optimize import fsolve
W, H = 4384, 1872
F, CX, CY = 3535.0, 2110.0, 936.0
PHI = np.arctan2(CY - (-80.0), F)          # (l'horizon du sol vers la ligne -80 de l'image)
s, c = np.sin(PHI), np.cos(PHI)
HAUT = 1.55                                 # le héros
# le Barde peint : pieds ligne 1134, haut ligne 987 -> hauteur et distance de la caméra
def eq(p):
    D, CH = p
    return [(CY - 1134) * (D * c + CH * s) - F * (D * s - CH * c),
            (CY - 987) * (D * c - (HAUT - CH) * s) - F * (D * s + (HAUT - CH) * c)]
D0, CH = fsolve(eq, [35, 10])
def sol(u, v, z=0.0):
    """un point de l'image -> (X, D) sur le plan de hauteur z (X : à droite de l'axe, D : distance devant la caméra)"""
    Zr = z - CH; k = CY - v
    D = Zr * (F * c + k * s) / (k * c - F * s)
    zc = D * c - Zr * s
    return (u - CX) * zc / F, D
def proj(X, D, z=0.0):
    Zr = z - CH; zc = D * c - Zr * s; yu = D * s + Zr * c
    return CX + F * X / zc, CY - F * yu / zc
if __name__ == '__main__':
    print('pente', np.degrees(PHI), 'hauteur caméra', CH, 'distance du Barde peint', D0)
    for (u, v) in [(1290, 975), (3090, 975), (735, 1800), (3760, 1800), (2196, 1134)]:
        print((u, v), np.round(sol(u, v), 2))
