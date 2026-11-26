# Les rendus. python3 rendu.py essai [échelle] [échantillons]
import bpy, sys, time, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import base as B, salle as S
import os
ICI = os.path.dirname(os.path.abspath(__file__))

def reglages(sc, ech=0.25, samples=48, seuil=0.04):
    r = sc.render; r.engine = 'CYCLES'; c = sc.cycles
    c.device = 'CPU'; c.samples = samples; c.use_adaptive_sampling = True; c.adaptive_threshold = seuil
    c.use_denoising = True; c.denoiser = 'OPENIMAGEDENOISE'
    c.max_bounces = 5; c.diffuse_bounces = 3; c.glossy_bounces = 2; c.transmission_bounces = 2; c.transparent_max_bounces = 8
    c.sample_clamp_indirect = 5.0; c.caustics_reflective = False; c.caustics_refractive = False
    r.film_transparent = True; r.threads_mode = 'FIXED'; r.threads = 2
    r.resolution_percentage = int(ech * 100)
    r.image_settings.file_format = 'PNG'; r.image_settings.color_mode = 'RGBA'; r.image_settings.color_depth = '8'
    sc.view_settings.view_transform = 'AgX'
    try: sc.view_settings.look = 'AgX - Punchy'
    except Exception as e: print('look', e)

def etat(portes='A', signal=False):
    for nom, vis in (('porteA', portes == 'A'), ('porteC', portes == 'C'), ('signal_off', not signal), ('signal_on', signal), ('outils', False)):
        if nom in B.COLS: B.COLS[nom].hide_render = not vis

# ---- les passes d'aide : une couleur par pièce (pour tracer les contours), la profondeur ----
def matiere_aide(quoi):
    m = bpy.data.materials.new('aide_' + quoi); m.use_nodes = True; nt = m.node_tree
    for n in list(nt.nodes): nt.nodes.remove(n)
    out = nt.nodes.new('ShaderNodeOutputMaterial'); em = nt.nodes.new('ShaderNodeEmission'); nt.links.new(em.outputs[0], out.inputs['Surface'])
    if quoi == 'id':
        oi = nt.nodes.new('ShaderNodeObjectInfo'); comb = nt.nodes.new('ShaderNodeCombineColor')
        for i, k in enumerate((0.61803, 0.75488, 0.56984)):
            mu = nt.nodes.new('ShaderNodeMath'); mu.operation = 'MULTIPLY'; mu.inputs[1].default_value = k; nt.links.new(oi.outputs['Object Index'], mu.inputs[0])
            fr = nt.nodes.new('ShaderNodeMath'); fr.operation = 'FRACT'; nt.links.new(mu.outputs[0], fr.inputs[0]); nt.links.new(fr.outputs[0], comb.inputs[i])
        nt.links.new(comb.outputs[0], em.inputs['Color'])
    else:
        cd = nt.nodes.new('ShaderNodeCameraData'); mr = nt.nodes.new('ShaderNodeMapRange')
        mr.inputs['From Min'].default_value = 90; mr.inputs['From Max'].default_value = 150
        nt.links.new(cd.outputs['View Z Depth'], mr.inputs['Value'])
        geo = nt.nodes.new('ShaderNodeNewGeometry'); sep = nt.nodes.new('ShaderNodeSeparateXYZ'); nt.links.new(geo.outputs['Normal'], sep.inputs[0])
        comb = nt.nodes.new('ShaderNodeCombineColor'); nt.links.new(mr.outputs[0], comb.inputs[0])
        for i, ax in ((1, 'X'), (2, 'Z')):
            ma = nt.nodes.new('ShaderNodeMath'); ma.operation = 'MULTIPLY_ADD'; ma.inputs[1].default_value = 0.5; ma.inputs[2].default_value = 0.5
            nt.links.new(sep.outputs[ax], ma.inputs[0]); nt.links.new(ma.outputs[0], comb.inputs[i])
        nt.links.new(comb.outputs[0], em.inputs['Color'])
    return m

def passes_aide(sc, base):
    """rend deux images d'aide à côté de l'image : base_id.png et base_prof.png"""
    c = sc.cycles; garde = (c.samples, c.use_denoising, c.max_bounces, sc.view_settings.view_transform, sc.view_settings.look, sc.render.image_settings.color_depth, sc.render.filepath, c.use_adaptive_sampling)
    c.samples = 6; c.use_denoising = False; c.max_bounces = 0; c.use_adaptive_sampling = False
    sc.view_settings.view_transform = 'Raw'; sc.view_settings.look = 'None'; sc.render.image_settings.color_depth = '16'
    vl = sc.view_layers[0]
    for quoi in ('id', 'prof'):
        vl.material_override = matiere_aide(quoi); sc.render.filepath = base + '_' + quoi + '.png'; bpy.ops.render.render(write_still=True)
    vl.material_override = None
    c.samples, c.use_denoising, c.max_bounces, sc.view_settings.view_transform, sc.view_settings.look, sc.render.image_settings.color_depth, sc.render.filepath, c.use_adaptive_sampling = garde

if __name__ == '__main__':
    quoi = sys.argv[1] if len(sys.argv) > 1 else 'essai'
    ech = float(sys.argv[2]) if len(sys.argv) > 2 else 0.25; n = int(sys.argv[3]) if len(sys.argv) > 3 else 48
    t0 = time.time(); sc = S.construire(); print('construit en %.1f s, %d objets' % (time.time() - t0, len(bpy.data.objects)))
    reglages(sc, ech, n); etat('A', False)
    if quoi == 'essaiC': etat('C', True)
    if quoi == 'essaiB': etat('A', True)
    sc.render.filepath = os.path.join(ICI, 'out', '%s.png' % quoi)
    t0 = time.time(); bpy.ops.render.render(write_still=True); print('rendu en %.1f s' % (time.time() - t0))
    if 'aide' in sys.argv: t0 = time.time(); passes_aide(sc, os.path.join(ICI, 'out', quoi)); print('aides en %.1f s' % (time.time() - t0))
