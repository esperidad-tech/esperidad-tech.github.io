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
     ramasse, la tête et les épaules partent d'un coup, les poings montent ; rien — il revient aussitôt sur les ennemis), appuis (il
     passe d'un pied sur l'autre, prêt à bondir), garde (il se met en garde, deux petits rebonds), pas (un petit pas vers les ennemis,
     il les fixe, puis revient) ;
   - la Pisteuse : encoche (elle prend une flèche, l'encoche, vise un rat… et relâche doucement la corde, la flèche reste) ;
   - l'Alchimiste : fiole (il saisit une fiole sur sa sangle et la tient prête derrière l'épaule, les yeux sur les rats, puis la remet) ;
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
  /* APPUIS : il passe d'un pied sur l'autre, les genoux souples, prêt à bondir, les yeux sur les ennemis */
  function ap(x, y){ return dur({bas:[x, b.bas[1] + y, b.bas[2]], bang:[b.bang[0], -x * 0.6, b.bang[2]], tete:12, regX:0.6}); }
  A.appuis = [[0.3, ap(-7, 12)], [0.6, ap(6, 16)], [0.9, ap(-6, 12)], [1.2, ap(5, 15)], [1.55, ap(0, 8)], [2.0, {}]];
  /* GARDE : il se ramasse, les poings devant lui, l'air décidé, deux petits rebonds ; puis se détend */
  var Ga = {mainD:[24, 178, 48], relD:1, coudeD:[0.9, 0.3, -0.3], poingD:1, mdirD:[-0.2, 0, 1], hoche:4, regX:0.5};
  A.garde = [[0.2, dur(avec(Ga, {bas:[0, b.bas[1] + 16, b.bas[2]], bang:[b.bang[0] + 3, 0, b.bang[2] + 2]}))], [0.42, dur(avec(Ga, {bas:[0, b.bas[1] + 10, b.bas[2]]}))],
    [0.62, dur(avec(Ga, {bas:[0, b.bas[1] + 17, b.bas[2]]}))], [0.82, dur(avec(Ga, {bas:[0, b.bas[1] + 11, b.bas[2]]}))], [1.5, dur(avec(Ga, {bas:[0, b.bas[1] + 13, b.bas[2]]}))], [1.9, {}]];
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
function alchimiste(A, b){
  /* FIOLE : il saisit une fiole sur sa sangle, la tient prête derrière l'épaule, les yeux sur les rats ; puis la remet */
  var F = {fioleG:1, mainG:[-42, 148, -8], relG:1, coudeG:[-0.7, 0.5, -0.4], pouceG:[0, -1, 0], mdirG:[0, -0.3, 1], poingG:0.9, tete:10, regX:0.6};
  A.fiole = [[0.18, dur({mainG:[-16, 168, 24], relG:1, coudeG:[-0.9, 0.3, -0.2], poingG:0.3, pouceG:[0, -1, 0.3], hoche:8, regY:0.4})],
    [0.28, dur({mainG:[-16, 166, 26], relG:1, coudeG:[-0.9, 0.3, -0.2], poingG:0.92, pouceG:[0, -1, 0.3], fioleG:1, hoche:6, regY:0.3})],
    [0.5, dur(avec(F, {bas:[0, b.bas[1] + 10, b.bas[2]]}))], [1.6, dur(avec(F, {bas:[0, b.bas[1] + 12, b.bas[2]], plisse:0.6}))],
    [1.85, dur({mainG:[-16, 166, 26], relG:1, coudeG:[-0.9, 0.3, -0.2], poingG:0.92, pouceG:[0, -1, 0.3], fioleG:1, hoche:6, regY:0.3})],
    [1.95, dur({mainG:[-16, 168, 24], relG:1, coudeG:[-0.9, 0.3, -0.2], poingG:0.3, pouceG:[0, -1, 0.3], fioleG:0})], [2.4, {}]];
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
HV.NOMS_ATTENTE = {scrute:'Il surveille les ennemis', alerte:'Un bruit derrière !', appuis:'Prêt à bondir', garde:'Il se met en garde', pas:'Un pas vers les ennemis',
  encoche:'Elle encoche une flèche', fiole:'Il tient une fiole prête', charge:'Elle charge son cristal', tape:'Elle frappe le sol de son bâton'};
})(window);
