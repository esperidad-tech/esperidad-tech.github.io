# Le luth détaché du Barde : le corps (avec les trous bouchés) et le luth à part (rigide, bouché aussi).
# python3 chirurgie.py <barde.glb> <sortie.glb>
import numpy as np, sys, triangle as tr
from collections import defaultdict
sys.path.insert(0, '/tmp/luth'); from glb import GLB
g = GLB(sys.argv[1]); prim = g.j['meshes'][0]['primitives'][0]; A = prim['attributes']
P = g.lire(A['POSITION']).astype(float); N = g.lire(A['NORMAL']).astype(float); UV = g.lire(A['TEXCOORD_0']).astype(float)
TG = g.lire(A['TANGENT']).astype(float); J = g.lire(A['JOINTS_0']); W = g.lire(A['WEIGHTS_0']).astype(float)
I = g.lire(prim['indices']).astype(int).reshape(-1, 3)
luth = np.load('/tmp/luth/luth_tri.npy')
key = np.round(P / 2e-5).astype(np.int64); _, wid = np.unique(key, axis=0, return_inverse=True); wid = wid.ravel()
# 1) ne garder que le grand morceau du luth (les triangles isolés retournent au corps)
arete = defaultdict(list)
for k in np.where(luth)[0]:
    a, b, c = wid[I[k]]
    for e in ((a, b), (b, c), (c, a)): arete[tuple(sorted(e))].append(k)
voisin = defaultdict(set)
for ks in arete.values():
    for x in ks:
        voisin[x].update(ks)
vus = set(); comps = []
for k in np.where(luth)[0]:
    if k in vus: continue
    st = [k]; vus.add(k); c = []
    while st:
        x = st.pop(); c.append(x)
        for y in voisin[x]:
            if y not in vus: vus.add(y); st.append(y)
    comps.append(c)
comps.sort(key=len, reverse=True); print('morceaux du luth', [len(c) for c in comps[:6]])
luth[:] = False; luth[comps[0]] = True
for c in comps[1:]:
    if len(c) > 50: luth[c] = True
# 1 bis) les morceaux du corps qui ne tenaient qu'au luth (le bout du manche) passent au luth
def composantes(ks):
    ar = defaultdict(list)
    for k in ks:
        a, b, c = wid[I[k]]
        for e in ((a, b), (b, c), (c, a)): ar[tuple(sorted(e))].append(k)
    vo = defaultdict(set)
    for l in ar.values():
        for x in l: vo[x].update(l)
    vus = set(); res = []
    for k in ks:
        if k in vus: continue
        st = [k]; vus.add(k); c = []
        while st:
            x = st.pop(); c.append(x)
            for y in vo[x]:
                if y not in vus: vus.add(y); st.append(y)
        res.append(c)
    return sorted(res, key=len, reverse=True)
cc = composantes(list(np.where(~luth)[0])); print('morceaux du corps', [len(c) for c in cc[:6]])
for c in cc[1:]:
    if len(c) < 3000: luth[c] = True
# 2) les bords (boucles ordonnées) d'un ensemble de triangles
def boucles(tris):
    cnt = defaultdict(int); orient = {}
    for t in tris:
        for a, b in ((t[0], t[1]), (t[1], t[2]), (t[2], t[0])):
            e = tuple(sorted((wid[a], wid[b]))); cnt[e] += 1; orient[e] = (a, b)
    dep = defaultdict(list)
    for e, n in cnt.items():
        if n == 1: a, b = orient[e]; dep[wid[a]].append((a, b))
    res = []
    while True:
        s0 = next((v for v, l in dep.items() if l), None)
        if s0 is None: break
        boucle = []; x = s0
        while dep[x]:
            a, b = dep[x].pop(); boucle.append(a); x = wid[b]
            if x == s0: break
        res.append(boucle)
    return res
def croisements(p):
    n = len(p); o = lambda p_, q, r: np.sign((q[0] - p_[0]) * (r[1] - p_[1]) - (q[1] - p_[1]) * (r[0] - p_[0]))
    for i in range(n):
        for j in range(i + 2, n):
            if i == 0 and j == n - 1: continue
            a_, b_, c_, d_ = p[i], p[(i + 1) % n], p[j], p[(j + 1) % n]
            if o(a_, b_, c_) * o(a_, b_, d_) < 0 and o(c_, d_, a_) * o(c_, d_, b_) < 0: return (i, j)
    return None
