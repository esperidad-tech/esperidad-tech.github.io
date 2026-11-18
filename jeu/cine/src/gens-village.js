/* gens-village.js — LES VILLAGEOIS DE BRUMEVAL, vus de face, pour les films (le rassemblement au Vieux Chêne ; Bible §12.63).
   Les mêmes pantins que le maire et Silas (gens.js, pantin.js) ; chacun reprend son dessin du village (persos.js : la peau,
   les cheveux, les yeux, l'habit, le chapeau) en plus détaillé :
     gaspard   le boulanger : costaud, la moustache, la toque, la chemise aux manches retroussées, le grand tablier blanc, de la farine
     margot    la tavernière : le chignon brun, les joues rouges, le corsage rouge, les manches bouffantes, le tablier blanc
     iris      l'herboriste : de longs cheveux blonds, des fleurs dans les cheveux, la robe verte et son tablier vert clair
     basile    le jardinier : costaud, la barbe courte, le chapeau de paille, la salopette bleue
     farinel   le meunier : rond, des boucles blondes, le bonnet de meunier, plein de farine
     melusine  la couturière : le chignon roux, la robe verte sombre, l'écharpe rouge, le mètre ruban autour du cou
     fortune   le colporteur : la barbe frisée, le chapeau rouge à plume, le manteau rouge, le gilet jaune à carreaux
   Gens.dessin(nom, pose, o) — o : {tient:{D:'lanterne' | 'torche' | 'rouleau', G:…}, lanterne (0 → 1), ombre (0 → 1 : une silhouette
   de plus en plus noire, pour ceux du fond)}. Ce qu'ils tiennent : Gens.OBJETS (la lanterne est dans gens.js). */
