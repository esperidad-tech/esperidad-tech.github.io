/* Le plan des Fondateurs : la tablette du Sage. Même donjon (window.DONJON), dessiné à l'encre sur un vieux parchemin.
   Ni monstres, ni héros ; le passage secret en pointillés ; le coin du grand bassin et de la porte est déchiré. */
(function(){
var D = window.DONJON, U = EXPLO.util, W = 960, H = 540, M = EXPLO.M, SOL = EXPLO.SOL;
var S = D.SALLES, f = U.f, lisse = U.lisse, rng = U.rng;
var ENC = '#3b2414', ENC2 = '#5a3a1e', PAR = '#e8d4a6', SOLC = '#f2e4c0', MUR = '#b38c5a', ROUGE = '#8e2e1c';
var defs = [], uid = 0;
function id(p){ return p + (++uid); }
function flou(n){ var i = id('pf'); defs.push('<filter id="' + i + '" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="' + n + '"/></filter>'); return 'url(#' + i + ')'; }
function L(d, c, w, x){ return '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"' + (x || '') + '/>'; }
function C(x, y, r, fl, x2){ return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + fl + '"' + (x2 || '') + '/>'; }
function G(x, y, a, s, c){ return U.G(x, y, a, s, c); }
var salles = D.ORDRE.filter(function(k){ return !S[k].couloir; }).map(function(k){ return S[k]; });
var cou = D.COULOIRS, J = D.J;

function formes(fn){ var s = ''; salles.forEach(function(r){ s += fn('salle', r); }); cou.forEach(function(c){ s += fn('couloir', c); }); s += fn('j', J); return s; }
/* toutes les formes, élargies de « plus » (rayon ajouté de chaque côté), d'une couleur */
function union(plus, c, attrs){
  return formes(function(k, o){
    if(k === 'salle') return '<path d="' + o.d + '" fill="' + c + '" stroke="' + c + '" stroke-width="' + f(2 * plus) + '" stroke-linejoin="round"' + (attrs || '') + '/>';
    if(k === 'couloir') return '<path d="' + lisse(o.pts) + '" fill="none" stroke="' + c + '" stroke-width="' + f((o.l || SOL) + 2 * plus) + '" stroke-linecap="round" stroke-linejoin="round"' + (attrs || '') + '/>';
    return '<circle cx="' + o.x + '" cy="' + o.y + '" r="' + f(o.r + plus) + '" fill="' + c + '"' + (attrs || '') + '/>';
  });
}
function sol(c){ return formes(function(k, o){
  if(k === 'salle') return '<path d="' + o.d + '" fill="' + c + '"/>';
  if(k === 'couloir') return '<path d="' + lisse(o.pts) + '" fill="none" stroke="' + c + '" stroke-width="' + (o.l || SOL) + '" stroke-linecap="round" stroke-linejoin="round"/>';
  return '<circle cx="' + o.x + '" cy="' + o.y + '" r="' + o.r + '" fill="' + c + '"/>'; }); }

/* le parchemin : un rectangle aux bords irréguliers, moins le coin déchiré */
function bordParchemin(){
  var R = rng(77), pts = [], m = 7;
  function bord(x0, y0, x1, y1, n){ for(var i = 0; i < n; i++){ var t = i / n; pts.push([x0 + (x1 - x0) * t + (R() - .5) * 2.4, y0 + (y1 - y0) * t + (R() - .5) * 2.4]); } }
  /* haut, de gauche à droite */
  bord(m, m + 1, W - m, m, 60);
  /* bord droit jusqu'à la déchirure */
  var dch = D.DECHIRURE, yd = dch[dch.length - 2][1];
  bord(W - m, m, W - m, yd, 16);
  /* la déchirure, de droite à gauche, avec de petites dents */
  for(var i = dch.length - 2; i > 0; i--){
    var a = dch[i], b = dch[i - 1], n = Math.max(2, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 5));
    for(var k = 0; k < n; k++){ var t = k / n; pts.push([a[0] + (b[0] - a[0]) * t + (R() - .5) * 5, a[1] + (b[1] - a[1]) * t + (R() - .5) * 5]); }
  }
  var xd = dch[0][0];
  bord(xd, H - m, m, H - m, 50);
  bord(m, H - m, m, m + 1, 30);
  return U.poly(pts.map(function(p){ return [Math.min(W - m + 1.5, Math.max(m - 1.5, p[0])), Math.min(H - m + 1.5, Math.max(m - 1.5, p[1]))]; }));
}

function hachuresPattern(){
  var s = '', R = rng(5);
  for(var i = -4; i < 8; i++){ s += '<path d="M' + f(i * 4 + R()) + ' 0 l 24 24" stroke="' + ENC2 + '" stroke-width="' + f(.55 + R() * .35) + '" opacity="' + f(.55 + R() * .35) + '"/>'; }
  defs.push('<pattern id="hach" width="24" height="24" patternUnits="userSpaceOnUse">' + s + '</pattern>');
  defs.push('<pattern id="murH" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="5" height="5" fill="#a27a48"/><path d="M0 2.5 H5" stroke="#5a3a1e" stroke-width=".9" opacity=".75"/></pattern>');
  defs.push('<pattern id="quad" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0 V10 H0" fill="none" stroke="' + ENC2 + '" stroke-width=".45" opacity=".45"/></pattern>');
  defs.push('<pattern id="quad2" width="11" height="11" patternUnits="userSpaceOnUse" patternTransform="rotate(-18)"><rect x="1" y="1" width="9" height="9" fill="none" stroke="' + ENC + '" stroke-width=".7" opacity=".8"/></pattern>');
}

/* ---------- les petits dessins à la plume ---------- */
function rune(x, y, s, k, c, a){ var GL = ['M5 0 V12 M5 3 L9 0 M5 6 L9 3', 'M2 0 V12 M2 1 L8 4 L2 8', 'M5 0 V12 M1 4 L5 0 L9 4', 'M1 0 L9 12 M9 0 L1 12', 'M5 0 L9 6 L5 12 L1 6 Z', 'M2 0 V12 M8 0 V12 M2 6 L8 6', 'M2 12 V0 L8 6 L8 0', 'M5 12 V0 M1 8 L5 4 L9 8', 'M1 0 L5 5 L9 0 M5 5 V12', 'M3 0 L7 3 L3 6 L7 9 L3 12'];
  return G(x, y, a || 0, s, '<g transform="translate(-5 -6)">' + L(GL[k % GL.length], c || ENC, 1.3) + '</g>'); }
function ligneRunes(x, y, n, seed, s, c){ var R = rng(seed), t = ''; for(var i = 0; i < n; i++) t += rune(x + i * 9 * (s || 1), y, s || 1, Math.floor(R() * 10), c); return t; }
function colonne(x, y, r){ var t = C(x, y, r, '#d9c294', ' stroke="' + ENC + '" stroke-width="1"'); for(var k = -r; k < r; k += 1.8){ var h = Math.sqrt(Math.max(0, r * r - k * k)); t += L('M' + f(x + k) + ' ' + f(y - h * .2) + ' L' + f(x + k) + ' ' + f(y + h), ENC2, .45, ' opacity=".7"'); } return t; }
function engr(x, y, r, n){ var pts = []; for(var i = 0; i < n * 4; i++){ var t = i / (n * 4) * Math.PI * 2, rr = (i % 4 < 2) ? r : r * .78; pts.push([x + Math.cos(t) * rr, y + Math.sin(t) * rr]); }
  return '<path d="' + U.poly(pts) + '" fill="none" stroke="' + ENC + '" stroke-width="1"/>' + C(x, y, r * .3, 'none', ' stroke="' + ENC + '" stroke-width=".9"'); }
function toile(x, y, R0, a0, a1){ var s = '', n = 5; for(var i = 0; i < n; i++){ var a = a0 + (a1 - a0) * i / (n - 1); s += 'M' + f(x) + ' ' + f(y) + ' L' + f(x + Math.cos(a) * R0) + ' ' + f(y + Math.sin(a) * R0) + ' '; }
  for(var r = R0 * .3; r < R0; r += R0 * .22){ for(var i2 = 0; i2 < n - 1; i2++){ var aa = a0 + (a1 - a0) * i2 / (n - 1), bb = a0 + (a1 - a0) * (i2 + 1) / (n - 1), am = (aa + bb) / 2;
    s += 'M' + f(x + Math.cos(aa) * r) + ' ' + f(y + Math.sin(aa) * r) + ' Q' + f(x + Math.cos(am) * r * .85) + ' ' + f(y + Math.sin(am) * r * .85) + ' ' + f(x + Math.cos(bb) * r) + ' ' + f(y + Math.sin(bb) * r) + ' '; } }
  return L(s, ENC2, .55); }
function cailloux(x, y, r, seed){ var R = rng(seed), s = ''; for(var i = 0; i < r * 1.3; i++){ var a = R() * 6.28, d = Math.sqrt(R()) * r, px = x + Math.cos(a) * d, py = y + Math.sin(a) * d * .8, t = 1.2 + R() * 2.4, pts = [];
  for(var k = 0; k < 5; k++){ var b = k / 5 * 6.28 + R(); pts.push([px + Math.cos(b) * t, py + Math.sin(b) * t]); } s += '<path d="' + U.poly(pts) + '" fill="#cbb185" stroke="' + ENC + '" stroke-width=".7"/>'; } return s; }
function eau(d){ return '<path d="' + d + '" fill="#6f9fa0" opacity=".38"/>'; }

function details(){
  var s = '';
  /* le fond du puits : l'ouverture, la corde */
  s += '<circle cx="72" cy="160" r="20" fill="#9fb8c0" opacity=".25"/><circle cx="72" cy="160" r="20" fill="none" stroke="' + ENC + '" stroke-width=".9" stroke-dasharray="3 2.5"/>' +
    L('M72 160 C 74 175 76 188 72 198', ENC, .9) + '<ellipse cx="66" cy="201" rx="8" ry="5" fill="none" stroke="' + ENC + '" stroke-width=".8"/><ellipse cx="66" cy="201" rx="4.5" ry="2.8" fill="none" stroke="' + ENC + '" stroke-width=".8"/>';
  s += cailloux(118, 146, 7, 4) + cailloux(52, 196, 5, 9);
  /* la réserve */
  [[250, 58, 7], [264, 52, 6], [248, 76, 5.5]].forEach(function(t){ s += C(t[0], t[1], t[2], 'none', ' stroke="' + ENC + '" stroke-width=".9"') + C(t[0], t[1], t[2] * .55, 'none', ' stroke="' + ENC + '" stroke-width=".6"'); });
  s += '<rect x="313" y="50" width="14" height="12" fill="none" stroke="' + ENC + '" stroke-width=".9" transform="rotate(8 320 56)"/><path d="M313 50 l14 12" stroke="' + ENC + '" stroke-width=".6" transform="rotate(8 320 56)"/>';
  /* les canaux : l'eau, le pont, les colonnes */
  s += '<rect x="288" y="270" width="24" height="136" fill="#6f9fa0" opacity=".42"/>' + L('M288 270 V406 M312 270 V406', ENC, 1);
  var R = rng(8); for(var k = 0; k < 11; k++){ var yy = 280 + k * 10.5; s += L('M' + f(292 + R() * 3) + ' ' + f(yy) + ' q3 -2 6 0 t6 0', '#2e5a6a', .7); }
  s += '<rect x="281" y="343" width="38" height="19" fill="' + SOLC + '" stroke="' + ENC + '" stroke-width="1"/>' + (function(){ var t = ''; for(var k2 = 1; k2 < 7; k2++) t += L('M' + (281 + k2 * 5.4) + ' 343 V362', ENC2, .6); return t; })();
  s += colonne(218, 302, 5.5) + colonne(218, 374, 5.5);
  /* la grotte de la fleur de givre */
  s += eau(D.SALLES.givre.d).replace('#6f9fa0', '#a8c4d0').replace('.38', '.35');
  [[40, 320, 30], [60, 300, 70], [128, 312, 140], [146, 350, 190], [118, 385, 250], [52, 382, 300]].forEach(function(c){
    for(var k3 = 0; k3 < 3; k3++){ var a = (c[2] + (k3 - 1) * 24) * Math.PI / 180; s += L('M' + f(c[0]) + ' ' + f(c[1]) + ' l' + f(-Math.cos(a) * 9) + ' ' + f(-Math.sin(a) * 9), ENC, .9); } });
  /* la cave aux toiles */
  s += toile(412, 286, 28, 0, Math.PI / 2) + toile(528, 286, 24, Math.PI / 2, Math.PI) + toile(412, 378, 20, -Math.PI / 2, 0) + toile(528, 378, 20, Math.PI, Math.PI * 1.5);
  /* le cul-de-sac éboulé */
  s += cailloux(598, 446, 13, 81) + cailloux(536, 468, 8, 83) + cailloux(560, 430, 6, 85);
  /* l'atelier : engrenages, établis */
  s += engr(604, 186, 12, 9) + engr(621, 201, 7, 7) + engr(686, 212, 9, 8) + colonne(584, 152, 5) + colonne(696, 152, 5) + colonne(584, 228, 5) + colonne(696, 228, 5);
  s += '<rect x="636" y="149" width="32" height="10" fill="none" stroke="' + ENC + '" stroke-width=".9"/><rect x="655" y="221" width="26" height="9" fill="none" stroke="' + ENC + '" stroke-width=".9"/>';
  /* la bibliothèque engloutie */
  s += '<path d="M576 70 C 600 60 640 64 660 76 C 680 88 700 86 704 80 L 704 104 L 576 104 Z" fill="#6f9fa0" opacity=".38"/>' + L('M576 70 C 600 60 640 64 660 76 C 680 88 700 86 704 80', ENC2, .7, ' stroke-dasharray="4 2"');
  for(var x = 582; x < 698; x += 6) s += L('M' + x + ' 41 V48', ENC, .7);
  s += L('M580 40 H700 M580 49 H700', ENC, .9);
  /* l'ossuaire */
  [[806, 140], [838, 140], [870, 140], [806, 220], [838, 220], [870, 220]].forEach(function(p){ s += '<path d="M' + (p[0] - 7) + ' ' + (p[1] + (p[1] < 180 ? 4 : -4)) + ' v' + (p[1] < 180 ? -6 : 6) + ' a7 5 0 0 1 14 0 v' + (p[1] < 180 ? 6 : -6) + '" fill="none" stroke="' + ENC + '" stroke-width=".9" transform="' + (p[1] < 180 ? '' : 'rotate(180 ' + p[0] + ' ' + p[1] + ')') + '"/>'; });
  s += '<rect x="818" y="171" width="40" height="18" rx="2" fill="none" stroke="' + ENC + '" stroke-width="1"/><path d="M822 180 H854" stroke="' + ENC + '" stroke-width=".6"/>';
  /* le feu de camp */
  for(var k4 = 0; k4 < 9; k4++){ var a4 = k4 / 9 * 6.283; s += C(765 + Math.cos(a4) * 10, 300 + Math.sin(a4) * 8, 2, 'none', ' stroke="' + ENC + '" stroke-width=".8"'); }
  s += '<path d="M765 306 C 760 300 763 296 765 291 C 767 296 770 300 765 306 Z" fill="#b8562a" opacity=".7" stroke="' + ENC + '" stroke-width=".6"/>';
  return s;
}

/* ---------- les noms des salles, à la plume ---------- */
var NOMS = {
  puits:[[90, 110], ['Le fond du puits']], rats:[[285, 190], ['La salle', 'des rats']], reserve:[[287, 86], ['La réserve']],
  canaux:[[285, 426], ['Les canaux de la ville d’avant']], givre:[[92, 431], ['La grotte de la', 'fleur de givre']], cave:[[470, 334], ['La cave', 'aux toiles']],
  dalles:[[530, 256], ['Le couloir', 'aux dalles']], eboule:[[566, 509], ['Le cul-de-sac éboulé']], atelier:[[656, 186], ['L’atelier des', 'Fondateurs']],
  biblio:[[640, 78], ['La bibliothèque', 'engloutie']], ossuaire:[[838, 204], ['L’ossuaire']], feu:[[680, 300], ['Le feu', 'de camp']]
};
function texte(x, y, lignes, taille, c, style){
  var s = '';
  lignes.forEach(function(t, k){
    var yy = y + (k - (lignes.length - 1) / 2) * taille * 1.02;
    s += '<text x="' + x + '" y="' + f(yy) + '" text-anchor="middle" dominant-baseline="central" font-size="' + taille + '" style="font-family:' + (style || '\'TeX Gyre Chorus\', cursive') + ';paint-order:stroke" stroke="' + SOLC + '" stroke-width="3.2" stroke-linejoin="round" fill="' + (c || ENC) + '">' + t + '</text>';
  });
  return s;
}

/* ---------- la rose des vents ---------- */
function rose(x, y, r){
  var s = C(x, y, r, 'none', ' stroke="' + ENC + '" stroke-width="1"') + C(x, y, r * .82, 'none', ' stroke="' + ENC + '" stroke-width=".5"');
  for(var k = 0; k < 32; k++){ var a = k / 32 * 6.283; s += L('M' + f(x + Math.cos(a) * r * .82) + ' ' + f(y + Math.sin(a) * r * .82) + ' L' + f(x + Math.cos(a) * r * (k % 4 ? .9 : .98)) + ' ' + f(y + Math.sin(a) * r * (k % 4 ? .9 : .98)), ENC, .6); }
  for(var k2 = 0; k2 < 8; k2++){
    var a2 = k2 / 8 * 6.283 - Math.PI / 2, lg = k2 % 2 ? r * .55 : r * 1.0, la = k2 % 2 ? r * .09 : r * .14;
    var px = x + Math.cos(a2) * lg, py = y + Math.sin(a2) * lg, gx = x + Math.cos(a2 - Math.PI / 2) * la, gy = y + Math.sin(a2 - Math.PI / 2) * la, dx = x + Math.cos(a2 + Math.PI / 2) * la, dy = y + Math.sin(a2 + Math.PI / 2) * la;
    s += '<path d="M' + f(x) + ' ' + f(y) + ' L' + f(gx) + ' ' + f(gy) + ' L' + f(px) + ' ' + f(py) + ' Z" fill="' + (k2 === 0 ? ROUGE : ENC) + '"/><path d="M' + f(x) + ' ' + f(y) + ' L' + f(dx) + ' ' + f(dy) + ' L' + f(px) + ' ' + f(py) + ' Z" fill="' + SOLC + '" stroke="' + ENC + '" stroke-width=".7"/>';
  }
  s += C(x, y, 2.2, ENC);
  s += '<text x="' + x + '" y="' + f(y - r - 9) + '" text-anchor="middle" dominant-baseline="central" font-size="17" style="font-family:\'TeX Gyre Chorus\', cursive" fill="' + ROUGE + '">N</text>';
  return s;
}

function plan(){
  defs = []; uid = 0;
  hachuresPattern();
  var R = rng(3);
  /* le bois de la table, sous le parchemin */
  defs.push('<filter id="bois" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".004 .09" numOctaves="3" seed="2"/><feColorMatrix values=".3 0 0 0 -.02  .2 0 0 0 -.02  .18 0 0 0 0  0 0 0 0 1"/></filter>');
  /* la texture du parchemin : fibres et taches */
  defs.push('<filter id="papier" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">' +
    '<feTurbulence type="fractalNoise" baseFrequency=".012" numOctaves="5" seed="8" result="n"/>' +
    '<feColorMatrix in="n" values="0 0 0 0 .45  0 0 0 0 .3  0 0 0 0 .14  -2.2 0 0 0 1.35" result="taches"/>' +
    '<feTurbulence type="fractalNoise" baseFrequency=".9 .25" numOctaves="2" seed="4" result="fib"/>' +
    '<feColorMatrix in="fib" values="0 0 0 0 .35  0 0 0 0 .24  0 0 0 0 .12  0 0 0 -1.1 .62" result="fibres"/>' +
    '<feMerge><feMergeNode in="taches"/><feMergeNode in="fibres"/></feMerge></filter>');
  /* l'encre tremble un peu : c'est dessiné à la main */
  defs.push('<filter id="main" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed="6" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="2.6" xChannelSelector="R" yChannelSelector="G"/></filter>');
  defs.push('<filter id="bordHach" filterUnits="userSpaceOnUse" x="-20" y="-20" width="1000" height="580"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="3" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="9" xChannelSelector="R" yChannelSelector="G"/></filter>');
  var bord = bordParchemin();
  defs.push('<clipPath id="parch"><path d="' + bord + '"/></clipPath>');
  defs.push('<mask id="mHach" maskUnits="userSpaceOnUse" x="-20" y="-20" width="1000" height="580"><g filter="url(#bordHach)">' + union(M + 9, '#fff') + '</g></mask>');
  defs.push('<mask id="mSolP" maskUnits="userSpaceOnUse" x="-20" y="-20" width="1000" height="580">' + sol('#fff') + '</mask>');
  defs.push('<radialGradient id="pBrule" cx="480" cy="270" r="560" gradientUnits="userSpaceOnUse"><stop offset=".55" stop-color="#7a4a1e" stop-opacity="0"/><stop offset=".9" stop-color="#7a4a1e" stop-opacity=".3"/><stop offset="1" stop-color="#4a2a10" stop-opacity=".55"/></radialGradient>');

  var s = '';
  /* la table */
  s += '<rect width="' + W + '" height="' + H + '" fill="#160d0c"/><rect width="' + W + '" height="' + H + '" filter="url(#bois)" opacity=".9"/>';
  /* l'ombre du parchemin */
  s += '<path d="' + bord + '" fill="#000" opacity=".7" filter="' + flou(6) + '" transform="translate(3 6)"/>';
  /* le parchemin */
  var p = '<rect width="' + W + '" height="' + H + '" fill="' + PAR + '"/><rect width="' + W + '" height="' + H + '" filter="url(#papier)" opacity=".42"/>';
  /* les plis */
  p += L('M480 0 V540', '#fff8e8', 2, ' opacity=".35"') + L('M482 0 V540', '#8a6438', 1.2, ' opacity=".22"') + L('M0 270 H960', '#fff8e8', 2, ' opacity=".3"') + L('M0 272 H960', '#8a6438', 1.2, ' opacity=".2"');
  /* des taches : une tasse, de l'eau, une goutte d'encre */
  p += '<circle cx="452" cy="466" r="30" fill="none" stroke="#8a5a28" stroke-width="3.5" opacity=".22" filter="' + flou(.8) + '"/><circle cx="452" cy="466" r="27" fill="#a87a3a" opacity=".06"/>' +
    '<path d="M444 438 a30 30 0 0 1 36 12" fill="none" stroke="#7a4a1e" stroke-width="1.6" opacity=".25"/>' +
    '<ellipse cx="190" cy="470" rx="46" ry="28" fill="#9a7038" opacity=".1" filter="' + flou(6) + '"/>' +
    '<path d="M528 118 c4 -3 9 -1 9 4 c0 5 -6 7 -9 4 c-3 2 -6 -2 -3 -4 z" fill="' + ENC + '" opacity=".75"/>' + C(540, 112, 1.4, ENC, ' opacity=".7"') + C(522, 124, .9, ENC, ' opacity=".7"');
  /* le cadre à double trait */
  p += '<rect x="18" y="18" width="924" height="504" fill="none" stroke="' + ENC2 + '" stroke-width="1.6" opacity=".75"/><rect x="23" y="23" width="914" height="494" fill="none" stroke="' + ENC2 + '" stroke-width=".7" opacity=".6"/>';
  [[18, 18], [942, 18], [18, 522]].forEach(function(c){ p += '<rect x="' + (c[0] - 4) + '" y="' + (c[1] - 4) + '" width="8" height="8" fill="' + PAR + '" stroke="' + ENC2 + '" stroke-width="1" transform="rotate(45 ' + c[0] + ' ' + c[1] + ')"/>'; });

  /* ======== le donjon, à l'encre ======== */
  var e = '';
  e += '<g mask="url(#mHach)"><rect width="' + W + '" height="' + H + '" fill="url(#hach)"/></g>';
  e += union(M + 1.2, ENC) + union(M, 'url(#murH)') + union(1.5, ENC) + sol(SOLC);
  e += '<g mask="url(#mSolP)"><rect width="' + W + '" height="' + H + '" fill="url(#quad)"/></g>';
  /* le couloir aux dalles : de grandes dalles */
  var dl = S.dalles; e += '<path d="' + lisse(dl.pts) + '" fill="none" stroke="url(#quad2)" stroke-width="' + (dl.l - 2) + '" stroke-linecap="butt"/>';
  /* les murs : un trait de pierres */
  e += details();
  /* le passage secret */
  e += L(lisse(D.SECRET), ROUGE, 1.8, ' stroke-dasharray="1 5" opacity=".9"') + L(lisse(D.SECRET), ROUGE, 3.6, ' stroke-dasharray="0.1 10" opacity=".9"');
  p += '<g filter="url(#main)">' + e + '</g>';
  /* annotations : runes de la ville d'avant, écriture à la plume */
  p += '<g opacity=".8">' + ligneRunes(328, 300, 4, 11, .75) + ligneRunes(150, 96, 5, 12, .75) + ligneRunes(730, 128, 4, 13, .8, ROUGE) + ligneRunes(612, 480, 3, 14, .75) + '</g>';
  p += rune(669, 354, 1, 4, ROUGE);
  [[182, 186, 5, 'XL pas'], [389, 348, -10, 'XX pas'], [747, 182, -3, 'XXX pas'], [300, 128, -90, 'XII pas']].forEach(function(q){
    p += '<text x="' + q[0] + '" y="' + q[1] + '" text-anchor="middle" dominant-baseline="central" font-size="11.5" transform="rotate(' + q[2] + ' ' + q[0] + ' ' + q[1] + ')" style="font-family:\'TeX Gyre Chorus\', cursive;paint-order:stroke" stroke="' + SOLC + '" stroke-width="2.6" fill="' + ENC2 + '">' + q[3] + '</text>'; });
  p += texte(420, 236, ['l’eau d’avant', 'coule encore'], 13, ENC2);
  /* la rose des vents */
  p += rose(462, 168, 32);
  /* le titre, dans un cartouche */
  p += '<path d="M356 28 H572 L 563 44 L 572 60 H356 L 365 44 Z" fill="' + SOLC + '" stroke="' + ENC + '" stroke-width="1.2"/><path d="M364 32 H564 M364 56 H564" stroke="' + ENC2 + '" stroke-width=".6" opacity=".7"/>' +
    '<text x="464" y="45" text-anchor="middle" dominant-baseline="central" font-size="21" style="font-family:\'TeX Gyre Chorus\', cursive" fill="' + ENC + '">Le plan des Fondateurs</text>' +
    texte(464, 76, ['relevé de la ville d’avant'], 12, ENC2);
  /* les noms */
  Object.keys(NOMS).forEach(function(k){ var n = NOMS[k]; p += texte(n[0][0], n[0][1], n[1], 17.5, '#2e1a0c'); });
  /* le bord brûlé, foncé */
  p += '<rect width="' + W + '" height="' + H + '" fill="url(#pBrule)"/>';
  p += '<path d="' + bord + '" fill="none" stroke="#5a3414" stroke-width="16" opacity=".35" filter="' + flou(6) + '"/><path d="' + bord + '" fill="none" stroke="#3a1e0a" stroke-width="2.2" opacity=".55"/>';
  s += '<g clip-path="url(#parch)">' + p + '</g>';
  /* le bord de la déchirure : les fibres blanches du papier arraché */
  var dch = D.DECHIRURE.slice(1, -1);
  s += L(U.poly(dch, false), '#f6ead0', 2.4, ' opacity=".7" filter="url(#bordHach)"');
  /* la place du morceau perdu */
  var ins = dch.map(function(q){ return [q[0] + 14, q[1] + 14]; });
  s += '<path d="' + U.poly([[ins[0][0], 540]].concat(ins).concat([[952, ins[ins.length - 1][1]], [952, 532], [ins[0][0], 532]])) + '" fill="none" stroke="#e8d4a6" stroke-width="1.4" stroke-dasharray="6 6" opacity=".35"/>';
  s += '<g opacity=".8"><text x="852" y="448" text-anchor="middle" dominant-baseline="central" font-size="30">📜</text>' +
    '<text x="852" y="484" text-anchor="middle" dominant-baseline="central" font-size="15" font-weight="700" fill="#e8d4a6" style="font-family:Andika, Inter, sans-serif">Morceau perdu</text></g>';
  var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" style="position:absolute;inset:0;display:block"><defs>' + defs.join('') + '</defs>' + s + '</svg>';
  var bulle = '<div style="position:absolute;left:30px;bottom:22px;width:350px"><div class="ex-bulle">Ce vieux plan ne dit pas où vous êtes…<br>Le Pisteur, lui, le sait !<span class="ex-lire">🔊</span></div></div>';
  return EXPLO.CSS + '<div class="ex">' + svg + bulle + '</div>';
}
window.PLAN_SAGE = plan;
})();
