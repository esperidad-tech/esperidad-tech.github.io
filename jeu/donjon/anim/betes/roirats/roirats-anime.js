/* roirats-anime.js — Le Roi des rats, l'élite animé de l'ossuaire (Les Enquêteurs de Brumeval, donjon du puits)
   Module autonome, sans dépendance. Il injecte son propre CSS (préfixe .bt-roirats-). Il ne joue aucun son.
   Contrat commun : jeu/donjon/anim/betes/CONTRAT.md. Dessin validé : bestiaire/betes/07-roirats.js (dix rats aux queues
   nouées en un seul nœud, le plus gros couronné de bric et de broc : cuillère tordue, capsule, os, clou, verre, chaîne).

     var r = BETES.roirats.creer(conteneur);   // le SVG remplit le conteneur (330 × 236), la masse regarde à gauche

   Actions (Promise, résolue quand la masse est revenue à son attente) :
     entrer()                    la masse arrive de la droite en roulant et en grouillant, freine ; le roi se dresse et lève sa couronne
     attaquer('grouillement', o) la masse se ramasse, puis déferle sur les trois héros, l'un après l'autre (le plus proche d'abord) :
                                 o.vers = [{x, y}, {x, y}, {x, y}] (écran), o.onImpact(i) quand elle retombe sur le héros i.
                                 Elle revient ensuite à sa place, encore ÉTALÉE (état « etale ») : c'est le moment du bruit
                                 « sans potion ». La Promise a .impact (le premier coup).
     touche(type, o)             nuage   → tousser(), puis ils tirent chacun de leur côté : état « noeud » (1re étape du combo)
                                 bruit   → nœud tendu : special('tirent') → état « ouvert » (2e étape du combo) ;
                                           masse étalée (juste après leur attaque) : special('panique') → « ouvert » ;
                                           sinon (avant le nuage) : PIÈGE, special('charge', o) (ils foncent sur o.vers, l'Alchimiste)
                                 colle   → nœud tendu : special('roi-colle') → « ouvert » ; sinon état « colle » (pris en tas)
                                 lumiere → PIÈGE : état « boule » (le moteur l'enlève après 2 tours : etat('boule', false))
                                 rebond  → immunisé : la flèche se plante dans la masse, un rat l'arrache et la recrache, ils ricanent
                                 fleche, fleche-argent, fleche-lourde, dague, coup : le coup (sur le nœud s'il est ouvert)
                                 feu (des rats prennent feu et se roulent : état « brule »), huile (la masse glisse et s'emmêle),
                                 givre (état « gele »), acide (le poil grésille), louche (BONG sur la couronne), bouclier, brulure.
                                 En boule, tout rebondit sur la boule.
     special(nom, o)             'noeud' (= état noeud), 'tirent', 'roi-colle', 'panique' (→ ouvert),
                                 'charge' (o.vers : un point écran, o.onImpact ; la Promise a .impact), 'boule' (= état boule)
     tousser()                   trois quintes de toux, lentes, dans toute la masse
     fuir() / mourir()           le nœud se défait d'un coup, les dix rats s'éparpillent en couinant dans toutes les directions ;
                                 le roi part le dernier et perd sa couronne, qui reste au sol
     exploser(scene)             il enfle, puis éclate : brume noire, os et queues nouées projetés, la couronne tournoie et retombe ;
                                 restent des cendres, des os et la couronne. La Promise a .boom (le moment où ça éclate).
   États (etat(nom, on) renvoie une Promise ; ils se cumulent) : enrage (tous les yeux virent au rouge, la masse tremble),
     brule, colle, ebloui, gele, ouvert (le roi renversé, le nœud à moitié défait qui brille et palpite), dos (le roi renversé),
     cible, et les siens : noeud (le nœud tendu au centre), boule (rien ne les atteint), etale (la masse étalée après l'attaque).
   attendre(), arreter(), etatCourant(), ancre(nom) : tete (du roi), pointfaible (le nœud), centre, bouche (du roi), pieds, haut.

   Pour la fluidité (CONTRAT.md §4 bis, exigence de Romain du 9 novembre) :
   - aucun filtre, aucun mélange ; les halos, les lueurs et les ombres sont des dégradés ;
   - UN seul dessin de rat (celui de la fiche, simplifié), recopié dix fois avec sa taille, sa couleur, sa posture, et trois niveaux
     de détail (le roi, les rats de devant, ceux du fond) ; chaque rat n'a que quelques pièces : le corps, la tête, la patte avant
     (et la mâchoire pour ceux de devant) ; sa queue est une pièce à part, tournée et étirée pour rester attachée au nœud ;
   - chaque pièce <g data-j="nom"> a un contenu FIXE et n'est animée qu'en transform ; les états sont des variantes pré-dessinées
     <g data-j="v-nom"> (opacité, puis visibility) ; les boucles autonomes animent des pièces <g data-j="x-nom"> ;
   - les petites formes n'ont ni opacity ni transform (fill-opacity / stroke-opacity) ;
   - au repos, une trentaine d'animations à la fois ; au plus 24 particules, retirées à la fin. Mesure : perf.py (×6). */
