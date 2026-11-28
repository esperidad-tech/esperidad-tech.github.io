// rigide.mjs <entrée.glb> <sortie.glb> : l'armure en plaques rigides. Chaque triangle n'obéit plus qu'à un seul os (celui qui
// tire le plus sur ses trois coins) ; les coins partagés entre deux pièces sont dédoublés : aux jointures, les pièces tournent
// l'une contre l'autre au lieu de s'étirer comme du caoutchouc. Le buste (Spine, Spine01, Spine02 : chez Meshy, Spine est le haut)
// ne fait qu'une cuirasse ; le haut de la poitrine que Meshy donne aux clavicules (à moins de 0,30 m du milieu) va aussi à la
// cuirasse : sinon elle se fendrait en deux quand il écarte les bras. Les épaulières et leurs lanternes suivent les clavicules.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
const [ent, sor] = process.argv.slice(2);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(ent);
const root = doc.getRoot(), skin = root.listSkins()[0], joints = skin.listJoints().map(j => j.getName());
const FUSION = { Spine01: 'Spine', Spine02: 'Spine', headfront: 'Head', neck: 'Head' };   // (la cuirasse d'un bloc ; le casque d'un bloc)
const CLAV = ['LeftShoulder', 'RightShoulder'], MILIEU = 0.30;
const idx = n => joints.indexOf(FUSION[n] || n);
for (const mesh of root.listMeshes()) for (const prim of mesh.listPrimitives()) {
  const J = prim.getAttribute('JOINTS_0'), W = prim.getAttribute('WEIGHTS_0'), I = prim.getIndices(), P = prim.getAttribute('POSITION'), p3 = [0, 0, 0];
  const nv = J.getCount(), j4 = [0, 0, 0, 0], w4 = [0, 0, 0, 0];
  // l'os qui tire le plus sur chaque sommet (après fusion des os du buste)
  const dom = new Int32Array(nv);
  for (let v = 0; v < nv; v++) {
    J.getElement(v, j4); W.getElement(v, w4); const acc = new Map();
    for (let k = 0; k < 4; k++) if (w4[k] > 0) { const g = idx(joints[j4[k]]); acc.set(g, (acc.get(g) || 0) + w4[k]); }
    let best = j4[0], bw = -1; for (const [g, w] of acc) if (w > bw) { bw = w; best = g; }
    if (CLAV.includes(joints[best])) { P.getElement(v, p3); if (Math.abs(p3[0]) < MILIEU) best = idx('Spine'); }
    dom[v] = best;
  }
  // chaque triangle : l'os de la majorité de ses coins (à égalité : celui du plus lourd des trois)
  const ind = I.getArray(), nt = ind.length / 3, triG = new Int32Array(nt);
  for (let t = 0; t < nt; t++) { const a = dom[ind[3 * t]], b = dom[ind[3 * t + 1]], c = dom[ind[3 * t + 2]]; triG[t] = (a === b || a === c) ? a : (b === c ? b : a); }
  // dédoubler les sommets partagés par des pièces différentes
  const cle = new Map(), src = []; const nouv = new Uint32Array(ind.length);
  for (let t = 0; t < nt; t++) for (let k = 0; k < 3; k++) {
    const v = ind[3 * t + k], g = triG[t], key = v * 64 + g; let n = cle.get(key);
    if (n === undefined) { n = src.length; cle.set(key, n); src.push([v, g]); } nouv[3 * t + k] = n;
  }
  for (const nom of prim.listSemantics()) {
    const A = prim.getAttribute(nom), sz = A.getElementSize(), old = A.getArray(), C = old.constructor, arr = new C(src.length * sz);
    if (nom === 'JOINTS_0') src.forEach(([v, g], i) => { arr[i * 4] = g; });
    else if (nom === 'WEIGHTS_0') src.forEach(([v, g], i) => { arr[i * 4] = 1; });
    else src.forEach(([v], i) => { for (let k = 0; k < sz; k++) arr[i * sz + k] = old[v * sz + k]; });
    A.setArray(arr);
  }
  I.setArray(src.length > 65535 ? nouv : new Uint16Array(nouv));
  const compte = new Map(); for (let t = 0; t < nt; t++) compte.set(joints[triG[t]], (compte.get(joints[triG[t]]) || 0) + 1);
  console.log('sommets', nv, '→', src.length, '; triangles par pièce :', [...compte].sort((a, b) => b[1] - a[1]).map(([n, c]) => n + ' ' + c).join(', '));
}
await io.write(sor, doc);
