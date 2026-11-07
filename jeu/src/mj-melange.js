/* ==========================================================
   Brumeval v2 — « Le bon mélange » (Alchimiste), nouvelle version.
   Remplace l'ancien 'melange' de mj-pisteur-alchi.js (chargé après lui).

   Dans le petit laboratoire (fenêtre de nuit, cheminée, étagères de
   pots, établi, grand chaudron), on verse des VRAIS ingrédients du
   monde de Brumeval, une portion par toucher, pour obtenir la couleur
   de la fiole modèle. Le mélange est « soustractif » façon peinture
   (rouge-jaune-bleu), la poussière de lune éclaircit, le charbon
   assombrit ; seules les PROPORTIONS comptent (15/15/10 = 3/3/2).

   « Goûter » vérifie :
   - bonne couleur (dans la zone de tolérance) et recette simple → fiole remplie, gagné ;
   - bonne couleur mais trop d'ingrédients → le chaudron tremble :
     « Simplifier » divise tout par le plus grand diviseur commun ;
     assez petit → gagné, sinon « Recommence avec moins d'ingrédients » ;
   - mauvaise couleur → « Beurk ! », un cœur de moins.
   Le sablier est long : on peut explorer.

   Mods : zone (tolérance ×), temps (+N s), lent (sablier ÷ lent),
   erreurs (+N cœurs), aide (N bons ingrédients brillent ; dès 2, la
   barre de ressemblance), barre (barre de ressemblance sans chiffres),
   revele (barre de ressemblance avec le pourcentage), facile (cœur).
   params.recette (facultatif) : {myrtille:1, pensee:2} imposée.
   Préfixe CSS : .mjm-   Dépend de mj-core.js (et donnees.js pour les noms).
   Test : window.__melange décrit la partie en cours.
   ========================================================== */
(function(){
'use strict';
var MJ = window.MJ;
if(!MJ || !MJ.util){ console.error('mj-melange : mj-core.js doit être chargé avant.'); return; }
var U = MJ.util, K = '#24182e';
var uid = 0;
function DD(){ return window.DONNEES || {}; }
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]; }); }
function borne(v, a, b){ return Math.max(a, Math.min(b, v)); }
function f1(x){ return (Math.round(x * 10) / 10).toString(); }
function courbe(n, pts){
  var ks = Object.keys(pts).map(Number).sort(function(a, b){ return a - b; });
  if(n <= ks[0]) return pts[ks[0]];
  for(var i = 1; i < ks.length; i++) if(n <= ks[i]){ var a = ks[i - 1], b = ks[i]; return pts[a] + (pts[b] - pts[a]) * (n - a) / (b - a); }
  return pts[ks[ks.length - 1]];
}

/* ==========================================================
   Les ingrédients. Ceux qui existent dans D.INGR (src) prennent
   leur nom et leur icône là-bas ; les autres sont propres au jeu
   (non ajoutés à D.INGR). d = direction rouge-jaune-bleu,
   w = part de blanc, k = part de noir.
   ========================================================== */
var INGR = {
  myrtille:  {src:null,      nom:'Myrtilles',      court:'Myrtille',   cpt:'myrtilles',         ic:'🫐', d:[0.08, 0, 1],    w:0,    k:0.08},
  coquelicot:{src:null,      nom:'Coquelicots',    court:'Coquelicot', cpt:'coquelicots',       ic:'🌺', d:[1, 0, 0.04],    w:0,    k:0},
  pensee:    {src:'pensee',  nom:'Pensées sauvages', court:'Pensée',   cpt:'pensées',           ic:'🌼', d:[0, 1, 0],       w:0,    k:0},
  menthe:    {src:'menthe',  nom:'Menthe poivrée', court:'Menthe',     cpt:'menthe',            ic:'🌿', d:[0, 0.85, 1],    w:0.3,  k:0},
  lavande:   {src:'lavande', nom:'Lavande',        court:'Lavande',    cpt:'lavande',           ic:'🪻', d:[0.95, 0, 1],    w:0.36, k:0},
  miel:      {src:'miel',    nom:'Miel des ruches', court:'Miel',      cpt:'miel',              ic:'🍯', d:[0.6, 1, 0],     w:0,    k:0.2},
  lune:      {src:'lune',    nom:'Poussière de lune', court:'Lune',    cpt:'poussière de lune', ic:'✨', d:[0, 0, 0],       w:1,    k:0},
  charbon:   {src:null,      nom:'Charbon',        court:'Charbon',    cpt:'charbon',           ic:'⚫', d:[0, 0, 0],       w:0,    k:1},
  racine:    {src:'racine',  nom:'Racine du Vieux Chêne', court:'Racine', cpt:'racine',         ic:'🪵', d:[1, 0.85, 0.5],  w:0.04, k:0.12}
};
var ORDRE = ['myrtille', 'coquelicot', 'pensee', 'menthe', 'lavande', 'miel', 'lune', 'charbon', 'racine'];
function nomIngr(id){ var I = INGR[id], D = DD().INGR || {}, s = I.src && D[I.src]; return s && s.nom ? s.nom : I.nom; }

/* ==========================================================
   Le mélange des couleurs : modèle rouge-jaune-bleu (cube de
   Gossett-Chen) pour la partie colorée, puis on tire vers le blanc
   (lune) et le noir (charbon). L'écart se mesure dans OKLab.
   ========================================================== */
var CUBE = [[1, 1, 1], [0.89, 0.14, 0.16], [1, 0.85, 0.1], [0.98, 0.52, 0.08], [0.13, 0.36, 0.86], [0.52, 0.13, 0.62], [0.1, 0.66, 0.26], [0.24, 0.15, 0.1]];
var BLANC = [0.98, 0.97, 1], NOIR = [0.09, 0.08, 0.11], FORCE_NOIR = 1.25, EAU = [0.45, 0.54, 0.72];
function lerp(a, b, t){ return a + (b - a) * t; }
function rybRgb(r, y, b){
  var o = [];
  for(var i = 0; i < 3; i++){
    var x0 = lerp(CUBE[0][i], CUBE[1][i], r), x1 = lerp(CUBE[2][i], CUBE[3][i], r), x2 = lerp(CUBE[4][i], CUBE[5][i], r), x3 = lerp(CUBE[6][i], CUBE[7][i], r);
    o.push(lerp(lerp(x0, x1, y), lerp(x2, x3, y), b));
  }
  return o;
}
function couleur(c){
  var R = 0, Y = 0, B = 0, C = 0, Wt = 0, Kt = 0;
  for(var id in c){
    var n = c[id], g = INGR[id]; if(!n || !g) continue;
    var cf = 1 - g.w - g.k, m = Math.max(g.d[0], g.d[1], g.d[2]) || 1;
    R += n * cf * g.d[0] / m; Y += n * cf * g.d[1] / m; B += n * cf * g.d[2] / m;
    C += n * cf; Wt += n * g.w; Kt += n * g.k;
  }
  var tot = C + Wt + Kt * FORCE_NOIR;
  if(!tot) return null;
  var mx = Math.max(R, Y, B), h = mx > 0 ? rybRgb(R / mx, Y / mx, B / mx) : [0, 0, 0];
  return [0, 1, 2].map(function(i){ return (C * h[i] + Wt * BLANC[i] + Kt * FORCE_NOIR * NOIR[i]) / tot; });
}
function versLin(c){ return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
function oklab(s){
  var r = versLin(s[0]), g = versLin(s[1]), b = versLin(s[2]);
  var l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b), m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b), q = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * q, 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * q, 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * q];
}
function versSrgb(c){ c = Math.max(0, c); return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055; }
function depuisOklab(L){
  var l = L[0] + 0.3963377774 * L[1] + 0.2158037573 * L[2], m = L[0] - 0.1055613458 * L[1] - 0.0638541728 * L[2], q = L[0] - 0.0894841775 * L[1] - 1.2914855480 * L[2];
  l = l * l * l; m = m * m * m; q = q * q * q;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * q, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * q, -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * q].map(versSrgb);
}
function ecart(a, b){ if(!a || !b) return 9; var A = oklab(a), B = oklab(b); return Math.sqrt((A[0] - B[0]) * (A[0] - B[0]) + (A[1] - B[1]) * (A[1] - B[1]) + (A[2] - B[2]) * (A[2] - B[2])); }
function rgb(c){ return 'rgb(' + c.map(function(v){ return Math.round(borne(v, 0, 1) * 255); }).join(',') + ')'; }
function hex(c){ return '#' + c.map(function(v){ var s = Math.round(borne(v, 0, 1) * 255).toString(16); return s.length < 2 ? '0' + s : s; }).join(''); }
function clair(c, t){ return c.map(function(v){ return v + (1 - v) * t; }); }
function sombre(c, t){ return c.map(function(v){ return v * (1 - t); }); }
function pur(id){ var o = {}; o[id] = 1; return couleur(o); }
function total(c){ var t = 0; for(var k in c) t += c[k] || 0; return t; }
function pgcd2(a, b){ while(b){ var t = a % b; a = b; b = t; } return a; }
function pgcd(c){ var g = 0; for(var k in c) if(c[k] > 0) g = pgcd2(c[k], g); return g || 1; }
function signature(c){ return ORDRE.filter(function(k){ return c[k] > 0; }).map(function(k){ return k + c[k]; }).join(','); }

/* ---------- Une recette au hasard, jolie et pas triviale ---------- */
function defautRecette(r, p){
  if(pgcd(r) !== 1) return 'pgcd';
  var T = couleur(r), tol = p.tolBase;
  for(var i = 0; i < p.etagere.length; i++) if(ecart(T, pur(p.etagere[i])) < 1.25 * tol) return 'pur';
  for(var k in r){ var r2 = Object.assign({}, r); delete r2[k]; if(ecart(T, couleur(r2)) < 1.25 * tol) return 'inutile'; }
  var L = oklab(T), chroma = Math.sqrt(L[1] * L[1] + L[2] * L[2]);
  if(L[0] < 0.3) return 'noir';
  if(chroma < 0.04) return 'gris';
  if(p.vif && (L[0] < 0.4 || chroma < 0.06)) return 'terne';
  if(ecart(T, EAU) < 2 * tol) return 'eau';
  return null;
}
function genererRecette(p){
  for(var essai = 0; essai < 800; essai++){
    var ids = U.melanger(p.reserve).slice(0, p.nbIngr), r = {};
    ids.forEach(function(id){ r[id] = 1; });
    var extra = U.randInt(0, Math.max(0, p.totalMax - p.nbIngr));
    for(var e = 0; e < extra; e++){
      var c = ids.filter(function(id){ return r[id] < p.qMax; });
      if(!c.length) break;
      r[U.choix(c)]++;
    }
    if(!defautRecette(r, p)) return r;
  }
  return p.nbIngr >= 3 ? {myrtille:1, pensee:2, lune:1} : {myrtille:1, pensee:1};
}

/* ==========================================================
   Dessins (style du jeu : contour #24182e, dégradés doux)
   ========================================================== */
function P(d, f, sw, x){ return '<path d="' + d + '" fill="' + f + '" stroke="' + K + '" stroke-width="' + (sw === undefined ? 3 : sw) + '" stroke-linejoin="round" stroke-linecap="round"' + (x || '') + '/>'; }
function C(cx, cy, r, f, sw, x){ return '<circle cx="' + f1(cx) + '" cy="' + f1(cy) + '" r="' + f1(r) + '" fill="' + f + '" stroke="' + K + '" stroke-width="' + (sw === undefined ? 3 : sw) + '"' + (x || '') + '/>'; }
function E(cx, cy, rx, ry, f, sw, x){ return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + f + '" stroke="' + K + '" stroke-width="' + (sw === undefined ? 3 : sw) + '"' + (x || '') + '/>'; }
function R(x, y, w, h, rx, f, sw, xx){ return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 0) + '" fill="' + f + '" stroke="' + K + '" stroke-width="' + (sw === undefined ? 3 : sw) + '"' + (xx || '') + '/>'; }
function L(d, c, w, x){ return '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"' + (x || '') + '/>'; }
function LK(d, c, w){ return L(d, K, w + 3) + L(d, c, w); }   /* trait coloré cerné */
function reflet(d, w){ return L(d, '#fff', w || 3, ' opacity=".5"'); }
function U_(g, id){ return 'url(#' + g + id + ')'; }