(function(global){
'use strict';
var ID = 'roirats', PX = 'bt-roirats', NS = 'http://www.w3.org/2000/svg';
var O = '#24182e', LUNE = '#bfe8ff', NUM = 0;

/* =====================================================================
   1. Petits outils de dessin (ceux de la fiche du bestiaire, sans filtre)
   ===================================================================== */
function f1(v){ return (+v).toFixed(1); }
function r3(n){ return Math.round(n * 1000) / 1000; }
function r1(n){ return Math.round(n * 10) / 10; }
function pt(p){ return f1(p[0]) + ' ' + f1(p[1]); }
function lerp(a, b, t){ return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
function hx(c){ c = c.replace('#', ''); return [0, 2, 4].map(function(i){ return parseInt(c.substr(i, 2), 16); }); }
function mix(a, b, t){ var A = hx(a), B = hx(b); return '#' + A.map(function(v, i){ var r = Math.round(v + (B[i] - v) * t); return (r < 16 ? '0' : '') + r.toString(16); }).join(''); }
function clair(c, t){ return mix(c, '#fff6e6', t); }
function sombre(c, t){ return mix(c, '#120a1e', t); }
function rng(s){ return function(){ s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
function Pw(d, f, w, x){ return '<path d="' + d + '" fill="' + f + '" stroke="' + O + '" stroke-width="' + f1(w) + '" stroke-linejoin="round" stroke-linecap="round"' + (x || '') + '/>'; }
function P(d, f, x){ return Pw(d, f, 3, x); }
function L(d, c, w, x){ return '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + f1(w) + '" stroke-linejoin="round" stroke-linecap="round"' + (x || '') + '/>'; }
function F(d, f, x){ return '<path d="' + d + '" fill="' + f + '"' + (x || '') + '/>'; }
function C(x, y, r, f, x2){ return '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="' + f1(r) + '" fill="' + f + '"' + (x2 || '') + '/>'; }
function El(cx, cy, rx, ry, f, x){ return '<ellipse cx="' + f1(cx) + '" cy="' + f1(cy) + '" rx="' + f1(rx) + '" ry="' + f1(ry) + '" fill="' + f + '"' + (x || '') + '/>'; }
function fo(v){ return ' fill-opacity="' + v + '"'; }
function so(v){ return ' stroke-opacity="' + v + '"'; }
/* des cercles réunis dans un seul chemin (moins d'éléments à dessiner) */
function rond(x, y, r){ return 'M' + f1(x - r) + ' ' + f1(y) + ' a ' + f1(r) + ' ' + f1(r) + ' 0 1 0 ' + f1(r * 2) + ' 0 a ' + f1(r) + ' ' + f1(r) + ' 0 1 0 ' + f1(-r * 2) + ' 0 Z '; }
function bez(p, t){ var u = 1 - t; return [0, 1].map(function(i){ return u * u * u * p[0][i] + 3 * u * u * t * p[1][i] + 3 * u * t * t * p[2][i] + t * t * t * p[3][i]; }); }
/* courbe lisse (Catmull-Rom) qui passe par tous les points */
function crs(Pp){
  var s = '', n = Pp.length;
  for(var i = 0; i < n - 1; i++){
    var p0 = Pp[Math.max(i - 1, 0)], p1 = Pp[i], p2 = Pp[i + 1], p3 = Pp[Math.min(i + 2, n - 1)];
    s += ' C ' + pt([p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]) + ' ' + pt([p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]) + ' ' + pt(p2);
  }
  return s;
}
/* un membre organique : un tube qui passe par des points, d'épaisseurs différentes */
function cote(pts, ws){
  var n = pts.length, G = [], D = [];
  for(var i = 0; i < n; i++){
    var a = pts[Math.max(i - 1, 0)], b = pts[Math.min(i + 1, n - 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy) || 1;
    var nx = -dy / l, ny = dx / l, w = ws[i] / 2;
    G.push([pts[i][0] + nx * w, pts[i][1] + ny * w]); D.push([pts[i][0] - nx * w, pts[i][1] - ny * w]);
  }
  return {G: G, D: D};
}
function tube(pts, ws){
  var c = cote(pts, ws), n = pts.length, D = c.D.slice().reverse();
  return 'M' + pt(c.G[0]) + crs(c.G) + ' A ' + f1(ws[n - 1] / 2) + ' ' + f1(ws[n - 1] / 2) + ' 0 0 0 ' + pt(D[0]) + crs(D) + ' A ' + f1(ws[0] / 2) + ' ' + f1(ws[0] / 2) + ' 0 0 0 ' + pt(c.G[0]) + ' Z';
}
function rotP(p, c, a){ var r = a * Math.PI / 180, dx = p[0] - c[0], dy = p[1] - c[1]; return [c[0] + dx * Math.cos(r) - dy * Math.sin(r), c[1] + dx * Math.sin(r) + dy * Math.cos(r)]; }
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
/* un os (pour le sol de l'ossuaire et les restes) */
function osD(l){ return 'M' + (-l) + ' -3 L ' + l + ' -3 C ' + (l + 6) + ' -10 ' + (l + 14) + ' -6 ' + (l + 10) + ' 0 C ' + (l + 14) + ' 6 ' + (l + 6) + ' 10 ' + l + ' 3 L ' + (-l) + ' 3 C ' + (-l - 6) + ' 10 ' + (-l - 14) + ' 6 ' + (-l - 10) + ' 0 C ' + (-l - 14) + ' -6 ' + (-l - 6) + ' -10 ' + (-l) + ' -3 Z'; }

/* Les pièces articulées : un <g data-j> dont le pivot est ramené à (0,0). Contenu FIXE : on n'anime que transform et opacity. */
function piv(nom, x, y, c){ return '<g transform="translate(' + f1(x) + ' ' + f1(y) + ')"><g data-j="' + nom + '"><g transform="translate(' + f1(-x) + ' ' + f1(-y) + ')">' + c + '</g></g></g>'; }
/* une variante pré-dessinée : cachée (opacité 0 et visibility hidden), montrée par _fondu */
function vari(nom, c, op){ return '<g data-j="v-' + nom + '" opacity="' + (op || 0) + '"' + (op ? '' : ' visibility="hidden"') + '>' + c + '</g>'; }
/* une pièce à boucle autonome (x-), avec son pivot */
function xp(nom, x, y, c){ return piv('x-' + nom, x, y, c); }
function slot(nom){ return '<g data-slot="' + nom + '"></g>'; }
/* un petit repère caché, suivi par ancre() (getBoundingClientRect) et par les effets */
function repere(nom, x, y){ return '<circle data-a="' + nom + '" cx="' + f1(x) + '" cy="' + f1(y) + '" r="1.5" fill="#000" fill-opacity="0"/>'; }

/* les dégradés et découpes d'une bête (identifiants uniques par bête) */
function Defs(u){ this.u = u; this.n = 0; this.l = []; this.cache = {}; }
Defs.prototype.id = function(){ return this.u + (++this.n); };
Defs.prototype.stops = function(st){ return st.map(function(t){ return '<stop offset="' + t[0] + '" stop-color="' + t[1] + '" stop-opacity="' + (t[2] == null ? 1 : t[2]) + '"/>'; }).join(''); };
/* lumière en haut à droite ; gf : la même pour un dessin retourné (la lumière reste en haut à droite à l'écran) */
Defs.prototype.g = function(c, fort, flip){
  fort = fort || 1;
  var k = 'g' + c + fort + (flip ? 'f' : '');
  if(this.cache[k]) return this.cache[k];
  var id = this.id();
  this.l.push('<linearGradient id="' + id + '" x1="' + (flip ? 0 : 1) + '" y1="0" x2="' + (flip ? 1 : 0) + '" y2="1"><stop offset="0" stop-color="' + clair(c, .28 * fort) + '"/><stop offset=".45" stop-color="' + c + '"/><stop offset="1" stop-color="' + sombre(c, .45 * fort) + '"/></linearGradient>');
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
Defs.prototype.clip = function(d){ var id = this.id(); this.l.push('<clipPath id="' + id + '"><path d="' + d + '"/></clipPath>'); return ' clip-path="url(#' + id + ')"'; };
/* les opacités des petites formes deviennent fill-opacity / stroke-opacity : pas de calque d'effet par forme */
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
/* mèches de poil, tirées au hasard dans une ellipse (pointées vers l'arrière) : deux chemins seulement */
function poils(cx, cy, rx, ry, n, seed, w, cH, cB){
  if(n <= 0) return '';
  var R = rng(seed), h = '', b = '';
  for(var k = 0; k < n; k++){
    var a = R() * Math.PI * 2, r = Math.sqrt(R()), x = cx + Math.cos(a) * rx * r, y = cy + Math.sin(a) * ry * r;
    var haut = y < cy - ry * .15, l = 8 + R() * 9, m = 'M' + f1(x) + ' ' + f1(y) + ' q ' + f1(l * .5) + ' ' + f1(l * .08) + ' ' + f1(l) + ' ' + f1(l * .42) + ' ';
    if(haut) h += m; else b += m;
  }
  return (h ? L(h, cH, w, so(.4)) : '') + (b ? L(b, cB, w, so(.5)) : '');
}
/* crête de poils hérissés le long d'une courbe */
function crete(pts, t0, t1, n, haut, couleur, w, dos){
  var s = 'M', base = [];
  for(var k = 0; k <= n; k++) base.push(bez(pts, t0 + (t1 - t0) * k / n));
  for(var k2 = 0; k2 < n; k2++){
    var a = base[k2], b = base[k2 + 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy) || 1;
    var nx = dy / l, ny = -dx / l, h = haut * (.65 + ((k2 * 7) % 5) / 10);
    s += (k2 ? ' L ' : '') + pt(a) + ' L ' + pt([b[0] + nx * h + dx * .5, b[1] + ny * h + dy * .5]);
  }
  s += ' L ' + pt(base[n]);
  dos = dos || [1, 14];
  for(var k3 = n; k3 >= 0; k3--){ var q = base[k3]; s += ' L ' + pt([q[0] + dos[0], q[1] + dos[1]]); }
  return Pw(s + ' Z', couleur, w);
}
/* une patte : quatre doigts fins en éventail (un seul chemin), les griffes (un chemin), la paume par-dessus */
function patte(fin, avant, col, w, niv){
  var a = Math.atan2(fin[1] - avant[1], fin[0] - avant[0]), doigts = '', gr = '';
  [-.48, -.16, .16, .48].forEach(function(off, i){
    var b = a + off, l = i === 0 || i === 3 ? 6.5 : 8.5, base = [fin[0] + Math.cos(a) * 2, fin[1] + Math.sin(a) * 2], tip = [base[0] + Math.cos(b) * l, base[1] + Math.sin(b) * l];
    if(niv !== 'fond') doigts += tube([base, tip], [4.4, 3.4]) + ' ';
    gr += 'M' + pt(tip) + ' q ' + f1(Math.cos(b) * 2.6) + ' ' + f1(Math.sin(b) * 2.6 + .8) + ' ' + f1(Math.cos(b) * 3 + .4) + ' ' + f1(Math.sin(b) * 3 + 2.8) + ' ';
  });
  return (doigts ? Pw(doigts, col, w * .8) : '') + L(gr, '#1a1220', w * .5) + '<ellipse cx="' + f1(fin[0]) + '" cy="' + f1(fin[1]) + '" rx="6.4" ry="5" transform="rotate(' + f1(a * 180 / Math.PI) + ' ' + pt(fin) + ')" fill="' + col + '" stroke="' + O + '" stroke-width="' + f1(w * .8) + '"/>';
}
/* ---------- les queues et le nœud : des brins qui s'entrecroisent dessus-dessous (fiche) ---------- */
function echant(segs, pas){
  var Pp = [];
  segs.forEach(function(sg, i){ var n = 30; for(var j = i ? 1 : 0; j <= n; j++) Pp.push(bez(sg, j / n)); });
  var Q = [Pp[0]];
  for(var i = 1; i < Pp.length; i++){ var dx = Pp[i][0] - Q[Q.length - 1][0], dy = Pp[i][1] - Q[Q.length - 1][1]; if(Math.sqrt(dx * dx + dy * dy) >= pas || i === Pp.length - 1) Q.push(Pp[i]); }
  return Q;
}
function croise(a, b, c, e){
  var r = [b[0] - a[0], b[1] - a[1]], q = [e[0] - c[0], e[1] - c[1]], den = r[0] * q[1] - r[1] * q[0];
  if(Math.abs(den) < 1e-9) return null;
  var t = ((c[0] - a[0]) * q[1] - (c[1] - a[1]) * q[0]) / den, u = ((c[0] - a[0]) * r[1] - (c[1] - a[1]) * r[0]) / den;
  return (t >= 0 && t < 1 && u >= 0 && u < 1) ? [t, u] : null;
}
function morceau(Pp, i0, i1){ var o = []; for(var i = Math.max(0, i0); i <= Math.min(Pp.length - 1, i1); i++) o.push(Pp[i]); return o; }
function chemin(Pp){ return 'M' + pt(Pp[0]) + crs(Pp); }
function ligne(Pp){ return 'M' + Pp.map(pt).join(' L '); }
function decale(Pp, dx, dy){ return Pp.map(function(p){ return [p[0] + dx, p[1] + dy]; }); }
/* un brin : son contour, sa couleur, une ombre et un reflet (décalés dans la géométrie, sans transform) */
function dessineBrin(b, Pp, bout){
  var f = bout ? ligne : chemin, d = f(Pp), w = b.w, cap = bout ? 'butt' : 'round';
  var s = '<path d="' + d + '" fill="none" stroke="' + O + '" stroke-width="' + f1(w + 4.4) + '" stroke-linejoin="round" stroke-linecap="' + cap + '"/>' +
    '<path d="' + d + '" fill="none" stroke="' + b.col + '" stroke-width="' + f1(w) + '" stroke-linejoin="round" stroke-linecap="' + cap + '"/>';
  if(!bout) s += '<path d="' + f(decale(Pp, -w * .2, w * .22)) + '" fill="none" stroke="' + sombre(b.col, .4) + '" stroke-width="' + f1(w * .42) + '" stroke-linecap="butt" stroke-opacity=".5"/>';
  s += '<path d="' + f(decale(Pp, w * .15, -w * .2)) + '" fill="none" stroke="' + clair(b.col, .62) + '" stroke-width="' + f1(Math.max(1.1, w * .2)) + '" stroke-linecap="butt" stroke-opacity=".5"/>';
  return s;
}
function tisser(brins, Kc, rayon){
  var X = [];
  brins.forEach(function(b){ b.X = []; });
  for(var A = 0; A < brins.length; A++) for(var Bb = A; Bb < brins.length; Bb++){
    var Pa = brins[A].P, Q = brins[Bb].P;
    for(var i = 0; i < Pa.length - 1; i++) for(var j = (A === Bb ? i + 3 : 0); j < Q.length - 1; j++){
      var r = croise(Pa[i], Pa[i + 1], Q[j], Q[j + 1]);
      if(r){
        var cx = Pa[i][0] + (Pa[i + 1][0] - Pa[i][0]) * r[0], cy = Pa[i][1] + (Pa[i + 1][1] - Pa[i][1]) * r[0];
        if((cx - Kc[0]) * (cx - Kc[0]) + (cy - Kc[1]) * (cy - Kc[1]) > rayon * rayon) continue;
        var x = {a: A, ia: i + r[0], b: Bb, ib: j + r[1], dessus: null}; X.push(x); brins[A].X.push({x: x, s: x.ia}); brins[Bb].X.push({x: x, s: x.ib});
      }
    }
  }
  brins.forEach(function(b, n){
    b.X.sort(function(p, q){ return p.s - q.s; });
    var tour = true;
    b.X.forEach(function(c){
      var moi = c.x.a === n && c.s === c.x.ia ? 'a' : 'b';
      if(c.x.dessus === null) c.x.dessus = tour ? moi : (moi === 'a' ? 'b' : 'a');
      tour = c.x.dessus !== moi;
    });
  });
  var s = '';
  brins.forEach(function(b){ s += dessineBrin(b, b.P, false); });
  X.forEach(function(x){
    var n = x.dessus === 'a' ? x.a : x.b, si = x.dessus === 'a' ? x.ia : x.ib, b = brins[n];
    s += dessineBrin(b, morceau(b.P, Math.floor(si) - 3, Math.ceil(si) + 3), true);
  });
  return s;
}

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
   3. La géométrie de la masse : les dix rats (positions, tailles, postures de la fiche), le nœud, les queues
   ===================================================================== */
var VB = [-14, -6, 586, 420], SOL = 393, K = [292, 334];
/* les postures des pattes (fiche) : ff patte avant du fond, fn patte avant proche, pa patte arrière proche, pl patte arrière du fond */
var JAMBES = {
  debout: {ff: [[-40, 4], [-30, 30], [-46, 50], [-56, 58]], fn: [[-30, 20], [-18, 38], [-32, 52], [-42, 58]], pa: [[40, 42], [26, 56], [-2, 60]], pl: [[66, 46], [72, 58], [54, 60]]},
  bond:   {ff: [[-42, 4], [-50, 34], [-80, 50], [-100, 58]], fn: [[-30, 20], [-40, 42], [-66, 54], [-84, 62]], pa: [[48, 42], [70, 52], [98, 58]], pl: [[70, 44], [92, 50], [112, 52]]},
  grimpe: {ff: [[-42, 2], [-52, 30], [-86, 30], [-106, 22]], fn: [[-30, 20], [-36, 44], [-72, 46], [-92, 40]], pa: [[40, 42], [30, 56], [4, 60]], pl: [[66, 46], [72, 58], [54, 60]]},
  tire:   {ff: [[-40, 4], [-40, 32], [-74, 50], [-92, 58]], fn: [[-30, 20], [-30, 42], [-58, 54], [-74, 60]], pa: [[48, 42], [70, 52], [94, 58]], pl: [[70, 44], [90, 50], [108, 54]]},
  dresse: {ff: [[-42, 2], [-46, 30], [-70, 40], [-84, 34]], fn: [[-30, 20], [-28, 46], [-56, 52], [-70, 46]], pa: [[40, 42], [26, 56], [-2, 60]], pl: [[66, 46], [72, 58], [54, 60]]}
};
/* la bouche : la mâchoire tourne autour des gonds ; la gueule (le fond sombre) s'étire avec elle */
var GONDS = [-60, 16], GUEULE = [-58, 9], THETA_M = 34;
var ANG_BOUCHE = {ouverte: -26, grogne: -13, fermee: -2};
function yPointe(a){ return rotP([-130, 20], GONDS, a)[1]; }
function syGueule(a){ a = Math.max(-40, Math.min(4, a)); return r3(Math.max(.1, (yPointe(a) - GUEULE[1]) / (yPointe(-THETA_M) - GUEULE[1]))); }
/* les dix rats, du fond vers le devant (ordre de la fiche) ; r7 est le dixième, qui pointe le nez entre les autres.
   niv : 'roi' (tout le détail), 'avant' (les rats de devant), 'fond' (moins de poils) ; jaw : une mâchoire articulée ;
   q : la queue (direction d'arrivée dans le nœud, épaisseur, couleur, sens d'enroulement) ; feu : il prend feu (état brule) */
var RATS = [
  {id: 'r7', x: 246, y: 338, s: .4, rot: -6, pose: 'debout', bouche: 'grogne', poil: '#62525e', dk: .35, seed: 7, niv: 'fond'},
  {id: 'r9', x: 210, y: 262, s: .46, rot: 20, pose: 'dresse', bouche: 'ouverte', poil: '#6a5a6a', dk: .5, seed: 9, niv: 'fond', q: {ang: -140, w: 6, col: '#b87884', tour: 1}},
  {id: 'r10', x: 414, y: 278, s: .44, rot: 10, flip: true, pose: 'tire', bouche: 'grogne', poil: '#665a5e', dk: .5, seed: 10, niv: 'fond', q: {ang: -10, w: 6, col: '#b87884', tour: -1}},
  {id: 'r6', x: 462, y: 196, s: .5, rot: -32, flip: true, pose: 'grimpe', bouche: 'grogne', poil: '#7a6a72', dk: .1, seed: 6, niv: 'fond', q: {ang: -60, w: 6.5, col: '#e09aa6', tour: -1}},
  {id: 'roi', x: 300, y: 184, s: 1.22, rot: 14, pose: 'debout', bouche: 'grogne', poil: '#5a4c64', seed: 3, niv: 'roi', roi: true, jaw: true, feu: [[-6, -64, 46, 26], [34, -64, 38, 22], [66, -46, 30, 18]], q: {ang: -30, w: 11, col: '#e49aaa', tour: 1}},
  {id: 'r8', x: 404, y: 140, s: .44, rot: 24, pose: 'grimpe', bouche: 'ouverte', poil: '#8a7466', seed: 8, niv: 'fond', q: {ang: -45, w: 6, col: '#e8a4b0', tour: 1}},
  {id: 'r5', x: 150, y: 270, s: .5, rot: 28, pose: 'dresse', bouche: 'ouverte', poil: '#6e5a52', seed: 17, niv: 'avant', jaw: true, feu: [[0, -66, 48, 28], [44, -56, 40, 24]], q: {ang: -165, w: 7, col: '#dc94a2', tour: -1}},
  {id: 'r1', x: 126, y: 344, s: .64, rot: -4, pose: 'bond', bouche: 'ouverte', poil: '#7a6878', seed: 11, niv: 'avant', jaw: true, feu: [[-4, -66, 44, 26], [40, -58, 36, 22]], q: {ang: 170, w: 8, col: '#e49aaa', tour: 1}},
  {id: 'r2', x: 218, y: 374, s: .4, rot: -2, pose: 'debout', bouche: 'ouverte', poil: '#8a7a6a', seed: 2, niv: 'avant', jaw: true, q: {ang: 140, w: 6, col: '#eaa6b2', tour: -1}},
  {id: 'r3', x: 440, y: 342, s: .62, rot: 6, flip: true, pose: 'tire', bouche: 'ouverte', poil: '#6a6a7a', seed: 4, niv: 'avant', jaw: true, feu: [[0, -66, 44, 26], [42, -56, 36, 22]], q: {ang: 8, w: 8, col: '#e49aaa', tour: 1}}
];
var RAT = {}, MACH = {}, REPOS = {};
function deg(r){ return r * 180 / Math.PI; }
RATS.forEach(function(r){
  RAT[r.id] = r;
  var sx = r.flip ? -r.s : r.s, a = r.rot * Math.PI / 180;
  /* un point du dessin du rat (repère local) -> le vecteur depuis son pivot, dans le repère de la masse */
  r.loc = function(p){ var x = p[0] * sx, y = p[1] * r.s; return [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)]; };
  r.c0 = r.loc([92, 14]);
  r.f = r.flip ? 1 : -1;                     /* le sens du museau (−1 : à gauche) */
  var d = [r.x - K[0], r.y - K[1]], l = Math.hypot(d[0], d[1]) || 1;
  r.u = [d[0] / l, d[1] / l];                /* la direction « vers le dehors » (du nœud vers le rat) */
  if(r.q){
    var u = r.q.ang * Math.PI / 180;
    r.rim = [K[0] + Math.cos(u) * 46, K[1] + Math.sin(u) * 34];
    var C0 = [r.x + r.c0[0], r.y + r.c0[1]];
    r.th0 = deg(Math.atan2(C0[1] - r.rim[1], C0[0] - r.rim[0]));
    r.L0 = Math.hypot(C0[0] - r.rim[0], C0[1] - r.rim[1]);
    REPOS['q' + r.id] = {a: r3(r.th0)};
  }
  if(r.jaw){
    var a0 = ANG_BOUCHE[r.bouche];
    MACH[r.id + 'M'] = r.id + 'G';
    REPOS[r.id + 'M'] = {a: a0};
    REPOS[r.id + 'G'] = {sy: syGueule(a0)};
  }
});
REPOS.roiL = {sy: .03};
var ORDRE = ['r9', 'r10', 'r6', 'roi', 'r8', 'r5', 'r1', 'r2', 'r3'];
var QUEUES = RATS.filter(function(r){ return r.q; }).map(function(r){ return r.id; });
var PETITS = RATS.filter(function(r){ return !r.roi; }).map(function(r){ return r.id; });
var MACHOIRES = RATS.filter(function(r){ return r.jaw; }).map(function(r){ return r.id; });

/* =====================================================================
   4. Le moteur : des poses-clés jouées par la Web Animations API (transform et opacity seulement)
   ===================================================================== */
var Z = {x: 0, y: 0, a: 0, sx: 1, sy: 1};
var PARTICULES_MAX = 24;
function tf(v){ return 'translate(' + r3(v.x) + 'px,' + r3(v.y) + 'px) rotate(' + r3(v.a) + 'deg) scale(' + r3(v.sx) + ',' + r3(v.sy) + ')'; }
function fusion(a, b){
  var o = {x: a.x, y: a.y, a: a.a, sx: a.sx, sy: a.sy};
  if(b){ for(var k in o) if(b[k] != null) o[k] = b[k]; if(b.s != null){ o.sx = b.s; o.sy = b.s; } }
  return o;
}
function egal(a, b){ return Math.abs(a.x - b.x) < .02 && Math.abs(a.y - b.y) < .02 && Math.abs(a.a - b.a) < .02 && Math.abs(a.sx - b.sx) < .002 && Math.abs(a.sy - b.sy) < .002; }
/* une pose (translate, rotate, scale) appliquée à un vecteur depuis le pivot */
function appliquer(v, p){ var a = v.a * Math.PI / 180, x = p[0] * v.sx, y = p[1] * v.sy; return [v.x + x * Math.cos(a) - y * Math.sin(a), v.y + x * Math.sin(a) + y * Math.cos(a)]; }
function attendreMs(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }
function fini(a){ return a && a.finished ? a.finished.then(function(){}, function(){}) : Promise.resolve(); }
function hasard(a, b){ return a + Math.random() * (b - a); }
function choisir(l){ return l[Math.floor(Math.random() * l.length)]; }
function copie(o){ var r = {}; for(var k in o) r[k] = o[k]; return r; }
function oter(g){ return function(){ g.remove(); }; }
function reunir(){ var o = {}; for(var i = 0; i < arguments.length; i++){ var a = arguments[i]; for(var k in a) o[k] = a[k]; } return o; }

function Roi(conteneur, options){
  injecterCSS();
  this.c = conteneur;
  this.o = options || {};
  var D = new Defs(PX + (++NUM) + '_');
  this.D = D;
  this.G = {flash: D.doux('#fff8e0', .85), lumiere: D.doux('#fff4b0', .9), vapeur: D.doux('#eef2f8', .9), fumee: D.doux('#6a6278', .9), poussiere: D.doux('#7a6e86', .8),
    toux: D.doux('#c8d0a8', .85), braise: D.doux('#ffb040', 1), rose: D.doux('#ffb8c8', .9), givre: D.doux('#e8f8ff', .9), acide: D.doux('#c8f060', .85), noir: D.doux('#0c0812', .95),
    feu1: D.lin([[0, '#ff4a10'], [.6, '#ff8a1a'], [1, '#ffc040', .8]], 0, 1, 0, 0), feu2: D.lin([[0, '#ffd040'], [1, '#fff8c0']], 0, 1, 0, 0),
    glace: D.lin([[0, '#f4fdff', .82], [.45, '#b8e6ff', .62], [1, '#5aa0d8', .75]], 1, 0, 0, 1),
    huile: D.lin([[0, '#1a1428'], [.3, '#3a2a5a'], [.45, '#2a5a6a'], [.6, '#5a6a2a'], [.75, '#6a3a5a'], [1, '#1a1428']], 0, 0, 1, 0)};
  var art = dessinerRoi.call(this, D);
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
    noeud: false, boule: false, etale: false};
  this.attente = true;
  this.jeton = 0;
  this.enAction = false;
  this.boucles = [];
  this.minuteurs = [];
  this.boucX = {};
  this.fx = {};
  this.debris = [];
  this.mort = false;
  this.vitesse = 1;
  this._lancerX();
  this._reprendre(0);
}
var R = Roi.prototype;

/* la pose de repos d'une pièce (les queues ont leur angle, les mâchoires leur ouverture) */
R._zero = function(n){ return fusion(Z, REPOS[n]); };
/* lire la pose actuelle d'une pièce (même au milieu d'une animation) */
R._lire = function(n){
  var el = this.J[n][0], ref = this.v[n] || this._zero(n), t = getComputedStyle(el).transform;
  if(!t || t === 'none') return fusion(Z);
  var m = t.match(/matrix\(([^)]+)\)/);
  if(!m) return fusion(ref);
  var v = m[1].split(',').map(parseFloat), sx = Math.hypot(v[0], v[1]), ang = Math.atan2(v[1], v[0]) * 180 / Math.PI, sy = (v[0] * v[3] - v[1] * v[2]) / (sx || 1);
  /* un retournement (sx < 0 connu) se relit comme tel */
  if(ref.sx < 0){ sx = -sx; ang += 180; }
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
    self.J[n].forEach(function(el){ el.getAnimations().forEach(function(a){ if(a.id !== 'op') a.cancel(); }); el.style.transform = tf(vals[n]); });
    self.v[n] = vals[n];
  });
};
/* les liens : une queue suit la croupe de son rat (elle tourne et s'étire depuis le nœud) ; la gueule suit la mâchoire.
   On les ajoute à chaque clé d'une suite, à partir de la pose cumulée des rats. */
R._queueC = function(r, c){
  var C = [r.x + c[0], r.y + c[1]], dx = C[0] - r.rim[0], dy = C[1] - r.rim[1], a = deg(Math.atan2(dy, dx));
  while(a - r.th0 > 180) a -= 360;
  while(a - r.th0 < -180) a += 360;
  return {a: r3(a), sx: r3(Math.max(.2, Math.hypot(dx, dy) / r.L0))};
};
R._lier = function(cles, o){
  var self = this, cur = {}, base = o.ajout ? this._base() : null;
  function dep(n){ if(o.depuis && o.depuis[n]) return fusion(Z, o.depuis[n]); return self.v[n] ? fusion(self.v[n]) : self._zero(n); }
  cles.forEach(function(k){
    Object.keys(k.p).forEach(function(n){
      var r = RAT[n], m = MACH[n];
      if(r && r.q && !o.sansQueue && !k.p['q' + n]){
        if(o.ajout){
          cur[n] = fusion(cur[n] || Z, k.p[n]);
          var b = base[n] || Z, qb = base['q' + n] || self._zero('q' + n), q = self._queueC(r, appliquer(b, appliquer(cur[n], r.c0)));
          k.p['q' + n] = {a: r3(q.a - qb.a), sx: r3(q.sx / (qb.sx || 1))};
        } else {
          cur[n] = fusion(cur[n] || dep(n), k.p[n]);
          k.p['q' + n] = self._queueC(r, appliquer(cur[n], r.c0));
        }
      }
      if(m && !k.p[m]){
        if(o.ajout){ cur[n] = fusion(cur[n] || Z, k.p[n]); var bj = (base[n] || self._zero(n)).a; k.p[m] = {sy: r3(syGueule(bj + cur[n].a) / syGueule(bj))}; }
        else { cur[n] = fusion(cur[n] || dep(n), k.p[n]); k.p[m] = {sy: syGueule(cur[n].a)}; }
      }
    });
  });
};
/* jouer une suite de poses-clés.  cles = [{t:0..1, p:{piece:{x,y,a,sx,sy,s}}, e:'easing'}]
   o.boucle : en boucle ; o.ajout : s'ajoute par-dessus (composite add) ; o.vitesse ; o.delai ; o.depuis */
R._seq = function(cles, duree, o){
  o = o || {};
  var self = this, noms = {}, anims = [];
  if(!o.boucle) this._lier(cles, o);
  cles.forEach(function(k){ for(var n in k.p) noms[n] = 1; });
  Object.keys(noms).forEach(function(n){
    var els = self.J[n];
    if(!els) return;
    var cur = o.ajout ? fusion(Z) : (o.depuis ? fusion(self._zero(n), o.depuis[n]) : (self.v[n] && !els[0].getAnimations().length ? fusion(self.v[n]) : self._lire(n))), frames = [];
    if(!(cles[0].t === 0 && cles[0].p[n])) frames.push({offset: 0, transform: tf(cur)});
    cles.forEach(function(k){
      if(!k.p[n]) return;
      cur = fusion(cur, k.p[n]);
      if(frames.length && k.e) frames[frames.length - 1].easing = k.e;
      frames.push({offset: Math.min(1, k.t), transform: tf(cur)});
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
/* aller doucement vers une pose (les pièces absentes reviennent à leur repos si tout) */
R._allerA = function(pose, duree, e, tout){
  var p = {}, n, self = this;
  for(n in pose){ var v = fusion(this._zero(n), pose[n]); if(!this.v[n] || !egal(this.v[n], v) || this.J[n] && this.J[n][0].getAnimations().length) p[n] = v; }
  if(tout) for(n in this.J){ if(pose[n]) continue; var z = this._zero(n), w = self.v[n]; if(!w || !egal(w, z) || self.J[n][0].getAnimations().length) p[n] = z; }
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
/* du repère « monde » à l'écran, et retour (deux marques fixes donnent l'échelle et le décalage) */
R._marques = function(){
  var a = this.marques[0].getBoundingClientRect(), b = this.marques[1].getBoundingClientRect(), ax = a.left + a.width / 2, ay = a.top + a.height / 2;
  return {ax: ax, ay: ay, kx: (b.left + b.width / 2 - ax) / 100, ky: (b.top + b.height / 2 - ay) / 100};
};
R._versEcran = function(p){ var m = this._marques(); return {x: m.ax + p[0] * m.kx, y: m.ay + p[1] * m.ky}; };
R._depuisEcran = function(q){ var m = this._marques(); return [(q.x - m.ax) / (m.kx || 1), (q.y - m.ay) / (m.ky || 1)]; };
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
  if(this.S.monde.childElementCount >= PARTICULES_MAX) return document.createElementNS(NS, 'g');
  return this._el(parent, html);
};
/* montrer / cacher des variantes (opacité seulement ; une variante invisible ne coûte rien à afficher) */
R._fondu = function(els, vers, ms, delai){
  if(typeof els === 'string') els = this.V[els] || [];
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
/* l'opacité d'une pièce animée (elle disparaît en s'enfuyant, par exemple) */
R._opacite = function(n, vers, ms, delai){
  (this.J[n] || []).forEach(function(e){
    var de = parseFloat(getComputedStyle(e).opacity);
    var a = e.animate([{opacity: isNaN(de) ? 1 : de}, {opacity: vers}], {duration: ms || 1, delay: delai || 0, fill: 'forwards', easing: 'ease-in-out'});
    a.id = 'op';
  });
};
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
/* un calque par-dessus la scène (explosion), en pixels de la scène */
R._calque = function(scene){
  scene = scene || this.c.parentNode || this.c;
  if(getComputedStyle(scene).position === 'static') scene.style.position = 'relative';
  var sr = scene.getBoundingClientRect(), W = scene.offsetWidth || sr.width, H = scene.offsetHeight || sr.height;
  var ov = document.createElementNS(NS, 'svg');
  ov.setAttribute('class', PX + '-scene-fx');
  ov.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
  scene.appendChild(ov);
  var self = this;
  return {
    el: ov, W: W, H: H,
    pt: function(q){ var r = scene.getBoundingClientRect(), e = W / (r.width || 1); return [(q.x - r.left) * e, (q.y - r.top) * e]; },
    ancre: function(nom){ return this.pt(self.ancre(nom)); },
    monde: function(p){ return this.pt(self._versEcran(p)); },
    u: function(){ var r = scene.getBoundingClientRect(), m = self._marques(); return m.kx * W / (r.width || 1); },
    g: function(html){ var g = document.createElementNS(NS, 'g'); g.innerHTML = html; ov.appendChild(g); return g; },
    defs: function(html){ var d = ov.querySelector('defs'); if(!d){ d = document.createElementNS(NS, 'defs'); ov.insertBefore(d, ov.firstChild); } d.insertAdjacentHTML('beforeend', html); },
    retirer: function(){ ov.remove(); }
  };
};

/* =====================================================================
   5. Les actions et l'attente (squelette commun)
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
  function base(n){ return fusion(self._zero(n), b[n]); }
  function autour(n, d){ var v = base(n), o = {}; for(var k in d) o[k] = (k === 'sx' || k === 'sy') ? v[k] * d[k] : v[k] + d[k]; return o; }
  return function(n, deltas, duree, e, delai){
    if(!self.J[n]) return null;
    var cles = deltas.map(function(d){ var o = {}; o[n] = autour(n, d[1]); return {t: d[0], p: o, e: e}; });
    return self._seq(cles, duree, {boucle: true, vitesse: V, depuis: b, delai: delai || 0});
  };
};
R._planifier = function(ms){
  var self = this;
  this._minuteur(function(){
    if(self.enAction || self.mort || !self.attente) return;
    self._evenement();
    self._planifier(hasard(380, 900) / (self.etat.enrage ? 1.6 : 1));
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
  ['fumee', 'vapeur', 'givreT', 'souffle'].forEach(function(k){ clearTimeout(self.fx[k]); });
  this._couperX('');
  this._couperBoucles();
  return this;
};
R.etatCourant = function(){ return copie(this.etat); };
R.ancre = function(nom){
  var e = this.etat, n = nom;
  if(nom === 'pointfaible') n = e.ouvert ? 'pfL' : (e.boule ? 'hautB' : 'pf');
  else if(nom === 'tete') n = e.boule ? 'hautB' : 'roiO';
  else if(nom === 'bouche') n = e.boule ? 'centre' : 'roiB';
  else if(nom === 'haut') n = e.boule ? 'hautB' : 'haut';
  var el = this.A[n] || this.A.centre;
  if(!el) return null;
  var r = el.getBoundingClientRect();
  return {x: r.left + r.width / 2, y: r.top + r.height / 2};
};

/* =====================================================================
   6. Petits effets : des particules simples, sans filtre, retirées à la fin (repère « monde »)
   ===================================================================== */
/* une bouffée (fumée, toux, poussière, vapeur) : une tache douce qui grossit et s'efface */
R._bouffee = function(p, o){
  o = o || {};
  var r = o.r || 8, g = this._fxEl('<circle r="' + f1(r) + '" fill="' + (o.grad || this.G.vapeur) + '"/>', o.parent);
  var dx = o.dx == null ? hasard(-10, 10) : o.dx, dy = o.dy == null ? -30 : o.dy, d = o.duree || 900;
  var a = g.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(' + (o.s0 || .3) + ')', opacity: 0}, {offset: .15, opacity: o.op || .8}, {transform: 'translate(' + f1(p[0] + dx) + 'px,' + f1(p[1] + dy) + 'px) scale(' + (o.s1 || 1.8) + ')', opacity: 0}], {duration: d, easing: 'cubic-bezier(.2,.7,.4,1)', delay: o.delai || 0, fill: 'both'});
  a.finished.then(oter(g), oter(g));
  return a;
};
R._poussiere = function(p, n, sens, k){
  for(var i = 0; i < n; i++) this._bouffee([p[0] + hasard(-14, 14), p[1] - 4], {r: hasard(8, 13) * (k || 1), grad: this.G.poussiere, op: .6, dx: (sens || 0) * hasard(14, 40) + hasard(-12, 12), dy: hasard(-20, -6), duree: hasard(500, 800), delai: i * 40, s1: 2.2});
};
R._goutteTombe = function(p, o){
  o = o || {};
  var coul = o.coul || '#d8f0ff', g = this._fxEl('<path d="M0 -6 C 2 -2 4 1 4 3 C 4 6 2 7 0 7 C -2 7 -4 6 -4 3 C -4 1 -2 -2 0 -6 Z" fill="' + coul + '" stroke="' + O + '" stroke-width="1.2"/>');
  var sol = o.sol || SOL, dy = Math.max(10, sol - p[1]), d = Math.sqrt(dy) * 45, x = p[0] + (o.dx || 0);
  g.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(.5,.9)'}, {offset: .25, transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1] + 4) + 'px) scale(.7,1.4)'}, {transform: 'translate(' + f1(x) + 'px,' + f1(sol) + 'px) scale(.8,1.3)', opacity: .5}], {duration: d + 200, easing: 'cubic-bezier(.5,0,1,1)', fill: 'forwards', delay: o.delai || 0}).finished.then(oter(g), oter(g));
};
/* des étincelles qui jaillissent puis retombent */
R._etincelles = function(p, n, o){
  o = o || {};
  var cs = o.coul || ['#fff6c0', '#ffd060', '#ffffff', '#ffb040'], v0 = o.v || 50, ang = o.ang == null ? -Math.PI / 2 : o.ang, ouv = o.ouv == null ? Math.PI * 1.6 : o.ouv;
  n = Math.min(n, 12);
  for(var i = 0; i < n; i++){
    var a = ang + (Math.random() - .5) * ouv, v = v0 * hasard(.5, 1.2), lg = hasard(5, 11) * (o.taille || 1), dx = Math.cos(a) * v, dy = Math.sin(a) * v, gr = o.grav == null ? 34 : o.grav, ep = o.ep || 2.4;
    var e = this._fxEl(L('M0 0 L ' + f1(-Math.cos(a) * lg) + ' ' + f1(-Math.sin(a) * lg), choisir(cs), ep) + C(0, 0, ep * .7, '#ffffff'));
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
/* le flash d'un coup : une lueur claire posée sur la masse */
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
R._ondes = function(p, sens, coul, k){
  var d = 'M0 -14 Q ' + f1(-10 * sens) + ' 0 0 14 M' + f1(9 * sens) + ' -20 Q ' + f1(-5 * sens) + ' 0 ' + f1(9 * sens) + ' 20';
  var g = this._fxEl(L(d, O, 6) + L(d, coul || '#ffe8a0', 3));
  k = k || 1;
  g.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(' + f1(.5 * k) + ')', opacity: 0}, {offset: .2, opacity: 1}, {transform: 'translate(' + f1(p[0] + sens * 34 * k) + 'px,' + f1(p[1]) + 'px) scale(' + f1(1.5 * k) + ')', opacity: 0}], {duration: 600, easing: 'ease-out', fill: 'both'}).finished.then(oter(g), oter(g));
};
/* des rayons de lumière */
R._rayons = function(p, r, coul){
  var s = '';
  for(var i = 0; i < 12; i++){ var a = i / 12 * Math.PI * 2, r0 = r * .35, r1b = r * (i % 2 ? .8 : 1.05); s += 'M' + f1(Math.cos(a) * r0) + ' ' + f1(Math.sin(a) * r0) + ' L ' + f1(Math.cos(a) * r1b) + ' ' + f1(Math.sin(a) * r1b) + ' '; }
  var g = this._fxEl('<circle r="' + f1(r * .9) + '" fill="' + this.G.lumiere + '"/>' + L(s, coul || '#fff8d0', 4) + L(s, '#ffffff', 1.6));
  var T = function(s2, a){ return 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(' + s2 + ') rotate(' + a + 'deg)'; };
  g.animate([{transform: T(.3, 0), opacity: 0}, {offset: .2, opacity: 1, transform: T(1, 10)}, {transform: T(1.25, 24), opacity: 0}], {duration: 700, easing: 'ease-out', fill: 'forwards'}).finished.then(oter(g), oter(g));
};
/* deux entailles blanches (la dague) */
R._rayures = function(p){
  var d = 'M-18 -10 Q 0 -2 16 8 M-10 -16 Q 4 -6 18 2';
  var g = this._fxEl(L(d, O, 5) + L(d, '#ffffff', 2.2));
  g.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(.3,1)', opacity: 0}, {offset: .15, opacity: 1, transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(1.3)'}, {transform: 'translate(' + f1(p[0] + 4) + 'px,' + f1(p[1] + 4) + 'px) scale(1.4)', opacity: 0}], {duration: 460, easing: 'ease-out', fill: 'forwards'}).finished.then(oter(g), oter(g));
};
/* le couinement : des petits traits blancs qui partent de la bouche (sens : −1 à gauche) */
R._cri = function(p, force, sens){
  var traits = '';
  sens = sens || -1;
  for(var i = 0; i < 5; i++){ var a = (sens < 0 ? Math.PI : 0) + (i - 2) * .32, ra = 9, rb = 17 + (i % 2) * 6; traits += 'M' + f1(Math.cos(a) * ra) + ' ' + f1(Math.sin(a) * ra) + ' L ' + f1(Math.cos(a) * rb) + ' ' + f1(Math.sin(a) * rb) + ' '; }
  var g = this._fxEl(L(traits, O, 5) + L(traits, '#ffffff', 2.4));
  force = force || 1;
  g.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(.4)', opacity: 0}, {offset: .2, opacity: 1, transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(' + force + ')'}, {transform: 'translate(' + f1(p[0] + sens * 8) + 'px,' + f1(p[1]) + 'px) scale(' + f1(1.35 * force) + ')', opacity: 0}], {duration: 420, easing: 'ease-out', fill: 'forwards'}).finished.then(oter(g), oter(g));
};
/* le ricanement : de petits « hé » (arcs) qui montent de la bouche */
R._hehe = function(p, sens, delai){
  var d = 'M-6 -4 Q 0 4 6 -4 M-4 -14 Q 1 -7 6 -14';
  var g = this._fxEl(L(d, O, 4.4) + L(d, '#fff4c8', 2));
  g.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(.4)', opacity: 0}, {offset: .25, opacity: 1, transform: 'translate(' + f1(p[0] + sens * 6) + 'px,' + f1(p[1] - 8) + 'px) scale(1)'}, {transform: 'translate(' + f1(p[0] + sens * 14) + 'px,' + f1(p[1] - 26) + 'px) scale(1.2)', opacity: 0}], {duration: 700, delay: delai || 0, easing: 'ease-out', fill: 'both'}).finished.then(oter(g), oter(g));
};
/* un bout de queue rose qui vole (le nœud qui se défait, l'explosion) */
R._brin = function(p, ang, v, delai){
  var d = 'M0 0 C 6 -8 14 -4 12 4 C 10 12 20 14 26 8';
  var g = this._fxEl(L(d, O, 7.4) + L(d, '#e49aaa', 3.8) + L('M2 -1 C 6 -6 12 -4 11 2', '#ffd8e0', 1.2, so(.7)));
  var dx = Math.cos(ang) * v, dy = Math.sin(ang) * v, rot = hasard(-400, 400);
  g.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) rotate(0deg)', opacity: 1}, {offset: .5, transform: 'translate(' + f1(p[0] + dx * .7) + 'px,' + f1(p[1] + dy * .7 - 20) + 'px) rotate(' + f1(rot * .5) + 'deg)', opacity: 1},
    {transform: 'translate(' + f1(p[0] + dx) + 'px,' + f1(p[1] + dy + 30) + 'px) rotate(' + f1(rot) + 'deg)', opacity: 0}], {duration: hasard(600, 900), delay: delai || 0, easing: 'cubic-bezier(.2,.6,.5,1)', fill: 'both'}).finished.then(oter(g), oter(g));
};
/* une gerbe de feu */
R._souffleFeu = function(p, r){
  for(var i = 0; i < 5; i++) this._bouffee([p[0] + hasard(-r, r) * .5, p[1] + hasard(-r, r) * .4], {r: hasard(r * .35, r * .6), grad: this.G.braise, op: .95, dx: hasard(-r, r) * .6, dy: hasard(-r * 1.2, -r * .4), duree: hasard(450, 750), delai: i * 30, s0: .4, s1: 1.8});
  this._etincelles(p, 5, {v: r * 1.4, coul: ['#ffd060', '#ff9a30', '#fff0a0']});
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
/* une copie de pièce, posée dans le repère fixe exactement où elle est ; la pièce d'origine est cachée (opacité).
   La copie est un débris (hors des pièces) : elle peut voler, tomber et rester au sol. Renvoie {g, c (le pivot)}. */
R._detacher = function(n, parent){
  var self = this, rep = parent || this.S.fixe, w = rep.getCTM().inverse(), el = this.J[n][0], M = w.multiply(el.getCTM());
  var c = [M.e, M.f], g = this._el(rep, ''), inner = document.createElementNS(NS, 'g');
  g.setAttribute('data-debris', '1');
  inner.setAttribute('transform', 'matrix(' + [M.a, M.b, M.c, M.d, 0, 0].map(r3).join(' ') + ')');
  inner.innerHTML = el.innerHTML;
  [].forEach.call(inner.querySelectorAll('[data-a],[data-slot]'), function(e){ e.remove(); });
  [].forEach.call(inner.querySelectorAll('[data-j]'), function(e){ e.removeAttribute('data-j'); });
  g.appendChild(inner);
  this.J[n].forEach(function(e){ e.style.opacity = 0; });
  g.style.transform = 'translate(' + f1(c[0]) + 'px,' + f1(c[1]) + 'px)';
  this.debris.push(g);
  return {g: g, c: c, ang: deg(Math.atan2(M.b, M.a))};
};

/* =====================================================================
   A. Le dessin du Roi des rats (fiche 07-roirats.js : mêmes formes, mêmes couleurs, même lumière), découpé en pièces.
      Repère : celui de la fiche (540 × 430), sol à y = 393, nœud en (292, 334). Les flous de la fiche sont des dégradés.
   ===================================================================== */
/* la couronne de bric et de broc (fiche) : cuillère tordue, capsule, os, clou, éclat de verre, bout de chaîne */
function couronne(D, k){
  var w = 2.4 * k, s = '<g transform="rotate(-8 -66 -52)">';
  s += Pw('M-96 -50 C -84 -60 -56 -64 -38 -58 L -38 -52 C -58 -56 -82 -54 -94 -46 Z', D.g('#6a5428'), w * .8);
  s += Pw('M-92 -52 L -98 -76 C -99 -82 -94 -86 -90 -90 L -87 -87 C -91 -82 -93 -78 -91 -74 L -87 -53 Z', D.g('#8a8e9c'), w) + Pw('M-94 -94 L -84 -88 L -88 -84 L -97 -90 Z', D.g('#9aa0ae'), w * .8) + L('M-95 -74 L -91 -56', '#e6ecf6', k, so(.6));
  var cap = '', cx = -78, cy = -82;
  for(var i = 0; i < 20; i++){ var a = i / 20 * Math.PI * 2, rr = i % 2 ? 9.5 : 12; cap += (i ? ' L ' : 'M') + f1(cx + Math.cos(a) * rr) + ' ' + f1(cy + Math.sin(a) * rr); }
  s += L('M-78 -70 L -77 -56', '#6a6e7c', 2.4 * k);
  s += Pw(cap + ' Z', D.g('#d84a3a'), w) + C(cx, cy, 6.5, 'none', ' stroke="#7a1a1a" stroke-width="' + f1(1.2 * k) + '"') + F('M-82 -86 l 4 -4 l 1 5 l 5 1 l -4 3 l 1 5 l -4 -3 l -4 3 l 1 -5 l -4 -3 Z', '#ffe0a0', fo(.85)) + L('M-72 -90 C -68 -86 -67 -80 -68 -76', '#ffe8d8', 1.4 * k, so(.7));
  s += Pw('M-64 -60 C -68 -72 -58 -80 -62 -92 C -65 -100 -58 -106 -56 -112 L -52 -111 C -53 -104 -59 -100 -57 -92 C -53 -80 -62 -72 -59 -60 Z', D.g('#b8c0cc'), w);
  s += Pw('M-55 -110 C -64 -116 -66 -130 -58 -138 C -50 -144 -40 -138 -42 -126 C -44 -116 -48 -110 -55 -110 Z', D.g('#c8d0dc'), w);
  s += F('M-52 -116 C -58 -120 -58 -130 -53 -134 C -48 -136 -45 -130 -47 -124 Z', '#5a6070', fo(.5)) + L('M-48 -136 C -43 -134 -42 -128 -44 -122', '#ffffff', 1.6 * k, so(.85));
  s += Pw('M-48 -60 L -42 -90 C -46 -92 -46 -98 -42 -99 C -39 -100 -37 -97 -36 -95 C -34 -98 -30 -98 -29 -95 C -28 -92 -31 -89 -34 -88 L -40 -58 Z', D.g('#eadfc4'), w) + L('M-38 -90 L -42 -66', '#fff8e6', 1.4 * k, so(.7));
  s += Pw('M-100 -44 C -86 -56 -62 -60 -36 -56 C -33 -52 -33 -46 -35 -42 C -58 -46 -82 -42 -98 -32 C -102 -36 -103 -40 -100 -44 Z', D.g('#c8a24e'), w);
  s += F('M-92 -42 C -88 -44 -84 -42 -82 -46 C -78 -44 -76 -48 -72 -48 L -74 -44 C -80 -42 -86 -38 -92 -36 Z', '#7a3e1a', fo(.55)) + F('M-48 -54 C -44 -52 -40 -54 -37 -52 L -37 -46 C -40 -48 -44 -47 -48 -50 Z', '#7a3e1a', fo(.5));
  s += L('M-97 -44 C -84 -54 -60 -58 -38 -55', '#fff0c0', 1.4 * k, so(.75)) + L('M-70 -58 L -71 -45 M-52 -58 L -53 -45', '#5a4418', k, so(.5));
  s += F(rond(-92, -40, 1.6) + rond(-84, -45, 1.6) + rond(-46, -51, 1.6) + rond(-40, -50, 1.6), '#5a4418') + F(rond(-91.5, -40.5, .7) + rond(-83.5, -45.5, .7) + rond(-45.5, -51.5, .7) + rond(-39.5, -50.5, .7), '#fff0c0');
  s += C(-62, -50, 10, D.halo('#e6ffd0', '#6aff8a'), fo(.75)) + Pw('M-68 -45 L -64 -57 L -56 -53 L -57 -45 Z', '#7ad89a', w * .7) + F('M-64 -55 L -59 -53 L -61 -49 Z', '#f0fff0', fo(.85));
  var ch = '<ellipse cx="-34" cy="-40" rx="3.4" ry="6" transform="rotate(10 -34 -40)"/><path d="M-33 -32 L -32 -22"/><ellipse cx="-31" cy="-16" rx="3.4" ry="6" transform="rotate(-6 -31 -16)"/><path d="M-31 -8 L -30 2"/><ellipse cx="-30" cy="7" rx="3" ry="5.4" transform="rotate(8 -30 7)"/>';
  s += '<g fill="none" stroke="' + O + '" stroke-width="' + f1(4.6 * k) + '">' + ch + '</g><g fill="none" stroke="#a4aab8" stroke-width="' + f1(2 * k) + '">' + ch + '</g>';
  return s + '</g>';
}
/* des étoiles pré-dessinées (ébloui, louche) : une variante, et n étoiles (pièces x-) qui tourneront autour d'un centre */
function etoilesDessin(D, nom, cx, cy, rx, n, r){
  var lu = D.doux('#fff6c0', .5), s = '<ellipse cx="' + f1(cx) + '" cy="' + f1(cy) + '" rx="' + f1(rx * 1.2) + '" ry="' + f1(rx * .6) + '" fill="' + lu + '"/>';
  for(var i = 0; i < n; i++){ var rr = r - (i % 2) * r * .22; s += '<g data-j="x-' + nom + i + '"><circle r="' + f1(rr * 1.25) + '" fill="' + lu + '"/><path d="' + etoileD(rr, 5, .45) + '" fill="#ffe466" stroke="' + O + '" stroke-width="' + f1(rr * .15 + 1) + '"/><path d="' + etoileD(rr * .42, 5, .45) + '" fill="#fffbe0"/></g>'; }
  return vari(nom, s);
}
/* une flamme qui reste (état brule) : trois couches, un groupe qui vacille (pièce x-) */
function flammeDessin(G, h, w){
  return '<path d="' + flammeD(h, w) + '" fill="' + G.feu1 + '" stroke="#5a1a08" stroke-width="2"/><path d="' + flammeD(h * .7, w * .62) + '" fill="#ffa21e"/><path d="' + flammeD(h * .42, w * .36) + '" fill="' + G.feu2 + '"/>';
}

/* UN rat (le dessin de la fiche, simplifié selon son niveau), découpé en pièces. Il est dessiné dans son repère (ventre en 0,0,
   museau à gauche), posé là où la fiche le met ; ses pièces : le corps (id), la tête (idT), la patte avant (idP), la mâchoire
   (idM) et la gueule (idG) pour ceux de devant ; pour le roi : la patte avant du fond (roiPF), la couronne (roiC), le sourcil
   (roiS), la paupière (roiL). */
function dessinRat(D, G, r){
  var s = r.s, k = 1 / s, wO = (1.7 + 1.1 * s) * k, dk = r.dk || 0, flip = !!r.flip, sd = r.seed || 3, roi = !!r.roi, niv = r.niv, id = r.id, avant = niv !== 'fond';
  var poil = sombre(r.poil, dk), rose = sombre('#e49aaa', dk * .9), clairP = clair(poil, .45), fH = clair(poil, .55), fB = sombre(poil, .5);
  var lum = Math.max(0, 1 - dk * 1.3);
  function g(c, f){ return D.g(c, f, flip); }
  function pw(d, f, w, x){ return Pw(d, f, w || wO, x); }
  var po = JAMBES[r.pose], a0 = ANG_BOUCHE[r.bouche], out = '';
  /* l'ombre douce sous ceux qui sont au sol */
  if(!roi && (id === 'r1' || id === 'r2' || id === 'r3' || id === 'r5')) out += El(20, 46, 112, 30, G.ombre);
  /* la queue courte (quand le nœud se défait, chacun garde un bout de queue) */
  if(r.q) out += vari('qc', L('M84 16 C 112 22 140 22 150 6 C 158 -8 172 -10 182 -2', O, (r.q.w + 4.4) * k) + L('M84 16 C 112 22 140 22 150 6 C 158 -8 172 -10 182 -2', r.q.col, r.q.w * k));
  /* patte arrière du fond, patte avant du fond, oreille du fond */
  out += pw(tube(po.pl, [13, 9, 7]), g(sombre(rose, .4))) + patte(po.pl[2], po.pl[1], sombre(rose, .4), wO * .7, niv);
  var ff = pw(tube(po.ff, [22, 15, 10, 8]), g(sombre(poil, .4))) + patte(po.ff[3], po.ff[2], sombre(rose, .35), wO * .7, niv);
  out += roi ? piv('roiPF', po.ff[0][0], po.ff[0][1], ff) : ff;
  out += pw('M-58 -34 C -76 -60 -64 -78 -46 -76 C -32 -72 -32 -52 -40 -36 Z', g(sombre(poil, .3))) + F('M-55 -38 C -68 -58 -60 -70 -48 -68 C -40 -64 -40 -50 -44 -40 Z', sombre(rose, .45));
  /* le corps, sa crête, son ventre clair */
  var CORPS = 'M-46 -28 C -14 -58 52 -56 86 -26 C 110 -4 104 32 74 46 C 34 60 -26 56 -50 34 C -64 18 -62 -12 -46 -28 Z';
  out += crete([[-50, -24], [-20, -60], [50, -60], [92, -24]], .1, .96, roi ? 15 : 12, roi ? 24 : 13, g(roi ? sombre(poil, .2) : poil), wO);
  out += crete([[84, 40], [44, 62], [-20, 60], [-50, 32]], 0, 1, roi ? 16 : 11, roi ? 11 : 8, g(sombre(poil, .12)), wO, [0, -18]);
  if(avant) out += crete([[104, -2], [108, 14], [100, 30], [84, 44]], 0, 1, 5, roi ? 9 : 6, g(poil), wO, [-14, 0]);
  out += pw(CORPS, g(poil));
  out += F('M-44 34 C -20 52 30 56 70 46 C 40 42 -6 40 -44 34 Z', clairP, fo(.45));
  out += F('M-50 30 C -60 14 -58 -8 -46 -22 C -50 0 -44 18 -26 34 Z', '#120a1e', fo(.3));
  if(avant) out += F('M80 -20 C 96 -2 98 26 76 42 C 88 22 88 0 80 -20 Z', '#120a1e', fo(.25));
  out += poils(26, 2, 68, 42, roi ? 120 : (avant ? 46 : 24), sd, 1.5, fH, fB);
  if(roi){
    /* poil grisonnant, pelade, vieilles cicatrices */
    out += poils(30, 14, 60, 30, 40, sd + 50, 2.2, sombre(poil, .55), sombre(poil, .6));
    out += poils(14, -30, 54, 14, 30, 91, 1.8, '#e6dcea', '#e6dcea');
    out += F('M2 14 C 10 8 24 10 28 18 C 24 26 10 26 2 14 Z', '#b88a94', fo(.55)) + L('M6 16 l 4 -3 M12 18 l 4 -4 M18 19 l 4 -4', '#7a4a56', 1, so(.6));
    out += L('M20 -34 L 56 -12 M28 -36 l -5 8 M38 -30 l -5 8 M48 -24 l -5 8', '#e8b8c4', 2, so(.8));
  }
  if(lum > .05) out += L('M-36 -38 C -10 -56 46 -58 82 -32', LUNE, 2.6 * k * .8, so(r3(.6 * lum))) + (avant ? L('M86 -20 C 100 -4 102 14 98 26', LUNE, 2 * k * .8, so(r3(.35 * lum))) : '');
  /* la cuisse et le long pied */
  out += F('M28 4 C 56 -18 98 2 96 34 C 94 54 72 62 50 58 C 34 44 26 24 28 4 Z', g(clair(poil, .06))) + L('M30 6 C 58 -14 96 4 96 34 C 96 50 82 60 62 60', O, wO);
  if(avant) out += poils(62, 28, 24, 20, roi ? 16 : 10, sd + 7, 1.4, fH, fB);
  if(lum > .05 && avant) out += L('M42 -4 C 64 -12 86 -2 92 16', LUNE, 2 * k * .8, so(r3(.45 * lum)));
  out += pw(tube(po.pa, [15, 10, 8]), g(rose)) + patte(po.pa[2], po.pa[1], g(rose), wO * .7, niv);
  /* le givre (variante) sur le corps */
  out += vari('gel', F(CORPS, G.glace) + L(CORPS, '#ffffff', 1.6 * k, so(.6)) + (avant ? L('M-20 -54 l -4 -12 M10 -58 l 0 -14 M44 -54 l 4 -12 M72 -40 l 8 -8', '#e8f8ff', 3 * k) : ''));
  /* la collerette hérissée du roi */
  if(roi) out += poils(-8, -10, 18, 34, 34, 57, 1.6, '#ece2f0', sombre(poil, .55));

  /* ---- la tête (pièce idT), avec sa mâchoire ---- */
  var t = '', mach = pw('M-50 12 C -80 20 -112 20 -134 17 C -132 28 -110 35 -86 35 C -66 35 -52 28 -50 12 Z', g(sombre(poil, .1)));
  mach += F('M-60 18 C -84 22 -108 22 -124 20 C -108 26 -84 27 -62 24 Z', '#c85a72', fo(.9));
  mach += pw('M-129 17 L -122 17 L -123 3 L -129 5 Z', '#f3e3a0', wO * .7) + pw('M-120 18 L -114 18 L -116 7 Z', '#e4d08a', wO * .6);
  if(avant) mach += L('M-130 26 C -112 32 -86 34 -64 30', clair(poil, .4), 1.4 * k * .8, so(.45)) + poils(-90, 28, 26, 4, roi ? 8 : 5, sd + 31, 1.2, fB, fB);
  if(r.bouche === 'ouverte') mach += pw('M-100 30 c 2 8 -2 14 1 22 c 4 -5 4 -14 2 -22 Z', '#d8f0ff', wO * .5, fo(.85));
  if(r.jaw){
    var tipG = rotP([-134, 17], GONDS, -THETA_M);
    t += piv(id + 'G', GUEULE[0], GUEULE[1], F('M-48 4 L -142 3 L ' + pt(tipG) + ' L -50 34 Z', '#3a0e1c'));
    t += piv(id + 'M', GONDS[0], GONDS[1], mach + repere(id + 'Bv', -100, 32));
  } else {
    var avJ = rotP([-132, 18], GONDS, a0);
    t += F('M-56 10 L -136 8 L ' + pt(avJ) + ' L -52 26 Z', '#3a0e1c') + '<g transform="rotate(' + a0 + ' ' + GONDS[0] + ' ' + GONDS[1] + ')">' + mach + '</g>';
  }
  var TETE = 'M-24 -34 C -48 -46 -84 -40 -106 -26 C -122 -16 -134 -6 -142 0 C -149 6 -147 13 -139 14 C -116 17 -86 19 -62 18 C -38 18 -18 8 -18 -8 C -18 -20 -20 -28 -24 -34 Z';
  t += pw(TETE, g(poil));
  t += F('M-20 4 L -8 10 L -16 16 L -4 24 L -20 24 L -14 34 L -32 26 Z', g(poil));
  if(avant) t += poils(-64, -12, 34, 16, roi ? 44 : 16, sd + 13, 1.4, fH, fB);
  t += F('M-138 2 C -116 -10 -90 -24 -64 -32 C -84 -20 -108 -6 -126 6 Z', clair(poil, .5), fo(.3));
  t += F('M-136 12 C -110 14 -84 16 -62 16 C -60 10 -66 6 -74 8 C -96 10 -118 10 -136 12 Z', '#120a1e', fo(.25));
  if(lum > .05) t += L('M-102 -28 C -80 -42 -50 -46 -28 -36', LUNE, 2.2 * k * .8, so(r3(.55 * lum)));
  /* dents du haut */
  if(r.bouche !== 'fermee'){
    t += pw('M-138 13 L -130 14 L -128 31 L -136 28 Z', '#f3e3a0', wO * .7) + pw('M-129 14 L -122 15 L -121 27 L -127 25 Z', '#e4d08a', wO * .7);
    if(avant) t += L('M-136 16 L -134 26', '#fffbe0', k * .8, so(.8));
  }
  /* museau, moustaches */
  t += El(-143, 5, 7.5, 6.5, g(rose), ' stroke="' + O + '" stroke-width="' + f1(wO) + '"') + C(-147, 7, 1.8, '#4a1222') + C(-141, 2, 2, '#fff', fo(.75));
  t += F(rond(-126, 6, 1.3) + rond(-120, 10, 1.3) + rond(-114, 6, 1.3) + rond(-122, 2, 1.3), '#2a1a26');
  t += L('M-122 4 C -146 -6 -166 -12 -190 -12 M-120 8 C -146 6 -168 10 -192 16 M-118 10 C -138 18 -154 28 -170 40 M-114 2 C -126 -16 -138 -26 -154 -34', sombre('#e8e0ec', dk * .6), 1.1 * k * .9, so(.85));
  /* l'œil jaune qui luit (rouge quand ils enragent : variante) */
  var rh = roi ? 30 : 24, AM = 'M-98 -10 C -92 -22 -74 -24 -68 -16 C -72 -6 -88 -2 -98 -10 Z';
  t += C(-84, -12, rh, G.haloJ, fo(roi ? .8 : .7)) + vari('rage', C(-84, -12, rh * 1.2, G.haloR, fo(.9)));
  t += F(AM, G.oeilJ) + vari('rage', F(AM, G.oeilR));
  t += F('M-83 -22 C -81 -18 -81 -8 -83 -4 C -85 -8 -85 -18 -83 -22 Z', '#2a0408') + F(rond(-89, -15, 2.6), '#fff') + F(rond(-75, -10, 1.2), '#fff', fo(.7));
  if(roi) t += '<g' + D.clip(AM) + '>' + piv('roiL', -83, -24, F('M-100 -24 L -66 -24 L -66 -3 C -78 -1 -90 -1 -100 -3 Z', g(sombre(poil, .12))) + L('M-100 -3 C -90 -1 -78 -1 -66 -3', O, 2)) + '</g>';
  t += L(AM, O, wO * .85);
  var sourcil = pw('M-104 -18 C -90 -32 -70 -32 -58 -24 L -62 -18 C -74 -22 -90 -20 -100 -12 Z', g(sombre(poil, .5)));
  t += roi ? piv('roiS', -80, -24, sourcil) : sourcil;
  if(roi) t += L('M-100 -42 L -72 4', '#e8b8c4', 2.4 * k, so(.85)) + L('M-95 -34 l 7 -2 M-89 -24 l 7 -2 M-82 -13 l 7 -2', '#e8b8c4', 1.4 * k, so(.75));
  /* la grande oreille : peau fine, veines, bord déchiré pour le roi */
  var oreille = roi ? 'M-44 -34 C -60 -62 -46 -88 -22 -88 C -2 -86 4 -70 -2 -56 L -10 -58 L -8 -48 C -12 -42 -16 -38 -22 -34 Z' : 'M-44 -34 C -60 -62 -46 -88 -22 -88 C 0 -86 6 -60 -12 -38 Z';
  t += pw(oreille, g(poil)) + F('M-38 -38 C -50 -60 -40 -78 -24 -78 C -10 -76 -6 -60 -18 -42 Z', D.halo(sombre('#ffc8d2', dk), sombre('#d47a8e', dk)));
  if(avant) t += L('M-30 -42 C -28 -54 -26 -64 -22 -72 M-26 -58 C -22 -60 -16 -60 -12 -58', sombre('#b8546a', dk), 1.2 * k * .8, so(.7));
  if(lum > .05) t += L('M-40 -66 C -32 -84 -12 -88 -4 -74', LUNE, 2.2 * k * .8, so(r3(.6 * lum)));
  t += vari('gel', F(TETE, G.glace) + L('M-130 14 l -2 10 M-112 18 l 0 12 M-94 19 l 2 10', '#e8f8ff', 2.4 * k));
  t += repere(id + 'O', -84, -12) + repere(id + 'B', -130, 22);
  if(roi){
    t += piv('roiC', -66, -52, couronne(D, k) + repere('roiCG', -60, -50));
    t += etoilesDessin(D, 'et', -70, -120, 54, 5, 13);
  }
  out += piv(id + 'T', -28, -4, t);
  /* ---- la patte avant proche (pièce idP), devant le poitrail ---- */
  var fn = po.fn, pa = pw(tube(fn, roi ? [27, 20, 13, 9] : [22, 16, 11, 8]), g(poil));
  if(avant) pa += poils(fn[1][0] - 2, fn[1][1] - 6, 7, 12, roi ? 14 : 6, sd + 21, 1.3, fH, fB) + F('M' + pt([fn[1][0] + 5, fn[1][1] - 2]) + ' l 8 4 l -6 3 l 7 5 l -9 0 Z', g(poil));
  if(lum > .05 && avant) pa += L('M' + pt([fn[0][0] + 6, fn[0][1] - 8]) + ' Q ' + pt([fn[1][0] + 10, fn[1][1] - 6]) + ' ' + pt([fn[1][0] + 7, fn[1][1] + 4]), LUNE, 1.8 * k * .8, so(r3(.45 * lum)));
  pa += patte(fn[3], fn[2], g(rose), wO * .7, niv);
  if(avant){
    var px = fn[3][0], py = fn[3][1];
    pa += vari('colle', F('M' + f1(px - 14) + ' ' + f1(py + 6) + ' C ' + f1(px - 16) + ' ' + f1(py - 6) + ' ' + f1(px - 6) + ' ' + f1(py - 10) + ' ' + f1(px) + ' ' + f1(py - 9) + ' C ' + f1(px + 8) + ' ' + f1(py - 10) + ' ' + f1(px + 15) + ' ' + f1(py - 5) + ' ' + f1(px + 14) + ' ' + f1(py + 6) + ' Z', '#d0e05a', ' fill-opacity=".92" stroke="#5a6420" stroke-width="' + f1(1.6 * k * .6) + '"') +
      L('M' + f1(px - 9) + ' ' + f1(py - 4) + ' Q ' + f1(px) + ' ' + f1(py - 8) + ' ' + f1(px + 9) + ' ' + f1(py - 4), '#fbffd0', 1.4 * k * .6, so(.8)));
  }
  out += piv(id + 'P', fn[0][0], fn[0][1], pa);
  /* les flammes qui restent (état brule) : deux groupes qui vacillent */
  if(r.feu) out += vari('feu', r.feu.map(function(f, i){ return '<g transform="translate(' + f[0] + ' ' + f[1] + ')">' + xp('feu' + (i % 2), 0, 0, '<ellipse cx="0" cy="' + f1(-f[2] * .3) + '" rx="' + f1(f[3] * 1.3) + '" ry="' + f1(f[2] * .6) + '" fill="' + G.lueurFeu + '"/>' + flammeDessin(G, f[2], f[3])) + '</g>'; }).join(''));
  if(roi){
    /* la colle sur le roi (roi-colle) : de gros pâtés sur le dos et la patte */
    var pate = function(x, y, e){ return '<g transform="translate(' + x + ' ' + y + ') scale(' + e + ')">' + F('M-16 6 C -18 -8 -6 -14 2 -12 C 12 -14 20 -6 18 6 C 10 12 -8 12 -16 6 Z', '#d0e05a', ' fill-opacity=".92" stroke="#5a6420" stroke-width="1.6"') + L('M-9 -6 Q 0 -10 9 -6', '#fbffd0', 1.6, so(.8)) + C(8, 0, 2.4, '#f0f8b0') + '</g>'; };
    out += vari('colleRoi', pate(-10, -52, 1.4) + pate(40, -50, 1.2) + pate(78, -18, 1.1) + pate(-40, 54, 1.2) + pate(30, 56, 1.3) + L('M-30 -50 C -34 -30 -30 -10 -36 6 M60 -40 C 64 -20 70 0 66 20', '#d8e870', 3, so(.7)));
  }
  var tr = 'rotate(' + r.rot + ') scale(' + f1(flip ? -s : s) + ' ' + f1(s) + ')';
  return '<g transform="translate(' + r.x + ' ' + r.y + ')"><g data-j="' + id + '"><g transform="' + tr + '">' + out + '</g></g></g>';
}
/* la queue d'un rat (pièce qid) : dessinée le long de l'axe x, du nœud (0) jusque sous sa croupe (L0 + 16) ;
   la pièce tourne et s'étire pour rester attachée à la croupe */
function dessinQueue(r){
  var Lq = r.L0, w = r.q.w, th = r.th0 * Math.PI / 180, sag = Lq * .09 * (Math.cos(th) >= 0 ? 1 : -1), pts = [];
  [-14 / Lq, 0, .25, .5, .75, 1, 1 + 18 / Lq].forEach(function(t){ pts.push([t * Lq, 4 * sag * t * (1 - t)]); });
  var d = 'M' + pt(pts[0]) + crs(pts), dO = 'M' + pt([pts[0][0], pts[0][1] + w * .22]) + crs(decale(pts, 0, w * .22)), dC = 'M' + pt([pts[0][0], pts[0][1] - w * .2]) + crs(decale(pts, 0, -w * .2));
  var an = '';
  for(var i = 1; i < 12; i++){ var t = i / 12, x = t * Lq, y = 4 * sag * t * (1 - t); an += 'M' + f1(x - 1.4) + ' ' + f1(y - w * .4) + ' Q ' + f1(x + 1.2) + ' ' + f1(y) + ' ' + f1(x - 1.4) + ' ' + f1(y + w * .4) + ' '; }
  var s = L(d, O, w + 4.4) + L(d, r.q.col, w) + L(dO, sombre(r.q.col, .4), w * .42, so(.5)) + L(an, sombre(r.q.col, .4), .9, so(.35)) + L(dC, clair(r.q.col, .62), Math.max(1.1, w * .2), so(.5));
  return '<g transform="translate(' + f1(r.rim[0]) + ' ' + f1(r.rim[1]) + ')"><g data-j="q' + r.id + '">' + s + '</g></g>';
}
/* le nœud des queues (fiche) : les bouts de chaque queue qui plongent dedans, et deux boucles serrées ; lache : à moitié défait */
function dessinNoeud(lache){
  var brins = [];
  RATS.forEach(function(r){
    if(!r.q) return;
    var a = r.q.ang * Math.PI / 180, u = [Math.cos(a), Math.sin(a)], t = r.q.tour, v = [-u[1] * t, u[0] * t], e = lache ? 1.3 : 1, chute = lache ? 16 : 0;
    var p1 = [K[0] + u[0] * 8 * e + v[0] * 30 * e, K[1] + u[1] * 8 * e + v[1] * 23 * e + chute * .4], p2 = [K[0] - u[0] * 28 * e + v[0] * 12 * e, K[1] - u[1] * 21 * e + v[1] * 9 * e + chute], p3 = [K[0] - u[0] * 34 * e - v[0] * 16 * e, K[1] - u[1] * 25 * e - v[1] * 13 * e + chute];
    if(lache){ p3 = lerp(p2, p3, .45); }
    brins.push({P: echant([[r.rim, p1, p2, p3]], 4), w: r.q.w, col: r.q.col});
  });
  (lache ? [[10, 54, 40, 14], [76, 40, 30, 22]] : [[0, 36, 28, 0], [70, 30, 24, 0]]).forEach(function(bq, i){
    var Pp = [], ang = bq[0] * Math.PI / 180;
    for(var t = 0; t <= 60; t++){ var u = t / 60 * Math.PI * 2, ex = Math.sin(3 * u + .4) * bq[1], ey = Math.sin(2 * u) * bq[2]; Pp.push([K[0] + ex * Math.cos(ang) - ey * Math.sin(ang), K[1] + 2 + bq[3] + ex * Math.sin(ang) + ey * Math.cos(ang)]); }
    if(lache) Pp = Pp.slice(0, 44);
    brins.push({P: Pp, w: 7.5, col: i ? '#dc94a2' : '#e8a0ae'});
  });
  return tisser(brins, K, 80);
}
/* le tas : des dos de rats tassés dans l'ombre (fiche) */
var TAS = 'M120 392 C 110 360 130 330 160 322 C 168 296 196 280 222 288 C 236 262 270 256 296 266 C 316 248 350 250 368 268 C 392 258 422 270 428 296 C 452 300 470 322 466 350 C 486 362 488 384 476 392 Z';
/* la boule (piège de la lumière) : dix rats roulés en une boule serrée, poil hérissé, queues enroulées, la couronne dessus */
function dessinBoule(D, G){
  var cx = 298, cy = 296, rx = 128, ry = 98, R = rng(77), s = '', pts = [];
  for(var i = 0; i < 46; i++){ var a = i / 46 * Math.PI * 2, f = i % 2 ? .97 : 1.09 + R() * .07; pts.push([cx + Math.cos(a) * rx * f, cy + Math.sin(a) * ry * f]); }
  s += El(cx, SOL, 150, 16, G.ombre);
  s += Pw('M' + pts.map(pt).join(' L ') + ' Z', D.g('#3e3248', .9), 3);
  s += El(cx, cy, rx * .95, ry * .95, D.rad([[0, '#7a6a86'], [.55, '#4a3e56'], [1, '#1e1628']], .64, .3, .8));
  s += poils(cx, cy, rx * .86, ry * .82, 110, 19, 1.6, '#a898b8', '#140c1c');
  /* les dos de rats roulés : des crêtes sombres qui s'enroulent */
  s += L('M196 262 C 226 218 300 206 352 230 M188 318 C 228 352 300 362 362 342 M382 262 C 404 292 398 330 372 354 M214 288 C 240 308 282 312 304 296', '#140c1c', 3, so(.55));
  /* les queues enroulées autour */
  [['M178 300 C 172 250 230 196 300 198 C 360 200 404 236 412 270', '#e49aaa'], ['M200 360 C 250 392 352 388 404 340', '#dc94a2'], ['M412 300 C 432 320 420 352 396 362', '#e8a4b0']].forEach(function(q){
    s += L(q[0], O, 10.4) + L(q[0], q[1], 6) + L(q[0], clair(q[1], .6), 1.6, so(.6));
  });
  /* des oreilles et des pattes qui dépassent */
  [[226, 214, -30], [372, 222, 24], [420, 286, 70], [180, 284, -70]].forEach(function(o){
    s += '<g transform="translate(' + o[0] + ' ' + o[1] + ') rotate(' + o[2] + ')">' + Pw('M-12 6 C -18 -10 -8 -24 4 -22 C 14 -20 16 -6 10 6 Z', D.g('#5a4c64'), 2.4) + F('M-8 4 C -12 -8 -4 -18 4 -16 C 10 -14 10 -4 6 4 Z', '#d47a8e', fo(.8)) + '</g>';
  });
  [[246, 386, 10], [330, 390, -8], [392, 370, -30]].forEach(function(o){
    s += '<g transform="translate(' + o[0] + ' ' + o[1] + ') rotate(' + o[2] + ')">' + Pw('M-9 -4 C -10 4 -4 9 4 8 C 10 7 11 0 8 -5 Z', '#e49aaa', 2.2) + L('M-6 6 l -3 5 M0 8 l -1 6 M6 6 l 1 5', '#1a1220', 1.6) + '</g>';
  });
  /* des yeux fermés, serrés */
  [[262, 262], [336, 270], [300, 330], [232, 322]].forEach(function(e){ s += L('M' + (e[0] - 7) + ' ' + e[1] + ' Q ' + e[0] + ' ' + (e[1] + 5) + ' ' + (e[0] + 7) + ' ' + e[1], '#1a0a14', 2.4); });
  /* deux yeux qui guettent (ils clignent : pièces x-) */
  [[372, 300, 'b1'], [214, 252, 'b2']].forEach(function(e){
    s += xp(e[2], e[0], e[1], C(e[0], e[1], 14, G.haloJ, fo(.7)) + F('M' + (e[0] - 7) + ' ' + e[1] + ' q 7 -6 14 0 q -7 5 -14 0 Z', G.oeilJ, ' stroke="' + O + '" stroke-width="1.4"') + F('M' + e[0] + ' ' + (e[1] - 4) + ' q 1 4 0 8 q -1 -4 0 -8 Z', '#2a0408'));
  });
  s += L('M330 206 C 380 214 420 248 426 290', LUNE, 2.6, so(.5));
  /* la couronne, posée dessus de travers */
  s += '<g transform="translate(296 196) rotate(-10) scale(1.1) translate(66 52)">' + couronne(D, 1 / 1.1) + '</g>';
  s += repere('hautB', 298, 150) + repere('pfB', 298, 296);
  return s;
}

function dessinerRoi(D){
  var G = this.G, self = this;
  G.ombre = D.doux('#05030a', .7);
  G.lueurFeu = D.doux('#ffb040', .5);
  G.haloJ = D.halo('#fff4b0', '#ffc020');
  G.haloR = D.halo('#ffb0a0', '#ff2a2a');
  G.oeilJ = D.rad([[0, '#fffbd0'], [.45, '#f2c42a'], [1, '#7a4a08']], .45, .45, .6);
  G.oeilR = D.rad([[0, '#fff2a0'], [.45, '#ff4a2a'], [1, '#7a0a14']], .45, .45, .6);
  var s = '';
  /* le sol de l'ossuaire : deux os (fiche) et l'emplacement des flaques */
  s += slot('sol');
  s += Pw('M470 392 L 520 384 C 522 378 530 378 532 383 C 536 382 540 388 535 391 C 538 394 534 400 529 397 C 527 402 520 400 520 395 L 472 402 C 470 407 462 406 462 401 C 457 401 455 394 460 392 C 458 386 466 384 470 392 Z', D.g('#d8ccb0'), 2.4);
  s += Pw('M14 398 L 50 392 C 52 387 58 388 58 392 C 62 392 63 398 58 399 C 59 403 53 405 51 401 L 16 405 C 14 410 7 408 8 403 C 3 402 4 396 9 396 C 9 391 15 392 14 398 Z', D.g('#cfc2a4'), 2.4);
  /* ---- la masse (pièce « masse », pivot au sol) : le tas, les queues, le nœud, les dix rats ---- */
  var m = '';
  m += vari('ombre', '<ellipse cx="282" cy="394" rx="256" ry="19" fill="#000" fill-opacity=".5"/>', 1);
  var rats = '';
  /* le tas (pièce « tas ») */
  rats += piv('tas', 300, 392, Pw(TAS, D.g('#2e2436', .8), 3) + poils(300, 330, 170, 56, 80, 5, 1.6, '#55465e', '#0e0814') +
    L('M164 322 C 176 300 200 288 222 290 M226 286 C 244 264 272 260 294 268 M300 264 C 322 250 350 254 366 270 M372 268 C 396 262 420 276 426 296', LUNE, 1.8, so(.22)) +
    vari('gel', F(TAS, G.glace) + L('M150 330 l -4 14 M220 292 l 0 16 M300 268 l 2 16 M372 272 l 4 14 M440 300 l 6 12', '#e8f8ff', 3)));
  /* le dixième rat, qui pointe le nez entre les autres */
  rats += dessinRat(D, G, RAT.r7);
  /* les queues, la lueur pâle sous le nœud, son ombre, le nœud (pièce « noeud ») */
  rats += El(K[0], K[1] + 4, 78, 58, D.halo('#ffd8e0', '#ff8aa8'), fo(.3)) + El(K[0], K[1] + 42, 56, 10, '#000', fo(.45));
  QUEUES.forEach(function(id){ rats += dessinQueue(RAT[id]); });
  var tension = '';
  for(var i = 0; i < 8; i++){ var a = i / 8 * Math.PI * 2 + .2, ra = 58, rb = 72 + (i % 2) * 8; tension += 'M' + f1(K[0] + Math.cos(a) * ra) + ' ' + f1(K[1] + Math.sin(a) * ra * .78) + ' L ' + f1(K[0] + Math.cos(a) * rb) + ' ' + f1(K[1] + Math.sin(a) * rb * .78) + ' '; }
  rats += piv('noeud', K[0], K[1], vari('noeud', dessinNoeud(false) + El(K[0] - 14, K[1] + 20, 46, 26, D.halo('#1a0a20', '#1a0a20'), fo(.45)) +
    L('M' + (K[0] - 34) + ' ' + (K[1] - 22) + ' C ' + (K[0] - 12) + ' ' + (K[1] - 40) + ' ' + (K[0] + 20) + ' ' + (K[1] - 38) + ' ' + (K[0] + 40) + ' ' + (K[1] - 20), LUNE, 2.2, so(.45)), 1) +
    vari('tension', xp('tension', K[0], K[1], L(tension, O, 6) + L(tension, '#ffffff', 2.8) + C(K[0] + 52, K[1] - 46, 5, '#bfe8ff', ' stroke="' + O + '" stroke-width="1.6"') + C(K[0] - 56, K[1] - 40, 4, '#bfe8ff', ' stroke="' + O + '" stroke-width="1.6"'))) +
    vari('gel', El(K[0], K[1], 70, 50, G.glace) + L('M' + (K[0] - 40) + ' ' + (K[1] + 36) + ' l 3 16 l 4 -16 M' + (K[0] - 6) + ' ' + (K[1] + 46) + ' l 3 20 l 4 -20 M' + (K[0] + 30) + ' ' + (K[1] + 38) + ' l 3 14 l 4 -14', '#e8f8ff', 3)) +
    repere('pf', K[0], K[1]));
  /* des yeux qui brillent dans les trous du tas (ils clignent : pièces x-), jumelés au tas */
  var yeux = '';
  [[282, 280, .85, 'trou1'], [334, 286, .95, 'trou2']].forEach(function(e){
    yeux += xp(e[3], e[0], e[1], C(e[0], e[1], 15, G.haloJ, fo(.55)) + '<path d="M' + (e[0] - 11) + ' ' + (e[1] - 1) + ' q 4 -4 8 0 q -4 3 -8 0 Z M' + (e[0] + 3) + ' ' + (e[1] + 1) + ' q 4 -4 8 0 q -4 3 -8 0 Z" fill="#ffd040" stroke="#fff0b0" stroke-width=".7" fill-opacity="' + e[2] + '"/>');
  });
  rats += piv('tas', 300, 392, yeux);
  /* les rats, du fond vers le devant ; l'ombre du roi sur le tas (cachée quand il est renversé) */
  ORDRE.forEach(function(id){
    if(id === 'roi') rats += vari('ombreRoi', El(306, 238, 132, 40, G.ombre), 1);
    rats += dessinRat(D, G, RAT[id]);
  });
  m += vari('rats', rats, 1);
  /* le nœud à moitié défait (point faible ouvert), par-dessus : il brille et palpite */
  var lueur = El(K[0], K[1] + 6, 96, 74, D.doux('#ffe0ea', .95)) + El(K[0], K[1] + 6, 60, 46, D.doux('#fff6c0', .9));
  var eclats = '';
  for(var j = 0; j < 6; j++){ var b = j / 6 * Math.PI * 2 + .3; eclats += '<g transform="translate(' + f1(K[0] + Math.cos(b) * 74) + ' ' + f1(K[1] + 6 + Math.sin(b) * 56) + ')"><path d="' + eclatD(9) + '" fill="#ffffff"/></g>'; }
  m += piv('noeudL', K[0], K[1] + 10, vari('lache', xp('pulseA', K[0], K[1] + 6, lueur) + dessinNoeud(true) + xp('pulseB', K[0], K[1] + 6, '<ellipse cx="' + K[0] + '" cy="' + (K[1] + 6) + '" rx="70" ry="54" fill="none" stroke="#fff8d0" stroke-width="4" stroke-dasharray="10 9"/>' + eclats) + repere('pfL', K[0], K[1] + 8)));
  /* la boule (piège de la lumière) */
  m += piv('boule', 298, SOL, vari('boule', dessinBoule(D, G)));
  m += repere('centre', 296, 290) + repere('pieds', 292, SOL) + repere('haut', 292, 30) + repere('avant', 60, 340);
  s += piv('masse', 292, SOL, m);
  /* les restes (couronne tombée, cendres) et les particules, dans le repère fixe */
  s += slot('fixe') + slot('monde');
  return sansOpacite(s);
}

/* =====================================================================
   B. Les poses
   ===================================================================== */
/* les rats s'écartent du nœud (d > 0) ou s'en rapprochent : o.dy (vers le bas), o.lean (penchés en avant, en tirant),
   o.sy (aplatis), o.tete (angle de la tête : > 0 museau en l'air), o.bouche (ouverture des mâchoires) */
function poseDehors(d, o){
  o = o || {};
  var p = {};
  PETITS.forEach(function(id){
    var r = RAT[id], k = o.k && o.k[id] != null ? o.k[id] : 1;
    p[id] = {x: r1(r.u[0] * d * k), y: r1(r.u[1] * d * .6 * k + (o.dy || 0)), a: r1((o.lean || 0) * r.f), sy: o.sy || 1, sx: o.sx || 1};
    if(o.tete != null) p[id + 'T'] = {a: o.tete};
    if(o.bouche != null && r.jaw) p[id + 'M'] = {a: o.bouche};
  });
  return p;
}
var RENVERSE = {roi: {x: 22, y: 86, a: 158}, roiT: {a: 16}, roiP: {a: -70}, roiPF: {a: -50}, roiC: {a: 22, x: -4, y: 2}, roiM: {a: -24}, roiS: {y: -2}};
var POSES = {
  noeud: reunir(poseDehors(30, {lean: 10, tete: -6, bouche: -22}), {roi: {y: 8, a: 6}, roiT: {a: -6}, roiP: {a: 14}, roiM: {a: -6}, noeud: {s: .86}, tas: {sy: .92}}),
  /* (les deux rats du dessus, sur le dos du roi, dégringolent avec lui sur les côtés) */
  ouvert: reunir(poseDehors(54, {lean: 14, dy: 6, tete: 4, bouche: -30}), RENVERSE, {tas: {sy: .8, sx: 1.04}, r8: {x: 52, y: 44, a: 26}, r6: {x: 40, y: 62, a: -14}}),
  etale: reunir(poseDehors(24, {dy: 8, sy: .9, tete: -8, bouche: -22}), {roi: {y: 24, a: -6, sy: .94}, roiT: {a: -10}, roiM: {a: -24}, tas: {sy: .84, sx: 1.08}}),
  colle: reunir(poseDehors(-8, {dy: 4, sy: .96}), {roi: {y: 8}, tas: {sy: .94}}),
  boule: reunir(poseDehors(-60, {sy: .8, sx: .8, tete: -20}), {roi: {y: 60, s: .8}}),
  dos: RENVERSE,
  ebloui: reunir(poseDehors(0, {tete: -16}), {roiP: {a: 104, x: -12, y: -14}, roiT: {a: -10}, roiL: {sy: .7}}),
  enrage: reunir(poseDehors(0, {tete: -6, bouche: -30}), {roiS: {y: 4, a: 8}, roiT: {a: -5}, roiM: {a: -24}, roiL: {sy: .3}}),
  cible: reunir(poseDehors(0, {tete: 6}), {roiT: {a: -3}, roiS: {y: 2, a: 4}})
};

/* =====================================================================
   C. La pose de base de chaque état, l'attente, les états
   ===================================================================== */
R._base = function(){
  var e = this.etat, p = {}, n;
  for(n in REPOS) p[n] = fusion(Z, REPOS[n]);
  function mettre(o){ for(var k in o) p[k] = fusion(p[k] || Z, o[k]); }
  if(e.boule) mettre(POSES.boule);
  else {
    if(e.ouvert) mettre(POSES.ouvert);
    else if(e.noeud) mettre(POSES.noeud);
    else if(e.etale) mettre(POSES.etale);
    else if(e.colle) mettre(POSES.colle);
    if(e.dos && !e.ouvert) mettre(POSES.dos);
    if(e.ebloui) mettre(POSES.ebloui);
    else if(e.enrage) mettre(POSES.enrage);
    else if(e.cible) mettre(POSES.cible);
  }
  /* les queues suivent les croupes, les gueules suivent les mâchoires */
  QUEUES.forEach(function(id){ p['q' + id] = this._queueC(RAT[id], appliquer(p[id] || Z, RAT[id].c0)); }, this);
  MACHOIRES.forEach(function(id){ p[id + 'G'] = {sy: syGueule((p[id + 'M'] || REPOS[id + 'M']).a)}; });
  return p;
};
/* les boucles d'attente : la masse grouille (chaque rat respire et remue à son rythme), quelques museaux reniflent,
   le roi menace ; tout est décalé pour que ça grouille sans jamais battre ensemble */
R._lancerBoucles = function(){
  var e = this.etat, EI = 'ease-in-out', self = this;
  this.vitesse = e.enrage ? 1.6 : (e.noeud || e.etale ? 1.25 : 1);
  var b = this._boucleur();
  if(e.boule){
    b('boule', [[0, {a: 0, y: 0, sy: 1}], [.25, {a: -2.5, y: -3, sy: 1.02}], [.5, {a: 0, y: 0, sy: .98}], [.75, {a: 2.5, y: -2, sy: 1.02}], [1, {a: 0, y: 0, sy: 1}]], 2600, EI);
    this._planifier(800);
    return;
  }
  if(e.gele){
    b('masse', [[0, {x: 0}], [.25, {x: .8}], [.5, {x: -.8}], [.75, {x: .5}], [1, {x: 0}]], 170, 'linear');
    this._planifier(900);
    return;
  }
  var R0 = rng(41), dur = e.colle ? 1.5 : 1;
  RATS.forEach(function(r, i){
    var amp = r.roi ? 1.6 : 2.4, per = (r.roi ? 2600 : hasard(700, 1150)) * dur, ra = (r.roi ? .5 : hasard(.8, 2)) * (R0() < .5 ? -1 : 1);
    if(e.ouvert && r.roi){ b('roi', [[0, {a: 0, x: 0}], [.25, {a: 3, x: 3}], [.5, {a: 0, x: 0}], [.75, {a: -3, x: -3}], [1, {a: 0, x: 0}]], 900, EI); return; }
    if(e.noeud && !r.roi){
      /* ils tirent en rythme, chacun de son côté */
      b(r.id, [[0, {x: 0, y: 0, a: 0}], [.3, {x: r1(r.u[0] * 5), y: r1(r.u[1] * 3), a: 2 * r.f}], [.55, {x: r1(r.u[0] * 1.5), y: 0, a: .5 * r.f}], [.8, {x: r1(r.u[0] * 4), y: r1(r.u[1] * 2), a: 1.6 * r.f}], [1, {x: 0, y: 0, a: 0}]], hasard(520, 760), EI, -hasard(0, 600));
      return;
    }
    b(r.id, [[0, {y: 0, a: 0, sy: 1}], [.5, {y: -amp, a: ra, sy: r.roi ? 1.012 : 1.03}], [1, {y: 0, a: 0, sy: 1}]], per, EI, -hasard(0, per));
  });
  /* les museaux qui reniflent (cinq rats), la tête du roi qui menace */
  ['r1', 'r3', 'r5', 'r2', 'r9'].forEach(function(id){
    b(id + 'T', [[0, {a: 0}], [.08, {a: 2.4}], [.14, {a: -.6}], [.2, {a: 2}], [.26, {a: 0}], [.6, {a: -1.5}], [1, {a: 0}]], hasard(1500, 2300), EI, -hasard(0, 2000));
  });
  if(!e.ouvert && !e.dos) b('roiT', [[0, {a: 0, y: 0}], [.35, {a: -2.4, y: 1}], [.7, {a: .8, y: 0}], [1, {a: 0, y: 0}]], 3400, EI);
  else b('roiP', [[0, {a: -16}], [.5, {a: 16}], [1, {a: -16}]], 520, EI);
  b('roiM', [[0, {a: 0}], [.5, {a: -4}], [1, {a: 0}]], 2600, EI);
  if(e.ouvert || e.dos) b('roiPF', [[0, {a: 14}], [.5, {a: -14}], [1, {a: 14}]], 600, EI, -200);
  /* des pattes qui grattent */
  ['r1', 'r3'].forEach(function(id){ b(id + 'P', [[0, {a: 0}], [.3, {a: -10}], [.5, {a: 3}], [.7, {a: -8}], [1, {a: 0}]], hasard(900, 1300), EI, -hasard(0, 900)); });
  /* le tas respire ; le nœud tressaille */
  b('tas', [[0, {sy: 1, sx: 1}], [.5, {sy: 1.025, sx: .995}], [1, {sy: 1, sx: 1}]], e.etale ? 900 : 1900, EI);
  if(e.noeud) b('noeud', [[0, {x: 0, y: 0}], [.25, {x: 1.5, y: -1}], [.5, {x: -1, y: 1}], [.75, {x: 1, y: 1}], [1, {x: 0, y: 0}]], 180, 'linear');
  if(e.enrage) b('masse', [[0, {x: 0, y: 0}], [.25, {x: 1.2, y: -.5}], [.5, {x: -1.2, y: .4}], [.75, {x: .7, y: .3}], [1, {x: 0, y: 0}]], 150, 'linear');
  else if(e.cible) b('masse', [[0, {x: 0}], [.5, {x: .6}], [1, {x: 0}]], 260, 'linear');
  this._planifier(400);
};
/* les boucles autonomes (yeux dans les trous, flammes, point faible, étoiles) */
R._lancerX = function(){
  this._couperX('trou');
  this._boucleX('trou1', [{transform: 'scale(1,1)'}, {offset: .9, transform: 'scale(1,1)'}, {offset: .94, transform: 'scale(1,.1)'}, {transform: 'scale(1,1)'}], 3100, {delai: -800});
  this._boucleX('trou2', [{transform: 'scale(1,1)'}, {offset: .86, transform: 'scale(1,1)'}, {offset: .9, transform: 'scale(1,.1)'}, {offset: .95, transform: 'scale(1,1)'}, {offset: .97, transform: 'scale(1,.1)'}, {transform: 'scale(1,1)'}], 4300);
};
R._relancerEtats = function(){
  var e = this.etat;
  if(e.brule) this._feuX(true);
  if(e.ouvert) this._pulseX(true);
  if(e.ebloui) this._etoiles(true);
  if(e.noeud) this._tensionX(true);
  if(e.boule) this._bouleX(true);
};
/* les petits gestes de l'attente, au hasard */
R._evenement = function(){
  var e = this.etat, l;
  if(e.boule) l = ['bRoule', 'bRoule', 'bTremble'];
  else if(e.gele) l = ['frisson', 'souffle', 'frisson'];
  else {
    l = ['pointe', 'pointe', 'pointe', 'renifle', 'renifle', 'tire', 'tire', 'couine', 'couine', 'gratte', 'r7', 'r7', 'regard', 'bave', 'grimpe', 'cligne'];
    if(e.noeud) l = ['tire', 'tire', 'tire', 'couine', 'pointe', 'tension'];
    else if(e.ouvert || e.dos) l = ['gigote', 'gigote', 'couine', 'tire', 'pointe', 'cligne'];
    else if(e.etale) l = ['halete', 'halete', 'pointe', 'couine', 'r7'];
    else if(e.colle) l = ['colleTire', 'colleTire', 'couine', 'pointe', 'renifle'];
    if(e.ebloui) l = ['couine', 'pointe', 'renifle'];
    if(e.enrage) l = l.concat(['regard', 'couine', 'grogne', 'grogne']);
    if(e.brule) l = l.concat(['sursaut', 'sursaut']);
  }
  this._joue(choisir(l));
};
R._unRat = function(l){ return RAT[choisir(l || PETITS.filter(function(id){ return id !== 'r7'; }))]; };
R._joue = function(ev){
  var self = this, A = {ajout: true, vitesse: this.vitesse}, e = this.etat, r, p, o;
  switch(ev){
    case 'pointe':
      /* une tête qui pointe : le rat tend le cou, regarde, renifle, se recouche */
      r = this._unRat();
      p = {}; p[r.id] = {y: -5, a: -2 * r.f}; p[r.id + 'T'] = {a: 12};
      o = {}; o[r.id] = {y: 0, a: 0}; o[r.id + 'T'] = {a: 0};
      var z = {}; z[r.id + 'T'] = {a: 9};
      this._seq([{t: 0, p: o}, {t: .25, p: p, e: 'cubic-bezier(.2,.8,.3,1)'}, {t: .4, p: z}, {t: .5, p: p}, {t: .62, p: z}, {t: .75, p: p}, {t: 1, p: o}], 1300, A);
      break;
    case 'renifle':
      r = this._unRat();
      var ks = [{t: 0, p: {}}];
      for(var i = 1; i < 9; i++){ var q = {}; q[r.id + 'T'] = {a: i % 2 ? 3 : -1, y: i % 2 ? -1 : 0}; ks.push({t: i / 10, p: q, e: 'ease-in-out'}); }
      var q0 = {}; q0[r.id + 'T'] = {a: 0, y: 0}; ks.push({t: 1, p: q0}); ks[0].p = q0;
      this._seq(ks, 760, A);
      break;
    case 'tire':
      /* une queue qui tire sur le nœud : le rat se penche en arrière, la queue s'étire, le nœud est tiré vers lui */
      r = RAT[choisir(QUEUES)];
      var dx = r1(r.u[0] * 10), dy = r1(r.u[1] * 6);
      p = {}; p[r.id] = {x: dx, y: dy, a: 4 * r.f}; o = {}; o[r.id] = {x: 0, y: 0, a: 0};
      this._seq([{t: 0, p: o}, {t: .3, p: p, e: 'cubic-bezier(.3,.6,.4,1)'}, {t: .45, p: {}}, {t: .55, p: (function(){ var w = {}; w[r.id] = {x: dx * .7, y: dy * .7, a: 3 * r.f}; return w; })()}, {t: .7, p: p}, {t: 1, p: o, e: 'cubic-bezier(.5,0,.3,1)'}], 1100, A);
      this._seq([{t: 0, p: {noeud: {x: 0, y: 0}}}, {t: .3, p: {noeud: {x: r1(r.u[0] * 3), y: r1(r.u[1] * 2)}}}, {t: .7, p: {noeud: {x: r1(r.u[0] * 3.5), y: r1(r.u[1] * 2.5)}}}, {t: 1, p: {noeud: {x: 0, y: 0}}}], 1100, A);
      if(r.jaw) this._mordiller(r, 1100);
      break;
    case 'couine':
      r = this._unRat(MACHOIRES.filter(function(id){ return id !== 'roi'; }));
      this._ouvrir(r, -36, 520, A);
      this._seq([{t: 0, p: (function(){ var w = {}; w[r.id + 'T'] = {a: 0}; return w; })()}, {t: .3, p: (function(){ var w = {}; w[r.id + 'T'] = {a: 10}; return w; })()}, {t: 1, p: (function(){ var w = {}; w[r.id + 'T'] = {a: 0}; return w; })()}], 520, A);
      this._minuteur(function(){ self._cri(self._ou(r.id + 'B'), .8, r.f); }, 140);
      break;
    case 'gratte':
      r = RAT[choisir(['r1', 'r3', 'r5', 'r2'])];
      var g = [{t: 0, p: (function(){ var w = {}; w[r.id + 'P'] = {a: 0}; return w; })()}];
      for(var k = 1; k < 7; k++) g.push({t: k / 7, p: (function(){ var w = {}; w[r.id + 'P'] = {a: k % 2 ? -22 : 6}; return w; })()});
      g.push({t: 1, p: (function(){ var w = {}; w[r.id + 'P'] = {a: 0}; return w; })()});
      this._seq(g, 700, A);
      p = this._ou(r.id + 'B'); this._poussiere([p[0], SOL], 2, r.f, .6);
      break;
    case 'r7':
      /* le dixième rat sort la tête de son trou, regarde à droite, à gauche… et replonge */
      this._seq([{t: 0, p: {r7: {y: 0, x: 0}, r7T: {a: 0}}}, {t: .2, p: {r7: {y: -16, x: -4}, r7T: {a: 10}}, e: 'cubic-bezier(.2,.9,.3,1.3)'}, {t: .45, p: {r7T: {a: -8}}}, {t: .65, p: {r7T: {a: 12}}}, {t: .8, p: {r7: {y: -14}}}, {t: 1, p: {r7: {y: 0, x: 0}, r7T: {a: 0}}, e: 'cubic-bezier(.6,0,.9,.5)'}], 1500, A);
      break;
    case 'regard':
      /* le roi regarde les héros d'un air mauvais : il baisse la tête, fronce le sourcil, plisse l'œil, grogne */
      this._seq([{t: 0, p: {roiT: {a: 0}, roiS: {y: 0, a: 0}, roiL: {sy: 1}, roi: {x: 0}}}, {t: .2, p: {roiT: {a: -5}, roiS: {y: 4, a: 9}, roiL: {sy: 14}, roi: {x: -4}}, e: 'cubic-bezier(.2,.8,.3,1)'}, {t: .8, p: {roiT: {a: -5}, roiS: {y: 4, a: 9}, roiL: {sy: 14}, roi: {x: -4}}}, {t: 1, p: {roiT: {a: 0}, roiS: {y: 0, a: 0}, roiL: {sy: 1}, roi: {x: 0}}}], 1900, A);
      this._ouvrir(RAT.roi, -8, 1900, A);
      this._minuteur(function(){ var q2 = self._ou('roiB'); for(var n = 0; n < 2; n++) self._bouffee([q2[0] - 10, q2[1] - 14], {r: 5, grad: self.G.vapeur, op: .7, dx: hasard(-34, -18), dy: hasard(-14, -4), duree: 700, delai: n * 140, s1: 2.4}); }, 500);
      break;
    case 'cligne':
      this._seq([{t: 0, p: {roiL: {sy: 1}}}, {t: .35, p: {roiL: {sy: 34}}, e: 'ease-in'}, {t: .6, p: {roiL: {sy: 34}}}, {t: 1, p: {roiL: {sy: 1}}, e: 'ease-out'}], 420, A);
      break;
    case 'bave':
      /* une goutte de bave s'étire et tombe de la lèvre du roi */
      p = this._ou('roiBv');
      this._goutteTombe([p[0], p[1] + 4], {coul: '#d8f0ff', sol: SOL - 4});
      this._ouvrir(RAT.roi, -6, 900, A);
      break;
    case 'grimpe':
      /* un rat du dessus remonte la pente du dos du roi et glisse */
      this._seq([{t: 0, p: {r8: {x: 0, y: 0, a: 0}, r8P: {a: 0}}}, {t: .35, p: {r8: {x: -8, y: -6, a: -4}, r8P: {a: -20}}}, {t: .5, p: {r8P: {a: 8}}}, {t: .65, p: {r8: {x: -10, y: -7, a: -5}, r8P: {a: -16}}}, {t: 1, p: {r8: {x: 0, y: 0, a: 0}, r8P: {a: 0}}, e: 'cubic-bezier(.6,0,.9,.6)'}], 1400, A);
      break;
    case 'halete':
      /* étalés, ils halètent */
      var h = [{t: 0, p: {}}];
      MACHOIRES.forEach(function(id){ h[0].p[id + 'M'] = {a: 0}; });
      for(var n2 = 1; n2 < 6; n2++){ var w2 = {}; MACHOIRES.forEach(function(id){ w2[id + 'M'] = {a: n2 % 2 ? -8 : 0}; }); h.push({t: n2 / 6, p: w2}); }
      var w3 = {}; MACHOIRES.forEach(function(id){ w3[id + 'M'] = {a: 0}; }); h.push({t: 1, p: w3});
      this._seq(h, 900, A);
      this._seq([{t: 0, p: {tas: {sy: 1}}}, {t: .25, p: {tas: {sy: 1.04}}}, {t: .5, p: {tas: {sy: 1}}}, {t: .75, p: {tas: {sy: 1.04}}}, {t: 1, p: {tas: {sy: 1}}}], 900, A);
      break;
    case 'gigote':
      var gg = [{t: 0, p: {roiP: {a: 0}, roiPF: {a: 0}, roiT: {a: 0}}}];
      for(var k2 = 1; k2 < 8; k2++) gg.push({t: k2 / 8, p: {roiP: {a: k2 % 2 ? 26 : -20}, roiPF: {a: k2 % 2 ? -22 : 18}, roiT: {a: k2 % 2 ? 5 : -4}}});
      gg.push({t: 1, p: {roiP: {a: 0}, roiPF: {a: 0}, roiT: {a: 0}}});
      this._seq(gg, 900, A);
      this._minuteur(function(){ self._cri(self._ou('roiB'), 1, 1); }, 200);
      break;
    case 'tension':
      this._seq([{t: 0, p: {noeud: {s: 1}}}, {t: .2, p: {noeud: {s: .94}}}, {t: .4, p: {noeud: {s: 1.03}}}, {t: .6, p: {noeud: {s: .96}}}, {t: 1, p: {noeud: {s: 1}}}], 600, A);
      break;
    case 'colleTire':
      r = RAT[choisir(['r1', 'r3', 'r5', 'r2'])];
      var c0 = {}, c1 = {}, c2 = {}; c0[r.id + 'P'] = {a: 0}; c0[r.id] = {y: 0}; c1[r.id + 'P'] = {a: -26}; c1[r.id] = {y: -4}; c2[r.id + 'P'] = {a: -18}; c2[r.id] = {y: -2};
      this._seq([{t: 0, p: c0}, {t: .3, p: c1, e: 'cubic-bezier(.3,.6,.5,1)'}, {t: .45, p: c2}, {t: .62, p: c1}, {t: .75, p: c0, e: 'cubic-bezier(.7,0,1,.6)'}, {t: 1, p: c0}], 1300, A);
      p = this._ou(r.id + 'B'); this._minuteur(function(){ self._cri(self._ou(r.id + 'B'), .7, r.f); }, 300);
      break;
    case 'grogne':
      var gr = [{t: 0, p: {roi: {x: 0}, roiT: {a: 0}}}];
      for(var k3 = 1; k3 < 8; k3++) gr.push({t: k3 / 8, p: {roi: {x: k3 % 2 ? 2 : -2}, roiT: {a: k3 % 2 ? -2 : 1}}, e: 'linear'});
      gr.push({t: 1, p: {roi: {x: 0}, roiT: {a: 0}}});
      this._seq(gr, 800, A);
      this._ouvrir(RAT.roi, -14, 800, A);
      break;
    case 'sursaut':
      r = RAT[choisir(['r1', 'r3', 'r5', 'roi'])];
      var s0 = {}, s1 = {}; s0[r.id] = {y: 0, sy: 1}; s1[r.id] = {y: -12, sy: 1.05};
      this._seq([{t: 0, p: s0}, {t: .3, p: s1, e: 'cubic-bezier(.2,.8,.4,1)'}, {t: .7, p: s0, e: 'cubic-bezier(.6,0,.9,.5)'}, {t: 1, p: s0}], 620, A);
      this._minuteur(function(){ self._cri(self._ou(r.id + 'B'), .8, r.f); }, 100);
      break;
    case 'frisson':
      var fr = [{t: 0, p: {masse: {x: 0}}}];
      for(var k4 = 1; k4 < 12; k4++) fr.push({t: k4 / 12, p: {masse: {x: k4 % 2 ? 2 : -2}}, e: 'linear'});
      fr.push({t: 1, p: {masse: {x: 0}}});
      this._seq(fr, 600, A);
      break;
    case 'souffle':
      p = this._ou('roiB');
      for(var v = 0; v < 3; v++) this._bouffee([p[0] - 4, p[1]], {r: 6, grad: this.G.givre, op: .75, dx: hasard(-40, -24), dy: hasard(-16, -4), duree: 1100, delai: v * 150, s1: 2.6});
      break;
    case 'bRoule':
      var sg = choisir([1, -1]);
      this._seq([{t: 0, p: {boule: {x: 0, a: 0}}}, {t: .4, p: {boule: {x: 10 * sg, a: 6 * sg}}, e: 'ease-out'}, {t: .7, p: {boule: {x: -3 * sg, a: -2 * sg}}}, {t: 1, p: {boule: {x: 0, a: 0}}}], 1400, A);
      break;
    case 'bTremble':
      var bt = [{t: 0, p: {boule: {x: 0}}}];
      for(var k5 = 1; k5 < 10; k5++) bt.push({t: k5 / 10, p: {boule: {x: k5 % 2 ? 1.6 : -1.6}}, e: 'linear'});
      bt.push({t: 1, p: {boule: {x: 0}}});
      this._seq(bt, 500, A);
      break;
  }
};
/* ouvrir la bouche d'un rat (mâchoire, en s'ajoutant à la pose) : angle a, puis elle se referme */
R._ouvrir = function(r, a, ms, A){
  if(!r.jaw) return;
  var o = {}, f = {}, z = {};
  o[r.id + 'M'] = {a: 0}; f[r.id + 'M'] = {a: a}; z[r.id + 'M'] = {a: 0};
  this._seq([{t: 0, p: o}, {t: .3, p: f, e: 'cubic-bezier(.2,.8,.3,1)'}, {t: .7, p: f}, {t: 1, p: z}], ms, A || {ajout: true});
};
/* il mordille (la queue qui tire, la flèche) */
R._mordiller = function(r, ms){
  var k = [{t: 0, p: {}}], n = r.id + 'M';
  k[0].p[n] = {a: 0};
  for(var i = 1; i < 6; i++){ var w = {}; w[n] = {a: i % 2 ? -14 : -2}; k.push({t: i / 6, p: w}); }
  var z = {}; z[n] = {a: 0}; k.push({t: 1, p: z});
  this._seq(k, ms, {ajout: true});
};

/* ---------- les états ---------- */
R.etatPublic = function(nom, on){
  on = on !== false;
  if(this.mort || !(nom in this.etat)) return Promise.resolve();
  if(this.etat[nom] === on) return Promise.resolve();
  var f = this['_e_' + nom];
  if(f) return Promise.resolve(f.call(this, on));
  this.etat[nom] = on;
  return this._changerMode();
};
/* tous les yeux virent au rouge ; la masse tremble */
R._e_enrage = function(on){
  var self = this;
  this.etat.enrage = on;
  this._fondu('rage', on ? 1 : 0, on ? 350 : 700);
  clearTimeout(this.fx.vapeur);
  if(on) (function vapeur(){
    if(self.mort || !self.etat.enrage) return;
    if(!self.etat.boule){ var p = self._ou('roiB'); for(var i = 0; i < 2; i++) self._bouffee([p[0] - 6, p[1] - 12], {r: 5, grad: self.G.vapeur, op: .75, dx: hasard(-34, -18), dy: hasard(-18, -6), duree: 700, delai: i * 120, s1: 2.6}); }
    self.fx.vapeur = setTimeout(vapeur, hasard(900, 1600));
  })();
  return this._changerMode(350);
};
/* le feu qui reste sur quelques rats : flammes (variantes qui vacillent), fumée, braises */
R._feuX = function(on){
  this._couperX('feu');
  if(on){ this._boucleX('feu0', [{transform: 'scale(1,1)'}, {offset: .35, transform: 'scale(.88,1.16)'}, {offset: .7, transform: 'scale(1.06,.92)'}, {transform: 'scale(1,1)'}], 420); this._boucleX('feu1', [{transform: 'scale(1,.92)'}, {offset: .5, transform: 'scale(.86,1.18)'}, {transform: 'scale(1,.92)'}], 330); }
};
R._e_brule = function(on){
  var self = this;
  this.etat.brule = on;
  this._fondu('feu', on ? 1 : 0, on ? 300 : 700);
  this._feuX(on);
  clearTimeout(this.fx.fumee);
  if(on) (function fumee(){
    if(self.mort || !self.etat.brule) return;
    if(!self.etat.boule){
      var r = RAT[choisir(['r1', 'r3', 'r5', 'roi'])], p = self._ou(r.id, 0, -40 * r.s);
      self._bouffee([p[0], p[1] - 20], {r: hasard(8, 13), grad: self.G.fumee, op: .55, dx: hasard(6, 30), dy: hasard(-80, -50), duree: hasard(1200, 1700), s1: 2.6});
      if(Math.random() < .5){ var b = self._fxEl('<circle r="2.4" fill="#ffd060"/>'); b.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1] - 16) + 'px)', opacity: 1}, {transform: 'translate(' + f1(p[0] + hasard(-20, 30)) + 'px,' + f1(p[1] - hasard(60, 110)) + 'px)', opacity: 0}], {duration: 900, easing: 'ease-out', fill: 'forwards'}).finished.then(oter(b), oter(b)); }
    }
    self.fx.fumee = setTimeout(fumee, hasard(260, 420));
  })();
  if(!this.enAction && this.attente){ this._couperMinuteurs(); this._planifier(200); }
  return attendreMs(on ? 300 : 700);
};
/* la colle : une flaque sous la masse, des pâtés sur les pattes ; ils restent pris en tas */
R._flaque = function(type, cx, rx){
  this._enleverFlaque(type);
  var html, sol = SOL + 2;
  if(type === 'huile') html = '<ellipse cx="' + cx + '" cy="' + sol + '" rx="' + rx + '" ry="' + f1(rx * .07) + '" fill="' + this.G.huile + '" stroke="#0a0812" stroke-width="2" fill-opacity=".95"/>' + L('M' + f1(cx - rx * .8) + ' ' + f1(sol - 3) + ' C ' + f1(cx - rx * .4) + ' ' + f1(sol - 6) + ' ' + f1(cx + rx * .2) + ' ' + f1(sol - 6) + ' ' + f1(cx + rx * .6) + ' ' + f1(sol - 3), '#c8e0ff', 1.6, so(.45));
  else html = '<ellipse cx="' + cx + '" cy="' + sol + '" rx="' + rx + '" ry="' + f1(rx * .065) + '" fill="#c8d84a" fill-opacity=".55" stroke="#5a6420" stroke-width="2"/><ellipse cx="' + cx + '" cy="' + (sol - 2) + '" rx="' + f1(rx * .85) + '" ry="' + f1(rx * .04) + '" fill="#e8f0a0" fill-opacity=".35"/>' +
    L('M' + f1(cx - rx * .8) + ' ' + f1(sol - 4) + ' C ' + f1(cx - rx * .4) + ' ' + f1(sol - 8) + ' ' + f1(cx + rx * .2) + ' ' + f1(sol - 8) + ' ' + f1(cx + rx * .6) + ' ' + f1(sol - 4), '#ffffd0', 1.8, so(.7)) +
    [[-.65, 1, 4], [-.2, 4, 3], [.25, -1, 5], [.7, 2, 3.5]].map(function(b){ return '<circle cx="' + f1(cx + b[0] * rx) + '" cy="' + f1(sol + b[1]) + '" r="' + b[2] + '" fill="#e8f0a0" stroke="#5a6420" stroke-width="1"/>'; }).join('');
  var g = this._el(this.S.sol, html);
  g.animate([{transform: 'translate(' + cx + 'px,' + sol + 'px) scale(.2,.4) translate(' + (-cx) + 'px,' + (-sol) + 'px)', opacity: 0}, {transform: 'translate(' + cx + 'px,' + sol + 'px) scale(1) translate(' + (-cx) + 'px,' + (-sol) + 'px)', opacity: 1}], {duration: 420, easing: 'cubic-bezier(.2,.8,.3,1.2)'});
  this.fx['flaque_' + type] = g;
  return g;
};
R._enleverFlaque = function(type){
  var g = this.fx['flaque_' + type];
  if(!g) return;
  this.fx['flaque_' + type] = null;
  g.animate([{opacity: 1}, {opacity: 0}], {duration: 600, fill: 'forwards'}).finished.then(oter(g), oter(g));
};
R._e_colle = function(on){
  this.etat.colle = on;
  if(on) this._flaque('colle', 290, 210); else this._enleverFlaque('colle');
  this._fondu('colle', on ? 1 : 0, 300);
  return this._changerMode(500);
};
/* ébloui : des étoiles tournent au-dessus du roi, il cache ses yeux ; les autres baissent la tête */
R._etoiles = function(on){
  this._couperX('et');
  this._fondu('et', on ? 1 : 0, on ? 250 : 200);
  if(!on) return;
  for(var i = 0; i < 5; i++){
    var frames = [];
    for(var s = 0; s <= 16; s++){ var a = s / 16 * Math.PI * 2 + i * Math.PI * 2 / 5, x = Math.cos(a) * 54, y = Math.sin(a) * 18, devant = Math.sin(a); frames.push({transform: 'translate(' + f1(-70 + x) + 'px,' + f1(-120 + y) + 'px) scale(' + f1(.75 + devant * .3) + ')', opacity: f1(.55 + devant * .45)}); }
    this._boucleX('et' + i, frames, 1500);
  }
};
R._e_ebloui = function(on){
  this.etat.ebloui = on;
  this._etoiles(on);
  return this._changerMode(500);
};
/* le gel : les variantes de glace apparaissent sur chaque rat, sur le tas et sur le nœud ; ils ne bougent presque plus */
R._e_gele = function(on){
  var self = this;
  this.etat.gele = on;
  this._fondu('gel', on ? 1 : 0, on ? 600 : 1000);
  clearTimeout(this.fx.givreT);
  if(on){ var c = this._ou('centre'); this._cristaux(c, 10, {v: 90, taille: 1.3}); }
  else { var c2 = this._ou('centre'); for(var i = 0; i < 4; i++) this._goutteTombe([c2[0] + hasard(-120, 120), c2[1] + hasard(-40, 40)], {coul: '#b8e6ff', delai: i * 120}); }
  return this._changerMode(on ? 400 : 600);
};
R._e_cible = function(on){ this.etat.cible = on; return this._changerMode(350); };
/* le point faible ouvert : le nœud à moitié défait brille et palpite (boucles x-) */
R._pulseX = function(on){
  this._couperX('pulse');
  if(!on) return;
  this._boucleX('pulseA', [{transform: 'scale(.9)'}, {offset: .5, transform: 'scale(1.12)'}, {transform: 'scale(.9)'}], 900, {e: 'ease-in-out'});
  this._boucleX('pulseB', [{transform: 'scale(.8)', opacity: .9}, {transform: 'scale(1.3)', opacity: 0}], 900, {e: 'ease-out'});
};
R._tensionX = function(on){
  this._couperX('tension');
  if(on) this._boucleX('tension', [{transform: 'scale(.94)'}, {offset: .5, transform: 'scale(1.06)'}, {transform: 'scale(.94)'}], 240);
};
R._bouleX = function(on){
  this._couperX('b');
  if(!on) return;
  this._boucleX('b1', [{transform: 'scale(1,.05)'}, {offset: .55, transform: 'scale(1,.05)'}, {offset: .6, transform: 'scale(1,1)'}, {offset: .85, transform: 'scale(1,1)'}, {offset: .9, transform: 'scale(1,.05)'}, {transform: 'scale(1,.05)'}], 3800);
  this._boucleX('b2', [{transform: 'scale(1,.05)'}, {offset: .2, transform: 'scale(1,.05)'}, {offset: .25, transform: 'scale(1,1)'}, {offset: .4, transform: 'scale(1,1)'}, {offset: .45, transform: 'scale(1,.05)'}, {transform: 'scale(1,.05)'}], 5200);
};

