# Prépare la salle du Pisteur (la peinture de Romain, de nuit, REDRESSÉE) pour l'essai 3D -> site/pisteur/
#   fond.jpg   : la peinture (origine/salle-pisteur/nuit2-droite.png), 4096 px de large (les téléphones) ;
#   prof.png   : même taille que fond.jpg. Rouge + vert : la profondeur des objets (16 bits, de D0 à D1 pas ; 0 = pas d'objet) ;
#                bleu : 255 là où l'on voit le sol (le jeu calcule lui-même sa profondeur). Le héros passe derrière
#                un objet au pixel près : la découpe de chaque objet vient de SAM (decouper.py -> origine/.../masques/) ;
#                chaque colonne de pixels d'un objet a la profondeur de son pied (le bas de la découpe dans cette colonne) ;
#   portes.png : le dessin des deux portes (pour les ouvrir : on les remplace par le noir du couloir) ;
#   salle.json : la caméra, les cases du sol (où l'on marche, les murets qu'on saute), le tour du sol et les emprises
#                des objets (pour les ombres : le héros fait de l'ombre sur le sol, les murs et les objets), les lumières,
#                les portes, le départ.
# À lancer depuis outils/salle-pisteur.
import cv2, numpy as np, json, base64, os
from camera import *
from boites import BOITES
from formes import FORMES, MUR_BAS, ESCALIER
import redresser as R
ORI = '../../origine/salle-pisteur/'; MAS = ORI + 'masques/'
OUT = '../../site/pisteur/'; os.makedirs(OUT, exist_ok=True)
N = cv2.imread(ORI + 'nuit2-droite.png'); assert N.shape[:2] == (H, W)
TW = 4096; TEX = TW / W; TH = round(H * TEX)
cv2.imwrite(OUT + 'fond.jpg', cv2.resize(N, (TW, TH), interpolation=cv2.INTER_AREA), [cv2.IMWRITE_JPEG_QUALITY, 86])

def remplir(m):
    """bouche les trous d'une découpe (pas pour les cages : on voit à travers les barreaux)"""
    f = m.astype(np.uint8) * 255; h, w = f.shape; p = np.zeros((h + 2, w + 2), np.uint8)
    g = f.copy(); cv2.floodFill(g, p, (0, 0), 255); return (f | (255 - g)) > 0
def charger(n):
    m = cv2.imread(MAS + n + '.png', 0) > 127
    if not n.startswith('cage'): m = remplir(cv2.morphologyEx(m.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8)) > 0)
    return m