function defs(g){
  function st(l){ return l.map(function(s){ return '<stop offset="' + s[1] + '" stop-color="' + s[0] + '"' + (s[2] !== undefined ? ' stop-opacity="' + s[2] + '"' : '') + '/>'; }).join(''); }
  function lin(id, l, vert){ return '<linearGradient id="' + g + id + '" x1="0" y1="0" x2="' + (vert ? 0 : 1) + '" y2="' + (vert ? 1 : 0) + '">' + st(l) + '</linearGradient>'; }
  function rad(id, l, cx, cy, r){ return '<radialGradient id="' + g + id + '" cx="' + (cx || 0.5) + '" cy="' + (cy || 0.5) + '" r="' + (r || 0.5) + '">' + st(l) + '</radialGradient>'; }
  return '<defs>' +
    lin('verre', [['#ffffff', 0, 0.42], ['#cfefff', 0.45, 0.1], ['#ffffff', 1, 0.28]]) +
    lin('verreF', [['#ffffff', 0, 0.2], ['#cfefff', 0.4, 0.02], ['#ffffff', 1, 0.1]]) +
    lin('pierreF', [['#77729a', 0], ['#5a5580', 0.55], ['#3e3a62', 1]]) +
    lin('bois', [['#dc9e63', 0], ['#b06f3e', 0.55], ['#7d4626', 1]]) +
    lin('boisV', [['#dc9e63', 0], ['#b06f3e', 0.55], ['#7d4626', 1]], 1) +
    lin('boisH', [['#f3c991', 0], ['#d29a5e', 1]], 1) +
    lin('boisS', [['#94603a', 0], ['#62381d', 1]]) +
    lin('metal', [['#6a5f92', 0], ['#3a3157', 0.5], ['#1b1529', 1]]) +
    lin('metalV', [['#4f466e', 0], ['#2a2340', 1]], 1) +
    lin('pierre', [['#a9a5c6', 0], ['#77729c', 0.6], ['#524d75', 1]]) +
    lin('pierreV', [['#8d89ad', 0], ['#5d5884', 1]], 1) +
    lin('terre', [['#f0a172', 0], ['#c96a3e', 0.6], ['#94441f', 1]]) +
    lin('ceram', [['#fffaf0', 0], ['#ece0c8', 0.6], ['#c4b392', 1]]) +
    lin('or', [['#fff1b8', 0], ['#f5b945', 0.5], ['#b07a1c', 1]]) +
    lin('liege', [['#e9bb84', 0], ['#b9824c', 1]], 1) +
    lin('miel', [['#ffd36a', 0], ['#eaa22a', 0.45], ['#b8680f', 1]], 1) +
    lin('ciel', [['#0d1433', 0], ['#26306a', 0.7], ['#4b3f86', 1]], 1) +
    lin('feuille', [['#9be8a8', 0], ['#4fb86e', 0.55], ['#24774a', 1]]) +
    lin('charbon', [['#5a5468', 0], ['#2a2633', 0.6], ['#141118', 1]]) +
    lin('racine', [['#c98a58', 0], ['#8f4c2a', 0.6], ['#5c2e17', 1]]) +
    lin('lavande', [['#c9a6ff', 0], ['#9b6ae6', 0.6], ['#6a3fb8', 1]], 1) +
    lin('fumee', [['#c6f39a', 0], ['#8fd35e', 0.6], ['#5f9f3a', 1]], 1) +
    rad('myr', [['#a9c2ff', 0], ['#4469dc', 0.5], ['#203888', 1]], 0.35, 0.3, 0.75) +
    rad('coq', [['#ff9a86', 0], ['#e8323a', 0.55], ['#a3121c', 1]], 0.4, 0.35, 0.75) +
    rad('pen', [['#fff6b0', 0], ['#ffd21a', 0.55], ['#e09a00', 1]], 0.4, 0.35, 0.75) +
    rad('lunePoudre', [['#ffffff', 0], ['#f3f1ff', 0.55], ['#cdd3f5', 1]], 0.45, 0.3, 0.8) +
    rad('haloL', [['#fff6d8', 0, 0.65], ['#fff6d8', 1, 0]]) +
    rad('halo', [['#ffe9a3', 0, 0.7], ['#ffd36a', 1, 0]]) +
    rad('haloC', [['#dffcff', 0, 0.85], ['#8ff3ff', 0.5, 0.35], ['#8ff3ff', 1, 0]]) +
    rad('foyer', [['#ffd36a', 0, 0.95], ['#ff7a3c', 0.45, 0.75], ['#a8391a', 1, 0]]) +
    rad('lustre', [['#ffffff', 0, 0.3], ['#ffffff', 0.45, 0.05], ['#ffffff', 1, 0]], 0.3, 0.2, 0.6) +
    rad('bouche', [['#2a2140', 0], ['#0e0a16', 1]], 0.5, 0.9, 0.8) +
    '<radialGradient id="' + g + 'lueurLiq"><stop offset="0" style="stop-color:var(--liq);stop-opacity:.7"/><stop offset=".55" style="stop-color:var(--liq);stop-opacity:.22"/><stop offset="1" style="stop-color:var(--liq);stop-opacity:0"/></radialGradient>' +
    '</defs>';
}

/* ---------- Les petites portions qui tombent (viewBox -12 -12 24 24) ---------- */
function etoile4(x, y, r, f){ return '<path d="M' + x + ',' + (y - r) + ' Q' + (x + r * 0.22) + ',' + (y - r * 0.22) + ' ' + (x + r) + ',' + y + ' Q' + (x + r * 0.22) + ',' + (y + r * 0.22) + ' ' + x + ',' + (y + r) + ' Q' + (x - r * 0.22) + ',' + (y + r * 0.22) + ' ' + (x - r) + ',' + y + ' Q' + (x - r * 0.22) + ',' + (y - r * 0.22) + ' ' + x + ',' + (y - r) + ' Z" fill="' + f + '"/>'; }
function baie(x, y, r, g){
  return C(x, y, r, U_(g, 'myr'), 2) + C(x - r * 0.35, y - r * 0.38, r * 0.26, '#fff', 0, ' opacity=".75"') +
    L('M' + f1(x - r * 0.3) + ',' + f1(y - r * 0.72) + ' L' + f1(x) + ',' + f1(y - r * 0.45) + ' L' + f1(x + r * 0.3) + ',' + f1(y - r * 0.72), K, 1.5);
}
function pensee(x, y, r, g){
  var s = '', a;
  for(var i = 0; i < 5; i++){ a = -Math.PI / 2 + i * 2 * Math.PI / 5; s += C(x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62, r * 0.5, U_(g, 'pen'), 1.8); }
  return s + L('M' + f1(x) + ',' + f1(y) + ' l' + f1(-r * 0.3) + ',' + f1(r * 0.35) + ' M' + f1(x) + ',' + f1(y) + ' l' + f1(r * 0.3) + ',' + f1(r * 0.35) + ' M' + f1(x) + ',' + f1(y) + ' l0,' + f1(-r * 0.4), '#7a3a18', 1.6) + C(x, y, r * 0.2, '#ff9a1a', 1.4);
}
function feuille(x, y, l, ang, f, sw){
  var w = l * 0.42;
  return '<g transform="translate(' + f1(x) + ',' + f1(y) + ') rotate(' + ang + ')">' + P('M0,0 C' + f1(w) + ',' + f1(-l * 0.25) + ' ' + f1(w * 0.7) + ',' + f1(-l * 0.8) + ' 0,' + f1(-l) + ' C' + f1(-w * 0.7) + ',' + f1(-l * 0.8) + ' ' + f1(-w) + ',' + f1(-l * 0.25) + ' 0,0 Z', f || '#5cc68a', sw === undefined ? 2 : sw) +
    L('M0,-1 L0,' + f1(-l * 0.82), '#2e8a52', 1.3) + '</g>';
}
function coquelicot(x, y, r, g){
  return C(x - r * 0.42, y + r * 0.05, r * 0.62, U_(g, 'coq'), 2) + C(x + r * 0.42, y + r * 0.05, r * 0.62, U_(g, 'coq'), 2) +
    C(x, y - r * 0.38, r * 0.62, U_(g, 'coq'), 2) + C(x, y + r * 0.4, r * 0.58, U_(g, 'coq'), 2) +
    C(x, y, r * 0.3, '#2a1a24', 1.5) + C(x - r * 0.08, y - r * 0.1, r * 0.08, '#8a7aa0', 0);
}
var PORTIONS = {
  myrtille: function(g){ return baie(0, 1, 9, g); },
  coquelicot: function(g){ return P('M0,10 C-11,6 -12,-6 -6,-10 C-2,-12 2,-12 6,-10 C12,-6 11,6 0,10 Z', U_(g, 'coq'), 2) + L('M0,8 L0,-2 M-4,4 L-1,-3 M4,4 L1,-3', '#a3121c', 1.4) + C(0, 8, 2.4, '#2a1a24', 1); },
  pensee: function(g){ return pensee(0, 0, 10, g); },
  menthe: function(){ return feuille(-1, 10, 20, 18, '#5cc68a', 2); },
  lavande: function(){ var s = LK('M-5,11 C-2,2 2,-4 6,-11', '#4f9a52', 1.6); [[-2.6,4],[-0.6,0],[1.4,-3.6],[3.4,-7],[5.2,-10]].forEach(function(b, i){ s += E(b[0] + (i % 2 ? 2 : -2), b[1], 2.8, 2, i % 2 ? '#9b6ae6' : '#b48cff', 1.2, ' transform="rotate(-35 ' + b[0] + ' ' + b[1] + ')"'); }); return s; },
  miel: function(g){ return P('M0,-11 C3,-5 9,0 9,5 C9,10 5,12 0,12 C-5,12 -9,10 -9,5 C-9,0 -3,-5 0,-11 Z', U_(g, 'miel'), 2) + reflet('M-4,3 C-5,6 -3,8 -1,9', 2); },
  lune: function(){ return '<circle r="11" fill="#bff9ff" opacity=".35"/>' + etoile4(0, 0, 10, '#fff') + '<path d="M0,-10 Q2.2,-2.2 10,0 Q2.2,2.2 0,10 Q-2.2,2.2 -10,0 Q-2.2,-2.2 0,-10 Z" fill="none" stroke="' + K + '" stroke-width="1.6"/>' + C(5, -6, 1.6, '#8ff3ff', 0) + C(-6, 6, 1.2, '#8ff3ff', 0); },
  charbon: function(g){ return P('M-9,4 L-6,-6 L2,-9 L9,-3 L8,6 L-1,9 Z', U_(g, 'charbon'), 2) + P('M-6,-6 L2,-9 L1,-2 Z', '#6a6480', 0) + P('M1,-2 L9,-3 L8,6 Z', '#3a3448', 0); },
  racine: function(){ return LK('M-9,-6 C-3,-8 0,-2 2,2 C4,6 7,6 9,10', '#9a5a32', 4) + LK('M0,0 C-3,3 -6,4 -8,8', '#9a5a32', 2); }
};

