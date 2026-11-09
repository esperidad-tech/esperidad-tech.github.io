/* ratcuir-anime.js — le rat cuirassé animé (Les Enquêteurs de Brumeval, donjon du puits)
   Module autonome, sans dépendance ; il injecte son propre CSS (préfixe .bt-ratcuir-…). Contrat : anim/betes/CONTRAT.md.

     var r = BETES.ratcuir.creer(conteneur);   // un SVG qui remplit le conteneur (220 × 150), il regarde à gauche

   Actions (Promise, résolue quand il est revenu à son attente) :
     entrer({distance})          il arrive au galop (l'armure cliquette), freine en dérapant, fait sonner son armure
     attaquer('coup-de-tete', o) élan (il gratte le sol), charge courte, impact (o.onImpact), recul ; la Promise a .impact
                                 s'il rougeoie (feu), le coup brûle : gerbe de flammes à l'impact
     touche(type)                fleche, fleche-argent : « ting », étincelles, la flèche rebondit (sans armure : il encaisse)
                                 fleche-lourde : grosses étincelles, une plaque se cabosse ; dague : ça raye, étincelles
                                 feu : avec l'armure → état « rougeoie » (il rugit) ; sans armure → état « brule »
                                 lumiere : avec le casque, elle glisse dessus (rien) ; sans casque → état « ebloui » (il se dresse, ventre offert)
                                 louche : 1er coup → special('tournis'), 2e coup → special('casque-tombe'), ensuite une bosse
                                 acide : avec l'armure → special('armure-tombe') ; givre : avec l'armure → special('armure-eclate'), sinon état « gele »
                                 colle → état « colle » ; huile : il patine, manque de tomber, se rattrape ; nuage → tousser()
                                 bruit, bouclier (il frappe un bouclier de runes), rebond (immunisé : il nargue), brulure (la flamme reprend), coup
     special(nom, o)             'tournis', 'casque-tombe', 'armure-tombe' (acide), 'armure-eclate' (givre) ; o.onTinte(piece) à chaque morceau qui tombe
     tousser()                   trois quintes, lentes, avec des bouffées
     fuir() / mourir()           il sursaute, fait demi-tour et détale vers la droite
     exploser(scene)             il enfle, l'armure saute, il éclate en brume noire ; restent cendres, os et ferraille au sol.
                                 La Promise a .boom (le moment où il éclate) et se résout quand la brume s'est dissipée.
   États (se cumulent) : etat(nom, on) — enrage, brule, colle, ebloui, gele, ouvert, dos, cible,
     et les siens : nu (sans armure, instantané), sans-casque (instantané), rougeoie (feu), tournis.
   etatCourant(), ancre(nom) (tete, pointfaible, centre, bouche, pieds, haut : coordonnées écran), arreter().
   Le point faible : la peau nue du dos (sans armure) ou le ventre (dressé par la lumière, ou sur le dos).

   Le dessin reprend la fiche bestiaire/betes/02-ratcuir.js, découpé en pièces articulées (<g data-j> au pivot ramené à 0,0),
   animées avec la Web Animations API. Pas de filtre SVG dans les pièces qui bougent : flous → dégradés, rouille et grain dessinés. */
