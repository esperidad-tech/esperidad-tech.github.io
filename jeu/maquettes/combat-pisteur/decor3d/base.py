# Outils communs : la scène, la caméra (exactement la projection du jeu), les matières, les formes.
import bpy, bmesh, math, random
from mathutils import Vector, Matrix

# ---- la projection du jeu (src/base.js) : px = 64 + 46 x ; py = 262 + 46·0,66·y − 46·z ----
T, K, OX, OY = 46.0, 0.66, 64.0, 262.0
RW, RD, Y0, HM = 26.0, 18.0, 1.3, 4.6
SW, SH = 1324, 852
THETA = math.asin(K)            # la caméra regarde d'en haut : le sol est écrasé à 0,66
ZS = 1.0 / math.cos(THETA)      # … et les hauteurs gardent leur taille (comme dans le jeu) : on étire le monde en hauteur

def srgb(h, a=1.0):
    h = h.lstrip('#'); r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    f = lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return (f(r), f(g), f(b), a)

def varier(c, R, dv=0.08, dt=0.03):
    v = 1 + (R.random() * 2 - 1) * dv
    return (max(0, c[0] * v * (1 + (R.random() * 2 - 1) * dt)), max(0, c[1] * v), max(0, c[2] * v * (1 + (R.random() * 2 - 1) * dt)), 1.0)

def G(x, y, z=0.0):
    """un point du jeu (x vers la droite, y vers le bas de l'écran, z la hauteur) → le repère de la scène"""
    return Vector((x, -y, z))

MONDE = None
COLS = {}

def raz():
    global MONDE
    bpy.ops.wm.read_factory_settings(use_empty=True)
    COLS.clear(); MATS.clear(); MESHS.clear(); IDC[0] = 1; DERNIER[0] = None
    sc = bpy.context.scene
    MONDE = bpy.data.objects.new('monde', None); sc.collection.objects.link(MONDE); MONDE.scale = (1, 1, ZS)
    return sc

def col(nom):
    if nom not in COLS:
        c = bpy.data.collections.new(nom); bpy.context.scene.collection.children.link(c); COLS[nom] = c
    return COLS[nom]

IDC = [1]
DERNIER = [None]
def poser(ob, coll, parent=True):
    """chaque pièce a son numéro (pass_index) : c'est lui qui sert à tracer les contours entre deux pièces"""
    col(coll).objects.link(ob)
    if parent: ob.parent = MONDE
    if ob.name.startswith('rivet') and DERNIER[0] is not None: ob.pass_index = DERNIER[0].pass_index
    else:
        IDC[0] += 1; ob.pass_index = IDC[0]
        if ob.type == 'MESH': DERNIER[0] = ob
    return ob

def camera(echelle=1.0):
    sc = bpy.context.scene
    cam = bpy.data.cameras.new('cam'); cam.type = 'ORTHO'; cam.ortho_scale = SW / T
    cam.clip_start = 1; cam.clip_end = 400
    ob = bpy.data.objects.new('cam', cam); sc.collection.objects.link(ob)
    d = Vector((0, math.cos(THETA), -math.sin(THETA))); up = Vector((0, math.sin(THETA), math.cos(THETA)))
    cx = (SW / 2 - OX) / T; cy = (SH / 2 - OY) / (T * K)
    vise = Vector((cx, -cy, 0))
    M = Matrix((Vector((1, 0, 0)), up, -d)).transposed().to_4x4()
    M.translation = vise - d * 120
    ob.matrix_world = M
    sc.camera = ob
    sc.render.resolution_x = SW * 2; sc.render.resolution_y = SH * 2
    sc.render.resolution_percentage = int(100 * echelle)
    return ob

# ---------------- les matières ----------------
MATS = {}

def _mix(nt, typ='MULTIPLY', fac=1.0):
    n = nt.nodes.new('ShaderNodeMix'); n.data_type = 'RGBA'; n.blend_type = typ
    S = {s.identifier: s for s in n.inputs}; O = {s.identifier: s for s in n.outputs}
    S['Factor_Float'].default_value = fac
    return n, S['Factor_Float'], S['A_Color'], S['B_Color'], O['Result_Color']