/* ---------- Les pots sur l'étagère (viewBox 0 0 80 100, le fond est à y = 97) ---------- */
var POTS = {
  myrtille: function(g){
    var corps = 'M23,34 C11,44 9,82 18,91 C26,98 54,98 62,91 C71,82 69,44 57,34 Z';
    var s = P(corps, 'rgba(180,210,255,.16)', 0);
    [[26,86],[39,88],[53,86],[31,77],[45,78],[58,77],[20,75],[38,67],[51,68],[25,66],[61,66],[44,58],[31,57],[56,57]].forEach(function(b){ s += baie(b[0], b[1], 6.6, g); });
    s += P(corps, U_(g, 'verre'), 3) + reflet('M19,50 C15,62 15,74 19,84', 4) + reflet('M58,44 C61,47 62,50 63,54', 2.5);
    s += P('M15,34 C11,22 69,22 65,34 L61,40 L55,35 L48,40 L40,35 L32,40 L25,35 L19,40 Z', '#7a5bd0', 3);
    s += '<g fill="#b9a4ff" opacity=".9">' + [22, 32, 42, 52, 60].map(function(x, i){ return '<circle cx="' + x + '" cy="' + (27 + (i % 2) * 3) + '" r="2.2"/>'; }).join('') + '</g>';
    s += L('M18,33 C32,38 48,38 62,33', '#e8c98a', 3.2) + C(62, 34, 3, '#e8c98a', 2);
    return s;
  },
  coquelicot: function(g){
    var corps = 'M31,42 C31,37 29,33 31,29 L49,29 C51,33 49,37 49,42 C63,49 66,86 58,92 C52,97 28,97 22,92 C14,86 17,49 31,42 Z';
    var s = '';
    s += LK('M38,72 C36,56 26,40 20,20', '#4f9a52', 2.6) + LK('M40,72 C40,52 42,30 42,12', '#4f9a52', 2.6) + LK('M42,72 C46,56 54,40 61,22', '#4f9a52', 2.6) + LK('M40,60 C46,48 52,44 58,46', '#4f9a52', 2);
    s += P('M57,44 C62,42 64,48 60,51 C57,50 56,47 57,44 Z', '#7ab35a', 2);
    s += P(corps, 'rgba(140,200,255,.12)', 0) + '<path d="M19,70 C30,67 50,73 61,70 C63,80 61,88 57,92 C50,97 30,97 23,92 C19,88 17,80 19,70 Z" fill="#8fd7ff" opacity=".28"/>';
    s += P(corps, U_(g, 'verre'), 3) + reflet('M22,58 C19,68 19,78 22,86', 3.5) + L('M30,30 H50', '#fff', 2, ' opacity=".5"');
    s += coquelicot(20, 18, 11, g) + coquelicot(42, 11, 12, g) + coquelicot(62, 20, 10, g);
    return s;
  },
  pensee: function(g){
    var s = '';
    s += feuille(14, 66, 18, -60, '#5cbf72') + feuille(66, 66, 18, 60, '#5cbf72') + feuille(26, 60, 16, -25, '#4fb466') + feuille(54, 60, 16, 25, '#4fb466');
    s += pensee(20, 52, 11, g) + pensee(60, 52, 11, g) + pensee(40, 46, 12.5, g) + pensee(30, 34, 10, g) + pensee(51, 33, 10.5, g);
    s += P('M8,62 L72,62 L70,95 L10,95 Z', U_(g, 'boisV'), 3) + L('M10,73 H70 M10,84 H70', 'rgba(60,30,15,.55)', 2.4) + L('M24,63 V94 M56,63 V94', 'rgba(60,30,15,.35)', 2);
    s += R(4, 58, 72, 8, 3, U_(g, 'boisH'), 3) + C(13, 68, 1.8, '#3a2418', 0) + C(67, 68, 1.8, '#3a2418', 0) + C(13, 90, 1.8, '#3a2418', 0) + C(67, 90, 1.8, '#3a2418', 0);
    return s;
  },
  menthe: function(g){
    var s = '';
    [[40,62,26,0],[28,64,22,-35],[52,64,22,35],[20,68,18,-70],[60,68,18,70],[34,50,20,-15],[46,50,20,15],[40,40,18,0],[30,40,15,-40],[50,40,15,40]].forEach(function(f, i){ s += feuille(f[0], f[1], f[2], f[3], i % 3 === 0 ? '#6dd396' : (i % 3 === 1 ? '#52bf80' : '#43ad6e')); });
    s += P('M16,70 L64,70 L58,96 L22,96 Z', U_(g, 'terre'), 3) + R(12, 63, 56, 11, 4, U_(g, 'terre'), 3) + reflet('M24,78 L27,92', 3);
    s += L('M30,84 C34,80 46,80 50,84', '#ffd9b0', 2, ' opacity=".6"');
    return s;
  },
  lavande: function(g){
    var s = '', tiges = [[40,58,28,4],[40,58,36,10],[40,58,48,4],[40,58,20,14],[40,58,58,14]];
    tiges.forEach(function(t){ s += LK('M' + t[0] + ',' + t[1] + ' C' + t[0] + ',40 ' + t[2] + ',30 ' + t[2] + ',' + t[3], '#5f9e58', 1.8); });
    tiges.forEach(function(t, j){
      for(var i = 0; i < 6; i++){
        var y = t[3] + 2 + i * 3.6, x = t[2] + (t[0] - t[2]) * (i * 0.04);
        s += E(f1(x + (i % 2 ? 2.2 : -2.2)), f1(y), 3, 2.2, i % 2 ? U_(g, 'lavande') : '#b48cff', 1.3, ' transform="rotate(' + (i % 2 ? 30 : -30) + ' ' + f1(x) + ' ' + f1(y) + ')"');
      }
      if(j === 0) s += '';
    });
    s += P('M27,56 C17,64 16,88 25,95 L55,95 C64,88 63,64 53,56 C49,52 49,48 53,44 L27,44 C31,48 31,52 27,56 Z', U_(g, 'ceram'), 3);
    s += L('M20,74 C30,77 50,77 60,74', '#7a6fd0', 4) + L('M21,81 C30,84 50,84 59,81', '#9b8af0', 2) + reflet('M24,64 C21,72 21,82 24,88', 3) + E(40, 44, 14, 3.5, '#d8c9a8', 2.5);
    return s;
  },
  miel: function(g){
    var s = '';
    s += R(16, 36, 48, 59, 13, 'rgba(255,220,150,.15)', 0);
    s += '<path d="M17,52 C30,48 50,56 63,51 L63,82 C63,90 57,95 50,95 L30,95 C23,95 17,90 17,82 Z" fill="' + U_(g, 'miel') + '"/>';
    s += '<g fill="none" stroke="#b8680f" stroke-width="1.6" opacity=".7"><path d="M28,66 l4,-2.4 l4,2.4 v4.6 l-4,2.4 l-4,-2.4 Z"/><path d="M36,75 l4,-2.4 l4,2.4 v4.6 l-4,2.4 l-4,-2.4 Z"/><path d="M44,66 l4,-2.4 l4,2.4 v4.6 l-4,2.4 l-4,-2.4 Z"/></g>';
    s += R(16, 36, 48, 59, 13, U_(g, 'verre'), 3) + reflet('M21,48 C19,60 19,74 21,84', 3.5);
    s += P('M60,40 C61,48 64,52 62,58 C59,56 58,50 60,40 Z', '#eaa22a', 2);
    s += LK('M54,40 L72,8', '#c98450', 3) + E(73, 7, 6, 4.5, U_(g, 'bois'), 2.5, ' transform="rotate(-60 73 7)"') + L('M69,9 l6,3 M71,5 l6,3', K, 1.2);
    s += P('M12,38 C12,26 68,26 68,38 L64,44 C50,40 30,40 16,44 Z', '#e0504a', 3);
    s += '<g fill="#fff" opacity=".85">' + [[20,33],[30,31],[40,30],[50,31],[60,33],[25,38],[35,36],[45,36],[55,38]].map(function(p){ return '<rect x="' + (p[0] - 2) + '" y="' + (p[1] - 2) + '" width="4" height="4" rx="1"/>'; }).join('') + '</g>';
    s += L('M15,41 C30,45 50,45 65,41', '#e8c98a', 3);
    return s;
  },
  lune: function(g){
    var s = '<circle class="mjm-halo" cx="40" cy="64" r="40" fill="' + U_(g, 'haloC') + '"/>';
    s += C(40, 66, 29, 'rgba(220,240,255,.15)', 0);
    s += '<path d="M12,70 C24,62 56,62 68,70 C68,86 56,95 40,95 C24,95 12,86 12,70 Z" fill="' + U_(g, 'lunePoudre') + '"/>';
    s += '<g fill="#8ff3ff">' + [[24,76,1.6],[36,72,1.2],[50,78,1.8],[58,72,1.2],[42,86,1.4],[30,86,1.1]].map(function(p){ return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + p[2] + '"/>'; }).join('') + '</g>';
    s += P('M33,40 L33,30 L47,30 L47,40 C60,44 69,54 69,66 C69,82 56,95 40,95 C24,95 11,82 11,66 C11,54 20,44 33,40 Z', U_(g, 'verre'), 3) + reflet('M19,58 C15,66 16,76 21,84', 3.5);
    s += R(31, 22, 18, 9, 3, U_(g, 'liege'), 2.5);
    s += '<g class="mjm-tourne-lent">' + etoile4(40, 15, 10, U_(g, 'or')) + '<path d="M40,5 Q42.2,12.8 50,15 Q42.2,17.2 40,25 Q37.8,17.2 30,15 Q37.8,12.8 40,5 Z" fill="none" stroke="' + K + '" stroke-width="2"/></g>';
    s += '<g class="mjm-scint">' + etoile4(14, 40, 5, '#fff') + '</g><g class="mjm-scint d2">' + etoile4(68, 46, 4, '#bff9ff') + '</g><g class="mjm-scint d3">' + etoile4(62, 88, 3.5, '#fff') + '</g>';
    return s;
  },
  charbon: function(g){
    var s = '';
    s += L('M14,58 C14,30 66,30 66,58', K, 5) + L('M14,58 C14,30 66,30 66,58', '#8a83a8', 2);
    [[22,52,10],[36,46,12],[52,50,11],[60,56,8],[30,58,9],[45,58,10],[16,58,7]].forEach(function(b, i){
      var x = b[0], y = b[1], r = b[2];
      s += P('M' + (x - r) + ',' + (y + r * 0.5) + ' L' + (x - r * 0.6) + ',' + (y - r * 0.6) + ' L' + (x + r * 0.2) + ',' + (y - r) + ' L' + (x + r) + ',' + (y - r * 0.2) + ' L' + (x + r * 0.8) + ',' + (y + r * 0.6) + ' L' + x + ',' + (y + r) + ' Z', U_(g, 'charbon'), 2.2) +
        P('M' + (x - r * 0.6) + ',' + (y - r * 0.6) + ' L' + (x + r * 0.2) + ',' + (y - r) + ' L' + x + ',' + (y - r * 0.1) + ' Z', i % 2 ? '#6e6886' : '#5a5470', 0);
    });
    s += P('M10,58 L70,58 L63,95 L17,95 Z', U_(g, 'metal'), 3) + E(40, 58, 30, 5, U_(g, 'metalV'), 3) + L('M14,70 H66 M15,82 H65', 'rgba(255,255,255,.12)', 2.4) + reflet('M18,64 L22,90', 3);
    s += C(14, 62, 3, '#8a83a8', 2) + C(66, 62, 3, '#8a83a8', 2);
    return s;
  },
  racine: function(g){
    var s = '';
    s += R(17, 28, 46, 67, 11, 'rgba(255,230,200,.12)', 0);
    s += LK('M26,90 C22,74 34,70 30,56 C27,46 36,40 40,36', '#9a5a32', 5) + LK('M50,92 C56,78 44,72 50,60 C54,52 48,44 42,38', '#8f4c2a', 5);
    s += LK('M30,70 C36,66 40,70 46,66', '#b07040', 2.6) + LK('M31,58 C24,54 22,48 24,42', '#b07040', 2.2) + LK('M49,74 C56,72 58,66 58,60', '#b07040', 2.2) + LK('M37,84 C40,78 44,80 46,76', '#b07040', 2);
    s += C(36, 50, 2, '#e3b98a', 0) + C(47, 64, 1.8, '#e3b98a', 0);
    s += R(17, 28, 46, 67, 11, U_(g, 'verre'), 3) + reflet('M22,40 C20,56 20,72 22,84', 3.5);
    s += R(21, 15, 38, 16, 5, U_(g, 'liege'), 3) + C(30, 22, 1.4, '#8a5a2a', 0) + C(42, 20, 1.4, '#8a5a2a', 0) + C(50, 25, 1.4, '#8a5a2a', 0);
    s += L('M19,33 C30,37 50,37 61,33', '#c9a26a', 2.5);
    return s;
  }
};

