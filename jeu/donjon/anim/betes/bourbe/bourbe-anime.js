/* bourbe-anime.js — Bourbe, le crapaud du puits, le boss animé du donjon (Les Enquêteurs de Brumeval)
   Module autonome, sans dépendance. Il injecte son propre CSS (préfixe .bt-bourbe-). Il ne joue aucun son.
   Contrat commun : jeu/donjon/anim/betes/CONTRAT.md. Dessin validé : bestiaire/betes/10-bourbe.js (œil de côté,
   glande, bouche fendue, couronne de verrues, algues sur le dos, mains boudinées posées sur la margelle).

     var b = BETES.bourbe.creer(conteneur);      // le SVG remplit le conteneur (490 × 340), Bourbe regarde à gauche

   Actions (Promise, résolue quand il est revenu à son attente) :
     entrer()                       il émerge lentement de l'eau noire, puis ouvre l'œil
     attaquer('langue', o)          la langue jaillit jusqu'à o.vers {x, y} (écran), attrape, revient, il avale
                                    o.onImpact() : le héros est attrapé (le moteur le cache) ; o.onAvale() (facultatif) : il est avalé
                                    ensuite l'état « avale » : une bosse se promène dans son ventre
     attaquer('saut', o)            il bondit hors de l'eau et retombe : gerbe, onde de choc ; o.onImpact() au contact
                                    (plus haut et plus violent si l'état « gonfle » est actif)
     touche(type)                   fleche, fleche-argent, fleche-lourde, dague, feu, lumiere, louche, colle, huile, nuage,
                                    givre, acide, bruit, bouclier, rebond (immunisé : la flèche rebondit, il nargue)
     special(nom, o)                'recrache' (o.onImpact au moment où le héros sort, au point ancre('bouche')),
                                    'chatouille' (il rit, hoquette, recrache et roule sur le dos), 'plonger', 'remonter',
                                    'mouche' (il gobe une mouche), 'rot'
     tousser()                      3 quintes, lentement
     mourir() / fuir()              il se dégonfle, rote une dernière fois, coule ventre en l'air
     exploser(scene)                l'explosion du boss : brume noire, gerbe d'eau noire, éclats ; il reste des os dans la vase
   États (se cumulent, etat(nom, on) renvoie une Promise) :
     enrage, brule, colle, ebloui, gele, ouvert, dos, cible  +  berge (sorti de l'eau), sec (peau craquelée),
     gonfle (énorme, tendu), avale (un héros dans le ventre), sous (sous l'eau)
   attendre(), arreter(), etatCourant(), ancre(nom) : tete, pointfaible, centre, bouche, pieds, haut (coordonnées écran)

   Le dessin est découpé en pièces articulées (<g data-j> au pivot ramené à (0,0)), animées avec la Web Animations API.
   Deux « chaînes » portent les mêmes transformations : la chaîne A (le corps, en partie sous l'eau) est dessinée
   avant l'eau du devant, la chaîne B (les mains posées sur la margelle) après.

   Pour la fluidité sur tablette (exigence de Romain, 9 novembre) :
   - aucun filtre (ni SVG, ni CSS), aucun mélange ; les flous et lueurs sont des dégradés radiaux ;
   - chaque pièce <g data-j="nom"> a un contenu FIXE et n'est animée qu'en transform (pivot : transform-origin) ;
   - les états sont des variantes pré-dessinées <g data-j="v-nom"> qu'on montre ou cache (opacité, puis visibility) ;
   - les boucles autonomes (étoiles, flammes, pulsation du point faible) animent des pièces <g data-j="x-nom"> ;
   - les petites formes n'ont ni opacity ni transform (fill-opacity / stroke-opacity, géométrie déjà tournée) ;
   - au plus 24 particules en même temps, retirées du DOM à la fin. Mesure : perf.py (processeur ralenti ×6). */
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
function Pw(d, f, w, x){ return '<path d="' + d + '" fill="' + f + '" stroke="' + O + '" stroke-width="' + w + '" stroke-linejoin="round" stroke-linecap="round"' + (x || '') + '/>'; }
function L(d, c, w, x){ return '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + w + '" stroke-linejoin="round" stroke-linecap="round"' + (x || '') + '/>'; }
function F(d, f, x){ return '<path d="' + d + '" fill="' + f + '"' + (x || '') + '/>'; }
function C(x, y, r, f, x2){ return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + f + '"' + (x2 || '') + '/>'; }
function G(a, s){ return '<g' + a + '>' + s + '</g>'; }
/* un chemin écrit autour d'un centre : chaque paire « x y » est décalée */
function T2(d, cx, cy){ return d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, function(m, a, b){ return (cx + +a) + ' ' + (cy + +b); }); }
function bez(p, t){ var u = 1 - t; return [0, 1].map(function(i){ return u * u * u * p[0][i] + 3 * u * u * t * p[1][i] + 3 * u * t * t * p[2][i] + t * t * t * p[3][i]; }); }
/* un bord bosselé le long d'une courbe (les bosses sortent à gauche du sens de marche) */
function bosses(p, t0, t1, n, h, R){
  var s = '', a = bez(p, t0);
  for(var k = 1; k <= n; k++){
    var b = bez(p, t0 + (t1 - t0) * k / n), dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy) || 1, hh = h * (0.4 + R() * 1.2);
    s += ' Q ' + f1((a[0] + b[0]) / 2 + dy / l * hh * 2) + ' ' + f1((a[1] + b[1]) / 2 - dx / l * hh * 2) + ' ' + f1(b[0]) + ' ' + f1(b[1]);
    a = b;
  }
  return s;
}
/* courbe douce par des points (milieux en relais), comme dans le bestiaire */
function lisseQ(pts, ferme){
  var m = function(a, b){ return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; }, s;
  if(ferme){
    var n = pts.length, d0 = m(pts[n - 1], pts[0]); s = 'M' + f1(d0[0]) + ' ' + f1(d0[1]);
    for(var i = 0; i < n; i++){ var q = m(pts[i], pts[(i + 1) % n]); s += ' Q ' + f1(pts[i][0]) + ' ' + f1(pts[i][1]) + ' ' + f1(q[0]) + ' ' + f1(q[1]); }
    return s + ' Z';
  }
  s = 'M' + f1(pts[0][0]) + ' ' + f1(pts[0][1]);
  for(var j = 1; j < pts.length - 1; j++){ var q2 = m(pts[j], pts[j + 1]); s += ' Q ' + f1(pts[j][0]) + ' ' + f1(pts[j][1]) + ' ' + f1(q2[0]) + ' ' + f1(q2[1]); }
  var z = pts[pts.length - 1]; return s + ' L ' + f1(z[0]) + ' ' + f1(z[1]);
}
/* courbe de Catmull-Rom (comme le rat) */
function lisseC(pts, ferme){
  var n = pts.length, s = 'M' + pt(pts[0]), m = ferme ? n : n - 1;
  function q(i){ return ferme ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]; }
  for(var i = 0; i < m; i++){
    var a = q(i - 1), b = q(i), c = q(i + 1), e = q(i + 2);
    s += ' C ' + pt([b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6]) + ' ' + pt([c[0] - (e[0] - b[0]) / 6, c[1] - (e[1] - b[1]) / 6]) + ' ' + pt(c);
  }
  return s + (ferme ? ' Z' : '');
}
/* un tube (bras, doigt) le long de points, avec ses deux bords */
function tube(pts, ws){
  var n = pts.length, Gc = [], Dc = [];
  for(var i = 0; i < n; i++){
    var a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, w = ws[i] / 2;
    Gc.push([pts[i][0] - dy / l * w, pts[i][1] + dx / l * w]); Dc.push([pts[i][0] + dy / l * w, pts[i][1] - dx / l * w]);
  }
  function bout(i, j, w){ var dx = pts[i][0] - pts[j][0], dy = pts[i][1] - pts[j][1], l = Math.hypot(dx, dy) || 1; return [pts[i][0] + dx / l * w * .5, pts[i][1] + dy / l * w * .5]; }
  return {d: lisseC(Gc.concat([bout(n - 1, n - 2, ws[n - 1])], Dc.slice().reverse(), [bout(0, 1, ws[0])]), true), g: Gc, dr: Dc};
}
/* un ruban qui s'affine (algue, queue) le long d'une ligne de points */
function ruban(pts, w0, w1){
  var g = [], dr = [], n = pts.length;
  for(var i = 0; i < n; i++){
    var a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy) || 1, w = (w0 + (w1 - w0) * i / (n - 1)) / 2;
    g.push([pts[i][0] + dy / l * w, pts[i][1] - dx / l * w]); dr.push([pts[i][0] - dy / l * w, pts[i][1] + dx / l * w]);
  }
  return lisseQ(g.concat(dr.reverse()), true);
}
function ondeP(x0, y0, dx, dy, amp, freq, ph, n){
  var p = []; for(var i = 0; i < n; i++){ var t = i / (n - 1), l = Math.sqrt(dx * dx + dy * dy), w = Math.sin(t * freq + ph) * amp * (0.3 + t); p.push([x0 + dx * t - dy / l * w, y0 + dy * t + dx / l * w]); } return p;
}
function tache(cx, cy, rx, ry, R, k){ var p = []; k = k || 7; for(var i = 0; i < k; i++){ var a = i / k * Math.PI * 2 + R() * .4, r = .65 + R() * .5; p.push([cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r]); } return lisseQ(p, true); }
/* reflet mouillé : un fin croissant, posé et tourné */
function rotP(p, ang, c){ var r = ang * Math.PI / 180, co = Math.cos(r), si = Math.sin(r), dx = p[0] - c[0], dy = p[1] - c[1]; return [c[0] + dx * co - dy * si, c[1] + dx * si + dy * co]; }
function reflet(x, y, lg, ang, ep, op){
  var q = [[-lg / 2, 0], [0, -ep], [lg / 2, 0], [0, -ep * .3], [-lg / 2, 0]].map(function(p){ return rotP([x + p[0], y + p[1]], ang, [x, y]); });
  return '<path d="M' + pt(q[0]) + ' Q ' + pt(q[1]) + ' ' + pt(q[2]) + ' Q ' + pt(q[3]) + ' ' + pt(q[4]) + ' Z" fill="#fbfff4" fill-opacity="' + (op || .75) + '"/>';
}
/* une ellipse tournée, écrite directement en chemin */
function ellR(cx, cy, rx, ry, ang){
  var k = .5523, P0 = [[cx - rx, cy], [cx - rx, cy - ry * k], [cx - rx * k, cy - ry], [cx, cy - ry], [cx + rx * k, cy - ry], [cx + rx, cy - ry * k], [cx + rx, cy], [cx + rx, cy + ry * k], [cx + rx * k, cy + ry], [cx, cy + ry], [cx - rx * k, cy + ry], [cx - rx, cy + ry * k]].map(function(p){ return rotP(p, ang || 0, [cx, cy]); });
  return 'M' + pt(P0[0]) + ' C ' + pt(P0[1]) + ' ' + pt(P0[2]) + ' ' + pt(P0[3]) + ' C ' + pt(P0[4]) + ' ' + pt(P0[5]) + ' ' + pt(P0[6]) + ' C ' + pt(P0[7]) + ' ' + pt(P0[8]) + ' ' + pt(P0[9]) + ' C ' + pt(P0[10]) + ' ' + pt(P0[11]) + ' ' + pt(P0[0]) + ' Z';
}
function ell(cx, cy, rx, ry){ var k = .5523; return 'M' + f1(cx - rx) + ' ' + f1(cy) + ' C ' + f1(cx - rx) + ' ' + f1(cy - ry * k) + ' ' + f1(cx - rx * k) + ' ' + f1(cy - ry) + ' ' + f1(cx) + ' ' + f1(cy - ry) + ' C ' + f1(cx + rx * k) + ' ' + f1(cy - ry) + ' ' + f1(cx + rx) + ' ' + f1(cy - ry * k) + ' ' + f1(cx + rx) + ' ' + f1(cy) + ' C ' + f1(cx + rx) + ' ' + f1(cy + ry * k) + ' ' + f1(cx + rx * k) + ' ' + f1(cy + ry) + ' ' + f1(cx) + ' ' + f1(cy + ry) + ' C ' + f1(cx - rx * k) + ' ' + f1(cy + ry) + ' ' + f1(cx - rx) + ' ' + f1(cy + ry * k) + ' ' + f1(cx - rx) + ' ' + f1(cy) + ' Z'; }
function goutteD(x, y, r){ return 'M' + f1(x) + ' ' + f1(y - r * 2.6) + ' C ' + f1(x + r * .3) + ' ' + f1(y - r * 1.5) + ' ' + f1(x + r) + ' ' + f1(y - r * .8) + ' ' + f1(x + r) + ' ' + f1(y) + ' A ' + r + ' ' + r + ' 0 0 1 ' + f1(x - r) + ' ' + f1(y) + ' C ' + f1(x - r) + ' ' + f1(y - r * .8) + ' ' + f1(x - r * .3) + ' ' + f1(y - r * 1.5) + ' ' + f1(x) + ' ' + f1(y - r * 2.6) + ' Z'; }
function goutte(x, y, r, fill){ return Pw(goutteD(x, y, r), fill, 1.5, ' opacity=".95"') + C(f1(x + r * .35), f1(y - r * .25), f1(r * .32), '#fff', ' opacity=".95"'); }
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
/* rotation d'angle a autour du point Q, exprimée autour du pivot Pv : {a, x, y} */
function rotAutour(a, Q, Pv){
  var r = a * Math.PI / 180, c = Math.cos(r), s = Math.sin(r), dx = Q[0] - Pv[0], dy = Q[1] - Pv[1];
  return {a: a, x: dx - (dx * c - dy * s), y: dy - (dx * s + dy * c)};
}

