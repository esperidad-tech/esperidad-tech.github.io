/* petitearaignee-anime.js — la petite araignée animée (Les Enquêteurs de Brumeval, donjon du puits)
   Née des œufs de l'araignée des caves quand le feu les fait éclore (araignee.special('eclosion')). 15 PV, morsure 6.
   Module autonome, sans dépendance ; il injecte son propre CSS (préfixe .bt-petitearaignee-…). Contrat : anim/betes/CONTRAT.md.

     var p = BETES.petitearaignee.creer(conteneur);   // un SVG qui remplit le conteneur (110 × 80), elle regarde à gauche
     info.oeuf = [0.5, 0.7625] : où se trouve le centre de l'œuf dans le cadre (pour poser le cadre sur l'œuf tombé du cocon).

   Actions (Promise) : entrer() (elle sort d'un œuf qui vacille, se fend et éclate ; entrer({oeuf: false}) : elle arrive en trottinant),
     attaquer('morsure', o) (elle se ramasse, bondit, clac (o.onImpact), revient d'un saut ; la Promise a .impact),
     touche(type) (fleche, fleche-argent, fleche-lourde, dague, feu → « brule », lumiere → « ebloui », louche, colle → « colle »,
     huile → elle patine et se retourne : « dos », nuage → tousser(), givre → « gele », acide, bruit, bouclier, rebond, brulure, coup),
     tousser(), fuir() / mourir() (demi-tour, elle détale), exploser(scene) (brume noire ; reste un petit corps recroquevillé ; .boom).
   États : enrage, brule, colle, ebloui, gele, ouvert, dos, cible. etatCourant(), ancre(nom), arreter().
   Pièces articulées (<g data-j>, contenu fixe) animées par la Web Animations API (transform et opacity seulement) ; aucun filtre. */
(function(global){
'use strict';
var ID = 'petitearaignee', PX = 'bt-petitearaignee';

var O = '#24182e', LUNE = '#bfe8ff', NUM = 0, NS = 'http://www.w3.org/2000/svg';

/* =====================================================================
   1. Petits outils de dessin (repris du rat d'égout animé)
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
/* une courbe lisse qui passe par tous les points */
function lisse(pts, ferme){
  var n = pts.length, s = 'M' + pt(pts[0]), m = ferme ? n : n - 1;
  function q(i){ return ferme ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]; }
  for(var i = 0; i < m; i++){
    var a = q(i - 1), b = q(i), c = q(i + 1), e = q(i + 2);
    s += ' C ' + pt([b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6]) + ' ' + pt([c[0] - (e[0] - b[0]) / 6, c[1] - (e[1] - b[1]) / 6]) + ' ' + pt(c);
  }
  return s + (ferme ? ' Z' : '');
}
/* un membre effilé qui suit des points, une largeur par point ; renvoie le chemin et ses deux bords */
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
/* un point sur une ellipse tournée, et une ellipse un peu bosselée */
function ell(c, rx, ry, rot, a){ var ca = Math.cos(rot), sa = Math.sin(rot), x = Math.cos(a) * rx, y = Math.sin(a) * ry; return [c[0] + x * ca - y * sa, c[1] + x * sa + y * ca]; }
function ellChemin(c, rx, ry, rot, n, bosse, seed){
  var R = rng(seed || 1), pts = [];
  for(var k = 0; k < n; k++){ var a = k / n * Math.PI * 2, f = 1 + (R() - .5) * (bosse || 0); pts.push(ell(c, rx * f, ry * f, rot, a)); }
  return lisse(pts, true);
}
/* une tache irrégulière (rouille, suie, glu…) */
function tache(x, y, r, R, irr){
  var n = 6, pts = [], k = irr == null ? .5 : irr;
  for(var i = 0; i < n; i++){ var a = i / n * Math.PI * 2 + R() * .6, rr = r * (1 - k / 2 + R() * k); pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * .82]); }
  return lisse(pts, true) + ' ';
}
/* des cercles réunis dans un seul chemin (moins d'éléments à dessiner) */
function rond(x, y, r){ return 'M' + f1(x - r) + ' ' + f1(y) + ' a ' + f1(r) + ' ' + f1(r) + ' 0 1 0 ' + f1(r * 2) + ' 0 a ' + f1(r) + ' ' + f1(r) + ' 0 1 0 ' + f1(-r * 2) + ' 0 Z '; }
/* un point et sa direction sur une courbe de Bézier cubique */
function bez(p, t){ var u = 1 - t; return [0, 1].map(function(i){ return u * u * u * p[0][i] + 3 * u * u * t * p[1][i] + 3 * u * t * t * p[2][i] + t * t * t * p[3][i]; }); }
function bezD(p, t){ var u = 1 - t; return [0, 1].map(function(i){ return 3 * u * u * (p[1][i] - p[0][i]) + 6 * u * t * (p[2][i] - p[1][i]) + 3 * t * t * (p[3][i] - p[2][i]); }); }
/* une flamme qui monte depuis (0,0), une étoile, un éclat à quatre branches */
function flammeD(h, w){
  return 'M' + f1(-w / 2) + ' 0 C ' + f1(-w * .62) + ' ' + f1(-h * .38) + ' ' + f1(-w * .1) + ' ' + f1(-h * .5) + ' ' + f1(-w * .12) + ' ' + f1(-h) + ' C ' + f1(w * .3) + ' ' + f1(-h * .62) + ' ' + f1(w * .7) + ' ' + f1(-h * .42) + ' ' + f1(w / 2) + ' 0 Z';
}
function etoileD(r, n, k){
  var s = '';
  for(var i = 0; i < n * 2; i++){ var a = -Math.PI / 2 + i * Math.PI / n, rr = i % 2 ? r * (k || .45) : r; s += (i ? ' L ' : 'M') + f1(Math.cos(a) * rr) + ' ' + f1(Math.sin(a) * rr); }
  return s + ' Z';
}
function eclatD(r){ return 'M0 ' + f1(-r) + ' Q ' + f1(r * .14) + ' ' + f1(-r * .14) + ' ' + f1(r) + ' 0 Q ' + f1(r * .14) + ' ' + f1(r * .14) + ' 0 ' + f1(r) + ' Q ' + f1(-r * .14) + ' ' + f1(r * .14) + ' ' + f1(-r) + ' 0 Q ' + f1(-r * .14) + ' ' + f1(-r * .14) + ' 0 ' + f1(-r) + ' Z'; }
/* une rotation d'angle a autour du point Q, exprimée autour du pivot Pv : {a, x, y} */
function rotAutour(a, Q, Pv){
  var r = a * Math.PI / 180, c = Math.cos(r), s = Math.sin(r), dx = Q[0] - Pv[0], dy = Q[1] - Pv[1];
  return {a: a, x: dx - (dx * c - dy * s), y: dy - (dx * s + dy * c)};
}
/* Les pièces articulées : un <g data-j> dont le pivot est ramené à (0,0). Son contenu est FIXE : on n'anime que
   son transform et son opacity (on pourra plus tard la changer en image animée par la carte graphique).
   op : opacité de départ (0 = cachée). */
function piv(nom, x, y, c, op){ return '<g transform="translate(' + x + ' ' + y + ')"><g data-j="' + nom + '"' + (op != null ? ' style="opacity:' + op + '"' : '') + '><g transform="translate(' + (-x) + ' ' + (-y) + ')">' + c + '</g></g></g>'; }
/* une variante pré-dessinée (gel, rougeoiement, lueur du point faible…) : une pièce qu'on montre ou cache par son opacité.
   attrs : par ex. ' data-gel' pour les retrouver toutes ; x, y : un pivot (si elle doit palpiter). */
function variante(nom, c, attrs, x, y, op){
  var s = ' data-v="1"' + (attrs || '') + ' style="opacity:' + (op || 0) + '"';
  if(x == null) return '<g data-j="' + nom + '"' + s + '>' + c + '</g>';
  return '<g transform="translate(' + x + ' ' + y + ')"><g data-j="' + nom + '"' + s + '><g transform="translate(' + (-x) + ' ' + (-y) + ')">' + c + '</g></g></g>';
}
/* des étoiles pré-dessinées (ébloui, tournis) : un groupe caché et n étoiles qui tourneront autour d'un centre */
function etoilesDessin(D, nom, cx, cy, rx, n, r){
  var lu = D.doux('#fff6c0', .5), s = '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + f1(rx * 1.2) + '" ry="' + f1(rx * .7) + '" fill="' + lu + '"/>';
  for(var i = 0; i < n; i++){ var rr = r - (i % 2) * r * .22; s += '<g data-j="' + nom + '_' + i + '" data-v="1"><circle r="' + f1(rr * 1.25) + '" fill="' + lu + '"/><path d="' + etoileD(rr, 5, .45) + '" fill="#ffe466" stroke="' + O + '" stroke-width="' + f1(rr * .15 + 1) + '"/><path d="' + etoileD(rr * .42, 5, .45) + '" fill="#fffbe0"/></g>'; }
  return '<g data-j="' + nom + '" data-v="1" style="opacity:0">' + s + '</g>';
}
function slot(nom){ return '<g data-slot="' + nom + '"></g>'; }
/* un petit repère caché, suivi par ancre() (getBoundingClientRect) et par les effets */
function repere(nom, x, y){ return '<g data-a="' + nom + '"><circle cx="' + x + '" cy="' + y + '" r="1.5" fill="#000" opacity="0"/></g>'; }

