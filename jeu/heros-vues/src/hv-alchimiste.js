/* ==========================================================
   Les héros « en volume » — L'ALCHIMISTE AU DONJON (Romain, 23 novembre, 20 h 46 : « tu peux faire toutes les animations pour
   l'alchimiste. Et pour les animations spéciales alchimiste, donc à savoir la préparation des potions et tout ça, tu me fais un truc
   vraiment sympa où on voit vraiment l'effet 3D du personnage. Et après, toutes les autres animations, tu peux reprendre celles que
   tu as fait pour le pisteur »). Chargé après hv-donjon.js.
   REFAITS après ses retours de 21 h 32 : « ça fait bizarre qu'il tourne sur lui-même comme s'il était super content. Non, c'est
   juste, tu lui fais une préparation. On voit bien qu'il prend ses fioles sur son torse, qui fait un mélange, et là, qui le lance en
   l'air. Quand il le lance en l'air, tu fais bien tourner le torse vers nous » ; les herbes : « la main qui s'ouvre en l'air bien
   haut, le bras tendu vers le haut, et on voit les pétales qui tombent sur les 3 personnes […] il se tourne vers nous […] il fait un
   sourire » ; la pirouette, elle, devient une des deux victoires (HV.DONJON.joieTour, dans hv-donjon.js).
   - HV.POSES.aGarde : sa garde (sans arc : les poings prêts) ;
   - HV.ALCHI.preparer : le buste un peu tourné vers nous, il prend une fiole sur sa poitrine (main droite), puis une deuxième (main
     gauche), verse la deuxième dans la première (HV.ALCHI.VERSE → MELANGE : l'adaptateur fait couler la potion et change la couleur),
     le mélange s'illumine (HV.ALCHI.ECLAT), il range la fiole vide, puis arme la fiole derrière l'épaule (HV.ALCHI.PRET) — sans secousse ;
   - HV.ALCHI.lancer : l'élan, le buste bien tourné vers nous, le bras qui part loin sur le côté ; le fouet par-dessus l'épaule, la
     fiole part (HV.ALCHI.LACHE, en secondes), toujours le buste vers nous ; le bras finit en travers du corps ;
   - HV.ALCHI.louche : la petite marmite dans la main gauche, la grande louche dans la droite, levée très haut, et BONG (à 0,6 s :
     HV.ALCHI.BONG, comme le son du donjon) ; deux rebonds ; il se tourne vers nous et fait tournoyer la louche (deux tours) ; il
     les range ;
   - HV.ALCHI.herbes : une poignée d'herbes prise dans une sacoche, il se tourne vers nous, lève le bras tout droit, bien haut, et
     ouvre la main (HV.ALCHI.HERBES : les pétales s'envolent et retombent en pluie sur les trois héros — l'adaptateur) ; il sourit.
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

/* ---------- PRÉPARER (1,3 s), REFAIT LE 24 NOVEMBRE (deux fois) ----------
   (Romain, 12 h 55 : « elle est un peu buggée ou alors elle est pas très claire » → une seule fiole, secouée ; puis 17 h 21 : « faut pas
   qu'il secoue, ça fait moche. Faut juste qu'on voit qu'il a 2 potions, qu'il fait un mélange. Et en fonction du sort qu'il lance, il
   faut que le mélange ait la bonne couleur […] qu'il prenne ces 2 potions, qu'il mélange et qu'il lance […] Tu gardes la même vitesse ».)
   DEUX fioles de deux couleurs (l'adaptateur : deux teintes voisines de la potion, de part et d'autre), aucune secousse :
   0 → 0,22 : ses deux mains prennent chacune une fiole sur sa sangle ;
   → 0,42 : il les lève devant lui, la gauche au-dessus de la droite, et les regarde ;
   → 0,5 → 0,78 : il penche la gauche : elle se verse dans la droite (HV.ALCHI.VERSE → HV.ALCHI.MELANGE : le filet, et la droite prend
     la couleur de la potion) ; → 0,8 : le mélange s'allume (HV.ALCHI.ECLAT) ;
   → 0,95 : il range la fiole vide, lève le mélange, content de lui ; → 1,2 : la fiole armée derrière l'épaule (HV.ALCHI.PRET). */
