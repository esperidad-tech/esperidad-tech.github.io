/* ==========================================================
   Brumeval — le grand monde : calcule une fois les arbres et les fleurs (c'est long : des milliers d'essais), et les écrit dans src/monde-arbres.js.
   À relancer quand on change un chemin, une eau, un lieu ou un champ du grand monde :   node tools/monde-arbres.js   (depuis jeu/)
   Il vérifie aussi que les étiquettes des lieux ne se touchent pas.
   ========================================================== */
'use strict';
var fs = require('fs'), path = require('path'), SRC = path.join(__dirname, '..', 'src');
global.window = {innerWidth: 1180, innerHeight: 820};
['carte.js', 'monde-terrain.js', 'monde-lieux.js', 'monde-brume.js'].forEach(function(n){ require(path.join(SRC, n)); });
var Carte = window.Carte, Monde = window.Monde, O = Monde.O, T = Monde.T, B = Monde.B, f = O.f;
var L = Monde.lieux('p-', 'v-');
var emprises = L.lieux.filter(function(l){ return l.emprise; }).map(function(l){ return l.emprise; })
  .concat(T.CHAMPS.map(function(c){ return [c[0] - 6, c[1] - 6, c[0] + c[2] + 6, c[1] + c[3] + 6]; }));   /* ni arbre ni fleur dans un champ */

/* Les arbres de l'ancienne carte : ceux qui poussent sur un nouveau chemin, dans la nouvelle eau ou sur un lieu sont ôtés (leur numéro dans Carte.ARBRES) ;
   les autres comptent pour l'espacement des nouveaux. */
var otes = [], vieux = [];
Carte.ARBRES.forEach(function(a, i){
  var X = a.x + O.OX, Y = a.y + O.OY, R = a.r, gene = false;
  T.CHEMINS.forEach(function(c){ if(O.distLigne(X, Y, c.e) < c.l / 2 + 3 + R * .8) gene = true; });
  if(O.distLigne(X, Y, T.RIV_E) < 38 + R * .7 || O.distLigne(X, Y, T.RUI_E) < 15 + R * .75) gene = true;
  emprises.forEach(function(e){ if(e.length === 3 && Math.hypot(X - e[0], Y - e[1]) < e[2] + R * .4) gene = true; if(e.length === 4 && X > e[0] - R * .5 && X < e[2] + R * .5 && Y > e[1] - R * .5 && Y < e[3] + R * .5) gene = true; });
  if(gene) otes.push(i); else vieux.push({x: X, y: Y, r: R});
});
var STYLES = {foret: 0, sombre: 1, pre: 2}, ZI = {};
B.ZONES.forEach(function(z, i){ ZI[z.id] = i; });
var arbres = T.planter(emprises, vieux).map(function(a){
  var z = Monde.frange(a.x, a.y, 0) ? -1 : ZI[Monde.zoneDe(a.x, a.y)];
  return [f(a.x), f(a.y), f(a.r), a.v, STYLES[a.style], z === undefined ? -1 : z];
});
var fleurs = T.semerFleurs(emprises).map(function(q){ var z = Monde.frange(q[0], q[1], -20) ? -1 : ZI[Monde.zoneDe(q[0], q[1])]; return q.concat([z === undefined ? -1 : z]); });

var txt = '/* ==========================================================\n' +
  '   Brumeval — le grand monde : les arbres et les fleurs. FICHIER FABRIQUÉ par tools/monde-arbres.js : ne pas le changer à la main.\n' +
  '   OTES : les numéros des arbres de l\'ancienne carte (Carte.ARBRES) à ne plus dessiner (un nouveau chemin ou une nouvelle eau y passe).\n' +
  '   ARBRES : [x, y, rayon, variante, sorte (0 forêt, 1 Bois Sombre, 2 pré), zone de brume (-1 : la frange, toujours dessinée)].\n' +
  '   FLEURS : [x, y, rayon, couleur, zone de brume].\n' +
  '   ========================================================== */\n' +
  '(function(){\nvar Monde = window.Monde = window.Monde || {};\n' +
  'Monde.OTES = ' + JSON.stringify(otes) + ';\n' +
  'Monde.ARBRES = ' + JSON.stringify(arbres) + ';\n' +
  'Monde.FLEURS = ' + JSON.stringify(fleurs) + ';\n})();\n';
fs.writeFileSync(path.join(SRC, 'monde-arbres.js'), txt);
console.log('Écrit : src/monde-arbres.js (' + Math.round(txt.length / 1024) + ' Ko) — arbres nouveaux : ' + arbres.length + ' (dont ' + arbres.filter(function(a){ return a[5] < 0; }).length + ' dans la frange), anciens ôtés : ' + otes.length + ', fleurs : ' + fleurs.length);

/* ---------- Les étiquettes : rien ne doit se toucher ---------- */
var boites = [], soucis = [], W = Monde.W, H = Monde.H;
L.lieux.forEach(function(l){ if(!l.nom) return; var e = O.etiquette(l.etiq[0], l.etiq[1], l.ic, l.nom, {}); boites.push({id: l.id, zone: l.zone, x0: l.etiq[0] - e.l / 2, x1: l.etiq[0] + e.l / 2, y0: l.etiq[1] - e.h / 2, y1: l.etiq[1] + e.h / 2}); });
boites.forEach(function(a, i){
  boites.forEach(function(b, j){ if(j > i && a.x0 < b.x1 + 6 && a.x1 > b.x0 - 6 && a.y0 < b.y1 + 4 && a.y1 > b.y0 - 4) soucis.push('étiquettes qui se touchent : ' + a.id + ' / ' + b.id); });
  if(a.x0 < 118 || a.x1 > W - 118 || a.y0 < 104 || a.y1 > H - 104) soucis.push('étiquette sous le mur de brume : ' + a.id);
  /* trop près d'une zone voisine : sa brume, tant qu'elle n'est pas levée, viendrait voiler l'étiquette (le village, lui, n'a jamais de brume) */
  B.ZONES.forEach(function(z){
    if(z.id !== a.zone) return;
    var V = B.VILLAGE, cx = (a.x0 + a.x1) / 2, cy = (a.y0 + a.y1) / 2;
    function village(x, y){ return x > V[0] && x < V[2] && y > V[1] && y < V[3]; }
    if((a.x0 < z.r[0] + 40 && z.r[0] > 0 && !village(z.r[0] - 10, cy)) || (a.x1 > z.r[2] - 40 && z.r[2] < W && !village(z.r[2] + 10, cy)) ||
       (a.y0 < z.r[1] + 40 && z.r[1] > 0 && !village(cx, z.r[1] - 10)) || (a.y1 > z.r[3] - 40 && z.r[3] < H && !village(cx, z.r[3] + 10))) soucis.push('étiquette trop près d\'une zone voisine : ' + a.id);
  });
});
console.log(soucis.length ? 'À REVOIR :\n  ' + soucis.join('\n  ') : 'Étiquettes (' + boites.length + ') : rien ne se touche.');
