# La caméra du temple de Romain (image debout 2160 × 3840, job 769703f7) — 28 novembre après-midi
# 1) Le point de fuite des lignes du dallage qui s'enfoncent : 122 traits trouvés sur l'image large (où l'on voit les deux bords du
#    parvis), RANSAC puis moindres carrés : (939,4 ; 263,8) en pixels de l'image debout. Il est sur l'horizon.
# 2) Les dalles suivent une grille : colonnes tous les 0,0712 en (u - u_pf) / (v - v_h) ; rangées tous les 1,17e-5 en 1 / (v - v_h)
#    (vérifié en superposant la grille sur la peinture : salle2/hyp-zoom.jpg). Si les cases de la grille sont carrées :
#    sin(pente) = (cy - v_h) × pas des rangées / pas des colonnes.
# 3) La hauteur de la caméra fixe l'échelle : le Barde (1,5 m) posé en (1080, 3150) mesure ~460 px (12 % de l'image), comme dans le jeu.
import numpy as np
from scipy.optimize import least_squares
W, H = 2160, 3840; CX, CY = W / 2, H / 2
UPF, VH = 939.4, 263.8
DC, DR = 0.0712, 1.17e-5
K = CY - VH
phi0 = np.arcsin(K * DR / DC); F = K / np.tan(phi0)
def R(phi, psi):   # caméra three.js : rotation 'YXZ' (lacet psi, puis tangage -phi) ; elle regarde vers -z
    cy, sy, cp, sp = np.cos(psi), np.sin(psi), np.cos(-phi), np.sin(-phi)
    Ry = np.array([[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]]); Rx = np.array([[1, 0, 0], [0, cp, -sp], [0, sp, cp]])
    return Ry @ Rx
def proj(Rm, d):   # direction du monde -> pixel
    c = Rm.T @ d; return np.array([CX + F * c[0] / -c[2], CY - F * c[1] / -c[2]])
def res(p):
    return proj(R(p[0], p[1]), np.array([0, 0, -1.0])) - [UPF, VH]
s = least_squares(res, [phi0, 0.0]); phi, psi = s.x
print(f'F {F:.0f} px  pente {np.degrees(phi):.2f}°  lacet {np.degrees(psi):.2f}°  champ vertical {2*np.degrees(np.arctan(CY/F)):.1f}°  reste {s.fun.round(3)}')
HC = 9.0
def sol(u, v, h=0.0):
    d = R(phi, psi) @ np.array([(u - CX) / F, -(v - CY) / F, -1.0]); k = (h - HC) / d[1]; return np.array([0, HC, 0]) + d * k
def img(P):
    c = R(phi, psi).T @ (np.asarray(P) - [0, HC, 0]); return np.array([CX + F * c[0] / -c[2], CY - F * c[1] / -c[2]])
B = sol(1080, 3150); print('Barde', B.round(2), ' 1,5 m ->', round(img(B)[1] - img(B + [0, 1.5, 0])[1]), 'px')
for v in (2150, 2255, 2661, 3150, 3600): print('ligne', v, 'sol', sol(1080, v).round(2))
# l'escalier : bas à 1950, haut à 1540 ; pente des marches 0,6 (≈ 31°) ; la porte au pied à 1400
Zb = sol(1080, 1950)
def haut(Hh): P = Zb + np.array([0, Hh, -Hh / 0.6]); return img(P)[1] - 1540
Hh = least_squares(lambda x: [haut(x[0])], [2.0]).x[0]; Ptop = Zb + np.array([0, Hh, -Hh / 0.6])
porte = sol(1075, 1400, Hh)
print(f'escalier : hauteur {Hh:.2f} m ; haut {Ptop.round(2)} ; pied de la porte {porte.round(2)} ; palier {abs(porte[2]-Ptop[2]):.2f} m de profondeur')
# Grosbec (3,6 m) sur le palier, 1,3 m devant la porte ; les quatre portails (les portes et les chutes du jeu en 2D, ramenées aux pas
# des golems 3D : un rôdeur fait 0,29 m par temps, un colosse 0,43 m tous les deux temps ; à ~10 pas du Barde, comme dans le jeu)
G = porte + [0, 0, 1.3]; print('Grosbec pieds', G.round(2), 'px', img(G).round(), 'tête', img(G + [0, 3.6, 0]).round())
for nom, dx, dz in (('fond gauche', -2.4, -4.5), ('fond droite', 2.4, -4.5), ('côté gauche', -2.7, -2.4), ('côté droite', 2.7, -2.4)):
    P = B + [dx, 0, dz]; print(nom, P.round(2), 'px sol', img(P).round(), 'haut 2,4 m', img(P + [0, 2.4, 0]).round())
