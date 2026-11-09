/* araignee-anime.js — l'araignée des caves animée (Les Enquêteurs de Brumeval, donjon du puits)
   Module autonome, sans dépendance ; il injecte son propre CSS (préfixe .bt-araignee-…). Contrat : anim/betes/CONTRAT.md.

     var a = BETES.araignee.creer(conteneur);   // un SVG qui remplit le conteneur (200 × 330, cadre haut), elle regarde à gauche

   Elle pend à son fil (info.suspendue = true) ; le fil monte jusqu'en haut du cadre (et au-delà). Son cocon d'œufs pend à côté.
   Actions (Promise, résolue quand elle est revenue à son attente) :
     entrer()                  elle descend du plafond le long de son fil, rebondit, claque des crochets
     attaquer('morsure', o)    elle se ramasse, se laisse tomber en se balançant vers les héros, mord (o.onImpact), remonte ; la Promise a .impact
     attaquer('toile', o)      elle pompe de l'abdomen et projette une boule de soie qui vole jusqu'à o.vers ({x,y} écran) dans o.scene,
                               et s'y étale (o.onImpact). La toile reste : la Promise donne une fonction qui la retire ; retirerToile() les retire toutes.
     touche(type)              lumiere : panique, le fil lâche, elle culbute et tombe sur le dos devant → état « dos » (ventre offert, pattes qui gigotent)
                               huile : l'huile coule le long du fil, elle glisse par à-coups, lâche, salto arrière → état « dos » (le fil reste, huilé)
                               feu : elle crie, son cocon prend feu → état « oeufs-brulent » (ensuite special('eclosion'))
                               nuage : tousser() puis elle remonte hors d'atteinte → état « haut »
                               colle → « colle » (pâtés sur les pattes, elle se débat) ; givre → « gele » ; louche : elle tournoie sur son fil
                               fleche, fleche-argent, fleche-lourde, dague, acide, bruit, bouclier, rebond (elle nargue), brulure, coup
     special('eclosion', o)    le cocon brûle, gonfle, éclate ; deux œufs tombent (vers o.vers = [{x,y},{x,y}] écran, sinon à ses pieds).
                               La Promise donne les deux points d'atterrissage (écran) : le moteur y crée deux « petitearaignee » (leur entrer() part du même œuf).
     tousser()                 trois quintes ; fuir() / mourir() : elle remonte son fil à toute vitesse et disparaît dans le noir
     exploser(scene)           elle se tord, gonfle, éclate en brume noire ; restent une carcasse aux pattes repliées, le fil cassé qui pend et le cocon roussi.
                               La Promise a .boom (le moment où elle éclate).
   États : etat(nom, on) — enrage, brule, colle, ebloui, gele, ouvert, dos, cible, et les siens : haut, oeufs-brulent. etatCourant(), ancre(nom), arreter().
   Le point faible : son ventre (on le voit quand elle est sur le dos).
   Pièces articulées (<g data-j>, contenu fixe) animées par la Web Animations API (transform et opacity seulement) ; aucun filtre ;
   les états visuels (gel, ventre, cocon chauffé ou éclos, fil huilé…) sont des variantes pré-dessinées qu'on montre ou cache. */
