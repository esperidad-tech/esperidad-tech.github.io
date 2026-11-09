/* gardien-anime.js — le Gardien de rouille, l'élite animé de l'atelier des Fondateurs (Les Enquêteurs de Brumeval, donjon du puits)
   Module autonome, sans dépendance. Il injecte son propre CSS (préfixe .bt-gardien-). Il ne joue aucun son.
   Contrat commun : jeu/donjon/anim/betes/CONTRAT.md. Dessin validé : bestiaire/betes/08-gardien.js (vieil automate en fer
   rouillé, plaque ronde de bronze sur la poitrine, cœur de runes derrière, mousse, racines, lierre, cheminées).

     var g = BETES.gardien.creer(conteneur);   // le SVG remplit le conteneur (320 × 260), il regarde à gauche

   Actions (Promise, résolue quand il est revenu à son attente) :
     entrer(o)                 il se réveille : les runes s'allument une à une, la vapeur fuse des joints, il se redresse
                               en grinçant, ses yeux s'allument, puis il avance de deux pas lourds.
                               o.onPas(n) à chaque pas (n = 1, 2) : le son et la secousse du sol (le moteur s'en charge).
     attaquer('poing', o)      il arme son bras au-dessus de la tête (lent, lourd), frappe en avant vers o.vers {x, y}
                               (écran), o.onImpact() au coup, puis un gros recul de vapeur. La Promise a .impact.
                               Enragé : il frappe plus vite.
     touche(type, o)           fleche, fleche-argent, dague, louche : sur le fer fermé, ça ricoche en étincelles ;
                               sur le cœur ouvert, ça le touche. fleche-lourde : grosses étincelles et une bosse dans le fer.
                               rebond : immunisé, ça ricoche (o.arme : 'fleche', 'dague' ou 'louche'), il tourne LENTEMENT
                               la tête vers le tireur, ses yeux s'allument, il souffle de mépris.
                               acide (plaque fermée) -> special('plaque-tombe') ; givre (plaque fermée) -> special('plaque-eclate'),
                               sinon état « gele » ; lumiere : plaque fermée = PIÈGE (ses runes s'enflamment en rouge : état
                               « enrage ») ; plaque ouverte = son cœur est ébloui, il s'emballe (état « ebloui »).
                               feu -> état « rougeoie » (il chauffe, se renforce). colle -> état « colle » (le pied avant collé).
                               huile : il glisse et se rattrape sans tomber. nuage -> tousser(). bruit : il sursaute, ses
                               plaques claquent. bouclier : il frappe un bouclier de runes, son bras rebondit, il s'arrête net,
                               puis sa plaque s'entrouvre (special('entrouvert'), état « plaque-entrouverte »). coup, brulure.
     special(nom, o)           'plaque-tombe' (acide : la rouille fond, grésille, la plaque se descelle et pend : état
                               « plaque-ouverte »), 'plaque-eclate' (givre : elle gèle, se fend et éclate : état « sans-plaque »),
                               'entrouvert' (la plaque s'entrouvre un instant : état « plaque-entrouverte »).
                               o.onTinte(morceau) quand un morceau de fer touche le sol.
     tousser()                 il tousse de la vapeur, trois fois, lentement
     mourir() / fuir()         une machine ne fuit pas : il ralentit, ses runes s'éteignent une à une, il s'agenouille,
                               puis s'effondre en pièces détachées dans un nuage de rouille ; les pièces restent au sol.
     exploser(scene)           le critique : il s'emballe, puis explose (brume noire, onde de choc), engrenages et boulons
                               projetés rebondissent et RESTENT au sol avec la carcasse fumante. La Promise a .boom.
   États (se cumulent, etat(nom, on) renvoie une Promise) :
     enrage (runes rouges, vapeur rouge, il frappe plus vite), brule (la mousse brûle), colle, ebloui (cœur déréglé,
     étoiles, bras devant les yeux), gele, ouvert (le cœur de runes à nu brille et palpite), dos (renversé), cible,
     et les siens : plaque-ouverte (elle pend), plaque-entrouverte, sans-plaque, rougeoie (le fer chauffé au rouge).
   attendre(), arreter(), etatCourant(), ancre(nom) : tete, pointfaible (le cœur), centre, bouche, pieds, haut.

   Pour la fluidité sur tablette (exigence de Romain, 9 novembre, 10 h 48 — CONTRAT.md §4 bis) :
   - aucun filtre (ni SVG, ni CSS), aucun mélange ; les lueurs des runes et la vapeur sont des dégradés et des traits
     larges à opacité fixe ; la rouille est dessinée (taches en deux couches), pas floutée ;
   - chaque pièce <g data-j="nom"> a un contenu FIXE et n'est animée qu'en transform (pivot ramené à 0,0) ;
   - les états sont des variantes pré-dessinées <g data-j="v-nom"> qu'on montre ou cache (opacité, puis visibility) ;
   - les boucles autonomes (engrenages, pistons, battement du cœur, étincelle du fil, étoiles, flammes) animent des
     pièces <g data-j="x-nom"> ;
   - les petites formes n'ont ni opacity ni transform (fill-opacity / stroke-opacity, géométrie des runes déjà tournée) ;
   - au plus 24 particules à la fois, retirées du DOM à la fin. Mesure : perf.py (processeur ralenti ×6). */
(function(global){
'use strict';
var ID = 'gardien', PX = 'bt-gardien', NS = 'http://www.w3.org/2000/svg';
var O = '#24182e', LUNE = '#bfe8ff', CYAN = '#9ffaff', CYANF = '#1ec8ff', ROUGE = '#ff3a1a', ROUGEC = '#ffd8a8', NUM = 0;

/* =====================================================================
   1. Petits outils de dessin (ceux de la fiche du bestiaire, sans filtre)
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
function fo(v){ return ' fill-opacity="' + v + '"'; }
function so(v){ return ' stroke-opacity="' + v + '"'; }
/* des cercles réunis dans un seul chemin (moins d'éléments à dessiner) */
function rond(x, y, r){ return 'M' + f1(x - r) + ' ' + f1(y) + ' a ' + f1(r) + ' ' + f1(r) + ' 0 1 0 ' + f1(r * 2) + ' 0 a ' + f1(r) + ' ' + f1(r) + ' 0 1 0 ' + f1(-r * 2) + ' 0 Z '; }
function ovale(x, y, rx, ry){ return 'M' + f1(x - rx) + ' ' + f1(y) + ' a ' + f1(rx) + ' ' + f1(ry) + ' 0 1 0 ' + f1(rx * 2) + ' 0 a ' + f1(rx) + ' ' + f1(ry) + ' 0 1 0 ' + f1(-rx * 2) + ' 0 Z '; }
function ell(cx, cy, rx, ry){ return 'M' + f1(cx - rx) + ' ' + f1(cy) + ' A ' + rx + ' ' + ry + ' 0 1 0 ' + f1(cx + rx) + ' ' + f1(cy) + ' A ' + rx + ' ' + ry + ' 0 1 0 ' + f1(cx - rx) + ' ' + f1(cy) + ' Z'; }
function bez(p, t){ var u = 1 - t; return [0, 1].map(function(i){ return u * u * u * p[0][i] + 3 * u * u * t * p[1][i] + 3 * u * t * t * p[2][i] + t * t * t * p[3][i]; }); }
/* une courbe douce par des points (Catmull-Rom), comme la fiche */
function crs(Pp){
  var s = '', n = Pp.length;
  for(var i = 0; i < n - 1; i++){
    var p0 = Pp[Math.max(i - 1, 0)], p1 = Pp[i], p2 = Pp[i + 1], p3 = Pp[Math.min(i + 2, n - 1)];
    s += ' C ' + pt([p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]) + ' ' + pt([p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]) + ' ' + pt(p2);
  }
  return s;
}
function cote(pts, ws){
  var n = pts.length, Gc = [], Dc = [];
  for(var i = 0; i < n; i++){
    var a = pts[Math.max(i - 1, 0)], b = pts[Math.min(i + 1, n - 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy) || 1;
    var nx = -dy / l, ny = dx / l, w = ws[i] / 2;
    Gc.push([pts[i][0] + nx * w, pts[i][1] + ny * w]); Dc.push([pts[i][0] - nx * w, pts[i][1] - ny * w]);
  }
  return {G: Gc, D: Dc};
}
/* un membre en tube, bouts arrondis (fiche) */
function tube(pts, ws, plat){
  var c = cote(pts, ws), n = pts.length, Dr = c.D.slice().reverse(), k = plat || .8;
  return 'M' + pt(c.G[0]) + crs(c.G) + ' A ' + f1(ws[n - 1] / 2) + ' ' + f1(ws[n - 1] / 2 * k) + ' 0 0 0 ' + pt(Dr[0]) + crs(Dr) + ' A ' + f1(ws[0] / 2) + ' ' + f1(ws[0] / 2 * k) + ' 0 0 0 ' + pt(c.G[0]) + ' Z';
}
/* réécrire un chemin (commandes M L Q C A absolues) avec translate(x y) rotate(r) scale(s) déjà appliqués :
   les runes et les feuilles n'ont plus de transform à elles (plus léger à afficher) et se réunissent en un seul chemin */
function cuireChemin(d, x, y, r, s){
  var ca = Math.cos(r * Math.PI / 180) * s, sa = Math.sin(r * Math.PI / 180) * s;
  function T(px, py){ return f1(x + px * ca - py * sa) + ' ' + f1(y + px * sa + py * ca); }
  var tok = d.match(/[MLQCAZ]|-?\d*\.?\d+/g), out = '', i = 0, cmd = 'M', N = {M: 2, L: 2, Q: 4, C: 6, A: 7};
  while(i < tok.length){
    if(/[A-Z]/.test(tok[i])){ cmd = tok[i]; i++; out += ' ' + cmd; if(cmd === 'Z') continue; }
    var n = N[cmd], v = tok.slice(i, i + n).map(Number);
    i += n;
    if(cmd === 'A') out += ' ' + f1(v[0] * s) + ' ' + f1(v[1] * s) + ' ' + f1(v[2] + r) + ' ' + v[3] + ' ' + v[4] + ' ' + T(v[5], v[6]);
    else for(var k = 0; k < n; k += 2) out += ' ' + T(v[k], v[k + 1]);
  }
  return out.trim() + ' ';
}
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
/* un engrenage centré en (0,0) : dents, moyeu, trous (les trous tournent avec lui, on voit qu'il tourne) */
function rouageD(r, n, rot){
  var p = '', da = Math.PI / n;
  for(var i = 0; i < n; i++){
    var a = (rot || 0) + i / n * Math.PI * 2;
    [[a - da, r * .8], [a - da * .55, r], [a + da * .45, r], [a + da * .9, r * .8]].forEach(function(q, j){ p += (i || j ? ' L ' : 'M') + f1(Math.cos(q[0]) * q[1]) + ' ' + f1(Math.sin(q[0]) * q[1]); });
  }
  return p + ' Z';
}
/* une rotation d'angle a autour du point Q, exprimée autour du pivot Pv : {a, x, y} */
function rotAutour(a, Q, Pv){
  var r = a * Math.PI / 180, c = Math.cos(r), s = Math.sin(r), dx = Q[0] - Pv[0], dy = Q[1] - Pv[1];
  return {a: a, x: dx - (dx * c - dy * s), y: dy - (dx * s + dy * c)};
}
function rotP(p, a, c){ var r = a * Math.PI / 180, co = Math.cos(r), si = Math.sin(r), dx = p[0] - c[0], dy = p[1] - c[1]; return [c[0] + dx * co - dy * si, c[1] + dx * si + dy * co]; }

/* Les pièces articulées : un <g data-j> dont le pivot est ramené à (0,0). Contenu FIXE : on n'anime que transform et opacity. */
function piv(nom, x, y, c){ return '<g transform="translate(' + x + ' ' + y + ')"><g data-j="' + nom + '"><g transform="translate(' + (-x) + ' ' + (-y) + ')">' + c + '</g></g></g>'; }
/* une variante pré-dessinée : cachée (opacité 0 et visibility hidden), montrée par _fondu */
function vari(nom, c, op, x, y){
  var a = ' data-j="v-' + nom + '" opacity="' + (op || 0) + '"' + (op ? '' : ' visibility="hidden"');
  if(x == null) return '<g' + a + '>' + c + '</g>';
  return '<g transform="translate(' + x + ' ' + y + ')"><g' + a + '><g transform="translate(' + (-x) + ' ' + (-y) + ')">' + c + '</g></g></g>';
}
function slot(nom){ return '<g data-slot="' + nom + '"></g>'; }
/* un petit repère caché, suivi par ancre() (getBoundingClientRect) et par les effets */
function repere(nom, x, y){ return '<circle data-a="' + nom + '" cx="' + x + '" cy="' + y + '" r="1.5" fill="#000" fill-opacity="0"/>'; }

/* les dégradés et découpes d'une bête (identifiants uniques par bête) */
function Defs(u){ this.u = u; this.n = 0; this.l = []; this.cache = {}; }
Defs.prototype.id = function(){ return this.u + (++this.n); };
Defs.prototype.stops = function(st){ return st.map(function(t){ return '<stop offset="' + t[0] + '" stop-color="' + t[1] + '" stop-opacity="' + (t[2] == null ? 1 : t[2]) + '"/>'; }).join(''); };
/* lumière en haut à droite */
Defs.prototype.g = function(c, fort){
  fort = fort || 1;
  var k = 'g' + c + fort;
  if(this.cache[k]) return this.cache[k];
  var id = this.id();
  this.l.push('<linearGradient id="' + id + '" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + clair(c, .26 * fort) + '"/><stop offset=".45" stop-color="' + c + '"/><stop offset="1" stop-color="' + sombre(c, .42 * fort) + '"/></linearGradient>');
  return (this.cache[k] = 'url(#' + id + ')');
};
Defs.prototype.halo = function(c0, c1){ var k = 'h' + c0 + c1; if(this.cache[k]) return this.cache[k]; var id = this.id(); this.l.push('<radialGradient id="' + id + '"><stop offset="0" stop-color="' + c0 + '"/><stop offset=".45" stop-color="' + c1 + '" stop-opacity=".6"/><stop offset="1" stop-color="' + c1 + '" stop-opacity="0"/></radialGradient>'); return (this.cache[k] = 'url(#' + id + ')'); };
/* une tache douce : remplace les flous (un dégradé, rien à recalculer quand ça bouge) */
Defs.prototype.doux = function(c, op){
  op = op == null ? 1 : op;
  var k = 'd' + c + op;
  if(this.cache[k]) return this.cache[k];
  var id = this.id(), h = '<radialGradient id="' + id + '"><stop offset="0" stop-color="' + c + '" stop-opacity="' + op + '"/><stop offset=".5" stop-color="' + c + '" stop-opacity="' + f1(op * .5) + '"/><stop offset="1" stop-color="' + c + '" stop-opacity="0"/></radialGradient>';
  this.l.push(h);
  if(this.vivant) this.vivant.insertAdjacentHTML('beforeend', h);
  return (this.cache[k] = 'url(#' + id + ')');
};
Defs.prototype.rad = function(st, cx, cy, r){ var id = this.id(); this.l.push('<radialGradient id="' + id + '" cx="' + cx + '" cy="' + cy + '" r="' + r + '">' + this.stops(st) + '</radialGradient>'); return 'url(#' + id + ')'; };
Defs.prototype.lin = function(st, x1, y1, x2, y2){ var id = this.id(); this.l.push('<linearGradient id="' + id + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '">' + this.stops(st) + '</linearGradient>'); return 'url(#' + id + ')'; };
Defs.prototype.clip = function(d, eo){ var id = this.id(); this.l.push('<clipPath id="' + id + '"><path d="' + d + '"' + (eo ? ' clip-rule="evenodd"' : '') + '/></clipPath>'); return ' clip-path="url(#' + id + ')"'; };

/* =====================================================================
   2. Le CSS (injecté une seule fois, préfixé). Aucune animation CSS dans les pièces.
   ===================================================================== */
var CSS = ('.PX{position:relative;width:100%;height:100%}' +
  '.PX>svg{width:100%;height:100%;overflow:visible;display:block}' +
  '.PX [data-j]{transform-box:view-box;transform-origin:0 0}' +
  '.PX-scene-fx{position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;pointer-events:none;z-index:6}').replace(/PX/g, PX);
function injecterCSS(){
  if(document.getElementById(PX + '-css')) return;
  var s = document.createElement('style'); s.id = PX + '-css'; s.textContent = CSS; document.head.appendChild(s);
}

/* =====================================================================
   3. Le moteur : des poses-clés jouées par la Web Animations API (transform et opacity seulement)
   ===================================================================== */
var Z = {x: 0, y: 0, a: 0, sx: 1, sy: 1};
var PARTICULES_MAX = 24;
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
function copie(o){ var r = {}; for(var k in o) r[k] = o[k]; return r; }
function avec(a, b){ var o = copie(a); for(var k in b) o[k] = b[k]; return o; }
function oter(g){ return function(){ g.remove(); }; }

function Gardien(conteneur, options){
  injecterCSS();
  this.c = conteneur;
  this.o = options || {};
  var D = new Defs(PX + (++NUM) + '_');
  this.D = D;
  this.G = {flash: D.doux('#fff8e0', .85), lumiere: D.doux('#fff4b0', .9), cyan: D.doux('#bff8ff', .9), braise: D.doux('#ffb040', 1),
    vapeur: D.doux('#eef2f8', .95), vapeurR: D.doux('#ff9a86', .95), rouille: D.doux('#b8642e', .95), rouille2: D.doux('#7a3a1e', .95), fumee: D.doux('#6a6278', .9),
    feu1: D.lin([[0, '#ff4a10'], [.6, '#ff8a1a'], [1, '#ffc040', .8]], 0, 1, 0, 0), feu2: D.lin([[0, '#ffd040'], [1, '#fff8c0']], 0, 1, 0, 0),
    huile: D.lin([[0, '#1a1428'], [.3, '#3a2a5a'], [.45, '#2a5a6a'], [.6, '#5a6a2a'], [.75, '#6a3a5a'], [1, '#1a1428']], 0, 0, 1, 0)};
  var art = dessinerGardien.call(this, D);
  var div = document.createElement('div');
  div.className = PX;
  div.innerHTML = '<svg xmlns="' + NS + '" viewBox="' + VB.join(' ') + '" preserveAspectRatio="xMidYMax meet"><defs>' + D.l.join('') + '</defs>' + art +
    '<g data-reperes><circle cx="0" cy="0" r="1" fill-opacity="0"/><circle cx="100" cy="100" r="1" fill-opacity="0"/></g></svg>';
  conteneur.appendChild(div);
  this.el = div;
  this.svg = div.querySelector('svg');
  D.vivant = this.svg.querySelector('defs');
  var self = this;
  /* trois sortes de pièces : J (animées en transform par les poses), V (variantes : opacité seule), K (boucles autonomes) */
  this.J = {}; this.V = {}; this.K = {}; this.S = {}; this.A = {};
  [].forEach.call(this.svg.querySelectorAll('[data-j]'), function(e){
    var n = e.getAttribute('data-j'), r = n.indexOf('v-') === 0 ? self.V : (n.indexOf('x-') === 0 ? self.K : self.J);
    if(r !== self.J) n = n.slice(2);
    (r[n] = r[n] || []).push(e);
  });
  [].forEach.call(this.svg.querySelectorAll('[data-slot]'), function(e){ self.S[e.getAttribute('data-slot')] = e; });
  [].forEach.call(this.svg.querySelectorAll('[data-a]'), function(e){ self.A[e.getAttribute('data-a')] = e; });
  this.marques = this.svg.querySelector('[data-reperes]').children;
  this.v = {};
  this.etat = {enrage: false, brule: false, colle: false, ebloui: false, gele: false, ouvert: false, dos: false, cible: false,
    'plaque-ouverte': false, 'plaque-entrouverte': false, 'sans-plaque': false, rougeoie: false};
  this.attente = true;
  this.jeton = 0;
  this.enAction = false;
  this.boucles = [];
  this.minuteurs = [];
  this.boucX = {};
  this.fx = {};
  this.debris = [];
  this.bosses = 0;
  this.mort = false;
  this.vitesse = 1;
  this.allume = true;
  this.eteintes = {};
  this._lancerX();
  this._reprendre(0);
}
var R = Gardien.prototype;

/* lire la pose actuelle d'une pièce (même au milieu d'une animation) */
R._lire = function(n){
  var el = this.J[n][0], ref = this.v[n] || Z, t = getComputedStyle(el).transform;
  if(!t || t === 'none') return fusion(Z);
  var m = t.match(/matrix\(([^)]+)\)/);
  if(!m) return fusion(ref);
  var v = m[1].split(',').map(parseFloat), sx = Math.hypot(v[0], v[1]), ang = Math.atan2(v[1], v[0]) * 180 / Math.PI, sy = (v[0] * v[3] - v[1] * v[2]) / (sx || 1);
  while(ang - ref.a > 180) ang -= 360;
  while(ang - ref.a < -180) ang += 360;
  return {x: v[4], y: v[5], a: ang, sx: sx, sy: sy};
};
/* figer : on lit les poses des pièces qui bougent, on coupe leurs animations, on garde la pose */
R._figer = function(noms){
  var self = this, vals = {};
  noms = noms || Object.keys(this.J);
  noms.forEach(function(n){ if(self.J[n][0].getAnimations().length) vals[n] = self._lire(n); });
  noms.forEach(function(n){
    if(!vals[n]) return;
    self.J[n].forEach(function(el){ el.getAnimations().forEach(function(a){ a.cancel(); }); el.style.transform = tf(vals[n]); });
    self.v[n] = vals[n];
  });
};
/* jouer une suite de poses-clés.  cles = [{t:0..1, p:{piece:{x,y,a,sx,sy,s}}, e:'easing'}]
   o.boucle : en boucle ; o.ajout : s'ajoute par-dessus (composite add) ; o.vitesse ; o.delai ; o.depuis */
R._seq = function(cles, duree, o){
  o = o || {};
  var self = this, noms = {}, anims = [];
  cles.forEach(function(k){ for(var n in k.p) noms[n] = 1; });
  Object.keys(noms).forEach(function(n){
    var els = self.J[n];
    if(!els) return;
    var cur = o.ajout ? fusion(Z) : (o.depuis ? fusion(Z, o.depuis[n]) : (self.v[n] && !els[0].getAnimations().length ? fusion(self.v[n]) : self._lire(n))), frames = [];
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
    els.forEach(function(el){
      var a = el.animate(frames, {duration: duree, iterations: o.boucle ? Infinity : 1, fill: o.ajout ? 'none' : 'forwards', composite: o.ajout ? 'add' : 'replace', delay: o.delai || 0});
      a.playbackRate = (o.vitesse || 1);
      if(o.boucle) self.boucles.push(a);
      else if(!o.ajout) a.finished.then(function(){ try{ a.commitStyles(); a.cancel(); }catch(e){} }, function(){});
      anims.push(a);
    });
  });
  return {anims: anims, fini: Promise.all(anims.map(fini))};
};
/* aller doucement vers une pose (les pièces absentes reviennent au repos si tout) */
R._allerA = function(pose, duree, e, tout){
  var p = {}, n, self = this;
  if(tout) for(n in this.J){ var v = self.v[n]; if(!v || v.x || v.y || v.a || v.sx !== 1 || v.sy !== 1 || self.J[n][0].getAnimations().length) p[n] = fusion(Z); }
  for(n in pose) p[n] = fusion(Z, pose[n]);
  if(!Object.keys(p).length) return Promise.resolve();
  return this._seq([{t: 1, p: p, e: e || 'cubic-bezier(.3,.7,.3,1)'}], Math.max(1, duree)).fini;
};
/* un point (un repère, ou x,y dans une pièce) ramené dans le repère « monde » (celui du dessin, qui ne bouge pas) */
R._ou = function(ref, x, y){
  var el = typeof ref === 'string' ? (this.A[ref] || (this.J[ref] && this.J[ref][0]) || this.S[ref]) : ref;
  if(x == null && el.getAttribute('data-a')){ x = +el.getAttribute('cx'); y = +el.getAttribute('cy'); }
  var m = el.getCTM(), w = this.S.monde.getCTM(), p = this.svg.createSVGPoint();
  p.x = x || 0; p.y = y || 0;
  p = p.matrixTransform(m).matrixTransform(w.inverse());
  return [p.x, p.y];
};
R._pt = function(nom){ return this._ou(nom); };
/* du repère « monde » à l'écran, et retour (deux marques fixes donnent l'échelle et le décalage) */
R._marques = function(){
  var a = this.marques[0].getBoundingClientRect(), b = this.marques[1].getBoundingClientRect(), ax = a.left + a.width / 2, ay = a.top + a.height / 2;
  return {ax: ax, ay: ay, kx: (b.left + b.width / 2 - ax) / 100, ky: (b.top + b.height / 2 - ay) / 100};
};
R._versEcran = function(p){ var m = this._marques(); return {x: m.ax + p[0] * m.kx, y: m.ay + p[1] * m.ky}; };
R._depuisEcran = function(q){ var m = this._marques(); return [(q.x - m.ax) / (m.kx || 1), (q.y - m.ay) / (m.ky || 1)]; };
/* combien de pixels écran pour une unité du dessin */
R._echelle = function(){ var r = this.svg.getBoundingClientRect(); return (r.width || 1) / VB[2]; };
R._minuteur = function(f, ms){ var self = this, id = setTimeout(function(){ var i = self.minuteurs.indexOf(id); if(i >= 0) self.minuteurs.splice(i, 1); f(); }, ms); this.minuteurs.push(id); return id; };
R._couperMinuteurs = function(){ this.minuteurs.forEach(clearTimeout); this.minuteurs = []; };
R._couperBoucles = function(){
  this._couperMinuteurs();
  this._figer();
  this.boucles = [];
};
/* un élément SVG créé à la volée (particules, débris, restes : jamais dans une pièce) */
R._el = function(parent, html){
  var g = document.createElementNS(NS, 'g');
  g.innerHTML = html;
  parent.appendChild(g);
  return g;
};
/* une particule : au plus PARTICULES_MAX à la fois (au-delà, elle n'est pas dessinée) */
R._fxEl = function(html, parent){
  parent = parent || this.S.monde;
  if(this.S.monde.childElementCount + this.S.fixe.childElementCount >= PARTICULES_MAX) return document.createElementNS(NS, 'g');
  return this._el(parent, html);
};
/* montrer / cacher des variantes (opacité seulement ; une variante invisible ne coûte rien à afficher) */
R._fondu = function(els, vers, ms, delai){
  if(typeof els === 'string') els = this.V[els] || this.J[els] || [];
  [].concat(els).forEach(function(e){
    if(!e) return;
    var de = e.getAttribute('visibility') === 'hidden' ? 0 : parseFloat(getComputedStyle(e).opacity);
    e.getAnimations().forEach(function(a){ if(a.id !== 'pulse') a.cancel(); });
    e.setAttribute('opacity', vers);
    e.style.opacity = '';
    if(vers > 0) e.removeAttribute('visibility');
    if(ms && !isNaN(de) && Math.abs(de - vers) > .01){
      var an = e.animate([{opacity: de}, {opacity: vers}], {duration: ms, delay: delai || 0, fill: 'backwards', easing: 'ease-in-out'});
      if(vers <= 0) an.finished.then(function(){ if(+e.getAttribute('opacity') <= 0) e.setAttribute('visibility', 'hidden'); }, function(){});
    } else if(vers <= 0) e.setAttribute('visibility', 'hidden');
  });
};
/* toutes les variantes dont le nom commence par… */
R._varis = function(prefixe){ var self = this, l = []; Object.keys(this.V).forEach(function(n){ if(n.indexOf(prefixe) === 0) l = l.concat(self.V[n]); }); return l; };
/* les boucles autonomes (pièces x-…) : elles ne dépendent pas des poses */
R._boucleX = function(nom, frames, duree, o){
  o = o || {};
  var l = [];
  (this.K[nom] || []).forEach(function(e){ l.push(e.animate(frames, {duration: duree, iterations: Infinity, delay: o.delai || 0, easing: o.e || 'linear', direction: o.dir || 'normal'})); });
  (this.boucX[nom] = this.boucX[nom] || []).push.apply(this.boucX[nom], l);
  return l;
};
R._couperX = function(prefixe){
  var self = this;
  Object.keys(this.boucX).forEach(function(n){ if(n.indexOf(prefixe) === 0){ self.boucX[n].forEach(function(a){ a.cancel(); }); delete self.boucX[n]; } });
};

/* =====================================================================
   4. Les actions et l'attente (squelette commun)
   ===================================================================== */
R._debutAction = function(){
  this.jeton++;
  this.enAction = true;
  this._couperBoucles();
  return this.jeton;
};
R._finAction = function(j, duree){
  if(j !== this.jeton || this.mort) return Promise.resolve();
  this.enAction = false;
  return this._reprendre(duree);
};
R._reprendre = function(duree){
  var self = this;
  if(this.mort) return Promise.resolve();
  this._couperBoucles();
  return this._allerA(this._base(), duree == null ? 380 : duree, 'cubic-bezier(.3,.7,.3,1)', true).then(function(){
    if(self.enAction || self.mort) return;
    if(self.attente) self._lancerBoucles();
  });
};
R._changerMode = function(ms){ if(!this.enAction && !this.mort) return this._reprendre(ms || 450); return Promise.resolve(); };
/* une boucle d'attente autour de la pose de base */
R._boucleur = function(){
  var self = this, b = this._base(), V = this.vitesse;
  function base(n){ return fusion(Z, b[n]); }
  function autour(n, d){ var v = base(n), o = {}; for(var k in d) o[k] = (k === 'sx' || k === 'sy') ? v[k] * d[k] : v[k] + d[k]; return o; }
  return function(n, deltas, duree, e, delai){
    var cles = deltas.map(function(d){ var o = {}; o[n] = autour(n, d[1]); return {t: d[0], p: o, e: e}; });
    return self._seq(cles, duree, {boucle: true, vitesse: V, depuis: b, delai: delai || 0});
  };
};
R._planifier = function(ms){
  var self = this;
  this._minuteur(function(){
    if(self.enAction || self.mort || !self.attente) return;
    self._evenement();
    self._planifier(hasard(1100, 2600) / (self.etat.enrage ? 1.6 : 1));
  }, ms);
};
R.attendre = function(){
  this.attente = true;
  if(this.arrete){ this.arrete = false; this._lancerX(); this._relancerEtats(); }
  if(!this.enAction && !this.mort) return this._reprendre(300);
  return Promise.resolve();
};
R.arreter = function(){
  var self = this;
  this.attente = false;
  this.arrete = true;
  ['vapeur', 'chaleur', 'fumee', 'givreT', 'gresille', 'pf'].forEach(function(k){ clearTimeout(self.fx[k]); });
  this._couperX('');
  this._couperBoucles();
  return this;
};
R.etatCourant = function(){ return copie(this.etat); };
R.ancre = function(nom){
  var n = {pointfaible: 'coeurC', pieds: 'pieds', haut: 'haut', tete: 'tete', centre: 'centre', bouche: 'bouche'}[nom] || nom, e = this.A[n];
  if(!e) return null;
  var r = e.getBoundingClientRect();
  return {x: r.left + r.width / 2, y: r.top + r.height / 2};
};

/* =====================================================================
   5. Petits effets : des particules simples, sans filtre, retirées à la fin (repère « monde »)
   ===================================================================== */
/* une bouffée (vapeur, fumée, poussière, rouille) : une tache douce qui grossit et s'efface */
R._bouffee = function(p, o){
  o = o || {};
  var r = o.r || 8, g = this._fxEl('<circle r="' + f1(r) + '" fill="' + (o.grad || this.G.vapeur) + '"/>', o.parent);
  var dx = o.dx == null ? hasard(-10, 10) : o.dx, dy = o.dy == null ? -30 : o.dy, d = o.duree || 900;
  var a = g.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(' + (o.s0 || .3) + ')', opacity: 0}, {offset: .15, opacity: o.op || .8}, {transform: 'translate(' + f1(p[0] + dx) + 'px,' + f1(p[1] + dy) + 'px) scale(' + (o.s1 || 1.8) + ')', opacity: 0}], {duration: d, easing: 'cubic-bezier(.2,.7,.4,1)', delay: o.delai || 0, fill: 'both'});
  a.finished.then(oter(g), oter(g));
  return a;
};
/* un jet de vapeur qui fuse d'un joint (dans une direction) */
R._jet = function(p, ang, o){
  o = o || {};
  var n = o.n || 3, rouge = this.etat.enrage && !o.blanc;
  for(var i = 0; i < n; i++){
    var a = ang + hasard(-.35, .35), v = hasard(28, 46) * (o.force || 1);
    this._bouffee(p, {r: hasard(6, 10) * (o.taille || 1), grad: rouge ? this.G.vapeurR : this.G.vapeur, op: .85, dx: Math.cos(a) * v, dy: Math.sin(a) * v - 10, duree: hasard(600, 900) * (o.duree || 1), delai: (o.delai || 0) + i * 70, s0: .25, s1: 2.2});
  }
};
R._poussiere = function(p, n, sens){
  for(var i = 0; i < n; i++) this._bouffee([p[0] + hasard(-10, 10), p[1] - 4], {r: hasard(7, 11), grad: this.G.fumee, op: .55, dx: (sens || 1) * hasard(14, 40), dy: hasard(-16, -4), duree: hasard(500, 800), delai: i * 40, s1: 2.2});
};
R._goutteTombe = function(p, o){
  o = o || {};
  var self = this, coul = o.coul || '#d8f0ff', g = this._fxEl('<path d="M0 -6 C 2 -2 4 1 4 3 C 4 6 2 7 0 7 C -2 7 -4 6 -4 3 C -4 1 -2 -2 0 -6 Z" fill="' + coul + '" stroke="' + O + '" stroke-width="1.2"/>');
  var dy = Math.max(10, SOL - p[1]), d = Math.sqrt(dy) * 45, x = p[0] + (o.dx || 0);
  g.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(.6,1.2)'}, {transform: 'translate(' + f1(x) + 'px,' + f1(SOL) + 'px) scale(.8,1.3)', opacity: .6}], {duration: d, easing: 'cubic-bezier(.5,0,1,1)', fill: 'forwards'}).finished.then(oter(g), oter(g));
};
/* des étincelles qui jaillissent puis retombent */
R._etincelles = function(p, n, o){
  o = o || {};
  var cs = o.coul || ['#fff6c0', '#ffd060', '#ffffff', '#ffb040'], v0 = o.v || 50, ang = o.ang == null ? -Math.PI / 2 : o.ang, ouv = o.ouv == null ? Math.PI * 1.6 : o.ouv;
  n = Math.min(n, 12);
  for(var i = 0; i < n; i++){
    var a = ang + (Math.random() - .5) * ouv, v = v0 * hasard(.5, 1.2), lg = hasard(5, 11) * (o.taille || 1), dx = Math.cos(a) * v, dy = Math.sin(a) * v, gr = o.grav == null ? 34 : o.grav, ep = o.ep || 2.4;
    var e = this._fxEl(L('M0 0 L ' + f1(-Math.cos(a) * lg) + ' ' + f1(-Math.sin(a) * lg), choisir(cs), ep) + C(0, 0, f1(ep * .7), '#ffffff'));
    e.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px)', opacity: 1},
      {offset: .55, transform: 'translate(' + f1(p[0] + dx * .8) + 'px,' + f1(p[1] + dy * .8 + gr * .25) + 'px)', opacity: 1},
      {transform: 'translate(' + f1(p[0] + dx) + 'px,' + f1(p[1] + dy + gr) + 'px)', opacity: 0}], {duration: hasard(320, 620) * (o.duree || 1), easing: 'cubic-bezier(.15,.7,.4,1)', delay: (o.delai || 0) + i * 8, fill: 'both'}).finished.then(oter(e), oter(e));
  }
};
/* un éclat qui s'ouvre (étoile à quatre branches + anneau) */
R._eclat = function(p, r, coul, o){
  o = o || {};
  var g = this._fxEl('<circle r="' + f1(r * .7) + '" fill="none" stroke="' + (o.anneau || '#ffffff') + '" stroke-width="' + f1(r * .12) + '" stroke-opacity=".9"/><path d="' + eclatD(r) + '" fill="' + (coul || '#fff8d0') + '" stroke="' + O + '" stroke-width="2"/><path d="' + eclatD(r * .5) + '" fill="#ffffff"/>');
  var T = function(s, a){ return 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(' + s + ') rotate(' + a + 'deg)'; };
  g.animate([{transform: T(.2, 0), opacity: 1}, {offset: .3, transform: T(1, o.rot || 20), opacity: 1}, {transform: T(1.3, (o.rot || 20) * 1.5), opacity: 0}], {duration: o.duree || 420, easing: 'ease-out', fill: 'both', delay: o.delai || 0}).finished.then(oter(g), oter(g));
};
/* le flash d'un coup : une lueur claire posée sur lui */
R._flash = function(p, r, grad){
  var g = this._fxEl('<circle r="' + f1(r || 120) + '" fill="' + (grad || this.G.flash) + '"/>');
  g.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(.6)', opacity: .9}, {transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(1.15)', opacity: 0}], {duration: 300, easing: 'ease-out', fill: 'forwards'}).finished.then(oter(g), oter(g));
};
/* des bulles d'acide qui gonflent et éclatent */
R._bulles = function(p, n, o){
  o = o || {};
  n = Math.min(n, 6);
  for(var i = 0; i < n; i++){
    var r = hasard(2.5, 6) * (o.taille || 1), g = this._fxEl('<circle r="' + f1(r) + '" fill="#b8f040" fill-opacity=".6" stroke="#3a5a10" stroke-width="1.2"/><circle cx="' + f1(-r * .35) + '" cy="' + f1(-r * .35) + '" r="' + f1(r * .3) + '" fill="#fff" fill-opacity=".8"/>');
    var x = p[0] + hasard(-14, 14) * (o.etendue || 1), y = p[1] + hasard(-10, 10) * (o.etendue || 1), dy = hasard(-30, -14);
    g.animate([{transform: 'translate(' + f1(x) + 'px,' + f1(y) + 'px) scale(.2)', opacity: 0}, {offset: .2, opacity: 1}, {offset: .85, transform: 'translate(' + f1(x + hasard(-4, 4)) + 'px,' + f1(y + dy) + 'px) scale(1)', opacity: 1},
      {transform: 'translate(' + f1(x) + 'px,' + f1(y + dy) + 'px) scale(1.6)', opacity: 0}], {duration: hasard(500, 900), delay: (o.delai || 0) + i * hasard(30, 90), easing: 'ease-out', fill: 'both'}).finished.then(oter(g), oter(g));
  }
};
/* des éclats de glace */
R._cristaux = function(p, n, o){
  o = o || {};
  n = Math.min(n, 10);
  for(var i = 0; i < n; i++){
    var s = hasard(4, 9) * (o.taille || 1), a = (o.ang == null ? -Math.PI / 2 : o.ang) + (Math.random() - .5) * (o.ouv || Math.PI * 1.8), v = (o.v || 46) * hasard(.5, 1.2);
    var g = this._fxEl(P('M0 ' + f1(-s) + ' L ' + f1(s * .45) + ' 0 L 0 ' + f1(s * .8) + ' L ' + f1(-s * .45) + ' 0 Z', choisir(['#e8f8ff', '#b8e6ff', '#d0f0ff']), ' stroke-width="1.2"') + L('M0 ' + f1(-s * .6) + ' L 0 ' + f1(s * .4), '#ffffff', 1, so(.9)));
    var dx = Math.cos(a) * v, dy = Math.sin(a) * v, rot = hasard(-300, 300);
    g.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) rotate(0deg) scale(.4)', opacity: 1}, {offset: .5, transform: 'translate(' + f1(p[0] + dx * .8) + 'px,' + f1(p[1] + dy * .8) + 'px) rotate(' + f1(rot * .5) + 'deg) scale(1)', opacity: 1},
      {transform: 'translate(' + f1(p[0] + dx) + 'px,' + f1(p[1] + dy + 40) + 'px) rotate(' + f1(rot) + 'deg) scale(.8)', opacity: 0}], {duration: hasard(500, 850), delay: (o.delai || 0) + i * 12, easing: 'cubic-bezier(.2,.7,.5,1)', fill: 'both'}).finished.then(oter(g), oter(g));
  }
};
/* des ondes de bruit (arcs qui s'écartent) */
R._ondes = function(p, sens, coul){
  var d = 'M0 -14 Q ' + f1(-10 * sens) + ' 0 0 14 M' + f1(9 * sens) + ' -20 Q ' + f1(-5 * sens) + ' 0 ' + f1(9 * sens) + ' 20';
  var g = this._fxEl(L(d, O, 6) + L(d, coul || '#ffe8a0', 3));
  g.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(.5)', opacity: 0}, {offset: .2, opacity: 1}, {transform: 'translate(' + f1(p[0] + sens * 34) + 'px,' + f1(p[1]) + 'px) scale(1.5)', opacity: 0}], {duration: 600, easing: 'ease-out', fill: 'both'}).finished.then(oter(g), oter(g));
};
/* des rayons de lumière */
R._rayons = function(p, r, coul){
  var s = '';
  for(var i = 0; i < 12; i++){ var a = i / 12 * Math.PI * 2, r0 = r * .35, r1 = r * (i % 2 ? .8 : 1.05); s += 'M' + f1(Math.cos(a) * r0) + ' ' + f1(Math.sin(a) * r0) + ' L ' + f1(Math.cos(a) * r1) + ' ' + f1(Math.sin(a) * r1) + ' '; }
  var g = this._fxEl('<circle r="' + f1(r * .9) + '" fill="' + this.G.lumiere + '"/>' + L(s, coul || '#fff8d0', 4) + L(s, '#ffffff', 1.6));
  var T = function(s2, a){ return 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(' + s2 + ') rotate(' + a + 'deg)'; };
  g.animate([{transform: T(.3, 0), opacity: 0}, {offset: .2, opacity: 1, transform: T(1, 10)}, {transform: T(1.25, 24), opacity: 0}], {duration: 700, easing: 'ease-out', fill: 'forwards'}).finished.then(oter(g), oter(g));
};
/* deux rayures blanches (la dague sur le fer) */
R._rayures = function(p){
  var d = 'M-18 -10 Q 0 -2 16 8 M-10 -16 Q 4 -6 18 2';
  var g = this._fxEl(L(d, O, 5) + L(d, '#ffffff', 2.2));
  g.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(.3,1)', opacity: 0}, {offset: .15, opacity: 1, transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(1.1)'}, {transform: 'translate(' + f1(p[0] + 4) + 'px,' + f1(p[1] + 4) + 'px) scale(1.2)', opacity: 0}], {duration: 460, easing: 'ease-out', fill: 'forwards'}).finished.then(oter(g), oter(g));
};
/* un morceau qui vole puis retombe et reste au sol (repère fixe de la bête) */
R._voler = function(g, depart, arrivee, o){
  o = o || {};
  var h = o.haut == null ? 60 : o.haut, rot = o.rot || 0, d = o.duree || 900, rebond = o.rebond == null ? 8 : o.rebond;
  var my = Math.min(depart[1], arrivee[1]) - h;
  function T(p, r){ return 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) rotate(' + f1(r) + 'deg)'; }
  var cles = [{offset: 0, transform: T(depart, o.rot0 || 0), easing: 'cubic-bezier(.2,.6,.5,1)'}, {offset: .45, transform: T([lerp(depart, arrivee, .5)[0], my], (o.rot0 || 0) + rot * .5), easing: 'cubic-bezier(.5,0,.9,.6)'},
    {offset: .74, transform: T(arrivee, rot), easing: 'cubic-bezier(.2,.7,.4,1)'}, {offset: .86, transform: T([arrivee[0] + (o.glisse || 0) * .6, arrivee[1] - rebond], rot + (o.bascule || 6)), easing: 'cubic-bezier(.5,0,.9,.6)'},
    {offset: .94, transform: T([arrivee[0] + (o.glisse || 0) * .9, arrivee[1] - rebond * .25], rot - (o.bascule || 6) * .3), easing: 'cubic-bezier(.5,0,.9,.6)'}, {offset: 1, transform: T([arrivee[0] + (o.glisse || 0), arrivee[1]], rot)}];
  var a = g.animate(cles, {duration: d, delay: o.delai || 0, fill: 'both'});
  if(o.onSol) this._minuteur(o.onSol, (o.delai || 0) + d * .74);
  return a;
};
/* une copie de pièce(s), posée dans le repère fixe exactement où elle est ; la pièce d'origine est cachée (opacité).
   La copie est un débris (hors des pièces) : elle peut voler, tomber et rester au sol. Renvoie {g, c (centre), ang}. */
