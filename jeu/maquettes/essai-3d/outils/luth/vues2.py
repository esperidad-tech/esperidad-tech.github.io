import bpy, sys
from mathutils import Vector
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=sys.argv[1])
for o in list(bpy.data.objects):
    if o.name.startswith('Icosphere'): bpy.data.objects.remove(o)
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.samples = 12; sc.cycles.use_denoising = False
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[1].default_value = 1.2
sun = bpy.data.objects.new('s', bpy.data.lights.new('s', 'SUN')); sun.data.energy = 3; sc.collection.objects.link(sun); sun.rotation_euler = (0.9, 0.3, 2.6)
sc.render.resolution_x = 500; sc.render.resolution_y = 700; sc.render.film_transparent = True
cam = bpy.data.objects.new('c', bpy.data.cameras.new('c')); sc.collection.objects.link(cam); sc.camera = cam
cam.data.type = 'ORTHO'
luth = [o for o in bpy.data.objects if o.name.startswith('luth')]
corps = [o for o in bpy.data.objects if o.name.startswith('char1')]
print('objets', [o.name for o in bpy.data.objects])
def vue(nom, pos, cible, echelle, cache):
    for o in bpy.data.objects:
        if o.type == 'MESH': o.hide_render = o in cache
    cam.data.ortho_scale = echelle; cam.location = pos; d = Vector(cible) - Vector(pos); cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    sc.render.filepath = '/tmp/luth/w_' + nom + '.png'; bpy.ops.render.render(write_still=True)
vue('dos', (0, 3, 1.0), (0, 0, 1.0), 0.8, luth)
vue('dos34', (1.6, 2.4, 1.6), (0, 0, 1.0), 0.8, luth)
vue('epaule', (-1.5, 1.5, 2.6), (-0.2, 0.1, 1.2), 0.5, luth)
vue('luth_dos', (0, 3, 1.0), (0, 0, 1.0), 0.8, corps)
vue('luth_face', (0, -3, 1.0), (0, 0, 1.0), 0.8, corps)
vue('ensemble', (1.6, 2.4, 1.6), (0, 0, 1.0), 0.8, [])
