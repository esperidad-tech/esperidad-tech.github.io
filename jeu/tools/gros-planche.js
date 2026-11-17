/* Mimi en gros plan (mimi-gros.js), image fixe, SANS navigateur (node + jsdom + rsvg-convert) : la tête et les pattes, pour plusieurs
   pelages, yeux, habits et expressions.
     NODE_PATH=<node_modules avec jsdom> node tools/gros-planche.js <sortie.png> [taille] [scénarios]
   un scénario : "v=0;acc=helice;clos=1;regard=0.5,0;pup=0.8;langue=1;tilt=10" (séparés par « | ») */
const fs = require('fs'), path = require('path'), cp = require('child_process');
const {JSDOM} = require('jsdom');
const SRC = path.join(__dirname, '..', 'src');
const sortie = process.argv[2], T = +(process.argv[3] || 420);
const scen = (process.argv[4] || 'v=0|v=1|v=2|v=3|v=4|v=5|v=6|v=7').split('|');
const W = new JSDOM('<!DOCTYPE html><body></body>', {runScripts:'outside-only'}).window; W.requestAnimationFrame = () => 0;
['mimi-dessin.js', 'mimi-vues.js', 'mimi-pantin.js', 'mimi-gestes.js', 'mimi-habits.js', 'mimi-gros.js'].forEach(f => W.eval(fs.readFileSync(path.join(SRC, f), 'utf8')));
const M = W.MimiPantin;
let s = '', n = 0; const COLS = 4, H = Math.round(T * 1.0);
scen.forEach(sc => {
  const o = {}; sc.split(';').forEach(kv => { const [k, v] = kv.split('='); if(k) o[k.trim()] = v === undefined ? '1' : v.trim(); });
  const v = +(o.v || 0), acc = {cou:'', tete:''};
  (o.acc || '').split(',').filter(x => x).forEach(id => { const h = M.HABITS[id]; if(h){ if(h.slot === 'cou') acc.cou += M.habit(id); else acc.tete += M.habit(id); } });
  const d = W.document.createElement('div');
  const vb = o.vb || '-36 -44 72 64';
  d.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '">' + M.gros(v, acc) + '<rect x="-60" y="20" width="120" height="60" fill="#2b2238"/></svg>';
  const svg = d.querySelector('svg'), r = M.grosRig(svg);
  const E = {}; ['monte', 'tilt', 'pup', 'pau', 'clos', 'orG', 'orD', 'mou', 'gueule', 'langue', 'patG', 'patD', 'griG', 'griD'].forEach(k => { if(o[k] !== undefined) E[k] = +o[k]; });
  if(o.regard){ const q = o.regard.split(',').map(Number); E.lx = q[0]; E.ly = q[1]; }
  if(o.oreilles){ E.orG = E.orD = +o.oreilles; }
  Object.assign(r.E, E); r.appliquer(0);
  const x = (n % COLS) * T, y = Math.floor(n / COLS) * H; n++;
  s += '<rect x="' + x + '" y="' + y + '" width="' + T + '" height="' + H + '" fill="#6b5a86" stroke="#3a2f55"/>' +
    svg.outerHTML.replace('<svg ', '<svg x="' + x + '" y="' + y + '" width="' + T + '" height="' + H + '" ') +
    '<text x="' + (x + 6) + '" y="' + (y + 16) + '" font-family="sans-serif" font-size="13" fill="#fff">' + sc + '</text>';
});
const out = '<svg xmlns="http://www.w3.org/2000/svg" width="' + (COLS * T) + '" height="' + (Math.ceil(n / COLS) * H) + '">' + s + '</svg>';
fs.writeFileSync(sortie.replace(/\.png$/, '.svg'), out);
cp.execFileSync('rsvg-convert', [sortie.replace(/\.png$/, '.svg'), '-o', sortie]);
console.log(sortie, n, 'images');
