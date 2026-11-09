/* feufollet-anime.js — le feu follet, animé (Les Enquêteurs de Brumeval, donjon du puits)
   Module autonome, sans dépendance ; il injecte son propre CSS (préfixe .bt-feufollet-…). Il ne joue aucun son.
   Contrat commun : jeu/donjon/anim/betes/CONTRAT.md. Dessin validé : bestiaire/betes/04-feufollet.js
   (un esprit-flamme bleu, à moitié transparent, au sourire en coin, qui appelle les héros du bout du doigt). 30 PV,
   brûlure froide 12 sur 2 héros.

     var f = BETES.feufollet.creer(conteneur);   // le SVG remplit le conteneur (230 × 260), il regarde à gauche

   Il FLOTTE (info.vole = true) : on place le cadre comme celui des autres bêtes (info.sol = la ligne du sol dans le cadre,
   posée sur le sol de la scène, où il jette sa lueur) ; info.vol = la hauteur de son cœur.

   Actions (Promise, résolue quand il est revenu à son attente) :
     entrer()                   une étincelle arrive en flottant, s'allume, et la flamme grandit d'un coup (whoush)
     attaquer('brulure', o)     il s'étire, prend son souffle, et crache une langue de flamme froide qui se sépare en deux
                                vers o.vers = [{x,y}, {x,y}] (écran ; un seul point marche aussi) ; o.onImpact(0) puis o.onImpact(1)
                                à chaque contact. La Promise a .impact (le premier contact).
     touche(type)               nuage  : il tousse trois fois dans la fumée, et sa silhouette s'y dessine → état « visible »
                                         (= point faible ouvert : un cœur de flamme plus clair qui palpite)
                                lumiere: il boit la lumière et GRANDIT → special('grandit'), état « grand » (+30 PV : un piège)
                                bouclier: il s'accroche au bouclier de runes du Sage → special('accroche')
                                fleche-argent : elle le touche même fermé : une traînée argentée le traverse, il se déchire
                                         en deux, puis se recoud (points d'argent)
                                fleche, fleche-lourde, dague (elles le traversent, il se reforme), feu (ça siffle, vapeur),
                                louche (elle passe au travers, il rit), colle, huile (il s'embrase d'un coup), givre, acide,
                                bruit (il vacille comme une bougie), rebond (il agite le doigt : « non, non… » et rit)
     special(nom, o)            'accroche' (il fonce sur le bouclier, s'y colle, les runes restent sur lui → états « accroche »
                                + « visible »), 'grandit' (→ état « grand »), 'appel' (« viens… » du bout du doigt), 'rire'
     tousser()                  trois quintes, lentes (la flamme crachote)
     mourir() / fuir()          il s'éteint : les langues tombent une à une, des volutes de fumée et des étincelles pâles
                                montent, le cœur reste seul, pâlit et s'éteint (pas de fuite)
     exploser(scene)            il éclate en gerbe d'étincelles bleues et en brume noire ; il reste au sol une petite braise
                                froide qui s'éteint lentement. La Promise a .boom.
   États (se cumulent ; etat(nom, on) renvoie une Promise) : enrage, brule, colle, ebloui, gele, ouvert, dos, cible
     + les siens : « visible » (silhouette dans la fumée, cœur qui palpite), « grand » (renforcé), « accroche » (runes).
   attendre(), arreter(), etatCourant(), ancre(nom) : tete, pointfaible, centre, bouche, pieds, haut, main (écran).

   Pour la fluidité (CONTRAT §4 bis) : aucun filtre, aucun masque, aucun mélange. Sa transparence vient d'opacités FIXES
   (fill-opacity) et de dégradés : chaque langue de flamme est une pièce qui se balance, et elle se fond dans le bulbe par
   un dégradé (pas de couture). Pièces <g data-j> au contenu fixe, animées en transform (et en opacité pour s'éteindre) ;
   états = variantes dessinées d'avance (data-j="v-…") ; boucles autonomes (data-j="x-…") ; au plus 24 particules. */
