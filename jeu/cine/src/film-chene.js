/* film-chene.js — LE RASSEMBLEMENT AU VIEUX CHÊNE (enquête 2, la nuit ; Bible §12.63).
   Romain (16 novembre, 6 h 28) : « une cinématique du rassemblement du Sage, le rassemblement au chêne, avec Léo en cape noire
   qui allume le pot de fumigènes derrière le grand chêne. Et tous les villageois choqués. Et le maire qui arrive en courant.
   Une cinématique digne des plus grands films, avec de jolis effets d'éclairage et des jeux de focale (fond flou), et une musique :
   au début une musique de révolte, puis, quand la fumée arrive, une musique de stress. Fais en sorte qu'on ait le temps de lire
   les dialogues (ce sont des enfants qui vont lire). »

   Le film suit le texte de la page du Sage (e2.js, « Rassembler le village ») : tout le village marche vers le Vieux Chêne ;
   Silas veut les arrêter, ils sont trop nombreux ; le chêne, les gros rochers sur le trou ; derrière le tronc, l'homme en cape
   (on ne voit que sa capuche : PERSONNE ne sait encore que c'est Léo, et le film ne le dit pas) craque une allumette et allume
   la mèche du pot noir ; PFFFT, la fumée rouge sort de sous les branches ; les villageois, pétrifiés ; le maire accourt en bonnet
   de nuit, Silas sur ses talons ; Silas : « Ce sont des vapeurs toxiques ! Elles montent des sous-sols ! » ; le maire (il ne ment
   jamais) : « Reculez ! Ne respirez pas ça ! La zone est condamnée. Rentrez chez vous ! » ; tout le monde recule en toussant ;
   derrière le chêne, deux yeux dans l'ombre, qui s'en vont.

   La caméra est à la place du Sage (on ne voit pas les héros : chacun a le sien). Le plateau : plateau-chene.js (trois coins :
   'foule', 'chene', 'derriere'). Environ une minute ; « Passer ➜ » est là. */