/* les dégradés et découpes d'un Bourbe (identifiants uniques par bête) */
function Defs(u){ this.u = u; this.n = 0; this.l = []; this.cache = {}; }
Defs.prototype.id = function(){ return this.u + (++this.n); };
Defs.prototype.stops = function(st){ return st.map(function(t){ return '<stop offset="' + t[0] + '" stop-color="' + t[1] + '" stop-opacity="' + (t[2] == null ? 1 : t[2]) + '"/>'; }).join(''); };
Defs.prototype.g = function(c, fort){
  fort = fort || 1; var id = this.id();
  this.l.push('<linearGradient id="' + id + '" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + clair(c, .26 * fort) + '"/><stop offset=".45" stop-color="' + c + '"/><stop offset="1" stop-color="' + sombre(c, .42 * fort) + '"/></linearGradient>');
  return 'url(#' + id + ')';
};
Defs.prototype.halo = function(c0, c1){ var id = this.id(); this.l.push('<radialGradient id="' + id + '"><stop offset="0" stop-color="' + c0 + '"/><stop offset=".45" stop-color="' + c1 + '" stop-opacity=".6"/><stop offset="1" stop-color="' + c1 + '" stop-opacity="0"/></radialGradient>'); return 'url(#' + id + ')'; };
/* dégradés posés dans l'espace du dessin : plusieurs morceaux partagent la même lumière, sans couture */
Defs.prototype.linU = function(x1, y1, x2, y2, st){ var id = this.id(); this.l.push('<linearGradient id="' + id + '" gradientUnits="userSpaceOnUse" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '">' + this.stops(st) + '</linearGradient>'); return 'url(#' + id + ')'; };
Defs.prototype.radU = function(cx, cy, r, st, fx, fy, tr){ var id = this.id(); this.l.push('<radialGradient id="' + id + '" gradientUnits="userSpaceOnUse" cx="' + cx + '" cy="' + cy + '" r="' + r + '"' + (fx != null ? ' fx="' + fx + '" fy="' + fy + '"' : '') + (tr ? ' gradientTransform="' + tr + '"' : '') + '>' + this.stops(st) + '</radialGradient>'); return 'url(#' + id + ')'; };
/* dégradés relatifs à chaque forme */
Defs.prototype.radBox = function(st, fx, fy){ var id = this.id(); this.l.push('<radialGradient id="' + id + '" cx=".5" cy=".5" r=".55" fx="' + fx + '" fy="' + fy + '">' + this.stops(st) + '</radialGradient>'); return 'url(#' + id + ')'; };
Defs.prototype.rad = function(st, cx, cy, r){ var id = this.id(); this.l.push('<radialGradient id="' + id + '" cx="' + cx + '" cy="' + cy + '" r="' + r + '">' + this.stops(st) + '</radialGradient>'); return 'url(#' + id + ')'; };
Defs.prototype.lin = function(st, x1, y1, x2, y2){ var id = this.id(); this.l.push('<linearGradient id="' + id + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '">' + this.stops(st) + '</linearGradient>'); return 'url(#' + id + ')'; };
Defs.prototype.clip = function(chemins){ var id = this.id(); this.l.push('<clipPath id="' + id + '">' + [].concat(chemins).map(function(c){ return '<path d="' + c + '"/>'; }).join('') + '</clipPath>'); return ' clip-path="url(#' + id + ')"'; };
/* un « flou précalculé » : une tache douce faite d'un dégradé (aucun filtre, bon pour la tablette) */
Defs.prototype.doux = function(c, op){
  var k = c + '|' + (op == null ? 1 : op);
  if(!this.cache[k]){ var id = this.id(), h = '<radialGradient id="' + id + '"><stop offset="0" stop-color="' + c + '" stop-opacity="' + (op == null ? 1 : op) + '"/><stop offset=".5" stop-color="' + c + '" stop-opacity="' + f1((op == null ? 1 : op) * .55) + '"/><stop offset="1" stop-color="' + c + '" stop-opacity="0"/></radialGradient>'; this.l.push(h); if(this.vivant) this.vivant.insertAdjacentHTML('beforeend', h); this.cache[k] = 'url(#' + id + ')'; }
  return this.cache[k];
};
function douce(D, cx, cy, rx, ry, c, op){ return '<ellipse cx="' + f1(cx) + '" cy="' + f1(cy) + '" rx="' + f1(rx) + '" ry="' + f1(ry) + '" fill="' + D.doux(c) + '"' + (op == null || op == 1 ? '' : ' fill-opacity="' + op + '"') + '/>'; }
/* les opacités des petites formes deviennent fill-opacity / stroke-opacity : pas de calque d'effet par forme (bien plus léger à afficher) */
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

/* =====================================================================
   2. Le dessin de Bourbe (mêmes coordonnées que la fiche du bestiaire, 540 × 430)
   ===================================================================== */
var PEAU = '#66703a', BRUN = '#4e3a1e', VENTRE = '#ecdfae', LANGUE = '#d98aa4', ALGUE = '#4a7a30';
/* les grandes formes (servent aussi aux reflets, au flash, à la peau sèche) */
var DOS = [[288, 106], [352, 78], [458, 94], [498, 180]], CROUPE = [[498, 180], [524, 236], [532, 300], [514, 398]];
/* la mâchoire du bas : entre la fente de la bouche (en haut) et le haut du ventre (en bas) */
var MACHOIRE_D = 'M36 222 C 84 250 168 262 230 257 C 248 256 260 263 268 274 L 270 280 C 240 272 200 270 162 275 C 140 278 120 284 101 290 C 101 285 101 280 102 276 C 64 268 32 244 34 212 C 33 215 33 218 36 222 Z';
var LEVRE_D = 'M36 222 C 84 250 168 262 230 257 C 248 256 260 263 268 274';
var CUISSE_D = 'M376 338 C 372 296 408 254 456 250 C 496 248 520 278 520 318 C 520 352 514 380 502 396 C 470 410 410 410 388 394 C 378 378 376 360 376 338 Z';
var JAMBE_D = 'M384 350 C 404 336 474 340 508 354 C 520 362 518 376 504 382 C 470 388 420 388 394 386 C 378 382 374 360 384 350 Z';
/* la ligne d'eau sur le corps, prolongée de chaque côté */
var LIGNE_EAU = 'M116 358 Q 320 392 534 352';
var DESSOUS_EAU = 'M-90 352 L 116 358 Q 320 392 534 352 L 690 352 L 690 540 L -90 540 Z';
var DESSUS_EAU = 'M-90 352 L 116 358 Q 320 392 534 352 L 690 352 L 690 150 L -90 150 Z';
var BASSIN = ell(290, 384, 345, 88);

function dessinerBourbe(D){
  var R = rng(17), peau = PEAU, brun = BRUN;
  var out = {};
  var gPeau = D.linU(470, 70, 80, 400, [[0, clair(peau, .32)], [.42, peau], [1, sombre(peau, .58)]]);
  var gVerrue = D.radBox([[0, clair(peau, .5)], [.5, clair(peau, .12)], [1, sombre(peau, .3)]], .7, .25);
  var gVerrueB = D.radBox([[0, '#d6a868'], [.5, mix(peau, '#9a6a34', .6)], [1, sombre(mix(peau, brun, .5), .25)]], .7, .25);
  var gPointe = D.lin([[0, sombre(peau, .15)], [.35, '#9a7a2a'], [.75, '#e0a83a'], [1, '#ffe08a']], .2, 1, .45, 0);
  var gPointe2 = D.lin([[0, sombre(peau, .55)], [.5, '#6a5222'], [1, '#a8823c']], .2, 1, .45, 0);
  var haloOr = D.halo('#fff6b0', '#ffb31a'), haloRouge = D.halo('#ffb0a0', '#ff2a2a');
  var gOmbre = D.radU(400, 140, 340, [[0, '#ffffff', .14], [.45, '#ffffff', 0], [.75, '#0a0612', .2], [1, '#0a0612', .65]]);
  var ombreV = sombre(peau, .6);
  function verrue(x, y, r, Rv, brune){
    var rx = r * (.88 + Rv() * .28), ry = r * (.74 + Rv() * .22), a = Math.round(Rv() * 60 - 30), v = '';
    v += F(ellR(x - r * .2, y + r * .25, rx * 1.06, ry * 1.04, a), ombreV, ' opacity=".6"');
    v += '<path d="' + ellR(x, y, rx, ry, a) + '" fill="' + (brune ? gVerrueB : gVerrue) + '"' + (r > 4.5 ? ' stroke="' + O + '" stroke-width="1.3" stroke-opacity=".5"' : '') + '/>';
    if(r > 6) v += '<ellipse cx="' + f1(x - r * .08) + '" cy="' + f1(y + r * .05) + '" rx="' + f1(r * .34) + '" ry="' + f1(r * .26) + '" fill="' + sombre(brun, .3) + '" opacity=".7"/>';
    if(r > 2.2) v += C(f1(x + rx * .38), f1(y - ry * .42), f1(Math.max(.7, r * .2)), '#fffff0', ' opacity="' + (r > 3 ? .9 : .6) + '"');
    return v;
  }
  /* une pièce : un seul groupe, son pivot donné par transform-origin (le contenu reste dans le repère du dessin) */
  function piv(nom, x, y, c){ return '<g data-j="' + nom + '" style="transform-origin:' + x + 'px ' + y + 'px">' + c + '</g>'; }
  function slot(nom){ return '<g data-slot="' + nom + '"></g>'; }
  function ancre(nom, x, y){ return '<circle data-a="' + nom + '" cx="' + x + '" cy="' + y + '" r=".6" fill="none"/>'; }
  /* des craquelures (peau sèche) : des lignes brisées qui se ramifient */
  function craquelures(zones, seed){
    var Rc = rng(seed), s = '';
    zones.forEach(function(z){
      var x = z[0], y = z[1], a = z[2], n = z[3] || 6, d = 'M' + f1(x) + ' ' + f1(y), br = '';
      for(var i = 0; i < n; i++){
        a += (Rc() - .5) * 1.1; var l = 7 + Rc() * 9; x += Math.cos(a) * l; y += Math.sin(a) * l; d += ' L ' + f1(x) + ' ' + f1(y);
        if(Rc() < .45){ var b = a + (Rc() < .5 ? 1 : -1) * (.7 + Rc() * .6), bx = x + Math.cos(b) * (6 + Rc() * 8), by = y + Math.sin(b) * (6 + Rc() * 8); br += 'M' + f1(x) + ' ' + f1(y) + ' L ' + f1(bx) + ' ' + f1(by) + ' l ' + f1(Math.cos(b + .5) * 5) + ' ' + f1(Math.sin(b + .5) * 5) + ' '; }
      }
      s += L(d + ' ' + br, '#e8dcb0', 4, ' opacity=".4"') + L(d + ' ' + br, '#24160c', 2.2, ' opacity=".85"');
    });
    return s;
  }
  function douceP(cx, cy, rx, ry, c, op){ return douce(D, cx, cy, rx, ry, c, op); }
  /* une variante pré-dessinée : une pièce au contenu fixe qu'on montre ou qu'on cache (opacité seule) */
  function vari(nom, c, op){ return '<g data-j="v-' + nom + '" opacity="' + (op == null ? 0 : op) + '"' + (op ? '' : ' visibility="hidden"') + '>' + c + '</g>'; }
  /* les flashs (blanc d'un coup, bleu du givre, orange du feu) : la silhouette, pré-dessinée en trois couleurs */
  function flashs(d){ return vari('flash', F(d, '#ffffff')) + vari('flashG', F(d, '#d8f0ff')) + vari('flashO', F(d, '#ffc070')); }
  out.vari = vari;

  /* ======== A1. le bras du fond (derrière le corps) ======== */
  var gLoin = D.linU(140, 320, 60, 410, [[0, sombre(peau, .45)], [1, sombre(peau, .74)]]);
  var avbrasF = Pw('M118 326 C 104 346 94 368 92 392 C 100 400 120 402 130 398 C 132 380 138 360 146 342 Z', D.linU(150, 330, 90, 400, [[0, sombre(peau, .38)], [.6, sombre(peau, .6)], [1, sombre(peau, .76)]]), 2.8);
  avbrasF += L('M140 346 C 134 362 130 380 128 394', LUNE, 1.4, ' opacity=".22"') + L('M104 356 C 108 362 108 368 104 374', sombre(peau, .75), 1.4, ' opacity=".7"');
  avbrasF += verrue(122, 350, 3, R) + verrue(112, 372, 2.6, R) + verrue(126, 384, 2.2, R);

  /* ======== A2. les pointes de couronne du côté loin ======== */
  var couronneF = '';
  [[268, 110, 22], [289, 104, 32], [310, 97, 32], [330, 90, 22]].forEach(function(p){
    couronneF += Pw('M' + (p[0] - 7) + ' ' + (p[1] + 8) + ' C ' + (p[0] - 7) + ' ' + (p[1] - p[2] * .5) + ' ' + (p[0] - 2) + ' ' + (p[1] - p[2]) + ' ' + (p[0] + 1) + ' ' + (p[1] - p[2]) + ' C ' + (p[0] + 5) + ' ' + (p[1] - p[2]) + ' ' + (p[0] + 7) + ' ' + (p[1] - p[2] * .45) + ' ' + (p[0] + 7) + ' ' + (p[1] + 8), gPointe2, 2.4);
  });

  /* ======== A3. l'œil du fond, à moitié caché derrière la bosse du crâne ======== */
  var globeF = ell(131, 140, 12.5, 11.5);
  var oeilF = '<circle cx="134" cy="140" r="28" fill="' + haloOr + '" opacity=".4"/>' + Pw(ell(136, 142, 18, 17), gPeau, 2.8);
  oeilF += Pw(globeF, D.radU(127, 134, 14, [[0, '#fff2b0'], [.4, '#f0bc32'], [.85, '#a8600e'], [1, '#5a2a06']]), 2.2);
  oeilF += G(D.clip(globeF), F('M121 139 C 126 136 136 136 141 139 C 136 141.5 126 141.5 121 139 Z', '#120810') + C(126, 135, 1.8, '#fff', ' opacity=".9"') +
    piv('paupF', 131, 129, F('M114 96 L 148 96 L 148 131 C 138 128 124 128 114 131 Z', gPeau) + L('M117 131 C 125 128 136 128 145 131', O, 1.8)));
  oeilF += L('M124 126 C 130 123 140 124 146 128', LUNE, 1.4, ' opacity=".45"');

  /* ======== A4. le corps : grosse masse bosselée (sans la mâchoire du bas) ======== */
  var corpsD = 'M36 222 C 33 218 32 215 34 212 C 40 180 80 150 124 140 C 146 135 156 122 180 120 C 210 118 240 116 288 106' + bosses(DOS, 0, 1, 12, 4.5, R) + bosses(CROUPE, 0, 1, 8, 3.5, R) +
    ' C 506 410 430 416 330 416 C 250 416 180 412 140 398 C 120 354 98 308 101 290 C 120 284 140 278 162 275 C 200 270 240 272 270 280 L 268 274 C 260 263 248 256 230 257 C 168 262 84 250 36 222 Z';
  out.corpsD = corpsD;
  var clipCorps = D.clip(corpsD);
  var corps = Pw(corpsD, gPeau, 3.4);
  var t = '<rect x="0" y="60" width="540" height="370" fill="' + gOmbre + '"/>';
  var R2 = rng(5);
  [[330, 128, 34, 16], [420, 146, 30, 22], [380, 196, 28, 16], [474, 226, 20, 26], [262, 146, 18, 10], [196, 170, 26, 11], [452, 300, 18, 14], [330, 240, 26, 14], [110, 176, 18, 9], [400, 260, 16, 10], [300, 200, 14, 9]].forEach(function(q, i){
    var p = tache(q[0], q[1], q[2], q[3], R2, 8), c = i % 3 ? sombre(peau, .5) : mix(peau, brun, .75);
    t += F(p, c, ' opacity=".6"') + L(p, clair(peau, .4), 1.4, ' opacity=".3"');
  });
  t += douceP(420, 180, 100, 68, brun, .3) + douceP(160, 190, 80, 30, brun, .26);
  var R3 = rng(23);
  for(var k = 0; k < 70; k++){ var x = 40 + R3() * 480, y = 90 + R3() * 320; t += C(f1(x), f1(y), f1(.7 + R3() * 1.4), R3() < .55 ? sombre(peau, .55) : clair(peau, .45), ' opacity="' + f1(.2 + R3() * .35) + '"'); }
  t += F('M352 150 C 404 160 450 186 486 236 C 452 200 410 178 352 164 Z', clair(peau, .25), ' opacity=".5"') + L('M352 164 C 410 178 452 202 486 238', sombre(peau, .6), 2.2, ' opacity=".7"');
  var vv = [], R9 = rng(29);
  function boucheY(x){ return 222 + (x - 36) * .12; }
  for(var g = 0; g < 26; g++){
    var gx = 120 + R9() * 400, gy = 96 + R9() * 260, n = 2 + Math.floor(R9() * 4), big = gx > 300;
    for(var j = 0; j < n; j++){ var vx = gx + (R9() - .5) * 26, vy = gy + (R9() - .5) * 20, vr = (big ? 3 : 2) + R9() * (big ? 6 : 3.5); if(Math.abs(vy - boucheY(vx)) < 12 && vx < 280) continue; if(vx < 150 && vy > 220) continue; vv.push([vx, vy, vr]); }
  }
  for(var k2 = 0; k2 < 60; k2++){ var x2 = 50 + R9() * 470, y2 = 100 + R9() * 280, rr = 1.4 + R9() * 2.6; if(Math.abs(y2 - boucheY(x2)) < 10 && x2 < 280) continue; if(x2 < 150 && y2 > 220) continue; vv.push([x2, y2, rr]); }
  [[356, 110, 9], [392, 116, 11], [432, 130, 10], [466, 166, 9], [408, 158, 8], [342, 156, 7.5], [480, 212, 10], [438, 196, 7], [494, 262, 8], [304, 126, 7], [362, 206, 7], [420, 236, 8], [76, 190, 4.5], [96, 172, 5], [128, 160, 4]].forEach(function(v){ vv.push(v); });
  vv.forEach(function(v, i){ t += verrue(v[0], v[1], v[2], R9, i % 4 === 0); });
  /* la peau qui sèche (feu sur la bave) : terne, craquelée */
  var sec = F(corpsD, '#9a9060', ' opacity=".42"') + douceP(330, 170, 160, 70, '#d8c890', .35) +
    craquelures([[300, 120, .3, 7], [380, 100, .6, 8], [440, 140, 1.2, 7], [470, 210, 1.6, 6], [500, 270, 1.8, 5], [230, 150, .8, 6], [150, 160, .5, 5], [90, 190, .4, 4], [340, 210, .2, 7], [410, 260, 1.4, 6], [260, 210, 2.6, 5], [190, 130, .2, 4]], 3);
  t += vari('sec', sec);
  corps += G(clipCorps, t);
  /* le dos mouillé : grands reflets nets (ils pâlissent quand la peau sèche) */
  var mouille = douceP(420, 132, 64, 24, '#ffffff', .22);
  mouille += reflet(404, 100, 64, 12, 6, .6) + reflet(478, 148, 44, 58, 5, .5) + reflet(336, 92, 30, -14, 4, .55) + reflet(512, 250, 40, 84, 4, .45);
  mouille += reflet(150, 196, 26, -10, 3, .5) + reflet(196, 214, 18, -6, 2.6, .45) + reflet(300, 214, 30, 14, 3.5, .45) + reflet(232, 194, 12, 0, 2.4, .5) + reflet(470, 300, 24, 70, 3, .4) + reflet(380, 230, 22, 20, 3, .4);
  corps += vari('mouille', mouille, 1);
  corps += L('M300 100 C 340 82 410 82 452 100 C 476 112 494 140 504 180', LUNE, 2.6, ' opacity=".55"') + L('M508 196 C 520 230 526 270 524 300', LUNE, 2, ' opacity=".4"');
  /* gonflé : la peau tendue brille */
  corps += vari('tendu', douceP(380, 140, 120, 50, '#ffffff', .35) + reflet(380, 110, 120, 10, 9, .7) + reflet(470, 180, 70, 60, 7, .6) + reflet(220, 160, 50, -8, 5, .55));

  /* ======== A5. le ventre pâle et mou (le point faible) ======== */
  var gVentre = D.radU(236, 300, 176, [[0, '#fbf5d8'], [.45, VENTRE], [.82, '#c4b27c'], [1, '#8a7a4e']]);
  out.gVentre = gVentre;
  var tv = '<ellipse cx="210" cy="366" rx="156" ry="100" fill="' + gVentre + '"/>';
  var R4 = rng(41);
  for(var k3 = 0; k3 < 30; k3++){ var a = Math.PI * (1.0 + R4() * 1.0), rk = .92 + R4() * .14, exx = 210 + Math.cos(a) * 156 * rk, eyy = 366 + Math.sin(a) * 96 * rk; tv += F(tache(exx, eyy, 5 + R4() * 8, 3 + R4() * 5, R4, 6), R4() < .5 ? sombre(peau, .25) : mix(peau, brun, .5), ' opacity="' + f1(.55 + R4() * .4) + '"'); }
  for(var k4 = 0; k4 < 30; k4++){ var gx2 = 70 + R4() * 290, gy2 = 274 + R4() * 130; tv += C(f1(gx2), f1(gy2), f1(.7 + R4() * 1.3), R4() < .5 ? '#fffbe8' : '#b8a670', ' opacity=".5"'); }
  tv += F('M60 262 C 120 280 200 284 270 262 L 290 304 C 220 300 130 296 60 294 Z', D.linU(0, 268, 0, 304, [[0, '#3a2a14', .5], [1, '#3a2a14', 0]]));
  [[330, 0], [366, 1]].forEach(function(b){
    var y = b[0];
    tv += F('M96 ' + (y - 2) + ' Q 196 ' + (y + 30) + ' 310 ' + (y - 4) + ' L 310 ' + (y + 14) + ' Q 200 ' + (y + 40) + ' 96 ' + (y + 12) + ' Z', '#6e5e36', ' opacity=".28"');
    tv += F('M96 ' + (y - 30) + ' Q 196 ' + (y - 2) + ' 310 ' + (y - 34) + ' L 310 ' + (y - 16) + ' Q 196 ' + (y + 14) + ' 96 ' + (y - 14) + ' Z', '#fffbe8', ' opacity=".2"');
    tv += L('M100 ' + y + ' Q 196 ' + (y + 30) + ' 306 ' + (y - 4), '#7a6838', 2.6, ' opacity=".75"') + L('M104 ' + (y - 5) + ' Q 196 ' + (y + 24) + ' 300 ' + (y - 9), '#fffbe8', 2, ' opacity=".6"');
  });
  tv += douceP(248, 318, 56, 20, '#ffffff', .4) + reflet(256, 312, 44, -8, 5, .6) + reflet(276, 348, 22, -4, 3, .45);
  tv += douceP(190, 400, 100, 34, '#ffd27a', .24);
  tv += vari('sec', F('M0 250 L 400 250 L 400 430 L 0 430 Z', '#b0a070', ' opacity=".3"') + craquelures([[150, 330, .2, 6], [230, 360, -.3, 6], [180, 390, .1, 5]], 9));
  /* le point faible ouvert : il brille et palpite */
  var gPF = D.rad([[0, '#fff4c0', 1], [.3, '#ffc040', .85], [.65, '#ff7a3a', .45], [1, '#ff5a3a', 0]], .5, .5, .5);
  var ouvertV = vari('ouvert', piv('x-pulseA', 200, 340, '<ellipse cx="200" cy="340" rx="150" ry="92" fill="' + gPF + '"/>') +
    piv('x-pulseB', 200, 340, '<ellipse cx="200" cy="340" rx="110" ry="66" fill="none" stroke="#ffe066" stroke-width="7"/><ellipse cx="200" cy="340" rx="110" ry="66" fill="none" stroke="' + O + '" stroke-width="2" stroke-opacity=".5"/>'));
  /* la bosse du héros avalé : dessinée autour de (0,0), elle se promène dans le ventre */
  var bosse = vari('bosse', piv('bosse', 0, 0, douceP(0, 6, 34, 26, '#3a2a14', .35) + '<ellipse cx="0" cy="0" rx="26" ry="20" fill="' + gVentre + '"/>' +
    '<path d="M-24 6 C -20 18 18 22 26 4" fill="none" stroke="#7a6838" stroke-width="2.4" opacity=".7"/>' + reflet(-2, -10, 28, -10, 4, .7) + L('M-30 -4 l -8 -3 M-28 8 l -9 2 M28 -6 l 8 -4', '#a8925c', 1.4, ' opacity=".6"')));
  var ventre = piv('ventre', 210, 300, G(clipCorps, tv + bosse) + ouvertV + ancre('pointfaible', 200, 336));

  /* ======== A6. la gorge (le sac qui gonfle sous le menton) ======== */
  var sacD = 'M100 288 C 108 308 146 322 182 322 C 220 322 250 306 260 284 C 238 280 212 278 182 280 C 150 282 122 286 100 288 Z';
  var gorge = F(sacD, gVentre) + G(D.clip(sacD), F('M90 270 C 140 292 220 292 280 270 L 280 296 C 220 306 140 306 90 296 Z', D.linU(0, 278, 0, 300, [[0, '#3a2a14', .4], [1, '#3a2a14', 0]])) + douceP(200, 300, 46, 10, '#ffffff', .5)) +
    L('M100 288 C 108 308 146 322 182 322 C 220 322 250 306 260 284', '#8a7a4e', 2, ' opacity=".55"') +
    L('M108 296 Q 170 312 236 298', '#a8925c', 2, ' opacity=".55"') + L('M120 306 Q 170 318 222 310', '#a8925c', 1.4, ' opacity=".4"') + reflet(210, 300, 30, -6, 3, .5);
  var gorgeP = piv('gorge', 180, 284, gorge);

  /* ======== A7. la grosse cuisse arrière, la jambe repliée, le pied palmé ======== */
  var cu = Pw(CUISSE_D, gPeau, 3);
  var tc = '<rect x="360" y="240" width="170" height="180" fill="' + D.radU(470, 268, 160, [[0, '#ffffff', .12], [.5, '#ffffff', 0], [1, '#0a0612', .6]]) + '"/>';
  var R5 = rng(61);
  [[420, 282, 16, 10], [482, 304, 14, 18], [446, 330, 12, 8]].forEach(function(q){ tc += F(tache(q[0], q[1], q[2], q[3], R5, 7), mix(peau, brun, .7), ' opacity=".55"'); });
  for(var k5 = 0; k5 < 26; k5++){ tc += verrue(386 + R5() * 126, 262 + R5() * 100, 1.6 + R5() * R5() * 6.5, R5, k5 % 5 === 0); }
  tc += vari('sec', F(CUISSE_D, '#9a9060', ' opacity=".42"') + craquelures([[420, 270, .4, 6], [480, 300, 1.8, 5]], 13));
  cu += G(D.clip(CUISSE_D), tc);
  cu += L('M400 268 C 428 252 470 248 500 266 C 512 276 518 292 520 306', LUNE, 2.4, ' opacity=".6"') + reflet(462, 262, 36, 8, 5, .6);
  /* le pied palmé (sous la jambe ; on le voit quand il saute ou se met sur le dos) */
  var gPied = D.linU(392, 360, 310, 410, [[0, sombre(peau, .1)], [1, sombre(peau, .5)]]);
  var orteils = [[[392, 372], [352, 376], [314, 380]], [[392, 374], [356, 386], [322, 396]], [[394, 376], [366, 394], [342, 408]], [[396, 378], [378, 398], [366, 414]]];
  var palme = 'M392 368 L 314 380 C 318 386 320 392 322 396 C 330 400 336 404 342 408 C 352 410 360 412 366 414 L 398 380 Z';
  var pied = Pw(palme, D.lin([[0, '#9aa86a', .9], [1, '#4a5a2a', .9]], 1, 0, 0, 1), 2) + L('M360 378 L 330 386 M364 384 L 340 400 M370 388 L 356 408', '#2a3a1a', 1, ' opacity=".5"');
  orteils.forEach(function(o){ pied += Pw(ruban(o, 13, 8), gPied, 2.2) + C(f1(o[2][0] - 1), f1(o[2][1] + 1), 5, '#3a2a14', ' stroke="' + O + '" stroke-width="1.6"') + C(f1(o[2][0] + .5), f1(o[2][1] - 1), 1.5, '#fff', ' opacity=".7"'); });
  var jambe = Pw(JAMBE_D, D.linU(500, 340, 390, 384, [[0, clair(peau, .1)], [1, sombre(peau, .45)]]), 2.8);
  jambe += G(D.clip(JAMBE_D), verrue(420, 356, 4, R5) + verrue(452, 352, 5, R5, true) + verrue(486, 360, 4, R5) + verrue(404, 364, 3, R5)) + L('M392 352 C 420 342 470 344 502 354', LUNE, 1.6, ' opacity=".45"');
  var cuisse = piv('cuisse', 466, 300, cu + piv('jambe', 506, 366, piv('pied', 392, 372, pied) + jambe) + flashs(CUISSE_D));

  /* ======== A8. mousse et algues accrochées au dos ======== */
  function mousse(cx, cy, rx, ry, n, seed){
    var Rm = rng(seed), m = '';
    m += Pw(tache(cx, cy + ry * .3, rx * 1.05, ry * 1.1 + 2, Rm, 9), '#2a4a1e', 1.4, ' stroke-opacity=".7"');
    for(var i = 0; i < n * 2; i++){
      var a = Rm() * Math.PI * 2, r = Math.sqrt(Rm()), x = cx + Math.cos(a) * rx * r, y = cy + Math.sin(a) * ry * r, hh = (cy - y) / (ry || 1), c = mix('#3f6a28', '#c4e47a', Math.max(0, Math.min(1, .35 + hh * .45 + Rm() * .3)));
      m += C(f1(x), f1(y), f1(1.2 + Rm() * 1.8), c);
    }
    for(var j = 0; j < n / 2; j++){ var a2 = Rm() * Math.PI * 2, r2 = Math.sqrt(Rm()) * .7; m += C(f1(cx + Math.cos(a2) * rx * r2 + 1), f1(cy + Math.sin(a2) * ry * r2 - ry * .3), .9, '#ecfab8', ' opacity=".85"'); }
    return m;
  }
  out.mousse = mousse;
  var gAlgue = D.linU(0, 80, 0, 330, [[0, '#8cbc54'], [.5, ALGUE], [1, '#1e3c1a']]);
  var gAlgue2 = D.linU(0, 80, 0, 330, [[0, '#5f8a3c'], [.5, '#2f5424'], [1, '#14281a']]);
  out.gAlgue = gAlgue;
  var surDos = mousse(86, 160, 10, 3, 8, 9) + mousse(376, 92, 18, 5, 14, 3);
  var algLoin = '';
  [[446, 120, 0, 84, 4, 2.6], [470, 130, 10, 110, 5, .8]].forEach(function(b){ var pts = ondeP(b[0], b[1], b[2], b[3], b[4], 7, b[5], 16); algLoin += Pw(ruban(pts, 8, 1.2), gAlgue2, 1.6); });
  var touffe = Pw('M392 96 C 410 82 446 86 468 106 C 484 120 494 140 496 160 C 480 144 462 132 446 126 C 424 118 404 112 392 96 Z', gAlgue, 2.4);
  touffe += L('M404 100 C 420 98 440 104 452 114 M420 92 C 440 94 458 104 470 118', '#2c5222', 1.4, ' opacity=".7"');
  var brins = '';
  [[482, 140, 18, 124, 6, 1.2], [468, 128, 8, 150, 7, 2.4], [454, 122, 4, 96, 5, .3], [494, 160, 18, 96, 5, 3.6], [440, 118, -2, 70, 4, 1.9], [498, 172, 14, 60, 4, 5]].forEach(function(b, i){
    var pts = ondeP(b[0], b[1], b[2], b[3], b[4], 7, b[5], 16);
    brins += Pw(ruban(pts, 10 - i * .6, 1.5), gAlgue, 1.8) + L(lisseQ(pts.slice(0, 11), false), '#b4e07a', 1.1, ' opacity=".55"');
    var z = pts[pts.length - 1]; if(i % 2 === 0) brins += goutte(z[0], z[1] + 10, 2.8, '#cdeeff');
  });
  var algues = piv('algues', 446, 110, piv('alguesF', 458, 126, algLoin) + touffe + piv('brins', 468, 130, brins) + L('M398 94 C 416 84 448 88 466 104', LUNE, 2.2, ' opacity=".65"') + mousse(426, 98, 16, 6, 12, 14));

  /* ======== A9. la couronne : un bourrelet de corne, des pointes de verrue, des perles d'or ======== */
  var bandeau = 'M246 134 C 258 116 290 102 322 94 C 336 90 348 86 358 86 C 362 92 362 100 356 104 C 334 110 306 120 282 130 C 268 136 258 142 250 144 C 244 142 242 138 246 134 Z';
  var cour = F(T2(bandeau, -2, 7), sombre(peau, .6), ' opacity=".4"');
  cour += Pw(bandeau, D.linU(352, 84, 260, 140, [[0, '#d6a84c'], [.45, '#946e2a'], [1, '#4a3a18']]), 2.6);
  cour += G(D.clip(bandeau), L('M248 140 C 262 130 290 120 320 108 C 334 102 346 98 358 98', '#3a2a0c', 3, ' opacity=".45"') + [256, 270, 284, 298, 312, 326, 340].map(function(x, i){ return C(x, f1(132 - (x - 250) * .36 + (i % 2) * 2), 1.4, '#3a2a0c', ' opacity=".5"'); }).join(''));
  cour += L('M250 132 C 264 116 294 104 324 96 C 338 92 350 88 356 88', LUNE, 1.6, ' opacity=".5"');
  [[256, 128, 24, -24], [276, 118, 35, -16], [298, 108, 44, -8], [320, 100, 35, 2], [341, 92, 25, 10]].forEach(function(p, i){
    var x = p[0], y = p[1], h = p[2], w = 9 + h * .16;
    var dd = 'M' + f1(-w) + ' 6 C ' + f1(-w * .9) + ' ' + f1(-h * .35) + ' ' + f1(-w * .35) + ' ' + f1(-h * .78) + ' 0 ' + (-h) + ' C ' + f1(w * .35) + ' ' + f1(-h * .78) + ' ' + f1(w * .9) + ' ' + f1(-h * .35) + ' ' + f1(w) + ' 6';
    var q = Pw(dd, gPointe, 2.6);
    q += F('M' + f1(-w * .1) + ' 4 C ' + f1(-w * .1) + ' ' + f1(-h * .4) + ' ' + f1(-w * .05) + ' ' + f1(-h * .7) + ' 0 ' + f1(-h * .9) + ' C ' + f1(w * .3) + ' ' + f1(-h * .6) + ' ' + f1(w * .7) + ' ' + f1(-h * .3) + ' ' + f1(w * .8) + ' 4 Z', '#fff2b8', ' opacity=".28"');
    q += L('M' + f1(-w * .45) + ' 2 C ' + f1(-w * .4) + ' ' + f1(-h * .3) + ' ' + f1(-w * .2) + ' ' + f1(-h * .6) + ' ' + f1(-w * .05) + ' ' + f1(-h * .78), '#5a4012', 1.3, ' opacity=".6"');
    q += L('M' + f1(w * .3) + ' ' + f1(-h * .78) + ' C ' + f1(w * .75) + ' ' + f1(-h * .45) + ' ' + f1(w * .92) + ' ' + f1(-h * .1) + ' ' + f1(w * .95) + ' 3', LUNE, 1.6, ' opacity=".6"');
    q += C(f1(-w * .35), f1(-h * .25), 1.8, '#5a4012', ' opacity=".5"') + C(f1(w * .3), f1(-h * .45), 1.4, '#5a4012', ' opacity=".45"');
    q += C(0, f1(-h + 1), 1.6, '#fffbe0');
    /* chaque pointe peut se dresser (colère, peur) : son pivot est à sa base */
    cour += '<g transform="translate(' + x + ' ' + y + ') rotate(' + p[3] + ')"><g data-j="pointe' + i + '">' + q + '</g></g>';
  });
  [[266, 126, 3.6], [287, 116, 4], [309, 108, 4.2], [331, 100, 3.8], [352, 94, 3]].forEach(function(b){
    cour += '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="' + b[2] + '" fill="' + D.radU(b[0] + 1.4, b[1] - 1.4, b[2] * 1.6, [[0, '#fff6c8'], [.45, '#f0b838'], [1, '#7a4a10']]) + '" stroke="' + O + '" stroke-width="1.4"/>' + C(f1(b[0] + 1.2), f1(b[1] - 1.3), 1, '#fff');
  });
  cour += vari('rage', douceP(300, 100, 80, 40, '#ff4a2a', .45));
  var couronne = piv('couronne', 300, 122, cour + ancre('haut', 300, 64));

  /* ======== A10. la glande en relief derrière l'œil, le tympan ======== */
  var glandeD = 'M200 168 C 198 152 222 142 252 144 C 284 146 300 158 298 174 C 296 190 270 196 244 194 C 218 192 202 184 200 168 Z';
  var gl = F(T2(glandeD, -4, 8), sombre(peau, .65), ' opacity=".45"');
  gl += Pw(glandeD, D.radU(262, 154, 60, [[0, clair(peau, .5)], [.45, clair(peau, .12)], [1, sombre(peau, .4)]]), 2.6);
  var R6 = rng(77), tg = '';
  for(var k6 = 0; k6 < 26; k6++){ var px = 210 + R6() * 84, py = 150 + R6() * 40; tg += '<ellipse cx="' + f1(px) + '" cy="' + f1(py) + '" rx="2.4" ry="1.7" fill="' + sombre(brun, .45) + '" opacity=".85"/>' + C(f1(px + .9), f1(py - .9), .7, '#fff', ' opacity=".55"'); }
  tg += F('M206 176 C 222 190 262 194 292 182 C 270 198 226 198 206 176 Z', '#0a0612', ' opacity=".3"');
  tg += vari('sec', F(glandeD, '#b8a070', ' opacity=".45"') + craquelures([[220, 160, .2, 5], [250, 182, -.2, 5]], 21));
  gl += G(D.clip(glandeD), tg) + vari('mouille', reflet(264, 152, 46, 2, 5.5, .7) + reflet(232, 150, 14, -6, 2.6, .55), 1) + L('M208 158 C 224 146 262 142 290 156', LUNE, 1.8, ' opacity=".55"');
  /* la glande grésille quand la peau sèche */
  gl += vari('grille', douceP(250, 170, 60, 30, '#ff9a3a', .6));
  var glande = piv('glande', 250, 170, '<g transform="rotate(16 250 170)">' + gl + ancre('glandeC', 250, 160) + '</g>');
  var tympan = C(218, 212, 11, sombre(peau, .55), ' opacity=".45"') + '<circle cx="216" cy="209" r="9.5" fill="' + D.radU(219, 206, 11, [[0, clair(peau, .3)], [.7, sombre(peau, .2)], [1, sombre(peau, .45)]]) + '" stroke="' + O + '" stroke-width="1.8" stroke-opacity=".85"/>' +
    '<circle cx="216" cy="209" r="5.5" fill="none" stroke="' + sombre(peau, .5) + '" stroke-width="1.1" opacity=".6"/>' + C(219, 205, 1.4, '#fff', ' opacity=".8"');

  /* ======== A11. l'œil proche : gros, globuleux, sur le côté de la tête, grand ouvert ======== */
  var ex = 174, ey = 176;
  var teteFond = douceP(ex - 4, ey + 8, 40, 34, sombre(peau, .65), .6);
  teteFond += F('M140 152 C 152 138 184 132 212 140 C 222 143 228 148 230 154 C 214 150 190 148 170 152 C 158 154 146 157 140 152 Z', clair(peau, .3), ' opacity=".6"');
  teteFond += L('M142 156 C 156 152 190 150 228 156', sombre(peau, .6), 1.8, ' opacity=".55"') + L('M146 146 C 166 136 196 134 220 143', LUNE, 1.4, ' opacity=".45"') + L('M136 158 C 112 162 86 170 64 184', sombre(peau, .6), 2, ' opacity=".55"') + L('M134 154 C 110 158 86 166 62 180', clair(peau, .4), 1.2, ' opacity=".4"');
  var orbite = ell(ex + 1, ey + 2, 34, 31), globe = ell(ex, ey, 25.5, 24);
  var gOr = D.radU(ex + 7, ey - 8, 30, [[0, '#fffbd0'], [.28, '#ffd84a'], [.72, '#e08a12'], [1, '#6a3006']]);
  var gRouge = D.radU(ex + 7, ey - 8, 30, [[0, '#fff2a0'], [.28, '#ff7a3a'], [.72, '#d81a14'], [1, '#5a0408']]);
  var oe = vari('haloJ', '<circle cx="' + ex + '" cy="' + ey + '" r="58" fill="' + haloOr + '" opacity=".5"/>', 1) + vari('haloR', '<circle cx="' + ex + '" cy="' + ey + '" r="66" fill="' + haloRouge + '" opacity=".85"/>');
  oe += Pw(orbite, D.radU(ex + 16, ey - 16, 50, [[0, clair(peau, .5)], [.5, clair(peau, .08)], [1, sombre(peau, .5)]]), 3);
  oe += L('M' + (ex - 22) + ' ' + (ey - 24) + ' C ' + (ex - 6) + ' ' + (ey - 32) + ' ' + (ex + 20) + ' ' + (ey - 30) + ' ' + (ex + 32) + ' ' + (ey - 12), LUNE, 2, ' opacity=".55"');
  oe += Pw(globe, gOr, 2.6) + vari('irisR', F(globe, gRouge));
  var gi = '';
  for(var i = 0; i < 26; i++){ var aa = i / 26 * Math.PI * 2; gi += 'M' + f1(ex + Math.cos(aa) * 9) + ' ' + f1(ey + 1 + Math.sin(aa) * 6) + ' L ' + f1(ex + Math.cos(aa) * 23) + ' ' + f1(ey + Math.sin(aa) * 22) + ' '; }
  gi = L(gi, '#9a5208', .9, ' opacity=".45"');
  gi += '<ellipse cx="' + ex + '" cy="' + ey + '" rx="24.5" ry="23" fill="none" stroke="#5a2a06" stroke-width="3" opacity=".4"/>';
  gi += C(ex - 13, ey + 11, 2.4, '#9a5208', ' opacity=".4"') + C(ex + 12, ey + 12, 1.6, '#fff6c0', ' opacity=".5"') + C(ex - 6, ey - 12, 1.4, '#fff6c0', ' opacity=".5"');
  var pup = Pw('M' + (ex - 15) + ' ' + (ey + 1) + ' C ' + (ex - 7) + ' ' + (ey - 5) + ' ' + (ex + 7) + ' ' + (ey - 5) + ' ' + (ex + 15) + ' ' + (ey + 1) + ' C ' + (ex + 7) + ' ' + (ey + 6) + ' ' + (ex - 7) + ' ' + (ey + 6) + ' ' + (ex - 15) + ' ' + (ey + 1) + ' Z', '#120810', 1.4) + '<ellipse cx="' + ex + '" cy="' + (ey + 1) + '" rx="19" ry="8.5" fill="none" stroke="#7a3a08" stroke-width="2" opacity=".45"/>';
  gi += piv('pupille', ex, ey + 1, pup);
  /* les reflets du globe (sous la paupière, qui les couvre quand il cligne) */
  gi += F(ellR(ex + 6, ey - 10, 14, 7, 20), '#fffbe8', ' opacity=".28"') + C(ex + 10, ey - 10, 4.6, '#fff') + C(ex + 15, ey - 3, 1.6, '#fff', ' opacity=".85"') + C(ex - 12, ey + 11, 2, '#fff', ' opacity=".75"');
  gi += L('M' + (ex + 6) + ' ' + (ey - 21) + ' C ' + (ex + 18) + ' ' + (ey - 18) + ' ' + (ex + 24) + ' ' + (ey - 8) + ' ' + (ex + 24) + ' ' + (ey + 2), '#fffbe0', 1.6, ' opacity=".55"');
  /* la paupière du haut : au repos, un fin liseré (l'œil reste grand ouvert) ; elle descend pour cligner */
  var bordH = 'M' + (ex - 26) + ' ' + (ey - 9) + ' C ' + (ex - 14) + ' ' + (ey - 19) + ' ' + (ex + 12) + ' ' + (ey - 20) + ' ' + (ex + 26) + ' ' + (ey - 9);
  var paup = F(bordH + ' L ' + (ex + 32) + ' ' + (ey - 64) + ' L ' + (ex - 32) + ' ' + (ey - 64) + ' Z', D.radU(ex + 8, ey - 26, 34, [[0, clair(peau, .35)], [1, sombre(peau, .2)]])) +
    L('M' + (ex - 23) + ' ' + (ey - 5) + ' C ' + (ex - 12) + ' ' + (ey - 14) + ' ' + (ex + 12) + ' ' + (ey - 15) + ' ' + (ex + 23) + ' ' + (ey - 5), '#3a1a04', 4, ' opacity=".3"') + L(bordH, O, 2.6) +
    L('M' + (ex - 18) + ' ' + (ey - 22) + ' C ' + (ex - 6) + ' ' + (ey - 28) + ' ' + (ex + 10) + ' ' + (ey - 28) + ' ' + (ex + 20) + ' ' + (ey - 22), sombre(peau, .4), 1.4, ' opacity=".6"');
  gi += piv('paupiere', ex, ey - 12, paup);
  oe += G(D.clip(globe), gi);
  var paupBD = 'M' + (ex - 27) + ' ' + (ey + 8) + ' C ' + (ex - 22) + ' ' + (ey + 23) + ' ' + (ex + 20) + ' ' + (ey + 26) + ' ' + (ex + 27) + ' ' + (ey + 8) + ' C ' + (ex + 34) + ' ' + (ey + 34) + ' ' + (ex - 30) + ' ' + (ey + 38) + ' ' + (ex - 27) + ' ' + (ey + 8) + ' Z';
  var pb = Pw(paupBD, D.linU(ex + 30, ey + 6, ex - 28, ey + 32, [[0, clair(peau, .35)], [1, sombre(peau, .35)]]), 2.4);
  [[-22, 21, 3], [-13, 27, 3.8], [-2, 30, 3.4], [9, 29, 4], [19, 25, 3.2], [26, 17, 2.8]].forEach(function(v){ pb += verrue(ex + v[0], ey + v[1], v[2], R, v[2] > 3.3); });
  oe += piv('paupB', ex, ey + 24, pb);
  var oeil = piv('oeil', ex, ey, oe + ancre('tete', ex, ey - 30) + ancre('oeilC', ex, ey));
  var autourOeil = '';
  [[150, 150, 3], [206, 154, 3.4], [140, 196, 3.6], [204, 196, 3], [120, 176, 2.6]].forEach(function(v){ autourOeil += verrue(v[0], v[1], v[2], R); });

  /* ======== A12. la mâchoire du bas (l'intérieur de la gueule tourne avec elle, découpé sous la lèvre du haut) ======== */
  var gGueule = D.radU(170, 250, 170, [[0, '#6a1e40'], [.5, '#3a0c26'], [1, '#12030c']]);
  var interieur = F('M268 276 C 260 263 248 256 230 257 C 168 262 84 250 36 222 C 22 204 30 160 92 112 L 272 268 Z', gGueule);
  interieur += F('M60 236 C 110 214 200 236 262 266 C 200 250 120 236 60 248 Z', '#1a0410', ' opacity=".6"');
  /* le fond de la langue, enroulé dans la gueule */
  interieur += Pw('M58 238 C 96 222 170 238 248 264 C 190 262 110 252 62 250 Z', D.linU(150, 230, 150, 262, [[0, '#f0a8bc'], [1, '#9a3a5e']]), 2);
  interieur += L('M80 240 C 120 236 180 246 232 260', '#c86a8a', 1.4, ' opacity=".6"');
  /* des fils de bave entre les deux mâchoires */
  interieur += L('M70 236 C 74 214 80 194 86 176 M128 248 C 130 228 134 212 140 196', '#e8f4ff', 1.6, ' opacity=".5"');
  var mach = interieur;
  mach += F(MACHOIRE_D, gPeau) + G(D.clip(MACHOIRE_D), '<rect x="0" y="180" width="300" height="140" fill="' + gOmbre + '"/>' + douceP(150, 300, 120, 20, '#3a2a14', .3) +
    (function(){ var Rj = rng(7), s2 = ''; for(var q = 0; q < 12; q++){ s2 += C(f1(40 + Rj() * 230), f1(230 + Rj() * 60), f1(.7 + Rj() * 1.2), Rj() < .55 ? sombre(peau, .55) : clair(peau, .45), ' opacity=".35"'); } return s2; })() +
    vari('sec', F(MACHOIRE_D, '#9a9060', ' opacity=".42"') + craquelures([[70, 254, .3, 4], [150, 266, .1, 5]], 31)));
  mach += L('M102 276 C 64 268 32 244 34 212', O, 3.4) + L('M101 290 C 120 284 140 278 162 275 C 200 270 240 272 270 280', sombre(peau, .6), 1.6, ' opacity=".5"');
  mach += L(LEVRE_D, O, 3) + L('M46 232 C 96 256 170 266 230 263 C 244 263 254 268 260 276', sombre(peau, .55), 2, ' opacity=".6"');
  mach += Pw('M38 222 C 62 242 102 256 142 258 C 108 270 64 262 46 240 Z', '#2c0b24', 2.4);
  mach += F('M52 236 C 74 250 104 256 128 258 C 102 264 70 256 52 236 Z', '#6a2048', ' opacity=".8"');
  mach += L('M58 238 C 58 246 60 252 58 258 M118 258 C 116 262 118 266 116 270', '#e8f4ff', 1.2, ' opacity=".55"');
  mach += flashs(MACHOIRE_D);
  /* la langue qui pend, gluante, avec son bout collant et sa goutte */
  var gLangue = D.linU(112, 244, 50, 352, [[0, '#f4bccb'], [.45, LANGUE], [1, '#86365c']]);
  out.gLangue = gLangue;
  var lg = Pw('M66 240 C 58 262 50 292 52 314 C 50 334 58 350 76 352 C 98 354 106 338 100 320 C 96 298 98 270 110 250 Z', gLangue, 2.8);
  lg += L('M86 250 C 78 274 74 302 78 330', '#9a4a6c', 2, ' opacity=".7"');
  lg += F('M56 330 C 60 346 72 352 86 350 C 76 346 64 340 56 330 Z', '#6a2448', ' opacity=".5"');
  lg += reflet(98, 276, 30, 74, 3.8, .75) + reflet(94, 332, 14, 50, 3, .75) + C(64, 336, 2.2, '#fff', ' opacity=".7"') + C(70, 300, 1.4, '#fff', ' opacity=".6"');
  lg += piv('baveL', 70, 351, L('M70 352 C 68 360 70 366 68 372', '#d8f0ff', 1.6, ' opacity=".75"') + goutte(68, 380, 3.4, '#ead8f2') + ancre('baveBout', 68, 382));
  var machoire = piv('machoire', 266, 276, mach + piv('langue', 88, 246, lg + ancre('langueBout', 76, 350)) + ancre('bouche', 56, 238) + ancre('langueBase', 70, 240));
  var sousLevre = D.clip('M-300 222 L 36 222 C 84 250 168 262 230 257 C 248 256 260 263 268 274 L 284 278 L 284 760 L -300 760 Z');

  /* ======== A13. le museau, la fente de la bouche (lèvre du haut) ======== */
  var museau = L('M44 188 C 58 170 86 152 118 144', LUNE, 2.2, ' opacity=".5"') + reflet(80, 164, 36, -30, 4.5, .7) + reflet(104, 152, 14, -20, 2.6, .55);
  museau += F(ellR(48, 194, 3.6, 2.1, -30), '#1a0e18') + F(ellR(61, 186, 3.2, 1.9, -30), '#1a0e18') + ancre('narine', 50, 192);
  museau += L('M44 190 q 4 -6 10 -6 M58 182 q 4 -5 9 -5', clair(peau, .4), 1.2, ' opacity=".6"');
  var levre = L('M42 216 C 90 242 170 252 230 250 C 246 250 258 256 266 266', clair(peau, .4), 1.6, ' opacity=".45"') + L(LEVRE_D, O, 6) +
    L('M268 274 C 274 282 274 292 270 300', O, 2.2, ' opacity=".7"') + L('M262 280 C 266 288 266 296 262 302', sombre(peau, .6), 1.6, ' opacity=".5"');
  levre += F('M150 254 C 156 262 154 272 150 280 C 160 276 172 268 176 258 Z', '#dff2ff', ' opacity=".22"');

  /* ======== B. la chaîne de devant : la main du fond, le bras proche (posés sur la margelle) ======== */
  function doigtD(pts, w){
    var g2 = [], dr = [], n2 = pts.length;
    for(var i2 = 0; i2 < n2; i2++){
      var a2 = pts[Math.max(0, i2 - 1)], b2 = pts[Math.min(n2 - 1, i2 + 1)], dx = b2[0] - a2[0], dy = b2[1] - a2[1], l = Math.sqrt(dx * dx + dy * dy) || 1, ww = w * (1 - .24 * i2 / (n2 - 1)) * (1 + .07 * Math.sin(Math.PI * i2 / (n2 - 1) * 2)) / 2;
      g2.push([pts[i2][0] + dy / l * ww, pts[i2][1] - dx / l * ww]); dr.push([pts[i2][0] - dy / l * ww, pts[i2][1] + dx / l * ww]);
    }
    var re = w * .39, retour = lisseQ(dr.slice().reverse(), false).replace(/^M[^Q]*/, ' ');
    return lisseQ(g2, false) + ' A ' + f1(re) + ' ' + f1(re) + ' 0 0 1 ' + f1(dr[n2 - 1][0]) + ' ' + f1(dr[n2 - 1][1]) + retour + ' Z';
  }
  function doigts(dg, ombre){
    var m = '';
    dg.forEach(function(fd){
      var q0 = fd[0], w = fd[1], pts = [];
      for(var kq = 0; kq <= 7; kq++){ var tq = kq / 7, uq = 1 - tq; pts.push([uq * uq * q0[0][0] + 2 * uq * tq * q0[1][0] + tq * tq * q0[2][0], uq * uq * q0[0][1] + 2 * uq * tq * q0[1][1] + tq * tq * q0[2][1]]); }
      var z = pts[pts.length - 1], y = pts[pts.length - 2], mi = pts[4], a3 = pts[0];
      var gd = ombre ? D.linU(a3[0] + 10, a3[1] - 6, z[0] - 6, z[1] + 6, [[0, sombre(peau, .45)], [1, sombre(peau, .74)]]) : D.linU(a3[0] + 10, a3[1] - 8, z[0] - 8, z[1] + 8, [[0, clair(peau, .3)], [.5, peau], [1, sombre(peau, .45)]]);
      m += Pw(doigtD(pts, w), gd, 2.3);
      var dx = z[0] - y[0], dy = z[1] - y[1], l = Math.sqrt(dx * dx + dy * dy), ux = dx / l, uy = dy / l, r = w * .36;
      m += L('M' + f1(z[0] - uy * r * 1.1 + ux * r * .3) + ' ' + f1(z[1] + ux * r * 1.1 + uy * r * .3) + ' A ' + f1(r * 1.15) + ' ' + f1(r * 1.15) + ' 0 0 0 ' + f1(z[0] + uy * r * 1.1 + ux * r * .3) + ' ' + f1(z[1] - ux * r * 1.1 + uy * r * .3), '#2a1a10', w * .26, ' opacity="' + (ombre ? .7 : .85) + '"');
      m += L('M' + f1(mi[0] - w * .32) + ' ' + f1(mi[1] - 1) + ' q ' + f1(w * .32) + ' 2.5 ' + f1(w * .64) + ' 0', sombre(peau, .7), 1.2, ' opacity=".6"');
      if(!ombre) m += verrue(mi[0] + 1, mi[1] - w * .25, w * .2, R) + verrue((a3[0] + mi[0]) / 2, (a3[1] + mi[1]) / 2 - w * .2, w * .17, R) + C(f1(z[0] - ux * w * .3 + uy * w * .2), f1(z[1] - uy * w * .3 - ux * w * .2), f1(w * .14), '#fff', ' opacity=".8"');
    });
    return m;
  }
  /* la main du fond, dans l'ombre */
  var mainF = Pw('M84 384 C 98 374 126 378 132 394 C 132 406 110 410 94 404 C 82 398 78 390 84 384 Z', gLoin, 2.6);
  mainF += doigts([[[[124, 400], [131, 414], [124, 426]], 10], [[[110, 402], [107, 421], [94, 428]], 11], [[[98, 398], [87, 413], [68, 419]], 11.5], [[[92, 390], [72, 386], [56, 398]], 11]], true);
  /* le bras proche : bras, avant-bras, main */
  var tbH = tube([[318, 264], [334, 302], [350, 344]], [64, 60, 50]);
  var brasH = F(tbH.d, gPeau) + L(lisseC(tbH.g.slice(0)), O, 3.2) + L(lisseC(tbH.dr), O, 3.2);
  var R7 = rng(91), tb = '<rect x="270" y="220" width="110" height="160" fill="' + D.radU(346, 300, 120, [[0, '#ffffff', .12], [.5, '#ffffff', 0], [1, '#0a0612', .6]]) + '"/>';
  /* le haut du bras se fond dans l'épaule : une ombre douce, la tache sombre du flanc */
  tb += '<rect x="270" y="220" width="110" height="80" fill="' + D.linU(0, 226, 0, 290, [[0, sombre(peau, .5), .7], [1, sombre(peau, .5), 0]]) + '"/>' + F(tache(330, 244, 24, 13, rng(5), 8), sombre(peau, .5), ' opacity=".45"');
  tb += F(tache(326, 316, 14, 9, R7, 7), mix(peau, brun, .7), ' opacity=".5"');
  for(var k9 = 0; k9 < 12; k9++){ tb += verrue(306 + R7() * 50, 270 + R7() * 70, 1.5 + R7() * R7() * 5, R7, k9 % 5 === 0); }
  brasH += G(D.clip(tbH.d), tb) + L('M350 276 C 362 300 368 324 364 344', LUNE, 2.4, ' opacity=".6"') + reflet(338, 296, 30, 62, 4.5, .6);
  var tbA = tube([[356, 346], [322, 372], [284, 390]], [50, 44, 36]);
  var avb = Pw(tbA.d, gPeau, 3.2);
  var tb2 = '<rect x="250" y="320" width="140" height="100" fill="' + D.radU(346, 330, 110, [[0, '#ffffff', .1], [.5, '#ffffff', 0], [1, '#0a0612', .6]]) + '"/>' + F(tache(304, 382, 12, 7, R7, 7), mix(peau, brun, .7), ' opacity=".5"');
  for(var k10 = 0; k10 < 10; k10++){ tb2 += verrue(282 + R7() * 70, 360 + R7() * 30, 1.5 + R7() * R7() * 4.5, R7, k10 % 4 === 0); }
  avb += G(D.clip(tbA.d), tb2) + L('M306 340 C 310 346 310 352 306 358 M298 348 C 302 352 302 358 298 362', sombre(peau, .6), 1.6, ' opacity=".6"') + reflet(318, 374, 26, -32, 3.5, .5) + L(lisseC(tbA.dr.slice(0, 2)), LUNE, 2, ' opacity=".5"');
  /* l'algue qui pend du coude */
  var pc = ondeP(362, 360, 4, 30, 3, 6, .5, 10);
  avb += piv('algueCoude', 362, 362, Pw(ruban(pc, 7, 1.2), gAlgue, 1.6) + goutte(367, 399, 2.8, '#cdeeff'));
  var paume = 'M232 386 C 250 372 288 378 296 396 C 298 410 280 416 260 416 C 240 416 224 402 232 386 Z';
  var main = doigts([[[[282, 408], [291, 420], [286, 432]], 13.5]], false);
  main += Pw(paume, D.linU(300, 376, 222, 418, [[0, clair(peau, .25)], [.5, peau], [1, sombre(peau, .4)]]), 2.8);
  main += G(D.clip(paume), verrue(262, 386, 4, R) + verrue(280, 392, 3.4, R, true) + verrue(246, 392, 3, R) + verrue(270, 404, 2.4, R));
  main += doigts([[[[266, 408], [265, 425], [251, 432]], 15], [[[250, 404], [239, 423], [218, 427]], 15.5], [[[240, 394], [215, 390], [196, 404]], 15]], false);
  main += L('M244 380 C 262 374 286 382 296 394', LUNE, 2, ' opacity=".6"') + reflet(270, 386, 26, 8, 3.5, .65) + ancre('main', 250, 410);

  /* ======== les variantes pré-dessinées des états ======== */
  /* la colle : des paquets gluants */
  var pate = '<path d="M-20 4 C -20 -8 -10 -12 0 -11 C 10 -12 20 -8 20 4 C 12 10 -12 10 -20 4 Z" fill="#d0e05a" fill-opacity=".92" stroke="#5a6420" stroke-width="1.6"/><path d="M-12 -4 Q 0 -9 12 -4" fill="none" stroke="#fbffd0" stroke-width="1.6" opacity=".8"/>';
  main += vari('colle', '<g transform="translate(250 420)">' + pate + '</g>');
  mainF += vari('colle', '<g transform="translate(100 418) scale(.8)">' + pate + '</g>');
  var colleCorps = vari('colle', '<g transform="translate(420 340) scale(1.3)">' + pate + '</g><g transform="translate(200 236) rotate(-10)">' + pate + '</g>');
  /* les flammes qui restent sur le dos (brûlé) : chaque flamme est une pièce qui vacille */
  var gF1 = D.lin([[0, '#ff4a10'], [.6, '#ff8a1a'], [1, '#ffc040', .8]], 0, 1, 0, 0), gF2 = D.lin([[0, '#ffd040'], [1, '#fff8c0']], 0, 1, 0, 0);
  function flamme(h, w){ return '<path d="' + flammeD(h, w) + '" fill="' + gF1 + '" stroke="#5a1a08" stroke-width="2"/><path d="' + flammeD(h * .7, w * .62) + '" fill="#ffa21e"/><path d="' + flammeD(h * .42, w * .36) + '" fill="' + gF2 + '"/>'; }
  var feu = douceP(380, 120, 140, 40, '#140c10', .7) + douceP(380, 80, 180, 80, '#ff8a20', .45);
  [[300, 112, 66, 30], [336, 98, 90, 38], [372, 88, 112, 44], [410, 92, 96, 40], [446, 108, 84, 34], [478, 140, 64, 28], [500, 190, 46, 22], [250, 132, 44, 22], [356, 92, 56, 22], [430, 98, 50, 20]].forEach(function(f, k){
    feu += '<g transform="translate(' + f[0] + ' ' + f[1] + ')">' + piv('x-fl' + k, 0, 0, flamme(f[2] * .7, f[3] * .85)) + '</g>';
  });
  /* les étoiles de l'éblouissement, qui tourneront autour de la tête */
  var etoiles = '';
  for(var ie = 0; ie < 6; ie++){ var re2 = 17 - (ie % 2) * 4; etoiles += piv('x-et' + ie, 0, 0, '<circle r="22" fill="' + D.doux('#fff6c0', .6) + '"/><path d="' + etoileD(re2, 5, .45) + '" fill="#ffe466" stroke="' + O + '" stroke-width="2.6"/><path d="' + etoileD(re2 * .42, 5, .45) + '" fill="#fffbe0"/>'); }
  /* la flaque sous lui, sur la berge */
  var flaque = vari('flaque', '<ellipse cx="300" cy="420" rx="230" ry="12" fill="#2a4c58" opacity=".55"/><ellipse cx="300" cy="418" rx="190" ry="6" fill="' + LUNE + '" opacity=".18"/>' + L('M150 418 C 240 412 360 412 460 418', LUNE, 1.6, ' opacity=".5"'));

  /* ======== l'assemblage des deux chaînes ======== */
  function chaine(contenu, sol){
    return piv('pos', 283, 400, (sol || '') + piv('saut', 283, 400, piv('secousse', 283, 260, piv('posture', 283, 230, piv('corps', 283, 404, contenu)))));
  }
  var A = piv('brasF', 132, 334, avbrasF) + piv('couronneF', 300, 122, couronneF) + piv('oeilF', 134, 140, oeilF) +
    corps + surDos + ventre + gorgeP + cuisse + algues + couronne + glande + tympan + teteFond + autourOeil + oeil +
    '<g' + sousLevre + '>' + machoire + '</g>' + museau + levre + flashs(corpsD) + colleCorps + vari('feu', feu) + vari('etoiles', etoiles) +
    ancre('centre', 290, 250) + ancre('pieds', 300, 404) + ancre('dos', 380, 110);
  var B = piv('brasF', 132, 334, piv('mainF', 112, 392, mainF + ancre('mainF', 96, 404))) +
    piv('bras', 318, 262, brasH + piv('avbras', 352, 346, avb + piv('main', 284, 390, main)));
  out.A = chaine(A, flaque);
  out.B = chaine(B);

  /* ======== la langue qui jaillit (pièces pré-dessinées, posées dans le monde) ========
     langueTir : une langue droite de 100 unités le long de x, qu'on tourne vers la cible et qu'on étire (scaleX) ;
     langueBout : le bout collant, puis le « paquet » (le héros attrapé : deux bottes qui gigotent, une main) */
  var gLT = D.lin([[0, '#f8c8d6'], [.45, LANGUE], [1, '#8a3a5e']], 0, 0, 0, 1);
  var NS2 = ' vector-effect="non-scaling-stroke"';
  var tir = '<path d="M-4 -13 C 30 -12 70 -9.5 100 -7.5 L 100 7.5 C 70 9.5 30 12 -4 13 Z" fill="' + gLT + '" stroke="' + O + '" stroke-width="2.6" stroke-linejoin="round"' + NS2 + '/>' +
    L('M0 2 C 40 2 70 1.5 100 1', '#9a4a6c', 2, ' opacity=".7"' + NS2) + L('M2 -7 C 40 -6.5 70 -5 98 -4', '#fbe0ea', 2.2, ' opacity=".75"' + NS2);
  function botte(bx, by, c){ return Pw(T2('M-4 0 L -4 12 L 8 12 Q 12 12 11 8 L 4 6 L 4 0 Z', bx, by), c, 2) + L(T2('M-4 11 L 10 11', bx, by), '#2a1810', 2.4); }
  var simple = '<circle r="15" fill="' + LANGUE + '" stroke="' + O + '" stroke-width="2.6"/><ellipse cx="-4" cy="-5" rx="5" ry="3" fill="#fbe0ea" opacity=".8"/>';
  var paquet = piv('x-botte0', -6, 12, botte(-6, 12, '#5a3a22')) + piv('x-botte1', 8, 10, botte(8, 10, '#6a4428')) +
    piv('x-mainH', -12, -14, L(T2('M0 0 L -3 -10 M0 0 L 2 -11 M0 0 L 6 -8', -12, -14), O, 3.4) + L(T2('M0 0 L -3 -10 M0 0 L 2 -11 M0 0 L 6 -8', -12, -14), '#e8b890', 2) + C(-12, -14, 4, '#e8b890', ' stroke="' + O + '" stroke-width="1.6"')) +
    '<circle r="19" fill="' + LANGUE + '" stroke="' + O + '" stroke-width="2.6"/>' + L('M-14 -4 Q 0 -12 14 -2 M-12 6 Q 0 -2 14 8', '#9a4a6c', 1.6, ' opacity=".7"') + '<ellipse cx="-5" cy="-8" rx="6" ry="3" fill="#fbe0ea" opacity=".8"/>';
  out.langue = vari('langue', piv('langueTir', 0, 0, tir) + piv('langueBout', 0, 0, vari('boutSimple', simple, 1) + vari('paquet', paquet)));
  return out;
}

/* l'eau autour de Bourbe : le bassin (une tache d'eau noire qui s'efface sur les bords), coupé en deux le long
   de la ligne d'eau : le fond (derrière lui) et le devant (par-dessus ce qui est immergé) */
function vari(nom, c, op){ return '<g data-j="v-' + nom + '" opacity="' + (op == null ? 0 : op) + '"' + (op ? '' : ' visibility="hidden"') + '>' + c + '</g>'; }
function dessinerEau(D){
  var o = {};
  var gB = D.radU(290, 384, 345, [[0, '#2c5462', .66], [.3, '#1a3a46', .84], [.6, '#0e222a', .95], [.84, '#081218', .8], [1, '#081218', 0]], 290, 350, 'translate(290 384) scale(1 .255) translate(-290 -384)');
  var clipH = D.clip(DESSUS_EAU), clipB = D.clip(DESSOUS_EAU);
  var reflets = '';
  var Rr = rng(45);
  for(var k = 0; k < 16; k++){ var wx = Rr() < .5 ? 10 + Rr() * 120 : 380 + Rr() * 200, wy = 360 + Rr() * 40; reflets += L('M' + f1(wx) + ' ' + f1(wy) + ' h ' + f1(8 + Rr() * 18), LUNE, 1.4, ' opacity="' + f1(.2 + Rr() * .35) + '"'); }
  o.fond = '<g' + clipH + '>' + F(BASSIN, gB) + L('M-40 336 C 100 322 480 322 620 336', LUNE, 1.4, ' opacity=".18"') + douce(D, 430, 350, 140, 12, LUNE, .2) + '</g>';
  /* le devant : l'eau qui couvre ce qui est immergé, ses rides, et ce qui brille au fond */
  var dev = '<g' + clipB + '>' + F(BASSIN, gB) +
    douce(D, 300, 378, 200, 18, '#0a1418', .55) +
    L('M116 366 Q 320 400 534 360', LUNE, 1.2, ' opacity=".22"') + L('M116 376 Q 320 410 534 370', LUNE, 1, ' opacity=".14"') +
    L('M60 372 Q 210 394 300 396', LUNE, 1.4, ' opacity=".3"') + L('M380 388 Q 470 376 560 362', LUNE, 1.4, ' opacity=".35"') + L('M372 400 Q 470 388 580 372', LUNE, 1, ' opacity=".2"') +
    '<g data-brille="1">' + douce(D, 182, 402, 34, 9, '#fff0b0', .55) + C(182, 402, 2.4, '#fffbe0') + L('M174 402 h 16 M182 397 v 10', '#fffbe0', 1.2, ' opacity=".8"') + C(195, 398, 1.2, '#fffbe0', ' opacity=".7"') + '</g>' +
    '<g data-reflets="1">' + reflets + '</g></g>';
  dev += vari('colleEau', '<ellipse cx="300" cy="384" rx="250" ry="14" fill="#c8d84a" fill-opacity=".45" stroke="#5a6420" stroke-width="2"/>' + L('M100 380 C 200 374 360 374 480 380', '#ffffd0', 1.8, ' opacity=".7"') +
    [[140, 388, 4], [240, 392, 3], [360, 386, 5], [470, 390, 3.5]].map(function(b){ return '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="' + b[2] + '" fill="#e8f0a0" stroke="#5a6420" stroke-width="1"/>'; }).join(''));
  o.devant = dev;
  /* la ligne d'eau sur le corps : un trait clair, de l'écume, des bulles collées */
  var ligne = L(LIGNE_EAU, '#0a1218', 5, ' opacity=".5"') + L('M116 354 Q 320 388 534 348', clair(PEAU, .35), 2, ' opacity=".4"') + L('M112 360 Q 320 394 538 354', LUNE, 2.2, ' opacity=".6"');
  var Rf = rng(71);
  for(var kf = 0; kf < 46; kf++){ var tf = Rf(), xf = (1 - tf) * (1 - tf) * 116 + 2 * tf * (1 - tf) * 320 + tf * tf * 534, yf = (1 - tf) * (1 - tf) * 360 + 2 * tf * (1 - tf) * 394 + tf * tf * 354 + Rf() * 4 - 1; ligne += C(f1(xf), f1(yf), f1(.6 + Rf() * 1.6), Rf() < .6 ? '#cfe6ee' : '#8fb0b8', ' opacity="' + f1(.35 + Rf() * .4) + '"'); }
  [[150, 362, 3.2], [162, 366, 2], [508, 356, 2.6], [372, 380, 2.2]].forEach(function(b){ ligne += C(b[0], b[1], b[2], 'none', ' stroke="' + LUNE + '" stroke-width="1.2" opacity=".7"') + C(f1(b[0] + b[2] * .35), f1(b[1] - b[2] * .4), f1(b[2] * .3), '#fff', ' opacity=".8"'); });
  o.ligne = ligne;
  /* la glace (givre sur le bassin) : une plaque claire et fêlée, et un col de glace autour de lui */
  var gG = D.radU(290, 384, 345, [[0, '#e8f6ff', .9], [.5, '#bfe2f4', .88], [.8, '#8ab8d4', .8], [1, '#8ab8d4', 0]], 290, 350, 'translate(290 384) scale(1 .255) translate(-290 -384)');
  var fel = L('M40 380 L 90 372 L 120 388 M470 372 L 520 384 L 560 376 M200 404 L 240 396 L 280 410 L 330 400 M600 368 L 560 360 M-10 366 L 30 372', '#5a8aa8', 1.6, ' opacity=".7"') + L('M42 378 L 90 370 L 120 386 M470 370 L 520 382 M200 402 L 240 394 L 280 408', '#ffffff', 1, ' opacity=".8"');
  var eclats = '';
  for(var ke = 0; ke < 10; ke++){ var ax = -20 + ke * 64 + Rf() * 30, ay = 366 + Rf() * 36; eclats += '<g transform="translate(' + f1(ax) + ' ' + f1(ay) + ')"><path d="' + eclatD(4 + Rf() * 4) + '" fill="#ffffff" opacity=".9"/></g>'; }
  o.glaceFond = vari('glace', '<g' + clipH + '>' + F(BASSIN, gG) + L('M-40 336 C 100 322 480 322 620 336', '#ffffff', 2, ' opacity=".6"') + '</g>');
  var col = '';
  for(var kc = 0; kc <= 18; kc++){ var tc = kc / 18, xc = (1 - tc) * (1 - tc) * 112 + 2 * tc * (1 - tc) * 320 + tc * tc * 536, yc = (1 - tc) * (1 - tc) * 358 + 2 * tc * (1 - tc) * 392 + tc * tc * 352; col += (kc ? ' L ' : 'M') + f1(xc) + ' ' + f1(yc - 4 - (kc % 2) * 7); }
  for(var kc2 = 18; kc2 >= 0; kc2--){ var tc2 = kc2 / 18, xc2 = (1 - tc2) * (1 - tc2) * 112 + 2 * tc2 * (1 - tc2) * 320 + tc2 * tc2 * 536, yc2 = (1 - tc2) * (1 - tc2) * 358 + 2 * tc2 * (1 - tc2) * 392 + tc2 * tc2 * 352; col += ' L ' + f1(xc2) + ' ' + f1(yc2 + 6); }
  o.glaceDevant = vari('glace', '<g' + clipB + '>' + F(BASSIN, gG) + fel + eclats + '</g>' + Pw(col + ' Z', '#f4fbff', 1.6, ' opacity=".92"') + L(LIGNE_EAU, '#ffffff', 2, ' opacity=".9"'));
  return o;
}

/* =====================================================================
   3. Le CSS (injecté une seule fois)
   ===================================================================== */
var CSS = '.bt-bourbe{position:relative;width:100%;height:100%;transform-origin:50% 100%}' +
  '.bt-bourbe>svg{width:100%;height:100%;overflow:visible;display:block}' +
  '.bt-bourbe [data-j]{transform-box:view-box;transform-origin:0 0}' +
  '.bt-bourbe-scene-fx{position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;pointer-events:none;z-index:6}';
function injecterCSS(){
  if(document.getElementById('bt-bourbe-css')) return;
  var s = document.createElement('style'); s.id = 'bt-bourbe-css'; s.textContent = CSS; document.head.appendChild(s);
}

/* =====================================================================
   4. Le moteur : des poses-clés jouées par la Web Animations API
   ===================================================================== */
var Z = {x: 0, y: 0, a: 0, sx: 1, sy: 1};
var VB = {x: -40, y: 20, w: 600, h: 416};
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
function ondeCles(base, amp, n, canal){
  var cles = [];
  n = n || 8;
  for(var i = 0; i <= n; i++){ var t = i / n, v = {}; v[canal || 'a'] = (base || 0) + amp * Math.sin(t * Math.PI * 2); cles.push({t: t, v: v}); }
  return cles;
}
var NS = 'http://www.w3.org/2000/svg';

function Bourbe(conteneur, options){
  injecterCSS();
  this.c = conteneur;
  this.opt = options || {};
  var D = new Defs('bbA' + (++NUM) + '_');
  this.D = D;
  var art = dessinerBourbe(D), eau = dessinerEau(D);
  this.formes = art;
  var clipMonde = D.clip('M-600 -900 L 1200 -900 L 1200 440 L -600 440 Z');
  var div = document.createElement('div');
  div.className = 'bt-bourbe';
  div.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + VB.x + ' ' + VB.y + ' ' + VB.w + ' ' + VB.h + '" preserveAspectRatio="xMidYMax meet"><defs>' + D.l.join('') + '</defs>' +
    sansOpacite(eau.fond + eau.glaceFond +
    '<g' + clipMonde + '>' + vari('plongeA', art.A, 1) + '</g>' +
    eau.devant + vari('ligne', eau.ligne, 1) + eau.glaceDevant +
    '<g data-slot="restes"></g><g data-slot="ondes"></g>' +
    vari('plongeB', art.B, 1) + art.langue) +
    '<g data-slot="monde"></g></svg>';
  conteneur.appendChild(div);
  this.el = div;
  this.svg = div.querySelector('svg');
  this.defs = this.svg.querySelector('defs');
  D.vivant = this.defs;
  var self = this;
  /* trois sortes de pièces : J (animées en transform par les poses), V (variantes : opacité seule), K (boucles autonomes) */
  this.J = {}; this.V = {}; this.K = {}; this.S = {}; this.A = {};
  [].forEach.call(this.svg.querySelectorAll('[data-j]'), function(e){
    var n = e.getAttribute('data-j'), r = n.indexOf('v-') === 0 ? self.V : (n.indexOf('x-') === 0 ? self.K : self.J);
    if(r !== self.J) n = n.slice(2);
    (r[n] = r[n] || []).push(e);
  });
  [].forEach.call(this.svg.querySelectorAll('[data-slot]'), function(e){ var n = e.getAttribute('data-slot'); if(!self.S[n]) self.S[n] = e; });
  [].forEach.call(this.svg.querySelectorAll('[data-a]'), function(e){ var n = e.getAttribute('data-a'); if(!self.A[n]) self.A[n] = e; });
  this.plongeA = this.V.plongeA[0];
  this.plongeB = this.V.plongeB[0];
  this.S.ligne = this.V.ligne[0];
  this.boucX = {};
  this.nbP = 0;
  this.v = {};
  this.etat = {enrage: false, brule: false, colle: false, ebloui: false, gele: false, ouvert: false, dos: false, cible: false,
    berge: false, sec: false, gonfle: false, avale: false, sous: false};
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
var R = Bourbe.prototype;

/* lire la pose actuelle d'une pièce (même au milieu d'une animation) */
R._lire = function(n){
  var el = this.J[n][0], ref = this.v[n] || Z, t = getComputedStyle(el).transform;
  if(!t || t === 'none') return fusion(Z);
  var m = t.match(/matrix\(([^)]+)\)/);
  if(!m) return fusion(ref);
  var v = m[1].split(',').map(parseFloat), sx = Math.hypot(v[0], v[1]), ang = Math.atan2(v[1], v[0]) * 180 / Math.PI, sy = (v[0] * v[3] - v[1] * v[2]) / (sx || 1);
  /* un retournement complet (posture à 180°) se lit comme un angle : on garde le tour le plus proche de la pose connue */
  while(ang - ref.a > 180) ang -= 360;
  while(ang - ref.a < -180) ang += 360;
  if(sy < 0 && ref.sy > 0){ sy = -sy; sx = -sx; ang += 180; while(ang - ref.a > 180) ang -= 360; while(ang - ref.a < -180) ang += 360; }
  return {x: v[4], y: v[5], a: ang, sx: sx, sy: sy};
};
/* figer : on lit toutes les poses, on coupe les animations, on garde la pose */
R._figer = function(noms){
  var self = this;
  (noms || Object.keys(this.J)).forEach(function(n){
    var v = self._lire(n);
    self.J[n].forEach(function(el){ el.getAnimations().forEach(function(a){ a.cancel(); }); el.style.transform = tf(v); });
    self.v[n] = v;
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
  var p = {}, n;
  if(tout) for(n in this.J) p[n] = fusion(Z);
  for(n in pose) p[n] = fusion(Z, pose[n]);
  return this._seq([{t: 1, p: p, e: e || 'cubic-bezier(.3,.7,.3,1)'}], duree).fini;
};
/* un point (une ancre, ou x,y dans une pièce) ramené dans le repère « monde » du SVG */
R._ou = function(ancre, x, y){
  var el = typeof ancre === 'string' ? (this.A[ancre] || (this.J[ancre] && this.J[ancre][0]) || this.S[ancre]) : ancre;
  if(x == null && el.getAttribute && el.getAttribute('data-a')){ x = +el.getAttribute('cx'); y = +el.getAttribute('cy'); }
  var m = el.getCTM(), w = this.S.monde.getCTM(), p = this.svg.createSVGPoint();
  p.x = x; p.y = y;
  p = p.matrixTransform(m).matrixTransform(w.inverse());
  return [p.x, p.y];
};
/* l'échelle du SVG à l'écran (pixels par unité du dessin) et son coin */
R._echelle = function(){
  var r = this.svg.getBoundingClientRect(), k = Math.min(r.width / VB.w, r.height / VB.h);
  return {k: k, x0: r.left + (r.width - VB.w * k) / 2 - VB.x * k, y0: r.top + (r.height - VB.h * k) - VB.y * k};
};
R._versEcran = function(p){ var e = this._echelle(); return {x: e.x0 + p[0] * e.k, y: e.y0 + p[1] * e.k}; };
R._versMonde = function(q){ var e = this._echelle(); return [(q.x - e.x0) / e.k, (q.y - e.y0) / e.k]; };
R._def = function(html){ this.defs.insertAdjacentHTML('beforeend', html); };
R._minuteur = function(f, ms){ var self = this, id = setTimeout(function(){ var i = self.minuteurs.indexOf(id); if(i >= 0) self.minuteurs.splice(i, 1); f(); }, ms); this.minuteurs.push(id); return id; };
R._couperMinuteurs = function(){ this.minuteurs.forEach(clearTimeout); this.minuteurs = []; };
R._couperBoucles = function(){
  this._couperMinuteurs();
  this._figer();
  this.boucles = [];
};
R._el = function(parent, html){
  var g = document.createElementNS(NS, 'g');
  g.innerHTML = html;
  parent.appendChild(g);
  return g;
};
/* une opacité qui change doucement (pour des groupes entiers) */
R._fondu = function(els, vers, ms, delai){
  var self = this;
  if(typeof els === 'string') els = this.V[els] || [];
  [].concat(els).forEach(function(e){
    if(!e) return;
    var de = parseFloat(getComputedStyle(e).opacity);
    e.getAnimations().forEach(function(a){ a.cancel(); });
    if(e.getAttribute('visibility') === 'hidden') de = 0;
    e.setAttribute('opacity', vers);
    e.style.opacity = '';
    /* une variante invisible est vraiment cachée : elle ne coûte rien à afficher */
    if(vers > 0) e.removeAttribute('visibility');
    if(ms){ var an = e.animate([{opacity: de}, {opacity: vers}], {duration: ms, delay: delai || 0, fill: 'backwards', easing: 'ease-in-out'}); if(vers <= 0) an.finished.then(function(){ if(+e.getAttribute('opacity') <= 0) e.setAttribute('visibility', 'hidden'); }, function(){}); }
    else if(vers <= 0) e.setAttribute('visibility', 'hidden');
  });
};
/* les boucles autonomes (pièces x-…) : elles ne dépendent pas des poses */
R._boucleX = function(nom, frames, duree, o){
  o = o || {};
  var self = this, l = [];
  (this.K[nom] || []).forEach(function(e){ l.push(e.animate(frames, {duration: duree, iterations: Infinity, delay: o.delai || 0, easing: o.e || 'linear', direction: o.dir || 'normal'})); });
  (this.boucX[nom] = this.boucX[nom] || []).push.apply(this.boucX[nom], l);
  return l;
};
R._couperX = function(prefixe){
  var self = this;
  Object.keys(this.boucX).forEach(function(n){ if(n.indexOf(prefixe) === 0){ self.boucX[n].forEach(function(a){ a.cancel(); }); delete self.boucX[n]; } });
};
/* un calque par-dessus la scène (langue, onde de choc, explosion), en pixels de la scène */
R._calque = function(scene){
  scene = scene || this.c.parentNode || this.c;
  var cs = getComputedStyle(scene);
  if(cs.position === 'static') scene.style.position = 'relative';
  var sr = scene.getBoundingClientRect(), W = scene.offsetWidth || sr.width, H = scene.offsetHeight || sr.height, ech = W / (sr.width || 1);
  var ov = document.createElementNS(NS, 'svg');
  ov.setAttribute('class', 'bt-bourbe-scene-fx');
  ov.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
  scene.appendChild(ov);
  var self = this;
  return {
    el: ov, W: W, H: H,
    /* un point écran -> le calque */
    pt: function(q){ var r = scene.getBoundingClientRect(), e = W / (r.width || 1); return [(q.x - r.left) * e, (q.y - r.top) * e]; },
    /* une ancre de Bourbe -> le calque */
    ancre: function(nom){ return this.pt(self.ancre(nom)); },
    /* une unité du dessin de Bourbe en pixels du calque */
    u: function(){ var r = scene.getBoundingClientRect(); return self._echelle().k * W / (r.width || 1); },
    g: function(html){ var g = document.createElementNS(NS, 'g'); g.innerHTML = html; ov.appendChild(g); return g; },
    defs: function(html){ var d = ov.querySelector('defs'); if(!d){ d = document.createElementNS(NS, 'defs'); ov.insertBefore(d, ov.firstChild); } d.insertAdjacentHTML('beforeend', html); },
    retirer: function(){ ov.remove(); }
  };
};

/* =====================================================================
   5. Les poses de base de chaque mode
   ===================================================================== */
var BERGE = {x: -34, y: -66};
var POSES = {
  eau: {},
  /* sur la berge : sorti de l'eau, posé sur le bord, en entier */
  berge: {pos: {x: BERGE.x, y: BERGE.y}, bras: {a: 4}, avbras: {a: -6}, main: {a: 8}, mainF: {a: 6}},
  /* sur le dos : retourné, le ventre pâle en l'air, les pattes qui gigotent */
  dos: {posture: {a: 180, y: 66}, cuisse: {a: -26}, jambe: {a: -40}, pied: {a: 30}, bras: {a: -30}, avbras: {a: 40}, main: {a: 20}, brasF: {a: -24}, mainF: {a: 20},
    machoire: {a: -9}, langue: {a: 30}, algues: {a: 10}, brins: {a: 14}, couronne: {a: -6}},
  /* sous l'eau : on ne le voit plus */
  sous: {pos: {y: 330}}
};
/* la main sur l'œil (ébloui) : bras levé, avant-bras replié vers la tête */
var MAIN_OEIL = {bras: {a: 52}, avbras: {a: 76}, main: {a: 30, x: -4, y: -6}};
R._mode = function(){ return this.etat.sous ? 'sous' : (this.etat.dos ? 'dos' : (this.etat.berge ? 'berge' : 'eau')); };
R._base = function(){
  var p = {}, m = POSES[this._mode()], n, e = this.etat;
  for(n in m) p[n] = fusion(Z, m[n]);
  if(e.dos && e.berge){ p.pos = fusion(Z, {x: BERGE.x, y: BERGE.y + 6}); p.posture = fusion(Z, {a: 180, y: 52}); }
  if(e.gonfle){
    p.corps = fusion(Z, {sx: 1.15, sy: 1.2});
    p.ventre = fusion(Z, {s: 1.08});
    p.gorge = fusion(Z, {sx: 1.25, sy: 1.35});
    if(!e.dos && !e.sous){ p.pos = p.pos || fusion(Z); p.pos.y -= 12; }
  }
  if(e.ebloui && !e.dos && !e.sous){ for(n in MAIN_OEIL) p[n] = fusion(Z, MAIN_OEIL[n]); p.paupiere = fusion(Z, {y: 14}); p.paupB = fusion(Z, {y: -6}); p.pupille = fusion(Z, {sx: .55, sy: .7}); }
  if(e.enrage){ for(var i = 0; i < 5; i++) p['pointe' + i] = fusion(Z, {sy: 1.18}); p.pupille = fusion(p.pupille || Z, {sx: .7}); }
  if(e.cible && !e.enrage){ for(var j = 0; j < 5; j++) p['pointe' + j] = fusion(Z, {sy: 1.07}); }
  if(e.avale) p.bosse = fusion(Z, {x: 200, y: 345});
  return p;
};

/* =====================================================================
   6. L'attente : des boucles vivantes + des petits événements au hasard
   ===================================================================== */
/* le jeton de reprise : une reprise interrompue par une autre (ou par une action) ne lance pas ses boucles,
   sinon chaque pièce aurait deux boucles d'attente (la carte graphique ne compose plus, tout est redessiné à chaque image) */
R._reprendre = function(duree){
  var self = this, n = this.reprise = (this.reprise || 0) + 1;
  if(this.mort) return Promise.resolve();
  this._couperBoucles();
  return this._allerA(this._base(), duree == null ? 380 : duree, 'cubic-bezier(.3,.7,.3,1)', true).then(function(){
    if(n !== self.reprise || self.enAction || self.mort) return;
    if(self.attente) self._lancerBoucles();
  });
};
R._lancerBoucles = function(){
  var self = this, b = this._base(), mode = this._mode(), e = this.etat, V = e.enrage ? 1.5 : 1;
  this.vitesse = V;
  function B(n){ return fusion(Z, b[n]); }
  function autour(n, d){ var v = B(n), o = {}; for(var k in d) o[k] = (k === 'sx' || k === 'sy') ? v[k] * d[k] : v[k] + d[k]; return o; }
  function boucle(n, deltas, duree, ease, delai){
    var cles = deltas.map(function(d){ return {t: d[0], p: (function(){ var o = {}; o[n] = autour(n, d[1]); return o; })(), e: ease}; });
    return self._seq(cles, duree, {boucle: true, vitesse: V, depuis: b, delai: delai || 0});
  }
  var EI = 'ease-in-out';
  if(mode === 'eau' || mode === 'berge'){
    if(mode === 'eau' && !e.gele) boucle('saut', [[0, {y: 0}], [.5, {y: e.gonfle ? -7 : -3.5}], [1, {y: 0}]], e.gonfle ? 2200 : 3200, EI);
    if(e.gele) boucle('pos', [[0, {x: 0, a: 0}], [.3, {x: -7, a: -.6}], [.65, {x: 5, a: .5}], [1, {x: 0, a: 0}]], 2800, EI);
    boucle('corps', [[0, {sy: 1, sx: 1}], [.45, {sy: 1.012, sx: .996}], [1, {sy: 1, sx: 1}]], 2400, EI);
    boucle('gorge', [[0, {sx: 1, sy: 1}], [.45, {sx: 1.06, sy: 1.12}], [1, {sx: 1, sy: 1}]], 2400, EI);
    boucle('ventre', [[0, {sx: 1, sy: 1}], [.5, {sx: 1.01, sy: 1.015}], [1, {sx: 1, sy: 1}]], 2400, EI);
    boucle('langue', [[0, {a: 0}], [.3, {a: 3.5}], [.7, {a: -2.5}], [1, {a: 0}]], 2800, EI);
    boucle('baveL', [[0, {sy: 1}], [.5, {sy: 1.18}], [1, {sy: 1}]], 2800, EI);
    boucle('algues', [[0, {a: 0}], [.5, {a: 1.6}], [1, {a: 0}]], 3400, EI);
    boucle('brins', [[0, {a: 0}], [.35, {a: -3}], [.7, {a: 2.2}], [1, {a: 0}]], 2600, EI);
    boucle('alguesF', [[0, {a: 0}], [.5, {a: 2.4}], [1, {a: 0}]], 3000, EI, -800);
    boucle('algueCoude', [[0, {a: 0}], [.35, {a: 5}], [.7, {a: -3}], [1, {a: 0}]], 2200, EI);
    boucle('glande', [[0, {sx: 1, sy: 1}], [.5, {sx: 1.03, sy: 1.04}], [1, {sx: 1, sy: 1}]], 2800, EI, -400);
    boucle('pupille', [[0, {x: 0}], [.3, {x: -1.6}], [.65, {x: 1.2}], [1, {x: 0}]], 5200, EI);
    boucle('main', [[0, {a: 0}], [.5, {a: -1.2}], [1, {a: 0}]], 2400, EI);
    boucle('mainF', [[0, {a: 0}], [.5, {a: 1}], [1, {a: 0}]], 2600, EI);
    if(e.gele){ boucle('bras', [[0, {a: 0}], [.3, {a: 5}], [.65, {a: -4}], [1, {a: 0}]], 2800, EI); boucle('brasF', [[0, {a: 0}], [.3, {a: -4}], [.65, {a: 4}], [1, {a: 0}]], 2800, EI); }
    if(e.ebloui){ boucle('main', [[0, {a: 0}], [.5, {a: 6}], [1, {a: 0}]], 420, EI); boucle('secousse', [[0, {a: 0, x: 0}], [.5, {a: -1.2, x: 2}], [1, {a: 0, x: 0}]], 1100, EI); }
    if(e.enrage) boucle('secousse', [[0, {x: 0}], [.25, {x: 1.4}], [.5, {x: -1.2}], [.75, {x: 1}], [1, {x: 0}]], 160, 'linear');
    else if(e.cible && !e.ebloui) boucle('secousse', [[0, {x: 0, y: 0}], [.5, {x: .6, y: -.4}], [1, {x: 0, y: 0}]], 240, 'linear');
  } else if(mode === 'dos'){
    /* sur le dos : il se tortille, les quatre pattes gigotent, la langue pend */
    boucle('posture', [[0, {a: 0, x: 0}], [.25, {a: 4, x: 5}], [.5, {a: 0, x: 0}], [.75, {a: -4, x: -5}], [1, {a: 0, x: 0}]], 1100, EI);
    boucle('cuisse', [[0, {a: -10}], [.5, {a: 14}], [1, {a: -10}]], 520, EI);
    boucle('jambe', [[0, {a: 12}], [.5, {a: -22}], [1, {a: 12}]], 460, EI, -120);
    boucle('pied', [[0, {a: 0}], [.5, {a: 26}], [1, {a: 0}]], 400, EI);
    boucle('bras', [[0, {a: 0}], [.5, {a: 24}], [1, {a: 0}]], 440, EI);
    boucle('avbras', [[0, {a: -10}], [.5, {a: 24}], [1, {a: -10}]], 380, EI, -90);
    boucle('main', [[0, {a: 0}], [.5, {a: -26}], [1, {a: 0}]], 360, EI);
    boucle('brasF', [[0, {a: 14}], [.5, {a: -14}], [1, {a: 14}]], 480, EI);
    boucle('mainF', [[0, {a: 0}], [.5, {a: 24}], [1, {a: 0}]], 400, EI, -140);
    boucle('langue', [[0, {a: 0}], [.5, {a: -18}], [1, {a: 0}]], 700, EI);
    boucle('machoire', [[0, {a: 0}], [.5, {a: -5}], [1, {a: 0}]], 800, EI);
    boucle('gorge', [[0, {sx: 1, sy: 1}], [.5, {sx: 1.1, sy: 1.2}], [1, {sx: 1, sy: 1}]], 700, EI);
    boucle('ventre', [[0, {sx: 1, sy: 1}], [.5, {sx: 1.03, sy: 1.05}], [1, {sx: 1, sy: 1}]], 700, EI);
    boucle('brins', [[0, {a: 0}], [.5, {a: 10}], [1, {a: 0}]], 600, EI);
    boucle('pupille', [[0, {x: 0, y: 0}], [.25, {x: -3, y: 2}], [.5, {x: 0, y: 3}], [.75, {x: 3, y: 1}], [1, {x: 0, y: 0}]], 1400, 'linear');
  }
  if(e.avale && mode !== 'sous') boucle('bosse', [[0, {x: 0, y: 0, sx: 1, sy: 1}], [.17, {x: -50, y: 15, sx: 1.12, sy: .9}], [.33, {x: 30, y: 27, sx: .95, sy: 1.05}], [.5, {x: 70, y: -1, sx: .92, sy: 1.08}], [.67, {x: -10, y: -27, sx: 1.1, sy: .92}], [.83, {x: -70, y: -9, sx: .96, sy: 1.04}], [1, {x: 0, y: 0, sx: 1, sy: 1}]], 4200, EI);
  if(mode !== 'sous' && !e.gele && !e.berge) this._ridesBoucle(true);
  this._planifier(500);
};
R._planifier = function(ms){
  var self = this;
  this._minuteur(function(){
    if(self.enAction || self.mort || !self.attente) return;
    self._evenement();
    self._planifier(hasard(1100, 2600) / (self.etat.enrage ? 1.5 : 1));
  }, ms);
};
R._evenement = function(){
  var mode = this._mode(), e = this.etat, self = this, liste;
  if(mode === 'eau') liste = ['cligne', 'cligne', 'bave', 'bave', 'croasse', 'croasse', 'regard', 'tapote', 'bulles', 'mouche', 'rot'];
  else if(mode === 'berge') liste = ['cligne', 'cligne', 'bave', 'croasse', 'regard', 'egoutte', 'egoutte', 'secoue', 'regardEau', 'tapote'];
  else if(mode === 'dos') liste = ['cligne', 'gigote', 'couine', 'couine'];
  else liste = ['bulles', 'bulles', 'oeilSous'];
  if(mode !== 'sous' && mode !== 'dos'){
    if(e.avale) liste = liste.concat(['hic', 'tapote', 'tapote', 'toc']);
    if(e.sec) liste = liste.concat(['grille', 'grille', 'grille']);
    if(e.enrage) liste = liste.concat(['regard', 'grogne', 'grogne']);
    if(e.ebloui) liste = ['cligneFort', 'cligneFort', 'larme', 'cligneFort'];
    if(e.gele) liste = liste.concat(['frisson', 'buee', 'buee']);
    if(e.colle) liste = liste.concat(['tire', 'tire', 'tire']);
    if(e.gonfle) liste = liste.filter(function(x){ return x !== 'croasse' && x !== 'mouche'; }).concat(['grince', 'grince']);
  }
  if(e.brule) liste = liste.concat(['sursaut', 'sursaut']);
  if(e.dos && e.sec) liste = liste.concat(['grille']);
  this._joue(choisir(liste));
};
/* les petits gestes (tous « par-dessus » la pose, pour marcher dans tous les modes) */
R._joue = function(ev){
  var self = this, A = {ajout: true, vitesse: this.vitesse}, e = this.etat;
  switch(ev){
    case 'cligne':
      /* un clignement lent, qui prend son temps */
      this._seq([{t: 0, p: {paupiere: {y: 0}, paupF: {y: 0}}}, {t: .38, p: {paupiere: {y: 46}, paupF: {y: 15}}, e: 'ease-in'}, {t: .62, p: {paupiere: {y: 46}, paupF: {y: 15}}}, {t: 1, p: {paupiere: {y: 0}, paupF: {y: 0}}, e: 'ease-out'}], 620, A);
      break;
    case 'cligneFort':
      this._seq([{t: 0, p: {paupiere: {y: 0}, paupF: {y: 0}, paupB: {y: 0}}}, {t: .25, p: {paupiere: {y: 30}, paupF: {y: 14}, paupB: {y: -6}}}, {t: .45, p: {paupiere: {y: 6}}}, {t: .65, p: {paupiere: {y: 32}, paupF: {y: 14}}}, {t: 1, p: {paupiere: {y: 0}, paupF: {y: 0}, paupB: {y: 0}}}], 560, A);
      break;
    case 'bave':
      this._baveGoutte();
      break;
    case 'croasse':
      /* le sac de la gorge gonfle comme un ballon, puis se vide */
      this._seq([{t: 0, p: {gorge: {sx: 1, sy: 1}, corps: {sy: 1}, saut: {y: 0}, machoire: {a: 0}}}, {t: .35, p: {gorge: {sx: 1.45, sy: 1.9}, corps: {sy: 1.02}, saut: {y: -3}, machoire: {a: .8}}, e: 'cubic-bezier(.3,.7,.4,1)'},
        {t: .55, p: {gorge: {sx: 1.38, sy: 1.75}}}, {t: .68, p: {gorge: {sx: 1.48, sy: 1.95}}}, {t: 1, p: {gorge: {sx: 1, sy: 1}, corps: {sy: 1}, saut: {y: 0}, machoire: {a: 0}}, e: 'cubic-bezier(.5,0,.3,1)'}], 1500, A);
      if(this._mode() === 'eau') this._minuteur(function(){ self._rides(self._ou('pointfaible')[0] - 30, 1, .8); }, 600);
      break;
    case 'regard':
      /* il fixe les héros : la pupille se resserre, les pointes de la couronne se dressent */
      var pr = {}, pr0 = {};
      for(var i = 0; i < 5; i++){ pr['pointe' + i] = {sy: 1.14}; pr0['pointe' + i] = {sy: 1}; }
      pr.pupille = {sx: .5, x: -3}; pr0.pupille = {sx: 1, x: 0}; pr.secousse = {a: -1.2, x: -5}; pr0.secousse = {a: 0, x: 0}; pr.paupB = {y: -4}; pr0.paupB = {y: 0};
      this._seq([{t: 0, p: pr0}, {t: .25, p: pr, e: 'cubic-bezier(.2,.8,.3,1)'}, {t: .75, p: pr}, {t: 1, p: pr0}], 1700, A);
      break;
    case 'tapote':
      /* il se tapote le ventre, content de lui */
      this._seq([{t: 0, p: {bras: {a: 0}, avbras: {a: 0}, main: {a: 0}}}, {t: .2, p: {bras: {a: 14}, avbras: {a: 22}, main: {a: 14}}, e: 'ease-out'}, {t: .32, p: {bras: {a: 10}, avbras: {a: 12}, main: {a: 6}}, e: 'ease-in'},
        {t: .46, p: {bras: {a: 14}, avbras: {a: 22}, main: {a: 14}}}, {t: .58, p: {bras: {a: 10}, avbras: {a: 12}, main: {a: 6}}, e: 'ease-in'}, {t: 1, p: {bras: {a: 0}, avbras: {a: 0}, main: {a: 0}}}], 1300, A);
      this._seq([{t: 0, p: {ventre: {sx: 1, sy: 1}}}, {t: .32, p: {ventre: {sx: 1.02, sy: .98}}}, {t: .4, p: {ventre: {sx: 1, sy: 1}}}, {t: .58, p: {ventre: {sx: 1.02, sy: .98}}}, {t: .66, p: {ventre: {sx: 1, sy: 1}}}], 1300, A);
      break;
    case 'bulles':
      if(this._mode() === 'sous'){ var q = this._ou('oeilC'); this._bulles(q[0] + hasard(-60, 120), 4, 1); }
      else this._bulles(hasard(140, 500), 3, .8);
      break;
    case 'mouche':
      this._mouche();
      break;
    case 'rot':
      this._rot(.7);
      break;
    case 'egoutte':
      for(var d = 0; d < 3; d++) (function(k){ self._minuteur(function(){ var p = self._ou('centre'); self._goutte([p[0] + hasard(-180, 200), p[1] + hasard(40, 110)], {coul: '#cdeeff'}); }, k * 240); })(d);
      break;
    case 'secoue':
      var s = [{t: 0, p: {secousse: {a: 0}, couronne: {a: 0}, algues: {a: 0}}}];
      for(var j = 1; j < 7; j++) s.push({t: j / 7, p: {secousse: {a: j % 2 ? 2.4 : -2.4}, couronne: {a: j % 2 ? -3 : 3}, algues: {a: j % 2 ? 8 : -6}}});
      s.push({t: 1, p: {secousse: {a: 0}, couronne: {a: 0}, algues: {a: 0}}});
      this._seq(s, 800, A);
      this._minuteur(function(){ var p = self._ou('dos'); for(var k = 0; k < 6; k++) self._goutte([p[0] + hasard(-160, 120), p[1] + hasard(-10, 60)], {coul: '#cdeeff', dx: hasard(-40, 40), saute: hasard(10, 30)}); }, 200);
      break;
    case 'regardEau':
      /* hors de l'eau, il jette un œil inquiet vers son bassin */
      this._seq([{t: 0, p: {pupille: {x: 0}, secousse: {a: 0, x: 0}}}, {t: .3, p: {pupille: {x: 6}, secousse: {a: 1.5, x: 3}}, e: 'ease-out'}, {t: .7, p: {pupille: {x: 6}, secousse: {a: 1.5, x: 3}}}, {t: 1, p: {pupille: {x: 0}, secousse: {a: 0, x: 0}}}], 1400, A);
      this._joue('cligne');
      break;
    case 'gigote':
      var g = [{t: 0, p: {cuisse: {a: 0}, jambe: {a: 0}, bras: {a: 0}}}];
      for(var k2 = 1; k2 < 8; k2++) g.push({t: k2 / 8, p: {cuisse: {a: k2 % 2 ? 18 : -14}, jambe: {a: k2 % 2 ? -20 : 16}, bras: {a: k2 % 2 ? -20 : 18}}});
      g.push({t: 1, p: {cuisse: {a: 0}, jambe: {a: 0}, bras: {a: 0}}});
      this._seq(g, 900, A);
      break;
    case 'couine':
      this._seq([{t: 0, p: {machoire: {a: 0}, paupiere: {y: 0}}}, {t: .3, p: {machoire: {a: -12}, paupiere: {y: 20}}}, {t: 1, p: {machoire: {a: 0}, paupiere: {y: 0}}}], 700, A);
      this._cri(this._ou('bouche'), .9);
      break;
    case 'oeilSous':
      this._oeilSous();
      break;
    case 'hic':
      this._hoquet();
      break;
    case 'toc':
      this._toc();
      break;
    case 'grille':
      this._grille();
      break;
    case 'grogne':
      var gr = [{t: 0, p: {secousse: {x: 0, a: 0}, machoire: {a: 0}, gorge: {sx: 1, sy: 1}}}];
      for(var k3 = 1; k3 < 10; k3++) gr.push({t: k3 / 10, p: {secousse: {x: k3 % 2 ? 2 : -2, a: k3 % 2 ? .5 : -.5}, machoire: {a: -3 - (k3 % 3)}, gorge: {sx: 1.2, sy: 1.4}}, e: 'linear'});
      gr.push({t: 1, p: {secousse: {x: 0, a: 0}, machoire: {a: 0}, gorge: {sx: 1, sy: 1}}});
      this._seq(gr, 900, A);
      var nar = this._ou('narine');
      for(var v = 0; v < 3; v++) this._bouffee([nar[0] - 4, nar[1]], {r: 6, coul: '#f0eef8', op: .7, dx: hasard(-40, -20), dy: hasard(-20, -6), duree: 700, delai: v * 140, s1: 2.6});
      break;
    case 'larme':
      var pl = this._ou('oeilC');
      this._goutte([pl[0] - 22, pl[1] + 18], {coul: '#9ad8ff'});
      break;
    case 'frisson':
      var fr = [{t: 0, p: {secousse: {x: 0}}}];
      for(var k4 = 1; k4 < 14; k4++) fr.push({t: k4 / 14, p: {secousse: {x: k4 % 2 ? 2.2 : -2.2}}, e: 'linear'});
      fr.push({t: 1, p: {secousse: {x: 0}}});
      this._seq(fr, 700, A);
      this._seq([{t: 0, p: {paupiere: {y: 0}, paupB: {y: 0}}}, {t: .2, p: {paupiere: {y: 18}, paupB: {y: -5}}}, {t: .8, p: {paupiere: {y: 18}, paupB: {y: -5}}}, {t: 1, p: {paupiere: {y: 0}, paupB: {y: 0}}}], 700, A);
      break;
    case 'buee':
      var pb = this._ou('bouche');
      for(var v2 = 0; v2 < 3; v2++) this._bouffee([pb[0] - 6, pb[1] + 4], {r: 8, coul: '#eef6ff', op: .65, dx: hasard(-50, -30), dy: hasard(-30, -10), duree: 1200, delai: v2 * 160, s1: 2.6});
      break;
    case 'tire':
      this._tireColle();
      break;
    case 'grince':
      /* gonflé : il tangue comme un ballon trop plein */
      this._seq([{t: 0, p: {secousse: {a: 0}, gorge: {sx: 1, sy: 1}}}, {t: .3, p: {secousse: {a: -2.5}, gorge: {sx: 1.08, sy: 1.12}}}, {t: .65, p: {secousse: {a: 2}}}, {t: 1, p: {secousse: {a: 0}, gorge: {sx: 1, sy: 1}}}], 1400, A);
      break;
    case 'sursaut':
      this._seq([{t: 0, p: {saut: {y: 0, sy: 1}, machoire: {a: 0}, paupiere: {y: 0}}}, {t: .2, p: {saut: {y: 3, sy: .96}}}, {t: .45, p: {saut: {y: -22, sy: 1.04}, machoire: {a: -10}, paupiere: {y: 30}}, e: 'cubic-bezier(.2,.8,.4,1)'}, {t: .8, p: {saut: {y: 0, sy: .97}}, e: 'cubic-bezier(.6,0,.9,.5)'}, {t: 1, p: {saut: {y: 0, sy: 1}, machoire: {a: 0}, paupiere: {y: 0}}}], 760, A);
      break;
  }
};

/* =====================================================================
   7. Petits effets (particules dans le repère « monde » du SVG)
   ===================================================================== */
/* la hauteur de l'eau (ou du sol de la berge) sous un point */
R._niveau = function(x){
  if(this.etat.berge && !this.etat.sous){ var c = this._ou('pieds'); if(Math.abs(x - c[0]) < 250) return c[1] - 4; }
  var t = (x - 116) / 418;
  if(t > 0 && t < 1) return (1 - t) * (1 - t) * 362 + 2 * t * (1 - t) * 394 + t * t * 356 + 2;
  return 362;
};
/* une particule : forme simple, retirée du DOM à la fin ; au-delà de 24 en même temps, elle n'est pas affichée */
R._fxEl = function(html, parent){
  var self = this, g = document.createElementNS(NS, 'g');
  g.innerHTML = html;
  if(this.nbP < 24){
    (parent || this.S.monde).appendChild(g);
    this.nbP++;
    g.remove = function(){ if(g.parentNode){ self.nbP--; Element.prototype.remove.call(g); } };
  }
  return g;
};
R._bouffee = function(p, o){
  o = o || {};
  var r = o.r || 8, coul = o.coul || '#c8c0d8', g = this._fxEl('<circle cx="0" cy="0" r="' + r + '" fill="' + coul + '" opacity="' + (o.op || .7) + '"/>' + (o.liser ? '<circle cx="' + f1(-r * .3) + '" cy="' + f1(-r * .3) + '" r="' + f1(r * .45) + '" fill="#ffffff" opacity=".35"/>' : ''), o.parent);
  var dx = o.dx == null ? hasard(-10, 10) : o.dx, dy = o.dy == null ? -30 : o.dy, d = o.duree || 900;
  var a = g.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(' + (o.s0 || .3) + ')', opacity: 0}, {offset: .15, opacity: 1}, {transform: 'translate(' + f1(p[0] + dx) + 'px,' + f1(p[1] + dy) + 'px) scale(' + (o.s1 || 1.6) + ')', opacity: 0}], {duration: d, easing: 'cubic-bezier(.2,.7,.4,1)', delay: o.delai || 0, fill: 'both'});
  a.finished.then(function(){ g.remove(); }, function(){ g.remove(); });
  return a;
};
/* une goutte qui tombe (de la bave, de l'eau) ; elle fait une ride en touchant l'eau */
R._goutte = function(p, o){
  o = o || {};
  var self = this, coul = o.coul || '#d8f0ff', r = o.r || 3.4;
  var g = this._fxEl(Pw('M0 -' + f1(r * 1.8) + ' C ' + f1(r * .6) + ' -' + f1(r * .6) + ' ' + f1(r * 1.2) + ' ' + f1(r * .3) + ' ' + f1(r * 1.2) + ' ' + f1(r * .9) + ' C ' + f1(r * 1.2) + ' ' + f1(r * 1.8) + ' ' + f1(r * .6) + ' ' + f1(r * 2.1) + ' 0 ' + f1(r * 2.1) + ' C -' + f1(r * .6) + ' ' + f1(r * 2.1) + ' -' + f1(r * 1.2) + ' ' + f1(r * 1.8) + ' -' + f1(r * 1.2) + ' ' + f1(r * .9) + ' C -' + f1(r * 1.2) + ' ' + f1(r * .3) + ' -' + f1(r * .6) + ' -' + f1(r * .6) + ' 0 -' + f1(r * 1.8) + ' Z', coul, 1.2) + C(f1(-r * .4), f1(r * .7), f1(r * .35), '#fff'));
  var x1 = p[0] + (o.dx || 0), sol = o.sol || this._niveau(x1), dy = Math.max(10, sol - p[1]), d = o.duree || (Math.sqrt(dy) * 42 + (o.saute ? 200 : 0));
  var frames = [{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(.6,1.2)'}];
  if(o.saute) frames.push({offset: .3, transform: 'translate(' + f1(p[0] + (o.dx || 0) * .4) + 'px,' + f1(p[1] - o.saute) + 'px) scale(.8,1)'});
  frames.push({transform: 'translate(' + f1(x1) + 'px,' + f1(sol) + 'px) scale(.8,1.3)'});
  var a = g.animate(frames, {duration: d, easing: o.saute ? 'linear' : 'cubic-bezier(.5,0,1,1)', fill: 'forwards', delay: o.delai || 0});
  a.finished.then(function(){
    g.remove();
    if(self.etat.berge && !o.eau) self._eclabousse([x1, sol], coul, .6);
    else self._rides(x1, 1, .45, sol);
  }, function(){ g.remove(); });
};
R._eclabousse = function(p, coul, k){
  var s = this._fxEl('<ellipse cx="0" cy="0" rx="9" ry="2.4" fill="' + coul + '" opacity=".8"/><circle cx="-8" cy="-5" r="1.8" fill="' + coul + '"/><circle cx="8" cy="-6" r="1.6" fill="' + coul + '"/>');
  s.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(' + .3 * (k || 1) + ',1)', opacity: 1}, {transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(' + 1.4 * (k || 1) + ',.7)', opacity: 0}], {duration: 460, easing: 'ease-out', fill: 'forwards'}).finished.then(function(){ s.remove(); });
};
/* des rides qui s'élargissent sur l'eau (arcs d'ellipse coupés, comme une vraie onde) */
R._rides = function(x, n, force, y){
  var self = this;
  if(this.etat.gele && !this.etat.sous){ return; }
  y = y || this._niveau(x);
  force = force || 1;
  for(var i = 0; i < (n || 1); i++){
    var rx = 26 * force, ry = 5.5 * force;
    var d = '<path d="M' + f1(-rx) + ' 0 A ' + f1(rx) + ' ' + f1(ry) + ' 0 0 0 ' + f1(rx * .7) + ' ' + f1(ry * .7) + ' M' + f1(rx * .92) + ' ' + f1(ry * .4) + ' A ' + f1(rx) + ' ' + f1(ry) + ' 0 0 0 ' + f1(rx * .5) + ' ' + f1(-ry * .86) + '" fill="none" stroke="' + LUNE + '" stroke-width="' + f1(2 / Math.max(.6, force)) + '" stroke-linecap="round"/>';
    (function(k){
      var g = self._fxEl(d, self.S.ondes);
      g.animate([{transform: 'translate(' + f1(x) + 'px,' + f1(y) + 'px) scale(.3)', opacity: 0}, {offset: .12, opacity: .8}, {transform: 'translate(' + f1(x) + 'px,' + f1(y) + 'px) scale(' + f1(2.6 + force) + ')', opacity: 0}], {duration: 1500 + force * 500, delay: k * 280, easing: 'cubic-bezier(.2,.6,.4,1)', fill: 'both'}).finished.then(function(){ g.remove(); });
    })(i);
  }
};
/* des rides qui partent régulièrement de son corps (dans l'eau) */
R._ridesBoucle = function(on){
  var self = this;
  clearTimeout(this.fx.rides);
  if(!on) return;
  (function suite(){
    if(self.mort || self.enAction || !self.attente || self.etat.sous || self.etat.berge || self.etat.gele) return;
    var c = self._ou('centre');
    self._rides(choisir([c[0] - 170, c[0] - 120, c[0] + 60, c[0] + 200, c[0] + 230]), 1, hasard(.8, 1.2));
    self.fx.rides = setTimeout(suite, hasard(1300, 2200));
  })();
};
/* des bulles qui montent du fond et éclatent à la surface */
R._bulles = function(x, n, force, y0){
  var self = this;
  force = force || 1;
  for(var i = 0; i < n; i++){
    (function(k){
      var r = hasard(2.5, 6) * force, bx = x + hasard(-20, 20) * force, surf = self._niveau(bx), dep = (y0 || surf + 50) + hasard(0, 20);
      var g = self._fxEl('<circle r="' + f1(r) + '" fill="#9ad0e0" fill-opacity=".15" stroke="' + LUNE + '" stroke-width="1.3" opacity=".85"/><circle cx="' + f1(-r * .35) + '" cy="' + f1(-r * .35) + '" r="' + f1(r * .3) + '" fill="#fff"/>', self.S.ondes);
      var d = hasard(500, 900);
      var a = g.animate([{transform: 'translate(' + f1(bx) + 'px,' + f1(dep) + 'px) scale(.4)', opacity: 0}, {offset: .2, opacity: .9}, {offset: .85, transform: 'translate(' + f1(bx + hasard(-4, 4)) + 'px,' + f1(surf - 2) + 'px) scale(1)', opacity: .9}, {transform: 'translate(' + f1(bx) + 'px,' + f1(surf - 4) + 'px) scale(1.5)', opacity: 0}], {duration: d, delay: k * hasard(90, 200), easing: 'ease-out', fill: 'both'});
      a.finished.then(function(){ g.remove(); if(!self.etat.gele) self._rides(bx, 1, .4 * force, surf); }, function(){ g.remove(); });
    })(i);
  }
};
/* une gerbe d'eau noire : un voile qui monte puis retombe, et des gouttes en arc */
R._gerbe = function(x, y, force, o){
  o = o || {};
  var self = this, k = force || 1, coul = o.coul || '#2a4c58', clairC = o.clair || '#cfe6ee', parent = o.parent || this.S.monde;
  /* le voile en couronne */
  var vd = 'M-60 0 C -58 -20 -52 -40 -40 -62 C -36 -40 -30 -26 -22 -16 C -22 -44 -16 -70 -6 -92 C 0 -66 4 -42 8 -18 C 14 -40 22 -60 34 -74 C 36 -50 38 -30 42 -14 C 48 -30 54 -44 62 -52 C 62 -30 62 -12 60 0 Z';
  var v = this._fxEl(Pw(vd, coul, 2.2, ' fill-opacity=".85"') + L('M-40 -58 C -38 -40 -32 -26 -24 -16 M-6 -88 C -2 -60 2 -40 6 -20 M34 -70 C 34 -48 36 -30 40 -16', clairC, 2, ' opacity=".8"'), parent);
  v.animate([{transform: 'translate(' + f1(x) + 'px,' + f1(y) + 'px) scale(' + f1(.5 * k) + ',.1)', opacity: 1}, {offset: .35, transform: 'translate(' + f1(x) + 'px,' + f1(y) + 'px) scale(' + f1(1.3 * k) + ',' + f1(1.1 * k) + ')', opacity: 1}, {transform: 'translate(' + f1(x) + 'px,' + f1(y) + 'px) scale(' + f1(1.7 * k) + ',.2)', opacity: 0}], {duration: 900 + 200 * k, easing: 'cubic-bezier(.2,.7,.5,1)', fill: 'forwards'}).finished.then(function(){ v.remove(); });
  /* les gouttes */
  var n = Math.round((o.n || 14) * Math.min(1.6, k));
  for(var i = 0; i < n; i++){
    var a = -Math.PI * hasard(.1, .9), vit = hasard(50, 150) * k, r = hasard(2.5, 6) * Math.sqrt(k), dx = Math.cos(a) * vit * (o.large || 1.4), h = -Math.sin(a) * vit;
    var gt = this._fxEl('<circle r="' + f1(r) + '" fill="' + coul + '" stroke="' + O + '" stroke-width="1.2"/><circle cx="' + f1(-r * .3) + '" cy="' + f1(-r * .3) + '" r="' + f1(r * .35) + '" fill="' + clairC + '"/>', parent);
    var dur = hasard(600, 950) * Math.sqrt(k);
    gt.animate([{transform: 'translate(' + f1(x + hasard(-20, 20) * k) + 'px,' + f1(y - 10) + 'px)'}, {offset: .45, transform: 'translate(' + f1(x + dx * .55) + 'px,' + f1(y - h) + 'px)', easing: 'ease-in'}, {transform: 'translate(' + f1(x + dx) + 'px,' + f1(y + 8) + 'px)', opacity: .2}], {duration: dur, easing: 'cubic-bezier(.2,.6,.5,1)', fill: 'forwards'}).finished.then((function(g2, xx){ return function(){ g2.remove(); if(!o.sansRides) self._rides(xx, 1, .5); }; })(gt, x + dx), function(){});
  }
  if(!o.sansRides) this._rides(x, 3, 1.2 * k, y);
};
R._cri = function(p, force){
  var traits = '';
  for(var i = 0; i < 7; i++){ var a = Math.PI * (.7 + i * .1), r0 = 18, r1 = 34 + (i % 2) * 10; traits += 'M' + f1(Math.cos(a) * r0) + ' ' + f1(Math.sin(a) * r0) + ' L ' + f1(Math.cos(a) * r1) + ' ' + f1(Math.sin(a) * r1) + ' '; }
  var g = this._fxEl(L(traits, O, 7) + L(traits, '#ffffff', 3.4));
  g.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(.4)', opacity: 0}, {offset: .2, opacity: 1, transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(' + (force || 1) + ')'}, {transform: 'translate(' + f1(p[0] - 10) + 'px,' + f1(p[1]) + 'px) scale(' + (1.35 * (force || 1)) + ')', opacity: 0}], {duration: 460, easing: 'ease-out', fill: 'forwards'}).finished.then(function(){ g.remove(); });
};
/* un rot : une grosse bulle verdâtre qui sort de la gueule et éclate */
R._rot = function(force){
  var self = this, k = force || 1, A = {ajout: true};
  this._seq([{t: 0, p: {gorge: {sx: 1, sy: 1}, machoire: {a: 0}, saut: {y: 0}}}, {t: .3, p: {gorge: {sx: 1.3, sy: 1.6}, saut: {y: 2}}}, {t: .42, p: {machoire: {a: -9 * k}, gorge: {sx: 1, sy: 1}, saut: {y: -4}}, e: 'cubic-bezier(.2,.9,.3,1)'}, {t: .7, p: {machoire: {a: -2}}}, {t: 1, p: {gorge: {sx: 1, sy: 1}, machoire: {a: 0}, saut: {y: 0}}}], 1100, A);
  this._minuteur(function(){
    var p = self._ou('bouche'), r = 13 * k;
    var b = self._fxEl('<circle r="' + f1(r) + '" fill="#b8d890" fill-opacity=".35" stroke="#e8ffd0" stroke-width="2"/><circle cx="' + f1(-r * .35) + '" cy="' + f1(-r * .35) + '" r="' + f1(r * .28) + '" fill="#fff" opacity=".9"/>');
    b.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(.2)'}, {offset: .7, transform: 'translate(' + f1(p[0] - 34) + 'px,' + f1(p[1] - 30) + 'px) scale(1.3)'}, {transform: 'translate(' + f1(p[0] - 40) + 'px,' + f1(p[1] - 36) + 'px) scale(1.7)', opacity: 0}], {duration: 900, easing: 'ease-out', fill: 'forwards'}).finished.then(function(){
      b.remove();
      var q = [p[0] - 40, p[1] - 36], ec = '';
      for(var i = 0; i < 8; i++){ var a = i / 8 * Math.PI * 2; ec += 'M' + f1(Math.cos(a) * 12 * k) + ' ' + f1(Math.sin(a) * 12 * k) + ' L ' + f1(Math.cos(a) * 22 * k) + ' ' + f1(Math.sin(a) * 22 * k) + ' '; }
      var s = self._fxEl(L(ec, '#e8ffd0', 2.4));
      s.animate([{transform: 'translate(' + f1(q[0]) + 'px,' + f1(q[1]) + 'px) scale(.6)', opacity: 1}, {transform: 'translate(' + f1(q[0]) + 'px,' + f1(q[1]) + 'px) scale(1.4)', opacity: 0}], {duration: 360, fill: 'forwards'}).finished.then(function(){ s.remove(); });
    });
    for(var i = 0; i < 3; i++) self._bouffee([p[0] - 6, p[1]], {r: 6 * k, coul: '#c8d8a8', op: .5, dx: hasard(-40, -20), dy: hasard(-20, 0), duree: 700, delai: i * 80, s1: 2.4});
  }, 450);
};
/* le hoquet : un petit sursaut, la gorge qui se serre */
R._hoquet = function(){
  var self = this;
  this._seq([{t: 0, p: {saut: {y: 0, sy: 1}, gorge: {sx: 1, sy: 1}, paupiere: {y: 0}, machoire: {a: 0}}}, {t: .18, p: {saut: {y: -14, sy: 1.04}, gorge: {sx: .85, sy: .7}, paupiere: {y: 26}, machoire: {a: -5}}, e: 'cubic-bezier(.1,.9,.3,1)'}, {t: .5, p: {saut: {y: 0, sy: .97}, gorge: {sx: 1, sy: 1}, paupiere: {y: 0}, machoire: {a: 0}}, e: 'cubic-bezier(.5,0,.6,1)'}, {t: 1, p: {saut: {y: 0, sy: 1}}}], 620, {ajout: true});
  var p = this._ou('bouche');
  this._bouffee([p[0] - 4, p[1] - 4], {r: 5, coul: '#e8ffd0', op: .8, dx: -16, dy: -26, duree: 600, s1: 1.8, liser: true});
  if(this._mode() === 'eau') this._minuteur(function(){ self._rides(self._ou('centre')[0] - 60, 1, .9); }, 200);
};
/* toc toc : le héros avalé tape de l'intérieur */
R._toc = function(){
  var p = this._ou('pointfaible'), x = p[0] + hasard(-50, 60), y = p[1] + hasard(-10, 30), traits = '';
  for(var i = 0; i < 3; i++){ var a = -Math.PI * (.25 + i * .25); traits += 'M' + f1(Math.cos(a) * 26) + ' ' + f1(Math.sin(a) * 26) + ' L ' + f1(Math.cos(a) * 40) + ' ' + f1(Math.sin(a) * 40) + ' '; }
  var self = this;
  [0, 260].forEach(function(dl, k){
    var g = self._fxEl(L(traits, O, 6) + L(traits, '#fff6c0', 3));
    g.animate([{transform: 'translate(' + f1(x + k * 14) + 'px,' + f1(y - k * 8) + 'px) scale(.5)', opacity: 0}, {offset: .25, opacity: 1, transform: 'translate(' + f1(x + k * 14) + 'px,' + f1(y - k * 8) + 'px) scale(1)'}, {transform: 'translate(' + f1(x + k * 14) + 'px,' + f1(y - k * 8) + 'px) scale(1.2)', opacity: 0}], {duration: 380, delay: dl, fill: 'both'}).finished.then(function(){ g.remove(); });
  });
  this._seq([{t: 0, p: {ventre: {sx: 1, sy: 1}}}, {t: .1, p: {ventre: {sx: 1.03, sy: 1.04}}}, {t: .3, p: {ventre: {sx: 1, sy: 1}}}, {t: .4, p: {ventre: {sx: 1.03, sy: 1.04}}}, {t: .6, p: {ventre: {sx: 1, sy: 1}}}], 700, {ajout: true});
  this._seq([{t: 0, p: {pupille: {x: 0, y: 0}}}, {t: .2, p: {pupille: {x: 2, y: 4}}}, {t: .8, p: {pupille: {x: 2, y: 4}}}, {t: 1, p: {pupille: {x: 0, y: 0}}}], 900, {ajout: true});
};
/* la peau sèche grésille : la glande rougeoie, de petites fumées, des étincelles */
R._grille = function(){
  var self = this;
  (this.V.grille || []).forEach(function(g){ g.removeAttribute('visibility'); g.animate([{opacity: 0}, {opacity: 1, offset: .3}, {opacity: 0}], {duration: 700}).finished.then(function(){ g.setAttribute('visibility', 'hidden'); }, function(){}); });
  var p = this._ou('glandeC');
  for(var i = 0; i < 4; i++) this._bouffee([p[0] + hasard(-30, 30), p[1] - 6], {r: hasard(5, 8), coul: '#e8e4ee', op: .6, dx: hasard(-10, 20), dy: hasard(-60, -40), duree: hasard(900, 1300), delai: i * 90, s1: 2.4});
  for(var j = 0; j < 5; j++){
    var e = this._fxEl('<path d="' + eclatD(4) + '" fill="#ffd060"/>'), x = p[0] + hasard(-30, 30), y = p[1] + hasard(-6, 6);
    e.animate([{transform: 'translate(' + f1(x) + 'px,' + f1(y) + 'px) scale(.3)', opacity: 1}, {transform: 'translate(' + f1(x + hasard(-14, 14)) + 'px,' + f1(y - hasard(10, 26)) + 'px) scale(1.2)', opacity: 0}], {duration: 420, delay: j * 70, fill: 'both'}).finished.then((function(g){ return function(){ g.remove(); }; })(e));
  }
  /* un petit tressaillement : ça pique */
  this._seq([{t: 0, p: {glande: {sx: 1, sy: 1}, paupiere: {y: 0}}}, {t: .2, p: {glande: {sx: 1.06, sy: .94}, paupiere: {y: 12}}}, {t: .4, p: {glande: {sx: .97, sy: 1.04}}}, {t: 1, p: {glande: {sx: 1, sy: 1}, paupiere: {y: 0}}}], 600, {ajout: true});
};
/* la bave qui s'étire au bout de la langue, puis tombe */
R._baveGoutte = function(){
  var self = this;
  this._seq([{t: 0, p: {baveL: {sy: 1}}}, {t: .75, p: {baveL: {sy: 2.2, sx: .8}}, e: 'ease-in'}, {t: .82, p: {baveL: {sy: .5, sx: 1}}, e: 'cubic-bezier(.2,1.6,.5,1)'}, {t: 1, p: {baveL: {sy: 1, sx: 1}}}], 1600, {ajout: true});
  this._minuteur(function(){ if(!self.mort) self._goutte(self._ou('baveBout'), {coul: '#ead8f2'}); }, 1600 * .76);
};
/* la bosse du héros avalé : on la montre ou on la cache (elle se promène grâce à la boucle d'attente) */
R._bosseBoucle = function(on){ this._fondu('bosse', on ? 1 : 0, 300); };
/* sous l'eau : on ne voit que la lueur de son œil d'or, qui rôde */
R._oeilSous = function(){
  var x = hasard(140, 440), y = 384;
  var g = this._fxEl(douce(this.D, 0, 0, 30, 9, '#ffcc40', .7) + '<ellipse cx="0" cy="0" rx="8" ry="3.4" fill="#ffe680" opacity=".9"/><ellipse cx="0" cy="0" rx="5" ry="1.2" fill="#2a1408"/>', this.S.ondes);
  g.animate([{transform: 'translate(' + f1(x) + 'px,' + f1(y) + 'px)', opacity: 0}, {offset: .25, opacity: .9}, {offset: .75, opacity: .9}, {transform: 'translate(' + f1(x - 60) + 'px,' + f1(y + 4) + 'px)', opacity: 0}], {duration: 2200, easing: 'ease-in-out', fill: 'both'}).finished.then(function(){ g.remove(); });
};
/* LA LANGUE (pièces pré-dessinées langueTir et langueBout, posées dans le monde) : elle part de base, va jusqu'à cible,
   tient, puis revient. o.sortie, o.tenue, o.retour (ms), o.largeur. Renvoie la fin. */