R._detacher = function(noms, parent, ancre, pret){
  var self = this, rep = parent || this.S.fixe, w = rep.getCTM().inverse(), ref = this.J[noms[0]][0], M = w.multiply(ref.getCTM());
  var c = ancre ? this._ou(ancre) : [M.e, M.f];
  var g = this._el(rep, '');
  g.setAttribute('data-debris', '1');
  noms.forEach(function(n){
    var el = self.J[n][0], Mn = w.multiply(el.getCTM()), inner = document.createElementNS(NS, 'g');
    inner.setAttribute('transform', 'translate(' + f1(-c[0]) + ' ' + f1(-c[1]) + ') matrix(' + [Mn.a, Mn.b, Mn.c, Mn.d, Mn.e, Mn.f].map(r3).join(' ') + ')');
    inner.innerHTML = el.innerHTML;
    [].forEach.call(inner.querySelectorAll('[data-a],[data-slot]'), function(e){ e.remove(); });
    [].forEach.call(inner.querySelectorAll('[data-j]'), function(e){ e.removeAttribute('data-j'); });
    g.appendChild(inner);
    if(!pret) self.J[n].forEach(function(e){ e.style.opacity = 0; });
  });
  g.style.transform = 'translate(' + f1(c[0]) + 'px,' + f1(c[1]) + 'px)';
  if(pret) g.style.visibility = 'hidden';
  this.debris.push(g);
  return {g: g, c: c, ang: 0, montrer: function(){ g.style.visibility = ''; noms.forEach(function(n){ self.J[n].forEach(function(e){ e.style.opacity = 0; }); }); }};
};

/* =====================================================================
   A. Le dessin du Gardien (fiche 08-gardien.js : mêmes formes, mêmes couleurs, même lumière), découpé en pièces
   Repère : celui de la fiche (540 × 430), sol à y = 394. Les flous et ombres « filtre » de la fiche sont remplacés
   par des dégradés, des traits larges à opacité fixe et des ombres décalées : rien n'est recalculé quand il bouge.
   ===================================================================== */
var VB = [12, -10, 500, 406], SOL = 394, HX = 244, HY = 184;
var FER = '#6e6878', ROUX = '#8a5638', BRONZE = '#9a7040', NOIR = '#3a3444';
/* glyphes de runes (dans une boîte de 6 × 10), ceux de la fiche */
var GLY = ['M3 0 L3 10 M3 3 L0 6 M3 5 L6 8', 'M0 1 Q 6 2 3 5 Q 0 8 6 9', 'M0 10 L0 3 Q 3 -1 6 3 L6 10', 'M3 0 L3 10 M0 6 L6 6 M1 2 L5 2', 'M1 0 L5 5 L1 10 M5 0 L5 2',
  'M3 0 L3 4 M0 4 Q 3 9 6 4 M3 7 L3 10', 'M0 0 L6 3 L0 6 L6 9', 'M3 0 L3 10 M3 2 L6 0 M3 6 L0 4 M3 9 L6 7', 'M0 5 A 3 3 0 1 0 6 5 A 3 3 0 1 0 0 5 M3 0 L3 10', 'M0 0 L0 10 L6 7 M0 4 L5 2', 'M6 0 Q 0 5 6 10 M2 5 L4 5 M2 2 L2 8'];
/* les articulations (repère du dessin, avant tout mouvement) */
var ART = {
  hancheF: [232, 314], genouF: [204, 354], chevilleF: [200, 372],
  hanche: [330, 316], genou: [348, 356], cheville: [350, 373],
  epauleF: [176, 118], coudeF: [130, 216], poignetF: [92, 286],
  epaule: [388, 150], coude: [412, 238], poignet: [440, 318],
  buste: [276, 286], cou: [234, 130]
};
/* la plaque (trappe) : la fiche la décale (translate(-6 0) rotate(-5) autour du cœur) ; ses charnières sont à gauche */
function trappeP(p){ var q = rotP(p, -5, [HX, HY]); return [q[0] - 6, q[1]]; }
var CHARN_H = trappeP([HX - 52, HY - 27]), CHARN_B = trappeP([HX - 52, HY + 25]);
var PIV_PLAQUE = [r3((CHARN_H[0] + CHARN_B[0]) / 2), r3((CHARN_H[1] + CHARN_B[1]) / 2)];

