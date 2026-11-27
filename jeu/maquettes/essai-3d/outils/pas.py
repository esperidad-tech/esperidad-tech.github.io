# vitesse des pieds d'un mouvement (pour que les pieds ne glissent pas) : cinématique directe sur le squelette
import numpy as np, sys
from scipy.spatial.transform import Rotation as Rot
sys.path.insert(0, '/tmp/luth'); from glb import GLB
def etudier(f):
    g = GLB(f); N = g.j['nodes']; an = g.j['animations'][0]
    par = {}
    for i, n in enumerate(N):
        for c in n.get('children', []): par[c] = i
    idx = {n.get('name'): i for i, n in enumerate(N)}
    pistes = {}
    for ch in an['channels']:
        smp = an['samplers'][ch['sampler']]; pistes[(ch['target']['node'], ch['target']['path'])] = (g.lire(smp['input']), g.lire(smp['output']))
    T = pistes[(idx['Hips'], 'rotation')][0]; dur = T[-1]
    ts = np.linspace(T[0], dur, 240)
    def val(i, path, t, dflt):
        if (i, path) not in pistes: return np.array(N[i].get(path, dflt), float)
        tt, vv = pistes[(i, path)]; k = np.searchsorted(tt, t).clip(1, len(tt) - 1); a = (t - tt[k - 1]) / max(1e-9, tt[k] - tt[k - 1]); a = np.clip(a, 0, 1)
        if path == 'rotation': return Rot.from_quat([vv[k - 1], vv[k]]).as_quat()[0] * (1 - a) + Rot.from_quat([vv[k - 1], vv[k]]).as_quat()[1] * a
        return vv[k - 1] * (1 - a) + vv[k] * a
    def M(i, t):
        m = np.eye(4); r = val(i, 'rotation', t, [0, 0, 0, 1]); r = r / np.linalg.norm(r)
        m[:3, :3] = Rot.from_quat(r).as_matrix() @ np.diag(val(i, 'scale', t, [1, 1, 1])); m[:3, 3] = val(i, 'translation', t, [0, 0, 0]); return m
    def W(i, t):
        m = M(i, t)
        while i in par: i = par[i]; m = M(i, t) @ m
        return m[:3, 3]
    res = {}
    for pied in ('LeftToeBase', 'RightToeBase', 'LeftFoot'):
        P = np.array([W(idx[pied], t) for t in ts]); res[pied] = P
    P = res['LeftToeBase']; h = P[:, 1]; v = np.gradient(P[:, 2], ts)
    sol = h < h.min() + 0.015
    print(f, 'durée %.2f' % dur, 'hauteur pied min %.3f max %.3f' % (h.min(), h.max()), 'vitesse au sol (z) médiane %.2f m/s' % np.median(v[sol]))
    # nombre de pas : passages au sol
    d = np.diff(sol.astype(int)); print('  posés au sol (gauche) :', (d == 1).sum(), 'fois ; z min/max du pied %.2f %.2f' % (P[:, 2].min(), P[:, 2].max()))
for f in sys.argv[1:]: etudier(f)