/* les dégradés et découpes d'une bête (identifiants uniques par bête) */
function Defs(u){ this.u = u; this.n = 0; this.l = []; }
Defs.prototype.id = function(){ return this.u + (++this.n); };
Defs.prototype.g = function(c, fort){   /* lumière en haut à droite */
  fort = fort || 1; var id = this.id();
  this.l.push('<linearGradient id="' + id + '" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + clair(c, .26 * fort) + '"/><stop offset=".45" stop-color="' + c + '"/><stop offset="1" stop-color="' + sombre(c, .42 * fort) + '"/></linearGradient>');
  return 'url(#' + id + ')';
};
Defs.prototype.halo = function(c0, c1){ var id = this.id(); this.l.push('<radialGradient id="' + id + '"><stop offset="0" stop-color="' + c0 + '"/><stop offset=".45" stop-color="' + c1 + '" stop-opacity=".6"/><stop offset="1" stop-color="' + c1 + '" stop-opacity="0"/></radialGradient>'); return 'url(#' + id + ')'; };
/* une tache douce : remplace les flous (un dégradé, rien à recalculer quand ça bouge) */
Defs.prototype.doux = function(c, op){ var id = this.id(); op = op == null ? 1 : op; this.l.push('<radialGradient id="' + id + '"><stop offset="0" stop-color="' + c + '" stop-opacity="' + op + '"/><stop offset=".55" stop-color="' + c + '" stop-opacity="' + f1(op * .45) + '"/><stop offset="1" stop-color="' + c + '" stop-opacity="0"/></radialGradient>'); return 'url(#' + id + ')'; };
Defs.prototype.stops = function(st){ return st.map(function(t){ return '<stop offset="' + t[0] + '" stop-color="' + t[1] + '" stop-opacity="' + (t[2] == null ? 1 : t[2]) + '"/>'; }).join(''); };
Defs.prototype.rad = function(st, cx, cy, r){ var id = this.id(); this.l.push('<radialGradient id="' + id + '" cx="' + cx + '" cy="' + cy + '" r="' + r + '">' + this.stops(st) + '</radialGradient>'); return 'url(#' + id + ')'; };
Defs.prototype.lin = function(st, x1, y1, x2, y2){ var id = this.id(); this.l.push('<linearGradient id="' + id + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '">' + this.stops(st) + '</linearGradient>'); return 'url(#' + id + ')'; };
Defs.prototype.clip = function(d){ var id = this.id(); this.l.push('<clipPath id="' + id + '"><path d="' + d + '"/></clipPath>'); return ' clip-path="url(#' + id + ')"'; };
/* la glace (gel), commune à toutes les pièces */
Defs.prototype.glace = function(){
  if(this._glace) return this._glace;
  return (this._glace = this.lin([[0, '#f4fdff', .88], [.45, '#b8e6ff', .72], [1, '#5aa0d8', .82]], 1, 0, 0, 1));
};
/* des cristaux de glace dessinés une fois (dans une variante « gel ») */
Defs.prototype.cristaux = function(x, y, a, n, l, etendue, seed){
  var R = rng(seed || 7), h = '', gl = this.glace();
  for(var k = 0; k < n; k++){ var aa = a + (R() - .5) * 70, ll = l * (.6 + R() * .7), w = ll * .32; h += '<g transform="translate(' + f1(x + (R() - .5) * (etendue || 10)) + ' ' + f1(y + (R() - .5) * 4) + ') rotate(' + f1(aa + 90) + ')">' + P('M' + f1(-w / 2) + ' 0 L 0 ' + f1(-ll) + ' L ' + f1(w / 2) + ' 0 Z', gl, ' stroke-width="1.4"') + L('M0 -2 L 0 ' + f1(-ll * .7), '#ffffff', 1, ' opacity=".9"') + '</g>'; }
  return h;
};

/* =====================================================================
   2. Le CSS (injecté une seule fois, préfixé). Aucune animation CSS dans les pièces :
      seulement les flammes et les bulles, qui sont des particules hors des pièces.
   ===================================================================== */
var CSS = ('.PX{position:relative;width:100%;height:100%}' +
  '.PX>svg{width:100%;height:100%;overflow:visible;display:block}' +
  '.PX [data-j]{transform-box:view-box;transform-origin:0 0}' +
  '.PX .PX-fl{transform-box:fill-box;transform-origin:50% 100%;animation:PX-flamme .42s ease-in-out infinite alternate}' +
  '.PX .PX-fl2{transform-box:fill-box;transform-origin:50% 100%;animation:PX-flamme2 .3s ease-in-out infinite alternate}' +
  '@keyframes PX-flamme{0%{transform:scale(1,1) skewX(0deg)}35%{transform:scale(.88,1.18) skewX(-7deg)}70%{transform:scale(1.06,.9) skewX(5deg)}100%{transform:scale(.94,1.12) skewX(-3deg)}}' +
  '@keyframes PX-flamme2{0%{transform:scale(1,.9) skewX(4deg)}100%{transform:scale(.85,1.2) skewX(-6deg)}}' +
  '.PX .PX-bulle{transform-box:fill-box;transform-origin:50% 100%;animation:PX-bulle 2.4s ease-in-out infinite}' +
  '@keyframes PX-bulle{0%,100%{transform:scale(1);opacity:.8}50%{transform:scale(1.25,.85);opacity:1}}' +
  '.PX .PX-lueur{animation:PX-lueur 1.1s ease-in-out infinite alternate}' +
  '@keyframes PX-lueur{from{opacity:.35}to{opacity:1}}' +
  '.PX-scene-fx{position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;pointer-events:none;z-index:5}').replace(/PX/g, PX);
function injecterCSS(){
  if(document.getElementById(PX + '-css')) return;
  var s = document.createElement('style'); s.id = PX + '-css'; s.textContent = CSS; document.head.appendChild(s);
}

/* =====================================================================
   3. Le moteur : des poses-clés jouées par la Web Animations API (transform et opacity seulement)
   ===================================================================== */
var Z = {x: 0, y: 0, a: 0, sx: 1, sy: 1};
var PARTICULES_MAX = 26;
function r3(n){ return Math.round(n * 1000) / 1000; }
function tf(v){ return 'translate(' + r3(v.x) + 'px,' + r3(v.y) + 'px) rotate(' + r3(v.a) + 'deg) scale(' + r3(v.sx) + ',' + r3(v.sy) + ')'; }
function fusion(a, b){
  var o = {x: a.x, y: a.y, a: a.a, sx: a.sx, sy: a.sy};
  if(b){ for(var k in o) if(b[k] != null) o[k] = b[k]; if(b.s != null){ o.sx = b.s; o.sy = b.s; } }
  return o;
}
function attendreMs(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }
function fini(a){ return a && a.finished ? a.finished.then(function(){}, function(){}) : Promise.resolve(); }
function hasard(a, b){ return a + Math.random() * (b - a); }
function choisir(l){ return l[Math.floor(Math.random() * l.length)]; }
function onde(base, amp, n, canal){
  var cles = [];
  n = n || 8;
  for(var i = 0; i <= n; i++){ var t = i / n, v = {}; v[canal || 'a'] = (base || 0) + amp * Math.sin(t * Math.PI * 2); cles.push({t: t, v: v}); }
  return cles;
}
function copie(o){ var r = {}; for(var k in o) r[k] = o[k]; return r; }
function avec(a, b){ var o = copie(a); for(var k in b) o[k] = b[k]; return o; }

function Bete(){}
var B = Bete.prototype;
B._init = function(conteneur, options, vb, dessiner){
  injecterCSS();
  this.c = conteneur;
  this.o = options || {};
  var D = new Defs(PX + (++NUM) + '_');
  this.D = D;
  /* les dégradés des effets, créés une fois */
  this.G = {lumiere: D.doux('#fff4b0', .9), flash: D.doux('#fff8e0', .85), feu: D.doux('#ff9a30', .9), braise: D.doux('#ffb040', 1),
    feu1: D.lin([[0, '#ff4a10'], [.6, '#ff8a1a'], [1, '#ffc040', .8]], 0, 1, 0, 0), feu2: D.lin([[0, '#ffd040'], [1, '#fff8c0']], 0, 1, 0, 0), lueurFeu: D.doux('#ffb040', .5),
    huile: D.lin([[0, '#1a1428'], [.3, '#3a2a5a'], [.45, '#2a5a6a'], [.6, '#5a6a2a'], [.75, '#6a3a5a'], [1, '#1a1428']], 0, 0, 1, 0)};
  var art = dessiner.call(this, D);
  var div = document.createElement('div');
  div.className = PX;
  div.innerHTML = '<svg xmlns="' + NS + '" viewBox="' + vb + '" preserveAspectRatio="xMidYMax meet"><defs>' + D.l.join('') + '</defs>' + art +
    '<g data-reperes><circle cx="0" cy="0" r="1" opacity="0"/><circle cx="100" cy="100" r="1" opacity="0"/></g></svg>';
  conteneur.appendChild(div);
  this.el = div;
  this.svg = div.querySelector('svg');
  this.vb = vb.split(/\s+/).map(Number);
  var self = this;
  this.J = {}; this.S = {}; this.A = {}; this.N = [];
  [].forEach.call(this.svg.querySelectorAll('[data-j]'), function(e){ var n = e.getAttribute('data-j'); self.J[n] = e; if(!e.hasAttribute('data-v')) self.N.push(n); });
  [].forEach.call(this.svg.querySelectorAll('[data-slot]'), function(e){ self.S[e.getAttribute('data-slot')] = e; });
  [].forEach.call(this.svg.querySelectorAll('[data-a]'), function(e){ self.A[e.getAttribute('data-a')] = e; });
  this.marques = this.svg.querySelector('[data-reperes]').children;
  this.v = {};
  this.etat = {enrage: false, brule: false, colle: false, ebloui: false, gele: false, ouvert: false, dos: false, cible: false};
  this.jumeaux = {};
  this.attente = true;
  this.jeton = 0;
  this.enAction = false;
  this.boucles = [];
  this.minuteurs = [];
  this.fx = {pulses: {}, orbites: {}};
  this.mort = false;
  this.vitesse = 1;
};
/* lire la pose actuelle d'une pièce (même au milieu d'une animation) */
B._lire = function(n){
  var el = this.J[n], ref = this.v[n] || Z, t = getComputedStyle(el).transform;
  if(!t || t === 'none') return fusion(Z);
  var m = t.match(/matrix\(([^)]+)\)/);
  if(!m) return fusion(ref);
  var v = m[1].split(',').map(parseFloat), sx = Math.hypot(v[0], v[1]), ang = Math.atan2(v[1], v[0]) * 180 / Math.PI, sy = (v[0] * v[3] - v[1] * v[2]) / (sx || 1);
  while(ang - ref.a > 180) ang -= 360;
  while(ang - ref.a < -180) ang += 360;
  return {x: v[4], y: v[5], a: ang, sx: sx, sy: sy};
};
/* figer : on lit les poses, on coupe les animations de pose, on garde la pose */
B._figer = function(noms){
  var self = this, vals = {};
  noms = noms || this.N;
  noms.forEach(function(n){ if(self.J[n].getAnimations().length) vals[n] = self._lire(n); });
  noms.forEach(function(n){
    if(!vals[n]) return;
    var el = self.J[n];
    el.getAnimations().forEach(function(a){ if(a.id === 'seq') a.cancel(); });
    el.style.transform = tf(vals[n]);
    self.v[n] = vals[n];
  });
};
/* jouer une suite de poses-clés.  cles = [{t:0..1, p:{piece:{x,y,a,sx,sy,s}}, e:'easing'}]
   o.boucle : en boucle ; o.ajout : s'ajoute par-dessus (composite add) ; o.vitesse ; o.delai ; o.depuis */
B._seq = function(cles, duree, o){
  o = o || {};
  var self = this, noms = {}, anims = [], jum = this.jumeaux;
  /* les pièces jumelles (dessinées en deux couches) bougent ensemble */
  cles.forEach(function(k){ for(var n in k.p){ noms[n] = 1; if(jum[n]) jum[n].forEach(function(m){ k.p[m] = k.p[n]; noms[m] = 1; }); } });
  if(o.depuis) for(var nj in jum) if(o.depuis[nj]) jum[nj].forEach(function(m){ o.depuis[m] = o.depuis[nj]; });
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
    var a = el.animate(frames, {duration: duree, iterations: o.boucle ? Infinity : 1, fill: o.ajout ? 'none' : 'forwards', composite: o.ajout ? 'add' : 'replace', delay: o.delai || 0});
    a.id = 'seq';
    a.playbackRate = (o.vitesse || 1);
    if(o.boucle) self.boucles.push(a);
    else if(!o.ajout) a.finished.then(function(){ try{ a.commitStyles(); a.cancel(); }catch(e){} }, function(){});
    anims.push(a);
  });
  return {anims: anims, fini: Promise.all(anims.map(fini))};
};
/* aller doucement vers une pose (les pièces absentes reviennent au repos si tout) */
B._allerA = function(pose, duree, e, tout){
  var p = {}, n, self = this;
  if(tout) this.N.forEach(function(n){ var v = self.v[n]; if(!v || v.x || v.y || v.a || v.sx !== 1 || v.sy !== 1 || self.J[n].getAnimations().length) p[n] = fusion(Z); });
  for(n in pose) p[n] = fusion(Z, pose[n]);
  if(!Object.keys(p).length) return Promise.resolve();
  return this._seq([{t: 1, p: p, e: e || 'cubic-bezier(.3,.7,.3,1)'}], duree).fini;
};
/* un point d'une pièce, ramené dans le repère fixe « monde » (le repère du dessin, qui ne bouge pas) */
B._ou = function(ref, x, y, rep){
  var el = typeof ref === 'string' ? (this.A[ref] || this.J[ref] || this.S[ref]) : ref, m = el.getCTM(), w = (rep || this.S.monde).getCTM(), p = this.svg.createSVGPoint();
  p.x = x; p.y = y;
  p = p.matrixTransform(m).matrixTransform(w.inverse());
  return [p.x, p.y];
};
/* le point d'un repère, dans le repère « monde » */
B._pt = function(nom, rep){ var a = this.A[nom], c = a.firstElementChild; return this._ou(a, +c.getAttribute('cx'), +c.getAttribute('cy'), rep); };
/* du repère « monde » à l'écran (deux marques fixes donnent l'échelle et le décalage, transformations CSS comprises) */
B._versEcran = function(p){
  var a = this.marques[0].getBoundingClientRect(), b = this.marques[1].getBoundingClientRect(), ax = a.left + a.width / 2, ay = a.top + a.height / 2, kx = (b.left + b.width / 2 - ax) / 100, ky = (b.top + b.height / 2 - ay) / 100;
  return {x: ax + p[0] * kx, y: ay + p[1] * ky};
};
B._depuisEcran = function(q){
  var a = this.marques[0].getBoundingClientRect(), b = this.marques[1].getBoundingClientRect(), ax = a.left + a.width / 2, ay = a.top + a.height / 2, kx = (b.left + b.width / 2 - ax) / 100, ky = (b.top + b.height / 2 - ay) / 100;
  return [(q.x - ax) / (kx || 1), (q.y - ay) / (ky || 1)];
};
B._ecran = function(ref, x, y){ return this._versEcran(this._ou(ref, x, y)); };
/* combien de pixels écran pour une unité du dessin */
B._echelle = function(){ var r = this.svg.getBoundingClientRect(); return (r.width || 1) / this.vb[2]; };
B._minuteur = function(f, ms){ var self = this, id = setTimeout(function(){ var i = self.minuteurs.indexOf(id); if(i >= 0) self.minuteurs.splice(i, 1); f(); }, ms); this.minuteurs.push(id); return id; };
B._couperMinuteurs = function(){ this.minuteurs.forEach(clearTimeout); this.minuteurs = []; };
B._couperBoucles = function(){
  this._couperMinuteurs();
  this._figer();
  this.boucles = [];
};
/* un élément SVG créé à la volée (particules, débris, restes : jamais dans une pièce) */
B._el = function(parent, html){
  var g = document.createElementNS(NS, 'g');
  g.innerHTML = html;
  parent.appendChild(g);
  return g;
};
/* une particule : au plus PARTICULES_MAX à la fois (au-delà, elle n'est pas dessinée) */
B._fxEl = function(html, parent){
  parent = parent || this.S.monde;
  if(parent === this.S.monde && parent.childElementCount >= PARTICULES_MAX){ var g = document.createElementNS(NS, 'g'); return g; }
  return this._el(parent, html);
};
/* montrer / cacher une pièce ou une variante (opacité seulement) */
B._fondu = function(e, vers, duree){
  if(typeof e === 'string') e = this.J[e];
  if(!e) return Promise.resolve();
  var de = parseFloat(getComputedStyle(e).opacity);
  e.getAnimations().forEach(function(a){ if(a.id === 'fondu') a.cancel(); });
  e.style.opacity = vers;
  if(!duree || isNaN(de) || Math.abs(de - vers) < .01) return Promise.resolve();
  var a = e.animate([{opacity: de}, {opacity: vers}], {duration: duree, easing: 'ease-in-out'});
  a.id = 'fondu';
  return fini(a);
};
B._tous = function(sel){ return [].slice.call(this.svg.querySelectorAll(sel)); };
/* faire palpiter une variante (échelle seulement) */
B._pulser = function(nom, on, o){
  o = o || {};
  var a = this.fx.pulses[nom], e = this.J[nom];
  if(a){ a.cancel(); delete this.fx.pulses[nom]; }
  if(!on || !e) return;
  a = e.animate([{transform: 'scale(' + (o.s0 || .9) + ')'}, {transform: 'scale(' + (o.s1 || 1.12) + ')'}], {duration: o.duree || 800, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out'});
  a.id = 'pulse';
  this.fx.pulses[nom] = a;
};
/* le flash d'un coup : une lueur claire posée sur la bête (pas de filtre) */
B._flash = function(force, p){
  p = p || this._pt('centre');
  var r = (90 + (force || 2) * 25) * (this.tailleFx || 1), g = this._fxEl('<circle r="' + f1(r) + '" fill="' + this.G.flash + '"/>');
  g.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(.6)', opacity: .9}, {transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(1.15)', opacity: 0}], {duration: 260, easing: 'ease-out', fill: 'forwards'}).finished.then(function(){ g.remove(); }, function(){ g.remove(); });
};

/* =====================================================================
   4. Les actions et l'attente
   ===================================================================== */
B._debutAction = function(){
  this.jeton++;
  this.reprise = (this.reprise || 0) + 1;
  this.enAction = true;
  this._couperBoucles();
  return this.jeton;
};
B._finAction = function(j, duree){
  if(j !== this.jeton || this.mort) return Promise.resolve();
  this.enAction = false;
  return this._reprendre(duree);
};
/* le jeton de reprise : une reprise interrompue par une autre (ou par une action) ne lance pas ses boucles,
   sinon chaque pièce aurait deux boucles d'attente (la carte graphique ne compose plus, tout est redessiné à chaque image) */
