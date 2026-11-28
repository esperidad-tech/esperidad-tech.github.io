// recaler.mjs <mouvement source.glb> <modèle cible.glb> <sortie.glb>
// Transfère un mouvement d'un squelette Meshy à un autre de mêmes os, mais d'une autre taille et aux poses de repos un peu
// différentes (Higgsfield ne prend plus la hauteur du personnage : ses squelettes sortent à 1,70 m, nos modèles font 3 m et 1,50 m).
// Chaque os tourne, dans le repère de l'armature, du même angle que dans la source, à partir de SA pose de repos ;
// le bassin se déplace comme dans la source, à l'échelle de la cible (rapport des hauteurs du bassin) ; les autres os gardent
// leurs longueurs (les pistes de position et d'échelle sont retirées).
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune } from '@gltf-transform/functions';
const [src, cib, sor] = process.argv.slice(2);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const S = await io.read(src), C = await io.read(cib);

const mul = (a, b) => [a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1], a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0], a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3], a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]];
const inv = q => [-q[0], -q[1], -q[2], q[3]];
const norm = q => { const l = Math.hypot(...q) || 1; return q.map(v => v / l); };
const slerp = (a, b, u) => { let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]; if (d < 0) { b = b.map(v => -v); d = -d; }
  if (d > 0.9995) return norm(a.map((v, i) => v + (b[i] - v) * u)); const th = Math.acos(d), s = Math.sin(th);
  return a.map((v, i) => (Math.sin((1 - u) * th) * v + Math.sin(u * th) * b[i]) / s); };

function squelette(doc) {   // les os sous « Hips » : nom -> { node, parent (nom ou null) }
  const nodes = doc.getRoot().listNodes(), hips = nodes.find(n => n.getName() === 'Hips'), os = new Map();
  const visiter = (n, p) => { os.set(n.getName(), { node: n, parent: p }); for (const c of n.listChildren()) visiter(c, n.getName()); };
  visiter(hips, null); return os;
}
const OS = squelette(S), OC = squelette(C), ordre = [...OS.keys()].filter(n => OC.has(n));
function mondeRepos(os) { const W = new Map(); for (const [n, o] of os) { const l = o.node.getRotation(); W.set(n, o.parent ? norm(mul(W.get(o.parent), l)) : l); } return W; }
const WSr = mondeRepos(OS), WCr = mondeRepos(OC);

const anim = S.getRoot().listAnimations()[0];
const pistes = {}; for (const ch of anim.listChannels()) { const n = ch.getTargetNode().getName(); (pistes[n] ||= {})[ch.getTargetPath()] = ch; }
const temps = Array.from(pistes.Hips.rotation.getSampler().getInput().getArray());
function lire(ch, t, k) {   // valeur d'une piste au temps t (k composantes), interpolation linéaire / sphérique
  const s = ch.getSampler(), ti = s.getInput().getArray(), v = s.getOutput().getArray();
  let i = 0; while (i < ti.length - 1 && ti[i + 1] < t) i++;
  const j = Math.min(i + 1, ti.length - 1), u = j === i ? 0 : Math.min(1, Math.max(0, (t - ti[i]) / (ti[j] - ti[i])));
  const a = Array.from(v.slice(i * k, i * k + k)), b = Array.from(v.slice(j * k, j * k + k));
  return k === 4 ? slerp(a, b, u) : a.map((x, q) => x + (b[q] - x) * u);
}
const sortie = Object.fromEntries(ordre.map(n => [n, []])), bassin = [];
const TSr = OS.get('Hips').node.getTranslation(), TCr = OC.get('Hips').node.getTranslation(), k = TCr[1] / TSr[1];
for (const t of temps) {
  const WS = new Map(), WC = new Map();
  for (const n of ordre) {
    const o = OS.get(n), q = pistes[n] && pistes[n].rotation ? lire(pistes[n].rotation, t, 4) : o.node.getRotation();
    WS.set(n, o.parent ? norm(mul(WS.get(o.parent), q)) : q);
    const D = mul(WS.get(n), inv(WSr.get(n))), wc = norm(mul(D, WCr.get(n)));
    WC.set(n, wc); const p = OC.get(n).parent;
    sortie[n].push(...norm(p ? mul(inv(WC.get(p)), wc) : wc));
  }
  const T = lire(pistes.Hips.translation, t, 3); bassin.push(...TCr.map((r, i) => r + (T[i] - TSr[i]) * k));
}
// on réécrit le mouvement : rotations transférées, position du bassin à l'échelle ; plus aucune autre piste
for (const ch of anim.listChannels()) {
  const n = ch.getTargetNode().getName(), p = ch.getTargetPath(), s = ch.getSampler();
  if (p === 'rotation' && sortie[n]) { s.getInput().setArray(new Float32Array(temps)); s.getOutput().setArray(new Float32Array(sortie[n])); s.setInterpolation('LINEAR'); }
  else if (p === 'translation' && n === 'Hips') { s.getInput().setArray(new Float32Array(temps)); s.getOutput().setArray(new Float32Array(bassin)); s.setInterpolation('LINEAR'); }
  else { ch.dispose(); s.dispose(); }
}
// (chaque piste a désormais son propre tableau de temps : on ne les partage plus)
for (const ch of anim.listChannels()) { const s = ch.getSampler(), a = s.getInput(); if (a.listParents().length > 2) s.setInput(a.clone()); }
await S.transform(prune());
await io.write(sor, S);
console.log('recalé :', ordre.length, 'os ;', temps.length, 'images ;', (temps[temps.length - 1]).toFixed(2), 's ; bassin ×', k.toFixed(3));