def demeler(p):
    """petits plis du contour vu à plat : on retourne l'ordre (des positions à plat seulement) du plus court bout"""
    p = p.copy(); n = len(p)
    if len(np.unique(np.round(p, 7), axis=0)) < n: p = p + np.random.default_rng(0).normal(0, 1e-6, p.shape)
    for it in range(60):
        c = croisements(p)
        if c is None: return p
        i, j = c
        if j - i <= n - (j - i): idx = np.arange(i + 1, j + 1)
        else: idx = np.arange(j + 1, i + n + 1) % n
        p[idx] = p[idx[::-1]]
    return None
def simple(p): return croisements(p) is None
F_DOS = np.load('/tmp/luth/dos_est.npy')
def dos_z(x, y):   # le dos deviné (vu de dos) : z glTF du dos en (x, y glTF)
    j = np.clip(np.round((y - 0.6) / 0.0025).astype(int), 0, 340); i = np.clip(np.round((x + 0.3) / 0.0025).astype(int), 0, 240)
    return -F_DOS[j, i]
def boucher(boucle, normale_ref, hauteur=False):
    """une boucle de sommets → positions (la boucle d'abord, puis les nouveaux) + triangles"""
    Q = P[boucle]; c = Q.mean(0); m = len(boucle); u, s, vt = np.linalg.svd(Q - c)
    seg = np.c_[np.arange(m), (np.arange(m) + 1) % m]
    cands = [vt[2], np.array([0, 0, 1.]), np.array([0, 1, 0.]), np.array([1, 0, 0.])]
    if hauteur: cands = [np.array([0, 0, 1.])] + cands
    for n in cands:
        e1 = np.cross(n, [0.3, 0.5, 0.8]); e1 /= np.linalg.norm(e1); e2 = np.cross(n, e1)
        p2 = demeler(np.c_[(Q - c) @ e1, (Q - c) @ e2])
        if p2 is not None: break
    else:
        print('  bord de', m, 'sommets : aucun côté sans croisement, éventail'); pos = np.vstack([Q, c])
        T = np.c_[np.arange(m), (np.arange(m) + 1) % m, np.full(m, m)]
        fn = np.cross(pos[T[:, 1]] - pos[T[:, 0]], pos[T[:, 2]] - pos[T[:, 0]])
        if (fn @ normale_ref).sum() < 0: T = T[:, ::-1]
        return pos, T, m + 1, m
    aire = max(1e-7, 0.5 * (np.ptp(p2[:, 0]) * np.ptp(p2[:, 1])) / max(m, 1))
    t = tr.triangulate({'vertices': p2, 'segments': seg}, 'pq28a%.9fY' % aire)
    V2 = t['vertices']; T = t['triangles']; nv = len(V2)
    pos = np.zeros((nv, 3)); pos[:m] = Q; pos[m:] = c + V2[m:, :1] * e1 + V2[m:, 1:] * e2
    if len(V2) > m: pos[m:] += (np.linalg.lstsq(np.c_[p2, np.ones(m)], Q - c - p2[:, :1] * e1 - p2[:, 1:] * e2, rcond=None)[0].T @ np.c_[V2[m:], np.ones(nv - m)].T).T
    vois = defaultdict(set)
    for a_, b_, c_ in T: vois[a_] |= {b_, c_}; vois[b_] |= {a_, c_}; vois[c_] |= {a_, b_}
    if hauteur: pos[m:, 2] = dos_z(pos[m:, 0], pos[m:, 1])
    for it in range(150 if hauteur else 300):
        for v in range(m, nv):
            moy = pos[list(vois[v])].mean(0)
            if hauteur: moy[2] = 0.5 * moy[2] + 0.5 * dos_z(np.array([moy[0]]), np.array([moy[1]]))[0]
            pos[v] = moy
    fn = np.cross(pos[T[:, 1]] - pos[T[:, 0]], pos[T[:, 2]] - pos[T[:, 0]])
    if (fn @ normale_ref).sum() < 0: T = T[:, ::-1]
    print('  bord de', m, 'sommets bouché :', len(T), 'triangles, vu selon', np.round(n, 2))
    return pos, T, nv, m
