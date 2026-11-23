/* ==========================================================
   Les héros « en volume » — LE SAGE AU DONJON (Romain, 23 novembre, 22 h 21 : « tu peux passer au sage […] Fais-moi les animations
   du sage, d'attaque, toutes les animations. Fais-moi ses sorts principaux »). Chargé après hv-alchimiste.js, avant hv-attente.js.
   Son allure : la tresse à perles (hv-cheveux.js, COIFFURES.tresse), sans lunettes (enlevées, 22 h 53), la longue robe sous le
   manteau ouvert (hv-corps.js, robeSVG), le bâton à cristal et le livre (hv-corps.js, mainSVG).
   - HV.POSES.sGarde : sa garde — debout, le bâton planté à côté d'elle dans SA main droite, l'autre main près de la ceinture ;
   - HV.SAGE.sort (le sort, la rune d'appel) : elle lève le bâton, le cristal s'allume, un cercle de runes ; elle pointe le bâton
     vers l'ennemi en avançant le buste, l'éclair part du cristal (HV.SAGE.LANCE) ; un petit recul, puis la garde ;
   - HV.SAGE.bouclier : le bâton levé, la main gauche ouverte vers le ciel, des runes montent du pied du bâton ; le dôme se pose sur
     l'ami (HV.SAGE.DOME ; le bouclier jaune dure 1,5 fois plus longtemps, comme aujourd'hui) ;
   - HV.SAGE.eclairSalle : le bâton tenu haut au-dessus de la tête, le dos cambré, la lumière remplit la salle (HV.SAGE.FLASH) ;
   - HV.SAGE.etudier : le livre pris à la ceinture, ouvert devant elle, elle lit (les pages tournent), une idée s'allume au-dessus de
     sa tête (HV.SAGE.IDEE), elle le referme et le range.
   Tous les autres gestes (arriver, son tour, les coups, tomber, se relever, les victoires…) sont ceux de la Pisteuse, sur sa garde.
   ========================================================== */
