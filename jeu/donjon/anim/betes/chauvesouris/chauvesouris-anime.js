/* chauvesouris-anime.js — la chauve-souris de la brume, animée (Les Enquêteurs de Brumeval, donjon du puits)
   Module autonome, sans dépendance ; il injecte son propre CSS (préfixe .bt-chauvesouris-…). Il ne joue aucun son.
   Contrat commun : jeu/donjon/anim/betes/CONTRAT.md. Dessin validé : bestiaire/betes/03-chauvesouris.js
   (aveugle, les yeux laiteux ; ailes déployées ; immenses oreilles ; la brume qui traîne derrière elle). 25 PV, piqué 10.

     var c = BETES.chauvesouris.creer(conteneur);   // le SVG remplit le conteneur (240 × 338), elle regarde à gauche

   Elle VOLE (info.vole = true). Le cadre va du haut de la zone des monstres jusqu'au sol : on le place comme celui des
   autres bêtes (info.sol = la ligne du sol dans le cadre, posée sur le sol de la scène) ; info.vol = la hauteur de son
   corps en vol (0 = haut du cadre, 1 = bas). Quand elle tombe, elle tombe sur ce sol, un peu en avant (vers les héros).

   Actions (Promise, résolue quand elle est revenue à son attente) :
     entrer()                  elle arrive en volant d'en haut à droite, plonge, freine ailes grandes ouvertes, se met en vol sur place
     attaquer('pique', o)      elle se replie, pique en diagonale sur o.vers ({x,y} écran), o.onImpact(0) au contact (griffes,
                               morsure), puis remonte à sa place. Si l'état « folle » est actif : DEUX piqués désordonnés
                               (o.vers peut alors être un tableau de deux points) ; o.onImpact(0) puis o.onImpact(1).
                               La Promise a .impact (le premier contact).
     touche(type)              bruit  : BONG ! les ondes la frappent, ses oreilles vibrent, les yeux en spirale, elle tombe
                                        DEVANT, au sol, ailes en vrac, sonnée → état « au-sol » (= point faible ouvert)
                               colle  : ses ailes se collent, elle tombe en se débattant → états « colle » + « au-sol »
                               lumiere: elle hurle, les yeux fous → état « folle » (piège : elle frappe 2 fois)
                               fleche-argent : elle la SENT : traînée argentée qui la traverse, elle se cabre, ailes dressées
                               nuage  : tousser() ; fleche, fleche-lourde, dague, feu, louche, huile, givre, acide,
                               bouclier (elle se cogne à un bouclier de runes), rebond (elle esquive en vrille et nargue)
     special(nom)              'cri' (grand cri d'écholocation), 'ecoute' (les oreilles pivotent), 'tomber' (= etat('au-sol', true)),
                               'envol' (= etat('au-sol', false)), 'folle' (= etat('folle', true))
     tousser()                 trois quintes, lentes ; elle perd un peu d'altitude à chaque fois
     fuir() / mourir()         elle fait demi-tour et s'envole en zigzag hors de l'écran (en haut à droite)
     exploser(scene)           brume noire, lambeaux d'ailes et touffes de poils qui tombent en voletant ; il reste au sol
                               un petit crâne, des os de doigts et un tas de cendre. La Promise a .boom.
   États (se cumulent ; etat(nom, on) renvoie une Promise) : enrage, brule, colle, ebloui, gele, ouvert, dos, cible
     + les siens : « au-sol » (tombée, sonnée, le point faible ouvert brille) et « folle » (vol erratique, cris).
   attendre(), arreter(), etatCourant(), ancre(nom) : tete, pointfaible, centre, bouche, pieds, haut (coordonnées écran).

   Pour la fluidité (CONTRAT §4 bis) : aucun filtre ni mélange ; les flous du dessin sont devenus des dégradés radiaux
   et des couches de brume superposées ; les pièces <g data-j> ont un contenu fixe et ne sont animées qu'en transform ;
   les états sont des variantes dessinées d'avance (data-j="v-…") qu'on montre ou cache par l'opacité ; les boucles
   autonomes (cris, étoiles, flammes, point faible) animent des pièces data-j="x-…" ; les petits poils et mèches sont
   regroupés en quelques chemins ; au plus 24 particules à la fois. Mesure : perf.py (processeur ralenti ×6). */