# ---------- 1. les objets : profondeur (au pixel près) et emprise au sol ----------
D0, D1 = 30.0, 75.0
BIAIS = 0.5     # (un objet est écrit 0,5 pas plus loin que son pied : l'ombre du héros peut se poser dessus ; le mur du bas : 0)
DM = np.full((H, W), np.inf, np.float32)
D_MUR = DMAX - MUR_BAS['devant']
objets = []
for n, f in FORMES.items():
    m = charger(n); ys, xs = np.nonzero(m)
    if len(xs) == 0: print('découpe vide', n); continue
    if f.get('mur'):
        DM[m] = np.minimum(DM[m], D_MUR); continue
    u0, u1 = xs.min(), xs.max()
    vb = np.full(u1 - u0 + 1, -1); vt = np.full(u1 - u0 + 1, H)
    np.maximum.at(vb, xs - u0, ys); np.minimum.at(vt, xs - u0, ys)
    ok = vb >= 0
    vbl = vb.astype(np.float32); vbl[~ok] = np.nan
    # bas « lissé » : médiane sur 9 colonnes (les petits accrocs du bord ne comptent pas)
    pad = np.pad(vbl, 4, mode='edge')
    with np.errstate(all='ignore'): vbs = np.array([np.nanmedian(pad[i:i + 9]) for i in range(len(vbl))])
    # les colonnes « en l'air » (le haut d'un cristal plus large que le pilier, un rebord qui dépasse) : leur bas n'est pas
    # posé au sol ; elles prennent la profondeur des colonnes voisines qui, elles, touchent le sol
    hpx = ys.max() - ys.min(); vbz = np.where(np.isnan(vbs), -1, vbs)
    air = ~ok | (((vbz - vt) < 0.45 * hpx) & (vbz < ys.max() - 0.3 * hpx))
    if air.any() and (~air).any(): vbs = np.where(air, np.interp(np.arange(len(vbs)), np.nonzero(~air)[0], vbs[~air]), vbs)
    Dcol = D_sol(np.where(np.isnan(vbs), np.nanmax(vbs), vbs))
    DM[ys, xs] = np.minimum(DM[ys, xs], Dcol[xs - u0] + BIAIS)
    us = np.arange(u0, u1 + 1)
    # la hauteur : celle où le haut de la découpe retombe sur l'arrière de l'objet (son dessus se voit d'en haut)
    prof_obj = f.get('ep', 0.0) if 'dx' not in f else 0.0
    if f.get('rond'): prof_obj = 0.5 * (xs.max() - xs.min()) * D_sol(ys.max()) / F
    hcol = CH - (vt - CY) * (Dcol + prof_obj) / F
    sol_ok = ~air & (vt < H)
    hmax = float(np.percentile(hcol[sol_ok], 90)) if sol_ok.any() else float(np.nanmax(hcol))
    e = dict(nom=n, h=round(f.get('h', hmax), 2), muret=bool(f.get('muret')))
    if f.get('rond'):
        bas = ys > ys.max() - 0.25 * (ys.max() - ys.min()); a, b = xs[bas].min(), xs[bas].max()
        Dp = D_sol(np.nanmax(vbs)); xa = (a - CX) * Dp / F + XOFF; xb = (b - CX) * Dp / F + XOFF
        r = (xb - xa) / 2; e.update(rond=True, x=round((xa + xb) / 2, 3), y=round(DMAX - Dp - r, 3), r=round(r, 3))
    else:
        pas = 4; sel = [i for i in range(0, len(us), pas) if ok[i]] + ([len(us) - 1] if ok[-1] else [])
        av = [((us[i] - CX) * Dcol[i] / F + XOFF, DMAX - Dcol[i]) for i in sel]
        dx, dy = (f['dx'], 0.0) if 'dx' in f else (0.0, -f['ep'])
        poly = av + [(x + dx, y + dy) for x, y in reversed(av)]
        e['poly'] = [[round(x, 3), round(y, 3)] for x, y in poly]
    objets.append(e)
# le mur du bas : de l'extérieur du poteau à torche de gauche à celui de droite
mg, md = charger('devant_brasero_g'), charger('devant_brasero_d')
v_dos = img(15, MUR_BAS['dos'])[1]
xg = jeu(np.nonzero(mg.any(0))[0].min(), v_dos)[0]; xd = jeu(np.nonzero(md.any(0))[0].max(), v_dos)[0]
MUR = dict(x0=round(xg, 3), x1=round(xd, 3), y0=MUR_BAS['dos'], y1=MUR_BAS['devant'])
print('mur du bas : x', MUR['x0'], '->', MUR['x1'])

# ---------- 2. le sol : là où l'on voit le sol, son tour (en pas) ----------
S = (cv2.imread('/tmp/sp/sol_g.png', 0) > 127) | (cv2.imread('/tmp/sp/sol_d.png', 0) > 127)
cv2.imwrite(MAS + 'sol.png', S.astype(np.uint8) * 255) if os.path.exists('/tmp/sp/sol_g.png') else None
S = cv2.imread(MAS + 'sol.png', 0) > 127
S = cv2.morphologyEx(S.astype(np.uint8), cv2.MORPH_OPEN, np.ones((9, 9), np.uint8)) > 0
# le tapis et le médaillon (SAM ne les compte pas comme du sol) : on les ajoute
tapis = np.zeros((H, W), np.uint8)
cv2.fillPoly(tapis, [np.array([(2050, 729), (2302, 729), (2335, 1665), (2015, 1665)], np.int32)], 1)
cv2.ellipse(tapis, (2178, 1140), (221, 146), 0, 0, 360, 1, -1)
S |= tapis > 0
VU_SOL = S.copy()                                            # (pour la profondeur du sol vu)
# le sol caché derrière le mur du bas (ses poteaux et ses jardinières le cachent) : c'est encore du sol
for n, f in FORMES.items():
    if f.get('mur'): S |= charger(n)
