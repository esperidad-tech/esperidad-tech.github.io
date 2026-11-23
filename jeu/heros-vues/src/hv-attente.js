/* ==========================================================
   Les héros « en volume » — CE QU'ILS FONT EN ATTENDANT, au donjon. Chargé après hv-alchimiste.js et hv-sage.js.
   Deuxième version (Romain, 23 novembre, 22 h 48 : « les mouvements d'attente, ils sont pas bons […] comme il y a des ennemis en
   face, il faut qu'ils se mettent en garde. Là, on a l'impression qu'ils sont touristes, ils sont contents, ils sourient, ils sont
   entre eux, alors qu'il y a des monstres en face […] c'est pas qu'ils ont peur, mais ils se préparent à l'attaque. Et ils surveillent
   les rats. Ils ont des mouvements vifs. Quand ils regardent à gauche, à droite, c'est rapide au cas où il y a quelqu'un qui arrive.
   Ils sont sur leur garde […] On peut pas faire des mouvements d'attente qui soient tranquilles »).
   Plus de sourires ni de regards entre amis : TOUS les gestes sont ceux de quelqu'un qui se prépare à se battre — l'air dur (les
   sourcils froncés, les yeux plissés), les yeux sur les ennemis ; la tête part vite (en 0,1 à 0,15 s) et reste, puis revient vite.
   HV.attentes(role, base) → {nom: images clés} (pour cette garde) :
   - pour tous : scrute (des coups d'œil vifs sur les ennemis, en haut, en bas, un vers l'arrière), alerte (un bruit derrière : il se
     ramasse, la tête et les épaules partent d'un coup, les poings montent ; rien — il revient aussitôt sur les ennemis), garde (il se
     ramasse en garde et reste immobile), pas (un petit pas vers les ennemis, il les fixe, puis revient) — « appuis » est enlevé
     (Romain, 23 h 09 : « une sorte de petite danse ») ;
   - la Pisteuse : encoche (elle prend une flèche, l'encoche, vise un rat… et relâche doucement la corde, la flèche reste) ;
   - l'Alchimiste (23 h 09 : « il devrait plus regarder ses potions, se préparer avec ses potions ») : fiole (il lève une fiole devant
     son visage, la secoue, la regarde de près ; un regard sur les rats ; il la remet), compte (il vérifie ses fioles du bout de l'index,
     vite), prete (une fiole dans chaque main, ramassé, prêt à lancer) — la fiole toujours devant lui ;
   - le Sage : charge (elle serre son bâton à deux mains, le cristal se charge, elle fixe les rats), tape (elle frappe le sol de son
     bâton, sûre d'elle).
   L'adaptateur en tire un au hasard toutes les 3 à 5,5 secondes, jamais deux fois le même de suite, chacun à son rythme.
   Rappel des sens : tete > 0, la tête tourne vers SA gauche (vers les ennemis, à droite de l'écran) ; < 0, vers nous puis derrière.
   ========================================================== */