def _math(nt, op, a=None, b=None):
    n = nt.nodes.new('ShaderNodeMath'); n.operation = op
    for i, v in enumerate((a, b)):
        if v is None: continue
        if isinstance(v, (int, float)): n.inputs[i].default_value = v
        else: nt.links.new(v, n.inputs[i])
    return n.outputs[0]

def _ramp(nt, src, pts):
    n = nt.nodes.new('ShaderNodeValToRGB'); e = n.color_ramp.elements
    while len(e) < len(pts): e.new(0.5)
    for i, (p, c) in enumerate(pts): e[i].position = p; e[i].color = c if len(c) == 4 else (*c, 1)
    nt.links.new(src, n.inputs['Fac'])
    return n.outputs['Color']

def _coords(nt, echelle=(1, 1, 1), monde=False):
    """les coordonnées de la pièce, décalées au hasard pour chaque objet (aucune pierre n'a le même grain)"""
    tc = nt.nodes.new('ShaderNodeTexCoord'); oi = nt.nodes.new('ShaderNodeObjectInfo')
    src = tc.outputs['Object']
    if monde:
        geo = nt.nodes.new('ShaderNodeNewGeometry'); src = geo.outputs['Position']
    add = nt.nodes.new('ShaderNodeVectorMath'); add.operation = 'ADD'
    mul = nt.nodes.new('ShaderNodeVectorMath'); mul.operation = 'SCALE'; mul.inputs['Scale'].default_value = 0.0 if monde else 53.0
    comb = nt.nodes.new('ShaderNodeCombineXYZ')
    for i in range(3): nt.links.new(oi.outputs['Random'], comb.inputs[i])
    nt.links.new(comb.outputs[0], mul.inputs[0]); nt.links.new(src, add.inputs[0]); nt.links.new(mul.outputs[0], add.inputs[1])
    sc = nt.nodes.new('ShaderNodeVectorMath'); sc.operation = 'MULTIPLY'; sc.inputs[1].default_value = echelle
    nt.links.new(add.outputs[0], sc.inputs[0])
    return sc.outputs[0], oi

def _nouveau(nom):
    m = bpy.data.materials.new(nom); m.use_nodes = True; nt = m.node_tree
    for n in list(nt.nodes): nt.nodes.remove(n)
    out = nt.nodes.new('ShaderNodeOutputMaterial'); b = nt.nodes.new('ShaderNodeBsdfPrincipled')
    nt.links.new(b.outputs[0], out.inputs['Surface'])
    MATS[nom] = m
    return m, nt, b

