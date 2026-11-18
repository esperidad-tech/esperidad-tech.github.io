/* gens-debut.js — ce que les trois films de début d'enquête ont en plus (Bible §13.69) :
   la lettre que tient le maire, les villageois VUS DE DOS (ceux qui sont entre la caméra et la mairie), Moustache le chat gris
   d'Odette, les chapeaux lancés en l'air, la lettre en très gros plan dans les gants du maire, la Lanterne d'Or, le seau, le drap,
   et LA TÊTE DU MAIRE DESSINÉE DE TROIS QUARTS ET DE PROFIL (Romain, 18 novembre : « surtout pas de fausse 3D ; quand un personnage
   se retourne, je veux qu'il soit animé » : on change de dessin, on ne fait pas pivoter le pantin). */
(function(){
'use strict';
var U = window.CU, G = window.Gens, PT = window.Pantin, M = PT.M, O = '#1a0e08';
var GD = window.GensDebut = {};
function f(n){ return Math.round(n * 10) / 10; }
function vers(c, k){ var a = [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)], b = k > 0 ? [255, 255, 255] : [0, 0, 0], q = Math.abs(k); return '#' + a.map(function(v, i){ return ('0' + Math.round(U.lerp(v, b[i], q)).toString(16)).slice(-2); }).join(''); }
function lin(id, l, x1, y1, x2, y2){ return '<linearGradient id="' + id + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '">' + l.map(function(c, k){ return '<stop offset="' + (k / (l.length - 1)).toFixed(2) + '" stop-color="' + c + '"/>'; }).join('') + '</linearGradient>'; }
function rad(id, l, cx, cy, r){ return '<radialGradient id="' + id + '" cx="' + cx + '" cy="' + cy + '" r="' + r + '">' + l.map(function(c, k){ return '<stop offset="' + (k / (l.length - 1)).toFixed(2) + '" stop-color="' + c + '"/>'; }).join('') + '</radialGradient>'; }

G.DEFS_PLUS.push(function(){
  var d = '';
  d += lin('gdPapier', ['#fffaf0', '#f6ecd4', '#e4d4b0'], .2, 0, .8, 1) + lin('gdPapierX', ['#e8dcc0', '#fffaf0', '#f2e6cc', '#d8c8a4'], 0, 0, 1, 0);
  d += rad('gdChat', ['#c9cede', '#a2a8ba', '#7c8296', '#5a6074'], .42, .32, .8) + lin('gdChatX', ['#6a7084', '#a2a8ba', '#c2c7d6', '#a2a8ba', '#646a7e'], 0, 0, 1, 0);
  d += lin('gdOr', ['#fff6c0', '#f2c84a', '#c8922a', '#8a5e14'], .15, 0, .85, 1) + lin('gdOrX', ['#8a5e14', '#f2c84a', '#fff6c0', '#e0aa38', '#7a5210'], 0, 0, 1, 0);
  d += rad('gdVerre', ['#fffdf0', '#fff0a8', '#ffd24a', '#f0a81e'], .5, .55, .7);
  d += lin('gdSeau', ['#5a3a20', '#a87a48', '#d8aa70', '#a87a48', '#4a2e18'], 0, 0, 1, 0) + lin('gdDrap', ['#ffffff', '#f4f0e6', '#d8d2c2'], .3, 0, .7, 1);
  d += lin('gdVelours', ['#6a1420', '#a82a3a', '#c84a58', '#8a1c2a', '#5a0e18'], 0, 0, 1, 0);
  return d;
});

/* ---------------------------------------------------------------- LA LETTRE, dans une main (o.lettreA : son angle ; o.lettrePli : 0 → 1 pliée) */
G.OBJETS.lettre = {
  angle:function(o, c){ return (o.lettreA == null ? -8 : o.lettreA) * (c === 'G' ? -1 : 1); },
  dessin:function(o){
    var s = '<g transform="translate(0 -6)"><path d="M-40 -112 L 38 -116 L 42 -4 L -36 2 Z" fill="url(#gdPapier)" stroke="' + O + '" stroke-width="2.2" stroke-linejoin="round"/>';
    /* les lignes d'écriture (vues de loin : des traits), la signature, les plis */
    for(var i = 0; i < 9; i++) s += '<path d="M' + f(-30 + (i === 0 ? 0 : 0)) + ' ' + f(-98 + i * 9.5) + ' L ' + f(i === 8 ? 4 : 30 - (i % 3) * 5) + ' ' + f(-100 + i * 9.5) + '" stroke="#3a2a22" stroke-width="1.6" opacity=".7"/>';
    s += '<path d="M6 -10 q 6 -8 12 0 t 12 0" fill="none" stroke="#3a2a22" stroke-width="1.8"/><path d="M-38 -56 L 40 -60 M2 -114 L 4 0" stroke="#c8b88e" stroke-width="1.2" opacity=".8"/>';
    return s + '</g>';
  }
};

/* ---------------------------------------------------------------- UN VILLAGEOIS VU DE DOS (repère : les pieds en 0, 0 ; il fait environ 480 de haut)
   o = {habit, bas, peau, poil (des couleurs), l (la carrure : 60 à 82), coiffe ('toque' | 'paille' | 'bonnet' | 'plume' | 'facteur' | 'fichu' | 'chignon'),
        jupe (une femme), bG, bD (0 → 1 : le bras levé), t (penché), saut (il décolle), poing} */
GD.dos = function(o){
  o = o || {};
  var l = o.l || 68, habit = o.habit || '#6a5a4a', bas = o.bas || '#4a4038', peau = o.peau || '#dea575', poil = o.poil || '#6a3a1c', s = '', id = 'dos' + Math.round(l) + habit.slice(1);
  var hT = -250 - (o.saut || 0), cou = hT - 150;
  s += lin(id, [vers(habit, -.45), habit, vers(habit, .18), habit, vers(habit, -.5)], 0, 0, 1, 0);
  /* les jambes (ou la jupe) */
  if(o.jupe) s += '<path d="M' + (-l * .62) + ' ' + (hT - 6) + ' C ' + (-l * .9) + ' ' + (hT + 90) + ' ' + (-l * 1.12) + ' -80 ' + (-l * 1.18) + ' -18 C ' + (-l * .5) + ' -8 ' + (l * .5) + ' -8 ' + (l * 1.18) + ' -18 C ' + (l * 1.12) + ' -80 ' + (l * .9) + ' ' + (hT + 90) + ' ' + (l * .62) + ' ' + (hT - 6) + ' Z" fill="' + bas + '" stroke="' + O + '" stroke-width="2.6"/>' +
    '<path d="M' + (-l * .3) + ' ' + (hT + 30) + ' C ' + (-l * .4) + ' -120 ' + (-l * .5) + ' -60 ' + (-l * .52) + ' -14 M' + (l * .3) + ' ' + (hT + 30) + ' C ' + (l * .4) + ' -120 ' + (l * .5) + ' -60 ' + (l * .52) + ' -14" fill="none" stroke="' + vers(bas, -.4) + '" stroke-width="2" opacity=".7"/>';
  else [-1, 1].forEach(function(sg){ s += '<path d="M' + f(sg * 6) + ' ' + (hT + 20) + ' L ' + f(sg * l * .62) + ' ' + (hT + 20) + ' C ' + f(sg * l * .64) + ' -140 ' + f(sg * l * .56) + ' -60 ' + f(sg * l * .52) + ' -6 L ' + f(sg * 14) + ' -6 C ' + f(sg * 12) + ' -80 ' + f(sg * 8) + ' -150 ' + f(sg * 6) + ' ' + (hT + 20) + ' Z" fill="' + bas + '" stroke="' + O + '" stroke-width="2.6"/>' +
    '<path d="M' + f(sg * 12) + ' -44 L ' + f(sg * l * .55) + ' -44 L ' + f(sg * l * .58) + ' 4 L ' + f(sg * 10) + ' 4 Z" fill="#3a2a20" stroke="' + O + '" stroke-width="2.4"/>'; });
  /* les bras : baissés le long du corps, ou levés (le poing, ou la main ouverte) */
  function bras(sg, k){
    var ex = sg * (l + 2), ey = cou + 34, an = U.lerp(8, 168, k), c = Math.sin(U.rad(an)), sn = Math.cos(U.rad(an));
    /* (0 : le bras pend ; 180 : il est levé tout droit ; le coude se plie un peu vers l'intérieur à mi-chemin) */
    var cx = ex + sg * c * 92, cy = ey + sn * 92, an2 = an + Math.sin(k * Math.PI) * 30, c2 = Math.sin(U.rad(an2)), s2 = Math.cos(U.rad(an2));
    var mx = cx + sg * c2 * 84, my = cy + s2 * 84;
    return '<path d="M' + f(ex) + ' ' + f(ey) + ' L ' + f(cx) + ' ' + f(cy) + ' L ' + f(mx) + ' ' + f(my) + '" fill="none" stroke="' + O + '" stroke-width="46" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M' + f(ex) + ' ' + f(ey) + ' L ' + f(cx) + ' ' + f(cy) + ' L ' + f(mx) + ' ' + f(my) + '" fill="none" stroke="' + vers(habit, sg < 0 ? -.12 : -.26) + '" stroke-width="41" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle cx="' + f(mx + sg * c2 * 16) + '" cy="' + f(my + s2 * 16) + '" r="19" fill="' + peau + '" stroke="' + O + '" stroke-width="2.4"/>';
  }
  var kG = o.bG || 0, kD = o.bD || 0;
  if(kG <= .5) s += bras(-1, kG); if(kD <= .5) s += bras(1, kD);
  /* le dos : large aux épaules, la taille, les plis du vêtement ; un tablier noué, des bretelles */
  s += '<g transform="rotate(' + f(o.t || 0) + ' 0 ' + hT + ')"><path d="M' + (-l * .66) + ' ' + (hT + 24) + ' C ' + (-l * .78) + ' ' + (hT - 60) + ' ' + (-l - 6) + ' ' + (cou + 70) + ' ' + (-l - 4) + ' ' + (cou + 30) + ' C ' + (-l) + ' ' + (cou + 6) + ' ' + (-l * .5) + ' ' + (cou - 4) + ' -20 ' + (cou - 10) + ' L 20 ' + (cou - 10) + ' C ' + (l * .5) + ' ' + (cou - 4) + ' ' + l + ' ' + (cou + 6) + ' ' + (l + 4) + ' ' + (cou + 30) + ' C ' + (l + 6) + ' ' + (cou + 70) + ' ' + (l * .78) + ' ' + (hT - 60) + ' ' + (l * .66) + ' ' + (hT + 24) + ' Z" fill="url(#' + id + ')" stroke="' + O + '" stroke-width="2.6"/>' +
    '<path d="M0 ' + (cou + 6) + ' C -3 ' + (cou + 60) + ' 3 ' + (hT - 40) + ' 0 ' + (hT + 16) + ' M' + (-l * .5) + ' ' + (cou + 40) + ' C ' + (-l * .4) + ' ' + (cou + 70) + ' ' + (-l * .34) + ' ' + (hT - 50) + ' ' + (-l * .4) + ' ' + (hT - 10) + ' M' + (l * .5) + ' ' + (cou + 40) + ' C ' + (l * .4) + ' ' + (cou + 70) + ' ' + (l * .34) + ' ' + (hT - 50) + ' ' + (l * .4) + ' ' + (hT - 10) + '" fill="none" stroke="' + vers(habit, -.5) + '" stroke-width="2" opacity=".6"/>';
  if(o.tablier) s += '<path d="M' + (-l * .68) + ' ' + (hT - 2) + ' L ' + (l * .68) + ' ' + (hT - 2) + ' L ' + (l * .68) + ' ' + (hT + 12) + ' L ' + (-l * .68) + ' ' + (hT + 12) + ' Z" fill="#f4f0e4" stroke="' + O + '" stroke-width="2"/><path d="M-4 ' + (hT + 4) + ' C -30 ' + (hT - 16) + ' -34 ' + (hT + 30) + ' -6 ' + (hT + 8) + ' M4 ' + (hT + 4) + ' C 30 ' + (hT - 16) + ' 34 ' + (hT + 30) + ' 6 ' + (hT + 8) + ' M-3 ' + (hT + 8) + ' L -12 ' + (hT + 60) + ' M3 ' + (hT + 8) + ' L 14 ' + (hT + 56) + '" fill="none" stroke="#f4f0e4" stroke-width="7" stroke-linecap="round"/>' +
    '<path d="M-4 ' + (hT + 4) + ' C -30 ' + (hT - 16) + ' -34 ' + (hT + 30) + ' -6 ' + (hT + 8) + ' M4 ' + (hT + 4) + ' C 30 ' + (hT - 16) + ' 34 ' + (hT + 30) + ' 6 ' + (hT + 8) + '" fill="none" stroke="' + O + '" stroke-width="1.2" opacity=".5"/>';
  if(o.bretelles) s += '<path d="M' + (-l * .5) + ' ' + (hT + 10) + ' L 14 ' + (cou + 4) + ' M' + (l * .5) + ' ' + (hT + 10) + ' L -14 ' + (cou + 4) + '" stroke="' + o.bretelles + '" stroke-width="13"/><path d="M' + (-l * .5) + ' ' + (hT + 10) + ' L 14 ' + (cou + 4) + ' M' + (l * .5) + ' ' + (hT + 10) + ' L -14 ' + (cou + 4) + '" fill="none" stroke="' + O + '" stroke-width="1.2" opacity=".5"/>';
  /* le cou, la tête vue de derrière : les oreilles, les cheveux */
  var ty = cou - 12, hl = o.jupe ? 30 : 33, hh = 92;
  s += '<path d="M-15 ' + (cou - 2) + ' L -13 ' + (ty - 12) + ' L 13 ' + (ty - 12) + ' L 15 ' + (cou - 2) + ' Z" fill="' + vers(peau, -.12) + '" stroke="' + O + '" stroke-width="2"/>';
  [-1, 1].forEach(function(sg){ s += '<ellipse cx="' + (sg * (hl + 1)) + '" cy="' + (ty - 46) + '" rx="7" ry="11" fill="' + peau + '" stroke="' + O + '" stroke-width="2"/>'; });
  s += '<path d="M' + (-hl) + ' ' + (ty - 30) + ' C ' + (-hl - 2) + ' ' + (ty - 4) + ' ' + (hl + 2) + ' ' + (ty - 4) + ' ' + hl + ' ' + (ty - 30) + ' L ' + hl + ' ' + (ty - 60) + ' C ' + hl + ' ' + (ty - hh - 6) + ' ' + (-hl) + ' ' + (ty - hh - 6) + ' ' + (-hl) + ' ' + (ty - 60) + ' Z" fill="' + peau + '" stroke="' + O + '" stroke-width="2.6"/>';
  if(o.chauve) s += '<path d="M' + (-hl - 9) + ' ' + (ty - 62) + ' C ' + (-hl - 12) + ' ' + (ty - 40) + ' ' + (-hl - 4) + ' ' + (ty - 24) + ' ' + (-hl + 8) + ' ' + (ty - 22) + ' C ' + (-hl * .4) + ' ' + (ty - 30) + ' ' + (hl * .4) + ' ' + (ty - 30) + ' ' + (hl - 8) + ' ' + (ty - 22) + ' C ' + (hl + 4) + ' ' + (ty - 24) + ' ' + (hl + 12) + ' ' + (ty - 40) + ' ' + (hl + 9) + ' ' + (ty - 62) + ' C ' + (hl * .5) + ' ' + (ty - 50) + ' ' + (-hl * .5) + ' ' + (ty - 50) + ' ' + (-hl - 9) + ' ' + (ty - 62) + ' Z" fill="' + poil + '" stroke="' + O + '" stroke-width="2.2"/><ellipse cx="-8" cy="' + (ty - hh + 12) + '" rx="13" ry="7" fill="#fff" opacity=".4"/>';
  else s += '<path d="M' + (-hl - 2) + ' ' + (ty - 26) + ' C ' + (-hl - 5) + ' ' + (ty - hh - 12) + ' ' + (hl + 5) + ' ' + (ty - hh - 12) + ' ' + (hl + 2) + ' ' + (ty - 26) + ' C ' + (hl * .5) + ' ' + (ty - 14) + ' ' + (-hl * .5) + ' ' + (ty - 14) + ' ' + (-hl - 2) + ' ' + (ty - 26) + ' Z" fill="' + poil + '" stroke="' + O + '" stroke-width="2.4"/>' +
    '<path d="M' + (-hl * .6) + ' ' + (ty - hh + 4) + ' C ' + (-hl * .7) + ' ' + (ty - 60) + ' ' + (-hl * .6) + ' ' + (ty - 36) + ' ' + (-hl * .5) + ' ' + (ty - 20) + ' M0 ' + (ty - hh - 2) + ' L 0 ' + (ty - 18) + ' M' + (hl * .6) + ' ' + (ty - hh + 4) + ' C ' + (hl * .7) + ' ' + (ty - 60) + ' ' + (hl * .6) + ' ' + (ty - 36) + ' ' + (hl * .5) + ' ' + (ty - 20) + '" fill="none" stroke="' + vers(poil, -.4) + '" stroke-width="1.8" opacity=".6"/>';
  if(o.longs) s += '<path d="M' + (-hl - 3) + ' ' + (ty - 50) + ' C ' + (-hl - 16) + ' ' + (ty + 20) + ' ' + (-hl - 14) + ' ' + (ty + 90) + ' ' + (-hl + 6) + ' ' + (ty + 124) + ' C -10 ' + (ty + 134) + ' 10 ' + (ty + 134) + ' ' + (hl - 6) + ' ' + (ty + 124) + ' C ' + (hl + 14) + ' ' + (ty + 90) + ' ' + (hl + 16) + ' ' + (ty + 20) + ' ' + (hl + 3) + ' ' + (ty - 50) + ' Z" fill="' + poil + '" stroke="' + O + '" stroke-width="2.4"/><path d="M-12 ' + (ty - 20) + ' C -16 ' + (ty + 40) + ' -12 ' + (ty + 90) + ' -8 ' + (ty + 124) + ' M12 ' + (ty - 20) + ' C 16 ' + (ty + 40) + ' 12 ' + (ty + 90) + ' 8 ' + (ty + 124) + '" fill="none" stroke="' + vers(poil, -.4) + '" stroke-width="1.8" opacity=".6"/>';
  var c = o.coiffe, cy0 = ty - hh;
  if(c === 'chignon') s += '<circle cx="2" cy="' + (cy0 + 14) + '" r="22" fill="' + poil + '" stroke="' + O + '" stroke-width="2.4"/><path d="M-10 ' + (cy0 + 8) + ' C 0 ' + (cy0) + ' 12 ' + (cy0 + 4) + ' 16 ' + (cy0 + 16) + '" fill="none" stroke="' + vers(poil, -.4) + '" stroke-width="2"/>';
  if(c === 'toque') s += '<path d="M-33 ' + (cy0 + 22) + ' C -54 ' + (cy0 + 8) + ' -54 ' + (cy0 - 30) + ' -27 ' + (cy0 - 36) + ' C -22 ' + (cy0 - 58) + ' 22 ' + (cy0 - 58) + ' 27 ' + (cy0 - 36) + ' C 54 ' + (cy0 - 30) + ' 54 ' + (cy0 + 8) + ' 33 ' + (cy0 + 22) + ' Z" fill="#f6f2e8" stroke="' + O + '" stroke-width="2.6"/><path d="M-35 ' + (cy0 + 18) + ' L 35 ' + (cy0 + 18) + ' L 35 ' + (cy0 + 34) + ' L -35 ' + (cy0 + 34) + ' Z" fill="#fff" stroke="' + O + '" stroke-width="2.2"/>';
  if(c === 'paille') s += '<ellipse cx="0" cy="' + (cy0 + 22) + '" rx="74" ry="16" fill="#e0c060" stroke="' + O + '" stroke-width="2.6"/><path d="M-35 ' + (cy0 + 20) + ' C -37 ' + (cy0 - 12) + ' -22 ' + (cy0 - 24) + ' 0 ' + (cy0 - 24) + ' C 22 ' + (cy0 - 24) + ' 37 ' + (cy0 - 12) + ' 35 ' + (cy0 + 20) + ' Z" fill="#ecd078" stroke="' + O + '" stroke-width="2.6"/><path d="M-35 ' + (cy0 + 10) + ' C -20 ' + (cy0 + 18) + ' 20 ' + (cy0 + 18) + ' 35 ' + (cy0 + 10) + '" fill="none" stroke="#7a4a26" stroke-width="7"/>';
  if(c === 'bonnet') s += '<path d="M-37 ' + (cy0 + 26) + ' C -46 ' + (cy0 - 8) + ' -26 ' + (cy0 - 28) + ' 4 ' + (cy0 - 28) + ' C 34 ' + (cy0 - 28) + ' 46 ' + (cy0 - 10) + ' 40 ' + (cy0 + 26) + ' Z" fill="#efe8d6" stroke="' + O + '" stroke-width="2.6"/>';
  if(c === 'plume') s += '<path d="M-26 ' + (cy0 - 4) + ' C -44 ' + (cy0 - 50) + ' -80 ' + (cy0 - 64) + ' -96 ' + (cy0 - 50) + ' C -84 ' + (cy0 - 32) + ' -60 ' + (cy0 - 12) + ' -34 ' + (cy0 + 4) + ' Z" fill="#f4f0e0" stroke="' + O + '" stroke-width="2.2"/><ellipse cx="0" cy="' + (cy0 + 20) + '" rx="64" ry="14" fill="#b82a26" stroke="' + O + '" stroke-width="2.6"/><path d="M-33 ' + (cy0 + 18) + ' C -37 ' + (cy0 - 10) + ' -24 ' + (cy0 - 22) + ' 0 ' + (cy0 - 22) + ' C 24 ' + (cy0 - 22) + ' 37 ' + (cy0 - 10) + ' 33 ' + (cy0 + 18) + ' Z" fill="#c8302a" stroke="' + O + '" stroke-width="2.6"/>';
  if(c === 'facteur') s += '<path d="M-34 ' + (cy0 + 24) + ' C -38 ' + (cy0 - 6) + ' -28 ' + (cy0 - 22) + ' 0 ' + (cy0 - 24) + ' C 28 ' + (cy0 - 22) + ' 38 ' + (cy0 - 6) + ' 34 ' + (cy0 + 24) + ' Z" fill="#2f4f9a" stroke="' + O + '" stroke-width="2.6"/><path d="M-34 ' + (cy0 + 12) + ' L 34 ' + (cy0 + 12) + ' L 34 ' + (cy0 + 22) + ' L -34 ' + (cy0 + 22) + ' Z" fill="#c0302a" stroke="' + O + '" stroke-width="1.6"/>';
  if(c === 'fichu') s += '<path d="M' + (-hl - 6) + ' ' + (ty - 30) + ' C ' + (-hl - 10) + ' ' + (cy0 - 14) + ' ' + (hl + 10) + ' ' + (cy0 - 14) + ' ' + (hl + 6) + ' ' + (ty - 30) + ' C ' + (hl * .6) + ' ' + (ty - 8) + ' 12 ' + (ty + 10) + ' 0 ' + (ty + 40) + ' C -12 ' + (ty + 10) + ' ' + (-hl * .6) + ' ' + (ty - 8) + ' ' + (-hl - 6) + ' ' + (ty - 30) + ' Z" fill="' + (o.fichu || '#f4efe2') + '" stroke="' + O + '" stroke-width="2.6"/>';
  s += '</g>';
  if(kG > .5) s += bras(-1, kG); if(kD > .5) s += bras(1, kD);
  return s;
};

/* ---------------------------------------------------------------- MOUSTACHE, le chat gris d'Odette, assis, de face (repère : ses pattes en 0, 0 ; il fait 190 de haut)
   o = {lx, ly (son regard), cl (les yeux qui se ferment), oreilles (0 : droites → 1 : couchées), miaou (0 → 1), queue (le bout qui bat), tete (penchée, en degrés), souffle} */
GD.chat = function(o){
  o = o || {};
  var s = '', or = o.oreilles || 0, mi = o.miaou || 0, so = o.souffle || 0;
  /* la queue, enroulée autour des pattes ; son bout bat */
  var q = o.queue || 0;
  s += '<path d="M54 -22 C 96 -24 104 8 62 10 C 30 12 -10 10 -34 4 C ' + f(-48 - q * 4) + ' ' + f(0 - q * 10) + ' ' + f(-52 - q * 6) + ' ' + f(-14 - q * 12) + ' ' + f(-44 - q * 4) + ' ' + f(-18 - q * 14) + '" fill="none" stroke="' + O + '" stroke-width="27" stroke-linecap="round"/>' +
    '<path d="M54 -22 C 96 -24 104 8 62 10 C 30 12 -10 10 -34 4 C ' + f(-48 - q * 4) + ' ' + f(0 - q * 10) + ' ' + f(-52 - q * 6) + ' ' + f(-14 - q * 12) + ' ' + f(-44 - q * 4) + ' ' + f(-18 - q * 14) + '" fill="none" stroke="#8d93a6" stroke-width="22" stroke-linecap="round"/>' +
    '<path d="M62 -2 C 30 2 -10 0 -30 -6" fill="none" stroke="#6a7084" stroke-width="3" opacity=".6" stroke-dasharray="7 9"/>';
  /* le corps : une grosse poire (il est gros), le poitrail plus clair */
  s += '<path d="M-58 -4 C -72 -50 -58 ' + f(-104 - so * 3) + ' -30 ' + f(-122 - so * 3) + ' L 30 ' + f(-122 - so * 3) + ' C 58 ' + f(-104 - so * 3) + ' 72 -50 58 -4 C 30 6 -30 6 -58 -4 Z" fill="url(#gdChatX)" stroke="' + O + '" stroke-width="2.8"/>' +
    '<path d="M-22 -112 C -34 -80 -30 -40 -16 -14 C -6 -8 6 -8 16 -14 C 30 -40 34 -80 22 -112 Z" fill="#c9cede" opacity=".85"/>' +
    '<path d="M-44 -70 l 10 5 M-48 -50 l 11 3 M44 -70 l -10 5 M48 -50 l -11 3 M-40 -90 l 9 6 M40 -90 l -9 6" stroke="#5a6074" stroke-width="3" stroke-linecap="round" opacity=".6"/>';
  /* les pattes de devant : SIX doigts (c'est Moustache) */
  [-1, 1].forEach(function(sg){ s += '<path d="M' + (sg * 7) + ' -74 C ' + (sg * 5) + ' -48 ' + (sg * 6) + ' -26 ' + (sg * 5) + ' -12 L ' + (sg * 37) + ' -12 C ' + (sg * 36) + ' -30 ' + (sg * 36) + ' -52 ' + (sg * 31) + ' -74 Z" fill="#aab0c2" stroke="' + O + '" stroke-width="2.4" stroke-linejoin="round"/>' +
    '<ellipse cx="' + (sg * 22) + '" cy="-6" rx="21" ry="12" fill="#cfd4e2" stroke="' + O + '" stroke-width="2.4"/>' +
    '<path d="M' + (sg * 8) + ' -2 q 1 -6 0 -9 M' + (sg * 14) + ' 2 q 1 -7 0 -11 M' + (sg * 20) + ' 4 q 1 -8 0 -12 M' + (sg * 26) + ' 3 q 1 -8 0 -12 M' + (sg * 32) + ' 1 q 1 -6 0 -10" fill="none" stroke="' + O + '" stroke-width="1.5" stroke-linecap="round"/>'; });
  /* le poil : des mèches, par-dessus le corps */
  s += '<path d="M-58 -4 C -72 -50 -58 -104 -30 -122 L 30 -122 C 58 -104 72 -50 58 -4 C 30 6 -30 6 -58 -4 Z" fill="url(#tx_cheveux)" opacity=".8"/>';
  /* la tête */
  s += '<g transform="translate(0 ' + f(-128 - so * 3) + ') rotate(' + f(o.tete || 0) + ')">';
  /* les oreilles : droites, ou couchées sur les côtés */
  [-1, 1].forEach(function(sg){ var ax = sg * U.lerp(26, 44, or), ay = U.lerp(-78, -50, or), bx = sg * U.lerp(50, 62, or), by = U.lerp(-34, -30, or);
    s += '<path d="M' + (sg * 14) + ' -52 L ' + f(ax) + ' ' + f(ay) + ' L ' + f(bx) + ' ' + f(by) + ' Z" fill="#8d93a6" stroke="' + O + '" stroke-width="2.6" stroke-linejoin="round"/><path d="M' + (sg * 22) + ' -48 L ' + f(U.lerp(sg * 14, ax, .8) + sg * 6) + ' ' + f(U.lerp(-52, ay, .76)) + ' L ' + f(U.lerp(sg * 14, bx, .8)) + ' ' + f(by - 6) + ' Z" fill="#e8a0a8" opacity=".8"/>'; });
  s += '<path d="M-56 -22 C -60 -52 -34 -68 0 -68 C 34 -68 60 -52 56 -22 C 60 -4 40 16 0 18 C -40 16 -60 -4 -56 -22 Z" fill="url(#gdChat)" stroke="' + O + '" stroke-width="2.8"/><path d="M-56 -22 C -60 -52 -34 -68 0 -68 C 34 -68 60 -52 56 -22 C 60 -4 40 16 0 18 C -40 16 -60 -4 -56 -22 Z" fill="url(#tx_cheveux)" opacity=".7"/>';
  /* les rayures du front, les joues claires */
  s += '<path d="M0 -66 L 0 -46 M-12 -64 L -9 -48 M12 -64 L 9 -48" stroke="#5a6074" stroke-width="3.4" stroke-linecap="round" opacity=".7"/><ellipse cx="-18" cy="0" rx="20" ry="13" fill="#d6dae6"/><ellipse cx="18" cy="0" rx="20" ry="13" fill="#d6dae6"/>';
  /* les yeux : grands, dorés ; la pupille en amande ; ils suivent, ils clignent */
  var cl = U.clamp(o.cl || 0, 0, 1), lx = (o.lx || 0) * 5, ly = (o.ly || 0) * 3, triste = or * 3;
  [-1, 1].forEach(function(sg){ var ex = sg * 24, ey = -24, h = 13 * (1 - cl);
    if(h > 1.2){ var idc = 'chatOeil' + (sg > 0 ? 'D' : 'G');
      s += '<clipPath id="' + idc + '"><ellipse cx="' + ex + '" cy="' + ey + '" rx="15" ry="' + f(h) + '"/></clipPath><ellipse cx="' + ex + '" cy="' + ey + '" rx="15" ry="' + f(h) + '" fill="#e8c24a"/><g clip-path="url(#' + idc + ')"><ellipse cx="' + ex + '" cy="' + f(ey + 4) + '" rx="15" ry="9" fill="#c89a20" opacity=".5"/><ellipse cx="' + f(ex + lx) + '" cy="' + f(ey + ly) + '" rx="' + f(5 + (o.pupille || 0) * 5) + '" ry="11" fill="#0c0a10"/><circle cx="' + f(ex + lx - 3.5) + '" cy="' + f(ey + ly - 4.5) + '" r="3" fill="#fff"/><circle cx="' + f(ex + lx + 3) + '" cy="' + f(ey + ly + 4) + '" r="1.4" fill="#fff" opacity=".8"/></g>'; }
    s += '<path d="M' + f(ex - sg * 16) + ' ' + f(ey + triste * -sg * 0) + ' C ' + f(ex - sg * 8) + ' ' + f(ey - h - 2 + triste) + ' ' + f(ex + sg * 8) + ' ' + f(ey - h - 2 - triste * .5) + ' ' + f(ex + sg * 16) + ' ' + f(ey - triste * .2) + '" fill="none" stroke="' + O + '" stroke-width="2.8" stroke-linecap="round"/>'; });
  /* le nez, la bouche (elle s'ouvre : il miaule), les longues moustaches blanches */
  s += '<path d="M-6 -6 L 6 -6 L 0 1 Z" fill="#e88a94" stroke="' + O + '" stroke-width="1.8" stroke-linejoin="round"/>';
  if(mi > .08) s += '<path d="M-9 4 C -8 ' + f(4 + mi * 20) + ' 8 ' + f(4 + mi * 20) + ' 9 4 Z" fill="#5a1418" stroke="' + O + '" stroke-width="2"/><path d="M-5 ' + f(6 + mi * 12) + ' C -2 ' + f(4 + mi * 9) + ' 2 ' + f(4 + mi * 9) + ' 5 ' + f(6 + mi * 12) + ' C 3 ' + f(8 + mi * 17) + ' -3 ' + f(8 + mi * 17) + ' -5 ' + f(6 + mi * 12) + ' Z" fill="#e8737a"/><path d="M-7 5 l 2.4 5 l 2 -5 M7 5 l -2.4 5 l -2 -5" fill="#fff"/>';
  else s += '<path d="M0 1 L 0 6 M0 6 C -4 11 -11 10 -13 6 M0 6 C 4 11 11 10 13 6" fill="none" stroke="' + O + '" stroke-width="2" stroke-linecap="round"/>';
  [-1, 1].forEach(function(sg){ [[-8, -14], [-1, 0], [7, 12]].forEach(function(m, i){ s += '<path d="M' + (sg * 20) + ' ' + f(2 + i * 3) + ' Q ' + (sg * 52) + ' ' + f(m[0] + 2 - or * 4) + ' ' + (sg * 96) + ' ' + f(m[1] + or * 10) + '" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>'; }); });
  s += '</g>';
  return s;
};

/* ---------------------------------------------------------------- UN CHAPEAU LANCÉ EN L'AIR (repère : son milieu) */
GD.chapeau = function(sorte){
  if(sorte === 'toque') return '<path d="M-32 14 C -52 2 -52 -34 -26 -40 C -22 -62 22 -62 26 -40 C 52 -34 52 2 32 14 Z" fill="#f6f2e8" stroke="' + O + '" stroke-width="2.6"/><path d="M-34 12 C -20 20 20 20 34 12 L 34 28 C 20 36 -20 36 -34 28 Z" fill="#fff" stroke="' + O + '" stroke-width="2.2"/>';
  if(sorte === 'paille') return '<ellipse cx="0" cy="14" rx="72" ry="15" fill="#e0c060" stroke="' + O + '" stroke-width="2.6"/><path d="M-34 12 C -36 -18 -22 -30 0 -30 C 22 -30 36 -18 34 12 C 20 20 -20 20 -34 12 Z" fill="#ecd078" stroke="' + O + '" stroke-width="2.6"/><path d="M-34 4 C -20 12 20 12 34 4 L 34 10 C 20 18 -20 18 -34 10 Z" fill="#7a4a26" stroke="' + O + '" stroke-width="1.6"/>';
  if(sorte === 'plume') return '<path d="M26 -10 C 44 -56 80 -70 96 -56 C 84 -38 60 -18 34 -2 Z" fill="#f4f0e0" stroke="' + O + '" stroke-width="2.2"/><ellipse cx="0" cy="12" rx="62" ry="13" fill="#b82a26" stroke="' + O + '" stroke-width="2.6"/><path d="M-32 10 C -36 -16 -24 -28 0 -28 C 24 -28 36 -16 32 10 C 20 18 -20 18 -32 10 Z" fill="#c8302a" stroke="' + O + '" stroke-width="2.6"/><path d="M-32 2 C -20 10 20 10 32 2 L 32 9 C 20 17 -20 17 -32 9 Z" fill="#f2c040" stroke="' + O + '" stroke-width="1.6"/>';
  if(sorte === 'facteur') return '<path d="M-33 10 C -36 -14 -28 -28 0 -30 C 28 -28 36 -14 33 10 C 20 18 -20 18 -33 10 Z" fill="#2f4f9a" stroke="' + O + '" stroke-width="2.6"/><path d="M-33 4 C -20 12 20 12 33 4 L 33 12 C 20 20 -20 20 -33 12 Z" fill="#c0302a" stroke="' + O + '" stroke-width="1.6"/><path d="M-36 12 C -20 24 20 24 36 12 C 30 28 -30 28 -36 12 Z" fill="#1a1a22" stroke="' + O + '" stroke-width="2"/>';
  return '<path d="M-36 12 C -44 -18 -26 -36 4 -36 C 34 -36 46 -20 40 0 C 20 -10 -20 -10 -36 12 Z" fill="#efe8d6" stroke="' + O + '" stroke-width="2.6"/><path d="M-38 10 C -20 0 20 0 38 10 L 38 20 C 20 10 -20 10 -38 20 Z" fill="#fbf6e8" stroke="' + O + '" stroke-width="2.2"/>';
};

/* ---------------------------------------------------------------- LA LETTRE EN TRÈS GROS PLAN (une image entière, 1440 × 616)
   Deux mains gantées de gris tiennent la feuille. On ne lit pas l'écriture (des boucles d'encre, floues tant que le point n'y est pas),
   sauf le dernier mot : la signature. k : le point net descend du haut de la lettre (0) vers la signature (1) ; t : la feuille tremble à peine ;
   soleil (0 → 1) : un reflet doré passe sur le papier. */
GD.insertLettre = function(t, k, soleil){
  var W = 1440, H = 616, s = '', R = U.hasard(2311);
  /* le fond : la façade dorée de la mairie, la redingote violette, très flous */
  s += '<rect width="' + W + '" height="' + H + '" fill="#b89a6a"/><g filter="url(#fl80)"><rect x="-100" y="-80" width="700" height="800" fill="#d8bc86"/><rect x="900" y="-80" width="700" height="800" fill="#caa872"/><rect x="430" y="330" width="600" height="400" fill="#3a3466"/><rect x="640" y="330" width="170" height="400" fill="#c9a040"/><circle cx="250" cy="120" r="70" fill="#fff0c0"/><circle cx="1240" cy="90" r="50" fill="#ffe8b0"/></g>';
  var tr = U.bruit(t * 2.6, 3) * 2.2, tr2 = U.bruit(t * 2.1, 8) * 1.6, rot = -2.2 + U.bruit(t * .8, 5) * .5;
  s += '<g transform="translate(' + f(tr) + ' ' + f(tr2) + ') rotate(' + f(rot) + ' 720 308)">';
  /* les gants, derrière la feuille : la paume et les quatre doigts repliés (on en voit le bord, de chaque côté) */
  [[-1, 318], [1, 1122]].forEach(function(q){ var sg = q[0], x = q[1];
    s += '<path d="M' + (x + sg * 30) + ' 720 L ' + (x + sg * 30) + ' 520 C ' + (x + sg * 10) + ' 486 ' + (x - sg * 50) + ' 480 ' + (x - sg * 80) + ' 520 C ' + (x - sg * 110) + ' 560 ' + (x - sg * 120) + ' 640 ' + (x - sg * 116) + ' 720 Z" fill="#8e8c9a" stroke="' + O + '" stroke-width="5" stroke-linejoin="round"/>' +
      '<path d="M' + (x - sg * 78) + ' 560 q ' + (sg * 30) + ' -22 ' + (sg * 70) + ' -6 M' + (x - sg * 92) + ' 620 q ' + (sg * 36) + ' -20 ' + (sg * 84) + ' -4" fill="none" stroke="#6a6876" stroke-width="4" stroke-linecap="round"/>'; });
  /* LA FEUILLE : un beau papier crème, son grain, deux plis, un coin corné */
  var px = 330, py = -30, pw = 780, ph = 700;
  s += '<path d="M' + px + ' ' + (py + 10) + ' L ' + (px + pw - 60) + ' ' + py + ' L ' + (px + pw) + ' ' + (py + 50) + ' L ' + (px + pw + 14) + ' ' + (py + ph) + ' L ' + (px - 10) + ' ' + (py + ph) + ' Z" fill="url(#gdPapierX)" stroke="' + O + '" stroke-width="4" stroke-linejoin="round"/>' +
    '<path d="M' + (px + pw - 60) + ' ' + py + ' L ' + (px + pw - 52) + ' ' + (py + 56) + ' L ' + (px + pw) + ' ' + (py + 50) + ' Z" fill="#d8c8a4" stroke="' + O + '" stroke-width="3" stroke-linejoin="round"/>';
  var grain = '';
  for(var i = 0; i < 260; i++){ var gx = px + 10 + R() * (pw - 20), gy = py + 20 + R() * (ph - 40), gl = 4 + R() * 16, ga = R() * 3.14; grain += '<path d="M' + f(gx) + ' ' + f(gy) + ' l ' + f(Math.cos(ga) * gl) + ' ' + f(Math.sin(ga) * gl * .3) + '" stroke="' + (R() < .6 ? '#a8946a' : '#fff') + '" stroke-width="' + f(.8 + R()) + '" opacity="' + f(.12 + R() * .2) + '"/>'; }
  s += grain + '<path d="M' + (px - 4) + ' 236 L ' + (px + pw + 8) + ' 226" stroke="#c8b688" stroke-width="3" opacity=".7"/><path d="M' + (px - 4) + ' 240 L ' + (px + pw + 8) + ' 230" stroke="#fff" stroke-width="2" opacity=".5"/>';
  /* L'ÉCRITURE : des boucles d'encre brune, ligne après ligne ; chaque ligne est d'autant plus floue qu'elle est loin du point net */
  var net = U.lerp(60, 520, k);
  for(var l = 0; l < 9; l++){
    var ly = 44 + l * 50, d = Math.abs(ly - net), fl = Math.min(34, Math.round(d / 14)), x = px + 96, fin = px + pw - 96 - (l === 8 ? 420 : R() * 120), ligne = 'M' + x + ' ' + ly;
    while(x < fin){ var mot = 40 + R() * 110; var x1 = Math.min(fin, x + mot);
      while(x < x1){ var w = 9 + R() * 9, hgt = (R() < .22 ? 24 : 9) + R() * 6, sens = R() < .5 ? -1 : 1; ligne += ' q ' + f(w * .5) + ' ' + f(-hgt * sens) + ' ' + f(w) + ' 0'; x += w; }
      x += 22 + R() * 14; ligne += ' m ' + f(22) + ' 0'; }
    s += '<path d="' + ligne + '" fill="none" stroke="#3a2618" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" opacity=".88"' + (fl > 0 ? ' filter="url(#fl' + fl + ')"' : '') + '/>';
  }
  /* LA SIGNATURE (le seul mot qu'on lit) et son paraphe */
  var ds = Math.abs(530 - net), fs = Math.min(30, Math.round(ds / 14));
  s += '<g' + (fs > 0 ? ' filter="url(#fl' + fs + ')"' : '') + '><text x="720" y="552" text-anchor="middle" font-family="Caveat, cursive" font-size="128" font-weight="600" fill="#33200f" transform="rotate(-4 720 552)">Odette</text>' +
    '<path d="M590 584 C 700 606 820 566 880 588 C 840 610 760 602 730 588" fill="none" stroke="#33200f" stroke-width="4" stroke-linecap="round"/></g>';
  /* le reflet du soleil qui passe sur le papier */
  if(soleil > 0){ var sx = U.lerp(px - 300, px + pw + 200, soleil); s += '<g style="mix-blend-mode:screen" opacity=".55"><path d="M' + f(sx) + ' ' + (py - 20) + ' L ' + f(sx + 150) + ' ' + (py - 20) + ' L ' + f(sx - 80) + ' ' + (py + ph + 20) + ' L ' + f(sx - 230) + ' ' + (py + ph + 20) + ' Z" fill="#fff2c0" filter="url(#fl40)"/></g>'; }
  /* les pouces gantés, PAR-DESSUS la feuille : ils la pincent près du bord ; la couture du gant, un reflet */
  [[-1, 330], [1, 1110]].forEach(function(q){ var sg = q[0], x = q[1], x0 = x + sg * 6, y0 = 700, x1 = x + sg * 74, y1 = 506;
    s += '<path d="M' + x0 + ' ' + y0 + ' L ' + x1 + ' ' + y1 + '" stroke="' + O + '" stroke-width="96" stroke-linecap="round"/><path d="M' + x0 + ' ' + y0 + ' L ' + x1 + ' ' + y1 + '" stroke="#a6a4b2" stroke-width="86" stroke-linecap="round"/>' +
      '<path d="M' + (x0 + sg * 14) + ' ' + (y0 - 4) + ' L ' + (x1 - sg * 4) + ' ' + (y1 + 22) + '" stroke="#6a6876" stroke-width="3" stroke-dasharray="9 8"/><path d="M' + (x1 - sg * 30) + ' ' + (y1 - 22) + ' q ' + (sg * 22) + ' -16 ' + (sg * 44) + ' 2" fill="none" stroke="#dcdae8" stroke-width="6" opacity=".75" stroke-linecap="round"/>'; });
  s += '</g>';
  return s;
};

/* ====================================================================== ENQUÊTE 2 : LE SEAU, LE PANIER DE LINGE, LE DRAP */
/* un seau de bois cerclé de fer (repère : le milieu de son fond ; il fait 120 de haut) ; k : plein d'eau (on voit l'eau au bord) */
GD.seau = function(k){
  return '<path d="M-52 -118 L 52 -118 L 42 0 L -42 0 Z" fill="url(#gdSeau)" stroke="' + O + '" stroke-width="2.6" stroke-linejoin="round"/>' +
    '<path d="M-30 -116 L -25 -2 M-10 -117 L -8 -1 M10 -117 L 8 -1 M30 -116 L 25 -2" stroke="#3a2412" stroke-width="1.6" opacity=".7"/>' +
    '<path d="M-51 -96 L 51 -96 L 50 -84 L -50 -84 Z M-45 -30 L 45 -30 L 44 -18 L -44 -18 Z" fill="#4a4a54" stroke="' + O + '" stroke-width="1.8"/>' +
    '<ellipse cx="0" cy="-118" rx="52" ry="11" fill="' + (k ? '#7a2a2e' : '#2a1a10') + '" stroke="' + O + '" stroke-width="2.4"/>' + (k ? '<ellipse cx="-12" cy="-120" rx="18" ry="3.4" fill="#fff" opacity=".4"/>' : '');
};
G.OBJETS.seau = {
  angle:function(o, c, p){ return (p.pend || 0) * (c === 'G' ? -1 : 1) * .6; },
  dessin:function(o){ return '<g transform="translate(0 130)"><path d="M-50 -116 C -44 -190 44 -190 50 -116" fill="none" stroke="#3a3a44" stroke-width="5"/>' + GD.seau(o.seauPlein) + '</g>'; }
};
/* un panier d'osier plein de linge blanc, porté sur la hanche (dans la main) */
G.OBJETS.panier = {
  angle:function(){ return 0; }, dessous:false,
  dessin:function(){
    var s = '<g transform="translate(16 26)"><path d="M-66 -24 C -40 -62 40 -62 66 -24 C 60 -40 30 -78 0 -74 C -30 -78 -60 -40 -66 -24 Z" fill="url(#gdDrap)" stroke="' + O + '" stroke-width="2.4"/><path d="M-30 -60 C -10 -52 10 -66 34 -54 M-48 -40 C -20 -34 0 -46 20 -38" fill="none" stroke="#b8b2a2" stroke-width="2"/>' +
      '<path d="M-70 -26 L 70 -26 L 54 50 C 30 60 -30 60 -54 50 Z" fill="#b8884a" stroke="' + O + '" stroke-width="2.6" stroke-linejoin="round"/>';
    for(var i = 0; i < 5; i++) s += '<path d="M' + (-66 + i * 3) + ' ' + (-12 + i * 14) + ' C -30 ' + (-4 + i * 14) + ' 30 ' + (-4 + i * 14) + ' ' + (66 - i * 3) + ' ' + (-12 + i * 14) + '" fill="none" stroke="#7a5426" stroke-width="2.4"/>';
    for(i = 0; i < 9; i++) s += '<path d="M' + (-56 + i * 14) + ' -26 L ' + (-44 + i * 11) + ' 52" stroke="#8a6230" stroke-width="1.6" opacity=".7"/>';
    return s + '<path d="M-72 -30 L 72 -30 L 70 -18 L -70 -18 Z" fill="#c89a58" stroke="' + O + '" stroke-width="2.2"/></g>';
  }
};
/* le drap, lâché sur le bord du quai (repère : le bord du quai ; il pend vers l'eau) ; rouge : 0 → 1 (taché) */
GD.drapPose = function(rouge){
  var id = 'drapR' + Math.round(rouge * 10);
  return '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf8f0"/><stop offset="' + U.r(.5 - rouge * .3) + '" stop-color="#f4e6e0"/><stop offset="' + U.r(.82 - rouge * .2) + '" stop-color="#d8626a"/><stop offset="1" stop-color="#a81e2c"/></linearGradient>' +
    /* un tas chiffonné sur la pierre (il traîne vers la gauche), et un pan qui pend jusqu'à l'eau, à droite */
    '<path d="M-210 -6 C -214 -26 -170 -40 -130 -30 C -100 -48 -50 -44 -24 -32 C 10 -58 70 -62 100 -38 C 130 -50 168 -34 172 -12 C 176 30 164 70 170 112 C 150 128 134 104 112 118 C 92 130 70 108 52 116 C 50 80 58 44 50 6 C 0 14 -60 2 -110 8 C -150 12 -190 6 -210 -6 Z" fill="url(#' + id + ')" stroke="' + O + '" stroke-width="2.6" stroke-linejoin="round"/>' +
    '<path d="M-170 -16 C -140 -26 -120 -10 -90 -18 M-60 -22 C -30 -14 -10 -32 20 -24 M60 -40 C 90 -30 120 -34 150 -24 M84 10 C 80 44 90 76 84 112 M130 8 C 136 44 126 78 134 110" fill="none" stroke="#c8a8a4" stroke-width="2.2" opacity=".75"/>';
};
/* LE DRAP DANS L'EAU, EN TRÈS GROS PLAN (une image entière, 1440 × 616). On est au ras de l'eau, devant la lavandière : ses deux
   avant-bras descendent du haut de l'image, ses mains tiennent le drap. a : le temps depuis le début du plan.
   0 → 1,3 s : elle le plonge et le frotte ; 1,3 → 2,4 s : elle le sort de l'eau… il est ROUGE ; puis les gouttes rouges tombent.
   aube (1 → 0) : la lumière orange du soleil levant sur l'eau. */
GD.insertDrap = function(t, a, aube){
  var W = 1440, H = 616, s = '', R = U.hasard(4409), YE = 430;
  var sort = U.tresLisse(U.clamp((a - 1.5) / 1.1, 0, 1)), frotte = U.clamp(a / .5, 0, 1) * (1 - sort), my = U.lerp(424, 196, sort) + Math.sin(a * 9) * 14 * frotte, mx = Math.sin(a * 9 + 1) * 34 * frotte, tr = U.bruit(t * 2.4, 3) * 3 * sort;
  /* le fond : le quai et le tablier de la lavandière, très flous ; le soleil levant, en ronds */
  s += '<rect width="' + W + '" height="' + H + '" fill="#8a7460"/><g filter="url(#fl80)"><rect x="-100" y="-80" width="1700" height="330" fill="#7a6a5a"/><rect x="380" y="-80" width="680" height="420" fill="#5a7aa8"/><rect x="520" y="-80" width="400" height="460" fill="#f2ece0"/><rect x="-100" y="250" width="1700" height="200" fill="#a09080"/><circle cx="1180" cy="60" r="90" fill="#ffd9a0" opacity="' + U.r(aube) + '"/><circle cx="160" cy="130" r="60" fill="#ffc890" opacity="' + U.r(aube * .8) + '"/></g>';
  /* L'EAU : le haut reflète le ciel (orange à l'aube), le bas est plus profond */
  s += '<linearGradient id="idEau" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6b684"/><stop offset=".3" stop-color="#cc7a80"/><stop offset="1" stop-color="#6a3454"/></linearGradient>';
  function drap(sousEau){
    /* le drap : tenu par ses deux coins du haut, il pend ; le bas ondule */
    var xg = 560 + mx, xd = 880 + mx, yh = my + tr, bas = yh + 360, d = '', on = function(i){ return Math.sin(t * 2.2 + i * 1.7) * 7; };
    d += 'M' + U.r(xg - 30) + ' ' + U.r(yh - 6) + ' C ' + U.r(xg + 80) + ' ' + U.r(yh + 44) + ' ' + U.r(xd - 80) + ' ' + U.r(yh + 44) + ' ' + U.r(xd + 30) + ' ' + U.r(yh - 6);
    d += ' C ' + U.r(xd + 64 + on(1)) + ' ' + U.r(yh + 120) + ' ' + U.r(xd + 50 + on(2)) + ' ' + U.r(yh + 250) + ' ' + U.r(xd + 70 + on(3)) + ' ' + U.r(bas);
    d += ' C ' + U.r(xd - 20) + ' ' + U.r(bas + 26 + on(4)) + ' ' + U.r(xd - 90) + ' ' + U.r(bas - 16 + on(5)) + ' 720 ' + U.r(bas + 14 + on(6)) + ' C ' + U.r(xg + 90) + ' ' + U.r(bas + 34 + on(7)) + ' ' + U.r(xg + 20) + ' ' + U.r(bas - 10 + on(8)) + ' ' + U.r(xg - 70 + on(9)) + ' ' + U.r(bas);
    d += ' C ' + U.r(xg - 50 + on(10)) + ' ' + U.r(yh + 250) + ' ' + U.r(xg - 64 + on(11)) + ' ' + U.r(yh + 120) + ' ' + U.r(xg - 30) + ' ' + U.r(yh - 6) + ' Z';
    var plis = '';
    [-.7, -.35, 0, .35, .7].forEach(function(k, i){ var px = 720 + mx + k * 190; plis += 'M' + U.r(px) + ' ' + U.r(yh + 40) + ' C ' + U.r(px + on(i) * 1.4) + ' ' + U.r(yh + 150) + ' ' + U.r(px - on(i + 3) * 1.4) + ' ' + U.r(yh + 260) + ' ' + U.r(px + on(i + 5)) + ' ' + U.r(bas - 10) + ' '; });
    /* le blanc du lin ; LE ROUGE qui l'a pris : tout ce qui a trempé (une limite qui ondule, des coulures qui montent dans le tissu) */
    var lim = yh + 96, tache = 'M' + U.r(xg - 90) + ' ' + U.r(lim + 30);
    for(var i = 0; i <= 12; i++){ var u = i / 12; tache += ' L ' + U.r(xg - 90 + u * (xd - xg + 180)) + ' ' + U.r(lim + Math.sin(u * 19 + 1) * 22 + Math.sin(u * 7) * 14 - (i % 3 === 1 ? 46 : 0)); }
    tache += ' L ' + U.r(xd + 120) + ' ' + (bas + 80) + ' L ' + U.r(xg - 120) + ' ' + (bas + 80) + ' Z';
    return '<clipPath id="clDrap' + (sousEau ? 'S' : 'A') + '"><path d="' + d + '"/></clipPath><path d="' + d + '" fill="url(#gdDrap)" stroke="' + O + '" stroke-width="4" stroke-linejoin="round"/>' +
      '<g clip-path="url(#clDrap' + (sousEau ? 'S' : 'A') + ')"><path d="' + tache + '" fill="#c22a36"/><path d="' + tache + '" fill="#8a0e1e" opacity=".45" transform="translate(0 110)"/><path d="' + tache + '" fill="#e8848a" opacity=".5" transform="translate(0 -16)"/>' +
      '<path d="' + plis + '" fill="none" stroke="#000" stroke-width="5" opacity=".13"/><path d="' + plis + '" fill="none" stroke="#fff" stroke-width="3" opacity=".3" transform="translate(7 0)"/>' +
      semis(yh, bas, xg, xd) + '</g>';
  }
  /* le grain du lin : des fils */
  function semis(yh, bas, xg, xd){ var q = '', R2 = U.hasard(771); for(var i = 0; i < 150; i++){ var x = xg - 70 + R2() * (xd - xg + 140), y = yh + R2() * (bas - yh), v = R2() < .5; q += '<path d="M' + U.r(x) + ' ' + U.r(y) + (v ? 'v' : 'h') + U.r(8 + R2() * 18) + '" stroke="' + (R2() < .5 ? '#6a4a40' : '#fff') + '" stroke-width="1.2" opacity="' + U.r(.1 + R2() * .14) + '"/>'; } return q; }
  /* (1) ce qui est SOUS l'eau : le drap vu à travers l'eau (sombre, trouble) */
  s += '<clipPath id="clSous"><rect x="0" y="' + YE + '" width="' + W + '" height="' + (H - YE) + '"/></clipPath><clipPath id="clSur"><rect x="0" y="0" width="' + W + '" height="' + YE + '"/></clipPath>';
  s += '<rect x="0" y="' + YE + '" width="' + W + '" height="' + (H - YE) + '" fill="url(#idEau)"/>';
  s += '<g clip-path="url(#clSous)" opacity=".5" filter="url(#fl6)">' + drap(true) + '</g><rect x="0" y="' + YE + '" width="' + W + '" height="' + (H - YE) + '" fill="url(#idEau)" opacity=".5"/>';
  /* les rides de l'eau, les éclats du soleil */
  for(var i = 0; i < 46; i++){ var v = Math.pow(R(), 1.4), y = YE + 6 + v * (H - YE), L = 60 + v * 240, x = ((R() * 1800 + t * (40 + v * 120)) % 1800) - 180, clair = R() < .5;
    s += '<path d="M' + U.r(x) + ' ' + U.r(y) + ' q ' + U.r(L / 2) + ' ' + U.r(-3 - v * 8) + ' ' + U.r(L) + ' 0" fill="none" stroke="' + (clair ? '#ffe0b4' : '#4a1c3a') + '" stroke-width="' + U.r(1.5 + v * 5) + '" stroke-linecap="round" opacity="' + U.r(clair ? .5 : .4) + '"/>'; }
  /* les ronds dans l'eau, là où le drap entre et où les gouttes tombent */
  [[560 + mx, 0], [880 + mx, .5], [720 + mx, .25]].forEach(function(q){ for(var n = 0; n < 2; n++){ var ph = ((t * .9 + q[1] + n * .5) % 1); s += '<ellipse cx="' + U.r(q[0]) + '" cy="' + (YE + 16) + '" rx="' + U.r(40 + ph * 220) + '" ry="' + U.r(6 + ph * 26) + '" fill="none" stroke="#ffd8c8" stroke-width="' + U.r(3 * (1 - ph) + .5) + '" opacity="' + U.r(.6 * (1 - ph)) + '"/>'; } });
  /* (2) ce qui est AU-DESSUS de l'eau */
  s += '<g clip-path="url(#clSur)">' + drap(false) + '</g>';
  /* la ligne de l'eau sur le drap : un trait clair */
  s += '<path d="M' + U.r(470 + mx) + ' ' + (YE + 2) + ' q 125 -10 250 0 t 250 0" fill="none" stroke="#ffe6da" stroke-width="4" opacity=".7"/>';
  /* les gouttes ROUGES qui tombent du drap, une fois sorti */
  if(sort > .3){ var R3 = U.hasard(881); for(var g = 0; g < 26; g++){ var gx = 500 + mx + R3() * 440, per = .5 + R3() * .6, ph2 = ((t + R3() * per) % per) / per, y0 = my + 330 + R3() * 40, gy = y0 + ph2 * ph2 * (YE - y0 + 20); if(gy > YE + 6) continue;
      s += '<path d="M' + U.r(gx) + ' ' + U.r(gy - 16) + ' C ' + U.r(gx + 7) + ' ' + U.r(gy - 4) + ' ' + U.r(gx + 7) + ' ' + U.r(gy + 6) + ' ' + U.r(gx) + ' ' + U.r(gy + 8) + ' C ' + U.r(gx - 7) + ' ' + U.r(gy + 6) + ' ' + U.r(gx - 7) + ' ' + U.r(gy - 4) + ' ' + U.r(gx) + ' ' + U.r(gy - 16) + ' Z" fill="#c22a36" stroke="#5a0a14" stroke-width="1.5" opacity="' + U.r(sort) + '"/><circle cx="' + U.r(gx - 2) + '" cy="' + U.r(gy) + '" r="1.8" fill="#fff" opacity=".7"/>'; } }
  /* LES AVANT-BRAS ET LES MAINS (nus : les manches sont retroussées) : ils descendent du haut, les doigts serrés sur le drap */
  [[-1, 560], [1, 880]].forEach(function(q){ var sg = q[0], x = q[1] + mx, y = my + tr;
    s += '<path d="M' + U.r(x + sg * 150) + ' -40 L ' + U.r(x + sg * 6) + ' ' + U.r(y - 20) + '" stroke="' + O + '" stroke-width="98" stroke-linecap="round"/><path d="M' + U.r(x + sg * 150) + ' -40 L ' + U.r(x + sg * 6) + ' ' + U.r(y - 20) + '" stroke="#efb88e" stroke-width="88" stroke-linecap="round"/>' +
      '<path d="M' + U.r(x + sg * 170) + ' -40 L ' + U.r(x + sg * 30) + ' ' + U.r(y - 40) + '" stroke="#ffd8b8" stroke-width="16" stroke-linecap="round" opacity=".6"/>' +
      /* le poing fermé sur le tissu : quatre doigts, le pouce */
      '<path d="M' + U.r(x - 52) + ' ' + U.r(y - 30) + ' C ' + U.r(x - 60) + ' ' + U.r(y + 30) + ' ' + U.r(x - 30) + ' ' + U.r(y + 56) + ' ' + U.r(x) + ' ' + U.r(y + 56) + ' C ' + U.r(x + 30) + ' ' + U.r(y + 56) + ' ' + U.r(x + 60) + ' ' + U.r(y + 30) + ' ' + U.r(x + 52) + ' ' + U.r(y - 30) + ' Z" fill="#efb88e" stroke="' + O + '" stroke-width="5" stroke-linejoin="round"/>' +
      '<path d="M' + U.r(x - 26) + ' ' + U.r(y + 10) + ' v 42 M' + U.r(x) + ' ' + U.r(y + 14) + ' v 42 M' + U.r(x + 26) + ' ' + U.r(y + 10) + ' v 42" stroke="#b8764f" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M' + U.r(x - sg * 56) + ' ' + U.r(y - 10) + ' C ' + U.r(x - sg * 40) + ' ' + U.r(y + 8) + ' ' + U.r(x - sg * 10) + ' ' + U.r(y + 14) + ' ' + U.r(x + sg * 14) + ' ' + U.r(y + 4) + '" fill="none" stroke="' + O + '" stroke-width="34" stroke-linecap="round"/><path d="M' + U.r(x - sg * 56) + ' ' + U.r(y - 10) + ' C ' + U.r(x - sg * 40) + ' ' + U.r(y + 8) + ' ' + U.r(x - sg * 10) + ' ' + U.r(y + 14) + ' ' + U.r(x + sg * 14) + ' ' + U.r(y + 4) + '" fill="none" stroke="#f4c49c" stroke-width="25" stroke-linecap="round"/>'; });
  /* la lumière de l'aube, par-dessus tout (elle s'en va quand le soleil monte) */
  if(aube > 0) s += '<rect width="' + W + '" height="' + H + '" fill="#ff9a50" opacity="' + U.r(aube * .26) + '" style="mix-blend-mode:soft-light"/>';
  return s;
};
/* des roseaux tout près de l'objectif, flous, qui se balancent (à l'écran : le bas de l'image) ; cote : -1 à gauche, 1 à droite */
GD.roseaux = function(t, cote, graine, k){
  var R = U.hasard(graine || 5), s = '';
  for(var i = 0; i < 9; i++){ var x = cote < 0 ? R() * 330 : 1440 - R() * 330, h = 260 + R() * 330, b = Math.sin(t * (.8 + R() * .5) + R() * 6) * (16 + R() * 20), e = 7 + R() * 9;
    s += '<path d="M' + U.r(x) + ' 640 Q ' + U.r(x + b * .3) + ' ' + U.r(640 - h * .5) + ' ' + U.r(x + b) + ' ' + U.r(640 - h) + '" fill="none" stroke="#141c12" stroke-width="' + U.r(e) + '" stroke-linecap="round"/>';
    if(R() < .6) s += '<ellipse cx="' + U.r(x + b * .92) + '" cy="' + U.r(640 - h * .93) + '" rx="' + U.r(e * 1.3) + '" ry="' + U.r(e * 4) + '" fill="#2a1c12" transform="rotate(' + U.r(b * .4) + ' ' + U.r(x + b * .92) + ' ' + U.r(640 - h * .93) + ')"/>'; }
  return '<g style="filter:blur(9px)" opacity="' + (k == null ? .92 : k) + '">' + s + '</g>';
};

/* ====================================================================== ENQUÊTE 1 : LA LANTERNE D'OR, LE BUREAU DU MAIRE, LA TÊTE DU MAIRE QUI TOURNE */
/* LA LANTERNE D'OR (repère : le milieu de son pied ; elle fait 290 de haut avec son anneau). Celle du jeu (illus-fin.js), en grand :
   le chapeau et le pied d'or, le verre un peu évasé, deux montants, la lueur ronde au milieu, l'anneau. k : sa lueur (0 : éteinte → 1) */
GD.lanterneOr = function(k, t){
  k = k == null ? 1 : k;
  var s = '', bat = t == null ? 1 : .94 + .06 * Math.sin(t * 2.1) + .03 * Math.sin(t * 5.3);
  /* l'anneau */
  s += '<path d="M-22 -244 a22 24 0 1 1 44 0" fill="none" stroke="' + O + '" stroke-width="13"/><path d="M-22 -244 a22 24 0 1 1 44 0" fill="none" stroke="url(#gdOrX)" stroke-width="8"/>';
  /* le chapeau : un toit d'or à deux étages, ciselé */
  s += '<path d="M-22 -246 L 22 -246 L 30 -232 L -30 -232 Z" fill="url(#gdOr)" stroke="' + O + '" stroke-width="2.4" stroke-linejoin="round"/>' +
    '<path d="M-36 -232 L 36 -232 L 66 -196 L -66 -196 Z" fill="url(#gdOrX)" stroke="' + O + '" stroke-width="2.6" stroke-linejoin="round"/>' +
    '<path d="M-24 -230 L -42 -198 M-8 -230 L -14 -198 M8 -230 L 14 -198 M24 -230 L 42 -198" stroke="#8a5e14" stroke-width="1.6" opacity=".8"/>' +
    '<path d="M-70 -198 L 70 -198 L 66 -184 L -66 -184 Z" fill="url(#gdOr)" stroke="' + O + '" stroke-width="2.4" stroke-linejoin="round"/>';
  for(var i = 0; i < 7; i++) s += '<circle cx="' + (-54 + i * 18) + '" cy="-191" r="2.6" fill="#fff6c0" stroke="#8a5e14" stroke-width=".8"/>';
  /* le verre : il s'évase vers le bas ; dedans, la lueur */
  s += '<path d="M-56 -184 L 56 -184 L 66 -34 L -66 -34 Z" fill="' + (k > .05 ? 'url(#gdVerre)' : '#3a3420') + '" stroke="' + O + '" stroke-width="2.6" stroke-linejoin="round"/>';
  if(k > .05) s += '<circle cx="0" cy="-106" r="' + f(50 * bat) + '" fill="#fff6c8" opacity="' + f(.5 * k) + '"/><circle cx="0" cy="-106" r="' + f(31 * bat) + '" fill="#ffc21f" opacity="' + f(k) + '"/><circle cx="0" cy="-106" r="' + f(17 * bat) + '" fill="#fffbe0" opacity="' + f(k) + '"/>';
  /* les reflets sur le verre, les deux montants et la bague du milieu, ciselés */
  s += '<path d="M-44 -176 L -52 -44 L -40 -44 L -34 -176 Z" fill="#fff" opacity=".3"/><path d="M40 -170 L 46 -90" stroke="#fff" stroke-width="4" opacity=".3" stroke-linecap="round"/>' +
    '<path d="M-21 -184 L -25 -34 M21 -184 L 25 -34" stroke="' + O + '" stroke-width="9"/><path d="M-21 -184 L -25 -34 M21 -184 L 25 -34" stroke="url(#gdOr)" stroke-width="5.4"/>' +
    '<path d="M-56 -184 L -66 -34 M56 -184 L 66 -34" stroke="' + O + '" stroke-width="10"/><path d="M-56 -184 L -66 -34 M56 -184 L 66 -34" stroke="url(#gdOr)" stroke-width="6"/>';
  /* le pied : deux marches d'or, quatre petites boules */
  s += '<path d="M-72 -36 L 72 -36 L 76 -22 L -76 -22 Z" fill="url(#gdOr)" stroke="' + O + '" stroke-width="2.4" stroke-linejoin="round"/><path d="M-78 -22 L 78 -22 L 60 -4 L -60 -4 Z" fill="url(#gdOrX)" stroke="' + O + '" stroke-width="2.6" stroke-linejoin="round"/>' +
    '<path d="M-60 -18 C -40 -12 40 -12 60 -18" fill="none" stroke="#8a5e14" stroke-width="1.6" opacity=".8"/><circle cx="-52" cy="0" r="7" fill="url(#gdOr)" stroke="' + O + '" stroke-width="2"/><circle cx="52" cy="0" r="7" fill="url(#gdOr)" stroke="' + O + '" stroke-width="2"/>' +
    '<path d="M-64 -30 L 64 -30" stroke="#fff6c0" stroke-width="2" opacity=".7"/>';
  return s;
};
/* le coussin de velours rouge où dort la Lanterne (repère : le milieu de son dessous ; 60 de haut) ; creux : la Lanterne n'y est plus, on voit sa place */
GD.coussin = function(creux){
  var s = '<path d="M-150 -6 C -164 -30 -150 -56 -120 -56 C -60 -64 60 -64 120 -56 C 150 -56 164 -30 150 -6 C 100 4 -100 4 -150 -6 Z" fill="url(#gdVelours)" stroke="' + O + '" stroke-width="2.6" stroke-linejoin="round"/>' +
    '<path d="M-130 -46 C -60 -54 60 -54 130 -46" fill="none" stroke="#e88a94" stroke-width="3" opacity=".45"/><path d="M-150 -6 C -100 4 100 4 150 -6" fill="none" stroke="#e8b84a" stroke-width="4"/>';
  [-1, 1].forEach(function(sg){ s += '<path d="M' + (sg * 150) + ' -8 q ' + (sg * 16) + ' 10 ' + (sg * 12) + ' 30 M' + (sg * 150) + ' -8 q ' + (sg * 26) + ' 6 ' + (sg * 28) + ' 26 M' + (sg * 150) + ' -8 q ' + (sg * 6) + ' 12 ' + (sg * -2) + ' 30" fill="none" stroke="#e8b84a" stroke-width="3.4" stroke-linecap="round"/><circle cx="' + (sg * 150) + '" cy="-8" r="7" fill="#e8b84a" stroke="' + O + '" stroke-width="1.8"/>'; });
  if(creux) s += '<ellipse cx="0" cy="-52" rx="74" ry="13" fill="#4a0a14" opacity=".75"/><ellipse cx="0" cy="-50" rx="60" ry="8" fill="#2a0408" opacity=".6"/><path d="M-74 -52 C -40 -64 40 -64 74 -52" fill="none" stroke="#e88a94" stroke-width="2.4" opacity=".5"/>';
  return s;
};
/* l'encrier de verre et sa plume d'oie ; une pile de papiers et un sceau de cire */
GD.encrier = function(){
  return '<path d="M-34 0 L 34 0 L 30 -40 C 30 -52 14 -54 12 -64 L -12 -64 C -14 -54 -30 -52 -30 -40 Z" fill="#26304a" stroke="' + O + '" stroke-width="2.4" stroke-linejoin="round"/><path d="M-22 -36 L -24 -8" stroke="#8aa0d0" stroke-width="4" opacity=".6" stroke-linecap="round"/>' +
    '<rect x="-15" y="-74" width="30" height="12" rx="3" fill="url(#gdOr)" stroke="' + O + '" stroke-width="2"/>' +
    '<path d="M4 -70 C 40 -150 90 -220 130 -250 C 120 -200 80 -130 14 -66 Z" fill="#f4f0e4" stroke="' + O + '" stroke-width="2.2" stroke-linejoin="round"/><path d="M8 -68 C 50 -140 90 -200 126 -246 M50 -130 l 22 -8 M66 -152 l 22 -6 M82 -176 l 20 -4 M40 -116 l -6 -20 M58 -142 l -4 -20" fill="none" stroke="#b8b0a0" stroke-width="1.6"/>';
};
GD.papiers = function(){
  var s = '';
  [[0, 0, -3], [-6, -7, 2], [5, -14, -1], [-2, -21, 4]].forEach(function(q, i){ s += '<path d="M-120 ' + q[1] + ' L 110 ' + (q[1] - 3) + ' L 124 ' + (q[1] - 9) + ' L -108 ' + (q[1] - 7) + ' Z" fill="' + (i === 3 ? '#fbf6e8' : '#e8dfc8') + '" stroke="' + O + '" stroke-width="1.8" stroke-linejoin="round" transform="rotate(' + q[2] + ')"/>'; });
  return s + '<path d="M-80 -26 l 150 -3 M-76 -22 l 120 -2" stroke="#6a5a4a" stroke-width="1.6" opacity=".7"/><circle cx="84" cy="-27" r="13" fill="#b8202e" stroke="' + O + '" stroke-width="2"/><circle cx="84" cy="-27" r="6" fill="none" stroke="#7a0e1a" stroke-width="1.6"/>';
};
/* LE BUREAU (le meuble) : un beau bureau de chêne. Repère : le milieu du bas de sa face avant ; il fait 2·L de large et HB de haut.
   Rend le dessin de sa FACE (vue de face) ; le dessus est dessiné par le film (il est en perspective). */
GD.bureauFace = function(L, HB){
  var s = '<linearGradient id="gdChene" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a6a3e"/><stop offset=".5" stop-color="#7a5030"/><stop offset="1" stop-color="#4a2e1a"/></linearGradient><linearGradient id="gdCheneX" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4a2e1a"/><stop offset=".2" stop-color="#8a5c36"/><stop offset=".8" stop-color="#7a5030"/><stop offset="1" stop-color="#3a2212"/></linearGradient>';
  s += '<rect x="' + (-L) + '" y="' + (-HB) + '" width="' + (L * 2) + '" height="' + HB + '" fill="url(#gdChene)" stroke="' + O + '" stroke-width="3"/><rect x="' + (-L) + '" y="' + (-HB) + '" width="' + (L * 2) + '" height="' + HB + '" fill="url(#tx_bois)"/>';
  /* le plateau qui dépasse, la moulure */
  s += '<rect x="' + (-L - 22) + '" y="' + (-HB - 16) + '" width="' + (L * 2 + 44) + '" height="22" rx="4" fill="url(#gdCheneX)" stroke="' + O + '" stroke-width="3"/><path d="M' + (-L - 16) + ' ' + (-HB - 11) + ' H ' + (L + 16) + '" stroke="#e0b888" stroke-width="2.4" opacity=".6"/>';
  /* trois panneaux moulurés ; celui du milieu porte la lanterne de Brumeval, en marqueterie */
  [-1, 0, 1].forEach(function(k){ var w = L * 2 / 3 - 30, x = k * (L * 2 / 3) - w / 2, y = -HB + 30, h = HB - 70;
    s += '<rect x="' + f(x) + '" y="' + y + '" width="' + f(w) + '" height="' + h + '" rx="6" fill="#6a4426" stroke="' + O + '" stroke-width="2.4"/><rect x="' + f(x + 9) + '" y="' + (y + 9) + '" width="' + f(w - 18) + '" height="' + (h - 18) + '" rx="4" fill="none" stroke="#c89a68" stroke-width="2" opacity=".5"/><rect x="' + f(x) + '" y="' + y + '" width="' + f(w) + '" height="' + h + '" rx="6" fill="url(#tx_bois)"/>';
    if(k === 0) s += '<g transform="translate(0 ' + (y + h / 2 + 40) + ') scale(.42)" opacity=".8"><path d="M-22 -244 a22 24 0 1 1 44 0" fill="none" stroke="#d8a850" stroke-width="10"/><path d="M-36 -232 L 36 -232 L 66 -190 L -66 -190 Z M-56 -184 L 56 -184 L 66 -34 L -66 -34 Z M-78 -30 L 78 -30 L 60 -4 L -60 -4 Z" fill="#d8a850" stroke="#3a2212" stroke-width="5"/><circle cx="0" cy="-106" r="30" fill="#f6dc90"/></g>';
    else s += '<circle cx="' + f(k * (L * 2 / 3)) + '" cy="' + (y + 40) + '" r="11" fill="url(#gdOr)" stroke="' + O + '" stroke-width="2.2"/>'; });
  /* les pieds */
  s += '<rect x="' + (-L) + '" y="-34" width="' + (L * 2) + '" height="34" fill="#4a2e1a" stroke="' + O + '" stroke-width="2.6"/><path d="M' + (-L + 6) + ' -28 H ' + (L - 6) + '" stroke="#c89a68" stroke-width="2" opacity=".4"/>';
  return s;
};
/* LA PENDULE du bureau (repère : le milieu de son cadran, de rayon 100). h : l'heure (0 → 12, avec les minutes en décimales) ; pend : l'angle du balancier */
GD.pendule = function(h, pend){
  var s = '<rect x="-74" y="60" width="148" height="330" rx="10" fill="#5a3a22" stroke="' + O + '" stroke-width="3"/><rect x="-74" y="60" width="148" height="330" rx="10" fill="url(#tx_bois)"/><rect x="-54" y="130" width="108" height="240" rx="6" fill="#1a120c" stroke="' + O + '" stroke-width="2.4"/>' +
    /* le balancier */
    '<g transform="rotate(' + f(pend) + ' 0 110)"><path d="M0 110 L 0 310" stroke="#c8a040" stroke-width="5"/><circle cx="0" cy="318" r="27" fill="url(#gdOr)" stroke="' + O + '" stroke-width="2.4"/><circle cx="-7" cy="310" r="8" fill="#fff" opacity=".5"/></g>' +
    '<path d="M-54 130 L 54 130 L 30 250 L -54 370 Z" fill="#fff" opacity=".07"/>';
  /* la caisse ronde, le cadran */
  s += '<circle r="132" fill="#5a3a22" stroke="' + O + '" stroke-width="3"/><circle r="132" fill="url(#tx_bois)"/><circle r="116" fill="none" stroke="url(#gdOr)" stroke-width="7"/><circle r="104" fill="#f4ecd6" stroke="' + O + '" stroke-width="2.4"/><circle cx="-26" cy="-30" r="70" fill="#fff" opacity=".35"/>';
  for(var i = 0; i < 12; i++){ var a = i * 30; s += '<path d="M0 -96 L 0 ' + (i % 3 ? -84 : -76) + '" stroke="#2a2018" stroke-width="' + (i % 3 ? 4 : 7) + '" transform="rotate(' + a + ')"/>'; }
  var am = (h % 1) * 360, ah = (h % 12) * 30;
  s += '<path d="M0 12 L 0 -54" stroke="#1a120c" stroke-width="10" stroke-linecap="round" transform="rotate(' + f(ah) + ')"/><path d="M0 16 L 0 -86" stroke="#1a120c" stroke-width="6" stroke-linecap="round" transform="rotate(' + f(am) + ')"/><circle r="9" fill="url(#gdOr)" stroke="' + O + '" stroke-width="2"/>';
  /* le fronton sculpté */
  s += '<path d="M-90 -116 C -60 -170 60 -170 90 -116 C 50 -146 -50 -146 -90 -116 Z" fill="#6a4628" stroke="' + O + '" stroke-width="2.6"/>';
  return s;
};
/* LE BRAS DANS L'OMBRE qui prend la Lanterne (repère : la main, fermée sur l'anneau ; le bras part vers (dx, dy)). Une silhouette noire : ni
   manche, ni écharpe, ni taille lisible ; un fil doré sur le bord que la Lanterne éclaire. */
GD.brasOmbre = function(dx, dy){
  var L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
  function P2(a, b){ return f(ux * a + nx * b) + ' ' + f(uy * a + ny * b); }
  return '<path d="M' + P2(20, -34) + ' L ' + P2(L, -70) + ' L ' + P2(L, 70) + ' L ' + P2(20, 34) + ' Z" fill="#0a0810"/><ellipse cx="0" cy="-2" rx="44" ry="38" fill="#0a0810"/><path d="M-30 6 C -34 30 -10 40 4 30 M-6 12 C -8 34 14 40 24 28" fill="none" stroke="#0a0810" stroke-width="22" stroke-linecap="round"/>' +
    '<path d="M' + P2(30, 33) + ' L ' + P2(L * .7, 60) + '" stroke="#ffd070" stroke-width="5" opacity=".8" stroke-linecap="round"/><path d="M-36 22 C -24 40 8 44 28 30" fill="none" stroke="#ffd070" stroke-width="4" opacity=".8" stroke-linecap="round"/>';
};
/* QUELQU'UN QUI COURT, VU DE DOS, loin, dans la nuit (repère : ses pieds ; 420 de haut). Une ombre : on ne voit ni son âge, ni ses habits.
   ph : sa foulée */
GD.coureur = function(ph){
  var s = Math.sin(ph), c = Math.cos(ph), saut = Math.abs(s) * 16, N = '#07060c';
  var g = '<g transform="translate(0 ' + f(-saut) + ')">';
  /* les jambes : l'une pousse, l'autre se replie (le pied monte derrière) */
  [[-1, s], [1, -s]].forEach(function(q){ var k = Math.max(0, q[1]), x = q[0] * 22;
    g += '<path d="M' + x + ' -200 L ' + f(x + q[0] * 6) + ' ' + f(-104 + k * 16) + ' L ' + f(x + q[0] * 4) + ' ' + f(-8 - k * 78) + '" fill="none" stroke="' + N + '" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/>'; });
  /* le corps penché, les bras (l'un tient la lumière devant lui : on ne la voit pas, elle l'entoure), la tête */
  g += '<path d="M-52 -200 C -60 -280 -50 -330 -30 -346 L 30 -346 C 50 -330 60 -280 52 -200 Z" fill="' + N + '"/>' +
    '<path d="M-48 -330 L ' + f(-72 - c * 14) + ' ' + f(-250 + c * 20) + ' L ' + f(-60 - c * 22) + ' ' + f(-196 + c * 30) + '" fill="none" stroke="' + N + '" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M48 -330 L 70 -280 L 54 -250" fill="none" stroke="' + N + '" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="0" cy="-386" rx="38" ry="42" fill="' + N + '"/>';
  return g + '</g>';
};

/* ---------------------------------------------------------------- LA TÊTE DU MAIRE, DE TROIS QUARTS ET DE PROFIL (repère : le bas du cou, comme
   le visage de face de gens.js : la tête monte jusqu'à −98). Dessinée pour regarder vers la DROITE de l'image ; cote = −1 : le dessin en miroir.
   v : {bouche:{o (ouverte)}, yeux:{o, cl}, sourcils:{l (levés)}} */
var PM = ['#ffe2c4', '#f0bf98', '#cf9470', '#9a6448'], POILM = '#c8c8d4';
GD.teteMaire = function(vue, cote, v){
  v = v || {};
  var bo = v.bouche || {}, ye = v.yeux || {}, so = v.sourcils || {}, o2 = U.clamp(bo.o || 0, 0, 1.2), op = U.clamp((ye.o == null ? 1 : ye.o) * (1 - (ye.cl || 0)), 0, 1.5), lev = so.l || 0, s = '';
  var jaw = o2 * 12;
  if(vue === 'profil'){
    /* le cou, derrière */
    s += '<path d="M-22 4 L -18 -30 L 16 -30 L 20 4 Z" fill="' + PM[2] + '" stroke="' + O + '" stroke-width="2"/>';
    /* la touffe grise derrière le crâne */
    s += '<path d="M-30 -84 C -52 -86 -58 -62 -50 -50 C -58 -44 -52 -30 -40 -32 C -34 -44 -30 -64 -30 -84 Z" fill="' + POILM + '" stroke="' + O + '" stroke-width="2"/>';
    /* le crâne et le visage : le front bombé, le creux de l'œil, LE NEZ EN BEC, la lèvre, le menton rond, le double menton */
    s += '<path d="M-34 -52 C -38 -84 -18 -100 6 -99 C 26 -98 38 -86 39 -72 C 40 -66 37 -63 38 -60 C 46 -56 60 -46 62 -38 C 63 -32 54 -30 46 -32 C 44 -29 42 -27 43 -24 C 44 -21 42 -20 41 -' + f(18 - jaw * .2) + ' C 43 ' + f(-12 + jaw) + ' 36 ' + f(-3 + jaw) + ' 22 ' + f(-2 + jaw) + ' C 6 ' + f(0 + jaw * .6) + ' -14 -6 -24 -18 C -30 -28 -33 -40 -34 -52 Z" fill="url(#gPeauMaire)" stroke="' + O + '" stroke-width="2.6" stroke-linejoin="round"/>';
    s += '<path d="M40 -60 C 48 -54 58 -46 60 -39" fill="none" stroke="#fff" stroke-width="3" opacity=".4" stroke-linecap="round"/><ellipse cx="2" cy="-86" rx="14" ry="7" fill="#fff" opacity=".5"/>';
    /* la narine, la joue, les rides du coin de l'œil */
    s += '<path d="M46 -34 C 44 -37 46 -40 50 -39" fill="none" stroke="' + O + '" stroke-width="1.8" stroke-linecap="round"/><ellipse cx="20" cy="-44" rx="9" ry="6" fill="#f08a7a" opacity=".32"/>';
    /* l'œil (un seul), plissé ; son sourcil */
    var ex = 24, ey = -62, hi = 6 * op;
    if(op > .1) s += '<path d="M' + (ex - 9) + ' ' + ey + ' C ' + (ex - 4) + ' ' + f(ey - hi) + ' ' + (ex + 5) + ' ' + f(ey - hi) + ' ' + (ex + 9) + ' ' + ey + ' C ' + (ex + 5) + ' ' + f(ey + 2.4) + ' ' + (ex - 4) + ' ' + f(ey + 2.4) + ' ' + (ex - 9) + ' ' + ey + ' Z" fill="#fbf6ee"/><circle cx="' + f(ex + 4) + '" cy="' + f(ey - .6) + '" r="' + f(Math.min(3.8, hi * .8 + 1)) + '" fill="#7a8a9a"/><circle cx="' + f(ex + 5) + '" cy="' + f(ey - .6) + '" r="1.8" fill="#0a0a10"/><circle cx="' + f(ex + 6) + '" cy="' + f(ey - 2) + '" r="1" fill="#fff"/>';
    s += '<path d="M' + (ex - 10) + ' ' + f(ey + .4) + ' C ' + (ex - 4) + ' ' + f(ey - hi) + ' ' + (ex + 5) + ' ' + f(ey - hi) + ' ' + (ex + 10) + ' ' + f(ey + .4) + '" fill="none" stroke="' + O + '" stroke-width="2.4" stroke-linecap="round"/><path d="M' + (ex - 12) + ' ' + ey + ' l -6 -2 M' + (ex - 12) + ' ' + (ey + 3) + ' l -6 2" stroke="#9a6448" stroke-width="1.2" opacity=".7"/>' +
      '<path d="M' + (ex - 9) + ' ' + f(ey - 12 - lev * 6) + ' C ' + (ex - 2) + ' ' + f(ey - 17 - lev * 7) + ' ' + (ex + 6) + ' ' + f(ey - 16 - lev * 6) + ' ' + (ex + 12) + ' ' + f(ey - 11 - lev * 4) + '" fill="none" stroke="#9a9aa8" stroke-width="4" stroke-linecap="round"/>';
    /* la bouche, de côté : fermée (un trait qui tombe : il est inquiet), ou ouverte (il s'affole) — jamais un sourire */
    if(o2 < .08) s += '<path d="M42 -21 C 36 -21 30 -20 24 -17" fill="none" stroke="' + O + '" stroke-width="2.3" stroke-linecap="round"/>';
    else s += '<path d="M43 -23 C 36 -24 28 -22 22 -17 C 26 ' + f(-13 + jaw) + ' 34 ' + f(-10 + jaw) + ' 41 ' + f(-15 + jaw * .6) + ' Z" fill="#3a0c0a" stroke="' + O + '" stroke-width="2.2" stroke-linejoin="round"/><path d="M27 ' + f(-14 + jaw * .7) + ' C 31 ' + f(-15 + jaw * .7) + ' 36 ' + f(-14 + jaw * .7) + ' 39 ' + f(-14 + jaw * .6) + '" fill="none" stroke="#c0564e" stroke-width="2.4" stroke-linecap="round"/>';
    /* la grosse touffe grise, derrière l'oreille (elle couvre l'arrière du crâne) ; l'oreille ; le favori, devant elle */
    s += '<path d="M-10 -80 C -24 -94 -48 -86 -48 -68 C -58 -60 -54 -44 -44 -42 C -46 -31 -34 -26 -25 -32 C -18 -38 -16 -46 -17 -54 C -21 -62 -18 -72 -10 -80 Z" fill="' + POILM + '" stroke="' + O + '" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M-22 -80 C -32 -76 -38 -68 -38 -58 M-30 -52 C -36 -48 -38 -42 -34 -36" fill="none" stroke="#8e8e9c" stroke-width="1.4" stroke-linecap="round"/><path d="M-30 -84 C -24 -86 -18 -84 -14 -80" fill="none" stroke="#fff" stroke-width="2.4" opacity=".6" stroke-linecap="round"/>' +
      '<path d="M-3 -67 C -17 -71 -20 -52 -11 -45 C -6 -42 0 -47 0 -56 C 0 -61 -1 -65 -3 -67 Z" fill="' + PM[1] + '" stroke="' + O + '" stroke-width="2.2" stroke-linejoin="round"/><path d="M-5 -62 C -12 -62 -13 -54 -8 -50 M-9 -57 C -6 -57 -5 -55 -6 -53" fill="none" stroke="#9a6448" stroke-width="1.4" stroke-linecap="round"/>' +
      '<path d="M0 -64 L 6 -62 C 9 -52 8 -42 5 -33 L 3 -38 L 1 -34 C -1 -42 -1 -52 0 -64 Z" fill="' + POILM + '" stroke="' + O + '" stroke-width="1.6" stroke-linejoin="round"/>';
  } else {
    /* DE TROIS QUARTS : le visage tourné vers la droite ; l'oreille et la grosse touffe du côté gauche, bien visibles ; l'autre touffe à peine */
    s += '<path d="M-20 4 L -17 -24 L 19 -24 L 22 4 Z" fill="' + PM[2] + '" stroke="' + O + '" stroke-width="2"/>';
    /* la touffe de derrière (côté gauche), l'oreille */
    s += '<path d="M-32 -80 C -52 -88 -60 -64 -50 -52 C -58 -46 -52 -34 -42 -38 C -38 -50 -34 -66 -32 -80 Z" fill="' + POILM + '" stroke="' + O + '" stroke-width="2"/>' +
      '<path d="M-28 -66 C -42 -70 -44 -48 -34 -42 L -26 -46 Z" fill="' + PM[1] + '" stroke="' + O + '" stroke-width="2.2"/>';
    /* la tête : plus étroite que de face ; la joue de droite fuit, la pommette de gauche est ronde */
    s += '<path d="M-10 ' + f(-18 + jaw) + ' C -28 -20 -34 -34 -33 -50 C -36 -80 -22 -98 4 -99 C 26 -99 37 -86 37 -64 L 36 -50 C 37 -36 30 ' + f(-22 + jaw * .5) + ' 16 ' + f(-18 + jaw) + ' C 10 ' + f(-14 + jaw) + ' -2 ' + f(-14 + jaw) + ' -10 ' + f(-18 + jaw) + ' Z" fill="url(#gPeauMaire)" stroke="' + O + '" stroke-width="2.6"/>';
    s += '<path d="M-14 ' + f(-16 + jaw) + ' C -4 ' + f(-10 + jaw) + ' 10 ' + f(-10 + jaw) + ' 18 ' + f(-16 + jaw) + '" fill="none" stroke="#9a6448" stroke-width="1.6" opacity=".6"/><ellipse cx="-2" cy="-84" rx="13" ry="7" fill="#fff" opacity=".5"/>';
    /* la touffe de l'autre côté : un petit bout qui dépasse */
    s += '<path d="M35 -76 C 44 -74 46 -60 40 -52 L 36 -54 Z" fill="' + POILM + '" stroke="' + O + '" stroke-width="1.8"/>';
    /* les joues, les rides du front */
    s += '<ellipse cx="-14" cy="-48" rx="9" ry="5.5" fill="#f08a7a" opacity=".32"/><ellipse cx="27" cy="-48" rx="5" ry="5" fill="#f08a7a" opacity=".28"/><path d="M-10 -80 C 0 -83 14 -83 24 -80 M-6 -86 C 2 -88 12 -88 20 -86" fill="none" stroke="#9a6448" stroke-width="1.3" opacity=".55"/>';
    /* les yeux : celui de gauche (près de nous) plus grand, celui de droite plus étroit, près du bord */
    [[-3, 12, 0], [23, 7.5, 1]].forEach(function(q){ var cx = q[0], w = q[1], cy = -62, hi2 = 6.2 * op * .72, hb = 2.6;
      var forme = 'M' + f(cx - w) + ' ' + cy + ' C ' + f(cx - w * .5) + ' ' + f(cy - hi2) + ' ' + f(cx + w * .5) + ' ' + f(cy - hi2) + ' ' + f(cx + w) + ' ' + cy + ' C ' + f(cx + w * .5) + ' ' + f(cy + hb) + ' ' + f(cx - w * .5) + ' ' + f(cy + hb) + ' ' + f(cx - w) + ' ' + cy + ' Z', idc = 'tqm' + q[2];
      if(op > .1) s += '<clipPath id="' + idc + '"><path d="' + forme + '"/></clipPath><path d="' + forme + '" fill="#fbf6ee"/><g clip-path="url(#' + idc + ')"><circle cx="' + f(cx + w * .34) + '" cy="' + f(cy - .4) + '" r="4" fill="#7a8a9a"/><circle cx="' + f(cx + w * .34) + '" cy="' + f(cy - .4) + '" r="1.9" fill="#0a0a10"/><circle cx="' + f(cx + w * .34 + 1.2) + '" cy="' + f(cy - 1.8) + '" r="1" fill="#fff"/></g>';
      s += '<path d="M' + f(cx - w - .5) + ' ' + f(cy + .3) + ' C ' + f(cx - w * .5) + ' ' + f(cy - hi2) + ' ' + f(cx + w * .5) + ' ' + f(cy - hi2) + ' ' + f(cx + w + 1) + ' ' + f(cy + .4) + '" fill="none" stroke="' + O + '" stroke-width="2.4" stroke-linecap="round"/>' +
        '<path d="M' + f(cx - w) + ' ' + f(cy - 11 - lev * 6) + ' C ' + f(cx - w * .3) + ' ' + f(cy - 16 - lev * 7) + ' ' + f(cx + w * .4) + ' ' + f(cy - 16 - lev * 6) + ' ' + f(cx + w + 2) + ' ' + f(cy - 11 - lev * 4) + '" fill="none" stroke="#9a9aa8" stroke-width="4" stroke-linecap="round"/>'; });
    /* le nez en bec, tourné vers la droite : il dépasse sur la joue qui fuit */
    s += '<path d="M9 -70 C 12 -62 22 -54 32 -46 C 37 -41 34 -35 26 -36 C 22 -33 14 -34 11 -38 C 9 -42 11 -45 14 -45" fill="' + PM[1] + '" stroke="' + O + '" stroke-width="2.2" stroke-linejoin="round"/><ellipse cx="24" cy="-51" rx="2.4" ry="5" fill="#fff" opacity=".45" transform="rotate(-38 24 -51)"/>';
    /* la bouche, décalée vers la droite : un trait qui tombe, ou un « oh » inquiet — jamais un sourire */
    if(o2 < .08) s += '<path d="M-5 -24 C 4 -28 16 -28 25 -24" fill="none" stroke="' + O + '" stroke-width="2.3" stroke-linecap="round"/>';
    else s += '<path d="M-3 -24 C 0 -31 20 -31 24 -24 C 22 ' + f(-17 + jaw) + ' 0 ' + f(-17 + jaw) + ' -3 -24 Z" fill="#3a0c0a" stroke="' + O + '" stroke-width="2.2" stroke-linejoin="round"/><path d="M4 ' + f(-18 + jaw * .8) + ' C 9 ' + f(-20 + jaw * .8) + ' 14 ' + f(-20 + jaw * .8) + ' 18 ' + f(-18 + jaw * .8) + '" fill="none" stroke="#c0564e" stroke-width="2.6" stroke-linecap="round"/>';
    /* le favori du côté gauche */
    s += '<path d="M-31 -76 C -37 -62 -36 -44 -28 -34 C -22 -42 -24 -60 -26 -74 Z" fill="' + POILM + '" stroke="' + O + '" stroke-width="1.8"/>';
  }
  return cote < 0 ? '<g transform="scale(-1 1)">' + s + '</g>' : s;
};
})();