B._reprendre = function(duree){
  var self = this, n = this.reprise = (this.reprise || 0) + 1;
  if(this.mort) return Promise.resolve();
  this._couperBoucles();
  return this._allerA(this._base(), duree == null ? 380 : duree, 'cubic-bezier(.3,.7,.3,1)', true).then(function(){
    if(n !== self.reprise || self.enAction || self.mort) return;
    if(self.attente) self._lancerBoucles();
  });
};
B._changerMode = function(){ if(!this.enAction && !this.mort) return this._reprendre(450); return Promise.resolve(); };
/* une boucle d'attente autour de la pose de base */
B._boucleur = function(){
  var self = this, b = this._base(), V = this.vitesse;
  function base(n){ return fusion(Z, b[n]); }
  function autour(n, d){ var v = base(n), o = {}; for(var k in d) o[k] = (k === 'sx' || k === 'sy') ? v[k] * d[k] : v[k] + d[k]; return o; }
  return function(n, deltas, duree, e, delai){
    var cles = deltas.map(function(d){ var o = {}; o[n] = autour(n, d[1]); return {t: d[0], p: o, e: e}; });
    return self._seq(cles, duree, {boucle: true, vitesse: V, depuis: b, delai: delai || 0});
  };
};
B._planifier = function(ms){
  var self = this;
  this._minuteur(function(){
    if(self.enAction || self.mort || !self.attente) return;
    if(!self.etat.gele) self._evenement();
    var V = self.etat.enrage ? 1.7 : 1;
    self._planifier(hasard(800, 1900) / V);
  }, ms);
};
B.attendre = function(){ this.attente = true; if(!this.enAction) return this._reprendre(300); return Promise.resolve(); };
B.arreter = function(){
  var self = this;
  this.attente = false;
  this._couperBoucles();
  ['fumee', 'vapeur', 'givreT', 'rougeT', 'fumeeCocon'].forEach(function(k){ clearTimeout(self.fx[k]); });
  /* les pulsations, les étoiles qui tournent, les flammes (leur suivi et leur scintillement) */
  Object.keys(this.fx.pulses).forEach(function(k){ self.fx.pulses[k].cancel(); delete self.fx.pulses[k]; });
  Object.keys(this.fx.orbites).forEach(function(k){ self.fx.orbites[k].cancel(); delete self.fx.orbites[k]; });
  Object.keys(this.fx).forEach(function(k){ if(/^flammes_/.test(k) && self.fx[k]){ cancelAnimationFrame(self.fx[k].raf); self.fx[k].g.remove(); self.fx[k] = null; } });
  return this;
};
/* les états : etat(nom, on) appelle this['_e_' + nom] ; ils se cumulent */
B.etatPublic = function(nom, on){
  on = on !== false;
  var cle = nom.replace(/-/g, '_'), f = this['_e_' + cle];
  if(!!this.etat[nom] === on) return Promise.resolve();
  if(!f){ this.etat[nom] = on; return Promise.resolve(); }
  return Promise.resolve(f.call(this, on));
};
B.etatCourant = function(){ return copie(this.etat); };
B.ancre = function(nom){
  var n = this._ancreNom ? this._ancreNom(nom) : nom, e = this.A[n] || this.A[nom];
  if(!e) return null;
  var r = e.getBoundingClientRect();
  return {x: r.left + r.width / 2, y: r.top + r.height / 2};
};
B.touche = function(type, o){
  type = type || 'coup';
  var f = this['_t_' + type.replace(/-/g, '_')];
  return f ? f.call(this, o || {}) : this._t_coup(o || {});
};
B.special = function(nom, o){
  var f = this['_s_' + (nom || '').replace(/-/g, '_')];
  return f ? f.call(this, o || {}) : Promise.resolve();
};
B.mourir = function(){ return this.fuir(); };

/* =====================================================================
   5. Petits effets : des particules simples, sans filtre, retirées à la fin (repère « monde »)
   ===================================================================== */
function oter(g){ return function(){ g.remove(); }; }
B._bouffee = function(p, o){
  o = o || {};
  var r = o.r || 8, coul = o.coul || '#c8c0d8', g = this._fxEl('<circle cx="0" cy="0" r="' + f1(r) + '" fill="' + coul + '" opacity="' + (o.op || .7) + '"/>' + (o.liser ? '<circle cx="' + f1(-r * .3) + '" cy="' + f1(-r * .3) + '" r="' + f1(r * .45) + '" fill="#ffffff" opacity=".35"/>' : ''), o.parent);
  var dx = o.dx == null ? hasard(-10, 10) : o.dx, dy = o.dy == null ? -30 : o.dy, d = o.duree || 900;
  var a = g.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(' + (o.s0 || .3) + ')', opacity: 0}, {offset: .15, opacity: 1}, {transform: 'translate(' + f1(p[0] + dx) + 'px,' + f1(p[1] + dy) + 'px) scale(' + (o.s1 || 1.6) + ')', opacity: 0}], {duration: d, easing: 'cubic-bezier(.2,.7,.4,1)', delay: o.delai || 0, fill: 'both'});
  a.finished.then(oter(g), oter(g));
  return a;
};
B._poussiere = function(p, n, sens){
  for(var i = 0; i < n; i++) this._bouffee([p[0] + hasard(-8, 8), p[1] - 4], {r: hasard(5, 9), coul: '#6a6078', op: .55, dx: (sens || 1) * hasard(10, 30), dy: hasard(-14, -4), duree: hasard(500, 800), delai: i * 40, s1: 2});
};
B._goutteTombe = function(p, o){
  o = o || {};
  var self = this, coul = o.coul || '#d8f0ff', g = this._fxEl('<path d="M0 -6 C 2 -2 4 1 4 3 C 4 6 2 7 0 7 C -2 7 -4 6 -4 3 C -4 1 -2 -2 0 -6 Z" fill="' + coul + '" stroke="' + O + '" stroke-width="1.2"/><circle cx="-1.5" cy="2" r="1.2" fill="#fff"/>');
  var sol = o.sol || this.solY, dy = Math.max(10, sol - p[1]), d = o.duree || Math.sqrt(dy) * 45, x = p[0] + (o.dx || 0);
  var a = g.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(.6,1.2)'}, {transform: 'translate(' + f1(x) + 'px,' + f1(sol) + 'px) scale(.8,1.3)'}], {duration: d, easing: 'cubic-bezier(.5,0,1,1)', fill: 'forwards'});
  a.finished.then(function(){
    g.remove();
    var s = self._fxEl('<ellipse cx="0" cy="0" rx="7" ry="2" fill="' + coul + '" opacity=".8"/><circle cx="-7" cy="-4" r="1.6" fill="' + coul + '"/><circle cx="7" cy="-5" r="1.4" fill="' + coul + '"/>');
    s.animate([{transform: 'translate(' + f1(x) + 'px,' + f1(sol) + 'px) scale(.3,1)', opacity: 1}, {transform: 'translate(' + f1(x) + 'px,' + f1(sol) + 'px) scale(1.3,.7)', opacity: 0}], {duration: 420, easing: 'ease-out', fill: 'forwards'}).finished.then(oter(s), oter(s));
  }, oter(g));
};
/* des étincelles qui jaillissent puis retombent */
B._etincelles = function(p, n, o){
  o = o || {};
  var cs = o.coul || ['#fff6c0', '#ffd060', '#ffffff', '#ffb040'], v0 = o.v || 50, ang = o.ang == null ? -Math.PI / 2 : o.ang, ouv = o.ouv == null ? Math.PI * 1.6 : o.ouv;
  n = Math.min(n, 10);
  for(var i = 0; i < n; i++){
    var a = ang + (Math.random() - .5) * ouv, v = v0 * hasard(.5, 1.2), lg = hasard(5, 11) * (o.taille || 1), dx = Math.cos(a) * v, dy = Math.sin(a) * v, gr = o.grav == null ? 34 : o.grav;
    var e = this._fxEl(L('M0 0 L ' + f1(-Math.cos(a) * lg) + ' ' + f1(-Math.sin(a) * lg), choisir(cs), (o.ep || 2.4)) + C(0, 0, (o.ep || 2.4) * .7, '#ffffff'));
    e.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px)', opacity: 1},
      {offset: .55, transform: 'translate(' + f1(p[0] + dx * .8) + 'px,' + f1(p[1] + dy * .8 + gr * .25) + 'px)', opacity: 1},
      {transform: 'translate(' + f1(p[0] + dx) + 'px,' + f1(p[1] + dy + gr) + 'px)', opacity: 0}], {duration: hasard(320, 620) * (o.duree || 1), easing: 'cubic-bezier(.15,.7,.4,1)', delay: (o.delai || 0) + i * 8, fill: 'both'}).finished.then(oter(e), oter(e));
  }
};
/* un éclat qui s'ouvre (étoile à quatre branches + anneau) */
B._eclat = function(p, r, coul, o){
  o = o || {};
  var g = this._fxEl('<circle r="' + f1(r * .7) + '" fill="none" stroke="' + (o.anneau || '#ffffff') + '" stroke-width="' + f1(r * .12) + '" opacity=".9"/><path d="' + eclatD(r) + '" fill="' + (coul || '#fff8d0') + '" stroke="' + O + '" stroke-width="2"/><path d="' + eclatD(r * .5) + '" fill="#ffffff"/>');
  var T = function(s, a){ return 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(' + s + ') rotate(' + a + 'deg)'; };
  g.animate([{transform: T(.2, 0), opacity: 1}, {offset: .3, transform: T(1, o.rot || 20), opacity: 1}, {transform: T(1.3, (o.rot || 20) * 1.5), opacity: 0}], {duration: o.duree || 420, easing: 'ease-out', fill: 'both', delay: o.delai || 0}).finished.then(oter(g), oter(g));
};
/* des bulles d'acide qui gonflent et éclatent */
B._bulles = function(p, n, o){
  o = o || {};
  n = Math.min(n, 6);
  for(var i = 0; i < n; i++){
    var r = hasard(2.5, 6) * (o.taille || 1), g = this._fxEl('<circle r="' + f1(r) + '" fill="' + (o.coul || '#b8f040') + '" fill-opacity=".6" stroke="' + (o.bord || '#3a5a10') + '" stroke-width="1.2"/><circle cx="' + f1(-r * .35) + '" cy="' + f1(-r * .35) + '" r="' + f1(r * .3) + '" fill="#fff" opacity=".8"/>');
    var x = p[0] + hasard(-14, 14) * (o.etendue || 1), y = p[1] + hasard(-6, 6), dy = hasard(-30, -14);
    g.animate([{transform: 'translate(' + f1(x) + 'px,' + f1(y) + 'px) scale(.2)', opacity: 0}, {offset: .2, opacity: 1}, {offset: .85, transform: 'translate(' + f1(x + hasard(-4, 4)) + 'px,' + f1(y + dy) + 'px) scale(1)', opacity: 1},
      {transform: 'translate(' + f1(x) + 'px,' + f1(y + dy) + 'px) scale(1.6)', opacity: 0}], {duration: hasard(500, 900), delay: (o.delai || 0) + i * hasard(30, 90), easing: 'ease-out', fill: 'both'}).finished.then(oter(g), oter(g));
  }
};
/* des éclats de glace */
B._cristaux = function(p, n, o){
  o = o || {};
  n = Math.min(n, 10);
  for(var i = 0; i < n; i++){
    var s = hasard(4, 9) * (o.taille || 1), a = (o.ang == null ? -Math.PI / 2 : o.ang) + (Math.random() - .5) * (o.ouv || Math.PI * 1.8), v = (o.v || 46) * hasard(.5, 1.2);
    var g = this._fxEl(P('M0 ' + f1(-s) + ' L ' + f1(s * .45) + ' 0 L 0 ' + f1(s * .8) + ' L ' + f1(-s * .45) + ' 0 Z', choisir(['#e8f8ff', '#b8e6ff', '#d0f0ff']), ' stroke-width="1.2"') + L('M0 ' + f1(-s * .6) + ' L 0 ' + f1(s * .4), '#ffffff', 1, ' opacity=".9"'));
    var dx = Math.cos(a) * v, dy = Math.sin(a) * v, rot = hasard(-300, 300);
    g.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) rotate(0deg) scale(.4)', opacity: 1}, {offset: .5, transform: 'translate(' + f1(p[0] + dx * .8) + 'px,' + f1(p[1] + dy * .8) + 'px) rotate(' + f1(rot * .5) + 'deg) scale(1)', opacity: 1},
      {transform: 'translate(' + f1(p[0] + dx) + 'px,' + f1(p[1] + dy + 40) + 'px) rotate(' + f1(rot) + 'deg) scale(.8)', opacity: 0}], {duration: hasard(500, 850), delay: (o.delai || 0) + i * 12, easing: 'cubic-bezier(.2,.7,.5,1)', fill: 'both'}).finished.then(oter(g), oter(g));
  }
};
/* des ondes de bruit (arcs qui s'écartent) */
B._ondes = function(p, sens, coul){
  var g = this._fxEl(L('M0 -14 Q ' + f1(-10 * sens) + ' 0 0 14 M' + f1(9 * sens) + ' -20 Q ' + f1(-5 * sens) + ' 0 ' + f1(9 * sens) + ' 20', '#24182e', 6) + L('M0 -14 Q ' + f1(-10 * sens) + ' 0 0 14 M' + f1(9 * sens) + ' -20 Q ' + f1(-5 * sens) + ' 0 ' + f1(9 * sens) + ' 20', coul || '#ffe8a0', 3));
  g.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(.5)', opacity: 0}, {offset: .2, opacity: 1}, {transform: 'translate(' + f1(p[0] + sens * 34) + 'px,' + f1(p[1]) + 'px) scale(1.5)', opacity: 0}], {duration: 600, easing: 'ease-out', fill: 'both'}).finished.then(oter(g), oter(g));
};
/* des rayons de lumière */
B._rayons = function(p, r){
  var s = '';
  for(var i = 0; i < 12; i++){ var a = i / 12 * Math.PI * 2, r0 = r * .35, r1 = r * (i % 2 ? .8 : 1.05); s += 'M' + f1(Math.cos(a) * r0) + ' ' + f1(Math.sin(a) * r0) + ' L ' + f1(Math.cos(a) * r1) + ' ' + f1(Math.sin(a) * r1) + ' '; }
  var g = this._fxEl('<circle r="' + f1(r * .9) + '" fill="' + this.G.lumiere + '"/>' + L(s, '#fff8d0', 4) + L(s, '#ffffff', 1.6));
  var T = function(s2, a){ return 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(' + s2 + ') rotate(' + a + 'deg)'; };
  g.animate([{transform: T(.3, 0), opacity: 0}, {offset: .2, opacity: 1, transform: T(1, 10)}, {transform: T(1.25, 24), opacity: 0}], {duration: 700, easing: 'ease-out', fill: 'forwards'}).finished.then(oter(g), oter(g));
};
/* deux entailles blanches (la dague) */
B._entailles = function(p){
  var g = this._fxEl(L('M-16 -14 Q 0 -2 14 12 M-8 -18 Q 6 -6 18 6', '#24182e', 6) + L('M-16 -14 Q 0 -2 14 12 M-8 -18 Q 6 -6 18 6', '#ffffff', 2.6));
  g.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(.3,1)', opacity: 0}, {offset: .15, opacity: 1, transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(1.1)'}, {transform: 'translate(' + f1(p[0] + 4) + 'px,' + f1(p[1] + 4) + 'px) scale(1.2)', opacity: 0}], {duration: 460, easing: 'ease-out', fill: 'forwards'}).finished.then(oter(g), oter(g));
};
/* les petits traits blancs du cri */
B._cri = function(p, force, sens){
  var traits = '';
  sens = sens || -1;
  for(var i = 0; i < 6; i++){ var a = (sens < 0 ? Math.PI : 0) + (i - 2.5) * .22, r0 = 14, r1 = 26 + (i % 2) * 8; traits += 'M' + f1(Math.cos(a) * r0) + ' ' + f1(Math.sin(a) * r0) + ' L ' + f1(Math.cos(a) * r1) + ' ' + f1(Math.sin(a) * r1) + ' '; }
  var g = this._fxEl(L(traits, '#24182e', 6) + L(traits, '#ffffff', 3));
  g.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(.4)', opacity: 0}, {offset: .2, opacity: 1, transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(' + (force || 1) + ')'}, {transform: 'translate(' + f1(p[0] + sens * 8) + 'px,' + f1(p[1]) + 'px) scale(' + (1.35 * (force || 1)) + ')', opacity: 0}], {duration: 420, easing: 'ease-out', fill: 'forwards'}).finished.then(oter(g), oter(g));
};
/* une boule de feu qui éclate */
B._souffleFeu = function(p, r){
  for(var i = 0; i < 6; i++) this._bouffee([p[0] + hasard(-r, r) * .5, p[1] + hasard(-r, r) * .4], {r: hasard(r * .35, r * .6), coul: choisir(['#ffb040', '#ff7a1a', '#ffd060', '#ff5a10']), op: .9, dx: hasard(-r, r) * .6, dy: hasard(-r * 1.2, -r * .4), duree: hasard(450, 750), delai: i * 30, s0: .4, s1: 1.8});
  this._etincelles(p, 5, {v: r * 1.4, coul: ['#ffd060', '#ff9a30', '#fff0a0']});
};
/* des volutes de fumée */
B._fumee = function(p, n, o){
  o = o || {};
  for(var i = 0; i < n; i++) this._bouffee([p[0] + hasard(-10, 10) * (o.etendue || 1), p[1]], {r: hasard(6, 11) * (o.taille || 1), coul: o.coul || choisir(['#8a8098', '#6a6278', '#9a92a8']), op: o.op || .5, dx: hasard(-8, 18), dy: hasard(-60, -36) * (o.haut || 1), duree: hasard(1000, 1500), delai: i * 90, s1: 2.6});
};