function dessinerGardien(D){
  var dg = function(c, f){ return D.g(c, f); };
  var CT = [];   /* les contours des plaques de la pièce en cours (pour les couches « chauffé au rouge » et « gelé ») */
  var gelG = D.lin([[0, '#f6fdff', .78], [.45, '#cdeeff', .38], [1, '#74b4e4', .62]], 1, 0, 0, 1);
  var chaudG = D.lin([[0, '#ffd27a', .12], [.4, '#ff8a2a', .38], [.75, '#e8401a', .72], [1, '#801a10', .85]], 1, 0, 0, 1);
  var acideG = D.lin([[0, '#f0ffa0'], [.5, '#a8e040'], [1, '#4a7a10']], 1, 0, 0, 1);

  /* ---------- une plaque de fer : dégradé, rouille, coulures, rayures, ombre intérieure, liseré de lune ---------- */
  function decaler(dd, dx, dy){ return /[a-y]/.test(dd) ? null : cuireChemin(dd, dx, dy, 0, 1); }
  function plaque(dd, col, bb, o){
    o = o || {};
    var R = rng(o.seed || 7), eo = o.eo ? ' fill-rule="evenodd"' : '', w = bb[2] - bb[0], h = bb[3] - bb[1], i, x, y, grand = w * h > 2600, g = dg(col, o.fort || 1);
    var s = '';
    if(o.ombre !== false){ var od = decaler(dd, -3, 5); s += od ? F(od, '#06030a', fo(.42) + eo) : F(dd, '#06030a', fo(.42) + eo + ' transform="translate(-3 5)"'); }
    s += P(dd, g, eo);
    var c = '<g' + D.clip(dd, o.eo) + '>';
    if(o.rainure !== false && w > 40 && h > 30) c += L(dd, '#1a0e14', 15, so(.45)) + L(dd, g, 11.4) + (grand ? L(dd, clair(col, .5), 16.6, so(.18) + ' transform="translate(-.8 1.2)"') : '');
    /* la rouille : des taches en deux couches (un halo pâle et un cœur plus dense) au lieu d'un flou */
    var nr = o.r === undefined ? Math.round(w * h / 700) : o.r, ha = ['', ''], co = ['', ''];
    for(i = 0; i < nr; i++){ x = bb[0] + R() * w; y = bb[1] + R() * h; var rx = 4 + R() * 14, ry = 3 + R() * 9, k = R() < .55 ? 0 : 1; ha[k] += ovale(x, y, rx * 1.25, ry * 1.25); co[k] += ovale(x, y, rx * .7, ry * .7); }
    if(ha[0]) c += F(ha[0], '#c46e36', fo(.2)) + F(co[0], '#d8843e', fo(.34));
    if(ha[1]) c += F(ha[1], '#7a3a1e', fo(.22)) + F(co[1], '#8a4422', fo(.36));
    /* piqûres de rouille : de petits points ronds, en deux chemins */
    var pq = ['', ''];
    for(i = 0; i < w * h / (grand ? 170 : 240); i++){ x = bb[0] + R() * w; y = bb[1] + R() * h; pq[R() < .55 ? 0 : 1] += 'M' + f1(x) + ' ' + f1(y) + ' h .01 '; }
    if(pq[0]) c += L(pq[0], '#4a1e0e', 2.2, so(.5));
    if(pq[1]) c += L(pq[1], '#f0a868', 1.8, so(.42));
    /* coulures de rouille */
    var nc = o.c === undefined ? Math.max(2, Math.round(w / 22)) : o.c, coul = ['', ''];
    for(i = 0; i < nc; i++){
      x = bb[0] + R() * w; y = bb[1] + R() * h * .55; var l = 16 + R() * 44, ww = 1.4 + R() * 3.2;
      coul[R() < .5 ? 0 : 1] += 'M' + f1(x - ww) + ' ' + f1(y) + ' C ' + f1(x - ww * .6) + ' ' + f1(y + l * .5) + ' ' + f1(x - ww * .3) + ' ' + f1(y + l * .8) + ' ' + f1(x) + ' ' + f1(y + l) + ' C ' + f1(x + ww * .3) + ' ' + f1(y + l * .8) + ' ' + f1(x + ww * .6) + ' ' + f1(y + l * .5) + ' ' + f1(x + ww) + ' ' + f1(y) + ' Z ';
    }
    if(coul[0]) c += F(coul[0], '#a8501f', fo(.6));
    if(coul[1]) c += F(coul[1], '#5e2412', fo(.6));
    var ray = '';
    for(i = 0; i < w / 30; i++){ x = bb[0] + R() * w; y = bb[1] + R() * h; ray += 'M' + f1(x) + ' ' + f1(y) + ' l ' + f1(6 + R() * 14) + ' ' + f1(-2 - R() * 5) + ' '; }
    if(ray) c += L(ray, '#f4e6d0', .9, so(.3));
    if(o.extra) c += o.extra;
    /* l'ombre intérieure (en bas à gauche, la lumière vient d'en haut à droite) et le liseré de lune */
    var i1 = decaler(dd, 8, -11), i2 = decaler(dd, 3, -4), lu = decaler(dd, -1.8, 2.6);
    c += i1 ? L(i1, '#0e0716', 20, so(.17)) + L(i2, '#0e0716', 8, so(.22)) : L(dd, '#0e0716', 20, so(.17) + ' transform="translate(8 -11)"') + L(dd, '#0e0716', 8, so(.22) + ' transform="translate(3 -4)"');
    c += lu ? L(lu, LUNE, 3, so(o.lune || .55)) : L(dd, LUNE, 3, so(o.lune || .55) + ' transform="translate(-1.8 2.6)"');
    if(o.couche !== false) CT.push([dd, o.eo]);
    return s + c + '</g>';
  }
  /* les rivets d'une rangée réunis en trois chemins (ombre de rouille, tête, reflet) */
  function rivets(pts, r){
    r = r || 3.2;
    var a = '', b = '', c = '';
    pts.forEach(function(p){ a += rond(p[0], p[1], r + 1.6); b += rond(p[0], p[1], r); c += rond(p[0] + r * .3, p[1] - r * .35, r * .38); });
    return F(a, '#7a3414', fo(.45)) + '<path d="' + b + '" fill="#8a7a74" stroke="' + O + '" stroke-width="1.6"/>' + F(c, '#fff4e8', fo(.75));
  }
  function rangee(a, b, n, r){ var o = []; for(var i = 0; i < n; i++){ var t = n === 1 ? .5 : i / (n - 1); o.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); } return rivets(o, r); }
  /* un engrenage ; avec un nom, il devient une pièce qui tourne (boucle autonome x-…) ; le reflet de lune reste fixe */
  function engrenage(cx, cy, r, n, col, rot, nom){
    var s = P(cuireChemin(rouageD(r, n, rot), cx, cy, 0, 1), dg(col));
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + f1(r * .62) + '" fill="' + dg(sombre(col, .15)) + '" stroke="' + O + '" stroke-width="2"/>';
    var tr = '';
    for(var k = 0; k < 4; k++){ var a2 = (rot || 0) + k * Math.PI / 2 + .4; tr += rond(cx + Math.cos(a2) * r * .4, cy + Math.sin(a2) * r * .4, r * .1); }
    s += F(tr, '#1a1020') + '<circle cx="' + cx + '" cy="' + cy + '" r="' + f1(r * .22) + '" fill="' + dg('#9a8a84') + '" stroke="' + O + '" stroke-width="2"/>';
    var hl = L('M' + f1(cx + r * .2) + ' ' + f1(cy - r * .78) + ' A ' + f1(r * .8) + ' ' + f1(r * .8) + ' 0 0 1 ' + f1(cx + r * .78) + ' ' + f1(cy - r * .2), LUNE, 1.6, so(.55));
    return (nom ? piv('x-eng-' + nom, cx, cy, s) : s) + hl;
  }
  /* des runes : la gravure (toujours là), la lueur cyan (allumée) et la lueur rouge (enragé), en variantes */
  function runeD(x, y, sc, k, rot){ return cuireChemin(GLY[k % GLY.length], x, y, rot || 0, sc); }
  function runesD(liste){ return liste.map(function(r){ return runeD(r[0], r[1], r[2], r[3], r[4]); }).join(''); }
  function runesV(nom, liste){
    var d = runesD(liste);
    return L(d, '#06202c', 3, so(.55)) + L(d, '#5a7a86', .9, so(.3)) +
      vari('r-' + nom, L(d, CYANF, 7.5, so(.2)) + L(d, CYANF, 4.4, so(.55)) + L(d, '#06202c', 2.4, so(.4)) + L(d, CYAN, 1.5), 1) +
      vari('rr-' + nom, L(d, ROUGE, 7.5, so(.26)) + L(d, ROUGE, 4.4, so(.62)) + L(d, '#2a0606', 2.4, so(.4)) + L(d, ROUGEC, 1.5));
  }
  /* une fente qui laisse passer la lueur (éteinte : un trait sombre) */
  function lueurV(nom, dd, w){
    return L(dd, '#0c0814', w * 2.2, so(.85)) +
      vari('r-' + nom, L(dd, CYANF, w * 7, so(.16)) + L(dd, CYANF, w * 3, so(.5)) + L(dd, CYAN, w) + L(dd, '#ffffff', w * .4, so(.8)), 1) +
      vari('rr-' + nom, L(dd, ROUGE, w * 7, so(.2)) + L(dd, ROUGE, w * 3, so(.55)) + L(dd, '#ffb08a', w) + L(dd, '#ffffff', w * .4, so(.7)));
  }
  /* un coussin de mousse, posé le long d'un bord (fiche ; les points réunis en deux chemins) */
  function mousse(a, b, ep, seed){
    var R = rng(seed), n = 5 + Math.floor(R() * 4), dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy), nx = dy / l, ny = -dx / l, p = 'M' + pt(a), d1 = '', d2 = '';
    for(var i = 0; i < n; i++){
      var t1 = (i + 1) / n, h = ep * (.6 + R() * .7), tm = (i + .5) / n;
      p += ' Q ' + f1(a[0] + dx * tm + nx * h * 1.5) + ' ' + f1(a[1] + dy * tm + ny * h * 1.5) + ' ' + f1(a[0] + dx * t1 + nx * (i === n - 1 ? 0 : h * .45)) + ' ' + f1(a[1] + dy * t1 + ny * (i === n - 1 ? 0 : h * .45));
    }
    p += ' Q ' + f1(a[0] + dx * .5 - nx * ep * .5) + ' ' + f1(a[1] + dy * .5 - ny * ep * .5) + ' ' + pt(a) + ' Z';
    for(var j = 0; j < n * 5; j++){ var t = R(), e = R() * ep * .9, rr = .8 + R() * 1.4, xx = a[0] + dx * t + nx * e, yy = a[1] + dy * t + ny * e; if(R() < .6) d1 += rond(xx, yy, rr); else d2 += rond(xx, yy, rr); }
    var brins = '';
    for(var k = 0; k < 4; k++){ var t2 = .15 + R() * .7, bx = a[0] + dx * t2 + nx * ep, by = a[1] + dy * t2 + ny * ep; brins += 'M' + f1(bx) + ' ' + f1(by) + ' q ' + f1(-2 + R() * 4) + ' ' + f1(-5 - R() * 4) + ' ' + f1(-1 + R() * 6) + ' ' + f1(-8 - R() * 6) + ' '; }
    var pend = '';
    for(var m = 0; m < 3; m++){ var t3 = .1 + R() * .8, px = a[0] + dx * t3 - nx * ep * .3, py = a[1] + dy * t3 - ny * ep * .3, ln = 6 + R() * 12; pend += 'M' + f1(px) + ' ' + f1(py) + ' q ' + f1(-2 + R() * 4) + ' ' + f1(ln * .5) + ' ' + f1(-1 + R() * 2) + ' ' + f1(ln) + ' '; }
    return L(brins, '#9ac84a', 1.4) + L(pend, '#6a9a3a', 1.3, so(.9)) + P(p, dg('#5e8a32')) + F(d1, '#c8e87a', fo(.7)) + F(d2, '#2e4a1a', fo(.7));
  }
  /* des racines qui pendent (plusieurs, réunies) */
  function racines(l){
    var A = '', Bb = '';
    l.forEach(function(q){
      var R = rng(q[3]), p = [[q[0], q[1]]], cx = q[0], cy = q[1];
      for(var i = 0; i < 6; i++){ cx += (R() - .5) * 8; cy += q[2] / 6; p.push([cx, cy]); }
      A += 'M' + pt(p[0]) + crs(p) + ' ';
      for(var j = 1; j < 5; j += 2){ var qq = p[j], sg = R() < .5 ? -1 : 1; Bb += 'M' + pt(qq) + ' q ' + f1(sg * 6) + ' 4 ' + f1(sg * 8) + ' ' + f1(12 + R() * 8) + ' '; }
    });
    return L(A + Bb, O, 4.4) + L(A, '#7a5a3a', 2.4) + L(Bb, '#7a5a3a', 1.8) + L(cuireChemin(A, .8, -.4, 0, 1), '#c8a27a', .9, so(.5));
  }
  /* un tuyau souple, annelé */
  function tuyau(segs, w, col){
    var pts = []; segs.forEach(function(sg, i){ for(var j = i ? 1 : 0; j <= 24; j++) pts.push(bez(sg, j / 24)); });
    var ws = pts.map(function(){ return w; }), c = cote(pts, ws.map(function(v){ return v * .96; })), s = P(tube(pts, ws), dg(col)), an = '';
    for(var i = 1; i < pts.length - 1; i++) an += 'M' + pt(c.G[i]) + ' L ' + pt(c.D[i]) + ' ';
    s += L(an, '#120a18', 1.5, so(.55));
    var hl = cote(pts, ws.map(function(v){ return v * .45; }));
    return s + L('M' + pt(hl.G[1]) + crs(hl.G.slice(1, -1)), LUNE, 1.8, so(.4));
  }
  /* les couches cachées d'une pièce : chauffée au rouge (feu) et gelée (givre), sur ses plaques */
  function couches(nom, glacons){
    var l = CT; CT = [];
    if(!l.length) return '';
    var ch = '', ge = '', bl = '';
    l.forEach(function(q){ var eo = q[1] ? ' fill-rule="evenodd"' : ''; ch += F(q[0], chaudG, eo); ge += F(q[0], gelG, eo); bl += q[0] + ' '; });
    var gl = '';
    (glacons || []).forEach(function(q){ gl += 'M' + f1(q[0] - q[2] * .3) + ' ' + f1(q[1]) + ' L ' + f1(q[0]) + ' ' + f1(q[1] + q[2]) + ' L ' + f1(q[0] + q[2] * .3) + ' ' + f1(q[1]) + ' Z '; });
    return vari('chaud-' + nom, ch) + vari('gel-' + nom, ge + L(bl, '#ffffff', 1.8, so(.7)) + (gl ? P(gl, gelG, ' stroke-width="1.4"') + L(gl, '#ffffff', .8, so(.8)) : ''));
  }
  /* un poing de fer fermé, vu de profil (fiche), avec ses couches */
  function poing(cx, cy, sc, col, seed, nom){
    var save = CT; CT = [];
    var s = plaque('M-14 -42 C 8 -52 36 -48 48 -32 C 56 -16 56 18 48 34 C 40 46 16 50 -8 46 Z', col, [-16, -52, 56, 50], {seed: seed, r: 5, c: 2});
    s += rangee([40, -30], [44, 30], 4, 2.4);
    [[30, 15, -30], [13, 18, -40], [-5, 19, -44], [-24, 19, -40]].forEach(function(f, i){
      var yc = f[0], h = f[1], xl = f[2], r = h / 2, y0 = yc - r, y1 = yc + r;
      var dd = 'M14 ' + f1(y0) + ' L ' + f1(xl + r) + ' ' + f1(y0) + ' A ' + f1(r) + ' ' + f1(r) + ' 0 0 0 ' + f1(xl + r) + ' ' + f1(y1) + ' L 14 ' + f1(y1) + ' Z';
      s += plaque(dd, clair(col, .04 * (3 - i)), [xl, y0, 16, y1], {seed: seed + i * 3, r: 2, c: 1, lune: .45});
      s += L('M' + f1(xl + h * 1.25) + ' ' + f1(y0 + 1.5) + ' Q ' + f1(xl + h * 1.25 - 4) + ' ' + f1(yc) + ' ' + f1(xl + h * 1.25) + ' ' + f1(y1 - 1.5), O, 2.2);
      s += rivets([[xl + r + 1, yc]], 2.6);
      s += L('M' + f1(xl + r) + ' ' + f1(y0 + 2.5) + ' L 10 ' + f1(y0 + 2.5), LUNE, 1.3, so(.45));
    });
    s += plaque('M44 -28 C 34 -46 4 -50 -22 -42 C -32 -38 -32 -26 -22 -24 C -4 -28 16 -26 32 -16 Z', clair(col, .06), [-34, -52, 46, -14], {seed: seed + 20, r: 3, c: 1});
    s += P('M-22 -42 C -30 -38 -30 -28 -22 -25 L -16 -26 C -20 -30 -20 -38 -16 -42 Z', dg('#8a8690'), ' stroke-width="2"') + rivets([[8, -36]], 2.6) + L('M18 -44 C 14 -36 14 -28 18 -22', O, 2);
    s += couches(nom, [[-30, 44, 12], [0, 48, 9], [30, 42, 10]]);
    CT = save;
    return '<g transform="translate(' + cx + ' ' + cy + ') scale(' + sc + ')">' + s + '</g>';
  }
  /* une bague (manchette) autour d'un membre */
  function bague(c, ang, larg, ep, col, seed){
    var save = CT; CT = [];
    var w = larg / 2, e = ep / 2, dd = 'M' + (-e) + ' ' + (-w) + ' L ' + e + ' ' + (-w) + ' Q ' + (e + 7) + ' 0 ' + e + ' ' + w + ' L ' + (-e) + ' ' + w + ' Q ' + (-e + 7) + ' 0 ' + (-e) + ' ' + (-w) + ' Z';
    var r = plaque(dd, col, [-e, -w, e + 7, w], {seed: seed, r: 3, c: 0, rainure: false});
    r += L('M' + f1(e - 3) + ' ' + f1(-w + 3) + ' Q ' + f1(e + 3.5) + ' 0 ' + f1(e - 3) + ' ' + f1(w - 3), '#1a0e14', 2, so(.5));
    var rv = [];
    for(var i = 0; i < 4; i++){ var y = -w + 8 + i * (larg - 16) / 3; rv.push([1 + 3.5 * (1 - Math.pow(y / w, 2)), y]); }
    r += rivets(rv, 2.4) + couches('bague' + seed);
    CT = save;
    return '<g transform="translate(' + f1(c[0]) + ' ' + f1(c[1]) + ') rotate(' + f1(ang) + ')">' + r + '</g>';
  }
  /* un gros pied de fer : talon à droite, orteils en calottes à gauche, griffes de métal */
  function pied(cx, cy, sc, col, seed, nom){
    var save = CT; CT = [];
    var s = P('M-60 4 L 50 4 C 54 6 54 12 50 14 L -60 14 C -64 12 -64 6 -60 4 Z', dg(NOIR));
    s += plaque('M-16 -26 C 10 -34 40 -28 50 -10 C 56 0 54 8 50 8 L -18 8 Z', col, [-20, -34, 56, 10], {seed: seed, c: 2});
    s += plaque('M-8 -22 C -28 -26 -46 -16 -48 -2 L -46 6 L -10 6 Z', sombre(col, .15), [-50, -28, -6, 8], {seed: seed + 1, r: 2, c: 1, rainure: false});
    s += P('M-46 -6 L -58 -2 L -46 2 Z', dg('#a8a4b0'), ' stroke-width="2"');
    s += plaque('M-14 -6 C -38 -12 -60 -4 -64 8 C -64 12 -60 14 -56 14 L -12 14 Z', col, [-66, -14, -10, 14], {seed: seed + 2, r: 2, c: 1, rainure: false});
    s += P('M-62 4 L -76 10 L -62 13 Z', dg('#b8b4c0'), ' stroke-width="2"') + L('M-64 6 L -72 9.5', '#ffffff', 1, so(.7));
    s += rangee([-2, -16], [-4, 2], 2, 2.4) + rangee([4, 0], [44, 0], 5, 2.4);
    s += couches(nom);
    CT = save;
    return '<g transform="translate(' + cx + ' ' + cy + ') scale(' + sc + ')">' + s + '</g>';
  }
  /* du lierre qui grimpe (les feuilles réunies en deux chemins, déjà tournées) */
  function lierre(pts, seed){
    var R = rng(seed), dd = 'M' + pt(pts[0]) + crs(pts), s = L(dd, O, 4.4) + L(dd, '#4a6a2a', 2.2), fe = ['', ''], ner = '';
    var FEUILLE = 'M0 0 C -4 -2 -9 -4 -10 -8 L -6 -9 L -8 -14 L -3 -13 L 0 -19 L 3 -13 L 8 -14 L 6 -9 L 10 -8 C 9 -4 4 -2 0 0 Z', NERV = 'M0 -1 L 0 -15 M0 -7 L -5 -10 M0 -7 L 5 -10';
    for(var i = 0; i < pts.length - 1; i++){
      for(var k = 0; k < 2; k++){
        var t = .25 + k * .5, x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, y = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t, a = (k ? 1 : -1) * (40 + R() * 50) + (R() - .5) * 30, sc = .7 + R() * .45;
        fe[R() < .5 ? 0 : 1] += cuireChemin(FEUILLE, x, y, a, sc); ner += cuireChemin(NERV, x, y, a, sc);
      }
    }
    return s + P(fe[0], dg('#3e7a34'), ' stroke-width="1.8"') + P(fe[1], dg('#4a8a3a'), ' stroke-width="1.8"') + L(ner, '#a8d870', .8, so(.6));
  }
  /* des bagues de tôle en travers d'un membre */
  function anneaux(pts, ws, ids){
    var c = cote(pts, ws.map(function(w){ return w * .99; })), a1 = '', a2 = '';
    ids.forEach(function(i){
      var a = c.G[i], b = c.D[i], m = [(a[0] + b[0]) / 2 + (pts[Math.min(i + 1, pts.length - 1)][0] - pts[Math.max(i - 1, 0)][0]) * .12, (a[1] + b[1]) / 2 + (pts[Math.min(i + 1, pts.length - 1)][1] - pts[Math.max(i - 1, 0)][1]) * .12];
      a1 += 'M' + pt(a) + ' Q ' + pt(m) + ' ' + pt(b) + ' ';
      a2 += 'M' + f1(a[0] - 1) + ' ' + f1(a[1] + 2) + ' Q ' + f1(m[0] - 1) + ' ' + f1(m[1] + 2) + ' ' + f1(b[0] - 1) + ' ' + f1(b[1] + 2) + ' ';
    });
    return L(a1, O, 2.4) + L(a2, LUNE, 1.2, so(.35));
  }
  /* une bosse dans le fer (flèche lourde), cachée */
  function bosse(nom, x, y, r){
    var d = 'M' + f1(x - r) + ' ' + f1(y) + ' C ' + f1(x - r * .6) + ' ' + f1(y - r * 1.1) + ' ' + f1(x + r * .8) + ' ' + f1(y - r) + ' ' + f1(x + r) + ' ' + f1(y) + ' C ' + f1(x + r * .3) + ' ' + f1(y + r * .75) + ' ' + f1(x - r * .5) + ' ' + f1(y + r * .65) + ' ' + f1(x - r) + ' ' + f1(y) + ' Z';
    return vari(nom, F(d, '#1d1a26', fo(.62)) + L('M' + f1(x + r * .2) + ' ' + f1(y - r * .95) + ' C ' + f1(x + r * .8) + ' ' + f1(y - r * .7) + ' ' + f1(x + r * 1.05) + ' ' + f1(y - r * .1) + ' ' + f1(x + r * .8) + ' ' + f1(y + r * .4), '#e6eef6', 1.8, so(.85)) +
      L('M' + f1(x - r * .3) + ' ' + f1(y + r * .2) + ' l ' + f1(-r * .5) + ' ' + f1(r * .4) + ' M' + f1(x + r * .1) + ' ' + f1(y + r * .3) + ' l ' + f1(r * .2) + ' ' + f1(r * .6), O, 1.4) + C(f1(x - r * .1), f1(y - r * .2), f1(r * .3), '#ffb060', fo(.5)), 0, x, y);
  }
  /* une flamme qui reste (brûlé) : une petite pièce qui vacille (boucle autonome) */
  var NF = 0;
  function flamme(x, y, h, w, r){
    return '<g transform="translate(' + f1(x) + ' ' + f1(y) + ') rotate(' + (r || 0) + ')"><g data-j="x-fl' + (NF++) + '">' +
      '<path d="' + flammeD(h, w) + '" fill="' + self.G.feu1 + '" stroke="#5a1a08" stroke-width="2"/><path d="' + flammeD(h * .7, w * .62) + '" fill="#ffa21e"/><path d="' + flammeD(h * .42, w * .36) + '" fill="' + self.G.feu2 + '"/></g></g>';
  }
  var self = this;

  /* ================= l'ombre au sol, la lueur sous lui ================= */
  var sol = '<ellipse cx="272" cy="394" rx="240" ry="18" fill="#000" fill-opacity=".6"/>' +
    vari('r-sol', '<ellipse cx="236" cy="394" rx="130" ry="14" fill="' + D.halo('#bff8ff', CYANF) + '" fill-opacity=".3"/>', 1) +
    vari('rr-sol', '<ellipse cx="236" cy="394" rx="150" ry="17" fill="' + D.halo('#ffc8a0', ROUGE) + '" fill-opacity=".4"/>') +
    vari('lueurRouge', '<ellipse cx="272" cy="386" rx="260" ry="38" fill="' + D.doux('#ff7a20', .5) + '"/>');

  /* ================= A1. les cheminées (derrière tout) ================= */
  var chem = P('M398 128 L 402 58 L 416 58 L 418 128 Z', dg(NOIR)) + L('M413 64 L 414 124', LUNE, 1.6, so(.4)) + piv('capot1', 409, 64, P('M396 52 L 422 52 L 420 64 L 398 64 Z', dg(FER))) +
    P('M422 138 L 430 84 L 442 86 L 438 140 Z', dg(NOIR)) + piv('capot2', 436, 88, P('M426 78 L 448 82 L 444 92 L 426 88 Z', dg(FER))) +
    repere('chem1', 409, 50) + repere('chem2', 437, 78);

  /* ================= le bassin (bloc sombre derrière) ================= */
  var bassin = piv('bassin', 278, 300, P('M200 256 L 356 256 L 362 300 C 344 328 304 336 278 336 C 252 336 214 328 196 300 Z', dg(NOIR, .6)));

  /* ================= la jambe du fond (devant : elle est vers les héros) ================= */
  var piedF = pied(196, 382, .9, sombre(FER, .28), 13, 'piedF') + mousse([146, 388], [168, 380], 4, 3) +
    vari('colle', '<g transform="translate(168 388)"><path d="M-44 6 C -44 -10 -30 -16 -12 -14 C 6 -18 30 -16 40 -6 C 46 0 44 8 36 8 Z" fill="#d0e05a" fill-opacity=".92" stroke="#5a6420" stroke-width="1.6"/><path d="M-30 -6 Q -6 -14 26 -8" fill="none" stroke="#fbffd0" stroke-width="1.6" stroke-opacity=".8"/><circle cx="-20" cy="-4" r="3" fill="#e8f0a0" stroke="#5a6420" stroke-width="1"/><circle cx="14" cy="-8" r="2.4" fill="#e8f0a0" stroke="#5a6420" stroke-width="1"/></g>') +
    piv('filColle', 172, 393, vari('colleFil', F('M156 392 C 162 396 164 400 162 406 L 182 406 C 180 400 182 396 188 392 Z', '#d8e870', fo(.9)) + L('M168 394 L 168 404', '#fbffd0', 1.2, so(.8)))) +
    repere('piedFC', 190, 388);
  var tibiaF = engrenage(204, 354, 18, 9, sombre(FER, .35), .3, 'genouF') +
    plaque(tube([[204, 358], [202, 366], [200, 372]], [44, 50, 56]), sombre(FER, .3), [170, 334, 232, 392], {seed: 12, r: 4}) +
    piv('piedF', ART.chevilleF[0], ART.chevilleF[1], piedF) +
    plaque('M182 346 C 184 332 210 326 222 338 C 228 348 224 362 212 366 C 198 366 184 358 182 346 Z', sombre(FER, .25), [180, 326, 230, 368], {seed: 14, r: 2}) + couches('tibiaF') + repere('jGenouF', 204, 354);
  var jambeF = piv('hancheF', ART.hancheF[0], ART.hancheF[1], engrenage(232, 314, 20, 9, sombre(FER, .35), .2, 'hancheF') +
    plaque(tube([[230, 318], [216, 336], [206, 350]], [50, 50, 46]), sombre(ROUX, .3), [178, 292, 256, 372], {seed: 11}) + couches('hancheF') +
    piv('tibiaF', ART.genouF[0], ART.genouF[1], tibiaF) + repere('jHancheF', 232, 314));

  /* ================= A2. le bras du fond : celui qui frappe ================= */
  var ch = '<ellipse cx="96" cy="326" rx="4" ry="7" transform="rotate(14 96 326)"/><path d="M98 334 L 100 342"/><ellipse cx="101" cy="348" rx="4" ry="7" transform="rotate(-8 101 348)"/><path d="M102 356 L 102 362"/><ellipse cx="102" cy="368" rx="4" ry="6" transform="rotate(20 102 368)"/><path d="M104 374 L 108 378 M102 375 L 98 380"/>';
  var chaineF = '<g fill="none" stroke="' + O + '" stroke-width="5.4">' + ch + '</g><g fill="none" stroke="#8a7a74" stroke-width="2.6">' + ch + '</g>';
  var poingF = poing(66, 300, .98, sombre(ROUX, .12), 31, 'poingF') + repere('poingFC', 66, 300) + repere('poingFBout', 30, 302);
  var avbrasF = engrenage(130, 216, 23, 10, sombre(FER, .3), .1, 'coudeF') +
    plaque(tube([[128, 226], [110, 254], [96, 280]], [48, 58, 66]), sombre(ROUX, .18), [58, 196, 156, 314], {seed: 23}) +
    plaque('M150 206 C 152 222 146 236 134 242 C 128 232 124 220 126 208 C 132 200 144 200 150 206 Z', sombre(FER, .2), [122, 198, 154, 244], {seed: 24, r: 2}) +
    anneaux([[128, 226], [119, 240], [110, 254], [103, 267], [96, 280]], [48, 53, 58, 62, 66], [1, 3]) +
    runesV('avbrasF', [[124, 244, .85, 2, 30], [116, 256, .85, 5, 30], [108, 268, .85, 8, 30]]) + couches('avbrasF') +
    bague([92, 286], 146, 74, 18, sombre(FER, .2), 25) +
    piv('chaineF', 97, 320, chaineF) +
    piv('poingF', ART.poignetF[0], ART.poignetF[1], poingF) +
    racines([[118, 286, 28, 5], [132, 244, 22, 6]]) + repere('jCoudeF', 130, 216) + repere('jPoignetF', 92, 286);
  var brasF = plaque('M136 106 C 144 78 186 68 212 84 C 226 94 226 116 218 132 C 194 122 162 124 140 136 C 132 126 130 116 136 106 Z', sombre(FER, .25), [128, 66, 228, 138], {seed: 21}) +
    plaque('M140 132 C 162 120 194 120 216 130 L 212 146 C 192 138 164 138 146 148 Z', sombre(ROUX, .3), [138, 118, 218, 150], {seed: 26, c: 1, rainure: false}) +
    rangee([146, 104], [204, 86], 4, 2.4) + mousse([150, 84], [196, 72], 6, 27) +
    vari('feu-brasF', flamme(160, 80, 30, 16, -8) + flamme(176, 76, 40, 20, 0) + flamme(190, 74, 28, 14, 6)) +
    runesV('brasF', [[176, 96, .9, 6, -14]]) +
    plaque(tube([[172, 136], [152, 176], [136, 206]], [48, 46, 44]), sombre(ROUX, .3), [108, 110, 198, 230], {seed: 22}) +
    L('M150 152 C 162 160 174 162 186 160 M140 176 C 152 184 164 186 176 184', O, 2.2) + rangee([146, 158], [180, 164], 3, 2.2) + couches('brasF') +
    piv('avbrasF', ART.coudeF[0], ART.coudeF[1], avbrasF) + repere('jEpauleF', 176, 118) + repere('feuBrasF', 176, 78);

  /* ================= B. le torse, la couronne de la plaque, le cœur de runes ================= */
  var b = '';
  var torse = 'M196 106 C 166 112 148 132 144 164 C 140 200 152 232 180 254 C 198 268 222 276 248 278 L 318 278 C 344 274 362 260 374 236 C 390 204 398 162 392 128 C 386 108 368 96 344 94 C 296 88 236 96 196 106 Z';
  b += F(cuireChemin(torse, -3, 5, 0, 1), '#06030a', fo(.42)) + P(torse, dg(NOIR));
  /* les pistons de la taille, dans le creux sombre (ils pompent) */
  b += P('M216 266 L 336 266 L 334 296 L 218 296 Z', '#140c1c');
  var pist = '';
  [[236, 1], [272, .8], [310, 1]].forEach(function(p){ pist += P('M' + (p[0] - 3) + ' 278 L ' + (p[0] + 3) + ' 278 L ' + (p[0] + 3) + ' 294 L ' + (p[0] - 3) + ' 294 Z', dg('#c8ccd8')) + L('M' + (p[0] + 1.5) + ' 279 L ' + (p[0] + 1.5) + ' 293', '#ffffff', 1, so(.7)); });
  b += piv('x-pistons', 272, 294, pist);
  [[236, 1], [272, .8], [310, 1]].forEach(function(p){ b += P('M' + (p[0] - 7) + ' 268 L ' + (p[0] + 7) + ' 268 L ' + (p[0] + 7) + ' 280 L ' + (p[0] - 7) + ' 280 Z', dg(FER)); });
  b += vari('r-pistons', '<ellipse cx="276" cy="284" rx="50" ry="10" fill="' + D.halo('#bff8ff', CYANF) + '" fill-opacity=".35"/>', 1) + vari('rr-pistons', '<ellipse cx="276" cy="284" rx="50" ry="10" fill="' + D.halo('#ffd0b0', ROUGE) + '" fill-opacity=".4"/>');
  /* la plaque du dos, le plastron, ses lignes de tôle, la fente lumineuse */
  b += plaque('M330 96 C 358 96 382 106 390 124 C 398 156 394 200 380 232 C 372 252 360 266 344 274 C 344 230 342 160 330 96 Z', ROUX, [328, 92, 398, 278], {seed: 41});
  b += rangee([344, 114], [366, 252], 6, 2.8);
  b += plaque('M198 108 C 170 114 152 134 148 164 C 144 198 156 230 182 250 C 198 262 222 270 248 272 L 338 270 C 338 226 336 158 324 98 C 290 94 236 100 198 108 Z', FER, [144, 92, 340, 274], {seed: 42});
  b += L('M156 214 C 180 222 200 226 214 226 M300 230 C 314 232 326 232 336 230', O, 2.4) + L('M157 218 C 180 226 200 229 214 229', LUNE, 1.2, so(.35));
  b += lueurV('plastron', 'M328 104 C 336 150 340 220 340 262', 1.1);
  b += bosse('bosse0', 300, 238, 9);
  /* les lames du ventre, le col */
  b += plaque('M168 240 C 210 258 290 262 346 252 L 348 268 C 296 280 214 276 164 256 Z', sombre(ROUX, .1), [162, 236, 350, 280], {seed: 43, c: 3});
  b += rangee([180, 254], [336, 264], 7, 2.4);
  b += plaque('M184 104 C 224 86 302 82 346 94 C 354 106 348 120 336 124 C 292 110 234 114 196 130 C 184 124 180 112 184 104 Z', sombre(FER, .1), [180, 82, 356, 132], {seed: 45});
  b += rangee([200, 118], [334, 110], 7, 2.4);
  b += lueurV('col', 'M200 132 C 236 120 290 116 334 126', 1.1);
  /* le halo du cœur, la couronne de fer boulonnée */
  b += vari('r-halo', '<circle cx="' + HX + '" cy="' + HY + '" r="100" fill="' + D.halo('#c8ffff', CYANF) + '" fill-opacity=".28"/>', 1) +
    vari('rr-halo', '<circle cx="' + HX + '" cy="' + HY + '" r="104" fill="' + D.halo('#ffd8b8', ROUGE) + '" fill-opacity=".34"/>');
  b += plaque(ell(HX, HY, 70, 74) + ' ' + ell(HX, HY, 55, 59), sombre(FER, .05), [HX - 72, HY - 76, HX + 72, HY + 76], {seed: 50, eo: true, r: 8, c: 4});
  var cr = [];
  for(var i = 0; i < 12; i++){ var a = i / 12 * Math.PI * 2 + .2; cr.push([HX + Math.cos(a) * 63, HY + Math.sin(a) * 67]); }
  b += rivets(cr, 3.6);
  b += couches('torse', [[176, 262, 14], [214, 274, 18], [260, 278, 12], [312, 274, 16], [386, 220, 12]]);
  /* la cavité, sa lueur, l'anneau de runes qui tourne, le cristal du cœur */
  var creux = ell(HX, HY, 55, 59);
  b += P(creux, '#0a1822');
  b += vari('r-creux', F(creux, D.halo('#ffffff', '#2ad8ff')), 1) + vari('rr-creux', F(creux, D.halo('#fff0d8', '#ff4a1a')));
  var anR = [];
  for(var q = 0; q < 8; q++){ var aq = q / 8 * Math.PI * 2, rq = aq * 180 / Math.PI + 90, cq = rotP([3 * .95, 5 * .95], rq, [0, 0]); anR.push([HX + Math.cos(aq) * 40 - cq[0], HY + Math.sin(aq) * 43 - cq[1], .95, q * 3 + 1, rq]); }
  b += piv('x-anneau', HX, HY, L(ell(HX, HY, 48, 51), '#06202c', 2, so(.5)) + L(ell(HX, HY, 31, 34), '#06202c', 1.6, so(.45)) + runesV('anneau', anR));
  var cristal = 'M244 158 L 258 176 L 254 204 L 244 212 L 234 204 L 230 176 Z';
  var facettes = 'M230 176 L 244 184 L 258 176 M244 184 L 244 212 M244 158 L 244 184';
  b += piv('coeur', HX, HY, P(cristal, '#16323e', ' stroke-width="2.4"') +
    vari('r-cristal', '<circle cx="' + HX + '" cy="' + HY + '" r="34" fill="' + D.doux('#e8ffff', .85) + '"/>' + P(cristal, D.lin([[0, '#ffffff'], [.5, '#9ffaff'], [1, '#1ec8ff']], 1, 0, 0, 1), ' stroke-width="2.4"') + L(facettes, '#ffffff', 1.2, so(.8)), 1) +
    vari('rr-cristal', '<circle cx="' + HX + '" cy="' + HY + '" r="34" fill="' + D.doux('#ffd8b0', .85) + '"/>' + P(cristal, D.lin([[0, '#fff4e0'], [.5, '#ff9a5a'], [1, '#e0301a']], 1, 0, 0, 1), ' stroke-width="2.4"') + L(facettes, '#fff0e0', 1.2, so(.8))) +
    L('M250 166 L 254 178', '#ffffff', 2, so(.8)));
  /* le point faible ouvert : une grande lueur qui palpite, un anneau, des rayons, des éclats (caché) */
  var ray12 = '';
  for(var k = 0; k < 12; k++){ var ak = k / 12 * Math.PI * 2 + .13, r0 = 64, r1 = k % 2 ? 92 : 108; ray12 += 'M' + f1(HX + Math.cos(ak) * r0) + ' ' + f1(HY + Math.sin(ak) * r0) + ' L ' + f1(HX + Math.cos(ak) * r1) + ' ' + f1(HY + Math.sin(ak) * r1) + ' '; }
  var ecl = '';
  [[-58, -52, 9], [62, -40, 8], [70, 30, 10], [-64, 44, 8], [10, -78, 7], [-20, 80, 7]].forEach(function(e){ ecl += cuireChemin(eclatD(e[2]), HX + e[0], HY + e[1], 0, 1); });
  b += vari('pf', piv('x-pf', HX, HY, '<circle cx="' + HX + '" cy="' + HY + '" r="112" fill="' + D.doux('#fff6c8', .8) + '"/><circle cx="' + HX + '" cy="' + HY + '" r="64" fill="' + D.doux('#ffffff', 1) + '"/>' +
    L(ray12, '#fff8d0', 5, so(.55)) + L(ray12, '#ffffff', 2)) + piv('x-pfAnneau', HX, HY, L(ell(HX, HY, 68, 72), '#fff8d0', 3.4, ' stroke-dasharray="8 9"') + F(ecl, '#ffffff')));
  /* les runes gravées en arc autour (elles s'allument une à une au réveil) */
  for(var m = 0; m < 7; m++){ var a4 = Math.PI * (1.1 + m * .125); b += runesV('arc' + m, [[HX + Math.cos(a4) * 86 - 3, HY + Math.sin(a4) * 88 - 5, .95, 1 + m * 3, 0]]); }
  b += repere('centre', 262, 196) + repere('coeurC', HX, HY) + repere('torseHaut', 300, 98) + repere('jTaille', 276, 282);

  /* ================= le torse arraché (après l'explosion : caché jusque-là) ================= */
  var bordM = 'M156 214 L 170 200 L 182 214 L 196 190 L 212 210 L 226 186 L 242 206 L 258 180 L 272 204 L 290 186 L 304 208 L 320 190 L 334 212 L 350 196 L 364 216 L 380 204';
  var moignon = plaque(bordM + ' C 380 216 378 226 374 236 C 362 260 344 274 318 278 L 248 278 C 222 276 198 268 180 254 C 168 244 160 230 156 214 Z', FER, [150, 180, 384, 280], {seed: 92, couche: false});
  moignon += L(cuireChemin(bordM, 0, 7, 0, 1), '#0c0612', 12, so(.9));
  moignon += P('M232 210 L 240 208 L 242 172 L 236 168 Z', dg('#c8ccd8'), ' stroke-width="2"') + P('M300 214 L 308 214 L 312 184 L 304 180 Z', dg('#c8ccd8'), ' stroke-width="2"') + P('M262 214 C 262 196 270 182 282 176 L 288 182 C 278 188 272 200 272 214 Z', dg(NOIR), ' stroke-width="2"');
  moignon += plaque('M168 240 C 210 258 290 262 346 252 L 348 268 C 296 280 214 276 164 256 Z', sombre(ROUX, .1), [162, 236, 350, 280], {seed: 43, c: 3, couche: false}) + rangee([180, 254], [336, 264], 7, 2.4);
  moignon += L(bordM, '#ff6a1a', 8, so(.35)) + L(bordM, '#ff9a30', 3.6) + L(bordM, '#ffe08a', 1.4);
  moignon += '<g data-j="x-braisesRestes">' + F(rond(196, 196, 2.6) + rond(226, 192, 2) + rond(258, 186, 2.8) + rond(290, 192, 2.2) + rond(320, 196, 2.6) + rond(350, 202, 2) + rond(210, 214, 1.6) + rond(304, 212, 1.8), '#ffb040') + F(rond(258, 186, 1.2) + rond(320, 196, 1.2), '#fff0b0') + '</g>';
  var moignonV = vari('moignon', moignon);

  /* ================= la ceinture (devant le torse) ================= */
  var ceint = plaque('M190 286 C 236 300 316 302 366 288 L 368 308 C 316 322 236 320 188 306 Z', sombre(FER, .12), [186, 284, 370, 324], {seed: 69});
  ceint += rangee([202, 300], [356, 302], 8, 2.6);
  ceint += plaque('M262 294 L 294 295 L 292 322 L 264 321 Z', BRONZE, [260, 292, 296, 324], {seed: 68, r: 2, c: 0, rainure: false}) + runesV('ceinture', [[275, 301, 1.1, 10, 0]]);
  ceint += plaque('M196 304 C 216 312 238 316 256 316 L 252 338 C 238 350 212 348 200 336 Z', sombre(ROUX, .15), [194, 302, 258, 350], {seed: 70});
  ceint += rangee([206, 316], [246, 322], 3, 2.4) + couches('ceinture');

  /* ================= la jambe proche (derrière, côté lumière) ================= */
  var piedP = pied(342, 381, 1.02, FER, 74, 'pied') + mousse([290, 380], [316, 372], 5, 13) + repere('piedC', 336, 390);
  var tibia = engrenage(348, 356, 20, 10, FER, .2, 'genou') +
    plaque(tube([[348, 360], [350, 368], [352, 374]], [48, 54, 60]), FER, [318, 336, 384, 392], {seed: 72, r: 5}) +
    piv('pied', ART.cheville[0], ART.cheville[1], piedP) +
    plaque('M330 350 C 332 334 360 328 372 340 C 378 352 372 366 360 370 C 344 370 330 362 330 350 Z', sombre(FER, .05), [328, 328, 380, 372], {seed: 73, r: 3}) +
    runesV('tibia', [[349, 344, .9, 5, 0]]) + couches('tibia') + repere('jGenou', 348, 356);
  var cuisse1 = engrenage(330, 316, 22, 10, FER, .1, 'hanche') + plaque(tube([[330, 320], [340, 336], [346, 350]], [58, 54, 50]), ROUX, [300, 292, 372, 374], {seed: 71}) + couches('cuisse1') + repere('jHanche', 330, 316);
  var cuisse2 = piv('tibia', ART.genou[0], ART.genou[1], tibia) +
    plaque('M292 316 C 316 316 346 310 366 302 L 372 332 C 356 348 322 354 298 344 Z', ROUX, [290, 300, 374, 356], {seed: 75}) +
    rangee([302, 324], [358, 316], 4, 2.6) + couches('cuisse2') +
    lierre([[300, 392], [310, 378], [330, 372], [352, 378], [370, 366], [374, 348], [366, 334], [372, 318]], 41);

  /* ================= B2. la plaque (trappe de bronze), la fente lumineuse, la tête ================= */
  var tp = '';
  var trappe = ell(HX - 2, HY, 49, 56);
  var patine = '';
  [[HX - 30, HY + 30, 14, 8], [HX + 20, HY - 40, 10, 6], [HX - 36, HY - 20, 8, 12], [HX + 24, HY + 34, 12, 7], [HX - 6, HY + 44, 9, 5]].forEach(function(v){ patine += ovale(v[0], v[1], v[2], v[3]); });
  var patine2 = '';
  [[HX - 30, HY + 30, 14, 8], [HX + 20, HY - 40, 10, 6], [HX - 36, HY - 20, 8, 12], [HX + 24, HY + 34, 12, 7], [HX - 6, HY + 44, 9, 5]].forEach(function(v){ patine2 += ovale(v[0], v[1], v[2] * .6, v[3] * .6); });
  tp += plaque(trappe, BRONZE, [HX - 52, HY - 58, HX + 48, HY + 58], {seed: 51, r: 10, c: 4, extra: F(patine, '#4ab89a', fo(.25)) + F(patine2, '#4ab89a', fo(.35))});
  tp += '<ellipse cx="' + (HX - 3) + '" cy="' + HY + '" rx="38" ry="44" fill="none" stroke="' + O + '" stroke-width="2.4"/><ellipse cx="' + (HX - 4) + '" cy="' + (HY + 1.5) + '" rx="36" ry="42" fill="none" stroke="#f0c890" stroke-width="1.4" stroke-opacity=".4"/>';
  var rv = [];
  for(var j = 0; j < 14; j++){ var a2 = j / 14 * Math.PI * 2; rv.push([HX - 2 + Math.cos(a2) * 44, HY + Math.sin(a2) * 51]); }
  tp += rivets(rv, 2.6);
  tp += '<circle cx="' + (HX - 4) + '" cy="' + HY + '" r="17" fill="' + dg(clair(BRONZE, .12)) + '" stroke="' + O + '" stroke-width="3"/><circle cx="' + (HX - 4) + '" cy="' + HY + '" r="12" fill="none" stroke="#5a3a1a" stroke-width="1.4" stroke-opacity=".6"/>';
  tp += runesV('plaque', [[HX - 7.5, HY - 8, 1.5, 8, 0]]);
  tp += lueurV('plaque', 'M' + (HX + 12) + ' ' + (HY - 54) + ' L ' + (HX + 8) + ' ' + (HY - 42) + ' L ' + (HX + 14) + ' ' + (HY - 36) + ' L ' + (HX + 6) + ' ' + (HY - 22), 1.2) + lueurV('plaque', 'M' + (HX - 44) + ' ' + (HY + 20) + ' L ' + (HX - 34) + ' ' + (HY + 24) + ' L ' + (HX - 30) + ' ' + (HY + 34), 1);
  /* charnières à gauche, loquet à droite */
  tp += P('M' + (HX - 60) + ' ' + (HY - 36) + ' l 16 -2 l 2 20 l -16 2 Z', dg(FER)) + P('M' + (HX - 60) + ' ' + (HY + 16) + ' l 16 -2 l 2 20 l -16 2 Z', dg(FER));
  tp += L('M' + (HX - 53) + ' ' + (HY - 37) + ' l 1 20 M' + (HX - 53) + ' ' + (HY + 15) + ' l 1 20', '#120a18', 1.6, so(.6)) + L('M' + (HX - 48) + ' ' + (HY - 37) + ' l 1 20 M' + (HX - 48) + ' ' + (HY + 15) + ' l 1 20', LUNE, 1.2, so(.5));
  tp += piv('loquet', HX + 38, HY - 2, P('M' + (HX + 36) + ' ' + (HY - 8) + ' L ' + (HX + 66) + ' ' + (HY - 13) + ' L ' + (HX + 68) + ' ' + (HY - 2) + ' L ' + (HX + 38) + ' ' + (HY + 4) + ' Z', dg(FER)) + rivets([[HX + 62, HY - 7]], 2.4)) + rivets([[HX + 41, HY - 2]], 3);
  /* l'acide qui ronge la rouille, le givre, les fêlures, la bosse (cachés) */
  var acide = '', R7 = rng(77);
  for(var ia = 0; ia < 16; ia++) acide += ovale(HX - 40 + R7() * 76, HY - 46 + R7() * 92, 3 + R7() * 7, 2 + R7() * 5);
  tp += vari('acide', F(trappe, acideG, fo(.62)) + F(acide, '#e8ff8a', fo(.55)) + F(acide.replace(/a (\d+\.\d) (\d+\.\d)/g, function(m0, x0, y0){ return 'a ' + f1(x0 * .5) + ' ' + f1(y0 * .5); }), '#3a5a10', fo(.5)) + L(trappe, '#c8ff60', 3, so(.7)));
  var crist = '', R8 = rng(88);
  for(var ig = 0; ig < 10; ig++){ var gx = HX - 40 + R8() * 76, gy = HY - 46 + R8() * 92, gs = 5 + R8() * 6; crist += cuireChemin('M-1.5 0 L 0 -8 L 1.5 0 Z M0 -1.5 L 8 0 L 0 1.5 Z M-1.5 0 L 0 8 L 1.5 0 Z M0 -1.5 L -8 0 L 0 1.5 Z', gx, gy, R8() * 45, gs / 8); }
  tp += vari('gelP', F(trappe, gelG, fo(.82)) + L(trappe, '#ffffff', 3, so(.8)) + F(crist, '#ffffff', fo(.9)) + L('M' + (HX - 30) + ' ' + (HY - 40) + ' Q ' + (HX - 10) + ' ' + (HY - 50) + ' ' + (HX + 20) + ' ' + (HY - 44), '#ffffff', 2.4, so(.8)));
  var fel = [
    'M' + (HX - 2) + ' ' + HY + ' L ' + (HX + 10) + ' ' + (HY - 18) + ' L ' + (HX + 6) + ' ' + (HY - 34) + ' L ' + (HX + 20) + ' ' + (HY - 50) + ' M' + (HX - 2) + ' ' + HY + ' L ' + (HX - 22) + ' ' + (HY + 10) + ' L ' + (HX - 30) + ' ' + (HY + 30),
    'M' + (HX + 10) + ' ' + (HY - 18) + ' L ' + (HX + 30) + ' ' + (HY - 14) + ' L ' + (HX + 44) + ' ' + (HY - 22) + ' M' + (HX - 2) + ' ' + HY + ' L ' + (HX + 12) + ' ' + (HY + 22) + ' L ' + (HX + 8) + ' ' + (HY + 40) + ' L ' + (HX + 18) + ' ' + (HY + 54),
    'M' + (HX - 22) + ' ' + (HY + 10) + ' L ' + (HX - 40) + ' ' + (HY + 2) + ' L ' + (HX - 48) + ' ' + (HY - 14) + ' M' + (HX - 2) + ' ' + HY + ' L ' + (HX - 16) + ' ' + (HY - 20) + ' L ' + (HX - 12) + ' ' + (HY - 40) + ' L ' + (HX - 24) + ' ' + (HY - 52) + ' M' + (HX + 12) + ' ' + (HY + 22) + ' L ' + (HX + 34) + ' ' + (HY + 28) + ' L ' + (HX + 44) + ' ' + (HY + 20)
  ];
  fel.forEach(function(d, n){ tp += vari('fel' + n, L(d, '#14304a', 4) + L(d, '#f4fdff', 1.6)); });
  tp += couches('plaque');
  tp += repere('plaqueC', HX - 6, HY) + repere('plaqueBord', HX + 40, HY - 10) + repere('charnH', HX - 52, HY - 27) + repere('charnB', HX - 52, HY + 25);
  var b2 = piv('plaque', PIV_PLAQUE[0], PIV_PLAQUE[1], '<g transform="translate(-6 0) rotate(-5 ' + HX + ' ' + HY + ')">' + tp + '</g>');
  /* la lumière qui fuit par la jointure (plus forte du côté entrouvert), et ses rais */
  var fente = 'M' + (HX + 26) + ' ' + (HY - 54) + ' C ' + (HX + 46) + ' ' + (HY - 40) + ' ' + (HX + 52) + ' ' + (HY - 10) + ' ' + (HX + 48) + ' ' + (HY + 20) + ' C ' + (HX + 46) + ' ' + (HY + 38) + ' ' + (HX + 38) + ' ' + (HY + 50) + ' ' + (HX + 26) + ' ' + (HY + 56);
  var rais = '';
  [[-40, 120], [-12, 140], [18, 120]].forEach(function(r){ var a3 = r[0] * Math.PI / 180, x0 = HX + 48, y0 = HY + r[0] * .3; rais += 'M' + f1(x0) + ' ' + f1(y0 - 3) + ' L ' + f1(x0 + Math.cos(a3) * r[1]) + ' ' + f1(y0 + Math.sin(a3) * r[1] - 9) + ' L ' + f1(x0 + Math.cos(a3) * r[1]) + ' ' + f1(y0 + Math.sin(a3) * r[1] + 9) + ' L ' + f1(x0) + ' ' + f1(y0 + 3) + ' Z '; });
  b2 += vari('fente', L(fente, '#0c0814', 3, so(.8)), 1) +
    vari('r-fente', L(fente, CYANF, 16, so(.2)) + L(fente, CYANF, 7, so(.5)) + L(fente, '#e8ffff', 2.2, so(.95)) + F(rais, '#bff8ff', fo(.09)), 1) +
    vari('rr-fente', L(fente, ROUGE, 16, so(.24)) + L(fente, ROUGE, 7, so(.55)) + L(fente, '#ffe0c8', 2.2, so(.95)) + F(rais, '#ffc0a0', fo(.1)));

  /* ---------- la tête, enfoncée entre les épaules (la fiche l'agrandit de 1,1) ---------- */
  var t = '';
  t += P('M206 100 L 262 98 L 262 128 L 210 130 Z', dg(NOIR)) + engrenage(236, 116, 14, 8, FER, .2, 'cou');
  t += L('M212 104 C 206 116 210 126 216 132 M258 102 C 264 114 260 124 254 130', '#2a2232', 3.6);
  t += plaque('M182 82 C 178 56 192 34 218 28 C 246 22 274 34 282 58 C 288 78 284 98 274 110 L 190 110 C 184 102 180 92 182 82 Z', FER, [178, 22, 290, 112], {seed: 61, c: 4});
  t += plaque('M264 38 C 272 26 284 18 296 14 L 294 22 L 300 24 L 292 30 L 296 36 L 286 36 C 280 40 276 44 274 48 Z', sombre(FER, .1), [260, 12, 302, 50], {seed: 62, r: 2, c: 1});
  t += F('M286 24 L 294 22 L 292 30 Z', '#2a2232', fo(.6));
  t += plaque('M208 34 C 226 16 258 18 274 40 L 266 46 C 252 30 230 28 214 40 Z', sombre(FER, .15), [206, 16, 276, 48], {seed: 64, r: 2, c: 0});
  t += rivets([[220, 30], [236, 24], [254, 26]], 2.2);
  t += bosse('bosse2', 208, 56, 7);
  /* la gueule (derrière la mâchoire) : on la voit quand il ouvre la bouche */
  t += P('M188 98 L 268 96 L 264 124 C 244 134 210 134 192 124 Z', '#0a0610') + vari('r-gueule', '<ellipse cx="228" cy="112" rx="30" ry="9" fill="' + D.doux('#7ae8ff', .8) + '"/>', 1) + vari('rr-gueule', '<ellipse cx="228" cy="112" rx="30" ry="9" fill="' + D.doux('#ff7a4a', .85) + '"/>');
  var mach = plaque('M184 94 C 200 98 232 100 264 98 L 272 106 C 270 122 254 134 228 136 C 204 136 186 130 178 118 C 174 108 176 100 184 94 Z', ROUX, [174, 92, 274, 138], {seed: 63, c: 3});
  mach += L('M198 106 L 198 126 M208 107 L 208 130 M218 107 L 218 132 M228 107 L 228 132 M238 106 L 238 131 M248 105 L 248 128', '#120a18', 2.8) + L('M199 108 L 199 124 M209 109 L 209 128 M219 109 L 219 130 M229 109 L 229 130 M239 108 L 239 129', '#e0a878', .9, so(.4));
  mach += rivets([[186, 104], [262, 104]], 2.4) + couches('machoire', [[196, 132, 8], [222, 136, 10], [248, 132, 7]]) + repere('bouche', 214, 120);
  t += piv('machoire', 266, 100, mach);
  /* l'arcade en V, la fente des yeux : cyan (allumés), rouges (enragé), éteints (sombres) */
  t += P('M184 78 C 192 72 206 72 222 80 C 236 72 256 68 270 70 L 272 80 C 258 80 240 84 226 92 C 210 86 196 84 186 88 Z', '#08040e');
  var oeilG = 'M194 82 C 200 80 208 81 214 85 C 208 87 200 86 194 82 Z', oeilD = 'M236 84 C 244 78 254 76 262 76 C 256 82 246 86 236 84 Z';
  var refl = 'M198 82.6 C 202 82 207 82.4 211 84.4 C 207 85 202 84.4 198 82.6 Z M240 83.4 C 246 80 252 78.6 258 78 C 253 81.4 246 84 240 83.4 Z';
  t += vari('yeux', '<ellipse cx="230" cy="84" rx="52" ry="20" fill="' + D.halo('#e8ffff', '#3ab8ff') + '" fill-opacity=".7"/>' + F(oeilG + ' ' + oeilD, '#5fd8ff') + F(refl, '#f4feff') + L('M170 84 L 216 85 M234 82 L 292 74', '#bff4ff', .9, so(.55)), 1);
  t += vari('yeuxR', '<ellipse cx="230" cy="84" rx="56" ry="22" fill="' + D.halo('#ffe8c8', '#ff3a1a') + '" fill-opacity=".8"/>' + F(oeilG + ' ' + oeilD, '#ff6a3a') + F(refl, '#fff4e0') + L('M170 84 L 216 85 M234 82 L 292 74', '#ffc8a0', .9, so(.6)));
  t += vari('yeuxFort', '<ellipse cx="230" cy="84" rx="78" ry="30" fill="' + D.doux('#dffcff', .75) + '"/>' + L('M150 85 L 216 85 M234 82 L 312 70', '#ffffff', 1.4, so(.8)));
  t += plaque('M178 74 C 190 62 208 62 224 72 C 240 60 264 56 282 60 L 282 70 C 266 68 246 72 226 84 C 208 74 192 74 180 82 Z', sombre(FER, .2), [176, 56, 284, 86], {seed: 65, r: 2, c: 1});
  t += runesV('tete', [[222, 46, 1.2, 0, 0], [236, 50, 1, 9, 0]]);
  t += engrenage(272, 88, 11, 8, sombre(FER, .1), .4, 'tempe') + rivets([[272, 88]], 3.4);
  t += mousse([204, 30], [252, 24], 8, 9);
  t += racines([[262, 112, 20, 8], [190, 124, 14, 18]]);
  t += couches('tete');
  t += vari('feu-tete', flamme(212, 26, 34, 18, -10) + flamme(228, 22, 46, 22, -2) + flamme(244, 22, 36, 18, 6));
  t += repere('tete', 230, 70) + repere('cou', 236, 128) + repere('haut', 232, 14) + repere('oeil', 230, 84) + repere('feuTete', 228, 20);
  /* les étoiles de l'éblouissement (elles tourneront autour de la tête) */
  var et = '';
  for(var ie = 0; ie < 5; ie++){ var re = 13 - (ie % 2) * 3; et += '<g data-j="x-et' + ie + '"><circle r="' + f1(re * 1.35) + '" fill="' + D.doux('#fff6c0', .55) + '"/><path d="' + etoileD(re, 5, .45) + '" fill="#ffe466" stroke="' + O + '" stroke-width="2.2"/><path d="' + etoileD(re * .42, 5, .45) + '" fill="#fffbe0"/></g>'; }
  t += vari('etoiles', et);
  var teteP = piv('tete', ART.cou[0], ART.cou[1], '<g transform="translate(230 104) scale(1.1) translate(-230 -104)">' + t + '</g>' + L('M218 28 C 246 22 272 32 282 56', LUNE, 2.4, so(.7)));
  b2 += teteP;

  /* ================= C. le bras proche, l'épaulière ================= */
  var poingP = poing(440, 350, 1.12, ROUX, 84, 'poing') + repere('poingC', 440, 352);
  var avbras = engrenage(412, 238, 27, 11, FER, .15, 'coude') +
    plaque(tube([[410, 248], [422, 282], [434, 314]], [54, 66, 76]), ROUX, [378, 218, 476, 352], {seed: 82}) +
    plaque('M436 252 C 452 268 464 290 468 310 L 454 314 C 448 292 438 272 424 258 Z', sombre(FER, .05), [420, 248, 470, 316], {seed: 88, r: 2, c: 1}) +
    anneaux([[410, 248], [416, 265], [422, 282], [428, 298], [434, 314]], [54, 60, 66, 71, 76], [1, 3]) +
    runesV('avbras', [[410, 270, 1, 0, -14], [414, 286, 1, 3, -14], [419, 302, 1, 6, -14]]) +
    L('M398 256 C 404 282 412 302 420 320', '#120a18', 2, so(.45)) +
    plaque('M408 220 C 426 212 452 220 456 240 C 460 258 448 270 432 272 C 438 254 432 234 408 220 Z', sombre(FER, .1), [404, 210, 462, 274], {seed: 89, r: 2, c: 1}) +
    rivets([[444, 246]], 3) + couches('avbras') +
    bague([440, 318], 110, 88, 20, sombre(FER, .1), 83) +
    piv('poing', ART.poignet[0], ART.poignet[1], poingP) +
    mousse([418, 304], [460, 314], 6, 17) + repere('jCoude', 412, 238) + repere('jPoignet', 440, 318);
  var bras = tuyau([[[388, 176], [456, 156], [482, 222], [450, 264]]], 15, sombre(NOIR, .1)) +
    P('M380 168 L 396 166 L 398 188 L 382 190 Z', dg(FER)) + rivets([[389, 178]], 2.4) +
    engrenage(388, 150, 24, 11, FER, 0, 'epaule') +
    plaque(tube([[394, 154], [404, 196], [410, 226]], [56, 54, 50]), ROUX, [362, 124, 440, 252], {seed: 81}) +
    L('M382 196 C 394 202 410 204 428 200 M384 214 C 396 220 412 222 430 218', O, 2.2) + rangee([388, 204], [424, 206], 3, 2.2) + couches('bras') +
    piv('avbras', ART.coude[0], ART.coude[1], avbras) + repere('jEpaule', 388, 150);
  /* l'épaulière, avec un morceau arraché qui montre les rouages, et le fil qui pend et crépite */
  var ep = 'M330 108 C 340 80 372 68 404 76 C 418 80 428 86 434 94 L 424 100 L 432 108 L 422 112 L 440 122 C 442 140 432 156 418 164 C 400 150 370 140 340 140 C 330 132 326 120 330 108 Z';
  var e = F('M434 94 L 424 100 L 432 108 L 422 112 L 440 122 C 446 110 442 100 434 94 Z', '#120a18');
  e += engrenage(436, 110, 10, 7, '#a08a6a', .5, 'dechire');
  e += piv('fil', 432, 116, L('M432 116 C 444 130 450 146 446 160', O, 4.4) + L('M432 116 C 444 130 450 146 446 160', '#c8452a', 2.2) +
    piv('x-etincelle', 446, 161, '<circle cx="446" cy="161" r="10" fill="' + D.halo('#fff6c0', '#ffb030') + '" fill-opacity=".85"/>' + C(446, 161, 3, '#fffbe0') + L('M446 161 l 7 -5 M446 161 l 8 4 M446 161 l 2 8 M446 161 l -6 5', '#fff0a0', 1.2)) + repere('fil', 446, 161));
  e += plaque(ep, FER, [326, 66, 444, 166], {seed: 85, c: 5});
  e += plaque('M336 140 C 372 142 404 152 422 166 L 416 182 C 398 170 370 162 340 160 Z', sombre(ROUX, .05), [334, 138, 424, 184], {seed: 86, c: 2});
  e += plaque('M342 160 C 370 162 396 170 414 182 L 408 196 C 392 186 368 180 346 178 Z', sombre(ROUX, .15), [340, 158, 416, 198], {seed: 87, c: 2});
  e += rangee([344, 112], [420, 140], 5, 2.8) + rangee([346, 150], [410, 170], 4, 2.2);
  e += bosse('bosse1', 372, 118, 8);
  e += runesV('epaule', [[370, 96, 1, 7, -10], [384, 96, 1, 1, -10]]);
  e += mousse([340, 96], [398, 74], 9, 21) + mousse([300, 92], [328, 90], 5, 22);
  e += racines([[342, 140, 34, 31], [356, 146, 50, 32], [400, 162, 26, 33], [334, 128, 22, 34]]);
  [[358, 80, 1], [367, 76, .8], [308, 86, .7]].forEach(function(mm){
    var x = mm[0], y = mm[1], k = mm[2];
    e += P('M' + f1(x - 1.6 * k) + ' ' + y + ' L ' + f1(x - 1.2 * k) + ' ' + f1(y - 9 * k) + ' L ' + f1(x + 1.2 * k) + ' ' + f1(y - 9 * k) + ' L ' + f1(x + 1.6 * k) + ' ' + y + ' Z', '#efe4cc', ' stroke-width="1.6"');
    e += P('M' + f1(x - 7 * k) + ' ' + f1(y - 8 * k) + ' C ' + f1(x - 6 * k) + ' ' + f1(y - 16 * k) + ' ' + f1(x + 6 * k) + ' ' + f1(y - 16 * k) + ' ' + f1(x + 7 * k) + ' ' + f1(y - 8 * k) + ' Z', dg('#d8b88a'), ' stroke-width="1.8"') + C(f1(x + 2 * k), f1(y - 12 * k), f1(1.2 * k), '#fff8e8');
  });
  e += lueurV('epaule', 'M332 120 C 350 118 380 124 404 138', .9);
  e += L('M372 70 C 400 70 426 84 436 96', LUNE, 2.4, so(.7));
  e += couches('epaule', [[350, 142, 12], [380, 150, 16], [408, 164, 12], [412, 192, 10]]);
  e += vari('feu-epaule', flamme(350, 92, 40, 20, -12) + flamme(368, 82, 52, 24, -4) + flamme(386, 78, 40, 20, 6) + flamme(312, 88, 28, 14, -6));
  e += repere('feuEpaule', 370, 76) + repere('epauleHaut', 380, 74);
  var epaule = piv('epaule', ART.epaule[0], ART.epaule[1], e);

  /* ================= l'assemblage ================= */
  function buste(c){ return piv('buste', ART.buste[0], ART.buste[1], c); }
  return slot('fixeArr') +
    piv('pos', 272, SOL, sol +
      piv('saut', 272, SOL, piv('secousse', 272, 260,
        buste(chem) + bassin + jambeF + buste(piv('brasF', ART.epauleF[0], ART.epauleF[1], brasF)) +
        buste(b) +
        piv('cuisse', ART.hanche[0], ART.hanche[1], cuisse1) + moignonV + piv('ceinture', 278, 304, ceint) + piv('cuisse', ART.hanche[0], ART.hanche[1], cuisse2) +
        buste(b2) +
        buste(piv('bras', ART.epaule[0], ART.epaule[1], bras) + epaule)) + repere('pieds', 272, 392))) +
    slot('monde') + slot('fixe');
}

