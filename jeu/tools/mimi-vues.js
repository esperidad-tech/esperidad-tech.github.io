/* Planche de Mimi dans ses huit vues, SANS navigateur (node + rsvg-convert) : pour regarder un dessin, une pose, un pas de la marche.
     node tools/mimi-vues.js <sortie.png> [scenario] [pelage] [taille]
   scenario (du JavaScript) : rend une liste de lignes ; une ligne = {titre, images:[{P, iv, t}]} ; aides : M, pose(nom), pas(P, phi, allure), geste(P, nom, u, o), VUES8.
   Sans scénario : debout, dans les huit vues ; puis huit temps de la marche dans cinq vues. */
const fs = require('fs'), path = require('path'), vm = require('vm'), cp = require('child_process');
const SRC = path.join(__dirname, '..', 'src');
const ctx = {window:{}, console, Math, Object, Array, String, parseInt, parseFloat, isNaN};
ctx.window.window = ctx.window;
vm.createContext(ctx);
['mimi-dessin.js', 'mimi-vues.js', 'mimi-pantin.js', 'mimi-gestes.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(SRC, f), 'utf8'), ctx, {filename:f}));
const M = ctx.window.MimiPantin;
const sortie = process.argv[2], scen = process.argv[3] || '', v = +(process.argv[4] || 0), T = +(process.argv[5] || 200);
const pose = (nom, plus) => M.pose(nom, plus);
const pas = (P, phi, all) => { M.pas(P, phi, 1, M.ALLURES[all || 'pas']); return P; };
const geste = (P, nom, u, o) => { const g = M.GESTES[nom]; g.f(P, u, u * (g.d || 1000) / 1000, {o:o || {}, m:{}, fixe:1}, null); return P; };
const VUES8 = [0, 1, 2, 3, 4, 5, 6, 7];
let lignes;
if(scen) lignes = new Function('M', 'pose', 'pas', 'geste', 'VUES8', scen)(M, pose, pas, geste, VUES8);
else {
  lignes = [{titre:'debout', images:VUES8.map(iv => ({P:pose('debout'), iv}))}];
  [0, 1, 2, 7, 6].forEach(iv => lignes.push({titre:'marche, vue ' + iv, images:[0, 1, 2, 3, 4, 5, 6, 7].map(k => ({P:pas(pose('debout'), k / 8), iv}))}));
}
const cols = Math.max(...lignes.map(l => l.images.length)), H = Math.round(T * M.H / M.W), W = T * cols, HT = (H + 16) * lignes.length;
let s = '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + HT + '" viewBox="0 0 ' + W + ' ' + HT + '"><defs>' + M.defs() + '</defs><rect width="100%" height="100%" fill="#3a2f55"/>';
lignes.forEach((l, li) => {
  const y0 = li * (H + 16);
  s += '<text x="6" y="' + (y0 + 12) + '" font-family="sans-serif" font-size="11" fill="#fff">' + l.titre + '</text>';
  l.images.forEach((im, ci) => {
    const k = T / M.W;
    s += '<g transform="translate(' + (ci * T) + ',' + (y0 + 16) + ')"><rect width="' + T + '" height="' + H + '" fill="#4a3c6a"/><rect y="' + ((M.Y0 + 2) * k) + '" width="' + T + '" height="' + (H - (M.Y0 + 2) * k) + '" fill="#7a4f30"/>' +
      '<g transform="scale(' + k + ')">' + M.dessin(v, im.P, {}, im.iv === undefined ? 0 : im.iv) + '</g>' + (im.t ? '<text x="4" y="' + (H - 4) + '" font-family="sans-serif" font-size="10" fill="#fff">' + im.t + '</text>' : '') + '</g>';
  });
});
s += '</svg>';
const svg = sortie.replace(/\.png$/, '.svg');
fs.writeFileSync(svg, s.replace(/ data-m="[^"]*"/g, '').replace(/class="at-zzz[^"]*"/g, ''));
cp.execFileSync('rsvg-convert', ['-o', sortie, svg]);
console.log(sortie, W + 'x' + HT);