(function(){
'use strict';
var U = window.CU, G = window.Gens, PT = window.Pantin, M = PT.M, _ = G._, O = _.O, OL = _.OL, f = _.f, lin = _.lin, rad = _.rad, X = _.X;

/* ---------------------------------------------------------------- les couleurs */
function hex(c){ return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
function vers(c, k){ var a = hex(c), b = k > 0 ? [255, 255, 255] : [0, 0, 0], q = Math.abs(k); return '#' + a.map(function(v, i){ return ('0' + Math.round(U.lerp(v, b[i], q)).toString(16)).slice(-2); }).join(''); }
function tons(c){ return [vers(c, .22), c, vers(c, -.42)]; }
var PEAU = {p1:['#fff1e6', '#f7caa6', '#e8ad89', '#c98a66'], p2:['#ffe7d2', '#efb88e', '#d9976d', '#b8764f'], p3:['#f8d8b0', '#dea575', '#c48652', '#9c663a'], p4:['#eec899', '#c7935c', '#a77441', '#80552c']};
var POIL = {brun:'#6a3a1c', chatain:'#946638', noir:'#262738', blond:'#e8c058', roux:'#d05c26', gris:'#a9aab8', blanc:'#e4e7f0'};
var IRISC = {marron:'#7a4420', noisette:'#8a6a1c', violet:'#7a3fd0', bleu:'#2f6fd0', vert:'#1f9150', gris:'#5f6f86', ambre:'#c47a10'};

var CORPS = {
  normal:{taille:[0, -246], hanche:[30, 30], epaule:[66, -138], cou:[0, -162], bras:86, avant:80, cuisse:102, tibia:114, tw:52, ventre:0},
  costaud:{taille:[0, -250], hanche:[34, 30], epaule:[78, -142], cou:[0, -166], bras:88, avant:82, cuisse:104, tibia:116, tw:60, ventre:4},
  rond:{taille:[0, -236], hanche:[36, 30], epaule:[72, -134], cou:[0, -158], bras:84, avant:78, cuisse:96, tibia:110, tw:66, ventre:14},
  femme:{taille:[0, -240], hanche:[28, 28], epaule:[58, -132], cou:[0, -156], bras:82, avant:76, cuisse:100, tibia:112, tw:42, ventre:0}
};

/* ---------------------------------------------------------------- LES VILLAGEOIS */
var V = G.VILLAGEOIS = {
  gaspard:{corps:'costaud', peau:'p3', poil:'brun', iris:'marron', nez:'rond', moustache:true, sourcilE:5.4, coiffe:'toque', cheveux:'court',
    haut:'#f4f0e6', manches:'retroussees', bas:'#6a5440', tablier:'#fbf8f0', bottes:'#4a3424', farine:true, joues:.3},
  margot:{corps:'femme', peau:'p3', poil:'brun', iris:'noisette', nez:'fin', cheveux:'chignon', haut:'#a8302a', chemise:'#f4ecd8', manches:'bouffantes', jupe:'#8a2622', tablier:'#fbf8f0', joues:.6, bottes:'#3a2a22'},
  iris:{corps:'femme', peau:'p2', poil:'blond', iris:'violet', nez:'fin', cheveux:'longs', fleurs:true, haut:'#4a8a4a', chemise:'#f4ecd8', manches:'longues', jupe:'#3f7a40', tablier:'#7ab86a', joues:.3, bottes:'#4a3a2a'},
  basile:{corps:'costaud', peau:'p4', poil:'chatain', iris:'noisette', nez:'droit', barbeCourte:true, coiffe:'paille', cheveux:'court',
    haut:'#e8d8b0', manches:'retroussees', bas:'#3f5f9a', salopette:'#3f5f9a', bottes:'#3a2c20', joues:.22},
  farinel:{corps:'rond', peau:'p2', poil:'blond', iris:'bleu', nez:'rond', cheveux:'boucles', coiffe:'bonnet', haut:'#d8ccb0', manches:'longues', bas:'#8a7a5e', tablier:'#efe8d6', bottes:'#5a4630', farine:true, joues:.4},
  melusine:{corps:'femme', peau:'p1', poil:'roux', iris:'vert', nez:'fin', cheveux:'chignon', haut:'#2f7a5a', chemise:'#f4e6d0', manches:'longues', jupe:'#286a4e', echarpe:'#d03a3a', metre:true, joues:.25, bottes:'#3a2a22'},
  fortune:{corps:'normal', peau:'p4', poil:'noir', iris:'ambre', nez:'droit', barbeFrisee:true, coiffe:'plume', cheveux:'court', haut:'#c8302a', manches:'longues', gilet:'#f2c040', bas:'#4a3a4a', bottes:'#2a2228', joues:.2},
  /* (les films de début d'enquête, Bible §13.69) Victor le facteur, Anselme le sonneur, et deux lavandières (elles n'ont pas de nom) */
  victor:{corps:'normal', peau:'p3', poil:'brun', iris:'marron', nez:'droit', barbeCourte:true, coiffe:'facteur', cheveux:'court', haut:'#2f4f9a', chemise:'#e8eef8', manches:'longues', bas:'#26386a', bottes:'#2a2228', joues:.2},
  anselme:{corps:'normal', peau:'p2', poil:'blanc', iris:'gris', nez:'rond', cheveux:'court', sourcilE:5.6, haut:'#6a4a3a', chemise:'#e8dcc0', manches:'longues', bas:'#4a3a2e', bottes:'#3a2a20', joues:.3},
  lavandiere:{corps:'femme', peau:'p2', poil:'chatain', iris:'bleu', nez:'fin', cheveux:'chignon', coiffe:'fichu', fichu:'#f4efe2', haut:'#5a7aa8', chemise:'#f4ecd8', manches:'bouffantes', jupe:'#48648c', tablier:'#f6f1e4', joues:.5, bottes:'#4a3a2a'},
  lavandiere2:{corps:'femme', peau:'p3', poil:'noir', iris:'marron', nez:'fin', cheveux:'chignon', coiffe:'fichu', fichu:'#c8503a', haut:'#8a6a3e', chemise:'#f4ecd8', manches:'bouffantes', jupe:'#6a5236', tablier:'#f6f1e4', joues:.4, bottes:'#3a2a22'}
};
Object.keys(V).forEach(function(n){ G.D[n] = CORPS[V[n].corps]; });

/* les dégradés de chacun */
G.DEFS_PLUS.push(function(){
  var d = '';
  Object.keys(PEAU).forEach(function(p){ d += rad('gvPeau_' + p, PEAU[p], .5, .38, .72) + lin('gvPeauX_' + p, X(PEAU[p]), 0, 0, 1, 0); });
  Object.keys(V).forEach(function(n){
    var s = V[n];
    ['haut', 'bas', 'jupe', 'tablier', 'salopette', 'gilet', 'chemise', 'bottes', 'echarpe'].forEach(function(k){ if(s[k]) d += lin('gv_' + n + '_' + k, X(tons(s[k])), 0, 0, 1, 0); });
    d += lin('gvPoil_' + n, [vers(POIL[s.poil], .3), POIL[s.poil], vers(POIL[s.poil], -.45)], .3, 0, .7, 1);
  });
  d += lin('gvBoisX', ['#5a3a1c', '#b0804a', '#e0b070', '#b0804a', '#5a3a1c'], 0, 0, 0, 1) + lin('gvPaille', ['#f6e4a0', '#e0c060', '#a8862c'], .5, 0, .5, 1) + lin('gvBlanc', ['#ffffff', '#f2eee4', '#cfc8ba'], .5, 0, .5, 1);
  d += rad('gvFlamme', ['#fff6c8', '#ffc24a', '#ff7a1a', 'rgba(255,90,10,0)'], .5, .6, .6);
  return d;
});

function u(n, k){ return 'url(#gv_' + n + '_' + k + ')'; }
function torse(D){
  var e = D.epaule[0] + 6, c = D.cou[1], tw = D.tw, v = D.ventre, ye = D.epaule[1] + 12;
  return 'M' + (-tw) + ' 6 C ' + (-tw - 6 - v) + ' -34 ' + (-e + 2 - v * .4) + ' -80 ' + (-e) + ' ' + ye + ' C ' + (-e) + ' ' + (ye - 16) + ' ' + f(-e * .8) + ' ' + (c + 12) + ' -24 ' + (c) + ' L 24 ' + (c) + ' C ' + f(e * .8) + ' ' + (c + 12) + ' ' + e + ' ' + (ye - 16) + ' ' + e + ' ' + ye + ' C ' + (e - 2 + v * .4) + ' -80 ' + (tw + 6 + v) + ' -34 ' + tw + ' 6 Z';
}
function farine(pts){ return '<g fill="#fff" opacity=".75">' + pts.map(function(p){ return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + p[2] + '"/>'; }).join('') + '</g>'; }

/* ---------------------------------------------------------------- les pièces d'un villageois */
function pieces(nom, o){
  var s = V[nom], D = G.D[nom], peauX = 'url(#gvPeauX_' + s.peau + ')', c = D.cou[1], tw = D.tw, femme = s.corps === 'femme';
  var P = {};
  P.buste = function(){
    var r = '<path d="' + torse(D) + '" fill="' + u(nom, 'haut') + '" stroke="' + O + '" stroke-width="' + OL + '"/>';
    /* le col : la chemise (les femmes : le haut du corsage ouvert sur la chemise), le cou */
    if(s.chemise) r += '<path d="M-22 ' + (c + 2) + ' L 22 ' + (c + 2) + ' L 16 ' + (c + 40) + ' C 6 ' + (c + 48) + ' -6 ' + (c + 48) + ' -16 ' + (c + 40) + ' Z" fill="' + u(nom, 'chemise') + '" stroke="' + O + '" stroke-width="2"/>' +
      '<path d="M-10 ' + (c + 30) + ' L 10 ' + (c + 44) + ' M10 ' + (c + 30) + ' L -10 ' + (c + 44) + ' M-9 ' + (c + 46) + ' L 9 ' + (c + 60) + ' M9 ' + (c + 46) + ' L -9 ' + (c + 60) + '" stroke="' + vers(s.haut, -.5) + '" stroke-width="1.8"/>';
    else r += '<path d="M-17 ' + (c + 2) + ' L 0 ' + (c + 34) + ' L 17 ' + (c + 2) + ' Z" fill="' + peauX + '" stroke="' + O + '" stroke-width="2"/>';
    if(s.gilet) r += '<path d="M-20 ' + (c + 4) + ' L -4 ' + (c + 60) + ' L -3 6 L ' + (-tw + 6) + ' 6 C ' + (-tw - 2) + ' -50 ' + (-tw) + ' ' + (c + 60) + ' -20 ' + (c + 4) + ' Z M20 ' + (c + 4) + ' L 4 ' + (c + 60) + ' L 3 6 L ' + (tw - 6) + ' 6 C ' + (tw + 2) + ' -50 ' + tw + ' ' + (c + 60) + ' 20 ' + (c + 4) + ' Z" fill="' + u(nom, 'gilet') + '" stroke="' + O + '" stroke-width="2"/>' +
      '<path d="M-38 -110 L -8 -116 M-44 -70 L -6 -78 M-46 -30 L -5 -38 M-30 ' + (c + 30) + ' L -24 0 M30 ' + (c + 30) + ' L 24 0 M8 -116 L 38 -110 M6 -78 L 44 -70 M5 -38 L 46 -30" stroke="#c0392b" stroke-width="2.4" opacity=".85"/>';
    if(s.salopette) r += '<path d="M-30 ' + (c + 70) + ' L 30 ' + (c + 70) + ' L ' + (tw - 8) + ' 6 L ' + (-tw + 8) + ' 6 Z" fill="' + u(nom, 'salopette') + '" stroke="' + O + '" stroke-width="2.2"/>' +
      '<path d="M-26 ' + (c + 72) + ' L -36 ' + (c + 12) + ' M26 ' + (c + 72) + ' L 36 ' + (c + 12) + '" stroke="' + s.salopette + '" stroke-width="12"/><path d="M-26 ' + (c + 72) + ' L -36 ' + (c + 12) + ' M26 ' + (c + 72) + ' L 36 ' + (c + 12) + '" fill="none" stroke="' + vers(s.salopette, -.4) + '" stroke-width="1.6" stroke-dasharray="5 4"/>' +
      '<circle cx="-24" cy="' + (c + 78) + '" r="4.5" fill="url(#gOr)" stroke="' + O + '" stroke-width="1.4"/><circle cx="24" cy="' + (c + 78) + '" r="4.5" fill="url(#gOr)" stroke="' + O + '" stroke-width="1.4"/>' +
      '<path d="M-16 -70 L 16 -70 L 16 -40 L -16 -40 Z" fill="' + vers(s.salopette, -.14) + '" stroke="' + O + '" stroke-width="1.8"/>';
    if(s.tablier && !femme) r += '<path d="M-30 ' + (c + 64) + ' C -10 ' + (c + 58) + ' 10 ' + (c + 58) + ' 30 ' + (c + 64) + ' L ' + (tw - 6) + ' 6 L ' + (-tw + 6) + ' 6 Z" fill="' + u(nom, 'tablier') + '" stroke="' + O + '" stroke-width="2.2"/>' +
      '<path d="M-28 ' + (c + 64) + ' L -20 ' + (c + 6) + ' M28 ' + (c + 64) + ' L 20 ' + (c + 6) + '" stroke="' + s.tablier + '" stroke-width="6"/><path d="M-28 ' + (c + 64) + ' L -20 ' + (c + 6) + ' M28 ' + (c + 64) + ' L 20 ' + (c + 6) + '" fill="none" stroke="' + O + '" stroke-width="1" opacity=".5"/>';
    if(femme){
      /* le corsage lacé, serré à la taille ; la ceinture du tablier */
      r += '<path d="M' + (-tw) + ' 6 C ' + (-tw - 5) + ' -30 ' + (-tw - 9) + ' -60 ' + (-tw - 10) + ' -78 M' + tw + ' 6 C ' + (tw + 5) + ' -30 ' + (tw + 9) + ' -60 ' + (tw + 10) + ' -78" fill="none" stroke="' + vers(s.haut, -.5) + '" stroke-width="2" opacity=".7"/>';
      if(s.tablier) r += '<path d="M' + (-tw - 1) + ' -8 L ' + (tw + 1) + ' -8 L ' + (tw + 1) + ' 6 L ' + (-tw - 1) + ' 6 Z" fill="' + u(nom, 'tablier') + '" stroke="' + O + '" stroke-width="1.8"/>';
    }
    if(s.echarpe) r += '<path d="M-30 ' + (c + 4) + ' C -16 ' + (c + 26) + ' 16 ' + (c + 26) + ' 30 ' + (c + 4) + ' L 34 ' + (c + 18) + ' C 16 ' + (c + 42) + ' -16 ' + (c + 42) + ' -34 ' + (c + 18) + ' Z" fill="' + u(nom, 'echarpe') + '" stroke="' + O + '" stroke-width="2.2"/>' +
      '<path d="M12 ' + (c + 32) + ' L 22 ' + (c + 96) + ' L 6 ' + (c + 94) + ' L 0 ' + (c + 36) + ' Z" fill="' + u(nom, 'echarpe') + '" stroke="' + O + '" stroke-width="2"/><path d="M8 ' + (c + 84) + ' L 21 ' + (c + 86) + ' M-20 ' + (c + 20) + ' l 0 9 M-8 ' + (c + 26) + ' l 0 9 M8 ' + (c + 26) + ' l 0 9 M20 ' + (c + 20) + ' l 0 9" stroke="#9a2020" stroke-width="1.6"/>';
    if(s.metre) r += '<path d="M-30 ' + (c + 16) + ' C -34 -70 -30 -30 -24 0 L -15 0 C -20 -30 -24 -70 -21 ' + (c + 22) + ' Z M30 ' + (c + 16) + ' C 34 -70 30 -30 24 0 L 15 0 C 20 -30 24 -70 21 ' + (c + 22) + ' Z" fill="#f2d24a" stroke="' + O + '" stroke-width="1.6"/>' +
      '<path d="M-29 -100 h6 M-28 -84 h6 M-27 -68 h6 M-26 -52 h6 M-24 -36 h6 M-22 -20 h6 M23 -100 h6 M22 -84 h6 M21 -68 h6 M20 -52 h6 M18 -36 h6 M16 -20 h6" stroke="' + O + '" stroke-width="1.2"/>';
    if(s.farine) r += farine([[-34, -70, 4], [-20, -40, 3], [30, -84, 5], [38, -50, 3], [-8, -22, 3.5], [14, -104, 3], [-44, -100, 3]]);
    /* le cou */
    r += '<path d="M' + (femme ? -15 : -20) + ' ' + (c + 8) + ' C ' + (femme ? -15 : -20) + ' ' + (c - 4) + ' ' + (femme ? -13 : -18) + ' ' + (c - 12) + ' ' + (femme ? -12 : -16) + ' ' + (c - 18) + ' L ' + (femme ? 12 : 16) + ' ' + (c - 18) + ' C ' + (femme ? 13 : 18) + ' ' + (c - 12) + ' ' + (femme ? 15 : 20) + ' ' + (c - 4) + ' ' + (femme ? 15 : 20) + ' ' + (c + 8) + '" fill="' + peauX + '" stroke="' + O + '" stroke-width="2"/>';
    return r;
  };
  P.bassin = function(){
    if(femme) return '';   /* (la jupe couvre tout : P.jupe) */
    var r = '<path d="M' + (-tw + 2) + ' -4 L ' + (tw - 2) + ' -4 C ' + (tw + 2) + ' 14 ' + (tw + 2) + ' 30 ' + (tw - 2) + ' 44 L 0 52 L ' + (-tw + 2) + ' 44 C ' + (-tw - 2) + ' 30 ' + (-tw - 2) + ' 14 ' + (-tw + 2) + ' -4 Z" fill="' + u(nom, 'bas') + '" stroke="' + O + '" stroke-width="' + OL + '"/>';
    /* le grand tablier, qui descend sur les cuisses */
    if(s.tablier) r += '<path d="M' + (-tw + 6) + ' -6 L ' + (tw - 6) + ' -6 C ' + (tw - 2) + ' 40 ' + (tw - 4) + ' 90 ' + (tw - 8) + ' 124 C ' + f(tw * .3) + ' 130 ' + f(-tw * .3) + ' 130 ' + (-tw + 8) + ' 124 C ' + (-tw + 4) + ' 90 ' + (-tw + 2) + ' 40 ' + (-tw + 6) + ' -6 Z" fill="' + u(nom, 'tablier') + '" stroke="' + O + '" stroke-width="2.2"/>' +
      '<path d="M-14 0 C -16 40 -16 86 -14 124 M16 0 C 18 40 18 86 15 124" fill="none" stroke="' + vers(s.tablier, -.3) + '" stroke-width="1.8" opacity=".7"/>' + (s.farine ? farine([[-20, 30, 4], [10, 60, 5], [24, 20, 3], [-8, 96, 4]]) : '');
    if(s.gilet || s.salopette || !s.tablier) r += '<path d="M' + (-tw) + ' -8 L ' + tw + ' -8 L ' + tw + ' 5 L ' + (-tw) + ' 5 Z" fill="url(#gCuir)" stroke="' + O + '" stroke-width="2"/><rect x="-8" y="-11" width="16" height="19" rx="2" fill="url(#gOr)" stroke="' + O + '" stroke-width="1.6"/>';
    return r;
  };
  /* la jupe (du tour de taille jusqu'aux chevilles ; elle suit les pieds) et, par-dessus, le tablier */
  P.jupe = !femme ? null : function(os){
    var t1 = M.pt(os.bassin, -tw, -2), t2 = M.pt(os.bassin, tw, -2), pG = os.piedG, pD = os.piedD;
    var bg = Math.min(pG[0], -40) - 46, bd = Math.max(pD[0], 40) + 46, by = -22, mx = (bg + bd) / 2;
    var r = '<path d="M' + f(t1[0]) + ' ' + f(t1[1]) + ' C ' + f(t1[0] - 26) + ' ' + f(t1[1] + 50) + ' ' + f(bg + 4) + ' ' + f(by - 110) + ' ' + f(bg) + ' ' + f(by) + ' C ' + f(bg + 40) + ' ' + f(by + 10) + ' ' + f(mx - 20) + ' ' + f(by + 4) + ' ' + f(mx) + ' ' + f(by + 9) + ' C ' + f(mx + 20) + ' ' + f(by + 4) + ' ' + f(bd - 40) + ' ' + f(by + 10) + ' ' + f(bd) + ' ' + f(by) +
      ' C ' + f(bd - 4) + ' ' + f(by - 110) + ' ' + f(t2[0] + 26) + ' ' + f(t2[1] + 50) + ' ' + f(t2[0]) + ' ' + f(t2[1]) + ' Z" fill="' + u(nom, 'jupe') + '" stroke="' + O + '" stroke-width="' + OL + '"/>';
    r += '<path d="M' + f(t1[0] + 8) + ' ' + f(t1[1] + 14) + ' C ' + f(t1[0] - 8) + ' ' + f(t1[1] + 90) + ' ' + f(bg + 26) + ' ' + f(by - 70) + ' ' + f(bg + 24) + ' ' + f(by) + ' M' + f(t2[0] - 8) + ' ' + f(t2[1] + 14) + ' C ' + f(t2[0] + 8) + ' ' + f(t2[1] + 90) + ' ' + f(bd - 26) + ' ' + f(by - 70) + ' ' + f(bd - 24) + ' ' + f(by) + ' M' + f(mx - 30) + ' ' + f(t1[1] + 60) + ' C ' + f(mx - 36) + ' ' + f(by - 80) + ' ' + f(mx - 40) + ' ' + f(by - 30) + ' ' + f(mx - 42) + ' ' + f(by + 4) + ' M' + f(mx + 30) + ' ' + f(t1[1] + 60) + ' C ' + f(mx + 36) + ' ' + f(by - 80) + ' ' + f(mx + 40) + ' ' + f(by - 30) + ' ' + f(mx + 42) + ' ' + f(by + 4) + '" fill="none" stroke="' + vers(s.jupe, -.5) + '" stroke-width="2" opacity=".7"/>';
    if(s.tablier){
      var a1 = M.pt(os.bassin, -tw + 8, 0), a2 = M.pt(os.bassin, tw - 8, 0), ay = by - 56, ag = U.lerp(a1[0], bg, .55), ad = U.lerp(a2[0], bd, .55);
      r += '<path d="M' + f(a1[0]) + ' ' + f(a1[1]) + ' C ' + f(a1[0] - 10) + ' ' + f(a1[1] + 50) + ' ' + f(ag) + ' ' + f(ay - 60) + ' ' + f(ag) + ' ' + f(ay) + ' C ' + f(ag + 20) + ' ' + f(ay + 8) + ' ' + f(ad - 20) + ' ' + f(ay + 8) + ' ' + f(ad) + ' ' + f(ay) + ' C ' + f(ad) + ' ' + f(ay - 60) + ' ' + f(a2[0] + 10) + ' ' + f(a2[1] + 50) + ' ' + f(a2[0]) + ' ' + f(a2[1]) + ' Z" fill="' + u(nom, 'tablier') + '" stroke="' + O + '" stroke-width="2.2"/>' +
        '<path d="M' + f(mx - 14) + ' ' + f(a1[1] + 10) + ' C ' + f(mx - 18) + ' ' + f(ay - 70) + ' ' + f(mx - 20) + ' ' + f(ay - 30) + ' ' + f(mx - 20) + ' ' + f(ay + 4) + ' M' + f(mx + 16) + ' ' + f(a1[1] + 10) + ' C ' + f(mx + 20) + ' ' + f(ay - 70) + ' ' + f(mx + 22) + ' ' + f(ay - 30) + ' ' + f(mx + 22) + ' ' + f(ay + 4) + '" fill="none" stroke="' + vers(s.tablier, -.3) + '" stroke-width="1.8" opacity=".7"/>' +
        '<path d="M' + f(ag + 30) + ' ' + f(ay - 70) + ' l 30 0 l 0 30 l -30 0 Z" fill="' + vers(s.tablier, -.08) + '" stroke="' + O + '" stroke-width="1.6"/>';
    }
    return r;
  };
  P.brasHaut = function(){
    var bouf = s.manches === 'bouffantes', coul = bouf ? u(nom, 'chemise') : u(nom, 'haut'), L = D.bras + 4, w = femme ? 19 : s.corps === 'normal' ? 22 : 25;
    if(bouf) return '<path d="M' + (-w - 3) + ' -4 C ' + (-w - 2) + ' -24 ' + (w + 4) + ' -26 ' + (w + 6) + ' -4 C ' + (w + 10) + ' 26 ' + (w + 4) + ' 54 ' + (w - 2) + ' ' + (L - 20) + ' L ' + (-w + 2) + ' ' + (L - 20) + ' C ' + (-w - 4) + ' 54 ' + (-w - 8) + ' 26 ' + (-w - 3) + ' -4 Z" fill="' + coul + '" stroke="' + O + '" stroke-width="' + OL + '"/>' +
      '<path d="M' + (-w + 2) + ' ' + (L - 20) + ' L ' + (w - 2) + ' ' + (L - 20) + ' L ' + (w - 4) + ' ' + L + ' L ' + (-w + 4) + ' ' + L + ' Z" fill="' + peauX + '" stroke="' + O + '" stroke-width="2.2"/><path d="M-4 0 C -10 20 -8 44 -4 ' + (L - 24) + ' M10 2 C 16 22 12 46 8 ' + (L - 24) + '" fill="none" stroke="#b8ae98" stroke-width="1.8" opacity=".7"/>';
    return '<path d="M' + (-w) + ' -6 C ' + (-w + 8) + ' -22 ' + (w - 10) + ' -24 ' + w + ' -8 C ' + (w + 4) + ' 20 ' + (w + 2) + ' 60 ' + (w - 3) + ' ' + L + ' L ' + (-w + 4) + ' ' + L + ' C ' + (-w) + ' 60 ' + (-w - 4) + ' 20 ' + (-w) + ' -6 Z" fill="' + coul + '" stroke="' + O + '" stroke-width="' + OL + '"/>' +
      '<path d="M' + f(w * .3) + ' 4 C ' + f(w * .5) + ' 30 ' + f(w * .45) + ' 60 ' + f(w * .3) + ' ' + (L - 6) + '" fill="none" stroke="' + vers(s.haut, -.5) + '" stroke-width="1.8" opacity=".5"/>';
  };
  P.avantBras = function(){
    var nu = s.manches === 'retroussees' || s.manches === 'bouffantes', L = D.avant, w = femme ? 16 : s.corps === 'normal' ? 18 : 21;
    if(nu) return '<path d="M' + (-w) + ' -6 C ' + (-w - 3) + ' 26 ' + (-w + 1) + ' 54 ' + (-w + 4) + ' ' + (L + 2) + ' L ' + (w - 4) + ' ' + (L + 2) + ' C ' + (w - 1) + ' 54 ' + (w + 3) + ' 26 ' + w + ' -6 Z" fill="' + peauX + '" stroke="' + O + '" stroke-width="' + OL + '"/>' +
      (s.manches === 'retroussees' ? '<path d="M' + (-w - 3) + ' -8 L ' + (w + 3) + ' -8 L ' + (w + 3) + ' 10 L ' + (-w - 3) + ' 10 Z" fill="' + u(nom, 'haut') + '" stroke="' + O + '" stroke-width="2.2"/>' : '') +
      (!femme ? '<path d="M-4 24 l 2 8 M4 36 l 2 8 M-2 50 l 2 7" stroke="' + PEAU[s.peau][3] + '" stroke-width="1.3" opacity=".5"/>' : '');
    return '<path d="M' + (-w) + ' -6 C ' + (-w - 2) + ' 30 ' + (-w) + ' 58 ' + (-w + 2) + ' ' + (L - 2) + ' L ' + (w - 2) + ' ' + (L - 2) + ' C ' + w + ' 58 ' + (w + 2) + ' 30 ' + w + ' -6 Z" fill="' + u(nom, 'haut') + '" stroke="' + O + '" stroke-width="' + OL + '"/>' +
      '<path d="M' + (-w + 1) + ' ' + (L - 14) + ' L ' + (w - 1) + ' ' + (L - 14) + ' L ' + (w - 1) + ' ' + (L + 2) + ' L ' + (-w + 1) + ' ' + (L + 2) + ' Z" fill="' + (s.chemise ? u(nom, 'chemise') : vers(s.haut, -.2)) + '" stroke="' + O + '" stroke-width="2"/>';
  };
  P.cuisse = function(){ var L = D.cuisse + 4, w = s.corps === 'rond' ? 28 : 25; return '<path d="M' + (-w) + ' -8 C ' + (-w - 2) + ' 30 ' + (-w) + ' 72 ' + (-w + 5) + ' ' + L + ' L ' + (w - 5) + ' ' + L + ' C ' + w + ' 72 ' + (w + 2) + ' 30 ' + w + ' -8 Z" fill="' + u(nom, femme ? 'jupe' : 'bas') + '" stroke="' + O + '" stroke-width="' + OL + '"/>'; };
  P.tibia = function(){ var L = D.tibia + 2; return '<path d="M-21 -6 C -22 20 -20 34 -19 44 L 19 44 C 20 34 22 20 21 -6 Z" fill="' + u(nom, femme ? 'jupe' : 'bas') + '" stroke="' + O + '" stroke-width="' + OL + '"/>' +
    '<path d="M-22 38 L 22 38 C 23 64 22 90 21 ' + L + ' L -21 ' + L + ' C -22 90 -23 64 -22 38 Z" fill="' + u(nom, 'bottes') + '" stroke="' + O + '" stroke-width="' + OL + '"/><path d="M-22 44 L 22 44" stroke="' + vers(s.bottes, .3) + '" stroke-width="3" opacity=".6"/>'; };
  P.pied = function(){ return '<path d="M-24 -16 C -28 -6 -24 3 -18 5 L 18 5 C 24 3 28 -6 24 -16 Z" fill="' + u(nom, 'bottes') + '" stroke="' + O + '" stroke-width="' + OL + '"/><ellipse cx="-4" cy="-8" rx="8" ry="3" fill="#fff" opacity=".22"/>'; };
  P.main = function(type){ return _.mainHumaine(type, peauX); };

  /* ------------------------------------------------ la tête */
  var poil = POIL[s.poil], gp = 'url(#gvPoil_' + nom + ')', Pe = PEAU[s.peau];
  var T = P.tete = {l:femme ? 29 : s.corps === 'rond' ? 35 : s.corps === 'costaud' ? 33 : 31, h:femme ? 90 : 94, rond:s.corps === 'rond' ? 1 : 0, oy:-58, ex:femme ? 12.5 : 13, ey:femme ? -60 : -62,
    iris:IRISC[s.iris], nez:s.nez, moustache:!!s.moustache, poil:poil, sourcil:vers(poil, -.25), sourcilE:s.sourcilE || (femme ? 3.2 : 4.4), joues:s.joues || .2, trait:Pe[3], peauId:'gvPeau_' + s.peau, peau:Pe, cils:femme, bw:femme ? 11 : 13};
  var l = T.l, h = T.h;
  /* ce qui est sur le visage, par-dessus : la barbe, les cheveux de devant */
  T.plus = function(v, q){
    var r = '', jaw = q.jaw, dx = q.dx;
    if(s.barbeCourte || s.barbeFrisee){
      /* une barbe courte : le tour de la mâchoire et le menton ; frisée : des boucles sur le bord */
      r += '<path d="M' + f(-l + 1) + ' -52 C ' + f(-l + 1) + ' ' + f(-26 + jaw) + ' -16 ' + f(-8 + jaw) + ' 0 ' + f(-6 + jaw) + ' C 16 ' + f(-8 + jaw) + ' ' + f(l - 1) + ' ' + f(-26 + jaw) + ' ' + f(l - 1) + ' -52 C ' + f(l - 8) + ' -40 ' + f(l - 12) + ' -34 14 -36 C 10 ' + f(-20 + jaw * .6) + ' -10 ' + f(-20 + jaw * .6) + ' -14 -36 C ' + f(-l + 12) + ' -34 ' + f(-l + 8) + ' -40 ' + f(-l + 1) + ' -52 Z" fill="' + gp + '" stroke="' + O + '" stroke-width="2"/>' +
        '<path d="M' + f(-2 + dx) + ' -37 C ' + f(-8 + dx) + ' -39 ' + f(-16 + dx) + ' -37 ' + f(-18 + dx) + ' -31 C ' + f(-10 + dx) + ' -33 ' + f(-4 + dx) + ' -33 ' + f(dx) + ' -34 C ' + f(4 + dx) + ' -33 ' + f(10 + dx) + ' -33 ' + f(18 + dx) + ' -31 C ' + f(16 + dx) + ' -37 ' + f(8 + dx) + ' -39 ' + f(2 + dx) + ' -37 Z" fill="' + gp + '" stroke="' + O + '" stroke-width="1.6"/>';
      if(s.barbeFrisee) for(var k = 0; k < 9; k++){ var a = Math.PI * (.08 + k / 8 * .84), bx = Math.cos(a) * (l - 1), by = -30 + Math.sin(a) * (24 + jaw); r += '<circle cx="' + f(bx) + '" cy="' + f(by) + '" r="5.5" fill="' + gp + '" stroke="' + O + '" stroke-width="1.5"/>'; }
    }
    if(s.cheveux === 'court') r += '<path d="M' + f(-l - 1) + ' ' + f(-h * .64) + ' C ' + f(-l - 3) + ' ' + f(-h - 9) + ' ' + f(l + 3) + ' ' + f(-h - 9) + ' ' + f(l + 1) + ' ' + f(-h * .64) + ' C ' + f(l - 6) + ' ' + f(-h * .8) + ' ' + f(l * .3) + ' ' + f(-h * .86) + ' 0 ' + f(-h * .84) + ' C ' + f(-l * .3) + ' ' + f(-h * .86) + ' ' + f(-l + 6) + ' ' + f(-h * .8) + ' ' + f(-l - 1) + ' ' + f(-h * .64) + ' Z" fill="' + gp + '" stroke="' + O + '" stroke-width="2.2"/>';
    if(s.cheveux === 'chignon' || s.cheveux === 'longs'){
      /* la raie au milieu, deux bandeaux qui descendent sur les tempes */
      var bas = s.cheveux === 'longs' ? -h * .34 : -h * .5;
      r += '<path d="M' + f(2 + dx) + ' ' + f(-h - 4) + ' C ' + f(-l * .6) + ' ' + f(-h - 8) + ' ' + f(-l - 5) + ' ' + f(-h * .9) + ' ' + f(-l - 4) + ' ' + f(-h * .62) + ' C ' + f(-l - 5) + ' ' + f(-h * .5) + ' ' + f(-l - 4) + ' ' + f(bas * .9 - 8) + ' ' + f(-l - 1) + ' ' + f(bas) + ' C ' + f(-l + 3) + ' ' + f(-h * .56) + ' ' + f(-l * .5) + ' ' + f(-h * .82) + ' ' + f(2 + dx) + ' ' + f(-h * .93) + ' Z" fill="' + gp + '" stroke="' + O + '" stroke-width="2.2"/>' +
        '<path d="M' + f(2 + dx) + ' ' + f(-h - 4) + ' C ' + f(l * .6) + ' ' + f(-h - 8) + ' ' + f(l + 5) + ' ' + f(-h * .9) + ' ' + f(l + 4) + ' ' + f(-h * .62) + ' C ' + f(l + 5) + ' ' + f(-h * .5) + ' ' + f(l + 4) + ' ' + f(bas * .9 - 8) + ' ' + f(l + 1) + ' ' + f(bas) + ' C ' + f(l - 3) + ' ' + f(-h * .56) + ' ' + f(l * .5) + ' ' + f(-h * .82) + ' ' + f(2 + dx) + ' ' + f(-h * .93) + ' Z" fill="' + gp + '" stroke="' + O + '" stroke-width="2.2"/>' +
        '<path d="M' + f(-l * .7) + ' ' + f(-h * .93) + ' C ' + f(-l - 1) + ' ' + f(-h * .86) + ' ' + f(-l - 1) + ' ' + f(-h * .7) + ' ' + f(-l) + ' ' + f(-h * .6) + ' M' + f(l * .7) + ' ' + f(-h * .93) + ' C ' + f(l + 1) + ' ' + f(-h * .86) + ' ' + f(l + 1) + ' ' + f(-h * .7) + ' ' + f(l) + ' ' + f(-h * .6) + '" fill="none" stroke="' + vers(poil, .4) + '" stroke-width="2" opacity=".6"/>';
      if(s.fleurs) [[-l - 2, -h * .74, '#b48cff'], [-l + 6, -h * .9, '#ffffff'], [-l * .4, -h - 3, '#ff9ac0'], [-l - 4, -h * .56, '#ffffff']].forEach(function(p){
        r += '<g transform="translate(' + f(p[0]) + ' ' + f(p[1]) + ')">' + [0, 72, 144, 216, 288].map(function(a){ return '<circle cx="' + f(Math.cos(U.rad(a)) * 4.6) + '" cy="' + f(Math.sin(U.rad(a)) * 4.6) + '" r="3.8" fill="' + p[2] + '" stroke="' + O + '" stroke-width="1"/>'; }).join('') + '<circle r="2.6" fill="#ffd23f"/></g>'; });
    }
    if(s.cheveux === 'boucles') for(var b = 0; b < 9; b++){ var an = Math.PI * (1 + b / 8), cx = Math.cos(an) * (l + 2), cy = -h * .62 + Math.sin(an) * (h * .4); r += '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(9 + (b % 3) * 1.6) + '" fill="' + gp + '" stroke="' + O + '" stroke-width="2"/>'; }
    return r;
  };
  /* derrière la tête : le chignon, les longs cheveux qui tombent dans le dos */
  P.sousTete = function(){
    if(s.cheveux === 'chignon') return '<circle cx="2" cy="' + f(-h - 14) + '" r="21" fill="' + gp + '" stroke="' + O + '" stroke-width="2.4"/><path d="M-10 ' + f(-h - 22) + ' C -2 ' + f(-h - 30) + ' 10 ' + f(-h - 28) + ' 16 ' + f(-h - 18) + ' M-12 ' + f(-h - 10) + ' C -4 ' + f(-h - 16) + ' 8 ' + f(-h - 16) + ' 18 ' + f(-h - 8) + '" fill="none" stroke="' + vers(poil, -.45) + '" stroke-width="2"/>' +
      '<path d="M' + f(-l - 3) + ' ' + f(-h * .8) + ' C ' + f(-l - 6) + ' ' + f(-h - 12) + ' ' + f(l + 6) + ' ' + f(-h - 12) + ' ' + f(l + 3) + ' ' + f(-h * .8) + ' L ' + f(l + 2) + ' ' + f(-h * .4) + ' L ' + f(-l - 2) + ' ' + f(-h * .4) + ' Z" fill="' + vers(poil, -.3) + '" stroke="' + O + '" stroke-width="2"/>';
    return '';
  };
  /* derrière tout le corps : de longs cheveux qui tombent dans le dos */
  P.derriere = s.cheveux !== 'longs' ? null : function(os){
    return PT.piece(os.tete, '<path d="M' + f(-l - 5) + ' ' + f(-h * .8) + ' C ' + f(-l - 8) + ' ' + f(-h - 12) + ' ' + f(l + 8) + ' ' + f(-h - 12) + ' ' + f(l + 5) + ' ' + f(-h * .8) + ' C ' + f(l + 16) + ' -30 ' + f(l + 26) + ' 40 ' + f(l + 16) + ' 104 C ' + f(l - 4) + ' 116 ' + f(-l + 4) + ' 116 ' + f(-l - 16) + ' 104 C ' + f(-l - 26) + ' 40 ' + f(-l - 16) + ' -30 ' + f(-l - 5) + ' ' + f(-h * .8) + ' Z" fill="' + vers(poil, -.22) + '" stroke="' + O + '" stroke-width="2.4"/>' +
      '<path d="M' + f(-l - 8) + ' -20 C ' + f(-l - 16) + ' 20 ' + f(-l - 14) + ' 60 ' + f(-l - 8) + ' 100 M' + f(l + 8) + ' -20 C ' + f(l + 16) + ' 20 ' + f(l + 14) + ' 60 ' + f(l + 8) + ' 100" fill="none" stroke="' + vers(poil, -.5) + '" stroke-width="1.8" opacity=".7"/>');
  };
  /* le chapeau */
  P.chapeau = !s.coiffe ? null : function(){
    if(o.sansCoiffe) return '';   /* (Bible §13.69) il a lancé son chapeau en l'air */
    if(s.coiffe === 'toque') return '<path d="M-32 -84 C -52 -96 -52 -132 -26 -138 C -22 -160 22 -160 26 -138 C 52 -132 52 -96 32 -84 Z" fill="url(#gvBlanc)" stroke="' + O + '" stroke-width="' + OL + '"/>' +
      '<path d="M-20 -134 C -18 -120 -20 -104 -22 -92 M0 -148 C 2 -126 0 -106 0 -92 M20 -134 C 18 -120 20 -104 22 -92" fill="none" stroke="#c8c0b0" stroke-width="2"/>' +
      '<path d="M-34 -86 C -20 -78 20 -78 34 -86 L 34 -70 C 20 -62 -20 -62 -34 -70 Z" fill="#ffffff" stroke="' + O + '" stroke-width="2.2"/>';
    if(s.coiffe === 'paille') return '<ellipse cx="0" cy="-80" rx="72" ry="15" fill="url(#gvPaille)" stroke="' + O + '" stroke-width="' + OL + '"/>' +
      '<path d="M-34 -82 C -36 -112 -22 -124 0 -124 C 22 -124 36 -112 34 -82 C 20 -74 -20 -74 -34 -82 Z" fill="url(#gvPaille)" stroke="' + O + '" stroke-width="' + OL + '"/>' +
      '<path d="M-34 -90 C -20 -82 20 -82 34 -90 L 34 -84 C 20 -76 -20 -76 -34 -84 Z" fill="#7a4a26" stroke="' + O + '" stroke-width="1.6"/>' +
      '<path d="M-62 -80 C -40 -72 40 -72 62 -80 M-22 -114 L -18 -94 M0 -120 L 0 -96 M22 -114 L 18 -94 M-50 -84 l -8 6 M50 -84 l 8 6 M-66 -78 l -9 3 M66 -78 l 9 3" fill="none" stroke="#a8862c" stroke-width="1.6" opacity=".8"/>';
    if(s.coiffe === 'bonnet') return '<path d="M-36 -78 C -44 -108 -26 -128 4 -128 C 34 -128 46 -112 40 -92 C 46 -84 40 -74 36 -78 C 20 -88 -20 -88 -36 -78 Z" fill="#efe8d6" stroke="' + O + '" stroke-width="' + OL + '"/>' +
      '<path d="M-24 -116 C -10 -108 10 -108 28 -116 M-32 -98 C -12 -90 12 -90 36 -98" fill="none" stroke="#c8bea4" stroke-width="2.4"/>' +
      '<path d="M-38 -80 C -20 -70 20 -70 38 -80 L 38 -70 C 20 -60 -20 -60 -38 -70 Z" fill="#fbf6e8" stroke="' + O + '" stroke-width="2.2"/>' + farine([[-14, -104, 3], [12, -118, 2.4], [24, -100, 3]]);
    /* (Bible §13.69) la casquette bleue du facteur, à visière de cuir ; le fichu noué d'une lavandière */
    if(s.coiffe === 'facteur') return '<path d="M-33 -84 C -36 -108 -28 -122 0 -124 C 28 -122 36 -108 33 -84 C 20 -76 -20 -76 -33 -84 Z" fill="#2f4f9a" stroke="' + O + '" stroke-width="' + OL + '"/>' +
      '<path d="M-33 -90 C -20 -82 20 -82 33 -90 L 33 -82 C 20 -74 -20 -74 -33 -82 Z" fill="#c0302a" stroke="' + O + '" stroke-width="1.6"/>' +
      '<path d="M-36 -82 C -20 -70 20 -70 36 -82 C 30 -66 -30 -66 -36 -82 Z" fill="#1a1a22" stroke="' + O + '" stroke-width="2"/><circle cx="0" cy="-104" r="5.5" fill="url(#gOr)" stroke="' + O + '" stroke-width="1.4"/>';
    if(s.coiffe === 'fichu') return '<path d="M' + f(-l - 5) + ' ' + f(-h * .56) + ' C ' + f(-l - 9) + ' ' + f(-h - 12) + ' ' + f(l + 9) + ' ' + f(-h - 12) + ' ' + f(l + 5) + ' ' + f(-h * .56) + ' C ' + f(l - 2) + ' ' + f(-h * .78) + ' ' + f(l * .4) + ' ' + f(-h * .92) + ' 0 ' + f(-h * .9) + ' C ' + f(-l * .4) + ' ' + f(-h * .92) + ' ' + f(-l + 2) + ' ' + f(-h * .78) + ' ' + f(-l - 5) + ' ' + f(-h * .56) + ' Z" fill="' + (s.fichu || '#f4efe2') + '" stroke="' + O + '" stroke-width="' + OL + '"/>' +
      '<path d="M' + f(-l * .7) + ' ' + f(-h * .98) + ' C ' + f(-l * .2) + ' ' + f(-h - 2) + ' ' + f(l * .3) + ' ' + f(-h - 2) + ' ' + f(l * .8) + ' ' + f(-h * .96) + ' M' + f(-l - 3) + ' ' + f(-h * .72) + ' C ' + f(-l * .6) + ' ' + f(-h * .92) + ' ' + f(-l * .2) + ' ' + f(-h * .98) + ' 0 ' + f(-h * .98) + '" fill="none" stroke="' + vers(s.fichu || '#f4efe2', -.3) + '" stroke-width="1.8" opacity=".8"/>';
    if(s.coiffe === 'plume') return'<path d="M26 -104 C 44 -150 80 -164 96 -150 C 84 -132 60 -112 34 -96 Z" fill="#f4f0e0" stroke="' + O + '" stroke-width="2.2"/><path d="M30 -102 C 50 -130 72 -146 92 -150" fill="none" stroke="#b8b0a0" stroke-width="1.8"/>' +
      '<ellipse cx="0" cy="-82" rx="62" ry="13" fill="#b82a26" stroke="' + O + '" stroke-width="' + OL + '"/>' +
      '<path d="M-32 -84 C -36 -110 -24 -122 0 -122 C 24 -122 36 -110 32 -84 C 20 -76 -20 -76 -32 -84 Z" fill="#c8302a" stroke="' + O + '" stroke-width="' + OL + '"/>' +
      '<path d="M-32 -92 C -20 -84 20 -84 32 -92 L 32 -85 C 20 -77 -20 -77 -32 -85 Z" fill="#f2c040" stroke="' + O + '" stroke-width="1.6"/>';
    return '';
  };
  return P;
}
Object.keys(V).forEach(function(n){ G.AUTRES[n] = function(o){ return pieces(n, o || {}); }; });

/* ---------------------------------------------------------------- CE QU'ILS TIENNENT */
/* une torche : un bâton, des chiffons, la flamme (elle danse : le temps du film, et une graine par torche) */
G.OBJETS.torche = {
  angle:function(o, c, p){ return (c === 'G' ? -1 : 1) * (o.torcheA == null ? 8 : o.torcheA) + U.fbm((window.CINE_T || 0) * 1.3, 40 + (o.graine || 0), 2) * 3; },
  dessin:function(o){
    var t = window.CINE_T || 0, k = o.graine || 0, r = '<rect x="-6" y="-150" width="12" height="190" rx="5" fill="url(#gBois)" stroke="' + O + '" stroke-width="2.4"/>' +
      '<path d="M-13 -150 C -15 -166 15 -166 13 -150 L 11 -128 C 5 -124 -5 -124 -11 -128 Z" fill="#3a2a1a" stroke="' + O + '" stroke-width="2.4"/><path d="M-11 -144 C -3 -140 4 -140 11 -146 M-11 -136 C -3 -132 4 -132 11 -138" fill="none" stroke="#6a4a2a" stroke-width="2"/>';
    if(o.torche === 0) return r;
    [[1, '#ff7a1a'], [.72, '#ffb84a'], [.45, '#fff2c0']].forEach(function(c, j){
      var hh = (78 + 14 * U.fbm(t * 3 + j, k * 3 + j, 2)) * c[0], w = 22 * c[0], b1 = U.fbm(t * 4.2, k * 7 + j, 2) * 16 * c[0], b2 = U.fbm(t * 5.1 + 3, k * 7 + j + 1, 2) * 11 * c[0];
      r += '<path transform="translate(0 -156)" d="M' + f(-w) + ' -4 C ' + f(-w * 1.1) + ' ' + f(-hh * .35) + ' ' + f(b2 - w * .4) + ' ' + f(-hh * .62) + ' ' + f(b1) + ' ' + f(-hh) + ' C ' + f(b2 + w * .5) + ' ' + f(-hh * .6) + ' ' + f(w * 1.1) + ' ' + f(-hh * .32) + ' ' + f(w) + ' -4 C ' + f(w * .5) + ' 6 ' + f(-w * .5) + ' 6 ' + f(-w) + ' -4 Z" fill="' + c[1] + '" opacity=".96"/>';
    });
    return r;
  }
};
/* le rouleau à pâtisserie du boulanger (il le brandit) */
G.OBJETS.rouleau = {
  angle:function(o, c){ return (c === 'G' ? -1 : 1) * (o.rouleauA == null ? 24 : o.rouleauA); },
  dessin:function(){
    return '<rect x="-7" y="-150" width="14" height="210" rx="6" fill="url(#gBois)" stroke="' + O + '" stroke-width="2.2"/>' +
      '<rect x="-19" y="-128" width="38" height="112" rx="15" fill="#d8a868" stroke="' + O + '" stroke-width="2.6"/><path d="M-10 -120 L -10 -24" stroke="#f4d8a8" stroke-width="5" opacity=".7" stroke-linecap="round"/><path d="M10 -118 L 10 -26" stroke="#8a5a2a" stroke-width="3" opacity=".5" stroke-linecap="round"/>' +
      '<circle cx="2" cy="-90" r="3" fill="#fff" opacity=".7"/><circle cx="-6" cy="-56" r="2.4" fill="#fff" opacity=".7"/>';
  }
};
/* où est la flamme d'une torche, la lumière d'une lanterne (dans le repère du personnage) — pour les halos du film */
G.lumiereDe = function(os, o, cote, p){
  var n = o.tient && o.tient[cote]; if(!n || (n !== 'lanterne' && n !== 'torche')) return null;
  var h = M.pt(os['m' + cote], 0, 20), a = U.rad(G.OBJETS[n].angle(o, cote, p || {}));
  var d = n === 'torche' ? [0, -186] : [0, 34];
  return {x:h[0] + d[0] * Math.cos(a) - d[1] * Math.sin(a), y:h[1] + d[0] * Math.sin(a) + d[1] * Math.cos(a), torche:n === 'torche'};
};
})();