R._tirLangue = function(base, cible, o){
  o = o || {};
  var self = this, dx = cible[0] - base[0], dy = cible[1] - base[1], L0 = Math.hypot(dx, dy), ang = Math.atan2(dy, dx) * 180 / Math.PI, k = L0 / 100, w = o.largeur || 1;
  var T = o.sortie + o.tenue + o.retour, t1 = o.sortie / T, t2 = (o.sortie + o.tenue) / T;
  function tir(p, sy){ return {x: base[0], y: base[1], a: ang, sx: Math.max(.02, k * p), sy: w * (sy || 1)}; }
  function bout(p, s){ return {x: base[0] + dx * p, y: base[1] + dy * p, a: 0, sx: w * (s || 1), sy: w * (s || 1)}; }
  this._fondu('boutSimple', 1, 0); this._fondu('paquet', 0, 0);
  var s = this._seq([
    {t: 0, p: {langueTir: tir(0), langueBout: bout(0, .6)}},
    {t: t1 * .8, p: {langueTir: tir(1.06, .82), langueBout: bout(1.06, 1)}, e: 'cubic-bezier(.1,.8,.3,1)'},
    {t: t1, p: {langueTir: tir(1, .9), langueBout: bout(1, 1.18)}, e: 'ease-out'},
    {t: t1 + (t2 - t1) * .5, p: {langueTir: tir(.97, 1.1), langueBout: bout(.97, 1)}},
    {t: t2, p: {langueTir: tir(1, 1), langueBout: bout(1, 1)}},
    {t: t2 + (1 - t2) * .5, p: {langueTir: tir(.55, 1.15), langueBout: bout(.55, 1)}, e: 'ease-in'},
    {t: 1, p: {langueTir: tir(.02, 1.2), langueBout: bout(.02, .7)}, e: 'cubic-bezier(.6,0,1,.6)'}
  ], T);
  /* on ne la montre qu'une fois posée au départ */
  requestAnimationFrame(function(){ self._fondu('langue', 1, 0); });
  return s.fini.then(function(){ self._fondu('langue', 0, 0); self._couperX('botte'); self._couperX('mainH'); });
};
/* le héros attrapé au bout de la langue : bottes qui gigotent, main qui s'agite */
R._paquet = function(){
  this._fondu('boutSimple', 0, 0); this._fondu('paquet', 1, 0);
  this._boucleX('botte0', [{transform: 'rotate(-25deg)'}, {transform: 'rotate(25deg)'}], 130, {dir: 'alternate'});
  this._boucleX('botte1', [{transform: 'rotate(25deg)'}, {transform: 'rotate(-25deg)'}], 130, {dir: 'alternate', delai: 60});
  this._boucleX('mainH', [{transform: 'rotate(-30deg)'}, {transform: 'rotate(30deg)'}], 160, {dir: 'alternate'});
};
/* la mouche : elle tourne autour de sa tête, il la suit de l'œil… et CLAP, la langue */
R._mouche = function(force){
  var self = this, o = this._ou('oeilC'), c = [o[0] - 110, o[1] - 20];
  var m = this._fxEl('<g><g transform="scale(2.4)"><ellipse cx="0" cy="0" rx="4.5" ry="3.4" fill="#1a1420"/><circle cx="-3" cy="-1" r="1.6" fill="#e04040"/>' +
    '<ellipse cx="1" cy="-4" rx="4.4" ry="2.4" fill="#e8f4ff" fill-opacity=".75" stroke="#24182e" stroke-width=".5"/><ellipse cx="3.4" cy="-3.6" rx="4" ry="2.2" fill="#e8f4ff" fill-opacity=".6" stroke="#24182e" stroke-width=".5"/></g></g>');
  var ail = m.querySelectorAll('ellipse');
  [ail[1], ail[2]].forEach(function(e, i){ e.animate([{transform: 'scaleY(1)'}, {transform: 'scaleY(.2)'}], {duration: 50, iterations: Infinity, direction: 'alternate', delay: i * 25}); e.style.transformBox = 'fill-box'; e.style.transformOrigin = '50% 100%'; });
  /* un vol en zigzag (8 points), puis la mouche se pose un instant devant lui */
  var pts = [[c[0] - 80, c[1] - 70], [c[0] - 20, c[1] - 40], [c[0] - 70, c[1] - 10], [c[0] - 10, c[1] + 10], [c[0] - 60, c[1] + 30], [c[0] + 10, c[1] - 6], [c[0] - 30, c[1] + 4]], frames = [], T = 2200;
  pts.forEach(function(p, i){ frames.push({offset: i / (pts.length - 1), transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px)'}); });
  m.firstChild.animate(frames, {duration: T, easing: 'ease-in-out', fill: 'forwards'});
  /* l'œil suit */
  var suit = [{t: 0, p: {pupille: {x: 0, y: 0}}}];
  [[-4, -4], [-2, -2], [-4, 0], [-1, 2], [-4, 3], [-1, 0], [-3, 1]].forEach(function(d, i){ suit.push({t: (i + 1) / 8, p: {pupille: {x: d[0], y: d[1]}}}); });
  suit.push({t: 1, p: {pupille: {x: 0, y: 0}}});
  this._seq(suit, T + 600, {ajout: true});
  this._minuteur(function(){
    if((self.enAction && !force) || self.mort){ m.remove(); return; }
    /* CLAP : la gueule s'ouvre, la langue attrape la mouche, revient */
    var cible = pts[pts.length - 1];
    self._seq([{t: 0, p: {machoire: {a: 0}, langue: {sy: 1}, secousse: {x: 0}}}, {t: .12, p: {machoire: {a: -12}, langue: {sy: .1}, secousse: {x: -6}}, e: 'cubic-bezier(.1,.9,.3,1)'}, {t: .55, p: {machoire: {a: -12}, langue: {sy: .1}}}, {t: .66, p: {machoire: {a: 1}, secousse: {x: 0}}, e: 'cubic-bezier(.6,0,.9,.5)'}, {t: .74, p: {machoire: {a: 0}}}, {t: 1, p: {langue: {sy: 1}}}], 900, {ajout: true});
    setTimeout(function(){ self._tirLangue(self._ou('bouche'), cible, {sortie: 110, tenue: 50, retour: 230, largeur: .5}); }, 90);
    setTimeout(function(){ m.remove(); }, 260);
    self._minuteur(function(){ self._seq([{t: 0, p: {gorge: {sx: 1, sy: 1}}}, {t: .3, p: {gorge: {sx: 1.2, sy: 1.4}}}, {t: 1, p: {gorge: {sx: 1, sy: 1}}}], 600, {ajout: true}); self._joue('cligne'); }, 520);
  }, T);
};
/* collé : il tire sur sa main, les fils de colle s'étirent */
R._tireColle = function(){
  var self = this, T = 1400;
  this._seq([{t: 0, p: {bras: {a: 0}, avbras: {a: 0}, main: {a: 0}}}, {t: .3, p: {bras: {a: -8}, avbras: {a: -14}, main: {a: -10}}, e: 'cubic-bezier(.3,.6,.5,1)'}, {t: .45, p: {bras: {a: -5}, avbras: {a: -9}}}, {t: .6, p: {bras: {a: -10}, avbras: {a: -18}, main: {a: -14}}}, {t: .72, p: {bras: {a: 0}, avbras: {a: 0}, main: {a: 0}}, e: 'cubic-bezier(.7,0,1,.6)'}, {t: 1, p: {bras: {a: 0}}}], T, {ajout: true});
  this._seq([{t: 0, p: {secousse: {a: 0}, machoire: {a: 0}}}, {t: .3, p: {secousse: {a: 1.5}, machoire: {a: -6}}}, {t: .6, p: {secousse: {a: 2}, machoire: {a: -8}}}, {t: .75, p: {secousse: {a: -1}, machoire: {a: 0}}}, {t: 1, p: {secousse: {a: 0}}}], T, {ajout: true});
  var p = this._ou('main');
  var brin = '<path d="M-7 0 C -4 -10 -2 -20 -3 -30 L 3 -30 C 2 -20 4 -10 7 0 Z" fill="#d8e870" fill-opacity=".85" stroke="#5a6420" stroke-width="1.2"/>';
  var g = this._fxEl('<g transform="translate(-12 0)">' + brin + '</g><g transform="translate(12 0)">' + brin + '</g>');
  var sol = [p[0], p[1] + 12];
  g.animate([{transform: 'translate(' + f1(sol[0]) + 'px,' + f1(sol[1]) + 'px) scale(1,.1)', opacity: 0}, {offset: .3, transform: 'translate(' + f1(sol[0]) + 'px,' + f1(sol[1]) + 'px) scale(.8,.75)', opacity: 1}, {offset: .45, transform: 'translate(' + f1(sol[0]) + 'px,' + f1(sol[1]) + 'px) scale(.85,.55)'},
    {offset: .6, transform: 'translate(' + f1(sol[0]) + 'px,' + f1(sol[1]) + 'px) scale(.6,1)'}, {offset: .72, transform: 'translate(' + f1(sol[0]) + 'px,' + f1(sol[1]) + 'px) scale(.4,1.2)', opacity: 1}, {offset: .8, transform: 'translate(' + f1(sol[0]) + 'px,' + f1(sol[1]) + 'px) scale(1,.08)', opacity: .6}, {transform: 'translate(' + f1(sol[0]) + 'px,' + f1(sol[1]) + 'px) scale(1,.05)', opacity: 0}], {duration: T, fill: 'forwards'}).finished.then(function(){ g.remove(); });
};

/* =====================================================================
   8. Les actions (Promise)
   ===================================================================== */
R._debutAction = function(){
  this.jeton++;
  this.reprise = (this.reprise || 0) + 1;
  this.enAction = true;
  clearTimeout(this.fx.rides);
  this._couperBoucles();
  return this.jeton;
};
R._finAction = function(j, duree){
  if(j !== this.jeton || this.mort) return Promise.resolve();
  this.enAction = false;
  return this._reprendre(duree);
};
/* une pose de base pour une pièce (pour revenir exactement à la base à la fin d'une séquence) */
R._b = function(n){ return fusion(Z, this._base()[n]); };
/* le flash : la silhouette pré-dessinée (blanche, bleue ou orange) apparaît un instant (opacité seule) */
R._flash = function(type, op, ms){
  var self = this, base = (type === 'flashG' && this.etat.gele) ? .22 : 0;
  (this.V[type || 'flash'] || []).forEach(function(e){
    e.getAnimations().forEach(function(a){ a.cancel(); });
    e.setAttribute('opacity', base);
    e.removeAttribute('visibility');
    /* en trois paliers : moins d'images à repeindre qu'un fondu continu (le flash est grand) */
    e.animate([{opacity: op || .75}, {opacity: base}], {duration: ms || 320, easing: 'steps(3, end)'}).finished.then(function(){ if(+e.getAttribute('opacity') <= 0) e.setAttribute('visibility', 'hidden'); }, function(){});
  });
};
/* l'éclat d'un coup (étoile blanche, étincelles) en un point du monde */
R._eclat = function(p, k, coul){
  k = k || 1;
  var g = this._fxEl('<path d="' + etoileD(26 * k, 8, .42) + '" fill="' + (coul || '#fff6c0') + '" stroke="' + O + '" stroke-width="2.4"/><path d="' + etoileD(12 * k, 8, .5) + '" fill="#ffffff"/>');
  g.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(.3) rotate(0deg)', opacity: 1}, {offset: .3, transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(1.1) rotate(10deg)', opacity: 1}, {transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(1.3) rotate(20deg)', opacity: 0}], {duration: 380, easing: 'ease-out', fill: 'forwards'}).finished.then(function(){ g.remove(); });
};
R._etincelles = function(p, n, coul, k){
  for(var i = 0; i < n; i++){
    var a = Math.random() * Math.PI * 2, v = hasard(30, 80) * (k || 1), l = hasard(6, 12);
    var e = this._fxEl(L('M0 0 L ' + f1(-Math.cos(a) * l) + ' ' + f1(-Math.sin(a) * l), choisir(coul || ['#fff4b0', '#ffd060', '#ffffff']), 2.6));
    e.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px)', opacity: 1}, {transform: 'translate(' + f1(p[0] + Math.cos(a) * v) + 'px,' + f1(p[1] + Math.sin(a) * v + 16) + 'px)', opacity: 0}], {duration: hasard(350, 650), easing: 'cubic-bezier(.1,.7,.4,1)', fill: 'forwards'}).finished.then((function(g){ return function(){ g.remove(); }; })(e));
  }
};
/* des gouttes de bave gluante qui giclent */
R._giclee = function(p, n, coul){
  for(var i = 0; i < n; i++){
    var a = -Math.PI * hasard(.1, .9), v = hasard(30, 70), r = hasard(2, 4);
    var e = this._fxEl('<circle r="' + f1(r) + '" fill="' + (coul || '#d8f4c0') + '" stroke="' + O + '" stroke-width="1"/>');
    e.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px)'}, {offset: .4, transform: 'translate(' + f1(p[0] + Math.cos(a) * v * .6) + 'px,' + f1(p[1] + Math.sin(a) * v * .8) + 'px)'}, {transform: 'translate(' + f1(p[0] + Math.cos(a) * v) + 'px,' + f1(p[1] + Math.sin(a) * v * .4 + 40) + 'px)', opacity: 0}], {duration: hasard(500, 800), easing: 'ease-out', fill: 'forwards'}).finished.then((function(g){ return function(){ g.remove(); }; })(e));
  }
};

/* ---------------- l'entrée : il émerge lentement de l'eau noire ---------------- */
R.entrer = function(){
  var self = this, j = this._debutAction();
  this.etat.sous = false;
  this._fondu([this.plongeA, this.plongeB, this.S.ligne], 0, 0);
  var depart = {pos: {y: 290, x: 10}, paupiere: {y: 46}, paupF: {y: 15}, langue: {sy: .06}, gorge: {sx: .9, sy: .9}, bras: {a: 30}, avbras: {a: -30}, main: {a: 30}, brasF: {a: 20}, mainF: {a: 30}, algues: {a: 10}, brins: {a: 18}};
  return this._allerA(depart, 1, null, true).then(function(){
    var c = [300, 372];
    /* des bulles, de plus en plus grosses */
    self._bulles(c[0], 4, .8); setTimeout(function(){ self._bulles(c[0] - 40, 6, 1.1); }, 500); setTimeout(function(){ self._bulles(c[0] + 30, 8, 1.4); self._rides(c[0], 3, 1.4); }, 1000);
    /* l'eau se bombe */
    var dome = self._fxEl('<ellipse cx="0" cy="0" rx="120" ry="16" fill="' + self.D.doux('#4a8494') + '" opacity=".7"/>' + L('M-110 0 Q 0 -22 110 0', LUNE, 2, ' opacity=".6"'), self.S.ondes);
    dome.animate([{transform: 'translate(300px,372px) scale(.2,.2)', opacity: 0}, {offset: .6, transform: 'translate(300px,366px) scale(1,1)', opacity: 1}, {transform: 'translate(300px,370px) scale(1.4,.6)', opacity: 0}], {duration: 1700, delay: 1000, easing: 'ease-out', fill: 'both'}).finished.then(function(){ dome.remove(); });
    setTimeout(function(){ self._fondu(self.plongeA, 1, 700); }, 1500);
    setTimeout(function(){ self._fondu(self.plongeB, 1, 500); }, 2900);
    setTimeout(function(){ self._fondu(self.S.ligne, 1, 700); self._rides(c[0] - 120, 2, 1.6); self._rides(c[0] + 160, 2, 1.4); }, 3000);
    /* l'eau ruisselle de partout */
    [1800, 2100, 2400, 2700, 3000, 3300].forEach(function(t){ setTimeout(function(){ var p = self._ou('dos'); for(var k = 0; k < 3; k++) self._goutte([p[0] + hasard(-220, 150), p[1] + hasard(-20, 100)], {coul: '#cdeeff'}); }, t); });
    var T = 6200;
    function t(ms){ return ms / T; }
    return self._seq([
      {t: 0, p: {}},
      /* la couronne perce la surface, puis la tête, l'œil fermé */
      {t: t(1500), p: {pos: {y: 250, x: 8}}, e: 'ease-in'},
      {t: t(2700), p: {pos: {y: 120, x: 4}, algues: {a: 4}, brins: {a: 8}}, e: 'cubic-bezier(.3,.2,.4,1)'},
      {t: t(3500), p: {pos: {y: -12, x: 0}, bras: {a: 6}, avbras: {a: -6}, main: {a: 6}, brasF: {a: 4}, mainF: {a: 6}, algues: {a: -6}, brins: {a: -12}}, e: 'cubic-bezier(.3,.6,.4,1)'},
      {t: t(3900), p: {pos: {y: 0}, bras: {a: 0}, avbras: {a: 0}, main: {a: 0}, brasF: {a: 0}, mainF: {a: 0}, algues: {a: 0}, brins: {a: 0}}, e: 'cubic-bezier(.4,0,.3,1.4)'},
      /* il OUVRE L'ŒIL, lentement */
      {t: t(4200), p: {paupiere: {y: 44}, paupF: {y: 14}, pupille: {sx: .4}}},
      {t: t(4900), p: {paupiere: {y: 0}, paupF: {y: 0}, pupille: {sx: .4}}, e: 'cubic-bezier(.4,0,.2,1)'},
      {t: t(5200), p: {pupille: {sx: 1.25, sy: 1.15}, paupB: {y: -3}}},
      /* il gonfle sa gorge, très content de lui, et sort la langue */
      {t: t(5600), p: {gorge: {sx: 1.45, sy: 1.95}, langue: {sy: .4}, pupille: {sx: 1, sy: 1}, paupB: {y: 0}, saut: {y: -4}}, e: 'cubic-bezier(.3,.7,.4,1)'},
      {t: t(6000), p: {gorge: {sx: 1, sy: 1}, langue: {sy: 1.1}, saut: {y: 0}}, e: 'cubic-bezier(.4,0,.3,1.4)'},
      {t: 1, p: {langue: {sy: 1}}}
    ], T).fini;
  }).then(function(){ return self._finAction(j, 300); });
};

/* ---------------- les attaques ---------------- */
R.attaquer = function(nom, o){
  if(typeof nom === 'object' && nom){ o = nom; nom = null; }
  o = o || {};
  if(nom === 'saut') return this._saut(o);
  return this._langue(o);
};
/* LA LANGUE : elle jaillit jusqu'au héros, l'attrape, revient… et il avale */
R._langue = function(o){
  var self = this, j = this._debutAction(), T = 2800;
    function t(ms){ return ms / T; }
  var pt5 = {}, pt5b = {};
  for(var i = 0; i < 5; i++){ pt5['pointe' + i] = {sy: 1.14}; pt5b['pointe' + i] = {sy: 1}; }
  var anticip = {saut: {y: 6, sy: .96, sx: 1.02}, secousse: {x: 12, a: 1.6}, langue: {sy: .06}, gorge: {sx: 1.3, sy: 1.6}, pupille: {sx: .42, x: -4}, paupB: {y: -5}, machoire: {a: 1.5}};
  for(var n in pt5) anticip[n] = pt5[n];
  var corpsSeq = this._seq([
    {t: 0, p: {}},
    {t: t(300), p: {langue: {sy: .06}}, e: 'cubic-bezier(.6,0,.9,.5)'},
    {t: t(520), p: anticip, e: 'cubic-bezier(.3,.6,.4,1)'},
    /* CLAC : la gueule s'ouvre en grand, il se jette en avant */
    {t: t(600), p: {machoire: {a: -27}, secousse: {x: -22, a: -3}, saut: {y: -4, sy: 1.03, sx: .99}, gorge: {sx: .9, sy: .9}, oeil: {s: 1.06}, pupille: {sx: .38, x: -5}}, e: 'cubic-bezier(.1,.9,.3,1)'},
    {t: t(1250), p: {machoire: {a: -25}, secousse: {x: -20, a: -3}, paupiere: {y: 0}, paupF: {y: 0}, ventre: {sx: 1, sy: 1}, bras: {a: 0}, avbras: {a: 0}, main: {a: 0}}},
    /* GLOUP : la gueule claque, l'œil se ferme, la gorge se bombe */
    {t: t(1340), p: {machoire: {a: 2}, saut: {y: 5, sy: .92, sx: 1.05}, secousse: {x: 0, a: 1.5}, paupiere: {y: 46}, paupF: {y: 15}, gorge: {sx: 1.5, sy: 2.1}, oeil: {s: 1}, pupille: {sx: 1, x: 0}}, e: 'cubic-bezier(.7,0,1,.6)'},
    {t: t(1560), p: {gorge: {sx: 1.2, sy: 1.4}, ventre: {sx: 1.07, sy: 1.1}, saut: {y: -7, sy: 1.04, sx: .98}, machoire: {a: 0}}, e: 'cubic-bezier(.3,.6,.4,1)'},
    {t: t(1760), p: {gorge: {sx: 1, sy: 1}, ventre: {sx: 1.02, sy: 1.03}, saut: {y: 0, sy: 1, sx: 1}, paupiere: {y: 0}, paupF: {y: 0}, secousse: {a: 0}, bras: {a: 0}, avbras: {a: 0}, main: {a: 0}}, e: 'ease-out'},
    /* repu : il se tapote le ventre, l'œil brillant */
    {t: t(1950), p: {bras: {a: 14}, avbras: {a: 22}, main: {a: 14}, pupille: {sx: 1.3, sy: 1.2}, paupB: {y: -3}}, e: 'ease-out'},
    {t: t(2080), p: {bras: {a: 10}, avbras: {a: 12}, main: {a: 6}, ventre: {sx: 1.05, sy: 1}}, e: 'ease-in'},
    {t: t(2220), p: {bras: {a: 14}, avbras: {a: 22}, main: {a: 14}, ventre: {sx: 1.02, sy: 1.03}}},
    {t: t(2350), p: {bras: {a: 10}, avbras: {a: 12}, main: {a: 6}, ventre: {sx: 1.05, sy: 1}}, e: 'ease-in'},
    {t: t(2600), p: {bras: {a: 0}, avbras: {a: 0}, main: {a: 0}, langue: {sy: 1}, ventre: {sx: 1, sy: 1}, pupille: {sx: 1, sy: 1}, paupB: {y: 0}}},
    {t: 1, p: pt5b}
  ], T);
  /* la langue part quand la gueule est grande ouverte (la tête ne bouge plus pendant qu'elle est dehors) */
  var T0 = 610, sortie = 150, tenue = 110, retour = 470;
  var fin = attendreMs(T0).then(function(){
    var base = self._ou('bouche'), cible = o.vers ? self._versMonde(o.vers) : [base[0] - 520, base[1] + 50];
    setTimeout(function(){
      /* SPLATCH : elle colle, elle attrape */
      self._eclat(cible, 1.2);
      self._giclee(cible, 8, LANGUE);
      self._giclee(cible, 4, '#e8f4ff');
      self._paquet();
    }, sortie);
    setTimeout(function(){ if(o.onImpact) try{ o.onImpact(); }catch(er){} }, sortie + 30);
    return self._tirLangue(base, cible, {sortie: sortie, tenue: tenue, retour: retour, largeur: 1.6});
  });
  setTimeout(function(){
    if(o.onAvale) try{ o.onAvale(); }catch(er){}
    self.etat.avale = true;
    self._bosseBoucle(true);
    self._seq([{t: 0, p: {bosse: {x: 140, y: 290, sx: .6, sy: .6}}}, {t: .5, p: {bosse: {x: 170, y: 330, sx: 1.1, sy: 1}}}, {t: 1, p: {bosse: {x: 200, y: 345, sx: 1, sy: 1}}}], 700);
  }, 1360);
  setTimeout(function(){ self._rides(self._ou('centre')[0] - 100, 2, 1); }, 1400);
  setTimeout(function(){ if(!self.mort) self._rot(.6); }, 2650);
  return Promise.all([corpsSeq.fini, fin]).then(function(){ return attendreMs(500); }).then(function(){ return self._finAction(j, 300); });
};

/* LE SAUT : il bondit hors de l'eau et retombe de tout son poids */
R._saut = function(o){
  var self = this, j = this._debutAction(), gros = this.etat.gonfle, berge = this.etat.berge, gele = this.etat.gele;
  var H = gros ? 120 : 70, T = gros ? 3200 : 2600, X = berge ? 0 : -24;
  function t(ms){ return ms / T; }
  var ta = gros ? 700 : 520, tb = ta + (gros ? 560 : 440), tc = tb + (gros ? 380 : 220), td = tc + (gros ? 300 : 230);
  var pt5 = {}, pt0 = {};
  for(var i = 0; i < 5; i++){ pt5['pointe' + i] = {sy: 1.2}; pt0['pointe' + i] = {sy: 1}; }
  var coil = {saut: {y: 14, sy: .86, sx: 1.07}, cuisse: {a: 8}, jambe: {a: 6}, bras: {a: -8}, avbras: {a: 10}, machoire: {a: 2}, paupB: {y: -5}, pupille: {sx: .5}, gorge: {sx: 1.2, sy: 1.3}};
  for(var n in pt5) coil[n] = pt5[n];
  var corpsSeq = this._seq([
    {t: 0, p: {}},
    {t: t(ta), p: coil, e: 'cubic-bezier(.3,.6,.4,1)'},
    /* il s'arrache de l'eau, les jambes se déplient */
    {t: t(tb), p: {saut: {y: -H, x: X, sy: 1.12, sx: .92}, cuisse: {a: -24}, jambe: {a: -66}, pied: {a: 40}, bras: {a: -34}, avbras: {a: 22}, main: {a: 34}, brasF: {a: -22}, mainF: {a: 26}, algues: {a: -10}, brins: {a: -22}, couronne: {a: 5}, langue: {a: 30}, gorge: {sx: .9, sy: .8}, machoire: {a: -7}, oeil: {s: 1.1}, pupille: {sx: 1.2}, paupB: {y: 0}}, e: 'cubic-bezier(.15,.8,.35,1)'},
    {t: t(tc), p: {saut: {y: -H * .92, x: X, sy: 1.04, sx: .97}, cuisse: {a: -16}, jambe: {a: -50}, bras: {a: -44}, avbras: {a: 6}, langue: {a: -10}, brins: {a: 10}, algues: {a: 4}, paupiere: {y: 0}, machoire: {a: -7}, gorge: {sx: .9, sy: .8}}, e: 'ease-in-out'},
    /* il retombe de tout son poids */
    {t: t(td), p: {saut: {y: 12, x: X * .3, sy: .76, sx: 1.2}, cuisse: {a: 6}, jambe: {a: 4}, pied: {a: 0}, bras: {a: 12}, avbras: {a: 10}, main: {a: 4}, brasF: {a: 8}, mainF: {a: 6}, langue: {a: -26}, brins: {a: 28}, algues: {a: 10}, couronne: {a: -4}, machoire: {a: 2}, paupiere: {y: 32}, gorge: {sx: 1.35, sy: .8}, oeil: {s: 1}}, e: 'cubic-bezier(.6,0,.95,.6)'},
    {t: t(td + 260), p: {saut: {y: -14, x: 0, sy: 1.06, sx: .96}, langue: {a: 16}, brins: {a: -10}, algues: {a: -4}, couronne: {a: 2}, paupiere: {y: 0}, gorge: {sx: 1, sy: 1}, bras: {a: 0}, avbras: {a: 0}, main: {a: 0}, brasF: {a: 0}, mainF: {a: 0}, cuisse: {a: 0}, jambe: {a: 0}}, e: 'cubic-bezier(.3,.6,.4,1)'},
    {t: t(td + 520), p: {saut: {y: 0, sy: .97, sx: 1.02}, langue: {a: -6}, brins: {a: 5}, algues: {a: 0}, couronne: {a: 0}}, e: 'cubic-bezier(.5,0,.5,1)'},
    /* content de lui : la gorge gonflée */
    {t: t(td + 900), p: {saut: {y: 0, sy: 1, sx: 1}, langue: {a: 0}, brins: {a: 0}, gorge: {sx: 1.4, sy: 1.8}, pupille: {sx: 1, x: -3}}, e: 'ease-out'},
    {t: 1, p: (function(){ var p = {gorge: {sx: 1, sy: 1}, pupille: {x: 0}, machoire: {a: 0}}; for(var q in pt0) p[q] = pt0[q]; return p; })(), e: 'ease-in-out'}
  ], T);
  var c0 = this._ou('pieds');
  /* l'envol : l'eau gicle, la ligne d'eau s'efface */
  setTimeout(function(){
    if(!berge && !gele){ self._gerbe(c0[0] - 60, 372, gros ? 1.3 : 1, {n: 8}); self._fondu(self.S.ligne, 0, 200); }
    else if(gele) self._etincelles([c0[0] - 60, 368], 10, ['#ffffff', '#cfeaff']);
    /* l'eau qui ruisselle de son ventre pendant qu'il monte */
    for(var k = 0; k < 5; k++) (function(q){ setTimeout(function(){ var p = self._ou('pieds'); self._goutte([p[0] + hasard(-200, 160), p[1] - hasard(0, 30)], {coul: '#cdeeff'}); }, q * 60); })(k);
  }, ta);
  /* le contact : BOUM, la gerbe, l'onde de choc vers les héros */
  var impactP = new Promise(function(ok){
    setTimeout(function(){
      var p = self._ou('pieds'), xC = p[0] - 40;
      if(berge){ self._eclabousse([xC, p[1]], '#8a9a6a', 3); self._gerbe(xC, p[1], gros ? 1.1 : .8, {coul: '#5a5a3a', clair: '#a8a878', n: 10, sansRides: true}); }
      else if(gele){ self._glaceFele(); self._etincelles([xC, 370], 22, ['#ffffff', '#cfeaff', '#9ad0f0'], 1.8); }
      else { self._gerbe(xC, 374, gros ? 2.4 : 2, {n: 10, large: 2}); self._gerbe(xC - 140, 380, gros ? 1.2 : .9, {n: 4, sansRides: true}); self._gerbe(xC + 160, 376, gros ? 1.2 : .9, {n: 4, sansRides: true}); }
      self._fondu(self.S.ligne, berge ? 0 : 1, 400, 300);
      self._ondeChoc(o, gros);
      if(o.onImpact) try{ o.onImpact(); }catch(er){}
      ok();
    }, td);
  });
  var pr = Promise.all([corpsSeq.fini, impactP]).then(function(){ return self._finAction(j, 300); });
  pr.impact = impactP;
  return pr;
};
/* l'onde de choc : un anneau qui court sur le sol jusqu'aux héros, une vague d'eau noire */
R._ondeChoc = function(o, gros){
  var self = this, cq = this._calque(o && o.scene), u = cq.u(), p = cq.ancre('pieds'), k = gros ? 1.5 : 1;
  var cible = o && o.vers ? cq.pt(o.vers) : [p[0] - 520 * u, p[1]];
  var sol = p[1] - 6 * u, dist = p[0] - Math.min(cible[0], p[0] - 200 * u) + 120 * u;
  [0, gros ? 220 : -1].forEach(function(dl, n){
    if(dl < 0) return;
    var r = cq.g('<ellipse cx="0" cy="0" rx="40" ry="8" fill="none" stroke="#ffffff" stroke-width="5" opacity=".9"/><ellipse cx="0" cy="0" rx="40" ry="8" fill="none" stroke="' + LUNE + '" stroke-width="10" opacity=".35"/>');
    r.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(sol) + 'px) scale(.4)', opacity: 1}, {transform: 'translate(' + f1(p[0] - dist * .3) + 'px,' + f1(sol) + 'px) scale(' + f1(dist / 40 * .75) + ',' + f1(3 * k) + ')', opacity: 0}], {duration: 900, delay: dl, easing: 'cubic-bezier(.1,.7,.3,1)', fill: 'both'}).finished.then(function(){ r.remove(); });
  });
  /* la vague qui file vers la gauche */
  var vd = 'M-50 0 C -46 -14 -34 -30 -14 -36 C 0 -40 14 -34 18 -24 C 8 -28 0 -24 -2 -16 C 10 -12 28 -6 50 0 Z';
  var vg = cq.g('<g transform="scale(' + f1(u * 1.6 * k) + ')">' + Pw(vd, '#24464f', 2.4) + L('M-44 -6 C -38 -22 -22 -34 -6 -36 C 6 -36 14 -30 18 -24', '#cfe6ee', 2.4, ' opacity=".8"') + '</g>');
  vg.animate([{transform: 'translate(' + f1(p[0] - 80 * u) + 'px,' + f1(sol) + 'px) scale(.3)', opacity: 0}, {offset: .15, opacity: 1, transform: 'translate(' + f1(p[0] - 160 * u) + 'px,' + f1(sol) + 'px) scale(1)'}, {offset: .8, opacity: 1}, {transform: 'translate(' + f1(cible[0] - 40 * u) + 'px,' + f1(sol) + 'px) scale(1.15,.6)', opacity: 0}], {duration: 900, easing: 'cubic-bezier(.3,.5,.5,1)', fill: 'both'}).finished.then(function(){ vg.remove(); });
  for(var i = 0; i < 7; i++){
    var x = p[0] - hasard(60, dist) , gt = cq.g('<circle r="' + f1(hasard(2.5, 5) * u) + '" fill="#2a4c58" stroke="' + O + '" stroke-width="' + f1(u) + '"/>');
    gt.animate([{transform: 'translate(' + f1(x) + 'px,' + f1(sol) + 'px)', opacity: 0}, {offset: .1, opacity: 1}, {offset: .5, transform: 'translate(' + f1(x - 20 * u) + 'px,' + f1(sol - hasard(30, 70) * u * k) + 'px)'}, {transform: 'translate(' + f1(x - 40 * u) + 'px,' + f1(sol + 6 * u) + 'px)', opacity: 0}], {duration: 700, delay: (p[0] - x) / dist * 600, easing: 'ease-out', fill: 'both'});
  }
  setTimeout(function(){ cq.retirer(); }, 1800);
};
/* la glace se fêle sous son poids */
R._glaceFele = function(){
  var c = this._ou('pieds'), d = '';
  for(var i = 0; i < 7; i++){ var a = Math.PI * (.9 + i * .2 / 7 * 6) , x = c[0] - 40, y = 378, s = 'M' + f1(x) + ' ' + f1(y); for(var k = 0; k < 4; k++){ x += Math.cos(a) * hasard(18, 34); y += Math.sin(a) * hasard(3, 8) * (i % 2 ? 1 : -1); a += hasard(-.4, .4); s += ' L ' + f1(x) + ' ' + f1(y); } d += s + ' '; }
  var g = this._fxEl(L(d, '#4a7a98', 2.4) + L(d, '#ffffff', 1, ' transform="translate(0 -1)"'), this.S.ondes);
  g.setAttribute('data-fele', '1');
  g.animate([{opacity: 0}, {opacity: 1}], {duration: 120});
};

