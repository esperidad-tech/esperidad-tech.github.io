/* Le plan des Fondateurs, VERSION 2 : la tablette du Sage. Même donjon (window.DONJON), à l'encre sur un vieux parchemin,
   réduit pour tenir dans l'écran. Ni monstres, ni héros. Les indices du Sage :
   - des notes codées avec « Les grilles des fondateurs » (le code du mini-jeu L'alphabet secret, lettres dans l'ordre) ;
   - l'encre invisible, révélée par la rune de lumière (ici : le passage secret et une note) ;
   - un vieux passage dessiné qui est aujourd'hui bouché (la galerie vers la grotte de givre) ;
   - des signes au lieu des noms (étoile, lune, œil, gueule) ;
   - le piège noté (un crâne : « seulement les dalles claires ») ;
   - le coin déchiré (grand bassin, porte aux quatre signes, dernière salle) : il est dans la bibliothèque engloutie. */
(function(){
var D = window.DONJON, U = EXPLO.util, W = 960, H = 540, M = EXPLO.M, SOL = EXPLO.SOL;
var S = D.SALLES, f = U.f, lisse = U.lisse, rng = U.rng;
var ENC = '#3b2414', ENC2 = '#5a3a1e', PAR = '#e8d4a6', SOLC = '#f2e4c0', ROUGE = '#8e2e1c', INV = '#05607c';
/* du donjon (monde) à l'écran */
var X0 = 765, Y0 = 429, SC = .556, OX = 36.5, OY = 22;
function ex(x){ return (x - X0) * SC + OX; } function ey(y){ return (y - Y0) * SC + OY; }
var defs = [], uid = 0;
function id(p){ return p + (++uid); }
function flou(n){ var i = id('pf'); defs.push('<filter id="' + i + '" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="' + n + '"/></filter>'); return 'url(#' + i + ')'; }
function L(d, c, w, x){ return '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"' + (x || '') + '/>'; }
function C(x, y, r, fl, x2){ return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + fl + '"' + (x2 || '') + '/>'; }
function G(x, y, a, s, c){ return U.G(x, y, a, s, c); }
var salles = D.ORDRE.filter(function(k){ return !S[k].couloir; }).map(function(k){ return S[k]; });
/* le plan montre le vieux passage (complet), pas le bout qui reste dans le donjon */
var cou = D.COULOIRS.filter(function(c){ return c.id !== 'vieux'; }).concat([{id:'vieuxPlan', pts:D.VIEUX}]);
var J = D.J, k1 = 1 / SC;   /* k1 : un pixel d'écran, en unités du donjon */

function formes(fn){ var s = ''; salles.forEach(function(r){ s += fn('salle', r); }); cou.forEach(function(c){ s += fn('couloir', c); }); s += fn('j', J); return s; }
function union(plus, c){
  return formes(function(k, o){
    if(k === 'salle') return '<path d="' + o.d + '" fill="' + c + '" stroke="' + c + '" stroke-width="' + f(2 * plus) + '" stroke-linejoin="round"/>';
    if(k === 'couloir') return '<path d="' + lisse(o.pts) + '" fill="none" stroke="' + c + '" stroke-width="' + f((o.l || SOL) + 2 * plus) + '" stroke-linecap="round" stroke-linejoin="round"/>';
    return '<circle cx="' + o.x + '" cy="' + o.y + '" r="' + f(o.r + plus) + '" fill="' + c + '"/>';
  });
}
function sol(c){ return union(0, c).replace(/ stroke="[^"]*" stroke-width="0"/g, ''); }

/* le parchemin : bords irréguliers, et le coin déchiré (en coordonnées d'écran) */
var DECH = [[703, 548], [708, 512], [701, 476], [710, 446], [736, 433], [770, 437], [806, 430], [838, 428], [846, 402], [842, 372], [858, 358], [890, 362], [925, 354], [968, 350], [968, 548]];
function bordParchemin(){
  var R = rng(77), pts = [], m = 7;
  function bord(x0, y0, x1, y1, n, amp){ for(var i = 0; i < n; i++){ var t = i / n; pts.push([x0 + (x1 - x0) * t + (R() - .5) * (amp || 2.4), y0 + (y1 - y0) * t + (R() - .5) * (amp || 2.4)]); } }
  bord(m, m + 1, W - m, m, 60);
  var yd = DECH[DECH.length - 2][1];
  bord(W - m, m, W - m, yd, 16);
  for(var i = DECH.length - 2; i > 0; i--){ var a = DECH[i], b = DECH[i - 1]; bord(Math.min(a[0], W - m), a[1], Math.min(b[0], W - m), b[1], Math.max(2, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 5)), 5); }
  bord(DECH[0][0], H - m, m, H - m, 50);
  bord(m, H - m, m, m + 1, 30);
  return U.poly(pts.map(function(p){ return [Math.min(W - m + 1.5, Math.max(m - 1.5, p[0])), Math.min(H - m + 1.5, Math.max(m - 1.5, p[1]))]; }));
}

/* ---------- « Les grilles des fondateurs » : exactement le dessin du mini-jeu (case 0..25 = A..Z) ---------- */
var X_CHEMINS = ['M4 4L15 15L26 4', 'M4 4L15 15L4 26', 'M26 4L15 15L26 26', 'M4 26L15 15L26 26'];
function pig(cell){
  var i = cell, d = '', point = false, cx = 15, cy = 15;
  if(i < 18){
    if(i >= 9){ point = true; i -= 9; }
    var r = Math.floor(i / 3), c = i % 3;
    if(r > 0) d += 'M4 4H26';
    if(r < 2) d += 'M4 26H26';
    if(c > 0) d += 'M4 4V26';
    if(c < 2) d += 'M26 4V26';
  } else {
    i -= 18; if(i >= 4){ point = true; i -= 4; }
    d = X_CHEMINS[i]; cx = [15, 8, 22, 15][i]; cy = [8, 15, 15, 22][i];
  }
  return {d:d, p:point ? [cx, cy] : null};
}
function code(x, y, lignes, t, c){   /* une note codée, centrée en (x, y) ; t : taille d'un signe */
  var s = '', g = t / 30;
  lignes.forEach(function(mot, k){
    var lw = 0; mot.split('').forEach(function(ch){ lw += ch === ' ' ? t * .7 : t * 1.18; });
    var xx = x - lw / 2, yy = y + (k - (lignes.length - 1) / 2) * t * 1.45 - t / 2;
    mot.split('').forEach(function(ch){
      if(ch === ' '){ xx += t * .7; return; }
      var q = pig(ch.charCodeAt(0) - 65);
      s += '<g transform="translate(' + f(xx) + ' ' + f(yy) + ') scale(' + f(g * 1000) / 1000 + ')"><path d="' + q.d + '" fill="none" stroke="' + (c || ENC) + '" stroke-width="3.3" stroke-linecap="round" stroke-linejoin="round"/>' +
        (q.p ? '<circle cx="' + q.p[0] + '" cy="' + q.p[1] + '" r="4" fill="' + (c || ENC) + '"/>' : '') + '</g>';
      xx += t * 1.18;
    });
  });
  return s;
}

/* ---------- petits dessins à la plume ---------- */
function signe(type, x, y, t, c){ return G(x, y, 0, t / 18, '<path d="' + EXPLO.SIGNES[type] + '" fill="none" stroke="' + (c || ENC) + '" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"/>'); }
function colonne(x, y, r, w){ var t = C(x, y, r, '#d9c294', ' stroke="' + ENC + '" stroke-width="' + w + '"'); for(var k = -r + 1.5; k < r; k += r / 3.2){ var h = Math.sqrt(Math.max(0, r * r - k * k)); t += L('M' + f(x + k) + ' ' + f(y - h * .2) + ' L' + f(x + k) + ' ' + f(y + h * .9), ENC2, w * .45, ' opacity=".7"'); } return t; }
function engr(x, y, r, n, w){ var pts = []; for(var i = 0; i < n * 4; i++){ var t = i / (n * 4) * Math.PI * 2, rr = (i % 4 < 2) ? r : r * .78; pts.push([x + Math.cos(t) * rr, y + Math.sin(t) * rr]); }
  return '<path d="' + U.poly(pts) + '" fill="none" stroke="' + ENC + '" stroke-width="' + w + '"/>' + C(x, y, r * .3, 'none', ' stroke="' + ENC + '" stroke-width="' + w + '"'); }
function toile(x, y, R0, a0, a1, w){ var s = '', n = 5; for(var i = 0; i < n; i++){ var a = a0 + (a1 - a0) * i / (n - 1); s += 'M' + f(x) + ' ' + f(y) + ' L' + f(x + Math.cos(a) * R0) + ' ' + f(y + Math.sin(a) * R0) + ' '; }
  for(var r = R0 * .3; r < R0; r += R0 * .24){ for(var i2 = 0; i2 < n - 1; i2++){ var aa = a0 + (a1 - a0) * i2 / (n - 1), bb = a0 + (a1 - a0) * (i2 + 1) / (n - 1), am = (aa + bb) / 2;
    s += 'M' + f(x + Math.cos(aa) * r) + ' ' + f(y + Math.sin(aa) * r) + ' Q' + f(x + Math.cos(am) * r * .85) + ' ' + f(y + Math.sin(am) * r * .85) + ' ' + f(x + Math.cos(bb) * r) + ' ' + f(y + Math.sin(bb) * r) + ' '; } }
  return L(s, ENC2, w); }
function cailloux(x, y, r, seed, w){ var R = rng(seed), s = ''; for(var i = 0; i < r * .9; i++){ var a = R() * 6.28, d = Math.sqrt(R()) * r, px = x + Math.cos(a) * d, py = y + Math.sin(a) * d * .8, t = 1.8 + R() * 3, pts = [];
  for(var k = 0; k < 5; k++){ var b = k / 5 * 6.28 + R(); pts.push([px + Math.cos(b) * t, py + Math.sin(b) * t]); } s += '<path d="' + U.poly(pts) + '" fill="#cbb185" stroke="' + ENC + '" stroke-width="' + w + '"/>'; } return s; }

/* le décor des salles de la version 1 : dessiné dans leurs anciennes coordonnées, puis posé et agrandi comme dans le donjon */
var V1C = {puits:[88, 180], reserve:[285, 76], canaux:[285, 338], givre:[90, 342], cave:[470, 332], eboule:[566, 452], atelier:[640, 190], biblio:[640, 72], ossuaire:[838, 180], feu:[765, 300], rats:[285, 190]};
function detailsV1(id){
  var w = 1.9, s = '';
  switch(id){
  case 'puits': s += '<circle cx="72" cy="160" r="20" fill="#9fb8c0" opacity=".25"/><circle cx="72" cy="160" r="20" fill="none" stroke="' + ENC + '" stroke-width="' + w + '" stroke-dasharray="4 3"/>' +
    L('M72 160 C 74 175 76 188 72 198', ENC, w) + '<ellipse cx="66" cy="201" rx="8" ry="5" fill="none" stroke="' + ENC + '" stroke-width="' + w * .8 + '"/>' + cailloux(118, 146, 7, 4, w * .7); break;
  case 'reserve': [[250, 58, 7], [264, 52, 6], [248, 76, 5.5]].forEach(function(t){ s += C(t[0], t[1], t[2], 'none', ' stroke="' + ENC + '" stroke-width="' + w + '"'); });
    s += '<rect x="313" y="50" width="14" height="12" fill="none" stroke="' + ENC + '" stroke-width="' + w + '" transform="rotate(8 320 56)"/>'; break;
  case 'canaux': s += '<rect x="288" y="270" width="24" height="136" fill="#6f9fa0" opacity=".45"/>' + L('M288 270 V406 M312 270 V406', ENC, w);
    for(var k = 0; k < 9; k++) s += L('M' + (293 + (k % 2) * 3) + ' ' + (282 + k * 13) + ' q3 -2 6 0 t6 0', '#2e5a6a', w * .7);
    s += '<rect x="281" y="343" width="38" height="19" fill="' + SOLC + '" stroke="' + ENC + '" stroke-width="' + w + '"/>' + L('M287 343 V362 M293 343 V362 M299 343 V362 M305 343 V362 M311 343 V362', ENC2, w * .6) + colonne(218, 302, 5.5, w) + colonne(218, 374, 5.5, w); break;
  case 'givre': s += '<path d="' + D.SALLES.givre.d + '" fill="#a8c4d0" opacity=".38" transform="translate(' + (90 - 1000 / 1.2) + ' ' + (342 - 1010 / 1.2) + ') scale(' + (1 / 1.2) + ')"/>';
    [[40, 320, 30], [60, 300, 70], [128, 312, 140], [118, 385, 250], [52, 382, 300]].forEach(function(c){ for(var k3 = 0; k3 < 3; k3++){ var a = (c[2] + (k3 - 1) * 24) * Math.PI / 180; s += L('M' + c[0] + ' ' + c[1] + ' l' + f(-Math.cos(a) * 10) + ' ' + f(-Math.sin(a) * 10), ENC, w); } }); break;
  case 'cave': s += toile(412, 286, 28, 0, Math.PI / 2, w * .6) + toile(528, 286, 24, Math.PI / 2, Math.PI, w * .6) + toile(412, 378, 20, -Math.PI / 2, 0, w * .6) + toile(528, 378, 20, Math.PI, Math.PI * 1.5, w * .6); break;
  case 'eboule': s += cailloux(598, 446, 13, 81, w * .7) + cailloux(536, 468, 8, 83, w * .7); break;
  case 'atelier': s += engr(604, 186, 12, 9, w) + engr(621, 201, 7, 7, w) + engr(686, 212, 9, 8, w) + colonne(584, 152, 5, w) + colonne(696, 152, 5, w) + colonne(584, 228, 5, w) + colonne(696, 228, 5, w) +
    '<rect x="636" y="149" width="32" height="10" fill="none" stroke="' + ENC + '" stroke-width="' + w + '"/><rect x="655" y="221" width="26" height="9" fill="none" stroke="' + ENC + '" stroke-width="' + w + '"/>'; break;
  case 'biblio': s += '<path d="M576 70 C 600 60 640 64 660 76 C 680 88 700 86 704 80 L 704 104 L 576 104 Z" fill="#6f9fa0" opacity=".4"/>';
    for(var x = 582; x < 698; x += 7) s += L('M' + x + ' 41 V48', ENC, w * .7);
    s += L('M580 40 H700 M580 49 H700', ENC, w); break;
  case 'ossuaire': [[806, 140], [870, 140], [806, 220], [870, 220]].forEach(function(p){ s += '<path d="M' + (p[0] - 7) + ' ' + (p[1] + (p[1] < 180 ? 4 : -4)) + ' v' + (p[1] < 180 ? -6 : 6) + ' a7 5 0 0 1 14 0 v' + (p[1] < 180 ? 6 : -6) + '" fill="none" stroke="' + ENC + '" stroke-width="' + w + '" transform="' + (p[1] < 180 ? '' : 'rotate(180 ' + p[0] + ' ' + p[1] + ')') + '"/>'; });
    s += '<rect x="818" y="171" width="40" height="18" rx="2" fill="none" stroke="' + ENC + '" stroke-width="' + w + '"/>'; break;
  case 'feu': for(var k4 = 0; k4 < 9; k4++){ var a4 = k4 / 9 * 6.283; s += C(765 + Math.cos(a4) * 10, 300 + Math.sin(a4) * 8, 2, 'none', ' stroke="' + ENC + '" stroke-width="' + w * .8 + '"'); }
    s += '<path d="M765 306 C 760 300 763 296 765 291 C 767 296 770 300 765 306 Z" fill="#b8562a" opacity=".7" stroke="' + ENC + '" stroke-width="' + w * .6 + '"/>'; break;
  }
  return s;
}
function details(){
  var s = '', w = 1.7;
  Object.keys(V1C).forEach(function(k){ var o = S[k], v = V1C[k]; s += '<g transform="translate(' + o.x + ' ' + o.y + ') scale(1.2) translate(' + (-v[0]) + ' ' + (-v[1]) + ')">' + detailsV1(k) + '</g>'; });
  /* la grande galerie (le plan est vieux : il la montre intacte) */
  s += colonne(1010, 736, 6, w) + colonne(1010, 774, 6, w) + colonne(946, 736, 6, w) + colonne(946, 774, 6, w) + colonne(882, 736, 6, w) + colonne(882, 774, 6, w);
  /* le puits d'aération : sa grille */
  s += '<rect x="1180" y="502" width="40" height="40" fill="#9fb8c0" opacity=".25"/>';
  for(var g = 0; g <= 40; g += 8) s += L('M' + (1180 + g) + ' 502 V542 M1180 ' + (502 + g) + ' H1220', ENC, w * .7);
  /* la salle aux trois portes : le cercle au sol, les trois portes */
  s += C(2135, 700, 28, 'none', ' stroke="' + ENC + '" stroke-width="' + w + '"') + C(2135, 700, 20, 'none', ' stroke="' + ENC2 + '" stroke-width="' + w * .6 + '" stroke-dasharray="4 4"');
  [[2135, 641, 0], [2199, 700, 90], [2135, 759, 0]].forEach(function(p){ s += G(p[0], p[1], p[2], 1, '<rect x="-17" y="-4" width="34" height="8" fill="#a0784a" stroke="' + ENC + '" stroke-width="' + w + '"/>'); });
  /* la fausse crypte : un sarcophage */
  s += '<rect x="2272" y="689" width="48" height="22" rx="3" fill="none" stroke="' + ENC + '" stroke-width="' + w + '"/><path d="M2278 700 H2314" stroke="' + ENC + '" stroke-width="' + w * .6 + '"/>';
  /* les égouts : l'eau qui tourne */
  s += L(lisse(D.SALLES.egouts.pts), '#6f9fa0', 9, ' opacity=".5"') + L(lisse(D.SALLES.egouts.pts), '#2e5a6a', 1.4, ' stroke-dasharray="6 7"');
  return s;
}

/* ---------- les textes à la plume ---------- */
function texte(x, y, lignes, taille, c, style, extra){
  var s = '';
  lignes.forEach(function(t, k){
    var yy = y + (k - (lignes.length - 1) / 2) * taille * 1.02;
    s += '<text x="' + f(x) + '" y="' + f(yy) + '" text-anchor="middle" dominant-baseline="central" font-size="' + taille + '" style="font-family:' + (style || '\'TeX Gyre Chorus\', cursive') + ';paint-order:stroke" stroke="' + SOLC + '" stroke-width="3" stroke-linejoin="round" fill="' + (c || ENC) + '"' + (extra || '') + '>' + t + '</text>';
  });
  return s;
}
function rose(x, y, r){
  var s = C(x, y, r, 'none', ' stroke="' + ENC + '" stroke-width="1"') + C(x, y, r * .82, 'none', ' stroke="' + ENC + '" stroke-width=".5"');
  for(var k = 0; k < 32; k++){ var a = k / 32 * 6.283; s += L('M' + f(x + Math.cos(a) * r * .82) + ' ' + f(y + Math.sin(a) * r * .82) + ' L' + f(x + Math.cos(a) * r * (k % 4 ? .9 : .98)) + ' ' + f(y + Math.sin(a) * r * (k % 4 ? .9 : .98)), ENC, .6); }
  for(var k2 = 0; k2 < 8; k2++){
    var a2 = k2 / 8 * 6.283 - Math.PI / 2, lg = k2 % 2 ? r * .55 : r, la = k2 % 2 ? r * .09 : r * .14;
    var px = x + Math.cos(a2) * lg, py = y + Math.sin(a2) * lg, gx = x + Math.cos(a2 - Math.PI / 2) * la, gy = y + Math.sin(a2 - Math.PI / 2) * la, dx = x + Math.cos(a2 + Math.PI / 2) * la, dy = y + Math.sin(a2 + Math.PI / 2) * la;
    s += '<path d="M' + f(x) + ' ' + f(y) + ' L' + f(gx) + ' ' + f(gy) + ' L' + f(px) + ' ' + f(py) + ' Z" fill="' + (k2 === 0 ? ROUGE : ENC) + '"/><path d="M' + f(x) + ' ' + f(y) + ' L' + f(dx) + ' ' + f(dy) + ' L' + f(px) + ' ' + f(py) + ' Z" fill="' + SOLC + '" stroke="' + ENC + '" stroke-width=".7"/>';
  }
  return s + C(x, y, 2, ENC) + '<text x="' + x + '" y="' + f(y - r - 8) + '" text-anchor="middle" dominant-baseline="central" font-size="15" style="font-family:\'TeX Gyre Chorus\', cursive" fill="' + ROUGE + '">N</text>';
}
function crane(x, y, t, c){ return G(x, y, 0, t / 10, '<path d="M-5 -1 C -5 -7 5 -7 5 -1 L 4 3 L 2 3 L 2 5 L -2 5 L -2 3 L -4 3 Z" fill="none" stroke="' + (c || ENC) + '" stroke-width="1.3" stroke-linejoin="round"/>' + C(-2, -1, 1.3, c || ENC) + C(2, -1, 1.3, c || ENC)); }

function plan(){
  defs = []; uid = 0;
  var p = '', e = '', s = '';
  /* motifs (en unités du donjon : un trait d'écran = k1) */
  var hs = '', R = rng(5);
  for(var i = -4; i < 8; i++) hs += '<path d="M' + f((i * 4 + R()) * k1) + ' 0 l ' + f(24 * k1) + ' ' + f(24 * k1) + '" stroke="' + ENC2 + '" stroke-width="' + f((.55 + R() * .35) * k1) + '" opacity="' + f(.55 + R() * .35) + '"/>';
  defs.push('<pattern id="hach" width="' + f(24 * k1) + '" height="' + f(24 * k1) + '" patternUnits="userSpaceOnUse">' + hs + '</pattern>');
  defs.push('<pattern id="murH" width="' + f(4 * k1) + '" height="' + f(4 * k1) + '" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="' + f(4 * k1) + '" height="' + f(4 * k1) + '" fill="#a27a48"/><path d="M0 ' + f(2 * k1) + ' H' + f(4 * k1) + '" stroke="#5a3a1e" stroke-width="' + f(.8 * k1) + '" opacity=".75"/></pattern>');
  defs.push('<pattern id="quad" width="' + f(9 * k1) + '" height="' + f(9 * k1) + '" patternUnits="userSpaceOnUse"><path d="M' + f(9 * k1) + ' 0 V' + f(9 * k1) + ' H0" fill="none" stroke="' + ENC2 + '" stroke-width="' + f(.4 * k1) + '" opacity=".45"/></pattern>');
  /* le couloir aux dalles : dalles claires et dalles sombres, comme dans le donjon */
  defs.push('<pattern id="quad2" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(-18)"><rect width="22" height="22" fill="' + SOLC + '"/><rect x="11" y="0" width="11" height="11" fill="#7a5a36" opacity=".8"/><rect x="0" y="11" width="11" height="11" fill="#7a5a36" opacity=".8"/><path d="M0 0 H22 V22 H0 Z M11 0 V22 M0 11 H22" fill="none" stroke="' + ENC + '" stroke-width="1.4"/></pattern>');
  defs.push('<filter id="bois" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".004 .09" numOctaves="3" seed="2"/><feColorMatrix values=".3 0 0 0 -.02  .2 0 0 0 -.02  .18 0 0 0 0  0 0 0 0 1"/></filter>');
  defs.push('<filter id="papier" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".012" numOctaves="5" seed="8" result="n"/>' +
    '<feColorMatrix in="n" values="0 0 0 0 .45  0 0 0 0 .3  0 0 0 0 .14  -2.2 0 0 0 1.35" result="taches"/><feTurbulence type="fractalNoise" baseFrequency=".9 .25" numOctaves="2" seed="4" result="fib"/>' +
    '<feColorMatrix in="fib" values="0 0 0 0 .35  0 0 0 0 .24  0 0 0 0 .12  0 0 0 -1.1 .62" result="fibres"/><feMerge><feMergeNode in="taches"/><feMergeNode in="fibres"/></feMerge></filter>');
  defs.push('<filter id="main" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed="6" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="2.4" xChannelSelector="R" yChannelSelector="G"/></filter>');
  defs.push('<filter id="bordHach" filterUnits="userSpaceOnUse" x="600" y="300" width="2000" height="1200"><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="2" seed="3" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="16" xChannelSelector="R" yChannelSelector="G"/></filter>');
  defs.push('<filter id="fibresD" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="3" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="6" xChannelSelector="R" yChannelSelector="G"/></filter>');
  var bord = bordParchemin();
  defs.push('<clipPath id="parch"><path d="' + bord + '"/></clipPath>');
  defs.push('<mask id="mHach" maskUnits="userSpaceOnUse" x="600" y="300" width="2000" height="1200"><g filter="url(#bordHach)">' + union(M + 16, '#fff') + '</g></mask>');
  defs.push('<mask id="mSolP" maskUnits="userSpaceOnUse" x="600" y="300" width="2000" height="1200">' + sol('#fff') + '</mask>');
  defs.push('<radialGradient id="pBrule" cx="480" cy="270" r="560" gradientUnits="userSpaceOnUse"><stop offset=".55" stop-color="#7a4a1e" stop-opacity="0"/><stop offset=".9" stop-color="#7a4a1e" stop-opacity=".3"/><stop offset="1" stop-color="#4a2a10" stop-opacity=".55"/></radialGradient>');

  /* la table, l'ombre, le parchemin */
  s += '<rect width="' + W + '" height="' + H + '" fill="#160d0c"/><rect width="' + W + '" height="' + H + '" filter="url(#bois)" opacity=".9"/>';
  s += '<path d="' + bord + '" fill="#000" opacity=".7" filter="' + flou(6) + '" transform="translate(3 6)"/>';
  p += '<rect width="' + W + '" height="' + H + '" fill="' + PAR + '"/><rect width="' + W + '" height="' + H + '" filter="url(#papier)" opacity=".42"/>';
  p += L('M480 0 V540', '#fff8e8', 2, ' opacity=".35"') + L('M482 0 V540', '#8a6438', 1.2, ' opacity=".22"') + L('M0 270 H960', '#fff8e8', 2, ' opacity=".3"') + L('M0 272 H960', '#8a6438', 1.2, ' opacity=".2"');
  p += '<circle cx="560" cy="470" r="26" fill="none" stroke="#8a5a28" stroke-width="3.2" opacity=".2" filter="' + flou(.8) + '"/><circle cx="560" cy="470" r="23" fill="#a87a3a" opacity=".06"/>' +
    '<ellipse cx="96" cy="470" rx="46" ry="26" fill="#9a7038" opacity=".1" filter="' + flou(6) + '"/>' +
    '<path d="M452 92 c4 -3 9 -1 9 4 c0 5 -6 7 -9 4 c-3 2 -6 -2 -3 -4 z" fill="' + ENC + '" opacity=".7"/>' + C(464, 86, 1.3, ENC, ' opacity=".7"');
  p += '<rect x="16" y="16" width="928" height="508" fill="none" stroke="' + ENC2 + '" stroke-width="1.5" opacity=".7"/><rect x="21" y="21" width="918" height="498" fill="none" stroke="' + ENC2 + '" stroke-width=".7" opacity=".55"/>';

  /* ======== le donjon, à l'encre (en unités du donjon) ======== */
  var dj = '';
  dj += '<g mask="url(#mHach)"><rect x="600" y="300" width="2000" height="1200" fill="url(#hach)"/></g>';
  dj += union(M + 2 * k1, ENC) + union(M, 'url(#murH)') + union(2.4 * k1, ENC) + sol(SOLC);
  dj += '<g mask="url(#mSolP)"><rect x="600" y="300" width="2000" height="1200" fill="url(#quad)"/></g>';
  var dl = S.dalles; dj += '<path d="' + lisse(dl.pts) + '" fill="none" stroke="url(#quad2)" stroke-width="' + (dl.l - 3) + '"/>';
  dj += details();
  p += '<g filter="url(#main)"><g transform="translate(' + OX + ' ' + OY + ') scale(' + SC + ') translate(' + (-X0) + ' ' + (-Y0) + ')">' + dj + '</g></g>';

  /* ======== les signes au lieu des noms ======== */
  p += signe('etoile', ex(1200), ey(522), 17) + signe('lune', ex(1700), ey(925), 20) + signe('oeil', ex(2135), ey(905), 20) + signe('gueule', ex(2300), ey(712), 18);
  /* et les mêmes signes gravés sur les trois portes */
  p += signe('lune', ex(2135), ey(626), 9) + signe('gueule', ex(2214), ey(700), 9) + signe('oeil', ex(2135), ey(774), 9);
  /* ======== les noms à la plume ======== */
  var T = 13.5;
  p += texte(ex(1200), ey(838), ['Le fond du puits'], T) + texte(ex(930), ey(755), ['La grande galerie'], 11.5) + texte(ex(1440), ey(752), ['La salle', 'des rats'], T) +
    texte(ex(1455), ey(610), ['La réserve'], 12) + texte(ex(1372), ey(905), ['Les canaux', 'de la ville', 'd’avant'], 11) + texte(ex(1000), ey(1100), ['La grotte de la', 'fleur de givre'], T) +
    texte(ex(1920), ey(700), ['L’atelier des', 'Fondateurs'], 12.5) + texte(ex(1920), ey(568), ['La bibliothèque', 'engloutie'], 11.5) + texte(ex(2135), ey(700), ['La salle aux', 'trois portes'], 10.5) +
    texte(ex(2135), ey(1080), ['Le feu', 'de camp'], 11) + texte(ex(1800), ey(1170), ['Le cul-de-sac éboulé'], 12.5);
  /* ======== les notes codées (Les grilles des fondateurs) ======== */
  function cadreNote(x, y, w, h){ return '<path d="M' + f(x - w / 2) + ' ' + f(y - h / 2) + ' h' + w + ' v' + h + ' h' + (-w) + ' z" fill="#efdcae" opacity=".55"/>' + L('M' + f(x - w / 2 + 3) + ' ' + f(y + h / 2 + 3) + ' q' + f(w / 2) + ' 4 ' + f(w - 6) + ' 0', ENC2, .8, ' opacity=".7"'); }
  p += cadreNote(178, 128, 132, 26) + code(178, 128, ['VA A L EST'], 12, ROUGE);
  p += cadreNote(886, 230, 98, 50) + code(886, 230, ['PRENDS', 'L OEIL'], 12, ROUGE);
  p += cadreNote(270, 428, 134, 50) + code(270, 428, ['ON TOURNE', 'EN ROND'], 12, ROUGE);
  /* ======== le piège noté ======== */
  p += crane(678, 234, 11, ROUGE) + texte(718, 236, ['seulement les', 'dalles claires'], 11.5, ROUGE);
  /* ======== la rose des vents, le titre ======== */
  p += rose(894, 74, 24);
  p += '<path d="M40 30 H246 L 238 46 L 246 62 H40 L 48 46 Z" fill="' + SOLC + '" stroke="' + ENC + '" stroke-width="1.2"/><path d="M48 34 H238 M48 58 H238" stroke="' + ENC2 + '" stroke-width=".6" opacity=".7"/>' +
    '<text x="143" y="47" text-anchor="middle" dominant-baseline="central" font-size="19" style="font-family:\'TeX Gyre Chorus\', cursive" fill="' + ENC + '">Le plan des Fondateurs</text>' +
    texte(143, 77, ['relevé de la ville d’avant'], 11.5, ENC2);
  /* ======== l'encre invisible : la rune de lumière du Sage l'éclaire ici ======== */
  var hx0 = ex(1916), hy0 = ey(1088), hr = 76;
  defs.push('<radialGradient id="halo" cx="' + f(hx0) + '" cy="' + f(hy0) + '" r="' + hr + '" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f0feff" stop-opacity=".9"/><stop offset=".4" stop-color="#8ff3ff" stop-opacity=".6"/><stop offset=".75" stop-color="#5fe0f0" stop-opacity=".22"/><stop offset="1" stop-color="#5fe0f0" stop-opacity="0"/></radialGradient>');
  defs.push('<radialGradient id="haloM" cx="' + f(hx0) + '" cy="' + f(hy0) + '" r="' + hr + '" gradientUnits="userSpaceOnUse"><stop offset=".62" stop-color="#fff"/><stop offset=".98" stop-color="#000"/></radialGradient>');
  defs.push('<mask id="mHalo" maskUnits="userSpaceOnUse" x="0" y="0" width="960" height="540"><rect width="960" height="540" fill="url(#haloM)"/></mask>');
  p += '<circle cx="' + f(hx0) + '" cy="' + f(hy0) + '" r="' + (hr + 18) + '" fill="#5fe8ff" opacity=".12" filter="' + flou(14) + '" style="mix-blend-mode:screen"/><circle cx="' + f(hx0) + '" cy="' + f(hy0) + '" r="' + hr + '" fill="url(#halo)" style="mix-blend-mode:screen"/>';
  var sec = D.SECRET.map(function(q){ return [ex(q[0]), ey(q[1])]; }), dsec = lisse(sec);
  var inv = L(dsec, '#7ff0ff', 5, ' opacity=".55" filter="' + flou(1.6) + '"') + L(dsec, INV, 2.2, ' stroke-dasharray=".1 6"') +
    crane(ex(1903), ey(1080), 9, INV) +
    texte(hx0 + 8, hy0 - 31, ['appuie sur', 'le crâne'], 13.5, INV, null, ' filter="url(#lueurInv)"');
  defs.push('<filter id="lueurInv" x="-20%" y="-30%" width="140%" height="160%"><feGaussianBlur in="SourceAlpha" stdDeviation="1.6" result="b"/><feFlood flood-color="#9ff6ff"/><feComposite in2="b" operator="in" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>');
  p += '<g mask="url(#mHalo)">' + inv + '</g>';
  p += '<circle cx="' + f(hx0) + '" cy="' + f(hy0) + '" r="' + (hr - 3) + '" fill="none" stroke="#bff9ff" stroke-width="1" opacity=".35" stroke-dasharray="2 5"/>';
  /* le bord brûlé */
  p += '<rect width="' + W + '" height="' + H + '" fill="url(#pBrule)"/>';
  p += '<path d="' + bord + '" fill="none" stroke="#5a3414" stroke-width="16" opacity=".35" filter="' + flou(6) + '"/><path d="' + bord + '" fill="none" stroke="#3a1e0a" stroke-width="2.2" opacity=".55"/>';
  s += '<g clip-path="url(#parch)">' + p + '</g>';
  /* la déchirure : les fibres du papier arraché ; la place du morceau perdu */
  s += L(U.poly(DECH.slice(1, -1), false), '#f6ead0', 2.4, ' opacity=".7" filter="url(#fibresD)"');
  var ins = DECH.slice(1, -1).map(function(q){ return [q[0] + 12, q[1] + 12]; });
  s += '<path d="' + U.poly([[ins[0][0], 540]].concat(ins).concat([[950, ins[ins.length - 1][1]], [950, 532], [ins[0][0], 532]])) + '" fill="none" stroke="#e8d4a6" stroke-width="1.4" stroke-dasharray="6 6" opacity=".35"/>';
  s += '<g opacity=".8"><text x="858" y="462" text-anchor="middle" dominant-baseline="central" font-size="26">📜</text>' +
    '<text x="858" y="494" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="700" fill="#e8d4a6" style="font-family:Andika, Inter, sans-serif">Morceau perdu</text></g>';
  var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" style="position:absolute;inset:0;display:block"><defs>' + defs.join('') + '</defs>' + s + '</svg>';
  var ui = '<div style="position:absolute;left:24px;bottom:18px;display:flex;align-items:center;gap:8px">' +
    '<div style="width:46px;height:46px;border-radius:50%;display:grid;place-items:center;font-size:22px;background:radial-gradient(#2a6a80,#123040);border:3px solid #24182e;box-shadow:0 0 0 2px #9ff4ff,0 0 18px #5fe8ff">✨</div>' +
    '<div class="ex-bulle" style="width:300px">Ta rune de lumière réveille l’encre cachée…<span class="ex-lire">🔊</span></div></div>';
  return EXPLO.CSS + '<div class="ex">' + svg + ui + '</div>';
}
window.PLAN_SAGE = plan;
})();