/* =====================================================================
   B. Les poses ; la cinématique inverse (une jambe ou un bras = deux os : on donne le bout, on obtient les angles)
   ===================================================================== */
function deg(r){ return r * 180 / Math.PI; }
function nrm(a){ while(a > Math.PI) a -= 2 * Math.PI; while(a < -Math.PI) a += 2 * Math.PI; return a; }
function angle(a, b){ return Math.atan2(b[1] - a[1], b[0] - a[0]); }
/* H (hanche ou épaule), K (genou ou coude), A (cheville ou poignet) au repos ; T : où amener A. Même sens de pliure qu'au repos.
   r1 : rotation du premier os ; r2 : celle du second (relative au premier) ; r3 : ce qu'il faut au bout pour rester à plat. */
function ik(H, K, A, T){
  var l1 = Math.hypot(K[0] - H[0], K[1] - H[1]), l2 = Math.hypot(A[0] - K[0], A[1] - K[1]), dx = T[0] - H[0], dy = T[1] - H[1];
  var d = Math.max(Math.abs(l1 - l2) + .5, Math.min(l1 + l2 - .3, Math.hypot(dx, dy)));
  var base = Math.atan2(dy, dx), c = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), A1 = Math.acos(Math.max(-1, Math.min(1, c)));
  var sens = nrm(angle(H, K) - angle(H, A)) >= 0 ? 1 : -1;
  var a1 = base + sens * A1, Kn = [H[0] + Math.cos(a1) * l1, H[1] + Math.sin(a1) * l1], Tn = [H[0] + Math.cos(base) * d, H[1] + Math.sin(base) * d];
  var r1 = deg(nrm(a1 - angle(H, K))), r2 = deg(nrm(angle(Kn, Tn) - angle(K, A)));
  return {r1: r1, r2: r2 - r1, r3: -r2};
}
var JAMBES = {F: {h: 'hancheF', t: 'tibiaF', p: 'piedF', H: ART.hancheF, K: ART.genouF, A: ART.chevilleF},
  P: {h: 'cuisse', t: 'tibia', p: 'pied', H: ART.hanche, K: ART.genou, A: ART.cheville}};
var MEMBRES = {F: {e: 'brasF', c: 'avbrasF', m: 'poingF', S: ART.epauleF, E: ART.coudeF, W: ART.poignetF, dir: 151.7},
  P: {e: 'bras', c: 'avbras', m: 'poing', S: ART.epaule, E: ART.coude, W: ART.poignet, dir: 90}};
/* la cheville déplacée de (dx, dy) dans le repère du corps ; le pied reste à plat (+ bascule) */
function jambe(c, dx, dy, bascule){
  var J = JAMBES[c], r = ik(J.H, J.K, J.A, [J.A[0] + dx, J.A[1] + dy]), p = {};
  p[J.h] = {a: r1(r.r1)}; p[J.t] = {a: r1(r.r2)}; p[J.p] = {a: r1(r.r3 + (bascule || 0))};
  return p;
}
/* le poignet amené en T (repère du buste) ; m : rotation du poing par rapport à l'avant-bras,
   ou vise : la direction (en degrés) où pointe le poing, vu depuis le poignet */