/* =====================================================================
   6. Les états communs
   ===================================================================== */
/* le feu qui reste : des flammes (particules) qui suivent des points du corps, de la fumée, des braises.
   Chaque image, on lit seulement la position des quelques pièces porteuses. */
B._flammes = function(cle, specs){
  var self = this, k = 'flammes_' + cle, ancien = this.fx[k], G = this.G;
  if(ancien){
    this.fx[k] = null;
    cancelAnimationFrame(ancien.raf);
    ancien.g.animate([{opacity: 1}, {opacity: 0}], {duration: 400, fill: 'forwards'}).finished.then(oter(ancien.g), oter(ancien.g));
  }
  if(!specs) return null;
  function flamme(h, w, r, n){
    var dl = (n * .13 % .4).toFixed(2), dur = (.3 + (n * .07 % .22)).toFixed(2);
    /* une seule animation par flamme (le groupe entier ondule) */
    return '<g transform="rotate(' + (r || 0) + ')"><g class="' + PX + '-fl" style="animation-delay:-' + dl + 's;animation-duration:' + dur + 's">' +
      '<path d="' + flammeD(h, w) + '" fill="' + G.feu1 + '" stroke="#5a1a08" stroke-width="2"/>' +
      '<path d="' + flammeD(h * .7, w * .62) + '" fill="#ffa21e"/>' +
      '<path d="' + flammeD(h * .42, w * .36) + '" fill="' + G.feu2 + '"/></g></g>';
  }
  var g = this._el(this.S.monde, ''), o = {g: g, specs: specs, raf: 0}, refs = [];
  specs.forEach(function(s, n){ s.g = self._el(g, (s.lueur ? '<ellipse cx="0" cy="' + f1(-s.lueur[1] * .4) + '" rx="' + s.lueur[0] + '" ry="' + s.lueur[1] + '" fill="' + G.lueurFeu + '"/>' : '') + (s.h ? flamme(s.h, s.w, s.r, n) : '')); if(refs.indexOf(s.ref) < 0) refs.push(s.ref); s.i = refs.indexOf(s.ref); });
  g.animate([{opacity: 0}, {opacity: 1}], {duration: 300});
  this.fx[k] = o;
  /* on lit seulement la position des quelques pièces porteuses ; les flammes restent droites.
     Lire une position force le navigateur à recalculer les styles : au repos (le corps bouge à peine), une image sur trois suffit. */
  var compte = 0;
  (function suivre(){
    if(!g.isConnected || self.fx[k] !== o) return;
    if(!self.enAction && (compte++ % 3)){ o.raf = requestAnimationFrame(suivre); return; }
    var w = self.S.monde.getCTM().inverse(), Ms = refs.map(function(r){ return w.multiply(r.getCTM()); });
    specs.forEach(function(s){
      var m = Ms[s.i], x = m.a * s.x + m.c * s.y + m.e, y = m.b * s.x + m.d * s.y + m.f, kk = Math.max(.3, Math.min(1, .3 + m.d * .9));
      s.g.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) scale(' + (kk * (s.e || 1)).toFixed(2) + ')';
    });
    o.raf = requestAnimationFrame(suivre);
  })();
  return o;
};
/* le feu qui reste sur la bête : des flammes, de la fumée, des braises */
B._e_brule = function(on){
  var self = this;
  this.etat.brule = on;
  if(this.J.suie) this._fondu('suie', on ? 1 : 0, on ? 500 : 900);
  clearTimeout(this.fx.fumee);
  var f = this._flammes('feu', on ? this._specsFeu() : null);
  if(!on) return;
  (function fumee(){
    if(!self.etat.brule || self.mort) return;
    var s = choisir(f.specs), p = self._ou(s.ref, s.x, s.y);
    self._bouffee([p[0], p[1] - 24], {r: hasard(8, 14), coul: choisir(['#8a8098', '#6a6278', '#9a92a8']), op: .45, dx: hasard(10, 40), dy: hasard(-80, -50), duree: hasard(1300, 1900), s1: 2.6});
    if(Math.random() < .6){
      var b = self._fxEl('<circle r="2.4" fill="#ffd060"/>');
      b.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1] - 16) + 'px)', opacity: 1}, {transform: 'translate(' + f1(p[0] + hasard(-20, 30)) + 'px,' + f1(p[1] - hasard(60, 110)) + 'px)', opacity: 0}], {duration: 900, easing: 'ease-out', fill: 'forwards'}).finished.then(oter(b), oter(b));
    }
    self.fx.fumee = setTimeout(fumee, hasard(220, 380));
  })();
  if(!this.enAction && this.attente){ this._couperMinuteurs(); this._planifier(200); }
};
/* une flaque au sol (huile ou colle), dans le repère fixe arrière */
B._flaque = function(type, cx, rx){
  this._enleverFlaque(type);
  var html, sol = this.solY;
  if(type === 'huile'){
    html = '<ellipse cx="' + cx + '" cy="' + sol + '" rx="' + rx + '" ry="' + f1(rx * .07) + '" fill="' + this.G.huile + '" stroke="#0a0812" stroke-width="2" opacity=".95"/>' + L('M' + f1(cx - rx * .8) + ' ' + f1(sol - 3) + ' C ' + f1(cx - rx * .4) + ' ' + f1(sol - 6) + ' ' + f1(cx + rx * .2) + ' ' + f1(sol - 6) + ' ' + f1(cx + rx * .6) + ' ' + f1(sol - 3), '#c8e0ff', 1.6, ' opacity=".45"');
  } else {
    html = '<ellipse cx="' + cx + '" cy="' + sol + '" rx="' + rx + '" ry="' + f1(rx * .065) + '" fill="#c8d84a" fill-opacity=".55" stroke="#5a6420" stroke-width="2"/>' + '<ellipse cx="' + cx + '" cy="' + (sol - 2) + '" rx="' + f1(rx * .85) + '" ry="' + f1(rx * .04) + '" fill="#e8f0a0" opacity=".35"/>' +
      L('M' + f1(cx - rx * .8) + ' ' + f1(sol - 4) + ' C ' + f1(cx - rx * .4) + ' ' + f1(sol - 8) + ' ' + f1(cx + rx * .2) + ' ' + f1(sol - 8) + ' ' + f1(cx + rx * .6) + ' ' + f1(sol - 4), '#ffffd0', 1.8, ' opacity=".7"') +
      [[-.65, 1, 4], [-.2, 4, 3], [.25, -1, 5], [.7, 2, 3.5]].map(function(b, i){ return '<g transform="translate(' + f1(cx + b[0] * rx) + ' ' + f1(sol + b[1]) + ')"><circle r="' + b[2] + '" fill="#e8f0a0" stroke="#5a6420" stroke-width="1" class="' + PX + '-bulle" style="animation-delay:' + (i * .5) + 's"/></g>'; }).join('');
  }
  var g = this._el(this.S.fixeArr, html);
  g.animate([{transform: 'translate(' + cx + 'px,' + sol + 'px) scale(.2,.4) translate(' + (-cx) + 'px,' + (-sol) + 'px)', opacity: 0}, {transform: 'translate(' + cx + 'px,' + sol + 'px) scale(1) translate(' + (-cx) + 'px,' + (-sol) + 'px)', opacity: 1}], {duration: 420, easing: 'cubic-bezier(.2,.8,.3,1.2)'});
  this.fx['flaque_' + type] = g;
  return g;
};
B._enleverFlaque = function(type){
  var g = this.fx['flaque_' + type];
  if(!g) return;
  this.fx['flaque_' + type] = null;
  g.animate([{opacity: 1}, {opacity: 0}], {duration: 500, fill: 'forwards'}).finished.then(oter(g), oter(g));
};
/* la colle : une flaque, des pâtés pré-dessinés sur les pattes ([data-colle]), et il tire sur ses pattes */
B._e_colle = function(on){
  var self = this, c = this._colleSpec();
  this.etat.colle = on;
  if(c.rx){ if(on) this._flaque('colle', c.cx, c.rx); else this._enleverFlaque('colle'); }
  this._tous('[data-colle]').forEach(function(e){ self._fondu(e, on ? 1 : 0, 300); });
  return this._changerMode();
};
/* il tire sur une patte collée : la patte se soulève, le fil de colle (pré-dessiné) s'étire, puis la patte est ramenée d'un coup */
B._tirerPatte = function(){
  var choix = choisir(this._colleSpec().tirer), rep = {}, n, T = 1500, f = choix.fil, sm = choix.etire || 4;
  for(n in choix.p) rep[n] = {a: 0};
  function part(k){ var o = {}; for(var n in choix.p) o[n] = {a: choix.p[n].a * k}; if(f) o[f] = {sy: 1 + (sm - 1) * k}; return o; }
  if(f) rep[f] = {sy: 1};
  this._seq([{t: 0, p: rep}, {t: .3, p: part(.75), e: 'cubic-bezier(.3,.6,.5,1)'}, {t: .4, p: part(.62)}, {t: .5, p: part(.85)}, {t: .58, p: part(.7)}, {t: .72, p: part(1), e: 'ease-in'},
    {t: .8, p: rep, e: 'cubic-bezier(.7,0,1,.6)'}, {t: .86, p: part(.08)}, {t: 1, p: rep}], T, {ajout: true});
  if(choix.corps) this._seq([{t: 0, p: choix.corps0}, {t: .3, p: choix.corps}, {t: .45, p: choix.corps0}, {t: .72, p: choix.corps}, {t: .8, p: choix.corps0, e: 'cubic-bezier(.7,0,1,.6)'}, {t: 1, p: choix.corps0}], T, {ajout: true});
};
/* les étoiles pré-dessinées qui tournent autour de la tête (ébloui, tournis) */
B._allumerEtoiles = function(nom, spec){
  var self = this, n = 0;
  this._eteindreEtoiles(nom, true);
  while(this.J[nom + '_' + n]) n++;
  var m = spec.n || n;
  this._fondu(nom, 1, 250);
  for(var k = 0; k < n; k++){
    var e = this.J[nom + '_' + k], frames = [], ns = 16;
    if(k >= m){ e.style.opacity = 0; continue; }
    e.style.opacity = '';
    for(var s = 0; s <= ns; s++){ var a = s / ns * Math.PI * 2 + k * Math.PI * 2 / m, x = spec.cx + Math.cos(a) * spec.rx, y = spec.cy + Math.sin(a) * spec.ry, devant = Math.sin(a); frames.push({transform: 'translate(' + f1(x) + 'px,' + f1(y) + 'px) scale(' + f1((.75 + devant * .3) * (spec.s || 1)) + ')', opacity: f1(.55 + devant * .45)}); }
    this.fx.orbites[nom + k] = e.animate(frames, {duration: spec.duree || 1500, iterations: Infinity});
  }
};
B._eteindreEtoiles = function(nom, vite){
  var self = this;
  if(!this.J[nom]) return;
  Object.keys(this.fx.orbites).forEach(function(k){ if(k.indexOf(nom) === 0 && /\d$/.test(k)){ self.fx.orbites[k].cancel(); delete self.fx.orbites[k]; } });
  this._fondu(nom, 0, vite ? 0 : 200);
};
B._e_ebloui = function(on){
  this.etat.ebloui = on;
  if(on) this._allumerEtoiles('etoiles', this._etoilesSpec()); else this._eteindreEtoiles('etoiles');
  if(this.J.patteYeux) this._fondu('patteYeux', on ? 1 : 0, 300);
  this._majPointFaible();
  return this._changerMode();
};
/* le gel : les variantes [data-gel] (glace et cristaux pré-dessinés) apparaissent, il ne bouge presque plus */
B._e_gele = function(on){
  var self = this;
  this.etat.gele = on;
  this._tous('[data-gel]').forEach(function(e){ if(e.getAttribute('data-gel') !== 'armure' || !self.etat.nu) self._fondu(e, on ? 1 : 0, on ? 500 : 900); });
  clearTimeout(this.fx.givreT);
  if(on) (function souffle(){
    if(!self.etat.gele || self.mort) return;
    var p = self._pt(self.A.bouche ? 'bouche' : 'centre');
    self._bouffee(p, {r: 4, coul: '#eef8ff', op: .7, dx: hasard(-24, -12), dy: hasard(-12, -2), duree: 900, s1: 2.6});
    self.fx.givreT = setTimeout(souffle, hasard(1000, 1800));
  })();
  else {
    /* la glace fond : quelques gouttes */
    var c = this._pt('centre');
    for(var i = 0; i < 3; i++) this._goutteTombe([c[0] + hasard(-40, 40), c[1] + hasard(-10, 20)], {coul: '#b8e6ff'});
  }
  return this._changerMode();
};
/* le point faible ouvert : la variante [data-pf] du mode courant brille et palpite */
B._e_ouvert = function(on){
  this.etat.ouvert = on;
  this._majPointFaible();
};
B._majPointFaible = function(){
  var self = this, actif = this.etat.ouvert ? this._pfActif() : null;
  this._tous('[data-pf]').forEach(function(e){
    var nom = e.getAttribute('data-j'), oui = e.getAttribute('data-pf') === actif;
    if(oui === (e.getAttribute('data-on') === '1')) return;
    e.setAttribute('data-on', oui ? '1' : '0');
    self._fondu(e, oui ? 1 : 0, 350);
    self._pulser(nom, oui, {s0: .9, s1: 1.12, duree: 650});
  });
};
B._e_cible = function(on){ this.etat.cible = on; return this._changerMode(); };