(function(global){
'use strict';
var ID = 'chauvesouris', PX = 'bt-chauvesouris';
var O = '#24182e', LUNE = '#bfe8ff', NUM = 0, NS = 'http://www.w3.org/2000/svg';

/* =====================================================================
   1. Petits outils de dessin
   ===================================================================== */
function f1(v){ return (+v).toFixed(1); }
function fo(v){ return (+v).toFixed(3); }
function pt(p){ return f1(p[0]) + ' ' + f1(p[1]); }
function lerp(a, b, t){ return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
function quad(a, c, b, u){ return lerp(lerp(a, c, u), lerp(c, b, u), u); }
function hx(c){ c = c.replace('#', ''); return [0, 2, 4].map(function(i){ return parseInt(c.substr(i, 2), 16); }); }
function mix(a, b, t){ var A = hx(a), B = hx(b); return '#' + A.map(function(v, i){ var r = Math.round(v + (B[i] - v) * t); return (r < 16 ? '0' : '') + r.toString(16); }).join(''); }
function clair(c, t){ return mix(c, '#fff6e6', t); }
function sombre(c, t){ return mix(c, '#120a1e', t); }
function rng(s){ return function(){ s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
function P(d, f, x){ return '<path d="' + d + '" fill="' + f + '" stroke="' + O + '" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"' + (x || '') + '/>'; }
function L(d, c, w, x){ return d ? '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + w + '" stroke-linejoin="round" stroke-linecap="round"' + (x || '') + '/>' : ''; }
function F(d, f, x){ return d ? '<path d="' + d + '" fill="' + f + '"' + (x || '') + '/>' : ''; }
function C(x, y, r, f, x2){ return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + f + '"' + (x2 || '') + '/>'; }
function Gt(t, c){ return '<g transform="' + t + '">' + c + '</g>'; }
function op(v){ return ' opacity="' + fo(v) + '"'; }
function lisse(pts, ferme){
  var n = pts.length, s = 'M' + pt(pts[0]), m = ferme ? n : n - 1;
  function q(i){ return ferme ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]; }
  for(var i = 0; i < m; i++){ var a = q(i - 1), b = q(i), c = q(i + 1), e = q(i + 2); s += ' C ' + pt([b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6]) + ' ' + pt([c[0] - (e[0] - b[0]) / 6, c[1] - (e[1] - b[1]) / 6]) + ' ' + pt(c); }
  return s + (ferme ? ' Z' : '');
}
function tube(pts, ws){
  var n = pts.length, G = [], D = [];
  for(var i = 0; i < n; i++){ var a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, w = ws[i] / 2; G.push([pts[i][0] - dy / l * w, pts[i][1] + dx / l * w]); D.push([pts[i][0] + dy / l * w, pts[i][1] - dx / l * w]); }
  function bout(i, j, w){ var dx = pts[i][0] - pts[j][0], dy = pts[i][1] - pts[j][1], l = Math.hypot(dx, dy) || 1; return [pts[i][0] + dx / l * w * .5, pts[i][1] + dy / l * w * .5]; }
  return {d: lisse(G.concat([bout(n - 1, n - 2, ws[n - 1])], D.slice().reverse(), [bout(0, 1, ws[0])]), true), g: G, dr: D};
}
function etoileD(r, n, k){ var s = ''; for(var i = 0; i < n * 2; i++){ var a = -Math.PI / 2 + i * Math.PI / n, rr = i % 2 ? r * (k || .45) : r; s += (i ? ' L ' : 'M') + f1(Math.cos(a) * rr) + ' ' + f1(Math.sin(a) * rr); } return s + ' Z'; }
function eclatD(r){ return 'M0 ' + f1(-r) + ' Q ' + f1(r * .14) + ' ' + f1(-r * .14) + ' ' + f1(r) + ' 0 Q ' + f1(r * .14) + ' ' + f1(r * .14) + ' 0 ' + f1(r) + ' Q ' + f1(-r * .14) + ' ' + f1(r * .14) + ' ' + f1(-r) + ' 0 Q ' + f1(-r * .14) + ' ' + f1(-r * .14) + ' 0 ' + f1(-r) + ' Z'; }
function flammeD(h, w){ return 'M' + f1(-w / 2) + ' 0 C ' + f1(-w * .62) + ' ' + f1(-h * .38) + ' ' + f1(-w * .1) + ' ' + f1(-h * .5) + ' ' + f1(-w * .12) + ' ' + f1(-h) + ' C ' + f1(w * .3) + ' ' + f1(-h * .62) + ' ' + f1(w * .7) + ' ' + f1(-h * .42) + ' ' + f1(w / 2) + ' 0 Z'; }
function arcD(c, r, a0, a1){ var p0 = [c[0] + Math.cos(a0) * r, c[1] + Math.sin(a0) * r], p1 = [c[0] + Math.cos(a1) * r, c[1] + Math.sin(a1) * r]; return 'M' + pt(p0) + ' A ' + f1(r) + ' ' + f1(r) + ' 0 0 1 ' + pt(p1); }
function Defs(u){ this.u = u; this.n = 0; this.l = []; this.cache = {}; }
Defs.prototype.id = function(){ return this.u + (++this.n); };
Defs.prototype.stops = function(st){ return st.map(function(t){ return '<stop offset="' + t[0] + '" stop-color="' + t[1] + '" stop-opacity="' + (t[2] == null ? 1 : t[2]) + '"/>'; }).join(''); };
/* la lumière vient d'en haut à droite */
Defs.prototype.g = function(c, fort){ fort = fort || 1; var k = 'g' + c + fort; if(this.cache[k]) return this.cache[k]; var id = this.id(); this.l.push('<linearGradient id="' + id + '" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + clair(c, .26 * fort) + '"/><stop offset=".45" stop-color="' + c + '"/><stop offset="1" stop-color="' + sombre(c, .42 * fort) + '"/></linearGradient>'); return (this.cache[k] = 'url(#' + id + ')'); };
Defs.prototype.rad = function(st, cx, cy, r){ var id = this.id(); this.l.push('<radialGradient id="' + id + '" cx="' + cx + '" cy="' + cy + '" r="' + r + '">' + this.stops(st) + '</radialGradient>'); return 'url(#' + id + ')'; };
Defs.prototype.lin = function(st, x1, y1, x2, y2){ var id = this.id(); this.l.push('<linearGradient id="' + id + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '">' + this.stops(st) + '</linearGradient>'); return 'url(#' + id + ')'; };
/* un dégradé dans le repère du dessin (pour qu'il continue d'une pièce à l'autre) */
Defs.prototype.linU = function(st, x1, y1, x2, y2){ var id = this.id(); this.l.push('<linearGradient id="' + id + '" gradientUnits="userSpaceOnUse" x1="' + f1(x1) + '" y1="' + f1(y1) + '" x2="' + f1(x2) + '" y2="' + f1(y2) + '">' + this.stops(st) + '</linearGradient>'); return 'url(#' + id + ')'; };
Defs.prototype.halo = function(c0, c1){ var k = 'h' + c0 + c1; if(this.cache[k]) return this.cache[k]; var id = this.id(); this.l.push('<radialGradient id="' + id + '"><stop offset="0" stop-color="' + c0 + '"/><stop offset=".45" stop-color="' + c1 + '" stop-opacity=".6"/><stop offset="1" stop-color="' + c1 + '" stop-opacity="0"/></radialGradient>'); return (this.cache[k] = 'url(#' + id + ')'); };
Defs.prototype.clip = function(d){ var id = this.id(); this.l.push('<clipPath id="' + id + '"><path d="' + d + '"/></clipPath>'); return ' clip-path="url(#' + id + ')"'; };
/* une tache douce : un « flou » fait d'un dégradé radial, sans filtre */
Defs.prototype.doux = function(c, o){
  o = o == null ? 1 : o;
  var k = 'd' + c + '|' + o;
  if(!this.cache[k]){ var id = this.id(), h = '<radialGradient id="' + id + '"><stop offset="0" stop-color="' + c + '" stop-opacity="' + o + '"/><stop offset=".5" stop-color="' + c + '" stop-opacity="' + fo(o * .55) + '"/><stop offset="1" stop-color="' + c + '" stop-opacity="0"/></radialGradient>'; this.l.push(h); if(this.vivant) this.vivant.insertAdjacentHTML('beforeend', h); this.cache[k] = 'url(#' + id + ')'; }
  return this.cache[k];
};
function douce(D, cx, cy, rx, ry, c, o){ return '<ellipse cx="' + f1(cx) + '" cy="' + f1(cy) + '" rx="' + f1(rx) + '" ry="' + f1(ry) + '" fill="' + D.doux(c) + '"' + (o == null ? '' : ' fill-opacity="' + fo(o) + '"') + '/>'; }
function piv(nom, x, y, c){ return '<g data-j="' + nom + '" style="transform-origin:' + x + 'px ' + y + 'px">' + c + '</g>'; }
function vari(nom, c, o){ return '<g data-j="v-' + nom + '" opacity="' + (o || 0) + '"' + (o ? '' : ' visibility="hidden"') + '>' + c + '</g>'; }
function ancre(nom, x, y){ return '<circle data-a="' + nom + '" cx="' + x + '" cy="' + y + '" r=".6" fill="none"/>'; }
/* les opacités des petites formes deviennent fill-opacity / stroke-opacity (pas de calque d'effet par forme) */
function sansOpacite(h){
  return h.replace(/<(path|circle|ellipse|rect)\b([^>]*?)(\/?)>/g, function(m, tag, at, fin){
    var mm = at.match(/(^|\s)opacity="([^"]+)"/);
    if(!mm) return m;
    var v = parseFloat(mm[2]);
    at = at.replace(/(^|\s)opacity="[^"]+"/, '');
    if(/fill-opacity="/.test(at)) at = at.replace(/fill-opacity="([^"]+)"/, function(x, f){ return 'fill-opacity="' + (parseFloat(f) * v).toFixed(3) + '"'; }); else at += ' fill-opacity="' + v + '"';
    if(/stroke-opacity="/.test(at)) at = at.replace(/stroke-opacity="([^"]+)"/, function(x, f){ return 'stroke-opacity="' + (parseFloat(f) * v).toFixed(3) + '"'; }); else at += ' stroke-opacity="' + v + '"';
    return '<' + tag + at + fin + '>';
  });
}

/* ---- la fourrure (reprise de la fiche), regroupée : quelques chemins au lieu de centaines ---- */
function poils(cx, cy, rx, ry, n, seed, cH, cB, o0, ang){
  var R = rng(seed), ca = Math.cos(ang || 0), sa = Math.sin(ang || 0), b = {h1: '', h2: '', b1: '', b2: ''};
  o0 = o0 || .4;
  for(var k = 0; k < n; k++){
    var a = R() * Math.PI * 2, r = Math.sqrt(R()), x = cx + Math.cos(a) * rx * r, y = cy + Math.sin(a) * ry * r;
    var l = 6 + R() * 7, haut = y < cy - ry * .1, dx = l * .3, dy = l, o = o0 + R() * .2;
    b[(haut ? 'h' : 'b') + (o < o0 + .1 ? '1' : '2')] += 'M' + f1(x) + ' ' + f1(y) + ' q ' + f1((dx * ca - dy * sa) * .5 + 2) + ' ' + f1((dx * sa + dy * ca) * .5) + ' ' + f1(dx * ca - dy * sa) + ' ' + f1(dx * sa + dy * ca) + ' ';
  }
  return L(b.h1, cH, 1.4, op(o0 + .05)) + L(b.h2, cH, 1.4, op(o0 + .15)) + L(b.b1, cB, 1.4, op(o0 + .05)) + L(b.b2, cB, 1.4, op(o0 + .15));
}
function meches(cx, cy, rx, ry, n, seed, cs, ang, lg){
  var R = rng(seed), b = {h1: '', h2: '', b1: '', b2: '', lis: ''};
  for(var k = 0; k < n; k++){
    var a = R() * Math.PI * 2, r = Math.sqrt(R()), x = cx + Math.cos(a) * rx * r, y = cy + Math.sin(a) * ry * r, haut = y < cy;
    var an = ang + (R() - .5) * .5, lgk = (lg || 14) * (.7 + R() * .6), lar = 5 + R() * 4, k2 = (R() - .5) * 6, o = .55 + R() * .3;
    var ca = Math.cos(an), sa = Math.sin(an), nx = -sa, ny = ca;
    var tip = [x + ca * lgk + nx * k2, y + sa * lgk + ny * k2], m = [x + ca * lgk * .5 + nx * k2 * .6, y + sa * lgk * .5 + ny * k2 * .6];
    b[(haut ? 'h' : 'b') + (o < .7 ? '1' : '2')] += 'M' + pt([x + nx * lar / 2, y + ny * lar / 2]) + ' Q ' + pt([m[0] + nx * lar * .45, m[1] + ny * lar * .45]) + ' ' + pt(tip) + ' Q ' + pt([m[0] - nx * lar * .3, m[1] - ny * lar * .3]) + ' ' + pt([x - nx * lar / 2, y - ny * lar / 2]) + ' Z ';
    if(haut) b.lis += 'M' + pt([x + nx * lar * .15, y + ny * lar * .15]) + ' Q ' + pt([m[0] + nx * lar * .2, m[1] + ny * lar * .2]) + ' ' + pt([tip[0] - ca * lgk * .15, tip[1] - sa * lgk * .15]) + ' ';
  }
  return F(b.h1, cs[0], op(.62)) + F(b.h2, cs[0], op(.8)) + F(b.b1, cs[1], op(.62)) + F(b.b2, cs[1], op(.8)) + L(b.lis, cs[2], 1, op(.5));
}
function frange(pts, haut, couleur, seed, recul, trait){
  var R = rng(seed), s = 'M' + pt(pts[0]), n = pts.length, nr = [];
  recul = recul == null ? .5 : recul;
  for(var k = 0; k < n - 1; k++){ var a = pts[k], b = pts[k + 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, h = haut * (.6 + R() * .7); nr.push([dy / l, -dx / l]); s += ' Q ' + pt([a[0] + dx * .7 + dy / l * h * .4, a[1] + dy * .7 - dx / l * h * .4]) + ' ' + pt([b[0] + dx * recul + dy / l * h, b[1] + dy * recul - dx / l * h]) + ' L ' + pt(b); }
  nr.push(nr[n - 2]);
  for(var k2 = n - 1; k2 >= 0; k2--){ var q = pts[k2]; s += ' L ' + pt([q[0] - nr[k2][0] * 16, q[1] - nr[k2][1] * 16]); }
  return P(s + ' Z', couleur, ' stroke-width="' + (trait || 2.4) + '"');
}
function frange2(pts, haut, couleur, seed, v, trait){
  var R = rng(seed), n = pts.length, s = 'M' + pt(pts[0]), nr = [];
  for(var k = 0; k < n - 1; k++){ var a = pts[k], b = pts[k + 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = dy / l, ny = -dx / l, h = haut * (.45 + R() * .9), w = .6 + R() * .8;
    var tip = [(a[0] + b[0]) / 2 + nx * h + v[0] * w, (a[1] + b[1]) / 2 + ny * h + v[1] * w];
    s += ' Q ' + pt([a[0] + nx * h * .55 + v[0] * .2, a[1] + ny * h * .55 + v[1] * .2]) + ' ' + pt(tip) + ' Q ' + pt([b[0] + nx * h * .25 + v[0] * .3, b[1] + ny * h * .25 + v[1] * .3]) + ' ' + pt(b); nr.push([nx, ny]); }
  nr.push(nr[n - 2]);
  for(var k2 = n - 1; k2 >= 0; k2--){ var q = pts[k2]; s += ' L ' + pt([q[0] - nr[k2][0] * 16, q[1] - nr[k2][1] * 16]); }
  return P(s + ' Z', couleur, ' stroke-width="' + (trait || 2.2) + '"');
}
function lelong(pts, n){ var out = [], m = pts.length - 1; for(var k = 0; k <= n; k++){ var t = k / n * m, i = Math.min(m - 1, Math.floor(t)), f = t - i; out.push(lerp(pts[i], pts[i + 1], f)); } return out; }
/* un filet de brume : sans flou, trois couches superposées, effilées et fondues le long du filet */
function brume(D, pts, ws, c, o){
  var p0 = pts[0], p1 = pts[pts.length - 1], g = D.linU([[0, c, 0], [.2, c, 1], [.65, c, .75], [1, c, 0]], p0[0], p0[1], p1[0], p1[1]);
  function w(k){ return ws.map(function(v){ return Math.max(1, v * k); }); }
  return F(tube(pts, w(1.9)).d, g, op(o * .35)) + F(tube(pts, w(1.15)).d, g, op(o * .55)) + F(tube(pts, w(.5)).d, g, op(o * .6));
}

/* =====================================================================
   2. Le dessin : les coordonnées de la fiche (540 × 430), découpées en pièces articulées
   ===================================================================== */
var FOUR = '#6c5a7c', VENTRE = '#9a88a8', OS = '#a493b0', BR = '#9c94c8', SOL = 680;
var CENTRE = [276, 210];
var AILE_D = {nom: 'D', S: [244, 182], E: [184, 152], W: [118, 82], pouce: [114, 62], tips: [[62, 32], [22, 102], [44, 198], [128, 240]], pli: [3, 7, -6, -8], pied: [248, 262], flanc: [244, 222], sens: 1, seed: 9,
  trou: [94, 170, 7], mb: '#3d2a50', chair: FOUR, os: OS, lueur: '#b8a8e8', clarte: .6, fibre: '#9a8abc', veine: '#20122c', bord: '#c0b0f0'};
var AILE_F = {nom: 'F', S: [302, 186], E: [354, 150], W: [404, 92], pouce: [410, 74], tips: [[456, 48], [516, 96], [498, 180], [424, 228]], pli: [-3, -6, 5, 8], pied: [306, 262], flanc: [300, 222], sens: -1, seed: 5,
  trou: [470, 140, 4], mb: '#30213f', chair: sombre(FOUR, .35), os: sombre(OS, .25), lueur: '#8a7ab8', clarte: .5, fibre: '#7a6a9a', veine: '#1a0f24', bord: '#a89ad0'};
var CORPS_D = 'M238 166 C 234 196 238 232 256 250 C 270 262 290 260 300 246 C 314 226 316 190 308 166 C 296 146 250 146 238 166 Z';
var TETE_D = 'M272 124 C 272 100 252 86 230 88 C 206 90 190 102 184 118 C 176 124 170 136 172 148 C 174 158 182 164 192 166 L 244 170 C 262 164 272 146 272 124 Z';
var OREILLE_F = 'M252 106 C 262 72 284 40 316 10 C 322 32 324 54 320 74 L 312 78 L 319 86 C 314 102 304 114 290 126 C 276 132 260 124 252 106 Z';
var OREILLE_D = 'M252 104 C 246 74 232 38 206 2 C 196 20 190 38 188 54 L 196 60 L 187 66 C 186 82 190 98 198 110 C 210 124 240 124 252 104 Z';
var CRIN_PTS = [[222, 150], [238, 134], [266, 126], [296, 130], [316, 140], [324, 162], [316, 184], [300, 196], [280, 202], [258, 200], [240, 194], [226, 182], [220, 168]];
var PATE = '<path d="M-20 4 C -20 -8 -10 -12 0 -11 C 10 -12 20 -8 20 4 C 12 10 -12 10 -20 4 Z" fill="#d0e05a" fill-opacity=".94" stroke="#5a6420" stroke-width="1.8"/><path d="M-12 -4 Q 0 -9 12 -4" fill="none" stroke="#fbffd0" stroke-width="1.8" opacity=".85"/><circle cx="8" cy="7" r="2.4" fill="#d0e05a" stroke="#5a6420" stroke-width="1"/>';
function flammes(D, l){
  var gF1 = D.lin([[0, '#ff4a10'], [.6, '#ff8a1a'], [1, '#ffc040', .8]], 0, 1, 0, 0), gF2 = D.lin([[0, '#ffd040'], [1, '#fff8c0']], 0, 1, 0, 0);
  return l.map(function(f){ return Gt('translate(' + f[0] + ' ' + f[1] + ') rotate(' + (f[4] || 0) + ')', piv('x-fl' + f[5], 0, 0, '<path d="' + flammeD(f[2], f[3]) + '" fill="' + gF1 + '" stroke="#5a1a08" stroke-width="2"/><path d="' + flammeD(f[2] * .7, f[3] * .62) + '" fill="#ffa21e"/><path d="' + flammeD(f[2] * .42, f[3] * .36) + '" fill="' + gF2 + '"/>')); }).join('');
}

/* ---- une aile : le bras (membrane intérieure, os du bras) et la main (membrane des doigts, doigts, pouce) ---- */
function aile(D, o, numFeu){
  var S = o.S, E = o.E, W = o.W, t = o.tips, pi = o.pied, fl = o.flanc, R = rng(o.seed), sens = o.sens;
  function va(a, b, k){ return lerp(lerp(a, b, .5), W, k); }
  var jt = t.map(function(p, i){ var m = lerp(W, p, .48), dx = p[0] - W[0], dy = p[1] - W[1], l = Math.hypot(dx, dy); return [m[0] - dy / l * o.pli[i], m[1] + dx / l * o.pli[i]]; });
  var c01 = va(t[0], t[1], .12), c12 = va(t[1], t[2], .3), c23 = va(t[2], t[3], .3), c3p = va(t[3], pi, .28);
  var a1 = lerp(S, E, .4), a2 = lerp(E, W, .5);
  var bordAttaque = 'M' + pt(S) + ' C ' + pt([a1[0], a1[1] - 16]) + ' ' + pt([E[0] - 4, E[1] - 20]) + ' ' + pt([a2[0], a2[1] - 12]) + ' S ' + pt([W[0] + 2, W[1] - 10]) + ' ' + pt(W);
  /* la membrane du bras déborde sous celle des doigts (un coin entre le 3e et le 4e doigt) : pas de fente quand la main plie */
  var X = quad(t[2], c23, t[3], .45);
  var mBras = bordAttaque + ' L ' + pt(X) + ' Q ' + pt(lerp(c23, t[3], .45)) + ' ' + pt(t[3]) + ' Q ' + pt(c3p) + ' ' + pt(pi) + ' L ' + pt(fl) + ' Z';
  var mMain = 'M' + pt(W) + ' L ' + pt(t[0]) + ' Q ' + pt(c01) + ' ' + pt(t[1]) + ' Q ' + pt(c12) + ' ' + pt(t[2]) + ' Q ' + pt(c23) + ' ' + pt(t[3]) + ' L ' + pt(jt[3]) + ' Z';
  var tr = o.trou, trou = '';
  if(tr){ for(var k = 0; k < 9; k++){ var a = k / 9 * Math.PI * 2, r = tr[2] * (.6 + R() * .6); trou += (k ? ' L ' : ' M') + f1(tr[0] + Math.cos(a) * r * 1.5) + ' ' + f1(tr[1] + Math.sin(a) * r); } trou += ' Z'; }
  /* le même dégradé pour les deux morceaux de membrane (dans le repère du dessin) */
  var xs = t.map(function(p){ return p[0]; }).concat([S[0], W[0]]), ys = t.map(function(p){ return p[1]; }).concat([S[1], W[1], pi[1]]);
  var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
  var gM = D.linU([[0, clair(o.mb, .12)], [.5, o.mb], [1, sombre(o.mb, .35)]], sens > 0 ? x1 : x0, y0, sens > 0 ? x0 : x1, y1);
  var osC = D.g(o.os), osJ = D.g(clair(o.os, .1));
  /* --- la main --- */
  var main = P(mMain + trou, gM, ' fill-rule="evenodd"');
  var dm = '';
  [[W, t[1], t[2]], [W, t[2], t[3]]].forEach(function(p, i){ var c = [(p[0][0] + p[1][0] + p[2][0]) / 3, (p[0][1] + p[1][1] + p[2][1]) / 3]; dm += douce(D, c[0], c[1], 44 - i * 4, 32 - i * 3, o.lueur, o.clarte * (1 - i * .15) * .9); });
  var fib = '';
  [[0, 1], [1, 2], [2, 3]].forEach(function(pr){ var a = t[pr[0]], b = t[pr[1]]; for(var k = 1; k <= 5; k++){ var q = k / 6, p1 = lerp(W, a, q * .95), p2 = lerp(W, b, q * .95), m = lerp(lerp(p1, p2, .5), W, .1 + q * .05); fib += 'M' + pt(p1) + ' Q ' + pt(m) + ' ' + pt(p2) + ' '; } });
  dm += L(fib, o.fibre, .9, op(.45));
  main += '<g' + D.clip(mMain + trou) + ' style="clip-rule:evenodd">' + dm + '</g>';
  main += L('M' + pt(t[1]) + ' Q ' + pt(c12) + ' ' + pt(t[2]) + ' Q ' + pt(c23) + ' ' + pt(t[3]), o.bord, 1.6, op(.6) + ' transform="translate(' + (sens > 0 ? 1 : -1) + ' -2)"');
  if(tr) main += L(trou, o.bord, 1.2, op(.7));
  var refl = '';
  t.forEach(function(p, i){
    var j = jt[i], w0 = [7, 6.5, 6, 5.5][i];
    main += P(tube([W, lerp(W, j, .5), j], [w0, w0 - 1.6, w0 - .8]).d, osC, ' stroke-width="2.4"') + P(tube([j, lerp(j, p, .5), p], [w0 - 1.4, w0 - 2.6, 2]).d, osC, ' stroke-width="2.4"');
    main += '<ellipse cx="' + f1(j[0]) + '" cy="' + f1(j[1]) + '" rx="' + f1(w0 * .62) + '" ry="' + f1(w0 * .55) + '" fill="' + osJ + '" stroke="' + O + '" stroke-width="2"/>';
    var dd = [sens > 0 ? 1.4 : -1, -1.6];
    refl += 'M' + pt(lerp(W, j, .15).map(function(v, q){ return v + dd[q]; })) + ' L ' + pt(lerp(W, j, .85).map(function(v, q){ return v + dd[q]; })) + ' M' + pt(lerp(j, p, .1).map(function(v, q){ return v + dd[q]; })) + ' L ' + pt(lerp(j, p, .7).map(function(v, q){ return v + dd[q]; })) + ' ';
  });
  main += L(refl, LUNE, 1.2, op(.7));
  var po = o.pouce, pc = [po[0] - 8 * sens, po[1] - 4];
  main += P(tube([W, lerp(W, po, .55), po], [9, 7, 6]).d, osC);
  main += P('M' + pt([po[0] - 3, po[1] + 1]) + ' C ' + pt([po[0] - 4 * sens, po[1] - 10]) + ' ' + pt([pc[0] - 4 * sens, pc[1] - 6]) + ' ' + pt([pc[0] - 6 * sens, pc[1] + 4]) + ' C ' + pt([pc[0], pc[1] - 1]) + ' ' + pt([po[0], po[1] - 2]) + ' ' + pt([po[0] + 3, po[1] + 2]) + ' Z', '#231a29', ' stroke-width="2"');
  main += '<ellipse cx="' + W[0] + '" cy="' + W[1] + '" rx="8" ry="7" fill="' + osJ + '" stroke="' + O + '" stroke-width="2.4"/>';
  /* les variantes de la main : éclair blanc, givre, colle */
  main += vari('flash', F(mMain, '#ffffff')) + vari('flashG', F(mMain, '#d8f0ff'));
  var glacons = '';
  [t[1], t[2], t[3]].forEach(function(p, i){ glacons += 'M' + pt([p[0] - 4, p[1]]) + ' L ' + pt([p[0], p[1] + 12 + i * 3]) + ' L ' + pt([p[0] + 4, p[1]]) + ' Z '; });
  main += vari('gel', F(mMain, '#e2f6ff', op(.55)) + L('M' + pt(lerp(W, t[1], .3)) + ' L ' + pt(lerp(W, t[1], .6)) + ' L ' + pt(lerp(W, t[2], .55)) + ' M' + pt(lerp(W, t[2], .4)) + ' L ' + pt(lerp(W, t[3], .7)), '#ffffff', 1.6, op(.85)) + P(glacons, '#eef9ff', ' stroke-width="1.4"'));
  var pm = lerp(W, lerp(t[1], t[2], .5), .55);
  main += vari('colle', Gt('translate(' + pt(pm) + ') rotate(' + (20 * sens) + ') scale(1.3)', PATE) + Gt('translate(' + pt(lerp(W, t[0], .6)) + ') scale(.9)', PATE));
  if(numFeu != null) main += vari('feu', flammes(D, [[pm[0], pm[1] + 16, 84, 40, -10 * sens, numFeu]]));
  /* --- le bras --- */
  var bras = P(mBras, gM);
  var db = '';
  [[W, t[3], pi], [S, W, pi]].forEach(function(p, i){ var c = [(p[0][0] + p[1][0] + p[2][0]) / 3, (p[0][1] + p[1][1] + p[2][1]) / 3]; db += douce(D, c[0], c[1], 38 - i * 4, 28 - i * 3, o.lueur, o.clarte * (1 - (i + 2) * .15) * .9); });
  var fb = '';
  for(var k3 = 1; k3 <= 6; k3++){ var q3 = k3 / 7, p1 = lerp(W, t[3], q3), p2 = lerp(lerp(S, W, .1), pi, q3); fb += 'M' + pt(p1) + ' Q ' + pt(lerp(lerp(p1, p2, .5), S, .12)) + ' ' + pt(p2) + ' '; }
  db += L(fb, o.fibre, .9, op(.4));
  var vn = '';
  for(var v = 0; v < 6; v++){ var b0 = lerp(S, W, .2 + v * .13), dir = [pi[0] - b0[0], pi[1] - b0[1]], l = Math.hypot(dir[0], dir[1]), lg = 30 + R() * 30;
    var q1 = [b0[0] + dir[0] / l * lg * .5 + (R() - .5) * 14, b0[1] + dir[1] / l * lg * .5], q2 = [b0[0] + dir[0] / l * lg + (R() - .5) * 20, b0[1] + dir[1] / l * lg];
    vn += 'M' + pt(b0) + ' Q ' + pt(q1) + ' ' + pt(q2) + ' M' + pt(q1) + ' l ' + f1((R() - .5) * 24) + ' ' + f1(10 + R() * 10) + ' '; }
  db += L(vn, o.veine, 1.2, op(.55));
  db += L('M' + pt([S[0], S[1] + 8]) + ' L ' + pt([E[0], E[1] + 8]) + ' L ' + pt([W[0], W[1] + 8]), '#0a0612', 12, op(.18)) + L('M' + pt([S[0], S[1] + 7]) + ' L ' + pt([E[0], E[1] + 7]) + ' L ' + pt([W[0], W[1] + 7]), '#0a0612', 6, op(.18));
  bras += '<g' + D.clip(mBras) + '>' + db + '</g>';
  bras += L('M' + pt(t[3]) + ' Q ' + pt(c3p) + ' ' + pt(pi), o.bord, 1.6, op(.6) + ' transform="translate(' + (sens > 0 ? 1 : -1) + ' -2)"');
  bras += P(tube([S, lerp(S, E, .5), E], [20, 14, 13]).d, D.g(o.chair)) + poils((S[0] + E[0]) / 2, (S[1] + E[1]) / 2, 12, 8, 10, o.seed + 1, '#d8c8e0', '#2a1e30', .35, -.8 * sens);
  bras += P(tube([E, lerp(E, W, .5).map(function(v, i){ return v + (i ? -4 : 0); }), W], [12, 9, 10]).d, osC);
  bras += L('M' + pt(lerp(E, W, .1)) + ' Q ' + pt(lerp(E, W, .5).map(function(v, i){ return v + (i ? -8 : 2); })) + ' ' + pt(lerp(E, W, .9)), LUNE, 1.6, op(.75));
  bras += vari('flash', F(mBras, '#ffffff')) + vari('flashG', F(mBras, '#d8f0ff'));
  bras += vari('gel', F(mBras, '#e2f6ff', op(.5)) + L('M' + pt(lerp(S, pi, .4)) + ' L ' + pt(lerp(W, pi, .5)) + ' L ' + pt(lerp(W, t[3], .6)), '#ffffff', 1.6, op(.8)) + P('M' + pt([pi[0] - 4 * sens, pi[1] - 2]) + ' L ' + pt([pi[0] - 6 * sens, pi[1] + 14]) + ' L ' + pt([pi[0] + 2 * sens, pi[1]]) + ' Z', '#eef9ff', ' stroke-width="1.4"'));
  bras += vari('colle', Gt('translate(' + pt(lerp(S, E, .6)) + ') scale(1.1)', PATE) + Gt('translate(' + pt(lerp(lerp(S, W, .5), pi, .45)) + ') rotate(-15) scale(1.4)', PATE));
  return piv('aile' + o.nom, S[0], S[1], bras + piv('main' + o.nom, W[0], W[1], main));
}

function dessiner(D){
  var s = {};
  var BR2 = '#c8c0ea';
  /* ---- l'ombre au sol : petite et pâle (elle vole) ---- */
  s.ombre = piv('ombre', 272, SOL, douce(D, 272, SOL, 100, 11, '#000', .42) + douce(D, 272, SOL, 52, 5, '#000', .35));
  /* ---- l'aura de la folle : une lueur rouge qui palpite derrière elle ---- */
  s.aura = vari('aura', piv('x-aura', 262, 170, douce(D, 262, 170, 210, 150, '#ff2a4a', .5) + douce(D, 230, 140, 90, 70, '#ff7060', .55)));
  /* ---- la brume qui traîne derrière elle ---- */
  s.brumeA = piv('brumeA', 300, 252, brume(D, [[300, 250], [360, 280], [440, 290], [528, 276]], [26, 22, 14, 3], BR, .22) +
    brume(D, [[150, 236], [230, 276], [330, 306], [430, 322], [516, 318]], [18, 24, 18, 10, 2], BR, .18) +
    brume(D, [[430, 214], [476, 232], [516, 230], [534, 212]], [12, 10, 5, 2], BR, .3) + brume(D, [[70, 196], [120, 222], [176, 244]], [6, 12, 4], BR, .24) +
    L('M470 236 C 492 240 512 236 526 222 C 532 214 530 204 522 202 C 514 202 512 210 518 214', BR2, 1.6, op(.32)) + L('M410 300 C 440 312 476 312 500 300 C 510 294 512 284 504 280 C 496 278 492 286 498 290', BR2, 1.6, op(.28)));
  /* ---- les ailes (l'aile du fond est derrière le corps, celle de devant par-dessus) ---- */
  s.aileF = aile(D, AILE_F, 1);
  s.aileD = aile(D, AILE_D, 0);
  /* ---- la queue et sa membrane ---- */
  s.queue = piv('queue', 278, 246, P('M250 250 Q 278 292 306 246 L 300 236 Q 276 264 256 238 Z', D.g('#3a2a4a'), ' fill-opacity=".92"') + L('M277 248 L 279 280', sombre(OS, .2), 2.6) + L('M262 256 Q 277 272 294 256 M266 264 Q 278 274 290 264', '#8a7ab0', .9, op(.5)));
  /* ---- les pattes : la jambe (derrière le corps) et le pied griffu (devant l'aile) : deux éléments, une seule pièce ---- */
  var J = [[254, 240, 244, 270, -1, 'piedG'], [300, 238, 310, 268, 1, 'piedD']];
  s.jambes = J.map(function(j){ return piv(j[5], j[0], j[1], P(tube([[j[0], j[1]], [(j[0] + j[2]) / 2 + j[4] * 2, (j[1] + j[3]) / 2], [j[2], j[3]]], [13, 9, 8]).d, D.g(sombre(FOUR, .15)))); }).join('');
  var gG = D.g('#e2d8dc');
  s.pieds = J.map(function(j){
    var g = '<ellipse cx="' + j[2] + '" cy="' + (j[3] + 2) + '" rx="7" ry="4.5" fill="' + D.g('#5a4462') + '" stroke="' + O + '" stroke-width="2"/>', hl = '';
    for(var k = 0; k < 4; k++){ var bx = j[2] - 6 + k * 4.2, by = j[3] + 4, an = (122 - k * 16) * Math.PI / 180, lg = 15 - Math.abs(k - 1.5) * 2, ux = Math.cos(an), uy = Math.sin(an), nx = -uy, ny = ux;
      var tp = [bx + ux * lg - 3, by + uy * lg], c1 = [bx + ux * lg * .55 - nx * 3, by + uy * lg * .55 - ny * 3], c2 = [bx + ux * lg * .5 + nx * .5, by + uy * lg * .5 + ny * .5];
      g += P('M' + pt([bx - 2.6, by]) + ' Q ' + pt(c1) + ' ' + pt(tp) + ' Q ' + pt(c2) + ' ' + pt([bx + 2.6, by]) + ' Z', gG, ' stroke-width="1.1"');
      hl += 'M' + pt([bx - .8, by + 1]) + ' Q ' + pt([c1[0] + nx * 1.6, c1[1] + ny * 1.6]) + ' ' + pt([tp[0] + 1.5, tp[1] - 1]) + ' '; }
    g += L(hl, '#ffffff', .8, op(.6));
    if(j[5] === 'piedG') g += ancre('griffe', 238, 288);
    return piv(j[5], j[0], j[1], g);
  }).join('');
  /* ---- le corps : bord hérissé, mèches couchées, ventre plus clair ---- */
  var c = frange2(lelong([[308, 168], [314, 190], [314, 212], [308, 232], [300, 246]], 8), 9, D.g(FOUR), 11, [6, 5], 2);
  c += P(CORPS_D, D.g(FOUR));
  c += F('M256 196 C 254 222 262 244 276 252 C 290 246 298 222 292 196 C 284 184 264 184 256 196 Z', D.rad([[0, clair(VENTRE, .15)], [1, VENTRE, 0]], .5, .45, .55));
  c += meches(276, 214, 28, 36, 26, 13, [clair(FOUR, .2), sombre(FOUR, .25), '#efe4f6'], 1.45, 16);
  c += poils(274, 214, 30, 40, 50, 13, '#e4d8ec', '#2a1e30', .3, .1);
  c += L('M302 160 C 314 182 316 212 306 236', LUNE, 2.2, op(.55));
  /* le point faible : le cœur sous la fourrure du poitrail, qui brille et palpite */
  c += vari('ouvert', douce(D, 274, 222, 46, 50, '#ffe9a0', .85) + douce(D, 274, 222, 22, 24, '#fffbe8', 1) + piv('x-pf', 274, 222, '<circle cx="274" cy="222" r="20" fill="none" stroke="#fff4c0" stroke-width="3"/><circle cx="274" cy="222" r="30" fill="none" stroke="#ffd870" stroke-width="2" opacity=".7"/>') +
    '<path d="' + etoileD(9, 4, .35) + '" transform="translate(274 222)" fill="#ffffff"/>');
  c += vari('flash', F(CORPS_D, '#ffffff')) + vari('flashG', F(CORPS_D, '#d8f0ff'));
  c += vari('gel', F(CORPS_D, '#e2f6ff', op(.45)) + L('M252 180 L 262 200 L 254 222 M292 176 L 286 200', '#ffffff', 1.4, op(.8)));
  c += vari('feu', flammes(D, [[298, 182, 96, 46, 8, 2]]));
  c += ancre('centre', 276, 200) + ancre('pointfaible', 274, 220) + ancre('pieds', 278, 288);
  s.corps = piv('corps', 276, 230, c);
  /* ---- la crinière autour du cou ---- */
  var crin = lisse(CRIN_PTS, true);
  var cr = frange2(lelong(CRIN_PTS.slice(4, 13), 13), 19, D.g(sombre(FOUR, .04)), 7, [7, 9], 2);
  cr += F(crin, D.g(FOUR)) + L(lisse(CRIN_PTS.slice(1, 6)), O, 3);
  cr += F(lisse([[232, 176], [262, 190], [296, 186], [314, 170], [300, 196], [270, 204], [240, 194]], true), '#140a1c', op(.2));
  cr += meches(272, 162, 44, 22, 40, 21, [clair(FOUR, .22), sombre(FOUR, .3), '#f2e8f8'], 1.25, 18);
  cr += poils(270, 164, 42, 20, 40, 22, '#eee4f4', '#2a1e30', .3, .5);
  cr += L('M296 132 C 312 140 322 156 322 168', LUNE, 2.2, op(.6));
  cr += vari('flash', F(crin, '#ffffff')) + vari('flashG', F(crin, '#d8f0ff')) + vari('gel', F(crin, '#e2f6ff', op(.4)));
  s.crin = piv('crin', 272, 172, cr);
  /* ---- la tête ---- */
  var t = '';
  /* l'oreille du fond : immense, déchirée */
  var oF = P(OREILLE_F, D.g(sombre(FOUR, .15))) + F('M260 108 C 270 80 288 52 312 26 C 316 52 314 86 294 114 C 284 124 268 122 260 108 Z', D.halo('#e8b8cc', '#8a5a7a'));
  oF += L('M266 106 C 274 88 288 66 306 42 M272 112 Q 284 106 298 102 M268 100 Q 282 94 296 88 M270 88 Q 284 80 302 74 M280 72 Q 290 64 306 58', '#6a3a5a', 1.2, op(.6));
  oF += L('M310 36 C 306 54 300 74 288 94 M300 58 C 294 60 288 64 284 70', '#a04870', 1, op(.5)) + L('M318 14 C 324 42 322 70 314 94', LUNE, 2, op(.6));
  oF += vari('flash', F(OREILLE_F, '#ffffff')) + vari('flashG', F(OREILLE_F, '#d8f0ff')) + vari('gel', F(OREILLE_F, '#e2f6ff', op(.5)) + L('M318 14 C 324 42 322 70 314 94', '#ffffff', 2.4));
  t += piv('oreilleF', 272, 118, oF);
  /* la grande oreille de devant : plis, tragus, veines, encoches */
  var oD = P(OREILLE_D, D.g(FOUR)) + F('M244 104 C 238 80 226 50 208 22 C 200 48 196 80 204 100 C 214 114 234 116 244 104 Z', D.halo('#f4c4d8', '#a0607e'));
  oD += L('M206 36 Q 216 42 220 54 M202 52 Q 214 58 226 68 M202 68 Q 216 74 232 82 M204 84 Q 218 88 238 94', '#7a4060', 1.4, op(.6));
  oD += L('M207 42 Q 217 48 222 56 M204 58 Q 216 64 228 72', '#ffe0ee', 1, op(.5));
  oD += L('M212 102 C 208 84 208 62 206 42 M222 94 C 226 88 228 80 226 72 M206 68 C 212 68 218 70 222 74', '#a04870', 1, op(.55));
  oD += P('M228 112 C 220 102 220 90 226 82 C 234 92 236 104 232 114 Z', D.g('#b07a94'), ' stroke-width="2"') + L('M227 88 C 231 96 231 104 229 110', '#ffe0ee', 1, op(.5));
  oD += L('M208 4 C 228 32 244 66 250 98', LUNE, 2, op(.55));
  oD += vari('flash', F(OREILLE_D, '#ffffff')) + vari('flashG', F(OREILLE_D, '#d8f0ff')) + vari('gel', F(OREILLE_D, '#e2f6ff', op(.5)) + L('M208 4 C 228 32 244 66 250 98', '#ffffff', 2.4));
  t += piv('oreilleD', 238, 114, oD);
  /* la tête de gargouille */
  t += frange([[272, 112], [274, 130], [270, 148], [262, 162]], 8, D.g(FOUR), 31, .4, 2);
  t += P(TETE_D, D.g(FOUR));
  t += meches(244, 124, 24, 18, 16, 25, [clair(FOUR, .2), sombre(FOUR, .28), '#efe4f6'], .5, 12);
  t += poils(240, 130, 28, 22, 28, 26, '#e4d8ec', '#2a1e30', .3, .4);
  t += L('M232 88 C 254 90 270 104 272 124', LUNE, 2.2, op(.55));
  t += F('M174 132 C 182 122 198 118 210 126 C 214 140 206 156 192 160 C 180 160 172 150 174 132 Z', D.g('#6a4e72'));
  t += L('M178 130 Q 184 136 182 146 M186 124 Q 194 132 192 144 M196 122 Q 204 128 204 140', '#22142c', 1.5, op(.6)) + L('M188 124 Q 196 132 194 142', '#e0d0ea', 1, op(.3));
  t += L('M212 110 Q 220 104 230 106 M214 118 Q 222 112 232 114', '#22142c', 1.3, op(.45));
  t += vari('flash', F(TETE_D, '#ffffff')) + vari('flashG', F(TETE_D, '#d8f0ff')) + vari('gel', F(TETE_D, '#e2f6ff', op(.4)));
  /* la gueule : le fond (fixe), la mâchoire du bas (pièce), puis les gencives et les crocs du haut par-dessus */
  t += P('M182 158 C 194 152 222 156 242 166 C 244 188 232 208 212 212 C 194 212 182 194 182 158 Z', '#24081a');
  t += F('M200 176 C 208 172 220 174 226 180 C 220 186 206 186 200 176 Z', '#0a0208', op(.7));
  var croc = D.lin([[0, '#fffaf0'], [1, '#c8bca8']], 0, 0, 1, 1);
  var m = F('M186 170 C 204 166 226 168 240 172 C 244 196 232 216 212 218 C 194 218 182 206 182 186 Z', '#24081a');
  m += F('M196 196 C 204 206 222 206 232 196 C 222 192 206 192 196 196 Z', '#a8506a') + L('M204 200 Q 214 202 226 198', '#d07a94', 1, op(.6));
  m += P('M244 164 C 248 192 236 218 210 220 C 194 220 182 212 180 198 C 180 193 185 193 187 197 C 191 206 199 212 212 212 C 230 210 240 192 244 164 Z', D.g(FOUR), ' stroke-width="2.6"');
  m += P('M196 210 L 198 194 L 203 210 Z M222 208 L 225 194 L 228 206 Z', croc, ' stroke-width="1.6"');
  m += piv('bave', 208, 212, P('M206 212 C 206 220 204 228 206 236 C 209 238 212 236 211 232 C 210 226 210 218 211 212 Z', '#d8eaff', ' stroke-width="1.2" opacity=".75"') + C(208.5, 242, 1.8, '#d8eaff', op(.7)) + ancre('baveBout', 208, 240));
  t += piv('machoire', 242, 166, m);
  t += F('M182 158 C 194 152 222 156 242 166 C 236 172 210 166 186 168 Z', '#8a405e') + L('M186 165 C 204 162 224 166 238 170', '#c06a88', 1.2, op(.7));
  t += P('M186 164 L 195 164 C 195 175 193 186 190 196 C 188 184 187 174 186 164 Z', croc, ' stroke-width="1.8"') + P('M224 168 L 232 170 C 232 180 230 190 227 198 C 226 188 225 178 224 168 Z', croc, ' stroke-width="1.8"');
  t += P('M199 165 L 202 172 L 205 166 Z M206 166 L 209 173 L 212 167 Z M213 167 L 216 173 L 219 168 Z', '#f4eee0', ' stroke-width="1"') + L('M188 166 C 189 174 189 182 189 190', '#ffffff', 1, op(.8));
  /* le nez retroussé et sa feuille en fer de lance */
  t += P('M176 132 C 170 122 168 108 174 96 L 178 99 L 181 88 L 185 94 L 188 84 L 191 94 L 195 90 C 200 104 198 120 192 132 Z', D.g('#5e4466'), ' stroke-width="2.2"');
  t += F('M180 128 C 176 118 176 106 182 96 C 190 106 192 118 188 128 Z', D.halo('#9a7aa0', '#5e4466'), op(.5));
  t += L('M184 92 L 184 130', '#3a1e3a', 1.3, op(.7)) + L('M175 120 Q 184 115 194 120 M175 110 Q 184 105 194 110 M178 101 Q 184 98 190 101', '#3a1e3a', 1, op(.55)) + L('M191 94 C 197 106 197 118 193 128', LUNE, 1.1, op(.45));
  t += P('M172 133 C 178 128 191 128 197 133 C 195 142 189 147 184.5 149 C 180 147 174 142 172 133 Z', D.g('#4a3250'), ' stroke-width="2.2"');
  t += F('M175 135.5 C 178 135 182 137 182.5 140.5 C 180 140 177 138.5 175 135.5 Z M194 135.5 C 191 135 187 137 186.5 140.5 C 189 140 192 138.5 194 135.5 Z', '#0e040a');
  t += L('M184.5 141 L 184.5 148', '#1a0a14', 1.1, op(.6)) + L('M188 130 C 193 131 195 133 195 136', LUNE, 1, op(.4)) + L('M196 134 Q 202 132 204 124 M196 140 Q 206 140 212 134 M172 136 Q 168 142 170 150', '#1a0e20', 1.4, op(.55));
  /* les yeux laiteux, sans pupille, sous des sourcils froncés */
  var oeil = D.rad([[0, '#f4f8fa'], [.5, '#cfdae2'], [1, '#7a8a9a']], .4, .4, .7), halo = D.halo('#ffffff', '#bfe8ff');
  t += '<circle cx="208" cy="124" r="22" fill="' + halo + '" opacity=".42"/><ellipse cx="208" cy="125" rx="11" ry="8.5" fill="#140a1c" opacity=".8"/>';
  t += '<ellipse cx="208" cy="126" rx="7" ry="5.6" fill="' + oeil + '" stroke="' + O + '" stroke-width="2"/>' + L('M203 127 Q 208 124 213 127 M204 129.5 Q 208 127.5 212 129.5', '#a8b8c6', .9, op(.7));
  t += '<circle cx="244" cy="114" r="14" fill="' + halo + '" opacity=".28"/><ellipse cx="244" cy="115" rx="7.5" ry="5.8" fill="#140a1c" opacity=".75"/><ellipse cx="244" cy="116" rx="4.5" ry="3.9" fill="' + oeil + '" stroke="' + O + '" stroke-width="1.8"/>';
  /* les yeux des états : rouges (enragée), fous (la lumière), plissés (éblouie, la douleur), en spirale (sonnée) */
  var gR = D.rad([[0, '#fff2a0'], [.4, '#ff5a2a'], [1, '#8a0a10']], .45, .45, .6);
  t += vari('rouge', '<circle cx="208" cy="124" r="20" fill="' + D.doux('#ff3a20', .6) + '"/><ellipse cx="208" cy="126" rx="7" ry="5.6" fill="' + gR + '" stroke="' + O + '" stroke-width="2"/><circle cx="244" cy="114" r="12" fill="' + D.doux('#ff3a20', .5) + '"/><ellipse cx="244" cy="116" rx="4.5" ry="3.9" fill="' + gR + '" stroke="' + O + '" stroke-width="1.8"/>');
  var fouD = '<ellipse cx="206" cy="123" rx="16" ry="13" fill="#fbfdff" stroke="' + O + '" stroke-width="2.6"/>' + L('M191 120 L 199 123 M192 129 L 199 126 M221 117 L 213 121 M221 129 L 213 126 M206 110 L 206 115', '#e0304a', 1.5) + C(205, 123, 3.4, '#7a0a18') + C(204, 121.5, 1.1, '#ffffff') +
    '<ellipse cx="246" cy="113" rx="11" ry="9" fill="#fbfdff" stroke="' + O + '" stroke-width="2.2"/>' + L('M236 112 L 241 113 M256 110 L 251 112 M246 104 L 246 108', '#e0304a', 1.3) + C(245, 113, 2.6, '#7a0a18');
  t += vari('folle', '<circle cx="208" cy="124" r="30" fill="' + D.doux('#ff6050', .6) + '"/><circle cx="246" cy="113" r="20" fill="' + D.doux('#ff6050', .5) + '"/>' + fouD);
  t += vari('plisse', '<ellipse cx="208" cy="126" rx="10" ry="7.5" fill="#3a2848"/>' + L('M199 128 Q 208 121 217 127', O, 2.6) + L('M201 130 Q 208 126 215 130', '#9a88a8', 1.2) + '<ellipse cx="244" cy="116" rx="7" ry="5.4" fill="#3a2848"/>' + L('M238 117 Q 244 112 250 116', O, 2.2));
  var spir = function(x, y, r){ return 'M' + f1(x) + ' ' + f1(y) + ' m 0 0 a ' + f1(r * .3) + ' ' + f1(r * .3) + ' 0 1 1 ' + f1(r * .6) + ' 0 a ' + f1(r * .6) + ' ' + f1(r * .6) + ' 0 1 1 ' + f1(-r * 1.2) + ' 0 a ' + f1(r * .9) + ' ' + f1(r * .9) + ' 0 1 1 ' + f1(r * 1.8) + ' 0'; };
  t += vari('ko', '<ellipse cx="207" cy="124" rx="13" ry="11" fill="#f4f8fa" stroke="' + O + '" stroke-width="2.4"/>' + L(spir(205, 124, 11), '#3a2848', 2.2) + '<ellipse cx="245" cy="114" rx="9" ry="7.6" fill="#f4f8fa" stroke="' + O + '" stroke-width="2.2"/>' + L(spir(244, 114, 7), '#3a2848', 1.8));
  t += P('M196 126 C 200 116 214 110 224 116 C 216 117 206 120 198 128 Z', D.g(sombre(FOUR, .25)), ' stroke-width="1.8"') + P('M234 116 C 238 108 248 104 256 110 C 248 110 242 112 236 118 Z', D.g(sombre(FOUR, .25)), ' stroke-width="1.6"');
  /* le cri qui sort de la gueule : des ondes (elle « voit » avec ses oreilles) ; elles partent en boucle */
  [[22, .75], [38, .6], [54, .45], [70, .32]].forEach(function(q, i){ var a = arcD([184, 186], q[0], 2.5, 3.5); t += '<g data-j="x-onde' + i + '" style="transform-origin:184px 186px;opacity:0">' + L(a, '#8fe8ff', 10, op(q[1] * .25)) + L(a, '#14202e', 5, op(q[1] * .5)) + L(a, '#e0faff', 2.2, op(q[1])) + '</g>'; });
  /* les cris de la folle : de grandes ondes rouges */
  var cris = '';
  [[26, 1], [46, .8], [68, .6]].forEach(function(q, i){ var a = arcD([184, 186], q[0], 2.3, 3.8); cris += piv('x-cri' + i, 184, 186, L(a, '#ff4a3a', 11, op(q[1] * .3)) + L(a, O, 6, op(q[1] * .7)) + L(a, '#ffd0b0', 3, op(q[1]))); });
  t += vari('cri', cris);
  t += vari('feu', flammes(D, [[240, 100, 76, 38, -6, 3]]));
  t += ancre('tete', 214, 128) + ancre('bouche', 206, 190) + ancre('haut', 256, 0) + ancre('oreille', 236, 50);
  s.tete = piv('tete', 252, 160, t);
  /* ---- la brume devant : quelques volutes qui passent par-dessus ---- */
  s.brumeD = piv('brumeD', 260, 256, brume(D, [[34, 222], [72, 236], [124, 240]], [4, 10, 3], BR2, .3) + brume(D, [[360, 272], [410, 266], [460, 274], [504, 294]], [4, 12, 8, 2], BR2, .3) +
    L('M92 242 C 108 234 126 238 136 248 C 124 244 114 246 108 254', '#d8d0f4', 1.4, op(.32)));
  /* ---- au-dessus de la tête : les étoiles (éblouie) et les étoiles grises de la sonnée ---- */
  var et = '';
  for(var ie = 0; ie < 4; ie++) et += piv('x-et' + ie, 0, 0, '<circle r="34" fill="' + D.doux('#fff6c0', .6) + '"/><path d="' + etoileD(26 - (ie % 2) * 6, 5, .45) + '" fill="#ffe466" stroke="' + O + '" stroke-width="3.4"/>');
  s.etoiles = vari('etoiles', et);
  var so = '';
  for(var is = 0; is < 3; is++) so += piv('x-so' + is, 0, 0, '<circle r="30" fill="' + D.doux('#d8e8ff', .55) + '"/><path d="' + etoileD(22, 4, .38) + '" fill="#eaf4ff" stroke="' + O + '" stroke-width="3.2"/>');
  so += piv('x-so3', 0, 0, L('M-24 0 C -24 -14 -7 -17 0 -7 C 7 3 24 0 24 -14', O, 8) + L('M-24 0 C -24 -14 -7 -17 0 -7 C 7 3 24 0 24 -14', '#cfe0ff', 4));
  s.sonne = vari('sonne', so);
  return s;
}

/* =====================================================================
   3. Le CSS (injecté une seule fois)
   ===================================================================== */
var CSS = '.' + PX + '{position:relative;width:100%;height:100%}' +
  '.' + PX + '>svg{width:100%;height:100%;overflow:visible;display:block}' +
  '.' + PX + ' [data-j]{transform-box:view-box;transform-origin:0 0}' +
  '.' + PX + '-scene-fx{position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;pointer-events:none;z-index:6}';
function injecterCSS(){ if(document.getElementById(PX + '-css')) return; var s = document.createElement('style'); s.id = PX + '-css'; s.textContent = CSS; document.head.appendChild(s); }

/* =====================================================================
   4. Le moteur de poses (le même que les autres bêtes)
   ===================================================================== */
var Z = {x: 0, y: 0, a: 0, sx: 1, sy: 1}, VB = {x: 0, y: -40, w: 540, h: 760};
function r3(n){ return Math.round(n * 1000) / 1000; }
function tf(v){ return 'translate(' + r3(v.x) + 'px,' + r3(v.y) + 'px) rotate(' + r3(v.a) + 'deg) scale(' + r3(v.sx) + ',' + r3(v.sy) + ')'; }
function fusion(a, b){ var o = {x: a.x, y: a.y, a: a.a, sx: a.sx, sy: a.sy}; if(b){ for(var k in o) if(b[k] != null) o[k] = b[k]; if(b.s != null){ o.sx = b.s; o.sy = b.s; } } return o; }
function attendreMs(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }
function fini(a){ return a && a.finished ? a.finished.then(function(){}, function(){}) : Promise.resolve(); }
function hasard(a, b){ return a + Math.random() * (b - a); }
function choisir(l){ return l[Math.floor(Math.random() * l.length)]; }
function T(x, y, s, a){ return 'translate(' + f1(x) + 'px,' + f1(y) + 'px)' + (a != null ? ' rotate(' + f1(a) + 'deg)' : '') + (s != null ? ' scale(' + s + ')' : ''); }
function rot(p, a){ var r = a * Math.PI / 180, c = Math.cos(r), s = Math.sin(r); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; }

function Chauve(conteneur, options){
  injecterCSS();
  this.c = conteneur; this.opt = options || {};
  this.num = ++NUM;
  var D = new Defs('btCS' + this.num + '_'), s = dessiner(D);
  var X = CENTRE[0], Y = CENTRE[1];
  /* la chaîne : pos (place, piqué, chute) > vol (le corps monte et descend avec les ailes) > secousse > posture */
  var chaine = piv('pos', X, Y, piv('vol', X, Y, piv('secousse', X, Y, piv('posture', X, Y,
    s.aura + s.brumeA + s.aileF + s.queue + s.jambes + s.corps + s.aileD + s.pieds + s.crin + s.tete + s.brumeD + Gt('translate(222 60)', s.sonne) + Gt('translate(214 70)', s.etoiles)))));
  var div = document.createElement('div');
  div.className = PX;
  div.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + VB.x + ' ' + VB.y + ' ' + VB.w + ' ' + VB.h + '" preserveAspectRatio="xMidYMax meet"><defs>' + D.l.join('') + '</defs>' +
    '<g data-slot="restes"></g>' + sansOpacite(s.ombre + vari('bete', chaine, 1)) + '<g data-slot="monde"></g></svg>';
  conteneur.appendChild(div);
  this.el = div; this.svg = div.querySelector('svg'); this.defs = this.svg.querySelector('defs'); D.vivant = this.defs; this.D = D;
  var self = this;
  this.J = {}; this.V = {}; this.K = {}; this.A = {}; this.S = {};
  [].forEach.call(this.svg.querySelectorAll('[data-j]'), function(e){ var n = e.getAttribute('data-j'), r = n.indexOf('v-') === 0 ? self.V : (n.indexOf('x-') === 0 ? self.K : self.J); if(r !== self.J) n = n.slice(2); (r[n] = r[n] || []).push(e); });
  [].forEach.call(this.svg.querySelectorAll('[data-a]'), function(e){ self.A[e.getAttribute('data-a')] = e; });
  [].forEach.call(this.svg.querySelectorAll('[data-slot]'), function(e){ self.S[e.getAttribute('data-slot')] = e; });
  this.v = {}; this.boucles = []; this.boucX = {}; this.minuteurs = []; this.nbP = 0; this.vitesse = 1;
  this.etat = {enrage: false, brule: false, colle: false, ebloui: false, gele: false, ouvert: false, dos: false, cible: false, 'au-sol': false, folle: false};
  this.attente = true; this.jeton = 0; this.enAction = false; this.mort = false;
  this._reprendre(0);
}
var R = Chauve.prototype;
R._lire = function(n){
  var el = this.J[n][0], ref = this.v[n] || Z, t = getComputedStyle(el).transform;
  if(!t || t === 'none') return fusion(Z);
  var m = t.match(/matrix\(([^)]+)\)/); if(!m) return fusion(ref);
  var v = m[1].split(',').map(parseFloat), sx = Math.hypot(v[0], v[1]), ang = Math.atan2(v[1], v[0]) * 180 / Math.PI, sy = (v[0] * v[3] - v[1] * v[2]) / (sx || 1);
  while(ang - ref.a > 180) ang -= 360; while(ang - ref.a < -180) ang += 360;
  if(sy < 0 && ref.sy > 0){ sy = -sy; sx = -sx; ang += 180; while(ang - ref.a > 180) ang -= 360; while(ang - ref.a < -180) ang += 360; }
  return {x: v[4], y: v[5], a: ang, sx: sx, sy: sy};
};
R._figer = function(){ var self = this; Object.keys(this.J).forEach(function(n){ var v = self._lire(n); self.J[n].forEach(function(el){ el.getAnimations().forEach(function(a){ a.cancel(); }); el.style.transform = tf(v); }); self.v[n] = v; }); };
/* cles = [{t: 0..1, p: {piece: {x, y, a, sx, sy, s}}, e: 'easing'}] ; o.boucle, o.ajout (par-dessus), o.vitesse, o.delai, o.depuis */
R._seq = function(cles, duree, o){
  o = o || {};
  var self = this, noms = {}, anims = [];
  cles.forEach(function(k){ for(var n in k.p) noms[n] = 1; });
  Object.keys(noms).forEach(function(n){
    var els = self.J[n]; if(!els) return;
    var cur = o.ajout ? fusion(Z) : (o.depuis ? fusion(Z, o.depuis[n]) : self._lire(n)), frames = [];
    if(!(cles[0].t === 0 && cles[0].p[n])) frames.push({offset: 0, transform: tf(cur)});
    cles.forEach(function(k){ if(!k.p[n]) return; cur = fusion(cur, k.p[n]); if(frames.length && k.e) frames[frames.length - 1].easing = k.e; frames.push({offset: k.t, transform: tf(cur)}); });
    if(frames[frames.length - 1].offset < 1) frames.push({offset: 1, transform: tf(cur)});
    frames.forEach(function(f){ if(!f.easing) f.easing = o.e || 'ease-in-out'; });
    if(!o.ajout && !o.boucle) self.v[n] = cur;
    els.forEach(function(el){
      var a = el.animate(frames, {duration: duree, iterations: o.boucle ? Infinity : 1, fill: o.ajout ? 'none' : 'forwards', composite: o.ajout ? 'add' : 'replace', delay: o.delai || 0});
      a.playbackRate = o.vitesse || 1;
      if(o.boucle) self.boucles.push(a); else if(!o.ajout) a.finished.then(function(){ try{ a.commitStyles(); a.cancel(); }catch(e){} }, function(){});
      anims.push(a);
    });
  });
  return {anims: anims, fini: Promise.all(anims.map(fini))};
};
R._allerA = function(pose, duree, e, tout){ var p = {}, n; if(tout) for(n in this.J) p[n] = fusion(Z); for(n in pose) p[n] = fusion(Z, pose[n]); return this._seq([{t: 1, p: p, e: e || 'cubic-bezier(.3,.7,.3,1)'}], duree).fini; };
/* un point d'une ancre, ramené dans le repère « monde » du SVG (celui du dessin) */
R._ou = function(nom){ var el = this.A[nom], m = el.getCTM(), w = this.S.monde.getCTM(), p = this.svg.createSVGPoint(); p.x = +el.getAttribute('cx'); p.y = +el.getAttribute('cy'); p = p.matrixTransform(m).matrixTransform(w.inverse()); return [p.x, p.y]; };
R._echelle = function(){ var r = this.svg.getBoundingClientRect(), k = Math.min(r.width / VB.w, r.height / VB.h); return {k: k, x0: r.left + (r.width - VB.w * k) / 2 - VB.x * k, y0: r.top + (r.height - VB.h * k) - VB.y * k}; };
R._versMonde = function(q){ var e = this._echelle(); return [(q.x - e.x0) / e.k, (q.y - e.y0) / e.k]; };
R._minuteur = function(f, ms){ var self = this, id = setTimeout(function(){ var i = self.minuteurs.indexOf(id); if(i >= 0) self.minuteurs.splice(i, 1); f(); }, ms); this.minuteurs.push(id); return id; };
R._couperBoucles = function(){ this.minuteurs.forEach(clearTimeout); this.minuteurs = []; this._figer(); this.boucles = []; };
R._fondu = function(nom, vers, ms){
  var self = this, els = [];
  [].concat(nom).forEach(function(n){ if(typeof n === 'string') els = els.concat(self.V[n] || []); else if(n) els.push(n); });
  els.forEach(function(e){
    var de = e.getAttribute('visibility') === 'hidden' ? 0 : parseFloat(getComputedStyle(e).opacity);
    e.getAnimations().forEach(function(a){ a.cancel(); });
    e.setAttribute('opacity', vers);
    if(vers > 0) e.removeAttribute('visibility');
    if(ms){ var an = e.animate([{opacity: de}, {opacity: vers}], {duration: ms, easing: 'ease-in-out'}); if(vers <= 0) an.finished.then(function(){ if(+e.getAttribute('opacity') <= 0) e.setAttribute('visibility', 'hidden'); }, function(){}); }
    else if(vers <= 0) e.setAttribute('visibility', 'hidden');
  });
};
R._boucleX = function(nom, frames, duree, o){ o = o || {}; var self = this; (this.K[nom] || []).forEach(function(e){ (self.boucX[nom] = self.boucX[nom] || []).push(e.animate(frames, {duration: duree, iterations: o.fois || Infinity, delay: o.delai || 0, easing: o.e || 'linear', direction: o.dir || 'normal'})); }); };
R._couperX = function(p){ var self = this; Object.keys(this.boucX).forEach(function(n){ if(n.indexOf(p) === 0){ self.boucX[n].forEach(function(a){ a.cancel(); }); delete self.boucX[n]; } }); };
/* une particule (forme simple, retirée à la fin ; au-delà de 24 en même temps, elle n'est pas affichée) */
R._part = function(html, parent){
  var self = this, g = document.createElementNS(NS, 'g');
  g.innerHTML = html;
  if(this.nbP < 24){ (parent || this.S.monde).appendChild(g); this.nbP++; g.remove = function(){ if(g.parentNode){ self.nbP--; Element.prototype.remove.call(g); } }; }
  return g;
};
R._vole = function(html, frames, o){ o = o || {}; var g = this._part(html); g.animate(frames, {duration: o.duree || 600, delay: o.delai || 0, easing: o.e || 'ease-out', fill: 'both'}).finished.then(function(){ g.remove(); }, function(){ g.remove(); }); return g; };

/* =====================================================================
   5. Les poses, l'attente
   ===================================================================== */
/* au sol : elle s'est écrasée devant, ailes en vrac (ou repliées et collées) */
var SOLX = -70, SOLY = 386;
var POSES = {
  vol: {},
  dos: {posture: {a: 180}, oreilleD: {a: -10}, oreilleF: {a: 10}},
  sol: {pos: {x: SOLX, y: SOLY}, ombre: {x: SOLX, sx: 1.6, sy: 1.5}, posture: {a: -4, y: 6}, corps: {sx: 1.04, sy: .94}, crin: {sx: 1.04, sy: .96},
    aileD: {a: -30, sx: .92, sy: .72}, mainD: {a: -26}, aileF: {a: 28, sx: .9, sy: .7}, mainF: {a: 24},
    tete: {a: -20, x: -2, y: 10}, machoire: {a: -14}, oreilleD: {a: -34}, oreilleF: {a: 30}, piedG: {a: 24}, piedD: {a: -32}, queue: {a: 10},
    brumeA: {sx: .55, sy: .6, y: 34}, brumeD: {sx: .7, sy: .8, y: 26}},
  solColle: {pos: {x: SOLX, y: SOLY + 4}, ombre: {x: SOLX, sx: 1.2, sy: 1.4}, posture: {a: -6, y: 4}, corps: {sx: 1.02, sy: .96},
    aileD: {a: 58, sx: .5, sy: .88}, mainD: {a: 54}, aileF: {a: -58, sx: .5, sy: .88}, mainF: {a: -54},
    tete: {a: -10, y: 6}, machoire: {a: -10}, oreilleD: {a: -16}, oreilleF: {a: 14}, piedG: {a: 30}, piedD: {a: -30}, queue: {a: 6},
    brumeA: {sx: .55, sy: .6, y: 34}, brumeD: {sx: .7, sy: .8, y: 26}}
};
R._mode = function(){ var e = this.etat; return e['au-sol'] ? (e.colle ? 'solColle' : 'sol') : (e.dos ? 'dos' : 'vol'); };
R._base = function(){
  var p = {}, mode = this._mode(), m = POSES[mode], n, e = this.etat;
  for(n in m) p[n] = fusion(Z, m[n]);
  if(mode === 'vol' || mode === 'dos'){
    if(e.ebloui){ p.tete = fusion(Z, {a: 14, y: 4}); p.oreilleD = fusion(Z, {a: 22}); p.oreilleF = fusion(Z, {a: 18}); }
    if(e.gele){ p.pos = fusion(Z, {y: 30}); p.ombre = fusion(Z, {sx: 1.1}); }
    if(e.folle){ p.machoire = fusion(Z, {a: -16}); p.oreilleD = fusion(Z, {a: -14}); p.oreilleF = fusion(Z, {a: 12}); }
  }
  return p;
};
/* le jeton de reprise : une reprise interrompue par une autre (ou par une action) ne lance pas ses boucles,
   sinon chaque pièce aurait deux boucles d'attente (la carte graphique ne compose plus, tout est redessiné à chaque image) */
R._reprendre = function(duree){
  var self = this, n = this.reprise = (this.reprise || 0) + 1;
  if(this.mort) return Promise.resolve();
  this._couperBoucles();
  return this._allerA(this._base(), duree == null ? 300 : duree, null, true).then(function(){ if(n === self.reprise && !self.enAction && !self.mort && self.attente) self._lancerBoucles(); });
};
/* les battements d'ailes (le bras monte lentement, s'abat vite ; la main suit avec un temps de retard) */
var BAT = {
  aile: [[0, {a: -22, sx: .97, sy: .86}], [.3, {a: 3, sx: 1, sy: 1}], [.58, {a: 30, sx: .93, sy: .78}], [.8, {a: 4, sx: 1.02, sy: 1.04}], [1, {a: -22, sx: .97, sy: .86}]],
  main: [[0, {a: -12}], [.2, {a: -15}], [.45, {a: 2}], [.62, {a: 13}], [.8, {a: 6}], [.92, {a: -8}], [1, {a: -12}]],
  vol: [[0, {y: -5}], [.58, {y: 5}], [1, {y: -5}]],
  pied: [[0, {a: 5}], [.6, {a: -7}], [1, {a: 5}]]
};
R._boucle = function(b, n, deltas, duree, o){
  o = o || {};
  var v0 = fusion(Z, b[n]), signe = o.signe || 1;
  var cles = deltas.map(function(d){ var p = {}; p[n] = {}; for(var k in d[1]) p[n][k] = (k === 'sx' || k === 'sy') ? v0[k] * d[1][k] : v0[k] + d[1][k] * (k === 'a' ? signe : 1); return {t: d[0], p: p, e: o.e}; });
  return this._seq(cles, duree, {boucle: true, vitesse: o.vitesse || this.vitesse, depuis: b, delai: o.delai || 0});
};
R._battre = function(b, periode, vitesse){
  var o = {vitesse: vitesse || 1};
  this._boucle(b, 'aileD', BAT.aile, periode, o); this._boucle(b, 'aileF', BAT.aile, periode, {vitesse: o.vitesse, signe: -1});
  this._boucle(b, 'mainD', BAT.main, periode, o); this._boucle(b, 'mainF', BAT.main, periode, {vitesse: o.vitesse, signe: -1});
  this._boucle(b, 'vol', BAT.vol, periode, o);
  this._boucle(b, 'piedG', BAT.pied, periode, {vitesse: o.vitesse, delai: -periode * .2}); this._boucle(b, 'piedD', BAT.pied, periode, {vitesse: o.vitesse, delai: -periode * .35});
};
R._lancerBoucles = function(){
  var self = this, b = this._base(), e = this.etat, mode = this._mode();
  this.vitesse = e.folle ? 1.7 : (e.enrage ? 1.45 : (e.gele ? .4 : 1));
  var V = this.vitesse;
  function boucle(n, d, duree, o){ return self._boucle(b, n, d, duree, o); }
  if(mode === 'vol' || mode === 'dos'){
    this._battre(b, 520, V);
    if(e.folle){
      /* folle : un vol en zigzag, des à-coups, la tête qui se secoue, les oreilles qui battent */
      boucle('pos', [[0, {x: 0, y: 0}], [.12, {x: -34, y: -22}], [.25, {x: 22, y: 12}], [.38, {x: -14, y: 34}], [.52, {x: 40, y: -30}], [.66, {x: -42, y: 4}], [.82, {x: 14, y: -26}], [1, {x: 0, y: 0}]], 2600, {vitesse: 1, e: 'cubic-bezier(.4,0,.2,1)'});
      boucle('posture', [[0, {a: 0}], [.15, {a: -16}], [.3, {a: 12}], [.5, {a: -20}], [.68, {a: 16}], [.85, {a: -8}], [1, {a: 0}]], 2600, {vitesse: 1});
      boucle('tete', [[0, {a: 0}], [.25, {a: -9}], [.5, {a: 7}], [.75, {a: -5}], [1, {a: 0}]], 520, {vitesse: 1});
      boucle('machoire', [[0, {a: 0}], [.5, {a: -8}], [1, {a: 0}]], 300, {vitesse: 1});
      boucle('oreilleD', [[0, {a: 0}], [.5, {a: -12}], [1, {a: 0}]], 240, {vitesse: 1}); boucle('oreilleF', [[0, {a: 0}], [.5, {a: 12}], [1, {a: 0}]], 260, {vitesse: 1});
      boucle('ombre', [[0, {x: 0}], [.25, {x: 22}], [.5, {x: 40}], [.66, {x: -42}], [1, {x: 0}]], 2600, {vitesse: 1});
    } else {
      /* vol sur place : petites dérives, la tête qui écoute, la mâchoire qui claque doucement */
      boucle('pos', [[0, {x: 0, y: 0}], [.25, {x: 9, y: -8}], [.5, {x: 0, y: 6}], [.75, {x: -9, y: -5}], [1, {x: 0, y: 0}]], 3800, {vitesse: 1});
      boucle('ombre', [[0, {x: 0, sx: 1}], [.25, {x: 9, sx: .96}], [.5, {x: 0, sx: 1.03}], [.75, {x: -9, sx: .97}], [1, {x: 0, sx: 1}]], 3800, {vitesse: 1});
      boucle('posture', [[0, {a: 0}], [.3, {a: 3}], [.7, {a: -3}], [1, {a: 0}]], 3800, {vitesse: 1});
      boucle('tete', [[0, {a: 0}], [.35, {a: 3}], [.7, {a: -2.5}], [1, {a: 0}]], 2800);
      boucle('machoire', [[0, {a: 0}], [.45, {a: -5}], [.6, {a: -4}], [1, {a: 0}]], 1900);
      boucle('oreilleD', [[0, {a: 0}], [.2, {a: -9}], [.45, {a: -9}], [.65, {a: 5}], [.85, {a: 5}], [1, {a: 0}]], 3400);
      boucle('oreilleF', [[0, {a: 0}], [.25, {a: 7}], [.5, {a: 7}], [.7, {a: -6}], [.9, {a: -6}], [1, {a: 0}]], 3700);
    }
    boucle('corps', [[0, {sx: 1, sy: 1}], [.5, {sx: 1.025, sy: .985}], [1, {sx: 1, sy: 1}]], 1300);
    boucle('crin', [[0, {sx: 1, sy: 1}], [.5, {sx: 1.02, sy: 1.02}], [1, {sx: 1, sy: 1}]], 1300, {delai: -200});
    boucle('queue', [[0, {a: -4}], [.5, {a: 5}], [1, {a: -4}]], 1040);
    boucle('brumeA', [[0, {sx: 1, sy: 1, a: 0}], [.5, {sx: 1.1, sy: .94, a: -2}], [1, {sx: 1, sy: 1, a: 0}]], 2300);
    boucle('brumeD', [[0, {x: 0, sx: 1}], [.5, {x: 8, sx: 1.08}], [1, {x: 0, sx: 1}]], 2900);
    boucle('bave', [[0, {sy: 1}], [.6, {sy: 1.4}], [1, {sy: 1}]], 1700);
    if(!e.folle) this._ondes(true);
  } else {
    /* au sol */
    if(e.colle){
      /* collée : elle se débat, les pattes gigotent, les ailes tirent sur la colle */
      boucle('posture', [[0, {a: 0}], [.25, {a: 5}], [.5, {a: -2}], [.75, {a: 6}], [1, {a: 0}]], 520);
      boucle('piedG', [[0, {a: 0}], [.5, {a: 34}], [1, {a: 0}]], 260); boucle('piedD', [[0, {a: 0}], [.5, {a: -34}], [1, {a: 0}]], 300);
      boucle('aileD', [[0, {a: 0}], [.3, {a: -7}], [.6, {a: 2}], [1, {a: 0}]], 440); boucle('aileF', [[0, {a: 0}], [.35, {a: 7}], [.7, {a: -2}], [1, {a: 0}]], 470);
      boucle('tete', [[0, {a: 0}], [.3, {a: 8}], [.6, {a: -6}], [1, {a: 0}]], 600);
      boucle('machoire', [[0, {a: 0}], [.5, {a: -10}], [1, {a: 0}]], 360);
      boucle('oreilleD', [[0, {a: 0}], [.5, {a: 10}], [1, {a: 0}]], 400); boucle('oreilleF', [[0, {a: 0}], [.5, {a: -10}], [1, {a: 0}]], 430);
    } else {
      /* sonnée : elle respire fort, la tête dodeline, une aile tressaille */
      boucle('corps', [[0, {sx: 1, sy: 1}], [.5, {sx: 1.04, sy: .97}], [1, {sx: 1, sy: 1}]], 1100);
      boucle('tete', [[0, {a: 0, y: 0}], [.5, {a: -6, y: 2}], [1, {a: 0, y: 0}]], 2200);
      boucle('mainD', [[0, {a: 0}], [.1, {a: 5}], [.2, {a: 0}], [1, {a: 0}]], 2600);
      boucle('mainF', [[0, {a: 0}], [.55, {a: 0}], [.62, {a: -5}], [.7, {a: 0}], [1, {a: 0}]], 3100);
      boucle('oreilleD', [[0, {a: 0}], [.5, {a: -5}], [1, {a: 0}]], 2400); boucle('oreilleF', [[0, {a: 0}], [.5, {a: 4}], [1, {a: 0}]], 2600);
      boucle('machoire', [[0, {a: 0}], [.5, {a: -4}], [1, {a: 0}]], 1100);
      boucle('piedG', [[0, {a: 0}], [.8, {a: 0}], [.86, {a: 18}], [.92, {a: 0}], [1, {a: 0}]], 2900);
    }
  }
  if(e.enrage) boucle('secousse', [[0, {x: 0}], [.5, {x: 2}], [1, {x: 0}]], 110, {vitesse: 1});
  else if(e.cible) boucle('secousse', [[0, {x: 0}], [.5, {x: 1}], [1, {x: 0}]], 220, {vitesse: 1});
  this._planifier(600);
};
/* les ondes de l'écholocation : elles partent de la gueule, toutes les deux secondes */
R._ondes = function(on){
  this._couperX('onde');
  if(!on) return;
  for(var i = 0; i < 4; i++){
    var a = .06 + i * .07;
    this._boucleX('onde' + i, [{offset: 0, opacity: 0, transform: 'scale(.6)'}, {offset: a, opacity: 0, transform: 'scale(.6)'}, {offset: a + .1, opacity: 1, transform: 'scale(.95)'}, {offset: a + .3, opacity: 0, transform: 'scale(1.25)'}, {offset: 1, opacity: 0, transform: 'scale(1.25)'}], 2400, {e: 'linear'});
  }
};
R._cris = function(on){
  this._couperX('cri'); this._couperX('aura');
  this._fondu('cri', on ? 1 : 0, on ? 120 : 200);
  this._fondu('aura', on ? 1 : 0, on ? 200 : 300);
  if(on) this._boucleX('aura', [{transform: 'scale(.9)', opacity: .55}, {transform: 'scale(1.1)', opacity: 1}], 380, {dir: 'alternate', e: 'ease-in-out'});
  if(!on) return;
  for(var i = 0; i < 3; i++) this._boucleX('cri' + i, [{offset: 0, opacity: 0, transform: 'scale(.5)'}, {offset: .1 + i * .08, opacity: 1, transform: 'scale(.9)'}, {offset: .45 + i * .08, opacity: 0, transform: 'scale(1.35)'}, {offset: 1, opacity: 0, transform: 'scale(1.35)'}], 900, {e: 'ease-out'});
};
R._planifier = function(ms){ var self = this; this._minuteur(function(){ if(self.enAction || self.mort || !self.attente) return; self._evenement(); self._planifier(hasard(1000, 2400) / (self.etat.folle ? 1.6 : 1)); }, ms); };
R._evenement = function(){
  var self = this, A = {ajout: true}, e = this.etat, mode = this._mode(), l;
  if(mode === 'sol') l = ['tressaille', 'tressaille', 'gemit', 'bave'];
  else if(mode === 'solColle') l = ['tire', 'tire', 'gemit'];
  else if(e.folle) l = ['hurle', 'hurle', 'secoue', 'plonge'];
  else l = ['ecoute', 'ecoute', 'cri', 'plonge', 'secoue', 'bave', 'claque', 'regarde'];
  var ev = choisir(l);
  if(ev === 'ecoute'){
    /* elle tend l'oreille : les deux oreilles pivotent du même côté, la tête suit */
    var sgn = choisir([-1, 1]);
    this._seq([{t: 0, p: {oreilleD: {a: 0}, oreilleF: {a: 0}, tete: {a: 0}}}, {t: .2, p: {oreilleD: {a: 16 * sgn}, oreilleF: {a: 14 * sgn}, tete: {a: 5 * sgn}}, e: 'cubic-bezier(.2,.9,.3,1)'}, {t: .7, p: {oreilleD: {a: 14 * sgn}, oreilleF: {a: 12 * sgn}, tete: {a: 4 * sgn}}}, {t: 1, p: {oreilleD: {a: 0}, oreilleF: {a: 0}, tete: {a: 0}}}], 1300, A);
  } else if(ev === 'cri') this._crier(.8);
  else if(ev === 'plonge') this._seq([{t: 0, p: {pos: {y: 0}, aileD: {a: 0}, aileF: {a: 0}}}, {t: .35, p: {pos: {y: 26}, aileD: {a: 24}, aileF: {a: -24}}, e: 'ease-in'}, {t: 1, p: {pos: {y: 0}, aileD: {a: 0}, aileF: {a: 0}}, e: 'ease-out'}], 800, A);
  else if(ev === 'secoue') this._seq([{t: 0, p: {tete: {a: 0}, oreilleD: {a: 0}, oreilleF: {a: 0}}}, {t: .2, p: {tete: {a: -8}, oreilleD: {a: -12}, oreilleF: {a: -10}}}, {t: .4, p: {tete: {a: 7}, oreilleD: {a: 12}, oreilleF: {a: 10}}}, {t: .6, p: {tete: {a: -5}, oreilleD: {a: -8}}}, {t: .8, p: {tete: {a: 3}, oreilleD: {a: 6}}}, {t: 1, p: {tete: {a: 0}, oreilleD: {a: 0}, oreilleF: {a: 0}}}], 600, A);
  else if(ev === 'bave') this._baveGoutte();
  else if(ev === 'claque') this._seq([{t: 0, p: {machoire: {a: 0}}}, {t: .35, p: {machoire: {a: -14}}}, {t: .5, p: {machoire: {a: 10}}, e: 'cubic-bezier(.6,0,.9,.5)'}, {t: .7, p: {machoire: {a: -4}}}, {t: 1, p: {machoire: {a: 0}}}], 520, A);
  else if(ev === 'regarde') this._seq([{t: 0, p: {tete: {a: 0, x: 0}}}, {t: .3, p: {tete: {a: -7, x: -3}}}, {t: .7, p: {tete: {a: -6, x: -3}}}, {t: 1, p: {tete: {a: 0, x: 0}}}], 1400, A);
  else if(ev === 'hurle'){ this._crier(1.1, true); this._seq([{t: 0, p: {machoire: {a: 0}}}, {t: .2, p: {machoire: {a: -12}}}, {t: .8, p: {machoire: {a: -10}}}, {t: 1, p: {machoire: {a: 0}}}], 700, A); }
  else if(ev === 'tressaille') this._seq([{t: 0, p: {aileD: {a: 0}, mainD: {a: 0}, piedD: {a: 0}}}, {t: .15, p: {aileD: {a: 7}, mainD: {a: 10}, piedD: {a: -16}}}, {t: .3, p: {aileD: {a: 0}, mainD: {a: 0}, piedD: {a: 0}}}, {t: .45, p: {aileD: {a: 4}, mainD: {a: 6}}}, {t: 1, p: {aileD: {a: 0}, mainD: {a: 0}, piedD: {a: 0}}}], 900, A);
  else if(ev === 'gemit'){ this._seq([{t: 0, p: {machoire: {a: 0}, tete: {a: 0}}}, {t: .3, p: {machoire: {a: -10}, tete: {a: 4}}}, {t: 1, p: {machoire: {a: 0}, tete: {a: 0}}}], 1000, A); var q = this._ou('bouche'); this._bulle([q[0] - 8, q[1] - 6]); }
  else if(ev === 'tire') this._seq([{t: 0, p: {aileD: {a: 0}, aileF: {a: 0}, posture: {a: 0}}}, {t: .25, p: {aileD: {a: -14}, aileF: {a: 14}, posture: {a: -5}}}, {t: .5, p: {aileD: {a: 2}, aileF: {a: -2}, posture: {a: 3}}}, {t: .75, p: {aileD: {a: -10}, aileF: {a: 10}}}, {t: 1, p: {aileD: {a: 0}, aileF: {a: 0}, posture: {a: 0}}}], 700, A);
};

/* =====================================================================
   6. Petits effets
   ===================================================================== */
R._crier = function(k, rouge){
  /* un grand cri : la gueule s'ouvre, les ondes partent en grand */
  var self = this, p = this._ou('bouche');
  for(var i = 0; i < 3; i++){
    var r = 26 + i * 18, a = arcD([0, 0], r, 2.4, 3.9);
    this._vole(L(a, rouge ? '#ff4a3a' : '#8fe8ff', 10, op(.3)) + L(a, O, 5, op(.6)) + L(a, rouge ? '#ffd0b0' : '#e8fcff', 2.6), [{transform: T(p[0], p[1], .4), opacity: 0}, {offset: .25, opacity: 1, transform: T(p[0], p[1], .9 * k)}, {transform: T(p[0] - 10, p[1], 1.5 * k), opacity: 0}], {duree: 700, delai: i * 120});
  }
  this._seq([{t: 0, p: {machoire: {a: 0}, oreilleD: {a: 0}, oreilleF: {a: 0}}}, {t: .2, p: {machoire: {a: -16 * k}, oreilleD: {a: -8}, oreilleF: {a: -6}}, e: 'cubic-bezier(.2,.9,.3,1)'}, {t: .75, p: {machoire: {a: -14 * k}}}, {t: 1, p: {machoire: {a: 0}, oreilleD: {a: 0}, oreilleF: {a: 0}}}], 800, {ajout: true});
};
R._baveGoutte = function(){
  var self = this;
  this._seq([{t: 0, p: {bave: {sy: 1}}}, {t: .75, p: {bave: {sy: 2.2, sx: .8}}, e: 'ease-in'}, {t: .85, p: {bave: {sy: .6, sx: 1}}}, {t: 1, p: {bave: {sy: 1, sx: 1}}}], 1000, {ajout: true});
  setTimeout(function(){ if(self.mort) return; var p = self._ou('baveBout'); self._vole('<path d="M0 -4 C 2 -1 3 1 3 2.5 C 3 4.5 -3 4.5 -3 2.5 C -3 1 -2 -1 0 -4 Z" fill="#d8eaff" stroke="' + O + '" stroke-width="1"/>', [{transform: T(p[0], p[1])}, {transform: T(p[0] - 6, SOL - 4), opacity: .8}], {duree: Math.sqrt(Math.max(40, SOL - p[1])) * 34, e: 'cubic-bezier(.5,0,1,1)'}); }, 760);
};
R._bulle = function(p){ this._vole('<circle r="6" fill="#d8e8ff" fill-opacity=".25" stroke="#eef6ff" stroke-width="1.6"/><circle cx="-2" cy="-2" r="1.8" fill="#fff"/>', [{transform: T(p[0], p[1], .3), opacity: 0}, {offset: .2, opacity: 1}, {transform: T(p[0] - 14, p[1] - 30, 1.2), opacity: 0}], {duree: 900}); };
R._bouffee = function(p, o){
  o = o || {};
  var r = o.r || 10;
  return this._vole('<circle r="' + r + '" fill="' + (o.c || '#9c94c8') + '" fill-opacity="' + (o.o || .5) + '"/><circle cx="' + f1(-r * .3) + '" cy="' + f1(-r * .3) + '" r="' + f1(r * .5) + '" fill="#e8e4f8" fill-opacity=".3"/>',
    [{transform: T(p[0], p[1], o.s0 || .4), opacity: 0}, {offset: .15, opacity: 1}, {transform: T(p[0] + (o.dx || 0), p[1] + (o.dy == null ? -24 : o.dy), o.s1 || 1.6), opacity: 0}], {duree: o.duree || 900, delai: o.delai, e: 'cubic-bezier(.2,.7,.4,1)'});
};
R._eclat = function(p, k, coul){ k = k || 1; this._vole('<path d="' + etoileD(26 * k, 8, .42) + '" fill="' + (coul || '#fff6c0') + '" stroke="' + O + '" stroke-width="2.4"/><path d="' + etoileD(11 * k, 8, .5) + '" fill="#ffffff"/>', [{transform: T(p[0], p[1], .3, 0), opacity: 1}, {offset: .3, transform: T(p[0], p[1], 1.1, 10)}, {transform: T(p[0], p[1], 1.3, 20), opacity: 0}], {duree: 400}); };
R._etincelles = function(p, n, coul, k){
  for(var i = 0; i < n; i++){
    var a = Math.random() * Math.PI * 2, v = hasard(30, 80) * (k || 1), l = hasard(6, 12);
    this._vole(L('M0 0 L ' + f1(-Math.cos(a) * l) + ' ' + f1(-Math.sin(a) * l), choisir(coul || ['#fff4b0', '#ffd060', '#ffffff']), 2.6), [{transform: T(p[0], p[1]), opacity: 1}, {transform: T(p[0] + Math.cos(a) * v, p[1] + Math.sin(a) * v + 16), opacity: 0}], {duree: hasard(350, 650), e: 'cubic-bezier(.1,.7,.4,1)'});
  }
};
/* trois griffures blanches au point visé */
R._griffes = function(p, k){
  var g = '';
  for(var i = 0; i < 3; i++) g += L('M' + f1(-22 + i * 9) + ' ' + f1(-24) + ' C ' + f1(-14 + i * 9) + ' -6 ' + f1(-8 + i * 9) + ' 6 ' + f1(-12 + i * 9) + ' 26', O, 7) + L('M' + f1(-22 + i * 9) + ' ' + f1(-24) + ' C ' + f1(-14 + i * 9) + ' -6 ' + f1(-8 + i * 9) + ' 6 ' + f1(-12 + i * 9) + ' 26', '#ffffff', 3.2);
  this._vole(g, [{transform: T(p[0], p[1], .4 * (k || 1), -20), opacity: 1}, {offset: .25, transform: T(p[0], p[1], 1.05 * (k || 1), -20), opacity: 1}, {transform: T(p[0], p[1] + 6, 1.1 * (k || 1), -20), opacity: 0}], {duree: 560});
};
R._flash = function(nom, o, ms){
  var base = (nom === 'flashG' && this.etat.gele) ? 0 : 0;
  (this.V[nom || 'flash'] || []).forEach(function(e){ e.getAnimations().forEach(function(a){ a.cancel(); }); e.setAttribute('opacity', base); e.removeAttribute('visibility'); e.animate([{opacity: o || .8}, {opacity: base}], {duration: ms || 320, easing: 'steps(3, end)'}).finished.then(function(){ if(+e.getAttribute('opacity') <= 0) e.setAttribute('visibility', 'hidden'); }, function(){}); });
};
R._etoiles = function(nom, on){
  var px = nom === 'sonne' ? 'so' : 'et', n = nom === 'sonne' ? 4 : 4;
  this._couperX(px);
  if(!on){ this._fondu(nom, 0, 200); return; }
  this._fondu(nom, 1, 200);
  for(var k = 0; k < n; k++){
    var fr = [], rx = nom === 'sonne' ? 74 : 86, ry = nom === 'sonne' ? 18 : 22;
    for(var s = 0; s <= 12; s++){ var a = s / 12 * Math.PI * 2 + k * Math.PI * 2 / n, d = Math.sin(a); fr.push({transform: T(Math.cos(a) * rx, d * ry, f1(.7 + d * .3), (nom === 'sonne' ? -s : s) * 30), opacity: fo(.55 + d * .45)}); }
    this._boucleX(px + k, fr, nom === 'sonne' ? 1500 : 1200);
  }
};
R._feu = function(on){
  this._couperX('fl');
  this._fondu('feu', on ? 1 : 0, 250);
  if(on) for(var k = 0; k < 4; k++) this._boucleX('fl' + k, [{transform: 'scale(1,1)'}, {offset: .4, transform: 'scale(.86,1.2)'}, {transform: 'scale(1.06,.9)'}], 280 + k * 50, {dir: 'alternate', e: 'ease-in-out', delai: -k * 90});
};
R._majOuvert = function(){
  var on = this.etat.ouvert || (this.etat['au-sol'] && !this.mort);
  if(on === !!this._pfOn) return;
  this._pfOn = on;
  this._couperX('pf');
  this._fondu('ouvert', on ? 1 : 0, 300);
  if(on) this._boucleX('pf', [{transform: 'scale(.8)', opacity: 1}, {transform: 'scale(1.35)', opacity: .2}], 760, {e: 'ease-out'});
};

/* =====================================================================
   7. Les actions
   ===================================================================== */
R._debutAction = function(){ this.jeton++; this.reprise = (this.reprise || 0) + 1; this.enAction = true; this._couperBoucles(); this._ondes(false); return this.jeton; };
R._finAction = function(j, d){ if(j !== this.jeton || this.mort) return Promise.resolve(); this.enAction = false; return this._reprendre(d); };
/* les poses du piqué */
var REPLIE = {aileD: {a: 50, sx: .55, sy: .9}, mainD: {a: 56}, aileF: {a: -50, sx: .55, sy: .9}, mainF: {a: -56}, oreilleD: {a: 20}, oreilleF: {a: 16}, piedG: {a: 30}, piedD: {a: 26}, queue: {a: -10}};
var FREIN = {aileD: {a: -14, sx: 1.06, sy: 1.02}, mainD: {a: -16}, aileF: {a: 14, sx: 1.06, sy: 1.02}, mainF: {a: 16}, oreilleD: {a: -6}, oreilleF: {a: -6}, piedG: {a: 44}, piedD: {a: 38}};
function poseVol(){ var p = {}; ['aileD', 'mainD', 'aileF', 'mainF', 'oreilleD', 'oreilleF', 'piedG', 'piedD', 'queue', 'tete', 'machoire', 'brumeA', 'vol', 'secousse', 'corps', 'crin'].forEach(function(n){ p[n] = {x: 0, y: 0, a: 0, sx: 1, sy: 1}; }); return p; }
function melange(){ var o = {}; for(var i = 0; i < arguments.length; i++){ var a = arguments[i]; for(var n in a){ o[n] = o[n] || {}; for(var k in a[n]) o[n][k] = a[n][k]; } } return o; }
/* des battements « écrits » (pour les actions) : n battements entre t0 et t1 */
function battements(cles, t0, t1, n, ampl){
  ampl = ampl || 1;
  for(var i = 0; i < n; i++){
    var a = t0 + (t1 - t0) * i / n, b = t0 + (t1 - t0) * (i + .55) / n;
    cles.push({t: a, p: {aileD: {a: -22 * ampl, sx: .97, sy: .86}, mainD: {a: -12}, aileF: {a: 22 * ampl, sx: .97, sy: .86}, mainF: {a: 12}}});
    cles.push({t: b, p: {aileD: {a: 34 * ampl, sx: .92, sy: .78}, mainD: {a: 12}, aileF: {a: -34 * ampl, sx: .92, sy: .78}, mainF: {a: -12}}});
  }
  cles.push({t: t1, p: {aileD: {a: -22 * ampl, sx: .97, sy: .86}, mainD: {a: -12}, aileF: {a: 22 * ampl, sx: .97, sy: .86}, mainF: {a: 12}}});
  return cles;
}
function trier(cles){ return cles.sort(function(a, b){ return a.t - b.t; }); }

/* elle arrive d'en haut à droite, plonge, freine ailes grandes ouvertes */
R.entrer = function(){
  var self = this, j = this._debutAction(), T0 = 1500;
  this.el.style.visibility = '';
  var k = [{t: 0, p: {pos: {x: 560, y: -330}, posture: {a: -24}, ombre: {x: 560, sx: .4}, brumeA: {sx: 1.6, sy: .7}}},
    {t: .55, p: {pos: {x: 60, y: 50}, posture: {a: -14}, ombre: {x: 60, sx: 1}, brumeA: {sx: 1.8, sy: .7}}, e: 'cubic-bezier(.3,.1,.6,1)'},
    {t: .72, p: {pos: {x: -16, y: -14}, posture: {a: 14}, brumeA: {sx: 1.2, sy: .9}}, e: 'cubic-bezier(.2,.7,.4,1)'},
    {t: 1, p: {pos: {x: 0, y: 0}, posture: {a: 0}, ombre: {x: 0, sx: 1}, brumeA: {sx: 1, sy: 1}}, e: 'cubic-bezier(.4,0,.3,1.3)'}];
  battements(k, 0, .52, 4, .9);
  k.push({t: .62, p: FREIN.aileD ? {aileD: FREIN.aileD, mainD: FREIN.mainD, aileF: FREIN.aileF, mainF: FREIN.mainF} : {}});
  k.push({t: .72, p: {aileD: {a: -24, sx: 1.08, sy: 1.04}, aileF: {a: 24, sx: 1.08, sy: 1.04}, mainD: {a: -20}, mainF: {a: 20}}});
  battements(k, .74, 1, 2, .7);
  this._seq(trier(k), T0).fini.then(function(){});
  setTimeout(function(){ self._crier(.9); }, T0 * .7);
  for(var i = 0; i < 3; i++) (function(i){ setTimeout(function(){ if(self.mort) return; var c = self._ou('centre'); self._bouffee([c[0] + 50, c[1] + 10], {r: 14, dx: 30, dy: -6, duree: 900}); }, 150 + i * 220); })(i);
  return attendreMs(T0).then(function(){ return self._finAction(j, 220); });
};

/* le point visé (dans le repère du dessin) */
R._cible = function(o, i){
  var v = o && o.vers;
  if(Array.isArray(v)) v = v[Math.min(i, v.length - 1)];
  if(v && v.x != null) return this._versMonde(v);
  return [CENTRE[0] - 860 + (i || 0) * 120, 520];
};
/* le piqué : elle se replie, plonge en diagonale, frappe, remonte */
R.attaquer = function(nom, o){
  if(typeof nom === 'object' && nom){ o = nom; nom = null; }
  o = o || {};
  var self = this, j = this._debutAction(), folle = this.etat.folle;
  if(this.etat['au-sol']){
    /* au sol, elle ne peut que mordre ce qui est devant elle */
    var pr0 = this._seq([{t: 0, p: {}}, {t: .3, p: {tete: {a: 12}, machoire: {a: -20}}}, {t: .45, p: {tete: {a: -24, x: -10}, machoire: {a: 8}}, e: 'cubic-bezier(.6,0,.9,.5)'}, {t: 1, p: {tete: {a: -20, x: -2, y: 10}, machoire: {a: -14}}}], 800, {ajout: false}).fini.then(function(){ return self._finAction(j, 200); });
    setTimeout(function(){ if(o.onImpact) try{ o.onImpact(0); }catch(e){} }, 360);
    pr0.impact = attendreMs(360);
    return pr0;
  }
  var impactOk, impact = new Promise(function(r){ impactOk = r; });
  var suite = folle ? this._piqueFou(o, impactOk) : this._pique(o, 0, impactOk);
  var pr = suite.then(function(){ return self._finAction(j, 260); });
  pr.impact = impact;
  return pr;
};
R._pique = function(o, idx, impactOk){
  var self = this, T0 = 1700, cible = this._cible(o, idx);
  function t(ms){ return ms / T0; }
  var dx = cible[0] - CENTRE[0], dy = cible[1] - CENTRE[1];
  var phi = Math.max(-10, Math.min(52, Math.atan2(dy, -dx) * 180 / Math.PI)), nez = -phi;
  var off = rot([-64, 30], nez), P1 = [dx - off[0], dy - off[1]];
  var k = [
    {t: 0, p: {}},
    /* elle monte un peu, recule, se replie : elle vise */
    {t: t(320), p: melange(REPLIE, {pos: {x: 50, y: -60}, posture: {a: 16}, tete: {a: 8}, machoire: {a: -10}, brumeA: {sx: .8}, ombre: {x: 50, sx: .9}}), e: 'cubic-bezier(.2,.8,.3,1)'},
    {t: t(430), p: {pos: {x: 56, y: -66}, posture: {a: nez * .5}, machoire: {a: -22}, tete: {a: -4}}, e: 'ease-in-out'},
    /* le PIQUÉ */
    {t: t(640), p: {pos: {x: P1[0], y: P1[1]}, posture: {a: nez}, aileD: {a: 40, sx: .45, sy: .85}, aileF: {a: -40, sx: .45, sy: .85}, brumeA: {sx: 2.4, sy: .6}, ombre: {x: P1[0], sx: 1.3}}, e: 'cubic-bezier(.55,0,.9,.6)'},
    /* CLAC : les griffes en avant, les ailes freinent */
    {t: t(700), p: melange(FREIN, {pos: {x: P1[0] + 14, y: P1[1] - 10}, posture: {a: nez * .3 + 10}, machoire: {a: 10}, tete: {a: -10}, brumeA: {sx: 1.4, sy: .9}}), e: 'cubic-bezier(.1,.9,.3,1)'},
    {t: t(820), p: {pos: {x: P1[0] + 50, y: P1[1] - 40}, posture: {a: 18}, machoire: {a: -12}, tete: {a: 6}}, e: 'ease-out'},
    /* elle remonte à sa place en battant fort */
    {t: t(1250), p: {pos: {x: dx * .35 + 40, y: -90}, posture: {a: 6}, brumeA: {sx: 1.5, sy: .8}, ombre: {x: dx * .35 + 40, sx: .9}, piedG: {a: 0}, piedD: {a: 0}, oreilleD: {a: 0}, oreilleF: {a: 0}, machoire: {a: 0}, tete: {a: 0}}, e: 'cubic-bezier(.3,.6,.5,1)'},
    {t: 1, p: {pos: {x: 0, y: 0}, posture: {a: 0}, brumeA: {sx: 1, sy: 1}, ombre: {x: 0, sx: 1}}, e: 'cubic-bezier(.3,.6,.4,1.15)'}
  ];
  battements(k, t(830), 1, 4, 1.05);
  var s = this._seq(trier(k), T0);
  /* la brume traîne derrière elle pendant le piqué */
  [470, 540, 610].forEach(function(ms, i){ setTimeout(function(){ if(self.mort) return; var c = self._ou('centre'); self._bouffee([c[0] + 30, c[1] - 10], {r: 16 - i * 2, dx: 20, dy: -10, duree: 700, o: .45}); }, ms); });
  setTimeout(function(){
    var p = self._ou('griffe'), q = [p[0] - 10, p[1] - 30];
    self._griffes(q, 1); self._eclat([q[0] - 10, q[1] - 6], .9);
    if(o.onImpact) try{ o.onImpact(idx); }catch(e){}
    if(impactOk) impactOk();
  }, T0 * t(690));
  setTimeout(function(){ self._crier(.7); }, 380);
  return s.fini;
};
/* folle : deux piqués à la suite, désordonnés, en criant */
R._piqueFou = function(o, impactOk){
  var self = this, T0 = 2600, A = this._cible(o, 0), B = this._cible(o, 1);
  function t(ms){ return ms / T0; }
  function vise(c, j){ var dx = c[0] - CENTRE[0] + hasard(-20, 20), dy = c[1] - CENTRE[1] + hasard(-14, 14), phi = Math.max(-10, Math.min(52, Math.atan2(dy, -dx) * 180 / Math.PI)), nez = -phi, off = rot([-64, 30], nez); return {p: [dx - off[0], dy - off[1]], nez: nez, dx: dx}; }
  var a = vise(A), b = vise(B);
  if(Array.isArray(o.vers) ? false : true) b = vise([A[0] + 60, A[1] - 10]);
  var k = [
    {t: 0, p: {}},
    {t: t(260), p: melange(REPLIE, {pos: {x: 40, y: -70}, posture: {a: 22}, machoire: {a: -22}, tete: {a: 10}, ombre: {x: 40}}), e: 'cubic-bezier(.2,.8,.3,1)'},
    {t: t(320), p: {posture: {a: -10}, pos: {x: 30, y: -80}}},
    {t: t(500), p: {pos: {x: a.p[0], y: a.p[1]}, posture: {a: a.nez}, aileD: {a: 40, sx: .45, sy: .85}, aileF: {a: -40, sx: .45, sy: .85}, brumeA: {sx: 2.4, sy: .6}, ombre: {x: a.p[0]}}, e: 'cubic-bezier(.55,0,.9,.6)'},
    {t: t(560), p: melange(FREIN, {pos: {x: a.p[0] + 16, y: a.p[1] - 12}, posture: {a: 14}, machoire: {a: 10}}), e: 'cubic-bezier(.1,.9,.3,1)'},
    /* elle rebondit en vrille, dans le désordre */
    {t: t(900), p: {pos: {x: a.p[0] + 120, y: a.p[1] - 170}, posture: {a: -30}, machoire: {a: -20}, ombre: {x: a.p[0] + 120}, brumeA: {sx: 1.5}}, e: 'cubic-bezier(.2,.7,.4,1)'},
    {t: t(1080), p: melange(REPLIE, {pos: {x: a.p[0] + 170, y: a.p[1] - 150}, posture: {a: 26}, tete: {a: 12}}), e: 'ease-in-out'},
    {t: t(1240), p: {pos: {x: b.p[0], y: b.p[1]}, posture: {a: b.nez - 8}, aileD: {a: 40, sx: .45, sy: .85}, aileF: {a: -40, sx: .45, sy: .85}, brumeA: {sx: 2.2, sy: .6}, ombre: {x: b.p[0]}}, e: 'cubic-bezier(.55,0,.9,.6)'},
    {t: t(1300), p: melange(FREIN, {pos: {x: b.p[0] + 14, y: b.p[1] - 8}, posture: {a: 16}, machoire: {a: 10}}), e: 'cubic-bezier(.1,.9,.3,1)'},
    {t: t(1460), p: {pos: {x: b.p[0] + 60, y: b.p[1] - 60}, posture: {a: 22}, machoire: {a: -16}}, e: 'ease-out'},
    {t: t(2050), p: {pos: {x: 60, y: -120}, posture: {a: -14}, ombre: {x: 60}, brumeA: {sx: 1.4, sy: .8}, piedG: {a: 0}, piedD: {a: 0}, oreilleD: {a: 0}, oreilleF: {a: 0}, tete: {a: 0}}, e: 'cubic-bezier(.3,.6,.5,1)'},
    {t: 1, p: {pos: {x: 0, y: 0}, posture: {a: 0}, ombre: {x: 0, sx: 1}, brumeA: {sx: 1, sy: 1}, machoire: {a: -16}}, e: 'cubic-bezier(.3,.6,.4,1.2)'}
  ];
  battements(k, t(570), t(1060), 3, 1.1);
  battements(k, t(1470), 1, 5, 1.1);
  var s = this._seq(trier(k), T0);
  [[t(540), 0], [t(1280), 1]].forEach(function(q){ setTimeout(function(){ var p = self._ou('griffe'), z = [p[0] - 10, p[1] - 30]; self._griffes(z, 1.1); self._eclat([z[0] - 8, z[1] - 6], 1); if(o.onImpact) try{ o.onImpact(q[1]); }catch(e){} if(q[1] === 0 && impactOk) impactOk(); }, T0 * q[0]); });
  [0, 900, 1700].forEach(function(ms){ setTimeout(function(){ if(!self.mort) self._crier(1, true); }, ms); });
  return s.fini;
};

/* les réactions aux coups : l'éclat de l'arme, puis elle encaisse (elle recule, les ailes sursautent) */
R._encaisse = function(k, T0){
  var sol = this.etat['au-sol'];
  this._fondu('plisse', 1, 0);
  var self = this;
  setTimeout(function(){ if(!self.etat.ebloui) self._fondu('plisse', 0, 120); }, T0 * .55);
  return this._seq([{t: 0, p: {secousse: {x: 0, y: 0, a: 0}, aileD: {a: 0}, aileF: {a: 0}, tete: {a: 0}, machoire: {a: 0}, oreilleD: {a: 0}, oreilleF: {a: 0}, crin: {sx: 1, sy: 1}}},
    {t: .1, p: {secousse: {x: 22 * k, y: sol ? 0 : -8 * k, a: 7 * k}, aileD: {a: sol ? 8 : 24 * k}, aileF: {a: sol ? -8 : -24 * k}, tete: {a: 10 * k}, machoire: {a: -16}, oreilleD: {a: 16}, oreilleF: {a: 14}, crin: {sx: 1.08, sy: 1.08}}, e: 'cubic-bezier(.1,.9,.3,1)'},
    {t: .4, p: {secousse: {x: 8 * k, y: 0, a: -2}, aileD: {a: 6}, aileF: {a: -6}, tete: {a: -3}, machoire: {a: -6}}},
    {t: 1, p: {secousse: {x: 0, y: 0, a: 0}, aileD: {a: 0}, aileF: {a: 0}, tete: {a: 0}, machoire: {a: 0}, oreilleD: {a: 0}, oreilleF: {a: 0}, crin: {sx: 1, sy: 1}}, e: 'cubic-bezier(.4,0,.3,1.3)'}], T0, {ajout: true}).fini;
};
R.touche = function(type){
  var self = this;
  type = type || 'fleche';
  if(this.mort) return Promise.resolve();
  if(type === 'nuage') return this.tousser();
  if(type === 'bruit') return this._toucheBruit();
  if(type === 'colle') return this._toucheColle();
  if(type === 'lumiere') return this._toucheLumiere();
  if(type === 'fleche-argent') return this._toucheArgent();
  if(type === 'rebond') return this._rebond();
  if(type === 'bouclier') return this._toucheBouclier();
  var j = this._debutAction(), p = this._ou('centre'), A = {ajout: true}, T0 = 760, k = 1;
  if(!this.etat['au-sol'] && !this.etat.colle) this._battre(this._base(), 520, 1.3);
  if(type === 'fleche') this._eclat(p, 1);
  else if(type === 'fleche-lourde'){ this._eclat(p, 1.5); this._etincelles(p, 6); k = 1.5; T0 = 1000; if(!this.etat['au-sol']) this._seq([{t: 0, p: {pos: {y: 0}}}, {t: .3, p: {pos: {y: 50}}, e: 'ease-in'}, {t: 1, p: {pos: {y: 0}}, e: 'ease-in-out'}], 1000, A); }
  else if(type === 'dague'){ this._vole(L('M-26 -22 L 26 22 M26 -22 L -26 22', O, 8) + L('M-26 -22 L 26 22 M26 -22 L -26 22', '#ffffff', 4), [{transform: T(p[0], p[1], .2)}, {offset: .3, transform: T(p[0], p[1], 1)}, {transform: T(p[0], p[1], 1.1), opacity: 0}], {duree: 460}); this._etincelles(p, 5); }
  else if(type === 'feu'){ this._flash('flash', .5); if(!this.etat.brule){ this._feu(true); setTimeout(function(){ if(!self.etat.brule) self._feu(false); }, 1000); } T0 = 1000; this._crier(.9, true); }
  else if(type === 'louche'){ var q = this._ou('tete'); this._eclat([q[0] + 10, q[1] - 30], 1.2); if(!this.etat.ebloui){ this._etoiles('etoiles', true); setTimeout(function(){ if(!self.etat.ebloui) self._etoiles('etoiles', false); }, 1100); } T0 = 1100; }
  else if(type === 'huile'){
    /* l'huile alourdit ses ailes : elle s'enfonce, s'ébroue, des gouttes noires tombent */
    T0 = 1400;
    if(!this.etat['au-sol']) this._seq([{t: 0, p: {pos: {y: 0}, aileD: {a: 0}, aileF: {a: 0}}}, {t: .4, p: {pos: {y: 60}, aileD: {a: -18}, aileF: {a: 18}}, e: 'ease-in'}, {t: .55, p: {posture: {a: 8}}}, {t: .7, p: {posture: {a: -8}}}, {t: 1, p: {pos: {y: 0}, aileD: {a: 0}, aileF: {a: 0}, posture: {a: 0}}}], 1400, A);
    for(var i = 0; i < 6; i++) this._vole('<path d="M0 -6 C 3 -2 4 1 4 3 C 4 6 -4 6 -4 3 C -4 1 -3 -2 0 -6 Z" fill="#2a1e3a" stroke="#6a5a8a" stroke-width="1"/>', [{transform: T(p[0] + hasard(-120, 120), p[1] + hasard(-30, 20))}, {transform: T(p[0] + hasard(-120, 120), SOL - 4), opacity: .6}], {duree: hasard(700, 1000), delai: i * 90, e: 'cubic-bezier(.5,0,1,1)'});
  }
  else if(type === 'givre'){ this._flash('flashG', .85, 700); for(var g = 0; g < 6; g++){ var a = g / 6 * Math.PI * 2; this._vole('<path d="' + eclatD(7) + '" fill="#eaf8ff" stroke="#5a8aa8" stroke-width="1.2"/>', [{transform: T(p[0], p[1], .3)}, {transform: T(p[0] + Math.cos(a) * 70, p[1] + Math.sin(a) * 50, 1, 90), opacity: 0}], {duree: 700}); } T0 = 1000; }
  else if(type === 'acide'){ for(var b = 0; b < 6; b++) this._vole('<circle r="5" fill="#9aea4a" fill-opacity=".6" stroke="#3a6a1a" stroke-width="1.2"/>', [{transform: T(p[0] + hasard(-50, 50), p[1] + hasard(-30, 30), .2)}, {transform: T(p[0] + hasard(-50, 50), p[1] - 34, 1.3), opacity: 0}], {duree: 600, delai: b * 70}); }
  else this._eclat(p, 1);
  if(type !== 'givre' && type !== 'feu') this._flash('flash', .7);
  this._encaisse(k, T0);
  return attendreMs(T0).then(function(){ return self._finAction(j, 220); });
};
/* BONG ! le bruit la sonne : les ondes la frappent, ses oreilles vibrent, elle tombe devant */
R._toucheBruit = function(){
  var self = this, j = this._debutAction(), A = {ajout: true}, q = this._ou('oreille');
  if(this.etat['au-sol']){
    /* déjà au sol : un BONG de plus, elle tressaute */
    this._anneaux(q, 1);
    this._flash('flash', .6);
    return this._encaisse(1, 900).then(function(){ return self._finAction(j, 200); });
  }
  this._anneaux(q, 1.4);
  this._flash('flash', .75, 400);
  this._fondu('ko', 1, 120);
  /* les oreilles vibrent comme une cloche, elle est secouée, ses ailes se figent */
  var k = [{t: 0, p: {oreilleD: {a: 0}, oreilleF: {a: 0}, secousse: {x: 0, a: 0}, tete: {a: 0}, machoire: {a: 0}, aileD: {a: 0}, aileF: {a: 0}}}];
  for(var i = 1; i <= 12; i++) k.push({t: i / 14, p: {oreilleD: {a: (i % 2 ? 16 : -14) * (1 - i / 16)}, oreilleF: {a: (i % 2 ? -14 : 12) * (1 - i / 16)}, secousse: {x: (i % 2 ? 6 : -6) * (1 - i / 14), a: i % 2 ? 3 : -3}, tete: {a: i % 2 ? 6 : -6}, machoire: {a: -18}, aileD: {a: 30}, aileF: {a: -30}}, e: 'linear'});
  k.push({t: 1, p: {oreilleD: {a: 0}, oreilleF: {a: 0}, secousse: {x: 0, a: 0}, tete: {a: 0}, machoire: {a: 0}, aileD: {a: 0}, aileF: {a: 0}}});
  this._seq(k, 900, A);
  return attendreMs(900).then(function(){
    self.etat['au-sol'] = true;
    return self._tomber(false);
  }).then(function(){ self._visuelsSol(); return self._finAction(j, 200); });
};
R._anneaux = function(q, k){
  /* de grands anneaux jaunes autour de sa tête, et des éclairs de son */
  for(var i = 0; i < 3; i++) this._vole('<circle r="40" fill="none" stroke="' + O + '" stroke-width="9"/><circle r="40" fill="none" stroke="#ffe066" stroke-width="5"/>', [{transform: T(q[0], q[1] + 30, .3), opacity: 1}, {transform: T(q[0], q[1] + 30, 2.6 * k), opacity: 0}], {duree: 700, delai: i * 150, e: 'cubic-bezier(.1,.7,.3,1)'});
  var z = 'M0 0 l 10 -8 l 6 12 l 10 -10';
  for(var s = 0; s < 4; s++){ var a = -Math.PI * (.15 + s * .23), dx = Math.cos(a) * 90, dy = Math.sin(a) * 70; this._vole(L(z, O, 6) + L(z, '#ffe066', 3), [{transform: T(q[0] + dx * .5, q[1] + 30 + dy * .5, .5, a * 57), opacity: 0}, {offset: .25, opacity: 1}, {transform: T(q[0] + dx, q[1] + 30 + dy, 1.2, a * 57), opacity: 0}], {duree: 600, delai: 60 + s * 50}); }
};
/* la chute : elle ne bat plus, culbute, s'écrase devant, rebondit ; la poussière vole */
R._tomber = function(colle){
  var self = this, b = POSES[colle ? 'solColle' : 'sol'], T0 = 1150;
  var c = this._lire('pos');
  var k = [{t: 0, p: {}},
    {t: .12, p: {pos: {x: c.x - 6, y: c.y - 24}, posture: {a: 14}, aileD: {a: colle ? 60 : 50, sx: colle ? .55 : .9}, aileF: {a: colle ? -60 : -50, sx: colle ? .55 : .9}, mainD: {a: colle ? 50 : 30}, mainF: {a: colle ? -50 : -30}}, e: 'ease-out'},
    {t: .55, p: {pos: {x: SOLX * .7, y: SOLY - 30}, posture: {a: -28}, aileD: {a: colle ? 56 : 10, sx: colle ? .5 : .8, sy: .8}, aileF: {a: colle ? -56 : -10, sx: colle ? .5 : .8, sy: .8}, mainD: {a: colle ? 54 : -30}, mainF: {a: colle ? -54 : 30}, tete: {a: 12}, oreilleD: {a: 26}, oreilleF: {a: 22}, ombre: {x: SOLX * .7, sx: 1.4, sy: 1.3}}, e: 'cubic-bezier(.5,0,1,.7)'},
    {t: .68, p: {pos: {x: SOLX, y: SOLY + 6}, posture: {a: b.posture.a - 8, y: 10}, corps: {sx: 1.1, sy: .86}, aileD: b.aileD, aileF: b.aileF, mainD: b.mainD, mainF: b.mainF, tete: {a: -28, y: 14}, machoire: {a: -18}, oreilleD: {a: -40}, oreilleF: {a: 34}, piedG: b.piedG, piedD: b.piedD, ombre: b.ombre, brumeA: b.brumeA, brumeD: b.brumeD}, e: 'cubic-bezier(.6,0,1,.6)'},
    {t: .82, p: {pos: {x: SOLX + 4, y: SOLY - 16}, posture: {a: b.posture.a + 4}, corps: {sx: .98, sy: 1.04}, tete: {a: -10}}, e: 'cubic-bezier(.2,.7,.4,1)'},
    {t: 1, p: b, e: 'cubic-bezier(.6,0,.9,.6)'}];
  setTimeout(function(){ self._poussiere(); }, T0 * .68);
  return this._seq(k, T0).fini;
};
R._poussiere = function(){
  var c = this._ou('centre');
  for(var i = 0; i < 6; i++){ var dx = (i - 2.5) * 34; this._bouffee([c[0] + dx * .5, SOL - 6], {r: 12, c: '#8a7e9a', o: .55, dx: dx * 1.2, dy: -18, s1: 1.8, duree: 800, delai: i * 20}); }
};
R._visuelsSol = function(){ var e = this.etat; this._fondu('ko', e['au-sol'] && !e.colle ? 1 : 0, 150); this._etoiles('sonne', e['au-sol'] && !e.colle); this._majOuvert(); };
/* l'envol : elle secoue la tête, bat des ailes très fort et remonte à sa place */
R._envol = function(){
  var self = this, T0 = 1300;
  this._fondu('ko', 0, 200); this._etoiles('sonne', false); this._majOuvert();
  var k = [{t: 0, p: {}}, {t: .18, p: {tete: {a: 8}, oreilleD: {a: 10}, oreilleF: {a: -8}, posture: {a: 0, y: 0}}}, {t: .28, p: {tete: {a: -8}}},
    {t: .38, p: {tete: {a: 0, x: 0, y: 0}, machoire: {a: -8}, oreilleD: {a: 0}, oreilleF: {a: 0}, corps: {sx: 1, sy: 1}, crin: {sx: 1, sy: 1}, piedG: {a: 0}, piedD: {a: 0}, queue: {a: 0}, pos: {x: SOLX, y: SOLY - 20}}},
    {t: 1, p: {pos: {x: 0, y: 0}, posture: {a: 0}, ombre: {x: 0, sx: 1, sy: 1}, brumeA: {sx: 1, sy: 1, y: 0}, brumeD: {sx: 1, sy: 1, y: 0}, machoire: {a: 0}}, e: 'cubic-bezier(.3,.5,.4,1)'}];
  battements(k, .3, 1, 5, 1.1);
  setTimeout(function(){ self._poussiere(); }, T0 * .35);
  return this._seq(trier(k), T0).fini;
};
/* la colle : des pâtés sur les ailes, elles se replient, collées ; elle tombe en se débattant */
R._toucheColle = function(){
  var self = this, j = this._debutAction(), p = this._ou('centre');
  for(var i = 0; i < 3; i++) this._vole('<path d="M-16 4 C -18 -8 -6 -14 2 -12 C 12 -14 18 -4 14 4 C 10 12 -10 12 -16 4 Z" fill="#d0e05a" stroke="#5a6420" stroke-width="1.6"/>', [{transform: T(p[0] - 120 + i * 90, p[1] - 30 + i * 10, .2)}, {offset: .3, transform: T(p[0] - 120 + i * 90, p[1] - 30 + i * 10, 1.4)}, {transform: T(p[0] - 120 + i * 90, p[1] - 20 + i * 10, 1), opacity: 0}], {duree: 700, delai: i * 60});
  this.etat.colle = true;
  this._fondu('colle', 1, 200);
  this._fondu('plisse', 1, 0);
  if(this.etat['au-sol']) return this._reprendre(400).then(function(){ self._fondu('plisse', 0, 200); self._visuelsSol(); return self._finAction(j, 200); });
  /* les ailes se referment d'un coup, elle se débat en l'air, puis tombe */
  var k = [{t: 0, p: {}}, {t: .25, p: {aileD: {a: 62, sx: .5, sy: .88}, mainD: {a: 56}, aileF: {a: -62, sx: .5, sy: .88}, mainF: {a: -56}, machoire: {a: -20}, posture: {a: 8}}, e: 'cubic-bezier(.2,.9,.3,1)'}];
  for(var n = 0; n < 5; n++) k.push({t: .3 + n * .14, p: {posture: {a: n % 2 ? -10 : 10}, aileD: {a: n % 2 ? 54 : 64}, aileF: {a: n % 2 ? -54 : -64}, piedG: {a: n % 2 ? 30 : -10}, piedD: {a: n % 2 ? -30 : 10}, pos: {y: n * 8}}});
  k.push({t: 1, p: {posture: {a: 0}}});
  return this._seq(k, 900).fini.then(function(){
    self.etat['au-sol'] = true;
    return self._tomber(true);
  }).then(function(){ self._fondu('plisse', 0, 200); self._visuelsSol(); return self._finAction(j, 200); });
};
/* la lumière : elle hurle, les yeux fous ; elle devient FOLLE (c'est un piège) */
R._toucheLumiere = function(){
  var self = this, j = this._debutAction(), A = {ajout: true}, c = this._ou('tete');
  this._flash('flash', .95, 500);
  this._vole('<circle r="60" fill="' + this.D.doux('#fffbe0', .9) + '"/>', [{transform: T(c[0], c[1], .2), opacity: 1}, {transform: T(c[0], c[1], 2.2), opacity: 0}], {duree: 600});
  var auSol = this.etat['au-sol'];
  this.etat['au-sol'] = false;
  this.etat.folle = true;
  this._fondu('folle', 1, 160);
  var go = auSol ? this._envol() : Promise.resolve();
  return go.then(function(){
    self._crier(1.3, true);
    setTimeout(function(){ self._crier(1.2, true); }, 420);
    var k = [{t: 0, p: {tete: {a: 0}, machoire: {a: 0}, posture: {a: 0}, oreilleD: {a: 0}, oreilleF: {a: 0}, aileD: {a: 0}, aileF: {a: 0}}}];
    for(var i = 1; i <= 8; i++) k.push({t: i / 9, p: {tete: {a: i % 2 ? 12 : -12}, machoire: {a: -22}, posture: {a: i % 2 ? 8 : -8}, oreilleD: {a: i % 2 ? -18 : 14}, oreilleF: {a: i % 2 ? 16 : -12}, aileD: {a: i % 2 ? 30 : -10}, aileF: {a: i % 2 ? -30 : 10}}, e: 'linear'});
    k.push({t: 1, p: {tete: {a: 0}, machoire: {a: 0}, posture: {a: 0}, oreilleD: {a: 0}, oreilleF: {a: 0}, aileD: {a: 0}, aileF: {a: 0}}});
    self._battre(self._base(), 520, 1.8);
    self._seq(k, 1100, A);
    return attendreMs(1100);
  }).then(function(){ self._visuelsSol(); self._cris(true); return self._finAction(j, 200); });
};
/* la flèche d'argent : elle la SENT. Une traînée argentée la traverse, elle se cabre, ailes dressées, poils hérissés */
R._toucheArgent = function(){
  var self = this, j = this._debutAction(), A = {ajout: true}, p = this._ou('centre'), sol = this.etat['au-sol'];
  if(!sol && !this.etat.colle) this._battre(this._base(), 520, 1.5);
  /* la traînée : un long trait argenté qui file de gauche à droite et la traverse */
  var tr = '<path d="M-260 0 L 0 -3 L 40 0 L 0 3 Z" fill="#e8f0ff" stroke="#8a9ac8" stroke-width="1.4"/><path d="M-200 0 L 0 -1.2 L 30 0 L 0 1.2 Z" fill="#ffffff"/>';
  this._vole(tr, [{transform: T(p[0] - 240, p[1] + 10, null, -4) + ' scale(.3,1)', opacity: 0}, {offset: .2, opacity: 1}, {offset: .55, transform: T(p[0] + 60, p[1] - 6, null, -4) + ' scale(1,1)', opacity: 1}, {transform: T(p[0] + 240, p[1] - 18, null, -4) + ' scale(.6,.6)', opacity: 0}], {duree: 520, e: 'cubic-bezier(.3,.6,.4,1)'});
  setTimeout(function(){
    self._eclat(p, 1.1, '#eef4ff');
    var sc = '';
    for(var i = 0; i < 6; i++){ var a = i / 6 * Math.PI * 2; sc += '<g transform="translate(' + f1(Math.cos(a) * 34) + ' ' + f1(Math.sin(a) * 34) + ')"><path d="' + eclatD(9) + '" fill="#ffffff" stroke="#8a9ac8" stroke-width="1"/></g>'; }
    self._vole(sc, [{transform: T(p[0], p[1], .3, 0), opacity: 1}, {offset: .4, transform: T(p[0], p[1], 1.2, 30), opacity: 1}, {transform: T(p[0], p[1], 1.5, 60), opacity: 0}], {duree: 900});
    /* une poussière d'argent qui retombe lentement sur elle */
    for(var d = 0; d < 6; d++) self._vole('<path d="' + eclatD(5) + '" fill="#f4f8ff"/>', [{transform: T(p[0] + hasard(-90, 90), p[1] + hasard(-70, -20), .4), opacity: 0}, {offset: .2, opacity: 1}, {transform: T(p[0] + hasard(-90, 90), p[1] + hasard(30, 80), 1, 180), opacity: 0}], {duree: hasard(1200, 1600), delai: d * 80, e: 'ease-in-out'});
    self._crier(1.1);
  }, 220);
  this._flash('flash', .8, 380);
  this._fondu('plisse', 1, 0);
  setTimeout(function(){ if(!self.etat.ebloui) self._fondu('plisse', 0, 200); }, 900);
  var c = sol ? [{t: 0, p: {posture: {a: 0}, tete: {a: 0}, machoire: {a: 0}, oreilleD: {a: 0}, oreilleF: {a: 0}, crin: {sx: 1, sy: 1}, corps: {sx: 1, sy: 1}, aileD: {a: 0}, aileF: {a: 0}}},
      {t: .2, p: {posture: {a: 14}, tete: {a: 22}, machoire: {a: -24}, oreilleD: {a: 30}, oreilleF: {a: 26}, crin: {sx: 1.18, sy: 1.16}, corps: {sx: 1.06, sy: 1.08}, aileD: {a: 24}, aileF: {a: -24}}, e: 'cubic-bezier(.1,.9,.3,1)'},
      {t: .6, p: {posture: {a: 10}, tete: {a: 18}, crin: {sx: 1.12, sy: 1.1}}}, {t: 1, p: {posture: {a: 0}, tete: {a: 0}, machoire: {a: 0}, oreilleD: {a: 0}, oreilleF: {a: 0}, crin: {sx: 1, sy: 1}, corps: {sx: 1, sy: 1}, aileD: {a: 0}, aileF: {a: 0}}, e: 'cubic-bezier(.4,0,.3,1.2)'}]
    : [{t: 0, p: {pos: {x: 0, y: 0}, posture: {a: 0}, tete: {a: 0}, machoire: {a: 0}, oreilleD: {a: 0}, oreilleF: {a: 0}, crin: {sx: 1, sy: 1}, corps: {sx: 1, sy: 1}, aileD: {a: 0}, aileF: {a: 0}, mainD: {a: 0}, mainF: {a: 0}}},
      /* elle se CABRE : le nez en l'air, les ailes dressées tout en haut, la fourrure hérissée */
      {t: .2, p: {pos: {x: 34, y: -34}, posture: {a: 32}, tete: {a: 20}, machoire: {a: -26}, oreilleD: {a: 34}, oreilleF: {a: 30}, crin: {sx: 1.2, sy: 1.18}, corps: {sx: 1.06, sy: 1.08}, aileD: {a: 52, sx: .96}, aileF: {a: -52, sx: .96}, mainD: {a: 18}, mainF: {a: -18}}, e: 'cubic-bezier(.1,.9,.3,1)'},
      {t: .45, p: {pos: {x: 30, y: -30}, posture: {a: 28}, tete: {a: 16}, aileD: {a: 46}, aileF: {a: -46}}},
      {t: .58, p: {posture: {a: 22}, tete: {a: 10}, aileD: {a: 40}, aileF: {a: -40}}},
      {t: 1, p: {pos: {x: 0, y: 0}, posture: {a: 0}, tete: {a: 0}, machoire: {a: 0}, oreilleD: {a: 0}, oreilleF: {a: 0}, crin: {sx: 1, sy: 1}, corps: {sx: 1, sy: 1}, aileD: {a: 0}, aileF: {a: 0}, mainD: {a: 0}, mainF: {a: 0}}, e: 'cubic-bezier(.4,0,.3,1.15)'}];
  this._seq(c, 1500, A);
  return attendreMs(1500).then(function(){ return self._finAction(j, 220); });
};
/* le bouclier de runes : elle s'y cogne en piquant, rebondit, étourdie */
R._toucheBouclier = function(){
  var self = this, j = this._debutAction(), A = {ajout: true}, c = this._ou('tete'), sol = this.etat['au-sol'];
  var mur = [c[0] - 90, c[1] + 30];
  var rune = '<circle r="58" fill="' + this.D.doux('#8ff3ff', .45) + '"/><circle r="50" fill="none" stroke="#8ff3ff" stroke-width="4"/><circle r="40" fill="none" stroke="#d8fdff" stroke-width="1.6" stroke-dasharray="5 7"/>' + L('M-14 -18 L 0 -28 L 14 -18 M0 -28 L 0 20 M-16 6 L 16 6', '#e8feff', 3);
  this._vole(rune, [{transform: T(mur[0], mur[1], .6) + ' scale(.55,1)', opacity: 0}, {offset: .15, opacity: 1, transform: T(mur[0], mur[1], 1.6) + ' scale(.55,1)'}, {offset: .7, opacity: 1, transform: T(mur[0], mur[1], 1.65) + ' scale(.55,1)'}, {transform: T(mur[0], mur[1], 1.9) + ' scale(.55,1)', opacity: 0}], {duree: 1400});
  setTimeout(function(){ self._eclat([mur[0] + 6, mur[1] - 10], 1, '#d8fdff'); self._etincelles([mur[0] + 6, mur[1]], 8, ['#8ff3ff', '#ffffff', '#d8fdff']); }, 340);
  if(!sol) this._battre(this._base(), 520, 1.2);
  this._seq([{t: 0, p: {pos: {x: 0}, posture: {a: 0}, tete: {a: 0}, machoire: {a: 0}}}, {t: .2, p: {pos: {x: -40}, posture: {a: -10}, machoire: {a: -18}}, e: 'ease-in'}, {t: .26, p: {pos: {x: -30}, posture: {a: 16}, tete: {a: 18}, machoire: {a: 4}}, e: 'cubic-bezier(.1,.9,.3,1)'},
    {t: .5, p: {pos: {x: 30}, posture: {a: 8}, tete: {a: 10}}}, {t: 1, p: {pos: {x: 0}, posture: {a: 0}, tete: {a: 0}, machoire: {a: 0}}}], 1400, A);
  this._fondu('ko', 1, 0);
  setTimeout(function(){ if(!self.etat['au-sol']) self._fondu('ko', 0, 200); }, 1100);
  return attendreMs(1400).then(function(){ return self._finAction(j, 220); });
};
/* rebond : la flèche ricoche (étincelles), elle esquive en vrille et nargue d'un cri moqueur */
R._rebond = function(){
  var self = this, j = this._debutAction(), A = {ajout: true}, p = this._ou('centre');
  this._eclat([p[0] - 60, p[1] + 10], .8); this._etincelles([p[0] - 60, p[1] + 10], 10);
  var fl = L('M-22 0 L 18 0', '#8a5a2a', 3.4) + P('M18 -5 L 28 0 L 18 5 Z', '#c8d0e0', ' stroke-width="1.4"') + P('M-22 0 L -30 -6 L -26 0 L -30 6 Z', '#e8e0d0', ' stroke-width="1.2"');
  this._vole(fl, [{transform: T(p[0] - 60, p[1] + 10, null, 0)}, {offset: .45, transform: T(p[0] - 140, p[1] - 120, null, -400)}, {transform: T(p[0] - 200, SOL - 10, null, -900), opacity: 0}], {duree: 1100, e: 'cubic-bezier(.2,.6,.6,1)'});
  if(!this.etat['au-sol']){
    this._battre(this._base(), 520, 1.4);
    this._seq([{t: 0, p: {pos: {x: 0, y: 0}, posture: {a: 0}}}, {t: .15, p: {pos: {x: 26, y: -40}, posture: {a: 90}}, e: 'ease-out'}, {t: .32, p: {pos: {x: 34, y: -50}, posture: {a: 300}}}, {t: .45, p: {pos: {x: 10, y: -20}, posture: {a: 360}}, e: 'ease-out'}, {t: 1, p: {pos: {x: 0, y: 0}, posture: {a: 360}}}], 1600, A);
  }
  setTimeout(function(){ self._crier(1); }, 720);
  setTimeout(function(){ self._crier(.8); }, 1000);
  this._seq([{t: 0, p: {machoire: {a: 0}, tete: {a: 0}}}, {t: .5, p: {machoire: {a: -18}, tete: {a: -6}}}, {t: .6, p: {tete: {a: 6}}}, {t: .7, p: {tete: {a: -6}}}, {t: .8, p: {tete: {a: 6}}}, {t: 1, p: {machoire: {a: 0}, tete: {a: 0}}}], 1600, A);
  return attendreMs(1600).then(function(){ return self._finAction(j, 220); });
};
/* elle tousse trois fois, lentement : la tête plonge, la gueule s'ouvre, une bouffée grise, elle perd de l'altitude */
R.tousser = function(){
  var self = this, j = this._debutAction(), T0 = 2700, A = {ajout: true}, sol = this.etat['au-sol'];
  if(!sol && !this.etat.colle) this._battre(this._base(), 520, .8);
  var k = [{t: 0, p: {tete: {a: 0, y: 0}, machoire: {a: 0}, pos: {y: 0}, aileD: {a: 0}, aileF: {a: 0}, corps: {sx: 1, sy: 1}}}];
  [.08, .4, .72].forEach(function(t, i){
    k.push({t: t, p: {tete: {a: -16, y: 6}, machoire: {a: -22}, pos: {y: sol ? 0 : 14 + i * 8}, aileD: {a: -16}, aileF: {a: 16}, corps: {sx: 1.06, sy: .94}}, e: 'cubic-bezier(.1,.9,.3,1)'});
    k.push({t: t + .14, p: {tete: {a: -2, y: 0}, machoire: {a: -4}, pos: {y: sol ? 0 : 8 + i * 8}, aileD: {a: 0}, aileF: {a: 0}, corps: {sx: 1, sy: 1}}});
    setTimeout(function(){ if(self.mort) return; var p = self._ou('bouche'); for(var n = 0; n < 3; n++) self._bouffee([p[0] - 10 - n * 12, p[1] + 4 - n * 4], {r: 16 + n * 5, c: '#b4aec4', o: .7, dx: -40 - n * 10, dy: -16, s1: 1.9, duree: 1100, delai: n * 70}); self._fondu('plisse', 1, 0); setTimeout(function(){ self._fondu('plisse', 0, 100); }, 260); }, T0 * t + 40);
  });
  k.push({t: 1, p: {tete: {a: 0, y: 0}, machoire: {a: 0}, pos: {y: 0}, aileD: {a: 0}, aileF: {a: 0}, corps: {sx: 1, sy: 1}}});
  this._seq(k, T0, A);
  return attendreMs(T0).then(function(){ return self._finAction(j, 200); });
};
R.special = function(nom, o){
  var self = this;
  if(nom === 'tomber') return this.changerEtat('au-sol', true);
  if(nom === 'envol') return this.changerEtat('au-sol', false);
  if(nom === 'folle') return this.changerEtat('folle', true);
  var j = this._debutAction(), sol = this.etat['au-sol'];
  if(!sol && !this.etat.colle) this._battre(this._base(), 520, 1);
  if(nom === 'ecoute'){
    this._seq([{t: 0, p: {oreilleD: {a: 0}, oreilleF: {a: 0}, tete: {a: 0}}}, {t: .15, p: {oreilleD: {a: -20}, oreilleF: {a: -16}, tete: {a: -6}}, e: 'cubic-bezier(.2,.9,.3,1)'}, {t: .45, p: {oreilleD: {a: -18}, oreilleF: {a: -14}}}, {t: .6, p: {oreilleD: {a: 18}, oreilleF: {a: 16}, tete: {a: 6}}, e: 'cubic-bezier(.2,.9,.3,1)'}, {t: .85, p: {oreilleD: {a: 16}, oreilleF: {a: 14}}}, {t: 1, p: {oreilleD: {a: 0}, oreilleF: {a: 0}, tete: {a: 0}}}], 1600, {ajout: true});
    return attendreMs(1600).then(function(){ return self._finAction(j, 200); });
  }
  /* 'cri' (et par défaut) : le grand cri d'écholocation */
  this._crier(1.4, this.etat.folle);
  setTimeout(function(){ self._crier(1.2, self.etat.folle); }, 300);
  return attendreMs(1100).then(function(){ return self._finAction(j, 200); });
};
/* elle fait demi-tour et s'envole en zigzag hors de l'écran, en haut à droite */
R.fuir = function(){
  var self = this, j = this._debutAction();
  ['ebloui', 'brule', 'colle', 'enrage', 'cible', 'ouvert', 'folle'].forEach(function(n){ if(self.etat[n]) self._visuel(n, false); self.etat[n] = false; });
  var sol = this.etat['au-sol'];
  this.etat['au-sol'] = false;
  this._fondu('ko', 0, 200); this._etoiles('sonne', false); this._majOuvert();
  var go = sol ? this._envol() : Promise.resolve();
  return go.then(function(){
    var k = [{t: 0, p: {posture: {a: 0, sx: 1}}}, {t: .08, p: {pos: {x: -20, y: -30}, posture: {a: 10, sx: 1}, machoire: {a: -22}, oreilleD: {a: 24}, oreilleF: {a: 20}}, e: 'ease-out'},
      /* demi-tour */
      {t: .16, p: {posture: {a: 0, sx: -1}}, e: 'ease-in-out'},
      {t: .3, p: {pos: {x: 120, y: -90}, posture: {a: -14, sx: -1}, ombre: {x: 120, sx: .8}}, e: 'ease-in-out'}, {t: .44, p: {pos: {x: 70, y: -190}, posture: {a: 16, sx: -1}, ombre: {x: 70}}, e: 'ease-in-out'},
      {t: .58, p: {pos: {x: 260, y: -240}, posture: {a: -16, sx: -1}, ombre: {x: 260, sx: .6}}, e: 'ease-in-out'}, {t: .72, p: {pos: {x: 220, y: -360}, posture: {a: 14, sx: -1}}, e: 'ease-in-out'},
      {t: 1, p: {pos: {x: 760, y: -560}, posture: {a: -20, sx: -1}, ombre: {x: 760, sx: .2}, brumeA: {sx: 1.8, sy: .7}}, e: 'cubic-bezier(.4,0,.8,.6)'}];
    battements(k, .1, 1, 9, 1.15);
    setTimeout(function(){ self._crier(1); }, 100);
    for(var i = 0; i < 4; i++) (function(i){ setTimeout(function(){ if(self.mort) return; var c = self._ou('centre'); self._bouffee([c[0] - 20, c[1] + 10], {r: 14, dx: -20, dy: 10, duree: 800, o: .4}); }, 500 + i * 300); })(i);
    return self._seq(trier(k), 2000).fini;
  }).then(function(){ self._couperBoucles(); self.el.style.visibility = 'hidden'; self.enAction = false; self.mort = true; });
};
R.mourir = function(){ return this.fuir(); };

/* le critique : elle se raidit, enfle, et ÉCLATE en brume noire ; les lambeaux d'ailes et les touffes de poils retombent
   en voletant ; il reste au sol un petit crâne, des os de doigts et un tas de cendre */
R.exploser = function(scene){
  var self = this, j = this._debutAction(), boomOk, boomP = new Promise(function(ok){ boomOk = ok; });
  ['ebloui', 'brule', 'colle', 'enrage', 'cible', 'folle'].forEach(function(n){ if(self.etat[n]) self._visuel(n, false); self.etat[n] = false; });
  this._etoiles('sonne', false); this._fondu('ko', 0, 0);
  var sol = this.etat['au-sol'];
  var k = [{t: 0, p: {}}];
  for(var i = 1; i <= 8; i++) k.push({t: i / 9, p: {corps: {sx: 1 + i * .03, sy: 1 + i * .035}, crin: {sx: 1 + i * .04, sy: 1 + i * .04}, secousse: {x: i % 2 ? 5 : -5, a: i % 2 ? 2 : -2}, machoire: {a: -i * 3}, oreilleD: {a: i % 2 ? 8 : -8}, oreilleF: {a: i % 2 ? -8 : 8},
    aileD: sol ? {a: -30 + i * 3} : {a: 8, sx: 1 + i * .015, sy: 1 + i * .015}, aileF: sol ? {a: 28 - i * 3} : {a: -8, sx: 1 + i * .015, sy: 1 + i * .015}, mainD: {a: -10}, mainF: {a: 10}}, e: 'linear'});
  k.push({t: 1, p: {corps: {sx: 1.34, sy: 1.4}, crin: {sx: 1.4, sy: 1.4}}, e: 'ease-in'});
  this._fondu('folle', 1, 0);
  (this.V.flash || []).forEach(function(e){ e.getAnimations().forEach(function(a){ a.cancel(); }); e.removeAttribute('visibility'); e.animate([{opacity: 0}, {opacity: .3, offset: .3}, {opacity: .1, offset: .5}, {opacity: .6, offset: .8}, {opacity: .9}], {duration: 520, fill: 'forwards'}); });
  setTimeout(function(){ self._crier(1.3, true); }, 60);
  var pr = this._seq(k, 520).fini.then(function(){
    scene = scene || self.c.parentNode || self.c;
    if(getComputedStyle(scene).position === 'static') scene.style.position = 'relative';
    var sr = scene.getBoundingClientRect(), W = scene.offsetWidth || sr.width, H = scene.offsetHeight || sr.height, ech = W / (sr.width || 1);
    var cr = self.A.centre.getBoundingClientRect(), cx = (cr.left - sr.left) * ech, cy = (cr.top - sr.top) * ech, u = self._echelle().k * ech;
    var e0 = self._echelle(), solY = (e0.y0 + SOL * e0.k - sr.top) * ech;
    var ov = document.createElementNS(NS, 'svg'), id = 'btCSb' + self.num;
    ov.setAttribute('class', PX + '-scene-fx ra-scene-fx'); ov.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    ov.innerHTML = '<defs><radialGradient id="' + id + 'n"><stop offset="0" stop-color="#0c0812"/><stop offset=".55" stop-color="#1a1222" stop-opacity=".95"/><stop offset="1" stop-color="#22182c" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="' + id + 'c"><stop offset="0" stop-color="#6a5a80" stop-opacity=".7"/><stop offset="1" stop-color="#4a3e5a" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="' + id + 'g"><stop offset="0" stop-color="#fff4ff"/><stop offset=".45" stop-color="#c8a8ff" stop-opacity=".85"/><stop offset="1" stop-color="#6a3aa8" stop-opacity="0"/></radialGradient></defs>';
    scene.appendChild(ov);
    function g(html, frames, o){ var e = document.createElementNS(NS, 'g'); e.innerHTML = html; ov.appendChild(e); var a = e.animate(frames, {duration: o.d, delay: o.dl || 0, easing: o.e || 'ease-out', fill: 'both'}); if(o.retirer !== false) a.finished.then(function(){ e.remove(); }, function(){}); return a; }
    self._fondu('bete', 0, 0);
    boomOk();
    /* la brume noire (7 nuages), qui reste un moment puis monte et se dissipe */
    var brumes = [];
    for(var n = 0; n < 7; n++){ var a = n / 7 * Math.PI * 2 + hasard(-.3, .3), r = hasard(36, 54) * u * 2.2, dx = Math.cos(a) * 70 * u * 2, dy = Math.sin(a) * 40 * u * 2 - 20 * u;
      brumes.push(g('<circle r="' + f1(r) + '" fill="url(#' + id + 'n)"/><circle cx="' + f1(-r * .25) + '" cy="' + f1(-r * .3) + '" r="' + f1(r * .6) + '" fill="url(#' + id + 'c)"/>', [{transform: T(cx, cy, .15), opacity: 0}, {offset: .06, opacity: 1, transform: T(cx + dx * .5, cy + dy * .5, 1)}, {offset: .55, opacity: .85, transform: T(cx + dx, cy + dy - 30 * u, 1.4)}, {transform: T(cx + dx * 1.3, cy + dy - 90 * u, 1.9), opacity: 0}], {d: hasard(3200, 4000), e: 'cubic-bezier(.12,.75,.3,1)', retirer: false})); }
    /* les lambeaux d'aile : ils volent, puis retombent en se balançant comme des feuilles mortes */
    var lb = ['M-20 -12 L 20 -16 Q 8 -2 14 16 L 6 10 L 2 18 L -4 9 L -10 15 L -12 4 L -20 6 Z', 'M-18 -14 L 22 -8 Q 6 0 6 18 L 0 11 L -6 17 L -8 6 L -16 9 L -14 -2 Z', 'M-22 -10 L 16 -18 Q 10 2 20 12 L 10 12 L 6 20 L 0 10 L -8 16 L -10 4 L -20 4 Z'];
    for(var l = 0; l < 6; l++){
      var al = -Math.PI * (.12 + l * .15), vl = hasard(110, 190) * u, x1 = cx + Math.cos(al) * vl, y1 = cy + Math.sin(al) * vl * .8, xs = choisir([-1, 1]) * hasard(30, 60) * u, fond = solY - hasard(2, 10) * u;
      var mb = choisir(['#3d2a50', '#30213f', '#4a3560']), ech2 = f1(u * hasard(1.6, 2.4));
      var lbk = choisir([0, 1, 2]), os1 = [['M-20 -12 L 20 -16', 'M-4 -12 L 10 8'], ['M-18 -14 L 22 -8', 'M2 -10 L -2 10'], ['M-22 -10 L 16 -18', 'M-2 -13 L 12 8']][lbk];
      g('<g transform="scale(' + ech2 + ')"><path d="' + lb[lbk] + '" fill="' + mb + '" stroke="' + O + '" stroke-width="1.6" stroke-linejoin="round"/><path d="' + os1[1] + '" stroke="#7a6a9a" stroke-width="1" fill="none" stroke-opacity=".8"/><path d="' + os1[0] + '" stroke="' + O + '" stroke-width="5" stroke-linecap="round"/><path d="' + os1[0] + '" stroke="#c4b4d0" stroke-width="2.6" stroke-linecap="round"/></g>',
        [{transform: T(cx, cy, .4, 0), opacity: 1}, {offset: .18, transform: T(x1, y1, 1, 120)}, {offset: .4, transform: T(x1 + xs, y1 + (fond - y1) * .3, 1, 60)}, {offset: .6, transform: T(x1 - xs * .6, y1 + (fond - y1) * .6, 1, 160)}, {offset: .8, transform: T(x1 + xs * .4, y1 + (fond - y1) * .88, 1, 90), opacity: 1}, {transform: T(x1, fond, 1, 120), opacity: 0}],
        {d: hasard(2400, 3000), e: 'linear'});
    }
    /* des touffes de poils qui flottent et descendent doucement */
    for(var t = 0; t < 5; t++){
      var at = -Math.PI * (.2 + t * .15), vt = hasard(70, 130) * u, xt = cx + Math.cos(at) * vt, yt = cy + Math.sin(at) * vt;
      g('<g transform="scale(' + f1(u * 2) + ')"><path d="M-2 8 Q -10 0 -6 -10 Q -4 -2 0 2 Q 0 -8 6 -12 Q 4 -2 4 4 Q 8 -2 12 -2 Q 8 4 2 9 Z" fill="#8a789c" stroke="' + O + '" stroke-width="1.3" stroke-linejoin="round"/><path d="M-4 4 Q -6 -2 -5 -7 M2 3 Q 2 -4 5 -9" fill="none" stroke="#efe4f6" stroke-width="1" stroke-opacity=".7"/></g>',
        [{transform: T(cx, cy, .3), opacity: 1}, {offset: .2, transform: T(xt, yt - 20 * u, 1, 40)}, {offset: .6, transform: T(xt + 24 * u, yt + 60 * u, 1, -30)}, {transform: T(xt - 10 * u, yt + 140 * u, 1, 50), opacity: 0}], {d: hasard(2600, 3200), e: 'ease-out'});
    }
    /* BOUM : l'étoile mauve, l'éclair, l'onde de choc */
    g('<path d="' + etoileD(70 * u * 2, 11, .5) + '" fill="#c8a8ff" stroke="' + O + '" stroke-width="' + f1(3 * u * 2) + '"/><path d="' + etoileD(42 * u * 2, 11, .5) + '" fill="#f4ecff"/>', [{transform: T(cx, cy, .15, 0), opacity: 1}, {offset: .35, transform: T(cx, cy, 1, 14), opacity: 1}, {transform: T(cx, cy, 1.15, 22), opacity: 0}], {d: 480, e: 'cubic-bezier(.1,.8,.3,1)'});
    g('<circle r="' + f1(70 * u * 2) + '" fill="url(#' + id + 'g)"/>', [{transform: T(cx, cy, .2), opacity: 1}, {transform: T(cx, cy, 1.8), opacity: 0}], {d: 460});
    g('<circle r="' + f1(56 * u * 2) + '" fill="none" stroke="#ffffff" stroke-width="' + f1(5 * u * 2) + '"/>', [{transform: T(cx, cy, .2), opacity: .95}, {transform: T(cx, cy, 2.8), opacity: 0}], {d: 560, e: 'cubic-bezier(.1,.8,.3,1)'});
    g('<ellipse rx="' + f1(60 * u * 2) + '" ry="' + f1(8 * u * 2) + '" fill="none" stroke="' + LUNE + '" stroke-width="' + f1(4 * u * 2) + '"/>', [{transform: T(cx, solY, .3), opacity: 0}, {offset: .3, opacity: .9, transform: T(cx, solY, .6)}, {transform: T(cx, solY, 3) + ' scale(1,.8)', opacity: 0}], {d: 1200, dl: 240, e: 'cubic-bezier(.1,.7,.3,1)'});
    /* ce qui reste au sol : apparaît quand les lambeaux retombent */
    setTimeout(function(){ self._restes(); }, 700);
    self._couperBoucles(); self.mort = true; self._majOuvert();
    return Promise.all(brumes.map(fini)).then(function(){ ov.remove(); });
  });
  pr.boom = boomP;
  return pr;
};
R._restes = function(){
  var c = this._ou('centre'), x = Math.max(60, Math.min(480, c[0])), D = this.D;
  var gO = D.linU([[0, '#fffaf0'], [1, '#c8bca0']], -30, -30, 30, 20);
  this.defs.insertAdjacentHTML('beforeend', D.l[D.l.length - 1]);
  var s = '<ellipse cx="0" cy="4" rx="96" ry="10" fill="#000" fill-opacity=".35"/>';
  /* un petit tas de cendre grise */
  s += P('M-80 6 C -66 -10 -36 -18 -6 -16 C 24 -18 56 -10 74 6 C 30 12 -40 12 -80 6 Z', '#4a4252', ' stroke-width="2.4"') + L('M-60 -2 C -36 -10 0 -12 40 -6', '#7a7088', 1.6, ' stroke-opacity=".7"');
  /* un lambeau d'aile tombé */
  s += P('M30 2 L 66 -8 L 84 4 L 56 10 Z', '#3d2a50', ' stroke-width="2"') + L('M36 0 L 76 -2', '#a493b0', 2.2);
  /* le petit crâne : un museau court, de grands trous pour les yeux, deux crocs */
  s += '<g transform="translate(-24 -16)">' + P('M-22 4 C -24 -8 -12 -18 2 -18 C 16 -18 26 -10 24 2 C 22 10 12 12 2 12 C -8 12 -20 12 -22 4 Z', gO, ' stroke-width="2.2"') +
    '<ellipse cx="-8" cy="-4" rx="6" ry="5" fill="#2a2018" stroke="' + O + '" stroke-width="1.4"/><ellipse cx="10" cy="-5" rx="5" ry="4.4" fill="#2a2018" stroke="' + O + '" stroke-width="1.4"/>' +
    P('M-16 8 L -13 18 L -10 9 Z M6 10 L 9 19 L 12 10 Z', '#fffaf0', ' stroke-width="1.2"') + C(-9, -6, 1.4, '#cfe8ff', ' fill-opacity=".8"') + '</g>';
  /* des os de doigts, fins et longs */
  function os(x0, y0, l, a){ return '<g transform="translate(' + x0 + ' ' + y0 + ') rotate(' + a + ')">' + P('M' + (-l) + ' -1.6 L ' + l + ' -1.6 C ' + (l + 3) + ' -5 ' + (l + 7) + ' -3 ' + (l + 5) + ' 0 C ' + (l + 7) + ' 3 ' + (l + 3) + ' 5 ' + l + ' 1.6 L ' + (-l) + ' 1.6 C ' + (-l - 3) + ' 5 ' + (-l - 7) + ' 3 ' + (-l - 5) + ' 0 C ' + (-l - 7) + ' -3 ' + (-l - 3) + ' -5 ' + (-l) + ' -1.6 Z', gO, ' stroke-width="1.6"') + '</g>'; }
  s += os(14, -6, 16, -14) + os(40, -14, 12, 24) + os(-62, -4, 11, 8) + os(-40, -18, 9, -30);
  var g = document.createElementNS(NS, 'g');
  g.setAttribute('transform', 'translate(' + f1(x) + ' ' + f1(SOL - 4) + ') scale(1.5)');
  g.innerHTML = '<g>' + s + '</g>';
  this.S.restes.appendChild(g);
  g.firstChild.animate([{opacity: 0, transform: 'translateY(-14px)'}, {opacity: 1, transform: 'translateY(0px)'}], {duration: 700, easing: 'cubic-bezier(.3,.7,.4,1)', fill: 'both'});
};

/* =====================================================================
   8. Les états
   ===================================================================== */
R.attendre = function(){
  this.attente = true;
  if(this.arrete){ this.arrete = false; this._remettreX(); }
  if(!this.enAction && !this.mort) return this._reprendre(250);
  return Promise.resolve();
};
R._remettreX = function(){ var e = this.etat; if(e.ebloui) this._etoiles('etoiles', true); if(e.brule) this._feu(true); if(e.folle) this._cris(true); this._pfOn = null; this._visuelsSol(); };
/* arreter() coupe tout : l'attente et les boucles des états */
R.arreter = function(){ this.attente = false; this.arrete = true; this._couperX(''); this._couperBoucles(); return this; };
R.ancre = function(nom){ var r = (this.A[nom] || this.A.centre).getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; };
R._visuel = function(nom, on){
  if(nom === 'enrage') this._fondu('rouge', on ? 1 : 0, 300);
  else if(nom === 'brule') this._feu(on);
  else if(nom === 'colle') this._fondu('colle', on ? 1 : 0, 300);
  else if(nom === 'ebloui'){ this._etoiles('etoiles', on); this._fondu('plisse', on ? 1 : 0, 200); }
  else if(nom === 'gele') this._fondu('gel', on ? 1 : 0, 600);
  else if(nom === 'ouvert') this._majOuvert();
  else if(nom === 'folle'){ this._fondu('folle', on ? 1 : 0, 200); this._cris(on); }
};
R.changerEtat = function(nom, on){
  on = on !== false;
  var self = this;
  if(this.mort || !(nom in this.etat) || this.etat[nom] === on) return Promise.resolve();
  if(nom === 'au-sol'){
    var j = this._debutAction();
    this.etat['au-sol'] = on;
    var p = on ? this._tomber(this.etat.colle) : this._envol();
    return p.then(function(){ self._visuelsSol(); return self._finAction(j, 200); });
  }
  this.etat[nom] = on;
  this._visuel(nom, on);
  if(nom === 'colle' && on && !this.etat['au-sol']){
    /* les ailes collées en plein vol : elle tombe */
    var jc = this._debutAction();
    this.etat['au-sol'] = true;
    return this._tomber(true).then(function(){ self._visuelsSol(); return self._finAction(jc, 200); });
  }
  if(nom === 'colle' && this.etat['au-sol']) this._visuelsSol();
  if(nom === 'dos' && !this.etat['au-sol']){
    /* retournée en plein vol : elle fait un demi-tonneau et vole la tête en bas */
    var j2 = this._debutAction();
    var k = on ? [{t: 0, p: {}}, {t: .5, p: {posture: {a: 100}, pos: {y: -30}}, e: 'ease-out'}, {t: 1, p: {posture: {a: 180}, pos: {y: 0}}, e: 'ease-in-out'}] : [{t: 0, p: {}}, {t: .5, p: {posture: {a: 270}, pos: {y: -30}}, e: 'ease-out'}, {t: 1, p: {posture: {a: 360}, pos: {y: 0}}, e: 'ease-in-out'}];
    this._battre(this._base(), 520, 1.4);
    return this._seq(k, 700).fini.then(function(){
      if(!on){ self.J.posture.forEach(function(e){ e.getAnimations().forEach(function(a){ a.cancel(); }); e.style.transform = tf(Z); }); self.v.posture = fusion(Z); }
      return self._finAction(j2, 150);
    });
  }
  if(!this.enAction) return this._reprendre(300);
  return Promise.resolve();
};

/* =====================================================================
   9. L'interface publique
   ===================================================================== */
var INFO = {id: ID, nom: 'Chauve-souris de la brume', rang: 'normal', pv: 25, attaque: 'piqué 10 (2 fois si folle)',
  cadre: {w: 240, h: 338}, sol: (SOL - VB.y) / VB.h, vol: (CENTRE[1] - VB.y) / VB.h, vole: true, places: 1,
  attaques: ['pique'], specials: ['cri', 'ecoute', 'tomber', 'envol', 'folle'],
  etats: ['enrage', 'brule', 'colle', 'ebloui', 'gele', 'ouvert', 'dos', 'cible', 'au-sol', 'folle']};
function creer(conteneur, options){
  var t = new Chauve(conteneur, options);
  return {
    info: INFO,
    entrer: function(){ return t.entrer(); }, attendre: function(){ return t.attendre(); },
    attaquer: function(nom, o){ return t.attaquer(nom, o); }, touche: function(type){ return t.touche(type); },
    special: function(nom, o){ return t.special(nom, o); }, tousser: function(){ return t.tousser(); },
    fuir: function(){ return t.fuir(); }, mourir: function(){ return t.mourir(); }, exploser: function(scene){ return t.exploser(scene); },
    etat: function(nom, on){ return t.changerEtat(nom, on); }, cible: function(on){ return t.changerEtat('cible', on); },
    etatCourant: function(){ var e = {}; for(var k in t.etat) e[k] = t.etat[k]; return e; },
    ancre: function(nom){ return t.ancre(nom); }, arreter: function(){ t.arreter(); return this; }, _bete: t
  };
}
global.BETES = global.BETES || {};
global.BETES[ID] = {info: INFO, creer: creer};
})(typeof window !== 'undefined' ? window : this);