/* =====================================================================
   D. Les actions (Promise)
   ===================================================================== */
/* une pose pour tous les rats d'un coup, plus des pièces en plus */
R._avec = function(){ return reunir.apply(null, arguments); };
/* ils grouillent en courant (par-dessus la pose) pendant ms : corps qui sautillent, têtes qui dodelinent, pattes qui moulinent */
R._grouiller = function(ms, k, periode){
  k = k || 1;
  var self = this, A = {ajout: true};
  RATS.forEach(function(r, i){
    var per = (periode || 240) * hasard(.85, 1.2), n = Math.max(2, Math.round(ms / per)), cles = [], z = {};
    z[r.id] = {y: 0, a: 0}; z[r.id + 'P'] = {a: 0}; z[r.id + 'T'] = {a: 0};
    cles.push({t: 0, p: z});
    for(var j = 0; j < n; j++){
      var p = {}, q = {};
      p[r.id] = {y: r1(-hasard(3, 7) * k), a: r1(hasard(-3, 3) * k)}; p[r.id + 'P'] = {a: -18 * k}; p[r.id + 'T'] = {a: r1(hasard(2, 6) * k)};
      q[r.id] = {y: 0, a: 0}; q[r.id + 'P'] = {a: 10 * k}; q[r.id + 'T'] = {a: 0};
      cles.push({t: (j + .45) / n, p: p, e: 'ease-out'});
      cles.push({t: (j + 1) / n, p: q, e: 'ease-in'});
    }
    self._seq(cles, ms, A);
  });
};
/* les cibles de l'attaque : du héros le plus proche au plus loin (repère du dessin) */
R._cibles = function(vers){
  var self = this, l = [];
  if(vers && vers.length) [].concat(vers).forEach(function(q, i){ var m = self._depuisEcran(q); l.push({i: i, x: m[0], y: m[1]}); });
  else [-640, -440, -240].forEach(function(x, i){ l.push({i: i, x: x, y: 300}); });
  l.sort(function(a, b){ return b.x - a.x; });
  return l;
};