/* =====================================================================
   7. L'explosion du critique : brume noire, onde de choc, éclats — calque posé sur la scène, une vingtaine de particules
   ===================================================================== */
B._boum = function(scene, o){
  scene = scene || this.c.parentNode || this.c;
  if(getComputedStyle(scene).position === 'static') scene.style.position = 'relative';
  var sr = scene.getBoundingClientRect(), ech = (scene.offsetWidth || sr.width) / (sr.width || 1);
  var W = scene.offsetWidth || sr.width, H = scene.offsetHeight || sr.height;
  var pe = this._ecran(o.ref, o.x, o.y), cx = (pe.x - sr.left) * ech, cy = (pe.y - sr.top) * ech;
  var u = this._echelle() * ech * (o.u || 1) * 2.4;
  var ov = document.createElementNS(NS, 'svg');
  ov.setAttribute('class', PX + '-scene-fx'); ov.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
  var fl = PX + 'Boom' + (++NUM), bru = ['#0c0812', '#160f20', '#1e1628'], cla = ['#4a3e5a', '#6a5a80'];
  ov.innerHTML = '<defs>' +
    '<radialGradient id="' + fl + 'c"><stop offset="0" stop-color="#ffe8a0"/><stop offset=".35" stop-color="#ff8a30" stop-opacity=".9"/><stop offset=".7" stop-color="#a02a40" stop-opacity=".5"/><stop offset="1" stop-color="#3a1030" stop-opacity="0"/></radialGradient>' +
    bru.map(function(c, i){ return '<radialGradient id="' + fl + 'b' + i + '"><stop offset="0" stop-color="' + c + '" stop-opacity=".97"/><stop offset=".6" stop-color="' + c + '" stop-opacity=".88"/><stop offset="1" stop-color="' + c + '" stop-opacity="0"/></radialGradient>'; }).join('') +
    cla.map(function(c, i){ return '<radialGradient id="' + fl + 'l' + i + '"><stop offset="0" stop-color="' + c + '" stop-opacity=".75"/><stop offset="1" stop-color="' + c + '" stop-opacity="0"/></radialGradient>'; }).join('') + '</defs>';
  scene.appendChild(ov);
  function el(html){ var g = document.createElementNS(NS, 'g'); g.innerHTML = html; ov.appendChild(g); return g; }
  function T(x, y, s, r){ return 'translate(' + f1(x) + 'px,' + f1(y) + 'px) rotate(' + f1(r || 0) + 'deg) scale(' + (s == null ? 1 : s) + ')'; }
  var anims = [], D = (o.duree || 1);
  /* le cœur brûlant (orange, pas blanc), puis l'onde de choc */
  var c1 = el('<circle r="' + f1(50 * u) + '" fill="url(#' + fl + 'c)"/>');
  c1.animate([{transform: T(cx, cy, .15), opacity: 1}, {offset: .35, transform: T(cx, cy, 1), opacity: 1}, {transform: T(cx, cy, 1.4), opacity: 0}], {duration: 420, easing: 'ease-out', fill: 'forwards'}).finished.then(oter(c1), oter(c1));
  var c2 = el('<circle r="' + f1(40 * u) + '" fill="none" stroke="#2a1c3c" stroke-width="' + f1(10 * u) + '" opacity=".85"/><circle r="' + f1(40 * u) + '" fill="none" stroke="#d8c8f0" stroke-width="' + f1(2.4 * u) + '"/>');
  c2.animate([{transform: T(cx, cy, .2), opacity: 1}, {transform: T(cx, cy, 3.2), opacity: 0}], {duration: 650, easing: 'cubic-bezier(.1,.8,.3,1)', fill: 'forwards'}).finished.then(oter(c2), oter(c2));
  /* le nuage de brume noire : de grosses volutes qui jaillissent, restent, puis se dissipent en montant */
  var nb = o.brume || 11;
  for(var n = 0; n < nb; n++){
    var a = (n / nb) * Math.PI * 2 + hasard(-.3, .3), d = n % 3 === 0 ? .25 : hasard(.5, 1), r = hasard(28, 46) * u, x = Math.cos(a) * d * 64 * u, y = Math.sin(a) * d * 30 * u - 8 * u;
    var g = el('<circle r="' + f1(r) + '" fill="url(#' + fl + 'b' + (n % 3) + ')"/><circle cx="' + f1(-r * .25) + '" cy="' + f1(-r * .3) + '" r="' + f1(r * .7) + '" fill="url(#' + fl + 'l' + (n % 2) + ')"/>');
    var dx = x * 1.7 + hasard(-14, 14) * u, dy = y * 1.4 - hasard(10, 40) * u;
    anims.push(g.animate([{transform: T(cx, cy, .1), opacity: 0}, {offset: .05, opacity: 1, transform: T(cx + x, cy + y, .9)},
      {offset: .5, opacity: .95, transform: T(cx + dx, cy + dy, 1.4)}, {transform: T(cx + dx * 1.3 + hasard(-20, 20) * u, cy + dy * 1.2 - 40 * u, 2), opacity: 0}],
      {duration: hasard(2500, 3200) * D, easing: 'cubic-bezier(.12,.75,.3,1)', fill: 'forwards'}));
  }
  /* des étincelles */
  for(var s = 0; s < 7; s++){
    var as = Math.random() * Math.PI * 2, vs = hasard(60, 140) * u, ls = hasard(7, 14) * u;
    var e = el(L('M0 0 L ' + f1(-Math.cos(as) * ls) + ' ' + f1(-Math.sin(as) * ls), choisir(['#fff4b0', '#ffd060', '#ffb040']), 2.6 * u));
    e.animate([{transform: T(cx, cy), opacity: 1}, {transform: T(cx + Math.cos(as) * vs, cy + Math.sin(as) * vs + 34 * u), opacity: 0}], {duration: hasard(450, 850), easing: 'cubic-bezier(.1,.7,.4,1)', fill: 'forwards'}).finished.then(oter(e), oter(e));
  }
  /* ce qui est propre à la bête (touffes, pattes, morceaux…) : quelques particules de plus */
  if(o.extra) o.extra(el, cx, cy, u, T);
  return {ov: ov, fini: Promise.all(anims.map(fini)).then(function(){ ov.remove(); }), cx: cx, cy: cy, u: u};
};
/* une copie de pièce(s), posée dans le repère fixe exactement où elle est ; la pièce d'origine est cachée (opacité).
   La copie est un débris (hors des pièces) : elle peut voler, tomber et rester au sol. */
B._detacher = function(noms, parent){
  var self = this, rep = parent || this.S.fixe, ref = this.J[noms[0]], M = rep.getCTM().inverse().multiply(ref.getCTM());
  var g = this._el(rep, '');
  g.setAttribute('data-debris', '1');
  noms.forEach(function(n){
    var el = self.J[n], Mn = rep.getCTM().inverse().multiply(el.getCTM()), inner = document.createElementNS(NS, 'g');
    var Mr = M.inverse().multiply(Mn);
    inner.setAttribute('transform', 'matrix(' + [M.a, M.b, M.c, M.d].map(r3).join(' ') + ' 0 0) matrix(' + [Mr.a, Mr.b, Mr.c, Mr.d, Mr.e, Mr.f].map(r3).join(' ') + ')');
    inner.innerHTML = el.innerHTML;
    [].forEach.call(inner.querySelectorAll('[data-a],[data-slot]'), function(e){ e.remove(); });
    [].forEach.call(inner.querySelectorAll('[data-j]'), function(e){ e.removeAttribute('data-j'); });
    g.appendChild(inner);
    el.style.opacity = 0;
    if(self.tombees) self.tombees[n] = 1;
  });
  g.style.transform = 'translate(' + f1(M.e) + 'px,' + f1(M.f) + 'px)';
  var bb = g.getBBox(), ang = Math.atan2(M.b, M.a) * 180 / Math.PI;
  return {g: g, c: [M.e, M.f], bb: bb, ang: ang};
};
/* un morceau qui vole puis retombe et reste au sol (dans le repère fixe de la bête) */
B._voler = function(g, depart, arrivee, o){
  o = o || {};
  var h = o.haut == null ? 60 : o.haut, rot = o.rot || 0, d = o.duree || 900, rebond = o.rebond == null ? 8 : o.rebond;
  var my = Math.min(depart[1], arrivee[1]) - h, sy = o.sy || 1;
  function T(p, r, k){ return 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) rotate(' + f1(r) + 'deg) scale(1,' + f1(1 + (sy - 1) * (k || 0)) + ')'; }
  var cles = [{offset: 0, transform: T(depart, o.rot0 || 0, 0), easing: 'cubic-bezier(.2,.6,.5,1)'}, {offset: .45, transform: T([lerp(depart, arrivee, .5)[0], my], (o.rot0 || 0) + rot * .5, 0), easing: 'cubic-bezier(.5,0,.9,.6)'},
    {offset: .78, transform: T(arrivee, rot, .8), easing: 'cubic-bezier(.2,.7,.4,1)'}, {offset: .9, transform: T([arrivee[0] + (o.glisse || 0) * .7, arrivee[1] - rebond], rot + (o.bascule || 6), .9), easing: 'cubic-bezier(.5,0,.9,.6)'}, {offset: 1, transform: T([arrivee[0] + (o.glisse || 0), arrivee[1]], rot, 1)}];
  var a = g.animate(cles, {duration: d, delay: o.delai || 0, fill: 'both'});
  if(o.onSol) this._minuteur(o.onSol, (o.delai || 0) + d * .78);
  return a;
};

/* =====================================================================
   8. L'acteur que reçoit le moteur
   ===================================================================== */
function acteur(b){
  return {
    info: b.info,
    entrer: function(o){ return b.entrer(o); },
    attendre: function(){ return b.attendre(); },
    attaquer: function(nom, o){ return b.attaquer(nom, o); },
    touche: function(type, o){ return b.touche(type, o); },
    special: function(nom, o){ return b.special(nom, o); },
    tousser: function(){ return b.tousser(); },
    fuir: function(){ return b.fuir(); },
    mourir: function(){ return b.mourir(); },
    exploser: function(scene){ return b.exploser(scene); },
    etat: function(nom, on){ return b.etatPublic(nom, on); },
    etatCourant: function(){ return b.etatCourant(); },
    cible: function(on){ return b.etatPublic('cible', on); },
    ancre: function(nom){ return b.ancre(nom); },
    arreter: function(){ b.arreter(); return this; },
    _bete: b
  };
}

/* =====================================================================
   A. Le dessin de la petite araignée : la même que sa mère (chitine brune, anneaux clairs, losanges orange, yeux rouges),
   mais vue de profil, car elle court au sol. Quatre pattes de chaque côté : celles du fond plus sombres.
   ===================================================================== */
var SOLP = 140;
var PATTES = {
  r1: [[88, 104], [66, 66], [44, 134]], r2: [[94, 104], [90, 58], [86, 134]], r3: [[100, 104], [126, 58], [146, 134]], r4: [[106, 102], [160, 62], [202, 134]],
  l1: [[84, 108], [60, 72], [30, 138]], l2: [[90, 110], [80, 64], [64, 140]], l3: [[98, 110], [118, 64], [130, 140]], l4: [[104, 108], [152, 68], [188, 138]]
};
var AVANT = ['l1', 'l2', 'r1', 'r2'], ARRIERE = ['l3', 'l4', 'r3', 'r4'], TOUTES = AVANT.concat(ARRIERE);

