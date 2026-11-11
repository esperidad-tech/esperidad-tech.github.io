/* ==========================================================
   LE GÂTEAU DE LA FÊTE (Alchimiste) — les dessins (Romain, 11 novembre 2026, 19 h 48)
   « plein d'options les plus farfelues les unes que les autres […] des icônes de chaque côté du gâteau
     […] tu mets tout ça sur une jolie table, toujours dans la charte graphique, et en fond la ville festive ».

   Ce fichier ne contient que des dessins (du SVG écrit à la main, dans le style du jeu : contour sombre
   #24182e, aplats francs, un reflet clair) et les listes de choix. Le jeu est dans mj-gateau.js.
   MJ.GATEAU_ART = {K, PATES, GLACAGES, MOTIFS, FORMES, CREMES, CREME_COUL, PLATS, NAPPES, CATS, DECOS,
                    icone(cat), jeton(...), fond(id), table(id, nappe), plat(style), defs(id), clair, sombre}
   Tout est dessiné dans le repère de la scène : 640 × 660, le gâteau au milieu (x = 320), le dessus de la table à y = 548.
   ========================================================== */
(function(){
'use strict';
var MJ = window.MJ = window.MJ || {};
var K = '#24182e';
function f1(v){ return (Math.round(v * 10) / 10).toString(); }
function st(w, c){ return ' stroke="' + (c || K) + '" stroke-width="' + w + '" stroke-linejoin="round" stroke-linecap="round"'; }
function hex(c){ return [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16)]; }
function mix(a, b, u){ var x = hex(a), y = hex(b); return '#' + [0, 1, 2].map(function(i){ var v = Math.round(x[i] + (y[i] - x[i]) * u); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }
function clair(c, u){ return mix(c, '#ffffff', u); }
function sombre(c, u){ return mix(c, '#1c1026', u); }
/* un hasard qui se répète (les mêmes coulures, les mêmes miettes à chaque dessin) */
function graine(n){ var s = (n * 9301 + 49297) % 233280; return function(){ s = (s * 9301 + 49297) % 233280; return s / 233280; }; }

/* ---------- Les choix ---------- */
/* (Romain, 11 novembre, 20 h 29 : « que le gâteau soit étincelant de couleurs très vives ») */
var PATES = [
  {id:'vanille', nom:'Vanille', c:'#ffd84f'}, {id:'chocolat', nom:'Chocolat', c:'#8a3f14'}, {id:'fraise', nom:'Fraise', c:'#ff6f9e'},
  {id:'pistache', nom:'Pistache', c:'#8fdc3c'}, {id:'citron', nom:'Citron', c:'#fff23a'}, {id:'myrtille', nom:'Myrtille', c:'#7a52f0'},
  {id:'velours', nom:'Velours rouge', c:'#e81f3c'}, {id:'caramel', nom:'Caramel', c:'#f39a12'}, {id:'coco', nom:'Noix de coco', c:'#fffaf0'},
  {id:'carotte', nom:'Carotte', c:'#ff7a12'}, {id:'charbon', nom:'Charbon', c:'#2e2842'}, {id:'arcenciel', nom:'Arc-en-ciel', c:'#ffd84f', arc:true}
];
var GLACAGES = [
  {id:'blanc', nom:'Crème', c:'#ffffff'}, {id:'rose', nom:'Rose', c:'#ff7fc2'}, {id:'framboise', nom:'Framboise', c:'#ff1f72'},
  {id:'chocolat', nom:'Chocolat', c:'#6e3212'}, {id:'caramel', nom:'Caramel', c:'#ffa012'}, {id:'citron', nom:'Citron', c:'#ffec1f'},
  {id:'pistache', nom:'Pistache', c:'#9cec2e'}, {id:'menthe', nom:'Menthe', c:'#2fe6b4'}, {id:'ciel', nom:'Bleu ciel', c:'#2fb4ff'},
  {id:'lavande', nom:'Lavande', c:'#b07cff'}, {id:'myrtille', nom:'Myrtille', c:'#4a3fe6'}, {id:'reglisse', nom:'Réglisse', c:'#221c38'},
  {id:'or', nom:'Doré', c:'#ffc61a'}, {id:'arcenciel', nom:'Arc-en-ciel', c:'#ff7fc2', arc:true}
];
var MOTIFS = [{id:'lisse', nom:'Lisse'}, {id:'coulant', nom:'Qui coule'}, {id:'moitie', nom:'À moitié'}, {id:'pois', nom:'À pois'}, {id:'rayures', nom:'Rayé'}, {id:'vagues', nom:'En vagues'}];
var FORMES = [{id:'rond', nom:'Rond'}, {id:'carre', nom:'Carré'}, {id:'pans', nom:'À pans'}, {id:'cannele', nom:'Cannelé'}];
var CREMES = [{id:'perles', nom:'Perles'}, {id:'rosettes', nom:'Rosettes'}, {id:'festons', nom:'Festons'}, {id:'etoiles', nom:'Étoiles'}, {id:'nuages', nom:'Nuages'}];
var CREME_COUL = ['blanc', 'rose', 'framboise', 'chocolat', 'caramel', 'citron', 'pistache', 'menthe', 'ciel', 'lavande'];
var PLATS = [{id:'porcelaine', nom:'Porcelaine'}, {id:'bois', nom:'Bois'}, {id:'argent', nom:'Argent'}, {id:'or', nom:'Doré'}, {id:'pois', nom:'À pois'}, {id:'runes', nom:'Pierre à runes'}];
var NAPPES = [{id:'vichy', nom:'Vichy rouge'}, {id:'bleue', nom:'Vichy bleu'}, {id:'dentelle', nom:'Dentelle'}, {id:'bois', nom:'Bois'}, {id:'nuit', nom:'Nuit étoilée'}, {id:'rayee', nom:'Rayée'}];
/* (une couleur du pinceau, « #rrggbb », est acceptée à la place d'un nom de la liste) */
function glac(id){ if(id && id.charAt(0) === '#') return {id:id, nom:'', c:id}; for(var i = 0; i < GLACAGES.length; i++) if(GLACAGES[i].id === id) return GLACAGES[i]; return GLACAGES[0]; }
function pate(id){ if(id && id.charAt(0) === '#') return {id:id, nom:'', c:id}; for(var i = 0; i < PATES.length; i++) if(PATES[i].id === id) return PATES[i]; return PATES[0]; }

/* ---------- Le pinceau (Romain, 11 novembre, 20 h 39 : « qu'on puisse personnaliser les couleurs de tous les éléments ») ----------
   Huit couleurs. Sur un étage, la couleur du pinceau remplace telle quelle la pâte, le glaçage, le motif ou la crème.
   Une décoration, le plat, la nappe sont des dessins à plusieurs couleurs : teinter() les repeint sans les redessiner.
   - un dessin coloré (une fraise, un ballon) : toutes ses couleurs tournent d'autant qu'il faut pour que sa couleur principale
     devienne celle du pinceau ; ses blancs, ses gris, son contour ne changent pas, et son feuillage reste vert ;
   - un dessin blanc, gris ou noir (un chat, une meringue, le chaudron) : ses blancs, ses gris prennent la couleur du pinceau.
   Ce qui est entre <!--f--> et <!--/f--> (une flamme) garde toujours ses couleurs. */
var PINCEAUX = [{id:'rouge', nom:'Rouge', c:'#ff2f45'}, {id:'orange', nom:'Orange', c:'#ff8a12'}, {id:'jaune', nom:'Jaune', c:'#ffd91f'}, {id:'vert', nom:'Vert', c:'#3fd44a'},
  {id:'turquoise', nom:'Turquoise', c:'#1fd6c0'}, {id:'bleu', nom:'Bleu', c:'#2f9bff'}, {id:'violet', nom:'Violet', c:'#9a5cff'}, {id:'rose', nom:'Rose', c:'#ff6fc0'}];
function versTSL(c){
  if(c.length === 4) c = '#' + c.charAt(1) + c.charAt(1) + c.charAt(2) + c.charAt(2) + c.charAt(3) + c.charAt(3);
  var r = parseInt(c.substr(1, 2), 16) / 255, g = parseInt(c.substr(3, 2), 16) / 255, b = parseInt(c.substr(5, 2), 16) / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn, h = 0, s = 0;
  if(d){ s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = 60 * (mx === r ? (g - b) / d + (g < b ? 6 : 0) : (mx === g ? (b - r) / d + 2 : (r - g) / d + 4)); }
  return [h, s, l];
}
function deTSL(h, s, l){
  h = (((h % 360) + 360) % 360) / 360; var q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  function v(x){ x = (x + 1) % 1; x = x < 1 / 6 ? p + (q - p) * 6 * x : (x < .5 ? q : (x < 2 / 3 ? p + (q - p) * (2 / 3 - x) * 6 : p)); x = Math.round(Math.max(0, Math.min(1, x)) * 255); return (x < 16 ? '0' : '') + x.toString(16); }
  return '#' + v(h + 1 / 3) + v(h) + v(h - 1 / 3);
}
function fixe(s){ return '<!--f-->' + s + '<!--/f-->'; }
var RE_COUL = /#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g;
function teinter(s, p, c){
  var Pp = versTSL(p), C = versTSL(c), vif = Pp[1] >= .25 && Pp[2] > .2 && Pp[2] < .93;
  function une(x){
    var lx = x.toLowerCase(); if(lx === K || lx === '#1c1026') return x;                 /* le contour et les ombres ne changent jamais */
    var X = versTSL(x);
    if(vif){
      if(X[1] < .18 || X[2] < .1 || X[2] > .97) return x;                                 /* ses blancs, ses gris, ses noirs */
      if(X[0] > 75 && X[0] < 165 && Math.abs(((X[0] - Pp[0] + 540) % 360) - 180) > 50) return x;   /* son feuillage reste vert */
      return deTSL(X[0] + C[0] - Pp[0], X[1], X[2]);
    }
    if(X[1] > Math.max(.3, Pp[1] + .15) || Math.abs(X[2] - Pp[2]) > .32) return x;        /* un dessin blanc, gris ou noir : seules les couleurs de sa famille changent */
    return deTSL(C[0], .66, Math.max(.3, Math.min(.84, X[2] > .84 ? X[2] * .86 : X[2])));
  }
  var out = '', i = 0, a, b;
  for(;;){
    a = s.indexOf('<!--f-->', i); if(a < 0){ out += s.slice(i).replace(RE_COUL, une); break; }
    b = s.indexOf('<!--/f-->', a); out += s.slice(i, a).replace(RE_COUL, une) + s.slice(a, b < 0 ? s.length : b + 9);
    if(b < 0) break; i = b + 9;
  }
  return out;
}
/* la couleur principale de chaque décoration (celle que le pinceau remplace) */
var PRINC = {fraise:'#e8384a', cerises:'#c81e3a', myrtilles:'#4a4fa0', framboise:'#d83a6a', orange:'#f59a2c', citron:'#f2c92c', kiwi:'#9ccc4a', raisin:'#8a4fb8', ananas:'#e8b02c', pomme:'#d81e2c',
  rose:'#e0486a', marguerite:'#fffdf4', pensee:'#6a48b8', lavande:'#9a7ae0', coquelicot:'#e8382c', tulipe:'#f47a9c', tournesol:'#f6c52c', trefle:'#4fbf5a', feuilles:'#4fae5a',
  macaron:'#f79ab8', guimauve:'#f8adc8', sucredorge:'#e0304a', papillote:'#5bc8f0', sucette:'#f8adc8', chocolat:'#5c341c', biscuit:'#e0a85a', meringue:'#fffaf0', coeur:'#f04a6a', reglisse:'#2f2b3c',
  bougie:'#f8adc8', bougie2:'#9ccbf5', cierge:'#ffd76a', fanion:'#f04a6a', etoile:'#f6c52c', lampion:'#f59a2c', noeud:'#de4f7c', ballon:'#5bc8f0',
  moustache:'#8a8a9a', biscotte:'#e0b888', pompon:'#fdfaf2', caramel:'#e08a3a', mistigri:'#3a3444', noisette:'#8a5a34', grisette:'#c4c4d0', oie:'#fffdf6', champignon:'#e0304a', lanterne:'#ecbc4c', cle:'#b8862e',
  plume:'#2c2838', sardine:'#9cc0d8', chaudron:'#3a3444', grenouille:'#6fbf4a', cornichon:'#7aa83a', chaussette:'#e0304a', fromage:'#f6c52c', escargot:'#c8783a',
  p_confettis:'#f04a6a', p_perles:'#e8eef4', p_etoiles:'#ffd21f', p_coeurs:'#f04a6a', p_vermicelles:'#5c341c', p_neige:'#ffffff',
  r_blanche:'#fffaf0', r_rose:'#f8adc8', r_chocolat:'#7a4a2a', r_menthe:'#8fe3c3', nuage:'#fffaf0', b_vanille:'#fbe9a8', b_fraise:'#f47a9c', b_pistache:'#a8d07a'};

/* ---------- Les décorations (chacune dessinée autour de 0,0 ; r : la zone qu'on attrape au doigt) ---------- */
var D = {};
function reflet(d, w, o){ return '<path d="' + d + '" fill="none" stroke="#fff" stroke-width="' + (w || 2.4) + '" stroke-linecap="round" opacity="' + (o || .5) + '"/>'; }
function pts(l, f){ return l.map(f).join(''); }
/* Une partie qui bouge toute seule (Romain, 11 novembre, 20 h 29 : « un quart des décorations animées »).
   cls : son mouvement (mj-gateau.css, .gta-…) ; o : le point autour duquel elle bouge, en % de la boîte de ce qu'elle contient. */
function anime(cls, o, dedans){ return '<g class="gta gta-' + cls + '"' + (o ? ' style="transform-origin:' + o + '"' : '') + '>' + dedans + '</g>'; }
var ANIMEES = ['cerises', 'tournesol', 'tulipe', 'sucette', 'coeur', 'bougie', 'bougie2', 'cierge', 'ballon', 'lampion', 'etoile', 'moustache', 'oie', 'grenouille', 'chaudron', 'lanterne', 'escargot', 'p_etoiles'];

/* --- les fruits --- */
D.fraise = function(){ return '<path d="M0,23 C-19,10 -21,-8 -11,-14 C-4,-18 4,-18 11,-14 C21,-8 19,10 0,23 Z" fill="#e8384a"' + st(2.4) + '/>' +
  '<g fill="#ffe9a0">' + pts([[-8,-3],[0,-6],[8,-3],[-5,5],[5,5],[0,13],[-11,4],[11,4]], function(p){ return '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="1.5" ry="2.2"/>'; }) + '</g>' +
  '<path d="M-12,-12 C-7,-21 -2,-15 0,-22 C2,-15 7,-21 12,-12 C6,-9 -6,-9 -12,-12 Z" fill="#4fae5a"' + st(2) + '/>' + reflet('M-13,-3 C-14,3 -11,9 -7,13'); };
D.cerises = function(){ return anime('balance', '70% 8%', '<path d="M-10,8 C-8,-8 2,-18 12,-22 M11,10 C10,-4 10,-14 12,-22" fill="none"' + st(2.4, '#4a7a2c') + '/>' +   /* elles se balancent au bout de leurs queues */
  '<path d="M12,-22 C20,-26 26,-20 22,-14 C18,-12 14,-16 12,-22 Z" fill="#5fbf5a"' + st(1.8) + '/>' +
  '<circle cx="-10" cy="12" r="11" fill="#c81e3a"' + st(2.4) + '/><circle cx="12" cy="13" r="11" fill="#e0304a"' + st(2.4) + '/>' + reflet('M-16,8 C-16,5 -14,3 -12,3') + reflet('M6,9 C6,6 8,4 10,4')); };
D.myrtilles = function(){ return pts([[-9,6,10],[9,7,10],[0,-8,10]], function(p){ return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + p[2] + '" fill="#4a4fa0"' + st(2.2) + '/><path d="M' + (p[0] - 3) + ',' + (p[1] - 2) + ' l3,-3 l3,3 l-3,3 Z" fill="#2c2f66"/>'; }) + reflet('M-15,3 C-15,0 -13,-1 -11,-1', 2) + reflet('M-6,-11 C-6,-14 -4,-15 -2,-15', 2); };
D.framboise = function(){ var s = '<path d="M0,20 C-16,12 -18,-6 -10,-13 C-4,-17 4,-17 10,-13 C18,-6 16,12 0,20 Z" fill="#d83a6a"' + st(2.4) + '/>';
  [[-6,-6],[6,-6],[0,-1],[-9,2],[9,2],[-4,8],[4,8],[0,14],[0,-11]].forEach(function(p){ s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="4.2" fill="#ec5a86" stroke="#a82450" stroke-width="1.2"/>'; });
  return s + '<path d="M-8,-13 C-4,-19 4,-19 8,-13 C3,-11 -3,-11 -8,-13 Z" fill="#4fae5a"' + st(1.8) + '/>'; };
D.orange = function(){ var s = '<circle r="21" fill="#f59a2c"' + st(2.4) + '/><circle r="17" fill="#ffd27a"/>';
  for(var i = 0; i < 8; i++){ var a = i * Math.PI / 4; s += '<path d="M0,0 L' + f1(Math.cos(a) * 16) + ',' + f1(Math.sin(a) * 16) + ' A16,16 0 0 1 ' + f1(Math.cos(a + .68) * 16) + ',' + f1(Math.sin(a + .68) * 16) + ' Z" fill="#f7a93a" stroke="#ffe6b0" stroke-width="1.4"/>'; }
  return s + '<circle r="2.4" fill="#ffe6b0"/>'; };
D.citron = function(){ var s = '<path d="M-21,0 A21,21 0 0 1 21,0 Z" fill="#f2c92c"' + st(2.4) + '/><path d="M-17,-1 A17,17 0 0 1 17,-1 Z" fill="#fff3a8"/>';
  for(var i = 0; i < 5; i++){ var a = Math.PI + (i + .08) * Math.PI / 5; s += '<path d="M0,-1 L' + f1(Math.cos(a) * 16) + ',' + f1(Math.sin(a) * 16 - 1) + ' A16,16 0 0 1 ' + f1(Math.cos(a + .52) * 16) + ',' + f1(Math.sin(a + .52) * 16 - 1) + ' Z" fill="#f9e25a" stroke="#fff7c8" stroke-width="1.2"/>'; }
  return s; };
D.kiwi = function(){ var s = '<ellipse rx="21" ry="19" fill="#8a6a3a"' + st(2.4) + '/><ellipse rx="17.5" ry="15.5" fill="#9ccc4a"/><ellipse rx="6" ry="5" fill="#f4f6d8"/>';
  for(var i = 0; i < 12; i++){ var a = i * Math.PI / 6; s += '<ellipse cx="' + f1(Math.cos(a) * 10.5) + '" cy="' + f1(Math.sin(a) * 9.5) + '" rx="1.1" ry="2" transform="rotate(' + f1(a * 57.3 + 90) + ' ' + f1(Math.cos(a) * 10.5) + ' ' + f1(Math.sin(a) * 9.5) + ')" fill="#2c2418"/>'; }
  return s; };
D.pomme = function(){ return '<path d="M0,6 L0,34" ' + st(5) + '/><path d="M0,6 L0,34" stroke="#d9b98a" stroke-width="2.6" stroke-linecap="round"/>' +
  '<path d="M0,-8 C-10,-20 -24,-10 -22,2 C-20,14 -10,20 0,16 C10,20 20,14 22,2 C24,-10 10,-20 0,-8 Z" fill="#d81e2c"' + st(2.4) + '/>' +
  '<path d="M-22,2 C-14,10 14,10 22,2 C20,14 10,20 0,16 C-10,20 -20,14 -22,2 Z" fill="#a8121e" opacity=".55"/>' + reflet('M-15,-6 C-16,-1 -14,4 -11,7', 3, .6) + '<path d="M0,-9 C1,-14 4,-17 7,-18" fill="none"' + st(2.2, '#5a3a1c') + '/>'; };
D.raisin = function(){ var s = '<path d="M0,-18 C2,-24 8,-26 12,-24" fill="none"' + st(2.4, '#5a7a2c') + '/><path d="M2,-20 C10,-28 20,-22 16,-14 C10,-12 4,-14 2,-20 Z" fill="#6fbf5a"' + st(1.8) + '/>';
  [[-8,-10],[8,-10],[0,-12],[-12,0],[0,-1],[12,0],[-6,10],[6,10],[0,20]].forEach(function(p){ s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="7" fill="#8a4fb8"' + st(1.8) + '/><circle cx="' + (p[0] - 2) + '" cy="' + (p[1] - 2) + '" r="1.8" fill="#fff" opacity=".55"/>'; });
  return s; };
D.ananas = function(){ var s = '<circle r="21" fill="#e8b02c"' + st(2.4) + '/><circle r="16.5" fill="#ffe27a"/><circle r="6" fill="#e8b02c"' + st(1.6, '#b8862e') + '/>';
  for(var i = 0; i < 10; i++){ var a = i * Math.PI / 5; s += '<path d="M' + f1(Math.cos(a) * 7.5) + ',' + f1(Math.sin(a) * 7.5) + ' L' + f1(Math.cos(a) * 15.5) + ',' + f1(Math.sin(a) * 15.5) + '" stroke="#f2c84a" stroke-width="1.6"/>'; }
  return s; };

/* --- les fleurs --- */
function petales(n, rx, ry, d, c, bord){ var s = ''; for(var i = 0; i < n; i++) s += '<ellipse cx="0" cy="' + (-d) + '" rx="' + rx + '" ry="' + ry + '" transform="rotate(' + f1(i * 360 / n) + ')" fill="' + c + '"' + st(1.8, bord) + '/>'; return s; }
D.rose = function(){ return '<path d="M-14,10 C-24,14 -24,22 -12,18 Z M14,10 C24,14 24,22 12,18 Z" fill="#4fae5a"' + st(1.8) + '/>' +
  '<circle r="18" fill="#e0486a"' + st(2.4) + '/><path d="M-13,-3 C-10,-14 10,-14 13,-3 C12,8 -12,8 -13,-3 Z" fill="#ef6f8c"' + st(1.6, '#a82448') + '/>' +
  '<path d="M-7,-2 C-6,-9 6,-9 7,-2 C6,4 -6,4 -7,-2 Z" fill="#f79ab0"' + st(1.4, '#a82448') + '/><path d="M-2,-2 C-1,-5 3,-4 2,-1 C1,1 -2,1 -2,-2 Z" fill="#c8305a"/>'; };
D.marguerite = function(){ return petales(10, 5, 11, 12, '#fffdf4', '#b8a888') + '<circle r="7.5" fill="#f6c52c"' + st(2) + '/>' + '<circle cx="-2" cy="-2" r="2" fill="#fff" opacity=".5"/>'; };
D.pensee = function(){ return '<ellipse cx="-10" cy="-9" rx="11" ry="10" fill="#6a48b8"' + st(2) + '/><ellipse cx="10" cy="-9" rx="11" ry="10" fill="#6a48b8"' + st(2) + '/>' +
  '<ellipse cx="-13" cy="6" rx="10" ry="9" fill="#f2d24a"' + st(2) + '/><ellipse cx="13" cy="6" rx="10" ry="9" fill="#f2d24a"' + st(2) + '/><ellipse cx="0" cy="12" rx="12" ry="10" fill="#f6dd6a"' + st(2) + '/>' +
  '<path d="M0,4 L-6,12 M0,4 L6,12 M0,4 L0,15 M0,4 L-13,6 M0,4 L13,6" stroke="#5a2c8a" stroke-width="1.8" stroke-linecap="round"/><circle cy="3" r="3.4" fill="#f59a2c"' + st(1.4) + '/>'; };
D.lavande = function(){ var s = '<path d="M0,26 C1,10 0,-4 0,-18" fill="none"' + st(2.6, '#5a8a4a') + '/><path d="M0,14 C-8,10 -12,14 -14,20 M0,8 C8,4 12,8 14,14" fill="none"' + st(2.2, '#5a8a4a') + '/>';
  [[-5,-20],[5,-17],[-5,-13],[5,-10],[-5,-6],[5,-3],[0,-25],[-4,1],[4,4]].forEach(function(p){ s += '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="4.6" ry="3.6" fill="#9a7ae0"' + st(1.4, '#5a3ca8') + '/>'; });
  return s; };
D.coquelicot = function(){ return '<path d="M0,2 C-22,-4 -22,-24 -4,-20 C-2,-26 2,-26 4,-20 C22,-24 22,-4 0,2 Z" fill="#e8382c"' + st(2.2) + '/>' +
  '<path d="M0,0 C-22,4 -20,24 -2,18 C0,24 0,24 2,18 C20,24 22,4 0,0 Z" fill="#f04a34"' + st(2.2) + '/><circle r="6.5" fill="#2c2430"' + st(1.4) + '/>' +
  pts([0, 1, 2, 3, 4, 5], function(i){ var a = i * 1.047; return '<circle cx="' + f1(Math.cos(a) * 3.6) + '" cy="' + f1(Math.sin(a) * 3.6) + '" r="1" fill="#f6dd6a"/>'; }); };
D.tulipe = function(){ return anime('balance', '50% 100%', '<path d="M0,28 C0,16 0,10 0,2" fill="none"' + st(2.8, '#4a8a3a') + '/><path d="M0,22 C-12,16 -14,6 -10,2 C-6,8 -2,14 0,22 Z" fill="#5fbf5a"' + st(1.8) + '/>' +   /* elle se balance sur sa tige */
  '<path d="M-13,-18 C-15,-4 -8,6 0,6 C8,6 15,-4 13,-18 L7,-10 L0,-20 L-7,-10 Z" fill="#f47a9c"' + st(2.2) + '/>' + reflet('M-9,-10 C-9,-4 -6,0 -3,2', 2.2)); };
D.feuilles = function(){ return '<path d="M0,10 C-20,12 -28,-4 -22,-14 C-8,-14 0,-4 0,10 Z" fill="#4fae5a"' + st(2.2) + '/><path d="M0,10 C20,12 28,-4 22,-14 C8,-14 0,-4 0,10 Z" fill="#6fc86a"' + st(2.2) + '/>' +
  '<path d="M0,10 C-8,2 -14,-6 -19,-11 M0,10 C8,2 14,-6 19,-11" fill="none" stroke="#2c6a34" stroke-width="1.6" stroke-linecap="round"/>'; };
D.tournesol = function(){ return anime('tourne', '50% 50%', petales(14, 4.6, 10, 15, '#f6c52c', '#b8862e')) + '<circle r="10" fill="#6a4424"' + st(2) + '/>' + pts([[-3,-3],[3,-2],[0,3],[-4,2],[4,3],[0,-5]], function(p){ return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="1.2" fill="#3a2414"/>'; }); };   /* ses pétales tournent doucement */
D.trefle = function(){ return '<path d="M0,6 C2,14 4,20 8,26" fill="none"' + st(2.6, '#3a7a34') + '/>' + pts([0, 90, 180, 270], function(a){ return '<path d="M0,0 C-10,-6 -12,-18 -4,-18 C-1,-18 0,-15 0,-13 C0,-15 1,-18 4,-18 C12,-18 10,-6 0,0 Z" transform="rotate(' + a + ')" fill="#4fbf5a"' + st(1.8) + '/>'; }); };

/* --- les bonbons --- */
D.macaron = function(){ return '<path d="M-20,-3 C-20,-16 20,-16 20,-3 Z" fill="#f79ab8"' + st(2.4) + '/><path d="M-20,5 C-20,17 20,17 20,5 Z" fill="#f79ab8"' + st(2.4) + '/>' +
  '<rect x="-19" y="-4" width="38" height="10" rx="5" fill="#fff4e0"' + st(2) + '/>' + reflet('M-13,-9 C-8,-12 2,-12 8,-11', 2.4); };
D.guimauve = function(){ return '<rect x="-15" y="-17" width="30" height="34" rx="9" fill="#fff"' + st(2.4) + '/>' +
  '<path d="M-15,-6 C-5,-12 5,0 15,-6 L15,4 C5,10 -5,-2 -15,4 Z" fill="#f8adc8"/><path d="M-15,-6 C-5,-12 5,0 15,-6 M-15,4 C-5,-2 5,10 15,4" fill="none" stroke="#e07aa0" stroke-width="1.4"/>' + reflet('M-9,-12 C-6,-14 0,-14 4,-13', 2); };
D.sucredorge = function(){ var s = '<path d="M6,28 L6,-10 C6,-26 -16,-26 -16,-10" fill="none"' + st(11) + '/><path d="M6,28 L6,-10 C6,-26 -16,-26 -16,-10" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/>';
  [[6,22,0],[6,12,0],[6,2,0],[5,-9,-20],[-1,-19,-60],[-10,-20,-110],[-16,-12,-170]].forEach(function(p){ s += '<path d="M-3.5,-3 L3.5,1" transform="translate(' + p[0] + ',' + p[1] + ') rotate(' + p[2] + ')" stroke="#e0304a" stroke-width="4" stroke-linecap="butt"/>'; });
  return s; };
D.papillote = function(){ return '<path d="M-14,0 L-28,-11 L-25,0 L-28,11 Z M14,0 L28,-11 L25,0 L28,11 Z" fill="#8fe3c3"' + st(2.2) + '/><ellipse rx="15" ry="11" fill="#5bc8f0"' + st(2.4) + '/>' +
  '<path d="M-6,-10 C-10,-3 -10,3 -6,10 M4,-10.5 C0,-3 0,3 4,10.5" fill="none" stroke="#fff" stroke-width="2.6" opacity=".75"/>' + reflet('M-10,-5 C-8,-8 -4,-9 0,-9', 2); };
D.sucette = function(){ return '<path d="M0,12 L0,36" ' + st(5.5) + '/><path d="M0,12 L0,36" stroke="#fff" stroke-width="3" stroke-linecap="round"/>' +
  anime('tourne-vite', '50% 50%', '<circle r="19" fill="#f8adc8"' + st(2.4) + '/><path d="M0,0 C6,-2 8,6 2,8 C-8,10 -12,-2 -6,-8 C2,-16 16,-8 14,4 C12,16 -6,20 -14,10" fill="none" stroke="#de4f7c" stroke-width="3.4" stroke-linecap="round"/>') + reflet('M-13,-8 C-10,-13 -5,-15 0,-15', 2.2); };   /* sa spirale tourne */
D.chocolat = function(){ return '<rect x="-18" y="-14" width="36" height="28" rx="4" fill="#5c341c"' + st(2.4) + '/><path d="M0,-14 V14 M-18,0 H18" stroke="#3a1e0e" stroke-width="2"/>' +
  pts([[-9,-7],[9,-7],[-9,7],[9,7]], function(p){ return '<rect x="' + (p[0] - 6) + '" y="' + (p[1] - 4.5) + '" width="12" height="9" rx="2" fill="#7a4a2a"/>'; }) + reflet('M-14,-10 L-5,-10', 2, .4); };
D.biscuit = function(){ var d = ''; for(var i = 0; i < 10; i++){ var a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 10 : 21; d += (i ? 'L' : 'M') + f1(Math.cos(a) * r) + ',' + f1(Math.sin(a) * r) + ' '; }
  return '<path d="' + d + 'Z" fill="#e0a85a"' + st(2.4) + '/><path d="' + d + 'Z" transform="scale(.62)" fill="#fff6e0" stroke="#f8adc8" stroke-width="2"/>' + pts([[-3,-2],[4,1],[0,5]], function(p){ return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="1.4" fill="#de4f7c"/>'; }); };
D.meringue = function(){ return '<path d="M-19,14 C-24,4 -16,-2 -12,-2 C-14,-10 -6,-14 -3,-12 C-3,-20 3,-24 2,-28 C8,-22 6,-16 5,-12 C12,-12 14,-4 12,-2 C18,-2 24,6 19,14 Z" fill="#fffaf0"' + st(2.4) + '/>' +
  '<path d="M-12,-2 C-4,2 6,2 12,-2 M-16,7 C-6,12 8,12 16,7" fill="none" stroke="#e0d0b8" stroke-width="1.8" stroke-linecap="round"/>'; };
D.coeur = function(){ return anime('bat', '50% 55%', '<path d="M0,19 C-24,4 -22,-16 -10,-16 C-4,-16 0,-11 0,-8 C0,-11 4,-16 10,-16 C22,-16 24,4 0,19 Z" fill="#f04a6a"' + st(2.4) + '/>' + reflet('M-13,-8 C-13,-11 -11,-12 -9,-12', 2.6, .6)); };   /* il bat */
D.reglisse = function(){ return '<circle r="19" fill="#2f2b3c"' + st(2.4) + '/><path d="M0,0 C5,-2 7,5 2,7 C-7,9 -11,-2 -5,-8 C2,-15 15,-8 13,4 C11,14 -5,18 -13,9" fill="none" stroke="#5a5470" stroke-width="2.4" stroke-linecap="round"/>' +
  '<circle r="4" fill="#f8adc8"' + st(1.4) + '/>'; };

/* --- la fête --- */
function flamme(y){ return '<g transform="translate(0,' + y + ')">' + fixe(anime('flamme', '50% 92%', '<ellipse cy="-4" rx="11" ry="14" fill="#ffd76a" opacity=".4"/><path d="M0,3 C-7,-2 -5,-10 0,-17 C5,-10 7,-2 0,3 Z" fill="#ffb02c"' + st(1.4, '#c8641c') + '/><path d="M0,2 C-3,-1 -2,-5 0,-9 C2,-5 3,-1 0,2 Z" fill="#fff3b0"/>')) + '</g>'; }   /* la flamme danse */
D.bougie = function(){ return '<rect x="-5" y="-12" width="10" height="38" rx="2.5" fill="#f8adc8"' + st(2.2) + '/><path d="M-5,-4 L5,-9 M-5,6 L5,1 M-5,16 L5,11" stroke="#fff" stroke-width="3" opacity=".85"/>' +
  '<path d="M0,-12 V-17" ' + st(1.8) + '/>' + flamme(-18); };
D.bougie2 = function(){ return '<path d="M-5,26 L-5,-8 C-5,-14 5,-14 5,-8 L5,26 Z" fill="#9ccbf5"' + st(2.2) + '/><path d="M-5,-2 C0,-6 0,2 5,-2 M-5,8 C0,4 0,12 5,8 M-5,18 C0,14 0,22 5,18" fill="none" stroke="#fff" stroke-width="2.4" opacity=".9"/>' +
  '<path d="M0,-12 V-17" ' + st(1.8) + '/>' + flamme(-18); };
D.cierge = function(){ var s = '';   /* il crépite */
  for(var i = 0; i < 8; i++){ var a = i * Math.PI / 4, r = i % 2 ? 15 : 11; s += '<path d="M' + f1(Math.cos(a) * 4) + ',' + f1(Math.sin(a) * 4) + ' L' + f1(Math.cos(a) * r) + ',' + f1(Math.sin(a) * r) + '" stroke="#ffd76a" stroke-width="2.4" stroke-linecap="round"/>'; }
  return '<path d="M0,28 L0,-14" ' + st(3.4, '#6a6a7a') + '/><g transform="translate(0,-18)">' + anime('crepite', '50% 50%', '<circle r="15.5" fill="#ffe9a0" opacity=".3"/>' + s + '<circle r="4.5" fill="#fff6c8"/>') + '</g>'; };
D.fanion = function(){ return '<path d="M-8,28 L-8,-26" ' + st(3.2, '#8a6a3a') + '/><path d="M-8,-25 L20,-16 L-8,-7 Z" fill="#f04a6a"' + st(2.2) + '/><circle cx="-8" cy="-27" r="3" fill="#ecbc4c"' + st(1.6) + '/>' + reflet('M-4,-20 L6,-17', 2, .5); };
D.etoile = function(){ var d = ''; for(var i = 0; i < 10; i++){ var a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 9 : 21; d += (i ? 'L' : 'M') + f1(Math.cos(a) * r) + ',' + f1(Math.sin(a) * r) + ' '; }
  return anime('scintille', '50% 50%', '<path d="' + d + 'Z" fill="#f6c52c"' + st(2.4) + '/>' + reflet('M-6,-6 L-2,-13', 2.6, .7)); };   /* elle scintille */
D.lampion = function(){ return anime('balance', '50% 0%', '<path d="M0,-24 V-17" ' + st(2) + '/><rect x="-7" y="-18" width="14" height="5" rx="1.5" fill="#6a4424"' + st(1.8) + '/><ellipse cy="2" rx="15" ry="17" fill="#f59a2c"' + st(2.4) + '/>' +   /* il se balance à son crochet */
  '<path d="M-8,-12 C-12,-2 -12,8 -8,17 M0,-15 V19 M8,-12 C12,-2 12,8 8,17" fill="none" stroke="#c8641c" stroke-width="1.6"/><ellipse cy="2" rx="6" ry="9" fill="#fff3b0" opacity=".7"/>' +
  '<rect x="-7" y="17" width="14" height="4" rx="1.5" fill="#6a4424"' + st(1.8) + '/><path d="M0,21 V28" stroke="#e0304a" stroke-width="2.4" stroke-linecap="round"/>'); };
D.noeud = function(){ return '<path d="M0,0 C-10,-16 -26,-14 -24,0 C-26,14 -10,16 0,0 Z M0,0 C10,-16 26,-14 24,0 C26,14 10,16 0,0 Z" fill="#de4f7c"' + st(2.4) + '/>' +
  '<path d="M-3,3 L-10,22 L-3,17 L0,24 Z M3,3 L10,22 L3,17 L0,24 Z" fill="#c8305a"' + st(2) + '/><rect x="-5.5" y="-6" width="11" height="12" rx="3.5" fill="#f47a9c"' + st(2) + '/>'; };
D.ballon = function(){ return anime('flotte', '50% 100%', '<path d="M0,10 C-4,18 4,22 0,30" fill="none"' + st(1.8, '#6a6a7a') + '/><path d="M0,10 C-22,4 -20,-24 0,-24 C20,-24 22,4 0,10 Z" fill="#5bc8f0"' + st(2.4) + '/><path d="M-3,10 L3,10 L0,14 Z" fill="#3a9ac8"' + st(1.4) + '/>' + reflet('M-11,-12 C-10,-17 -6,-19 -2,-19', 3, .6)); };   /* il flotte au bout de sa ficelle */
/* --- le farfelu de Brumeval --- */
/* un chat en pâte d'amande, assis ; c : sa robe, v : son ventre, opt : {raye, moustache} (les sept chats d'Odette) */
function chat(c, v, opt){ opt = opt || {}; var b = sombre(c, .45);
  var queue = '<path d="M14,14 C28,16 30,2 22,-2" fill="none"' + st(6.5) + '/><path d="M14,14 C28,16 30,2 22,-2" fill="none" stroke="' + c + '" stroke-width="3.4" stroke-linecap="round"/>';
  var s = (opt.queue ? anime('queue', '4% 92%', queue) : queue) +
    '<path d="M-15,22 C-19,6 -12,-4 0,-4 C12,-4 19,6 15,22 Z" fill="' + c + '"' + st(2.4) + '/><ellipse cy="14" rx="8" ry="9" fill="' + v + '"/>' +
    '<path d="M-14,-12 L-16,-27 L-5,-20 Z M14,-12 L16,-27 L5,-20 Z" fill="' + c + '"' + st(2.2) + '/><path d="M-12.500,-15 L-13.500,-22 L-8,-18.500 Z M12.500,-15 L13.500,-22 L8,-18.500 Z" fill="#f8adc8"/>' +
    '<ellipse cy="-11" rx="15" ry="12.5" fill="' + c + '"' + st(2.4) + '/>';
  if(opt.raye) s += '<path d="M-5,-23 L-4,-17 M0,-24 L0,-17 M5,-23 L4,-17 M-15,10 L-9,11 M-16,16 L-10,16 M15,10 L9,11 M16,16 L10,16" stroke="' + b + '" stroke-width="2" stroke-linecap="round"/>';
  s += '<ellipse cx="-6" cy="-12" rx="2.2" ry="3" fill="' + K + '"/><ellipse cx="6" cy="-12" rx="2.2" ry="3" fill="' + K + '"/><circle cx="-5.300" cy="-13" r=".8" fill="#fff"/><circle cx="6.700" cy="-13" r=".8" fill="#fff"/>' +
    '<path d="M-2,-7 L2,-7 L0,-5 Z" fill="#f47a9c"/><path d="M0,-5 C-1,-2 -4,-2 -5,-4 M0,-5 C1,-2 4,-2 5,-4" fill="none" stroke="' + K + '" stroke-width="1.3" stroke-linecap="round"/>';
  s += opt.moustache ? '<path d="M-4,-5 C-12,-8 -18,-4 -22,-7 M-4,-4 C-12,-3 -17,1 -21,0 M4,-5 C12,-8 18,-4 22,-7 M4,-4 C12,-3 17,1 21,0" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>' :
    '<path d="M-7,-6 L-16,-8 M-7,-4 L-16,-3 M7,-6 L16,-8 M7,-4 L16,-3" stroke="' + b + '" stroke-width="1" stroke-linecap="round"/>';
  return s + '<ellipse cx="-7" cy="22" rx="5" ry="3" fill="' + v + '"' + st(1.6) + '/><ellipse cx="7" cy="22" rx="5" ry="3" fill="' + v + '"' + st(1.6) + '/>'; }
D.moustache = function(){ return chat('#8a8a9a', '#c8c8d4', {moustache:true, queue:true}); };   /* il remue la queue */
D.biscotte = function(){ return chat('#e0b888', '#f6e6c8'); };
D.pompon = function(){ return chat('#fdfaf2', '#ffffff'); };
D.caramel = function(){ return chat('#e08a3a', '#f6d8a8', {raye:true}); };
D.mistigri = function(){ return chat('#3a3444', '#5a546a'); };
D.noisette = function(){ return chat('#8a5a34', '#c89a6a', {raye:true}); };
D.grisette = function(){ return chat('#c4c4d0', '#eeeef4'); };
D.oie = function(){ return anime('dandine', '50% 100%', '<path d="M-20,8 C-22,-6 -8,-10 4,-6 C6,-18 8,-26 14,-26 C22,-26 22,-18 16,-16 C14,-8 18,2 14,10 C8,18 -14,18 -20,8 Z" fill="#fffdf6"' + st(2.4) + '/>' +   /* elle se dandine */
  '<path d="M19,-23 L29,-21 L20,-18 Z" fill="#f59a2c"' + st(1.8) + '/><circle cx="15" cy="-22" r="1.6" fill="' + K + '"/><path d="M-14,4 C-8,0 2,2 6,8" fill="none" stroke="#d8d0c0" stroke-width="2" stroke-linecap="round"/>' +
  '<path d="M-6,16 L-8,25 L-13,25 M4,16 L4,25 L-1,25" fill="none"' + st(2.4, '#f59a2c') + '/>'); };
D.champignon = function(){ return '<path d="M-8,2 C-10,14 -9,22 -7,24 L7,24 C9,22 10,14 8,2 Z" fill="#fff6e0"' + st(2.4) + '/><path d="M-24,2 C-24,-24 24,-24 24,2 C14,6 -14,6 -24,2 Z" fill="#e0304a"' + st(2.4) + '/>' +
  pts([[-12,-8,4.5],[2,-14,5],[13,-5,3.6],[-2,-2,2.8]], function(p){ return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + p[2] + '" fill="#fff"/>'; }); };
D.lanterne = function(){ return anime('lueur', '50% 50%', '<circle cy="2" r="25" fill="#ffe27a" opacity=".5"/>') + '<path d="M-4,-22 A5,5 0 1 1 4,-22" fill="none"' + st(2.4, '#8a6a1e') + '/>' +   /* elle luit */
  '<path d="M-12,-20 L12,-20 L9,-13 L-9,-13 Z" fill="#ecbc4c"' + st(2.2) + '/><path d="M-10,-13 L10,-13 L13,16 L-13,16 Z" fill="#fff3b0"' + st(2.2) + '/>' +
  '<path d="M-4,-13 L-5,16 M4,-13 L5,16" stroke="#b8862e" stroke-width="2"/><path d="M-15,16 L15,16 L12,23 L-12,23 Z" fill="#ecbc4c"' + st(2.2) + '/>' + fixe(anime('flamme', '50% 100%', '<path d="M0,8 C-4,5 -3,0 0,-5 C3,0 4,5 0,8 Z" fill="#ffb02c"/>')); };
D.cle = function(){ return '<circle cx="-14" r="10" fill="none"' + st(7.5) + '/><circle cx="-14" r="10" fill="none" stroke="#b8862e" stroke-width="4"/>' +
  '<path d="M-4,0 L24,0 M14,0 L14,9 M21,0 L21,7" fill="none"' + st(7.5) + '/><path d="M-4,0 L24,0 M14,0 L14,9 M21,0 L21,7" fill="none" stroke="#b8862e" stroke-width="4" stroke-linecap="round"/>' +
  '<path d="M2,-1.500 l3,3 M8,-1.500 l-3,3" stroke="#8ff3ff" stroke-width="1.3"/>'; };
D.plume = function(){ return '<path d="M-16,24 C-6,10 6,-6 14,-24" fill="none"' + st(2.4, '#6a6a7a') + '/><path d="M-12,18 C-22,4 -10,-20 14,-26 C20,-6 6,14 -12,18 Z" fill="#2c2838"' + st(2.2) + '/>' +
  '<path d="M-6,8 L-14,2 M0,-2 L-9,-7 M6,-12 L-2,-17 M-4,12 L6,10 M3,2 L12,0 M9,-8 L15,-10" stroke="#5a5470" stroke-width="1.5" stroke-linecap="round"/>'; };
D.sardine = function(){ return '<path d="M-24,0 C-14,-12 10,-12 18,0 C10,12 -14,12 -24,0 Z" fill="#9cc0d8"' + st(2.4) + '/><path d="M16,0 L28,-10 L25,0 L28,10 Z" fill="#7aa4c4"' + st(2.2) + '/>' +
  '<path d="M-24,0 C-14,6 8,6 18,0 C10,12 -14,12 -24,0 Z" fill="#e8f2f8"/><circle cx="-15" cy="-2" r="2.6" fill="#fff"' + st(1.4) + '/><circle cx="-15" cy="-2" r="1" fill="' + K + '"/>' +
  '<path d="M-8,-6 C-6,-2 -6,2 -8,6 M0,-7 C2,-2 2,2 0,7 M8,-6 C10,-2 10,2 8,5" fill="none" stroke="#5a84a4" stroke-width="1.4"/>'; };
D.chaudron = function(){ return anime('vapeur', '50% 100%', '<path d="M-16,-10 C-20,-22 -8,-24 -6,-16 C-2,-26 8,-24 6,-15 C12,-22 20,-16 15,-9" fill="#8fe3c3" stroke="#3aa884" stroke-width="1.6" opacity=".9"/>') +   /* sa vapeur monte */
  '<path d="M-22,-8 C-26,14 -14,22 0,22 C14,22 26,14 22,-8 Z" fill="#3a3444"' + st(2.4) + '/><ellipse cy="-8" rx="23" ry="6" fill="#5a546a"' + st(2.4) + '/><ellipse cy="-8" rx="17" ry="3.6" fill="#6fd8a8"/>' +
  '<path d="M-12,21 L-15,27 M12,21 L15,27" ' + st(4) + '/>' + reflet('M-17,0 C-17,8 -13,14 -8,16', 2.4, .3); };
D.grenouille = function(){ return anime('saute', '50% 100%', '<path d="M-22,14 C-26,2 -14,-8 0,-8 C14,-8 26,2 22,14 C12,22 -12,22 -22,14 Z" fill="#6fbf4a"' + st(2.4) + '/><ellipse cy="12" rx="12" ry="7" fill="#d8eeb0"/>' +   /* elle saute */
  '<circle cx="-10" cy="-12" r="8" fill="#6fbf4a"' + st(2.2) + '/><circle cx="10" cy="-12" r="8" fill="#6fbf4a"' + st(2.2) + '/><circle cx="-10" cy="-12" r="4.4" fill="#fff"/><circle cx="10" cy="-12" r="4.4" fill="#fff"/>' +
  '<circle cx="-9" cy="-12" r="2" fill="' + K + '"/><circle cx="11" cy="-12" r="2" fill="' + K + '"/><path d="M-10,2 C-4,8 4,8 10,2" fill="none"' + st(1.8) + '/>'); };
D.cornichon = function(){ return '<path d="M-22,6 C-26,-8 -10,-16 4,-14 C18,-12 28,-2 22,8 C16,16 -16,18 -22,6 Z" fill="#7aa83a"' + st(2.4) + '/>' +
  pts([[-12,-4],[-2,-8],[8,-5],[15,2],[-8,6],[4,5],[-16,3]], function(p){ return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="1.7" fill="#4a7a24"/>'; }) + reflet('M-16,-4 C-10,-10 0,-11 8,-10', 2.2, .4); };
D.chaussette = function(){ return '<path d="M-10,-24 L8,-24 L8,2 C20,4 26,10 24,18 C22,26 6,24 -4,20 C-10,16 -10,8 -10,-24 Z" fill="#f6efe0"' + st(2.4) + '/>' +
  '<path d="M-10,-14 L8,-14 M-10,-6 L8,-6 M-9,3 L9,3" stroke="#e0304a" stroke-width="4"/><rect x="-11.500" y="-26" width="21" height="7" rx="2.5" fill="#5bc8f0"' + st(2) + '/><path d="M12,8 C18,8 22,12 22,17" fill="none" stroke="#e0304a" stroke-width="3" stroke-linecap="round"/>'; };
D.fromage = function(){ return '<path d="M-24,12 L22,-12 L24,12 Z" fill="#f6c52c"' + st(2.4) + '/><path d="M-24,12 L24,12 L24,20 L-24,20 Z" fill="#e0a82c"' + st(2.4) + '/>' +
  '<circle cx="6" cy="4" r="4.4" fill="#d89a1e"/><circle cx="-8" cy="8" r="2.6" fill="#d89a1e"/><circle cx="16" cy="-2" r="2.6" fill="#d89a1e"/><circle cx="12" cy="16" r="2" fill="#c8881a"/>'; };
D.escargot = function(){ return '<path d="M-24,18 C-28,10 -18,8 -10,12 L20,12 C28,12 28,20 20,20 L-18,20 Z" fill="#f2d5a0"' + st(2.4) + '/>' +
  anime('antennes', '55% 100%', '<path d="M-22,10 L-26,-2 M-16,10 L-16,-3" ' + st(2.2) + '/><circle cx="-26" cy="-3" r="2.4" fill="' + K + '"/><circle cx="-16" cy="-4" r="2.4" fill="' + K + '"/>') +   /* ses antennes bougent */
  '<circle cx="6" cy="0" r="17" fill="#c8783a"' + st(2.4) + '/><path d="M6,0 C10,-2 12,4 8,6 C0,8 -3,-2 2,-7 C8,-13 19,-7 18,3 C17,12 4,15 -3,8" fill="none" stroke="#7a4420" stroke-width="2.4" stroke-linecap="round"/>'; };
/* --- les paillettes : une pincée (un petit nuage de grains, toujours le même pour une sorte) --- */
function pincee(sorte){ var R = graine(sorte.length * 7 + sorte.charCodeAt(0)), s = '', n = 13, paires = '', impaires = '';
  var COUL = ['#f04a6a', '#5bc8f0', '#f6c52c', '#6fc86a', '#bba5ea', '#f59a2c', '#ffffff'];
  for(var i = 0; i < n; i++){ var a = R() * 6.283, d = Math.sqrt(R()) * 21, x = Math.cos(a) * d, y = Math.sin(a) * d * .8, rot = R() * 180, c = COUL[i % COUL.length];
    if(sorte === 'confettis') s += '<rect x="-3.500" y="-1.600" width="7" height="3.200" rx="1.600" transform="translate(' + f1(x) + ',' + f1(y) + ') rotate(' + f1(rot) + ')" fill="' + c + '" stroke="' + K + '" stroke-width=".7"/>';
    else if(sorte === 'perles') s += '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="' + f1(2.2 + R() * 1.4) + '" fill="#e8eef4" stroke="#8a94a4" stroke-width=".9"/><circle cx="' + f1(x - .8) + '" cy="' + f1(y - .8) + '" r=".8" fill="#fff"/>';
    else if(sorte === 'etoiles'){ var dd = ''; for(var k = 0; k < 10; k++){ var aa = -1.5708 + k * .6283, rr = k % 2 ? 2 : 4.6; dd += (k ? 'L' : 'M') + f1(Math.cos(aa) * rr) + ',' + f1(Math.sin(aa) * rr) + ' '; }
      var et = '<path d="' + dd + 'Z" transform="translate(' + f1(x) + ',' + f1(y) + ') rotate(' + f1(rot) + ')" fill="#ffd21f" stroke="#b8862e" stroke-width=".8"/>'; if(i % 2) impaires += et; else paires += et; }
    else if(sorte === 'coeurs') s += '<path d="M0,3.800 C-5,.8 -4.400,-3.400 -2,-3.400 C-.8,-3.400 0,-2.400 0,-1.700 C0,-2.400 .8,-3.400 2,-3.400 C4.400,-3.400 5,.8 0,3.800 Z" transform="translate(' + f1(x) + ',' + f1(y) + ') rotate(' + f1(rot - 90) + ')" fill="' + (i % 2 ? '#f04a6a' : '#f8adc8') + '" stroke="#a82448" stroke-width=".7"/>';
    else if(sorte === 'vermicelles') s += '<rect x="-4" y="-1.300" width="8" height="2.600" rx="1.300" transform="translate(' + f1(x) + ',' + f1(y) + ') rotate(' + f1(rot) + ')" fill="' + (i % 3 ? '#5c341c' : '#8a5a34') + '" stroke="#2c1608" stroke-width=".6"/>';
    else s += '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="' + f1(1.4 + R() * 2.2) + '" fill="#fff" opacity=".92"/>';   /* la neige de sucre */
  }
  if(sorte === 'etoiles') return anime('clin', null, paires) + anime('clin2', null, impaires);   /* elles clignotent, une sur deux à la fois */
  return s; }
['confettis', 'perles', 'etoiles', 'coeurs', 'vermicelles', 'neige'].forEach(function(n){ D['p_' + n] = function(){ return pincee(n); }; });

/* --- la chantilly et les boules de glace --- */
function rosette(c){ var o = sombre(c, .22), l = clair(c, .5);
  return '<ellipse cy="12" rx="20" ry="9" fill="' + c + '"' + st(2.2) + '/><path d="M-20,12 C-14,6 -8,16 -2,8 C4,16 10,6 20,12" fill="none" stroke="' + o + '" stroke-width="1.6"/>' +
    '<ellipse cy="2" rx="15" ry="8" fill="' + c + '"' + st(2.2) + '/><path d="M-15,2 C-9,-3 -4,6 2,-1 C7,5 11,-2 15,2" fill="none" stroke="' + o + '" stroke-width="1.6"/>' +
    '<path d="M-10,-6 C-10,-13 -3,-12 -1,-16 C0,-21 4,-23 3,-27 C8,-20 6,-14 10,-6 C6,-1 -6,-1 -10,-6 Z" fill="' + c + '"' + st(2.2) + '/><path d="M-5,-8 C-2,-12 2,-13 4,-17" fill="none" stroke="' + l + '" stroke-width="2" stroke-linecap="round"/>'; }
function boule(c){ var o = sombre(c, .25);
  return '<path d="M-21,8 C-23,16 -17,18 -14,12 C-11,20 -5,20 -3,13 C1,20 8,19 9,12 C13,19 22,17 21,8 Z" fill="' + c + '"' + st(2.2) + '/><circle cy="-2" r="19" fill="' + c + '"' + st(2.4) + '/>' +
    '<path d="M-21,8 C-12,13 12,13 21,8" fill="none" stroke="' + o + '" stroke-width="1.6"/>' + reflet('M-12,-10 C-10,-15 -5,-17 0,-17', 3, .55) + pts([[5,-4],[-4,2],[9,5]], function(p){ return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="1.3" fill="' + o + '"/>'; }); }
D.r_blanche = function(){ return rosette('#fffaf0'); };
D.r_rose = function(){ return rosette('#f8adc8'); };
D.r_chocolat = function(){ return rosette('#7a4a2a'); };
D.r_menthe = function(){ return rosette('#8fe3c3'); };
D.b_vanille = function(){ return boule('#fbe9a8'); };
D.b_fraise = function(){ return boule('#f47a9c'); };
D.b_pistache = function(){ return boule('#a8d07a'); };
D.nuage = function(){ return '<path d="M-26,12 C-34,2 -24,-10 -14,-6 C-14,-20 6,-24 10,-10 C20,-16 32,-4 24,6 C30,14 18,20 10,16 C2,22 -12,22 -16,16 C-22,18 -26,16 -26,12 Z" fill="#fffaf0"' + st(2.4) + '/>' +
  '<path d="M-14,-6 C-8,-4 -4,0 -4,6 M10,-10 C6,-6 6,-2 8,2 M-16,16 C-10,12 -4,12 0,14" fill="none" stroke="#e0d0b8" stroke-width="1.8" stroke-linecap="round"/>'; };

/* Les catégories de décorations, dans l'ordre de la colonne de droite ; son : le bruit de la catégorie (mj-gateau.js, SONS) */
var CATS = [
  {id:'fruits', nom:'Fruits', son:'fruit', l:[['fraise', 'Fraise'], ['cerises', 'Cerises'], ['myrtilles', 'Myrtilles'], ['framboise', 'Framboise'], ['orange', 'Orange'], ['citron', 'Citron'], ['kiwi', 'Kiwi'], ['raisin', 'Raisin'], ['ananas', 'Ananas'], ['pomme', 'Pomme d\'amour']]},
  {id:'fleurs', nom:'Fleurs', son:'fleur', l:[['rose', 'Rose'], ['marguerite', 'Marguerite'], ['pensee', 'Pensée sauvage'], ['lavande', 'Lavande'], ['coquelicot', 'Coquelicot'], ['tulipe', 'Tulipe'], ['tournesol', 'Tournesol'], ['trefle', 'Trèfle'], ['feuilles', 'Feuilles']]},
  {id:'bonbons', nom:'Bonbons', son:'bonbon', l:[['macaron', 'Macaron'], ['guimauve', 'Guimauve'], ['sucredorge', 'Sucre d\'orge'], ['papillote', 'Papillote'], ['sucette', 'Sucette'], ['chocolat', 'Chocolat'], ['biscuit', 'Biscuit étoile'], ['meringue', 'Meringue'], ['coeur', 'Cœur en sucre'], ['reglisse', 'Réglisse']]},
  {id:'fete', nom:'Fête', son:'fete', l:[['bougie', 'Bougie'], ['bougie2', 'Bougie bleue'], ['cierge', 'Cierge magique'], ['fanion', 'Fanion'], ['etoile', 'Étoile'], ['lampion', 'Lampion'], ['noeud', 'Nœud'], ['ballon', 'Ballon']]},
  {id:'farfelu', nom:'Farfelu', son:'farfelu', l:[['moustache', 'Moustache'], ['biscotte', 'Biscotte'], ['pompon', 'Pompon'], ['caramel', 'Caramel'], ['mistigri', 'Mistigri'], ['noisette', 'Noisette'], ['grisette', 'Grisette'],
    ['oie', 'L\'oie de Gaspard'], ['champignon', 'Champignon'], ['lanterne', 'Lanterne d\'or'], ['cle', 'Vieille clé'], ['plume', 'Plume noire'], ['sardine', 'Sardine'], ['chaudron', 'Chaudron'], ['grenouille', 'Grenouille'], ['cornichon', 'Cornichon'], ['chaussette', 'Chaussette'], ['fromage', 'Fromage'], ['escargot', 'Escargot']]},
  {id:'paillettes', nom:'Paillettes', son:'paillettes', l:[['p_confettis', 'Confettis'], ['p_perles', 'Perles d\'argent'], ['p_etoiles', 'Étoiles d\'or'], ['p_coeurs', 'Petits cœurs'], ['p_vermicelles', 'Vermicelles'], ['p_neige', 'Neige de sucre']]},
  {id:'chantilly', nom:'Chantilly', son:'chantilly', l:[['r_blanche', 'Rosette'], ['r_rose', 'Rosette rose'], ['r_chocolat', 'Rosette chocolat'], ['r_menthe', 'Rosette menthe'], ['nuage', 'Gros nuage'], ['b_vanille', 'Boule vanille'], ['b_fraise', 'Boule fraise'], ['b_pistache', 'Boule pistache']]}
];
var DECOS = {};
CATS.forEach(function(c){ c.l = c.l.map(function(e){ var d = {id:e[0], nom:e[1], cat:c.id, son:c.son, dessin:D[e[0]], r:27, anime:ANIMEES.indexOf(e[0]) >= 0, p:PRINC[e[0]]}; DECOS[d.id] = d; return d; }); });

/* ---------- Les icônes des catégories (des médaillons ronds, comme les lieux de la carte) ---------- */
function mini(id, k, dx, dy){ return '<g transform="translate(' + (dx || 0) + ',' + (dy || 0) + ') scale(' + (k || .8) + ')">' + D[id]() + '</g>'; }
var ICONES = {
  etages:function(){ return '<ellipse cy="19" rx="23" ry="4" fill="#fffaf0"' + st(2) + '/><rect x="-19" y="6" width="38" height="13" rx="3" fill="#f8adc8"' + st(2.2) + '/><rect x="-13" y="-6" width="26" height="12" rx="3" fill="#fff8ea"' + st(2.2) + '/><rect x="-8" y="-17" width="16" height="11" rx="3" fill="#8fe3c3"' + st(2.2) + '/>' +
    '<path d="M0,-17 V-22" ' + st(1.8) + '/><path d="M0,-22 C-3,-25 -2,-28 0,-31 C2,-28 3,-25 0,-22 Z" fill="#ffb02c"' + st(1.2, '#c8641c') + '/>'; },
  pate:function(){ return '<path d="M-22,14 L20,-12 L22,14 Z" fill="#f2d58a"' + st(2.4) + '/><path d="M-22,14 L22,14 L22,22 L-22,22 Z" fill="#e0b85a"' + st(2.4) + '/><path d="M-9,6 L21,2 M-22,14 L22,14" stroke="#fff3d6" stroke-width="3.4"/>' +
    '<path d="M-22,14 L20,-12 L22,-4 L-12,16 Z" fill="#f8adc8"' + st(2) + '/>'; },
  glacage:function(){ return '<path d="M-22,-10 C-22,-22 22,-22 22,-10 L22,-2 C22,6 16,6 16,-1 C16,-6 10,-6 10,0 L10,10 C10,18 2,18 2,10 L2,2 C2,-5 -5,-5 -5,2 L-5,6 C-5,13 -13,13 -13,6 L-13,-1 C-13,-6 -19,-5 -19,0 C-19,5 -22,4 -22,-2 Z" fill="#de4f7c"' + st(2.4) + '/>' + reflet('M-15,-14 C-8,-17 4,-17 12,-15', 2.6) +
    '<circle cx="10" cy="20" r="3.4" fill="#de4f7c"' + st(1.6) + '/>'; },
  motif:function(){ return '<circle r="21" fill="#9ccbf5"' + st(2.4) + '/><path d="M-21,0 A21,21 0 0 1 0,-21 L0,21 A21,21 0 0 1 -21,0 Z" fill="#fff8ea"/><path d="M-14,-15.500 V15.500 M-7,-19.800 V19.800" stroke="#f8adc8" stroke-width="3.400"/>' +
    pts([[7,-10],[14,-2],[6,2],[12,10],[5,13]], function(p){ return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="2.8" fill="#fff"/>'; }) + '<circle r="21" fill="none"' + st(2.4) + '/><path d="M0,-21 V21" ' + st(1.6) + '/>'; },
  creme:function(){ return '<path d="M-22,-20 L10,-20 L-2,10 L-9,10 Z" fill="#fff8ea"' + st(2.4) + '/><path d="M-9,10 L-2,10 L-4,18 L-7,18 Z" fill="#c8c8d4"' + st(2) + '/>' +
    '<g transform="translate(13,13) scale(.52)">' + rosette('#f8adc8') + '</g>' + reflet('M-17,-15 L-10,3', 2.4, .6); },
  couleurs:function(){ return '<path d="M-2,-21 C-18,-21 -27,-9 -24,4 C-22,15 -11,21 0,19 C6,18 5,12 1,10 C-3,6 2,1 9,3 C18,6 25,-1 22,-9 C19,-17 10,-21 -2,-21 Z" fill="#f2d5a0"' + st(2.4) + '/>' +
    '<circle cx="-13" cy="-7" r="4.4" fill="#ff2f45"' + st(1.4) + '/><circle cx="-3" cy="-13" r="4.4" fill="#ffd91f"' + st(1.4) + '/><circle cx="9" cy="-10" r="4.4" fill="#2f9bff"' + st(1.4) + '/><circle cx="-15" cy="5" r="4.4" fill="#3fd44a"' + st(1.4) + '/>' +
    '<path d="M8,25 L21,8" ' + st(6.5) + '/><path d="M8,25 L21,8" stroke="#c98a4e" stroke-width="3.4" stroke-linecap="round"/><path d="M19,10 C22,4 26,1 29,-3 C28,3 27,8 23,12 Z" fill="#ff6fc0"' + st(1.8) + '/>'; },
  table:function(){ return '<ellipse cy="-8" rx="23" ry="6" fill="#fffaf0"' + st(2.4) + '/><path d="M-5,-3 C-5,8 -4,12 -11,17 L11,17 C4,12 5,8 5,-3 Z" fill="#fffaf0"' + st(2.4) + '/><ellipse cy="18" rx="15" ry="4" fill="#e8dcc8"' + st(2.2) + '/>' +
    '<path d="M-17,-9 C-8,-6 8,-6 17,-9" fill="none" stroke="#5b8fd8" stroke-width="2"/>'; },
  fruits:function(){ return mini('fraise', .92, 0, 0); },
  fleurs:function(){ return mini('marguerite', .88, 0, 0); },
  bonbons:function(){ return mini('sucette', .78, 0, -6); },
  fete:function(){ return mini('bougie', .86, 0, 4); },
  farfelu:function(){ return mini('moustache', .8, 0, 0); },
  paillettes:function(){ return mini('p_confettis', .95, 0, 0); },
  chantilly:function(){ return mini('r_blanche', .82, 0, 5); }
};
function icone(id){ return '<svg viewBox="-30 -30 60 60" aria-hidden="true">' + (ICONES[id] ? ICONES[id]() : '') + '</svg>'; }
function icoBrut(id){ return ICONES[id] ? ICONES[id]() : ''; }   /* le dessin seul (pour la démo de l'accueil) */
/* le dessin d'une décoration ; c (facultatif) : la couleur du pinceau qui l'a repeinte */
function dessinDeco(id, c){ var s = D[id](); return c && PRINC[id] ? teinter(s, PRINC[id], c) : s; }
function svgDeco(id, k){ return '<svg viewBox="-30 -30 60 60" aria-hidden="true"><g transform="scale(' + (k || .9) + ')">' + D[id]() + '</g></svg>'; }

/* ---------- Les jetons des choix (une pastille de couleur, une petite forme…) ---------- */
function jetonCouleur(g){ return '<svg viewBox="-30 -30 60 60" aria-hidden="true">' + (g.arc ? '<defs><linearGradient id="gtj-arc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f47a9c"/><stop offset=".25" stop-color="#f6c52c"/><stop offset=".5" stop-color="#8fe3c3"/><stop offset=".75" stop-color="#9ccbf5"/><stop offset="1" stop-color="#bba5ea"/></linearGradient></defs>' : '') +
  '<path d="M-20,-6 C-20,-22 20,-22 20,-6 C24,6 14,22 0,22 C-14,22 -24,6 -20,-6 Z" fill="' + (g.arc ? 'url(#gtj-arc)' : g.c) + '"' + st(2.6) + '/>' + reflet('M-13,-9 C-9,-14 0,-16 8,-14', 3, .55) + '</svg>'; }
function jetonPate(p){ var c = p.c, o = sombre(c, .2), s = '<svg viewBox="-30 -30 60 60" aria-hidden="true"><path d="M-22,-12 L22,-12 L22,16 C22,20 -22,20 -22,16 Z" fill="' + c + '"' + st(2.6) + '/>';
  if(p.arc) s += pts([['#f47a9c', -12], ['#f6c52c', -5], ['#8fe3c3', 2], ['#9ccbf5', 9]], function(e){ return '<rect x="-21" y="' + e[1] + '" width="42" height="7" fill="' + e[0] + '"/>'; }) + '<path d="M-22,-12 L22,-12 L22,16 C22,20 -22,20 -22,16 Z" fill="none"' + st(2.6) + '/>';
  else s += '<path d="M-21,0 H21" stroke="#fff3d6" stroke-width="4"/>' + pts([[-12,-6],[2,-7],[12,-4],[-6,8],[8,9],[-15,10]], function(q){ return '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="1.5" fill="' + o + '"/>'; });
  return s + '</svg>'; }
var JETONS = {
  /* les formes d'un étage, vues de dessus */
  rond:'<circle r="19" fill="#f2d58a"' + st(2.6) + '/>',
  carre:'<rect x="-17" y="-17" width="34" height="34" rx="3" fill="#f2d58a"' + st(2.6) + '/>',
  pans:'<path d="M-10,-18 L10,-18 L20,0 L10,18 L-10,18 L-20,0 Z" fill="#f2d58a"' + st(2.6) + '/>',
  cannele:'<path d="' + (function(){ var d = ''; for(var i = 0; i < 24; i++){ var a = i * Math.PI / 12, r = i % 2 ? 16 : 21; d += (i ? 'L' : 'M') + f1(Math.cos(a) * r) + ',' + f1(Math.sin(a) * r) + ' '; } return d + 'Z'; })() + '" fill="#f2d58a"' + st(2.4) + '/><circle r="6" fill="#e0b85a"' + st(1.8) + '/>',
  plus:'<rect x="-18" y="2" width="36" height="14" rx="3" fill="#f8adc8"' + st(2.4) + '/><path d="M0,-22 V-4 M-9,-13 H9" ' + st(5.5, '#2c8a4a') + '/>',
  moins:'<rect x="-18" y="2" width="36" height="14" rx="3" fill="#f8adc8"' + st(2.4) + '/><path d="M-9,-13 H9" ' + st(5.5, '#c8302c') + '/>',
  penche:'<g transform="rotate(-9)"><rect x="-19" y="4" width="38" height="14" rx="3" fill="#f8adc8"' + st(2.4) + '/></g><g transform="rotate(8)"><rect x="-13" y="-12" width="26" height="14" rx="3" fill="#8fe3c3"' + st(2.4) + '/></g>',
  origine:'<path d="M-13,-9 A16,16 0 1 1 -15,6" fill="none"' + st(4.6, '#24182e') + '/><path d="M-21,-13 L-11,-16 L-9,-5 Z" fill="#24182e"' + st(2.4, '#24182e') + '/>',
  sans:'<circle r="18" fill="none"' + st(3, '#c8302c') + '/><path d="M-12.500,12.500 L12.500,-12.500" ' + st(3, '#c8302c') + '/>',
  /* les motifs du glaçage */
  lisse:'<rect x="-20" y="-16" width="40" height="32" rx="4" fill="#f8adc8"' + st(2.6) + '/>' + reflet('M-14,-10 H4', 3, .55),
  coulant:'<rect x="-20" y="-16" width="40" height="32" rx="4" fill="#f2d58a"' + st(2.6) + '/><path d="M-20,-12 C-20,-17 20,-17 20,-12 L20,-4 C20,2 15,2 15,-3 C15,-7 9,-7 9,-2 L9,6 C9,12 2,12 2,6 L2,0 C2,-5 -5,-5 -5,0 L-5,3 C-5,8 -12,8 -12,3 L-12,-2 C-12,-6 -20,-5 -20,-1 Z" fill="#5c341c"' + st(2) + '/>',
  moitie:'<rect x="-20" y="-16" width="40" height="32" rx="4" fill="#f2d58a"' + st(2.6) + '/><path d="M-20,-12 C-20,-17 20,-17 20,-12 L20,0 C14,5 8,-4 0,1 C-8,6 -14,-3 -20,1 Z" fill="#f8adc8"' + st(2) + '/>',
  pois:'<rect x="-20" y="-16" width="40" height="32" rx="4" fill="#9ccbf5"' + st(2.6) + '/>' + pts([[-11,-7],[1,-9],[12,-6],[-6,3],[7,4],[-13,10],[1,11],[13,10]], function(p){ return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3" fill="#fff"/>'; }),
  rayures:'<rect x="-20" y="-16" width="40" height="32" rx="4" fill="#fff8ea"' + st(2.6) + '/><path d="M-12,-15 V15 M-4,-15 V15 M4,-15 V15 M12,-15 V15" stroke="#de4f7c" stroke-width="4"/><rect x="-20" y="-16" width="40" height="32" rx="4" fill="none"' + st(2.6) + '/>',
  vagues:'<rect x="-20" y="-16" width="40" height="32" rx="4" fill="#8fe3c3"' + st(2.6) + '/><path d="M-19,-7 C-13,-12 -7,-2 0,-7 C7,-12 13,-2 19,-7 M-19,2 C-13,-3 -7,7 0,2 C7,-3 13,7 19,2 M-19,11 C-13,6 -7,16 0,11 C7,6 13,16 19,11" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>'
};
function jeton(id){ return '<svg viewBox="-30 -30 60 60" aria-hidden="true">' + (JETONS[id] || '') + '</svg>'; }
/* une bordure de crème, en petit */
function jetonCreme(style){ var s = '<svg viewBox="-30 -30 60 60" aria-hidden="true"><path d="M-24,2 L24,2 L24,18 L-24,18 Z" fill="#f2d58a"' + st(2.4) + '/>';
  for(var i = 0; i < 5; i++) s += '<g transform="translate(' + (-18 + i * 9) + ',0)">' + bouleCreme(style, '#fff8ea', 1.25) + '</g>';
  return s + '</svg>'; }
/* une bouchée de crème de la bordure (dessinée autour de 0,0, posée sur le bord) ; k : la taille */
function bouleCreme(style, c, k){ var o = sombre(c, .22), l = clair(c, .55); k = k || 1;
  if(style === 'perles') return '<circle r="' + f1(5 * k) + '" fill="' + c + '" stroke="' + o + '" stroke-width="1.2"/><circle cx="' + f1(-1.5 * k) + '" cy="' + f1(-1.6 * k) + '" r="' + f1(1.5 * k) + '" fill="' + l + '"/>';
  if(style === 'rosettes') return '<circle r="' + f1(7 * k) + '" fill="' + c + '" stroke="' + o + '" stroke-width="1.2"/><path d="M0,0 C' + f1(2.4 * k) + ',' + f1(-1 * k) + ' ' + f1(3 * k) + ',' + f1(2.6 * k) + ' 0,' + f1(3.2 * k) + ' C' + f1(-4.2 * k) + ',' + f1(3.6 * k) + ' ' + f1(-5 * k) + ',' + f1(-2 * k) + ' ' + f1(-1 * k) + ',' + f1(-4.4 * k) + '" fill="none" stroke="' + o + '" stroke-width="1.3" stroke-linecap="round"/>';
  if(style === 'festons') return '<path d="M' + f1(-7.5 * k) + ',' + f1(-2 * k) + ' C' + f1(-7.5 * k) + ',' + f1(8 * k) + ' ' + f1(7.5 * k) + ',' + f1(8 * k) + ' ' + f1(7.5 * k) + ',' + f1(-2 * k) + ' C' + f1(4 * k) + ',' + f1(-5 * k) + ' ' + f1(-4 * k) + ',' + f1(-5 * k) + ' ' + f1(-7.5 * k) + ',' + f1(-2 * k) + ' Z" fill="' + c + '" stroke="' + o + '" stroke-width="1.2"/><path d="M' + f1(-4 * k) + ',' + f1(.5 * k) + ' C' + f1(-2 * k) + ',' + f1(3.6 * k) + ' ' + f1(2 * k) + ',' + f1(3.6 * k) + ' ' + f1(4 * k) + ',' + f1(.5 * k) + '" fill="none" stroke="' + l + '" stroke-width="1.4" stroke-linecap="round"/>';
  if(style === 'etoiles'){ var d = ''; for(var i = 0; i < 12; i++){ var a = i * Math.PI / 6, r = (i % 2 ? 4.4 : 7.6) * k; d += (i ? 'L' : 'M') + f1(Math.cos(a) * r) + ',' + f1(Math.sin(a) * r) + ' '; } return '<path d="' + d + 'Z" fill="' + c + '" stroke="' + o + '" stroke-width="1.2" stroke-linejoin="round"/><circle r="' + f1(1.8 * k) + '" fill="' + l + '"/>'; }
  /* nuages */
  return '<circle r="' + f1(9.5 * k) + '" fill="' + c + '" stroke="' + o + '" stroke-width="1.2"/><path d="M' + f1(-5 * k) + ',' + f1(-3 * k) + ' C' + f1(-3 * k) + ',' + f1(-7 * k) + ' ' + f1(2 * k) + ',' + f1(-7 * k) + ' ' + f1(4 * k) + ',' + f1(-4 * k) + '" fill="none" stroke="' + l + '" stroke-width="1.8" stroke-linecap="round"/>'; }

/* ---------- Les dégradés et les motifs partagés ---------- */
/* les nappes : la taille d'un carreau du motif, et son dessin */
var NAPPE = {
  vichy:['width="44" height="44"', '<rect width="44" height="44" fill="#ffffff"/><rect width="22" height="44" fill="#ff2f4a" opacity=".55"/><rect width="44" height="22" fill="#ff2f4a" opacity=".55"/>'],
  bleue:['width="44" height="44"', '<rect width="44" height="44" fill="#ffffff"/><rect width="22" height="44" fill="#1f7fe8" opacity=".55"/><rect width="44" height="22" fill="#1f7fe8" opacity=".55"/>'],
  dentelle:['width="36" height="36"', '<rect width="36" height="36" fill="#fffdf6"/><circle cx="18" cy="18" r="7" fill="none" stroke="#ecdcc4" stroke-width="2"/><circle cx="18" cy="18" r="2" fill="#ecdcc4"/><circle cx="0" cy="0" r="3" fill="#f2e4d0"/><circle cx="36" cy="0" r="3" fill="#f2e4d0"/><circle cx="0" cy="36" r="3" fill="#f2e4d0"/><circle cx="36" cy="36" r="3" fill="#f2e4d0"/>'],
  bois:['width="180" height="38"', '<rect width="180" height="38" fill="#c98a4e"/><path d="M0,0 H180 M0,19 H180 M60,0 V19 M140,19 V38" stroke="#8a5628" stroke-width="2"/><path d="M10,9 C40,5 70,13 110,8 M20,29 C60,25 100,33 170,28" fill="none" stroke="#b0763c" stroke-width="1.6"/>'],
  nuit:['width="90" height="70"', '<rect width="90" height="70" fill="#1c2447"/><path d="M20,10 l2,5 5,2 -5,2 -2,5 -2,-5 -5,-2 5,-2 Z" fill="#f5b945"/><circle cx="62" cy="24" r="2.2" fill="#ffe3a3"/><path d="M70,48 l1.5,4 4,1.5 -4,1.5 -1.5,4 -1.5,-4 -4,-1.5 4,-1.5 Z" fill="#8ff3ff"/><circle cx="30" cy="52" r="1.8" fill="#eef0ff"/><circle cx="8" cy="38" r="1.3" fill="#ffe3a3"/>'],
  rayee:['width="56" height="20"', '<rect width="56" height="20" fill="#fffaf0"/><rect width="14" height="20" fill="#ff9a1f"/><rect x="28" width="14" height="20" fill="#2fc88e"/>']
};
function nappeMotif(idMotif, nappe){ var n = NAPPE[nappe]; return '<pattern id="' + idMotif + '" ' + n[0] + ' patternUnits="userSpaceOnUse">' + n[1] + '</pattern>'; }
function defs(id){
  return '<defs>' +
    /* le ciel d'un bel après-midi (Romain, 11 novembre, 20 h 29 : « de jour, avec un joli éclairage de journée ») */
    '<linearGradient id="' + id + 'ciel" gradientUnits="userSpaceOnUse" x1="0" y1="-620" x2="0" y2="440"><stop offset="0" stop-color="#1877dc"/><stop offset=".45" stop-color="#3a9ef0"/><stop offset=".8" stop-color="#86cdfa"/><stop offset="1" stop-color="#d8f1ff"/></linearGradient>' +
    '<radialGradient id="' + id + 'soleil"><stop offset="0" stop-color="#fffbd0"/><stop offset=".3" stop-color="#fff0a0" stop-opacity=".85"/><stop offset=".6" stop-color="#ffe76a" stop-opacity=".25"/><stop offset="1" stop-color="#ffe76a" stop-opacity="0"/></radialGradient>' +
    '<linearGradient id="' + id + 'vitre" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eaf7ff"/><stop offset=".5" stop-color="#9fd2f2"/><stop offset="1" stop-color="#5fa4d6"/></linearGradient>' +
    /* le volume du gâteau : la lumière vient de la gauche */
    '<linearGradient id="' + id + 'ombre" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset=".3" stop-color="#fff" stop-opacity="0"/><stop offset=".66" stop-color="#1c1026" stop-opacity="0"/><stop offset="1" stop-color="#1c1026" stop-opacity=".2"/></linearGradient>' +
    '<linearGradient id="' + id + 'arcG" x1="0" y1="0" x2="1" y2=".25"><stop offset="0" stop-color="#ff5fa2"/><stop offset=".25" stop-color="#ffd21f"/><stop offset=".5" stop-color="#3fe08a"/><stop offset=".75" stop-color="#3fb4ff"/><stop offset="1" stop-color="#a66bff"/></linearGradient>' +
    '<pattern id="' + id + 'tuiles" width="14" height="10" patternUnits="userSpaceOnUse"><rect width="14" height="10" fill="#e8693c"/><path d="M0,10 C0,5 7,5 7,10 C7,5 14,5 14,10 M-7,5 C-7,0 0,0 0,5 C0,0 7,0 7,5 C7,0 14,0 14,5" fill="none" stroke="#b8431f" stroke-width="1.3"/></pattern>' +
    '<pattern id="' + id + 'ardoise" width="12" height="9" patternUnits="userSpaceOnUse"><rect width="12" height="9" fill="#6f86c8"/><path d="M0,9 C0,4 6,4 6,9 C6,4 12,4 12,9 M-6,4.5 C-6,-.5 0,-.5 0,4.5 C0,-.5 6,-.5 6,4.5 C6,-.5 12,-.5 12,4.5" fill="none" stroke="#4a5f9e" stroke-width="1.2"/></pattern>' +
    '<pattern id="' + id + 'blocs" width="34" height="22" patternUnits="userSpaceOnUse"><path d="M0,11 H34 M0,22 H34 M17,0 V11 M0,11 V22 M34,11 V22" stroke="#b8a888" stroke-width="1.6" opacity=".8" fill="none"/></pattern>' +
    /* les nappes */
    Object.keys(NAPPE).map(function(n){ return nappeMotif(id + 'n-' + n, n); }).join('') +
    '<linearGradient id="' + id + 'tableO" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c1026" stop-opacity=".16"/><stop offset=".22" stop-color="#1c1026" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".14"/></linearGradient>' +
    '</defs>';
}

/* ---------- Le fond : la place de Brumeval en fête, en plein jour ---------- */
var SOL = 512;
function maison(id, x, w, h, mur, o){
  o = o || {};
  var y0 = SOL - h, s = '', hT = o.pignon ? w * .42 : 32, vol = o.volets || '#2f9a6a';
  s += '<rect x="' + x + '" y="' + y0 + '" width="' + w + '" height="' + h + '" fill="' + mur + '"' + st(3) + '/>';
  /* le soleil vient de la gauche : ce côté du mur est plus clair ; le toit fait un peu d'ombre en haut */
  s += '<rect x="' + (x + 1.5) + '" y="' + y0 + '" width="' + f1(w * .38) + '" height="' + h + '" fill="#fff" opacity=".2"/><rect x="' + (x + 1.5) + '" y="' + y0 + '" width="' + (w - 3) + '" height="9" fill="#24182e" opacity=".14"/>';
  if(o.colombages) s += '<path d="M' + x + ',' + f1(y0 + h * .48) + ' H' + (x + w) + ' M' + f1(x + w / 3) + ',' + y0 + ' V' + SOL + ' M' + f1(x + 2 * w / 3) + ',' + y0 + ' V' + SOL + ' M' + x + ',' + y0 + ' L' + f1(x + w / 3) + ',' + f1(y0 + h * .48) + ' M' + (x + w) + ',' + y0 + ' L' + f1(x + 2 * w / 3) + ',' + f1(y0 + h * .48) + '" stroke="#8a5630" stroke-width="5" fill="none"/>';
  var nf = Math.max(1, Math.round(w / 62)), FL = ['#ff3f5e', '#ffd21f', '#ff7fb6', '#ffffff'];
  for(var e = 0; e < 2; e++) for(var i = 0; i < nf; i++){
    var fx = x + w * (i + .5) / nf - 11, fy = y0 + 16 + e * h * .42;
    if(e === 1 && nf % 2 && i === (nf - 1) / 2){   /* la porte, à la place de la fenêtre du milieu */
      s += '<path d="M' + f1(fx - 3) + ',' + SOL + ' V' + f1(fy + 8) + ' Q' + f1(fx + 11) + ',' + f1(fy - 8) + ' ' + f1(fx + 25) + ',' + f1(fy + 8) + ' V' + SOL + ' Z" fill="' + (o.porte || '#b8632c') + '"' + st(2.6) + '/><circle cx="' + f1(fx + 19) + '" cy="' + f1((fy + SOL) / 2 + 6) + '" r="2.2" fill="#ffd23f"' + st(1.2) + '/>';
      continue;
    }
    s += '<rect x="' + f1(fx) + '" y="' + f1(fy) + '" width="22" height="26" rx="2" fill="url(#' + id + 'vitre)"' + st(2.4) + '/><path d="M' + f1(fx + 11) + ',' + f1(fy) + ' V' + f1(fy + 26) + ' M' + f1(fx) + ',' + f1(fy + 12) + ' H' + f1(fx + 22) + '" stroke="' + K + '" stroke-width="1.6"/>';
    s += '<path d="M' + f1(fx + 3) + ',' + f1(fy + 9) + ' L' + f1(fx + 8) + ',' + f1(fy + 3) + '" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".9"/>';
    s += '<rect x="' + f1(fx - 9) + '" y="' + f1(fy) + '" width="8" height="26" rx="1.5" fill="' + vol + '"' + st(2) + '/><rect x="' + f1(fx + 23) + '" y="' + f1(fy) + '" width="8" height="26" rx="1.5" fill="' + vol + '"' + st(2) + '/>';
    /* une jardinière fleurie sous chaque fenêtre */
    s += '<rect x="' + f1(fx - 3) + '" y="' + f1(fy + 27) + '" width="28" height="6" rx="2" fill="#a8622c"' + st(1.8) + '/>';
    for(var k = 0; k < 4; k++) s += '<circle cx="' + f1(fx + 1 + k * 6.6) + '" cy="' + f1(fy + 25.5 - (k % 2) * 1.5) + '" r="3.4" fill="' + FL[(k + i + e) % 4] + '" stroke="' + K + '" stroke-width="1"/>';
  }
  if(nf % 2 === 0) s += '<path d="M' + f1(x + w / 2 - 12) + ',' + SOL + ' V' + (SOL - 36) + ' Q' + f1(x + w / 2) + ',' + (SOL - 52) + ' ' + f1(x + w / 2 + 12) + ',' + (SOL - 36) + ' V' + SOL + ' Z" fill="' + (o.porte || '#b8632c') + '"' + st(2.6) + '/><circle cx="' + f1(x + w / 2 + 7) + '" cy="' + (SOL - 20) + '" r="2.2" fill="#ffd23f"' + st(1.2) + '/>';
  if(o.pignon) s += '<path d="M' + (x - 8) + ',' + (y0 + 2) + ' L' + f1(x + w / 2) + ',' + f1(y0 - hT) + ' L' + (x + w + 8) + ',' + (y0 + 2) + ' Z" fill="url(#' + id + 'tuiles)"' + st(3.4) + '/>';
  else s += '<path d="M' + (x - 8) + ',' + (y0 + 2) + ' L' + (x + 10) + ',' + (y0 - hT) + ' L' + (x + w - 10) + ',' + (y0 - hT) + ' L' + (x + w + 8) + ',' + (y0 + 2) + ' Z" fill="url(#' + id + (o.ardoise ? 'ardoise' : 'tuiles') + ')"' + st(3.4) + '/>';
  if(o.cheminee !== false){ var cx = x + w * (o.pignon ? .72 : .26), cy = y0 - (o.pignon ? hT * .45 : hT) - 16; s += '<rect x="' + f1(cx) + '" y="' + f1(cy) + '" width="15" height="26" fill="#c9683c"' + st(2.6) + '/><rect x="' + f1(cx - 2) + '" y="' + f1(cy - 4) + '" width="19" height="6" fill="#a04e2a"' + st(2.2) + '/>'; }
  return s;
}
function clocher(id, X){
  var s = '<g transform="translate(' + X + ',0)">';
  s += '<rect x="-34" y="170" width="68" height="' + (SOL - 170) + '" fill="#f0e6d0"' + st(3.4) + '/><rect x="-34" y="170" width="68" height="' + (SOL - 170) + '" fill="url(#' + id + 'blocs)"/><rect x="-32.5" y="170" width="24" height="' + (SOL - 170) + '" fill="#fff" opacity=".25"/>';
  s += '<circle cy="218" r="21" fill="#ffd23f"' + st(3) + '/><circle cy="218" r="16" fill="#ffffff"' + st(2) + '/><path d="M0,218 L0,207 M0,218 L8,222" ' + st(2.4) + '/><circle cy="218" r="2" fill="' + K + '"/>';
  s += '<rect x="-38" y="166" width="76" height="9" rx="2" fill="#d8ccb2"' + st(2.6) + '/><rect x="-32" y="116" width="64" height="52" fill="#f0e6d0"' + st(3.2) + '/><path d="M-20,168 V138 Q0,118 20,138 V168 Z" fill="#3a3050"' + st(2.4) + '/>';
  s += '<path d="M0,130 V136" ' + st(3) + '/><path d="M-12,158 C-12,144 -8,136 0,136 C8,136 12,144 12,158 L15,162 L-15,162 Z" fill="#ffc832"' + st(2.4) + '/><circle cy="163" r="3" fill="#a8741c"' + st(1.4) + '/>';
  s += '<rect x="-36" y="112" width="72" height="8" rx="2" fill="#d8ccb2"' + st(2.6) + '/><path d="M-34,113 L0,28 L34,113 Z" fill="url(#' + id + 'ardoise)"' + st(3.4) + '/><path d="M0,30 V6" ' + st(3) + '/><circle cy="16" r="3.4" fill="#ffd23f"' + st(1.4) + '/>';
  return s + '</g>';
}
/* une guirlande entre deux points, qui pend : des fanions, ou des lampions de papier */
function guirlande(id, x1, y1, x2, y2, pend, n, sorte, i0){
  var mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + pend, s = '<path d="M' + x1 + ',' + y1 + ' Q' + f1(mx) + ',' + f1(my + pend) + ' ' + x2 + ',' + y2 + '" fill="none"' + st(2.2, '#4a3a2c') + '/>';
  var COUL = ['#ff2f55', '#ffd21f', '#1fb4ff', '#3fd45a', '#ff8a1f', '#b06bff', '#ff6fc0'];
  for(var i = 1; i <= n; i++){
    var u = i / (n + 1), a = 1 - u, px = a * a * x1 + 2 * a * u * mx + u * u * x2, py = a * a * y1 + 2 * a * u * (my + pend) + u * u * y2, c = COUL[(i + (i0 || 0)) % COUL.length];
    if(sorte === 'fanions') s += '<path d="M' + f1(px - 9.5) + ',' + f1(py) + ' L' + f1(px + 9.5) + ',' + f1(py) + ' L' + f1(px) + ',' + f1(py + 21) + ' Z" fill="' + c + '"' + st(1.8) + '/><path d="M' + f1(px - 6) + ',' + f1(py + 3) + ' L' + f1(px - 1) + ',' + f1(py + 13) + '" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".5"/>';
    else s += '<path d="M' + f1(px) + ',' + f1(py) + ' V' + f1(py + 5) + '" stroke="' + K + '" stroke-width="1.6"/><ellipse cx="' + f1(px) + '" cy="' + f1(py + 15) + '" rx="9" ry="10.5" fill="' + c + '"' + st(1.8) + '/>' +
      '<path d="M' + f1(px - 4.5) + ',' + f1(py + 6.5) + ' Q' + f1(px - 7) + ',' + f1(py + 15) + ' ' + f1(px - 4.5) + ',' + f1(py + 23.5) + ' M' + f1(px + 4.5) + ',' + f1(py + 6.5) + ' Q' + f1(px + 7) + ',' + f1(py + 15) + ' ' + f1(px + 4.5) + ',' + f1(py + 23.5) + '" fill="none" stroke="' + K + '" stroke-width="1" opacity=".45"/>' +
      '<ellipse cx="' + f1(px - 3.5) + '" cy="' + f1(py + 11) + '" rx="2" ry="3.4" fill="#fff" opacity=".65"/><rect x="' + f1(px - 4) + '" y="' + f1(py + 24.5) + '" width="8" height="3" rx="1" fill="#ffd23f" stroke="' + K + '" stroke-width="1"/>';
  }
  return s;
}
function nuage(x, y, k){ return '<g transform="translate(' + x + ',' + y + ') scale(' + k + ')"><path d="M-64,20 C-92,20 -94,-12 -64,-14 C-66,-42 -24,-50 -10,-26 C4,-52 50,-46 46,-16 C74,-20 86,16 58,20 Z" fill="#ffffff"/><path d="M-66,20 C-44,6 38,8 60,20 Z" fill="#cfe7fa"/></g>'; }
function ballon(x, y, c, x0, y0){ return '<path d="M' + x0 + ',' + y0 + ' Q' + f1((x + x0) / 2 + 6) + ',' + f1((y + y0) / 2 + 8) + ' ' + x + ',' + (y + 21) + '" fill="none" stroke="' + K + '" stroke-width="1.4"/>' +
  '<path d="M' + x + ',' + (y + 20) + ' C' + (x - 20) + ',' + (y + 14) + ' ' + (x - 18) + ',' + (y - 20) + ' ' + x + ',' + (y - 20) + ' C' + (x + 18) + ',' + (y - 20) + ' ' + (x + 20) + ',' + (y + 14) + ' ' + x + ',' + (y + 20) + ' Z" fill="' + c + '"' + st(2.2) + '/><path d="M' + (x - 9) + ',' + (y - 6) + ' C' + (x - 9) + ',' + (y - 12) + ' ' + (x - 6) + ',' + (y - 15) + ' ' + (x - 2) + ',' + (y - 15) + '" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>'; }
function fond(id){
  var R = graine(7), s = '<rect x="-1100" y="-1100" width="2840" height="1700" fill="url(#' + id + 'ciel)"/>', i;
  /* le soleil, en haut à gauche (toute la lumière vient de là), et ses rayons */
  s += '<circle cx="196" cy="78" r="140" fill="url(#' + id + 'soleil)"/>';
  for(i = 0; i < 12; i++) s += '<path d="M0,-44 L5.5,-' + (i % 2 ? 62 : 70) + ' L-5.5,-' + (i % 2 ? 62 : 70) + ' Z" transform="translate(196,78) rotate(' + (i * 30) + ')" fill="#ffe14a"/>';
  s += '<circle cx="196" cy="78" r="33" fill="#fff3a0" stroke="#ffcf2a" stroke-width="3"/>';
  /* les nuages (il y en a aussi très haut : sur un écran debout, on voit beaucoup de ciel) */
  [[430, 104, .9], [668, 196, .6], [-150, 150, .72], [350, -150, 1.2], [-300, 14, 1.05], [860, -6, 1.15], [600, -300, .95], [40, -360, 1.15], [-520, -200, 1], [1120, 110, 1.05], [-820, 110, 1.15], [300, -520, 1.1], [1330, -170, 1], [-80, -640, 1.2], [720, -700, 1.1]].forEach(function(n){ s += nuage(n[0], n[1], n[2]); });
  /* des oiseaux, très loin */
  s += '<path d="M452,176 q5,-7 10,0 q5,-7 10,0 M484,160 q4,-6 8,0 q4,-6 8,0 M306,30 q5,-7 10,0 q5,-7 10,0" fill="none" stroke="' + K + '" stroke-width="2.2" stroke-linecap="round" opacity=".55"/>';
  /* au loin : les montagnes bleues, puis les collines vertes et leurs arbres */
  s += '<path d="M-1100,320 L-900,236 L-760,290 L-600,216 L-430,300 L-250,226 L-90,290 L80,220 L240,296 L420,230 L600,290 L760,222 L940,290 L1120,232 L1300,296 L1500,236 L1740,310 L1740,560 L-1100,560 Z" fill="#a4d2f4"/>';
  s += '<path d="M-1100,330 C-900,270 -700,312 -500,288 C-300,266 -100,318 100,288 C300,260 500,316 700,286 C900,258 1100,314 1300,288 C1500,266 1650,300 1740,290 L1740,560 L-1100,560 Z" fill="#8fe070"/>';
  for(i = 0; i < 40; i++){ var tx = -1080 + i * 71 + R() * 30, ty = 300 + R() * 26; s += '<path d="M' + f1(tx) + ',' + f1(ty) + ' v12" stroke="#8a5630" stroke-width="3"/><circle cx="' + f1(tx) + '" cy="' + f1(ty - 7) + '" r="' + f1(10 + R() * 6) + '" fill="#3fae4a"/>'; }
  s += '<path d="M-1100,372 C-860,336 -640,368 -420,348 C-200,330 0,372 220,346 C440,324 640,370 860,346 C1080,326 1300,370 1740,342 L1740,560 L-1100,560 Z" fill="#5fc956"/>';
  /* les maisons de la place (de gauche à droite), aux couleurs de bonbon */
  var M = [[-960, 150, 190, '#d6f5b0', {ardoise:true, volets:'#3f78d8'}], [-800, 160, 170, '#ffc9d8', {pignon:true, volets:'#d83f6a'}], [-630, 150, 196, '#fff0b0', {colombages:true, volets:'#e8552a'}],
    [-470, 140, 168, '#bfe6ff', {volets:'#2f6fd0', ardoise:true}], [-322, 150, 186, '#ffd6a8', {pignon:true, colombages:true, volets:'#e8552a'}], [-164, 104, 160, '#d6f5b0', {volets:'#3f78d8'}],
    [16, 150, 176, '#fff0b0', {volets:'#2f9a6a'}], [172, 148, 150, '#ffc9d8', {ardoise:true, volets:'#3f78d8'}], [326, 156, 158, '#bfe6ff', {pignon:true, volets:'#2f9a6a'}],
    [488, 150, 190, '#ffd6a8', {colombages:true, volets:'#e8552a'}], [644, 150, 172, '#d6f5b0', {pignon:true, volets:'#3f78d8'}], [800, 160, 198, '#fff0b0', {ardoise:true, colombages:true, volets:'#2f9a6a'}],
    [966, 150, 170, '#ffc9d8', {volets:'#d83f6a'}], [1122, 160, 190, '#bfe6ff', {pignon:true, colombages:true, volets:'#2f6fd0'}], [1288, 150, 176, '#ffd6a8', {ardoise:true, volets:'#e8552a'}], [1444, 160, 192, '#d6f5b0', {pignon:true, volets:'#3f78d8'}]];
  M.forEach(function(m){ s += maison(id, m[0], m[1], m[2], m[3], m[4]); });
  /* le clocher, juste derrière le gâteau, à gauche ; le mât de la fête, à droite, avec ses ballons */
  s += clocher(id, 92);
  s += ballon(536, 92, '#ff2f55', 562, 150) + ballon(590, 98, '#1fb4ff', 562, 150) + ballon(564, 70, '#ffd21f', 562, 150);
  s += '<path d="M562,' + SOL + ' V150" ' + st(8) + '/><path d="M562,' + SOL + ' V150" stroke="#ffc832" stroke-width="4.4" stroke-linecap="round"/><circle cx="562" cy="148" r="8" fill="#ffd23f"' + st(2.4) + '/>';
  /* les guirlandes : des fanions et des lampions de papier, de toit en toit, du clocher au mât */
  s += guirlande(id, -520, 250, 92, 120, 30, 11, 'fanions', 0) + guirlande(id, 92, 120, 562, 150, 40, 9, 'fanions', 3) + guirlande(id, 562, 150, 1240, 250, 34, 12, 'fanions', 1);
  s += guirlande(id, -700, 300, 92, 178, 40, 11, 'lampions', 0) + guirlande(id, 92, 178, 562, 196, 52, 7, 'lampions', 2) + guirlande(id, 562, 196, 1400, 300, 44, 12, 'lampions', 4);
  s += guirlande(id, -300, -40, 320, -150, 40, 8, 'lampions', 1) + guirlande(id, 320, -150, 960, -40, 40, 8, 'lampions', 5) + guirlande(id, -200, -250, 840, -260, 60, 12, 'fanions', 2);
  /* un voile de lumière sur la place : elle recule un peu, et le gâteau, devant, ressort */
  s += '<rect x="-1100" y="-1100" width="2840" height="' + (1100 + SOL) + '" fill="#e8f6ff" opacity=".26"/>';
  /* les pavés de la place, au soleil */
  s += '<rect x="-1100" y="' + SOL + '" width="2840" height="60" fill="#ecdcb8"/><rect x="-1100" y="' + SOL + '" width="2840" height="6" fill="#24182e" opacity=".12"/><path d="M-1100,' + SOL + ' H1740" ' + st(3) + '/>';
  for(var k = 0; k < 2; k++) for(var x3 = -1100 + k * 17; x3 < 1740; x3 += 34) s += '<rect x="' + (x3 + 1.5) + '" y="' + (SOL + 10 + k * 15) + '" width="31" height="12" rx="5" fill="' + ['#dccaa0', '#d4c094', '#e4d2aa'][(Math.floor(x3 / 34) % 3 + 3) % 3] + '"/>';
  return s;
}

/* ---------- La table et sa nappe (le dessus de la table : de y = 548 jusqu'en bas) ---------- */
/* teinte (facultatif) : la couleur du pinceau qui a repeint la nappe ; elle a alors son propre motif, repeint */
var PRINC_NAPPE = {vichy:'#ff2f4a', bleue:'#1f7fe8', dentelle:'#fffdf6', bois:'#c98a4e', nuit:'#1c2447', rayee:'#ff9a1f'};
function table(id, nappe, teinte){
  var motif = id + 'n-' + nappe, d = '';
  if(teinte && NAPPE[nappe]){ motif = id + 'nt'; d = '<defs>' + teinter(nappeMotif(motif, nappe), PRINC_NAPPE[nappe], teinte) + '</defs>'; }
  return d + '<rect x="-1100" y="548" width="2840" height="260" fill="url(#' + motif + ')"/><rect x="-1100" y="548" width="2840" height="260" fill="url(#' + id + 'tableO)" pointer-events="none"/>' +
    '<path d="M-1100,548 H1740" ' + st(3.4) + '/><path d="M-1100,552 H1740" stroke="#fff" stroke-width="2" opacity=".35"/>';
}
/* ---------- Le présentoir (le plat à gâteau sur pied) : le dessus du plat à y = 538, le pied posé à y = 596 ----------
   teinte (facultatif) : la couleur du pinceau qui l'a repeint (ses dégradés d'argent et d'or sont dessinés avec lui, pour l'être aussi) */
var PRINC_PLAT = {porcelaine:'#fffaf2', bois:'#c89460', argent:'#d4d4d4', or:'#ffc832', pois:'#f8adc8', runes:'#3a4058'};
function plat(id, style, teinte){
  var P = {porcelaine:['#fffaf2', '#e8dcc8', '#5b8fd8'], bois:['#c89460', '#9a6a3a', '#7a4e28'], argent:['url(#' + id + 'pm)', '#a4acbc', '#eef2f8'], or:['url(#' + id + 'pm)', '#c88a14', '#fff6b8'],
    pois:['#f8adc8', '#e07aa0', '#ffffff'], runes:['#3a4058', '#262b40', '#8ff3ff']}[style] || ['#fffaf2', '#e8dcc8', '#5b8fd8'];
  var s = '<ellipse cx="320" cy="600" rx="150" ry="16" fill="#1c1026" opacity=".22"/>';
  if(style === 'argent') s += '<linearGradient id="' + id + 'pm" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#cfd6e2"/><stop offset="1" stop-color="#8f98ac"/></linearGradient>';
  if(style === 'or') s += '<linearGradient id="' + id + 'pm" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff6b8"/><stop offset=".45" stop-color="#ffc832"/><stop offset="1" stop-color="#c88a14"/></linearGradient>';
  s += '<ellipse cx="320" cy="594" rx="92" ry="13" fill="' + P[1] + '"' + st(2.8) + '/><path d="M296,548 C296,570 292,578 262,588 C290,596 350,596 378,588 C348,578 344,570 344,548 Z" fill="' + P[0] + '"' + st(2.8) + '/>' +
    '<path d="M302,552 C302,570 300,578 286,586" fill="none" stroke="#fff" stroke-width="3" opacity=".45" stroke-linecap="round" pointer-events="none"/>';
  s += '<path d="M90,538 C90,556 550,556 550,538 L550,544 C550,564 90,564 90,544 Z" fill="' + P[1] + '"' + st(2.8) + '/><ellipse cx="320" cy="538" rx="230" ry="20" fill="' + P[0] + '"' + st(2.8) + '/>';
  if(style === 'pois'){ for(var i = 0; i < 15; i++){ var a = Math.PI * (i + .5) / 15; s += '<circle cx="' + f1(320 - Math.cos(a) * 212) + '" cy="' + f1(538 + Math.sin(a) * 15) + '" r="4" fill="#fff"/>'; } }
  else if(style === 'runes'){ for(var j = 0; j < 9; j++){ var b = Math.PI * (j + .5) / 9, rx = 320 - Math.cos(b) * 205, ry = 552 + Math.sin(b) * 6; s += '<path class="gt-rune" d="M' + f1(rx - 4) + ',' + f1(ry - 4) + ' l4,8 l4,-8 M' + f1(rx - 4) + ',' + f1(ry + 1) + ' h8" fill="none" stroke="#8ff3ff" stroke-width="1.6" stroke-linecap="round"/>'; } }
  else if(style === 'bois') s += '<ellipse cx="320" cy="538" rx="190" ry="15" fill="none" stroke="' + P[2] + '" stroke-width="1.6" opacity=".6"/><ellipse cx="320" cy="538" rx="150" ry="11" fill="none" stroke="' + P[2] + '" stroke-width="1.4" opacity=".5"/>';
  else s += '<ellipse cx="320" cy="538" rx="216" ry="16.500" fill="none" stroke="' + P[2] + '" stroke-width="2.4" opacity=".8"/>';
  return teinte ? teinter(s, PRINC_PLAT[style] || '#fffaf2', teinte) : s;
}

MJ.GATEAU_ART = {K:K, ANIMEES:ANIMEES, PINCEAUX:PINCEAUX, teinter:teinter, dessinDeco:dessinDeco, PATES:PATES, GLACAGES:GLACAGES, MOTIFS:MOTIFS, FORMES:FORMES, CREMES:CREMES, CREME_COUL:CREME_COUL, PLATS:PLATS, NAPPES:NAPPES, CATS:CATS, DECOS:DECOS,
  glac:glac, pate:pate, icone:icone, icoBrut:icoBrut, svgDeco:svgDeco, jeton:jeton, jetonCouleur:jetonCouleur, jetonPate:jetonPate, jetonCreme:jetonCreme, bouleCreme:bouleCreme,
  defs:defs, fond:fond, table:table, plat:plat, clair:clair, sombre:sombre, mix:mix, graine:graine, st:st, f1:f1};
})();