/* ---------------- l'entrée : la masse arrive en roulant, freine, le roi se dresse et lève sa couronne ---------------- */
R.entrer = function(){
  var self = this, j = this._debutAction(), T = 4800;
  function t(ms){ return ms / T; }
  ['ouvert', 'dos', 'noeud', 'boule', 'etale'].forEach(function(n){ self.etat[n] = false; });
  var dep = reunir(this._base(), {masse: {x: 660, y: 0, a: 0}});
  return this._allerA(dep, 1, null, true).then(function(){
    /* elle roule et grouille : des bonds courts, la masse qui tangue */
    var k = [{t: 0, p: {masse: {x: 660, y: 0, a: 0}}}], n = 8, x0 = 660, x1 = -26, t1 = 2300;
    for(var i = 0; i < n; i++){
      var xa = x0 + (x1 - x0) * (i + .5) / n, xb = x0 + (x1 - x0) * (i + 1) / n;
      k.push({t: t((i + .5) / n * t1), p: {masse: {x: r1(xa), y: -16 - (i % 2) * 6, a: i % 2 ? 4 : -4, sy: 1.03, sx: .98}}, e: 'cubic-bezier(.2,.7,.4,1)'});
      k.push({t: t((i + 1) / n * t1), p: {masse: {x: r1(xb), y: 0, a: 0, sy: .96, sx: 1.03}}, e: 'cubic-bezier(.6,0,.9,.5)'});
    }
    /* il freine en dérapant, et se tasse */
    k.push({t: t(2650), p: {masse: {x: -10, y: 0, a: 3, sx: 1.06, sy: .92}}, e: 'cubic-bezier(.2,.8,.3,1)'});
    k.push({t: t(2950), p: {masse: {x: 0, a: 0, sx: 1, sy: 1}, roi: {y: 0, a: 0}}, e: 'cubic-bezier(.3,.6,.4,1.3)'});
    /* le roi se dresse, museau en l'air, et lève sa couronne */
    k.push({t: t(3250), p: {roi: {y: -26, a: -15}, roiT: {a: 16}, roiP: {a: 64}, roiC: {y: -14, x: 2, a: -10}, roiM: {a: -34}, roiS: {y: -3}}, e: 'cubic-bezier(.2,.8,.3,1)'});
    /* la couronne saute en l'air, fait un tour complet… et retombe pile sur sa tête */
    k.push({t: t(3550), p: {roiC: {y: -78, x: 4, a: 150}, roiP: {a: 74}}, e: 'cubic-bezier(.2,.7,.4,1)'});
    k.push({t: t(3850), p: {roiC: {y: -6, x: 0, a: 352}, roiT: {a: 10}}, e: 'cubic-bezier(.6,0,.9,.6)'});
    k.push({t: t(3960), p: {roiC: {y: -12, a: 356}, roiT: {a: 14}, roiM: {a: -20}}, e: 'ease-out'});
    k.push({t: t(4100), p: {roiC: {y: 0, a: 360}}, e: 'ease-in'});
    k.push({t: t(4500), p: {roi: {y: 0, a: 0}, roiT: {a: 0}, roiP: {a: 0, x: 0, y: 0}, roiM: {a: REPOS.roiM.a}, roiS: {y: 0}}, e: 'cubic-bezier(.5,0,.3,1.2)'});
    k.push({t: 1, p: {roiC: {a: 360}}});
    self._grouiller(t1 + 300, 1.2, 230);
    /* poussière à chaque bond, au freinage */
    for(var b = 1; b <= n; b += 2) (function(m){ self._minuteur(function(){ var c = self._ou('pieds'); self._poussiere([c[0] - 120, SOL], 2, 1, .8); self._poussiere([c[0] + 120, SOL], 1, 1, .8); }, m / n * t1); })(b);
    self._minuteur(function(){ var c = self._ou('avant'); self._poussiere([c[0], SOL], 4, -1, 1.1); self._cri(self._ou('r1B'), .9, -1); }, 2600);
    /* le cri du roi, l'éclat du verre de sa couronne */
    self._minuteur(function(){ self._cri(self._ou('roiB'), 1.4, -1); }, 3200);
    self._minuteur(function(){ var p = self._ou('roiCG'); self._eclat(p, 16, '#e6ffd0', {anneau: '#bfffd0', duree: 520}); self._etincelles(p, 5, {v: 40, coul: ['#e6ffd0', '#ffffff', '#ffe8a0']}); }, 3500);
    self._minuteur(function(){ var p = self._ou('roiCG'); self._etincelles([p[0], p[1] - 10], 6, {v: 36, coul: ['#fff0c0', '#ffd060', '#ffffff']}); }, 3880);
    return self._seq(k, T).fini;
  }).then(function(){
    /* un tour complet = la même pose : on remet l'angle de la couronne à zéro sans que ça se voie */
    self.J.roiC.forEach(function(e){ e.getAnimations().forEach(function(a){ a.cancel(); }); e.style.transform = tf(fusion(Z)); });
    self.v.roiC = fusion(Z);
    return self._finAction(j, 300);
  });
};