function dessinerPetite(D){
  var chit = '#40302f', bande = '#a27a52', GL = D.glace(), NG = 0;
  var gCol = D.g(chit), gColF = D.g(sombre(chit, .32)), gJ = D.g(sombre(bande, .15)), gJF = D.g(sombre(bande, .45));
  this.G.oeuf = D.rad([[0, '#fff8e8'], [.5, '#f4dca8'], [1, '#c8945a']], .38, .32, .78);
  this.G.cendre = D.g('#7a6e70');
  function gel(d){ return variante('gelP' + (++NG), F(d, GL) + L(d, '#ffffff', 1.2, ' opacity=".6"'), ' data-gel'); }
  function poilsLe(tb, n, lg, R){
    var s = '';
    [tb.g, tb.dr].forEach(function(b, cote){ for(var q = 0; q < b.length - 1; q++) for(var z = 0; z < n; z++){ var p = lerp(b[q], b[q + 1], (z + R()) / n), c = lerp(tb.g[q], tb.dr[q], .5), ox = p[0] - c[0], oy = p[1] - c[1], ol = Math.hypot(ox, oy) || 1, h = lg * (.6 + R() * .7); s += 'M' + pt(p) + ' l ' + f1(ox / ol * h) + ' ' + f1(oy / ol * h + h * .3) + ' '; } });
    return s;
  }
  /* une patte : la cuisse (hanche → genou, qui monte), le tibia (genou → pied, qui descend au sol) */
  function patte(n, fonce){
    var g = PATTES[n], h = g[0], K = g[1], t = g[2], R = rng(n.charCodeAt(0) * 7 + (+n[1]) * 13);
    var fem = tube([h, lerp(h, K, .5), K], [7.4, 6.4, 5.4]), mid = lerp(K, t, .5), dx = t[0] - K[0], dy = t[1] - K[1], l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l;
    var tib = tube([K, [mid[0] + nx * 2, mid[1] + ny * 2], t], [5.2, 3.8, 1.6]), col = fonce ? gColF : gCol;
    var ux = dx / l, uy = dy / l;
    var s0 = L(poilsLe(fem, 2, 3, R), fonce ? '#5a4a52' : '#8a7470', 1, ' opacity=".9"') + P(fem.d, col, ' stroke-width="2"') +
      L('M' + pt(lerp(h, K, .78)) + ' L ' + pt(lerp(h, K, .93)), fonce ? sombre(bande, .35) : bande, 6.4, ' opacity=".9"') + L(lisse(fem.dr), fonce ? '#7a6a8a' : LUNE, 1, ' opacity=".5"');
    var s1 = L(poilsLe(tib, 2, 2.4, R), fonce ? '#5a4a52' : '#8a7470', .9, ' opacity=".9"') + P(tib.d, col, ' stroke-width="1.8"') +
      '<ellipse cx="' + K[0] + '" cy="' + K[1] + '" rx="4.4" ry="3.8" fill="' + (fonce ? gJF : gJ) + '" stroke="' + O + '" stroke-width="1.6"/>' + C(K[0] + 1, K[1] - 1, 1.2, '#ffe8c8', ' opacity=".5"') +
      L('M' + pt(t) + ' q ' + f1(ux * 3 - 2) + ' ' + f1(uy * 3) + ' ' + f1(ux * 2 - 4) + ' ' + f1(uy * 2 + 2), '#120c10', 1.6) + repere('pied_' + n, t[0], t[1]);
    if(!fonce){
      s0 += gel(fem.d); s1 += gel(tib.d);
      if(n !== 'l4') s1 += variante('fil_' + n, F('M' + f1(t[0] - 4) + ' ' + f1(t[1] - 1) + ' C ' + f1(t[0] - 2) + ' ' + f1(t[1] + 1) + ' ' + f1(t[0] - 1.6) + ' ' + f1(t[1] + 2.4) + ' ' + f1(t[0] - 2) + ' ' + f1(t[1] + 4) + ' L ' + f1(t[0] + 2) + ' ' + f1(t[1] + 4) + ' C ' + f1(t[0] + 1.6) + ' ' + f1(t[1] + 2.4) + ' ' + f1(t[0] + 2) + ' ' + f1(t[1] + 1) + ' ' + f1(t[0] + 4) + ' ' + f1(t[1] - 1) + ' Z', '#d8e870', ' fill-opacity=".92"'), ' data-colle', t[0], t[1] - 1) +
        variante('colle_' + n, '<ellipse cx="' + t[0] + '" cy="' + (t[1] - 2) + '" rx="8" ry="5.4" fill="#d0e05a" fill-opacity=".92" stroke="#5a6420" stroke-width="1.2"/>' + C(t[0] - 2.6, t[1] - 4, 1.6, '#fbffd0', ' opacity=".8"'), ' data-colle');
    }
    return piv(n, h[0], h[1], s0 + piv(n + 't', K[0], K[1], s1));
  }
  var fond = ['r4', 'r3', 'r2', 'r1'].map(function(n){ return patte(n, true); }).join(''), devant = ['l4', 'l3', 'l2', 'l1'].map(function(n){ return patte(n, false); }).join('');

  /* ---- l'abdomen, de profil : losanges orange sur la crête, le ventre plus clair dessous ---- */
  var Ab = [140, 92], rA = -.24, abdD = ellChemin(Ab, 32, 25, rA, 14, .05, 5), R = rng(19), fr = '', du = '';
  for(var k = 0; k < 36; k++){ var a = k / 36 * Math.PI * 2, p0 = ell(Ab, 31, 24, rA, a), p1 = ell(Ab, 35 + R() * 2, 28 + R() * 2, rA, a + .05); fr += 'M' + pt(p0) + ' L ' + pt(p1) + ' '; }
  for(var k2 = 0; k2 < 70; k2++){ var a2 = R() * Math.PI * 2, r2 = Math.sqrt(R()), p2 = ell(Ab, 30 * r2, 23 * r2, rA, a2); du += 'M' + pt(p2) + ' l ' + f1(2 + R() * 2) + ' ' + f1(-.5 + R()) + ' '; }
  var los = '', losG = D.lin([[0, '#ffb060'], [.5, '#e8762a'], [1, '#a8441a']], 1, 0, 0, 1);
  [[124, 74, 7], [140, 70, 6.4], [156, 71, 5.4], [168, 76, 4]].forEach(function(q){ los += P('M' + f1(q[0] - q[2] * 1.2) + ' ' + q[1] + ' L ' + q[0] + ' ' + f1(q[1] - q[2] * .8) + ' L ' + f1(q[0] + q[2] * 1.2) + ' ' + q[1] + ' L ' + q[0] + ' ' + f1(q[1] + q[2] * .8) + ' Z', losG, ' stroke-width="1.8"') + L('M' + f1(q[0] - q[2] * .6) + ' ' + q[1] + ' L ' + f1(q[0] + q[2] * .6) + ' ' + q[1], '#ffe0a8', 1, ' opacity=".7"'); });
  var abdo = piv('abdo', 118, 96, F(abdD, '#000', ' opacity=".22" transform="translate(-3 5)"') + L(fr, '#2a1c1e', 1.1) + P(abdD, D.rad([[0, '#6a5048'], [.55, '#463430'], [1, '#22181c']], .62, .3, .8)) +
    '<g' + D.clip(abdD) + '>' + F('M100 104 C 120 124 160 118 176 98 L 180 130 L 96 130 Z', '#a0806a', ' opacity=".55"') + L('M106 90 C 130 74 156 70 176 80', '#140a0c', 6, ' opacity=".5"') + los +
    L(du, '#c8a890', .8, ' opacity=".35"') + '<ellipse cx="150" cy="74" rx="14" ry="6" transform="rotate(-14 150 74)" fill="' + D.doux('#ffffff', .4) + '"/>' + '</g>' +
    L('M116 72 C 132 64 156 62 168 70', LUNE, 1.6, ' opacity=".6"') + P('M168 82 C 172 78 178 80 177 86 C 175 90 170 89 168 82 Z', D.g('#5a4440'), ' stroke-width="1.4"') +
    gel(abdD) + variante('suie', '<ellipse cx="140" cy="78" rx="28" ry="12" fill="#140c10" opacity=".4"/>') +
    variante('pfL', '<ellipse cx="140" cy="104" rx="30" ry="16" fill="' + D.doux('#ffd040', .85) + '"/><ellipse cx="140" cy="104" rx="16" ry="8" fill="' + D.doux('#fff4b0', .95) + '"/><ellipse cx="140" cy="104" rx="14" ry="7" fill="none" stroke="#fff8d0" stroke-width="1.6" stroke-dasharray="3 4"/>', ' data-pf="ventre"', 140, 104) +
    repere('pf', 140, 106) + repere('haut', 140, 64));

  /* ---- la tête-thorax : carapace, pédipalpe, chélicère et son crochet, quatre yeux rouges de ce côté ---- */
  var Ce = [92, 100], cD = ellChemin(Ce, 21, 16, -.14, 12, .04, 3), sil = '';
  for(var k3 = 0; k3 < 5; k3++){ var a3 = -2.6 + k3 * .55; sil += 'M96 100 L ' + pt(ell(Ce, 19, 14, -.14, a3)) + ' '; }
  var palpe = piv('palpe', 80, 108, P(tube([[82, 108], [72, 112], [64, 118]], [5, 4.4, 3.8]).d, gCol, ' stroke-width="1.8"') + '<ellipse cx="63" cy="119" rx="3.6" ry="3" fill="' + D.g(sombre(chit, .2)) + '" stroke="' + O + '" stroke-width="1.6"/>');
  var chel = piv('chel', 80, 106, P('M76 104 C 70 108 70 116 74 120 C 78 122 84 118 84 112 C 84 106 80 103 76 104 Z', D.g('#5a4240'), ' stroke-width="1.8"') +
    P('M73 118 C 71 124 74 129 80 131 C 82 131 82 129 80 128 C 76 126 75 122 76 118 Z', D.lin([[0, '#5a5060'], [.4, '#1a141c'], [1, '#050306']], 1, 0, 0, 1), ' stroke-width="1.4"') + L('M74 120 C 74 125 76 128 79 129', '#d8d0e8', .8, ' opacity=".75"'));
  var gy = D.rad([[0, '#fff2a0'], [.35, '#ff5a2a'], [.8, '#a00a14'], [1, '#4a0008']], .4, .38, .65), yeux = '';
  [[76, 94, 4.6], [85, 90, 4.4], [72, 99, 2.8], [82, 85, 2.6]].forEach(function(y){ yeux += '<circle cx="' + y[0] + '" cy="' + y[1] + '" r="' + y[2] + '" fill="' + gy + '" stroke="' + O + '" stroke-width="1.4"/>' + C(f1(y[0] - y[2] * .3), f1(y[1] - y[2] * .35), f1(y[2] * .33), '#ffffff', ' opacity=".9"'); });
  var patteYeux = variante('patteYeux', P(tube([[98, 110], [92, 92], [80, 84], [66, 90]], [7, 6, 5, 3]).d, gCol, ' stroke-width="1.8"') + L('M' + pt([94, 96]) + ' L ' + pt([92, 91]), bande, 6, ' opacity=".9"') + '<ellipse cx="92" cy="92" rx="4" ry="3.6" fill="' + gJ + '" stroke="' + O + '" stroke-width="1.4"/>' + L('M66 90 q -3 2 -5 0', '#120c10', 1.6), '', 92, 96);
  var tete = piv('tete', 104, 104, F(cD, '#000', ' opacity=".22" transform="translate(-2 4)"') + P(cD, D.rad([[0, '#6e5450'], [.6, '#4a3634'], [1, '#261a1e']], .62, .3, .8)) +
    '<g' + D.clip(cD) + '>' + L(sil, '#1e1418', 1.1, ' opacity=".5"') + '<ellipse cx="96" cy="92" rx="8" ry="4" fill="' + D.doux('#ffffff', .35) + '"/></g>' + L('M74 92 C 82 84 96 82 108 88', LUNE, 1.4, ' opacity=".55"') +
    palpe + chel + '<ellipse cx="80" cy="92" rx="16" ry="12" fill="' + D.halo('#ff9a80', '#ff2a1a') + '" opacity=".55"/>' + yeux +
    variante('yeuxRage', '<ellipse cx="80" cy="92" rx="24" ry="18" fill="' + D.halo('#ffe0a0', '#ff2a10') + '"/>', '', 80, 92) + patteYeux + gel(cD) +
    etoilesDessin(D, 'etoiles', 88, 70, 34, 4, 10) + repere('tete', 88, 94) + repere('bouche', 72, 122));

  var ombre = '<ellipse cx="112" cy="' + SOLP + '" rx="84" ry="7" fill="' + D.doux('#000000', .55) + '"/>';
  return slot('fixeArr') + piv('pos', 110, SOLP, piv('ombre', 112, SOLP, ombre) + piv('saut', 110, SOLP, piv('secousse', 110, 100, piv('posture', 110, 100, piv('corps', 112, 100,
    fond + abdo + P(tube([[106, 100], [116, 97]], [9, 8]).d, D.g('#2a1e22'), ' stroke-width="1.8"') + devant + tete + repere('centre', 116, 98) + repere('pieds', 110, 138)))))) + slot('monde') + slot('fixe');
}

/* =====================================================================
   B. Les poses et le trot
   ===================================================================== */
function jambes(f){ var p = {}; TOUTES.forEach(function(n){ var r = f(n, AVANT.indexOf(n) >= 0); if(r){ p[n] = r[0]; p[n + 't'] = r[1]; } }); return p; }
var REPOS = jambes(function(){ return [{a: 0}, {a: 0}]; });
var POSES = {
  normal: {},
  /* éblouie : elle se cabre, une patte devant les yeux */
  ebloui: avec(jambes(function(n, av){ return av ? [{a: -6}, {a: 10}] : [{a: 6}, {a: -6}]; }), {posture: {a: 10, x: 4, y: -4}, tete: {a: -10}}),
  /* sur le dos : retournée, les pattes en l'air */
  dos: (function(){ var r = rotAutour(180, [114, 98], [110, 100]); return avec(jambes(function(n, av){ return [{a: av ? -14 : 14}, {a: av ? 26 : -26}]; }), {posture: {a: r.a, x: r.x, y: r.y + 6}, tete: {a: 8}, ombre: {sx: .8}}); })()
};
/* le trot : deux groupes de quatre pattes qui se lèvent tour à tour */
var GA = ['l1', 'r2', 'l3', 'r4'];
function pas(leve){ return jambes(function(n, av){ var l = leve.indexOf(n) >= 0; return av ? [{a: l ? -12 : 7}, {a: l ? 24 : 0}] : [{a: l ? 12 : -7}, {a: l ? -24 : 0}]; }); }
var TROT = [{t: 0, p: avec(pas(GA), {saut: {y: -3}, corps: {a: -2}})}, {t: .25, p: avec(pas([]), {saut: {y: 0}, corps: {a: 0}})},
  {t: .5, p: avec(pas(TOUTES.filter(function(n){ return GA.indexOf(n) < 0; })), {saut: {y: -3}, corps: {a: 2}})}, {t: .75, p: avec(pas([]), {saut: {y: 0}, corps: {a: 0}})}, {t: 1, p: avec(pas(GA), {saut: {y: -3}, corps: {a: -2}})}];

/* =====================================================================
   C. La petite araignée : construction, attente
   ===================================================================== */
