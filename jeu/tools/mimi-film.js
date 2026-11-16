/* Un film du pantin de Mimi, image par image, SANS navigateur (node + jsdom + rsvg-convert) : on fait vivre le vrai pantin
   (mimi-pantin.js) pas à pas, et on garde des images.
     NODE_PATH=<un dossier node_modules où jsdom est installé> node tools/mimi-film.js <sortie.png> "<scénario>" [colonnes] [taille] [pelage]
   Le scénario (du JavaScript) reçoit (rig, pas, photo, M, hote) : pas(n) avance de n images (1/60 s) ; photo('nom') garde l'image ;
   hote : l'élément qui porte les classes du chat (hote.classList.add('at-c-gauche')). */
const fs = require('fs'), path = require('path'), cp = require('child_process');
const {JSDOM} = require('jsdom');
const SRC = path.join(__dirname, '..', 'src');
const sortie = process.argv[2], scen = process.argv[3], cols = +(process.argv[4] || 8), T = +(process.argv[5] || 180), v = +(process.argv[6] || 0);
const dom = new JSDOM('<!DOCTYPE html><body><div id="h" class="at-o"></div></body>', {runScripts:'outside-only'});
const W = dom.window;
W.requestAnimationFrame = () => 0;
['mimi-dessin.js', 'mimi-vues.js', 'mimi-pantin.js', 'mimi-gestes.js'].forEach(f => W.eval(fs.readFileSync(path.join(SRC, f), 'utf8')));
const M = W.MimiPantin;
M.figer = true;
const hote = W.document.getElementById('h');
hote.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + M.W + ' ' + M.H + '">' + M.dessin(v, M.pose('assis'), {}) + '</svg>';
const svg = hote.querySelector('svg'), rig = M.monter(svg, {pose:'assis', hote});
const images = [];
const pas = n => { for(let i = 0; i < (n || 1); i++){ rig.lireClasses(); rig.dessiner(1 / 60); } };
const photo = nom => images.push({nom:nom || '', svg:svg.innerHTML});
try { new Function('rig', 'pas', 'photo', 'M', 'hote', scen)(rig, pas, photo, M, hote); } catch(e) { console.error('ERREUR du scénario :', e.stack); }
const H = Math.round(T * M.H / M.W), rows = Math.ceil(images.length / cols), k = T / M.W;
let s = '<svg xmlns="http://www.w3.org/2000/svg" width="' + (T * cols) + '" height="' + (H * rows) + '"><defs>' + M.defs() + '</defs><rect width="100%" height="100%" fill="#3a2f55"/>';
images.forEach((im, i) => {
  const x = (i % cols) * T, y = Math.floor(i / cols) * H;
  s += '<g transform="translate(' + x + ',' + y + ')"><rect width="' + T + '" height="' + H + '" fill="#4a3c6a" stroke="#3a2f55"/><rect y="' + ((M.Y0 + 2) * k) + '" width="' + T + '" height="' + (H - (M.Y0 + 2) * k) + '" fill="#7a4f30"/>' +
    '<g transform="scale(' + k + ')">' + im.svg.replace(/ data-m="[^"]*"/g, '').replace(/ class="[^"]*"/g, '') + '</g><text x="4" y="11" font-family="sans-serif" font-size="10" fill="#fff">' + im.nom + '</text></g>';
});
s += '</svg>';
const fsvg = sortie.replace(/\.png$/, '.svg');
fs.writeFileSync(fsvg, s);
cp.execFileSync('rsvg-convert', ['-o', sortie, fsvg]);
console.log(sortie, images.length, 'images');
