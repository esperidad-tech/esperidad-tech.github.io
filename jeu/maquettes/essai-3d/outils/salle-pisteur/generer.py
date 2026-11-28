# Prépare la salle du Pisteur (la peinture de Romain, de nuit, redressée) pour l'essai 3D -> site/pisteur/
# Tout part des TRACÉS FAITS À LA MAIN (trace.py) : aucun découpage automatique.
#   fond.jpg   : la peinture (origine/salle-pisteur/nuit2-droite.png), 4096 px de large ;
#   prof.png   : même taille. Rouge + vert : la profondeur de ce qui est peint (16 bits, de D0 à D1 pas ; 0 = rien) ;
#                bleu : 255 là où l'on voit le sol de la salle (le jeu calcule sa profondeur lui-même).
#                La profondeur d'un pixel d'objet = là où le rayon de la caméra touche la forme simple de l'objet
#                (boîte ou cylindre posé au sol, mesuré à la main) : la même forme sert aux obstacles et aux ombres ;
#   anim.png   : 2048 px de large. Rouge : les flammes (dessinées par-dessus le Pisteur, en transparence) ; vert : l'eau des fontaines ;
#   portes.png : le dessin des deux portes ;
#   salle.json : caméra, cases du sol, escalier, formes (obstacles et ombres), lumières, animations, portes, départ.
# À lancer depuis outils/salle-pisteur.
import cv2, numpy as np, json, base64, os
from matplotlib.path import Path
from camera import *
import trace as T
ORI = '../../origine/salle-pisteur/'
OUT = '../../site/pisteur/'; os.makedirs(OUT, exist_ok=True)
N = cv2.imread(ORI + 'nuit2-droite.png'); assert N.shape[:2] == (H, W)
TW = 4096; TEX = TW / W; TH = round(H * TEX)
cv2.imwrite(OUT + 'fond.jpg', cv2.resize(N, (TW, TH), interpolation=cv2.INTER_AREA), [cv2.IMWRITE_JPEG_QUALITY, 86])
D0, D1, BIAIS = 30.0, 75.0, 0.15

def masque(pts):
    m = np.zeros((H, W), np.uint8); cv2.fillPoly(m, [np.round(np.array(pts)).astype(np.int32)], 1); return m > 0
def boite_img(u0, u1, v, ep):
    D = D_sol(v); return ((u0 - CX) * D / F + XOFF, (u1 - CX) * D / F + XOFF, DMAX - D - ep, DMAX - D)

# ---------- 1. les formes simples des objets (en pas du jeu) ----------
FORMES = []          # {nom, boites:[(x0,x1,y0,y1)], rond:(x,y,r) | None, h, muret, contour}
for n, o in T.OBJETS.items():
    b, rond = [], None
    if 'rond_img' in o:
        u, v, hw = o['rond_img']; D = D_sol(v); r = hw * D / F
        rond = ((u - CX) * D / F + XOFF, DMAX - D - r, r)
    if 'boite_img' in o: b.append(boite_img(*o['boite_img']))
    for bi in o.get('boites_img', []): b.append(boite_img(*bi))
    if 'boite' in o: b.append(tuple(o['boite']))
    b += [tuple(x) for x in o.get('boites', [])]
    p = np.array(o['contour']); vtop = p[:, 1].min()
    # la hauteur : du pied avant jusqu'au haut du contour, à la profondeur du pied
    vpied = o['rond_img'][1] if rond else max(bi[2] for bi in o.get('boites_img', [o.get('boite_img', (0, 0, p[:, 1].max(), 0))]))
    h = o.get('h', (vpied - vtop) * D_sol(vpied) / F)
    FORMES.append(dict(nom=n, boites=b, rond=rond, h=round(float(h), 3), muret=bool(o.get('muret')), contour=o['contour']))

