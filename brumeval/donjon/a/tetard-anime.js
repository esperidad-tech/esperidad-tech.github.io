/* tetard-anime.js — le têtard du puits, animé (Les Enquêteurs de Brumeval)
   Module autonome, sans dépendance, léger. Il injecte son propre CSS (préfixe .bt-tetard-). Il ne joue aucun son.
   Contrat commun : jeu/donjon/anim/betes/CONTRAT.md. Dessin validé : bestiaire/betes/06-tetard.js
   (gros, gluant, la gueule toujours ouverte, dans sa flaque ; 15 PV, morsure 5, pas de point faible).

     var t = BETES.tetard.creer(conteneur);   // le SVG remplit le conteneur (210 × 148), il regarde à gauche

   Actions (Promise) : entrer() (il saute hors du bassin et atterrit en flaque), attaquer(nom, o) (petit bond, morsure ;
     o.onImpact au coup), touche(type), special('plouf'), tousser(), fuir() (il retourne à l'eau en se tortillant),
     mourir() (= fuir), exploser(scene) (splatch gluant).
   États : enrage, brule, colle, ebloui, gele, ouvert, dos, cible. attendre(), arreter(), etatCourant(), ancre(nom).

   Pour la fluidité : aucun filtre ; les pièces (<g data-j>) ont un contenu fixe et ne sont animées qu'en transform ;
   les états sont des variantes pré-dessinées (data-j="v-…") qu'on montre ou cache par l'opacité ; au plus 20 particules. */