from PIL import Image
import io
def _image_couleur():
    t = g.j['textures'][g.j['materials'][0]['pbrMetallicRoughness']['baseColorTexture']['index']]
    src = t.get('source', t.get('extensions', {}).get('EXT_texture_webp', {}).get('source'))
    bv = g.j['bufferViews'][g.j['images'][src]['bufferView']]
    return np.asarray(Image.open(io.BytesIO(bytes(g.bin[bv.get('byteOffset', 0):bv.get('byteOffset', 0) + bv['byteLength']]))).convert('RGB')).astype(float)
TEX = _image_couleur(); TH, TW = TEX.shape[:2]
def texel(uv): return TEX[np.clip((uv[:, 1] % 1) * TH, 0, TH - 1).astype(int), np.clip((uv[:, 0] % 1) * TW, 0, TW - 1).astype(int)]
TRI_C = P[I].mean(1); TRI_UV = UV[I].mean(1); TRI_N = N[I].mean(1)
def _choix(cand_t):
    col = texel(TRI_UV[cand_t])
    from scipy.cluster.vq import kmeans2
    cen, lab = kmeans2(col, 3, seed=1, minit='++'); cible = cen[np.bincount(lab, minlength=3).argmax()]
    k = cand_t[np.argmin(np.linalg.norm(col - cible, axis=1))]
    return TRI_UV[k], cible
def uv_miroir(boucle, garde_v):
    """pour le dos : la couleur de la chemise (le groupe de couleurs du dos le plus « rouge-violet »), prise au milieu d'un triangle"""
    cand = np.where((TRI_N[:, 2] < -0.4) & (TRI_C[:, 1] > 0.8) & (TRI_C[:, 1] < 1.08) & (np.abs(TRI_C[:, 0]) < 0.2) & ~luth)[0]
    col = texel(TRI_UV[cand])
    from scipy.cluster.vq import kmeans2
    cen, lab = kmeans2(col, 4, seed=1, minit='++'); k_ = np.argmax(cen[:, 0] - cen[:, 1] + 0.3 * cen[:, 2]); cible = cen[k_]
    k = cand[np.argmin(np.linalg.norm(col - cible, axis=1))]
    return TRI_UV[k], cible