function Petite(conteneur, options){
  this._init(conteneur, options, '0 0 220 160', dessinerPetite);
  this.solY = SOLP;
  this.tailleFx = .35;
  this._reprendre(0);
}
var R = Petite.prototype = Object.create(Bete.prototype);
R.constructor = Petite;
R._mode = function(){ return this.etat.dos ? 'dos' : (this.etat.ebloui ? 'ebloui' : 'normal'); };
R._base = function(){
  var m = this._mode(), p = copie(POSES[m]);
  if(this.etat.cible && m === 'normal'){ p.saut = {sy: .93, sx: 1.04}; p.tete = {a: -5}; }
  if(this.etat.enrage && m === 'normal'){ p.chel = {a: 14}; p.tete = {a: -4}; }
  return p;
};
R._ancreNom = function(nom){ return nom === 'pointfaible' ? 'pf' : nom; };
R._lancerBoucles = function(){
  var b = this._boucleur(), mode = this._mode(), V = this.etat.enrage ? 1.6 : 1;
  this.vitesse = V;
  b = this._boucleur();
  if(this.etat.gele){ b('secousse', [[0, {x: 0}], [.25, {x: .5}], [.5, {x: -.5}], [.75, {x: .4}], [1, {x: 0}]], 140, 'linear'); this._planifier(1200); return; }
  if(mode === 'dos'){
    TOUTES.forEach(function(n, i){ b(n, [[0, {a: 0}], [.5, {a: (i % 2 ? 1 : -1) * 18}], [1, {a: 0}]], 220 + i * 19, 'ease-in-out', -i * 40); b(n + 't', [[0, {a: 0}], [.5, {a: (i % 2 ? -1 : 1) * 22}], [1, {a: 0}]], 200 + i * 23, 'ease-in-out', -i * 30); });
    b('posture', [[0, {x: 0}], [.25, {x: 2}], [.5, {x: 0}], [.75, {x: -2}], [1, {x: 0}]], 500, 'ease-in-out');
    b('chel', [[0, {a: 0}], [.5, {a: 16}], [1, {a: 0}]], 400, 'ease-in-out');
  } else {
    b('abdo', [[0, {sx: 1, sy: 1}], [.45, {sx: 1.03, sy: 1.04}], [1, {sx: 1, sy: 1}]], mode === 'ebloui' ? 700 : 1300, 'ease-in-out');
    b('corps', [[0, {y: 0}], [.5, {y: .8}], [1, {y: 0}]], 1300, 'ease-in-out');
    b('palpe', [[0, {a: 0}], [.3, {a: -10}], [.6, {a: 4}], [1, {a: 0}]], 900, 'ease-in-out');
    b('chel', [[0, {a: 0}], [.5, {a: 5}], [1, {a: 0}]], 1100, 'ease-in-out');
    ['l1', 'l2', 'l3', 'l4'].forEach(function(n, i){ b(n, [[0, {a: 0}], [.5, {a: (i < 2 ? -1 : 1) * 2.4}], [1, {a: 0}]], 700 + i * 90, 'ease-in-out', -i * 120); });
    if(mode === 'ebloui') b('tete', [[0, {a: 0}], [.25, {a: -6}], [.5, {a: 3}], [.75, {a: -4}], [1, {a: 0}]], 700, 'ease-in-out');
    if(this.etat.enrage) b('secousse', [[0, {x: 0}], [.25, {x: .7}], [.5, {x: -.7}], [.75, {x: .5}], [1, {x: 0}]], 130, 'linear');
  }
  this._planifier(400);
};
/* petits événements : elle piétine, claque des crochets, sautille, tourne la tête */
R._evenement = function(){
  var self = this, mode = this._mode(), A = {ajout: true, vitesse: this.vitesse}, liste = mode === 'normal' ? ['pietine', 'pietine', 'crochets', 'sautille', 'regarde'] : ['crochets'];
  if(this.etat.colle) liste = ['colle', 'colle', 'crochets'];
  if(this.etat.brule) liste = liste.concat(['sautille', 'sautille']);
  switch(choisir(liste)){
    case 'pietine':
      var k = [{t: 0, p: avec(pas([]), {})}];
      for(var i = 1; i <= 4; i++) k.push({t: i / 5, p: pas(i % 2 ? GA : TOUTES.filter(function(n){ return GA.indexOf(n) < 0; }))});
      k.push({t: 1, p: pas([])});
      this._seq(k, 650, A);
      break;
    case 'crochets':
      this._seq([{t: 0, p: {chel: {a: 0}, palpe: {a: 0}}}, {t: .3, p: {chel: {a: 22}, palpe: {a: -14}}, e: 'ease-out'}, {t: .45, p: {chel: {a: -2}, palpe: {a: 2}}, e: 'cubic-bezier(.7,0,1,.5)'}, {t: .62, p: {chel: {a: 18}}}, {t: .75, p: {chel: {a: -2}}}, {t: 1, p: {chel: {a: 0}, palpe: {a: 0}}}], 650, A);
      break;
    case 'sautille':
      this._seq([{t: 0, p: {saut: {y: 0, sy: 1}}}, {t: .2, p: {saut: {y: 2, sy: .88}}}, {t: .5, p: {saut: {y: -16, sy: 1.08}}, e: 'cubic-bezier(.2,.8,.4,1)'}, {t: .8, p: {saut: {y: 0, sy: .9}}, e: 'cubic-bezier(.6,0,.9,.5)'}, {t: 1, p: {saut: {y: 0, sy: 1}}}], 520, A);
      break;
    case 'regarde':
      this._seq([{t: 0, p: {tete: {a: 0}, posture: {x: 0}}}, {t: .3, p: {tete: {a: -6}, posture: {x: -4}}}, {t: .75, p: {tete: {a: -5}, posture: {x: -3}}}, {t: 1, p: {tete: {a: 0}, posture: {x: 0}}}], 1100, A);
      break;
    case 'colle':
      this._tirerPatte();
      break;
  }
};
R._specsFeu = function(){
  var A = this.J.abdo.firstElementChild, T = this.J.tete.firstElementChild;
  return [{ref: A, x: 138, y: 76, lueur: [50, 36]}, {ref: A, x: 124, y: 72, h: 28, w: 14, r: -8}, {ref: A, x: 142, y: 68, h: 36, w: 16, r: 0}, {ref: A, x: 160, y: 72, h: 26, w: 13, r: 8}, {ref: T, x: 94, y: 86, h: 20, w: 11, r: -4}];
};
R._colleSpec = function(){
  function t(n, a, b){ var p = {}; p[n] = {a: a}; p[n + 't'] = {a: b}; return p; }
  return {cx: 112, rx: 92, tirer: [{p: t('l1', -14, 22), fil: 'fil_l1', etire: 3.6, corps: {corps: {a: -3}, tete: {a: 6}}, corps0: {corps: {a: 0}, tete: {a: 0}}},
    {p: t('l2', -10, 20), fil: 'fil_l2', etire: 3.6, corps: {corps: {a: -2}, tete: {a: 4}}, corps0: {corps: {a: 0}, tete: {a: 0}}},
    {p: t('l3', 12, -22), fil: 'fil_l3', etire: 3.6, corps: {corps: {a: 3}, tete: {a: -4}}, corps0: {corps: {a: 0}, tete: {a: 0}}}]};
};
R._etoilesSpec = function(){ return {cx: 88, cy: 70, rx: 36, ry: 9, n: 4}; };
R._pfActif = function(){ return 'ventre'; };
R._e_enrage = function(on){
  this.etat.enrage = on;
  this._fondu('yeuxRage', on ? 1 : 0, 400);
  this._pulser('yeuxRage', on, {s0: .85, s1: 1.25, duree: 600});
  return this._changerMode();
};
R._e_dos = function(on){
  var self = this, j = this._debutAction(), r = rotAutour(-180, [114, 98], [110, 100]);
  this.etat.dos = on;
  this._majPointFaible();
  if(on){
    return this._seq([{t: 0, p: {}}, {t: .3, p: avec(pas(TOUTES), {saut: {y: -22}, posture: {a: -60, y: -10}})}, {t: .7, p: avec(POSES.dos, {saut: {y: -6}, posture: {a: 180, x: POSES.dos.posture.x, y: POSES.dos.posture.y}})}, {t: .85, p: {saut: {y: 0, sy: .85}}}, {t: 1, p: {saut: {sy: 1}}}], 700).fini.then(function(){
      self.v.posture = fusion(self.v.posture, {a: 180});
      self._poussiere([110, SOLP], 3, -1);
      return self._finAction(j, 100);
    });
  }
  return this._seq([{t: 0, p: {}}, {t: .4, p: {saut: {y: -24}, posture: {a: 300, x: 0, y: -10}}}, {t: .8, p: avec(REPOS, {saut: {y: 0, sy: .88}, posture: {a: 360, x: 0, y: 0}})}, {t: 1, p: {saut: {sy: 1}}}], 650).fini.then(function(){
    self.v.posture = fusion(self.v.posture, {a: 0});
    self.J.posture.style.transform = tf(self.v.posture);
    return self._finAction(j, 150);
  });
};

/* =====================================================================
   D. Les actions
   ===================================================================== */