/* ---------- La scène : fenêtre, établi, fiole modèle, cheminée, chaudron (viewBox 0 0 440 330) ---------- */
var CH = {x:305, rim:174, rxO:112, ryO:27, rxB:97, ryB:20, cyB:177};
function flammes(cx, by, s){
  s = s || 1;
  function fl(cls, d){ return '<path class="mjm-fl ' + cls + '" d="' + d + '"/>'; }
  var a = function(v){ return f1(v * s); };
  return '<g class="mjm-feu" transform="translate(' + cx + ',' + by + ')">' +
    '<ellipse class="mjm-braises" cx="0" cy="2" rx="' + a(70) + '" ry="' + a(9) + '"/>' +
    fl('f1', 'M' + a(-50) + ',0 C' + a(-62) + ',' + a(-24) + ' ' + a(-40) + ',' + a(-36) + ' ' + a(-44) + ',' + a(-56) + ' C' + a(-28) + ',' + a(-40) + ' ' + a(-20) + ',' + a(-26) + ' ' + a(-22) + ',0 Z') +
    fl('f2', 'M' + a(-18) + ',0 C' + a(-30) + ',' + a(-32) + ' ' + a(-6) + ',' + a(-46) + ' ' + a(-8) + ',' + a(-74) + ' C' + a(12) + ',' + a(-46) + ' ' + a(18) + ',' + a(-28) + ' ' + a(12) + ',0 Z') +
    fl('f3', 'M' + a(20) + ',0 C' + a(12) + ',' + a(-24) + ' ' + a(34) + ',' + a(-34) + ' ' + a(30) + ',' + a(-54) + ' C' + a(48) + ',' + a(-36) + ' ' + a(56) + ',' + a(-18) + ' ' + a(46) + ',0 Z') +
    fl('f4', 'M' + a(-6) + ',0 C' + a(-12) + ',' + a(-16) + ' ' + a(0) + ',' + a(-22) + ' ' + a(2) + ',' + a(-36) + ' C' + a(10) + ',' + a(-22) + ' ' + a(16) + ',' + a(-12) + ' ' + a(10) + ',0 Z') +
    '</g>';
}
function fioleCorps(cx, by, k){
  /* fiole ronde : col + panse ; by = base ; k = échelle */
  function X(v){ return f1(cx + v * k); } function Y(v){ return f1(by + v * k); }
  return 'M' + X(-9) + ',' + Y(-100) + ' L' + X(9) + ',' + Y(-100) + ' L' + X(9) + ',' + Y(-68) + ' C' + X(24) + ',' + Y(-64) + ' ' + X(34) + ',' + Y(-52) + ' ' + X(34) + ',' + Y(-36) +
    ' C' + X(34) + ',' + Y(-16) + ' ' + X(19) + ',' + Y(-2) + ' ' + X(0) + ',' + Y(-2) + ' C' + X(-19) + ',' + Y(-2) + ' ' + X(-34) + ',' + Y(-16) + ' ' + X(-34) + ',' + Y(-36) +
    ' C' + X(-34) + ',' + Y(-52) + ' ' + X(-24) + ',' + Y(-64) + ' ' + X(-9) + ',' + Y(-68) + ' Z';
}
function sceneSVG(g, cible){
  var s = '<svg class="mjm-scene-svg" viewBox="0 0 440 330" preserveAspectRatio="xMidYMax meet" aria-hidden="true">';
  var FEN = 'M24,176 V76 A55,55 0 0 1 134,76 V176 Z';
  s += '<defs><clipPath id="' + g + 'fen"><path d="' + FEN + '"/></clipPath>' +
    '<clipPath id="' + g + 'bch"><ellipse cx="' + CH.x + '" cy="' + CH.cyB + '" rx="' + CH.rxB + '" ry="' + CH.ryB + '"/></clipPath>' +
    '<clipPath id="' + g + 'fio"><path d="' + fioleCorps(78, 204, 1) + '"/></clipPath>' +
    '<clipPath id="' + g + 'fin"><path d="' + fioleCorps(0, 0, 1.15) + '"/></clipPath></defs>';

  /* --- la fenêtre de nuit --- */
  s += '<g class="mjm-fenetre"><g clip-path="url(#' + g + 'fen)"><rect x="20" y="14" width="118" height="166" fill="' + U_(g, 'ciel') + '"/>' +
    '<circle cx="104" cy="62" r="40" fill="' + U_(g, 'haloL') + '"/><circle cx="104" cy="62" r="15" fill="#fff4cf"/><circle cx="109" cy="58" r="3.6" fill="#f0e2b0"/><circle cx="99" cy="67" r="2.4" fill="#f0e2b0"/>' +
    '<g fill="#fff"><circle class="mjm-scint" cx="40" cy="50" r="1.8"/><circle cx="58" cy="34" r="1.3"/><circle class="mjm-scint d2" cx="72" cy="96" r="1.5"/><circle cx="44" cy="112" r="1.2"/><circle class="mjm-scint d3" cx="124" cy="110" r="1.4"/><circle cx="88" cy="28" r="1.1"/></g>' +
    '<path d="M20,180 L20,150 C34,140 44,124 58,134 C70,120 86,126 96,138 C108,128 122,126 138,142 L138,180 Z" fill="#141a3a"/>' +
    '<path d="M60,140 l0,-12 l4,-6 l4,6 l0,12 Z" fill="#1d2550"/><rect x="62" y="132" width="3" height="4" fill="#ffd36a"/>' +
    '<g class="mjm-brume"><path d="M-30,160 C0,150 30,166 60,156 C90,146 120,162 150,154 C170,150 190,158 200,156 L200,180 L-30,180 Z" fill="rgba(200,210,255,.22)"/></g></g>' +
    '<path d="' + FEN + '" fill="none" stroke="' + K + '" stroke-width="15"/><path d="' + FEN + '" fill="none" stroke="#8a5a3a" stroke-width="7"/>' +
    L('M79,22 V176 M26,118 H132', K, 9) + L('M79,22 V176 M26,118 H132', '#8a5a3a', 4) +
    R(12, 172, 134, 12, 4, U_(g, 'boisH'), 3.5) + '</g>';
  s += '<circle class="mjm-lune-halo" cx="78" cy="148" r="70" fill="' + U_(g, 'haloL') + '" opacity=".55"/>';

  /* --- la cheminée --- */
  var pierres = '', joints = '';
  for(var yy = 52, rg = 0; yy > -330; yy -= 34, rg++){
    pierres += 'M194,' + yy + ' H416 ';
    for(var xx = 194 + (rg % 2 ? 36 : 0) + 36; xx < 414; xx += 72) joints += 'M' + xx + ',' + yy + ' V' + (yy - 34) + ' ';
  }
  s += '<g class="mjm-cheminee">' + P('M192,-340 L418,-340 L418,52 L448,90 L162,90 L192,52 Z', U_(g, 'pierreF'), 4) +
    L(pierres + joints, 'rgba(24,16,36,.42)', 3) + L('M200,-340 V50', 'rgba(255,255,255,.08)', 6) +
    '<path d="M196,52 L414,52 L440,86 L170,86 Z" fill="rgba(20,10,20,.35)"/>' +
    /* blason de l'alchimiste sur la hotte : lune et étoiles */
    C(305, 18, 27, U_(g, 'or'), 4) + C(305, 18, 19, '#3a2c5c', 3) +
    '<path d="M311,6 A13,13 0 1 0 311,30 A10,10 0 1 1 311,6 Z" fill="#ffe9a3" stroke="' + K + '" stroke-width="1.5"/>' +
    etoile4(312, 12, 4, '#fff6d8') + etoile4(316, 24, 2.6, '#bff9ff') +
    R(176, 100, 28, 222, 6, U_(g, 'pierreF'), 4) + R(406, 100, 28, 222, 6, U_(g, 'pierreF'), 4) +
    L('M178,150 H202 M178,206 H202 M178,262 H202 M408,150 H432 M408,206 H432 M408,262 H432', 'rgba(36,24,46,.35)', 3) +
    P('M204,322 L204,158 C204,112 406,112 406,158 L406,322 Z', '#1b0e0a', 4) +
    '<ellipse class="mjm-foyer" cx="305" cy="300" rx="104" ry="64" fill="' + U_(g, 'foyer') + '"/>' +
    R(156, 86, 298, 17, 6, U_(g, 'bois'), 4) + reflet('M166,92 H444', 2.5) +
    /* sur le manteau : bougie, petites fioles */
    R(170, 60, 13, 27, 4, '#f6ecd2', 3) + '<path class="mjm-flamme" d="M176.5,60 c-5,-6 -3,-12 0,-18 c3,6 5,12 0,18 Z" fill="#ffd36a" stroke="#e8693c" stroke-width="2"/>' +
    '<circle class="mjm-halo" cx="176" cy="48" r="26" fill="' + U_(g, 'halo') + '"/>' +
    P('M414,86 L414,74 C406,72 404,62 410,56 L410,48 L420,48 L420,56 C426,62 424,72 416,74 L416,86 Z', '#ef7fa8', 2.5) + R(409, 42, 12, 7, 2, U_(g, 'liege'), 2) +
    P('M432,86 L432,66 L428,62 L428,54 L438,54 L438,62 L434,66 L434,86 Z', '#8ff3ff', 2.5) +
    /* herbes séchées et ail suspendus au manteau */
    L('M224,103 V114', '#5a4630', 2.5) + R(218, 112, 12, 7, 3, '#c58a4a', 2) +
    P('M212,119 C206,140 214,160 224,176 C234,160 242,140 236,119 Z', '#a77bf0', 3) + L('M224,122 V170 M218,132 L224,146 M230,138 L224,152', '#7d5bd0', 2) +
    L('M390,103 V112', '#5a4630', 2.5) + C(384, 118, 7, '#f4ecdc', 2.5) + C(396, 120, 7, '#efe4cc', 2.5) + C(390, 130, 7.5, '#f4ecdc', 2.5) + C(386, 142, 6.5, '#efe4cc', 2.5) + C(395, 141, 6, '#f4ecdc', 2.5) +
    '</g>';

  /* --- l'établi et la fiole modèle --- */
  s += '<g class="mjm-etabli">' + R(10, 214, 13, 108, 3, U_(g, 'boisS'), 3.5) + R(128, 214, 13, 108, 3, U_(g, 'boisS'), 3.5) +
    R(4, 282, 144, 10, 3, U_(g, 'bois'), 3.5) +
    R(18, 262, 10, 20, 2, '#c0392b', 2.5) + R(28, 258, 11, 24, 2, '#3f9a6a', 2.5) + R(39, 264, 9, 18, 2, '#6a3fb0', 2.5) + P('M50,281 L56,262 L66,264 L60,282 Z', '#d9a24a', 2.5) +
    P('M100,282 C96,272 98,264 108,262 L118,262 C126,264 128,272 124,282 Z', U_(g, 'terre'), 2.5) +
    P('M-4,204 L156,204 L160,216 L-8,216 Z', U_(g, 'boisH'), 3.5) + R(-8, 214, 168, 14, 3, U_(g, 'bois'), 3.5) + reflet('M2,208 H150', 2.5) +
    /* mortier */
    L('M16,184 L34,166', K, 7) + L('M16,184 L34,166', '#d9d2ea', 3) +
    P('M6,190 C6,206 36,206 36,190 Z', U_(g, 'pierre'), 3) + E(21, 190, 15, 4, '#6d6890', 2.5) +
    /* bougie */
    '<circle class="mjm-halo" cx="140" cy="172" r="30" fill="' + U_(g, 'halo') + '"/>' +
    R(133, 178, 13, 26, 4, '#f6ecd2', 3) + '<path class="mjm-flamme" d="M139.5,178 c-5,-6 -3,-12 0,-18 c3,6 5,12 0,18 Z" fill="#ffd36a" stroke="#e8693c" stroke-width="2"/>' +
    /* étiquette « À préparer » */
    L('M48,228 L50,236 M108,228 L106,236', '#5a4630', 2) +
    P('M34,236 L122,236 L120,258 L36,258 Z', '#f3e7cb', 2.5) +
    '<text class="mjm-etiq-svg" x="78" y="252" text-anchor="middle">À préparer</text>' +
    '</g>';

  /* la fiole modèle : la couleur à obtenir */
  var ci = hex(cible);
  s += '<g class="mjm-modele">' +
    '<circle class="mjm-halo-cible" cx="78" cy="166" r="56" fill="' + ci + '" opacity=".28"/>' +
    P(fioleCorps(78, 204, 1), 'rgba(220,235,255,.12)', 0) +
    '<g clip-path="url(#' + g + 'fio)"><rect x="40" y="146" width="80" height="62" fill="' + ci + '"/>' +
    '<ellipse cx="78" cy="147" rx="34" ry="6" fill="' + hex(clair(cible, 0.35)) + '"/>' +
    '<ellipse cx="66" cy="166" rx="14" ry="10" fill="#fff" opacity=".18"/></g>' +
    P(fioleCorps(78, 204, 1), U_(g, 'verreF'), 3.5) + reflet('M54,156 C50,166 52,180 58,188', 4) + reflet('M72,110 V130', 2.5) +
    R(66, 92, 24, 14, 4, U_(g, 'liege'), 3) +
    L('M88,118 C96,118 100,124 104,128', '#c9a26a', 2) + P('M100,126 L116,124 L120,140 L104,142 Z', '#f3e7cb', 2.2) +
    '<path d="M110,128 l1.6,3.4 3.6,.3 -2.8,2.3 .9,3.5 -3.3,-1.9 -3.3,1.9 .9,-3.5 -2.8,-2.3 3.6,-.3 Z" fill="#f5b945" stroke="' + K + '" stroke-width="1"/>' +
    '</g>';

  /* --- le chaudron --- */
  var bl = '';
  [[262,0,7],[290,4,5],[320,-2,8],[348,3,5.5],[276,8,4],[334,9,4.5],[305,2,6]].forEach(function(b, i){
    bl += '<circle class="mjm-bl" style="animation-delay:' + (i * 0.31).toFixed(2) + 's" cx="' + b[0] + '" cy="' + (CH.cyB + b[1]) + '" r="' + b[2] + '"/>';
  });
  var monte = '';
  [[270,0],[300,0.7],[330,1.4],[288,2.1],[318,2.8]].forEach(function(b){ monte += '<circle class="mjm-monte" style="animation-delay:' + b[1] + 's" cx="' + b[0] + '" cy="' + (CH.cyB - 4) + '" r="5"/>'; });
  var ecume = '';
  [[214,172,13],[238,162,15],[268,156,16],[300,154,17],[332,155,16],[362,160,15],[390,170,13],[226,186,11],[384,186,11],[300,194,12]].forEach(function(b, i){ ecume += '<circle style="animation-delay:' + (i * 0.07).toFixed(2) + 's" cx="' + b[0] + '" cy="' + b[1] + '" r="' + b[2] + '"/>'; });
  s += '<g class="mjm-gch">' +
    flammes(CH.x, 322, 1.3) +
    R(232, 312, 146, 14, 7, U_(g, 'boisS'), 3.5, ' transform="rotate(-5 305 319)"') + R(232, 312, 146, 14, 7, U_(g, 'bois'), 3.5, ' transform="rotate(6 305 319)"') + C(234, 312, 5, '#e9bb84', 2.5, ' transform="rotate(6 305 319)"') + C(376, 312, 5, '#e9bb84', 2.5, ' transform="rotate(-5 305 319)"') +
    L('M246,268 L228,324 M364,268 L382,324', K, 12) + L('M246,268 L228,324 M364,268 L382,324', '#5a5078', 5) +
    L('M198,192 C174,190 172,226 200,224 M412,192 C436,190 438,226 410,224', K, 8) + L('M198,192 C174,190 172,226 200,224 M412,192 C436,190 438,226 410,224', '#6a5f92', 3) +
    P('M196,174 C184,250 236,292 305,292 C374,292 426,250 414,174 Z', U_(g, 'metal'), 4.5) +
    reflet('M214,194 C218,232 240,260 270,276', 7) + L('M392,198 C390,228 376,252 352,270', 'rgba(0,0,0,.25)', 7) +
    E(CH.x, CH.rim, CH.rxO, CH.ryO, U_(g, 'metalV'), 4.5) +
    '<ellipse cx="' + CH.x + '" cy="' + CH.cyB + '" rx="' + CH.rxB + '" ry="' + CH.ryB + '" fill="' + U_(g, 'bouche') + '"/>' +
    '<g clip-path="url(#' + g + 'bch)"><g class="mjm-liq-g">' +
      '<ellipse class="mjm-liq" cx="' + CH.x + '" cy="' + CH.cyB + '" rx="' + CH.rxB + '" ry="' + CH.ryB + '"/>' +
      '<ellipse class="mjm-liq-lustre" cx="' + CH.x + '" cy="' + CH.cyB + '" rx="' + CH.rxB + '" ry="' + CH.ryB + '" fill="' + U_(g, 'lustre') + '"/>' +
      '<g class="mjm-tour"><path d="M240,190 C262,180 300,180 330,186 M262,196 C290,202 330,198 362,190" fill="none" stroke="#fff" stroke-opacity=".38" stroke-width="3" stroke-linecap="round"/></g>' +
      '<g class="mjm-bulles">' + bl + '</g><g class="mjm-ondes"></g>' +
    '</g></g>' +
    '<ellipse class="mjm-lueur-liq" cx="' + CH.x + '" cy="160" rx="150" ry="70" fill="' + U_(g, 'lueurLiq') + '"/>' +
    '<g class="mjm-monte-g">' + monte + '</g>' +
    '<g class="mjm-vapeur"><path d="M262,140 C252,118 274,106 262,82"/><path d="M305,130 C293,106 317,94 305,64"/><path d="M348,140 C338,118 360,106 348,84"/></g>' +
    '<g class="mjm-ecume">' + ecume + '</g>' +
    '<g class="mjm-louche">' + L('M384,188 L428,80', K, 13) + L('M384,188 L428,80', '#c98450', 6) + L('M386,178 L425,84', '#f0c08a', 2) + C(429, 77, 7, U_(g, 'bois'), 3) + '</g>' +
    '<g class="mjm-rot" transform="translate(0,-10)"><g class="mjm-rot-1">' + P('M282,150 C268,150 262,136 272,128 C268,114 286,106 296,114 C304,102 326,106 326,120 C340,120 344,138 332,146 C330,156 314,160 306,152 C298,160 284,158 282,150 Z', U_(g, 'fumee'), 3.5) +
      C(290, 132, 4, '#e8ffd0', 0, ' opacity=".7"') + C(316, 124, 3, '#e8ffd0', 0, ' opacity=".7"') + '</g>' +
      '<g class="mjm-rot-2">' + P('M256,118 C246,116 244,104 252,100 C252,90 266,88 270,96 C278,92 288,100 282,108 C286,116 276,122 270,118 C266,124 258,124 256,118 Z', U_(g, 'fumee'), 3) + '</g>' +
      '<g class="mjm-rot-3">' + P('M338,104 C330,102 330,92 336,90 C338,82 350,82 352,90 C360,90 362,100 356,104 C356,110 346,112 344,108 C342,112 338,110 338,104 Z', U_(g, 'fumee'), 3) + '</g></g>' +
    '</g>';
  /* gouttes d'éclaboussure (au-dessus de tout) */
  s += '<g class="mjm-eclab"></g>';

  /* --- la fiole de la victoire (cachée) --- */
  s += '<g class="mjm-fin-g" transform="translate(168,324)"><g class="mjm-fin">' +
    '<circle class="mjm-fin-halo" cx="0" cy="-44" r="70" fill="' + ci + '" opacity=".4"/>' +
    P(fioleCorps(0, 0, 1.15), 'rgba(220,235,255,.15)', 0) +
    '<g clip-path="url(#' + g + 'fin)"><g class="mjm-fin-liq"><rect x="-44" y="-84" width="88" height="90" style="fill:var(--liq)"/><ellipse cx="0" cy="-84" rx="44" ry="6" style="fill:var(--liq-c)"/></g></g>' +
    P(fioleCorps(0, 0, 1.15), U_(g, 'verreF'), 4) + reflet('M-28,-56 C-33,-44 -31,-28 -24,-18', 4.5) +
    '<g class="mjm-bouchon">' + R(-14, -130, 28, 16, 5, U_(g, 'liege'), 3.5) + '</g>' +
    '<g class="mjm-fin-etin"><text x="-52" y="-96">✦</text><text x="46" y="-110">✧</text><text x="52" y="-40">✦</text><text x="-58" y="-30">✧</text><text x="0" y="-150">✦</text></g>' +
    '</g></g>' +
    '<path class="mjm-filet" d="M208,172 C192,140 170,160 168,200" fill="none" stroke-width="9" stroke-linecap="round" style="stroke:var(--liq)"/>';
  return s + '</svg>';
}