(function(){
'use strict';
var U = window.CU, FX = window.CFX, FC = window.CFXC, O = CINE.O, plans = O.plans, copie = O.copie, respire = O.respire, cligne = O.cligne, parle = O.parle, BASE = O.BASE;
var XF = 0, XC = 9000, XD = 18000;

/* ---------------------------------------------------------------- LE DÉROULÉ (en secondes) */
var MARCHE = 0, GROS1 = 3.5, SILAS = 6.6, POUSSE = 10.4, CHENE = 12.0, DERRIERE = 16.2, NET = 17.5, CRAC = 19.9, MECHE = 22.3, POT = 22.6, PFFT = 24.7,
    FUMEE = 25.5, CHOC = 28.8, GROS2 = 31.2, MAIRE = 33.8, CRIE = 38.2, GROS3 = 41.9, PARLE = 45.2, GROS4 = 48.9, LARGE = 52.0, FUITE = 54.8, YEUX = 58.2, T = 61.8;
var LIGNES = [
  [2.5, 5.4, 'Tous au Vieux Chêne !', 'Gaspard'],
  [7.0, 10.3, 'Halte ! Le chemin est fermé !', 'Silas'],
  [38.6, 41.8, 'Ce sont des vapeurs toxiques !', 'Silas'],
  [42.1, 45.3, 'Elles montent des sous-sols !', 'Silas'],
  [45.6, 48.8, 'Reculez ! Ne respirez pas ça !', 'Le maire'],
  [49.2, 52.0, 'La zone est condamnée.', 'Le maire'],
  [52.3, 54.7, 'Rentrez chez vous !', 'Le maire']
];
function dit(t, n){ var l = LIGNES[n]; return parle(t, l[0] + .05, l[1] - .9, n + 3); }

/* ---------------------------------------------------------------- les poses de base, les visages */
var VV = {sourcils:{f:0, l:0, t:0}, yeux:{o:1, lx:0, ly:0, cl:0}, bouche:{o:0, w:0, c:0, cri:0}};
var DECIDE = {sourcils:{f:.75, l:0, t:0}, yeux:{o:.92}, bouche:{c:-.25}}, CHOQUE = {sourcils:{f:0, l:1, t:.2}, yeux:{o:1.42}, bouche:{o:.62, w:-.25, c:0}}, PEUR = {sourcils:{f:0, l:.8, t:.7}, yeux:{o:1.25}, bouche:{o:.28, c:-.5}};
function base(n, plus){
  var D = Gens.D[n], e = n === 'maire' ? 40 : 42;
  return U.melange({w:[0, D.taille[1]], r:0, t:0, tk:1, souffle:0, pend:0, tete:{r:0, k:0, ht:0, x:0, y:0}, bD:{a:10, c:-14, l1:1, l2:1}, bG:{a:10, c:-14, l1:1, l2:1}, jD:{p:[e, 0]}, jG:{p:[-e, 0]}, poingD:'poing', poingG:'poing', v:VV}, plus || {}, 1);
}
/* un pas (de face) : le pied se lève, le corps monte et balance ; rend le balancement (−1 … 1) */
function pas(p, ph, amp, course){
  var j = Math.floor(ph), fr = ph - j, cote = (j % 2) ? 'D' : 'G', sg = cote === 'D' ? 1 : -1, e = Math.abs(p.jD.p[0]), s = Math.sin(Math.PI * fr), bal = sg * s;
  p['j' + cote] = {p:[sg * e, -s * (course ? 52 : 19) * amp]};
  p.w = [p.w[0] + bal * (course ? 9 : 5) * amp, p.w[1] - Math.abs(s) * (course ? 17 : 6) * amp];
  p.r = (p.r || 0) + bal * (course ? 4 : 2.4) * amp; p.t = (p.t || 0) - bal * (course ? 2.4 : 1.4) * amp; p.tete.r = (p.tete.r || 0) - bal * 1.6 * amp;
  p.pend = (p.pend || 0) + bal * (course ? 24 : 9) * amp;
  return bal;
}
function visage(p, v){ p.v = U.melange(p.v, v, 1); return p; }
/* tousser : le corps se casse en avant par à-coups, la main devant la bouche, les yeux fermés */
function tousse(p, t, t0, n, main){
  var a = t - t0; if(a < 0 || a > n * .42 + .3) return p;
  var k = Math.pow(Math.abs(Math.sin(a * Math.PI / .42)), 3) * U.clamp((n * .42 + .3 - a) * 4, 0, 1);
  p.t = (p.t || 0) + 10 * k; p.tk = (p.tk == null ? 1 : p.tk) - .08 * k; p.tete.k = (p.tete.k || 0) + 20 * k; p.w = [p.w[0], p.w[1] + 5 * k];
  p.v = U.melange(p.v, {yeux:{cl:U.clamp(k * 1.5 + .5, 0, 1), o:1}, bouche:{o:.12 + .3 * k, c:-.9, w:-.3, cri:0}, sourcils:{f:1, l:0, t:.9}}, 1);
  if(main){ var b = p['b' + main] = Object.assign({}, p['b' + main], {ik:1, cible:[(main === 'D' ? 1 : -1) * 16, p.w[1] + Gens.D[p._n].cou[1] - 22 + 6 * k]}); p['poing' + main] = 'poing'; b.devant = true; }
  return p;
}

/* ---------------------------------------------------------------- LES VILLAGEOIS : qui est où dans la foule, ce qu'il porte */
var FOULE = [
  {n:'gaspard', x:-205, z:0, tient:{G:'rouleau'}, g:1},
  {n:'margot', x:195, z:-30, tient:{D:'lanterne'}, g:2},
  {n:'basile', x:-5, z:-290, tient:{D:'torche'}, g:3},
  {n:'iris', x:-480, z:-240, tient:{G:'lanterne'}, g:4},
  {n:'melusine', x:505, z:-260, tient:{}, g:5},
  {n:'farinel', x:-270, z:-560, tient:{G:'lanterne'}, g:6},
  {n:'fortune', x:300, z:-580, tient:{D:'torche'}, g:7},
  /* ceux du fond : les mêmes, plus loin, dans le noir — on ne voit que leurs lumières */
  {n:'basile', x:-720, z:-880, tient:{G:'torche'}, g:8, fond:1}, {n:'margot', x:40, z:-920, tient:{D:'lanterne'}, g:9, fond:1}, {n:'gaspard', x:740, z:-860, tient:{D:'lanterne'}, g:10, fond:1},
  {n:'iris', x:-380, z:-1240, tient:{D:'torche'}, g:11, fond:1}, {n:'fortune', x:440, z:-1300, tient:{G:'lanterne'}, g:12, fond:1}, {n:'farinel', x:-940, z:-1420, tient:{D:'lanterne'}, g:13, fond:1}, {n:'melusine', x:960, z:-1500, tient:{G:'torche'}, g:14, fond:1}
];
/* le bras qui porte : une lanterne à hauteur d'épaule, une torche levée, le rouleau brandi */
function porte(p, c){
  ['D', 'G'].forEach(function(k){
    var q = c.tient[k]; if(!q) return;
    if(q === 'lanterne') p['b' + k] = {a:34, c:104, l1:1, l2:1};
    if(q === 'torche') p['b' + k] = {a:112, c:44, l1:1, l2:1};
    if(q === 'rouleau') p['b' + k] = {a:118, c:38, l1:1, l2:1};
  });
  return p;
}
/* un villageois de la foule → un acteur (sa lumière : chaude s'il porte une flamme ou s'il est près d'une ; rouge quand la fumée est là) */
function acteurV(c, p, x, z, o){
  o = o || {};
  var cote = c.tient.D ? 'D' : c.tient.G ? 'G' : null, sg = cote === 'G' ? -1 : 1, feu = cote && c.tient[cote] !== 'rouleau';
  var rouge = o.rouge || 0, sombre = c.fond ? .5 : 1;
  /* la lumière de face : la lanterne (chaude), ou celle des voisins ; elle rougit avec la fumée */
  function mel(a, b, k){ return 'rgb(' + [0, 1, 2].map(function(i){ return Math.round(U.lerp(a[i], b[i], k)); }).join(',') + ')'; }
  var chaud = feu ? [255, 222, 170] : [226, 190, 150], coul = mel([chaud[0] * sombre, chaud[1] * sombre, chaud[2] * sombre], [255, 96 * sombre + 20, 70 * sombre + 10], rouge * .8);
  return {type:c.n, x:x, z:z, pose:p, o:{tient:c.tient, graine:c.g, lanterne:1}, ombreR:120, ombreOp:.6, _c:c,
    lum:{dx:feu ? sg * 120 : (c.g % 2 ? 260 : -260), dy:feu ? (c.tient[cote] === 'torche' ? -620 : -330) : -420, z:feu ? 150 : 200, c:coul, k:1,
      rims:[[-1, -.9, .55 * (1 - rouge) * sombre, '#8fb0ff'], [1, -.9, (.7 + .5 * rouge) * sombre, rouge > .3 ? '#ff4a30' : '#ffa04a'], [-1, -.5, rouge * .9 * sombre, '#ff3a2a']]}};
}
/* les lumières que portent des acteurs déjà dessinés (leurs os sont connus) : le halo, le rond flou, la flaque au sol */
function lumieresDe(t, acteurs, k){
  var s = '';
  acteurs.forEach(function(a){
    if(!a.os || !a.o || !a.o.tient) return;
    ['D', 'G'].forEach(function(c){
      var l = Gens.lumiereDe(a.os, a.o, c, a.pose); if(!l) return;
      var fond = a._c && a._c.fond;
      s += FC.lumiere(t, a.x + l.x, (a.y || 0) + l.y, a.z + 4, {sorte:l.torche ? 'Feu' : 'Chaud', r:l.torche ? 330 : 250, coeur:l.torche ? 44 : 30, k:(k == null ? 1 : k) * (fond ? .85 : 1), graine:(a.o.graine || 1) * 3 + (c === 'D' ? 1 : 2), sol:l.torche ? 330 : 260, solK:fond ? .6 : 1});
    });
  });
  return s;
}
function sources(acteurs){ var L = []; acteurs.forEach(function(a){ if(a._c && (a._c.tient.D || a._c.tient.G)) L.push([a.x, -360, a.z]); }); return L; }

/* ================================================================ 1. LA MARCHE (0 → 6,6 s) — la musique de la révolte */
/* la foule avance sur le chemin, vers nous ; à 2,5 s Gaspard brandit son rouleau : « Tous au Vieux Chêne ! » ; tous lèvent leurs lumières */
function avanceFoule(t){ return -1500 + 205 * t; }
function poseMarche(c, t){
  var p = base(c.n); p._n = c.n;
  visage(p, DECIDE); porte(p, c);
  var cad = 1.72 + (c.g % 5) * .035, bal = pas(p, t * cad + c.g * .37, 1);
  /* le bras libre balance */
  ['D', 'G'].forEach(function(k){ if(!c.tient[k]) p['b' + k] = {a:11 + bal * (k === 'D' ? -3 : 3), c:-16 + bal * (k === 'D' ? 9 : -9), l1:1, l2:1}; });
  /* le cri de Gaspard, et la foule qui répond en levant ses lumières (chacun avec un petit retard) */
  var cri = U.clamp((t - 2.45) / .35, 0, 1) * U.clamp((5.3 - t) / .5, 0, 1), rep = U.lisse(U.clamp((t - 3.0 - (c.g % 4) * .12) / .4, 0, 1)) * U.clamp((5.6 - t) / .6, 0, 1);
  if(c.g === 1){
    var b = dit(t, 0);
    p.bG = {a:118 + 34 * cri + 6 * Math.sin(t * 15) * cri, c:38 - 22 * cri, l1:1, l2:1};
    p.tete.k = -4 * cri; p.t += -2 * cri;
    visage(p, {sourcils:{f:.9}, yeux:{o:1 + .12 * cri}, bouche:{o:b ? .25 + b.o * 1.3 : 0, cri:b ? .6 : 0, w:b ? .3 : 0, c:-.3}});
  } else {
    ['D', 'G'].forEach(function(k){ var q = c.tient[k]; if(q === 'torche') p['b' + k].a += 30 * rep; if(q === 'lanterne'){ p['b' + k].a += 46 * rep; p['b' + k].c -= 44 * rep; } });
    if(!c.tient.D && !c.tient.G) p.bD = {a:11 + 120 * rep, c:-16 + 40 * rep, l1:1, l2:1};
    visage(p, {bouche:{o:.5 * rep * (.6 + .4 * Math.sin(t * 9 + c.g)), cri:.3 * rep}, sourcils:{f:.75 + .2 * rep}});
  }
  p.v.yeux.cl = cligne(t, c.g * .7);
  return p;
}
var cam1 = plans([
  [0, [[0, {x:XF + 30, y:-400, z:1050, focus:1500, ouverture:1.15}], [GROS1, {x:XF + 10, y:-392, z:1230, focus:2400, ouverture:1.15}, 'l']]],
  /* de près : Gaspard qui crie (les yeux au tiers du haut), puis la mise au point passe sur la torche de Basile, derrière lui */
  [GROS1, [[GROS1, {x:XF - 250, y:-452, z:290, focus:1060, ouverture:1.2}], [5.3, {x:XF - 190, y:-458, z:520, focus:900, ouverture:1.2}, 'l'], [5.9, {x:XF - 150, y:-462, z:640, focus:1160, ouverture:1.25}, 'io'], [SILAS, {x:XF - 120, y:-466, z:740, focus:1260, ouverture:1.25}, 'l']]]
]);
function plan1(t){
  var cz = avanceFoule(t), acteurs = FOULE.map(function(c){ return acteurV(c, poseMarche(c, t), XF + c.x, cz + c.z); });
  var cam = cam1(t);
  if(t < GROS1) cam = Object.assign({}, cam, {focus:cam.z - cz + 40});          /* le point net suit le premier rang */
  else if(t < 5.3) cam = Object.assign({}, cam, {focus:cam.z - cz});
  return {zone:'foule', cam:cam, acteurs:acteurs, sources:sources(acteurs), poussiere:150, poussiereBoite:[XF - 1400, -900, cz - 1200, XF + 1400, -60, cz + 700],
    lumieres:function(){ return lumieresDe(t, acteurs) + FC.lucioles(t, [XF - 1800, -700, cz - 600, XF + 1800, -80, cz + 1500], 26, 5, 1); },
    fondu:t < .9 ? {k:1 - t / .9} : null};
}

/* ================================================================ 2. SILAS (6,6 → 12 s) : « Halte ! Le chemin est fermé ! » — et la foule passe */
/* (on le voit du côté de la foule : derrière lui, très loin et flou, le Vieux Chêne et la lune) */
var ZS = 5200;
var silasCles = U.poses(base('silas', {v:{sourcils:{f:.6}, yeux:{o:1.05}, bouche:{c:-.3}}, bG:{a:84, c:-6}, bD:{a:46, c:96}, poingG:'ouvert'}), [
  [SILAS, {}],
  [6.95, {bG:{a:96, c:-10}, tete:{k:-3}, w:[0, -252]}, 'dep'],
  [9.2, {bG:{a:92, c:-4}}, 'l'],
  /* ils ne s'arrêtent pas : il recule, les deux bras en avant */
  [9.9, {v:{sourcils:{f:0, l:.8, t:.4}, yeux:{o:1.3}}, bG:{a:70, c:30}, bD:{a:60, c:60}, tete:{k:2}}, 'io'],
  [POUSSE, {bG:{a:62, c:44}, t:-3}, 'l'],
  /* bousculé : il part sur le côté, le képi de travers */
  [POUSSE + .45, {r:9, t:8, tete:{r:10, k:4}, bG:{a:120, c:20}, bD:{a:110, c:40}, poingD:'ouvert', v:{yeux:{o:1.45}, bouche:{o:.7, c:-.4}, sourcils:{l:1, t:.6}}}, 'o'],
  [POUSSE + 1.2, {r:14, t:10, tete:{r:14}}, 'l']
]);
var silasX = U.piste([[SILAS, 0], [9.3, 0], [POUSSE, 20, 'i'], [POUSSE + .5, 260, 'o'], [CHENE, 520, 'l']]), silasZ = U.piste([[SILAS, 0], [9.2, 0], [POUSSE, -150, 'io'], [CHENE, -220, 'l']]);
var cam2 = plans([[SILAS, [[SILAS, {x:XC + 40, y:-336, z:ZS + 1620, focus:1620, ouverture:1.2}], [9.4, {x:XC + 30, y:-340, z:ZS + 1500, focus:1500, ouverture:1.2}, 'l'], [POUSSE, {x:XC + 20, y:-380, z:ZS + 1100, focus:1220, ouverture:1.2}, 'i'], [CHENE, {x:XC, y:-420, z:ZS + 420, focus:900, ouverture:1.2}, 'l']]]]);
function plan2(t){
  var p = copie(silasCles(t)); p._n = 'silas';
  var b = dit(t, 1); if(b){ p.v.bouche.o = .2 + b.o * 1.2; p.v.bouche.cri = .5; p.v.bouche.w = .2; }
  respire(p, t, .3, .8, 31);
  if(t > 9.2 && t < POUSSE) pas(p, (t - 9.2) * 2.6, .7);
  p.v.yeux.cl = cligne(t, .9);
  var chaud = U.clamp((t - SILAS) / 3.2, .25, 1), tombe = U.COURBES.choc(U.clamp((t - POUSSE - .05) / .5, 0, 1));
  var silas = {type:'silas', x:XC + silasX(t), z:ZS + silasZ(t), pose:p, o:{tient:{D:'lanterne'}, lanterne:1, kepi:U.clamp((t - POUSSE) / .3, 0, 1) * -24, graine:21}, ombreR:120, _c:{tient:{D:'lanterne'}},
    /* la lumière des torches de la foule monte sur lui (elle vient de nous) */
    lum:{dx:-80, dy:-380, z:200, c:'rgb(' + Math.round(150 + 105 * chaud) + ',' + Math.round(140 + 70 * chaud) + ',' + Math.round(150 + 10 * chaud) + ')', rims:[[-1, -.9, .6, '#8fb0ff'], [1, -.9, .5, '#8fb0ff']]}};
  var barriere = {type:'libre', x:XC, y:0, z:ZS + 150, boite:[560, 300], dessin:function(q){ return '<g transform="translate(' + U.r(q.x) + ' ' + U.r(q.y) + ') scale(' + U.r(q.s) + ')">' + FC.barriere({tombe:tombe}) + '</g>'; }};
  var cam = cam2(t);
  return {zone:'chene', cam:cam, acteurs:[silas, barriere], tremble:t > POUSSE ? 2.5 : t > 9.4 ? 1 : 0, poussiere:90, poussiereBoite:[XC - 1200, -800, ZS - 600, XC + 1200, -60, ZS + 1600], sources:[[XC, -300, ZS + 1500]],
    lumieres:function(){
      /* les torches de la foule, derrière nous : leur lumière danse sur le chemin et sur lui */
      var s = lumieresDe(t, [silas]);
      for(var k = 0; k < 5; k++) s += FC.lumiere(t, XC + (k - 2) * 330 + 60 * Math.sin(t * 1.7 + k), -260, cam.z - 420 - (k % 2) * 120, {sorte:k % 2 ? 'Feu' : 'Chaud', r:520, coeur:0, k:.55 * chaud, graine:60 + k, sol:520, solK:1.5});
      return s + FC.lucioles(t, [XC - 1500, -600, ZS - 2000, XC + 1500, -80, ZS + 600], 16, 9, 1);
    }};
}

/* ================================================================ 3. LE VIEUX CHÊNE (12 → 16,2 s) : le silence, la lune, les gros rochers sur le trou */
var cam3 = plans([[CHENE, [[CHENE, {x:XC - 420, y:-640, z:9300, focus:9700, tangage:.02}], [DERRIERE, {x:XC - 250, y:-1010, z:8550, focus:9050, tangage:.046}, 'io']]]]);
var RAYONS = [[XC - 1900, -2700, -200, 900, 200, .13], [XC - 1150, -2500, 150, 760, 150, .1], [XC + 700, -2600, 300, 620, 170, .09], [XC + 1700, -2400, -100, 540, 220, .1], [XC - 300, -2300, 700, 500, 120, .08]];
function lueurFoule(t, k, zCam){
  /* les lumières des villageois qui arrivent (ils sont derrière nous) : des flaques chaudes qui avancent sur l'herbe */
  var s = '';
  for(var i = 0; i < 7; i++) s += FC.lumiere(t, XC + (i - 3) * 380 + 70 * Math.sin(t * 1.3 + i), -250, zCam - 900 - (i % 3) * 260, {sorte:i % 2 ? 'Feu' : 'Chaud', r:560, coeur:0, k:k, graine:70 + i, sol:640, solK:1.6});
  return s;
}
function plan3(t){
  var cam = cam3(t), arrive = U.lisse(U.clamp((t - CHENE - .6) / 3, 0, 1));
  return {zone:'chene', cam:cam, acteurs:[], portee:.5, poussiere:120, poussiereBoite:[XC - 2600, -2400, -400, XC + 2600, -100, 3000], poussiereCoul:'#cfe0ff', sources:[[XC - 1500, -1500, 400], [XC + 900, -1400, 600]],
    lumieres:function(){ return FC.rayons(t, RAYONS, 1) + lueurFoule(t, .5 * arrive, cam.z) + FC.lucioles(t, [XC - 2600, -1300, -300, XC + 2600, -60, 3600], 46, 13, 1); }};
}

/* ================================================================ 4. DERRIÈRE LE CHÊNE (16,2 → 25,5 s) : l'allumette, la mèche, PFFFT */
var HX = XD - 270, PX = XD - 40, PZ = 150;          /* l'homme en cape ; le pot noir, devant lui */
var hommeCles = U.poses(U.melange(BASE, {w:[0, -168], tk:.95, t:3, tete:{k:10}, jD:{p:[70, -6], g:1}, jG:{p:[-78, 0], g:0}, bD:{ik:1, cible:[92, -96]}, bG:{ik:1, cible:[-84, -110]}, poingD:'poing', poingG:'poing', balance:0}, 1), [
  [DERRIERE, {}],
  [18.5, {tete:{k:9}}],
  /* il sort une allumette de sous sa cape, la lève */
  [19.3, {bD:{cible:[136, -246]}, tete:{k:5}, t:2}, 'io'],
  [CRAC - .2, {bD:{cible:[168, -268]}, bG:{cible:[-40, -176]}}, 'io'],
  /* il la craque sur son brassard, d'un coup sec */
  [CRAC, {bD:{cible:[40, -180]}}, 'i'],
  [CRAC + .5, {bD:{cible:[84, -262]}, bG:{cible:[-84, -120]}, tete:{k:2}}, 'o'],
  [21.2, {bD:{cible:[80, -258]}, tete:{k:3}}, 'l'],
  /* il se penche, et l'approche de la mèche */
  [MECHE - .1, {t:9, tk:.9, tete:{k:14}, w:[10, -158]}, 'io'],
  [MECHE + .3, {}],
  /* ça prend : il lâche l'allumette, se redresse, recule dans l'ombre */
  [23.4, {t:0, tk:1, tete:{k:6}, w:[0, -272], jD:{p:[66, 0], g:0}, jG:{p:[-66, 0], g:0}, bD:{ik:0, a:14, c:-18}, bG:{ik:0, a:14, c:-18}, poingD:'poing', poingG:'poing'}, 'io'],
  [PFFT, {tete:{k:9}}, 'l']
]);
var hommeX = U.piste([[23.0, 0], [PFFT + .4, -520, 'io']]), hommeZ = U.piste([[23.0, 0], [PFFT + .4, -230, 'io']]);
var flamme = U.piste([[CRAC - .02, 0], [CRAC + .05, 2.6, 'o'], [CRAC + .5, 1, 'io'], [MECHE + .25, 1], [MECHE + .5, 0, 'i']]);
var meche = U.piste([[MECHE, 1], [PFFT - .08, 0, 'l']]);
var cam4 = plans([
  [DERRIERE, [[DERRIERE, {x:XD - 130, y:-236, z:1470, focus:5300, ouverture:1.25}], [NET - .2, {x:XD - 134, y:-236, z:1450, focus:5300, ouverture:1.25}, 'l'], [18.7, {x:XD - 140, y:-236, z:1420, focus:1420, ouverture:1.25}, 'io'], [POT, {x:XD - 150, y:-234, z:1340, focus:1340, ouverture:1.25}, 'l']]],
  /* tout près du pot : la mèche qui brûle (derrière, flou, l'homme se relève et s'en va) */
  [POT, [[POT, {x:PX + 80, y:-104, z:PZ + 640, focus:640, ouverture:1.3}], [PFFT, {x:PX + 50, y:-112, z:PZ + 600, focus:600, ouverture:1.3}, 'l'], [FUMEE, {x:PX + 40, y:-190, z:PZ + 820, focus:820, ouverture:1.3}, 'o']]]
]);
/* les lanternes du village, loin, de l'autre côté du chêne : des ronds flous à droite du tronc */
var LOIN = []; (function(){ var R = U.hasard(77); for(var i = 0; i < 13; i++) LOIN.push([XD + 620 + R() * 2300, -250 - R() * 260, -3300 - R() * 1500, R() < .4, i]); })();
function lanternesLoin(t, k){
  var s = '';
  LOIN.forEach(function(l){ s += FC.lumiere(t, l[0] + 40 * Math.sin(t * .7 + l[4]), l[1] + 16 * Math.sin(t * 1.9 + l[4] * 2), l[2], {sorte:l[3] ? 'Feu' : 'Chaud', r:150, coeur:36, k:k, graine:90 + l[4]}); });
  return s;
}
var SRC_POT = [
  {x:PX, y:-128, z:PZ, t0:PFFT, duree:1.2, debit:56, vie:6, jet:[0, -620, 40], ouvert:.42, etale:230, monte:70, r0:20, r1:300, gonfle:.7, dense:.6, graine:3},
  {x:PX - 60, y:-80, z:PZ + 10, t0:PFFT + .05, duree:1.2, debit:22, vie:6, jet:[-420, -150, 80], ouvert:.5, etale:160, monte:50, r0:18, r1:240, dense:.5, graine:5},
  {x:PX + 60, y:-80, z:PZ + 10, t0:PFFT + .05, duree:1.2, debit:22, vie:6, jet:[430, -150, 120], ouvert:.5, etale:160, monte:50, r0:18, r1:240, dense:.5, graine:7}
];
function plan4(t){
  var cam = cam4(t), macro = t >= POT;
  /* (pour poser la main sur la mèche À L'ÉCRAN : la caméra de cette image, sans tremblement) */
  Object.assign(CAM, {x:0, y:-300, z:1800, lacet:0, tangage:0, focus:1800, ouverture:1}, cam);
  var p = copie(hommeCles(t)), hx = HX + hommeX(t), hz = hommeZ(t), fl = flamme(t), ph = CAM.projeter(hx, 0, hz), pp = CAM.projeter(PX, 0, PZ);
  /* le bout de la mèche, vu dans le repère de l'homme */
  var bout = FC.mechePoint(1), cibleM = [(pp.x + bout[0] * pp.s - ph.x) / ph.s - 6, (pp.y + bout[1] * pp.s - ph.y) / ph.s - 30];
  var km = U.lisse(U.clamp((t - 21.25) / (MECHE - .1 - 21.25), 0, 1)) * U.clamp((MECHE + .45 - t) / .1, 0, 1);
  if(km > 0 && t < MECHE + .45) p.bD = Object.assign({}, p.bD, {ik:1, cible:[U.lerp(p.bD.cible[0], cibleM[0], km), U.lerp(p.bD.cible[1], cibleM[1], km)]});
  respire(p, t, .22, .5, 41);
  /* il sort de l'ombre avec l'allumette, il y retourne en partant */
  var parti = U.clamp((t - 23.0) / 1.6, 0, 1), clair = U.clamp(.16 + .84 * U.clamp(fl, 0, 1) - parti * .9, .04, 1), rouge = U.clamp((t - PFFT) / .3, 0, 1);
  var main = function(){ return LeoFace.point(homme.os, 'mainD'); };
  var homme = {type:'leo', x:hx, z:hz, pose:p, o:{habit:'cape', yeuxCape:U.clamp(.1 + 1.0 * U.clamp(fl, 0, 1.2) + (t > MECHE ? .5 : 0) * (1 - parti) - parti * .1 + rouge * .6, 0, 1.4)}, ombreR:170, ombreOp:.5, op:1 - U.clamp((t - PFFT) / .5, 0, 1) * .5,
    lum:{dx:fl > 0 ? 70 : -200, dy:fl > 0 ? -250 : -600, z:fl > 0 ? 90 : 220,
      c:'rgb(' + Math.round(40 + 215 * clair * (fl > 0 ? 1 : .25) + 120 * rouge) + ',' + Math.round(48 + 150 * clair * (fl > 0 ? 1 : .3)) + ',' + Math.round(80 + 40 * clair * (fl > 0 ? 1 : .4)) + ')',
      rims:[[1, -.8, .5 + .5 * rouge, rouge > 0 ? '#ff4a30' : '#c88a50'], [-1, -.9, .22, '#6a84c8']]},
    /* l'allumette dans sa main (le bois ; la flamme est une lumière) */
    plus:function(){ if(!(t > 19.0 && t < MECHE + .45)) return ''; var m = main(); return '<path d="M' + U.r(m[0] + 2) + ' ' + U.r(m[1] + 6) + ' L ' + U.r(m[0] - 8) + ' ' + U.r(m[1] - 46) + '" stroke="#d8b888" stroke-width="5" stroke-linecap="round"/><circle cx="' + U.r(m[0] - 8) + '" cy="' + U.r(m[1] - 48) + '" r="5" fill="' + (fl > 0 ? '#2a1a12' : '#a8322a') + '"/>'; }};
  var feuPot = U.clamp((t - PFFT + .1) / .25, 0, 1), k = meche(t), brule = t >= MECHE && t < PFFT;
  var pot = {type:'libre', x:PX, y:0, z:PZ, dessin:function(q){
    return '<g transform="translate(' + U.r(q.x) + ' ' + U.r(q.y) + ') scale(' + U.r(q.s) + ')">' + FC.pot({feu:feuPot, chaud:Math.max(U.clamp(fl, 0, 1) * (t > 21.3 ? 1 : .4), brule ? .8 : 0)}) + FC.meche(t < MECHE ? 1 : k) + '</g>'; }};
  var fumee = t > PFFT ? FC.fumeeTranches(t, SRC_POT, [-200, PZ - 30, PZ + 60, PZ + 300]) : [];
  var E = {zone:'derriere', cam:cam, acteurs:[homme, pot].concat(fumee), portee:macro ? .35 : .6, tremble:t > PFFT ? 5 * Math.max(0, 1 - (t - PFFT) / .7) : 0, poussiere:70, poussiereBoite:[XD - 900, -700, -300, XD + 900, -40, 900],
    sources:fl > 0 ? [[hx + 80, -250, hz]] : [[XD + 2000, -300, -3000]],
    lumieres:function(){
      var s = lanternesLoin(t, 1 - .5 * rouge);
      /* la flamme de l'allumette : un éclair quand elle prend, puis une petite flamme qui tremble */
      if(fl > 0 && homme.os){
        var m = main(), fx = hx + m[0] - 8, fy = m[1] - 62;
        s += FC.lumiere(t, fx, fy, hz + 6, {sorte:'Feu', r:230 * Math.min(fl, 1.6), coeur:13 * Math.min(fl, 2), k:Math.min(1.2, fl), graine:5});
        var q = CAM.projeter(fx, fy, hz + 6), h = 26 * q.s * Math.min(fl, 1.3) * (1 + .12 * U.bruit(t * 17, 3));
        s += '<path d="M' + U.r(q.x - 5 * q.s) + ' ' + U.r(q.y + 8 * q.s) + ' C ' + U.r(q.x - 9 * q.s) + ' ' + U.r(q.y - h * .3) + ' ' + U.r(q.x + U.bruit(t * 13, 5) * 5 * q.s) + ' ' + U.r(q.y - h * .7) + ' ' + U.r(q.x + U.bruit(t * 9, 7) * 6 * q.s) + ' ' + U.r(q.y - h) + ' C ' + U.r(q.x + 7 * q.s) + ' ' + U.r(q.y - h * .5) + ' ' + U.r(q.x + 9 * q.s) + ' ' + U.r(q.y - h * .2) + ' ' + U.r(q.x + 5 * q.s) + ' ' + U.r(q.y + 8 * q.s) + ' Z" fill="#ffd27a" filter="url(#fl' + Math.min(90, Math.max(1, Math.round(CAM.flou(q.d) * 2))) + ')"/>';
      }
      /* la mèche qui brûle : une étoile qui court vers le pot, des étincelles */
      if(brule){
        var b = FC.mechePoint(k), bx = PX + b[0] * 1, by = b[1], bz = PZ + 2;
        s += FC.lumiere(t, bx, by, bz, {sorte:'Feu', r:150, coeur:16, k:1 + .3 * U.bruit(t * 31, 9), graine:8, sol:190}) + FC.etincelles(t, MECHE, PFFT, bx, by, bz, 70, 4, .8);
      }
      if(t > PFFT){
        var kr = U.clamp((t - PFFT) / .15, 0, 1) * (1 + .5 * Math.max(0, 1 - (t - PFFT) / .5));
        s += FC.lumiere(t, PX, -130, PZ + 10, {sorte:'Rouge', r:620, coeur:60, k:kr, graine:11, sol:520, solK:1.6}) + FC.etincelles(t, PFFT, PFFT + .5, PX, -120, PZ, 160, 6, 1.6);
      }
      return s;
    },
    avant:function(){ return FC.voile(U.clamp((t - PFFT - .2) / 1.0, 0, 1) * .34); },
    fondu:null};
  /* le petit éclair blanc quand l'allumette prend */
  if(t > CRAC - .01 && t < CRAC + .18) E.flare = 1 + 1.6 * (1 - (t - CRAC) / .18);
  return E;
}

/* ================================================================ 5. LA FUMÉE (25,5 → 28,8 s) : elle sort de derrière le tronc et de sous les branches */
var SRC_CHENE = [
  /* le premier souffle (deux secondes, fort), de chaque côté du tronc ; puis elle continue de sortir, plus calme */
  {x:XC - 560, y:-70, z:-480, t0:PFFT, duree:2.2, debit:26, vie:9, jet:[-330, -70, 500], ouvert:.55, etale:330, monte:36, r0:50, r1:400, dense:.5, graine:21, gonfle:.45},
  {x:XC + 600, y:-70, z:-480, t0:PFFT + .1, duree:2.2, debit:26, vie:9, jet:[340, -70, 500], ouvert:.55, etale:330, monte:36, r0:50, r1:400, dense:.5, graine:23, gonfle:.45},
  {x:XC + 60, y:-420, z:-520, t0:PFFT + .2, duree:2.4, debit:16, vie:9, jet:[0, -160, 380], ouvert:.9, etale:300, monte:70, r0:60, r1:400, dense:.44, graine:25, gonfle:.42},
  /* celle qui monte dans les branches */
  {x:XC - 100, y:-300, z:-640, t0:PFFT, duree:3, debit:12, vie:10, jet:[60, -420, 60], ouvert:.6, etale:260, monte:150, r0:60, r1:460, dense:.38, graine:27, gonfle:.36},
  {x:XC - 560, y:-70, z:-480, t0:PFFT + 2.2, debit:7, vie:9, jet:[-200, -60, 300], ouvert:.6, etale:300, monte:40, r0:50, r1:400, dense:.48, graine:121, gonfle:.42},
  {x:XC + 600, y:-70, z:-480, t0:PFFT + 2.3, debit:7, vie:9, jet:[210, -60, 300], ouvert:.6, etale:300, monte:40, r0:50, r1:400, dense:.48, graine:123, gonfle:.42}
];
var COUPES_CHENE = [-460, -280, 200, 600, 1200, 2000];
var cam5 = plans([[FUMEE, [[FUMEE, {x:XC + 60, y:-560, z:5150, focus:5600, tangage:.035}], [CHOC, {x:XC + 30, y:-600, z:4650, focus:5100, tangage:.04}, 'l']]]]);
function braise(t, k, petit){
  /* le pied du chêne rougeoie : la fumée est éclairée par-dessous (petit : devant Silas et le maire, la lueur reste au ras du sol,
     derrière eux — sinon elle voile tout) */
  if(petit) return FC.lumiere(t, XC - 560, -90, -440, {sorte:'Rouge', r:420, coeur:0, k:k, graine:31, sol:620, solK:1.5}) + FC.lumiere(t, XC + 600, -90, -440, {sorte:'Rouge', r:420, coeur:0, k:k, graine:33, sol:620, solK:1.5});
  return FC.lumiere(t, XC - 520, -140, -430, {sorte:'Rouge', r:760, coeur:0, k:k, graine:31, sol:900, solK:1.4}) + FC.lumiere(t, XC + 560, -140, -430, {sorte:'Rouge', r:760, coeur:0, k:k, graine:33, sol:900, solK:1.4}) +
    FC.lumiere(t, XC, -500, -300, {sorte:'Rouge', r:1100, coeur:0, k:k * .5, graine:35});
}
function plan5(t){
  var cam = cam5(t), k = U.clamp((t - PFFT) / 1.2, 0, 1);
  return {zone:'chene', cam:cam, acteurs:FC.fumeeTranches(t, SRC_CHENE, COUPES_CHENE), tremble:1.6 * Math.max(0, 1 - (t - FUMEE) / 1.2), poussiere:60, poussiereBoite:[XC - 2000, -1500, 0, XC + 2000, -100, 3000], sources:[[XC, -200, -300]],
    lumieres:function(){ return FC.rayons(t, RAYONS, 1 - .5 * k) + braise(t, k) + lueurFoule(t, .5, cam.z) + FC.lucioles(t, [XC - 2600, -1300, 600, XC + 2600, -60, 3600], 30, 13, 1 - U.clamp((t - FUMEE) / 2, 0, 1)); },
    avant:function(){ return FC.voile(.03 + .04 * U.clamp((t - FUMEE) / 3, 0, 1)); }};
}
CINE._chene = {plan1:plan1, plan2:plan2, plan3:plan3, plan4:plan4, plan5:plan5, FOULE:FOULE, base:base, pas:pas, visage:visage, tousse:tousse, porte:porte, acteurV:acteurV, lumieresDe:lumieresDe, sources:sources, dit:dit,
  CHOQUE:CHOQUE, PEUR:PEUR, DECIDE:DECIDE, VV:VV, SRC_CHENE:SRC_CHENE, COUPES_CHENE:COUPES_CHENE, braise:braise, lueurFoule:lueurFoule, RAYONS:RAYONS, lanternesLoin:lanternesLoin, HX:HX,
  T:{MARCHE:MARCHE, GROS1:GROS1, SILAS:SILAS, POUSSE:POUSSE, CHENE:CHENE, DERRIERE:DERRIERE, NET:NET, CRAC:CRAC, MECHE:MECHE, POT:POT, PFFT:PFFT, FUMEE:FUMEE, CHOC:CHOC, GROS2:GROS2, MAIRE:MAIRE, CRIE:CRIE, GROS3:GROS3, PARLE:PARLE, GROS4:GROS4, LARGE:LARGE, FUITE:FUITE, YEUX:YEUX, T:T}, LIGNES:LIGNES};

/* le film d'essai du plateau : window.ESSAI = {zone, cam, acteurs} */
CINE.films.vueChene = {plateau:'chene', duree:4, defs:FC.defs, etat:function(t){
  var q = window.ESSAI || {}; if(q.length) q = q[Math.min(q.length - 1, Math.floor(t + .001))];
  return {zone:q.zone || 'chene', cam:q.cam || {x:9000, y:-700, z:5500, focus:6000}, poussiere:0, acteurs:q.acteurs || []};
}};
})();
