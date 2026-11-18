/* film-debut2.js — LE FILM DU DÉBUT DE L'ENQUÊTE 2, « La rivière rouge » (Bible §13.69).
   Romain (18 novembre, à la voix) : « l'enquête 2, ce serait avec l'eau qui est devenue rouge, donc là ça inquiéterait tout le monde »,
   « l'aube, avec le soleil qui se lève, le rouge de la rivière ».

   Ce que dit le jeu (e2.js, la lettre du maire) : « Ce matin, à l'aube, la rivière de Brumeval est devenue toute rouge ! Les poissons
   se cachent, les lavandières crient, et tout le village a peur. » Le film montre cela, et rien de plus :
   — au début on croit que c'est le soleil levant qui rosit l'eau : c'est beau, c'est calme. Une lavandière plonge son drap blanc…
     il ressort ROUGE. Le soleil monte, la lumière redevient normale, et l'eau reste rouge ;
   — la caméra ne quitte jamais le lavoir : jamais l'amont, jamais le moulin, jamais la charrette. Ni Bastien, ni l'homme en cape ;
   — les villageois qui accourent ont tous la même peur : les suspects de l'enquête (Mélusine, Margot, Iris, Farinel) sont dans la
     foule comme les autres, jamais en gros plan ; Odette n'y est pas.

   Huit plans, 38 secondes et demie. Le plateau : plateau-village.js (le coin 'riviere' : on est sur l'eau, on regarde la berge). */
