/* Une planche des habits rigolos de Mimi (mimi-habits.js), SANS navigateur (node + jsdom + rsvg-convert) :
   1) chaque habit sur sa tête, en grand ; 2) chaque habit sur elle, assise, en entier ; 3) quelques habits dans ses autres poses.
     NODE_PATH=<un dossier node_modules où jsdom est installé> node tools/habits-planche.js <sortie.png> [taille] [habit,habit…] [pelage]
   (Une image fixe : les petites animations, elles, se regardent dans le jeu — tools/mimi-habits.py.) */
const fs = require('fs'), path = require('path'), cp = require('child_process');
const {JSDOM} = require('jsdom');
const SRC = path.join(__dirname, '..', 'src');
const sortie = process.argv[2], T = +(process.argv[3] || 200), choix = (process.argv[4] || '').split(',').filter(x => x), v = +(process.argv[5] || 0);
const dom = new JSDOM('<!DOCTYPE html><body></body>', {runScripts:'outside-only'});
const W = dom.window; W.requestAnimationFrame = () => 0;
['mimi-dessin.js', 'mimi-vues.js', 'mimi-pantin.js', 'mimi-gestes.js', 'mimi-habits.js'].forEach(f => W.eval(fs.readFileSync(path.join(SRC, f), 'utf8')));
const M = W.MimiPantin; M.figer = true;
const ids = choix.length ? choix : Object.keys(M.HABITS);
const acc = id => { const h = M.HABITS[id], a = {cou:'', tete:''}; if(!h) return a; if(h.slot === 'cou') a.cou = M.habit(id); else a.tete = M.habit(id); return a; };
const nu = s => s.replace(/ data-m="[^"]*"/g, '');
let s = '', n = 0; const COLS = 7;
const titre = (x, y, t) => '<text x="' + (x + 5) + '" y="' + (y + 13) + '" font-family="sans-serif" font-size="11" fill="#fff">' + t + '</text>';
/* 1) les têtes */
ids.forEach(id => {
  const x = (n % COLS) * T, y = Math.floor(n / COLS) * T; n++;
  s += '<rect x="' + x + '" y="' + y + '" width="' + T + '" height="' + T + '" fill="#6b5a86" stroke="#3a2f55"/>' +
    '<svg x="' + x + '" y="' + (y + 12) + '" width="' + T + '" height="' + (T - 12) + '" viewBox="-40 -50 80 88">' + nu(M.tete(v, acc(id))) + '</svg>' + titre(x, y, id + ' · ' + M.HABITS[id].slot);
});
let Y = Math.ceil(n / COLS) * T; n = 0;
/* 2) assise, en entier */
const H2 = Math.round(T * 0.92), corps = (id, pose, x, y, cls) => '<rect x="' + x + '" y="' + y + '" width="' + T + '" height="' + H2 + '" fill="#4a3c6a" stroke="#3a2f55"/>' +
  '<svg x="' + x + '" y="' + (y + 10) + '" width="' + T + '" height="' + (H2 - 10) + '" viewBox="0 -34 ' + M.W + ' ' + (M.H + 34) + '">' + nu(M.image(v, pose, cls || '', acc(id))) + '</svg>' + titre(x, y, id + ' · ' + pose);
ids.forEach(id => { s += corps(id, 'assis', (n % COLS) * T, Y + Math.floor(n / COLS) * H2); n++; });
Y += Math.ceil(n / COLS) * H2; n = 0;
/* 3) dans ses autres poses (les plus hauts, un du cou, un du museau) */
const POSES = ['marche', 'dort', 'dos', 'pain', 'griffe', 'mange', 'lave'];
(choix.length ? ids : ['hautdeforme', 'lapin', 'nuage', 'toque', 'medaille', 'echarpe', 'lunettes', 'masque']).forEach(id => {
  POSES.forEach(pose => { let o = ''; try { o = corps(id, pose, (n % COLS) * T, Y + Math.floor(n / COLS) * H2); } catch(e) { console.error(id, pose, e.message); } s += o; n++; });
});
Y += Math.ceil(n / COLS) * H2;
const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + (COLS * T) + '" height="' + Y + '"><defs>' + M.defs() + '</defs><rect width="100%" height="100%" fill="#3a2f55"/>' + s + '</svg>';
fs.writeFileSync(sortie.replace(/\.png$/, '.svg'), svg);
cp.execFileSync('rsvg-convert', [sortie.replace(/\.png$/, '.svg'), '-o', sortie]);
console.log(sortie, ids.length, 'habits');
