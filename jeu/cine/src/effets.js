/* effets.js — ce qui est dessiné par-dessus le décor, à sa place projetée : les torches (leur flamme qui danse, leur halo),
   la poussière qui flotte dans la lumière, les braises, la brume au sol, les éclairs. Tout est calculé pour un temps t. */
(function(){
'use strict';
var U = window.CU, FX = window.CFX = {};
var O = '#120a06';

/* la lueur d'une torche (0,7 à 1,1) : elle respire et frémit ; la même partout pour une torche donnée */
FX.lueur = function(t, k){ return .9 + .1 * U.fbm(t * 2.2, k * 5 + 1, 3) + .05 * U.bruit(t * 11, k * 9 + 2); };

/* une torche : la potence de fer, le manche, les chiffons, la flamme ; (x, y, z) = le haut du manche */
FX.torche = function(x, y, z, t, k, defs){
  var p = CAM.projeter(x, y, z), s = p.s, f = CAM.flou(p.d), id = 'tf' + k;
  if(p.x < -200 || p.x > CAM.W + 200) return {corps:'', lum:''};
  var li = FX.lueur(t, k) * (FX.flare || 1);
  var corps = FX.flouDebut(f) + '<g transform="translate(' + U.r(p.x) + ' ' + U.r(p.y) + ') scale(' + U.r(s) + ')">' +
    /* la potence */
    '<path d="M-6 10 L -6 46 L 6 46 L 6 10 Z M-14 42 L 14 42 L 14 52 L -14 52 Z M0 46 L 0 70" fill="#2a2420" stroke="' + O + '" stroke-width="3"/>' +
    '<path d="M-12 56 L 12 56 L 10 64 L -10 64 Z" fill="#3a322c" stroke="' + O + '" stroke-width="3"/>' +
    /* le manche et ses chiffons */
    '<path d="M-7 -2 L 7 -2 L 5 66 L -5 66 Z" fill="#5a3a20" stroke="' + O + '" stroke-width="3"/>' +
    '<path d="M-12 -4 C -14 -14 14 -14 12 -4 L 10 12 C 4 16 -4 16 -10 12 Z" fill="#3a2a1a" stroke="' + O + '" stroke-width="3"/>' +
    '<path d="M-10 2 C -2 6 4 6 10 0 M-10 8 C -2 12 4 12 10 6" fill="none" stroke="#6a4a2a" stroke-width="2"/>';
  /* la flamme : trois langues qui ondulent (le bruit les déforme) */
  var fl = '';
  [[1, '#ff7a1a', 1], [.72, '#ffb84a', .95], [.45, '#fff2c0', .95]].forEach(function(c, j){
    var h = (62 + 10 * U.fbm(t * 3 + j, k * 3 + j, 2)) * c[0] * (.92 + li * .1), w = 19 * c[0];
    var b1 = U.fbm(t * 4.2, k * 7 + j, 2) * 12 * c[0], b2 = U.fbm(t * 5.1 + 3, k * 7 + j + 1, 2) * 9 * c[0];
    fl += '<path d="M' + U.r(-w) + ' -6 C ' + U.r(-w * 1.1) + ' ' + U.r(-h * .35) + ' ' + U.r(b2 - w * .4) + ' ' + U.r(-h * .62) + ' ' + U.r(b1) + ' ' + U.r(-h) +
      ' C ' + U.r(b2 + w * .5) + ' ' + U.r(-h * .6) + ' ' + U.r(w * 1.1) + ' ' + U.r(-h * .32) + ' ' + U.r(w) + ' -6 C ' + U.r(w * .5) + ' 4 ' + U.r(-w * .5) + ' 4 ' + U.r(-w) + ' -6 Z" fill="' + c[1] + '" opacity="' + c[2] + '"/>';
  });
  corps += '<g transform="translate(0 -8)">' + fl + '</g></g>' + FX.flouFin(f);
  /* le halo (dans la couche des lumières, qui s'ajoute à l'image) */
  var r = 300 * s * li, r2 = 90 * s * li;
  var lum = '<circle cx="' + U.r(p.x) + '" cy="' + U.r(p.y - 40 * s) + '" r="' + U.r(r) + '" fill="url(#halo)" opacity="' + U.r(.55 * li) + '"/>' +
    '<circle cx="' + U.r(p.x) + '" cy="' + U.r(p.y - 40 * s) + '" r="' + U.r(r2) + '" fill="url(#haloFort)" opacity="' + U.r(.8 * li) + '"/>';
  /* les braises qui montent */
  var R = U.hasard(1000 + k * 77);
  for(var b = 0; b < 7; b++){
    var per = 1.6 + R() * 1.4, ph = R() * per, a = ((t + ph) % per) / per;
    var bx = x + (R() - .5) * 20 + U.bruit(t * 1.3 + b, k + b) * 26 * a, by = y - 60 - a * (180 + R() * 120), q = CAM.projeter(bx, by, z + 6);
    lum += '<circle cx="' + U.r(q.x) + '" cy="' + U.r(q.y) + '" r="' + U.r(Math.max(.6, 2.2 * q.s * (1 - a))) + '" fill="#ffb060" opacity="' + U.r((1 - a) * .9) + '"/>';
  }
  return {corps:corps, lum:lum, p:p};
};

/* la poussière qui flotte dans l'air (elle brille près des torches) : un nuage de points dans une boîte du monde */
FX.poussiere = function(t, boite, n, graine){
  var R = U.hasard(graine || 3), s = '';
  for(var i = 0; i < n; i++){
    var x0 = U.lerp(boite[0], boite[3], R()), y0 = U.lerp(boite[1], boite[4], R()), z0 = U.lerp(boite[2], boite[5], R());
    var x = x0 + U.bruit(t * .21 + i, i) * 40, y = y0 + U.bruit(t * .17 + i * 2, i + 50) * 30 + ((t * 6 + R() * 400) % 400) - 200, z = z0 + U.bruit(t * .19 + i * 3, i + 90) * 30;
    var p = CAM.projeter(x, y, z);
    if(p.d < 60 || p.x < -20 || p.x > CAM.W + 20 || p.y < -20 || p.y > CAM.H + 20) continue;
    var f = CAM.flou(p.d), r = Math.max(.5, 1.6 * p.s) + f * .45, op = .12 + .5 * R();
    /* plus brillante près d'une torche */
    var pres = 0;
    PLATEAU.TORCHES.forEach(function(tq){ var dd = Math.hypot(tq[0] - x, tq[1] - y, tq[2] - z); pres = Math.max(pres, 1 - dd / 700); });
    op *= .35 + pres * 1.4; if(f > 6) op *= 6 / f;
    s += '<circle cx="' + U.r(p.x) + '" cy="' + U.r(p.y) + '" r="' + U.r(r) + '" fill="#ffd9a0" opacity="' + U.r(U.clamp(op, 0, .9)) + '"/>';
  }
  return s;
};

/* une bouffée de poussière au sol (un genou qui tombe, un pied) : des petits nuages qui s'écartent et retombent */
FX.bouffee = function(t, t0, x, z, n, graine, force){
  var a = t - t0; if(a < 0 || a > 1.6) return '';
  var R = U.hasard(graine || 9), s = '', F = force || 1;
  for(var i = 0; i < (n || 14) * 2; i++){
    var ang = R() * Math.PI, v = (120 + R() * 220) * F, d = 30 + R() * 50 + v * (1 - Math.exp(-a * 3)) / 3;
    var px = x + Math.cos(ang) * d * (R() < .5 ? -1 : 1), pz = z + Math.sin(ang) * d * .6, py = -10 - (40 + R() * 80) * F * (1 - Math.exp(-a * 4)) + a * a * 20;
    var p = CAM.projeter(px, py, pz), r = (10 + R() * 22) * F * (1 + a * 1.8) * p.s, op = Math.pow(1 - a / 1.6, 1.5) * (.06 + R() * .1) * U.clamp(a * 8, 0, 1);
    s += '<ellipse cx="' + U.r(p.x) + '" cy="' + U.r(p.y) + '" rx="' + U.r(r * 1.4) + '" ry="' + U.r(r) + '" fill="#8a7862" opacity="' + U.r(op) + '" filter="url(#fl' + Math.min(90, Math.max(6, Math.round(r * 1.1))) + ')"/>';
  }
  return s;
};
/* des cailloux qui sautent (une onde de choc) */
FX.cailloux = function(t, t0, x, z, n, graine){
  var a = t - t0; if(a < 0 || a > 1.4) return '';
  var R = U.hasard(graine || 21), s = '';
  for(var i = 0; i < (n || 16); i++){
    var ang = R() * Math.PI * 2, d = 80 + R() * 420, h = 40 + R() * 90, dur = .5 + R() * .4;
    var k = U.clamp(a / dur, 0, 1), px = x + Math.cos(ang) * d * (.6 + k * .3), pz = z + Math.sin(ang) * d * .5;
    var py = -4 * h * k * (1 - k) - 3, p = CAM.projeter(px, py, pz);
    if(a > dur + .4) continue;
    s += '<path d="M' + U.r(p.x - 4 * p.s) + ' ' + U.r(p.y) + ' l ' + U.r(3 * p.s) + ' ' + U.r(-5 * p.s) + ' l ' + U.r(6 * p.s) + ' ' + U.r(1 * p.s) + ' l ' + U.r(-1 * p.s) + ' ' + U.r(5 * p.s) + ' Z" fill="#6a5a48" stroke="#1a120a" stroke-width="' + U.r(1.2 * p.s) + '"/>';
  }
  return s;
};
/* une onde de choc au sol : un anneau qui s'élargit (un trait de lumière et de poussière) */
FX.onde = function(t, t0, x, z, rmax, coul){
  var a = t - t0; if(a < 0 || a > .9) return '';
  var k = U.COURBES.o(a / .9), r = (rmax || 700) * k, s = '';
  var c = CAM.projeter(x, 0, z), ex = CAM.projeter(x + r, 0, z), ez1 = CAM.projeter(x, 0, z + r), ez2 = CAM.projeter(x, 0, z - r);
  var rx = Math.abs(ex.x - c.x), ry = Math.abs(ez1.y - ez2.y) / 2;
  s += '<ellipse cx="' + U.r(c.x) + '" cy="' + U.r((ez1.y + ez2.y) / 2) + '" rx="' + U.r(rx) + '" ry="' + U.r(ry) + '" fill="none" stroke="' + (coul || '#ffd9a0') + '" stroke-width="' + U.r(10 * c.s * (1 - k)) + '" opacity="' + U.r(.7 * (1 - k)) + '" filter="url(#fl6)"/>';
  s += '<ellipse cx="' + U.r(c.x) + '" cy="' + U.r((ez1.y + ez2.y) / 2) + '" rx="' + U.r(rx * .92) + '" ry="' + U.r(ry * .92) + '" fill="none" stroke="' + (coul ? coul : '#a89070') + '" stroke-width="' + U.r(30 * c.s * (1 - k)) + '" opacity="' + U.r((coul ? .3 : .4) * (1 - k)) + '" filter="url(#fl12)"/>';
  return s;
};
/* une onde dans l'air (à l'écran, autour d'un point : le hurlement) */
FX.ondeAir = function(t, t0, x, y, rmax, coul){
  var a = t - t0; if(a < 0 || a > .7) return '';
  var k = U.COURBES.o(a / .7), r = rmax * (.15 + .85 * k);
  return '<circle cx="' + U.r(x) + '" cy="' + U.r(y) + '" r="' + U.r(r) + '" fill="none" stroke="' + coul + '" stroke-width="' + U.r(Math.max(1, rmax * .05 * (1 - k))) + '" opacity="' + U.r(.5 * (1 - k)) + '" filter="url(#fl4)"/>';
};
/* de la poussière et des petits gravats qui tombent du plafond (la salle tremble) */
FX.plafond = function(t, t0, t1, n, graine, boite){
  if(t < t0) return '';
  var R = U.hasard(graine || 33), s = '', b = boite || [-700, -900, 700, 500];
  for(var i = 0; i < (n || 40); i++){
    var depart = t0 + R() * (t1 - t0), a = t - depart, x = U.lerp(b[0], b[2], R()), z = U.lerp(b[1], b[3], R()), gros = R() < .2;
    if(a < 0) continue;
    var y = -1100 + 0.5 * 1800 * a * a; if(y > 0) continue;
    var p = CAM.projeter(x + U.bruit(a * 2 + i, i) * 10, y, z), f = CAM.flou(p.d);
    s += gros ? '<rect x="' + U.r(p.x) + '" y="' + U.r(p.y) + '" width="' + U.r(Math.max(1.5, 5 * p.s)) + '" height="' + U.r(Math.max(1.5, 5 * p.s)) + '" fill="#5a4a3a" transform="rotate(' + U.r(a * 300) + ' ' + U.r(p.x) + ' ' + U.r(p.y) + ')"/>'
      : '<circle cx="' + U.r(p.x) + '" cy="' + U.r(p.y) + '" r="' + U.r(Math.max(.8, 1.8 * p.s) + f * .4) + '" fill="#c8b090" opacity="' + U.r(f > 4 ? .25 : .5) + '"/>';
  }
  return s;
};

/* de la vapeur qui monte d'un corps (la potion qui s'en va) : des volutes claires, floues (dans le repère du personnage) */
FX.vapeur = function(t, pts, force, graine){
  if(!(force > 0)) return '';
  var R = U.hasard(graine || 44), s = '';
  for(var i = 0; i < 26; i++){
    var base = pts[Math.floor(R() * pts.length)], per = 1.6 + R() * 1.2, a = ((t + R() * per) % per) / per;
    var x = base[0] + (R() - .5) * 60 + U.bruit(t * .8 + i, i) * 30 * a, y = base[1] - a * (160 + R() * 120);
    var r = 10 + a * 34, op = Math.sin(a * Math.PI) * .22 * force;
    s += '<circle cx="' + U.r(x) + '" cy="' + U.r(y) + '" r="' + U.r(r) + '" fill="#f4eee6" opacity="' + U.r(op) + '" filter="url(#fl' + Math.round(10 + a * 16) + ')"/>';
  }
  return s;
};

/* les définitions communes (dégradés des halos, flous tout prêts) */
FX.defs = function(){
  var d = '<radialGradient id="halo"><stop offset="0" stop-color="#ffb060" stop-opacity=".55"/><stop offset=".4" stop-color="#d06a20" stop-opacity=".18"/><stop offset="1" stop-color="#802a00" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="haloFort"><stop offset="0" stop-color="#fff0c0" stop-opacity=".9"/><stop offset=".5" stop-color="#ffa040" stop-opacity=".3"/><stop offset="1" stop-color="#ff8020" stop-opacity="0"/></radialGradient>';
  for(var k = 1; k <= 90; k++) d += '<filter id="fl' + k + '" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="' + (k * .5) + '"/></filter>';
  return d;
};
/* un groupe flouté de f pixels d'écran (à mettre AUTOUR d'un groupe déjà placé : le flou est compté sur l'écran) */
FX.flouDebut = function(f){ var k = Math.round(f * 2); return k >= 1 ? '<g filter="url(#fl' + Math.min(90, k) + ')">' : '<g>'; };
FX.flouFin = function(){ return '</g>'; };
})();