/* ---------- Le visage dégoûté (Beurk) ---------- */
function visageBeurk(){
  return '<svg class="mjm-beurk-svg" viewBox="0 0 120 120" aria-hidden="true">' +
    '<g class="mjm-mouche"><circle cx="100" cy="18" r="3.4" fill="' + K + '"/><ellipse cx="97" cy="13" rx="3.5" ry="2.2" fill="#dff6ff" stroke="' + K + '" stroke-width="1"/><ellipse cx="103" cy="13" rx="3.5" ry="2.2" fill="#dff6ff" stroke="' + K + '" stroke-width="1"/></g>' +
    L('M10,40 C16,34 8,26 14,20 M108,52 C114,46 106,38 112,32 M18,98 C24,92 16,84 22,78', '#7fcf5a', 4) +
    '<g class="mjm-tete-beurk">' +
    C(60, 62, 44, '#ffdcbc', 4) +
    '<path d="M20,72 C26,104 94,104 100,72 C84,82 36,82 20,72 Z" fill="#9fdf6e" opacity=".75"/>' +
    E(30, 66, 8, 5, '#ff9db4', 0, ' opacity=".5"') + E(90, 66, 8, 5, '#ff9db4', 0, ' opacity=".5"') +
    L('M30,34 L48,42', K, 4.5) + L('M90,34 L72,42', K, 4.5) +
    L('M34,46 L48,53 L34,60', K, 5) + L('M86,46 L72,53 L86,60', K, 5) +
    P('M36,78 C42,72 48,82 54,76 C60,70 66,82 72,76 C76,72 82,76 84,78 C78,92 42,92 36,78 Z', '#7a2a3a', 3.5) +
    P('M52,84 C50,100 70,102 68,84 Z', '#ff7aa0', 3) + L('M60,86 V95', '#d9557d', 2) +
    P('M76,86 C77,94 80,98 78,104 C74,100 73,94 76,86 Z', '#9fdf6e', 2) +
    P('M100,28 C95,37 104,42 104,34 C104,31 102,30 100,28 Z', '#8ff3ff', 2) +
    '</g></svg>';
}

/* ---------- Cœurs du bandeau ---------- */
var COEUR = '<svg viewBox="0 0 24 22" aria-hidden="true"><path d="M12 20.5 C5 15 1.5 11.2 1.5 7 C1.5 3.8 4 1.5 7 1.5 C9.1 1.5 10.9 2.7 12 4.5 C13.1 2.7 14.9 1.5 17 1.5 C20 1.5 22.5 3.8 22.5 7 C22.5 11.2 19 15 12 20.5 Z"/></svg>';
function tempsTexte(s){ var m = Math.floor(s / 60), r = Math.round(s % 60); return m ? m + ' min' + (r ? ' ' + r + ' s' : '') : r + ' s'; }

/* ---------- Gestion d'une partie : minuteurs, écouteurs, boucle, animations ---------- */
function Partie(fin){
  var p = {fini:false, timers:[], stops:[], anims:[]};
  p.apres = function(ms, fn){ var t = setTimeout(function(){ p.timers = p.timers.filter(function(x){ return x !== t; }); if(!p.fini) fn(); }, ms); p.timers.push(t); return t; };
  p.ecoute = function(c, type, fn, o){ c.addEventListener(type, fn, o); p.stops.push(function(){ c.removeEventListener(type, fn, o); }); };
  p.boucle = function(fn){ var s = U.boucle(function(dt, t){ if(p.fini) return false; return fn(dt, t); }); p.stops.push(s); return s; };
  p.anim = function(el, kf, o, fn){
    var a = null;
    try{ a = el.animate(kf, o); }catch(e){ a = null; }
    if(!a){ if(fn) p.apres(o.duration || 0, fn); return null; }
    p.anims.push(a);
    a.onfinish = function(){ p.anims = p.anims.filter(function(x){ return x !== a; }); if(!p.fini && fn) fn(); };
    return a;
  };
  p.nettoyer = function(){
    p.stops.forEach(function(f){ try{ f(); }catch(e){} }); p.stops = [];
    p.timers.forEach(clearTimeout); p.timers = [];
    p.anims.forEach(function(a){ try{ a.onfinish = null; a.cancel(); }catch(e){} }); p.anims = [];
  };
  p.terminer = function(res){ if(p.fini) return; p.fini = true; p.nettoyer(); fin(res); };
  p.arreter = function(){ p.fini = true; p.nettoyer(); };
  return p;
}

/* ==========================================================
   Le mini-jeu
   ========================================================== */
var ETAGERES = {
  petit: ['myrtille', 'coquelicot', 'pensee', 'menthe', 'lune', 'charbon'],
  moyen: ['myrtille', 'coquelicot', 'pensee', 'menthe', 'lavande', 'miel', 'lune', 'charbon'],
  grand: ['myrtille', 'coquelicot', 'pensee', 'menthe', 'lavande', 'miel', 'lune', 'charbon', 'racine']
};
var PLEIN = 60;   /* portions au maximum dans le chaudron */

