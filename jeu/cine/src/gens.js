/* gens.js — LE MAIRE, SILAS ET LES GARDES, vus de face, pour la fin (Bible §13.45). Mêmes pantins que Léo (pantin.js).
   Le maire (Monsieur Grosbec, le dessin du village en plus détaillé) : chauve, des touffes grises sur les côtés et des favoris,
   un nez en bec, les yeux plissés, un trop grand sourire ; la redingote violette à boutons de laiton, le gilet, la cravate rouge,
   l'écharpe de maire dorée à bande rouge et sa médaille, des gants gris — et dessous, une bague en argent à tête de corbeau.
   Silas, le garde champêtre : le képi vert à bouton de laiton, la moustache, la veste verte. Les gardes de la mairie : un casque
   à bord, une cotte de mailles, un tabard violet et or, un bouclier rond à la lanterne dorée, une lance.

   Gens.dessin(type, pose, o) — type : 'maire' | 'silas' | 'garde' ; o : {lanterne (0 → 1 : allumée), gants (1 : les deux ;
   0,5 : la main droite nue ; 0 : aucun), bague, variante (pour les gardes : 0 à 5), bouclier, lance:{a (angle), bas (0 → 1 : pointée)}} */
(function(){
'use strict';
var U = window.CU, PT = window.Pantin, M = PT.M, O = '#1a0e08', OL = 2.6;
var G = window.Gens = {};
function f(n){ return Math.round(n * 10) / 10; }
var idn = 0;

G.D = {
  maire:{taille:[0, -232], hanche:[34, 30], epaule:[70, -134], cou:[0, -158], bras:84, avant:78, cuisse:94, tibia:108},
  silas:{taille:[0, -250], hanche:[32, 30], epaule:[72, -142], cou:[0, -166], bras:88, avant:82, cuisse:104, tibia:116},
  garde:{taille:[0, -256], hanche:[34, 30], epaule:[78, -144], cou:[0, -166], bras:90, avant:84, cuisse:106, tibia:120}
};
var C = {
  peau:{maire:['#ffe2c4', '#f0bf98', '#cf9470', '#9a6448'], silas:['#f6d0a8', '#e0a878', '#b87850', '#7e4e30'],
    garde:[['#ffd9b0', '#f2b07e', '#cf8152', '#9a5532'], ['#e8b88c', '#c99064', '#9a6440', '#6a4228'], ['#c48a5c', '#a06a40', '#7a4a2a', '#4e2e18'], ['#ffe0c0', '#f0bc94', '#c8906a', '#94604a'], ['#9a6440', '#7a4a2a', '#5a3218', '#3a1e0c'], ['#f2c8a0', '#d8a07a', '#b07a52', '#7a5032']]},
  trait:'#7a4428', redingote:['#4a4280', '#2f2a52', '#1c1834'], gilet:['#c9a040', '#9a7428', '#5a4214'], chemise:['#ffffff', '#e4e4ee', '#b4b4c4'],
  cravate:['#e04a4a', '#a8282a'], echarpe:['#ffe9a0', '#e8b84a', '#a87a1e'], gant:['#c4c2ce', '#9a98a6', '#6a6876'], noir:['#4a4650', '#26232c', '#121016'],
  vert:['#5a9a5a', '#3a6a3a', '#22422a'], kaki:['#d8c8a0', '#b8a478', '#7e6c48'], brun:['#8a6a48', '#5e4630', '#3a2a1a'],
  acier:['#ffffff', '#d4dae4', '#8e98a8', '#4e5666'], maille:['#9aa2b0', '#6e7684', '#40464f'], tabard:['#5a4a9a', '#3a2f6a', '#221c40'], or:['#fff0b0', '#e0b050', '#9a6a1e'],
  bois:['#b08050', '#7a5230', '#4a3018'], cuir:['#8a5a34', '#5c3a20', '#33200f']
};
function lin(id, l, x1, y1, x2, y2){ return '<linearGradient id="' + id + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '">' + l.map(function(c, k){ return '<stop offset="' + (k / (l.length - 1)).toFixed(2) + '" stop-color="' + c + '"/>'; }).join('') + '</linearGradient>'; }
function rad(id, l, cx, cy, r){ return '<radialGradient id="' + id + '" cx="' + cx + '" cy="' + cy + '" r="' + r + '">' + l.map(function(c, k){ return '<stop offset="' + (k / (l.length - 1)).toFixed(2) + '" stop-color="' + c + '"/>'; }).join('') + '</radialGradient>'; }
function X(l){ return [l[2], l[1], l[0], l[1], l[2]]; }
G.defs = function(){
  var d = '';
  d += rad('gPeauMaire', C.peau.maire, .5, .38, .72) + lin('gPeauMaireX', X(C.peau.maire), 0, 0, 1, 0);
  d += rad('gPeauSilas', C.peau.silas, .5, .38, .72) + lin('gPeauSilasX', X(C.peau.silas), 0, 0, 1, 0);
  C.peau.garde.forEach(function(p, k){ d += rad('gPeauG' + k, p, .5, .38, .72) + lin('gPeauGX' + k, X(p), 0, 0, 1, 0); });
  d += lin('gRedX', X(C.redingote), 0, 0, 1, 0) + lin('gRed', C.redingote, .5, 0, .5, 1) + lin('gGilet', C.gilet, .3, 0, .7, 1) + lin('gChemise', C.chemise, .5, 0, .5, 1);
  d += lin('gCravate', C.cravate, .5, 0, .5, 1) + lin('gEcharpe', C.echarpe, .2, 0, .8, 1) + lin('gGant', C.gant, .8, 0, .2, 1) + lin('gNoirX', X(C.noir), 0, 0, 1, 0);
  d += lin('gVertX', X(C.vert), 0, 0, 1, 0) + lin('gVert', C.vert, .5, 0, .5, 1) + lin('gKaki', C.kaki, .5, 0, .5, 1) + lin('gBrunX', X(C.brun), 0, 0, 1, 0);
  d += lin('gAcier', C.acier, .2, 0, .8, 1) + lin('gAcierX', X(C.acier), 0, 0, 1, 0) + lin('gMailleX', X(C.maille), 0, 0, 1, 0) + lin('gTabardX', X(C.tabard), 0, 0, 1, 0);
  d += lin('gOr', C.or, .2, 0, .8, 1) + lin('gBois', C.bois, 0, .5, 1, .5) + lin('gCuir', C.cuir, .5, 0, .5, 1) + rad('gBouclier', ['#6a5aaa', '#4a3c84', '#2a2250'], .4, .35, .8);
  d += '<pattern id="gMailles" width="6" height="5" patternUnits="userSpaceOnUse"><circle cx="3" cy="2.5" r="2.1" fill="none" stroke="#2a2e36" stroke-width=".9" opacity=".7"/></pattern>';
  d += rad('gLanterne', ['#fff8d0', '#ffd27a', '#ff9a30', 'rgba(255,140,40,0)'], .5, .5, .5);
  d += rad('insertLueur', ['rgba(255,200,120,.18)', 'rgba(20,10,30,.55)'], .55, .45, .75);
  (G.DEFS_PLUS || []).forEach(function(fn){ d += fn(); });
  return d;
};

/* ---------------------------------------------------------------- UN VISAGE (repère : le bas du cou) */
function visage(T, v, o, uid){
  v = v || {};
  var so = v.sourcils || {}, ye = v.yeux || {}, bo = v.bouche || {}, ht = v.ht || 0, dx = ht * 4;
  var peau = T.peauId, P = T.peau, s = '';
  var jaw = U.clamp((bo.o || 0) * 10 + (bo.cri || 0) * 5, 0, 16);
  /* les oreilles */
  [1, -1].forEach(function(sg){
    var ox = sg * (T.l - 1 - sg * ht * 2);
    s += '<path d="M' + f(ox - sg * 2) + ' ' + f(T.oy - 12) + ' C ' + f(ox + sg * 10) + ' ' + f(T.oy - 18) + ' ' + f(ox + sg * 13) + ' ' + f(T.oy + 4) + ' ' + f(ox + sg * 4) + ' ' + f(T.oy + 10) + ' L ' + f(ox - sg * 2) + ' ' + f(T.oy + 6) + ' Z" fill="' + P[1] + '" stroke="' + O + '" stroke-width="2.2"/>';
  });
  /* la tête */
  var l = T.l, h = T.h, rond = T.rond || 0;
  s += '<path d="M-12 ' + f(-20 + jaw) + ' C ' + f(-l + 6 - rond * 4) + ' ' + f(-22 + jaw * .8 + rond * 4) + ' ' + f(-l - rond * 4) + ' ' + f(-34 + jaw * .4 + rond * 2) + ' ' + f(-l - rond * 2) + ' -48 L ' + f(-l) + ' ' + f(-h * .62) + ' C ' + f(-l) + ' ' + f(-h * .86) + ' ' + f(-l * .7) + ' ' + f(-h) + ' 0 ' + f(-h - 2) +
    ' C ' + f(l * .7) + ' ' + f(-h) + ' ' + f(l) + ' ' + f(-h * .86) + ' ' + f(l) + ' ' + f(-h * .62) + ' L ' + f(l + rond * 2) + ' -48 C ' + f(l + rond * 4) + ' ' + f(-34 + jaw * .4 + rond * 2) + ' ' + f(l - 6 + rond * 4) + ' ' + f(-22 + jaw * .8 + rond * 4) + ' 12 ' + f(-20 + jaw) + ' C 6 ' + f(-16 + jaw) + ' -6 ' + f(-16 + jaw) + ' -12 ' + f(-20 + jaw) + ' Z" fill="url(#' + peau + ')" stroke="' + O + '" stroke-width="' + OL + '"/>';
  if(rond) s += '<path d="M-16 ' + f(-18 + jaw) + ' C -8 ' + f(-12 + jaw) + ' 8 ' + f(-12 + jaw) + ' 16 ' + f(-18 + jaw) + '" fill="none" stroke="' + T.trait + '" stroke-width="1.6" opacity=".6"/>';
  /* les rides (le maire) : le front, la patte-d'oie, le double menton */
  if(T.rides) s += '<path d="M' + f(-16 + dx) + ' -80 C ' + f(-6 + dx) + ' -83 ' + f(6 + dx) + ' -83 ' + f(16 + dx) + ' -80 M' + f(-12 + dx) + ' -86 C ' + f(-4 + dx) + ' -88 ' + f(4 + dx) + ' -88 ' + f(12 + dx) + ' -86" fill="none" stroke="' + T.trait + '" stroke-width="1.3" opacity=".55"/>' +
    '<path d="M' + f(-20 + dx) + ' -40 C ' + f(-24 + dx) + ' -32 ' + f(-22 + dx) + ' -26 ' + f(-18 + dx) + ' -22 M' + f(20 + dx) + ' -40 C ' + f(24 + dx) + ' -32 ' + f(22 + dx) + ' -26 ' + f(18 + dx) + ' -22" fill="none" stroke="' + T.trait + '" stroke-width="1.5" opacity=".6"/>';
  /* le haut : chauve qui brille, ou des cheveux */
  if(T.chauve) s += '<ellipse cx="' + f(-8 + dx) + '" cy="' + f(-h + 16) + '" rx="13" ry="7" fill="#fff" opacity=".5"/>';
  /* les joues */
  s += '<ellipse cx="' + f(-l * .55 + dx) + '" cy="-50" rx="9" ry="5.5" fill="#f08a7a" opacity="' + f(T.joues || .2) + '"/><ellipse cx="' + f(l * .55 + dx) + '" cy="-50" rx="9" ry="5.5" fill="#f08a7a" opacity="' + f(T.joues || .2) + '"/>';
  /* les yeux */
  [-1, 1].forEach(function(sg){
    var cx = sg * T.ex + dx, cy = T.ey, op = U.clamp((ye.o == null ? 1 : ye.o) * (1 - (ye.cl || 0)), 0, 1.5) * (T.plisse ? .7 : 1);
    var col = so.f || 0, peur = so.l || 0, tri = so.t || 0;
    var hi = 6.4 * op, hb = 2.8 * Math.min(op, 1.1) + peur;
    var inX = cx - sg * 7.5, outX = cx + sg * 8;
    var hIn = hi * (1 - col * .5 + tri * .1), hOut = hi * (1 - tri * .4);
    var id = 'go' + uid + (sg > 0 ? 'd' : 'g');
    var forme = 'M' + f(inX) + ' ' + f(cy) + ' C ' + f(inX + sg * 3) + ' ' + f(cy - hIn) + ' ' + f(outX - sg * 4) + ' ' + f(cy - hOut) + ' ' + f(outX) + ' ' + f(cy) + ' C ' + f(outX - sg * 4) + ' ' + f(cy + hb) + ' ' + f(inX + sg * 3) + ' ' + f(cy + hb) + ' ' + f(inX) + ' ' + f(cy) + ' Z';
    if(op > .08){
      var lx = cx + (ye.lx || 0) * 2.8, ly = cy - .4 + (ye.ly || 0) * 1.8;
      s += '<clipPath id="' + id + '"><path d="' + forme + '"/></clipPath><path d="' + forme + '" fill="#fbf6ee"/><g clip-path="url(#' + id + ')"><circle cx="' + f(lx) + '" cy="' + f(ly) + '" r="4.2" fill="' + T.iris + '"/><circle cx="' + f(lx) + '" cy="' + f(ly) + '" r="1.9" fill="#0a0a10"/><circle cx="' + f(lx + 1.3) + '" cy="' + f(ly - 1.4) + '" r="1.1" fill="#fff"/></g>';
    }
    s += '<path d="M' + f(inX - sg * .5) + ' ' + f(cy + .3) + ' C ' + f(inX + sg * 3) + ' ' + f(cy - hIn) + ' ' + f(outX - sg * 4) + ' ' + f(cy - hOut) + ' ' + f(outX + sg * 1.4) + ' ' + f(cy + .4) + '" fill="none" stroke="' + O + '" stroke-width="2.4" stroke-linecap="round"/>';
    if(T.cils && op > .2) s += '<path d="M' + f(outX) + ' ' + f(cy - 1) + ' l ' + f(sg * 5) + ' -4 M' + f(outX - sg * 3) + ' ' + f(cy - hOut * .7) + ' l ' + f(sg * 3.5) + ' -4.5" fill="none" stroke="' + O + '" stroke-width="1.8" stroke-linecap="round"/>';
    if(T.plisse) s += '<path d="M' + f(outX + sg * 1) + ' ' + f(cy + 1) + ' l ' + f(sg * 5) + ' -2 M' + f(outX + sg * 1) + ' ' + f(cy + 3) + ' l ' + f(sg * 5) + ' 2" stroke="' + T.trait + '" stroke-width="1.1" opacity=".7"/>';
    /* le sourcil */
    var bInY = cy - 9 + col * 5 - peur * 6 - tri * 6, bOutY = cy - 12 - col * 2 - peur * 5 + tri * 3;
    s += '<path d="M' + f(cx - sg * 7) + ' ' + f(bInY) + ' C ' + f(cx - sg * 2) + ' ' + f((bInY + bOutY) / 2 - 4) + ' ' + f(cx + sg * 4) + ' ' + f((bInY + bOutY) / 2 - 4) + ' ' + f(cx + sg * 10) + ' ' + f(bOutY) + '" fill="none" stroke="' + T.sourcil + '" stroke-width="' + (T.sourcilE || 4) + '" stroke-linecap="round"/>';
  });
  /* le nez */
  var nx = ht * 6;
  if(T.nez === 'bec'){
    s += '<path d="M' + f(-3 + nx) + ' -70 C ' + f(-2 + nx) + ' -62 ' + f(4 + nx) + ' -54 ' + f(12 + nx) + ' -44 C ' + f(15 + nx) + ' -38 ' + f(10 + nx) + ' -33 ' + f(3 + nx) + ' -36 C ' + f(-2 + nx) + ' -34 ' + f(-8 + nx) + ' -36 ' + f(-9 + nx) + ' -41 C ' + f(-9 + nx) + ' -44 ' + f(-6 + nx) + ' -45 ' + f(-4 + nx) + ' -44" fill="' + P[1] + '" stroke="' + O + '" stroke-width="2.2" stroke-linejoin="round"/>' +
      '<ellipse cx="' + f(4 + nx) + '" cy="-52" rx="2.4" ry="5" fill="#fff" opacity=".45" transform="rotate(-30 ' + f(4 + nx) + ' -52)"/>';
  } else if(T.nez === 'rond'){
    s += '<path d="M' + f(-3 + nx) + ' -62 C ' + f(-5 + nx) + ' -54 ' + f(-11 + nx) + ' -50 ' + f(-10 + nx) + ' -44 C ' + f(-9 + nx) + ' -38 ' + f(-3 + nx) + ' -38 ' + f(nx) + ' -40 C ' + f(3 + nx) + ' -38 ' + f(9 + nx) + ' -38 ' + f(10 + nx) + ' -44 C ' + f(11 + nx) + ' -48 ' + f(8 + nx) + ' -51 ' + f(6 + nx) + ' -52" fill="' + P[1] + '" stroke="' + O + '" stroke-width="2" stroke-linejoin="round"/>' +
      '<ellipse cx="' + f(-2 + nx) + '" cy="-46" rx="3" ry="2" fill="#fff" opacity=".4"/>';
  } else if(T.nez === 'fin'){
    s += '<path d="M' + f(-1 + nx) + ' -62 C ' + f(-2 + nx) + ' -54 ' + f(-5 + nx) + ' -49 ' + f(-5 + nx) + ' -46 C ' + f(-5 + nx) + ' -43 ' + f(-2 + nx) + ' -42 ' + f(nx) + ' -43 C ' + f(2 + nx) + ' -42 ' + f(5 + nx) + ' -43 ' + f(5 + nx) + ' -46" fill="none" stroke="' + T.trait + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
  } else {
    s += '<path d="M' + f(-2 + nx) + ' -64 C ' + f(-4 + nx) + ' -56 ' + f(-8 + nx) + ' -50 ' + f(-8 + nx) + ' -46 C ' + f(-8 + nx) + ' -42 ' + f(-3 + nx) + ' -41 ' + f(nx) + ' -42 C ' + f(3 + nx) + ' -41 ' + f(8 + nx) + ' -42 ' + f(8 + nx) + ' -46" fill="' + P[1] + '" stroke="' + O + '" stroke-width="2" stroke-linejoin="round"/>';
  }
  /* la bouche */
  var o2 = U.clamp(bo.o || 0, 0, 1.2), c = bo.c == null ? (T.sourire || 0) : bo.c, w0 = (T.bw || 13) * (1 + .3 * (bo.w || 0) + .25 * Math.max(0, c) * (T.sourire ? 1 : 0)), cy2 = -28;
  var yc = cy2 - 4 * c + 2 * o2, yu = cy2 - 1 - 1.5 * o2, yl = cy2 + 1 + 10 * o2 + 4 * (bo.cri || 0) + Math.max(0, c) * 3 * (T.dentsSourire ? 1 : 0);
  if(o2 < .06 && !(T.dentsSourire && c > .4)){
    s += '<path d="M' + f(-w0 + dx) + ' ' + f(yc) + ' C ' + f(-w0 * .4 + dx) + ' ' + f(cy2 + c * 2) + ' ' + f(w0 * .4 + dx) + ' ' + f(cy2 + c * 2) + ' ' + f(w0 + dx) + ' ' + f(yc) + '" fill="none" stroke="' + O + '" stroke-width="2.3" stroke-linecap="round"/>';
  } else {
    var idb = 'gb' + uid, forme2 = 'M' + f(-w0 + dx) + ' ' + f(yc) + ' C ' + f(-w0 * .5 + dx) + ' ' + f(yu) + ' ' + f(w0 * .5 + dx) + ' ' + f(yu) + ' ' + f(w0 + dx) + ' ' + f(yc) + ' C ' + f(w0 * .6 + dx) + ' ' + f(yl + 2) + ' ' + f(-w0 * .6 + dx) + ' ' + f(yl + 2) + ' ' + f(-w0 + dx) + ' ' + f(yc) + ' Z';
    s += '<clipPath id="' + idb + '"><path d="' + forme2 + '"/></clipPath><path d="' + forme2 + '" fill="#3a0c0a"/><g clip-path="url(#' + idb + ')">' +
      '<rect x="' + f(-w0 + dx) + '" y="' + f(yu - 2) + '" width="' + f(w0 * 2) + '" height="' + f(T.dentsSourire && c > .4 ? 7 : 4.5) + '" fill="#fbf6e8"/>' +
      (T.dentsSourire && c > .4 ? '<path d="' + [-.6, -.3, 0, .3, .6].map(function(k){ return 'M' + f(w0 * k + dx) + ' ' + f(yu - 2) + ' l 0 7'; }).join(' ') + '" stroke="#b8b0a0" stroke-width=".9"/>' : '') +
      '<rect x="' + f(-w0 + dx) + '" y="' + f(yl - 3) + '" width="' + f(w0 * 2) + '" height="5" fill="#ece2d0"/></g>' +
      '<path d="' + forme2 + '" fill="none" stroke="' + O + '" stroke-width="2.2" stroke-linejoin="round"/>';
  }
  /* la barbe, la moustache, les favoris, les cheveux */
  if(T.moustache) s += '<path d="M' + f(-2 + dx) + ' -36 C ' + f(-8 + dx) + ' -38 ' + f(-18 + dx) + ' -36 ' + f(-22 + dx) + ' -28 C ' + f(-14 + dx) + ' -31 ' + f(-6 + dx) + ' -31 ' + f(dx) + ' -33 C ' + f(6 + dx) + ' -31 ' + f(14 + dx) + ' -31 ' + f(22 + dx) + ' -28 C ' + f(18 + dx) + ' -36 ' + f(8 + dx) + ' -38 ' + f(2 + dx) + ' -36 Z" fill="' + T.poil + '" stroke="' + O + '" stroke-width="1.8"/>';
  if(T.barbe) s += '<path d="M' + f(-l + 2) + ' -46 C ' + f(-l + 2) + ' ' + f(-26 + jaw) + ' -14 ' + f(-6 + jaw) + ' 0 ' + f(-4 + jaw) + ' C 14 ' + f(-6 + jaw) + ' ' + f(l - 2) + ' ' + f(-26 + jaw) + ' ' + f(l - 2) + ' -46 C ' + f(l - 10) + ' -36 ' + f(l - 16) + ' -30 12 -24 C 6 -20 -6 -20 -12 -24 C ' + f(-l + 16) + ' -30 ' + f(-l + 10) + ' -36 ' + f(-l + 2) + ' -46 Z" fill="' + T.poil + '" stroke="' + O + '" stroke-width="2"/>';
  if(T.favoris) [1, -1].forEach(function(sg){ s += '<path d="M' + f(sg * (l - 1)) + ' -78 C ' + f(sg * (l + 5)) + ' -64 ' + f(sg * (l + 4)) + ' -44 ' + f(sg * (l - 4)) + ' -34 C ' + f(sg * (l - 10)) + ' -42 ' + f(sg * (l - 8)) + ' -60 ' + f(sg * (l - 6)) + ' -76 Z" fill="' + T.poil + '" stroke="' + O + '" stroke-width="1.8"/>'; });
  if(T.touffes) [1, -1].forEach(function(sg){ s += '<path d="M' + f(sg * (l - 6)) + ' ' + f(-h * .8) + ' C ' + f(sg * (l + 10)) + ' ' + f(-h * .9) + ' ' + f(sg * (l + 16)) + ' ' + f(-h * .66) + ' ' + f(sg * (l + 10)) + ' ' + f(-h * .52) + ' C ' + f(sg * (l + 16)) + ' ' + f(-h * .46) + ' ' + f(sg * (l + 10)) + ' ' + f(-h * .36) + ' ' + f(sg * (l + 2)) + ' ' + f(-h * .4) + ' C ' + f(sg * (l - 2)) + ' ' + f(-h * .5) + ' ' + f(sg * (l - 4)) + ' ' + f(-h * .66) + ' ' + f(sg * (l - 6)) + ' ' + f(-h * .8) + ' Z" fill="' + T.poil + '" stroke="' + O + '" stroke-width="2"/>'; });
  if(T.plus) s += T.plus(v, {dx:dx, jaw:jaw, ht:ht, l:l, h:h});
  if(T.cheveux) s += '<path d="M' + f(-l - 1) + ' ' + f(-h * .66) + ' C ' + f(-l - 2) + ' ' + f(-h - 8) + ' ' + f(l + 2) + ' ' + f(-h - 8) + ' ' + f(l + 1) + ' ' + f(-h * .66) + ' C ' + f(l - 8) + ' ' + f(-h * .82) + ' ' + f(-l + 8) + ' ' + f(-h * .82) + ' ' + f(-l - 1) + ' ' + f(-h * .66) + ' Z" fill="' + T.poil + '" stroke="' + O + '" stroke-width="2.2"/>';
  return s;
}
var TETES = {
  maire:{l:34, h:96, rond:1, oy:-58, ex:13, ey:-62, iris:'#7a8a9a', nez:'bec', plisse:true, sourire:.9, dentsSourire:true, bw:16, chauve:true, touffes:true, favoris:true,
    poil:'#c8c8d4', sourcil:'#9a9aa8', joues:.32, trait:'#9a6448', peauId:'gPeauMaire', peau:C.peau.maire, rides:true},
  silas:{l:31, h:92, oy:-58, ex:13, ey:-62, iris:'#5a6a7a', nez:'droit', moustache:true, cheveux:true, poil:'#2a2228', sourcil:'#2a2228', sourcilE:4.6, joues:.12, trait:'#7e4e30', peauId:'gPeauSilas', peau:C.peau.silas}
};
function teteGarde(k){
  var poils = ['#6a4a2a', '#2a2228', '#1a1410', '#c8a060', '#3a2a1a', '#8a5a30'];
  return {l:32, h:94, oy:-58, ex:13, ey:-62, iris:['#5a7aa0', '#6a5a3a', '#3a2a1a', '#4a7a6a', '#2a1a10', '#6a6a7a'][k], nez:'droit', moustache:k % 2 === 0, barbe:k === 1 || k === 4,
    poil:poils[k], sourcil:poils[k], sourcilE:4.4, joues:.1, trait:C.peau.garde[k][3], peauId:'gPeauG' + k, peau:C.peau.garde[k]};
}

/* ---------------------------------------------------------------- LES PIÈCES DES TROIS */
function piecesMaire(o){
  return {
    buste:function(){
      /* la redingote, ouverte sur le gilet doré, la chemise et la cravate ; le ventre rond */
      return '<path d="M-62 4 C -76 -20 -80 -60 -72 -96 C -70 -112 -66 -126 -60 -134 C -44 -144 -30 -150 -22 -158 L 22 -158 C 30 -150 44 -144 60 -134 C 66 -126 70 -112 72 -96 C 80 -60 76 -20 62 4 Z" fill="url(#gRedX)" stroke="' + O + '" stroke-width="' + OL + '"/>' +
        '<path d="M-20 -156 L 20 -156 L 30 -120 C 40 -80 42 -40 34 4 L -34 4 C -42 -40 -40 -80 -30 -120 Z" fill="url(#gGilet)" stroke="' + O + '" stroke-width="2.2"/>' +
        '<g fill="url(#gOr)" stroke="' + O + '" stroke-width="1.4">' + [-104, -80, -56, -32].map(function(y){ return '<circle cx="0" cy="' + y + '" r="3.6"/>'; }).join('') + '</g>' +
        '<path d="M-18 -158 L 0 -126 L 18 -158 Z" fill="url(#gChemise)" stroke="' + O + '" stroke-width="2"/>' +
        '<path d="M-7 -152 L 7 -152 L 4 -140 L 9 -112 L 0 -102 L -9 -112 L -4 -140 Z" fill="url(#gCravate)" stroke="' + O + '" stroke-width="1.8"/>' +
        /* les revers */
        '<path d="M-22 -158 L -34 -120 C -38 -90 -40 -60 -38 -30 L -48 -40 C -50 -80 -46 -120 -30 -156 Z M22 -158 L 34 -120 C 38 -90 40 -60 38 -30 L 48 -40 C 50 -80 46 -120 30 -156 Z" fill="#3a3466" stroke="' + O + '" stroke-width="2"/>' +
        '<g fill="url(#gOr)" stroke="' + O + '" stroke-width="1.4"><circle cx="-46" cy="-24" r="4.2"/><circle cx="-48" cy="-6" r="4.2"/><circle cx="46" cy="-24" r="4.2"/><circle cx="48" cy="-6" r="4.2"/></g>' +
        /* l'écharpe de maire : de l'épaule droite de l'image à la hanche gauche, dorée à bande rouge, la médaille */
        '<path d="M50 -140 L 66 -128 L -50 6 L -66 -6 Z" fill="url(#gEcharpe)" stroke="' + O + '" stroke-width="2.2"/><path d="M58 -134 L -58 0" stroke="#c0302a" stroke-width="4"/>' +
        '<circle cx="-54" cy="8" r="11" fill="url(#gOr)" stroke="' + O + '" stroke-width="2"/><circle cx="-54" cy="8" r="5" fill="#c0302a" stroke="' + O + '" stroke-width="1.2"/>' +
        /* le cou (court, un double menton) */
        '<path d="M-22 -150 C -22 -162 -20 -172 -18 -178 L 18 -178 C 20 -172 22 -162 22 -150" fill="url(#gPeauMaireX)" stroke="' + O + '" stroke-width="2"/>';
    },
    bassin:function(){
      /* les pans de la redingote, de chaque côté (on voit le pantalon noir au milieu) */
      return '<path d="M-64 -4 C -74 30 -80 70 -84 112 L -40 120 C -36 80 -30 40 -26 -4 Z" fill="url(#gRedX)" stroke="' + O + '" stroke-width="' + OL + '"/>' +
        '<path d="M64 -4 C 74 30 80 70 84 112 L 40 120 C 36 80 30 40 26 -4 Z" fill="url(#gRedX)" stroke="' + O + '" stroke-width="' + OL + '"/>' +
        '<path d="M-30 -4 L 30 -4 L 32 40 L 0 46 L -32 40 Z" fill="url(#gNoirX)" stroke="' + O + '" stroke-width="2"/>' +
        '<path d="M-58 0 C -62 40 -66 80 -66 110 M58 0 C 62 40 66 80 66 110" fill="none" stroke="#1c1834" stroke-width="2" opacity=".7"/>';
    },
    brasHaut:function(){ return '<path d="M-24 -6 C -16 -22 14 -24 24 -8 C 30 20 28 60 22 88 L -20 88 C -26 60 -28 20 -24 -6 Z" fill="url(#gRedX)" stroke="' + O + '" stroke-width="' + OL + '"/><path d="M8 4 C 12 30 12 60 8 84" fill="none" stroke="#1c1834" stroke-width="2" opacity=".6"/>'; },
    avantBras:function(){ return '<path d="M-20 -6 C -22 30 -20 56 -18 74 L 20 74 C 22 56 24 30 20 -6 Z" fill="url(#gRedX)" stroke="' + O + '" stroke-width="' + OL + '"/>' +
      '<path d="M-20 64 L 20 64 L 21 82 L -21 82 Z" fill="url(#gChemise)" stroke="' + O + '" stroke-width="2"/>'; },
    cuisse:function(){ return '<path d="M-24 -8 C -26 30 -24 70 -20 98 L 20 98 C 24 70 26 30 24 -8 Z" fill="url(#gNoirX)" stroke="' + O + '" stroke-width="' + OL + '"/>'; },
    tibia:function(){ return '<path d="M-20 -6 C -21 30 -19 70 -17 100 L 17 100 C 19 70 21 30 20 -6 Z" fill="url(#gNoirX)" stroke="' + O + '" stroke-width="' + OL + '"/><path d="M0 4 L 0 96" stroke="#0a080e" stroke-width="1.6" opacity=".7"/>'; },
    pied:function(){ return '<path d="M-22 -14 C -26 -4 -22 4 -16 5 L 16 5 C 22 4 26 -4 22 -14 Z" fill="url(#gNoirX)" stroke="' + O + '" stroke-width="' + OL + '"/><ellipse cx="-4" cy="-6" rx="8" ry="3" fill="#fff" opacity=".5"/>'; },
    main:function(type, cote){
      var nue = cote === 'D' ? (o.gants == null ? 1 : o.gants) < .75 : (o.gants == null ? 1 : o.gants) < .25;
      return mainHumaine(type, nue ? 'url(#gPeauMaireX)' : 'url(#gGant)', nue && o.bague && cote === 'D');
    },
    tete:'maire',
    /* (le rassemblement, la nuit) son bonnet de nuit : la pointe retombe sur le côté et se balance (o.bonnet : son balancement) */
    chapeau:o.bonnet == null ? null : function(){ return bonnetNuit(o.bonnet); }
  };
}
function bonnetNuit(b){
  var bx = 44 + b * 16, by = -84 + Math.abs(b) * 6;
  return '<g transform="translate(0 -20)">' + bonnet0(b, bx, by) + '</g>';
}
function bonnet0(b, bx, by){
  return '<path d="M-37 -70 C -41 -104 -22 -124 0 -126 C 22 -124 39 -108 37 -70 C 20 -60 -20 -60 -37 -70 Z" fill="#ece6f2" stroke="' + O + '" stroke-width="' + OL + '"/>' +
    '<path d="M6 -124 C 30 -128 48 -116 ' + f(bx + 4) + ' ' + f(by - 18) + ' C ' + f(bx + 8) + ' ' + f(by - 8) + ' ' + f(bx + 4) + ' ' + f(by) + ' ' + f(bx) + ' ' + f(by + 4) + ' C ' + f(bx - 10) + ' ' + f(by - 14) + ' 34 -100 22 -96 Z" fill="#e2dbea" stroke="' + O + '" stroke-width="' + OL + '" stroke-linejoin="round"/>' +
    '<path d="M-20 -112 C -8 -106 8 -106 22 -112 M-28 -98 C -10 -92 10 -92 30 -98" fill="none" stroke="#b8a8d0" stroke-width="3"/>' +
    '<path d="M-38 -76 C -20 -66 20 -66 38 -76 L 38 -66 C 20 -56 -20 -56 -38 -66 Z" fill="#ffffff" stroke="' + O + '" stroke-width="2.2"/>' +
    '<circle cx="' + f(bx) + '" cy="' + f(by + 12) + '" r="11" fill="#ffffff" stroke="' + O + '" stroke-width="2.2"/><path d="M' + f(bx - 5) + ' ' + f(by + 8) + ' l 3 3 M' + f(bx + 3) + ' ' + f(by + 7) + ' l 3 4 M' + f(bx - 2) + ' ' + f(by + 15) + ' l 4 2" stroke="#c8c0d8" stroke-width="1.6"/>';
}
function piecesSilas(){
  return {
    buste:function(){
      return '<path d="M-60 6 C -66 -30 -70 -80 -74 -120 C -70 -136 -48 -146 -24 -164 L 24 -164 C 48 -146 70 -136 74 -120 C 70 -80 66 -30 60 6 Z" fill="url(#gVertX)" stroke="' + O + '" stroke-width="' + OL + '"/>' +
        '<path d="M-16 -162 L 0 -130 L 16 -162 Z" fill="url(#gKaki)" stroke="' + O + '" stroke-width="2"/>' +
        '<path d="M0 -130 L 0 6" stroke="#1a2a1a" stroke-width="2.4"/><g fill="url(#gOr)" stroke="' + O + '" stroke-width="1.2">' + [-112, -84, -56, -28].map(function(y){ return '<circle cx="6" cy="' + y + '" r="3.4"/>'; }).join('') + '</g>' +
        '<rect x="-34" y="-112" width="22" height="16" rx="3" fill="#2e5a2e" stroke="' + O + '" stroke-width="1.6"/><rect x="18" y="-112" width="22" height="16" rx="3" fill="#2e5a2e" stroke="' + O + '" stroke-width="1.6"/>' +
        /* la plaque de garde champêtre */
        '<path d="M-30 -140 L -18 -140 L -18 -128 C -18 -122 -24 -120 -24 -120 C -24 -120 -30 -122 -30 -128 Z" fill="url(#gOr)" stroke="' + O + '" stroke-width="1.4"/>' +
        '<path d="M-62 -6 L 62 -6 L 62 8 L -62 8 Z" fill="url(#gCuir)" stroke="' + O + '" stroke-width="2"/><rect x="-8" y="-9" width="16" height="20" rx="2" fill="url(#gOr)" stroke="' + O + '" stroke-width="1.6"/>' +
        '<path d="M-20 -158 C -20 -170 -18 -178 -16 -184 L 16 -184 C 18 -178 20 -170 20 -158" fill="url(#gPeauSilasX)" stroke="' + O + '" stroke-width="2"/>';
    },
    bassin:function(){ return '<path d="M-58 -4 L 58 -4 C 62 14 62 30 58 44 L 0 52 L -58 44 C -62 30 -62 14 -58 -4 Z" fill="url(#gBrunX)" stroke="' + O + '" stroke-width="' + OL + '"/>'; },
    brasHaut:function(){ return '<path d="M-24 -6 C -16 -22 14 -24 24 -8 C 28 20 26 60 21 92 L -19 92 C -24 60 -28 20 -24 -6 Z" fill="url(#gVertX)" stroke="' + O + '" stroke-width="' + OL + '"/>'; },
    avantBras:function(){ return '<path d="M-19 -6 C -21 30 -19 60 -17 78 L 17 78 C 19 60 21 30 19 -6 Z" fill="url(#gVertX)" stroke="' + O + '" stroke-width="' + OL + '"/><path d="M-18 66 L 18 66" stroke="#1a2a1a" stroke-width="2"/>'; },
    cuisse:function(){ return '<path d="M-26 -8 C -28 30 -26 74 -21 106 L 21 106 C 26 74 28 30 26 -8 Z" fill="url(#gBrunX)" stroke="' + O + '" stroke-width="' + OL + '"/>'; },
    tibia:function(){ return '<path d="M-21 -6 C -22 24 -20 40 -19 50 L 19 50 C 20 40 22 24 21 -6 Z" fill="url(#gBrunX)" stroke="' + O + '" stroke-width="' + OL + '"/><path d="M-22 44 L 22 44 C 23 70 22 96 21 116 L -21 116 C -22 96 -23 70 -22 44 Z" fill="url(#gCuir)" stroke="' + O + '" stroke-width="' + OL + '"/>'; },
    pied:function(){ return '<path d="M-24 -16 C -28 -6 -24 3 -18 5 L 18 5 C 24 3 28 -6 24 -16 Z" fill="url(#gCuir)" stroke="' + O + '" stroke-width="' + OL + '"/>'; },
    main:function(type){ return mainHumaine(type, 'url(#gPeauSilasX)'); },
    tete:'silas', kepi:true
  };
}
function piecesGarde(o){
  var k = (o.variante || 0) % 6;
  return {
    buste:function(){
      return '<path d="M-64 6 C -70 -30 -74 -80 -80 -124 C -74 -140 -50 -150 -26 -166 L 26 -166 C 50 -150 74 -140 80 -124 C 74 -80 70 -30 64 6 Z" fill="url(#gMailleX)" stroke="' + O + '" stroke-width="' + OL + '"/>' +
        '<path d="M-64 6 C -70 -30 -74 -80 -80 -124 C -74 -140 -50 -150 -26 -166 L 26 -166 C 50 -150 74 -140 80 -124 C 74 -80 70 -30 64 6 Z" fill="url(#gMailles)"/>' +
        /* le tabard violet et or, la lanterne dorée de Brumeval */
        '<path d="M-40 -150 L 40 -150 L 46 6 L -46 6 Z" fill="url(#gTabardX)" stroke="' + O + '" stroke-width="2.2"/><path d="M-36 -146 L 36 -146 L 41 2 L -41 2 Z" fill="none" stroke="url(#gOr)" stroke-width="3"/>' +
        '<g transform="translate(0 -84)" stroke="' + O + '" stroke-width="1.6"><path d="M-10 -18 L 10 -18 L 14 -10 L 12 14 L -12 14 L -14 -10 Z" fill="url(#gOr)"/><path d="M-6 -10 L 6 -10 L 7 8 L -7 8 Z" fill="#fff4c0"/><path d="M-6 -18 C -6 -28 6 -28 6 -18" fill="none" stroke="url(#gOr)" stroke-width="3"/></g>' +
        '<path d="M-60 -8 L 60 -8 L 60 6 L -60 6 Z" fill="url(#gCuir)" stroke="' + O + '" stroke-width="2"/>' +
        /* le gorgerin d'acier */
        '<path d="M-30 -168 C -30 -156 -16 -150 0 -150 C 16 -150 30 -156 30 -168 L 22 -178 L -22 -178 Z" fill="url(#gAcier)" stroke="' + O + '" stroke-width="2.2"/>';
    },
    bassin:function(){ return '<path d="M-60 -4 L 60 -4 C 64 14 64 30 60 44 L 0 52 L -60 44 C -64 30 -64 14 -60 -4 Z" fill="url(#gMailleX)" stroke="' + O + '" stroke-width="' + OL + '"/><path d="M-46 -4 L 46 -4 L 40 40 L 0 48 L -40 40 Z" fill="url(#gTabardX)" stroke="' + O + '" stroke-width="2"/>'; },
    brasHaut:function(){ return '<path d="M-26 -8 C -18 -26 16 -28 28 -8 C 30 20 28 60 22 94 L -20 94 C -26 60 -30 20 -26 -8 Z" fill="url(#gMailleX)" stroke="' + O + '" stroke-width="' + OL + '"/><path d="M-26 -8 C -18 -26 16 -28 28 -8 C 30 20 28 60 22 94 L -20 94 C -26 60 -30 20 -26 -8 Z" fill="url(#gMailles)"/>' +
      '<path d="M-28 -10 C -18 -30 18 -32 30 -10 C 34 4 32 14 26 20 C 10 12 -12 12 -28 18 C -32 8 -32 0 -28 -10 Z" fill="url(#gAcier)" stroke="' + O + '" stroke-width="2.2"/>'; },
    avantBras:function(){ return '<path d="M-20 -6 C -22 30 -20 58 -18 76 L 18 76 C 20 58 22 30 20 -6 Z" fill="url(#gMailleX)" stroke="' + O + '" stroke-width="' + OL + '"/><path d="M-21 44 L 21 44 L 22 82 L -22 82 Z" fill="url(#gCuir)" stroke="' + O + '" stroke-width="2.2"/>'; },
    cuisse:function(){ return '<path d="M-27 -8 C -29 30 -27 76 -22 108 L 22 108 C 27 76 29 30 27 -8 Z" fill="url(#gBrunX)" stroke="' + O + '" stroke-width="' + OL + '"/>'; },
    tibia:function(){ return '<path d="M-22 -6 C -23 20 -21 34 -20 44 L 20 44 C 21 34 23 20 22 -6 Z" fill="url(#gBrunX)" stroke="' + O + '" stroke-width="' + OL + '"/><path d="M-23 38 L 23 38 C 24 70 23 100 22 120 L -22 120 C -23 100 -24 70 -23 38 Z" fill="url(#gCuir)" stroke="' + O + '" stroke-width="' + OL + '"/>'; },
    pied:function(){ return '<path d="M-25 -16 C -29 -6 -25 3 -19 5 L 19 5 C 25 3 29 -6 25 -16 Z" fill="url(#gCuir)" stroke="' + O + '" stroke-width="' + OL + '"/>'; },
    main:function(type){ return mainHumaine(type, 'url(#gCuir)'); },
    tete:'garde', casque:true, k:k
  };
}
function mainHumaine(type, peau, bague){
  var s;
  if(type === 'ouvert') s = '<path d="M-12 -2 C -18 8 -19 22 -17 32 L -18 52 C -18 56 -13 56 -12 52 L -10 36 L -8 56 C -7 60 -2 60 -2 56 L -1 37 L 3 58 C 4 62 9 62 9 58 L 7 37 L 11 52 C 12 56 17 55 16 51 L 14 32 C 19 26 22 17 20 8 L 13 -2 Z" fill="' + peau + '" stroke="' + O + '" stroke-width="2" stroke-linejoin="round"/>';
  else if(type === 'pointe') s = '<path d="M-14 0 C -19 10 -19 24 -15 32 C -10 38 10 38 15 32 C 19 24 19 10 14 0 Z" fill="' + peau + '" stroke="' + O + '" stroke-width="2"/><path d="M-4 30 L -5 66 C -5 70 2 70 2 66 L 3 30" fill="' + peau + '" stroke="' + O + '" stroke-width="2"/>';
  else s = '<path d="M-15 0 C -20 9 -20 24 -16 33 C -11 40 11 40 16 33 C 20 24 20 9 15 0 Z" fill="' + peau + '" stroke="' + O + '" stroke-width="2"/><path d="M-14 22 C -7 27 7 27 14 22 M-8 25 L -9 37 M0 26 L 0 38 M8 25 L 9 37" fill="none" stroke="#5a4a40" stroke-width="1.3"/>';
  if(bague) s += '<g transform="translate(-6 46)"><ellipse cx="0" cy="0" rx="5" ry="2.6" fill="none" stroke="#dfe3ee" stroke-width="2.4"/><path d="M-6 -2 C -8 -10 -2 -16 4 -14 C 7 -13 9 -11 10 -9 L 17 -6 L 9 -4 C 7 0 2 2 -3 1 Z" fill="#b9bfd2" stroke="' + O + '" stroke-width="1.2"/><circle cx="4" cy="-9" r="1.6" fill="#e5484d"/></g>';
  return s;
}
/* les chapeaux : le képi de Silas, le casque des gardes (repère : la tête) */
function kepi(o){ var a = (o && o.kepi) || 0; return '<g transform="rotate(' + f(a) + ' 0 -84)">' + kepi0() + '</g>'; }
function kepi0(){ return '<path d="M-30 -84 C -32 -104 -28 -122 -24 -126 L 24 -126 C 28 -122 32 -104 30 -84 Z" fill="url(#gVert)" stroke="' + O + '" stroke-width="' + OL + '"/><path d="M-34 -86 C -20 -78 20 -78 34 -86 L 36 -80 C 20 -70 -20 -70 -36 -80 Z" fill="#1a2a1a" stroke="' + O + '" stroke-width="2"/><circle cx="0" cy="-106" r="5" fill="url(#gOr)" stroke="' + O + '" stroke-width="1.6"/>'; }
function casque(){ return '<path d="M-30 -80 C -34 -108 -18 -124 0 -124 C 18 -124 34 -108 30 -80 Z" fill="url(#gAcier)" stroke="' + O + '" stroke-width="' + OL + '"/><path d="M-50 -82 C -30 -76 30 -76 50 -82 L 46 -72 C 26 -66 -26 -66 -46 -72 Z" fill="url(#gAcierX)" stroke="' + O + '" stroke-width="2.2"/><path d="M0 -124 L 0 -82" stroke="#6a7484" stroke-width="3"/><ellipse cx="-12" cy="-108" rx="7" ry="4" fill="#fff" opacity=".6"/>'; }
/* la lanterne du maire (repère : la main ; elle pend sous la poignée) ; k : allumée */
G.lanterne = function(k){
  return '<g transform="translate(0 30)"><path d="M0 -8 L 0 6" stroke="#2a2a30" stroke-width="3"/><path d="M-10 6 C -10 0 10 0 10 6" fill="none" stroke="#2a2a30" stroke-width="3"/>' +
    '<path d="M-16 8 L 16 8 L 12 16 L -12 16 Z" fill="#3a3a44" stroke="' + O + '" stroke-width="2"/>' +
    '<path d="M-13 16 L 13 16 L 15 56 L -15 56 Z" fill="' + (k > 0 ? '#ffe9a8' : '#3a3420') + '" stroke="' + O + '" stroke-width="2"/>' +
    (k > 0 ? '<path d="M0 30 C -5 36 -4 44 0 46 C 4 44 5 36 0 30 Z" fill="#fff6d0"/>' : '') +
    '<path d="M-13 16 L -15 56 M13 16 L 15 56 M0 16 L 0 56 M-14 36 L 14 36" stroke="#2a2a30" stroke-width="2.4"/>' +
    '<path d="M-18 56 L 18 56 L 14 64 L -14 64 Z" fill="#3a3a44" stroke="' + O + '" stroke-width="2"/></g>';
};
/* la lance (repère : la main droite ; a = l'angle, 0 = debout) et le bouclier (repère : l'avant-bras gauche) */
function lance(){ return '<g><rect x="-4" y="-330" width="8" height="420" rx="3" fill="url(#gBois)" stroke="' + O + '" stroke-width="2"/><path d="M0 -392 L 12 -340 L 6 -330 L -6 -330 L -12 -340 Z" fill="url(#gAcier)" stroke="' + O + '" stroke-width="2"/><path d="M-9 -330 L 9 -330 L 7 -318 L -7 -318 Z" fill="#3a3a44" stroke="' + O + '" stroke-width="1.6"/></g>'; }
function bouclier(){ return '<g><circle r="64" fill="url(#gBouclier)" stroke="' + O + '" stroke-width="3"/><circle r="58" fill="none" stroke="url(#gOr)" stroke-width="5"/><circle r="12" fill="url(#gAcier)" stroke="' + O + '" stroke-width="2"/>' +
  '<g transform="translate(0 -30) scale(.9)" stroke="' + O + '" stroke-width="1.4"><path d="M-8 -12 L 8 -12 L 11 -6 L 9 10 L -9 10 L -11 -6 Z" fill="url(#gOr)"/><path d="M-4 -6 L 4 -6 L 5 6 L -5 6 Z" fill="#fff4c0"/></g>' +
  '<path d="M-40 -34 C -20 -52 20 -52 40 -34" fill="none" stroke="#fff" stroke-width="3" opacity=".35"/></g>'; }

/* ====================================================================== LE PERSONNAGE ENTIER */
G.dessin = function(type, p, o){
  o = o || {};
  var D = G.D[type], os = PT.os(D, p), uid = 'G' + (++idn), v = p.v || {};
  var Pc = type === 'maire' ? piecesMaire(o) : type === 'silas' ? piecesSilas(o) : type === 'garde' ? piecesGarde(o) : G.AUTRES[type](o, p);
  var s = '';
  /* (les villageois : gens-village.js) ce qui passe derrière tout le corps — de longs cheveux, un châle */
  if(Pc.derriere) s += Pc.derriere(os, p);
  ['G', 'D'].forEach(function(c){
    s += PT.piece(os['c' + c], Pc.cuisse(c));
    s += PT.piece(os['t' + c], Pc.tibia(c));
    s += PT.piece(os['p' + c], Pc.pied(c));
  });
  /* la lance du garde (derrière le bras droit) */
  if(type === 'garde' && o.lance !== false){
    var la = o.lance || {}, m = os.mD, an = U.lerp(0, -38, la.bas || 0) + (la.a || 0);
    s += '<g transform="translate(' + f(M.pt(m, 0, 22)[0]) + ' ' + f(M.pt(m, 0, 22)[1]) + ') rotate(' + f(an) + ') scale(1 ' + f(1 - .5 * (la.bas || 0)) + ')">' + lance() + '</g>';
  }
  /* ce qu'une main tient (o.tient = {D:'lanterne' | 'torche' | 'rouleau' …, G:…} : G.OBJETS) : dessiné avec la main */
  /* (un objet tenu est posé au creux de la main, avec SON angle à lui — une lanterne pend, une torche est levée — pas celui du bras) */
  var tenu = function(c){
    var n = o.tient && o.tient[c], ob = n && G.OBJETS[n]; if(!ob) return '';
    var h = M.pt(os['m' + c], 0, 20);
    return '<g transform="translate(' + f(h[0]) + ' ' + f(h[1]) + ') rotate(' + f(ob.angle ? ob.angle(o, c, p) : 0) + ')">' + ob.dessin(o, c, p) + '</g>';
  };
  var unBras = function(c){
    var b = p['b' + c] || {}, obj = tenu(c), dessous = obj && G.OBJETS[o.tient[c]].dessous;
    return PT.piece(os['b' + c], Pc.brasHaut(c)) + PT.piece(os['a' + c], Pc.avantBras(c)) + (dessous ? obj : '') + PT.piece(os['m' + c], Pc.main(p['poing' + c] || 'poing', c)) + (dessous ? '' : obj);
  };
  /* la jupe (les femmes) : par-dessus les jambes */
  if(Pc.jupe) s += Pc.jupe(os, p);
  ['G', 'D'].forEach(function(c){ if(!(p['b' + c] || {}).devant) s += unBras(c); });
  s += PT.piece(os.bassin, Pc.bassin());
  s += PT.piece(os.buste, Pc.buste());
  ['G', 'D'].forEach(function(c){ if((p['b' + c] || {}).devant) s += unBras(c); });
  /* le bouclier, porté au bras gauche, devant le corps */
  if(type === 'garde' && o.bouclier !== false){
    var bm = M.pt(os.aG, 0, 40);
    s += '<g transform="translate(' + f(bm[0] - 6) + ' ' + f(bm[1]) + ')">' + bouclier() + '</g>';
  }
  var T = Pc.tete === 'garde' ? teteGarde(Pc.k) : typeof Pc.tete === 'object' ? Pc.tete : TETES[Pc.tete];
  var te = p.tete || {};
  s += PT.piece(os.tete, (Pc.sousTete ? Pc.sousTete(v, te) : '') + visage(T, Object.assign({ht:te.ht || 0}, v), o, uid) + (Pc.kepi ? kepi(o) : '') + (Pc.casque ? casque() : '') + (Pc.chapeau ? Pc.chapeau(v, te, p) : ''));
  /* la lanterne, dans la main droite */
  if(type === 'maire' && o.lanterne != null) s += PT.piece(M.mul(M.tr(M.pt(os.mD, 0, 18)[0], M.pt(os.mD, 0, 18)[1]), M.id()), G.lanterne(o.lanterne));
  G.dernier = {os:os, uid:uid, type:type};
  return s;
};
/* le gros plan des mains du maire (une image entière, 1440 × 616) : sa main gauche tire le gant gris de sa main droite, doigt
   après doigt ; la main nue, la bague en argent à tête de corbeau, un éclat. k : 0 → 1 (le gant qui glisse) ; e : l'éclat (0 → 1) ;
   t : le temps (la main tremble à peine) */
G.insertGants = function(k, e, t){
  var W = 1440, H = 616, s = '';
  /* le fond : la redingote et le gilet doré, tout près, flous ; la lumière chaude vient de la gauche */
  s += '<rect width="' + W + '" height="' + H + '" fill="#241e40"/>' +
    '<g filter="url(#fl70)"><rect x="560" y="-60" width="380" height="740" fill="#9a7428"/><rect x="690" y="-60" width="110" height="740" fill="#e8e4ee"/><path d="M690 -60 L 800 -60 L 770 260 L 745 300 L 720 260 Z" fill="#c0302a"/>' +
    '<circle cx="745" cy="400" r="18" fill="#ffd070"/><circle cx="745" cy="540" r="18" fill="#ffd070"/><path d="M160 -60 L 360 -60 L 1360 720 L 1140 720 Z" fill="#e8b84a" opacity=".8"/><path d="M250 -60 L 290 -60 L 1290 720 L 1240 720 Z" fill="#c0302a" opacity=".8"/></g>' +
    '<rect width="' + W + '" height="' + H + '" fill="url(#insertLueur)"/>';
  var tr = U.bruit(t * 3, 4) * 1.5, ox = 0 + tr, oy = 0 + tr;
  var g = U.COURBES.io(U.clamp(k, 0, 1)), dx = g * 330;
  /* LA MAIN DROITE DU MAIRE (à gauche de l'image) : le dos de la main vers nous, les doigts vers la droite */
  var doigts = [
    {y:232, l:244, e:44}, {y:288, l:262, e:46}, {y:344, l:246, e:44}, {y:398, l:204, e:40}
  ];
  function main(peau, ombre, ongles){
    var m = '';
    /* le pouce, replié dessous */
    m += '<path d="M440 400 C 470 450 540 470 600 456 C 630 450 640 430 626 418 C 590 426 540 420 500 396 Z" fill="' + peau + '" stroke="' + O + '" stroke-width="5"/>';
    /* les doigts (du petit au grand, pour que l'index passe dessus) */
    for(var i = doigts.length - 1; i >= 0; i--){
      var d = doigts[i], x0 = 600, x1 = x0 + d.l, h = d.e / 2;
      m += '<path d="M' + (x0 - 20) + ' ' + (d.y - h) + ' C ' + (x0 + 60) + ' ' + (d.y - h - 6) + ' ' + (x1 - 70) + ' ' + (d.y - h - 4) + ' ' + (x1 - 26) + ' ' + (d.y - h + 2) + ' C ' + (x1 + 4) + ' ' + (d.y - h + 6) + ' ' + (x1 + 8) + ' ' + (d.y + h - 6) + ' ' + (x1 - 22) + ' ' + (d.y + h) +
        ' C ' + (x1 - 80) + ' ' + (d.y + h + 4) + ' ' + (x0 + 60) + ' ' + (d.y + h + 6) + ' ' + (x0 - 20) + ' ' + (d.y + h) + ' Z" fill="' + peau + '" stroke="' + O + '" stroke-width="5"/>';
      /* les plis des articulations */
      m += '<path d="M' + (x0 + 70) + ' ' + (d.y - h * .5) + ' C ' + (x0 + 78) + ' ' + (d.y - h * .1) + ' ' + (x0 + 78) + ' ' + (d.y + h * .1) + ' ' + (x0 + 70) + ' ' + (d.y + h * .5) + ' M' + (x0 + d.l * .66) + ' ' + (d.y - h * .5) + ' C ' + (x0 + d.l * .66 + 6) + ' ' + (d.y - h * .1) + ' ' + (x0 + d.l * .66 + 6) + ' ' + (d.y + h * .1) + ' ' + (x0 + d.l * .66) + ' ' + (d.y + h * .5) + '" fill="none" stroke="' + ombre + '" stroke-width="3"/>';
      if(ongles) m += '<path d="M' + (x1 - 46) + ' ' + (d.y - h + 8) + ' C ' + (x1 - 16) + ' ' + (d.y - h + 8) + ' ' + (x1 - 10) + ' ' + (d.y + h - 10) + ' ' + (x1 - 40) + ' ' + (d.y + h - 9) + ' Z" fill="#f4d6c4" stroke="' + ombre + '" stroke-width="2.4"/>';
    }
    /* le dos de la main, les tendons, les jointures */
    m += '<path d="M330 214 C 420 200 520 204 612 210 L 618 418 C 540 424 440 426 330 418 Z" fill="' + peau + '" stroke="' + O + '" stroke-width="5"/>' +
      '<path d="M380 270 C 460 262 540 250 600 238 M380 310 C 460 302 540 292 600 290 M380 350 C 460 344 540 340 600 344 M390 384 C 460 388 530 392 596 394" fill="none" stroke="' + ombre + '" stroke-width="3" opacity=".7"/>' +
      [236, 290, 344, 394].map(function(y){ return '<ellipse cx="606" cy="' + y + '" rx="16" ry="12" fill="#ffffff" opacity=".22"/>'; }).join('');
    return m;
  }
  /* la manche violette et la manchette blanche (fixes) */
  s += '<path d="M-20 170 L 300 186 L 316 446 L -20 470 Z" fill="url(#gRedX)" stroke="' + O + '" stroke-width="5"/><path d="M260 190 L 336 196 L 344 436 L 268 442 Z" fill="url(#gChemise)" stroke="' + O + '" stroke-width="5"/>' +
    '<circle cx="300" cy="318" r="10" fill="url(#gOr)" stroke="' + O + '" stroke-width="3"/>';
  /* la main nue (dessous) */
  var nue = '<g transform="translate(' + U.r(ox) + ' ' + U.r(oy) + ')">' + main('#ecc4a0', '#b8846a', true);
  /* LA BAGUE, sur l'annulaire (le troisième doigt), près de la jointure */
  nue += '<g transform="translate(700 344)"><rect x="-12" y="-27" width="24" height="54" rx="9" fill="#dfe3ee" stroke="' + O + '" stroke-width="4"/><path d="M-6 -24 L -6 24" stroke="#ffffff" stroke-width="3" opacity=".7"/>' +
    '<g transform="translate(-2 -8) scale(2.2)" stroke="' + O + '" stroke-width="1.6" stroke-linejoin="round"><path d="M-13 6 C -17 -6 -8 -17 5 -15 C 11 -14 15 -11 17 -8 L 33 -3 L 17 2 C 14 8 6 12 -3 11 C -8 10 -11 9 -13 6 Z" fill="#c4cad8"/>' +
    '<path d="M17 -8 L 33 -3 L 17 2 Z" fill="#6a6f86"/><path d="M-12 -4 C -8 -12 -2 -15 5 -15 C 0 -11 -4 -7 -6 -1 Z" fill="#8d93aa" stroke="none"/><path d="M-10 2 C -6 -2 0 -2 4 2 M-8 6 C -4 3 2 3 6 6" fill="none" stroke="#7a8098" stroke-width=".9"/>' +
    '<circle cx="7" cy="-6" r="2.9" fill="#e5484d" stroke-width="1"/><circle cx="7.8" cy="-6.8" r=".9" fill="#fff" stroke="none"/></g></g></g>';
  s += nue;
  /* LE GANT GRIS : il recouvre encore ce que son bord n'a pas quitté (du poignet vers le bout des doigts) ; au-delà des doigts,
     le gant vidé, mou, pincé par la main gauche qui tire */
  var bord = U.lerp(334, 880, g), tire = U.lerp(20, 250, g);
  s += '<g transform="translate(' + U.r(ox) + ' ' + U.r(oy) + ')"><clipPath id="clipGant"><rect x="' + U.r(bord) + '" y="0" width="1400" height="616"/></clipPath><g clip-path="url(#clipGant)">' + main('#a6a4b2', '#6a6876', false) +
    '<path d="M420 250 L 600 236 M420 300 L 600 290 M420 350 L 600 344" fill="none" stroke="#6a6876" stroke-width="2.4" stroke-dasharray="7 6"/></g>' +
    /* le bord retroussé du gant */
    '<path d="M' + U.r(bord - 6) + ' 206 C ' + U.r(bord + 8) + ' 260 ' + U.r(bord - 4) + ' 340 ' + U.r(bord + 6) + ' 428" fill="none" stroke="' + O + '" stroke-width="22" stroke-linecap="round"/>' +
    '<path d="M' + U.r(bord - 6) + ' 206 C ' + U.r(bord + 8) + ' 260 ' + U.r(bord - 4) + ' 340 ' + U.r(bord + 6) + ' 428" fill="none" stroke="#8e8c9a" stroke-width="14" stroke-linecap="round"/>' +
    '<path d="M' + U.r(bord - 10) + ' 214 C ' + U.r(bord + 2) + ' 266 ' + U.r(bord - 8) + ' 340 ' + U.r(bord + 1) + ' 420" fill="none" stroke="#c8c6d2" stroke-width="4" stroke-linecap="round"/>' +
    /* le gant vidé, au-delà du bout des doigts : ses doigts mous, aplatis, tirés vers la droite */
    '<path d="M860 ' + U.r(230 - g * 10) + ' C ' + U.r(880 + tire * .5) + ' ' + U.r(220 - g * 6) + ' ' + U.r(880 + tire) + ' 250 ' + U.r(890 + tire) + ' 300 C ' + U.r(880 + tire) + ' 350 ' + U.r(880 + tire * .5) + ' 390 860 ' + U.r(400 + g * 6) + ' C 870 340 868 280 860 ' + U.r(230 - g * 10) + ' Z" fill="#a6a4b2" stroke="' + O + '" stroke-width="5"/>' +
    '<path d="M' + U.r(870 + tire * .3) + ' 262 C ' + U.r(880 + tire * .6) + ' 268 ' + U.r(880 + tire * .8) + ' 280 ' + U.r(886 + tire) + ' 290 M' + U.r(870 + tire * .3) + ' 312 C ' + U.r(880 + tire * .6) + ' 316 ' + U.r(880 + tire * .8) + ' 324 ' + U.r(886 + tire) + ' 330 M' + U.r(866 + tire * .3) + ' 360 C ' + U.r(876 + tire * .6) + ' 360 ' + U.r(880 + tire * .8) + ' 356 ' + U.r(884 + tire) + ' 350" fill="none" stroke="#6a6876" stroke-width="3"/></g>';
  /* LA MAIN GAUCHE (gantée, à droite de l'image) qui pince le bout du gant et tire */
  var px = 880 + tire + ox, py = 300 + oy;
  s += '<g transform="translate(' + U.r(px) + ' ' + U.r(py) + ')"><path d="M40 -120 C 120 -130 260 -110 600 -90 L 600 140 C 300 150 140 150 60 120 C 20 100 0 60 4 20 C 6 -30 10 -100 40 -120 Z" fill="#9a98a6" stroke="' + O + '" stroke-width="5"/>' +
    '<path d="M10 -40 C -20 -40 -40 -20 -36 0 C -32 16 -10 18 14 10 Z" fill="#9a98a6" stroke="' + O + '" stroke-width="5"/>' +
    '<path d="M8 30 C -24 34 -40 52 -34 68 C -28 82 -6 80 18 70 Z" fill="#9a98a6" stroke="' + O + '" stroke-width="5"/>' +
    '<path d="M80 -60 L 400 -50 M90 20 L 400 26 M80 90 L 400 96" stroke="#6a6876" stroke-width="3" stroke-dasharray="8 7"/>' +
    '<path d="M60 -100 C 200 -110 400 -100 600 -80" fill="none" stroke="#d0cee0" stroke-width="5" opacity=".6"/></g>';
  /* l'éclat sur la bague */
  if(e > 0){
    var bx = 712 + ox, by = 322 + oy, r = 50 + 90 * Math.sin(e * Math.PI);
    s += '<g opacity="' + U.r(Math.sin(e * Math.PI)) + '" transform="translate(' + U.r(bx) + ' ' + U.r(by) + ') rotate(' + U.r(e * 50) + ')"><circle r="' + U.r(r * .9) + '" fill="url(#haloFort)"/><path d="M0 ' + U.r(-r) + ' L 7 -7 L ' + U.r(r) + ' 0 L 7 7 L 0 ' + U.r(r) + ' L -7 7 L ' + U.r(-r) + ' 0 L -7 -7 Z" fill="#ffffff"/></g>';
  }
  return s;
};
/* pour les villageois (gens-village.js) */
G.AUTRES = {}; G.OBJETS = {}; G.DEFS_PLUS = [];
G._ = {visage:visage, mainHumaine:mainHumaine, lin:lin, rad:rad, X:X, O:O, OL:OL, f:f, C:C};
/* une lanterne pend sous la main (elle se balance : pose.pend, en degrés) */
G.OBJETS.lanterne = {dessin:function(o){ return '<g transform="translate(0 -22)">' + G.lanterne(o.lanterne == null ? 1 : o.lanterne) + '</g>'; }, angle:function(o, c, p){ return (p.pend || 0) * (c === 'G' ? -1 : 1); }};
G.point = function(os, nom){
  if(nom === 'lanterne'){ var h = M.pt(os.mD, 0, 18); return [h[0], h[1] + 66]; }
  if(nom === 'lanterneG'){ var h2 = M.pt(os.mG, 0, 18); return [h2[0], h2[1] + 66]; }
  if(nom === 'bouche') return M.pt(os.tete, 0, -30);
  if(nom === 'mainD') return M.pt(os.mD, 0, 22);
  if(nom === 'mainG') return M.pt(os.mG, 0, 22);
  if(nom === 'tete') return M.pt(os.tete, 0, -60);
  return [0, 0];
};
})();