def uv_assorti(boucle, garde_v, rayon=0.05):
    Q = P[boucle]; d = np.min(np.linalg.norm(TRI_C[:, None, :] - Q[None, ::max(1, len(Q) // 40), :], axis=2), axis=1)
    cand = np.where((d < rayon) & luth)[0]
    if len(cand) < 5: cand = np.where(d < rayon)[0]
    return _choix(cand)
def attributs_nouveaux(pos, T, boucle, m, peau, uv_piece=None):
    nv = len(pos); idx = np.array(boucle)
    nrm = np.zeros((nv, 3))
    fn = np.cross(pos[T[:, 1]] - pos[T[:, 0]], pos[T[:, 2]] - pos[T[:, 0]])
    for k in range(3): np.add.at(nrm, T[:, k], fn)
    nrm /= np.linalg.norm(nrm, axis=1, keepdims=True) + 1e-12
    # une seule couleur pour la pièce : celle du sommet du bord le plus proche du centre
    c = pos.mean(0); ref = idx[np.argmin(np.linalg.norm(P[idx] - c, axis=1))]
    uv = np.repeat((UV[ref] if uv_piece is None else uv_piece)[None], nv, 0)
    up = np.array([0, 1, 0.]); tg = np.cross(up, nrm); bad = np.linalg.norm(tg, axis=1) < 1e-4; tg[bad] = np.cross([1, 0, 0.], nrm[bad])
    tg /= np.linalg.norm(tg, axis=1, keepdims=True); tg = np.c_[tg, np.ones(nv)]
    if not peau: return nrm, uv, tg, None, None
    # os et poids : ceux du sommet du bord le plus proche
    near = idx[np.argmin(np.linalg.norm(P[idx][None, :, :] - pos[:, None, :], axis=2), axis=1)]
    return nrm, uv, tg, J[near], W[near]
def construire(tris_garde, peau, ref_dir, hauteur=False):
    """garde ces triangles, bouche leurs trous ; renvoie les tableaux (sommets d'origine utilisés + nouveaux)"""
    bl = boucles(tris_garde); print('trous', [len(b) for b in bl])
    used = np.unique(tris_garde); remap = -np.ones(len(P), int); remap[used] = np.arange(len(used))
    pos_l = [P[used]]; nrm_l = [N[used]]; uv_l = [UV[used]]; tg_l = [TG[used]]; j_l = [J[used]]; w_l = [W[used]]
    tris = [remap[tris_garde]]; base = len(used)
    for b in bl:
        if len(b) < 3 or len(set(wid[b])) < 3: continue
        Q = P[b]; cen = Q.mean(0)
        nref = ref_dir(cen, b)
        pos, T, nv, m = boucher(b, nref, hauteur and len(b) > 60)
        uvp, coul = (uv_miroir if peau else uv_assorti)(b, used)
        print('  couleur de la pièce', coul.round())
        nrm, uv, tg, jj, ww = attributs_nouveaux(pos, T, b, m, peau, uvp)
        # les sommets du bord sont repris (mêmes positions, nouvelle copie pour une couleur unie)
        pos_l.append(pos); nrm_l.append(nrm); uv_l.append(uv); tg_l.append(tg)
        if peau: j_l.append(jj); w_l.append(ww)
        tris.append(T + base); base += nv
    out = dict(pos=np.vstack(pos_l), nrm=np.vstack(nrm_l), uv=np.vstack(uv_l), tg=np.vstack(tg_l), tri=np.vstack(tris))
    if peau: out['j'] = np.vstack(j_l); out['w'] = np.vstack(w_l)
    return out
# normale de référence : pour le corps, la moyenne des normales du bord ; pour le luth, l'opposé (le trou du luth regarde le dos)
corps = construire(I[~luth], True, lambda c, b: N[b].mean(0), True)
lu = construire(I[luth], False, lambda c, b: -N[b].mean(0))
print('corps', len(corps['pos']), 'sommets', len(corps['tri']), 'triangles ; luth', len(lu['pos']), len(lu['tri']))
# 3) écrire : le corps remplace l'ancien, le luth devient un objet à part (à la racine de la scène)
ARR = 34962; ELEM = 34963
prim['attributes'] = {'POSITION': g.ajouter(corps['pos'], 'VEC3', 5126, ARR, True), 'NORMAL': g.ajouter(corps['nrm'], 'VEC3', 5126, ARR),
    'TEXCOORD_0': g.ajouter(corps['uv'], 'VEC2', 5126, ARR), 'TANGENT': g.ajouter(corps['tg'], 'VEC4', 5126, ARR),
    'JOINTS_0': g.ajouter(corps['j'], 'VEC4', 5121, ARR), 'WEIGHTS_0': g.ajouter(corps['w'], 'VEC4', 5126, ARR)}
prim['indices'] = g.ajouter(corps['tri'].ravel(), 'SCALAR', 5125 if len(corps['pos']) > 65535 else 5123, ELEM)
pl = {'attributes': {'POSITION': g.ajouter(lu['pos'], 'VEC3', 5126, ARR, True), 'NORMAL': g.ajouter(lu['nrm'], 'VEC3', 5126, ARR),
    'TEXCOORD_0': g.ajouter(lu['uv'], 'VEC2', 5126, ARR), 'TANGENT': g.ajouter(lu['tg'], 'VEC4', 5126, ARR)},
    'indices': g.ajouter(lu['tri'].ravel(), 'SCALAR', 5123, ELEM), 'material': prim['material'], 'mode': 4}
g.j['meshes'].append({'name': 'luth', 'primitives': [pl]})
g.j['nodes'].append({'name': 'luth', 'mesh': len(g.j['meshes']) - 1})
g.j['scenes'][0]['nodes'].append(len(g.j['nodes']) - 1)
g.ecrire(sys.argv[2]); print('écrit', sys.argv[2])