function membre(c, T, m, vise){
  var B = MEMBRES[c], r = ik(B.S, B.E, B.W, T), p = {};
  if(vise != null) m = nrm((vise - B.dir - r.r1 - r.r2) * Math.PI / 180) * 180 / Math.PI;
  p[B.e] = {a: r1(r.r1)}; p[B.c] = {a: r1(r.r2)}; p[B.m] = {a: r1(m || 0)};
  return p;
}
function r1(v){ return Math.round(v * 10) / 10; }
function fus(){ var o = {}; for(var i = 0; i < arguments.length; i++){ var a = arguments[i]; for(var k in a) o[k] = a[k]; } return o; }
/* une pose entre deux poses */
function melange(A, B, k){
  var o = {}, n, noms = {};
  for(n in A) noms[n] = 1;
  for(n in B) noms[n] = 1;
  for(n in noms){ var a = fusion(Z, A[n]), b = fusion(Z, B[n]); o[n] = {x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, a: a.a + (b.a - a.a) * k, sx: a.sx + (b.sx - a.sx) * k, sy: a.sy + (b.sy - a.sy) * k}; }
  return o;
}
/* la plaque : entrouverte (elle pivote sur ses charnières, vue de biais), ou pendue à sa charnière du bas */
var PLAQUE_ENTR = {sx: .62, a: -4};
function plaquePend(a){ var r = rotAutour(a, CHARN_B, PIV_PLAQUE); return {a: r1(r.a), x: r3(r.x), y: r3(r.y)}; }
var PLAQUE_PEND = plaquePend(122);
/* renversé : la rotation du corps entier autour de son bassin (pour qu'il tombe sur le dos, pas à côté) */
function sautDos(a, dy){ var r = rotAutour(a, [272, 300], [272, SOL]); return {a: a, x: r3(r.x), y: r3(r.y + (dy || 0))}; }
var POSES = {
  /* endormi : affaissé, la tête basse, les poings posés au sol */
  dormant: fus({saut: {y: 14, sy: .985}, buste: {a: -10, y: 3}, tete: {a: -22, y: 7, x: -3}, machoire: {a: -2}, epaule: {a: 3, y: 2}, chaineF: {a: 8}},
    membre('F', [104, 262], 14), membre('P', [446, 322], 4), jambe('F', 2, -14), jambe('P', 0, -14)),
  /* ébloui : le cœur déréglé ; il recule, le bras proche levé devant les yeux */
  ebloui: fus({buste: {a: 5, y: 1}, tete: {a: 12, y: -2, x: 2}, machoire: {a: -9}, epaule: {a: -10, y: -6}, brasF: {a: -14}, avbrasF: {a: -16}, poingF: {a: -10}},
    membre('P', [284, 98], null, -172), jambe('F', -6, 0), jambe('P', 4, 0)),
  /* renversé : tombé sur le dos comme une tortue, les pieds en l'air, les bras qui battent */
  dos: fus({saut: sautDos(62, 4), buste: {a: 8}, tete: {a: 22, x: 2}, machoire: {a: -12}, epaule: {a: 6}, chaineF: {a: -70}},
    membre('F', [70, 200], null, 200), membre('P', [470, 250], null, 40), jambe('F', -14, -18, -20), jambe('P', -6, -12, -14))
};
/* l'ordre du réveil (les runes s'allument une à une) ; à la mort, elles s'éteignent dans l'autre sens */
var REVEIL = ['cristal', 'creux', 'anneau', 'halo', 'arc0', 'arc1', 'arc2', 'arc3', 'arc4', 'arc5', 'arc6', 'col', 'plastron', 'fente', 'plaque', 'pistons', 'gueule', 'ceinture', 'tibia', 'avbrasF', 'brasF', 'avbras', 'epaule', 'tete', 'sol'];
var ETINCELANTES = {arc0: 1, arc1: 1, arc2: 1, arc3: 1, arc4: 1, arc5: 1, arc6: 1, plaque: 1, ceinture: 1, tibia: 1, avbrasF: 1, brasF: 1, avbras: 1, epaule: 1, tete: 1};
/* les joints qui crachent de la vapeur, et la direction du jet */
var JOINTS = [['jCoudeF', -2.4], ['jGenouF', -2.6], ['jGenou', -.6], ['jCoude', -.3], ['jEpaule', -1.1], ['jHanche', -.8], ['jHancheF', -2.2], ['jTaille', -1.6], ['jEpauleF', -2]];
var ROUAGES = [['hancheF', 9000, -1], ['genouF', 7000, 1], ['coudeF', 8000, 1], ['cou', 5200, -1], ['tempe', 3800, 1], ['hanche', 9600, 1], ['genou', 7400, -1], ['coude', 9000, -1], ['epaule', 10400, 1], ['dechire', 2600, -1]];

/* =====================================================================
   C. Le Gardien : la pose de base de chaque état, l'attente, les états
   ===================================================================== */
R._base = function(){
  var e = this.etat, p = {};
  function mettre(o){ for(var k in o) p[k] = o[k]; }
  if(e.dos) mettre(POSES.dos);
  else if(e.ebloui) mettre(POSES.ebloui);
  else {
    if(e.enrage) mettre({tete: {a: -7, y: 3, x: -2}, buste: {a: -3}, brasF: {a: 7}, avbrasF: {a: -12}, poingF: {a: -10}, bras: {a: -5}, avbras: {a: -8}, poing: {a: -6}, machoire: {a: -3}});
    else if(e.cible) mettre({tete: {a: -4, y: 2}, saut: {sy: .99}, poingF: {a: -6}, brasF: {a: 3}, avbrasF: {a: -4}});
    if(e.rougeoie){ var bu = fusion(Z, p.buste); bu.sy = 1.018; bu.y -= 2; p.buste = bu; p.epaule = {y: -3, a: -2}; }
  }
  if(!e['sans-plaque']){
    if(e['plaque-ouverte']){ p.plaque = PLAQUE_PEND; p.loquet = {a: -40}; }
    else if(e['plaque-entrouverte'] || e.ouvert){ p.plaque = PLAQUE_ENTR; p.loquet = {a: -40}; }
  }
  return p;
};
/* les boucles d'attente : il respire (la poitrine monte), ses bras pèsent, sa chaîne et son fil se balancent */
R._lancerBoucles = function(){
  var e = this.etat, b, EI = 'ease-in-out';
  this.vitesse = e.enrage ? 1.5 : (e.ebloui ? 1.3 : 1);
  b = this._boucleur();
  var base = this._base();
  if(e.gele){
    b('secousse', [[0, {x: 0}], [.25, {x: .7}], [.5, {x: -.7}], [.75, {x: .5}], [1, {x: 0}]], 170, 'linear');
    b('buste', [[0, {y: 0}], [.5, {y: -.6}], [1, {y: 0}]], 4200, EI);
    this._planifier(900);
    return;
  }
  if(e.dos){
    b('buste', [[0, {a: 0, y: 0}], [.5, {a: -2, y: -1}], [1, {a: 0, y: 0}]], 1600, EI);
    b('tete', [[0, {a: 0}], [.3, {a: 6}], [.6, {a: -4}], [1, {a: 0}]], 1200, EI);
    b('pied', [[0, {a: 0}], [.5, {a: -14}], [1, {a: 0}]], 700, EI);
    b('piedF', [[0, {a: -10}], [.5, {a: 6}], [1, {a: -10}]], 760, EI, -200);
    b('tibiaF', [[0, {a: 0}], [.5, {a: 8}], [1, {a: 0}]], 900, EI);
    b('poing', [[0, {a: 0}], [.5, {a: -16}], [1, {a: 0}]], 640, EI);
    b('chaineF', [[0, {a: -10}], [.5, {a: 12}], [1, {a: -10}]], 1200, EI);
    b('fil', [[0, {a: -8}], [.5, {a: 10}], [1, {a: -8}]], 1100, EI);
    b('brasF', [[0, {a: 0}], [.5, {a: 14}], [1, {a: 0}]], 900, EI);
    b('bras', [[0, {a: 0}], [.5, {a: -12}], [1, {a: 0}]], 820, EI, -300);
    this._planifier(700);
    return;
  }
  var gros = e.rougeoie ? 1.6 : 1;
  b('buste', [[0, {y: 0, a: 0}], [.45, {y: -1.8 * gros, a: -.4}], [1, {y: 0, a: 0}]], 2800, EI);
  b('saut', [[0, {sy: 1}], [.45, {sy: 1.004}], [1, {sy: 1}]], 2800, EI);
  b('machoire', [[0, {a: 0}], [.5, {a: -1.5}], [1, {a: 0}]], 2800, EI);
  if(e.ebloui){
    /* déréglé : la tête tressaute, le bras tremble devant les yeux, l'autre bras bat l'air */
    b('tete', [[0, {a: 0}], [.1, {a: 4}], [.2, {a: -3}], [.45, {a: -3}], [.55, {a: 5}], [.7, {a: 1}], [1, {a: 0}]], 1300, 'cubic-bezier(.1,.9,.2,1)');
    b('avbras', [[0, {a: 0}], [.5, {a: 5}], [1, {a: 0}]], 380, EI);
    b('poing', [[0, {a: 0}], [.5, {a: -8}], [1, {a: 0}]], 300, EI);
    b('brasF', [[0, {a: 0}], [.5, {a: 10}], [1, {a: 0}]], 1100, EI);
    b('avbrasF', [[0, {a: 0}], [.5, {a: -14}], [1, {a: 0}]], 900, EI, -200);
    b('secousse', [[0, {x: 0, a: 0}], [.25, {x: 2, a: .6}], [.5, {x: 0, a: 0}], [.75, {x: -2, a: -.6}], [1, {x: 0, a: 0}]], 1500, EI);
  } else {
    b('tete', [[0, {a: 0}], [.3, {a: 1.2}], [.62, {a: -.8}], [1, {a: 0}]], 3600, EI);
    b('brasF', [[0, {a: 0}], [.5, {a: 1.4}], [1, {a: 0}]], 2800, EI, -300);
    b('avbrasF', [[0, {a: 0}], [.5, {a: -1.6}], [1, {a: 0}]], 2800, EI, -500);
    b('poingF', [[0, {a: 0}], [.5, {a: 2}], [1, {a: 0}]], 2800, EI, -700);
    b('bras', [[0, {a: 0}], [.5, {a: -1}], [1, {a: 0}]], 2800, EI, -200);
    b('avbras', [[0, {a: 0}], [.5, {a: 1.4}], [1, {a: 0}]], 2800, EI, -450);
    b('poing', [[0, {a: 0}], [.5, {a: -1.8}], [1, {a: 0}]], 2800, EI, -650);
    if(e.enrage) b('secousse', [[0, {x: 0, y: 0}], [.25, {x: 1.1, y: -.5}], [.5, {x: -1.1, y: .4}], [.75, {x: .7, y: .3}], [1, {x: 0, y: 0}]], 150, 'linear');
    else if(e.cible) b('secousse', [[0, {x: 0}], [.5, {x: .5}], [1, {x: 0}]], 260, 'linear');
  }
  b('epaule', [[0, {a: 0, y: 0}], [.45, {a: -.5, y: -1}], [1, {a: 0, y: 0}]], 2800, EI);
  b('chaineF', [[0, {a: -5}], [.5, {a: 6}], [1, {a: -5}]], 2100, EI);
  b('fil', [[0, {a: -4}], [.5, {a: 5}], [1, {a: -4}]], 1700, EI);
  /* le cœur bat (derrière la plaque on n'en voit qu'un éclat ; à nu, il palpite fort) */
  if(e.ouvert) b('coeur', [[0, {sx: 1, sy: 1}], [.14, {sx: 1.16, sy: 1.16}], [.28, {sx: .97, sy: .97}], [.42, {sx: 1.1, sy: 1.1}], [.6, {sx: 1, sy: 1}], [1, {sx: 1, sy: 1}]], 820, EI);
  else b('coeur', [[0, {sx: 1, sy: 1}], [.15, {sx: 1.06, sy: 1.06}], [.3, {sx: .99, sy: .99}], [.45, {sx: 1.04, sy: 1.04}], [.65, {sx: 1, sy: 1}], [1, {sx: 1, sy: 1}]], 1400, EI);
  /* la plaque pendue se balance sur sa charnière ; entrouverte, elle bâille un peu */
  if(base.plaque && e['plaque-ouverte']){
    var p0 = PLAQUE_PEND, d1 = plaquePend(116), d2 = plaquePend(127);
    b('plaque', [[0, {a: 0, x: 0, y: 0}], [.5, {a: d1.a - p0.a, x: d1.x - p0.x, y: d1.y - p0.y}], [1, {a: 0, x: 0, y: 0}]], 2400, EI);
  } else if(base.plaque) b('plaque', [[0, {sx: 1}], [.5, {sx: 1.06}], [1, {sx: 1}]], 1800, EI);
  if(e.colle) this.vitesse = .8;
  this._planifier(600);
};
/* les boucles autonomes : les engrenages tournent, les pistons pompent, l'anneau de runes tourne, le fil crépite ;
   et la vapeur sort des cheminées */
R._lancerX = function(){
  var self = this;
  this._couperX('eng-'); this._couperX('pistons'); this._couperX('anneau'); this._couperX('etincelle');
  this.rouages = [];
  ROUAGES.forEach(function(r){ self.rouages = self.rouages.concat(self._boucleX('eng-' + r[0], [{transform: 'rotate(0deg)'}, {transform: 'rotate(' + (360 * r[2]) + 'deg)'}], r[1])); });
  this._boucleX('pistons', [{transform: 'translate(0px,0px)'}, {transform: 'translate(0px,-5px)'}, {transform: 'translate(0px,0px)'}], 1400, {e: 'ease-in-out'});
  this.rouages = this.rouages.concat(this._boucleX('anneau', [{transform: 'rotate(0deg)'}, {transform: 'rotate(360deg)'}], 16000));
  this._boucleX('etincelle', [{opacity: 1, transform: 'scale(1)'}, {offset: .1, opacity: .25, transform: 'scale(.6)'}, {offset: .2, opacity: 1, transform: 'scale(1.2)'}, {offset: .35, opacity: .5, transform: 'scale(.8)'}, {offset: .5, opacity: .1, transform: 'scale(.5)'},
    {offset: .62, opacity: .9, transform: 'scale(1.1)'}, {offset: .8, opacity: .3, transform: 'scale(.7)'}, {opacity: 1, transform: 'scale(1)'}], 1100);
  this._rouages(this.etat.gele ? .04 : (this.etat.enrage ? 1.8 : 1));
  this._souffler();
};
/* la vitesse des rouages (ils s'emballent, ralentissent, s'arrêtent) */
R._rouages = function(k){ (this.rouages || []).forEach(function(a){ try{ a.playbackRate = k; }catch(e){} }); };
/* la vapeur régulière des cheminées (et une étincelle du fil, de temps en temps) */
R._souffler = function(){
  var self = this;
  clearTimeout(this.fx.vapeur);
  (function souffle(n){
    if(self.mort || self.arrete) return;
    if(self.allume && !self.etat.gele){
      var c = self._pt(n % 2 ? 'chem2' : 'chem1'), rouge = self.etat.enrage;
      self._bouffee(c, {r: hasard(6, 9), grad: rouge ? self.G.vapeurR : self.G.vapeur, op: .75, dx: hasard(6, 22), dy: hasard(-60, -40), duree: hasard(1300, 1700), s0: .4, s1: 2.6});
      if(n % 5 === 0 && Math.random() < .5) self._etincelles(self._pt('fil'), 3, {v: 26, grav: 30, ep: 1.6});
    }
    self.fx.vapeur = setTimeout(function(){ souffle(n + 1); }, hasard(520, 900) / (self.etat.enrage ? 1.5 : 1));
  })(0);
};
/* les petits gestes de l'attente : tics mécaniques de la tête, jets de vapeur, regard, grincement, étincelles… */
R._evenement = function(){
  var e = this.etat, liste = ['tic', 'tic', 'tic', 'vapeur', 'vapeur', 'regard', 'grince', 'claque', 'etincelle', 'souffle', 'cligne', 'poing'];
  if(e.enrage) liste = liste.concat(['grogne', 'grogne', 'poing', 'tic']);
  if(e.rougeoie) liste = liste.concat(['vapeur', 'souffle', 'braises']);
  if(e.brule) liste = liste.concat(['secoue', 'secoue']);
  if(e.colle) liste = ['tire', 'tire', 'tire', 'tic', 'vapeur'];
  if(e.ebloui) liste = ['detraque', 'detraque', 'cligne', 'etincelle', 'tic'];
  if(e.gele) liste = ['frisson', 'givre', 'cligne'];
  if(e.dos) liste = ['tic', 'cligne', 'vapeur', 'detraque'];
  if(e.ouvert && !e.dos) liste = liste.concat(['coeur', 'coeur']);
  this._joue(choisir(liste));
};
R._joue = function(ev){
  var self = this, A = {ajout: true, vitesse: this.vitesse}, e = this.etat, j, k, i;
  switch(ev){
    case 'tic':
      /* un tic de machine : la tête part d'un coup, s'arrête net, revient d'un coup */
      var s = choisir([1, -1]) * hasard(3, 6);
      this._seq([{t: 0, p: {tete: {a: 0, y: 0}}}, {t: .1, p: {tete: {a: s, y: -1}}, e: 'cubic-bezier(.1,.9,.2,1)'}, {t: .5, p: {tete: {a: s, y: -1}}}, {t: .58, p: {tete: {a: -s * .4, y: 0}}, e: 'cubic-bezier(.1,.9,.2,1)'}, {t: .85, p: {tete: {a: -s * .4}}}, {t: 1, p: {tete: {a: 0}}}], 1000, A);
      this._minuteur(function(){ self._bouffee(self._pt('cou'), {r: 4, op: .6, dx: hasard(-10, 10), dy: -16, duree: 500}); }, 90);
      break;
    case 'vapeur':
      var jt = choisir(JOINTS);
      this._jet(this._pt(jt[0]), jt[1], {n: 3});
      this._seq([{t: 0, p: {secousse: {x: 0}}}, {t: .2, p: {secousse: {x: 1}}}, {t: 1, p: {secousse: {x: 0}}}], 300, A);
      break;
    case 'regard':
      /* il baisse la tête vers les héros, ses yeux s'allument plus fort */
      this._seq([{t: 0, p: {tete: {a: 0, x: 0, y: 0}, buste: {a: 0}}}, {t: .25, p: {tete: {a: -7, x: -3, y: 2}, buste: {a: -1.5}}, e: 'cubic-bezier(.3,.7,.3,1)'}, {t: .8, p: {tete: {a: -7, x: -3, y: 2}, buste: {a: -1.5}}}, {t: 1, p: {tete: {a: 0, x: 0, y: 0}, buste: {a: 0}}}], 2000, A);
      if(!e.enrage) this._clignerFort(400, 1100);
      break;
    case 'grince':
      /* il roule l'épaule en grinçant : de la rouille s'effrite */
      this._seq([{t: 0, p: {epaule: {a: 0, y: 0}, bras: {a: 0}, buste: {a: 0}}}, {t: .3, p: {epaule: {a: -4, y: -4}, bras: {a: -5}, buste: {a: 1}}, e: 'ease-out'}, {t: .55, p: {epaule: {a: 2, y: 0}, bras: {a: 3}, buste: {a: -.5}}}, {t: 1, p: {epaule: {a: 0, y: 0}, bras: {a: 0}, buste: {a: 0}}}], 1300, A);
      this._minuteur(function(){ var p = self._pt('jEpaule'); for(i = 0; i < 3; i++) self._miette([p[0] + hasard(-14, 14), p[1] + hasard(-4, 10)]); }, 400);
      break;
    case 'claque':
      this._seq([{t: 0, p: {machoire: {a: 0}}}, {t: .2, p: {machoire: {a: -9}}, e: 'ease-out'}, {t: .32, p: {machoire: {a: 1}}, e: 'cubic-bezier(.6,0,.9,.5)'}, {t: .5, p: {machoire: {a: -7}}, e: 'ease-out'}, {t: .62, p: {machoire: {a: 1}}, e: 'cubic-bezier(.6,0,.9,.5)'}, {t: 1, p: {machoire: {a: 0}}}], 800, A);
      break;
    case 'etincelle':
      this._etincelles(this._pt('fil'), 6, {v: 34, grav: 30, ep: 1.8});
      this._seq([{t: 0, p: {fil: {a: 0}}}, {t: .2, p: {fil: {a: 14}}, e: 'ease-out'}, {t: .5, p: {fil: {a: -8}}}, {t: 1, p: {fil: {a: 0}}}], 900, A);
      break;
    case 'souffle':
      /* un grand soupir de machine : les deux cheminées crachent, les capots sautent */
      this._seq([{t: 0, p: {buste: {y: 0}, capot1: {y: 0}, capot2: {y: 0}, machoire: {a: 0}}}, {t: .3, p: {buste: {y: -3}, machoire: {a: -4}}}, {t: .45, p: {capot1: {y: -7, a: -6}, capot2: {y: -6, a: 8}}, e: 'cubic-bezier(.1,.9,.3,1)'},
        {t: .6, p: {buste: {y: 1}, capot1: {y: 0, a: 0}, capot2: {y: 0, a: 0}, machoire: {a: -2}}, e: 'cubic-bezier(.6,0,.9,.5)'}, {t: 1, p: {buste: {y: 0}, machoire: {a: 0}}}], 1400, A);
      this._minuteur(function(){ self._jet(self._pt('chem1'), -1.5, {n: 3, force: 1.4}); self._jet(self._pt('chem2'), -1.4, {n: 2, force: 1.3}); }, 600);
      break;
    case 'cligne':
      this._clignerYeux();
      break;
    case 'poing':
      /* il serre le poing et le soulève un peu : une menace */
      this._seq([{t: 0, p: {brasF: {a: 0}, avbrasF: {a: 0}, poingF: {a: 0}}}, {t: .35, p: {brasF: {a: 6}, avbrasF: {a: -14}, poingF: {a: -12}}, e: 'cubic-bezier(.3,.7,.3,1)'}, {t: .5, p: {poingF: {a: -16}}}, {t: .58, p: {poingF: {a: -11}}}, {t: .66, p: {poingF: {a: -16}}},
        {t: 1, p: {brasF: {a: 0}, avbrasF: {a: 0}, poingF: {a: 0}}, e: 'ease-in-out'}], 1600, A);
      this._minuteur(function(){ self._jet(self._pt('jPoignetF'), -2, {n: 2, taille: .7}); }, 560);
      break;
    case 'grogne':
      var g = [{t: 0, p: {secousse: {x: 0, a: 0}, machoire: {a: 0}}}];
      for(k = 1; k < 10; k++) g.push({t: k / 10, p: {secousse: {x: (k % 2 ? 1.8 : -1.8), a: (k % 2 ? .5 : -.5)}, machoire: {a: -7 - (k % 3)}}, e: 'linear'});
      g.push({t: 1, p: {secousse: {x: 0, a: 0}, machoire: {a: 0}}});
      this._seq(g, 900, A);
      this._minuteur(function(){ self._jet(self._pt('bouche'), Math.PI * .95, {n: 3, taille: .8}); }, 200);
      break;
    case 'braises':
      for(i = 0; i < 3; i++) this._braise(this._ouB(2, hasard(170, 380), hasard(110, 250)));
      break;
    case 'secoue':
      /* la mousse brûle : il tape sur son épaule */
      this._seq([{t: 0, p: {brasF: {a: 0}, avbrasF: {a: 0}, tete: {a: 0}}}, {t: .3, p: {brasF: {a: 40}, avbrasF: {a: -60}, tete: {a: 6}}, e: 'ease-out'}, {t: .42, p: {avbrasF: {a: -50}}}, {t: .54, p: {avbrasF: {a: -62}}}, {t: .66, p: {avbrasF: {a: -50}}}, {t: 1, p: {brasF: {a: 0}, avbrasF: {a: 0}, tete: {a: 0}}}], 1400, A);
      break;
    case 'tire':
      this._tirerPied();
      break;
    case 'detraque':
      /* déréglé : les bras partent tout seuls, les runes clignotent, le cœur crache des étincelles */
      this._seq([{t: 0, p: {brasF: {a: 0}, bras: {a: 0}, tete: {a: 0}, buste: {a: 0}}}, {t: .12, p: {brasF: {a: -14}, bras: {a: 8}, tete: {a: -6}, buste: {a: 2}}, e: 'cubic-bezier(.1,.9,.2,1)'}, {t: .3, p: {brasF: {a: 10}, bras: {a: -6}, tete: {a: 5}, buste: {a: -1}}, e: 'cubic-bezier(.1,.9,.2,1)'},
        {t: .45, p: {brasF: {a: -6}, bras: {a: 3}, tete: {a: -2}}, e: 'cubic-bezier(.1,.9,.2,1)'}, {t: 1, p: {brasF: {a: 0}, bras: {a: 0}, tete: {a: 0}, buste: {a: 0}}}], 1100, A);
      this._etincelles(this._pt('coeurC'), 7, {v: 50, coul: ['#ffffff', CYAN, '#fff6c0']});
      this._clignerRunes(500);
      break;
    case 'frisson':
      var f2 = [{t: 0, p: {secousse: {x: 0}}}];
      for(k = 1; k < 9; k++) f2.push({t: k / 9, p: {secousse: {x: k % 2 ? 2.2 : -2.2}}, e: 'linear'});
      f2.push({t: 1, p: {secousse: {x: 0}}});
      this._seq(f2, 700, {ajout: true});
      break;
    case 'givre':
      var bo = this._pt('bouche');
      for(i = 0; i < 3; i++) this._bouffee([bo[0] - 4, bo[1]], {r: 5, op: .7, dx: hasard(-34, -18), dy: hasard(-14, -2), duree: 1000, delai: i * 160, s1: 2.6});
      break;
    case 'coeur':
      this._etincelles(this._pt('coeurC'), 5, {v: 40, coul: ['#ffffff', '#fff6c0', CYAN]});
      break;
  }
};
/* les yeux clignent (une variante qui s'éteint un instant : opacité seulement) */
R._clignerYeux = function(){
  var e = (this.V[this.etat.enrage ? 'yeuxR' : 'yeux'] || [])[0];
  if(!e || e.getAttribute('visibility') === 'hidden') return;
  e.animate([{opacity: 1}, {offset: .2, opacity: .1}, {offset: .4, opacity: 1}, {offset: .55, opacity: .3}, {opacity: 1}], {duration: 360, easing: 'steps(5, end)'});
};
/* les yeux s'allument plus fort un moment */
R._clignerFort = function(delai, duree){
  var self = this;
  this._minuteur(function(){ self._fondu('yeuxFort', 1, 200); }, delai || 0);
  this._minuteur(function(){ self._fondu('yeuxFort', 0, 400); }, (delai || 0) + (duree || 800));
};
/* les runes clignotent (déréglé, explosion) */
R._clignerRunes = function(ms){
  this._varis(this.etat.enrage ? 'rr-' : 'r-').forEach(function(e){
    if(e.getAttribute('visibility') === 'hidden') return;
    e.animate([{opacity: 1}, {offset: .15, opacity: .2}, {offset: .3, opacity: 1}, {offset: .5, opacity: .35}, {offset: .7, opacity: 1}, {offset: .85, opacity: .5}, {opacity: 1}], {duration: ms || 500, easing: 'steps(6, end)'});
  });
};
/* une miette de rouille qui tombe en tournoyant */
R._miette = function(p){
  var g = this._fxEl(P('M-3 -2 L 2 -3 L 3 2 L -1 3 Z', choisir(['#b8642e', '#7a3a1e', '#d07a3a']), ' stroke-width="1"'));
  var x = p[0] + hasard(-12, 12);
  g.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) rotate(0deg)', opacity: 1}, {offset: .85, opacity: 1}, {transform: 'translate(' + f1(x) + 'px,' + f1(SOL - 2) + 'px) rotate(' + f1(hasard(-400, 400)) + 'deg)', opacity: 0}], {duration: hasard(800, 1200), easing: 'cubic-bezier(.4,0,.9,.6)', fill: 'both'}).finished.then(oter(g), oter(g));
};
R._braise = function(p){
  var b = this._fxEl('<circle r="4.5" fill="' + this.G.braise + '"/><circle r="1.8" fill="#fff0b0"/>');
  b.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px)', opacity: 1}, {transform: 'translate(' + f1(p[0] + hasard(-20, 30)) + 'px,' + f1(p[1] - hasard(50, 90)) + 'px)', opacity: 0}], {duration: hasard(800, 1200), easing: 'ease-out', fill: 'forwards'}).finished.then(oter(b), oter(b));
};
/* il tire sur son pied collé : la cheville se soulève, la colle (pré-dessinée) s'étire, le pied est ramené d'un coup */
R._tirerPied = function(){
  var T = 1500, h = jambe('F', 4, -18, -10), h2 = jambe('F', 3, -12, -6), z = jambe('F', 0, 0), self = this;
  function m(p, k){ var o = {}; for(var n in p) o[n] = {a: p[n].a * k}; return o; }
  this._seq([{t: 0, p: fus(z, {filColle: {sy: 1}, buste: {a: 0}, tete: {a: 0}})}, {t: .3, p: fus(m(h2, 1), {filColle: {sy: 2.4}, buste: {a: 2}, tete: {a: -5}}), e: 'cubic-bezier(.3,.6,.5,1)'}, {t: .45, p: fus(m(h2, .8), {filColle: {sy: 2}})},
    {t: .62, p: fus(m(h, 1), {filColle: {sy: 3.4}, buste: {a: 3}, tete: {a: -7}}), e: 'ease-in'}, {t: .72, p: fus(z, {filColle: {sy: 1}, buste: {a: -1}, tete: {a: 2}}), e: 'cubic-bezier(.7,0,1,.6)'}, {t: 1, p: fus(z, {filColle: {sy: 1}, buste: {a: 0}, tete: {a: 0}})}], T, {ajout: true});
  this._minuteur(function(){ self._poussiere(self._pt('piedFC'), 2, -1); }, T * .72);
};