/* ---------------- l'attaque : le grouillement, sur chaque héros ---------------- */
R.attaquer = function(nom, o){
  if(typeof nom === 'object' && nom){ o = nom; nom = null; }
  o = o || {};
  return this._grouillement(o);
};
R._grouillement = function(o){
  var self = this, j = this._debutAction();
  ['etale', 'noeud', 'dos'].forEach(function(n){ self.etat[n] = false; });
  var cibles = this._cibles(o.vers), FRONT = 64, HOP = 640, T0 = 640, n = cibles.length, tRet = T0 + n * HOP + 420, T = tRet + 1500;
  function t(ms){ return Math.min(1, ms / T); }
  var ANT = reunir(poseDehors(-10, {sy: .94, tete: 14, bouche: -32}), {roi: {y: -18, a: -12}, roiT: {a: 16}, roiP: {a: 100, x: -6, y: -8}, roiM: {a: -34}, roiS: {y: 3, a: 8}, tas: {sy: .9}});
  var VOL = reunir(poseDehors(30, {lean: -6, sy: 1.05, tete: 10, bouche: -34}), {roi: {y: -10, a: -6}, roiT: {a: 8}, roiP: {a: 60}, roiM: {a: -30}, tas: {sy: 1.05}});
  var MORD = reunir(poseDehors(36, {lean: 12, sy: .92, tete: -12, bouche: -4}), {roi: {y: 6, a: 6}, roiT: {a: -8}, roiP: {a: -10}, roiM: {a: -4}, tas: {sy: .9}});
  var BEANT = reunir(poseDehors(34, {lean: 8, tete: -4, bouche: -30}), {roiM: {a: -30}});
  var k = [{t: 0, p: {}}];
  k.push({t: t(T0 * .75), p: reunir(ANT, {masse: {x: 22, y: 0, sx: 1.05, sy: .92}}), e: 'cubic-bezier(.3,.6,.4,1)'});
  var x0 = 22, impacts = [];
  cibles.forEach(function(c, m){
    var x1 = r1(c.x - FRONT), tA = T0 + m * HOP;
    k.push({t: t(tA + HOP * .42), p: reunir(VOL, {masse: {x: r1((x0 + x1) / 2), y: -78 + m * 8, a: -5, sx: .95, sy: 1.07}}), e: 'cubic-bezier(.2,.75,.4,1)'});
    k.push({t: t(tA + HOP * .72), p: reunir(MORD, {masse: {x: x1, y: 0, a: 3, sx: 1.1, sy: .88}}), e: 'cubic-bezier(.6,0,.9,.5)'});
    k.push({t: t(tA + HOP * .86), p: reunir(BEANT, {masse: {y: -6, a: 0, sx: 1, sy: 1}}), e: 'ease-out'});
    k.push({t: t(tA + HOP), p: reunir(MORD, {masse: {y: 0}}), e: 'ease-in'});
    impacts.push({ms: tA + HOP * .72, c: c, x: x1});
    x0 = x1;
  });
  /* sur le dernier, ils mordent encore, puis reviennent en trois bonds, en se rassemblant */
  k.push({t: t(T0 + n * HOP + 200), p: reunir(BEANT, {masse: {y: -4}}), e: 'ease-out'});
  k.push({t: t(tRet), p: reunir(MORD, {masse: {y: 0}}), e: 'ease-in'});
  for(var b = 0; b < 3; b++){
    k.push({t: t(tRet + b * 380 + 190), p: {masse: {x: r1(x0 * (1 - (b + .5) / 3)), y: -30, a: 3}}, e: 'cubic-bezier(.2,.7,.4,1)'});
    k.push({t: t(tRet + (b + 1) * 380), p: {masse: {x: r1(x0 * (1 - (b + 1) / 3)), y: 0, a: 0}}, e: 'cubic-bezier(.6,0,.9,.5)'});
  }
  k.push({t: 1, p: reunir(POSES.etale, {masse: {x: 0, y: 0, a: 0, sx: 1, sy: 1}, roiP: {a: 0, x: 0, y: 0}, roiS: {y: 0, a: 0}})});
  this._grouiller(T0 + n * HOP, 1, 200);
  this._minuteur(function(){ self._grouiller(1200, .8, 190); }, tRet);
  this._minuteur(function(){ self._cri(self._ou('roiB'), 1.4, -1); self._cri(self._ou('r1B'), .9, -1); self._cri(self._ou('r3B'), .9, 1); }, 300);
  var premier, premierP = new Promise(function(ok){ premier = ok; });
  impacts.forEach(function(im, m){
    setTimeout(function(){
      if(self.jeton !== j) return;
      var p = self._ou('avant');
      self._poussiere([p[0] + 20, SOL], 3, -1, 1.1);
      self._eclat([im.c.x, im.c.y], 26, '#fff8d0', {rot: 30});
      self._cri([im.c.x + 30, im.c.y - 30], 1.1, -1);
      if(o.onImpact) try{ o.onImpact(im.c.i); }catch(er){}
      if(m === 0) premier();
    }, im.ms);
  });
  this._minuteur(function(){ var c = self._ou('pieds'); self._poussiere([c[0], SOL], 4, 1, 1); }, T - 200);
  var pr = this._seq(k, T).fini.then(function(){ self.etat.etale = true; return self._finAction(j, 400); });
  pr.impact = premierP;
  return pr;
};