var PRET = avec(g, {fioleG:1, mainG:[-42, 148, -8], relG:1, coudeG:[-0.7, 0.5, -0.4], pouceG:[0, -1, 0], mdirG:[0, -0.3, 1], poingG:0.9, sourcils:-0.6, plisse:0.3, sourire:0.2});
var TQ = HV.tour(g, -38, 2);
function tq(plus){ return avec(TQ, plus || {}); }
/* (la fiole de la main droite, tenue devant lui ; y : sa hauteur — plus petit, plus haut) */
function fiole1(y, plus){ return avec({fioleG:1, mainG:[-16, y, 44], relG:1, coudeG:[-0.85, 0.45, -0.3], pouceG:[0, -1, 0], mdirG:[0.3, 0, 1], poingG:0.92}, plus || {}); }
/* (la fiole de la main gauche : droite, ou penchée pour verser — le goulot du côté du pouce, tourné vers l'autre fiole) */
function fiole2(x, y, penche, plus){ return avec({fioleD:1, mainD:[x, y, 48], relD:1, coudeD:[0.85, 0.45, -0.3], pouceD:penche ? [-0.85, 0.5, 0.1] : [0, -1, 0], mdirD:[-0.3, 0, 1], poingD:0.92}, plus || {}); }
var VERSE = 0.5, MELANGE = 0.78, ECLAT = 0.8, SANS_VERSER = false;
var REGARDE = {hoche:4, regY:0.3, sourcils:0.5, plisse:0.25, ouvre:0.1, largeB:0.6};
var preparer = [
  /* (ses deux mains vont chercher une fiole chacune sur sa sangle ; il baisse les yeux) */
  [0.12, tq({mainG:[-16, 170, 24], relG:1, coudeG:[-0.9, 0.3, -0.2], poingG:0.3, pouceG:[0, -1, 0.3], mainD:[16, 176, 26], relD:1, coudeD:[0.9, 0.3, -0.2], poingD:0.3, pouceD:[0, -1, 0.3],
    hoche:10, regY:0.6, sourcils:0.2})],
  [0.22, tq({mainG:[-16, 168, 26], relG:1, coudeG:[-0.9, 0.3, -0.2], poingG:0.92, pouceG:[0, -1, 0.3], fioleG:1, mainD:[16, 174, 28], relD:1, coudeD:[0.9, 0.3, -0.2], poingD:0.92, pouceD:[0, -1, 0.3], fioleD:1,
    hoche:10, regY:0.6})],
  /* (il les lève devant lui, la gauche au-dessus de la droite) */
  [0.42, tq(fiole1(160, fiole2(8, 120, false, REGARDE)))],
  /* (il penche la gauche : elle se verse dans la droite) */
  [VERSE, tq(fiole1(160, fiole2(5, 116, true, REGARDE)))],
  [0.64, tq(fiole1(158, fiole2(3, 114, true, {hoche:5, regY:0.35, sourcils:0.6, plisse:0.3, ouvre:0.15, largeB:0.5})))],
  [MELANGE, tq(fiole1(156, fiole2(10, 126, false, {hoche:4, regY:0.3, sourcils:0.5, sourire:0.4})))],
  /* (le mélange s'allume ; il range la fiole vide et lève la bonne, content de lui) */
  [0.9, tq(fiole1(140, {fioleD:0, mainD:[22, 180, 26], relD:1, coudeD:[0.9, 0.3, -0.2], poingD:0.4, regY:-0.1, sourcils:0.6, sourire:0.9, plisse:0.35, ouvre:0.15}))],
  [1.0, tq(fiole1(132, {mainD:[34, 200, 28], relD:1, poingD:0.5, regY:-0.15, sourcils:0.5, sourire:0.8, plisse:0.3}))],
  /* (il arme la fiole derrière l'épaule, face aux ennemis, décidé) */
  [1.2, PRET], [1.3, PRET]];

