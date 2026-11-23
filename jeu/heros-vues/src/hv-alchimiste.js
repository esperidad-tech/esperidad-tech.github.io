/* ==========================================================
   Les héros « en volume » — L'ALCHIMISTE AU DONJON (Romain, 23 novembre, 20 h 46 : « tu peux faire toutes les animations pour
   l'alchimiste. Et pour les animations spéciales alchimiste, donc à savoir la préparation des potions et tout ça, tu me fais un truc
   vraiment sympa où on voit vraiment l'effet 3D du personnage. Et après, toutes les autres animations, tu peux reprendre celles que
   tu as fait pour le pisteur »). Chargé après hv-donjon.js.
   - HV.POSES.aGarde : sa garde (sans arc : les poings prêts) ;
   - HV.ALCHI.preparer : il prend une fiole sur sa sangle, SE TOURNE VERS NOUS, y émiette des herbes (elle prend sa couleur), fait
     UNE PIROUETTE en l'air en la secouant (on le voit sous toutes ses faces), la lève vers la lumière, puis revient face aux
     ennemis, la fiole armée derrière l'épaule (HV.ALCHI.PRET : la pose où il attend de la lancer) ;
   - HV.ALCHI.lancer : l'élan (le buste se tourne loin de la cible, le bras part haut derrière), le pas, le fouet du bras par-dessus
     l'épaule, la fiole part (HV.ALCHI.LACHE, en secondes), le bras finit en travers du corps ;
   - HV.ALCHI.louche : la petite marmite dans la main gauche, la grande louche dans la droite, levée très haut, et BONG (à 0,6 s :
     HV.ALCHI.BONG, comme le son du donjon) ; deux rebonds ; il se tourne vers nous et fait tournoyer la louche (deux tours) ; il
     les range ;
   - HV.ALCHI.herbes : une poignée d'herbes prise dans une sacoche, il se tourne vers nous et la lance en l'air d'un grand geste
     par en dessous (HV.ALCHI.HERBES : quand elles partent).
   Tous les autres gestes (arriver, son tour, les coups, tomber, se relever, la victoire, la toile, le crapaud…) sont ceux de la
   Pisteuse (HV.DONJON), joués sur sa garde.
   ========================================================== */
