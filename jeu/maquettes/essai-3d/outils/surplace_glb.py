# surplace_glb.py <in.glb> <out.glb> <mode> : enlève l'avancée du bassin (le mouvement reste sur place ; le jeu fait avancer le héros)
#   mode « droit » : on retire une avancée régulière en z (la course) ; mode « fixe » : x et z du bassin gelés (le virage)
import sys, numpy as np
sys.path.insert(0, '/tmp/luth'); from glb import GLB
g = GLB(sys.argv[1]); mode = sys.argv[3]; N = g.j['nodes']; an = g.j['animations'][0]
hips = [i for i, n in enumerate(N) if n.get('name') == 'Hips'][0]
for ch in an['channels']:
    if ch['target']['node'] != hips or ch['target']['path'] != 'translation': continue
    smp = an['samplers'][ch['sampler']]; t = g.lire(smp['input']).astype(float); v = g.lire(smp['output']).astype(float)
    if mode == 'droit':
        av = (v[-1, 2] - v[0, 2]) / (t[-1] - t[0]); v[:, 2] -= av * (t - t[0]); rep = N[hips].get('translation', [0, 0, 0]); v[:, 2] += rep[2] - v[:, 2].mean(); print('avancée retirée : %.1f cm/s (%.3f m/s), recentré' % (av, av / 100))
    else:
        rep = N[hips].get('translation', [0, 0, 0]); v[:, 0] = rep[0]; v[:, 2] = rep[2]; print('bassin gelé en x et z à sa place de repos', rep)
    a = g.j['accessors'][smp['output']]; bv = g.j['bufferViews'][a['bufferView']]
    off = bv.get('byteOffset', 0) + a.get('byteOffset', 0); st = bv.get('byteStride', 12)
    raw = v.astype(np.float32)
    for k in range(len(raw)): g.bin[off + k * st: off + k * st + 12] = raw[k].tobytes()
    if 'min' in a: a['min'] = raw.min(0).tolist(); a['max'] = raw.max(0).tolist()
g.ecrire(sys.argv[2])