(function(global){
'use strict';
var ID = 'feufollet', PX = 'bt-feufollet';
var O = '#24182e', NUM = 0, NS = 'http://www.w3.org/2000/svg';

/* =====================================================================
   1. Petits outils de dessin
   ===================================================================== */
function f1(v){ return (+v).toFixed(1); }
function fo(v){ return (+v).toFixed(3); }
function pt(p){ return f1(p[0]) + ' ' + f1(p[1]); }
function lerp(a, b, t){ return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
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
/* l'étoile à 4 branches de la fiche (les étincelles) */
function scintD(x, y, r){ return 'M' + f1(x) + ' ' + f1(y - r) + ' Q ' + f1(x + r * .16) + ' ' + f1(y - r * .16) + ' ' + f1(x + r) + ' ' + f1(y) + ' Q ' + f1(x + r * .16) + ' ' + f1(y + r * .16) + ' ' + f1(x) + ' ' + f1(y + r) + ' Q ' + f1(x - r * .16) + ' ' + f1(y + r * .16) + ' ' + f1(x - r) + ' ' + f1(y) + ' Q ' + f1(x - r * .16) + ' ' + f1(y - r * .16) + ' ' + f1(x) + ' ' + f1(y - r) + ' Z'; }
function flammeD(h, w){ return 'M' + f1(-w / 2) + ' 0 C ' + f1(-w * .62) + ' ' + f1(-h * .38) + ' ' + f1(-w * .1) + ' ' + f1(-h * .5) + ' ' + f1(-w * .12) + ' ' + f1(-h) + ' C ' + f1(w * .3) + ' ' + f1(-h * .62) + ' ' + f1(w * .7) + ' ' + f1(-h * .42) + ' ' + f1(w / 2) + ' 0 Z'; }
function Defs(u){ this.u = u; this.n = 0; this.l = []; this.cache = {}; }
Defs.prototype.id = function(){ return this.u + (++this.n); };
Defs.prototype.stops = function(st){ return st.map(function(t){ return '<stop offset="' + t[0] + '" stop-color="' + t[1] + '" stop-opacity="' + fo(t[2] == null ? 1 : t[2]) + '"/>'; }).join(''); };
Defs.prototype.rad = function(st, cx, cy, r){ var id = this.id(); this.l.push('<radialGradient id="' + id + '" cx="' + cx + '" cy="' + cy + '" r="' + r + '">' + this.stops(st) + '</radialGradient>'); return 'url(#' + id + ')'; };
Defs.prototype.lin = function(st, x1, y1, x2, y2){ var id = this.id(); this.l.push('<linearGradient id="' + id + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '">' + this.stops(st) + '</linearGradient>'); return 'url(#' + id + ')'; };
Defs.prototype.linU = function(st, x1, y1, x2, y2){ var id = this.id(); this.l.push('<linearGradient id="' + id + '" gradientUnits="userSpaceOnUse" x1="' + f1(x1) + '" y1="' + f1(y1) + '" x2="' + f1(x2) + '" y2="' + f1(y2) + '">' + this.stops(st) + '</linearGradient>'); return 'url(#' + id + ')'; };
Defs.prototype.doux = function(c, o){
  o = o == null ? 1 : o;
  var k = 'd' + c + '|' + o;
  if(!this.cache[k]){ var id = this.id(), h = '<radialGradient id="' + id + '"><stop offset="0" stop-color="' + c + '" stop-opacity="' + o + '"/><stop offset=".5" stop-color="' + c + '" stop-opacity="' + fo(o * .55) + '"/><stop offset="1" stop-color="' + c + '" stop-opacity="0"/></radialGradient>'; this.l.push(h); if(this.vivant) this.vivant.insertAdjacentHTML('beforeend', h); this.cache[k] = 'url(#' + id + ')'; }
  return this.cache[k];
};
function douce(D, cx, cy, rx, ry, c, o){ return '<ellipse cx="' + f1(cx) + '" cy="' + f1(cy) + '" rx="' + f1(rx) + '" ry="' + f1(ry) + '" fill="' + D.doux(c) + '"' + (o == null ? '' : ' fill-opacity="' + fo(o) + '"') + '/>'; }
function piv(nom, x, y, c, style){ return '<g data-j="' + nom + '" style="transform-origin:' + x + 'px ' + y + 'px' + (style ? ';' + style : '') + '">' + c + '</g>'; }
function vari(nom, c, o){ return '<g data-j="v-' + nom + '" opacity="' + (o || 0) + '"' + (o ? '' : ' visibility="hidden"') + '>' + c + '</g>'; }
function ancre(nom, x, y){ return '<circle data-a="' + nom + '" cx="' + x + '" cy="' + y + '" r=".6" fill="none"/>'; }
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
function vers(pts, c, k, dy){ return pts.map(function(p){ return [c[0] + (p[0] - c[0]) * k, c[1] + (p[1] - c[1]) * k + (dy || 0)]; }); }

/* =====================================================================
   2. Le dessin : les coordonnées de la fiche (540 × 430)
   ===================================================================== */
var C1 = '#0e4a78', C2 = '#1f9ee0', C3 = '#4fdcff', C4 = '#a8f4ff', C5 = '#e8fdff', NUIT = '#05223a', FUMEE = '#d6d0e6', SOL = 450;
var CENTRE = [250, 236], COEUR = [250, 266];
/* la silhouette de la fiche : un bulbe rond en bas, quatre langues couchées vers l'arrière (la droite) */
var FL = [[168, 232], [178, 272], [208, 300], [248, 308], [290, 298], [318, 268], [328, 232], [342, 200], [368, 166], [400, 126], [370, 142], [334, 154],
  [342, 118], [354, 80], [368, 46], [338, 70], [302, 114], [298, 76], [302, 36], [310, 6], [282, 34], [256, 82], [242, 112], [230, 98], [228, 78], [236, 56], [210, 82], [188, 126], [174, 180]];
var BULBE = [[174, 180], [168, 232], [178, 272], [208, 300], [248, 308], [290, 298], [318, 268], [328, 232], [332, 196], [318, 162], [292, 142], [256, 136], [222, 144], [194, 160]];
/* chaque langue : sa part du contour de la fiche, prolongée dans le bulbe (où elle se fond) ; sa base (pivot) ; sa pointe ;
   son opacité (la fiche s'efface vers la droite : la langue de droite est la plus pâle) */
var LANGUES = [
  {i0: 6, i1: 11, ext: [[306, 176], [302, 226]], base: [314, 204], tip: [400, 126], k: .5},
  {i0: 11, i1: 16, ext: [[292, 152], [318, 180]], base: [316, 156], tip: [368, 46], k: .7},
  {i0: 16, i1: 22, ext: [[246, 162], [300, 160]], base: [272, 146], tip: [310, 6], k: .92},
  {i0: 22, i1: 28, ext: [[198, 198], [238, 166]], base: [214, 168], tip: [236, 56], k: 1}
];
var PATE = '<path d="M-20 4 C -20 -8 -10 -12 0 -11 C 10 -12 20 -8 20 4 C 12 10 -12 10 -20 4 Z" fill="#d0e05a" fill-opacity=".94" stroke="#5a6420" stroke-width="1.8"/><path d="M-12 -4 Q 0 -9 12 -4" fill="none" stroke="#fbffd0" stroke-width="1.8" opacity=".85"/>';
var RUNE = ['M-9 -12 L 0 -18 L 9 -12 M0 -18 L 0 14 M-9 4 L 9 4', 'M-10 -14 L 10 14 M10 -14 L -10 14 M-12 0 L 12 0', 'M-8 -14 L -8 14 M-8 -14 L 8 -4 L -8 6 M-8 6 L 10 14', 'M0 -16 L 12 0 L 0 16 L -12 0 Z M0 -16 L 0 16'];
function rune(x, y, k, i){ var d = RUNE[i % RUNE.length]; return Gt('translate(' + x + ' ' + y + ') scale(' + (k || 1) + ')', '<circle r="22" fill="#8ff3ff" fill-opacity=".18"/>' + L(d, '#0a3a4a', 7) + L(d, '#8ff3ff', 3.6) + L(d, '#f0ffff', 1.4)); }
function flammes(D, l, pre){
  var gF1 = D.lin([[0, '#ff4a10'], [.6, '#ff8a1a'], [1, '#ffc040', .8]], 0, 1, 0, 0), gF2 = D.lin([[0, '#ffd040'], [1, '#fff8c0']], 0, 1, 0, 0);
  return l.map(function(f, i){ return Gt('translate(' + f[0] + ' ' + f[1] + ') rotate(' + (f[4] || 0) + ')', piv('x-' + pre + i, 0, 0, '<path d="' + flammeD(f[2], f[3]) + '" fill="' + gF1 + '" stroke="#5a1a08" stroke-width="2"/><path d="' + flammeD(f[2] * .7, f[3] * .62) + '" fill="#ffa21e"/><path d="' + flammeD(f[2] * .42, f[3] * .36) + '" fill="' + gF2 + '"/>')); }).join('');
}

function dessiner(D){
  var s = {};
  /* ---- la lueur qu'il jette sur le sol (hors de la chaîne : elle reste au sol) ---- */
  s.reflet = piv('reflet', 256, SOL, '<ellipse cx="256" cy="' + SOL + '" rx="190" ry="24" fill="' + D.rad([[0, C4, .55], [.5, C3, .2], [1, C2, 0]], .5, .5, .5) + '"/>' +
    douce(D, 262, SOL + 2, 70, 7, '#000', .3) + L('M150 ' + (SOL + 6) + ' L 196 ' + (SOL + 6) + ' M214 ' + (SOL + 10) + ' L 268 ' + (SOL + 10) + ' M290 ' + (SOL + 6) + ' L 352 ' + (SOL + 6) + ' M196 ' + (SOL + 16) + ' L 222 ' + (SOL + 16) + ' M300 ' + (SOL + 16) + ' L 330 ' + (SOL + 16), C4, 1.6, op(.35)) +
    vari('refletG', '<ellipse cx="256" cy="' + SOL + '" rx="250" ry="30" fill="' + D.rad([[0, C5, .6], [.5, C4, .25], [1, C3, 0]], .5, .5, .5) + '"/>'));
  /* ---- le halo : la lumière qu'il jette autour de lui ---- */
  s.halo = piv('halo', 250, 200, '<circle cx="250" cy="200" r="230" fill="' + D.rad([[0, C3, .26], [.4, C2, .11], [1, C1, 0]], .5, .5, .5) + '"/>' +
    vari('haloG', '<circle cx="250" cy="200" r="260" fill="' + D.rad([[0, C5, .3], [.35, C3, .18], [1, C2, 0]], .5, .5, .5) + '"/>'));
  /* ---- la fumée du nuage (derrière et devant) : sa silhouette s'y dessine ---- */
  function fumee(l, pre){ return l.map(function(f, i){ return Gt('translate(' + f[0] + ' ' + f[1] + ')', piv('x-' + pre + i, 0, 0, douce(D, 0, 0, f[2], f[2] * .78, FUMEE, .55) + douce(D, -f[2] * .25, -f[2] * .2, f[2] * .55, f[2] * .45, '#f4f0ff', .4))); }).join(''); }
  s.fumeeA = vari('fumee', fumee([[140, 150, 90], [370, 120, 80], [400, 270, 84], [120, 300, 76], [260, 30, 80], [300, 350, 90]], 'fa'));
  s.fumeeB = vari('fumee', fumee([[96, 230, 40], [410, 190, 44], [210, 360, 46]], 'fb'));
  /* ---- la traînée derrière lui : volutes et poussière d'étincelles qui s'efface ---- */
  var R = rng(17), t = '';
  var gT = D.linU([[0, C2, .3], [.6, C2, .16], [1, C2, 0]], 300, 270, 510, 270);
  t += F(tube([[300, 260], [350, 300], [410, 312], [470, 296], [510, 270]], [62, 54, 40, 22, 6]).d, gT, op(.5)) + F(tube([[300, 260], [350, 300], [410, 312], [470, 296], [510, 270]], [40, 34, 24, 12, 3]).d, gT);
  t += L('M300 286 C 340 320 400 330 450 312 C 480 300 492 280 482 268 C 472 258 456 264 460 276 C 462 284 472 286 476 280', C3, 3.4, op(.16)) + L('M300 286 C 340 320 400 330 450 312 C 480 300 492 280 482 268 C 472 258 456 264 460 276 C 462 284 472 286 476 280', C3, 2, op(.35));
  t += L('M318 150 C 360 140 400 150 430 176 C 450 194 446 214 430 214 C 418 214 414 200 424 196', C3, 3.2, op(.14)) + L('M318 150 C 360 140 400 150 430 176 C 450 194 446 214 430 214 C 418 214 414 200 424 196', C3, 1.8, op(.3));
  var pq = {};
  for(var k = 0; k < 70; k++){
    var tt = R(), x = 290 + tt * 230 + (R() - .5) * 30, y = 80 + R() * 260 + tt * 20, r = (1 - tt) * 3 + R() * 1.6, c = R() < .3 ? C5 : C3, o = (1 - tt) * .7 + .1, b = c + (o > .55 ? 'a' : (o > .3 ? 'b' : 'c'));
    pq[b] = (pq[b] || '') + 'M' + f1(x - r) + ' ' + f1(y) + ' a ' + f1(r) + ' ' + f1(r) + ' 0 1 0 ' + f1(2 * r) + ' 0 a ' + f1(r) + ' ' + f1(r) + ' 0 1 0 ' + f1(-2 * r) + ' 0 Z ';
  }
  Object.keys(pq).forEach(function(b){ t += F(pq[b], b.slice(0, 7), op({a: .7, b: .45, c: .22}[b[7]])); });
  s.traine = piv('traine', 300, 270, t);
  /* ---- la queue qui s'enroule sous lui : la base, et le bout qui s'enroule (pièce à part) ---- */
  var QP = [[236, 270], [250, 312], [290, 336], [334, 330], [352, 304], [336, 286], [318, 296], [324, 312]], QW = [60, 44, 30, 22, 14, 9, 5, 2];
  var qt = tube(QP, QW);
  var gQ = D.linU([[0, C2, .42], [.6, C2, .3], [1, C2, .12]], 236, 300, 380, 300), gQ2 = D.linU([[0, C3, .32], [1, C3, .08]], 236, 300, 380, 300);
  var qBase = lisse(qt.g.slice(0, 4).concat(qt.dr.slice(0, 4).reverse()), true);
  var qBout = lisse([lerp(qt.g[2], qt.g[3], .6)].concat(qt.g.slice(3), [qt.dr[7]], qt.dr.slice(3).reverse(), [lerp(qt.dr[2], qt.dr[3], .6)]), true);
  var qLigne = 'M244 300 C 262 326 300 340 334 328', qLigne2 = 'M334 328 C 350 318 352 300 338 292 C 326 288 318 298 324 308';
  var bout = F(qBout, gQ) + F(qBout, gQ2, ' transform="translate(-3 -3)"') + L(qLigne2, C4, 2.4, op(.55));
  bout += vari('visible', L(qBout, FUMEE, 6, op(.45)) + L(qBout, '#ffffff', 1.6, op(.75)) + F(qBout, C3, op(.2)));
  s.queue = piv('queue', 240, 284, F(qBase, gQ) + F(qBase, gQ2, ' transform="translate(-3 -3)"') + L(qLigne, C4, 2.4, op(.55)) +
    vari('visible', L(qBase, FUMEE, 6, op(.45)) + L(qBase, '#ffffff', 1.6, op(.75)) + F(qBase, C3, op(.2))) + piv('queueB', 334, 328, bout));
  /* ---- le corps : le bulbe (fixe) et les quatre langues (pièces qui se balancent), en trois couches ---- */
  var bA = lisse(BULBE, true), bB = lisse(vers(BULBE, [248, 236], .8, 8), true), bC = lisse(vers(BULBE, [248, 236], .58, 16), true);
  var bulbe = '';
  /* la lueur douce autour de la silhouette (à la place du flou de la fiche) */
  bulbe += F(lisse(vers(FL, [248, 236], 1.12), true), C2, op(.1)) + F(lisse(vers(FL, [248, 236], 1.05), true), C2, op(.1));
  bulbe += F(bA, D.linU([[0, C1, .66], [.4, C2, .56], [.75, C2, .4], [1, C3, 0]], 250, 306, 250, 136));
  bulbe += F(bA, D.rad([[0, C1, 0], [.75, C1, 0], [1, '#041a2c', .45]], .48, .62, .6));
  bulbe += L(lisse([FL[28], FL[0], FL[1], FL[2], FL[3], FL[4], FL[5], FL[6]], false), C4, 1.8, op(.75));
  bulbe += F(bB, D.linU([[0, C2, .5], [.5, C3, .55], [.85, C4, .35], [1, C4, 0]], 250, 300, 250, 150));
  bulbe += L(lisse(vers([FL[28], FL[0], FL[1], FL[2], FL[3], FL[4], FL[5], FL[6]], [248, 236], .8, 8), false), C5, 1.2, op(.45));
  bulbe += F(bC, D.linU([[0, C4, .55], [.55, C5, .72], [1, C5, 0]], 250, 290, 250, 166));
  bulbe += L('M186 262 C 200 290 236 302 272 294', C4, 2, op(.45));
  bulbe += vari('visible', F(bA, D.linU([[0, C2, .35], [.8, C3, .2], [1, C3, 0]], 250, 306, 250, 136)) + L(lisse([FL[28], FL[0], FL[1], FL[2], FL[3], FL[4], FL[5], FL[6]], false), FUMEE, 8, op(.5)) + L(lisse([FL[28], FL[0], FL[1], FL[2], FL[3], FL[4], FL[5], FL[6]], false), '#ffffff', 2.2, op(.85)));
  bulbe += vari('grand', F(bB, D.linU([[0, C4, .35], [.7, C5, .35], [1, C5, 0]], 250, 300, 250, 150)));
  bulbe += vari('flash', F(bA, D.linU([[0, '#ffffff', 1], [.8, '#ffffff', .8], [1, '#ffffff', 0]], 250, 306, 250, 136))) + vari('flashG', F(bA, D.linU([[0, '#d8f0ff', 1], [.8, '#d8f0ff', .8], [1, '#d8f0ff', 0]], 250, 306, 250, 136)));
  bulbe += vari('gel', F(bA, D.linU([[0, '#f0fbff', .75], [.7, '#dff4ff', .55], [1, '#dff4ff', 0]], 250, 306, 250, 136)) + L('M196 250 L 214 268 L 206 290 M286 254 L 300 278 M240 290 L 252 272 L 266 292', '#ffffff', 2, op(.9)) +
    P('M200 296 L 206 318 L 212 298 Z M236 306 L 242 330 L 248 307 Z M276 302 L 282 322 L 288 298 Z', '#eef9ff', ' stroke-width="1.4"'));
  bulbe += vari('runes', '<circle cx="250" cy="266" r="50" fill="none" stroke="#0a3a4a" stroke-width="7" opacity=".6"/><circle cx="250" cy="266" r="50" fill="none" stroke="#8ff3ff" stroke-width="3.4" stroke-dasharray="12 8"/>' + rune(206, 270, 1.4, 0) + rune(298, 252, 1.3, 1) + rune(252, 300, 1.1, 3));
  bulbe += vari('colle', Gt('translate(232 292) rotate(-8) scale(1.3)', PATE));
  bulbe += vari('feu', flammes(D, [[226, 150, 96, 46, -8], [288, 120, 110, 50, 6], [334, 176, 84, 40, 18]], 'fl'));
  var langues = '';
  LANGUES.forEach(function(g, i){
    var pts = FL.slice(g.i0, g.i1 + 1).concat(g.ext), bord = lisse(FL.slice(g.i0, g.i1 + 1), false);
    var a = lisse(pts, true), b = lisse(vers(pts, g.base, .74, -4), true), c = lisse(vers(pts, g.base, .46, -6), true);
    var p0 = g.base, p1 = g.tip, k = g.k;
    var l = '';
    l += F(a, D.linU([[0, C1, 0], [.3, C2, .55 * k], [.7, C3, .6 * k], [1, C3, .5 * k]], p0[0], p0[1] + 20, p1[0], p1[1]));
    l += L(bord, C4, 1.8, op(.75 * k));
    l += F(b, D.linU([[0, C3, 0], [.35, C3, .5 * k], [1, C4, .6 * k]], p0[0], p0[1] + 10, p1[0], p1[1]));
    l += L(lisse(vers(FL.slice(g.i0, g.i1 + 1), g.base, .74, -4), false), C5, 1.2, op(.45 * k));
    l += F(c, D.linU([[0, C4, 0], [.4, C4, .5 * Math.max(.6, k)], [1, C5, .72 * Math.max(.6, k)]], p0[0], p0[1], p1[0], p1[1]));
    /* les volutes qui tournent dans la flamme */
    l += [L('M358 60 C 346 84 332 104 316 122', C5, 1.4, op(.5)), L('M310 232 C 324 200 322 160 306 126 C 298 108 300 88 312 78', C5, 1.8, op(.4)), L('M302 20 C 292 48 280 76 264 104', C5, 1.4, op(.5)) + L('M300 200 C 312 176 306 150 288 140 C 274 134 262 142 266 154 C 270 162 280 160 280 154', C5, 1.8, op(.4)), L('M232 66 C 222 84 210 104 200 128', C5, 1.4, op(.5))][i];
    l += vari('visible', F(a, D.linU([[0, C2, 0], [.35, C3, .3], [1, C4, .3]], p0[0], p0[1] + 20, p1[0], p1[1])) + L(bord, FUMEE, 8, op(.5)) + L(bord, '#ffffff', 2.2, op(.85)));
    l += vari('grand', F(b, D.linU([[0, C4, 0], [.4, C5, .35], [1, '#ffffff', .5]], p0[0], p0[1], p1[0], p1[1])));
    l += vari('flash', F(a, D.linU([[0, '#ffffff', 0], [.3, '#ffffff', .9], [1, '#ffffff', 1]], p0[0], p0[1] + 20, p1[0], p1[1]))) + vari('flashG', F(a, D.linU([[0, '#d8f0ff', 0], [.3, '#d8f0ff', .9], [1, '#d8f0ff', 1]], p0[0], p0[1] + 20, p1[0], p1[1])));
    l += vari('gel', F(a, D.linU([[0, '#f0fbff', 0], [.35, '#e8f8ff', .5], [1, '#ffffff', .65]], p0[0], p0[1] + 20, p1[0], p1[1])) + L(bord, '#ffffff', 2.4, op(.9)));
    if(i === 2) l += vari('runes', rune(286, 84, 1.3, 2));
    if(i === 3) l += vari('runes', rune(218, 112, 1.1, 0));
    langues += piv('langue' + i, p0[0], p0[1], l);
  });
  /* les flammèches qui s'échappent par le haut (boucles autonomes : elles montent et s'effacent) */
  var fm = '';
  [[322, 0, 6, .7], [384, 40, 5, .8], [262, 30, 4, .5], [414, 104, 5, .8]].forEach(function(m, i){
    var d = 'M0 ' + f1(m[2] * 3) + ' C ' + f1(-m[2]) + ' ' + f1(m[2]) + ' ' + f1(m[3] * 10) + ' ' + f1(-m[2]) + ' ' + f1(2 + m[3] * 12) + ' ' + f1(-m[2] * 2) + ' C ' + f1(m[2]) + ' 0 ' + f1(m[2]) + ' ' + f1(m[2] * 2) + ' 0 ' + f1(m[2] * 3) + ' Z';
    fm += Gt('translate(' + m[0] + ' ' + m[1] + ')', piv('x-fm' + i, 0, 0, F(d, C4, op(.8)) + F(d, C5, op(.6) + ' transform="scale(.5)"'), 'opacity:0'));
  });
  s.corps = piv('corps', 248, 300, bulbe + langues + fm);
  /* ---- le cœur : une braise blanche au fond de la flamme ; d'habitude on le voit à peine ---- */
  var co = '<circle cx="250" cy="266" r="44" fill="' + D.rad([[0, C5, .55], [.3, C4, .4], [.7, C3, .14], [1, C2, 0]], .5, .5, .5) + '"/>';
  co += F('M250 256 C 254 261 258 266 250 278 C 242 266 246 261 250 256 Z', C5, op(.6)) + F(scintD(250, 268, 10), '#ffffff', op(.45));
  co += vari('pf', '<circle cx="250" cy="266" r="60" fill="' + D.rad([[0, '#ffffff', .95], [.25, C5, .75], [.6, C3, .3], [1, C2, 0]], .5, .5, .5) + '"/>' +
    '<circle cx="250" cy="266" r="20" fill="none" stroke="' + C5 + '" stroke-width="2" opacity=".6"/><circle cx="250" cy="266" r="30" fill="none" stroke="' + C4 + '" stroke-width="1.4" opacity=".45" stroke-dasharray="3 6"/>' +
    F('M250 252 C 256 259 262 266 250 282 C 238 266 244 259 250 252 Z', '#ffffff') + F(scintD(250, 268, 16), '#ffffff', op(.9)) +
    piv('x-pf', 250, 266, '<circle cx="250" cy="266" r="24" fill="none" stroke="#ffffff" stroke-width="3"/><circle cx="250" cy="266" r="34" fill="none" stroke="' + C4 + '" stroke-width="2" opacity=".7"/>'));
  s.coeur = piv('coeur', 250, 266, piv('x-coeur', 250, 266, co) + ancre('pointfaible', 250, 266) + ancre('centre', 250, 236));
  /* ---- le visage malicieux ---- */
  var v = '';
  var o1 = 'M198 188 C 204 172 228 166 240 180 C 232 192 210 196 198 188 Z', o2 = 'M252 176 C 258 160 282 156 292 170 C 284 182 262 186 252 176 Z';
  var gP = D.rad([[0, '#ffffff'], [.4, C4, .7], [1, C3, 0]], .5, .5, .5);
  function oeil(nom, d, cx, cy, ligne){
    var pu = '<circle cx="' + cx + '" cy="' + cy + '" r="11" fill="' + gP + '"/><ellipse cx="' + cx + '" cy="' + cy + '" rx="2.8" ry="5.4" fill="#ffffff"/>';
    var rouge = vari('rouge', '<circle cx="' + cx + '" cy="' + cy + '" r="12" fill="' + D.doux('#ff3a30', .9) + '"/><ellipse cx="' + cx + '" cy="' + cy + '" rx="3.2" ry="5.6" fill="#ffe0c0"/>');
    return piv(nom, cx, cy + 2, F(d, NUIT) + piv(nom === 'oeilG' ? 'pupG' : 'pupD', cx, cy, pu + rouge) + L(ligne, C5, 1.4, op(.7)));
  }
  v += piv('sourcilG', 216, 160, F('M196 166 C 204 154 222 150 236 160 C 222 158 208 162 198 170 Z', NUIT, op(.85)) + L('M200 166 C 208 158 220 156 230 160', C5, 1, op(.6)));
  v += piv('sourcilD', 272, 148, F('M252 152 C 262 140 280 136 292 146 C 280 146 266 150 254 158 Z', NUIT, op(.85)));
  v += oeil('oeilG', o1, 208, 182, 'M200 190 C 212 196 228 194 238 184') + oeil('oeilD', o2, 261, 171, 'M254 178 C 264 184 280 182 290 174');
  v += vari('plisse', F('M196 188 C 206 176 226 174 240 182 C 228 186 210 188 198 192 Z', C3, op(.95)) + L('M198 186 Q 218 176 240 182', NUIT, 3.4) + F('M250 176 C 260 164 280 162 292 170 C 280 174 264 176 252 180 Z', C3, op(.95)) + L('M252 175 Q 272 164 292 170', NUIT, 3.4));
  /* la bouche : le sourire en coin (d'habitude) ou la gueule grande ouverte (il crache, il crie) */
  var dents = '', dx = [206, 214, 223, 232, 241, 250, 259, 268];
  dx.forEach(function(x, i){ var y = 214 + Math.sin((x - 198) / 84 * Math.PI) * 8 - (x > 250 ? (x - 250) * .5 : 0); dents += 'M' + (x - 3.4) + ' ' + f1(y) + ' L ' + x + ' ' + f1(y + 6 - Math.abs(i - 3.5) * .5) + ' L ' + (x + 3.4) + ' ' + f1(y + .6) + ' Z '; });
  var sourire = F('M198 210 C 212 222 236 228 258 220 C 270 216 278 206 282 196 C 280 214 268 232 248 238 C 226 242 208 230 198 210 Z', NUIT) +
    F('M222 232 C 230 222 246 224 252 232 C 244 240 230 240 222 232 Z', C3) + L('M228 232 C 234 228 242 228 248 232', C5, 1, op(.8)) + F(dents, '#f0feff') +
    L('M196 206 C 198 210 200 212 202 212', NUIT, 2.4) + L('M280 192 C 284 192 286 194 286 198', NUIT, 2.4);
  var crache = F('M208 204 C 220 196 256 194 270 206 C 276 222 266 246 240 250 C 216 250 202 234 208 204 Z', NUIT) +
    F('M216 236 C 226 226 252 226 262 238 C 252 248 228 250 216 236 Z', C3) + F('M216 206 L 222 214 L 228 206 Z M236 204 L 242 213 L 248 204 Z M254 205 L 260 213 L 265 207 Z', '#f0feff') +
    '<ellipse cx="238" cy="224" rx="14" ry="9" fill="' + D.doux(C5, .7) + '"/>';
  v += piv('bouche', 240, 220, vari('sourire', sourire, 1) + vari('crache', crache));
  v += ancre('tete', 244, 176) + ancre('bouche', 238, 226) + ancre('haut', 296, 6);
  s.visage = piv('visage', 244, 200, v);
  /* ---- le bras qui appelle : « viens par ici… » (bras > main > le doigt qui se replie) ---- */
  var bras = tube([[204, 236], [176, 238], [148, 228], [126, 210]], [26, 18, 13, 11]).d;
  var ba = F(tube([[204, 236], [176, 238], [148, 228], [126, 210]], [40, 30, 24, 22]).d, C2, op(.14)) + F(bras, D.lin([[0, C4, .75], [1, C3, .55]], 0, 0, 1, 1)) + L(bras, C5, 1.6, op(.6));
  ba += vari('visible', L(bras, FUMEE, 6, op(.5)) + L(bras, '#ffffff', 1.8, op(.85)));
  var main = 'M114 216 C 108 204 116 192 128 194 C 140 196 144 208 138 218 C 132 224 120 224 114 216 Z';
  var doigts = [tube([[134, 200], [142, 186], [144, 172], [140, 162]], [8.5, 7.5, 6, 4]).d, tube([[126, 196], [126, 180], [130, 168], [127, 158]], [9, 8, 6.5, 4]).d, tube([[118, 214], [104, 214], [96, 207]], [9, 7, 4.4]).d];
  var index = tube([[118, 200], [108, 190], [104, 178], [110, 172], [116, 176], [113, 182]], [9, 8, 7, 6, 5, 3.4]).d;
  var ma = douce(D, 122, 190, 30, 30, C3, .35) + F(main, C5, op(.93)) + doigts.map(function(dd){ return F(dd, C5, op(.93)); }).join('');
  ma += L(main.replace(/ Z$/, ''), '#ffffff', 1, op(.5)) + L('M127 192 C 127 180 129 170 128 162 M135 198 C 141 186 143 176 141 166', '#ffffff', 1.4, op(.8)) + L('M112 208 C 112 216 120 222 130 220', C3, 1.4, op(.45));
  ma += vari('visible', L(main, '#ffffff', 2, op(.9)));
  ma += vari('colle', Gt('translate(128 204) scale(.9)', PATE));
  ma += piv('doigt', 118, 202, F(index, C5, op(.93)) + L('M118 200 C 110 192 106 182 109 175', '#ffffff', 1.4, op(.8)) + vari('visible', L(index, '#ffffff', 1.6, op(.85))));
  ma += ancre('main', 124, 180);
  s.bras = piv('bras', 204, 236, ba + piv('main', 126, 212, ma));
  /* ---- les étincelles autour (elles scintillent) et la poussière lumineuse (elle tourne lentement) ---- */
  var sc = '';
  [[150, 120, 9, .9], [340, 70, 7, .7], [110, 270, 6, .7], [380, 220, 8, .45], [200, 60, 5, .8], [430, 130, 6, .35], [170, 330, 5, .6], [92, 160, 4, .7]].forEach(function(e, i){
    sc += Gt('translate(' + e[0] + ' ' + e[1] + ')', piv('x-sc' + i, 0, 0, '<circle r="' + (e[2] * 2.6) + '" fill="' + D.doux(C3, .5) + '" fill-opacity="' + fo(e[3] * .6) + '"/>' + F(scintD(0, 0, e[2]), C5, op(e[3]))));
  });
  var R2 = rng(5), pA = '', pB = '';
  for(var k2 = 0; k2 < 26; k2++){ var a = R2() * Math.PI * 2, rr = 110 + R2() * 70, x2 = 250 + Math.cos(a) * rr * 1.1, y2 = 200 + Math.sin(a) * rr * .9, r2 = .8 + R2() * 1.8, o2b = .3 + R2() * .5, dd2 = 'M' + f1(x2 - r2) + ' ' + f1(y2) + ' a ' + f1(r2) + ' ' + f1(r2) + ' 0 1 0 ' + f1(2 * r2) + ' 0 a ' + f1(r2) + ' ' + f1(r2) + ' 0 1 0 ' + f1(-2 * r2) + ' 0 Z '; if(R2() < .5) pA += dd2; else pB += dd2; }
  s.etincelles = sc + piv('poussiere', 250, 200, F(pA, C5, op(.6)) + F(pB, C4, op(.5)));
  /* ---- au-dessus : les étoiles (ébloui) ---- */
  var eb = '';
  for(var ie = 0; ie < 4; ie++) eb += piv('x-eb' + ie, 0, 0, '<circle r="30" fill="' + D.doux('#fff6c0', .6) + '"/><path d="' + etoileD(22 - (ie % 2) * 5, 5, .45) + '" fill="#ffe466" stroke="' + O + '" stroke-width="3"/>');
  s.etoiles = vari('etoiles', eb);
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
var Z = {x: 0, y: 0, a: 0, sx: 1, sy: 1}, VB = {x: 40, y: -40, w: 460, h: 520};
function r3(n){ return Math.round(n * 1000) / 1000; }
function tf(v){ return 'translate(' + r3(v.x) + 'px,' + r3(v.y) + 'px) rotate(' + r3(v.a) + 'deg) scale(' + r3(v.sx) + ',' + r3(v.sy) + ')'; }
function fusion(a, b){ var o = {x: a.x, y: a.y, a: a.a, sx: a.sx, sy: a.sy}; if(b){ for(var k in o) if(b[k] != null) o[k] = b[k]; if(b.s != null){ o.sx = b.s; o.sy = b.s; } } return o; }
function attendreMs(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }
function fini(a){ return a && a.finished ? a.finished.then(function(){}, function(){}) : Promise.resolve(); }
function hasard(a, b){ return a + Math.random() * (b - a); }
function choisir(l){ return l[Math.floor(Math.random() * l.length)]; }
function T(x, y, s, a){ return 'translate(' + f1(x) + 'px,' + f1(y) + 'px)' + (a != null ? ' rotate(' + f1(a) + 'deg)' : '') + (s != null ? ' scale(' + s + ')' : ''); }

function Follet(conteneur, options){
  injecterCSS();
  this.c = conteneur; this.opt = options || {};
  this.num = ++NUM;
  var D = new Defs('btFF' + this.num + '_'), s = dessiner(D);
  var X = CENTRE[0], Y = CENTRE[1];
  /* la chaîne : pos (place, élan) > flotte (il monte et descend) > secousse > posture (retourné) > taille (il grandit) */
  var chaine = piv('pos', X, Y, piv('flotte', X, Y, piv('secousse', X, Y, piv('posture', X, Y, piv('taille', 250, 300,
    s.fumeeA + s.halo + s.traine + s.queue + s.corps + s.coeur + s.visage + s.bras + s.etincelles + s.fumeeB + Gt('translate(250 40)', s.etoiles) + ancre('pieds', 250, 330))))));
  var div = document.createElement('div');
  div.className = PX;
  div.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + VB.x + ' ' + VB.y + ' ' + VB.w + ' ' + VB.h + '" preserveAspectRatio="xMidYMax meet"><defs>' + D.l.join('') + '</defs>' +
    '<g data-slot="restes"></g>' + sansOpacite(s.reflet + vari('bete', chaine, 1)) + '<g data-slot="monde"></g></svg>';
  conteneur.appendChild(div);
  this.el = div; this.svg = div.querySelector('svg'); this.defs = this.svg.querySelector('defs'); D.vivant = this.defs; this.D = D;
  var self = this;
  this.J = {}; this.V = {}; this.K = {}; this.A = {}; this.S = {};
  [].forEach.call(this.svg.querySelectorAll('[data-j]'), function(e){ var n = e.getAttribute('data-j'), r = n.indexOf('v-') === 0 ? self.V : (n.indexOf('x-') === 0 ? self.K : self.J); if(r !== self.J) n = n.slice(2); (r[n] = r[n] || []).push(e); });
  [].forEach.call(this.svg.querySelectorAll('[data-a]'), function(e){ self.A[e.getAttribute('data-a')] = e; });
  [].forEach.call(this.svg.querySelectorAll('[data-slot]'), function(e){ self.S[e.getAttribute('data-slot')] = e; });
  this.v = {}; this.boucles = []; this.boucX = {}; this.minuteurs = []; this.nbP = 0; this.vitesse = 1;
  this.etat = {enrage: false, brule: false, colle: false, ebloui: false, gele: false, ouvert: false, dos: false, cible: false, visible: false, grand: false, accroche: false};
  this.attente = true; this.jeton = 0; this.enAction = false; this.mort = false;
  this._vie(true);
  this._reprendre(0);
}
var R = Follet.prototype;
R._lire = function(n){
  var el = this.J[n][0], ref = this.v[n] || Z, t = getComputedStyle(el).transform;
  if(!t || t === 'none') return fusion(Z);
  var m = t.match(/matrix\(([^)]+)\)/); if(!m) return fusion(ref);
  var v = m[1].split(',').map(parseFloat), sx = Math.hypot(v[0], v[1]), ang = Math.atan2(v[1], v[0]) * 180 / Math.PI, sy = (v[0] * v[3] - v[1] * v[2]) / (sx || 1);
  while(ang - ref.a > 180) ang -= 360; while(ang - ref.a < -180) ang += 360;
  if(sy < 0 && ref.sy > 0){ sy = -sy; sx = -sx; ang += 180; while(ang - ref.a > 180) ang -= 360; while(ang - ref.a < -180) ang += 360; }
  return {x: v[4], y: v[5], a: ang, sx: sx, sy: sy};
};
R._figer = function(){ var self = this; Object.keys(this.J).forEach(function(n){ var v = self._lire(n); self.J[n].forEach(function(el){ el.getAnimations().forEach(function(a){ if(!a.__opac) a.cancel(); }); el.style.transform = tf(v); }); self.v[n] = v; }); };
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
/* l'opacité d'une pièce (pour s'éteindre) : une animation à part, qui garde sa valeur */
R._opac = function(n, frames, duree, o){ o = o || {}; var l = []; (this.J[n] || this.K[n] || []).forEach(function(el){ var a = el.animate(frames, {duration: duree, delay: o.delai || 0, easing: o.e || 'ease-in-out', fill: 'forwards'}); a.__opac = true; l.push(a); }); return Promise.all(l.map(fini)); };
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
R._part = function(html, parent){
  var self = this, g = document.createElementNS(NS, 'g');
  g.innerHTML = html;
  if(this.nbP < 24){ (parent || this.S.monde).appendChild(g); this.nbP++; g.remove = function(){ if(g.parentNode){ self.nbP--; Element.prototype.remove.call(g); } }; }
  return g;
};
R._vole = function(html, frames, o){ o = o || {}; var g = this._part(html); var a = g.animate(frames, {duration: o.duree || 600, delay: o.delai || 0, easing: o.e || 'ease-out', fill: 'both'}); a.finished.then(function(){ g.remove(); }, function(){ g.remove(); }); return g; };

/* =====================================================================
   5. Les poses, l'attente
   ===================================================================== */
var LG = ['langue0', 'langue1', 'langue2', 'langue3'];
R._base = function(){
  var p = {}, e = this.etat;
  if(e.grand) p.taille = fusion(Z, {s: 1.26});
  if(e.dos) p.posture = fusion(Z, {a: 180, y: -20});
  if(e.gele){ LG.forEach(function(n){ p[n] = fusion(Z, {sy: .72, sx: .9}); }); p.corps = fusion(Z, {sx: .95, sy: .92}); }
  if(e.ebloui){ p.bras = fusion(Z, {a: 84, sx: .72, sy: .9}); p.main = fusion(Z, {a: -30}); p.visage = fusion(Z, {a: 6}); }
  if(e.accroche){ p.corps = fusion(Z, {sx: 1.04, sy: .96}); }
  return p;
};
R._reprendre = function(duree){
  var self = this;
  if(this.mort) return Promise.resolve();
  this._couperBoucles();
  return this._allerA(this._base(), duree == null ? 300 : duree, null, true).then(function(){ if(!self.enAction && !self.mort && self.attente) self._lancerBoucles(); });
};
R._boucle = function(b, n, deltas, duree, o){
  o = o || {};
  var v0 = fusion(Z, b[n]);
  var cles = deltas.map(function(d){ var p = {}; p[n] = {}; for(var k in d[1]) p[n][k] = (k === 'sx' || k === 'sy') ? v0[k] * d[1][k] : v0[k] + d[1][k]; return {t: d[0], p: p, e: o.e}; });
  return this._seq(cles, duree, {boucle: true, vitesse: o.vitesse || this.vitesse, depuis: b, delai: o.delai || 0});
};
/* la flamme qui ondule : chaque langue se balance et s'étire, avec un temps de retard sur sa voisine */
R._onduler = function(b, V, ampl){
  var self = this, A = ampl || 1;
  [[1000, 6, 1.1, 0], [1180, 5, 1.12, -260], [1080, 4, 1.09, -520], [1260, 6, 1.1, -380]].forEach(function(q, i){
    self._boucle(b, 'langue' + i, [[0, {a: 0, sx: 1, sy: 1}], [.25, {a: q[1] * A, sx: .96, sy: 1 + (q[2] - 1) * A}], [.5, {a: 0, sx: 1.02, sy: 1}], [.75, {a: -q[1] * .7 * A, sx: .97, sy: 1 + (q[2] - 1) * .6 * A}], [1, {a: 0, sx: 1, sy: 1}]], q[0], {vitesse: V, delai: q[3]});
  });
  this._boucle(b, 'corps', [[0, {sx: 1, sy: 1}], [.5, {sx: 1.03, sy: .975}], [1, {sx: 1, sy: 1}]], 1400, {vitesse: V});
};
R._lancerBoucles = function(){
  var self = this, b = this._base(), e = this.etat;
  this.vitesse = e.enrage ? 1.5 : (e.gele ? .4 : (e.grand ? 1.25 : 1));
  var V = this.vitesse;
  function boucle(n, d, duree, o){ return self._boucle(b, n, d, duree, o); }
  this._onduler(b, V, e.grand ? 1.4 : (e.gele ? .4 : 1));
  boucle('flotte', [[0, {y: 0}], [.5, {y: -12}], [1, {y: 0}]], 2600, {vitesse: 1});
  boucle('reflet', [[0, {x: 0, sx: 1, sy: 1}], [.25, {x: 6, sx: .97}], [.5, {x: 0, sx: .94, sy: .94}], [.75, {x: -6, sx: .97}], [1, {x: 0, sx: 1, sy: 1}]], 2600, {vitesse: 1});
  boucle('pos', [[0, {x: 0}], [.3, {x: 7}], [.7, {x: -7}], [1, {x: 0}]], 4200, {vitesse: 1});
  boucle('queue', [[0, {a: 0}], [.5, {a: 7}], [1, {a: 0}]], 1700);
  boucle('queueB', [[0, {a: 0}], [.5, {a: -14}], [1, {a: 0}]], 1300, {delai: -300});
  boucle('traine', [[0, {sx: 1, sy: 1, a: 0}], [.5, {sx: 1.1, sy: .95, a: -3}], [1, {sx: 1, sy: 1, a: 0}]], 2300);
  boucle('halo', [[0, {sx: 1, sy: 1}], [.5, {sx: 1.06, sy: 1.06}], [1, {sx: 1, sy: 1}]], 1800);
  boucle('poussiere', [[0, {a: 0}], [1, {a: 360}]], 26000, {vitesse: 1, e: 'linear'});
  if(!e.ebloui){
    boucle('bras', [[0, {a: 0}], [.5, {a: -5}], [1, {a: 0}]], 2400);
    boucle('main', [[0, {a: 0}], [.5, {a: 7}], [1, {a: 0}]], 2400, {delai: -400});
  }
  boucle('visage', [[0, {a: 0, y: 0}], [.5, {a: 2, y: -2}], [1, {a: 0, y: 0}]], 2600);
  boucle('pupG', [[0, {x: 0}], [.3, {x: -2}], [.6, {x: -2}], [.8, {x: 1}], [1, {x: 0}]], 4400); boucle('pupD', [[0, {x: 0}], [.3, {x: -2}], [.6, {x: -2}], [.8, {x: 1}], [1, {x: 0}]], 4400);
  if(e.enrage) boucle('secousse', [[0, {x: 0}], [.5, {x: 2.4}], [1, {x: 0}]], 110, {vitesse: 1});
  else if(e.cible || e.accroche) boucle('secousse', [[0, {x: 0}], [.5, {x: 1.2}], [1, {x: 0}]], 200, {vitesse: 1});
  this._planifier(700);
};
/* les boucles autonomes de la vie : le cœur bat, les étincelles scintillent, les flammèches s'échappent */
R._vie = function(on){
  this._couperX('coeur'); this._couperX('sc'); this._couperX('fm');
  if(!on) return;
  this._boucleX('coeur', [{transform: 'scale(1)'}, {offset: .15, transform: 'scale(1.1)'}, {offset: .3, transform: 'scale(.98)'}, {offset: .45, transform: 'scale(1.06)'}, {transform: 'scale(1)'}], 1100, {e: 'ease-in-out'});
  for(var i = 0; i < 8; i++) this._boucleX('sc' + i, [{transform: 'scale(.55)', opacity: .4}, {offset: .5, transform: 'scale(1.15) rotate(20deg)', opacity: 1}, {transform: 'scale(.55)', opacity: .4}], 1300 + i * 170, {e: 'ease-in-out', delai: -i * 230});
  for(var k = 0; k < 4; k++) this._boucleX('fm' + k, [{transform: 'translate(0px,10px) scale(.6)', opacity: 0}, {offset: .2, opacity: 1}, {transform: 'translate(' + (8 + k * 2) + 'px,-34px) scale(.3)', opacity: 0}], 1200 + k * 160, {e: 'ease-out', delai: -k * 300});
};
R._planifier = function(ms){ var self = this; this._minuteur(function(){ if(self.enAction || self.mort || !self.attente) return; self._evenement(); self._planifier(hasard(1100, 2500)); }, ms); };
R._evenement = function(){
  var e = this.etat, l = ['appel', 'appel', 'appel', 'cligne', 'cligne', 'regard', 'rire', 'flambe', 'sourcil'];
  if(e.ebloui) l = ['cligne', 'flambe'];
  if(e.colle) l = l.concat(['secoue', 'secoue']);
  if(e.enrage) l = l.concat(['flambe', 'flambe']);
  this._joue(choisir(l));
};
R._joue = function(ev){
  var self = this, A = {ajout: true};
  if(ev === 'appel') return this._appel(1);
  if(ev === 'cligne') return this._seq([{t: 0, p: {oeilG: {sy: 1}, oeilD: {sy: 1}}}, {t: .45, p: {oeilG: {sy: .1}, oeilD: {sy: .1}}, e: 'ease-in'}, {t: 1, p: {oeilG: {sy: 1}, oeilD: {sy: 1}}, e: 'ease-out'}], 240, {ajout: false});
  if(ev === 'regard') return this._seq([{t: 0, p: {pupG: {x: 0}, pupD: {x: 0}, visage: {a: 0}}}, {t: .2, p: {pupG: {x: -4}, pupD: {x: -4}, visage: {a: -3}}}, {t: .6, p: {pupG: {x: -4}, pupD: {x: -4}}}, {t: .75, p: {pupG: {x: 2}, pupD: {x: 2}}}, {t: 1, p: {pupG: {x: 0}, pupD: {x: 0}, visage: {a: 0}}}], 1600, A);
  if(ev === 'rire') return this._rire(1);
  if(ev === 'sourcil') return this._seq([{t: 0, p: {sourcilG: {y: 0, a: 0}}}, {t: .25, p: {sourcilG: {y: -6, a: -8}}, e: 'cubic-bezier(.2,.9,.3,1)'}, {t: .75, p: {sourcilG: {y: -6, a: -8}}}, {t: 1, p: {sourcilG: {y: 0, a: 0}}}], 1100, A);
  if(ev === 'flambe'){ var i = Math.floor(Math.random() * 4), p = {}; p['langue' + i] = {sy: 1}; var p2 = {}; p2['langue' + i] = {sy: 1.35, a: 6}; var p3 = {}; p3['langue' + i] = {sy: 1}; return this._seq([{t: 0, p: p}, {t: .3, p: p2, e: 'cubic-bezier(.2,.9,.3,1)'}, {t: 1, p: p3}], 700, A); }
  if(ev === 'secoue') return this._seq([{t: 0, p: {main: {a: 0}, bras: {a: 0}}}, {t: .2, p: {main: {a: 20}, bras: {a: -10}}}, {t: .4, p: {main: {a: -16}, bras: {a: 8}}}, {t: .6, p: {main: {a: 18}, bras: {a: -8}}}, {t: 1, p: {main: {a: 0}, bras: {a: 0}}}], 700, A);
};
/* « viens… » : la main se tourne, le doigt se replie trois fois, le sourcil se lève */
R._appel = function(k){
  var A = {ajout: true}, c = [{t: 0, p: {doigt: {a: 0}, main: {a: 0}, bras: {a: 0}, sourcilG: {y: 0, a: 0}, visage: {a: 0}}}, {t: .12, p: {main: {a: -14}, bras: {a: -8}, sourcilG: {y: -5, a: -7}, visage: {a: -3}}, e: 'ease-out'}];
  for(var i = 0; i < 3; i++){ c.push({t: .18 + i * .24, p: {doigt: {a: 0}}}); c.push({t: .3 + i * .24, p: {doigt: {a: 42 * k}}, e: 'cubic-bezier(.4,0,.2,1)'}); }
  c.push({t: .9, p: {doigt: {a: 0}, main: {a: -10}, sourcilG: {y: -4, a: -6}}});
  c.push({t: 1, p: {doigt: {a: 0}, main: {a: 0}, bras: {a: 0}, sourcilG: {y: 0, a: 0}, visage: {a: 0}}});
  return this._seq(c, 1700 * k, A).fini;
};
/* un rire silencieux : la bouche s'ouvre et se ferme, il sautille, les langues dansent */
R._rire = function(k){
  var A = {ajout: true}, c = [{t: 0, p: {bouche: {sy: 1, sx: 1}, flotte: {y: 0}, visage: {a: 0}, sourcilG: {y: 0}, sourcilD: {y: 0}}}];
  for(var i = 0; i < 4; i++){ c.push({t: .1 + i * .2, p: {bouche: {sy: 1.3, sx: 1.06}, flotte: {y: -8}, visage: {a: i % 2 ? 3 : -3}, sourcilG: {y: -4}, sourcilD: {y: -4}}, e: 'ease-out'}); c.push({t: .2 + i * .2, p: {bouche: {sy: .95, sx: 1}, flotte: {y: 0}}, e: 'ease-in'}); }
  c.push({t: 1, p: {bouche: {sy: 1, sx: 1}, flotte: {y: 0}, visage: {a: 0}, sourcilG: {y: 0}, sourcilD: {y: 0}}});
  this._fondu('plisse', 1, 100);
  var self = this;
  setTimeout(function(){ if(!self.etat.ebloui) self._fondu('plisse', 0, 150); }, 1100 * k);
  return this._seq(c, 1200 * k, A).fini;
};

/* =====================================================================
   6. Petits effets
   ===================================================================== */
R._flash = function(nom, o, ms){
  (this.V[nom || 'flash'] || []).forEach(function(e){ e.getAnimations().forEach(function(a){ a.cancel(); }); e.setAttribute('opacity', 0); e.removeAttribute('visibility'); e.animate([{opacity: o || .8}, {opacity: 0}], {duration: ms || 320, easing: 'steps(3, end)'}).finished.then(function(){ if(+e.getAttribute('opacity') <= 0) e.setAttribute('visibility', 'hidden'); }, function(){}); });
};
R._eclat = function(p, k, coul){ k = k || 1; this._vole('<path d="' + etoileD(26 * k, 8, .42) + '" fill="' + (coul || C5) + '" stroke="' + O + '" stroke-width="2.4"/><path d="' + etoileD(11 * k, 8, .5) + '" fill="#ffffff"/>', [{transform: T(p[0], p[1], .3, 0), opacity: 1}, {offset: .3, transform: T(p[0], p[1], 1.1, 10)}, {transform: T(p[0], p[1], 1.3, 20), opacity: 0}], {duree: 400}); };
R._etincelles = function(p, n, coul, k, o){
  o = o || {};
  for(var i = 0; i < n; i++){
    var a = o.haut ? -Math.PI * hasard(.15, .85) : Math.random() * Math.PI * 2, v = hasard(30, 80) * (k || 1), r = hasard(2.5, 5);
    this._vole(F(scintD(0, 0, r * 1.8), choisir(coul || [C5, C4, '#ffffff'])), [{transform: T(p[0], p[1], 1), opacity: 1}, {transform: T(p[0] + Math.cos(a) * v, p[1] + Math.sin(a) * v + (o.tombe || 0), .4, 90), opacity: 0}], {duree: hasard(450, 800), delai: o.delai, e: 'cubic-bezier(.1,.7,.4,1)'});
  }
};
R._bouffee = function(p, o){
  o = o || {};
  var r = o.r || 12;
  return this._vole('<circle r="' + r + '" fill="' + (o.c || FUMEE) + '" fill-opacity="' + (o.o || .5) + '"/><circle cx="' + f1(-r * .3) + '" cy="' + f1(-r * .3) + '" r="' + f1(r * .5) + '" fill="#ffffff" fill-opacity=".3"/>',
    [{transform: T(p[0], p[1], o.s0 || .4), opacity: 0}, {offset: .15, opacity: 1}, {transform: T(p[0] + (o.dx || 0), p[1] + (o.dy == null ? -30 : o.dy), o.s1 || 1.7), opacity: 0}], {duree: o.duree || 1000, delai: o.delai, e: 'cubic-bezier(.2,.7,.4,1)'});
};
/* une volute de fumée qui monte en s'enroulant */
R._volute = function(p, o){
  o = o || {};
  var d = 'M0 0 C -10 -14 10 -26 0 -40 C -8 -50 4 -60 12 -56';
  return this._vole(L(d, '#a8a2b8', 6, op(.35)) + L(d, '#e4e0f0', 2.4, op(.7)), [{transform: T(p[0], p[1], .5), opacity: 0}, {offset: .2, opacity: 1}, {transform: T(p[0] + (o.dx || 10), p[1] - 70, 1.3, 20), opacity: 0}], {duree: o.duree || 1400, delai: o.delai, e: 'ease-out'});
};
R._etoiles = function(on){
  this._couperX('eb');
  if(!on){ this._fondu('etoiles', 0, 200); return; }
  this._fondu('etoiles', 1, 200);
  for(var k = 0; k < 4; k++){
    var fr = [];
    for(var s = 0; s <= 12; s++){ var a = s / 12 * Math.PI * 2 + k * Math.PI / 2, d = Math.sin(a); fr.push({transform: T(Math.cos(a) * 90, d * 22, f1(.75 + d * .3), s * 30), opacity: fo(.55 + d * .45)}); }
    this._boucleX('eb' + k, fr, 1200);
  }
};
R._feu = function(on){
  this._couperX('fl');
  this._fondu('feu', on ? 1 : 0, 250);
  if(on) for(var k = 0; k < 3; k++) this._boucleX('fl' + k, [{transform: 'scale(1,1)'}, {offset: .4, transform: 'scale(.86,1.2)'}, {transform: 'scale(1.06,.9)'}], 280 + k * 50, {dir: 'alternate', e: 'ease-in-out', delai: -k * 90});
};
/* le cœur qui palpite (point faible ouvert) : visible, accroche, ou ouvert */
R._majCoeur = function(){
  var e = this.etat, on = !this.mort && (e.ouvert || e.visible || e.accroche);
  if(on === !!this._pfOn) return;
  this._pfOn = on;
  this._couperX('pf');
  this._fondu('pf', on ? 1 : 0, 300);
  if(on) this._boucleX('pf', [{transform: 'scale(.8)', opacity: 1}, {transform: 'scale(1.5)', opacity: 0}], 820, {e: 'ease-out'});
};
R._majVisible = function(){
  var e = this.etat, on = !this.mort && (e.visible || e.accroche);
  if(on === !!this._visOn) { this._majCoeur(); return; }
  this._visOn = on;
  this._fondu('visible', on ? 1 : 0, 500);
  this._fumee(on);
  this._majCoeur();
};
R._fumee = function(on){
  this._couperX('fa'); this._couperX('fb');
  this._fondu('fumee', on ? 1 : 0, on ? 500 : 600);
  if(!on) return;
  for(var i = 0; i < 6; i++) this._boucleX('fa' + i, [{transform: 'translate(0px,0px) scale(.9)', opacity: .7}, {transform: 'translate(' + (i % 2 ? 12 : -12) + 'px,-10px) scale(1.12)', opacity: 1}], 1800 + i * 260, {dir: 'alternate', e: 'ease-in-out', delai: -i * 300});
  for(var k = 0; k < 3; k++) this._boucleX('fb' + k, [{transform: 'translate(0px,0px) scale(.85)', opacity: .5}, {transform: 'translate(' + (k % 2 ? -10 : 10) + 'px,-8px) scale(1.15)', opacity: 1}], 2000 + k * 300, {dir: 'alternate', e: 'ease-in-out'});
};
R._runes = function(on){
  this._couperX('ru');
  this._fondu('runes', on ? 1 : 0, on ? 200 : 500);
};

/* =====================================================================
   7. Les actions
   ===================================================================== */
R._debutAction = function(){ this.jeton++; this.enAction = true; this._couperBoucles(); return this.jeton; };
R._finAction = function(j, d){ if(j !== this.jeton || this.mort) return Promise.resolve(); this.enAction = false; return this._reprendre(d); };
function toutes(p){ var o = {}; LG.forEach(function(n){ o[n] = p; }); return o; }
function melange(){ var o = {}; for(var i = 0; i < arguments.length; i++){ var a = arguments[i]; for(var n in a){ o[n] = o[n] || {}; for(var k in a[n]) o[n][k] = a[n][k]; } } return o; }

/* il arrive : une étincelle flotte jusqu'à sa place, s'allume, et la flamme jaillit */
R.entrer = function(){
  var self = this, j = this._debutAction(), T0 = 1600;
  this.el.style.visibility = '';
  var k = [{t: 0, p: melange({pos: {x: 260, y: -40}, taille: {s: .08}, reflet: {x: 260, sx: .2, sy: .2}, bras: {a: -60, sx: .3}, visage: {s: .4}}, toutes({sy: .2, sx: .5}))},
    {t: .45, p: {pos: {x: 10, y: 10}, taille: {s: .12}, reflet: {x: 10, sx: .3, sy: .3}}, e: 'cubic-bezier(.3,.6,.4,1)'},
    {t: .55, p: {taille: {s: .1}}, e: 'ease-in'},
    /* WHOUSH : la flamme jaillit */
    {t: .7, p: melange({pos: {x: 0, y: -20}, taille: {s: 1.18}, reflet: {x: 0, sx: 1.2, sy: 1.2}, visage: {s: 1.1}}, toutes({sy: 1.4, sx: .95})), e: 'cubic-bezier(.1,.9,.3,1)'},
    {t: .84, p: melange({pos: {y: 4}, taille: {s: .94}, bras: {a: 10, sx: 1}, visage: {s: .98}}, toutes({sy: .9, sx: 1.03})), e: 'ease-in-out'},
    {t: 1, p: melange({pos: {x: 0, y: 0}, taille: {s: 1}, reflet: {x: 0, sx: 1, sy: 1}, bras: {a: 0}, visage: {s: 1}}, toutes({sy: 1, sx: 1})), e: 'cubic-bezier(.4,0,.3,1.3)'}];
  this._seq(k, T0);
  this._fondu('bete', 1, 0);
  this.V.bete[0].animate([{opacity: 0}, {opacity: 1, offset: .15}, {opacity: 1}], {duration: 600});
  setTimeout(function(){ var c = self._ou('centre'); self._etincelles(c, 12, null, 1.6); self._vole('<circle r="70" fill="' + self.D.doux(C5, .9) + '"/>', [{transform: T(c[0], c[1], .2), opacity: 1}, {transform: T(c[0], c[1], 2.2), opacity: 0}], {duree: 500}); }, T0 * .68);
  return attendreMs(T0).then(function(){ return self._finAction(j, 200); }).then(function(){ if(!self.enAction && !self.mort) self._appel(1); });
};

/* le point visé (dans le repère du dessin) */
R._cible = function(o, i){
  var v = o && o.vers;
  if(Array.isArray(v)) v = v[Math.min(i, v.length - 1)];
  if(v && v.x != null){ var q = this._versMonde(v); if(!Array.isArray(o.vers) && i) q = [q[0] + 180, q[1]]; return q; }
  return [[-700, 300], [-460, 300]][i ? 1 : 0];
};
/* LA BRÛLURE FROIDE : il s'étire, prend son souffle, et crache une langue de flamme bleue qui se sépare en deux */
R.attaquer = function(nom, o){
  if(typeof nom === 'object' && nom){ o = nom; nom = null; }
  o = o || {};
  var self = this, j = this._debutAction(), T0 = 2100, impactOk, impact = new Promise(function(r){ impactOk = r; });
  function t(ms){ return ms / T0; }
  var k = [{t: 0, p: {}},
    /* il s'étire vers le haut, se penche en arrière, le bras se replie : il prend son souffle */
    {t: t(480), p: melange({corps: {sx: .88, sy: 1.22}, posture: {a: 9}, pos: {x: 24, y: -10}, bras: {a: -34}, main: {a: 20}, sourcilG: {y: 4, a: 10}, sourcilD: {y: 4, a: -10}, bouche: {sy: .8}, halo: {s: 1.15}, coeur: {s: 1.2}}, toutes({sy: 1.35, sx: .9})), e: 'cubic-bezier(.3,.6,.3,1)'},
    {t: t(560), p: melange({corps: {sx: .86, sy: 1.25}, posture: {a: 11}}, toutes({sy: 1.42})), e: 'ease-in-out'},
    /* HAAA : il se jette en avant, la gueule grande ouverte, le bras pointe */
    {t: t(640), p: melange({corps: {sx: 1.14, sy: .9}, posture: {a: -14}, pos: {x: -34, y: 6}, bras: {a: 14}, main: {a: -10}, bouche: {sy: 1.15}, halo: {s: 1.25}, coeur: {s: 1}}, toutes({sy: .82, sx: 1.08, a: -10})), e: 'cubic-bezier(.1,.9,.3,1)'},
    {t: t(1250), p: melange({corps: {sx: 1.1, sy: .92}, posture: {a: -12}, pos: {x: -30, y: 4}}, toutes({sy: .86, sx: 1.06, a: -8})), e: 'ease-in-out'},
    /* il se redresse, ravi */
    {t: t(1600), p: melange({corps: {sx: 1, sy: 1}, posture: {a: 0}, pos: {x: 0, y: 0}, bras: {a: 0}, main: {a: 0}, sourcilG: {y: 0, a: 0}, sourcilD: {y: 0, a: 0}, bouche: {sy: 1}, halo: {s: 1}}, toutes({sy: 1, sx: 1, a: 0})), e: 'cubic-bezier(.4,0,.3,1.2)'},
    {t: 1, p: {}}];
  this._seq(k, T0);
  /* le souffle : des étincelles aspirées vers sa bouche */
  setTimeout(function(){ var b = self._ou('bouche'); for(var i = 0; i < 5; i++){ var a = Math.PI * hasard(.6, 1.4), r = hasard(80, 130); self._vole(F(scintD(0, 0, 6), C5), [{transform: T(b[0] + Math.cos(a) * r, b[1] + Math.sin(a) * r * .7, 1), opacity: 0}, {offset: .3, opacity: 1}, {transform: T(b[0], b[1], .3), opacity: 0}], {duree: 420, delai: i * 50, e: 'ease-in'}); } }, T0 * t(100));
  setTimeout(function(){ self._fondu('sourire', 0, 0); self._fondu('crache', 1, 0); }, T0 * t(600));
  setTimeout(function(){ self._fondu('crache', 0, 0); self._fondu('sourire', 1, 0); }, T0 * t(1350));
  setTimeout(function(){
    /* une langue part de la bouche, l'autre de la main tendue : on voit bien les deux */
    var b = self._ou('bouche'), m = self._ou('main'), c0 = self._cible(o, 0), c1 = self._cible(o, 1);
    self._jet(m, c0, 0, function(){ if(o.onImpact) try{ o.onImpact(0); }catch(e){} impactOk(); });
    self._jet(b, c1, 110, function(){ if(o.onImpact) try{ o.onImpact(1); }catch(e){} });
  }, T0 * t(640));
  setTimeout(function(){ if(!self.mort) self._rire(.9); }, T0 * t(1650));
  var pr = attendreMs(T0).then(function(){ return self._finAction(j, 200); });
  pr.impact = impact;
  return pr;
};
/* une langue de flamme froide : elle jaillit de la bouche jusqu'au point visé, ondule, puis se retire */
R._jet = function(a, b, delai, contact){
  var self = this, dx = b[0] - a[0], dy = b[1] - a[1], Lg = Math.hypot(dx, dy), ang = Math.atan2(dy, dx) * 180 / Math.PI, k = Lg / 100;
  var d = 'M0 -14 C 8 -24 14 -16 20 -22 C 28 -30 34 -16 42 -20 C 50 -26 56 -12 64 -16 C 72 -20 78 -8 86 -10 C 94 -10 98 -4 104 0 C 98 4 94 10 86 10 C 78 8 72 20 64 16 C 56 12 50 26 42 20 C 34 16 28 30 20 22 C 14 16 8 24 0 14 C -6 8 -6 -8 0 -14 Z';
  var d2 = 'M0 -8 C 10 -14 18 -8 28 -12 C 40 -16 50 -8 62 -10 C 74 -12 86 -4 100 0 C 86 4 74 12 62 10 C 50 8 40 16 28 12 C 18 8 10 14 0 8 Z';
  var html = '<g>' + F(d, C2, op(.5)) + L(d, C4, 2, op(.6)) + F(d2, C3, op(.8)) + F('M0 -4 C 20 -6 40 -3 60 -4 C 76 -4 88 -2 98 0 C 88 2 76 4 60 4 C 40 3 20 6 0 4 Z', C5, op(.95)) + '</g>';
  var dur = 1000;
  function tr(s, sy){ return 'translate(' + f1(a[0]) + 'px,' + f1(a[1]) + 'px) rotate(' + f1(ang) + 'deg) scale(' + fo(k * s) + ',' + fo(sy) + ')'; }
  this._vole(html, [{transform: tr(.02, .5), opacity: .9}, {offset: .17, transform: tr(1.03, 1.1), opacity: 1, easing: 'ease-out'}, {offset: .3, transform: tr(.98, 1.35)}, {offset: .45, transform: tr(1.02, .95)}, {offset: .6, transform: tr(1, 1.25)}, {offset: .8, transform: tr(.7, .7), opacity: .8}, {transform: tr(.05, .3), opacity: 0}], {duree: dur, delai: delai, e: 'ease-in-out'});
  setTimeout(function(){ self._brulureFroide(b); if(contact) contact(); }, delai + dur * .17);
};
/* au contact : une gerbe de froid (étoile bleue, éclats de givre, une petite flamme bleue qui reste un instant) */
R._brulureFroide = function(p){
  this._eclat(p, 1.7, C4);
  for(var i = 0; i < 4; i++){ var a = -Math.PI * hasard(.1, .9), v = hasard(40, 80); this._vole('<path d="M0 -8 L 2 -2 L 8 0 L 2 2 L 0 8 L -2 2 L -8 0 L -2 -2 Z" fill="#eaf8ff" stroke="#3a7aa8" stroke-width="1.2"/>', [{transform: T(p[0], p[1], .4)}, {offset: .4, transform: T(p[0] + Math.cos(a) * v * .6, p[1] + Math.sin(a) * v, 1, 60)}, {transform: T(p[0] + Math.cos(a) * v, p[1] + 30, .8, 160), opacity: 0}], {duree: 800, e: 'cubic-bezier(.2,.6,.5,1)'}); }
  var fl = F(flammeD(60, 30), C2, op(.6)) + F(flammeD(42, 20), C3, op(.8)) + F(flammeD(24, 11), C5);
  this._vole(fl, [{transform: T(p[0], p[1] + 30, .4), opacity: 0}, {offset: .15, transform: T(p[0], p[1] + 30, 1.7), opacity: 1}, {offset: .4, transform: T(p[0], p[1] + 30, 1.5) + ' scale(1.1,.85)'}, {offset: .65, transform: T(p[0], p[1] + 30, 1.6) + ' scale(.9,1.15)'}, {transform: T(p[0], p[1] + 20, .6), opacity: 0}], {duree: 1000});
  this._vole('<circle r="60" fill="' + this.D.doux(C4, .7) + '"/>', [{transform: T(p[0], p[1], .3), opacity: 1}, {transform: T(p[0], p[1], 1.8), opacity: 0}], {duree: 500});
};

/* les réactions aux coups */
R._encaisse = function(k, T0){
  var self = this;
  this._fondu('plisse', 1, 0);
  setTimeout(function(){ if(!self.etat.ebloui) self._fondu('plisse', 0, 120); }, T0 * .5);
  return this._seq([{t: 0, p: melange({secousse: {x: 0, y: 0, a: 0}, corps: {sx: 1, sy: 1}, visage: {a: 0}, bras: {a: 0}}, toutes({a: 0, sy: 1}))},
    {t: .1, p: melange({secousse: {x: 20 * k, y: -6 * k, a: 6 * k}, corps: {sx: 1.08, sy: .88}, visage: {a: 8 * k}, bras: {a: -16}}, toutes({a: 14 * k, sy: .8})), e: 'cubic-bezier(.1,.9,.3,1)'},
    {t: .4, p: melange({secousse: {x: 6 * k, y: 0, a: -2}, corps: {sx: .97, sy: 1.05}, visage: {a: -3}, bras: {a: 4}}, toutes({a: -6, sy: 1.12}))},
    {t: 1, p: melange({secousse: {x: 0, y: 0, a: 0}, corps: {sx: 1, sy: 1}, visage: {a: 0}, bras: {a: 0}}, toutes({a: 0, sy: 1})), e: 'cubic-bezier(.4,0,.3,1.3)'}], T0, {ajout: true}).fini;
};
/* une flèche (ou une louche) qui le traverse de part en part : il ne la retient pas */
R._traverse = function(p, art, duree){
  this._vole(art, [{transform: T(p[0] - 230, p[1] + 8, null, -4), opacity: 1}, {offset: .5, transform: T(p[0], p[1], null, -4), opacity: 1}, {transform: T(p[0] + 260, p[1] - 10, null, -4), opacity: 0}], {duree: duree || 520, e: 'linear'});
};
var FLECHE = L('M-22 0 L 18 0', '#8a5a2a', 3.4) + P('M18 -5 L 28 0 L 18 5 Z', '#c8d0e0', ' stroke-width="1.4"') + P('M-22 0 L -30 -6 L -26 0 L -30 6 Z', '#e8e0d0', ' stroke-width="1.2"');
R.touche = function(type){
  var self = this;
  type = type || 'fleche';
  if(this.mort) return Promise.resolve();
  if(type === 'nuage') return this._toucheNuage();
  if(type === 'lumiere') return this._grandir(true);
  if(type === 'bouclier') return this._accroche({});
  if(type === 'fleche-argent') return this._toucheArgent();
  if(type === 'rebond') return this._rebond();
  var j = this._debutAction(), p = this._ou('centre'), A = {ajout: true}, T0 = 800, k = 1;
  if(type === 'fleche'){ this._traverse(p, FLECHE); this._eclat(p, .8, C4); this._etincelles(p, 5, null, .8); }
  else if(type === 'fleche-lourde'){ this._traverse(p, '<g transform="scale(1.4)">' + FLECHE + '</g>', 600); this._eclat(p, 1.3, C4); this._etincelles(p, 8); k = 1.5; T0 = 1000; }
  else if(type === 'dague'){ this._vole(L('M-26 -22 L 26 22 M26 -22 L -26 22', O, 8) + L('M-26 -22 L 26 22 M26 -22 L -26 22', '#ffffff', 4), [{transform: T(p[0], p[1], .2)}, {offset: .3, transform: T(p[0], p[1], 1)}, {transform: T(p[0], p[1], 1.1), opacity: 0}], {duree: 460}); this._etincelles(p, 6); }
  else if(type === 'feu'){
    /* le feu chaud sur la flamme froide : ça SIFFLE, de la vapeur blanche, il se recroqueville */
    this._flash('flash', .5); T0 = 1300;
    if(!this.etat.brule){ this._feu(true); setTimeout(function(){ if(!self.etat.brule) self._feu(false); }, 1100); }
    for(var i = 0; i < 6; i++) this._bouffee([p[0] + hasard(-60, 60), p[1] - hasard(30, 90)], {r: 14, c: '#f4f8ff', o: .7, dy: -50, delai: i * 90, duree: 1000});
    this._seq([{t: 0, p: {taille: {s: 1}}}, {t: .2, p: {taille: {s: .86}}}, {t: .6, p: {taille: {s: .9}}}, {t: 1, p: {taille: {s: 1}}}], 1300, A);
  }
  else if(type === 'louche'){ this._traverse([p[0], p[1] - 40], '<g transform="rotate(-30)">' + L('M-18 -2 L 10 -2 L 10 2 L -18 2 Z', '#c8c0b0', 3) + P('M10 -8 C 22 -8 24 8 10 8 C 14 4 14 -4 10 -8 Z', '#d8d0c0', ' stroke-width="1.6"') + '</g>', 600); setTimeout(function(){ if(!self.mort) self._rire(.8); }, 400); T0 = 1300; k = .5; }
  else if(type === 'colle'){ this._vole('<g transform="scale(1.4)">' + PATE + '</g>', [{transform: T(p[0] - 140, p[1] - 30, .3)}, {offset: .5, transform: T(p[0] - 60, p[1] - 30, 1)}, {transform: T(p[0] - 50, p[1] + 10, .9), opacity: 0}], {duree: 700}); }
  else if(type === 'huile'){
    /* l'huile sur une flamme : il s'embrase d'un coup (whoush), puis retombe */
    T0 = 1300; this._flash('flash', .6, 400);
    this._seq([{t: 0, p: melange({taille: {s: 1}}, toutes({sy: 1}))}, {t: .2, p: melange({taille: {s: 1.25}}, toutes({sy: 1.7})), e: 'cubic-bezier(.1,.9,.3,1)'}, {t: .55, p: melange({taille: {s: 1.15}}, toutes({sy: 1.4}))}, {t: 1, p: melange({taille: {s: 1}}, toutes({sy: 1}))}], 1300, A);
    this._etincelles([p[0], p[1] - 80], 12, null, 1.6, {haut: true});
  }
  else if(type === 'givre'){ this._flash('flashG', .85, 700); T0 = 1100; for(var g = 0; g < 6; g++){ var a = g / 6 * Math.PI * 2; this._vole('<path d="M0 -8 L 2 -2 L 8 0 L 2 2 L 0 8 L -2 2 L -8 0 L -2 -2 Z" fill="#eaf8ff" stroke="#5a8aa8" stroke-width="1.2"/>', [{transform: T(p[0], p[1], .3)}, {transform: T(p[0] + Math.cos(a) * 80, p[1] + Math.sin(a) * 60, 1, 90), opacity: 0}], {duree: 700}); } this._seq([{t: 0, p: toutes({sy: 1})}, {t: .2, p: toutes({sy: .6})}, {t: .7, p: toutes({sy: .7})}, {t: 1, p: toutes({sy: 1})}], 1100, A); }
  else if(type === 'acide'){ for(var b = 0; b < 6; b++) this._vole('<circle r="5" fill="#9aea4a" fill-opacity=".6" stroke="#3a6a1a" stroke-width="1.2"/>', [{transform: T(p[0] + hasard(-50, 50), p[1] + hasard(-30, 30), .2)}, {transform: T(p[0] + hasard(-50, 50), p[1] - 34, 1.3), opacity: 0}], {duree: 600, delai: b * 70}); }
  else if(type === 'bruit'){
    /* il vacille comme une bougie dans un courant d'air */
    T0 = 1200;
    var c = [{t: 0, p: toutes({a: 0})}];
    for(var n = 1; n <= 10; n++) c.push({t: n / 11, p: toutes({a: n % 2 ? 16 : -16, sy: n % 2 ? .8 : 1.1})});
    c.push({t: 1, p: toutes({a: 0, sy: 1})});
    this._seq(c, 1200, A);
    var q = this._ou('haut');
    for(var r = 0; r < 2; r++) this._vole('<circle r="40" fill="none" stroke="' + O + '" stroke-width="8"/><circle r="40" fill="none" stroke="#ffe066" stroke-width="4"/>', [{transform: T(q[0], q[1] + 120, .3), opacity: 1}, {transform: T(q[0], q[1] + 120, 2.4), opacity: 0}], {duree: 700, delai: r * 160});
  }
  else this._eclat(p, 1);
  if(type !== 'givre' && type !== 'feu' && type !== 'huile') this._flash('flash', .7);
  this._encaisse(k, T0);
  return attendreMs(T0).then(function(){ return self._finAction(j, 220); });
};
/* le nuage : de la fumée tout autour, il tousse trois fois, et sa silhouette se dessine dans la fumée → « visible » */
R._toucheNuage = function(){
  var self = this, j = this._debutAction(), c = this._ou('centre');
  for(var i = 0; i < 7; i++){ var a = i / 7 * Math.PI * 2; this._bouffee([c[0] + Math.cos(a) * 120, c[1] + Math.sin(a) * 90], {r: 34, c: '#b8b2c8', o: .55, dx: -Math.cos(a) * 60, dy: -Math.sin(a) * 50 - 10, s0: .6, s1: 1.6, duree: 1500, delai: i * 60}); }
  setTimeout(function(){ self.etat.visible = true; self._majVisible(); }, 500);
  return this._quintes().then(function(){ return self._finAction(j, 200); });
};
R.tousser = function(){ var self = this, j = this._debutAction(); return this._quintes().then(function(){ return self._finAction(j, 200); }); };
/* trois quintes, lentes : la flamme crachote, la bouche s'ouvre, une bouffée grise */
R._quintes = function(){
  var self = this, T0 = 2700, A = {ajout: true}, k = [{t: 0, p: melange({corps: {sx: 1, sy: 1}, visage: {a: 0, y: 0}, bouche: {sy: 1}, secousse: {x: 0}}, toutes({sy: 1, a: 0}))}];
  [.08, .4, .72].forEach(function(t, i){
    k.push({t: t, p: melange({corps: {sx: 1.12, sy: .84}, visage: {a: -8, y: 6}, bouche: {sy: 1.3}, secousse: {x: -8}}, toutes({sy: .7, a: -10})), e: 'cubic-bezier(.1,.9,.3,1)'});
    k.push({t: t + .14, p: melange({corps: {sx: 1, sy: 1}, visage: {a: 0, y: 0}, bouche: {sy: 1}, secousse: {x: 0}}, toutes({sy: 1, a: 0}))});
    setTimeout(function(){ if(self.mort) return; var p = self._ou('bouche'); for(var n = 0; n < 3; n++) self._bouffee([p[0] - 10 - n * 14, p[1] + 2 - n * 4], {r: 16 + n * 5, c: '#b4aec4', o: .7, dx: -40 - n * 10, dy: -16, s1: 1.9, duree: 1100, delai: n * 70}); self._fondu('plisse', 1, 0); setTimeout(function(){ if(!self.etat.ebloui) self._fondu('plisse', 0, 100); }, 300); }, T0 * t + 40);
  });
  k.push({t: 1, p: melange({corps: {sx: 1, sy: 1}, visage: {a: 0, y: 0}, bouche: {sy: 1}, secousse: {x: 0}}, toutes({sy: 1, a: 0}))});
  this._seq(k, T0, A);
  return attendreMs(T0);
};
/* la lumière : il la BOIT (la lumière file vers lui), ricane, et GRANDIT (+30 PV) → état « grand » */
R._grandir = function(boire){
  var self = this, j = this._debutAction(), c = this._ou('centre'), T0 = 1900, deja = this.etat.grand;
  if(boire){
    this._flash('flash', .9, 450);
    for(var i = 0; i < 10; i++){ var a = i / 10 * Math.PI * 2, r = hasard(140, 200); this._vole(F(scintD(0, 0, 9), '#ffffff') + '<circle r="10" fill="' + this.D.doux('#fffbe0', .8) + '"/>', [{transform: T(c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r, 1.2), opacity: 0}, {offset: .3, opacity: 1}, {transform: T(c[0], c[1], .3), opacity: 0}], {duree: 600, delai: i * 40, e: 'ease-in'}); }
  }
  this.etat.grand = true;
  var s1 = deja ? 1.4 : 1.4, s2 = 1.26;
  var k = [{t: 0, p: {}},
    {t: .3, p: melange({taille: {s: deja ? 1.2 : .9}, corps: {sx: 1.1, sy: .9}, sourcilG: {y: 5, a: 10}, sourcilD: {y: 5, a: -10}}, toutes({sy: .8})), e: 'ease-in'},
    {t: .5, p: melange({taille: {s: s1}, corps: {sx: .95, sy: 1.1}, halo: {s: 1.3}}, toutes({sy: 1.5, sx: .95})), e: 'cubic-bezier(.1,.9,.3,1)'},
    {t: .7, p: melange({taille: {s: s2 - .04}, corps: {sx: 1.03, sy: .97}}, toutes({sy: 1.05})), e: 'ease-in-out'},
    {t: 1, p: melange({taille: {s: s2}, corps: {sx: 1, sy: 1}, halo: {s: 1}, sourcilG: {y: 0, a: 0}, sourcilD: {y: 0, a: 0}}, toutes({sy: 1, sx: 1})), e: 'cubic-bezier(.4,0,.3,1.3)'}];
  this._seq(k, T0);
  setTimeout(function(){ self._fondu(['grand', 'haloG', 'refletG'], 1, 300); var q = self._ou('haut'); self._etincelles([q[0], q[1] + 60], 12, null, 1.8, {haut: true}); }, T0 * .48);
  setTimeout(function(){ if(!self.mort) self._rire(.9); }, T0 * .75);
  return attendreMs(T0).then(function(){ return self._finAction(j, 200); });
};
/* il s'accroche au bouclier de runes : il fonce, s'y colle, les runes restent sur lui, il se voit → « accroche » + « visible » */
R._accroche = function(o){
  var self = this, j = this._debutAction(), T0 = 2300, c = this._ou('centre');
  var mur = o && o.vers && o.vers.x != null ? this._versMonde(o.vers) : [c[0] - 210, c[1] - 10];
  var dx = Math.max(-320, Math.min(-60, mur[0] + 70 - c[0]));
  var rune1 = '<circle r="80" fill="' + this.D.doux('#8ff3ff', .5) + '"/><circle r="70" fill="none" stroke="#0a3a4a" stroke-width="8"/><circle r="70" fill="none" stroke="#8ff3ff" stroke-width="4"/><circle r="56" fill="none" stroke="#d8fdff" stroke-width="2" stroke-dasharray="6 8"/>' + L(RUNE[0], '#e8feff', 4, ' transform="scale(1.6)"');
  this._vole(rune1, [{transform: T(c[0] + dx - 60, c[1], .8) + ' scale(.55,1)', opacity: 0}, {offset: .1, opacity: 1, transform: T(c[0] + dx - 60, c[1], 1.7) + ' scale(.55,1)'}, {offset: .75, opacity: 1, transform: T(c[0] + dx - 60, c[1], 1.75) + ' scale(.55,1)'}, {transform: T(c[0] + dx - 60, c[1], 2) + ' scale(.55,1)', opacity: 0}], {duree: T0});
  var k = [{t: 0, p: {}},
    {t: .14, p: melange({pos: {x: 20}, corps: {sx: .9, sy: 1.1}, bras: {a: -20}}, toutes({a: 10})), e: 'ease-out'},
    /* il fonce vers la lumière des runes… */
    {t: .3, p: melange({pos: {x: dx, y: -6}, posture: {a: -12}, bras: {a: 20}, corps: {sx: 1.1, sy: .92}}, toutes({a: 18, sy: 1.15})), e: 'cubic-bezier(.5,0,.9,.6)'},
    /* … et s'y écrase, collé */
    {t: .36, p: melange({pos: {x: dx + 10}, posture: {a: 6}, corps: {sx: .74, sy: 1.18}, visage: {x: 6, a: 6}}, toutes({a: -6, sy: .9})), e: 'cubic-bezier(.1,.9,.3,1)'},
    {t: .48, p: melange({pos: {x: dx + 30}, corps: {sx: .9, sy: 1.05}, visage: {x: 0}}, toutes({a: 4})), e: 'ease-in-out'},
    {t: .58, p: melange({pos: {x: dx + 6}, corps: {sx: .8, sy: 1.12}}, toutes({a: -8})), e: 'ease-in-out'},
    {t: .68, p: melange({pos: {x: dx + 30}, corps: {sx: .92, sy: 1.04}}, toutes({a: 6})), e: 'ease-in-out'},
    /* il s'en arrache et revient à sa place, les runes collées sur lui */
    {t: 1, p: melange({pos: {x: 0, y: 0}, posture: {a: 0}, bras: {a: 0}, corps: {sx: 1.04, sy: .96}, visage: {x: 0, a: 0}}, toutes({a: 0, sy: 1})), e: 'cubic-bezier(.3,.6,.4,1)'}];
  this._seq(k, T0);
  setTimeout(function(){
    var q = self._ou('centre');
    self._etincelles([q[0] - 40, q[1]], 10, ['#8ff3ff', '#ffffff', '#d8fdff'], 1.2);
    self._flash('flash', .8, 380);
    self.etat.accroche = true; self.etat.visible = true;
    self._runes(true); self._majVisible();
  }, T0 * .36);
  return attendreMs(T0).then(function(){ return self._finAction(j, 200); });
};
/* la flèche d'argent : elle le touche même fermé. Une traînée argentée le traverse, il se DÉCHIRE en deux, puis se recoud */
R._toucheArgent = function(){
  var self = this, j = this._debutAction(), A = {ajout: true}, p = this._ou('centre'), T0 = 1700;
  var tr = '<path d="M-260 0 L 0 -3 L 40 0 L 0 3 Z" fill="#e8f0ff" stroke="#8a9ac8" stroke-width="1.4"/><path d="M-200 0 L 0 -1.2 L 30 0 L 0 1.2 Z" fill="#ffffff"/>';
  this._vole(tr, [{transform: T(p[0] - 260, p[1] + 10, null, -4) + ' scale(.3,1)', opacity: 0}, {offset: .2, opacity: 1}, {offset: .55, transform: T(p[0] + 60, p[1] - 6, null, -4) + ' scale(1,1)', opacity: 1}, {transform: T(p[0] + 260, p[1] - 18, null, -4) + ' scale(.6,.6)', opacity: 0}], {duree: 520, e: 'cubic-bezier(.3,.6,.4,1)'});
  this._flash('flash', .8, 380);
  this._fondu('plisse', 1, 0);
  setTimeout(function(){ if(!self.etat.ebloui) self._fondu('plisse', 0, 200); }, 1200);
  /* la déchirure : une fente argentée en zigzag au milieu, qui s'ouvre */
  var z = 'M0 -120 L 8 -90 L -6 -60 L 10 -30 L -8 0 L 8 30 L -4 60 L 6 80';
  setTimeout(function(){
    self._vole(L(z, O, 14) + L(z, '#ffffff', 8) + L(z, '#c8d8ff', 3), [{transform: T(p[0] + 20, p[1] + 10, null) + ' scale(1,.2)', opacity: 0}, {offset: .1, transform: T(p[0] + 20, p[1] + 10) + ' scale(1,1)', opacity: 1}, {offset: .5, transform: T(p[0] + 20, p[1] + 10) + ' scale(2.2,1)', opacity: 1}, {offset: .8, transform: T(p[0] + 20, p[1] + 10) + ' scale(.4,1)', opacity: .8}, {transform: T(p[0] + 20, p[1] + 10) + ' scale(.2,1)', opacity: 0}], {duree: 1300, e: 'ease-in-out'});
    self._eclat([p[0] + 20, p[1] - 10], 1.1, '#eef4ff');
  }, 200);
  /* puis il se recoud : des points d'argent le long de la couture */
  setTimeout(function(){ for(var i = 0; i < 5; i++) self._vole(L('M-8 -4 L 8 4', '#ffffff', 3) + L('M-8 4 L 8 -4', '#c8d8ff', 2), [{transform: T(p[0] + 20, p[1] - 100 + i * 40, .3), opacity: 0}, {offset: .3, transform: T(p[0] + 20, p[1] - 100 + i * 40, 1.2), opacity: 1}, {transform: T(p[0] + 20, p[1] - 100 + i * 40, .8), opacity: 0}], {duree: 600, delai: i * 70}); }, 850);
  /* les deux moitiés s'écartent puis se recollent */
  var g = {langue3: {x: -52, y: -14, a: -16}, langue2: {x: -38, y: -16, a: -10}, bras: {x: -46, y: 4, a: -12}, visage: {x: -36, y: -6, a: -10}, langue1: {x: 46, y: 8, a: 16}, langue0: {x: 54, y: 14, a: 18}, queue: {x: 36, y: 8, a: 12}, traine: {x: 44, sx: 1.25}, corps: {sx: 1.1, sy: .92}, coeur: {s: 1.35}};
  var z0 = {}; for(var n in g) z0[n] = {x: 0, y: 0, a: 0, sx: 1, sy: 1};
  this._seq([{t: 0, p: z0}, {t: .2, p: g, e: 'cubic-bezier(.1,.9,.3,1)'}, {t: .45, p: g}, {t: .62, p: z0, e: 'cubic-bezier(.6,0,.4,1)'}, {t: .7, p: {corps: {sx: .96, sy: 1.04}}}, {t: 1, p: z0}], T0, A);
  return attendreMs(T0).then(function(){ return self._finAction(j, 220); });
};
/* rebond : la flèche le traverse sans rien lui faire ; il agite le doigt (« non, non… ») et rit */
R._rebond = function(){
  var self = this, j = this._debutAction(), A = {ajout: true}, p = this._ou('centre'), T0 = 1900;
  this._traverse(p, FLECHE, 600);
  this._etincelles(p, 6, null, .7);
  var c = [{t: 0, p: {bras: {a: 0, sx: 1}, main: {a: 0}, doigt: {a: 0}, visage: {a: 0}}}, {t: .15, p: {bras: {a: 30}, main: {a: -40}, doigt: {a: -20}}, e: 'ease-out'}];
  for(var i = 0; i < 4; i++) c.push({t: .22 + i * .1, p: {main: {a: i % 2 ? -26 : -54}, visage: {a: i % 2 ? 3 : -3}}});
  c.push({t: .7, p: {bras: {a: 30}, main: {a: -40}}});
  c.push({t: 1, p: {bras: {a: 0, sx: 1}, main: {a: 0}, doigt: {a: 0}, visage: {a: 0}}});
  this._seq(c, T0, A);
  setTimeout(function(){ if(!self.mort) self._rire(.9); }, 900);
  return attendreMs(T0).then(function(){ return self._finAction(j, 220); });
};
R.special = function(nom, o){
  var self = this;
  if(nom === 'accroche') return this._accroche(o || {});
  if(nom === 'grandit') return this._grandir(false);
  var j = this._debutAction();
  var pr = nom === 'rire' ? this._rire(1.3) : this._appel(1.3);
  return pr.then(function(){ return self._finAction(j, 200); });
};
/* IL S'ÉTEINT : il vacille, les langues tombent une à une, des volutes montent ; le cœur reste seul, pâlit et s'éteint */
R.mourir = function(){
  var self = this, j = this._debutAction(), T0 = 3200;
  ['brule', 'colle', 'enrage', 'cible', 'ebloui'].forEach(function(n){ if(self.etat[n]) self._visuel(n, false); self.etat[n] = false; });
  this._fondu('plisse', 1, 300);
  var k = [{t: 0, p: {}},
    {t: .1, p: melange({sourcilG: {y: -6, a: 18}, sourcilD: {y: -6, a: -18}, bouche: {sy: .6, sx: .8}, bras: {a: 40, sx: .8}}, toutes({sy: 1.1}))},
    {t: .25, p: {langue0: {sy: .15, a: 30}, flotte: {y: 10}}, e: 'ease-in'},
    {t: .38, p: {langue1: {sy: .15, a: 24}, taille: {s: .85}, flotte: {y: 30}}, e: 'ease-in'},
    {t: .5, p: {langue2: {sy: .15, a: 18}, taille: {s: .7}, flotte: {y: 50}, queue: {sx: .4, sy: .5}}, e: 'ease-in'},
    {t: .6, p: {langue3: {sy: .15, a: 14}, taille: {s: .5}, flotte: {y: 70}, corps: {sx: .7, sy: .5}, bras: {a: 70, sx: .3}, coeur: {s: 1.15}}, e: 'ease-in'},
    /* le cœur reste seul : il garde sa taille, palpite une dernière fois */
    {t: .78, p: {taille: {s: .32}, flotte: {y: 90}, coeur: {s: 1.9}}, e: 'ease-in-out'},
    {t: .86, p: {coeur: {s: 2.3}}, e: 'ease-out'},
    {t: 1, p: {taille: {s: .2}, flotte: {y: 100}, coeur: {s: 1.6}}, e: 'ease-in'}];
  this._seq(k, T0);
  /* tout s'efface, sauf le cœur, qui pâlit en dernier */
  this._opac('traine', [{opacity: 1}, {opacity: 0}], T0 * .4);
  this._opac('halo', [{opacity: 1}, {opacity: 0}], T0 * .7);
  this._opac('visage', [{opacity: 1}, {opacity: 1, offset: .5}, {opacity: 0}], T0 * .6);
  this._opac('bras', [{opacity: 1}, {opacity: 0}], T0 * .55);
  this._opac('corps', [{opacity: 1}, {opacity: .8, offset: .5}, {opacity: 0}], T0 * .72);
  this._opac('queue', [{opacity: 1}, {opacity: 0}], T0 * .5);
  this._opac('reflet', [{opacity: 1}, {opacity: 0}], T0);
  this._opac('poussiere', [{opacity: 1}, {opacity: 0}], T0 * .4);
  this._opac('coeur', [{opacity: 1}, {opacity: 1, offset: .75}, {opacity: 0}], T0);
  this._couperX('sc'); this._couperX('fm'); this._couperX('pf'); this._fondu(['fumee', 'visible', 'runes', 'grand', 'haloG', 'refletG'], 0, 400);
  /* à la fin, le cœur brille seul un instant, puis il pâlit avec le reste */
  if(!this._pfOn) this._fondu('pf', 0, 200);
  setTimeout(function(){ self._fondu('pf', 1, 400); }, T0 * .5);
  for(var i = 0; i < 8; i++){ (this.K['sc' + i] || []).forEach(function(e){ e.style.opacity = 0; }); }
  for(var v = 0; v < 6; v++) (function(v){ setTimeout(function(){ var q = self._ou('centre'); self._volute([q[0] + hasard(-40, 40), q[1] - hasard(10, 60)], {dx: hasard(-20, 30), duree: 1600}); self._etincelles([q[0] + hasard(-30, 30), q[1] - 20], 2, ['#dfe8f0', '#c8d4e0'], .6, {haut: true}); }, 300 + v * 380); })(v);
  return attendreMs(T0 + 300).then(function(){ self._couperBoucles(); self._couperX(''); self.el.style.visibility = 'hidden'; self.enAction = false; self.mort = true; });
};
R.fuir = function(){ return this.mourir(); };
/* le critique : il enfle, vacille, et ÉCLATE en gerbe d'étincelles bleues et en brume noire ; il reste au sol une petite
   braise froide qui s'éteint lentement */
R.exploser = function(scene){
  var self = this, j = this._debutAction(), boomOk, boomP = new Promise(function(ok){ boomOk = ok; });
  ['brule', 'colle', 'enrage', 'cible', 'ebloui'].forEach(function(n){ if(self.etat[n]) self._visuel(n, false); self.etat[n] = false; });
  this._fondu('pf', 1, 100);
  var k = [{t: 0, p: {}}];
  for(var i = 1; i <= 8; i++) k.push({t: i / 9, p: melange({taille: {s: (this.etat.grand ? 1.26 : 1) * (1 + i * .03)}, secousse: {x: i % 2 ? 6 : -6, a: i % 2 ? 3 : -3}, sourcilG: {y: -6, a: 16}, sourcilD: {y: -6, a: -16}, coeur: {s: 1 + i * .08}}, toutes({sy: 1 + i * .06, a: i % 2 ? 10 : -10})), e: 'linear'});
  k.push({t: 1, p: {taille: {s: (this.etat.grand ? 1.26 : 1) * 1.36}}, e: 'ease-in'});
  setTimeout(function(){ self._fondu('sourire', 0, 0); self._fondu('crache', 1, 0); }, 100);
  (this.V.flash || []).forEach(function(e){ e.getAnimations().forEach(function(a){ a.cancel(); }); e.removeAttribute('visibility'); e.animate([{opacity: 0}, {opacity: .3, offset: .3}, {opacity: .1, offset: .5}, {opacity: .6, offset: .8}, {opacity: .9}], {duration: 560, fill: 'forwards'}); });
  var pr = this._seq(k, 560).fini.then(function(){
    scene = scene || self.c.parentNode || self.c;
    if(getComputedStyle(scene).position === 'static') scene.style.position = 'relative';
    var sr = scene.getBoundingClientRect(), W = scene.offsetWidth || sr.width, H = scene.offsetHeight || sr.height, ech = W / (sr.width || 1);
    var cr = self.A.centre.getBoundingClientRect(), cx = (cr.left - sr.left) * ech, cy = (cr.top - sr.top) * ech, u = self._echelle().k * ech * 2;
    var e0 = self._echelle(), solY = (e0.y0 + SOL * e0.k - sr.top) * ech;
    var ov = document.createElementNS(NS, 'svg'), id = 'btFFb' + self.num;
    ov.setAttribute('class', PX + '-scene-fx ra-scene-fx'); ov.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    ov.innerHTML = '<defs><radialGradient id="' + id + 'n"><stop offset="0" stop-color="#0c0812"/><stop offset=".55" stop-color="#121a2a" stop-opacity=".95"/><stop offset="1" stop-color="#18223a" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="' + id + 'c"><stop offset="0" stop-color="#3a6a9a" stop-opacity=".6"/><stop offset="1" stop-color="#2a4a6a" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="' + id + 'g"><stop offset="0" stop-color="#ffffff"/><stop offset=".4" stop-color="' + C4 + '" stop-opacity=".9"/><stop offset="1" stop-color="' + C2 + '" stop-opacity="0"/></radialGradient></defs>';
    scene.appendChild(ov);
    function g(html, frames, o){ var e = document.createElementNS(NS, 'g'); e.innerHTML = html; ov.appendChild(e); var a = e.animate(frames, {duration: o.d, delay: o.dl || 0, easing: o.e || 'ease-out', fill: 'both'}); if(o.retirer !== false) a.finished.then(function(){ e.remove(); }, function(){}); return a; }
    self._fondu('bete', 0, 0);
    self._opac('reflet', [{opacity: 1}, {opacity: 0}], 800);
    boomOk();
    /* la brume noire (6 nuages) */
    var brumes = [];
    for(var n = 0; n < 6; n++){ var a = n / 6 * Math.PI * 2 + hasard(-.3, .3), r = hasard(34, 50) * u, dx = Math.cos(a) * 60 * u, dy = Math.sin(a) * 40 * u - 16 * u;
      brumes.push(g('<circle r="' + f1(r) + '" fill="url(#' + id + 'n)"/><circle cx="' + f1(-r * .25) + '" cy="' + f1(-r * .3) + '" r="' + f1(r * .6) + '" fill="url(#' + id + 'c)"/>', [{transform: T(cx, cy, .15), opacity: 0}, {offset: .06, opacity: 1, transform: T(cx + dx * .5, cy + dy * .5, 1)}, {offset: .55, opacity: .85, transform: T(cx + dx, cy + dy - 30 * u, 1.4)}, {transform: T(cx + dx * 1.3, cy + dy - 90 * u, 1.9), opacity: 0}], {d: hasard(3000, 3800), e: 'cubic-bezier(.12,.75,.3,1)', retirer: false})); }
    /* la gerbe d'étincelles bleues : elles jaillissent, retombent, et s'éteignent */
    for(var s = 0; s < 14; s++){
      var as = -Math.PI * hasard(.05, .95), vs = hasard(80, 170) * u, xs = cx + Math.cos(as) * vs, ys = cy + Math.sin(as) * vs, rs = hasard(5, 10) * u * .5, cs = choisir([C5, C4, C3, '#ffffff']);
      g('<path d="' + scintD(0, 0, rs * 2) + '" fill="' + cs + '"/><circle r="' + f1(rs * 2.4) + '" fill="url(#' + id + 'g)" fill-opacity=".5"/>',
        [{transform: T(cx, cy, .4), opacity: 1}, {offset: .35, transform: T(xs, ys, 1, 90)}, {offset: .75, transform: T(xs + Math.cos(as) * 20 * u, Math.min(solY, ys + 80 * u), .8, 200), opacity: .9}, {transform: T(xs + Math.cos(as) * 26 * u, Math.min(solY, ys + 110 * u), .3, 260), opacity: 0}],
        {d: hasard(1200, 1800), e: 'cubic-bezier(.2,.6,.5,1)'});
    }
    /* BOUM : l'étoile bleue, l'éclair, l'onde de choc */
    g('<path d="' + etoileD(70 * u, 11, .5) + '" fill="' + C3 + '" stroke="' + O + '" stroke-width="' + f1(3 * u) + '"/><path d="' + etoileD(42 * u, 11, .5) + '" fill="' + C5 + '"/>', [{transform: T(cx, cy, .15, 0), opacity: 1}, {offset: .35, transform: T(cx, cy, 1, 14), opacity: 1}, {transform: T(cx, cy, 1.15, 22), opacity: 0}], {d: 480, e: 'cubic-bezier(.1,.8,.3,1)'});
    g('<circle r="' + f1(70 * u) + '" fill="url(#' + id + 'g)"/>', [{transform: T(cx, cy, .2), opacity: 1}, {transform: T(cx, cy, 1.9), opacity: 0}], {d: 480});
    g('<circle r="' + f1(56 * u) + '" fill="none" stroke="#ffffff" stroke-width="' + f1(5 * u) + '"/>', [{transform: T(cx, cy, .2), opacity: .95}, {transform: T(cx, cy, 2.8), opacity: 0}], {d: 560, e: 'cubic-bezier(.1,.8,.3,1)'});
    g('<ellipse rx="' + f1(60 * u) + '" ry="' + f1(8 * u) + '" fill="none" stroke="' + C4 + '" stroke-width="' + f1(4 * u) + '"/>', [{transform: T(cx, solY, .3), opacity: 0}, {offset: .3, opacity: .9, transform: T(cx, solY, .6)}, {transform: T(cx, solY, 3) + ' scale(1,.8)', opacity: 0}], {d: 1100, dl: 160, e: 'cubic-bezier(.1,.7,.3,1)'});
    setTimeout(function(){ self._braise(); }, 600);
    self._couperBoucles(); self._couperX(''); self.mort = true;
    return Promise.all(brumes.map(fini)).then(function(){ ov.remove(); });
  });
  pr.boom = boomP;
  return pr;
};
/* la petite braise froide qui reste au sol, et qui s'éteint lentement (elle garde une toute petite lueur) */
R._braise = function(){
  var c = this._ou('centre'), x = Math.max(80, Math.min(460, c[0])), D = this.D;
  var lueur = '<ellipse cx="0" cy="-4" rx="46" ry="12" fill="' + D.doux(C3, .8) + '"/><circle cx="0" cy="-10" r="26" fill="' + D.doux(C4, .8) + '"/>';
  var pierre = '<ellipse cx="0" cy="2" rx="30" ry="5" fill="#000" fill-opacity=".4"/>' + P('M-16 0 C -18 -10 -8 -16 0 -15 C 10 -16 18 -8 16 0 C 10 4 -10 4 -16 0 Z', '#1a2a3a', ' stroke-width="2.2"') + L('M-10 -6 L -2 -10 L 6 -6 M2 -10 L 4 -2', C3, 1.6, ' stroke-opacity=".9"');
  var flamme = F(flammeD(24, 12), C3, ' fill-opacity=".8"') + F(flammeD(14, 7), C5);
  var g = document.createElementNS(NS, 'g');
  g.setAttribute('transform', 'translate(' + f1(x) + ' ' + f1(SOL - 2) + ') scale(1.6)');
  g.innerHTML = '<g>' + lueur + '</g>' + pierre + '<g transform="translate(0 -12)"><g>' + flamme + '</g></g>';
  this.S.restes.appendChild(g);
  g.animate([{opacity: 0}, {opacity: 1}], {duration: 400, fill: 'both'});
  /* elle palpite un moment, puis pâlit ; la petite flamme rétrécit et disparaît */
  g.firstChild.animate([{opacity: 1}, {opacity: .7, offset: .1}, {opacity: 1, offset: .2}, {opacity: .6, offset: .35}, {opacity: .8, offset: .45}, {opacity: .15}], {duration: 6000, fill: 'forwards', easing: 'ease-in-out'});
  g.lastChild.firstChild.animate([{transform: 'scale(1,1)', opacity: 1}, {transform: 'scale(.8,1.2)', offset: .15}, {transform: 'scale(1.05,.9)', offset: .3}, {transform: 'scale(.6,.8)', opacity: .8, offset: .6}, {transform: 'scale(0,0)', opacity: 0}], {duration: 5000, fill: 'forwards', easing: 'ease-in-out'});
};

/* =====================================================================
   8. Les états
   ===================================================================== */
R.attendre = function(){
  this.attente = true;
  if(this.arrete){ this.arrete = false; this._vie(true); this._remettreX(); }
  if(!this.enAction && !this.mort) return this._reprendre(250);
  return Promise.resolve();
};
R._remettreX = function(){ var e = this.etat; if(e.ebloui) this._etoiles(true); if(e.brule) this._feu(true); this._pfOn = null; this._visOn = null; this._majVisible(); };
R.arreter = function(){ this.attente = false; this.arrete = true; this._couperX(''); this._couperBoucles(); return this; };
R.ancre = function(nom){ var r = (this.A[nom] || this.A.centre).getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; };
R._visuel = function(nom, on){
  if(nom === 'enrage') this._fondu('rouge', on ? 1 : 0, 300);
  else if(nom === 'brule') this._feu(on);
  else if(nom === 'colle') this._fondu('colle', on ? 1 : 0, 300);
  else if(nom === 'ebloui'){ this._etoiles(on); this._fondu('plisse', on ? 1 : 0, 200); }
  else if(nom === 'gele') this._fondu('gel', on ? 1 : 0, 600);
  else if(nom === 'ouvert') this._majCoeur();
  else if(nom === 'visible') this._majVisible();
  else if(nom === 'accroche'){ this._runes(on); this._majVisible(); }
  else if(nom === 'grand') this._fondu(['grand', 'haloG', 'refletG'], on ? 1 : 0, 400);
};
R.changerEtat = function(nom, on){
  on = on !== false;
  var self = this;
  if(this.mort || !(nom in this.etat) || this.etat[nom] === on) return Promise.resolve();
  if(nom === 'grand' && on) return this._grandir(false);
  this.etat[nom] = on;
  if(nom === 'accroche' && on) this.etat.visible = true;
  this._visuel(nom, on);
  if(nom === 'dos'){
    /* retourné : il fait la culbute et flotte la tête en bas, la flamme vers le sol */
    var j = this._debutAction();
    var k = on ? [{t: 0, p: {}}, {t: .5, p: {posture: {a: 100, y: -40}}, e: 'ease-out'}, {t: 1, p: {posture: {a: 180, y: -20}}, e: 'ease-in-out'}] : [{t: 0, p: {}}, {t: .5, p: {posture: {a: 270, y: -40}}, e: 'ease-out'}, {t: 1, p: {posture: {a: 360, y: 0}}, e: 'ease-in-out'}];
    return this._seq(k, 800).fini.then(function(){
      if(!on){ self.J.posture.forEach(function(e){ e.getAnimations().forEach(function(a){ a.cancel(); }); e.style.transform = tf(Z); }); self.v.posture = fusion(Z); }
      return self._finAction(j, 150);
    });
  }
  if(!this.enAction) return this._reprendre(nom === 'grand' ? 600 : 300);
  return Promise.resolve();
};

/* =====================================================================
   9. L'interface publique
   ===================================================================== */
var INFO = {id: ID, nom: 'Feu follet', rang: 'normal', pv: 30, attaque: 'brûlure froide 12 sur 2 héros',
  cadre: {w: 230, h: 260}, sol: (SOL - VB.y) / VB.h, vol: (COEUR[1] - VB.y) / VB.h, vole: true, places: 1,
  attaques: ['brulure'], specials: ['accroche', 'grandit', 'appel', 'rire'],
  etats: ['enrage', 'brule', 'colle', 'ebloui', 'gele', 'ouvert', 'dos', 'cible', 'visible', 'grand', 'accroche']};
function creer(conteneur, options){
  var t = new Follet(conteneur, options);
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