/* ---------------- les réactions aux coups ---------------- */
R.touche = function(type, o){
  var self = this, j = this._debutAction(), fin;
  type = type || 'fleche';
  switch(type){
    case 'rebond': fin = this._rebond(o); break;
    case 'fleche': case 'fleche-argent': case 'fleche-lourde': case 'dague': fin = this._blesse(type); break;
    case 'feu': fin = this._toucheFeu(); break;
    case 'lumiere': fin = this._toucheLumiere(); break;
    case 'louche': fin = this._toucheLouche(); break;
    case 'colle': fin = this._toucheColle(); break;
    case 'huile': fin = this._toucheHuile(); break;
    case 'nuage': fin = this._quintes(); break;
    case 'givre': fin = this._toucheGivre(); break;
    case 'acide': fin = this._toucheAcide(); break;
    case 'bruit': fin = this._toucheBruit(); break;
    case 'bouclier': fin = this._toucheBouclier(); break;
    default: fin = this._blesse('fleche');
  }
  return fin.then(function(){ return self._finAction(j, 260); });
};
/* le point d'impact sur lui (le flanc, le dos, ou le ventre s'il est ouvert) */
R._pointCoup = function(){
  if(this.etat.ouvert || this.etat.dos) return this._ou('pointfaible');
  var c = this._ou('centre');
  return [c[0] + hasard(-90, 40), c[1] + hasard(-70, 10)];
};
/* IMMUNISÉ : la flèche rebondit sur sa peau gluante (boing), et il nargue */
R._rebond = function(o){
  var self = this, p = this._pointCoup(), A = {ajout: true};
  this._eclat(p, .8);
  this._etincelles(p, 12);
  this._giclee(p, 6);
  /* le ressort « boing » */
  var zz = 'M0 0 l 8 -6 l 8 12 l 8 -12 l 8 12 l 8 -12 l 8 6';
  var bo = this._fxEl('<g>' + L(zz, O, 6) + L(zz, '#ffffff', 3) + '</g><g transform="rotate(-50)">' + L(zz, O, 6) + L(zz, '#ffffff', 3) + '</g>');
  bo.animate([{transform: 'translate(' + f1(p[0] - 52) + 'px,' + f1(p[1] - 8) + 'px) scale(.4,.4)', opacity: 0}, {offset: .2, opacity: 1, transform: 'translate(' + f1(p[0] - 56) + 'px,' + f1(p[1] - 10) + 'px) scale(1.1,1.4)'}, {offset: .45, transform: 'translate(' + f1(p[0] - 56) + 'px,' + f1(p[1] - 10) + 'px) scale(.9,.7)'}, {transform: 'translate(' + f1(p[0] - 60) + 'px,' + f1(p[1] - 12) + 'px) scale(1.2,1)', opacity: 0}], {duration: 700, easing: 'ease-out', fill: 'forwards'}).finished.then(function(){ bo.remove(); });
  /* le projectile repart en tournoyant */
  var proj = (o && o.objet) || 'fleche', art;
  if(proj === 'louche') art = Pw('M-18 -2 L 10 -2 L 10 2 L -18 2 Z', '#c8c0b0', 1.6) + Pw('M10 -8 C 22 -8 24 8 10 8 C 14 4 14 -4 10 -8 Z', '#d8d0c0', 1.6);
  else art = L('M-22 0 L 18 0', '#8a5a2a', 3.4) + Pw('M18 -5 L 28 0 L 18 5 Z', '#c8d0e0', 1.4) + Pw('M-22 0 L -30 -6 L -26 0 L -30 6 Z', '#e8e0d0', 1.2);
  var fl = this._fxEl('<g>' + art + '</g>');
  fl.firstChild.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) rotate(0deg)'}, {offset: .45, transform: 'translate(' + f1(p[0] - 90) + 'px,' + f1(p[1] - 130) + 'px) rotate(-400deg)'}, {transform: 'translate(' + f1(p[0] - 160) + 'px,' + f1(p[1] + 60) + 'px) rotate(-900deg)', opacity: 0}], {duration: 1100, easing: 'cubic-bezier(.2,.6,.6,1)', fill: 'forwards'}).finished.then(function(){ fl.remove(); });
  /* la peau gluante tremble comme une gelée */
  this._seq([{t: 0, p: {corps: {sx: 1, sy: 1}, secousse: {x: 0}}}, {t: .08, p: {corps: {sx: .94, sy: 1.06}, secousse: {x: 7}}, e: 'cubic-bezier(.1,.9,.3,1)'}, {t: .18, p: {corps: {sx: 1.05, sy: .95}, secousse: {x: -3}}}, {t: .28, p: {corps: {sx: .97, sy: 1.03}, secousse: {x: 2}}}, {t: .38, p: {corps: {sx: 1.02, sy: .985}, secousse: {x: 0}}}, {t: .48, p: {corps: {sx: 1, sy: 1}}}], 2200, A);
  /* il nargue : il gonfle la gorge, tire la langue en la secouant, se tapote le ventre */
  var nar = [{t: 0, p: {langue: {a: 0, sy: 1}, machoire: {a: 0}, gorge: {sx: 1, sy: 1}, pupille: {x: 0, sx: 1}, bras: {a: 0}, avbras: {a: 0}, main: {a: 0}}}];
  nar.push({t: .3, p: {gorge: {sx: 1.4, sy: 1.8}, pupille: {x: -4, sx: .7}, machoire: {a: -5}, langue: {sy: 1.25}}, e: 'ease-out'});
  [.38, .44, .5, .56, .62].forEach(function(tt, i){ nar.push({t: tt, p: {langue: {a: i % 2 ? 16 : -16, sy: 1.25}}}); });
  nar.push({t: .66, p: {langue: {a: 0, sy: 1.1}, bras: {a: 14}, avbras: {a: 22}, main: {a: 14}}, e: 'ease-out'});
  nar.push({t: .72, p: {bras: {a: 10}, avbras: {a: 12}, main: {a: 6}}, e: 'ease-in'});
  nar.push({t: .78, p: {bras: {a: 14}, avbras: {a: 22}, main: {a: 14}}});
  nar.push({t: .84, p: {bras: {a: 10}, avbras: {a: 12}, main: {a: 6}, gorge: {sx: 1, sy: 1}}, e: 'ease-in'});
  nar.push({t: 1, p: {langue: {a: 0, sy: 1}, machoire: {a: 0}, gorge: {sx: 1, sy: 1}, pupille: {x: 0, sx: 1}, bras: {a: 0}, avbras: {a: 0}, main: {a: 0}}});
  this._seq(nar, 2200, A);
  setTimeout(function(){ var q = self._ou('bouche'); self._giclee([q[0] - 10, q[1] + 6], 5, '#e8f4ff'); }, 900);
  setTimeout(function(){ var q = self._ou('bouche'); self._giclee([q[0] - 10, q[1] + 6], 4, '#e8f4ff'); }, 1200);
  return attendreMs(2200);
};
/* blessé (le point faible est ouvert) : chaque arme a son éclat */
R._blesse = function(type){
  var self = this, p = this._pointCoup(), A = {ajout: true}, lourd = type === 'fleche-lourde', T = lourd ? 1400 : 1100, k = lourd ? 1.5 : 1;
  this._flash('flash', lourd ? .85 : .7);
  if(type === 'fleche-argent'){ this._eclat(p, 1, '#e8f4ff'); this._etincelles(p, 10, ['#ffffff', '#cfe8ff', '#bfe8ff']); var sc = ''; for(var i = 0; i < 6; i++){ var a = i / 6 * Math.PI * 2; sc += '<g transform="translate(' + f1(Math.cos(a) * 34) + ' ' + f1(Math.sin(a) * 34) + ')"><path d="' + eclatD(9) + '" fill="#ffffff"/></g>'; } var g = this._fxEl(sc); g.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(.3) rotate(0deg)', opacity: 1}, {offset: .4, transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(1.1) rotate(30deg)', opacity: 1}, {transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(1.4) rotate(60deg)', opacity: 0}], {duration: 900, fill: 'forwards'}).finished.then(function(){ g.remove(); }); }
  else if(type === 'dague'){ var x = L('M-30 -26 L 30 26 M30 -26 L -30 26', O, 8) + L('M-30 -26 L 30 26 M30 -26 L -30 26', '#ffffff', 4); var dg = this._fxEl(x); dg.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(.2)', opacity: 1}, {offset: .3, transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(1)', opacity: 1}, {transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(1.1)', opacity: 0}], {duration: 520, fill: 'forwards'}).finished.then(function(){ dg.remove(); }); this._etincelles(p, 6); }
  else { this._eclat(p, k); this._etincelles(p, lourd ? 7 : 5, null, k); if(lourd){ this._giclee(p, 3); } }
  this._giclee(p, 2);
  this._cri(this._ou('bouche'), lourd ? 1.3 : 1.05);
  var dos = this.etat.dos;
  var pt0 = {}, ptH = {};
  for(var i2 = 0; i2 < 5; i2++){ pt0['pointe' + i2] = {sy: 1}; ptH['pointe' + i2] = {sy: .8}; }
  var choc = {secousse: {x: 18 * k, y: -5, a: 4 * k}, saut: {sx: .94, sy: 1.06}, paupiere: {y: 46}, paupF: {y: 15}, paupB: {y: -6}, machoire: {a: -16}, langue: {a: 22}, gorge: {sx: .8, sy: .7}, cuisse: {a: dos ? 24 : -10}, jambe: {a: dos ? -30 : 0}, bras: {a: dos ? 30 : -10}, oeil: {s: 1}};
  for(var q in ptH) choc[q] = ptH[q];
  var rep = {secousse: {x: 0, y: 0, a: 0}, saut: {sx: 1, sy: 1}, paupiere: {y: 0}, paupF: {y: 0}, paupB: {y: 0}, machoire: {a: 0}, langue: {a: 0}, gorge: {sx: 1, sy: 1}, cuisse: {a: 0}, jambe: {a: 0}, bras: {a: 0}};
  for(var q2 in pt0) rep[q2] = pt0[q2];
  this._seq([{t: 0, p: rep}, {t: .1, p: choc, e: 'cubic-bezier(.1,.9,.3,1)'}, {t: .35, p: {secousse: {x: 8 * k, a: -2}, saut: {sx: 1.04, sy: .96}, machoire: {a: -8}, langue: {a: -12}}, e: 'ease-in-out'}, {t: .55, p: {secousse: {x: 3, a: 1}, paupiere: {y: 20}, langue: {a: 6}}}, {t: 1, p: rep, e: 'cubic-bezier(.4,0,.3,1.2)'}], T, A);
  if(this._mode() === 'eau') this._rides(p[0], 1, 1);
  return attendreMs(T);
};
/* le feu : des flammes jaillissent sur son dos, sa bave s'évapore (pschhh), il sursaute */
R._toucheFeu = function(){
  var self = this, A = {ajout: true}, T = 1700;
  this._flash('flashO', .6, 420);
  this._flammesBreves(1100);
  for(var i = 0; i < 14; i++) (function(k){ setTimeout(function(){ var p = self._ou('dos'); self._bouffee([p[0] + hasard(-200, 120), p[1] + hasard(-10, 70)], {r: hasard(10, 16), coul: '#f2f0f6', op: .8, dx: hasard(-20, 30), dy: hasard(-110, -70), duree: hasard(1100, 1500), s1: 2.6, liser: true}); }, 200 + k * 70); })(i);
  this._seq([{t: 0, p: {saut: {y: 0, sy: 1}, paupiere: {y: 0}, machoire: {a: 0}, langue: {a: 0, sy: 1}, secousse: {x: 0}}}, {t: .12, p: {saut: {y: 4, sy: .94}}},
    {t: .3, p: {saut: {y: -40, sy: 1.08}, paupiere: {y: 46}, machoire: {a: -18}, langue: {a: 24, sy: 1.2}, secousse: {x: 6}}, e: 'cubic-bezier(.2,.8,.4,1)'},
    {t: .5, p: {saut: {y: 0, sy: .94}, langue: {a: -14}}, e: 'cubic-bezier(.6,0,.9,.5)'},
    {t: .58, p: {langue: {a: 10}, machoire: {a: -12}}}, {t: .66, p: {langue: {a: -10}}}, {t: .74, p: {langue: {a: 8}}},
    {t: 1, p: {saut: {y: 0, sy: 1}, paupiere: {y: 0}, machoire: {a: 0}, langue: {a: 0, sy: 1}, secousse: {x: 0}}}], T, A);
  this._cri(this._ou('bouche'), 1.1);
  if(this._mode() === 'eau') setTimeout(function(){ self._gerbe(self._ou('pieds')[0] - 40, 374, .8, {n: 8}); }, T * .5);
  return attendreMs(T);
};
/* des flammes qui jaillissent puis s'éteignent (la variante « feu », montrée un moment) */
R._flammesBreves = function(ms){
  var self = this;
  if(this.etat.brule) return;
  this._allumerFeu(true);
  setTimeout(function(){ if(!self.etat.brule) self._allumerFeu(false); }, ms);
};
R._allumerFeu = function(on){
  this._couperX('fl');
  if(on){
    this._fondu('feu', 1, 250);
    for(var k = 0; k < 10; k++) this._boucleX('fl' + k, [{transform: 'scale(1,1) skewX(0deg)'}, {offset: .35, transform: 'scale(.88,1.18) skewX(-7deg)'}, {offset: .7, transform: 'scale(1.06,.9) skewX(5deg)'}, {transform: 'scale(.94,1.12) skewX(-3deg)'}], 300 + (k * 70 % 220), {dir: 'alternate', e: 'ease-in-out', delai: -k * 90});
  } else this._fondu('feu', 0, 400);
};
/* la lumière : ce qui brille au fond de l'eau s'allume ; il cligne, gêné, la main sur l'œil */
R._toucheLumiere = function(){
  var self = this, A = {ajout: true}, T = 2000, c = this._ou('centre');
  var lu = this._fxEl(douce(this.D, 0, 0, 230, 46, '#fff4b0', .8) + douce(this.D, 0, 0, 90, 20, '#ffffff', .9), this.S.ondes);
  lu.animate([{transform: 'translate(' + f1(c[0] - 60) + 'px,390px) scale(.3)', opacity: 0}, {offset: .2, transform: 'translate(' + f1(c[0] - 60) + 'px,390px) scale(1)', opacity: 1}, {offset: .7, opacity: .9}, {transform: 'translate(' + f1(c[0] - 60) + 'px,390px) scale(1.2)', opacity: 0}], {duration: T, fill: 'forwards'}).finished.then(function(){ lu.remove(); });
  var rayons = '';
  for(var i = 0; i < 9; i++){ var a = -Math.PI * (.12 + i * .095); rayons += '<path d="M0 0 L ' + f1(Math.cos(a - .05) * 260) + ' ' + f1(Math.sin(a - .05) * 260) + ' L ' + f1(Math.cos(a + .05) * 260) + ' ' + f1(Math.sin(a + .05) * 260) + ' Z" fill="#fff6c0" opacity=".22"/>'; }
  var ry = this._fxEl(rayons, this.S.ondes);
  ry.animate([{transform: 'translate(' + f1(c[0] - 60) + 'px,388px) scale(.2)', opacity: 0}, {offset: .25, transform: 'translate(' + f1(c[0] - 60) + 'px,388px) scale(1)', opacity: 1}, {transform: 'translate(' + f1(c[0] - 60) + 'px,388px) scale(1.1) rotate(4deg)', opacity: 0}], {duration: T * .9, fill: 'forwards'}).finished.then(function(){ ry.remove(); });
  this._etoilesBreves(T);
  var mo = {}, m0 = {};
  for(var n in MAIN_OEIL){ mo[n] = MAIN_OEIL[n]; m0[n] = {a: 0, x: 0, y: 0}; }
  var dos = this.etat.dos || this.etat.ebloui;
  var k = [{t: 0, p: (function(){ var p = {paupiere: {y: 0}, paupB: {y: 0}, pupille: {sx: 1, sy: 1}, secousse: {a: 0, x: 0}, machoire: {a: 0}}; if(!dos) for(var q in m0) p[q] = m0[q]; return p; })()}];
  k.push({t: .1, p: {paupiere: {y: 40}, paupB: {y: -6}, pupille: {sx: .4, sy: .6}, secousse: {a: 2, x: 8}, machoire: {a: -6}}, e: 'cubic-bezier(.1,.9,.3,1)'});
  k.push({t: .2, p: {paupiere: {y: 10}}});
  k.push({t: .28, p: (function(){ var p = {paupiere: {y: 40}}; if(!dos) for(var q in mo) p[q] = mo[q]; return p; })(), e: 'cubic-bezier(.3,.7,.4,1)'});
  k.push({t: .4, p: {paupiere: {y: 18}, secousse: {a: -2, x: 2}}});
  k.push({t: .5, p: {paupiere: {y: 42}, secousse: {a: 2, x: 6}}});
  k.push({t: .62, p: {paupiere: {y: 20}, secousse: {a: -1.5, x: 0}}});
  k.push({t: .74, p: {paupiere: {y: 42}}});
  k.push({t: 1, p: (function(){ var p = {paupiere: {y: 0}, paupB: {y: 0}, pupille: {sx: 1, sy: 1}, secousse: {a: 0, x: 0}, machoire: {a: 0}}; if(!dos) for(var q in m0) p[q] = m0[q]; return p; })(), e: 'ease-in-out'});
  this._seq(k, T, A);
  return attendreMs(T);
};
/* des étoiles qui tournent un moment autour de sa tête */
R._etoilesBreves = function(ms){
  var self = this;
  if(this.etat.ebloui) return;
  this._etoiles(true);
  setTimeout(function(){ if(!self.etat.ebloui) self._etoiles(false); }, ms);
};
/* les six étoiles pré-dessinées tournent sur une ellipse au-dessus de la tête */
R._etoiles = function(on){
  this._couperX('et');
  if(!on){ this._fondu('etoiles', 0, 250); return; }
  this._fondu('etoiles', 1, 200);
  var c = [178, 106], rx = 96, ry = 24, m = 16;
  for(var k = 0; k < 6; k++){
    var frames = [];
    for(var s = 0; s <= m; s++){ var a = s / m * Math.PI * 2 + k * Math.PI / 3, x = c[0] + Math.cos(a) * rx, y = c[1] + Math.sin(a) * ry, devant = Math.sin(a); frames.push({transform: 'translate(' + f1(x) + 'px,' + f1(y) + 'px) rotate(' + f1(s / m * 360) + 'deg) scale(' + f1(.75 + devant * .3) + ')', opacity: f1(.55 + devant * .45)}); }
    this._boucleX('et' + k, frames, 1500);
  }
};
/* la louche : BONG sur la tête, la couronne s'écrase, l'œil tourne */
R._toucheLouche = function(){
  var self = this, A = {ajout: true}, T = 1500, p = this._ou('haut');
  this._eclat([p[0], p[1] + 10], 1.1);
  this._etincelles([p[0], p[1] + 10], 8);
  this._etoilesBreves(T);
  var pt = {}, pt0 = {};
  for(var i = 0; i < 5; i++){ pt['pointe' + i] = {sy: .7}; pt0['pointe' + i] = {sy: 1}; }
  var k1 = {couronne: {sy: .8, sx: 1.08}, saut: {sy: .92, sx: 1.05, y: 6}, paupiere: {y: 30}, machoire: {a: -8}, pupille: {x: -5}};
  for(var q in pt) k1[q] = pt[q];
  var k0 = {couronne: {sy: 1, sx: 1}, saut: {sy: 1, sx: 1, y: 0}, paupiere: {y: 0}, machoire: {a: 0}, pupille: {x: 0, y: 0}};
  for(var q2 in pt0) k0[q2] = pt0[q2];
  this._seq([{t: 0, p: k0}, {t: .1, p: k1, e: 'cubic-bezier(.1,.9,.3,1)'}, {t: .25, p: {couronne: {sy: 1.12, sx: .95}, saut: {sy: 1.04, sx: .98, y: -4}, paupiere: {y: 8}, pupille: {x: 5, y: 2}}},
    {t: .4, p: {couronne: {sy: .96, sx: 1.02}, saut: {sy: 1, sx: 1, y: 0}, pupille: {x: -5, y: 3}}}, {t: .55, p: {pupille: {x: 4, y: -2}}}, {t: .7, p: {pupille: {x: -3, y: 1}}}, {t: 1, p: k0}], T, A);
  return attendreMs(T);
};
/* la colle : des paquets gluants sur lui, il essaie de tirer sa main */
R._toucheColle = function(){
  var self = this, p = this._pointCoup();
  for(var i = 0; i < 3; i++){
    var q = [p[0] + hasard(-40, 40), p[1] + hasard(-20, 30)], s = this._fxEl('<path d="M-16 4 C -18 -8 -6 -14 2 -12 C 12 -14 18 -4 14 4 C 10 12 -10 12 -16 4 Z" fill="#d0e05a" fill-opacity=".92" stroke="#5a6420" stroke-width="1.6"/><path d="M-8 -6 Q 0 -10 8 -6" fill="none" stroke="#fbffd0" stroke-width="1.6"/>');
    s.animate([{transform: 'translate(' + f1(q[0]) + 'px,' + f1(q[1]) + 'px) scale(.2)', opacity: 1}, {offset: .15, transform: 'translate(' + f1(q[0]) + 'px,' + f1(q[1]) + 'px) scale(1.2)'}, {offset: .7, opacity: 1, transform: 'translate(' + f1(q[0]) + 'px,' + f1(q[1] + 10) + 'px) scale(1,1.2)'}, {transform: 'translate(' + f1(q[0]) + 'px,' + f1(q[1] + 30) + 'px) scale(.8,1.4)', opacity: 0}], {duration: 1600, delay: i * 80, fill: 'both'}).finished.then((function(g){ return function(){ g.remove(); }; })(s));
  }
  this._giclee(p, 6, '#d0e05a');
  this._tireColle();
  this._seq([{t: 0, p: {paupiere: {y: 0}, pupille: {sx: 1}}}, {t: .2, p: {paupiere: {y: 16}, pupille: {sx: .6}}}, {t: .8, p: {paupiere: {y: 16}}}, {t: 1, p: {paupiere: {y: 0}, pupille: {sx: 1}}}], 1500, {ajout: true});
  return attendreMs(1600);
};
/* l'huile : il glisse, bat des bras, manque de se retourner ; une tache irisée sur l'eau */
R._toucheHuile = function(){
  var self = this, A = {ajout: true}, T = 1800, c = this._ou('pieds');
  var gid = this.fx.gHuile || (this.fx.gHuile = this.D.id());
  if(!this.svg.getElementById(gid)) this._def('<linearGradient id="' + gid + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1a1428" stop-opacity="0"/><stop offset=".2" stop-color="#3a2a5a"/><stop offset=".4" stop-color="#2a6a7a"/><stop offset=".55" stop-color="#6a7a2a"/><stop offset=".75" stop-color="#7a3a6a"/><stop offset="1" stop-color="#1a1428" stop-opacity="0"/></linearGradient>');
  var sl = this._fxEl('<ellipse cx="0" cy="0" rx="230" ry="16" fill="url(#' + gid + ')" opacity=".85"/>' + L('M-160 -4 C -80 -10 60 -10 160 -4', '#c8e0ff', 1.6, ' opacity=".5"') + L('M-60 4 C 0 1 60 1 110 4', '#ffe0a0', 1.2, ' opacity=".45"'), this.S.ondes);
  sl.animate([{transform: 'translate(' + f1(c[0] - 40) + 'px,' + f1(this._niveau(c[0]) + 6) + 'px) scale(.2,.5)', opacity: 0}, {offset: .15, transform: 'translate(' + f1(c[0] - 40) + 'px,' + f1(this._niveau(c[0]) + 6) + 'px) scale(1)', opacity: 1}, {offset: .8, opacity: 1}, {transform: 'translate(' + f1(c[0] - 40) + 'px,' + f1(this._niveau(c[0]) + 6) + 'px) scale(1.15)', opacity: 0}], {duration: 3200, fill: 'forwards'}).finished.then(function(){ sl.remove(); });
  var k = [{t: 0, p: {pos: {x: 0}, secousse: {a: 0, x: 0}, bras: {a: 0}, avbras: {a: 0}, brasF: {a: 0}, mainF: {a: 0}, oeil: {s: 1}, machoire: {a: 0}, cuisse: {a: 0}}}];
  for(var i = 1; i <= 8; i++) k.push({t: i / 10, p: {pos: {x: i % 2 ? -16 : 12}, secousse: {a: i % 2 ? -9 : 8, x: i % 2 ? -6 : 6}, bras: {a: i % 2 ? -40 : 20}, avbras: {a: i % 2 ? 30 : -20}, brasF: {a: i % 2 ? 30 : -24}, mainF: {a: i % 2 ? -20 : 20}, oeil: {s: 1.18}, machoire: {a: -14}, cuisse: {a: i % 2 ? -14 : 10}}, e: 'ease-in-out'});
  k.push({t: 1, p: {pos: {x: 0}, secousse: {a: 0, x: 0}, bras: {a: 0}, avbras: {a: 0}, brasF: {a: 0}, mainF: {a: 0}, oeil: {s: 1}, machoire: {a: 0}, cuisse: {a: 0}}, e: 'cubic-bezier(.4,0,.3,1.3)'});
  this._seq(k, T, A);
  if(this._mode() === 'eau') [300, 700, 1100].forEach(function(tt){ setTimeout(function(){ self._rides(c[0] + hasard(-160, 120), 1, 1.2); }, tt); });
  return attendreMs(T);
};
/* le givre : des éclats de glace, il grelotte, son souffle fume */
R._toucheGivre = function(){
  var self = this, p = this._pointCoup(), A = {ajout: true}, T = 1700;
  this._flash('flashG', .75, 600);
  this._etincelles(p, 16, ['#ffffff', '#cfeaff', '#9ad0f0'], 1.4);
  for(var i = 0; i < 7; i++){
    var a = Math.random() * Math.PI * 2, v = hasard(30, 70), e = this._fxEl('<path d="M0 -10 L 4 0 L 0 10 L -4 0 Z" fill="#e8f8ff" stroke="#4a7a98" stroke-width="1.4"/>');
    e.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) rotate(0deg) scale(.4)', opacity: 1}, {transform: 'translate(' + f1(p[0] + Math.cos(a) * v) + 'px,' + f1(p[1] + Math.sin(a) * v + 30) + 'px) rotate(' + f1(hasard(-300, 300)) + 'deg) scale(1)', opacity: 0}], {duration: 900, easing: 'ease-out', fill: 'forwards'}).finished.then((function(g){ return function(){ g.remove(); }; })(e));
  }
  var fr = [{t: 0, p: {secousse: {x: 0}, paupiere: {y: 0}, paupB: {y: 0}, machoire: {a: 0}, gorge: {sx: 1, sy: 1}}}];
  for(var k = 1; k < 20; k++) fr.push({t: .1 + k / 20 * .8, p: {secousse: {x: k % 2 ? 3 : -3}, paupiere: {y: 20}, paupB: {y: -6}, machoire: {a: k % 2 ? -3 : 0}, gorge: {sx: .9, sy: .85}}, e: 'linear'});
  fr.push({t: 1, p: {secousse: {x: 0}, paupiere: {y: 0}, paupB: {y: 0}, machoire: {a: 0}, gorge: {sx: 1, sy: 1}}});
  this._seq(fr, T, A);
  setTimeout(function(){ self._joue('buee'); }, 500);
  setTimeout(function(){ self._joue('buee'); }, 1100);
  return attendreMs(T);
};
/* l'acide : sa peau grésille, des bulles vertes, il se gratte */
R._toucheAcide = function(){
  var self = this, A = {ajout: true}, T = 1700;
  for(var i = 0; i < 16; i++) (function(k){
    setTimeout(function(){
      var c = self._ou('centre'), q = [c[0] + hasard(-160, 120), c[1] + hasard(-110, 40)], r = hasard(3, 7);
      var b = self._fxEl('<circle r="' + f1(r) + '" fill="#9aea4a" fill-opacity=".6" stroke="#3a6a1a" stroke-width="1.2"/><circle cx="' + f1(-r * .3) + '" cy="' + f1(-r * .3) + '" r="' + f1(r * .3) + '" fill="#f0ffd0"/>');
      b.animate([{transform: 'translate(' + f1(q[0]) + 'px,' + f1(q[1]) + 'px) scale(.2)', opacity: 1}, {offset: .7, transform: 'translate(' + f1(q[0]) + 'px,' + f1(q[1] - 6) + 'px) scale(1.1)', opacity: 1}, {transform: 'translate(' + f1(q[0]) + 'px,' + f1(q[1] - 8) + 'px) scale(1.5)', opacity: 0}], {duration: 600, fill: 'forwards'}).finished.then(function(){ b.remove(); });
      if(k % 3 === 0) self._bouffee([q[0], q[1] - 6], {r: 7, coul: '#b8e080', op: .5, dy: -40, duree: 900, s1: 2.2});
    }, k * 70);
  })(i);
  this._seq([{t: 0, p: {paupiere: {y: 0}, machoire: {a: 0}, secousse: {x: 0, a: 0}, bras: {a: 0}, avbras: {a: 0}, main: {a: 0}}}, {t: .12, p: {paupiere: {y: 36}, machoire: {a: -10}, secousse: {x: 8, a: 2}}, e: 'cubic-bezier(.1,.9,.3,1)'},
    {t: .3, p: {bras: {a: 18}, avbras: {a: 34}, main: {a: 20}, secousse: {x: 4, a: 1}}}, {t: .42, p: {avbras: {a: 22}, main: {a: 6}}}, {t: .54, p: {avbras: {a: 36}, main: {a: 22}}}, {t: .66, p: {avbras: {a: 22}, main: {a: 6}}}, {t: .78, p: {avbras: {a: 36}, main: {a: 22}, paupiere: {y: 20}}},
    {t: 1, p: {paupiere: {y: 0}, machoire: {a: 0}, secousse: {x: 0, a: 0}, bras: {a: 0}, avbras: {a: 0}, main: {a: 0}}}], T, A);
  return attendreMs(T);
};
/* le bruit : il sursaute, l'œil exorbité, les pointes dressées */
R._toucheBruit = function(){
  var self = this, A = {ajout: true}, T = 1500;
  var pt = {}, pt0 = {};
  for(var i = 0; i < 5; i++){ pt['pointe' + i] = {sy: 1.35}; pt0['pointe' + i] = {sy: 1}; }
  var k1 = {saut: {y: -46, sy: 1.08}, oeil: {s: 1.25}, pupille: {sx: .45, sy: .6}, machoire: {a: -14}, langue: {a: 20, sy: 1.2}, bras: {a: -20}, brasF: {a: -16}, gorge: {sx: .8, sy: .7}};
  for(var q in pt) k1[q] = pt[q];
  var k0 = {saut: {y: 0, sy: 1}, oeil: {s: 1}, pupille: {sx: 1, sy: 1, x: 0}, machoire: {a: 0}, langue: {a: 0, sy: 1}, bras: {a: 0}, brasF: {a: 0}, gorge: {sx: 1, sy: 1}};
  for(var q2 in pt0) k0[q2] = pt0[q2];
  this._seq([{t: 0, p: k0}, {t: .08, p: {saut: {y: 6, sy: .94}}}, {t: .25, p: k1, e: 'cubic-bezier(.15,.8,.3,1)'}, {t: .45, p: {saut: {y: 0, sy: .95}}, e: 'cubic-bezier(.6,0,.9,.5)'},
    {t: .6, p: {pupille: {x: -6, sx: .6, sy: .8}}}, {t: .75, p: {pupille: {x: 6}}}, {t: 1, p: k0}], T, A);
  var p = this._ou('haut');
  var ex = this._fxEl(L('M0 -28 L 0 4', O, 10) + L('M0 -28 L 0 4', '#ffe066', 5) + C(0, 18, 5, '#ffe066', ' stroke="' + O + '" stroke-width="2.4"'));
  ex.animate([{transform: 'translate(' + f1(p[0] - 40) + 'px,' + f1(p[1] - 20) + 'px) scale(.3)', opacity: 0}, {offset: .2, transform: 'translate(' + f1(p[0] - 40) + 'px,' + f1(p[1] - 40) + 'px) scale(1.2)', opacity: 1}, {offset: .8, opacity: 1}, {transform: 'translate(' + f1(p[0] - 40) + 'px,' + f1(p[1] - 44) + 'px) scale(1)', opacity: 0}], {duration: 1200, fill: 'forwards'}).finished.then(function(){ ex.remove(); });
  if(this._mode() === 'eau') setTimeout(function(){ self._gerbe(self._ou('pieds')[0] - 40, 374, .9, {n: 10}); }, T * .42);
  return attendreMs(T);
};
/* le bouclier de runes : il s'y cogne, ça crépite en bleu, il recule, sonné */
R._toucheBouclier = function(){
  var self = this, A = {ajout: true}, T = 1600, p = this._ou('bouche');
  var cercle = '<circle r="44" fill="none" stroke="#8ff3ff" stroke-width="4"/><circle r="34" fill="' + this.D.doux('#8ff3ff', .5) + '"/>';
  for(var i = 0; i < 6; i++){ var a = i / 6 * Math.PI * 2; cercle += '<path transform="translate(' + f1(Math.cos(a) * 44) + ' ' + f1(Math.sin(a) * 44) + ') rotate(' + f1(a * 180 / Math.PI) + ')" d="M-5 -6 L 5 -6 L 0 6 Z" fill="#e8ffff" stroke="#2a8aa8" stroke-width="1.2"/>'; }
  var g = this._fxEl(cercle);
  g.animate([{transform: 'translate(' + f1(p[0] - 30) + 'px,' + f1(p[1]) + 'px) scale(.4)', opacity: 0}, {offset: .15, transform: 'translate(' + f1(p[0] - 30) + 'px,' + f1(p[1]) + 'px) scale(1.1)', opacity: 1}, {transform: 'translate(' + f1(p[0] - 30) + 'px,' + f1(p[1]) + 'px) scale(1.4)', opacity: 0}], {duration: 700, fill: 'forwards'}).finished.then(function(){ g.remove(); });
  this._etincelles([p[0] - 20, p[1]], 16, ['#8ff3ff', '#e8ffff', '#bfe8ff'], 1.3);
  this._etoilesBreves(T);
  this._seq([{t: 0, p: {secousse: {x: 0, a: 0}, langue: {a: 0}, machoire: {a: 0}, paupiere: {y: 0}, pupille: {x: 0}}}, {t: .1, p: {secousse: {x: 26, a: 5}, machoire: {a: -10}, paupiere: {y: 36}, langue: {a: 20}}, e: 'cubic-bezier(.1,.9,.3,1)'},
    {t: .2, p: {langue: {a: -14}}}, {t: .28, p: {langue: {a: 12}}}, {t: .36, p: {langue: {a: -8}}}, {t: .5, p: {secousse: {x: 10, a: -3}, paupiere: {y: 10}, pupille: {x: 4}}}, {t: .62, p: {secousse: {x: 8, a: 3}, pupille: {x: -4}}}, {t: .74, p: {secousse: {x: 4, a: -2}, pupille: {x: 3}}},
    {t: 1, p: {secousse: {x: 0, a: 0}, langue: {a: 0}, machoire: {a: 0}, paupiere: {y: 0}, pupille: {x: 0}}}], T, A);
  return attendreMs(T);
};

/* ---------------- la toux : 3 quintes, clairement, lentement ---------------- */
R.tousser = function(){
  var self = this, j = this._debutAction();
  return this._quintes().then(function(){ return self._finAction(j, 260); });
};
R._quintes = function(){
  var self = this, T = 3000, A = {ajout: true}, k = [{t: 0, p: {}}];
  var zero = {gorge: {sx: 1, sy: 1}, machoire: {a: 0}, secousse: {x: 0, a: 0, y: 0}, saut: {sx: 1, sy: 1}, paupiere: {y: 0}, paupB: {y: 0}, langue: {a: 0, sy: 1}};
  k[0].p = zero;
  [[.06, 1], [.38, 1.1], [.7, 1.25]].forEach(function(q){
    var t = q[0], f = q[1];
    k.push({t: t + .06, p: {gorge: {sx: 1.25, sy: 1.5}, machoire: {a: 1}, secousse: {x: 4, a: 1}, paupiere: {y: 14}}, e: 'ease-out'});
    k.push({t: t + .1, p: {gorge: {sx: .8, sy: .7}, machoire: {a: -22 * f}, secousse: {x: -14 * f, a: -3 * f, y: 4}, saut: {sx: 1.04, sy: .94}, paupiere: {y: 44}, paupB: {y: -6}, langue: {a: -24, sy: 1.25}}, e: 'cubic-bezier(.1,.9,.3,1)'});
    k.push({t: t + .2, p: {gorge: {sx: 1, sy: 1}, machoire: {a: -4}, secousse: {x: 0, a: 0, y: 0}, saut: {sx: 1, sy: 1}, paupiere: {y: 20}, paupB: {y: -2}, langue: {a: 6, sy: 1}}, e: 'ease-in-out'});
  });
  k.push({t: 1, p: zero, e: 'ease-in-out'});
  [.06, .38, .7].forEach(function(t0, i){
    setTimeout(function(){
      var p = self._ou('bouche');
      for(var n = 0; n < 7; n++) self._bouffee([p[0] - 10, p[1] + hasard(-8, 8)], {r: hasard(10, 16) * (1 + i * .12), coul: choisir(['#d8e0c4', '#c8d4b0', '#e8eedc', '#b8c8a0']), op: .85, dx: hasard(-110, -50), dy: hasard(-40, 14), duree: hasard(900, 1300), delai: n * 35, s0: .4, s1: 2.4, liser: true});
      self._giclee([p[0] - 6, p[1] + 4], 3, '#e8f4ff');
      if(i !== 1) self._joue('larme');
    }, T * (t0 + .1));
  });
  this._seq(k, T, A);
  return attendreMs(T);
};

/* ---------------- les moments propres à Bourbe ---------------- */
R.special = function(nom, o){
  var self = this;
  o = o || {};
  switch(nom){
    case 'recrache': var j = this._debutAction(); return this._recracheSeq(o).then(function(){ return self._finAction(j, 300); });
    case 'chatouille': return this._chatouille(o);
    case 'plonger': return this._plonger();
    case 'remonter': return this._remonter();
    case 'mouche': var j2 = this._debutAction(); this._mouche(true); return attendreMs(3400).then(function(){ return self._finAction(j2, 300); });
    case 'rot': var j3 = this._debutAction(); this._rot(1.3); return attendreMs(1300).then(function(){ return self._finAction(j3, 300); });
  }
  return Promise.resolve();
};
/* il recrache le héros avalé (o.onImpact : le héros sort, au point ancre('bouche')) */
R._recracheSeq = function(o){
  var self = this, A = {ajout: true}, T = 2300;
  /* la bosse remonte vers la gorge, puis disparaît */
  this._seq([{t: 0, p: {bosse: {sx: 1, sy: 1}}}, {t: .2, p: {bosse: {x: 150, y: 300, sx: 1.2, sy: .9}}}, {t: .3, p: {bosse: {x: 120, y: 280, sx: .6, sy: .6}}}], T);
  setTimeout(function(){ self._bosseBoucle(false); }, T * .28);
  this.etat.avale = false;
  function t(ms){ return ms / T; }
  this._seq([
    {t: 0, p: {ventre: {sx: 1, sy: 1}, gorge: {sx: 1, sy: 1}, secousse: {x: 0, y: 0, a: 0}, oeil: {s: 1}, paupB: {y: 0}, machoire: {a: 0}, langue: {sy: 1}, saut: {y: 0, sy: 1}, paupiere: {y: 0}}},
    /* ça remonte : le ventre se serre, la gorge se bombe, deux haut-le-cœur */
    {t: t(260), p: {ventre: {sx: .95, sy: .9}, gorge: {sx: 1.2, sy: 1.4}, secousse: {y: 5, a: -2}, oeil: {s: 1.1}, langue: {sy: .2}}, e: 'ease-out'},
    {t: t(420), p: {ventre: {sx: 1.02, sy: 1.02}, gorge: {sx: 1.05, sy: 1.1}, secousse: {y: 0, a: 0}}},
    {t: t(620), p: {ventre: {sx: .93, sy: .88}, gorge: {sx: 1.6, sy: 2.3}, secousse: {y: 6, a: -3}, oeil: {s: 1.18}, paupB: {y: -6}}, e: 'ease-out'},
    /* PTOU ! */
    {t: t(760), p: {machoire: {a: -30}, secousse: {x: -26, y: -2, a: -4}, gorge: {sx: .8, sy: .7}, ventre: {sx: 1, sy: 1}, saut: {y: -6, sy: 1.04}, oeil: {s: 1.05}}, e: 'cubic-bezier(.1,.9,.3,1)'},
    {t: t(1050), p: {machoire: {a: -6}, secousse: {x: -4, y: 0, a: 0}, gorge: {sx: 1, sy: 1}, saut: {y: 0, sy: 1}, oeil: {s: 1}, paupiere: {y: 0}, bras: {a: 0}, avbras: {a: 0}, main: {a: 0}}, e: 'ease-out'},
    /* beurk : il s'essuie la bouche d'un revers de main, secoue la tête */
    {t: t(1300), p: {machoire: {a: 0}, paupiere: {y: 20}, paupB: {y: -6}, bras: {a: 40}, avbras: {a: 58}, main: {a: 24}}, e: 'ease-out'},
    {t: t(1500), p: {bras: {a: 28}, avbras: {a: 40}, main: {a: 8}, secousse: {a: 2}}, e: 'ease-in-out'},
    {t: t(1700), p: {bras: {a: 0}, avbras: {a: 0}, main: {a: 0}, secousse: {a: -2.5}}},
    {t: t(1850), p: {secousse: {a: 2}}}, {t: t(2000), p: {secousse: {a: -1}}},
    {t: 1, p: {ventre: {sx: 1, sy: 1}, gorge: {sx: 1, sy: 1}, secousse: {x: 0, y: 0, a: 0}, oeil: {s: 1}, paupB: {y: 0}, machoire: {a: 0}, langue: {sy: 1}, saut: {y: 0, sy: 1}, paupiere: {y: 0}, bras: {a: 0}, avbras: {a: 0}, main: {a: 0}}, e: 'ease-in-out'}
  ], T, A);
  /* le gros paquet de bave qui gicle */
  setTimeout(function(){
    var p = self._ou('bouche'), sol = self.etat.berge ? self._ou('pieds')[1] : 380, arr = [p[0] - 230, sol];
    var g = self._fxEl('<path d="M-18 -4 C -20 -16 -4 -22 8 -18 C 22 -16 26 -2 18 8 C 10 18 -14 16 -18 -4 Z" fill="#d8eecf" fill-opacity=".9" stroke="' + O + '" stroke-width="2"/><ellipse cx="-4" cy="-10" rx="7" ry="4" fill="#fff" opacity=".85"/>');
    g.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(.4)'}, {offset: .45, transform: 'translate(' + f1(p[0] - 130) + 'px,' + f1(p[1] - 70) + 'px) scale(1.2,1)'}, {transform: 'translate(' + f1(arr[0]) + 'px,' + f1(arr[1]) + 'px) scale(1.4,.9)'}], {duration: 520, easing: 'cubic-bezier(.3,.5,.7,1)', fill: 'forwards'}).finished.then(function(){
      g.remove();
      var s = self._fxEl('<ellipse cx="0" cy="0" rx="40" ry="8" fill="#d8eecf" fill-opacity=".85" stroke="' + O + '" stroke-width="1.6"/><ellipse cx="-8" cy="-2" rx="14" ry="3" fill="#fff" opacity=".7"/>');
      s.animate([{transform: 'translate(' + f1(arr[0]) + 'px,' + f1(arr[1]) + 'px) scale(.3,1)', opacity: 1}, {offset: .2, transform: 'translate(' + f1(arr[0]) + 'px,' + f1(arr[1]) + 'px) scale(1.1,1)', opacity: 1}, {offset: .7, opacity: .9}, {transform: 'translate(' + f1(arr[0]) + 'px,' + f1(arr[1]) + 'px) scale(1.3,.8)', opacity: 0}], {duration: 1800, fill: 'forwards'}).finished.then(function(){ s.remove(); });
      self._giclee(arr, 10, '#d8eecf');
      if(!self.etat.berge) self._rides(arr[0], 2, 1.2, arr[1]);
    });
    for(var i = 0; i < 8; i++){ var a = Math.PI + hasard(-.5, .4), v = hasard(40, 110), e = self._fxEl('<circle r="' + f1(hasard(2, 4.5)) + '" fill="#e8f4ff" stroke="' + O + '" stroke-width="1"/>'); e.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px)'}, {transform: 'translate(' + f1(p[0] + Math.cos(a) * v) + 'px,' + f1(p[1] + Math.sin(a) * v + 50) + 'px)', opacity: 0}], {duration: 600, easing: 'ease-out', fill: 'forwards'}).finished.then((function(q){ return function(){ q.remove(); }; })(e)); }
    if(o.onImpact) try{ o.onImpact(); }catch(er){}
  }, T * 760 / T);
  return attendreMs(T);
};
/* un héros avalé le chatouille de l'intérieur : il rit, hoquette, se tortille, recrache… et roule sur le dos */
R._chatouille = function(o){
  var self = this, j = this._debutAction(), A = {ajout: true}, T = 2800;
  /* la bosse s'agite dans tous les sens */
  this._bosseBoucle(true);
  var bz = [{t: 0, p: {bosse: {x: 200, y: 345, sx: 1, sy: 1}}}];
  for(var b = 1; b < 16; b++) bz.push({t: b / 16, p: {bosse: {x: 200 + hasard(-80, 70), y: 345 + hasard(-35, 30), sx: hasard(.85, 1.2), sy: hasard(.85, 1.2)}}});
  bz.push({t: 1, p: {bosse: {x: 200, y: 345, sx: 1, sy: 1}}});
  this._seq(bz, T);
  var k = [{t: 0, p: {saut: {y: 0}, secousse: {a: 0, x: 0}, machoire: {a: 0}, paupiere: {y: 0}, paupB: {y: 0}, langue: {a: 0}, bras: {a: 0}, avbras: {a: 0}, main: {a: 0}, cuisse: {a: 0}, gorge: {sx: 1, sy: 1}}}];
  k.push({t: .08, p: {paupiere: {y: 32}, paupB: {y: -8}, bras: {a: 18}, avbras: {a: 30}, main: {a: 18}}, e: 'ease-out'});
  for(var i = 0; i < 12; i++){
    var tt = .1 + i * .07, hic = (i === 5 || i === 9);
    k.push({t: tt, p: {saut: {y: hic ? -22 : -9}, secousse: {a: i % 2 ? 3.5 : -3.5, x: i % 2 ? 4 : -4}, machoire: {a: hic ? -4 : -15}, langue: {a: i % 2 ? 18 : -14}, avbras: {a: i % 2 ? 36 : 26}, cuisse: {a: i % 2 ? -8 : 6}, gorge: {sx: hic ? .8 : 1.15, sy: hic ? .7 : 1.25}}, e: 'ease-out'});
    k.push({t: tt + .035, p: {saut: {y: 0}, machoire: {a: -2}, gorge: {sx: 1, sy: 1}}, e: 'ease-in'});
  }
  k.push({t: 1, p: {saut: {y: 0}, secousse: {a: 0, x: 0}, machoire: {a: 0}, paupiere: {y: 0}, paupB: {y: 0}, langue: {a: 0}, bras: {a: 0}, avbras: {a: 0}, main: {a: 0}, cuisse: {a: 0}, gorge: {sx: 1, sy: 1}}});
  this._seq(k, T, A);
  /* des larmes de rire, des « hic », les traits de chatouille */
  [300, 900, 1500, 2100].forEach(function(ms){ setTimeout(function(){ var p = self._ou('oeilC'); for(var n = 0; n < 2; n++) self._goutte([p[0] + hasard(-20, 10), p[1] + 10], {coul: '#9ad8ff', dx: hasard(-60, 30), saute: hasard(20, 40), r: 3}); }, ms); });
  [.1 + 5 * .07, .1 + 9 * .07].forEach(function(tt){ setTimeout(function(){ var p = self._ou('bouche'); self._bouffee([p[0] - 4, p[1] - 4], {r: 7, coul: '#e8ffd0', op: .85, dx: -20, dy: -36, duree: 700, s1: 2, liser: true}); }, tt * T); });
  var zz = 'M0 0 l 6 -8 l 6 8 l 6 -8 l 6 8';
  [200, 700, 1200, 1700, 2200].forEach(function(ms, n){ setTimeout(function(){ var p = self._ou('pointfaible'), q = [p[0] + hasard(-90, 60), p[1] + hasard(-20, 40)], g = self._fxEl(L(zz, O, 5) + L(zz, '#fff6c0', 2.6)); g.animate([{transform: 'translate(' + f1(q[0]) + 'px,' + f1(q[1]) + 'px) rotate(' + (n % 2 ? 20 : -20) + 'deg) scale(.4)', opacity: 0}, {offset: .3, opacity: 1, transform: 'translate(' + f1(q[0]) + 'px,' + f1(q[1] - 6) + 'px) rotate(' + (n % 2 ? 20 : -20) + 'deg) scale(1)'}, {transform: 'translate(' + f1(q[0]) + 'px,' + f1(q[1] - 14) + 'px) rotate(' + (n % 2 ? 20 : -20) + 'deg) scale(1.1)', opacity: 0}], {duration: 500, fill: 'forwards'}).finished.then(function(){ g.remove(); }); }, ms); });
  [600, 1400, 2200].forEach(function(ms){ setTimeout(function(){ if(self._mode() === 'eau') self._rides(self._ou('centre')[0] + hasard(-150, 150), 1, 1.1); }, ms); });
  return attendreMs(T).then(function(){
    return self._recracheSeq(o);
  }).then(function(){
    if(j !== self.jeton) return;
    return self._retourner(true, j);
  }).then(function(){ return self._finAction(j, 200); });
};
/* il plonge : une grande inspiration, un bond, et il disparaît sous l'eau noire */
R._plonger = function(){
  var self = this, j = this._debutAction();
  if(this.etat.gele){
    /* l'eau est gelée : il essaie… et se cogne sur la glace */
    var T0 = 1500, A = {ajout: true};
    this._seq([{t: 0, p: {saut: {y: 0, sy: 1}, posture: {a: 0}, oeil: {s: 1}, paupiere: {y: 0}}}, {t: .25, p: {saut: {y: -40, sy: 1.08}, posture: {a: -6}}, e: 'cubic-bezier(.2,.8,.4,1)'}, {t: .42, p: {saut: {y: 8, sy: .8}, posture: {a: -2}, oeil: {s: 1.2}, paupiere: {y: 0}}, e: 'cubic-bezier(.6,0,.9,.5)'},
      {t: .6, p: {saut: {y: 0, sy: 1.04}, posture: {a: 0}, oeil: {s: 1.1}}}, {t: 1, p: {saut: {y: 0, sy: 1}, posture: {a: 0}, oeil: {s: 1}, paupiere: {y: 0}}}], T0, A);
    setTimeout(function(){ self._glaceFele(); self._etincelles([self._ou('pieds')[0] - 40, 370], 14, ['#ffffff', '#cfeaff']); self._etoilesBreves(1000, 3); }, T0 * .42);
    return attendreMs(T0).then(function(){ return self._finAction(j, 300); });
  }
  var depart = this.etat.berge ? attendreMs(0).then(function(){ return self._retourEau(); }) : Promise.resolve();
  return depart.then(function(){
    var T = 1900;
    function t(ms){ return ms / T; }
    var s = self._seq([
      {t: 0, p: {}},
      {t: t(300), p: {pupille: {x: -5}, secousse: {a: 1}}}, {t: t(480), p: {pupille: {x: 5}, secousse: {a: -1}}},
      {t: t(700), p: {gorge: {sx: 1.5, sy: 2}, saut: {y: 8, sy: .9, sx: 1.05}, paupB: {y: -4}, pupille: {x: 0}, secousse: {a: 0}}, e: 'ease-out'},
      {t: t(950), p: {saut: {y: -50, sy: 1.08, sx: .95}, posture: {a: -14}, gorge: {sx: 1.2, sy: 1.3}, langue: {sy: .1}, cuisse: {a: -20}, jambe: {a: -50}, bras: {a: -30}, paupiere: {y: 0}, paupF: {y: 0}}, e: 'cubic-bezier(.2,.8,.4,1)'},
      {t: t(1500), p: {pos: {y: 330, x: 30}, saut: {y: 0, sy: 1.04, sx: .98}, posture: {a: -22}, paupiere: {y: 46}, paupF: {y: 15}}, e: 'cubic-bezier(.6,0,.9,.6)'},
      {t: 1, p: {pos: {y: 340, x: 30}}}
    ], T);
    setTimeout(function(){ self._fondu(self.S.ligne, 0, 200); }, T * .5);
    setTimeout(function(){ var c = self._ou('pieds'); self._gerbe(c[0] - 60, 372, 1.7, {n: 18}); }, T * .62);
    setTimeout(function(){ self._fondu(self.plongeB, 0, 250); }, T * .62);
    setTimeout(function(){ self._fondu(self.plongeA, 0, 420); }, T * .68);
    setTimeout(function(){ self._bulles(320, 8, 1.3); self._rides(300, 3, 1.6); }, T * .85);
    return s.fini;
  }).then(function(){
    self.etat.sous = true;
    return self._finAction(j, 10);
  });
};
/* il remonte : les bulles, la lueur de l'œil, et il surgit */
R._remonter = function(){
  var self = this, j = this._debutAction(), T = 2600;
  this.etat.sous = false;
  this._fondu([this.plongeA, this.plongeB], 0, 0);
  function t(ms){ return ms / T; }
  this._bulles(300, 6, 1); setTimeout(function(){ self._bulles(260, 8, 1.4); self._oeilSous(); }, 300);
  var s = this._allerA({pos: {y: 300, x: 10}, paupiere: {y: 46}, paupF: {y: 15}, langue: {sy: .1}, algues: {a: 14}, brins: {a: 24}, bras: {a: 20}, avbras: {a: -20}}, 1, null, true).then(function(){
    setTimeout(function(){ self._fondu(self.plongeA, 1, 250); self._gerbe(300, 372, 2, {n: 20}); }, 820);
    setTimeout(function(){ self._fondu(self.plongeB, 1, 300); }, 1100);
    setTimeout(function(){ self._fondu(self.S.ligne, 1, 400); }, 1500);
    [1200, 1400, 1600, 1800].forEach(function(ms){ setTimeout(function(){ var p = self._ou('dos'); for(var k = 0; k < 3; k++) self._goutte([p[0] + hasard(-220, 150), p[1] + hasard(-20, 100)], {coul: '#cdeeff'}); }, ms); });
    var sec = [{t: 0, p: {}}, {t: t(800), p: {pos: {y: 260, x: 6}}, e: 'ease-in'},
      {t: t(1350), p: {pos: {y: -34, x: 0}, algues: {a: -8}, brins: {a: -16}, bras: {a: 0}, avbras: {a: 0}}, e: 'cubic-bezier(.15,.8,.35,1)'},
      {t: t(1750), p: {pos: {y: 0}, algues: {a: 4}, brins: {a: 8}}, e: 'cubic-bezier(.4,0,.3,1.3)'},
      {t: t(1950), p: {paupiere: {y: 0}, paupF: {y: 0}, secousse: {a: 2.4}, couronne: {a: -3}}},
      {t: t(2100), p: {secousse: {a: -2.4}, couronne: {a: 3}, algues: {a: -6}}}, {t: t(2250), p: {secousse: {a: 1.6}, couronne: {a: -2}, algues: {a: 4}}},
      {t: 1, p: {secousse: {a: 0}, couronne: {a: 0}, algues: {a: 0}, brins: {a: 0}, langue: {sy: 1}}}];
    return self._seq(sec, T).fini;
  });
  return s.then(function(){ self._rides(200, 2, 1.4); self._rides(420, 2, 1.4); return self._finAction(j, 300); });
};
/* de la berge vers l'eau (un plongeon court) */
R._retourEau = function(){
  var self = this, T = 1100;
  this.etat.berge = false;
  this._enleverFlaque();
  setTimeout(function(){ var c = self._ou('pieds'); self._gerbe(c[0] - 20, 374, 1.4, {n: 16}); self._fondu(self.S.ligne, 1, 300, 200); }, T * .6);
  return this._seq([{t: 0, p: {}}, {t: .3, p: {saut: {y: -40, sy: 1.06}, pos: {x: BERGE.x * .6, y: BERGE.y - 10}}, e: 'cubic-bezier(.2,.8,.4,1)'}, {t: .62, p: {saut: {y: 8, sy: .86, sx: 1.1}, pos: {x: 0, y: 0}}, e: 'cubic-bezier(.6,0,.9,.6)'}, {t: 1, p: {saut: {y: 0, sy: 1, sx: 1}}, e: 'cubic-bezier(.4,0,.3,1.3)'}], T).fini;
};
/* sur le dos, ou de nouveau à l'endroit */
R._retourner = function(on, j){
  var self = this, T;
  this.etat.dos = on;
  var dans = !this.etat.berge;
  if(on){
    T = 1600;
    var fin = POSES.dos, k = [{t: 0, p: {}}];
    /* il bascule en arrière, les pattes en l'air, et retombe à plat sur le dos */
    k.push({t: .25, p: {posture: {a: 40, y: -30}, saut: {y: -10}, cuisse: {a: -20}, bras: {a: -30}, brasF: {a: -20}, machoire: {a: -14}, oeil: {s: 1.15}, langue: {a: 30}}, e: 'cubic-bezier(.3,.6,.5,1)'});
    k.push({t: .55, p: {posture: {a: 150, y: -10}, saut: {y: -24}, cuisse: {a: -30}, jambe: {a: -50}, bras: {a: -40}, avbras: {a: 40}, brasF: {a: -30}}, e: 'cubic-bezier(.5,0,.6,1)'});
    var p3 = {};
    for(var n in fin) p3[n] = fin[n];
    p3.saut = {y: 0, sy: .86, sx: 1.1};
    p3.oeil = {s: 1};
    if(this.etat.berge){ p3.pos = {x: BERGE.x, y: BERGE.y + 6}; p3.posture = {a: 180, y: 52}; }
    k.push({t: .74, p: p3, e: 'cubic-bezier(.5,0,1,.8)'});
    k.push({t: 1, p: {saut: {y: 0, sy: 1, sx: 1}}, e: 'cubic-bezier(.3,.6,.4,1.4)'});
    setTimeout(function(){ var c = self._ou('centre'); if(dans){ self._gerbe(c[0], 372, 1.6, {n: 16}); } else { self._eclabousse([c[0] - 60, self._ou('pieds')[1]], '#cdeeff', 2.4); self._eclabousse([c[0] + 80, self._ou('pieds')[1]], '#cdeeff', 2); } }, T * .74);
    return this._seq(k, T).fini;
  }
  T = 1300;
  setTimeout(function(){ var c = self._ou('centre'); if(dans) self._gerbe(c[0], 372, 1.3, {n: 12}); }, T * .65);
  return this._seq([{t: 0, p: {}}, {t: .35, p: {posture: {a: 250, y: -50}, saut: {y: -16}, cuisse: {a: -10}, jambe: {a: -20}, bras: {a: -10}, machoire: {a: -10}}, e: 'cubic-bezier(.3,.6,.5,1)'},
    {t: .68, p: {posture: {a: 360, y: 0}, saut: {y: 0, sy: .88, sx: 1.08}, cuisse: {a: 0}, jambe: {a: 0}, pied: {a: 0}, bras: {a: 0}, avbras: {a: 0}, main: {a: 0}, brasF: {a: 0}, mainF: {a: 0}, machoire: {a: 0}, langue: {a: 0}, algues: {a: 0}, brins: {a: 0}, couronne: {a: 0}}, e: 'cubic-bezier(.5,0,.9,.6)'},
    {t: 1, p: {saut: {y: 0, sy: 1, sx: 1}}, e: 'cubic-bezier(.3,.6,.4,1.4)'}], T).fini.then(function(){
    /* posture à 360° = 0° : on remet l'angle à zéro sans que ça se voie */
    self.J.posture.forEach(function(e){ e.getAnimations().forEach(function(a){ a.cancel(); }); e.style.transform = tf(fusion(Z)); });
    self.v.posture = fusion(Z);
  });
};