/* ---------------- les coups ---------------- */
R.touche = function(type, o){
  type = type || 'coup';
  o = o || {};
  var f = this['_t_' + type.replace(/-/g, '_')];
  if(this.mort) return Promise.resolve();
  return f ? f.call(this, o) : this._t_coup(o);
};
R.special = function(nom, o){
  var f = this['_s_' + (nom || '').replace(/-/g, '_')];
  if(this.mort) return Promise.resolve();
  return f ? f.call(this, o || {}) : Promise.resolve();
};
/* le point visé : le nœud s'il est ouvert, sinon un rat au hasard de la masse */
R._cibleCoup = function(){
  if(this.etat.ouvert) return {p: this._ou('pfL'), r: null};
  if(this.etat.boule) return {p: this._ou('centre'), r: null};
  var r = RAT[choisir(['r1', 'r5', 'r2', 'r9', 'roi'])];
  return {p: this._ou(r.id, 10 * r.s, -10 * r.s), r: r};
};
/* en boule : le coup rebondit sur la boule de poils, qui roule un peu */
R._rebondBoule = function(o){
  var self = this, j = this._debutAction(), p = this._ou('centre');
  p = [p[0] - 110, p[1] - 10];
  this._eclat(p, 20, '#fff8d0', {rot: 40});
  this._etincelles(p, 6, {v: 60, ang: Math.PI, ouv: 1.6});
  return this._seq([{t: 0, p: {boule: {x: 0, a: 0, sx: 1, sy: 1}}}, {t: .15, p: {boule: {x: 12, a: 5, sx: .94, sy: 1.04}}, e: 'cubic-bezier(.2,.8,.3,1)'}, {t: .45, p: {boule: {x: -4, a: -2, sx: 1.03, sy: .97}}}, {t: 1, p: {boule: {x: 0, a: 0, sx: 1, sy: 1}}}], 900).fini.then(function(){ return self._finAction(j, 200); });
};
/* le coup qui porte (ou qui fait mal quand le nœud est ouvert) : le flash, l'éclat, le rat touché couine, la masse recule */
R._t_coup = function(o, force, type){
  if(this.etat.boule) return this._rebondBoule(o);
  var self = this, j = this._debutAction(), c = this._cibleCoup(), p = c.p, ouvert = this.etat.ouvert, T = 900 + (force || 1) * 200;
  force = force || 1;
  this._flash(p, 70 + force * 30);
  if(type === 'dague') this._rayures(p); else this._eclat(p, 18 + force * 8, type === 'fleche-argent' ? '#e8f4ff' : '#fff8d0');
  if(type === 'fleche-argent') this._etincelles(p, 8, {v: 50, coul: ['#ffffff', '#cfe8ff', '#e8f4ff']});
  if(type === 'fleche-lourde') this._poussiere([p[0], SOL], 3, 1, 1.1);
  var recul = {masse: {x: 8 * force, a: 1.5 * force, sx: .97, sy: 1.02}};
  if(c.r){ recul[c.r.id] = {x: 6 * force * -c.r.f, a: 6 * -c.r.f, y: -4}; recul[c.r.id + 'T'] = {a: 16}; if(c.r.jaw) recul[c.r.id + 'M'] = {a: -36}; }
  if(ouvert){ recul.roi = {x: 6, y: -6, a: 6}; recul.roiT = {a: 22}; recul.roiM = {a: -36}; recul.noeudL = {s: 1.12}; }
  var retour = {masse: {x: 0, a: 0, sx: 1, sy: 1}};
  if(c.r){ retour[c.r.id] = {x: 0, a: 0, y: 0}; retour[c.r.id + 'T'] = {a: 0}; if(c.r.jaw) retour[c.r.id + 'M'] = {a: 0}; }
  if(ouvert){ retour.roi = {x: 0, y: 0, a: 0}; retour.roiT = {a: 0}; retour.roiM = {a: 0}; retour.noeudL = {s: 1}; }
  this._seq([{t: 0, p: {}}, {t: .12, p: recul, e: 'cubic-bezier(.1,.9,.3,1)'}, {t: .5, p: (function(){ var w = {masse: {x: 2 * force, a: -.5}}; return w; })()}, {t: 1, p: retour, e: 'cubic-bezier(.3,.6,.4,1.2)'}], T, {ajout: true});
  this._minuteur(function(){ self._cri(c.r ? self._ou(c.r.id + 'B') : self._ou('roiB'), 1 + force * .2, c.r ? c.r.f : 1); }, 60);
  if(ouvert) this._minuteur(function(){ self._etincelles(self._ou('pfL'), 6, {v: 46, coul: ['#ffd8e0', '#ffffff', '#ffb8c8']}); }, 120);
  return attendreMs(T).then(function(){ return self._finAction(j, 250); });
};
R._t_fleche = function(o){ return this._t_coup(o, 1, 'fleche'); };
R._t_fleche_argent = function(o){ return this._t_coup(o, 1.2, 'fleche-argent'); };
R._t_fleche_lourde = function(o){ return this._t_coup(o, 1.7, 'fleche-lourde'); };
R._t_dague = function(o){ return this._t_coup(o, 1.1, 'dague'); };
/* IMMUNISÉ : la flèche se plante dans la masse ; un rat de devant l'attrape entre ses dents, l'arrache, la recrache… et ils ricanent */
R._t_rebond = function(o){
  if(this.etat.boule) return this._rebondBoule(o);
  var self = this, j = this._debutAction(), T = 2600, r = RAT.r1;
  function t(ms){ return ms / T; }
  var cible = this._ou('r1', 30 * r.s, -30 * r.s), dep = [cible[0] - 260, cible[1] - 30];
  var fl = this._fxEl('<g>' + L('M-40 0 L 0 0', O, 5.4) + L('M-40 0 L 0 0', '#a07848', 2.6) + Pw('M0 -5 L 12 0 L 0 5 Z', '#c8ccd8', 1.6) + Pw('M-44 -6 L -36 0 L -44 6 L -50 6 L -44 0 L -50 -6 Z', '#e8e0d0', 1.4) + '</g>');
  var ang = deg(Math.atan2(cible[1] - dep[1], cible[0] - dep[0]));
  var vol = fl.animate([{transform: 'translate(' + f1(dep[0]) + 'px,' + f1(dep[1]) + 'px) rotate(' + f1(ang) + 'deg)'}, {transform: 'translate(' + f1(cible[0]) + 'px,' + f1(cible[1]) + 'px) rotate(' + f1(ang) + 'deg)'}], {duration: 180, easing: 'linear', fill: 'forwards'});
  /* le rat se retourne, attrape la flèche, tire, l'arrache… et la crache au loin */
  var A = {r1: {x: 0, a: 0}, r1T: {a: 0}, r1M: {a: REPOS.r1M.a}};
  this._seq([{t: 0, p: A}, {t: t(200), p: {r1: {x: -4, a: 3}, r1T: {a: -6}}, e: 'cubic-bezier(.1,.9,.3,1)'},
    {t: t(700), p: {r1: {x: 4, a: -2}, r1T: {a: -40, y: -6}, r1M: {a: -36}}, e: 'cubic-bezier(.3,.6,.4,1)'},
    {t: t(820), p: {r1T: {a: -44, y: -8}, r1M: {a: -6}}, e: 'cubic-bezier(.6,0,.9,.5)'},
    {t: t(1100), p: {r1: {x: 14, a: 6}, r1T: {a: -20, y: -6}}, e: 'ease-in-out'},
    {t: t(1250), p: {r1: {x: 18, a: 8}, r1T: {a: -16}}, e: 'cubic-bezier(.1,.9,.3,1)'},
    {t: t(1450), p: {r1: {x: 2, a: -4}, r1T: {a: 14, y: 0}, r1M: {a: -36}}, e: 'cubic-bezier(.2,.9,.3,1)'},
    {t: t(1800), p: {r1: {x: 0, a: 0}, r1T: {a: 4}, r1M: {a: -20}}},
    {t: 1, p: A}], T);
  vol.finished.then(function(){
    if(self.jeton !== j){ fl.remove(); return; }
    self._eclat(cible, 14, '#fff8d0', {rot: 30});
    self._poussiere(cible, 2, 1, .6);
    /* plantée : elle vibre */
    fl.animate([{transform: 'translate(' + f1(cible[0]) + 'px,' + f1(cible[1]) + 'px) rotate(' + f1(ang) + 'deg)'}, {offset: .1, transform: 'translate(' + f1(cible[0]) + 'px,' + f1(cible[1]) + 'px) rotate(' + f1(ang + 7) + 'deg)'}, {offset: .2, transform: 'translate(' + f1(cible[0]) + 'px,' + f1(cible[1]) + 'px) rotate(' + f1(ang - 5) + 'deg)'}, {offset: .3, transform: 'translate(' + f1(cible[0]) + 'px,' + f1(cible[1]) + 'px) rotate(' + f1(ang + 3) + 'deg)'}, {transform: 'translate(' + f1(cible[0]) + 'px,' + f1(cible[1]) + 'px) rotate(' + f1(ang) + 'deg)'}], {duration: 600, fill: 'forwards'});
  });
  /* il l'arrache : la flèche suit sa bouche, puis il la crache, elle tourne et retombe au sol */
  setTimeout(function(){
    if(self.jeton !== j){ fl.remove(); return; }
    var b = self._ou('r1B'), b2 = [b[0] - 10, b[1] - 4];
    fl.getAnimations().forEach(function(a){ a.cancel(); });
    var sol = [b2[0] - 150, SOL - 4];
    fl.animate([{transform: 'translate(' + f1(cible[0]) + 'px,' + f1(cible[1]) + 'px) rotate(' + f1(ang) + 'deg)'}, {offset: .25, transform: 'translate(' + f1(b2[0]) + 'px,' + f1(b2[1]) + 'px) rotate(' + f1(ang - 40) + 'deg)'},
      {offset: .4, transform: 'translate(' + f1(b2[0] + 12) + 'px,' + f1(b2[1] + 2) + 'px) rotate(' + f1(ang - 50) + 'deg)'},
      {offset: .7, transform: 'translate(' + f1((b2[0] + sol[0]) / 2) + 'px,' + f1(b2[1] - 70) + 'px) rotate(' + f1(ang - 380) + 'deg)'},
      {offset: .9, transform: 'translate(' + f1(sol[0]) + 'px,' + f1(sol[1]) + 'px) rotate(' + f1(ang - 540) + 'deg)', opacity: 1},
      {transform: 'translate(' + f1(sol[0] - 6) + 'px,' + f1(sol[1]) + 'px) rotate(' + f1(ang - 545) + 'deg)', opacity: 0}], {duration: 1500, easing: 'ease-in-out', fill: 'forwards'}).finished.then(oter(fl), oter(fl));
    setTimeout(function(){ if(self.jeton === j){ var q = self._ou('r1B'); self._bouffee(q, {r: 5, grad: self.G.vapeur, op: .7, dx: -24, dy: -6, duree: 500, s1: 2}); self._cri(q, .9, -1); } }, 650);
  }, 820);
  /* ils ricanent tous : les têtes qui sautillent, les « hé hé » */
  setTimeout(function(){
    if(self.jeton !== j) return;
    var h = [{t: 0, p: {}}];
    for(var i = 1; i < 8; i++){ var w = {}; ['r3', 'r5', 'r2', 'r9', 'r10', 'r6', 'r8', 'roi'].forEach(function(id, m){ w[id + 'T'] = {a: (i + m) % 2 ? 6 : -1}; }); MACHOIRES.forEach(function(id){ if(id !== 'r1') w[id + 'M'] = {a: i % 2 ? -12 : -2}; }); h.push({t: i / 8, p: w}); }
    var z = {}; ['r3', 'r5', 'r2', 'r9', 'r10', 'r6', 'r8', 'roi'].forEach(function(id){ z[id + 'T'] = {a: 0}; }); MACHOIRES.forEach(function(id){ if(id !== 'r1') z[id + 'M'] = {a: 0}; }); h.push({t: 1, p: z}); h[0].p = z;
    self._seq(h, 1000, {ajout: true});
    ['roi', 'r3', 'r5'].forEach(function(id, m){ var q = self._ou(id + 'B'); self._hehe(q, RAT[id].f, m * 160); self._hehe([q[0], q[1] - 4], RAT[id].f, m * 160 + 420); });
  }, 1500);
  return attendreMs(T).then(function(){ return self._finAction(j, 250); });
};
/* le nuage : ils toussent trois fois… puis ils paniquent et tirent chacun de leur côté (1re étape du combo) */
R._t_nuage = function(o){
  var self = this;
  if(this.etat.boule) return this.tousser();
  return this.tousser().then(function(){ if(!self.etat.ouvert && !self.etat.noeud && !self.mort) return self._e_noeud(true); });
};
/* le bruit : selon le moment */
R._t_bruit = function(o){
  if(this.etat.boule) return this._sursaut(o);
  if(this.etat.noeud) return this._s_tirent(o);
  if(this.etat.etale) return this._s_panique(o);
  if(this.etat.ouvert || this.etat.dos) return this._sursaut(o);
  return this._s_charge(o);
};
/* un simple sursaut (la boule tressaille, le roi renversé couine) */
R._sursaut = function(o){
  var self = this, j = this._debutAction(), c = this._ou('centre');
  this._ondes([c[0] - 150, c[1] - 30], 1, null, 1.4);
  var p = this.etat.boule ? {boule: {y: -18, sy: 1.06}} : {masse: {y: -10, sy: 1.04}, roiT: {a: 10}};
  var z = this.etat.boule ? {boule: {y: 0, sy: 1}} : {masse: {y: 0, sy: 1}, roiT: {a: 0}};
  this._seq([{t: 0, p: z}, {t: .3, p: p, e: 'cubic-bezier(.2,.8,.4,1)'}, {t: .7, p: z, e: 'cubic-bezier(.6,0,.9,.5)'}, {t: 1, p: z}], 700, {ajout: true});
  if(!this.etat.boule) this._minuteur(function(){ self._cri(self._ou('roiB'), 1.1, 1); }, 80);
  return attendreMs(800).then(function(){ return self._finAction(j, 200); });
};
R._t_colle = function(o){
  if(this.etat.boule) return this._rebondBoule(o);
  if(this.etat.noeud) return this._s_roi_colle(o);
  var self = this, j = this._debutAction(), c = this._ou('centre');
  for(var i = 0; i < 6; i++) this._bouffee([c[0] + hasard(-120, 120), c[1] + hasard(-30, 60)], {r: hasard(8, 12), grad: this.G.acide, op: .7, dx: hasard(-10, 10), dy: hasard(10, 30), duree: 600, delai: i * 50, s1: 1.6});
  this.etat.colle = true;
  this._flaque('colle', 290, 210);
  this._fondu('colle', 1, 300);
  /* ils sursautent, se débattent, et restent pris en tas */
  var k = [{t: 0, p: {}}, {t: .25, p: reunir(poseDehors(10, {dy: -6, tete: 12, bouche: -30}), {masse: {y: -6}})}, {t: .5, p: reunir(poseDehors(-4, {dy: 2, tete: -4, bouche: -12}), {masse: {y: 0}})}, {t: .75, p: poseDehors(-10, {dy: 4, tete: 8, bouche: -26})}, {t: 1, p: POSES.colle}];
  this._minuteur(function(){ self._cri(self._ou('r1B'), .9, -1); self._cri(self._ou('r3B'), .9, 1); }, 200);
  return this._seq(k, 1400).fini.then(function(){ return self._finAction(j, 300); });
};
/* la lumière : PIÈGE, ils se roulent en boule */
R._t_lumiere = function(o){
  var c = this._ou('centre');
  this._rayons([c[0] - 60, c[1] - 40], 90);
  if(this.etat.boule) return this._rebondBoule(o);
  return this._e_boule(true);
};
/* le feu : des rats prennent feu, sautent et se roulent par terre ; les flammes restent (état brule) */
R._t_feu = function(o){
  if(this.etat.boule) return this._rebondBoule(o);
  var self = this, j = this._debutAction(), T = 1900, c = this._ou('centre');
  this._souffleFeu([c[0] - 80, c[1]], 50);
  this._minuteur(function(){ self._e_brule(true); }, 150);
  var k = [{t: 0, p: {}}];
  /* r1 et r3 se roulent (un tour complet sur eux-mêmes), r5 et le roi sautent en couinant */
  k.push({t: .15, p: {r1: {y: -18, a: -40}, r3: {y: -16, a: 40}, r5: {y: -14}, roi: {y: -16, a: -6}, roiT: {a: 18}, roiM: {a: -36}, r5M: {a: -36}}, e: 'cubic-bezier(.2,.8,.3,1)'});
  k.push({t: .45, p: {r1: {y: -4, x: 10, a: -200}, r3: {y: -4, x: -10, a: 200}, r5: {y: 0}, roi: {y: 0, a: 4}}, e: 'linear'});
  k.push({t: .75, p: {r1: {y: 0, x: 0, a: -360}, r3: {y: 0, x: 0, a: 360}, r5: {y: -8}, roiT: {a: 6}}, e: 'cubic-bezier(.3,.6,.4,1)'});
  k.push({t: 1, p: {r1: {a: -360, y: 0}, r3: {a: 360, y: 0}, r5: {y: 0}, roi: {y: 0, a: 0}, roiT: {a: 0}, roiM: {a: REPOS.roiM.a}, r5M: {a: REPOS.r5M.a}}});
  ['r1B', 'r3B', 'r5B', 'roiB'].forEach(function(n, i){ self._minuteur(function(){ self._cri(self._ou(n), 1, n === 'r3B' ? 1 : -1); }, 120 + i * 90); });
  return this._seq(k, T).fini.then(function(){
    /* un tour complet = la même pose : on remet l'angle à zéro sans que ça se voie */
    ['r1', 'r3'].forEach(function(id){ self.J[id].forEach(function(e){ e.getAnimations().forEach(function(a){ a.cancel(); }); }); self.v[id] = fusion(Z, {}); self.J[id].forEach(function(e){ e.style.transform = tf(self.v[id]); }); });
    return self._finAction(j, 300);
  });
};
R._t_brulure = function(o){
  var self = this, j = this._debutAction(), r = RAT[choisir(['r1', 'r3', 'r5', 'roi'])], p = this._ou(r.id, 0, -30 * r.s);
  this._souffleFeu(p, 26);
  var w = {}, z = {}; w[r.id] = {y: -10}; z[r.id] = {y: 0};
  this._seq([{t: 0, p: z}, {t: .3, p: w, e: 'cubic-bezier(.2,.8,.4,1)'}, {t: .7, p: z, e: 'cubic-bezier(.6,0,.9,.5)'}, {t: 1, p: z}], 700, {ajout: true});
  this._minuteur(function(){ self._cri(self._ou(r.id + 'B'), 1, r.f); }, 80);
  return attendreMs(800).then(function(){ return self._finAction(j, 200); });
};
/* l'huile : la masse glisse, part d'un côté, de l'autre, les rats roulent les uns sur les autres et s'emmêlent */
R._t_huile = function(o){
  if(this.etat.boule) return this._rebondBoule(o);
  var self = this, j = this._debutAction(), T = 2300;
  this._flaque('huile', 290, 220);
  var M1 = reunir(poseDehors(12, {dy: 6, lean: -10, tete: 14, bouche: -34}), {roi: {x: 10, y: 10, a: 14}, roiT: {a: 18}, roiM: {a: -34}, r1: {a: -30, y: -6}, r3: {a: 26, y: -6}, r8: {x: -16, y: 20, a: -30}, r6: {x: -10, y: 18, a: 24}});
  var M2 = reunir(poseDehors(-6, {dy: 4, lean: 8, tete: -6, bouche: -12}), {roi: {x: -12, y: 16, a: -16}, roiT: {a: -6}, r1: {a: 24, x: 10}, r3: {a: -22, x: -10}, r8: {x: -28, y: 36, a: -60}, r6: {x: -20, y: 30, a: 40}, r5: {x: 16, y: 16, a: 30}});
  var k = [{t: 0, p: {}}, {t: .18, p: reunir(M1, {masse: {x: -40, a: -5}}), e: 'cubic-bezier(.3,.7,.4,1)'}, {t: .4, p: reunir(M2, {masse: {x: 34, a: 6}}), e: 'cubic-bezier(.4,0,.4,1)'}, {t: .6, p: reunir(M1, {masse: {x: -14, a: -3}})}, {t: .78, p: reunir(M2, {masse: {x: 6, a: 1}})}, {t: 1, p: reunir(this._base(), {masse: {x: 0, a: 0}})}];
  this._minuteur(function(){ self._cri(self._ou('roiB'), 1.2, -1); self._cri(self._ou('r8B'), .8, -1); }, 300);
  this._minuteur(function(){ self._cri(self._ou('r6B'), .8, 1); self._cri(self._ou('r1B'), .8, -1); }, 900);
  setTimeout(function(){ self._enleverFlaque('huile'); }, T + 1600);
  return this._seq(k, T).fini.then(function(){ return self._finAction(j, 300); });
};
R._t_givre = function(o){
  if(this.etat.boule) return this._rebondBoule(o);
  var self = this, c = this._ou('centre');
  this._cristaux([c[0] - 60, c[1]], 10, {v: 80, taille: 1.4});
  return this._e_gele(true);
};
/* l'acide : le poil grésille, des bulles, ils sautillent et se grattent */
R._t_acide = function(o){
  if(this.etat.boule) return this._rebondBoule(o);
  var self = this, j = this._debutAction(), T = 1800;
  ['r1', 'r5', 'roi', 'r3'].forEach(function(id, i){ var r = RAT[id]; self._minuteur(function(){ var p = self._ou(id, 0, -30 * r.s); self._bulles(p, 4, {etendue: 2}); self._bouffee(p, {r: 9, grad: self.G.acide, op: .6, dy: -50, duree: 1100, s1: 2.4}); self._cri(self._ou(id + 'B'), .9, r.f); }, i * 160); });
  var k = [{t: 0, p: {}}];
  for(var i = 1; i < 8; i++) k.push({t: i / 8, p: reunir(poseDehors(i % 2 ? 6 : 0, {dy: i % 2 ? -8 : 0, tete: i % 2 ? 12 : -2}), {roi: {y: i % 2 ? -8 : 0}, roiT: {a: i % 2 ? 12 : 0}, r1P: {a: i % 2 ? -30 : 10}, r3P: {a: i % 2 ? -30 : 10}})});
  k.push({t: 1, p: this._base()});
  return this._seq(k, T).fini.then(function(){ return self._finAction(j, 300); });
};
/* la louche : BONG sur la couronne ; le roi voit trente-six chandelles */
R._t_louche = function(o){
  if(this.etat.boule) return this._rebondBoule(o);
  var self = this, j = this._debutAction(), T = 2000, p = this._ou('roiCG');
  this._eclat([p[0], p[1] - 30], 26, '#fff8d0', {rot: 40});
  this._etincelles([p[0], p[1] - 30], 8, {v: 60});
  this._ondes([p[0] - 30, p[1] - 30], -1, '#fff4c0');
  this._ondes([p[0] + 30, p[1] - 30], 1, '#fff4c0');
  this._etoiles(true);
  var k = [{t: 0, p: {}}, {t: .08, p: {roi: {y: 10, sy: .94}, roiT: {a: -16}, roiC: {y: 8, a: -12}, roiL: {sy: 30}, roiM: {a: -4}}, e: 'cubic-bezier(.1,.9,.3,1)'},
    {t: .25, p: {roiC: {y: -6, a: 14}, roi: {y: 4, sy: 1}}}, {t: .4, p: {roiC: {y: 0, a: -9}, roiT: {a: -8}}}, {t: .55, p: {roiC: {a: 6}, roiT: {a: 4}}}, {t: .7, p: {roiC: {a: -3}, roiT: {a: -6}, roiL: {sy: 18}}},
    {t: 1, p: {roi: {y: 0, sy: 1}, roiT: {a: 0}, roiC: {y: 0, a: 0}, roiL: {sy: REPOS.roiL.sy}, roiM: {a: REPOS.roiM.a}}}];
  /* les autres lèvent la tête vers lui */
  var lv = poseDehors(0, {tete: 14});
  k[2].p = reunir(k[2].p, lv);
  k[6].p = reunir(k[6].p, poseDehors(0, {tete: 0}));
  setTimeout(function(){ if(!self.etat.ebloui && !self.mort) self._etoiles(false); }, T);
  return this._seq(k, T).fini.then(function(){ return self._finAction(j, 300); });
};
/* le bouclier de runes : la masse se jette dessus, rebondit, sonnée */
R._t_bouclier = function(o){
  if(this.etat.boule) return this._rebondBoule(o);
  var self = this, j = this._debutAction(), T = 1700, c = this._ou('avant');
  var k = [{t: 0, p: {}}, {t: .25, p: reunir(poseDehors(10, {lean: -6, tete: 8, bouche: -30}), {masse: {x: -70, y: -14, a: -4}}), e: 'cubic-bezier(.3,.6,.5,1)'},
    {t: .34, p: reunir(poseDehors(-8, {sy: .9, tete: -10, bouche: -6}), {masse: {x: -48, y: 0, sx: .9, sy: 1.06, a: 3}}), e: 'cubic-bezier(.1,.9,.3,1)'},
    {t: .6, p: {masse: {x: 10, sx: 1, sy: 1, a: 1}}, e: 'cubic-bezier(.3,.6,.4,1)'}, {t: 1, p: reunir(this._base(), {masse: {x: 0, a: 0}})}];
  setTimeout(function(){
    if(self.jeton !== j) return;
    var p = [c[0] - 80, c[1] - 40];
    var g = self._fxEl(L('M0 -90 Q -30 0 0 90', '#1ec8ff', 14, so(.35)) + L('M0 -90 Q -30 0 0 90', '#bff8ff', 4) + L('M-10 -40 l 6 8 l -6 8 M-14 10 l 8 0 M-10 40 l 6 -8', '#ffffff', 2));
    g.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(.8)', opacity: 0}, {offset: .2, transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(1.1)', opacity: 1}, {transform: 'translate(' + f1(p[0] - 10) + 'px,' + f1(p[1]) + 'px) scale(1)', opacity: 0}], {duration: 700, fill: 'forwards'}).finished.then(oter(g), oter(g));
    self._etincelles([p[0] + 10, p[1]], 8, {v: 50, ang: 0, coul: ['#bff8ff', '#ffffff', '#5fe8ff']});
    self._cri(self._ou('r1B'), 1, -1);
    if(o.onImpact) try{ o.onImpact(); }catch(er){}
  }, T * .33);
  this._minuteur(function(){ self._etoiles(true); }, T * .4);
  setTimeout(function(){ if(!self.etat.ebloui && !self.mort) self._etoiles(false); }, T * .4 + 1300);
  return this._seq(k, T).fini.then(function(){ return self._finAction(j, 300); });
};