(function(G){
'use strict';
var HV = G.HerosVues, avec = HV.avec, cache = {};
/* (l'air dur : le visage de quelqu'un qui se prépare à se battre) */
var DUR = {sourcils:-0.85, plisse:0.45, sourire:-0.35, largeB:0.7};
function dur(o){ return avec(DUR, o || {}); }

function communs(b){
  var A = {};
  /* SCRUTE : vers les ennemis en haut, en bas, un coup d'œil vif derrière, et retour */
  A.scrute = [[0.13, dur({tete:24, hoche:-7, regX:0.8, regY:-0.4, dos:[b.dos[0], 0, b.dos[2] + 3]})], [0.75, dur({tete:26, hoche:-8, regX:0.7, regY:-0.4, dos:[b.dos[0], 0, b.dos[2] + 3]})],
    [0.88, dur({tete:18, hoche:9, regX:0.7, regY:0.6})], [1.45, dur({tete:20, hoche:10, regX:0.6, regY:0.6})],
    [1.57, dur({tete:-34, hoche:0, regX:-0.9, regY:0, sourcils:-0.4, plisse:0.2, dos:[b.dos[0], 0, b.dos[2] - 8]})], [1.9, dur({tete:-36, regX:-0.9, sourcils:-0.4, plisse:0.2, dos:[b.dos[0], 0, b.dos[2] - 8]})],
    [2.02, dur({tete:10, regX:0.6})], [2.6, {}]];
  /* ALERTE : un bruit derrière — il se ramasse, la tête et les épaules partent d'un coup, les poings montent ; rien : il revient vite */
  var Al = {bas:[0, b.bas[1] + 14, b.bas[2]], dos:[b.dos[0], 0, b.dos[2] - 18], bang:[b.bang[0], 0, b.bang[2] - 8], tete:-30, regX:-0.9, ouvre:0.15,
    mainD:[30, 186, 44], relD:1, coudeD:[0.9, 0.3, -0.3], poingD:1, sourcils:-0.3, sourcilsIn:0.3, plisse:0.1};
  A.alerte = [[0.12, dur(avec(Al, {tete:-20}))], [0.24, dur(Al)], [0.85, dur(Al)], [1.0, dur({tete:12, regX:0.7, bas:[0, b.bas[1] + 8, b.bas[2]]})], [1.7, dur({regX:0.4})], [2.1, {}]];
  /* (APPUIS — passer d'un pied sur l'autre — ENLEVÉ : Romain, 23 novembre, 23 h 09 : « à un moment donné, je sais pas, ils font une
     sorte de petite danse, et ça, c'est trop bizarre […] vers les 9 secondes, t'as le pisteur qui se met un peu à dandiner ») */
  /* GARDE : il se ramasse d'un coup, les poings devant lui, l'air décidé, et reste ramassé, immobile, les yeux sur les ennemis ; puis
     se détend (plus de petits rebonds : avec les appuis, ça faisait danser — Romain, 23 h 09) */
  var Ga = {mainD:[24, 178, 48], relD:1, coudeD:[0.9, 0.3, -0.3], poingD:1, mdirD:[-0.2, 0, 1], hoche:4, regX:0.5};
  A.garde = [[0.16, dur(avec(Ga, {bas:[0, b.bas[1] + 15, b.bas[2]], bang:[b.bang[0] + 3, 0, b.bang[2] + 2]}))], [1.3, dur(avec(Ga, {bas:[0, b.bas[1] + 14, b.bas[2]], bang:[b.bang[0] + 3, 0, b.bang[2] + 2], plisse:0.6}))], [1.75, {}]];
  /* PAS : un petit pas vers les ennemis (le pied se lève, se pose), le buste en avant, il les fixe ; puis il revient */
  var pg = b.piedG, Pa = {piedG:[pg[0] - 2, pg[1], pg[2] + 24], bas:[0, b.bas[1] + 6, b.bas[2] + 10], bang:[b.bang[0] + 5, 0, b.bang[2] + 4], tete:8, regX:0.6, hoche:-3};
  A.pas = [[0.18, dur({piedG:[pg[0] - 1, pg[1] - 14, pg[2] + 12], pointeG:20, bas:[0, b.bas[1] + 4, b.bas[2] + 4]})], [0.34, dur(Pa)], [1.3, dur(avec(Pa, {plisse:0.6}))],
    [1.5, dur({piedG:[pg[0] - 1, pg[1] - 14, pg[2] + 12], pointeG:20, bas:[0, b.bas[1] + 4, b.bas[2] + 4]})], [1.66, dur({})], [2.0, {}]];
  return A;
}
function pisteur(A, b){
  /* ENCOCHE : elle prend une flèche, l'encoche, vise un rat… et relâche doucement la corde (le tir du donjon, sans lâcher) */
  A.encoche = HV.flecheSortie({base:b, tourne:105, lache:false});
}
/* L'ALCHIMISTE ET SES POTIONS (Romain, 23 novembre, 23 h 09 : « l'alchimiste, il fait pas assez de mouvements. Il devrait plus regarder
   ses potions, se préparer avec ses potions » ; et « on voit la potion qui disparaît sous une texture » : la fiole tenue derrière
   l'épaule passait sous son buste) — trois gestes à lui (sur sept, il s'occupe de ses potions presque une fois sur deux) ; la fiole
   est toujours tenue DEVANT lui, jamais derrière son épaule. */
function alchimiste(A, b){
  /* (prendre une fiole sur la sangle, à droite de sa poitrine ; la remettre) */
  var SANGLE = {mainG:[-16, 166, 26], relG:1, coudeG:[-0.9, 0.3, -0.2], pouceG:[0, -1, 0.3], mdirG:[0.2, -0.2, 1]};
  function prend(t, f){ return [t, dur(avec(SANGLE, {poingG:f ? 0.92 : 0.3, fioleG:f ? 1 : 0, hoche:9, regY:0.5}))]; }
  /* FIOLE : il prend une fiole, la lève devant son visage et la regarde de près, la secoue deux fois d'un coup sec (le mélange est
     prêt ?), les yeux plissés ; un regard vif sur les rats, la fiole prête devant sa poitrine ; il la remet */
  var VOIT = {fioleG:1, mainG:[-6, 100, 46], relG:1, coudeG:[-0.8, 0.6, -0.3], pouceG:[0, -1, 0.1], mdirG:[0.3, -0.1, 1], poingG:0.92, tete:-4, hoche:6, regY:0.45, regX:-0.3, plisse:0.7};
  A.fiole = [prend(0.16, false), prend(0.26, true),
    [0.5, dur(VOIT)],
    [0.6, dur(avec(VOIT, {mainG:[-4, 98, 48], pouceG:[0.45, -1, 0.1]}))], [0.68, dur(avec(VOIT, {mainG:[-8, 102, 44], pouceG:[-0.45, -1, 0.1]}))],
    [0.76, dur(avec(VOIT, {mainG:[-4, 98, 48], pouceG:[0.45, -1, 0.1]}))], [0.84, dur(avec(VOIT, {mainG:[-8, 102, 44], pouceG:[-0.45, -1, 0.1]}))],
    [1.2, dur(avec(VOIT, {sourcils:-0.6, plisse:0.8}))],
    /* (le regard vif sur les rats, la fiole prête devant sa poitrine) */
    [1.32, dur({fioleG:1, mainG:[-20, 160, 42], relG:1, coudeG:[-0.9, 0.4, -0.3], pouceG:[0, -1, 0.1], mdirG:[0.3, -0.1, 1], poingG:0.92, tete:14, regX:0.8, bas:[0, b.bas[1] + 10, b.bas[2]]})],
    [1.9, dur({fioleG:1, mainG:[-20, 160, 42], relG:1, coudeG:[-0.9, 0.4, -0.3], pouceG:[0, -1, 0.1], mdirG:[0.3, -0.1, 1], poingG:0.92, tete:14, regX:0.8, plisse:0.6, bas:[0, b.bas[1] + 11, b.bas[2]]})],
    prend(2.12, true), prend(2.22, false), [2.6, {}]];
  /* COMPTE : il vérifie ses fioles du bout de l'index, vite, de l'épaule à la hanche — tac, tac, tac —, les yeux baissés ; puis un
     regard sec sur les rats */
  var C = dur({relG:1, coudeG:[-0.9, 0.3, -0.3], poingG:0.6, indexG:1, pouceG:[0, -1, 0.3], mdirG:[0.3, 0.3, 1], hoche:16, regY:0.7, regX:-0.1});
  function tape(t, m, enfonce){ return [t, avec(C, {mainG:[m[0], m[1], m[2] + (enfonce ? -3 : 3)]})]; }
  A.compte = [tape(0.22, [-22, 152, 34]), tape(0.3, [-22, 152, 34], true), tape(0.44, [-6, 168, 42]), tape(0.52, [-6, 168, 42], true),
    tape(0.66, [10, 183, 41]), tape(0.74, [10, 183, 41], true), tape(0.88, [20, 195, 35]), tape(0.96, [20, 195, 35], true),
    [1.08, dur({tete:14, regX:0.8, hoche:-2, plisse:0.6})], [1.6, dur({tete:14, regX:0.8, hoche:-2, plisse:0.6})], [1.9, {}]];
  /* PRÊT : il prend une fiole dans chaque main et se ramasse, les deux fioles devant lui, prêt à lancer, les yeux sur les rats ; puis
     il les remet */
  var DEUX = {fioleG:1, fioleD:1, mainG:[-22, 172, 44], relG:1, coudeG:[-0.9, 0.4, -0.3], pouceG:[0, -1, 0.1], mdirG:[0.3, -0.1, 1], poingG:0.92,
    mainD:[26, 176, 40], relD:1, coudeD:[0.9, 0.4, -0.3], pouceD:[0, -1, 0.1], mdirD:[-0.3, -0.1, 1], poingD:0.92, tete:12, regX:0.8};
  A.prete = [prend(0.16, false), [0.26, dur(avec(SANGLE, {poingG:0.92, fioleG:1, mainD:[16, 186, 30], relD:1, coudeD:[0.9, 0.3, -0.3], poingD:0.92, fioleD:1, mdirD:[-0.3, -0.1, 1], pouceD:[0, -1, 0.1], hoche:9, regY:0.5}))],
    [0.5, dur(avec(DEUX, {bas:[0, b.bas[1] + 15, b.bas[2]], bang:[b.bang[0] + 3, 0, b.bang[2] + 2]}))],
    [1.5, dur(avec(DEUX, {mainG:[-22, 170, 46], mainD:[26, 174, 42], bas:[0, b.bas[1] + 16, b.bas[2]], bang:[b.bang[0] + 3, 0, b.bang[2] + 2], plisse:0.6}))],
    [1.76, dur(avec(SANGLE, {poingG:0.92, fioleG:1, mainD:[16, 186, 30], relD:1, coudeD:[0.9, 0.3, -0.3], poingD:0.92, fioleD:1, mdirD:[-0.3, -0.1, 1], pouceD:[0, -1, 0.1], hoche:9, regY:0.5}))],
    prend(1.88, false), [2.3, {}]];
}
function sage(A, b){
  /* CHARGE : elle serre son bâton à deux mains, le cristal se charge, elle fixe les rats, les genoux fléchis */
  var C = {mainD:[-46, 212, 6], relD:1, coudeD:[0.7, 0.4, 0.3], mdirD:[-1, 0, 0.2], poingD:0.9, pouceD:[0, -1, 0], tete:12, regX:0.6,
    bas:[0, b.bas[1] + 12, b.bas[2]], dos:[b.dos[0] + 4, 0, b.dos[2] - 10], bang:[b.bang[0], 0, b.bang[2] - 6]};
  A.charge = [[0.3, dur(avec(C, {cristal:0.5}))], [0.7, dur(avec(C, {cristal:1, plisse:0.6}))], [1.5, dur(avec(C, {cristal:1, plisse:0.6}))], [1.8, dur({cristal:0.4})], [2.2, {}]];
  /* TAPE : elle frappe le sol de son bâton, sûre d'elle */
  var mg = b.mainG;
  A.tape = [[0.3, dur({mainG:[mg[0], mg[1] - 18, mg[2]], tete:8, regX:0.5})], [0.42, dur({mainG:[mg[0], mg[1] + 3, mg[2]], bas:[0, b.bas[1] + 8, b.bas[2]], cristal:0.9, tete:8, regX:0.5})],
    [0.7, dur({mainG:[mg[0], mg[1] + 2, mg[2]], cristal:0.5, tete:8, regX:0.5})], [1.3, {}]];
}
var PROPRES = {pisteur:pisteur, alchimiste:alchimiste, sage:sage};
HV.attentes = function(role, base){
  var k = role + ':' + (base === HV.POSES.aGarde ? 'a' : base === HV.POSES.sGarde ? 's' : 'd');
  if(cache[k]) return cache[k];
  var A = communs(base);
  if(PROPRES[role]) PROPRES[role](A, base);
  return (cache[k] = A);
};
HV.NOMS_ATTENTE = {scrute:'Il surveille les ennemis', alerte:'Un bruit derrière !', garde:'Il se met en garde', pas:'Un pas vers les ennemis',
  encoche:'Elle encoche une flèche', fiole:'Il vérifie une fiole', compte:'Il vérifie ses fioles', prete:'Deux fioles prêtes', charge:'Elle charge son cristal', tape:'Elle frappe le sol de son bâton'};
})(window);