(function(G){
'use strict';
var HV = G.HerosVues, P = HV.POSES, avec = HV.avec;

/* SA GARDE : comme celle de la Pisteuse (les pieds, le buste), mais les deux poings prêts, devant lui */
P.aGarde = avec(P.dGarde, {mainG:[-44, 212, 34], relG:1, coudeG:[-0.85, 0.3, -0.45], poingG:0.7, pouceG:[0, -1, 0.25], mdirG:[0.2, 0.2, 1],
  mainD:[40, 206, 30], poingD:0.6});
var g = P.aGarde;

/* (se tourner vers nous : la tête, les épaules, les hanches, et les pieds font un pas — pas un socle qui tourne) */
var FACE = HV.tour(g, -55, 4);
function versNous(plus){ return avec(FACE, plus || {}); }

/* ---------- PRÉPARER ----------
   0 → 0,32 : la main droite prend une fiole sur la sangle (une fiole d'eau claire) ;
   → 0,66 : il se tourne vers nous et la tient devant son menton, émerveillé ;
   → 1,16 : la main gauche prend une pincée d'herbes dans une sacoche et l'émiette dessus : la potion prend sa couleur
     (HV.ALCHI.VERSE : l'adaptateur change la couleur et fait des étincelles) ;
   → 1,84 : LA PIROUETTE — il plie les genoux, saute et fait un tour complet sur lui-même en secouant la fiole au-dessus de lui
     (on le voit de face, de profil avec ses fioles, de dos avec son chignon, de l'autre profil) ; il retombe face à nous ;
   → 2,14 : il lève la fiole vers la lumière, elle brille (HV.ALCHI.ECLAT) ; → 2,66 : il revient face aux ennemis, la fiole armée
     derrière l'épaule (HV.ALCHI.PRET). */
var PRET = avec(g, {fioleG:1, mainG:[-42, 148, -8], relG:1, coudeG:[-0.7, 0.5, -0.4], pouceG:[0, -1, 0], mdirG:[0, -0.3, 1], poingG:0.9, sourcils:-0.6, plisse:0.3, sourire:0.2});
/* (après la pirouette, il a fait un tour : on le garde, sinon il retournerait en arrière) */
function tour1(o){ return avec(o, {tourne:-360}); }
var TIENT = {fioleG:1, mainG:[-8, 132, 48], relG:1, coudeG:[-0.75, 0.5, -0.3], pouceG:[0, -1, 0], mdirG:[0.2, 0, 1], poingG:0.92};
/* (en l'air : la fiole secouée au-dessus de lui, l'autre bras ouvert pour l'équilibre, les pointes de pied tendues) */
function enLair(leve, tr, haut){
  return versNous({leve:leve, tourne:tr, fioleG:1, mainG:[-40, 72 + haut, 18], relG:1, coudeG:[-0.8, 0.2, -0.4], pouceG:[0.2, -1, 0], mdirG:[0, -1, 0.2], poingG:0.92,
    mainD:[74, 178, 12], relD:1, coudeD:[1, 0.2, -0.3], poingD:0.2, pouceD:[0, -1, 0.3], bas:[0, 14, 0], pointeG:26, pointeD:26,
    regY:-0.7, regX:-0.3, hoche:-8, sourire:1, ouvre:0.55, largeB:0.9, sourcils:0.8, plisse:0.35});
}
var preparer = [
  /* (la main droite va chercher une fiole sur la sangle ; il la regarde) */
  [0.2, {mainG:[-14, 168, 24], relG:1, coudeG:[-0.9, 0.3, -0.2], poingG:0.3, pouceG:[0, -1, 0.3], hoche:10, regY:0.6, sourcils:0.2}],
  [0.32, {mainG:[-14, 166, 26], relG:1, coudeG:[-0.9, 0.3, -0.2], poingG:0.92, pouceG:[0, -1, 0.3], fioleG:1, hoche:10, regY:0.6, sourire:0.3}],
  /* (il se tourne vers nous, la fiole devant son menton, émerveillé) */
  [0.66, versNous(avec(TIENT, {mainD:[30, 206, 30], relD:1, poingD:0.4, regY:-0.2, sourcils:0.8, plisse:-0.3, ouvre:0.25, largeB:0.6, hoche:-6}))],
  /* (la main gauche prend une pincée d'herbes dans la sacoche…) */
  [0.8, versNous(avec(TIENT, {mainD:[36, 222, 26], relD:1, coudeD:[0.9, 0.3, -0.2], poingD:0.3, pouceD:[0, -1, 0.3], hoche:8, regY:0.6, regX:0.4, sourcils:0.3, sourire:0.4}))],
  [0.92, versNous(avec(TIENT, {herbes:1, mainD:[34, 216, 30], relD:1, coudeD:[0.9, 0.3, -0.2], poingD:0.85, pouceD:[0, -1, 0.3], hoche:6, regY:0.5, regX:0.3, sourire:0.5}))],
  /* (… et l'émiette au-dessus de la fiole : la potion prend sa couleur) */
  [1.08, versNous(avec(TIENT, {herbes:1, mainD:[10, 96, 52], relD:1, coudeD:[0.8, 0.5, -0.2], poingD:0.85, pouceD:[-1, 0, 0.3], mdirD:[-0.3, -0.2, 1], regY:-0.3, sourcils:0.6, sourire:0.6, plisse:0.2}))],
  [1.18, versNous(avec(TIENT, {herbes:0, mainD:[14, 94, 52], relD:1, coudeD:[0.8, 0.5, -0.2], poingD:0.1, pouceD:[-1, 0, 0.3], mdirD:[-0.3, -0.2, 1], regY:-0.2, sourcils:0.9, sourire:0.9, ouvre:0.4, largeB:0.8}))],
  /* (LA PIROUETTE : il plie les genoux, saute, fait un tour complet en secouant la fiole, retombe) */
  [1.3, versNous({fioleG:1, mainG:[-30, 150, 40], relG:1, coudeG:[-0.8, 0.4, -0.3], pouceG:[0, -1, 0], poingG:0.92, mainD:[40, 196, 34], relD:1, poingD:0.3,
    bas:[0, 46, 4], dos:[16, 0, 0], hoche:6, sourire:0.9, sourcils:0.7, plisse:0.4})],
  [1.4, enLair(10, -30, 6)], [1.52, enLair(24, -130, -6)], [1.64, enLair(22, -240, 6)], [1.76, enLair(8, -335, -6)],
  [1.84, tour1(versNous({fioleG:1, mainG:[-52, 106, 20], relG:1, coudeG:[-0.8, 0.4, -0.3], pouceG:[0, -1, 0], poingG:0.92, mainD:[66, 190, 20], relD:1, poingD:0.3,
    bas:[0, 50, 6], dos:[14, 0, 0], hoche:8, sourire:1, ouvre:0.3, sourcils:0.6, plisse:0.5}))],
  /* (il lève la fiole vers la lumière : elle brille) */
  [2.14, tour1(versNous({fioleG:1, mainG:[-66, 86, 6], relG:1, coudeG:[-0.8, 0.2, -0.4], pouceG:[0, -1, 0], mdirG:[0, -1, 0.2], poingG:0.92,
    mainD:[42, 204, 24], relD:1, poingD:0.6, bas:[0, 6, 0], regY:-0.85, regX:-0.5, hoche:-10, sourire:1, ouvre:0.45, largeB:0.9, sourcils:0.8, plisse:0.35}))],
  [2.32, tour1(versNous({fioleG:1, mainG:[-66, 84, 6], relG:1, coudeG:[-0.8, 0.2, -0.4], pouceG:[0, -1, 0], mdirG:[0, -1, 0.2], poingG:0.92,
    mainD:[42, 204, 24], relD:1, poingD:0.6, bas:[0, 6, 0], regY:-0.85, regX:-0.5, hoche:-10, sourire:1, ouvre:0.3, largeB:0.9, sourcils:0.8, plisse:0.35}))],
  /* (il revient face aux ennemis, la fiole armée derrière l'épaule, décidé) */
  [2.66, tour1(PRET)], [2.8, tour1(PRET)]];

/* ---------- LANCER (depuis PRET) ---------- */
var LACHE = 0.56;
var lancer = [[0.01, PRET],
  /* (l'élan : le buste se tourne loin de la cible, le bras part haut derrière, le poids sur la jambe de derrière) */
  [0.24, {fioleG:1, mainG:[-60, 112, -58], relG:1, coudeG:[-0.6, -0.5, -0.6], pouceG:[0, -1, -0.3], mdirG:[0, -0.5, -1], poingG:0.92,
    bang:[2, 0, -22], dos:[-8, 0, -30], bas:[0, 30, -14], hoche:-6, tete:20, mainD:[52, 170, 52], relD:1, coudeD:[0.8, 0.2, -0.4], poingD:0.4, sourcils:-0.9, plisse:0.5, ouvre:0.3}],
  [0.34, {fioleG:1, mainG:[-62, 104, -64], relG:1, coudeG:[-0.6, -0.6, -0.6], pouceG:[0, -1, -0.3], mdirG:[0, -0.5, -1], poingG:0.92,
    bang:[2, 0, -26], dos:[-10, 0, -34], bas:[0, 30, -16], hoche:-6, tete:24, mainD:[56, 166, 56], relD:1, coudeD:[0.8, 0.2, -0.4], poingD:0.4, sourcils:-1, plisse:0.6, ouvre:0.4}],
  /* (le fouet : le bras passe par-dessus l'épaule, le buste se retourne vers la cible) */
  [0.47, {fioleG:1, mainG:[-30, 84, 14], relG:1, coudeG:[-0.7, -0.5, -0.2], pouceG:[0, -1, 0.5], mdirG:[0, -0.3, 1], poingG:0.92,
    bang:[6, 0, 2], dos:[8, 0, 6], bas:[0, 28, 6], hoche:-2, tete:6, mainD:[50, 200, 20], relD:1, poingD:0.6, sourcils:-1, plisse:0.6, ouvre:0.6}],
  [LACHE - 0.02, {fioleG:1, mainG:[-12, 140, 76], relG:1, coudeG:[-0.6, 0.2, 0.3], pouceG:[0, -0.6, 1], mdirG:[0, 0.3, 1], poingG:0.6,
    bang:[10, 0, 12], dos:[16, 0, 18], bas:[0, 32, 14], hoche:4, tete:-4, mainD:[46, 212, -6], relD:1, poingD:0.7, sourcils:-1, plisse:0.5, ouvre:0.7, largeB:0.8}],
  [LACHE + 0.03, {fioleG:0, mainG:[0, 168, 80], relG:1, coudeG:[-0.5, 0.4, 0.3], pouceG:[0, 0, 1], mdirG:[0.2, 0.5, 1], poingG:0.05,
    bang:[12, 0, 14], dos:[18, 0, 20], bas:[0, 33, 16], hoche:6, tete:-6, mainD:[46, 214, -10], relD:1, poingD:0.7, sourcils:-0.8, plisse:0.4, ouvre:0.5}],
  /* (le bras finit en travers du corps, il regarde la fiole voler) */
  [0.82, {mainG:[22, 214, 46], relG:1, coudeG:[-0.4, 0.6, 0.2], poingG:0.3, bang:[10, 0, 12], dos:[16, 0, 16], bas:[0, 32, 14], hoche:4, tete:-8, regX:0.6, sourcils:-0.4, sourire:0.3}],
  [1.05, {mainG:[0, 214, 40], relG:1, coudeG:[-0.6, 0.4, -0.2], poingG:0.5, bang:[8, 0, 6], dos:[12, 0, 6], bas:[0, 30, 8], regX:0.5, sourire:0.5, sourcils:-0.2}],
  [1.45, {}]];

/* ---------- LA LOUCHE (le BONG à 0,6 s) ---------- */
var BONG = 0.6;
function tient(plus){ return avec({louche:1, marmite:1, mainD:[24, 178, 46], relD:1, coudeD:[0.8, 0.4, -0.3], pouceD:[0, -1, 0], mdirD:[-0.4, 0, 1], poingD:0.9}, plus); }
var louche = [
  [0.14, {mainG:[-30, 226, 12], relG:1, poingG:0.9, mainD:[30, 226, 12], relD:1, poingD:0.9, hoche:8, sourcils:-0.6}],
  [0.27, tient({mainG:[-34, 122, -4], relG:1, coudeG:[-0.7, -0.3, -0.5], pouceG:[0, -1, -0.2], mdirG:[0, -0.6, 1], poingG:0.95, sourcils:-0.8, ouvre:0.3, regY:0.3})],
  /* (la louche levée très haut, le dos cambré, il crie) */
  [0.46, tient({mainG:[-10, 46, -14], relG:1, coudeG:[-0.5, -0.8, -0.2], pouceG:[0.1, -1, -0.5], mdirG:[0, -0.4, 1], poingG:0.95, brasDessus:1, dos:[2, 0, -6], hoche:-10, sourcils:-1, ouvre:0.75, largeB:0.9, plisse:0.4, regY:0.4})],
  /* (BONG : elle s'abat sur la marmite) */
  [BONG, tient({mainG:[10, 164, 52], relG:1, coudeG:[-0.5, -0.2, 0.2], pouceG:[0.4, 0.7, 0.7], mdirG:[0.2, 0.6, 1], poingG:0.95, dos:[16, 0, 4], bas:[0, 34, 6], hoche:10, plisse:0.9, sourcils:-1, ouvre:0.5, largeB:0.7})],
  [0.72, tient({mainG:[0, 132, 46], relG:1, coudeG:[-0.6, 0, 0], pouceG:[0.2, -0.2, 1], mdirG:[0.1, 0, 1], poingG:0.95, dos:[8, 0, 2], hoche:2, plisse:0.4, sourire:0.7, ouvre:0.3})],
  [0.86, tient({mainG:[10, 162, 52], relG:1, coudeG:[-0.5, -0.2, 0.2], pouceG:[0.4, 0.7, 0.7], mdirG:[0.2, 0.6, 1], poingG:0.95, dos:[12, 0, 2], hoche:6, plisse:0.6, sourire:0.6})],
  [1.0, tient({mainG:[0, 134, 46], relG:1, coudeG:[-0.6, 0, 0], pouceG:[0.2, -0.2, 1], mdirG:[0.1, 0, 1], poingG:0.95, dos:[6, 0, 0], sourire:0.9, plisse:0.4, ouvre:0.2})],
  [1.12, tient({mainG:[10, 160, 52], relG:1, coudeG:[-0.5, -0.2, 0.2], pouceG:[0.4, 0.7, 0.7], mdirG:[0.2, 0.6, 1], poingG:0.95, dos:[10, 0, 2], hoche:4, sourire:0.8, plisse:0.5})],
  /* (fier de lui, il se tourne vers nous et fait tournoyer la louche dans sa main, deux tours, comme un cow-boy son pistolet : le
     cuilleron vient vers nous et repart derrière) */
  [1.3, versNous(tient({mainG:[-52, 172, 40], relG:1, coudeG:[-0.9, 0.3, -0.2], pouceG:[0, -1, 0.2], mdirG:[0, 0, 1], poingG:0.95, loucheR:0,
    sourire:1, plisse:0.45, sourcils:0.5, regX:-0.4, hoche:-4}))],
  [1.66, versNous(tient({mainG:[-54, 168, 42], relG:1, coudeG:[-0.9, 0.3, -0.2], pouceG:[0, -1, 0.2], mdirG:[0, 0, 1], poingG:0.95, loucheR:720,
    sourire:1, plisse:0.5, sourcils:0.6, regX:-0.5, hoche:-6, ouvre:0.2}))],
  /* (il les range à la ceinture et revient en garde) */
  [1.9, tient({mainG:[-30, 226, 12], relG:1, poingG:0.9, mainD:[30, 226, 12], loucheR:720, hoche:8, sourire:0.5})],
  [2.02, {louche:0, marmite:0, loucheR:720, mainG:[-30, 226, 12], relG:1, poingG:0.5, mainD:[30, 226, 12], relD:1, poingD:0.5, hoche:6, sourire:0.4}],
  [2.35, {loucheR:720}]];

/* ---------- LES HERBES (pour l'équipe : il se tourne vers nous et les lance en l'air, elles retombent en pluie) ---------- */
var HERBES = 0.72;
var herbes = [
  [0.2, {mainD:[36, 230, 6], relD:1, coudeD:[0.9, 0.2, -0.3], poingD:0.3, hoche:10, regY:0.6}],
  [0.34, {herbes:1, mainD:[32, 214, 22], relD:1, coudeD:[0.9, 0.2, -0.3], pouceD:[0, -1, 0.3], poingD:0.85, hoche:6, sourire:0.4}],
  /* (il se tourne vers nous, la main basse derrière, l'élan ; les genoux plient) */
  [0.56, versNous({herbes:1, mainD:[50, 236, -22], relD:1, coudeD:[0.9, 0.3, -0.3], pouceD:[0, -1, 0], mdirD:[0, 0.5, -1], poingD:0.85, bas:[0, 40, 0], dos:[10, 0, 0], regY:0.2, sourcils:0.4, sourire:0.6})],
  /* (le lancer par en dessous, d'un grand geste qui monte vers le plafond) */
  [HERBES, versNous({herbes:0.6, mainD:[44, 68, 20], relD:1, coudeD:[1, 0, -0.2], pouceD:[0, -0.4, 1], mdirD:[0, -1, 0.4], poingD:0.05, bas:[0, 8, 0], regY:-0.7, hoche:-8, sourire:1, ouvre:0.45, sourcils:0.7, plisse:0.3})],
  [HERBES + 0.04, versNous({herbes:0, mainD:[44, 64, 18], relD:1, coudeD:[1, 0, -0.2], pouceD:[0, -0.4, 1], mdirD:[0, -1, 0.4], poingD:0, bas:[0, 6, 0], regY:-0.8, hoche:-10, sourire:1, ouvre:0.4, sourcils:0.7})],
  /* (il regarde la pluie de feuilles retomber, ravi) */
  [1.05, versNous({mainD:[40, 150, 40], relD:1, coudeD:[0.8, 0.5, 0], poingD:0.1, regY:-0.6, hoche:-8, sourire:0.9, sourcils:0.6, plisse:0.4})],
  [1.45, {}]];

HV.ALCHI = {preparer:preparer, lancer:lancer, louche:louche, herbes:herbes, PRET:PRET, LACHE:LACHE, BONG:BONG, HERBES:HERBES, VERSE:1.16, ECLAT:2.14, TOURNE:[1.4, 1.84]};
HV.NOMS_ALCHI = {preparer:'Il prépare une potion', lancer:'Il lance la fiole', louche:'La louche : BONG !', herbes:'Les herbes, pour un ami'};
})(window);
