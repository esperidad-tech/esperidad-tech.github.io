// raidir2.mjs <entrée.glb> <sortie.glb> <k> <x0> <x1> <kSeam> : comme raidir.mjs, mais l'épaule n'est plus collée au buste quand il lève le bras.
// - Le buste d'un bloc (Spine, Spine01, Spine02 → Spine), la tête d'un bloc.
// - Ce que Meshy donne aux clavicules : la plaque de poitrine (près du milieu, |x| < x0) passe au buste (sinon son bord s'étire quand il tend
//   les bras) ; l'épaule et sa lanterne (|x| > x1) restent à la clavicule, qui pivote un peu avec le bras ; entre les deux, un fondu.
// - Les poids sont durcis (puissance k) pour garder les plaques raides, sauf à la jonction bras / épaule (puissance kSeam, plus souple) :
//   bras levé au-dessus de la tête, l'étirement se répartit au lieu de tout tirer sur une seule rangée de triangles.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
const [ent, sor, K, X0, X1, KS] = process.argv.slice(2); const k = +(K || 6), x0 = +(X0 || 0.30), x1 = +(X1 || 0.45), ks = +(KS || 2);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(ent);
const root = doc.getRoot(), joints = root.listSkins()[0].listJoints().map(j => j.getName());
const FUSION = { Spine01: 'Spine', Spine02: 'Spine', headfront: 'Head', neck: 'Head' }, CLAV = ['LeftShoulder', 'RightShoulder'], BRAS = ['LeftArm', 'RightArm'];
const idx = n => joints.indexOf(FUSION[n] || n), sp = idx('Spine');
const lisse = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
let nS = 0;
for (const mesh of root.listMeshes()) for (const prim of mesh.listPrimitives()) {
  const J = prim.getAttribute('JOINTS_0'), W = prim.getAttribute('WEIGHTS_0'), P = prim.getAttribute('POSITION');
  const j4 = [0, 0, 0, 0], w4 = [0, 0, 0, 0], p3 = [0, 0, 0];
  for (let v = 0; v < J.getCount(); v++) {
    J.getElement(v, j4); W.getElement(v, w4); P.getElement(v, p3); const acc = new Map(), f = lisse(x0, x1, Math.abs(p3[0]));
    const add = (g, w) => acc.set(g, (acc.get(g) || 0) + w);
    for (let i = 0; i < 4; i++) if (w4[i] > 0) { const g = idx(joints[j4[i]]); if (CLAV.includes(joints[g])) { add(g, w4[i] * f); add(sp, w4[i] * (1 - f)); } else add(g, w4[i]); }
    // les lanternes des épaules (haut et côtés du modèle au repos) : d'un seul bloc, sur la clavicule de leur côté (Meshy les partageait
    // moitié clavicule, moitié bras : bras levé, la lanterne se déchirait) ; un fondu à leur pied, sur l'épaulière qui suit le bras
    const fl = lisse(0.34, 0.40, Math.abs(p3[0])) * lisse(2.16, 2.30, p3[1]);
    if (fl > 0) { const cl = idx(p3[0] > 0 ? 'LeftShoulder' : 'RightShoulder'); for (const g of [...acc.keys()]) acc.set(g, acc.get(g) * (1 - fl)); add(cl, fl); }
    // l'épaulière (sous la lanterne, sur le côté) : un peu plus à l'épaule, pour que, bras levé, elle ne tire pas tout le flanc avec elle
    const fe = 0.35 * lisse(0.40, 0.50, Math.abs(p3[0])) * lisse(1.70, 1.90, p3[1]) * (1 - lisse(2.16, 2.30, p3[1]));
    if (fe > 0) { const cl = idx(p3[0] > 0 ? 'LeftShoulder' : 'RightShoulder'); for (const g of [...acc.keys()]) acc.set(g, acc.get(g) * (1 - fe)); add(cl, fe); }
    const noms = [...acc.keys()].map(g => joints[g]), seam = noms.some(n => BRAS.includes(n)) && noms.some(n => CLAV.includes(n) || n === 'Spine');
    const kk = seam ? ks : k; if (seam) nS++;
    const e = [...acc].map(([g, w]) => [g, Math.pow(w, kk)]).sort((a, b) => b[1] - a[1]).slice(0, 4), s = e.reduce((a, [, w]) => a + w, 0);
    for (let i = 0; i < 4; i++) { j4[i] = e[i] ? e[i][0] : 0; w4[i] = e[i] ? e[i][1] / s : 0; }
    J.setElement(v, j4); W.setElement(v, w4);
  }
}
await io.write(sor, doc); console.log('raidi, k =', k, '; épaule', x0, '→', x1, '; jonction bras, k =', ks, '(', nS, 'sommets)');