(function(G){
'use strict';
var HV = G.HerosVues, P = HV.POSES, avec = HV.avec;

/* SA GARDE : le poing serré sur le bâton (le pouce vers le haut : le bâton est droit, son pied touche le sol), l'autre main ouverte,
   près de la ceinture */
/* (la main bien sur le côté : le bâton passe à côté d'elle, pas devant son visage, et son cristal n'est pas caché par sa tête ; la
   main tournée à l'horizontale — mdirG —, sinon le bâton penche) */
P.sGarde = avec(P.dGarde, {mainG:[-64, 238, -8], relG:1, coudeG:[-0.9, 0.3, -0.3], pouceG:[0.06, -1, 0], mdirG:[0.2, -0.26, 1], poingG:0.95,
  mainD:[34, 222, 26], relD:1, coudeD:[0.8, 0.3, -0.4], poingD:0.35, mdirD:[-0.2, 0.4, 1]});

/* DEUXIÈME VERSION (Romain, 23 novembre, 22 h 48 : « le sage, il bouge pas du tout son corps […] on voit pas du tout qu'il est en
   3D […] de temps en temps qu'il bouge ses pieds quand il met son bâton en l'air […] Il peut avancer un petit peu le pied […] quand il
   fait un éclairage sur le rat […] un mouvement, un peu de côté […] Il met son bâton en l'air et du coup son torse il se tourne un peu
   vers nous ») : dans chaque sort, le corps entier travaille — elle prend son élan (les genoux plient), se tourne vers nous en levant
   le bâton (la tête, les épaules, les hanches : HV.tour), fait un pas (le pied se lève, avance, se pose : jamais de glissade), porte son
   poids en avant et de côté, puis revient à sa place, pas à pas. */
var g = P.sGarde, pg = g.piedG, pd = g.piedD;
/* (se tourner de A degrés — < 0 : vers nous — par étapes, et y ajouter d'autres changements ; dos, bang : en plus de ceux du tour) */
function tq(A, et, plus){
  var R = HV.tour(g, A, et); plus = plus || {};
  var o = avec(R, plus);
  if(plus.dosPlus) o.dos = [R.dos[0] + plus.dosPlus[0], R.dos[1] + plus.dosPlus[1], R.dos[2] + plus.dosPlus[2]];
  if(plus.bangPlus) o.bang = [R.bang[0] + plus.bangPlus[0], R.bang[1] + plus.bangPlus[1], R.bang[2] + plus.bangPlus[2]];
  delete o.dosPlus; delete o.bangPlus;
  return o;
}
/* (un pied en l'air, à mi-chemin d'un pas : levé, la pointe tendue) */
function enlair(cle, x, z){ var o = {}; o['pied' + cle] = [x, 372, z]; o['pointe' + cle] = 22; return o; }

/* ---------- LE SORT (1,56 s ; l'éclair part à 0,72 s, comme aujourd'hui) ----------
   L'élan (les genoux plient) ; elle se tourne vers nous en levant le bâton, le pied de devant se lève ; LE PAS : le pied se pose loin
   devant, son poids part en avant et sur le côté, le buste se retourne vers le rat, le bâton pointé ; l'éclair ; le recul ; elle
   ramène son pied. */
var LANCE = 0.72;
var BAT = {relG:1, coudeG:[-0.8, 0.35, -0.4], poingG:0.95};
var POINTE = {mainG:[-8, 172, 62], pouceG:[0.12, -0.5, 1], mdirG:[0.4, 0.4, 0.8], coudeG:[-0.7, 0.4, -0.2], mainD:[30, 204, 40], relD:1, poingD:0.1, mdirD:[0, 0.4, 1]};
var PAS = {piedG:[pg[0] - 6, 386, pg[2] + 34], pointeG:0};
var sort = [
  [0.12, avec(BAT, {bas:[2, 16, -4], dos:[g.dos[0] + 4, 0, g.dos[2] - 4], hoche:6, sourcils:-0.8, plisse:0.35, sourire:-0.3})],
  [0.3, tq(-34, 2, avec(avec(BAT, enlair('G', pg[0] - 2, pg[2] + 14)), {mainG:[-62, 196, 0], pouceG:[0.05, -1, 0], mdirG:[0.2, -0.26, 1], mainD:[38, 206, 32], relD:1, poingD:0.2,
    bas:[2, 8, 0], hoche:-6, regX:0.8, sourcils:-0.9, plisse:0.4, sourire:-0.3, cristal:0.7}))],
  [0.46, avec(avec(avec(BAT, POINTE), PAS), {bas:[-10, 18, 16], bang:[10, 0, 12], dos:[12, 0, 10], tete:-6, hoche:2, sourcils:-1, plisse:0.5, ouvre:0.55, largeB:0.8, cristal:1})],
  [LANCE, avec(avec(avec(BAT, POINTE), PAS), {mainG:[-4, 168, 70], bas:[-12, 20, 19], bang:[11, 0, 13], dos:[14, 0, 11], tete:-6, hoche:2, sourcils:-1, plisse:0.6, ouvre:0.6, largeB:0.8, cristal:1})],
  /* (le recul du sort) */
  [0.86, avec(avec(BAT, PAS), {mainG:[-14, 176, 54], pouceG:[0.08, -0.7, 0.8], mdirG:[0.4, 0.3, 0.8], bas:[-6, 14, 10], bang:[7, 0, 8], dos:[6, 0, 6],
    mainD:[32, 210, 36], relD:1, poingD:0.2, hoche:-2, sourcils:-0.7, plisse:0.4, ouvre:0.2, cristal:0.5})],
  [1.12, avec(avec(BAT, PAS), {mainG:[-40, 200, 30], pouceG:[0.06, -0.9, 0.3], mdirG:[0.3, 0, 1], bas:[-4, 12, 8], bang:[6, 0, 4], dos:[8, 0, 2], sourcils:-0.6, plisse:0.3, cristal:0.3})],
  /* (elle ramène son pied) */
  [1.3, avec(enlair('G', pg[0] - 3, pg[2] + 16), {bas:[0, 9, 3], sourcils:-0.5})],
  [1.44, {}]];

/* ---------- LE BOUCLIER (le dôme à 0,76 s ; × 1,5 pour le bouclier jaune : l'adaptateur étire les temps) ----------
   Elle plie les genoux ; elle se tourne vers nous en levant le bâton, son pied de derrière recule d'un pas pour bien s'ancrer ; elle
   se grandit, le bâton haut, la main gauche ouverte vers le ciel, cambrée ; le dôme ; puis elle revient. */
var DOME = 0.76;
var LEVE = {mainG:[-40, 150, 22], pouceG:[0.04, -1, 0], mdirG:[0.3, 0, 1], mainD:[46, 104, 30], relD:1, coudeD:[0.9, 0.1, -0.3], poingD:0.05, mdirD:[0, -1, 0.3], pouceD:[-1, 0, 0.3]};
var RECULE = {piedD:[pd[0] + 4, 386, pd[2] - 22], pointeD:0};
var bouclier = [
  [0.14, avec(BAT, {bas:[0, 18, 0], hoche:8, mainD:[36, 214, 30], relD:1, poingD:0.4, sourcils:-0.8, plisse:0.3})],
  [0.32, tq(-40, 2, avec(avec(avec(BAT, LEVE), enlair('D', pd[0] + 3, pd[2] - 12)), {mainD:[44, 140, 34], bas:[0, 10, -2], hoche:-8, regY:-0.4, sourcils:-0.8, plisse:0.3, ouvre:0.4, cristal:0.8}))],
  [0.5, tq(-44, 2, avec(avec(avec(BAT, LEVE), RECULE), {bas:[2, 2, -8], dosPlus:[-8, 0, 0], hoche:-12, regY:-0.6, sourcils:-0.9, plisse:0.4, ouvre:0.6, largeB:0.8, cristal:1}))],
  [DOME, tq(-44, 2, avec(avec(avec(BAT, LEVE), RECULE), {mainD:[46, 98, 30], bas:[2, 0, -9], dosPlus:[-10, 0, 0], hoche:-12, regY:-0.6, sourcils:-0.6, plisse:0.4, ouvre:0.5, cristal:1}))],
  [1.0, tq(-24, 2, avec(RECULE, {mainG:[-56, 220, 4], relG:1, coudeG:[-0.9, 0.3, -0.3], pouceG:[0.06, -1, 0], mdirG:[0.2, -0.26, 1], poingG:0.95, bas:[0, 8, -6], regX:0.4, sourcils:-0.3, plisse:0.3, cristal:0.5}))],
  [1.18, avec(enlair('D', pd[0] + 3, pd[2] - 12), {bas:[0, 8, -2], regX:0.4, sourcils:-0.4, cristal:0.4})],
  [1.36, {}]];

/* ---------- LA LUMIÈRE DANS TOUTE LA SALLE (la lumière à 0,78 s) ----------
   Elle se ramasse ; elle avance d'un pas en se tournant vers nous ; elle se grandit, le bâton tenu tout en haut, le dos cambré, la
   main gauche ouverte ; la lumière ; elle redescend et ramène son pied. */
var FLASH = 0.78;
var HAUT = {mainG:[-50, 96, 4], relG:1, coudeG:[-0.9, -0.2, -0.3], pouceG:[0.06, -1, 0], mdirG:[0.3, 0, 1], poingG:0.95,
  mainD:[42, 96, 26], relD:1, coudeD:[0.9, -0.1, -0.3], poingD:0.05, mdirD:[0, -1, 0.2], pouceD:[-1, 0, 0.3]};
var PAS2 = {piedG:[pg[0] - 4, 386, pg[2] + 26], pointeG:0};
var eclairSalle = [
  [0.18, avec(BAT, {mainG:[-60, 244, 0], pouceG:[0.06, -1, 0], mdirG:[0.2, -0.26, 1], bas:[0, 24, -2], dos:[g.dos[0] + 8, 0, g.dos[2]], hoche:10, mainD:[30, 220, 30], relD:1, poingD:0.6, sourcils:-1, plisse:0.5})],
  [0.4, tq(-30, 2, avec(avec(BAT, enlair('G', pg[0] - 2, pg[2] + 12)), {mainG:[-52, 166, 14], pouceG:[0.06, -1, 0], mdirG:[0.3, 0, 1], mainD:[40, 160, 30], relD:1, poingD:0.1,
    bas:[0, 12, 2], hoche:-6, regY:-0.4, sourcils:-0.9, plisse:0.4, ouvre:0.4, cristal:0.7}))],
  [0.64, tq(-30, 2, avec(avec(HAUT, PAS2), {bas:[-4, -2, 10], dosPlus:[-10, 0, 0], hoche:-16, regY:-0.85, sourcils:-1, plisse:0.5, ouvre:0.7, largeB:0.9, cristal:1}))],
  [FLASH, tq(-30, 2, avec(avec(HAUT, PAS2), {mainG:[-50, 90, 4], bas:[-4, -3, 11], dosPlus:[-12, 0, 0], hoche:-18, regY:-0.85, sourcils:-0.6, plisse:0.9, ouvre:0.8, largeB:0.9, cristal:1}))],
  [1.3, tq(-20, 2, avec(avec(HAUT, PAS2), {mainG:[-50, 98, 4], bas:[-2, 6, 8], dosPlus:[-6, 0, 0], hoche:-10, regY:-0.4, sourcils:-0.3, plisse:0.6, ouvre:0.2, cristal:0.6}))],
  [1.5, avec(avec(BAT, PAS2), {mainG:[-58, 214, 2], pouceG:[0.06, -1, 0], mdirG:[0.2, -0.26, 1], bas:[-2, 10, 6], sourcils:-0.5, cristal:0.4})],
  [1.66, avec(enlair('G', pg[0] - 2, pg[2] + 12), {bas:[0, 9, 2], sourcils:-0.5})],
  [1.82, {}]];

/* ---------- ÉTUDIER (1,92 s ; l'idée à 1,2 s) : elle se tourne un peu vers nous pour lire, change d'appui ---------- */
var IDEE = 1.2;
var LIT = {livre:1, mainD:[14, 186, 48], relD:1, coudeD:[0.8, 0.5, -0.2], poingD:0.5, mdirD:[-0.6, -0.2, 0.8], pouceD:[0, -1, 0.2]};
var etudier = [
  [0.2, {mainD:[36, 222, 12], relD:1, coudeD:[0.9, 0.3, -0.3], poingD:0.3, hoche:10, regY:0.6, regX:0.3}],
  [0.3, {livre:1, mainD:[36, 220, 14], relD:1, coudeD:[0.9, 0.3, -0.3], poingD:0.6, hoche:10, regY:0.6, regX:0.3}],
  /* (elle l'ouvre devant elle et lit, penchée dessus, tournée vers nous, son poids sur une jambe) */
  [0.52, tq(-30, 2, avec(LIT, {livreO:1, bas:[-5, 10, 0], dosPlus:[4, 0, 0], hoche:14, regY:0.7, regX:0.1, sourcils:0.3, ouvre:0.1, largeB:0.6}))],
  [0.86, tq(-30, 2, avec(LIT, {livreO:1, mainD:[14, 184, 48], bas:[-5, 10, 0], dosPlus:[5, 0, 0], hoche:15, regY:0.75, regX:-0.1, sourcils:0.5, sourcilsAsym:0.3, plisse:0.2}))],
  [1.08, tq(-30, 2, avec(LIT, {livreO:1, bas:[-4, 10, 0], dosPlus:[5, 0, 0], hoche:14, regY:0.7, regX:0.2, sourcils:0.5, plisse:0.2}))],
  /* (l'idée ! elle se redresse, relève la tête, les yeux grands ouverts) */
  [IDEE + 0.06, tq(-24, 2, avec(LIT, {livreO:1, mainD:[14, 180, 46], bas:[2, 4, 0], dosPlus:[-3, 0, 0], hoche:-8, regY:-0.6, sourcils:0.9, plisse:-0.3, ouvre:0.35, sourire:0.6, cristal:0.8}))],
  [1.48, tq(-20, 2, avec(LIT, {livreO:1, mainD:[14, 182, 46], bas:[2, 6, 0], hoche:-4, regY:-0.3, sourcils:0.4, sourire:0.4, plisse:0.3, cristal:0.4}))],
  /* (elle le referme et le range, les yeux de nouveau sur les ennemis) */
  [1.62, avec(LIT, {livreO:0, hoche:6, regY:0.3, regX:0.4, sourcils:-0.4})],
  [1.78, {livre:0, mainD:[36, 220, 14], relD:1, coudeD:[0.9, 0.3, -0.3], poingD:0.4, hoche:4, regX:0.5, sourcils:-0.5}],
  [1.92, {}]];

HV.SAGE = {sort:sort, bouclier:bouclier, eclairSalle:eclairSalle, etudier:etudier, LANCE:LANCE, DOME:DOME, FLASH:FLASH, IDEE:IDEE};
HV.NOMS_SAGE = {sort:'Le sort : un éclair', bouclier:'Le bouclier sur un ami', eclairSalle:'La lumière dans toute la salle', etudier:'Elle étudie son livre'};
})(window);