var def = {
  nom:'Le bon mélange', role:'alchimiste', ic:'🎨', minuteur:true,
  consigne:'Touche les pots pour verser des ingrédients dans le chaudron. Quand ta potion a la même couleur que la fiole, goûte-la ! Pas trop d\'ingrédients, sinon il faudra simplifier.',
  reglages: function(n, mods){
    mods = mods || {};
    var p = {};
    p.etagere = (n <= 2 ? ETAGERES.petit : (n <= 5 ? ETAGERES.moyen : ETAGERES.grand)).slice();
    p.reserve = p.etagere.filter(function(id){ return n <= 2 ? ['myrtille', 'coquelicot', 'pensee', 'lune'].indexOf(id) >= 0 : (n <= 3 ? id !== 'charbon' : true); });
    p.nbIngr = n <= 3 ? 2 : (n <= 7 ? 3 : 4);
    p.qMax = n <= 2 ? 2 : (n <= 6 ? 3 : 4);
    p.totalMax = Math.max(p.nbIngr, Math.round(courbe(n, {1:3, 3:4, 6:6, 9:8, 12:9})));
    p.vif = n <= 4;
    p.tolBase = courbe(n, {1:0.085, 3:0.072, 6:0.058, 10:0.045, 12:0.04});
    p.tol = p.tolBase * (mods.zone || 1);
    p.coeurs = Math.max(1, Math.round(courbe(n, {1:4, 3:3, 6:2, 10:1})) + (mods.erreurs || 0));
    p.marge = Math.max(0, Math.round(courbe(n, {1:3, 3:2, 6:2, 10:1, 12:1})));
    p.duree = Math.round(courbe(n, {1:300, 3:240, 6:200, 10:160, 12:140}) / (mods.lent || 1) + (mods.temps || 0));
    p.aide = mods.aide || 0;
    p.barre = !!(mods.barre || mods.revele || p.aide >= 2);
    p.chiffres = !!mods.revele;
    var precis = p.tol >= 0.08 ? 'à peu près pareille' : (p.tol >= 0.062 ? 'presque pareille' : (p.tol >= 0.05 ? 'très ressemblante' : 'exactement pareille'));
    p.lignes = [
      {nom:'Ingrédients dans la recette', val:String(p.nbIngr)},
      {nom:'Pots sur l\'étagère', val:String(p.etagere.length)},
      {nom:'La couleur doit être', val:precis},
      {nom:'Portions en trop permises', val:p.marge ? String(p.marge) : 'aucune'},
      {nom:'Cœurs (erreurs permises)', val:String(p.coeurs - 1)},
      {nom:'Temps', val:tempsTexte(p.duree)}
    ];
    if(p.barre) p.lignes.push({nom:'Barre de ressemblance', val:p.chiffres ? 'oui, avec les chiffres' : 'oui'});
    if(p.aide) p.lignes.push({nom:'Indice', val:Math.min(p.aide, p.nbIngr - 1) > 1 ? Math.min(p.aide, p.nbIngr - 1) + ' bons ingrédients brillent' : 'un bon ingrédient brille'});
    return p;
  },

  /* ---------- Petite démo pour l'écran de consigne ---------- */
  demo: function(el){
    var g = 'mjmd' + (++uid) + '-', actif = true, timers = [];
    var cible = couleur({myrtille:1, pensee:1});
    el.innerHTML = '<svg class="mjm-demo" viewBox="0 0 300 170" preserveAspectRatio="xMidYMid meet" style="--liq:' + rgb(EAU) + ';--liq-c:' + rgb(clair(EAU, 0.4)) + '">' + defs(g) +
      '<rect width="300" height="170" fill="#2b2148"/><rect y="132" width="300" height="38" fill="#6b3f24"/><rect y="128" width="300" height="7" fill="#62381d"/>' +
      '<g transform="translate(16,20) scale(.82)">' + R(0, 112, 64, 8, 3, U_(g, 'boisH'), 3) + P(fioleCorps(32, 112, 0.86), rgb(cible), 3) + P(fioleCorps(32, 112, 0.86), U_(g, 'verre'), 3) + R(24, 18, 16, 10, 3, U_(g, 'liege'), 2.5) + '</g>' +
      '<g transform="translate(108,40)">' + L('M18,76 L8,96 M102,76 L112,96', K, 7) + flammes(60, 98, 0.55) +
      P('M2,40 C-4,82 26,94 60,94 C94,94 124,82 118,40 Z', U_(g, 'metal'), 3.5) + E(60, 40, 60, 14, U_(g, 'metalV'), 3.5) +
      '<ellipse class="mjm-demo-liq" cx="60" cy="42" rx="52" ry="10" style="fill:var(--liq)"/>' +
      '<circle class="mjm-bl" cx="44" cy="42" r="4" style="fill:var(--liq-c)"/><circle class="mjm-bl" style="animation-delay:.6s;fill:var(--liq-c)" cx="74" cy="44" r="3"/></g>' +
      R(222, 70, 74, 7, 3, U_(g, 'boisH'), 3) +
      '<g transform="translate(222,10) scale(.6)"><g class="mjm-demo-pot p1">' + POTS.myrtille(g) + '</g></g>' +
      '<g transform="translate(258,10) scale(.6)"><g class="mjm-demo-pot p2">' + POTS.pensee(g) + '</g></g>' +
      '<g class="mjm-demo-portion" style="opacity:0"><svg x="-10" y="-10" width="20" height="20" viewBox="-12 -12 24 24" overflow="visible"></svg></g>' +
      '<text class="mjm-demo-ok" x="62" y="22" text-anchor="middle" opacity="0">✔</text>' +
      '<g class="mjm-demo-main" style="transform:translate(270px,150px)"><g transform="scale(.62) rotate(-12)"><path d="M-5,4 C-5,-4 5,-4 5,4 L5,24 C9,21 15,22 16,27 C19,25 24,27 24,32 C27,31 31,34 30,40 L28,54 C27,60 21,64 13,64 L1,64 C-7,64 -11,59 -13,52 L-20,34 C-22,28 -16,25 -12,30 L-5,39 Z" fill="#ffe0c2" stroke="' + K + '" stroke-width="4" stroke-linejoin="round"/></g></g>' +
      '</svg>';
    var svg = el.querySelector('svg'), main = svg.querySelector('.mjm-demo-main'), por = svg.querySelector('.mjm-demo-portion'), porSvg = por.querySelector('svg'), ok = svg.querySelector('.mjm-demo-ok');
    function vivant(){ if(actif && !svg.isConnected){ arreter(); } return actif; }
    function apres(ms, fn){ timers.push(setTimeout(function(){ if(vivant()) fn(); }, ms)); }
    function liq(c){ svg.style.setProperty('--liq', rgb(c)); svg.style.setProperty('--liq-c', rgb(clair(c, 0.4))); }
    function main_(x, y, ms){ main.style.transition = 'transform ' + (ms || 500) + 'ms cubic-bezier(.4,.1,.3,1)'; main.style.transform = 'translate(' + x + 'px,' + y + 'px)'; }
    function verse(id, x0){
      porSvg.innerHTML = PORTIONS[id](g);
      por.style.transition = 'none'; por.style.opacity = '1'; por.style.transform = 'translate(' + x0 + 'px,24px)';
      void por.getBoundingClientRect();
      por.style.transition = 'transform .55s cubic-bezier(.3,.0,.6,1), opacity .1s .5s';
      por.style.transform = 'translate(168px,80px)'; por.style.opacity = '0';
      var pot = svg.querySelector(id === 'myrtille' ? '.p1' : '.p2'); pot.classList.remove('verse'); void pot.getBoundingClientRect(); pot.classList.add('verse');
    }
    function tour(){
      liq(EAU); ok.setAttribute('opacity', '0');
      apres(300, function(){ main_(246, 52); });
      apres(900, function(){ verse('myrtille', 246); });
      apres(1450, function(){ liq(couleur({myrtille:1})); U.son('plouf'); main_(280, 52); });
      apres(2050, function(){ verse('pensee', 280); });
      apres(2600, function(){ liq(cible); U.son('plouf'); main_(270, 150, 700); });
      apres(3200, function(){ ok.setAttribute('opacity', '1'); });
      apres(4800, tour);
    }
    function arreter(){ actif = false; timers.forEach(clearTimeout); timers = []; }
    tour();
    return {arreter: arreter};
  },

  /* ---------- La partie ---------- */
  jouer: function(el, p, fin){
    var G = Partie(fin), g = 'mjm' + (++uid) + '-';
    var etagere = (p.etagere || ETAGERES.moyen).filter(function(id){ return INGR[id]; });
    var recette = null;
    if(p.recette && Object.keys(p.recette).every(function(k){ return INGR[k] && p.recette[k] > 0; })) recette = Object.assign({}, p.recette);
    if(!recette) recette = genererRecette(p);
    Object.keys(recette).forEach(function(k){ if(etagere.indexOf(k) < 0) etagere.push(k); });
    var cible = couleur(recette), T = total(recette), limite = T + (p.marge || 0);
    var coeursMax = p.coeurs || 3, coeurs = coeursMax, duree = p.duree || 240, restant = duree;
    var comptes = {}, enVol = 0, etat = 'joue', attendGouter = false, dernierRate = null, compte = null;
    var affL = oklab(EAU), vouL = oklab(EAU), niv = 0.42, nivVoulu = 0.42;   /* la couleur glisse dans OKLab */

    /* --- construction --- */
    var racine = U.html('<div class="mjm">' +
      '<svg class="mjm-defs" width="0" height="0" aria-hidden="true" focusable="false">' + defs(g) + '</svg>' +
      '<div class="mjm-fond" aria-hidden="true"><div class="mjm-fond-svg"></div><i class="mjm-lueur-feu"></i><i class="mjm-lueur-lune"></i></div>' +
      '<div class="mjm-hud">' +
        '<div class="mjm-coeurs" aria-label="Cœurs"></div>' +
        '<div class="mjm-ress" hidden><span class="mjm-ress-ic">🎯</span><div class="mjm-ress-barre"><i></i><em></em></div><b></b></div>' +
        '<div class="mjm-sablier" aria-label="Temps"><span>⏳</span><div class="mjm-sab-barre"><i></i></div></div>' +
      '</div>' +
      '<div class="mjm-etag"><div class="mjm-rangs"></div>' +
        '<div class="mjm-panneau" hidden><div class="mjm-carte"></div></div></div>' +
      '<div class="mjm-scene">' + sceneSVG(g, cible) + '</div>' +
      '<div class="mjm-cpt"><div class="mjm-chips"></div><div class="mjm-div" hidden></div></div>' +
      '<div class="mjm-actions"><button class="btn second mjm-vider" type="button">♻️ <span>Vider</span></button><button class="btn grand mjm-gouter" type="button">👅 Goûter</button></div>' +
      '<div class="mjm-vol" aria-hidden="true"></div>' +
    '</div>');
    el.appendChild(racine);
    function q(s){ return racine.querySelector(s); }
    var svg = q('.mjm-scene-svg'), etag = q('.mjm-etag'), rangs = q('.mjm-rangs'), panneau = q('.mjm-panneau'), carte = q('.mjm-carte');
    var chips = q('.mjm-chips'), divEl = q('.mjm-div'), vol = q('.mjm-vol'), bVider = q('.mjm-vider'), bGouter = q('.mjm-gouter');
    var liqEl = svg.querySelector('.mjm-liq'), lustre = svg.querySelector('.mjm-liq-lustre'), bullesG = svg.querySelector('.mjm-bulles'), monteG = svg.querySelector('.mjm-monte-g');
    var ondes = svg.querySelector('.mjm-ondes'), eclab = svg.querySelector('.mjm-eclab'), gch = svg.querySelector('.mjm-gch'), louche = svg.querySelector('.mjm-louche');
    var coeursEl = q('.mjm-coeurs'), sabI = q('.mjm-sab-barre i'), sablier = q('.mjm-sablier');
    var ress = q('.mjm-ress'), ressI = q('.mjm-ress-barre i'), ressEm = q('.mjm-ress-barre em'), ressB = q('.mjm-ress b');

    /* les pots */
    var pots = {};
    etagere.forEach(function(id, i){
      var c = pur(id);
      var b = U.html('<button class="mjm-pot" type="button" data-ingr="' + id + '" aria-label="' + esc(nomIngr(id)) + '" style="--c:' + hex(c) + ';--i:' + i + '">' +
        '<svg class="mjm-pot-svg" viewBox="0 0 80 100" overflow="visible" aria-hidden="true">' + POTS[id](g) + '</svg>' +
        '<span class="mjm-etiq">' + esc(INGR[id].court) + '</span></button>');
      pots[id] = b;
    });
    /* indices : les ingrédients principaux de la recette brillent */
    var nbIndices = Math.min(p.aide || 0, Math.max(1, Object.keys(recette).length - 1));
    Object.keys(recette).sort(function(a, b){ return recette[b] - recette[a] || ORDRE.indexOf(a) - ORDRE.indexOf(b); }).slice(0, nbIndices).forEach(function(id){ pots[id].classList.add('mjm-indice'); });
    if(p.barre){ ress.hidden = false; ressEm.style.left = (100 * (1 - p.tol / 0.4)).toFixed(1) + '%'; if(!p.chiffres) ressB.hidden = true; }

    /* --- mise en page (portrait / paysage) et décor --- */
    var parRangActuel = 0;
    function construireRangs(par){
      parRangActuel = par;
      rangs.innerHTML = '';
      for(var i = 0; i < etagere.length; i += par){
        var r = U.html('<div class="mjm-rang"><div class="mjm-pots"></div><div class="mjm-planche"></div></div>');
        etagere.slice(i, i + par).forEach(function(id){ r.firstChild.appendChild(pots[id]); });
        rangs.appendChild(r);
      }
    }
    function versRacine(x, y){
      var m = svg.getScreenCTM(), rr = racine.getBoundingClientRect();
      if(!m) return {x:0, y:0};
      var pt = svg.createSVGPoint(); pt.x = x; pt.y = y; var o = pt.matrixTransform(m);
      return {x:o.x - rr.left, y:o.y - rr.top};
    }
    function mise(){
      var W = racine.clientWidth, H = racine.clientHeight;
      if(!W || !H) return;
      var pays = W > H * 1.08;
      racine.classList.toggle('mjm-paysage', pays);
      var u = pays ? Math.min(W / 800, H / 470) : Math.min(W / 400, H / 720);
      racine.style.setProperty('--u', borne(u, 0.82, 1.45).toFixed(3));
      var N = etagere.length, par = pays ? (N <= 4 ? 2 : 3) : Math.ceil(N / 2);
      if(par !== parRangActuel) construireRangs(par);
      var jw = pays ? Math.min(118, (W * 0.39 - 30) / par - 14) : Math.min(112, (W - 24) / par - 12);
      var maxH = H * 0.38;
      for(var i = 0; i < 10; i++){
        racine.style.setProperty('--pot', jw.toFixed(1) + 'px');
        var deborde = pays ? rangs.scrollHeight > etag.clientHeight + 1 : etag.offsetHeight > maxH;
        if(!deborde || jw <= 44) break;
        jw = Math.max(44, jw * 0.92);
      }
      dessinerFond(W, H, pays);
    }
    function dessinerFond(W, H, pays){
      var sol = versRacine(0, 322).y, chA = versRacine(CH.x, 250), lune = versRacine(78, 150);
      if(!isFinite(sol) || sol <= 0) sol = H * 0.7;
      sol = borne(sol, H * 0.3, H - 10);
      var f = 'mjmf' + uid + '-';
      var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" preserveAspectRatio="none"><defs>' +
        '<linearGradient id="' + f + 'mur" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#21193a"/><stop offset=".6" stop-color="#36295a"/><stop offset="1" stop-color="#433362"/></linearGradient>' +
        '<linearGradient id="' + f + 'sol" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5c341d"/><stop offset=".35" stop-color="#7a4a2c"/><stop offset="1" stop-color="#4a2a17"/></linearGradient>' +
        '<linearGradient id="' + f + 'ombre" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#140c18" stop-opacity=".55"/><stop offset="1" stop-color="#140c18" stop-opacity="0"/></linearGradient>' +
        '<linearGradient id="' + f + 'poutre" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#94603a"/><stop offset="1" stop-color="#62381d"/></linearGradient>' +
        '<radialGradient id="' + f + 'chaud"><stop offset="0" stop-color="#ff9a4a" stop-opacity=".34"/><stop offset=".5" stop-color="#ff7a3c" stop-opacity=".12"/><stop offset="1" stop-color="#ff7a3c" stop-opacity="0"/></radialGradient>' +
        '<radialGradient id="' + f + 'vign" cx=".5" cy=".45" r=".75"><stop offset=".55" stop-color="#05030c" stop-opacity="0"/><stop offset="1" stop-color="#05030c" stop-opacity=".6"/></radialGradient>' +
        '<pattern id="' + f + 'briq" width="96" height="52" patternUnits="userSpaceOnUse"><g fill="rgba(255,255,255,.035)" stroke="rgba(10,6,20,.34)" stroke-width="3">' +
          '<rect x="2" y="2" width="92" height="22" rx="9"/><rect x="-46" y="28" width="92" height="22" rx="9"/><rect x="50" y="28" width="92" height="22" rx="9"/></g></pattern>' +
        '</defs>';
      s += '<rect width="' + W + '" height="' + H + '" fill="url(#' + f + 'mur)"/><rect width="' + W + '" height="' + f1(sol) + '" fill="url(#' + f + 'briq)"/>';
      /* le sol en planches, en légère perspective */
      var cx = W / 2, l = '', pas = Math.max(46, W / 14);
      s += '<rect y="' + f1(sol) + '" width="' + W + '" height="' + f1(H - sol) + '" fill="url(#' + f + 'sol)"/>';
      for(var x = cx - Math.ceil(cx / pas) * pas; x <= W + pas; x += pas){ l += 'M' + f1(x) + ',' + f1(sol) + ' L' + f1(cx + (x - cx) * 1.9) + ',' + H + ' '; }
      var jt = '';
      for(var k = 0; k < 9; k++){ var yy = sol + (H - sol) * ((k * 0.37) % 1), xa = (k * 0.53 % 1) * W; jt += 'M' + f1(xa) + ',' + f1(yy) + ' h' + f1(pas * 0.9) + ' '; }
      s += '<path d="' + l + jt + '" fill="none" stroke="rgba(40,20,10,.45)" stroke-width="3"/>';
      s += '<rect y="' + f1(sol) + '" width="' + W + '" height="' + f1(Math.min(80, H - sol)) + '" fill="url(#' + f + 'ombre)"/>';
      s += '<rect y="' + f1(sol - 9) + '" width="' + W + '" height="11" fill="url(#' + f + 'poutre)" stroke="' + K + '" stroke-width="3"/>';
      /* poutre du plafond */
      s += '<rect y="-4" width="' + W + '" height="24" fill="url(#' + f + 'poutre)" stroke="' + K + '" stroke-width="4"/>';
      for(var b = 40; b < W; b += 170) s += '<rect x="' + b + '" y="16" width="30" height="16" rx="3" fill="url(#' + f + 'poutre)" stroke="' + K + '" stroke-width="3"/>';
      /* toile d'araignée dans le coin */
      s += '<path d="M' + (W - 2) + ',20 L' + (W - 60) + ',20 M' + (W - 2) + ',20 L' + (W - 2) + ',78 M' + (W - 2) + ',20 L' + (W - 44) + ',62 M' + (W - 46) + ',20 Q' + (W - 34) + ',34 ' + (W - 2) + ',64 M' + (W - 28) + ',20 Q' + (W - 20) + ',30 ' + (W - 2) + ',44" fill="none" stroke="rgba(220,225,255,.22)" stroke-width="1.5"/>';
      /* en paysage : des herbes qui sèchent au-dessus de l'armoire à pots */
      if(pays){
        var ra = rangs.getBoundingClientRect(), rr0 = racine.getBoundingClientRect(), uu = parseFloat(racine.style.getPropertyValue('--u')) || 1;
        var haut = ra.top - rr0.top - 18 * uu, place = haut - 30;
        if(place > 70){
          var lg = Math.min(place - 6, 130 * uu), cols = [['#a77bf0', '#7d5bd0'], ['#5fbf72', '#2e8a52'], ['#ffd84a', '#c9a227'], ['#ef7fa8', '#b8486e']];
          var nb = Math.max(2, Math.min(4, Math.floor((ra.width) / (70 * uu))));
          for(var hb = 0; hb < nb; hb++){
            var hx = ra.left - rr0.left + ra.width * (hb + 0.5) / nb, c2 = cols[hb % cols.length], top = 30, bas = top + lg, lb = lg * 0.62, wb = 15 * uu;
            s += '<path d="M' + f1(hx) + ',' + (top - 12) + ' V' + f1(bas - lb) + '" stroke="#5a4630" stroke-width="2.5"/>' +
              '<path d="M' + f1(hx - wb) + ',' + f1(bas - lb) + ' C' + f1(hx - wb * 1.5) + ',' + f1(bas - lb * 0.4) + ' ' + f1(hx - wb * 0.5) + ',' + f1(bas - lb * 0.1) + ' ' + f1(hx) + ',' + f1(bas) + ' C' + f1(hx + wb * 0.5) + ',' + f1(bas - lb * 0.1) + ' ' + f1(hx + wb * 1.5) + ',' + f1(bas - lb * 0.4) + ' ' + f1(hx + wb) + ',' + f1(bas - lb) + ' Z" fill="' + c2[0] + '" stroke="' + K + '" stroke-width="3" stroke-linejoin="round"/>' +
              '<path d="M' + f1(hx) + ',' + f1(bas - lb + 4) + ' V' + f1(bas - 8) + ' M' + f1(hx - wb * 0.5) + ',' + f1(bas - lb * 0.75) + ' L' + f1(hx) + ',' + f1(bas - lb * 0.5) + ' M' + f1(hx + wb * 0.5) + ',' + f1(bas - lb * 0.6) + ' L' + f1(hx) + ',' + f1(bas - lb * 0.35) + '" fill="none" stroke="' + c2[1] + '" stroke-width="2.5" stroke-linecap="round"/>' +
              '<rect x="' + f1(hx - wb * 0.55) + '" y="' + f1(bas - lb - 7) + '" width="' + f1(wb * 1.1) + '" height="9" rx="3" fill="#c58a4a" stroke="' + K + '" stroke-width="2.5"/>';
          }
        }
      }
      /* lumière chaude du feu, sur le mur et le sol */
      s += '<ellipse cx="' + f1(chA.x) + '" cy="' + f1(chA.y) + '" rx="' + f1(Math.max(W, H) * 0.5) + '" ry="' + f1(Math.max(W, H) * 0.42) + '" fill="url(#' + f + 'chaud)"/>';
      s += '<rect width="' + W + '" height="' + H + '" fill="url(#' + f + 'vign)"/>';
      q('.mjm-fond-svg').innerHTML = s + '</svg>';
      var lf = q('.mjm-lueur-feu'), ll = q('.mjm-lueur-lune');
      lf.style.left = f1(chA.x) + 'px'; lf.style.top = f1(chA.y) + 'px';
      ll.style.left = f1(lune.x) + 'px'; ll.style.top = f1(lune.y) + 'px';
    }
    var ro = null;
    if(window.ResizeObserver){ ro = new ResizeObserver(function(){ mise(); }); ro.observe(racine); G.stops.push(function(){ ro.disconnect(); }); }
    else G.ecoute(window, 'resize', mise);
    mise();

    /* --- affichages --- */
    /* la règle des cœurs (mj-core.js) : cœurs affichés = erreurs encore permises (coeurs − 1 : on perd quand coeurs tombe à 0) */
    function majCoeurs(casse){
      coeursEl.innerHTML = U.coeurs(coeurs - 1, coeursMax - 1, casse ? coeurs - 1 : undefined);
      if(casse && coeurs === 1) U.plusDeCoeur(racine);
    }
    function majLiquide(){
      var affiche = depuisOklab(affL);
      racine.style.setProperty('--liq', rgb(affiche));
      racine.style.setProperty('--liq-c', rgb(clair(affiche, 0.42)));
      racine.style.setProperty('--liq-s', rgb(sombre(affiche, 0.4)));
    }
    function majNiveau(){
      var d = (1 - niv) * 30, cy = CH.cyB + d, rx = CH.rxB - (1 - niv) * 18, ry = CH.ryB - (1 - niv) * 4;
      [liqEl, lustre].forEach(function(e){ e.setAttribute('cy', f1(cy)); e.setAttribute('rx', f1(rx)); e.setAttribute('ry', f1(ry)); });
      bullesG.setAttribute('transform', 'translate(0,' + f1(d) + ')');
      monteG.setAttribute('transform', 'translate(0,' + f1(d) + ')');
      ondes.setAttribute('transform', 'translate(0,' + f1(d) + ')');
    }
    function niveauPour(t){ return t ? 0.55 + 0.45 * Math.min(1, t / 24) : 0.42; }
    function majRessemblance(){
      if(!p.barre) return;
      var t = total(comptes), e = t ? ecart(couleur(comptes), cible) : 0.4, r = borne(1 - e / 0.4, 0, 1);
      ressI.style.transform = 'scaleX(' + r.toFixed(3) + ')';
      ress.classList.toggle('chaud', t > 0 && e < p.tol);
      ressB.textContent = Math.round(r * 100) + ' %';
    }
    function chip(id){ return chips.querySelector('.mjm-chip[data-ingr="' + id + '"]'); }
    function majCompteurs(neuf){
      var ids = ORDRE.filter(function(id){ return comptes[id] > 0; });
      if(!ids.length){ chips.innerHTML = '<span class="mjm-vide">Le chaudron est vide : touche un pot ! 👆</span>'; return; }
      var v = chips.querySelector('.mjm-vide'); if(v) chips.removeChild(v);
      chips.querySelectorAll('.mjm-chip').forEach(function(c){ if(!(comptes[c.getAttribute('data-ingr')] > 0)) chips.removeChild(c); });
      ids.forEach(function(id, i){
        var c = chip(id);
        if(!c){
          c = U.html('<span class="mjm-chip" data-ingr="' + id + '" style="--c:' + hex(pur(id)) + '"><svg class="mjm-chip-ic" viewBox="-12 -12 24 24" overflow="visible" aria-hidden="true">' + PORTIONS[id](g) + '</svg><b></b><span class="mjm-x">×</span><span class="mjm-chip-nom">' + esc(INGR[id].cpt) + '</span></span>');
          var apresC = null;
          for(var j = i + 1; j < ids.length && !apresC; j++) apresC = chip(ids[j]);
          chips.insertBefore(c, apresC);
        }
        c.querySelector('b').textContent = comptes[id];
        if(id === neuf){ c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); }
      });
    }
    function majBoutons(){
      var t = total(comptes);
      bGouter.disabled = etat !== 'joue' || (t === 0 && enVol === 0) || (dernierRate !== null && dernierRate === signature(comptes) && enVol === 0);
      bVider.disabled = etat === 'anim' || etat === 'fini' || (t === 0 && enVol === 0);
      racine.classList.toggle('mjm-bloque', etat !== 'joue');
    }
    function cibleVoulue(){ var t = total(comptes); vouL = oklab(t ? couleur(comptes) : EAU); nivVoulu = niveauPour(t); }
    function flotte(x, y, texte, cls){
      var s = document.createElement('span');
      s.className = 'mjm-flotte ' + (cls || '');
      s.textContent = texte; s.style.left = f1(x) + 'px'; s.style.top = f1(y) + 'px';
      racine.appendChild(s);
      G.apres(1300, function(){ if(s.parentNode) s.parentNode.removeChild(s); });
    }

    /* --- verser une portion --- */
    function verser(id){
      if(etat !== 'joue' || G.fini) return;
      if(total(comptes) + enVol >= PLEIN){ var pm = versRacine(CH.x, 150); flotte(pm.x, pm.y, 'C\'est plein !', 'ko'); U.son('ko'); return; }
      var pot = pots[id], rr = racine.getBoundingClientRect(), pr = pot.querySelector('.mjm-pot-svg').getBoundingClientRect();
      var x0 = pr.left + pr.width / 2 - rr.left, y0 = pr.top + pr.height * 0.25 - rr.top;
      var arr = versRacine(CH.x + U.rand(-34, 34), CH.cyB - 2);
      pot.classList.remove('verse'); void pot.offsetWidth; pot.classList.add('verse');
      U.son('clic');
      enVol++;
      majBoutons();
      var taille = 30 * (parseFloat(getComputedStyle(racine).getPropertyValue('--u')) || 1);
      var e = document.createElement('div');
      e.className = 'mjm-portion';
      e.style.width = e.style.height = f1(taille) + 'px';
      e.style.marginLeft = e.style.marginTop = f1(-taille / 2) + 'px';
      e.innerHTML = '<svg viewBox="-12 -12 24 24" overflow="visible">' + PORTIONS[id](g) + '</svg>';
      vol.appendChild(e);
      var hautY = Math.min(y0, arr.y) - 22 - Math.abs(arr.x - x0) * 0.08, dist = Math.hypot(arr.x - x0, arr.y - y0);
      var duree = borne(380 + dist * 0.55, 450, 820), rot = U.rand(-200, 200);
      var mx = x0 + (arr.x - x0) * 0.45;
      G.anim(e, [
        {transform:'translate(' + f1(x0) + 'px,' + f1(y0) + 'px) scale(.6) rotate(0deg)', offset:0},
        {transform:'translate(' + f1(mx) + 'px,' + f1(hautY) + 'px) scale(1.1) rotate(' + f1(rot * 0.5) + 'deg)', offset:0.42, easing:'ease-in'},
        {transform:'translate(' + f1(arr.x) + 'px,' + f1(arr.y) + 'px) scale(.75) rotate(' + f1(rot) + 'deg)', offset:1}
      ], {duration:duree, easing:'cubic-bezier(.25,.1,.4,1)', fill:'forwards'}, function(){
        if(e.parentNode) e.parentNode.removeChild(e);
        atterrir(id, arr);
      });
    }
    function atterrir(id){
      enVol = Math.max(0, enVol - 1);
      comptes[id] = (comptes[id] || 0) + 1;
      cibleVoulue();
      U.son('plouf');
      eclabousser(id);
      louche.classList.remove('touille'); void louche.getBoundingClientRect(); louche.classList.add('touille');
      majCompteurs(id); majRessemblance(); majBoutons();
      if(attendGouter && enVol === 0){ attendGouter = false; G.apres(250, gouter); }
    }
    function eclabousser(id){
      var x = CH.x + U.rand(-40, 40), y = CH.cyB + (1 - nivVoulu) * 30;
      var NS = 'http://www.w3.org/2000/svg';
      var o = document.createElementNS(NS, 'ellipse');
      o.setAttribute('class', 'mjm-onde'); o.setAttribute('cx', f1(x)); o.setAttribute('cy', f1(CH.cyB)); o.setAttribute('rx', '22'); o.setAttribute('ry', '5');
      ondes.appendChild(o);
      var gs = [];
      for(var i = 0; i < 6; i++){
        var c = document.createElementNS(NS, 'circle');
        c.setAttribute('class', 'mjm-goutte'); c.setAttribute('cx', f1(x)); c.setAttribute('cy', f1(y - 2)); c.setAttribute('r', f1(U.rand(3, 5.5)));
        c.style.setProperty('--dx', f1(U.rand(-34, 34)) + 'px'); c.style.setProperty('--dy', f1(U.rand(-46, -22)) + 'px');
        c.style.animationDelay = (i * 0.02).toFixed(2) + 's';
        eclab.appendChild(c); gs.push(c);
      }
      G.apres(800, function(){ if(o.parentNode) o.parentNode.removeChild(o); gs.forEach(function(c){ if(c.parentNode) c.parentNode.removeChild(c); }); });
    }

    /* --- panneau (sur l'étagère) --- */
    function ouvrirPanneau(html, cls){
      carte.className = 'mjm-carte ' + (cls || '');
      carte.innerHTML = html;
      panneau.hidden = false;
      panneau.classList.remove('ouvre'); void panneau.offsetWidth; panneau.classList.add('ouvre');
    }
    function fermerPanneau(){ panneau.hidden = true; carte.innerHTML = ''; }

    /* --- vider --- */
    function vider(){
      if(etat === 'anim' || etat === 'fini' || G.fini) return;
      comptes = {}; attendGouter = false;
      cibleVoulue();
      U.son('plouf');
      racine.classList.remove('mjm-trop');
      gch.classList.remove('vidange'); void gch.getBoundingClientRect(); gch.classList.add('vidange');
      fermerPanneau(); etat = 'joue';
      majCompteurs(); majRessemblance(); majBoutons();
    }

    /* --- goûter --- */
    function gouter(){
      if(etat !== 'joue' || G.fini) return;
      if(enVol > 0){ attendGouter = true; bGouter.disabled = true; return; }
      var t = total(comptes);
      if(!t){ var pm = versRacine(CH.x, 150); flotte(pm.x, pm.y, 'Le chaudron est vide !', 'ko'); return; }
      U.son('clic');
      var e = ecart(couleur(comptes), cible);
      if(e < p.tol){
        if(t <= limite) gagner('direct');
        else trop();
      } else beurk();
    }

    function beurk(){
      etat = 'anim';
      coeurs = Math.max(0, coeurs - 1);
      dernierRate = signature(comptes);
      majCoeurs(true); majBoutons();
      U.son('ko'); U.vibrer(60);
      racine.classList.remove('mjm-beurk'); void racine.offsetWidth; racine.classList.add('mjm-beurk');
      ouvrirPanneau('<div class="mjm-carte-l">' + visageBeurk() + '<div class="mjm-carte-t"><h3 class="mjm-titre-beurk">Beurk !</h3><p>La potion a un goût horrible…</p>' + (coeurs > 0 ? '<p class="mjm-moins">−1 <span class="mjm-coeur mini">' + COEUR + '</span></p>' : '<p class="mjm-moins">💔</p>') + '</div></div>' +
        (coeurs > 0 ? '<div class="mjm-carte-b"><button class="btn mjm-b-vider" type="button">♻️ Vider le chaudron</button><button class="btn second mjm-b-garder" type="button">Garder la potion</button></div>' : ''), 'beurk');
      G.apres(1700, function(){ racine.classList.remove('mjm-beurk'); });
      if(coeurs <= 0){
        etat = 'fini';
        G.apres(2400, function(){ G.terminer({reussi:false, score:0, erreurs:coeursMax, message:'Beurk !', detail:'La potion a un goût horrible… Plus de cœur : c\'était l\'erreur de trop.'}); });
        return;
      }
      G.apres(500, function(){ if(etat === 'anim') etat = 'panneau'; majBoutons(); });
    }

    function trop(){
      etat = 'panneau';
      racine.classList.add('mjm-trop');
      U.son('bulle'); U.vibrer(30);
      ouvrirPanneau('<div class="mjm-carte-t"><h3>Presque !</h3><p>La couleur est bonne, mais tu as mis trop d\'ingrédients : simplifie !</p></div>' +
        '<div class="mjm-carte-b"><button class="btn magie grand mjm-b-simplifier" type="button">✂️ Simplifier</button><button class="btn second mjm-b-vider" type="button">♻️ Vider</button></div>', 'trop');
      majBoutons();
    }

    function recommencer(texte){
      etat = 'panneau';
      U.son('ko');
      ouvrirPanneau('<div class="mjm-carte-t"><h3>Encore trop !</h3><p>' + esc(texte) + '</p></div>' +
        '<div class="mjm-carte-b"><button class="btn grand mjm-b-vider" type="button">♻️ Vider le chaudron</button></div>', 'recommence');
      majBoutons();
    }

    function simplifier(){
      if(etat !== 'panneau' || G.fini) return;
      etat = 'anim';
      fermerPanneau(); majBoutons();
      var d = pgcd(comptes), avant = Object.assign({}, comptes);
      divEl.hidden = false;
      if(d <= 1){
        divEl.className = 'mjm-div non';
        divEl.innerHTML = '<b>÷ ?</b>';
        chips.classList.remove('secoue'); void chips.offsetWidth; chips.classList.add('secoue');
        U.son('ko');
        G.apres(1300, function(){ divEl.hidden = true; recommencer('Ces quantités ne se partagent pas en parts égales. Recommence avec moins d\'ingrédients.'); });
        return;
      }
      divEl.className = 'mjm-div';
      divEl.innerHTML = '<b>÷ ' + d + '</b>';
      U.son('magie');
      var apresD = {}; Object.keys(avant).forEach(function(k){ apresD[k] = avant[k] / d; });
      var DUREE = 1100;
      chips.classList.add('divise');
      compte = {avant:avant, apres:apresD, t:0, duree:DUREE / 1000};   /* animé par la boucle principale */
      /* les portions en trop s'envolent en étincelles */
      var pm = versRacine(CH.x, CH.cyB - 10);
      for(var i = 0; i < 8; i++){
        var s = document.createElement('span'); s.className = 'mjm-etin';
        s.textContent = i % 2 ? '✦' : '✧';
        s.style.left = f1(pm.x) + 'px'; s.style.top = f1(pm.y) + 'px';
        s.style.setProperty('--a', (i * 45 + 20) + 'deg'); s.style.setProperty('--d', f1(60 + Math.random() * 50) + 'px');
        racine.appendChild(s);
        (function(s){ G.apres(1300, function(){ if(s.parentNode) s.parentNode.removeChild(s); }); })(s);
      }
      G.apres(DUREE + 80, function(){
        comptes = apresD;
        cibleVoulue();
        racine.classList.remove('mjm-trop');   /* le chaudron se calme */
        chips.classList.remove('divise');
        majCompteurs(); majRessemblance();
      });
      G.apres(DUREE + 900, function(){
        divEl.hidden = true;
        if(total(comptes) <= limite){ gagner('simplifie'); }
        else { racine.classList.add('mjm-trop'); recommencer('Recommence avec moins d\'ingrédients.'); }
      });
    }

    function gagner(comment){
      etat = 'fini';
      racine.classList.remove('mjm-trop');
      fermerPanneau(); majBoutons();
      vouL = oklab(couleur(comptes)); affL = vouL.slice(); majLiquide();
      racine.classList.add('mjm-gagne');
      U.son('magie');
      G.apres(1300, function(){ U.son('gain'); });
      G.apres(2900, function(){
        G.terminer({reussi:true, score:1, erreurs:coeursMax - coeurs, message:'Potion réussie !',
          detail:comment === 'simplifie' ? 'Bien simplifié : la recette est parfaite !' : 'Ta potion a exactement la bonne couleur !'});
      });
    }

    /* --- écouteurs --- */
    G.ecoute(rangs, 'click', function(ev){ var b = ev.target.closest('.mjm-pot'); if(b) verser(b.getAttribute('data-ingr')); });
    G.ecoute(bVider, 'click', function(){ vider(); });
    G.ecoute(bGouter, 'click', function(){ gouter(); });
    G.ecoute(carte, 'click', function(ev){
      if(ev.target.closest('.mjm-b-vider')){ U.son('clic'); vider(); }
      else if(ev.target.closest('.mjm-b-garder')){ U.son('clic'); fermerPanneau(); etat = 'joue'; majBoutons(); }
      else if(ev.target.closest('.mjm-b-simplifier')){ simplifier(); }
    });

    /* --- la boucle : couleur et niveau qui glissent, sablier --- */
    var avantTic = 99;
    G.boucle(function(dt){
      if(compte){
        compte.t += dt;
        var kc = borne(compte.t / compte.duree, 0, 1), ec = 1 - (1 - kc) * (1 - kc);
        Object.keys(compte.avant).forEach(function(id){ var c = chip(id); if(c) c.querySelector('b').textContent = Math.round(compte.avant[id] + (compte.apres[id] - compte.avant[id]) * ec); });
        if(kc >= 1) compte = null;
      }
      var k = 1 - Math.exp(-dt * 3.2), bouge = false;
      for(var i = 0; i < 3; i++){ var dv = vouL[i] - affL[i]; if(Math.abs(dv) > 0.0008){ affL[i] += dv * k; bouge = true; } else if(dv){ affL[i] = vouL[i]; bouge = true; } }
      if(bouge) majLiquide();
      if(Math.abs(nivVoulu - niv) > 0.002){ niv += (nivVoulu - niv) * (1 - Math.exp(-dt * 4)); majNiveau(); }
      if(etat === 'joue' || etat === 'panneau'){
        restant -= dt;
        sabI.style.transform = 'scaleX(' + borne(restant / duree, 0, 1).toFixed(4) + ')';
        var presse = restant < Math.min(30, duree * 0.15);
        sablier.classList.toggle('presse', presse);
        if(presse && Math.ceil(restant / 5) !== avantTic){ avantTic = Math.ceil(restant / 5); U.son('tic'); }
        if(restant <= 0){
          etat = 'fini'; majBoutons();
          G.terminer({reussi:false, score:0, erreurs:coeursMax - coeurs, message:'Le sablier est vide…', detail:'La potion n\'est pas prête à temps.'});
          return false;
        }
      }
    });

    majCoeurs(); majLiquide(); majNiveau(); majCompteurs(); majRessemblance(); majBoutons();

    /* --- crochet de test --- */
    var crochet = window.__melange = {
      recette:Object.assign({}, recette), cible:hex(cible), tol:p.tol, limite:limite, total:T, etagere:etagere.slice(),
      comptes:function(){ return Object.assign({}, comptes); }, coeurs:function(){ return coeurs; }, etat:function(){ return etat; },
      enVol:function(){ return enVol; }, restant:function(){ return restant; },
      ecart:function(c){ return ecart(couleur(c), cible); }, couleur:function(c){ var x = couleur(c); return x ? hex(x) : null; }, pgcd:pgcd
    };

    return {arreter:function(){
      G.arreter();
      if(window.__melange === crochet) window.__melange = null;
    }};
  }
};
/* pour les essais (node ou navigateur) */
def._modele = {INGR:INGR, ORDRE:ORDRE, couleur:couleur, ecart:ecart, oklab:oklab, hex:hex, pur:pur, pgcd:pgcd, total:total, genererRecette:genererRecette, defautRecette:defautRecette, EAU:EAU};
MJ.enregistrer('melange', def);
})();
