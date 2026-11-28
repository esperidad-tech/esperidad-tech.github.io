# La caméra de la salle du Barde (parvis, 1520 × 2688) : un appareil penché, calé sur le losange et les rangées de dalles
import numpy as np
from scipy.optimize import least_squares
W, H = 1520, 2688; CX, CY = W / 2, H / 2
def D(v, f, phi, h=1.0):          # distance au sol (devant le pied de la caméra) d'un point du sol vu à la ligne v
    a = phi + np.arctan((v - CY) / f); return h / np.tan(a)
def z(v, f, phi, h=1.0):          # profondeur dans l'axe de la caméra
    a = np.arctan((v - CY) / f); d = D(v, f, phi, h); return np.hypot(d, h) * np.cos(a)
rangs = np.array([1545, 1630, 1720, 1805, 1910, 2025.])
def res(p):
    f, phi = p; L = D(1588, f, phi) - D(2055, f, phi)
    r = [(D(1588, f, phi) + D(2055, f, phi)) / 2 - D(1801, f, phi),            # le milieu du losange
         f * L / z(1801, f, phi) / 730 - 1]                                      # sa largeur = sa profondeur
    dd = -np.diff(D(rangs, f, phi)); r += list(dd / dd.mean() - 1)               # des rangées de dalles régulières
    r.append((z(2400, f, phi) / z(1330, f, phi)) / (1010 / 1210) - 1)            # le parvis, ses bords parallèles
    return r
best = None
for f0 in (1500, 2500, 4000, 6000):
    for p0 in (0.4, 0.7, 1.0):
        s = least_squares(res, [f0, p0], bounds=([600, 0.05], [20000, 1.5]))
        if best is None or s.cost < best.cost: best = s
f, phi = best.x
print('f', round(f), 'pente', round(np.degrees(phi), 1), 'erreur', np.round(best.fun, 3))
print('champ vertical', round(np.degrees(2 * np.arctan(CY / f)), 1), 'horizon', round(CY - f * np.tan(phi)))
for v in (1330, 1588, 1801, 2055, 2400, 2600): print(v, 'distance', round(D(v, f, phi), 3), 'profondeur', round(z(v, f, phi), 3))