/* ---------------- la mort sans critique : il se dégonfle, rote, coule ventre en l'air ---------------- */
R.mourir = function(){
  var self = this, j = this._debutAction(), T = 6200;
  if(this.etat.gonfle) this._fondu('tendu', 0, 1500);
  ['ebloui', 'brule', 'colle', 'ouvert', 'cible', 'enrage', 'gonfle'].forEach(function(n){ if(self.etat[n]) self._etatVisuel(n, false); self.etat[n] = false; });
  this._bosseBoucle(false);
  var dos = this.etat.dos, berge = this.etat.berge;
  if(this.etat.gele){ this._etatVisuel('gele', false); this.etat.gele = false; }
  function t(ms){ return ms / T; }
  this._flash('#ffffff', .6, 500);
  this._cri(this._ou('bouche'), 1.3);
  var pt = {};
  for(var i = 0; i < 5; i++) pt['pointe' + i] = {sy: .6};
  var deg = {corps: {sx: .88, sy: .8}, ventre: {sx: .92, sy: .9}, gorge: {sx: .7, sy: .6}, paupiere: {y: 24}, paupF: {y: 8}, langue: {a: 8, sy: 1.25}, machoire: {a: -6}, algues: {a: 12}, brins: {a: 20}, pupille: {sx: .6, sy: .6}};
  for(var q in pt) deg[q] = pt[q];
  var k = [{t: 0, p: {}},
    {t: t(300), p: {secousse: {x: 14, a: 3}, oeil: {s: 1.15}, machoire: {a: -18}, paupiere: {y: 0}}, e: 'cubic-bezier(.1,.9,.3,1)'},
    {t: t(700), p: {secousse: {x: 0, a: 0}, oeil: {s: 1}, machoire: {a: -10}}},
    /* il se dégonfle : pfffff */
    {t: t(2300), p: deg, e: 'cubic-bezier(.3,.1,.6,1)'},
    /* le dernier rot */
    {t: t(2600), p: {gorge: {sx: 1.3, sy: 1.6}, machoire: {a: 0}}},
    {t: t(2750), p: {machoire: {a: -16}, gorge: {sx: .7, sy: .6}, saut: {y: -6}}, e: 'cubic-bezier(.2,.9,.3,1)'},
    {t: t(3100), p: {machoire: {a: -4}, saut: {y: 0}, paupiere: {y: 46}, paupF: {y: 15}}}
  ];
  /* il roule ventre en l'air (s'il n'y est pas déjà), et revient dans l'eau */
  var dosP = {posture: {a: 180, y: 66}, cuisse: {a: -40}, jambe: {a: -60}, pied: {a: 20}, bras: {a: -50}, avbras: {a: 10}, main: {a: 0}, brasF: {a: -40}, mainF: {a: 0}, pos: {x: 0, y: 0}, langue: {a: 40, sy: 1.25}};
  if(!dos) k.push({t: t(3500), p: {posture: {a: 60, y: -20}, pos: {x: berge ? BERGE.x * .5 : 0, y: berge ? BERGE.y * .5 : 0}}, e: 'ease-in'});
  k.push({t: t(4200), p: dosP, e: 'cubic-bezier(.4,0,.6,1)'});
  /* il coule, lentement */
  k.push({t: t(4500), p: {pos: {x: 0, y: 30}}, e: 'ease-in-out'});
  k.push({t: 1, p: {pos: {x: 0, y: 220}}, e: 'cubic-bezier(.5,0,.8,.6)'});
  var s = this._seq(k, T);
  /* l'air qui fuit */
  for(var n = 0; n < 16; n++) (function(m){ setTimeout(function(){ var p = self._ou('bouche'); self._bouffee([p[0] - 4, p[1]], {r: hasard(4, 8), coul: '#d8e8c8', op: .6, dx: hasard(-60, -30), dy: hasard(-30, 0), duree: 700, s1: 2.2}); }, 700 + m * 100); })(n);
  setTimeout(function(){ self._rotFinal(); }, T * 2700 / T);
  setTimeout(function(){ if(berge) self._gerbe(self._ou('centre')[0], 372, 1.6, {n: 14}); self._enleverFlaque(); self.etat.berge = false; }, 3900);
  setTimeout(function(){ self._fondu(self.S.ligne, 0, 400); self._fondu(self.plongeB, 0, 800); }, 4300);
  setTimeout(function(){ self._fondu(self.plongeA, 0, 1500); }, 4700);
  [4300, 4700, 5100, 5500, 5900, 6300, 6800].forEach(function(ms, i){ setTimeout(function(){ self._bulles(300 + hasard(-80, 80), 3 + (i % 3), 1.2); }, ms); });
  setTimeout(function(){ self._rides(300, 3, 1.8); }, 4400);
  /* la dernière bulle, toute seule */
  setTimeout(function(){ self._bulles(300, 1, 2.2); }, 7600);
  return s.fini.then(function(){ return attendreMs(1800); }).then(function(){
    self._couperBoucles();
    self.mort = true;
    self.enAction = false;
    self.etat.sous = true;
  });
};
R._rotFinal = function(){
  var p = this._ou('bouche'), r = 22;
  var b = this._fxEl('<circle r="' + r + '" fill="#b8d890" fill-opacity=".3" stroke="#e8ffd0" stroke-width="2.4"/><circle cx="-7" cy="-7" r="6" fill="#fff" opacity=".9"/>');
  var self = this;
  b.animate([{transform: 'translate(' + f1(p[0]) + 'px,' + f1(p[1]) + 'px) scale(.1)'}, {offset: .75, transform: 'translate(' + f1(p[0] - 50) + 'px,' + f1(p[1] - 60) + 'px) scale(1.4)'}, {transform: 'translate(' + f1(p[0] - 56) + 'px,' + f1(p[1] - 68) + 'px) scale(1.8)', opacity: 0}], {duration: 1300, easing: 'ease-out', fill: 'forwards'}).finished.then(function(){
    b.remove();
    var ec = '';
    for(var i = 0; i < 10; i++){ var a = i / 10 * Math.PI * 2; ec += 'M' + f1(Math.cos(a) * 20) + ' ' + f1(Math.sin(a) * 20) + ' L ' + f1(Math.cos(a) * 36) + ' ' + f1(Math.sin(a) * 36) + ' '; }
    var s = self._fxEl(L(ec, '#e8ffd0', 3));
    s.animate([{transform: 'translate(' + f1(p[0] - 56) + 'px,' + f1(p[1] - 68) + 'px) scale(.6)', opacity: 1}, {transform: 'translate(' + f1(p[0] - 56) + 'px,' + f1(p[1] - 68) + 'px) scale(1.5)', opacity: 0}], {duration: 420, fill: 'forwards'}).finished.then(function(){ s.remove(); });
  });
};

