/* ==========================================================
   Brumeval — la grande carte (maquette du 12 novembre) : la fabrique de la page
   node gen.js  →  carte-monde.html (une seule page, tout dedans)
   Le village vient du vrai fichier du jeu (jeu/src/carte.js) : la maquette suit toujours la carte du jeu.
   ========================================================== */
'use strict';
var fs = require('fs'), path = require('path');
var O = require('./outils'), T = require('./terrain'), Lieux = require('./lieux'), B = require('./brume');
var f = O.f, W = O.W, H = O.H, OX = O.OX, OY = O.OY;
var ICI = __dirname, SRC = path.join(ICI, '..', '..', 'src');

/* ---------- 1. Le village : la carte du jeu, telle quelle ---------- */
global.window = {innerWidth: 1180, innerHeight: 820};
require(path.join(SRC, 'carte.js'));
var brut = global.window.Carte.svg({moment: 'apresmidi'});
var pv = (brut.match(/id="(ca\d+-)herbe"/) || [])[1];
var defsVillage = brut.slice(brut.indexOf('<defs>') + 6, brut.indexOf('</defs>'));
var corps = brut.slice(brut.indexOf('</defs>') + 7, brut.lastIndexOf('</svg>'));
function oter(re, quoi){ var n = corps.length; corps = corps.replace(re, ''); if(corps.length === n) throw new Error('Introuvable dans la carte du jeu : ' + quoi); }
/* ce que le grand monde dessine lui-même, d'un seul tenant : l'herbe, le sol de la forêt, le ruisseau et la rivière */
oter('<rect x="0" y="0" width="1000" height="1400" fill="url(#' + pv + 'herbe)"/>', 'l\'herbe');
oter('<rect x="0" y="0" width="1000" height="1400" fill="url(#' + pv + 'herbeT)"/>', 'les brins d\'herbe');
oter(new RegExp('<path d="M0 0 H1000[^>]*fill="url\\(#' + pv + 'foret\\)"[^>]*/>'), 'le sol de la forêt');
(function(){   /* les huit tracés du ruisseau et de la rivière : les premiers du dessin */
  var i = 0, n = 0;
  while(n < 8){ if(corps.slice(i, i + 5) !== '<path') throw new Error('Les eaux ne sont plus au début du dessin'); i = corps.indexOf('/>', i) + 2; n++; }
  corps = corps.slice(i);
})();
/* ce qui n'a plus lieu d'être au milieu d'un grand monde : la rose des vents, le voile de lumière, l'ancienne brume, le bord blanc */
oter(/<g class="ca-rose"[\s\S]*?<\/g>/, 'la rose des vents');
oter(/<rect class="ca-voile"[^>]*\/>/, 'le voile');
oter(/<g class="ca-brumes"[\s\S]*?<\/g>/, 'les brumes');
oter(new RegExp('<rect[^>]*fill="url\\(#' + pv + 'vignette\\)"[^>]*/>'), 'le bord blanc');

/* ---------- 2. Les lieux du grand monde ---------- */
var p = 'mo-';
var monde = Lieux(p, pv);
var emprises = monde.lieux.filter(function(l){ return l.emprise; }).map(function(l){ return l.emprise; })
  .concat(T.CHAMPS.map(function(c){ return [c[0] - 6, c[1] - 6, c[0] + c[2] + 6, c[1] + c[3] + 6]; }));   /* ni arbre ni fleur dans un champ */

