// raidir.mjs <entrée.glb> <sortie.glb> <k> : des plaques plus raides, sans rien déchirer. Les poids de chaque sommet sont
// « durcis » (élevés à la puissance k puis renormalisés) : loin des jointures, chaque plaque n'obéit presque plus qu'à un os ;
// le pli reste près des jointures, et la peau reste d'un seul tenant. Le buste d'un bloc (Spine, Spine01, Spine02 → Spine) ;
// le haut de la poitrine que Meshy donne aux clavicules (à moins de 0,30 m du milieu) passe à la cuirasse.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
const [ent, sor, K] = process.argv.slice(2); const k = +(K || 4);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(ent);
const root = doc.getRoot(), joints = root.listSkins()[0].listJoints().map(j => j.getName());
const FUSION = { Spine01: 'Spine', Spine02: 'Spine', headfront: 'Head', neck: 'Head' }, CLAV = ['LeftShoulder', 'RightShoulder'], MILIEU = 0.30;
const idx = n => joints.indexOf(FUSION[n] || n);
for (const mesh of root.listMeshes()) for (const prim of mesh.listPrimitives()) {
  const J = prim.getAttribute('JOINTS_0'), W = prim.getAttribute('WEIGHTS_0'), P = prim.getAttribute('POSITION');
  const j4 = [0, 0, 0, 0], w4 = [0, 0, 0, 0], p3 = [0, 0, 0];
  for (let v = 0; v < J.getCount(); v++) {
    J.getElement(v, j4); W.getElement(v, w4); P.getElement(v, p3); const acc = new Map();
    for (let i = 0; i < 4; i++) if (w4[i] > 0) { let g = idx(joints[j4[i]]); if (CLAV.includes(joints[g]) && Math.abs(p3[0]) < MILIEU) g = idx('Spine'); acc.set(g, (acc.get(g) || 0) + w4[i]); }
    const e = [...acc].map(([g, w]) => [g, Math.pow(w, k)]).sort((a, b) => b[1] - a[1]).slice(0, 4), s = e.reduce((a, [, w]) => a + w, 0);
    for (let i = 0; i < 4; i++) { j4[i] = e[i] ? e[i][0] : 0; w4[i] = e[i] ? e[i][1] / s : 0; }
    J.setElement(v, j4); W.setElement(v, w4);
  }
}
await io.write(sor, doc); console.log('raidi, k =', k);
