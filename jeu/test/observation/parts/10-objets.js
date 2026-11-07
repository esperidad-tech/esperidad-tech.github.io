
/* ==========================================================
   LES OBJETS DES DÉCORS (style jouet : contour épais, ombre propre, reflet)
   Chaque objet est dessiné autour de son point de base (0,0) :
   posé  → il monte vers y négatif ; suspendu (pend) → il descend vers y positif.
   o = {c couleur, d détail oui/non, n nombre, v variante, m retourné}
   ========================================================== */
function sw0(sw){ return sw === undefined ? 2.4 : sw; }
function Pa(d, f, sw, x){ return '<path d="' + d + '" fill="' + f + '"' + (sw0(sw) ? ' stroke="' + K + '" stroke-width="' + sw0(sw) + '" stroke-linejoin="round" stroke-linecap="round"' : '') + (x || '') + '/>'; }
function Re(x, y, w, h, rx, f, sw, xx){ return '<rect x="' + f1(x) + '" y="' + f1(y) + '" width="' + f1(w) + '" height="' + f1(h) + '" rx="' + (rx || 0) + '" fill="' + f + '"' + (sw0(sw) ? ' stroke="' + K + '" stroke-width="' + sw0(sw) + '"' : '') + (xx || '') + '/>'; }
function Ci(cx, cy, r, f, sw, xx){ return '<circle cx="' + f1(cx) + '" cy="' + f1(cy) + '" r="' + f1(r) + '" fill="' + f + '"' + (sw0(sw) ? ' stroke="' + K + '" stroke-width="' + sw0(sw) + '"' : '') + (xx || '') + '/>'; }
function El(cx, cy, rx, ry, f, sw, xx){ return '<ellipse cx="' + f1(cx) + '" cy="' + f1(cy) + '" rx="' + f1(rx) + '" ry="' + f1(ry) + '" fill="' + f + '"' + (sw0(sw) ? ' stroke="' + K + '" stroke-width="' + sw0(sw) + '"' : '') + (xx || '') + '/>'; }
function Tr(d, c, w, op){ return '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"' + (op !== undefined ? ' opacity="' + op + '"' : '') + '/>'; }
function Om(d, op){ return '<path d="' + d + '" fill="#160c22" opacity="' + (op || 0.2) + '"/>'; }
function Br(d, w, op){ return Tr(d, '#fff', w || 2.2, op || 0.55); }
function Halo(cx, cy, rx, ry, c, op){ return '<ellipse cx="' + f1(cx) + '" cy="' + f1(cy) + '" rx="' + f1(rx) + '" ry="' + f1(ry) + '" fill="' + c + '" opacity="' + (op || 0.2) + '"/>'; }
function etincelle(x, y, r, c){ var a = r * 0.28; return '<path d="M' + f1(x) + ',' + f1(y - r) + ' L' + f1(x + a) + ',' + f1(y - a) + ' L' + f1(x + r) + ',' + f1(y) + ' L' + f1(x + a) + ',' + f1(y + a) + ' L' + f1(x) + ',' + f1(y + r) + ' L' + f1(x - a) + ',' + f1(y + a) + ' L' + f1(x - r) + ',' + f1(y) + ' L' + f1(x - a) + ',' + f1(y - a) + ' Z" fill="' + (c || '#fff') + '"/>'; }
function fleur(x, y, r, c, coeur){
  var s = '';
  for(var k = 0; k < 5; k++){ var a = k * 1.2566 - 1.5708; s += Ci(x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62, r * 0.52, c, 1.3); }
  return s + Ci(x, y, r * 0.36, coeur || '#f6d23a', 1.2);
}
var VERRE = 'rgba(214,236,255,.30)';
var VIF = ['#e5484d', '#f08a3c', '#f6d23a', '#4fbf6a', '#3fd0c8', '#3f7fe0', '#9d6ee3', '#ef7fa8'];
var VERTS = ['#4f9a5c', '#8fd27a', '#3fa88a', '#c9b85a', '#2f7a4a'];
var LUMIERES = ['#ffd36a', '#ff9a4a', '#8ff3ff', '#ff8fb3', '#b6ff7a'];
var FOURRURES = ['#f2a65a', '#b9b3d2', '#4a4060', '#f3e7cb', '#c96a3e'];
var PELAGES = ['#f3f0ff', '#c9a27a', '#8a8aa0', '#e0b98a', '#6b5a50'];
var VERRES = ['#3f8a4a', '#3fa8a0', '#3f6fb0', '#7a3fa0', '#b03a3a', '#8a4f22'];
var POMMES = ['#e5484d', '#f08a3c', '#f6d23a', '#8fd24a', '#4fbf6a'];
var CIELS = ['#8fc7ff', '#ffb38a', '#c9a6ff', '#9fe0c0', '#ffd98a'];
var LIVRES = ['#7a2a3a', '#2f6b5a', '#3f4f9a', '#9a6a2a', '#6b3f8a'];
var LUEURS = ['#8ff3ff', '#b6ff7a', '#ffd36a', '#c9a6ff', '#ff9ad0'];

var DES = {};
/* h, w : hauteur et demi-largeur à l'échelle 1 ; asym : peut être retourné ; n : [min, max] ;
   d : 'gros' | 'petit' (taille du détail) ; pal : couleurs possibles (null : pas de couleur) */