/* Les arbres de l'ancienne carte : on enlève ceux qui poussent sur un nouveau chemin ou dans la nouvelle eau ; les autres comptent pour l'espacement */
var vieux = [], otes = 0;
corps = corps.replace(new RegExp('<ellipse cx="[\\d.-]+" cy="[\\d.-]+" rx="[\\d.]+" ry="[\\d.]+" fill="#0a1a12" opacity="\\.28"/><circle cx="([\\d.-]+)" cy="([\\d.-]+)" r="([\\d.]+)" fill="url\\(#' + pv + 'a\\d\\)" stroke="#24182e" stroke-width="3"/><circle [^>]*fill="#fff" opacity="\\.13"/>', 'g'), function(m, x, y, r){
  var X = +x + OX, Y = +y + OY, R = +r, gene = false;
  T.CHEMINS.forEach(function(c){ if(O.distLigne(X, Y, c.e) < c.l / 2 + 3 + R * .8) gene = true; });
  if(O.distLigne(X, Y, T.RIV_E) < 38 + R * .7 || O.distLigne(X, Y, T.RUI_E) < 15 + R * .75) gene = true;
  emprises.forEach(function(e){ if(e.length === 3 && Math.hypot(X - e[0], Y - e[1]) < e[2] + R * .4) gene = true; if(e.length === 4 && X > e[0] - R * .5 && X < e[2] + R * .5 && Y > e[1] - R * .5 && Y < e[3] + R * .5) gene = true; });
  if(gene){ otes++; return ''; }
  vieux.push({x: X, y: Y, r: R});
  return m;
});

/* ---------- 3. Le dessin ---------- */
var arbres = T.planter(emprises, vieux);
/* Ce qui dépasse du sol (arbres, lieux, petites choses) est rangé par zone de brume : tant qu'une zone est sous la brume, ce qui est loin du village
   (là où la brume est pleine) n'est pas dessiné du tout — il ne se voit pas, et la tablette n'a pas à le peindre. Ce qui est près du village
   (la frange, là où la brume est encore légère) reste toujours dessiné : on le devine à travers la brume. Les étiquettes, elles, ne se montrent
   jamais avant que la zone soit levée. */
function zoneDe(x, y, marge){
  var id = 'frange';
  if(B.distVillage(x, y) < B.D_BRUME + marge) return id;
  B.ZONES.forEach(function(z){ if(x >= z.r[0] && x < z.r[2] && y >= z.r[1] && y < z.r[3]) id = z.id; });
  return id;
}
var dessus = {frange: []};
B.ZONES.forEach(function(z){ dessus[z.id] = []; });
arbres.forEach(function(a){ dessus[zoneDe(a.x, a.y, 60)].push({y: a.y, svg: T.arbre(p, pv, a)}); });
monde.lieux.forEach(function(l){ dessus[zoneDe(l.x, l.y, 140) === 'frange' ? 'frange' : l.zone].push({y: l.y, svg: '<g data-lieu="' + l.id + '">' + l.dessin() + '</g>'}); });
monde.curieux.forEach(function(c){ dessus.frange.push({y: c.y, svg: c.svg}); });   /* de toutes petites choses : toujours dessinées */
function couche(id){ return dessus[id].sort(function(a, b){ return a.y - b.y; }).map(function(d){ return d.svg; }).join(''); }

/* les étiquettes, rangées par zone : elles n'apparaissent que quand la brume de leur zone est levée */
var parZone = {}, boites = [];
B.ZONES.forEach(function(z){ parZone[z.id] = ''; });
monde.lieux.forEach(function(l){
  if(!l.nom) return;
  var e = O.etiquette(l.etiq[0], l.etiq[1], l.ic, l.nom, {classe: 'ca-etiq-lieu'});
  parZone[l.zone] += e.svg;
  boites.push({id: l.id, x0: l.etiq[0] - e.l / 2, x1: l.etiq[0] + e.l / 2, y0: l.etiq[1] - e.h / 2, y1: l.etiq[1] + e.h / 2});
});
/* les noms des contrées, écrits en grand dans le paysage */
var CONTREES = [
  {zone:'no', x:640, y:488, t:'Le Bois Sombre', rot:-5, c:'#d6f2e0'},
  {zone:'o',  x:668, y:1112, t:'Les Collines', rot:-4, c:'#fbf3d6'},
  {zone:'e',  x:2372, y:1106, t:'L\'Autre Rive', rot:2, c:'#fbf3d6'}
];
CONTREES.forEach(function(c){ parZone[c.zone] = O.texte(c.x, c.y, c.t, 46, c.c, {classe: 'mo-contree', rot: c.rot, contour: '#24182e', cw: 7, opacite: .82}) + parZone[c.zone]; });