# ---------- 2. la profondeur de chaque pixel peint ----------
def rayon_touche(e, us, vs):
    """profondeur D où le rayon des pixels (us, vs) entre dans la forme de l'objet (inf : il la manque)"""
    a = (us - CX) / F; c = (vs - CY) / F          # X = a D ; z = CH - c D
    best = np.full(len(us), np.inf)
    zmin, zmax = (CH - e['h']) / c, CH / c          # D où le rayon est à la hauteur h, puis au sol
    for (x0, x1, y0, y1) in e['boites']:
        X0, X1 = x0 - XOFF, x1 - XOFF; Dn, Df = DMAX - y1, DMAX - y0
        with np.errstate(divide='ignore', invalid='ignore'):
            t0 = np.where(a != 0, np.minimum(X0 / a, X1 / a), np.where((X0 <= 0) & (0 <= X1), -np.inf, np.inf))
            t1 = np.where(a != 0, np.maximum(X0 / a, X1 / a), np.where((X0 <= 0) & (0 <= X1), np.inf, -np.inf))
        ent = np.maximum.reduce([t0, np.full_like(t0, Dn), zmin]); sor = np.minimum.reduce([t1, np.full_like(t1, Df), zmax])
        best = np.where((ent <= sor) & (ent < best), ent, best)
    if e['rond']:
        xc, yc, r = e['rond']; Xc, Dc = xc - XOFF, DMAX - yc
        A = a * a + 1; B = -2 * (a * Xc + Dc); C = Xc * Xc + Dc * Dc - r * r; disc = B * B - 4 * A * C
        with np.errstate(invalid='ignore'):
            tc = np.where(disc >= 0, (-B - np.sqrt(np.maximum(disc, 0))) / (2 * A), np.inf)
        tc = np.where(tc < zmin, np.where((disc >= 0) & (zmin <= (-B + np.sqrt(np.maximum(disc, 0))) / (2 * A)), zmin, np.inf), tc)  # (le dessus)
        tc = np.where(tc > zmax, np.inf, tc)
        best = np.minimum(best, tc)
    return best
def D_avant(e):
    Ds = [DMAX - y1 for (_, _, _, y1) in e['boites']] + ([DMAX - e['rond'][1] - e['rond'][2]] if e['rond'] else [])
    return min(Ds)

DM = np.full((H, W), np.inf, np.float32)
for e in FORMES:
    m = masque(e['contour']); vs, us = np.nonzero(m)
    D = rayon_touche(e, us.astype(float), vs.astype(float))
    D = np.where(np.isfinite(D), D, D_avant(e))               # (un bord du contour qui dépasse la forme : la profondeur de son devant)
    DM[vs, us] = np.minimum(DM[vs, us], D + BIAIS)
    e['_m'] = m
D_MUR = DMAX - T.MUR_Y[1]                                    # (le devant du mur du bas)
MURM = np.zeros((H, W), bool)
for n, pts in T.MUR.items():
    m = masque(pts); MURM |= m; DM[m] = np.minimum(DM[m], D_MUR)

# ---------- 3. le sol de la salle (rectangle + coins des baignoires), les obstacles ----------
S = T.SALLE; E = S['escalier']; Cn = S['coins']
obst = []                                                    # (nom, chemin au sol, muret)
for e in FORMES:
    for (x0, x1, y0, y1) in e['boites']: obst.append((e['nom'], np.float32([(x0, y0), (x1, y0), (x1, y1), (x0, y1)]), e['muret']))
    if e['rond']:
        xc, yc, r = e['rond']; t = np.linspace(0, 2 * np.pi, 33)[:-1]
        obst.append((e['nom'], np.float32(np.stack([xc + r * np.cos(t), yc + r * np.sin(t)], 1)), e['muret']))
