/* Une planche d'objets de l'atelier, SANS navigateur (node + jsdom + rsvg-convert) : leur petite image (svgObjet), dans chacune de leurs formes.
     NODE_PATH=<un dossier node_modules où jsdom est installé> node tools/objets-planche.js <sortie.png> <type>[,<type>…] [taille] [formes]
   (formes : combien de styles montrer par objet — 3 par défaut ; le style d'un objet : sa forme et sa couleur, o.st) */
const fs = require('fs'), path = require('path'), cp = require('child_process');
const {JSDOM} = require('jsdom');
const SRC = path.join(__dirname, '..', 'src');
const sortie = process.argv[2], types = (process.argv[3] || '').split(','), T = +(process.argv[4] || 260), NF = +(process.argv[5] || 3);
const dom = new JSDOM('<!DOCTYPE html><body></body>', {runScripts:'outside-only'});
const W = dom.window; W.requestAnimationFrame = () => 0;
['mimi-dessin.js', 'mimi-vues.js', 'mimi-pantin.js', 'mimi-gestes.js', 'mimi-habits.js'].forEach(f => W.eval(fs.readFileSync(path.join(SRC, f), 'utf8')));
let a = fs.readFileSync(path.join(SRC, 'atelier.js'), 'utf8');
if(a.indexOf('window.Atelier = {') < 0) throw new Error('atelier.js : « window.Atelier = { » introuvable');
a = a.replace('window.Atelier = {', 'window.Atelier = { _svgObjet:svgObjet, _defs:svgDefs,');
try { W.eval(a); } catch(e) { console.error('atelier.js ne se charge pas hors du jeu :', e.message); process.exit(1); }
const A = W.Atelier;
/* (le jeu écrit parfois deux fois le même réglage sur un trait : le navigateur garde le premier ; on fait pareil, en repassant par lui) */
const propre = h => { const d = W.document.createElement('div'); d.innerHTML = h; return d.innerHTML; };
let s = '', n = 0;
types.forEach(t0 => {
  /* (« cabane_chat:dedans » : avec Mimi dedans, sa tête à la porte) */
  const t = t0.split(':')[0], dedans = t0.split(':')[1] === 'dedans' ? {v:0, acc:{}} : undefined;
  if(!A.OBJETS[t]){ console.error('objet inconnu :', t); return; }
  for(let st = 0; st < NF; st++){
    const x = (n % 6) * T, y = Math.floor(n / 6) * T; n++;
    let o = '';
    try { o = propre(A._svgObjet({t:t, st:st, v:0, dedans:dedans})); } catch(e) { o = '<svg viewBox="0 0 10 10"><text y="8" font-size="2" fill="red">' + String(e.message).slice(0, 40) + '</text></svg>'; console.error(t, st, e.message); }
    o = o.replace('<svg ', '<svg x="' + (x + 14) + '" y="' + (y + 22) + '" width="' + (T - 28) + '" height="' + (T - 36) + '" preserveAspectRatio="xMidYMid meet" ');
    s += '<rect x="' + x + '" y="' + y + '" width="' + T + '" height="' + T + '" fill="#6b5a86" stroke="#3a2f55"/>' + o + '<text x="' + (x + 6) + '" y="' + (y + 14) + '" font-family="sans-serif" font-size="12" fill="#fff">' + t + ' · style ' + st + '</text>';
  }
});
const cols = Math.min(6, n), rows = Math.ceil(n / 6);
const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + (T * cols) + '" height="' + (T * rows) + '"><defs>' + propre(A._defs()).replace(/^<svg[^>]*><defs>|<\/defs><\/svg>$/g, '') + '</defs>' + s + '</svg>';
const fsvg = sortie.replace(/\.png$/, '.svg');
fs.writeFileSync(fsvg, svg);
cp.execFileSync('rsvg-convert', ['-o', sortie, fsvg]);
console.log(sortie, n, 'images');
