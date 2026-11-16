/* film-chene-2.js — LE RASSEMBLEMENT AU VIEUX CHÊNE, la suite (film-chene.js : les plans 1 à 5) : les villageois pétrifiés,
   le maire qui accourt, Silas et le maire devant la fumée, la fuite, les yeux dans l'ombre — et le film entier (CINE.films.chene). */
(function(){
'use strict';
var U = window.CU, FX = window.CFX, FC = window.CFXC, O = CINE.O, plans = O.plans, copie = O.copie, respire = O.respire, cligne = O.cligne, BASE = O.BASE;
var K = CINE._chene, TT = K.T, FOULE = K.FOULE, base = K.base, pas = K.pas, visage = K.visage, tousse = K.tousse, porte = K.porte, acteurV = K.acteurV, lumieresDe = K.lumieresDe, dit = K.dit;
var XF = 0, XC = 9000, XD = 18000;
var CHOC = TT.CHOC, GROS2 = TT.GROS2, MAIRE = TT.MAIRE, CRIE = TT.CRIE, GROS3 = TT.GROS3, PARLE = TT.PARLE, GROS4 = TT.GROS4, LARGE = TT.LARGE, FUITE = TT.FUITE, YEUX = TT.YEUX, PFFT = TT.PFFT, T = TT.T;
var CZ = -200;      /* où la foule s'est arrêtée, devant le chêne (le premier rang) */

/* ================================================================ 6. LES VILLAGEOIS, PÉTRIFIÉS (28,8 → 33,8 s) */
function poseChoc(c, t){
  var p = base(c.n); p._n = c.n; porte(p, c);
  /* chacun sursaute avec un petit retard, puis reste figé, la bouche ouverte */
  var d = (c.g % 5) * .08, k = U.COURBES.dep(U.clamp((t - CHOC - .12 - d) / .32, 0, 1)), kk = U.clamp(k, 0, 1.15);
  visage(p, U.melange(U.melange(K.VV, K.DECIDE, 1), U.melange(K.VV, c.g % 3 === 0 ? K.PEUR : K.CHOQUE, 1), U.clamp(kk, 0, 1)));
  p.t = -5 * kk; p.tete.k = -4 * kk; p.w = [p.w[0], p.w[1] - 6 * kk];
  /* le bras libre monte (une main devant la bouche, ou les deux mains levées) ; la lumière qu'on porte retombe */
  ['D', 'G'].forEach(function(s){
    var q = c.tient[s], sg = s === 'D' ? 1 : -1;
    if(!q){
      if(c.g % 2){ p['b' + s] = {ik:kk > .05 ? U.clamp(kk, 0, 1) : 0, cible:[sg * 14, p.w[1] + Gens.D[c.n].cou[1] - 16], a:11, c:-16, l1:1, l2:1, devant:kk > .5}; p['poing' + s] = 'ouvert'; }
      else { p['b' + s] = {a:11 + 62 * kk, c:-16 + 96 * kk, l1:1, l2:1}; p['poing' + s] = kk > .4 ? 'ouvert' : 'poing'; }
    }
    else if(q === 'torche') p['b' + s].a -= 22 * kk;
    else if(q === 'rouleau'){ p['b' + s].a -= 92 * kk; p['b' + s].c -= 30 * kk; }
    else { p['b' + s].a -= 12 * kk; p['b' + s].c -= 22 * kk; }
  });
  respire(p, t, .35 * U.clamp(kk, 0, 1), 1.1, c.g + 50);
  p.v.yeux.cl = t < CHOC + .6 ? 0 : cligne(t, c.g * .9) * .8;
  return p;
}
var SRC_FOULE = [
  {x:XF - 1700, y:-130, z:CZ + 800, t0:PFFT + 2.2, debit:5, vie:11, jet:[300, -40, -260], ouvert:.7, etale:400, monte:40, r0:70, r1:440, dense:.3, graine:41, gonfle:.4},
  {x:XF + 1700, y:-130, z:CZ + 900, t0:PFFT + 2.6, debit:5, vie:11, jet:[-300, -40, -260], ouvert:.7, etale:400, monte:40, r0:70, r1:440, dense:.3, graine:43, gonfle:.4},
  /* la fumée qui arrive pour de bon (la fuite) */
  {x:XF - 500, y:-120, z:CZ + 1250, t0:FUITE - 4.5, debit:9, vie:9, jet:[120, -60, -330], ouvert:.8, etale:440, monte:60, r0:80, r1:460, dense:.42, graine:45, gonfle:.45},
  {x:XF + 500, y:-120, z:CZ + 1250, t0:FUITE - 4.2, debit:9, vie:9, jet:[-120, -60, -330], ouvert:.8, etale:440, monte:60, r0:80, r1:460, dense:.42, graine:47, gonfle:.45}
];
var COUPES_FOULE = [CZ - 1000, CZ - 430, CZ - 140, CZ + 160, CZ + 600];
var cam6 = plans([
  [CHOC, [[CHOC, {x:XF + 10, y:-405, z:CZ + 1720, focus:1740, ouverture:1.15}], [GROS2, {x:XF + 20, y:-408, z:CZ + 1560, focus:1580, ouverture:1.15}, 'l']]],
  /* de près : Margot ; puis la mise au point passe sur Basile, derrière elle, qui tousse */
  [GROS2, [[GROS2, {x:XF + 120, y:-428, z:CZ + 500, focus:538, ouverture:1.3}], [32.25, {x:XF + 112, y:-428, z:CZ + 486, focus:524, ouverture:1.3}, 'l'], [32.85, {x:XF + 106, y:-430, z:CZ + 478, focus:776, ouverture:1.3}, 'io'], [MAIRE, {x:XF + 96, y:-432, z:CZ + 462, focus:760, ouverture:1.3}, 'l']]]
]);
function rougeFoule(t){ return U.clamp((t - CHOC + .2) / 1.4, 0, 1) * .75; }
function lueurRouge(t, k, zCam){
  /* la fumée rougeoie devant eux (du côté de la caméra) : sa lumière sur l'herbe, à leurs pieds */
  return FC.lumiere(t, XF - 500, -120, zCam - 420, {sorte:'Rouge', r:520, coeur:0, k:k, graine:51, sol:900, solK:1.5}) + FC.lumiere(t, XF + 600, -120, zCam - 360, {sorte:'Rouge', r:520, coeur:0, k:k, graine:53, sol:900, solK:1.5});
}
function plan6(t){
  var rouge = rougeFoule(t), acteurs = FOULE.map(function(c){
    var p = poseChoc(c, t);
    /* Basile tousse, à la fin du gros plan */
    if(c.g === 3) tousse(p, t, 32.95, 2, 'G');
    var recul = U.COURBES.o(U.clamp((t - CHOC - .15 - (c.g % 5) * .08) / .5, 0, 1)) * 46;
    return acteurV(c, p, XF + c.x, CZ + c.z - recul, {rouge:rouge});
  });
  var cam = cam6(t);
  return {zone:'foule', cam:cam, acteurs:acteurs.concat(FC.fumeeTranches(t, SRC_FOULE, COUPES_FOULE)), sources:K.sources(acteurs), poussiere:110, poussiereBoite:[XF - 1400, -900, CZ - 1200, XF + 1400, -60, CZ + 900], poussiereCoul:'#ffb090',
    lumieres:function(){ return lumieresDe(t, acteurs) + lueurRouge(t, rouge * .8, cam.z); },
    avant:function(){ return FC.voile(.02 + .04 * rouge); }};
}

/* ================================================================ 7. LE MAIRE ACCOURT, en bonnet de nuit, Silas sur ses talons (33,8 → 38,2 s) */
var VMAIRE = {sourcils:{f:0, l:.7, t:.5}, yeux:{o:1.15, lx:0, ly:0, cl:0}, bouche:{o:.3, w:0, c:-.25, cri:0}};
function mz(t){ return U.lerp(-3900, CZ + 1260, U.clamp((t - MAIRE - .05) / 4.3, 0, 1)); }
function poseCourse(n, t, plus){
  var p = base(n, plus); p._n = n;
  var ph = (t - MAIRE) * 3.3 + (n === 'silas' ? .5 : 0), bal = pas(p, ph, 1, true);
  p.tk = .95; p.tete.k = (p.tete.k || 0) + 3;
  return {p:p, bal:bal, ph:ph};
}
var cam7 = plans([[MAIRE, [[MAIRE, {x:XF + 10, y:-430, z:CZ + 1500, focus:2600, ouverture:1.2}], [CRIE, {x:XF - 20, y:-436, z:CZ + 1640, focus:900, ouverture:1.2}, 'l']]]]);
function plan7(t){
  var rouge = .75, zm = mz(t), xm = XF + 46 * Math.sin((t - MAIRE) * 1.6), passe = U.clamp((zm - (CZ - 700)) / 700, 0, 1);
  /* les villageois s'écartent, se retournent pour le voir venir, puis le suivent des yeux */
  var acteurs = FOULE.map(function(c){
    var p = poseChoc(c, CHOC + 3), cote = c.x < 0 ? -1 : 1, vu = U.clamp((zm - (CZ + c.z - 1500)) / 600, 0, 1), suit = U.clamp((zm - (CZ + c.z - 200)) / 500, 0, 1);
    p.tete.ht = -cote * .75 * vu * (1 - suit * .4); p.tete.r = -cote * 4 * vu;
    visage(p, {yeux:{lx:-cote * .9 * vu, o:1.25}});
    var ecart = (c.z > -100 ? 150 : 110) * U.lisse(U.clamp((t - MAIRE + .5) / 1.2, 0, 1)) + (Math.abs(c.x) < 100 ? 380 : 0);
    if(t < MAIRE + 1) pas(p, (t - MAIRE + 1) * 2.4 + c.g * .3, .5);
    return acteurV(c, p, XF + c.x + cote * ecart + (Math.abs(c.x) < 100 ? (c.g % 2 ? -1 : 1) * 0 : 0), CZ + c.z - 46, {rouge:rouge});
  });
  var M1 = poseCourse('maire', t, {v:VMAIRE, bD:{a:62, c:74}, bG:{a:24, c:100}});
  M1.p.bG.c = 100 + 30 * Math.sin(M1.ph * Math.PI); M1.p.souffle = .5 + .5 * Math.sin(M1.ph * Math.PI * 2);
  M1.p.v.bouche.o = .3 + .2 * Math.abs(Math.sin(M1.ph * Math.PI * .5));
  var maire = {type:'maire', x:xm, z:zm, pose:M1.p, o:{lanterne:1, gants:1, bague:false, bonnet:M1.bal * .9}, ombreR:130,
    lum:{dx:40, dy:-330, z:150, c:'rgb(255,' + Math.round(214 - 70 * passe) + ',' + Math.round(170 - 80 * passe) + ')', rims:[[-1, -.9, .5, '#8fb0ff'], [1, -.9, .5 + .5 * passe, passe > .4 ? '#ff4a30' : '#ffa04a']]}};
  var S1 = poseCourse('silas', t, {v:{sourcils:{f:0, l:.9, t:.3}, yeux:{o:1.3}, bouche:{o:.35, c:-.3}}, bD:{a:40, c:92}});
  /* une main sur son képi */
  S1.p.bG = {ik:1, cible:[-22, S1.p.w[1] - 166 - 104], a:10, c:-14, l1:1, l2:1}; S1.p.poingG = 'ouvert';
  var silas = {type:'silas', x:xm + 210 + 30 * Math.sin(t * 2.1), z:zm - 470, pose:S1.p, o:{tient:{D:'lanterne'}, lanterne:1, kepi:-8, graine:21}, ombreR:120, _c:{tient:{D:'lanterne'}},
    lum:{dx:100, dy:-330, z:160, c:'#ffdcae', rims:[[-1, -.9, .5, '#8fb0ff'], [1, -.9, .5, '#ffa04a']]}};
  var cam = cam7(t);
  /* le point net suit le maire */
  cam = Object.assign({}, cam, {focus:Math.max(420, cam.z - zm)});
  var tous = acteurs.concat([maire, silas]);
  return {zone:'foule', cam:cam, acteurs:tous.concat(FC.fumeeTranches(t, SRC_FOULE, COUPES_FOULE)), sources:K.sources(acteurs).concat([[xm, -300, zm]]), poussiere:110, poussiereBoite:[XF - 1400, -900, CZ - 1500, XF + 1400, -60, CZ + 900], poussiereCoul:'#ffb090',
    tremble:1.2 * passe,
    lumieres:function(){
      var s = lumieresDe(t, acteurs.concat([silas])) + lueurRouge(t, rouge * .8, cam.z);
      if(maire.os){ var l = Gens.point(maire.os, 'lanterne'); s += FC.lumiere(t, xm + l[0], l[1], zm + 4, {sorte:'Chaud', r:300, coeur:34, k:1.1, graine:17, sol:300}); }
      return s;
    },
    devant:function(){ var s = '', ph = (t - MAIRE) * 3.3; for(var i = Math.max(0, Math.floor(ph) - 2); i <= Math.floor(ph); i++){ var ti = MAIRE + i / 3.3; s += FX.bouffee(t, ti, XF + 46 * Math.sin((ti - MAIRE) * 1.6) + (i % 2 ? 40 : -40), mz(ti), 5, 60 + i, .5); } return s; },
    avant:function(){ return FC.voile(.05); }};
}

/* ================================================================ 8 et 9. DEVANT LA FUMÉE : Silas, puis le maire (38,2 → 54,8 s) */
var SX = XC - 330, SZ = 620, MX = XC + 270, MZ = 400;
var silasParle = U.poses(base('silas', {v:{sourcils:{f:.2, l:.8, t:.2}, yeux:{o:1.3}, bouche:{c:-.3}}, bD:{a:40, c:92}, bG:{a:30, c:60}, tete:{k:2}}), [
  [CRIE, {t:5, tk:.95}],
  /* « Ce sont des vapeurs toxiques ! » : il montre la fumée, derrière lui, le bras tendu */
  [CRIE + .45, {t:0, tk:1, bG:{a:152, c:6}, poingG:'pointe', tete:{k:-3, ht:-.25}, w:[0, -252]}, 'dep'],
  [40.2, {bG:{a:146, c:10}, tete:{ht:.1}}, 'io'],
  [41.2, {bG:{a:156, c:4}, tete:{ht:-.2}}, 'io'],
  [GROS3, {}],
  /* « Elles montent des sous-sols ! » : les deux mains montent du sol vers le ciel */
  [GROS3 + .1, {bG:{a:30, c:40}, bD:{a:30, c:40}, poingG:'ouvert', poingD:'ouvert', tete:{k:4, ht:0}, t:4}],
  [43.3, {bG:{a:120, c:30}, bD:{a:120, c:30}, tete:{k:-5}, t:-3}, 'io'],
  [44.4, {bG:{a:150, c:16}, bD:{a:150, c:16}, tete:{k:-7}}, 'io'],
  [PARLE, {bG:{a:60, c:60}, bD:{a:40, c:92}, tete:{k:0, ht:.35}, t:0, v:{yeux:{lx:.8}}}, 'io'],
  /* il regarde le maire parler ; à la fin, il écarte les bras pour faire reculer tout le monde */
  [LARGE, {tete:{ht:.3}}],
  [LARGE + .5, {bG:{a:88, c:-6}, bD:{a:88, c:-6}, poingG:'ouvert', poingD:'ouvert', tete:{ht:0, k:-2}, v:{yeux:{lx:0}, sourcils:{f:.7, l:0}}}, 'o'],
  [FUITE, {bG:{a:94, c:-10}, bD:{a:94, c:-10}}, 'l']
]);
var maireParle = U.poses(base('maire', {v:U.melange(VMAIRE, {bouche:{o:.25}}, 1), w:[0, -200], t:16, tk:.84, tete:{k:16}, bD:{ik:1, cible:[52, -112]}, bG:{ik:1, cible:[-52, -112]}, poingD:'ouvert', poingG:'ouvert'}), [
  /* plié en deux, les mains sur les genoux : il reprend son souffle */
  [CRIE, {}],
  [43.6, {tete:{k:12}}, 'l'],
  /* il se redresse */
  [44.9, {w:[0, -232], t:0, tk:1, tete:{k:0}, bD:{ik:0, a:16, c:20}, bG:{ik:0, a:16, c:20}, v:{sourcils:{f:.5, l:.2, t:0}, yeux:{o:1.05}, bouche:{o:0, c:-.3}}}, 'io'],
  /* « Reculez ! Ne respirez pas ça ! » : les deux bras grands ouverts, puis il repousse des deux mains */
  [PARLE + .5, {bD:{a:98, c:-4}, bG:{a:98, c:-4}, tete:{k:-3}, w:[0, -236], v:{sourcils:{f:.8, l:0}, yeux:{o:1.2}}}, 'dep'],
  [47.2, {bD:{a:92, c:2}, bG:{a:92, c:2}}, 'l'],
  [47.6, {bD:{a:62, c:60, l2:.62}, bG:{a:62, c:60, l2:.62}, t:3}, 'io'],
  [48.7, {bD:{a:58, c:66, l2:.56}, bG:{a:58, c:66, l2:.56}}, 'l'],
  [GROS4, {}],
  /* « La zone est condamnée. » : calme, froid ; un coup d'œil vers le chêne */
  [GROS4 + .1, {bD:{a:14, c:-10, l2:1}, bG:{a:14, c:-10, l2:1}, poingD:'poing', poingG:'poing', t:0, tete:{k:3, ht:0}, v:{sourcils:{f:.4, l:0, t:0}, yeux:{o:1.05, lx:0}, bouche:{o:0, c:-.2}}}],
  [50.5, {tete:{k:3, ht:-.12}, v:{yeux:{lx:-.9, o:1}}}, 'io'],
  [51.1, {}],
  [51.5, {tete:{k:1, ht:0}, v:{yeux:{lx:0, o:1.05}}}, 'io'],
  [LARGE, {}],
  /* « Rentrez chez vous ! » : le doigt tendu vers le village (vers nous) */
  [LARGE + .45, {bD:{a:70, c:14, l1:.66, l2:.5}, poingD:'pointe', tete:{k:-3}, t:-2, v:{sourcils:{f:1}, yeux:{o:1.1}}}, 'dep'],
  [54.4, {bD:{a:74, c:10, l1:.6, l2:.46}}, 'l'],
  [FUITE, {}]
]);
var cam8 = plans([
  [CRIE, [[CRIE, {x:XC - 40, y:-440, z:2180, focus:1560, ouverture:1.2}], [GROS3, {x:XC - 60, y:-444, z:2060, focus:1440, ouverture:1.2}, 'l']]],
  /* de près : Silas (les yeux au tiers du haut) */
  [GROS3, [[GROS3, {x:SX + 26, y:-452, z:SZ + 600, focus:600, ouverture:1.25}], [PARLE, {x:SX + 30, y:-454, z:SZ + 540, focus:540, ouverture:1.25}, 'l']]],
  /* le maire : la mise au point quitte Silas (devant, à gauche) et vient sur lui */
  [PARLE, [[PARLE, {x:MX - 190, y:-420, z:MZ + 1060, focus:850, ouverture:1.3}], [PARLE + .45, {x:MX - 180, y:-420, z:MZ + 1050, focus:1050, ouverture:1.3}, 'io'], [GROS4, {x:MX - 150, y:-422, z:MZ + 960, focus:960, ouverture:1.3}, 'l']]],
  [GROS4, [[GROS4, {x:MX + 6, y:-446, z:MZ + 640, focus:640, ouverture:1.3}], [LARGE, {x:MX + 4, y:-447, z:MZ + 570, focus:570, ouverture:1.3}, 'l']]],
  [LARGE, [[LARGE, {x:XC - 20, y:-520, z:2500, focus:2000, tangage:.03, ouverture:1.1}], [FUITE, {x:XC - 20, y:-560, z:2760, focus:2260, tangage:.035, ouverture:1.1}, 'l']]]
]);
/* la fumée, une fois installée : elle sort de derrière le tronc et reste surtout DERRIÈRE Silas et le maire (on doit les voir) ;
   quelques volutes passent devant eux */
var SRC_DEVANT = [
  {x:XC - 620, y:-70, z:-480, t0:PFFT + 2, debit:4, vie:9, jet:[-150, -80, 200], ouvert:.6, etale:200, monte:60, r0:50, r1:340, dense:.5, graine:21, gonfle:.42},
  {x:XC + 660, y:-70, z:-480, t0:PFFT + 2.1, debit:4, vie:9, jet:[160, -80, 200], ouvert:.6, etale:200, monte:60, r0:50, r1:340, dense:.5, graine:23, gonfle:.42},
  {x:XC + 40, y:-430, z:-540, t0:PFFT + 2.2, debit:3, vie:9, jet:[0, -220, 160], ouvert:.9, etale:200, monte:110, r0:60, r1:360, dense:.42, graine:25, gonfle:.4},
  {x:XC - 1300, y:-60, z:500, t0:PARLE - 9, debit:1.5, vie:10, jet:[220, -30, 60], ouvert:.8, etale:300, monte:30, r0:70, r1:320, dense:.22, graine:61, gonfle:.4},
  {x:XC + 1300, y:-60, z:700, t0:PARLE - 8.6, debit:1.5, vie:10, jet:[-220, -30, 60], ouvert:.8, etale:300, monte:30, r0:70, r1:320, dense:.22, graine:63, gonfle:.4}
];
var COUPES_DEVANT = [-460, -100, MZ - 60, (MZ + SZ) / 2, SZ + 80, 1300, 2000];
function plan8(t){
  var ps = copie(silasParle(t)); ps._n = 'silas';
  var b1 = dit(t, 2), b2 = dit(t, 3), b = b1 || b2;
  if(b){ ps.v.bouche.o = .2 + b.o * 1.25; ps.v.bouche.cri = .5; ps.v.bouche.w = .2; ps.tete.k -= b.o * 3; }
  respire(ps, t, t < 39 ? .7 : .3, t < 39 ? 1.6 : .8, 31);
  ps.v.yeux.cl = cligne(t, .9);
  var pm = copie(maireParle(t)); pm._n = 'maire';
  var m1 = dit(t, 4), m2 = dit(t, 5), m3 = dit(t, 6), m = m1 || m2 || m3;
  if(m){ pm.v.bouche.o = (m2 ? .12 : .2) + m.o * (m2 ? .8 : 1.25); pm.v.bouche.cri = m2 ? 0 : .5; pm.v.bouche.w = m2 ? -.2 : .2; pm.tete.k -= m.o * 2.5; }
  respire(pm, t, t < 44.9 ? .9 : .25, t < 44.9 ? 1.5 : .6, 21);
  pm.v.yeux.cl = t < 44.6 ? .35 + .3 * Math.sin(t * 3) : cligne(t, .4);
  var bonnet = Math.sin(t * 1.3) * .25 + (t < 44.9 ? .5 : 0);
  /* éclairés de face par les lanternes du village (chaud), à contre-jour par la fumée rouge */
  var rims = [[-1, -.8, 1.0, '#ff4030'], [1, -.8, 1.0, '#ff4030']];
  var silas = {type:'silas', x:SX, z:SZ, pose:ps, o:{tient:{D:'lanterne'}, lanterne:1, kepi:-7, graine:21}, ombreR:120, _c:{tient:{D:'lanterne'}}, lum:{dx:120, dy:-330, z:160, c:'#ffe6c4', rims:rims}};
  var maire = {type:'maire', x:MX, z:MZ, pose:pm, o:{lanterne:null, gants:1, bague:false, bonnet:bonnet}, ombreR:130, lum:{dx:-240, dy:-420, z:200, c:'#f4c4a0', rims:rims}};
  var cam = cam8(t);
  var fumee = FC.fumeeTranches(t, SRC_DEVANT, COUPES_DEVANT);
  /* la lanterne du maire, posée dans l'herbe à côté de lui : elle l'éclaire par-dessous */
  var LX = MX + 170, LZ = MZ + 40;
  var lanterne = {type:'libre', x:LX, y:0, z:LZ, dessin:function(q){ return '<g transform="translate(' + U.r(q.x) + ' ' + U.r(q.y) + ') scale(' + U.r(q.s) + ') translate(0 -96)">' + Gens.lanterne(1) + '</g>'; }};
  maire.lum = {dx:-190, dy:-390, z:230, c:'#ffe6c8', rims:rims};
  return {zone:'chene', cam:cam, acteurs:[silas, maire, lanterne].concat(fumee), _lanterne:[LX, -50, LZ + 6], poussiere:90, poussiereBoite:[XC - 1400, -1000, -200, XC + 1400, -60, 1900], poussiereCoul:'#ffa080', sources:[[XC, -300, 0], [SX + 120, -330, SZ]],
    tremble:0,
    lumieres:function(){ return K.braise(t, 1, true) + lumieresDe(t, [silas]) + K.lueurFoule(t, .42, Math.max(cam.z, 1800) + 600) + FC.lumiere(t, LX, -50, LZ + 6, {sorte:'Chaud', r:300, coeur:30, k:1.1, graine:17, sol:300}); },
    avant:function(){ return FC.voile(.025 + .04 * U.clamp((t - LARGE) / 2.5, 0, 1)); }};
}

/* ================================================================ 10. TOUT LE MONDE RECULE EN TOUSSANT (54,8 → 58,2 s) */
var cam10 = plans([[FUITE, [[FUITE, {x:XF - 30, y:-420, z:CZ + 1500, focus:1600, ouverture:1.15}], [YEUX, {x:XF + 10, y:-470, z:CZ + 1750, focus:2300, ouverture:1.15}, 'l']]]]);
function plan10(t){
  var a = t - FUITE, rouge = 1;
  var acteurs = FOULE.map(function(c){
    var p = poseChoc(c, CHOC + 3), d = (c.g % 4) * .22;
    visage(p, K.PEUR);
    /* ils reculent à petits pas, de plus en plus vite ; ils toussent chacun leur tour */
    var k = Math.max(0, a - d), recul = 46 + 60 * k * k + 40 * k;
    pas(p, k * (2.2 + k * .5) + c.g * .4, .8);
    tousse(p, t, FUITE + .25 + (c.g % 5) * .46, 3, c.tient.D ? 'G' : 'D');
    tousse(p, t, FUITE + 2.0 + (c.g % 3) * .4, 2, c.tient.D ? 'G' : 'D');
    p.tete.k = (p.tete.k || 0) + 6;
    return acteurV(c, p, XF + c.x + (c.x < 0 ? -1 : 1) * (150 + 30 * k), CZ + c.z - recul, {rouge:rouge});
  });
  var cam = cam10(t);
  return {zone:'foule', cam:cam, acteurs:acteurs.concat(FC.fumeeTranches(t, SRC_FOULE, COUPES_FOULE, .62 + .2 * U.clamp(a / 3, 0, 1))), sources:K.sources(acteurs), poussiere:80, poussiereBoite:[XF - 1400, -900, CZ - 1500, XF + 1400, -60, CZ + 900], poussiereCoul:'#ff9070',
    lumieres:function(){ return lumieresDe(t, acteurs, .85) + lueurRouge(t, .9, cam.z); },
    avant:function(){ return FC.voile(.03 + .09 * U.clamp(a / 3.2, 0, 1)); }};
}

/* ================================================================ 11. DERRIÈRE LE CHÊNE : DEUX YEUX DANS L'OMBRE, QUI S'EN VONT (58,2 → 61,8 s) */
var hommeFin = U.poses(U.melange(BASE, {w:[0, -272], tete:{k:6}, bD:{a:12, c:-12}, bG:{a:12, c:-12}, poingD:'poing', poingG:'poing', balance:0}, 1), [
  [YEUX, {}],
  [59.5, {tete:{k:4, r:-2}}, 'l'],
  /* il baisse la tête, et recule dans le noir */
  [60.2, {tete:{k:13, r:0}, w:[-4, -268], balance:-8}, 'io'],
  [61.2, {w:[0, -270], balance:6}, 'io']
]);
var hx11 = U.piste([[59.7, XD - 610], [61.5, XD - 860, 'io']]), hz11 = U.piste([[59.7, -130], [61.5, -330, 'io']]), yeux11 = U.piste([[YEUX, .95], [59.8, 1.1], [60.4, .5, 'io'], [61.2, 0, 'io']]), ombre11 = U.piste([[59.7, 1], [61.2, 0, 'io']]);
var SRC_FIN = [
  /* le pot crache encore, à droite ; l'homme, à gauche, reste dans le noir */
  {x:XD - 40, y:-128, z:150, t0:PFFT, debit:7, vie:7, jet:[60, -420, 0], ouvert:.5, etale:150, monte:90, vent:[26, 0], r0:30, r1:300, gonfle:.5, dense:.5, graine:3},
  {x:XD + 600, y:-80, z:-200, t0:PFFT + 4, debit:3, vie:10, jet:[160, -60, 120], ouvert:.8, etale:330, monte:46, r0:70, r1:380, dense:.34, graine:71, gonfle:.4}
];
var cam11 = plans([[YEUX, [[YEUX, {x:XD - 470, y:-436, z:1180, focus:1310, ouverture:1.25}], [T, {x:XD - 500, y:-440, z:1020, focus:1220, ouverture:1.25}, 'l']]]]);
function plan11(t){
  var p = copie(hommeFin(t)); respire(p, t, .25, .5, 41);
  var k = ombre11(t);
  var homme = {type:'leo', x:hx11(t), z:hz11(t), pose:p, o:{habit:'cape', yeuxCape:yeux11(t)}, ombreR:170, ombreOp:.5 * k,
    /* presque noir : seul le rouge de la fumée dessine son bord */
    lum:{dx:300, dy:-500, z:200, c:'rgb(' + Math.round(22 + 60 * k) + ',' + Math.round(14 + 14 * k) + ',' + Math.round(20 + 14 * k) + ')', rims:[[1, -.8, 1.2 * k, '#ff4030'], [-1, -.9, .1, '#6a84c8']]}};
  var pot = {type:'libre', x:XD - 40, y:0, z:150, dessin:function(q){ return '<g transform="translate(' + U.r(q.x) + ' ' + U.r(q.y) + ') scale(' + U.r(q.s) + ')">' + FC.pot({feu:1}) + '</g>'; }};
  var cam = cam11(t);
  return {zone:'derriere', cam:cam, acteurs:[homme, pot].concat(FC.fumeeTranches(t, SRC_FIN, [-260, 0, 130, 220, 520])), portee:.6, poussiere:60, poussiereBoite:[XD - 900, -700, -300, XD + 900, -40, 900], poussiereCoul:'#ff9070', sources:[[XD - 40, -200, 150]],
    lumieres:function(){
      var s = K.lanternesLoin(t, U.clamp((61.4 - t) / 3, .25, .7));
      s += FC.lumiere(t, XD - 40, -150, 160, {sorte:'Rouge', r:380, coeur:30, k:1, graine:11, sol:560, solK:1.5});
      /* la lueur de ses yeux, sous le capuchon */
      var y = yeux11(t);
      if(y > .05 && homme.os){ var pr = CAM.projeter(homme.x, 0, homme.z); ['oeilD', 'oeilG'].forEach(function(n){ var e = LeoFace.point(homme.os, n); s += '<circle cx="' + U.r(pr.x + e[0] * .8 * pr.s) + '" cy="' + U.r(pr.y + (e[1] + 6) * pr.s) + '" r="' + U.r(24 * pr.s) + '" fill="url(#lueurJaune)" opacity="' + U.r(U.clamp(y * .42, 0, 1)) + '"/>'; }); }
      return s;
    },
    avant:function(){ return FC.voile(.02); }};
}

/* ================================================================ LE FILM */
var NOIR = '#12030a';
CINE.films.chene = {
  nom:'Le rassemblement au Vieux Chêne', plateau:'chene', duree:T, defs:FC.defs,
  sons:[[.15, 'cineFoule'], [3.05, 'cineClameur'], [6.75, 'cineLanterne'], [9.3, 'cineFoulePasse'], [TT.POUSSE + .08, 'cineBarriere'],
    [TT.CHENE + .1, 'cineVent'], [TT.CHENE + 1.3, 'cineHibou'], [TT.DERRIERE + .2, 'cineVent'], [19.0, 'cineCape'], [TT.CRAC - .06, 'cineAllumette'], [TT.MECHE, 'cineMeche'], [23.1, 'cineCape'], [PFFT, 'cinePffft'],
    [CHOC + .12, 'cineOh'], [32.95, 'cineToux'], [MAIRE + .1, 'cineCourse'], [CRIE + .1, 'cineSouffle'], [40.6, 'cineSouffle'],
    [FUITE + .2, 'cineFouleFuit'], [FUITE + .3, 'cineToux'], [FUITE + 1.15, 'cineToux'], [FUITE + 2.1, 'cineToux'], [YEUX + .3, 'cineVent'], [60.0, 'cineCape']],
  sousTitres:K.LIGNES,
  etat:function(t){
    var E = t < TT.SILAS ? K.plan1(t) : t < TT.CHENE ? K.plan2(t) : t < TT.DERRIERE ? K.plan3(t) : t < TT.FUMEE ? K.plan4(t) : t < CHOC ? K.plan5(t) : t < MAIRE ? plan6(t) : t < CRIE ? plan7(t) : t < FUITE ? plan8(t) : t < YEUX ? plan10(t) : plan11(t);
    /* les fondus : l'ouverture (dans le plan 1) ; la fuite se perd dans la fumée, on se retrouve derrière le chêne ; la fin */
    if(t > YEUX - .55 && t < YEUX) E.fondu = {k:(t - (YEUX - .55)) / .55, c:NOIR};
    else if(t >= YEUX && t < YEUX + .6) E.fondu = {k:1 - (t - YEUX) / .6, c:NOIR};
    else if(t > T - .75) E.fondu = {k:U.clamp((t - (T - .75)) / .7, 0, 1)};
    return E;
  }
};
})();