/* ---------- les états ---------- */
R.etatPublic = function(nom, on){
  on = on !== false;
  if(this.mort || !(nom in this.etat) || this.etat[nom] === on) return Promise.resolve();
  var f = this['_e_' + nom.replace(/-/g, '_')];
  if(!f){ this.etat[nom] = on; return this._changerMode(); }
  return Promise.resolve(f.call(this, on));
};
/* la couleur des runes, des fentes, des yeux : cyan (normal), rouge (enragé), éteint ; quelques-unes peuvent être éteintes à part */
R._cibleRune = function(n){
  var e = this.etat, rouge = n.indexOf('rr-') === 0, base = n.slice(rouge ? 3 : 2);
  if(!this.allume || this.eteintes[base]) return 0;
  if(base === 'fente' && (e['plaque-ouverte'] || e['sans-plaque'])) return 0;
  return rouge === !!e.enrage ? 1 : 0;
};
R._majRunes = function(ms, delai){
  var self = this, e = this.etat;
  Object.keys(this.V).forEach(function(n){
    var full = null;
    if(n.indexOf('rr-') === 0 || n.indexOf('r-') === 0) full = n;
    if(!full) return;
    var v = self._cibleRune(full);
    self.V[n].forEach(function(el){ var vis = el.getAttribute('visibility') !== 'hidden' && +el.getAttribute('opacity') > 0; if(vis !== (v > 0)) self._fondu(el, v, ms, delai); });
  });
  var oy = this.allume && !this.eteintes.yeux;
  this._fondu('yeux', oy && !e.enrage ? 1 : 0, ms);
  this._fondu('yeuxR', oy && e.enrage ? 1 : 0, ms);
  this._fondu('fente', !(e['plaque-ouverte'] || e['sans-plaque']) ? 1 : 0, ms);
};
R._e_enrage = function(on){
  var self = this;
  this.etat.enrage = on;
  this._majRunes(400);
  this._rouages(on ? 1.8 : 1);
  return this._changerMode(350);
};
R._e_cible = function(on){ this.etat.cible = on; return this._changerMode(350); };
R._e_ouvert = function(on){
  var self = this;
  this.etat.ouvert = on;
  this._fondu('pf', on ? 1 : 0, on ? 350 : 500);
  this._couperX('pf');
  if(on){
    this._boucleX('pf', [{transform: 'scale(.9)'}, {offset: .14, transform: 'scale(1.12)'}, {offset: .28, transform: 'scale(.96)'}, {offset: .42, transform: 'scale(1.06)'}, {transform: 'scale(.9)'}], 820, {e: 'ease-in-out'});
    this._boucleX('pfAnneau', [{transform: 'rotate(0deg) scale(1)'}, {transform: 'rotate(180deg) scale(1.06)'}, {transform: 'rotate(360deg) scale(1)'}], 5200);
    this._etincelles(this._pt('coeurC'), 8, {v: 60, coul: ['#ffffff', '#fff6c0', CYAN]});
  }
  return this._changerMode(400);
};
R._e_plaque_ouverte = function(on){ this.etat['plaque-ouverte'] = on; if(on) this.etat['plaque-entrouverte'] = false; this._majRunes(300); return this._changerMode(400); };
R._e_plaque_entrouverte = function(on){ this.etat['plaque-entrouverte'] = on; this._majRunes(300); return this._changerMode(400); };
R._e_sans_plaque = function(on){
  this.etat['sans-plaque'] = on;
  if(on){ this.etat['plaque-ouverte'] = false; this.etat['plaque-entrouverte'] = false; }
  this.J.plaque.forEach(function(e){ e.style.opacity = on ? 0 : ''; });
  if(!on){ (this.fx.debrisPlaque || []).forEach(function(g){ g.remove(); }); this.fx.debrisPlaque = []; this._varis('fel').concat(this.V.gelP || [], this.V.acide || []).forEach(function(el){ el.setAttribute('opacity', 0); el.setAttribute('visibility', 'hidden'); }); }
  this._majRunes(300);
  return this._changerMode(400);
};
/* le feu le renforce : le fer chauffe au rouge (couches pré-dessinées), une lueur rouge au sol, des braises */
R._e_rougeoie = function(on){
  var self = this;
  this.etat.rougeoie = on;
  this._fondu(this._varis('chaud-'), on ? .9 : 0, on ? 700 : 1000);
  this._fondu('lueurRouge', on ? 1 : 0, 600);
  clearTimeout(this.fx.chaleur);
  if(on) (function chaleur(){
    if(!self.etat.rougeoie || self.mort) return;
    self._braise(self._ouB(2, hasard(160, 390), hasard(100, 260)));
    if(Math.random() < .35) self._bouffee(self._ouB(2, hasard(200, 360), 100), {r: 7, grad: self.G.fumee, op: .35, dx: hasard(0, 20), dy: -60, duree: 1400, s1: 2.4});
    self.fx.chaleur = setTimeout(chaleur, hasard(240, 400));
  })();
  return this._changerMode(500);
};
/* brûlé : la mousse et les racines prennent feu (flammes pré-dessinées qui vacillent), de la fumée */
R._e_brule = function(on){
  var self = this;
  this.etat.brule = on;
  this._fondu(this._varis('feu-'), on ? 1 : 0, on ? 300 : 600);
  this._couperX('fl');
  if(on) Object.keys(this.K).forEach(function(n){
    if(n.indexOf('fl') !== 0) return;
    var d = 300 + (parseInt(n.slice(2), 10) * 37 % 160);
    self._boucleX(n, [{transform: 'scale(1,1) skewX(0deg)'}, {offset: .35, transform: 'scale(.86,1.2) skewX(-7deg)'}, {offset: .7, transform: 'scale(1.06,.9) skewX(5deg)'}, {transform: 'scale(1,1) skewX(0deg)'}], d, {e: 'ease-in-out', delai: -d * .3 * (n.length % 3)});
  });
  clearTimeout(this.fx.fumee);
  if(on) (function fumee(){
    if(!self.etat.brule || self.mort) return;
    var p = self._pt(choisir(['feuTete', 'feuEpaule', 'feuBrasF']));
    self._bouffee([p[0], p[1] - 20], {r: hasard(8, 13), grad: self.G.fumee, op: .5, dx: hasard(10, 40), dy: hasard(-80, -50), duree: hasard(1300, 1800), s1: 2.6});
    if(Math.random() < .5) self._braise([p[0] + hasard(-10, 10), p[1] - 10]);
    self.fx.fumee = setTimeout(fumee, hasard(260, 420));
  })();
  if(!this.enAction && this.attente){ this._couperMinuteurs(); this._planifier(300); }
  return Promise.resolve();
};
/* la colle sur le pied de devant : un pâté, une flaque, il tire dessus */
R._e_colle = function(on){
  this.etat.colle = on;
  this._fondu(['colle', 'colleFil'].reduce(function(l, n){ return l.concat(this.V[n] || []); }.bind(this), []), on ? 1 : 0, 300);
  if(on) this._flaque('colle', 190, 90); else this._enleverFlaque('colle');
  return this._changerMode(400);
};
/* ébloui : des étoiles qui tournent autour de la tête (pièces x-… pré-dessinées), le bras devant les yeux */
R._e_ebloui = function(on){
  this.etat.ebloui = on;
  this._etoiles(on);
  return this._changerMode(on ? 500 : 600);
};
R._etoiles = function(on){
  var self = this;
  this._couperX('et');
  this._fondu('etoiles', on ? 1 : 0, on ? 250 : 300);
  if(!on) return;
  for(var k = 0; k < 5; k++){
    var frames = [], ns = 16;
    for(var s = 0; s <= ns; s++){ var a = s / ns * Math.PI * 2 + k * Math.PI * 2 / 5, x = 230 + Math.cos(a) * 62, y = 34 + Math.sin(a) * 16, devant = Math.sin(a); frames.push({transform: 'translate(' + f1(x) + 'px,' + f1(y) + 'px) scale(' + f1(.75 + devant * .3) + ')', opacity: f1(.55 + devant * .45)}); }
    this._boucleX('et' + k, frames, 1500);
  }
};
/* gelé : le givre (couches pré-dessinées) le recouvre, ses rouages s'arrêtent presque, il ne bouge plus */
R._e_gele = function(on){
  var self = this;
  this.etat.gele = on;
  this._fondu(this._varis('gel-'), on ? .9 : 0, on ? 700 : 1200);
  this._rouages(on ? .04 : (this.etat.enrage ? 1.8 : 1));
  if(on) this._cristaux(this._pt('centre'), 10, {v: 70});
  else { var c = this._pt('centre'); for(var i = 0; i < 4; i++) this._goutteTombe([c[0] + hasard(-90, 90), c[1] + hasard(-60, 60)], {coul: '#b8e6ff'}); }
  return this._changerMode(on ? 400 : 600);
};
/* renversé : il bascule lourdement en arrière, ou se relève */
R._e_dos = function(on){
  var self = this, j = this._debutAction();
  this.etat.dos = on;
  if(on){
    /* il vacille vers l'avant, puis bascule en arrière de tout son poids, rebondit sur son dos */
    return this._seq([{t: 0, p: {}}, {t: .22, p: {saut: sautDos(-5, 0), buste: {a: -6}, tete: {a: -8}, brasF: {a: -20}, bras: {a: 20}}, e: 'ease-out'},
      {t: .68, p: avec(POSES.dos, {saut: sautDos(68, 2)}), e: 'cubic-bezier(.55,0,1,.6)'}, {t: .84, p: {saut: sautDos(57, -6)}, e: 'cubic-bezier(.2,.7,.4,1)'}, {t: 1, p: {saut: POSES.dos.saut}, e: 'ease-in-out'}], 1400).fini.then(function(){
      self._poussiere([330, SOL], 4, 1); self._poussiere([430, SOL], 4, 1);
      self._jet(self._pt('chem1'), 0, {n: 3});
      return self._finAction(j, 150);
    });
  }
  /* il roule sur le côté, pousse sur ses bras et se relève */
  return this._seq([{t: 0, p: {}}, {t: .35, p: fus(jambe('F', -10, -20), jambe('P', -6, -14), membre('F', [60, 300], null, 160), {saut: sautDos(34, 0), buste: {a: -10}, tete: {a: -6}}), e: 'cubic-bezier(.3,.6,.5,1)'},
    {t: .72, p: fus(jambe('F', 0, 0), jambe('P', 0, 0), {saut: {a: 0, x: 0, y: 0, sy: .95}, buste: {a: 2}, brasF: {a: 0}, avbrasF: {a: 0}, poingF: {a: 0}, bras: {a: 0}, avbras: {a: 0}, poing: {a: 0}, tete: {a: 0, x: 0}, chaineF: {a: 0}}), e: 'cubic-bezier(.5,0,.9,.6)'},
    {t: 1, p: {saut: {sy: 1}, buste: {a: 0}}, e: 'cubic-bezier(.3,.6,.4,1.4)'}], 1500).fini.then(function(){ self._poussiere([220, SOL], 3, -1); return self._finAction(j, 300); });
};
/* une flaque au sol (huile ou colle), derrière lui */
R._flaque = function(type, cx, rx){
  this._enleverFlaque(type);
  var html, sol = SOL;
  if(type === 'huile') html = '<ellipse cx="' + cx + '" cy="' + sol + '" rx="' + rx + '" ry="' + f1(rx * .07) + '" fill="' + this.G.huile + '" stroke="#0a0812" stroke-width="2" fill-opacity=".95"/>' + L('M' + f1(cx - rx * .8) + ' ' + f1(sol - 3) + ' C ' + f1(cx - rx * .4) + ' ' + f1(sol - 6) + ' ' + f1(cx + rx * .2) + ' ' + f1(sol - 6) + ' ' + f1(cx + rx * .6) + ' ' + f1(sol - 3), '#c8e0ff', 1.6, so(.45));
  else html = '<ellipse cx="' + cx + '" cy="' + sol + '" rx="' + rx + '" ry="' + f1(rx * .1) + '" fill="#c8d84a" fill-opacity=".55" stroke="#5a6420" stroke-width="2"/>' + L('M' + f1(cx - rx * .8) + ' ' + f1(sol - 4) + ' C ' + f1(cx - rx * .4) + ' ' + f1(sol - 8) + ' ' + f1(cx + rx * .2) + ' ' + f1(sol - 8) + ' ' + f1(cx + rx * .6) + ' ' + f1(sol - 4), '#ffffd0', 1.8, so(.7)) +
    [[-.6, 1, 4], [-.1, 3, 3], [.4, -1, 4.6]].map(function(b){ return C(f1(cx + b[0] * rx), f1(sol + b[1]), b[2], '#e8f0a0', ' stroke="#5a6420" stroke-width="1"'); }).join('');
  var g = this._el(this.S.fixeArr, '<g transform="translate(' + cx + ' ' + sol + ')"><g>' + '<g transform="translate(' + (-cx) + ' ' + (-sol) + ')">' + html + '</g></g></g>');
  g.firstChild.firstChild.animate([{transform: 'scale(.2,.4)', opacity: 0}, {transform: 'scale(1)', opacity: 1}], {duration: 420, easing: 'cubic-bezier(.2,.8,.3,1.2)'});
  this.fx['flaque_' + type] = g;
  return g;
};
R._enleverFlaque = function(type){
  var g = this.fx['flaque_' + type];
  if(!g) return;
  this.fx['flaque_' + type] = null;
  g.animate([{opacity: 1}, {opacity: 0}], {duration: 500, fill: 'forwards'}).finished.then(oter(g), oter(g));
};
/* après arreter() puis attendre() : relancer les boucles des états */
R._relancerEtats = function(){
  var e = this.etat;
  if(e.ebloui) this._etoiles(true);
  if(e.ouvert){ this.etat.ouvert = false; this._e_ouvert(true); }
  if(e.brule){ this.etat.brule = false; this._e_brule(true); }
  if(e.rougeoie){ this.etat.rougeoie = false; this._e_rougeoie(true); }
};

/* =====================================================================
   D. Les actions (Promise)
   ===================================================================== */
/* un point du dessin dans une chaîne du buste (0 cheminées, 1 bras du fond, 2 torse, 3 plaque et tête, 4 bras proche) */
R._ouB = function(i, x, y){ return this._ou(this.J.buste[i].firstElementChild, x, y); };
R._toutesPieces = function(pose){ var p = {}, b = this._base(); for(var n in pose) p[n] = fusion(Z, b[n]); return p; };

/* ---------------- l'entrée : il se réveille, se redresse, avance de deux pas lourds ---------------- */
R.entrer = function(o){
  o = o || {};
  var self = this, j = this._debutAction(), S = 30;
  this.el.style.visibility = '';
  this.allume = true;
  this.eteintes = {yeux: 1};
  REVEIL.forEach(function(n){ self.eteintes[n] = 1; });
  this._majRunes(0);
  this._rouages(.05);
  var N = POSES.dormant, Zp = {pos: {x: 2 * S}};
  return this._allerA(fus(N, Zp), 1, null, true).then(function(){
    if(j !== self.jeton) return;
    /* 1. les runes s'allument une à une, le cœur d'abord, chacune avec un petit éclat */
    REVEIL.forEach(function(n, k){
      self._minuteur(function(){
        delete self.eteintes[n];
        self._majRunes(240);
        var el = ETINCELANTES[n] && (self.V['r-' + n] || [])[0];
        if(el){ var bb = el.getBBox(); self._eclat(self._ou(el, bb.x + bb.width / 2, bb.y + bb.height / 2), 9, '#dffcff', {anneau: CYANF, duree: 320}); }
      }, 200 + k * 95);
    });
    /* 2. la vapeur fuse des joints ; les rouages se remettent à tourner */
    [[350, 1], [700, 0], [1000, 5], [1300, 7], [1600, 4], [1900, 3], [2200, 8]].forEach(function(v){ self._minuteur(function(){ var jt = JOINTS[v[1]]; self._jet(self._pt(jt[0]), jt[1], {n: 3, blanc: true, force: 1.2}); }, v[0]); });
    [[900, .3], [1700, .65], [2500, 1]].forEach(function(v){ self._minuteur(function(){ self._rouages(v[1]); }, v[0]); });
    /* 3. il se redresse en grinçant, par à-coups ; ses yeux s'allument */
    var T = 3000;
    function pose(k, extra){ return fus(melange(N, {}, k), Zp, extra || {}); }
    var k = [{t: 0, p: {}},
      {t: .16, p: {poingF: {a: N.poingF.a - 10}}, e: 'cubic-bezier(.1,.9,.2,1)'}, {t: .22, p: {poingF: {a: N.poingF.a}}},
      {t: .3, p: {tete: {a: N.tete.a + 6, y: N.tete.y, x: N.tete.x}}, e: 'cubic-bezier(.1,.9,.2,1)'}, {t: .36, p: {tete: N.tete}},
      {t: .48, p: pose(.35), e: 'cubic-bezier(.2,.9,.3,1)'}, {t: .56, p: pose(.28), e: 'ease-in-out'},
      {t: .66, p: pose(.66), e: 'cubic-bezier(.2,.9,.3,1)'}, {t: .72, p: pose(.6), e: 'ease-in-out'},
      {t: .84, p: pose(1.06, {tete: {a: 4, y: -2}, machoire: {a: -6}}), e: 'cubic-bezier(.2,.9,.3,1)'},
      {t: 1, p: pose(1, {tete: {a: 0, y: 0}, machoire: {a: 0}})}];
    [.48, .66, .84].forEach(function(t){ self._minuteur(function(){ var p = self._pt('jEpaule'); self._miette(p); self._miette([p[0] - 60, p[1] + 20]); self._seq([{t: 0, p: {secousse: {x: 0}}}, {t: .3, p: {secousse: {x: 1.6}}}, {t: 1, p: {secousse: {x: 0}}}], 260, {ajout: true}); }, T * t); });
    self._minuteur(function(){
      delete self.eteintes.yeux;
      self._majRunes(120);
      self._clignerFort(0, 700);
      var p = self._pt('oeil');
      self._eclat([p[0] - 14, p[1]], 14, '#dffcff', {anneau: CYANF}); self._eclat([p[0] + 20, p[1] - 4], 12, '#dffcff', {anneau: CYANF, delai: 80});
      self._jet(self._pt('chem1'), -1.5, {n: 3, force: 1.5, blanc: true}); self._jet(self._pt('chem2'), -1.4, {n: 2, force: 1.4, blanc: true});
      self._seq([{t: 0, p: {capot1: {y: 0, a: 0}, capot2: {y: 0, a: 0}}}, {t: .3, p: {capot1: {y: -8, a: -8}, capot2: {y: -7, a: 9}}, e: 'cubic-bezier(.1,.9,.3,1)'}, {t: 1, p: {capot1: {y: 0, a: 0}, capot2: {y: 0, a: 0}}, e: 'cubic-bezier(.6,0,.9,.5)'}], 500, {ajout: true});
    }, T * .84);
    return self._seq(k, T).fini;
  }).then(function(){ if(j === self.jeton) return self._marcher(S, o.onPas); })
    .then(function(){ return self._finAction(j, 300); });
};
/* deux pas lourds (le pied de devant d'abord) : les pieds posés restent collés au sol (cinématique inverse),
   le corps plonge à chaque pas ; onPas(n) au moment où le pied frappe le sol */
R._marcher = function(S, onPas){
  var self = this, T = 2200, N = 14, k = [], X0 = 2 * S;
  function lisse(t){ return t * t * (3 - 2 * t); }
  function ph(t, a, b){ return Math.max(0, Math.min(1, (t - a) / (b - a))); }
  for(var i = 0; i <= 2 * N; i++){
    var tt = i / (2 * N), n = Math.min(1, Math.floor(tt * 2)), u = i === 2 * N ? 1 : tt * 2 - n;
    var X = X0 - S * n - S * lisse(ph(u, .08, .9));
    var lev = Math.sin(Math.PI * ph(u, .15, .8)) * 18, av = lisse(ph(u, .15, .8));
    var sy = (u > .78 ? 6 * Math.sin(Math.PI * ph(u, .78, 1)) : 0) - 2.5 * Math.sin(Math.PI * ph(u, .2, .75));
    var fF, fP;
    if(n === 0){ fF = X0 - 2 * S * av; fP = X0; } else { fF = X0 - 2 * S; fP = X0 - 2 * S * av; }
    var bal = Math.sin(Math.PI * ph(u, .1, .85)) * (n === 0 ? 1 : -1);
    var p = fus(jambe('F', fF - X, -sy - (n === 0 ? lev : 0), n === 0 ? -lev * .5 : 0), jambe('P', fP - X, -sy - (n === 1 ? lev : 0), n === 1 ? -lev * .5 : 0),
      {pos: {x: X}, saut: {y: sy, sy: u > .78 && u < .95 ? .975 : 1}, buste: {a: -1.5 * bal - (u > .78 ? 1.5 : 0), y: sy * .3}, tete: {a: bal * 2 + (u > .8 ? -3 : 0)},
        brasF: {a: 5 * bal}, avbrasF: {a: -3 * bal}, bras: {a: -4 * bal}, chaineF: {a: 14 * bal}, fil: {a: -10 * bal}, machoire: {a: u > .8 && u < .95 ? -4 : 0}});
    k.push({t: tt, p: p, e: 'linear'});
  }
  [.4, .9].forEach(function(t, m){
    self._minuteur(function(){
      var p = self._pt(m === 0 ? 'piedFC' : 'piedC');
      self._poussiere([p[0] - 20, p[1]], 3, -1); self._poussiere([p[0] + 30, p[1]], 2, 1);
      self._miette(self._pt('jEpaule'));
      self._jet(self._pt(m === 0 ? 'jGenouF' : 'jGenou'), m === 0 ? -2.6 : -.6, {n: 2, taille: .8});
      if(onPas) try{ onPas(m + 1); }catch(e){}
    }, T * t);
  });
  return this._seq(k, T).fini;
};

/* ---------------- l'attaque : le poing ---------------- */
R.attaquer = function(nom, o){
  if(typeof o === 'function') o = {onImpact: o};
  if(nom && typeof nom === 'object'){ o = nom; nom = null; }
  o = o || {};
  var self = this, j = this._debutAction(), vite = this.etat.enrage, T = vite ? 1700 : 2500, impactOk, impactP = new Promise(function(r){ impactOk = r; });
  var cible = o.vers ? this._depuisEcran(o.vers) : [-90, 292];
  /* la fente : le corps avance pour que le poing arrive au plus près de la cible */
  var Sx = ART.epauleF[0], Sy = ART.epauleF[1], portee = 205, dy = cible[1] - Sy;
  var Lg = Math.max(36, Math.min(110, Sx - cible[0] - Math.sqrt(Math.max(0, portee * portee - dy * dy))));
  /* le poignet visé, dans le repère du buste penché en avant */
  var bA = -8, cl = rotP([cible[0] + Lg, cible[1]], -bA, ART.buste), dir = angle(ART.epauleF, cl), lp = Math.min(184, Math.max(120, Math.hypot(cl[0] - Sx, cl[1] - Sy) - 30));
  dir = Math.max(.35, Math.min(2.2, dir));
  function W(l, dyy){ return [Sx + Math.cos(dir) * l, Sy + Math.sin(dir) * l + (dyy || 0)]; }
  var armer = membre('F', [196, -40], -40), frappe = membre('F', W(lp), 10), retour = membre('F', W(lp - 30, -12), -6);
  var fin = this._toutesPieces(fus(armer, {pos: 1, buste: 1, saut: 1, tete: 1, machoire: 1, epaule: 1, chaineF: 1, bras: 1, avbras: 1, poing: 1, secousse: 1, capot1: 1, capot2: 1}, jambe('F', 0, 0), jambe('P', 0, 0)));
  var k = [{t: 0, p: {}},
    /* 1. il arme son bras au-dessus de la tête : lent, lourd */
    {t: .34, p: fus(armer, {buste: {a: 7, y: 2}, saut: {y: 5, sy: .975}, tete: {a: -6, y: 3, x: 0}, machoire: {a: -5}, epaule: {a: -3, y: -2}, chaineF: {a: 40}, bras: {a: -9}, avbras: {a: 8}, poing: {a: -6}}, jambe('F', 0, -5), jambe('P', 0, -5)), e: 'cubic-bezier(.45,0,.35,1)'},
    /* il tremble sous le poids, au sommet */
    {t: .38, p: {secousse: {x: 1.4}}, e: 'linear'}, {t: .41, p: {secousse: {x: -1.4}}, e: 'linear'}, {t: .44, p: {secousse: {x: 1}}, e: 'linear'}, {t: .47, p: {secousse: {x: 0}}, e: 'linear'},
    /* 2. la frappe : il se jette en avant, le pied de devant frappe le sol */
    {t: .51, p: fus(jambe('F', -Lg * .25, -16, -8), {pos: {x: -Lg * .55}}), e: 'cubic-bezier(.6,0,1,.6)'},
    {t: .54, p: fus(frappe, {pos: {x: -Lg}, buste: {a: bA, y: 0}, saut: {y: 3, sy: 1.02}, tete: {a: -10, x: -4, y: 2}, machoire: {a: -12}, epaule: {a: 3, y: 0}, chaineF: {a: -50}, bras: {a: 12}, avbras: {a: -10}, poing: {a: 4}},
      jambe('F', 0, -3), jambe('P', Lg, -3, -10)), e: 'cubic-bezier(.4,0,1,.7)'},
    /* 3. l'impact : le bras rebondit un peu */
    {t: .6, p: fus(retour, {pos: {x: -Lg + 12}, buste: {a: bA + 3}, saut: {y: 0, sy: .98}, chaineF: {a: 30}}, jambe('P', Lg - 12, 0, -8)), e: 'cubic-bezier(.2,.8,.3,1)'},
    /* 4. le gros recul de vapeur : il est repoussé en arrière, il souffle */
    {t: .78, p: fus(membre('F', [116, 250], -10), {pos: {x: -Lg * .3}, buste: {a: 6, y: 2}, saut: {y: 4, sy: .97}, tete: {a: 8, x: 0, y: -1}, machoire: {a: -16}, epaule: {a: -4, y: -3}, chaineF: {a: -20}, bras: {a: -6}, avbras: {a: 4}, poing: {a: 0}},
      jambe('F', -Lg * .7, -4), jambe('P', Lg * .3, -4)), e: 'cubic-bezier(.3,.6,.4,1)'},
    {t: .88, p: jambe('F', -Lg * .2, -12, -6), e: 'ease-in-out'},
    {t: 1, p: fin, e: 'cubic-bezier(.4,0,.3,1.1)'}];
  function ms(t){ return T * t; }
  this._rouages(vite ? 2.6 : 1.7);
  [.05, .15, .25].forEach(function(t){ self._minuteur(function(){ self._jet(self._pt('jEpauleF'), -1.8, {n: 2, taille: .8}); self._jet(self._pt('jCoudeF'), -2.2, {n: 1, taille: .7}); }, ms(t)); });
  this._minuteur(function(){ self._clignerFort(0, ms(.2)); self._eclat(self._pt('poingFC'), 13, '#ffffff', {duree: 320}); }, ms(.34));
  this._minuteur(function(){ self._rouages(vite ? 4 : 3); }, ms(.47));
  this._minuteur(function(){ var p = self._pt('piedFC'); self._poussiere([p[0] - 20, p[1]], 2, -1); }, ms(.52));
  this._minuteur(function(){
    var p = self._pt('poingFBout');
    self._eclat(p, 40, '#fff8d0', {rot: 25, duree: 480}); self._etincelles(p, 8, {v: 70, ang: Math.PI, ouv: 2.6});
    self._flash(p, 90);
    self._onde(p, cible);
    self._poussiere([p[0] + 30, SOL], 2, -1);
    if(o.onImpact) try{ o.onImpact(); }catch(e){}
    impactOk();
  }, ms(.54));
  this._minuteur(function(){
    self._jet(self._pt('chem1'), -1.5, {n: 2, force: 1.6, taille: 1.2}); self._jet(self._pt('chem2'), -1.4, {n: 2, force: 1.5, taille: 1.2});
    self._jet(self._pt('jCoudeF'), -2.4, {n: 2}); self._jet(self._pt('jEpaule'), -1, {n: 1}); self._jet(self._pt('bouche'), Math.PI * .9, {n: 2, taille: 1.1});
    self._seq([{t: 0, p: {capot1: {y: 0, a: 0}, capot2: {y: 0, a: 0}}}, {t: .3, p: {capot1: {y: -9, a: -10}, capot2: {y: -8, a: 10}}, e: 'cubic-bezier(.1,.9,.3,1)'}, {t: 1, p: {capot1: {y: 0, a: 0}, capot2: {y: 0, a: 0}}, e: 'cubic-bezier(.6,0,.9,.5)'}], 520, {ajout: true});
  }, ms(.64));
  this._minuteur(function(){ self._rouages(self.etat.enrage ? 1.8 : 1); }, ms(.9));
  var pr = this._seq(k, T).fini.then(function(){ return self._finAction(j, 260); });
  pr.impact = impactP;
  return pr;
};
/* l'onde de choc du poing : elle file jusqu'à la cible et y éclate */
R._onde = function(p, cible){
  var dx = cible[0] - p[0], dy = cible[1] - p[1], d = Math.hypot(dx, dy);
  if(d < 50) return;
  var a = Math.atan2(dy, dx) * 180 / Math.PI, arc = 'M0 -26 Q -16 0 0 26';
  for(var i = 0; i < 2; i++){
    var g = this._fxEl(L(arc, '#ffffff', 5, so(.85)) + L(arc, '#dff6ff', 12, so(.25)));
    g.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) rotate(' + f1(a + 180) + 'deg) scale(.5,.4)', opacity: 1},
      {transform: 'translate(' + f1(cible[0]) + 'px,' + f1(cible[1]) + 'px) rotate(' + f1(a + 180) + 'deg) scale(1.3,1.5)', opacity: .2}], {duration: 160 + i * 60, delay: i * 50, easing: 'cubic-bezier(.2,.6,.4,1)', fill: 'both'}).finished.then(oter(g), oter(g));
  }
  this._eclat(cible, 30, '#fff8d0', {delai: 170, duree: 380});
};

