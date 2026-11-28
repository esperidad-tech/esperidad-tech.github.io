import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(process.argv[2]); const root = doc.getRoot(), joints = root.listSkins()[0].listJoints().map(j => j.getName());
const boites = { 'lanterne G (x>0)': [0.40, 0.80, 2.25, 2.95], 'lanterne D (x<0)': [-0.80, -0.40, 2.25, 2.95], 'épaulière D': [-0.95, -0.45, 1.85, 2.25], 'aisselle D': [-0.55, -0.30, 1.55, 1.95] };
for (const [nom, [xa, xb, ya, yb]] of Object.entries(boites)) {
  const c = {}; let n = 0;
  for (const mesh of root.listMeshes()) for (const prim of mesh.listPrimitives()) {
    const J = prim.getAttribute('JOINTS_0'), W = prim.getAttribute('WEIGHTS_0'), P = prim.getAttribute('POSITION'); const j4 = [0,0,0,0], w4 = [0,0,0,0], p = [0,0,0];
    for (let v = 0; v < P.getCount(); v++) { P.getElement(v, p); if (p[0] < xa || p[0] > xb || p[1] < ya || p[1] > yb) continue; J.getElement(v, j4); W.getElement(v, w4); n++;
      for (let i = 0; i < 4; i++) if (w4[i] > 0.01) c[joints[j4[i]]] = (c[joints[j4[i]]] || 0) + w4[i]; }
  }
  console.log(nom, n, 'sommets :', Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, w]) => k + ' ' + (100 * w / n).toFixed(0) + '%').join(', '));
}