for n, (x0, x1, y0, y1) in T.CONTRE_MUR.items(): obst.append((n, np.float32([(x0, y0), (x1, y0), (x1, y1), (x0, y1)]), False))
for (x0, x1) in T.MUR_X: obst.append(('mur_bas', np.float32([(x0, T.MUR_Y[0]), (x1, T.MUR_Y[0]), (x1, T.MUR_Y[1]), (x0, T.MUR_Y[1])]), False))
def dans_salle(x, y):
    if S['x0'] <= x <= S['x1'] and S['y0'] <= y <= S['y1']: return True
    if (x < Cn['g'] or x > Cn['d']) and S['x0'] <= x <= S['x1'] and y <= Cn['y1']: return True
    return E['x0'] <= x <= E['x1'] and E['haut'] - 0.1 <= y <= E['y_max']
PAS, X0G, NX, NY, RH = 0.2, -2.0, 180, 106, 0.3
lib = np.zeros((NY, NX), np.uint8); mur = np.zeros((NY, NX), np.uint8)
for j in range(NY):
    for i in range(NX):
        x, y = X0G + (i + 0.5) * PAS, (j + 0.5) * PAS
        # (marge du héros : 0,3 pas contre les murs de la salle et les bords de l'escalier)
        if not all(dans_salle(x + dx, y + dy) for dx, dy in [(RH, 0), (-RH, 0), (0, RH * 0.5), (0, -RH)]): continue
        pres = [(o, m) for (n_, o, m) in obst if cv2.pointPolygonTest(o, (x, y), True) > -RH]
        if any(not m for (o, m) in pres): continue
        lib[j, i] = 1
        if pres: mur[j, i] = 1
def bits(a): return base64.b64encode(np.packbits(a.flatten())).decode()
print('cases libres', int(lib.sum()), 'dont murets', int(mur.sum()))

# ---------- 4. prof.png (et le sol vu : ce qui, ramené au sol, tombe dans la salle hors des emprises) ----------
vv, uu = np.mgrid[0:H, 0:W].astype(np.float32)
with np.errstate(divide='ignore'): Ds = np.where(vv > CY + 1, CH * F / (vv - CY), np.inf)
xs, ys = (uu - CX) * Ds / F + XOFF, DMAX - Ds
sol = (xs >= S['x0']) & (xs <= S['x1']) & (ys >= S['y0']) & ((ys <= S['y1']) | (((xs < Cn['g']) | (xs > Cn['d'])) & (ys <= Cn['y1'])))
pts = np.stack([xs[sol], ys[sol]], 1); dedans = np.zeros(len(pts), bool)
for (n_, o, m) in obst:
    if not m: dedans |= Path(o).contains_points(pts)
sol[sol] = ~dedans
pr = cv2.erode(DM, np.ones((2, 2), np.uint8))
pr = cv2.resize(pr, (TW, TH), interpolation=cv2.INTER_NEAREST)
sv = cv2.resize(sol.astype(np.uint8), (TW, TH), interpolation=cv2.INTER_NEAREST)
fin = np.isfinite(pr); v = np.zeros(pr.shape, np.uint32); v[fin] = np.clip(np.round((pr[fin] - D0) / (D1 - D0) * 65534) + 1, 1, 65535)
prof = np.zeros((TH, TW, 3), np.uint8); prof[..., 2] = v >> 8; prof[..., 1] = v & 255; prof[..., 0] = sv * 255
cv2.imwrite(OUT + 'prof.png', prof, [cv2.IMWRITE_PNG_COMPRESSION, 9])

# ---------- 5. anim.png : les flammes (rouge, bords adoucis) et l'eau des fontaines (vert) ----------
AW = 2048; AH = round(H * AW / W); k = AW / W
anim = np.zeros((AH, AW, 3), np.uint8)
fl = np.zeros((AH, AW), np.uint8)
for n, pts in T.FLAMMES.items(): cv2.fillPoly(fl, [np.round(np.array(pts) * k).astype(np.int32)], 255)
anim[..., 2] = cv2.GaussianBlur(fl, (0, 0), 1.5)
ea = np.zeros((AH, AW), np.uint8)
for (u, v, a, b) in T.EAUX: cv2.ellipse(ea, (int(u * k), int(v * k)), (int(a * k), int(b * k)), 0, 0, 360, 255, -1)
anim[..., 1] = cv2.GaussianBlur(ea, (0, 0), 2.5)
cv2.imwrite(OUT + 'anim.png', anim)