R._trotter = function(periode){
  var s = this._seq(TROT, periode || 220, {boucle: true, depuis: {}});
  return s.anims;
};
/* elle sort d'un œuf qui éclate (l'œuf tombé du cocon de sa mère est au même endroit) ; entrer({oeuf: false}) : elle arrive en trottinant */
R.entrer = function(o){
  o = o || {};
  var self = this, j = this._debutAction();
  this.el.style.visibility = '';
  if(o.oeuf === false){
    var ech = this._echelle(), rr = this.svg.getBoundingClientRect(), d = Math.max(240, ((window.innerWidth || 960) - rr.left) / ech + 40);
    this._seq([{t: 0, p: {pos: {x: d}}}], 1);
    this._trotter(200);
    return this._seq([{t: 0, p: {pos: {x: d}}}, {t: 1, p: {pos: {x: 0}}, e: 'cubic-bezier(.2,.5,.4,1)'}], Math.max(700, d * 4)).fini.then(function(){ return self._finAction(j, 200); });
  }
  /* l'œuf */
  var oe = this._el(this.S.fixe, '<g><ellipse rx="16" ry="20" fill="' + this.G.oeuf + '" stroke="' + O + '" stroke-width="2"/>' + L('M-9 -6 q 5 3 3 9 M5 -12 q -3 6 1 10 M-3 8 q 5 2 8 8', '#e07a3a', 1.2, ' opacity=".7"') + '<ellipse cx="-6" cy="-8" rx="4.5" ry="7" fill="#fffbe8" opacity=".7"/>' +
    '<g class="fentes" opacity="0">' + L('M-2 -19 L 2 -11 L -3 -5 L 3 2 L -1 8', '#4a2a1a', 1.8) + L('M10 -12 L 6 -6 L 11 -1', '#4a2a1a', 1.5) + '</g></g>');
  var cx = 110, cy = SOLP - 18, fentes = oe.querySelector('.fentes');
  oe.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
  this.J.corps.style.opacity = 0;
  this.J.ombre.style.opacity = 0;
  var k = [];
  for(var i = 0; i <= 10; i++) k.push({offset: i / 10, transform: 'translate(' + cx + 'px,' + f1(cy - (i % 2 ? 2 : 0) * i / 5) + 'px) rotate(' + f1((i % 2 ? 1 : -1) * i * 1.3) + 'deg) scale(' + f1(1 + i * .012) + ')'});
  var bascule = oe.animate(k, {duration: 1100, easing: 'linear', fill: 'forwards'});
  this._minuteur(function(){ fentes.animate([{opacity: 0}, {opacity: 1}], {duration: 150, fill: 'forwards'}); }, 650);
  return fini(bascule).then(function(){
    if(j !== self.jeton){ oe.remove(); return; }
    /* crac ! les coquilles volent, elle jaillit */
    oe.remove();
    self._eclat([cx, cy], 18, '#fff8d0', {duree: 320});
    for(var q = 0; q < 4; q++){
      var a = -Math.PI * (.15 + q * .23), coq = self._el(self.S.fixe, P('M-7 0 C -7 -8 7 -8 7 0 L 4 -2 L 1 2 L -2 -2 L -5 1 Z', self.G.oeuf, ' stroke-width="1.4"'));
      var an = self._voler(coq, [cx, cy - 4], [cx + Math.cos(a) * hasard(30, 50), SOLP - 3], {haut: hasard(20, 40), rot: hasard(-300, 300), duree: hasard(600, 800), rebond: 3});
      (function(c, an){ an.finished.then(function(){ try{ an.commitStyles(); an.cancel(); }catch(e){} setTimeout(function(){ c.animate([{opacity: 1}, {opacity: 0}], {duration: 800, fill: 'forwards'}).finished.then(oter(c), oter(c)); }, 2200); }, function(){}); })(coq, an);
    }
    for(var g = 0; g < 4; g++) self._bouffee([cx + hasard(-10, 10), cy], {r: 4, coul: '#f4e8a0', op: .9, dx: hasard(-30, 30), dy: hasard(-30, -10), duree: 500, delai: g * 30, s1: 1.2});
    self._fondu('corps', 1, 80); self._fondu('ombre', 1, 300);
    return self._seq([{t: 0, p: avec(jambes(function(n, av){ return [{a: av ? 40 : -40}, {a: av ? 60 : -60}]; }), {saut: {s: .45, y: -6}})},
      {t: .35, p: avec(jambes(function(n, av){ return [{a: av ? -10 : 10}, {a: 0}]; }), {saut: {s: 1.15, y: -26}}), e: 'cubic-bezier(.2,.8,.4,1)'},
      {t: .62, p: avec(REPOS, {saut: {sx: 1.08, sy: .88, y: 0}}), e: 'cubic-bezier(.6,0,.9,.5)'}, {t: .75, p: {saut: {s: 1}}},
      {t: .8, p: {secousse: {a: 6}}}, {t: .85, p: {secousse: {a: -6}}}, {t: .9, p: {secousse: {a: 4}}}, {t: 1, p: {secousse: {a: 0}}}], 1000).fini;
  }).then(function(){ return self._finAction(j, 200); });
};
/* la morsure : elle se ramasse, bondit vers les héros, crochets ouverts, clac, et revient d'un saut */
R.attaquer = function(nom, o){
  if(nom && typeof nom === 'object'){ o = nom; nom = null; }
  if(typeof o === 'function') o = {onImpact: o};
  o = o || {};
  var self = this, j = this._debutAction(), impact, impactP = new Promise(function(r){ impact = r; }), T = 1000;
  var s = this._seq([{t: 0, p: {}},
    {t: .25, p: avec(jambes(function(n, av){ return [{a: av ? 8 : -8}, {a: av ? 14 : -14}]; }), {pos: {x: 8}, saut: {y: 4, sy: .85, sx: 1.08}, tete: {a: -6}, chel: {a: -4}})},
    {t: .45, p: avec(jambes(function(n, av){ return [{a: av ? -24 : 24}, {a: av ? -10 : 10}]; }), {pos: {x: -70}, saut: {y: -40, sy: 1.08, sx: .95}, posture: {a: -10}, tete: {a: 8}, chel: {a: 26}}), e: 'cubic-bezier(.2,.7,.4,1)'},
    {t: .55, p: {pos: {x: -96}, saut: {y: -4, sy: .9, sx: 1.06}, posture: {a: 4}, tete: {a: -10}, chel: {a: -6}}, e: 'cubic-bezier(.7,0,1,.5)'},
    {t: .62, p: {tete: {a: 2}, chel: {a: 8}}}, {t: .68, p: {chel: {a: -4}, tete: {a: -6}}},
    {t: .86, p: avec(REPOS, {pos: {x: -10}, saut: {y: -18, sy: 1.04, sx: 1}, posture: {a: -4}, tete: {a: 0}, chel: {a: 0}}), e: 'cubic-bezier(.3,.6,.4,1)'},
    {t: 1, p: {pos: {x: 0}, saut: {y: 0, sy: 1, sx: 1}, posture: {a: 0}}, e: 'cubic-bezier(.5,0,.4,1.4)'}], T);
  this._minuteur(function(){ var p = self._pt('bouche'); self._eclat([p[0] - 6, p[1]], 12, '#fff8d0', {duree: 280}); if(o.onImpact) try{ o.onImpact(); }catch(e){} impact(); }, T * .55);
  this._minuteur(function(){ self._poussiere(self._pt('pieds'), 2, -1); }, T * .57);
  var pr = s.fini.then(function(){ return self._finAction(j, 150); });
  pr.impact = impactP;
  return pr;
};
R._recul = function(f, o){
  o = o || {};
  var self = this, j = this._debutAction(), base = this._base();
  if(o.flash !== false) this._flash(1 + f);
  if(f >= .8 && o.cri !== false) this._cri(this._pt('bouche'), .6);
  return this._seq([{t: 0, p: {}},
    {t: .14, p: avec(jambes(function(n, av){ return [{a: av ? 10 * f : -10 * f}, {a: av ? 18 * f : -18 * f}]; }), {secousse: {x: 12 * f, y: -3 * f, a: -8 * f}, saut: {sx: .86, sy: 1.1}, tete: {a: (base.tete ? base.tete.a : 0) + 10 * f}, chel: {a: 18}})},
    {t: .45, p: {secousse: {x: 6 * f, a: 3 * f}, saut: {sx: 1.05, sy: .95}, tete: {a: -3}}}, {t: 1, p: avec(base, avec(REPOS, {secousse: {x: 0, y: 0, a: 0}, saut: {sx: 1, sy: 1}, tete: fusion(Z, base.tete), chel: fusion(Z, base.chel)}))}], 560).fini.then(function(){ return self._finAction(j, 150); });
};
R._t_coup = function(){ return this._recul(1); };
R._t_fleche = function(o, f){ this._bouffee(this._pt('centre'), {r: 7, coul: '#ffffff', op: .9, dx: 0, dy: 0, duree: 240, s0: .2, s1: 2}); return this._recul(f || 1); };
R._t_fleche_argent = function(o){ return this._t_fleche(o, 1); };
R._t_fleche_lourde = function(o){ this._poussiere(this._pt('pieds'), 3, 1); return this._t_fleche(o, 1.4); };
R._t_dague = function(){ this._entailles(this._pt('centre')); return this._recul(1.1); };
R._t_acide = function(){ var c = this._pt('centre'); this._bulles(c, 4); this._fumee(c, 2, {coul: '#a8c890', taille: .6}); return this._recul(1.2); };
R._t_bruit = function(){ var p = this._pt('tete'); this._ondes([p[0] - 30, p[1]], 1); return this._recul(.8, {flash: false}); };
R._t_bouclier = function(){ var p = this._pt('bouche'); this._etincelles(p, 6, {v: 40, ang: Math.PI, coul: ['#bff8ff', '#5fe8ff', '#ffffff']}); return this._recul(1.2); };
R._t_louche = function(){ var p = this._pt('tete'); this._eclat([p[0], p[1] - 12], 16, '#ffe466'); for(var i = 0; i < 3; i++) this._eclat([p[0] + hasard(-20, 20), p[1] - hasard(10, 30)], 6, '#ffe466', {delai: 100 + i * 90}); return this._recul(1.3); };
R._t_brulure = function(){ if(!this.etat.brule) this._e_brule(true); this._souffleFeu(this._pt('centre'), 16); return this._recul(.8); };
R._t_feu = function(){ var self = this; this._souffleFeu(this._pt('centre'), 20); return this._recul(1).then(function(){ return self.etatPublic('brule', true); }); };
R._t_lumiere = function(){ var self = this; this._rayons(this._pt('tete'), 26); return this._recul(.7, {flash: false}).then(function(){ return self.etatPublic('ebloui', true); }); };
R._t_colle = function(){ var self = this, c = this._pt('pieds'); for(var i = 0; i < 4; i++) this._bouffee([c[0] + hasard(-30, 30), c[1] - 6], {r: 5, coul: '#d0e05a', op: .9, dx: hasard(-14, 14), dy: 6, duree: 400, delai: i * 30, s1: 1.4}); return this._recul(.5, {flash: false}).then(function(){ return self.etatPublic('colle', true); }); };
/* l'huile : elle patine des huit pattes et se retourne sur le dos */
R._t_huile = function(){
  var self = this;
  if(this.etat.dos) return this._recul(.6);
  this._flaque('huile', 112, 80);
  var j = this._debutAction(), k = [{t: 0, p: {}}];
  for(var i = 1; i <= 6; i++) k.push({t: i / 7, p: avec(pas(i % 2 ? GA : TOUTES.filter(function(n){ return GA.indexOf(n) < 0; })), {posture: {x: i % 2 ? -8 : 8, a: i % 2 ? -6 : 6}, tete: {a: i % 2 ? 8 : -6}, chel: {a: 20}})});
  k.push({t: 1, p: avec(REPOS, {posture: {x: 0, a: 0}})});
  return this._seq(k, 800).fini.then(function(){ self.enAction = false; return self.etatPublic('dos', true); }).then(function(){ setTimeout(function(){ self._enleverFlaque('huile'); }, 1200); });
};
R._t_nuage = function(){ return this.tousser(); };
R._t_givre = function(){ var self = this; this._cristaux(this._pt('centre'), 6, {v: 40, taille: .7}); return this._recul(.6, {flash: false}).then(function(){ return self.etatPublic('gele', true); }); };
R._t_rebond = function(){
  var self = this, j = this._debutAction(), c = this._pt('centre');
  this._eclat(c, 14, '#ffffff'); this._etincelles(c, 6, {v: 40});
  var k = [{t: 0, p: {}}];
  for(var i = 0; i < 4; i++){ k.push({t: .1 + i * .2, p: {saut: {y: -10, sy: 1.06}, chel: {a: 20}}, e: 'ease-out'}); k.push({t: .2 + i * .2, p: {saut: {y: 0, sy: .92}, chel: {a: 0}}, e: 'ease-in'}); }
  k.push({t: 1, p: {saut: {y: 0, sy: 1}}});
  return this._seq(k, 1100).fini.then(function(){ return self._finAction(j, 150); });
};
R.tousser = function(){
  var self = this, j = this._debutAction(), T = 2100, k = [{t: 0, p: {}}], quintes = [.06, .38, .7];
  quintes.forEach(function(t, i){
    var f = 1 + i * .15;
    k.push({t: t + .06, p: {tete: {a: -5}, abdo: {sy: 1.05}}});
    k.push({t: t + .11, p: avec(jambes(function(n, av){ return [{a: av ? 8 * f : -8 * f}, {a: av ? 12 * f : -12 * f}]; }), {tete: {a: 14 * f}, chel: {a: 24}, abdo: {sy: .9, sx: 1.04}, secousse: {x: -6 * f}, saut: {sy: .9}})});
    k.push({t: t + .2, p: avec(REPOS, {tete: {a: 0}, chel: {a: 0}, abdo: {sy: 1, sx: 1}, secousse: {x: 0}, saut: {sy: 1}})});
    self._minuteur(function(){ var p = self._pt('bouche'); for(var n = 0; n < 4; n++) self._bouffee([p[0] - 4, p[1] + hasard(-4, 4)], {r: hasard(5, 8) * f, coul: choisir(['#d8e0c4', '#c8d4b0', '#e8eedc']), op: .85, dx: hasard(-40, -20), dy: hasard(-12, 8), duree: hasard(700, 1000), delai: n * 30, s0: .4, s1: 2, liser: true}); }, T * (t + .11));
  });
  k.push({t: 1, p: {}});
  return this._seq(k, T).fini.then(function(){ return self._finAction(j, 150); });
};
/* la peur : elle fait demi-tour et détale */
R.fuir = function(){
  var self = this, j = this._debutAction();
  ['ebloui', 'dos', 'colle', 'cible', 'gele'].forEach(function(n){ self.etat[n] = false; });
  this._eteindreEtoiles('etoiles'); this._enleverFlaque('colle'); this._enleverFlaque('huile');
  this._tous('[data-colle],[data-gel]').forEach(function(e){ self._fondu(e, 0, 150); });
  this._fondu('patteYeux', 0, 150);
  this._cri(this._pt('bouche'), .8);
  var ech = this._echelle(), rr = this.svg.getBoundingClientRect(), d = Math.max(400, ((window.innerWidth || 960) - rr.left) / ech + 200);
  return this._seq([{t: 0, p: {}}, {t: .4, p: avec(REPOS, {saut: {y: -20, sy: 1.1}, posture: {a: 0, x: 0, y: 0}})}, {t: 1, p: {saut: {y: 0, sy: 1}}}], 300).fini.then(function(){
    return self._seq([{t: 0, p: {pos: {x: 0, sx: 1}}}, {t: .5, p: {pos: {x: 4, sx: .1}}}, {t: 1, p: {pos: {x: 8, sx: -1}}}], 140).fini;
  }).then(function(){
    self._trotter(150);
    return self._seq([{t: 0, p: {pos: {x: 8, sx: -1}}}, {t: 1, p: {pos: {x: d, sx: -1}}, e: 'cubic-bezier(.4,0,.9,.7)'}], 1000).fini;
  }).then(function(){ self._couperBoucles(); self.el.style.visibility = 'hidden'; self.enAction = false; });
};
/* le critique : elle se tord, gonfle, éclate en brume noire ; il reste un petit corps recroquevillé dans la cendre */
R.exploser = function(scene){
  var self = this, j = this._debutAction(), boomOk, boomP = new Promise(function(r){ boomOk = r; });
  if(this.etat.brule) this._e_brule(false);
  this._eteindreEtoiles('etoiles'); this._pulser('yeuxRage', false);
  var k = [{t: 0, p: {}}];
  for(var i = 1; i <= 8; i++) k.push({t: i / 9, p: avec(jambes(function(n, av){ return [{a: (i % 2 ? 1 : -1) * 14}, {a: (i % 2 ? -1 : 1) * 16}]; }), {saut: {sx: 1 + i * .03, sy: 1 + i * .035, y: -i}, secousse: {x: i % 2 ? 2 : -2}, chel: {a: 24}})});
  k.push({t: 1, p: {saut: {sx: 1.3, sy: 1.35, y: -10}}, e: 'ease-in'});
  var p = this._seq(k, 650).fini.then(function(){
    var c0 = self._pt('centre');
    var boum = self._boum(scene, {ref: 'centre', x: 116, y: 98, u: .42, brume: 7, extra: function(el, cx, cy, u, T){
      for(var t = 0; t < 2; t++){ var at = -Math.PI * (.25 + t * .5), lg = 14 * u, pa = el(L('M0 0 Q ' + f1(lg * .5) + ' ' + f1(-lg * .4) + ' ' + f1(lg) + ' 0', '#24182e', 4 * u) + L('M0 0 Q ' + f1(lg * .5) + ' ' + f1(-lg * .4) + ' ' + f1(lg) + ' 0', '#5a4240', 2 * u));
        pa.animate([{transform: T(cx, cy, 1, 0), opacity: 1}, {offset: .45, transform: T(cx + Math.cos(at) * 80 * u, cy + Math.sin(at) * 80 * u, 1, 200), opacity: 1}, {transform: T(cx + Math.cos(at) * 110 * u, cy + 50 * u, 1, 420), opacity: 0}], {duration: 1300, easing: 'cubic-bezier(.2,.6,.6,1)', fill: 'forwards'}).finished.then(oter(pa), oter(pa)); }
    }});
    boomOk();
    /* le petit corps recroquevillé, et la cendre */
    var cx = c0[0], cy = SOLP, pa = '';
    [[-14, -6, -22, -20, -14, -24], [-6, -8, -6, -24, 4, -26], [6, -8, 12, -22, 20, -20], [14, -6, 26, -14, 28, -6]].forEach(function(q){ pa += 'M' + f1(cx + q[0]) + ' ' + f1(cy + q[1]) + ' Q ' + f1(cx + q[2]) + ' ' + f1(cy + q[3]) + ' ' + f1(cx + q[4]) + ' ' + f1(cy + q[5]) + ' '; });
    var reste = self._el(self.S.fixeArr, '<ellipse cx="' + cx + '" cy="' + (cy - 1) + '" rx="40" ry="5" fill="#000" opacity=".35"/>' + L(pa, O, 6) + L(pa, '#7a6a68', 3) +
      P('M' + f1(cx - 20) + ' ' + cy + ' C ' + f1(cx - 18) + ' ' + f1(cy - 20) + ' ' + f1(cx + 22) + ' ' + f1(cy - 22) + ' ' + f1(cx + 24) + ' ' + cy + ' Z', self.G.cendre, ' stroke-width="2"') +
      F(rond(cx - 6, cy - 10, 1.6) + rond(cx + 8, cy - 8, 1.4), '#2a2228', ' opacity=".8"') + '<g class="' + PX + '-lueur">' + F(rond(cx + 4, cy - 14, 1.6), '#ff9a40') + '</g>' + F(rond(cx - 30, cy - 1, 3) + rond(cx + 34, cy - 1, 2.4), '#6a6070', ' opacity=".7"'));
    reste.animate([{opacity: 0}, {offset: .5, opacity: 0}, {opacity: 1}], {duration: 1300, fill: 'forwards'});
    (function fumet(n){ if(n <= 0) return; self._bouffee([cx + hasard(-10, 10), cy - 16], {r: 4, coul: '#5a5260', op: .5, dx: hasard(-4, 8), dy: -36, duree: 1500, s1: 2.4}); setTimeout(function(){ fumet(n - 1); }, 450); })(6);
    self._couperBoucles();
    self.mort = true;
    self.J.saut.style.opacity = 0; self.J.ombre.style.opacity = 0;
    return boum.fini;
  });
  p.boom = boomP;
  return p;
};

var INFO = {
  id: 'petitearaignee', nom: 'Petite araignée', rang: 'normal', pv: 15, attaque: 'morsure 6',
  cadre: {w: 110, h: 80}, sol: .875, vole: false, places: 1, oeuf: [.5, .7625],
  attaques: ['morsure'], specials: [],
  etats: ['enrage', 'brule', 'colle', 'ebloui', 'gele', 'ouvert', 'dos', 'cible']
};
Petite.prototype.info = INFO;
global.BETES = global.BETES || {};
global.BETES[ID] = {info: INFO, creer: function(conteneur, options){ return acteur(new Petite(conteneur, options)); }};
})(typeof window !== 'undefined' ? window : this);