/* ---------------- la toux : trois quintes, lentes ---------------- */
R.tousser = function(){
  var self = this, j = this._debutAction(), Q = 1000, T = Q * 3 + 400;
  var k = [{t: 0, p: {}}];
  for(var i = 0; i < 3; i++){
    var t0 = i * Q;
    k.push({t: (t0 + 380) / T, p: reunir(poseDehors(-4, {tete: 12, bouche: -10, sy: 1.03}), {masse: {sy: 1.04, sx: .98, y: -3}, roiT: {a: 12}, roiM: {a: -8}, roiL: {sy: 10}}), e: 'ease-in'});
    k.push({t: (t0 + 520) / T, p: reunir(poseDehors(6, {tete: -16, bouche: -36, sy: .94, lean: 6}), {masse: {sy: .93, sx: 1.04, y: 2, x: 6}, roiT: {a: -14}, roiM: {a: -36}, roiL: {sy: 34}, roi: {a: 5}}), e: 'cubic-bezier(.1,.9,.3,1)'});
    k.push({t: (t0 + 900) / T, p: reunir(poseDehors(0, {tete: 0, bouche: -18, sy: 1}), {masse: {sy: 1, sx: 1, y: 0, x: 0}, roiT: {a: 0}, roiM: {a: -16}, roiL: {sy: 12}, roi: {a: 0}}), e: 'ease-out'});
    (function(m){ self._minuteur(function(){
      ['roiB', 'r1B', 'r3B', 'r5B', 'r2B'].forEach(function(n, q){ var p = self._ou(n), f = n === 'r3B' ? 1 : -1; self._bouffee([p[0] + f * 6, p[1]], {r: n === 'roiB' ? 12 : 7, grad: self.G.toux, op: .8, dx: f * hasard(24, 44), dy: hasard(-14, 4), duree: 800, delai: q * 30, s1: 2.6}); });
    }, m * Q + 520); })(i);
  }
  k.push({t: 1, p: this._base()});
  return this._seq(k, T).fini.then(function(){ return self._finAction(j, 300); });
};

/* ---------------- les étapes du combo, et les états qui se jouent comme des actions ---------------- */
/* état noeud : ils paniquent, tirent chacun de leur côté, à coups secs ; le nœud apparaît au centre, tendu */
R._e_noeud = function(on){
  var self = this, j = this._debutAction(), T = on ? 1800 : 900;
  this.etat.noeud = on;
  if(on) this.etat.etale = false;
  this._fondu('tension', on ? 1 : 0, on ? 500 : 300, on ? 800 : 0);
  this._tensionX(on);
  if(!on) return this._seq([{t: 0, p: {}}, {t: 1, p: this._base()}], T).fini.then(function(){ return self._finAction(j, 200); });
  var k = [{t: 0, p: {}}];
  [12, 4, 22, 14, 34].forEach(function(d, i){ k.push({t: (i + 1) / 6, p: reunir(poseDehors(d, {lean: i % 2 ? 4 : 12, tete: i % 2 ? 10 : -8, bouche: i % 2 ? -34 : -14}), {noeud: {s: 1 - (i + 1) * .028}, roi: {y: i % 2 ? 2 : 10, a: i % 2 ? -3 : 8}, roiT: {a: i % 2 ? 10 : -8}}), e: i % 2 ? 'ease-out' : 'cubic-bezier(.1,.9,.3,1)'}); });
  k.push({t: 1, p: this._base()});
  ['r1B', 'r9B', 'r3B', 'r10B', 'r5B'].forEach(function(n, i){ self._minuteur(function(){ self._cri(self._ou(n), .9, RAT[n.slice(0, -1)].f); }, 150 + i * 220); });
  return this._seq(k, T).fini.then(function(){ return self._finAction(j, 200); });
};
R._s_noeud = function(){ return this.etatPublic('noeud', true); };
/* le pas vers « ouvert » : le nœud cède à moitié (variante), le roi tombe à la renverse */
R._ouvrirNoeud = function(delai){
  var self = this;
  this._minuteur(function(){
    self._fondu('noeud', 0, 160);
    self._fondu('tension', 0, 160);
    self._tensionX(false);
    self._fondu('lache', 1, 260);
    self._fondu('ombreRoi', 0, 300);
    var p = self._ou('pf');
    self._eclat(p, 34, '#ffe8f0', {anneau: '#ffd0dc', duree: 600, rot: 30});
    for(var i = 0; i < 4; i++) self._brin(p, -Math.PI * (.15 + i * .23), hasard(70, 110), i * 40);
    self._etincelles(p, 8, {v: 70, coul: ['#ffd8e0', '#ffffff', '#ffb8c8']});
    self._pulseX(true);
  }, delai);
};
/* 2e étape du combo (bruit après le nuage) : effrayés, ils tirent tous d'un coup ; le nœud se défait à moitié ; le roi tombe à la renverse */
R._s_tirent = function(o){
  var self = this, j = this._debutAction(), T = 2600;
  function t(ms){ return ms / T; }
  var c = this._ou('centre');
  this._ondes([c[0] - 150, c[1] - 40], 1, null, 1.5);
  var k = [{t: 0, p: {}},
    {t: t(260), p: reunir(poseDehors(30, {dy: -14, tete: 16, bouche: -38, sy: 1.06}), {roi: {y: -20, a: -4}, roiT: {a: 18}, roiM: {a: -38}, roiL: {sy: 1}}), e: 'cubic-bezier(.1,.9,.3,1)'},
    {t: t(560), p: reunir(poseDehors(34, {dy: 0, tete: 6, sy: 1}), {roi: {y: 6, a: 4}}), e: 'cubic-bezier(.6,0,.9,.5)'},
    /* TOUS d'un coup ! */
    {t: t(760), p: reunir(poseDehors(78, {lean: 18, dy: 8, tete: -10, bouche: -20}), {roi: {x: 6, y: 10, a: 20}, roiT: {a: 10}, roiP: {a: -50}, roiPF: {a: -40}, noeud: {s: 1.15}}), e: 'cubic-bezier(.1,.9,.2,1)'},
    /* le roi bascule, battant des pattes… et tombe à la renverse */
    {t: t(1100), p: {roi: {x: 14, y: 2, a: 60}, roiT: {a: 26}, roiP: {a: -100}, roiPF: {a: -80}, roiC: {a: 30, y: -6}, roiM: {a: -36}}, e: 'cubic-bezier(.4,0,.6,1)'},
    {t: t(1450), p: reunir(RENVERSE, {roi: {x: 22, y: 92, a: 160}}), e: 'cubic-bezier(.6,0,.9,.6)'},
    {t: t(1650), p: reunir(POSES.ouvert, {roi: {x: 22, y: 80, a: 156}}), e: 'cubic-bezier(.2,.8,.4,1)'},
    {t: 1, p: POSES.ouvert, e: 'cubic-bezier(.5,0,.5,1.3)'}];
  this._minuteur(function(){ ['roiB', 'r1B', 'r3B', 'r9B'].forEach(function(n){ self._cri(self._ou(n), 1.1, n === 'r3B' ? 1 : -1); }); }, 200);
  this._ouvrirNoeud(780);
  this._minuteur(function(){ var p = self._ou('centre'); self._poussiere([p[0] + 20, SOL], 4, 0, 1.2); self._cri(self._ou('roiB'), 1.3, 1); }, 1460);
  this.etat.noeud = false; this.etat.etale = false;
  return this._seq(k, T).fini.then(function(){ self.etat.ouvert = true; self.etat.dos = false; return self._finAction(j, 200); });
};
/* autre chemin : nuage puis colle sur le roi ; collé, il ne peut plus les retenir */
R._s_roi_colle = function(o){
  var self = this, j = this._debutAction(), T = 2800;
  function t(ms){ return ms / T; }
  var p = this._ou('roiO');
  for(var i = 0; i < 6; i++) this._bouffee([p[0] + hasard(-60, 120), p[1] + hasard(0, 80)], {r: hasard(8, 13), grad: this.G.acide, op: .75, dx: hasard(-10, 10), dy: hasard(10, 30), duree: 600, delai: i * 50, s1: 1.6});
  this._fondu('colleRoi', 1, 300);
  var k = [{t: 0, p: {}},
    /* il se débat, il tire sur ses pattes collées */
    {t: t(300), p: {roi: {y: 6, a: 4}, roiT: {a: 14}, roiM: {a: -36}, roiP: {a: -20}}, e: 'cubic-bezier(.1,.9,.3,1)'},
    {t: t(550), p: {roi: {y: 2, a: -4}, roiT: {a: -6}, roiP: {a: 12}}},
    {t: t(800), p: {roi: {y: 8, a: 6}, roiT: {a: 12}, roiP: {a: -24}}},
    {t: t(1050), p: {roi: {y: 4, a: -2}, roiT: {a: -4}, roiP: {a: 8}}},
    /* les autres tirent : il ne peut plus les retenir */
    {t: t(1300), p: reunir(poseDehors(70, {lean: 18, dy: 8, tete: -10, bouche: -20}), {roi: {x: 8, y: 12, a: 22}, roiT: {a: 16}, roiP: {a: -60}, noeud: {s: 1.12}}), e: 'cubic-bezier(.1,.9,.2,1)'},
    {t: t(1650), p: {roi: {x: 16, y: 4, a: 70}, roiT: {a: 24}, roiPF: {a: -70}, roiC: {a: 26, y: -4}}, e: 'cubic-bezier(.4,0,.6,1)'},
    {t: t(2000), p: reunir(RENVERSE, {roi: {x: 22, y: 92, a: 160}}), e: 'cubic-bezier(.6,0,.9,.6)'},
    {t: t(2200), p: reunir(POSES.ouvert, {roi: {x: 22, y: 80, a: 156}}), e: 'cubic-bezier(.2,.8,.4,1)'},
    {t: 1, p: POSES.ouvert, e: 'cubic-bezier(.5,0,.5,1.3)'}];
  this._minuteur(function(){ self._cri(self._ou('roiB'), 1.2, -1); }, 320);
  this._minuteur(function(){ self._cri(self._ou('roiB'), 1.2, -1); }, 820);
  this._ouvrirNoeud(1320);
  this._minuteur(function(){ var q = self._ou('centre'); self._poussiere([q[0] + 20, SOL], 4, 0, 1.2); }, 2000);
  this.etat.noeud = false;
  return this._seq(k, T).fini.then(function(){ self.etat.ouvert = true; self.etat.dos = false; return self._finAction(j, 200); });
};
/* sans potion : le bruit juste après leur attaque (la masse encore étalée) : ils paniquent, se marchent dessus, le nœud s'expose */
R._s_panique = function(o){
  var self = this, j = this._debutAction(), T = 2800, R0 = rng(17);
  var c = this._ou('centre');
  this._ondes([c[0] - 150, c[1] - 40], 1, null, 1.5);
  var k = [{t: 0, p: {}}];
  for(var i = 1; i <= 8; i++){
    var p = {};
    PETITS.forEach(function(id){ var r = RAT[id]; p[id] = {x: r1(r.u[0] * 30 + (R0() - .5) * 60), y: r1(r.u[1] * 12 + (R0() - .5) * 30 - (i % 2) * 10), a: r1((R0() - .5) * 50)}; p[id + 'T'] = {a: r1((R0() - .3) * 30)}; if(r.jaw) p[id + 'M'] = {a: i % 2 ? -36 : -10}; });
    /* ils grimpent les uns sur les autres : le roi est bousculé */
    if(i < 5) p.roi = {x: r1((R0() - .5) * 20), y: -6 + (i % 2) * 8, a: (i % 2 ? 10 : -8)};
    if(i < 5) p.roiT = {a: i % 2 ? 16 : -6};
    if(i === 5){ p.roi = {x: 14, y: 4, a: 60}; p.roiT = {a: 24}; p.roiP = {a: -90}; p.roiC = {a: 26}; }
    if(i === 6){ p.roi = {x: 22, y: 92, a: 160}; }
    k.push({t: i * .1, p: p, e: i === 6 ? 'cubic-bezier(.6,0,.9,.6)' : 'ease-in-out'});
  }
  k.push({t: .9, p: reunir(POSES.ouvert, {roi: {x: 22, y: 80, a: 156}})});
  k.push({t: 1, p: POSES.ouvert, e: 'cubic-bezier(.5,0,.5,1.3)'});
  for(var n = 0; n < 6; n++) (function(m){ self._minuteur(function(){ var id = choisir(MACHOIRES); self._cri(self._ou(id + 'B'), 1, RAT[id].f); }, 150 + m * 260); })(n);
  this._minuteur(function(){ var q = self._ou('centre'); self._poussiere([q[0] - 100, SOL], 3, -1, 1); self._poussiere([q[0] + 100, SOL], 3, 1, 1); }, 600);
  this._ouvrirNoeud(T * .62);
  this.etat.etale = false;
  return this._seq(k, T).fini.then(function(){ self.etat.ouvert = true; self.etat.dos = false; return self._finAction(j, 200); });
};
/* PIÈGE (le bruit avant le nuage) : ils se fâchent, et foncent tous sur l'Alchimiste */
R._s_charge = function(o){
  var self = this, j = this._debutAction(), cibles = this._cibles(o.vers ? [].concat(o.vers).slice(0, 1) : null), cb = cibles[0], T = 3300;
  if(!o.vers) cb = {i: 0, x: -300, y: 300};
  function t(ms){ return ms / T; }
  var x1 = r1(cb.x - 64);
  /* ils se fâchent : yeux rouges un instant, le tas se hérisse, ils piétinent */
  if(!this.etat.enrage) this._fondu('rage', 1, 250);
  var FACHE = reunir(poseDehors(-8, {tete: -10, bouche: -34, sy: .95, lean: 8}), {roiT: {a: -8}, roiS: {y: 4, a: 10}, roiM: {a: -34}, roiL: {sy: 14}, tas: {sy: 1.08}});
  var VOL = reunir(poseDehors(28, {lean: -6, sy: 1.05, tete: 10, bouche: -36}), {roi: {y: -10, a: -6}, roiT: {a: 8}, roiM: {a: -36}});
  var MORD = reunir(poseDehors(34, {lean: 12, sy: .9, tete: -14, bouche: -4}), {roi: {y: 8, a: 8}, roiT: {a: -10}, roiM: {a: -4}});
  var k = [{t: 0, p: {}}];
  for(var i = 1; i <= 4; i++) k.push({t: t(i * 180), p: reunir(FACHE, {masse: {x: i % 2 ? 6 : -2, y: i % 2 ? -6 : 0, sy: i % 2 ? 1.03 : .96}}), e: 'ease-in-out'});
  k.push({t: t(1000), p: reunir(FACHE, {masse: {x: 26, y: 0, sx: 1.06, sy: .9}}), e: 'cubic-bezier(.3,.6,.4,1)'});
  k.push({t: t(1350), p: reunir(VOL, {masse: {x: r1(x1 / 2), y: -96, a: -7, sx: .94, sy: 1.08}}), e: 'cubic-bezier(.2,.75,.4,1)'});
  k.push({t: t(1650), p: reunir(MORD, {masse: {x: x1, y: 0, a: 4, sx: 1.12, sy: .86}}), e: 'cubic-bezier(.6,0,.9,.5)'});
  k.push({t: t(1800), p: reunir(VOL, {masse: {y: -10, a: 0, sx: 1, sy: 1}}), e: 'ease-out'});
  k.push({t: t(1950), p: reunir(MORD, {masse: {y: 0}}), e: 'ease-in'});
  k.push({t: t(2150), p: reunir(VOL, {masse: {y: -6}}), e: 'ease-out'});
  k.push({t: t(2300), p: reunir(MORD, {masse: {y: 0}}), e: 'ease-in'});
  for(var b = 0; b < 2; b++){
    k.push({t: t(2300 + b * 400 + 200), p: {masse: {x: r1(x1 * (1 - (b + .5) / 2)), y: -34, a: 3}}, e: 'cubic-bezier(.2,.7,.4,1)'});
    k.push({t: t(2300 + (b + 1) * 400), p: {masse: {x: r1(x1 * (1 - (b + 1) / 2)), y: 0, a: 0}}, e: 'cubic-bezier(.6,0,.9,.5)'});
  }
  k.push({t: 1, p: reunir(this._base(), {masse: {x: 0, y: 0, a: 0, sx: 1, sy: 1}})});
  this._minuteur(function(){ var q = self._ou('roiB'); for(var n = 0; n < 3; n++) self._bouffee([q[0] - 8, q[1] - 14], {r: 6, grad: self.G.vapeur, op: .8, dx: hasard(-40, -20), dy: hasard(-20, -6), duree: 700, delai: n * 120, s1: 2.6}); self._cri(q, 1.4, -1); }, 300);
  this._minuteur(function(){ var c = self._ou('pieds'); self._poussiere([c[0] - 100, SOL], 2, -1); self._poussiere([c[0] + 100, SOL], 2, 1); }, 540);
  this._grouiller(1700, 1.1, 190);
  var ok, impactP = new Promise(function(r){ ok = r; });
  setTimeout(function(){
    if(self.jeton !== j) return;
    var p = self._ou('avant');
    self._poussiere([p[0] + 20, SOL], 4, -1, 1.3);
    self._eclat([cb.x, cb.y], 34, '#fff8d0', {rot: 30});
    self._cri([cb.x + 30, cb.y - 40], 1.3, -1);
    if(o.onImpact) try{ o.onImpact(cb.i); }catch(er){}
    ok();
  }, 1650);
  this._minuteur(function(){ if(!self.etat.enrage) self._fondu('rage', 0, 600); }, 2600);
  var pr = this._seq(k, T).fini.then(function(){ return self._finAction(j, 300); });
  pr.impact = impactP;
  return pr;
};
/* l'état « ouvert » demandé directement (le moteur) : le nœud cède, le roi tombe ; ou il se rétablit et le nœud se resserre */
R._e_ouvert = function(on){
  var self = this, j = this._debutAction();
  if(on){
    this.etat.noeud = false; this.etat.etale = false;
    this._ouvrirNoeud(300);
    var k = [{t: 0, p: {}}, {t: .3, p: reunir(poseDehors(70, {lean: 16, dy: 6, tete: -8, bouche: -24}), {roi: {x: 10, y: 6, a: 40}, roiT: {a: 20}, roiP: {a: -80}})}, {t: .6, p: reunir(RENVERSE, {roi: {x: 22, y: 92, a: 160}}), e: 'cubic-bezier(.6,0,.9,.6)'}, {t: 1, p: POSES.ouvert, e: 'cubic-bezier(.3,.6,.4,1.3)'}];
    return this._seq(k, 1500).fini.then(function(){ self.etat.ouvert = true; self.etat.dos = false; return self._finAction(j, 200); });
  }
  /* le nœud se resserre, le roi se remet sur ses pattes et remonte sur le tas */
  this.etat.ouvert = false;
  this._pulseX(false);
  this._fondu('lache', 0, 400);
  this._fondu('noeud', 1, 400);
  this._fondu('ombreRoi', 1, 600, 900);
  this._fondu('colleRoi', 0, 600);
  var k2 = [{t: 0, p: {}}, {t: .35, p: {roi: {x: 30, y: 40, a: 250}, roiP: {a: 0}, roiPF: {a: 0}}, e: 'cubic-bezier(.3,.6,.5,1)'}, {t: .65, p: {roi: {x: 6, y: -24, a: 352}}, e: 'cubic-bezier(.2,.8,.4,1)'}, {t: 1, p: reunir(this._base(), {roi: {x: 0, y: 0, a: 360}})}];
  return this._seq(k2, 1500).fini.then(function(){
    self.J.roi.forEach(function(e){ e.getAnimations().forEach(function(a){ a.cancel(); }); e.style.transform = tf(fusion(Z)); });
    self.v.roi = fusion(Z);
    return self._finAction(j, 300);
  });
};
R._e_dos = function(on){
  var self = this, j = this._debutAction();
  this.etat.dos = on;
  this._fondu('ombreRoi', on ? 0 : 1, 400, on ? 0 : 700);
  if(on){
    var k = [{t: 0, p: {}}, {t: .35, p: {roi: {x: 14, y: 4, a: 60}, roiT: {a: 24}, roiP: {a: -90}}, e: 'cubic-bezier(.4,0,.6,1)'}, {t: .7, p: reunir(RENVERSE, {roi: {x: 22, y: 92, a: 160}}), e: 'cubic-bezier(.6,0,.9,.6)'}, {t: 1, p: this._base(), e: 'cubic-bezier(.3,.6,.4,1.3)'}];
    this._minuteur(function(){ self._cri(self._ou('roiB'), 1.2, 1); }, 300);
    return this._seq(k, 1300).fini.then(function(){ return self._finAction(j, 200); });
  }
  if(this.etat.ouvert) return this._finAction(j, 300);
  var k2 = [{t: 0, p: {}}, {t: .35, p: {roi: {x: 30, y: 40, a: 250}}, e: 'cubic-bezier(.3,.6,.5,1)'}, {t: .65, p: {roi: {x: 6, y: -24, a: 352}}, e: 'cubic-bezier(.2,.8,.4,1)'}, {t: 1, p: reunir(this._base(), {roi: {x: 0, y: 0, a: 360}})}];
  return this._seq(k2, 1400).fini.then(function(){
    self.J.roi.forEach(function(e){ e.getAnimations().forEach(function(a){ a.cancel(); }); e.style.transform = tf(fusion(Z)); });
    self.v.roi = fusion(Z);
    return self._finAction(j, 300);
  });
};
/* étalés après l'attaque ; ils se rassemblent quand l'état s'en va */
R._e_etale = function(on){
  this.etat.etale = on;
  return this._changerMode(on ? 500 : 700);
};
/* la boule (piège de la lumière) : ils couinent, se cachent les yeux, se ruent au centre et se roulent en boule ; ou ils se déroulent */
R._e_boule = function(on){
  var self = this, j = this._debutAction();
  this.etat.boule = on;
  if(on){
    ['noeud', 'etale'].forEach(function(n){ self.etat[n] = false; });
    this._fondu('tension', 0, 200); this._tensionX(false);
    var k = [{t: 0, p: {}}, {t: .3, p: reunir(poseDehors(6, {dy: -10, tete: -20, bouche: -36, sy: 1.04}), {roi: {y: -10}, roiT: {a: -14}, roiP: {a: 104, x: -12, y: -14}, roiM: {a: -36}}), e: 'cubic-bezier(.1,.9,.3,1)'},
      {t: .62, p: reunir(POSES.boule, {roiP: {a: 0, x: 0, y: 0}}), e: 'cubic-bezier(.5,0,.7,1)'}, {t: 1, p: POSES.boule}];
    ['roiB', 'r1B', 'r3B', 'r5B'].forEach(function(n, i){ self._minuteur(function(){ self._cri(self._ou(n), 1, n === 'r3B' ? 1 : -1); }, 60 + i * 70); });
    this._minuteur(function(){
      self._fondu('boule', 1, 260);
      self._fondu('rats', 0, 300);
      self._fondu('ombre', 0, 300);
      self._seq([{t: 0, p: {boule: {s: .7, y: 0}}}, {t: .45, p: {boule: {sx: 1.08, sy: .9, y: 0}}, e: 'cubic-bezier(.2,.8,.4,1)'}, {t: .7, p: {boule: {sx: .96, sy: 1.05, y: -14}}}, {t: 1, p: {boule: {s: 1, y: 0}}, e: 'cubic-bezier(.6,0,.9,.5)'}], 700);
      var c = self._ou('pieds'); self._poussiere([c[0] - 90, SOL], 3, -1); self._poussiere([c[0] + 90, SOL], 3, 1);
      self._bouleX(true);
    }, 760);
    return this._seq(k, 1300).fini.then(function(){ return attendreMs(300); }).then(function(){ return self._finAction(j, 200); });
  }
  /* ils se déroulent : la boule éclate en rats, qui reprennent leur place */
  this._bouleX(false);
  this._seq([{t: 0, p: {boule: {s: 1}}}, {t: .4, p: {boule: {s: 1.12}}, e: 'ease-out'}, {t: 1, p: {boule: {s: 1}}}], 400);
  this._minuteur(function(){ self._fondu('boule', 0, 200); self._fondu('rats', 1, 200); self._fondu('ombre', 1, 300); var c = self._ou('centre'); self._poussiere([c[0], SOL], 4, 0, 1.2); }, 300);
  var k2 = [{t: 0, p: {}}, {t: .3, p: POSES.boule}, {t: .7, p: reunir(poseDehors(20, {dy: -12, tete: 14, bouche: -34}), {roi: {y: -16}})}, {t: 1, p: this._base()}];
  return this._seq(k2, 1200).fini.then(function(){ return self._finAction(j, 300); });
};
R._s_boule = function(){ return this.etatPublic('boule', true); };