/* ---------------- la mort par critique : l'explosion la plus énorme du jeu ---------------- */
R.exploser = function(scene){
  var self = this, j = this._debutAction(), boomOk, boomP = new Promise(function(ok){ boomOk = ok; });
  ['ebloui', 'brule', 'colle', 'cible', 'enrage'].forEach(function(n){ if(self.etat[n]) self._etatVisuel(n, false); self.etat[n] = false; });
  this._bosseBoucle(false);
  /* il enfle, tremble, la peau brille… */
  var k = [{t: 0, p: {}}];
  for(var i = 1; i <= 10; i++) k.push({t: i / 11, p: {corps: {sx: 1 + i * .022, sy: 1 + i * .028}, secousse: {x: i % 2 ? 5 : -5, a: i % 2 ? 1.6 : -1.6}, oeil: {s: 1 + i * .035}, gorge: {sx: 1 + i * .08, sy: 1 + i * .12}, machoire: {a: -i * 1.6}, paupiere: {y: 0}, ventre: {sx: 1 + i * .02, sy: 1 + i * .02}}, e: 'linear'});
  k.push({t: 1, p: {corps: {sx: 1.28, sy: 1.34}}, e: 'ease-in'});
  (this.V.flashO || []).forEach(function(e){ e.getAnimations().forEach(function(a){ a.cancel(); }); e.removeAttribute('visibility'); e.animate([{opacity: 0}, {opacity: .3, offset: .3}, {opacity: .1, offset: .5}, {opacity: .55, offset: .8}, {opacity: .9}], {duration: 640, fill: 'forwards'}); });
  var p = this._seq(k, 640).fini.then(function(){
    var cq = self._calque(scene), u = cq.u(), c = cq.ancre('centre'), W = cq.W, H = cq.H;
    cq.el.classList.add('ra-scene-fx');
    var cx = c[0], cy = c[1] + 10 * u;
    var sol = cq.ancre('pieds')[1];
    cq.defs('<radialGradient id="bbBoom' + NUM + 'g"><stop offset="0" stop-color="#fff8d0"/><stop offset=".4" stop-color="#ffd060" stop-opacity=".85"/><stop offset="1" stop-color="#ff8020" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="bbBoom' + NUM + 'b"><stop offset="0" stop-color="#0c0812"/><stop offset=".55" stop-color="#1a1222" stop-opacity=".95"/><stop offset="1" stop-color="#22182c" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="bbBoom' + NUM + 'c"><stop offset="0" stop-color="#6a5a80" stop-opacity=".7"/><stop offset="1" stop-color="#4a3e5a" stop-opacity="0"/></radialGradient>');
    var gB = 'url(#bbBoom' + NUM + 'g)', gN = 'url(#bbBoom' + NUM + 'b)', gC = 'url(#bbBoom' + NUM + 'c)';
    /* il disparaît d'un coup */
    self._fondu([self.plongeA, self.plongeB, self.S.ligne], 0, 0);
    (self.V.flashO || []).forEach(function(e){ e.getAnimations().forEach(function(a){ a.cancel(); }); });
    boomOk();
    /* le gros nuage de brume noire, qui reste puis se dissipe lentement */
    var brumes = [];
    for(var n = 0; n < 10; n++){
      var a = n / 10 * Math.PI * 2 + hasard(-.3, .3), d = .35 + Math.random() * .65, r = hasard(80, 125) * u, x = Math.cos(a) * d * 190 * u, y = Math.sin(a) * d * 90 * u - 20 * u;
      var g = cq.g('<circle r="' + f1(r) + '" fill="' + gN + '"/><circle cx="' + f1(-r * .25) + '" cy="' + f1(-r * .3) + '" r="' + f1(r * .6) + '" fill="' + gC + '"/>');
      var dx = x * 1.6 + hasard(-20, 20) * u, dy = y * 1.3 - hasard(30, 80) * u;
      brumes.push(g.animate([{transform: 'translate(' + f1(cx) + 'px,' + f1(cy) + 'px) scale(.1)', opacity: 0}, {offset: .05, opacity: 1, transform: 'translate(' + f1(cx + x) + 'px,' + f1(cy + y) + 'px) scale(1)'},
        {offset: .55, opacity: .92, transform: 'translate(' + f1(cx + dx) + 'px,' + f1(cy + dy) + 'px) scale(1.45)'}, {transform: 'translate(' + f1(cx + dx * 1.3 + hasard(-30, 30) * u) + 'px,' + f1(cy + dy * 1.2 - 50 * u) + 'px) scale(2)', opacity: 0}],
        {duration: hasard(4600, 5800), easing: 'cubic-bezier(.12,.75,.3,1)', fill: 'forwards'}));
    }
    /* la gerbe d'eau noire : une colonne, puis des gouttes partout */
    var vd = 'M-60 0 C -58 -20 -52 -40 -40 -62 C -36 -40 -30 -26 -22 -16 C -22 -44 -16 -70 -6 -92 C 0 -66 4 -42 8 -18 C 14 -40 22 -60 34 -74 C 36 -50 38 -30 42 -14 C 48 -30 54 -44 62 -52 C 62 -30 62 -12 60 0 Z';
    var col = cq.g('<g transform="scale(' + f1(u * 2.6) + ',' + f1(u * 2.2) + ')">' + Pw(vd, '#24464f', 1.6, ' fill-opacity=".92"') + L('M-40 -58 C -38 -40 -32 -26 -24 -16 M-6 -88 C -2 -60 2 -40 6 -20 M34 -70 C 34 -48 36 -30 40 -16', '#cfe6ee', 2, ' stroke-opacity=".8"') + '</g>');
    col.animate([{transform: 'translate(' + f1(cx) + 'px,' + f1(sol) + 'px) scale(.4,.05)', opacity: 1}, {offset: .3, transform: 'translate(' + f1(cx) + 'px,' + f1(sol) + 'px) scale(1.1,1.15)', opacity: 1}, {transform: 'translate(' + f1(cx) + 'px,' + f1(sol) + 'px) scale(1.6,.1)', opacity: 0}], {duration: 1500, easing: 'cubic-bezier(.2,.7,.5,1)', fill: 'forwards'}).finished.then(function(){ col.remove(); });
    for(var w = 0; w < 5; w++){
      var aw = -Math.PI * (.12 + w * .19), vw = hasard(180, 320) * u, rw = hasard(8, 13) * u, gw = cq.g('<circle r="' + f1(rw) + '" fill="#1e3a44" stroke="' + O + '" stroke-width="' + f1(1.4 * u) + '"/><circle cx="' + f1(-rw * .3) + '" cy="' + f1(-rw * .3) + '" r="' + f1(rw * .35) + '" fill="#cfe6ee"/>');
      gw.animate([{transform: 'translate(' + f1(cx) + 'px,' + f1(sol) + 'px)'}, {offset: .45, transform: 'translate(' + f1(cx + Math.cos(aw) * vw * .6) + 'px,' + f1(sol + Math.sin(aw) * vw) + 'px)', easing: 'ease-in'}, {transform: 'translate(' + f1(cx + Math.cos(aw) * vw * 1.1) + 'px,' + f1(sol + 10 * u) + 'px)', opacity: .3}], {duration: hasard(1100, 1700), easing: 'cubic-bezier(.2,.6,.5,1)', fill: 'forwards'}).finished.then((function(q){ return function(){ q.remove(); }; })(gw));
    }
    /* les éclats : des morceaux de peau verruqueuse, des pointes d'or, des brins d'algue */
    for(var e = 0; e < 6; e++){
      var ae = -Math.PI * (.1 + e * .16), ve = hasard(150, 280) * u, re = hasard(-600, 600), html;
      if(e < 3) html = '<path transform="scale(' + f1(u * .9) + ')" d="M-8 8 C -8 -6 -4 -18 0 -22 C 4 -18 8 -6 8 8 Z" fill="#e0a83a" stroke="' + O + '" stroke-width="2.2"/>';
      else if(e < 4) html = '<path transform="scale(' + f1(u) + ')" d="M0 0 C 6 10 -4 20 2 34" fill="none" stroke="#4a7a30" stroke-width="5" stroke-linecap="round"/>';
      else html = '<path transform="scale(' + f1(u * (1 + Math.random())) + ')" d="M-12 -6 C -4 -14 10 -12 14 -2 C 16 8 2 14 -8 10 C -14 6 -16 0 -12 -6 Z" fill="#66703a" stroke="' + O + '" stroke-width="2"/><circle transform="scale(' + f1(u) + ')" cx="2" cy="-2" r="3.6" fill="#8a9a5a"/>';
      var ec = cq.g('<g>' + html + '</g>');
      ec.animate([{transform: 'translate(' + f1(cx) + 'px,' + f1(cy) + 'px) rotate(0deg)', opacity: 1}, {offset: .45, transform: 'translate(' + f1(cx + Math.cos(ae) * ve) + 'px,' + f1(cy + Math.sin(ae) * ve) + 'px) rotate(' + f1(re * .5) + 'deg)', opacity: 1},
        {transform: 'translate(' + f1(cx + Math.cos(ae) * ve * 1.5) + 'px,' + f1(sol + 20 * u) + 'px) rotate(' + f1(re) + 'deg)', opacity: 0}], {duration: hasard(1400, 2000), easing: 'cubic-bezier(.2,.6,.6,1)', fill: 'forwards'}).finished.then((function(q){ return function(){ q.remove(); }; })(ec));
    }
    /* étincelles */
    for(var s = 0; s < 0; s++){
      var as = Math.random() * Math.PI * 2, vs = hasard(90, 220) * u, ls = hasard(8, 16) * u;
      cq.g(L('M0 0 L ' + f1(-Math.cos(as) * ls) + ' ' + f1(-Math.sin(as) * ls), choisir(['#fff4b0', '#ffd060', '#ffffff']), 3 * u)).animate([{transform: 'translate(' + f1(cx) + 'px,' + f1(cy) + 'px)', opacity: 1}, {transform: 'translate(' + f1(cx + Math.cos(as) * vs) + 'px,' + f1(cy + Math.sin(as) * vs + 40 * u) + 'px)', opacity: 0}], {duration: hasard(500, 900), easing: 'cubic-bezier(.1,.7,.4,1)', fill: 'forwards'});
    }
    /* BOUM : une grande étoile de feu, l'éclair, les ondes de choc, par-dessus tout */
    var et = cq.g('<path d="' + etoileD(150 * u, 12, .55) + '" fill="#ffd060" stroke="' + O + '" stroke-width="' + f1(4 * u) + '"/><path d="' + etoileD(95 * u, 12, .55) + '" fill="#fff4c0"/>');
    et.animate([{transform: 'translate(' + f1(cx) + 'px,' + f1(cy) + 'px) scale(.15) rotate(0deg)', opacity: 1}, {offset: .35, transform: 'translate(' + f1(cx) + 'px,' + f1(cy) + 'px) scale(1) rotate(12deg)', opacity: 1}, {transform: 'translate(' + f1(cx) + 'px,' + f1(cy) + 'px) scale(1.15) rotate(20deg)', opacity: 0}], {duration: 520, easing: 'cubic-bezier(.1,.8,.3,1)', fill: 'forwards'}).finished.then(function(){ et.remove(); });
    /* l'éclair et les ondes de choc */
    cq.g('<circle r="' + f1(150 * u) + '" fill="' + gB + '"/>').animate([{transform: 'translate(' + f1(cx) + 'px,' + f1(cy) + 'px) scale(.2)', opacity: 1}, {transform: 'translate(' + f1(cx) + 'px,' + f1(cy) + 'px) scale(1.8)', opacity: 0}], {duration: 520, easing: 'ease-out', fill: 'forwards'});
    var rond = cq.g('<circle r="' + f1(120 * u) + '" fill="none" stroke="#ffffff" stroke-width="' + f1(9 * u) + '"/>');
    rond.animate([{transform: 'translate(' + f1(cx) + 'px,' + f1(cy) + 'px) scale(.2)', opacity: .95}, {transform: 'translate(' + f1(cx) + 'px,' + f1(cy) + 'px) scale(3.4)', opacity: 0}], {duration: 760, easing: 'cubic-bezier(.1,.8,.3,1)', fill: 'both'}).finished.then(function(){ rond.remove(); });
    var anneau = cq.g('<ellipse rx="' + f1(120 * u) + '" ry="' + f1(16 * u) + '" fill="none" stroke="' + LUNE + '" stroke-width="' + f1(6 * u) + '"/>');
    anneau.animate([{transform: 'translate(' + f1(cx) + 'px,' + f1(sol) + 'px) scale(.3)', opacity: 1}, {transform: 'translate(' + f1(cx) + 'px,' + f1(sol) + 'px) scale(4.5,2)', opacity: 0}], {duration: 1100, easing: 'cubic-bezier(.1,.7,.3,1)', fill: 'forwards'}).finished.then(function(){ anneau.remove(); });
    /* ce qui reste : un tas de vase, des os, la couronne tombée (posé un peu après le BOUM, pour ne pas alourdir l'image du choc) */
    setTimeout(function(){ self._restes(); }, 380);
    self._couperBoucles();
    self.mort = true;
    return Promise.all(brumes.map(fini)).then(function(){ cq.retirer(); });
  });
  p.boom = boomP;
  return p;
};
/* le tas de vase et d'os qui reste dans l'eau */
R._restes = function(){
  var D = this.D, s = '', self = this, c = this._ou('pieds'), x = c[0] - 30, y = this.etat.berge ? c[1] - 4 : 372;
  var gV = D.id(), gO = D.id();
  this._def('<linearGradient id="' + gV + '" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6a6a3a"/><stop offset=".5" stop-color="#3e3e22"/><stop offset="1" stop-color="#1a1a10"/></linearGradient>' +
    '<linearGradient id="' + gO + '" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#c8bca0"/></linearGradient>');
  s += '<ellipse cx="0" cy="8" rx="150" ry="16" fill="#000" opacity=".35"/>';
  s += Pw('M-140 10 C -120 -20 -60 -40 0 -42 C 60 -42 120 -24 146 10 C 80 22 -80 22 -140 10 Z', 'url(#' + gV + ')', 3);
  s += L('M-110 -10 C -60 -32 20 -38 90 -24', '#9a9a6a', 2, ' opacity=".55"');
  /* le crâne de crapaud : large, plat, deux grands trous ronds pour les yeux */
  s += '<g transform="translate(-30 -30)">' + Pw('M-44 8 C -48 -10 -30 -26 0 -26 C 30 -26 50 -12 46 6 C 40 18 20 20 0 18 C -20 20 -40 18 -44 8 Z', 'url(#' + gO + ')', 2.6) +
    '<ellipse cx="-16" cy="-6" rx="11" ry="9" fill="#2a2018" stroke="' + O + '" stroke-width="1.6"/><ellipse cx="18" cy="-6" rx="11" ry="9" fill="#2a2018" stroke="' + O + '" stroke-width="1.6"/>' +
    L('M-30 12 C -10 16 14 16 32 10', '#8a7a60', 2) + C(-13, -9, 2.4, '#ffd060', ' opacity=".8"') + '</g>';
  /* des os de pattes */
  function os(x0, y0, l, a){ return '<g transform="translate(' + x0 + ' ' + y0 + ') rotate(' + a + ')">' + Pw('M' + (-l) + ' -3 L ' + l + ' -3 C ' + (l + 6) + ' -10 ' + (l + 14) + ' -6 ' + (l + 10) + ' 0 C ' + (l + 14) + ' 6 ' + (l + 6) + ' 10 ' + l + ' 3 L ' + (-l) + ' 3 C ' + (-l - 6) + ' 10 ' + (-l - 14) + ' 6 ' + (-l - 10) + ' 0 C ' + (-l - 14) + ' -6 ' + (-l - 6) + ' -10 ' + (-l) + ' -3 Z', 'url(#' + gO + ')', 2.2) + L('M' + (-l + 4) + ' -1 L ' + (l - 4) + ' -1', '#ffffff', 1.2, ' opacity=".7"') + '</g>'; }
  s += os(50, -22, 26, -18) + os(80, -8, 18, 30) + os(-90, -10, 16, 12);
  /* la couronne de verrues, tombée dans la vase */
  s += '<g transform="translate(40 -40) rotate(14)">' + Pw('M-30 6 C -20 -4 10 -10 30 -8 C 32 -2 30 4 26 6 C 6 6 -12 10 -26 14 Z', '#946e2a', 2.2);
  [[-20, 4, 16], [-6, 0, 22], [8, -2, 26], [22, -4, 18]].forEach(function(p){ s += '<g transform="translate(' + p[0] + ' ' + p[1] + ')">' + Pw('M-6 4 C -6 -' + (p[2] * .4) + ' -2 -' + p[2] + ' 0 -' + p[2] + ' C 2 -' + p[2] + ' 6 -' + (p[2] * .4) + ' 6 4', '#e0a83a', 2) + '</g>'; });
  s += '</g>';
  s += C(-80, -16, 3, '#9ad0e0', ' opacity=".6"') + C(96, -12, 2.4, '#9ad0e0', ' opacity=".6"');
  var g = this._el(this.S.restes, '<g transform="translate(' + f1(x) + ' ' + f1(y) + ')"><g>' + s + '</g></g>');
  g.firstChild.firstChild.animate([{opacity: 0, transform: 'scale(.3)'}, {offset: .6, opacity: 0}, {opacity: 1, transform: 'scale(1)'}], {duration: 1500, easing: 'ease-out', fill: 'both'});
  /* des bulles de vase et un filet de fumée, de temps en temps */
  (function fumet(n){ if(n <= 0) return; self._bouffee([x + hasard(-60, 60), y - 40], {r: 8, coul: '#5a5260', op: .5, dx: hasard(-6, 14), dy: -60, duree: 1700, s1: 2.4}); setTimeout(function(){ fumet(n - 1); }, 520); })(9);
  [1800, 3200, 4800].forEach(function(ms){ setTimeout(function(){ self._rides(x + hasard(-100, 100), 1, 1, 376); }, ms); });
};