# ---------- 6. les portes ----------
PM = cv2.imread(ORI + 'portes-masque-droite.png', 0)
PR = (1550, 60, 2800, 620)
cv2.imwrite(OUT + 'portes.png', cv2.resize(PM[PR[1]:PR[3], PR[0]:PR[2]], (625, 280), interpolation=cv2.INTER_AREA))
PORTES = []
for (a, b) in [(PR[0], 2175), (2175, PR[2])]:
    yy, xx = np.nonzero(PM[:, a:b] > 128); uc, vb, vh = a + xx.mean(), yy.max(), yy.min()
    x, y = jeu(uc, vb); Db = D_sol(vb)
    PORTES.append({'x': round(x, 3), 'y': round(y + 0.2, 3), 'u': float(uc), 'v': float(vb), 'haut': round(float(hauteur(vb, vh, Db)), 3), 'larg': round(float((xx.max() - xx.min()) * Db / F), 3)})

# ---------- 7. les lumières ----------
import redresser as R
K = 1.25
def lum_vieille(u, v, z, coul, I, dist, ombre, nom, pied=True):
    u2, v2 = R.point(u, v); x, y = jeu(u2, v2, 0 if pied else z * K)
    return dict(x=round(x, 3), y=round(y, 3), z=round(z * K, 3), coul=coul, I=I, dist=round(dist * K, 2), ombre=ombre, nom=nom)
LUM = []
for (u, v, r, coul), nom in zip(T.CRISTAUX[:4], ['pilier_av_g', 'pilier_fd_g', 'pilier_av_d', 'pilier_fd_d']):
    e = next(f for f in FORMES if f['nom'] == nom); xc, yc, rr = e['rond']; Dc = DMAX - yc
    LUM.append(dict(x=round(xc, 3), y=round(yc, 3), z=round(CH - (v - CY) * Dc / F, 3), coul=coul, I=1, dist=14, ombre=True, nom=nom, type='cristal'))
for a in [(665, 1324, 1.35, 0x9fe8ff, 1, 5.5, False, 'fontaine_g'), (3627, 1313, 1.35, 0x9fe8ff, 1, 5.5, False, 'fontaine_d'),
          (940, 660, 1.7, 0xffb070, 0.6, 5, False, 'bougie_g'), (3356, 660, 1.7, 0xffb070, 0.6, 5, False, 'bougie_d'),
          (1942, 612, 2.0, 0x7fe0ff, 0.6, 5, False, 'applique_g'), (2376, 612, 2.0, 0x7fe0ff, 0.6, 5, False, 'applique_d')]:
    LUM.append(lum_vieille(*a))
FL = []
for n, pts in T.FLAMMES.items():
    p = np.array(pts); u, vf = p[:, 0].mean(), p[:, 1].mean(); Dm = D_MUR
    x = (u - CX) * Dm / F + XOFF; z = CH - (vf - CY) * Dm / F
    FL.append(dict(nom=n, u=float(u), v=float(vf), r=float(max(np.ptp(p[:, 0]), np.ptp(p[:, 1])) / 2), x=round(x, 3), y=round(DMAX - Dm - 0.1, 3), z=round(z, 3)))
    grand = n in ('flamme_g', 'flamme_d')
    LUM.append(dict(x=round(x, 3), y=round(DMAX - Dm - 0.3, 3), z=round(z, 3), coul=0xff8a3a, I=1 if grand else 0.6, dist=9 if grand else 5,
                    ombre=grand, nom='torche' + n[6:], type='feu'))