/* ---------------- la mort sans critique : le nœud se défait, ils s'éparpillent en couinant ; le roi part le dernier ---------------- */
R.fuir = function(){
  var self = this, j = this._debutAction(), T = 6200;
  ['ebloui', 'colle', 'ouvert', 'cible', 'enrage', 'gele', 'noeud', 'boule', 'etale', 'dos'].forEach(function(n){ self.etat[n] = false; });
  this._etoiles(false); this._pulseX(false); this._tensionX(false); this._bouleX(false);
  ['rage', 'gel', 'colle', 'colleRoi', 'tension', 'lache', 'boule'].forEach(function(n){ self._fondu(n, 0, 200); });
  this._fondu('rats', 1, 100); this._enleverFlaque('colle');
  var brule = this.etat.brule;
  /* ils se figent, le nœud se tend… et se défait d'un coup */
  var k0 = [{t: 0, p: {}}, {t: .5, p: reunir(poseDehors(14, {tete: 14, bouche: -36, sy: 1.04}), {roiT: {a: 12}, roiM: {a: -36}, roiL: {sy: 1}, noeud: {s: 1.08}, tas: {sy: 1.05}}), e: 'cubic-bezier(.1,.9,.3,1)'}, {t: 1, p: {noeud: {s: .9}}}];
  this._seq(k0, 700);
  this._minuteur(function(){ ['r1B', 'r3B', 'r5B', 'roiB'].forEach(function(n){ self._cri(self._ou(n), 1.1, RAT[n.slice(0, -1)].f); }); }, 120);
  this._minuteur(function(){
    var p = self._ou('pf');
    self._fondu('noeud', 0, 200);
    self._eclat(p, 30, '#ffe8f0', {anneau: '#ffd0dc', duree: 500});
    for(var i = 0; i < 5; i++) self._brin(p, -Math.PI * (.08 + i * .2), hasard(80, 130), i * 30);
    QUEUES.forEach(function(id){ self._opacite('q' + id, 0, 220); });
    self._fondu('qc', 1, 160);
  }, 720);
  /* chacun fuit dans sa direction : à gauche (vers les héros !), à droite, par-dessus le tas ; le tas se dissout */
  var FUITE = {
    r2: {t0: 900, dx: -900, dy: 0, d: 1300}, r9: {t0: 1050, dx: -1000, dy: -30, d: 1500, saut: 40}, r1: {t0: 1150, dx: -1100, dy: 10, d: 1400},
    r5: {t0: 1250, dx: -900, dy: -60, d: 1500, saut: 90}, r7: {t0: 1350, dx: 900, dy: 20, d: 1600, demi: true}, r10: {t0: 1450, dx: 900, dy: 10, d: 1400},
    r3: {t0: 1550, dx: 950, dy: 0, d: 1300}, r6: {t0: 1650, dx: 700, dy: -140, d: 1500, saut: 80}, r8: {t0: 1800, dx: 500, dy: -200, d: 1500, saut: 120, demi: true}
  };
  Object.keys(FUITE).forEach(function(id){
    var f = FUITE[id], r = RAT[id], n = 6, k = [{t: 0, p: {}}], tour = f.demi ? (r.f < 0 ? -1 : 1) : 1;
    var d0 = f.t0, dur = f.d + 400;
    function t(ms){ return ms / dur; }
    /* il sursaute… (et fait demi-tour s'il doit fuir de l'autre côté) */
    var s = {}; s[id] = {y: -16, a: -6 * r.f, sx: 1, sy: 1.06}; s[id + 'T'] = {a: 20}; if(r.jaw) s[id + 'M'] = {a: -38};
    k.push({t: t(220), p: s, e: 'cubic-bezier(.1,.9,.3,1)'});
    var s2 = {}; s2[id] = {y: 0, a: 0, sx: tour, sy: 1}; s2[id + 'T'] = {a: 6};
    k.push({t: t(400), p: s2, e: 'cubic-bezier(.6,0,.9,.5)'});
    for(var i = 1; i <= n; i++){
      var q = {}, fr = i / n, arc = f.saut ? -Math.sin(fr * Math.PI) * f.saut : 0;
      q[id] = {x: r1(f.dx * fr), y: r1(f.dy * fr + arc + (i % 2 ? -8 : 0)), a: r1((i % 2 ? 6 : -4) * -r.f * tour), sx: tour, sy: i % 2 ? 1.05 : .95};
      q[id + 'P'] = {a: i % 2 ? -30 : 20}; q[id + 'T'] = {a: i % 2 ? 10 : 2};
      k.push({t: t(400 + f.d * fr), p: q, e: 'linear'});
    }
    self._minuteur(function(){ self._seq(k, dur, {sansQueue: true}); self._cri(self._ou(id + 'B'), 1, r.f * (f.demi ? -1 : 1)); self._opacite(id, 0, 400, dur - 400); var c = self._ou(id); self._poussiere([c[0], SOL], 2, f.dx < 0 ? 1 : -1, .7); }, d0);
  });
  this._minuteur(function(){ self._seq([{t: 0, p: {tas: {sy: 1, sx: 1}}}, {t: 1, p: {tas: {sy: .2, sx: 1.2, y: 20}}}], 1400); self._fondu('ombre', .4, 1400); }, 1300);
  this._minuteur(function(){ self._opacite('tas', 0, 900); }, 1800);
  /* le roi, resté seul, regarde autour de lui… sa couronne glisse et tombe… et il détale à son tour */
  var kr = [{t: 0, p: {}},
    {t: .12, p: {roi: {y: 10, a: 4}, roiT: {a: -4}, roiM: {a: -10}}, e: 'ease-out'},
    {t: .25, p: {roiT: {a: 10, y: -2}}}, {t: .37, p: {roiT: {a: -8}}},
    {t: .5, p: {roi: {y: 40, a: 6}, roiT: {a: 16}, roiM: {a: -36}, roiC: {a: -40, x: -10, y: 8}}, e: 'cubic-bezier(.3,.6,.4,1)'},
    {t: .6, p: {roi: {y: 60, a: -4, sx: -1}, roiT: {a: 10}, roiP: {a: -20}}, e: 'cubic-bezier(.3,.6,.4,1)'}];
  for(var i = 1; i <= 5; i++) kr.push({t: .6 + i * .08, p: {roi: {x: r1(1000 * i / 5), y: r1(60 + (i % 2 ? -14 : 0)), a: i % 2 ? -6 : 4, sx: -1}, roiP: {a: i % 2 ? -34 : 20}, roiPF: {a: i % 2 ? 26 : -20}}, e: 'linear'});
  var couronneOk;
  this._minuteur(function(){
    self._seq(kr, 3600, {sansQueue: true});
    self._minuteur(function(){ self._cri(self._ou('roiB'), 1.3, -1); }, 400);
    self._minuteur(function(){ self._cri(self._ou('roiB'), 1.3, 1); }, 2100);
    /* la couronne tombe et reste au sol */
    self._minuteur(function(){
      var d = self._detacher('roiC'), arr = [d.c[0] - 30, SOL - 22];
      self._voler(d.g, d.c, arr, {haut: 40, rot: -70, duree: 900, rot0: 0, rebond: 10, glisse: -10, onSol: function(){ self._etincelles([arr[0], SOL - 6], 6, {v: 40, coul: ['#fff0c0', '#ffd060', '#e6ffd0']}); self._poussiere([arr[0], SOL], 2, 0, .7); }});
      couronneOk = true;
    }, 1700);
    self._opacite('roi', 0, 400, 3200);
  }, 2400);
  this._minuteur(function(){ self._fondu('ombre', 0, 800); self._fondu('ombreRoi', 0, 600); }, 4800);
  return attendreMs(T + 600).then(function(){
    self._couperBoucles();
    clearTimeout(self.fx.fumee);
    self._fondu('feu', 0, 300); self._couperX('feu');
    self.etat.brule = false;
    self.mort = true;
    self.enAction = false;
  });
};
R.mourir = function(){ return this.fuir(); };

/* ---------------- la mort par un critique : l'explosion ---------------- */
R.exploser = function(scene){
  var self = this, j = this._debutAction(), boomOk, boomP = new Promise(function(ok){ boomOk = ok; });
  ['ebloui', 'colle', 'cible', 'gele', 'noeud', 'etale'].forEach(function(n){ self.etat[n] = false; });
  this._etoiles(false); this._tensionX(false);
  ['gel', 'colle', 'tension'].forEach(function(n){ self._fondu(n, 0, 200); });
  /* ils enflent, tremblent, les yeux virent au rouge, ils couinent tous */
  this._fondu('rage', 1, 200);
  var k = [{t: 0, p: {}}];
  for(var i = 1; i <= 10; i++) k.push({t: i / 11, p: reunir(poseDehors(i * 1.6, {tete: 14, bouche: -38, sy: 1 + i * .01}), {masse: {sx: 1 + i * .022, sy: 1 + i * .028, x: i % 2 ? 5 : -5, y: -i}, boule: {sx: 1 + i * .02, sy: 1 + i * .02}}), e: 'linear'});
  k.push({t: 1, p: {masse: {sx: 1.26, sy: 1.32}}, e: 'ease-in'});
  ['r1B', 'r3B', 'roiB', 'r5B', 'r9B'].forEach(function(n, q){ self._minuteur(function(){ if(!self.etat.boule) self._cri(self._ou(n), 1, RAT[n.slice(0, -1)].f); }, q * 110); });
  var p = this._seq(k, 760).fini.then(function(){
    var cq = self._calque(scene), u = cq.u(), c = cq.ancre('centre'), sol = cq.ancre('pieds')[1];
    var cx = c[0], cy = c[1];
    var id = PX + 'Boom' + (++NUM);
    cq.defs('<radialGradient id="' + id + 'g"><stop offset="0" stop-color="#fff8d0"/><stop offset=".4" stop-color="#ffb040" stop-opacity=".9"/><stop offset=".75" stop-color="#a02a40" stop-opacity=".5"/><stop offset="1" stop-color="#3a1030" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="' + id + 'b"><stop offset="0" stop-color="#0c0812"/><stop offset=".55" stop-color="#1a1222" stop-opacity=".95"/><stop offset="1" stop-color="#22182c" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="' + id + 'c"><stop offset="0" stop-color="#6a5a80" stop-opacity=".7"/><stop offset="1" stop-color="#4a3e5a" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="' + id + 'o" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#c8bca0"/></linearGradient>');
    var gB = 'url(#' + id + 'g)', gN = 'url(#' + id + 'b)', gC = 'url(#' + id + 'c)', gO = 'url(#' + id + 'o)';
    /* la couronne est arrachée (copie dans le repère fixe), puis la masse disparaît d'un coup */
    var cour = self.etat.boule ? null : self._detacher('roiC');
    self.J.masse.forEach(function(e){ e.style.opacity = 0; });
    self.etat.boule = false; self._bouleX(false);
    clearTimeout(self.fx.fumee); self._couperX('feu'); self._couperX('pulse');
    boomOk();
    /* le nuage de brume noire, qui reste un moment puis se dissipe */
    var brumes = [];
    for(var n = 0; n < 10; n++){
      var a = n / 10 * Math.PI * 2 + hasard(-.3, .3), d = .3 + Math.random() * .7, r = hasard(60, 95) * u, x = Math.cos(a) * d * 150 * u, y = Math.sin(a) * d * 80 * u - 20 * u;
      var g = cq.g('<circle r="' + f1(r) + '" fill="' + gN + '"/><circle cx="' + f1(-r * .25) + '" cy="' + f1(-r * .3) + '" r="' + f1(r * .6) + '" fill="' + gC + '"/>');
      var dx = x * 1.6 + hasard(-20, 20) * u, dy = y * 1.3 - hasard(20, 70) * u;
      brumes.push(g.animate([{transform: 'translate(' + f1(cx) + 'px,' + f1(cy) + 'px) scale(.1)', opacity: 0}, {offset: .05, opacity: 1, transform: 'translate(' + f1(cx + x) + 'px,' + f1(cy + y) + 'px) scale(1)'},
        {offset: .55, opacity: .9, transform: 'translate(' + f1(cx + dx) + 'px,' + f1(cy + dy) + 'px) scale(1.45)'}, {transform: 'translate(' + f1(cx + dx * 1.3) + 'px,' + f1(cy + dy * 1.2 - 40 * u) + 'px) scale(2)', opacity: 0}],
        {duration: hasard(2800, 3600), easing: 'cubic-bezier(.12,.75,.3,1)', fill: 'forwards'}));
    }
    /* BOUM : le cœur de feu, la grande étoile, les ondes de choc */
    var et = cq.g('<path d="' + etoileD(120 * u, 12, .55) + '" fill="#ffd060" stroke="' + O + '" stroke-width="' + f1(4 * u) + '"/><path d="' + etoileD(76 * u, 12, .55) + '" fill="#fff4c0"/>');
    et.animate([{transform: 'translate(' + f1(cx) + 'px,' + f1(cy) + 'px) scale(.15) rotate(0deg)', opacity: 1}, {offset: .35, transform: 'translate(' + f1(cx) + 'px,' + f1(cy) + 'px) scale(1) rotate(12deg)', opacity: 1}, {transform: 'translate(' + f1(cx) + 'px,' + f1(cy) + 'px) scale(1.15) rotate(20deg)', opacity: 0}], {duration: 520, easing: 'cubic-bezier(.1,.8,.3,1)', fill: 'forwards'}).finished.then(oter(et), oter(et));
    var co = cq.g('<circle r="' + f1(130 * u) + '" fill="' + gB + '"/>');
    co.animate([{transform: 'translate(' + f1(cx) + 'px,' + f1(cy) + 'px) scale(.2)', opacity: 1}, {transform: 'translate(' + f1(cx) + 'px,' + f1(cy) + 'px) scale(1.7)', opacity: 0}], {duration: 560, easing: 'ease-out', fill: 'forwards'}).finished.then(oter(co), oter(co));
    var ro = cq.g('<circle r="' + f1(100 * u) + '" fill="none" stroke="#2a1c3c" stroke-width="' + f1(12 * u) + '" stroke-opacity=".8"/><circle r="' + f1(100 * u) + '" fill="none" stroke="#ffffff" stroke-width="' + f1(4 * u) + '"/>');
    ro.animate([{transform: 'translate(' + f1(cx) + 'px,' + f1(cy) + 'px) scale(.2)', opacity: .95}, {transform: 'translate(' + f1(cx) + 'px,' + f1(cy) + 'px) scale(3.2)', opacity: 0}], {duration: 760, easing: 'cubic-bezier(.1,.8,.3,1)', fill: 'both'}).finished.then(oter(ro), oter(ro));
    var an = cq.g('<ellipse rx="' + f1(110 * u) + '" ry="' + f1(14 * u) + '" fill="none" stroke="' + LUNE + '" stroke-width="' + f1(5 * u) + '"/>');
    an.animate([{transform: 'translate(' + f1(cx) + 'px,' + f1(sol) + 'px) scale(.3)', opacity: 1}, {transform: 'translate(' + f1(cx) + 'px,' + f1(sol) + 'px) scale(4,2)', opacity: 0}], {duration: 1000, easing: 'cubic-bezier(.1,.7,.3,1)', fill: 'forwards'}).finished.then(oter(an), oter(an));
    /* les éclats : des os, des bouts de queues nouées, des touffes de poil */
    for(var e = 0; e < 7; e++){
      var ae = -Math.PI * (.08 + e * .14), ve = hasard(130, 240) * u, re = hasard(-700, 700), html;
      if(e % 3 === 0) html = '<g transform="scale(' + f1(u * .9) + ')">' + Pw(osD(12), gO, 2.2) + '</g>';
      else if(e % 3 === 1) html = '<g transform="scale(' + f1(u) + ')">' + L('M-14 0 C -10 -12 4 -12 4 0 C 4 10 -10 10 -8 0 C -6 -8 10 -8 14 4', O, 7.4) + L('M-14 0 C -10 -12 4 -12 4 0 C 4 10 -10 10 -8 0 C -6 -8 10 -8 14 4', '#e49aaa', 3.8) + '</g>';
      else html = '<g transform="scale(' + f1(u) + ')">' + Pw('M-10 4 L -6 -8 L -2 2 L 2 -10 L 5 2 L 10 -6 L 10 6 Z', '#4a3e56', 2) + '</g>';
      var ec = cq.g(html);
      ec.animate([{transform: 'translate(' + f1(cx) + 'px,' + f1(cy) + 'px) rotate(0deg)', opacity: 1}, {offset: .45, transform: 'translate(' + f1(cx + Math.cos(ae) * ve) + 'px,' + f1(cy + Math.sin(ae) * ve) + 'px) rotate(' + f1(re * .5) + 'deg)', opacity: 1},
        {transform: 'translate(' + f1(cx + Math.cos(ae) * ve * 1.5) + 'px,' + f1(sol + 10 * u) + 'px) rotate(' + f1(re) + 'deg)', opacity: 0}], {duration: hasard(1300, 1900), easing: 'cubic-bezier(.2,.6,.6,1)', fill: 'forwards'}).finished.then(oter(ec), oter(ec));
    }
    /* la couronne tournoie très haut… et retombe, et reste */
    if(cour){
      var arr = [cour.c[0] + 30, SOL - 22];
      self._voler(cour.g, cour.c, arr, {haut: 300, rot: 760, rot0: cour.ang, duree: 2000, rebond: 14, glisse: 12, bascule: 12, onSol: function(){ self._etincelles([arr[0], SOL - 6], 8, {v: 46, coul: ['#fff0c0', '#ffd060', '#e6ffd0']}); self._poussiere([arr[0], SOL], 3, 0, .8); }});
    }
    /* ce qui reste : un tas de cendres, des os, un bout de nœud (posé un peu après le BOUM) */
    setTimeout(function(){ self._restes(); }, 380);
    self._couperBoucles();
    self.mort = true;
    return Promise.all(brumes.map(fini)).then(function(){ cq.retirer(); self.enAction = false; });
  });
  p.boom = boomP;
  return p;
};
/* les restes : cendres, os, un bout de nœud rose, et de petits filets de fumée */
R._restes = function(){
  var D = this.D, s = '', self = this, x = 292, y = SOL;
  var gC = D.id(), gO = D.id();
  D.vivant.insertAdjacentHTML('beforeend', '<linearGradient id="' + gC + '" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a7286"/><stop offset=".5" stop-color="#4a4456"/><stop offset="1" stop-color="#1e1a26"/></linearGradient>' +
    '<linearGradient id="' + gO + '" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#c8bca0"/></linearGradient>');
  s += '<ellipse cx="0" cy="2" rx="150" ry="13" fill="#000" fill-opacity=".4"/>';
  s += Pw('M-140 4 C -120 -14 -70 -30 -10 -32 C 50 -32 110 -18 140 4 C 80 12 -80 12 -140 4 Z', 'url(#' + gC + ')', 3);
  s += F(rond(-90, -8, 3) + rond(-40, -20, 2.4) + rond(30, -22, 2.8) + rond(80, -10, 2.2) + rond(-10, -14, 2), '#9a92a6', fo(.7));
  s += L('M-100 -10 C -60 -26 20 -30 90 -18', '#a8a0b8', 2, so(.5));
  s += F(rond(-62, -14, 2) + rond(12, -26, 1.6) + rond(56, -16, 1.8), '#ff9a40', fo(.85));
  function os(x0, y0, l, a){ return '<g transform="translate(' + x0 + ' ' + y0 + ') rotate(' + a + ')">' + Pw(osD(l), 'url(#' + gO + ')', 2.2) + L('M' + (-l + 4) + ' -1 L ' + (l - 4) + ' -1', '#ffffff', 1.2, so(.7)) + '</g>'; }
  s += os(-70, -22, 18, -14) + os(40, -28, 14, 22) + os(96, -8, 10, -30) + os(-110, -6, 10, 10);
  /* un petit crâne de rat */
  s += '<g transform="translate(-20 -30) rotate(-8)">' + Pw('M-16 2 C -18 -8 -8 -14 4 -12 C 14 -10 20 -4 22 2 C 14 6 -6 8 -16 2 Z', 'url(#' + gO + ')', 2) + C(-4, -4, 3, '#2a2018') + L('M16 0 l 6 4', '#8a7a60', 1.6) + '</g>';
  /* un bout du nœud, rose, encore emmêlé */
  var nq = 'M-12 0 C -10 -12 6 -12 6 0 C 6 10 -10 10 -8 0 C -6 -10 12 -8 14 2 C 16 8 22 8 26 2';
  s += '<g transform="translate(10 -16)">' + L(nq, O, 7.4) + L(nq, '#d48a9a', 3.8) + L(nq, '#f8d0d8', 1.2, so(.5)) + '</g>';
  var g = this._el(this.S.fixe, '<g transform="translate(' + x + ' ' + y + ')"><g>' + s + '</g></g>');
  g.firstChild.firstChild.animate([{opacity: 0, transform: 'scale(.3)'}, {offset: .6, opacity: 0}, {opacity: 1, transform: 'scale(1)'}], {duration: 1400, easing: 'ease-out', fill: 'both'});
  (function fumet(n){ if(n <= 0) return; self._bouffee([x + hasard(-80, 80), y - 30], {r: 8, grad: self.G.fumee, op: .5, dx: hasard(-6, 14), dy: -60, duree: 1700, s1: 2.4}); setTimeout(function(){ fumet(n - 1); }, 480); })(9);
};

/* =====================================================================
   E. L'enregistrement
   ===================================================================== */
var INFO = {
  id: 'roirats', nom: 'Le Roi des rats', rang: 'elite', pv: 220, attaque: 'grouillement 10 sur chaque héros',
  cadre: {w: 330, h: r1(330 * VB[3] / VB[2])}, sol: r3((SOL - VB[1]) / VB[3]), vole: false, places: 2,
  attaques: ['grouillement'],
  specials: ['noeud', 'tirent', 'roi-colle', 'panique', 'charge', 'boule'],
  etats: ['enrage', 'brule', 'colle', 'ebloui', 'gele', 'ouvert', 'dos', 'cible', 'noeud', 'boule', 'etale']
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
global.BETES[ID] = {info: INFO, creer: function(conteneur, options){ return acteur(new Roi(conteneur, options)); }};
})(typeof window !== 'undefined' ? window : this);
