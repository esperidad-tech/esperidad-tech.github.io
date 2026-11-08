/* Carte d'exploration du donjon, VERSION 2 (8 novembre, soir) : une grande carte (2 400 × 1 500) qu'on fait glisser au doigt ;
   l'entrée au milieu ; trois sorties dès le fond du puits ; des embranchements en plus (égouts tournants, salle aux trois portes).
   UNE seule géométrie (SALLES, COULOIRS, SECRET, VIEUX) pour toutes les images : vue du Pisteur, plan du Sage, contrôle. */
(function(){
var W = 960, H = 540, O = '#24182e';
var WW = 2400, WH = 1500;                 /* la carte entière */
var M = 11, SOL = 24, K = 1.2;            /* murs, couloirs ; K : les salles de la version 1, agrandies */
var Z = {x:0, y:0, w:WW, h:WH};           /* la zone dessinée (l'écran et une marge) */
function f(n){ return Math.round(n * 10) / 10; }
function rng(s){ return function(){ s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
function hx(c){ c = c.replace('#', ''); return [0, 2, 4].map(function(i){ return parseInt(c.substr(i, 2), 16); }); }
function mix(a, b, t){ var A = hx(a), B = hx(b); return '#' + A.map(function(v, i){ var r = Math.round(v + (B[i] - v) * t); return (r < 16 ? '0' : '') + r.toString(16); }).join(''); }
function clair(c, t){ return mix(c, '#fff6e6', t); }
function sombre(c, t){ return mix(c, '#120a1e', t); }
var uid = 0; function nid(p){ return (p || 'i') + (++uid); }

/* ================= la géométrie ================= */
function rr(x, y, w, h, r){ var x0 = x - w / 2, y0 = y - h / 2;
  return 'M' + f(x0 + r) + ' ' + f(y0) + ' H' + f(x0 + w - r) + ' A' + f(r) + ' ' + f(r) + ' 0 0 1 ' + f(x0 + w) + ' ' + f(y0 + r) + ' V' + f(y0 + h - r) +
    ' A' + f(r) + ' ' + f(r) + ' 0 0 1 ' + f(x0 + w - r) + ' ' + f(y0 + h) + ' H' + f(x0 + r) + ' A' + f(r) + ' ' + f(r) + ' 0 0 1 ' + f(x0) + ' ' + f(y0 + h - r) +
    ' V' + f(y0 + r) + ' A' + f(r) + ' ' + f(r) + ' 0 0 1 ' + f(x0 + r) + ' ' + f(y0) + ' Z'; }
function cercle(x, y, r){ return 'M' + f(x - r) + ' ' + f(y) + ' A' + f(r) + ' ' + f(r) + ' 0 1 1 ' + f(x + r) + ' ' + f(y) + ' A' + f(r) + ' ' + f(r) + ' 0 1 1 ' + f(x - r) + ' ' + f(y) + ' Z'; }
function blob(pts){
  var n = pts.length, d = 'M' + f(pts[0][0]) + ' ' + f(pts[0][1]);
  for(var i = 0; i < n; i++){
    var p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += ' C' + f(p1[0] + (p2[0] - p0[0]) / 6) + ' ' + f(p1[1] + (p2[1] - p0[1]) / 6) + ' ' + f(p2[0] - (p3[0] - p1[0]) / 6) + ' ' + f(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + f(p2[0]) + ' ' + f(p2[1]);
  }
  return d + ' Z';
}
function lisse(pts){
  if(pts.length === 2) return 'M' + f(pts[0][0]) + ' ' + f(pts[0][1]) + ' L' + f(pts[1][0]) + ' ' + f(pts[1][1]);
  var d = 'M' + f(pts[0][0]) + ' ' + f(pts[0][1]), n = pts.length;
  for(var i = 0; i < n - 1; i++){
    var p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)];
    d += ' C' + f(p1[0] + (p2[0] - p0[0]) / 6) + ' ' + f(p1[1] + (p2[1] - p0[1]) / 6) + ' ' + f(p2[0] - (p3[0] - p1[0]) / 6) + ' ' + f(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + f(p2[0]) + ' ' + f(p2[1]);
  }
  return d;
}
function poly(pts, ferme){ return 'M' + pts.map(function(p){ return f(p[0]) + ' ' + f(p[1]); }).join(' L') + (ferme === false ? '' : ' Z'); }
function octo(x, y, w, h, c){ var x0 = x - w / 2, y0 = y - h / 2, x1 = x + w / 2, y1 = y + h / 2;
  return poly([[x0 + c, y0], [x1 - c, y0], [x1, y0 + c], [x1, y1 - c], [x1 - c, y1], [x0 + c, y1], [x0, y1 - c], [x0, y0 + c]]); }

/* les salles de la version 1 servent de modèles : même forme et même décor, agrandis de K et posés ailleurs */
var V1 = {
  puits:{x:88, y:180, f:function(x, y, k){ return cercle(x, y, 52 * k); }},
  rats:{x:285, y:190, f:function(x, y, k){ return rr(x, y, 128 * k, 88 * k, 12 * k); }},
  reserve:{x:285, y:76, f:function(x, y, k){ return rr(x, y, 100 * k, 70 * k, 10 * k); }},
  canaux:{x:285, y:338, f:function(x, y, k){ return rr(x, y, 170 * k, 112 * k, 14 * k); }},
  givre:{x:90, y:342, pts:[[30, 334], [40, 304], [72, 292], [112, 296], [142, 313], [151, 344], [138, 377], [104, 392], [62, 390], [35, 370]]},
  cave:{x:470, y:332, f:function(x, y, k){ return rr(x, y, 124 * k, 100 * k, 18 * k); }},
  eboule:{x:566, y:452, pts:[[516, 442], [530, 421], [562, 416], [598, 421], [618, 440], [613, 468], [586, 487], [546, 488], [520, 470]]},
  atelier:{x:640, y:190, f:function(x, y, k){ return rr(x, y, 148 * k, 100 * k, 12 * k); }},
  biblio:{x:640, y:72, f:function(x, y, k){ return rr(x, y, 132 * k, 70 * k, 12 * k); }},
  ossuaire:{x:838, y:180, f:function(x, y, k){ return octo(x, y, 116 * k, 92 * k, 24 * k); }},
  feu:{x:765, y:300, f:function(x, y, k){ return rr(x, y, 84 * k, 72 * k, 28 * k); }},
  bassin:{x:760, y:445, f:function(x, y, k){ return rr(x, y, 160 * k, 96 * k, 40 * k); }},
  porte:{x:905, y:445, f:function(x, y, k){ return rr(x, y, 76 * k, 80 * k, 10 * k); }},
  derniere:{x:905, y:322, f:function(x, y, k){ return rr(x, y, 76 * k, 76 * k, 12 * k); }}
};
function modele(id, x, y){ var v = V1[id]; return v.pts ? blob(v.pts.map(function(p){ return [x + (p[0] - v.x) * K, y + (p[1] - v.y) * K]; })) : v.f(x, y, K); }

var SALLES = {}, ORDRE = [];
function salle(id, o){ o.id = id; if(o.v1) o.d = modele(id, o.x, o.y); SALLES[id] = o; ORDRE.push(id); }
/* signe : les salles que le plan du Sage marque d'un signe au lieu d'un nom (le Pisteur voit le même signe gravé au mur) */
salle('puits',    {nom:'Le fond du puits', ic:'🪢', x:1200, y:750, v1:1});
salle('aeration', {nom:'Le puits d’aération', ic:'🌬️', x:1200, y:560, d:cercle(1200, 560, 46), signe:'etoile'});
salle('galerie',  {nom:'La galerie effondrée', ic:'🪨', x:990, y:755, d:rr(990, 755, 150, 64, 14)});
salle('rats',     {nom:'La salle des rats', ic:'🐀', x:1440, y:752, v1:1});
salle('reserve',  {nom:'La réserve', ic:'📦', x:1455, y:610, v1:1});
salle('canaux',   {nom:'Les canaux de la ville d’avant', ic:'💧', x:1440, y:925, v1:1});
salle('givre',    {nom:'La grotte de la fleur de givre', ic:'❄️', x:1000, y:1010, v1:1});
salle('cave',     {nom:'La cave aux toiles', ic:'🕸️', x:1700, y:925, v1:1, signe:'lune'});
salle('dalles',   {nom:'Le couloir aux dalles', ic:'⚠️', x:1866, y:838, couloir:true, pts:[[1840, 915], [1866, 838], [1890, 754]], l:32});
salle('egouts',   {nom:'Les égouts tournants', ic:'🌀', x:1440, y:1110, couloir:true, pts:[[1385, 988], [1378, 1050], [1336, 1105], [1352, 1172], [1420, 1212], [1502, 1196], [1546, 1130], [1520, 1062], [1500, 990]], l:26});
salle('eboule',   {nom:'Le cul-de-sac éboulé', ic:'🦴', x:1835, y:1095, v1:1});
salle('atelier',  {nom:'L’atelier des Fondateurs', ic:'⚙️', x:1920, y:700, v1:1});
salle('biblio',   {nom:'La bibliothèque engloutie', ic:'📚', x:1920, y:560, v1:1});
salle('portes',   {nom:'La salle aux trois portes', ic:'🚪', x:2135, y:700, d:rr(2135, 700, 130, 120, 12)});
salle('crypte',   {nom:'La fausse crypte', ic:'⚰️', x:2300, y:700, d:rr(2300, 700, 100, 90, 10), signe:'gueule'});
salle('ossuaire', {nom:'L’ossuaire', ic:'💀', x:2135, y:905, v1:1, signe:'oeil'});
salle('feu',      {nom:'Le feu de camp', ic:'🔥', x:2135, y:1080, v1:1});
salle('bassin',   {nom:'Le grand bassin', ic:'🐸', x:2100, y:1255, v1:1});
salle('porte',    {nom:'La porte aux quatre signes', ic:'🗝️', x:2290, y:1255, v1:1});
salle('derniere', {nom:'La dernière salle', ic:'🏮', x:2290, y:1095, v1:1});

var J = {x:1840, y:925, r:20};          /* l'embranchement, à la sortie est de la cave aux toiles */
var COULOIRS = [
  {id:'cE', de:'puits', a:'rats', pts:[[1258, 750], [1310, 751], [1368, 752]]},
  {id:'cO', de:'puits', a:'galerie', pts:[[1142, 751], [1102, 753], [1060, 755]]},
  {id:'cN', de:'puits', a:'aeration', pts:[[1200, 694], [1200, 650], [1200, 602]]},
  {id:'c2', de:'rats', a:'reserve', pts:[[1455, 703], [1455, 648]]},
  {id:'c3', de:'rats', a:'canaux', pts:[[1405, 800], [1405, 862]]},
  {id:'c4', de:'canaux', a:'givre', pts:[[1342, 950], [1230, 958], [1140, 985], [1066, 1004]]},
  {id:'c5', de:'canaux', a:'cave', pts:[[1538, 940], [1585, 935], [1630, 930]]},
  {id:'c6', de:'cave', a:'J', pts:[[1770, 925], [1840, 925]]},
  {id:'c8', de:'J', a:'eboule', pts:[[1840, 940], [1842, 1000], [1836, 1056]]},
  {id:'c9', de:'atelier', a:'biblio', pts:[[1920, 644], [1920, 598]]},
  {id:'c10', de:'atelier', a:'portes', pts:[[2005, 700], [2040, 700], [2074, 700]]},
  {id:'pOeil', de:'portes', a:'ossuaire', pts:[[2135, 756], [2135, 800], [2135, 854]], porte:'oeil'},
  {id:'pGueule', de:'portes', a:'crypte', pts:[[2196, 700], [2225, 700], [2254, 700]], porte:'gueule'},
  {id:'pLune', de:'portes', a:'cave', pts:[[2135, 644], [2138, 560], [2110, 470], [2000, 452], [1850, 452], [1760, 462], [1724, 540], [1716, 680], [1700, 800], [1690, 869]], porte:'lune'},
  {id:'c11', de:'ossuaire', a:'feu', pts:[[2135, 958], [2135, 1000], [2135, 1040]]},
  {id:'c12', de:'feu', a:'bassin', pts:[[2128, 1120], [2118, 1160], [2108, 1202]]},
  {id:'c13', de:'bassin', a:'porte', pts:[[2192, 1255], [2220, 1255], [2248, 1255]]},
  {id:'c14', de:'porte', a:'derniere', pts:[[2290, 1210], [2290, 1175], [2290, 1138]]}
];
COULOIRS.push({id:'dalles', de:'J', a:'atelier', pts:SALLES.dalles.pts, l:SALLES.dalles.l, salle:'dalles'});
COULOIRS.push({id:'egouts', de:'canaux', a:'canaux', pts:SALLES.egouts.pts, l:SALLES.egouts.l, salle:'egouts'});
/* le vieux passage : le plan du Sage le dessine de la galerie jusqu'à la grotte de givre ; aujourd'hui, il est bouché par un éboulement.
   Dans le donjon, il n'en reste qu'un bout, côté grotte, qui finit sur des éboulis. */
var VIEUX = [[921, 762], [872, 790], [846, 860], [856, 935], [890, 985], [934, 1006]];
COULOIRS.push({id:'vieux', de:'givre', a:null, pts:[[852, 912], [866, 960], [896, 990], [934, 1006]], bouche:true});
var SECRET = [[1892, 1096], [1950, 1092], [2005, 1086], [2088, 1082]];   /* du cul-de-sac éboulé au feu de camp : seule l'encre invisible du plan le montre */

window.DONJON = {W:W, H:H, WW:WW, WH:WH, SALLES:SALLES, ORDRE:ORDRE, COULOIRS:COULOIRS, J:J, SECRET:SECRET, VIEUX:VIEUX};

/* ================= outils de mesure (on est dans le navigateur) ================= */
var NS = 'http://www.w3.org/2000/svg', TMP = null;
function tmp(){ if(!TMP){ TMP = document.createElementNS(NS, 'svg'); TMP.setAttribute('style', 'position:absolute;left:-9999px;width:10px;height:10px'); document.documentElement.appendChild(TMP); } return TMP; }
function chemin(d){ var p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); tmp().appendChild(p); return p; }
/* points le long d'un tracé, avec la direction */
function echant(d, pas, decal){
  var p = chemin(d), L = p.getTotalLength(), n = Math.max(2, Math.round(L / pas)), out = [];
  for(var i = 0; i < n; i++){
    var t = (i + (decal === undefined ? .5 : decal)) * L / n, a = p.getPointAtLength(t), b = p.getPointAtLength(Math.min(L, t + 1)), c = p.getPointAtLength(Math.max(0, t - 1));
    out.push({x:a.x, y:a.y, ang:Math.atan2(b.y - c.y, b.x - c.x)});
  }
  p.remove(); return out;
}
function dedans(d, x, y){ var p = chemin(d), r = p.isPointInFill(new DOMPoint(x, y)); p.remove(); return r; }
function longueur(pts){ var p = chemin(lisse(pts)), L = p.getTotalLength(); p.remove(); return L; }
/* le début d'un couloir, jusqu'à la fraction t de sa longueur */
function bout(pts, t){ var p = chemin(lisse(pts)), L = p.getTotalLength(), out = []; for(var k = 0; k <= 12; k++){ var q = p.getPointAtLength(L * t * k / 12); out.push([q.x, q.y]); } p.remove(); return out; }
function pointA(pts, t){ var p = chemin(lisse(pts)), L = p.getTotalLength(), a = p.getPointAtLength(L * t), b = p.getPointAtLength(Math.min(L, L * t + 1)), c = p.getPointAtLength(Math.max(0, L * t - 1)); p.remove(); return {x:a.x, y:a.y, ang:Math.atan2(b.y - c.y, b.x - c.x)}; }
var CTX = null;
function largeur(t, taille, poids){ if(!CTX) CTX = document.createElement('canvas').getContext('2d'); CTX.font = (poids || 700) + ' ' + taille + 'px Andika, Inter, sans-serif'; return CTX.measureText(t).width; }

/* ================= les dessins de base ================= */
function P(d, fl, x){ return '<path d="' + d + '" fill="' + fl + '" stroke="' + O + '" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"' + (x || '') + '/>'; }
function L(d, c, w, x){ return '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + w + '" stroke-linejoin="round" stroke-linecap="round"' + (x || '') + '/>'; }
function F(d, fl, x){ return '<path d="' + d + '" fill="' + fl + '"' + (x || '') + '/>'; }
function C(x, y, r, fl, x2){ return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + fl + '"' + (x2 || '') + '/>'; }
function G(x, y, a, s, corps){ return '<g transform="translate(' + f(x) + ' ' + f(y) + ')' + (a ? ' rotate(' + f(a) + ')' : '') + (s && s !== 1 ? ' scale(' + s + ')' : '') + '">' + corps + '</g>'; }

/* les dégradés partagés (créés à la demande) */
var DEFS;
function grad(c, fort){ fort = fort || 1; var k = 'g' + c + fort; if(DEFS.cache[k]) return DEFS.cache[k]; var id = nid('g');
  DEFS.l.push('<linearGradient id="' + id + '" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + clair(c, .28 * fort) + '"/><stop offset=".45" stop-color="' + c + '"/><stop offset="1" stop-color="' + sombre(c, .45 * fort) + '"/></linearGradient>');
  return (DEFS.cache[k] = 'url(#' + id + ')'); }
function halo(c){ var k = 'h' + c; if(DEFS.cache[k]) return DEFS.cache[k]; var id = nid('h');
  DEFS.l.push('<radialGradient id="' + id + '"><stop offset="0" stop-color="' + c + '"/><stop offset=".3" stop-color="' + c + '" stop-opacity=".55"/><stop offset=".65" stop-color="' + c + '" stop-opacity=".18"/><stop offset="1" stop-color="' + c + '" stop-opacity="0"/></radialGradient>');
  return (DEFS.cache[k] = 'url(#' + id + ')'); }
function flou(n){ var k = 'f' + n; if(DEFS.cache[k]) return DEFS.cache[k]; var id = nid('f');
  DEFS.l.push('<filter id="' + id + '" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="' + n + '"/></filter>');
  return (DEFS.cache[k] = 'url(#' + id + ')'); }
function lum(x, y, r, c, o){ return '<circle cx="' + f(x) + '' + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + halo(c) + '" opacity="' + (o === undefined ? 1 : o) + '"/>'; }

/* ---------- petits objets ---------- */
function colonne(x, y, r){
  return '<ellipse cx="' + f(x + 3) + '" cy="' + f(y + 4) + '" rx="' + f(r + 2) + '" ry="' + f(r + 1) + '" fill="#000" opacity=".5" filter="' + flou(2) + '"/>' +
    '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r + 2) + '" fill="' + grad('#4d4366') + '" stroke="' + O + '" stroke-width="1.5"/>' +
    '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r - 1) + '" fill="' + grad('#6a5e86') + '" stroke="' + O + '" stroke-width="1"/>' +
    C(x + r * .3, y - r * .35, r * .32, '#fff', ' opacity=".14"') + L('M' + f(x - r * .4) + ' ' + f(y + r * .1) + ' l' + f(r * .3) + ' ' + f(r * .25), O, .8, ' opacity=".6"');
}
function os(x, y, a, l, c){
  c = c || '#e6dcc2';
  return G(x, y, a, 1, '<path d="M' + f(-l / 2) + ' 0 H' + f(l / 2) + '" stroke="' + O + '" stroke-width="3.6" stroke-linecap="round"/>' +
    C(-l / 2, -1.1, 1.6, O) + C(-l / 2, 1.1, 1.6, O) + C(l / 2, -1.1, 1.6, O) + C(l / 2, 1.1, 1.6, O) +
    '<path d="M' + f(-l / 2) + ' 0 H' + f(l / 2) + '" stroke="' + c + '" stroke-width="1.8" stroke-linecap="round"/>' +
    C(-l / 2, -1.1, .9, c) + C(-l / 2, 1.1, .9, c) + C(l / 2, -1.1, .9, c) + C(l / 2, 1.1, .9, c));
}
function crane(x, y, a, s){
  return G(x, y, a, s || 1, '<path d="M-4 -3 C -4 -6 4 -6 4 -3 L 3.4 3 C 2 5 -2 5 -3.4 3 Z" fill="#e6dcc2" stroke="' + O + '" stroke-width="1"/>' +
    C(-1.6, 1, 1.1, '#2a1c26') + C(1.6, 1, 1.1, '#2a1c26') + C(-1, -3.4, 1, '#fff', ' opacity=".35"'));
}
function craneRat(x, y, a){
  return G(x, y, a, 1, '<path d="M-3 -2.4 C 1 -3 4 -1.4 6 0 C 4 1.4 1 3 -3 2.4 C -4.6 1.6 -4.6 -1.6 -3 -2.4 Z" fill="#e3d8bc" stroke="' + O + '" stroke-width=".9"/>' + C(0, -1, .7, '#2a1c26') + C(0, 1, .7, '#2a1c26'));
}
function tonneau(x, y, r){
  return '<ellipse cx="' + f(x + 2) + '" cy="' + f(y + 3) + '" rx="' + r + '" ry="' + r + '" fill="#000" opacity=".45" filter="' + flou(1.5) + '"/>' +
    C(x, y, r, grad('#7a4e2e'), ' stroke="' + O + '" stroke-width="1.4"') + C(x, y, r - 2.2, 'none', ' stroke="#3a2a2a" stroke-width="1.6"') +
    L('M' + f(x - r + 3) + ' ' + f(y - 2) + ' H' + f(x + r - 3) + ' M' + f(x - r + 3) + ' ' + f(y + 2) + ' H' + f(x + r - 3), '#4e321c', .8) + C(x + r * .35, y - r * .4, r * .25, '#fff', ' opacity=".15"');
}
function caisse(x, y, w, h, a){
  return G(x, y, a, 1, '<rect x="' + f(-w / 2 + 2) + '" y="' + f(-h / 2 + 3) + '" width="' + w + '" height="' + h + '" fill="#000" opacity=".45" filter="' + flou(1.5) + '"/>' +
    '<rect x="' + f(-w / 2) + '" y="' + f(-h / 2) + '" width="' + w + '" height="' + h + '" rx="1.5" fill="' + grad('#8a5e34') + '" stroke="' + O + '" stroke-width="1.4"/>' +
    L('M' + f(-w / 2 + 2) + ' ' + f(-h / 2 + 2) + ' L' + f(w / 2 - 2) + ' ' + f(h / 2 - 2), '#5a3a1e', 1.6) +
    L('M' + f(-w / 2) + ' ' + f(-h / 6) + ' H' + f(w / 2) + ' M' + f(-w / 2) + ' ' + f(h / 6) + ' H' + f(w / 2), '#5a3a1e', .7));
}
function sac(x, y, a){
  return G(x, y, a, 1, '<ellipse cx="2" cy="3" rx="7" ry="6" fill="#000" opacity=".4" filter="' + flou(1.5) + '"/>' +
    P('M-6 -1 C -7 -6 6 -7 7 -1 C 8 5 -7 6 -6 -1 Z', grad('#a8916a')) + L('M-1 -5 L 1 -2', '#5a4430', 1.2) + C(2, -3, 1.5, '#fff', ' opacity=".18"'));
}
function coffre(x, y, a, ouvert){
  var s = '<rect x="-9" y="-3" width="20" height="14" fill="#000" opacity=".5" filter="' + flou(1.6) + '"/>';
  if(ouvert){
    s += '<rect x="-10" y="-14" width="20" height="9" rx="2.5" fill="' + grad('#7a4a28') + '" stroke="' + O + '" stroke-width="1.3"/>' +
      '<rect x="-8" y="-12.5" width="16" height="6" rx="1" fill="#6a1e24"/>' + L('M-6 -14 V-5 M6 -14 V-5', '#e0b85a', 1.4) +
      '<rect x="-10" y="-6" width="20" height="13" rx="2" fill="' + grad('#8a5a30') + '" stroke="' + O + '" stroke-width="1.3"/>' +
      '<rect x="-8" y="-4.5" width="16" height="10" rx="1" fill="#2a0e14"/>' + '<rect x="-8" y="-4.5" width="16" height="3" fill="#7a2a2e" opacity=".8"/>' + L('M-10 1 H-8 M8 1 H10', '#e0b85a', 1.6) +
      L('M-10 -2 H10 M-10 3 H10', '#c9a35a', 0, ' opacity="0"');
  } else {
    s += '<rect x="-10" y="-7" width="20" height="14" rx="3" fill="' + grad('#8a5a30') + '" stroke="' + O + '" stroke-width="1.3"/>' +
      L('M-5 -7 V7 M5 -7 V7', '#c9a35a', 1.6) + '<rect x="-2" y="-2" width="4" height="4" fill="#e8c062" stroke="' + O + '" stroke-width=".8"/>';
  }
  return G(x, y, a, 1, s + L('M-10 -6 V6', '#c9a35a', 1.4, ' opacity=".9"') + L('M10 -6 V6', '#c9a35a', 1.4, ' opacity=".9"'));
}
function piece(x, y){ return C(x, y, 1.6, '#f0c860', ' stroke="' + O + '" stroke-width=".6"') + C(x - .4, y - .5, .5, '#fff8d0'); }
function eboulis(x, y, r, seed, c){
  var R = rng(seed), s = '', n = Math.round(r * 1.2);
  c = c || '#5a5070';
  for(var i = 0; i < n; i++){
    var a = R() * Math.PI * 2, d = Math.sqrt(R()) * r, px = x + Math.cos(a) * d, py = y + Math.sin(a) * d * .8, t = 1.6 + R() * (r / 4 + 1.5) * (1 - d / r * .5);
    var pts = []; for(var k = 0; k < 6; k++){ var b = k / 6 * Math.PI * 2 + R() * .5; pts.push([px + Math.cos(b) * t * (.7 + R() * .5), py + Math.sin(b) * t * (.7 + R() * .5)]); }
    s += F(poly(pts.map(function(p){ return [p[0] + 1.5, p[1] + 2]; })), '#000', ' opacity=".4"') + P(poly(pts), grad(mix(c, R() < .5 ? '#7a6f94' : '#3e3550', R() * .6)), ' stroke-width="1"');
  }
  return s;
}
function mousse(x, y, r, seed, c){
  var R = rng(seed), s = '';
  c = c || '#3d6a3e';
  for(var i = 0; i < r * 1.4; i++){ var a = R() * 6.283, d = Math.sqrt(R()) * r; s += C(x + Math.cos(a) * d, y + Math.sin(a) * d * .8, 1.2 + R() * 2.6, R() < .5 ? c : clair(c, .15), ' opacity="' + (.45 + R() * .4).toFixed(2) + '"'); }
  return s;
}
function racine(pts, w){ return L(lisse(pts), O, w + 1.6) + L(lisse(pts), '#6a4a30', w) + L(lisse(pts), '#9a7450', w * .35, ' opacity=".6"'); }
function champis(x, y, n, seed){
  var R = rng(seed), b = '', e = '';
  for(var i = 0; i < n; i++){
    var a = R() * 6.283, d = R() * 7, px = x + Math.cos(a) * d, py = y + Math.sin(a) * d, r = 1.4 + R() * 2.2;
    b += C(px + .8, py + 1.2, r, '#000', ' opacity=".5"') + C(px, py, r, '#2b7f7a', ' stroke="' + O + '" stroke-width=".8"');
    e += C(px, py, r * .8, '#7ff5d8', ' opacity=".85"') + C(px - r * .3, py - r * .3, r * .35, '#e8fff8');
  }
  return {b:b, e:'<g>' + lum(x, y, 16, '#5fffd0', .55) + e + '</g>', l:[x, y, 46, '#4fffc8', .55]};
}
var GLYPHES = ['M5 0 V12 M5 3 L9 0 M5 6 L9 3', 'M2 0 V12 M2 1 L8 4 L2 8', 'M5 0 V12 M1 4 L5 0 L9 4', 'M1 0 L9 12 M9 0 L1 12', 'M5 0 L9 6 L5 12 L1 6 Z',
  'M2 0 V12 M8 0 V12 M2 6 L8 6', 'M2 12 V0 L8 6 L8 0', 'M5 12 V0 M1 8 L5 4 L9 8', 'M1 0 L5 5 L9 0 M5 5 V12', 'M3 0 L7 3 L3 6 L7 9 L3 12'];
function rune(x, y, s, k, a){ var g = GLYPHES[k % GLYPHES.length];
  return G(x, y, a || 0, s || 1, '<g transform="translate(-5 -6)">' + L(g, '#4fe0ff', 3.4, ' opacity=".55" filter="' + flou(1.6) + '"') + L(g, '#bff9ff', 1.3) + '</g>'); }
function toile(x, y, R, a0, a1, dechire, seed){
  var Rn = rng(seed || 3), n = 6, s = '', fils = [];
  for(var i = 0; i < n; i++){ var a = a0 + (a1 - a0) * i / (n - 1); fils.push(a); if(!(dechire && i === 3)) s += 'M' + f(x) + ' ' + f(y) + ' L' + f(x + Math.cos(a) * R) + ' ' + f(y + Math.sin(a) * R) + ' '; }
  for(var r = R * .22; r < R; r += R * .16){
    for(var i = 0; i < n - 1; i++){
      if(dechire && (i === 2 || i === 3) && r > R * .45) continue;
      var aa = fils[i], bb = fils[i + 1], am = (aa + bb) / 2, rm = r * .86;
      s += 'M' + f(x + Math.cos(aa) * r) + ' ' + f(y + Math.sin(aa) * r) + ' Q' + f(x + Math.cos(am) * rm) + ' ' + f(y + Math.sin(am) * rm) + ' ' + f(x + Math.cos(bb) * r) + ' ' + f(y + Math.sin(bb) * r) + ' ';
    }
  }
  if(dechire){ var am2 = fils[3]; s += 'M' + f(x + Math.cos(am2) * R * .5) + ' ' + f(y + Math.sin(am2) * R * .5) + ' q' + f(Math.cos(am2 + .6) * 6) + ' ' + f(Math.sin(am2 + .6) * 6 + 5) + ' ' + f(Math.cos(am2 + .3) * 4) + ' 10'; }
  return '<path d="' + s + '" fill="none" stroke="#000" stroke-width="1.6" opacity=".35" transform="translate(1 1.5)"/><path d="' + s + '" fill="none" stroke="#e8e4f4" stroke-width=".7" opacity=".62"/>';
}
function torche(x, y, a){   /* a : vers l'intérieur de la salle (degrés) */
  var b = G(x, y, a, 1, '<rect x="-3" y="-3" width="5" height="6" rx="1" fill="#2a2430" stroke="' + O + '" stroke-width="1"/>' + L('M0 0 L 8 0', O, 3.6) + L('M0 0 L 8 0', '#7a4a28', 2));
  var r = (a * Math.PI) / 180, fx = x + Math.cos(r) * 9, fy = y + Math.sin(r) * 9;
  var e = lum(fx, fy, 26, '#ff9a3a', .7) + C(fx, fy, 4.6, '#ff7a1a', ' opacity=".95"') + C(fx + .4, fy - .4, 3, '#ffc94a') + C(fx + .6, fy - .6, 1.5, '#fff6d0');
  var Re = rng(Math.round(x * 7 + y)); for(var k = 0; k < 5; k++){ var ea = r + (Re() - .5) * 2.2, ed = 6 + Re() * 13; e += C(fx + Math.cos(ea) * ed, fy + Math.sin(ea) * ed, .5 + Re() * .6, Re() < .5 ? '#ffd27a' : '#ff9a3a', ' opacity="' + (.5 + Re() * .5).toFixed(2) + '"'); }
  return {b:b, e:e, l:[fx, fy, 92, '#ffa04a', .95]};
}
function bougie(x, y){
  return {b:C(x + .8, y + 1, 2.4, '#000', ' opacity=".4"') + C(x, y, 2.2, '#efe2c0', ' stroke="' + O + '" stroke-width=".8"'),
    e:lum(x, y - 1, 10, '#ffb04a', .8) + C(x, y - .5, 1.3, '#ffe08a') + C(x, y - .6, .6, '#fff'), l:[x, y, 34, '#ffaa50', .55]};
}
function flaque(x, y, rx, ry, a){
  return G(x, y, a || 0, 1, '<ellipse rx="' + rx + '" ry="' + ry + '" fill="#141e34" stroke="#0a0814" stroke-width="1"/><ellipse cx="' + f(rx * .2) + '" cy="' + f(-ry * .2) + '" rx="' + f(rx * .45) + '" ry="' + f(ry * .3) + '" fill="#4a6aa0" opacity=".35"/>');
}
function engrenage(x, y, r, n, a, c){
  var pts = [];
  for(var i = 0; i < n * 4; i++){ var t = i / (n * 4) * Math.PI * 2 + (a || 0), rr2 = (i % 4 < 2) ? r : r * .8; pts.push([x + Math.cos(t) * rr2, y + Math.sin(t) * rr2]); }
  return F(poly(pts.map(function(p){ return [p[0] + 2, p[1] + 3]; })), '#000', ' opacity=".45"') + P(poly(pts), grad(c || '#8a6a3e'), ' stroke-width="1.3"') +
    C(x, y, r * .55, 'none', ' stroke="' + O + '" stroke-width="1" opacity=".7"') + C(x, y, r * .22, '#2a2030', ' stroke="' + O + '" stroke-width="1"') + C(x + r * .3, y - r * .35, r * .18, '#fff', ' opacity=".2"');
}

/* ================= la structure : murs de pierre, dalles, couloirs ================= */
function formesSalles(){ return ORDRE.filter(function(k){ return !SALLES[k].couloir; }).map(function(k){ return SALLES[k]; }); }

function patterns(){
  /* dalles du sol : irrégulières, quatre tons */
  var R = rng(11), t = '', cols = ['#4d4466', '#463e5e', '#544a6e', '#423a58', '#4a4262'];
  var dal = [[0, 0, 15, 12], [15, 0, 11, 12], [26, 0, 14, 12], [0, 12, 9, 14], [9, 12, 17, 14], [26, 12, 14, 14], [0, 26, 13, 14], [13, 26, 13, 14], [26, 26, 14, 14]];
  dal.forEach(function(d){ t += '<rect x="' + (d[0] + .7) + '" y="' + (d[1] + .7) + '" width="' + (d[2] - 1.4) + '" height="' + (d[3] - 1.4) + '" rx="1.6" fill="' + cols[Math.floor(R() * cols.length)] + '"/>' +
    '<path d="M' + (d[0] + 1.5) + ' ' + (d[1] + d[3] - 1.2) + ' H' + (d[0] + d[2] - 1.2) + ' V' + (d[1] + 1.5) + '" stroke="#000" stroke-width=".8" fill="none" opacity=".25"/>' +
    '<path d="M' + (d[0] + 1.2) + ' ' + (d[1] + d[3] - 2) + ' V' + (d[1] + 1.2) + ' H' + (d[0] + d[2] - 2) + '" stroke="#fff" stroke-width=".6" fill="none" opacity=".08"/>'; });
  for(var i = 0; i < 18; i++) t += '<circle cx="' + f(R() * 40) + '" cy="' + f(R() * 40) + '" r="' + f(.3 + R() * .6) + '" fill="' + (R() < .5 ? '#1a1424' : '#6a6088') + '" opacity=".6"/>';
  DEFS.l.push('<pattern id="dalle" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="#221b30"/>' + t + '</pattern>');
  /* grandes dalles carrées (le couloir piégé) */
  var t2 = '', R2 = rng(5);
  for(var a = 0; a < 2; a++) for(var b = 0; b < 2; b++) t2 += '<rect x="' + (a * 11 + .8) + '" y="' + (b * 11 + .8) + '" width="9.4" height="9.4" rx="1" fill="' + ['#8e86aa', '#3c3652', '#423b58', '#857da2'][a * 2 + b] + '"/>';
  DEFS.l.push('<pattern id="dalle2" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(-18)"><rect width="22" height="22" fill="#211a2e"/>' + t2 + '</pattern>');
  /* pavés ronds du fond du puits */
  var t3 = '', R3 = rng(9);
  for(var k = 0; k < 26; k++){ var px = R3() * 30, py = R3() * 30, r = 2.4 + R3() * 2.6; t3 += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + f(r) + '" fill="' + ['#4a4462', '#544c6c', '#433c58'][k % 3] + '"/>'; }
  DEFS.l.push('<pattern id="paves" width="30" height="30" patternUnits="userSpaceOnUse"><rect width="30" height="30" fill="#2a2338"/>' + t3 + '</pattern>');
  /* planches de bois (la réserve) */
  var t5 = '', R5 = rng(29), bois = ['#5e4432', '#543c2c', '#664a36', '#4e3828'];
  for(var y5 = 0; y5 < 4; y5++){ var dec = (y5 % 2) * 17; for(var x5 = -1; x5 < 2; x5++){ var xx = x5 * 34 + dec; t5 += '<rect x="' + (xx + .6) + '" y="' + (y5 * 9 + .6) + '" width="32.8" height="7.8" rx="1" fill="' + bois[Math.floor(R5() * 4)] + '"/><circle cx="' + (xx + 3) + '" cy="' + (y5 * 9 + 4.5) + '" r=".7" fill="#2a1c14"/><circle cx="' + (xx + 30) + '" cy="' + (y5 * 9 + 4.5) + '" r=".7" fill="#2a1c14"/>'; } }
  DEFS.l.push('<pattern id="planches" width="34" height="36" patternUnits="userSpaceOnUse"><rect width="34" height="36" fill="#22160f"/>' + t5 + '</pattern>');
  /* terre et cailloux (éboulé, grotte) */
  var t4 = '', R4 = rng(17);
  for(var k2 = 0; k2 < 40; k2++) t4 += '<circle cx="' + f(R4() * 36) + '" cy="' + f(R4() * 36) + '" r="' + f(.6 + R4() * 1.8) + '" fill="' + ['#4a4258', '#3a3346', '#554c66', '#2c2638'][k2 % 4] + '"/>';
  DEFS.l.push('<pattern id="terre" width="36" height="36" patternUnits="userSpaceOnUse"><rect width="36" height="36" fill="#332c3e"/>' + t4 + '</pattern>');
}

function solDe(s){ return s.id === 'reserve' ? 'url(#planches)' : (s.id === 'puits' || s.id === 'aeration') ? 'url(#paves)' : (s.id === 'eboule' || s.id === 'givre') ? 'url(#terre)' : 'url(#dalle)'; }


function structure(){
  var salles = formesSalles(), cou = COULOIRS, s = '';
  var cj = cercle(J.x, J.y, J.r), MR = 'maskUnits="userSpaceOnUse" x="-60" y="-60" width="' + (WW + 120) + '" height="' + (WH + 120) + '"';
  /* 1. le contour sombre */
  salles.forEach(function(r){ s += '<path d="' + r.d + '" fill="#0a0710" stroke="#0a0710" stroke-width="' + (2 * M + 5) + '" stroke-linejoin="round"/>'; });
  cou.forEach(function(c){ s += '<path d="' + lisse(c.pts) + '" fill="none" stroke="#0a0710" stroke-width="' + ((c.l || SOL) + 2 * M + 5) + '" stroke-linecap="round" stroke-linejoin="round"/>'; });
  s += '<circle cx="' + J.x + '" cy="' + J.y + '" r="' + (J.r + M + 2.5) + '" fill="#0a0710"/>';
  /* 2. les masques des murs et du sol */
  var mm = '', ms = '';
  salles.forEach(function(r){ mm += '<path d="' + r.d + '" fill="#fff" stroke="#fff" stroke-width="' + (2 * M) + '" stroke-linejoin="round"/>'; ms += '<path d="' + r.d + '" fill="#fff"/>'; });
  cou.forEach(function(c){ mm += '<path d="' + lisse(c.pts) + '" fill="none" stroke="#fff" stroke-width="' + ((c.l || SOL) + 2 * M) + '" stroke-linecap="round" stroke-linejoin="round"/>';
    ms += '<path d="' + lisse(c.pts) + '" fill="none" stroke="#fff" stroke-width="' + (c.l || SOL) + '" stroke-linecap="round" stroke-linejoin="round"/>'; });
  mm += '<circle cx="' + J.x + '" cy="' + J.y + '" r="' + (J.r + M) + '" fill="#fff"/>'; ms += '<circle cx="' + J.x + '" cy="' + J.y + '" r="' + J.r + '" fill="#fff"/>';
  DEFS.l.push('<mask id="mMurs" ' + MR + '>' + mm + '</mask>');
  DEFS.l.push('<mask id="mSol" ' + MR + '>' + ms + '</mask>');
  DEFS.l.push('<mask id="mHorsSol" ' + MR + '><rect x="-60" y="-60" width="' + (WW + 120) + '" height="' + (WH + 120) + '" fill="#fff"/>' + ms.replace(/#fff/g, '#000') + '</mask>');
  /* 3. les pierres des murs (seulement près de la zone dessinée) */
  var R = rng(23), pierres = '', teintes = ['#4e4466', '#574c72', '#463d5c', '#5f547c', '#4a4060', '#3f3752'];
  function proche(x, y){ return x > Z.x - 40 && x < Z.x + Z.w + 40 && y > Z.y - 40 && y < Z.y + Z.h + 40; }
  function bloc(x, y, a, lg, ep){
    var c = teintes[Math.floor(R() * teintes.length)];
    if(!proche(x, y)) return '';
    return '<rect x="' + f(-lg / 2) + '" y="' + f(-ep / 2) + '" width="' + f(lg) + '" height="' + f(ep) + '" rx="2.2" fill="' + c + '" stroke="#120c1a" stroke-width="1.1" transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(a * 180 / Math.PI) + ')"/>';
  }
  salles.forEach(function(r){
    echant(r.d, 12.5).forEach(function(p){
      var nx = -Math.sin(p.ang), ny = Math.cos(p.ang);
      if(dedans(r.d, p.x + nx * 3, p.y + ny * 3)){ nx = -nx; ny = -ny; }
      pierres += bloc(p.x + nx * M / 2, p.y + ny * M / 2, p.ang, 10.5 + R() * 3.8, M - 1.6);
    });
  });
  cou.forEach(function(c){
    var lw = (c.l || SOL) / 2 + M / 2;
    echant(lisse(c.pts), 12, 0).forEach(function(p){ var nx = -Math.sin(p.ang), ny = Math.cos(p.ang);
      pierres += bloc(p.x + nx * lw, p.y + ny * lw, p.ang, 10 + R() * 3.8, M - 1.6) + bloc(p.x - nx * lw, p.y - ny * lw, p.ang, 10 + R() * 3.8, M - 1.6); });
  });
  echant(cj, 11).forEach(function(p){ var nx = -Math.sin(p.ang), ny = Math.cos(p.ang); if(dedans(cj, p.x + nx * 3, p.y + ny * 3)){ nx = -nx; ny = -ny; } pierres += bloc(p.x + nx * M / 2, p.y + ny * M / 2, p.ang, 10, M - 1.6); });
  s += '<g mask="url(#mMurs)"><rect x="' + Z.x + '" y="' + Z.y + '" width="' + Z.w + '" height="' + Z.h + '" fill="#2a2238"/>' + pierres +
    '<rect x="' + Z.x + '" y="' + Z.y + '" width="' + Z.w + '" height="' + Z.h + '" filter="url(#grainMur)" opacity=".5"/></g>';
  /* 4. le bord du sol, puis le sol */
  salles.forEach(function(r){ s += '<path d="' + r.d + '" fill="#120c1a" stroke="#120c1a" stroke-width="3"/>'; });
  cou.forEach(function(c){ s += '<path d="' + lisse(c.pts) + '" fill="none" stroke="#120c1a" stroke-width="' + ((c.l || SOL) + 3) + '" stroke-linecap="round" stroke-linejoin="round"/>'; });
  s += '<circle cx="' + J.x + '" cy="' + J.y + '" r="' + (J.r + 1.5) + '" fill="#120c1a"/>';
  cou.forEach(function(c){ s += '<path d="' + lisse(c.pts) + '" fill="none" stroke="' + (c.salle === 'dalles' ? 'url(#dalle2)' : 'url(#dalle)') + '" stroke-width="' + (c.l || SOL) + '" stroke-linecap="' + (c.salle === 'dalles' ? 'butt' : 'round') + '" stroke-linejoin="round"/>'; });
  s += '<circle cx="' + J.x + '" cy="' + J.y + '" r="' + J.r + '" fill="url(#dalle)"/>';
  salles.forEach(function(r){ s += '<path d="' + r.d + '" fill="' + solDe(r) + '"/>'; });
  /* les seuils : deux grosses pierres de chaque côté des portes */
  cou.forEach(function(c){
    [c.de, c.a].forEach(function(k, fin){
      var q = seuil(c, k, fin); if(!q) return;
      var nx = -Math.sin(q.ang), ny = Math.cos(q.ang), lw = (c.l || SOL) / 2 + 3.5;
      [1, -1].forEach(function(sg){ s += '<rect x="-5" y="-5" width="10" height="10" rx="2" fill="' + grad('#6a5e88') + '" stroke="#120c1a" stroke-width="1.2" transform="translate(' + f(q.x + nx * lw * sg) + ' ' + f(q.y + ny * lw * sg) + ') rotate(' + f(q.ang * 180 / Math.PI) + ')"/>'; });
    });
  });
  /* 5. l'ombre des murs sur le sol, le grain */
  s += '<g mask="url(#mSol)"><g filter="' + flou(4.5) + '"><rect x="' + (Z.x - 20) + '" y="' + (Z.y - 20) + '" width="' + (Z.w + 40) + '" height="' + (Z.h + 40) + '" fill="#07040c" mask="url(#mHorsSol)" opacity=".85"/></g></g>';
  s += '<g mask="url(#mSol)"><rect x="' + Z.x + '" y="' + Z.y + '" width="' + Z.w + '" height="' + Z.h + '" filter="url(#grainSol)" opacity=".55"/></g>';
  return s;
}
/* là où un couloir passe le mur d'une salle (depuis le début, ou depuis la fin) */
function seuil(c, k, fin){
  var r = SALLES[k]; if(!r || r.couloir) return null;
  var p = chemin(lisse(c.pts)), Lg = p.getTotalLength(), q = null;
  for(var t = 0; t <= 1; t += .01){ var tt = fin ? 1 - t : t, a = p.getPointAtLength(Lg * tt); if(!dedans(r.d, a.x, a.y)){ var b = p.getPointAtLength(Math.min(Lg, Lg * tt + 1)), c2 = p.getPointAtLength(Math.max(0, Lg * tt - 1)); q = {x:a.x, y:a.y, ang:Math.atan2(b.y - c2.y, b.x - c2.x)}; break; } }
  p.remove(); return q;
}

/* ================= les signes (œil, lune, gueule, étoile) ================= */
var SIGNES = {
  oeil:'M-8 0 Q 0 -7.5 8 0 Q 0 7.5 -8 0 Z M0 -2.6 A2.6 2.6 0 1 1 0 2.6 A2.6 2.6 0 1 1 0 -2.6 Z',
  lune:'M2.5 -8 A8 8 0 1 0 2.5 8 A6 6 0 1 1 2.5 -8 Z',
  gueule:'M-8.5 -.5 Q 0 9.5 8.5 -.5 Q 0 3 -8.5 -.5 Z M-7.6 -1.5 A2.6 2.6 0 1 1 -2.4 -1.5 M2.4 -1.5 A2.6 2.6 0 1 1 7.6 -1.5',
  etoile:'M0 -8.5 L 2.4 -2.8 L 8.4 -2.6 L 3.8 1.2 L 5.3 7.2 L 0 3.8 L -5.3 7.2 L -3.8 1.2 L -8.4 -2.6 L -2.4 -2.8 Z'
};
function signe(type, x, y, s, plaque){
  var g = SIGNES[type], b = '', e = '';
  if(plaque !== false) b += G(x, y, 0, s, '<circle cx="1.5" cy="2" r="11.5" fill="#000" opacity=".5"/><circle r="11.5" fill="' + grad('#6e6488') + '" stroke="' + O + '" stroke-width="1.4"/><circle r="9" fill="none" stroke="#3a3250" stroke-width=".8"/>');
  b += G(x, y, 0, s, '<path d="' + g + '" fill="none" stroke="#1a1426" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>');
  e += G(x, y, 0, s, '<path d="' + g + '" fill="none" stroke="#4fe0ff" stroke-width="3.6" opacity=".5" filter="' + flou(1.8) + '" stroke-linejoin="round"/><path d="' + g + '" fill="none" stroke="#c8faff" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round"/>');
  return {b:b, e:e, l:[x, y, 34, '#5fe8ff', .55]};
}
var SIGNES_MUR = {aeration:[1200, 512], cave:[1700, 990], crypte:[2354, 700], ossuaire:[2061, 905]};

/* ================= le décor des salles ================= */
function deco(id, etat){
  var S = SALLES[id], d;
  if(S.v1){
    d = decoV1(id, etat);
    var v = V1[id], tr = 'translate(' + S.x + ' ' + S.y + ') scale(' + K + ') translate(' + (-v.x) + ' ' + (-v.y) + ')';
    d = {b:'<g transform="' + tr + '">' + d.b + '</g>', e:'<g transform="' + tr + '">' + d.e + '</g>',
      l:d.l.map(function(q){ return [S.x + (q[0] - v.x) * K, S.y + (q[1] - v.y) * K, q[2] * K, q[3], q[4]]; })};
  } else d = decoNeuf(id, etat);
  if(S.signe){ var p = SIGNES_MUR[id], sg = signe(S.signe, p[0], p[1], 1); d.b += sg.b; d.e += sg.e; d.l.push(sg.l); }
  return d;
}
function porteSignee(c, type){   /* une porte de bois fermée, avec son médaillon gravé */
  var q = seuil(c, 'portes', 0), a = q.ang * 180 / Math.PI, w = (c.l || SOL) + 10;
  var b = G(q.x, q.y, a, 1, '<rect x="-6" y="' + f(-w / 2 + 2) + '" width="11" height="' + w + '" fill="#000" opacity=".5"/>' +
    '<rect x="-5" y="' + f(-w / 2) + '" width="10" height="' + w + '" rx="2" fill="' + grad('#7a5230') + '" stroke="' + O + '" stroke-width="1.4"/>' +
    L('M-5 ' + f(-w / 4) + ' H5 M-5 ' + f(w / 4) + ' H5', '#3a3044', 2.2) + L('M0 ' + f(-w / 2 + 2) + ' V' + f(w / 2 - 2), '#4e3420', .7));
  var sg = signe(type, q.x - Math.cos(q.ang) * 4, q.y - Math.sin(q.ang) * 4, .82);
  return {b:b + sg.b, e:sg.e, l:sg.l};
}
function decoNeuf(id, etat){
  var b = '', e = '', l = [], vu = etat === 'vu';
  function add(o){ b += o.b || ''; e += o.e || ''; if(o.l) l.push(o.l); }
  switch(id){
  case 'galerie':
    /* une galerie à colonnes ; au fond (à l'ouest), la voûte s'est effondrée et bouche tout */
    b += colonne(1050, 736, 6.5) + colonne(1050, 774, 6.5) + colonne(1008, 736, 6.5);
    b += L('M1040 760 l-14 4 l-9 -6 l-12 5 M1010 790 l6 -9', '#0c0812', 1.2, ' opacity=".8"');
    var Rb = rng(215), blocs = '';
    [[930, 742, 15], [928, 770, 14], [948, 756, 13], [942, 732, 9], [954, 778, 9], [966, 744, 8], [916, 756, 10]].forEach(function(q){
      var pts = []; for(var k = 0; k < 7; k++){ var a2 = k / 7 * 6.283 + Rb(); pts.push([q[0] + Math.cos(a2) * q[2] * (.75 + Rb() * .35), q[1] + Math.sin(a2) * q[2] * (.75 + Rb() * .35)]); }
      blocs += F(poly(pts.map(function(p){ return [p[0] + 3, p[1] + 4]; })), '#000', ' opacity=".55"') + P(poly(pts), grad(mix('#6a6088', '#3e3550', Rb() * .5)), ' stroke-width="1.4"') + L('M' + f(q[0] - q[2] * .4) + ' ' + f(q[1] - q[2] * .1) + ' l' + f(q[2] * .5) + ' ' + f(q[2] * .3), '#2a2238', 1);
    });
    b += eboulis(980, 750, 8, 203) + eboulis(978, 734, 4, 207) + blocs + os(984, 770, 30, 6) + os(990, 764, -50, 5);
    /* la trouvaille : une bourse de pièces, tombée près des éboulis */
    b += G(974, 774, -12, 1.4, '<ellipse cx="2" cy="3" rx="8" ry="6" fill="#000" opacity=".45"/><path d="M-7 1 C -8 -6 7 -7 7 0 C 8 7 -7 8 -7 1 Z" fill="' + grad('#9a6a38') + '" stroke="' + O + '" stroke-width="1.2"/>' +
      L('M-3 -5 Q 0 -2 3 -5', '#e0b85a', 1.6) + '<path d="M-2 -6 L 0 -9 L 2 -6" fill="#7a4a28" stroke="' + O + '" stroke-width=".8"/>') +
      piece(990, 784) + piece(996, 777) + piece(984, 790) + piece(1000, 787) + piece(962, 786);
    e += lum(980, 778, 22, '#ffd36a', .8) + G(970, 766, 0, 1, '<path d="M0 -4 L 1 -1 L 4 0 L 1 1 L 0 4 L -1 1 L -4 0 L -1 -1 Z" fill="#fff6d0"/>') + C(996, 777, .9, '#fff6d0');
    b += mousse(1054, 784, 6, 213) + racine([[934, 723], [938, 731], [933, 738]], 1.6);
    add(torche(1036, 723, 90));
    e += lum(944, 752, 26, '#bfe2ff', .6) + C(944, 750, 1.6, '#eef8ff', ' opacity=".8"'); l.push([944, 752, 64, '#9ac4ff', .8]);   /* un filet de lune passe entre les blocs */
    break;
  case 'aeration':
    b += mousse(1172, 532, 9, 221) + mousse(1232, 588, 8, 223, '#355f40') + racine([[1186, 516], [1190, 528], [1184, 538]], 1.6) + racine([[1228, 522], [1222, 532], [1226, 542]], 1.4);
    b += flaque(1176, 586, 7, 4, 20) + eboulis(1236, 552, 5, 225);
    /* la grille du puits d'aération : la lune tombe en carreaux */
    var gr = ''; for(var gx = -22; gx <= 22; gx += 8.8) gr += L('M' + (1200 + gx) + ' 532 V576', '#0a0814', 2.4, ' opacity=".55"'); for(var gy = -22; gy <= 22; gy += 8.8) gr += L('M1178 ' + (554 + gy) + ' H1222', '#0a0814', 2.4, ' opacity=".55"');
    e += '<g style="mix-blend-mode:screen"><circle cx="1200" cy="554" r="44" fill="' + halo('#bfe4ff') + '" opacity=".55"/><rect x="1178" y="532" width="44" height="44" rx="3" fill="#d8eeff" opacity=".2" filter="' + flou(1.5) + '"/></g>' + gr;
    l.push([1200, 554, 78, '#a8d4ff', 1.2]);
    /* la trouvaille : des herbes qui luisent, nourries par la lune */
    var Rh = rng(227), hb = '', he = '';
    for(var k = 0; k < 9; k++){ var a3 = -Math.PI / 2 + (k - 4) * .32 + (Rh() - .5) * .2, lg = 9 + Rh() * 7, x0 = 1214 + (Rh() - .5) * 6, y0 = 584;
      var x1 = x0 + Math.cos(a3) * lg, y1 = y0 + Math.sin(a3) * lg, cx = x0 + Math.cos(a3 + .5) * lg * .5, cy = y0 + Math.sin(a3 + .5) * lg * .5;
      hb += L('M' + f(x0) + ' ' + f(y0) + ' Q' + f(cx) + ' ' + f(cy) + ' ' + f(x1) + ' ' + f(y1), O, 3.2) + L('M' + f(x0) + ' ' + f(y0) + ' Q' + f(cx) + ' ' + f(cy) + ' ' + f(x1) + ' ' + f(y1), '#3a9a6a', 1.8);
      he += C(x1, y1, 1.9, '#9fffd8') + C(x1, y1, .8, '#f0fff8'); }
    b += '<ellipse cx="1216" cy="586" rx="10" ry="4" fill="#000" opacity=".4"/>' + hb;
    e += lum(1214, 576, 22, '#5fffc0', .8) + he;
    l.push([1214, 578, 46, '#4fffb8', .7]);
    break;
  case 'portes':
    e += G(2135, 700, 0, 1, '<circle r="30" fill="none" stroke="#7ff0ff" stroke-width="1.1" opacity=".5"/><circle r="22" fill="none" stroke="#7ff0ff" stroke-width=".7" opacity=".35" stroke-dasharray="3 4"/>') + rune(2135, 700, .9, 4) + rune(2112, 688, .55, 2) + rune(2158, 712, .55, 6);
    b += G(2135, 700, 0, 1, '<circle r="30" fill="#2a2236" opacity=".5"/>');
    add(torche(2072, 664, 0)); add(torche(2072, 736, 0));
    b += eboulis(2186, 748, 5, 231) + mousse(2084, 750, 6, 233, '#2e5a48');
    COULOIRS.forEach(function(c){ if(c.porte) add(porteSignee(c, c.porte)); });
    l.push([2135, 700, 46, '#5fe8ff', .6]);
    break;
  case 'crypte':
    b += G(2296, 700, 0, 1, '<rect x="-24" y="-11" width="48" height="22" rx="3" fill="#000" opacity=".5" transform="translate(2 3)"/><rect x="-24" y="-11" width="48" height="22" rx="3" fill="' + grad('#5a5272') + '" stroke="' + O + '" stroke-width="1.3"/><rect x="-20" y="-7" width="40" height="14" rx="2" fill="#0c0812"/>') +
      G(2302, 688, 14, 1, '<rect x="-24" y="-9" width="48" height="16" rx="3" fill="#000" opacity=".4" transform="translate(2 3)"/><rect x="-24" y="-9" width="48" height="16" rx="3" fill="' + grad('#6a6288') + '" stroke="' + O + '" stroke-width="1.3"/>' + L('M-18 -1 H18', '#3a3250', 1));
    b += toile(2252, 657, 22, 0, Math.PI / 2, false, 31) + toile(2348, 743, 20, Math.PI, Math.PI * 1.5, false, 33) + os(2268, 728, 30, 7) + os(2276, 734, -40, 6) + crane(2266, 736, 60, .9) + eboulis(2340, 664, 5, 235);
    b += G(2283, 704, 0, 1, L('M-6 -4 Q 0 3 6 -4', '#c9a35a', 1.1) + '<path d="M0 -1 L 3.4 2.6 L 0 6.4 L -3.4 2.6 Z" fill="#d8303e" stroke="#5a3a1a" stroke-width="1.2"/>' + C(-1, 1.6, .9, '#ffd0d0'));
    e += lum(2354, 700, 24, '#6fff9a', .35) + lum(2283, 706, 12, '#ff6a6a', .6) + lum(2283, 706, 6, '#ffd36a', .5);
    break;
  case 'egouts':
    var dE = lisse(SALLES.egouts.pts);
    b += L(dE, '#07040a', 12) + L(dE, '#0b1626', 9);
    e += L(dE, '#1f7ad0', 6, ' opacity=".32"') + L(dE, '#9fe6ff', .8, ' opacity=".4" stroke-dasharray="3 9"');
    b += mousse(1340, 1140, 8, 241, '#2e5a48') + mousse(1528, 1100, 7, 243, '#2e5a48') + racine([[1410, 1228], [1416, 1218], [1410, 1208]], 1.4);
    [[0.3, 1], [0.6, 1]].forEach(function(t){ var q = pointA(SALLES.egouts.pts, t[0]); b += G(q.x, q.y, q.ang * 180 / Math.PI, 1, '<rect x="-4" y="-7" width="8" height="14" fill="#1a1426" stroke="' + O + '" stroke-width=".8"/>' + L('M-4 -3 H4 M-4 0 H4 M-4 3 H4', '#5a5478', 1)); });
    [.2, .5, .8].forEach(function(t){ var q = pointA(SALLES.egouts.pts, t); l.push([q.x, q.y, 40, '#3a8cff', .45]); });
    break;
  }
  return {b:b, e:e, l:l};
}
/* le bout du vieux passage, côté grotte de givre : il finit sur un éboulement */
function decoVieux(){ return eboulis(852, 910, 17, 251, '#5e5478') + eboulis(862, 928, 9, 253); }

/* ================= les repères de sortie ================= */
function sortie(c, t, inverse){
  var p = pointA(c.pts, t), a = p.ang * 180 / Math.PI + (inverse ? 180 : 0);
  return G(p.x, p.y, a, 1,
    '<circle r="14" fill="' + halo('#ffcf6a') + '" opacity=".6"/>' +
    '<circle r="11" fill="none" stroke="#ffd36a" stroke-width="1.1" opacity=".5"/>' +
    '<path d="M-5 -5.5 L 1 0 L -5 5.5 M1 -5.5 L 7 0 L 1 5.5" fill="none" stroke="' + O + '" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M-5 -5.5 L 1 0 L -5 5.5" fill="none" stroke="#ffe08a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" opacity=".6"/>' +
    '<path d="M1 -5.5 L 7 0 L 1 5.5" fill="none" stroke="#fff0b8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>');
}
/* un morceau de couloir, entre les fractions a et b de sa longueur */
function troncon(pts, a, b){ var p = chemin(lisse(pts)), Lg = p.getTotalLength(), out = []; for(var k = 0; k <= 14; k++){ var q = p.getPointAtLength(Lg * (a + (b - a) * k / 14)); out.push([q.x, q.y]); } p.remove(); return out; }
function morceaux(v){ return typeof v === 'number' ? [[0, v]] : v; }

/* ================= le décor de chaque salle ================= */
/* chaque salle rend {b: dessin sous la lumière, e: ce qui brille, l: [sources de lumière]} ; etat : 'vu' | 'apercu' | 'inconnu' */
function decoV1(id, etat){
  var b = '', e = '', l = [];
  function add(o){ b += o.b || ''; e += o.e || ''; if(o.l) l.push(o.l); }
  var vu = etat === 'vu';
  switch(id){
  case 'puits':
    b += mousse(60, 140, 12, 3) + mousse(122, 214, 10, 4) + mousse(50, 212, 9, 8, '#355f40');
    b += racine([[58, 136], [62, 146], [58, 156], [63, 164]], 2.2) + racine([[114, 138], [110, 147], [117, 154]], 1.6);
    b += eboulis(118, 146, 8, 4) + eboulis(64, 224, 6, 9);
    b += flaque(124, 186, 6, 4, 70);
    /* le vieux seau renversé */
    b += G(112, 214, 30, 1, '<path d="M-6 -5 L 6 -5 L 5 6 L -5 6 Z" fill="' + grad('#6a4628') + '" stroke="' + O + '" stroke-width="1.2"/><ellipse cx="0" cy="-5" rx="6" ry="2" fill="#1a1018" stroke="' + O + '" stroke-width="1"/>' + L('M-6 -1 H6 M-5.5 3 H5.5', '#9a8a7a', .9));
    /* la corde : elle pend depuis l'ouverture du puits (au centre du rond de lune) et s'enroule au sol */
    var spi = [], cx0 = 64, cy0 = 200;
    for(var k = 0; k <= 40; k++){ var u = k / 40, a = u * Math.PI * 2 * 2.6, rr2 = 9.5 - u * 7; spi.push([cx0 + Math.cos(a) * rr2, cy0 + Math.sin(a) * rr2 * .78]); }
    var dsp = lisse(spi);
    b += '<ellipse cx="66" cy="203" rx="12" ry="9" fill="#000" opacity=".45" filter="' + flou(2) + '"/>' +
      L(dsp, O, 4) + L(dsp, '#c9a46a', 2.4) + L(dsp, '#7a5a34', 2.4, ' stroke-dasharray="1 2.2"') +
      L('M73.5 199 C 76 188 74 172 72 161', O, 4) + L('M73.5 199 C 76 188 74 172 72 161', '#c9a46a', 2.4) + L('M73.5 199 C 76 188 74 172 72 161', '#7a5a34', 2.4, ' stroke-dasharray="1 2.2"') +
      C(72, 160, 2.6, '#d9b47a', ' stroke="' + O + '" stroke-width="1.2"');
    /* le rond de lune qui tombe du puits */
    e += '<g style="mix-blend-mode:screen"><circle cx="72" cy="160" r="48" fill="' + halo('#bfe4ff') + '" opacity=".55"/>' +
      '<circle cx="72" cy="160" r="27" fill="#d8eeff" opacity=".22" filter="' + flou(2) + '"/><circle cx="72" cy="160" r="18" fill="#eef8ff" opacity=".14" filter="' + flou(3) + '"/></g>' +
      '<circle cx="72" cy="160" r="27" fill="none" stroke="#eaf6ff" stroke-width="1.4" opacity=".3" filter="' + flou(1) + '"/>';
    var Rm = rng(4); for(var k2 = 0; k2 < 22; k2++){ var a2 = Rm() * 6.283, d2 = Math.sqrt(Rm()) * 28; e += C(72 + Math.cos(a2) * d2, 160 + Math.sin(a2) * d2, .5 + Rm() * .9, '#f2faff', ' opacity="' + (.45 + Rm() * .5).toFixed(2) + '"'); }
    l.push([72, 160, 76, '#a8d4ff', 1.25]);
    add(champis(58, 216, 5, 7)); add(champis(124, 148, 3, 12));
    break;
  case 'rats':
    add(torche(256, 141, 90)); add(torche(340, 214, 180));
    b += caisse(232, 166, 13, 11, 12) + caisse(240, 154, 9, 8, -20) + sac(332, 160, 30) + eboulis(330, 222, 6, 31);
    b += F('M318 146 a6 4 0 0 1 12 0 Z', '#07040a') + F('M221 228 a4 6 0 0 1 0 -12 Z', '#07040a');   /* des trous de rats */
    b += mousse(232, 222, 8, 21) + flaque(296, 214, 7, 3.5, -10);
    var Rp = rng(57), pa = ''; for(var k9 = 0; k9 < 70; k9++){ var cxp = k9 < 40 ? 238 : 330, cyp = k9 < 40 ? 168 : 214, a9 = Rp() * 6.283, d9 = Math.sqrt(Rp()) * (k9 < 40 ? 16 : 11), x9 = cxp + Math.cos(a9) * d9, y9 = cyp + Math.sin(a9) * d9 * .8, b9 = Rp() * 3.14;
      pa += L('M' + f(x9) + ' ' + f(y9) + ' l' + f(Math.cos(b9) * 4) + ' ' + f(Math.sin(b9) * 4), Rp() < .5 ? '#a8925a' : '#7a6838', .8, ' opacity=".8"'); }
    b += pa + racine([[300, 146], [302, 156], [296, 164], [300, 172]], 1.6) + racine([[349, 176], [340, 178], [334, 186]], 1.4);
    if(vu){
      b += os(268, 185, 20, 9) + os(274, 190, -40, 7) + craneRat(262, 194, 160) + os(306, 178, 70, 8) + craneRat(314, 186, -30) + os(292, 200, 10, 6) + os(248, 208, -60, 7) + craneRat(300, 170, 200);
    }
    break;
  case 'reserve':
    b += tonneau(250, 58, 8) + tonneau(264, 52, 6.5) + tonneau(248, 76, 6) + caisse(320, 56, 14, 12, 8) + caisse(322, 70, 10, 9, -12) + sac(318, 95, -20) + sac(244, 96, 40);
    b += toile(237, 43, 16, 0, Math.PI / 2, false, 4);
    b += G(287, 72, 0, 1.45, coffre(0, 0, 0, vu));
    if(vu){ b += piece(270, 84) + piece(303, 86) + piece(298, 92) + piece(276, 92); e += lum(287, 72, 18, '#ffcf6a', .45); }
    add(bougie(330, 86));
    break;
  case 'canaux':
    /* les colonnes */
    b += colonne(218, 302, 6) + colonne(218, 374, 6);
    add(torche(226, 282, 90));
    /* la grille du plafond : de la lune tombe en carreaux */
    e += G(240, 314, 8, 1, '<rect x="-13" y="-11" width="26" height="22" fill="#bfe2ff" opacity=".13"/>' + [-6.5, 0, 6.5].map(function(gx){ return '<rect x="' + (gx - 2.6) + '" y="-9" width="5.2" height="18" fill="#cfeaff" opacity=".14"/>'; }).join(''));
    l.push([240, 314, 44, '#9fcaff', .7]);
    /* le canal, nord-sud, qui traverse la salle */
    b += '<rect x="288" y="270" width="24" height="136" fill="#0a1426"/>' + L('M288 270 V406 M312 270 V406', '#8a84a6', 2.4) + L('M287 270 V406 M313 270 V406', O, .8);
    e += '<rect x="290" y="276" width="20" height="124" fill="#1f7ad0" opacity=".42"/>';
    var Rw = rng(8); for(var k3 = 0; k3 < 14; k3++){ var yy = 280 + k3 * 8.6 + Rw() * 3; e += L('M' + f(292 + Rw() * 4) + ' ' + f(yy) + ' q4 -2 8 0 t6 0', '#9fe6ff', .8, ' opacity="' + (.35 + Rw() * .4).toFixed(2) + '"'); }
    e += lum(300, 300, 30, '#3fb0ff', .6) + lum(300, 380, 30, '#3fb0ff', .6);
    for(var k4 = 0; k4 < 4; k4++) l.push([300, 290 + k4 * 30, 52, '#3a9cff', .7]);
    /* les bouches du canal dans les murs */
    b += '<rect x="286" y="276" width="28" height="7" fill="#07040a"/>' + L('M290 276 V283 M296 276 V283 M302 276 V283 M308 276 V283', '#6a6488', 1.4);
    b += '<rect x="286" y="393" width="28" height="7" fill="#07040a"/>' + L('M290 393 V400 M296 393 V400 M302 393 V400 M308 393 V400', '#6a6488', 1.4);
    /* le petit pont de bois */
    b += '<rect x="282" y="344" width="38" height="20" fill="#000" opacity=".5" filter="' + flou(2) + '" transform="translate(2 3)"/>';
    var pl = ''; for(var k5 = 0; k5 < 7; k5++) pl += '<rect x="' + (281 + k5 * 5.4) + '" y="343" width="5" height="19" rx="1" fill="' + ['#8a5e34', '#7a5230', '#946a3c'][k5 % 3] + '" stroke="' + O + '" stroke-width=".9"/>';
    b += pl + L('M280 342 H319 M280 363 H319', '#5a3a1e', 2.4) + C(281, 342, 1.8, '#3a2618') + C(318, 342, 1.8, '#3a2618') + C(281, 363, 1.8, '#3a2618') + C(318, 363, 1.8, '#3a2618');
    /* les runes de la ville d'avant */
    e += rune(206, 338, .9, 2) + rune(366, 318, .9, 6) + rune(350, 286, .8, 1) + rune(368, 390, .8, 4);
    l.push([206, 338, 30, '#5fe8ff', .7]); l.push([366, 318, 30, '#5fe8ff', .7]);
    b += mousse(352, 302, 8, 41, '#2e5a48') + mousse(232, 388, 9, 44, '#2e5a48');
    if(vu){ b += os(343, 334, 30, 7) + os(350, 340, -50, 6) + G(352, 375, 20, 1, '<path d="M0 0 L 8 -4 L 6 0 L 9 3 L 0 0 Z" fill="#3a3448" stroke="' + O + '" stroke-width=".8"/>') + os(236, 352, -10, 6); }
    break;
  case 'givre':
    b += '<path d="M48 330 q10 -14 26 -8 t30 4" fill="none" stroke="#dff4ff" stroke-width="5" opacity=".18"/>';
    var Rg = rng(51), cr = '';
    [[40, 320, 30], [60, 300, 70], [128, 312, 140], [140, 372, 200], [118, 385, 250], [52, 382, 300], [42, 370, 330]].forEach(function(c){
      for(var k = 0; k < 3; k++){ var a = (c[2] + (k - 1) * 22) * Math.PI / 180, lg = 7 + Rg() * 8, x0 = c[0], y0 = c[1];
        cr += G(x0, y0, a * 180 / Math.PI + 180, 1, '<path d="M0 -2.2 L ' + f(lg) + ' -1.2 L ' + f(lg + 3) + ' 0 L ' + f(lg) + ' 1.2 L 0 2.2 Z" fill="#bfe8ff" stroke="' + O + '" stroke-width=".9" opacity=".95"/><path d="M1 -1 L ' + f(lg) + ' -.4" stroke="#fff" stroke-width=".7" opacity=".8"/>'); }
    });
    b += cr + eboulis(130, 375, 5, 61, '#56607a');
    /* la fleur de givre */
    var fl = ''; for(var k6 = 0; k6 < 6; k6++) fl += '<path d="M0 0 C 2 -3 2 -8 0 -10 C -2 -8 -2 -3 0 0 Z" fill="#eaf8ff" stroke="#5a7aa0" stroke-width=".6" transform="rotate(' + (k6 * 60) + ')"/>';
    e += lum(92, 342, 40, '#cfefff', .75) + G(92, 342, 0, 1, fl + C(0, 0, 2.2, '#9fe8ff')) + L('M92 352 q-4 6 -2 12 M92 352 q4 5 9 6', '#6ab0a0', 1.2);
    l.push([92, 342, 80, '#bfe6ff', 1]);
    break;
  case 'cave':
    b += toile(412, 286, 34, 0, Math.PI / 2, vu, 3) + toile(528, 286, 30, Math.PI / 2, Math.PI, vu, 5) + toile(412, 378, 26, -Math.PI / 2, 0, false, 7) + toile(528, 378, 22, Math.PI, Math.PI * 1.5, vu, 9);
    /* les cocons */
    [[424, 302, 20], [431, 313, -10], [500, 370, 60]].forEach(function(c){ b += G(c[0], c[1], c[2], 1, '<ellipse cx="1" cy="1.5" rx="3.6" ry="5.2" fill="#000" opacity=".4"/><ellipse rx="3.4" ry="5" fill="#e6e0ee" stroke="' + O + '" stroke-width=".9"/>' + L('M-3 -1 q3 1 6 0 M-3 1.5 q3 1 6 0', '#a8a0b8', .6)); });
    b += eboulis(520, 300, 6, 71) + mousse(430, 372, 8, 73, '#2e5a48') + racine([[500, 382], [496, 372], [502, 364]], 1.4) + mousse(520, 360, 7, 77, '#2e5a48');
    add(torche(505, 282, 90));
    add(champis(424, 360, 6, 13)); add(champis(516, 306, 5, 19)); add(champis(496, 302, 3, 23));
    if(vu){
      /* l'araignée vaincue, sur le dos, les pattes repliées */
      var pt = ''; for(var k7 = 0; k7 < 8; k7++){ var a2 = (k7 / 8) * 6.283 + .2; pt += L('M0 0 L ' + f(Math.cos(a2) * 8) + ' ' + f(Math.sin(a2) * 8) + ' l' + f(Math.cos(a2 + 1.6) * 3) + ' ' + f(Math.sin(a2 + 1.6) * 3), '#2a1e24', 1.4); }
      b += G(470, 338, 25, 1, '<ellipse cx="1.5" cy="2" rx="8" ry="6" fill="#000" opacity=".45"/>' + pt + '<ellipse rx="6" ry="4.6" fill="#4a3428" stroke="' + O + '" stroke-width="1"/><ellipse cx="-5.5" cy="0" rx="3" ry="2.6" fill="#3a2a22" stroke="' + O + '" stroke-width=".9"/>' + C(-6.5, -1, .6, '#ff9a5a') + C(-6.5, 1, .6, '#ff9a5a'));
      b += os(492, 322, 40, 6) + os(448, 346, -20, 5);
    }
    break;
  case 'eboule':
    b += eboulis(598, 446, 14, 81) + eboulis(536, 468, 9, 83) + eboulis(540, 440, 7, 85);
    b += racine([[548, 418], [552, 428], [546, 436]], 1.8) + racine([[612, 456], [602, 462], [598, 470]], 1.6);
    /* le tas d'os */
    var Ro = rng(91), to = ''; for(var k8 = 0; k8 < 9; k8++) to += os(566 + (Ro() - .5) * 14, 462 + (Ro() - .5) * 9, Ro() * 180, 5 + Ro() * 4);
    b += to + crane(566, 458, 15, 1.1) + crane(575, 466, -30, .9);
    e += lum(574, 446, 22, '#a8d0ff', .4); l.push([574, 446, 40, '#9ac4ff', .55]);
    break;
  case 'atelier':
    b += colonne(584, 152, 6) + colonne(696, 152, 6) + colonne(584, 228, 6) + colonne(696, 228, 6);
    b += engrenage(604, 186, 13, 9, .2, '#8a6a3e') + engrenage(621, 200, 8, 7, .5, '#7a6a5e') + engrenage(683, 210, 10, 8, .1, '#8a6a3e');
    b += G(652, 154, 0, 1, '<rect x="-17" y="-5" width="34" height="11" rx="1.5" fill="#000" opacity=".45" transform="translate(2 3)"/><rect x="-17" y="-5" width="34" height="11" rx="1.5" fill="' + grad('#7a5230') + '" stroke="' + O + '" stroke-width="1.2"/>' + L('M-12 -1 l5 3 M2 -2 h8 M-3 2 l4 -3', '#c8c0d0', 1.1));
    b += G(668, 226, 0, 1, '<rect x="-14" y="-5" width="28" height="10" rx="1.5" fill="#000" opacity=".45" transform="translate(2 3)"/><rect x="-14" y="-5" width="28" height="10" rx="1.5" fill="' + grad('#7a5230') + '" stroke="' + O + '" stroke-width="1.2"/>' + C(-6, 0, 2.4, '#a88a5a', ' stroke="' + O + '" stroke-width=".8"') + L('M2 -2 h8', '#c8c0d0', 1.1));
    e += G(648, 192, 0, 1, '<circle r="15" fill="none" stroke="#7ff0ff" stroke-width="1.2" opacity=".75"/><circle r="10" fill="none" stroke="#7ff0ff" stroke-width=".7" opacity=".5"/>') + rune(648, 192, .8, 4) + rune(633, 180, .55, 1) + rune(663, 204, .55, 7);
    l.push([648, 192, 50, '#5fe8ff', .8]);
    add(torche(690, 140, 90));
    break;
  case 'biblio':
    var etag = '', Rb = rng(101), cl = ['#8a3a3a', '#3a5a8a', '#6a7a3a', '#8a6a2a', '#5a3a7a'];
    for(var x = 582; x < 698; x += 3.4) etag += '<rect x="' + f(x) + '" y="41" width="3" height="' + f(5 + Rb() * 3) + '" fill="' + cl[Math.floor(Rb() * 5)] + '" stroke="' + O + '" stroke-width=".4"/>';
    b += '<rect x="580" y="40" width="120" height="9" fill="#3a2418" stroke="' + O + '" stroke-width="1"/>' + etag;
    b += '<path d="M576 70 C 600 60 640 64 660 76 C 680 88 700 86 704 80 L 704 104 L 576 104 Z" fill="#0e1a2e" opacity=".9"/>';
    e += '<path d="M576 70 C 600 60 640 64 660 76 C 680 88 700 86 704 80" fill="none" stroke="#6ab8ff" stroke-width="1" opacity=".5"/>';
    b += G(612, 90, 20, 1, '<rect x="-5" y="-4" width="10" height="8" fill="#6a2a2a" stroke="' + O + '" stroke-width=".8"/>') + G(676, 96, -30, 1, '<rect x="-4" y="-3" width="8" height="6" fill="#3a4a7a" stroke="' + O + '" stroke-width=".8"/>');
    e += lum(690, 62, 12, '#ffd36a', .9) + G(690, 62, -10, 1, '<rect x="-4" y="-5" width="8" height="10" fill="#f3e7cb" stroke="' + O + '" stroke-width=".8"/>');
    l.push([690, 62, 40, '#ffcf70', .7]); l.push([640, 90, 60, '#3a8cff', .5]);
    break;
  case 'ossuaire':
    var ni = ''; [[806, 140], [870, 140], [806, 220], [870, 220]].forEach(function(p, k){ ni += '<rect x="' + (p[0] - 8) + '" y="' + (p[1] - 5) + '" width="16" height="10" rx="3" fill="#120a18"/>' + crane(p[0] - 3, p[1], k * 40, .8) + crane(p[0] + 4, p[1] + 1, -k * 30, .7); });
    b += ni + G(838, 180, 0, 1, '<rect x="-20" y="-9" width="40" height="18" rx="3" fill="#000" opacity=".5" transform="translate(2 3)"/><rect x="-20" y="-9" width="40" height="18" rx="3" fill="' + grad('#5e5478') + '" stroke="' + O + '" stroke-width="1.2"/>' + L('M-16 -5 H16 M-16 5 H16', '#3a3248', .8) + crane(0, 0, 0, 1));
    [[787, 156], [787, 204], [889, 156], [889, 204]].forEach(function(p, k){ b += '<rect x="' + (p[0] - 5) + '" y="' + (p[1] - 8) + '" width="10" height="16" rx="3" fill="#120a18"/>' + crane(p[0], p[1] - 3, k * 50 + 90, .75) + crane(p[0] + 1, p[1] + 4, -k * 40 + 90, .65); });
    add(bougie(806, 176)); add(bougie(872, 194)); add(bougie(812, 196));
    break;
  case 'feu':
    b += G(765, 300, 0, 1, (function(){ var s2 = ''; for(var k = 0; k < 9; k++){ var a = k / 9 * 6.283; s2 += C(Math.cos(a) * 11, Math.sin(a) * 9, 3, '#5a5068', ' stroke="' + O + '" stroke-width=".9"'); } return s2; })() + L('M-7 -4 L 7 4 M-7 4 L 7 -4', '#4a2e1a', 3.6));
    b += G(740, 284, 30, 1, '<rect x="-9" y="-4" width="18" height="8" rx="4" fill="#5a4a6a" stroke="' + O + '" stroke-width="1"/>') + G(790, 316, -20, 1, '<rect x="-9" y="-4" width="18" height="8" rx="4" fill="#6a4a3a" stroke="' + O + '" stroke-width="1"/>');
    e += lum(765, 300, 30, '#ff8a2a', .9) + C(765, 300, 6, '#ff7a1a') + C(766, 299, 3.6, '#ffc94a') + C(766, 299, 1.6, '#fff6d0');
    l.push([765, 300, 90, '#ff9a3a', 1]);
    break;
  case 'bassin':
    b += '<path d="' + rr(760, 450, 134, 70, 32) + '" fill="#000" opacity=".5" filter="' + flou(3) + '"/>' +
      '<path d="' + rr(760, 448, 134, 70, 32) + '" fill="#08161a" stroke="#5e567a" stroke-width="4"/><path d="' + rr(760, 448, 134, 70, 32) + '" fill="none" stroke="' + O + '" stroke-width="1"/>';
    e += '<path d="' + rr(760, 450, 124, 60, 28) + '" fill="#1d5a50" opacity=".28"/>' + L('M712 438 q10 -3 20 0 t20 0 M770 462 q8 -3 16 0 t16 0 M736 470 q6 -2 12 0', '#7fd8c8', .8, ' opacity=".45"');
    [[722, 436, 6, 20], [796, 462, 5, 200], [776, 428, 4.5, 120], [742, 470, 3.5, 300]].forEach(function(p){ b += G(p[0], p[1], p[3], 1, '<path d="M0 0 L ' + p[2] + ' -1.5 A' + p[2] + ' ' + p[2] + ' 0 1 1 ' + p[2] + ' 1.5 Z" fill="#3e7a3a" stroke="' + O + '" stroke-width=".9"/>' + L('M0 0 L ' + f(-p[2] * .6) + ' ' + f(-p[2] * .3), '#2a5a2a', .6)); });
    b += G(808, 430, 0, 1, '<circle r="2.6" fill="#f3f0ff" stroke="' + O + '" stroke-width=".7"/><circle r="1" fill="#ffd36a"/>');
    b += L('M694 424 l-3 -8 M698 424 l1 -9 M702 425 l4 -7', '#5a7a3a', 1.2) + L('M824 472 l3 -8 M828 474 l-1 -9', '#5a7a3a', 1.2);
    l.push([760, 448, 70, '#2a8a7a', .5]);
    break;
  case 'porte':
    b += G(905, 410, 0, 1, '<circle r="23" fill="#000" opacity=".5" transform="translate(2 3)"/><circle r="23" fill="' + grad('#6a6080') + '" stroke="' + O + '" stroke-width="1.6"/><circle r="18" fill="none" stroke="#3a3248" stroke-width="1"/>' + L('M-18 0 H18 M0 -18 V18', '#3a3248', .8));
    var sg = '<g transform="translate(895 401)">' + L('M-4 0 Q 0 -3.5 4 0 Q 0 3.5 -4 0 Z', '#bff9ff', 1) + C(0, 0, 1.1, '#bff9ff') + '</g>' +
      '<g transform="translate(915 401)">' + L('M-4 -1.5 H4 Q 4 4 0 4 Q -4 4 -4 -1.5 Z M-2 -3 q1 -1.5 0 -3 M1.5 -3 q1 -1.5 0 -3', '#bff9ff', 1) + '</g>' +
      '<g transform="translate(895 420)">' + L('M-3.5 -4 Q -4.5 3 0 4 Q 4.5 3 3.5 -4 M-1.2 -2 V3 M1.2 -2 V3', '#bff9ff', 1) + '</g>' +
      '<g transform="translate(915 420)">' + L('M0 -4.5 L 1.3 -1.4 L 4.4 -1.4 L 1.9 .6 L 2.8 3.8 L 0 1.9 L -2.8 3.8 L -1.9 .6 L -4.4 -1.4 L -1.3 -1.4 Z', '#bff9ff', .9) + '</g>';
    e += '<g filter="' + flou(1.5) + '" opacity=".7">' + sg + '</g>' + sg;
    b += G(906, 440, 0, 1, '<ellipse cx="1" cy="1.5" rx="5" ry="6.5" fill="#000" opacity=".4"/><ellipse rx="4.4" ry="6" fill="' + grad('#8a8a96') + '" stroke="' + O + '" stroke-width=".9"/><circle cy="-6" r="3.3" fill="' + grad('#9a9aa6') + '" stroke="' + O + '" stroke-width=".9"/><path d="M-2.6 -8 L -2 -10.6 L -.6 -8.6 M2.6 -8 L 2 -10.6 L .6 -8.6" fill="#9a9aa6" stroke="' + O + '" stroke-width=".7"/>' + L('M0 6 Q 5 9 7 5', '#8a8a96', 1.6) + L('M-1.6 -10 l-1.5 -2 M1.6 -10 l1.5 -2', '#c8c8d0', .6));
    l.push([905, 410, 44, '#5fe8ff', .7]);
    break;
  case 'derniere':
    add(bougie(920, 312));
    b += G(892, 330, 10, 1, '<rect x="-12" y="-7" width="24" height="14" rx="5" fill="#8a7a4a" stroke="' + O + '" stroke-width="1"/>');
    break;
  case 'dalles':
    break;
  }
  return {b:b, e:e, l:l};
}

/* ================= les héros : le pion d'équipe ================= */
var ROLES = {pisteur:['#3b8f5a', '#6fd08e'], alchimiste:['#6a3fb0', '#b48cf0'], sage:['#2f55b0', '#7fa8ff']};
function silhouette(role, x, y, a){   /* vue du dessus, tournée vers le haut (-y) avant rotation */
  var c = ROLES[role][0], cl = ROLES[role][1], s = '';
  s += '<ellipse cx="1.5" cy="4" rx="10" ry="9" fill="#000" opacity=".6" filter="' + flou(1.6) + '"/>';
  /* ce qui dépasse sous la cape */
  if(role === 'pisteur') s += L('M-6 -11 Q -13.5 -6 -11 3', O, 3.8) + L('M-6 -11 Q -13.5 -6 -11 3', '#c08a44', 2.1) + L('M-6 -11 L -11 3', '#f3e7cb', .6);
  if(role === 'sage') s += L('M7.5 -13 L 8.5 6', O, 3.4) + L('M7.5 -13 L 8.5 6', '#9a7a4a', 1.8);
  /* la cape, en cloche, plus large derrière */
  s += '<path d="M-6.5 -5 C -9.5 -2 -11 6 -9.5 10.5 C -6 13.5 6 13.5 9.5 10.5 C 11 6 9.5 -2 6.5 -5 C 3.5 -7.5 -3.5 -7.5 -6.5 -5 Z" fill="' + grad(c) + '" stroke="' + O + '" stroke-width="1.7" stroke-linejoin="round"/>';
  s += L('M-4.5 1 Q -5.5 7 -4.5 11.6 M4.5 1 Q 5.5 7 4.5 11.6', sombre(c, .5), 1);
  if(role === 'pisteur') s += '<rect x="2.6" y="1" width="3.6" height="9" rx="1" fill="#7a4a28" stroke="' + O + '" stroke-width=".9" transform="rotate(16 4.4 5.5)"/>' + C(3.6, 1.2, 1.1, '#e04a3a') + C(5.8, 1.8, 1.1, '#f3e7cb');
  /* les mains, devant */
  s += C(-5.4, -7.2, 1.9, '#e0a878', ' stroke="' + O + '" stroke-width="1"') + C(5.4, -7.2, 1.9, '#e0a878', ' stroke="' + O + '" stroke-width="1"');
  /* la capuche, et sa pointe qui pend dans le dos */
  s += '<path d="M-3.2 -1 L 0 6.5 L 3.2 -1 Z" fill="' + sombre(c, .15) + '" stroke="' + O + '" stroke-width="1.2" stroke-linejoin="round"/>';
  s += '<circle cx="0" cy="-3" r="5.8" fill="' + grad(cl, .8) + '" stroke="' + O + '" stroke-width="1.7"/>';
  s += '<path d="M-3.8 -7.4 Q 0 -9.6 3.8 -7.4 Q 0 -6.2 -3.8 -7.4 Z" fill="' + sombre(c, .65) + '"/>';
  s += C(1.6, -4.6, 1.7, '#fff', ' opacity=".4"');
  if(role === 'alchimiste') s += lum(5.6, -10.5, 9, '#ff8a2a', .95) + C(5.6, -10.5, 2.8, '#ff7a2a', ' stroke="' + O + '" stroke-width="1"') + C(5, -11.2, 1, '#ffe0a0');
  if(role === 'sage') s += lum(7.5, -14, 10, '#9ff4ff', 1) + C(7.5, -14, 2.4, '#e8fdff', ' stroke="#2a6a8a" stroke-width=".7"');
  return G(x, y, a, 1, s);
}
function pion(x, y, dir){   /* dir : où regardent les héros (degrés, 0 = est) */
  var s = '';
  /* la flaque de lumière : la rune du Sage */
  s += '<circle cx="' + x + '" cy="' + y + '" r="58" fill="' + halo('#bff6ff') + '" opacity=".5" style="mix-blend-mode:screen"/>';
  s += '<circle cx="' + x + '" cy="' + y + '" r="28" fill="' + halo('#f0feff') + '" opacity=".5" style="mix-blend-mode:screen"/>';
  var rt = ''; for(var k = 0; k < 12; k++){ var a = k / 12 * 6.283; rt += L('M' + f(Math.cos(a) * 22) + ' ' + f(Math.sin(a) * 22) + ' L' + f(Math.cos(a) * 25) + ' ' + f(Math.sin(a) * 25), '#dffcff', 1); }
  s += G(x, y, 0, 1, '<circle r="24" fill="#7fe8ff" opacity=".14"/><circle r="24" fill="none" stroke="#9ff4ff" stroke-width="3.5" opacity=".4" filter="' + flou(2) + '"/><circle r="24" fill="none" stroke="#e8fdff" stroke-width=".9" opacity=".9"/>' + rt);
  /* l'anneau doré qui pulse */
  s += G(x, y, 0, 1, '<circle r="29" fill="none" stroke="#ffb040" stroke-width="7" opacity=".5" filter="' + flou(3) + '"/>' +
    '<circle r="29" fill="none" stroke="' + O + '" stroke-width="5"/><circle r="29" fill="none" stroke="#ffd36a" stroke-width="3"/>' +
    '<circle r="29" fill="none" stroke="#fff4c0" stroke-width="1" stroke-dasharray="9 12" opacity=".9"/>' +
    '<circle r="35" fill="none" stroke="#ffd36a" stroke-width="1.6" opacity=".5"/><circle r="41" fill="none" stroke="#ffd36a" stroke-width="1" opacity=".22"/>');
  /* les trois héros, en triangle, face à la direction */
  var r = dir * Math.PI / 180, cs = Math.cos(r), sn = Math.sin(r);
  function rot(px, py){ return [x + px * cs - py * sn, y + px * sn + py * cs]; }
  var pos = {pisteur:rot(11, 0), alchimiste:rot(-7, -10.5), sage:rot(-7, 10.5)};
  ['alchimiste', 'sage', 'pisteur'].forEach(function(k){ s += silhouette(k, pos[k][0], pos[k][1], dir + 90); });
  return s;
}

/* ================= les étiquettes (pastilles crème, comme au village) ================= */
function etiquette(x, y, ic, t, o){
  o = o || {};
  var tl = o.taille || 12.5, lignes = t.split('\n'), lt = Math.max.apply(null, lignes.map(function(z){ return largeur(z, tl); }));
  var lw = lt + (ic ? tl * 1.45 : 0) + 18, h = tl * 1.2 * lignes.length + 8, rx = Math.min(h / 2, 12);
  var s = '<g' + (o.op ? ' opacity="' + o.op + '"' : '') + '><rect x="' + f(x - lw / 2) + '" y="' + f(y - h / 2 + 2) + '" width="' + f(lw) + '" height="' + f(h) + '" rx="' + rx + '" fill="#000" opacity=".45"/>' +
    '<rect x="' + f(x - lw / 2) + '" y="' + f(y - h / 2) + '" width="' + f(lw) + '" height="' + f(h) + '" rx="' + rx + '" fill="' + (o.fond || '#f6ead0') + '" stroke="' + O + '" stroke-width="2"/>';
  var tx = x - lw / 2 + 9;
  if(ic){ s += '<text x="' + f(tx + tl * .6) + '" y="' + f(y + .8) + '" font-size="' + f(tl * .95) + '" text-anchor="middle" dominant-baseline="central">' + ic + '</text>'; tx += tl * 1.45; }
  lignes.forEach(function(z, k){ s += '<text x="' + f(tx) + '" y="' + f(y + .8 + (k - (lignes.length - 1) / 2) * tl * 1.2) + '" font-size="' + tl + '" font-weight="700" text-anchor="start" dominant-baseline="central" fill="' + (o.encre || '#35281b') + '" style="font-family:Andika, Inter, sans-serif">' + z + '</text>'; });
  return s + '</g>';
}


/* ================= les filtres ================= */
function filtres(){
  var RZ = 'filterUnits="userSpaceOnUse" x="' + (Z.x - 150) + '" y="' + (Z.y - 150) + '" width="' + (Z.w + 300) + '" height="' + (Z.h + 300) + '" color-interpolation-filters="sRGB"';
  DEFS.l.push('<filter id="grainMur" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 .9"/></filter>');
  DEFS.l.push('<filter id="grainSol" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".05 .07" numOctaves="3" seed="12"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.25"/></filter>');
  DEFS.l.push('<filter id="roche" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="5" seed="4"/>' +
    '<feColorMatrix values=".22 0 0 0 .01  .18 0 0 0 .005  .3 0 0 0 .02  0 0 0 0 1"/></filter>');
  /* la brume de Brumeval. 1) la densité : la carte (blanc = brume, noir = découvert) devient un masque aux bords qui ondulent */
  DEFS.l.push('<filter id="densite" ' + RZ + '>' +
    '<feTurbulence type="fractalNoise" baseFrequency=".005 .0075" numOctaves="2" seed="7" result="w"/>' +
    '<feDisplacementMap in="SourceGraphic" in2="w" scale="42" xChannelSelector="R" yChannelSelector="G" result="dw"/>' +
    '<feGaussianBlur in="dw" stdDeviation="8" result="d"/>' +
    '<feTurbulence type="fractalNoise" baseFrequency=".02 .028" numOctaves="4" seed="9" result="n0"/>' +
    '<feDisplacementMap in="n0" in2="w" scale="60" xChannelSelector="B" yChannelSelector="R" result="n"/>' +
    '<feColorMatrix in="d" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="da"/>' +
    '<feColorMatrix in="n" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="na"/>' +
    '<feComposite in="da" in2="na" operator="arithmetic" k1="0" k2="2" k3="1.1" k4="-1.05" result="a"/>' +
    '<feFlood flood-color="#fff" result="blanc"/><feComposite in="blanc" in2="a" operator="in"/></filter>');
  /* 2) le corps de la brume : un nuage doux, gris-violet, avec des bancs plus clairs */
  DEFS.l.push('<filter id="nuage" ' + RZ + '>' +
    '<feTurbulence type="fractalNoise" baseFrequency=".004 .006" numOctaves="2" seed="7" result="w"/>' +
    '<feTurbulence type="fractalNoise" baseFrequency=".006 .009" numOctaves="5" seed="21" result="c0"/>' +
    '<feDisplacementMap in="c0" in2="w" scale="70" xChannelSelector="G" yChannelSelector="B" result="c1"/>' +
    '<feColorMatrix in="c1" values=".62 0 0 0 -.06  .58 0 0 0 -.07  .74 0 0 0 -.04  0 0 0 0 1" result="col"/>' +
    '<feTurbulence type="fractalNoise" baseFrequency=".0028 .0045" numOctaves="3" seed="33" result="p0"/>' +
    '<feDisplacementMap in="p0" in2="w" scale="90" xChannelSelector="R" yChannelSelector="G" result="p1"/>' +
    '<feColorMatrix in="p1" values="0 0 0 0 .56  0 0 0 0 .52  0 0 0 0 .7  3 0 0 0 -1.45" result="banc"/>' +
    '<feGaussianBlur in="banc" stdDeviation="6" result="banc2"/>' +
    '<feComposite in="banc2" in2="col" operator="over"/></filter>');
}

/* les volutes de la brume : des enroulements dessinés, doux, sur toute la carte */
function volutes(seed){
  var R = rng(seed), clairs = '', ombres = '', fins = '';
  for(var i = 0; i < 230; i++){
    var x0 = -80 + R() * (WW + 160), y0 = -20 + R() * (WH + 40), L0 = 90 + R() * 170, sens = R() < .5 ? 1 : -1, r0 = 11 + R() * 20, amp = 6 + R() * 16, ph = R() * 6.28, pente = (R() - .5) * .35;
    var w = 7 + R() * 12, o = .07 + R() * .09;
    if(x0 + L0 + 60 < Z.x - 60 || x0 > Z.x + Z.w + 60 || y0 < Z.y - 120 || y0 > Z.y + Z.h + 120) continue;
    var pts = [];
    for(var k = 0; k <= 12; k++){ var t = k / 12; pts.push([x0 + L0 * t, y0 + L0 * t * pente + Math.sin(ph + t * 3) * amp]); }
    var fin = pts[12], a0 = Math.atan2(pts[12][1] - pts[11][1], pts[12][0] - pts[11][0]) - sens * Math.PI / 2, cx = fin[0] - Math.cos(a0) * r0, cy = fin[1] - Math.sin(a0) * r0;
    for(var k2 = 1; k2 <= 18; k2++){ var u = k2 / 18, a = a0 + sens * u * Math.PI * 1.65, rr2 = r0 * (1 - u * .55); pts.push([cx + Math.cos(a) * rr2, cy + Math.sin(a) * rr2]); }
    var d = lisse(pts);
    ombres += '<path d="' + d + '" fill="none" stroke="#08050e" stroke-width="' + f(w + 6) + '" stroke-linecap="round" opacity="' + f(o * 1.8) + '" transform="translate(2 ' + f(w * .55) + ')"/>';
    clairs += '<path d="' + d + '" fill="none" stroke="#9c94c0" stroke-width="' + f(w) + '" stroke-linecap="round" opacity="' + f(o) + '"/>';
    fins += '<path d="' + d + '" fill="none" stroke="#d6d0f0" stroke-width="1.1" stroke-linecap="round" opacity="' + f(o * 1.1) + '" transform="translate(0 ' + f(-w * .38) + ')"/>';
  }
  return '<g filter="' + flou(6) + '">' + ombres + '</g><g filter="' + flou(3.5) + '">' + clairs + '</g><g filter="' + flou(.8) + '">' + fins + '</g>';
}

/* ================= la petite main qui glisse (on peut faire glisser la carte) ================= */
function roseEcran(x, y){   /* même dessin que la rose du plan du Sage ; le nord est en haut, comme sur le plan */
  var ENC = '#3b2414', ROU = '#8e2e1c', s = '<circle r="28" fill="#000" opacity=".45" transform="translate(1 2)"/><circle r="28" fill="#e2cc9c" stroke="' + O + '" stroke-width="2.5"/><circle r="24.5" fill="none" stroke="#7a5a36" stroke-width=".8"/>';
  for(var k = 0; k < 32; k++){ var a = k / 32 * 6.283; s += L('M' + f(Math.cos(a) * 21.5) + ' ' + f(Math.sin(a) * 21.5) + ' L' + f(Math.cos(a) * (k % 4 ? 23 : 24.5)) + ' ' + f(Math.sin(a) * (k % 4 ? 23 : 24.5)), ENC, .6); }
  for(var k2 = 7; k2 >= 0; k2--){
    var a2 = k2 / 8 * 6.283 - Math.PI / 2, lg = k2 % 2 ? 9 : (k2 === 0 ? 8 : 17), la = k2 % 2 ? 1.6 : 2.7;
    var px = Math.cos(a2) * lg, py = Math.sin(a2) * lg + 4, gx = Math.cos(a2 - Math.PI / 2) * la, gy = Math.sin(a2 - Math.PI / 2) * la + 4, dx = Math.cos(a2 + Math.PI / 2) * la, dy = Math.sin(a2 + Math.PI / 2) * la + 4;
    s += '<path d="M0 4 L' + f(gx) + ' ' + f(gy) + ' L' + f(px) + ' ' + f(py) + ' Z" fill="' + (k2 === 0 ? ROU : ENC) + '"/><path d="M0 4 L' + f(dx) + ' ' + f(dy) + ' L' + f(px) + ' ' + f(py) + ' Z" fill="#f2e4c0" stroke="' + ENC + '" stroke-width=".6"/>';
  }
  s += C(0, 4, 1.6, ENC) + '<text x="0" y="-12.5" text-anchor="middle" dominant-baseline="central" font-size="15" font-weight="700" style="font-family:Lora, Georgia, serif;paint-order:stroke" stroke="#e2cc9c" stroke-width="2.6" fill="' + ROU + '">N</text>';
  return G(x, y, 0, 1, s);
}
function mainGlisse(x, y){
  var fl = 'M-22 -20 H22 M-16 -25 L -22 -20 L -16 -15 M16 -25 L 22 -20 L 16 -15';
  return G(x, y, 0, 1, '<circle r="31" fill="#0c0812" opacity=".6"/>' +
    L(fl, O, 4.4) + L(fl, '#f3e7cb', 2.2) +
    C(-15, -1, 4, '#f3e7cb', ' opacity=".18"') + C(-8, -1, 4.5, '#f3e7cb', ' opacity=".3"') +
    G(3, 9, -8, .92, '<path d="M-3 -14 C -3 -17 2 -17 2 -14 L 2 -4 C 2 -6 7 -6 7 -3 L 7 -2 C 7 -4 11 -4 11 -1 L 11 0 C 11 -2 15 -2 15 1 L 15 9 C 15 15 11 19 5 19 L 1 19 C -4 19 -6 16 -9 12 L -13 5 C -15 2 -11 0 -9 2 L -3 7 Z" fill="#f3e7cb" stroke="' + O + '" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M2 -3 V6 M7 -2 V6 M11 0 V7" stroke="#b8a888" stroke-width="1.1" fill="none" stroke-linecap="round"/>'));
}

/* ================= les vues ================= */
var PV = {pisteur:120, alchimiste:100, sage:90};
var ETATS = {
  debut:{
    ecran:[720, 480], vu:['puits'], couloirs:{cE:.48, cO:.6, cN:.52}, heros:[1200, 752, 0],
    sorties:[['cE', .42], ['cO', .52], ['cN', .45]], main:true,
    bulle:{t:'Trois passages s’enfoncent dans la brume… Par où aller ?', x:372, w:380},
    pv:{pisteur:120, alchimiste:100, sage:90}
  },
  impasse:{
    ecran:[690, 480], vu:['puits', 'galerie'], couloirs:{cE:.48, cN:.52, cO:1}, heros:[1046, 752, 180],
    sorties:[['cE', .42], ['cN', .45]],
    bulle:{t:'Des éboulis, rien que des éboulis… Le Sage avait peut-être une idée ?', x:360, w:400},
    pv:{pisteur:120, alchimiste:100, sage:90}
  },
  milieu:{
    ecran:[1000, 505], vu:['puits', 'galerie', 'rats', 'reserve', 'canaux', 'cave'], J:true,
    couloirs:{cE:1, cO:1, cN:.52, c2:1, c3:1, c5:1, c6:1, c4:.3, egouts:[[0, .1], [.9, 1]], pLune:[[.9, 1]], dalles:.46, c8:.5}, heros:[1793, 925, 0],
    sorties:[['cN', .45], ['c4', .25], ['pLune', .915, 1], ['dalles', .42], ['c8', .45]],
    bulle:{t:'Encore trois passages dans la brume… Le Sage sait peut-être lequel prendre.', x:560, w:384}, etiq:{galerie:[1093, 806]},
    pv:{pisteur:84, alchimiste:71, sage:58}
  },
  tout:{ tout:true, vu:ORDRE.slice(), J:true, couloirs:{} }
};
COULOIRS.forEach(function(c){ ETATS.tout.couloirs[c.id] = 1; });
/* où poser les étiquettes */
var ETIQ = {
  puits:[1200, 834], galerie:[1000, 706], aeration:[1200, 498], rats:[1492, 822], reserve:[1330, 612], canaux:[1232, 905], givre:[1000, 1090],
  cave:[1700, 1014], dalles:[1955, 862], egouts:[1440, 1252], eboule:[1835, 1160], atelier:[2008, 784], biblio:[1920, 494], portes:[2262, 778],
  crypte:[2300, 638], ossuaire:[2262, 905], feu:[2010, 1030], bassin:[2100, 1334], porte:[2290, 1336], derniere:[2290, 1008]
};

function vue(nom){
  uid = 0; DEFS = {l:[], cache:{}};
  var E = ETATS[nom], etat = {};
  var VB = E.tout ? [742, 424, 1690, 950.6] : [E.ecran[0], E.ecran[1], W, H];
  Z = {x:Math.round(VB[0] - 40), y:Math.round(VB[1] - 40), w:Math.round(VB[2] + 80), h:Math.round(VB[3] + 80)};
  ORDRE.forEach(function(k){ etat[k] = E.vu.indexOf(k) >= 0 ? 'vu' : 'inconnu'; });
  patterns(); filtres();
  var corps = '';
  corps += '<rect x="' + Z.x + '" y="' + Z.y + '" width="' + Z.w + '" height="' + Z.h + '" fill="#100b16"/><rect x="' + Z.x + '" y="' + Z.y + '" width="' + Z.w + '" height="' + Z.h + '" filter="url(#roche)"/>';
  corps += structure();
  var base = '', emis = '', lumieres = [];
  ORDRE.forEach(function(k){ var d = deco(k, etat[k]); base += d.b; if(etat[k] === 'vu'){ emis += d.e; lumieres = lumieres.concat(d.l); } });
  base += decoVieux();
  corps += base;
  /* la lumière : ambiance sombre, salles visitées éclairées doucement, et les sources */
  var lm = '<rect x="' + Z.x + '" y="' + Z.y + '" width="' + Z.w + '" height="' + Z.h + '" fill="' + (E.tout ? '#3e3858' : '#2a2440') + '"/>';
  E.vu.forEach(function(k){ var r = SALLES[k]; if(!r.couloir) lm += '<path d="' + r.d + '" fill="#6e6698" filter="' + flou(10) + '" style="mix-blend-mode:screen" opacity=".9"/>'; });
  COULOIRS.forEach(function(c){ var t = E.couloirs[c.id]; if(t) morceaux(t).forEach(function(m){ lm += '<path d="' + lisse(troncon(c.pts, m[0], m[1])) + '" fill="none" stroke="#5e5688" stroke-width="30" stroke-linecap="round" filter="' + flou(8) + '" style="mix-blend-mode:screen"/>'; }); });
  lumieres.forEach(function(q){ lm += '<circle cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" r="' + f(q[2]) + '" fill="' + halo(q[3]) + '" opacity="' + q[4] + '" style="mix-blend-mode:screen"/>'; });
  if(E.heros) lm += '<circle cx="' + E.heros[0] + '" cy="' + E.heros[1] + '" r="96" fill="' + halo('#c8f6ff') + '" style="mix-blend-mode:screen"/>';
  corps += '<g style="mix-blend-mode:multiply">' + lm + '</g>';
  corps += '<g>' + emis + '</g>';
  var glow = '';
  lumieres.forEach(function(q){ glow += '<circle cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" r="' + f(q[2] * .7) + '" fill="' + halo(q[3]) + '" opacity="' + f(q[4] * .22) + '"/>'; });
  corps += '<g style="mix-blend-mode:screen">' + glow + '</g>';
  /* la brume, partout jusqu'aux bords ; seules les parties découvertes s'ouvrent */
  if(!E.tout){
    var dm = '<rect x="' + (Z.x - 160) + '" y="' + (Z.y - 160) + '" width="' + (Z.w + 320) + '" height="' + (Z.h + 320) + '" fill="#fff"/>';
    E.vu.forEach(function(k){ var r = SALLES[k]; dm += '<path d="' + r.d + '" fill="#000" stroke="#000" stroke-width="' + (2 * M + 34) + '" stroke-linejoin="round"/>'; });
    COULOIRS.forEach(function(c){ var t = E.couloirs[c.id]; if(t) morceaux(t).forEach(function(m){ dm += '<path d="' + lisse(troncon(c.pts, m[0], m[1])) + '" fill="none" stroke="#000" stroke-width="' + ((c.l || SOL) + 2 * M + 26) + '" stroke-linecap="' + (m[1] - m[0] >= 1 ? 'round' : 'butt') + '" stroke-linejoin="round"/>'; }); });
    if(E.J) dm += '<circle cx="' + J.x + '" cy="' + J.y + '" r="' + (J.r + M + 18) + '" fill="#000"/>';
    DEFS.l.push('<mask id="mBrume" maskUnits="userSpaceOnUse" x="' + (Z.x - 160) + '" y="' + (Z.y - 160) + '" width="' + (Z.w + 320) + '" height="' + (Z.h + 320) + '"><g filter="url(#densite)">' + dm + '</g></mask>');
    corps += '<g mask="url(#mBrume)"><rect x="' + (Z.x - 150) + '" y="' + (Z.y - 150) + '" width="' + (Z.w + 300) + '" height="' + (Z.h + 300) + '" filter="url(#nuage)"/>' + volutes(7) + '</g>';
    var bl = '';
    lumieres.forEach(function(q){ bl += '<circle cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" r="' + f(q[2] * 1.7) + '" fill="' + halo(q[3]) + '" opacity="' + f(q[4] * .16) + '"/>'; });
    bl += '<circle cx="' + E.heros[0] + '" cy="' + E.heros[1] + '" r="170" fill="' + halo('#9ff0ff') + '" opacity=".22"/>';
    corps += '<g style="mix-blend-mode:screen">' + bl + '</g>';
  }
  /* les étiquettes, les sorties, les héros */
  var et = '', tl = E.tout ? 16 : 12.5;
  ORDRE.forEach(function(k){ var r = SALLES[k], p = (E.etiq && E.etiq[k]) || ETIQ[k]; if(etat[k] === 'vu' && p) et += etiquette(p[0], p[1], r.ic, k === 'porte' ? 'La porte aux\nquatre signes' : r.nom, {taille:tl}); });
  var so = ''; (E.sorties || []).forEach(function(q){ var c = COULOIRS.filter(function(x){ return x.id === q[0]; })[0]; so += sortie(c, q[1], q[2]); });
  corps += so + et;
  if(E.heros) corps += pion(E.heros[0], E.heros[1], E.heros[2]);
  /* ce qui est fixé à l'écran : le bord qui s'assombrit, la petite main */
  DEFS.l.push('<radialGradient id="vig" cx="480" cy="290" r="640" gradientUnits="userSpaceOnUse"><stop offset=".5" stop-color="#05030a" stop-opacity="0"/><stop offset=".85" stop-color="#05030a" stop-opacity=".55"/><stop offset="1" stop-color="#05030a" stop-opacity=".85"/></radialGradient>');
  DEFS.l.push('<linearGradient id="vigH" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05030a" stop-opacity=".75"/><stop offset=".1" stop-color="#05030a" stop-opacity="0"/><stop offset=".88" stop-color="#05030a" stop-opacity="0"/><stop offset="1" stop-color="#05030a" stop-opacity=".7"/></linearGradient>');
  var ecran = '<rect width="' + W + '" height="' + H + '" fill="url(#vig)"/><rect width="' + W + '" height="' + H + '" fill="url(#vigH)"/>';
  if(E.main) ecran += mainGlisse(900, 418);
  ecran += E.tout ? roseEcran(48, 48) : roseEcran(48, 86);
  corps += '<g transform="translate(' + VB[0] + ' ' + VB[1] + ') scale(' + f(VB[2] / W * 1000) / 1000 + ')">' + ecran + '</g>';
  var svg = '<svg viewBox="' + VB.join(' ') + '" width="' + W + '" height="' + H + '" style="position:absolute;inset:0;display:block"><defs>' + DEFS.l.join('') + '</defs>' + corps + '</svg>';
  return CSS + '<div class="ex">' + svg + (E.tout ? '<div class="ex-a" style="left:16px;bottom:10px"><span class="ex-titre">Tout le donjon</span> <span class="ex-sous">· sans la brume (contrôle)</span></div>' : hud(E)) + '</div>';
}

/* ================= l'interface, légère ================= */
var CSS = '<style>' +
  '.ex{position:relative;width:960px;height:540px;overflow:hidden;background:#0b0810;font-family:Andika, Inter, sans-serif;color:#f3e7cb}' +
  '.ex *{box-sizing:border-box}.ex-a{position:absolute}' +
  '.ex-titre{font-family:Macondo, Lora, Georgia, serif;font-size:21px;color:#ffe3a3;text-shadow:0 2px 0 #24182e,0 0 14px rgba(255,190,90,.25)}' +
  '.ex-sous{font-size:13px;opacity:.75}' +
  '.ex-bulle{display:flex;align-items:center;gap:10px;padding:6px 7px 6px 14px;border-radius:14px;background:rgba(243,231,203,.95);color:#35281b;border:3px solid #24182e;box-shadow:0 4px 0 rgba(0,0,0,.45),0 8px 24px rgba(0,0,0,.4);font-weight:700;font-size:14px;line-height:1.25}' +
  '.ex-lire{display:inline-grid;place-items:center;width:30px;height:30px;border-radius:50%;background:rgba(36,24,46,.12);font-size:15px;flex:none}' +
  '.ex-bas{left:12px;bottom:8px;height:46px;padding:0 12px 0 6px;border-radius:23px;background:rgba(12,8,18,.78);border:1.5px solid rgba(201,163,90,.35);display:flex;align-items:center;gap:14px;box-shadow:0 6px 18px rgba(0,0,0,.5)}' +
  '.ex-h{display:flex;align-items:center;gap:6px}' +
  '.ex-por{width:36px;height:36px;border-radius:50%;overflow:hidden;border:2.5px solid;box-shadow:0 0 0 2px #24182e;background:#2a2036;flex:none}' +
  '.ex-por svg{width:100%!important;height:100%!important}' +
  '.ex-pv{position:relative;width:58px;height:15px;border-radius:8px;background:#2a1420;border:1.5px solid #24182e;overflow:hidden}' +
  '.ex-pv i{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(#ff7a7a,#c0303e)}' +
  '.ex-pv b{position:absolute;inset:0;text-align:center;font-size:10.5px;line-height:13px;color:#fff;text-shadow:0 1px 0 #24182e,0 0 3px #24182e}' +
  '.ex-sac{display:flex;align-items:center;gap:3px;padding-left:12px;border-left:1.5px solid rgba(201,163,90,.3);height:30px}' +
  '.ex-sac span{font-size:11px;opacity:.7;margin-right:3px}' +
  '.ex-f{width:17px;height:22px}.ex-f.vide{opacity:.25;filter:grayscale(1)}' +
  '</style>';
function hud(E){
  var s = '<div class="ex-a" style="left:16px;top:10px"><span class="ex-titre">Sous le puits</span> <span class="ex-sous">· le chemin long</span></div>' +
    '<div class="ex-a" style="right:16px;top:13px;font-size:13px;opacity:.85">🗺️ Le plan : chez le Sage</div>';
  if(E.bulle) s += '<div class="ex-a" style="left:' + E.bulle.x + 'px;top:42px;width:' + E.bulle.w + 'px"><div class="ex-bulle">' + E.bulle.t + '<span class="ex-lire">🔊</span></div></div>';
  var por = window.HEROS || {};
  s += '<div class="ex-a ex-bas">';
  ['pisteur', 'alchimiste', 'sage'].forEach(function(r){
    var pv = [E.pv[r], PV[r]];
    s += '<div class="ex-h"><div class="ex-por" style="border-color:' + ROLES[r][1] + '">' + (por[r] || '') + '</div>' +
      '<div class="ex-pv"><i style="width:' + (pv[0] / pv[1] * 100) + '%"></i><b>' + pv[0] + '/' + pv[1] + '</b></div></div>';
  });
  var fc = ['#ff6a2a', '#9aa8c8', '#6fdc5a'];
  s += '<div class="ex-sac"><span>🎒</span>' + fc.map(function(c, k){ return '<div class="ex-f">' + fiole(c) + '</div>'; }).join('') + '</div>';
  return s + '</div>';
}
function fiole(c){
  return '<svg viewBox="0 0 40 48" style="width:100%;height:100%;display:block;overflow:visible">' +
    '<circle cx="20" cy="30" r="19" fill="' + c + '" opacity=".28"/>' +
    '<path d="M15 6 L 25 6 L 25 14 C 34 18 36 34 28 42 C 24 46 16 46 12 42 C 4 34 6 18 15 14 Z" fill="' + c + '" stroke="' + O + '" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M13 2 L 27 2 L 27 8 L 13 8 Z" fill="#8a5a32" stroke="' + O + '" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M10 28 C 14 26 26 26 30 28 C 31 36 26 42 20 42 C 14 42 9 36 10 28 Z" fill="rgba(0,0,0,.2)"/>' +
    '<path d="M14 22 Q 15 18 19 17" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".8"/></svg>';
}

window.EXPLO = {vue:vue, CSS:CSS, DEFS:function(){ return DEFS; }, SIGNES:SIGNES, ROUGE:0, util:{troncon:troncon, lisse:lisse, rr:rr, cercle:cercle, blob:blob, poly:poly, echant:echant, dedans:dedans, bout:bout, pointA:pointA, largeur:largeur, rng:rng, mix:mix, clair:clair, sombre:sombre, f:f, G:G, L:L, C:C, F:F, P:P}, M:M, SOL:SOL, ETIQ:ETIQ, ROLES:ROLES};
})();