/* ---------------- les réactions aux coups ---------------- */
R.touche = function(type, o){
  if(this.mort) return Promise.resolve();
  var f = this['_t_' + (type || 'coup').replace(/-/g, '_')];
  return f ? f.call(this, o || {}) : this._t_coup(o || {});
};
R.special = function(nom, o){
  if(this.mort) return Promise.resolve();
  var f = this['_s_' + (nom || '').replace(/-/g, '_')];
  return f ? f.call(this, o || {}) : Promise.resolve();
};
R._plaqueFermee = function(){ var e = this.etat; return !e['plaque-ouverte'] && !e['sans-plaque']; };
R._coeurNu = function(){ var e = this.etat; return e.ouvert || e['plaque-ouverte'] || e['sans-plaque'] || e['plaque-entrouverte']; };
/* un point du fer de la poitrine (le plastron, la plaque, la couronne) */
R._pointFer = function(){ var q = choisir([[hasard(166, 206), hasard(130, 240)], [hasard(296, 330), hasard(118, 240)], [hasard(206, 284), hasard(140, 228)]]); return this._ouB(2, q[0], q[1]); };
/* « ting » sur le fer : un éclat blanc et des étincelles */
R._ting = function(p, gros){
  this._eclat(p, gros ? 30 : 18, '#ffffff', {anneau: '#fff4c0', duree: gros ? 520 : 380});
  this._etincelles(p, gros ? 12 : 7, {v: gros ? 80 : 50, ouv: Math.PI * 1.8, ang: Math.PI * 1.2, coul: ['#fff6c0', '#ffd060', '#ffffff']});
};
/* ce qui ricoche : une flèche, une dague ou une louche, qui tournoie et retombe */
R._ricochet = function(p, arme){
  var h;
  if(arme === 'dague') h = P('M-4 -3 L 22 0 L -4 3 Z', '#dfe6f0', ' stroke-width="1.6"') + P('M-6 -7 L -3 -7 L -3 7 L -6 7 Z', '#8a6a3a', ' stroke-width="1.4"') + P('M-18 -2.5 L -6 -2.5 L -6 2.5 L -18 2.5 Z', '#5a3a22', ' stroke-width="1.4"');
  else if(arme === 'louche') h = P('M-30 -2 L 6 -2 L 6 2 L -30 2 Z', '#b0884a', ' stroke-width="1.4"') + P('M6 -9 C 24 -10 24 10 6 9 Z', '#c8cdd8', ' stroke-width="1.8"');
  else h = L('M-22 0 L 16 0', O, 5) + L('M-22 0 L 16 0', '#c8a070', 2.6) + P('M16 -4 L 26 0 L 16 4 Z', '#d8dce8', ' stroke-width="1.4"') + P('M-22 0 L -28 -5 L -18 0 L -28 5 Z', '#e8e0d0', ' stroke-width="1.2"');
  var g = this._fxEl(h), x2 = p[0] - hasard(60, 110), y2 = SOL - 4, r = arme === 'louche' ? -400 : -560;
  g.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) rotate(0deg)'}, {offset: .4, transform: 'translate(' + f1(p[0] - 40) + 'px,' + f1(p[1] - 60) + 'px) rotate(' + (r * .45) + 'deg)'},
    {offset: .85, transform: 'translate(' + f1(x2) + 'px,' + f1(y2) + 'px) rotate(' + r + 'deg)', opacity: 1}, {transform: 'translate(' + f1(x2 - 8) + 'px,' + f1(y2) + 'px) rotate(' + (r - 20) + 'deg)', opacity: 0}],
    {duration: 950, easing: 'cubic-bezier(.3,.5,.6,1)', fill: 'forwards'}).finished.then(oter(g), oter(g));
};
/* la réaction de base à un coup (f : 0,4 petit sursaut ; 1,4 gros choc) : il bascule en arrière autour de la taille */
R._recul = function(f, o){
  o = o || {};
  var self = this, j = this._debutAction(), b = this._base(), T = 760 * Math.max(.8, Math.min(1.3, f));
  var bt = fusion(Z, b.tete), bb = fusion(Z, b.buste);
  if(o.flash !== false) this._flash(this._pt(o.ou || 'centre'), 120, o.grad);
  var k = [{t: 0, p: {}},
    {t: .14, p: {secousse: {x: 5 * f, y: -1, a: 1 * f}, buste: {a: bb.a + 6 * f, y: bb.y}, tete: {a: bt.a + 10 * f, y: bt.y - 2, x: bt.x}, machoire: {a: -12 * f}, saut: {sx: 1 - .03 * f, sy: 1 + .02 * f}, chaineF: {a: 26 * f}, fil: {a: 18 * f}, epaule: {a: -3 * f}}, e: 'cubic-bezier(.1,.9,.3,1)'},
    {t: .42, p: {secousse: {x: 2 * f, y: 0, a: -.4 * f}, buste: {a: bb.a - 2 * f}, tete: {a: bt.a - 3 * f}, machoire: {a: -4 * f}, saut: {sx: 1 + .01 * f, sy: 1 - .015 * f}, chaineF: {a: -16 * f}, epaule: {a: 1}}, e: 'ease-in-out'},
    {t: 1, p: {secousse: {x: 0, y: 0, a: 0}, buste: bb, tete: bt, machoire: fusion(Z, b.machoire), saut: fusion(Z, b.saut), chaineF: fusion(Z, b.chaineF), fil: fusion(Z), epaule: fusion(Z, b.epaule)}, e: 'cubic-bezier(.4,0,.3,1.2)'}];
  if(f >= .9) this._minuteur(function(){ var jt = choisir(JOINTS); self._jet(self._pt(jt[0]), jt[1], {n: 2}); }, 120);
  return this._seq(k, T).fini.then(function(){ return self._finAction(j, 220); });
};
R._t_coup = function(o){ return this._recul(1); };
/* le cœur touché (point faible ouvert) : éclat cyan, étincelles, il chancelle */
R._coupCoeur = function(f, type){
  var c = this._pt('coeurC');
  this._eclat(c, 22 + f * 10, '#e8ffff', {anneau: CYANF});
  this._etincelles(c, 6 + Math.round(f * 4), {v: 60, coul: ['#ffffff', CYAN, '#bff8ff'], ang: 0, ouv: 3});
  if(type === 'dague') this._rayures(c);
  this._clignerRunes(400);
  return this._recul(f, {ou: 'coeurC', grad: this.G.cyan});
};
R._t_fleche = function(o){
  if(this.etat.ouvert) return this._coupCoeur(1.05);
  var p = this._pointFer();
  this._ting(p, false); this._ricochet(p, 'fleche');
  return this._recul(.35, {flash: false});
};
R._t_fleche_argent = function(o){ return this._t_fleche(o); };
/* la flèche lourde : grosses étincelles et une bosse dans le fer (il reste fermé) ; il regarde la bosse */
R._t_fleche_lourde = function(o){
  if(this.etat.ouvert) return this._coupCoeur(1.4);
  var self = this, n = this.bosses % 3, el = (this.V['bosse' + n] || [])[0];
  this.bosses++;
  var p = el ? this._ou(el.parentNode, 0, 0) : this._pointFer();
  this._ting(p, true);
  this._ondes([p[0] - 30, p[1]], -1, '#fff4c0'); this._ondes([p[0] + 30, p[1]], 1, '#fff4c0');
  if(el){ this._fondu(el, 1, 80); el.animate([{transform: 'scale(.2)'}, {transform: 'scale(1.35)'}, {transform: 'scale(1)'}], {duration: 320, easing: 'cubic-bezier(.2,.8,.3,1.3)'}); }
  return this._recul(1.05).then(function(){
    if(self.mort || self.enAction) return;
    /* il baisse la tête vers la bosse… puis relève les yeux, plus fâché */
    self._seq([{t: 0, p: {tete: {a: 0, y: 0}}}, {t: .3, p: {tete: {a: -9, y: 3}}, e: 'cubic-bezier(.3,.7,.3,1)'}, {t: .7, p: {tete: {a: -9, y: 3}}}, {t: 1, p: {tete: {a: 0, y: 0}}}], 1200, {ajout: true});
  });
};
R._t_dague = function(o){
  if(this.etat.ouvert) return this._coupCoeur(1.1, 'dague');
  var p = this._pointFer();
  for(var i = 0; i < 3; i++) this._etincelles([p[0] - 12 + i * 10, p[1] - 6 + i * 6], 4, {v: 40, ang: Math.PI * 1.1, delai: i * 60});
  this._rayures(p);
  return this._recul(.4, {flash: false});
};
/* immunisé : ça ricoche en étincelles ; il tourne LENTEMENT la tête vers le tireur, ses yeux s'allument, il souffle de mépris */
R._t_rebond = function(o){
  var self = this, j = this._debutAction(), p = this._pointFer(), arme = o.arme || 'fleche', T = 2700, b = this._base();
  var bt = fusion(Z, b.tete), bb = fusion(Z, b.buste);
  this._ting(p, true); this._ricochet(p, arme);
  if(arme === 'louche'){ var h = this._pt('haut'); this._ondes([h[0] - 40, h[1] + 20], -1); this._ondes([h[0] + 40, h[1] + 20], 1); }
  var k = [{t: 0, p: {}},
    {t: .05, p: {secousse: {x: 2.5}}, e: 'cubic-bezier(.1,.9,.3,1)'}, {t: .12, p: {secousse: {x: 0}}},
    {t: .2, p: {tete: {a: bt.a - 1.5, x: bt.x, y: bt.y}}, e: 'cubic-bezier(.1,.9,.2,1)'},
    {t: .25, p: {tete: {a: bt.a - 1.5}}},
    {t: .52, p: {tete: {a: bt.a - 13, x: bt.x - 4, y: bt.y + 3}, buste: {a: bb.a - 2, y: bb.y}}, e: 'cubic-bezier(.5,0,.4,1)'},
    {t: .68, p: {tete: {a: bt.a - 13, x: bt.x - 4, y: bt.y + 3}, machoire: {a: 0}, buste: {a: bb.a - 2}}},
    {t: .74, p: {machoire: {a: -9}, buste: {a: bb.a - 3.5, y: bb.y + 1}}, e: 'ease-out'},
    {t: .84, p: {machoire: {a: 0}, buste: {a: bb.a - 2, y: bb.y}}},
    {t: 1, p: {tete: bt, buste: bb, machoire: fusion(Z, b.machoire), secousse: fusion(Z)}, e: 'cubic-bezier(.4,0,.3,1)'}];
  this._minuteur(function(){ self._fondu('yeuxFort', 1, 260); }, T * .45);
  this._minuteur(function(){ self._fondu('yeuxFort', 0, 500); }, T * .84);
  this._minuteur(function(){
    var m = self._pt('bouche');
    for(var i = 0; i < 3; i++) self._bouffee([m[0] - 4, m[1]], {r: 5, op: .75, grad: self.etat.enrage ? self.G.vapeurR : self.G.vapeur, dx: hasard(-40, -24), dy: hasard(-14, 4), duree: 700, delai: i * 90, s1: 2.6});
    self._jet(self._pt('chem1'), -1.5, {n: 2, force: 1.2});
  }, T * .72);
  return this._seq(k, T).fini.then(function(){ return self._finAction(j, 200); });
};
/* la louche : BONG sur la tête ; elle sonne comme une cloche */
R._t_louche = function(o){
  var self = this, j = this._debutAction(), h = this._pt('haut'), b = this._base(), bt = fusion(Z, b.tete);
  this._eclat([h[0] - 10, h[1] + 10], 32, '#ffe466', {rot: 30});
  this._etincelles([h[0], h[1] + 6], 9, {v: 60, ang: -Math.PI / 2, ouv: Math.PI * 1.4});
  this._ondes([h[0] - 46, h[1] + 24], -1); this._ondes([h[0] + 46, h[1] + 24], 1);
  this._ricochet([h[0] - 10, h[1] + 10], 'louche');
  this._clignerYeux();
  var k = [{t: 0, p: {}}, {t: .08, p: {tete: {a: bt.a - 8, y: bt.y + 6}, saut: {sy: .97}, machoire: {a: -6}}, e: 'cubic-bezier(.1,.9,.3,1)'}];
  for(var i = 0; i < 8; i++) k.push({t: .14 + i * .08, p: {tete: {a: bt.a + (i % 2 ? 1 : -1) * (6 - i * .7), y: bt.y + 2 - i * .25}, saut: {sy: 1}}, e: 'ease-in-out'});
  k.push({t: 1, p: {tete: bt, machoire: fusion(Z, b.machoire), saut: fusion(Z, b.saut)}});
  return this._seq(k, 1500).fini.then(function(){ return self._finAction(j, 200); });
};
/* une boule de feu qui éclate sur lui */
R._souffleFeu = function(p, r){
  for(var i = 0; i < 6; i++) this._bouffee([p[0] + hasard(-r, r) * .5, p[1] + hasard(-r, r) * .4], {r: hasard(r * .35, r * .6), grad: this.D.doux(choisir(['#ffb040', '#ff7a1a', '#ffd060', '#ff5a10']), .95), op: .9, dx: hasard(-r, r) * .6, dy: hasard(-r * 1.2, -r * .4), duree: hasard(450, 750), delai: i * 30, s0: .4, s1: 1.8});
  this._etincelles(p, 5, {v: r * 1.4, coul: ['#ffd060', '#ff9a30', '#fff0a0']});
};
/* le feu le renforce : il chauffe au rouge, gonfle la poitrine, souffle une vapeur brûlante */
R._t_feu = function(o){
  var self = this, j = this._debutAction(), c = this._pt('centre'), b;
  this._souffleFeu(c, 60);
  if(!this.etat.rougeoie) this._e_rougeoie(true);
  else this._fondu(this._varis('chaud-'), .9, 200);
  b = this._base();
  var k = [{t: 0, p: {}},
    {t: .14, p: {secousse: {x: 6, a: 1}, buste: {a: 4}, tete: {a: 8}, machoire: {a: -8}}, e: 'cubic-bezier(.1,.9,.3,1)'},
    {t: .45, p: fus(membre('F', [120, 236], -16), {secousse: {x: 0, a: 0}, buste: {a: -2, y: -5, sy: 1.04}, tete: {a: 10, y: -3}, machoire: {a: -20}, saut: {sy: 1.03}, bras: {a: -14}, avbras: {a: -12}, poing: {a: -10}, epaule: {a: -6, y: -6}}), e: 'cubic-bezier(.3,.7,.3,1)'},
    {t: .5, p: {secousse: {x: 1.6}}}, {t: .55, p: {secousse: {x: -1.6}}}, {t: .6, p: {secousse: {x: 1.6}}}, {t: .65, p: {secousse: {x: 0}}},
    {t: 1, p: this._toutesPieces({secousse: 1, buste: 1, tete: 1, machoire: 1, saut: 1, brasF: 1, avbrasF: 1, poingF: 1, bras: 1, avbras: 1, poing: 1, epaule: 1}), e: 'ease-in-out'}];
  this._minuteur(function(){
    self._jet(self._pt('bouche'), Math.PI * .95, {n: 3, taille: 1.1}); self._jet(self._pt('chem1'), -1.5, {n: 2, force: 1.5}); self._jet(self._pt('jCoudeF'), -2.4, {n: 2});
    self._braise(self._pt('centre')); self._braise(self._pt('torseHaut'));
  }, 1600 * .45);
  return this._seq(k, 1600).fini.then(function(){ return self._finAction(j, 300); });
};
R._t_brulure = function(o){
  var self = this;
  if(!this.etat.brule) this._e_brule(true);
  this._souffleFeu(this._pt('feuEpaule'), 30);
  return this._recul(.6);
};
/* la lumière : plaque fermée = PIÈGE (ses runes s'enflamment en rouge, il s'énerve) ; cœur à nu = il est ébloui */
R._t_lumiere = function(o){ return this._coeurNu() ? this._coeurEbloui(o) : this._piege(o); };
R._piege = function(o){
  var self = this, j = this._debutAction(), c = this._pt('plaqueC'), T = 2400;
  this._rayons(c, 70); this._flash(c, 140, this.G.lumiere);
  this._fondu('yeuxFort', 1, 120);
  this.etat.enrage = true;
  /* les runes s'enflamment une à une : cyan -> rouge */
  REVEIL.forEach(function(n, i){
    self._minuteur(function(){
      self._fondu(self.V['r-' + n] || [], 0, 160); self._fondu(self.V['rr-' + n] || [], self._cibleRune('rr-' + n), 160);
      var el = ETINCELANTES[n] && (self.V['rr-' + n] || [])[0];
      if(el && i % 2){ var bb = el.getBBox(); self._eclat(self._ou(el, bb.x + bb.width / 2, bb.y + bb.height / 2), 9, '#ffd0b0', {anneau: ROUGE, duree: 300}); }
    }, 300 + i * 42);
  });
  this._minuteur(function(){ self._fondu('yeuxFort', 0, 200); self._majRunes(150); self._rouages(1.8); }, 300 + REVEIL.length * 42);
  var k = [{t: 0, p: {}},
    {t: .1, p: {buste: {a: 5}, tete: {a: 10, y: -2}, machoire: {a: -8}, secousse: {x: 6}}, e: 'cubic-bezier(.1,.9,.3,1)'},
    {t: .25, p: {secousse: {x: 0}}},
    {t: .4, p: {secousse: {x: 1.6}}, e: 'linear'}, {t: .44, p: {secousse: {x: -1.6}}, e: 'linear'}, {t: .48, p: {secousse: {x: 1.6}}, e: 'linear'}, {t: .52, p: {secousse: {x: 0}}, e: 'linear'},
    /* il rugit, les deux bras levés */
    {t: .7, p: fus(membre('F', [150, 4], -40), membre('P', [470, 120], -40), {buste: {a: 6, y: -3}, tete: {a: 14, y: -3}, machoire: {a: -24}, saut: {y: -6, sy: 1.03}, epaule: {a: -10, y: -8}}, jambe('F', 0, 6), jambe('P', 0, 6)), e: 'cubic-bezier(.3,.7,.3,1)'},
    /* et frappe du pied */
    {t: .83, p: fus({saut: {y: 5, sy: .95}, buste: {a: -4, y: 2}, tete: {a: -6}, machoire: {a: -10}}, jambe('F', 0, -5), jambe('P', 0, -5)), e: 'cubic-bezier(.6,0,.9,.5)'},
    {t: 1, p: this._toutesPieces(fus({buste: 1, tete: 1, machoire: 1, secousse: 1, saut: 1, epaule: 1}, membre('F', [0, 0]), membre('P', [0, 0]), jambe('F', 0, 0), jambe('P', 0, 0)))}];
  this._minuteur(function(){
    JOINTS.slice(0, 5).forEach(function(jt, i){ self._jet(self._pt(jt[0]), jt[1], {n: 1, delai: i * 40}); });
    self._jet(self._pt('chem1'), -1.5, {n: 2, force: 1.5}); self._jet(self._pt('bouche'), Math.PI * .95, {n: 2});
  }, T * .7);
  this._minuteur(function(){ self._poussiere(self._pt('piedFC'), 3, -1); self._poussiere(self._pt('piedC'), 3, 1); }, T * .83);
  return this._seq(k, T).fini.then(function(){ return self._finAction(j, 300); });
};
R._coeurEbloui = function(o){
  var self = this, j = this._debutAction(), c = this._pt('coeurC'), T = 1900;
  this._rayons(c, 90, '#e8ffff'); this._flash(c, 160, this.G.cyan);
  this._rouages(5);
  this._clignerRunes(1200);
  [200, 500, 800, 1100].forEach(function(t){ self._minuteur(function(){ self._etincelles(self._pt('coeurC'), 5, {v: 60, coul: ['#ffffff', CYAN, '#fff6c0'], ouv: Math.PI * 2}); }, t); });
  var k = [{t: 0, p: {}},
    {t: .1, p: {coeur: {s: 1.3}, buste: {a: 6}, tete: {a: 10}, machoire: {a: -10}, secousse: {x: 8}}, e: 'cubic-bezier(.1,.9,.3,1)'},
    {t: .18, p: {coeur: {s: .9}}}, {t: .26, p: {coeur: {s: 1.25}, secousse: {x: 3}}}, {t: .34, p: {coeur: {s: .92}}}, {t: .42, p: {coeur: {s: 1.22}, tete: {a: -6}}, e: 'cubic-bezier(.1,.9,.2,1)'},
    {t: .5, p: {coeur: {s: .95}, tete: {a: 8}}, e: 'cubic-bezier(.1,.9,.2,1)'}, {t: .58, p: {coeur: {s: 1.2}, tete: {a: -4}}, e: 'cubic-bezier(.1,.9,.2,1)'},
    {t: 1, p: avec(POSES.ebloui, {coeur: {s: 1}, secousse: {x: 0}})}];
  return this._seq(k, T).fini.then(function(){
    self._rouages(1.3);
    if(j !== self.jeton) return;
    self.enAction = false;
    if(self.etat.ebloui) return self._reprendre(200);
    return self._e_ebloui(true);
  });
};
R._t_colle = function(o){
  var self = this, p = this._pt('piedFC');
  for(var i = 0; i < 5; i++) this._bouffee([p[0] + hasard(-30, 30), p[1] - 24], {r: 7, grad: this.D.doux('#d0e05a', .95), op: .9, dx: hasard(-20, 20), dy: hasard(10, 26), duree: 500, delai: i * 30, s1: 1.4});
  return this._recul(.4, {flash: false}).then(function(){ return self.etatPublic('colle', true); }).then(function(){ if(!self.enAction && !self.mort) self._tirerPied(); });
};
/* l'huile : ses pieds glissent, il mouline des bras, se rattrape d'un grand coup de pied (il ne tombe pas) */
R._t_huile = function(o){
  var self = this, j = this._debutAction(), T = 2000;
  this._flaque('huile', 270, 170);
  var k = [{t: 0, p: {}}];
  k.push({t: .14, p: fus(jambe('F', -24, 0, -4), jambe('P', 16, 0, 4), membre('F', [56, 196], -20), {pos: {x: -6}, saut: {y: 6}, buste: {a: -5}, tete: {a: -8}, machoire: {a: -12}, bras: {a: -38}, avbras: {a: -30}, poing: {a: -20}, chaineF: {a: 40}}), e: 'cubic-bezier(.3,.6,.5,1)'});
  for(var i = 0; i < 4; i++){
    var s = i % 2 ? 1 : -1;
    k.push({t: .24 + i * .13, p: fus(jambe('F', -24 + s * 10, 0, s * 4), jambe('P', 16 - s * 8, 0), membre('F', s > 0 ? [60, 40] : [40, 250], s * 30), {pos: {x: s * 8}, buste: {a: s * 6}, tete: {a: -s * 8}, bras: {a: s > 0 ? -60 : 30}, avbras: {a: s > 0 ? -40 : 20}, chaineF: {a: -s * 40}, epaule: {a: s * 4}}), e: 'ease-in-out'});
  }
  k.push({t: .84, p: fus(jambe('F', 0, -6), jambe('P', 0, -6), {pos: {x: 0}, saut: {y: 7, sy: .94}, buste: {a: -3}, tete: {a: -4}, machoire: {a: -6}, brasF: {a: 0}, avbrasF: {a: 0}, poingF: {a: 0}, bras: {a: 0}, avbras: {a: 0}, poing: {a: 0}}), e: 'cubic-bezier(.6,0,.9,.5)'});
  k.push({t: 1, p: this._toutesPieces(fus({pos: 1, saut: 1, buste: 1, tete: 1, machoire: 1, chaineF: 1, epaule: 1}, jambe('F', 0, 0), jambe('P', 0, 0)))});
  this._minuteur(function(){ self._jet(self._pt('jGenouF'), -2.6, {n: 2}); self._jet(self._pt('jGenou'), -.6, {n: 2}); }, T * .45);
  this._minuteur(function(){ self._poussiere(self._pt('piedFC'), 3, -1); self._poussiere(self._pt('piedC'), 3, 1); }, T * .84);
  return this._seq(k, T).fini.then(function(){ setTimeout(function(){ self._enleverFlaque('huile'); }, 700); return self._finAction(j, 200); });
};
R._t_nuage = function(o){ return this.tousser(); };
R._t_givre = function(o){
  if(this._plaqueFermee()) return this._s_plaque_eclate(o);
  var self = this;
  this._cristaux(this._pt('centre'), 10, {v: 60});
  return this._recul(.7, {flash: false}).then(function(){ return self.etatPublic('gele', true); });
};
R._t_acide = function(o){
  if(this._plaqueFermee()) return this._s_plaque_tombe(o);
  var p = this._pt('coeurC');
  this._bulles(p, 6, {etendue: 3});
  this._bouffee(p, {r: 10, grad: this.D.doux('#c8e0a0', .9), op: .7, dy: -50, duree: 1000});
  return this._recul(1.1);
};
/* un grand bruit : il sursaute, ses plaques claquent, ses runes vacillent */
R._t_bruit = function(o){
  var self = this, j = this._debutAction(), h = this._pt('tete');
  this._ondes([h[0] - 70, h[1] + 20], -1); this._ondes([h[0] + 60, h[1]], 1);
  this._clignerRunes(500);
  var k = [{t: 0, p: {}}, {t: .12, p: {saut: {y: -10, sy: 1.04}, tete: {a: 8}, machoire: {a: -10}, capot1: {y: -6, a: -6}, capot2: {y: -6, a: 6}, epaule: {y: -5}, plaque: {sx: .92}, chaineF: {a: 30}}, e: 'cubic-bezier(.1,.9,.3,1)'}];
  for(var i = 0; i < 5; i++) k.push({t: .2 + i * .1, p: {saut: {y: i ? 0 : 2, sy: 1}, capot1: {y: i % 2 ? -3 : 0, a: 0}, capot2: {y: i % 2 ? 0 : -3, a: 0}, epaule: {y: i % 2 ? -2 : 0}, machoire: {a: i % 2 ? -6 : -1}, tete: {a: i % 2 ? -4 : 4}}, e: 'ease-in-out'});
  k.push({t: 1, p: this._toutesPieces({saut: 1, tete: 1, machoire: 1, capot1: 1, capot2: 1, epaule: 1, plaque: 1, chaineF: 1})});
  return this._seq(k, 1100).fini.then(function(){ return self._finAction(j, 200); });
};
/* il frappe un bouclier de runes : choc cyan, son bras rebondit, il s'arrête net… et sa plaque s'entrouvre */
R._t_bouclier = function(o){
  var self = this, j = this._debutAction(), T = 1500;
  var k = [{t: 0, p: {}},
    {t: .2, p: fus(membre('F', [30, 236], 6), {pos: {x: -24}, buste: {a: -6}, tete: {a: -6}, machoire: {a: -8}}, jambe('P', 24, 0)), e: 'cubic-bezier(.6,0,.9,.5)'},
    {t: .28, p: fus(membre('F', [140, 214], 40), {pos: {x: -8}, buste: {a: 9}, tete: {a: 12, y: -2}, secousse: {x: 9}, machoire: {a: -14}, chaineF: {a: 50}}, jambe('P', 8, 0)), e: 'cubic-bezier(.1,.9,.3,1)'},
    {t: .4, p: {secousse: {x: 0}}, e: 'ease-out'},
    {t: .62, p: fus(membre('F', [120, 250], 20), {pos: {x: -6}, buste: {a: 4}, tete: {a: 4}, machoire: {a: -2}, chaineF: {a: -10}})},
    {t: 1, p: this._toutesPieces(fus(membre('F', [0, 0]), jambe('P', 0, 0), {pos: 1, buste: 1, tete: 1, machoire: 1, secousse: 1, chaineF: 1}))}];
  this._minuteur(function(){
    var p = self._pt('poingFBout');
    self._eclat([p[0] - 10, p[1]], 34, '#bff8ff', {anneau: CYANF, duree: 460}); self._etincelles(p, 10, {v: 60, ang: 0, ouv: 2.4, coul: ['#bff8ff', CYAN, '#ffffff']});
    self._ondes([p[0] - 16, p[1]], -1, '#bff8ff');
    if(o.onImpact) try{ o.onImpact(); }catch(e){}
  }, T * .22);
  this._minuteur(function(){ self._jet(self._pt('jCoudeF'), -2.2, {n: 2}); }, T * .3);
  return this._seq(k, T).fini.then(function(){ if(j !== self.jeton) return; self.enAction = false; return self._s_entrouvert(o); });
};

