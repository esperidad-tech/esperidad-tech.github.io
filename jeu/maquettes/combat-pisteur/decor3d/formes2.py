# D'autres formes : le prisme (un contour étiré en profondeur), l'anneau, le tissu.
import bpy, bmesh, math
from mathutils import Vector, Matrix
from base import G, poser, _fini, ZS

def prisme(nom, pts_xz, y0, y1, mat, coul=None, coll='fond', biseau=0.03, seg=1, lisse=True):
    """un contour dessiné de face (points x, z du jeu), étiré de y0 à y1 (profondeur du jeu)"""
    bm = bmesh.new()
    vs = [bm.verts.new((x, -y1, z)) for (x, z) in pts_xz]
    try: f = bm.faces.new(vs)
    except ValueError: bm.free(); return None
    r = bmesh.ops.extrude_face_region(bm, geom=[f])
    nv = [e for e in r['geom'] if isinstance(e, bmesh.types.BMVert)]
    for v in nv: v.co.y = -y0
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    if biseau > 0.002:
        bmesh.ops.bevel(bm, geom=list(bm.edges), offset=biseau, segments=seg, profile=0.5, affect='EDGES')
    me = bpy.data.meshes.new(nom); bm.to_mesh(me); bm.free(); _fini(me, lisse, 38)
    ob = bpy.data.objects.new(nom, me)
    if mat: me.materials.append(mat)
    if coul: ob.color = coul
    return poser(ob, coll)

def tore(nom, c, R, r, mat, coul=None, coll='fond', axe='y', ovale=1.0, seg=14, sseg=7):
    """un anneau ; axe : la direction de son trou ('y' : on le voit de face)"""
    bm = bmesh.new(); g = []
    for i in range(seg):
        a = i / seg * math.tau; ring = []
        for j in range(sseg):
            b = j / sseg * math.tau; rr = R + r * math.cos(b)
            ring.append(bm.verts.new((math.cos(a) * rr, r * math.sin(b), math.sin(a) * rr * ovale)))
        g.append(ring)
    for i in range(seg):
        for j in range(sseg):
            bm.faces.new((g[i][j], g[(i + 1) % seg][j], g[(i + 1) % seg][(j + 1) % sseg], g[i][(j + 1) % sseg]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(nom); bm.to_mesh(me); bm.free(); _fini(me, True, 80)
    ob = bpy.data.objects.new(nom, me); ob.location = G(*c)
    if axe == 'x': ob.rotation_euler = (0, 0, math.pi / 2)
    elif axe == 'z': ob.rotation_euler = (math.pi / 2, 0, 0)
    if mat: me.materials.append(mat)
    if coul: ob.color = coul
    return poser(ob, coll)

def tissu(nom, x0, x1, y0, y1, zfn, mat, coll='fond', nx=8, ny=40, vertical=False, ypos=0.0):
    """une nappe : à plat (x0..x1, y0..y1, hauteur zfn(u, v)) ou pendue (vertical : x0..x1, z de y0 à y1, avancée zfn)"""
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap'); grid = []
    for j in range(ny + 1):
        row = []
        for i in range(nx + 1):
            u, v = i / nx, j / ny
            if vertical: p = Vector((x0 + (x1 - x0) * u, -(ypos + zfn(u, v)), y0 + (y1 - y0) * v))
            else: p = Vector((x0 + (x1 - x0) * u, -(y0 + (y1 - y0) * v), zfn(u, v)))
            row.append(bm.verts.new(p))
        grid.append(row)
    for j in range(ny):
        for i in range(nx):
            f = bm.faces.new((grid[j][i], grid[j][i + 1], grid[j + 1][i + 1], grid[j + 1][i]))
            for l, (a, b) in zip(f.loops, ((i, j), (i + 1, j), (i + 1, j + 1), (i, j + 1))):
                l[uvl].uv = (a / nx, (b / ny) if vertical else 1 - b / ny)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(nom); bm.to_mesh(me); bm.free(); _fini(me, True, 80)
    ob = bpy.data.objects.new(nom, me); me.materials.append(mat)
    return poser(ob, coll)

def transformer(objs, M):
    for o in objs: o.matrix_local = M @ o.matrix_local

def pivot_z(x, y, angle):
    """une rotation autour d'un axe vertical passant par (x, y du jeu)"""
    p = G(x, y, 0)
    return Matrix.Translation(p) @ Matrix.Rotation(angle, 4, 'Z') @ Matrix.Translation(-p)

def disque_uv(nom, cx, cy, r, zfn, mat, coll='fond', seg=48, anneaux=6, uvr=0.985):
    """un disque à plat (tapis rond) : l'image est posée dessus, centrée"""
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap'); rings = []
    c = bm.verts.new((cx, -cy, zfn(0, 0)))
    for k in range(1, anneaux + 1):
        rr = r * k / anneaux
        rings.append([bm.verts.new((cx + math.cos(i / seg * math.tau) * rr, -(cy + math.sin(i / seg * math.tau) * rr), zfn(rr, i / seg * math.tau))) for i in range(seg)])
    def uv(v): return (0.5 + (v.co.x - cx) / r * 0.5 * uvr, 0.5 + (v.co.y + cy) / r * 0.5 * uvr)
    for i in range(seg):
        j = (i + 1) % seg; f = bm.faces.new((c, rings[0][i], rings[0][j]))
        for l in f.loops: l[uvl].uv = uv(l.vert)
        for k in range(anneaux - 1):
            f = bm.faces.new((rings[k][i], rings[k + 1][i], rings[k + 1][j], rings[k][j]))
            for l in f.loops: l[uvl].uv = uv(l.vert)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(nom); bm.to_mesh(me); bm.free(); _fini(me, True, 80)
    if me.polygons[0].normal.z < 0: me.flip_normals()
    ob = bpy.data.objects.new(nom, me); me.materials.append(mat)
    return poser(ob, coll)

def fanion(nom, x0, x1, zb, zt, pointe, avance, mat, coll='fond', nx=10, ny=24, ypos=0.0):
    """une bannière pendue, taillée en pointe en bas"""
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap'); grid = []
    for j in range(ny + 1):
        row = []
        for i in range(nx + 1):
            u, v = i / nx, j / ny; bas = zb + pointe * abs(2 * u - 1); z = bas + (zt - bas) * v
            row.append((bm.verts.new((x0 + (x1 - x0) * u, -(ypos + avance(u, v)), z)), (u, (z - zb) / (zt - zb))))
        grid.append(row)
    for j in range(ny):
        for i in range(nx):
            q = (grid[j][i], grid[j][i + 1], grid[j + 1][i + 1], grid[j + 1][i]); f = bm.faces.new([a[0] for a in q])
            for l, a in zip(f.loops, q): l[uvl].uv = a[1]
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(nom); bm.to_mesh(me); bm.free(); _fini(me, True, 80)
    ob = bpy.data.objects.new(nom, me); me.materials.append(mat)
    return poser(ob, coll)
