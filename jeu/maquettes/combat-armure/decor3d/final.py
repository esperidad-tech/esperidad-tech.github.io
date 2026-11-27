# Les rendus finis : le fond (portes fermées), les deux portes ouvertes, les deux lanternes à part, les six rochers à part.
# python3 final.py [échelle] [échantillons] [quoi…]   quoi : fond portes obs rocs (tout par défaut)
# (D'après le combat du Pisteur, decor3d/final.py.)
import os, sys, time, json
ICI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ICI)
import bpy
import numpy as np
from PIL import Image
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector
import base as B, salle as S, rendu as Rd, post

ech = float(sys.argv[1]) if len(sys.argv) > 1 else 1.0; n = int(sys.argv[2]) if len(sys.argv) > 2 else 96
quoi = sys.argv[3:] or ['fond', 'portes', 'obs', 'rocs']
D = os.path.join(ICI, 'out', 'final', '') if ech >= 0.99 else os.path.join(ICI, 'out', 'essai_final', '')
os.makedirs(D, exist_ok=True)
T0 = time.time()
def log(*a): print('[%5.0f s]' % (time.time() - T0), *a, flush=True)

sc = S.construire(); Rd.reglages(sc, ech, n, 0.025 if ech >= 0.99 else 0.06)
r = sc.render; cam = sc.camera
OBS = {i: list(B.COLS['obs_%02d' % i].objects) for i in range(2)}
ROC = {i: list(B.COLS['roc_%d' % i].objects) for i in range(S.ROCS)}
TOUS = [o for o in bpy.data.objects if o.type == 'MESH']
CACHES = [o for L in OBS.values() for o in L] + [o for L in ROC.values() for o in L]
def voir(seulement=None, sans=()):
    for o in TOUS: o.visible_camera = (seulement is None or o in seulement) and o not in sans
def bord(x0, x1, y0, y1):
    r.use_border = True; r.use_crop_to_border = False
    r.border_min_x, r.border_max_x, r.border_min_y, r.border_max_y = max(0, x0), min(1, x1), max(0, y0), min(1, y1)
def rendre(nom):
    r.filepath = D + nom + '.png'; t = time.time(); bpy.ops.render.render(write_still=True); Rd.passes_aide(sc, D + nom); log(nom, 'rendu en %.0f s' % (time.time() - t))
def vue(p):   # un point du jeu → (x, y) de la caméra, de 0 à 1 (y vers le haut)
    q = world_to_camera_view(sc, cam, S.W(*p)); return q.x, q.y
def cadre_objets(objs, marge=9):
    pts = [world_to_camera_view(sc, cam, ob.matrix_world @ Vector(c)) for ob in objs for c in ob.bound_box]
    m = marge / float(B.SW)
    bord(min(p.x for p in pts) - m, max(p.x for p in pts) + m, min(p.y for p in pts) - m * B.SW / B.SH, max(p.y for p in pts) + m * B.SW / B.SH)

W, H = int(r.resolution_x * ech), int(r.resolution_y * ech); k = W / float(B.SW)
info = {'k': k, 'W': W, 'H': H, 'obs': [], 'rocs': [], 'portes': []}
bpy.context.view_layer.update()

def detourer(nom, i, ancre=None):
    post.finir(D + nom + '_brut', D + nom + '_plein.png', fond=False)
    im = Image.open(D + nom + '_plein.png'); a = np.asarray(im)[..., 3]; ys, xs = np.where(a > 6)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    im.crop((x0, y0, x1, y1)).save(D + nom + '.png')
    return {'i': i, 'px': x0 / k, 'py': y0 / k, 'w': (x1 - x0) / k, 'h': (y1 - y0) / k}

if 'fond' in quoi:
    Rd.etat('A'); voir(sans=CACHES); r.use_border = False
    rendre('fond_brut'); post.finir(D + 'fond_brut', D + 'fond.png')

if 'portes' in quoi:
    voir(sans=CACHES); Rd.etat('C')
    for i, rep in enumerate((S.GAUCHE, S.DROITE)):
        uc = S.LW / 2
        pts = [vue(rep.P(uc + s * 1.45, v, z)) for s in (-1, 1) for v in (-0.5, S.EP + 1.6) for z in (-0.1, S.P_NAIS + S.P_LARG + 1.0)]
        x0, x1, y0, y1 = min(p[0] for p in pts), max(p[0] for p in pts), min(p[1] for p in pts), max(p[1] for p in pts)
        bord(x0, x1, y0, y1); rendre('porte%d_C_brut' % i)
        X0, X1 = int(r.border_min_x * W), int(r.border_max_x * W); Y0, Y1 = int((1 - r.border_max_y) * H), int((1 - r.border_min_y) * H)
        for suf in ('', '_id', '_prof'):
            f = Image.open(D + 'fond_brut' + suf + '.png'); g = Image.open(D + 'porte%d_C_brut' % i + suf + '.png')
            a = np.asarray(f).copy(); b = np.asarray(g); a[Y0 + 2:Y1 - 2, X0 + 2:X1 - 2] = b[Y0 + 2:Y1 - 2, X0 + 2:X1 - 2]
            Image.fromarray(a).save(D + 'tmp%d' % i + suf + '.png')
        post.finir(D + 'tmp%d' % i, D + 'tmp%d_fini.png' % i)
        im = Image.open(D + 'tmp%d_fini.png' % i); cx0, cx1, cy0, cy1 = X0 + 4, X1 - 4, Y0 + 4, Y1 - 4
        im.crop((cx0, cy0, cx1, cy1)).save(D + 'porte%d.png' % i)
        info['portes'].append({'x': cx0 / k, 'y': cy0 / k, 'w': (cx1 - cx0) / k, 'h': (cy1 - cy0) / k})
    r.use_border = False; Rd.etat('A')

if 'obs' in quoi:
    Rd.etat('A')
    for i in range(2):
        voir(seulement=OBS[i]); cadre_objets(OBS[i]); nom = 'obs%02d' % i
        rendre(nom + '_brut'); info['obs'].append(detourer(nom, i))
    r.use_border = False

if 'rocs' in quoi:
    # une lumière de plus, juste pour les rochers : sinon, posés au milieu, ils sont éclairés de dos (par l'armure) et sortent noirs
    Lk = bpy.data.lights.new('cle_rocs', 'AREA'); Lk.size = 4; Lk.energy = 900; Lk.color = (1.0, 0.92, 0.84)
    ok_ = bpy.data.objects.new('cle_rocs', Lk); sc.collection.objects.link(ok_); ok_.location = S.W(5.5, 11.5, 6.5)
    ok_.rotation_euler = (S.W(9, 6, 0.5) - S.W(5.5, 11.5, 6.5)).to_track_quat('-Z', 'Y').to_euler()
    for i in range(S.ROCS):
        Rd.etat('A', i); voir(seulement=ROC[i]); cadre_objets(ROC[i]); nom = 'roc%d' % i
        rendre(nom + '_brut'); e = detourer(nom, i)
        e['dx'] = e['px'] - (B.OX + 9.0 * B.T); e['dy'] = e['py'] - (B.OY + 6.0 * B.T * B.K)   # (posé en x = 9, y = 6)
        info['rocs'].append(e)
    bpy.data.objects.remove(ok_); r.use_border = False; Rd.etat('A')

anc = {}
if os.path.exists(D + 'info.json'): anc = json.load(open(D + 'info.json'))
for c in ('obs', 'rocs', 'portes'):
    if not info[c] and c in anc: info[c] = anc[c]
json.dump(info, open(D + 'info.json', 'w'), indent=1)
log('fini')