(function(){
'use strict';
var U = window.CU, FX = window.CFX, FV = window.CFXV, PV = window.PLATEAU_VILLAGE, GD = window.GensDebut, G = window.Gens, O = CINE.O, cligne = O.cligne, parle = O.parle, D = CINE.DEB;
var XR = PV.X.riviere, W = 1440, H = 616, P = 1600, YEAU = 76, NOIR = '#1a0e08';

/* ---------------------------------------------------------------- LE DÉROULÉ (en secondes) */
var T1 = 6.0, T2 = 10.4, T3 = 14.8, T4 = 18.8, T5 = 23.6, T6 = 29.0, T7 = 33.4, TITRE = 35.2, T = 38.6;
var LIGNES = [[19.7, 23.3, 'La rivière… Elle est toute rouge !', 'La lavandière']];
var LX = XR - 620, LZ = -70;            /* la place de la lavandière, à genoux au bord du quai */
var TROUEE = XR - 150, FOND_Z = -4600;  /* le chemin entre les deux rangées de maisons : le soleil se lève au bout */

/* le linge dans la main : un drap blanc en boule, qui pend ; o.lingeRouge (0 → 1) : il est taché */
G.OBJETS.linge = {
  angle:function(){ return 0; },
  dessin:function(o){
    var r = o.lingeRouge || 0, id = 'lingeM' + Math.round(r * 10);
    return '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf8f0"/><stop offset="' + U.r(.6 - r * .45) + '" stop-color="' + (r > .3 ? '#f0c4c0' : '#efe8dc') + '"/><stop offset="1" stop-color="' + (r > .3 ? '#b8202e' : '#d8d2c2') + '"/></linearGradient>' +
      '<path d="M-40 -18 C -20 -34 30 -32 46 -14 C 58 30 50 90 56 150 C 30 164 14 140 -6 158 C -26 170 -40 150 -52 156 C -50 100 -56 40 -40 -18 Z" fill="url(#' + id + ')" stroke="' + NOIR + '" stroke-width="2.4" stroke-linejoin="round"/>' +
      '<path d="M-20 -10 C -24 40 -16 100 -22 150 M14 -14 C 20 40 10 100 16 148" fill="none" stroke="' + (r > .3 ? '#8a3038' : '#b8b2a2') + '" stroke-width="2" opacity=".6"/>';
  }
};

/* ---------------------------------------------------------------- L'HEURE : j = 0 (avant l'aube) → 0,5 (le soleil sort) → 1 (le jour) */
function heure(t){ return U.piste([[0, 0, 'l'], [1.0, .03, 'l'], [T1, .5, 'io'], [T3, .62, 'l'], [T4 - .01, .8, 'l'], [T4, 1, 'pas'], [T, 1, 'l']])(t); }
/* LE SOLEIL se lève toujours du même côté (un peu à droite, dans le creux des collines) ; il sort des collines vers 3,5 s */
var SOLEIL_AZ = .13, SORT = .049;
function c3(a, b, c){ return FV.couleur([[0, a], [.5, b], [1, c]]); }
var C_HAUT = c3([28, 38, 88], [80, 110, 170], [62, 126, 214]), C_MILIEU = c3([112, 84, 128], [232, 170, 150], [148, 190, 234]), C_BAS = c3([240, 128, 94], [255, 206, 140], [224, 236, 242]),
    C_AMB = c3([118, 112, 160], [220, 190, 180], [255, 250, 242]), C_LUEUR = c3([255, 150, 100], [255, 220, 150], [255, 250, 230]), C_N1 = c3([74, 66, 112], [178, 146, 180], [255, 255, 255]), C_N2 = c3([255, 140, 108], [255, 182, 130], [234, 240, 248]),
    C_REFLET = c3([190, 124, 140], [255, 184, 132], [214, 228, 244]);
function ciel(t, cam){
  var j = heure(t), az = SOLEIL_AZ, alt = U.piste([[0, .012, 'l'], [.2, .046, 'l'], [.5, .078, 'l'], [.62, .092, 'l'], [.8, .115, 'l'], [1, .2, 'l']])(j);
  ALT = alt;
  return {haut:C_HAUT(j), milieu:C_MILIEU(j), bas:C_BAS(j), lueur:{az:az, c:C_LUEUR(j), k:U.lerp(.95, .3, U.clamp((j - .5) * 2, 0, 1)), l:.8, h:.26},
    astre:{az:az, alt:alt, r:.026, c:[255, 252, 234], halo:j < .9 ? [255, 210, 140] : [255, 250, 226], k:U.clamp((alt + .03) / .03, 0, 1)}, etoiles:U.clamp(.7 - j * 2.6, 0, 1), nuages:{c1:C_N1(j), c2:C_N2(j), k:.85, vit:5}};
}
var ALT = 0;
/* le soleil est-il sorti des collines ? (0 → 1) */
function leve(){ return U.clamp((ALT - SORT) / .024, 0, 1); }
/* la carte des lumières : à l'aube, le chemin de soleil qui sort d'entre les maisons, et la berge encore bleue ; de jour, plus rien à ajouter */
function lampes(t, plus){
  var j = heure(t), a = U.clamp(1 - (j - .62) * 4, 0, 1) * leve(), L = 4700, nx = TROUEE - L * Math.sin(SOLEIL_AZ), nz = FOND_Z + L * Math.cos(SOLEIL_AZ);
  return (a > 0 ? FV.forme([[TROUEE - 500, 0, FOND_Z], [TROUEE + 500, 0, FOND_Z], [nx + 2400, 0, nz], [nx - 2400, 0, nz]], [255, 228, 180], .7 * a, 18) + FV.rondMonde(TROUEE + 500, -900, FOND_Z, 3200, [255, 228, 184], .7 * a) : '') + (plus || '');
}
var PLANS_AUBE = {maisonsG:{teinte:'brightness(.68) saturate(.9)'}, maisonsD:{teinte:'brightness(.68) saturate(.9)'}, arbresLoin:{teinte:'brightness(.76)'}, grandArbre:{teinte:'brightness(.7)'}, lavoir:{teinte:'brightness(.78)'}, buisson1:{teinte:'brightness(.8)'}, buisson2:{teinte:'brightness(.8)'}};
function plansDe(t){ return heure(t) < .9 ? PLANS_AUBE : null; }
/* l'eau de cette image (son corps va sous les personnages, ses éclats dans la couche des lumières) */
function eauDe(t, o){
  var j = heure(t), A = PV.ASTRE;
  /* à l'aube, l'eau a l'air d'une eau sombre où le ciel rose se reflète ; son rouge ne se voit vraiment qu'au grand jour */
  var rj = U.clamp((j - .55) / .3, 0, 1);
  return FV.eau(t, U.melange({y:YEAU, z0:0, loin:FV.mel([150, 84, 96], [158, 26, 32], rj), pres:FV.mel([64, 34, 62], [86, 8, 16], rj), reflet:C_REFLET(j), refletK:U.piste([[0, .8, 'l'], [.5, .8, 'l'], [.8, .5, 'l'], [1, .13, 'l']])(j),
    soleil:A && leve() > 0 ? {x:A.x, k:leve() * (j < .9 ? 1 : .55), c:j < .9 ? '#ffe0b0' : '#fff6e6', l:j < .9 ? 1 : .7} : null, brumeK:U.clamp(1 - j * 1.5, 0, 1), brumeC:j < .3 ? '#d8c8e0' : '#ffe0d0'}, o || {}, 1));
}
/* le soleil dans l'objectif : avant qu'il sorte, seulement ses rayons qui montent de derrière les collines ; puis le disque, le halo, les reflets */
function soleil(t, k, rayons){
  var A = PV.ASTRE; if(!A) return '';
  var l = leve(), avant = U.clamp((ALT - .02) / .02, 0, 1) * (1 - l), yc = Math.min(A.y, A.yh - SORT * P + 10);
  return (avant > 0 ? FV.rayons(t, A.x, yc + 30, .5 * avant, {a0:200, a1:340, l:700, n:9, graine:9, c:'#ffc890'}) : '') +
    (l > 0 ? FV.soleil(A.x, A.y, A.r, k * l) + FV.rayons(t, A.x, A.y, k * l * (rayons == null ? .7 : rayons), {a0:190, a1:350, l:800, n:9, graine:9}) + FV.rayons(t, A.x, A.y, k * l * (rayons == null ? .6 : rayons * .8), {a0:20, a1:160, l:1100, n:9}) + FV.reflets(t, A.x, A.y, k * l * .6) : '');
}

/* ---------------------------------------------------------------- LA LAVANDIÈRE */
/* à genoux : k (0 : debout → 1 : à genoux), penchée vers l'eau (pk) */
function genoux(p, k, pk){
  p.w = [p.w[0], U.lerp(p.w[1], -130, k)]; p.jD = {p:[p.jD.p[0] + 6 * k, 0], g:k}; p.jG = {p:[p.jG.p[0] - 6 * k, 0], g:k};
  if(pk){ p.tk = 1 - .16 * pk; p.tete.k = (p.tete.k || 0) + 16 * pk; p.w = [p.w[0], p.w[1] + 10 * pk]; }
  return p;
}
function lavandiere(t, p, x, z, o, plus){ return D.acteur(t, 'lavandiere', x, z, p, o || {}, 'contre', U.melange({ombreLongue:heure(t) < .9 && leve() > 0 ? {vx:-Math.tan(SOLEIL_AZ) * 2.4, vz:2.4, op:.3 * leve(), flou:6} : null}, plus || {}, 1)); }
function panierPose(x, z){ return D.libre(x, 0, z, '<g transform="translate(-16 -60)">' + G.OBJETS.panier.dessin() + '</g>', [120, 200], {relief:'Contre'}); }

/* ================================================================ 1. L'AUBE (0 → 6 s) : la rivière, la brume, le soleil qui sort ; la lavandière descend au lavoir */
function plan1(t){
  var k = U.lisse(t / T1), cam = {x:XR + U.lerp(-1900, -900, k), y:U.lerp(-170, -210, k), z:U.lerp(3500, 3100, k), tangage:.02, focus:U.lerp(3800, 3300, k), ouverture:.45};
  /* elle arrive par le pré, son panier sur la hanche */
  var a = U.clamp((t - 1.2) / 4.6, 0, 1), p = D.base('lavandiere'), x = U.lerp(XR + 700, LX + 40, U.lisse(a)), z = U.lerp(-2300, LZ - 60, a);
  if(a < 1) D.pas(p, t * 1.9, .9);
  p.bG = {a:38, c:96}; D.visage(p, D.V.sourire); D.vivant(p, t, 41);
  var eau = null;
  return {zone:'riviere', cam:cam, acteurs:[lavandiere(t, p, x, z, {tient:{G:'panier'}})], portee:.5, poussiere:0, ambiance:C_AMB(heure(t)), plans:plansDe(t), ciel:ciel(t, cam),
    sol:function(){ eau = eauDe(t); return eau.corps; }, lampes:function(){ return lampes(t); },
    lumieres:function(){ return eau.lum + soleil(t, .95, .9) + FV.poussiere(t, [XR - 2600, -700, -1500, XR + 900, -40, 1800], 60, 7, '#ffe6c0', .6 * U.clamp(heure(t) * 3, 0, 1)); },
    devant:function(){ return FV.oiseaux(t, 2.6, XR + 2100, -2700, -1500, 7, 73, {dx:1500, gauche:.9, c:'#1a1420'}); },
    avant:function(){ return GD.roseaux(t, -1, 5) + GD.roseaux(t, 1, 9, .8); }};
}

/* ================================================================ 2. AU LAVOIR (6 → 10,4 s) : elle pose son panier, s'agenouille, plonge le drap */
function plan2(t){
  var a = t - T1, k = U.lisse(a / (T2 - T1));
  var cam = {x:LX + U.lerp(200, 60, k), y:U.lerp(-250, -200, k), z:U.lerp(1250, 960, k), tangage:U.lerp(-.05, -.075, k), focus:U.lerp(1330, 1040, k), ouverture:1.1};
  var p = D.base('lavandiere'), ag = U.tresLisse(U.clamp((a - .5) / 1.0, 0, 1)), plonge = U.tresLisse(U.clamp((a - 2.0) / .8, 0, 1)), frotte = U.clamp((a - 2.9) / .4, 0, 1);
  genoux(p, ag, .35 * ag + .65 * plonge);
  /* le drap dans ses deux mains : devant elle, puis dans l'eau (elle frotte) */
  var my = U.lerp(p.w[1] - 40, 38, plonge) + Math.sin(a * 9) * 9 * frotte, mx = Math.sin(a * 9 + 1) * 14 * frotte, pris = U.lisse(U.clamp((a - 1.3) / .5, 0, 1));
  if(pris > 0){ p.bD = {cible:[26 + mx, my], ik:pris, devant:true}; p.bG = {cible:[-26 + mx, my + 4], ik:pris, devant:true}; }
  D.visage(p, D.V.sourire); p.v = U.melange(p.v, {yeux:{ly:.5 * ag + .4 * plonge}}, 1); D.vivant(p, t, 41, {regard:0});
  var eau = null, A = [lavandiere(t, p, LX, LZ, {tient:pris > .5 ? {D:'linge'} : {}, lingeRouge:0}), panierPose(LX + 270, LZ - 30)];
  return {zone:'riviere', cam:cam, acteurs:A, portee:.6, poussiere:0, ambiance:C_AMB(heure(t)), plans:plansDe(t), ciel:ciel(t, cam),
    sol:function(){ eau = eauDe(t); return eau.corps; }, lampes:function(){ return lampes(t, FV.rondMonde(LX, -240, LZ, 700, [246, 226, 214], .55)); },
    lumieres:function(){ return eau.lum + soleil(t, .7, .5) + FV.poussiere(t, [LX - 900, -700, -700, LX + 900, -30, 500], 50, 11, '#ffe6c0', .8) + FV.bokehs(t, 6, .4, 'Or', 51, [0, 0, W, 260]); }};
}

/* ================================================================ 3. LE DRAP (10,4 → 14,8 s), en très gros plan : il sort de l'eau, rouge */
function plan3(t){
  var a = t - T2;
  return {zone:'riviere', cam:{x:LX, y:-240, z:800, focus:880, ouverture:1}, acteurs:[], portee:0, poussiere:0, ambiance:[255, 255, 255], ciel:ciel(t, {x:LX, z:800}),
    avant:function(){ return GD.insertDrap(t, a, U.lerp(1, .7, a / (T3 - T2))) + FV.bokehs(t, 6, .45, 'Rose', 53, [0, 0, W, 300]); }};
}

/* ================================================================ 4. SON VISAGE (14,8 → 18,8 s) : elle ne comprend pas, elle regarde l'eau… le soleil monte, et l'eau reste rouge */
function plan4(t){
  var a = t - T3, k = U.lisse(a / (T4 - T3));
  var p = D.base('lavandiere'); genoux(p, 1, .25);
  var doute = U.lisse(U.clamp((a - .2) / .7, 0, 1)), regarde = U.lisse(U.clamp((a - 1.3) / .5, 0, 1)), peur = U.lisse(U.clamp((a - 2.2) / .6, 0, 1));
  D.visage(p, U.melange(D.V.sourire, {sourcils:{f:.5, l:.3, t:.5}, yeux:{o:.95}, bouche:{c:-.3, o:.06}}, doute)); D.visage(p, D.V.peur, peur);
  p.tete.k = U.lerp(6, 20, regarde) - 14 * peur; p.v = U.melange(p.v, {yeux:{ly:U.lerp(.5, .95, regarde) - .5 * peur, lx:peur * Math.sin(a * 5) * .5}}, 1);
  /* elle tient le drap rouge devant elle, à deux mains ; puis ses mains tremblent */
  var cy = p.w[1] + G.D.lavandiere.cou[1] + 110, tr = peur * Math.sin(t * 34) * 3;
  p.bD = {cible:[30 + tr, cy], ik:1, devant:true}; p.bG = {cible:[-30 - tr, cy + 4], ik:1, devant:true};
  D.vivant(p, t, 41, {regard:0, souffle:.5 + peur});
  var yeux = p.w[1] + G.D.lavandiere.cou[1] - 60, z = U.lerp(470, 380, k);
  var cam = {x:LX + U.lerp(26, -10, k), y:yeux + .12 * H * z / P, z:LZ + z, focus:z, ouverture:1.5};
  var eau = null, rouge = U.clamp((heure(t) - .6) * 5, 0, 1);
  var act = lavandiere(t, p, LX, LZ, {tient:{D:'linge'}, lingeRouge:1}, {ombre:false});
  /* le reflet rouge de l'eau lui monte au visage, par en dessous */
  act.lum.rims.push([0, .5, .9 * rouge / (FX.lueur(t, 1) * (FX.flare || 1)), '#ff4a3a']);
  return {zone:'riviere', cam:cam, acteurs:[act], portee:.6, poussiere:0, ambiance:C_AMB(heure(t)), plans:plansDe(t), ciel:ciel(t, cam),
    sol:function(){ eau = eauDe(t); return eau.corps; },
    lampes:function(){ var q = CAM.projeter(LX, yeux + 40, LZ); return lampes(t, FV.rond(q.x, q.y, 300, 330, [250, 232, 220], .6)) + reflets(t, q.x - 230, q.y - 60, 460, 330, rouge * .8); },
    lumieres:function(){ return eau.lum + soleil(t, .55, .3) + FV.bokehs(t, 6, .4, 'Rose', 57); }};
}
/* les reflets rouges de l'eau, dans la carte des lumières : des taches qui dansent et qui rougissent ce qu'elles touchent */
function reflets(t, x, y, w, h, k){
  if(!(k > 0)) return '';
  var R = U.hasard(97), s = '';
  for(var i = 0; i < 9; i++){ var px = x + R() * w + Math.sin(t * (1.2 + R()) + R() * 6) * w * .1, py = y + (.35 + R() * .65) * h + Math.cos(t * (1.5 + R()) + R() * 6) * h * .08, op = k * (.35 + .65 * Math.pow(Math.max(0, Math.sin(t * (1.8 + R() * 2) + R() * 6)), 2));
    s += FV.rond(px, py, w * (.1 + R() * .12), h * (.05 + R() * .06), [255, 150, 140], op * .8); }
  return s;
}

/* ================================================================ 5. « ELLE EST TOUTE ROUGE ! » (18,8 → 23,6 s) : le plein jour, vu de haut — la rivière est rouge d'un bord à l'autre */
var BX = XR + 820, BZ = -230;   /* Basile, qui venait chercher de l'eau */
function seauQuiTombe(t, t0){
  var a = t - t0; if(a < 0) return null;
  var chute = U.clamp(a / .28, 0, 1), y = -150 * (1 - chute * chute), roule = U.clamp((a - .28) / 1.4, 0, 1), x = BX + 110 + 260 * U.COURBES.o(roule), rot = 96 * U.COURBES.o(U.clamp((a - .28) / .5, 0, 1)) + 40 * roule;
  return D.libre(x, y - 14 * Math.abs(Math.sin(roule * 9)) * (1 - roule), BZ + 40, '<g transform="rotate(' + U.r(rot) + ' 0 -60)">' + GD.seau(0) + '</g>', [140, 400], {relief:'Soleil'});
}
function flaque(t, t0){
  var a = t - t0 - .3; if(a < 0) return '';
  var k = U.COURBES.o(U.clamp(a / 1.2, 0, 1)), c = CAM.projeter(BX + 330, 0, BZ + 60), ax = CAM.projeter(BX + 330 + 240 * k, 0, BZ + 60), b1 = CAM.projeter(BX + 330, 0, BZ + 160 * k + 60), b2 = CAM.projeter(BX + 330, 0, BZ + 60 - 90 * k);
  return '<ellipse cx="' + U.r(c.x) + '" cy="' + U.r((b1.y + b2.y) / 2) + '" rx="' + U.r(Math.abs(ax.x - c.x)) + '" ry="' + U.r(Math.max(1, Math.abs(b1.y - b2.y) / 2)) + '" fill="#2a3a30" opacity=".5"/>';
}
function poseLavDebout(t, a, x0){
  /* elle se relève d'un bond, recule de deux pas, les mains aux joues */
  var p = D.base('lavandiere'), leve = U.COURBES.dep(U.clamp(a / .4, 0, 1)), recule = U.lisse(U.clamp((a - .3) / .9, 0, 1));
  genoux(p, 1 - leve, 0);
  if(recule > 0 && recule < 1) D.pas(p, a * 3.4, 1);
  D.visage(p, D.V.peur);
  var cy = p.w[1] + G.D.lavandiere.cou[1], sur = U.COURBES.dep(U.clamp(a / .3, 0, 1)), m = U.lisse(U.clamp((a - 1.0) / .5, 0, 1));
  /* le sursaut : les deux mains levées, ouvertes ; puis elle les porte à ses joues */
  p.bD = {a:20 * sur, c:160 * sur, l2:U.lerp(1, .8, sur), devant:true}; p.bG = {a:20 * sur, c:160 * sur, l2:U.lerp(1, .8, sur), devant:true}; p.poingD = p.poingG = 'ouvert';
  if(m > 0){ p.bD = {a:20, c:160, cible:[30, cy - 24], ik:m, coudeEnHaut:true, devant:true}; p.bG = {a:20, c:160, cible:[-30, cy - 24], ik:m, coudeEnHaut:true, devant:true}; if(m > .6) p.poingD = p.poingG = 'poing'; }
  p.tete.k = 10; p.v = U.melange(p.v, {yeux:{ly:.6}}, 1);
  D.vivant(p, t, 41, {souffle:1.2, regard:0});
  return {p:p, z:U.lerp(LZ, LZ - 250, recule)};
}
function plan5(t){
  var a = t - T4, k = U.lisse(a / (T5 - T4));
  var cam = {x:XR + U.lerp(40, 160, k), y:U.lerp(-820, -760, k), z:U.lerp(3100, 2800, k), tangage:U.lerp(-.225, -.235, k), focus:U.lerp(3300, 3000, k), ouverture:.35};
  var L = poseLavDebout(t, a), b = parle(t, LIGNES[0][0], LIGNES[0][1] - .6, 5);
  if(b) L.p.v = U.melange(L.p.v, {bouche:{o:b.o * 1.3 + .1, w:b.w, c:-.4, cri:.4}}, 1);
  /* Basile arrive avec son seau, s'arrête net, le lâche */
  var pb = D.base('basile'), arr = U.clamp(a / 1.4, 0, 1), LACHE = T4 + 1.75, tenu = t < LACHE;
  if(arr < 1){ D.pas(pb, a * 2.1, 1); D.visage(pb, D.V.attend); } else { D.visage(pb, D.V.surpris); pb.tete.k = 8; pb.v = U.melange(pb.v, {yeux:{ly:.6}}, 1); }
  if(!tenu){ var ou = U.lisse(U.clamp((t - LACHE) / .3, 0, 1)); pb.bD = {a:U.lerp(10, 48, ou), c:U.lerp(-14, 30, ou)}; pb.bG = {a:U.lerp(10, 44, ou), c:U.lerp(-14, 26, ou)}; pb.poingD = pb.poingG = 'ouvert'; }
  D.vivant(pb, t, 43, {souffle:arr < 1 ? .5 : 1.1});
  var A = [lavandiere(t, L.p, LX, L.z, {}), panierPose(LX + 270, LZ - 30), D.libre(LX + 30, 0, -4, GD.drapPose(1), [200, 200]),
    D.acteur(t, 'basile', U.lerp(XR + 1900, BX, U.lisse(arr)), BZ, pb, {tient:tenu ? {D:'seau'} : {}}, 'face')];
  var s = seauQuiTombe(t, LACHE); if(s) A.push(s);
  var eau = null;
  return {zone:'riviere', cam:cam, acteurs:A, portee:.8, poussiere:0, ambiance:C_AMB(1), ciel:ciel(t, cam),
    sol:function(){ eau = eauDe(t); return eau.corps + flaque(t, LACHE); }, lampes:function(){ return ''; },
    lumieres:function(){ return eau.lum + soleil(t, .8, .5); }};
}

/* ================================================================ 6. LE VILLAGE ACCOURT (23,6 → 29 s) */
var VILLAGE = [
  {n:'gaspard', x:-1380, z:-110, g:2, t0:.5, tient:{D:'rouleau'}, geste:1}, {n:'victor', x:-1000, z:-150, g:6, t0:1.5, geste:2}, {n:'lavandiere2', x:-220, z:-130, g:11, t0:.2, geste:4},
  {n:'silas', x:230, z:-120, g:5, t0:2.2, geste:3}, {n:'fortune', x:1300, z:-160, g:8, t0:1.1, geste:2}, {n:'iris', x:1720, z:-230, g:1, t0:1.9, geste:0},
  {n:'margot', x:-1700, z:-470, g:3, t0:1.7, geste:0}, {n:'farinel', x:-640, z:-520, g:9, t0:2.4, geste:1}, {n:'melusine', x:560, z:-500, g:7, t0:2.7, geste:0}, {n:'victor', x:1560, z:-640, g:16, t0:2.9, geste:1, fig:1}, {n:'lavandiere', x:-1200, z:-760, g:15, t0:3.1, geste:0, fig:1}
];
/* la peur de chacun : les mains aux joues (0), une main devant la bouche (1), le doigt tendu vers l'eau (2), les bras écartés pour retenir les autres (3) */
function effroi(p, t, c, k){
  var cy = p.w[1] + G.D[c.n].cou[1];
  D.visage(p, D.V.peur, k); p.tete.k = (p.tete.k || 0) + 9 * k; p.v = U.melange(p.v, {yeux:{ly:.55 * k}}, 1);
  if(c.geste === 0){ p.bD = {a:20 * k, c:160 * k, l2:U.lerp(1, .8, k), devant:true}; p.bG = {a:20 * k, c:160 * k, l2:U.lerp(1, .8, k), devant:true}; p.poingD = p.poingG = 'ouvert'; }
  else if(c.geste === 4){ p.bD = {a:20, c:160 * k, cible:[30, cy - 24], ik:k, coudeEnHaut:true, devant:true}; p.bG = {a:20, c:160 * k, cible:[-30, cy - 24], ik:k, coudeEnHaut:true, devant:true}; }
  else if(c.geste === 1){ p.bG = {cible:[-4, cy - 34], ik:k, devant:true, a:40, c:80}; }
  else if(c.geste === 2){ p.bD = {cible:[38, cy + 150], ik:k, devant:true, a:20, c:10}; p.poingD = 'pointe'; }
  else { p.bD = {a:U.lerp(10, 78, k), c:8}; p.bG = {a:U.lerp(10, 78, k), c:8}; p.poingD = p.poingG = 'ouvert'; }
}
function acteursVillage(t, a){
  return VILLAGE.map(function(c){
    var p = D.base(c.n), arr = U.clamp((a - c.t0) / 2.0, 0, 1), x = XR + c.x + (1 - U.lisse(arr)) * (c.x < 0 ? -300 : 300), z = U.lerp(-3300 - c.g * 40, c.z, U.COURBES.o(arr));
    if(arr < 1){ D.pas(p, (t + c.g * .21) * 3.3, 1, true); D.visage(p, D.V.inquiet); p.bD = {a:26, c:80 + Math.sin(t * 10 + c.g) * 30}; p.bG = {a:26, c:80 - Math.sin(t * 10 + c.g) * 30}; }
    else effroi(p, t, c, U.lisse(U.clamp((a - c.t0 - 2.0) / .45, 0, 1)));
    D.vivant(p, t, c.g, {souffle:1.1});
    return D.acteur(t, c.n, x, z, p, {tient:c.tient || {}, graine:c.g}, 'face', {_c:c, ombreOp:.55});
  });
}
function decorBerge(t, a){
  var L = poseLavDebout(t, 9), pb = D.base('basile'); D.visage(pb, D.V.surpris); pb.bD = {a:48, c:30}; pb.bG = {a:44, c:26}; pb.poingD = pb.poingG = 'ouvert'; pb.tete.k = 8; D.vivant(pb, t, 43, {souffle:1});
  return [lavandiere(t, L.p, LX, L.z, {}), panierPose(LX + 270, LZ - 30), D.libre(LX + 30, 0, -4, GD.drapPose(1), [200, 200]), D.acteur(t, 'basile', BX, BZ, pb, {}, 'face'), D.libre(BX + 370, 0, BZ + 40, '<g transform="rotate(136 0 -60)">' + GD.seau(0) + '</g>', [140, 300], {relief:'Soleil'})];
}
function plan6(t){
  var a = t - T5, k = U.lisse(a / (T6 - T5));
  var cam = {x:XR + U.lerp(260, -160, k), y:U.lerp(-520, -470, k), z:U.lerp(2700, 2300, k), tangage:U.lerp(-.14, -.125, k), focus:U.lerp(2850, 2450, k), ouverture:.45};
  var eau = null;
  return {zone:'riviere', cam:cam, acteurs:decorBerge(t, a).concat(acteursVillage(t, a)), portee:.9, poussiere:0, ambiance:C_AMB(1), ciel:ciel(t, cam),
    sol:function(){ eau = eauDe(t); return eau.corps; }, lampes:function(){ return ''; },
    lumieres:function(){ return eau.lum + soleil(t, .8, .5); },
    devant:function(){ return FV.oiseaux(t, T5 + .4, XR - 2600, -2600, -1500, 9, 79, {dx:1500, gauche:.2}); }};
}

/* ================================================================ 7. LES VISAGES (29 → 33,4 s) : la caméra glisse le long du quai ; le rouge de l'eau danse sur eux */
function plan7(t){
  var a = t - T6, k = U.lisse(a / (T7 - T6));
  var cam = {x:XR + U.lerp(-1640, -60, k), y:-402, z:U.lerp(900, 860, k), focus:U.lerp(1030, 990, k), ouverture:1.3};
  var A = decorBerge(t, 9).concat(acteursVillage(t, 9));
  A.forEach(function(q){ if(q.lum && q.lum.rims) q.lum.rims.push([0, .45, .8 / (FX.lueur(t, 1) * (FX.flare || 1)), '#ff4a3a']); });
  var eau = null;
  return {zone:'riviere', cam:cam, acteurs:A, portee:.6, poussiere:0, ambiance:C_AMB(1), ciel:ciel(t, cam),
    sol:function(){ eau = eauDe(t); return eau.corps; }, lampes:function(){ return reflets(t, 0, H * .2, W, H * .75, .75); },
    lumieres:function(){ return eau.lum + soleil(t, .7, .4) + FV.bokehs(t, 7, .35, 'Rose', 59, [0, 300, W, H]); }};
}

/* ================================================================ 8. LA RIVIÈRE ROUGE (33,4 → la fin) : on recule au ras de l'eau ; le drap s'en va au fil du courant */
function drapFlottant(t, x, z){
  var pts = [], pts2 = [], n = 18;
  for(var i = 0; i < n; i++){ var an = i / n * 6.283, r = 1 + .22 * Math.sin(an * 3 + 1) + .12 * Math.sin(an * 5 + t * .7), on = Math.sin(t * 2 + an * 2) * 5;
    var q = CAM.projeter(x + Math.cos(an) * 250 * r, YEAU - 3 + on * .3, z + Math.sin(an) * 150 * r), q2 = CAM.projeter(x + 40 + Math.cos(an) * 150 * r, YEAU - 4, z + 10 + Math.sin(an) * 84 * r);
    pts.push(U.r(q.x) + ' ' + U.r(q.y)); pts2.push(U.r(q2.x) + ' ' + U.r(q2.y)); }
  var c = CAM.projeter(x, YEAU, z), f = CAM.flou(c.d);
  return (f > 1 ? '<g style="filter:blur(' + U.r(Math.min(20, f * .6)) + 'px)">' : '<g>') + '<path d="M' + pts.join(' L ') + ' Z" fill="#f4dcd8" stroke="#5a0a14" stroke-width="' + U.r(Math.max(.8, 3 * c.s)) + '" stroke-linejoin="round"/><path d="M' + pts2.join(' L ') + ' Z" fill="#d0525a" opacity=".8"/><path d="M' + pts.slice(2, 8).join(' L ') + '" fill="none" stroke="#fff" stroke-width="' + U.r(Math.max(.6, 4 * c.s)) + '" opacity=".6"/></g>';
}
function plan8(t){
  var a = t - T7, k = U.lisse(a / (T - T7));
  var cam = {x:XR + U.lerp(-260, -120, k), y:U.lerp(-150, -64, k), z:U.lerp(1700, 3300, k), tangage:U.lerp(-.02, .012, k), focus:U.lerp(1900, 3000, k), ouverture:.5};
  var eau = null;
  return {zone:'riviere', cam:cam, acteurs:decorBerge(t, 9).concat(acteursVillage(t, 9)), portee:.5, poussiere:0, ambiance:C_AMB(1), ciel:ciel(t, cam),
    sol:function(){ eau = eauDe(t, {rides:1.2}); return eau.corps + drapFlottant(t, XR - 500 + a * 150, U.lerp(700, 1500, k)); }, lampes:function(){ return ''; },
    lumieres:function(){ return eau.lum + soleil(t, .8, .5); },
    avant:function(){ return GD.roseaux(t, -1, 15, .9) + GD.roseaux(t, 1, 19, .8) + FV.titre(t, TITRE, 'La rivière rouge', {sous:'ENQUÊTE 2', y:214, taille:104, voile:.25}); }};
}

CINE.films.debut2 = {
  nom:'La rivière rouge — le début', plateau:'village', duree:T, defs:FV.defs,
  sons:[[.1, 'cineRiviere'], [.4, 'cineOiseaux'], [2.3, 'cineCoq'], [4.6, 'cineRiviere'], [T1 + .1, 'cineOiseaux'], [T1 + 2.2, 'cineLinge'], [T1 + 3.1, 'cineLinge'], [T2 + .1, 'cineRiviere'], [T2 + .25, 'cineLinge'], [T2 + 1.6, 'cineGouttes'],
    [T3 + 2.2, 'cineSursaut'], [T4 + .05, 'cineCriFemme'], [T4 + .2, 'cineRiviere'], [T4 + 2.05, 'cineSeau'], [T5 + .1, 'cineCourse'], [T5 + 1.4, 'cineCourse'], [T5 + 2.6, 'cineOh'], [T5 + 3.9, 'cineOh'], [T5 + 4.4, 'cineRiviere'],
    [T6 + .3, 'cineMurmure'], [T6 + 2.4, 'cineMurmure'], [T7 + .1, 'cineRiviere'], [T7 + 2.4, 'cineVent']],
  sousTitres:LIGNES,
  etat:function(t){
    PV.prepare('riviere');
    var E = t < T1 ? plan1(t) : t < T2 ? plan2(t) : t < T3 ? plan3(t) : t < T4 ? plan4(t) : t < T5 ? plan5(t) : t < T6 ? plan6(t) : t < T7 ? plan7(t) : plan8(t);
    return D.fondus(E, t, T, [[T2, .14, '#ffe6d0'], [T3, .14, '#ffe6d0'], [T4, .12, '#ffffff']]);
  }
};
})();
