/* accessoires.js — ce qui encombre le repaire de Léo (des sacs de farine, une vieille meule, des caisses, un tonneau, des chaînes),
   et ses outils de meunier quand ils tombent (le fléau, le marteau à piquer les meules, le crochet). Dessinés de face, posés à
   leur place dans le monde (CAM.projeter), floutés selon la profondeur. */
(function(){
'use strict';
var U = window.CU, FX = window.CFX, O = '#170d07';
var AC = window.Accessoires = {};

var DESSINS = {
  sacs: function(){
    var s = '', sac = function(x, y, w, h, r){ return '<g transform="translate(' + x + ' ' + y + ') rotate(' + r + ')"><path d="M' + (-w / 2) + ' 0 C ' + (-w / 2 - 6) + ' ' + (-h * .6) + ' ' + (-w / 2 + 4) + ' ' + (-h) + ' ' + (-w * .2) + ' ' + (-h - 8) + ' L ' + (w * .2) + ' ' + (-h - 8) + ' C ' + (w / 2 - 4) + ' ' + (-h) + ' ' + (w / 2 + 6) + ' ' + (-h * .6) + ' ' + (w / 2) + ' 0 Z" fill="#cdbd9c" stroke="' + O + '" stroke-width="3"/>' +
      '<path d="M' + (-w * .22) + ' ' + (-h - 6) + ' C ' + (-w * .1) + ' ' + (-h - 22) + ' ' + (w * .1) + ' ' + (-h - 22) + ' ' + (w * .22) + ' ' + (-h - 6) + '" fill="#bfae8a" stroke="' + O + '" stroke-width="3"/>' +
      '<path d="M' + (-w * .24) + ' ' + (-h + 2) + ' L ' + (w * .24) + ' ' + (-h + 2) + '" stroke="#6a4a2a" stroke-width="4"/>' +
      '<path d="M' + (-w * .3) + ' ' + (-h * .5) + ' C 0 ' + (-h * .45) + ' 0 ' + (-h * .45) + ' ' + (w * .3) + ' ' + (-h * .5) + '" fill="none" stroke="#8a7a5a" stroke-width="2"/>' +
      '<text x="0" y="' + (-h * .3) + '" font-family="Georgia" font-size="' + (w * .22) + '" text-anchor="middle" fill="#7a5a3a" opacity=".8">F</text></g>'; };
    s += sac(-70, 0, 110, 130, -4) + sac(50, 0, 104, 120, 5) + sac(-8, -110, 100, 116, 2);
    s += '<ellipse cx="90" cy="2" rx="70" ry="10" fill="#e8dcc0" opacity=".5"/>';
    return s;
  },
  meule: function(){
    return '<g transform="rotate(-6)"><ellipse cx="0" cy="-150" rx="152" ry="150" fill="#8a8478" stroke="' + O + '" stroke-width="4"/>' +
      '<ellipse cx="-8" cy="-156" rx="132" ry="128" fill="none" stroke="#6a645a" stroke-width="3"/>' +
      [0, 30, 60, 90, 120, 150].map(function(a){ var r = a * Math.PI / 180; return '<path d="M' + U.r(Math.cos(r) * 26) + ' ' + U.r(-150 + Math.sin(r) * 26) + ' L ' + U.r(Math.cos(r) * 140) + ' ' + U.r(-150 + Math.sin(r) * 138) + ' M' + U.r(-Math.cos(r) * 26) + ' ' + U.r(-150 - Math.sin(r) * 26) + ' L ' + U.r(-Math.cos(r) * 140) + ' ' + U.r(-150 - Math.sin(r) * 138) + '" stroke="#5a554c" stroke-width="3"/>'; }).join('') +
      '<rect x="-22" y="-172" width="44" height="44" fill="#1a1612" stroke="' + O + '" stroke-width="3"/>' +
      '<path d="M-110 -240 C -70 -280 40 -290 100 -250" fill="none" stroke="#b0aa9c" stroke-width="6" opacity=".5"/></g>';
  },
  caisses: function(){
    var c = function(x, y, w, h){ return '<g transform="translate(' + x + ' ' + y + ')"><rect x="' + (-w / 2) + '" y="' + (-h) + '" width="' + w + '" height="' + h + '" fill="#7a5532" stroke="' + O + '" stroke-width="3"/>' +
      '<path d="M' + (-w / 2 + 10) + ' ' + (-h + 10) + ' L ' + (w / 2 - 10) + ' -10 M' + (w / 2 - 10) + ' ' + (-h + 10) + ' L ' + (-w / 2 + 10) + ' -10" stroke="#5a3a1e" stroke-width="7"/>' +
      '<rect x="' + (-w / 2 + 4) + '" y="' + (-h + 4) + '" width="' + (w - 8) + '" height="' + (h - 8) + '" fill="none" stroke="#9a6e42" stroke-width="2"/></g>'; };
    return c(0, 0, 150, 130) + c(14, -130, 120, 104);
  },
  tonneau: function(){
    return '<path d="M-62 0 C -76 -50 -76 -130 -62 -180 L 62 -180 C 76 -130 76 -50 62 0 Z" fill="#6a4628" stroke="' + O + '" stroke-width="3"/>' +
      '<path d="M-70 -40 L 70 -40 M-72 -140 L 72 -140" stroke="#3a3a40" stroke-width="10"/><path d="M-30 -178 C -36 -120 -36 -60 -30 -2 M10 -180 C 12 -120 12 -60 10 0" stroke="#4a2e18" stroke-width="2"/>' +
      '<ellipse cx="0" cy="-180" rx="62" ry="12" fill="#5a3a20" stroke="' + O + '" stroke-width="3"/>';
  },
  chaines: function(){
    var s = '<rect x="-14" y="-12" width="28" height="22" rx="4" fill="#3a3a40" stroke="' + O + '" stroke-width="3"/>';
    [[-6, 1], [6, -1]].forEach(function(c){
      for(var k = 0; k < 9; k++){ var y = 10 + k * 26; s += '<ellipse cx="' + (c[0] + Math.sin(k * .7) * 3 * c[1]) + '" cy="' + y + '" rx="' + (k % 2 ? 4 : 8) + '" ry="14" fill="none" stroke="#4a4a52" stroke-width="5"/>'; }
    });
    return s;
  }
};
/* (x, y, z) = le bas du milieu de l'objet ; e = l'échelle */
var POSES = [
  {d:'sacs', x:-720, z:-800}, {d:'caisses', x:-1120, z:-760}, {d:'meule', x:700, z:-840}, {d:'tonneau', x:330, z:-790},
  {d:'caisses', x:1150, z:-800, e:.9}, {d:'chaines', x:-260, y:-900, z:-880}, {d:'chaines', x:170, y:-960, z:-880, e:.8}
];
AC.dessin = function(t, E){
  var s = '';
  POSES.forEach(function(a){
    var p = CAM.projeter(a.x, a.y || 0, a.z);
    if(p.x < -500 || p.x > CAM.W + 500) return;
    var sol = a.y ? '' : '<ellipse cx="0" cy="0" rx="190" ry="16" fill="#000" opacity=".55"/>';
    s += FX.flouDebut(CAM.flou(p.d)) + '<g filter="url(#penombre)"><g transform="translate(' + U.r(p.x) + ' ' + U.r(p.y) + ') scale(' + U.r(p.s * (a.e || 1)) + ')">' + sol + DESSINS[a.d]() + '</g></g>' + FX.flouFin();
  });
  return s;
};

/* LES OUTILS DE LÉO (repère : le milieu de l'outil ; l'outil couché le long de x) */
var OUTILS = {
  marteau: function(){
    return '<rect x="-70" y="-6" width="120" height="12" rx="5" fill="#8a5a2e" stroke="' + O + '" stroke-width="3"/>' +
      '<path d="M44 -34 L 62 -34 L 66 -4 L 62 30 L 44 30 L 40 -4 Z" fill="#9aa4b4" stroke="' + O + '" stroke-width="3"/><path d="M52 -44 L 54 -34 M52 40 L 54 30" stroke="' + O + '" stroke-width="4"/>' +
      '<path d="M48 -30 L 50 24" stroke="#e8eef8" stroke-width="2"/>';
  },
  fleau: function(){
    return '<rect x="-80" y="-5" width="96" height="10" rx="4" fill="#9a6a3a" stroke="' + O + '" stroke-width="3"/>' +
      '<path d="M16 0 C 22 -6 28 -6 32 0" fill="none" stroke="#3a2a1a" stroke-width="5"/>' +
      '<g transform="translate(36 0) rotate(28)"><rect x="0" y="-6" width="64" height="12" rx="5" fill="#7a4e26" stroke="' + O + '" stroke-width="3"/></g>';
  },
  crochet: function(){
    return '<rect x="-60" y="-5" width="86" height="10" rx="4" fill="#8a5a2e" stroke="' + O + '" stroke-width="3"/>' +
      '<path d="M24 0 L 58 0 C 74 0 80 18 70 28 C 62 36 50 30 52 20" fill="none" stroke="' + O + '" stroke-width="9" stroke-linecap="round"/>' +
      '<path d="M24 0 L 58 0 C 74 0 80 18 70 28 C 62 36 50 30 52 20" fill="none" stroke="#a8b0bc" stroke-width="5" stroke-linecap="round"/>';
  }
};
/* un outil qui tombe : de (x0, y0) à (x1, z1) au sol ; il tourne en tombant, rebondit, et se couche (vu d'en face, il s'aplatit) */
AC.outil = function(nom, t, o){
  var k = (t - o.t0) / o.duree, x, y, z, r, aplat;
  if(k < 0){ return ''; }
  if(k < 1){
    var kk = k * k;
    x = U.lerp(o.de[0], o.vers[0], k); z = U.lerp(o.de[2], o.vers[2], k); y = U.lerp(o.de[1], 0, kk) - 10;
    r = U.lerp(o.r0 || 0, o.r1 || 200, k); aplat = 1;
  } else {
    var tb = t - o.t0 - o.duree;
    x = o.vers[0]; z = o.vers[2];
    var reb = tb < .3 ? Math.sin(tb / .3 * Math.PI) * 18 * (1 - tb / .3) : 0;
    y = -10 - reb; r = (o.r1 || 200) + (tb < .3 ? Math.sin(tb * 30) * 6 * (1 - tb / .3) : 0);
    aplat = U.lerp(1, .4, U.clamp(tb / .2, 0, 1));
  }
  var p = CAM.projeter(x, y, z);
  return FX.flouDebut(CAM.flou(p.d)) + '<g filter="url(#penombre2)"><g transform="translate(' + U.r(p.x) + ' ' + U.r(p.y) + ') scale(' + U.r(p.s * 1.15) + ' ' + U.r(p.s * 1.15 * aplat) + ') rotate(' + U.r(r) + ')">' + OUTILS[nom]() + '</g></g>' + FX.flouFin();
};
AC.OUTILS = OUTILS;
/* la pénombre du fond : plus sombre, plus chaud (la lumière des torches) */
AC.defs = function(){ return '<filter id="penombre" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".52 .06 0 0 .01  .04 .4 0 0 0  0 .02 .3 0 0  0 0 0 1 0"/></filter>' +
  '<filter id="penombre2" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".8 .08 0 0 .02  .05 .65 0 0 0  0 .03 .5 0 0  0 0 0 1 0"/></filter>'; };
})();
