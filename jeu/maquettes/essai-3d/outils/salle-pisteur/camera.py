# La caméra de la salle du Pisteur peinte par Romain (Higgsfield, 28 novembre), retouchée par Claude.
# Peinture REDRESSÉE (redresser.py, 28 novembre au matin) : les verticales sont vraiment verticales
# (avant, elles se rejoignaient sous l'image, d'où l'effet « bombé » que Romain voyait).
# Une caméra HORIZONTALE décentrée vers le bas : les verticales restent verticales, le sol fuit vers un point au-dessus.
#  - le point de fuite des lignes du sol : (2215, -1786) (bords du tapis, passés par le redressement) ;
#  - F (la focale, en pixels) : d'après le médaillon rond du sol (437 px de large, 287 de haut, ligne 1140) ;
#  - CH (la hauteur de la caméra, en pas) : 31 pas. Le héros est 20 % plus petit qu'au premier essai (demande de Romain) :
#    la salle fait environ 31 × 17,5 pas (au lieu de 25 × 14).
#    (Avant le redressement : F 7467, point de fuite (2180, -2996), CH 33, XOFF 12,7, DMAX 68,8.)
W, H = 4384, 1872
F, CX, CY, CH = 4452.0, 2215.1, -1785.9, 31.0
XOFF, DMAX = 15.9, 60.3          # x du jeu = X + XOFF ; y du jeu = DMAX - D (le fond de la salle vers y = 0,5, nous vers y = 18)

def D_sol(v, z=0.0):
    """la distance (devant la caméra) d'un point de la ligne v de la peinture, à la hauteur z"""
    return (CH - z) * F / (v - CY)

def sol(u, v, z=0.0):
    """un point de la peinture (pixels) -> (X, D) sur le plan de hauteur z"""
    D = D_sol(v, z)
    return (u - CX) * D / F, D

def jeu(u, v, z=0.0):
    X, D = sol(u, v, z)
    return X + XOFF, DMAX - D

def proj(X, D, z=0.0):
    return CX + F * X / D, CY + F * (CH - z) / D

def img(x, y, z=0.0):
    return proj(x - XOFF, DMAX - y, z)

def hauteur(v_pied, v_haut, D):
    """la hauteur d'un point dessiné à la ligne v_haut, au-dessus d'un pied posé à la ligne v_pied"""
    return (v_pied - v_haut) * D / F

if __name__ == '__main__':
    import redresser as R
    for nom, (u, v) in {'pilier avant gauche': (1318, 1478), 'pilier avant droit': (2962, 1478), 'pilier fond gauche': (1355, 925),
                        'pilier fond droit': (2965, 925), 'médaillon': (2170, 1238), 'fond (seuil des portes)': (2180, 612)}.items():
        u, v = R.point(u, v)   # (relevés sur la peinture d'avant le redressement)
        X, D = sol(u, v); print(f'{nom:26s} X {X:6.2f}  D {D:6.2f}  jeu ({X + XOFF:5.2f}, {DMAX - D:5.2f})')
