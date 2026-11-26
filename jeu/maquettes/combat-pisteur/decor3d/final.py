# Les rendus finis : le fond, les portes (allumées, ouvertes), chaque obstacle à part.
# python3 final.py [échelle] [échantillons] [quoi…]   quoi : fond portes obs (tout par défaut)
import bpy, sys, time, json, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from PIL import Image
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector
import base as B, salle as S, rendu as Rd, post
import os
ICI = os.path.dirname(os.path.abspath(__file__))

ech = float(sys.argv[1]) if len(sys.argv) > 1 else 1.0; n = int(sys.argv[2]) if len(sys.argv) > 2 else 96
quoi = sys.argv[3:] or ['fond', 'portes', 'obs']
D = os.path.join(ICI, 'out', 'final', '') if ech >= 0.99 else os.path.join(ICI, 'out', 'essai_final', '')
os.makedirs(D, exist_ok=True)
T0 = time.time()
def log(*a): print('[%5.0f s]' % (time.time() - T0), *a, flush=True)

sc = S.construire(); Rd.reglages(sc, ech, n, 0.025 if ech >= 0.99 else 0.06)
r = sc.render; cam = sc.camera
OBS = {i: [o for o in B.COLS['obs_%02d' % i].objects] for i in range(len(S.OBS0))}
TOUS = [o for o in bpy.data.objects if o.type == 'MESH' and not o.name.endswith('_cache')]
def voir(seulement=None, sans=()):
    for o in TOUS: o.visible_camera = (seulement is None or o in seulement) and o not in sans
def bord(x0, x1, y0, y1):
    r.use_border = True; r.use_crop_to_border = False
    r.border_min_x, r.border_max_x, r.border_min_y, r.border_max_y = max(0, x0), min(1, x1), max(0, y0), min(1, y1)
def rendre(nom):
    r.filepath = D + nom + '.png'; t = time.time(); bpy.ops.render.render(write_still=True); Rd.passes_aide(sc, D + nom); log(nom, 'rendu en %.0f s' % (time.time() - t))

W, H = int(r.resolution_x * ech), int(r.resolution_y * ech); k = W / 1324.0
info = {'k': k, 'W': W, 'H': H, 'obs': [], 'portes': []}
bpy.context.view_layer.update()

if 'fond' in quoi:
    Rd.etat('A', False); voir(sans=[o for L in OBS.values() for o in L]); r.use_border = False
    rendre('fond_brut'); post.finir(D + 'fond_brut', D + 'fond.png')

if 'portes' in quoi:
    # un seul rendu par état, cadré sur le haut de la salle ; puis on le recolle dans le fond avant de finir l'image
    voir(sans=[o for L in OBS.values() for o in L])
    y_bas = 1 - (262 + 46 * 0.66 * 7.2) / 852.0
    for nom, (p, sg) in {'B': ('A', True), 'C': ('C', True)}.items():
        Rd.etat(p, sg); bord((64 + 46 * 3.6) / 1324.0, (64 + 46 * 22.4) / 1324.0, y_bas, 1 - 60 / 852.0); rendre('portes_' + nom)
        x0, x1 = int(r.border_min_x * W), int(r.border_max_x * W); y0, y1 = int((1 - r.border_max_y) * H), int((1 - r.border_min_y) * H)
        for suf in ('', '_id', '_prof'):
            f = Image.open(D + 'fond_brut' + suf + '.png'); g = Image.open(D + 'portes_' + nom + suf + '.png')
            a = np.asarray(f).copy(); b = np.asarray(g); a[y0 + 2:y1 - 2, x0 + 2:x1 - 2] = b[y0 + 2:y1 - 2, x0 + 2:x1 - 2]
            Image.fromarray(a).save(D + 'tmp_' + nom + suf + '.png')
        post.finir(D + 'tmp_' + nom, D + 'tmp_' + nom + '_fini.png')
        im = Image.open(D + 'tmp_' + nom + '_fini.png')
        for i, dx in enumerate(S.PORTES):
            cx0, cx1 = int((64 + 46 * (dx - 3.3)) * k), int((64 + 46 * (dx + 3.3)) * k); cy0, cy1 = int(62 * k), int((262 + 46 * 0.66 * 6.6) * k)
            im.crop((cx0, cy0, cx1, cy1)).save(D + 'porte%d_%s.png' % (i, nom))
            if nom == 'B': info['portes'].append({'x': cx0 / k, 'y': cy0 / k, 'w': (cx1 - cx0) / k, 'h': (cy1 - cy0) / k})
    r.use_border = False

if 'obs' in quoi:
    Rd.etat('A', False)
    for i, o in enumerate(S.OBS0):
        objs = OBS[i]; voir(seulement=objs)
        pts = [world_to_camera_view(sc, cam, ob.matrix_world @ Vector(c)) for ob in objs for c in ob.bound_box]
        m = 9 / 1324.0
        bord(min(p.x for p in pts) - m, max(p.x for p in pts) + m, min(p.y for p in pts) - m * 1324 / 852, max(p.y for p in pts) + m * 1324 / 852)
        nom = 'obs%02d_brut' % i; rendre(nom); post.finir(D + nom, D + 'obs%02d_plein.png' % i, fond=False)
        im = Image.open(D + 'obs%02d_plein.png' % i); a = np.asarray(im)[..., 3]; ys, xs = np.where(a > 6)
        x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
        im.crop((x0, y0, x1, y1)).save(D + 'obs%02d.png' % i)
        info['obs'].append({'i': i, 'k': o['k'], 'x': o['x'], 'y': o['y'], 'px': x0 / k, 'py': y0 / k, 'w': (x1 - x0) / k, 'h': (y1 - y0) / k})
    r.use_border = False

anc = {}
if os.path.exists(D + 'info.json'): anc = json.load(open(D + 'info.json'))
for c in ('obs', 'portes'):
    if not info[c] and c in anc: info[c] = anc[c]
json.dump(info, open(D + 'info.json', 'w'), indent=1)
log('fini')