for (u, v, z, coul, nom) in [(622, 553, 2.4, 0xa060ff, 'mur_g_violet_1'), (473, 839, 2.2, 0x3fe0c8, 'mur_g_vert'), (412, 1262, 2.0, 0xa060ff, 'mur_g_violet_2'),
        (3685, 553, 2.4, 0x7aa8ff, 'mur_d_bleu'), (3845, 839, 2.2, 0x3fe0c8, 'mur_d_vert'), (4115, 1433, 2.0, 0xa060ff, 'mur_d_violet')]:
    LUM.append(lum_vieille(u, v, z, coul, 0.8, 6, False, nom, pied=False))
CR = []
for (u, v, r, coul), nom in zip(T.CRISTAUX, ['pilier_av_g', 'pilier_fd_g', 'pilier_av_d', 'pilier_fd_d', 'fontaine_g', 'fontaine_d']):
    e = next(f for f in FORMES if f['nom'] == nom); xc, yc, rr = e['rond']; Dc = DMAX - yc
    CR.append(dict(u=u, v=v, r=r, coul=coul, x=round(xc, 3), y=round(yc, 3), z=round(CH - (v - CY) * Dc / F, 3), larg=round(r * Dc / F, 3)))

# ---------- 8. salle.json ----------
mx, my = jeu(2178, 1140)
dx, dy = 15.4, 18.6
while not lib[int(dy / PAS), int((dx - X0G) / PAS)]: dy -= 0.2
J = {
  'image': [W, H], 'tex': TEX, 'f': F, 'cx': CX, 'cy': CY, 'phi': 0.0, 'camH': CH, 'xoff': XOFF, 'dmax': DMAX,
  'prof': {'d0': D0, 'd1': D1},
  'grille': {'pas': PAS, 'x0': X0G, 'nx': NX, 'ny': NY, 'libre': bits(lib), 'muret': bits(mur)},
  'salle': {k_: v_ for k_, v_ in S.items()},
  'formes': [{'nom': e['nom'], 'boites': [[round(c, 3) for c in b] for b in e['boites']], 'rond': [round(c, 3) for c in e['rond']] if e['rond'] else None,
              'h': e['h'], 'muret': e['muret']} for e in FORMES],
  'contreMur': {n: list(b) for n, b in T.CONTRE_MUR.items()},
  'murBas': {'y0': T.MUR_Y[0], 'y1': T.MUR_Y[1], 'x': T.MUR_X},
  'lumieres': LUM, 'flammes': FL, 'cristaux': CR, 'eaux': [list(e) for e in T.EAUX],
  'portes': PORTES, 'portesRect': list(PR),
  'mannequin': {'x': round(mx, 3), 'y': round(my, 3)}, 'depart': {'x': round(dx, 3), 'y': round(dy, 3)},
  'ambiance': 'nuit2-droite',
}
json.dump(J, open(OUT + 'salle.json', 'w'), separators=(',', ':'), default=float)

# ---------- 9. aperçus ----------
V = N.copy()
for j in range(NY):
    for i in range(NX):
        if lib[j, i]:
            u, v = img(X0G + (i + 0.5) * PAS, (j + 0.5) * PAS); cv2.circle(V, (int(u), int(v)), 3, (0, 255, 255) if mur[j, i] else (0, 255, 0), -1)
for (n_, o, m) in obst:
    p = np.array([img(x, y) for x, y in o], np.int32); cv2.polylines(V, [p], True, (0, 0, 255), 2)
for e in FORMES: cv2.polylines(V, [np.round(np.array(e['contour'])).astype(np.int32)], True, (255, 128, 0), 2)
cv2.imwrite('/tmp/sp/apercu_cases.jpg', cv2.resize(V, (2192, 936)))
pv = np.where(np.isfinite(DM), (DM - D0) / (D1 - D0) * 255, 0).astype(np.uint8)
cv2.imwrite('/tmp/sp/apercu_prof.jpg', cv2.resize(cv2.applyColorMap(pv, cv2.COLORMAP_JET) * (pv > 0)[..., None] + (sol[..., None] * np.array([60, 20, 0], np.uint8)), (2192, 936)))
print('ok : formes', len(FORMES), 'lumières', len(LUM), 'flammes', len(FL))