(function(global){
'use strict';
var O = '#24182e', LUNE = '#bfe8ff', NUM = 0, NS = 'http://www.w3.org/2000/svg';

/* ============ 1. Petits outils ============ */
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
  for(var i = 0; i < m; i++){ var a = q(i - 1), b = q(i), c = q(i + 1), e = q(i + 2); s += ' C ' + pt([b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6]) + ' ' + pt([c[0] - (e[0] - b[0]) / 6, c[1] - (e[1] - b[1]) / 6]) + ' ' + pt(c); }
  return s + (ferme ? ' Z' : '');
}
function tube(pts, ws){
  var n = pts.length, G = [], D = [];
  for(var i = 0; i < n; i++){ var a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, w = ws[i] / 2; G.push([pts[i][0] - dy / l * w, pts[i][1] + dx / l * w]); D.push([pts[i][0] + dy / l * w, pts[i][1] - dx / l * w]); }
  function bout(i, j, w){ var dx = pts[i][0] - pts[j][0], dy = pts[i][1] - pts[j][1], l = Math.hypot(dx, dy) || 1; return [pts[i][0] + dx / l * w * .5, pts[i][1] + dy / l * w * .5]; }
  return {d: lisse(G.concat([bout(n - 1, n - 2, ws[n - 1])], D.slice().reverse(), [bout(0, 1, ws[0])]), true), g: G, dr: D, bout: bout};
}
function goutteD(x, y, r, ang){
  var ca = Math.cos(ang), sa = Math.sin(ang), tip = [x - ca * r * 2.4, y - sa * r * 2.4], nx = -sa, ny = ca;
  return 'M' + pt(tip) + ' C ' + pt([x - ca * r * .8 + nx * r * 1.1, y - sa * r * .8 + ny * r * 1.1]) + ' ' + pt([x + ca * r + nx * r, y + sa * r + ny * r]) + ' ' + pt([x + ca * r, y + sa * r]) + ' C ' + pt([x + ca * r - nx * r, y + sa * r - ny * r]) + ' ' + pt([x - ca * r * .8 - nx * r * 1.1, y - sa * r * .8 - ny * r * 1.1]) + ' ' + pt(tip) + ' Z';
}
function goutte(x, y, r, ang, c, op){ return P(goutteD(x, y, r, ang), c, ' stroke-width="1.6" opacity="' + (op || 1) + '"') + C(f1(x - Math.cos(ang + Math.PI / 2) * r * .35 + Math.cos(ang) * r * .1), f1(y - Math.sin(ang + Math.PI / 2) * r * .35 + Math.sin(ang) * r * .1), f1(r * .35), '#ffffff', ' opacity=".9"'); }
function flammeD(h, w){ return 'M' + f1(-w / 2) + ' 0 C ' + f1(-w * .62) + ' ' + f1(-h * .38) + ' ' + f1(-w * .1) + ' ' + f1(-h * .5) + ' ' + f1(-w * .12) + ' ' + f1(-h) + ' C ' + f1(w * .3) + ' ' + f1(-h * .62) + ' ' + f1(w * .7) + ' ' + f1(-h * .42) + ' ' + f1(w / 2) + ' 0 Z'; }
function etoileD(r, n, k){ var s = ''; for(var i = 0; i < n * 2; i++){ var a = -Math.PI / 2 + i * Math.PI / n, rr = i % 2 ? r * (k || .45) : r; s += (i ? ' L ' : 'M') + f1(Math.cos(a) * rr) + ' ' + f1(Math.sin(a) * rr); } return s + ' Z'; }
function Defs(u){ this.u = u; this.n = 0; this.l = []; this.cache = {}; }
Defs.prototype.id = function(){ return this.u + (++this.n); };
Defs.prototype.stops = function(st){ return st.map(function(t){ return '<stop offset="' + t[0] + '" stop-color="' + t[1] + '" stop-opacity="' + (t[2] == null ? 1 : t[2]) + '"/>'; }).join(''); };
Defs.prototype.g = function(c, fort){ fort = fort || 1; var id = this.id(); this.l.push('<linearGradient id="' + id + '" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + clair(c, .26 * fort) + '"/><stop offset=".45" stop-color="' + c + '"/><stop offset="1" stop-color="' + sombre(c, .42 * fort) + '"/></linearGradient>'); return 'url(#' + id + ')'; };
Defs.prototype.rad = function(st, cx, cy, r){ var id = this.id(); this.l.push('<radialGradient id="' + id + '" cx="' + cx + '" cy="' + cy + '" r="' + r + '">' + this.stops(st) + '</radialGradient>'); return 'url(#' + id + ')'; };
Defs.prototype.lin = function(st, x1, y1, x2, y2){ var id = this.id(); this.l.push('<linearGradient id="' + id + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '">' + this.stops(st) + '</linearGradient>'); return 'url(#' + id + ')'; };
Defs.prototype.clip = function(d){ var id = this.id(); this.l.push('<clipPath id="' + id + '"><path d="' + d + '"/></clipPath>'); return ' clip-path="url(#' + id + ')"'; };
/* une tache douce (un « flou » fait d'un dégradé radial, sans filtre) */
Defs.prototype.doux = function(c, op){
  var k = c + '|' + (op == null ? 1 : op);
  if(!this.cache[k]){ var id = this.id(), h = '<radialGradient id="' + id + '"><stop offset="0" stop-color="' + c + '" stop-opacity="' + (op == null ? 1 : op) + '"/><stop offset=".5" stop-color="' + c + '" stop-opacity="' + f1((op == null ? 1 : op) * .55) + '"/><stop offset="1" stop-color="' + c + '" stop-opacity="0"/></radialGradient>'; this.l.push(h); if(this.vivant) this.vivant.insertAdjacentHTML('beforeend', h); this.cache[k] = 'url(#' + id + ')'; }
  return this.cache[k];
};
function douce(D, cx, cy, rx, ry, c, op){ return '<ellipse cx="' + f1(cx) + '" cy="' + f1(cy) + '" rx="' + f1(rx) + '" ry="' + f1(ry) + '" fill="' + D.doux(c) + '"' + (op == null ? '' : ' fill-opacity="' + op + '"') + '/>'; }
function piv(nom, x, y, c){ return '<g data-j="' + nom + '" style="transform-origin:' + x + 'px ' + y + 'px">' + c + '</g>'; }
function vari(nom, c, op){ return '<g data-j="v-' + nom + '" opacity="' + (op || 0) + '"' + (op ? '' : ' visibility="hidden"') + '>' + c + '</g>'; }
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

/* ============ 2. Le dessin (mêmes coordonnées que la fiche, 540 × 430) ============ */
var PEAU = '#56683e', DOS = '#33402a', TACHE = '#232d1a', VENTRE = '#cfc88e', EAU = '#2a3a52', GLU = '#d8f4c0';
var CORPS_D = 'M40 226 C 56 198 104 184 160 180 C 220 174 276 186 310 218 C 336 244 342 292 322 328 C 302 360 250 374 194 372 C 148 370 104 364 78 358 C 64 356 54 356 48 356 C 90 346 126 322 152 290 C 120 252 76 234 40 226 Z';
var MENTON_D = 'M152 290 C 170 312 200 340 232 372 C 220 373 206 373 194 372 C 148 370 104 364 78 358 C 64 356 54 356 48 356 C 90 346 126 322 152 290 Z';
function dessiner(D){
  var s = {}, R = rng(4), peau = PEAU;
  var gPeau = D.g(peau), gVentre = D.lin([[0, '#e8e2a8'], [1, '#a8a070']], 0, 0, 0, 1);
  /* ---- la flaque (derrière) et l'eau de devant ---- */
  var flaque = 'M18 380 C 30 360 120 352 270 352 C 420 352 520 362 530 380 C 538 398 440 410 270 410 C 100 410 8 398 18 380 Z';
  s.flaque = vari('flaque', F('M8 382 C 20 356 120 346 270 346 C 430 346 534 358 540 382 C 546 404 440 418 270 418 C 96 418 -2 404 8 382 Z', '#0c0a14', ' opacity=".6"') +
    P(flaque, D.lin([[0, '#3e5070'], [.5, EAU], [1, '#141c2c']], 0, 0, 0, 1), ' stroke-width="2.4"') + '<g' + D.clip(flaque) + '>' + F('M60 372 C 140 362 220 360 300 362 C 220 368 140 372 60 372 Z', '#9ac4ff', ' opacity=".25"') +
    L('M300 390 L 380 390 M396 386 L 452 386 M90 394 L 150 394 M170 398 L 196 398 M420 398 L 470 398', LUNE, 1.6, ' opacity=".4"') + douce(D, 200, 384, 150, 16, DOS, .6) + '</g>', 1);
  var devant = 'M18 380 C 40 370 120 366 270 366 C 420 366 520 372 530 380 C 538 398 440 410 270 410 C 100 410 8 398 18 380 Z';
  s.devant = vari('devant', F(devant, D.lin([[0, '#6a84a8', .7], [.4, EAU, .85], [1, '#141c2c', .95]], 0, 0, 0, 1)) +
    L('M30 382 C 80 372 200 368 330 370 C 420 372 500 376 526 382', LUNE, 1.8, ' opacity=".55"') + L('M60 386 C 120 380 220 378 300 380 M80 394 C 140 390 240 388 320 392 M340 386 C 400 384 460 386 500 390', '#9ac4ff', 1.2, ' opacity=".35"') +
    L('M58 370 C 120 366 220 368 330 370', '#e8f6ff', 2.2, ' opacity=".7"') + L('M30 376 C 40 368 70 364 100 364 M360 368 C 400 368 430 372 446 378', LUNE, 1.4, ' opacity=".45"') +
    [[220, 392, 4], [236, 386, 2.6], [330, 394, 3.4], [120, 396, 2.4]].map(function(b){ return '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="' + b[2] + '" fill="none" stroke="#d8f0ff" stroke-width="1.2" opacity=".7"/>'; }).join(''), 1);
  /* la flaque gelée, la colle sur la flaque */
  s.glace = vari('glace', F(devant, D.lin([[0, '#f0faff', .92], [1, '#9ac4e0', .9]], 0, 0, 0, 1)) + L('M60 386 L 120 380 L 150 394 M300 384 L 340 396 L 400 388 M440 382 L 480 394', '#5a8aa8', 1.6) + L('M58 372 C 120 368 220 370 330 372', '#ffffff', 2.4));
  s.colleSol = vari('colleSol', '<ellipse cx="250" cy="384" rx="210" ry="13" fill="#c8d84a" fill-opacity=".55" stroke="#5a6420" stroke-width="2"/>' + L('M90 380 C 160 376 260 375 360 378', '#ffffd0', 1.8, ' opacity=".7"'));

  /* ---- la queue : deux morceaux (la base et le bout), un muscle annelé, une grande nageoire translucide ---- */
  var qc = [[300, 288], [358, 298], [410, 286], [452, 258], [482, 220], [496, 182], [494, 150], [484, 130]];
  var qn = qc.map(function(p, i){ var k = Math.sin(i / (qc.length - 1) * Math.PI) * 12; return [p[0] - k * .9, p[1] - k]; });
  var nag = tube(qn, [146, 154, 146, 124, 96, 66, 36, 8]), mus = tube(qc, [84, 60, 44, 32, 22, 13, 6, 2]);
  var gNag = D.lin([[0, '#eefcd8', .5], [.5, '#b8d8a0', .36], [1, '#6a8a68', .5]], 1, 0, 0, 1);
  function morceau(i0, i1, dernier){
    /* le contour du morceau, coupé net aux deux bouts (le bout de la queue est arrondi) */
    /* le morceau du bout déborde un peu sur la base (pas de fente quand il bouge) ; on ne trace que les bords extérieurs, jamais la coupe */
    function pts(t, cote){ var l = t[cote].slice(i0, i1 + 1); if(i0 > 0) l[0] = lerp(t[cote][i0 - 1], t[cote][i0], .7); return l; }
    function bande(t){ var g = pts(t, 'g'), d = pts(t, 'dr'); return {plein: lisse(g.concat(dernier ? [t.bout(t.g.length - 1, t.g.length - 2, 6)] : [], d.slice().reverse()), true), bord: dernier ? L(lisse(g.concat([t.bout(t.g.length - 1, t.g.length - 2, 6)], d.slice().reverse()), false), O, 2.4) : L(lisse(g), O, 2.4) + L(lisse(d), O, 2.4)}; }
    var fin = bande(nag), m = bande(mus), q = '';
    q += F(fin.plein, gNag) + fin.bord;
    fin = fin.plein;
    var nerv = '';
    for(var k = i0; k < i1; k++) for(var z = 0; z < 4; z++){ var t = z / 4, c = lerp(qc[k], qc[k + 1], t), g = lerp(nag.g[k], nag.g[k + 1], t), dr = lerp(nag.dr[k], nag.dr[k + 1], t); nerv += 'M' + pt(c) + ' L ' + pt(lerp(c, g, .94)) + ' M' + pt(c) + ' L ' + pt(lerp(c, dr, .94)) + ' '; }
    q += L(nerv, '#2a3a22', 1.1, ' opacity=".4"');
    for(var k2 = 0; k2 < 6; k2++){ var t2 = i0 + R() * (i1 - i0 - .2), j = Math.floor(t2), f = t2 - j, sd = R() < .5 ? nag.g : nag.dr, p2 = lerp(lerp(qc[j], qc[j + 1], f), lerp(sd[j], sd[j + 1], f), .45 + R() * .4); q += C(f1(p2[0]), f1(p2[1]), f1(1.6 + R() * 2.6), TACHE, ' opacity=".45"'); }
    q += L(lisse(nag.dr.slice(i0, i1 + 1)), '#f0ffe0', 1.8, ' opacity=".75"') + L(lisse(nag.g.slice(i0, i1 + 1)), '#f0ffe0', 1.4, ' opacity=".5"');
    q += F(m.plein, gPeau) + m.bord;
    var chev = '';
    for(var k3 = i0; k3 < i1; k3++){ var c4 = lerp(qc[k3], qc[k3 + 1], .5), g4 = lerp(mus.g[k3], mus.g[k3 + 1], .5), d4 = lerp(mus.dr[k3], mus.dr[k3 + 1], .5), back = lerp(qc[k3], qc[k3 + 1], .2); chev += 'M' + pt(g4) + ' L ' + pt(back) + ' L ' + pt(d4) + ' '; }
    q += L(chev, DOS, 1.6, ' opacity=".55"') + L(lisse(mus.dr.slice(i0, i1 + 1)), LUNE, 1.8, ' opacity=".6"');
    return q;
  }
  s.queue = piv('queue', 300, 290, morceau(0, 3) + piv('queueB', 452, 258, morceau(3, 7, true)));
  /* ---- la petite patte arrière du fond, la patte proche ---- */
  s.patteF = P(tube([[300, 330], [326, 344], [318, 364]], [16, 11, 8]).d, D.g(sombre(peau, .35))) + P('M318 360 C 330 366 344 370 356 372 C 346 376 330 374 314 368 Z', D.g(sombre(peau, .3)), ' stroke-width="2"');
  var pied = 'M334 354 C 346 356 360 360 378 362 L 374 366 L 384 368 L 374 372 L 382 378 L 368 376 L 370 384 L 358 376 C 348 372 338 366 330 362 Z';
  s.patte = piv('patte', 318, 314, P(tube([[318, 314], [348, 334], [338, 358]], [26, 18, 11]).d, gPeau) + L('M322 310 C 336 314 350 324 354 338', LUNE, 1.6, ' opacity=".5"') +
    P(pied, D.lin([[0, '#c0d098', .92], [1, '#5a6a40', .92]], 1, 0, 0, 1), ' stroke-width="2.2"') + [[379, 365], [383, 373], [369, 383]].map(function(o){ return C(o[0], o[1], 2.2, '#d8e8b0', ' stroke="' + O + '" stroke-width="1.2"'); }).join(''));

  /* ---- le corps : gros, luisant, tacheté ; l'intérieur de la gueule derrière ---- */
  var gueule = 'M38 226 C 78 234 124 254 156 290 C 126 324 90 348 46 358 C 26 330 24 260 38 226 Z';
  var c = douce(D, 190, 290, 170, 100, '#000', .3);
  c += P(gueule, D.rad([[0, '#0a0208'], [.5, '#2a0a1e'], [1, '#5a1a36']], .85, .5, .8));
  c += F('M40 336 C 70 306 110 294 146 294 C 120 318 86 342 50 352 Z', '#a8506a') + L('M58 330 C 86 310 114 300 136 298', '#d07890', 1.2, ' opacity=".6"');
  c += P(CORPS_D, gPeau);
  var dans = F('M60 322 C 110 352 180 372 260 360 C 300 352 324 330 330 300 C 320 340 270 372 196 374 C 130 372 84 352 60 322 Z', VENTRE, ' opacity=".9"') + F('M70 320 C 120 346 200 360 270 348 C 230 350 140 348 70 320 Z', '#fff8c8', ' opacity=".35"');
  var R2 = rng(31);
  for(var k5 = 0; k5 < 26; k5++){ var x5 = 80 + R2() * 240, y5 = 196 + R2() * 120; if(y5 > 330 - (x5 - 80) * .05) continue; dans += '<ellipse cx="' + f1(x5) + '" cy="' + f1(y5) + '" rx="' + f1(2 + R2() * 5) + '" ry="' + f1(1.5 + R2() * 3.5) + '" fill="' + TACHE + '" opacity=".55"/>'; }
  [[140, 230, 30, 14], [230, 220, 26, 12], [280, 280, 22, 16], [190, 300, 20, 10]].forEach(function(q){ dans += douce(D, q[0], q[1], q[2], q[3], TACHE, .45); });
  for(var k6 = 0; k6 < 18; k6++) dans += C(f1(90 + R2() * 220), f1(200 + R2() * 110), f1(1 + R2() * 1.4), '#c8d8a0', ' opacity=".4"');
  for(var k7 = 0; k7 < 9; k7++){ var x7 = 150 + k7 * 18, y7 = 290 - Math.sin(k7 / 8 * Math.PI) * 10 + k7 * 1.5; dans += C(x7, f1(y7), 2.2, '#e8f0c0', ' opacity=".7"'); }
  dans += F(CORPS_D, D.rad([[0, '#000', 0], [.7, '#000', 0], [1, '#000', .45]], .52, .4, .62));
  dans += F('M120 202 C 160 190 220 188 262 200 C 220 196 168 198 124 210 Z', '#f8fff0', ' opacity=".75"') + F('M282 214 C 300 226 314 246 318 268 C 308 250 296 234 280 222 Z', '#f8fff0', ' opacity=".6"');
  dans += douce(D, 236, 214, 50, 16, '#ffffff', .22) + C(210, 236, 3, '#ffffff', ' opacity=".7"') + C(258, 258, 2.2, '#ffffff', ' opacity=".6"') + C(294, 290, 2, '#ffffff', ' opacity=".55"');
  /* le ventre qui luit (« ouvert », pour le contrat) et le givre */
  dans += vari('ouvert', douce(D, 200, 330, 120, 40, '#fff4b0', .8));
  c += '<g' + D.clip(CORPS_D) + '>' + dans + '</g>';
  c += L('M164 182 C 222 176 276 190 308 220 C 330 244 338 272 334 300', LUNE, 2.6, ' opacity=".6"');
  [[118, 236, 3], [196, 206, 2.4], [300, 252, 2.6], [232, 330, 2.2]].forEach(function(b){ c += '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="' + b[2] + '" fill="' + GLU + '" fill-opacity=".25" stroke="#f4ffe8" stroke-width="1" opacity=".8"/>' + C(b[0] - b[2] * .35, b[1] - b[2] * .35, b[2] * .3, '#ffffff'); });
  c += '<ellipse cx="268" cy="304" rx="5" ry="3.6" fill="#141a0e" stroke="' + O + '" stroke-width="1.6"/>';
  /* la lèvre du haut et ses dents */
  var lH = [[34, 230], [62, 234], [96, 246], [128, 264], [154, 290]], lB = [[46, 356], [76, 350], [108, 334], [134, 314], [154, 292]];
  function surCourbe(cv, tt){ var x = tt * (cv.length - 1), i = Math.min(cv.length - 2, Math.floor(x)); return lerp(cv[i], cv[i + 1], x - i); }
  var dentsH = '', dentsB = '';
  for(var k8 = 0; k8 < 13; k8++){ var t8 = k8 / 13 * .92, a8 = surCourbe(lH, t8), b8 = surCourbe(lB, t8), h8 = 7.5 - t8 * 4.5; a8 = [a8[0] + 2, a8[1] + 5 - t8 * 2]; b8 = [b8[0] + 2, b8[1] - 5 + t8 * 2];
    dentsH += 'M' + f1(a8[0] - 2.4) + ' ' + f1(a8[1]) + ' L ' + f1(a8[0] + .6) + ' ' + f1(a8[1] + h8) + ' L ' + f1(a8[0] + 3) + ' ' + f1(a8[1] + .8) + ' Z ';
    dentsB += 'M' + f1(b8[0] - 2.4) + ' ' + f1(b8[1]) + ' L ' + f1(b8[0] + .2) + ' ' + f1(b8[1] - h8) + ' L ' + f1(b8[0] + 3) + ' ' + f1(b8[1] - .8) + ' Z '; }
  c += P(dentsH, '#f6f2dc', ' stroke-width="1.2"') + P(tube(lH, [13, 11, 9, 7, 5]).d, D.g('#8a9a62'), ' stroke-width="2.4"') + L(lisse(lH.map(function(p){ return [p[0], p[1] - 3]; }).slice(0, 4)), '#f0ffd8', 1.6, ' opacity=".6"');
  c += L('M58 242 C 62 270 58 296 60 318 M92 254 C 96 280 94 300 96 316', GLU, 1.6, ' opacity=".5"');
  s.corpsArt = c;
  /* la mâchoire du bas : le menton, la lèvre, les dents, la bave qui pend ; elle claque autour du coin de la gueule */
  var mach = F(MENTON_D, gPeau) + '<g' + D.clip(MENTON_D) + '>' + F('M60 322 C 110 352 180 372 260 360 C 300 352 324 330 330 300 C 320 340 270 372 196 374 C 130 372 84 352 60 322 Z', VENTRE, ' opacity=".9"') + douce(D, 120, 350, 60, 14, '#000', .25) + '</g>';
  mach += L('M48 356 C 54 356 64 356 78 358 C 104 364 148 370 194 372 C 206 373 220 373 232 372', O, 3);
  mach += P(dentsB, '#f6f2dc', ' stroke-width="1.2"') + P(tube(lB, [13, 11, 9, 7, 5]).d, D.g('#8a9a62'), ' stroke-width="2.4"') + L(lisse(lB.map(function(p){ return [p[0], p[1] - 2]; }).slice(0, 4)), '#f0ffd8', 1, ' opacity=".35"');
  mach += piv('bave', 68, 358, P('M66 358 C 64 364 68 368 64 374 C 68 380 74 378 74 372 C 72 366 72 362 74 356 Z', GLU, ' stroke-width="1.4" opacity=".75"') + C(67, 374, 1.4, '#ffffff', ' opacity=".9"') + ancre('baveBout', 68, 378));
  s.machoire = piv('machoire', 154, 292, mach + ancre('bouche', 70, 300));
  /* ---- les yeux globuleux, sur le dessus de la tête, et leurs paupières ---- */
  function oeil(nom, cx, cy, r, loin){
    var o = '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 2.1) + '" fill="' + D.doux('#e8f070', .5) + '" opacity="' + (loin ? .6 : .9) + '"/>';
    o += P('M' + (cx - r * 1.35) + ' ' + (cy + r * .9) + ' C ' + (cx - r * 1.4) + ' ' + (cy - r * 1.1) + ' ' + (cx + r * 1.3) + ' ' + (cy - r * 1.3) + ' ' + (cx + r * 1.35) + ' ' + (cy + r * .8) + ' Z', D.g(loin ? sombre(peau, .2) : peau));
    var globe = 'M' + f1(cx - r) + ' ' + f1(cy - r * .1) + ' a ' + r + ' ' + r + ' 0 1 0 ' + f1(2 * r) + ' 0 a ' + r + ' ' + r + ' 0 1 0 ' + f1(-2 * r) + ' 0 Z';
    o += P(globe, D.rad([[0, '#fffbc0'], [.45, '#e8d030'], [.85, '#c87018'], [1, '#6a3008']], .42, .4, .62), ' stroke-width="2.6"');
    o += vari('rouge', F(globe, D.rad([[0, '#fff2a0'], [.45, '#ff6a2a'], [.85, '#c81a14'], [1, '#5a0408']], .42, .4, .62)));
    var dedans = '<ellipse cx="' + (cx - r * .2) + '" cy="' + (cy - r * .05) + '" rx="' + (r * .62) + '" ry="' + (r * .2) + '" fill="#0a0806"/>' + C(cx - r * .38, cy - r * .48, r * .26, '#ffffff') + C(cx + r * .36, cy + r * .22, r * .1, '#ffffff', ' opacity=".7"');
    /* la paupière gluante : au repos un croissant en haut ; elle descend pour cligner */
    var paup = P('M' + (cx - r * 1.3) + ' ' + (cy - r * 2.4) + ' L ' + (cx + r * 1.3) + ' ' + (cy - r * 2.4) + ' L ' + (cx + r * 1.25) + ' ' + (cy - r * .15) + ' C ' + (cx + r * .6) + ' ' + (cy - r * .7) + ' ' + (cx - r * .6) + ' ' + (cy - r * .75) + ' ' + (cx - r * 1.2) + ' ' + (cy - r * .2) + ' Z', D.g(loin ? sombre(peau, .25) : clair(peau, .05)), ' stroke-width="2.4"') + L('M' + (cx - r * .6) + ' ' + (cy - r * 1.1) + ' Q ' + cx + ' ' + (cy - r * 1.32) + ' ' + (cx + r * .7) + ' ' + (cy - r * 1.05), '#f4ffe8', 1.6, ' opacity=".7"');
    o += '<g' + D.clip(globe) + '>' + dedans + piv(nom, cx, cy - r, paup) + '</g>';
    return o;
  }
  s.yeux = oeil('paupF', 214, 176, 15, true) + oeil('paupP', 146, 190, 20, false) + ancre('tete', 170, 160);
  s.bras = P('M168 352 C 164 362 160 370 152 374 C 162 376 172 370 176 360 Z', D.g(clair(peau, .1)), ' stroke-width="2.2"');
  /* ---- les variantes des états ---- */
  s.flash = vari('flash', F(CORPS_D, '#ffffff')) + vari('flashG', F(CORPS_D, '#d8f0ff'));
  var pate = '<path d="M-20 4 C -20 -8 -10 -12 0 -11 C 10 -12 20 -8 20 4 C 12 10 -12 10 -20 4 Z" fill="#d0e05a" fill-opacity=".92" stroke="#5a6420" stroke-width="1.6"/><path d="M-12 -4 Q 0 -9 12 -4" fill="none" stroke="#fbffd0" stroke-width="1.6" opacity=".8"/>';
  s.colle = vari('colle', '<g transform="translate(200 214) scale(1.4)">' + pate + '</g><g transform="translate(300 330)">' + pate + '</g>');
  var gF1 = D.lin([[0, '#ff4a10'], [.6, '#ff8a1a'], [1, '#ffc040', .8]], 0, 1, 0, 0), gF2 = D.lin([[0, '#ffd040'], [1, '#fff8c0']], 0, 1, 0, 0);
  var feu = douce(D, 220, 170, 150, 70, '#ff8a20', .45);
  [[150, 190, 70, 32], [200, 180, 96, 40], [250, 186, 80, 34], [290, 206, 58, 26]].forEach(function(f, k){ feu += '<g transform="translate(' + f[0] + ' ' + f[1] + ')">' + piv('x-fl' + k, 0, 0, '<path d="' + flammeD(f[2], f[3]) + '" fill="' + gF1 + '" stroke="#5a1a08" stroke-width="2"/><path d="' + flammeD(f[2] * .7, f[3] * .62) + '" fill="#ffa21e"/><path d="' + flammeD(f[2] * .42, f[3] * .36) + '" fill="' + gF2 + '"/>') + '</g>'; });
  s.feu = vari('feu', feu);
  var et = '';
  for(var ie = 0; ie < 4; ie++) et += piv('x-et' + ie, 0, 0, '<circle r="24" fill="' + D.doux('#fff6c0', .6) + '"/><path d="' + etoileD(20 - (ie % 2) * 5, 5, .45) + '" fill="#ffe466" stroke="' + O + '" stroke-width="2.6"/>');
  s.etoiles = vari('etoiles', et);
  return s;
}

/* ============ 3. Le CSS ============ */
var CSS = '.bt-tetard{position:relative;width:100%;height:100%}' +
  '.bt-tetard>svg{width:100%;height:100%;overflow:visible;display:block}' +
  '.bt-tetard [data-j]{transform-box:view-box;transform-origin:0 0}' +
  '.bt-tetard-scene-fx{position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;pointer-events:none;z-index:6}';
function injecterCSS(){ if(document.getElementById('bt-tetard-css')) return; var s = document.createElement('style'); s.id = 'bt-tetard-css'; s.textContent = CSS; document.head.appendChild(s); }

/* ============ 4. Le moteur de poses (le même que les autres bêtes) ============ */
var Z = {x: 0, y: 0, a: 0, sx: 1, sy: 1}, VB = {x: 0, y: 70, w: 540, h: 380};
function r3(n){ return Math.round(n * 1000) / 1000; }
function tf(v){ return 'translate(' + r3(v.x) + 'px,' + r3(v.y) + 'px) rotate(' + r3(v.a) + 'deg) scale(' + r3(v.sx) + ',' + r3(v.sy) + ')'; }
function fusion(a, b){ var o = {x: a.x, y: a.y, a: a.a, sx: a.sx, sy: a.sy}; if(b){ for(var k in o) if(b[k] != null) o[k] = b[k]; if(b.s != null){ o.sx = b.s; o.sy = b.s; } } return o; }
function attendreMs(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }
function fini(a){ return a && a.finished ? a.finished.then(function(){}, function(){}) : Promise.resolve(); }
function hasard(a, b){ return a + Math.random() * (b - a); }
function choisir(l){ return l[Math.floor(Math.random() * l.length)]; }

function Tetard(conteneur, options){
  injecterCSS();
  this.c = conteneur; this.opt = options || {};
  var D = new Defs('btT' + (++NUM) + '_'), s = dessiner(D);
  /* la chaîne : pos (place, saut) > secousse > posture (sur le dos) > corps (respiration) */
  var chaine = piv('pos', 200, 372, piv('saut', 200, 372, piv('secousse', 200, 300, piv('posture', 200, 290, piv('corps', 200, 372,
    s.queue + s.patteF + s.patte + s.corpsArt + s.machoire + s.yeux + s.bras + s.flash + s.colle + s.feu + s.etoiles +
    ancre('centre', 200, 280) + ancre('pointfaible', 200, 330) + ancre('pieds', 200, 372) + ancre('haut', 200, 170) + ancre('dos', 220, 186))))));
  var div = document.createElement('div');
  div.className = 'bt-tetard';
  div.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + VB.x + ' ' + VB.y + ' ' + VB.w + ' ' + VB.h + '" preserveAspectRatio="xMidYMax meet"><defs>' + D.l.join('') + '</defs>' +
    sansOpacite(s.flaque + s.colleSol + vari('bete', chaine, 1) + s.devant + s.glace) + '<g data-slot="monde"></g></svg>';
  conteneur.appendChild(div);
  this.el = div; this.svg = div.querySelector('svg'); D.vivant = this.svg.querySelector('defs'); this.D = D;
  var self = this;
  this.J = {}; this.V = {}; this.K = {}; this.A = {}; this.S = {};
  [].forEach.call(this.svg.querySelectorAll('[data-j]'), function(e){ var n = e.getAttribute('data-j'), r = n.indexOf('v-') === 0 ? self.V : (n.indexOf('x-') === 0 ? self.K : self.J); if(r !== self.J) n = n.slice(2); (r[n] = r[n] || []).push(e); });
  [].forEach.call(this.svg.querySelectorAll('[data-a]'), function(e){ self.A[e.getAttribute('data-a')] = e; });
  this.S.monde = this.svg.querySelector('[data-slot="monde"]');
  this.v = {}; this.boucles = []; this.boucX = {}; this.minuteurs = []; this.fx = {}; this.nbP = 0;
  this.etat = {enrage: false, brule: false, colle: false, ebloui: false, gele: false, ouvert: false, dos: false, cible: false};
  this.attente = true; this.jeton = 0; this.enAction = false; this.mort = false;
  this._reprendre(0);
}
var R = Tetard.prototype;
R._lire = function(n){
  var el = this.J[n][0], ref = this.v[n] || Z, t = getComputedStyle(el).transform;
  if(!t || t === 'none') return fusion(Z);
  var m = t.match(/matrix\(([^)]+)\)/); if(!m) return fusion(ref);
  var v = m[1].split(',').map(parseFloat), sx = Math.hypot(v[0], v[1]), ang = Math.atan2(v[1], v[0]) * 180 / Math.PI, sy = (v[0] * v[3] - v[1] * v[2]) / (sx || 1);
  while(ang - ref.a > 180) ang -= 360; while(ang - ref.a < -180) ang += 360;
  return {x: v[4], y: v[5], a: ang, sx: sx, sy: sy};
};
R._figer = function(){ var self = this; Object.keys(this.J).forEach(function(n){ var v = self._lire(n); self.J[n].forEach(function(el){ el.getAnimations().forEach(function(a){ a.cancel(); }); el.style.transform = tf(v); }); self.v[n] = v; }); };
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
R._ou = function(nom){ var el = this.A[nom], m = el.getCTM(), w = this.S.monde.getCTM(), p = this.svg.createSVGPoint(); p.x = +el.getAttribute('cx'); p.y = +el.getAttribute('cy'); p = p.matrixTransform(m).matrixTransform(w.inverse()); return [p.x, p.y]; };
R._minuteur = function(f, ms){ var self = this, id = setTimeout(function(){ var i = self.minuteurs.indexOf(id); if(i >= 0) self.minuteurs.splice(i, 1); f(); }, ms); this.minuteurs.push(id); };
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
R._boucleX = function(nom, frames, duree, o){ o = o || {}; var self = this; (this.K[nom] || []).forEach(function(e){ (self.boucX[nom] = self.boucX[nom] || []).push(e.animate(frames, {duration: duree, iterations: Infinity, delay: o.delai || 0, easing: o.e || 'linear', direction: o.dir || 'normal'})); }); };
R._couperX = function(p){ var self = this; Object.keys(this.boucX).forEach(function(n){ if(n.indexOf(p) === 0){ self.boucX[n].forEach(function(a){ a.cancel(); }); delete self.boucX[n]; } }); };
/* une particule (forme simple, retirée à la fin ; au-delà de 20 en même temps, elle n'est pas affichée) */
R._part = function(html){
  var self = this, g = document.createElementNS(NS, 'g');
  g.innerHTML = html;
  if(this.nbP < 20){ this.S.monde.appendChild(g); this.nbP++; g.remove = function(){ if(g.parentNode){ self.nbP--; Element.prototype.remove.call(g); } }; }
  return g;
};
R._vole = function(html, frames, o){ var g = this._part(html); g.animate(frames, {duration: o.duree || 600, delay: o.delai || 0, easing: o.e || 'ease-out', fill: 'both'}).finished.then(function(){ g.remove(); }, function(){ g.remove(); }); return g; };
function T(x, y, s, a){ return 'translate(' + f1(x) + 'px,' + f1(y) + 'px)' + (a != null ? ' rotate(' + f1(a) + 'deg)' : '') + (s != null ? ' scale(' + s + ')' : ''); }

/* ============ 5. Les poses, l'attente ============ */
var POSES = {normal: {}, dos: {posture: {a: 180, y: -46}, patte: {a: -30}, queue: {a: -20}, machoire: {a: 8}}};
R._base = function(){
  var p = {}, m = POSES[this.etat.dos ? 'dos' : 'normal'], n;
  for(n in m) p[n] = fusion(Z, m[n]);
  if(this.etat.ebloui && !this.etat.dos){ p.paupP = fusion(Z, {y: 22}); p.paupF = fusion(Z, {y: 16}); }
  if(this.etat.gele){ p.machoire = fusion(Z, {a: -4}); }
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
R._lancerBoucles = function(){
  var self = this, b = this._base(), e = this.etat, V = e.enrage ? 1.6 : (e.gele ? .35 : 1);
  function boucle(n, deltas, duree, delai){
    var v0 = fusion(Z, b[n]);
    var cles = deltas.map(function(d){ var o = {}; o[n] = {}; for(var k in d[1]) o[n][k] = (k === 'sx' || k === 'sy') ? v0[k] * d[1][k] : v0[k] + d[1][k]; return {t: d[0], p: o}; });
    return self._seq(cles, duree, {boucle: true, vitesse: V, depuis: b, delai: delai || 0});
  }
  if(!e.dos){
    /* il gigote dans sa flaque : le corps s'écrase et s'étire, la queue frétille, la gueule bâille */
    boucle('corps', [[0, {sx: 1, sy: 1}], [.5, {sx: 1.03, sy: .96}], [1, {sx: 1, sy: 1}]], 900);
    boucle('saut', [[0, {y: 0}], [.25, {y: -3}], [.5, {y: 0}], [.75, {y: -2}], [1, {y: 0}]], 900);
    boucle('queue', [[0, {a: 0}], [.25, {a: 8}], [.5, {a: -2}], [.75, {a: 6}], [1, {a: 0}]], 640);
    boucle('queueB', [[0, {a: 0}], [.25, {a: -12}], [.5, {a: 10}], [.75, {a: -8}], [1, {a: 0}]], 640, -160);
    boucle('machoire', [[0, {a: 0}], [.4, {a: 7}], [.6, {a: 6}], [1, {a: 0}]], 1500);
    boucle('patte', [[0, {a: 0}], [.5, {a: -8}], [1, {a: 0}]], 900, -200);
    boucle('bave', [[0, {sy: 1}], [.6, {sy: 1.5}], [1, {sy: 1}]], 1500);
  } else {
    boucle('posture', [[0, {a: 0}], [.25, {a: 6}], [.75, {a: -6}], [1, {a: 0}]], 600);
    boucle('queue', [[0, {a: 0}], [.5, {a: 22}], [1, {a: 0}]], 300);
    boucle('queueB', [[0, {a: 0}], [.5, {a: -26}], [1, {a: 0}]], 300, -80);
    boucle('patte', [[0, {a: 0}], [.5, {a: 30}], [1, {a: 0}]], 260);
    boucle('machoire', [[0, {a: 0}], [.5, {a: 10}], [1, {a: 0}]], 400);
  }
  if(e.enrage) boucle('secousse', [[0, {x: 0}], [.5, {x: 1.5}], [1, {x: 0}]], 120);
  else if(e.cible) boucle('secousse', [[0, {x: 0}], [.5, {x: .8}], [1, {x: 0}]], 220);
  this._planifier(400);
};
R._planifier = function(ms){ var self = this; this._minuteur(function(){ if(self.enAction || self.mort || !self.attente) return; self._evenement(); self._planifier(hasard(900, 2200)); }, ms); };
R._evenement = function(){
  var self = this, A = {ajout: true}, ev = choisir(this.etat.dos ? ['cligne', 'gigote'] : ['cligne', 'cligne', 'claque', 'bave', 'fouette', 'bulle']);
  if(ev === 'cligne') this._seq([{t: 0, p: {paupP: {y: 0}, paupF: {y: 0}}}, {t: .4, p: {paupP: {y: 42}, paupF: {y: 32}}, e: 'ease-in'}, {t: 1, p: {paupP: {y: 0}, paupF: {y: 0}}, e: 'ease-out'}], 260, A);
  else if(ev === 'claque') this._seq([{t: 0, p: {machoire: {a: 0}}}, {t: .3, p: {machoire: {a: 10}}}, {t: .45, p: {machoire: {a: -24}}, e: 'cubic-bezier(.6,0,.9,.5)'}, {t: .7, p: {machoire: {a: 2}}}, {t: 1, p: {machoire: {a: 0}}}], 520, A);
  else if(ev === 'bave') this._goutte();
  else if(ev === 'fouette') this._seq([{t: 0, p: {queue: {a: 0}, queueB: {a: 0}}}, {t: .3, p: {queue: {a: 16}, queueB: {a: -24}}}, {t: .6, p: {queue: {a: -8}, queueB: {a: 18}}}, {t: 1, p: {queue: {a: 0}, queueB: {a: 0}}}], 420, A);
  else if(ev === 'bulle'){ var p = this._ou('bouche'); this._bulle([p[0] - 10, p[1] - 10]); }
  else if(ev === 'gigote') this._seq([{t: 0, p: {patte: {a: 0}, queue: {a: 0}}}, {t: .25, p: {patte: {a: 40}, queue: {a: 30}}}, {t: .5, p: {patte: {a: -10}, queue: {a: -20}}}, {t: .75, p: {patte: {a: 30}, queue: {a: 24}}}, {t: 1, p: {patte: {a: 0}, queue: {a: 0}}}], 700, A);
};

/* ============ 6. Petits effets ============ */
R._goutte = function(){
  var self = this;
  this._seq([{t: 0, p: {bave: {sy: 1}}}, {t: .75, p: {bave: {sy: 2.4, sx: .8}}, e: 'ease-in'}, {t: .85, p: {bave: {sy: .6, sx: 1}}}, {t: 1, p: {bave: {sy: 1, sx: 1}}}], 1100, {ajout: true});
  setTimeout(function(){ var p = self._ou('baveBout'); self._vole(P(goutteD(0, 0, 3, Math.PI / 2), GLU, ' stroke-width="1.2"'), [{transform: T(p[0], p[1])}, {transform: T(p[0], 382)}], {duree: 260, e: 'ease-in'}); }, 830);
};
R._bulle = function(p, k){
  k = k || 1;
  var r = 7 * k;
  this._vole('<circle r="' + r + '" fill="#d8f4c0" fill-opacity=".3" stroke="#f0ffe0" stroke-width="2"/><circle cx="' + (-r * .35) + '" cy="' + (-r * .35) + '" r="' + (r * .3) + '" fill="#fff"/>', [{transform: T(p[0], p[1], .3)}, {offset: .8, transform: T(p[0] - 20, p[1] - 30, 1.1), opacity: 1}, {transform: T(p[0] - 24, p[1] - 36, 1.5), opacity: 0}], {duree: 900});
};
R._gerbe = function(x, y, k, coul){
  for(var i = 0; i < 8; i++){
    var a = -Math.PI * hasard(.1, .9), v = hasard(40, 110) * k, r = hasard(3, 6);
    this._vole('<circle r="' + f1(r) + '" fill="' + (coul || '#5a7a9a') + '" stroke="' + O + '" stroke-width="1.2"/><circle cx="' + f1(-r * .3) + '" cy="' + f1(-r * .3) + '" r="' + f1(r * .35) + '" fill="#d8f0ff"/>',
      [{transform: T(x, y)}, {offset: .45, transform: T(x + Math.cos(a) * v * .6, y + Math.sin(a) * v)}, {transform: T(x + Math.cos(a) * v * 1.1, y + 10), opacity: .2}], {duree: hasard(500, 750), e: 'cubic-bezier(.2,.6,.5,1)'});
  }
  this._vole('<ellipse rx="60" ry="10" fill="none" stroke="' + LUNE + '" stroke-width="3"/>', [{transform: T(x, y + 4, .3), opacity: .9}, {transform: T(x, y + 4, 1.6 * k), opacity: 0}], {duree: 700});
};
R._eclat = function(p, k, coul){ this._vole('<path d="' + etoileD(26 * (k || 1), 8, .42) + '" fill="' + (coul || '#fff6c0') + '" stroke="' + O + '" stroke-width="2.4"/>', [{transform: T(p[0], p[1], .3), opacity: 1}, {offset: .3, transform: T(p[0], p[1], 1.1)}, {transform: T(p[0], p[1], 1.3), opacity: 0}], {duree: 380}); };
R._flash = function(nom, op, ms){
  (this.V[nom || 'flash'] || []).forEach(function(e){ e.getAnimations().forEach(function(a){ a.cancel(); }); e.removeAttribute('visibility'); e.animate([{opacity: op || .8}, {opacity: 0}], {duration: ms || 300, easing: 'steps(3, end)'}).finished.then(function(){ if(+e.getAttribute('opacity') <= 0) e.setAttribute('visibility', 'hidden'); }, function(){}); });
};
R._etoiles = function(on){
  this._couperX('et');
  if(!on){ this._fondu('etoiles', 0, 200); return; }
  this._fondu('etoiles', 1, 200);
  for(var k = 0; k < 4; k++){
    var fr = [];
    for(var s = 0; s <= 12; s++){ var a = s / 12 * Math.PI * 2 + k * Math.PI / 2, d = Math.sin(a); fr.push({transform: T(180 + Math.cos(a) * 80, 140 + d * 20, f1(.75 + d * .3), s * 30), opacity: f1(.55 + d * .45)}); }
    this._boucleX('et' + k, fr, 1200);
  }
};
R._feu = function(on){
  this._couperX('fl');
  this._fondu('feu', on ? 1 : 0, 250);
  if(on) for(var k = 0; k < 4; k++) this._boucleX('fl' + k, [{transform: 'scale(1,1) skewX(0deg)'}, {offset: .4, transform: 'scale(.88,1.18) skewX(-7deg)'}, {transform: 'scale(1.06,.92) skewX(5deg)'}], 300 + k * 60, {dir: 'alternate', e: 'ease-in-out', delai: -k * 90});
};

/* ============ 7. Les actions ============ */
R._debutAction = function(){ this.jeton++; this.reprise = (this.reprise || 0) + 1; this.enAction = true; this._couperBoucles(); return this.jeton; };
R._finAction = function(j, d){ if(j !== this.jeton || this.mort) return Promise.resolve(); this.enAction = false; return this._reprendre(d); };
/* il saute hors de l'eau du bassin (à droite, derrière) et atterrit en flaque */
R.entrer = function(distance){
  var self = this, j = this._debutAction(), d = distance == null ? 320 : distance;
  this._fondu(['flaque', 'devant'], 0, 0);
  this.el.style.visibility = '';
  var vol = this.el.animate([{transform: 'translateX(' + d + 'px)'}, {transform: 'translateX(0px)'}], {duration: 700, easing: 'cubic-bezier(.3,.3,.6,1)', fill: 'both'});
  vol.finished.then(function(){ self.el.style.transform = ''; vol.cancel(); }, function(){});
  var s = this._seq([{t: 0, p: {saut: {y: 60, sy: 1.1, sx: .9}, posture: {a: 30}, queue: {a: 20}, queueB: {a: -20}, machoire: {a: 10}}},
    {t: .3, p: {saut: {y: -170, sy: 1.08, sx: .94}, posture: {a: 8}, queue: {a: -14}, queueB: {a: 24}}, e: 'cubic-bezier(.2,.8,.4,1)'},
    {t: .55, p: {saut: {y: -60, sy: 1.04}, posture: {a: -10}, queue: {a: 16}, queueB: {a: -20}}, e: 'ease-in'},
    {t: .64, p: {saut: {y: 8, sy: .72, sx: 1.22}, posture: {a: 0}, queue: {a: -10}, queueB: {a: 14}, machoire: {a: -4}}, e: 'cubic-bezier(.6,0,1,.6)'},
    {t: .8, p: {saut: {y: -16, sy: 1.08, sx: .94}, machoire: {a: 6}}, e: 'cubic-bezier(.3,.7,.4,1)'},
    {t: 1, p: {saut: {y: 0, sy: 1, sx: 1}, queue: {a: 0}, queueB: {a: 0}, machoire: {a: 0}}, e: 'cubic-bezier(.4,0,.3,1.4)'}], 1100);
  setTimeout(function(){ self._fondu(['flaque', 'devant'], 1, 200); var p = self._ou('pieds'); self._gerbe(p[0], 376, 1); }, 700);
  return s.fini.then(function(){ return self._finAction(j, 200); });
};
/* petit bond, la gueule grande ouverte, CROC */
R.attaquer = function(nom, o){
  if(typeof nom === 'object' && nom){ o = nom; } o = o || {};
  var self = this, j = this._debutAction(), T0 = 1100;
  var s = this._seq([{t: 0, p: {}},
    {t: .25, p: {saut: {y: 6, sy: .86, sx: 1.12}, pos: {x: 14}, queue: {a: 18}, queueB: {a: -20}, machoire: {a: 4}, paupP: {y: 6}}, e: 'cubic-bezier(.3,.6,.4,1)'},
    {t: .45, p: {saut: {y: -110, sy: 1.08, sx: .94}, pos: {x: -290}, posture: {a: -10}, machoire: {a: 26}, queue: {a: -16}, queueB: {a: 26}, paupP: {y: 0}}, e: 'cubic-bezier(.2,.8,.4,1)'},
    {t: .55, p: {saut: {y: -10, sy: .92}, pos: {x: -310}, posture: {a: 4}, machoire: {a: -30}}, e: 'cubic-bezier(.7,0,1,.5)'},
    {t: .64, p: {machoire: {a: 2}, posture: {a: 0}, saut: {y: 0, sy: 1}}},
    {t: .64, p: {pos: {x: -300}}}, {t: .9, p: {pos: {x: 10}, saut: {y: -30}, queue: {a: 6}, queueB: {a: -6}}, e: 'cubic-bezier(.3,.6,.4,1)'},
    {t: 1, p: {pos: {x: 0}, saut: {y: 0, sy: 1, sx: 1}, queue: {a: 0}, queueB: {a: 0}, machoire: {a: 0}}, e: 'cubic-bezier(.5,0,.4,1.4)'}], T0);
  var impact = new Promise(function(ok){ setTimeout(function(){ var p = self._ou('bouche'); self._eclat([p[0] - 30, p[1] - 10], .9); if(o.onImpact) try{ o.onImpact(); }catch(e){} ok(); }, T0 * .55); });
  setTimeout(function(){ var p = self._ou('pieds'); self._gerbe(p[0], 376, .5); }, T0 * .3);
  var pr = s.fini.then(function(){ return self._finAction(j, 200); });
  pr.impact = impact;
  return pr;
};
/* les réactions : chaque coup a son éclat, puis il encaisse (il recule, ferme les yeux, la queue fouette) */
R.touche = function(type){
  var self = this, j = this._debutAction(), p = this._ou('centre'), A = {ajout: true}, T0 = 700;
  type = type || 'fleche';
  if(type === 'nuage') return this._quintes().then(function(){ return self._finAction(j, 200); });
  var deco = {
    'fleche': function(){ self._eclat(p, 1); }, 'fleche-argent': function(){ self._eclat(p, 1, '#e8f4ff'); self._eclat([p[0] + 20, p[1] - 20], .6, '#ffffff'); }, 'fleche-lourde': function(){ self._eclat(p, 1.4); T0 = 900; },
    'dague': function(){ self._vole(L('M-24 -20 L 24 20 M24 -20 L -24 20', O, 8) + L('M-24 -20 L 24 20 M24 -20 L -24 20', '#ffffff', 4), [{transform: T(p[0], p[1], .2)}, {offset: .3, transform: T(p[0], p[1], 1)}, {transform: T(p[0], p[1], 1.1), opacity: 0}], {duree: 450}); },
    'feu': function(){ self._flash('flash', .5); if(!self.etat.brule){ self._feu(true); setTimeout(function(){ if(!self.etat.brule) self._feu(false); }, 900); } },
    'lumiere': function(){ if(!self.etat.ebloui){ self._etoiles(true); setTimeout(function(){ if(!self.etat.ebloui) self._etoiles(false); }, 1100); } T0 = 1100; },
    'louche': function(){ var q = self._ou('haut'); self._eclat([q[0], q[1] + 10], 1.1); },
    'colle': function(){ self._vole('<path d="M-16 4 C -18 -8 -6 -14 2 -12 C 12 -14 18 -4 14 4 C 10 12 -10 12 -16 4 Z" fill="#d0e05a" stroke="#5a6420" stroke-width="1.6"/>', [{transform: T(p[0], p[1], .2)}, {offset: .2, transform: T(p[0], p[1], 1.3)}, {transform: T(p[0], p[1] + 30, 1), opacity: 0}], {duree: 900}); },
    'huile': function(){ self._vole('<ellipse rx="120" ry="10" fill="#3a2a5a" fill-opacity=".7"/><ellipse rx="80" ry="5" fill="#2a6a7a" fill-opacity=".7"/>', [{transform: T(p[0], 380, .2), opacity: 0}, {offset: .2, transform: T(p[0], 380, 1), opacity: 1}, {transform: T(p[0], 380, 1.1), opacity: 0}], {duree: 1200}); },
    'givre': function(){ self._flash('flashG', .85, 700); },
    'acide': function(){ for(var i = 0; i < 6; i++) self._vole('<circle r="5" fill="#9aea4a" fill-opacity=".6" stroke="#3a6a1a" stroke-width="1.2"/>', [{transform: T(p[0] + hasard(-60, 60), p[1] + hasard(-40, 30), .2)}, {transform: T(p[0] + hasard(-60, 60), p[1] - 30, 1.3), opacity: 0}], {duree: 600, delai: i * 70}); },
    'bruit': function(){ var q = self._ou('haut'); self._vole(L('M0 -24 L 0 4', O, 10) + L('M0 -24 L 0 4', '#ffe066', 5) + C(0, 16, 5, '#ffe066', ' stroke="' + O + '" stroke-width="2.4"'), [{transform: T(q[0], q[1] - 10, .3), opacity: 0}, {offset: .2, transform: T(q[0], q[1] - 30, 1.2), opacity: 1}, {transform: T(q[0], q[1] - 34, 1), opacity: 0}], {duree: 900}); },
    'bouclier': function(){ var q = self._ou('bouche'); self._vole('<circle r="40" fill="none" stroke="#8ff3ff" stroke-width="4"/>', [{transform: T(q[0] - 30, q[1], .4), opacity: 1}, {transform: T(q[0] - 30, q[1], 1.4), opacity: 0}], {duree: 600}); },
    'rebond': function(){ self._eclat(p, .8); }
  };
  (deco[type] || deco.fleche)();
  if(type !== 'givre' && type !== 'feu') this._flash('flash', .7);
  var k = type === 'fleche-lourde' ? 1.4 : 1;
  this._seq([{t: 0, p: {secousse: {x: 0, a: 0}, saut: {sx: 1, sy: 1}, paupP: {y: 0}, paupF: {y: 0}, machoire: {a: 0}, queue: {a: 0}, queueB: {a: 0}}},
    {t: .12, p: {secousse: {x: 18 * k, a: 6 * k}, saut: {sx: .9, sy: 1.08}, paupP: {y: 42}, paupF: {y: 32}, machoire: {a: 14}, queue: {a: 20}, queueB: {a: -26}}, e: 'cubic-bezier(.1,.9,.3,1)'},
    {t: .45, p: {secousse: {x: 6, a: -2}, saut: {sx: 1.04, sy: .97}, paupP: {y: 10}, paupF: {y: 8}, queue: {a: -10}, queueB: {a: 14}}},
    {t: 1, p: {secousse: {x: 0, a: 0}, saut: {sx: 1, sy: 1}, paupP: {y: 0}, paupF: {y: 0}, machoire: {a: 0}, queue: {a: 0}, queueB: {a: 0}}, e: 'cubic-bezier(.4,0,.3,1.3)'}], T0, A);
  return attendreMs(T0).then(function(){ return self._finAction(j, 200); });
};
R.tousser = function(){ var self = this, j = this._debutAction(); return this._quintes().then(function(){ return self._finAction(j, 200); }); };
R._quintes = function(){
  var self = this, T0 = 2400, k = [{t: 0, p: {machoire: {a: 0}, secousse: {x: 0}, paupP: {y: 0}}}];
  [.08, .4, .72].forEach(function(t, i){
    k.push({t: t, p: {machoire: {a: 20}, secousse: {x: -10}, paupP: {y: 40}}, e: 'cubic-bezier(.1,.9,.3,1)'});
    k.push({t: t + .14, p: {machoire: {a: 2}, secousse: {x: 0}, paupP: {y: 12}}});
    setTimeout(function(){ var p = self._ou('bouche'); for(var n = 0; n < 3; n++) self._bulle([p[0] - 6 - n * 6, p[1] - n * 4], 1 + n * .3); }, T0 * t);
  });
  k.push({t: 1, p: {machoire: {a: 0}, secousse: {x: 0}, paupP: {y: 0}}});
  this._seq(k, T0, {ajout: true});
  return attendreMs(T0);
};
R.special = function(nom){
  var self = this, j = this._debutAction();
  var p = this._ou('pieds');
  this._gerbe(p[0], 376, .8);
  return this._seq([{t: 0, p: {saut: {y: 0, sy: 1}}}, {t: .3, p: {saut: {y: 8, sy: .8, sx: 1.15}}}, {t: .6, p: {saut: {y: -20, sy: 1.08}}}, {t: 1, p: {saut: {y: 0, sy: 1, sx: 1}}}], 600, {ajout: true}).fini.then(function(){ return self._finAction(j, 200); });
};
/* il retourne à l'eau en se tortillant : deux bonds vers la droite, et plouf */
R.fuir = function(){
  var self = this, j = this._debutAction();
  ['ebloui', 'brule', 'colle', 'enrage', 'cible', 'ouvert'].forEach(function(n){ if(self.etat[n]) self._visuel(n, false); self.etat[n] = false; });
  var tort = [{t: 0, p: {posture: {a: 0}, queue: {a: 0}, queueB: {a: 0}}}];
  for(var i = 1; i < 6; i++) tort.push({t: i / 6, p: {posture: {a: i % 2 ? 12 : -12}, queue: {a: i % 2 ? -26 : 26}, queueB: {a: i % 2 ? 30 : -30}, machoire: {a: 12}, paupP: {y: 0}}});
  tort.push({t: 1, p: {posture: {a: 0}, queue: {a: 0}, queueB: {a: 0}}});
  return this._seq(tort, 700).fini.then(function(){
    /* il se retourne vers le bassin, et bondit */
    var tour = self.el.animate([{transform: 'scaleX(1)'}, {transform: 'scaleX(-1)'}], {duration: 160, fill: 'forwards'});
    return fini(tour).then(function(){
      var bonds = self.el.animate([{transform: 'translateX(0px) scaleX(-1)'}, {transform: 'translateX(160px) scaleX(-1)'}, {transform: 'translateX(380px) scaleX(-1)'}], {duration: 1100, easing: 'linear', fill: 'forwards'});
      self._seq([{t: 0, p: {saut: {y: 0}}}, {t: .25, p: {saut: {y: -90}}, e: 'ease-out'}, {t: .5, p: {saut: {y: 0}}, e: 'ease-in'}, {t: .75, p: {saut: {y: -80}}, e: 'ease-out'}, {t: 1, p: {saut: {y: 40}}, e: 'ease-in'}], 1100);
      self._seq([{t: 0, p: {queue: {a: 0}}}, {t: .25, p: {queue: {a: 24}}}, {t: .5, p: {queue: {a: -20}}}, {t: .75, p: {queue: {a: 24}}}, {t: 1, p: {queue: {a: -10}}}], 1100);
      setTimeout(function(){ self._fondu(['flaque', 'devant', 'colleSol', 'glace'], 0, 500); }, 200);
      return fini(bonds);
    });
  }).then(function(){ self._couperBoucles(); self.el.style.visibility = 'hidden'; self.enAction = false; self.mort = true; });
};
R.mourir = function(){ return this.fuir(); };
/* le critique : SPLATCH, un éclat gluant, et il reste une petite arête dans une flaque de glu */
R.exploser = function(scene){
  var self = this, j = this._debutAction(), boomOk, boomP = new Promise(function(ok){ boomOk = ok; });
  ['ebloui', 'brule', 'colle', 'enrage'].forEach(function(n){ if(self.etat[n]) self._visuel(n, false); self.etat[n] = false; });
  var k = [{t: 0, p: {}}];
  for(var i = 1; i <= 6; i++) k.push({t: i / 7, p: {corps: {sx: 1 + i * .04, sy: 1 + i * .05}, secousse: {x: i % 2 ? 4 : -4}, machoire: {a: i * 3}}, e: 'linear'});
  k.push({t: 1, p: {corps: {sx: 1.32, sy: 1.4}}, e: 'ease-in'});
  this._flash('flash', .6, 420);
  var pr = this._seq(k, 420).fini.then(function(){
    scene = scene || self.c.parentNode || self.c;
    if(getComputedStyle(scene).position === 'static') scene.style.position = 'relative';
    var sr = scene.getBoundingClientRect(), W = scene.offsetWidth || sr.width, H = scene.offsetHeight || sr.height, ech = W / (sr.width || 1);
    var cr = self.A.centre.getBoundingClientRect(), cx = (cr.left - sr.left) * ech, cy = (cr.top - sr.top) * ech, r0 = self.svg.getBoundingClientRect(), u = r0.width * ech / VB.w;
    var ov = document.createElementNS(NS, 'svg');
    ov.setAttribute('class', 'bt-tetard-scene-fx ra-scene-fx'); ov.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    ov.innerHTML = '<defs><radialGradient id="btTb' + NUM + '"><stop offset="0" stop-color="#0c0812"/><stop offset=".55" stop-color="#1a1222" stop-opacity=".95"/><stop offset="1" stop-color="#22182c" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="btTg' + NUM + '"><stop offset="0" stop-color="#f4ffd0"/><stop offset=".5" stop-color="#b8e070" stop-opacity=".8"/><stop offset="1" stop-color="#6a9a3a" stop-opacity="0"/></radialGradient></defs>';
    scene.appendChild(ov);
    function g(html, frames, o){ var e = document.createElementNS(NS, 'g'); e.innerHTML = html; ov.appendChild(e); return e.animate(frames, {duration: o.d, delay: o.dl || 0, easing: o.e || 'ease-out', fill: 'forwards'}); }
    self._fondu('bete', 0, 0);
    boomOk();
    var brumes = [];
    for(var n = 0; n < 6; n++){ var a = n / 6 * Math.PI * 2, dx = Math.cos(a) * 60 * u, dy = Math.sin(a) * 30 * u - 20 * u; brumes.push(g('<circle r="' + f1(hasard(40, 60) * u) + '" fill="url(#btTb' + NUM + ')"/>', [{transform: T(cx, cy, .2), opacity: 0}, {offset: .06, opacity: 1, transform: T(cx + dx * .5, cy + dy * .5, 1)}, {offset: .55, opacity: .85, transform: T(cx + dx, cy + dy - 20 * u, 1.4)}, {transform: T(cx + dx * 1.3, cy + dy - 60 * u, 1.9), opacity: 0}], {d: hasard(2600, 3400), e: 'cubic-bezier(.12,.75,.3,1)'})); }
    /* des paquets de glu verte qui giclent et retombent en s'aplatissant */
    for(var b = 0; b < 9; b++){ var ab = -Math.PI * (.08 + b * .1), vb = hasard(70, 140) * u, rb = hasard(5, 9) * u;
      g('<path d="M' + f1(-rb) + ' 0 C ' + f1(-rb) + ' ' + f1(-rb * 1.2) + ' ' + f1(rb) + ' ' + f1(-rb * 1.2) + ' ' + f1(rb) + ' 0 C ' + f1(rb) + ' ' + f1(rb * .9) + ' ' + f1(-rb) + ' ' + f1(rb * .9) + ' ' + f1(-rb) + ' 0 Z" fill="' + choisir(['#b8e070', '#8ab850', '#d8f4c0']) + '" stroke="' + O + '" stroke-width="' + f1(1.4 * u) + '"/>',
        [{transform: T(cx, cy, .4)}, {offset: .45, transform: T(cx + Math.cos(ab) * vb, cy + Math.sin(ab) * vb, 1.1), opacity: 1}, {offset: .8, transform: T(cx + Math.cos(ab) * vb * 1.3, cy + 40 * u, 1.2)}, {transform: T(cx + Math.cos(ab) * vb * 1.35, cy + 44 * u, 1.4), opacity: 0}], {d: hasard(1100, 1500), e: 'cubic-bezier(.2,.6,.6,1)'}); }
    /* SPLATCH : une étoile de glu, l'éclair et l'onde, par-dessus tout */
    g('<path d="' + etoileD(80 * u, 11, .5) + '" fill="#c8f070" stroke="' + O + '" stroke-width="' + f1(3 * u) + '"/><path d="' + etoileD(48 * u, 11, .5) + '" fill="#f4ffd0"/>', [{transform: T(cx, cy, .15, 0), opacity: 1}, {offset: .35, transform: T(cx, cy, 1, 14), opacity: 1}, {transform: T(cx, cy, 1.15, 22), opacity: 0}], {d: 480, e: 'cubic-bezier(.1,.8,.3,1)'});
    g('<circle r="' + f1(70 * u) + '" fill="url(#btTg' + NUM + ')"/>', [{transform: T(cx, cy, .2), opacity: 1}, {transform: T(cx, cy, 1.8), opacity: 0}], {d: 450});
    g('<circle r="' + f1(60 * u) + '" fill="none" stroke="#ffffff" stroke-width="' + f1(5 * u) + '"/>', [{transform: T(cx, cy, .2), opacity: .9}, {transform: T(cx, cy, 2.6), opacity: 0}], {d: 520, e: 'cubic-bezier(.1,.8,.3,1)'});
    /* ce qui reste : une petite arête de têtard dans une flaque de glu */
    var reste = document.createElementNS(NS, 'g');
    var os = '<ellipse cx="0" cy="6" rx="150" ry="14" fill="#a8c860" fill-opacity=".7" stroke="#4a6a2a" stroke-width="2"/>' + L('M-110 2 C -40 -4 60 -4 120 2', '#e8ffc0', 2, ' stroke-opacity=".7"') +
      '<g transform="translate(-30 -6)"><path d="M-36 0 C -36 -22 0 -24 4 -8 C 6 4 -10 14 -26 12 C -34 10 -36 6 -36 0 Z" fill="#efe6d0" stroke="' + O + '" stroke-width="2.4"/><circle cx="-18" cy="-6" r="6" fill="#2a2018"/>' +
      L('M4 -4 C 40 -6 80 -14 120 -30', '#efe6d0', 4) + L('M4 -4 C 40 -6 80 -14 120 -30', O, 1.4, ' stroke-opacity=".6"') + L('M24 -6 l -4 -12 M24 -6 l -2 12 M44 -8 l -4 -12 M44 -8 l -2 12 M64 -12 l -4 -11 M64 -12 l -2 11 M84 -17 l -4 -10 M84 -17 l -2 10', '#efe6d0', 2.4) + '</g>';
    reste.innerHTML = '<g>' + os + '</g>';
    var pd = self._ou('pieds');
    reste.setAttribute('transform', 'translate(' + f1(pd[0]) + ' ' + f1(pd[1] + 4) + ')');
    self.S.monde.appendChild(reste);
    reste.firstChild.animate([{opacity: 0}, {opacity: 0, offset: .5}, {opacity: 1}], {duration: 1000, fill: 'both'});
    self._couperBoucles(); self.mort = true;
    return Promise.all(brumes.map(fini)).then(function(){ ov.remove(); });
  });
  pr.boom = boomP;
  return pr;
};

/* ============ 8. Les états ============ */
R.attendre = function(){
  this.attente = true;
  if(this.arrete){ this.arrete = false; if(this.etat.ebloui) this._etoiles(true); if(this.etat.brule) this._feu(true); }
  if(!this.enAction && !this.mort) return this._reprendre(250);
  return Promise.resolve();
};
/* arreter() coupe tout : l'attente et les boucles des états (étoiles, flammes) */
R.arreter = function(){ this.attente = false; this.arrete = true; this._couperX(''); this._couperBoucles(); return this; };
R.ancre = function(nom){ var r = (this.A[nom] || this.A.centre).getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; };
R._visuel = function(nom, on){
  if(nom === 'enrage') this._fondu('rouge', on ? 1 : 0, 300);
  else if(nom === 'brule') this._feu(on);
  else if(nom === 'colle'){ this._fondu('colle', on ? 1 : 0, 300); this._fondu('colleSol', on ? 1 : 0, 300); }
  else if(nom === 'ebloui') this._etoiles(on);
  else if(nom === 'gele'){ this._fondu('glace', on ? 1 : 0, 600); this._fondu('flashG', on ? .3 : 0, 600); }
  else if(nom === 'ouvert') this._fondu('ouvert', on ? 1 : 0, 300);
};
R.changerEtat = function(nom, on){
  on = on !== false;
  var self = this;
  if(this.mort || !(nom in this.etat) || this.etat[nom] === on) return Promise.resolve();
  this.etat[nom] = on;
  this._visuel(nom, on);
  if(nom === 'dos'){
    var j = this._debutAction();
    var k = on ? [{t: 0, p: {}}, {t: .4, p: {saut: {y: -60}, posture: {a: 100, y: -30}}, e: 'ease-out'}, {t: .75, p: {saut: {y: 0, sy: .8, sx: 1.15}, posture: {a: 180, y: -46}}, e: 'ease-in'}, {t: 1, p: {saut: {sy: 1, sx: 1}}}]
      : [{t: 0, p: {}}, {t: .45, p: {saut: {y: -60}, posture: {a: 270, y: -30}}, e: 'ease-out'}, {t: .8, p: {saut: {y: 0, sy: .82, sx: 1.12}, posture: {a: 360, y: 0}}, e: 'ease-in'}, {t: 1, p: {saut: {sy: 1, sx: 1}}}];
    return this._seq(k, 700).fini.then(function(){
      if(!on){ self.J.posture.forEach(function(e){ e.getAnimations().forEach(function(a){ a.cancel(); }); e.style.transform = tf(Z); }); self.v.posture = fusion(Z); }
      var p = self._ou('pieds'); self._gerbe(p[0], 376, .6);
      return self._finAction(j, 150);
    });
  }
  if(!this.enAction) return this._reprendre(300);
  return Promise.resolve();
};

/* ============ 9. L'interface publique ============ */
var INFO = {id: 'tetard', nom: 'Têtard du puits', rang: 'normal', cadre: {w: 210, h: 148}, sol: (380 - VB.y) / VB.h, vole: false, places: 1};
function creer(conteneur, options){
  var t = new Tetard(conteneur, options);
  return {
    info: INFO,
    entrer: function(d){ return t.entrer(d); }, attendre: function(){ return t.attendre(); },
    attaquer: function(nom, o){ return t.attaquer(nom, o); }, touche: function(type){ return t.touche(type); },
    special: function(nom, o){ return t.special(nom, o); }, tousser: function(){ return t.tousser(); },
    fuir: function(){ return t.fuir(); }, mourir: function(){ return t.mourir(); }, exploser: function(scene){ return t.exploser(scene); },
    etat: function(nom, on){ return t.changerEtat(nom, on); }, cible: function(on){ return t.changerEtat('cible', on); },
    etatCourant: function(){ var e = {}; for(var k in t.etat) e[k] = t.etat[k]; return e; },
    ancre: function(nom){ return t.ancre(nom); }, arreter: function(){ t.arreter(); return this; }, _bete: t
  };
}
global.BETES = global.BETES || {};
global.BETES.tetard = {info: INFO, creer: creer};
})(typeof window !== 'undefined' ? window : this);