(function(global){
'use strict';
var ID = 'ratcuir', PX = 'bt-ratcuir';

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
    return '<g transform="rotate(' + (r || 0) + ')">' +
      '<path d="' + flammeD(h, w) + '" fill="' + G.feu1 + '" stroke="#5a1a08" stroke-width="2" class="' + PX + '-fl" style="animation-delay:-' + dl + 's;animation-duration:' + dur + 's"/>' +
      '<path d="' + flammeD(h * .7, w * .62) + '" fill="#ffa21e" class="' + PX + '-fl2" style="animation-delay:-' + dl + 's;animation-duration:' + (dur * .8).toFixed(2) + 's"/>' +
      '<path d="' + flammeD(h * .42, w * .36) + '" fill="' + G.feu2 + '"/></g>';
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
   A. Le dessin du rat cuirassé (fiche 02-ratcuir.js), découpé en pièces articulées
   Mêmes formes, mêmes couleurs que la fiche. Les flous et la rouille « filtre » de la fiche sont remplacés
   par des dégradés et des taches dessinées : rien n'est recalculé quand il bouge (tablette).
   ===================================================================== */
var QP = [[452, 330], [494, 326], [522, 296], [530, 252], [518, 210], [494, 186], [470, 184]], QW = [30, 25, 20, 16, 12, 8, 4];
/* l'ordre dans lequel l'armure tombe (acide) */
var ARMURE = ['ep1', 'ep2', 'ep3', 'plq4', 'plq3', 'gorge', 'plq2', 'plq1', 'cuissarde', 'plq0', 'ann1', 'ann2', 'ann3', 'ann4', 'sangle'];
var SOL = 393;

function dessinerRatcuir(D){
  var poil = '#5c4a57', ventre = '#8f7686', rose = '#d58a9a', fer = '#6c7584';
  var GL = D.glace(), rivG = D.g('#9aa3ad'), NG = 0;
  this.G.cendre1 = D.g('#8a8290'); this.G.cendre2 = D.g('#a8a0ae');
  var rougeG = D.lin([[0, '#ffe080', .9], [.3, '#ff8a20', .85], [.7, '#e0301a', .85], [1, '#5a0a10', .9]], 1, 0, 0, 1);
  var acideG = D.lin([[0, '#f0ffa0', .85], [.5, '#a8e040', .75], [1, '#4a7a10', .85]], 1, 0, 0, 1);
  /* la glace (une variante cachée par pièce), avec ses cristaux */
  function gel(d, cr){ return variante('gel' + (++NG), F(d, GL) + L(d, '#ffffff', 1.6, ' opacity=".6"') + (cr || ''), ' data-gel'); }
  /* la colle : un pâté sur la patte et un fil qui s'étirera (variantes cachées) */
  function colleP(x, y, nom, k){
    k = k || 1;
    var pate = 'M' + f1(x - 14 * k) + ' ' + f1(y + 3) + ' C ' + f1(x - 14 * k) + ' ' + f1(y - 6) + ' ' + f1(x - 7 * k) + ' ' + f1(y - 9) + ' ' + f1(x) + ' ' + f1(y - 8) + ' C ' + f1(x + 7 * k) + ' ' + f1(y - 9) + ' ' + f1(x + 14 * k) + ' ' + f1(y - 6) + ' ' + f1(x + 14 * k) + ' ' + f1(y + 3) + ' Z';
    var fil = 'M' + f1(x - 6) + ' ' + f1(y - 1) + ' C ' + f1(x - 3) + ' ' + f1(y + 2) + ' ' + f1(x - 2) + ' ' + f1(y + 4) + ' ' + f1(x - 3) + ' ' + f1(y + 7) + ' L ' + f1(x + 3) + ' ' + f1(y + 7) + ' C ' + f1(x + 2) + ' ' + f1(y + 4) + ' ' + f1(x + 3) + ' ' + f1(y + 2) + ' ' + f1(x + 6) + ' ' + f1(y - 1) + ' Z';
    return variante('fil' + nom, F(fil, '#d8e870', ' fill-opacity=".9"') + L('M' + f1(x - 1) + ' ' + f1(y) + ' L ' + f1(x - 1) + ' ' + f1(y + 6), '#fbffd0', 1.2, ' opacity=".8"'), ' data-colle', x, y - 1) +
      variante('colle' + nom, F(pate, '#d0e05a', ' fill-opacity=".92" stroke="#5a6420" stroke-width="1.4"') + L('M' + f1(x - 9 * k) + ' ' + f1(y - 4) + ' Q ' + f1(x) + ' ' + f1(y - 7) + ' ' + f1(x + 9 * k) + ' ' + f1(y - 4), '#fbffd0', 1.4, ' opacity=".8"'), ' data-colle');
  }
  /* touffes de poil qui dépassent d'un bord (fiche) */
  function frange(pts, haut, couleur, seed, recul){
    var R = rng(seed), s = 'M' + pt(pts[0]), n = pts.length, nr = [];
    recul = recul == null ? .5 : recul;
    for(var k = 0; k < n - 1; k++){
      var a = pts[k], b = pts[k + 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, h = haut * (.6 + R() * .7);
      nr.push([dy / l, -dx / l]);
      s += ' Q ' + pt([a[0] + dx * .7 + dy / l * h * .4, a[1] + dy * .7 - dx / l * h * .4]) + ' ' + pt([b[0] + dx * recul + dy / l * h, b[1] + dy * recul - dx / l * h]) + ' L ' + pt(b);
    }
    nr.push(nr[n - 2]);
    for(var k2 = n - 1; k2 >= 0; k2--){ var q = pts[k2]; s += ' L ' + pt([q[0] - nr[k2][0] * 16, q[1] - nr[k2][1] * 16]); }
    return P(s + ' Z', couleur, ' stroke-width="2.6"');
  }
  /* des mèches de poil couchées vers l'arrière (fiche) */
  function poilsC(cx, cy, rx, ry, n, seed, cH, cB, op){
    var R = rng(seed), h = '', b = '';
    for(var k = 0; k < n; k++){
      var a = R() * Math.PI * 2, r = Math.sqrt(R()), x = cx + Math.cos(a) * rx * r, y = cy + Math.sin(a) * ry * r, l = 8 + R() * 9;
      R();
      var seg = 'M' + f1(x) + ' ' + f1(y) + ' q ' + f1(l * .5) + ' ' + f1(l * .05) + ' ' + f1(l) + ' ' + f1(l * .42) + ' ';
      if(y < cy - ry * .15) h += seg; else b += seg;
    }
    return L(h, cH, 1.5, ' opacity="' + f1((op || .4) + .1) + '"') + L(b, cB, 1.5, ' opacity="' + f1((op || .4) + .1) + '"');
  }
  function rivet(x, y, r){ r = r || 4; x = +x; y = +y; return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + rivG + '" stroke="' + O + '" stroke-width="1.8"/>' + C(f1(x + r * .3), f1(y - r * .35), f1(r * .35), '#eef6ff', ' opacity=".85"'); }
  /* la rouille : des plaques orangées et des piqûres sombres, dessinées (pas de filtre) */
  function rouille(z, seed){
    var R = rng(seed), a = '', b = '', c = '', n = Math.max(6, Math.round(z[2] * z[3] / 40));
    for(var k = 0; k < n; k++){
      var an = R() * Math.PI * 2, r = Math.sqrt(R()), x = z[0] + Math.cos(an) * z[2] * r, y = z[1] + Math.sin(an) * z[3] * r, t = 2 + R() * 5.5;
      a += tache(x, y, t, R, .7);
      if(R() < .55) b += tache(x + (R() - .5) * t * .6, y + (R() - .5) * t * .6, t * .5, R, .6);
    }
    for(var k2 = 0; k2 < n * 2; k2++){ var an2 = R() * Math.PI * 2, r2 = Math.sqrt(R()); c += rond(z[0] + Math.cos(an2) * z[2] * r2, z[1] + Math.sin(an2) * z[3] * r2, .7 + R() * 1.2); }
    return F(a, '#a2501e', ' opacity=".85"') + F(b, '#d8843e', ' opacity=".6"') + F(c, '#24120c', ' opacity=".55"');
  }
  /* des fissures (le givre) */
  function fissures(z, seed){
    var R = rng(seed + 5), s = '';
    for(var k = 0; k < 3; k++){
      var x = z[0] + (R() - .5) * z[2] * .4, y = z[1] + (R() - .5) * z[3] * .4, a = R() * Math.PI * 2;
      s += 'M' + f1(x) + ' ' + f1(y);
      for(var j = 0; j < 3; j++){ a += (R() - .5) * 1.4; x += Math.cos(a) * z[2] * .3; y += Math.sin(a) * z[3] * .3; s += ' L ' + f1(x) + ' ' + f1(y); }
      s += ' ';
    }
    return L(s, '#14304a', 3.4) + L(s, '#f4fdff', 1.4);
  }
  /* une plaque de fer : remplissage, rouille, contour, liseré de lune ; et ses couches cachées (gel, acide, rougeoiement) */
  function plaque(ch, coul, liser, bas, z, seed, nom){
    var cl = D.clip(ch);
    return P(ch, D.g(coul || fer)) +
      '<g' + cl + '>' + rouille(z, seed) +
      (bas ? L(bas, '#7a3a1a', 8, ' opacity=".36"') + L(bas, '#3a1c12', 3, ' opacity=".5" transform="translate(0 -3)"') : '') +
      (liser ? L(liser, '#ffffff', 8, ' opacity=".08"') : '') +
      variante(nom + '_acide', F(ch, acideG) + rouille([z[0] + 3, z[1] + 2, z[2] * .8, z[3] * .8], seed + 3).replace(/#a2501e/g, '#5a8a18').replace(/#d8843e/g, '#e8ff8a'), ' data-acide') +
      variante(nom + '_rouge', F(ch, rougeG), ' data-rouge') +
      variante(nom + '_gel', F(ch, GL), ' data-gel="armure"') +
      variante(nom + '_fente', fissures(z, seed), ' data-fente') +
      '</g>' + L(ch, O, 3) + (liser ? L(liser, LUNE, 2.2, ' opacity=".75"') : '');
  }
  /* une rune gravée qui luit (cyan) : la lueur est un trait large et pâle, pas un flou */
  var RUNES = ['M0 -8 L0 8 M0 -8 L6 -3 M0 0 L6 4', 'M-5 -8 L4 0 L-5 8', 'M0 -8 L0 8 M-5 -4 L5 4', 'M0 -8 L5 0 L0 8 L-5 0 Z', 'M-4 -8 L-4 8 M-4 0 L4 -7 M-4 0 L4 7', 'M-5 -7 L5 -7 L-5 7 L5 7', 'M0 -8 L0 8 M-5 -8 L0 -2 L5 -8'];
  function rune(k, x, y, a, e){
    var g = RUNES[k % RUNES.length];
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + a + ') scale(' + (e || 1) + ')">' + L(g, '#1a1220', 3.4, ' opacity=".7" transform="translate(-.8 1)"') + L(g, '#5fe8ff', 6, ' opacity=".22"') + L(g, '#5fe8ff', 3.6, ' opacity=".3"') + L(g, '#bff8ff', 1.7) + '</g>';
  }
  var blanc = D.doux('#eaf6ff', .6), cyan = D.doux('#5fe8ff', .5), noir = D.doux('#0c0612', .7);

  /* ---- l'ombre au sol ---- */
  var ombre = '<ellipse cx="282" cy="392" rx="236" ry="19" fill="#000" opacity=".5"/><ellipse cx="300" cy="391" rx="180" ry="12" fill="' + noir + '"/>';

  /* ---- la queue annelée de fer : six segments emboîtés ---- */
  var queue = '', queueC = '#cc8494', ANN = {1: [.45, 9], 2: [.55, 9], 3: [.6, 8], 4: [.55, 7]};
  for(var i = QP.length - 2; i >= 0; i--){
    var a = QP[i], b = QP[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l, der = i === QP.length - 2;
    var a2 = [a[0] - ux * 7, a[1] - uy * 7], b2 = der ? b : [b[0] + ux * 8, b[1] + uy * 8];
    var tb = tube([a2, lerp(a, b, .5), b2], [QW[i] + 1, (QW[i] + QW[i + 1]) / 2, QW[i + 1] + (der ? 0 : .8)]);
    var art = der ? P(tb.d, queueC) : F(tb.d, queueC) + L(lisse(tb.g), O, 2.8) + L(lisse(tb.dr), O, 2.8);
    if(i === 0) art += F(tb.d, '#000', ' opacity=".2"');
    var an = '';
    for(var k = 0; k < 3; k++){ var t = (k + .5) / 3, c = lerp(a, b, t), w = (QW[i] * (1 - t) + QW[i + 1] * t) / 2; an += 'M' + pt([c[0] - uy * w * .9, c[1] + ux * w * .9]) + ' L ' + pt([c[0] + uy * w * .9 + ux * 3, c[1] - ux * w * .9 + uy * 3]) + ' '; }
    art += L(an, '#9a5266', 1.4, ' opacity=".6"') + L(lisse(tb.dr), '#ffd2dc', 2, ' opacity=".5" transform="translate(' + f1(uy * 2) + ' ' + f1(-ux * 2) + ')"') + gel(tb.d);
    if(ANN[i]){
      var r = ANN[i], x = a[0] + dx * r[0], y = a[1] + dy * r[0], ww = (QW[i] + QW[i + 1]) / 2 + 7, h = r[1];
      var ch = 'M' + f1(x - uy * ww / 2 - ux * h / 2) + ' ' + f1(y + ux * ww / 2 - uy * h / 2) + ' Q ' + f1(x - ux * h * .9) + ' ' + f1(y - uy * h * .9) + ' ' + f1(x + uy * ww / 2 - ux * h / 2) + ' ' + f1(y - ux * ww / 2 - uy * h / 2) +
        ' L ' + f1(x + uy * ww / 2 + ux * h / 2) + ' ' + f1(y - ux * ww / 2 + uy * h / 2) + ' Q ' + f1(x + ux * h * .3) + ' ' + f1(y + uy * h * .3) + ' ' + f1(x - uy * ww / 2 + ux * h / 2) + ' ' + f1(y + ux * ww / 2 + uy * h / 2) + ' Z';
      art += piv('ann' + i, f1(x), f1(y), plaque(ch, '#7d8693', null, null, [x, y, ww / 2, h / 2], 60 + i, 'ann' + i + 'p') + rivet(f1(x + uy * ww * .18), f1(y - ux * ww * .18), 2.4) +
        L('M' + f1(x + uy * ww / 2 - ux * h / 2) + ' ' + f1(y - ux * ww / 2 - uy * h / 2) + ' l ' + f1(ux * h) + ' ' + f1(uy * h), LUNE, 2, ' opacity=".8"'));
    }
    queue = piv('q' + i, a[0], a[1], queue + art);
  }

  /* ---- la patte arrière au loin ---- */
  var piedFD = 'M424 376 C 408 388 380 392 366 390 C 360 386 372 380 390 378 Z', cuF = tube([[410, 320], [432, 352], [420, 380]], [44, 30, 20]);
  var cuisseF = piv('cuisseF', 414, 324, P(cuF.d, D.g(sombre(poil, .45))) + gel(cuF.d) + piv('piedF', 420, 378, P(piedFD, D.g(sombre(rose, .35))) + gel(piedFD)));

  /* ---- la patte avant au loin : bras, avant-bras, main ---- */
  var bF1 = tube([[200, 296], [178, 336]], [44, 32]), bF2 = tube([[178, 336], [150, 364], [136, 378]], [32, 22, 18]);
  var mainFD = 'M146 374 C 130 384 112 390 100 388 C 98 382 110 378 128 374 Z';
  var brasF = piv('brasF', 200, 300, piv('avbrasF', 178, 336, P(bF2.d, D.g(sombre(poil, .45))) + gel(bF2.d) +
    piv('mainF', 140, 376, P(mainFD, D.g(sombre(rose, .35))) + L('M104 386 q -6 1 -8 6 M114 388 q -6 2 -7 7 M124 387 q -5 2 -6 7', O, 2.4) + gel(mainFD) + colleP(118, 388, 'MainF'))) + P(bF1.d, D.g(sombre(poil, .45))) + gel(bF1.d));

  /* ---- le corps : touffes, ventre, fourrure ; sous l'armure, la peau nue (le point faible) ---- */
  var corpsD = 'M168 300 C 158 250 186 192 246 160 C 296 132 384 116 444 160 C 486 192 498 262 478 312 C 460 354 404 370 332 370 C 262 370 194 354 168 300 Z';
  var basVentre = [[470, 318], [446, 344], [418, 358], [386, 366], [354, 369], [322, 370], [290, 368], [260, 364], [232, 356], [206, 342]];
  var dosC = [[246, 160], [296, 132], [384, 116], [444, 160]], dosC2 = [[444, 160], [486, 192], [498, 262], [478, 312]];
  function surDos(t){ var cc = t <= 1 ? dosC : dosC2, tt = t <= 1 ? t : t - 1, p = bez(cc, tt), v = bezD(cc, tt), l = Math.hypot(v[0], v[1]) || 1; return {p: p, n: [v[1] / l, -v[0] / l]}; }
  var corps = frange(basVentre, 13, D.g(sombre(poil, .2)), 4) + frange([[478, 230], [484, 262], [482, 292], [474, 318]], 12, D.g(poil), 6);
  /* la crête de poil du dos, qu'on ne voit que sans armure */
  var crete = [];
  for(var k = 0; k <= 16; k++){ var q = surDos(.2 + k / 16 * 1.45); crete.push([q.p[0] - q.n[0] * 4, q.p[1] - q.n[1] * 4]); }
  corps += variante('nuCrete', frange(crete, 14, D.g(sombre(poil, .1)), 71, .4), ' data-nu');
  corps += P(corpsD, D.g(poil));
  corps += F('M196 330 C 236 362 300 372 368 368 C 330 352 262 346 196 330 Z', ventre, ' opacity=".55"');
  corps += F(corpsD, D.rad([[0, '#000', 0], [.7, '#000', 0], [1, '#0e0814', .55]], .55, .42, .62));
  corps += F(corpsD, D.lin([[0, '#000', 0], [.62, '#000', 0], [1, '#0e0814', .45]], 0, 0, 0, 1));
  corps += '<g' + D.clip(corpsD) + '>' + poilsC(330, 300, 130, 58, 170, 17, '#c9b6c4', '#271b26', .34) + poilsC(372, 258, 70, 24, 44, 19, '#eadbe6', '#eadbe6', .28) + '</g>';
  corps += L('M472 214 C 490 248 492 290 478 316', LUNE, 2.6, ' opacity=".55"') + L('M474 232 C 484 256 486 280 480 300', '#ffffff', 7, ' opacity=".06"');
  corps += L('M392 300 C 404 316 410 330 408 346', '#d8b2bf', 2.6, ' opacity=".75"') + L('M396 310 l 8 -3 M402 322 l 8 -2 M405 334 l 8 0', '#d8b2bf', 1.4, ' opacity=".7"');
  /* la peau nue du dos, marquée par mille ans d'armure : le point faible */
  var peau = 'M372 168 C 392 150 430 148 452 166 C 466 180 462 202 444 212 C 418 222 384 218 368 202 C 360 192 362 178 372 168 Z';
  corps += P(peau, D.g('#b88290'), ' stroke-width="2.2"') + L('M384 176 C 400 168 424 168 440 178 M380 196 C 398 204 424 204 444 194', '#7a3a4c', 1.6, ' opacity=".7"') +
    L('M392 168 l -3 8 M402 166 l -2 8 M412 166 l -1 8 M422 167 l 0 8 M432 170 l 1 8', '#5a2a36', 1.2, ' opacity=".7"') + L('M380 170 C 400 158 430 158 448 170', '#ffe0e8', 1.6, ' opacity=".55"');
  corps += variante('nuMarques', L(lisse(lelong([[262, 168], [300, 146], [350, 132], [400, 134], [440, 156]], 6)), '#a8949e', 3, ' opacity=".5"') + L('M268 196 C 300 176 340 166 372 168 M454 214 C 470 240 474 270 468 296', '#a8949e', 2.4, ' opacity=".45"') , ' data-nu');
  /* les touffes qui sortent de sous les plaques, et les coulures de rouille */
  var bandes = [[1.36, 1.68], [1.08, 1.4], [.82, 1.12], [.56, .86], [.32, .6]], lesBas = [], plaques = [];
  bandes.forEach(function(bd, j){
    var haut = [], bas = [], prof = 78 - j * 2;
    for(var k = 0; k <= 6; k++){ var t = bd[0] + (bd[1] - bd[0]) * k / 6, q = surDos(t), f = (1 - Math.pow(k / 6 - .5, 2) * .5); haut.push([q.p[0] + q.n[0] * 9, q.p[1] + q.n[1] * 9]); bas.push([q.p[0] - q.n[0] * prof * f, q.p[1] - q.n[1] * prof * f]); }
    lesBas.push(bas);
    plaques.push({haut: haut, bas: bas, ch: lisse(haut) + ' L' + lisse(bas.slice().reverse()).slice(1) + ' Z'});
    corps += frange(bas.slice().reverse().map(function(p, i){ return [p[0] + (i % 2) * 2, p[1] - 3]; }), 9, D.g(clair(poil, .04)), 30 + j, .3);
  });
  function coulure(x, y, lg, lar, seed){
    var R = rng(seed), w = lar || 3, x2 = x + (R() - .5) * 6, ch = 'M' + f1(x - w) + ' ' + f1(y) + ' C ' + f1(x - w * .8) + ' ' + f1(y + lg * .4) + ' ' + f1(x2 - 1.2) + ' ' + f1(y + lg * .7) + ' ' + f1(x2 - 1) + ' ' + f1(y + lg) +
      ' C ' + f1(x2 + 1) + ' ' + f1(y + lg + 2) + ' ' + f1(x2 + 1.4) + ' ' + f1(y + lg * .6) + ' ' + f1(x + w * .4) + ' ' + f1(y + lg * .35) + ' C ' + f1(x + w) + ' ' + f1(y + lg * .2) + ' ' + f1(x + w * 1.2) + ' ' + f1(y + 4) + ' ' + f1(x + w * 1.4) + ' ' + f1(y) + ' Z';
    return F(ch, '#9a4a24', ' opacity=".85"') + L('M' + f1(x - w * .3) + ' ' + f1(y + 2) + ' C ' + f1(x - w * .2) + ' ' + f1(y + lg * .4) + ' ' + f1(x2 - .5) + ' ' + f1(y + lg * .7) + ' ' + f1(x2) + ' ' + f1(y + lg * .9), '#d88a48', 1, ' opacity=".6"') +
      C(f1(x2), f1(y + lg + 3.5), w * .8, '#7e3a1c') + C(f1(x2 + .6), f1(y + lg + 2.6), w * .3, '#f0b070', ' opacity=".7"');
  }
  [[4, 2, 22, 3], [3, 4, 30, 3], [2, 1, 14, 2.2], [2, 4, 24, 2.6], [1, 3, 18, 2.4], [0, 4, 12, 2]].forEach(function(c, m){ var p = lesBas[c[0]][c[1]]; corps += coulure(p[0], p[1] - 2, c[2], c[3], m + 1); });
  corps += gel(corpsD, D.cristaux(300, 150, -100, 3, 16, 30, 3) + D.cristaux(400, 128, -80, 3, 18, 30, 5) + D.cristaux(470, 200, -20, 2, 14, 10, 7));
  corps += variante('suie', '<ellipse cx="360" cy="170" rx="110" ry="34" fill="#140c10" opacity=".35"/>');
  corps += repere('centre', 330, 272) + repere('pfDos', 412, 186) + repere('pfVentre', 300, 352) + repere('dos', 0, 0);

  /* ---- la sangle de cuir et sa boucle (elle tient l'armure) ---- */
  var sangleD = 'M306 236 C 314 280 320 320 318 366 L 344 368 C 346 320 340 278 332 234 Z', boucleD = 'M307 306 Q 324 300 341 302 L 343 330 Q 326 336 310 334 Z';
  var sangle = piv('sangle', 326, 300, P(sangleD, D.g('#6a4028')) + L('M311 244 C 318 284 322 324 321 362 M327 240 C 335 282 340 322 340 362', '#c99a6a', 1.2, ' stroke-dasharray="3 4" opacity=".7"') +
    F('M312 312 L 338 309 L 339 328 L 314 330 Z', '#3a2216', ' opacity=".7"') + L(boucleD, O, 8.5) + L(boucleD, D.g('#c9a35a'), 4) + L('M309 307 Q 325 301 340 303', '#fff1c0', 1.4, ' opacity=".7"') +
    L('M311 320 L 337 316', O, 4.6) + L('M311 320 L 337 316', '#e8c88a', 2.2) + C(311, 320, 2.6, '#c9a35a', ' stroke="' + O + '" stroke-width="1.6"') + gel(sangleD));

  /* ---- les plaques du dos, comme des écailles de fer rivetées ---- */
  var plq = '';
  plaques.forEach(function(pq, j){
    var haut = pq.haut, bas = pq.bas, ch = pq.ch, cx = (haut[3][0] + bas[3][0]) / 2, cy = (haut[3][1] + bas[3][1]) / 2;
    var z = [cx, cy, Math.hypot(haut[6][0] - haut[0][0], haut[6][1] - haut[0][1]) / 2, (78 - j * 2) / 2];
    var s = F(ch, '#0c0612', ' opacity=".28" transform="translate(-3 7)"') + F(ch, '#0c0612', ' opacity=".2" transform="translate(-2 4)"');
    s += plaque(ch, j % 2 ? '#646d7b' : fer, lisse(haut.slice(1, 6)), lisse(bas), z, 30 + j, 'plq' + j + 'p');
    var av = bas[6], ah = haut[6], ar = bas[0], arh = haut[0];
    s += L('M' + pt([ah[0] + (av[0] - ah[0]) * .08, ah[1] + (av[1] - ah[1]) * .08]) + ' L ' + pt([ah[0] + (av[0] - ah[0]) * .92, ah[1] + (av[1] - ah[1]) * .92]), '#c3ccd6', 1.6, ' opacity=".5" transform="translate(-6 1)"');
    for(var r = 1; r <= 3; r++){ var tt = r / 4; s += rivet(f1(ah[0] + (av[0] - ah[0]) * tt - 7), f1(ah[1] + (av[1] - ah[1]) * tt), 3.6); }
    for(var r2 = 1; r2 <= 2; r2++){ var t2 = r2 / 3; s += rivet(f1(arh[0] + (ar[0] - arh[0]) * t2 + 7), f1(arh[1] + (ar[1] - arh[1]) * t2), 3); }
    var mi = bas[3], mh = haut[3];
    s += L('M' + pt([mh[0] + (mi[0] - mh[0]) * .3 - 6, mh[1] + (mi[1] - mh[1]) * .3]) + ' l 14 6 M' + pt([mh[0] + (mi[0] - mh[0]) * .55 - 2, mh[1] + (mi[1] - mh[1]) * .55]) + ' l 9 -2', '#dfe8f0', 1.2, ' opacity=".45"');
    s += variante('plq' + j + '_cab', F('M' + f1(cx - 8) + ' ' + f1(cy - 2) + ' C ' + f1(cx - 4) + ' ' + f1(cy - 9) + ' ' + f1(cx + 6) + ' ' + f1(cy - 8) + ' ' + f1(cx + 8) + ' ' + f1(cy) + ' C ' + f1(cx + 2) + ' ' + f1(cy + 5) + ' ' + f1(cx - 4) + ' ' + f1(cy + 4) + ' ' + f1(cx - 8) + ' ' + f1(cy - 2) + ' Z', '#1d1a26', ' opacity=".6"') + L('M' + f1(cx + 4) + ' ' + f1(cy - 8) + ' C ' + f1(cx + 9) + ' ' + f1(cy - 5) + ' ' + f1(cx + 9) + ' ' + f1(cy) + ' ' + f1(cx + 6) + ' ' + f1(cy + 3), '#e6eef6', 1.6, ' opacity=".8"') );
    plq += piv('plq' + j, f1(cx), f1(cy), s + repere('plq' + j + 'C', f1(cx), f1(cy)));
  });

  /* ---- les lueurs du point faible ouvert (cachées) : la peau du dos, ou le ventre ---- */
  var lumPF = D.doux('#fff4b0', .95), lumPF2 = D.doux('#ffd040', .8);
  function lueurPF(nom, cle, x, y, rx, ry, rot){
    var sc = '';
    for(var i = 0; i < 5; i++){ var a = i / 5 * Math.PI * 2 + .4; sc += '<g transform="translate(' + f1(x + Math.cos(a) * rx * .9) + ' ' + f1(y + Math.sin(a) * ry * .9) + ')"><path d="' + eclatD(8) + '" fill="#ffffff"/></g>'; }
    return variante(nom, '<g transform="rotate(' + rot + ' ' + x + ' ' + y + ')"><ellipse cx="' + x + '" cy="' + y + '" rx="' + rx * 1.5 + '" ry="' + ry * 1.5 + '" fill="' + lumPF2 + '"/>' +
      '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="' + lumPF + '"/>' + '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx * .8 + '" ry="' + ry * .8 + '" fill="none" stroke="#fff8d0" stroke-width="3" stroke-dasharray="6 7"/></g>' + sc, ' data-pf="' + cle + '"', x, y);
  }
  var pf = lueurPF('pfDosL', 'dos', 412, 186, 52, 30, 22) + lueurPF('pfVentreL', 'ventre', 300, 350, 78, 28, -4);

  /* ---- la patte arrière proche : la cuisse, sa cuissarde, le long pied ---- */
  var cuisseD = 'M352 286 C 380 248 446 252 468 300 C 482 334 462 372 420 380 C 392 384 366 374 356 352 C 344 330 342 304 352 286 Z';
  var hancheD = 'M382 270 C 410 254 448 262 462 290 C 446 300 420 306 392 302 C 380 292 378 280 382 270 Z';
  var piedD = 'M402 366 C 398 384 370 392 334 393 C 316 394 312 384 324 380 C 346 376 374 372 402 366 Z';
  var pied = P(piedD, D.g(rose)) + [[318, 390], [326, 393], [335, 394]].map(function(t){ return '<ellipse cx="' + t[0] + '" cy="' + t[1] + '" rx="6" ry="4" fill="' + D.g(rose) + '" stroke="' + O + '" stroke-width="2.4"/>' + P('M' + (t[0] - 5) + ' ' + (t[1] - 1) + ' q -7 0 -11 7 q 6 -3 10 -3 Z', '#2a2230', ' stroke-width="1.6"'); }).join('') +
    L('M340 384 C 360 382 380 378 396 372', '#ffd6de', 1.6, ' opacity=".6"') + gel(piedD) + colleP(344, 392, 'Pied', 1.1);
  var cuisse = piv('cuisse', 418, 316, F(cuisseD, '#0c0612', ' opacity=".3" transform="translate(-6 6)"') + frange([[362, 360], [378, 374], [398, 380], [420, 380]], 9, D.g(poil), 21) + P(cuisseD, D.g(clair(poil, .05))) +
    '<g' + D.clip(cuisseD) + '>' + poilsC(410, 322, 46, 40, 40, 23, '#c9b6c4', '#271b26', .3) + '</g>' + L('M360 280 C 388 254 440 258 462 292', LUNE, 2.2, ' opacity=".5"') + gel(cuisseD, D.cristaux(440, 272, -40, 2, 12, 10, 11)) +
    piv('cuissarde', 422, 284, plaque(hancheD, '#5e6775', 'M388 266 C 414 254 446 262 458 284', null, [420, 282, 36, 16], 81, 'cuissardeP') + rivet(396, 284, 3.4) + rivet(446, 286, 3.4) +
      F('M414 276 C 420 272 428 274 430 280 C 424 284 418 283 414 276 Z', '#1d1a26', ' opacity=".5"') + L('M428 276 C 432 279 432 283 430 285', '#dfe8f0', 1.4, ' opacity=".6"')) +
    piv('pied', 402, 370, pied + repere('orteils', 330, 390)));

  /* ---- la gorgerette, et un bout de chaîne cassée qui pend ---- */
  var gorgeD = 'M214 216 C 238 206 260 222 266 250 C 272 280 264 312 246 334 L 222 328 C 238 304 244 278 238 254 C 234 238 226 228 206 226 Z';
  var chaine = '';
  [[214, 324, 14, 1], [210, 338, -12, 0], [213, 352, 10, 1], [209, 365, -16, 0]].forEach(function(m){
    var e = '<ellipse cx="' + m[0] + '" cy="' + m[1] + '" rx="' + (m[3] ? 5.5 : 2.6) + '" ry="8.5" transform="rotate(' + m[2] + ' ' + m[0] + ' ' + m[1] + ')" fill="none" stroke="';
    chaine += e + O + '" stroke-width="6.4"/>' + e + '#7a828e" stroke-width="3"/>' + L('M' + (m[0] + 3) + ' ' + (m[1] - 6) + ' q 2.5 3 1.5 7', '#dfe8f0', 1.2, ' opacity=".75"') + L('M' + (m[0] - 4) + ' ' + (m[1] + 2) + ' q 1 4 4 6', '#a4512a', 1.6, ' opacity=".8"');
  });
  var gorge = piv('gorge', 244, 272, plaque(gorgeD, '#5e6775', 'M218 214 C 240 208 258 222 264 246', 'M222 328 C 238 304 244 278 238 254', [244, 272, 18, 56], 41, 'gorgeP') +
    [[226, 222], [248, 252], [252, 286], [240, 318]].map(function(r){ return rivet(r[0], r[1], 3.2); }).join('') + piv('chaine', 216, 318, chaine));

  /* ---- la patte avant proche : bras puissant, avant-bras, gros doigts, griffes noires ---- */
  var t1 = tube([[262, 274], [281, 332]], [64, 52]), t2 = tube([[281, 330], [248, 360], [216, 378]], [52, 36, 28]);
  var mainD = 'M228 368 C 220 386 190 392 166 389 C 160 381 176 372 200 368 Z';
  var main = P(mainD, D.g(rose), ' stroke-width="2.6"');
  [[160, 386, -8], [171, 390, 0], [183, 391, 6], [195, 389, 12]].forEach(function(t){
    main += '<ellipse cx="' + t[0] + '" cy="' + t[1] + '" rx="7" ry="4.6" fill="' + D.g(rose) + '" stroke="' + O + '" stroke-width="2.4"/>';
    main += P('M' + (t[0] - 6) + ' ' + (t[1] - 2) + ' C ' + (t[0] - 13) + ' ' + (t[1] - 1) + ' ' + (t[0] - 17) + ' ' + (t[1] + 3) + ' ' + (t[0] - 18) + ' ' + (t[1] + 9) + ' C ' + (t[0] - 13) + ' ' + (t[1] + 5) + ' ' + (t[0] - 9) + ' ' + (t[1] + 3) + ' ' + (t[0] - 4) + ' ' + (t[1] + 3) + ' Z', '#231a29', ' stroke-width="1.6"');
    main += L('M' + (t[0] - 12) + ' ' + t[1] + ' q -3 2 -4 5', '#9a90a8', 1, ' opacity=".7"');
  });
  main += gel(mainD) + colleP(182, 390, 'Main') + repere('main', 180, 388);
  var avbras = frange([[262, 352], [278, 350], [294, 340], [302, 326]], 12, D.g(clair(poil, .06)), 44, .2) + P(t2.d, D.g(clair(poil, .1))) +
    '<g' + D.clip(t2.d) + '>' + poilsC(256, 346, 20, 16, 14, 41, '#d6c4d2', '#271b26', .34) + F('M232 352 C 246 340 262 336 278 338 C 266 346 252 354 236 362 Z', '#1a1220', ' opacity=".35"') + '</g>' +
    L('M258 338 C 268 346 270 356 262 364', '#1a1220', 1.8, ' opacity=".5"') + L(lisse(t2.dr.slice(0, 3)), LUNE, 2.2, ' opacity=".5"') + gel(t2.d);
  var bras = piv('bras', 262, 284, F(t1.d, '#0c0612', ' opacity=".3" transform="translate(-5 4)"') + piv('avbras', 281, 332, avbras + piv('main', 222, 372, main)) +
    P(t1.d, D.g(clair(poil, .1))) + '<g' + D.clip(t1.d) + '>' + poilsC(270, 316, 18, 16, 12, 43, '#d6c4d2', '#271b26', .34) + '</g>' + gel(t1.d));

  /* ---- l'épaulière : trois lames de fer superposées ---- */
  var ep3D = 'M204 300 C 236 286 296 284 330 300 C 334 312 330 322 322 328 C 290 314 238 314 210 324 C 202 318 200 308 204 300 Z';
  var ep2D = 'M200 276 C 236 258 304 258 338 278 C 342 292 338 304 330 310 C 296 294 236 294 204 306 C 196 298 194 286 200 276 Z';
  var ep1D = 'M196 256 C 200 208 240 180 288 184 C 330 188 352 220 346 264 C 340 274 336 282 330 286 C 300 268 236 268 202 286 C 194 278 192 266 196 256 Z';
  var roue = '';
  for(var k5 = 0; k5 < 10; k5++){ var a0 = k5 / 10 * Math.PI * 2, a1 = a0 + .2, a2 = a0 + .42, a3 = a0 + .628;
    roue += (k5 ? ' L ' : 'M') + f1(Math.cos(a0) * 13) + ' ' + f1(Math.sin(a0) * 13) + ' L ' + f1(Math.cos(a1) * 17) + ' ' + f1(Math.sin(a1) * 17) + ' L ' + f1(Math.cos(a2) * 17) + ' ' + f1(Math.sin(a2) * 17) + ' L ' + f1(Math.cos(a3) * 13) + ' ' + f1(Math.sin(a3) * 13); }
  roue += ' Z M-6 0 Q 0 -6 6 0 Q 0 6 -6 0 Z';
  var ep3 = piv('ep3', 268, 308, F(ep1D, '#0c0612', ' opacity=".3" transform="translate(-5 30)"') + plaque(ep3D, '#5a6371', 'M208 300 C 240 288 296 286 328 302', 'M322 328 C 290 314 238 314 210 324', [268, 308, 62, 14], 51, 'ep3p') +
    [[214, 314], [240, 306], [270, 304], [300, 306], [322, 316]].map(function(r){ return rivet(r[0], r[1], 3); }).join('') +
    F('M292 316 C 292 324 294 330 295 334 C 297 330 298 322 297 316 Z', '#a4512a', ' opacity=".85"') + C(295, 336, 2.2, '#8a3e1e'));
  var ep2 = piv('ep2', 268, 288, plaque(ep2D, '#626b79', 'M204 278 C 238 262 302 262 334 280', 'M330 310 C 296 294 236 294 204 306', [268, 288, 66, 16], 52, 'ep2p') +
    [[210, 292], [238, 282], [270, 279], [302, 282], [330, 292]].map(function(r){ return rivet(r[0], r[1], 3.4); }).join(''));
  var ep1 = piv('ep1', 270, 236, plaque(ep1D, fer, 'M204 236 C 214 204 248 186 288 188 C 322 192 342 214 344 246', 'M330 286 C 300 268 236 268 202 286', [272, 234, 70, 44], 53, 'ep1p') +
    '<ellipse cx="300" cy="212" rx="34" ry="16" transform="rotate(28 300 212)" fill="' + blanc + '" opacity=".5"/>' +
    L('M206 272 C 240 256 300 254 334 270', '#cfd8e2', 1.6, ' opacity=".55"') + F('M262 218 C 274 210 290 214 292 226 C 282 232 268 230 262 218 Z', '#1d1a26', ' opacity=".45"') + L('M288 214 C 294 218 296 224 292 230', '#e6eef6', 1.6, ' opacity=".7"') +
    L('M226 248 l 18 -10 M232 254 l 12 -6 M300 236 l 16 6', '#e6eef6', 1.2, ' opacity=".5"') + L('M236 210 C 242 230 246 246 244 262', '#2a2234', 1.6, ' opacity=".5"') +
    '<g transform="translate(294 238) rotate(-8) scale(1 .86)">' + L(roue, '#1a1222', 2.4, ' opacity=".55"') + L(roue, '#e6eef6', .9, ' opacity=".4" transform="translate(.8 -.8)"') + C(0, 0, 2, '#1a1222', ' opacity=".6"') + '</g>' +
    variante('ep1_cab', F('M232 232 C 238 224 250 224 254 232 C 248 240 238 240 232 232 Z', '#1d1a26', ' opacity=".6"') + L('M250 224 C 256 228 257 234 254 238', '#e6eef6', 1.6, ' opacity=".8"')) + repere('ep1C', 262, 236));

  /* ---- la tête : mâchoire (derrière), joues hérissées, rictus ---- */
  var teteD = 'M238 238 C 216 204 176 196 146 206 C 114 218 84 248 58 276 C 46 290 46 302 60 306 C 94 316 134 326 172 324 C 214 322 244 298 248 270 C 249 256 246 246 238 238 Z';
  var email = D.lin([[0, '#f6d27a'], [.6, '#e0a24a'], [1, '#a8652a']], 0, 0, 1, 1);
  var machD = 'M70 318 C 86 344 118 360 154 354 C 172 350 182 340 180 330 C 176 340 160 346 140 346 C 110 346 88 336 70 318 Z';
  var bave = P('M152 344 C 153 356 149 366 151 376 C 153 380 158 380 158 375 C 158 366 156 356 157 344 Z', '#d8f0ff', ' stroke-width="1.6" opacity=".85"') + C(154.5, 373, 1.2, '#fff') + repere('baveBout', 154.5, 377);
  var machoire = F('M56 200 L 190 290 L 186 336 C 170 346 140 352 118 350 C 96 348 80 338 70 322 L 60 306 Z', D.rad([[0, '#5a1a36'], [.6, '#3a0f22'], [1, '#14040c']], .3, .4, .9)) +
    F('M88 322 C 110 338 140 342 162 334 C 140 330 112 328 88 322 Z', '#b8546e') + L('M96 326 C 116 334 138 336 156 332', '#e08aa0', 1, ' opacity=".6"') +
    P(machD, D.g(poil)) + P('M80 340 C 78 332 78 324 80 316 L 88 316 C 86 324 86 332 88 340 Z', email, ' stroke-width="2.2"') + L('M83 320 L 83 336', '#fff2c0', 1.2, ' opacity=".6"') +
    P('M101 340 L 104 332 L 108 341 Z M120 343 L 123 335 L 127 343 Z', '#efe2b0', ' stroke-width="1.6"') + gel(machD) + piv('bave', 154, 345, bave);
  var sousLevre = D.clip('M56 260 L 56 302 L 60 306 C 94 316 134 326 172 324 C 204 323 232 308 252 286 L 262 480 L 56 480 Z');
  var tete = '<g' + sousLevre + '>' + piv('machoire', 178, 328, machoire) + '</g>';
  tete += frange([[100, 252], [124, 226], [150, 210], [178, 202], [206, 206], [232, 226]], 10, D.g(poil), 61, .4);
  tete += frange([[247, 276], [242, 294], [230, 308], [214, 318], [196, 323], [178, 325]], 9, D.g(clair(poil, .08)), 52, .5);
  tete += P(teteD, D.g(poil)) + '<g' + D.clip(teteD) + '>' + poilsC(190, 280, 42, 26, 40, 29, '#c9b6c4', '#271b26', .32) + '</g>';
  tete += L('M90 290 q 7 5 5 13 M101 292 q 7 6 4 14 M112 296 q 6 5 3 12', '#1a1220', 1.8, ' opacity=".55"') + L('M93 288 q 7 5 5 12 M104 290 q 7 6 4 13', '#c9b6c4', 1.2, ' opacity=".35"');
  tete += F('M60 300 C 96 310 130 316 166 316 C 130 322 92 316 60 300 Z', ventre, ' opacity=".5"');
  tete += L('M170 292 C 182 300 198 304 216 300', '#3a2632', 5, ' opacity=".5"') + L('M170 292 C 182 300 198 304 216 300', '#caa0b0', 2.4, ' opacity=".85"') + L('M178 294 C 186 298 194 300 202 300', '#f0d0da', 1, ' opacity=".7"');
  /* la trace du casque dans le poil (on la voit quand il l'a perdu) et la bosse (cachée) */
  tete += L('M100 252 C 140 240 200 240 244 254', '#8a7a88', 2.2, ' opacity=".55"') + L('M118 236 C 140 222 172 214 200 218', '#a8949e', 1.6, ' opacity=".4"');
  tete += piv('bosse', 168, 206, P('M150 210 C 150 194 158 184 168 184 C 180 184 188 194 188 210 Z', D.g('#d87a8a')) + C(174, 192, 3.4, '#ffe0e8', ' opacity=".85"') + L('M156 206 C 160 198 164 194 168 192', '#ffd0dc', 1.4, ' opacity=".6"') , 0);
  tete += gel(teteD, D.cristaux(150, 206, -100, 3, 14, 40, 9));
  /* les dents du haut, les grandes incisives orangées (l'une ébréchée) */
  tete += P('M96 314 L 100 324 L 104 314 Z M112 318 L 116 328 L 120 318 Z M130 320 L 134 329 L 138 321 Z M148 321 L 151 329 L 155 321 Z', '#efe2b0', ' stroke-width="1.6"');
  tete += P('M67 293 C 68 304 70 314 73 324 L 79 322 C 77 312 76 303 75 294 Z', D.lin([[0, '#c98a3a'], [1, '#8a5222']], 0, 0, 1, 1), ' stroke-width="2.2"');
  tete += P('M57 291 C 58 304 60 316 63 328 L 67 327 L 69 330 L 71 325 C 69 313 67 302 66 292 Z', email, ' stroke-width="2.4"') + L('M60 296 C 61 307 62 316 64 324', '#fff4c8', 1.4, ' opacity=".8"') + L('M61 311 l 6 -1', '#8a5222', 1.1, ' opacity=".6"');
  /* le museau, les moustaches (certaines cassées) */
  tete += piv('nez', 54, 286, '<ellipse cx="54" cy="286" rx="11" ry="9" fill="' + D.g(rose) + '" stroke="' + O + '" stroke-width="3"/>' + F('M48 288 c 2 -3 6 -3 7 0 c -2 2 -5 2 -7 0 Z', '#4a1222') + C(57, 281, 2.6, '#fff', ' opacity=".75"') + repere('narine', 48, 290));
  tete += [[74, 290], [82, 294], [90, 292], [80, 286], [88, 300]].map(function(p){ return C(p[0], p[1], 1.6, '#2a1a26'); }).join('');
  tete += piv('moustaches', 82, 292, L('M78 290 C 54 276 30 268 6 266 M80 294 C 56 294 34 298 12 306 M86 298 C 70 306 56 314 44 322 M90 288 C 76 270 64 260 50 252', '#e8e0ec', 1.4, ' opacity=".85"'));
  tete += piv('sourcil', 150, 250, P('M120 258 C 134 242 160 238 182 246 L 178 254 C 160 248 140 250 124 262 Z', D.g(sombre(poil, .4)), ' stroke-width="2.4"'));
  /* le casque cabossé : la coque (derrière l'oreille), puis l'avant (visière, nasal, runes) */
  var casqueD = 'M96 250 C 98 214 128 186 170 180 C 210 176 238 196 246 228 C 248 238 246 248 242 254 C 196 240 140 240 96 250 Z';
  var creteC = 'M120 204 C 140 184 176 172 214 182 C 228 188 236 196 240 206 C 232 202 218 194 200 192 C 172 190 142 196 120 204 Z';
  tete += piv('casque', 172, 232, F(casqueD, '#0c0612', ' opacity=".35" transform="translate(-4 8)"') + plaque(casqueD, '#727b89', 'M104 228 C 116 200 142 186 172 184 C 204 182 232 198 242 226', null, [172, 218, 70, 32], 91, 'casqueP1') +
    plaque(creteC, '#8a93a0', null, null, [180, 192, 56, 10], 92, 'casqueP2') + P('M194 200 L 200 188 L 208 192 L 214 184 L 222 190 L 230 186 L 234 198 L 228 208 L 212 210 L 200 208 Z', '#140c1a', ' stroke-width="2.4"') + repere('casqueHaut', 168, 184));
  var oreilleD = 'M200 204 C 186 172 192 136 218 126 L 226 124 L 230 134 L 236 122 C 256 122 270 146 262 170 L 252 172 L 258 180 C 250 198 234 208 212 208 Z';
  tete += piv('oreille', 214, 204, '<g transform="rotate(34 214 204)">' + P(oreilleD, D.g(poil)) + F('M206 198 C 198 174 204 148 222 140 C 242 136 254 152 250 170 C 244 190 228 198 206 198 Z', D.halo('#f0aabb', '#b8607a')) +
    L('M220 194 C 224 176 228 162 234 152 M226 174 C 234 170 240 170 246 174', '#9a4660', 1.4, ' opacity=".7"') + L('M204 140 C 210 128 220 124 226 124 M238 122 C 254 124 266 140 264 160', LUNE, 2.2, ' opacity=".6"') + gel(oreilleD) + '</g>');
  var bordD = 'M92 252 C 140 238 200 238 246 254 L 244 266 C 200 252 142 252 96 264 Z', nasalD = 'M104 250 L 122 252 C 112 268 98 282 84 292 C 80 290 80 286 82 282 C 92 274 100 262 104 250 Z';
  tete += piv('casqueAv', 172, 232, P('M192 204 L 197 194 L 203 198 L 206 190 L 212 196 L 206 210 L 196 210 Z', D.g('#8a93a0'), ' stroke-width="2.2"') + L('M194 202 L 198 195 L 203 199', '#e6eef6', 1.2, ' opacity=".8"') +
    plaque(bordD, '#5a6371', 'M94 252 C 140 240 200 240 244 254', 'M244 266 C 200 252 142 252 96 264', [170, 252, 74, 7], 93, 'casqueAvP1') +
    '<ellipse cx="206" cy="196" rx="28" ry="12" transform="rotate(20 206 196)" fill="' + blanc + '" opacity=".45"/>' +
    plaque(nasalD, '#6c7584', 'M110 252 C 104 266 94 278 84 286', null, [100, 268, 10, 20], 94, 'casqueAvP2') +
    [[112, 258], [140, 252], [170, 249], [200, 250], [228, 256]].map(function(r){ return rivet(r[0], r[1], 3); }).join('') +
    F('M160 206 C 172 200 186 204 188 214 C 178 220 166 218 160 206 Z', '#1d1a26', ' opacity=".5"') + L('M184 202 C 190 206 192 212 188 218', '#e6eef6', 1.6, ' opacity=".7"') +
    F('M118 230 C 126 226 134 228 136 234 C 130 238 122 237 118 230 Z', '#1d1a26', ' opacity=".5"') + L('M132 226 C 137 229 138 233 136 236', '#e6eef6', 1.4, ' opacity=".7"') +
    L('M222 214 L 214 224 L 218 230 L 210 240', '#1a1222', 1.8) +
    '<ellipse cx="174" cy="222" rx="66" ry="24" fill="' + cyan + '" opacity=".5"/>' + rune(0, 134, 220, -18, .8) + rune(3, 154, 212, -10, .7) + rune(1, 172, 226, -4, .8) + rune(4, 194, 222, 6, .75) + rune(2, 214, 232, 14, .7));
  /* l'œil rouge sous la visière : halo, iris, pupille fendue, paupière ; la spirale du tournis (cachée) */
  var ge = D.rad([[0, '#fff2a0'], [.45, '#ff4a2a'], [1, '#7a0a14']], .45, .45, .6), irisD = 'M132 274 C 140 266 158 266 166 272 C 160 282 142 284 132 274 Z';
  var spirale = 'M149 275 C 149 273 152 273 152 275 C 152 278 147 279 146 276 C 144 272 150 269 154 272 C 158 276 154 282 148 281';
  tete += piv('oeil', 148, 276, '<circle cx="146" cy="276" r="30" fill="' + D.halo('#ffb0a0', '#ff2a2a') + '" opacity=".75"/>' +
    variante('oeilRage', '<circle cx="146" cy="276" r="40" fill="' + D.halo('#ffe0a0', '#ff2a10') + '"/>', '', 146, 276) +
    F('M126 268 C 140 262 162 262 172 268 C 166 282 142 288 126 278 Z', '#1a0a14') + P(irisD, ge, ' stroke-width="2.6"') +
    variante('pupille', F('M148 268 C 151 271 151 279 148 282 C 145 279 145 271 148 268 Z', '#2a0408'), '', null, null, 1) + variante('spirale', L(spirale, '#2a0408', 1.8)) +
    C(142, 272, 2.6, '#fff') + C(158, 276, 1.2, '#fff', ' opacity=".7"') +
    '<g' + D.clip(irisD) + '>' + piv('paupiere', 149, 262, F('M124 232 L 174 232 L 174 262 C 160 258 140 258 126 266 Z', D.g(sombre(poil, .1))) + L('M126 266 C 140 258 160 258 174 262', O, 2.4)) + '</g>' +
    variante('visiere', F('M126 266 C 146 260 166 260 176 266 L 172 270 C 160 266 144 266 130 272 Z', '#0c0612', ' opacity=".6"'), '', null, null, 1) + repere('oeilC', 148, 275));
  var patteYeux = tube([[214, 330], [184, 304], [160, 286]], [30, 24, 20]).d, paume = 'M168 300 C 146 300 128 288 124 272 C 122 262 132 258 140 262 C 150 268 160 276 172 280 Z';
  var doigtsY = '';
  [[128, 262, -2.4], [136, 256, -2.1], [146, 254, -1.8], [156, 258, -1.5]].forEach(function(d){ var ca = Math.cos(d[2]), sa = Math.sin(d[2]), b = [d[0], d[1]], t = [d[0] + ca * 14, d[1] + sa * 14];
    doigtsY += P(tube([b, t], [8, 6.4]).d, D.g(rose), ' stroke-width="2"') + P('M' + f1(t[0] - 3) + ' ' + f1(t[1]) + ' Q ' + f1(t[0] + ca * 8 - sa * 3) + ' ' + f1(t[1] + sa * 8 + ca * 3) + ' ' + f1(t[0] + ca * 11 + sa * 2) + ' ' + f1(t[1] + sa * 11 - ca * 2) + ' Q ' + f1(t[0] + ca * 4) + ' ' + f1(t[1] + sa * 4) + ' ' + f1(t[0] + 3) + ' ' + f1(t[1]) + ' Z', '#231a29', ' stroke-width="1.4"'); });
  tete += variante('patteYeux', P(patteYeux, D.g(clair(poil, .1))) + '<g' + D.clip(patteYeux) + '>' + '</g>' + doigtsY + P(paume, D.g(rose), ' stroke-width="2.6"') + L('M132 270 C 144 278 156 284 168 288', '#ffd6de', 1.4, ' opacity=".6"') , '', 190, 310);
  tete += etoilesDessin(D, 'etoiles', 160, 178, 84, 5, 15) + repere('tete', 160, 250) + repere('bouche', 92, 326) + repere('frappe', 112, 236);
  var teteP = piv('tete', 240, 264, tete);

  /* ---- l'assemblage : la queue et les pattes du fond, le corps et son armure, la cuisse, la gorgerette, le bras, l'épaulière, la tête ---- */
  return slot('fixeArr') + piv('pos', 300, SOL, piv('ombre', 290, 392, ombre) + variante('lueurRouge', '<ellipse cx="300" cy="380" rx="230" ry="40" fill="' + D.doux('#ff7a20', .55) + '"/>', '', 300, 380) +
    piv('saut', 300, SOL, piv('secousse', 300, 300, piv('posture', 300, 300, piv('corps', 330, 300,
      queue + cuisseF + brasF + piv('souffle', 330, 368, corps + sangle + plq + pf) + cuisse + gorge + bras + ep3 + ep2 + ep1 + teteP))))) +
    slot('monde') + slot('fixe');
}

/* =====================================================================
   B. Les poses
   ===================================================================== */
var POSES = {
  normal: {},
  /* ébloui : il se dresse sur ses pattes arrière, une patte sur les yeux, le ventre offert */
  ebloui: (function(){
    var p = {}, r = rotAutour(58, [392, 390], [300, 300]);
    p.posture = {a: r.a, x: r.x, y: r.y};
    p.cuisse = {a: -26}; p.pied = {a: -32}; p.cuisseF = {a: -28}; p.piedF = {a: -30};
    p.tete = {a: -34, x: 12, y: 8}; p.machoire = {a: -18}; p.oreille = {a: 24};
    p.bras = {a: 46, x: -4}; p.avbras = {a: 40}; p.main = {a: 30};
    p.brasF = {a: 96}; p.avbrasF = {a: -40}; p.mainF = {a: -30};
    p.q0 = {a: -40}; p.q1 = {a: -24}; p.q2 = {a: -14}; p.q3 = {a: -4}; p.q4 = {a: 4};
    p.chaine = {a: -50};
    return p;
  })(),
  /* sur le dos : retourné, le ventre en l'air, les pattes en haut */
  dos: (function(){
    var p = {}, r = rotAutour(172, [330, 300], [300, 300]);
    p.posture = {a: r.a, x: r.x, y: r.y + 22};
    p.tete = {a: 30, x: 4}; p.machoire = {a: -18};
    p.bras = {a: 40}; p.avbras = {a: 40}; p.brasF = {a: 20}; p.avbrasF = {a: 50};
    p.cuisse = {a: 30}; p.pied = {a: 20}; p.cuisseF = {a: 40}; p.piedF = {a: 20};
    p.q0 = {a: -50}; p.q1 = {a: -24}; p.q2 = {a: -10}; p.q3 = {a: 10};
    p.oreille = {a: -20}; p.chaine = {a: 150};
    return p;
  })()
};
/* le galop : quatre temps, lourd */
var COURSE = (function(){
  var e = {saut: {y: -14}, corps: {a: -3, sx: 1.04}, tete: {a: 7, y: -2}, bras: {a: 38}, avbras: {a: 10}, main: {a: 10}, brasF: {a: 30}, avbrasF: {a: -4}, mainF: {a: 0}, cuisse: {a: -34}, pied: {a: -22}, cuisseF: {a: -26}, piedF: {a: -16}, oreille: {a: 18}, chaine: {a: 22}};
  return [
    {t: 0, p: e},
    {t: .25, p: {saut: {y: -3}, corps: {a: 3, sx: 1}, tete: {a: 4, y: 0}, bras: {a: 12}, avbras: {a: -8}, main: {a: -4}, brasF: {a: 32}, avbrasF: {a: 6}, mainF: {a: 6}, cuisse: {a: -12}, pied: {a: -10}, cuisseF: {a: -26}, piedF: {a: -12}, chaine: {a: 6}}},
    {t: .5, p: {saut: {y: 0}, corps: {a: 4, sx: .96}, tete: {a: 1, y: -2}, bras: {a: -24}, avbras: {a: -16}, main: {a: -24}, brasF: {a: -4}, avbrasF: {a: -12}, mainF: {a: -16}, cuisse: {a: 24}, pied: {a: 12}, cuisseF: {a: 18}, piedF: {a: 10}, chaine: {a: -18}}},
    {t: .75, p: {saut: {y: -8}, corps: {a: -1, sx: 1}, tete: {a: 5, y: 0}, bras: {a: 6}, avbras: {a: -60}, main: {a: -30}, brasF: {a: -20}, avbrasF: {a: -36}, mainF: {a: -22}, cuisse: {a: -2}, pied: {a: -30}, cuisseF: {a: 10}, piedF: {a: -10}, chaine: {a: -4}}},
    {t: 1, p: e}
  ];
})();
var JAMBES0 = {bras: {a: 0}, avbras: {a: 0}, main: {a: 0}, brasF: {a: 0}, avbrasF: {a: 0}, mainF: {a: 0}, cuisse: {a: 0}, pied: {a: 0}, cuisseF: {a: 0}, piedF: {a: 0}};
function avec(a, b){ var o = copie(a); for(var k in b) o[k] = b[k]; return o; }

/* =====================================================================
   C. Le rat cuirassé : construction, attente, états propres
   ===================================================================== */
function RatCuir(conteneur, options){
  this._init(conteneur, options, '0 66 540 368', dessinerRatcuir);
  this.solY = SOL;
  this.jumeaux = {casque: ['casqueAv']};
  this.etat.nu = false;
  this.etat['sans-casque'] = false;
  this.etat.rougeoie = false;
  this.etat.tournis = false;
  this.coupsLouche = 0;
  this.tombees = {};
  this._reprendre(0);
}
var R = RatCuir.prototype = Object.create(Bete.prototype);
R.constructor = RatCuir;
R.info = null;

R._mode = function(){ return this.etat.dos ? 'dos' : (this.etat.ebloui ? 'ebloui' : 'normal'); };
R._base = function(){
  var p = copie(POSES[this._mode()]), m = this._mode();
  if(this.etat.enrage && m === 'normal'){ p.sourcil = {a: -10, y: 5}; p.oreille = {a: 14}; p.tete = {a: -3, x: -3}; }
  if(this.etat.cible && m === 'normal'){ p.posture = {y: 3, x: 2}; p.tete = {a: -5, x: -2, y: 3}; p.oreille = {a: 18}; p.sourcil = {a: -6, y: 3}; p.saut = {sy: .97, sx: 1.02}; }
  if(this.etat.tournis && !this.etat['sans-casque']) p.casque = {a: -22, x: -2, y: 12};
  if(this.etat.rougeoie && m === 'normal') p.machoire = {a: -6};
  return p;
};
R._ancreNom = function(nom){
  if(nom === 'pointfaible') return this._mode() === 'normal' ? 'pfDos' : 'pfVentre';
  if(nom === 'pieds') return 'orteils';
  if(nom === 'haut') return this.etat['sans-casque'] || this._mode() !== 'normal' ? 'tete' : 'casqueHaut';
  return nom;
};
R._lancerBoucles = function(){
  var b = this._boucleur(), mode = this._mode(), V = this.etat.enrage ? 1.5 : 1, i;
  this.vitesse = V;
  b = this._boucleur();
  var self = this;
  function queue(amp, duree, base){
    for(var i = 0; i < QP.length - 1; i++){
      var A = amp * (.4 + i * .2), cles = onde(0, A, 8).map(function(k){ return [k.t, {a: k.v.a + (base ? base[i] || 0 : 0)}]; });
      b('q' + i, cles, duree, 'linear', -i * duree * .1 / V);
    }
  }
  if(this.etat.gele){
    b('secousse', [[0, {x: 0}], [.25, {x: .8}], [.5, {x: -.8}], [.75, {x: .6}], [1, {x: 0}]], 160, 'linear');
    b('souffle', [[0, {sy: 1}], [.5, {sy: 1.01}], [1, {sy: 1}]], 3200, 'ease-in-out');
    this._planifier(1200);
    return;
  }
  if(mode === 'normal'){
    b('souffle', [[0, {sy: 1, sx: 1}], [.45, {sy: 1.03, sx: .994}], [1, {sy: 1, sx: 1}]], 2000, 'ease-in-out');
    b('tete', [[0, {a: 0, y: 0}], [.22, {a: 1.4, y: -1.5}], [.5, {a: -1, y: 1}], [.74, {a: 1.8, y: -1}], [1, {a: 0, y: 0}]], 2800, 'ease-in-out');
    b('nez', [[0, {y: 0, a: 0}], [.12, {y: -1.6, a: -5}], [.24, {y: 0, a: 0}], [.36, {y: -1.4, a: -4}], [.48, {y: 0, a: 0}], [1, {y: 0, a: 0}]], 1000, 'ease-in-out');
    b('moustaches', [[0, {a: 0}], [.2, {a: -6}], [.4, {a: 2}], [.6, {a: -4}], [1, {a: 0}]], 860, 'ease-in-out');
    b('machoire', [[0, {a: 0}], [.3, {a: -2.5}], [.5, {a: 0}], [.7, {a: -3.5}], [1, {a: 0}]], 1500, 'ease-in-out');
    b('oreille', [[0, {a: 0}], [.35, {a: -5}], [.65, {a: 3}], [1, {a: 0}]], 3300, 'ease-in-out');
    b('corps', [[0, {x: 0, a: 0}], [.5, {x: -3, a: -.7}], [1, {x: 0, a: 0}]], 2600, 'ease-in-out');
    b('main', [[0, {a: 0}], [.5, {a: -3}], [1, {a: 0}]], 2600, 'ease-in-out');
    b('cuisse', [[0, {a: 0}], [.5, {a: 1.2}], [1, {a: 0}]], 2600, 'ease-in-out');
    b('chaine', [[0, {a: 0}], [.5, {a: 7}], [1, {a: 0}]], 1900, 'ease-in-out');
    b('bave', [[0, {sy: 1}], [.5, {sy: 1.12, sx: .94}], [1, {sy: 1}]], 1500, 'ease-in-out');
    if(this.etat.tournis){
      b('posture', [[0, {a: 0, x: 0}], [.25, {a: 3, x: 3}], [.5, {a: 0, x: 0}], [.75, {a: -3, x: -3}], [1, {a: 0, x: 0}]], 1600, 'ease-in-out');
      b('tete', [[0, {a: 0, x: 0}], [.25, {a: 5, x: 2}], [.5, {a: 0, x: 4}], [.75, {a: -5, x: 2}], [1, {a: 0, x: 0}]], 1100, 'ease-in-out');
    }
    if(this.etat.enrage) b('secousse', [[0, {x: 0, y: 0}], [.25, {x: .9, y: -.5}], [.5, {x: -.9, y: .4}], [.75, {x: .6, y: .3}], [1, {x: 0, y: 0}]], 140, 'linear');
    queue(3.5, 2800);
  } else if(mode === 'ebloui'){
    b('posture', [[0, {a: 0}], [.5, {a: -3, x: -2}], [1, {a: 0}]], 1500, 'ease-in-out');
    b('tete', [[0, {a: 0}], [.25, {a: -5}], [.5, {a: 3}], [.75, {a: -4}], [1, {a: 0}]], 1000, 'ease-in-out');
    b('main', [[0, {a: 0}], [.5, {a: 8}], [1, {a: 0}]], 420, 'ease-in-out');
    b('avbras', [[0, {a: 0}], [.5, {a: -5}], [1, {a: 0}]], 800, 'ease-in-out');
    b('mainF', [[0, {a: 0}], [.5, {a: -18}], [1, {a: 0}]], 560, 'ease-in-out');
    b('avbrasF', [[0, {a: 0}], [.5, {a: 12}], [1, {a: 0}]], 680, 'ease-in-out');
    b('paupiere', [[0, {y: 9}], [.5, {y: 12}], [1, {y: 9}]], 640, 'ease-in-out');
    b('souffle', [[0, {sy: 1}], [.5, {sy: 1.04}], [1, {sy: 1}]], 900, 'ease-in-out');
    b('machoire', [[0, {a: 0}], [.5, {a: -8}], [1, {a: 0}]], 760, 'ease-in-out');
    b('chaine', [[0, {a: 0}], [.5, {a: 10}], [1, {a: 0}]], 900, 'ease-in-out');
    queue(5, 1600);
  } else {
    b('posture', [[0, {a: 0, x: 0}], [.25, {a: 6, x: 4}], [.5, {a: 0, x: 0}], [.75, {a: -6, x: -4}], [1, {a: 0, x: 0}]], 820, 'ease-in-out');
    b('bras', [[0, {a: 0}], [.5, {a: 28}], [1, {a: 0}]], 340, 'ease-in-out');
    b('avbras', [[0, {a: -10}], [.5, {a: 26}], [1, {a: -10}]], 300, 'ease-in-out', -90);
    b('main', [[0, {a: 0}], [.5, {a: -28}], [1, {a: 0}]], 320, 'ease-in-out');
    b('brasF', [[0, {a: 18}], [.5, {a: -14}], [1, {a: 18}]], 380, 'ease-in-out');
    b('avbrasF', [[0, {a: 0}], [.5, {a: 28}], [1, {a: 0}]], 320, 'ease-in-out', -120);
    b('cuisse', [[0, {a: -14}], [.5, {a: 18}], [1, {a: -14}]], 430, 'ease-in-out');
    b('pied', [[0, {a: 0}], [.5, {a: 24}], [1, {a: 0}]], 320, 'ease-in-out');
    b('cuisseF', [[0, {a: 14}], [.5, {a: -14}], [1, {a: 14}]], 470, 'ease-in-out');
    b('piedF', [[0, {a: -10}], [.5, {a: 18}], [1, {a: -10}]], 400, 'ease-in-out', -140);
    b('tete', [[0, {a: 0}], [.25, {a: 12}], [.5, {a: 0}], [.75, {a: -9}], [1, {a: 0}]], 560, 'ease-in-out');
    b('machoire', [[0, {a: 0}], [.5, {a: -16}], [1, {a: 0}]], 640, 'ease-in-out');
    b('souffle', [[0, {sy: 1}], [.5, {sy: 1.05}], [1, {sy: 1}]], 640, 'ease-in-out');
    queue(12, 950, [-50, -24, -10, 10]);
  }
  this._planifier(500);
};
/* les petits événements de l'attente : il claque des dents, renifle, bave, gratte le sol, fait sonner son armure… */
R._evenement = function(){
  var mode = this._mode(), self = this, liste;
  if(mode === 'normal'){
    liste = ['claque', 'renifle', 'cligne', 'bave', 'bave', 'oreille', 'grogne', 'fixe', 'gratte', 'secoueArmure'];
    if(this.etat.enrage) liste = liste.concat(['claque', 'grogne', 'grogne', 'fixe', 'vapeur']);
    if(this.etat.tournis) liste = ['titube', 'titube', 'cligneFort', 'secoueTete'];
    if(this.etat.colle) liste = ['colle', 'colle', 'colle', 'grogne', 'claque'];
    if(this.etat.rougeoie) liste = liste.concat(['vapeur', 'claque']);
  } else if(mode === 'ebloui') liste = ['cligneFort', 'cligneFort', 'secoueTete', 'larme'];
  else liste = ['couine', 'cligne'];
  if(this.etat.brule) liste = liste.concat(['sursaut', 'secoue', 'sursaut']);
  var ev = choisir(liste), A = {ajout: true, vitesse: this.vitesse};
  switch(ev){
    case 'claque':
      this._seq([{t: 0, p: {machoire: {a: 0}, tete: {a: 0}}}, {t: .35, p: {machoire: {a: -24}, tete: {a: 4}}, e: 'cubic-bezier(.4,0,.6,1)'}, {t: .55, p: {machoire: {a: 2}, tete: {a: -4}}, e: 'cubic-bezier(.6,0,.9,.5)'}, {t: 1, p: {machoire: {a: 0}, tete: {a: 0}}}], 560, A);
      break;
    case 'renifle':
      this._seq([{t: 0, p: {tete: {a: 0, x: 0}, nez: {y: 0}}}, {t: .15, p: {tete: {a: 4, x: -3}, nez: {y: -3}}}, {t: .3, p: {tete: {a: 1}, nez: {y: 0}}}, {t: .45, p: {tete: {a: 5, x: -4}, nez: {y: -3}}}, {t: .6, p: {tete: {a: 1}, nez: {y: 0}}}, {t: 1, p: {tete: {a: 0, x: 0}, nez: {y: 0}}}], 820, A);
      break;
    case 'cligne':
      this._seq([{t: 0, p: {paupiere: {y: 0}}}, {t: .4, p: {paupiere: {y: 16}}, e: 'ease-in'}, {t: 1, p: {paupiere: {y: 0}}, e: 'ease-out'}], 210, A);
      break;
    case 'cligneFort':
      this._seq([{t: 0, p: {paupiere: {y: 0}}}, {t: .3, p: {paupiere: {y: 8}}}, {t: .5, p: {paupiere: {y: -4}}}, {t: .7, p: {paupiere: {y: 8}}}, {t: 1, p: {paupiere: {y: 0}}}], 520, A);
      break;
    case 'bave':
      this._seq([{t: 0, p: {bave: {sy: 1}}}, {t: .75, p: {bave: {sy: 1.9, sx: .8}}, e: 'ease-in'}, {t: .82, p: {bave: {sy: .6, sx: 1}}, e: 'cubic-bezier(.2,1.6,.5,1)'}, {t: 1, p: {bave: {sy: 1, sx: 1}}}], 1500, A);
      this._minuteur(function(){ if(!self.mort) self._goutteTombe(self._ou('baveBout', 154.5, 377)); }, 1500 * .76 / this.vitesse);
      break;
    case 'oreille':
      this._seq([{t: 0, p: {oreille: {a: 0}}}, {t: .25, p: {oreille: {a: 20}}, e: 'ease-out'}, {t: .5, p: {oreille: {a: -8}}}, {t: .7, p: {oreille: {a: 4}}}, {t: 1, p: {oreille: {a: 0}}}], 620, A);
      break;
    case 'grogne':
      var g = [{t: 0, p: {secousse: {x: 0, a: 0}, machoire: {a: 0}, sourcil: {y: 0}}}];
      for(var k = 1; k < 10; k++) g.push({t: k / 10, p: {secousse: {x: (k % 2 ? 1.6 : -1.6), a: (k % 2 ? .5 : -.5)}, machoire: {a: -7 - (k % 3)}, sourcil: {y: 3}}, e: 'linear'});
      g.push({t: 1, p: {secousse: {x: 0, a: 0}, machoire: {a: 0}, sourcil: {y: 0}}});
      this._seq(g, 900, A);
      break;
    case 'fixe':
      this._seq([{t: 0, p: {tete: {a: 0, x: 0}, posture: {x: 0}, oreille: {a: 0}}}, {t: .3, p: {tete: {a: -6, x: -6}, posture: {x: -6}, oreille: {a: 14}}, e: 'cubic-bezier(.2,.8,.3,1)'},
        {t: .75, p: {tete: {a: -5, x: -5}, posture: {x: -5}, oreille: {a: 12}}}, {t: 1, p: {tete: {a: 0, x: 0}, posture: {x: 0}, oreille: {a: 0}}}], 1400, A);
      break;
    case 'gratte':
      this._seq([{t: 0, p: {bras: {a: 0}, avbras: {a: 0}, main: {a: 0}}}, {t: .2, p: {bras: {a: 10}, avbras: {a: 22}, main: {a: 14}}, e: 'ease-out'}, {t: .4, p: {bras: {a: -8}, avbras: {a: -6}, main: {a: -8}}, e: 'ease-in'},
        {t: .6, p: {bras: {a: 8}, avbras: {a: 18}, main: {a: 10}}}, {t: .8, p: {bras: {a: -6}, avbras: {a: -4}, main: {a: -6}}}, {t: 1, p: {bras: {a: 0}, avbras: {a: 0}, main: {a: 0}}}], 900, A);
      this._minuteur(function(){ self._poussiere(self._ou('main', 180, 388), 3, 1); }, 300);
      break;
    case 'secoueArmure':
      /* il se secoue : l'armure cliquette */
      var s = [{t: 0, p: {secousse: {a: 0}, ep1: {a: 0}, ep2: {a: 0}, plq3: {y: 0}, plq1: {y: 0}, chaine: {a: 0}}}];
      for(var j = 1; j < 7; j++) s.push({t: j / 7, p: {secousse: {a: j % 2 ? 1.6 : -1.6}, ep1: {a: j % 2 ? 2 : -2}, ep2: {a: j % 2 ? -1.6 : 1.6}, plq3: {y: j % 2 ? -2 : 1}, plq1: {y: j % 2 ? 1 : -2}, chaine: {a: j % 2 ? 16 : -12}}, e: 'ease-in-out'});
      s.push({t: 1, p: {secousse: {a: 0}, ep1: {a: 0}, ep2: {a: 0}, plq3: {y: 0}, plq1: {y: 0}, chaine: {a: 0}}});
      this._seq(s, 620, A);
      break;
    case 'vapeur':
      var n = this._ou('narine', 48, 290);
      for(var v = 0; v < 3; v++) this._bouffee([n[0] - 2, n[1]], {r: 4, coul: '#f0eef8', op: .75, dx: hasard(-30, -16), dy: hasard(-16, -4), duree: 700, delai: v * 110, s1: 2.6});
      break;
    case 'titube':
      this._seq([{t: 0, p: {posture: {a: 0, x: 0}, tete: {a: 0}}}, {t: .3, p: {posture: {a: 5, x: 8}, tete: {a: 8}}, e: 'ease-in-out'}, {t: .6, p: {posture: {a: -4, x: -6}, tete: {a: -6}}}, {t: 1, p: {posture: {a: 0, x: 0}, tete: {a: 0}}}], 1100, A);
      break;
    case 'secoueTete':
      this._seq([{t: 0, p: {tete: {a: 0}}}, {t: .2, p: {tete: {a: 10}}}, {t: .4, p: {tete: {a: -9}}}, {t: .6, p: {tete: {a: 7}}}, {t: .8, p: {tete: {a: -4}}}, {t: 1, p: {tete: {a: 0}}}], 620, A);
      break;
    case 'larme':
      this._goutteTombe(this._ou('oeilC', 136, 282), {coul: '#9ad8ff', dx: -6});
      break;
    case 'couine':
      this._cri(this._ou('bouche', 70, 316), 1);
      break;
    case 'colle':
      this._tirerPatte();
      break;
    case 'sursaut':
      this._seq([{t: 0, p: {saut: {y: 0, sy: 1}, machoire: {a: 0}, paupiere: {y: 0}}}, {t: .15, p: {saut: {y: 4, sy: .92}}, e: 'ease-out'}, {t: .4, p: {saut: {y: -28, sy: 1.08}, machoire: {a: -20}, paupiere: {y: 14}}, e: 'cubic-bezier(.2,.8,.4,1)'},
        {t: .75, p: {saut: {y: 0, sy: .93}}, e: 'cubic-bezier(.6,0,.9,.5)'}, {t: 1, p: {saut: {y: 0, sy: 1}, machoire: {a: 0}, paupiere: {y: 0}}, e: 'ease-out'}], 700, A);
      this._cri(this._ou('bouche', 70, 316), .8);
      break;
    case 'secoue':
      var s2 = [{t: 0, p: {secousse: {a: 0, x: 0}, tete: {a: 0}}}];
      for(var j2 = 1; j2 < 8; j2++) s2.push({t: j2 / 8, p: {secousse: {a: j2 % 2 ? 6 : -6, x: j2 % 2 ? 4 : -4}, tete: {a: j2 % 2 ? -9 : 9}}, e: 'ease-in-out'});
      s2.push({t: 1, p: {secousse: {a: 0, x: 0}, tete: {a: 0}}});
      this._seq(s2, 760, A);
      break;
  }
};

/* ---- ce qu'il faut aux états communs ---- */
R._specsFeu = function(){
  var S = this.J.souffle.firstElementChild, T = this.J.tete.firstElementChild, Q = this.J.q2.firstElementChild, s = [];
  s.push({ref: S, x: 360, y: 150, lueur: [150, 90]});
  [[262, 176, 46, 24, -12], [292, 156, 66, 30, -6], [322, 142, 84, 34, -2], [354, 132, 70, 30, 2], [386, 128, 96, 38, 0], [416, 134, 78, 32, 6], [446, 154, 88, 34, 10], [470, 190, 58, 26, 16], [484, 232, 42, 22, 22]].forEach(function(q){ s.push({ref: S, x: q[0], y: q[1], h: q[2], w: q[3], r: q[4]}); });
  s.push({ref: T, x: 182, y: 200, h: 46, w: 22, r: -6}, {ref: T, x: 214, y: 214, h: 34, w: 18, r: 10});
  s.push({ref: Q, x: 526, y: 274, h: 34, w: 18, r: 0, lueur: [34, 30]});
  return s;
};
R._colleSpec = function(){
  return {cx: 280, rx: 230,
    tirer: [{p: {bras: {a: -20}, avbras: {a: 36}, main: {a: 8}}, ref: 'main', fil: 'filMain', etire: 4.5, corps: {corps: {a: -2}, tete: {a: 6}, machoire: {a: -14}}, corps0: {corps: {a: 0}, tete: {a: 0}, machoire: {a: 0}}},
      {p: {brasF: {a: -14}, avbrasF: {a: 30}, mainF: {a: 30}}, ref: 'mainF', fil: 'filMainF', etire: 4, corps: {corps: {a: -2}, tete: {a: 4}, machoire: {a: -12}}, corps0: {corps: {a: 0}, tete: {a: 0}, machoire: {a: 0}}},
      {p: {cuisse: {a: 4}, pied: {a: 28}}, ref: 'pied', fil: 'filPied', etire: 4.5, corps: {corps: {a: 2}, tete: {a: -4}, machoire: {a: -12}}, corps0: {corps: {a: 0}, tete: {a: 0}, machoire: {a: 0}}}]};
};
R._etoilesSpec = function(){ return {cx: 168, cy: 178, rx: 84, ry: 22, n: 5}; };
R._pfActif = function(){ return this._mode() === 'normal' ? 'dos' : 'ventre'; };

/* ---- les états propres : nu, sans-casque, rougeoie, tournis ; et enragé, retourné ---- */
R._e_enrage = function(on){
  var self = this;
  this.etat.enrage = on;
  this._fondu('oeilRage', on ? 1 : 0, 400);
  this._pulser('oeilRage', on, {s0: .85, s1: 1.25, duree: 700});
  clearTimeout(this.fx.vapeur);
  if(on) (function vapeur(){
    if(self.mort || !self.etat.enrage) return;
    if(!self.etat.dos){ var p = self._ou('narine', 48, 290); for(var i = 0; i < 2; i++) self._bouffee([p[0] - 2, p[1]], {r: 4, coul: '#f0eef8', op: .75, dx: hasard(-26, -14), dy: hasard(-14, -4), duree: 650, delai: i * 120, s1: 2.6}); }
    self.fx.vapeur = setTimeout(vapeur, hasard(900, 1700));
  })();
  return this._changerMode();
};
/* sans armure (sans animation : pour remettre une partie en place ; l'animation, c'est special('armure-tombe') ou special('armure-eclate')) */
R._e_nu = function(on){
  var self = this;
  this.etat.nu = on;
  ARMURE.forEach(function(n){ self.J[n].style.opacity = on ? 0 : ''; if(on) self.tombees[n] = 1; else delete self.tombees[n]; });
  this._tous('[data-nu]').forEach(function(e){ self._fondu(e, on ? 1 : 0, 300); });
  if(!on){
    (this.fx.debrisArmure || []).forEach(function(g){ g.animate([{opacity: 1}, {opacity: 0}], {duration: 400, fill: 'forwards'}).finished.then(oter(g), oter(g)); });
    this.fx.debrisArmure = [];
    this._tous('[data-acide],[data-fente]').forEach(function(e){ e.style.opacity = 0; });
    this._tous('[data-gel="armure"]').forEach(function(e){ if(!self.etat.gele) e.style.opacity = 0; });
    if(this.etat.rougeoie) this._rougir(true);
  }
  this._majPointFaible();
};
R._e_sans_casque = function(on){
  this.etat['sans-casque'] = on;
  this.J.casque.style.opacity = this.J.casqueAv.style.opacity = on ? 0 : '';
  this._fondu('visiere', on ? 0 : 1, 0);
  this._fondu('bosse', on ? 1 : 0, 200);
  if(!on){ (this.fx.debrisCasque || []).forEach(function(g){ g.remove(); }); this.fx.debrisCasque = []; this.coupsLouche = 0; }
  else this.coupsLouche = 2;
  if(on && this.etat.tournis) this._e_tournis(false);
  return this._changerMode();
};
/* le feu le renforce : l'armure rougeoie (plaques chauffées au rouge, braises, chaleur) */
R._e_rougeoie = function(on){
  this.etat.rougeoie = on;
  this._rougir(on);
  return this._changerMode();
};
R._rougir = function(on){
  var self = this;
  this._tous('[data-rouge]').forEach(function(e){ if(!e.closest('[data-debris]')) self._fondu(e, on ? .72 : 0, on ? 600 : 900); });
  this._fondu('lueurRouge', on ? 1 : 0, 600);
  this._pulser('lueurRouge', on, {s0: .92, s1: 1.08, duree: 900});
  clearTimeout(this.fx.rougeT);
  if(on) (function chaleur(){
    if(!self.etat.rougeoie || self.mort) return;
    var n = choisir(ARMURE.slice(0, 10).filter(function(n){ return !self.tombees[n]; }));
    if(n){
      var c = self.A[n + 'C'] ? self._pt(n + 'C') : self._ou(n, 0, 0);
      var b = self._fxEl('<circle r="4.5" fill="' + self.G.braise + '"/><circle r="1.8" fill="#fff0b0"/>');
      b.animate([{transform: 'translate(' + f1(c[0] + hasard(-14, 14)) + 'px,' + f1(c[1]) + 'px)', opacity: 1}, {transform: 'translate(' + f1(c[0] + hasard(-20, 30)) + 'px,' + f1(c[1] - hasard(50, 90)) + 'px)', opacity: 0}], {duration: hasard(800, 1200), easing: 'ease-out', fill: 'forwards'}).finished.then(oter(b), oter(b));
      if(Math.random() < .3) self._bouffee([c[0], c[1] - 10], {r: 7, coul: '#7a6a78', op: .35, dx: hasard(0, 20), dy: -50, duree: 1300, s1: 2.4});
    }
    self.fx.rougeT = setTimeout(chaleur, hasard(200, 340));
  })();
};
R._e_tournis = function(on){
  this.etat.tournis = on;
  if(on) this._allumerEtoiles('etoiles', {cx: 160, cy: 168, rx: 66, ry: 16, n: 4, s: .85, duree: 1800});
  else if(!this.etat.ebloui) this._eteindreEtoiles('etoiles');
  this._fondu('spirale', on ? 1 : 0, 250);
  this._fondu('pupille', on ? 0 : 1, 250);
  return this._changerMode();
};
R._e_dos = function(on){
  var self = this, j = this._debutAction();
  this.etat.dos = on;
  this._majPointFaible();
  if(on){
    /* il bascule lourdement sur le dos : l'armure racle le sol */
    return this._seq([{t: 0, p: {}}, {t: .25, p: {posture: {a: -14, x: 10}, tete: {a: 18}, machoire: {a: -26}, bras: {a: 50}, brasF: {a: 40}, cuisse: {a: -30}}, e: 'ease-out'},
      {t: .65, p: POSES.dos, e: 'cubic-bezier(.5,0,1,.7)'}, {t: .8, p: {saut: {sy: .86, sx: 1.08}}, e: 'ease-out'}, {t: 1, p: {saut: {sy: 1, sx: 1}}, e: 'cubic-bezier(.3,.6,.4,1.4)'}], 1000).fini.then(function(){
      self._poussiere([280, SOL], 5, 1); self._poussiere([360, SOL], 4, -1);
      return self._finAction(j, 120);
    });
  }
  return this._seq([{t: 0, p: {}}, {t: .35, p: {posture: {a: 110, x: 0, y: -40}, tete: {a: 10}}, e: 'cubic-bezier(.3,.6,.5,1)'},
    {t: .7, p: avec(JAMBES0, {posture: {a: 0, x: 0, y: 0}, saut: {sy: .88, sx: 1.08}, tete: {a: -4}}), e: 'cubic-bezier(.5,0,.9,.6)'}, {t: 1, p: {saut: {sy: 1, sx: 1}, tete: {a: 0}}, e: 'cubic-bezier(.3,.6,.4,1.4)'}], 820).fini.then(function(){ return self._finAction(j, 300); });
};

/* =====================================================================
   D. L'armure qui se détache (et reste au sol)
   ===================================================================== */
/* faire tomber une pièce d'armure : elle glisse, tombe, rebondit, tinte, et reste au sol */
R._tomber = function(nom, o){
  o = o || {};
  var self = this, d = this._detacher(nom.split('+')), bb = d.bb, plat = Math.random() < .85, petit = /^ann/.test(nom);
  var rot = (plat ? 0 : 180) - d.ang + hasard(-10, 10), basY = plat ? bb.y + bb.height : -bb.y, sy = petit ? 1 : .55;
  var x = d.c[0] + (o.dx == null ? (d.c[0] < 330 ? -1 : 1) * hasard(30, 90) : o.dx), y = SOL - Math.max(3, basY * sy * .85) + hasard(0, 3);
  var dur = o.duree || hasard(750, 950);
  var a = this._voler(d.g, d.c, [x, y], {haut: o.haut == null ? hasard(16, 40) : o.haut, rot: rot + (o.tours || 0) * 360, duree: dur, rebond: 6, bascule: hasard(-8, 8), glisse: hasard(-12, 12), sy: sy,
    onSol: function(){ self._etincelles([x, SOL - 4], 5, {v: 30, grav: 10}); self._poussiere([x, SOL], 2, x < 330 ? -1 : 1); if(o.onTinte) try{ o.onTinte(nom); }catch(e){} }});
  a.finished.then(function(){
    try{ a.commitStyles(); a.cancel(); }catch(e){}
    /* au sol, l'acide finit de ronger : la plaque redevient rouillée */
    [].forEach.call(d.g.querySelectorAll('[data-acide]'), function(e){ if(parseFloat(e.style.opacity) > .4) e.animate([{opacity: e.style.opacity}, {opacity: .3}], {duration: 1500, fill: 'forwards'}); });
  }, function(){});
  (this.fx.debrisArmure = this.fx.debrisArmure || []).push(d.g);
  return a;
};

/* =====================================================================
   E. Les actions (Promise)
   ===================================================================== */
R._courir = function(periode){
  var self = this, T = periode || 380, depuis = copie(COURSE[0].p);
  return this._seq([{t: 1, p: COURSE[0].p, e: 'ease-out'}], 120).fini.then(function(){
    var s = self._seq(COURSE, T, {boucle: true, depuis: depuis, e: 'ease-in-out'});
    var an = s.anims;
    for(var i = 0; i < QP.length - 1; i++){
      var c = onde(-4 + i * 2, 5 + i * 2.4, 8).map(function(q){ var o = {}; o['q' + i] = {a: q.v.a}; return {t: q.t, p: o}; });
      an = an.concat(self._seq(c, T * 2, {boucle: true, depuis: {}, delai: -i * T * .18, e: 'linear'}).anims);
    }
    /* l'armure cliquette au galop */
    an = an.concat(self._seq([{t: 0, p: {ep1: {y: 0}, plq3: {y: 0}, plq1: {y: 0}, casque: {y: 0}}}, {t: .5, p: {ep1: {y: -2.5}, plq3: {y: -2}, plq1: {y: -3}, casque: {y: -3}}}, {t: 1, p: {ep1: {y: 0}, plq3: {y: 0}, plq1: {y: 0}, casque: {y: 0}}}], T / 2, {boucle: true, depuis: {}}).anims);
    return an;
  });
};
/* il arrive au galop, freine en dérapant, puis fait sonner son armure */
R.entrer = function(o){
  o = o || {};
  var self = this, j = this._debutAction(), ech = this._echelle(), r = this.svg.getBoundingClientRect();
  var d = o.distance != null ? o.distance / ech : Math.max(380, ((window.innerWidth || 960) - r.left) / ech + 60);
  this.el.style.visibility = '';
  this._seq([{t: 0, p: {pos: {x: d}}}], 1);
  var duree = Math.max(1000, d * 2.1);
  return this._courir(360).then(function(){
    var poussieres = setInterval(function(){ self._poussiere(self._ou('orteils', 330, 390), 1, 1); }, 170);
    var a = self._seq([{t: 0, p: {pos: {x: d}}}, {t: .84, p: {pos: {x: -8}}, e: 'cubic-bezier(.2,.4,.35,1)'}, {t: 1, p: {pos: {x: 0}}}], duree);
    return attendreMs(duree * .74).then(function(){
      clearInterval(poussieres);
      if(j !== self.jeton) return;
      self._couperBoucles();
      self._seq([{t: 0, p: {pos: {x: self._lire('pos').x}}}, {t: 1, p: {pos: {x: 0}}, e: 'cubic-bezier(.2,.6,.3,1)'}], duree * .26);
      self._poussiere(self._ou('main', 180, 388), 4, -1); self._poussiere(self._ou('orteils', 330, 390), 3, -1);
      return self._seq([{t: 0, p: {}},
        {t: .3, p: avec(JAMBES0, {saut: {y: 0, sy: .94}, posture: {a: -7, x: 8}, tete: {a: 9, y: -3}, bras: {a: 34}, avbras: {a: 24}, main: {a: 16}, brasF: {a: 30}, avbrasF: {a: 20}, cuisse: {a: 22}, pied: {a: 6}, cuisseF: {a: 18}, machoire: {a: -10}, chaine: {a: 40}}), e: 'cubic-bezier(.2,.7,.3,1)'},
        {t: .62, p: avec(JAMBES0, {saut: {y: 0, sy: 1.03}, posture: {a: 2, x: -2}, tete: {a: -3}, machoire: {a: -4}, chaine: {a: -20}}), e: 'cubic-bezier(.4,0,.3,1)'},
        {t: 1, p: avec(JAMBES0, {saut: {y: 0, sy: 1}, posture: {a: 0, x: 0}, tete: {a: 0, y: 0}, machoire: {a: 0}, chaine: {a: 0}}), e: 'ease-in-out'}], 760).fini;
    }).then(function(){
      if(j !== self.jeton) return;
      /* il fait sonner son armure en se secouant, et souffle par les naseaux */
      var s = [{t: 0, p: {secousse: {a: 0}, ep1: {a: 0}, ep2: {a: 0}, plq2: {y: 0}, chaine: {a: 0}, machoire: {a: 0}}}];
      for(var k = 1; k < 6; k++) s.push({t: k / 6, p: {secousse: {a: k % 2 ? 2.4 : -2.4}, ep1: {a: k % 2 ? 2.5 : -2.5}, ep2: {a: k % 2 ? -2 : 2}, plq2: {y: k % 2 ? -2.5 : 1}, chaine: {a: k % 2 ? 22 : -16}, machoire: {a: -14}}});
      s.push({t: 1, p: {secousse: {a: 0}, ep1: {a: 0}, ep2: {a: 0}, plq2: {y: 0}, chaine: {a: 0}, machoire: {a: 0}}});
      var n = self._ou('narine', 48, 290);
      for(var v = 0; v < 3; v++) self._bouffee([n[0] - 2, n[1]], {r: 5, coul: '#f0eef8', op: .75, dx: hasard(-34, -18), dy: hasard(-10, 4), duree: 700, delai: 260 + v * 110, s1: 2.8});
      return self._seq(s, 640).fini;
    });
  }).then(function(){ return self._finAction(j, 250); });
};
/* le coup de tête : élan (il gratte le sol), charge courte, impact, recul */
R.attaquer = function(nom, o){
  if(typeof o === 'function') o = {onImpact: o};
  if(nom && typeof nom === 'object'){ o = nom; nom = null; }
  o = o || {};
  var self = this, j = this._debutAction(), impact, impactP = new Promise(function(r){ impact = r; }), T = 1400, feu = this.etat.rougeoie;
  var s = this._seq([
    {t: 0, p: {}},
    {t: .2, p: avec(JAMBES0, {pos: {x: 26}, saut: {y: 4, sy: .93, sx: 1.04}, posture: {a: 3}, corps: {a: 2, sx: .96}, tete: {a: -14, x: 6, y: 8}, machoire: {a: 2}, oreille: {a: 22}, sourcil: {y: 5, a: -8}, bras: {a: -16}, avbras: {a: -10}, main: {a: -6}, brasF: {a: -12}, cuisse: {a: 16}, pied: {a: 8}, cuisseF: {a: 14}, piedF: {a: 6}, chaine: {a: 20}}), e: 'cubic-bezier(.4,0,.2,1)'},
    {t: .27, p: {bras: {a: 14}, avbras: {a: 22}, main: {a: 16}}, e: 'ease-out'},
    {t: .34, p: {bras: {a: -16}, avbras: {a: -10}, main: {a: -6}}, e: 'ease-in'},
    {t: .41, p: {bras: {a: 12}, avbras: {a: 20}, main: {a: 14}}, e: 'ease-out'},
    {t: .47, p: {bras: {a: -16}, avbras: {a: -10}, main: {a: -6}}, e: 'ease-in'},
    {t: .6, p: {pos: {x: -150}, saut: {y: -10, sy: 1.04, sx: 1.03}, posture: {a: -4}, corps: {a: -2, sx: 1.06}, tete: {a: -22, x: -10, y: 10}, bras: {a: 40}, avbras: {a: 30}, main: {a: 20}, brasF: {a: 36}, avbrasF: {a: 20}, cuisse: {a: -30}, pied: {a: -24}, cuisseF: {a: -26}, piedF: {a: -20}, chaine: {a: -30}}, e: 'cubic-bezier(.55,0,.85,.55)'},
    {t: .65, p: {pos: {x: -166}, saut: {y: 0, sy: .88, sx: 1.08}, tete: {a: -8, x: -16, y: 4}, machoire: {a: -18}, bras: {a: 10}, avbras: {a: 0}, cuisse: {a: -6}, pied: {a: 0}, chaine: {a: -50}}, e: 'cubic-bezier(.7,0,1,.5)'},
    {t: .76, p: {pos: {x: -118}, saut: {y: -10, sy: 1.03, sx: 1}, tete: {a: 6, x: 0, y: 0}, machoire: {a: -6}, chaine: {a: 30}}, e: 'cubic-bezier(.2,.7,.4,1)'},
    {t: .82, p: {tete: {a: -5}}, e: 'ease-in-out'}, {t: .87, p: {tete: {a: 4}}, e: 'ease-in-out'},
    {t: 1, p: avec(JAMBES0, {pos: {x: 0}, saut: {y: 0, sy: 1, sx: 1}, posture: {a: 0}, corps: {a: 0, sx: 1}, tete: {a: 0, x: 0, y: 0}, machoire: {a: 0}, oreille: {a: 0}, sourcil: {y: 0, a: 0}, chaine: {a: 0}}), e: 'cubic-bezier(.4,0,.3,1.2)'}
  ], T);
  for(var i = 0; i < QP.length - 1; i++){ var c0 = {}, c1 = {}, c2 = {}; c0['q' + i] = {a: 0}; c1['q' + i] = {a: 10 + i * 3}; c2['q' + i] = {a: -12 - i * 3};
    this._seq([{t: 0, p: c0}, {t: .5, p: c1}, {t: .64, p: c2}, {t: .8, p: c1}, {t: 1, p: c0}], T, {delai: i * 20}); }
  [.3, .4].forEach(function(t){ self._minuteur(function(){ self._poussiere(self._ou('main', 180, 388), 3, 1); }, T * t); });
  this._minuteur(function(){ self._poussiere(self._ou('orteils', 330, 390), 4, 1); if(feu) for(var k = 0; k < 5; k++) self._bouffee(self._ou('centre', 420, 280), {r: 10, coul: choisir(['#ff8a20', '#ffb040', '#ff5a10']), op: .8, dx: hasard(20, 60), dy: hasard(-30, -10), duree: 500, delai: k * 40}); }, T * .5);
  this._minuteur(function(){
    var p = self._ou('frappe', 112, 236);
    self._eclat([p[0] - 18, p[1] + 10], 26, feu ? '#ffd060' : '#fff8d0');
    self._etincelles([p[0] - 10, p[1] + 10], feu ? 12 : 7, {v: 50, ang: Math.PI, ouv: 2.4});
    if(feu) self._souffleFeu([p[0] - 24, p[1] + 10], 26);
    self._poussiere([p[0] + 40, SOL], 3, -1);
    if(o.onImpact) try{ o.onImpact(); }catch(e){}
    impact();
  }, T * .645);
  var pr = s.fini.then(function(){ return self._finAction(j, 220); });
  pr.impact = impactP;
  return pr;
};
/* la réaction de base à un coup (force 0.4 = petit sursaut, 1.4 = gros choc) */
R._recul = function(f, o){
  o = o || {};
  var self = this, j = this._debutAction(), mode = this._mode(), base = this._base(), T = 640 * Math.max(.8, Math.min(1.2, f));
  if(o.flash !== false) this._flash(1.6 + f);
  if(f >= .8 && o.cri !== false) this._cri(this._ou('bouche', 70, 316), 1.1);
  var k = [{t: 0, p: {}},
    {t: .12, p: {secousse: {x: 22 * f, y: -5 * f, a: -7 * f}, saut: {sx: 1 - .1 * f, sy: 1 + .08 * f}, tete: {a: (base.tete ? base.tete.a || 0 : 0) + 14 * f}, machoire: {a: -24 * f}, paupiere: {y: 16}, oreille: {a: 36 * f}, sourcil: {y: -4, a: 8}, chaine: {a: 30 * f}}, e: 'cubic-bezier(.1,.9,.3,1)'},
    {t: .4, p: {secousse: {x: 12 * f, y: 0, a: 3 * f}, saut: {sx: 1 + .05 * f, sy: 1 - .04 * f}, tete: {a: (base.tete ? base.tete.a || 0 : 0) - 5 * f}, machoire: {a: -9 * f}, chaine: {a: -20 * f}}, e: 'ease-in-out'},
    {t: .62, p: {secousse: {x: 5 * f, a: -2 * f}, saut: {sx: .99, sy: 1.01}, tete: {a: (base.tete ? base.tete.a || 0 : 0) + 3}, paupiere: {y: 6}, chaine: {a: 10}}, e: 'ease-in-out'},
    {t: 1, p: {secousse: {x: 0, y: 0, a: 0}, saut: {sx: 1, sy: 1}, tete: fusion(Z, base.tete), machoire: fusion(Z, base.machoire), paupiere: {y: 0}, oreille: fusion(Z, base.oreille), sourcil: fusion(Z, base.sourcil), chaine: fusion(Z, base.chaine)}, e: 'cubic-bezier(.4,0,.3,1.3)'}];
  if(mode === 'dos') k[1].p.secousse = {x: 18 * f, y: 6, a: 9 * f};
  return this._seq(k, T).fini.then(function(){ return self._finAction(j, 200); });
};
/* où frappent les flèches : une plaque encore en place, sinon le flanc */
R._pointArmure = function(){
  var self = this, l = ['ep1', 'plq4', 'plq3', 'ep2', 'plq2'].filter(function(n){ return !self.tombees[n]; });
  if(!l.length) return null;
  var n = choisir(l), a = this.A[n + 'C'], c = a ? a.firstElementChild : null;
  return {nom: n, p: c ? this._ou(a, +c.getAttribute('cx') + hasard(-12, 12), +c.getAttribute('cy') + hasard(-8, 8)) : this._ou(n, 0, 0)};
};
R._armure = function(){ return !this.etat.nu; };
/* une flèche qui rebondit sur l'armure en tournoyant */
R._flecheRebond = function(p){
  var g = this._fxEl(L('M-22 0 L 16 0', O, 5) + L('M-22 0 L 16 0', '#c8a070', 2.6) + P('M16 -4 L 26 0 L 16 4 Z', '#d8dce8', ' stroke-width="1.4"') + P('M-22 0 L -28 -5 L -18 0 L -28 5 Z', '#e8e0d0', ' stroke-width="1.2"'));
  var x2 = p[0] - hasard(40, 70), y2 = SOL - 4;
  g.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) rotate(0deg)'}, {offset: .4, transform: 'translate(' + f1(p[0] - 30) + 'px,' + f1(p[1] - 50) + 'px) rotate(-260deg)'}, {offset: .85, transform: 'translate(' + f1(x2) + 'px,' + f1(y2) + 'px) rotate(-520deg)', opacity: 1}, {transform: 'translate(' + f1(x2 - 6) + 'px,' + f1(y2) + 'px) rotate(-540deg)', opacity: 0}],
    {duration: 900, easing: 'cubic-bezier(.3,.5,.6,1)', fill: 'forwards'}).finished.then(function(){ g.remove(); }, function(){ g.remove(); });
};
R._ting = function(p, gros){
  this._eclat(p, gros ? 30 : 18, '#ffffff', {anneau: '#fff4c0', duree: gros ? 520 : 380});
  this._etincelles(p, gros ? 16 : 8, {v: gros ? 80 : 50, ouv: Math.PI * 1.8, ang: Math.PI * 1.2, coul: ['#fff6c0', '#ffd060', '#ffffff']});
};
R._t_coup = function(o){ return this._recul(1); };
R._t_brulure = function(o){
  var self = this;
  if(!this.etat.brule) this._e_brule(true);
  this._souffleFeu(this._ou('centre', 360, 170), 30);
  return this._recul(.9);
};
R._t_fleche = function(o, lourde){
  var a = this._armure() ? this._pointArmure() : null, self = this;
  if(a){
    this._ting(a.p, lourde);
    if(!lourde) this._flecheRebond(a.p);
    if(lourde){
      this._fondu(a.nom + '_cab', 1, 120);
      this._poussiere([a.p[0], SOL], 3, 1);
    }
    return this._recul(lourde ? 1.1 : .45, {cri: lourde, flash: lourde});
  }
  var p = this._ou('centre', 330 + hasard(-30, 30), 272 + hasard(-20, 10));
  this._bouffee(p, {r: 9, coul: '#ffffff', op: .9, dx: 0, dy: 0, duree: 260, s0: .2, s1: 2});
  return this._recul(lourde ? 1.4 : 1);
};
R._t_fleche_argent = function(o){ return this._t_fleche(o); };
R._t_fleche_lourde = function(o){ return this._t_fleche(o, true); };
R._t_dague = function(o){
  var a = this._armure() ? this._pointArmure() : null;
  if(a){
    for(var i = 0; i < 3; i++) this._etincelles([a.p[0] - 10 + i * 9, a.p[1] - 4 + i * 5], 4, {v: 40, ang: Math.PI * 1.1, delai: i * 50});
    return this._recul(.5, {cri: false});
  }
  this._entailles(this._ou('centre', 320, 270));
  return this._recul(1.1);
};
/* le feu le renforce : l'armure chauffe au rouge, il rugit */
R._t_feu = function(o){
  var self = this, p = this._ou('centre', 340, 220);
  this._souffleFeu(p, 40);
  if(!this._armure()){ this._e_brule(true); return this._recul(1.2); }
  if(!this.etat.rougeoie) this._e_rougeoie(true);
  var j = this._debutAction();
  this._flash(2);
  /* il encaisse, puis gonfle la poitrine et rugit, l'armure rouge */
  var pr = this._seq([{t: 0, p: {}}, {t: .15, p: {secousse: {x: 14, a: -4}, tete: {a: 10}, machoire: {a: -20}, paupiere: {y: 14}}, e: 'cubic-bezier(.1,.9,.3,1)'},
    {t: .45, p: {secousse: {x: 0, a: 0}, posture: {a: -6, x: 6}, tete: {a: -12, x: -4}, machoire: {a: -34}, paupiere: {y: 0}, oreille: {a: 26}, sourcil: {a: -10, y: 5}, saut: {sy: 1.05}}, e: 'cubic-bezier(.3,.7,.3,1)'},
    {t: .5, p: {secousse: {x: 2}}}, {t: .55, p: {secousse: {x: -2}}}, {t: .6, p: {secousse: {x: 2}}}, {t: .65, p: {secousse: {x: -2}}},
    {t: 1, p: {secousse: {x: 0, a: 0}, posture: {a: 0, x: 0}, tete: {a: 0, x: 0}, machoire: {a: 0}, oreille: {a: 0}, sourcil: {a: 0, y: 0}, saut: {sy: 1}}, e: 'ease-in-out'}], 1500).fini.then(function(){ return self._finAction(j, 250); });
  this._minuteur(function(){ var b = self._pt('bouche'); for(var k = 0; k < 5; k++) self._bouffee([b[0] - 6, b[1]], {r: 7, coul: choisir(['#ffb040', '#ff7a1a', '#ffd060']), op: .7, dx: hasard(-50, -24), dy: hasard(-24, 4), duree: 520, delai: k * 50}); }, 640);
  return pr;
};
/* la lumière : avec le casque, elle glisse dessus ; sans le casque, elle l'éblouit (il se dresse) */
R._t_lumiere = function(o){
  var self = this;
  if(!this.etat['sans-casque']){
    var j = this._debutAction(), h = this._ou('casqueHaut', 168, 184);
    this._eclat([h[0] - 20, h[1] + 20], 14, '#ffffff', {duree: 300});
    this._eclat([h[0] + 10, h[1] + 8], 22, '#fff8d0', {delai: 160, duree: 420});
    this._eclat([h[0] + 40, h[1] + 20], 12, '#ffffff', {delai: 320, duree: 300});
    return this._seq([{t: 0, p: {}}, {t: .2, p: {tete: {a: -9, y: 5}, paupiere: {y: 8}, machoire: {a: -2}}, e: 'ease-out'}, {t: .55, p: {tete: {a: -8, y: 4}, machoire: {a: -10}}},
      {t: .65, p: {machoire: {a: -2}}}, {t: .75, p: {machoire: {a: -10}}}, {t: 1, p: {tete: {a: 0, y: 0}, paupiere: {y: 0}, machoire: {a: 0}}}], 1300).fini.then(function(){ return self._finAction(j, 200); });
  }
  this._rayons(this._ou('oeilC', 148, 275), 50);
  this._flash(2.4);
  var j2 = this._debutAction();
  return this._seq([{t: 0, p: {}}, {t: .4, p: {tete: {a: 14, x: 6}, paupiere: {y: 16}, machoire: {a: -22}, secousse: {x: 10}}, e: 'cubic-bezier(.1,.9,.3,1)'}, {t: 1, p: {secousse: {x: 0}}}], 420).fini.then(function(){
    self.enAction = false;
    return self.etatPublic('ebloui', true);
  });
};
/* la louche : 1er coup le tournis, 2e coup le casque tombe, ensuite une bosse */
R._t_louche = function(o){
  if(!this.etat['sans-casque'] && !this.etat.tournis) return this._s_tournis(o);
  if(!this.etat['sans-casque']) return this._s_casque_tombe(o);
  var self = this, p = this._ou('tete', 168, 196), pr = this._recul(1);
  this._eclat(p, 24, '#ffe466');
  this._seq([{t: 0, p: {bosse: {s: 1}}}, {t: .3, p: {bosse: {s: 1.5}}, e: 'ease-out'}, {t: 1, p: {bosse: {s: 1.15}}}], 500);
  return pr;
};
R._t_colle = function(o){
  var self = this, p = this._ou('centre', 300, 330);
  for(var i = 0; i < 6; i++) this._bouffee([p[0] + hasard(-40, 40), p[1]], {r: 7, coul: '#d0e05a', op: .9, dx: hasard(-20, 20), dy: hasard(10, 40), duree: 500, delai: i * 30, s1: 1.4});
  return this._recul(.6, {cri: false}).then(function(){ return self.etatPublic('colle', true); });
};
/* l'huile : il patine sur ses pattes, manque de tomber, se rattrape (trop lourd pour se retourner) */
R._t_huile = function(o){
  var self = this, j = this._debutAction();
  var fl = this._flaque('huile', 280, 230), pat = [{t: 0, p: {}}];
  for(var i = 1; i <= 7; i++) pat.push({t: i / 9, p: {bras: {a: i % 2 ? 46 : -26}, avbras: {a: i % 2 ? 30 : -18}, brasF: {a: i % 2 ? -26 : 40}, avbrasF: {a: i % 2 ? -14 : 30}, cuisse: {a: i % 2 ? -30 : 24}, pied: {a: i % 2 ? -18 : 18}, cuisseF: {a: i % 2 ? 26 : -28},
    posture: {a: i % 2 ? -6 : 6, x: i % 2 ? -12 : 10}, tete: {a: i % 2 ? 10 : -7}, machoire: {a: -20}, oreille: {a: i % 2 ? -8 : 18}, chaine: {a: i % 2 ? 40 : -30}}, e: 'ease-in-out'});
  pat.push({t: .9, p: avec(JAMBES0, {posture: {a: -16, x: 14, y: 6}, saut: {sy: .9}, tete: {a: 20}, machoire: {a: -30}, bras: {a: 50}, brasF: {a: 46}})});
  pat.push({t: 1, p: avec(JAMBES0, {posture: {a: 0, x: 0, y: 0}, saut: {sy: 1}, tete: {a: 0}, machoire: {a: 0}, oreille: {a: 0}, chaine: {a: 0}}), e: 'cubic-bezier(.3,.6,.4,1.3)'});
  return this._seq(pat, 1500).fini.then(function(){ self._poussiere([300, SOL], 4, 1); setTimeout(function(){ self._enleverFlaque('huile'); }, 700); return self._finAction(j, 200); });
};
R._t_nuage = function(o){ return this.tousser(); };
R._t_givre = function(o){
  if(this._armure()) return this._s_armure_eclate(o);
  var self = this;
  this._cristaux(this._ou('centre', 330, 260), 12, {v: 60});
  return this._recul(.8, {cri: false}).then(function(){ return self.etatPublic('gele', true); });
};
R._t_acide = function(o){
  if(this._armure()) return this._s_armure_tombe(o);
  var p = this._ou('centre', 330, 260);
  this._bulles(p, 10, {etendue: 3});
  this._fumee(p, 4, {coul: '#a8c890'});
  return this._recul(1.2);
};
R._t_bruit = function(o){
  var self = this, p = this._ou('tete', 214, 180);
  this._ondes([p[0] - 60, p[1] + 20], 1); this._ondes([p[0] + 30, p[1]], 1);
  var j = this._debutAction();
  return this._seq([{t: 0, p: {}}, {t: .15, p: {saut: {y: -16, sy: 1.06}, oreille: {a: -30}, paupiere: {y: 14}, machoire: {a: -18}, secousse: {x: 6}, ep1: {y: -4}, plq2: {y: -4}, casque: {y: -6}}, e: 'cubic-bezier(.1,.9,.3,1)'},
    {t: .4, p: {saut: {y: 0, sy: .95}, ep1: {y: 0}, plq2: {y: 0}, casque: {y: 0}}, e: 'cubic-bezier(.6,0,.9,.6)'}, {t: .6, p: {oreille: {a: -24}, secousse: {x: -3}}},
    {t: 1, p: {saut: {y: 0, sy: 1}, oreille: {a: 0}, paupiere: {y: 0}, machoire: {a: 0}, secousse: {x: 0}}}], 900).fini.then(function(){ return self._finAction(j, 200); });
};
/* il frappe un bouclier de runes : choc, recul, son casque vibre */
R._t_bouclier = function(o){
  var self = this, p = this._ou('frappe', 112, 236), j = this._debutAction();
  this._etincelles([p[0] - 20, p[1] + 10], 14, {v: 60, ang: Math.PI, coul: ['#bff8ff', '#5fe8ff', '#ffffff']});
  this._eclat([p[0] - 24, p[1] + 10], 26, '#bff8ff', {anneau: '#5fe8ff'});
  var k = [{t: 0, p: {}}, {t: .12, p: {pos: {x: 30}, secousse: {a: 6}, tete: {a: 16, x: 8}, machoire: {a: -20}, paupiere: {y: 14}, saut: {sx: .9, sy: 1.08}}, e: 'cubic-bezier(.1,.9,.3,1)'}];
  for(var i = 0; i < 6; i++) k.push({t: .2 + i * .07, p: {casque: {a: i % 2 ? 6 - i : -6 + i}, tete: {a: i % 2 ? 6 : -4}}});
  k.push({t: .7, p: {pos: {x: 18}, secousse: {a: 0}, saut: {sx: 1, sy: 1}, casque: {a: 0}}});
  k.push({t: 1, p: {pos: {x: 0}, tete: {a: 0, x: 0}, machoire: {a: 0}, paupiere: {y: 0}}});
  return this._seq(k, 1200).fini.then(function(){ return self._finAction(j, 250); });
};
/* immunisé : ça rebondit, il nargue en tapant sur son armure */
R._t_rebond = function(o){
  var self = this, a = this._pointArmure(), p = a ? a.p : this._ou('centre', 330, 272), j = this._debutAction();
  this._ting(p, true);
  var k = [{t: 0, p: {}}, {t: .15, p: {secousse: {x: 4}}}, {t: .3, p: {secousse: {x: 0}, tete: {a: -6, x: -6}, machoire: {a: -14}, bras: {a: 40}, avbras: {a: 60}, main: {a: 40}}, e: 'ease-out'}];
  for(var i = 0; i < 3; i++){ k.push({t: .4 + i * .12, p: {main: {a: 20}, avbras: {a: 50}}, e: 'ease-in'}); k.push({t: .46 + i * .12, p: {main: {a: 40}, avbras: {a: 60}}, e: 'ease-out'}); }
  k.push({t: .82, p: {machoire: {a: -22}}}); k.push({t: 1, p: avec(JAMBES0, {tete: {a: 0, x: 0}, machoire: {a: 0}, secousse: {x: 0}})});
  [.42, .54, .66].forEach(function(t){ self._minuteur(function(){ var q = self._ou('ep1C', 262, 236); self._eclat([q[0] - 20, q[1] + 30], 9, '#ffffff', {duree: 220}); }, 1500 * t); });
  return this._seq(k, 1500).fini.then(function(){ var n = self._ou('narine', 48, 290); for(var v = 0; v < 3; v++) self._bouffee([n[0], n[1]], {r: 4, coul: '#f0eef8', op: .75, dx: -24, dy: -8, duree: 600, delai: v * 90}); return self._finAction(j, 200); });
};
R.tousser = function(){
  var self = this, j = this._debutAction(), base = this._base(), T = 2500;
  var bt = fusion(Z, base.tete), bm = fusion(Z, base.machoire);
  var k = [{t: 0, p: {}}], quintes = [[.06, 1], [.36, 1.1], [.66, 1.25]];
  quintes.forEach(function(q){
    var t = q[0], f = q[1];
    k.push({t: t + .07, p: {tete: {a: bt.a + 8 * f}, machoire: {a: bm.a - 4}, souffle: {sy: 1.05}, secousse: {x: 2, a: -1}, paupiere: {y: 6}, oreille: {a: 10}}, e: 'ease-out'});
    k.push({t: t + .12, p: {tete: {a: bt.a - 16 * f}, machoire: {a: bm.a - 28 * f}, souffle: {sy: .93, sx: 1.03}, secousse: {x: -12 * f, a: 4 * f, y: 4}, saut: {sy: .94, sx: 1.03}, paupiere: {y: 16}, oreille: {a: 26}, chaine: {a: 30}}, e: 'cubic-bezier(.1,.9,.3,1)'});
    k.push({t: t + .22, p: {tete: {a: bt.a - 4}, machoire: {a: bm.a - 6}, souffle: {sy: 1, sx: 1}, secousse: {x: 0, a: 0, y: 0}, saut: {sy: 1, sx: 1}, paupiere: {y: 10}, chaine: {a: 0}}, e: 'ease-in-out'});
  });
  k.push({t: 1, p: {tete: bt, machoire: bm, souffle: {sy: 1, sx: 1}, secousse: {x: 0, a: 0, y: 0}, saut: {sy: 1, sx: 1}, paupiere: {y: 0}, oreille: fusion(Z, base.oreille)}, e: 'ease-in-out'});
  quintes.forEach(function(q, i){
    self._minuteur(function(){
      var p = self._ou('bouche', 70, 316);
      for(var n = 0; n < 6; n++) self._bouffee([p[0] - 6, p[1] + hasard(-6, 6)], {r: hasard(8, 13) * q[1], coul: choisir(['#d8e0c4', '#c8d4b0', '#e8eedc', '#b8c8a0']), op: .85, dx: hasard(-80, -40), dy: hasard(-30, 10), duree: hasard(800, 1200), delai: n * 35, s0: .4, s1: 2.2, liser: true});
      if(i !== 1) self._goutteTombe(self._ou('oeilC', 136, 282), {coul: '#9ad8ff', dx: -6});
    }, T * (q[0] + .12));
  });
  return this._seq(k, T).fini.then(function(){ return self._finAction(j, 220); });
};
/* la peur : il sursaute (le casque saute), fait demi-tour et détale */
R.fuir = function(){
  var self = this, j = this._debutAction();
  ['ebloui', 'dos', 'colle', 'cible', 'tournis', 'gele'].forEach(function(n){ self.etat[n] = false; });
  this._eteindreEtoiles('etoiles'); this._enleverFlaque('colle'); this._enleverFlaque('huile');
  this._tous('[data-colle],[data-gel]').forEach(function(e){ self._fondu(e, 0, 200); });
  this._fondu('patteYeux', 0, 200);
  this._majPointFaible();
  this._cri(this._ou('bouche', 70, 316), 1.3);
  var ech = this._echelle(), r = this.svg.getBoundingClientRect(), d = Math.max(700, ((window.innerWidth || 960) - r.left) / ech + 400);
  return this._seq([{t: 0, p: {}},
    {t: .3, p: avec(POSES.normal, {saut: {y: -40, sy: 1.1, sx: .93}, posture: {a: 0, x: 0, y: 0}, casque: {y: -16, a: 10}, oreille: {a: -16}, machoire: {a: -26}, paupiere: {y: 0}, sourcil: {y: -6, a: 10}, tete: {a: 10}, bras: {a: 20}, avbras: {a: 30}, brasF: {a: 30}, cuisse: {a: -20}, cuisseF: {a: -16}, chaine: {a: 60}}), e: 'cubic-bezier(.15,.8,.3,1)'},
    {t: .6, p: {saut: {y: 0, sy: .9, sx: 1.05}, casque: {y: 0, a: 0}, bras: {a: -6}, avbras: {a: -6}, brasF: {a: -4}, cuisse: {a: 10}, cuisseF: {a: 8}, tete: {a: 2}, chaine: {a: -20}}, e: 'cubic-bezier(.6,0,.9,.6)'},
    {t: 1, p: {saut: {y: 0, sy: 1, sx: 1}, machoire: {a: -14}}, e: 'ease-out'}], 600).fini.then(function(){
    return self._seq([{t: 0, p: {pos: {x: 0, sx: 1}}}, {t: .5, p: {pos: {x: 8, sx: .12}}}, {t: 1, p: {pos: {x: 20, sx: -1}}}], 180).fini;
  }).then(function(){ return self._courir(300); }).then(function(){
    var poussieres = setInterval(function(){ self._poussiere(self._ou('orteils', 330, 390), 1, -1); }, 120);
    return self._seq([{t: 0, p: {pos: {x: 20, sx: -1}}}, {t: 1, p: {pos: {x: d, sx: -1}}, e: 'cubic-bezier(.45,0,.9,.7)'}], 1300).fini.then(function(){ clearInterval(poussieres); });
  }).then(function(){
    self._couperBoucles();
    self.J.pos.style.opacity = 0;
    self.el.style.visibility = 'hidden';
    self.enAction = false;
  });
};

/* =====================================================================
   F. Les moments propres : le tournis, le casque qui tombe, l'armure qui tombe (acide) ou qui éclate (givre)
   ===================================================================== */
R._bong = function(gros){
  var h = this._ou('casqueHaut', 168, 184);
  this._eclat([h[0], h[1] - 4], gros ? 40 : 32, '#ffe466', {rot: 30});
  this._etincelles([h[0], h[1]], gros ? 14 : 9, {v: 60, ang: -Math.PI / 2, ouv: Math.PI * 1.4});
  this._ondes([h[0] - 46, h[1] + 10], -1); this._ondes([h[0] + 46, h[1] + 10], 1);
};
R._s_tournis = function(o){
  var self = this, j = this._debutAction();
  this._bong(false);
  this._flash(2.2);
  this.coupsLouche = 1;
  var k = [{t: 0, p: {}}, {t: .1, p: {saut: {sy: .84, sx: 1.08, y: 4}, tete: {a: -12, y: 10}, casque: {y: 6}, machoire: {a: -20}, paupiere: {y: 16}, oreille: {a: 34}}, e: 'cubic-bezier(.1,.9,.3,1)'}];
  for(var i = 0; i < 7; i++) k.push({t: .18 + i * .07, p: {casque: {a: (i % 2 ? 1 : -1) * (14 - i * 1.6), y: 4 - i * .4}, saut: {sy: 1, sx: 1, y: 0}}, e: 'ease-in-out'});
  k.push({t: .72, p: {casque: {a: -22, x: -2, y: 12}, tete: {a: 6, y: 0}, posture: {a: 5, x: 6}, paupiere: {y: 6}}, e: 'ease-out'});
  k.push({t: 1, p: {posture: {a: -3, x: -3}, tete: {a: -4}, machoire: {a: -6}, paupiere: {y: 0}, oreille: {a: 0}}, e: 'ease-in-out'});
  this._minuteur(function(){ self._e_tournis(true); }, 450);
  return this._seq(k, 1400).fini.then(function(){ return self._finAction(j, 300); });
};
R._s_casque_tombe = function(o){
  o = o || {};
  var self = this, j = this._debutAction();
  this._bong(true);
  this._flash(2.6);
  this.coupsLouche = 2;
  return this._seq([{t: 0, p: {}}, {t: .3, p: {saut: {sy: .82, sx: 1.1, y: 6}, tete: {a: -14, y: 12}, casque: {y: 10}, machoire: {a: -24}, paupiere: {y: 16}}, e: 'cubic-bezier(.1,.9,.3,1)'},
    {t: 1, p: {saut: {sy: 1.06, sx: .96, y: -6}, tete: {a: 8, y: -4}, casque: {y: -8, a: -24}}, e: 'cubic-bezier(.2,.8,.4,1)'}], 300).fini.then(function(){
    if(j !== self.jeton) return;
    /* le casque saute de la tête, tournoie, retombe devant lui et se balance comme un bol */
    self._eteindreEtoiles('etoiles');
    self.etat.tournis = false;
    self._fondu('visiere', 0, 100);
    var d = self._detacher(['casque', 'casqueAv']), x = d.c[0] - 150, y = SOL - 58;
    self.etat['sans-casque'] = true;
    var a = self._voler(d.g, d.c, [x, y], {haut: 120, rot: 180 - d.ang - 360, duree: 1000, rebond: 14, bascule: 14, glisse: -10, onSol: function(){ self._etincelles([x, SOL - 4], 8, {v: 40}); self._poussiere([x, SOL], 3, -1); if(o.onTinte) try{ o.onTinte('casque'); }catch(e){} }});
    (self.fx.debrisCasque = self.fx.debrisCasque || []).push(d.g);
    a.finished.then(function(){
      try{ a.commitStyles(); a.cancel(); }catch(e){}
      var t0 = d.g.style.transform;
      d.g.animate([{transform: t0 + ' rotate(0deg)'}, {transform: t0 + ' rotate(10deg)'}, {transform: t0 + ' rotate(-7deg)'}, {transform: t0 + ' rotate(4deg)'}, {transform: t0 + ' rotate(-2deg)'}, {transform: t0 + ' rotate(0deg)'}], {duration: 900, easing: 'ease-out'});
      self.S.fixeArr.appendChild(d.g);
    }, function(){});
    /* la bosse pousse, il a des étoiles plein les yeux */
    self._fondu('bosse', 1, 80);
    self._fondu('spirale', 1, 100);
    self._fondu('pupille', 0, 100);
    var h = self._ou('tete', 168, 190);
    for(var i = 0; i < 5; i++) self._eclat([h[0] + hasard(-40, 40), h[1] + hasard(-30, 10)], 10, '#ffe466', {delai: i * 90, duree: 380});
    return self._seq([{t: 0, p: {bosse: {s: .1}}}, {t: .2, p: {bosse: {s: 1.5}, oreille: {a: -20}, tete: {a: 0, y: 0}, saut: {sy: 1, sx: 1, y: 0}}, e: 'cubic-bezier(.2,1.6,.4,1)'},
      {t: .35, p: {bosse: {s: 1}, tete: {a: 10}}}, {t: .5, p: {tete: {a: -10}}}, {t: .65, p: {tete: {a: 8}}}, {t: .8, p: {tete: {a: -5}}}, {t: 1, p: {tete: {a: 0}, oreille: {a: 0}}}], 1300).fini;
  }).then(function(){
    self._fondu('spirale', 0, 300);
    self._fondu('pupille', 1, 300);
    return self._finAction(j, 300);
  });
};
/* l'acide : l'armure fume, grésille, la sangle cède, les plaques tombent une à une */
R._s_armure_tombe = function(o){
  o = o || {};
  var self = this, j = this._debutAction(), restantes = ARMURE.filter(function(n){ return !self.tombees[n]; });
  if(!restantes.length){ this.enAction = false; return this._recul(.8); }
  var p = this._ou('ep1C', 262, 236);
  this._bulles(p, 6, {etendue: 2.5, taille: 1.3});
  for(var i = 0; i < 4; i++) this._bouffee([p[0] + hasard(-30, 30), p[1] - 10], {r: 6, coul: '#b8f040', op: .8, dx: hasard(-30, 30), dy: hasard(-20, 20), duree: 400, delai: i * 30, s1: 1.4});
  this._cri(this._ou('bouche', 70, 316), 1);
  this._flash(1.8);
  restantes.forEach(function(n, k){ var g = self.J[n].querySelectorAll('[data-acide]'); [].forEach.call(g, function(e){ setTimeout(function(){ self._fondu(e, .75, 500); }, 120 + k * 40); }); });
  /* ça grésille : des bulles et une fumée verdâtre sur les plaques */
  var fin = false;
  (function gresille(){
    if(fin || self.mort) return;
    var n = choisir(restantes.filter(function(n){ return !self.tombees[n]; }));
    if(n){ var c = self.A[n + 'C'] ? self._ou(n + 'C', +self.A[n + 'C'].firstElementChild.getAttribute('cx'), +self.A[n + 'C'].firstElementChild.getAttribute('cy')) : self._ou(n, 0, 0); self._bulles(c, 3, {etendue: 1.5}); if(Math.random() < .5) self._fumee(c, 1, {coul: '#b0c8a0', op: .45}); }
    setTimeout(gresille, 170);
  })();
  /* il se tortille pendant que ça ronge */
  var tort = [{t: 0, p: {}}];
  for(var t = 1; t < 8; t++) tort.push({t: t / 8, p: {secousse: {a: t % 2 ? 3 : -3, x: t % 2 ? 3 : -3}, tete: {a: t % 2 ? 8 : -6}, machoire: {a: -18}, paupiere: {y: 10}, oreille: {a: t % 2 ? 24 : 8}, cuisse: {a: t % 2 ? 6 : -4}, bras: {a: t % 2 ? -8 : 6}}, e: 'ease-in-out'});
  tort.push({t: 1, p: {secousse: {a: 0, x: 0}, tete: {a: 0}, machoire: {a: -10}, paupiere: {y: 0}, oreille: {a: 10}, cuisse: {a: 0}, bras: {a: 0}}});
  return this._seq(tort, 1100).fini.then(function(){
    if(j !== self.jeton) return;
    self._lancerBoucles();
    var ecart = 150;
    restantes.forEach(function(n, k){
      self._minuteur(function(){
        self._tomber(n, {onTinte: o.onTinte});
        self._seq([{t: 0, p: {saut: {y: 0}}}, {t: .4, p: {saut: {y: 3}}}, {t: 1, p: {saut: {y: 0}}}], 200, {ajout: true});
      }, k * ecart);
    });
    return attendreMs(restantes.length * ecart + 900);
  }).then(function(){
    fin = true;
    if(j !== self.jeton) return;
    self.etat.nu = true;
    self._tous('[data-nu]').forEach(function(e){ self._fondu(e, 1, 500); });
    self._couperBoucles();
    /* il se secoue comme un chien mouillé, libéré */
    var s = [{t: 0, p: {}}];
    for(var i = 1; i < 9; i++) s.push({t: i / 10, p: {secousse: {a: i % 2 ? 7 : -7, x: i % 2 ? 4 : -4}, tete: {a: i % 2 ? -12 : 12}, oreille: {a: i % 2 ? -20 : 24}, saut: {sy: i % 2 ? 1.03 : .98}}, e: 'ease-in-out'});
    s.push({t: 1, p: {secousse: {a: 0, x: 0}, tete: {a: 0}, oreille: {a: 0}, saut: {sy: 1}}});
    return self._seq(s, 900).fini;
  }).then(function(){ self._majPointFaible(); return self._finAction(j, 250); });
};
/* le givre : l'armure gèle, se fend, puis éclate d'un coup */
R._s_armure_eclate = function(o){
  o = o || {};
  var self = this, j = this._debutAction(), restantes = ARMURE.filter(function(n){ return !self.tombees[n]; });
  if(!restantes.length){ this.enAction = false; return this.etatPublic('gele', true); }
  var p = this._ou('centre', 330, 240);
  this._cristaux(p, 8, {v: 70});
  for(var i = 0; i < 4; i++) this._bouffee([p[0] + hasard(-60, 60), p[1] + hasard(-40, 20)], {r: 10, coul: '#e8f8ff', op: .85, dx: hasard(-20, 20), dy: -20, duree: 700, delai: i * 40, s1: 2});
  this._flash(2);
  restantes.forEach(function(n, k){ [].forEach.call(self.J[n].querySelectorAll('[data-gel]'), function(e){ setTimeout(function(){ self._fondu(e, .82, 400); }, 100 + k * 45); }); });
  /* il se raidit, tremble de froid ; les fissures apparaissent avec des petits « crac » */
  var k = [{t: 0, p: {}}, {t: .15, p: {secousse: {x: 8}, tete: {a: 8}, machoire: {a: -14}, paupiere: {y: 10}, oreille: {a: -10}}, e: 'cubic-bezier(.1,.9,.3,1)'}];
  for(var c = 0; c < 10; c++) k.push({t: .25 + c * .06, p: {secousse: {x: c % 2 ? 1.6 : -1.6, y: 0}}, e: 'linear'});
  k.push({t: 1, p: {secousse: {x: 0}}});
  [700, 950, 1150].forEach(function(t, m){
    self._minuteur(function(){
      restantes.forEach(function(n, q){ if(q % 3 === m){ [].forEach.call(self.J[n].querySelectorAll('[data-fente]'), function(e){ self._fondu(e, 1, 80); }); } });
      var c2 = self._ou('centre', 330 + hasard(-80, 80), 220 + hasard(-40, 40));
      self._cristaux(c2, 4, {v: 30, taille: .7});
      self._seq([{t: 0, p: {secousse: {x: 0}}}, {t: .3, p: {secousse: {x: 4}}}, {t: 1, p: {secousse: {x: 0}}}], 160, {ajout: true});
    }, t);
  });
  return this._seq(k, 1400).fini.then(function(){
    if(j !== self.jeton) return;
    /* CRAC : tout éclate */
    var c0 = self._ou('centre', 330, 240);
    self._eclat(c0, 60, '#e8f8ff', {anneau: '#b8e6ff', duree: 600});
    self._cristaux(c0, 8, {v: 110, taille: 1.3});
    self._flash(2.6);
    restantes.forEach(function(n, q){
      var a = self.A[n + 'C'], cc = a ? self._ou(a, +a.firstElementChild.getAttribute('cx'), +a.firstElementChild.getAttribute('cy')) : self._ou(n, 0, 0);
      self.J[n].style.opacity = 0;
      self.tombees[n] = 1;
      var nb = 1;
      for(var e = 0; e < nb; e++){
        var s = hasard(9, 16) * (/^ann/.test(n) ? .5 : 1), forme = 'M' + f1(-s) + ' ' + f1(-s * .4) + ' L ' + f1(s * .3) + ' ' + f1(-s * .8) + ' L ' + f1(s) + ' ' + f1(s * .2) + ' L ' + f1(-s * .2) + ' ' + f1(s * .6) + ' Z';
        var g = self._el(self.S.fixe, P(forme, self.D.g('#6c7584'), ' stroke-width="2"') + F(forme, self.D.glace(), ' opacity=".55"') + L('M' + f1(-s * .6) + ' ' + f1(-s * .3) + ' L ' + f1(s * .2) + ' ' + f1(-s * .5), '#ffffff', 1.2, ' opacity=".8"'));
        g.setAttribute('data-debris', '1');
        var reste = Math.random() < .5, x = cc[0] + (cc[0] - c0[0]) * hasard(.8, 1.8) + hasard(-50, 50);
        var an = self._voler(g, cc, [x, SOL - 4], {haut: hasard(40, 110), rot: hasard(-540, 540), duree: hasard(800, 1100), rebond: 5, onSol: q % 3 === 0 && e === 0 ? function(){ if(o.onTinte) try{ o.onTinte('eclat'); }catch(er){} } : null});
        (function(g, an, reste){ an.finished.then(function(){ try{ an.commitStyles(); an.cancel(); }catch(er){} if(reste) self.S.fixeArr.appendChild(g); else g.animate([{opacity: 1}, {opacity: 0}], {duration: 900, fill: 'forwards'}).finished.then(function(){ g.remove(); }); }, function(){}); })(g, an, reste);
        (self.fx.debrisArmure = self.fx.debrisArmure || []).push(g);
      }
    });
    self.etat.nu = true;
    self._tous('[data-nu]').forEach(function(e){ self._fondu(e, 1, 300); });
    if(o.onImpact) try{ o.onImpact(); }catch(er){}
    var s = [{t: 0, p: {}}, {t: .1, p: {saut: {y: -20, sy: 1.08}, oreille: {a: -24}, machoire: {a: -26}}, e: 'cubic-bezier(.1,.9,.3,1)'}];
    for(var i = 1; i < 8; i++) s.push({t: .2 + i * .08, p: {secousse: {a: i % 2 ? 6 : -6, x: i % 2 ? 4 : -4}, tete: {a: i % 2 ? -10 : 10}, saut: {y: 0, sy: 1}}, e: 'ease-in-out'});
    s.push({t: 1, p: {secousse: {a: 0, x: 0}, tete: {a: 0}, oreille: {a: 0}, machoire: {a: 0}}});
    return self._seq(s, 1300).fini;
  }).then(function(){
    var b = self._ou('bouche', 70, 316);
    for(var v = 0; v < 3; v++) self._bouffee([b[0] - 4, b[1]], {r: 4, coul: '#eef8ff', op: .7, dx: -20, dy: -6, duree: 800, delai: v * 200, s1: 2.4});
    self._majPointFaible();
    return self._finAction(j, 300);
  });
};

/* =====================================================================
   G. La mort par critique : il enfle, l'armure saute, il éclate en brume noire ; restent cendres, os et ferraille
   ===================================================================== */
R.exploser = function(scene){
  var self = this, j = this._debutAction(), boomOk, boomP = new Promise(function(r){ boomOk = r; });
  if(this.etat.brule) this._e_brule(false);
  this._pulser('oeilRage', false);
  this._eteindreEtoiles('etoiles');
  clearTimeout(this.fx.vapeur); clearTimeout(this.fx.rougeT);
  var k = [{t: 0, p: {}}];
  for(var i = 1; i <= 10; i++) k.push({t: i / 11, p: {saut: {sx: 1 + i * .018, sy: 1 + i * .026, y: -i}, secousse: {x: i % 2 ? 2 + i * .3 : -2 - i * .3, a: i % 2 ? 1.5 : -1.5}, oeil: {s: 1 + i * .035}, machoire: {a: -i * 3}, paupiere: {y: 0}, ep1: {y: i % 2 ? -2 : 1}, plq2: {y: i % 2 ? 1 : -2}, casque: {y: i % 2 ? -3 : 0}}, e: 'linear'});
  k.push({t: 1, p: {saut: {sx: 1.22, sy: 1.3, y: -12}}, e: 'ease-in'});
  /* de la brume noire s'échappe déjà de sous les plaques */
  [150, 320, 480, 620].forEach(function(t){ self._minuteur(function(){ var c = self._ou('centre', 330 + hasard(-90, 90), 220 + hasard(-60, 40)); self._bouffee(c, {r: 12, coul: '#1a1222', op: .85, dx: hasard(-20, 20), dy: -30, duree: 600, s1: 2.2}); }, t); });
  var p = this._seq(k, 800).fini.then(function(){
    var boum = self._boum(scene, {ref: 'centre', x: 330, y: 272, u: 1.15, extra: function(el, cx, cy, u, T){
      /* des touffes de poil */
      for(var t = 0; t < 4; t++){
        var at = -Math.PI * hasard(.05, .95), vt = hasard(50, 120) * u, rt = hasard(-400, 400);
        el('<path d="M0 0 Q ' + f1(4 * u) + ' ' + f1(-6 * u) + ' ' + f1(10 * u) + ' ' + f1(-8 * u) + ' Q ' + f1(5 * u) + ' ' + f1(-2 * u) + ' ' + f1(9 * u) + ' ' + f1(2 * u) + ' Q ' + f1(3 * u) + ' ' + f1(u) + ' 0 0 Z" fill="' + choisir(['#5c4a57', '#4a3a46', '#8f7686']) + '" stroke="#24182e" stroke-width="' + f1(u) + '"/>').animate([{transform: T(cx, cy, 1, 0), opacity: 1},
          {offset: .45, transform: T(cx + Math.cos(at) * vt, cy + Math.sin(at) * vt, 1, rt * .5), opacity: 1}, {transform: T(cx + Math.cos(at) * vt * 1.4, cy + Math.sin(at) * vt * .3 + 50 * u, 1, rt), opacity: 0}], {duration: hasard(1300, 1900), easing: 'cubic-bezier(.2,.6,.6,1)', fill: 'forwards'});
      }
    }});
    boomOk();
    /* l'armure qui restait est projetée ; elle tinte et retombe autour */
    /* les gros morceaux d'armure encore en place sont projetés (les petits disparaissent dans la brume) */
    var restantes = ['ep1', 'plq2', 'cuissarde'].filter(function(n){ return !self.tombees[n]; });
    if(!self.etat['sans-casque']) restantes.unshift('casque+casqueAv');
    var c0 = self._ou('centre', 330, 272);
    restantes.forEach(function(n, q){
      var d = self._detacher(n.split('+')), dx = d.c[0] - c0[0], x = d.c[0] + dx * hasard(.8, 1.6) + hasard(-60, 60);
      x = Math.max(-40, Math.min(600, x));
      var plat = Math.random() < .6, bb = d.bb, basY = plat ? bb.y + bb.height : -bb.y;
      var an = self._voler(d.g, d.c, [x, SOL - Math.max(4, basY * .8)], {haut: hasard(60, 150), rot: (plat ? 0 : 180) - d.ang + choisir([-360, 360, 720]) + hasard(-15, 15), duree: hasard(1000, 1400), rebond: 10, glisse: hasard(-14, 14),
        onSol: function(){ self._etincelles([x, SOL - 4], 5, {v: 34, grav: 10}); }});
      (function(g, an){ an.finished.then(function(){ try{ an.commitStyles(); an.cancel(); }catch(e){} self.S.fixeArr.appendChild(g); }, function(){}); })(d.g, an);
    });
    /* des os projetés, qui retombent près du tas */
    var OS = function(l, w){ return P('M' + f1(-l) + ' ' + f1(-w) + ' L ' + f1(l) + ' ' + f1(-w) + ' C ' + f1(l + 6) + ' ' + f1(-w - 7) + ' ' + f1(l + 14) + ' ' + f1(-w - 3) + ' ' + f1(l + 10) + ' 0 C ' + f1(l + 14) + ' ' + f1(w + 3) + ' ' + f1(l + 6) + ' ' + f1(w + 7) + ' ' + f1(l) + ' ' + f1(w) + ' L ' + f1(-l) + ' ' + f1(w) + ' C ' + f1(-l - 6) + ' ' + f1(w + 7) + ' ' + f1(-l - 14) + ' ' + f1(w + 3) + ' ' + f1(-l - 10) + ' 0 C ' + f1(-l - 14) + ' ' + f1(-w - 3) + ' ' + f1(-l - 6) + ' ' + f1(-w - 7) + ' ' + f1(-l) + ' ' + f1(-w) + ' Z', '#efe6d0', ' stroke-width="2.4"') + L('M' + f1(-l + 2) + ' ' + f1(-w * .3) + ' L ' + f1(l - 2) + ' ' + f1(-w * .3), '#ffffff', 1.4, ' opacity=".7"'); };
    [[24, 3.2, -90, 10], [16, 2.6, 70, -20], [20, 3, -40, -130]].forEach(function(o, q){
      var g = self._el(self.S.fixe, OS(o[0], o[1])), x = c0[0] + o[2] + hasard(-10, 10);
      var an = self._voler(g, c0, [x, SOL - o[1] - 3], {haut: hasard(80, 130), rot: o[3] + choisir([-360, 360]), duree: hasard(1100, 1400), rebond: 6, delai: q * 40});
      an.finished.then(function(){ try{ an.commitStyles(); an.cancel(); }catch(e){} self.S.fixeArr.appendChild(g); }, function(){});
    });
    /* le tas de cendre, à sa place */
    var tas = self._el(self.S.fixeArr, '<ellipse cx="310" cy="392" rx="96" ry="12" fill="#000" opacity=".35"/>' +
      P('M210 393 C 222 362 266 336 312 336 C 358 336 398 362 410 393 Z', self.G.cendre1) +
      P('M244 393 C 254 374 286 360 314 362 C 342 364 366 376 374 393 Z', self.G.cendre2, ' stroke-width="1.6"') +
      F([[250, 378], [282, 356], [326, 352], [360, 372], [300, 384], [270, 388], [384, 386], [228, 388]].map(function(q){ return rond(q[0], q[1], 3); }).join(''), '#3a3440', ' opacity=".7"') +
      '<g class="' + PX + '-lueur">' + F([[296, 346], [336, 354], [262, 366]].map(function(q){ return rond(q[0], q[1], 2); }).join(''), '#ff9a40') + '</g>' +
      L('M232 366 C 260 346 296 338 330 342', '#e0dae8', 2.2, ' opacity=".7"') +
      '<g transform="translate(330 362) rotate(-20)">' + OS(18, 3) + '</g>');
    tas.animate([{opacity: 0, transform: 'translate(310px,392px) scale(.3) translate(-310px,-392px)'}, {offset: .55, opacity: 0}, {opacity: 1, transform: 'translate(310px,392px) scale(1) translate(-310px,-392px)'}], {duration: 1500, easing: 'ease-out', fill: 'forwards'});
    (function fumet(n){ if(n <= 0) return; self._bouffee([310 + hasard(-30, 30), 356], {r: 7, coul: '#5a5260', op: .5, dx: hasard(-6, 14), dy: -56, duree: 1700, s1: 2.4}); setTimeout(function(){ fumet(n - 1); }, 420); })(9);
    self._couperBoucles();
    self.mort = true;
    ARMURE.concat(['casque', 'casqueAv']).forEach(function(n){ self.J[n].style.opacity = 0; });
    self.J.saut.style.opacity = 0;
    self._fondu('lueurRouge', 0, 300); self._pulser('lueurRouge', false);
    return boum.fini;
  });
  p.boom = boomP;
  return p;
};

/* =====================================================================
   H. L'enregistrement
   ===================================================================== */
var INFO = {
  id: 'ratcuir', nom: 'Rat cuirassé', rang: 'normal', pv: 70, attaque: 'coup de tête 14',
  cadre: {w: 220, h: 150}, sol: .889, vole: false, places: 1,
  attaques: ['coup-de-tete'],
  specials: ['tournis', 'casque-tombe', 'armure-tombe', 'armure-eclate'],
  etats: ['enrage', 'brule', 'colle', 'ebloui', 'gele', 'ouvert', 'dos', 'cible', 'nu', 'sans-casque', 'rougeoie', 'tournis']
};
RatCuir.prototype.info = INFO;
global.BETES = global.BETES || {};
global.BETES[ID] = {
  info: INFO,
  creer: function(conteneur, options){ return acteur(new RatCuir(conteneur, options)); }
};
})(typeof window !== 'undefined' ? window : this);
