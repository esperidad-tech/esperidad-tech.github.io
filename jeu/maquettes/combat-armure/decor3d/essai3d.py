# L'essai « en vraie 3D » (27 novembre) : le fond de la salle plus fin que celui du jeu, avec les deux lanternes, et la profondeur.
# python3 essai3d.py [échelle=1.5] [échantillons=64] → out/essai3d/ : fond.png (fini), fond_brut_prof.png, obs00_plein.png, obs01_plein.png…
# (échelle 1 = le jeu : 1720 × 1112 ; 1.5 = 2580 × 1668.) Ensuite : jeu/maquettes/essai-3d/outils/composer.py puis empaqueter.py.
import os, sys, time
ICI = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, ICI)
import bpy
import base as B, salle as S, rendu as Rd, post
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector

ech = float(sys.argv[1]) if len(sys.argv) > 1 else 1.5; n = int(sys.argv[2]) if len(sys.argv) > 2 else 64
D = os.path.join(ICI, 'out', 'essai3d', ''); os.makedirs(D, exist_ok=True)
T0 = time.time()
def log(*a): print('[%5.0f s]' % (time.time() - T0), *a, flush=True)

sc = S.construire(); Rd.reglages(sc, ech, n, 0.025); r = sc.render
OBS = {i: list(B.COLS['obs_%02d' % i].objects) for i in range(2)}
ROC = [o for i in range(S.ROCS) for o in B.COLS['roc_%d' % i].objects]
TOUS = [o for o in bpy.data.objects if o.type == 'MESH']
def voir(seulement=None, sans=()):
    for o in TOUS: o.visible_camera = (seulement is None or o in seulement) and o not in sans
def cadre(objs, marge=9):   # ne calculer que le petit rectangle autour d'une lanterne (le reste reste transparent)
    pts = [world_to_camera_view(sc, sc.camera, ob.matrix_world @ Vector(c)) for ob in objs for c in ob.bound_box]
    m = marge / float(B.SW); r.use_border = True; r.use_crop_to_border = False
    r.border_min_x, r.border_max_x = max(0, min(p.x for p in pts) - m), min(1, max(p.x for p in pts) + m)
    r.border_min_y, r.border_max_y = max(0, min(p.y for p in pts) - m * B.SW / B.SH), min(1, max(p.y for p in pts) + m * B.SW / B.SH)
def rendre(nom):
    r.filepath = D + nom + '.png'; bpy.ops.render.render(write_still=True); Rd.passes_aide(sc, D + nom); log(nom, 'rendu')

bpy.context.view_layer.update(); Rd.etat('A'); r.use_border = False
voir(sans=OBS[0] + OBS[1] + ROC); rendre('fond_brut'); post.finir(D + 'fond_brut', D + 'fond.png')
for i in (0, 1):
    voir(seulement=OBS[i]); cadre(OBS[i]); rendre('obs%02d_brut' % i); post.finir(D + 'obs%02d_brut' % i, D + 'obs%02d_plein.png' % i, fond=False)
log('fini')