/* ---------------- les moments propres ---------------- */
/* la plaque s'entrouvre : le loquet saute, elle bâille sur ses charnières, la lumière du cœur s'en échappe */
R._s_entrouvert = function(o){
  var self = this, e = this.etat;
  if(e['sans-plaque'] || e['plaque-ouverte']) return Promise.resolve();
  var j = this._debutAction(), T = 1300;
  e['plaque-entrouverte'] = true;
  var k = [{t: 0, p: {}},
    {t: .12, p: {loquet: {a: -40}, secousse: {x: 3}, plaque: {sx: .96}}, e: 'cubic-bezier(.1,.9,.3,1)'},
    {t: .32, p: {plaque: {sx: .58, a: -4}, secousse: {x: 0}, buste: {a: 2}, tete: {a: -8, y: 2}}, e: 'cubic-bezier(.2,.8,.3,1.3)'},
    {t: .48, p: {plaque: {sx: .8, a: -2}}, e: 'ease-in-out'}, {t: .62, p: {plaque: PLAQUE_ENTR}},
    {t: 1, p: {loquet: {a: -40}, buste: {a: 0}, tete: {a: 0, y: 0}}}];
  this._minuteur(function(){ self._eclat(self._pt('plaqueBord'), 10, '#ffffff', {duree: 260}); self._etincelles(self._pt('plaqueBord'), 4, {v: 30}); }, T * .12);
  this._minuteur(function(){
    var p = self._pt('plaqueBord');
    self._rayons([p[0] + 6, p[1]], 50, '#dffcff');
    self._jet(p, -.2, {n: 3, blanc: true});
    self._majRunes(200);
  }, T * .3);
  return this._seq(k, T).fini.then(function(){ return self._finAction(j, 250); });
};
/* l'acide : la rouille de la plaque fond et grésille, les rivets sautent, la charnière du haut casse, la plaque pend */
R._s_plaque_tombe = function(o){
  o = o || {};
  var self = this, e = this.etat;
  if(!this._plaqueFermee()) return this._t_acide(o);
  var j = this._debutAction(), T = 3900, pl = this.J.plaque[0].firstElementChild, c = this._pt('plaqueC'), fin = false;
  this._bulles(c, 6, {etendue: 2.5, taille: 1.3});
  for(var i = 0; i < 4; i++) this._bouffee([c[0] + hasard(-30, 30), c[1] - 10], {r: 6, grad: this.D.doux('#b8f040', .95), op: .85, dx: hasard(-30, 30), dy: hasard(-20, 20), duree: 400, delai: i * 30, s1: 1.4});
  this._fondu('acide', .9, 700);
  (function gresille(){
    if(fin || self.mort) return;
    var p = self._ou(pl, HX - 6 + hasard(-34, 34), HY + hasard(-40, 40));
    self._bulles(p, 2, {etendue: 1});
    if(Math.random() < .5) self._bouffee(p, {r: 6, grad: self.D.doux('#c8e0a0', .9), op: .6, dx: hasard(-6, 14), dy: -40, duree: 900, s1: 2.2});
    self.fx.gresille = setTimeout(gresille, 170);
  })();
  var k = [{t: 0, p: {}}];
  for(var t = 1; t <= 7; t++) k.push({t: t * .06, p: {secousse: {a: t % 2 ? 1.4 : -1.4, x: t % 2 ? 2 : -2}, tete: {a: t % 2 ? 5 : -4}, machoire: {a: -10}, buste: {a: t % 2 ? 1.5 : -1}}, e: 'ease-in-out'});
  k.push({t: .5, p: {secousse: {a: 0, x: 0}, tete: {a: -6, y: 2}, buste: {a: 0}, machoire: {a: -4}}});
  k.push({t: .58, p: {plaque: plaquePend(24), tete: {a: -12, y: 3}}, e: 'ease-in'});
  k.push({t: .66, p: {plaque: plaquePend(150)}, e: 'cubic-bezier(.45,0,.7,1)'});
  k.push({t: .74, p: {plaque: plaquePend(104)}, e: 'ease-in-out'});
  k.push({t: .82, p: {plaque: plaquePend(136)}, e: 'ease-in-out'});
  k.push({t: .89, p: {plaque: plaquePend(114)}, e: 'ease-in-out'});
  k.push({t: .95, p: {plaque: plaquePend(126), tete: {a: -12, y: 3}}, e: 'ease-in-out'});
  k.push({t: 1, p: {plaque: PLAQUE_PEND, tete: {a: 0, y: 0}, machoire: {a: 0}}});
  /* les rivets sautent un à un */
  [.4, .45, .5].forEach(function(t, n){ self._minuteur(function(){ var p = self._ou(pl, HX + 30 - n * 22, HY - 50 + n * 4); self._etincelles(p, 3, {v: 30}); self._boulon(p, -1, false); }, T * t); });
  this._minuteur(function(){
    var p = self._pt('charnH');
    self._eclat(p, 16, '#ffffff', {duree: 300}); self._etincelles(p, 6, {v: 50});
    e['plaque-ouverte'] = true; e['plaque-entrouverte'] = false;
    self._majRunes(200);
  }, T * .56);
  this._minuteur(function(){
    var p = self._pt('charnB');
    self._etincelles(p, 7, {v: 40}); self._ting(self._pt('plaqueC'), false);
    if(o.onTinte) try{ o.onTinte('plaque'); }catch(er){}
    var cc = self._pt('coeurC'); self._flash(cc, 130, self.G.cyan); self._rayons(cc, 70, '#dffcff');
  }, T * .66);
  return this._seq(k, T).fini.then(function(){
    fin = true;
    self._fondu('acide', .4, 900);
    return self._finAction(j, 250);
  });
};
/* un boulon qui saute et retombe (s'il reste, il rejoint les débris au sol) */
R._boulon = function(p, sens, reste){
  var g = this._el(reste ? this.S.fixe : this.S.monde, P('M-4 -2.4 L 0 -4.6 L 4 -2.4 L 4 2.4 L 0 4.6 L -4 2.4 Z', this.D.g('#7a6a6a'), ' stroke-width="1.6"') + C(0, 0, 1.4, '#2a1a1a'));
  var x = p[0] + sens * hasard(30, 80), self = this;
  var a = this._voler(g, p, [x, SOL - 3], {haut: hasard(30, 60), rot: hasard(-500, 500), duree: hasard(700, 900), rebond: 5});
  a.finished.then(function(){ if(reste){ try{ a.commitStyles(); a.cancel(); }catch(e){} self.S.fixeArr.appendChild(g); self.debris.push(g); } else g.remove(); }, function(){ g.remove(); });
  return g;
};
/* le givre : la plaque gèle, se fend en trois fois… et éclate ; les éclats retombent au sol */
R._s_plaque_eclate = function(o){
  o = o || {};
  var self = this, e = this.etat;
  if(e['sans-plaque']) return this.etatPublic('gele', true);
  var j = this._debutAction(), T = 3300, pl = this.J.plaque[0].firstElementChild, c = this._pt('plaqueC');
  this._cristaux(c, 8, {v: 60});
  for(var i = 0; i < 3; i++) this._bouffee([c[0] + hasard(-40, 40), c[1] + hasard(-30, 30)], {r: 10, op: .85, dx: hasard(-20, 20), dy: -20, duree: 700, delai: i * 40, s1: 2});
  this._fondu('gelP', .95, 800);
  var k = [{t: 0, p: {}}, {t: .12, p: {secousse: {x: 6}, tete: {a: 8}, machoire: {a: -10}, buste: {a: 3}}, e: 'cubic-bezier(.1,.9,.3,1)'}];
  for(var q = 0; q < 10; q++) k.push({t: .2 + q * .055, p: {secousse: {x: q % 2 ? 1.6 : -1.6}}, e: 'linear'});
  k.push({t: .76, p: {secousse: {x: 0}, tete: {a: -10, y: 2}, buste: {a: 0}}});
  k.push({t: .82, p: {secousse: {x: 10}, buste: {a: 7}, tete: {a: 10, y: -2}, machoire: {a: -16}, saut: {y: -6, sy: 1.04}}, e: 'cubic-bezier(.1,.9,.3,1)'});
  k.push({t: 1, p: this._toutesPieces({secousse: 1, buste: 1, tete: 1, machoire: 1, saut: 1})});
  [.3, .48, .64].forEach(function(t, n){
    self._minuteur(function(){
      self._fondu('fel' + n, 1, 80);
      var p = self._ou(pl, HX + hasard(-30, 30), HY + hasard(-40, 40));
      self._cristaux(p, 4, {v: 30, taille: .7});
      self._seq([{t: 0, p: {secousse: {x: 0}}}, {t: .3, p: {secousse: {x: 3}}}, {t: 1, p: {secousse: {x: 0}}}], 160, {ajout: true});
    }, T * t);
  });
  this._minuteur(function(){
    /* CRAC : la plaque éclate */
    var c0 = self._pt('plaqueC');
    self._eclat(c0, 56, '#e8f8ff', {anneau: '#b8e6ff', duree: 600});
    self._cristaux(c0, 8, {v: 110, taille: 1.3});
    self._flash(c0, 150, self.G.cyan);
    e['sans-plaque'] = true; e['plaque-ouverte'] = false; e['plaque-entrouverte'] = false;
    self.J.plaque.forEach(function(el){ el.style.opacity = 0; });
    self._majRunes(150);
    var bronze = self.D.g(BRONZE), gl = self.D.lin([[0, '#f6fdff', .9], [1, '#74b4e4', .8]], 1, 0, 0, 1);
    self.fx.debrisPlaque = self.fx.debrisPlaque || [];
    for(var n = 0; n < 7; n++){
      var a = n / 7 * Math.PI * 2 + hasard(-.3, .3), s = hasard(12, 20), src = [c0[0] + Math.cos(a) * 26, c0[1] + Math.sin(a) * 30];
      var forme = 'M' + f1(-s) + ' ' + f1(-s * .4) + ' L ' + f1(s * .3) + ' ' + f1(-s * .8) + ' L ' + f1(s) + ' ' + f1(s * .2) + ' L ' + f1(-s * .2) + ' ' + f1(s * .7) + ' Z';
      var g = self._el(self.S.fixe, P(forme, bronze, ' stroke-width="2"') + F(forme, gl, fo(.6)) + L('M' + f1(-s * .6) + ' ' + f1(-s * .3) + ' L ' + f1(s * .2) + ' ' + f1(-s * .55), '#ffffff', 1.4, so(.85)));
      var reste = n % 2 === 0, x = src[0] + Math.cos(a) * hasard(50, 120) - 20;
      var an = self._voler(g, src, [x, SOL - 4], {haut: hasard(40, 100), rot: hasard(-540, 540), duree: hasard(800, 1100), rebond: 6, onSol: n === 0 ? function(){ if(o.onTinte) try{ o.onTinte('eclat'); }catch(er){} } : null});
      (function(g, an, reste){ an.finished.then(function(){ try{ an.commitStyles(); an.cancel(); }catch(er){} if(reste){ self.S.fixeArr.appendChild(g); self.fx.debrisPlaque.push(g); self.debris.push(g); } else g.animate([{opacity: 1}, {opacity: 0}], {duration: 700, fill: 'forwards'}).finished.then(oter(g), oter(g)); }, function(){}); })(g, an, reste);
    }
    var cc = self._pt('coeurC'); self._rayons(cc, 70, '#dffcff');
  }, T * .8);
  return this._seq(k, T).fini.then(function(){ return self._finAction(j, 300); });
};

/* ---------------- la toux : il tousse de la vapeur, trois fois, lentement ---------------- */
R.tousser = function(){
  var self = this, j = this._debutAction(), b = this._base(), T = 2800;
  var bt = fusion(Z, b.tete), bb = fusion(Z, b.buste), bm = fusion(Z, b.machoire);
  var k = [{t: 0, p: {}}], quintes = [[.05, 1], [.37, 1.12], [.67, 1.3]];
  quintes.forEach(function(q){
    var t = q[0], f = q[1];
    k.push({t: t + .07, p: {tete: {a: bt.a + 6 * f, y: bt.y - 1}, buste: {a: bb.a + 2.5 * f, y: bb.y - 2}, machoire: {a: bm.a}, saut: {sy: 1.01}}, e: 'ease-out'});
    k.push({t: t + .12, p: {tete: {a: bt.a - 13 * f, y: bt.y + 3}, buste: {a: bb.a - 6 * f, y: bb.y + 2}, machoire: {a: bm.a - 20 * f}, secousse: {x: -5 * f, y: 2}, saut: {sy: .97, sx: 1.02}, chaineF: {a: 30}}, e: 'cubic-bezier(.1,.9,.3,1)'});
    k.push({t: t + .23, p: {tete: {a: bt.a - 3, y: bt.y}, buste: {a: bb.a - 1, y: bb.y}, machoire: {a: bm.a - 5}, secousse: {x: 0, y: 0}, saut: {sy: 1, sx: 1}, chaineF: {a: 0}}, e: 'ease-in-out'});
  });
  k.push({t: 1, p: {tete: bt, buste: bb, machoire: bm, secousse: fusion(Z), saut: fusion(Z, b.saut), chaineF: fusion(Z)}, e: 'ease-in-out'});
  quintes.forEach(function(q, i){
    self._minuteur(function(){
      var p = self._pt('bouche'), rouge = self.etat.enrage;
      for(var n = 0; n < 5; n++) self._bouffee([p[0] - 6, p[1] + hasard(-4, 6)], {r: hasard(7, 11) * q[1], grad: rouge ? self.G.vapeurR : self.G.vapeur, op: .9, dx: hasard(-90, -50), dy: hasard(-26, 14), duree: hasard(800, 1150), delai: n * 35, s0: .4, s1: 2.4});
      self._jet(self._pt(i % 2 ? 'chem2' : 'chem1'), -1.5, {n: 1, force: 1.3});
      self._seq([{t: 0, p: {capot1: {y: 0}, capot2: {y: 0}}}, {t: .3, p: {capot1: {y: -6}, capot2: {y: -5}}, e: 'cubic-bezier(.1,.9,.3,1)'}, {t: 1, p: {capot1: {y: 0}, capot2: {y: 0}}}], 400, {ajout: true});
      self._rouages(.15); self._minuteur(function(){ self._rouages(self.etat.enrage ? 1.8 : 1); }, 260);
      if(i === 2) self._clignerRunes(400);
    }, T * (q[0] + .12));
  });
  return this._seq(k, T).fini.then(function(){ return self._finAction(j, 220); });
};

/* ---------------- la mort : une machine ne fuit pas, elle s'éteint et s'effondre ---------------- */
R._nettoyer = function(){
  var self = this, e = this.etat;
  ['vapeur', 'chaleur', 'fumee', 'gresille'].forEach(function(k){ clearTimeout(self.fx[k]); });
  this._etoiles(false); this._couperX('pf'); this._couperX('fl');
  this._fondu('pf', 0, 400); this._fondu(this._varis('feu-'), 0, 400); this._fondu(this._varis('chaud-'), 0, 900); this._fondu('lueurRouge', 0, 600);
  this._fondu(['colle', 'colleFil'].reduce(function(l, n){ return l.concat(self.V[n] || []); }, []), 0, 300);
  this._enleverFlaque('colle'); this._enleverFlaque('huile');
  ['ebloui', 'colle', 'cible', 'brule', 'rougeoie', 'ouvert', 'gele', 'dos'].forEach(function(n){ e[n] = false; });
};
R.mourir = function(o){
  o = o || {};
  var self = this, j = this._debutAction(), T = 7200;
  if(this.mort) return Promise.resolve();
  var etaitGele = this.etat.gele, dos = this.etat.dos;
  this._nettoyer();
  if(etaitGele) this._fondu(this._varis('gel-'), 0, 1500);
  this.etat.enrage = false;
  this._majRunes(400);
  function t(ms){ return ms / T; }
  /* 1. le coup : il vacille */
  this._flash(this._pt('centre'), 140);
  this._etincelles(this._pt('coeurC'), 8, {v: 60, coul: ['#ffffff', CYAN]});
  /* 2. il ralentit ; les runes s'éteignent une à une (à l'envers du réveil), chacune avec un petit « pff » */
  var inv = REVEIL.slice().reverse();
  inv.forEach(function(n, k2){
    self._minuteur(function(){
      self.eteintes[n] = 1; self._majRunes(220);
      var el = ETINCELANTES[n] && (self.V['r-' + n] || [])[0];
      if(el){ var bb = el.getBBox(), p = self._ou(el, bb.x + bb.width / 2, bb.y + bb.height / 2); self._bouffee(p, {r: 4, grad: self.G.fumee, op: .6, dy: -18, duree: 600}); }
    }, 900 + k2 * 80);
  });
  [[700, .6], [1400, .35], [2100, .15], [2800, .05], [3300, 0]].forEach(function(v){ self._minuteur(function(){ self._rouages(v[1]); }, v[0]); });
  this._minuteur(function(){ self._clignerYeux(); }, 2400);
  this._minuteur(function(){ self.eteintes.yeux = 1; self._majRunes(500); }, 3000);
  [1100, 1900, 2700].forEach(function(ms, i){ self._minuteur(function(){ self._bouffee(self._pt('chem1'), {r: 5 - i, op: .5 - i * .1, dy: -30, duree: 1000}); }, ms); });
  this._couperX('pistons');
  /* 3. il s'agenouille ; 4. il s'effondre, face contre terre, dans un nuage de rouille */
  var k = [{t: 0, p: {}},
    {t: t(300), p: {secousse: {x: 8, a: 1.5}, buste: {a: 6}, tete: {a: 10}, machoire: {a: -12}}, e: 'cubic-bezier(.1,.9,.3,1)'},
    {t: t(900), p: {secousse: {x: 0, a: 0}, buste: {a: 1}, tete: {a: -2}, machoire: {a: -4}}, e: 'ease-in-out'},
    {t: t(2900), p: fus({buste: {a: -5, y: 2}, tete: {a: -16, y: 4}, machoire: {a: -8}, saut: {y: 6}, epaule: {a: 3, y: 3}, chaineF: {a: 6}}, membre('F', [98, 296], 10), membre('P', [444, 326], 6), jambe('F', 0, -6), jambe('P', 0, -6)), e: 'cubic-bezier(.4,0,.6,1)'},
    {t: t(3350), p: fus({buste: {a: -12, y: 4}, tete: {a: -24, y: 6}, saut: {y: 36, sy: .97}, epaule: {a: 5, y: 4}, chaineF: {a: 20}}, membre('F', [110, 248], 16), membre('P', [446, 300], 10), jambe('F', -4, -36, 4), jambe('P', 4, -36, 4)), e: 'cubic-bezier(.6,0,.9,.5)'},
    {t: t(3550), p: {saut: {y: 34, sy: 1}, buste: {a: -11}}, e: 'cubic-bezier(.3,.6,.4,1.4)'},
    {t: t(4500), p: {buste: {a: -15, y: 5}, tete: {a: -26}}, e: 'ease-in-out'},
    {t: t(5200), p: fus({buste: {a: -84, y: 16}, saut: {y: 78, sy: 1}, chaineF: {a: 60}}, membre('F', [230, 290], 30), membre('P', [470, 240], 40), jambe('F', -20, -78, 30), jambe('P', 20, -78, -20)), e: 'cubic-bezier(.55,0,1,.6)'},
    {t: t(5450), p: {buste: {a: -78, y: 12}, saut: {y: 74}}, e: 'cubic-bezier(.2,.7,.4,1)'},
    {t: t(5700), p: {buste: {a: -82, y: 15}, saut: {y: 77}}, e: 'ease-in-out'},
    {t: 1, p: {buste: {a: -82, y: 15}}}];
  if(dos) k.splice(1, 0, {t: t(200), p: fus(jambe('F', 0, 0), jambe('P', 0, 0), {saut: {y: 0}, buste: {a: 0}})});
  this._minuteur(function(){
    var a = self._pt('jGenouF'), b2 = self._pt('jGenou');
    self._poussiere([a[0] - 20, SOL], 3, -1); self._poussiere([b2[0] + 10, SOL], 3, 1);
    if(o.onTinte) try{ o.onTinte('genoux'); }catch(er){}
  }, 3350);
  /* le nuage de rouille, et les pièces qui se détachent et restent au sol */
  this._minuteur(function(){
    var c = self._pt('centre');
    for(var n = 0; n < 9; n++) self._bouffee([c[0] + hasard(-110, 110), c[1] + hasard(-40, 90)], {r: hasard(16, 26), grad: n % 2 ? self.G.rouille : self.G.rouille2, op: .7, dx: hasard(-50, 50), dy: hasard(-60, -20), duree: hasard(1600, 2200), delai: n * 70, s0: .5, s1: 2.6});
    for(var m = 0; m < 4; m++) self._miette([c[0] + hasard(-90, 90), c[1] + hasard(-60, 20)]);
  }, 4600);
  this._minuteur(function(){
    var morceaux = [['tete', 'tete', -150, 30, -280, 22], ['epaule', 'epauleHaut', 110, 40, 200, 30], ['poing', 'poingC', 70, 20, 90, 14]];
    if(!self.etat['sans-plaque']) morceaux.push(['plaque', 'plaqueC', -60, 50, 160, 34]);
    morceaux.forEach(function(m, i){
      var d = self._detacher([m[0]], self.S.fixe, m[1]), x = d.c[0] + m[2];
      var a = self._voler(d.g, d.c, [x, SOL - m[5]], {haut: m[3], rot: m[4], duree: 900 + i * 120, rebond: 8, delai: i * 140, glisse: m[2] > 0 ? 10 : -14,
        onSol: function(){ self._etincelles([x, SOL - 4], 5, {v: 34, grav: 10}); self._poussiere([x, SOL], 2, m[2] > 0 ? 1 : -1); if(o.onTinte) try{ o.onTinte(m[0]); }catch(er){} }});
      a.finished.then(function(){ try{ a.commitStyles(); a.cancel(); }catch(er){} self.S.fixeArr.appendChild(d.g); }, function(){});
    });
    for(var b = 0; b < 3; b++) self._boulon(self._pt('centre'), b % 2 ? 1 : -1, true);
  }, 4750);
  this._minuteur(function(){ self._poussiere([200, SOL], 4, -1); self._poussiere([320, SOL], 3, 1); }, 5200);
  /* les fumées de la carcasse */
  (function fumet(n){ if(n <= 0) return; self._bouffee([hasard(160, 300), SOL - 30], {r: 8, grad: self.G.fumee, op: .45, dx: hasard(-6, 14), dy: -60, duree: 1700, s1: 2.4}); self._minuteur(function(){ fumet(n - 1); }, 450); })(10);
  var s = this._seq(k, T);
  return s.fini.then(function(){ return attendreMs(400); }).then(function(){
    self._couperBoucles();
    self._couperX('');
    self.mort = true;
    self.enAction = false;
  });
};
R.fuir = function(o){ return this.mourir(o); };

/* ---------------- la mort par critique : il s'emballe et EXPLOSE ---------------- */
R._boum = function(scene, o){
  scene = scene || this.c.parentNode || this.c;
  if(getComputedStyle(scene).position === 'static') scene.style.position = 'relative';
  var sr = scene.getBoundingClientRect(), W = scene.offsetWidth || sr.width, H = scene.offsetHeight || sr.height, ech = W / (sr.width || 1);
  var pe = this._versEcran(o.p), cx = (pe.x - sr.left) * ech, cy = (pe.y - sr.top) * ech;
  var u = this._echelle() * ech * (o.u || 1) * 2.4;
  var ov = document.createElementNS(NS, 'svg');
  ov.setAttribute('class', PX + '-scene-fx'); ov.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
  var fl = PX + 'Boom' + (++NUM), bru = ['#0c0812', '#160f20', '#1e1628'], cla = ['#4a3e5a', '#6a5a80'];
  ov.innerHTML = '<defs><radialGradient id="' + fl + 'c"><stop offset="0" stop-color="#ffe8a0"/><stop offset=".35" stop-color="#ff8a30" stop-opacity=".9"/><stop offset=".7" stop-color="#a02a40" stop-opacity=".5"/><stop offset="1" stop-color="#3a1030" stop-opacity="0"/></radialGradient>' +
    bru.map(function(c, i){ return '<radialGradient id="' + fl + 'b' + i + '"><stop offset="0" stop-color="' + c + '" stop-opacity=".97"/><stop offset=".6" stop-color="' + c + '" stop-opacity=".88"/><stop offset="1" stop-color="' + c + '" stop-opacity="0"/></radialGradient>'; }).join('') +
    cla.map(function(c, i){ return '<radialGradient id="' + fl + 'l' + i + '"><stop offset="0" stop-color="' + c + '" stop-opacity=".75"/><stop offset="1" stop-color="' + c + '" stop-opacity="0"/></radialGradient>'; }).join('') + '</defs>';
  scene.appendChild(ov);
  function el(html){ var g = document.createElementNS(NS, 'g'); g.innerHTML = html; ov.appendChild(g); return g; }
  function T(x, y, s, r){ return 'translate(' + f1(x) + 'px,' + f1(y) + 'px) rotate(' + f1(r || 0) + 'deg) scale(' + (s == null ? 1 : s) + ')'; }
  var anims = [];
  /* le cœur brûlant (orange, pas blanc), puis l'onde de choc */
  var c1 = el('<circle r="' + f1(50 * u) + '" fill="url(#' + fl + 'c)"/>');
  c1.animate([{transform: T(cx, cy, .15), opacity: 1}, {offset: .35, transform: T(cx, cy, 1), opacity: 1}, {transform: T(cx, cy, 1.4), opacity: 0}], {duration: 460, easing: 'ease-out', fill: 'forwards'}).finished.then(oter(c1), oter(c1));
  var c2 = el('<circle r="' + f1(40 * u) + '" fill="none" stroke="#2a1c3c" stroke-width="' + f1(10 * u) + '" stroke-opacity=".85"/><circle r="' + f1(40 * u) + '" fill="none" stroke="#d8c8f0" stroke-width="' + f1(2.4 * u) + '"/>');
  c2.animate([{transform: T(cx, cy, .2), opacity: 1}, {transform: T(cx, cy, 3.4), opacity: 0}], {duration: 700, easing: 'cubic-bezier(.1,.8,.3,1)', fill: 'forwards'}).finished.then(oter(c2), oter(c2));
  /* le nuage de brume noire : de grosses volutes qui jaillissent, restent, puis se dissipent en montant */
  var nb = o.brume || 8;
  for(var n = 0; n < nb; n++){
    var a = (n / nb) * Math.PI * 2 + hasard(-.3, .3), d = n % 3 === 0 ? .25 : hasard(.5, 1), r = hasard(30, 48) * u, x = Math.cos(a) * d * 70 * u, y = Math.sin(a) * d * 34 * u - 8 * u;
    var g = el('<circle r="' + f1(r) + '" fill="url(#' + fl + 'b' + (n % 3) + ')"/><circle cx="' + f1(-r * .25) + '" cy="' + f1(-r * .3) + '" r="' + f1(r * .7) + '" fill="url(#' + fl + 'l' + (n % 2) + ')"/>');
    var dx = x * 1.7 + hasard(-14, 14) * u, dy = y * 1.4 - hasard(10, 40) * u;
    anims.push(g.animate([{transform: T(cx, cy, .1), opacity: 0}, {offset: .05, opacity: 1, transform: T(cx + x, cy + y, .9)},
      {offset: .5, opacity: .95, transform: T(cx + dx, cy + dy, 1.4)}, {transform: T(cx + dx * 1.3 + hasard(-20, 20) * u, cy + dy * 1.2 - 40 * u, 2), opacity: 0}],
      {duration: hasard(2600, 3300), easing: 'cubic-bezier(.12,.75,.3,1)', fill: 'forwards'}));
  }
  for(var s = 0; s < 5; s++){
    var as = Math.random() * Math.PI * 2, vs = hasard(70, 150) * u, ls = hasard(7, 14) * u;
    var e = el(L('M0 0 L ' + f1(-Math.cos(as) * ls) + ' ' + f1(-Math.sin(as) * ls), choisir(['#fff4b0', '#ffd060', '#ffb040']), 2.6 * u));
    e.animate([{transform: T(cx, cy), opacity: 1}, {transform: T(cx + Math.cos(as) * vs, cy + Math.sin(as) * vs + 34 * u), opacity: 0}], {duration: hasard(450, 850), easing: 'cubic-bezier(.1,.7,.4,1)', fill: 'forwards'}).finished.then(oter(e), oter(e));
  }
  return {ov: ov, fini: Promise.all(anims.map(fini)).then(function(){ ov.remove(); })};
};
R.exploser = function(scene){
  var self = this, j = this._debutAction(), boomOk, boomP = new Promise(function(r){ boomOk = r; });
  if(this.mort){ boomOk(); var p0 = Promise.resolve(); p0.boom = boomP; return p0; }
  this._nettoyer();
  /* 1. il s'emballe : les rouages deviennent fous, tout s'allume, il tremble de plus en plus, la vapeur fuse de partout */
  this._rouages(7);
  this._fondu('yeuxFort', 1, 200);
  this._fondu('pf', 1, 400);
  this._clignerRunes(900);
  var k = [{t: 0, p: {}}];
  for(var i = 1; i <= 10; i++) k.push({t: i / 11, p: {secousse: {x: i % 2 ? 2 + i * .7 : -2 - i * .7, a: i % 2 ? 1 + i * .15 : -1 - i * .15}, saut: {sx: 1 + i * .006, sy: 1 + i * .009, y: -i * .5}, buste: {a: i % 2 ? 1.5 : -1.5}, tete: {a: i % 2 ? 4 : -4}, machoire: {a: -i * 1.6}, capot1: {y: i % 2 ? -5 : 0}, capot2: {y: i % 2 ? 0 : -5}, plaque: {sx: i % 2 ? .9 : 1}}, e: 'linear'});
  k.push({t: 1, p: {saut: {sx: 1.08, sy: 1.12, y: -8}}, e: 'ease-in'});
  JOINTS.forEach(function(jt, n){ self._minuteur(function(){ self._jet(self._pt(jt[0]), jt[1], {n: 1, force: 1.4, blanc: true}); }, 80 + n * 85); });
  /* les copies des pièces qui vont voler sont préparées pendant qu'il s'emballe (une à la fois) : le BOUM reste fluide */
  var morceaux = [['tete', 'tete', -190, 150, -720, 22], ['epaule', 'epauleHaut', 170, 130, 540, 30], ['poing', 'poingC', 120, 110, 720, 14], ['poingF', 'poingFC', -150, 90, -540, 14]];
  if(!this.etat['sans-plaque']) morceaux.push(['plaque', 'plaqueC', -90, 170, 900, 34]);
  var prets = [];
  morceaux.forEach(function(m, n){ self._minuteur(function(){ prets[n] = self._detacher([m[0]], self.S.fixe, m[1], true); }, 120 + n * 140); });
  return this._seq(k, 900).fini.then(function(){
    /* 2. BOUM */
    var c0 = self._pt('centre');
    var boum = self._boum(scene, {p: c0, u: 1.3});
    boomOk();
    /* le haut du corps disparaît dans l'explosion ; il reste les jambes, le bassin, la ceinture et le torse arraché */
    self.J.buste.forEach(function(e){ e.style.opacity = 0; });
    self._fondu('moignon', 1, 0);
    /* les grosses pièces sont projetées, rebondissent et restent au sol */
    morceaux.forEach(function(m, n){
      var d = prets[n] || self._detacher([m[0]], self.S.fixe, m[1], true);
      d.montrer();
      var x = Math.max(-40, Math.min(560, d.c[0] + m[2]));
      var a = self._voler(d.g, d.c, [x, SOL - m[5]], {haut: m[3], rot: m[4], duree: hasard(1100, 1400), rebond: 14, glisse: m[2] > 0 ? 16 : -16, bascule: 10,
        onSol: function(){ self._etincelles([x, SOL - 4], 4, {v: 34, grav: 10}); }});
      a.finished.then(function(){ try{ a.commitStyles(); a.cancel(); }catch(e){} self.S.fixeArr.appendChild(d.g); }, function(){});
    });
    /* des engrenages et des boulons projetés, qui rebondissent et restent */
    for(var g = 0; g < 4; g++){
      var r = hasard(7, 12), eng = self._el(self.S.fixe, P(rouageD(r, 8, 0), self.D.g(FER)) + '<circle r="' + f1(r * .45) + '" fill="#2a1a2a" stroke="' + O + '" stroke-width="1.6"/>');
      var xg = c0[0] + (g % 2 ? 1 : -1) * hasard(60, 200), ag = self._voler(eng, c0, [xg, SOL - r * .6], {haut: hasard(90, 170), rot: hasard(-900, 900), duree: hasard(1000, 1400), rebond: 12, glisse: (g % 2 ? 1 : -1) * 14});
      (function(eng, ag){ ag.finished.then(function(){ try{ ag.commitStyles(); ag.cancel(); }catch(e){} self.S.fixeArr.appendChild(eng); self.debris.push(eng); }, function(){}); })(eng, ag);
    }
    for(var bo = 0; bo < 2; bo++) self._boulon(c0, bo % 2 ? 1 : -1, true);
    self._couperBoucles();
    self._couperX('');
    self.mort = true;
    /* la carcasse s'affaisse sur ses jambes, ses braises rougeoient, elle fume longtemps */
    self._seq([{t: 0, p: {}}, {t: .35, p: fus({saut: {sx: 1, sy: .96, y: 14, a: 0, x: 0}, secousse: {x: 0, y: 0, a: 0}, capot1: {y: 0}, capot2: {y: 0}}, jambe('F', 0, -14), jambe('P', 0, -14)), e: 'cubic-bezier(.6,0,.9,.5)'},
      {t: .65, p: {saut: {sy: 1.01, y: 8, a: -1.5}}, e: 'cubic-bezier(.2,.7,.4,1)'}, {t: 1, p: fus({saut: {sy: 1, y: 10, a: -1}}, jambe('F', 0, -10), jambe('P', 0, -10))}], 900);
    self._boucleX('braisesRestes', [{opacity: 1}, {opacity: .35}, {opacity: .9}, {opacity: .45}, {opacity: 1}], 1600);
    (function fumet(n){
      if(n <= 0) return;
      var p = self._ouB(2, 272 + hasard(-80, 80), 200);
      self._bouffee(p, {r: 9, grad: self.G.fumee, op: .55, dx: hasard(-6, 14), dy: -70, duree: 1800, s1: 2.6});
      if(n % 3 === 0) self._etincelles([p[0], p[1] + 10], 3, {v: 26, grav: 30, ep: 1.6});
      setTimeout(function(){ fumet(n - 1); }, 380);
    })(16);
    return boum.fini;
  }).then(function(){ self.enAction = false; });
};

/* =====================================================================
   E. L'enregistrement
   ===================================================================== */
var INFO = {
  id: 'gardien', nom: 'Le Gardien de rouille', rang: 'elite', pv: 280, attaque: 'poing 30 sur le héros de devant',
  cadre: {w: 320, h: 260}, sol: r3((SOL - VB[1]) / VB[3]), vole: false, places: 2,
  attaques: ['poing'],
  specials: ['plaque-tombe', 'plaque-eclate', 'entrouvert'],
  etats: ['enrage', 'brule', 'colle', 'ebloui', 'gele', 'ouvert', 'dos', 'cible', 'plaque-ouverte', 'plaque-entrouverte', 'sans-plaque', 'rougeoie']
};
function acteur(b){
  return {
    info: INFO,
    entrer: function(o){ return b.entrer(o); },
    attendre: function(){ return b.attendre(); },
    attaquer: function(nom, o){ return b.attaquer(nom, o); },
    touche: function(type, o){ return b.touche(type, o); },
    special: function(nom, o){ return b.special(nom, o); },
    tousser: function(){ return b.tousser(); },
    fuir: function(o){ return b.fuir(o); },
    mourir: function(o){ return b.mourir(o); },
    exploser: function(scene){ return b.exploser(scene); },
    etat: function(nom, on){ return b.etatPublic(nom, on); },
    etatCourant: function(){ return b.etatCourant(); },
    cible: function(on){ return b.etatPublic('cible', on); },
    ancre: function(nom){ return b.ancre(nom); },
    arreter: function(){ b.arreter(); return this; },
    _bete: b
  };
}
global.BETES = global.BETES || {};
global.BETES[ID] = {info: INFO, creer: function(conteneur, options){ return acteur(new Gardien(conteneur, options)); }};
})(typeof window !== 'undefined' ? window : this);
