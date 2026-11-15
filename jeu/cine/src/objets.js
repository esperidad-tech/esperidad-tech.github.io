/* objets.js — ce que Léo tient ou fait voler dans les cinématiques : la potion de force volée à Iris (une fiole qui rougeoie),
   son bouchon, ses éclats ; les veines qui s'allument quand la potion agit ; la vapeur quand elle s'en va. */
(function(){
'use strict';
var U = window.CU, O = '#170d07';
var OB = window.ObjetsCine = {};

/* la fiole (repère : son milieu ; debout = le goulot en haut) ; lueur 0 → 1 ; bouchon : true | false ; vide 0 → 1 */
OB.fiole = function(lueur, bouchon, vide){
  var l = lueur == null ? 1 : lueur, v = vide || 0, niv = U.lerp(-8, 26, v);
  return '<g>' +
    '<path d="M-6 -30 L -6 -18 C -18 -14 -22 -2 -22 10 C -22 24 -12 30 0 30 C 12 30 22 24 22 10 C 22 -2 18 -14 6 -18 L 6 -30 Z" fill="#3a1a12" opacity=".35"/>' +
    '<clipPath id="fio' + Math.round(l * 100) + '"><path d="M-6 -30 L -6 -18 C -18 -14 -22 -2 -22 10 C -22 24 -12 30 0 30 C 12 30 22 24 22 10 C 22 -2 18 -14 6 -18 L 6 -30 Z"/></clipPath>' +
    '<g clip-path="url(#fio' + Math.round(l * 100) + ')"><rect x="-24" y="' + U.r(niv) + '" width="48" height="60" fill="url(#potionForce)"/>' +
    '<circle cx="-6" cy="' + U.r(niv + 14) + '" r="3" fill="#f4ffdc" opacity=".8"/><circle cx="7" cy="' + U.r(niv + 22) + '" r="2" fill="#f4ffdc" opacity=".7"/></g>' +
    '<path d="M-6 -30 L -6 -18 C -18 -14 -22 -2 -22 10 C -22 24 -12 30 0 30 C 12 30 22 24 22 10 C 22 -2 18 -14 6 -18 L 6 -30" fill="none" stroke="' + O + '" stroke-width="2.4" stroke-linejoin="round"/>' +
    '<path d="M-14 -4 C -16 4 -16 12 -12 18" fill="none" stroke="#ffffff" stroke-width="2.4" opacity=".6" stroke-linecap="round"/>' +
    '<rect x="-8" y="-33" width="16" height="5" rx="2" fill="#c9a060" stroke="' + O + '" stroke-width="1.8"/>' +
    (bouchon ? '<path d="M-6 -33 L -5 -44 L 5 -44 L 6 -33 Z" fill="#a8743a" stroke="' + O + '" stroke-width="1.8"/>' : '') +
    /* une petite étiquette : le signe d'Iris (une fleur) */
    '<circle cx="0" cy="8" r="7" fill="#f4e6c8" stroke="' + O + '" stroke-width="1.2" opacity=".9"/><path d="M0 3 L 0 13 M-5 8 L 5 8 M-3.5 4.5 L 3.5 11.5 M3.5 4.5 L -3.5 11.5" stroke="#8a2a3a" stroke-width="1.2"/>' +
    '</g>';
};
/* la même fiole, penchée de « ang » degrés, dont le liquide reste en bas POUR DE VRAI (il coule vers le goulot quand il boit) :
   le niveau se calcule sur des points tirés dans la fiole, tournés, puis triés de bas en haut */
var PTS = (function(){
  var l = [];
  for(var y = -30; y <= 30; y += 1.5) for(var x = -22; x <= 22; x += 1.5){
    if((Math.abs(x) <= 6 && y <= -16) || ((x / 22) * (x / 22) + ((y - 9) / 21) * ((y - 9) / 21) <= 1)) l.push([x, y]);
  }
  return l;
})();
var PLEIN = PTS.filter(function(p){ return p[1] >= -8; }).length / PTS.length;
OB.fioleMonde = function(lueur, bouchon, vide, ang){
  var l = lueur == null ? 1 : lueur, v = U.clamp(vide || 0, 0, 1), a = (ang || 0) * Math.PI / 180, sa = Math.sin(a), ca = Math.cos(a);
  var ys = PTS.map(function(p){ return p[0] * sa + p[1] * ca; }).sort(function(m, n){ return n - m; });
  var n = Math.round(ys.length * PLEIN * (1 - v)), h = n > 0 ? ys[Math.min(ys.length - 1, n - 1)] : 99;
  var id = 'fioM' + Math.round(l * 100) + '_' + Math.round(v * 100);
  var forme = 'M-6 -30 L -6 -18 C -18 -14 -22 -2 -22 10 C -22 24 -12 30 0 30 C 12 30 22 24 22 10 C 22 -2 18 -14 6 -18 L 6 -30 Z';
  return '<g>' +
    '<path d="' + forme + '" fill="#3a1a12" opacity=".35"/>' +
    '<clipPath id="' + id + '"><path d="' + forme + '"/></clipPath>' +
    (n > 0 ? '<g clip-path="url(#' + id + ')"><g transform="rotate(' + U.r(-(ang || 0)) + ')"><rect x="-60" y="' + U.r(h) + '" width="120" height="120" fill="url(#potionForce)"/>' +
      '<path d="M-60 ' + U.r(h) + ' L 60 ' + U.r(h) + '" stroke="#f4ffdc" stroke-width="2" opacity=".8"/></g></g>' : '') +
    '<path d="' + forme.replace(' Z', '') + '" fill="none" stroke="' + O + '" stroke-width="2.4" stroke-linejoin="round"/>' +
    '<path d="M-14 -4 C -16 4 -16 12 -12 18" fill="none" stroke="#ffffff" stroke-width="2.4" opacity=".6" stroke-linecap="round"/>' +
    '<rect x="-8" y="-33" width="16" height="5" rx="2" fill="#c9a060" stroke="' + O + '" stroke-width="1.8"/>' +
    (bouchon ? '<path d="M-6 -33 L -5 -44 L 5 -44 L 6 -33 Z" fill="#a8743a" stroke="' + O + '" stroke-width="1.8"/>' : '') +
    '<circle cx="0" cy="8" r="7" fill="#f4e6c8" stroke="' + O + '" stroke-width="1.2" opacity=".9"/><path d="M0 3 L 0 13 M-5 8 L 5 8 M-3.5 4.5 L 3.5 11.5 M3.5 4.5 L -3.5 11.5" stroke="#8a2a3a" stroke-width="1.2"/>' +
    '</g>';
};
OB.bouchon = function(){ return '<path d="M-5 -6 L -4 6 L 4 6 L 5 -6 Z" fill="#a8743a" stroke="' + O + '" stroke-width="1.8"/>'; };
/* les doigts repliés par-dessus ce qu'il tient (repère : la main) */
OB.doigts = function(){
  return '<path d="M-17 6 C -19 14 -18 24 -14 30 L 14 30 C 18 24 19 14 17 6 C 8 10 -8 10 -17 6 Z" fill="url(#lfPeauB)" stroke="' + O + '" stroke-width="2"/>' +
    '<path d="M-8 9 L -8 29 M0 10 L 0 30 M8 9 L 8 29" stroke="#8a4428" stroke-width="1.4"/>';
};
/* en gros plan : le dos de la main (derrière la fiole) et quatre doigts repliés par-dessus, un par un (repère : le poignet ;
   l'os va vers les doigts ; la fiole est en travers, sous les doigts) */
OB.dosMain = function(){
  return '<path d="M-16 -4 C -20 6 -21 16 -19 26 C -14 30 14 30 19 26 C 21 16 20 6 16 -4 Z" fill="url(#lfPeauB)" stroke="' + O + '" stroke-width="2.2"/>' +
    '<path d="M-6 2 L -7 18 M3 2 L 3 18" stroke="#c48a6a" stroke-width="1.4" opacity=".5"/>';
};
OB.doigtsGP = function(){
  var s = '';
  [-10.5, -3.5, 3.5, 10.5].forEach(function(x, i){
    var y0 = 9 - Math.abs(i - 1.5) * 1.2, y1 = 31 - Math.abs(i - 1.5) * 2.4;
    s += '<rect x="' + U.r(x - 3.6) + '" y="' + U.r(y0) + '" width="7.2" height="' + U.r(y1 - y0) + '" rx="3.6" fill="url(#lfPeauB)" stroke="' + O + '" stroke-width="1.7"/>' +
      '<ellipse cx="' + U.r(x - .6) + '" cy="' + U.r(y0 + 4) + '" rx="2" ry="1.6" fill="#ffe6c8" opacity=".7"/>' +
      '<path d="M' + U.r(x - 3) + ' ' + U.r(y1 - 6) + ' L ' + U.r(x + 3) + ' ' + U.r(y1 - 6) + '" stroke="#8a4428" stroke-width="1" opacity=".55"/>';
  });
  /* le pouce, de l'autre côté, qui passe devant le goulot */
  s += '<path d="M14 2 C 20 4 22 12 18 18 C 16 21 12 20 12 16 C 12 12 13 8 12 5 Z" fill="url(#lfPeauB)" stroke="' + O + '" stroke-width="1.7"/>';
  return s;
};
/* les veines qui s'allument (repère : le buste) */
OB.veinesBuste = function(k){
  if(!(k > 0)) return '';
  return '<g opacity="' + U.r(U.clamp(k, 0, 1)) + '" filter="url(#lueurVeine)"><path d="M-20 -150 C -30 -130 -40 -120 -60 -110 M-30 -132 C -34 -116 -30 -100 -36 -86 M20 -150 C 34 -132 46 -120 64 -114 M34 -128 C 40 -112 36 -96 42 -82 M-10 -60 C -16 -46 -12 -30 -20 -16 M14 -66 C 20 -50 16 -34 24 -18 M0 -168 C 2 -150 -2 -130 0 -100" fill="none" stroke="#a6ff6a" stroke-width="3.2" stroke-linecap="round"/></g>';
};
OB.veinesBras = function(k){
  if(!(k > 0)) return '';
  return '<g opacity="' + U.r(U.clamp(k, 0, 1)) + '" filter="url(#lueurVeine)"><path d="M6 10 C 12 30 4 50 10 72 C 12 84 8 94 10 100 M-6 40 C -10 56 -6 70 -12 88" fill="none" stroke="#a6ff6a" stroke-width="3" stroke-linecap="round"/></g>';
};
OB.defs = function(){
  return '<linearGradient id="potionForce" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4ffdc"/><stop offset=".35" stop-color="#a6ff6a"/><stop offset="1" stop-color="#1f8a2a"/></linearGradient>' +
    '<radialGradient id="lueurPotion"><stop offset="0" stop-color="#f4ffdc" stop-opacity=".95"/><stop offset=".35" stop-color="#8dff5a" stop-opacity=".45"/><stop offset="1" stop-color="#3fd13a" stop-opacity="0"/></radialGradient>' +
    '<filter id="lueurVeine" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur in="SourceGraphic" stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
};
/* une lueur ronde (dans la couche des lumières) */
OB.lueur = function(x, y, r, op, grad){ return '<circle cx="' + U.r(x) + '" cy="' + U.r(y) + '" r="' + U.r(r) + '" fill="url(#' + (grad || 'lueurPotion') + ')" opacity="' + U.r(U.clamp(op, 0, 1)) + '"/>'; };
})();