/* ---------- 4. Vérifications ---------- */
var soucis = [];
boites.forEach(function(a, i){
  boites.forEach(function(b, j){ if(j > i && a.x0 < b.x1 + 6 && a.x1 > b.x0 - 6 && a.y0 < b.y1 + 4 && a.y1 > b.y0 - 4) soucis.push('étiquettes qui se touchent : ' + a.id + ' / ' + b.id); });
  if(a.x0 < 118 || a.x1 > W - 118 || a.y0 < 104 || a.y1 > H - 104) soucis.push('étiquette sous le mur de brume : ' + a.id);
  /* trop près d'une zone voisine : sa brume, tant qu'elle n'est pas levée, viendrait voiler l'étiquette (le village, lui, n'a jamais de brume) */
  monde.lieux.forEach(function(l){ if(l.id !== a.id) return; B.ZONES.forEach(function(z){
    if(z.id !== l.zone) return;
    var V = B.VILLAGE, cx = (a.x0 + a.x1) / 2, cy = (a.y0 + a.y1) / 2;
    function village(x, y){ return x > V[0] && x < V[2] && y > V[1] && y < V[3]; }
    var pres = (a.x0 < z.r[0] + 40 && z.r[0] > 0 && !village(z.r[0] - 10, cy)) || (a.x1 > z.r[2] - 40 && z.r[2] < W && !village(z.r[2] + 10, cy)) ||
               (a.y0 < z.r[1] + 40 && z.r[1] > 0 && !village(cx, z.r[1] - 10)) || (a.y1 > z.r[3] - 40 && z.r[3] < H && !village(cx, z.r[3] + 10));
    if(pres) soucis.push('étiquette trop près d\'une zone voisine : ' + a.id);
  }); });
});

/* ---------- 5. L'image entière ---------- */
var svg = '<svg class="ca-carte ca-surface ca-m-apresmidi mo-carte" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="La grande carte de Brumeval">' +
  '<defs>' + defsVillage + T.defs(p) + B.defs(p) + '</defs>' +
  '<g class="mo-sol">' + T.sol(p, pv) + T.fleurs(emprises) + '</g>' +
  '<g class="mo-village" transform="translate(' + OX + ' ' + OY + ')">' + corps + '</g>' +
  '<g class="mo-dessus"><g class="mo-frange">' + couche('frange') + '</g>' + B.ZONES.map(function(z){ return '<g class="mo-contenu mo-cache" data-zone="' + z.id + '">' + couche(z.id) + '</g>'; }).join('') + '</g>' +
  '<g class="mo-etiqs">' + B.ZONES.map(function(z){ return '<g class="mo-etiq-zone" data-zone="' + z.id + '">' + parZone[z.id] + '</g>'; }).join('') + '</g>' +
  '<g class="mo-brume">' + B.ZONES.map(function(z, i){ return B.zone(p, z, i); }).join('') + B.mur(p) + '</g>' +
  '</svg>';

var css = fs.readFileSync(path.join(SRC, 'carte.css'), 'utf8');
var page = fs.readFileSync(path.join(ICI, 'page.html'), 'utf8')
  .replace('/*CARTE_CSS*/', function(){ return css; })
  .replace('<!--CARTE-->', function(){ return svg; })
  .replace('/*ZONES*/', function(){ return JSON.stringify(B.ZONES.map(function(z){ return {id: z.id, nom: z.nom}; })); });
var sortie = path.join(ICI, process.argv[2] || 'carte-monde.html');
fs.writeFileSync(sortie, page);

console.log('Écrit : ' + sortie + ' (' + Math.round(page.length / 1024) + ' Ko)');
console.log('Arbres nouveaux : ' + arbres.length + ' ; arbres de l\'ancienne carte gardés : ' + vieux.length + ', ôtés : ' + otes);
console.log('Lieux nommés : ' + boites.length + ' ; éléments du dessin : ' + (svg.match(/<(path|circle|rect|ellipse|text|g)\b/g) || []).length);
console.log(soucis.length ? 'À REVOIR :\n  ' + soucis.join('\n  ') : 'Étiquettes : rien ne se touche.');