# les objets du milieu de la salle (loin des murs) cachent aussi du sol : sans eux, les deux piliers d'un côté, l'un
# derrière l'autre, couperaient le sol en deux (un mur invisible du fond jusqu'au pilier de devant)
for n in ['pilier_av_g', 'pilier_av_d', 'pilier_fd_g', 'pilier_fd_d', 'pan_g', 'pan_d', 'tonneaux', 'chariot', 'caisse_fd',
          'caisse_av_g', 'caisse_av_d', 'muret_g', 'muret_d', 'gravats', 'gravats_d']:
    S |= charger(n)
# les fentes fines que SAM laisse dans le sol (une lueur, une ombre peinte) : on les referme, sinon ce seraient des murs invisibles
S = cv2.morphologyEx(S.astype(np.uint8), cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (61, 61))) > 0
S = remplir(S)                                               # (le sol caché sous les objets)
# on coupe devant : au dos du mur du bas entre les deux poteaux, plus loin dans les deux coins
S[int(img(15, MUR_BAS['coins'])[1]) + 1:] = False
S[:510] = False                                              # (au-dessus du pied du mur du fond : c'est le mur)
n_, lab, st, _ = cv2.connectedComponentsWithStats(S.astype(np.uint8)); S = lab == 1 + np.argmax(st[1:, 4])
cs, _ = cv2.findContours(S.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
c = max(cs, key=cv2.contourArea)[:, 0, :]
monde = np.array([jeu(u, v) for u, v in c], np.float32)
ap = cv2.approxPolyDP((monde * 100).astype(np.int32).reshape(-1, 1, 2), 7, True)[:, 0, :] / 100.0
TOUR = [[round(float(x), 3), round(float(y), 3)] for x, y in ap]
print('tour du sol :', len(TOUR), 'points ; x', round(float(ap[:, 0].min()), 2), '->', round(float(ap[:, 0].max()), 2), '; y', round(float(ap[:, 1].min()), 2), '->', round(float(ap[:, 1].max()), 2))

# ---------- 3. prof.png ----------
pr = cv2.erode(DM, np.ones((3, 3), np.uint8))                 # (le plus proche gagne : un objet ne rétrécit pas)
pr = cv2.resize(pr, (TW, TH), interpolation=cv2.INTER_NEAREST)
sv = cv2.resize(VU_SOL.astype(np.uint8), (TW, TH), interpolation=cv2.INTER_NEAREST)
fin = np.isfinite(pr); v = np.zeros(pr.shape, np.uint32); v[fin] = np.clip(np.round((pr[fin] - D0) / (D1 - D0) * 65534) + 1, 1, 65535)
prof = np.zeros((TH, TW, 3), np.uint8); prof[..., 2] = v >> 8; prof[..., 1] = v & 255; prof[..., 0] = sv * 255   # (OpenCV : BGR)
cv2.imwrite(OUT + 'prof.png', prof, [cv2.IMWRITE_PNG_COMPRESSION, 9])

# ---------- 4. les portes ----------
PM = cv2.imread(ORI + 'portes-masque-droite.png', 0)
PR = (1550, 60, 2800, 620)
cv2.imwrite(OUT + 'portes.png', cv2.resize(PM[PR[1]:PR[3], PR[0]:PR[2]], (625, 280), interpolation=cv2.INTER_AREA))
PORTES = []
for (a, b) in [(PR[0], 2175), (2175, PR[2])]:
    ys, xs = np.nonzero(PM[:, a:b] > 128); uc, vb, vh = a + xs.mean(), ys.max(), ys.min()
    x, y = jeu(uc, vb); Db = D_sol(vb)
    PORTES.append({'x': round(x, 3), 'y': round(y + 0.2, 3), 'u': float(uc), 'v': float(vb), 'haut': round(float(hauteur(vb, vh, Db)), 3), 'larg': round(float((xs.max() - xs.min()) * Db / F), 3)})
    print('porte : colonne', round(uc), 'bas', vb, 'haut', vh, '-> jeu', round(x, 2), round(y, 2))

# ---------- 5. les cases du sol (0,2 pas) ----------
PAS, X0G, NX, NY, RH = 0.2, -1.4, 174, 107, 0.3
def dedans(e, x, y, r):
    if e.get('rond'): return np.hypot(x - e['x'], y - e['y']) < e['r'] + r
    return cv2.pointPolygonTest(e['_p'], (x, y), True) > -r
for e in objets:
    if 'poly' in e: e['_p'] = np.array(e['poly'], np.float32)
murbas = dict(nom='mur_bas', _p=np.array([[MUR['x0'], MUR['y0']], [MUR['x1'], MUR['y0']], [MUR['x1'], MUR['y1']], [MUR['x0'], MUR['y1']]], np.float32), muret=False)
ex0, ey = jeu(ESCALIER['u0'], ESCALIER['v']); ex1 = jeu(ESCALIER['u1'], ESCALIER['v'])[0]
ESC = dict(x0=round(ex0, 3), x1=round(ex1, 3), y0=round(ey - 0.05, 3))
escalier = dict(nom='escalier', _p=np.array([[ex0, ey - 0.05], [ex1, ey - 0.05], [ex1, 30], [ex0, 30]], np.float32), muret=False)
print('escalier : x', ESC['x0'], '->', ESC['x1'], ', y >', ESC['y0'])
bloq = [e for e in objets if not e['muret']] + [murbas, escalier]
tour = np.array(TOUR, np.float32)
lib = np.zeros((NY, NX), np.uint8); mur = np.zeros((NY, NX), np.uint8)
for j in range(NY):
    for i in range(NX):
        x, y = X0G + (i + 0.5) * PAS, (j + 0.5) * PAS
        if cv2.pointPolygonTest(tour, (x, y), True) < RH * 0.6: continue      # (le bord du sol : on peut frôler les murs)
        if any(dedans(e, x, y, RH) for e in bloq): continue
        lib[j, i] = 1
        if any(dedans(e, x, y, RH) for e in objets if e['muret']): mur[j, i] = 1
def bits(a): return base64.b64encode(np.packbits(a.flatten())).decode()
print('cases libres', int(lib.sum()), 'dont murets', int(mur.sum()))

# ---------- 6. les lumières ----------
K = 1.25                      # (la salle est 1,25 fois plus grande qu'au premier essai : les hauteurs aussi)
def lum_vieille(u, v, z, coul, I, dist, ombre, nom, pied=True):
    """une lumière relevée sur l'ancienne peinture (avant redressement) : on la passe dans la nouvelle"""
    u2, v2 = R.point(u, v); x, y = jeu(u2, v2, 0 if pied else z * K)
    return dict(x=round(x, 3), y=round(y, 3), z=round(z * K, 3), coul=coul, I=I, dist=round(dist * K, 2), ombre=ombre, nom=nom)
LUM = []
for nom, coul in [('pilier_av_g', 0x4a9cff), ('pilier_av_d', 0x9a6cff), ('pilier_fd_g', 0x2fd8e6), ('pilier_fd_d', 0xa45cff)]:
    e = next(o for o in objets if o['nom'] == nom); m = charger(nom); ys, xs = np.nonzero(m)
    haut = ys < ys.min() + 0.13 * (ys.max() - ys.min())
    vc = float(ys[haut].mean()); Dp = D_sol(ys.max())
    LUM.append(dict(x=e['x'], y=e['y'], z=round(float(hauteur(ys.max(), vc, Dp)), 3), coul=coul, I=1, dist=14, ombre=True, nom=nom, type='cristal'))
for a in [(665, 1324, 1.35, 0x9fe8ff, 1, 5.5, False, 'fontaine_g'), (3627, 1313, 1.35, 0x9fe8ff, 1, 5.5, False, 'fontaine_d'),
          (1852, 1600, 0.55, 0xffa050, 0.5, 4, False, 'torchere_g'), (2472, 1600, 0.55, 0xffa050, 0.5, 4, False, 'torchere_d'),
          (940, 660, 1.7, 0xffb070, 0.6, 5, False, 'bougie_g'), (3356, 660, 1.7, 0xffb070, 0.6, 5, False, 'bougie_d'),
          (1942, 612, 2.0, 0x7fe0ff, 0.6, 5, False, 'applique_g'), (2376, 612, 2.0, 0x7fe0ff, 0.6, 5, False, 'applique_d')]:
    LUM.append(lum_vieille(*a))
for nom, cote in [('torche_g', 'devant_brasero_g'), ('torche_d', 'devant_brasero_d')]:   # (les deux grandes torches du mur du bas)
    m = charger(cote); ys, xs = np.nonzero(m); haut = ys < ys.min() + 60
    u, vf = xs[haut].mean(), ys[haut].mean(); Dm = D_MUR
    x = (u - CX) * Dm / F + XOFF; z = CH - (vf - CY) * Dm / F
    LUM.append(dict(x=round(x, 3), y=round(DMAX - Dm - 0.2, 3), z=round(z, 3), coul=0xff8a3a, I=1, dist=9, ombre=True, nom=nom))
for (u, v, z, coul, nom) in [(622, 553, 2.4, 0xa060ff, 'mur_g_violet_1'), (473, 839, 2.2, 0x3fe0c8, 'mur_g_vert'), (412, 1262, 2.0, 0xa060ff, 'mur_g_violet_2'),
        (3685, 553, 2.4, 0x7aa8ff, 'mur_d_bleu'), (3845, 839, 2.2, 0x3fe0c8, 'mur_d_vert'), (4115, 1433, 2.0, 0xa060ff, 'mur_d_violet')]:
    LUM.append(lum_vieille(u, v, z, coul, 0.8, 6, False, nom, pied=False))
for L in LUM: print('lumière', L['nom'], (L['x'], L['y'], L['z']))

# ---------- 7. salle.json ----------
mx, my = jeu(2178, 1140)
dx, dy = 15.4, 19.3
while not lib[int(dy / PAS), int((dx - X0G) / PAS)]: dy -= 0.2
J = {
  'image': [W, H], 'tex': TEX, 'f': F, 'cx': CX, 'cy': CY, 'phi': 0.0, 'camH': CH, 'xoff': XOFF, 'dmax': DMAX,
  'prof': {'d0': D0, 'd1': D1},
  'grille': {'pas': PAS, 'x0': X0G, 'nx': NX, 'ny': NY, 'libre': bits(lib), 'muret': bits(mur)},
  'tour': TOUR, 'murBas': MUR, 'escalier': ESC,
  'objets': [{k: v for k, v in e.items() if not k.startswith('_')} for e in objets],
  'lumieres': LUM, 'portes': PORTES, 'portesRect': list(PR),
  'mannequin': {'x': round(mx, 3), 'y': round(my, 3)}, 'depart': {'x': round(dx, 3), 'y': round(dy, 3)},
  'ambiance': 'nuit2-droite',
}
json.dump(J, open(OUT + 'salle.json', 'w'), separators=(',', ':'), default=float)
# un aperçu : les cases libres (vert), les murets (jaune), les emprises (rouge), le tour du sol (blanc), les lumières
V = N.copy()
for j in range(NY):
    for i in range(NX):
        if lib[j, i]:
            u, v = img(X0G + (i + 0.5) * PAS, (j + 0.5) * PAS); cv2.circle(V, (int(u), int(v)), 3, (0, 255, 255) if mur[j, i] else (0, 255, 0), -1)
def trace(poly, coul, ep=2):
    p = np.array([img(x, y) for x, y in poly], np.int32); cv2.polylines(V, [p], True, coul, ep)
trace(TOUR, (255, 255, 255), 3)
for e in objets:
    if e.get('rond'): trace([(e['x'] + e['r'] * np.cos(t), e['y'] + e['r'] * np.sin(t)) for t in np.linspace(0, 6.28, 24)], (0, 0, 255))
    else: trace(e['poly'], (0, 0, 255))
trace(murbas['_p'], (255, 0, 255))
for L in LUM:
    u, v = img(L['x'], L['y'], L['z']); cv2.circle(V, (int(u), int(v)), 14, (255, 255, 255), 3)
    u2, v2 = img(L['x'], L['y'], 0); cv2.line(V, (int(u), int(v)), (int(u2), int(v2)), (255, 255, 255), 1)
cv2.imwrite('/tmp/sp/apercu_cases.jpg', cv2.resize(V, (2192, 936)))
pv = np.where(np.isfinite(DM), (DM - D0) / (D1 - D0) * 255, 0).astype(np.uint8)
cv2.imwrite('/tmp/sp/apercu_prof.jpg', cv2.resize(cv2.applyColorMap(pv, cv2.COLORMAP_JET) * (pv > 0)[..., None], (2192, 936)))
print('ok')