def pierre(nom='pierre', rug=0.82, relief=0.35, fissures=0.5, mousse=0.0, salete=0.0, grain=1.0, poli=0.0, patine=0.0):
    """la pierre : la teinte de l'objet, un grain, des taches, des fissures sur certaines, de la mousse et du noir au pied des murs"""
    if nom in MATS: return MATS[nom]
    m, nt, b = _nouveau(nom); L = nt.links
    v, oi = _coords(nt)
    n1 = nt.nodes.new('ShaderNodeTexNoise'); n1.inputs['Scale'].default_value = 1.6 * grain; n1.inputs['Detail'].default_value = 5; n1.inputs['Roughness'].default_value = 0.62
    n2 = nt.nodes.new('ShaderNodeTexNoise'); n2.inputs['Scale'].default_value = 14 * grain; n2.inputs['Detail'].default_value = 3
    n3 = nt.nodes.new('ShaderNodeTexNoise'); n3.inputs['Scale'].default_value = 0.55 * grain; n3.inputs['Detail'].default_value = 2
    vo = nt.nodes.new('ShaderNodeTexVoronoi'); vo.feature = 'DISTANCE_TO_EDGE'; vo.inputs['Scale'].default_value = 0.42 * grain
    for n in (n1, n2, n3, vo): L.new(v, n.inputs['Vector'])
    taches = _ramp(nt, n1.outputs['Fac'], [(0.25, (0.72, 0.72, 0.74)), (0.5, (1, 1, 1)), (0.78, (1.16, 1.14, 1.1))])
    grainc = _ramp(nt, n2.outputs['Fac'], [(0.3, (0.9, 0.9, 0.9)), (0.7, (1.08, 1.08, 1.08))])
    teinte = _ramp(nt, n3.outputs['Fac'], [(0.3, (1.06, 0.98, 0.9)), (0.7, (0.92, 0.98, 1.1))])
    a, f, A, B, r1 = _mix(nt, 'MULTIPLY'); L.new(oi.outputs['Color'], A); L.new(taches, B)
    a, f, A, B, r2 = _mix(nt, 'MULTIPLY'); L.new(r1, A); L.new(grainc, B)
    a, f, A, B, r3 = _mix(nt, 'MULTIPLY'); L.new(r2, A); L.new(teinte, B)
    # les fissures : seulement sur une partie des pierres
    lig = _ramp(nt, vo.outputs['Distance'], [(0.0, (0, 0, 0)), (0.008, (0, 0, 0)), (0.022, (1, 1, 1))])
    a_fis = _math(nt, 'MULTIPLY', _math(nt, 'GREATER_THAN', oi.outputs['Random'], 1 - fissures * 0.4), 0.55)
    lig1 = _math(nt, 'SUBTRACT', 1.0, lig); fis = _math(nt, 'MULTIPLY', lig1, a_fis)
    a, f, A, B, r4 = _mix(nt, 'MIX'); L.new(fis, f); L.new(r3, A); B.default_value = (0.02, 0.02, 0.03, 1)
    coul = r4
    geo = nt.nodes.new('ShaderNodeNewGeometry'); sep = nt.nodes.new('ShaderNodeSeparateXYZ'); L.new(geo.outputs['Position'], sep.inputs[0])
    if mousse > 0 or salete > 0:
        # au pied des murs : de la mousse dans le bas, du noir de fumée
        nm = nt.nodes.new('ShaderNodeTexNoise'); nm.inputs['Scale'].default_value = 1.3; nm.inputs['Detail'].default_value = 6
        L.new(geo.outputs['Position'], nm.inputs['Vector'])
        h = _math(nt, 'DIVIDE', sep.outputs['Z'], ZS)
        bas = _ramp(nt, h, [(0.0, (1, 1, 1)), (0.16, (0.55, 0.55, 0.55)), (0.34, (0, 0, 0))])
        mm = _ramp(nt, nm.outputs['Fac'], [(0.42, (0, 0, 0)), (0.62, (1, 1, 1))])
        fm = _math(nt, 'MULTIPLY', _math(nt, 'MULTIPLY', bas, mm), mousse)
        a, f, A, B, r5 = _mix(nt, 'MIX'); L.new(fm, f); L.new(coul, A); B.default_value = srgb('#3a4a26'); coul = r5
        if salete > 0:
            fs = _math(nt, 'MULTIPLY', _ramp(nt, h, [(0.0, (1, 1, 1)), (0.3, (0.3, 0.3, 0.3)), (0.9, (0, 0, 0))]), salete)
            a, f, A, B, r6 = _mix(nt, 'MIX'); L.new(fs, f); L.new(coul, A); B.default_value = (0.012, 0.012, 0.018, 1); coul = r6
    if patine > 0:
        npat = nt.nodes.new('ShaderNodeTexNoise'); npat.inputs['Scale'].default_value = 0.22; npat.inputs['Detail'].default_value = 5; npat.inputs['Roughness'].default_value = 0.7
        L.new(geo.outputs['Position'], npat.inputs['Vector'])
        pt = _ramp(nt, npat.outputs['Fac'], [(0.3, (1 - patine, 1 - patine, 1 - patine * 0.8)), (0.55, (1, 1, 1)), (0.75, (1 + patine * 0.25, 1 + patine * 0.22, 1 + patine * 0.15))])
        a, f, A, B, r7 = _mix(nt, 'MULTIPLY'); L.new(coul, A); L.new(pt, B); coul = r7
    L.new(coul, b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = rug
    if poli > 0:
        rr = _ramp(nt, n1.outputs['Fac'], [(0.3, (rug - poli,) * 3), (0.7, (rug,) * 3)]); L.new(rr, b.inputs['Roughness'])
    # le relief : le grain, et les fissures en creux
    hh = _math(nt, 'ADD', _math(nt, 'MULTIPLY', n1.outputs['Fac'], 0.6), _math(nt, 'MULTIPLY', n2.outputs['Fac'], 0.25))
    hh = _math(nt, 'SUBTRACT', hh, _math(nt, 'MULTIPLY', fis, 0.8))
    bu = nt.nodes.new('ShaderNodeBump'); bu.inputs['Strength'].default_value = relief; bu.inputs['Distance'].default_value = 0.06
    L.new(hh, bu.inputs['Height']); L.new(bu.outputs['Normal'], b.inputs['Normal'])
    return m

def bois(nom='bois', rug=0.6, relief=0.5):
    """le bois : la teinte de l'objet, des veines dans le sens de la longueur (l'axe X de la pièce)"""
    if nom in MATS: return MATS[nom]
    m, nt, b = _nouveau(nom); L = nt.links
    v, oi = _coords(nt, (0.5, 9, 9))
    n1 = nt.nodes.new('ShaderNodeTexNoise'); n1.inputs['Scale'].default_value = 2.2; n1.inputs['Detail'].default_value = 4; n1.inputs['Distortion'].default_value = 0.6
    v2, _ = _coords(nt, (3, 3, 3))
    n2 = nt.nodes.new('ShaderNodeTexNoise'); n2.inputs['Scale'].default_value = 1.2; n2.inputs['Detail'].default_value = 3
    L.new(v, n1.inputs['Vector']); L.new(v2, n2.inputs['Vector'])
    veines = _ramp(nt, n1.outputs['Fac'], [(0.3, (0.62, 0.6, 0.58)), (0.5, (1, 1, 1)), (0.66, (0.82, 0.8, 0.78)), (0.8, (1.12, 1.1, 1.05))])
    taches = _ramp(nt, n2.outputs['Fac'], [(0.3, (0.8, 0.8, 0.8)), (0.7, (1.1, 1.08, 1.04))])
    a, f, A, B, r1 = _mix(nt, 'MULTIPLY'); L.new(oi.outputs['Color'], A); L.new(veines, B)
    a, f, A, B, r2 = _mix(nt, 'MULTIPLY'); L.new(r1, A); L.new(taches, B)
    L.new(r2, b.inputs['Base Color']); b.inputs['Roughness'].default_value = rug
    bu = nt.nodes.new('ShaderNodeBump'); bu.inputs['Strength'].default_value = relief; bu.inputs['Distance'].default_value = 0.03
    L.new(n1.outputs['Fac'], bu.inputs['Height']); L.new(bu.outputs['Normal'], b.inputs['Normal'])
    return m

def metal(nom, coul, rug=0.4, patine=None, metallic=1.0):
    if nom in MATS: return MATS[nom]
    m, nt, b = _nouveau(nom); L = nt.links
    v, oi = _coords(nt)
    n1 = nt.nodes.new('ShaderNodeTexNoise'); n1.inputs['Scale'].default_value = 5; n1.inputs['Detail'].default_value = 5
    L.new(v, n1.inputs['Vector'])
    c0 = srgb(coul); c1 = srgb(patine) if patine else tuple(x * 0.45 for x in c0[:3]) + (1,)
    cc = _ramp(nt, n1.outputs['Fac'], [(0.3, c1), (0.56, c0), (0.8, tuple(min(1, x * 1.25) for x in c0[:3]) + (1,))])
    L.new(cc, b.inputs['Base Color']); b.inputs['Metallic'].default_value = metallic
    rr = _ramp(nt, n1.outputs['Fac'], [(0.3, (min(1, rug + 0.3),) * 3), (0.7, (rug,) * 3)]); L.new(rr, b.inputs['Roughness'])
    bu = nt.nodes.new('ShaderNodeBump'); bu.inputs['Strength'].default_value = 0.15; bu.inputs['Distance'].default_value = 0.02
    L.new(n1.outputs['Fac'], bu.inputs['Height']); L.new(bu.outputs['Normal'], b.inputs['Normal'])
    return m

def uni(nom, coul=None, rug=0.7, lueur=None, force=0.0, metallic=0.0, objet=False):
    """une matière simple ; objet=True : la teinte vient de l'objet"""
    if nom in MATS: return MATS[nom]
    m, nt, b = _nouveau(nom)
    if objet:
        oi = nt.nodes.new('ShaderNodeObjectInfo'); nt.links.new(oi.outputs['Color'], b.inputs['Base Color'])
        if lueur == 'objet':
            nt.links.new(oi.outputs['Color'], b.inputs['Emission Color']); b.inputs['Emission Strength'].default_value = force
    else:
        b.inputs['Base Color'].default_value = srgb(coul)
    b.inputs['Roughness'].default_value = rug; b.inputs['Metallic'].default_value = metallic
    if lueur and lueur != 'objet':
        b.inputs['Emission Color'].default_value = srgb(lueur); b.inputs['Emission Strength'].default_value = force
    return m

def braise(nom='braise', force=14.0, c0='#ff5a10', c1='#ffd070', ech=9.0):
    """des braises : des charbons sombres, le feu qui rougeoie dans les fentes"""
    if nom in MATS: return MATS[nom]
    m, nt, b = _nouveau(nom); L = nt.links
    v, oi = _coords(nt)
    vo = nt.nodes.new('ShaderNodeTexVoronoi'); vo.feature = 'DISTANCE_TO_EDGE'; vo.inputs['Scale'].default_value = ech
    n1 = nt.nodes.new('ShaderNodeTexNoise'); n1.inputs['Scale'].default_value = ech * 0.5; n1.inputs['Detail'].default_value = 2
    L.new(v, vo.inputs['Vector']); L.new(v, n1.inputs['Vector'])
    d = _math(nt, 'ADD', vo.outputs['Distance'], _math(nt, 'MULTIPLY', _math(nt, 'SUBTRACT', n1.outputs['Fac'], 0.5), 0.12))
    d = _math(nt, 'MULTIPLY', d, ech)          # la distance, comptée en tailles de charbon
    cc = _ramp(nt, d, [(0.0, srgb(c1)), (0.07, srgb(c0)), (0.2, (0.3, 0.03, 0.006, 1)), (0.36, (0.03, 0.014, 0.012, 1))])
    ff = _ramp(nt, d, [(0.0, (1, 1, 1)), (0.08, (0.55, 0.55, 0.55)), (0.2, (0.1, 0.1, 0.1)), (0.36, (0.0, 0.0, 0.0))])
    L.new(cc, b.inputs['Emission Color']); L.new(_math(nt, 'MULTIPLY', ff, force), b.inputs['Emission Strength'])
    L.new(cc, b.inputs['Base Color']); b.inputs['Roughness'].default_value = 0.9
    return m

def image(nom, chemin, rug=0.85, relief=0.0, alpha=False, emission=0.0):
    """une image peinte (tapis, bannière) posée sur la pièce par ses coordonnées UV"""
    if nom in MATS: return MATS[nom]
    m, nt, b = _nouveau(nom); L = nt.links
    im = bpy.data.images.load(chemin); t = nt.nodes.new('ShaderNodeTexImage'); t.image = im; t.extension = 'CLIP'
    L.new(t.outputs['Color'], b.inputs['Base Color']); b.inputs['Roughness'].default_value = rug
    if alpha: L.new(t.outputs['Alpha'], b.inputs['Alpha'])
    tc = nt.nodes.new('ShaderNodeTexCoord')
    n1 = nt.nodes.new('ShaderNodeTexNoise'); n1.inputs['Scale'].default_value = 60; n1.inputs['Detail'].default_value = 2
    L.new(tc.outputs['Object'], n1.inputs['Vector'])
    if relief > 0:
        bw = nt.nodes.new('ShaderNodeRGBToBW'); L.new(t.outputs['Color'], bw.inputs[0])
        hh = _math(nt, 'ADD', _math(nt, 'MULTIPLY', bw.outputs[0], 0.7), _math(nt, 'MULTIPLY', n1.outputs['Fac'], 0.3))
        bu = nt.nodes.new('ShaderNodeBump'); bu.inputs['Strength'].default_value = relief; bu.inputs['Distance'].default_value = 0.02
        L.new(hh, bu.inputs['Height']); L.new(bu.outputs['Normal'], b.inputs['Normal'])
    if emission > 0:
        L.new(t.outputs['Color'], b.inputs['Emission Color']); b.inputs['Emission Strength'].default_value = emission
    return m

# ---------------- les formes ----------------
MESHS = {}

def _fini(me, lisse=True, angle=38):
    if lisse:
        me.polygons.foreach_set('use_smooth', [True] * len(me.polygons))
        try: me.set_sharp_from_angle(angle=math.radians(angle))
        except Exception: pass
    me.update()

def boite(nom, c, taille, mat, coul=None, coll='fond', biseau=0.03, rot=None, seg=2):
    """une boîte biseautée : c son centre (x, y, z du jeu), taille (largeur en x, profondeur en y, hauteur en z).
       rot : une matrice 3×3 (dans le repère de la scène) appliquée autour du centre."""
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    sx, sy, sz = taille
    for v in bm.verts: v.co = Vector((v.co.x * sx, v.co.y * sy, v.co.z * sz))
    b = min(biseau, min(sx, sy, sz) * 0.45)
    if b > 0.002:
        bmesh.ops.bevel(bm, geom=list(bm.edges), offset=b, segments=seg, profile=0.5, affect='EDGES')
    me = bpy.data.meshes.new(nom); bm.to_mesh(me); bm.free(); _fini(me)
    ob = bpy.data.objects.new(nom, me)
    M = (rot.to_4x4() if rot else Matrix.Identity(4)); M.translation = G(*c)
    ob.matrix_local = M
    if mat: me.materials.append(mat)
    if coul: ob.color = coul
    return poser(ob, coll)

def planche(nom, a, b, larg, ep, mat, coul, coll='fond', biseau=0.015, vers=None):
    """une planche de a à b (points du jeu) : son axe X suit sa longueur (les veines du bois aussi).
       vers : la direction (du jeu) vers laquelle regarde sa grande face."""
    A = G(*a); B = G(*b); d = B - A; Ln = d.length; ex = d.normalized()
    n = (Vector((vers[0], -vers[1], vers[2])) if vers else Vector((0, -1, 0)))
    n = (n - ex * n.dot(ex))
    if n.length < 1e-4: n = ex.orthogonal()
    ez = n.normalized(); ey = ez.cross(ex).normalized()
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts: v.co = Vector((v.co.x * Ln, v.co.y * larg, v.co.z * ep))
    bb = min(biseau, min(Ln, larg, ep) * 0.4)
    if bb > 0.002: bmesh.ops.bevel(bm, geom=list(bm.edges), offset=bb, segments=1, affect='EDGES')
    me = bpy.data.meshes.new(nom); bm.to_mesh(me); bm.free(); _fini(me)
    ob = bpy.data.objects.new(nom, me)
    M = Matrix((ex, ey, ez)).transposed().to_4x4(); M.translation = (A + B) / 2
    ob.matrix_local = M; me.materials.append(mat)
    if coul: ob.color = coul
    return poser(ob, coll)

def tour(nom, profil, c, mat, coul=None, coll='fond', seg=28, lisse=True, angle=40, cannelures=0, creux=0.0):
    """une forme tournée : profil = [(rayon, hauteur)…] du bas vers le haut ; c = (x, y, z du pied)"""
    bm = bmesh.new(); rings = []
    for (r, h) in profil:
        ring = []
        for i in range(seg):
            a = i / seg * math.tau; rr = r
            if cannelures and r > 0: rr = r * (1 - creux * abs(math.sin(a * cannelures / 2)) ** 0.8)
            ring.append(bm.verts.new((math.cos(a) * rr, math.sin(a) * rr, h)))
        rings.append(ring)
    for k in range(len(rings) - 1):
        for i in range(seg):
            j = (i + 1) % seg
            try: bm.faces.new((rings[k][i], rings[k][j], rings[k + 1][j], rings[k + 1][i]))
            except ValueError: pass
    try:
        bm.faces.new(list(reversed(rings[0]))); bm.faces.new(rings[-1])
    except ValueError: pass
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(nom); bm.to_mesh(me); bm.free(); _fini(me, lisse, angle)
    ob = bpy.data.objects.new(nom, me); ob.location = G(*c)
    if mat: me.materials.append(mat)
    if coul: ob.color = coul
    return poser(ob, coll)

def boule(nom, c, r, mat, coul=None, coll='fond', ecrase=(1, 1, 1), seg=10):
    cle = ('boule', seg)
    if cle not in MESHS:
        bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=max(5, seg // 2), radius=1.0)
        me = bpy.data.meshes.new('boule'); bm.to_mesh(me); bm.free(); _fini(me, True, 80); MESHS[cle] = me
    me = MESHS[cle]
    if mat and (len(me.materials) == 0 or me.materials[0] != mat):
        cle2 = ('boule', seg, mat.name)
        if cle2 not in MESHS:
            m2 = me.copy(); m2.materials.clear(); m2.materials.append(mat); MESHS[cle2] = m2
        me = MESHS[cle2]
    ob = bpy.data.objects.new(nom, me); ob.location = G(*c); ob.scale = (r * ecrase[0], r * ecrase[1], r * ecrase[2])
    if coul: ob.color = coul
    return poser(ob, coll)

def rivet(c, r, mat, coll='fond', normal=(0, 1, 0)):
    """une tête de rivet (une demi-boule aplatie) ; elle garde sa rondeur à l'écran"""
    ob = boule('rivet', c, r, mat, None, coll, seg=8)
    ob.scale = (r, r * 0.6, r / ZS) if abs(normal[1]) > 0.5 else ((r * 0.6, r, r / ZS) if abs(normal[0]) > 0.5 else (r, r, r * 0.6 / ZS))
    return ob

def rocher(nom, c, r, mat, coul, coll='fond', R=None, aplati=0.75, sub=2, bosses=0.28):
    """un caillou : une boule cabossée"""
    R = R or random
    bm = bmesh.new(); bmesh.ops.create_icosphere(bm, subdivisions=sub, radius=1.0)
    axes = [Vector((R.uniform(-1, 1), R.uniform(-1, 1), R.uniform(-1, 1))).normalized() for _ in range(7)]
    amp = [R.uniform(-bosses, bosses) for _ in axes]
    for v in bm.verts:
        n = v.co.normalized(); k = 1.0
        for a, m in zip(axes, amp): k += m * max(0.0, n.dot(a)) ** 2
        v.co = n * k
    sx, sy, sz = R.uniform(0.8, 1.25), R.uniform(0.8, 1.25), R.uniform(0.6, 1.0) * aplati
    for v in bm.verts: v.co = Vector((v.co.x * sx * r, v.co.y * sy * r, v.co.z * sz * r))
    me = bpy.data.meshes.new(nom); bm.to_mesh(me); bm.free(); _fini(me, True, 50)
    ob = bpy.data.objects.new(nom, me); ob.location = G(*c)
    ob.rotation_euler = (R.uniform(-0.4, 0.4), R.uniform(-0.4, 0.4), R.uniform(0, 6.28))
    me.materials.append(mat)
    if coul: ob.color = coul
    return poser(ob, coll)

def maille(nom, verts, faces, mat, coul=None, coll='fond', lisse=False, uvs=None, c=(0, 0, 0)):
    me = bpy.data.meshes.new(nom); me.from_pydata([tuple(v) for v in verts], [], faces)
    if uvs:
        uv = me.uv_layers.new(name='UVMap')
        for poly in me.polygons:
            for li in poly.loop_indices: uv.data[li].uv = uvs[me.loops[li].vertex_index]
    _fini(me, lisse, 60)
    ob = bpy.data.objects.new(nom, me); ob.location = G(*c)
    if mat: me.materials.append(mat)
    if coul: ob.color = coul
    return poser(ob, coll)

def decouper(ob, coupe, inter=False):
    """enlève de ob le volume de l'objet « coupe » (ou garde seulement ce qui est dedans)"""
    md = ob.modifiers.new('b', 'BOOLEAN'); md.operation = 'INTERSECT' if inter else 'DIFFERENCE'; md.object = coupe; md.solver = 'EXACT'
    dg = bpy.context.evaluated_depsgraph_get(); ev = ob.evaluated_get(dg)
    me = bpy.data.meshes.new_from_object(ev); vide = len(me.polygons) == 0
    ob.modifiers.remove(md); old = ob.data; ob.data = me
    _fini(me, True, 38)
    return not vide

def lampe(nom, c, puissance, coul, rayon=0.2, coll='lumieres', ombre_douce=None):
    L = bpy.data.lights.new(nom, 'POINT'); L.energy = puissance; L.color = coul; L.shadow_soft_size = rayon
    ob = bpy.data.objects.new(nom, L); ob.location = G(*c)
    return poser(ob, coll)

def sans_ombre(lum, objets, nom):
    """ces objets ne font pas d'ombre pour cette lumière (la vasque n'éteint pas son propre feu)"""
    c = bpy.data.collections.new(nom)
    for o in objets:
        c.objects.link(o)
    for co in c.collection_objects: co.light_linking.link_state = 'EXCLUDE'
    lum.light_linking.blocker_collection = c
