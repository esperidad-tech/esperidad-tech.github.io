/* ==========================================================
   Brumeval v2 — PERSOS : héros et villageois en SVG
   Style retenu : contours anime épais, dégradés façon jouet 3D,
   lueurs magiques cyan. Expose window.Persos.
   ========================================================== */
(function(){
'use strict';

var O = '#24182e';
var compteur = 0;
var GARDE = null;   /* la garde-robe du Pisteur (garderobe.js), branchée par Persos.garde(ext) */

/* ---------- Couleurs ---------- */
function h2r(h){ h = String(h).replace('#',''); if(h.length === 3) h = h.split('').map(function(x){ return x + x; }).join(''); var n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function r2h(r){ return '#' + r.map(function(v){ return ('0' + Math.round(Math.max(0, Math.min(255, v))).toString(16)).slice(-2); }).join(''); }
function mix(a, b, t){ var x = h2r(a), y = h2r(b); return r2h([0,1,2].map(function(i){ return x[i] + (y[i] - x[i]) * t; })); }
function clair(h, t){ return mix(h, '#ffffff', t); }
function sombre(h, t){ return mix(h, '#0b0614', t); }

/* ---------- Petits outils SVG ---------- */
function c(w){ return ' stroke="' + O + '" stroke-width="' + (w || 2.2) + '" stroke-linejoin="round" stroke-linecap="round"'; }
function stops(st){ return st.map(function(s){ return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"' + (s[2] != null ? ' stop-opacity="' + s[2] + '"' : '') + '/>'; }).join(''); }
function linU(id, st, x1, y1, x2, y2){ return '<linearGradient id="' + id + '" gradientUnits="userSpaceOnUse" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '">' + stops(st) + '</linearGradient>'; }
function lin(id, st, x1, y1, x2, y2){ return '<linearGradient id="' + id + '" x1="' + (x1 || 0) + '" y1="' + (y1 || 0) + '" x2="' + (x2 == null ? 1 : x2) + '" y2="' + (y2 == null ? 1 : y2) + '">' + stops(st) + '</linearGradient>'; }
function rad(id, st, cx, cy, r){ return '<radialGradient id="' + id + '" cx="' + (cx || .5) + '" cy="' + (cy || .5) + '" r="' + (r || .5) + '">' + stops(st) + '</radialGradient>'; }
function A(cls, s, extra){ return '<g class="' + cls + '"' + (extra || '') + '>' + s + '</g>'; }
function etoile4(x, y, r){ var q = r * .3; return 'M' + x + ' ' + (y - r) + ' L' + (x + q) + ' ' + (y - q) + ' L' + (x + r) + ' ' + y + ' L' + (x + q) + ' ' + (y + q) + ' L' + x + ' ' + (y + r) + ' L' + (x - q) + ' ' + (y + q) + ' L' + (x - r) + ' ' + y + ' L' + (x - q) + ' ' + (y - q) + ' Z'; }
function note(x, y, k){ k = k || 1; return '<path d="M' + x + ' ' + y + ' m0 0 v' + (-12 * k) + ' l' + (8 * k) + ' ' + (-3 * k) + ' v' + (4 * k) + ' l' + (-8 * k) + ' ' + (3 * k) + '"' + ' fill="none" stroke="currentColor" stroke-width="' + (1.8 * k) + '" stroke-linecap="round"/><ellipse cx="' + (x - 2.4 * k) + '" cy="' + (y + 1 * k) + '" rx="' + (3.2 * k) + '" ry="' + (2.4 * k) + '" fill="currentColor" transform="rotate(-20 ' + (x - 2.4 * k) + ' ' + (y + 1 * k) + ')"/>'; }

/* ==========================================================
   Données de choix
   ========================================================== */
var PEAUX = [
  {id:'p1', nom:'Très claire', c:['#fff1e6','#f7caa6'], ombre:'#e8ad89', trait:'#c98a66', joue:'#ff8f8f'},
  {id:'p2', nom:'Claire',      c:['#ffe7d2','#efb88e'], ombre:'#d9976d', trait:'#b8764f', joue:'#ff877a'},
  {id:'p3', nom:'Dorée',       c:['#f8d8b0','#dea575'], ombre:'#c48652', trait:'#9c663a', joue:'#f2786a'},
  {id:'p4', nom:'Olive',       c:['#eec899','#c7935c'], ombre:'#a77441', trait:'#80552c', joue:'#e4685a'},
  {id:'p5', nom:'Brune',       c:['#d29d6f','#a06840'], ombre:'#80502d', trait:'#5e381c', joue:'#d65a50'},
  {id:'p6', nom:'Foncée',      c:['#ad774e','#6f4428'], ombre:'#55331c', trait:'#3a2010', joue:'#c84c4a'}
];
var CHEVEUX = [
  {id:'brun',    nom:'Brun',      c:['#d39654','#7c4624','#3a1e0e'], hl:'#f6cf98'},
  {id:'chatain', nom:'Châtain',   c:['#e6bb85','#a06f40','#4c2d14'], hl:'#fbe0b4'},
  {id:'noir',    nom:'Noir',      c:['#6b7096','#272840','#0e0e1a'], hl:'#a9b4e6'},
  {id:'blond',   nom:'Blond',     c:['#fff4c2','#f0c95a','#a8781c'], hl:'#fffbe6'},
  {id:'roux',    nom:'Roux',      c:['#ffb886','#dc622a','#7a2a0e'], hl:'#ffe0bc'},
  {id:'gris',    nom:'Gris',      c:['#f2f2f6','#a9aab8','#5c5d6e'], hl:'#ffffff'},
  {id:'blanc',   nom:'Blanc',     c:['#ffffff','#e4e7f0','#a3a7bf'], hl:'#ffffff'},
  {id:'nuit',    nom:'Bleu nuit', c:['#9fbaff','#3c50b4','#141c50'], hl:'#d6e4ff'},
  {id:'rose',    nom:'Rose',      c:['#ffd6ea','#f07aab','#932659'], hl:'#fff0f7'}
];
var YEUX = [
  {id:'vert',     nom:'Vert',     c:['#0a3a22','#1f9150','#86ffbd']},
  {id:'bleu',     nom:'Bleu',     c:['#0a1f4a','#2f6fd0','#a6dcff']},
  {id:'marron',   nom:'Marron',   c:['#2a1206','#7a4420','#e0a876']},
  {id:'noisette', nom:'Noisette', c:['#2e2208','#8a6a1c','#ecd07a']},
  {id:'gris',     nom:'Gris',     c:['#1e2430','#5f6f86','#d6e2f0']},
  {id:'violet',   nom:'Violet',   c:['#2a0a4a','#7a3fd0','#dcb6ff']},
  {id:'ambre',    nom:'Ambre',    c:['#3a1a02','#c47a10','#ffd98a']}
];
var TENUES = [
  {id:'foret',   nom:'Forêt',    c:'#2f8050'},
  {id:'pourpre', nom:'Pourpre',  c:'#6b3fb4'},
  {id:'rubis',   nom:'Rubis',    c:'#b8325a'},
  {id:'azur',    nom:'Azur',     c:'#2f60b4'},
  {id:'emeraude',nom:'Émeraude', c:'#1d8c84'},
  {id:'ocre',    nom:'Ocre',     c:'#b4782a'},
  {id:'rose',    nom:'Rose',     c:'#cf5f92'},
  {id:'nuit',    nom:'Nuit',     c:'#2b305f'},
  {id:'ardoise', nom:'Ardoise',  c:'#4b5772'},
  {id:'brun',    nom:'Brun',     c:'#7a4a2a'}
];
var COIFFURES = {
  f:[{id:'queue',nom:'Queue de cheval'},{id:'tresses',nom:'Deux tresses'},{id:'carre',nom:'Carré'},{id:'longs',nom:'Longs ondulés'},
     {id:'chignon',nom:'Chignon'},{id:'couettes',nom:'Couettes'},{id:'courte',nom:'Courte'},{id:'tresse_c',nom:'Couronne tressée'}],
  m:[{id:'epis',nom:'Pointes de héros'},{id:'court',nom:'Frange en bataille'},{id:'meche',nom:'Mèche sur l\'œil'},{id:'boucles',nom:'Boucles'},
     {id:'arriere',nom:'Houppe dégradée'},{id:'catogan',nom:'Queue de samouraï'},{id:'milong',nom:'Mi-longs'},{id:'degarni',nom:'Dégarni'}]
};
var BARBES = [{id:'aucune',nom:'Aucune'},{id:'courte',nom:'Courte'},{id:'longue',nom:'Longue'},{id:'moustache',nom:'Moustache'}];
var ANIMAUX = [{id:'faucon',nom:'Faucon'},{id:'renard',nom:'Renard'},{id:'loup',nom:'Loup'}];

var ROLES = {
  pisteur:   {nom:'Pisteur',    c:'#5fcf86', lueur:'#7dffb0', tenue:'foret'},
  alchimiste:{nom:'Alchimiste', c:'#b48cff', lueur:'#dcc0ff', tenue:'pourpre'},
  barde:     {nom:'Barde',      c:'#ff8fb3', lueur:'#ffc4da', tenue:'rubis'},
  sage:      {nom:'Sage',       c:'#6cb6ff', lueur:'#a8e2ff', tenue:'azur'}
};

function trouve(liste, id, def){ for(var i = 0; i < liste.length; i++) if(liste[i].id === id) return liste[i]; return def === undefined ? liste[0] : def; }

/* ---------- Objets : prix et emplacement ---------- */
var OBJ = {
  /* pisteur */
  bottes_souples:[35,'pieds'], arc_court:[40,'main_g'], lanterne_sourde:[40,'ceinture'], sifflet:[30,'cou'], gants_pisteur:[35,'poignets'],
  grappin:[45,'epaule'], cape_rodeur:[80,'cape'], bottes_vent:[90,'pieds'], longue_vue_ch:[70,'ceinture'], carquois:[75,'carquois'],
  collier:[60,null], pieges:[65,'ceinture'], arc_elfique:[130,'main_g'], lanterne_lune:[120,'ceinture'], amulette_instinct:[110,'cou'],
  bracelets_vent:[100,'poignets'], masque_ombre:[120,'masque'], arc_argent:[260,'main_g'], bottes_fondateurs:[280,'pieds'], oeil_faucon:[300,'broche'],
  /* alchimiste */
  fioles_renf:[30,'ceinture'], mortier:[35,'ceinture'], thermometre:[40,'poche'], ceinture_fioles:[40,'rangee'], herbier:[45,'ceinture'],
  gants_cuir:[35,'poignets'], alambic:[85,'sol'], loupe_doree:[70,'ceinture'], etal:[60,null], sac_herbo:[65,'sac'],
  lunettes_alchi:[75,'front'], grimoire_rec:[80,'ceinture'], chaudron_cuivre:[110,'sol'], balance_or:[100,'ceinture'], serre:[130,'sol'],
  oeil_cristal:[120,'yeux'], fioles_ether:[110,'bandouliere'], athanor:[280,'sol'], pierre_transmu:[260,'flottant'], grand_grimoire:[300,'flottant'],
  /* barde */
  luth_voyage:[40,'main_g'], carnet_ragots:[30,'ceinture'], bourse:[35,'ceinture'], bonbons:[30,'ceinture'], clochette:[50,'ceinture'],
  chapeau_plume:[35,'tete'], cornet:[70,'ceinture'], deguisement:[80,'ceinture'], cape_scene:[65,'cape'], pendule:[85,'cou'],
  lettre_maire:[60,'ceinture'], carillon:[75,'ceinture'], luth_enchante:[120,'main_g'], masque_velours:[110,'ceinture'], miroir:[130,'ceinture'],
  plume_rossignol:[100,'plume'], corne:[110,'ceinture'], harpe:[280,'main_g'], anneau:[260,'bague'], registre:[300,'flottant'],
  /* sage */
  loupe_lecture:[30,'cou'], plume_encre:[30,'plume'], baton_marche:[35,'main_g'], sablier:[45,'ceinture'], cle_archives:[50,'ceinture'],
  lunettes_sage:[40,'yeux'], longue_vue:[70,'ceinture'], livre_annote:[80,'main_d'], cor:[75,'ceinture'], astrolabe:[85,'cou'],
  pierre_runes:[65,'ceinture'], cartes_fond:[90,'dos'], baton_cristal:[130,'main_g'], chapeau_etoile:[110,'tete'], banniere:[120,'dos'],
  index:[100,null], boule:[140,'main_d'], grimoire_sage:[280,'flottant'], couronne:[260,'halo'], oeil_temps:[300,'cou']
};
var MULTI = {ceinture:3, flottant:2};

function resoudre(equip){
  var r = {};
  (equip || []).forEach(function(id){
    var o = OBJ[id]; if(!o || !o[1]) return;
    var s = o[1];
    if(MULTI[s]){ (r[s] = r[s] || []).push(id); return; }
    if(!r[s] || OBJ[r[s]][0] < o[0]) r[s] = id;
  });
  Object.keys(MULTI).forEach(function(s){ if(r[s]){ r[s].sort(function(a, b){ return OBJ[b][0] - OBJ[a][0]; }); r[s] = r[s].slice(0, MULTI[s]); } });
  /* doublons logiques */
  if(r.ceinture && r.ceinture.indexOf('lanterne_lune') >= 0) r.ceinture = r.ceinture.filter(function(x){ return x !== 'lanterne_sourde'; });
  return r;
}

function palier(n){ n = n || 1; return n >= 10 ? 4 : n >= 7 ? 3 : n >= 4 ? 2 : 1; }

/* ==========================================================
   Contexte de dessin (dégradés propres à chaque SVG)
   ========================================================== */
function contexte(id, h){
  var K = {id:id, u:function(n){ return 'url(#' + id + '-' + n + ')'; }, n:function(n){ return id + '-' + n; }};
  K.peau = trouve(PEAUX, h.peau);
  K.chev = trouve(CHEVEUX, h.cheveux);
  K.yeux = trouve(YEUX, h.yeux);
  var ten = trouve(TENUES, h.tenue, null) || trouve(TENUES, ROLES[h.role] ? ROLES[h.role].tenue : 'foret');
  K.tenue = ten.c;
  K.role = ROLES[h.role] || ROLES.pisteur;
  K.t = palier(h.niveau);
  return K;
}

function defsCommuns(K, h){
  var P = K.peau, Ch = K.chev, Y = K.yeux, T = K.tenue, t = K.t, role = h.role;
  var lin1;
  /* tissu principal selon palier */
  var tissu;
  if(t === 1){
    if(role === 'sage') tissu = ['#c9b28a','#957a54','#5d4832'];
    else if(role === 'alchimiste') tissu = ['#f0ebdd','#cbc2aa','#958b72'];
    else if(role === 'barde') tissu = [clair(mix(T, '#d8c7a4', .55), .3), mix(T, '#c9b48e', .55), sombre(mix(T, '#a08a64', .5), .35)];
    else tissu = ['#f2e7d0','#d2bd96','#a98f66'];
  } else if(t === 2){
    tissu = [clair(T, .3), T, sombre(T, .45)];
  } else {
    tissu = [clair(T, .42), clair(T, .06), sombre(T, .5)];
  }
  if(K.tissuForce) tissu = K.tissuForce;   /* garde-robe : la couleur du vêtement choisi (manches comprises) */
  K.tissu = tissu;
  var pant = t === 1 ? ['#8a6644','#4f3720'] : role === 'barde' ? [clair(sombre(T, .3), .1), sombre(T, .6)] : ['#4a4062','#221d33'];
  var d = '<defs>' +
    lin(K.n('peau'), [[0, P.c[0]], [1, P.c[1]]]) +
    lin(K.n('chev'), [[0, Ch.c[0]], [.5, Ch.c[1]], [1, Ch.c[2]]], 0, 0, .6, 1) +
    lin(K.n('chevD'), [[0, Ch.c[1]], [1, Ch.c[2]]], 0, 0, 0, 1) +
    linU(K.n('chevU'), [[0, Ch.c[0]], [.5, Ch.c[1]], [1, Ch.c[2]]], -30, -66, 24, 30) +
    linU(K.n('chevB'), [[0, mix(Ch.c[0], Ch.c[1], .6)], [.55, mix(Ch.c[1], Ch.c[2], .45)], [1, Ch.c[2]]], -40, -66, 30, 30) +
    linU(K.n('peauU'), [[0, P.c[0]], [1, P.c[1]]], -26, -27, 26, 36) +
    lin(K.n('iris'), [[0, Y.c[0]], [.55, Y.c[1]], [1, Y.c[2]]], 0, 0, 0, 1) +
    lin(K.n('tun'), [[0, tissu[0]], [.55, tissu[1]], [1, tissu[2]]]) +
    lin(K.n('tunO'), [[0, mix(tissu[1], tissu[2], .5)], [1, sombre(tissu[2], .3)]]) +
    lin(K.n('acc'), [[0, clair(T, .35)], [1, sombre(T, .35)]]) +
    lin(K.n('pant'), [[0, pant[0]], [1, pant[1]]]) +
    lin(K.n('cuir'), [[0,'#b77b45'], [.5,'#6e4223'], [1,'#3b2211']]) +
    lin(K.n('or'), [[0,'#fff4b8'], [.45,'#eab43c'], [1,'#94620e']]) +
    lin(K.n('argent'), [[0,'#ffffff'], [.5,'#d9e2f4'], [1,'#8e9cc0']]) +
    lin(K.n('argentH'), [[0,'#9aa8c8'], [.5,'#ffffff'], [1,'#9aa8c8']], 0, 0, 1, 0) +
    lin(K.n('bois'), [[0,'#5a3214'], [.5,'#c48a50'], [1,'#5a3214']], 0, 0, 1, 0) +
    lin(K.n('boisV'), [[0,'#c48a50'], [1,'#5a3214']], 0, 0, 1, 1) +
    lin(K.n('cape'), [[0, clair(sombre(T, .25), .08)], [1, sombre(T, .7)]], 0, 0, .3, 1) +
    lin(K.n('blanc'), [[0,'#ffffff'], [1,'#cdd3e6']]) +
    lin(K.n('verre'), [[0,'#ffffff', .85], [.4,'#e6f6ff', .35], [1,'#9fb8d8', .5]]) +
    rad(K.n('lueur'), [[0,'#ffffff'], [.35, K.role.lueur, .9], [1, K.role.lueur, 0]]) +
    rad(K.n('cyan'), [[0,'#ffffff'], [.35,'#8ff3ff', .9], [1,'#8ff3ff', 0]]) +
    rad(K.n('feu'), [[0,'#fffbe6'], [.35,'#ffd27a', .9], [1,'#ffd27a', 0]]) +
    rad(K.n('aura'), [[0, K.role.lueur, .55], [.6, K.role.lueur, .18], [1, K.role.lueur, 0]]) +
    rad(K.n('ombre'), [[0,'#000', .45], [1,'#000', 0]]) +
    lin(K.n('ciel'), [[0,'#100c30'], [.55,'#2c2464'], [1,'#5d4b90']], 0, 0, 0, 1) +
    rad(K.n('halo'), [[0,'#fff3d6', .9], [.4,'#ffe1a8', .35], [1,'#ffe1a8', 0]]) +
    rad(K.n('lune'), [[0,'#fffaf0'], [.8,'#ffe9c2'], [1,'#ffd99a']], .4, .4, .7) +
    lin(K.n('mont'), [[0,'#3b3580'], [1,'#221f55']], 0, 0, 0, 1) +
    lin(K.n('sol'), [[0,'#2b5a58'], [1,'#10262c']], 0, 0, 0, 1) +
    rad(K.n('fond'), [[0, mix(K.role.c, '#2c2464', .55)], [.7, '#1c1a48'], [1, '#131932']], .5, .4, .7) +
  '</defs>';
  return d;
}

/* ==========================================================
   TÊTE (coordonnées locales : centre du visage en 0,0)
   ========================================================== */
var VISAGE = {
  adulte:'M-26 -10 C -26 -32 26 -32 26 -10 L 26 5 C 26 20 15 30 0 34 C -15 30 -26 20 -26 5 Z',
  enfant:'M-27 -10 C -27 -34 27 -34 27 -10 L 27 8 C 27 22 15 31 0 32 C -15 31 -27 22 -27 8 Z',
  age:'M-26 -10 C -26 -32 26 -32 26 -10 L 26 6 C 26 22 15 32 0 35 C -15 32 -26 22 -26 6 Z',
  rond:'M-29 -10 C -29 -33 29 -33 29 -10 L 29 8 C 29 26 16 34 0 35 C -16 34 -29 26 -29 8 Z',
  fin:'M-23 -10 C -23 -32 23 -32 23 -10 L 23 6 C 23 22 13 32 0 36 C -13 32 -23 22 -23 6 Z'
};

function oreilles(K){
  var u = K.u;
  return '<path d="M-29 -4 Q -35 2 -32 10 Q -27 14 -24 8 Z M29 -4 Q 35 2 32 10 Q 27 14 24 8 Z" fill="' + u('peau') + '"' + c(1.8) + '/>' +
    '<path d="M-30 2 q 2 2 1 5 M30 2 q -2 2 -1 5" stroke="' + K.peau.trait + '" stroke-width="1.2" fill="none" stroke-linecap="round"/>';
}

/* Un œil. d = -1 (gauche) ou 1 (droite). */
function oeil(K, x, y, d, f){
  var u = K.u, s = '', k = f.taille || 1;
  var lid = f.lueur;
  function X(v){ return x + v * k * d; }
  function Yv(v){ return y + v * k; }
  if(f.humeur === 'content'){
    return '<path d="M' + X(-7) + ' ' + Yv(2) + ' Q ' + x + ' ' + Yv(-7) + ' ' + X(7) + ' ' + Yv(2) + '" stroke="' + O + '" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
      (f.cils ? '<path d="M' + X(7) + ' ' + Yv(1) + ' l' + (3 * d) + ' -2" stroke="' + O + '" stroke-width="1.8" stroke-linecap="round"/>' : '');
  }
  if(lid) s += '<circle cx="' + x + '" cy="' + y + '" r="' + (12 * k) + '" fill="' + u('lueur') + '" opacity=".7" class="pj-pulse"/>';
  var plisse = f.plisse ? 2.5 : 0;
  /* blanc de l'œil */
  s += '<path d="M' + X(-8.5) + ' ' + Yv(-4 + plisse) + ' Q ' + X(0) + ' ' + Yv(-7.5 + plisse) + ' ' + X(9) + ' ' + Yv(-4.5 + plisse) + ' Q ' + X(9.2) + ' ' + Yv(6) + ' ' + X(0) + ' ' + Yv(7 - plisse * .4) + ' Q ' + X(-8.5) + ' ' + Yv(6) + ' ' + X(-8.5) + ' ' + Yv(-4 + plisse) + ' Z" fill="#fff"/>';
  var ox = (f.regard || 0) * k * 3, rx = 5.8 * k, ry = 7.2 * k;
  if(f.humeur === 'peur'){ rx *= .8; ry *= .8; }
  s += '<ellipse cx="' + (x + ox) + '" cy="' + (y + .5 * k) + '" rx="' + rx + '" ry="' + ry + '" fill="' + u('iris') + '"/>';
  if(lid) s += '<ellipse cx="' + (x + ox) + '" cy="' + (y + 1 * k) + '" rx="' + (1.4 * k) + '" ry="' + (4.6 * k) + '" fill="#06140c"/>';
  else s += '<ellipse cx="' + (x + ox) + '" cy="' + (y + 1 * k) + '" rx="' + (2.5 * k) + '" ry="' + (3.4 * k) + '" fill="#0a0612"/>';
  s += '<ellipse cx="' + (x + ox + 2.2 * k) + '" cy="' + (y - 2.4 * k) + '" rx="' + (2.1 * k) + '" ry="' + (2.7 * k) + '" fill="#fff"/><circle cx="' + (x + ox - 2 * k) + '" cy="' + (y + 4 * k) + '" r="' + (1 * k) + '" fill="#fff"/>';
  /* paupière supérieure (trait épais) */
  s += '<path d="M' + X(-9.5) + ' ' + Yv(-2.5 + plisse) + ' Q ' + X(-2) + ' ' + Yv(-10.5 + plisse) + ' ' + X(9.5) + ' ' + Yv(-6 + plisse) + ' L ' + X(10.5) + ' ' + Yv(-3 + plisse) + ' Q ' + X(0) + ' ' + Yv(-8 + plisse) + ' ' + X(-9.5) + ' ' + Yv(-2 + plisse) + ' Z" fill="' + O + '"/>';
  if(f.plisse) s += '<path d="M' + X(-9) + ' ' + Yv(1.5) + ' Q ' + x + ' ' + Yv(-.5) + ' ' + X(9) + ' ' + Yv(.5) + '" stroke="' + K.peau.trait + '" stroke-width="1" fill="none"/>';
  if(f.cils){
    s += '<path d="M' + X(9) + ' ' + Yv(-5 + plisse) + ' q ' + (4 * d * k) + ' ' + (-1.5 * k) + ' ' + (5.5 * d * k) + ' ' + (-4.5 * k) + ' M' + X(9.6) + ' ' + Yv(-2.5 + plisse) + ' q ' + (3.6 * d * k) + ' ' + (.4 * k) + ' ' + (5.2 * d * k) + ' ' + (-1.8 * k) + '" stroke="' + O + '" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
  }
  /* cils du bas */
  s += '<path d="M' + X(-6) + ' ' + Yv(8) + ' Q ' + x + ' ' + Yv(9.5) + ' ' + X(6) + ' ' + Yv(8) + '" stroke="' + K.peau.trait + '" stroke-width="1" fill="none"/>';
  if(f.rides) s += '<path d="M' + X(11) + ' ' + Yv(1) + ' l' + (4 * d) + ' -2 M' + X(11) + ' ' + Yv(4) + ' l' + (4.5 * d) + ' 1" stroke="' + K.peau.trait + '" stroke-width="1" fill="none" stroke-linecap="round"/>';
  return s;
}


function sourcils(K, f){
  var s = '';
  var ey = f.age === 'enfant' ? 8 : 6, ek = f.age === 'enfant' ? 1.1 : f.age === 'age' ? .9 : 1;
  var sc = f.sourcilsC || K.chev.c[2];
  var sy = ey - 15 * ek - (f.humeur === 'peur' ? 3 : 0);
  var ep = f.sourcils === 'epais' ? 3.6 : f.sourcils === 'touffus' ? 4.4 : f.sexe === 'm' ? 2.8 : 2.2;
  if(f.humeur === 'ment'){
    s += '<path d="M-20 ' + (sy + 1) + ' Q -12 ' + (sy - 2) + ' -4 ' + (sy + 1) + ' M4 ' + (sy - 2) + ' Q 12 ' + (sy - 4) + ' 20 ' + (sy - 1) + '" stroke="' + sc + '" stroke-width="' + ep + '" fill="none" stroke-linecap="round"/>';
  } else if(f.humeur === 'peur'){
    s += '<path d="M-20 ' + (sy + 2) + ' Q -12 ' + (sy - 3) + ' -5 ' + (sy - 2) + ' M5 ' + (sy - 2) + ' Q 12 ' + (sy - 3) + ' 20 ' + (sy + 2) + '" stroke="' + sc + '" stroke-width="' + ep + '" fill="none" stroke-linecap="round"/>';
  } else {
    s += '<path d="M-20 ' + (sy + 1) + ' Q -12 ' + (sy - 3) + ' -4 ' + sy + ' M4 ' + sy + ' Q 12 ' + (sy - 3) + ' 20 ' + (sy + 1) + '" stroke="' + sc + '" stroke-width="' + ep + '" fill="none" stroke-linecap="round"/>';
  }
  return s;
}

/* Visage complet : f = {age, sexe, forme, humeur, regard, lueur, nez, sourcils, bouche, joues, rides, maquillage} */
function visage(K, f){
  var u = K.u, P = K.peau, s = '';
  var forme = VISAGE[f.forme] || VISAGE[f.age] || VISAGE.adulte;
  s += oreilles(K);
  s += '<path d="' + forme + '" fill="' + u('peau') + '"' + c(2.3) + '/>';
  /* ombre propre côté droit + ombre des cheveux sur le front */
  s += '<path d="M15 26 C 22 20 26 12 26 4 L 26 14 C 24 22 18 28 8 32 Z" fill="' + P.ombre + '" opacity=".75"/>';
  s += '<path d="M-26 -8 Q 0 6 26 -8 L 26 -1 Q 0 13 -26 -1 Z" fill="' + P.ombre + '" opacity=".6"/>';
  var ey = f.age === 'enfant' ? 8 : 6, ek = f.age === 'enfant' ? 1.1 : f.age === 'age' ? .9 : 1;
  /* joues */
  var jo = f.joues || .35;
  s += '<ellipse cx="-19" cy="' + (ey + 10) + '" rx="' + (f.age === 'enfant' ? 7 : 6) + '" ry="3.2" fill="' + P.joue + '" opacity="' + jo + '"/><ellipse cx="19" cy="' + (ey + 10) + '" rx="' + (f.age === 'enfant' ? 7 : 6) + '" ry="3.2" fill="' + P.joue + '" opacity="' + jo + '"/>';
  /* yeux (groupe qui cligne) */
  var fo = {taille:ek, cils:f.sexe === 'f', humeur:f.humeur, regard:f.regard || (f.humeur === 'ment' ? 1 : 0), lueur:f.lueur, plisse:f.plisse, rides:f.age === 'age'};
  s += '<g class="pj-yeux">' + oeil(K, -12, ey, -1, fo) + oeil(K, 12, ey, 1, fo) + '</g>';
  if(!f.sansSourcils) s += sourcils(K, f);
  /* nez */
  var ny = ey + 7;
  if(f.nez === 'bec'){
    s += '<path d="M-3 ' + (ny - 10) + ' C 6 ' + (ny - 6) + ' 15 ' + (ny + 6) + ' 9 ' + (ny + 12) + ' C 4 ' + (ny + 16) + ' -4 ' + (ny + 14) + ' -7 ' + (ny + 9) + ' C -2 ' + (ny + 9) + ' 0 ' + (ny + 8) + ' 1 ' + (ny + 5) + ' Z" fill="' + u('peau') + '"' + c(1.8) + '/><path d="M3 ' + (ny + 1) + ' q 3 3 2 7" stroke="#fff" stroke-width="1.4" opacity=".5" fill="none" stroke-linecap="round"/>';
  } else if(f.nez === 'rond'){
    s += '<ellipse cx="0" cy="' + (ny + 5) + '" rx="5" ry="4" fill="' + mix(P.c[1], P.joue, .35) + '"' + c(1.5) + '/><circle cx="-1.5" cy="' + (ny + 3.5) + '" r="1.3" fill="#fff" opacity=".6"/>';
  } else {
    s += '<path d="M0 ' + (ny - 1) + ' l-1.6 4.6 l2.4 .4" stroke="' + P.trait + '" stroke-width="1.4" fill="none" stroke-linecap="round"/>';
  }
  /* bouche */
  var by = ey + 16;
  if(f.age === 'enfant') by -= 1;
  var b = f.bouche || (f.humeur === 'peur' ? 'o' : f.humeur === 'content' ? 'rire' : f.humeur === 'ment' ? 'coin' : f.age === 'enfant' ? 'ouvert' : 'sourire');
  if(b === 'sourire'){
    s += '<path d="M-6 ' + by + ' Q 0 ' + (by + 4) + ' 6 ' + by + '" stroke="#9e4c38" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
    if(f.sexe === 'f') s += '<path d="M-3.5 ' + (by + 1.6) + ' Q 0 ' + (by + 3.6) + ' 3.5 ' + (by + 1.6) + ' Q 0 ' + (by + 2.4) + ' -3.5 ' + (by + 1.6) + ' Z" fill="#e0707a" opacity=".7"/>';
  } else if(b === 'ouvert' || b === 'rire'){
    var w = b === 'rire' ? 8 : 5.5;
    s += '<path d="M' + (-w) + ' ' + (by - 1) + ' Q 0 ' + (by + (b === 'rire' ? 10 : 7)) + ' ' + w + ' ' + (by - 1) + ' Z" fill="#7a2a2a"' + c(1.6) + '/><path d="M' + (-w * .5) + ' ' + (by + 3) + ' Q 0 ' + (by + 1) + ' ' + (w * .5) + ' ' + (by + 3) + ' Q 0 ' + (by + (b === 'rire' ? 8 : 5.5)) + ' ' + (-w * .5) + ' ' + (by + 3) + ' Z" fill="#e8737a"/>';
  } else if(b === 'grand'){ /* sourire trop grand (le maire) */
    s += '<path d="M-12 ' + (by - 2) + ' Q 0 ' + (by + 9) + ' 12 ' + (by - 2) + ' Q 0 ' + (by + 3) + ' -12 ' + (by - 2) + ' Z" fill="#fff"' + c(1.6) + '/><path d="M-8 ' + (by + 1) + ' v 2.5 M-4 ' + (by + 2.2) + ' v 2.8 M0 ' + (by + 2.6) + ' v 2.8 M4 ' + (by + 2.2) + ' v 2.8 M8 ' + (by + 1) + ' v 2.5" stroke="#c9c2d6" stroke-width="1"/>';
  } else if(b === 'o'){
    s += '<ellipse cx="0" cy="' + (by + 2) + '" rx="3" ry="4" fill="#7a2a2a"' + c(1.4) + '/>';
  } else if(b === 'coin'){
    s += '<path d="M-6 ' + (by + 1) + ' Q 0 ' + (by + 3) + ' 7 ' + (by - 2) + '" stroke="#9e4c38" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
  } else if(b === 'plat'){
    s += '<path d="M-5 ' + (by + 1) + ' L 5 ' + (by + 1) + '" stroke="#9e4c38" stroke-width="1.8" stroke-linecap="round"/>';
  }
  if(f.age === 'age'){
    s += '<path d="M-10 ' + (by - 6) + ' q -4 5 -1 9 M10 ' + (by - 6) + ' q 4 5 1 9" stroke="' + P.trait + '" stroke-width="1" fill="none" opacity=".8" stroke-linecap="round"/>';
  }
  if(f.humeur === 'ment'){
    s += '<path class="pj-goutte" d="M28 -16 q 4 6 0 9 q -4 -3 0 -9 Z" fill="#bfe8ff"' + c(1.2) + '/>';
  }
  if(f.humeur === 'peur'){
    s += '<path d="M-20 ' + (ey + 10) + ' l3 -2 l3 2 M14 ' + (ey + 10) + ' l3 -2 l3 2" stroke="#7a9cd6" stroke-width="1.2" fill="none" opacity=".8"/>';
  }
  if(f.suie) s += '<path d="M-20 18 q 4 -3 8 1 q -3 3 -8 -1 Z M10 -2 q 5 -2 8 2 q -4 2 -8 -2 Z M14 22 q 3 -1 5 2" fill="#2a2430" opacity=".55" stroke="#2a2430" stroke-width=".8"/>';
  if(f.farine) s += '<g fill="#fff" opacity=".85"><circle cx="-19" cy="18" r="2.4"/><circle cx="-15" cy="21" r="1.4"/><circle cx="18" cy="-2" r="1.8"/><circle cx="21" cy="18" r="1.6"/></g>';
  if(f.terre) s += '<path d="M14 18 q 4 -2 7 1 q -3 3 -7 -1 Z" fill="#6e4a2a" opacity=".6"/>';
  return s;
}

/* ---------- Barbes ---------- */
function barbe(K, type, coul){
  if(!type || type === 'aucune') return '';
  var g = coul || K.u('chev'), s = '';
  var mou = '<path d="M-12 21 C -7 16 -2 17 0 19.5 C 2 17 7 16 12 21 C 8 24.5 4 22.5 0 21.5 C -4 22.5 -8 24.5 -12 21 Z" fill="' + g + '"' + c(1.5) + '/>';
  if(type === 'moustache') return mou;
  if(type === 'frisee') return '<path d="M-2 20 C -8 16 -14 16 -18 20 C -20 16 -24 16 -25 20 C -24 24 -20 25 -17 23 C -12 25 -6 24 -2 22 Z M2 20 C 8 16 14 16 18 20 C 20 16 24 16 25 20 C 24 24 20 25 17 23 C 12 25 6 24 2 22 Z" fill="' + g + '"' + c(1.4) + '/>';
  if(type === 'fine') return '<path d="M-10 21 Q -5 18 0 20 Q 5 18 10 21 Q 5 20.5 0 21.6 Q -5 20.5 -10 21 Z" fill="' + g + '"' + c(1.1) + '/>';
  if(type === 'courte'){
    s += '<path d="M-26 4 C -26 22 -16 35 0 39 C 16 35 26 22 26 4 C 24 14 19 25 11 27 C 6 23.5 -6 23.5 -11 27 C -19 25 -24 14 -26 4 Z" fill="' + g + '"' + c(1.8) + '/>';
    s += '<path d="M-18 24 l2 3 M-10 31 l1 3 M10 31 l-1 3 M18 24 l-2 3" stroke="' + K.chev.c[2] + '" stroke-width="1.2" opacity=".6"/>';
    return s + mou;
  }
  if(type === 'longue'){
    s += A('pj-barbe', '<path d="M-26 6 C -30 40 -20 78 -2 106 C 0 98 2 98 4 104 C 20 78 30 40 26 6 C 23 18 17 27 9 27 C 5 24 -5 24 -9 27 C -17 27 -23 18 -26 6 Z" fill="' + g + '"' + c(2) + '/>' +
      '<path d="M-14 34 C -14 54 -8 72 -2 88 M0 30 C 0 50 2 70 2 92 M14 34 C 14 52 10 70 6 86" stroke="' + K.chev.c[2] + '" stroke-width="1.3" fill="none" opacity=".45" stroke-linecap="round"/>' +
      '<path d="M-20 22 C -20 40 -14 58 -8 70" stroke="#fff" stroke-width="2" fill="none" opacity=".35" stroke-linecap="round"/>');
    return s + mou;
  }
  return '';
}

/* ==========================================================
   COIFFURES : chaque style a 4 couches
   dos (derrière le corps), nuque (derrière la tête),
   devant (sur le buste), avant (sur le visage)
   ========================================================== */
var DOME = 'M-33 4 C -42 -40 -20 -63 2 -63 C 26 -63 42 -40 33 4 Z';
var DOME_SERRE = 'M-31 0 C -38 -38 -18 -60 2 -60 C 24 -60 38 -38 31 0 Z';

function reflet(K, y){
  y = y || 0;
  return '<path d="M-19 ' + (-40 + y) + ' Q 0 ' + (-49 + y) + ' 21 ' + (-43 + y) + ' L 19.5 ' + (-37.5 + y) + ' Q 0 ' + (-43 + y) + ' -16.5 ' + (-34.5 + y) + ' Z" fill="' + K.chev.hl + '" opacity=".75"/>' +
    '<path d="M-10 ' + (-44 + y) + ' l3 -2.5 M10 ' + (-46.5 + y) + ' l3 -1.5" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".8"/>';
}
function tresse(K, pts, w){
  var d = 'M' + pts.map(function(p){ return p[0] + ' ' + p[1]; }).join(' L ');
  var s = '<path d="' + d + '" stroke="' + O + '" stroke-width="' + (w * 1.45 + 3.6) + '" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' +
          '<path d="' + d + '" stroke="' + K.chev.c[2] + '" stroke-width="' + (w * 1.45) + '" stroke-linecap="round" stroke-linejoin="round" fill="none"/>';
  for(var i = 0; i < pts.length; i++){
    var p = pts[i], q = pts[Math.min(i + 1, pts.length - 1)], r0 = pts[Math.max(i - 1, 0)];
    var a = Math.atan2(q[1] - r0[1], q[0] - r0[0]);
    var deg = a * 180 / Math.PI - 90;
    var sg = i % 2 ? 1 : -1;
    var px = Math.cos(a + Math.PI / 2) * w * .26 * sg, py = Math.sin(a + Math.PI / 2) * w * .26 * sg;
    var cx = p[0] + px, cy = p[1] + py, rot = deg + 32 * sg;
    s += '<ellipse cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" rx="' + (w * .82).toFixed(1) + '" ry="' + (w * .52).toFixed(1) + '" transform="rotate(' + rot.toFixed(1) + ' ' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ')" fill="' + K.u('chev') + '"' + c(1.6) + '/>';
    s += '<ellipse cx="' + (cx - Math.cos(a) * w * .1).toFixed(1) + '" cy="' + (cy - Math.sin(a) * w * .18).toFixed(1) + '" rx="' + (w * .42).toFixed(1) + '" ry="' + (w * .14).toFixed(1) + '" transform="rotate(' + rot.toFixed(1) + ' ' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ')" fill="' + K.chev.hl + '" opacity=".6"/>';
  }
  return s;
}
function ruban(K, x, y, coul){
  coul = coul || K.u('acc');
  return '<path d="M' + x + ' ' + y + ' l-9 -5 l1 10 Z M' + x + ' ' + y + ' l9 -5 l-1 10 Z" fill="' + coul + '"' + c(1.4) + '/><circle cx="' + x + '" cy="' + y + '" r="3" fill="' + coul + '"' + c(1.2) + '/>';
}


/* Contour festonné (boucles) : arcs entre les points, bombés à gauche du sens de parcours */
function festons(pts, r, ferme, suite){
  var d = suite ? '' : 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
  for(var i = 1; i < pts.length; i++){
    var p = pts[i], q = pts[i - 1];
    var dist = Math.hypot(p[0] - q[0], p[1] - q[1]);
    var rr = Math.max(r, dist / 2 + .1);
    d += (suite && i === 1 ? ' L' + q[0].toFixed(1) + ' ' + q[1].toFixed(1) : '') + ' A ' + rr.toFixed(1) + ' ' + rr.toFixed(1) + ' 0 0 1 ' + p[0].toFixed(1) + ' ' + p[1].toFixed(1);
  }
  return d + (ferme ? ' Z' : '');
}

/* ==========================================================
   GARÇONS (héros) : outils de mèches, visage, barbes
   Les villageois gardent visage(), barbe() et COIFF_V.
   ========================================================== */
function f1(v){ return Math.round(v * 10) / 10; }
function pp(p){ return f1(p[0]) + ' ' + f1(p[1]); }
function bez(P, t){
  var u = 1 - t, n = P.length;
  function m(i){
    return n === 2 ? u * P[0][i] + t * P[1][i]
      : n === 3 ? u * u * P[0][i] + 2 * u * t * P[1][i] + t * t * P[2][i]
      : u * u * u * P[0][i] + 3 * u * u * t * P[1][i] + 3 * u * t * t * P[2][i] + t * t * t * P[3][i];
  }
  return [m(0), m(1)];
}
/* Courbe lissée (Catmull-Rom → Bézier) passant par pts, sans le M de départ */
function catmull(pts){
  var d = '';
  for(var i = 0; i < pts.length - 1; i++){
    var p0 = pts[Math.max(i - 1, 0)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(i + 2, pts.length - 1)];
    d += ' C ' + pp([p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]) + ' ' + pp([p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]) + ' ' + pp(p2);
  }
  return d;
}
/* Mèche effilée le long d'une courbe de Bézier P (racine → pointe).
   w : largeur à la racine ; o.ex : effilement (< 1 = mèche pleine) ; o.b : renflement ;
   o.k : allonge la mèche depuis sa racine (âgé : mèches plus courtes) */
function brin(P, w, o){
  o = o || {};
  var k = o.k || 1, n = o.n || 8, ex = o.ex == null ? .9 : o.ex, b = o.b == null ? .3 : o.b, i;
  if(k !== 1) P = P.map(function(p, j){ return j ? [P[0][0] + (p[0] - P[0][0]) * k, P[0][1] + (p[1] - P[0][1]) * k] : p; });
  var C = [];
  for(i = 0; i <= n; i++) C.push(bez(P, i / n));
  var L = [], R = [];
  for(i = 0; i < n; i++){
    var a = C[Math.max(i - 1, 0)], z = C[i + 1], dx = z[0] - a[0], dy = z[1] - a[1], l = Math.hypot(dx, dy) || 1;
    var t = i / n, ww = w / 2 * Math.pow(1 - t, ex) * (1 + b * Math.sin(Math.PI * t));
    L.push([C[i][0] - dy / l * ww, C[i][1] + dx / l * ww]);
    R.push([C[i][0] + dy / l * ww, C[i][1] - dx / l * ww]);
  }
  R.reverse();
  return 'M' + pp(L[0]) + catmull(L.concat([C[n]])) + catmull([C[n]].concat(R)) + ' Z';
}
/* Liste de mèches [[points], largeur, options?] → chemins */
function brins(L, k){ return L.map(function(m){ return typeof m === 'string' ? m : brin(m[0], m[1], {k:m[2] && m[2].fixe ? 1 : (k || 1), ex:m[2] && m[2].ex, b:m[2] && m[2].b}); }); }
/* Masse de cheveux : UN contour épais autour de l'ensemble, puis le remplissage
   (les mèches se fondent, seul le contour extérieur est tracé) */
function masse(L, fill, sw){
  sw = sw || 2.2;
  return '<path d="' + L.join(' ') + '" fill="none" stroke="' + O + '" stroke-width="' + (sw * 2) + '" stroke-linejoin="round"/>' +
    '<g fill="' + fill + '">' + L.map(function(d){ return '<path d="' + d + '"/>'; }).join('') + '</g>';
}
/* Traits effilés (séparations de mèches qui partent d'un creux, ou fils de couleur) */
function traits(L, coul, op){
  return '<g fill="' + (coul || O) + '"' + (op != null ? ' opacity="' + op + '"' : '') + '>' +
    L.map(function(t){ return '<path d="' + brin(t[0], t[1] || 2.4, {b:0, ex:1.15, n:6}) + '"/>'; }).join('') + '</g>';
}
/* Bande de lumière sur le crâne : bord haut lisse, bord bas en dents (reflet « anime ») */
function eclat(K, cx, cy, rx, ry, a0, a1, n, h, op){
  var R = Math.PI / 180, i, m = 2 * n;
  function P(a, d){ return [cx + Math.cos(a * R) * (rx - d), cy + Math.sin(a * R) * (ry - d)]; }
  var d = 'M' + pp(P(a0, 0)) + ' A ' + rx + ' ' + ry + ' 0 0 1 ' + pp(P(a1, 0));
  for(i = m; i >= 0; i--){
    var a = a0 + (a1 - a0) * i / m, t = Math.sin(Math.PI * i / m);
    var dd = (i % 2 ? h * (i % 4 === 1 ? 1 : .72) : h * .28) * (.35 + .65 * t) + 1.4 * t;
    d += ' L ' + pp(P(a, dd));
  }
  var p0 = P(a0 + (a1 - a0) * .3, 1.4), p1 = P(a0 + (a1 - a0) * .62, 1.2);
  return '<path d="' + d + ' Z" fill="' + K.chev.hl + '" opacity="' + (op || .75) + '"/>' +
    '<path d="M' + pp(p0) + ' l2.6 -1.6 M' + pp(p1) + ' l2.6 -.6" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".85"/>';
}

/* ---------- Visage des héros garçons ---------- */
var VISAGE_M = {
  adulte:'M-26 -10 C -26 -32 26 -32 26 -10 L 26 5 C 26 13 24.2 19 20.4 24 C 15.6 30.2 9.4 34.4 3.4 35.8 Q 0 36.5 -3.4 35.8 C -9.4 34.4 -15.6 30.2 -20.4 24 C -24.2 19 -26 13 -26 5 Z',
  enfant:'M-27 -10 C -27 -34 27 -34 27 -10 L 27 8 C 27 20 21.4 27.6 13 31.4 C 8 33.4 3.6 34 0 34 C -3.6 34 -8 33.4 -13 31.4 C -21.4 27.6 -27 20 -27 8 Z',
  age:'M-26 -10 C -26 -32 26 -32 26 -10 L 26 6 C 26 15 24.4 21 20.6 26 C 15.6 32.4 8.6 35.8 0 36.4 C -8.6 35.8 -15.6 32.4 -20.6 26 C -24.4 21 -26 15 -26 6 Z'
};

/* Œil de garçon : amande plus étroite, paupière droite et épaisse, pas de cils */
function oeilM(K, x, y, d, f){
  var u = K.u, k = f.taille || 1, s = '', P = K.peau;
  var enf = f.age === 'enfant', vx = f.age === 'age';
  function X(v){ return f1(x + v * k * d); }
  function Y(v){ return f1(y + v * k); }
  var ht = enf ? 6.8 : vx ? 4.6 : 5.8, hb = enf ? 6.2 : vx ? 4.4 : 5.2;
  var blanc = 'M' + X(-8.8) + ' ' + Y(-.4) + ' C ' + X(-6.6) + ' ' + Y(-ht) + ' ' + X(4.4) + ' ' + Y(-ht - 1) + ' ' + X(9.8) + ' ' + Y(-2.8) +
    ' C ' + X(9.9) + ' ' + Y(hb * .6) + ' ' + X(5) + ' ' + Y(hb) + ' ' + X(.2) + ' ' + Y(hb) +
    ' C ' + X(-4.6) + ' ' + Y(hb) + ' ' + X(-8.4) + ' ' + Y(3.6) + ' ' + X(-8.8) + ' ' + Y(-.4) + ' Z';
  var lid = f.lueur, cid = K.n('oe' + (d < 0 ? 'g' : 'd'));
  if(lid) s += '<circle cx="' + x + '" cy="' + y + '" r="' + f1(12 * k) + '" fill="' + u('lueur') + '" opacity=".7" class="pj-pulse"/>';
  s += '<clipPath id="' + cid + '"><path d="' + blanc + '"/></clipPath>';
  s += '<path d="' + blanc + '" fill="#fff"/>';
  var ox = x + (f.regard || 0) * k * 3, rx = (enf ? 5.8 : 5.3) * k, ry = (enf ? 7 : 6.4) * k, cy = y + .9 * k;
  s += '<g clip-path="url(#' + cid + ')">' +
    '<ellipse cx="' + f1(ox) + '" cy="' + f1(cy) + '" rx="' + f1(rx) + '" ry="' + f1(ry) + '" fill="' + u('iris') + '"/>' +
    (lid ? '<ellipse cx="' + f1(ox) + '" cy="' + f1(cy + .4 * k) + '" rx="' + f1(1.3 * k) + '" ry="' + f1(4.6 * k) + '" fill="#06140c"/>'
         : '<ellipse cx="' + f1(ox) + '" cy="' + f1(cy + .3 * k) + '" rx="' + f1(2.4 * k) + '" ry="' + f1(3.3 * k) + '" fill="#0a0612"/>') +
    '<ellipse cx="' + f1(ox) + '" cy="' + f1(cy) + '" rx="' + f1(rx) + '" ry="' + f1(ry) + '" fill="none" stroke="' + O + '" stroke-width="' + f1(k) + '" opacity=".55"/>' +
    '<ellipse cx="' + x + '" cy="' + f1(y - ht * k) + '" rx="' + f1(12 * k) + '" ry="' + f1(3.6 * k) + '" fill="#2a1d48" opacity=".22"/>' +
    '</g>';
  s += '<ellipse cx="' + f1(ox + 2.2 * k) + '" cy="' + f1(y - 1.8 * k) + '" rx="' + f1(1.9 * k) + '" ry="' + f1(2.4 * k) + '" fill="#fff"/><circle cx="' + f1(ox - 2 * k) + '" cy="' + f1(y + 3.4 * k) + '" r="' + f1(.9 * k) + '" fill="#fff"/>';
  /* paupière supérieure : trait épais et droit, petit coin tombant à l'extérieur */
  s += '<path d="M' + X(-9.6) + ' ' + Y(.4) + ' C ' + X(-7.4) + ' ' + Y(-ht - 1.4) + ' ' + X(4) + ' ' + Y(-ht - 2.8) + ' ' + X(10.8) + ' ' + Y(-3.8) +
    ' L ' + X(11.8) + ' ' + Y(-1.2) + ' L ' + X(9.8) + ' ' + Y(-2.4) +
    ' C ' + X(4.4) + ' ' + Y(-ht - .7) + ' ' + X(-6.6) + ' ' + Y(-ht + .2) + ' ' + X(-8.8) + ' ' + Y(-.4) + ' Z" fill="' + O + '"/>';
  if(!enf) s += '<path d="M' + X(-5.6) + ' ' + Y(-ht - 3.4) + ' Q ' + X(2) + ' ' + Y(-ht - 5) + ' ' + X(9.4) + ' ' + Y(-ht - 2.6) + '" stroke="' + P.trait + '" stroke-width="1" fill="none" stroke-linecap="round" opacity=".75"/>';
  s += '<path d="M' + X(1.5) + ' ' + Y(hb + .5) + ' Q ' + X(7.2) + ' ' + Y(hb) + ' ' + X(9.8) + ' ' + Y(1) + '" stroke="' + O + '" stroke-width="1.3" fill="none" stroke-linecap="round" opacity=".6"/>';
  if(enf) s += '<path d="M' + X(-5) + ' ' + Y(hb + 1.6) + ' Q ' + X(0) + ' ' + Y(hb + 2.6) + ' ' + X(5) + ' ' + Y(hb + 1.6) + '" stroke="' + P.trait + '" stroke-width="1" fill="none" opacity=".7"/>';
  if(vx){
    s += '<path d="M' + X(-6) + ' ' + Y(hb + 2.6) + ' Q ' + X(0) + ' ' + Y(hb + 4.4) + ' ' + X(6.5) + ' ' + Y(hb + 2.4) + '" stroke="' + P.trait + '" stroke-width="1" fill="none" stroke-linecap="round" opacity=".8"/>';
    s += '<path d="M' + X(12.4) + ' ' + Y(-1) + ' l' + f1(4 * d) + ' -2 M' + X(12.6) + ' ' + Y(2) + ' l' + f1(4.4 * d) + ' .2 M' + X(12) + ' ' + Y(4.8) + ' l' + f1(3.6 * d) + ' 1.8" stroke="' + P.trait + '" stroke-width="1" fill="none" stroke-linecap="round"/>';
  }
  return s;
}

/* Sourcils de garçon : pleins, épais côté nez, presque droits */
function sourcilsM(K, f){
  var ey = f.age === 'enfant' ? 8 : 6, ek = f.age === 'enfant' ? 1.1 : f.age === 'age' ? .9 : 1;
  var sy = ey - 15 * ek + 1, col = f.sourcilsC || K.chev.c[2], s = '';
  var e = f.age === 'age' ? 1.25 : f.age === 'enfant' ? .9 : 1;
  [-1, 1].forEach(function(d){
    function X(v){ return f1(v * d); }
    s += '<path d="M' + X(4.6) + ' ' + f1(sy + 1.8 * e) + ' C ' + X(4.4) + ' ' + f1(sy - 1.6 * e) + ' ' + X(9) + ' ' + f1(sy - 2.6 * e) + ' ' + X(14) + ' ' + f1(sy - 2.6 * e) +
      ' C ' + X(17.6) + ' ' + f1(sy - 2.6 * e) + ' ' + X(20.4) + ' ' + f1(sy - 1.4) + ' ' + X(22) + ' ' + f1(sy + .6) +
      ' C ' + X(18.4) + ' ' + f1(sy - .2) + ' ' + X(13) + ' ' + f1(sy) + ' ' + X(9) + ' ' + f1(sy + .8) +
      ' C ' + X(7) + ' ' + f1(sy + 1.2) + ' ' + X(5.6) + ' ' + f1(sy + 1.8 * e) + ' ' + X(4.6) + ' ' + f1(sy + 1.8 * e) + ' Z" fill="' + col + '" stroke="' + O + '" stroke-width=".8" stroke-linejoin="round" stroke-opacity=".6"/>';
  });
  return s;
}

function visageM(K, f){
  var u = K.u, P = K.peau, s = '';
  var age = f.age === 'enfant' ? 'enfant' : f.age === 'age' ? 'age' : 'adulte';
  var forme = VISAGE_M[age], cid = K.n('vis');
  var ey = age === 'enfant' ? 8 : 6, ek = age === 'enfant' ? 1.1 : age === 'age' ? .9 : 1;
  s += oreilles(K);
  s += '<clipPath id="' + cid + '"><path d="' + forme + '"/></clipPath>';
  s += '<path d="' + forme + '" fill="' + u('peau') + '"' + c(2.3) + '/>';
  /* ombre propre côté droit (joue, mâchoire) et ombre de la frange */
  s += '<g clip-path="url(#' + cid + ')">' +
    '<path d="M17 -30 C 25 -6 24 16 12 30 C 8 35 2 38 -4 40 L 40 40 L 40 -30 Z" fill="' + P.ombre + '" opacity=".6"/>' +
    '<path d="M-30 -22 Q 0 -6 30 -22 L 30 -13 Q 0 3 -30 -13 Z" fill="' + P.ombre + '" opacity=".5"/>' +
    '</g>';
  var jr = age === 'enfant' ? 7 : 5.4, jo = age === 'enfant' ? .34 : .18, jy = ey + (age === 'enfant' ? 10 : 9.4), jry = age === 'enfant' ? 3.2 : 2.4;
  s += '<ellipse cx="-18.5" cy="' + jy + '" rx="' + jr + '" ry="' + jry + '" fill="' + P.joue + '" opacity="' + jo + '"/><ellipse cx="18.5" cy="' + jy + '" rx="' + jr + '" ry="' + jry + '" fill="' + P.joue + '" opacity="' + jo + '"/>';
  var fo = {taille:ek, age:age, regard:f.regard || 0, lueur:f.lueur};
  s += '<g class="pj-yeux">' + oeilM(K, -12, ey, -1, fo) + oeilM(K, 12, ey, 1, fo) + '</g>';
  if(!f.sansSourcils) s += sourcilsM(K, f);
  /* nez : ombre à droite, petite arête */
  var ny = ey + 7;
  if(age === 'enfant'){
    s += '<path d="M1.8 ' + f1(ny - 1) + ' C 3.6 ' + f1(ny + 1.4) + ' 3.4 ' + f1(ny + 3) + ' 1.4 ' + f1(ny + 3.4) + ' C .4 ' + f1(ny + 3.6) + ' -.6 ' + f1(ny + 3.4) + ' -1.4 ' + f1(ny + 3) + ' C .6 ' + f1(ny + 2.6) + ' 2.4 ' + f1(ny + 1.4) + ' 1.8 ' + f1(ny - 1) + ' Z" fill="' + P.ombre + '" opacity=".75"/>' +
      '<path d="M2.2 ' + f1(ny + .6) + ' Q 3.4 ' + f1(ny + 2.6) + ' 1.4 ' + f1(ny + 3.3) + ' Q .2 ' + f1(ny + 3.6) + ' -1.2 ' + f1(ny + 3) + '" stroke="' + P.trait + '" stroke-width="1.3" fill="none" stroke-linecap="round"/>';
  } else {
    s += '<path d="M1 ' + f1(ny - 7) + ' C 2.8 ' + f1(ny - 2) + ' 4.6 ' + f1(ny + 1) + ' 4.2 ' + f1(ny + 2.6) + ' C 2.8 ' + f1(ny + 3.9) + ' .4 ' + f1(ny + 3.7) + ' -1.6 ' + f1(ny + 3.1) + ' C 1.2 ' + f1(ny + 2.2) + ' 2.4 ' + f1(ny - 1) + ' 1 ' + f1(ny - 7) + ' Z" fill="' + P.ombre + '" opacity=".75"/>' +
      '<path d="M2.4 ' + f1(ny - 1.4) + ' Q 4.2 ' + f1(ny + 1.8) + ' 2.8 ' + f1(ny + 2.9) + ' Q 1 ' + f1(ny + 3.8) + ' -1.6 ' + f1(ny + 3.1) + '" stroke="' + P.trait + '" stroke-width="1.4" fill="none" stroke-linecap="round"/>' +
      '<path d="M-.4 ' + f1(ny - 3.4) + ' l-.3 2.6" stroke="#fff" stroke-width="1.1" opacity=".45" stroke-linecap="round"/>';
  }
  /* bouche */
  var by = ey + 16 - (age === 'enfant' ? 1 : 0);
  if(age === 'enfant'){
    s += '<path d="M-5.5 ' + (by - 1) + ' Q 0 ' + (by + 7) + ' 5.5 ' + (by - 1) + ' Z" fill="#7a2a2a"' + c(1.6) + '/><path d="M-2.75 ' + (by + 3) + ' Q 0 ' + (by + 1) + ' 2.75 ' + (by + 3) + ' Q 0 ' + (by + 5.5) + ' -2.75 ' + (by + 3) + ' Z" fill="#e8737a"/>';
  } else {
    s += '<path d="M-6.4 ' + f1(by - .4) + ' Q -.6 ' + f1(by + 3.8) + ' 6.6 ' + f1(by - 1.2) + '" stroke="#8e4434" stroke-width="1.8" fill="none" stroke-linecap="round"/>' +
      '<path d="M-2.6 ' + f1(by + 4.6) + ' Q 0 ' + f1(by + 5.6) + ' 2.6 ' + f1(by + 4.6) + '" stroke="' + P.trait + '" stroke-width="1" fill="none" stroke-linecap="round" opacity=".6"/>';
  }
  if(age === 'age'){
    s += '<path d="M-10 ' + (by - 6) + ' q -4 5 -1 9.5 M10 ' + (by - 6) + ' q 4 5 1 9.5" stroke="' + P.trait + '" stroke-width="1.1" fill="none" opacity=".8" stroke-linecap="round"/>' +
      '<path d="M-12 -19 Q 0 -22 12 -19 M-9 -15 Q 0 -17.4 9 -15" stroke="' + P.trait + '" stroke-width="1" fill="none" opacity=".6" stroke-linecap="round"/>';
  }
  return s;
}

/* Barbes des héros, ajustées à la mâchoire du garçon */
function barbeM(K, type){
  if(!type || type === 'aucune') return '';
  var g = K.u('chev'), s = '';
  var mou = '<path d="M0 18 C -2.6 16.4 -7.4 16.2 -10.2 18.4 C -11.8 19.8 -12.8 21.6 -13.8 23.4 C -11.4 22 -8.8 21.2 -6 21.2 C -3.4 21.2 -1.4 20.8 0 19.8 C 1.4 20.8 3.4 21.2 6 21.2 C 8.8 21.2 11.4 22 13.8 23.4 C 12.8 21.6 11.8 19.8 10.2 18.4 C 7.4 16.2 2.6 16.4 0 18 Z" fill="' + g + '"' + c(1.5) + '/>' +
    '<path d="M-9.4 18.8 q 3 -1.2 6 -.2" stroke="' + K.chev.hl + '" stroke-width="1.1" fill="none" opacity=".6" stroke-linecap="round"/>';
  if(type === 'moustache') return mou;
  var haut = ' L 23.2 -2 C 23.4 6 22.4 12 19 16 C 15.8 19.6 11.6 20.6 8.4 21.4 C 6 26 3 27.6 0 27.6 C -3 27.6 -6 26 -8.4 21.4 C -11.6 20.6 -15.8 19.6 -19 16 C -22.4 12 -23.4 6 -23.2 -2 Z';
  if(type === 'courte'){
    s += '<path d="M-26.6 -4 L -26.9 6 C -26.9 15 -24.8 21.4 -21 26.4 C -16 33.4 -8.6 39 -2.6 40.6 L 0 43.2 L 2.6 40.6 C 8.6 39 16 33.4 21 26.4 C 24.8 21.4 26.9 15 26.9 6 L 26.6 -4' + haut + '" fill="' + g + '"' + c(1.9) + '/>';
    s += traits([[[[-20, 27], [-17, 30], [-13, 33]], 1.6], [[[20, 27], [17, 30], [13, 33]], 1.6], [[[-7, 37], [-5, 34], [-4, 31]], 1.5], [[[7, 37], [5, 34], [4, 31]], 1.5]], K.chev.c[2], .55);
    s += '<path d="M-22 6 C -22 14 -19 21 -14 26" stroke="' + K.chev.hl + '" stroke-width="1.6" fill="none" opacity=".45" stroke-linecap="round"/>';
    return s + mou;
  }
  if(type === 'longue'){
    s += A('pj-barbe', '<path d="M-26.6 -4 L -26.9 6 C -28.6 30 -22 58 -9.4 82 C -6 88 -3 95 -1 101 L 1 97 L 3.2 102 C 5 95 7.2 89 9.8 84 C 22.4 60 28.6 30 26.9 6 L 26.6 -4' + haut + '" fill="' + g + '"' + c(2) + '/>' +
      traits([[[[-14, 36], [-13, 56], [-6, 76]], 1.6], [[[0, 32], [1, 56], [1, 84]], 1.6], [[[14, 36], [12, 56], [7, 74]], 1.6]], K.chev.c[2], .5) +
      '<path d="M-21 20 C -21 38 -16 56 -9 70" stroke="#fff" stroke-width="2" fill="none" opacity=".35" stroke-linecap="round"/>');
    return s + mou;
  }
  return barbe(K, type);
}

/* Calotte avant commune (dessus du crâne, bord bas sous la frange) */
var CALOTTE = 'M-31 -4 C -35 -35 -17 -57 2 -57 C 24 -57 37 -35 31 -4 C 27 -15 20 -22 11 -25 C 3 -27 -7 -27 -15 -24 C -23 -20 -28 -13 -31 -4 Z';
var DOS_M = 'M-32 8 C -42 -36 -21 -60 2 -60 C 26 -60 42 -36 32 8 Z';
function kAge(K){ return K.age === 'age' ? .8 : K.age === 'enfant' ? .92 : 1; }

var COIFF = {
  /* ---------- Filles ---------- */
  queue:{
    dos:function(K){ return A('pj-meche', '<path d="M4 -56 C 40 -70 64 -40 56 -4 C 52 22 60 48 46 78 C 42 62 36 46 32 30 C 26 8 24 -22 6 -40 Z" fill="' + K.u('chev') + '"' + c(2.2) + '/>' +
      '<path d="M40 -30 C 50 -6 48 24 50 52" stroke="' + K.chev.hl + '" stroke-width="2" fill="none" opacity=".55" stroke-linecap="round"/><path d="M30 -18 C 34 6 38 30 42 56" stroke="' + K.chev.c[2] + '" stroke-width="1.4" fill="none" opacity=".45"/>', ' style="transform-origin:8px -50px"'); },
    nuque:function(K){ return '<path d="' + DOME + '" fill="' + K.u('chev') + '"' + c(2.2) + '/>'; },
    avant:function(K){
      return '<path d="M-28 -8 C -33 6 -32 20 -26 30 C -25 18 -23 6 -21 -4 Z M28 -8 C 33 6 32 20 26 30 C 25 18 23 6 21 -4 Z" fill="' + K.u('chev') + '"' + c(1.9) + '/>' +
        '<path d="M-30 -2 C -34 -32 -18 -56 4 -56 C 27 -56 38 -34 31 -3 C 28 -12 25 -18 20 -23 C 18 -14 14 -8 8 -4 C 10 -14 8 -22 2 -29 C -4 -19 -12 -13 -22 -10 C -18 -16 -16 -22 -16 -28 C -20 -19 -25 -11 -30 -2 Z" fill="' + K.u('chev') + '"' + c(2.2) + '/>' +
        '<path d="M20 -23 C 18 -14 14 -8 8 -4 C 10 -14 8 -22 2 -29 C 10 -30 16 -28 20 -23 Z" fill="' + K.chev.c[2] + '" opacity=".35"/>' +
        reflet(K) + ruban(K, 22, -52);
    }
  },
  tresses:{
    nuque:function(K){ return '<path d="' + DOME + '" fill="' + K.u('chev') + '"' + c(2.2) + '/>'; },
    devant:function(K){
      var g = [], d = [];
      for(var i = 0; i < 10; i++){ g.push([-31 - i * .6, 12 + i * 9.6]); d.push([31 + i * .6, 12 + i * 9.6]); }
      return tresse(K, g, 9) + tresse(K, d, 9) +
        '<path d="M-37 102 l-3 9 l4 -2 l2 4 l2 -4 l4 2 l-3 -9 Z M37 102 l3 9 l-4 -2 l-2 4 l-2 -4 l-4 2 l3 -9 Z" fill="' + K.u('chev') + '"' + c(1.4) + '/>' +
        ruban(K, -36, 98) + ruban(K, 36, 98);
    },
    avant:function(K){
      return '<path d="M-31 2 C -35 -32 -18 -57 0 -57 C 18 -57 35 -32 31 2 C 28 -10 24 -18 16 -26 C 11 -22 6 -16 2 -9 L 0 -45 L -2 -9 C -6 -16 -11 -22 -16 -26 C -24 -18 -28 -10 -31 2 Z" fill="' + K.u('chev') + '"' + c(2.2) + '/>' +
        '<path d="M-30 0 C -32 8 -31 14 -29 18 L -26 4 Z M30 0 C 32 8 31 14 29 18 L 26 4 Z" fill="' + K.u('chev') + '"' + c(1.6) + '/>' +
        '<path d="M0 -55 L 0 -45" stroke="' + O + '" stroke-width="1.6"/>' + reflet(K, 1);
    }
  },
  carre:{
    nuque:function(K){ return '<path d="M-37 26 C -46 -10 -42 -62 0 -63 C 42 -62 46 -10 37 26 C 31 33 23 31 19 26 L -19 26 C -23 31 -31 33 -37 26 Z" fill="' + K.u('chev') + '"' + c(2.2) + '/>'; },
    avant:function(K){
      return '<path d="M-31 25 C -36 -10 -31 -57 0 -57 C 31 -57 36 -10 31 25 C 28 30 23 31 19 27 C 24 14 25 2 24 -11 L -24 -11 C -25 2 -24 14 -19 27 C -23 31 -28 30 -31 25 Z" fill="' + K.u('chev') + '"' + c(2.2) + '/>' +
        '<path d="M-14 -12 L -13 -24 M-4 -12 L -4 -26 M6 -12 L 6 -26 M15 -12 L 14 -24" stroke="' + K.chev.c[2] + '" stroke-width="1.3" opacity=".5"/>' +
        '<path d="M24 -11 C 25 2 24 14 19 27 C 23 31 28 30 31 25 C 33 12 33 0 31 -12 Z" fill="' + K.chev.c[2] + '" opacity=".3"/>' + reflet(K, 2) +
        '<path d="M-20 -40 l6 -6 l1 6 Z" fill="' + K.u('acc') + '"' + c(1.2) + '/>';
    }
  },
  longs:{
    dos:function(K){ return '<path d="M-36 -14 C -50 26 -42 66 -52 104 C -46 126 -32 140 -18 146 C -10 138 -2 140 4 146 C 14 140 22 142 30 146 C 40 136 52 122 52 104 C 42 66 50 26 36 -14 Z" fill="' + K.u('chev') + '"' + c(2.2) + '/>' +
      '<path d="M-40 30 C -44 60 -40 90 -46 112 M44 30 C 48 60 44 90 46 112" stroke="' + K.chev.hl + '" stroke-width="2" fill="none" opacity=".5" stroke-linecap="round"/>'; },
    nuque:function(K){ return '<path d="' + DOME + '" fill="' + K.u('chev') + '"' + c(2.2) + '/>'; },
    devant:function(K){ return A('pj-meche2', '<path d="M-27 2 C -38 30 -30 56 -40 86 C -34 98 -24 98 -20 90 C -20 72 -27 46 -17 12 Z" fill="' + K.u('chev') + '"' + c(2) + '/>' +
      '<path d="M-30 26 C -34 46 -30 64 -34 80" stroke="' + K.chev.hl + '" stroke-width="1.8" fill="none" opacity=".55" stroke-linecap="round"/>', ' style="transform-origin:-24px 4px"'); },
    avant:function(K){
      return '<path d="M28 -8 C 33 8 33 22 28 32 C 26 20 24 8 21 -2 Z" fill="' + K.u('chev') + '"' + c(1.8) + '/>' +
        '<path d="M-31 2 C -35 -32 -16 -57 6 -57 C 28 -57 38 -34 31 -2 C 27 -12 22 -20 14 -25 C 16 -14 12 -4 4 2 C 6 -10 2 -20 -6 -26 C -12 -18 -20 -14 -26 -12 C -26 -6 -28 -2 -31 2 Z" fill="' + K.u('chev') + '"' + c(2.2) + '/>' +
        '<path d="M14 -25 C 16 -14 12 -4 4 2 C 6 -10 2 -20 -6 -26 C 2 -29 9 -28 14 -25 Z" fill="' + K.chev.c[2] + '" opacity=".3"/>' + reflet(K) +
        '<g transform="translate(-24 -44)"><circle r="5" fill="#fff"' + c(1.2) + '/><circle r="2.2" fill="#ffd36a"/></g>';
    }
  },
  chignon:{
    nuque:function(K){
      return '<path d="' + DOME + '" fill="' + K.u('chev') + '"' + c(2.2) + '/>' +
        '<ellipse cx="4" cy="-60" rx="19" ry="15" fill="' + K.u('chev') + '"' + c(2.2) + '/><path d="M-10 -62 C -6 -72 12 -74 18 -64 C 20 -56 8 -50 2 -56 C -2 -60 4 -66 10 -62" stroke="' + K.chev.c[2] + '" stroke-width="1.8" fill="none" opacity=".55" stroke-linecap="round"/>' +
        '<path d="M-6 -70 q 7 -5 15 -2" stroke="' + K.chev.hl + '" stroke-width="2.4" fill="none" opacity=".75" stroke-linecap="round"/>';
    },
    avant:function(K){
      return '<path d="M-30 -2 C -34 -34 -18 -57 0 -57 C 18 -57 34 -34 30 -2 C 27 -18 18 -30 2 -33 C -2 -26 -6 -24 -8 -32 C -20 -29 -27 -18 -30 -2 Z" fill="' + K.u('chev') + '"' + c(2.2) + '/>' +
        '<path d="M-26 -14 C -30 0 -28 14 -24 22 C -24 10 -23 0 -21 -8 Z M26 -14 C 30 0 28 14 24 22 C 24 10 23 0 21 -8 Z" fill="' + K.u('chev') + '"' + c(1.5) + '/>' +
        '<path d="M-14 -50 C -8 -40 -4 -36 2 -33 M16 -50 C 10 -42 6 -38 2 -33" stroke="' + K.chev.c[2] + '" stroke-width="1.3" fill="none" opacity=".45"/>' + reflet(K, -2) +
        '<path d="M16 -74 L 28 -54" stroke="' + K.u('or') + '" stroke-width="2.6" stroke-linecap="round"/><circle cx="15" cy="-75" r="3" fill="' + K.u('acc') + '"' + c(1.1) + '/>';
    }
  },
  couettes:{
    dos:function(K){
      function q(d){ return '<path d="M' + (24 * d) + ' -46 C ' + (54 * d) + ' -54 ' + (70 * d) + ' -30 ' + (64 * d) + ' 0 C ' + (60 * d) + ' 20 ' + (66 * d) + ' 34 ' + (58 * d) + ' 50 C ' + (54 * d) + ' 38 ' + (48 * d) + ' 28 ' + (46 * d) + ' 14 C ' + (44 * d) + ' -6 ' + (40 * d) + ' -26 ' + (24 * d) + ' -34 Z" fill="' + K.u('chev') + '"' + c(2.1) + '/>' +
        '<path d="M' + (52 * d) + ' -26 C ' + (58 * d) + ' -8 ' + (56 * d) + ' 12 ' + (58 * d) + ' 30" stroke="' + K.chev.hl + '" stroke-width="2" fill="none" opacity=".55" stroke-linecap="round"/>'; }
      return A('pj-meche', q(-1), ' style="transform-origin:-26px -44px"') + A('pj-meche', q(1), ' style="transform-origin:26px -44px;animation-delay:-1.2s"');
    },
    nuque:function(K){ return '<path d="' + DOME + '" fill="' + K.u('chev') + '"' + c(2.2) + '/>'; },
    avant:function(K){
      return '<path d="M-30 0 C -34 -32 -18 -57 0 -57 C 18 -57 34 -32 30 0 C 27 -10 24 -16 20 -20 L 16 -9 L 11 -20 L 6 -8 L 0 -21 L -6 -8 L -11 -20 L -16 -9 L -20 -20 C -24 -16 -27 -10 -30 0 Z" fill="' + K.u('chev') + '"' + c(2.2) + '/>' +
        reflet(K) + ruban(K, -30, -42) + ruban(K, 30, -42);
    }
  },
  courte:{
    nuque:function(K){ return '<path d="M-32 6 C -39 -38 -20 -61 2 -61 C 24 -61 39 -38 32 6 C 30 12 26 12 25 6 Z" fill="' + K.u('chev') + '"' + c(2.2) + '/>'; },
    avant:function(K){
      return '<path d="M-30 -2 C -34 -34 -16 -56 6 -56 C 28 -56 37 -34 30 -4 C 28 2 26 6 24 8 C 24 -4 22 -12 18 -18 C 14 -12 8 -8 0 -6 C 4 -12 4 -18 2 -24 C -6 -16 -14 -12 -24 -12 C -26 -8 -28 -4 -30 -2 Z" fill="' + K.u('chev') + '"' + c(2.2) + '/>' +
        '<path d="M-28 -6 C -31 2 -30 8 -27 12 L -24 -2 Z" fill="' + K.u('chev') + '"' + c(1.5) + '/>' + reflet(K) +
        '<path d="M-22 -38 C -16 -44 -10 -46 -4 -46" stroke="' + K.u('or') + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
    }
  },
  tresse_c:{
    nuque:function(K){ return '<path d="' + DOME + '" fill="' + K.u('chev') + '"' + c(2.2) + '/>'; },
    dos:function(K){ return '<path d="M-30 -6 C -40 20 -34 44 -40 66 C -30 74 -18 72 -12 64 C -16 40 -20 18 -16 -4 Z M30 -6 C 40 20 34 44 40 66 C 30 74 18 72 12 64 C 16 40 20 18 16 -4 Z" fill="' + K.u('chev') + '"' + c(2) + '/>'; },
    avant:function(K){
      var pts = [];
      for(var i = 0; i <= 11; i++){ var a = Math.PI * (1.04 + i * .084); pts.push([Math.cos(a) * 29, -20 + Math.sin(a) * 33]); }
      return '<path d="M-30 4 C -34 -30 -18 -56 0 -56 C 18 -56 34 -30 30 4 C 27 -6 22 -14 14 -18 C 8 -14 4 -12 0 -12 C -4 -12 -8 -14 -14 -18 C -22 -14 -27 -6 -30 4 Z" fill="' + K.u('chev') + '"' + c(2.2) + '/>' +
        '<path d="M-26 -6 C -30 6 -29 16 -25 24 L -22 2 Z M26 -6 C 30 6 29 16 25 24 L 22 2 Z" fill="' + K.u('chev') + '"' + c(1.5) + '/>' +
        tresse(K, pts, 7) + '<circle cx="-24" cy="-44" r="4" fill="#ffd0e0"' + c(1) + '/><circle cx="-24" cy="-44" r="1.6" fill="#ffd36a"/><circle cx="26" cy="-42" r="3.4" fill="#d6f0ff"' + c(1) + '/>';
    }
  },
  /* ---------- Garçons (héros) : vraies mèches qui débordent ----------
     K.chap : un chapeau est posé (on retire ce qui dépasserait au-dessus)
     K.age  : 'enfant' | 'adulte' | 'age' */
  epis:{
    nuque:function(K){
      var k = kAge(K);
      return masse([DOS_M].concat(brins([
        [[[-28,-30],[-41,-35],[-55,-31]], 18], [[[-30,-14],[-41,-11],[-49,-1]], 15], [[[-26,2],[-32,10],[-35,21]], 12],
        [[[28,-32],[43,-38],[57,-35]], 19], [[[30,-15],[43,-13],[52,-2]], 16], [[[26,2],[32,10],[37,20]], 12]
      ], k)), K.u('chevB'));
    },
    avant:function(K){
      var k = kAge(K), L = [CALOTTE];
      if(!K.chap) L = L.concat(brins([
        [[[-18,-46],[-31,-57],[-45,-62]], 20], [[[-6,-52],[-11,-66],[-13,-77]], 20],
        [[[8,-53],[13,-67],[23,-76]], 21], [[[19,-46],[33,-57],[48,-61]], 20]
      ], k));
      L = L.concat(brins([
        [[[-24,-32],[-30,-18],[-25,-4]], 13], [[[-13,-36],[-17,-20],[-9,-5]], 14], [[[-1,-38],[-4,-19],[3,0]], 14],
        [[[11,-36],[15,-20],[8,-5]], 14], [[[22,-32],[29,-18],[23,-3]], 13],
        [[[-26,-22],[-30,-5],[-25.5,11]], 9], [[[26,-22],[30,-5],[25.5,11]], 9]
      ]));
      return masse(L, K.u('chevU')) +
        traits([[[[-19,-15],[-20,-22],[-18,-30]], 2.4], [[[-6,-14],[-8,-22],[-7,-31]], 2.4], [[[6,-15],[6,-23],[4,-31]], 2.4], [[[17,-15],[19,-22],[17,-29]], 2.4]]) +
        (K.chap ? '' : traits([[[[-12.5,-57],[-11,-53],[-9.5,-49]], 1.8], [[[2,-61],[2,-57],[1.5,-52]], 1.8], [[[16.5,-58],[14,-54],[12,-50]], 1.8]])) +
        traits([[[[-20,-30],[-24,-20],[-24,-10]], 1.6], [[[-9,-32],[-12,-20],[-9,-9]], 1.6], [[[4,-32],[2,-18],[3,-6]], 1.6], [[[15,-30],[18,-20],[14,-10]], 1.6]], K.chev.c[2], .4) +
        eclat(K, 0, -26, 26, 25, 205, 335, 5, 7);
    }
  },
  court:{
    nuque:function(K){
      var k = kAge(K);
      return masse(['M-34 8 C -44 -38 -22 -61 2 -61 C 27 -61 44 -38 34 8 Z'].concat(brins([
        [[[-31,-34],[-40,-38],[-46,-33]], 15, {ex:.6, b:.45}], [[[-33,-18],[-42,-16],[-46,-8]], 14, {ex:.6, b:.45}], [[[-29,-3],[-35,3],[-37,11]], 12, {ex:.6, b:.4}],
        [[[31,-36],[41,-40],[47,-34]], 15, {ex:.6, b:.45}], [[[33,-20],[43,-18],[47,-9]], 14, {ex:.6, b:.45}], [[[29,-4],[35,2],[38,10]], 12, {ex:.6, b:.4}]
      ], k)), K.u('chevB'));
    },
    avant:function(K){
      var k = kAge(K), L = [CALOTTE];
      if(!K.chap) L = L.concat(brins([
        [[[-14,-50],[-24,-58],[-33,-56]], 16, {ex:.6, b:.45}], [[[-2,-54],[-6,-64],[-14,-68]], 15, {ex:.6, b:.45}],
        [[[8,-54],[14,-64],[22,-66]], 15, {ex:.6, b:.45}], [[[18,-48],[28,-54],[37,-50]], 14, {ex:.6, b:.45}]
      ], k));
      L = L.concat(brins([
        [[[-25,-30],[-31,-18],[-28,-6]], 12, {ex:.75}], [[[-16,-34],[-20,-20],[-15,-7]], 12, {ex:.75}], [[[-7,-37],[-10,-20],[-2,-5]], 13, {ex:.75}],
        [[[4,-37],[4,-20],[-1,-7]], 11, {ex:.75}], [[[12,-36],[16,-21],[13,-6]], 12, {ex:.75}], [[[20,-33],[27,-20],[24,-6]], 12, {ex:.75}],
        [[[-26,-20],[-30,-5],[-26,8]], 9], [[[26,-20],[30,-5],[26,8]], 9]
      ]));
      return masse(L, K.u('chevU')) +
        traits([[[[-21.5,-16],[-22,-23],[-20,-30]], 2.2], [[[-12,-15],[-13,-23],[-12,-31]], 2.2], [[[7,-14],[7,-22],[6,-30]], 2.2], [[[18,-16],[19,-23],[17,-30]], 2.2]]) +
        (K.chap ? '' : traits([[[[-9,-60],[-7,-55],[-5,-50]], 1.8], [[[11,-60],[10,-55],[8,-50]], 1.8]])) +
        traits([[[[-5,-32],[-6,-20],[-2,-10]], 1.5], [[[13,-30],[15,-20],[13,-10]], 1.5], [[[-22,-28],[-26,-18],[-26,-10]], 1.5]], K.chev.c[2], .4) +
        eclat(K, 0, -26, 26, 25, 205, 335, 6, 6);
    }
  },
  meche:{
    sousMeche:true,
    nuque:function(K){
      var k = kAge(K);
      return masse([DOS_M].concat(brins([
        [[[-30,-28],[-38,-29],[-42,-21]], 11, {ex:.7}], [[[-30,-12],[-36,-8],[-38,0]], 10, {ex:.7}], [[[-24,2],[-28,9],[-30,16]], 9],
        [[[28,-42],[42,-50],[53,-46],[56,-33]], 16, {ex:.75}], [[[30,-26],[43,-27],[50,-18],[51,-6]], 15, {ex:.75}], [[[28,-8],[36,-3],[40,6],[40,14]], 12, {ex:.75}]
      ], k)), K.u('chevB'));
    },
    avant:function(K){
      var k = kAge(K), L = [CALOTTE];
      if(!K.chap) L = L.concat(brins([
        [[[-6,-47],[-5,-63],[16,-66],[33,-53]], 18, {ex:.7}], [[[2,-56],[18,-62],[32,-58],[42,-48]], 13, {ex:.7}]
      ], k));
      L = L.concat(brins([
        [[[-14,-48],[-24,-40],[-28,-24],[-25,-8]], 13], [[[-9,-48],[-13,-38],[-17,-26],[-16,-12]], 12], [[[-18,-38],[-16,-26],[-15,-12]], 9],
        [[[2,-46],[18,-40],[27,-18],[27,6]], 16],
        [[[-10,-50],[6,-41],[17,-22],[20,9]], 24, {ex:.8}],
        [[[-26,-22],[-30,-4],[-26,11]], 9], [[[27,-20],[30,-4],[27,11]], 9]
      ]));
      return masse(L, K.u('chevU')) +
        traits([[[[-11.5,-53],[-11,-49],[-10.5,-44]], 2.2], [[[-20.5,-12],[-21,-20],[-20,-28]], 2.2], [[[-13,-13],[-13,-20],[-12,-30]], 2], [[[24,2],[23,-10],[20,-22]], 2.2]]) +
        traits([[[[-4,-42],[8,-33],[13,-14]], 1.8], [[[2,-46],[14,-38],[19,-20]], 1.6], [[[-6,-52],[8,-58],[24,-56]], 1.5]], K.chev.c[2], .5) +
        traits([[[[-6,-44],[6,-38],[11,-26]], 2]], K.chev.hl, .55) +
        eclat(K, 2, -26, 26, 25, 212, 328, 5, 6);
    }
  },
  boucles:{
    nuque:function(K){
      var pts = [], n = 17, ry = K.chap ? 31 : 41, cy = K.chap ? -17 : -25, i;
      for(i = 0; i <= n; i++){ var a = Math.PI * (.84 + i * 1.32 / n), r = 1 + (i % 2 ? .045 : -.03); pts.push([Math.cos(a) * 43 * r, cy + Math.sin(a) * ry * r]); }
      return '<path d="' + festons(pts, 7.6, true) + '" fill="' + K.u('chevB') + '"' + c(2.2) + '/>';
    },
    avant:function(K){
      var C = [
        [-16,-55,10.5], [-2,-59,10.5], [12,-56,10], [24,-48,9.5],
        [-27,-44,9.5], [-11,-46,10.5], [5,-47,10.5], [19,-39,9.5], [30,-33,8.6],
        [-31,-31,8.6], [-19,-33,9.5], [-5,-35,10], [9,-34,9.5], [22,-27,8.6],
        [-24,-20,7.4], [-12,-22.5,7.6], [0,-23.5,7.8], [12,-22.5,7.6], [24,-19,7.2],
        [-29.5,-9,6.2], [-28,1.5,5], [29.5,-9,6.2], [28,1.5,5]
      ];
      if(K.chap) C = C.filter(function(p){ return p[1] > -38; });
      function rond(p){ return 'M' + f1(p[0] - p[2]) + ' ' + p[1] + ' a ' + p[2] + ' ' + p[2] + ' 0 1 0 ' + f1(2 * p[2]) + ' 0 a ' + p[2] + ' ' + p[2] + ' 0 1 0 ' + f1(-2 * p[2]) + ' 0 Z'; }
      var s = masse(C.map(rond), K.u('chevU')), om = '', sp = '', lu = '', R = Math.PI / 180;
      C.forEach(function(p, i){
        var x = p[0], y = p[1], r = p[2];
        function Q(a, rr, dx, dy){ return pp([x + (dx || 0) + Math.cos(a * R) * rr, y + (dy || 0) + Math.sin(a * R) * rr]); }
        if(y > -26 || Math.abs(x) > 27){
          /* boucles du bord : petit volume (ombre en croissant) */
          om += '<path d="M' + Q(-10, r * .9) + ' A ' + f1(r * .9) + ' ' + f1(r * .9) + ' 0 0 1 ' + Q(130, r * .9) + ' A ' + f1(r * 1.25) + ' ' + f1(r * 1.25) + ' 0 0 0 ' + Q(-10, r * .9) + ' Z"/>';
        }
        /* petite spirale « ressort » au cœur de chaque boucle */
        var a0 = (i * 67) % 360, rr = r * .46;
        sp += '<path d="M' + Q(a0, rr) + ' A ' + f1(rr) + ' ' + f1(rr) + ' 0 1 1 ' + Q(a0 + 250, rr) + ' A ' + f1(rr * .55) + ' ' + f1(rr * .55) + ' 0 0 1 ' + Q(a0 + 330, rr * .35, Math.cos((a0 + 250) * R) * rr * .3, Math.sin((a0 + 250) * R) * rr * .3) + '"/>';
        if(x < 14 && y < -30) lu += '<path d="M' + Q(200, r * .68) + ' A ' + f1(r * .68) + ' ' + f1(r * .68) + ' 0 0 1 ' + Q(250, r * .68) + '"/>';
      });
      return s + '<g fill="' + K.chev.c[2] + '" opacity=".42">' + om + '</g>' +
        '<g stroke="' + K.chev.c[2] + '" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".55">' + sp + '</g>' +
        '<g stroke="' + K.chev.hl + '" stroke-width="2" fill="none" stroke-linecap="round" opacity=".8">' + lu + '</g>';
    }
  },
  arriere:{
    nuque:function(K){ return masse(['M-31 4 C -39 -36 -19 -58 2 -58 C 25 -58 39 -36 31 4 Z'], K.u('chevB')); },
    avant:function(K){
      var k = kAge(K), s = '';
      /* côtés très courts (dégradé) : la peau transparaît vers l'oreille */
      s += '<path d="M-30.5 -4 C -33 -22 -28 -38 -18 -46 L -14 -28 C -20 -24 -25 -16 -27 -6 Z M30.5 -4 C 33 -22 28 -38 18 -46 L 14 -28 C 20 -24 25 -16 27 -6 Z" fill="' + K.u('chevB') + '"' + c(2) + '/>' +
        '<path d="M-29.6 -5 C -31 -12 -30.8 -18 -29.4 -23 L -25 -20 C -26 -15 -26.6 -10 -26.8 -6 Z M29.6 -5 C 31 -12 30.8 -18 29.4 -23 L 25 -20 C 26 -15 26.6 -10 26.8 -6 Z" fill="' + K.u('peauU') + '" opacity=".55"/>' +
        traits([[[[-28,-14],[-28,-20],[-27,-26]], 1.2], [[[-25,-24],[-24,-30],[-22,-36]], 1.2], [[[28,-14],[28,-20],[27,-26]], 1.2], [[[25,-24],[24,-30],[22,-36]], 1.2]], K.chev.c[2], .5);
      var L = ['M-22 -24 C -26 -46 -10 -57 4 -57 C 20 -57 28 -46 22 -24 C 14 -28 -12 -28 -22 -24 Z'];
      if(!K.chap) L = L.concat(brins([
        [[[-18,-28],[-26,-50],[-14,-66],[6,-70]], 18], [[[-6,-30],[-12,-54],[2,-71],[24,-66]], 20],
        [[[8,-30],[4,-52],[20,-64],[38,-56]], 18], [[[18,-28],[22,-46],[34,-50],[44,-44]], 13]
      ], k));
      L = L.concat(brins([[[[-4,-34],[-9,-22],[-4,-9]], 8]]));
      s += masse(L, K.u('chevU')) +
        (K.chap ? '' : traits([[[[-10,-29],[-14,-42],[-8,-56]], 2.2], [[[3,-30],[0,-44],[8,-58]], 2.2], [[[14,-29],[14,-40],[22,-50]], 2]]) +
          traits([[[[-16,-40],[-12,-58],[2,-64]], 1.6], [[[-2,-42],[2,-58],[18,-62]], 1.6]], K.chev.hl, .6));
      return s + (K.chap ? '' : eclat(K, -2, -34, 24, 30, 215, 320, 4, 6));
    }
  },
  catogan:{
    nuque:function(K){
      var s = masse([DOS_M].concat(brins([[[[-26,2],[-31,9],[-33,17]], 10], [[[26,2],[31,9],[33,17]], 10]])), K.u('chevB'));
      if(!K.chap){
        s += masse(brins([[[[8,-60],[26,-78],[48,-64],[54,-34]], 18, {ex:.8}], [[[6,-62],[20,-74],[38,-70],[46,-52]], 11]]), K.u('chevU')) +
          traits([[[[44,-46],[42,-60],[30,-70]], 1.6], [[[50,-38],[48,-56],[38,-68]], 1.4]], K.chev.c[2], .55) +
          traits([[[[16,-70],[30,-74],[42,-66]], 2]], K.chev.hl, .55) +
          '<ellipse cx="4" cy="-60" rx="9" ry="7.6" fill="' + K.u('chevU') + '"' + c(2.2) + '/>' +
          '<path d="M2 -67 C 6 -64 7 -58 5 -53" stroke="' + O + '" stroke-width="8" fill="none" stroke-linecap="round"/>' +
          '<path d="M2 -67 C 6 -64 7 -58 5 -53" stroke="#d0402e" stroke-width="4.6" fill="none" stroke-linecap="round"/>' +
          '<path d="M3 -64 C 4.6 -62 5 -60 4.6 -58" stroke="#ff9a7a" stroke-width="1.2" fill="none" stroke-linecap="round"/>';
      }
      return s;
    },
    devant:function(K){
      if(!K.chap) return '';
      return A('pj-meche2', masse(brins([[[[20,8],[34,22],[35,46],[28,64]], 14]]), K.u('chevU')) +
        '<path d="M19 9 l9 7" stroke="' + O + '" stroke-width="8" stroke-linecap="round"/><path d="M19 9 l9 7" stroke="#d0402e" stroke-width="4.6" stroke-linecap="round"/>', ' style="transform-origin:20px 8px"');
    },
    avant:function(K){
      var L = ['M-31 -6 C -35 -36 -18 -57 2 -57 C 24 -57 37 -36 31 -6 C 27 -16 20 -24 10 -27 C 2 -29 -8 -29 -16 -26 C -24 -22 -29 -14 -31 -6 Z'].concat(brins([
        [[[-8,-38],[-14,-26],[-8,-10]], 10, {ex:.8}], [[[2,-38],[2,-28],[-2,-16]], 7],
        [[[-26,-22],[-30,-5],[-26,10]], 9], [[[26,-22],[30,-5],[26,10]], 9]
      ]));
      return masse(L, K.u('chevU')) +
        traits([[[[-24,-20],[-18,-38],[-2,-54]], 1.6], [[[-14,-27],[-8,-44],[2,-55]], 1.5], [[[10,-28],[10,-44],[5,-55]], 1.5], [[[22,-22],[18,-40],[8,-54]], 1.6]], K.chev.c[2], .55) +
        eclat(K, 0, -26, 26, 25, 210, 330, 5, 5);
    }
  },
  milong:{
    nuque:function(K){
      var k = kAge(K);
      return masse(['M-33 8 C -43 -37 -21 -61 2 -61 C 27 -61 43 -37 33 8 C 31 16 27 22 21 25 L -21 25 C -27 22 -31 16 -33 8 Z'].concat(brins([
        [[[-30,-30],[-42,-30],[-50,-22]], 14], [[[-31,-13],[-41,-5],[-46,7]], 15], [[[-27,3],[-33,15],[-37,27]], 14],
        [[[30,-30],[42,-30],[51,-22]], 14], [[[31,-13],[41,-5],[47,7]], 15], [[[27,3],[33,15],[38,27]], 14],
        [[[-17,16],[-21,25],[-23,33]], 11], [[[17,16],[21,25],[24,32]], 11]
      ], k)), K.u('chevB'));
    },
    avant:function(K){
      var k = kAge(K), L = [CALOTTE];
      if(!K.chap) L = L.concat(brins([[[[-6,-54],[-12,-64],[-22,-66]], 13], [[[8,-55],[14,-64],[26,-64]], 13]], k));
      L = L.concat(brins([
        [[[-22,-34],[-29,-18],[-26,-1]], 13], [[[-12,-38],[-17,-20],[-11,-3]], 13], [[[-2,-40],[-3,-22],[2,-6]], 11],
        [[[9,-39],[13,-21],[9,-2]], 13], [[[19,-35],[26,-19],[24,-1]], 13],
        [[[-27,-20],[-32,0],[-30,18],[-26,27]], 12], [[[27,-20],[32,0],[30,18],[26,27]], 12],
        [[[-29,2],[-35,14],[-40,21]], 9], [[[29,2],[35,14],[40,21]], 9]
      ]));
      return masse(L, K.u('chevU')) +
        traits([[[[-17.5,-14],[-19,-22],[-17,-30]], 2.2], [[[-6.5,-12],[-7,-21],[-7,-31]], 2.2], [[[5,-13],[6,-22],[5,-31]], 2.2], [[[16.5,-13],[18,-21],[16,-29]], 2.2], [[[-28,24],[-29,14],[-30,4]], 2], [[[28,24],[29,14],[30,4]], 2]]) +
        traits([[[[-16,-30],[-20,-18],[-18,-6]], 1.5], [[[13,-30],[17,-18],[15,-6]], 1.5], [[[-29,-6],[-30,6],[-28,18]], 1.4], [[[29,-6],[30,6],[28,18]], 1.4]], K.chev.c[2], .45) +
        eclat(K, 0, -26, 26, 25, 205, 335, 5, 6);
    }
  },
  degarni:{
    nuque:function(K){
      return '<path d="M-27 -6 C -30 -52 30 -52 27 -6 Z" fill="' + K.u('peauU') + '"' + c(2.3) + '/>' +
        masse(brins([
          [[[-28,-28],[-37,-33],[-44,-31]], 10, {ex:.75, b:.35}], [[[-30,-19],[-41,-20],[-48,-15]], 11, {ex:.75, b:.35}], [[[-30,-9],[-40,-6],[-45,1]], 11, {ex:.75, b:.35}], [[[-27,0],[-33,6],[-36,13]], 9, {ex:.75, b:.3}],
          [[[28,-28],[37,-33],[44,-31]], 10, {ex:.75, b:.35}], [[[30,-19],[41,-20],[48,-15]], 11, {ex:.75, b:.35}], [[[30,-9],[40,-6],[45,1]], 11, {ex:.75, b:.35}], [[[27,0],[33,6],[36,13]], 9, {ex:.75, b:.3}]
        ]).concat(['M-30 -34 C -36 -26 -36 -8 -24 8 L 24 8 C 36 -8 36 -26 30 -34 C 26 -30 -26 -30 -30 -34 Z']), K.u('chevB'));
    },
    avant:function(K){
      var s = '<path d="M-26.9 -8 C -29 -51 29 -51 26.9 -8 C 18 -14 -18 -14 -26.9 -8 Z" fill="' + K.u('peauU') + '"/>' +
        '<path d="M-26.9 -8 C -29 -51 29 -51 26.9 -8" fill="none"' + c(2.3) + '/>' +
        (K.chap ? '' : '<ellipse cx="-8" cy="-38" rx="10" ry="4" fill="#fff" opacity=".45" transform="rotate(-14 -8 -38)"/><path d="M8 -42 l3 1" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".6"/>') +
        '<path d="M-12 -24 Q 0 -27 12 -24 M-9 -19.5 Q 0 -21.6 9 -19.5" stroke="' + K.peau.trait + '" stroke-width="1" fill="none" opacity=".55" stroke-linecap="round"/>';
      s += masse([
        'M-21 -33 C -27 -31 -31 -22 -31 -10 L -27 9 L -25 -6 C -25 -17 -23 -25 -18 -30 Z',
        'M21 -33 C 27 -31 31 -22 31 -10 L 27 9 L 25 -6 C 25 -17 23 -25 18 -30 Z'
      ].concat(brins([
        [[[-27,-26],[-34,-25],[-38,-19]], 8, {ex:.75, b:.35}], [[[-29,-13],[-35,-9],[-37,-2]], 8, {ex:.75, b:.35}],
        [[[27,-26],[34,-25],[38,-19]], 8, {ex:.75, b:.35}], [[[29,-13],[35,-9],[37,-2]], 8, {ex:.75, b:.35}]
      ])), K.u('chevU')) +
        traits([[[[-24,-28],[-27,-18],[-27,-6]], 1.4], [[[24,-28],[27,-18],[27,-6]], 1.4]], K.chev.c[2], .45);
      return s;
    }
  }
};

/* Anciennes coiffures garçon, gardées telles quelles pour les villageois */
var COIFF_V = {
  court:{
    nuque:function(K){ return '<path d="' + DOME_SERRE + '" fill="' + K.u('chev') + '"' + c(2.2) + '/>'; },
    avant:function(K){
      return '<path d="M-29 -4 C -33 -36 -16 -57 2 -57 C 24 -57 35 -36 29 -4 C 28 -14 25 -21 19 -26 C 12 -22 2 -22 -6 -26 C -8 -22 -12 -20 -16 -22 C -22 -18 -26 -12 -29 -4 Z" fill="' + K.u('chev') + '"' + c(2.2) + '/>' +
        '<path d="M-27 -10 L -27 4 L -24 -6 Z M27 -10 L 27 4 L 24 -6 Z" fill="' + K.u('chev') + '"' + c(1.4) + '/>' +
        '<path d="M-10 -42 C -8 -48 -4 -53 2 -55" stroke="' + O + '" stroke-width="1.4" fill="none"/>' +
        '<path d="M-26 -12 C -22 -18 -14 -24 -6 -26 C -10 -20 -12 -14 -12 -8 C -16 -14 -20 -14 -26 -12 Z M-8 -25 C -2 -25 6 -24 12 -22 C 6 -20 2 -16 0 -11 C -2 -16 -4 -20 -8 -25 Z" fill="' + K.u('chev') + '"' + c(1.8) + '/>' +
        '<path d="M-6 -26 C 0 -36 10 -40 22 -40" stroke="' + K.chev.c[2] + '" stroke-width="1.3" fill="none" opacity=".5"/>' + reflet(K, -1);
    }
  },
  meche:{
    nuque:function(K){ return '<path d="' + DOME_SERRE + '" fill="' + K.u('chev') + '"' + c(2.2) + '/>'; },
    avant:function(K){
      return '<path d="M-29 -4 C -33 -36 -14 -58 6 -57 C 28 -55 36 -32 30 -2 C 28 -8 26 -11 24 -13 C 23 -4 19 2 14 4 C 16 -4 14 -12 8 -17 C -2 -19 -14 -17 -22 -12 C -25 -9 -27 -7 -29 -4 Z" fill="' + K.u('chev') + '"' + c(2.2) + '/>' +
        '<path d="M-20 -14 C -10 -22 4 -22 12 -16 C 18 -10 18 -2 14 4 C 16 -4 14 -12 8 -17 Z" fill="' + K.chev.c[2] + '" opacity=".3"/>' +
        '<path d="M-27 -10 L -27 4 L -24 -6 Z" fill="' + K.u('chev') + '"' + c(1.4) + '/>' +
        '<path d="M-16 -30 C -4 -40 14 -40 26 -28" stroke="' + K.chev.hl + '" stroke-width="2" fill="none" opacity=".6" stroke-linecap="round"/>' + reflet(K, -2);
    }
  },
  boucles:{
    nuque:function(K){
      var pts = [];
      for(var i = 0; i <= 14; i++){ var a = Math.PI * (.86 + i * .0914); pts.push([Math.cos(a) * 38, -20 + Math.sin(a) * 43]); }
      return '<path d="' + festons(pts, 7.6, true) + '" fill="' + K.u('chev') + '"' + c(2.2) + '/>';
    },
    avant:function(K){
      var haut = [], bas = [[29,-4],[24,-14],[16,-20],[7,-23],[-3,-23],[-12,-21],[-20,-16],[-26,-9],[-29,-4]];
      for(var i = 0; i <= 10; i++){ var a = Math.PI * (1.03 + i * .094); haut.push([Math.cos(a) * 31, -20 + Math.sin(a) * 37]); }
      var d = festons(haut, 6.6, false) + festons(bas, 5.6, false, true) + ' Z';
      var s = '<path d="' + d + '" fill="' + K.u('chev') + '"' + c(2.2) + '/>';
      [[-18,-34],[-4,-40],[10,-40],[22,-30],[-24,-20],[-10,-30],[4,-30],[16,-26],[-14,-48],[2,-50],[16,-46]].forEach(function(p){
        s += '<path d="M' + (p[0] - 3) + ' ' + p[1] + ' a 3 3 0 1 1 3 3" stroke="' + K.chev.c[2] + '" stroke-width="1.4" fill="none" opacity=".6" stroke-linecap="round"/><path d="M' + (p[0] - 3.5) + ' ' + (p[1] - 3) + ' q 3 -2.4 6 0" stroke="' + K.chev.hl + '" stroke-width="1.3" fill="none" opacity=".55" stroke-linecap="round"/>';
      });
      return s;
    }
  },
  degarni:{
    nuque:function(K){
      return '<path d="M-27 -6 C -30 -50 30 -50 27 -6 Z" fill="' + K.u('peau') + '"' + c(2.2) + '/>' +
        '<path d="M-34 10 C -40 -10 -36 -28 -26 -36 C -22 -24 -22 -12 -24 0 Z M34 10 C 40 -10 36 -28 26 -36 C 22 -24 22 -12 24 0 Z" fill="' + K.u('chev') + '"' + c(2) + '/>';
    },
    avant:function(K){
      return '<ellipse cx="-6" cy="-38" rx="9" ry="4" fill="#fff" opacity=".45" transform="rotate(-14 -6 -38)"/>' +
        '<path d="M-29 -18 C -32 -6 -31 4 -28 10 L -25 -10 Z M29 -18 C 32 -6 31 4 28 10 L 25 -10 Z" fill="' + K.u('chev') + '"' + c(1.6) + '/>';
    }
  }
};

/* ---------- Chapeaux (coordonnées de tête) ---------- */
var CHAPEAUX = {
  beret:function(K){ return '<path d="M-30 -40 C -34 -58 -10 -70 10 -68 C 32 -66 42 -52 34 -40 C 20 -46 -14 -46 -30 -40 Z" fill="' + K.u('acc') + '"' + c(2.2) + '/>' +
    '<path d="M-31 -40 C -14 -47 20 -47 35 -40 L 34 -35 C 18 -42 -14 -42 -31 -35 Z" fill="' + K.u('cuir') + '"' + c(1.6) + '/><circle cx="12" cy="-70" r="3" fill="' + K.u('acc') + '"' + c(1.2) + '/>' +
    '<path d="M-20 -58 C -10 -64 4 -64 14 -62" stroke="#fff" stroke-width="2" fill="none" opacity=".35" stroke-linecap="round"/>'; },
  plume:function(K, coul){ return A('pj-plume', '<path d="M8 -58 C 24 -84 50 -94 70 -88 C 54 -80 40 -70 30 -58 C 24 -56 14 -56 8 -58 Z" fill="' + (coul || '#fff4f8') + '"' + c(1.8) + '/><path d="M14 -58 C 30 -72 46 -82 64 -87" stroke="#c9a2b4" stroke-width="1.2" fill="none"/>', ' style="transform-origin:12px -58px"') +
    '<path d="M-48 -38 C -40 -48 40 -48 50 -38 C 40 -30 -40 -30 -48 -38 Z" fill="' + K.u('acc') + '"' + c(2.2) + '/>' +
    '<path d="M-26 -42 C -28 -64 -12 -72 2 -72 C 18 -72 30 -64 28 -42 Z" fill="' + K.u('acc') + '"' + c(2.2) + '/>' +
    '<path d="M-26 -46 C -10 -50 12 -50 28 -46 L 28 -41 C 12 -45 -10 -45 -26 -41 Z" fill="' + K.u('or') + '"' + c(1.4) + '/>' +
    '<path d="M-16 -64 C -8 -70 4 -70 12 -68" stroke="#fff" stroke-width="2" fill="none" opacity=".35" stroke-linecap="round"/>'; },
  etoile:function(K){ return '<path d="M-52 -34 C -42 -48 42 -48 54 -34 C 42 -24 -42 -24 -52 -34 Z" fill="' + K.u('acc') + '"' + c(2.4) + '/>' +
    '<path d="M-31 -40 C -28 -66 -12 -86 10 -89 C 30 -92 46 -86 54 -70 C 44 -76 32 -74 26 -66 C 27 -58 29 -48 31 -40 Z" fill="' + K.u('acc') + '"' + c(2.4) + '/>' +
    '<path d="M12 -62 C 14 -74 20 -82 30 -86 C 40 -86 50 -80 54 -70 C 44 -76 32 -74 26 -66 C 27 -58 29 -48 31 -40 L 16 -40 Z" fill="#000" opacity=".22"/>' +
    '<path d="M-30 -45 C -10 -49 14 -49 31 -45 L 31 -38 C 14 -42 -10 -42 -30 -38 Z" fill="' + K.u('or') + '"' + c(1.4) + '/>' +
    '<path d="M-18 -64 C -12 -76 -2 -84 8 -86" stroke="#fff" stroke-width="2.4" fill="none" opacity=".3" stroke-linecap="round"/>' +
    '<g fill="#fff6c8" class="pj-scintille"><path d="' + etoile4(-8, -60, 5) + '"/><path d="' + etoile4(12, -76, 3.6) + '"/><circle cx="2" cy="-52" r="1.7"/><circle cx="-16" cy="-50" r="1.3"/><path d="' + etoile4(20, -56, 3) + '"/></g>' +
    '<path d="' + etoile4(55, -68, 6) + '" fill="' + K.u('or') + '"' + c(1.2) + '/>'; },
  toque:function(K){ return '<path d="M-24 -40 C -40 -50 -38 -78 -18 -78 C -14 -92 14 -92 18 -78 C 38 -78 40 -50 24 -40 Z" fill="' + K.u('blanc') + '"' + c(2.2) + '/>' +
    '<path d="M-24 -46 L 24 -46 L 24 -36 L -24 -36 Z" fill="' + K.u('blanc') + '"' + c(2) + '/><path d="M-8 -78 C -6 -66 -6 -56 -6 -48 M8 -78 C 8 -66 8 -56 8 -48" stroke="#c9cfe4" stroke-width="1.4" fill="none"/>'; },
  paille:function(K){ return '<path d="M-52 -36 C -44 -48 44 -48 54 -36 C 44 -26 -44 -26 -52 -36 Z" fill="#f2d27a"' + c(2.2) + '/>' +
    '<path d="M-26 -40 C -28 -60 -14 -66 2 -66 C 18 -66 30 -60 28 -40 Z" fill="#f6dc8e"' + c(2.2) + '/>' +
    '<path d="M-26 -46 C -10 -50 12 -50 28 -46 L 28 -40 C 12 -44 -10 -44 -26 -40 Z" fill="#c0522e"' + c(1.4) + '/>' +
    '<path d="M-44 -36 l4 2 M-30 -32 l3 2 M30 -32 l-3 2 M44 -36 l-4 2 M-10 -60 l2 4 M8 -60 l-2 4" stroke="#b08a34" stroke-width="1.2"/>'; },
  casquette:function(K){ return '<path d="M-30 -36 C -34 -58 -10 -66 6 -64 C 28 -62 36 -50 32 -36 Z" fill="#5f6278"' + c(2.2) + '/>' +
    '<path d="M-32 -36 C -20 -40 20 -40 36 -36 C 40 -34 46 -30 44 -26 C 30 -28 -24 -30 -32 -32 Z" fill="#4a4c60"' + c(2) + '/><circle cx="2" cy="-63" r="2.6" fill="#4a4c60"' + c(1) + '/>' +
    '<path d="M-20 -56 C -10 -60 4 -60 14 -58" stroke="#fff" stroke-width="1.8" fill="none" opacity=".3" stroke-linecap="round"/>'; },
  facteur:function(K){ return '<path d="M-28 -38 L -26 -62 C -10 -66 14 -66 30 -62 L 30 -38 Z" fill="#2f4f9a"' + c(2.2) + '/>' +
    '<path d="M-30 -38 C -16 -42 18 -42 32 -38 C 34 -32 30 -28 24 -28 C 10 -30 -12 -30 -26 -30 C -32 -30 -32 -34 -30 -38 Z" fill="#1d2f60"' + c(2) + '/>' +
    '<path d="M-27 -44 L 30 -44" stroke="' + K.u('or') + '" stroke-width="2.4"/><path d="M-2 -58 l4 -4 l4 4 l-4 4 Z" fill="' + K.u('or') + '"' + c(1) + '/>'; },
  kepi:function(K){ return '<path d="M-26 -38 L -24 -64 C -8 -68 12 -68 28 -64 L 30 -38 Z" fill="#3c6b40"' + c(2.2) + '/>' +
    '<path d="M-28 -38 C -14 -42 18 -42 32 -38 C 34 -32 28 -28 22 -30 C 8 -32 -12 -32 -24 -30 C -30 -30 -30 -34 -28 -38 Z" fill="#22301f"' + c(2) + '/>' +
    '<path d="M-25 -46 L 30 -46" stroke="' + K.u('or') + '" stroke-width="2.2"/><circle cx="2" cy="-56" r="3.4" fill="' + K.u('or') + '"' + c(1) + '/>'; },
  bonnet:function(K){ return '<path d="M-30 -36 C -34 -60 -10 -70 8 -68 C 30 -66 44 -56 46 -40 C 50 -32 42 -26 36 -32 C 30 -38 -20 -40 -30 -36 Z" fill="#efe3c6"' + c(2.2) + '/>' +
    '<path d="M-31 -38 C -14 -44 20 -44 36 -36 L 35 -30 C 18 -38 -14 -38 -31 -32 Z" fill="#d8c7a0"' + c(1.6) + '/>'; },
  capuche:function(K){ return '<path d="M-34 0 C -42 -40 -24 -66 2 -66 C 28 -66 44 -40 36 0 C 34 -16 30 -30 22 -38 C 10 -44 -8 -44 -20 -38 C -28 -30 -32 -16 -34 0 Z" fill="' + K.u('cape') + '"' + c(2.2) + '/>'; }
};

/* ==========================================================
   CORPS DU HÉROS (coordonnées 300×440, comme l'essai)
   ========================================================== */
function bras(K, role, t, eq){
  var u = K.u, s = '';
  var bG = 'M112 144 C 100 160 96 182 96 202 C 94 220 92 234 92 248 L 108 250 C 110 236 112 220 114 204 C 116 184 122 168 128 156 Z';
  var bD = 'M188 144 C 200 160 204 182 204 202 C 206 220 208 234 208 248 L 192 250 C 190 236 188 220 186 204 C 184 184 178 168 172 156 Z';
  if(role === 'sage'){
    bG = 'M112 144 C 98 162 92 196 88 226 C 85 242 80 254 76 264 Q 94 274 114 264 C 114 246 115 222 118 200 Z';
    bD = 'M188 144 C 202 162 208 196 212 226 C 215 242 220 254 224 264 Q 206 274 186 264 C 186 246 185 222 182 200 Z';
  }
  s += '<path d="' + bG + '" fill="' + u('tun') + '"' + c(2.2) + '/><path d="' + bD + '" fill="' + u('tunO') + '"' + c(2.2) + '/>';
  if(role === 'sage'){
    s += '<path d="M76 264 Q 94 274 114 264 L 113 256 Q 94 266 79 257 Z M224 264 Q 206 274 186 264 L 187 256 Q 206 266 221 257 Z" fill="' + (t >= 3 ? u('or') : u('acc')) + '"' + c(1.4) + '/>';
  } else {
    s += '<path d="M204 202 C 206 220 208 234 208 248" fill="none" stroke="#ffe6b0" stroke-width="1.5" opacity=".55"/>';
  }
  if(role === 'barde'){
    s += '<path d="M106 140 C 92 146 90 170 102 180 C 114 186 126 172 128 156 Z" fill="' + u('tun') + '"' + c(2) + '/><path d="M194 140 C 208 146 210 170 198 180 C 186 186 174 172 172 156 Z" fill="' + u('tunO') + '"' + c(2) + '/>';
    s += '<path d="M104 152 C 106 162 110 170 114 176 M196 152 C 194 162 190 170 186 176" stroke="' + (t >= 2 ? u('or') : '#fff') + '" stroke-width="2" fill="none" opacity=".7"/>';
  }
  if(role === 'alchimiste' && t >= 2){
    s += '<path d="M93 236 L 109 238 L 109 247 L 92 245 Z M207 236 L 191 238 L 191 247 L 208 245 Z" fill="' + u('acc') + '"' + c(1.4) + '/>';
  }
  /* poignets */
  var p = eq.poignets;
  if(p === 'bracelets_vent' || (role === 'pisteur' && t === 4 && !p)){
    var brG = 'M96 206 C 94 220 93 234 92 247 L 109 249 C 110 236 112 222 114 208 Z', brD = 'M204 206 C 206 220 207 234 208 247 L 191 249 C 190 236 188 222 186 208 Z';
    s += '<path d="' + brG + '" fill="' + u('cuir') + '"' + c(2) + '/><path d="' + brD + '" fill="' + u('cuir') + '"' + c(2) + '/>';
    s += '<path d="M95 210 L 114 212 M92 243 L 109 245 M205 210 L 186 212 M208 243 L 191 245" stroke="' + u('or') + '" stroke-width="3.4"/>';
    if(p === 'bracelets_vent'){
      s += A('pj-pulse', '<path d="M102 220 l2 8 l-4 6 M198 220 l-2 8 l4 6" stroke="#8ff3ff" stroke-width="6" fill="none" opacity=".45" stroke-linecap="round"/>', ' style="animation-delay:-.7s"');
      s += '<path d="M102 220 l2 8 l-4 6 M198 220 l-2 8 l4 6" stroke="#dffcff" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
    }
  } else if(role !== 'sage' && role !== 'alchimiste'){
    s += '<path d="M93 238 L 109 240 L 109 247 L 92 245 Z M207 238 L 191 240 L 191 247 L 208 245 Z" fill="' + (t === 1 ? '#b8a27a' : u('cuir')) + '"' + c(1.4) + '/>';
  }
  return s;
}

function mains(K, role, eq){
  var u = K.u, s = '';
  var gant = eq.poignets === 'gants_cuir' ? '#7a4a26' : eq.poignets === 'gants_pisteur' ? '#5b4030' : null;
  var hx = role === 'sage' ? -4 : 0;
  var mG = 'M' + (91 + hx) + ' 246 C ' + (86 + hx) + ' 252 ' + (86 + hx) + ' 262 ' + (92 + hx) + ' 268 C ' + (98 + hx) + ' 272 ' + (108 + hx) + ' 270 ' + (110 + hx) + ' 263 L ' + (110 + hx) + ' 247 Z';
  var mD = 'M' + (191 - hx) + ' 248 C ' + (189 - hx) + ' 258 ' + (193 - hx) + ' 268 ' + (201 - hx) + ' 269 C ' + (209 - hx) + ' 270 ' + (212 - hx) + ' 259 ' + (209 - hx) + ' 248 Z';
  if(role === 'sage'){ mG = 'M86 262 C 82 268 84 278 92 282 C 100 284 106 278 106 270 L 104 262 Z'; mD = 'M194 262 C 194 272 198 282 206 282 C 214 282 218 272 214 262 Z'; }
  s += '<path d="' + mG + '" fill="' + (gant || u('peau')) + '"' + c(2) + '/><path d="' + mD + '" fill="' + (gant || u('peau')) + '"' + c(2) + '/>';
  if(eq.poignets === 'gants_pisteur'){ s += '<path d="M90 252 h20 M190 253 h20" stroke="' + u('or') + '" stroke-width="1.6"/>'; }
  if(eq.poignets === 'gants_cuir'){ s += '<path d="M89 250 C 96 246 104 246 111 250 M189 251 C 196 247 204 247 211 251" stroke="#c48a50" stroke-width="2.4" fill="none"/>'; }
  if(eq.bague === 'anneau'){
    s += '<circle cx="' + (role === 'sage' ? 207 : 203) + '" cy="' + (role === 'sage' ? 274 : 262) + '" r="7" fill="' + u('cyan') + '" class="pj-pulse"/><path d="M' + (role === 'sage' ? 202 : 198) + ' ' + (role === 'sage' ? 273 : 261) + ' h10" stroke="' + u('or') + '" stroke-width="3" stroke-linecap="round"/><circle cx="' + (role === 'sage' ? 207 : 203) + '" cy="' + (role === 'sage' ? 272 : 260) + '" r="2.2" fill="#8ff3ff"' + c(.8) + '/>';
  }
  return s;
}

function jambes(K, h, t, eq){
  var u = K.u, s = '', role = h.role;
  if(role === 'sage'){
    /* chaussures sous la robe */
    s += '<path d="M120 400 Q 112 404 112 410 Q 113 415 122 415 L 146 415 Q 148 406 146 400 Z M180 400 Q 188 404 188 410 Q 187 415 178 415 L 154 415 Q 152 406 154 400 Z" fill="' + (eq.pieds ? u('argent') : u('cuir')) + '"' + c(2) + '/>';
    return s;
  }
  var jG = 'M125 240 C 122 270 122 296 124 316 C 120 336 120 356 124 382 L 138 382 C 141 356 142 334 140 316 C 142 292 146 266 150 248 Z';
  var jD = 'M175 240 C 178 270 178 296 176 316 C 180 336 180 356 176 382 L 162 382 C 159 356 158 334 160 316 C 158 292 154 266 150 248 Z';
  s += '<path d="' + jG + '" fill="' + u('pant') + '"' + c(2.2) + '/><path d="' + jD + '" fill="' + u('pant') + '"' + c(2.2) + '/>';
  s += '<path d="M168 250 C 172 276 173 298 171 316 C 175 336 175 356 172 382 L 176 382 C 180 356 180 336 176 316 C 178 296 178 270 175 240 Z" fill="#000" opacity=".25"/>';
  if(t === 1) s += '<path d="M128 300 l8 2 l-1 8 l-8 -2 Z" fill="#a98a5a"' + c(1.2) + '/>';
  if(role === 'barde' && t >= 2) s += '<path d="M126 270 L 140 268 M124 300 L 140 298 M162 268 L 176 270 M160 298 L 176 300" stroke="' + u('or') + '" stroke-width="1.6" opacity=".7"/>';
  s += bottes(K, h, t, eq);
  return s;
}

function bottes(K, h, t, eq){
  var u = K.u, s = '';
  var p = eq.pieds;
  var haut = 'M119 316 C 117 338 117 360 119 382 C 116 392 106 398 104 406 Q 104 414 113 414 L 141 414 Q 146 414 145 406 L 142 382 C 144 360 145 338 143 316 Q 131 312 119 316 Z';
  var hautD = 'M181 316 C 183 338 183 360 181 382 C 184 392 194 398 196 406 Q 196 414 187 414 L 159 414 Q 154 414 155 406 L 158 382 C 156 360 155 338 157 316 Q 169 312 181 316 Z';
  var bas = 'M120 352 C 119 364 119 374 119 384 C 116 392 106 398 104 406 Q 104 414 113 414 L 141 414 Q 146 414 145 406 L 142 384 C 142 374 142 364 141 352 Z';
  var basD = 'M180 352 C 181 364 181 374 181 384 C 184 392 194 398 196 406 Q 196 414 187 414 L 159 414 Q 154 414 155 406 L 158 384 C 158 374 158 364 159 352 Z';
  function ailes(coul){
    var r = '';
    [[118,-1],[182,1]].forEach(function(a){
      var x = a[0], d = a[1];
      r += '<path d="M' + x + ' 378 C ' + (x + d * 14) + ' 376 ' + (x + d * 24) + ' 366 ' + (x + d * 26) + ' 350 C ' + (x + d * 18) + ' 360 ' + (x + d * 10) + ' 364 ' + x + ' 366 Z" fill="#ffffff"' + c(1.6) + '/>';
      r += '<path d="M' + x + ' 368 C ' + (x + d * 10) + ' 364 ' + (x + d * 16) + ' 356 ' + (x + d * 16) + ' 346 C ' + (x + d * 10) + ' 352 ' + (x + d * 6) + ' 354 ' + x + ' 356 Z" fill="' + coul + '"' + c(1.4) + '/>';
    });
    return A('pj-ailes', r);
  }
  if(p === 'bottes_fondateurs'){
    s += ailes('#d6fbff');
    s += '<path d="' + haut + '" fill="' + u('argent') + '"' + c(2.2) + '/><path d="' + hautD + '" fill="' + u('argent') + '"' + c(2.2) + '/>';
    s += '<path d="M136 318 C 140 340 140 362 138 384 L 143 384 C 145 360 145 338 143 316 Z M174 318 C 178 340 178 362 176 384 L 181 384 C 183 360 183 338 181 316 Z" fill="#7d8bb0" opacity=".55"/>';
    s += '<path d="M117 312 Q 131 306 145 312 L 145 322 Q 131 316 117 322 Z" fill="' + u('or') + '"' + c(1.6) + '/><path d="M155 312 Q 169 306 183 312 L 183 322 Q 169 316 155 322 Z" fill="' + u('or') + '"' + c(1.6) + '/>';
    s += A('pj-pulse', '<path d="M131 330 v 36 M126 340 l5 -5 l5 5 M169 330 v 36 M164 340 l5 -5 l5 5" stroke="#8ff3ff" stroke-width="6" fill="none" opacity=".5" stroke-linecap="round"/>');
    s += '<path d="M131 330 v 36 M126 340 l5 -5 l5 5 M169 330 v 36 M164 340 l5 -5 l5 5" stroke="#3fd2ea" stroke-width="2" fill="none" stroke-linecap="round"/>';
  } else if(p === 'bottes_vent'){
    s += ailes('#e8f7ff');
    s += '<path d="' + haut + '" fill="#cfe6f4"' + c(2.2) + '/><path d="' + hautD + '" fill="#a9c6dc"' + c(2.2) + '/>';
    s += '<path d="M117 314 Q 131 308 145 314 L 145 322 Q 131 316 117 322 Z M155 314 Q 169 308 183 314 L 183 322 Q 169 316 155 322 Z" fill="#5f9fc8"' + c(1.4) + '/>';
    s += '<path d="M126 340 q 6 -4 10 2 M164 340 q 6 -4 10 2" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round"/>';
  } else if(p === 'bottes_souples'){
    s += '<path d="' + bas + '" fill="#8a6a4a"' + c(2.2) + '/><path d="' + basD + '" fill="#6e5236"' + c(2.2) + '/>';
    s += '<path d="M119 356 l 4 -6 l 4 6 l 4 -6 l 4 6 l 4 -6 l 3 6 M159 356 l 4 -6 l 4 6 l 4 -6 l 4 6 l 4 -6 l 3 6" stroke="#5a3d24" stroke-width="2" fill="none" stroke-linejoin="round"/>';
  } else if(t >= 2){
    s += '<path d="' + haut + '" fill="' + u('cuir') + '"' + c(2.2) + '/><path d="' + hautD + '" fill="' + u('cuir') + '"' + c(2.2) + '/>';
    s += '<path d="M117 312 Q 131 306 145 312 L 145 322 Q 131 316 117 322 Z M155 312 Q 169 306 183 312 L 183 322 Q 169 316 155 322 Z" fill="' + (t >= 3 ? u('or') : '#8a5a30') + '"' + c(1.6) + '/>';
    s += '<path d="M174 318 C 178 340 178 362 176 384 L 181 384 C 183 360 183 338 181 316 Z" fill="#000" opacity=".25"/>';
  } else {
    s += '<path d="' + bas + '" fill="' + u('cuir') + '"' + c(2.2) + '/><path d="' + basD + '" fill="' + u('cuir') + '"' + c(2.2) + '/>';
    s += '<path d="M119 352 Q 130 348 142 352 L 142 360 Q 130 356 119 360 Z M158 352 Q 170 348 181 352 L 181 360 Q 170 356 158 360 Z" fill="#8a5a30"' + c(1.4) + '/>';
  }
  s += '<path d="M104 407 Q 104 414 113 414 L 141 414 Q 146 414 145 407 Z M196 407 Q 196 414 187 414 L 159 414 Q 154 414 155 407 Z" fill="#2a1c26"/>';
  return s;
}

/* Vêtement principal */
function torse(K, h, t){
  var u = K.u, s = '', role = h.role, f = h.sexe === 'f';
  var rim = '<path d="M184 146 L 180 204 C 184 222 188 244 192 266" fill="none" stroke="#ffe6b0" stroke-width="1.6" opacity=".55"/>';
  if(role === 'pisteur'){
    var tun = f ? 'M118 146 C 126 138 138 136 150 136 C 162 136 174 138 182 146 L 177 200 C 181 222 190 246 197 272 Q 150 284 103 272 C 110 246 119 222 123 200 Z'
                : 'M116 146 C 124 138 136 136 150 136 C 164 136 176 138 184 146 L 180 204 C 184 222 188 244 192 266 Q 150 278 108 266 C 112 244 116 222 120 204 Z';
    s += '<path d="' + tun + '" fill="' + u('tun') + '"' + c(2.4) + '/>';
    s += '<path d="M152 137 C 164 137 176 139 183 146 L 179 204 C 183 222 187 244 ' + (f ? '196 271 Q 172 279 152 280' : '191 266 Q 172 272 152 274') + ' Z" fill="' + u('tunO') + '" opacity=".75"/>' + rim;
    if(t === 1){
      s += '<path d="M143 138 L 150 160 L 157 138" fill="none" stroke="#8c7450" stroke-width="2"/><path d="M145 146 h10 M147 153 h6" stroke="#6b4a2a" stroke-width="1.6"/>';
      s += '<path d="M164 232 l14 -2 l2 13 l-14 2 Z" fill="#b8a27a"' + c(1.2) + '/><path d="M166 236 l10 -1 M167 240 l10 -1" stroke="#8c7450" stroke-width="1" stroke-dasharray="2 2"/>';
    } else {
      s += '<path d="M140 138 L 150 158 L 160 138" fill="' + u('tunO') + '"' + c(1.6) + '/>';
      if(t >= 3){ s += '<path d="' + (f ? 'M106 268 Q 150 280 194 268' : 'M111 262 Q 150 274 189 262') + '" stroke="' + u('or') + '" stroke-width="2.6" fill="none"/>'; }
      if(t === 4){
        s += '<path d="M118 268 q 4 -6 8 0 q -4 6 -8 0 Z M140 272 q 4 -6 8 0 q -4 6 -8 0 Z M162 272 q 4 -6 8 0 q -4 6 -8 0 Z M180 268 q 4 -6 8 0 q -4 6 -8 0 Z" fill="' + u('or') + '"/>';
        s += '<path d="M150 150 q 9 12 0 26 q -9 -14 0 -26 Z" fill="' + u('or') + '"' + c(1.2) + '/>';
      }
    }
  } else if(role === 'alchimiste'){
    /* chemise/gilet dessous */
    s += '<path d="M126 146 L 174 146 L 172 236 L 128 236 Z" fill="' + (t === 1 ? '#f4efe2' : u('acc')) + '"' + c(2) + '/>';
    if(t >= 2) s += '<path d="M150 146 L 150 236 M140 170 h20 M140 196 h20 M140 222 h20" stroke="' + O + '" stroke-width="1.2" opacity=".5"/><circle cx="150" cy="182" r="2" fill="' + u('or') + '"/><circle cx="150" cy="208" r="2" fill="' + u('or') + '"/>';
    var man = f ? 'M114 146 C 124 138 136 136 150 136 C 164 136 176 138 186 146 L 181 204 C 187 250 196 296 202 334 Q 182 342 162 338 L 156 206 L 150 160 L 144 206 L 138 338 Q 118 342 98 334 C 104 296 113 250 119 204 Z'
                : 'M114 146 C 124 138 136 136 150 136 C 164 136 176 138 186 146 L 182 206 C 188 250 194 300 198 336 Q 178 344 160 340 L 156 206 L 150 160 L 144 206 L 140 340 Q 122 344 102 336 C 106 300 112 250 118 206 Z';
    s += '<path d="' + man + '" fill="' + u('tun') + '"' + c(2.4) + '/>';
    s += '<path d="M156 206 L 160 340 Q 178 344 198 336 C 194 300 188 250 182 206 L 186 146 C 178 140 168 138 158 138 L 150 160 Z" fill="' + u('tunO') + '" opacity=".7"/>';
    s += '<path d="M138 140 L 150 160 L 144 206 M162 140 L 150 160 L 156 206" fill="none"' + c(1.8) + '/>';
    s += '<path d="M106 286 l18 -2 l1 16 l-18 2 Z M176 284 l18 2 l-1 16 l-18 -2 Z" fill="' + u('tunO') + '"' + c(1.4) + '/>';
    if(t === 1) s += '<path d="M110 300 l8 -1 l1 8 l-8 1 Z" fill="#b5ad96"' + c(1) + '/><path d="M170 250 l10 6" stroke="#8a826c" stroke-width="2" stroke-dasharray="2 2"/>';
    if(t >= 3) s += '<path d="M104 330 Q 120 338 138 334 M162 334 Q 180 338 196 330" stroke="' + u('or') + '" stroke-width="2.6" fill="none"/><path d="M138 142 L 146 154 M162 142 L 154 154" stroke="' + u('or') + '" stroke-width="2.2"/>';
    if(t === 4) s += '<g class="pj-scintille" fill="' + K.role.lueur + '"><path d="' + etoile4(118, 312, 4) + '"/><path d="' + etoile4(186, 306, 3.4) + '"/><path d="' + etoile4(126, 260, 3) + '"/></g>';
  } else if(role === 'barde'){
    if(f){
      s += '<path d="M120 216 Q 150 226 180 216 C 192 256 202 292 208 318 Q 150 334 92 318 C 98 292 108 256 120 216 Z" fill="' + u('tun') + '"' + c(2.3) + '/>';
      s += '<path d="M152 224 Q 168 222 180 216 C 192 256 202 292 208 318 Q 182 326 156 328 Z" fill="' + u('tunO') + '" opacity=".7"/>';
      s += '<path d="M94 316 q 8 6 16 2 q 8 6 16 2 q 8 6 16 2 q 8 6 16 2 q 8 6 16 2 q 8 6 16 2 q 8 6 16 0" stroke="' + (t >= 2 ? u('or') : '#fff') + '" stroke-width="2.2" fill="none" opacity=".85"/>';
      s += '<path d="M132 226 L 126 316 M150 228 L 150 324 M168 226 L 174 316" stroke="' + O + '" stroke-width="1.2" opacity=".35"/>';
    }
    var dou = 'M116 146 C 124 138 136 136 150 136 C 164 136 176 138 184 146 L 181 204 C 183 222 186 236 188 250 Q 150 262 112 250 C 114 236 117 222 119 204 Z';
    s += '<path d="' + dou + '" fill="' + u('tun') + '"' + c(2.4) + '/>';
    s += '<path d="M152 137 C 164 137 176 139 183 146 L 180 204 C 182 222 185 236 187 250 Q 168 256 152 258 Z" fill="' + u('tunO') + '" opacity=".75"/>';
    s += '<path d="M134 150 L 132 250 M150 152 L 150 256 M166 150 L 168 250" stroke="' + (t >= 3 ? '#ffe6b0' : O) + '" stroke-width="' + (t >= 3 ? 1.8 : 1.2) + '" opacity="' + (t >= 3 ? .8 : .35) + '"/>';
    /* col en fraise */
    s += '<path d="M132 140 q 6 -6 12 0 q 6 -6 12 0 q 6 -6 12 0 L 168 146 q -6 6 -12 0 q -6 6 -12 0 q -6 6 -12 0 Z" fill="' + u('blanc') + '"' + c(1.6) + '/>';
    if(t >= 2) s += '<path d="M114 250 Q 150 262 188 250" stroke="' + u('or') + '" stroke-width="2.4" fill="none"/>';
    if(t === 1) s += '<path d="M168 220 l10 -1 l1 10 l-10 1 Z" fill="#cdbb94"' + c(1) + '/>';
  } else if(role === 'sage'){
    var robe = f ? 'M116 146 C 124 138 136 136 150 136 C 164 136 176 138 184 146 L 180 206 C 192 270 202 340 210 400 Q 150 414 90 400 C 98 340 108 270 120 206 Z'
                 : 'M114 146 C 124 138 136 136 150 136 C 164 136 176 138 186 146 L 184 206 C 192 270 200 340 206 400 Q 150 412 94 400 C 100 340 108 270 116 206 Z';
    s += '<path d="' + robe + '" fill="' + u('tun') + '"' + c(2.4) + '/>';
    s += '<path d="M156 206 C 162 270 170 340 174 406 Q 192 404 ' + (f ? '210 400 C 202 340 192 270 180 206' : '206 400 C 200 340 192 270 184 206') + ' L 184 146 C 176 140 166 138 156 138 Z" fill="' + u('tunO') + '" opacity=".72"/>';
    s += '<path d="M150 150 L 150 404" stroke="' + O + '" stroke-width="1.4" opacity=".4"/>';
    if(t >= 2) s += '<path d="' + (f ? 'M92 398 Q 150 412 208 398' : 'M96 398 Q 150 410 204 398') + '" stroke="' + (t >= 3 ? u('or') : u('acc')) + '" stroke-width="4" fill="none"/>';
    if(t >= 3) s += '<path d="M146 150 L 146 400 M154 150 L 154 400" stroke="' + u('or') + '" stroke-width="1.6" opacity=".8"/>';
    if(t === 4) s += '<g fill="#fff6c8" class="pj-scintille"><path d="' + etoile4(124, 330, 4) + '"/><path d="' + etoile4(178, 360, 3.6) + '"/><path d="' + etoile4(132, 380, 2.8) + '"/><path d="' + etoile4(170, 300, 3) + '"/></g>';
    if(t === 1) s += '<path d="M118 360 l10 -2 l2 12 l-10 2 Z" fill="#a89070"' + c(1) + '/>';
    /* capuche dans le dos */
    s += '<path d="M120 148 C 126 136 140 132 150 132 C 160 132 174 136 180 148 C 170 144 160 142 150 142 C 140 142 130 144 120 148 Z" fill="' + u('tunO') + '"' + c(1.8) + '/>';
  }
  return s;
}

function ceinture(K, h, t){
  var u = K.u, role = h.role, s = '';
  var y = role === 'barde' ? 214 : 202;
  if(role === 'alchimiste') y = 206;
  if(t === 1){
    if(role === 'sage') return '<path d="M118 206 Q 150 214 182 206" stroke="' + u('acc') + '" stroke-width="7" fill="none"/><path d="M138 210 q -4 12 -2 22 M144 210 q 2 12 6 20" stroke="' + u('acc') + '" stroke-width="4" fill="none" stroke-linecap="round"/>';
    return '<path d="M119 ' + (y + 4) + ' Q 150 ' + (y + 10) + ' 181 ' + (y + 4) + '" stroke="#c9b48a" stroke-width="5" fill="none"/><path d="M119 ' + (y + 4) + ' Q 150 ' + (y + 10) + ' 181 ' + (y + 4) + '" stroke="' + O + '" stroke-width="1" fill="none" stroke-dasharray="3 3" opacity=".5"/><path d="M138 ' + (y + 6) + ' q -4 10 -2 18 M142 ' + (y + 6) + ' q 2 10 6 16" stroke="#c9b48a" stroke-width="3" fill="none" stroke-linecap="round"/>';
  }
  if(role === 'sage'){
    s += '<path d="M117 202 Q 150 210 183 202 L 184 214 Q 150 222 116 214 Z" fill="' + u('acc') + '"' + c(1.8) + '/>';
    s += '<path d="M142 214 q -6 18 -4 34 M148 214 q 2 18 8 32" stroke="' + u('acc') + '" stroke-width="5" fill="none" stroke-linecap="round"/>';
    if(t >= 3) s += '<circle cx="150" cy="210" r="6" fill="' + u('or') + '"' + c(1.4) + '/><circle cx="150" cy="210" r="2.4" fill="#8ff3ff"/>';
    return s;
  }
  s += '<path d="M119 ' + y + ' L 181 ' + y + ' L 182 ' + (y + 12) + ' L 118 ' + (y + 12) + ' Z" fill="' + u('cuir') + '"' + c(2) + '/>';
  s += '<rect x="141" y="' + (y - 4) + '" width="18" height="20" rx="3" fill="' + (t >= 3 ? u('or') : '#c9b07a') + '"' + c(1.8) + '/>';
  if(t >= 3){
    s += '<circle cx="150" cy="' + (y + 6) + '" r="7" fill="' + u('lueur') + '" class="pj-pulse"/><circle cx="150" cy="' + (y + 6) + '" r="3.8" fill="' + K.role.c + '"' + c(1) + '/><circle cx="148.8" cy="' + (y + 4.8) + '" r="1.2" fill="#fff"/>';
  } else {
    s += '<rect x="146" y="' + (y + 1) + '" width="8" height="10" rx="1.5" fill="none" stroke="' + O + '" stroke-width="1.4"/>';
  }
  if(role === 'pisteur' && t >= 2) s += '<path d="M122 146 L 130 141 L 184 200 L 176 206 Z" fill="' + u('cuir') + '"' + c(1.8) + '/>';
  return s;
}
function baudrierT1(K, h){
  if(h.role === 'pisteur') return '<path d="M124 146 L 130 142 L 184 200 L 178 205 Z" fill="#9c7a52"' + c(1.6) + '/>';
  return '';
}

/* Foulard (palier 1) : la couleur de tenue se voit dès le début */
function foulard(K, h){
  var u = K.u;
  if(h.role === 'sage' || h.role === 'barde') return '';
  return '<path d="M134 138 C 140 146 160 146 166 138 L 168 144 C 160 154 140 154 132 144 Z" fill="' + u('acc') + '"' + c(1.6) + '/><path d="M146 148 l-6 18 l8 -4 Z" fill="' + u('acc') + '"' + c(1.4) + '/>';
}

/* ---------- Objets tenus ---------- */
function mainGauche(K, h, t, eq){
  var u = K.u, s = '', role = h.role, it = eq.main_g;
  if(role === 'pisteur'){
    if(it === 'arc_argent'){
      var arc = 'M102 122 C 84 132 80 152 88 172 C 72 214 72 292 88 334 C 80 354 84 374 102 384';
      s += A('pj-tourne', '<circle cx="70" cy="254" r="20" fill="none" stroke="#8ff3ff" stroke-width="1.6" stroke-dasharray="5 4" opacity=".75"/>');
      s += '<path d="' + arc + '" stroke="#8ff3ff" stroke-width="12" fill="none" opacity=".25" stroke-linecap="round"/>';
      s += '<path d="' + arc + '" stroke="' + O + '" stroke-width="10" fill="none" stroke-linecap="round"/><path d="' + arc + '" stroke="' + u('argentH') + '" stroke-width="6" fill="none" stroke-linecap="round"/>';
      s += '<path d="M88 172 l-7 -6 M88 334 l-7 6" stroke="' + u('or') + '" stroke-width="4" stroke-linecap="round"/><circle cx="102" cy="122" r="4" fill="' + u('or') + '"' + c(1.2) + '/><circle cx="102" cy="384" r="4" fill="' + u('or') + '"' + c(1.2) + '/>';
      s += A('pj-pulse', '<line x1="102" y1="122" x2="102" y2="384" stroke="#8ff3ff" stroke-width="6" opacity=".5"/>') + '<line x1="102" y1="122" x2="102" y2="384" stroke="#effeff" stroke-width="1.4"/>';
      s += '<path d="M78 200 l4 -6 l4 6 M74 236 h8 M74 276 h8 M78 312 l4 6 l4 -6" stroke="#e6feff" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
    } else if(it === 'arc_elfique'){
      var ae = 'M102 128 C 76 140 92 170 84 196 C 76 230 76 280 84 314 C 92 340 76 370 102 380';
      s += '<path d="' + ae + '" stroke="' + O + '" stroke-width="9" fill="none" stroke-linecap="round"/><path d="' + ae + '" stroke="#e6f2c8" stroke-width="5" fill="none" stroke-linecap="round"/>';
      s += '<path d="M84 196 q -10 -4 -12 -14 q 10 2 12 14 Z M84 314 q -10 4 -12 14 q 10 -2 12 -14 Z M80 255 q -10 -6 -8 -16 q 8 6 8 16 Z" fill="#7fd08a"' + c(1.2) + '/>';
      s += A('pj-pulse', '<line x1="102" y1="128" x2="102" y2="380" stroke="#c8ffd8" stroke-width="5" opacity=".45"/>') + '<line x1="102" y1="128" x2="102" y2="380" stroke="#f4fff0" stroke-width="1.3"/>';
    } else if(it === 'arc_court'){
      var ac = 'M101 140 C 84 150 86 170 88 182 C 78 220 78 290 88 328 C 86 340 84 360 101 370';
      s += '<path d="' + ac + '" stroke="' + O + '" stroke-width="9" fill="none" stroke-linecap="round"/><path d="' + ac + '" stroke="' + u('bois') + '" stroke-width="5" fill="none" stroke-linecap="round"/>';
      s += '<path d="M84 240 L 86 270" stroke="#6e4223" stroke-width="6" stroke-linecap="round"/><line x1="101" y1="140" x2="101" y2="370" stroke="#efe6cc" stroke-width="1.3"/>';
    } else {
      var a1 = 'M100 152 C 78 200 78 306 100 354';
      s += '<path d="' + a1 + '" stroke="' + O + '" stroke-width="9" fill="none" stroke-linecap="round"/><path d="' + a1 + '" stroke="' + u('bois') + '" stroke-width="5" fill="none" stroke-linecap="round"/>';
      s += '<line x1="100" y1="152" x2="100" y2="354" stroke="#d9cbb0" stroke-width="1.2"/>';
    }
  } else if(role === 'barde'){
    if(it === 'harpe'){
      s += '<path d="M70 196 C 64 240 66 300 80 352 L 118 352 C 104 320 108 290 122 270 C 128 240 112 214 70 196 Z" fill="none" stroke="' + O + '" stroke-width="10" stroke-linejoin="round"/>';
      s += '<path d="M70 196 C 64 240 66 300 80 352 L 118 352 C 104 320 108 290 122 270 C 128 240 112 214 70 196 Z" fill="none" stroke="' + u('or') + '" stroke-width="6" stroke-linejoin="round"/>';
      s += A('pj-pulse', '<path d="M78 210 L 82 350 M88 216 L 90 350 M98 224 L 98 350 M108 236 L 106 350 M116 252 L 112 340" stroke="#8ff3ff" stroke-width="4" opacity=".4"/>');
      s += '<path d="M78 210 L 82 350 M88 216 L 90 350 M98 224 L 98 350 M108 236 L 106 350 M116 252 L 112 340" stroke="#f0feff" stroke-width="1.1"/>';
      s += '<circle cx="70" cy="196" r="6" fill="' + u('or') + '"' + c(1.4) + '/><path d="' + etoile4(70, 196, 3.4) + '" fill="#fff"/>';
    } else {
      var ench = it === 'luth_enchante', neuf = it === 'luth_voyage' || ench;
      s += '<g transform="rotate(-8 96 300)">';
      s += '<path d="M93 180 L 101 180 L 103 300 L 91 300 Z" fill="' + (neuf ? '#3a2416' : '#5a3a24') + '"' + c(1.8) + '/>';
      s += '<path d="M90 168 L 104 168 L 106 184 L 88 184 Z" fill="' + u('cuir') + '"' + c(1.6) + '/><path d="M88 172 h-5 M88 180 h-5 M106 172 h5 M106 180 h5" stroke="' + O + '" stroke-width="2.4" stroke-linecap="round"/>';
      s += '<path d="M97 286 C 66 288 62 340 72 362 C 82 384 112 384 122 362 C 132 340 128 288 97 286 Z" fill="' + (ench ? '#7a4dc8' : neuf ? u('boisV') : '#a8743e') + '"' + c(2.2) + '/>';
      s += '<path d="M97 286 C 120 290 130 330 122 362 C 116 374 106 380 97 381 C 112 360 114 320 97 286 Z" fill="#000" opacity=".2"/>';
      s += '<circle cx="97" cy="328" r="9" fill="#2a1a10"' + c(1.4) + '/><path d="M86 356 h22" stroke="' + O + '" stroke-width="3" stroke-linecap="round"/>';
      if(ench) s += A('pj-pulse', '<path d="M95 184 L 95 356 M99 184 L 99 356" stroke="#8ff3ff" stroke-width="4" opacity=".55"/>');
      s += '<path d="M95 184 L 95 356 M99 184 L 99 356" stroke="' + (ench ? '#e6feff' : '#efe6cc') + '" stroke-width=".9"/>';
      if(!neuf) s += '<path d="M78 344 l8 4 l-4 6" stroke="#5a3a24" stroke-width="1.4" fill="none"/><path d="M110 300 l6 -2 l2 6 l-6 2 Z" fill="#cdbb94"' + c(.8) + '/>';
      if(ench) s += '<g fill="#bff8ff" class="pj-scintille"><path d="' + etoile4(80, 300, 3) + '"/><path d="' + etoile4(118, 344, 2.6) + '"/></g>';
      s += '</g>';
    }
  } else if(role === 'sage'){
    if(it === 'baton_cristal'){
      s += '<path d="M93 92 L 99 92 L 101 414 L 91 414 Z" fill="' + u('argent') + '"' + c(1.8) + '/>';
      s += '<path d="M88 96 C 84 86 88 74 96 70 C 104 74 108 86 104 96 Z" fill="' + u('or') + '"' + c(1.6) + '/>';
      s += '<circle cx="96" cy="60" r="20" fill="' + u('cyan') + '" class="pj-pulse"/>';
      s += '<path d="M96 40 L 106 56 L 96 78 L 86 56 Z" fill="#c8faff"' + c(1.8) + '/><path d="M96 40 L 100 56 L 96 78" fill="#7fe6ff" opacity=".7"/><path d="M90 52 l3 -6" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>';
    } else if(it === 'baton_marche'){
      s += '<path d="M92 90 C 90 80 94 72 100 70 C 106 74 104 84 100 90 L 102 414 L 92 414 Z" fill="' + u('boisV') + '"' + c(1.8) + '/>';
      s += '<path d="M93 140 q 4 2 8 0 M93 200 q 4 2 8 0 M93 330 q 4 2 8 0" stroke="#5a3214" stroke-width="1.4" fill="none"/>';
      s += '<path d="M100 70 q 8 -6 10 2 q -6 2 -10 -2 Z" fill="#7fd08a"' + c(1) + '/>';
    }
  }
  return s;
}

function mainDroite(K, h, t, eq){
  var u = K.u, s = '', role = h.role, it = eq.main_d;
  if(role === 'alchimiste'){
    var col = K.role.c;
    s += '<circle cx="202" cy="292" r="22" fill="' + u('lueur') + '" opacity=".55" class="pj-pulse"/>';
    s += '<path d="M197 268 L 207 268 L 207 278 C 218 282 222 296 214 306 C 208 312 196 312 190 306 C 182 296 186 282 197 278 Z" fill="' + u('verre') + '"' + c(2) + '/>';
    s += '<path d="M188 294 C 192 300 212 300 216 294 C 216 304 210 310 202 310 C 194 310 188 304 188 294 Z" fill="' + col + '" opacity=".9"/>';
    s += '<circle cx="196" cy="300" r="2" fill="#fff" opacity=".8"/><circle cx="206" cy="296" r="1.4" fill="#fff" opacity=".8"/><path d="M193 286 q 2 -6 6 -7" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/>';
    s += '<rect x="195" y="262" width="14" height="7" rx="2" fill="' + u('cuir') + '"' + c(1.4) + '/>';
    s += A('pj-monte', '<circle cx="202" cy="262" r="2.4" fill="' + K.role.lueur + '"/>') + A('pj-monte', '<circle cx="206" cy="262" r="1.8" fill="' + K.role.lueur + '"/>', ' style="animation-delay:-1.1s"');
  }
  if(role === 'sage'){
    if(it === 'boule'){
      s += '<circle cx="226" cy="236" r="28" fill="' + u('lueur') + '" class="pj-pulse"/>';
      s += A('pj-flotte', '<circle cx="226" cy="236" r="15" fill="#d8ecff"' + c(2) + ' opacity=".9"/><circle cx="226" cy="236" r="15" fill="' + u('cyan') + '" opacity=".6"/><path d="M218 228 q 4 -5 10 -4" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M220 240 q 6 4 12 -2" stroke="#7fb8ff" stroke-width="1.6" fill="none"/>');
    } else {
      var gros = it === 'livre_annote';
      s += '<g transform="rotate(8 214 262)">';
      s += '<rect x="198" y="236" width="' + (gros ? 34 : 28) + '" height="' + (gros ? 42 : 36) + '" rx="3" fill="' + (gros ? '#6a2e34' : '#5b4a7a') + '"' + c(2) + '/>';
      s += '<path d="M' + (gros ? 230 : 224) + ' 238 L ' + (gros ? 230 : 224) + ' ' + (gros ? 276 : 270) + '" stroke="#f3e7cb" stroke-width="3"/>';
      if(gros){
        s += '<path d="M200 238 l6 0 l-6 6 Z M200 276 l6 0 l-6 -6 Z" fill="' + u('or') + '"/><path d="M212 236 l0 -8 l4 4 l4 -4 l0 8" fill="#e05a5a"' + c(1) + '/><path d="M222 236 l0 -6 l3 3 l3 -3 l0 6" fill="#5ab8e0"' + c(1) + '/>';
      }
      s += '<path d="' + etoile4(gros ? 213 : 211, gros ? 257 : 254, 5) + '" fill="' + u('or') + '"/>';
      s += '</g>';
    }
  }
  return s;
}

/* ---------- Petits objets de ceinture ---------- */
var PETITS = {
  lanterne_sourde:function(K){ return '<rect x="-6" y="0" width="12" height="16" rx="2" fill="#4a3a2a"' + c(1.4) + '/><rect x="-4" y="3" width="8" height="10" rx="1" fill="#ffd27a"/><circle cx="0" cy="8" r="9" fill="' + K.u('feu') + '" opacity=".5" class="pj-pulse"/><path d="M-4 0 Q 0 -6 4 0" stroke="' + O + '" stroke-width="1.4" fill="none"/>'; },
  lanterne_lune:function(K){ return '<rect x="-6" y="0" width="12" height="17" rx="3" fill="' + K.u('argent') + '"' + c(1.4) + '/><rect x="-4" y="3" width="8" height="11" rx="2" fill="#bff8ff"/><path d="M1 5 a3 3 0 1 0 0 6 a2.4 2.4 0 1 1 0 -6 Z" fill="#3a5fb0"/><circle cx="0" cy="9" r="11" fill="' + K.u('cyan') + '" opacity=".55" class="pj-pulse"/><path d="M-4 0 Q 0 -6 4 0" stroke="' + O + '" stroke-width="1.4" fill="none"/>'; },
  longue_vue_ch:function(K){ return '<path d="M-10 2 L 10 0 L 11 7 L -10 8 Z" fill="' + K.u('or') + '"' + c(1.4) + '/><path d="M-3 1 v7 M4 0.5 v7" stroke="' + O + '" stroke-width="1"/>'; },
  longue_vue:function(K){ return PETITS.longue_vue_ch(K); },
  fioles_renf:function(K){ return '<path d="M-7 4 h5 v4 q 3 2 2 8 h-9 q -1 -6 2 -8 Z M2 2 h5 v5 q 3 2 2 8 h-9 q -1 -6 2 -8 Z" fill="' + K.u('verre') + '"' + c(1.2) + '/><path d="M-8 12 h8 M1 11 h8" stroke="#7fd08a" stroke-width="3"/><path d="M-7 4 h5 M2 2 h5" stroke="' + K.u('argent') + '" stroke-width="2.4"/>'; },
  mortier:function(K){ return '<path d="M-8 4 Q 0 18 8 4 Z" fill="#9aa0b0"' + c(1.4) + '/><path d="M2 6 L 8 -4" stroke="#7a8090" stroke-width="3" stroke-linecap="round"/>'; },
  herbier:function(K){ return '<rect x="-7" y="0" width="14" height="17" rx="2" fill="#3f7d4a"' + c(1.4) + '/><path d="M0 4 q 4 4 0 9 q -4 -5 0 -9 Z" fill="#a8e6a0"/>'; },
  loupe_doree:function(K){ return '<circle cx="0" cy="6" r="6" fill="#d8f4ff" opacity=".8"' + c(1.4) + '/><circle cx="0" cy="6" r="6" fill="none" stroke="' + K.u('or') + '" stroke-width="2.4"/><path d="M4 11 L 8 18" stroke="' + K.u('or') + '" stroke-width="3" stroke-linecap="round"/>'; },
  grimoire_rec:function(K){ return '<rect x="-7" y="0" width="14" height="17" rx="2" fill="#5a2a7a"' + c(1.4) + '/><path d="' + etoile4(0, 8, 4) + '" fill="' + K.u('or') + '"/><path d="M-7 -4 L 0 0" stroke="#aab" stroke-width="1.4" stroke-dasharray="2 1"/>'; },
  balance_or:function(K){ return '<path d="M0 0 v 12 M-8 4 h16" stroke="' + K.u('or') + '" stroke-width="2"/><path d="M-11 6 q 3 6 6 0 Z M5 6 q 3 6 6 0 Z" fill="' + K.u('or') + '"' + c(1) + '/>'; },
  carnet_ragots:function(K){ return '<rect x="-6" y="0" width="12" height="15" rx="1.5" fill="#c84a6a"' + c(1.4) + '/><path d="M-3 4 h6 M-3 8 h6 M-3 11 h4" stroke="#fff" stroke-width="1"/>'; },
  bourse:function(K){ return '<path d="M-5 2 Q -10 10 -6 16 Q 0 19 6 16 Q 10 10 5 2 Z" fill="#8a5a30"' + c(1.4) + '/><path d="M-5 2 Q 0 5 5 2" stroke="' + K.u('or') + '" stroke-width="2" fill="none"/><circle cx="0" cy="10" r="2.4" fill="' + K.u('or') + '"/>'; },
  bonbons:function(K){ return '<path d="M-6 3 h12 l-1 12 h-10 Z" fill="#ffe2a0" opacity=".9"' + c(1.3) + '/><circle cx="-2" cy="9" r="2.2" fill="#e8a020"/><circle cx="2.5" cy="11" r="2" fill="#f0c040"/><rect x="-7" y="0" width="14" height="4" rx="1" fill="#c84a6a"' + c(1) + '/>'; },
  clochette:function(K){ return '<path d="M-6 13 Q -6 3 0 2 Q 6 3 6 13 Z" fill="' + K.u('or') + '"' + c(1.4) + '/><circle cx="0" cy="15" r="2" fill="' + K.u('or') + '"' + c(1) + '/>' + A('pj-scintille', '<path d="M8 4 l3 -2 M9 9 h4" stroke="#fff6c8" stroke-width="1.4" stroke-linecap="round"/>'); },
  cornet:function(K){ return '<path d="M-2 4 L 8 0 L 8 14 L -2 9 Z" fill="' + K.u('or') + '"' + c(1.3) + '/><path d="M-2 6 q -6 2 -6 8" stroke="' + K.u('or') + '" stroke-width="3" fill="none" stroke-linecap="round"/>'; },
  lettre_maire:function(K){ return '<rect x="-8" y="2" width="16" height="7" rx="3.5" fill="#f3e7cb"' + c(1.3) + '/><circle cx="0" cy="11" r="3" fill="#c0392b"' + c(1) + '/>'; },
  carillon:function(K){ return '<path d="M-8 0 h16" stroke="' + K.u('or') + '" stroke-width="2"/><path d="M-6 0 v10 M-2 0 v14 M2 0 v12 M6 0 v8" stroke="' + K.u('argentH') + '" stroke-width="2.4" stroke-linecap="round"/>'; },
  masque_velours:function(K){ return '<path d="M-10 4 Q -6 0 0 4 Q 6 0 10 4 Q 10 10 4 10 Q 0 8 -4 10 Q -10 10 -10 4 Z" fill="#3a1a4a"' + c(1.3) + '/><circle cx="-5" cy="6" r="1.6" fill="#fff" opacity=".4"/><circle cx="5" cy="6" r="1.6" fill="#fff" opacity=".4"/>'; },
  miroir:function(K){ return '<ellipse cx="0" cy="6" rx="6" ry="7" fill="#d8f4ff"' + c(1.4) + '/><ellipse cx="0" cy="6" rx="6" ry="7" fill="none" stroke="' + K.u('or') + '" stroke-width="2.2"/><path d="M0 13 v6" stroke="' + K.u('or') + '" stroke-width="3" stroke-linecap="round"/><path d="M-3 3 l3 -2" stroke="#fff" stroke-width="1.4"/>'; },
  corne:function(K){ return '<path d="M-10 2 C -4 10 4 12 10 6 L 10 12 C 2 18 -8 14 -12 4 Z" fill="#f0e2c0"' + c(1.4) + '/><path d="M8 6 l2 6" stroke="' + K.u('or') + '" stroke-width="2.4"/>'; },
  cor:function(K){ return '<path d="M-10 2 C -4 10 4 12 10 6 L 10 12 C 2 18 -8 14 -12 4 Z" fill="' + K.u('or') + '"' + c(1.4) + '/>'; },
  sablier:function(K){ return '<path d="M-5 0 h10 M-5 16 h10" stroke="' + K.u('bois') + '" stroke-width="3" stroke-linecap="round"/><path d="M-4 1 L 4 1 L 0 8 L 4 15 L -4 15 L 0 8 Z" fill="#e6f6ff"' + c(1.2) + '/><path d="M-2 13 L 2 13 L 0 10 Z" fill="#f0c040"/>'; },
  cle_archives:function(K){ return '<circle cx="0" cy="3" r="4" fill="none" stroke="' + K.u('or') + '" stroke-width="2.4"/><path d="M0 7 v11 M0 14 h4 M0 17 h3" stroke="' + K.u('or') + '" stroke-width="2.4" stroke-linecap="round"/>'; },
  pierre_runes:function(K){ return '<path d="M-6 2 L 5 0 L 8 12 L -3 16 L -8 10 Z" fill="#8a90a8"' + c(1.4) + '/><path d="M-2 4 l2 8 l3 -6" stroke="#8ff3ff" stroke-width="1.6" fill="none"/>'; },
  /* pièges de chasseur (Pisteur) : un petit piège à mâchoires accroché à la ceinture */
  pieges:function(K){ return '<path d="M0 -2 v4" stroke="' + O + '" stroke-width="1.6"/><path d="M-9 8 A 9 7 0 0 1 9 8 Z" fill="#9aa0b0"' + c(1.4) + '/><path d="M-7 8 l2 -4 l2 4 l2 -4 l2 4 l2 -4 l2 4" stroke="#e6ecf6" stroke-width="1.2" fill="none" stroke-linejoin="round"/><rect x="-10" y="8" width="20" height="4" rx="2" fill="#6b7080"' + c(1.2) + '/><circle cx="0" cy="2" r="2" fill="#6b7080"' + c(1) + '/>'; },
  /* déguisement de colporteur (Barde) : lunettes, faux nez et moustache, pendus à la ceinture */
  deguisement:function(K){ return '<path d="M0 -2 v3" stroke="' + O + '" stroke-width="1.4"/><circle cx="-5" cy="5" r="4.2" fill="#d8f4ff" fill-opacity=".5" stroke="' + O + '" stroke-width="1.6"/><circle cx="5" cy="5" r="4.2" fill="#d8f4ff" fill-opacity=".5" stroke="' + O + '" stroke-width="1.6"/><path d="M-1 5 h2" stroke="' + O + '" stroke-width="1.6"/><path d="M-2 6 Q 0 13 3 10 Z" fill="#f0a888"' + c(1.1) + '/><path d="M-9 14 Q -4 10 0 13 Q 4 10 9 14 Q 4 16 0 14.5 Q -4 16 -9 14 Z" fill="#4a3020"' + c(1.1) + '/>'; }
};
/* Des bottes magiques achetées, quand le Pisteur porte d'autres bottes de sa garde-robe : leurs petites ailes de vent s'ajoutent */
function ailesBottes(eq){
  var p = eq.pieds; if(p !== 'bottes_vent' && p !== 'bottes_fondateurs') return '';
  var coul = p === 'bottes_fondateurs' ? '#d6fbff' : '#e8f7ff', r = '';
  [[118, -1], [182, 1]].forEach(function(a){
    var x = a[0], d = a[1];
    r += '<path d="M' + x + ' 378 C ' + (x + d * 14) + ' 376 ' + (x + d * 24) + ' 366 ' + (x + d * 26) + ' 350 C ' + (x + d * 18) + ' 360 ' + (x + d * 10) + ' 364 ' + x + ' 366 Z" fill="#ffffff"' + c(1.6) + '/>';
    r += '<path d="M' + x + ' 368 C ' + (x + d * 10) + ' 364 ' + (x + d * 16) + ' 356 ' + (x + d * 16) + ' 346 C ' + (x + d * 10) + ' 352 ' + (x + d * 6) + ' 354 ' + x + ' 356 Z" fill="' + coul + '"' + c(1.4) + '/>';
  });
  return A('pj-ailes', r);
}

function petitsCeinture(K, h, eq){
  var liste = (eq.ceinture || []).slice();
  if(!liste.length) return '';
  var role = h.role;
  var pos = role === 'sage' ? [[124, 216], [176, 216], [164, 226]] : role === 'barde' ? [[126, 226], [176, 226], [164, 232]] : role === 'alchimiste' ? [[126, 218], [172, 218], [160, 226]] : [[126, 214], [170, 216], [160, 224]];
  var s = '';
  liste.forEach(function(id, i){ var p = pos[i]; if(PETITS[id]) s += '<g transform="translate(' + p[0] + ' ' + p[1] + ')">' + PETITS[id](K) + '</g>'; });
  return s;
}

/* Rangée de fioles (ceinture à fioles) */
function rangeeFioles(K, h){
  var y = h.role === 'alchimiste' ? 208 : 204, s = '';
  ['#7fd08a','#ff8fb3','#8ff3ff','#ffd27a','#b48cff'].forEach(function(col, i){
    var x = 122 + i * 8 + (i > 1 ? 18 : 0);
    s += '<path d="M' + (x - 2) + ' ' + y + ' h4 v3 q 3 1 3 6 v4 h-10 v-4 q 0 -5 3 -6 Z" fill="' + K.u('verre') + '"' + c(1) + '/><path d="M' + (x - 4.5) + ' ' + (y + 10) + ' h9 v3 h-9 Z" fill="' + col + '"/>';
  });
  return s;
}

/* Cou */
function objetCou(K, h, it){
  var u = K.u, s = '';
  var y = h.role === 'barde' ? 150 : 148;
  var cord = '<path d="M138 ' + (y - 8) + ' Q 150 ' + (y + 16) + ' 162 ' + (y - 8) + '" stroke="' + (it === 'sifflet' ? '#8a5a30' : u('or')) + '" stroke-width="1.6" fill="none"/>';
  var cx = 150, cy = y + 16;
  if(it === 'sifflet') s += cord + '<path d="M144 ' + cy + ' h10 q 4 0 4 4 q 0 4 -4 4 h-6 q -4 0 -4 -4 Z" fill="' + u('argent') + '"' + c(1.3) + '/>';
  else if(it === 'amulette_instinct') s += cord + '<circle cx="' + cx + '" cy="' + (cy + 4) + '" r="10" fill="' + u('lueur') + '" class="pj-pulse"/><path d="M' + cx + ' ' + (cy - 2) + ' l6 6 l-6 7 l-6 -7 Z" fill="' + u('or') + '"' + c(1.3) + '/><circle cx="' + cx + '" cy="' + (cy + 4) + '" r="2.4" fill="#4ce08a"/>';
  else if(it === 'pendule') s += cord + '<path d="M' + cx + ' ' + (cy - 2) + ' l5 5 l-5 12 l-5 -12 Z" fill="#e6c8ff"' + c(1.3) + '/><circle cx="' + cx + '" cy="' + (cy + 5) + '" r="9" fill="' + u('lueur') + '" opacity=".6" class="pj-pulse"/>';
  else if(it === 'loupe_lecture') s += cord + '<circle cx="' + cx + '" cy="' + (cy + 3) + '" r="6" fill="#d8f4ff" opacity=".85"' + c(1.3) + '/><circle cx="' + cx + '" cy="' + (cy + 3) + '" r="6" fill="none" stroke="' + u('or') + '" stroke-width="2"/>';
  else if(it === 'astrolabe') s += cord + '<circle cx="' + cx + '" cy="' + (cy + 4) + '" r="8" fill="' + u('or') + '"' + c(1.4) + '/><circle cx="' + cx + '" cy="' + (cy + 4) + '" r="4.5" fill="none" stroke="#94620e" stroke-width="1.2"/><path d="M' + (cx - 7) + ' ' + (cy + 4) + ' h14 M' + cx + ' ' + (cy - 3) + ' v14" stroke="#94620e" stroke-width="1"/>';
  else if(it === 'oeil_temps') s += cord + '<circle cx="' + cx + '" cy="' + (cy + 5) + '" r="14" fill="' + u('cyan') + '" class="pj-pulse"/><path d="M' + (cx - 9) + ' ' + (cy + 5) + ' Q ' + cx + ' ' + (cy - 4) + ' ' + (cx + 9) + ' ' + (cy + 5) + ' Q ' + cx + ' ' + (cy + 14) + ' ' + (cx - 9) + ' ' + (cy + 5) + ' Z" fill="#fff"' + c(1.4) + '/><circle cx="' + cx + '" cy="' + (cy + 5) + '" r="3.4" fill="#2a6fd0"/><path d="M' + (cx - 2) + ' ' + (cy + 3) + ' L ' + (cx + 2) + ' ' + (cy + 3) + ' L ' + (cx - 2) + ' ' + (cy + 7) + ' L ' + (cx + 2) + ' ' + (cy + 7) + ' Z" fill="#fff" opacity=".8"/>';
  return s;
}

/* Capes (derrière le corps) */
function cape(K, h, t, eq){
  var u = K.u, s = '', it = eq.cape;
  var forme = 'M114 144 C 92 200 84 290 88 400 C 128 392 176 404 230 414 C 260 360 254 270 218 206 C 206 168 198 150 186 144 Z';
  if(it === 'cape_rodeur' || (h.role === 'pisteur' && t === 4 && !it)){
    s += A('pj-cape', '<path d="' + forme + '" fill="' + u('cape') + '"' + c(2.4) + '/>' +
      '<path d="M186 144 C 198 150 206 168 218 206 C 254 270 260 360 230 414 C 226 413 223 412 220 411 C 249 360 246 274 212 210 C 200 174 192 156 182 146 Z" fill="' + (t >= 3 ? u('or') : '#3f6b52') + '"/>' +
      '<path d="M114 144 C 100 186 94 246 94 320 C 100 270 106 220 124 168 Z" fill="#0b2420" opacity=".55"/>' +
      (t >= 3 ? '<path d="M98 360 q 10 -8 20 0 q -10 8 -20 0 Z M126 376 q 10 -8 20 0 q -10 8 -20 0 Z M156 384 q 10 -8 20 0 q -10 8 -20 0 Z" fill="#e8b84a" opacity=".75"/>' : ''));
  } else if(it === 'cape_scene'){
    s += A('pj-cape', '<path d="M112 144 C 84 200 70 300 74 404 C 120 396 180 406 226 416 C 250 340 244 260 214 200 C 204 170 196 152 188 144 Z" fill="#9a1830"' + c(2.4) + '/>' +
      '<path d="M188 144 C 196 152 204 170 214 200 C 244 260 250 340 226 416 L 218 414 C 240 340 236 264 208 204 C 200 176 192 156 184 146 Z" fill="' + u('or') + '"/>' +
      '<path d="M80 396 q 8 -8 16 0 q 8 -8 16 0 q 8 -8 16 0 q 8 -8 16 0 q 8 -8 16 0 q 8 -8 16 0 q 8 -8 16 0 q 8 -8 16 0" stroke="' + u('or') + '" stroke-width="2.4" fill="none"/>' +
      '<g fill="#ffd27a" opacity=".7"><path d="' + etoile4(96, 300, 4) + '"/><path d="' + etoile4(120, 360, 3.4) + '"/><path d="' + etoile4(206, 330, 3.8) + '"/></g>');
  } else if(h.role === 'sage' && t === 4){
    s += A('pj-cape', '<path d="M112 144 C 88 210 80 310 84 410 C 130 404 176 410 220 414 C 228 320 220 230 190 144 Z" fill="#1a2a6a"' + c(2.4) + '/>' +
      '<g fill="#fff6c8" class="pj-scintille"><path d="' + etoile4(98, 330, 4) + '"/><path d="' + etoile4(110, 250, 3) + '"/><path d="' + etoile4(204, 360, 3.6) + '"/><path d="' + etoile4(198, 280, 2.6) + '"/><circle cx="104" cy="380" r="1.6"/><circle cx="210" cy="320" r="1.4"/></g>');
  } else if(h.role === 'barde' && t >= 3){
    s += A('pj-cape', '<path d="M178 142 C 204 160 216 220 214 300 C 200 304 190 300 184 296 C 186 240 184 190 168 150 Z" fill="' + u('acc') + '"' + c(2.2) + '/><path d="M206 180 C 214 220 216 260 214 300 L 208 298 C 210 260 206 220 198 186 Z" fill="' + u('or') + '"/>');
  } else if(h.role === 'alchimiste' && t === 4){
    s += '<path d="M118 150 C 96 210 92 300 96 360 C 120 370 180 370 204 360 C 208 300 204 210 182 150 Z" fill="' + u('lueur') + '" opacity=".35" class="pj-pulse"/>';
  }
  return s;
}

/* Carquois du pisteur (dans le dos, épaule droite) */
function carquois(K, h, t, eq, tal){
  var u = K.u, s = '<g transform="rotate(30 198 150)">';   /* bien penché : il dépasse derrière l'épaule, loin de la tête (facile à toucher dans la cabane) */
  var mag = eq.carquois === 'carquois' || t === 4;
  var glow = tal.tir || eq.carquois === 'carquois';
  if(mag){
    s += '<path d="M190 112 L 192 96 M198 112 L 200 92 M206 112 L 208 98" stroke="#efe6cc" stroke-width="2.4"/>';
    if(glow) s += A('pj-pulse', '<circle cx="200" cy="90" r="16" fill="' + u('cyan') + '"/>');
    s += '<path d="M188 98 l4 -14 l4 14 Z M196 94 l4 -16 l4 16 Z M204 100 l4 -14 l4 14 Z" fill="' + (glow ? '#c8faff' : '#b8bcc8') + '"' + c(1.4) + '/>';
    s += '<path d="M186 108 L 212 108 L 216 190 Q 200 198 184 190 Z" fill="' + u('cuir') + '"' + c(2.2) + '/>';
    s += '<path d="M185 116 L 213 116 L 213 122 L 185 122 Z M184 178 L 215 178 L 215 184 L 184 184 Z" fill="' + u('or') + '"' + c(1.4) + '/>';
    s += '<path d="M200 138 q 7 10 0 22 q -7 -12 0 -22 Z" fill="' + u('or') + '"' + c(1.2) + '/>';
  } else {
    s += '<path d="M192 112 L 194 98 M200 112 L 202 96 M207 112 L 209 100" stroke="#d9cbb0" stroke-width="2.2"/>';
    s += '<path d="M190 100 l4 -6 l4 6 Z M198 98 l4 -6 l4 6 Z M205 102 l4 -6 l4 6 Z" fill="' + (glow ? '#c8faff' : '#8a8f9a') + '"' + c(1.2) + '/>';
    if(glow) s += A('pj-pulse', '<circle cx="200" cy="98" r="11" fill="' + u('cyan') + '"/>');
    s += '<path d="M188 108 L 212 108 L 214 178 Q 200 184 186 178 Z" fill="' + u('cuir') + '"' + c(2.2) + '/>';
    s += '<path d="M188 120 L 212 120" stroke="#3b2211" stroke-width="2"/>';
  }
  return s + '</g>';
}

/* Sacoche de l'alchimiste */
function sacoche(K, h, t, eq){
  var u = K.u, herbo = eq.sac === 'sac_herbo';
  var s = '<path d="M128 142 L 134 138 L 188 230 L 182 234 Z" fill="' + u('cuir') + '"' + c(1.6) + '/>';
  s += '<path d="M176 222 L 206 218 L 210 250 Q 194 258 178 252 Z" fill="' + (herbo ? '#5f8a4a' : u('cuir')) + '"' + c(2) + '/>';
  s += '<path d="M175 222 L 207 218 L 206 232 Q 190 238 176 236 Z" fill="' + (herbo ? '#4a7038' : '#8a5a30') + '"' + c(1.6) + '/><circle cx="191" cy="233" r="2.6" fill="' + u('or') + '"/>';
  if(herbo) s += '<path d="M182 220 q -6 -14 4 -18 q 2 10 -4 18 Z M194 218 q 2 -16 12 -14 q -4 10 -12 14 Z M188 218 q -2 -10 2 -14" fill="#8ed67a"' + c(1.2) + '/>';
  return s;
}

/* Bandoulière de fioles */
function bandouliere(K, h, eq, tal){
  if(eq.bandouliere !== 'fioles_ether' && !tal.potionniste) return '';
  var u = K.u, ether = eq.bandouliere === 'fioles_ether';
  var s = '<path d="M176 140 L 182 144 L 128 228 L 122 224 Z" fill="' + u('cuir') + '"' + c(1.6) + '/>';
  [[170, 156], [160, 172], [150, 188], [140, 204]].forEach(function(p, i){
    var col = ether ? '#bff8ff' : ['#7fd08a','#ff8fb3','#ffd27a','#8ff3ff'][i];
    s += '<g transform="translate(' + p[0] + ' ' + p[1] + ') rotate(32)">';
    if(ether) s += '<circle cx="0" cy="6" r="7" fill="' + u('cyan') + '" class="pj-pulse"/>';
    s += '<path d="M-2 -2 h4 v3 q 3 1 3 6 v3 h-10 v-3 q 0 -5 3 -6 Z" fill="' + u('verre') + '"' + c(1) + '/><path d="M-4.5 6 h9 v4 h-9 Z" fill="' + col + '"/></g>';
  });
  return s;
}

/* Objets au sol (décor de l'alchimiste) */
function objetSol(K, it){
  var u = K.u;
  if(it === 'alambic') return '<g transform="translate(250 360) scale(1.3)"><path d="M-14 50 Q -20 30 0 22 Q 20 30 14 50 Z" fill="' + u('verre') + '"' + c(1.8) + '/><path d="M-12 44 Q 0 50 12 44 Q 12 50 0 52 Q -12 50 -12 44 Z" fill="#b48cff"/><path d="M0 22 L 0 6 C 0 -4 14 -6 22 4 L 30 20" stroke="' + O + '" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M0 22 L 0 6 C 0 -4 14 -6 22 4 L 30 20" stroke="#d8f4ff" stroke-width="2.6" fill="none" stroke-linecap="round"/><circle cx="30" cy="26" r="3" fill="#b48cff" class="pj-pulse"/></g>';
  if(it === 'chaudron_cuivre') return '<g transform="translate(252 380) scale(1.3)"><ellipse cx="0" cy="0" rx="24" ry="7" fill="#7fd08a" class="pj-pulse"/><path d="M-26 0 Q -28 30 0 34 Q 28 30 26 0 Z" fill="#c87a3a"' + c(2) + '/><path d="M-26 0 Q 0 8 26 0" stroke="' + O + '" stroke-width="2" fill="none"/><path d="M8 4 Q 18 20 14 30" stroke="#ffd2a0" stroke-width="2" fill="none" opacity=".6"/>' + A('pj-monte', '<circle cx="-6" cy="-4" r="3" fill="#bff0c0"/>') + A('pj-monte', '<circle cx="6" cy="-4" r="2.4" fill="#bff0c0"/>', ' style="animation-delay:-1s"') + '</g>';
  if(it === 'serre') return '<g transform="translate(254 382) scale(1.3)"><path d="M-12 8 L 12 8 L 9 30 L -9 30 Z" fill="#c8743a"' + c(1.8) + '/><path d="M0 8 C -2 -10 -14 -16 -18 -24 C -6 -24 2 -14 0 8 Z M0 8 C 4 -14 16 -18 20 -28 C 8 -28 -2 -14 0 8 Z" fill="#6fd08a"' + c(1.6) + '/><circle cx="0" cy="-20" r="10" fill="' + u('lueur') + '" class="pj-pulse"/><path d="' + etoile4(0, -20, 6) + '" fill="#fff6c8"/></g>';
  if(it === 'athanor') return '<g transform="translate(252 360) scale(1.3)"><path d="M-18 54 L -14 6 Q 0 -6 14 6 L 18 54 Z" fill="#8a5a3a"' + c(2) + '/><path d="M-8 30 Q 0 20 8 30 L 8 44 L -8 44 Z" fill="#ffb04a"' + c(1.4) + '/><circle cx="0" cy="34" r="14" fill="' + u('feu') + '" class="pj-pulse"/><path d="M-14 6 Q 0 -6 14 6" stroke="' + u('or') + '" stroke-width="3" fill="none"/><path d="M0 -2 L 0 -16" stroke="#8a5a3a" stroke-width="6"/>' + A('pj-monte', '<circle cx="0" cy="-18" r="3" fill="#ffd27a"/>') + '</g>';
  return '';
}

/* Objets flottants */
function flottants(K, liste){
  var u = K.u, s = '';
  var pos = [[238, 150], [62, 120]];
  (liste || []).forEach(function(it, i){
    var p = pos[i];
    var g = '';
    if(it === 'pierre_transmu') g = '<circle cx="0" cy="0" r="18" fill="' + u('lueur') + '" class="pj-pulse"/><path d="M-8 -4 L 0 -12 L 9 -5 L 7 7 L -5 9 Z" fill="#ff6fa8"' + c(1.6) + '/><path d="M-8 -4 L 0 -2 L 9 -5 M0 -2 L -5 9" stroke="' + O + '" stroke-width="1" opacity=".5"/>';
    else{
      var col = it === 'registre' ? '#7a1e3a' : it === 'grimoire_sage' ? '#1e3a7a' : '#4a1e6a';
      g = '<circle cx="0" cy="0" r="24" fill="' + u('lueur') + '" class="pj-pulse"/><path d="M-18 -12 Q -9 -16 0 -12 Q 9 -16 18 -12 L 18 10 Q 9 6 0 10 Q -9 6 -18 10 Z" fill="#f3e7cb"' + c(1.8) + '/><path d="M0 -12 L 0 10" stroke="' + O + '" stroke-width="1.4"/><path d="M-14 -6 h10 M-14 -2 h10 M-14 2 h8 M4 -6 h10 M4 -2 h10 M4 2 h8" stroke="#8a7a5a" stroke-width="1.1"/>' +
        '<path d="M-20 10 Q -10 6 0 12 Q 10 6 20 10 L 20 14 Q 10 10 0 16 Q -10 10 -20 14 Z" fill="' + col + '"' + c(1.4) + '/>' +
        '<g fill="#fff6c8" class="pj-scintille"><path d="' + etoile4(-10, -22, 3) + '"/><path d="' + etoile4(14, -20, 2.4) + '"/></g>';
    }
    s += '<g transform="translate(' + p[0] + ' ' + p[1] + ')">' + A('pj-flotte', g, ' style="animation-delay:-' + (i * 1.3) + 's"') + '</g>';
  });
  return s;
}

/* ---------- Animaux de compagnie ---------- */
function animal(K, type, collier){
  var u = K.u, s = '';
  if(type === 'faucon'){
    s += '<g transform="translate(114 120)">' + A('pj-respire',
      '<path d="M-2 18 L -10 34 L 2 30 L 8 36 L 8 20 Z" fill="#6a4a30"' + c(1.6) + '/>' +
      '<path d="M0 0 C -12 2 -14 18 -6 24 C 2 28 12 22 12 10 C 12 2 6 -2 0 0 Z" fill="#a87a4a"' + c(2) + '/>' +
      '<path d="M-2 10 C -6 14 -4 20 2 22 C 6 18 6 12 4 8 Z" fill="#f4e6c8"/><path d="M-2 14 l2 -1 M0 18 l2 -1" stroke="#8a6a40" stroke-width="1"/>' +
      A('pj-aile', '<path d="M6 4 C 18 0 26 8 24 20 C 18 18 12 16 8 14 Z" fill="#7a5434"' + c(1.8) + '/>', ' style="transform-origin:6px 6px"') +
      '<circle cx="0" cy="-6" r="7.5" fill="#a87a4a"' + c(1.8) + '/><path d="M-6 -6 L -12 -3 L -6 -2 Z" fill="#f0c040"' + c(1.2) + '/><circle cx="-2" cy="-7" r="2" fill="#1a1006"/><circle cx="-2.6" cy="-7.6" r=".8" fill="#fff"/>' +
      '<path d="M-6 26 l-1 4 M2 28 l0 4" stroke="#f0c040" stroke-width="2" stroke-linecap="round"/>' +
      (collier ? '<path d="M-6 0 q 6 4 12 0" stroke="' + u('or') + '" stroke-width="2.4" fill="none"/>' : '')) + '</g>';
  } else {
    var loup = type === 'loup';
    var c1 = loup ? '#9aa0b8' : '#e8813a', c2 = loup ? '#5c6278' : '#b8501e', cv = loup ? '#e8ecf4' : '#fff4e6';
    var k = loup ? 1.15 : 1;
    s += '<g transform="translate(244 414) scale(' + k + ')">' +
      A('pj-queue', '<path d="M14 -12 C 34 -16 40 -36 30 -50 C 28 -36 22 -28 10 -24 Z" fill="' + c1 + '"' + c(1.8) + '/><path d="M30 -50 C 36 -42 34 -34 28 -30 C 30 -38 30 -44 30 -50 Z" fill="' + cv + '"/>', ' style="transform-origin:12px -18px"') +
      '<path d="M-14 0 C -18 -20 -10 -40 4 -42 C 18 -40 22 -20 18 0 Z" fill="' + c1 + '"' + c(2) + '/>' +
      '<path d="M-6 -2 C -8 -16 -4 -30 4 -32 C 10 -30 12 -16 10 -2 Z" fill="' + cv + '"/>' +
      '<path d="M-12 0 L -12 -10 M14 0 L 14 -10" stroke="' + c2 + '" stroke-width="5" stroke-linecap="round"/>' +
      '<g transform="translate(2 -50)">' + A('pj-tete-anim',
        '<path d="M-14 -6 L -16 -24 L -4 -14 Z M14 -6 L 16 -24 L 4 -14 Z" fill="' + c1 + '"' + c(1.8) + '/><path d="M-13 -9 L -14 -19 L -7 -13 Z M13 -9 L 14 -19 L 7 -13 Z" fill="#2a1a20"/>' +
        '<path d="M-14 -6 C -16 6 -8 14 0 16 C 8 14 16 6 14 -6 C 8 -14 -8 -14 -14 -6 Z" fill="' + c1 + '"' + c(2) + '/>' +
        '<path d="M-8 4 C -6 12 6 12 8 4 C 4 8 -4 8 -8 4 Z" fill="' + cv + '"/><ellipse cx="0" cy="8" rx="3" ry="2.2" fill="#1a1006"/>' +
        '<ellipse cx="-6" cy="-2" rx="2.4" ry="3" fill="#1a1006"/><ellipse cx="6" cy="-2" rx="2.4" ry="3" fill="#1a1006"/><circle cx="-5.3" cy="-3" r=".9" fill="#fff"/><circle cx="6.7" cy="-3" r=".9" fill="#fff"/>' +
        (collier ? '<path d="M-10 13 Q 0 20 10 13" stroke="' + u('or') + '" stroke-width="3" fill="none"/><circle cx="0" cy="18" r="2.4" fill="' + u('or') + '"' + c(1) + '/>' : ''), ' style="transform-origin:0 6px"') + '</g>' +
      '</g>';
  }
  return s;
}

/* ---------- Talents visibles ---------- */
function talentsArriere(K, h, tal){
  var u = K.u, s = '';
  if(tal.pistage) s += '<g fill="' + K.role.lueur + '" opacity=".75" class="pj-scintille">' + [[60, 420], [46, 432], [252, 424], [270, 434]].map(function(p, i){ return '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="5" ry="3" transform="rotate(' + (i % 2 ? 20 : -20) + ' ' + p[0] + ' ' + p[1] + ')"/>'; }).join('') + '</g>';
  if(tal.scene) s += A('pj-onde', '<ellipse cx="150" cy="414" rx="70" ry="10" fill="none" stroke="' + K.role.lueur + '" stroke-width="2"/>') + A('pj-onde', '<ellipse cx="150" cy="414" rx="70" ry="10" fill="none" stroke="' + K.role.lueur + '" stroke-width="2"/>', ' style="animation-delay:-1.3s"');
  if(tal.ombre) s += '<g opacity=".5">' + A('pj-derive', '<ellipse cx="150" cy="412" rx="80" ry="12" fill="#0b0614"/>') + '</g>';
  if(tal.protection) s += A('pj-tourne', '<circle cx="150" cy="250" r="128" fill="none" stroke="' + K.role.lueur + '" stroke-width="2" stroke-dasharray="3 10" opacity=".5"/>');
  if(tal.passe) s += A('pj-tourne', '<path d="M150 120 A 110 110 0 1 1 149 120" fill="none" stroke="#c8b8ff" stroke-width="3" stroke-dasharray="20 14" opacity=".35"/>');
  if(tal.cartographe) s += '<g transform="rotate(-24 206 120)"><rect x="196" y="84" width="10" height="64" rx="5" fill="#f3e7cb"' + c(1.6) + '/><rect x="208" y="90" width="10" height="56" rx="5" fill="#e8d7ae"' + c(1.6) + '/><path d="M196 96 h10 M208 102 h10" stroke="#c0392b" stroke-width="2"/></g>';
  return s;
}

function talentsAvant(K, h, tal){
  var u = K.u, s = '', g = K.role.lueur;
  if(tal.reflexes) s += '<g stroke="#ffe66a" stroke-width="2" fill="none" stroke-linecap="round" class="pj-scintille"><path d="M78 248 l6 -6 l-2 6 l6 -6"/><path d="M216 252 l6 -6 l-2 6 l6 -6"/></g>';
  if(tal.course) s += '<g stroke="#bff8ff" stroke-width="2" fill="none" stroke-linecap="round">' + A('pj-vent', '<path d="M96 392 q 10 -6 22 -2"/>') + A('pj-vent', '<path d="M184 386 q 10 -6 22 -2"/>', ' style="animation-delay:-.5s"') + A('pj-vent', '<path d="M100 372 q 8 -5 18 -2"/>', ' style="animation-delay:-1s"') + '</g>';
  if(tal.camouflage) s += '<g fill="#1f5a34" opacity=".55"><path d="M120 300 q 6 -10 12 0 q -6 6 -12 0 Z M170 330 q 6 -10 12 0 q -6 6 -12 0 Z M130 180 q 6 -10 12 0 q -6 6 -12 0 Z M164 250 q 6 -10 12 0 q -6 6 -12 0 Z"/></g>';
  if(tal.instinct) s += A('pj-onde2', '<circle cx="150" cy="92" r="40" fill="none" stroke="' + g + '" stroke-width="2"/>');
  if(tal.traque) s += '<g fill="' + g + '" class="pj-pulse"><circle cx="203" cy="254" r="2"/><circle cx="199" cy="250" r="1.4"/><circle cx="203" cy="248" r="1.4"/><circle cx="207" cy="250" r="1.4"/></g>';
  if(tal.savante) s += '';
  if(tal.herboriste) s += '';
  if(tal.mainsure) s += '<g fill="#fff6c8" class="pj-scintille"><path d="' + etoile4(86, 256, 3.4) + '"/><path d="' + etoile4(216, 262, 3) + '"/></g>';
  if(tal.poudres) s += '<g transform="translate(116 228)"><path d="M-6 0 Q -10 10 -4 14 Q 2 16 6 12 Q 8 4 4 0 Z" fill="#e05a8a"' + c(1.3) + '/></g><g transform="translate(130 232)"><path d="M-6 0 Q -10 10 -4 14 Q 2 16 6 12 Q 8 4 4 0 Z" fill="#5ab8e0"' + c(1.3) + '/></g>' + A('pj-monte', '<circle cx="118" cy="226" r="2.4" fill="#ff9ac0"/>');
  if(tal.empreintes) s += '<g transform="translate(222 250)" class="pj-pulse"><circle r="9" fill="' + u('lueur') + '"/><path d="M-4 -3 q 4 -4 8 0 M-5 0 q 5 -5 10 0 M-5 3 q 5 -5 10 0 M-3 6 q 3 -3 6 0" stroke="#5a3a8a" stroke-width="1.2" fill="none"/></g>';
  if(tal.transmutation) s += '<g transform="translate(150 250)">' + A('pj-tourne', '<circle cx="82" cy="0" r="4.5" fill="#ff6fa8"' + c(1) + '/><circle cx="-82" cy="0" r="4" fill="#7fd08a"' + c(1) + '/><circle cx="0" cy="82" r="3.6" fill="#ffd27a"' + c(1) + '/>') + '</g>';
  if(tal.antidote) s += '<g transform="translate(150 178)"><path d="M-4 -6 h8 v4 h4 v8 h-4 v4 h-8 v-4 h-4 v-8 h4 Z" fill="#7fd08a"' + c(1.2) + '/></g>';
  if(tal.ultime) s += '<g transform="translate(232 214)">' + A('pj-flotte', '<circle r="14" fill="' + u('lueur') + '" class="pj-pulse"/><path d="M-10 0 Q 0 -9 10 0 Q 0 9 -10 0 Z" fill="#fff"' + c(1.4) + '/><circle r="3.6" fill="#7a3fd0"/>') + '</g>';
  if(tal.conteur) s += '<g transform="translate(236 184)">' + A('pj-flotte', '<path d="M-6 10 C -2 0 6 -10 14 -14 C 10 -4 4 6 -4 12 Z" fill="#fff6c8"' + c(1.3) + '/><path d="M-6 10 l-3 4" stroke="' + u('or') + '" stroke-width="2"/>') + '</g>';
  if(tal.apaisante || tal.ballade){
    var coul = tal.ballade ? '#ffd27a' : '#9fd8ff';
    s += '<g style="color:' + coul + '">' + A('pj-note', note(234, 160)) + A('pj-note', note(64, 190, .8), ' style="animation-delay:-1.4s"') + A('pj-note', note(244, 220, .7), ' style="animation-delay:-2.2s"') + '</g>';
  }
  if(tal.ragots) s += '<g transform="translate(236 132)">' + A('pj-flotte', '<path d="M-12 -8 h24 q 4 0 4 4 v8 q 0 4 -4 4 h-14 l-6 6 l1 -6 h-5 q -4 0 -4 -4 v-8 q 0 -4 4 -4 Z" fill="#fff"' + c(1.4) + '/><circle cx="-6" cy="0" r="1.6" fill="' + O + '"/><circle cx="0" cy="0" r="1.6" fill="' + O + '"/><circle cx="6" cy="0" r="1.6" fill="' + O + '"/>') + '</g>';
  if(tal.imitation) s += '<g transform="translate(118 232)"><path d="M-8 -6 Q 0 -10 8 -6 Q 8 6 0 8 Q -8 6 -8 -6 Z" fill="#f3e7cb"' + c(1.3) + '/><circle cx="-3" cy="-2" r="1.4" fill="' + O + '"/><circle cx="3" cy="-2" r="1.4" fill="' + O + '"/><path d="M-3 3 q 3 2 6 0" stroke="' + O + '" stroke-width="1.2" fill="none"/></g>';
  if(tal.memoire) s += '<g transform="translate(62 150)">' + A('pj-flotte', '<rect x="-10" y="-14" width="20" height="28" rx="3" fill="#f3e7cb"' + c(1.4) + '/><path d="M-6 -8 h12 M-6 -3 h12 M-6 2 h9 M-6 7 h12" stroke="' + g + '" stroke-width="1.6"/>') + '</g>';
  if(tal.reseau) s += A('pj-vole', '<path d="M234 120 l14 -6 l-6 10 Z M240 116 l2 8" fill="#fff"' + c(1.2) + '/>') + A('pj-vole', '<path d="M60 150 l12 -5 l-5 9 Z" fill="#fff"' + c(1.2) + '/>', ' style="animation-delay:-2s"');
  if(tal.ami) s += '<g transform="translate(238 236)" class="pj-pulse"><path d="M0 4 C -8 -2 -6 -10 0 -6 C 6 -10 8 -2 0 4 Z" fill="#ff7aa8"' + c(1.2) + '/></g>';
  if(tal.stratege) s += '<g transform="translate(64 222)">' + A('pj-flotte', '<path d="M-6 12 h14 l-2 -6 C 10 0 8 -8 2 -10 C -4 -10 -6 -4 -2 -2 L -6 0 C -6 4 -4 6 -2 6 Z" fill="#f3e7cb"' + c(1.4) + '/>') + '</g>';
  if(tal.dechiffreur) s += '<g fill="' + g + '" font-family="serif" font-size="12" class="pj-scintille"><text x="56" y="130">ᚱ</text><text x="236" y="118">ᛟ</text><text x="244" y="196">ᚦ</text></g>';
  if(tal.inspiration) s += '<g transform="translate(150 22)">' + A('pj-flotte', '<circle r="12" fill="' + u('feu') + '"/><path d="' + etoile4(0, 0, 7) + '" fill="#fffbe6"/>') + '</g>';
  if(tal.tableau) s += '<g transform="translate(236 260)"><rect x="-10" y="-10" width="20" height="20" rx="2" fill="#1e3a7a"' + c(1.4) + '/><path d="M-10 -3 h20 M-10 3 h20 M-3 -10 v20 M3 -10 v20" stroke="' + g + '" stroke-width="1.2"/></g>';
  if(tal.etoiles) s += '<g stroke="' + g + '" stroke-width="1" fill="#fff6c8" opacity=".85"><path d="M60 60 L 76 50 L 92 62 L 84 80" fill="none"/><circle cx="60" cy="60" r="2"/><circle cx="76" cy="50" r="2.4"/><circle cx="92" cy="62" r="1.8"/><circle cx="84" cy="80" r="2"/><path d="M210 40 L 228 56 L 246 46" fill="none"/><circle cx="210" cy="40" r="2"/><circle cx="228" cy="56" r="2.4"/><circle cx="246" cy="46" r="1.8"/></g>';
  if(tal.verification) s += '<g transform="translate(150 92)">' + A('pj-tourne', '<circle r="58" fill="none" stroke="' + g + '" stroke-width="1.4" stroke-dasharray="2 6" opacity=".7"/><g fill="' + g + '" font-family="serif" font-size="11"><text x="-4" y="-60">ᚠ</text><text x="56" y="4">ᛉ</text><text x="-4" y="66">ᛞ</text><text x="-64" y="4">ᛜ</text></g>') + '</g>';
  if(tal.conseil) s += '<g transform="translate(64 108)" class="pj-pulse"><circle r="11" fill="' + u('lueur') + '"/><circle cx="-4" cy="2" r="2" fill="#fff"/><circle cx="4" cy="2" r="2" fill="#fff"/><circle cx="0" cy="-4" r="2" fill="#fff"/></g>';
  if(tal.archiviste) s += '<g transform="translate(62 104)">' + A('pj-flotte', '<path d="M-14 -8 Q -7 -11 0 -8 Q 7 -11 14 -8 L 14 8 Q 7 5 0 8 Q -7 5 -14 8 Z" fill="#f3e7cb"' + c(1.4) + '/><path d="M0 -8 v16" stroke="' + O + '" stroke-width="1.2"/><path d="M-10 -3 h7 M-10 1 h7 M3 -3 h7 M3 1 h7" stroke="#8a7a5a" stroke-width="1"/>', ' style="animation-delay:-.8s"') + '</g>';
  return s;
}

/* ---------- Décor de fond ---------- */
function decor(K, h, t){
  var u = K.u, s = '';
  s += '<rect x="-200" y="-200" width="700" height="840" fill="' + u('ciel') + '"/>';
  s += '<g fill="#fff">' + [[24,30,1.2],[70,58,1],[118,22,1.3],[40,140,1],[270,190,1.1],[16,230,1.2],[200,30,1],[-40,60,1.1],[-110,150,1],[-160,40,1.2],[-70,210,1],[330,50,1.1],[400,130,1.2],[460,30,1],[350,200,1]].map(function(p){ return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + p[2] + '" opacity=".8"/>'; }).join('') +
    '<circle class="pj-scintille" cx="96" cy="96" r="1.6"/><circle class="pj-scintille" style="animation-delay:-1s" cx="276" cy="140" r="1.5"/><circle class="pj-scintille" style="animation-delay:-.5s" cx="150" cy="14" r="1.4"/></g>';
  s += '<circle cx="232" cy="96" r="78" fill="' + u('halo') + '"/><circle cx="232" cy="96" r="38" fill="' + u('lune') + '"/><circle cx="220" cy="88" r="6" fill="#f3dcb0" opacity=".6"/><circle cx="244" cy="108" r="4" fill="#f3dcb0" opacity=".5"/>';
  /* le paysage continue de chaque côté (et en bas) : quand l'image est plus large que le héros (écrans fixes du village et de la fin,
     Romain, 5 novembre, 21 h 46), on voit plus de montagnes, jamais un bord coupé */
  s += '<path d="M-200 262 L -164 236 L -132 274 L -96 232 L -62 270 L -30 238 L 0 300 L 30 248 L 56 282 L 92 226 L 128 276 L 160 240 L 196 284 L 232 236 L 268 280 L 300 252 L 334 286 L 366 240 L 402 278 L 436 234 L 470 272 L 500 250 V 640 H -200 Z" fill="' + u('mont') + '"/>';
  s += '<path d="M0 352 ' + [0,20,40,60,80,100,200,220,240,260,280,300].map(function(x, i){ var hh = 30 + (i * 13 % 26); return 'L ' + x + ' ' + (352 - hh) + ' L ' + (x + 10) + ' ' + (360 - hh * .2); }).join(' ') + ' V 640 H 0 Z" fill="#1a1846"/>';
  s += '<path d="M-200 352 ' + [-200,-180,-160,-140,-120,-100,-80,-60,-40,-20].map(function(x, i){ var hh = 30 + (i * 11 % 26); return 'L ' + x + ' ' + (352 - hh) + ' L ' + (x + 10) + ' ' + (360 - hh * .2); }).join(' ') + ' L 0 352 V 640 H -200 Z" fill="#1a1846"/>';
  s += '<path d="M300 352 ' + [310,330,350,370,390,410,430,450,470,490].map(function(x, i){ var hh = 30 + (i * 17 % 26); return 'L ' + x + ' ' + (352 - hh) + ' L ' + (x + 10) + ' ' + (360 - hh * .2); }).join(' ') + ' L 500 352 V 640 H 300 Z" fill="#1a1846"/>';
  s += A('pj-derive', '<ellipse cx="150" cy="352" rx="360" ry="16" fill="#cfc9ff" opacity=".12"/>');
  s += '<path d="M-200 390 Q -100 376 0 398 Q 80 382 150 390 Q 230 398 300 382 Q 400 368 500 390 V 640 H -200 Z" fill="' + u('sol') + '"/>';
  s += '<path d="M20 398 l3 -10 l3 9 M44 394 l3 -9 l3 8 M252 392 l3 -11 l3 10 M276 388 l3 -9 l3 8 M-60 392 l3 -10 l3 9 M-130 386 l3 -9 l3 8 M350 384 l3 -10 l3 9 M420 378 l3 -9 l3 8" stroke="#3f7f78" stroke-width="2" fill="none" stroke-linecap="round"/>';
  return s;
}

/* ==========================================================
   Héros complet
   ========================================================== */
function complet(h){
  h = h || {};
  var role = ROLES[h.role] ? h.role : 'pisteur';
  var sexe = h.sexe === 'm' ? 'm' : 'f';
  var d = defaut(role, sexe);
  var r = {};
  Object.keys(d).forEach(function(k){ r[k] = h[k] != null ? h[k] : d[k]; });
  r.role = role; r.sexe = sexe;
  r.talents = h.talents || []; r.equip = h.equip || [];
  r.niveau = Math.max(1, Math.min(10, +h.niveau || 1));
  r.potion = h.potion || null;
  r.garde = h.garde || null;   /* garde-robe du Pisteur : {emplacement:{id, c}} (garderobe.js), purement décoratif */
  if(!COIFF[r.coiffure]) r.coiffure = d.coiffure;
  return r;
}

function defaut(role, sexe){
  var D = {
    pisteur:   {f:{coiffure:'queue', cheveux:'roux', yeux:'vert', peau:'p1'}, m:{coiffure:'epis', cheveux:'brun', yeux:'vert', peau:'p1'}},
    alchimiste:{f:{coiffure:'chignon', cheveux:'noir', yeux:'violet', peau:'p3'}, m:{coiffure:'boucles', cheveux:'noir', yeux:'ambre', peau:'p4'}},
    barde:     {f:{coiffure:'longs', cheveux:'chatain', yeux:'noisette', peau:'p2'}, m:{coiffure:'meche', cheveux:'blond', yeux:'bleu', peau:'p2'}},
    sage:      {f:{coiffure:'tresses', cheveux:'noir', yeux:'ambre', peau:'p5'}, m:{coiffure:'milong', cheveux:'chatain', yeux:'gris', peau:'p3'}}
  };
  role = ROLES[role] ? role : 'pisteur'; sexe = sexe === 'm' ? 'm' : 'f';
  var b = D[role][sexe];
  return {role:role, sexe:sexe, age:'adulte', peau:b.peau, coiffure:b.coiffure, cheveux:b.cheveux, yeux:b.yeux, tenue:ROLES[role].tenue, barbe:'aucune', animal:'renard', niveau:1, talents:[], equip:[], potion:null};
}

var COUL_POTION = {vision:'#7dffb0', lumiere:'#fff3a0', rapidite:'#9fe8ff', invisibilite:'#d0d0ff', verite:'#ffd27a', force:'#ff9a7a', clarte:'#a8e2ff', memoire:'#dcc0ff', calme:'#9fd8ff'};

function heros(h, opts){
  h = complet(h); opts = opts || {};
  var id = opts.id || ('pj' + (++compteur));
  var K = contexte(id, h);
  var vue = opts.vue || 'pied';
  var anime = opts.anime !== false;
  var fond = opts.fond !== false;
  var t = K.t, eq = resoudre(h.equip), tal = {};
  h.talents.forEach(function(x){ tal[x] = true; });

  /* géométrie selon l'âge */
  var age = h.age === 'enfant' ? 'enfant' : h.age === 'age' ? 'age' : 'adulte';
  var k = age === 'enfant' ? .8 : age === 'age' ? .96 : 1;
  var corpsT = k === 1 ? '' : 'translate(150 414) scale(' + k + ') translate(-150 -414)';
  var hy = 414 - (414 - 112) * k - 20 + (age === 'age' ? 4 : 0);
  var hs = age === 'enfant' ? 1.06 : age === 'age' ? .97 : 1;
  /* garde-robe (garderobe.js) : ce que le Pisteur a choisi de porter, et la pose « aux aguets » de sa cabane (accroupi, le haut du corps plus bas) */
  var guet = opts.pose === 'guet' && h.role === 'pisteur' && !!GARDE;
  var DY = guet ? 30 : 0;
  if(guet) hy += DY * k;
  var G = GARDE && (h.garde || guet) ? GARDE.prep(h.garde || {}, K, h, {guet:guet, t:t, eq:eq, tal:tal, age:age, dy:DY}) : null;
  if(G && G.vide) G = null;
  /* opts.zones (la cabane) : chaque partie du corps porte data-zone, pour savoir ce que le doigt a touché */
  /* opts.zones (la cabane) : chaque partie du corps se touche ; le carquois a une marge invisible autour du haut (derrière tout le reste) pour qu'un doigt d'enfant l'attrape */
  var zn = opts.zones ? function(z, x){ return x ? '<g data-zone="' + z + '">' + x + (z === 'carquois' ? '<rect x="170" y="66" width="60" height="92" rx="24" transform="rotate(30 198 150)" fill="#fff" fill-opacity="0"/>' : '') + '</g>' : ''; } : function(z, x){ return x; };
  var teteT = 'translate(150 ' + hy + ') scale(' + hs + ')' + (age === 'age' ? ' rotate(3)' : '') + (guet ? ' rotate(-4)' : '');

  var vb;
  if(vue === 'tete'){ var up = G ? G.haut() * .5 : 0, sz = (128 + up) * hs; vb = (150 - sz / 2) + ' ' + (hy - (80 + up) * hs) + ' ' + sz + ' ' + sz; }
  else if(vue === 'buste'){ var sb = age === 'enfant' ? 178 : 196; vb = (150 - sb / 2) + ' ' + (hy - 90 * hs) + ' ' + sb + ' ' + sb; }
  else vb = '0 0 300 440';
  if(opts.cadre && GARDE && GARDE.cadre) vb = GARDE.cadre(opts.cadre, {hy:hy, hs:hs, k:k, dy:DY}) || vb;   /* vignette de la garde-robe */

  var s = '<svg class="pj pj-heros pj-' + h.role + (anime ? ' pj-anime' : '') + (guet ? ' pj-guet' : '') + '" viewBox="' + vb + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + K.role.nom + ' niveau ' + h.niveau + '">';
  s += defsCommuns(K, h) + (G ? G.defs() : '');
  if(fond) s += decor(K, h, t);
  else if(vue !== 'pied') s += '';

  /* ombre au sol, aura */
  if(t === 4) s += '<ellipse cx="150" cy="414" rx="78" ry="12" fill="' + K.u('aura') + '" class="pj-pulse"/>';
  if(h.potion){ var cp = COUL_POTION[h.potion] || '#8ff3ff'; s += '<ellipse cx="150" cy="250" rx="110" ry="170" fill="' + cp + '" opacity=".14" class="pj-pulse"/>'; }
  s += '<ellipse cx="150" cy="414" rx="56" ry="7" fill="' + K.u('ombre') + '"/>';
  s += talentsArriere(K, h, tal);
  if(eq.sol && h.role === 'alchimiste') s += objetSol(K, eq.sol);

  var fig = '';
  /* --- arrière --- */
  var corpsArr = zn('corps', G && G.a('cape') ? G.couche('capeDos') : cape(K, h, t, eq));
  if(eq.dos === 'banniere') corpsArr += '<path d="M206 60 L 206 300" stroke="' + O + '" stroke-width="6" stroke-linecap="round"/><path d="M206 60 L 206 300" stroke="' + K.u('boisV') + '" stroke-width="3.4"/>' + A('pj-cape', '<path d="M208 66 L 252 70 L 246 92 L 254 116 L 208 112 Z" fill="' + K.u('acc') + '"' + c(2) + '/><path d="' + etoile4(228, 90, 8) + '" fill="' + K.u('or') + '"/>', ' style="transform-origin:208px 66px"') + '<circle cx="206" cy="58" r="4" fill="' + K.u('or') + '"' + c(1.2) + '/>';
  if(eq.dos === 'cartes_fond') corpsArr += '<g transform="rotate(-28 200 140)"><rect x="192" y="90" width="16" height="80" rx="6" fill="' + K.u('cuir') + '"' + c(2) + '/><rect x="190" y="84" width="20" height="10" rx="3" fill="' + K.u('or') + '"' + c(1.4) + '/><path d="M196 84 l2 -10 l6 0 l2 10" fill="#f3e7cb"' + c(1.2) + '/></g>';
  if(h.role === 'pisteur') corpsArr += zn('carquois', G && (G.a('carquois') || G.a('fleches')) ? G.couche('carquois') : carquois(K, h, t, eq, tal));
  var coif = COIFF[h.coiffure] || COIFF.queue;
  var chapeau = chapeauDe(h, eq, t);
  var cacheCh = G ? G.cacheCheveux() : null;   /* garde-robe : 'haut' (chapeau, casque), 'capuche', 'tout' (cagoule) */
  K.chap = chapeau ? chapeau.id : cacheCh ? 'garde' : null; K.age = age;
  var dosCh = cacheCh === 'capuche' || cacheCh === 'tout' ? '' : coif.dos && !(chapeau && chapeau.cache) ? coif.dos(K) : (coif.dos ? coif.dos(K) : '');
  /* aux aguets : le haut du corps descend (genoux pliés), la cape se raccourcit pour ne pas traîner par terre */
  fig += '<g transform="' + corpsT + (DY ? ' translate(0 ' + DY + ') translate(150 144) scale(1 .9) translate(-150 -144)' : '') + '">' + corpsArr + '</g>';
  fig += '<g transform="' + teteT + '">' + zn('tete', (G ? G.couche('teteDos') : '') + dosCh) + '</g>';

  /* --- corps --- */
  var corps = '';
  var bas = G && (guet || G.a('jambes') || G.a('pieds')) ? G.couche('jambes') + (G.a('pieds') && !guet ? ailesBottes(eq) : '') : jambes(K, h, t, eq);
  if(h.sexe === 'm') corps += '<path d="M139.5 112 L 139.5 142 Q 150 149 160.5 142 L 160.5 112 Z" fill="' + K.u('peau') + '"' + c(2.1) + '/><path d="M139.5 116 Q 150 129 160.5 116 L 160.5 129 Q 150 135 139.5 129 Z" fill="' + K.peau.ombre + '"/><path d="M152 118 L 152 140" stroke="' + K.peau.ombre + '" stroke-width="3" opacity=".7"/>';
  else corps += '<path d="M142 112 L 142 142 Q 150 148 158 142 L 158 112 Z" fill="' + K.u('peau') + '"' + c(2) + '/><path d="M142 116 Q 150 128 158 116 L 158 128 Q 150 134 142 128 Z" fill="' + K.peau.ombre + '"/>';
  var iz = 0, zc = function(z){ if(opts.zones && corps.length > iz) corps = corps.slice(0, iz) + '<g data-zone="' + z + '">' + corps.slice(iz) + '</g>'; iz = corps.length; };
  zc('cou');
  corps += G && G.a('corps') ? G.couche('corps') : torse(K, h, t);
  if(t === 1) corps += baudrierT1(K, h);
  if(h.role === 'alchimiste') corps += sacoche(K, h, t, eq);
  corps += ceinture(K, h, t);
  if(eq.rangee) corps += rangeeFioles(K, h);
  corps += bandouliere(K, h, eq, tal);
  corps += petitsCeinture(K, h, eq);
  if(eq.poche === 'thermometre') corps += '<path d="M112 282 L 108 260" stroke="' + O + '" stroke-width="5" stroke-linecap="round"/><path d="M112 282 L 108 260" stroke="#e6f6ff" stroke-width="3" stroke-linecap="round"/><circle cx="108" cy="259" r="3" fill="#e05a5a"' + c(1) + '/>';
  zc('corps');
  if(t <= 1 && !(G && (G.a('bouche') || G.a('cou') || G.a('corps')))) corps += foulard(K, h);
  /* un foulard de la garde-robe (dessiné avec la tête) cacherait le collier : il est alors posé après la tête, par-dessus */
  var colDessus = G && G.a('bouche') && (G.a('cou') || eq.cou) ? (G.a('cou') ? G.couche('cou') : objetCou(K, h, eq.cou)) : '';
  if(!colDessus){
    if(G && G.a('cou')) corps += G.couche('cou');
    else if(eq.cou) corps += objetCou(K, h, eq.cou);
  }
  zc('cou');
  if(eq.broche === 'oeil_faucon') corps += '<g transform="translate(130 150)"><circle r="12" fill="' + K.u('feu') + '" class="pj-pulse"/><path d="M-8 0 Q 0 -7 8 0 Q 0 7 -8 0 Z" fill="' + K.u('or') + '"' + c(1.4) + '/><circle r="3" fill="#2a6fd0"/><circle cx="-1" cy="-1" r="1" fill="#fff"/></g>';
  if(eq.epaule === 'grappin') corps += '<g transform="translate(120 150)"><ellipse cx="0" cy="0" rx="14" ry="10" fill="none" stroke="#c9a46a" stroke-width="5"/><ellipse cx="0" cy="0" rx="14" ry="10" fill="none" stroke="' + O + '" stroke-width="1" stroke-dasharray="3 2"/><path d="M10 8 L 16 18 M16 18 l-4 4 M16 18 l4 4 M16 18 l0 6" stroke="#9aa0b0" stroke-width="2.4" stroke-linecap="round"/></g>';
  zc('corps');
  corps += G && G.a('arme') ? G.couche('arme') : mainGauche(K, h, t, eq);
  corps += bras(K, h.role, t, eq) + (G ? G.couche('bras') : '');
  corps += mains(K, h.role, eq) + (G ? G.couche('mains') : '');
  zc('mains');
  if(h.role === 'pisteur' && t === 4 && !eq.cape) corps += '';
  if(h.role === 'pisteur' && t >= 3){
    corps += '<path d="M106 152 C 104 136 118 126 138 130 L 141 152 C 128 160 116 160 106 152 Z" fill="' + K.u('or') + '"' + c(2.2) + '/><path d="M112 148 C 118 140 128 138 136 140" stroke="#94620e" stroke-width="1.6" fill="none"/><circle cx="124" cy="143" r="3.4" fill="' + K.role.c + '"' + c(1) + '/>';
  }
  if((h.role === 'pisteur' && (eq.cape === 'cape_rodeur' || t === 4)) && !(G && G.a('cape'))){
    corps += '<path d="M114 148 C 118 130 134 124 150 124 C 166 124 182 130 186 148 C 176 142 164 140 150 140 C 136 140 124 142 114 148 Z" fill="' + K.u('cape') + '"' + c(2.2) + '/><circle cx="150" cy="141" r="5.5" fill="' + K.u('or') + '"' + c(1.4) + '/><circle cx="150" cy="141" r="2.2" fill="' + K.role.c + '"/>';
  }
  if(eq.cape === 'cape_scene'){
    corps += '<path d="M118 146 C 124 136 140 132 150 132 C 160 132 176 136 182 146 C 170 142 160 140 150 140 C 140 140 130 142 118 146 Z" fill="#9a1830"' + c(2) + '/><circle cx="150" cy="140" r="5" fill="' + K.u('or') + '"' + c(1.3) + '/>';
  }
  if(G) corps += G.couche('capeAvant') + G.couche('ceinture');
  zc('corps');
  corps += mainDroite(K, h, t, eq);
  zc('mains');
  fig += '<g transform="' + corpsT + '">' + zn('jambes', bas) + (DY ? '<g transform="translate(0 ' + DY + ')">' + corps + '</g>' : corps) + '</g>';

  /* --- cheveux sur le buste --- */
  if(coif.devant && cacheCh !== 'capuche' && cacheCh !== 'tout') fig += '<g transform="' + teteT + '">' + zn('tete', coif.devant(K)) + '</g>';

  /* --- tête --- */
  var tete = '';
  if(chapeau && chapeau.id === 'etoile') tete += '';
  if(cacheCh !== 'tout') tete += coif.nuque(K);
  var garcon = h.sexe === 'm';
  var face = {age:age, sexe:h.sexe, lueur:tal.vision || h.potion === 'vision', sansSourcils:true, regard:guet ? 1 : 0};
  tete += garcon ? visageM(K, face) : visage(K, face);
  var bb = garcon && age !== 'enfant' ? h.barbe : 'aucune';
  if(bb && bb !== 'aucune') tete += garcon ? barbeM(K, bb) : barbe(K, bb);
  if(G && G.a('bouche')) tete += G.couche('bouche');
  else if(eq.masque === 'masque_ombre') tete += '<path d="' + (garcon ? 'M-26 14 C -20 10 20 10 26 14 C 25.6 18 23.6 21 20.4 24 C 15.6 30.2 9 34.6 0 36.6 C -9 34.6 -15.6 30.2 -20.4 24 C -23.6 21 -25.6 18 -26 14 Z' : 'M-26 14 C -20 10 20 10 26 14 C 26 26 16 34 0 36 C -16 34 -26 26 -26 14 Z') + '" fill="#2a2440"' + c(2) + '/><path d="M-26 14 C -20 10 20 10 26 14" stroke="#8ff3ff" stroke-width="1.4" fill="none" opacity=".7"/>';
  var sourc = garcon ? sourcilsM(K, face) : sourcils(K, face);
  if(cacheCh === 'tout') tete += sourc;
  else if(coif.sousMeche) tete += sourc + coif.avant(K);
  else tete += coif.avant(K) + sourc;
  if(G) tete += G.couche('yeux');
  /* yeux : lunettes, monocle */
  if(eq.yeux === 'lunettes_sage') tete += '<g fill="#d8f4ff" fill-opacity=".25" stroke="' + K.u('or') + '" stroke-width="2"><circle cx="-12" cy="6" r="10"/><circle cx="12" cy="6" r="10"/></g><path d="M-2 5 q 2 -2 4 0 M-22 4 l-6 -2 M22 4 l6 -2" stroke="' + K.u('or') + '" stroke-width="2" fill="none"/>';
  if(eq.yeux === 'oeil_cristal' || tal.savante){
    var cr = eq.yeux === 'oeil_cristal';
    tete += (cr ? '<circle cx="12" cy="6" r="15" fill="' + K.u('lueur') + '" class="pj-pulse"/>' : '') + '<circle cx="12" cy="6" r="10" fill="' + (cr ? '#e6d4ff' : '#e6f6ff') + '" fill-opacity=".35" stroke="' + K.u('or') + '" stroke-width="2.2"/><path d="M21 10 Q 28 24 22 40" stroke="' + K.u('or') + '" stroke-width="1.2" fill="none"/>';
  }
  if(eq.front === 'lunettes_alchi') tete += '<path d="M-30 -30 Q 0 -40 30 -30" stroke="' + K.u('cuir') + '" stroke-width="5" fill="none"/><g stroke="' + O + '" stroke-width="2"><circle cx="-11" cy="-32" r="8" fill="#8a5a30"/><circle cx="11" cy="-32" r="8" fill="#8a5a30"/></g><circle cx="-11" cy="-32" r="5" fill="#9fe8ff"/><circle cx="11" cy="-32" r="5" fill="#9fe8ff"/><path d="M-14 -35 l3 -2 M8 -35 l3 -2" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>';
  if(tal.herboriste) tete += '<g><path d="M-30 -36 C -20 -50 0 -54 2 -54" stroke="#4a8a3a" stroke-width="2.4" fill="none"/>' + [[-28,-38,-30],[-20,-46,-10],[-10,-51,10],[0,-54,30]].map(function(p){ return '<path d="M' + p[0] + ' ' + p[1] + ' q -4 -8 4 -10 q 2 6 -4 10 Z" fill="#7fd08a"' + c(1) + ' transform="rotate(' + p[2] + ' ' + p[0] + ' ' + p[1] + ')"/>'; }).join('') + '<circle cx="-24" cy="-44" r="3" fill="#ff9ac0"' + c(.8) + '/></g>';
  if(tal.oreille) tete += '<g transform="translate(31 14)"><circle r="2.4" fill="' + K.u('or') + '"' + c(1) + '/><g style="color:' + K.role.c + '" transform="translate(2 12)">' + note(0, 0, .55) + '</g></g>';
  if(chapeau) tete += chapeau.svg(K);
  if(G) tete += G.couche('tete');
  if(eq.plume === 'plume_rossignol'){
    tete += chapeau ? '' : '<g transform="translate(30 -16) rotate(30)">' + A('pj-pulse', '<ellipse cx="0" cy="-14" rx="9" ry="16" fill="' + K.u('cyan') + '"/>') + '<path d="M0 6 C -6 -6 -6 -20 0 -32 C 6 -20 6 -6 0 6 Z" fill="#e8fbff"' + c(1.4) + '/><path d="M0 4 L 0 -28" stroke="#7fb8d8" stroke-width="1"/></g>';
  }
  if(eq.plume === 'plume_encre') tete += '<g transform="translate(30 -10) rotate(24)"><path d="M0 8 C -5 -4 -4 -18 2 -30 C 7 -18 6 -4 0 8 Z" fill="#fff"' + c(1.4) + '/><path d="M0 6 L 1 -26" stroke="#9aa" stroke-width="1"/><path d="M0 8 l0 6" stroke="' + O + '" stroke-width="2"/></g>';
  if(eq.halo === 'couronne') tete += '<g transform="translate(0 ' + (chapeau ? (chapeau.id === 'etoile' ? -100 : -96) : -78) + ')">' + A('pj-flotte', '<ellipse cx="0" cy="0" rx="26" ry="7" fill="none" stroke="' + K.u('or') + '" stroke-width="3"/><ellipse cx="0" cy="0" rx="26" ry="7" fill="none" stroke="#8ff3ff" stroke-width="6" opacity=".35"/><g fill="#bff8ff" font-family="serif" font-size="9"><text x="-20" y="10">ᚠ</text><text x="-4" y="12">ᛟ</text><text x="12" y="10">ᚱ</text></g>') + '</g>';
  fig += '<g transform="' + teteT + '">' + zn('tete', tete) + '</g>';
  if(colDessus) fig += '<g transform="' + corpsT + '">' + (DY ? '<g transform="translate(0 ' + DY + ')">' : '') + zn('cou', colDessus) + (DY ? '</g>' : '') + '</g>';

  /* --- flottants et talents --- */
  if(eq.flottant) fig += flottants(K, eq.flottant);
  fig += talentsAvant(K, h, tal);
  if(tal.compagnon) fig += animal(K, h.animal || 'renard', (h.equip || []).indexOf('collier') >= 0);

  /* --- magie du niveau 10 --- */
  if(t === 4){
    fig += '<g fill="#bff8ff">' + A('pj-monte', '<path d="' + etoile4(110, 404, 5.5) + '"/>') + A('pj-monte', '<path d="' + etoile4(192, 398, 4.5) + '"/>', ' style="animation-delay:-.8s"') + A('pj-monte', '<circle cx="150" cy="410" r="2.2"/>', ' style="animation-delay:-1.6s"') + A('pj-monte', '<circle cx="124" cy="412" r="1.8"/>', ' style="animation-delay:-1.2s"') + A('pj-monte', '<circle cx="176" cy="412" r="2"/>', ' style="animation-delay:-.4s"') + '</g>';
    if(!tal.compagnon && !(eq.flottant && eq.flottant.length)) fig += '<g transform="translate(240 170)">' + A('pj-flotte', '<circle r="30" fill="' + K.u('feu') + '"/><circle r="7.5" fill="#fffbe6"/><path d="M0 -12 v 24 M-12 0 h 24" stroke="#fffbe6" stroke-width="1.4" opacity=".9"/>') + '</g>';
  }
  if(h.potion === 'invisibilite') fig = '<g opacity=".45">' + fig + '</g>';

  s += anime && opts.souffle !== false ? A('pj-souffle', fig) : fig;
  return s + '</svg>';
}

function chapeauDe(h, eq, t){
  if(eq.tete === 'chapeau_etoile') return {id:'etoile', svg:CHAPEAUX.etoile};
  if(eq.tete === 'chapeau_plume') return {id:'plume', svg:function(K){ return CHAPEAUX.plume(K, eq.plume === 'plume_rossignol' ? '#c8faff' : null); }};
  if(h.role === 'barde') return {id:'beret', svg:function(K){ var s = CHAPEAUX.beret(K); if(eq.plume === 'plume_rossignol') s += '<g transform="translate(26 -54) rotate(40)">' + A('pj-pulse', '<ellipse cx="0" cy="-14" rx="9" ry="16" fill="' + K.u('cyan') + '"/>') + '<path d="M0 6 C -6 -6 -6 -20 0 -32 C 6 -20 6 -6 0 6 Z" fill="#e8fbff"' + c(1.4) + '/></g>'; return s; }};
  return null;
}

/* ==========================================================
   VILLAGEOIS (portraits bustes)
   ========================================================== */
var PNJ = {
  grosbec: {nom:'Monsieur Grosbec', metier:'le maire', fond:'#5a4a8a',
    sexe:'m', age:'adulte', peau:'p2', coiffure:'degarni', cheveux:'gris', yeux:'gris', nez:'bec', bouche:'grand', plisse:true, corps:'rond', habit:'#2f2a52', chemise:'#ffffff', favoris:true, accessoires:['echarpe_maire','gants','cravate']},
  gaspard: {nom:'Gaspard', metier:'le boulanger', fond:'#c8925a',
    sexe:'m', age:'adulte', peau:'p3', coiffure:'court', cheveux:'brun', yeux:'marron', nez:'rond', barbe:'moustache', corps:'costaud', habit:'#f4f0e6', chemise:'#f4f0e6', chapeau:'toque', farine:true, sourcils:'epais', accessoires:['tablier_blanc']},
  melusine:{nom:'Mélusine', metier:'la couturière', fond:'#4a8a7a',
    sexe:'f', age:'adulte', peau:'p1', coiffure:'chignon', cheveux:'roux', yeux:'vert', corps:'normal', habit:'#2f7a5a', chemise:'#f4e6d0', accessoires:['echarpe_rouge','metre','epingles']},
  basile:  {nom:'Basile', metier:'le jardinier', fond:'#6a9a4a',
    sexe:'m', age:'adulte', peau:'p4', coiffure:'court', cheveux:'chatain', yeux:'noisette', barbe:'courte', corps:'costaud', habit:'#3f5f9a', chemise:'#e8d8b0', chapeau:'paille', terre:true, accessoires:['salopette']},
  odette:  {nom:'Odette', metier:'la grand-mère aux sept chats', fond:'#8a6aa8',
    sexe:'f', age:'age', peau:'p1', coiffure:'chignon', cheveux:'blanc', yeux:'bleu', corps:'normal', habit:'#7a5aa0', chemise:'#f4e6d0', sourcilsC:'#c8c8d8', accessoires:['chale','echarpe_rouge','lunettes','chat']},
  tim:     {nom:'Tim', metier:'le petit ramoneur', fond:'#5a6a8a',
    sexe:'m', age:'enfant', peau:'p2', coiffure:'meche', frange:'epis', cheveux:'noir', yeux:'bleu', corps:'enfant', habit:'#4a4a5a', chemise:'#8a8aa0', chapeau:'casquette', suie:true, accessoires:['echarpe_rouge','pirate']},
  victor:  {nom:'Victor', metier:'le facteur', fond:'#4a6aa8',
    sexe:'m', age:'adulte', peau:'p3', coiffure:'court', cheveux:'brun', yeux:'marron', barbe:'courte', corps:'normal', habit:'#2f4f9a', chemise:'#e8eef8', chapeau:'facteur', accessoires:['sacoche']},
  anselme: {nom:'Anselme', metier:'le sonneur de cloches', fond:'#7a6a5a',
    sexe:'m', age:'age', peau:'p2', coiffure:'degarni', cheveux:'blanc', yeux:'gris', corps:'normal', habit:'#6a4a3a', chemise:'#e8dcc0', sourcils:'touffus', sourcilsC:'#f0f0f6', accessoires:['cles']},
  iris:    {nom:'Iris', metier:"l'herboriste", fond:'#8a7ac8',
    sexe:'f', age:'adulte', peau:'p2', coiffure:'longs', cheveux:'blond', yeux:'violet', corps:'normal', habit:'#4a8a4a', chemise:'#f4ecd8', accessoires:['fleurs','tablier_vert']},
  fortune: {nom:'Fortuné', metier:'le colporteur', fond:'#c86a3a',
    sexe:'m', age:'adulte', peau:'p4', coiffure:'court', cheveux:'noir', yeux:'ambre', barbe:'frisee', corps:'normal', habit:'#c8302a', chemise:'#ffe6a0', chapeau:'plume', accessoires:['boucle','gilet_carreaux']},
  silas:   {nom:'Silas', metier:'le garde champêtre', fond:'#3a5a3a',
    sexe:'m', age:'adulte', peau:'p1', coiffure:'court', cheveux:'noir', yeux:'gris', barbe:'fine', corps:'maigre', forme:'fin', plisse:true, regard:1, bouche:'coin', habit:'#3c6b40', chemise:'#d8d0b0', chapeau:'kepi', accessoires:['sifflet']},
  farinel: {nom:'Aimé Farinel', metier:'le meunier', fond:'#b8a070',
    sexe:'m', age:'adulte', peau:'p2', coiffure:'boucles', cheveux:'blond', yeux:'bleu', nez:'rond', corps:'rond', habit:'#d8ccb0', chemise:'#f4f0e6', chapeau:'bonnet', farine:true, bouche:'rire', accessoires:['farine_habit']},
  margot:  {nom:'Margot', metier:'la tavernière', fond:'#a8503a',
    sexe:'f', age:'adulte', peau:'p3', coiffure:'chignon', cheveux:'brun', yeux:'noisette', corps:'normal', habit:'#a8302a', chemise:'#f4ecd8', joues:.7, bouche:'ouvert', accessoires:['tablier_blanc','chope']},
  /* enquête 2 : le charretier */
  bastien: {nom:'Bastien Roulebosse', metier:'le charretier', fond:'#8a6a3a',
    sexe:'m', age:'adulte', peau:'p2', coiffure:'boucles', cheveux:'roux', yeux:'vert', nez:'rond', barbe:'courte', corps:'costaud', habit:'#7a4a26', chemise:'#e8d8b0', chapeau:'casquette', sourcils:'epais', terre:true, accessoires:['salopette']}
};

function busteCorps(K, sp){
  var u = K.u, s = '';
  var L = sp.corps === 'rond' ? 64 : sp.corps === 'costaud' ? 60 : sp.corps === 'maigre' ? 42 : sp.corps === 'enfant' ? 42 : 50;
  var ep = sp.corps === 'rond' ? 46 : sp.corps === 'enfant' ? 38 : 44;
  s += '<path d="M-9 24 L -9 46 Q 0 52 9 46 L 9 24 Z" fill="' + u('peau') + '"' + c(2) + '/><path d="M-9 30 Q 0 40 9 30 L 9 40 Q 0 46 -9 40 Z" fill="' + K.peau.ombre + '"/>';
  /* chemise */
  s += '<path d="M-' + (L - 6) + ' 120 C -' + (L - 4) + ' 70 -24 50 -12 ' + ep + ' L 12 ' + ep + ' C 24 50 ' + (L - 4) + ' 70 ' + (L - 6) + ' 120 Z" fill="' + sp.chemise + '"' + c(2) + '/>';
  /* habit */
  var hab = 'M-' + L + ' 120 C -' + L + ' 74 -' + (L - 12) + ' 56 -16 ' + (ep + 2) + ' L -6 80 L -2 120 Z M' + L + ' 120 C ' + L + ' 74 ' + (L - 12) + ' 56 16 ' + (ep + 2) + ' L 6 80 L 2 120 Z';
  s += '<path d="' + hab + '" fill="' + u('hab') + '"' + c(2.2) + '/>';
  s += '<path d="M' + L + ' 120 C ' + L + ' 74 ' + (L - 12) + ' 56 16 ' + (ep + 2) + ' L 20 ' + (ep + 6) + ' C ' + (L - 18) + ' 62 ' + (L - 6) + ' 80 ' + (L - 4) + ' 120 Z" fill="#000" opacity=".2"/>';
  if(sp.corps === 'rond') s += '<path d="M-12 96 Q 0 108 12 96" stroke="' + O + '" stroke-width="1.4" fill="none" opacity=".4"/>';
  return s;
}

function accessoire(K, sp, a){
  var u = K.u;
  switch(a){
    case 'echarpe_maire': return '<path d="M-44 70 L -30 60 L 46 116 L 30 122 Z" fill="' + u('or') + '"' + c(2) + '/><path d="M-36 66 L 38 118" stroke="#c0392b" stroke-width="3"/><circle cx="22" cy="104" r="6" fill="' + u('or') + '"' + c(1.4) + '/>';
    case 'cravate': return '<path d="M-8 46 L 8 46 L 4 56 L 8 72 L 0 80 L -8 72 L -4 56 Z" fill="#7a1e3a"' + c(1.6) + '/>';
    case 'gants': return '<g transform="translate(30 74) rotate(-12)"><path d="M-12 26 L -10 0 C -12 -8 -10 -16 -6 -18 L -6 -6 L -2 -22 C 0 -26 4 -24 4 -20 L 3 -6 L 7 -20 C 9 -24 13 -22 12 -18 L 10 -4 L 14 -14 C 16 -18 20 -16 18 -10 L 14 6 C 14 16 10 24 8 26 Z" fill="#a8acb8"' + c(2) + '/><path d="M-12 22 L 8 22" stroke="' + O + '" stroke-width="1.4"/><path d="M-2 -8 v10 M4 -6 v10" stroke="#7e8294" stroke-width="1.2"/></g>';
    case 'tablier_blanc': return '<path d="M-30 70 Q 0 64 30 70 L 34 120 L -34 120 Z" fill="#fbf8f0"' + c(2) + '/><path d="M-26 70 L -34 50 M26 70 L 34 50" stroke="#fbf8f0" stroke-width="4"/>';
    case 'tablier_vert': return '<path d="M-28 70 Q 0 64 28 70 L 32 120 L -32 120 Z" fill="#6aa85a"' + c(2) + '/><path d="M-14 92 h10 v10 h-10 Z" fill="#5a8a4a"' + c(1.2) + '/>';
    case 'echarpe_rouge': return '<path d="M-24 44 C -14 56 14 56 24 44 L 28 52 C 14 66 -14 66 -28 52 Z" fill="#d03a3a"' + c(2) + '/><path d="M10 58 L 16 90 L 6 88 L 2 60 Z" fill="#d03a3a"' + c(1.8) + '/><path d="M-18 52 v6 M-10 55 v7 M0 56 v7 M10 55 v7 M18 52 v6 M8 70 h8 M10 80 h7" stroke="#9a2020" stroke-width="1.2"/>';
    case 'metre': return '<path d="M-30 48 C -26 70 -22 90 -20 120 L -12 120 C -14 90 -18 70 -22 50 Z M30 48 C 26 70 22 90 20 120 L 12 120 C 14 90 18 70 22 50 Z" fill="#f2d24a"' + c(1.6) + '/><path d="M-27 60 h4 M-25 70 h4 M-24 80 h4 M-23 90 h4 M23 60 h4 M21 70 h4 M20 80 h4 M19 90 h4" stroke="' + O + '" stroke-width="1"/>';
    case 'epingles': return '<path d="M10 -76 L 16 -66 M-4 -80 L -6 -68" stroke="#c0c4d0" stroke-width="1.6"/><circle cx="10" cy="-77" r="2.4" fill="#e05a8a"/><circle cx="-4" cy="-81" r="2.4" fill="#5ab8e0"/>';
    case 'salopette': return '<path d="M-24 120 L -22 70 L 22 70 L 24 120 Z" fill="#3f5f9a"' + c(2) + '/><path d="M-20 70 L -26 46 M20 70 L 26 46" stroke="#3f5f9a" stroke-width="6"/><circle cx="-18" cy="74" r="2.4" fill="' + u('or') + '"/><circle cx="18" cy="74" r="2.4" fill="' + u('or') + '"/><path d="M-10 84 h20 v14 h-20 Z" fill="#355288"' + c(1.4) + '/>';
    case 'chale': return '<path d="M-52 120 C -52 80 -38 56 -18 48 C -10 60 10 60 18 48 C 38 56 52 80 52 120 L 30 120 C 26 96 14 80 0 76 C -14 80 -26 96 -30 120 Z" fill="#9a7ac0"' + c(2) + '/><path d="M-44 100 l6 6 M-36 90 l6 6 M36 90 l-6 6 M44 100 l-6 6" stroke="#7a5aa0" stroke-width="2"/>';
    case 'lunettes': return '<g fill="#d8f4ff" fill-opacity=".2" stroke="#8a6a3a" stroke-width="2"><circle cx="-12" cy="6" r="9"/><circle cx="12" cy="6" r="9"/></g><path d="M-3 5 q 3 -2 6 0" stroke="#8a6a3a" stroke-width="2" fill="none"/>';
    case 'chat': return '<g transform="translate(-40 40)">' + A('pj-queue', '<path d="M-14 6 C -26 0 -28 -14 -20 -20" stroke="#e8933a" stroke-width="5" fill="none" stroke-linecap="round"/>', ' style="transform-origin:-14px 6px"') + '<path d="M-14 12 C -16 -2 -6 -8 4 -6 C 14 -4 16 8 12 14 Z" fill="#f0a24a"' + c(1.8) + '/><path d="M-4 -12 L -6 -22 L 0 -16 Z M8 -12 L 12 -22 L 12 -12 Z" fill="#f0a24a"' + c(1.4) + '/><circle cx="3" cy="-8" r="9" fill="#f0a24a"' + c(1.8) + '/><path d="M-1 -9 q 2 -2 3 0 M5 -9 q 2 -2 3 0" stroke="' + O + '" stroke-width="1.3" fill="none"/><path d="M2 -5 l1.5 1 l1.5 -1" stroke="' + O + '" stroke-width="1" fill="none"/><path d="M-4 -12 h4 M8 -12 h3" stroke="#c8702a" stroke-width="1.2"/></g>';
    case 'pirate': return '<g transform="translate(38 74)"><path d="M-14 24 C -18 6 -10 -4 0 -4 C 10 -4 18 6 14 24 Z" fill="#fafafa"' + c(1.8) + '/><path d="M-12 -2 C -20 -4 -22 8 -16 14 L -10 6 Z M12 -2 C 20 -4 22 8 16 14 L 10 6 Z" fill="#2a2430"' + c(1.6) + '/><circle cx="0" cy="-2" r="11" fill="#fafafa"' + c(1.8) + '/><path d="M2 -12 C 10 -12 12 -4 8 2 C 4 -2 2 -6 2 -12 Z" fill="#2a2430"/><circle cx="-4" cy="-3" r="1.8" fill="' + O + '"/><circle cx="5" cy="-3" r="1.8" fill="#fff"/><circle cx="5" cy="-3" r="1.2" fill="' + O + '"/><ellipse cx="0" cy="3" rx="2.6" ry="1.8" fill="' + O + '"/><path d="M-2 7 q 2 3 4 0" fill="#e8737a"/></g>';
    case 'sacoche': return '<path d="M-36 56 L -30 52 L 40 112 L 34 118 Z" fill="#7a4a26"' + c(1.6) + '/><path d="M20 100 L 52 96 L 54 120 L 22 120 Z" fill="#8a5a30"' + c(2) + '/><path d="M20 100 L 52 96 L 52 106 Q 36 110 22 108 Z" fill="#6e4223"' + c(1.4) + '/><path d="M30 112 l8 -2 l1 6 l-8 2 Z" fill="#fff"' + c(1) + '/>';
    case 'cles': return '<g transform="translate(-28 70)"><circle r="9" fill="none" stroke="' + u('or') + '" stroke-width="2.6"/><path d="M-4 8 l-4 18 M0 9 l0 20 M4 8 l6 16" stroke="' + u('or') + '" stroke-width="2.6" stroke-linecap="round"/><path d="M-8 22 h-4 M0 26 h4 M8 20 h4" stroke="' + u('or') + '" stroke-width="2.4" stroke-linecap="round"/></g>';
    case 'fleurs': return '<path d="M-32 -40 C -20 -54 0 -58 4 -58" stroke="#5a9a4a" stroke-width="2.4" fill="none"/>' + [[-30,-42,'#b48cff'],[-20,-50,'#fff'],[-8,-55,'#ff9ac0'],[4,-57,'#b48cff']].map(function(p){ return '<g transform="translate(' + p[0] + ' ' + p[1] + ')"><circle cx="-3" cy="0" r="3" fill="' + p[2] + '"' + c(.8) + '/><circle cx="3" cy="0" r="3" fill="' + p[2] + '"' + c(.8) + '/><circle cx="0" cy="-3" r="3" fill="' + p[2] + '"' + c(.8) + '/><circle cx="0" cy="3" r="3" fill="' + p[2] + '"' + c(.8) + '/><circle r="1.8" fill="#ffd36a"/></g>'; }).join('') + '<path d="M26 -46 l2 -12 M30 -44 l4 -10 M22 -46 l0 -10" stroke="#9a7ad8" stroke-width="3" stroke-linecap="round"/>';
    case 'boucle': return '<circle cx="31" cy="16" r="4" fill="none" stroke="' + u('or') + '" stroke-width="2.4"/>';
    case 'gilet_carreaux': return '<path d="M-14 50 L -6 80 L -2 120 L -40 120 C -40 90 -30 64 -14 50 Z M14 50 L 6 80 L 2 120 L 40 120 C 40 90 30 64 14 50 Z" fill="#f2c040"' + c(2) + '/><path d="M-30 80 L -8 76 M-36 100 L -4 96 M-24 60 L -20 120 M8 76 L 30 80 M4 96 L 36 100 M20 60 L 24 120" stroke="#c0392b" stroke-width="2"/>';
    case 'sifflet': return '<path d="M-14 46 Q 0 70 14 46" stroke="' + u('or') + '" stroke-width="1.6" fill="none"/><path d="M-6 66 h10 q 4 0 4 4 q 0 4 -4 4 h-6 q -4 0 -4 -4 Z" fill="' + u('argent') + '"' + c(1.3) + '/>';
    case 'chope': return '<g transform="translate(-34 72)"><path d="M-10 -12 L 10 -12 L 9 18 L -9 18 Z" fill="#d8a85a"' + c(2) + '/><path d="M10 -6 q 10 0 10 8 q 0 8 -10 8" stroke="' + O + '" stroke-width="5" fill="none"/><path d="M10 -6 q 10 0 10 8 q 0 8 -10 8" stroke="#d8a85a" stroke-width="2.6" fill="none"/><path d="M-12 -12 C -12 -20 -4 -22 0 -18 C 4 -24 14 -20 12 -12 Z" fill="#fff"' + c(1.6) + '/><path d="M-4 -4 v16 M3 -4 v16" stroke="#b8803a" stroke-width="1.4"/></g>';
    case 'farine_habit': return '<g fill="#fff" opacity=".7"><circle cx="-30" cy="80" r="3"/><circle cx="-20" cy="96" r="2"/><circle cx="26" cy="86" r="3.4"/><circle cx="34" cy="104" r="2"/><circle cx="-8" cy="110" r="2.4"/></g>';
  }
  return '';
}

function pnj(id, opts){
  opts = opts || {};
  var sp = PNJ[id];
  if(!sp) return '';
  if(opts.expressif) return pnjExpressif(id, sp, opts);
  var uid = opts.id || ('pnj' + (++compteur));
  var h = {role:'pisteur', sexe:sp.sexe, age:sp.age, peau:sp.peau, coiffure:sp.coiffure, cheveux:sp.cheveux, yeux:sp.yeux, tenue:'foret', niveau:5};
  var K = contexte(uid, h);
  var anime = opts.anime !== false, fond = opts.fond !== false;
  var humeur = opts.humeur && opts.humeur !== 'normal' ? opts.humeur : null;
  /* opts.pied : le villageois en entier, de la tête aux pieds (les petites scènes animées, regles.js ; Romain, 5 novembre, 8 h 59) */
  var pied = !!opts.pied;
  if(pied) fond = false;
  var hs = sp.age === 'enfant' ? 1.16 : 1.08;
  var hy = sp.age === 'enfant' ? 100 : 104;
  var GP = pied ? geoPied(sp) : null, HV = pied ? Math.ceil(hy + GP.sol * hs + 5) : 200;
  var s = '<svg class="pj pj-pnj pj-pnj-' + id + (pied ? ' pj-pnj-pied' : '') + (anime ? ' pj-anime' : '') + (humeur ? ' pj-h-' + humeur : '') + '" viewBox="0 0 200 ' + HV + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + sp.nom + ', ' + sp.metier + '">';
  s += '<defs>' +
    lin(K.n('peau'), [[0, K.peau.c[0]], [1, K.peau.c[1]]]) +
    lin(K.n('chev'), [[0, K.chev.c[0]], [.5, K.chev.c[1]], [1, K.chev.c[2]]], 0, 0, .6, 1) +
    lin(K.n('iris'), [[0, K.yeux.c[0]], [.55, K.yeux.c[1]], [1, K.yeux.c[2]]], 0, 0, 0, 1) +
    lin(K.n('hab'), [[0, clair(sp.habit, .3)], [.6, sp.habit], [1, sombre(sp.habit, .4)]]) +
    lin(K.n('acc'), [[0, clair(sp.habit, .35)], [1, sombre(sp.habit, .3)]]) +
    lin(K.n('or'), [[0,'#fff4b8'], [.45,'#eab43c'], [1,'#94620e']]) +
    lin(K.n('argent'), [[0,'#ffffff'], [.5,'#d9e2f4'], [1,'#8e9cc0']]) +
    lin(K.n('blanc'), [[0,'#ffffff'], [1,'#cdd3e6']]) +
    lin(K.n('cuir'), [[0,'#b77b45'], [.5,'#6e4223'], [1,'#3b2211']]) +
    lin(K.n('cape'), [[0,'#3a3a5a'], [1,'#1a1a2a']]) +
    rad(K.n('fd'), [[0, clair(sp.fond, .25)], [.75, sp.fond], [1, sombre(sp.fond, .45)]], .5, .38, .7) +
    rad(K.n('lueur'), [[0,'#ffffff'], [.35,'#8ff3ff', .9], [1,'#8ff3ff', 0]]) +
  '</defs>';
  if(fond){
    s += '<rect width="200" height="200" fill="' + K.u('fd') + '"/>';
    s += '<circle cx="160" cy="40" r="3" fill="#fff" opacity=".35"/><circle cx="30" cy="60" r="2" fill="#fff" opacity=".3"/><circle cx="176" cy="96" r="1.6" fill="#fff" opacity=".3"/>';
  }
  var T = 'translate(100 ' + hy + ') scale(' + hs + ')';
  var coif = COIFF_V[sp.coiffure] || COIFF[sp.coiffure] || COIFF_V.court;
  var inner = '';
  /* en entier : les jambes et les chaussures, derrière tout le reste */
  if(pied) inner += jambesPnj(K, sp, GP);
  /* cheveux derrière */
  if(coif.dos && !sp.chapeau) inner += coif.dos(K);
  /* buste */
  var corpsSp = sp.corps;
  inner += busteCorps(K, sp);
  (sp.accessoires || []).forEach(function(a){ if(['echarpe_maire','cravate','tablier_blanc','tablier_vert','salopette','chale','gilet_carreaux','sacoche','sifflet','metre','farine_habit'].indexOf(a) >= 0) inner += accessoire(K, sp, a); });
  /* en entier : le bas du corps (veste et ceinture, ou jupe), le bas des tabliers, les bras et les mains */
  if(pied) inner += bassinPnj(K, sp, GP) + brasPnj(K, sp, GP);
  if(coif.devant) inner += coif.devant(K);
  (sp.accessoires || []).forEach(function(a){ if(['echarpe_rouge'].indexOf(a) >= 0) inner += accessoire(K, sp, a); });
  /* tête */
  var chap = sp.chapeau;
  if(!(chap && (chap === 'toque' || chap === 'kepi' || chap === 'facteur' || chap === 'casquette' || chap === 'bonnet' || chap === 'paille' || chap === 'plume')) || true) inner += coif.nuque(K);
  if(sp.favoris) inner += '<path d="M-33 -10 C -38 4 -34 20 -24 26 C -24 14 -26 2 -27 -8 Z M33 -10 C 38 4 34 20 24 26 C 24 14 26 2 27 -8 Z" fill="' + K.u('chev') + '"' + c(1.8) + '/>';
  var fv = {age:sp.age, sexe:sp.sexe, forme:sp.forme, nez:sp.nez, bouche:humeur ? null : sp.bouche, plisse:sp.plisse && humeur !== 'content', regard:humeur === 'ment' ? 1 : sp.regard || 0, humeur:humeur, sourcils:sp.sourcils, sourcilsC:sp.sourcilsC, joues:sp.joues, suie:sp.suie, farine:sp.farine, terre:sp.terre, sansSourcils:true};
  inner += visage(K, fv);
  if(sp.favoris) inner += '<path d="M-26 -6 C -30 8 -28 20 -20 26 C -20 16 -22 6 -22 -2 Z M26 -6 C 30 8 28 20 20 26 C 20 16 22 6 22 -2 Z" fill="' + K.u('chev') + '"' + c(1.6) + '/>';
  if(sp.barbe) inner += barbe(K, sp.barbe);
  if(!chap) inner += coif.avant(K) + sourcils(K, fv);
  else{
    /* sous un chapeau : seulement les côtés */
    inner += '<path d="M-29 -24 C -32 -10 -31 2 -27 10 L -24 -8 Z M29 -24 C 32 -10 31 2 27 10 L 24 -8 Z" fill="' + K.u('chev') + '"' + c(1.6) + '/>';
    if(sp.frange === 'epis') inner += '<path d="M-22 -34 L -18 -18 L -12 -30 L -6 -16 L 0 -30 L 6 -16 L 12 -30 L 18 -18 L 24 -32 Z" fill="' + K.u('chev') + '"' + c(1.8) + '/>';
    if(sp.coiffure === 'boucles') inner += [[-20,-32],[-8,-34],[6,-34],[18,-32]].map(function(p){ return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="7" fill="' + K.u('chev') + '"' + c(1.6) + '/>'; }).join('');
    inner += sourcils(K, fv) + CHAPEAUX[chap](K);
  }
  (sp.accessoires || []).forEach(function(a){ if(['lunettes','fleurs','epingles','boucle'].indexOf(a) >= 0) inner += accessoire(K, sp, a); });
  (sp.accessoires || []).forEach(function(a){
    if(['gants','chat','pirate','cles','chope'].indexOf(a) < 0) return;
    if(opts.sans && opts.sans.indexOf(a) >= 0) return;   /* opts.sans : sans cet accessoire (Tim sans son chien, qui court à part dans une scène) */
    if(!pied || a === 'chat'){ inner += accessoire(K, sp, a); return; }
    /* en entier : les gants sont ses mains (brasPnj) ; la chope dans la main, le chien par terre, les clés à la ceinture */
    /* (chaque accessoire se place lui-même : chope en (-34, 72), chien en (38, 74), clés en (-28, 70) ; on le décale jusqu'à sa nouvelle place) */
    if(a === 'chope') inner += '<g transform="translate(' + (28 - GP.L) + ' ' + (GP.main - 76) + ')">' + accessoire(K, sp, a) + '</g>';
    if(a === 'pirate') inner += '<g transform="translate(' + (GP.L - 18) + ' ' + (GP.sol - 98) + ')">' + accessoire(K, sp, a) + '</g>';
    if(a === 'cles') inner += '<g transform="translate(' + (38 - GP.L) + ' ' + (GP.taille - 82) + ')">' + accessoire(K, sp, a) + '</g>';
  });
  s += '<g transform="' + T + '">' + (anime && opts.souffle ? A('pj-souffle-pnj', inner) : inner) + '</g>';
  return s + '</svg>';
}

/* ---------- Le villageois en entier (Persos.pnj(id, {pied:true})) ----------
   Mêmes repères que le buste (la tête en 0,0 ; le buste s'arrête à y = 120) : on ajoute la taille et la ceinture (ou la jupe),
   les jambes, les chaussures, les bras le long du corps et les mains. Le bas des tabliers continue sur la jupe ou le pantalon. */
var BAS_PNJ = {grosbec:'#2a2440', gaspard:'#6a5440', melusine:'#2a5a4a', basile:'#3f5f9a', odette:'#5a4a7a', tim:'#3a3a48', victor:'#26386a',
  anselme:'#4a3a2e', iris:'#8a6a3a', fortune:'#3a2a5a', silas:'#5a4a30', farinel:'#a89c80', margot:'#4a2a3a', bastien:'#3f5f9a'};
function geoPied(sp){
  var enf = sp.age === 'enfant';
  var L = sp.corps === 'rond' ? 64 : sp.corps === 'costaud' ? 60 : sp.corps === 'maigre' ? 42 : sp.corps === 'enfant' ? 42 : 50;
  var lw = sp.corps === 'rond' || sp.corps === 'costaud' ? 18 : enf ? 12 : sp.corps === 'maigre' ? 13 : 15;
  return {L:L, lw:lw, jupe:sp.sexe === 'f', enf:enf, taille:enf ? 134 : 146, sol:enf ? 190 : 226, main:enf ? 126 : 136,
    salopette:(sp.accessoires || []).indexOf('salopette') >= 0, gants:(sp.accessoires || []).indexOf('gants') >= 0};
}
function basPnj(sp){
  for(var id in PNJ) if(PNJ[id] === sp && BAS_PNJ[id]) return BAS_PNJ[id];
  return sombre(sp.habit, .45);
}
function jambesPnj(K, sp, G){
  var s = '', g = 3, lw = G.jupe ? 9 : G.lw, bot = G.sol - 8;
  var top = G.jupe ? G.sol - 40 : G.taille - 6;
  var col = G.jupe ? '#3a2e3a' : basPnj(sp);
  [-1, 1].forEach(function(k){
    var x1 = k * g, x2 = k * (g + lw);
    s += '<path d="M' + x1 + ' ' + top + ' L ' + x1 + ' ' + bot + ' L ' + x2 + ' ' + bot + ' L ' + (x2 + k * (G.jupe ? 0 : 1)) + ' ' + top + ' Z" fill="' + col + '"' + c(2.2) + '/>';
    if(!G.jupe) s += '<path d="M' + (k * (g + lw * .55)) + ' ' + (top + 10) + ' L ' + (k * (g + lw * .55)) + ' ' + (bot - 6) + '" stroke="#000" stroke-opacity=".18" stroke-width="2"/>';
    /* la chaussure, vue de face : un ovale de cuir, un reflet */
    var cx = k * (g + lw / 2 + 1.5), rx = lw / 2 + 5;
    s += '<ellipse cx="' + cx + '" cy="' + (G.sol - 5.5) + '" rx="' + rx + '" ry="6.5" fill="#3b2618"' + c(2) + '/>' +
      '<path d="M' + (cx - rx * .5) + ' ' + (G.sol - 8.5) + ' q ' + (rx * .45) + ' -2.5 ' + (rx * .9) + ' 0" stroke="#8a6a4a" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
  });
  return s;
}
function bassinPnj(K, sp, G){
  var u = K.u, s = '', L = G.L, y0 = 112;
  if(G.jupe){
    /* la jupe : le haut sans contour (il se fond sous le corsage), les côtés et l'ourlet dessinés */
    var yb = G.sol - 30, Lb = L + 12, col = basPnj(sp);
    s += '<path d="M' + (1 - L) + ' ' + y0 + ' L ' + (L - 1) + ' ' + y0 + ' L ' + Lb + ' ' + yb + ' Q 0 ' + (yb + 9) + ' ' + (-Lb) + ' ' + yb + ' Z" fill="' + col + '"/>' +
      '<path d="M' + (L - 1) + ' ' + y0 + ' L ' + Lb + ' ' + yb + ' Q ' + (L * .5) + ' ' + (yb + 6) + ' ' + (L * .3) + ' ' + (yb + 7) + ' L ' + (L * .3) + ' ' + (y0 + 8) + ' Z" fill="#000" opacity=".16"/>' +
      '<path d="M' + (1 - L) + ' ' + y0 + ' L ' + (-Lb) + ' ' + yb + ' Q 0 ' + (yb + 9) + ' ' + Lb + ' ' + yb + ' L ' + (L - 1) + ' ' + y0 + '" fill="none"' + c(2.2) + '/>' +
      '<path d="M-15 ' + (y0 + 18) + ' L -20 ' + (yb + 3) + ' M15 ' + (y0 + 18) + ' L 20 ' + (yb + 3) + ' M0 ' + (y0 + 14) + ' L 0 ' + (yb + 6) + '" stroke="#000" stroke-opacity=".2" stroke-width="1.8" fill="none"/>';
  } else {
    /* le bas de la veste (ou de la salopette), le bout de chemise, la ceinture */
    var yt = G.taille, Lw = sp.corps === 'rond' ? L + 4 : L - 2, fill = G.salopette ? '#3f5f9a' : u('hab');
    var d = 'M' + (-L) + ' ' + y0 + ' L ' + L + ' ' + y0 + ' C ' + (Lw + 3) + ' ' + (y0 + 12) + ' ' + Lw + ' ' + (yt - 10) + ' ' + (Lw - 4) + ' ' + yt +
      ' L ' + (4 - Lw) + ' ' + yt + ' C ' + (-Lw) + ' ' + (yt - 10) + ' ' + (-Lw - 3) + ' ' + (y0 + 12) + ' ' + (-L) + ' ' + y0 + ' Z';
    s += '<path d="' + d + '" fill="' + fill + '"/>';
    if(!G.salopette) s += '<path d="M-3 ' + y0 + ' L 3 ' + y0 + ' L 3 ' + (yt - 6) + ' L -3 ' + (yt - 6) + ' Z" fill="' + sp.chemise + '"/>';
    s += '<path d="M' + L + ' ' + y0 + ' C ' + (Lw + 3) + ' ' + (y0 + 12) + ' ' + Lw + ' ' + (yt - 10) + ' ' + (Lw - 4) + ' ' + yt + ' L ' + (Lw * .45) + ' ' + yt + ' C ' + (Lw * .6) + ' ' + (y0 + 20) + ' ' + (L * .6) + ' ' + (y0 + 8) + ' ' + (L * .55) + ' ' + y0 + ' Z" fill="#000" opacity=".18"/>';
    s += '<path d="M' + (-L) + ' ' + y0 + ' C ' + (-Lw - 3) + ' ' + (y0 + 12) + ' ' + (-Lw) + ' ' + (yt - 10) + ' ' + (4 - Lw) + ' ' + yt + ' L ' + (Lw - 4) + ' ' + yt + ' C ' + Lw + ' ' + (yt - 10) + ' ' + (Lw + 3) + ' ' + (y0 + 12) + ' ' + L + ' ' + y0 + '" fill="none"' + c(2.2) + '/>';
    if(sp.corps === 'rond') s += '<path d="M-16 ' + (y0 + 14) + ' Q 0 ' + (y0 + 24) + ' 16 ' + (y0 + 14) + '" stroke="' + O + '" stroke-width="1.4" fill="none" opacity=".35"/>';
    if(!G.salopette) s += '<path d="M' + (6 - Lw) + ' ' + (yt - 9) + ' L ' + (Lw - 6) + ' ' + (yt - 9) + ' L ' + (Lw - 6) + ' ' + (yt - 1) + ' L ' + (6 - Lw) + ' ' + (yt - 1) + ' Z" fill="#3b2618"' + c(1.8) + '/>' +
      '<rect x="-5.5" y="' + (yt - 10) + '" width="11" height="10" rx="2" fill="' + u('or') + '"' + c(1.4) + '/>';
  }
  /* le bas des tabliers : sans contour en haut, il continue celui du buste */
  var ac = sp.accessoires || [];
  [['tablier_blanc', '#fbf8f0', 34, 38], ['tablier_vert', '#6aa85a', 32, 36]].forEach(function(t){
    if(ac.indexOf(t[0]) < 0) return;
    var yf = G.jupe ? G.sol - 46 : G.taille + 24;
    s += '<path d="M' + (-t[2]) + ' ' + (y0 - 2) + ' L ' + t[2] + ' ' + (y0 - 2) + ' L ' + t[3] + ' ' + yf + ' Q 0 ' + (yf + 5) + ' ' + (-t[3]) + ' ' + yf + ' Z" fill="' + t[1] + '"/>' +
      '<path d="M' + (-t[2]) + ' ' + (y0 - 2) + ' L ' + (-t[3]) + ' ' + yf + ' Q 0 ' + (yf + 5) + ' ' + t[3] + ' ' + yf + ' L ' + t[2] + ' ' + (y0 - 2) + '" fill="none"' + c(2) + '/>';
  });
  /* ce qui pend devant (l'écharpe du maire, la sacoche, le mètre ruban) repasse par-dessus */
  ac.forEach(function(a){ if(['echarpe_maire', 'sacoche', 'metre'].indexOf(a) >= 0) s += accessoire(K, sp, a); });
  return s;
}
function brasPnj(K, sp, G){
  var s = '', L = G.L, yh = G.main, main = G.gants ? '#a8acb8' : K.u('peau');
  [-1, 1].forEach(function(k){
    var d = 'M' + (k * (L - 14)) + ' 62 Q ' + (k * (L + 7)) + ' 86 ' + (k * (L + 3)) + ' ' + (yh - 9);
    s += '<path d="' + d + '" stroke="' + O + '" stroke-width="21" fill="none" stroke-linecap="round"/>' +
      '<path d="' + d + '" stroke="' + sp.habit + '" stroke-width="16" fill="none" stroke-linecap="round"/>' +
      '<path d="' + d + '" stroke="#000" stroke-opacity=".14" stroke-width="5" fill="none" stroke-linecap="round" transform="translate(' + (k * 4) + ' 2)"/>' +
      '<circle cx="' + (k * (L + 3)) + '" cy="' + yh + '" r="8.5" fill="' + main + '"' + c(2) + '/>';
  });
  return s;
}

/* ==========================================================
   VILLAGEOIS EXPRESSIFS — Persos.pnj(id, {expressif:true})
   Même dessin que pnj(), mais le visage est découpé en groupes
   pilotés par Persos.expression(svg, e) sans redessiner le SVG :
   pupilles (.pjx-iris), paupières (.pjx-paup, .pjx-rieur), sourcils
   (.pjx-sc-g/-d), bouche (.pjx-b, 9 formes), moustache (.pjx-mou),
   nez (.pjx-nez), rougeur (.pjx-rouge), sueur (.pjx-sueur), gorge
   (.pjx-gorge) et tête (.pjx-tete). Variables CSS --pjx-* sur la racine,
   transitions dans persos.css, gestes brefs avec l'API Web Animations.
   ========================================================== */
/* Boîte du contour de visage (pour un dégradé de peau identique sur les paupières) */
var BOITE_VISAGE = {adulte:[-26,-26.5,26,34], enfant:[-27,-28,27,32], age:[-26,-26.5,26,35], rond:[-29,-27.3,29,35], fin:[-23,-26.5,23,36]};
/* Où perle la sueur : x, y de départ (coordonnées de tête), angle de glissade, longueur */
var SUEUR_V = {
  grosbec:[16,-22,-5,11], gaspard:[16,-20,-5,10], melusine:[16,-21,-4,9], basile:[16,-20,-5,10], odette:[16,-21,-4,9],
  tim:[12,-23,0,12], victor:[16,-20,-5,10], anselme:[16,-21,-5,10], iris:[-22,-10,4,9], fortune:[16,-20,-5,10],
  silas:[14,-20,-5,10], farinel:[16,-21,-5,9], margot:[16,-21,-4,9]
};
function yeuxGeo(f){ return {ey:f.age === 'enfant' ? 8 : 6, ek:f.age === 'enfant' ? 1.1 : f.age === 'age' ? .9 : 1}; }

/* Un œil animable : blanc, iris découpé dans le blanc, paupière haute, paupière basse (yeux rieurs). */
function oeilX(K, x, y, d, f, cote){
  var u = K.u, k = f.taille || 1, s = '';
  function X(v){ return f1(x + v * k * d); }
  function Y(v){ return f1(y + v * k); }
  var p = f.plisse ? 2.5 : 0;
  var blanc = 'M' + X(-8.5) + ' ' + Y(-4 + p) + ' Q ' + X(0) + ' ' + Y(-7.5 + p) + ' ' + X(9) + ' ' + Y(-4.5 + p) + ' Q ' + X(9.2) + ' ' + Y(6) + ' ' + X(0) + ' ' + Y(7 - p * .4) + ' Q ' + X(-8.5) + ' ' + Y(6) + ' ' + X(-8.5) + ' ' + Y(-4 + p) + ' Z';
  var idc = K.n('oe' + cote);
  s += '<clipPath id="' + idc + '"><path d="' + blanc + '"/></clipPath>';
  s += '<path d="' + blanc + '" fill="#fff"/>';
  s += '<g clip-path="url(#' + idc + ')">';
  s += '<g class="pjx-iris">' +
    '<ellipse cx="' + x + '" cy="' + f1(y + .5 * k) + '" rx="' + f1(5.8 * k) + '" ry="' + f1(7.2 * k) + '" fill="' + u('iris') + '"/>' +
    '<ellipse cx="' + x + '" cy="' + f1(y + k) + '" rx="' + f1(2.5 * k) + '" ry="' + f1(3.4 * k) + '" fill="#0a0612"/>' +
    '<ellipse cx="' + f1(x + 2.2 * k) + '" cy="' + f1(y - 2.4 * k) + '" rx="' + f1(2.1 * k) + '" ry="' + f1(2.7 * k) + '" fill="#fff"/>' +
    '<circle cx="' + f1(x - 2 * k) + '" cy="' + f1(y + 4 * k) + '" r="' + f1(k) + '" fill="#fff"/></g>';
  /* paupière haute (peau) : son bord bas suit le trait de paupière, elle descend avec lui */
  s += '<path class="pjx-paup" d="M' + X(-12) + ' ' + Y(-30) + ' L ' + X(12.5) + ' ' + Y(-30) + ' L ' + X(12.5) + ' ' + Y(-3 + p) + ' L ' + X(10.5) + ' ' + Y(-3 + p) + ' Q ' + X(0) + ' ' + Y(-8 + p) + ' ' + X(-9.5) + ' ' + Y(-2 + p) + ' L ' + X(-12) + ' ' + Y(-2 + p) + ' Z" fill="' + u('peauV') + '"/>';
  /* paupière basse qui remonte en arc : les yeux qui sourient */
  s += '<g class="pjx-rieur"><path d="M' + X(-12) + ' ' + Y(17) + ' L ' + X(-12) + ' ' + Y(5.5) + ' Q ' + X(0) + ' ' + Y(-2) + ' ' + X(12) + ' ' + Y(5) + ' L ' + X(12) + ' ' + Y(17) + ' Z" fill="' + u('peauV') + '"/>' +
    '<path d="M' + X(-12) + ' ' + Y(5.5) + ' Q ' + X(0) + ' ' + Y(-2) + ' ' + X(12) + ' ' + Y(5) + '" stroke="' + O + '" stroke-width="1.4" stroke-opacity=".85" fill="none"/></g>';
  s += '</g>';
  /* trait de paupière (et cils) */
  var lin = '<path d="M' + X(-9.5) + ' ' + Y(-2.5 + p) + ' Q ' + X(-2) + ' ' + Y(-10.5 + p) + ' ' + X(9.5) + ' ' + Y(-6 + p) + ' L ' + X(10.5) + ' ' + Y(-3 + p) + ' Q ' + X(0) + ' ' + Y(-8 + p) + ' ' + X(-9.5) + ' ' + Y(-2 + p) + ' Z" fill="' + O + '"/>';
  if(f.cils) lin += '<path d="M' + X(9) + ' ' + Y(-5 + p) + ' q ' + f1(4 * d * k) + ' ' + f1(-1.5 * k) + ' ' + f1(5.5 * d * k) + ' ' + f1(-4.5 * k) + ' M' + X(9.6) + ' ' + Y(-2.5 + p) + ' q ' + f1(3.6 * d * k) + ' ' + f1(.4 * k) + ' ' + f1(5.2 * d * k) + ' ' + f1(-1.8 * k) + '" stroke="' + O + '" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
  s += '<g class="pjx-liner" style="transform-origin:' + x + 'px ' + Y(-6) + 'px">' + lin + '</g>';
  if(f.plisse) s += '<path d="M' + X(-9) + ' ' + Y(1.5) + ' Q ' + x + ' ' + Y(-.5) + ' ' + X(9) + ' ' + Y(.5) + '" stroke="' + K.peau.trait + '" stroke-width="1" fill="none"/>';
  s += '<path class="pjx-cilsb" d="M' + X(-6) + ' ' + Y(8) + ' Q ' + x + ' ' + Y(9.5) + ' ' + X(6) + ' ' + Y(8) + '" stroke="' + K.peau.trait + '" stroke-width="1" fill="none"/>';
  s += '<path class="pjx-pli" d="M' + X(-7.5) + ' ' + Y(10.6) + ' Q ' + X(0) + ' ' + Y(8.2) + ' ' + X(8) + ' ' + Y(10.2) + '" stroke="' + K.peau.trait + '" stroke-width="1.1" fill="none" stroke-linecap="round"/>';
  if(f.rides) s += '<path d="M' + X(11) + ' ' + Y(1) + ' l' + (4 * d) + ' -2 M' + X(11) + ' ' + Y(4) + ' l' + (4.5 * d) + ' 1" stroke="' + K.peau.trait + '" stroke-width="1" fill="none" stroke-linecap="round"/>';
  var o = 'transform-origin:' + x + 'px ' + f1(y + k) + 'px';
  return '<g class="pjx-oeil" data-k="' + k + '" style="' + o + '"><g class="pjx-oeil-in" style="' + o + '">' + s + '</g></g>';
}

/* Sourcils : un groupe par sourcil, mêmes tracés que sourcils() au repos */
function sourcilsX(K, f){
  var g = yeuxGeo(f), sc = f.sourcilsC || K.chev.c[2];
  var sy = f1(g.ey - 15 * g.ek);
  var ep = f.sourcils === 'epais' ? 3.6 : f.sourcils === 'touffus' ? 4.4 : f.sexe === 'm' ? 2.8 : 2.2;
  var fin = '" stroke="' + sc + '" stroke-width="' + ep + '" fill="none" stroke-linecap="round"/></g>';
  return '<g class="pjx-sc pjx-sc-g" style="transform-origin:-12px ' + f1(sy - 1) + 'px"><path d="M-20 ' + f1(sy + 1) + ' Q -12 ' + f1(sy - 3) + ' -4 ' + sy + fin +
    '<g class="pjx-sc pjx-sc-d" style="transform-origin:12px ' + f1(sy - 1) + 'px"><path d="M4 ' + sy + ' Q 12 ' + f1(sy - 3) + ' 20 ' + f1(sy + 1) + fin;
}

/* Rougeur : un voile rose léger, en haut du front seulement (opacité pilotée, montée lente) */
/* [cx, cy, rx, ry] : là où le front se voit (Iris a une longue frange) */
var ROUGEUR_V = {iris:[-12, -12, 15, 5.5]};
function rougeurX(K, id){
  var r = ROUGEUR_V[id] || [0, -18.5, 16, 6];
  return '<g class="pjx-rouge"><ellipse cx="' + r[0] + '" cy="' + r[1] + '" rx="' + r[2] + '" ry="' + r[3] + '" fill="' + K.u('rgf') + '"/><ellipse cx="' + r[0] + '" cy="' + (r[1] + 2.5) + '" rx="' + (r[2] * .56) + '" ry="' + (r[3] * .53) + '" fill="' + K.u('rgf') + '"/></g>';
}

/* Oreilles rouges (signe de Bastien, enquête 2) : ses oreilles prennent doucement une teinte rouge, en fondu
   (Romain, 5 novembre, 21 h 46 : « pas cette énorme couleur rouge, on dirait qu'il saigne des oreilles ; pas de traits, discret ») :
   une teinte posée sur la peau des oreilles, sans contour ni traits de chaleur ; opacité pilotée par --pjx-oreilles (comme la rougeur).
   Dessinées par-dessus les cheveux (Persos.pnj expressif), à la place exacte des oreilles. */
function oreillesRougesX(){
  return '<g class="pjx-oreilles-r" opacity="0"><path d="M-29 -4 Q -35 2 -32 10 Q -27 14 -24 8 Z M29 -4 Q 35 2 32 10 Q 27 14 24 8 Z" fill="#d9504a" fill-opacity=".5"/></g>';
}

/* Visage animable : comme visage(), sans la bouche (dessinée après la barbe) */
function visageX(K, f){
  var u = K.u, P = K.peau, s = '';
  var forme = VISAGE[f.forme] || VISAGE[f.age] || VISAGE.adulte;
  s += oreilles(K);
  s += '<path d="' + forme + '" fill="' + u('peau') + '"' + c(2.3) + '/>';
  s += '<path d="M15 26 C 22 20 26 12 26 4 L 26 14 C 24 22 18 28 8 32 Z" fill="' + P.ombre + '" opacity=".75"/>';
  s += '<path d="M-26 -8 Q 0 6 26 -8 L 26 -1 Q 0 13 -26 -1 Z" fill="' + P.ombre + '" opacity=".6"/>';
  var g = yeuxGeo(f), ey = g.ey, ek = g.ek;
  var jo = f.joues || .35;
  s += '<g class="pjx-joues"><ellipse cx="-19" cy="' + (ey + 10) + '" rx="' + (f.age === 'enfant' ? 7 : 6) + '" ry="3.2" fill="' + P.joue + '" opacity="' + jo + '"/><ellipse cx="19" cy="' + (ey + 10) + '" rx="' + (f.age === 'enfant' ? 7 : 6) + '" ry="3.2" fill="' + P.joue + '" opacity="' + jo + '"/>' +
    '<path class="pjx-pommettes" d="M-25 ' + (ey + 13) + ' Q -19 ' + (ey + 15.5) + ' -13 ' + (ey + 13) + ' M13 ' + (ey + 13) + ' Q 19 ' + (ey + 15.5) + ' 25 ' + (ey + 13) + '" stroke="' + P.trait + '" stroke-width="1" fill="none" stroke-linecap="round"/></g>';
  var fo = {taille:ek, cils:f.sexe === 'f', plisse:f.plisse, rides:f.age === 'age'};
  s += '<g class="pjx-yeux">' + oeilX(K, -12, ey, -1, fo, 'g') + oeilX(K, 12, ey, 1, fo, 'd') + '</g>';
  s += rougeurX(K, f.id);
  /* nez (se retrousse un peu quand il fronce le nez) */
  var ny = ey + 7, nez;
  if(f.nez === 'bec') nez = '<path d="M-3 ' + (ny - 10) + ' C 6 ' + (ny - 6) + ' 15 ' + (ny + 6) + ' 9 ' + (ny + 12) + ' C 4 ' + (ny + 16) + ' -4 ' + (ny + 14) + ' -7 ' + (ny + 9) + ' C -2 ' + (ny + 9) + ' 0 ' + (ny + 8) + ' 1 ' + (ny + 5) + ' Z" fill="' + u('peau') + '"' + c(1.8) + '/><path d="M3 ' + (ny + 1) + ' q 3 3 2 7" stroke="#fff" stroke-width="1.4" opacity=".5" fill="none" stroke-linecap="round"/>';
  else if(f.nez === 'rond') nez = '<ellipse cx="0" cy="' + (ny + 5) + '" rx="5" ry="4" fill="' + mix(P.c[1], P.joue, .35) + '"' + c(1.5) + '/><circle cx="-1.5" cy="' + (ny + 3.5) + '" r="1.3" fill="#fff" opacity=".6"/>';
  else nez = '<path d="M0 ' + (ny - 1) + ' l-1.6 4.6 l2.4 .4" stroke="' + P.trait + '" stroke-width="1.4" fill="none" stroke-linecap="round"/>';
  s += '<g class="pjx-nez">' + nez + '</g>';
  s += '<path class="pjx-nez-plis" d="M-3.6 ' + f1(ey - 1.5) + ' q 1.6 -1.2 3 0 M.6 ' + f1(ey - 1.5) + ' q 1.6 -1.2 3 0 M-2.4 ' + f1(ey + 1.2) + ' q 2.4 -1.4 4.8 0" stroke="' + P.trait + '" stroke-width="1" fill="none" stroke-linecap="round"/>';
  if(f.age === 'age'){
    var by = ey + 16;
    s += '<path d="M-10 ' + (by - 6) + ' q -4 5 -1 9 M10 ' + (by - 6) + ' q 4 5 1 9" stroke="' + P.trait + '" stroke-width="1" fill="none" opacity=".8" stroke-linecap="round"/>';
  }
  if(f.suie) s += '<path d="M-20 18 q 4 -3 8 1 q -3 3 -8 -1 Z M10 -2 q 5 -2 8 2 q -4 2 -8 -2 Z M14 22 q 3 -1 5 2" fill="#2a2430" opacity=".55" stroke="#2a2430" stroke-width=".8"/>';
  if(f.farine) s += '<g fill="#fff" opacity=".85"><circle cx="-19" cy="18" r="2.4"/><circle cx="-15" cy="21" r="1.4"/><circle cx="18" cy="-2" r="1.8"/><circle cx="21" cy="18" r="1.6"/></g>';
  if(f.terre) s += '<path d="M14 18 q 4 -2 7 1 q -3 3 -7 -1 Z" fill="#6e4a2a" opacity=".6"/>';
  return s;
}

/* Barbe coupée en deux : le corps (sous la bouche) et la moustache (au-dessus, mobile) */
function barbeX(K, type){
  var r = {corps:'', mou:''};
  if(!type || type === 'aucune') return r;
  var g = K.u('chev');
  var mou = '<path d="M-12 21 C -7 16 -2 17 0 19.5 C 2 17 7 16 12 21 C 8 24.5 4 22.5 0 21.5 C -4 22.5 -8 24.5 -12 21 Z" fill="' + g + '"' + c(1.5) + '/>';
  if(type === 'moustache') r.mou = mou;
  else if(type === 'frisee') r.mou = '<path d="M-2 20 C -8 16 -14 16 -18 20 C -20 16 -24 16 -25 20 C -24 24 -20 25 -17 23 C -12 25 -6 24 -2 22 Z M2 20 C 8 16 14 16 18 20 C 20 16 24 16 25 20 C 24 24 20 25 17 23 C 12 25 6 24 2 22 Z" fill="' + g + '"' + c(1.4) + '/>';
  else if(type === 'fine') r.mou = '<path d="M-10 21 Q -5 18 0 20 Q 5 18 10 21 Q 5 20.5 0 21.6 Q -5 20.5 -10 21 Z" fill="' + g + '"' + c(1.1) + '/>';
  else if(type === 'courte'){
    r.corps = '<path d="M-26 4 C -26 22 -16 35 0 39 C 16 35 26 22 26 4 C 24 14 19 25 11 27 C 6 23.5 -6 23.5 -11 27 C -19 25 -24 14 -26 4 Z" fill="' + g + '"' + c(1.8) + '/>' +
      '<path d="M-18 24 l2 3 M-10 31 l1 3 M10 31 l-1 3 M18 24 l-2 3" stroke="' + K.chev.c[2] + '" stroke-width="1.2" opacity=".6"/>';
    r.mou = mou;
  } else if(type === 'longue'){
    r.corps = A('pj-barbe', '<path d="M-26 6 C -30 40 -20 78 -2 106 C 0 98 2 98 4 104 C 20 78 30 40 26 6 C 23 18 17 27 9 27 C 5 24 -5 24 -9 27 C -17 27 -23 18 -26 6 Z" fill="' + g + '"' + c(2) + '/>' +
      '<path d="M-14 34 C -14 54 -8 72 -2 88 M0 30 C 0 50 2 70 2 92 M14 34 C 14 52 10 70 6 86" stroke="' + K.chev.c[2] + '" stroke-width="1.3" fill="none" opacity=".45" stroke-linecap="round"/>');
    r.mou = mou;
  }
  return r;
}

/* Bouche : toutes les formes superposées, une seule visible (attribut data-pjx-b) */
function boucheX(K, sp, f, by, sc){
  var R = '#9e4c38', fem = f.sexe === 'f', s = '';
  var teinte = fem ? '<path d="M-3.5 1.6 Q 0 3.6 3.5 1.6 Q 0 2.4 -3.5 1.6 Z" fill="#e0707a" opacity=".7"/>' : '';
  function trait(d, w){ return '<path d="' + d + '" stroke="' + R + '" stroke-width="' + (w || 1.8) + '" fill="none" stroke-linecap="round"/>'; }
  s += '<g class="pjx-b-repos">' + trait('M-5.5 0 Q 0 2 5.5 0') + teinte + '</g>';
  s += '<g class="pjx-b-s0">' + trait('M-5.4 -.6 Q 0 2.8 5.4 -.6', 1.7) + teinte + '</g>';
  s += '<g class="pjx-b-o"><ellipse cx="0" cy="1.6" rx="2.6" ry="3.3" fill="#6e2228"' + c(1.4) + '/><ellipse cx="0" cy="3.2" rx="1.5" ry=".9" fill="#e8737a"/></g>';
  s += '<g class="pjx-b-s1">' + trait('M-7 -1.6 Q 0 4.6 7 -1.6') + trait('M-7.7 -2.5 q -.8 .8 -.2 1.9 M7.7 -2.5 q .8 .8 .2 1.9', 1.1) + (fem ? '<path d="M-3.5 2 Q 0 3.8 3.5 2 Q 0 2.9 -3.5 2 Z" fill="#e0707a" opacity=".7"/>' : '') + '</g>';
  var s2;
  if(sp.bouche === 'grand') s2 = '<path d="M-12 -2 Q 0 9 12 -2 Q 0 3 -12 -2 Z" fill="#fff"' + c(1.6) + '/><path d="M-8 1 v 2.5 M-4 2.2 v 2.8 M0 2.6 v 2.8 M4 2.2 v 2.8 M8 1 v 2.5" stroke="#c9c2d6" stroke-width="1"/>';
  else s2 = '<path d="M-8 -1.8 Q 0 9.6 8 -1.8 Q 0 .6 -8 -1.8 Z" fill="#7a2a2a"' + c(1.6) + '/><path d="M-6.2 -1 Q 0 1.2 6.2 -1 L 5.4 .7 Q 0 2.6 -5.4 .7 Z" fill="#fff"/><path d="M-4 4.2 Q 0 2.6 4 4.2 Q 0 7.2 -4 4.2 Z" fill="#e8737a"/>';
  s += '<g class="pjx-b-s2">' + s2 + '</g>';
  s += '<g class="pjx-b-coin"><g class="pjx-b-coin-in">' + trait('M-5.6 .9 Q .6 2.6 6.6 -2') + trait('M6.6 -2 q 1.1 .2 1.3 1.4', 1.1) + teinte + '</g></g>';
  s += '<g class="pjx-b-pince">' + trait('M-5.2 .6 Q 0 1.2 5.2 .6', 2.4) + trait('M-6.2 -.4 q -.6 1 0 2 M6.2 -.4 q .6 1 0 2', 1) + '</g>';
  s += '<g class="pjx-b-mord">' + trait('M-5.6 -.6 Q 0 .8 5.6 -.6') + '<path d="M-3.2 .1 Q 0 .9 3.2 .1 L 2.9 2.2 Q 0 2.9 -2.9 2.2 Z" fill="#fff" stroke="' + O + '" stroke-width=".9" stroke-linejoin="round"/>' + trait('M-4.4 2.9 Q 0 4.7 4.4 2.9', 1.4) + '</g>';
  /* mordillement : la lèvre du bas disparaît (rentrée sous celle du haut) et remue ; pas de dents visibles */
  s += '<g class="pjx-b-mordille"><g class="pjx-b-mordille-in">' + trait('M-5.4 -.6 Q 0 .8 5.4 -.6', 2) +
    '<path d="M-3.8 .6 Q 0 3.2 3.8 .6 Q 0 1.7 -3.8 .6 Z" fill="' + mix(R, O, .25) + '"/>' +
    '<path d="M-4.6 3.9 Q 0 5.4 4.6 3.9" stroke="' + K.peau.trait + '" stroke-width="1.1" fill="none" stroke-linecap="round" opacity=".9"/></g></g>';
  /* sourire forcé : grand sourire « fromage », figé, dents serrées */
  s += '<g class="pjx-b-sforce"><path d="M-8.6 -2.4 Q 0 .8 8.6 -2.4 Q 7.6 3 0 3.6 Q -7.6 3 -8.6 -2.4 Z" fill="#fff"' + c(1.5) + '/>' +
    '<path d="M-8 -.4 Q 0 2.2 8 -.4" stroke="#d9d3e3" stroke-width=".8" fill="none"/><path d="M-3 -1 v4.2 M3 -1 v4.2" stroke="#e2dcea" stroke-width=".7"/>' +
    trait('M-9.3 -3.4 q -.7 .9 0 1.9 M9.3 -3.4 q .7 .9 0 1.9', 1) + '</g>';
  s += '<g class="pjx-b-moue"><path d="M-3.4 .6 Q 0 -2.2 3.4 .6 Q 0 3.4 -3.4 .6 Z" fill="' + mix(R, '#e0707a', .55) + '" stroke="' + R + '" stroke-width="1.3"/><path d="M-1.4 -.2 q 1 -.6 2 0" stroke="#fff" stroke-width=".8" opacity=".6" fill="none"/></g>';
  s += '<g class="pjx-b-parle"><g class="pjx-b-anim"><path d="M-5 -1 Q 0 -2.2 5 -1 Q 4.6 6.4 0 6.8 Q -4.6 6.4 -5 -1 Z" fill="#6e2228"' + c(1.5) + '/><ellipse cx="0" cy="4.6" rx="2.8" ry="1.5" fill="#e8737a"/></g></g>';
  s += '<g class="pjx-b-parles"><g class="pjx-b-anim"><path d="M-7.4 -2.2 Q 0 -.6 7.4 -2.2 Q 5.6 6.2 0 6.6 Q -5.6 6.2 -7.4 -2.2 Z" fill="#6e2228"' + c(1.5) + '/><path d="M-5.4 -1.2 Q 0 0 5.4 -1.2 L 5 .2 Q 0 1.3 -5 .2 Z" fill="#fff"/><ellipse cx="0" cy="4.4" rx="3.2" ry="1.6" fill="#e8737a"/></g></g>';
  return '<g class="pjx-b" transform="translate(0 ' + f1(by) + ')' + (sc !== 1 ? ' scale(' + sc + ')' : '') + '">' + s + '</g>';
}

/* Trait de sueur : une goutte fine et allongée, couleur peau un peu plus foncée et brillante, posée SUR le front ;
   elle glisse lentement en laissant une trace humide. */
function sueurX(K, id){
  var q = SUEUR_V[id] || [15, -21, -5, 13], P = K.peau;
  var bord = mix(P.c[1], P.trait, .45), corps = mix(P.c[0], P.c[1], .55);
  return '<g class="pjx-sueur" transform="translate(' + q[0] + ' ' + q[1] + ') rotate(' + q[2] + ')">' +
    '<path class="pjx-sueur-trace" d="M0 -2 L 0 ' + q[3] + '" stroke="' + clair(P.c[0], .5) + '" stroke-width=".9" stroke-linecap="round" style="transform-origin:0px -2px"/>' +
    '<g class="pjx-sueur-g" data-l="' + q[3] + '">' +
      '<path d="M0 -4.2 C .5 -2.2 1.35 -.2 1.35 1.3 C 1.35 2.5 .75 3.2 0 3.2 C -.75 3.2 -1.35 2.5 -1.35 1.3 C -1.35 -.2 -.5 -2.2 0 -4.2 Z" fill="' + corps + '" stroke="' + bord + '" stroke-width=".6"/>' +
      '<path d="M-.45 -.6 Q -.75 .8 -.5 1.9" stroke="#fff" stroke-width=".55" stroke-linecap="round" fill="none" opacity=".95"/><circle cx=".5" cy="2.2" r=".25" fill="#fff" opacity=".8"/>' +
    '</g></g>';
}

function pnjExpressif(id, sp, opts){
  var uid = opts.id || ('pnjx' + (++compteur));
  var h = {role:'pisteur', sexe:sp.sexe, age:sp.age, peau:sp.peau, coiffure:sp.coiffure, cheveux:sp.cheveux, yeux:sp.yeux, tenue:'foret', niveau:5};
  var K = contexte(uid, h), P = K.peau;
  var anime = opts.anime !== false, fond = opts.fond !== false;
  var forme = VISAGE[sp.forme] ? sp.forme : VISAGE[sp.age] ? sp.age : 'adulte';
  var bb = BOITE_VISAGE[forme] || BOITE_VISAGE.adulte;
  /* dégradé de peau en coordonnées de tête, calé exactement sur celui du visage */
  var w = bb[2] - bb[0], hh = bb[3] - bb[1], vx = 1 / (2 * w), vy = 1 / (2 * hh), n2 = vx * vx + vy * vy;
  var rc = mix(P.joue, '#ff3a5c', .22);
  var vb = opts.cadre === 'visage' ? '33 36 134 134' : '0 0 200 200';
  var s = '<svg class="pj pj-pnj pj-expr pj-pnj-' + id + (anime ? ' pj-anime' : '') + '" data-pjx-b="repos" viewBox="' + vb + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + sp.nom + ', ' + sp.metier + '">';
  s += '<defs>' +
    lin(K.n('peau'), [[0, P.c[0]], [1, P.c[1]]]) +
    linU(K.n('peauV'), [[0, P.c[0]], [1, P.c[1]]], bb[0], bb[1], f1(bb[0] + vx / n2), f1(bb[1] + vy / n2)) +
    lin(K.n('chev'), [[0, K.chev.c[0]], [.5, K.chev.c[1]], [1, K.chev.c[2]]], 0, 0, .6, 1) +
    lin(K.n('iris'), [[0, K.yeux.c[0]], [.55, K.yeux.c[1]], [1, K.yeux.c[2]]], 0, 0, 0, 1) +
    lin(K.n('hab'), [[0, clair(sp.habit, .3)], [.6, sp.habit], [1, sombre(sp.habit, .4)]]) +
    lin(K.n('acc'), [[0, clair(sp.habit, .35)], [1, sombre(sp.habit, .3)]]) +
    lin(K.n('or'), [[0,'#fff4b8'], [.45,'#eab43c'], [1,'#94620e']]) +
    lin(K.n('argent'), [[0,'#ffffff'], [.5,'#d9e2f4'], [1,'#8e9cc0']]) +
    lin(K.n('blanc'), [[0,'#ffffff'], [1,'#cdd3e6']]) +
    lin(K.n('cuir'), [[0,'#b77b45'], [.5,'#6e4223'], [1,'#3b2211']]) +
    lin(K.n('cape'), [[0,'#3a3a5a'], [1,'#1a1a2a']]) +
    rad(K.n('fd'), [[0, clair(sp.fond, .25)], [.75, sp.fond], [1, sombre(sp.fond, .45)]], .5, .38, .7) +
    rad(K.n('lueur'), [[0,'#ffffff'], [.35,'#8ff3ff', .9], [1,'#8ff3ff', 0]]) +
    rad(K.n('rg'), [[0, rc, .6], [.55, rc, .32], [1, rc, 0]]) +
    rad(K.n('rgf'), [[0, rc, .42], [.6, rc, .2], [1, rc, 0]]) +
  '</defs>';
  if(fond){
    s += '<rect x="-20" y="-20" width="240" height="240" fill="' + K.u('fd') + '"/>';
    s += '<circle cx="160" cy="40" r="3" fill="#fff" opacity=".35"/><circle cx="30" cy="60" r="2" fill="#fff" opacity=".3"/><circle cx="176" cy="96" r="1.6" fill="#fff" opacity=".3"/>';
  }
  var hs = sp.age === 'enfant' ? 1.16 : 1.08, hy = sp.age === 'enfant' ? 100 : 104;
  var coif = COIFF_V[sp.coiffure] || COIFF[sp.coiffure] || COIFF_V.court;
  var chap = sp.chapeau, acc = sp.accessoires || [];
  function accs(liste){ var r = ''; acc.forEach(function(a){ if(liste.indexOf(a) >= 0) r += accessoire(K, sp, a); }); return r; }
  var fv = {id:id, age:sp.age, sexe:sp.sexe, forme:sp.forme, nez:sp.nez, plisse:sp.plisse, sourcils:sp.sourcils, sourcilsC:sp.sourcilsC, joues:sp.joues, suie:sp.suie, farine:sp.farine, terre:sp.terre};
  var g = yeuxGeo(fv);
  var inner = '';
  if(coif.dos && !chap) inner += '<g class="pjx-tete">' + coif.dos(K) + '</g>';
  inner += busteCorps(K, sp);
  inner += '<g class="pjx-gorge"><path d="M-2.8 41.6 Q 0 39.8 2.8 41.6" stroke="' + P.trait + '" stroke-width="1.2" fill="none" stroke-linecap="round"/></g>';
  inner += accs(['echarpe_maire','cravate','tablier_blanc','tablier_vert','salopette','chale','gilet_carreaux','sacoche','sifflet','metre','farine_habit']);
  if(coif.devant) inner += '<g class="pjx-tete">' + coif.devant(K) + '</g>';
  inner += accs(['echarpe_rouge']);
  /* la tête */
  var t = coif.nuque(K);
  if(sp.favoris) t += '<path d="M-33 -10 C -38 4 -34 20 -24 26 C -24 14 -26 2 -27 -8 Z M33 -10 C 38 4 34 20 24 26 C 24 14 26 2 27 -8 Z" fill="' + K.u('chev') + '"' + c(1.8) + '/>';
  t += visageX(K, fv);
  if(sp.favoris) t += '<path d="M-26 -6 C -30 8 -28 20 -20 26 C -20 16 -22 6 -22 -2 Z M26 -6 C 30 8 28 20 20 26 C 20 16 22 6 22 -2 Z" fill="' + K.u('chev') + '"' + c(1.6) + '/>';
  var bx = barbeX(K, sp.barbe);
  var poils = !!bx.mou;
  t += bx.corps;
  var by = g.ey + 16 - (sp.age === 'enfant' ? 1 : 0) + (poils ? (sp.barbe === 'fine' ? 1.6 : 2.6) : 0) + (sp.nez === 'bec' ? 5.5 : 0);
  t += boucheX(K, sp, fv, by, sp.age === 'enfant' ? .92 : 1);
  if(bx.mou) t += '<g class="pjx-mou">' + bx.mou + '</g>';
  t += sueurX(K, id);
  if(!chap) t += coif.avant(K) + sourcilsX(K, fv);
  else {
    t += '<path d="M-29 -24 C -32 -10 -31 2 -27 10 L -24 -8 Z M29 -24 C 32 -10 31 2 27 10 L 24 -8 Z" fill="' + K.u('chev') + '"' + c(1.6) + '/>';
    if(sp.frange === 'epis') t += '<path d="M-22 -34 L -18 -18 L -12 -30 L -6 -16 L 0 -30 L 6 -16 L 12 -30 L 18 -18 L 24 -32 Z" fill="' + K.u('chev') + '"' + c(1.8) + '/>';
    if(sp.coiffure === 'boucles') t += [[-20,-32],[-8,-34],[6,-34],[18,-32]].map(function(p){ return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="7" fill="' + K.u('chev') + '"' + c(1.6) + '/>'; }).join('');
    t += sourcilsX(K, fv) + CHAPEAUX[chap](K);
  }
  t += oreillesRougesX();   /* par-dessus les cheveux : des oreilles rouges doivent se voir, même sous des boucles */
  t += accs(['lunettes','fleurs','epingles','boucle']);
  inner += '<g class="pjx-tete"><g class="pjx-tete-in">' + t + '</g></g>';
  inner += accs(opts.cadre === 'visage' ? ['chat','pirate'] : ['gants','chat','pirate','cles','chope']);
  s += '<g transform="translate(100 ' + hy + ') scale(' + hs + ')">' + (anime && opts.souffle ? A('pj-souffle-pnj', inner) : inner) + '</g>';
  s += '</svg>';
  /* humeur de départ (compatibilité avec l'API humeur) */
  var hm = opts.humeur && HUMEUR_X[opts.humeur];
  if(hm) s = s.replace('data-pjx-b="repos"', 'data-pjx-b="' + bouchePour(hm) + '" style="' + varsPour(hm) + '"');
  return s;
}

/* ---------- Pilotage des expressions ---------- */
var EXPR0 = {regard:'centre', ampleur:1, sourire:0, yeuxRieurs:0, sourcils:'neutre', penche:0, menton:false, rougeur:0,
  sueur:0, sueurDuree:1.8, cligne:false, cligneDuree:0, bouche:'fermee', nez:false, grandsYeux:false, paupieres:0,
  avale:false, hoche:false, secoue:false, coin:0, vitesse:.22, vitesseRougeur:.9, oreilles:0};
var REGARD_X = {centre:[0,0], 'cote-g':[-3.2,.3], 'cote-d':[3.2,.3], haut:[1.3,-3.3], 'haut-g':[-1.7,-3.2], 'haut-d':[1.7,-3.2], bas:[.3,2.7]};
/* [y gauche, rotation gauche, y droit, rotation droite] */
var SOURCILS_X = {neutre:[0,0,0,0], leves:[-3.6,-5,-3.6,5], fronces:[1.8,10,1.8,-10], un:[-4,-4,.6,0], 'un-d':[.6,0,-4,4], bas:[1.2,0,1.2,0], tendus:[-1.8,2,-1.8,-2]};
var HUMEUR_X = {ment:{regard:'cote-d', sourire:'coin', rougeur:.5}, peur:{sourcils:'leves', grandsYeux:true, bouche:'pincee'}, content:{sourire:2, yeuxRieurs:true}};
function bouchePour(x){
  if(x.bouche === 'mord') return 'mord';
  if(x.bouche === 'pincee') return 'pince';
  if(x.bouche === 'moue') return 'moue';
  if(x.bouche === 'o') return 'o';
  if(x.bouche === 'mordille') return 'mordille';
  if(x.sourire === 'force') return 'sforce';
  if(x.sourire === 'coin') return 'coin';
  if(x.bouche === 'parle') return x.sourire >= 1 ? 'parles' : 'parle';
  if(x.sourire === 'doux') return x.bouche === 'parle' ? 'parles' : 's0';
  return x.sourire >= 2 ? 's2' : x.sourire >= 1 ? 's1' : 'repos';
}
function varsXObj(x){
  var r = REGARD_X[x.regard] || REGARD_X.centre, a = x.ampleur == null ? 1 : +x.ampleur;
  var paup = +x.paupieres || 0;
  if(x.regard === 'bas') paup = Math.max(paup, .38);
  var mt = x.menton === 'bas' || x.menton < 0 ? -1 : x.menton ? 1 : 0;
  if(mt > 0) paup = Math.max(paup, .3);
  if(x.grandsYeux) paup = 0;
  var rie = x.yeuxRieurs === true ? 1 : (+x.yeuxRieurs || 0);
  /* un vrai sourire monte jusqu'aux yeux (paupière du bas qui remonte, pommettes) */
  if(x.sourire === 2) rie = Math.max(rie, .62);
  if(x.sourire === 1 || x.sourire === 'doux') rie = Math.max(rie, .55);
  if(x.nez) rie = Math.max(rie, .4);
  var joue = Math.max(rie, x.sourire === 2 ? 1 : x.sourire === 1 ? .45 : 0);
  var sc = SOURCILS_X[x.sourcils] || SOURCILS_X.neutre;
  var gy = x.grandsYeux ? 1.12 : 1;
  /* sourire forcé : la bouche sourit, les yeux restent plats, un peu trop ouverts, sans pommettes */
  if(x.sourire === 'force'){ rie = 0; joue = 0; paup = 0; if(!x.grandsYeux) gy = 1.06; if(x.sourcils === 'neutre') sc = SOURCILS_X.tendus; }
  if(x.grandsYeux && x.sourcils === 'neutre') sc = SOURCILS_X.leves;
  if(mt < 0 && x.sourcils === 'neutre') sc = SOURCILS_X.bas;
  var cote = x.coin ? (x.coin < 0 ? -1 : 1) : (/-g$/.test(x.regard) ? -1 : 1);
  var ry = r[1] * a; if(mt < 0 && x.regard === 'centre') ry = -1.4;
  return {'--pjx-rx':f1(r[0] * a), '--pjx-ry':f1(ry), '--pjx-joue':f1(joue * 100) / 100, '--pjx-paup':f1(paup * 100) / 100, '--pjx-rieurs':f1(rie * 100) / 100,
    '--pjx-sgy':sc[0], '--pjx-sgr':sc[1], '--pjx-sdy':sc[2], '--pjx-sdr':sc[3],
    '--pjx-penche':Math.max(-1.5, Math.min(1.5, +x.penche || 0)), '--pjx-menton':mt, '--pjx-gy':gy,
    '--pjx-nez':x.nez ? 1 : 0, '--pjx-rougeur':Math.max(0, Math.min(1, +x.rougeur || 0)), '--pjx-oreilles':Math.max(0, Math.min(1, +x.oreilles || 0)), '--pjx-coin':cote,
    '--pjx-t':(x.vitesse == null ? .22 : x.vitesse) + 's', '--pjx-tr':(x.vitesseRougeur == null ? .9 : x.vitesseRougeur) + 's'};
}
function varsPour(e){
  var x = {}; for(var k in EXPR0) x[k] = (k in e) ? e[k] : EXPR0[k];
  var v = varsXObj(x); return Object.keys(v).map(function(k){ return k + ':' + v[k]; }).join(';');
}
function anim(el, kf, ms, easing){
  if(!el || !el.animate) return null;
  try{ return el.animate(kf, {duration:ms, easing:easing || 'ease-in-out'}); }catch(e){ return null; }
}
/* Cligner : la paupière (peau) descend et le trait de paupière s'aplatit en bas de l'œil */
function cligner(svg, type, duree){
  var ms = duree ? duree * 1000 : type === 'lent' ? 580 : type === 'double' ? 360 : 170;
  var base = 0;
  try{ base = (parseFloat(getComputedStyle(svg).getPropertyValue('--pjx-paup')) || 0) * 5.5; }catch(e){}
  function kf(ouv, ferm){
    if(type === 'double') return [{transform:ouv}, {transform:ferm, offset:.2}, {transform:ouv, offset:.42}, {transform:ferm, offset:.62}, {transform:ouv, offset:.84}, {transform:ouv}];
    if(type === 'lent') return [{transform:ouv}, {transform:ferm, offset:.4}, {transform:ferm, offset:.6}, {transform:ouv}];
    return [{transform:ouv}, {transform:ferm, offset:.5}, {transform:ouv}];
  }
  Array.prototype.forEach.call(svg.querySelectorAll('.pjx-oeil'), function(o){
    var k = +o.getAttribute('data-k') || 1;
    anim(o.querySelector('.pjx-paup'), kf('translateY(' + base + 'px)', 'translateY(' + f1(12.6 * k) + 'px)'), ms);
    anim(o.querySelector('.pjx-liner'), kf('translateY(' + base + 'px) scaleY(1)', 'translateY(' + f1(11.4 * k) + 'px) scaleY(.4)'), ms);
  });
}
function suer(svg, force, duree){
  var g = svg.querySelector('.pjx-sueur-g'), tr = svg.querySelector('.pjx-sueur-trace');
  if(!g) return;
  var L = +g.getAttribute('data-l') || 13, o = Math.min(1, .5 + .5 * force), k = .8 + .35 * force, ms = Math.max(300, duree * 1000);
  var ease = 'cubic-bezier(.5,.05,.75,.9)';
  anim(g, [{opacity:0, transform:'translate(0px,0px) scale(' + f1(k * .6) + ')'}, {opacity:o, transform:'translate(0px,' + f1(L * .06) + 'px) scale(' + f1(k) + ')', offset:.16},
    {opacity:o, offset:.8}, {opacity:0, transform:'translate(0px,' + L + 'px) scale(' + f1(k * .92) + ')'}], ms, ease);
  anim(tr, [{opacity:0, transform:'scaleY(0)'}, {opacity:o * .5, transform:'scaleY(.06)', offset:.16}, {opacity:o * .45, offset:.8}, {opacity:0, transform:'scaleY(1)'}], ms, ease);
}
function avaler(svg){
  anim(svg.querySelector('.pjx-gorge'), [{opacity:0, transform:'translateY(0px)'}, {opacity:.9, transform:'translateY(0px)', offset:.25}, {opacity:.9, transform:'translateY(-3.4px)', offset:.55}, {opacity:0, transform:'translateY(0px)'}], 680);
  anim(svg.querySelector('.pjx-tete-in'), [{transform:'translateY(0px)'}, {transform:'translateY(1px)', offset:.5}, {transform:'translateY(0px)'}], 680);
}
function hocher(svg){
  anim(svg.querySelector('.pjx-tete-in'), [{transform:'translateY(0px)'}, {transform:'translateY(3.2px)', offset:.28}, {transform:'translateY(-.8px)', offset:.62}, {transform:'translateY(0px)'}], 620);
}
function secouer(svg){
  anim(svg.querySelector('.pjx-tete-in'), [{transform:'rotate(0deg)'}, {transform:'rotate(-5deg)', offset:.2}, {transform:'rotate(5deg)', offset:.45}, {transform:'rotate(-3.5deg)', offset:.7}, {transform:'rotate(0deg)'}], 760);
}
function svgExpressif(el){
  if(!el) return null;
  if(el.classList && el.classList.contains('pj-expr')) return el;
  return el.querySelector ? el.querySelector('svg.pj-expr') : null;
}
/* Persos.expression(svg, e, garder) : applique l'expression e (les clés absentes reviennent
   au repos, ou restent telles quelles si garder vaut true). Renvoie l'état complet. */
function expression(el, e, garder){
  var svg = svgExpressif(el);
  if(!svg) return null;
  if(typeof e === 'string') e = HUMEUR_X[e] || {};
  e = e || {};
  var avant = svg.__pjx || EXPR0, x = {};
  for(var k in EXPR0) x[k] = (k in e) ? e[k] : (garder ? avant[k] : EXPR0[k]);
  var v = varsXObj(x);
  for(var nom in v) svg.style.setProperty(nom, v[nom]);
  svg.setAttribute('data-pjx-b', bouchePour(x));
  if(x.cligne) cligner(svg, x.cligne === true ? 'simple' : x.cligne, x.cligneDuree);
  if(x.sueur > 0 && (!(avant.sueur > 0) || e.relance)) suer(svg, +x.sueur, x.sueurDuree || 1.8);
  if(x.avale) avaler(svg);
  if(x.hoche) hocher(svg);
  if(x.secoue) secouer(svg);
  x.cligne = false; x.avale = false; x.hoche = false; x.secoue = false;
  svg.__pjx = x;
  return x;
}

/* ==========================================================
   Exports
   ========================================================== */
var VISIBLES = {};
Object.keys(OBJ).forEach(function(id){ if(OBJ[id][1]) VISIBLES[id] = true; });

window.Persos = {
  CHOIX:{
    sexe:[{id:'f', nom:'Fille'}, {id:'m', nom:'Garçon'}],
    age:[{id:'enfant', nom:'Enfant'}, {id:'adulte', nom:'Adulte'}, {id:'age', nom:'Âgé'}],
    peau:PEAUX.map(function(p){ return {id:p.id, nom:p.nom, c:p.c[1]}; }),
    coiffure:COIFFURES,
    cheveux:CHEVEUX.map(function(p){ return {id:p.id, nom:p.nom, c:p.c[1]}; }),
    yeux:YEUX.map(function(p){ return {id:p.id, nom:p.nom, c:p.c[1]}; }),
    tenue:TENUES.slice(),
    barbe:BARBES.slice(),
    animal:ANIMAUX.slice()
  },
  ROLES:ROLES,
  defaut:defaut,
  heros:heros,
  pnj:pnj,
  expression:expression,
  PNJ:(function(){ var r = {}; Object.keys(PNJ).forEach(function(k){ r[k] = {nom:PNJ[k].nom, metier:PNJ[k].metier}; }); return r; })(),
  visible:function(id){ return !!VISIBLES[id]; },
  palier:palier,
  /* garde-robe : garderobe.js branche ici le dessin des vêtements (couches), avec les mêmes outils de dessin */
  garde:function(ext){ GARDE = ext || null; },
  outils:{O:O, c:c, A:A, mix:mix, clair:clair, sombre:sombre, etoile4:etoile4, f1:f1, lin:lin, linU:linU, rad:rad, bottes:bottes, palier:palier}
};
})();