/* =====================================================================
   9. Les états (se cumulent ; etat(nom, on) renvoie une Promise)
   ===================================================================== */
R.attendre = function(){
  this.attente = true;
  if(this.arrete){ this.arrete = false; this._relancerX(); }
  if(!this.enAction && !this.mort) return this._reprendre(300);
  return Promise.resolve();
};
/* arreter() coupe tout : l'attente, les boucles des états (étoiles, flammes, pulsation), les fumées */
R.arreter = function(){
  this.attente = false;
  this.arrete = true;
  clearTimeout(this.fx.rides); clearTimeout(this.fx.vapeur); clearTimeout(this.fx.fumee);
  if(this.fx.haloR){ this.fx.haloR.cancel(); this.fx.haloR = null; }
  this._couperX('');
  this._couperBoucles();
  return this;
};
R._relancerX = function(){
  var e = this.etat;
  if(e.ebloui) this._etoiles(true);
  if(e.brule) this._bruler(true);
  if(e.ouvert) this._etatVisuel('ouvert', true);
  if(e.enrage) this._etatVisuel('enrage', true);
};
R.ancre = function(nom){
  var el = this.A[nom] || this.A.centre, r = el.getBoundingClientRect();
  return {x: r.left + r.width / 2, y: r.top + r.height / 2};
};
R._changerMode = function(ms){ if(!this.enAction && !this.mort) return this._reprendre(ms || 450); return Promise.resolve(); };
R.changerEtat = function(nom, on){
  on = on !== false;
  var self = this;
  if(this.mort) return Promise.resolve();
  if(!(nom in this.etat)) return Promise.resolve();
  if(this.etat[nom] === on) return Promise.resolve();
  switch(nom){
    case 'sous': return on ? this._plonger() : this._remonter();
    case 'dos':
      var j = this._debutAction();
      return this._retourner(on, j).then(function(){ return self._finAction(j, 150); });
    case 'berge':
      var j2 = this._debutAction();
      return (on ? this._versBerge() : this._retourEau()).then(function(){ return self._finAction(j2, 250); });
    case 'gonfle':
      var j3 = this._debutAction();
      return this._gonfler(on).then(function(){ return self._finAction(j3, 300); });
    case 'avale':
      this.etat.avale = on;
      this._bosseBoucle(on);
      return Promise.resolve();
  }
  this.etat[nom] = on;
  this._etatVisuel(nom, on);
  if(nom === 'enrage' || nom === 'ebloui' || nom === 'cible' || nom === 'gele') return this._changerMode(nom === 'ebloui' ? 500 : 350);
  if(!this.enAction && this.attente && !this.mort){ this._couperMinuteurs(); this._planifier(300); }
  return attendreMs(nom === 'sec' || nom === 'gele' ? 1000 : 300);
};
/* ce qui se voit de chaque état (sans la pose, gérée par _base) : on montre ou on cache des variantes pré-dessinées */
R._etatVisuel = function(nom, on){
  var self = this;
  switch(nom){
    case 'enrage':
      this._fondu(['irisR', 'haloR', 'rage'].reduce(function(l, n){ return l.concat(self.V[n] || []); }, []), on ? 1 : 0, 400);
      this._fondu('haloJ', on ? 0 : 1, 400);
      if(this.fx.haloR){ this.fx.haloR.cancel(); this.fx.haloR = null; }
      if(on) setTimeout(function(){ if(self.etat.enrage) self.fx.haloR = self.V.haloR[0].animate([{opacity: .55}, {opacity: 1}], {duration: 700, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out'}); }, 420);
      clearTimeout(this.fx.vapeur);
      if(on) (function vapeur(){
        if(self.mort || !self.etat.enrage) return;
        if(!self.etat.dos && !self.etat.sous){ var p = self._ou('narine'); for(var i = 0; i < 2; i++) self._bouffee([p[0] - 2, p[1]], {r: 5, coul: '#f0eef8', op: .75, dx: hasard(-34, -18), dy: hasard(-18, -6), duree: 700, delai: i * 120, s1: 2.6}); }
        self.fx.vapeur = setTimeout(vapeur, hasard(900, 1600));
      })();
      break;
    case 'ebloui':
      this._etoiles(on);
      break;
    case 'ouvert':
      this._couperX('pulse');
      this._fondu('ouvert', on ? 1 : 0, 400);
      if(on){
        this._boucleX('pulseA', [{transform: 'scale(.9)', opacity: .7}, {offset: .5, transform: 'scale(1.1)', opacity: 1}, {transform: 'scale(.9)', opacity: .7}], 900, {e: 'ease-in-out'});
        this._boucleX('pulseB', [{transform: 'scale(.7)', opacity: .9}, {transform: 'scale(1.35)', opacity: 0}], 900, {e: 'ease-out'});
      }
      break;
    case 'sec':
      this._fondu('sec', on ? 1 : 0, on ? 1400 : 900);
      this._fondu('mouille', on ? .18 : 1, 1200);
      if(on){
        for(var i = 0; i < 10; i++) (function(k){ setTimeout(function(){ var p = self._ou('dos'); self._bouffee([p[0] + hasard(-220, 120), p[1] + hasard(-10, 90)], {r: hasard(10, 16), coul: '#eeeaf2', op: .7, dx: hasard(-10, 30), dy: hasard(-100, -60), duree: 1400, s1: 2.4, liser: true}); }, k * 100); })(i);
        setTimeout(function(){ self._grille(); }, 600);
      }
      break;
    case 'gele':
      this._fondu('glace', on ? 1 : 0, on ? 900 : 1400);
      this._fondu(this.S.ligne, on ? 0 : (this.etat.berge || this.etat.sous ? 0 : 1), 600);
      /* le givre sur sa peau : la silhouette bleue pré-dessinée, à peine visible */
      this._fondu('flashG', on ? .22 : 0, 900);
      if(!on){ [].forEach.call(this.svg.querySelectorAll('[data-fele]'), function(e){ e.remove(); }); for(var d = 0; d < 6; d++) (function(k){ setTimeout(function(){ var p = self._ou('pieds'); self._goutte([p[0] + hasard(-200, 160), p[1] - hasard(10, 60)], {coul: '#cdeeff'}); }, k * 150); })(d); }
      else { var c = this._ou('pieds'); this._etincelles([c[0] - 60, 372], 14, ['#ffffff', '#cfeaff'], 1.6); this._joue('buee'); }
      break;
    case 'brule':
      this._bruler(on);
      break;
    case 'colle':
      this._fondu(['colle', 'colleEau'].reduce(function(l, n){ return l.concat(self.V[n] || []); }, []), on ? 1 : 0, 400);
      break;
  }
};
/* il monte sur la berge : il pousse sur ses mains, sort de l'eau, ruisselle */
R._versBerge = function(){
  var self = this, T = 2400;
  this.etat.berge = true;
  function t(ms){ return ms / T; }
  setTimeout(function(){ self._fondu(self.S.ligne, 0, 500); var c = self._ou('pieds'); self._gerbe(c[0] - 40, 374, 1.1, {n: 10}); }, 500);
  for(var k = 0; k < 14; k++) (function(q){ setTimeout(function(){ var p = self._ou('pieds'); self._goutte([p[0] + hasard(-220, 160), p[1] - hasard(0, 50)], {coul: '#cdeeff', eau: q < 6}); }, 500 + q * 110); })(k);
  setTimeout(function(){ self._flaque(); }, 1500);
  setTimeout(function(){ var c = self._ou('centre'); self._rides(c[0] + 40, 3, 1.4, 376); }, 900);
  var p = this._seq([
    {t: 0, p: {}},
    /* il appuie sur ses mains */
    {t: t(450), p: {saut: {y: 8, sy: .94}, bras: {a: -10}, avbras: {a: 16}, main: {a: -6}, paupB: {y: -4}, pupille: {x: -3}}, e: 'ease-out'},
    /* il se hisse hors de l'eau */
    {t: t(1200), p: {pos: {x: BERGE.x * .6, y: BERGE.y - 24}, saut: {y: 0, sy: 1.06, sx: .96}, posture: {a: -8}, bras: {a: 14}, avbras: {a: -6}, main: {a: 10}, cuisse: {a: -14}, jambe: {a: -24}, pied: {a: 10}, algues: {a: -6}, brins: {a: -14}}, e: 'cubic-bezier(.3,.6,.4,1)'},
    /* il se pose, lourdement */
    {t: t(1650), p: {pos: {x: BERGE.x, y: BERGE.y}, saut: {y: 4, sy: .9, sx: 1.08}, posture: {a: 0}, cuisse: {a: 0}, jambe: {a: 0}, pied: {a: 0}, algues: {a: 6}, brins: {a: 12}}, e: 'cubic-bezier(.6,0,.9,.6)'},
    {t: t(1950), p: {saut: {y: 0, sy: 1, sx: 1}, algues: {a: 0}, brins: {a: 0}, bras: {a: 4}, avbras: {a: -6}, main: {a: 8}}, e: 'cubic-bezier(.3,.6,.4,1.3)'},
    /* il se secoue */
    {t: t(2100), p: {secousse: {a: 2}, couronne: {a: -3}}}, {t: t(2250), p: {secousse: {a: -2}, couronne: {a: 3}}}, {t: 1, p: {secousse: {a: 0}, couronne: {a: 0}, paupB: {y: 0}, pupille: {x: 0}}}
  ], T);
  return p.fini;
};
/* la flaque sous lui, sur la berge (variante pré-dessinée, elle suit ses pieds) */
R._flaque = function(){ this._fondu('flaque', 1, 500); this.fx.flaque = true; };
R._enleverFlaque = function(){ if(!this.fx.flaque) return; this.fx.flaque = false; this._fondu('flaque', 0, 500); };
/* il gonfle (nuage avant feu) : trois grandes goulées d'air ; ou il se dégonfle, pfffff */
R._gonfler = function(on){
  var self = this, T;
  this.etat.gonfle = on;
  var tendu = this.V.tendu || [];
  if(on){
    T = 2000;
    this._fondu(tendu, 1, 1600);
    [300, 900, 1500].forEach(function(ms){ setTimeout(function(){ var p = self._ou('bouche'); self._bouffee([p[0] - 30, p[1] - 4], {r: 9, coul: '#e8eedc', op: .6, dx: 26, dy: 4, duree: 300, s0: 1.4, s1: .3}); }, ms - 200); });
    return this._seq([{t: 0, p: {}},
      {t: .15, p: {gorge: {sx: 1.5, sy: 2}, corps: {sx: 1.02, sy: 1.03}, machoire: {a: -4}}}, {t: .25, p: {gorge: {sx: 1.1, sy: 1.2}, corps: {sx: 1.06, sy: 1.08}, machoire: {a: 0}}},
      {t: .45, p: {gorge: {sx: 1.6, sy: 2.1}, corps: {sx: 1.07, sy: 1.1}, machoire: {a: -4}}}, {t: .55, p: {gorge: {sx: 1.2, sy: 1.3}, corps: {sx: 1.11, sy: 1.15}, machoire: {a: 0}, oeil: {s: 1.08}}},
      {t: .75, p: {gorge: {sx: 1.7, sy: 2.2}, corps: {sx: 1.12, sy: 1.16}, machoire: {a: -4}}}, {t: .85, p: {gorge: {sx: 1.25, sy: 1.35}, corps: {sx: 1.17, sy: 1.23}, ventre: {s: 1.09}, machoire: {a: 0}, oeil: {s: 1.12}, pos: {y: self.etat.dos || self.etat.berge ? self._b('pos').y : -14}}, e: 'cubic-bezier(.3,.6,.4,1.4)'},
      {t: 1, p: {corps: {sx: 1.15, sy: 1.2}, oeil: {s: 1}}}], T).fini;
  }
  T = 1800;
  this._fondu(tendu, 0, 900);
  for(var n = 0; n < 14; n++) (function(m){ setTimeout(function(){ var p = self._ou('bouche'); self._bouffee([p[0] - 4, p[1]], {r: hasard(5, 9), coul: '#e0e8d8', op: .65, dx: hasard(-70, -40), dy: hasard(-30, 6), duree: 650, s1: 2.4}); }, m * 80); })(n);
  var k = [{t: 0, p: {}}];
  for(var i = 1; i <= 8; i++) k.push({t: i / 10, p: {corps: {sx: 1.15 - i * .019, sy: 1.2 - i * .025}, secousse: {a: i % 2 ? 3 : -3, x: i % 2 ? -6 : 4}, machoire: {a: -10}}, e: 'ease-in-out'});
  k.push({t: 1, p: {corps: {sx: 1, sy: 1}, secousse: {a: 0, x: 0}, machoire: {a: 0}, ventre: {s: 1}, gorge: {sx: 1, sy: 1}}, e: 'cubic-bezier(.4,0,.3,1.3)'});
  return this._seq(k, T).fini;
};
/* les flammes qui restent sur son dos (la variante « feu », qui vacille), de la fumée et des braises */
R._bruler = function(on){
  var self = this;
  clearTimeout(this.fx.fumee);
  this._allumerFeu(on);
  if(!on) return;
  var corps = this.J.corps[0];
  (function fumee(){
    if(!self.etat.brule || self.mort) return;
    if(!self.etat.sous){
      var p = self._ou(corps, hasard(300, 480), hasard(60, 90));
      self._bouffee([p[0], p[1] - 40], {r: hasard(12, 18), coul: choisir(['#8a8098', '#6a6278', '#9a92a8']), op: .5, dx: hasard(10, 40), dy: hasard(-100, -70), duree: hasard(1400, 2000), s1: 2.8});
      if(Math.random() < .6){
        var q = self._ou(corps, hasard(300, 480), 80), b = self._fxEl('<circle r="2.6" fill="#ffd060"/>');
        b.animate([{transform: 'translate(' + f1(q[0]) + 'px,' + f1(q[1] - 20) + 'px)', opacity: 1}, {transform: 'translate(' + f1(q[0] + hasard(-20, 30)) + 'px,' + f1(q[1] - hasard(70, 120)) + 'px)', opacity: 0}], {duration: 900, easing: 'ease-out', fill: 'forwards'}).finished.then(function(){ b.remove(); });
      }
    }
    self.fx.fumee = setTimeout(fumee, hasard(220, 360));
  })();
};

/* =====================================================================
   12. L'interface publique (contrat commun des bêtes)
   ===================================================================== */
var INFO = {id: 'bourbe', nom: 'Bourbe, le crapaud du puits', rang: 'boss', cadre: {w: 490, h: 340}, sol: (392 - VB.y) / VB.h, vole: false, places: 3};
function creer(conteneur, options){
  var b = new Bourbe(conteneur, options);
  return {
    info: INFO,
    entrer: function(){ return b.entrer(); },
    attendre: function(){ return b.attendre(); },
    attaquer: function(nom, o){ return b.attaquer(nom, o); },
    touche: function(type, o){ return b.touche(type, o); },
    special: function(nom, o){ return b.special(nom, o); },
    tousser: function(){ return b.tousser(); },
    fuir: function(){ return b.mourir(); },
    mourir: function(){ return b.mourir(); },
    exploser: function(scene){ return b.exploser(scene); },
    etat: function(nom, on){ return b.changerEtat(nom, on); },
    etatCourant: function(){ var e = {}; for(var k in b.etat) e[k] = b.etat[k]; return e; },
    cible: function(on){ return b.changerEtat('cible', on); },
    ancre: function(nom){ return b.ancre(nom); },
    arreter: function(){ b.arreter(); return this; },
    _bete: b
  };
}
global.BETES = global.BETES || {};
global.BETES.bourbe = {info: INFO, creer: creer, _interne: {POSES: POSES, VB: VB}};
})(typeof window !== 'undefined' ? window : this);