(function(global){
'use strict';
var ID = 'araignee', PX = 'bt-araignee';

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
  this.enAction = true;
  this._couperBoucles();
  return this.jeton;
};
B._finAction = function(j, duree){
  if(j !== this.jeton || this.mort) return Promise.resolve();
  this.enAction = false;
  return this._reprendre(duree);
};
B._reprendre = function(duree){
  var self = this;
  if(this.mort) return Promise.resolve();
  this._couperBoucles();
  return this._allerA(this._base(), duree == null ? 380 : duree, 'cubic-bezier(.3,.7,.3,1)', true).then(function(){
    if(self.enAction || self.mort) return;
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
  /* chaque image : on lit seulement la position des quelques pièces porteuses ; les flammes restent droites */
  (function suivre(){
    if(!g.isConnected || self.fx[k] !== o) return;
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
   A. Le dessin de l'araignée des caves (fiche 05-araignee.js), découpé en pièces articulées
   Elle pend à son fil par ses filières (392, 88). Le fil monte jusqu'à un point d'attache très haut (au-dessus du cadre) :
   la pièce « balance » la fait osciller comme un pendule, « descente » la fait monter ou descendre, et la pièce « fil »
   s'allonge (scaleY) en même temps. Les flous de la fiche sont remplacés par des dégradés ; la grande toile du décor n'est pas
   dessinée ici (elle est dans le décor de la cave aux toiles).
   ===================================================================== */
var SOLA = 470, ANC = -1180, SX = 392, SY = 88, LF = SY - ANC, C0 = [300, 170];
var Cc = [250, 226], rotC = Math.atan2(-82, 87) + Math.PI, Ac = [334, 142], rotA = Math.atan2(-82, 87);
var HANCHES = [[218, 196], [232, 188], [248, 184], [264, 186], [270, 252], [256, 260], [240, 262], [226, 258]];
var BOUTS = [[18, 236], [24, 126], [118, 30], [262, 16], [524, 262], [404, 378], [176, 376], [56, 318]];
var LARG = [18, 17, 16, 15, 15, 16, 17, 18];
/* la géométrie de chaque patte : hanche b, genou K, articulation J, bout t ; k = le sens où elle se replie */
var GEO = HANCHES.map(function(b, i){
  var t = BOUTS[i], dx = t[0] - b[0], dy = t[1] - b[1], l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l, m = lerp(b, t, .5);
  if(nx * (m[0] - Cc[0]) + ny * (m[1] - Cc[1]) < 0){ nx = -nx; ny = -ny; }
  return {b: b, t: t, l: l, n: [nx, ny], K: [b[0] + dx * .36 + nx * l * .3, b[1] + dy * .36 + ny * l * .3], J: [b[0] + dx * .7 + nx * l * .16, b[1] + dy * .7 + ny * l * .16],
    k: (nx * dy - ny * dx) < 0 ? -1 : 1, ang: Math.atan2(dy, dx) * 180 / Math.PI};
});
/* la descente le long du fil : le fil s'allonge d'autant */
function desc(dy, o){ var p = o ? copie(o) : {}; p.descente = {y: dy, x: 0}; p.fil = {sy: (LF + dy) / LF}; return p; }
function pattes(f){ var p = {}; for(var i = 0; i < 8; i++){ var r = f(i, GEO[i]); if(r) for(var n in r) p[n] = r[n]; } return p; }

function dessinerAraignee(D){
  var self = this, chit = '#40302f', chitS = '#2a1e22', bande = '#a27a52';
  var GL = D.glace(), NG = 0;
  var gCol = D.g(chit), gColF = D.g(sombre(chit, .3)), gJoint = D.g(sombre(bande, .15)), gJointF = D.g(sombre(bande, .45));
  this.G.oeuf = D.rad([[0, '#fff8e8'], [.5, '#f4dca8'], [1, '#c8945a']], .38, .32, .78);
  this.G.cendre = D.g('#7a6e70');
  function gel(d, cr){ return variante('gelA' + (++NG), F(d, GL) + L(d, '#ffffff', 1.6, ' opacity=".6"') + (cr || ''), ' data-gel'); }

  /* ---- une patte : trois segments (hanche-genou, genou-articulation, articulation-griffe), poils raides, anneaux clairs ---- */
  function patte(i, fonce){
    var g0 = GEO[i], R = rng(30 + i), b = g0.b, t = g0.t, K = g0.K, J = g0.J, nx = g0.n[0], ny = g0.n[1], w = LARG[i];
    var bd = fonce ? sombre(bande, .35) : bande, segs = [[b, K, [w, w * .92, w * .78]], [K, J, [w * .72, w * .62, w * .56]], [J, t, [w * .52, w * .36, w * .16]]], out = [];
    segs.forEach(function(g, k){
      var mm = lerp(g[0], g[1], .5), tb = tube([g[0], [mm[0] + nx * 3 * (k === 2 ? -1 : 1), mm[1] + ny * 3 * (k === 2 ? -1 : 1)], g[1]], g[2]), s = '';
      var poilsH = '', ux = g[1][0] - g[0][0], uy = g[1][1] - g[0][1], ul = Math.hypot(ux, uy); ux /= ul; uy /= ul;
      [tb.g, tb.dr].forEach(function(bord){
        for(var q = 0; q < bord.length - 1; q++){ for(var z = 0; z < 3; z++){ var p = lerp(bord[q], bord[q + 1], (z + R()) / 3), c = lerp(g[0], g[1], (q + z / 3) / 2), ox = p[0] - c[0], oy = p[1] - c[1], ol = Math.hypot(ox, oy) || 1, hl = (5 - k * 1.2) * (.6 + R() * .8);
          poilsH += 'M' + pt(p) + ' l ' + f1(ox / ol * hl * 1.3 + ux * hl * .9) + ' ' + f1(oy / ol * hl * 1.3 + uy * hl * .9) + ' '; } }
      });
      s += L(poilsH, fonce ? '#5a4a52' : '#8a7470', 1.4, ' opacity=".9"');
      s += P(tb.d, fonce ? gColF : gCol, ' stroke-width="' + (k === 2 ? 2.2 : 2.6) + '"');
      var fz = '';
      for(var q2 = 0; q2 < 14; q2++){ var pp = lerp(g[0], g[1], .08 + q2 / 15), off = (R() - .5) * g[2][1] * .7; fz += 'M' + f1(pp[0] + nx * off) + ' ' + f1(pp[1] + ny * off) + ' l ' + f1(ux * 4 + nx * 1.5) + ' ' + f1(uy * 4 + ny * 1.5) + ' '; }
      var dedans = L(fz, fonce ? '#8a7a8a' : '#c8aa98', .9, ' opacity=".45"');
      if(k < 2){ var r0 = lerp(g[0], g[1], .8), r1 = lerp(g[0], g[1], .94), wv = g[2][2] * .5 + .5; dedans += L('M' + pt(r0) + ' L ' + pt(r1), bd, wv * 2, ' opacity=".9"'); }
      s += '<g' + D.clip(tb.d) + '>' + dedans + '</g>';
      s += L('M' + pt(lerp(tb.dr[0], tb.dr[1], .3)) + ' Q ' + pt(tb.dr[1]) + ' ' + pt(lerp(tb.dr[1], tb.dr[2], .7)), fonce ? '#7a6a8a' : LUNE, 1.4, ' opacity=".5"');
      s += L('M' + pt(lerp(tb.g[0], tb.g[1], .3)) + ' Q ' + pt(tb.g[1]) + ' ' + pt(lerp(tb.g[1], tb.g[2], .7)), fonce ? '#7a6a8a' : LUNE, 1.4, ' opacity=".5"');
      if(k < 2) s += gel(tb.d);
      out.push(s);
    });
    var jt = [K, J].map(function(j, k){ return '<ellipse cx="' + f1(j[0]) + '" cy="' + f1(j[1]) + '" rx="' + f1(w * (.5 - k * .12)) + '" ry="' + f1(w * (.42 - k * .1)) + '" fill="' + (fonce ? gJointF : gJoint) + '" stroke="' + O + '" stroke-width="2"/>' + C(f1(j[0] + 1.5), f1(j[1] - 1.5), f1(w * .12), '#ffe8c8', ' opacity=".5"'); });
    var ex = (t[0] - J[0]) / Math.hypot(t[0] - J[0], t[1] - J[1]), ey = (t[1] - J[1]) / Math.hypot(t[0] - J[0], t[1] - J[1]);
    var griffe = L('M' + pt(t) + ' q ' + f1(ex * 6) + ' ' + f1(ey * 6) + ' ' + f1(ex * 5 - ey * 4) + ' ' + f1(ey * 5 + ex * 4), '#120c10', 2.4);
    var colle = (i >= 4 || i <= 1) ? variante('colleP' + i, '<ellipse cx="' + f1(t[0] - ex * 6) + '" cy="' + f1(t[1] - ey * 6) + '" rx="17" ry="12" transform="rotate(' + f1(Math.atan2(ey, ex) * 57.3) + ' ' + f1(t[0] - ex * 6) + ' ' + f1(t[1] - ey * 6) + ')" fill="#d0e05a" fill-opacity=".92" stroke="#5a6420" stroke-width="2"/>' + C(f1(t[0] - ex * 6 - 4), f1(t[1] - ey * 6 - 4), 3.4, '#fbffd0', ' opacity=".8"') + L('M' + f1(t[0] - ex * 6) + ' ' + f1(t[1] - ey * 6 + 10) + ' q -2 8 1 14', '#c8d84a', 3.4) + C(f1(t[0] - ex * 6 + 1), f1(t[1] - ey * 6 + 26), 3.6, '#d0e05a', ' stroke="#5a6420" stroke-width="1.2"'), ' data-colle') : '';
    return piv('p' + i, b[0], b[1], out[0] + piv('p' + i + 'g', f1(K[0]), f1(K[1]), out[1] + jt[0] + piv('p' + i + 't', f1(J[0]), f1(J[1]), out[2] + jt[1] + griffe + colle)));
  }
  var pattesFond = [3, 2, 4, 5].map(function(i){ return patte(i, true); }).join(''), pattesDevant = [1, 0, 6, 7].map(function(i){ return patte(i, false); }).join('');

  /* ---- l'abdomen : gros, luisant, poilu, ses losanges orange (le dos) ; et son ventre pâle (quand elle est retournée) ---- */
  var abdoD = ellChemin(Ac, 82, 64, rotA, 18, .05, 9), R = rng(13), fr = '';
  for(var k3 = 0; k3 < 60; k3++){ var a3 = k3 / 60 * Math.PI * 2, p0 = ell(Ac, 80, 62, rotA, a3), p1 = ell(Ac, 90 + R() * 6, 71 + R() * 6, rotA, a3 + .04); fr += 'M' + pt(p0) + ' L ' + pt(p1) + ' '; }
  var dosA = P(abdoD, D.rad([[0, '#6a5048'], [.55, '#463430'], [1, '#22181c']], .62, .32, .78)), dedans = '';
  dedans += L('M' + pt(ell(Ac, 82 * -.55, 0, rotA, 0)) + ' L ' + pt(ell(Ac, 82 * .8, 0, rotA, 0)), '#140a0c', 12, ' opacity=".55"');
  var losG = D.lin([[0, '#ffb060'], [.5, '#e8762a'], [1, '#a8441a']], 1, 0, 0, 1), chev = '', pts = '';
  for(var k4 = 0; k4 < 5; k4++){
    var t4 = -.42 + k4 * .27, c4 = ell(Ac, 82 * t4, 0, rotA, 0), sz = 23 - k4 * 3.3, ax = Math.cos(rotA), ay = Math.sin(rotA), bx = -ay, by = ax;
    var los = 'M' + pt([c4[0] + ax * sz * 1.1, c4[1] + ay * sz * 1.1]) + ' L ' + pt([c4[0] + bx * sz * .8, c4[1] + by * sz * .8]) + ' L ' + pt([c4[0] - ax * sz * 1.1, c4[1] - ay * sz * 1.1]) + ' L ' + pt([c4[0] - bx * sz * .8, c4[1] - by * sz * .8]) + ' Z';
    dedans += P(los, losG, ' stroke-width="3"') + L('M' + pt([c4[0] - ax * sz * .7, c4[1] - ay * sz * .7]) + ' L ' + pt([c4[0] + ax * sz * .7, c4[1] + ay * sz * .7]), '#ffe0a8', 1.6, ' opacity=".7"') +
      F('M' + pt([c4[0] + ax * sz * 1.1, c4[1] + ay * sz * 1.1]) + ' L ' + pt([c4[0] + bx * sz * .8, c4[1] + by * sz * .8]) + ' L ' + pt([c4[0], c4[1]]) + ' Z', '#fff0c8', ' opacity=".3"');
    chev += 'M' + pt([c4[0] + bx * sz * 1.6 - ax * sz * .4, c4[1] + by * sz * 1.6 - ay * sz * .4]) + ' L ' + pt([c4[0] + bx * sz * .95, c4[1] + by * sz * .95]) + ' M' + pt([c4[0] - bx * sz * 1.6 - ax * sz * .4, c4[1] - by * sz * 1.6 - ay * sz * .4]) + ' L ' + pt([c4[0] - bx * sz * .95, c4[1] - by * sz * .95]) + ' ';
    pts += rond(c4[0] + bx * sz * 1.9, c4[1] + by * sz * 1.9, 2.6) + rond(c4[0] - bx * sz * 1.9, c4[1] - by * sz * 1.9, 2.6);
  }
  dedans += L(chev, '#d8a070', 2.2, ' opacity=".55"') + F(pts, '#e8c8a0', ' opacity=".5"');
  R = rng(17); var duvet = '';
  for(var k5 = 0; k5 < 220; k5++){ var a5 = R() * Math.PI * 2, r5 = Math.sqrt(R()), p5 = ell(Ac, 80 * r5, 62 * r5, rotA, a5), l5 = 3 + R() * 4; duvet += 'M' + pt(p5) + ' l ' + f1(Math.cos(rotA + Math.PI) * l5 + (R() - .5) * 3) + ' ' + f1(Math.sin(rotA + Math.PI) * l5 + (R() - .5) * 3) + ' '; }
  dedans += L(duvet, '#c8a890', .9, ' opacity=".35"');
  dedans += '<ellipse cx="368" cy="104" rx="38" ry="20" transform="rotate(-40 368 104)" fill="' + D.doux('#ffffff', .4) + '"/><ellipse cx="376" cy="100" rx="14" ry="6" transform="rotate(-40 376 100)" fill="#ffffff" opacity=".4"/>';
  dedans += F(abdoD, D.rad([[0, '#000', 0], [.65, '#000', 0], [1, '#000', .45]], .55, .45, .6));
  dosA += '<g' + D.clip(abdoD) + '>' + dedans + '</g>' + L(lisse([ell(Ac, 82, 64, rotA, -2.2), ell(Ac, 82, 64, rotA, -1.6), ell(Ac, 82, 64, rotA, -.9), ell(Ac, 82, 64, rotA, -.2)]), LUNE, 2.4, ' opacity=".6"');
  /* le ventre : pâle, une plaque claire au milieu, les fentes, les filières */
  var ventreA = P(abdoD, D.rad([[0, '#b8987a'], [.55, '#7a5c4a'], [1, '#3a2a26']], .5, .4, .8)), v2 = '';
  v2 += P(ellChemin([330, 146], 50, 22, rotA, 12, .06, 5), D.rad([[0, '#f4e2c4'], [1, '#c8a684']], .5, .4, .7), ' stroke-width="2"');
  v2 += L('M' + pt(ell(Ac, 82 * -.5, 30, rotA, 0)) + ' l 10 -6 M' + pt(ell(Ac, 82 * -.5, -30, rotA, 0)) + ' l 10 6', '#5a3a2e', 2.4);
  R = rng(23); var dv = '';
  for(var k6 = 0; k6 < 120; k6++){ var a6 = R() * Math.PI * 2, r6 = Math.sqrt(R()), p6 = ell(Ac, 78 * r6, 60 * r6, rotA, a6); dv += 'M' + pt(p6) + ' l ' + f1((R() - .5) * 5) + ' ' + f1(3 + R() * 3) + ' '; }
  v2 += L(dv, '#3a2a22', .9, ' opacity=".4"') + F(abdoD, D.rad([[0, '#000', 0], [.7, '#000', 0], [1, '#000', .4]], .5, .45, .6));
  ventreA += '<g' + D.clip(abdoD) + '>' + v2 + '</g>';
  /* la lueur du point faible (le ventre) */
  var pfL = variante('pfL', '<ellipse cx="330" cy="146" rx="96" ry="66" transform="rotate(-43 330 146)" fill="' + D.doux('#ffd040', .8) + '"/><ellipse cx="330" cy="146" rx="58" ry="30" transform="rotate(-43 330 146)" fill="' + D.doux('#fff4b0', .95) + '"/>' +
    '<ellipse cx="330" cy="146" rx="50" ry="24" transform="rotate(-43 330 146)" fill="none" stroke="#fff8d0" stroke-width="3" stroke-dasharray="6 7"/>' + [[284, 186], [376, 104], [300, 116], [362, 178]].map(function(q){ return '<g transform="translate(' + q[0] + ' ' + q[1] + ')"><path d="' + eclatD(8) + '" fill="#ffffff"/></g>'; }).join(''), ' data-pf="ventre"', 330, 146);
  var abdo = piv('abdo', 334, 142, F(abdoD, '#000', ' opacity=".22" transform="translate(-6 10)"') + L(fr, '#2a1c1e', 1.6) +
    variante('abdoDos', dosA, '', null, null, 1) + variante('abdoVentre', ventreA) +
    P('M386 92 C 388 84 396 84 398 92 C 396 98 388 98 386 92 Z', D.g('#5a4440'), ' stroke-width="2"') +
    variante('filBout', L('M392 90 C 388 70 398 56 390 36 C 386 28 392 22 388 14', '#eef4ff', 3, ' opacity=".9"')) +
    gel(abdoD, D.cristaux(360, 92, -100, 3, 18, 40, 3) + D.cristaux(300, 112, -120, 2, 14, 20, 5)) +
    variante('suie', '<ellipse cx="340" cy="120" rx="80" ry="40" transform="rotate(-43 340 120)" fill="#140c10" opacity=".4"/>') + pfL +
    repere('pf', 334, 146) + repere('haut', 352, 96) + repere('filiere', 392, 88));

  /* ---- la tête-thorax : carapace luisante (le dos), le sternum (le ventre), pédipalpes, chélicères, crochets, huit yeux ---- */
  var cepD = ellChemin(Cc, 56, 46, rotC, 14, .04, 3);
  var dosC = P(cepD, D.rad([[0, '#6e5450'], [.6, '#4a3634'], [1, '#261a1e']], .62, .3, .8)), dc = '';
  var fov = ell(Cc, 10, 0, rotC, Math.PI), sill = '';
  for(var k7 = 0; k7 < 8; k7++){ var a7 = k7 / 8 * Math.PI * 2 + .2; sill += 'M' + pt(fov) + ' L ' + pt(ell(Cc, 50, 40, rotC, a7)) + ' '; }
  dc += L(sill, '#1e1418', 1.6, ' opacity=".5"') + '<ellipse cx="' + f1(fov[0]) + '" cy="' + f1(fov[1]) + '" rx="5" ry="2.4" transform="rotate(' + f1(rotC * 57.3) + ' ' + f1(fov[0]) + ' ' + f1(fov[1]) + ')" fill="#120a0e" opacity=".7"/>';
  R = rng(29); var dv2 = '';
  for(var k8 = 0; k8 < 70; k8++){ var a8 = R() * Math.PI * 2, r8 = Math.sqrt(R()), p8 = ell(Cc, 52 * r8, 42 * r8, rotC, a8); dv2 += 'M' + pt(p8) + ' l ' + f1(Math.cos(rotC) * 4 + (R() - .5) * 2) + ' ' + f1(Math.sin(rotC) * 4 + (R() - .5) * 2) + ' '; }
  dc += L(dv2, '#d0b0a0', .9, ' opacity=".3"') + '<ellipse cx="268" cy="200" rx="24" ry="12" transform="rotate(-40 268 200)" fill="' + D.doux('#ffffff', .35) + '"/>';
  dosC += '<g' + D.clip(cepD) + '>' + dc + '</g>' + L(lisse([ell(Cc, 56, 46, rotC, 3.6), ell(Cc, 56, 46, rotC, 4.3), ell(Cc, 56, 46, rotC, 5)]), LUNE, 2.2, ' opacity=".55"');
  var ventreC = P(cepD, D.rad([[0, '#a88a72'], [.6, '#6a4e42'], [1, '#2e2024']], .5, .45, .8)) + P(ellChemin([254, 222], 30, 24, rotC, 10, .08, 6), D.rad([[0, '#d8bc98'], [1, '#9a7a62']], .5, .4, .7), ' stroke-width="2"') +
    HANCHES.map(function(h){ var q = lerp(h, Cc, .22); return '<ellipse cx="' + f1(q[0]) + '" cy="' + f1(q[1]) + '" rx="8" ry="6" fill="' + gJoint + '" stroke="' + O + '" stroke-width="1.8"/>'; }).join('');
  /* les pédipalpes */
  var palpeG = piv('palpeG', 214, 218, P(tube([[214, 218], [196, 224], [186, 240], [184, 254]], [11, 10, 9, 8]).d, gCol) + '<ellipse cx="184" cy="257" rx="7" ry="6" fill="' + D.g(sombre(chit, .2)) + '" stroke="' + O + '" stroke-width="2.4"/>' + L('M190 226 l -5 -4 M186 240 l -6 -1', '#2a1c1e', 1.4));
  var palpeD = piv('palpeD', 246, 262, P(tube([[246, 262], [244, 278], [234, 290], [222, 296]], [11, 10, 9, 8]).d, gCol) + '<ellipse cx="219" cy="298" rx="7" ry="6" fill="' + D.g(sombre(chit, .2)) + '" stroke="' + O + '" stroke-width="2.4"/>' + L('M246 280 l 5 3 M236 292 l 3 5', '#2a1c1e', 1.4));
  /* les chélicères gonflées et leurs crochets noirs ; une goutte de venin au bout */
  var ch1 = 'M206 236 C 196 246 194 264 204 276 C 214 284 226 278 228 266 C 230 252 220 238 206 236 Z', ch2 = 'M228 246 C 220 258 222 276 234 284 C 244 290 254 282 254 270 C 254 256 244 246 228 246 Z';
  var croc = D.lin([[0, '#5a5060'], [.4, '#1a141c'], [1, '#050306']], 1, 0, 0, 1), gch = D.g('#5a4240');
  R = rng(41); var pcG = '', pcD = '';
  for(var k9 = 0; k9 < 24; k9++){ var px = 200 + R() * 52, py = 240 + R() * 40, seg = 'M' + f1(px) + ' ' + f1(py) + ' l ' + f1(-1 - R() * 2) + ' ' + f1(3 + R() * 2) + ' '; if(px < 226) pcG += seg; else pcD += seg; }
  var chelG = piv('chelG', 214, 240, P(ch1, gch) + L('M210 244 C 218 248 224 256 224 266', '#d0b0a0', 1, ' opacity=".4"') + L(pcG, '#1a1014', 1, ' opacity=".5"') +
    P('M204 270 C 200 286 206 300 222 308 C 226 309 226 305 223 303 C 214 296 212 286 214 274 Z', croc, ' stroke-width="2.2"') + L('M206 276 C 205 288 210 298 218 304', '#d8d0e8', 1.2, ' opacity=".75"'));
  var venin = piv('venin', 252, 318, P('M252 317 C 254 322 257 326 257 329.5 C 257 332.5 254.8 334.5 252 334.5 C 249.2 334.5 247 332.5 247 329.5 C 247 326 250 322 252 317 Z', '#c8f0a0', ' stroke-width="1.4" opacity=".9"') + C(250.4, 329, 1.2, '#ffffff', ' opacity=".85"') +
    '<circle cx="252" cy="326" r="10" fill="' + D.doux('#b8f090', .4) + '"/>' + repere('veninBout', 252, 333));
  var chelD = piv('chelD', 240, 250, P(ch2, gch) + L('M234 254 C 242 258 248 266 248 274', '#d0b0a0', 1, ' opacity=".4"') + L(pcD, '#1a1014', 1, ' opacity=".5"') +
    P('M234 280 C 230 296 236 310 252 318 C 256 319 256 315 253 313 C 244 306 242 296 244 284 Z', croc, ' stroke-width="2.2"') + L('M236 286 C 235 298 240 308 248 314', '#d8d0e8', 1.2, ' opacity=".75"') + venin);
  /* les huit yeux rouges ; leur halo de rage et leurs plis (cachés) */
  var yeux = [[214, 226, 8.5], [230, 236, 8.5], [204, 216, 5.5], [242, 244, 5.5], [218, 210, 4.4], [232, 216, 4.4], [244, 226, 4.2], [208, 204, 3.6]];
  var gy = D.rad([[0, '#fff2a0'], [.35, '#ff5a2a'], [.8, '#a00a14'], [1, '#4a0008']], .4, .38, .65), yx = '';
  yx += '<ellipse cx="224" cy="226" rx="48" ry="38" fill="' + D.halo('#ff9a80', '#ff2a1a') + '" opacity=".55"/>' + F('M196 222 C 200 204 226 196 248 214 C 256 228 252 246 238 252 C 222 254 200 244 196 222 Z', '#14080c', ' opacity=".55"');
  yeux.forEach(function(y){ yx += '<circle cx="' + y[0] + '" cy="' + y[1] + '" r="' + y[2] + '" fill="' + gy + '" stroke="' + O + '" stroke-width="2"/>' + C(f1(y[0] - y[2] * .32), f1(y[1] - y[2] * .34), f1(y[2] * .32), '#ffffff', ' opacity=".9"') + C(f1(y[0] + y[2] * .35), f1(y[1] + y[2] * .3), f1(y[2] * .14), '#ffffff', ' opacity=".6"'); });
  var plis = '';
  yeux.slice(0, 4).forEach(function(y){ plis += 'M' + f1(y[0] - y[2] * 1.2) + ' ' + f1(y[1] - y[2] * .2) + ' Q ' + f1(y[0]) + ' ' + f1(y[1] + y[2] * .5) + ' ' + f1(y[0] + y[2] * 1.2) + ' ' + f1(y[1] - y[2] * .2) + ' '; });
  /* deux bouts de pattes croisés devant les yeux (ébloui) */
  function boutPatte(a, b2, c2){ var tb = tube([a, b2, c2], [17, 14, 8]); return P(tb.d, gCol, ' stroke-width="2.6"') + L('M' + pt(lerp(a, b2, .78)) + ' L ' + pt(lerp(a, b2, .95)), bande, 12, ' opacity=".95"') + '<ellipse cx="' + b2[0] + '" cy="' + b2[1] + '" rx="8" ry="7" fill="' + gJoint + '" stroke="' + O + '" stroke-width="2"/>' + L('M' + pt(c2) + ' q -5 5 -11 3', '#120c10', 3); }
  var patteYeux = variante('patteYeux', boutPatte([188, 178], [220, 212], [244, 244]) + boutPatte([262, 186], [234, 214], [206, 250]), '', 226, 214);
  var ceph = piv('ceph', 282, 190, F(cepD, '#000', ' opacity=".22" transform="translate(-4 8)"') + variante('cephDos', dosC, '', null, null, 1) + variante('cephVentre', ventreC) +
    palpeG + palpeD + chelG + chelD + yx + variante('yeuxRage', '<ellipse cx="224" cy="226" rx="62" ry="50" fill="' + D.halo('#ffe0a0', '#ff2a10') + '"/>', '', 224, 226) +
    variante('plis', L(plis, '#14080c', 3.6)) + patteYeux + gel(cepD, D.cristaux(244, 190, -100, 3, 14, 30, 9)) +
    etoilesDessin(D, 'etoiles', 220, 168, 80, 5, 21) + repere('tete', 230, 222) + repere('bouche', 236, 304));

  /* ---- le corps entier : les pattes du fond, celles de devant, l'abdomen, la taille fine, la tête ---- */
  var corps = pattesFond + pattesDevant + abdo + P(tube([[296, 176], [282, 190]], [22, 18]).d, D.g(chitS)) + ceph + repere('centre', 300, 172) + repere('pieds', 300, 372);

  /* ---- le fil (épais pour se voir à la taille du jeu), ses variantes huilée et gelée ---- */
  var filD = 'M' + SX + ' ' + ANC + ' L ' + SX + ' ' + SY;
  var fil = L(filD, '#eef4ff', 8, ' opacity=".12"') + L(filD, '#eef4ff', 3, ' opacity=".85"') +
    variante('filHuile', L(filD, '#2a5a6a', 6, ' opacity=".7"') + L(filD, '#c8a0ff', 2, ' opacity=".8" stroke-dasharray="14 10"') + L(filD, '#a0ffd0', 2, ' opacity=".7" stroke-dasharray="6 18"')) +
    variante('filGel', L(filD, '#d8f4ff', 6, ' opacity=".8"') + L(filD, '#ffffff', 2));

  /* ---- le cocon d'œufs emmailloté de soie, sur son propre fil ; ses variantes : chauffé, roussi, éclos ---- */
  var coc = [472, 104], coconD = ellChemin(coc, 30, 42, .12, 14, .1, 4);
  R = rng(8); var oe = '';
  for(var e = 0; e < 16; e++){ var ex = coc[0] - 20 + R() * 40, ey = coc[1] - 30 + R() * 60; oe += C(f1(ex), f1(ey), f1(4 + R() * 3), '#e8c890', ' opacity=".4"') + C(f1(ex + 1.5), f1(ey - 1.5), 1.4, '#fff8e0', ' opacity=".5"'); }
  var soie = '';
  for(var e2 = 0; e2 < 22; e2++){ var y0 = coc[1] - 44 + e2 * 4.2, cu = (R() - .5) * 20; soie += 'M' + f1(coc[0] - 34) + ' ' + f1(y0 + cu * .3) + ' Q ' + f1(coc[0]) + ' ' + f1(y0 + cu) + ' ' + f1(coc[0] + 34) + ' ' + f1(y0 - cu * .4 + 6) + ' '; }
  var intact = P(coconD, D.rad([[0, '#f4efe2'], [.6, '#cfc6b4'], [1, '#8a8274']], .62, .32, .75)) + '<g' + D.clip(coconD) + '>' + piv('oeufs', 472, 104, oe) + L(soie, '#ffffff', .9, ' opacity=".4"') +
    '<ellipse cx="482" cy="86" rx="14" ry="20" fill="' + D.doux('#ffffff', .5) + '"/></g>' + L('M462 64 C 480 66 496 84 500 104', LUNE, 2, ' opacity=".6"');
  var chaud = F(coconD, D.rad([[0, '#ffd070', .9], [.5, '#ff7a20', .7], [1, '#a02a10', .6]], .5, .55, .7)) + '<g' + D.clip(coconD) + '>' + F([[462, 88], [480, 100], [468, 116], [486, 124], [458, 128]].map(function(q){ return rond(q[0], q[1], 6); }).join(''), '#fff0a0', ' opacity=".85"') + '</g>';
  var dechire = 'M444 98 C 444 76 456 62 472 62 C 490 62 502 78 500 100 L 506 124 L 494 116 L 490 134 L 480 120 L 472 140 L 464 120 L 454 134 L 452 114 L 440 122 Z';
  var eclos = P(dechire, D.rad([[0, '#7a6a58'], [.6, '#4a3c30'], [1, '#241a14']], .62, .32, .75)) + F('M452 110 C 458 96 486 96 492 110 L 490 128 L 480 116 L 472 134 L 464 116 L 456 128 Z', '#120806') +
    L('M440 122 L 452 114 L 454 134 L 464 120 L 472 140 L 480 120 L 490 134 L 494 116 L 506 124', '#ff9a40', 1.8, ' opacity=".8"') + L('M452 76 Q 472 70 494 80 M448 92 Q 472 86 498 96', '#c8b8a0', .9, ' opacity=".5"');
  var cocon = piv('coconFil', 472, ANC, L('M472 ' + ANC + ' L 472 62', '#eef4ff', 6, ' opacity=".1"') + L('M472 ' + ANC + ' L 472 62', '#eef4ff', 2.4, ' opacity=".75"') +
    piv('cocon', 472, 104, variante('coconIntact', intact, '', null, null, 1) + variante('coconChaud', chaud) + variante('coconEclos', eclos) +
      L('M466 62 Q 472 70 478 62 M462 70 L 482 70', '#eef4ff', 1.4, ' opacity=".6"') + L('M470 146 C 468 156 474 164 470 172', '#eef4ff', 1.2, ' opacity=".5"') + repere('coconC', 472, 104)));

  /* ---- l'ombre au sol : petite et pâle (elle pend en l'air) ---- */
  var ombre = '<ellipse cx="270" cy="' + SOLA + '" rx="130" ry="12" fill="' + D.doux('#000000', .45) + '"/>';
  return slot('fixeArr') + piv('pos', 300, SOLA, piv('ombre', 270, SOLA, ombre) + cocon +
    piv('balance', SX, ANC, piv('fil', SX, ANC, fil) + piv('descente', SX, SY, piv('tourne', SX, SY, piv('corps', SX, SY, corps))))) + slot('monde') + slot('fixe');
}

/* =====================================================================
   B. Les poses
   ===================================================================== */
var POSES = {
  normal: {},
  /* là-haut, hors d'atteinte : remontée, pattes repliées */
  haut: desc(-330, avec(pattes(function(i, g){ var o = {}; o['p' + i + 'g'] = {a: g.k * 16}; o['p' + i + 't'] = {a: g.k * 10}; return o; }), {ombre: {sx: .55, sy: .6}})),
  /* éblouie : elle détourne la tête, les pattes de devant se lèvent */
  ebloui: avec(pattes(function(i, g){ if(i === 0 || i === 7 || i === 1 || i === 6){ var o = {}; o['p' + i] = {a: (i < 2 ? -1 : 1) * 14}; o['p' + i + 'g'] = {a: g.k * 18}; return o; } }), {ceph: {a: -8}, tourne: {a: -6}}),
  /* sur le dos, par terre, devant : le corps à l'horizontale, la tête vers les héros, les pattes en l'air */
  dos: (function(){
    var p = {}, r = rotAutour(45, C0, [SX, SY]), cibles = [-132, -112, -92, -72, -52, -34, -152, -142];
    p.balance = {a: 0}; p.descente = {x: -30, y: 255}; p.tourne = {a: r.a, x: r.x, y: r.y};
    GEO.forEach(function(g, i){ var d = cibles[i] - (g.ang + 45); while(d > 180) d -= 360; while(d < -180) d += 360; p['p' + i] = {a: d}; p['p' + i + 'g'] = {a: g.k * 14}; p['p' + i + 't'] = {a: g.k * 10}; });
    p.ombre = {sx: 1.25, sy: 1.8}; p.ceph = {a: 4}; p.chelG = {a: 10}; p.chelD = {a: -10};
    return p;
  })()
};
function jambesRepos(){ return pattes(function(i){ var o = {}; o['p' + i] = {a: 0}; o['p' + i + 'g'] = {a: 0}; o['p' + i + 't'] = {a: 0}; return o; }); }
/* les pattes qui se replient d'un coup (sursaut, toux) */
function replie(f){ return pattes(function(i, g){ var o = {}; o['p' + i + 'g'] = {a: g.k * 20 * f}; o['p' + i + 't'] = {a: g.k * 12 * f}; return o; }); }
/* les pattes qui gigotent dans tous les sens (panique) */
function gigote(s){ return pattes(function(i, g){ var o = {}, c = (i + s) % 2 ? 1 : -1; o['p' + i] = {a: c * 16}; o['p' + i + 'g'] = {a: g.k * (14 + c * 14)}; return o; }); }

/* =====================================================================
   C. L'araignée : construction, attente, états
   ===================================================================== */
function Araignee(conteneur, options){
  this._init(conteneur, options, '0 -380 540 891', dessinerAraignee);
  this.solY = SOLA;
  this.etat.haut = false;
  this.etat['oeufs-brulent'] = false;
  this.etat.eclos = false;
  this.filCasse = false;
  this.filDos = 1;
  this.toiles = [];
  this._reprendre(0);
}
var R = Araignee.prototype = Object.create(Bete.prototype);
R.constructor = Araignee;

R._mode = function(){ return this.etat.dos ? 'dos' : (this.etat.haut ? 'haut' : (this.etat.ebloui ? 'ebloui' : 'normal')); };
R._base = function(){
  var m = this._mode(), p = copie(POSES[m]), self = this;
  if(m === 'dos' && !this.filCasse) p.fil = {sy: this.filDos};
  if(this.etat.cible && m !== 'dos'){ p.tourne = {a: -4}; p.ceph = {a: -5}; GEO.forEach(function(g, i){ p['p' + i + 'g'] = {a: (p['p' + i + 'g'] ? p['p' + i + 'g'].a : 0) + g.k * 8}; }); }
  if(this.etat.enrage && m !== 'dos'){ p.chelG = {a: 8}; p.chelD = {a: -8}; }
  return p;
};
R._ancreNom = function(nom){ return nom === 'pointfaible' ? 'pf' : nom; };
R._lancerBoucles = function(){
  var b = this._boucleur(), mode = this._mode(), V = this.etat.enrage ? 1.6 : 1, i;
  this.vitesse = V;
  b = this._boucleur();
  b('oeufs', [[0, {s: 1}], [.4, {s: 1.06}], [.55, {s: .97}], [1, {s: 1}]], this.etat['oeufs-brulent'] ? 700 : 1700, 'ease-in-out');
  b('coconFil', [[0, {a: 0}], [.5, {a: .3}], [1, {a: 0}]], 4200, 'ease-in-out');
  if(this.etat.gele){
    b('balance', [[0, {a: 0}], [.5, {a: .25}], [1, {a: 0}]], 4000, 'ease-in-out');
    b('tourne', [[0, {x: 0}], [.25, {x: .8}], [.5, {x: -.8}], [.75, {x: .6}], [1, {x: 0}]], 160, 'linear');
    this._planifier(1200);
    return;
  }
  if(mode === 'dos'){
    /* sur le dos : les huit pattes gigotent, elle se tortille */
    b('tourne', [[0, {a: 0}], [.25, {a: 5}], [.5, {a: 0}], [.75, {a: -5}], [1, {a: 0}]], 700, 'ease-in-out');
    for(i = 0; i < 8; i++){
      b('p' + i, [[0, {a: 0}], [.5, {a: (i % 2 ? 1 : -1) * 16}], [1, {a: 0}]], 300 + i * 23, 'ease-in-out', -i * 70);
      b('p' + i + 'g', [[0, {a: 0}], [.5, {a: GEO[i].k * -24}], [1, {a: 0}]], 260 + i * 31, 'ease-in-out', -i * 50);
    }
    b('chelG', [[0, {a: 0}], [.5, {a: 10}], [1, {a: 0}]], 520, 'ease-in-out');
    b('chelD', [[0, {a: 0}], [.5, {a: -10}], [1, {a: 0}]], 520, 'ease-in-out');
    b('abdo', [[0, {sx: 1, sy: 1}], [.5, {sx: 1.03, sy: 1.04}], [1, {sx: 1, sy: 1}]], 600, 'ease-in-out');
  } else {
    var amp = mode === 'haut' ? .5 : (mode === 'ebloui' ? 1.6 : .9);
    b('balance', [[0, {a: 0}], [.25, {a: amp}], [.5, {a: 0}], [.75, {a: -amp}], [1, {a: 0}]], mode === 'ebloui' ? 1600 : 3600, 'ease-in-out');
    b('tourne', [[0, {a: 0}], [.5, {a: -3}], [1, {a: 0}]], 4400, 'ease-in-out');
    b('abdo', [[0, {sx: 1, sy: 1}], [.45, {sx: 1.02, sy: 1.03}], [1, {sx: 1, sy: 1}]], 2100, 'ease-in-out');
    for(i = 0; i < 8; i++) b('p' + i, [[0, {a: 0}], [.5, {a: GEO[i].k * (mode === 'ebloui' ? 7 : 2.6)}], [1, {a: 0}]], (mode === 'ebloui' ? 300 : 900) + i * 97, 'ease-in-out', -i * 130);
    b('palpeG', [[0, {a: 0}], [.3, {a: -8}], [.6, {a: 4}], [1, {a: 0}]], 1300, 'ease-in-out');
    b('palpeD', [[0, {a: 0}], [.35, {a: 7}], [.7, {a: -3}], [1, {a: 0}]], 1500, 'ease-in-out', -400);
    b('chelG', [[0, {a: 0}], [.5, {a: -3}], [1, {a: 0}]], 1700, 'ease-in-out');
    b('chelD', [[0, {a: 0}], [.5, {a: 3}], [1, {a: 0}]], 1700, 'ease-in-out');
    if(this.etat.enrage) b('secousse' in this.J ? 'secousse' : 'ceph', [[0, {x: 0}], [.25, {x: .8}], [.5, {x: -.8}], [.75, {x: .6}], [1, {x: 0}]], 140, 'linear');
  }
  this._planifier(500);
};
/* les petits événements de l'attente : une patte qui tressaille, les crochets qui claquent, une goutte de venin… */
R._evenement = function(){
  var mode = this._mode(), self = this, liste, A = {ajout: true, vitesse: this.vitesse};
  if(mode === 'dos') liste = ['crochets', 'secoue'];
  else if(mode === 'ebloui') liste = ['secoue', 'patte', 'crochets'];
  else liste = ['patte', 'patte', 'crochets', 'venin', 'venin', 'descend', 'regarde', 'palpes', 'gonfle'];
  if(this.etat.colle) liste = ['colle', 'colle', 'colle', 'crochets'];
  if(this.etat.enrage) liste = liste.concat(['crochets', 'crochets', 'regarde']);
  if(this.etat.brule) liste = liste.concat(['secoue', 'secoue']);
  var ev = choisir(liste), k, o;
  switch(ev){
    case 'patte':
      k = Math.floor(Math.random() * 8); o = {};
      var a0 = {}, a1 = {}, a2 = {};
      a0['p' + k] = {a: 0}; a0['p' + k + 'g'] = {a: 0}; a1['p' + k] = {a: (k < 4 ? -1 : 1) * 10}; a1['p' + k + 'g'] = {a: GEO[k].k * 24}; a2['p' + k] = {a: (k < 4 ? -1 : 1) * -3}; a2['p' + k + 'g'] = {a: GEO[k].k * -6};
      this._seq([{t: 0, p: a0}, {t: .25, p: a1, e: 'cubic-bezier(.2,.8,.3,1)'}, {t: .55, p: a2}, {t: 1, p: a0}], 600, A);
      break;
    case 'crochets':
      this._seq([{t: 0, p: {chelG: {a: 0}, chelD: {a: 0}, ceph: {a: 0}}}, {t: .3, p: {chelG: {a: 16}, chelD: {a: -16}, ceph: {a: -3}}, e: 'ease-out'}, {t: .45, p: {chelG: {a: -4}, chelD: {a: 4}, ceph: {a: 2}}, e: 'cubic-bezier(.7,0,1,.5)'},
        {t: .6, p: {chelG: {a: 14}, chelD: {a: -14}}}, {t: .72, p: {chelG: {a: -3}, chelD: {a: 3}}, e: 'cubic-bezier(.7,0,1,.5)'}, {t: 1, p: {chelG: {a: 0}, chelD: {a: 0}, ceph: {a: 0}}}], 700, A);
      break;
    case 'venin':
      this._seq([{t: 0, p: {venin: {sy: 1}}}, {t: .75, p: {venin: {sy: 1.8, sx: .8}}, e: 'ease-in'}, {t: .82, p: {venin: {sy: .6, sx: 1}}, e: 'cubic-bezier(.2,1.6,.5,1)'}, {t: 1, p: {venin: {sy: 1, sx: 1}}}], 1300, A);
      this._minuteur(function(){ if(!self.mort) self._goutteTombe(self._pt('veninBout'), {coul: '#c8f0a0'}); }, 1300 * .76 / this.vitesse);
      break;
    case 'descend':
      this._seq([{t: 0, p: desc(0)}, {t: .35, p: desc(22), e: 'cubic-bezier(.3,.7,.4,1)'}, {t: .6, p: desc(18)}, {t: 1, p: desc(0), e: 'ease-in-out'}], 1500, A);
      break;
    case 'regarde':
      this._seq([{t: 0, p: {tourne: {a: 0}, ceph: {a: 0}}}, {t: .3, p: {tourne: {a: 7}, ceph: {a: 6}}, e: 'cubic-bezier(.2,.8,.3,1)'}, {t: .75, p: {tourne: {a: 6}, ceph: {a: 5}}}, {t: 1, p: {tourne: {a: 0}, ceph: {a: 0}}}], 1500, A);
      break;
    case 'palpes':
      this._seq([{t: 0, p: {palpeG: {a: 0}, palpeD: {a: 0}}}, {t: .2, p: {palpeG: {a: -14}, palpeD: {a: 12}}}, {t: .4, p: {palpeG: {a: 4}, palpeD: {a: -4}}}, {t: .6, p: {palpeG: {a: -12}, palpeD: {a: 10}}}, {t: 1, p: {palpeG: {a: 0}, palpeD: {a: 0}}}], 900, A);
      break;
    case 'gonfle':
      this._seq([{t: 0, p: {abdo: {sx: 1, sy: 1}}}, {t: .4, p: {abdo: {sx: 1.06, sy: 1.08}}}, {t: 1, p: {abdo: {sx: 1, sy: 1}}}], 900, A);
      break;
    case 'secoue':
      var s = [{t: 0, p: {tourne: {a: 0}}}];
      for(var j = 1; j < 7; j++) s.push({t: j / 7, p: {tourne: {a: j % 2 ? 7 : -7}}});
      s.push({t: 1, p: {tourne: {a: 0}}});
      this._seq(s, 700, A);
      break;
    case 'colle':
      this._tirerPatte();
      if(Math.random() < .6) this._minuteur(function(){ self._goutteTombe(self._ou('p6t', 0, 0), {coul: '#d0e05a'}); }, 700);
      break;
  }
};

/* ---- ce qu'il faut aux états communs ---- */
R._specsFeu = function(){
  var A = this.J.abdo.firstElementChild, Ce = this.J.ceph.firstElementChild, s = [{ref: A, x: 334, y: 120, lueur: [120, 90]}];
  [[290, 126, 44, 22, -10], [312, 104, 58, 26, -4], [338, 90, 66, 28, 0], [366, 84, 54, 24, 6], [392, 96, 40, 20, 12], [300, 160, 36, 18, -6], [356, 130, 48, 22, 4]].forEach(function(q){ s.push({ref: A, x: q[0], y: q[1], h: q[2], w: q[3], r: q[4]}); });
  s.push({ref: Ce, x: 232, y: 196, h: 34, w: 18, r: -6}, {ref: Ce, x: 262, y: 200, h: 28, w: 16, r: 8});
  return s;
};
R._colleSpec = function(){
  function t(i, f){ var p = {}; p['p' + i] = {a: (i < 4 ? -1 : 1) * 12 * f}; p['p' + i + 'g'] = {a: GEO[i].k * 26 * f}; return p; }
  return {rx: 0, tirer: [{p: avec(t(6, 1), t(7, .4)), corps: {tourne: {a: 6}, ceph: {a: 4}}, corps0: {tourne: {a: 0}, ceph: {a: 0}}},
    {p: avec(t(5, 1), t(6, .3)), corps: {tourne: {a: -6}, ceph: {a: -3}}, corps0: {tourne: {a: 0}, ceph: {a: 0}}},
    {p: avec(t(0, 1), t(7, .6)), corps: {tourne: {a: 5}, balance: {a: 1}}, corps0: {tourne: {a: 0}, balance: {a: 0}}}]};
};
R._etoilesSpec = function(){ return {cx: 220, cy: 164, rx: 84, ry: 22, n: 5}; };
R._pfActif = function(){ return 'ventre'; };
R._e_enrage = function(on){
  this.etat.enrage = on;
  this._fondu('yeuxRage', on ? 1 : 0, 400);
  this._pulser('yeuxRage', on, {s0: .85, s1: 1.2, duree: 650});
  return this._changerMode();
};
R._e_gele = function(on){
  this._fondu('filGel', on ? 1 : 0, on ? 500 : 900);
  return Bete.prototype._e_gele.call(this, on);
};
/* le dos (ventre) ou le dessus : on montre la bonne face */
R._faces = function(dessous, duree){
  this._fondu('abdoDos', dessous ? 0 : 1, duree || 0); this._fondu('abdoVentre', dessous ? 1 : 0, duree || 0);
  this._fondu('cephDos', dessous ? 0 : 1, duree || 0); this._fondu('cephVentre', dessous ? 1 : 0, duree || 0);
};
/* là-haut, hors d'atteinte (le nuage) : elle grimpe à toute allure, ou redescend */
R._e_haut = function(on){
  var self = this, j = this._debutAction();
  this.etat.haut = on;
  var k = [{t: 0, p: {}}];
  for(var s = 1; s <= 6; s++) k.push({t: s / 7 * .85, p: avec(gigote(s), desc(on ? -330 * s / 6 : -330 * (1 - s / 6)))});
  k.push({t: 1, p: avec(on ? POSES.haut : jambesRepos(), on ? {} : desc(0))});
  if(!on){ k.splice(k.length - 1, 0, {t: .93, p: desc(16)}); }
  return this._seq(k, on ? 1000 : 1200).fini.then(function(){ return self._finAction(j, 250); });
};
R._e_dos = function(on){
  if(on) return this._chute('lumiere');
  return this._seRelever();
};

/* =====================================================================
   D. Les chutes : la lumière (le fil lâche, elle culbute) ; l'huile (elle glisse le long du fil puis tombe)
   ===================================================================== */
R._filRompu = function(){
  /* le bout de fil du haut remonte d'un coup, et un petit bout reste accroché à ses filières */
  var p = this._ou('fil', 0, LF - 140), haut = this._ou('fil', 0, 0), self = this;
  this._eclat(p, 16, '#ffffff', {duree: 300});
  var lg = p[1] - haut[1], g = this._fxEl(L('M0 0 L 0 ' + f1(lg), '#eef4ff', 3, ' opacity=".85"'));
  g.animate([{transform: 'translate(' + f1(haut[0]) + 'px,' + f1(haut[1]) + 'px) scale(1,1)', opacity: 1}, {transform: 'translate(' + f1(haut[0]) + 'px,' + f1(haut[1]) + 'px) scale(1,.55)', opacity: 0}], {duration: 700, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'forwards'}).finished.then(oter(g), oter(g));
  this.J.fil.style.opacity = 0;
  this._fondu('filBout', 1, 0);
  this.filCasse = true;
};
R._chute = function(maniere, o){
  o = o || {};
  var self = this, j = this._debutAction(), T, k = [{t: 0, p: {}}];
  var D0 = POSES.dos, y0 = this._lire('descente').y, f, i, aFin = maniere === 'huile' ? -315 : 405;
  if(this.etat.haut) this.etat.haut = false;
  if(maniere === 'huile'){
    /* l'huile coule le long du fil : trois gouttes sombres glissent jusqu'à elle */
    this._fondu('filHuile', 1, 400);
    for(i = 0; i < 3; i++){
      var g = this._fxEl('<ellipse rx="6" ry="9" fill="' + this.G.huile + '" stroke="#0a0812" stroke-width="1.4"/><circle cx="-2" cy="-3" r="1.6" fill="#e0d0ff"/>'), x = this._ou('fil', 0, 0)[0];
      g.animate([{transform: 'translate(' + f1(x) + 'px,-360px)', opacity: 0}, {offset: .1, opacity: 1}, {transform: 'translate(' + f1(x) + 'px,' + f1(SY + y0 - 10) + 'px)', opacity: 1}], {duration: 700, delay: i * 180, easing: 'cubic-bezier(.5,0,1,1)', fill: 'both'}).finished.then(oter(g), oter(g));
    }
    /* elle glisse par à-coups, ses pattes de devant cherchent à se rattraper au fil */
    var marches = [[.28, 30], [.42, 30], [.5, 80], [.62, 80], [.7, 150]], agrippe = pattes(function(i2, g2){ if(i2 <= 3){ var o2 = {}; o2['p' + i2] = {a: -22}; o2['p' + i2 + 'g'] = {a: g2.k * -14}; return o2; } });
    marches.forEach(function(m, q){ k.push({t: m[0] * .62, p: avec(q % 2 ? agrippe : gigote(q), desc(y0 + m[1], {tourne: {a: q % 2 ? 4 : -6}, balance: {a: q % 2 ? -1 : 1.5}})), e: q % 2 ? 'ease-out' : 'cubic-bezier(.5,0,1,.6)'}); });
    /* elle lâche : le fil reste là, elle tombe en faisant un salto arrière et retombe sur le dos */
    var filFin = (LF + y0 + 150) / LF;
    this.filDos = filFin;
    for(i = 1; i <= 8; i++){ f = i / 8; var r = rotAutour(aFin * f, C0, [SX, SY]); k.push({t: .62 + f * .3, p: avec(gigote(i), {fil: {sy: filFin}, descente: {x: D0.descente.x * f, y: y0 + 150 + (D0.descente.y - y0 - 150) * f * f}, tourne: {a: r.a, x: r.x, y: r.y}, balance: {a: 0}}), e: 'linear'}); }
    T = 2600;
    this._minuteur(function(){ self._faces(true); }, T * (.62 + .3 * .55));
  } else {
    /* la lumière : panique ! elle grimpe en se débattant… le fil lâche, elle culbute dans le vide */
    this._rayons(this._pt('tete'), 60);
    this._flash(2.4, this._pt('tete'));
    for(i = 0; i < 4; i++) this._eclat([this._pt('tete')[0] + hasard(-40, 40), this._pt('tete')[1] + hasard(-40, 10)], 10, '#ffe466', {delai: 100 + i * 90, duree: 380});
    this._fondu('plis', 1, 100);
    for(i = 1; i <= 5; i++) k.push({t: i / 5 * .4, p: avec(gigote(i), desc(y0 - 12 * i, {tourne: {a: i % 2 ? 9 : -9}, ceph: {a: i % 2 ? 8 : -6}, balance: {a: i % 2 ? 1.2 : -1.2}})), e: 'ease-in-out'});
    for(i = 1; i <= 9; i++){ f = i / 9; var r2 = rotAutour(aFin * f, C0, [SX, SY]); k.push({t: .46 + f * .44, p: avec(gigote(i + 1), {fil: {sy: (LF + y0 - 60) / LF}, descente: {x: D0.descente.x * f, y: y0 - 60 + (D0.descente.y - y0 + 60) * f * f}, tourne: {a: r2.a, x: r2.x, y: r2.y}, balance: {a: 0}, ceph: {a: 0}}), e: 'linear'}); }
    T = 2200;
    this._minuteur(function(){ self._filRompu(); if(o.onImpact) try{ o.onImpact(); }catch(e){} }, T * .44);
    this._minuteur(function(){ self._faces(true); self._fondu('plis', 0, 200); }, T * (.46 + .44 * .45));
  }
  /* l'atterrissage : elle s'écrase sur le dos, rebondit, la poussière vole */
  var tFin = {a: aFin, x: D0.tourne.x, y: D0.tourne.y};
  k.push({t: .95, p: avec(D0, {descente: {x: D0.descente.x, y: D0.descente.y - 14}, abdo: {sx: 1.1, sy: .9}, tourne: tFin}), e: 'cubic-bezier(.2,.7,.4,1)'});
  k.push({t: 1, p: avec(D0, {abdo: {sx: 1, sy: 1}, tourne: tFin}), e: 'cubic-bezier(.5,0,.9,.6)'});
  if(maniere !== 'huile') k[k.length - 1].p.fil = {sy: (LF + y0 - 60) / LF};
  else k[k.length - 1].p.fil = {sy: this.filDos};
  this._minuteur(function(){ var c = self._pt('centre'); self._poussiere([c[0] - 40, SOLA], 4, -1); self._poussiere([c[0] + 40, SOLA], 4, 1); }, T * .91);
  return this._seq(k, T).fini.then(function(){
    if(j !== self.jeton) return;
    /* même position, angle ramené à 45° (sinon le retour à la pose ferait un tour à l'envers) */
    self.v.tourne = fusion(self.v.tourne, {a: 45});
    self.J.tourne.style.transform = tf(self.v.tourne);
    self.etat.dos = true;
    self._faces(true);
    self._majPointFaible();
    return self._finAction(j, 150);
  });
};
/* elle se remet sur ses pattes, lance un fil et remonte à sa place */
R._seRelever = function(){
  var self = this, j = this._debutAction(), k = [{t: 0, p: {}}], D0 = POSES.dos, i;
  this.etat.dos = false;
  this._majPointFaible();
  for(i = 1; i <= 6; i++){ var f = i / 6, r = rotAutour(45 * (1 - f) - 180 * Math.sin(f * Math.PI), C0, [SX, SY]); k.push({t: f * .4, p: avec(gigote(i), {tourne: {a: r.a, x: r.x, y: r.y}, descente: {x: D0.descente.x, y: D0.descente.y - 40 * Math.sin(f * Math.PI)}}), e: 'linear'}); }
  this._minuteur(function(){ self._faces(false); }, 1600 * .2);
  this._minuteur(function(){
    /* un nouveau fil part d'elle vers le haut */
    self._fondu('filBout', 0, 100); self._fondu('filHuile', 0, 300);
    self.J.fil.style.opacity = '';
    self.filCasse = false;
  }, 1600 * .42);
  k.push({t: .45, p: avec(jambesRepos(), {tourne: {a: 0, x: 0, y: 0}, descente: {x: 0, y: D0.descente.y}, fil: {sy: (LF + D0.descente.y) / LF}, ombre: {sx: 1, sy: 1}, ceph: {a: 0}, chelG: {a: 0}, chelD: {a: 0}})});
  for(i = 1; i <= 4; i++) k.push({t: .45 + i / 4 * .5, p: avec(gigote(i), desc(D0.descente.y * (1 - i / 4)))});
  k.push({t: 1, p: avec(jambesRepos(), desc(0)), e: 'ease-out'});
  return this._seq(k, 1600).fini.then(function(){ return self._finAction(j, 250); });
};

/* =====================================================================
   E. Les actions (Promise)
   ===================================================================== */
/* elle descend du plafond le long de son fil, rebondit (le fil est élastique) et déplie ses pattes */
R.entrer = function(o){
  var self = this, j = this._debutAction(), haut = -1000;
  this.el.style.visibility = '';
  this._seq([{t: 0, p: avec(desc(haut), replie(1.2))}], 1);
  return this._seq([{t: 0, p: avec(desc(haut), replie(1.2))}, {t: .55, p: avec(desc(46), replie(1)), e: 'cubic-bezier(.45,0,.9,.6)'}, {t: .68, p: avec(desc(-24), replie(.3)), e: 'cubic-bezier(.2,.7,.4,1)'},
    {t: .8, p: desc(10), e: 'ease-in-out'}, {t: 1, p: avec(desc(0), jambesRepos()), e: 'ease-out'}], 1700).fini.then(function(){
    if(j !== self.jeton) return;
    /* elle claque des crochets, menaçante */
    return self._seq([{t: 0, p: {chelG: {a: 0}, chelD: {a: 0}, ceph: {a: 0}}}, {t: .3, p: {chelG: {a: 18}, chelD: {a: -18}, ceph: {a: -5}}}, {t: .45, p: {chelG: {a: -4}, chelD: {a: 4}}}, {t: .6, p: {chelG: {a: 16}, chelD: {a: -16}}}, {t: .75, p: {chelG: {a: -3}, chelD: {a: 3}}}, {t: 1, p: {chelG: {a: 0}, chelD: {a: 0}, ceph: {a: 0}}}], 800).fini;
  }).then(function(){ return self._finAction(j, 250); });
};
R.attaquer = function(nom, o){
  if(nom && typeof nom === 'object'){ o = nom; nom = null; }
  if(typeof o === 'function') o = {onImpact: o};
  o = o || {};
  return nom === 'toile' ? this._toile(o) : this._morsure(o);
};
/* la morsure : elle se ramasse, se laisse tomber d'un coup en se balançant vers les héros, mord, remonte */
R._morsure = function(o){
  var self = this, j = this._debutAction(), impact, impactP = new Promise(function(r){ impact = r; }), T = 1400;
  var tend = pattes(function(i, g){ var q = {}; q['p' + i + 'g'] = {a: (i <= 1 || i >= 6 ? -1 : 1) * g.k * 14}; q['p' + i] = {a: i <= 1 || i >= 6 ? (i < 4 ? 8 : -8) : 0}; return q; });
  var s = this._seq([
    {t: 0, p: {}},
    {t: .22, p: avec(replie(.8), desc(-30, {tourne: {a: -8}, balance: {a: -1.6}, ceph: {a: -5}, chelG: {a: -4}, chelD: {a: 4}, abdo: {sx: 1.04, sy: .95}})), e: 'cubic-bezier(.4,0,.2,1)'},
    {t: .44, p: avec(tend, desc(150, {balance: {a: 9}, tourne: {a: 14}, ceph: {a: 6}, chelG: {a: 24}, chelD: {a: -24}, abdo: {sx: .96, sy: 1.06}})), e: 'cubic-bezier(.5,0,.9,.55)'},
    {t: .51, p: {ceph: {a: 14, x: -6}, chelG: {a: -8}, chelD: {a: 8}, balance: {a: 9.6}}, e: 'cubic-bezier(.7,0,1,.5)'},
    {t: .57, p: {ceph: {a: 6}}}, {t: .63, p: {ceph: {a: 12}}}, {t: .69, p: {ceph: {a: 6, x: 0}}},
    {t: .86, p: avec(replie(.3), desc(30, {balance: {a: -3}, tourne: {a: -4}, ceph: {a: 0}, chelG: {a: 0}, chelD: {a: 0}, abdo: {sx: 1, sy: 1}})), e: 'cubic-bezier(.3,.6,.4,1)'},
    {t: 1, p: avec(jambesRepos(), desc(0, {balance: {a: 0}, tourne: {a: 0}})), e: 'cubic-bezier(.4,0,.3,1.3)'}
  ], T);
  this._minuteur(function(){
    var p = self._pt('bouche');
    self._bouffee([p[0] - 8, p[1] + 6], {r: 10, coul: '#ffffff', op: .9, dx: -6, dy: 0, duree: 260, s0: .2, s1: 2.2});
    self._eclat([p[0] - 12, p[1] + 8], 18, '#fff8d0', {duree: 300});
    if(o.onImpact) try{ o.onImpact(); }catch(e){}
    impact();
  }, T * .51);
  var pr = s.fini.then(function(){ return self._finAction(j, 200); });
  pr.impact = impactP;
  return pr;
};
/* la toile : elle pompe de l'abdomen, puis projette une boule de soie qui vole jusqu'à o.vers (écran) dans o.scene et s'y étale.
   La toile reste jusqu'à retirerToile() ; la Promise donne aussi une fonction qui retire CETTE toile. */
R._toile = function(o){
  var self = this, j = this._debutAction(), T = 1500, impact, impactP = new Promise(function(r){ impact = r; }), retirer = null;
  var s = this._seq([{t: 0, p: {}},
    {t: .15, p: avec(replie(.6), {abdo: {sx: 1.06, sy: .9}, tourne: {a: -6}})}, {t: .26, p: {abdo: {sx: .96, sy: 1.06}}}, {t: .36, p: {abdo: {sx: 1.08, sy: .88}, tourne: {a: -10}}},
    {t: .44, p: avec(replie(-.2), {abdo: {sx: .92, sy: 1.12, a: -10}, tourne: {a: 8}, balance: {a: 1.5}}), e: 'cubic-bezier(.1,.9,.3,1)'},
    {t: .7, p: {abdo: {sx: 1, sy: 1, a: 0}, tourne: {a: -2}, balance: {a: -.6}}}, {t: 1, p: avec(jambesRepos(), {tourne: {a: 0}, balance: {a: 0}})}], T);
  this._minuteur(function(){ retirer = self._lancerToile(o, impact); }, T * .44);
  var pr = s.fini.then(function(){ return Promise.race([impactP, attendreMs(1500)]); }).then(function(){ return self._finAction(j, 200); }).then(function(){ return retirer; });
  pr.impact = impactP;
  return pr;
};
R._lancerToile = function(o, impact){
  var self = this, scene = o.scene || this.c.parentNode || this.c;
  if(getComputedStyle(scene).position === 'static') scene.style.position = 'relative';
  var sr = scene.getBoundingClientRect(), ech = (scene.offsetWidth || sr.width) / (sr.width || 1), W = scene.offsetWidth || sr.width, H = scene.offsetHeight || sr.height;
  var d = this._ecran('filiere', SX, SY), a = [(d.x - sr.left) * ech, (d.y - sr.top) * ech];
  var v = o.vers || {x: sr.left + sr.width * .2, y: sr.top + sr.height * .45}, b = [(v.x - sr.left) * ech, (v.y - sr.top) * ech];
  var r = (o.taille || 58) , ov = document.createElementNS(NS, 'svg');
  ov.setAttribute('class', PX + '-scene-fx'); ov.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
  scene.appendChild(ov);
  function el(html){ var g = document.createElementNS(NS, 'g'); g.innerHTML = html; ov.appendChild(g); return g; }
  /* la trajectoire : une courbe en cloche */
  var m = [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 110], N = 12, cles = [], fils = [];
  for(var i = 0; i <= N; i++){
    var t = i / N, u = 1 - t, x = u * u * a[0] + 2 * u * t * m[0] + t * t * b[0], y = u * u * a[1] + 2 * u * t * m[1] + t * t * b[1];
    cles.push({offset: t, transform: 'translate(' + f1(x) + 'px,' + f1(y) + 'px) rotate(' + f1(-540 * t) + 'deg) scale(' + f1(.6 + t * .5) + ')'});
    fils.push({offset: t, transform: 'translate(' + f1(a[0]) + 'px,' + f1(a[1]) + 'px) rotate(' + f1(Math.atan2(y - a[1], x - a[0]) * 180 / Math.PI) + 'deg) scale(' + f1(Math.max(.01, Math.hypot(x - a[0], y - a[1]))) + ',1)'});
  }
  var boule = el(C(0, 0, 11, '#e8f0ff', ' stroke="#24182e" stroke-width="2"') + L('M-9 -3 Q 0 -10 9 -2 M-8 4 Q 0 -2 8 6 M-3 -9 Q 4 0 -2 9', '#9aa8c0', 1.4) + C(-4, -4, 3, '#ffffff'));
  var lien = el('<path d="M0 0 L 1 0" stroke="#eef4ff" stroke-width="2" opacity=".8" fill="none"/>');
  var vol = boule.animate(cles, {duration: 560, easing: 'cubic-bezier(.3,.1,.6,1)', fill: 'forwards'});
  lien.animate(fils, {duration: 560, easing: 'cubic-bezier(.3,.1,.6,1)', fill: 'forwards'});
  /* la toile qui s'étale : rayons, spirale, gouttes de colle */
  var R2 = rng(Math.floor(Math.random() * 1000) + 3), ray = [], tr = '', sp = '', gt = '';
  for(var k = 0; k < 11; k++){ var an = k / 11 * Math.PI * 2 + (R2() - .5) * .2, lg = r * (.82 + R2() * .22); ray.push([an, lg]); tr += 'M0 0 L ' + f1(Math.cos(an) * lg) + ' ' + f1(Math.sin(an) * lg) + ' '; }
  [.22, .4, .58, .76, .92].forEach(function(f){ for(var k2 = 0; k2 < ray.length; k2++){ var r0 = ray[k2], r1 = ray[(k2 + 1) % ray.length], p0 = [Math.cos(r0[0]) * r0[1] * f, Math.sin(r0[0]) * r0[1] * f], p1 = [Math.cos(r1[0]) * r1[1] * f, Math.sin(r1[0]) * r1[1] * f], mm = lerp(lerp(p0, p1, .5), [0, 0], .1);
    sp += 'M' + pt(p0) + ' Q ' + pt(mm) + ' ' + pt(p1) + ' '; if(R2() < .25) gt += rond(mm[0], mm[1] + 1.5, 2); } });
  var toile = el('<circle r="' + f1(r * .95) + '" fill="#e8f0ff" opacity=".14"/>' + L(tr + sp, '#24182e', 3.4, ' opacity=".55"') + L(tr, '#f4f8ff', 1.8) + L(sp, '#e8f0ff', 1.4) + F(gt, '#f8ffe8', ' opacity=".9"') +
    L('M' + f1(-r * .5) + ' ' + f1(r * .7) + ' q -4 20 2 34 M' + f1(r * .3) + ' ' + f1(r * .85) + ' q 4 16 -2 28', '#eef4ff', 1.4, ' opacity=".7"'));
  toile.style.opacity = 0;
  var fini2 = vol.finished.then(function(){
    boule.remove();
    lien.animate([{opacity: .8}, {opacity: 0}], {duration: 400, fill: 'forwards'}).finished.then(function(){ lien.remove(); });
    toile.style.opacity = 1;
    toile.animate([{transform: 'translate(' + f1(b[0]) + 'px,' + f1(b[1]) + 'px) scale(.2) rotate(-30deg)', opacity: .4}, {offset: .55, transform: 'translate(' + f1(b[0]) + 'px,' + f1(b[1]) + 'px) scale(1.12) rotate(4deg)', opacity: 1},
      {transform: 'translate(' + f1(b[0]) + 'px,' + f1(b[1]) + 'px) scale(1) rotate(0deg)', opacity: 1}], {duration: 420, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'forwards'});
    for(var q = 0; q < 6; q++){ var aa = q / 6 * Math.PI * 2, gg = el(C(0, 0, 3, '#f4f8ff', ' stroke="#24182e" stroke-width="1"'));
      gg.animate([{transform: 'translate(' + f1(b[0]) + 'px,' + f1(b[1]) + 'px)', opacity: 1}, {transform: 'translate(' + f1(b[0] + Math.cos(aa) * r * 1.3) + 'px,' + f1(b[1] + Math.sin(aa) * r * 1.3 + 10) + 'px)', opacity: 0}], {duration: 450, easing: 'ease-out', fill: 'forwards'}).finished.then(oter(gg), oter(gg)); }
    if(o.onImpact) try{ o.onImpact(); }catch(e){}
    impact();
  });
  var entree = {ov: ov, retiree: false};
  this.toiles.push(entree);
  return function(){ return self._retirer(entree); };
};
R._retirer = function(t){
  if(t.retiree) return Promise.resolve();
  t.retiree = true;
  var i = this.toiles.indexOf(t);
  if(i >= 0) this.toiles.splice(i, 1);
  return fini(t.ov.animate([{opacity: 1}, {opacity: 0}], {duration: 450, fill: 'forwards'})).then(function(){ t.ov.remove(); });
};
R.retirerToile = function(){ var self = this; return Promise.all(this.toiles.slice().map(function(t){ return self._retirer(t); })); };
/* la réaction de base : elle part en arrière sur son fil, les pattes se replient, puis le balancier s'amortit */
R._recul = function(f, o){
  o = o || {};
  var self = this, j = this._debutAction(), base = this._base(), T = 900;
  if(o.flash !== false) this._flash(1.6 + f);
  if(this._mode() === 'dos'){
    return this._seq([{t: 0, p: {}}, {t: .15, p: avec(replie(f), {tourne: {a: (base.tourne ? base.tourne.a : 0) + 12 * f}, ceph: {a: 10 * f}})}, {t: 1, p: avec(base, {})}], 600).fini.then(function(){ return self._finAction(j, 150); });
  }
  return this._seq([{t: 0, p: {}},
    {t: .12, p: avec(replie(f), {balance: {a: -3.4 * f}, tourne: {a: -12 * f}, ceph: {a: -10 * f}, chelG: {a: 14}, chelD: {a: -14}, abdo: {sx: .94, sy: 1.06}}), e: 'cubic-bezier(.1,.9,.3,1)'},
    {t: .35, p: {balance: {a: 2.2 * f}, tourne: {a: 5 * f}, ceph: {a: 3}}, e: 'ease-in-out'},
    {t: .58, p: {balance: {a: -1.2 * f}, tourne: {a: -2 * f}}, e: 'ease-in-out'},
    {t: .8, p: {balance: {a: .5 * f}}, e: 'ease-in-out'},
    {t: 1, p: avec(base, avec(jambesRepos(), {balance: fusion(Z, base.balance), tourne: fusion(Z, base.tourne), ceph: fusion(Z, base.ceph), chelG: fusion(Z, base.chelG), chelD: fusion(Z, base.chelD), abdo: {sx: 1, sy: 1}}))}], T).fini.then(function(){ return self._finAction(j, 200); });
};
R._t_coup = function(o){ return this._recul(1); };
R._t_fleche = function(o, f){
  var c = this._pt('centre');
  this._bouffee([c[0] + hasard(-20, 20), c[1] + hasard(-20, 20)], {r: 10, coul: '#ffffff', op: .9, dx: 0, dy: 0, duree: 260, s0: .2, s1: 2.2});
  for(var i = 0; i < 3; i++) this._bouffee(c, {r: 3, coul: '#8a7470', op: .9, dx: hasard(-30, 30), dy: hasard(-30, 10), duree: 500, s1: 1});
  return this._recul(f || 1);
};
R._t_fleche_argent = function(o){ return this._t_fleche(o, 1); };
R._t_fleche_lourde = function(o){ this._poussiere(this._pt('centre'), 3, 1); return this._t_fleche(o, 1.5); };
R._t_dague = function(o){ this._entailles(this._pt('centre')); return this._recul(1.1); };
R._t_acide = function(o){ var c = this._pt('centre'); this._bulles(c, 6, {etendue: 3}); this._fumee(c, 3, {coul: '#a8c890'}); return this._recul(1.2); };
R._t_brulure = function(o){ if(!this.etat.brule) this._e_brule(true); this._souffleFeu(this._pt('centre'), 30); return this._recul(.9); };
/* le feu : elle crie, ses poils roussissent… et son cocon prend feu (les œufs vont éclore) */
R._t_feu = function(o){
  var self = this, c = this._pt('centre');
  this._souffleFeu(c, 40);
  this._fumee(c, 3, {coul: '#5a5058'});
  var pr = this._recul(1.2);
  if(!this.etat.eclos) this._minuteur(function(){ self._enflammerCocon(); }, 350);
  return pr;
};
R._enflammerCocon = function(){
  var self = this;
  if(this.etat['oeufs-brulent'] || this.etat.eclos) return;
  this.etat['oeufs-brulent'] = true;
  var c = this._pt('coconC');
  this._souffleFeu(c, 30);
  this._fondu('coconChaud', 1, 600);
  var Cn = this.J.cocon.firstElementChild;
  this._flammes('cocon', [{ref: Cn, x: 472, y: 112, lueur: [60, 70]}, {ref: Cn, x: 458, y: 120, h: 44, w: 22, r: -10}, {ref: Cn, x: 474, y: 104, h: 60, w: 26, r: 0}, {ref: Cn, x: 490, y: 116, h: 46, w: 22, r: 10}, {ref: Cn, x: 466, y: 138, h: 30, w: 16, r: -4}]);
  (function fumee(){
    if(!self.etat['oeufs-brulent'] || self.mort) return;
    self._bouffee([self._pt('coconC')[0] + hasard(-10, 10), self._pt('coconC')[1] - 50], {r: hasard(8, 12), coul: '#6a6278', op: .45, dx: hasard(0, 20), dy: -70, duree: 1600, s1: 2.6});
    self.fx.fumeeCocon = setTimeout(fumee, hasard(300, 500));
  })();
  if(!this.enAction) this._changerMode();
};
/* la lumière : elle panique, le fil lâche, elle tombe sur le dos devant */
R._t_lumiere = function(o){
  if(this.etat.dos){ this._rayons(this._pt('tete'), 50); return this._recul(.8); }
  return this._chute('lumiere', o);
};
/* l'huile sur le fil : elle glisse, glisse… et tombe sur le dos */
R._t_huile = function(o){
  if(this.etat.dos) return this._recul(.6);
  return this._chute('huile', o);
};
R._t_louche = function(o){
  var self = this, j = this._debutAction(), p = this._pt('tete');
  this._eclat([p[0], p[1] - 20], 30, '#ffe466', {rot: 30});
  this._etincelles(p, 6, {v: 50});
  for(var i = 0; i < 3; i++) this._eclat([p[0] + hasard(-40, 40), p[1] + hasard(-50, -10)], 9, '#ffe466', {delai: 120 + i * 100, duree: 380});
  var k = [{t: 0, p: {}}, {t: .08, p: avec(replie(1), {ceph: {a: 14}, balance: {a: -4}})}];
  for(i = 0; i < 8; i++) k.push({t: .15 + i * .1, p: {tourne: {a: (i % 2 ? 1 : -1) * (28 - i * 3.4)}, balance: {a: (i % 2 ? -1 : 1) * (3 - i * .36)}}, e: 'ease-in-out'});
  k.push({t: 1, p: avec(jambesRepos(), {tourne: {a: 0}, balance: {a: 0}, ceph: {a: 0}})});
  return this._seq(k, 1600).fini.then(function(){ return self._finAction(j, 200); });
};
R._t_colle = function(o){
  var self = this, c = this._pt('centre');
  for(var i = 0; i < 5; i++) this._bouffee([c[0] + hasard(-50, 30), c[1] + hasard(0, 60)], {r: 8, coul: '#d0e05a', op: .9, dx: hasard(-20, 20), dy: hasard(10, 30), duree: 500, delai: i * 30, s1: 1.4});
  return this._recul(.6, {flash: false}).then(function(){ return self.etatPublic('colle', true); });
};
R._t_nuage = function(o){ var self = this; return this.tousser().then(function(){ return self.etatPublic('haut', true); }); };
R._t_givre = function(o){ var self = this; this._cristaux(this._pt('centre'), 10, {v: 60}); return this._recul(.7, {flash: false}).then(function(){ return self.etatPublic('gele', true); }); };
R._t_bruit = function(o){
  var self = this, j = this._debutAction(), p = this._pt('tete');
  this._ondes([p[0] - 50, p[1]], 1); this._ondes([p[0] + 70, p[1] - 30], 1);
  var k = [{t: 0, p: {}}, {t: .12, p: avec(replie(1.5), desc(-24, {abdo: {sx: .9, sy: .9}, ceph: {a: -8}}))}];
  for(var i = 0; i < 6; i++) k.push({t: .3 + i * .08, p: {tourne: {x: i % 2 ? 2 : -2}}, e: 'linear'});
  k.push({t: 1, p: avec(jambesRepos(), desc(0, {abdo: {sx: 1, sy: 1}, ceph: {a: 0}, tourne: {x: 0}}))});
  return this._seq(k, 1100).fini.then(function(){ return self._finAction(j, 200); });
};
R._t_bouclier = function(o){
  var self = this, j = this._debutAction(), p = this._pt('bouche');
  this._etincelles([p[0] - 14, p[1]], 8, {v: 50, ang: Math.PI, coul: ['#bff8ff', '#5fe8ff', '#ffffff']});
  this._eclat([p[0] - 16, p[1]], 22, '#bff8ff', {anneau: '#5fe8ff'});
  var k = [{t: 0, p: {}}, {t: .1, p: avec(replie(1), {balance: {a: -5}, tourne: {a: -16}, ceph: {a: -14}, chelG: {a: 20}, chelD: {a: -20}}), e: 'cubic-bezier(.1,.9,.3,1)'}];
  for(var i = 0; i < 5; i++) k.push({t: .25 + i * .1, p: {ceph: {a: i % 2 ? 8 : -8}, balance: {a: (i % 2 ? 1 : -1) * (2.4 - i * .4)}}});
  k.push({t: 1, p: avec(jambesRepos(), {balance: {a: 0}, tourne: {a: 0}, ceph: {a: 0}, chelG: {a: 0}, chelD: {a: 0}})});
  return this._seq(k, 1300).fini.then(function(){ return self._finAction(j, 200); });
};
/* immunisée : ça rebondit ; elle nargue en se frottant les pattes de devant et en claquant des crochets */
R._t_rebond = function(o){
  var self = this, j = this._debutAction(), c = this._pt('centre');
  this._eclat(c, 22, '#ffffff', {anneau: '#fff4c0'});
  this._etincelles(c, 8, {v: 70});
  var k = [{t: 0, p: {}}, {t: .12, p: {tourne: {a: -4}}}];
  for(var i = 0; i < 5; i++) k.push({t: .2 + i * .12, p: {p0: {a: i % 2 ? -18 : -6}, p0g: {a: GEO[0].k * (i % 2 ? 10 : 30)}, p7: {a: i % 2 ? 6 : 18}, p7g: {a: GEO[7].k * (i % 2 ? 30 : 10)}, chelG: {a: i % 2 ? 16 : -2}, chelD: {a: i % 2 ? -16 : 2}, ceph: {a: -6}}, e: 'ease-in-out'});
  k.push({t: 1, p: avec(jambesRepos(), {tourne: {a: 0}, chelG: {a: 0}, chelD: {a: 0}, ceph: {a: 0}})});
  return this._seq(k, 1500).fini.then(function(){ return self._finAction(j, 200); });
};
/* elle tousse trois fois dans le nuage : tout le corps se secoue, les pattes se replient, des bouffées sortent */
R.tousser = function(){
  var self = this, j = this._debutAction(), base = this._base(), T = 2500, k = [{t: 0, p: {}}], quintes = [[.06, 1], [.37, 1.1], [.68, 1.25]];
  this._fondu('plis', 1, 200);
  quintes.forEach(function(q){
    var t = q[0], f = q[1];
    k.push({t: t + .07, p: avec(replie(.3), {ceph: {a: -6 * f}, abdo: {sx: 1.04, sy: 1.04}, chelG: {a: 4}, chelD: {a: -4}})});
    k.push({t: t + .12, p: avec(replie(1.1 * f), {ceph: {a: 14 * f, x: -4}, abdo: {sx: .92, sy: .9}, chelG: {a: 22 * f}, chelD: {a: -22 * f}, balance: {a: (base.balance ? base.balance.a : 0) - 2 * f}, tourne: {a: -8 * f}}), e: 'cubic-bezier(.1,.9,.3,1)'});
    k.push({t: t + .22, p: avec(replie(.4), {ceph: {a: 2, x: 0}, abdo: {sx: 1, sy: 1}, chelG: {a: 3}, chelD: {a: -3}, balance: {a: 0}, tourne: {a: 0}}), e: 'ease-in-out'});
  });
  k.push({t: 1, p: avec(base, jambesRepos())});
  quintes.forEach(function(q){
    self._minuteur(function(){
      var p = self._pt('bouche');
      for(var n = 0; n < 5; n++) self._bouffee([p[0] - 6, p[1] + hasard(-6, 6)], {r: hasard(8, 13) * q[1], coul: choisir(['#d8e0c4', '#c8d4b0', '#e8eedc', '#b8c8a0']), op: .85, dx: hasard(-70, -30), dy: hasard(-20, 20), duree: hasard(800, 1200), delai: n * 35, s0: .4, s1: 2.2, liser: true});
    }, T * (q[0] + .12));
  });
  return this._seq(k, T).fini.then(function(){ self._fondu('plis', 0, 300); return self._finAction(j, 220); });
};
/* la peur : elle remonte son fil à toute vitesse et disparaît dans le noir ; son cocon remonte derrière elle */
R.fuir = function(){
  var self = this, j = this._debutAction();
  ['ebloui', 'colle', 'cible', 'gele', 'haut'].forEach(function(n){ self.etat[n] = false; });
  this._eteindreEtoiles('etoiles');
  this._tous('[data-colle],[data-gel]').forEach(function(e){ self._fondu(e, 0, 200); });
  this._fondu('patteYeux', 0, 200);
  var depart = Promise.resolve();
  if(this.etat.dos){ this.etat.dos = false; depart = this._seRelever().then(function(){ j = self._debutAction(); }); }
  return depart.then(function(){
    self._cri(self._pt('bouche'), 1.2);
    var k = [{t: 0, p: {}}, {t: .12, p: avec(replie(1.4), desc(16, {abdo: {sx: 1.1, sy: .9}}))}];
    for(var i = 1; i <= 8; i++) k.push({t: .12 + i / 8 * .88, p: avec(gigote(i), desc(16 - 1450 * Math.pow(i / 8, 1.7))), e: 'linear'});
    self._minuteur(function(){ self._fondu('corps', 0, 500); }, 1500 * .6);
    self._minuteur(function(){ self._seq([{t: 0, p: {coconFil: {y: 0}}}, {t: 1, p: {coconFil: {y: -1100}}, e: 'cubic-bezier(.5,0,.9,.6)'}], 900); }, 1500 * .55);
    return self._seq(k, 1500).fini;
  }).then(function(){ return attendreMs(500); }).then(function(){
    self._couperBoucles();
    self.el.style.visibility = 'hidden';
    self.enAction = false;
  });
};

/* =====================================================================
   F. Le moment propre : l'éclosion (le cocon brûle, éclate, deux œufs tombent : le moteur crée deux « petitearaignee »)
   special('eclosion', {vers: [{x,y},{x,y}] (écran, facultatif), onImpact})
   → Promise résolue avec les deux points d'atterrissage (écran) : le moteur y crée les petites, dont entrer() commence par le même œuf.
   ===================================================================== */
R._s_eclosion = function(o){
  o = o || {};
  var self = this;
  if(this.etat.eclos) return Promise.resolve([]);
  var allume = this.etat['oeufs-brulent'] ? Promise.resolve() : (this._enflammerCocon(), attendreMs(700));
  return allume.then(function(){
    var c = self._pt('coconC');
    /* le cocon gonfle, tremble… */
    var k = [{t: 0, p: {cocon: {s: 1}}}];
    for(var i = 1; i < 8; i++) k.push({t: i / 8, p: {cocon: {sx: 1 + i * .025, sy: 1 + i * .03, a: i % 2 ? 4 : -4}}, e: 'linear'});
    k.push({t: 1, p: {cocon: {sx: 1.25, sy: 1.28, a: 0}}});
    return self._seq(k, 800).fini.then(function(){
      /* … et éclate : deux œufs tombent */
      self._souffleFeu([c[0], c[1] + 10], 40);
      self._eclat([c[0], c[1]], 34, '#ffd060', {anneau: '#ffb040'});
      self._fondu('coconIntact', 0, 0); self._fondu('coconChaud', 0, 300); self._fondu('coconEclos', 1, 0);
      self._seq([{t: 0, p: {cocon: {sx: 1.25, sy: 1.28}}}, {t: .4, p: {cocon: {sx: .9, sy: .95}}, e: 'ease-out'}, {t: 1, p: {cocon: {s: 1}}}], 500);
      var cibles = (o.vers && o.vers.length >= 2) ? o.vers.slice(0, 2).map(function(q){ return self._depuisEcran(q); }) : [[c[0] - 170, SOLA - 26], [c[0] + 10, SOLA - 26]];
      var oeuf = '<ellipse rx="22" ry="27" fill="' + self.G.oeuf + '" stroke="' + O + '" stroke-width="2.6"/>' + L('M-12 -8 q 6 4 4 12 M6 -16 q -4 8 2 14 M-4 10 q 6 2 10 10', '#e07a3a', 1.6, ' opacity=".7"') + '<ellipse cx="-8" cy="-11" rx="6" ry="9" fill="#fffbe8" opacity=".7"/>';
      var vols = cibles.map(function(q, n){
        var g = self._el(self.S.fixe, oeuf);
        return fini(self._voler(g, [c[0] + (n ? 8 : -8), c[1] + 20], [q[0], q[1]], {haut: 40 + n * 30, rot: (n ? 1 : -1) * 380, duree: 900 + n * 120, rebond: 10, bascule: n ? -12 : 12,
          onSol: function(){ self._poussiere([q[0], q[1] + 24], 2, n ? 1 : -1); }})).then(function(){
          /* l'œuf vacille un instant, puis le moteur prend le relais (petitearaignee.entrer) */
          var t0 = g.style.transform || getComputedStyle(g).transform;
          return fini(g.animate([{opacity: 1}, {opacity: 1, offset: .7}, {opacity: 0}], {duration: 450, fill: 'forwards'})).then(function(){ g.remove(); return self._versEcran([q[0], q[1]]); });
        });
      });
      if(o.onImpact) try{ o.onImpact(); }catch(e){}
      self.etat.eclos = true;
      return Promise.all(vols);
    }).then(function(points){
      /* le cocon vide fume encore un peu, puis s'éteint */
      self.etat['oeufs-brulent'] = false;
      self._flammes('cocon', null);
      clearTimeout(self.fx.fumeeCocon);
      for(var n = 0; n < 3; n++) self._bouffee([self._pt('coconC')[0], self._pt('coconC')[1] - 20], {r: 9, coul: '#5a5260', op: .5, dx: hasard(-10, 20), dy: -60, duree: 1500, delai: n * 300, s1: 2.4});
      return points;
    });
  });
};

/* =====================================================================
   G. La mort par critique : elle se tord, gonfle, éclate en brume noire ; restent une carcasse aux pattes repliées et le fil cassé qui pend
   ===================================================================== */
R.exploser = function(scene){
  var self = this, j = this._debutAction(), boomOk, boomP = new Promise(function(r){ boomOk = r; });
  if(this.etat.brule) this._e_brule(false);
  this._eteindreEtoiles('etoiles');
  this._pulser('yeuxRage', false);
  var k = [{t: 0, p: {}}];
  for(var i = 1; i <= 10; i++) k.push({t: i / 11, p: avec(gigote(i), {abdo: {sx: 1 + i * .025, sy: 1 + i * .03}, tourne: {x: i % 2 ? 3 : -3}, ceph: {a: i % 2 ? 6 : -6}, chelG: {a: 20}, chelD: {a: -20}}), e: 'linear'});
  k.push({t: 1, p: {abdo: {sx: 1.3, sy: 1.35}}, e: 'ease-in'});
  [160, 360, 560].forEach(function(t){ self._minuteur(function(){ var c = self._pt('centre'); self._bouffee([c[0] + hasard(-50, 50), c[1] + hasard(-40, 30)], {r: 12, coul: '#1a1222', op: .85, dx: hasard(-20, 20), dy: -30, duree: 600, s1: 2.2}); }, t); });
  var p = this._seq(k, 820).fini.then(function(){
    var c0 = self._pt('centre'), dosA = self.etat.dos;
    var boum = self._boum(scene, {ref: 'centre', x: 300, y: 172, u: 1, extra: function(el, cx, cy, u, T){
      /* trois bouts de pattes projetés */
      for(var t = 0; t < 3; t++){
        var at = -Math.PI * (.15 + t * .35), vt = hasard(70, 120) * u, rt = hasard(-500, 500), lg = 16 * u;
        var pa = el(L('M0 0 Q ' + f1(lg * .5) + ' ' + f1(-lg * .4) + ' ' + f1(lg) + ' ' + f1(-lg * .1), '#24182e', 5 * u) + L('M0 0 Q ' + f1(lg * .5) + ' ' + f1(-lg * .4) + ' ' + f1(lg) + ' ' + f1(-lg * .1), '#5a4240', 2.6 * u));
        pa.animate([{transform: T(cx, cy, 1, 0), opacity: 1}, {offset: .45, transform: T(cx + Math.cos(at) * vt, cy + Math.sin(at) * vt, 1, rt * .5), opacity: 1}, {transform: T(cx + Math.cos(at) * vt * 1.4, cy + Math.sin(at) * vt * .3 + 60 * u, 1, rt), opacity: 0}], {duration: hasard(1300, 1800), easing: 'cubic-bezier(.2,.6,.6,1)', fill: 'forwards'}).finished.then(oter(pa), oter(pa));
      }
    }});
    boomOk();
    /* le fil cassé qui pend (s'il était encore là) */
    if(!self.filCasse && !dosA){
      var hautF = self._ou('fil', 0, 0), basF = self._ou('fil', 0, LF + self._lire('descente').y - 90);
      var fc = self._el(self.S.fixe, L('M0 0 L 0 ' + f1(basF[1] - hautF[1]) + ' q -6 10 2 18 M0 ' + f1(basF[1] - hautF[1]) + ' q 6 8 -2 14', '#eef4ff', 3, ' opacity=".85"'));
      fc.style.transform = 'translate(' + f1(hautF[0]) + 'px,' + f1(hautF[1]) + 'px)';
      fc.animate([{transform: 'translate(' + f1(hautF[0]) + 'px,' + f1(hautF[1]) + 'px) rotate(0deg)'}, {transform: 'translate(' + f1(hautF[0]) + 'px,' + f1(hautF[1]) + 'px) rotate(.8deg)'}, {transform: 'translate(' + f1(hautF[0]) + 'px,' + f1(hautF[1]) + 'px) rotate(-.6deg)'}, {transform: 'translate(' + f1(hautF[0]) + 'px,' + f1(hautF[1]) + 'px) rotate(.3deg)'}, {transform: 'translate(' + f1(hautF[0]) + 'px,' + f1(hautF[1]) + 'px) rotate(0deg)'}], {duration: 4000, easing: 'ease-in-out'});
    }
    self.J.fil.style.opacity = 0;
    /* le cocon, roussi, tombe au sol */
    if(!self.etat.eclos) self._fondu('coconChaud', 1, 0);
    var dc = self._detacher(['cocon']);
    var cv = self._voler(dc.g, dc.c, [dc.c[0] + 20, SOLA - 30], {haut: 20, rot: 70, duree: 1000, rebond: 8});
    cv.finished.then(function(){ try{ cv.commitStyles(); cv.cancel(); }catch(e){} }, function(){});
    self._flammes('cocon', null); clearTimeout(self.fx.fumeeCocon);
    self.J.coconFil.style.opacity = 0;
    /* la carcasse aux pattes repliées, à sa place */
    var x0 = Math.max(150, Math.min(420, c0[0])), cx = x0, cy = SOLA, pa = '', K = 1.4;
    [[-46, -14, -62, -44, -48, -58], [-30, -20, -40, -56, -24, -66], [-12, -24, -14, -60, 2, -66], [6, -24, 16, -56, 30, -60], [24, -22, 42, -50, 54, -46], [40, -18, 62, -36, 66, -22], [-56, -8, -78, -24, -76, -38], [54, -10, 78, -16, 80, -4]].forEach(function(q){
      pa += 'M' + f1(cx + q[0] * K) + ' ' + f1(cy + q[1] * K) + ' Q ' + f1(cx + q[2] * K) + ' ' + f1(cy + q[3] * K) + ' ' + f1(cx + q[4] * K) + ' ' + f1(cy + q[5] * K) + ' ';
    });
    var carc = self._el(self.S.fixeArr, '<ellipse cx="' + cx + '" cy="' + (cy - 2) + '" rx="96" ry="11" fill="#000" opacity=".35"/>' + L(pa, O, 12) + L(pa, '#7a6a68', 6.4) + L(pa, '#c8b8b0', 1.8, ' opacity=".7"') +
      P('M' + f1(cx - 6) + ' ' + f1(cy) + ' C ' + f1(cx - 4) + ' ' + f1(cy - 58) + ' ' + f1(cx + 100) + ' ' + f1(cy - 62) + ' ' + f1(cx + 104) + ' ' + f1(cy) + ' Z', self.G.cendre) +
      P('M' + f1(cx - 84) + ' ' + f1(cy) + ' C ' + f1(cx - 82) + ' ' + f1(cy - 42) + ' ' + f1(cx - 10) + ' ' + f1(cy - 46) + ' ' + f1(cx - 4) + ' ' + f1(cy) + ' Z', self.G.cendre) +
      F(rond(cx + 24, cy - 22, 3) + rond(cx + 44, cy - 14, 2.4) + rond(cx - 30, cy - 16, 2.6) + rond(cx + 10, cy - 8, 2), '#2a2228', ' opacity=".8"') + L('M' + f1(cx + 6) + ' ' + f1(cy - 30) + ' C ' + f1(cx + 24) + ' ' + f1(cy - 40) + ' ' + f1(cx + 50) + ' ' + f1(cy - 38) + ' ' + f1(cx + 64) + ' ' + f1(cy - 26), '#b8aab0', 1.8, ' opacity=".6"') +
      '<g class="' + PX + '-lueur">' + F(rond(cx + 30, cy - 30, 2.4) + rond(cx - 20, cy - 20, 2), '#ff9a40') + '</g>' + F(rond(cx - 74, cy - 2, 5) + rond(cx + 88, cy - 2, 4) + rond(cx + 100, cy - 1, 3), '#6a6070', ' opacity=".7"'));
    carc.animate([{opacity: 0, transform: 'translate(' + cx + 'px,' + cy + 'px) scale(.3) translate(' + (-cx) + 'px,' + (-cy) + 'px)'}, {offset: .55, opacity: 0}, {opacity: 1, transform: 'translate(' + cx + 'px,' + cy + 'px) scale(1) translate(' + (-cx) + 'px,' + (-cy) + 'px)'}], {duration: 1500, easing: 'ease-out', fill: 'forwards'});
    (function fumet(n){ if(n <= 0) return; self._bouffee([cx + hasard(-30, 30), cy - 30], {r: 7, coul: '#5a5260', op: .5, dx: hasard(-6, 14), dy: -56, duree: 1700, s1: 2.4}); setTimeout(function(){ fumet(n - 1); }, 450); })(8);
    self._couperBoucles();
    self.mort = true;
    self.J.corps.style.opacity = 0;
    self.J.ombre.style.opacity = 0;
    return boum.fini;
  });
  p.boom = boomP;
  return p;
};

/* =====================================================================
   H. L'enregistrement
   ===================================================================== */
var INFO = {
  id: 'araignee', nom: 'Araignée des caves', rang: 'normal', pv: 60, attaque: 'morsure 12 + toile (un héros passe son tour)',
  cadre: {w: 200, h: 330}, sol: .954, vole: false, suspendue: true, places: 1,
  attaques: ['morsure', 'toile'],
  specials: ['eclosion'],
  etats: ['enrage', 'brule', 'colle', 'ebloui', 'gele', 'ouvert', 'dos', 'cible', 'haut', 'oeufs-brulent']
};
Araignee.prototype.info = INFO;
global.BETES = global.BETES || {};
global.BETES[ID] = {
  info: INFO,
  creer: function(conteneur, options){
    var b = new Araignee(conteneur, options), a = acteur(b);
    a.retirerToile = function(){ return b.retirerToile(); };
    return a;
  }
};
})(typeof window !== 'undefined' ? window : this);
