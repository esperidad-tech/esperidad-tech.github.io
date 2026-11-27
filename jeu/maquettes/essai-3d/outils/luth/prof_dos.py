# carte de profondeur vue de dos (orthographique) : y de la surface la plus en arrière, en (x, z)
import bpy, sys, numpy as np
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=sys.argv[1])
for o in list(bpy.data.objects):
    if o.name.startswith('Icosphere'): bpy.data.objects.remove(o)
me = bpy.data.objects['char1']
from mathutils.bvhtree import BVHTree
from mathutils import Vector
dg = bpy.context.evaluated_depsgraph_get()
bvh = BVHTree.FromObject(me, dg); M = me.matrix_world; Mi = M.inverted(); R = Mi.to_3x3()
X = np.linspace(-0.3, 0.3, 241); Z = np.linspace(0.6, 1.45, 341)
D = np.full((len(Z), len(X)), np.nan); F = np.full((len(Z), len(X)), -1)
for j, z in enumerate(Z):
    for i, x in enumerate(X):
        hit = bvh.ray_cast(Mi @ Vector((x, 1.0, z)), (R @ Vector((0, -1, 0))).normalized())
        if hit[0] is not None: D[j, i] = (M @ hit[0]).y; F[j, i] = hit[2]
np.save('/tmp/luth/dos_D.npy', D); np.save('/tmp/luth/dos_F.npy', F)
print('ok', np.nanmin(D), np.nanmax(D))
