/* rat-anime.js — le rat d'égout animé (Les Enquêteurs de Brumeval)
   Module autonome, sans dépendance. Il injecte son propre CSS.

     var r = RatAnime.creer(conteneur);   // un rat en SVG qui remplit le conteneur, il regarde à gauche

   Méthodes ponctuelles (renvoient une Promise) : entrer(px), mordre({onImpact}), touche(), tousser(), fuir(),
     exploser(scene, {impact, eclat}) : le critique, autour du rat (fumée noire à « impact » ms, membres à « eclat » ms)
   États (se cumulent) : attendre(), enrager(), ebloui(on), retourner(on), bruler(on), coller(on), cible(on), yeux('jaune'|'rouge')
   arreter() : arrête toutes les boucles.

   Le dessin est découpé en pièces articulées : chaque pièce est un <g data-j="nom"> dont le pivot est ramené à (0,0),
   on l'anime avec la Web Animations API (translate / rotate / scale). */
(function(global){
'use strict';
var O = '#24182e', LUNE = '#bfe8ff', NUM = 0;

/* =====================================================================
   1. Petits outils de dessin
   ===================================================================== */
function f1(v){ return (+v).toFixed(1); }
function pt(p){ return f1(p[0]) + ' ' + f1(p[1]); }
function lerp(a, b, t){ return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
function hx(c){ c = c.replace('#', ''); return [0, 2, 4].map(function(i){ return parseInt(c.substr(i, 2), 16); }); }
function mix(a, b, t){ var A = hx(a), B = hx(b); return '#' + A.map(function(v, i){ var r = Math.round(v + (B[i] - v) * t); return (r < 16 ? '0' : '') + r.toString(16); }).join(''); }
function clair(c, t){ return mix(c, '#fff6e6', t); }
function sombre(c, t){ return mix(c, '#120a1e', t); }
function rng(s){ return function(){ s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
function P(d, f, x){ return '<path d="' + d + '" fill="' + f + '" stroke="' + O + '" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"' + (x || '') + '/>'; }
function L(d, c, w, x){ return '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + w + '" stroke-linejoin="round" stroke-linecap="round"' + (x || '') + '/>'; }
function F(d, f, x){ return '<path d="' + d + '" fill="' + f + '"' + (x || '') + '/>'; }
function C(x, y, r, f, x2){ return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + f + '"' + (x2 || '') + '/>'; }
function lisse(pts, ferme){
  var n = pts.length, s = 'M' + pt(pts[0]), m = ferme ? n : n - 1;
  function q(i){ return ferme ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]; }
  for(var i = 0; i < m; i++){
    var a = q(i - 1), b = q(i), c = q(i + 1), e = q(i + 2);
    s += ' C ' + pt([b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6]) + ' ' + pt([c[0] - (e[0] - b[0]) / 6, c[1] - (e[1] - b[1]) / 6]) + ' ' + pt(c);
  }
  return s + (ferme ? ' Z' : '');
}
function tube(pts, ws){
  var n = pts.length, G = [], D = [];
  for(var i = 0; i < n; i++){
    var a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, w = ws[i] / 2;
    G.push([pts[i][0] - dy / l * w, pts[i][1] + dx / l * w]); D.push([pts[i][0] + dy / l * w, pts[i][1] - dx / l * w]);
  }
  function bout(i, j, w){ var dx = pts[i][0] - pts[j][0], dy = pts[i][1] - pts[j][1], l = Math.hypot(dx, dy) || 1; return [pts[i][0] + dx / l * w * .5, pts[i][1] + dy / l * w * .5]; }
  return {d: lisse(G.concat([bout(n - 1, n - 2, ws[n - 1])], D.slice().reverse(), [bout(0, 1, ws[0])]), true), g: G, dr: D};
}
function lelong(pts, n){
  var out = [], m = pts.length - 1;
  for(var k = 0; k <= n; k++){ var t = k / n * m, i = Math.min(m - 1, Math.floor(t)); out.push(lerp(pts[i], pts[i + 1], t - i)); }
  return out;
}
function hirsute(pts, haut, couleur, seed, v, trait){
  var R = rng(seed), n = pts.length, s = 'M' + pt(pts[0]), nr = [];
  for(var k = 0; k < n - 1; k++){
    var a = pts[k], b = pts[k + 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = dy / l, ny = -dx / l, h = haut * (.35 + R() * 1.05), w = .5 + R() * .9;
    var tip = [(a[0] + b[0]) / 2 + nx * h + v[0] * w, (a[1] + b[1]) / 2 + ny * h + v[1] * w];
    s += ' Q ' + pt([a[0] + nx * h * .5 + v[0] * .2, a[1] + ny * h * .5 + v[1] * .2]) + ' ' + pt(tip) + ' Q ' + pt([b[0] + nx * h * .2 + v[0] * .3, b[1] + ny * h * .2 + v[1] * .3]) + ' ' + pt(b);
    nr.push([nx, ny]);
  }
  nr.push(nr[n - 2]);
  for(var k2 = n - 1; k2 >= 0; k2--){ var q = pts[k2]; s += ' L ' + pt([q[0] - nr[k2][0] * 18, q[1] - nr[k2][1] * 18]); }
  return P(s + ' Z', couleur, ' stroke-width="' + (trait || 2.4) + '"');
}
function poils(cx, cy, rx, ry, n, seed, cH, cB, op, ang){
  var R = rng(seed), s = '', ca = Math.cos(ang || .35), sa = Math.sin(ang || .35);
  for(var k = 0; k < n; k++){
    var a = R() * Math.PI * 2, r = Math.sqrt(R()), x = cx + Math.cos(a) * rx * r, y = cy + Math.sin(a) * ry * r, l = 7 + R() * 9, c = y < cy - ry * .15 ? cH : cB;
    s += L('M' + f1(x) + ' ' + f1(y) + ' q ' + f1(ca * l * .5 - sa * 2) + ' ' + f1(sa * l * .5 + ca * 2) + ' ' + f1(ca * l) + ' ' + f1(sa * l), c, 1.4, ' opacity="' + f1((op || .4) + R() * .2) + '"');
  }
  return s;
}
function meche(x, y, ang, lg, lar, coul, courbe, op){
  var ca = Math.cos(ang), sa = Math.sin(ang), nx = -sa, ny = ca, k = courbe || 0;
  var tip = [x + ca * lg + nx * k, y + sa * lg + ny * k], m = [x + ca * lg * .5 + nx * k * .6, y + sa * lg * .5 + ny * k * .6];
  return F('M' + pt([x + nx * lar / 2, y + ny * lar / 2]) + ' Q ' + pt([m[0] + nx * lar * .45, m[1] + ny * lar * .45]) + ' ' + pt(tip) + ' Q ' + pt([m[0] - nx * lar * .3, m[1] - ny * lar * .3]) + ' ' + pt([x - nx * lar / 2, y - ny * lar / 2]) + ' Z', coul, ' opacity="' + (op || 1) + '"');
}
function meches(cx, cy, rx, ry, n, seed, cs, ang, lg){
  var R = rng(seed), s = '';
  for(var k = 0; k < n; k++){
    var a = R() * Math.PI * 2, r = Math.sqrt(R()), x = cx + Math.cos(a) * rx * r, y = cy + Math.sin(a) * ry * r;
    s += meche(x, y, ang + (R() - .5) * .6, (lg || 14) * (.6 + R() * .7), 5 + R() * 5, y < cy ? cs[0] : cs[1], (R() - .5) * 8, .45 + R() * .35);
  }
  return s;
}
/* une flamme qui monte depuis (0,0) */
function flammeD(h, w){
  return 'M' + f1(-w / 2) + ' 0 C ' + f1(-w * .62) + ' ' + f1(-h * .38) + ' ' + f1(-w * .1) + ' ' + f1(-h * .5) + ' ' + f1(-w * .12) + ' ' + f1(-h) + ' C ' + f1(w * .3) + ' ' + f1(-h * .62) + ' ' + f1(w * .7) + ' ' + f1(-h * .42) + ' ' + f1(w / 2) + ' 0 Z';
}
function etoileD(r, n, k){
  var s = '';
  for(var i = 0; i < n * 2; i++){ var a = -Math.PI / 2 + i * Math.PI / n, rr = i % 2 ? r * (k || .45) : r; s += (i ? ' L ' : 'M') + f1(Math.cos(a) * rr) + ' ' + f1(Math.sin(a) * rr); }
  return s + ' Z';
}
function eclatD(r){ return 'M0 ' + f1(-r) + ' Q ' + f1(r * .14) + ' ' + f1(-r * .14) + ' ' + f1(r) + ' 0 Q ' + f1(r * .14) + ' ' + f1(r * .14) + ' 0 ' + f1(r) + ' Q ' + f1(-r * .14) + ' ' + f1(r * .14) + ' ' + f1(-r) + ' 0 Q ' + f1(-r * .14) + ' ' + f1(-r * .14) + ' 0 ' + f1(-r) + ' Z'; }

/* les dégradés, flous et découpes d'un rat (identifiants uniques par rat) */
function Defs(u){ this.u = u; this.n = 0; this.l = []; }
Defs.prototype.id = function(){ return this.u + (++this.n); };
Defs.prototype.g = function(c, fort){
  fort = fort || 1; var id = this.id();
  this.l.push('<linearGradient id="' + id + '" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + clair(c, .26 * fort) + '"/><stop offset=".45" stop-color="' + c + '"/><stop offset="1" stop-color="' + sombre(c, .42 * fort) + '"/></linearGradient>');
  return 'url(#' + id + ')';
};
Defs.prototype.halo = function(c0, c1){ var id = this.id(); this.l.push('<radialGradient id="' + id + '"><stop offset="0" stop-color="' + c0 + '"/><stop offset=".45" stop-color="' + c1 + '" stop-opacity=".6"/><stop offset="1" stop-color="' + c1 + '" stop-opacity="0"/></radialGradient>'); return 'url(#' + id + ')'; };
Defs.prototype.flou = function(n){ var id = this.id(); this.l.push('<filter id="' + id + '" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="' + n + '"/></filter>'); return 'url(#' + id + ')'; };
Defs.prototype.stops = function(st){ return st.map(function(t){ return '<stop offset="' + t[0] + '" stop-color="' + t[1] + '" stop-opacity="' + (t[2] == null ? 1 : t[2]) + '"/>'; }).join(''); };
Defs.prototype.rad = function(st, cx, cy, r){ var id = this.id(); this.l.push('<radialGradient id="' + id + '" cx="' + cx + '" cy="' + cy + '" r="' + r + '">' + this.stops(st) + '</radialGradient>'); return 'url(#' + id + ')'; };
Defs.prototype.lin = function(st, x1, y1, x2, y2){ var id = this.id(); this.l.push('<linearGradient id="' + id + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '">' + this.stops(st) + '</linearGradient>'); return 'url(#' + id + ')'; };
Defs.prototype.clip = function(d){ var id = this.id(); this.l.push('<clipPath id="' + id + '"><path d="' + d + '"/></clipPath>'); return ' clip-path="url(#' + id + ')"'; };

/* =====================================================================
   2. Le dessin du rat, découpé en pièces articulées
   ===================================================================== */
var QC = [[436, 254], [476, 236], [512, 244], [530, 278], [528, 322], [508, 356], [476, 378], [440, 390], [400, 395], [372, 394]];
var QW = [28, 24, 21, 18, 15, 12, 9, 7, 5, 2.5];

function dessinerRat(D){
  var flou2 = D.flou(2), flou4 = D.flou(4);
  var cr = D.id();
  D.l.push('<filter id="' + cr + '" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" seed="21" result="t"/>' +
    '<feColorMatrix in="t" type="matrix" values="0 0 0 0 .16  0 0 0 0 .14  0 0 0 0 .1  5 0 0 0 -2.9"/><feComposite in2="SourceAlpha" operator="in"/></filter>');
  var CRASSE = ' filter="url(#' + cr + ')"';
  var poil = '#74626a', clairP = '#a8949c', sombreP = '#2a1e26', rose = '#dc94a4', vase = '#4e5a34';
  /* data-c : le contenu de la pièce (dans le repère du dessin) ; il reste un élément à part une fois cuit */
  function piv(nom, x, y, c){ return '<g transform="translate(' + x + ' ' + y + ')"><g data-j="' + nom + '"><g data-c="' + nom + '" transform="translate(' + (-x) + ' ' + (-y) + ')">' + c + '</g></g></g>'; }
  function slot(nom){ return '<g data-slot="' + nom + '"></g>'; }
  function ancre(nom){ return '<g data-a="' + nom + '"></g>'; }
  function griffe(x, y, lg, ang){
    var ca = Math.cos(ang), sa = Math.sin(ang), nx = -sa, ny = ca, tp = [x + ca * lg - nx * lg * .35, y + sa * lg - ny * lg * .35];
    return P('M' + pt([x + nx * 2.4, y + ny * 2.4]) + ' Q ' + pt([x + ca * lg * .6 + nx * 1.4, y + sa * lg * .6 + ny * 1.4]) + ' ' + pt(tp) + ' Q ' + pt([x + ca * lg * .5 - nx * 1.6, y + sa * lg * .5 - ny * 1.6]) + ' ' + pt([x - nx * 2.4, y - ny * 2.4]) + ' Z', '#1e1620', ' stroke-width="1.3"') +
      L('M' + pt([x + nx * .6, y + ny * .6]) + ' Q ' + pt([x + ca * lg * .55 + nx * .8, y + sa * lg * .55 + ny * .8]) + ' ' + pt(lerp([x, y], tp, .85)), '#a8a0b8', .9, ' opacity=".7"');
  }
  function doigt(base, ang, lg, w, coul){
    var ca = Math.cos(ang), sa = Math.sin(ang), j = [base[0] + ca * lg * .55, base[1] + sa * lg * .55 - 1.5], tp = [base[0] + ca * lg, base[1] + sa * lg];
    return P(tube([base, j, tp], [w, w * .85, w * .7]).d, D.g(coul || rose), ' stroke-width="2"') + C(f1(j[0]), f1(j[1]), w * .25, '#f8c8d4', ' opacity=".6"') + griffe(tp[0] + ca * 1.5, tp[1] + sa * 1.5, 9, ang + .5);
  }

  /* ---- la queue : neuf segments emboîtés (chaque segment porte le suivant) ---- */
  var queue = '', queueC = sombre(rose, .12);
  for(var i = QC.length - 2; i >= 0; i--){
    var a = QC[i], b = QC[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l, der = i === QC.length - 2;
    var a2 = [a[0] - ux * 6, a[1] - uy * 6], b2 = der ? b : [b[0] + ux * 7, b[1] + uy * 7];
    var tb = tube([a2, lerp(a, b, .5), b2], [QW[i] + 1, (QW[i] + QW[i + 1]) / 2, QW[i + 1] + (der ? 0 : .6)]);
    var art = der ? P(tb.d, queueC) : F(tb.d, queueC) + L(lisse(tb.g), O, 2.6) + L(lisse(tb.dr), O, 2.6);
    var an = '';
    for(var k = 0; k < 6; k++){ var t = (k + .5) / 6, c = lerp(a, b, t), w = (QW[i] * (1 - t) + QW[i + 1] * t) / 2; an += 'M' + pt([c[0] - uy * w * .92, c[1] + ux * w * .92]) + ' Q ' + pt([c[0] + ux * 1.6, c[1] + uy * 1.6]) + ' ' + pt([c[0] + uy * w * .92, c[1] - ux * w * .92]) + ' '; }
    art += L(an, '#8a4a5c', 1.2, ' opacity=".75"');
    art += L(lisse(tb.dr), '#ffe0e8', Math.max(1, QW[i] * .14), ' opacity=".35" transform="translate(' + f1(uy * 2.5) + ' ' + f1(-ux * 2.5) + ')"');
    if(i > 0 && i < 6) art += L(lisse(tb.dr), LUNE, 1.6, ' opacity=".5"');
    var R0 = rng(70 + i), pq = '';
    for(var k2 = 0; k2 < 3; k2++){ var t2 = R0(), p2 = lerp(tb.dr[0], tb.dr[2], t2); pq += 'M' + pt(p2) + ' l ' + f1(uy * 5 + ux * 2) + ' ' + f1(-ux * 5 + uy * 2) + ' '; }
    art += L(pq, '#d8c0c8', .9, ' opacity=".6"');
    queue = piv('q' + i, a[0], a[1], queue + art + slot('feuQ' + i));
  }

  /* ---- les pattes du fond (plus sombres) ---- */
  var fonce = sombre(poil, .45), roseF = sombre(rose, .4);
  var mainF = P('M158 372 C 148 382 132 388 118 388 C 116 382 128 376 146 370 Z', D.g(roseF), ' stroke-width="2.4"');
  [[118, 386, 3.3], [126, 389, 3.1], [136, 389, 2.9]].forEach(function(g){ mainF += griffe(g[0], g[1], 8, g[2]); });
  var avbrasF = P(tube([[196, 326], [178, 350], [158, 372]], [23, 17, 13]).d, D.g(fonce));
  var brasF = P(tube([[206, 286], [202, 312], [196, 332]], [32, 26, 22]).d, D.g(fonce));
  var paF = piv('brasF', 206, 292, piv('avbrasF', 196, 330, piv('mainF', 156, 372, mainF) + avbrasF) + brasF);
  var piedFd = 'M414 362 C 418 380 394 389 344 391 C 330 392 324 385 336 381 C 358 377 388 371 406 358 Z';
  var piedF = P(piedFd, D.g(sombre(rose, .45)), ' stroke-width="2.4"') + griffe(328, 389, 7, 3.2) + griffe(336, 391, 7, 3.1) + griffe(344, 391, 7, 3.0);
  var tibiaF = P(tube([[340, 328], [374, 348], [404, 364], [410, 368]], [26, 19, 13, 11]).d, D.g(sombre(poil, .5)));
  var cuisseF = P(lisse([[340, 268], [366, 250], [398, 256], [414, 284], [408, 316], [384, 334], [356, 336], [340, 318], [332, 292]], true), D.g(sombre(poil, .45)));
  var phF = piv('cuisseF', 372, 292, piv('tibiaF', 342, 332, piv('piedF', 408, 366, piedF) + tibiaF) + cuisseF);

  /* ---- le corps maigre : crête hérissée, ventre, côtes, crasse ---- */
  var crete = hirsute(lelong([[244, 208], [270, 206], [296, 202], [322, 190], [356, 172], [394, 172], [426, 190], [444, 220], [450, 254]], 27), 22, D.g(sombre(poil, .08)), 5, [9, -3]);
  var creteRage = '<g data-rage="1" opacity="0">' + hirsute(lelong([[250, 210], [290, 204], [330, 186], [370, 170], [410, 176], [440, 204], [452, 240]], 22), 38, D.g(sombre(poil, .2)), 15, [6, -10]) + '</g>';
  var cp = [[190, 300], [194, 256], [212, 226], [238, 210], [276, 210], [312, 196], [350, 178], [392, 178], [426, 196], [446, 230], [448, 266], [438, 300], [416, 324], [376, 318], [334, 300], [290, 304], [246, 322], [208, 324]];
  var corpsD = lisse(cp, true);
  var corps = hirsute(lelong([[436, 302], [414, 326], [376, 320], [334, 302], [290, 306], [246, 324], [208, 326]], 13), 11, D.g(sombre(poil, .2)), 9, [7, 4]);
  corps += P(corpsD, D.g(poil));
  corps += '<g' + D.clip(corpsD) + '>';
  corps += F('M204 312 C 240 320 290 300 334 294 C 370 304 404 316 432 300 C 424 330 370 330 330 316 C 290 314 240 336 204 312 Z', '#c8aab4', ' opacity=".6"');
  corps += L('M226 322 C 260 316 300 304 334 302 M340 304 C 370 314 400 320 424 310', '#e8c8d0', 1.2, ' opacity=".35"');
  corps += F(corpsD, '#000', CRASSE + ' opacity=".75"');
  corps += L('M258 240 C 270 264 272 290 262 314 M280 234 C 294 260 296 286 286 308 M302 228 C 316 254 318 280 308 302 M324 222 C 336 246 338 270 330 292', sombreP, 3, ' opacity=".5"');
  corps += L('M264 238 C 276 262 278 288 269 310 M286 232 C 300 258 302 284 293 304 M308 226 C 322 252 324 278 315 298 M330 220 C 342 244 344 268 336 288', clairP, 1.6, ' opacity=".4"');
  corps += '<ellipse cx="360" cy="214" rx="22" ry="12" transform="rotate(-20 360 214)" fill="' + clairP + '" opacity=".3" filter="' + flou4 + '"/>';
  corps += meches(320, 270, 110, 48, 60, 13, [clair(poil, .25), sombre(poil, .35)], .45, 18);
  corps += poils(320, 268, 120, 56, 170, 17, '#d8c6d0', sombreP, .32);
  corps += '<ellipse cx="396" cy="300" rx="24" ry="12" fill="' + vase + '" opacity=".45" filter="' + flou4 + '"/><ellipse cx="236" cy="314" rx="16" ry="8" fill="' + vase + '" opacity=".4" filter="' + flou4 + '"/>';
  corps += F('M334 214 C 342 206 356 206 362 214 C 358 224 342 226 334 214 Z', '#c4909c', ' opacity=".6"') + L('M336 214 C 344 208 354 208 360 214', '#f0c0cc', 1, ' opacity=".55"');
  corps += F(corpsD, D.lin([[0, '#000', 0], [.6, '#000', 0], [1, '#0e0814', .45]], 0, 0, 0, 1));
  corps += '</g>';
  corps += L('M380 230 C 392 244 398 260 396 278', '#e0b4c2', 2.6, ' opacity=".8"') + L('M384 240 l 8 -3 M390 252 l 8 -2 M394 264 l 8 0', '#e0b4c2', 1.3, ' opacity=".7"');
  corps += L(lisse([[214, 224], [244, 208], [280, 206], [316, 192], [352, 174], [394, 174], [428, 192], [446, 226]]), LUNE, 2.8, ' opacity=".6"');
  var tronc = piv('crete', 340, 262, crete + creteRage) + piv('souffle', 330, 318, corps) + slot('feuDos') + ancre('dos');

  /* ---- la patte arrière proche : cuisse, tibia, pied ---- */
  var piedD = 'M440 364 C 446 382 418 391 364 393 C 348 394 342 386 354 382 C 380 378 410 372 430 360 Z';
  var pied = P(piedD, D.g(rose)) + L('M370 386 C 390 384 410 380 428 370', '#ffd6de', 1.6, ' opacity=".6"') + L('M380 390 q 4 -4 2 -8 M396 388 q 4 -4 2 -8', '#a85a6c', 1, ' opacity=".5"');
  pied += doigt([358, 388], Math.PI + .12, 18, 6.4) + doigt([362, 384], Math.PI - .12, 20, 6.4) + doigt([366, 382], Math.PI - .4, 17, 6) + ancre('orteils');
  var tb2 = tube([[354, 328], [396, 350], [430, 366], [440, 372]], [30, 22, 15, 13]);
  var tibia = hirsute(lelong([[366, 350], [396, 362], [426, 374]], 5), 9, D.g(poil), 25, [5, 4]) + P(tb2.d, D.g(sombre(poil, .08))) +
    '<g' + D.clip(tb2.d) + '>' + F(tb2.d, '#000', CRASSE + ' opacity=".5"') + poils(398, 354, 34, 10, 16, 27, '#d8c6d0', sombreP, .3, .45) + '</g>' + L(lisse(tb2.dr.slice(0, 3)), LUNE, 1.6, ' opacity=".45"');
  var cuD = lisse([[338, 262], [370, 238], [412, 244], [438, 276], [434, 312], [408, 336], [376, 344], [350, 332], [336, 300]], true);
  var cuisse = hirsute(lelong([[352, 330], [378, 344], [408, 338], [434, 314]], 8), 10, D.g(poil), 21, [6, 3]) + P(cuD, D.g(clair(poil, .05))) +
    '<g' + D.clip(cuD) + '>' + F(cuD, '#000', CRASSE + ' opacity=".6"') + meches(392, 292, 40, 36, 16, 23, [clair(poil, .25), sombre(poil, .35)], .7, 14) + poils(392, 292, 42, 40, 40, 23, '#d8c6d0', sombreP, .3, .8) + '</g>' +
    L('M346 256 C 372 236 414 240 434 268', LUNE, 2.2, ' opacity=".55"');
  var ph = piv('cuisse', 392, 288, piv('tibia', 360, 334, piv('pied', 436, 368, pied) + tibia) + cuisse);

  /* ---- la tête ---- */
  var oreilleF = P('M170 226 C 160 202 166 182 182 178 C 196 176 200 196 194 220 Z', D.g(sombre(poil, .3))) + F('M174 220 C 168 202 172 188 182 186 C 190 188 192 202 188 216 Z', sombre(rose, .35));
  var oreille = '<g transform="translate(196 232) rotate(30) scale(.78) translate(-196 -232)">' +
    P('M184 232 C 170 200 174 150 204 132 L 211 130 L 214 141 L 221 130 C 248 136 262 168 256 200 C 250 224 228 238 198 238 Z', D.g(clair(poil, .05))) +
    F('M192 228 C 182 200 186 160 208 146 C 234 142 250 170 246 198 C 240 218 220 230 192 228 Z', D.rad([[0, '#f8c8d4'], [.5, '#d88498'], [1, '#8a3a52']], .6, .42, .7)) +
    '<ellipse cx="226" cy="178" rx="12" ry="22" transform="rotate(15 226 178)" fill="#ffe8ee" opacity=".35" filter="' + flou4 + '"/>' +
    L('M208 222 C 212 200 218 178 224 156 M216 196 C 224 190 232 188 238 190 M220 176 C 214 172 206 172 200 176', '#9a3452', 1.1, ' opacity=".6"') +
    L('M186 196 C 188 164 200 140 210 132 M222 132 C 246 138 262 166 258 196', LUNE, 2.4, ' opacity=".7"') + '</g>';
  var joue = hirsute(lelong([[228, 258], [226, 284], [212, 302], [190, 314], [164, 318]], 7), 10, D.g(clair(poil, .04)), 31, [6, 3]);
  /* la mâchoire : l'intérieur de la gueule tourne avec elle, découpé sous la lèvre du haut */
  var email = D.lin([[0, '#f6d27a'], [.6, '#e0a24a'], [1, '#a8652a']], 0, 0, 1, 1);
  var bave = P('M140 338 C 141 350 137 360 139 370 C 142 374 147 373 146 368 C 145 360 144 350 145 338 Z', '#d8f0ff', ' stroke-width="1.4" opacity=".85"') + C(142.5, 372, 1.6, '#ffffff', ' opacity=".8"') + ancre('baveBout');
  var machoire = F('M166 326 L 64 234 C 78 262 72 296 36 312 L 44 318 C 64 334 104 346 140 344 Z', D.rad([[0, '#5a1a36'], [.6, '#2a0a1e'], [1, '#0a0208']], .25, .45, .9)) +
    F('M52 318 C 80 324 120 330 156 326 C 140 336 100 342 70 334 Z', '#2a0814', ' opacity=".6"') +
    F('M60 330 C 84 338 116 340 140 332 C 116 326 88 324 60 330 Z', '#b8546e') + L('M70 331 C 92 334 116 334 134 330', '#e08aa0', 1, ' opacity=".6"') +
    P('M51 333 C 50 327 50 321 52 315 L 57 315 C 56 321 56 327 57 333 Z', email, ' stroke-width="1.8"') +
    P('M76 338 L 79 330 L 83 339 Z M96 340 L 99 332 L 103 340 Z M114 340 L 117 333 L 120 340 Z', '#e8d8a0', ' stroke-width="1.4"') +
    P('M44 314 C 70 330 102 346 136 344 C 152 343 160 336 162 326 C 166 336 158 350 136 352 C 102 354 66 340 44 314 Z', D.g(poil), ' stroke-width="2.6"') +
    L('M60 330 C 84 344 112 350 138 348', '#c8b4bc', 1.2, ' opacity=".4"') +
    piv('bave', 142, 338, bave);
  var sousLevre = D.clip('M-80 300 L 30 300 C 60 308 100 314 152 318 L 240 318 L 240 470 L -80 470 Z');
  var teteD = lisse([[28, 296], [52, 278], [96, 252], [140, 232], [180, 224], [212, 234], [230, 260], [224, 292], [198, 312], [150, 318], [100, 314], [56, 308], [32, 304]], true);
  var teteArt = P(teteD, D.g(poil)) + '<g' + D.clip(teteD) + '>' + F(teteD, '#000', CRASSE + ' opacity=".55"') + meches(170, 272, 50, 34, 18, 37, [clair(poil, .25), sombre(poil, .35)], .3, 12) + poils(160, 272, 64, 36, 60, 29, '#d8c6d0', sombreP, .32, .2) +
    F('M40 300 C 80 306 130 310 180 308 C 140 316 80 314 40 300 Z', '#c8b4bc', ' opacity=".5"') + '</g>' +
    L(lisse([[52, 276], [96, 250], [140, 230], [180, 222], [210, 232]]), LUNE, 2.4, ' opacity=".6"') +
    L('M62 284 q 6 6 4 14 M74 278 q 7 6 5 15 M86 272 q 6 6 4 14', sombreP, 1.8, ' opacity=".6"') + L('M65 282 q 6 6 4 12 M77 276 q 6 6 4 13', '#d8c6d0', 1.1, ' opacity=".35"') +
    L('M150 232 L 166 254', '#e0b4c2', 2.2, ' opacity=".75"') + L('M154 240 l 6 -3 M159 247 l 6 -3', '#e0b4c2', 1.2, ' opacity=".6"');
  var dentsH = P('M66 311 L 70 320 L 74 312 Z M82 313 L 86 323 L 90 314 Z M98 314 L 102 324 L 106 315 Z M116 315 L 119 324 L 123 316 Z M132 316 L 135 324 L 139 316 Z', '#efe2b0', ' stroke-width="1.4"') +
    P('M40 299 C 41 309 43 318 46 327 L 51 325.5 C 49 316 48 307 47.5 300 Z', D.lin([[0, '#c98a3a'], [1, '#8a5222']], 0, 0, 1, 1), ' stroke-width="2"') +
    P('M31 297 C 32 309 34 320 37 331 L 40 330.5 L 42 333 L 44 328.5 C 42 318 41 307 40 298 Z', email, ' stroke-width="2.2"') +
    L('M33.5 302 C 34.5 312 35.5 320 37.5 327', '#fff4c8', 1.2, ' opacity=".8"') + L('M34 314 l 6 -1', '#8a5222', 1, ' opacity=".6"');
  var nez = '<ellipse cx="25" cy="292" rx="10" ry="8" fill="' + D.g(rose) + '" stroke="' + O + '" stroke-width="3"/>' + F('M19 295 c 2 -3 6 -3 7 0 c -2 2 -5 2 -7 0 Z', '#4a1222') + C(27, 288, 2.4, '#fff', ' opacity=".85"') + C(31, 293, 1, '#fff', ' opacity=".6"') + ancre('narine');
  var points = [[46, 290], [54, 294], [62, 292], [52, 286], [60, 298], [70, 296]].map(function(p){ return C(p[0], p[1], 1.6, sombreP); }).join('');
  var moust = L('M50 290 C 30 278 14 272 2 270 M52 294 C 32 294 16 298 4 304 M58 298 C 44 306 32 314 22 322 M62 288 C 50 270 40 260 30 252 M66 286 C 60 266 56 254 54 244', '#ece4f0', 1.3, ' opacity=".85"');
  /* l'œil : deux couleurs superposées (jaune / rouge), une paupière qui descend, un sourcil */
  var gJ = D.id(), gR = D.id();
  D.l.push('<radialGradient id="' + gJ + '" cx=".45" cy=".45" r=".6"><stop offset="0" stop-color="#fffbd0"/><stop offset=".45" stop-color="#f2c42a"/><stop offset="1" stop-color="#7a4a08"/></radialGradient>');
  D.l.push('<radialGradient id="' + gR + '" cx=".45" cy=".45" r=".6"><stop offset="0" stop-color="#fff2a0"/><stop offset=".45" stop-color="#ff4a2a"/><stop offset="1" stop-color="#7a0a14"/></radialGradient>');
  var amande = 'M112 264 C 118 254 140 252 148 260 C 144 270 124 274 112 264 Z';
  var oeil = '<g data-halo="j"><circle cx="128" cy="262" r="30" fill="' + D.halo('#fff4b0', '#ffc020') + '" opacity=".7"/></g>' +
    '<g data-halo="r" opacity="0"><circle data-hc="r" cx="128" cy="262" r="34" fill="' + D.halo('#ffb0a0', '#ff2a2a') + '" opacity=".85"/></g>' +
    F('M108 264 C 116 252 140 248 152 258 C 148 272 124 278 108 264 Z', '#1a0a14', ' opacity=".7"') +
    P(amande, 'url(#' + gJ + ')', ' stroke-width="2.6"') + '<g data-iris="r" opacity="0">' + F(amande, 'url(#' + gR + ')') + '</g>' +
    F('M130 255 C 133 258 133 268 130 271 C 127 268 127 258 130 255 Z', '#1a0604') + C(123, 259, 2.8, '#fff') + C(140, 265, 1.2, '#fff', ' opacity=".7"') +
    '<g' + D.clip(amande) + '>' + piv('paupiere', 130, 240, F('M104 222 L 156 222 L 156 254 C 146 250 120 250 106 258 Z', D.g(sombre(poil, .1))) + L('M106 256 C 120 249 146 249 156 254', O, 2.6)) + '</g>' +
    L(amande, O, 2.6) + slot('larmes');
  var sourcil = P('M104 256 C 120 240 146 236 164 244 L 160 252 C 144 248 124 250 108 262 Z', D.g(sombre(poil, .45)));
  var tete = piv('tete', 222, 272,
    piv('oreilleF', 184, 222, oreilleF) + piv('oreille', 196, 232, oreille) + joue +
    '<g' + sousLevre + '>' + piv('machoire', 158, 322, machoire) + '</g>' +
    teteArt + dentsH + piv('nez', 25, 292, nez) + points + piv('moustaches', 60, 292, moust) +
    piv('oeil', 130, 262, oeil) + piv('sourcil', 136, 250, sourcil) + ancre('tete') + slot('teteFx'));

  /* ---- la patte avant proche : bras, avant-bras, main ---- */
  var main = P('M222 362 C 216 380 196 390 176 389 C 170 382 184 374 202 368 Z', D.g(rose), ' stroke-width="2.6"');
  main += doigt([180, 386], Math.PI + .2, 18, 6.2) + doigt([186, 388], Math.PI + .02, 20, 6.2) + doigt([194, 388], Math.PI - .15, 19, 6) + doigt([202, 386], Math.PI - .35, 15, 5.6);
  main += L('M184 380 C 196 376 208 372 216 366', '#ffd6de', 1.4, ' opacity=".55"') + ancre('main');
  var ab = tube([[258, 312], [240, 342], [214, 368]], [31, 22, 17]);
  var avbras = P(ab.d, D.g(poil)) + '<g' + D.clip(ab.d) + '>' + F(ab.d, '#000', CRASSE + ' opacity=".5"') + poils(236, 340, 14, 24, 16, 53, '#d8c6d0', sombreP, .34, 1.2) + '</g>' + L(lisse(ab.dr), LUNE, 1.8, ' opacity=".5"');
  var bb = tube([[240, 262], [252, 294], [258, 318]], [44, 36, 30]);
  var bras = hirsute(lelong([[248, 300], [262, 318], [258, 336]], 4), 12, D.g(poil), 51, [8, 3]) + P(bb.d, D.g(poil)) + '<g' + D.clip(bb.d) + '>' + F(bb.d, '#000', CRASSE + ' opacity=".5"') + poils(248, 290, 16, 24, 18, 55, '#d8c6d0', sombreP, .34, 1.2) + '</g>' + L(lisse(bb.dr), LUNE, 2, ' opacity=".55"');
  var pa = piv('bras', 240, 266, piv('avbras', 258, 318, piv('main', 214, 370, main) + avbras) + bras);

  /* ---- l'assemblage ---- */
  var ombre = '<ellipse cx="290" cy="393" rx="214" ry="16" fill="#000" opacity=".5"/><ellipse cx="300" cy="391" rx="150" ry="8" fill="#000" opacity=".35" filter="' + flou4 + '"/>';
  return piv('pos', 300, 390,
    slot('sol') + piv('ombre', 290, 392, ombre) +
    piv('saut', 300, 390, piv('secousse', 300, 300, piv('posture', 300, 300, piv('corps', 330, 320,
      queue + phF + paF + tronc + ph + slot('cible') + tete + pa + slot('feuHaut'))))) +
    slot('monde'));
}

/* =====================================================================
   3. Le CSS (injecté une seule fois)
   ===================================================================== */
var CSS = '.rat-anime{position:relative;width:100%;height:100%;transform-origin:50% 100%}' +
  '.rat-anime>svg{width:100%;height:100%;overflow:visible;display:block}' +
  '.rat-anime [data-j]{transform-box:view-box;transform-origin:0 0}' +
  '.rat-anime .ra-fl{transform-box:fill-box;transform-origin:50% 100%;animation:ra-flamme .42s ease-in-out infinite alternate}' +
  '.rat-anime .ra-fl2{transform-box:fill-box;transform-origin:50% 100%;animation:ra-flamme2 .3s ease-in-out infinite alternate}' +
  '@keyframes ra-flamme{0%{transform:scale(1,1) skewX(0deg)}35%{transform:scale(.88,1.18) skewX(-7deg)}70%{transform:scale(1.06,.9) skewX(5deg)}100%{transform:scale(.94,1.12) skewX(-3deg)}}' +
  '@keyframes ra-flamme2{0%{transform:scale(1,.9) skewX(4deg)}100%{transform:scale(.85,1.2) skewX(-6deg)}}' +
  '.rat-anime .ra-pulse{transform-box:fill-box;transform-origin:50% 50%;animation:ra-pulse 1s ease-in-out infinite}' +
  '@keyframes ra-pulse{0%,100%{transform:scale(.88);opacity:.75}50%{transform:scale(1.12);opacity:1}}' +
  '.rat-anime .ra-tourne{transform-box:fill-box;transform-origin:50% 50%;animation:ra-tourne 3s linear infinite}' +
  '@keyframes ra-tourne{to{transform:rotate(360deg)}}' +
  '.rat-anime .ra-scint{transform-box:fill-box;transform-origin:50% 50%;animation:ra-scint 1.1s ease-in-out infinite}' +
  '@keyframes ra-scint{0%,100%{transform:scale(0) rotate(0deg);opacity:0}45%{transform:scale(1.15) rotate(45deg);opacity:1}60%{transform:scale(.8) rotate(60deg);opacity:.9}}' +
  '.rat-anime .ra-halo{transform-box:fill-box;transform-origin:50% 50%;animation:ra-halo .7s ease-in-out infinite alternate}' +
  '@keyframes ra-halo{from{transform:scale(.85);opacity:.6}to{transform:scale(1.25);opacity:1}}' +
  '.rat-anime .ra-bulle{transform-box:fill-box;transform-origin:50% 100%;animation:ra-bulle 2.4s ease-in-out infinite}' +
  '@keyframes ra-bulle{0%,100%{transform:scale(1);opacity:.8}50%{transform:scale(1.25,.85);opacity:1}}' +
  '.ra-scene-fx{position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;pointer-events:none;z-index:5}';
function injecterCSS(){
  if(document.getElementById('rat-anime-css')) return;
  var s = document.createElement('style'); s.id = 'rat-anime-css'; s.textContent = CSS; document.head.appendChild(s);
}

/* =====================================================================
   4. Le moteur : des poses-clés jouées par la Web Animations API
   ===================================================================== */
var Z = {x: 0, y: 0, a: 0, sx: 1, sy: 1};
function r3(n){ return Math.round(n * 1000) / 1000; }
function tf(v){ return 'translate(' + r3(v.x) + 'px,' + r3(v.y) + 'px) rotate(' + r3(v.a) + 'deg) scale(' + r3(v.sx) + ',' + r3(v.sy) + ')'; }
function fusion(a, b){
  var o = {x: a.x, y: a.y, a: a.a, sx: a.sx, sy: a.sy};
  if(b){ for(var k in o) if(b[k] != null) o[k] = b[k]; if(b.s != null){ o.sx = b.s; o.sy = b.s; } }
  return o;
}
function attendreMs(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }
function fini(a){ return a && a.finished ? a.finished.then(function(){}, function(){}) : Promise.resolve(); }
function enCours(a){ return a.playState === 'running' || a.playState === 'paused' || a.playState === 'pending'; }
function hasard(a, b){ return a + Math.random() * (b - a); }
function choisir(l){ return l[Math.floor(Math.random() * l.length)]; }
/* une onde (pour la queue, les pattes qui gigotent…) : des clés échantillonnées sur un sinus */
function onde(base, amp, n, canal){
  var cles = [];
  n = n || 8;
  for(var i = 0; i <= n; i++){ var t = i / n, v = {}; v[canal || 'a'] = (base || 0) + amp * Math.sin(t * Math.PI * 2); cles.push({t: t, v: v}); }
  return cles;
}

/* ---------- la cuisson (voir jeu/donjon/RAPIDITE.md et anim/cuire.js) ----------
   RatAnime.preparer({res}) cuit UNE fois le dessin du rat en images (pièces articulées = <div> HTML animés par la carte
   graphique, sans rien repeindre) ; ensuite, chaque RatAnime.creer() en fait une copie. Sans préparation (ou sans cuire.js),
   le rat reste le grand SVG d'origine, comme avant. */
var SVGNS = 'http://www.w3.org/2000/svg', VB = '0 104 540 336';
var MODELE = null, PREP = null, BRUME = [];
var PIECES = ['data-j', 'data-c', 'data-slot', 'data-a', 'data-rage', 'data-halo', 'data-iris', 'data-hc'];
function preparer(o){
  if(PREP) return PREP;
  var Cu = global.Cuire;
  if(!Cu || !Cu.cuire || typeof document === 'undefined') return Promise.resolve(null);
  o = o || {};
  var res = o.res || Math.max(1, Math.min(3, (global.devicePixelRatio || 1) * 200 / 540 * 1.3));
  injecterCSS();
  var h = Cu.hote(540, 336), D = new Defs('ratP_');
  var art = dessinerRat(D);
  h.innerHTML = '<svg xmlns="' + SVGNS + '" viewBox="' + VB + '" preserveAspectRatio="xMidYMax meet" style="display:block;width:540px;height:336px"><defs>' + D.l.join('') + '</defs>' + art + '</svg>';
  var svg = h.firstElementChild;
  /* les volutes de brume noire de l'explosion : leur flou est cuit une fois (6 tirages de couleurs) */
  var R0 = rng(91), brumes = [];
  for(var k = 0; k < 6; k++){
    var c = ['#120c18', '#1a1222', '#22182c', '#0c0812'][Math.floor(R0() * 4)], cl = ['#5a4c6c', '#6a5a80', '#4a3e5a', '#7a6a8e'][k % 4], r = 40;
    brumes.push(Cu.image('<svg viewBox="-52 -52 104 104"><defs><filter id="b" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="2.6"/></filter></defs><g filter="url(#b)">' +
      '<circle r="' + r + '" fill="' + c + '"/><circle cx="' + f1(-r * .28) + '" cy="' + f1(-r * .32) + '" r="' + f1(r * .62) + '" fill="' + cl + '" opacity=".55"/><circle cx="' + f1(r * .12) + '" cy="' + f1(r * .2) + '" r="' + f1(r * .7) + '" fill="' + c + '" opacity=".8"/></g></svg>', 104, 104, Math.min(2, res * 1.6)));
  }
  /* (pas de will-change sur les pièces : seules celles qui bougent deviennent des calques, le navigateur s'en charge ;
     trop de calques forcés coûtent à chaque image et peuvent dépasser la mémoire d'une vieille tablette) */
  PREP = Promise.all([Cu.cuire(svg, {piece:function(e){ for(var i = 0; i < PIECES.length; i++) if(e.hasAttribute(PIECES[i])) return true; return false; }, res:res}), Promise.all(brumes)])
    .then(function(r){ MODELE = r[0]; BRUME = r[1].filter(Boolean); h.remove(); return MODELE; }, function(e){ h.remove(); if(global.console) console.warn('RatAnime.preparer', e); return null; });
  return PREP;
}

function Rat(conteneur){
  injecterCSS();
  this.c = conteneur;
  var D = new Defs('ratA' + (++NUM) + '_');
  this.D = D;
  var div = document.createElement('div');
  div.className = 'rat-anime';
  conteneur.appendChild(div);
  this.el = div;
  if(MODELE){
    /* la copie cuite : la même hiérarchie de pièces, en <div> qui portent des images */
    var cl = MODELE.cloner(div);
    this.cuit = true; this.svg = null; this.racine = cl.vue; this.defs = cl.defs;
  } else {
    var art = dessinerRat(D);     /* d'abord le dessin : il remplit D.l (les dégradés) */
    div.innerHTML = '<svg xmlns="' + SVGNS + '" viewBox="' + VB + '" preserveAspectRatio="xMidYMax meet"><defs>' + D.l.join('') + '</defs>' + art + '</svg>';
    this.svg = this.racine = div.querySelector('svg');
    this.defs = this.svg.querySelector('defs');
  }
  var self = this;
  this.J = {}; this.S = {}; this.A = {};
  [].forEach.call(this.racine.querySelectorAll('[data-j]'), function(e){ self.J[e.getAttribute('data-j')] = e; });
  [].forEach.call(this.racine.querySelectorAll('[data-slot]'), function(e){ self.S[e.getAttribute('data-slot')] = e; });
  [].forEach.call(this.racine.querySelectorAll('[data-a]'), function(e){ self.A[e.getAttribute('data-a')] = e; });
  /* cuit : chaque pièce a une seconde couche pour les petits gestes qui s'ajoutent à l'attente (au lieu de composite: add,
     que la carte graphique ne sait pas jouer) */
  if(this.cuit){
    this.JA = {};
    Object.keys(this.J).forEach(function(n){
      var j = self.J[n], a = document.createElement('div');
      a.className = 'cu';
      while(j.firstChild) a.appendChild(j.firstChild);
      j.appendChild(a);
      self.JA[n] = a;
    });
  }
  this.v = {};
  this.etat = {enrage: false, ebloui: false, dos: false, feu: false, colle: false, cible: false, yeux: 'jaune'};
  this.attente = true;
  this.jeton = 0;
  this.enAction = false;
  this.boucles = [];
  this.minuteurs = [];
  this.fx = {};
  this.mort = false;
  this.vitesse = 1;
  this._reprendre(0);
}
var R = Rat.prototype;

/* lire la pose actuelle d'une pièce (même au milieu d'une animation) */
function matrice(t){
  if(!t || t === 'none') return [1, 0, 0, 1, 0, 0];
  var m = t.match(/matrix\(([^)]+)\)/);
  return m ? m[1].split(',').map(parseFloat) : null;
}
R._lire = function(n){
  var el = this.J[n], ref = this.v[n] || Z, v = matrice(getComputedStyle(el).transform);
  if(!v) return fusion(ref);
  /* cuit : la couche des petits gestes s'ajoute à la pose */
  if(this.JA){ var w = matrice(getComputedStyle(this.JA[n]).transform); if(w) v = [v[0] * w[0] + v[2] * w[1], v[1] * w[0] + v[3] * w[1], v[0] * w[2] + v[2] * w[3], v[1] * w[2] + v[3] * w[3], v[0] * w[4] + v[2] * w[5] + v[4], v[1] * w[4] + v[3] * w[5] + v[5]]; }
  if(v[0] === 1 && v[1] === 0 && v[2] === 0 && v[3] === 1 && v[4] === 0 && v[5] === 0) return fusion(Z);
  var sx = Math.hypot(v[0], v[1]), ang = Math.atan2(v[1], v[0]) * 180 / Math.PI, sy = (v[0] * v[3] - v[1] * v[2]) / (sx || 1);
  while(ang - ref.a > 180) ang -= 360;
  while(ang - ref.a < -180) ang += 360;
  return {x: v[4], y: v[5], a: ang, sx: sx, sy: sy};
};
/* figer : on lit toutes les poses, on coupe les animations, on garde la pose */
R._figer = function(noms){
  var self = this;
  /* d'abord tout lire (poses et animations), ensuite tout couper et écrire : une lecture après une écriture
     forcerait le navigateur à recalculer les styles, une fois par pièce (RAPIDITE.md) */
  var lu = (noms || Object.keys(this.J)).map(function(n){ return [n, self._lire(n), self.J[n].getAnimations()]; });
  lu.forEach(function(l){
    var n = l[0], el = self.J[n];
    l[2].forEach(function(a){ a.cancel(); });
    if(self.JA){ var ja = self.JA[n]; (ja._en || []).forEach(function(a){ a.cancel(); }); ja._en = []; ja.style.transform = ''; }
    el.style.transform = tf(l[1]);
    self.v[n] = l[1];
  });
};
/* jouer une suite de poses-clés.  cles = [{t:0..1, p:{piece:{x,y,a,sx,sy,s}}, e:'easing'}]
   o.boucle : en boucle ; o.ajout : s'ajoute par-dessus (composite add) ; o.vitesse ; o.delai */
R._seq = function(cles, duree, o){
  o = o || {};
  var self = this, noms = {}, anims = [];
  cles.forEach(function(k){ for(var n in k.p) noms[n] = 1; });
  Object.keys(noms).forEach(function(n){
    var el = self.J[n];
    if(!el) return;
    var cur = o.ajout ? fusion(Z) : (o.depuis ? fusion(Z, o.depuis[n]) : self._lire(n)), frames = [];
    if(!(cles[0].t === 0 && cles[0].p[n])) frames.push({offset: 0, transform: tf(cur)});
    cles.forEach(function(k){
      if(!k.p[n]) return;
      cur = fusion(cur, k.p[n]);
      if(frames.length && k.e) frames[frames.length - 1].easing = k.e;
      frames.push({offset: k.t, transform: tf(cur)});
    });
    if(frames[frames.length - 1].offset < 1) frames.push({offset: 1, transform: tf(cur)});
    frames.forEach(function(f){ if(!f.easing) f.easing = o.e || 'ease-in-out'; });
    if(!o.ajout && !o.boucle) self.v[n] = cur;
    /* cuit : un petit geste « qui s'ajoute » se joue sur la couche à part (en remplacement : la carte graphique sait le jouer),
       sauf s'il en chevauche un autre sur la même pièce */
    var comp = o.ajout ? 'add' : 'replace', ja = null;
    /* (on tient soi-même la liste des gestes en cours : getAnimations() forcerait un recalcul des styles à chaque geste) */
    if(o.ajout && self.JA){ el = ja = self.JA[n]; ja._en = (ja._en || []).filter(enCours); comp = ja._en.length ? 'add' : 'replace'; }
    var a = el.animate(frames, {duration: duree, iterations: o.boucle ? Infinity : 1, fill: o.ajout ? 'none' : 'forwards', composite: comp, delay: o.delai || 0});
    if(ja) ja._en.push(a);
    a.playbackRate = (o.vitesse || 1);
    if(o.boucle) self.boucles.push(a);
    else if(!o.ajout) a.finished.then(function(){ try{ a.commitStyles(); a.cancel(); }catch(e){} }, function(){});
    anims.push(a);
  });
  return {anims: anims, fini: Promise.all(anims.map(fini))};
};
/* aller doucement vers une pose (les pièces absentes reviennent au repos si o.tout) */
R._allerA = function(pose, duree, e, tout){
  var p = {}, n;
  if(tout) for(n in this.J) p[n] = fusion(Z);
  for(n in pose) p[n] = fusion(Z, pose[n]);
  return this._seq([{t: 1, p: p, e: e || 'cubic-bezier(.3,.7,.3,1)'}], duree).fini;
};
/* un point d'une pièce, ramené dans le repère « monde » (le sol, qui ne tourne pas) */
R._ou = function(ancre, x, y){
  var el = typeof ancre === 'string' ? (this.A[ancre] || this.J[ancre] || this.S[ancre]) : ancre;
  if(this.cuit){ var Cu = global.Cuire, q = Cu.ap(Cu.ctm(el), x, y); return Cu.ap(Cu.inv(Cu.ctm(this.S.monde)), q[0], q[1]); }
  var m = el.getCTM(), w = this.S.monde.getCTM(), p = this.svg.createSVGPoint();
  p.x = x; p.y = y;
  p = p.matrixTransform(m).matrixTransform(w.inverse());
  return [p.x, p.y];
};
/* le contenu d'une pièce (son repère est celui du dessin) */
R._contenu = function(n){ return this.J[n].querySelector('[data-c]'); };
/* un point du dessin, en pixels de la boîte du rat (tous les mouvements compris) */
R.point = function(nom, x, y){
  var el = this.A[nom] || this.J[nom] || this.S[nom];
  if(this.cuit) return global.Cuire.point(el, x, y);
  var p = this.svg.createSVGPoint(); p.x = x; p.y = y; p = p.matrixTransform(el.getCTM());
  return {x: p.x, y: p.y};
};
/* signale au jeu que la bête bouge (pour que les badges la suivent pendant ce temps-là) */
R._bouge = function(ms){ try{ this.c.dispatchEvent(new CustomEvent('bete-bouge', {bubbles: true, detail: {ms: ms || 1200}})); }catch(e){} };
function opa(e, v){ if(e.namespaceURI === SVGNS) e.setAttribute('opacity', v); else e.style.opacity = v; }
R._def = function(fn){ var n0 = this.D.l.length, r = fn(this.D); this.defs.insertAdjacentHTML('beforeend', this.D.l.slice(n0).join('')); return r; };
R._minuteur = function(f, ms){ var self = this, id = setTimeout(function(){ self.minuteurs.splice(self.minuteurs.indexOf(id), 1); f(); }, ms); this.minuteurs.push(id); return id; };
R._couperMinuteurs = function(){ this.minuteurs.forEach(clearTimeout); this.minuteurs = []; };
R._couperBoucles = function(){
  this._couperMinuteurs();
  this._figer();
  this.boucles = [];
};
/* un élément SVG créé à la volée */
R._el = function(parent, html, cls){
  /* cuit : un petit îlot SVG dans un <div> (on anime le <div> : la carte graphique le déplace sans le repeindre) */
  if(this.cuit) return global.Cuire.ilot(parent, html, cls);
  var g = document.createElementNS(SVGNS, 'g');
  g.innerHTML = html;
  if(cls) g.setAttribute('class', cls);
  parent.appendChild(g);
  return g;
};
/* cuit : un <div> vide placé en (x, y) dans le repère d'un emplacement (pour regrouper des effets) */
R._place = function(parent, x, y, cls){ return global.Cuire.place(parent, x, y, cls); };

/* =====================================================================
   5. Les poses de base de chaque mode
   ===================================================================== */
function rotAutour(a, Q, Pv){
  /* rotation d'angle a autour du point Q, exprimée autour du pivot Pv : on renvoie {a, x, y} */
  var r = a * Math.PI / 180, c = Math.cos(r), s = Math.sin(r), dx = Q[0] - Pv[0], dy = Q[1] - Pv[1];
  return {a: a, x: dx - (dx * c - dy * s), y: dy - (dx * s + dy * c)};
}
var POSES = {
  normal: {},
  /* ébloui : il se dresse sur ses pattes arrière, une main devant les yeux, le ventre offert */
  ebloui: (function(){
    var p = {};
    var r = rotAutour(52, [410, 380], [300, 300]);
    p.posture = {a: r.a, x: r.x, y: r.y};
    p.cuisse = {a: -38}; p.tibia = {a: -26}; p.pied = {a: 14};
    p.cuisseF = {a: -40}; p.tibiaF = {a: -22}; p.piedF = {a: 12};
    p.tete = {a: -26, x: 18, y: 10}; p.machoire = {a: -12};
    p.bras = {a: 50, x: -16, y: 2}; p.avbras = {a: 12}; p.main = {a: 24};
    p.brasF = {a: 70}; p.avbrasF = {a: -70}; p.mainF = {a: -30};
    p.oreille = {a: 22}; p.oreilleF = {a: 18};
    p.q0 = {a: 24}; p.q1 = {a: 24}; p.q2 = {a: 22}; p.q3 = {a: 18}; p.q4 = {a: 14}; p.q5 = {a: 10};
    return p;
  })(),
  /* sur le dos : retourné, le ventre en l'air, les pattes en haut */
  dos: (function(){
    var p = {};
    var r = rotAutour(176, [318, 282], [300, 300]);
    p.posture = {a: r.a, x: r.x, y: r.y + 6};
    p.tete = {a: 26}; p.machoire = {a: -16};
    p.bras = {a: 30}; p.avbras = {a: 30}; p.brasF = {a: 10}; p.avbrasF = {a: 40};
    p.cuisse = {a: 20}; p.tibia = {a: 10}; p.cuisseF = {a: 30}; p.tibiaF = {a: 10};
    p.q0 = {a: -40}; p.q1 = {a: -20}; p.q2 = {a: -10}; p.q3 = {a: 10};
    p.oreille = {a: -20};
    return p;
  })()
};
R._mode = function(){ return this.etat.dos ? 'dos' : (this.etat.ebloui ? 'ebloui' : 'normal'); };
R._base = function(){
  var p = {}, m = POSES[this._mode()], n;
  for(n in m) p[n] = m[n];
  if(this.etat.enrage){ p.crete = {sy: 1.22, sx: 1.04}; p.sourcil = {a: -8, y: 3}; p.oreille = p.oreille || {a: 14}; }
  return p;
};

/* =====================================================================
   6. L'attente : des boucles vivantes + des petits événements au hasard
   ===================================================================== */
R._reprendre = function(duree){
  var self = this;
  if(this.mort) return Promise.resolve();
  this._couperBoucles();
  var d = duree == null ? 380 : duree;
  this._bouge(d + 100);
  this._contreFeu(d);
  return this._allerA(this._base(), d, 'cubic-bezier(.3,.7,.3,1)', true).then(function(){
    if(self.enAction || self.mort) return;
    if(self.attente) self._lancerBoucles();
  });
};
R._lancerBoucles = function(){
  var self = this, b = this._base(), mode = this._mode(), V = this.etat.enrage ? 1.55 : 1;
  this.vitesse = V;
  function B(n){ return fusion(Z, b[n]); }
  function autour(n, d){ var v = B(n), o = {}; for(var k in d) o[k] = (k === 'sx' || k === 'sy') ? v[k] * d[k] : v[k] + d[k]; return o; }
  function boucle(n, deltas, duree, e, delai){
    var cles = deltas.map(function(d){ return {t: d[0], p: (function(){ var o = {}; o[n] = autour(n, d[1]); return o; })(), e: e}; });
    return self._seq(cles, duree, {boucle: true, vitesse: V, depuis: b, delai: delai || 0});
  }
  /* la queue : une onde qui descend le long des segments */
  function queue(amp, duree, base){
    for(var i = 0; i < QC.length - 1; i++){
      var A = amp * (0.4 + i * .18), cles = onde(0, A, 8).map(function(k){ return [k.t, {a: k.v.a + (base ? base[i] || 0 : 0)}]; });
      boucle('q' + i, cles, duree, 'linear', -i * duree * .09 / V);
    }
  }
  if(mode === 'normal'){
    boucle('souffle', [[0, {sy: 1, sx: 1}], [.45, {sy: 1.035, sx: .992}], [1, {sy: 1, sx: 1}]], 1700, 'ease-in-out');
    boucle('crete', [[0, {sy: 1}], [.45, {sy: 1.06}], [1, {sy: 1}]], 1700, 'ease-in-out');
    boucle('tete', [[0, {a: 0, y: 0}], [.22, {a: 1.6, y: -1.5}], [.5, {a: -1.2, y: 1}], [.74, {a: 2, y: -1}], [1, {a: 0, y: 0}]], 2600, 'ease-in-out');
    boucle('nez', [[0, {y: 0, a: 0}], [.12, {y: -1.6, a: -5}], [.24, {y: 0, a: 0}], [.36, {y: -1.4, a: -4}], [.48, {y: 0, a: 0}], [1, {y: 0, a: 0}]], 900, 'ease-in-out');
    boucle('moustaches', [[0, {a: 0}], [.2, {a: -6}], [.4, {a: 2}], [.6, {a: -4}], [1, {a: 0}]], 760, 'ease-in-out');
    boucle('machoire', [[0, {a: 0}], [.3, {a: -2.5}], [.5, {a: 0}], [.7, {a: -3.5}], [1, {a: 0}]], 1300, 'ease-in-out');
    boucle('oreille', [[0, {a: 0}], [.35, {a: -5}], [.65, {a: 3}], [1, {a: 0}]], 3100, 'ease-in-out');
    boucle('oreilleF', [[0, {a: 0}], [.4, {a: 4}], [.7, {a: -3}], [1, {a: 0}]], 2700, 'ease-in-out');
    boucle('corps', [[0, {x: 0, a: 0}], [.5, {x: -3, a: -.8}], [1, {x: 0, a: 0}]], 2400, 'ease-in-out');
    boucle('main', [[0, {a: 0}], [.5, {a: -3}], [1, {a: 0}]], 2400, 'ease-in-out');
    boucle('cuisse', [[0, {a: 0}], [.5, {a: 1.5}], [1, {a: 0}]], 2400, 'ease-in-out');
    boucle('pied', [[0, {a: 0}], [.5, {a: -1.5}], [1, {a: 0}]], 2400, 'ease-in-out');
    queue(4, 2600);
  } else if(mode === 'ebloui'){
    boucle('posture', [[0, {a: 0}], [.5, {a: -4, x: -2}], [1, {a: 0}]], 1400, 'ease-in-out');
    boucle('tete', [[0, {a: 0}], [.25, {a: -6}], [.5, {a: 3}], [.75, {a: -4}], [1, {a: 0}]], 900, 'ease-in-out');
    boucle('main', [[0, {a: 0}], [.5, {a: 8}], [1, {a: 0}]], 380, 'ease-in-out');
    boucle('avbras', [[0, {a: 0}], [.5, {a: -5}], [1, {a: 0}]], 760, 'ease-in-out');
    boucle('mainF', [[0, {a: 0}], [.5, {a: -18}], [1, {a: 0}]], 520, 'ease-in-out');
    boucle('avbrasF', [[0, {a: 0}], [.5, {a: 12}], [1, {a: 0}]], 640, 'ease-in-out');
    boucle('paupiere', [[0, {y: 10}], [.5, {y: 13}], [1, {y: 10}]], 600, 'ease-in-out');
    boucle('souffle', [[0, {sy: 1}], [.5, {sy: 1.045}], [1, {sy: 1}]], 900, 'ease-in-out');
    boucle('machoire', [[0, {a: 0}], [.5, {a: -8}], [1, {a: 0}]], 700, 'ease-in-out');
    boucle('nez', [[0, {y: 0}], [.2, {y: -2}], [.4, {y: 0}], [1, {y: 0}]], 500, 'ease-in-out');
    queue(6, 1500);
  } else {
    /* sur le dos : les quatre pattes gigotent, il se tortille */
    boucle('posture', [[0, {a: 0, x: 0}], [.25, {a: 7, x: 4}], [.5, {a: 0, x: 0}], [.75, {a: -7, x: -4}], [1, {a: 0, x: 0}]], 760, 'ease-in-out');
    boucle('bras', [[0, {a: 0}], [.5, {a: 30}], [1, {a: 0}]], 330, 'ease-in-out');
    boucle('avbras', [[0, {a: -10}], [.5, {a: 28}], [1, {a: -10}]], 280, 'ease-in-out', -90);
    boucle('main', [[0, {a: 0}], [.5, {a: -30}], [1, {a: 0}]], 300, 'ease-in-out');
    boucle('brasF', [[0, {a: 20}], [.5, {a: -15}], [1, {a: 20}]], 360, 'ease-in-out');
    boucle('avbrasF', [[0, {a: 0}], [.5, {a: 30}], [1, {a: 0}]], 300, 'ease-in-out', -120);
    boucle('cuisse', [[0, {a: -15}], [.5, {a: 20}], [1, {a: -15}]], 410, 'ease-in-out');
    boucle('tibia', [[0, {a: 10}], [.5, {a: -25}], [1, {a: 10}]], 350, 'ease-in-out', -100);
    boucle('pied', [[0, {a: 0}], [.5, {a: 25}], [1, {a: 0}]], 300, 'ease-in-out');
    boucle('cuisseF', [[0, {a: 15}], [.5, {a: -15}], [1, {a: 15}]], 450, 'ease-in-out');
    boucle('tibiaF', [[0, {a: -10}], [.5, {a: 20}], [1, {a: -10}]], 380, 'ease-in-out', -140);
    boucle('tete', [[0, {a: 0}], [.25, {a: 14}], [.5, {a: 0}], [.75, {a: -10}], [1, {a: 0}]], 520, 'ease-in-out');
    boucle('machoire', [[0, {a: 0}], [.5, {a: -18}], [1, {a: 0}]], 600, 'ease-in-out');
    boucle('oreille', [[0, {a: 0}], [.5, {a: 15}], [1, {a: 0}]], 400, 'ease-in-out');
    boucle('souffle', [[0, {sy: 1}], [.5, {sy: 1.05}], [1, {sy: 1}]], 600, 'ease-in-out');
    queue(14, 900, [-40, -20, -10, 10]);
  }
  this._planifier(400);
};
/* les petits événements qui rendent l'attente vivante et menaçante */
R._planifier = function(ms){
  var self = this;
  this._minuteur(function(){
    if(self.enAction || self.mort || !self.attente) return;
    self._evenement();
    var V = self.etat.enrage ? 1.7 : 1;
    self._planifier(hasard(700, 1700) / V);
  }, ms);
};
R._evenement = function(){
  var mode = this._mode(), self = this, liste = [];
  if(mode === 'normal'){
    liste = ['claque', 'claque', 'renifle', 'cligne', 'bave', 'bave', 'oreille', 'grogne', 'fixe', 'gratte'];
    if(this.etat.enrage) liste = liste.concat(['claque', 'claque', 'grogne', 'fixe']);
    if(this.etat.colle) liste = ['colle', 'colle', 'colle', 'claque', 'grogne', 'cligne'];
  } else if(mode === 'ebloui') liste = ['cligneFort', 'cligneFort', 'larme', 'secoueTete'];
  else liste = ['couine', 'cligne'];
  if(this.etat.feu) liste = liste.concat(['sursaut', 'secoue', 'souffle', 'sursaut']);
  var ev = choisir(liste), A = {ajout: true, vitesse: this.vitesse};
  switch(ev){
    case 'claque':
      var n = this.etat.enrage ? 2 : 1, cles = [{t: 0, p: {machoire: {a: 0}, tete: {a: 0}}}], d = 1 / n;
      for(var i = 0; i < n; i++){
        cles.push({t: d * i + d * .35, p: {machoire: {a: -26}, tete: {a: 4}}, e: 'cubic-bezier(.4,0,.6,1)'});
        cles.push({t: d * i + d * .55, p: {machoire: {a: 2}, tete: {a: -4}}, e: 'cubic-bezier(.6,0,.9,.5)'});
        cles.push({t: d * i + d * .8, p: {machoire: {a: 0}, tete: {a: 0}}, e: 'ease-out'});
      }
      this._seq(cles, 520 * n, A);
      break;
    case 'renifle':
      this._seq([{t: 0, p: {tete: {a: 0, x: 0}, nez: {y: 0}}}, {t: .15, p: {tete: {a: 4, x: -3}, nez: {y: -3}}}, {t: .3, p: {tete: {a: 1, x: -1}, nez: {y: 0}}}, {t: .45, p: {tete: {a: 5, x: -4}, nez: {y: -3}}}, {t: .6, p: {tete: {a: 1}, nez: {y: 0}}}, {t: .75, p: {tete: {a: 4, x: -2}, nez: {y: -2}}}, {t: 1, p: {tete: {a: 0, x: 0}, nez: {y: 0}}}], 800, A);
      this._seq([{t: 0, p: {moustaches: {a: 0}}}, {t: .25, p: {moustaches: {a: -12}}}, {t: .5, p: {moustaches: {a: 4}}}, {t: .75, p: {moustaches: {a: -10}}}, {t: 1, p: {moustaches: {a: 0}}}], 800, A);
      break;
    case 'cligne':
      this._seq([{t: 0, p: {paupiere: {y: 0}}}, {t: .4, p: {paupiere: {y: 17}}, e: 'ease-in'}, {t: 1, p: {paupiere: {y: 0}}, e: 'ease-out'}], 200, A);
      break;
    case 'cligneFort':
      this._seq([{t: 0, p: {paupiere: {y: 0}, sourcil: {y: 0}}}, {t: .3, p: {paupiere: {y: 8}, sourcil: {y: 3}}}, {t: .5, p: {paupiere: {y: -6}, sourcil: {y: -2}}}, {t: .7, p: {paupiere: {y: 8}, sourcil: {y: 3}}}, {t: 1, p: {paupiere: {y: 0}, sourcil: {y: 0}}}], 520, A);
      break;
    case 'bave':
      this._baveGoutte();
      break;
    case 'oreille':
      this._seq([{t: 0, p: {oreille: {a: 0}}}, {t: .25, p: {oreille: {a: 22}}, e: 'ease-out'}, {t: .5, p: {oreille: {a: -8}}}, {t: .7, p: {oreille: {a: 4}}}, {t: 1, p: {oreille: {a: 0}}}], 600, A);
      break;
    case 'grogne':
      var g = [{t: 0, p: {secousse: {x: 0, a: 0}, machoire: {a: 0}, crete: {sy: 1}, sourcil: {y: 0}}}];
      for(var k = 1; k < 10; k++) g.push({t: k / 10, p: {secousse: {x: (k % 2 ? 1.6 : -1.6), a: (k % 2 ? .6 : -.6)}, machoire: {a: -6 - (k % 3)}, crete: {sy: 1.12}, sourcil: {y: 3}}, e: 'linear'});
      g.push({t: 1, p: {secousse: {x: 0, a: 0}, machoire: {a: 0}, crete: {sy: 1}, sourcil: {y: 0}}});
      this._seq(g, 900, A);
      break;
    case 'fixe':
      this._seq([{t: 0, p: {tete: {a: 0, x: 0}, posture: {x: 0, a: 0}, sourcil: {y: 0, a: 0}, oreille: {a: 0}}}, {t: .3, p: {tete: {a: -7, x: -6}, posture: {x: -6, a: -1}, sourcil: {y: 4, a: -6}, oreille: {a: 16}}, e: 'cubic-bezier(.2,.8,.3,1)'},
        {t: .75, p: {tete: {a: -6, x: -5}, posture: {x: -5, a: -1}, sourcil: {y: 4, a: -6}, oreille: {a: 14}}}, {t: 1, p: {tete: {a: 0, x: 0}, posture: {x: 0, a: 0}, sourcil: {y: 0, a: 0}, oreille: {a: 0}}}], 1400, A);
      break;
    case 'gratte':
      this._seq([{t: 0, p: {bras: {a: 0}, avbras: {a: 0}, main: {a: 0}}}, {t: .2, p: {bras: {a: 10}, avbras: {a: 22}, main: {a: 14}}, e: 'ease-out'}, {t: .4, p: {bras: {a: -8}, avbras: {a: -6}, main: {a: -8}}, e: 'ease-in'},
        {t: .6, p: {bras: {a: 8}, avbras: {a: 18}, main: {a: 10}}}, {t: .8, p: {bras: {a: -6}, avbras: {a: -4}, main: {a: -6}}}, {t: 1, p: {bras: {a: 0}, avbras: {a: 0}, main: {a: 0}}}], 900, A);
      this._poussiere(this._ou('main', 190, 390), 3, 1);
      break;
    case 'larme':
      this._larme();
      break;
    case 'secoueTete':
      this._seq([{t: 0, p: {tete: {a: 0}}}, {t: .2, p: {tete: {a: 12}}}, {t: .4, p: {tete: {a: -10}}}, {t: .6, p: {tete: {a: 8}}}, {t: .8, p: {tete: {a: -5}}}, {t: 1, p: {tete: {a: 0}}}], 600, A);
      break;
    case 'couine':
      this._cri(1);
      break;
    case 'colle':
      this._tirerPatte();
      break;
    case 'sursaut':
      this._seq([{t: 0, p: {saut: {y: 0, sy: 1}, secousse: {a: 0}, crete: {sy: 1}, paupiere: {y: 0}, machoire: {a: 0}}}, {t: .15, p: {saut: {y: 4, sy: .9}}, e: 'ease-out'},
        {t: .4, p: {saut: {y: -34, sy: 1.1}, secousse: {a: -6}, crete: {sy: 1.4}, paupiere: {y: 15}, machoire: {a: -20}}, e: 'cubic-bezier(.2,.8,.4,1)'},
        {t: .75, p: {saut: {y: 0, sy: .92}, secousse: {a: 2}}, e: 'cubic-bezier(.6,0,.9,.5)'}, {t: 1, p: {saut: {y: 0, sy: 1}, secousse: {a: 0}, crete: {sy: 1}, paupiere: {y: 0}, machoire: {a: 0}}, e: 'ease-out'}], 700, A);
      this._cri(.8);
      break;
    case 'secoue':
      var s = [{t: 0, p: {secousse: {a: 0, x: 0}, tete: {a: 0}}}];
      for(var j = 1; j < 8; j++) s.push({t: j / 8, p: {secousse: {a: j % 2 ? 7 : -7, x: j % 2 ? 4 : -4}, tete: {a: j % 2 ? -10 : 10}}, e: 'ease-in-out'});
      s.push({t: 1, p: {secousse: {a: 0, x: 0}, tete: {a: 0}}});
      this._seq(s, 760, A);
      break;
    case 'souffle':
      this._soufflePatte();
      break;
  }
};

/* =====================================================================
   7. Petits effets (particules dans le repère « monde »)
   ===================================================================== */
R._fxEl = function(html, parent){ return this._el(parent || this.S.monde, html); };
R._bouffee = function(p, o){
  o = o || {};
  var r = o.r || 8, coul = o.coul || '#c8c0d8', g = this._fxEl('<circle cx="0" cy="0" r="' + r + '" fill="' + coul + '" opacity="' + (o.op || .7) + '"/>' + (o.liser ? '<circle cx="' + f1(-r * .3) + '" cy="' + f1(-r * .3) + '" r="' + f1(r * .45) + '" fill="#ffffff" opacity=".35"/>' : ''));
  var dx = o.dx == null ? hasard(-10, 10) : o.dx, dy = o.dy == null ? -30 : o.dy, d = o.duree || 900;
  var a = g.animate([{transform: 'translate(' + p[0] + 'px,' + p[1] + 'px) scale(' + (o.s0 || .3) + ')', opacity: 0}, {offset: .15, opacity: 1}, {transform: 'translate(' + (p[0] + dx) + 'px,' + (p[1] + dy) + 'px) scale(' + (o.s1 || 1.6) + ')', opacity: 0}], {duration: d, easing: 'cubic-bezier(.2,.7,.4,1)', delay: o.delai || 0, fill: 'both'});
  a.finished.then(function(){ g.remove(); }, function(){ g.remove(); });
  return a;
};
R._poussiere = function(p, n, sens){
  for(var i = 0; i < n; i++) this._bouffee([p[0] + hasard(-8, 8), p[1] - 4], {r: hasard(5, 9), coul: '#6a6078', op: .55, dx: (sens || 1) * hasard(10, 30), dy: hasard(-14, -4), duree: hasard(500, 800), delai: i * 40, s1: 2});
};
R._goutteTombe = function(p, o){
  o = o || {};
  var self = this, coul = o.coul || '#d8f0ff', g = this._fxEl('<path d="M0 -6 C 2 -2 4 1 4 3 C 4 6 2 7 0 7 C -2 7 -4 6 -4 3 C -4 1 -2 -2 0 -6 Z" fill="' + coul + '" stroke="' + O + '" stroke-width="1.2"/><circle cx="-1.5" cy="2" r="1.2" fill="#fff"/>');
  var sol = 392, dy = Math.max(10, sol - p[1]), d = o.duree || Math.sqrt(dy) * 45;
  var a = g.animate([{transform: 'translate(' + p[0] + 'px,' + p[1] + 'px) scale(.6,1.2)'}, {transform: 'translate(' + (p[0] + (o.dx || 0)) + 'px,' + sol + 'px) scale(.8,1.3)'}], {duration: d, easing: 'cubic-bezier(.5,0,1,1)', fill: 'forwards'});
  a.finished.then(function(){
    g.remove();
    var s = self._fxEl('<ellipse cx="0" cy="0" rx="7" ry="2" fill="' + coul + '" opacity=".8"/><circle cx="-7" cy="-4" r="1.6" fill="' + coul + '"/><circle cx="7" cy="-5" r="1.4" fill="' + coul + '"/>');
    var b = s.animate([{transform: 'translate(' + (p[0] + (o.dx || 0)) + 'px,' + sol + 'px) scale(.3,1)', opacity: 1}, {transform: 'translate(' + (p[0] + (o.dx || 0)) + 'px,' + sol + 'px) scale(1.3,.7)', opacity: 0}], {duration: 420, easing: 'ease-out', fill: 'forwards'});
    b.finished.then(function(){ s.remove(); }, function(){ s.remove(); });
  }, function(){ g.remove(); });
};
R._baveGoutte = function(){
  var self = this, V = this.vitesse;
  this._seq([{t: 0, p: {bave: {sy: 1}}}, {t: .75, p: {bave: {sy: 1.9, sx: .8}}, e: 'ease-in'}, {t: .82, p: {bave: {sy: .6, sx: 1}}, e: 'cubic-bezier(.2,1.6,.5,1)'}, {t: 1, p: {bave: {sy: 1, sx: 1}}}], 1500, {ajout: true, vitesse: V});
  this._minuteur(function(){ if(!self.mort) self._goutteTombe(self._ou('baveBout', 142.5, 372)); }, 1500 * .76 / V);
};
R._larme = function(){
  var self = this, p = this._ou('tete', 116, 270);
  this._goutteTombe(p, {coul: '#9ad8ff', dx: -6});
};
R._cri = function(force){
  /* le couinement : de petits traits blancs qui jaillissent devant la gueule */
  var p = this._ou('tete', 30, 300), traits = '';
  for(var i = 0; i < 6; i++){ var a = Math.PI * (.75 + i * .1), r0 = 14, r1 = 26 + (i % 2) * 8; traits += 'M' + f1(Math.cos(a) * r0) + ' ' + f1(Math.sin(a) * r0) + ' L ' + f1(Math.cos(a) * r1) + ' ' + f1(Math.sin(a) * r1) + ' '; }
  var g = this._fxEl(L(traits, '#24182e', 6) + L(traits, '#ffffff', 3));
  var a = g.animate([{transform: 'translate(' + p[0] + 'px,' + p[1] + 'px) scale(.4)', opacity: 0}, {offset: .2, opacity: 1, transform: 'translate(' + p[0] + 'px,' + p[1] + 'px) scale(' + (1 * (force || 1)) + ')'}, {transform: 'translate(' + (p[0] - 8) + 'px,' + p[1] + 'px) scale(' + (1.35 * (force || 1)) + ')', opacity: 0}], {duration: 420, easing: 'ease-out', fill: 'forwards'});
  a.finished.then(function(){ g.remove(); }, function(){ g.remove(); });
};
R._soufflePatte = function(){
  /* il souffle sur sa patte brûlée */
  var self = this, A = {ajout: true};
  this._seq([{t: 0, p: {bras: {a: 0}, avbras: {a: 0}, main: {a: 0}, tete: {a: 0}, machoire: {a: 0}}},
    {t: .3, p: {bras: {a: 50}, avbras: {a: 70}, main: {a: 40}, tete: {a: -10}, machoire: {a: -6}}, e: 'cubic-bezier(.3,.8,.4,1)'},
    {t: .5, p: {machoire: {a: -14}}}, {t: .6, p: {machoire: {a: -4}}}, {t: .7, p: {machoire: {a: -14}}},
    {t: .85, p: {bras: {a: 50}, avbras: {a: 70}, main: {a: 40}, tete: {a: -10}, machoire: {a: -6}}},
    {t: 1, p: {bras: {a: 0}, avbras: {a: 0}, main: {a: 0}, tete: {a: 0}, machoire: {a: 0}}, e: 'ease-in-out'}], 1500, A);
  [520, 760].forEach(function(t){ self._minuteur(function(){ var p = self._ou('tete', 34, 314); self._bouffee(p, {r: 4, coul: '#e8f0ff', dx: -18, dy: 8, duree: 500, s1: 2.4, op: .6}); }, t); });
};
R._tirerPatte = function(){
  /* collé : il tire sur une patte, les fils de colle s'étirent entre le sol et la patte, puis la ramènent d'un coup */
  var self = this, choix = choisir([
    {p: {bras: {a: -20}, avbras: {a: 40}, main: {a: 6}}, ref: 'main', pt: [192, 386], corps: {a: -2}, tete: {a: 6}},
    {p: {brasF: {a: -15}, avbrasF: {a: 30}, mainF: {a: 34}}, ref: 'mainF', pt: [132, 386], corps: {a: -2}, tete: {a: 4}},
    {p: {cuisse: {a: 2}, tibia: {a: -5}, pied: {a: 30}}, ref: 'pied', pt: [372, 388], corps: {a: 2}, tete: {a: -4}},
    {p: {cuisseF: {a: 5}, tibiaF: {a: -20}, piedF: {a: 30}}, ref: 'piedF', pt: [350, 388], corps: {a: 2}, tete: {a: -3}}]);
  var rep = {}, n, T = 1500;
  for(n in choix.p) rep[n] = {a: 0};
  function part(k){ var o = {}; for(var n in choix.p) o[n] = {a: choix.p[n].a * k}; return o; }
  this._seq([{t: 0, p: rep}, {t: .3, p: part(.75), e: 'cubic-bezier(.3,.6,.5,1)'}, {t: .4, p: part(.62)}, {t: .5, p: part(.85)}, {t: .58, p: part(.7)}, {t: .72, p: part(1), e: 'ease-in'},
    {t: .8, p: rep, e: 'cubic-bezier(.7,0,1,.6)'}, {t: .86, p: part(.08)}, {t: 1, p: rep}], T, {ajout: true});
  var cc = {corps: {a: 0}, tete: {a: 0}, machoire: {a: 0}}, cf = {corps: choix.corps, tete: choix.tete, machoire: {a: -14}};
  this._seq([{t: 0, p: cc}, {t: .3, p: cf}, {t: .45, p: {corps: {a: 0}, tete: {a: 0}, machoire: {a: -4}}}, {t: .72, p: cf}, {t: .8, p: {corps: {a: -choix.corps.a * .8}, tete: {a: -choix.tete.a}, machoire: {a: -18}}, e: 'cubic-bezier(.7,0,1,.6)'}, {t: 1, p: cc}], T, {ajout: true});
  /* les fils : trois bandes gluantes, plus fines au milieu, qui suivent la patte à chaque image */
  var sol = this._ou(this._contenu(choix.ref), choix.pt[0], choix.pt[1]); sol[1] = 391;
  var el = this._contenu(choix.ref), g0 = this._fxEl('<g></g>', this.S.monde), t0 = performance.now();
  var g = g0.namespaceURI === SVGNS ? g0 : g0.querySelector('svg');
  var fils = [-12, 1, 12].map(function(dx, i){ return {dx: dx, w: [6, 7, 5][i], c: [.45, -.4, .25][i]}; });
  g.innerHTML = fils.map(function(){ return '<path fill="#d8e870" fill-opacity=".85" stroke="#5a6420" stroke-width="1.2"/><path fill="none" stroke="#fbffd0" stroke-width="1.2" stroke-linecap="round" opacity=".8"/>'; }).join('') + '<ellipse rx="14" ry="5" fill="#c8d84a" stroke="#5a6420" stroke-width="1.4"/>';
  var chemins = g.querySelectorAll('path'), goutte = g.querySelector('ellipse');
  goutte.setAttribute('cx', f1(sol[0])); goutte.setAttribute('cy', f1(sol[1]));
  (function maj(){
    if(!g.isConnected) return;
    var p = self._ou(el, choix.pt[0] - (choix.ref === 'main' || choix.ref === 'mainF' ? 0 : 6), choix.pt[1] - 2), d = Math.hypot(p[0] - sol[0], p[1] - sol[1]);
    fils.forEach(function(f, i){
      var a = [sol[0] + f.dx, sol[1]], b = [p[0] + f.dx * .35, p[1] + 2], m = lerp(a, b, .5), k = Math.max(.08, 1 - d / 60), w = f.w * k + .9;
      m[0] += f.c * d * .3; m[1] += d * .08;
      var nx = 0, ny = 0, dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; nx = -dy / l; ny = dx / l;
      var dd = 'M' + pt([a[0] - f.w, a[1]]) + ' Q ' + pt([m[0] - nx * w, m[1] - ny * w]) + ' ' + pt([b[0] - 2.5, b[1]]) + ' L ' + pt([b[0] + 2.5, b[1]]) + ' Q ' + pt([m[0] + nx * w, m[1] + ny * w]) + ' ' + pt([a[0] + f.w, a[1]]) + ' Z';
      chemins[i * 2].setAttribute('d', dd);
      chemins[i * 2 + 1].setAttribute('d', 'M' + pt([a[0] - f.w * .3, a[1] - 1]) + ' Q ' + pt([m[0] - nx * w * .4, m[1] - ny * w * .4]) + ' ' + pt([b[0] - 1, b[1]]));
      chemins[i * 2].style.opacity = chemins[i * 2 + 1].style.opacity = d < 4 ? 0 : 1;
    });
    if(performance.now() - t0 > T + 60){ g0.remove(); return; }
    requestAnimationFrame(maj);
  })();
};
/* =====================================================================
   8. Les actions (Promise)
   ===================================================================== */
R._debutAction = function(){
  this.jeton++;
  this.enAction = true;
  this._bouge(4000);
  this._couperBoucles();
  return this.jeton;
};
R._finAction = function(j, duree){
  if(j !== this.jeton || this.mort) return Promise.resolve();
  this.enAction = false;
  return this._reprendre(duree);
};
/* la course : un galop (les deux paires de pattes, le corps qui ondule, la queue qui fouette) */
var COURSE = (function(){
  /* quatre temps : étiré en l'air, réception des pattes avant, regroupé, poussée des pattes arrière */
  var e = {saut: {y: -16}, corps: {a: -3, sx: 1.05}, crete: {sy: .9}, tete: {a: 9, y: -2},
    bras: {a: 40}, avbras: {a: 8}, main: {a: 10}, brasF: {a: 30}, avbrasF: {a: -6}, mainF: {a: 0},
    cuisse: {a: -42}, tibia: {a: -10}, pied: {a: -22}, cuisseF: {a: -30}, tibiaF: {a: -6}, piedF: {a: -16}, oreille: {a: 24}, oreilleF: {a: 20}};
  return [
    {t: 0, p: e},
    {t: .25, p: {saut: {y: -3}, corps: {a: 3, sx: 1}, crete: {sy: 1}, tete: {a: 5, y: 0},
      bras: {a: 14}, avbras: {a: -8}, main: {a: -4}, brasF: {a: 34}, avbrasF: {a: 6}, mainF: {a: 6},
      cuisse: {a: -14}, tibia: {a: -32}, pied: {a: -8}, cuisseF: {a: -30}, tibiaF: {a: -20}, piedF: {a: -12}}},
    {t: .5, p: {saut: {y: 0}, corps: {a: 5, sx: .94}, crete: {sy: 1.12}, tete: {a: 2, y: -2},
      bras: {a: -26}, avbras: {a: -18}, main: {a: -26}, brasF: {a: -4}, avbrasF: {a: -12}, mainF: {a: -16},
      cuisse: {a: 28}, tibia: {a: 22}, pied: {a: 12}, cuisseF: {a: 20}, tibiaF: {a: 18}, piedF: {a: 10}}},
    {t: .75, p: {saut: {y: -9}, corps: {a: -1, sx: 1}, crete: {sy: 1}, tete: {a: 6, y: 0},
      bras: {a: 6}, avbras: {a: -74}, main: {a: -34}, brasF: {a: -22}, avbrasF: {a: -40}, mainF: {a: -24},
      cuisse: {a: -2}, tibia: {a: -6}, pied: {a: -34}, cuisseF: {a: 12}, tibiaF: {a: 8}, piedF: {a: -10}}},
    {t: 1, p: e}
  ];
})();
R._courir = function(periode){
  var self = this, T = periode || 340;
  var depuis = {}, k;
  for(k in COURSE[0].p) depuis[k] = COURSE[0].p[k];
  /* d'abord se mettre en pose de départ */
  var debut = this._seq([{t: 1, p: COURSE[0].p, e: 'ease-out'}], 120);
  var anims = [];
  return debut.fini.then(function(){
    var s = self._seq(COURSE, T, {boucle: true, depuis: depuis, e: 'ease-in-out'});
    anims = s.anims;
    for(var i = 0; i < QC.length - 1; i++){
      var A = 6 + i * 2.5;
      var c = onde(-6 + i * 2, A, 8).map(function(q){ return {t: q.t, p: (function(){ var o = {}; o['q' + i] = {a: q.v.a}; return o; })()}; });
      anims = anims.concat(self._seq(c, T * 2, {boucle: true, depuis: {}, delai: -i * T * .18, e: 'linear'}).anims);
    }
    return anims;
  });
};
R.entrer = function(distance){
  var self = this, j = this._debutAction(), d = distance == null ? 500 : distance;
  this.el.getAnimations().forEach(function(a){ a.cancel(); });
  this.el.style.transform = 'translateX(' + d + 'px)';
  this.el.style.visibility = '';
  var duree = Math.max(900, Math.abs(d) / .55);
  return this._courir(320).then(function(){
    var poussieres = setInterval(function(){ self._poussiere([360, 390], 1, 1); }, 160);
    var a = self.el.animate([{transform: 'translateX(' + d + 'px)'}, {offset: .82, transform: 'translateX(' + (-6) + 'px)'}, {transform: 'translateX(0px)'}], {duration: duree, easing: 'cubic-bezier(.2,.4,.35,1)', fill: 'forwards'});
    var aFini = fini(a);
    a.finished.then(function(){ self.el.style.transform = ''; a.cancel(); }, function(){});
    return attendreMs(duree * .74).then(function(){
      clearInterval(poussieres);
      /* il freine : il se cabre en arrière, pattes avant tendues, il dérape */
      self._couperBoucles();
      self._poussiere([180, 390], 4, -1);
      self._poussiere([150, 390], 3, -1);
      return self._seq([
        {t: 0, p: {}},
        {t: .35, p: {saut: {y: 0, sy: .94}, posture: {a: -8, x: 8, y: -2}, corps: {a: -2, sx: .97}, tete: {a: 10, y: -4}, bras: {a: 38}, avbras: {a: 26}, main: {a: 18}, brasF: {a: 34}, avbrasF: {a: 22}, mainF: {a: 14}, cuisse: {a: 26}, tibia: {a: 18}, pied: {a: 6}, cuisseF: {a: 22}, tibiaF: {a: 16}, piedF: {a: 4}, oreille: {a: 28}, machoire: {a: -10}}, e: 'cubic-bezier(.2,.7,.3,1)'},
        {t: .7, p: {saut: {y: 0, sy: 1.03}, posture: {a: 2, x: -2, y: 0}, corps: {a: 1, sx: 1}, tete: {a: -4, y: 1}, bras: {a: -4}, avbras: {a: -6}, main: {a: -3}, brasF: {a: -3}, avbrasF: {a: -4}, mainF: {a: -2}, cuisse: {a: -3}, tibia: {a: -2}, pied: {a: 0}, cuisseF: {a: -2}, tibiaF: {a: -1}, piedF: {a: 0}, oreille: {a: -6}, machoire: {a: -4}}, e: 'cubic-bezier(.4,0,.3,1)'},
        {t: 1, p: {saut: {y: 0, sy: 1}, posture: {a: 0, x: 0, y: 0}, corps: {a: 0, sx: 1}, tete: {a: 0, y: 0}, bras: {a: 0}, avbras: {a: 0}, main: {a: 0}, brasF: {a: 0}, avbrasF: {a: 0}, mainF: {a: 0}, cuisse: {a: 0}, tibia: {a: 0}, pied: {a: 0}, cuisseF: {a: 0}, tibiaF: {a: 0}, piedF: {a: 0}, oreille: {a: 0}, machoire: {a: 0}}, e: 'ease-in-out'}
      ], 700).fini.then(function(){ return aFini; });
    });
  }).then(function(){ return self._finAction(j, 250); });
};
R.mordre = function(o){
  var self = this, j = this._debutAction(), impact;
  if(typeof o === 'function') o = {onImpact: o};
  o = o || {};
  var impactP = new Promise(function(r){ impact = r; });
  var T = 1000;
  var s = this._seq([
    {t: 0, p: {}},
    /* anticipation : il se ramasse en arrière, la tête basse */
    {t: .26, p: {pos: {x: 16}, saut: {y: 5, sy: .9, sx: 1.04}, posture: {a: 4}, corps: {a: 2, sx: .95}, tete: {a: -10, x: 2}, machoire: {a: 2}, sourcil: {y: 4, a: -6}, oreille: {a: 28}, crete: {sy: 1.3},
      bras: {a: -14}, avbras: {a: -10}, main: {a: -8}, brasF: {a: -12}, cuisse: {a: 22}, tibia: {a: 20}, pied: {a: 8}, cuisseF: {a: 18}, tibiaF: {a: 16}}, e: 'cubic-bezier(.4,0,.2,1)'},
    /* le bond : la gueule grande ouverte */
    {t: .44, p: {pos: {x: -112}, saut: {y: -42, sy: 1.08, sx: .97}, posture: {a: -6}, corps: {a: -3, sx: 1.08}, tete: {a: 12, x: -6}, machoire: {a: -34}, crete: {sy: 1.15},
      bras: {a: 52}, avbras: {a: 40}, main: {a: 26}, brasF: {a: 46}, avbrasF: {a: 30}, mainF: {a: 18}, cuisse: {a: -46}, tibia: {a: -24}, pied: {a: -36}, cuisseF: {a: -40}, tibiaF: {a: -20}, piedF: {a: -30}}, e: 'cubic-bezier(.15,.7,.35,1)'},
    /* clac ! */
    {t: .52, p: {pos: {x: -120}, saut: {y: -6, sy: .94}, tete: {a: -8, x: -10}, machoire: {a: 3}, posture: {a: 3}, bras: {a: 20}, avbras: {a: 6}, cuisse: {a: -14}, tibia: {a: -10}, pied: {a: -10}}, e: 'cubic-bezier(.7,0,1,.5)'},
    {t: .6, p: {tete: {a: 6, x: -6}, machoire: {a: 0}, saut: {y: 0, sy: 1}}, e: 'ease-out'},
    {t: .66, p: {tete: {a: -6}}, e: 'ease-in-out'}, {t: .72, p: {tete: {a: 3}}, e: 'ease-in-out'},
    /* retour, avec un petit rebond */
    {t: .9, p: {pos: {x: 6}, saut: {y: -10, sy: 1}, posture: {a: -2}, corps: {a: 0, sx: 1}, tete: {a: 0, x: 0}, machoire: {a: -6}, sourcil: {y: 0, a: 0}, oreille: {a: 0}, crete: {sy: 1},
      bras: {a: 10}, avbras: {a: 8}, main: {a: 4}, brasF: {a: 8}, avbrasF: {a: 4}, mainF: {a: 0}, cuisse: {a: -6}, tibia: {a: -4}, pied: {a: -6}, cuisseF: {a: -6}, tibiaF: {a: -4}, piedF: {a: -4}}, e: 'cubic-bezier(.3,.6,.4,1)'},
    {t: 1, p: {pos: {x: 0}, saut: {y: 0, sy: 1}, posture: {a: 0}, machoire: {a: 0}, bras: {a: 0}, avbras: {a: 0}, main: {a: 0}, brasF: {a: 0}, avbrasF: {a: 0}, mainF: {a: 0}, cuisse: {a: 0}, tibia: {a: 0}, pied: {a: 0}, cuisseF: {a: 0}, tibiaF: {a: 0}, piedF: {a: 0}}, e: 'cubic-bezier(.5,0,.4,1.4)'}
  ], T);
  /* la queue fouette pendant le bond */
  for(var i = 0; i < QC.length - 1; i++){ var c = {}; c['q' + i] = {a: 0}; var c2 = {}; c2['q' + i] = {a: -10 - i * 3}; var c3 = {}; c3['q' + i] = {a: 8 + i * 2};
    this._seq([{t: 0, p: c}, {t: .3, p: c3}, {t: .5, p: c2}, {t: .7, p: c3}, {t: 1, p: c}], T, {delai: i * 18}); }
  this._minuteur(function(){ self._poussiere([360, 390], 4, 1); }, T * .3);
  this._minuteur(function(){
    var p = self._ou('tete', 30, 318);
    self._bouffee(p, {r: 10, coul: '#ffffff', op: .9, dx: -10, dy: 0, duree: 260, s0: .2, s1: 2.2});
    if(o.onImpact) try{ o.onImpact(); }catch(e){}
    impact();
  }, T * .5);
  var p = s.fini.then(function(){ return self._finAction(j, 200); });
  p.impact = impactP;
  return p;
};
R.touche = function(){
  var self = this, j = this._debutAction(), mode = this._mode(), base = this._base();
  var T = 620;
  this.el.animate([{filter: 'brightness(1)'}, {offset: .08, filter: 'brightness(3.2) saturate(0)'}, {offset: .28, filter: 'brightness(2.2) saturate(.2)'}, {filter: 'brightness(1)'}], {duration: 360, easing: 'ease-out'});
  this._cri(1.1);
  var k = [
    {t: 0, p: {}},
    {t: .12, p: {secousse: {x: 26, y: -6, a: -9}, saut: {sx: .88, sy: 1.1}, tete: {a: 16}, machoire: {a: -26}, paupiere: {y: 17}, oreille: {a: 40}, oreilleF: {a: 30}, crete: {sy: 1.4}, sourcil: {y: -4, a: 8}}, e: 'cubic-bezier(.1,.9,.3,1)'},
    {t: .4, p: {secousse: {x: 14, y: 0, a: 4}, saut: {sx: 1.06, sy: .95}, tete: {a: -6}, machoire: {a: -10}}, e: 'ease-in-out'},
    {t: .62, p: {secousse: {x: 6, a: -2}, saut: {sx: .98, sy: 1.02}, tete: {a: 3}, paupiere: {y: 6}}, e: 'ease-in-out'},
    {t: 1, p: {secousse: {x: 0, y: 0, a: 0}, saut: {sx: 1, sy: 1}, tete: fusion(Z, base.tete), machoire: fusion(Z, base.machoire), paupiere: {y: 0}, oreille: fusion(Z, base.oreille), oreilleF: {a: 0}, crete: fusion(Z, base.crete), sourcil: fusion(Z, base.sourcil)}, e: 'cubic-bezier(.4,0,.3,1.3)'}
  ];
  if(mode === 'dos') k[1].p.secousse = {x: 20, y: 6, a: 10};
  return this._seq(k, T).fini.then(function(){ return self._finAction(j, 200); });
};
R.tousser = function(){
  var self = this, j = this._debutAction(), mode = this._mode(), base = this._base(), T = 2600;
  var bt = fusion(Z, base.tete), bm = fusion(Z, base.machoire);
  function tt(d){ return {a: bt.a + d}; }
  function mm(d){ return {a: bm.a + d}; }
  var k = [{t: 0, p: {}}], quintes = [[.04, 1], [.3, 1.1], [.52, .9], [.74, 1.25]];
  quintes.forEach(function(q){
    var t = q[0], f = q[1];
    k.push({t: t + .06, p: {tete: tt(8 * f), machoire: mm(-4), souffle: {sy: 1.06, sx: 1}, secousse: {x: 2, a: -1}, paupiere: {y: 6}, oreille: {a: 10}}, e: 'ease-out'});
    k.push({t: t + .1, p: {tete: tt(-16 * f), machoire: mm(-28 * f), souffle: {sy: .92, sx: 1.04}, secousse: {x: -12 * f, a: 4 * f, y: 4}, saut: {sy: .94, sx: 1.03}, crete: {sy: 1.3}, paupiere: {y: 16}, oreille: {a: 26}}, e: 'cubic-bezier(.1,.9,.3,1)'});
    k.push({t: t + .18, p: {tete: tt(-4), machoire: mm(-6), souffle: {sy: 1, sx: 1}, secousse: {x: 0, a: 0, y: 0}, saut: {sy: 1, sx: 1}, crete: {sy: 1}, paupiere: {y: 10}}, e: 'ease-in-out'});
  });
  k.push({t: 1, p: {tete: tt(0), machoire: mm(0), souffle: {sy: 1, sx: 1}, secousse: {x: 0, a: 0, y: 0}, saut: {sy: 1, sx: 1}, crete: fusion(Z, base.crete), paupiere: {y: 0}, oreille: fusion(Z, base.oreille)}, e: 'ease-in-out'});
  quintes.forEach(function(q, i){
    self._minuteur(function(){
      var p = self._ou('tete', 34, 318);
      for(var n = 0; n < 6; n++) self._bouffee([p[0] - 6, p[1] + hasard(-6, 6)], {r: hasard(8, 13) * q[1], coul: choisir(['#d8e0c4', '#c8d4b0', '#e8eedc', '#b8c8a0']), op: .85, dx: hasard(-80, -40), dy: hasard(-30, 10), duree: hasard(800, 1200), delai: n * 35, s0: .4, s1: 2.2, liser: true});
      if(i % 2 === 0) self._larme();
    }, T * (q[0] + .1));
  });
  return this._seq(k, T).fini.then(function(){ return self._finAction(j, 220); });
};
R.fuir = function(){
  var self = this, j = this._debutAction();
  this.etat.ebloui = false; this.etat.dos = false;
  this._eteindreEtoiles();
  this._enleverFlaque('huile');
  if(this.etat.colle) this.coller(false);
  if(this.etat.cible) this.cible(false);
  this._cri(1.3);
  return this._seq([
    {t: 0, p: {}},
    /* il sursaute, poils dressés, les yeux ronds */
    {t: .3, p: {saut: {y: -40, sy: 1.12, sx: .92}, posture: {a: 0, x: 0, y: 0}, crete: {sy: 1.6, sx: 1.06}, oeil: {s: 1.25}, paupiere: {y: 0}, sourcil: {y: -6, a: 10}, machoire: {a: -24}, oreille: {a: -16}, oreilleF: {a: -12},
      tete: {a: 10}, bras: {a: 20}, avbras: {a: 30}, brasF: {a: 30}, avbrasF: {a: 26}, cuisse: {a: -20}, tibia: {a: -10}, cuisseF: {a: -16}}, e: 'cubic-bezier(.15,.8,.3,1)'},
    {t: .6, p: {saut: {y: 0, sy: .9, sx: 1.05}, crete: {sy: 1.5}, bras: {a: -6}, avbras: {a: -6}, brasF: {a: -4}, avbrasF: {a: -4}, cuisse: {a: 10}, tibia: {a: 8}, cuisseF: {a: 8}, tete: {a: 2}}, e: 'cubic-bezier(.6,0,.9,.6)'},
    {t: 1, p: {saut: {y: 0, sy: 1, sx: 1}, machoire: {a: -14}}, e: 'ease-out'}
  ], 560).fini.then(function(){
    /* il se retourne d'un coup et détale vers la droite */
    var tourner = self.el.animate([{transform: 'translateX(0px) scaleX(1)'}, {offset: .5, transform: 'translateX(4px) scaleX(.15)'}, {transform: 'translateX(10px) scaleX(-1)'}], {duration: 170, easing: 'ease-in-out', fill: 'forwards'});
    return fini(tourner).then(function(){ return self._courir(260); });
  }).then(function(){
    var largeur = Math.max(window.innerWidth || 960, 960), d = largeur;
    var poussieres = setInterval(function(){ self._poussiere([360, 390], 1, 1); }, 120);
    var a = self.el.animate([{transform: 'translateX(10px) scaleX(-1)'}, {transform: 'translateX(' + d + 'px) scaleX(-1)'}], {duration: 1050, easing: 'cubic-bezier(.45,0,.9,.7)', fill: 'forwards'});
    return fini(a).then(function(){ clearInterval(poussieres); });
  }).then(function(){
    self._couperBoucles();
    self.el.style.visibility = 'hidden';
    self.enAction = false;
  });
};

/* =====================================================================
   9. Les états
   ===================================================================== */
R.attendre = function(){ this.attente = true; if(!this.enAction) return this._reprendre(300); return Promise.resolve(); };
R.arreter = function(){
  this.attente = false;
  this._couperBoucles();
  return this;
};
R.yeux = function(c){
  this.etat.yeux = c === 'rouge' ? 'rouge' : 'jaune';
  var on = this.etat.yeux === 'rouge' ? 1 : 0, svg = this.racine;
  function vers(e, v){ var de = parseFloat(getComputedStyle(e).opacity); e.getAnimations().forEach(function(a){ a.cancel(); }); opa(e, v); e.animate([{opacity: de}, {opacity: v}], {duration: 400}); }
  [].forEach.call(svg.querySelectorAll('[data-iris="r"],[data-halo="r"]'), function(e){ vers(e, on); });
  [].forEach.call(svg.querySelectorAll('[data-halo="j"]'), function(e){ vers(e, 1 - on); });
  return this;
};
R.enrager = function(){
  if(this.etat.enrage) return this;
  var self = this;
  this.etat.enrage = true;
  this.yeux('rouge');
  var h = this.racine.querySelector('[data-halo="r"] [data-hc]');
  h.classList.add('ra-halo');
  var rage = this.racine.querySelector('[data-rage]');
  rage.animate([{opacity: 0}, {opacity: 1}], {duration: 500, fill: 'forwards'}); opa(rage, 1);
  /* la vapeur qui sort des naseaux */
  (function vapeur(){
    if(self.mort) return;
    if(!self.etat.dos){
      var p = self._ou('narine', 18, 294);
      for(var i = 0; i < 2; i++) self._bouffee([p[0] - 2, p[1]], {r: 4, coul: '#f0eef8', op: .75, dx: hasard(-26, -14), dy: hasard(-14, -4), duree: 650, delai: i * 120, s1: 2.6});
    }
    self.fx.vapeur = setTimeout(vapeur, hasard(900, 1700));
  })();
  if(!this.enAction) this._reprendre(300);
  return this;
};
R._changerMode = function(){ if(!this.enAction) return this._reprendre(450); return Promise.resolve(); };
R.ebloui = function(on){
  on = on !== false;
  if(this.etat.ebloui === on) return Promise.resolve();
  this.etat.ebloui = on;
  if(on) this._allumerEtoiles(); else this._eteindreEtoiles();
  return this._changerMode();
};
R._allumerEtoiles = function(){
  var slot = this.S.teteFx, html = '', i;
  this._eteindreEtoiles();
  var lu = this.D.id();
  this.defs.insertAdjacentHTML('beforeend', '<radialGradient id="' + lu + '"><stop offset="0" stop-color="#fff6c0" stop-opacity=".55"/><stop offset="1" stop-color="#ffe066" stop-opacity="0"/></radialGradient>');
  if(this.cuit){
    /* cuit : chaque chose qui bouge est son propre <div> (le halo qui pulse, les étoiles qui tournent, les éclats) */
    var self = this, G = this._place(slot, 0, 0);
    G.setAttribute('data-etoiles', '1');
    this._el(this._place(G, 140, 250), '<ellipse rx="110" ry="80" fill="url(#' + lu + ')"/>', 'ra-pulse');
    for(i = 0; i < 6; i++){
      var e = this._place(G, 0, 0); e.setAttribute('data-etoile', i);
      this._el(e, '<circle r="20" fill="url(#' + lu + ')"/>');
      this._el(e, '<path d="' + etoileD(17 - (i % 2) * 4, 5, .45) + '" fill="#ffe466" stroke="' + O + '" stroke-width="2.6"/><path d="' + etoileD(7 - (i % 2) * 2, 5, .45) + '" fill="#fffbe0"/>', 'ra-tourne');
    }
    for(i = 0; i < 8; i++){ var a0 = i / 8 * Math.PI * 2, sc = this._el(this._place(G, 140 + Math.cos(a0) * 96, 232 + Math.sin(a0) * 56), '<path d="' + eclatD(13) + '" fill="#ffffff"/>', 'ra-scint'); sc.style.animationDelay = (i * .14) + 's'; }
    this.fx.etoiles = G;
    [].forEach.call(G.querySelectorAll('[data-etoile]'), function(e, k){ self._orbite(e, k); });
    return;
  }
  html += '<ellipse cx="140" cy="250" rx="110" ry="80" fill="url(#' + lu + ')" class="ra-pulse"/>';
  for(i = 0; i < 6; i++) html += '<g data-etoile="' + i + '"><circle r="20" fill="url(#' + lu + ')"/><path d="' + etoileD(17 - (i % 2) * 4, 5, .45) + '" fill="#ffe466" stroke="' + O + '" stroke-width="2.6" class="ra-tourne"/><path d="' + etoileD(7 - (i % 2) * 2, 5, .45) + '" fill="#fffbe0" class="ra-tourne"/></g>';
  for(i = 0; i < 8; i++){ var a = i / 8 * Math.PI * 2; html += '<g transform="translate(' + f1(140 + Math.cos(a) * 96) + ' ' + f1(232 + Math.sin(a) * 56) + ')"><path d="' + eclatD(13) + '" fill="#ffffff" class="ra-scint" style="animation-delay:' + (i * .14) + 's"/></g>'; }
  var g = this._el(slot, html);
  g.setAttribute('data-etoiles', '1');
  this.fx.etoiles = g;
  var self = this;
  [].forEach.call(g.querySelectorAll('[data-etoile]'), function(e, k){ self._orbite(e, k); });
};
/* une étoile qui tourne autour de la tête (en ellipse, plus grosse quand elle passe devant) */
R._orbite = function(e, k){
  var c = [140, 196], rx = 88, ry = 26, n = 24, frames = [];
  for(var s = 0; s <= n; s++){ var a = s / n * Math.PI * 2 + k * Math.PI * 2 / 6, x = c[0] + Math.cos(a) * rx, y = c[1] + Math.sin(a) * ry, devant = Math.sin(a); frames.push({transform: 'translate(' + f1(x) + 'px,' + f1(y) + 'px) scale(' + f1(.75 + devant * .3) + ')', opacity: f1(.55 + devant * .45)}); }
  e.animate(frames, {duration: 1500, iterations: Infinity});
};
R._eteindreEtoiles = function(){ if(this.fx.etoiles){ this.fx.etoiles.remove(); this.fx.etoiles = null; } };
R.retourner = function(on){
  on = on !== false;
  if(this.etat.dos === on) return Promise.resolve();
  var self = this, j = this._debutAction();
  this.etat.dos = on;
  this._contreFeu(on ? 820 : 760, on ? 1000 : 0);
  if(on){
    this._flaque('huile');
    /* il glisse : les pattes patinent… puis il bascule sur le dos */
    var pat = [{t: 0, p: {}}];
    for(var i = 1; i <= 8; i++) pat.push({t: i / 9, p: {bras: {a: i % 2 ? 50 : -30}, avbras: {a: i % 2 ? 36 : -20}, main: {a: i % 2 ? 20 : -20}, brasF: {a: i % 2 ? -30 : 46}, avbrasF: {a: i % 2 ? -16 : 34}, cuisse: {a: i % 2 ? -40 : 30}, cuisseF: {a: i % 2 ? 34 : -36}, tibia: {a: i % 2 ? -20 : 16}, pied: {a: i % 2 ? -20 : 20},
      posture: {a: i % 2 ? -8 : 8, x: i % 2 ? -14 : 12}, tete: {a: i % 2 ? 12 : -8}, machoire: {a: -20}, crete: {sy: 1.35}, oeil: {s: 1.22}, oreille: {a: i % 2 ? -10 : 20}}, e: 'ease-in-out'});
    var D2 = POSES.dos;
    var fin = {};
    for(var n in D2) fin[n] = D2[n];
    var kick = rotAutour(-10, [318, 282], [300, 300]), vol = rotAutour(140, [318, 282], [300, 300]);
    return this._seq(pat, 1000).fini.then(function(){
      if(j !== self.jeton) return;
      return self._seq([
        {t: 0, p: {}},
        {t: .18, p: {posture: {a: kick.a, x: kick.x, y: kick.y + 4}, bras: {a: 70}, avbras: {a: 40}, brasF: {a: 60}, cuisse: {a: 50}, cuisseF: {a: 46}, tibia: {a: 30}, tete: {a: 20}, machoire: {a: -30}, oeil: {s: 1.3}}, e: 'ease-out'},
        {t: .48, p: {posture: {a: vol.a, x: vol.x, y: vol.y - 36}, bras: {a: 40}, avbras: {a: 50}, brasF: {a: 30}, cuisse: {a: 40}, cuisseF: {a: 40}, tete: {a: 40}}, e: 'cubic-bezier(.5,0,.6,1)'},
        {t: .66, p: fin, e: 'cubic-bezier(.5,0,1,.8)'},
        {t: .78, p: {saut: {sy: .84, sx: 1.1}, oeil: {s: 1}}, e: 'ease-out'},
        {t: 1, p: {saut: {sy: 1, sx: 1}}, e: 'cubic-bezier(.3,.6,.4,1.4)'}
      ], 820).fini.then(function(){ self._poussiere([280, 390], 5, 1); self._poussiere([340, 390], 4, -1); });
    }).then(function(){ return self._finAction(j, 120); });
  }
  /* il se remet sur ses pattes */
  var r = rotAutour(250, [318, 282], [300, 300]);
  return this._seq([
    {t: 0, p: {}},
    {t: .3, p: {posture: {a: 120, x: 0, y: -44}, tete: {a: 10}, bras: {a: 20}, cuisse: {a: 10}}, e: 'cubic-bezier(.3,.6,.5,1)'},
    {t: .62, p: {posture: {a: 0, x: 0, y: 0}, saut: {y: 0, sy: .88, sx: 1.08}, tete: {a: -4}, bras: {a: 0}, avbras: {a: 0}, brasF: {a: 0}, avbrasF: {a: 0}, cuisse: {a: 0}, tibia: {a: 0}, cuisseF: {a: 0}, tibiaF: {a: 0}, pied: {a: 0}, main: {a: 0}}, e: 'cubic-bezier(.5,0,.9,.6)'},
    {t: 1, p: {saut: {y: 0, sy: 1, sx: 1}, tete: {a: 0}}, e: 'cubic-bezier(.3,.6,.4,1.4)'}
  ], 760).fini.then(function(){ self._enleverFlaque('huile'); self._seq([{t: 0, p: {secousse: {a: 0}}}, {t: .2, p: {secousse: {a: 6}}}, {t: .4, p: {secousse: {a: -6}}}, {t: .6, p: {secousse: {a: 4}}}, {t: 1, p: {secousse: {a: 0}}}], 400); return attendreMs(400); }).then(function(){ return self._finAction(j, 300); });
};
R._flaque = function(type){
  this._enleverFlaque(type);
  var html;
  if(type === 'huile'){
    var gid = this.D.id();
    this.defs.insertAdjacentHTML('beforeend', '<linearGradient id="' + gid + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1a1428"/><stop offset=".3" stop-color="#3a2a5a"/><stop offset=".45" stop-color="#2a5a6a"/><stop offset=".6" stop-color="#5a6a2a"/><stop offset=".75" stop-color="#6a3a5a"/><stop offset="1" stop-color="#1a1428"/></linearGradient>');
    html = '<ellipse cx="290" cy="392" rx="240" ry="16" fill="url(#' + gid + ')" stroke="#0a0812" stroke-width="2" opacity=".95"/>' + L('M90 388 C 160 382 260 380 360 384 M140 396 C 220 392 300 392 400 396', '#c8e0ff', 1.6, ' opacity=".45"') + L('M200 386 C 240 383 280 383 320 385', '#ffe0a0', 1.2, ' opacity=".4"');
  } else {
    html = '<ellipse cx="270" cy="391" rx="230" ry="15" fill="#c8d84a" fill-opacity=".55" stroke="#5a6420" stroke-width="2"/>' + '<ellipse cx="270" cy="389" rx="200" ry="9" fill="#e8f0a0" opacity=".35"/>' +
      L('M90 386 C 160 382 260 381 360 384', '#ffffd0', 1.8, ' opacity=".7"');
    var bulles = [[120, 392, 4], [220, 395, 3], [300, 390, 5], [420, 393, 3.5]];
    if(!this.cuit) html += bulles.map(function(b, i){ return '<g transform="translate(' + b[0] + ' ' + b[1] + ')"><circle r="' + b[2] + '" fill="#e8f0a0" stroke="#5a6420" stroke-width="1" class="ra-bulle" style="animation-delay:' + (i * .5) + 's"/></g>'; }).join('');
  }
  var g;
  if(this.cuit){
    /* cuit : la flaque dans un <div>, et chaque bulle de colle dans le sien (elles respirent sans rien repeindre) */
    g = this._place(this.S.sol, 0, 0);
    this._el(g, html);
    var self = this;
    if(bulles) bulles.forEach(function(b, i){ var u = self._el(self._place(g, b[0], b[1] + b[2]), '<circle cy="' + (-b[2]) + '" r="' + b[2] + '" fill="#e8f0a0" stroke="#5a6420" stroke-width="1"/>', 'ra-bulle'); u.style.animationDelay = (i * .5) + 's'; });
  } else g = this._el(this.S.sol, html);
  g.animate([{transform: 'translate(270px,391px) scale(.2,.4) translate(-270px,-391px)', opacity: 0}, {transform: 'translate(270px,391px) scale(1) translate(-270px,-391px)', opacity: 1}], {duration: 420, easing: 'cubic-bezier(.2,.8,.3,1.2)'});
  this.fx['flaque_' + type] = g;
};
R._enleverFlaque = function(type){
  var g = this.fx['flaque_' + type];
  if(!g) return;
  this.fx['flaque_' + type] = null;
  g.animate([{opacity: 1}, {opacity: 0}], {duration: 500, fill: 'forwards'}).finished.then(function(){ g.remove(); });
};
R.coller = function(on){
  on = on !== false;
  if(this.etat.colle === on) return this;
  this.etat.colle = on;
  if(on) this._flaque('colle'); else this._enleverFlaque('colle');
  if(this.fx.pates){ this.fx.pates.forEach(function(g){ g.remove(); }); this.fx.pates = null; }
  if(on){
    var self = this, pate = '<path d="M-16 3 C -16 -6 -8 -10 0 -9 C 8 -10 16 -6 16 3 Z" fill="#d0e05a" fill-opacity=".92" stroke="#5a6420" stroke-width="1.4"/><path d="M-10 -4 Q 0 -8 10 -4" fill="none" stroke="#fbffd0" stroke-width="1.4" opacity=".8"/>';
    this.fx.pates = [['main', 192, 389], ['mainF', 132, 389], ['pied', 368, 391], ['piedF', 340, 391]].map(function(q){ return self._el(self._contenu(q[0]), '<g transform="translate(' + q[1] + ' ' + q[2] + ')">' + pate + '</g>'); });
  }
  if(!this.enAction) this._reprendre(300);
  return this;
};
R.cible = function(on){
  on = on !== false;
  var slot = this.S.cible;
  if(this.fx.cible){ this.fx.cible.remove(); this.fx.cible = null; }
  this.etat.cible = on;
  if(!on) return this;
  if(this.cuit){
    var G = this._place(slot, 288, 300);
    this._el(G, '<circle r="34" fill="#ffe680" opacity=".35"/>', 'ra-pulse');
    this._el(G, '<circle r="24" fill="none" stroke="#24182e" stroke-width="7"/><circle r="24" fill="none" stroke="#ffe066" stroke-width="4"/><circle r="12" fill="none" stroke="#24182e" stroke-width="6"/><circle r="12" fill="none" stroke="#fff6c0" stroke-width="3"/><circle r="4" fill="#ffffff"/>', 'ra-pulse');
    this._el(G, L('M0 -38 L 0 -28 M0 28 L 0 38 M-38 0 L -28 0 M28 0 L 38 0', '#24182e', 6) + L('M0 -38 L 0 -28 M0 28 L 0 38 M-38 0 L -28 0 M28 0 L 38 0', '#ffe066', 3), 'ra-tourne');
    this.fx.cible = G;
    return this;
  }
  var html = '<g transform="translate(288 300)"><circle r="34" fill="#ffe680" opacity=".35" class="ra-pulse"/>' +
    '<g class="ra-pulse"><circle r="24" fill="none" stroke="#24182e" stroke-width="7"/><circle r="24" fill="none" stroke="#ffe066" stroke-width="4"/><circle r="12" fill="none" stroke="#24182e" stroke-width="6"/><circle r="12" fill="none" stroke="#fff6c0" stroke-width="3"/><circle r="4" fill="#ffffff"/></g>' +
    '<g class="ra-tourne">' + L('M0 -38 L 0 -28 M0 28 L 0 38 M-38 0 L -28 0 M28 0 L 38 0', '#24182e', 6) + L('M0 -38 L 0 -28 M0 28 L 0 38 M-38 0 L -28 0 M28 0 L 38 0', '#ffe066', 3) + '</g></g>';
  this.fx.cible = this._el(slot, html);
  return this;
};
/* cuit : la contre-rotation des flammes selon la pose de base (debout ébloui, sur le dos…), pour qu'elles restent droites ;
   et plus petites quand le dos est tourné vers le bas (comme le calcul image par image d'avant) */
R._contreFeu = function(duree, delai){
  var G = this.fx && this.fx.feuG;
  if(!G) return;
  var m = POSES[this._mode()];
  G.forEach(function(g){
    var A = 0;
    g.chaine.forEach(function(n){ if(m[n] && m[n].a) A += m[n].a; });
    var k = Math.max(.3, Math.min(1, .3 + Math.cos(A * Math.PI / 180) * .9)), t = 'rotate(' + f1(-A) + 'deg) scale(' + k.toFixed(2) + ')';
    if(g.t === t) return;
    var de = g.t || 'none';
    g.t = t;
    g.c.getAnimations().forEach(function(a){ a.cancel(); });
    g.c.style.transform = t;
    if(duree > 1) g.c.animate([{transform: de}, {transform: t}], {duration: duree, delay: delai || 0, easing: 'ease-in-out', fill: 'backwards'});
  });
};
R.bruler = function(on){
  on = on !== false;
  if(this.etat.feu === on) return this;
  var self = this;
  this.etat.feu = on;
  if(!on){
    if(this.fx.feu) this.fx.feu.forEach(function(g){ g.animate([{opacity: 1}, {opacity: 0}], {duration: 400, fill: 'forwards'}).finished.then(function(){ g.remove(); }); });
    this.fx.feu = null; this.fx.feuG = null;
    clearTimeout(this.fx.fumee);
    return this;
  }
  var gid = this.D.id(), gid2 = this.D.id(), lueur = this.D.id();
  this.defs.insertAdjacentHTML('beforeend', '<linearGradient id="' + gid + '" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff4a10"/><stop offset=".6" stop-color="#ff8a1a"/><stop offset="1" stop-color="#ffc040" stop-opacity=".8"/></linearGradient>' +
    '<linearGradient id="' + gid2 + '" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffd040"/><stop offset="1" stop-color="#fff8c0"/></linearGradient>' +
    '<radialGradient id="' + lueur + '"><stop offset="0" stop-color="#ffb040" stop-opacity=".55"/><stop offset="1" stop-color="#ff6a10" stop-opacity="0"/></radialGradient>');
  function flamme(h, w, r, k){
    var dl = (k * .13 % .4).toFixed(2), dur = (.3 + (k * .07 % .22)).toFixed(2);
    return '<g transform="rotate(' + r + ')">' +
      '<path d="' + flammeD(h, w) + '" fill="url(#' + gid + ')" stroke="#5a1a08" stroke-width="2" class="ra-fl" style="animation-delay:-' + dl + 's;animation-duration:' + dur + 's"/>' +
      '<path d="' + flammeD(h * .7, w * .62) + '" fill="#ffa21e" class="ra-fl2" style="animation-delay:-' + dl + 's;animation-duration:' + (dur * .8).toFixed(2) + 's"/>' +
      '<path d="' + flammeD(h * .42, w * .36) + '" fill="url(#' + gid2 + ')" class="ra-fl" style="animation-delay:-' + (dl * .5).toFixed(2) + 's;animation-duration:' + (dur * .7).toFixed(2) + 's"/></g>';
  }
  /* la suie sur le pelage (elle suit le corps) */
  var suie = this._el(this.S.feuDos, '<ellipse cx="350" cy="212" rx="106" ry="32" fill="#140c10" opacity=".4"/>' + L('M270 214 C 300 200 340 186 380 182 C 410 182 430 194 444 214', '#0a0608', 6, ' opacity=".35"'));
  /* les flammes : chacune suit un point du dos ou de la queue, mais reste droite */
  var D = this.A.dos, S = this.S, specs = [
    {ref: D, x: 350, y: 196, lueur: [150, 90]},
    {ref: D, x: 262, y: 214, h: 50, w: 26, r: -12}, {ref: D, x: 286, y: 208, h: 70, w: 32, r: -6}, {ref: D, x: 310, y: 200, h: 92, w: 38, r: -3}, {ref: D, x: 334, y: 190, h: 76, w: 32, r: 2},
    {ref: D, x: 358, y: 182, h: 104, w: 40, r: 0}, {ref: D, x: 384, y: 178, h: 84, w: 34, r: 5}, {ref: D, x: 408, y: 184, h: 96, w: 36, r: 8}, {ref: D, x: 430, y: 198, h: 64, w: 28, r: 14}, {ref: D, x: 446, y: 222, h: 44, w: 22, r: 22},
    {ref: D, x: 298, y: 204, h: 40, w: 18, r: -16}, {ref: D, x: 372, y: 182, h: 54, w: 20, r: -10}, {ref: D, x: 420, y: 190, h: 46, w: 18, r: 18}
  ];
  [[2, .5, 48, 24], [4, .45, 54, 24], [6, .5, 38, 18], [7, .7, 26, 14]].forEach(function(q){ var m = lerp(QC[q[0]], QC[q[0] + 1], q[1]); specs.push({ref: S['feuQ' + q[0]], x: m[0], y: m[1], h: q[2], w: q[3], r: 0, lueur: [40, 34], q: q[0]}); });
  if(this.cuit){
    /* cuit : chaque flamme est accrochée à la pièce qu'elle suit (le dos, un bout de queue) : la carte graphique la déplace
       avec elle, sans rien calculer à chaque image. Une contre-rotation (selon la pose : debout, sur le dos) la garde droite. */
    var flammeDivs = function(c, h, w, r, k){
      var dl = (k * .13 % .4).toFixed(2), dur = (.3 + (k * .07 % .22)), R = self._place(c, 0, 0);
      if(r) R.style.transform = 'rotate(' + r + 'deg)';
      [[flammeD(h, w), 'url(#' + gid + ')" stroke="#5a1a08" stroke-width="2', 'ra-fl', dl, dur], [flammeD(h * .7, w * .62), '#ffa21e', 'ra-fl2', dl, dur * .8],
        [flammeD(h * .42, w * .36), 'url(#' + gid2 + ')', 'ra-fl', (dl * .5).toFixed(2), dur * .7]].forEach(function(f){
        var e = self._el(R, '<path d="' + f[0] + '" fill="' + f[1] + '"/>', f[2]); e.style.animationDelay = '-' + f[3] + 's'; e.style.animationDuration = f[4].toFixed(2) + 's';
      });
    };
    var groupes = specs.map(function(s, k){
      var queue = s.q != null, p = self._place(queue ? s.ref : self.S.feuHaut, s.x, s.y), c = self._place(p, 0, 0);
      if(s.lueur) self._el(c, '<ellipse cx="0" cy="' + (-s.lueur[1] * .4) + '" rx="' + s.lueur[0] + '" ry="' + s.lueur[1] + '" fill="url(#' + lueur + ')"/>');
      if(s.h) flammeDivs(c, s.h, s.w, s.lueur ? 0 : s.r, k);
      var chaine = ['posture', 'corps'];
      if(queue) for(var i = 0; i <= s.q; i++) chaine.push('q' + i);
      p.animate([{opacity: 0}, {opacity: 1}], {duration: 300});
      return {p: p, c: c, chaine: chaine};
    });
    this.fx.feuG = groupes;
    this.fx.feu = [suie].concat(groupes.map(function(g){ return g.p; }));
    this._contreFeu(1);
  } else {
  var monde = this._el(this.S.monde, '');
  specs.forEach(function(s, k){ s.g = self._el(monde, s.lueur ? '<ellipse cx="0" cy="' + (-s.lueur[1] * .4) + '" rx="' + s.lueur[0] + '" ry="' + s.lueur[1] + '" fill="url(#' + lueur + ')"/>' + (s.h ? flamme(s.h, s.w, 0, k) : '') : flamme(s.h, s.w, s.r, k)); });
  monde.animate([{opacity: 0}, {opacity: 1}], {duration: 300});
  this.fx.feu = [suie, monde];
  (function suivre(){
    if(!monde.isConnected) return;
    specs.forEach(function(s){
      var p = self._ou(s.ref, s.x, s.y), h = self._ou(s.ref, s.x, s.y - 20), haut = (p[1] - h[1]) / 20, k = Math.max(.3, Math.min(1, .3 + haut * .9));
      s.g.setAttribute('transform', 'translate(' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ') scale(' + k.toFixed(2) + ')');
    });
    self.fx.raf = requestAnimationFrame(suivre);
  })();
  }
  /* fumée et braises */
  (function fumee(){
    if(!self.etat.feu || self.mort) return;
    var p = self._ou('dos', hasard(290, 420), hasard(150, 180));
    self._bouffee([p[0], p[1] - 30], {r: hasard(10, 16), coul: choisir(['#8a8098', '#6a6278', '#9a92a8']), op: .5, dx: hasard(10, 40), dy: hasard(-90, -60), duree: hasard(1400, 2000), s1: 2.8});
    if(Math.random() < .7){
      var b = self._fxEl('<circle r="2.4" fill="#ffd060"/>'), q = self._ou('dos', hasard(290, 420), 180);
      b.animate([{transform: 'translate(' + q[0] + 'px,' + (q[1] - 20) + 'px)', opacity: 1}, {transform: 'translate(' + (q[0] + hasard(-20, 30)) + 'px,' + (q[1] - hasard(60, 110)) + 'px)', opacity: 0}], {duration: 900, easing: 'ease-out', fill: 'forwards'}).finished.then(function(){ b.remove(); });
    }
    self.fx.fumee = setTimeout(fumee, hasard(140, 260));
  })();
  if(!this.enAction && this.attente){ this._couperMinuteurs(); this._planifier(200); }
  return this;
};

/* =====================================================================
   10. La mort par critique (Romain, 9 novembre, 16 h 37 : « il faut rester LOCALISÉ… de la FUMÉE NOIRE… les MEMBRES
       éclatent sur le côté, la fumée cache, ça passe pour des enfants ; pas tout l'écran ; ça prend son temps »).
       Tout se passe autour du rat :
         0 ms      la flèche frappe : le temps se suspend sur lui (il se fige, gonfle, tremble), une petite lueur ;
         o.impact  une bouffée de fumée noire dense l'enveloppe (il disparaît dedans) ;
         o.eclat   ses membres — des silhouettes sombres (tête, queue, pattes, touffes de poil ; rien de gore) —
                   jaillissent sur les côtés en tournoyant et retombent dans la fumée, qui les cache ;
         ensuite   la fumée se dissipe lentement et laisse le tas de cendres et les os (≈ 2,5 s en tout).
       Fluidité / mémoire (RAPIDITE.md) : tout est réglé d'avance en animations (transform / opacity), aucun filtre,
       une vingtaine de morceaux au plus, aucun calque plus grand que la scène.
   ===================================================================== */
/* (un contour clair, comme un reflet de lune : sombres, mais lisibles sur le mur sombre) */
function SIL(d, f){ return '<path d="' + d + '" fill="' + (f || '#2e2438') + '" stroke="#8a78a0" stroke-width="2" stroke-linejoin="round"/>'; }
var MEMBRES = {
  tete: SIL('M-22 2 C -24 -10 -12 -20 2 -19 C 14 -18 26 -10 32 0 C 34 4 30 7 26 7 C 12 9 -4 12 -14 10 C -20 9 -22 6 -22 2 Z') +
    SIL('M-10 -15 C -16 -30 0 -34 4 -19 Z') + '<path d="M-8 -18 C -11 -25 -3 -27 0 -20 Z" fill="#4a3c5a"/>' +
    '<path d="M3 -9 L 9 -3 M 9 -9 L 3 -3" stroke="#d8cce6" stroke-width="1.8" stroke-linecap="round"/><circle cx="31" cy="1" r="2.4" fill="#4a3c5a"/>' +
    '<path d="M24 3 L 40 -1 M 24 5 L 40 6" stroke="#4a3c5a" stroke-width="1"/>',
  queue: L('M-18 -4 C -6 -10 8 -8 16 0 C 22 6 22 14 16 20', '#8a78a0', 8.5) + L('M-18 -4 C -6 -10 8 -8 16 0 C 22 6 22 14 16 20', '#2e2438', 5) +
    L('M-16 -5 C -6 -9 6 -8 14 -1', '#4a3c5a', 1.4),
  patteAv: SIL('M-4 -18 C 4 -20 8 -12 6 -4 L 4 8 C 10 9 15 12 13 16 C 9 18 2 17 -2 14 L -6 -2 C -9 -10 -10 -16 -4 -18 Z') +
    L('M-3 -14 C 1 -15 4 -12 4 -6', '#4a3c5a', 1.4),
  patteAr: SIL('M-12 -16 C 0 -22 12 -12 10 0 C 9 6 6 9 4 11 L 14 16 C 18 18 17 22 12 22 L -2 21 C -6 20 -6 16 -3 14 L -6 4 C -14 -2 -16 -12 -12 -16 Z') +
    L('M-8 -12 C -2 -15 4 -12 6 -6', '#4a3c5a', 1.6),
  touffe: SIL('M-16 4 C -18 -6 -8 -14 2 -12 L 6 -18 L 9 -10 L 15 -14 L 14 -5 C 20 -1 18 8 10 11 C 0 14 -12 12 -16 4 Z'),
  touffe2: SIL('M-12 -6 L -16 -14 L -6 -10 C -2 -16 8 -16 12 -8 L 20 -10 L 15 -2 C 18 6 10 12 0 11 C -10 10 -16 4 -12 -6 Z', '#241a2e')
};
/* qui part de quel côté (le rat regarde à gauche : la tête part à gauche, la queue à droite) */
var ECLATS = [['tete', -1], ['queue', 1], ['patteAv', -1], ['patteAr', 1], ['patteAv', 1], ['patteAr', -1], ['touffe', -1], ['touffe2', 1]];
R.exploser = function(scene, o){
  o = o || {};
  var self = this, T1 = o.impact == null ? 420 : o.impact, T2 = o.eclat == null ? 1020 : o.eclat;
  this._debutAction();
  scene = scene || this.c.parentNode || this.c;
  this.etat.feu && this.bruler(false);
  this._eteindreEtoiles();
  clearTimeout(this.fx.vapeur);
  /* la géométrie, lue une seule fois, avant qu'il bouge */
  var cs = getComputedStyle(scene);
  if(cs.position === 'static') scene.style.position = 'relative';
  var sr = scene.getBoundingClientRect(), rr = (self.svg || self.el).getBoundingClientRect(), ech = (scene.offsetWidth || sr.width) / (sr.width || 1);
  var W = scene.offsetWidth || sr.width, H = scene.offsetHeight || sr.height;
  var cx = (rr.left + rr.width * .48 - sr.left) * ech, cy = (rr.top + rr.height * .58 - sr.top) * ech, taille = rr.width * ech;
  var sol = (rr.top + rr.height * .9 - sr.top) * ech, u = taille / 180;
  /* 1) le temps suspendu : il se fige (plus de boucles), gonfle un peu et tremble — un arrêt sur image, sur lui seul */
  var k = [{t: 0, p: {}}];
  for(var i = 1; i <= 8; i++) k.push({t: i / 9, p: {saut: {sx: 1 + i * .014, sy: 1 + i * .018, y: -i * .7}, secousse: {x: i % 2 ? 2.2 : -2.2, a: i % 2 ? 1.6 : -1.6}, crete: {sy: 1 + i * .07}, oeil: {s: 1 + i * .035}, machoire: {a: -i * 2.6}, paupiere: {y: 0}}, e: 'linear'});
  k.push({t: 1, p: {saut: {sx: 1.13, sy: 1.17, y: -7}}, e: 'ease-in'});
  this._seq(k, T1);
  var NSs = SVGNS, ov, el, fl = 'raBoom' + (++NUM), degrade = '<radialGradient id="' + fl + 'g"><stop offset="0" stop-color="#fff8d0"/><stop offset=".4" stop-color="#ffd060" stop-opacity=".8"/><stop offset="1" stop-color="#ff8020" stop-opacity="0"/></radialGradient>';
  if(self.cuit){
    /* cuit : un calque HTML ; chaque morceau est un <div> que la carte graphique déplace (aucun flou calculé en direct) */
    self.defs.insertAdjacentHTML('beforeend', degrade);
    ov = document.createElement('div'); ov.className = 'ra-scene-fx';
    scene.appendChild(ov);
    el = function(html){ return global.Cuire.ilot(ov, html); };
  } else {
    ov = document.createElementNS(NSs, 'svg');
    ov.setAttribute('class', 'ra-scene-fx'); ov.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    ov.innerHTML = '<defs><filter id="' + fl + 'p" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="' + f1(taille * .012) + '"/></filter>' + degrade + '</defs>';
    scene.appendChild(ov);
    el = function(html){ var g = document.createElementNS(NSs, 'g'); g.innerHTML = html; ov.appendChild(g); return g; };
  }
  function tf(x, y, s, a){ return 'translate(' + f1(x) + 'px,' + f1(y) + 'px)' + (a ? ' rotate(' + f1(a) + 'deg)' : '') + ' scale(' + (+s).toFixed(3) + ')'; }
  /* la flèche frappe : une petite lueur et un petit cercle, sur lui seulement */
  el('<circle cx="0" cy="0" r="' + f1(34 * u) + '" fill="url(#' + fl + 'g)"/>').animate([{transform: tf(cx, cy, .3), opacity: 1}, {transform: tf(cx, cy, 1.25), opacity: 0}], {duration: 340, easing: 'ease-out', fill: 'forwards'});
  el('<circle cx="0" cy="0" r="' + f1(26 * u) + '" fill="none" stroke="#fff4c0" stroke-width="' + f1(3 * u) + '"/>').animate([{transform: tf(cx, cy, .3), opacity: .9}, {transform: tf(cx, cy, 1.5), opacity: 0}], {duration: 380, easing: 'cubic-bezier(.1,.8,.3,1)', fill: 'forwards'});
  /* 2) à l'impact, la fumée noire l'enveloppe : des volutes denses qui gonflent sur lui, restent, puis se dissipent lentement */
  /* (elle reste dense jusqu'à ce que les membres y soient retombés, puis se dissipe lentement) */
  var brumes = [], NB = 14;
  for(var n = 0; n < NB; n++){
    var a = (n / NB) * Math.PI * 2 + hasard(-.3, .3), d = Math.sqrt(hasard(.1, 1)), px = cx + Math.cos(a) * d * 80 * u, py = cy - 4 * u + Math.sin(a) * d * 30 * u;
    var tt = hasard(92, 124) * u, g;
    if(self.cuit && BRUME.length){
      /* une volute déjà cuite (son flou est dans l'image) */
      g = document.createElement('div'); g.className = 'cu-ilot';
      var im = document.createElement('img');
      im.src = BRUME[n % BRUME.length]; im.alt = '';
      im.style.cssText = 'position:absolute;display:block;max-width:none;left:' + f1(-tt / 2) + 'px;top:' + f1(-tt / 2) + 'px;width:' + f1(tt) + 'px;height:' + f1(tt) + 'px';
      g.appendChild(im); ov.appendChild(g);
    } else {
      var r = tt * .38, c = choisir(['#120c18', '#1a1222', '#22182c', '#0c0812']), cl = choisir(['#5a4c6c', '#6a5a80', '#4a3e5a', '#7a6a8e']);
      g = el('<g filter="url(#' + fl + 'p)"><circle cx="0" cy="0" r="' + f1(r) + '" fill="' + c + '"/><circle cx="' + f1(-r * .28) + '" cy="' + f1(-r * .32) + '" r="' + f1(r * .62) + '" fill="' + cl + '" opacity=".55"/><circle cx="' + f1(r * .12) + '" cy="' + f1(r * .2) + '" r="' + f1(r * .7) + '" fill="' + c + '" opacity=".8"/></g>');
    }
    var dx = hasard(-14, 14) * u, mt = hasard(6, 16) * u;
    brumes.push(g.animate([{transform: tf(cx, cy - 4 * u, .15), opacity: 0, easing: 'cubic-bezier(.2,.8,.3,1)'}, {offset: .08, transform: tf(px, py, 1), opacity: .97, easing: 'ease-in-out'},
      {offset: .62, transform: tf(px + dx, py - mt, 1.2), opacity: .95, easing: 'ease-in-out'}, {transform: tf(px + dx * 1.6, py - mt - hasard(30, 50) * u, 1.7), opacity: 0}],
      {duration: hasard(2200, 2400), delay: T1 + n * 8, easing: 'linear', fill: 'both'}));
  }
  /* il disparaît dans la fumée */
  setTimeout(function(){
    self._couperBoucles();
    self.mort = true;
    self.J.saut.style.visibility = 'hidden';
    self.el.getAnimations().forEach(function(x){ x.cancel(); });
  }, T1 + 170);
  /* 3) l'explosion : les membres jaillissent sur les côtés en tournoyant (une parabole, échantillonnée une fois)
        et retombent dans la fumée, qui les cache */
  ECLATS.forEach(function(e, i){
    var cote = e[1], m = el('<g transform="scale(' + f1(u * 1.3) + ')">' + MEMBRES[e[0]] + '</g>');
    var x0 = cx + cote * hasard(4, 18) * u, y0 = cy - hasard(0, 14) * u, x1 = cx + cote * hasard(50, 92) * u, y1 = sol - hasard(4, 14) * u;
    var h = hasard(80, 125) * u, rot = cote * hasard(320, 720), N = 12, kf = [];
    for(var q = 0; q <= N; q++){
      var t = q / N, s = t < .15 ? .6 + .4 * t / .15 : 1;
      kf.push({offset: t, transform: tf(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t - h * 4 * t * (1 - t), s, rot * t), opacity: t < .06 ? t / .06 : t > .72 ? Math.max(0, 1 - (t - .72) / .28) : 1});
    }
    m.animate(kf, {duration: hasard(760, 900), delay: T2 + i * 25, easing: 'linear', fill: 'both'});
  });
  /* 4) sous la fumée qui se dissipe : le petit tas de cendre et les os, à sa place */
  var tas = self._el(self.S.sol, '<ellipse cx="240" cy="392" rx="70" ry="10" fill="#000" opacity=".35"/>' +
      P('M160 393 C 170 368 208 346 244 346 C 280 346 312 368 322 393 Z', self._def(function(D){ return D.g('#8a8290'); })) +
      P('M188 393 C 196 378 222 366 246 368 C 268 370 288 380 294 393 Z', self._def(function(D){ return D.g('#a8a0ae'); }), ' stroke-width="1.6"') +
      [[196, 380], [222, 362], [256, 360], [284, 378], [238, 384], [210, 388], [300, 386], [176, 388]].map(function(q){ return C(q[0], q[1], 2.6, '#3a3440', ' opacity=".7"'); }).join('') +
      [[230, 356], [262, 364], [204, 372]].map(function(q){ return C(q[0], q[1], 1.6, '#ff9a40', ' opacity=".9"'); }).join('') +
      L('M184 368 C 206 352 236 346 262 350', '#e0dae8', 2.2, ' opacity=".7"') +
      '<g transform="translate(262 372) rotate(-24)">' + P('M-26 -3 L 24 -3 C 30 -10 38 -6 34 0 C 38 6 30 10 24 3 L -26 3 C -32 10 -40 6 -36 0 C -40 -6 -32 -10 -26 -3 Z', '#efe6d0', ' stroke-width="2.4"') + L('M-22 -1 L 22 -1', '#ffffff', 1.4, ' opacity=".7"') + '</g>' +
      '<g transform="translate(216 380) rotate(18)">' + P('M-16 -2.5 L 14 -2.5 C 19 -8 26 -5 23 0 C 26 5 19 8 14 2.5 L -16 2.5 C -21 8 -28 5 -25 0 C -28 -5 -21 -8 -16 -2.5 Z', '#e6dcc4', ' stroke-width="2.2"') + '</g>' +
      '<g transform="translate(286 386) rotate(70)">' + P('M-9 -2 L 8 -2 C 12 -6 17 -4 15 0 C 17 4 12 6 8 2 L -9 2 C -13 6 -18 4 -16 0 C -18 -4 -13 -6 -9 -2 Z', '#efe6d0', ' stroke-width="2"') + '</g>');
  tas.animate([{opacity: 0, transform: 'translate(240px,392px) scale(.3) translate(-240px,-392px)'}, {opacity: 1, transform: 'translate(240px,392px) scale(1) translate(-240px,-392px)'}],
    {duration: 900, delay: T2 + 250, easing: 'ease-out', fill: 'both'});
  /* quelques filets de fumée montent encore du tas */
  setTimeout(function fumet(){ var n = 5; (function un(){ if(n-- <= 0) return; self._bouffee([240 + hasard(-20, 20), 360], {r: 6, coul: '#5a5260', op: .5, dx: hasard(-6, 14), dy: -50, duree: 1600, s1: 2.4}); setTimeout(un, 420); })(); }, T2 + 900);
  return Promise.all(brumes.map(fini)).then(function(){ ov.remove(); });
};

/* =====================================================================
   11. L'interface publique
   ===================================================================== */
global.RatAnime = {
  creer: function(conteneur){
    var r = new Rat(conteneur);
    return {
      entrer: function(d){ return r.entrer(d); },
      attendre: function(){ return r.attendre(); },
      mordre: function(o){ return r.mordre(o); },
      touche: function(){ return r.touche(); },
      yeux: function(c){ r.yeux(c); return this; },
      enrager: function(){ r.enrager(); return this; },
      ebloui: function(on){ return r.ebloui(on); },
      retourner: function(on){ return r.retourner(on); },
      bruler: function(on){ r.bruler(on); return this; },
      tousser: function(){ return r.tousser(); },
      coller: function(on){ r.coller(on); return this; },
      cible: function(on){ r.cible(on); return this; },
      fuir: function(){ return r.fuir(); },
      exploser: function(scene, o){ return r.exploser(scene, o); },
      arreter: function(){ r.arreter(); return this; },
      etat: function(){ var e = {}; for(var k in r.etat) e[k] = r.etat[k]; return e; },
      point: function(nom, x, y){ return r.point(nom, x, y); },
      cuit: !!r.cuit,
      _rat: r
    };
  },
  /* cuire le dessin une fois (Promise) : ensuite, chaque rat créé est une copie cuite, fluide sur une vieille tablette */
  preparer: preparer,
  pret: function(){ return !!MODELE; },
  _interne: {POSES: POSES, COURSE: COURSE}
};
})(typeof window !== 'undefined' ? window : this);