/* (24 novembre — Romain, 10 h 17 : « depuis le début, l'alchimiste, il met trop de temps à jeter ses potions […] faire en sorte que il
   la jette plus vite ») : le lancer (plus bas) lâche la fiole à 0,4 s au lieu de 0,5. La préparation est faite à sa nouvelle durée
   (1,3 s) : VITE_P = 1. HV.ALCHI.VITE : l'adaptateur cale les lueurs dessus. */
var VITE_P = 1, VITE_L = 0.8;

/* ---------- LANCER (depuis PRET), LE BUSTE TOURNÉ VERS NOUS ---------- */
var LACHE = 0.5;
var lancer = [[0.01, PRET],
  /* (l'élan : le buste se tourne vers nous, le bras part loin sur SON côté droit, haut ; le poids sur la jambe de derrière) */
  [0.22, {fioleG:1, mainG:[-74, 118, -10], relG:1, coudeG:[-0.7, -0.4, -0.5], pouceG:[0, -1, 0], mdirG:[-0.6, -0.4, 0], poingG:0.92,
    bang:[2, 0, -20], dos:[-4, 0, -26], bas:[0, 16, -6], hoche:-4, tete:-6, regX:0.6, mainD:[44, 190, 40], relD:1, coudeD:[0.8, 0.3, -0.4], poingD:0.4, sourcils:-0.9, plisse:0.5, ouvre:0.25}],
  [0.32, {fioleG:1, mainG:[-78, 106, -14], relG:1, coudeG:[-0.7, -0.5, -0.5], pouceG:[0, -1, 0], mdirG:[-0.6, -0.5, 0], poingG:0.92,
    bang:[2, 0, -22], dos:[-6, 0, -28], bas:[0, 18, -8], hoche:-4, tete:-6, regX:0.7, mainD:[46, 186, 44], relD:1, coudeD:[0.8, 0.3, -0.4], poingD:0.4, sourcils:-1, plisse:0.6, ouvre:0.35}],
  /* (le fouet : le bras passe par-dessus l'épaule ; le buste reste tourné vers nous) */
  [0.43, {fioleG:1, mainG:[-50, 76, 8], relG:1, coudeG:[-0.8, -0.4, -0.2], pouceG:[0.2, -1, 0.3], mdirG:[0.3, -0.6, 0.6], poingG:0.92,
    bang:[4, 0, -14], dos:[4, 0, -16], bas:[0, 14, 2], hoche:-2, tete:0, regX:0.8, mainD:[48, 200, 30], relD:1, poingD:0.6, sourcils:-1, plisse:0.6, ouvre:0.6, largeB:0.8}],
  [LACHE - 0.02, {fioleG:1, mainG:[24, 104, 54], relG:1, coudeG:[-0.6, 0.2, 0.4], pouceG:[0.5, -0.6, 0.6], mdirG:[0.7, 0, 0.6], poingG:0.7,
    bang:[6, 0, -10], dos:[8, 0, -10], bas:[0, 16, 6], hoche:2, tete:4, regX:0.9, mainD:[44, 208, 20], relD:1, poingD:0.7, sourcils:-1, plisse:0.5, ouvre:0.7, largeB:0.8}],
  [LACHE + 0.03, {fioleG:0, mainG:[40, 128, 56], relG:1, coudeG:[-0.5, 0.4, 0.4], pouceG:[0.5, 0, 0.8], mdirG:[0.8, 0.2, 0.5], poingG:0.05,
    bang:[6, 0, -8], dos:[8, 0, -8], bas:[0, 16, 8], hoche:3, tete:4, regX:0.9, mainD:[44, 210, 18], relD:1, poingD:0.7, sourcils:-0.8, plisse:0.4, ouvre:0.5}],
  /* (le bras finit en travers du corps, il regarde la fiole voler) */
  [0.78, {mainG:[44, 196, 46], relG:1, coudeG:[-0.4, 0.6, 0.3], poingG:0.3, bang:[6, 0, -6], dos:[8, 0, -6], bas:[0, 14, 8], hoche:3, tete:6, regX:0.8, sourcils:-0.4, sourire:0.3}],
  [1.0, {mainG:[10, 210, 40], relG:1, coudeG:[-0.6, 0.4, -0.2], poingG:0.5, bang:[6, 0, -2], dos:[8, 0, -2], regX:0.5, sourire:0.5, sourcils:-0.2}],
  [1.35, {}]];
