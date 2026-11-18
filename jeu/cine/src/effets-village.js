/* effets-village.js — les effets des trois films de début d'enquête (Bible §13.69), calculés pour un temps t comme tous les autres :
   LES MATIÈRES des personnages (la laine, le lin, le cuir, la peau… : FV.texturer), LA CARTE DES LUMIÈRES (les ronds et les formes
   de lumière qu'on pose dans la couche #lumap : FV.rond, FV.rondSol, FV.forme), les rayons du soleil, les reflets d'objectif,
   les ronds flous, la poussière dorée, L'EAU de la rivière, les confettis, les fanions, les oiseaux, et le titre du film. */
(function(){
'use strict';
var U = window.CU, FX = window.CFX;
var FV = window.CFXV = {};
var W = 1440, H = 616;
function r(v){ return Math.round(v * 10) / 10; }
function rgb(c){ return 'rgb(' + Math.round(U.clamp(c[0], 0, 255)) + ',' + Math.round(U.clamp(c[1], 0, 255)) + ',' + Math.round(U.clamp(c[2], 0, 255)) + ')'; }
FV.rgb = rgb;
FV.mel = function(a, b, k){ return [U.lerp(a[0], b[0], k), U.lerp(a[1], b[1], k), U.lerp(a[2], b[2], k)]; };
/* une couleur qui suit des clés dans le temps : [[t, [r, v, b]], …] */
FV.couleur = function(cles){ var p = U.piste(cles.map(function(c){ return [c[0], {r:c[1][0], v:c[1][1], b:c[1][2]}, c[2] || 'l']; })); return function(t){ var q = p(t); return [q.r, q.v, q.b]; }; };

/* ====================================================================== LES MATIÈRES (des motifs dessinés, nets à tous les zooms) */
var MOTIFS = null;
function motifs(){
  if(MOTIFS) return MOTIFS;
  function m(id, w, h, contenu, tr){ return '<pattern id="tx_' + id + '" width="' + w + '" height="' + h + '" patternUnits="userSpaceOnUse"' + (tr ? ' patternTransform="' + tr + '"' : '') + '>' + contenu + '</pattern>'; }
  /* un semis qui se répète sans couture : chaque élément est redessiné décalé d'une tuile s'il touche un bord */
  function semis(n, w, h, graine, fn){ var R = U.hasard(graine), s = ''; for(var i = 0; i < n; i++){ var x = R() * w, y = R() * h, a = [R(), R(), R(), R()]; [-w, 0, w].forEach(function(dx){ [-h, 0, h].forEach(function(dy){ if(x + dx > -8 && x + dx < w + 8 && y + dy > -8 && y + dy < h + 8) s += fn(x + dx, y + dy, a); }); }); } return s; }
  var d = '';
  /* une toile fine (la soie de la cravate, l'écharpe du maire) */
  d += m('tissu', 4, 4, '<path d="M0 1H4M0 3H4" stroke="#000" stroke-opacity=".1" stroke-width=".7"/><path d="M1 0V4M3 0V4" stroke="#fff" stroke-opacity=".09" stroke-width=".7"/>');
  /* la laine : un sergé (des côtes en biais), un peu de duvet */
  d += m('laine', 6, 6, '<path d="M0 1.2H6" stroke="#000" stroke-opacity=".17" stroke-width="1.5"/><path d="M0 4.2H6" stroke="#fff" stroke-opacity=".09" stroke-width="1.1"/><path d="M1 2.6h1.4M3.6 5.6h1.6" stroke="#fff" stroke-opacity=".12" stroke-width=".6"/>', 'rotate(38)');
  /* le lin : des fils inégaux, en long et en large */
  d += m('lin', 40, 40, semis(46, 40, 40, 7, function(x, y, a){ var l = 5 + a[0] * 12, v = a[1] < .5; return '<path d="M' + r(x) + ' ' + r(y) + (v ? 'v' : 'h') + r(l) + '" stroke="' + (a[2] < .6 ? '#5a4a30' : '#fff') + '" stroke-opacity="' + r(.08 + a[3] * .12) + '" stroke-width="' + r(.7 + a[2] * .7) + '"/>'; }));
  /* la peau : des pores, à peine */
  d += m('peau', 36, 36, semis(34, 36, 36, 11, function(x, y, a){ return '<circle cx="' + r(x) + '" cy="' + r(y) + '" r="' + r(.45 + a[0] * .5) + '" fill="' + (a[1] < .7 ? '#7a3a20' : '#fff') + '" fill-opacity="' + r(.07 + a[2] * .08) + '"/>'; }));
  /* le cuir : des craquelures, des reflets */
  d += m('cuir', 44, 44, semis(26, 44, 44, 13, function(x, y, a){ var l = 4 + a[0] * 9, an = a[1] * 6.283; return '<path d="M' + r(x) + ' ' + r(y) + ' q ' + r(Math.cos(an) * l * .5 + 2) + ' ' + r(Math.sin(an) * l * .5 - 2) + ' ' + r(Math.cos(an) * l) + ' ' + r(Math.sin(an) * l) + '" fill="none" stroke="' + (a[2] < .7 ? '#000' : '#fff') + '" stroke-opacity="' + r(.12 + a[3] * .14) + '" stroke-width="' + r(.6 + a[2] * .6) + '"/>'; }));
  /* le bois : le fil */
  d += m('bois', 60, 20, semis(14, 60, 20, 17, function(x, y, a){ var l = 14 + a[0] * 30; return '<path d="M' + r(x) + ' ' + r(y) + ' q ' + r(l / 2) + ' ' + r((a[1] - .5) * 3) + ' ' + r(l) + ' ' + r((a[2] - .5) * 2) + '" fill="none" stroke="#2a1608" stroke-opacity="' + r(.14 + a[3] * .16) + '" stroke-width=".8"/>'; }));
  /* le brocart du gilet : des losanges et des points, ton sur ton */
  d += m('brocart', 18, 18, '<path d="M9 1 L16 9 L9 17 L2 9 Z" fill="none" stroke="#5a3a00" stroke-opacity=".3" stroke-width="1"/><circle cx="9" cy="9" r="2" fill="#fff6c8" fill-opacity=".34"/><circle cx="0" cy="0" r="1.4" fill="#5a3a00" fill-opacity=".3"/><circle cx="18" cy="0" r="1.4" fill="#5a3a00" fill-opacity=".3"/><circle cx="0" cy="18" r="1.4" fill="#5a3a00" fill-opacity=".3"/><circle cx="18" cy="18" r="1.4" fill="#5a3a00" fill-opacity=".3"/>');
  /* le tricot de l'écharpe : des mailles en V */
  d += m('tricot', 8, 6, '<path d="M0 0 L4 4.4 L8 0" fill="none" stroke="#000" stroke-opacity=".22" stroke-width="1.1"/><path d="M0 2 L4 6.4 L8 2" fill="none" stroke="#fff" stroke-opacity=".14" stroke-width=".8"/>');
  /* le velours à côtes */
  d += m('cotes', 5, 12, '<path d="M1 0V12" stroke="#000" stroke-opacity=".2" stroke-width="1.2"/><path d="M3.4 0V12" stroke="#fff" stroke-opacity=".1" stroke-width=".9"/>');
  /* les cheveux : des mèches */
  d += m('cheveux', 30, 30, semis(22, 30, 30, 19, function(x, y, a){ var l = 8 + a[0] * 14; return '<path d="M' + r(x) + ' ' + r(y) + ' q ' + r((a[1] - .5) * 5) + ' ' + r(l / 2) + ' ' + r((a[2] - .5) * 4) + ' ' + r(l) + '" fill="none" stroke="' + (a[3] < .55 ? '#000' : '#fff') + '" stroke-opacity="' + r(.14 + a[0] * .14) + '" stroke-width="' + r(.7 + a[1] * .6) + '"/>'; }));
  /* la paille tressée */
  d += m('paille', 10, 10, '<path d="M0 2.5H5M5 7.5H10" stroke="#6a4a10" stroke-opacity=".3" stroke-width="1"/><path d="M2.5 5V10M7.5 0V5" stroke="#fff" stroke-opacity=".22" stroke-width="1"/>');
  return MOTIFS = d;
}
function matiereDe(id){
  if(/^gv?Peau/.test(id)) return 'peau';
  if(/^gvPoil/.test(id)) return 'cheveux';
  if(id === 'gGilet' || /_gilet$/.test(id)) return 'brocart';
  if(id === 'gChemise' || id === 'gvBlanc' || id === 'gKaki' || /_(chemise|tablier)$/.test(id)) return 'lin';
  if(id === 'gCuir' || id === 'gGant' || /_bottes$/.test(id)) return 'cuir';
  if(id === 'gBois' || id === 'gvBoisX') return 'bois';
  if(/_echarpe$/.test(id)) return 'tricot';
  if(id === 'gBrunX' || /_bas$/.test(id)) return 'cotes';
  if(id === 'gvPaille') return 'paille';
  if(id === 'gCravate' || id === 'gEcharpe') return 'tissu';
  if(/^g(Red|RedX|NoirX|VertX|Vert|TabardX)$/.test(id) || /_(haut|jupe|salopette)$/.test(id)) return 'laine';
  return null;
}
/* chaque pièce peinte avec un dégradé connu est redessinée par-dessus avec le motif de sa matière (sans son trait) */
FV.texturer = function(s){
  return s.replace(/<(path|ellipse|circle|rect)\b([^>]*?)\sfill="url\(#(g[A-Za-z0-9_]+)\)"([^>]*?)\/>/g, function(tout, balise, a, id, b){
    var mat = matiereDe(id); if(!mat) return tout;
    return tout + '<' + balise + (a + b).replace(/\sstroke(-[a-z]+)?="[^"]*"/g, '') + ' fill="url(#tx_' + mat + ')"/>';
  });
};

/* ====================================================================== LES DÉFINITIONS */
FV.defs = function(){
  function rg(id, stops){ return '<radialGradient id="' + id + '">' + stops.map(function(s){ return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '" stop-opacity="' + s[2] + '"/>'; }).join('') + '</radialGradient>'; }
  var d = motifs();
  /* les ronds de la carte des lumières : le cœur plein, le bord qui s'efface (la couleur est donnée par « fill » : on passe par un masque) */
  d += rg('lmDoux', [[0, '#fff', 1], [.45, '#fff', .6], [1, '#fff', 0]]) + rg('lmPlein', [[0, '#fff', 1], [.7, '#fff', .9], [1, '#fff', 0]]);
  d += rg('soleilHalo', [[0, '#fffbe6', .95], [.18, '#ffe9a8', .7], [.5, '#ffb45a', .22], [1, '#ff8a3a', 0]]);
  d += rg('soleilCoeur', [[0, '#ffffff', 1], [.6, '#fff6d0', .95], [1, '#ffe08a', 0]]);
  d += rg('orHalo', [[0, '#fff6c8', .9], [.3, '#ffd45a', .5], [1, '#ff9a1a', 0]]) + rg('orCoeur', [[0, '#ffffff', 1], [.5, '#fff0a0', .9], [1, '#ffc83a', 0]]);
  d += rg('bokehOr', [[0, '#ffd070', .34], [.74, '#ffd070', .38], [.92, '#fff0b0', .56], [1, '#fff0b0', 0]]) + rg('bokehBleu', [[0, '#a8c8ff', .26], [.74, '#a8c8ff', .3], [.92, '#e0ecff', .46], [1, '#e0ecff', 0]]) + rg('bokehRose', [[0, '#ffb0a0', .3], [.74, '#ffb0a0', .34], [.92, '#ffe0d0', .5], [1, '#ffe0d0', 0]]);
  /* le relief des dessins « libres » (un villageois de dos, le chat) : leur silhouette floutée sert de carte des hauteurs.
     Soleil : la lumière vient d'en haut à gauche, un liseré doré à droite ; Contre : le soleil est derrière, deux liserés dorés */
  function relief(id, coul, az, el, rims){
    var f = '<filter id="relief' + id + '" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="4.5" result="h"/>' +
      '<feDiffuseLighting in="h" surfaceScale="5" diffuseConstant="1.08" lighting-color="' + coul + '" result="d"><feDistantLight azimuth="' + az + '" elevation="' + el + '"/></feDiffuseLighting><feComposite in="d" in2="SourceAlpha" operator="in" result="d2"/><feBlend in="SourceGraphic" in2="d2" mode="multiply" result="o0"/>';
    rims.forEach(function(q, k){ f += '<feSpecularLighting in="h" surfaceScale="5" specularConstant="' + q[2] + '" specularExponent="13" lighting-color="' + q[3] + '" result="s' + k + '"><feDistantLight azimuth="' + q[0] + '" elevation="' + q[1] + '"/></feSpecularLighting><feComposite in="s' + k + '" in2="SourceAlpha" operator="in" result="t' + k + '"/><feComposite in="o' + k + '" in2="t' + k + '" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="o' + (k + 1) + '"/>'; });
    return f + '</filter>';
  }
  d += relief('Soleil', '#fff6e4', 225, 52, [[330, 28, .55, '#ffe2a8']]) + relief('Contre', '#f0e2dc', 250, 60, [[200, 24, .9, '#ffd898'], [340, 24, .9, '#ffd898']]) + relief('Nuit', '#c8d4f0', 225, 55, [[200, 24, .6, '#9ab8ff']]);
  d += '<linearGradient id="rayonSoleil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0c0" stop-opacity=".55"/><stop offset=".6" stop-color="#ffd890" stop-opacity=".18"/><stop offset="1" stop-color="#ffd890" stop-opacity="0"/></linearGradient>';
  d += '<linearGradient id="titreOr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6c8"/><stop offset=".45" stop-color="#ffd24a"/><stop offset=".55" stop-color="#e8a820"/><stop offset="1" stop-color="#b87a10"/></linearGradient>';
  return d;
};

/* ====================================================================== LA CARTE DES LUMIÈRES (ce qu'on rend ici va dans E.lampes)
   un rond de lumière à l'écran : au centre l'image prend la couleur c (plus claire que l'ambiance : c'est « éclairé ») */
function rondDeg(x, y, rx, ry, c, k, plein){
  if(!(k > 0) || rx < .5) return '';
  var id = 'lg' + (++FV._n), col = rgb(c);
  return '<radialGradient id="' + id + '"><stop offset="0" stop-color="' + col + '" stop-opacity="' + r(U.clamp(k, 0, 1)) + '"/><stop offset="' + (plein ? .7 : .45) + '" stop-color="' + col + '" stop-opacity="' + r(U.clamp(k * (plein ? .9 : .55), 0, 1)) + '"/><stop offset="1" stop-color="' + col + '" stop-opacity="0"/></radialGradient>' +
    '<ellipse cx="' + r(x) + '" cy="' + r(y) + '" rx="' + r(rx) + '" ry="' + r(ry == null ? rx : ry) + '" fill="url(#' + id + ')"/>';
}
FV._n = 0;
FV.rond = rondDeg;
/* un rond de lumière autour d'un point du monde (une lanterne, un visage éclairé) */
FV.rondMonde = function(x, y, z, rayon, c, k, plein){ var p = CAM.projeter(x, y, z); if(p.d < 30) return ''; return rondDeg(p.x, p.y, rayon * p.s, rayon * p.s, c, k, plein); };
/* une flaque de lumière posée sur le sol (y = yg) */
FV.rondSol = function(x, z, rx, rz, c, k, yg){
  var p = CAM.projeter(x, yg || 0, z), a = CAM.projeter(x + rx, yg || 0, z), b1 = CAM.projeter(x, yg || 0, z + rz), b2 = CAM.projeter(x, yg || 0, z - rz);
  if(p.d < 30 || b1.d < 20) return '';
  return rondDeg(p.x, (b1.y + b2.y) / 2, Math.abs(a.x - p.x), Math.max(2, Math.abs(b1.y - b2.y) / 2), c, k);
};
/* une forme de lumière dont les coins sont dans le monde (le rectangle de la fenêtre sur le plancher, un mur éclairé) ; flou en points d'écran */
FV.forme = function(pts, c, k, flou){
  if(!(k > 0)) return '';
  /* (les coins qui passent derrière la caméra sont coupés proprement, au ras de l'objectif) */
  var V = pts.map(function(p){ var v = CAM.vue(p[0], p[1], p[2]); return [v.x, v.y, -v.z]; }), N = 30, S = [];
  for(var i = 0; i < V.length; i++){
    var A = V[i], B = V[(i + 1) % V.length], da = A[2] - N, db = B[2] - N;
    if(da >= 0) S.push(A);
    if((da >= 0) !== (db >= 0)){ var u = da / (da - db); S.push([A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u, N]); }
  }
  if(S.length < 3) return '';
  return '<polygon points="' + S.map(function(p){ return r(W / 2 + p[0] * CAM.P / p[2]) + ',' + r(H / 2 + p[1] * CAM.P / p[2]); }).join(' ') + '" fill="' + rgb(c) + '" opacity="' + r(U.clamp(k, 0, 1)) + '"' + (flou ? ' filter="url(#fl' + Math.max(1, Math.min(90, Math.round(flou * 2))) + ')"' : '') + '/>';
};
/* toute l'image éclairée d'un côté (un dégradé à l'écran, d'un bord à l'autre) : le soleil rasant */
FV.bain = function(x1, y1, x2, y2, c, k1, k2){
  var id = 'lb' + (++FV._n), col = rgb(c);
  return '<linearGradient id="' + id + '" gradientUnits="userSpaceOnUse" x1="' + r(x1) + '" y1="' + r(y1) + '" x2="' + r(x2) + '" y2="' + r(y2) + '"><stop offset="0" stop-color="' + col + '" stop-opacity="' + r(k1) + '"/><stop offset="1" stop-color="' + col + '" stop-opacity="' + r(k2) + '"/></linearGradient><rect width="' + W + '" height="' + H + '" fill="url(#' + id + ')"/>';
};

/* ====================================================================== LE SOLEIL DANS L'OBJECTIF (dans la couche des lumières, qui s'ajoute)
   les rayons : de grands pinceaux qui partent du soleil (x, y à l'écran) ; ils respirent lentement */
FV.rayons = function(t, x, y, k, o){
  if(!(k > 0)) return '';
  o = o || {};
  var R = U.hasard(o.graine || 5), n = o.n || 11, s = '', L = o.l || 1100, a0 = o.a0 == null ? 20 : o.a0, a1 = o.a1 == null ? 160 : o.a1;
  for(var i = 0; i < n; i++){
    var an = U.rad(a0 + (a1 - a0) * (i + R() * .8) / n + U.fbm(t * .12 + i, i, 2) * 3), l = L * (.55 + R() * .6), e = (.02 + R() * .05) * (o.e || 1), op = k * (.1 + R() * .2) * (.7 + .3 * U.fbm(t * .5 + i * 3, i + 20, 2));
    var c = Math.cos(an), sn = Math.sin(an);
    s += '<polygon points="' + r(x) + ',' + r(y) + ' ' + r(x + (c - sn * e) * l) + ',' + r(y + (sn + c * e) * l) + ' ' + r(x + (c + sn * e) * l) + ',' + r(y + (sn - c * e) * l) + '" fill="' + (o.c || '#ffe2a8') + '" opacity="' + r(U.clamp(op, 0, 1)) + '"/>';
  }
  return '<g filter="url(#fl' + (o.flou || 24) + ')">' + s + '</g>';
};
/* le disque et son grand halo */
FV.soleil = function(x, y, rayon, k){
  if(!(k > 0)) return '';
  return '<circle cx="' + r(x) + '" cy="' + r(y) + '" r="' + r(rayon * 9) + '" fill="url(#soleilHalo)" opacity="' + r(U.clamp(k * .8, 0, 1)) + '"/><circle cx="' + r(x) + '" cy="' + r(y) + '" r="' + r(rayon * 2.2) + '" fill="url(#soleilCoeur)" opacity="' + r(U.clamp(k, 0, 1)) + '"/>';
};
/* les reflets dans l'objectif : une traînée horizontale, et des ronds pâles alignés sur le centre de l'image */
FV.reflets = function(t, x, y, k){
  if(!(k > 0)) return '';
  var cx = W / 2, cy = H / 2, s = '';
  s += '<ellipse cx="' + r(x) + '" cy="' + r(y) + '" rx="' + r(520 * k + 80) + '" ry="' + r(5 + 5 * k) + '" fill="#ffe6b0" opacity="' + r(.5 * k) + '" filter="url(#fl8)"/>';
  [[.35, 26, '#ffc890', .2], [.62, 14, '#a8ffd0', .16], [.9, 44, '#ffb0a0', .12], [1.3, 70, '#b0c8ff', .1], [1.6, 20, '#fff0c0', .18], [2.05, 110, '#ffd0a0', .07]].forEach(function(g){
    var gx = x + (cx - x) * g[0] * 2 * .62, gy = y + (cy - y) * g[0] * 2 * .62;
    s += '<circle cx="' + r(gx) + '" cy="' + r(gy) + '" r="' + r(g[1]) + '" fill="' + g[2] + '" opacity="' + r(g[3] * k) + '"/><circle cx="' + r(gx) + '" cy="' + r(gy) + '" r="' + r(g[1]) + '" fill="none" stroke="' + g[2] + '" stroke-width="1.5" opacity="' + r(g[3] * k * 1.3) + '"/>';
  });
  return s;
};
/* des ronds flous qui flottent devant l'objectif (la rosée, la poussière tout près) : sorte = 'Or' | 'Bleu' | 'Rose' */
FV.bokehs = function(t, n, k, sorte, graine, zone){
  if(!(k > 0)) return '';
  var R = U.hasard(graine || 31), s = '', z = zone || [0, 0, W, H];
  for(var i = 0; i < n; i++){
    var x = z[0] + R() * (z[2] - z[0]) + U.fbm(t * .08 + i, i, 2) * 60, y = z[1] + R() * (z[3] - z[1]) + U.fbm(t * .07 + i * 2, i + 30, 2) * 40, rr = 10 + R() * 34, op = (.25 + R() * .6) * k * (.7 + .3 * Math.sin(t * (.5 + R()) + R() * 6));
    s += '<circle cx="' + r(x) + '" cy="' + r(y) + '" r="' + r(rr) + '" fill="url(#bokeh' + (sorte || 'Or') + ')" opacity="' + r(U.clamp(op, 0, 1)) + '"/>';
  }
  return s;
};
/* la poussière dans un rayon de soleil : des points dorés qui dérivent dans une boîte du monde */
FV.poussiere = function(t, boite, n, graine, coul, k){
  var R = U.hasard(graine || 3), s = '';
  for(var i = 0; i < n; i++){
    var x = U.lerp(boite[0], boite[3], R()) + U.bruit(t * .19 + i, i) * 50, y = U.lerp(boite[1], boite[4], R()) + U.bruit(t * .15 + i * 2, i + 50) * 40 - ((t * 5 + R() * 300) % 300) + 150, z = U.lerp(boite[2], boite[5], R()) + U.bruit(t * .17 + i * 3, i + 90) * 40;
    var p = CAM.projeter(x, y, z); if(p.d < 60 || p.x < -20 || p.x > W + 20 || p.y < -20 || p.y > H + 20) continue;
    var f = CAM.flou(p.d), rr = Math.max(.5, 1.7 * p.s) + f * .5, op = (.2 + .7 * R()) * (k == null ? 1 : k) * (.6 + .4 * Math.sin(t * (1 + R() * 2) + R() * 6)); if(f > 5) op *= 5 / f;
    s += '<circle cx="' + r(p.x) + '" cy="' + r(p.y) + '" r="' + r(rr) + '" fill="' + (coul || '#ffe6b0') + '" opacity="' + r(U.clamp(op, 0, .95)) + '"/>';
  }
  return s;
};

/* ====================================================================== LA FÊTE */
/* des confettis et des pétales qui tombent en tournant, dans une boîte du monde ; depuis t0 */
FV.confettis = function(t, t0, boite, n, graine){
  var a0 = t - t0; if(a0 < 0) return '';
  var R = U.hasard(graine || 41), s = '', COUL = ['#ffd23f', '#ff6a5a', '#5ac8fa', '#7ad66a', '#ff9ad0', '#ffffff', '#c89aff'];
  for(var i = 0; i < n; i++){
    var dep = R() * 2.2, a = a0 - dep, x0 = U.lerp(boite[0], boite[3], R()), z0 = U.lerp(boite[2], boite[5], R()), yTop = boite[1], vit = 260 + R() * 240, col = COUL[Math.floor(R() * COUL.length)], ph = R() * 6, l = 16 + R() * 14;
    if(a < 0) continue;
    var y = yTop + a * vit; y = yTop + ((y - yTop) % (boite[4] - yTop + 300));
    var x = x0 + Math.sin(a * (1.2 + R()) + ph) * 90, p = CAM.projeter(x, y, z0); if(p.d < 60 || p.x < -30 || p.x > W + 30 || p.y < -30 || p.y > H + 30) continue;
    var f = CAM.flou(p.d), rot = a * (200 + R() * 300) + ph * 60, ky = Math.abs(Math.cos(a * (3 + R() * 3) + ph));
    s += (f > 1.2 ? '<g style="filter:blur(' + r(Math.min(14, f * .6)) + 'px)">' : '<g>') + '<rect x="' + r(-l * p.s / 2) + '" y="' + r(-l * p.s * .3 * ky - .5) + '" width="' + r(l * p.s) + '" height="' + r(Math.max(1, l * p.s * .6 * ky)) + '" fill="' + col + '" transform="translate(' + r(p.x) + ' ' + r(p.y) + ') rotate(' + r(rot) + ')"/></g>';
  }
  return s;
};
/* une guirlande de fanions entre deux points du monde ; k : elle se déroule (0 → 1) ; elle se balance */
FV.fanions = function(t, A, B, n, k, graine){
  if(!(k > 0)) return '';
  var s = '', COUL = ['#e04a3a', '#f2c040', '#3f8fd0', '#5aa85a', '#f08ac0', '#f4f0e0'], pts = [], creux = (A[3] || 260);
  for(var i = 0; i <= n * 2; i++){ var u = i / (n * 2) * k, bal = Math.sin(t * 1.4 + u * 5 + (graine || 0)) * 16 * Math.sin(u * Math.PI);
    pts.push(CAM.projeter(U.lerp(A[0], B[0], u) + bal, U.lerp(A[1], B[1], u) + Math.sin(u * Math.PI) * creux, U.lerp(A[2], B[2], u))); }
  if(pts[0].d < 40) return '';
  var f = CAM.flou(pts[n].d);
  s += '<path d="M' + pts.map(function(p){ return r(p.x) + ' ' + r(p.y); }).join(' L ') + '" fill="none" stroke="#3a2a1a" stroke-width="' + r(Math.max(1, 4 * pts[n].s)) + '"/>';
  for(i = 0; i < n * k - .2; i++){ var a = pts[i * 2], b = pts[Math.min(pts.length - 1, i * 2 + 2)], m = pts[i * 2 + 1], h = 120 * m.s, v = Math.sin(t * 2.2 + i * 1.3) * 10 * m.s;
    s += '<path d="M' + r(a.x) + ' ' + r(a.y) + ' L ' + r(b.x) + ' ' + r(b.y) + ' L ' + r(m.x + v) + ' ' + r(m.y + h) + ' Z" fill="' + COUL[i % COUL.length] + '" stroke="#1a0e08" stroke-width="' + r(Math.max(.6, 2 * m.s)) + '" stroke-linejoin="round"/>'; }
  return (f > 1 ? '<g style="filter:blur(' + r(Math.min(30, f * .5)) + 'px)">' : '<g>') + s + '</g>';
};
/* des oiseaux qui s'envolent (de petits « v » qui battent des ailes) : depuis (x, y, z), à partir de t0 */
FV.oiseaux = function(t, t0, x, y, z, n, graine, o){
  var a = t - t0; if(a < 0) return '';
  o = o || {};
  var R = U.hasard(graine || 53), s = '';
  for(var i = 0; i < n; i++){
    var dep = R() * .8, b = a - dep; if(b < 0) continue;
    var dx = (o.dx || 900) * (.5 + R()) * (R() < (o.gauche == null ? .5 : o.gauche) ? -1 : 1), dy = -(500 + R() * 900), px = x + (R() - .5) * (o.l || 600) + dx * b * .5, py = y + dy * (1 - Math.exp(-b * .7)) + Math.sin(b * 3 + i) * 30, p = CAM.projeter(px, py, z + (R() - .5) * 400);
    if(p.d < 60) continue;
    var e = (60 + R() * 30) * p.s, bat = Math.sin(b * (16 + R() * 6) + i), f = CAM.flou(p.d);
    s += '<path d="M' + r(p.x - e) + ' ' + r(p.y - bat * e * .6) + ' Q ' + r(p.x - e * .4) + ' ' + r(p.y - e * .25 - bat * e * .2) + ' ' + r(p.x) + ' ' + r(p.y) + ' Q ' + r(p.x + e * .4) + ' ' + r(p.y - e * .25 - bat * e * .2) + ' ' + r(p.x + e) + ' ' + r(p.y - bat * e * .6) + '" fill="none" stroke="' + (o.c || '#1a1420') + '" stroke-width="' + r(Math.max(1, 9 * p.s)) + '" stroke-linecap="round" opacity="' + r(U.clamp(1.2 - f / 30, .3, 1)) + '"/>';
  }
  return s;
};

/* ====================================================================== L'EAU DE LA RIVIÈRE (enquête 2)
   L'eau est en z > z0, à la hauteur y (plus bas que la berge). On la voit depuis le milieu de la rivière, vers la berge.
   o = {y, z0, loin, pres (deux couleurs [r, v, b] : au pied du quai, près de nous), reflet ([r, v, b] : la couleur que le ciel pose
        dessus), refletK, soleil:{x (à l'écran), k, c}, rides (0 → 1), brumeK}
   Rend {corps (à dessiner sous les personnages), lum (dans la couche des lumières)}. */
FV.eau = function(t, o){
  var y = o.y, z0 = o.z0 || 0, c = CAM;
  var a = c.projeter(c.x - 9000, y, z0), b = c.projeter(c.x + 9000, y, z0), yl = (a.y + b.y) / 2;
  if(yl > H + 4) return {corps:'', lum:''};
  var id = 'eau' + (++FV._n), s = '', lum = '';
  var loin = o.loin, pres = o.pres, rf = o.reflet || [255, 255, 255], rk = o.refletK || 0;
  /* le fond : du pied du quai (plus clair, il reflète le ciel) jusqu'à nous (plus sombre, plus profond) */
  s += '<linearGradient id="' + id + '" gradientUnits="userSpaceOnUse" x1="0" y1="' + r(yl) + '" x2="0" y2="' + H + '"><stop offset="0" stop-color="' + rgb(FV.mel(loin, rf, rk * .75)) + '"/><stop offset=".3" stop-color="' + rgb(FV.mel(FV.mel(loin, pres, .5), rf, rk * .4)) + '"/><stop offset="1" stop-color="' + rgb(FV.mel(pres, rf, rk * .12)) + '"/></linearGradient>';
  s += '<rect x="0" y="' + r(yl - 1) + '" width="' + W + '" height="' + r(H - yl + 2) + '" fill="url(#' + id + ')"/>';
  /* l'ombre du quai sur l'eau, qui tremble */
  var om = '';
  for(var i = 0; i <= 24; i++){ var x = i / 24 * W; om += (i ? ' L ' : 'M ') + r(x) + ' ' + r(yl + 10 + 7 * Math.sin(x * .02 + t * 1.3) + 4 * Math.sin(x * .053 - t * 2)); }
  s += '<path d="' + om + ' L ' + W + ' ' + r(yl - 2) + ' L 0 ' + r(yl - 2) + ' Z" fill="#0a0406" opacity=".4"/>';
  /* les rides : des traits qui glissent avec le courant (vers la droite), serrés au loin, larges près de nous */
  var R = U.hasard(o.graine || 61), rides = o.rides == null ? 1 : o.rides;
  for(var k = 0; k < 150; k++){
    var u = Math.pow(R(), 1.7), z = z0 + 30 + u * 3600, vit = 150 + R() * 130, L = 60 + R() * 300, x0 = c.x - 4200 + ((R() * 8400 + t * vit) % 8400), ph = R() * 6;
    var p1 = c.projeter(x0, y, z), p2 = c.projeter(x0 + L, y, z); if(p1.d < 40 || p1.x > W + 50 || p2.x < -50 || p1.y > H + 10) continue;
    var clair = R() < .5, on = Math.sin(t * (1 + R() * 1.5) + ph) * 3 * p1.s, ep = Math.max(.7, (2 + R() * 5) * p1.s), f = c.flou(p1.d);
    var col = clair ? rgb(FV.mel(FV.mel(loin, [255, 255, 255], .25), rf, rk)) : rgb(FV.mel(pres, [0, 0, 0], .35));
    s += '<path d="M' + r(p1.x) + ' ' + r(p1.y + on) + ' Q ' + r((p1.x + p2.x) / 2) + ' ' + r(p1.y - on * 1.5 - ep * .6) + ' ' + r(p2.x) + ' ' + r(p2.y + on) + '" fill="none" stroke="' + col + '" stroke-width="' + r(ep) + '" stroke-linecap="round" opacity="' + r(rides * (clair ? .16 + rk * .3 : .3) * U.clamp(1.3 - f / 16, .25, 1)) + '"/>';
  }
  /* le chemin de lumière du soleil sur l'eau : des éclats qui scintillent, de plus en plus larges vers nous */
  if(o.soleil && o.soleil.k > 0){
    var S = o.soleil, R2 = U.hasard(71);
    for(var j = 0; j < 110; j++){
      var v = Math.pow(R2(), 1.4), yy = yl + 6 + v * (H - yl), larg = (30 + v * 260) * (S.l || 1), xx = S.x + (R2() - .5) * larg * 2 + Math.sin(t * .7 + j) * 6, sc = Math.pow(Math.max(0, Math.sin(t * (2.2 + R2() * 3) + R2() * 6.3)), 3), w = (8 + v * 46) * (.6 + R2() * .8);
      if(sc < .04) continue;
      lum += '<ellipse cx="' + r(xx) + '" cy="' + r(yy) + '" rx="' + r(w) + '" ry="' + r(1 + v * 3.2) + '" fill="' + (S.c || '#fff0c0') + '" opacity="' + r(U.clamp(S.k * sc * (.35 + .5 * (1 - v)), 0, 1)) + '"/>';
    }
    lum += '<ellipse cx="' + r(S.x) + '" cy="' + r(yl + 30) + '" rx="' + r(170 * (S.l || 1)) + '" ry="46" fill="' + (S.c || '#fff0c0') + '" opacity="' + r(.3 * S.k) + '" filter="url(#fl40)"/>';
  }
  /* la brume qui traîne sur l'eau, à l'aube */
  if(o.brumeK > 0){
    var R3 = U.hasard(83);
    for(var q = 0; q < 16; q++){ var bz = z0 + 100 + R3() * 2400, bx = c.x - 3600 + ((R3() * 7200 + t * (26 + R3() * 30)) % 7200), bp = c.projeter(bx, y - 40 - R3() * 60, bz); if(bp.d < 80) continue;
      lum += '<ellipse cx="' + r(bp.x) + '" cy="' + r(bp.y) + '" rx="' + r((500 + R3() * 500) * bp.s) + '" ry="' + r((50 + R3() * 50) * bp.s) + '" fill="' + (o.brumeC || '#ffe0d0') + '" opacity="' + r(o.brumeK * (.1 + R3() * .12)) + '" filter="url(#fl' + Math.max(6, Math.min(90, Math.round(60 * bp.s))) + ')"/>'; }
  }
  return {corps:s, lum:lum, yl:yl};
};
/* les reflets de l'eau qui dansent sur ce qui est au bord (un visage, un mur) : des taches mouvantes, dans la couche des lumières */
FV.caustiques = function(t, x, y, w, h, c, k, graine){
  if(!(k > 0)) return '';
  var R = U.hasard(graine || 91), s = '';
  for(var i = 0; i < 16; i++){ var px = x + R() * w + Math.sin(t * (1.1 + R()) + R() * 6) * w * .12, py = y + R() * h + Math.cos(t * (1.3 + R()) + R() * 6) * h * .1, rx = w * (.08 + R() * .14), ry = h * (.03 + R() * .05), op = k * (.3 + .7 * Math.pow(Math.max(0, Math.sin(t * (1.6 + R() * 2) + R() * 6)), 2));
    s += '<ellipse cx="' + r(px) + '" cy="' + r(py) + '" rx="' + r(rx) + '" ry="' + r(ry) + '" fill="' + c + '" opacity="' + r(U.clamp(op * .5, 0, 1)) + '" transform="rotate(' + r(-12 + R() * 24) + ' ' + r(px) + ' ' + r(py) + ')"/>'; }
  return '<g filter="url(#fl12)">' + s + '</g>';
};

/* ====================================================================== LE TITRE (à la fin du film) : en lettres d'or, lettre après lettre
   t0 → il s'écrit ; il reste ; o = {y, taille, sous (une petite ligne au-dessus : « ENQUÊTE 1 »)} */
FV.titre = function(t, t0, texte, o){
  var a = t - t0; if(a < 0) return '';
  o = o || {};
  var y = o.y || 330, taille = o.taille || 92, n = texte.length, s = '', k = U.clamp(a / .5, 0, 1);
  /* un voile sombre derrière les lettres (plus léger si l'image doit rester lisible : o.voile) */
  s += '<linearGradient id="titreVoile" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#06040a" stop-opacity=".9"/><stop offset=".62" stop-color="#06040a" stop-opacity="' + (o.voile == null ? .9 : o.voile) + '"/><stop offset="1" stop-color="#06040a" stop-opacity="' + (o.voile == null ? .9 : o.voile * .5) + '"/></linearGradient><rect width="' + W + '" height="' + H + '" fill="url(#titreVoile)" opacity="' + r(.62 * k) + '"/>';
  if(o.sous) s += '<text x="' + W / 2 + '" y="' + r(y - taille * .98) + '" text-anchor="middle" font-family="Macondo, serif" font-size="' + r(taille * .34) + '" letter-spacing="10" fill="#f4e6c0" opacity="' + r(U.clamp((a - .1) / .5, 0, 1) * .9) + '">' + o.sous + '</text>';
  /* les lettres : chacune arrive un peu après la précédente, un peu plus grande, puis se pose */
  var tspans = '';
  for(var i = 0; i < n; i++){ var ka = U.clamp((a - .25 - i * .055) / .35, 0, 1); tspans += '<tspan fill-opacity="' + r(U.lisse(ka)) + '">' + (texte[i] === ' ' ? '&#160;' : texte[i].replace('&', '&amp;')) + '</tspan>'; }
  var ech = 1 + .04 * (1 - U.lisse(U.clamp(a / 2.2, 0, 1)));
  s += '<g transform="translate(' + W / 2 + ' ' + y + ') scale(' + r(ech * 100) / 100 + ')"><text x="3" y="5" text-anchor="middle" font-family="Macondo, serif" font-size="' + taille + '" fill="#000" opacity=".7" style="filter:blur(4px)">' + tspans + '</text>' +
    '<text x="0" y="0" text-anchor="middle" font-family="Macondo, serif" font-size="' + taille + '" fill="url(#titreOr)" stroke="#3a2406" stroke-width="1.6" paint-order="stroke">' + tspans + '</text></g>';
  /* le trait d'or sous le titre, qui s'étire */
  var kl = U.lisse(U.clamp((a - .6) / .8, 0, 1)), l = 300 * kl;
  s += '<path d="M' + r(W / 2 - l) + ' ' + r(y + taille * .34) + ' H ' + r(W / 2 + l) + '" stroke="#e8b84a" stroke-width="2.4" opacity="' + r(kl * .9) + '"/><circle cx="' + W / 2 + '" cy="' + r(y + taille * .34) + '" r="' + r(5 * kl) + '" fill="#ffd24a"/>';
  return s;
};
})();