DES.fiole = {h:55, w:18, d:'gros', art:function(o){
  var b = 'M-5,-44 L5,-44 L5,-29 C14,-26 17,-20 17,-14 C17,-5 9,0 0,0 C-9,0 -17,-5 -17,-14 C-17,-20 -14,-26 -5,-29 Z';
  return Halo(0, -14, 23, 20, o.c, 0.16) + Pa(b, VERRE) +
    Pa('M-15.5,-13 C-8,-17 8,-10 15.5,-13 C16,-5 9,-1.5 0,-1.5 C-9,-1.5 -16,-5 -15.5,-13 Z', o.c, 0) +
    Om('M15.5,-13 C16,-5 9,-1.5 0,-1.5 C6,-4 10,-8 11,-12 Z', 0.25) + Pa(b, 'none') +
    Br('M-11,-22 C-14,-16 -13,-10 -10,-6', 2.4) + Re(-7, -47, 14, 4, 2, '#d8ecff', 2) +
    (o.d ? Re(-5.5, -56, 11, 10, 2.5, '#c07a3e', 2.2) + Tr('M-3,-52 h6', '#8a4f22', 1.4) : '');
}};
DES.bocal = {h:46, w:18, d:'gros', art:function(o){
  return Re(-15, -36, 30, 36, 8, VERRE) +
    Pa('M-13,-24 C-6,-27 6,-21 13,-24 L13,-6 C13,-3 11,-2 8,-2 L-8,-2 C-11,-2 -13,-3 -13,-6 Z', o.c, 0) +
    Om('M13,-24 L13,-6 C13,-3 11,-2 8,-2 L3,-2 C7,-6 8,-14 8,-23 Z', 0.25) + Re(-15, -36, 30, 36, 8, 'none') +
    Re(-17, -45, 34, 10, 3, '#c98450') + Tr('M-13,-41 h26', '#f3c991', 1.6, 0.8) +
    (o.d ? Re(-10, -21, 20, 12, 2, '#f3e7cb', 1.8) + Tr('M-6,-17 h12 M-6,-13 h8', '#8a6a4a', 1.4) : '') + Br('M-10,-30 V-8', 2.2, 0.5);
}};
DES.livres = {h:56, w:26, n:[2, 4], d:'petit', art:function(o){
  var n = o.n, s = '', hs = [44, 38, 42, 35], x0 = -n * 6.5;
  for(var i = 0; i < n; i++){
    var x = x0 + i * 13, h = hs[i], c = i === 0 ? o.c : LIVRES[(i + (o.v || 0)) % LIVRES.length];
    s += Re(x, -h, 12, h, 2, c, 2.2) + Om('M' + f1(x + 8) + ',' + f1(-h + 1) + ' h3 v' + f1(h - 2) + ' h-3 Z', 0.22) +
      Tr('M' + f1(x + 2) + ',' + f1(-h + 6) + ' h8 M' + f1(x + 2) + ',-7 h8', '#ffe3a3', 1.6, 0.85);
  }
  if(o.d) s += Pa('M' + f1(x0 + 3) + ',' + (-hs[0]) + ' L' + f1(x0 + 3) + ',' + (-hs[0] - 12) + ' L' + f1(x0 + 6) + ',' + (-hs[0] - 9) + ' L' + f1(x0 + 9) + ',' + (-hs[0] - 12) + ' L' + f1(x0 + 9) + ',' + (-hs[0]) + ' Z', '#e5484d', 1.6);
  return s;
}};
DES.bougie = {h:56, w:14, d:'gros', art:function(o){
  return (o.d ? Halo(0, -46, 16, 16, '#ffd36a', 0.28) : '') +
    Pa('M-14,-3 C-14,-8 14,-8 14,-3 C14,1 -14,1 -14,-3 Z', '#d6a24a') + Tr('M13,-4 C20,-4 20,3 12,1', K, 2) +
    Pa('M-6,-36 L6,-36 L6,-5 L-6,-5 Z', o.c) + Om('M6,-36 L6,-5 L2,-5 L2,-36 Z', 0.22) +
    Pa('M-6,-36 C-6,-31 -3,-31 -3,-27 C-3,-24 0,-24 0,-28 L0,-36 Z', clair(o.c, 0.45), 1.4) + Tr('M0,-36 V-40', K, 1.8) +
    (o.d ? Pa('M0,-55 C6,-47 6,-42 0,-39 C-6,-42 -6,-47 0,-55 Z', '#ffd36a', 1.6, ' stroke="#e8693c"') + Pa('M0,-48 C2,-45 2,-43 0,-41 C-2,-43 -2,-45 0,-48 Z', '#fff6c8', 0) : '');
}};
DES.cristal = {h:50, w:22, asym:true, d:'gros', art:function(o){
  var c = o.c;
  return Halo(0, -22, 26, 26, c, 0.14) +
    Pa('M-14,0 L-8,-40 L-1,-48 L5,-40 L4,0 Z', c) + Pa('M-1,-48 L5,-40 L4,0 L-1,0 Z', fonce(c, 0.3), 0) + Pa('M-14,0 L-8,-40 L-1,-48 L5,-40 L4,0 Z', 'none') +
    Pa('M4,0 L9,-26 L15,-31 L19,-24 L16,0 Z', clair(c, 0.15)) + Om('M15,-31 L19,-24 L16,0 L13,0 Z', 0.25) +
    (o.d ? Pa('M-13,0 L-21,-17 L-17,-23 L-11,-14 L-9,0 Z', clair(c, 0.4)) : '') +
    Br('M-7,-36 L-6,-8', 2.4) + Pa('M-21,1 C-19,-5 19,-5 22,1 Z', '#77729c', 2);
}};
DES.sablier = {h:50, w:15, d:'gros', art:function(o){
  var v = 'M-10,-44 C-10,-30 -2,-28 -2,-25 C-2,-22 -10,-20 -10,-6 L10,-6 C10,-20 2,-22 2,-25 C2,-28 10,-30 10,-44 Z';
  return Pa(v, VERRE) + Pa('M-8,-7 C-7,-14 -3,-17 0,-18 C3,-17 7,-14 8,-7 Z', o.c, 0) +
    (o.d ? Pa('M-8,-42 L8,-42 C7,-36 3,-32 0,-29 C-3,-32 -7,-36 -8,-42 Z', o.c, 0) + Tr('M0,-29 V-18', o.c, 1.6) : '') +
    Pa(v, 'none') + Re(-13.5, -44, 3, 38, 1, '#8a5a33', 1.6) + Re(10.5, -44, 3, 38, 1, '#8a5a33', 1.6) +
    Re(-15, -50, 30, 6, 2.5, '#a8743f') + Re(-15, -6, 30, 6, 2.5, '#a8743f') + Br('M-6,-40 C-6,-34 -4,-31 -3,-29', 1.8);
}};
DES.mortier = {h:44, w:20, asym:true, d:'gros', art:function(o){
  return (o.d ? Pa('M1,-21 L15,-40 C17,-44 22,-42 20,-38 L7,-19 Z', '#d8c8b0') : '') +
    Pa('M-18,-22 C-18,-6 -10,0 0,0 C10,0 18,-6 18,-22 Z', '#9a94b8') + Om('M18,-22 C18,-6 10,0 0,0 C8,-4 11,-12 11,-22 Z', 0.22) +
    El(0, -22, 18, 5, '#6a6488') + El(0, -22, 13, 3, o.c, 0) + Re(-12, -3, 24, 4, 2, '#77729c', 2) + Br('M-13,-16 C-12,-9 -8,-5 -4,-4', 2);
}};
DES.encrier = {h:56, w:22, asym:true, d:'petit', art:function(o){
  return Pa('M2,-20 C4,-36 12,-48 22,-54 C21,-40 14,-28 5,-19 Z', o.c) + Tr('M3,-19 L20,-50', K, 1.4) + Tr('M8,-31 L13,-35 M10,-38 L16,-42', fonce(o.c, 0.3), 1.3) +
    Pa('M-12,0 L-13,-14 C-13,-18 13,-18 13,-14 L12,0 Z', '#2a2440') + Re(-6, -21, 12, 5, 2, '#3a3352', 2) + Br('M-8,-12 V-4', 2, 0.4) +
    (o.d ? Pa('M-13,1 C-24,2 -26,-5 -19,-8 C-16,-12 -11,-7 -11,-3 Z', '#3a3a7a', 1.6) : '');
}};
DES.chaudronMini = {h:50, w:26, d:'gros', art:function(o){
  return Tr('M-14,-3 L-17,2 M14,-3 L17,2', K, 3.5) +
    Pa('M-21,-24 C-23,-6 -12,0 0,0 C12,0 23,-6 21,-24 Z', '#3a3352') + Om('M21,-24 C23,-6 12,0 0,0 C9,-5 13,-13 14,-24 Z', 0.3) + Br('M-15,-17 C-14,-10 -10,-6 -5,-4', 2.2, 0.4) +
    El(0, -24, 23, 6, '#2b2540') + El(0, -24, 19, 4, o.c, 0) + Tr('M-23,-22 C-28,-24 -28,-17 -22,-16 M23,-22 C28,-24 28,-17 22,-16', K, 2.6) +
    (o.d ? Ci(-7, -27, 3.4, clair(o.c, 0.4), 1.5) + Ci(5, -29, 4.2, clair(o.c, 0.4), 1.5) + Tr('M-4,-33 C-8,-39 0,-42 -4,-49 M7,-35 C3,-41 11,-44 7,-50', '#ffffff', 2, 0.5) : '');
}};
function champi(x, k, c, d){
  var g = '<g transform="translate(' + f1(x) + ',0) scale(' + k + ')">';
  g += Pa('M-6,0 C-6,-8 -5,-16 -4,-20 L4,-20 C5,-16 6,-8 6,0 Z', '#fff4dc') + Om('M6,0 C6,-8 5,-16 4,-20 L2,-20 C3,-12 3,-6 2,0 Z', 0.15);
  g += Pa('M-20,-18 C-20,-36 20,-36 20,-18 C14,-15 -14,-15 -20,-18 Z', c) + Om('M20,-18 C20,-30 14,-34 8,-34 C14,-28 15,-22 12,-16 C16,-16 18,-17 20,-18 Z', 0.22);
  if(d) g += Ci(-9, -26, 3.4, '#fff', 1.4) + Ci(4, -30, 3, '#fff', 1.4) + Ci(11, -22, 2.6, '#fff', 1.4);
  return g + Br('M-14,-24 C-12,-29 -8,-31 -4,-32', 2) + '</g>';
}
DES.champignon = {h:40, w:26, n:[1, 3], asym:true, asymSi:function(o){ return o.n > 1; }, d:'gros', art:function(o){
  var pos = [[0, 1], [-15, 0.72], [14, 0.62]], s = '';
  for(var i = o.n - 1; i >= 0; i--) s += champi(pos[i][0], pos[i][1], o.c, o.d);
  return s;
}};
function champiL(x, k, c){
  return '<g transform="translate(' + f1(x) + ',0) scale(' + k + ')">' + Halo(0, -32, 20, 14, c, 0.35) +
    Pa('M-4,0 C-4,-12 -3,-22 -2,-28 L2,-28 C3,-22 4,-12 4,0 Z', '#e8fbff') +
    Pa('M-15,-27 C-15,-43 15,-43 15,-27 C9,-24 -9,-24 -15,-27 Z', c) + Om('M15,-27 C15,-37 10,-41 5,-42 C10,-36 11,-30 9,-25 C12,-25 14,-26 15,-27 Z', 0.18) +
    Br('M-9,-33 C-7,-37 -3,-39 1,-40', 2.2, 0.85) + Ci(6, -33, 1.8, '#ffffff', 0, ' opacity=".85"') + '</g>';
}
DES.champiLum = {h:44, w:28, n:[2, 4], asym:true, d:'petit', pal:LUEURS, art:function(o){
  var pos = [[0, 1], [-15, 0.72], [14, 0.62], [-27, 0.5]], s = Halo(0, -18, 36, 26, o.c, 0.2);
  for(var i = o.n - 1; i >= 0; i--) s += champiL(pos[i][0], pos[i][1], o.c);
  if(o.d) s += etincelle(-18, -40, 5, '#ffffff') + etincelle(20, -36, 4, '#ffffff') + etincelle(4, -50, 3.5, '#ffffff');
  return s;
}};
DES.chat = {h:48, w:22, asym:true, d:'petit', pal:FOURRURES, art:function(o){
  var c = o.c, ci = '#ff9fb8';
  return Pa('M8,-4 C22,-4 25,-16 19,-24 C17,-26 14,-24 16,-21 C19,-16 18,-9 8,-9', c) +
    Pa('M-14,0 C-16,-10 -14,-22 -6,-26 C0,-28 8,-24 10,-14 C12,-6 10,0 6,0 Z', c) + Om('M10,-14 C12,-6 10,0 6,0 L0,0 C5,-5 6,-12 4,-20 Z', 0.2) +
    Pa('M-18,-34 L-17,-47 L-10,-40 Z', c) + Pa('M0,-34 L-1,-47 L-8,-40 Z', c) + Pa('M-16,-38 L-15.5,-44 L-12,-40 Z', ci, 0) + Pa('M-2,-38 L-2.5,-44 L-6,-40 Z', ci, 0) +
    Ci(-9, -33, 10, c) + Ci(-13, -34, 1.7, K, 0) + Ci(-5, -34, 1.7, K, 0) + Pa('M-10.5,-30.5 L-7.5,-30.5 L-9,-29 Z', ci, 1) +
    Tr('M-19,-31 h-6 M-19,-29 l-5,2 M1,-31 h6 M1,-29 l5,2', K, 1, 0.6) +
    El(-11, -1.5, 4, 2.5, clair(c, 0.3), 1.6) + El(-3, -1.5, 4, 2.5, clair(c, 0.3), 1.6) +
    (o.d ? Tr('M-16,-24 C-12,-22 -6,-22 -2,-24', '#e5484d', 3.4) + Ci(-9, -20.5, 3.8, '#f6d23a', 1.5) : '');
}};
DES.herbes = {h:52, w:15, pend:true, d:'petit', pal:VERTS, art:function(o){
  var c = o.c;
  return Tr('M0,0 V12', '#c9a874', 1.6) +
    Pa('M0,14 C-13,24 -11,40 -4,48 C-4,36 -3,26 0,14 Z', fonce(c, 0.2)) + Pa('M0,14 C13,24 11,40 4,48 C4,36 3,26 0,14 Z', c) +
    Pa('M0,14 C-5,28 5,42 0,52 C-5,42 5,28 0,14 Z', clair(c, 0.25)) + Re(-5, 11, 10, 6, 2, '#c94a3a', 1.8) +
    (o.d ? Ci(-6, 44, 2.8, '#ef7fa8', 1.2) + Ci(5, 46, 2.8, '#ef7fa8', 1.2) + Ci(0, 51, 2.8, '#ffe3f0', 1.2) : '');
}};
DES.lanterne = {h:50, w:14, pend:true, d:'gros', pal:LUMIERES, couleurSi:function(o){ return o.d; }, art:function(o){
  var c = o.c;
  return Tr('M0,0 V9', K, 2) + Ci(0, 12, 3.5, 'none', 2) + (o.d ? Halo(0, 33, 26, 24, c, 0.28) : '') +
    Pa('M-9,18 L9,18 L12,22 L-12,22 Z', '#3a3352') + Re(-10, 22, 20, 22, 3, o.d ? c : '#5a5470') + Tr('M-4,22 V44 M4,22 V44', '#3a3352', 2) +
    Pa('M-12,44 L12,44 L9,49 L-9,49 Z', '#3a3352') + (o.d ? Pa('M0,27 C3,31 3,35 0,38 C-3,35 -3,31 0,27 Z', '#fff7d0', 1) : '');
}};
DES.lampadaire = {h:114, w:16, d:'gros', pal:LUMIERES, couleurSi:function(o){ return o.d; }, art:function(o){
  var c = o.c;
  return (o.d ? Halo(0, -92, 32, 30, c, 0.3) : '') +
    Re(-9, -7, 18, 7, 2, '#3a3352') + Re(-3, -80, 6, 73, 2, '#3a3352') + Tr('M-1,-76 V-10', '#8a82b0', 1.6, 0.6) +
    Pa('M-12,-80 L12,-80 L9,-85 L-9,-85 Z', '#3a3352') + Re(-9, -103, 18, 18, 3, o.d ? c : '#5a5470') + Tr('M0,-103 V-85', '#3a3352', 2) +
    Pa('M-14,-103 L14,-103 L0,-113 Z', '#3a3352') + Ci(0, -114, 2.5, '#3a3352', 1.6);
}};
DES.fleursPot = {h:50, w:20, n:[2, 5], d:'petit', art:function(o){
  var xs = [[0, -44], [-10, -38], [10, -38], [-15, -29], [15, -29]], s = '';
  for(var i = 0; i < o.n; i++) s += Tr('M0,-18 Q' + f1(xs[i][0] * 0.4) + ',' + f1((xs[i][1] - 18) / 2) + ' ' + xs[i][0] + ',' + xs[i][1], '#3f8a4a', 2.2);
  s += Pa('M0,-20 C-8,-26 -14,-24 -16,-20 C-10,-18 -4,-18 0,-20 Z', '#4fbf6a', 1.6) + Pa('M0,-20 C8,-26 14,-24 16,-20 C10,-18 4,-18 0,-20 Z', '#4fbf6a', 1.6);
  for(i = 0; i < o.n; i++) s += fleur(xs[i][0], xs[i][1], 6.5, o.c);
  s += Pa('M-13,-18 L13,-18 L10,0 L-10,0 Z', '#c96a3e') + Om('M13,-18 L10,0 L4,0 L7,-18 Z', 0.2) + Re(-15, -22, 30, 6, 2, '#e08a5a');
  if(o.d) s += Tr('M-11.5,-10 H11.5', '#f6d23a', 3);
  return s;
}};
function oiseau1(x, c, d){
  return '<g transform="translate(' + x + ',0)">' + Tr('M-2,0 v-3 M2,0 v-3', '#e8a04a', 1.6) +
    Pa('M-8,-8 L-16,-12 L-13,-5 Z', fonce(c, 0.25), 1.6) +
    Pa('M-9,-6 C-10,-14 -4,-18 2,-17 C8,-16 10,-10 8,-5 C5,-2 -6,-2 -9,-6 Z', c) +
    Ci(4, -17, 5.5, c) + Pa('M9,-18 L13.5,-16.5 L9,-15 Z', '#f6a23a', 1.2) + Ci(5.5, -18, 1.2, K, 0) +
    Pa('M-4,-12 C0,-9 5,-10 6,-7 C2,-6 -2,-7 -4,-12 Z', fonce(c, 0.2), 1.4) +
    Pa('M-6,-7 C-2,-4 4,-4 7,-6 C4,-3 -3,-3 -6,-7 Z', clair(c, 0.4), 0) +
    (d ? Pa('M1,-21 C-1,-30 6,-32 7,-24 Z', '#e5484d', 1.4) : '') + '</g>';
}
DES.oiseau = {h:26, w:26, n:[1, 3], asym:true, d:'petit', art:function(o){
  var pos = [[0], [-9, 9], [-17, 0, 17]][o.n - 1], s = '';
  pos.forEach(function(x){ s += oiseau1(x, o.c, o.d); });
  return s;
}};
DES.fanions = {h:30, w:62, n:[4, 6], pend:true, d:'petit', art:function(o){
  var n = o.n, s = Tr('M-62,0 Q0,22 62,0', '#6a4a3a', 2);
  for(var i = 0; i < n; i++){
    var t = (i + 0.5) / n, x = -62 + 124 * t, y = 2 * (1 - t) * t * 22, c = i % 2 ? '#f3e7cb' : o.c;
    s += Pa('M' + f1(x - 8) + ',' + f1(y) + ' L' + f1(x + 8) + ',' + f1(y) + ' L' + f1(x) + ',' + f1(y + 17) + ' Z', c, 1.8);
    if(o.d && i === 0) s += etincelle(x, y + 6, 3.5, '#f6d23a');
  }
  return s;
}};
DES.panneau = {h:62, w:28, asym:true, d:'gros', art:function(o){
  return Re(-3, -58, 6, 58, 2, '#8a5634') +
    Pa('M-4,-57 L18,-57 L27,-49 L18,-41 L-4,-41 Z', o.c) + Om('M27,-49 L18,-41 L-4,-41 L-4,-45 L16,-45 Z', 0.2) + Tr('M2,-49 h14', '#fff4dc', 2.4, 0.9) +
    (o.d ? Pa('M4,-37 L-18,-37 L-27,-29 L-18,-21 L4,-21 Z', '#d29a5e') + Tr('M-2,-29 h-14', '#6b3f24', 2, 0.8) : '');
}};
DES.tonneau = {h:48, w:21, d:'gros', art:function(o){
  return Pa('M-16,-44 C-21,-30 -21,-14 -16,0 L16,0 C21,-14 21,-30 16,-44 Z', '#b06f3e') + Om('M16,-44 C21,-30 21,-14 16,0 L8,0 C12,-14 12,-30 9,-44 Z', 0.22) +
    Tr('M-6,-44 C-8,-30 -8,-14 -6,0 M6,-44 C8,-30 8,-14 6,0', '#7d4626', 1.4, 0.7) +
    Re(-18.5, -38, 37, 5, 2, '#3a3352', 2) + Re(-18.5, -10, 37, 5, 2, '#3a3352', 2) + Re(-20.5, -27, 41, 9, 2, o.c, 2) +
    El(0, -44, 16, 3.5, '#c98450', 2.2) + (o.d ? Re(-4.5, -15, 9, 7, 1.5, '#d6a24a', 1.8) + Re(-1.5, -9, 3, 6, 1, '#d6a24a', 1.4) : '');
}};
DES.fenetre = {h:48, w:25, d:'gros', art:function(o){
  var c = o.c;
  return Re(-12, -42, 24, 36, 3, '#ffd98a') + Halo(0, -24, 10, 14, '#fff6d0', 0.6) + Tr('M0,-42 V-6 M-12,-24 H12', '#6b3f24', 2.4) + Re(-12, -42, 24, 36, 3, 'none') +
    Pa('M-12,-42 L-24,-40 L-24,-8 L-12,-6 Z', c) + Pa('M12,-42 L24,-40 L24,-8 L12,-6 Z', c) + Tr('M-21,-35 V-13 M-16,-37 V-11 M16,-37 V-11 M21,-35 V-13', fonce(c, 0.35), 1.4) +
    Re(-15, -7, 30, 5, 2, '#d8cfc0') +
    (o.d ? Re(-14, -2, 28, 8, 2, '#8a5634') + Ci(-9, -3, 3.2, '#ef7fa8', 1.2) + Ci(0, -4, 3.2, '#f6d23a', 1.2) + Ci(9, -3, 3.2, '#ef7fa8', 1.2) : '');
}};
DES.lapin = {h:50, w:20, asym:true, d:'gros', pal:PELAGES, art:function(o){
  var c = o.c, ci = '#ffb3c6';
  return Ci(12, -8, 5, '#ffffff', 2) +
    Pa('M-12,0 C-16,-12 -10,-24 0,-24 C10,-24 14,-12 12,0 Z', c) + Om('M12,0 C14,-12 10,-24 2,-24 C8,-18 8,-8 6,0 Z', 0.18) +
    Pa('M-15,-34 C-20,-50 -13,-52 -10,-37 Z', c) + Pa('M-7,-36 C-7,-52 0,-52 -2,-36 Z', c) + Pa('M-14.5,-38 C-17,-47 -14,-48 -12.5,-39 Z', ci, 0) + Pa('M-5.5,-38 C-5.5,-48 -2,-48 -3,-38 Z', ci, 0) +
    El(-8, -30, 9, 8, c) + Ci(-11, -31, 1.6, K, 0) + Pa('M-15.5,-28 L-13.5,-28 L-14.5,-26.5 Z', ci, 1) +
    El(-9, -1.5, 4.5, 2.5, clair(c, 0.3), 1.6) + El(-1, -1.5, 4.5, 2.5, clair(c, 0.3), 1.6) +
    (o.d ? Pa('M-20,-17 L-11,-12 L-17,-6 Z', '#f08a3c', 1.6) + Tr('M-19,-16 l-3,-5 M-19,-16 l-6,-1', '#4fbf6a', 2) : '');
}};
DES.papillon = {h:32, w:22, d:'petit', art:function(o){
  var c = o.c, cc = clair(c, 0.35);
  return '<g transform="translate(0,-16)">' +
    Pa('M0,-2 C-6,-14 -22,-16 -20,-4 C-19,2 -8,2 0,0 Z', c) + Pa('M0,-2 C6,-14 22,-16 20,-4 C19,2 8,2 0,0 Z', c) +
    Pa('M0,1 C-6,4 -16,8 -12,14 C-8,16 -3,10 0,3 Z', cc) + Pa('M0,1 C6,4 16,8 12,14 C8,16 3,10 0,3 Z', cc) +
    El(0, 1, 2.2, 9, '#3a3352', 1.6) + Tr('M-1,-7 C-3,-12 -6,-14 -7,-15 M1,-7 C3,-12 6,-14 7,-15', K, 1.4) +
    (o.d ? Ci(-12, -7, 4, '#ffffff', 1.3) + Ci(12, -7, 4, '#ffffff', 1.3) : '') + '</g>';
}};
function herbeTouffe(w){ return Tr('M' + (-w) + ',0 C' + (-w + 2) + ',-8 ' + (-w - 2) + ',-12 ' + (-w - 4) + ',-14 M' + (-w / 3) + ',0 C' + (-w / 3) + ',-9 ' + (-w / 3 + 2) + ',-13 ' + (-w / 3 + 3) + ',-16 M' + (w / 3) + ',0 C' + (w / 3) + ',-8 ' + (w / 3 - 1) + ',-12 ' + (w / 3 - 3) + ',-14 M' + w + ',0 C' + (w - 1) + ',-7 ' + (w + 1) + ',-11 ' + (w + 3) + ',-13', '#3f8a4a', 2.2); }
DES.fleurs = {h:42, w:22, n:[2, 5], d:'petit', art:function(o){
  var xs = [[0, -36], [-11, -28], [11, -30], [-18, -18], [18, -20]], s = herbeTouffe(14);
  for(var i = 0; i < o.n; i++) s += Tr('M0,0 Q' + f1(xs[i][0] * 0.3) + ',' + f1(xs[i][1] / 2) + ' ' + xs[i][0] + ',' + xs[i][1], '#3f8a4a', 2);
  s += Pa('M0,-6 C-7,-12 -13,-10 -14,-6 C-9,-4 -4,-4 0,-6 Z', '#5fbf5a', 1.5) + Pa('M0,-8 C7,-14 13,-12 14,-8 C9,-6 4,-6 0,-8 Z', '#5fbf5a', 1.5);
  for(i = 0; i < o.n; i++) s += fleur(xs[i][0], xs[i][1], 6.5, o.c);
  if(o.d) s += El(11, -9, 4.8, 4, '#e5484d', 1.4) + Tr('M11,-13 V-5', K, 1.1) + Ci(9.5, -9, 1.1, K, 0) + Ci(12.5, -8, 1.1, K, 0);
  return s;
}};
DES.baies = {h:46, w:27, n:[2, 5], d:'petit', pal:['#7d3aa8', '#3f4fd0', '#e5484d', '#e0408a', '#2a2a6a'], art:function(o){
  var s = Pa('M-24,0 C-30,-10 -24,-24 -14,-26 C-12,-38 4,-42 10,-32 C20,-36 30,-24 24,-12 C30,-6 26,0 22,0 Z', '#3f8a4a') +
    Pa('M-14,-26 C-10,-30 -4,-31 0,-28 M10,-32 C14,-30 16,-27 16,-24', 'none', 1.6) +
    Om('M24,-12 C30,-6 26,0 22,0 L8,0 C16,-6 20,-12 24,-12 Z', 0.2) +
    Pa('M-18,-14 C-12,-20 -6,-18 -4,-14 C-8,-12 -14,-12 -18,-14 Z', '#5fbf5a', 1.4) + Pa('M6,-20 C12,-26 18,-24 20,-20 C16,-18 10,-18 6,-20 Z', '#5fbf5a', 1.4);
  var pos = [[-10, -26], [9, -29], [0, -13], [-17, -9], [17, -11]], c = o.c;
  for(var i = 0; i < o.n; i++){
    var x = pos[i][0], y = pos[i][1];
    s += Ci(x - 3.5, y + 1, 4, c, 1.5) + Ci(x + 3.5, y + 1, 4, c, 1.5) + Ci(x, y - 4.5, 4, c, 1.5) +
      Ci(x - 4.5, y, 1.1, '#ffffff', 0, ' opacity=".7"') + Ci(x + 2.5, y, 1.1, '#ffffff', 0, ' opacity=".7"') + Ci(x - 1, y - 5.5, 1.1, '#ffffff', 0, ' opacity=".7"');
  }
  if(o.d) s += fleur(-21, -20, 4.5, '#fff4f8', '#f6d23a');
  return s;
}};
DES.rocher = {h:32, w:24, d:'gros', pal:['#6dbb6a', '#3fa88a', '#a8d84a', '#4f9a5c'], art:function(o){
  return Pa('M-22,0 C-25,-14 -12,-26 0,-26 C14,-26 25,-14 22,0 Z', '#8a86a8') + Om('M22,0 C25,-14 14,-26 4,-26 C14,-18 14,-8 10,0 Z', 0.2) +
    Pa('M-19,-13 C-17,-23 -4,-28 6,-26 C14,-25 21,-18 21,-11 C14,-15 7,-11 1,-13 C-6,-9 -13,-14 -19,-13 Z', o.c, 1.8) + Br('M-14,-6 C-15,-3 -14,-1 -12,0', 2, 0.35) +
    (o.d ? '<g transform="translate(9,-22) scale(.45)">' + champi(0, 1, '#e5484d', true) + '</g>' : '');
}};
DES.souche = {h:46, w:26, d:'gros', art:function(o){
  return Pa('M-26,0 C-22,-4 -20,-6 -18,-10 L18,-10 C20,-6 22,-4 26,0 Z', '#7a4a2a') +
    Pa('M-18,0 C-16,-10 -16,-24 -16,-30 L16,-30 C16,-24 16,-10 18,0 Z', '#8a5634') + Om('M16,-30 C16,-24 16,-10 18,0 L8,0 C10,-10 10,-22 9,-30 Z', 0.22) +
    Tr('M-8,-28 C-9,-18 -9,-8 -10,0 M4,-28 C5,-18 4,-8 6,0', '#5a3820', 1.4, 0.7) +
    El(0, -30, 16, 5, '#d29a5e') + El(0, -30, 9, 2.6, 'none', 1.2) + El(0, -30, 4, 1.2, 'none', 1) +
    Pa('M16,-20 C27,-21 29,-13 17,-12 Z', o.c, 1.8) + Pa('M16,-11 C24,-12 26,-5 17,-4 Z', o.c, 1.8) +
    (o.d ? Tr('M-4,-31 C-4,-38 -2,-42 0,-46', '#3f8a4a', 2) + Pa('M0,-46 C6,-50 10,-46 8,-42 C4,-42 2,-44 0,-46 Z', '#5fbf5a', 1.4) + Pa('M-3,-40 C-9,-43 -12,-39 -10,-36 C-6,-36 -4,-38 -3,-40 Z', '#5fbf5a', 1.4) : '');
}};
DES.chope = {h:44, w:20, asym:true, d:'gros', art:function(o){
  return Tr('M9,-27 C20,-27 20,-10 9,-10', K, 6.5) + Tr('M9,-27 C20,-27 20,-10 9,-10', clair(o.c, 0.1), 3) +
    Re(-12, -32, 22, 32, 4, o.c) + Om('M10,-28 L10,-4 C10,-2 8,0 6,0 L2,0 L2,-32 L6,-32 C8,-32 10,-30 10,-28 Z', 0.22) +
    Tr('M-12,-24 H10 M-12,-8 H10', fonce(o.c, 0.35), 2.2) + Br('M-8,-28 V-12', 2.2, 0.5) +
    (o.d ? Pa('M-14,-31 C-16,-38 -8,-42 -4,-38 C-2,-43 6,-43 8,-38 C12,-40 16,-36 12,-30 Z', '#fff8e6', 2) + Pa('M-11,-31 C-11,-26 -8,-26 -8,-29 Z', '#fff8e6', 1.4) : '');
}};
DES.bouteille = {h:58, w:12, d:'gros', pal:VERRES, art:function(o){
  var c = o.c;
  return Pa('M-4,-54 L4,-54 L4,-40 C11,-36 11,-30 11,-26 L11,-3 C11,-1 9,0 7,0 L-7,0 C-9,0 -11,-1 -11,-3 L-11,-26 C-11,-30 -11,-36 -4,-40 Z', c) +
    Om('M4,-40 C11,-36 11,-30 11,-26 L11,-3 C11,-1 9,0 7,0 L4,0 C6,-10 6,-30 4,-40 Z', 0.25) + Br('M-7,-28 V-6', 2.4, 0.45) +
    Re(-5, -58, 10, 6, 2, '#c98450', 2) +
    (o.d ? Re(-10, -22, 20, 13, 2, '#f3e7cb', 1.8) + Tr('M-6,-18 h12 M-6,-14 h8', '#8a6a4a', 1.3) : '');
}};
DES.assiette = {h:28, w:25, n:[1, 3], d:'gros', art:function(o){
  var s = El(0, -4, 25, 6, o.c) + El(0, -5, 19, 4, '#f3f0ff', 1.6);
  var pos = [[[0]], [[-8], [8]], [[-11], [0], [11]]][o.n - 1];
  pos.forEach(function(p, i){ var x = p[0], y = o.n === 3 && i === 1 ? -12 : -9;
    s += Pa('M' + (x - 9) + ',' + (y + 4) + ' C' + (x - 10) + ',' + (y - 6) + ' ' + (x + 10) + ',' + (y - 6) + ' ' + (x + 9) + ',' + (y + 4) + ' Z', '#d9984a', 1.8) +
      Tr('M' + (x - 4) + ',' + (y - 1) + ' l3,-2 M' + (x + 1) + ',' + y + ' l3,-2', '#8a5020', 1.3) + Br('M' + (x - 6) + ',' + y + ' C' + (x - 5) + ',' + (y - 2) + ' ' + (x - 3) + ',' + (y - 3) + ' ' + (x - 1) + ',' + (y - 3), 1.4, 0.5); });
  if(o.d) s += Pa('M14,-6 L26,-15 L26,-5 Z', '#f6d23a', 1.6) + Ci(22, -9, 1.3, '#d6a22a', 0);
  return s;
}};
DES.tableau = {h:54, w:27, d:'gros', pal:CIELS, art:function(o){
  return Tr('M-10,-44 L0,-53 L10,-44', '#6a4a3a', 1.4) + Ci(0, -53, 1.8, '#3a3352', 0) +
    Re(-27, -45, 54, 41, 3, '#b8862e') + Re(-21, -39, 42, 29, 1, o.c, 1.8) +
    Pa('M-21,-15 C-12,-25 -4,-21 2,-17 C8,-23 16,-25 21,-19 L21,-10 L-21,-10 Z', '#4f9a5c', 1.5) +
    (o.d ? Ci(10, -30, 5.5, '#ffe36a', 1.4) : '') + Tr('M-24,-42 h48', '#fff1b8', 1.4, 0.6);
}};
DES.chapeau = {h:34, w:24, pend:true, asym:true, d:'gros', art:function(o){
  return Re(-3, 0, 6, 8, 1, '#8a5634', 1.8) +
    Pa('M-11,27 L-9,10 C-4,6 4,6 9,10 L11,27 Z', '#3a3352') + Om('M9,10 L11,27 L5,27 L4,9 Z', 0.25) +
    El(0, 28, 22, 5, '#2b2540') + Re(-11, 20, 22, 5, 1, o.c, 1.8) +
    (o.d ? Pa('M8,22 C16,10 22,4 27,1 C23,11 17,18 11,24 Z', '#f3e7cb', 1.8) + Tr('M10,23 L25,3', '#c9b8a0', 1) : '');
}};
DES.horloge = {h:48, w:17, asym:true, d:'gros', art:function(o){
  return (o.d ? Tr('M0,-15 V-4', '#b8862e', 2) + Ci(0, -2, 4, '#f6d23a', 1.6) : '') +
    Ci(0, -31, 16, o.c) + Ci(0, -31, 11.5, '#f8f0dc', 1.6) +
    Tr('M0,-41 v2 M0,-21 v-2 M-10,-31 h2 M10,-31 h-2', K, 1.4) + Tr('M0,-31 L-6,-36', K, 2.2) + Tr('M0,-31 L7,-39', K, 1.6) + Ci(0, -31, 1.6, K, 0);
}};
DES.pommes = {h:42, w:26, n:[1, 6], d:'petit', pal:POMMES, art:function(o){
  var pos = [[0, -8], [-14, -8], [14, -8], [-7, -20], [7, -20], [0, -32]], s = '', c = o.c;
  for(var i = 0; i < o.n; i++){ var x = pos[i][0], y = pos[i][1];
    s += Pa('M' + x + ',' + (y - 7) + ' C' + (x - 4) + ',' + (y - 11) + ' ' + (x - 10) + ',' + (y - 9) + ' ' + (x - 10) + ',' + (y - 2) + ' C' + (x - 10) + ',' + (y + 5) + ' ' + (x - 4) + ',' + (y + 7) + ' ' + x + ',' + (y + 6) + ' C' + (x + 4) + ',' + (y + 7) + ' ' + (x + 10) + ',' + (y + 5) + ' ' + (x + 10) + ',' + (y - 2) + ' C' + (x + 10) + ',' + (y - 9) + ' ' + (x + 4) + ',' + (y - 11) + ' ' + x + ',' + (y - 7) + ' Z', c, 1.8) +
      Tr('M' + x + ',' + (y - 7) + ' l1,-4', '#5e3a1e', 1.6) + Br('M' + (x - 6) + ',' + (y - 4) + ' C' + (x - 6) + ',' + (y - 6) + ' ' + (x - 5) + ',' + (y - 7) + ' ' + (x - 3) + ',' + (y - 7), 1.6, 0.6); }
  var top = pos[o.n - 1];
  if(o.d) s += Pa('M' + (top[0] + 1) + ',' + (top[1] - 10) + ' C' + (top[0] + 6) + ',' + (top[1] - 17) + ' ' + (top[0] + 12) + ',' + (top[1] - 14) + ' ' + (top[0] + 12) + ',' + (top[1] - 12) + ' C' + (top[0] + 8) + ',' + (top[1] - 9) + ' ' + (top[0] + 4) + ',' + (top[1] - 9) + ' ' + (top[0] + 1) + ',' + (top[1] - 10) + ' Z', '#4fbf6a', 1.4);
  return s;
}};
DES.panier = {h:42, w:24, d:'gros', art:function(o){
  return (o.d ? Tr('M-18,-18 C-18,-42 18,-42 18,-18', K, 5.5) + Tr('M-18,-18 C-18,-42 18,-42 18,-18', '#c98450', 2.6) : '') +
    Pa('M-17,-18 C-11,-27 -3,-22 3,-27 C9,-22 14,-25 18,-18 Z', o.c, 1.8) +
    Pa('M-22,-18 L22,-18 L17,0 L-17,0 Z', '#c98450') + Om('M22,-18 L17,0 L9,0 L13,-18 Z', 0.2) +
    Tr('M-20,-11 H20 M-18,-5 H18 M-12,-18 L-10,0 M0,-18 V0 M12,-18 L10,0', '#8a5634', 1.4) + Re(-23, -21, 46, 5, 2, '#d29a5e', 2);
}};
DES.sac = {h:52, w:23, d:'gros', art:function(o){
  var c = o.c;
  return (o.d ? Pa('M10,0 C11,-7 20,-7 23,0 Z', '#fffaf0', 1.6) + Ci(18, -9, 1.6, '#fffaf0', 0) + Ci(22, -12, 1.2, '#fffaf0', 0) : '') +
    Pa('M-16,0 C-20,-14 -18,-30 -10,-36 L-6,-40 L6,-40 L10,-36 C18,-30 20,-14 16,0 Z', '#efe4cc') + Om('M16,0 C20,-14 18,-30 10,-36 C12,-24 12,-10 8,0 Z', 0.18) +
    Pa('M-6,-40 C-9,-47 -2,-49 0,-45 C2,-49 9,-47 6,-40 Z', '#efe4cc', 2) + Tr('M-8,-38 h16', '#8a6a4a', 2.6) +
    Tr('M0,-9 V-29', c, 2.4) + El(-4, -24, 3, 1.6, c, 0, ' transform="rotate(-35 -4 -24)"') + El(4, -24, 3, 1.6, c, 0, ' transform="rotate(35 4 -24)"') +
    El(-4, -18, 3, 1.6, c, 0, ' transform="rotate(-35 -4 -18)"') + El(4, -18, 3, 1.6, c, 0, ' transform="rotate(35 4 -18)"') + El(0, -30, 1.8, 3, c, 0);
}};
function engrenagePath(n, R, r){
  var d = '', pas = Math.PI * 2 / n;
  for(var i = 0; i < n; i++){
    var a = i * pas, pts = [[a - pas * 0.32, r], [a - pas * 0.2, R], [a + pas * 0.2, R], [a + pas * 0.32, r]];
    pts.forEach(function(p, k){ d += (i === 0 && k === 0 ? 'M' : 'L') + f1(Math.cos(p[0]) * p[1]) + ',' + f1(Math.sin(p[0]) * p[1]) + ' '; });
  }
  return d + 'Z';
}
DES.engrenage = {h:52, w:26, n:[6, 10], nSubtil:true, d:'gros', pal:['#d6a24a', '#c96a3e', '#8a8aa0', '#5fa88a'], art:function(o){
  var c = o.c;
  return '<g transform="translate(0,-26)">' + Pa(engrenagePath(o.n, 25, 19), c) + Ci(0, 0, 13, fonce(c, 0.12), 2) +
    (o.d ? Ci(0, -8, 3, '#3a2a1a', 1.4) + Ci(7, 4, 3, '#3a2a1a', 1.4) + Ci(-7, 4, 3, '#3a2a1a', 1.4) : '') + Ci(0, 0, 4.5, '#3a3352', 2) + Br('M-14,-8 C-12,-12 -8,-15 -4,-16', 2, 0.5) + '</g>';
}};
DES.gerbe = {h:58, w:20, n:[3, 5], d:'petit', art:function(o){
  var n = o.n, s = '';
  for(var i = 0; i < n; i++){
    var a = (i - (n - 1) / 2) * 0.32, x = Math.sin(a) * 40, y = -Math.cos(a) * 40;
    s += Tr('M' + f1(-a * 10) + ',0 L' + f1(x) + ',' + f1(y), '#c9a24a', 2.2);
    s += '<g transform="translate(' + f1(x) + ',' + f1(y) + ') rotate(' + f1(a * 57.3) + ')">' + El(0, -7, 4, 9, '#e8c25a', 1.6) + Tr('M-3,-11 l3,2 l3,-2 M-3,-6 l3,2 l3,-2 M-3,-1 l3,2 l3,-2', '#b8862e', 1, 0.8) + Tr('M0,-16 V-24', '#c9a24a', 1) + '</g>';
  }
  s += Re(-7, -20, 14, 6, 2, o.c, 1.8);
  if(o.d) s += fleur(11, -14, 5, '#e5484d', '#2a2440');
  return s;
}};
DES.souris = {h:26, w:22, asym:true, d:'gros', pal:['#a8a3b8', '#c9a27a', '#8a7a6a', '#f3f0ff'], art:function(o){
  var c = o.c, ci = '#ffb3c6';
  return Tr('M10,-4 C18,-2 22,-9 27,-5', '#e8a0a8', 2.2) +
    Pa('M-12,0 C-15,-10 -6,-18 4,-16 C12,-14 14,-6 12,0 Z', c) + Om('M12,0 C14,-6 12,-14 4,-16 C8,-10 8,-4 6,0 Z', 0.18) +
    Pa('M-12,-4 C-14,-12 -18,-12 -22,-7 C-18,-4 -15,-3 -12,-4 Z', c, 2) + Ci(-8, -15, 5, c, 2) + Ci(-8, -15, 2.6, ci, 0) +
    Ci(-16, -9, 1.3, K, 0) + Ci(-22, -7, 1.6, ci, 1) + Tr('M-20,-6 l-5,1 M-20,-8 l-5,-1', K, 0.9, 0.6) +
    (o.d ? Pa('M-26,0 L-20,-9 L-14,0 Z', '#f6d23a', 1.6) + Ci(-20, -3, 1.4, '#d6a22a', 0) : '');
}};
DES.pain = {h:26, w:28, n:[1, 3], d:'petit', art:function(o){
  var s = Pa('M-28,0 L28,0 L24,-5 L-24,-5 Z', o.c, 1.8), pos = [[0], [-12, 12], [-17, 0, 17]][o.n - 1];
  pos.forEach(function(x){
    s += El(x, -10, 11, 8, '#d9984a', 2) + Om('M' + (x + 4) + ',-17 C' + (x + 11) + ',-15 ' + (x + 12) + ',-5 ' + (x + 4) + ',-3 C' + (x + 8) + ',-8 ' + (x + 8) + ',-13 ' + (x + 4) + ',-17 Z', 0.18) +
      (o.d ? Tr('M' + (x - 5) + ',-12 l3,-4 M' + x + ',-11 l3,-4 M' + (x + 5) + ',-10 l2,-3', '#8a5020', 1.4) : '') + Br('M' + (x - 7) + ',-12 C' + (x - 6) + ',-15 ' + (x - 3) + ',-16 ' + x + ',-16', 1.6, 0.5);
  });
  return s;
}};
DES.seau = {h:42, w:16, asym:true, d:'gros', art:function(o){
  return Tr('M-13,-26 C-10,-41 16,-38 14,-26', K, 2.6) +
    Pa('M-14,-28 L14,-28 L11,0 L-11,0 Z', o.c) + Om('M14,-28 L11,0 L5,0 L7,-28 Z', 0.22) + Tr('M-13.5,-21 H13.5 M-12,-7 H12', fonce(o.c, 0.4), 2) +
    El(0, -28, 14, 3.5, '#5a5a70') + (o.d ? El(0, -28, 11.5, 2.4, '#5aa9ff', 1.2) + Ci(6, -34, 1.8, '#9fd4ff', 1) + Ci(-4, -36, 1.4, '#9fd4ff', 1) : '');
}};
DES.grenouille = {h:30, w:20, asym:true, d:'gros', pal:['#4fbf6a', '#8fd24a', '#3fa88a', '#f6d23a', '#3f7fe0'], art:function(o){
  var c = o.c, cf = fonce(c, 0.2);
  return Pa('M8,0 C20,-2 20,-10 12,-12 C16,-6 12,-3 8,-3 Z', cf, 2) +
    Pa('M-14,0 C-16,-10 -8,-18 2,-18 C10,-18 16,-10 14,0 Z', c) + El(-1, -5, 8, 4, clair(c, 0.4), 0) +
    Ci(-7, -18, 5, c, 2) + Ci(5, -18, 5, c, 2) + Ci(-7, -18, 3, '#ffffff', 1) + Ci(5, -18, 3, '#ffffff', 1) + Ci(-8, -18, 1.5, K, 0) + Ci(4, -18, 1.5, K, 0) +
    Tr('M-7,-10 C-3,-7 1,-7 4,-10', K, 1.4) + Pa('M-12,0 L-18,1 L-15,-3 Z', cf, 1.6) +
    (o.d ? Pa('M-6,-23 L-6,-30 L-3,-26 L0,-31 L3,-26 L6,-30 L6,-23 Z', '#f6d23a', 1.6) : '');
}};
DES.escargot = {h:30, w:22, asym:true, d:'gros', art:function(o){
  var c = o.c;
  return Pa('M-22,0 C-22,-5 -19,-7 -16,-8 L-16,-14 C-16,-18 -11,-18 -11,-14 L-11,-6 L14,-5 C20,-4 22,0 22,0 Z', '#e0cfa8', 2) +
    Tr('M-15,-15 L-18,-24 M-12,-15 L-12,-24', K, 1.4) + Ci(-18, -24, 1.8, K, 0) + Ci(-12, -24, 1.8, K, 0) +
    Ci(4, -14, 11, c) + Om('M4,-3 C11,-3 15,-9 15,-14 C15,-8 10,-5 4,-5 Z', 0.25) + Tr('M4,-14 C4,-17 8,-17 8,-14 C8,-10 1,-10 0,-14 C-1,-20 8,-23 11,-17', fonce(c, 0.45), 1.6) +
    (o.d ? fleur(6, -26, 4.2, '#ffffff', '#f6d23a') : '');
}};
DES.fougere = {h:56, w:26, asym:true, d:'petit', pal:VERTS, art:function(o){
  var c = o.c, s = '';
  [[-0.5, 50, fonce(c, 0.15)], [0.15, 54, c], [0.7, 42, clair(c, 0.15)]].forEach(function(f){
    var a = f[0], L = f[1], col = f[2], ex = Math.sin(a) * L, ey = -Math.cos(a) * L;
    var d = 'M0,0 ', g = '';
    for(var k = 1; k <= 7; k++){ var t = k / 8, px = ex * t + Math.sin(t * 3) * 4, py = ey * t, w = (1 - t) * 9 + 2; g += 'M' + f1(px) + ',' + f1(py) + ' l' + f1(-w * Math.cos(a) - 2) + ',' + f1(-w * Math.sin(a) - 3) + ' M' + f1(px) + ',' + f1(py) + ' l' + f1(w * Math.cos(a) + 2) + ',' + f1(w * Math.sin(a) - 3) + ' '; }
    s += Tr(g, K, 6) + Tr(g, col, 3.6) + Tr(d + 'Q' + f1(ex * 0.5 + 4) + ',' + f1(ey * 0.5) + ' ' + f1(ex) + ',' + f1(ey), col, 2.4);
  });
  if(o.d) s += Tr('M-10,0 C-12,-12 -20,-14 -22,-8 C-23,-4 -18,-3 -17,-7', K, 4.5) + Tr('M-10,0 C-12,-12 -20,-14 -22,-8 C-23,-4 -18,-3 -17,-7', clair(c, 0.25), 2.4);
  return s;
}};
DES.toile = {h:50, w:26, pend:true, asym:true, pal:null, d:'gros', art:function(o){
  var s = '', fil = '', x0 = -26, i, a, r;
  for(i = 0; i <= 5; i++){ a = i / 5 * Math.PI / 2; fil += 'M' + x0 + ',0 L' + f1(x0 + Math.cos(a) * 52) + ',' + f1(Math.sin(a) * 52) + ' '; }
  [14, 27, 40].forEach(function(r){ for(var j = 0; j <= 5; j++){ var b = j / 5 * Math.PI / 2; fil += (j ? 'L' : 'M') + f1(x0 + Math.cos(b) * r) + ',' + f1(Math.sin(b) * r) + ' '; } });
  s += Tr(fil, '#1a1428', 2.6, 0.6) + Tr(fil, '#e8ecff', 1.2, 0.85);
  if(o.d) s += Tr('M8,16 V34', '#e8ecff', 1, 0.8) + Tr('M3,34 l-4,-3 M3,37 l-5,1 M13,34 l4,-3 M13,37 l5,1', K, 1.4) + Ci(8, 38, 5, '#3a3352', 1.6) + Ci(8, 32, 3, '#3a3352', 1.4) + Ci(7, 31.5, 0.9, '#ffffff', 0) + Ci(9.4, 31.5, 0.9, '#ffffff', 0);
  return s;
}};
DES.araignee = {h:48, w:15, pend:true, d:'petit', pal:['#3a3352', '#7a3fa0', '#b03a3a', '#3f6fb0'], art:function(o){
  var c = o.c;
  return Tr('M0,0 V30', '#e8ecff', 1.2, 0.8) +
    Tr('M-4,34 C-10,30 -13,32 -15,36 M-4,37 C-11,36 -13,40 -14,44 M4,34 C10,30 13,32 15,36 M4,37 C11,36 13,40 14,44 M-4,40 C-8,42 -10,46 -10,49 M4,40 C8,42 10,46 10,49', K, 1.8) +
    Ci(0, 39, 7.5, c, 2) + Ci(0, 31, 4.5, c, 1.8) + Ci(-1.6, 30.5, 1.2, '#ffffff', 0) + Ci(1.6, 30.5, 1.2, '#ffffff', 0) +
    (o.d ? Tr('M-5,37 h10 M-5,41 h10', '#f6d23a', 1.8) : '') + Br('M-4,36 C-3,34 -1,33 1,33', 1.4, 0.5);
}};
DES.caisse = {h:36, w:22, d:'gros', art:function(o){
  return (o.d ? Pa('M-16,-32 C-14,-40 -10,-36 -8,-32 C-6,-40 -1,-38 0,-32 C2,-40 8,-38 9,-32 C12,-39 17,-36 16,-32 Z', '#f0d27a', 1.8) : '') +
    Re(-20, -32, 40, 32, 2, '#c98450') + Om('M20,-32 L20,0 L13,0 L13,-32 Z', 0.18) + Tr('M-20,-21 H20 M-20,-11 H20', '#8a5634', 1.4) +
    Tr('M-17,-29 L17,-3', '#8a5634', 3.4) + Ci(0, -16, 7, o.c, 1.8) + etincelle(0, -16, 4.2, '#fff4dc');
}};
DES.citrouille = {h:34, w:26, n:[1, 3], d:'petit', pal:['#f08a3c', '#f6d23a', '#e8e0c8', '#8fd24a'], art:function(o){
  var pos = [[[0, 1]], [[-9, 0.9], [12, 0.7]], [[0, 1], [-16, 0.62], [16, 0.6]]][o.n - 1], s = '';
  for(var i = pos.length - 1; i >= 0; i--){ var x = pos[i][0], k = pos[i][1], c = o.c;
    s += '<g transform="translate(' + x + ',0) scale(' + k + ')">' + El(-8, -13, 9, 13, c, 2.2) + El(8, -13, 9, 13, c, 2.2) + El(0, -13, 8, 14, clair(c, 0.12), 2.2) + Om('M12,-25 C19,-20 19,-6 12,-1 C14,-8 14,-18 12,-25 Z', 0.2) +
      Re(-2, -31, 4, 6, 1.5, '#5e7a2a', 1.8) + (o.d && i === 0 ? Tr('M2,-29 C8,-34 12,-28 8,-26 C5,-25 6,-29 9,-29', '#4f9a5c', 1.6) : '') + '</g>'; }
  return s;
}};
DES.bouquet = {h:62, w:22, n:[3, 5], d:'gros', art:function(o){
  var vase = ['#3f6fb0', '#c96a3e', '#e8e0c8', '#4f9a5c'][(o.v || 0) % 4], pos = [[0, -54], [-12, -46], [12, -47], [-16, -36], [16, -36]], s = '';
  for(var i = 0; i < o.n; i++) s += Tr('M0,-22 Q' + f1(pos[i][0] * 0.3) + ',' + f1((pos[i][1] - 22) / 2) + ' ' + pos[i][0] + ',' + pos[i][1], '#3f8a4a', 2);
  s += Pa('M0,-26 C-8,-34 -16,-30 -18,-26 C-10,-24 -4,-24 0,-26 Z', '#5fbf5a', 1.5) + Pa('M0,-28 C8,-36 16,-32 18,-28 C10,-26 4,-26 0,-28 Z', '#5fbf5a', 1.5);
  for(i = 0; i < o.n; i++) s += (o.v % 2) ? Pa('M' + (pos[i][0] - 6) + ',' + (pos[i][1] - 4) + ' L' + (pos[i][0] - 6) + ',' + (pos[i][1] + 3) + ' C' + (pos[i][0] - 6) + ',' + (pos[i][1] + 8) + ' ' + (pos[i][0] + 6) + ',' + (pos[i][1] + 8) + ' ' + (pos[i][0] + 6) + ',' + (pos[i][1] + 3) + ' L' + (pos[i][0] + 6) + ',' + (pos[i][1] - 4) + ' L' + (pos[i][0] + 3) + ',' + (pos[i][1] - 1) + ' L' + pos[i][0] + ',' + (pos[i][1] - 5) + ' L' + (pos[i][0] - 3) + ',' + (pos[i][1] - 1) + ' Z', o.c, 1.5) : fleur(pos[i][0], pos[i][1], 7, o.c);
  s += Pa('M-9,-26 C-15,-18 -15,-6 -10,0 L10,0 C15,-6 15,-18 9,-26 Z', vase) + Om('M9,-26 C15,-18 15,-6 10,0 L5,0 C8,-8 8,-18 5,-26 Z', 0.2) + Re(-10, -29, 20, 4, 2, clair(vase, 0.2), 1.8) + Br('M-7,-18 C-8,-12 -7,-7 -5,-4', 1.8, 0.45);
  if(o.d) s += Pa('M0,-17 C-6,-23 -12,-19 -9,-14 C-6,-12 -3,-15 0,-17 C3,-15 6,-12 9,-14 C12,-19 6,-23 0,-17 Z', '#ffd36a', 1.4) + Tr('M0,-17 L-4,-8 M0,-17 L4,-8', '#ffd36a', 2);
  return s;
}};
DES.mousse = {h:24, w:27, n:[2, 4], d:'petit', pal:LUEURS, art:function(o){
  var c = o.c, pos = [[0, 9], [-14, 7], [14, 7.5], [-6, 6]], s = Halo(0, -6, 32, 14, c, 0.25);
  for(var i = 0; i < o.n; i++){ var x = pos[i][0], r = pos[i][1]; s += Pa('M' + (x - r - 2) + ',0 C' + (x - r - 2) + ',' + (-r * 1.4) + ' ' + (x + r + 2) + ',' + (-r * 1.4) + ' ' + (x + r + 2) + ',0 Z', c, 1.8) + Ci(x - r * 0.3, -r * 0.6, 1.4, '#ffffff', 0, ' opacity=".8"') + Ci(x + r * 0.35, -r * 0.4, 1.1, '#ffffff', 0, ' opacity=".7"'); }
  if(o.d) s += etincelle(-18, -18, 4.5, '#ffffff') + etincelle(16, -20, 4, '#ffffff');
  return s;
}};
DES.lune = {h:44, w:24, d:'gros', pal:['#eef0ff', '#ffe3a3', '#ffc6e0', '#bff9ff'], art:function(o){
  var c = o.c;
  return Halo(0, -14, 30, 24, c, 0.3) + Pa('M-22,0 C-18,-10 -9,-16 0,-16 C9,-16 18,-10 22,0 Z', c) + Om('M22,0 C18,-10 9,-16 2,-16 C10,-10 13,-5 12,0 Z', 0.12) +
    Ci(-8, -6, 1.6, '#ffffff', 0) + Ci(4, -10, 1.4, '#ffffff', 0) + Ci(10, -4, 1.4, '#ffffff', 0) + Ci(-2, -3, 1.2, fonce(c, 0.25), 0) +
    Pa('M2,-40 C-8,-38 -10,-26 -3,-21 C-9,-22 -14,-28 -12,-35 C-10,-41 -4,-43 2,-40 Z', '#fff4cf', 1.8) +
    (o.d ? etincelle(14, -30, 5.5, '#ffffff') + etincelle(-17, -18, 4, '#ffffff') + etincelle(9, -44, 3.5, '#ffffff') : '');
}};
DES.lavande = {h:56, w:20, n:[3, 5], d:'petit', pal:['#a77bf0', '#7d5bd0', '#c9a6ff', '#ef7fa8'], art:function(o){
  var n = o.n, s = herbeTouffe(10);
  for(var i = 0; i < n; i++){
    var a = (i - (n - 1) / 2) * 0.28, x = Math.sin(a) * 34, y = -Math.cos(a) * 34;
    s += Tr('M0,0 L' + f1(x) + ',' + f1(y), '#4f9a5c', 2);
    for(var k = 0; k < 5; k++){ var t = 1 + k * 0.12; s += El(x * t, y * t - 2, 3.2, 4.2, k % 2 ? o.c : fonce(o.c, 0.15), 1.2); }
  }
  if(o.d) s += Re(-6, -14, 12, 5, 2, '#d8b47a', 1.6);
  return s;
}};
DES.trefle = {h:34, w:22, n:[2, 4], d:'petit', pal:VERTS, art:function(o){
  var pos = [[0, -26], [-13, -18], [13, -20], [-5, -12]], s = '', c = o.c;
  for(var i = 0; i < o.n; i++){
    var x = pos[i][0], y = pos[i][1], f = (o.d && i === 0) ? 4 : 3;
    s += Tr('M' + f1(x * 0.3) + ',0 Q' + f1(x * 0.4) + ',' + f1(y / 2) + ' ' + x + ',' + y, '#3f7a3a', 1.8);
    for(var k = 0; k < f; k++){ var a = k * Math.PI * 2 / f - Math.PI / 2; s += Ci(x + Math.cos(a) * 4.6, y + Math.sin(a) * 4.6, 4.4, c, 1.4); }
    s += Ci(x, y, 1.4, clair(c, 0.5), 0);
  }
  return s;
}};
DES.pensee = {h:40, w:22, n:[2, 4], d:'petit', pal:['#ffd84a', '#9d6ee3', '#ef7fa8', '#f08a3c', '#e8ecff'], art:function(o){
  var pos = [[0, -30], [-13, -21], [13, -23], [-4, -14]], s = herbeTouffe(12);
  for(var i = 0; i < o.n; i++){
    var x = pos[i][0], y = pos[i][1], c = o.c;
    s += Tr('M' + f1(x * 0.3) + ',0 Q' + f1(x * 0.4) + ',' + f1(y / 2) + ' ' + x + ',' + y, '#3f8a4a', 1.8) +
      El(x - 4, y - 4, 4.5, 5, fonce(c, 0.2), 1.3) + El(x + 4, y - 4, 4.5, 5, fonce(c, 0.2), 1.3) + El(x - 5, y + 2, 4.5, 4, c, 1.3) + El(x + 5, y + 2, 4.5, 4, c, 1.3) + El(x, y + 5, 5, 4, c, 1.3) +
      Ci(x, y + 1, 2.4, '#3a2a5a', 0) + Ci(x, y + 1, 1, '#f6d23a', 0);
  }
  if(o.d) s += El(-15, -6, 4.6, 3.8, '#e5484d', 1.3) + Ci(-16, -6, 1, K, 0) + Ci(-13.5, -5, 1, K, 0);
  return s;
}};
DES.feuillage = {h:46, w:22, n:[2, 4], d:'petit', pal:VERTS, art:function(o){
  var n = o.n, s = Tr('M0,0 V' + (-(n * 10 + 6)), '#3f7a3a', 2.4), c = o.c, pointu = (o.v || 0) % 2;
  for(var i = 0; i < n; i++){
    var y = -8 - i * 10, l = 16 - i * 2;
    s += pointu ? Pa('M0,' + y + ' L' + (-l * 0.4) + ',' + (y - 6) + ' L' + (-l * 0.6) + ',' + (y - 3) + ' L' + (-l) + ',' + (y - 6) + ' L' + (-l * 0.8) + ',' + (y + 1) + ' Z', c, 1.5) + Pa('M0,' + y + ' L' + (l * 0.4) + ',' + (y - 6) + ' L' + (l * 0.6) + ',' + (y - 3) + ' L' + l + ',' + (y - 6) + ' L' + (l * 0.8) + ',' + (y + 1) + ' Z', fonce(c, 0.1), 1.5)
      : Pa('M0,' + y + ' C' + (-l * 0.4) + ',' + (y - 9) + ' ' + (-l) + ',' + (y - 6) + ' ' + (-l) + ',' + (y - 2) + ' C' + (-l * 0.6) + ',' + (y + 2) + ' ' + (-l * 0.2) + ',' + (y + 1) + ' 0,' + y + ' Z', c, 1.5) + Pa('M0,' + y + ' C' + (l * 0.4) + ',' + (y - 9) + ' ' + l + ',' + (y - 6) + ' ' + l + ',' + (y - 2) + ' C' + (l * 0.6) + ',' + (y + 2) + ' ' + (l * 0.2) + ',' + (y + 1) + ' 0,' + y + ' Z', fonce(c, 0.1), 1.5);
  }
  if(o.d) s += Ci(-4, -(n * 10 + 8), 3.4, '#ffffff', 1.3) + Ci(4, -(n * 10 + 9), 3.4, '#ffffff', 1.3) + Ci(0, -(n * 10 + 14), 3.4, '#ffffff', 1.3);
  return s;
}};
DES.racine = {h:32, w:26, asym:true, d:'petit', pal:['#9b6a3c', '#c9a27a', '#7a4a2a', '#b0785a'], art:function(o){
  var c = o.c;
  return Pa('M-24,-4 C-18,-14 -6,-18 4,-16 C14,-20 22,-14 25,-6 C20,-8 16,-6 12,-8 C8,-2 0,-2 -4,-6 C-10,-2 -18,-2 -24,-4 Z', c) +
    Tr('M-20,-4 C-24,2 -26,6 -30,6 M10,-7 C14,0 18,2 22,4 M-2,-5 C-2,2 -6,6 -8,8', K, 4.4) + Tr('M-20,-4 C-24,2 -26,6 -30,6 M10,-7 C14,0 18,2 22,4 M-2,-5 C-2,2 -6,6 -8,8', c, 2.4) +
    Tr('M-14,-10 C-8,-12 -2,-12 4,-11 M8,-14 C12,-15 16,-13 18,-11', fonce(c, 0.3), 1.4) + Om('M25,-6 C20,-8 16,-6 12,-8 C8,-2 0,-2 -4,-6 C4,-8 14,-10 25,-6 Z', 0.2) +
    (o.d ? Tr('M4,-16 C4,-22 6,-26 8,-28', '#3f8a4a', 1.8) + Pa('M8,-28 C14,-32 17,-28 15,-25 C11,-25 9,-26 8,-28 Z', '#5fbf5a', 1.4) : '');
}};
DES.miel = {h:42, w:18, d:'gros', pal:['#f3c13e', '#e8963a', '#f6e07a', '#c9822a'], art:function(o){
  var c = o.c;
  return (o.d ? Tr('M4,-30 L16,-46', K, 4) + Tr('M4,-30 L16,-46', '#c98450', 2.2) + El(17, -47, 3.5, 4.5, '#c98450', 1.6, ' transform="rotate(35 17 -47)"') : '') +
    Pa('M-14,-26 C-18,-16 -16,-4 -10,0 L10,0 C16,-4 18,-16 14,-26 Z', '#d29a5e') + Om('M14,-26 C18,-16 16,-4 10,0 L5,0 C9,-8 10,-18 8,-26 Z', 0.2) +
    Pa('M-14,-26 L14,-26 L14,-22 C12,-18 10,-22 8,-20 C6,-14 4,-14 3,-20 C1,-22 -2,-22 -4,-18 C-6,-14 -8,-16 -8,-21 C-10,-22 -13,-20 -14,-22 Z', c, 1.6) +
    Re(-16, -31, 32, 6, 2.5, '#efe4cc', 2) + Tr('M-14,-26 h28', '#c94a3a', 2.2) + Br('M-10,-14 C-10,-9 -9,-6 -7,-4', 1.8, 0.45);
}};
DES.fleurRare = {h:58, w:22, n:[1, 2], d:'petit', pal:LUEURS, art:function(o){
  var c = o.c, pos = [[0, 1], [-15, 0.7]], s = '';
  for(var i = o.n - 1; i >= 0; i--){ var x = pos[i][0], k = pos[i][1];
    s += '<g transform="translate(' + x + ',0) scale(' + k + ')">' + Halo(0, -42, 22, 18, c, 0.35) + Tr('M0,0 C-2,-14 4,-26 0,-36', '#3f8a4a', 2.4) +
      Pa('M0,-14 C-8,-20 -14,-16 -14,-12 C-8,-10 -4,-11 0,-14 Z', '#5fbf5a', 1.4) +
      Pa('M-11,-38 C-14,-50 -6,-56 0,-48 C6,-56 14,-50 11,-38 C6,-34 -6,-34 -11,-38 Z', c) + Pa('M-4,-40 C-4,-46 4,-46 4,-40 Z', clair(c, 0.55), 1.2) +
      Ci(-3, -48, 1.4, '#ffffff', 0) + '</g>'; }
  if(o.d) s += etincelle(14, -50, 5, '#ffffff') + etincelle(-18, -30, 4, '#ffffff');
  return s;
}};