lancer = lancer.map(function(k){ return [Math.round(k[0] * VITE_L * 1000) / 1000, k[1]]; });
LACHE *= VITE_L;

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

/* ---------- LES HERBES (pour l'équipe) : il se tourne vers nous, lève le bras tout droit, bien haut, ouvre la main en l'air — les
   pétales s'envolent et retombent sur les trois héros (l'adaptateur) — et sourit, content ---------- */
var HERBES = 0.86;
var HAUT = {mainD:[40, 64, 6], relD:1, coudeD:[1, 0, -0.1], mdirD:[0, -1, 0.05], pouceD:[-1, 0, 0.2]};
var herbes = [
  [0.2, {mainD:[36, 230, 6], relD:1, coudeD:[0.9, 0.2, -0.3], poingD:0.3, hoche:10, regY:0.6}],
  [0.34, {herbes:1, mainD:[32, 214, 22], relD:1, coudeD:[0.9, 0.2, -0.3], pouceD:[0, -1, 0.3], poingD:0.85, hoche:6, sourire:0.4}],
  /* (il se tourne vers nous, la poignée d'herbes contre la poitrine) */
  [0.56, versNous({herbes:1, mainD:[22, 150, 40], relD:1, coudeD:[0.9, 0.4, -0.2], pouceD:[0, -1, 0.2], poingD:0.85, regY:-0.2, sourcils:0.4, sourire:0.6})],
  /* (le bras monte, tout droit, bien haut ; le poing encore fermé) */
  [0.78, versNous(avec(HAUT, {herbes:1, poingD:0.85, regY:-0.8, regX:0.3, hoche:-10, sourire:0.8, sourcils:0.6, plisse:0.2}))],
  /* (il ouvre la main en l'air : les pétales s'envolent) */
  [HERBES, versNous(avec(HAUT, {herbes:0.4, poingD:0.05, regY:-0.85, regX:0.3, hoche:-12, sourire:1, ouvre:0.4, largeB:0.9, sourcils:0.8, plisse:0.3}))],
  [HERBES + 0.05, versNous(avec(HAUT, {herbes:0, poingD:0, regY:-0.85, regX:0.3, hoche:-12, sourire:1, ouvre:0.35, largeB:0.9, sourcils:0.8, plisse:0.35}))],
  /* (il les regarde retomber sur ses amis, le bras toujours en l'air, avec un grand sourire) */
  [1.5, versNous(avec(HAUT, {poingD:0, regY:-0.4, regX:-0.5, hoche:-4, sourire:1, ouvre:0.2, sourcils:0.7, plisse:0.5}))],
  [1.8, versNous({mainD:[40, 170, 36], relD:1, coudeD:[0.9, 0.4, -0.2], poingD:0.2, regX:-0.3, sourire:0.9, sourcils:0.5, plisse:0.4})],
  [2.15, {}]];

HV.ALCHI = {preparer:preparer, lancer:lancer, louche:louche, herbes:herbes, PRET:PRET, LACHE:LACHE, BONG:BONG, HERBES:HERBES, VERSE:VERSE, MELANGE:MELANGE, ECLAT:ECLAT, VITE:VITE_P, SANS_VERSER:SANS_VERSER};
HV.NOMS_ALCHI = {preparer:'Il prépare une potion', lancer:'Il lance la fiole', louche:'La louche : BONG !', herbes:'Les herbes, pour un ami'};
})(window);
