/* ==========================================================
   Les héros « en volume » — LE SAGE AU DONJON (Romain, 23 novembre, 22 h 21 : « tu peux passer au sage […] Fais-moi les animations
   du sage, d'attaque, toutes les animations. Fais-moi ses sorts principaux »). Chargé après hv-alchimiste.js, avant hv-attente.js.
   Son allure : la tresse à perles (hv-cheveux.js, COIFFURES.tresse), les lunettes rondes (hv-tete.js), la longue robe sous le
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
  mainD:[34, 222, 26], relD:1, coudeD:[0.8, 0.3, -0.4], poingD:0.35, mdirD:[-0.2, 0.4, 1], sourire:0.1, sourcils:-0.3});

/* ---------- LE SORT (1,56 s ; l'éclair part à 0,72 s, comme aujourd'hui) ---------- */
var LANCE = 0.72;
var BAT = {relG:1, coudeG:[-0.8, 0.35, -0.4], poingG:0.95};
var sort = [
  /* (elle lève le bâton, le cristal s'allume, les yeux sur l'ennemi) */
  [0.28, avec(BAT, {mainG:[-62, 204, -2], pouceG:[0.05, -1, 0], mdirG:[0.2, -0.26, 1], dos:[-4, 0, -4], tete:-4, hoche:-4, mainD:[36, 210, 30], relD:1, poingD:0.2,
    sourcils:-0.8, plisse:0.35, sourire:-0.3, cristal:0.6})],
  /* (elle pointe le bâton vers lui, le buste en avant, elle crie la formule) */
  [0.46, avec(BAT, {mainG:[-8, 172, 62], pouceG:[0.12, -0.5, 1], mdirG:[0.4, 0.4, 0.8], coudeG:[-0.7, 0.4, -0.2], dos:[8, 0, 6], bang:[6, 0, 4], bas:[0, 12, 6],
    mainD:[30, 204, 40], relD:1, poingD:0.1, mdirD:[0, 0.4, 1], hoche:2, sourcils:-1, plisse:0.5, ouvre:0.55, largeB:0.8, cristal:1})],
  [LANCE, avec(BAT, {mainG:[-4, 168, 70], pouceG:[0.12, -0.45, 1], mdirG:[0.4, 0.4, 0.8], coudeG:[-0.7, 0.4, -0.2], dos:[10, 0, 7], bang:[7, 0, 4], bas:[0, 14, 8],
    mainD:[30, 206, 42], relD:1, poingD:0.1, mdirD:[0, 0.4, 1], hoche:2, sourcils:-1, plisse:0.6, ouvre:0.6, largeB:0.8, cristal:1})],
  /* (le recul du sort) */
  [0.86, avec(BAT, {mainG:[-14, 176, 54], pouceG:[0.08, -0.7, 0.8], mdirG:[0.4, 0.3, 0.8], dos:[2, 0, 2], bang:[3, 0, 2], bas:[0, 10, 2],
    mainD:[32, 210, 36], relD:1, poingD:0.2, hoche:-2, sourcils:-0.7, plisse:0.4, ouvre:0.2, cristal:0.5})],
  [1.14, avec(BAT, {mainG:[-18, 180, 50], pouceG:[0.06, -0.75, 0.7], mdirG:[0.4, 0.3, 0.8], dos:[2, 0, 2], hoche:0, sourcils:-0.5, plisse:0.3, sourire:0.1, cristal:0.3})],
  [1.56, {}]];

/* ---------- LE BOUCLIER (le dôme à 0,76 s ; × 1,5 pour le bouclier jaune : l'adaptateur étire les temps) ---------- */
var DOME = 0.76;
var LEVE = {mainG:[-34, 150, 30], pouceG:[0, -1, 0.1], mdirG:[0.3, 0, 1], mainD:[46, 104, 30], relD:1, coudeD:[0.9, 0.1, -0.3], poingD:0.05, mdirD:[0, -1, 0.3], pouceD:[-1, 0, 0.3]};
var bouclier = [
  [0.3, avec(avec(BAT, LEVE), {mainD:[44, 140, 34], dos:[-2, 0, 0], tete:-8, hoche:-8, regY:-0.4, sourcils:-0.8, plisse:0.3, ouvre:0.4, cristal:0.8})],
  [0.5, avec(avec(BAT, LEVE), {dos:[-6, 0, 0], tete:-10, hoche:-12, regY:-0.6, sourcils:-0.9, plisse:0.4, ouvre:0.6, largeB:0.8, cristal:1})],
  [DOME, avec(avec(BAT, LEVE), {mainD:[46, 98, 30], dos:[-7, 0, 0], tete:-10, hoche:-12, regY:-0.6, sourcils:-0.6, plisse:0.4, ouvre:0.5, cristal:1})],
  [1.18, {mainG:[-40, 228, 28], relG:1, coudeG:[-0.8, 0.35, -0.4], pouceG:[0, -1, 0.06], poingG:0.95, regX:0.2, sourire:0.8, sourcils:0.3, plisse:0.3, cristal:0.4}],
  [1.48, {}]];

/* ---------- L'ÉCLAIR DE LA SALLE (la lumière à 0,78 s) ---------- */
var FLASH = 0.78;
var HAUT = {mainG:[-50, 96, 4], relG:1, coudeG:[-0.9, -0.2, -0.3], pouceG:[0.06, -1, 0], mdirG:[0.3, 0, 1], poingG:0.95,
  mainD:[42, 96, 26], relD:1, coudeD:[0.9, -0.1, -0.3], poingD:0.05, mdirD:[0, -1, 0.2], pouceD:[-1, 0, 0.3]};
var eclairSalle = [
  [0.3, avec(BAT, {mainG:[-52, 170, 18], pouceG:[0.06, -1, 0], mdirG:[0.3, 0, 1], mainD:[40, 160, 30], relD:1, poingD:0.1, dos:[-2, 0, 0], tete:-6, hoche:-6, regY:-0.4, sourcils:-0.9, plisse:0.4, ouvre:0.4, cristal:0.7})],
  [0.64, avec(HAUT, {dos:[-8, 0, 0], bas:[0, 4, -2], tete:-10, hoche:-16, regY:-0.85, sourcils:-1, plisse:0.5, ouvre:0.7, largeB:0.9, cristal:1})],
  [FLASH, avec(HAUT, {mainG:[-50, 90, 4], dos:[-10, 0, 0], bas:[0, 2, -2], tete:-10, hoche:-18, regY:-0.85, sourcils:-0.6, plisse:0.9, ouvre:0.8, largeB:0.9, cristal:1})],
  [1.38, avec(HAUT, {mainG:[-50, 94, 4], dos:[-8, 0, 0], tete:-8, hoche:-14, regY:-0.6, sourcils:0.2, plisse:0.6, ouvre:0.3, sourire:0.6, cristal:0.6})],
  [1.82, {}]];

/* ---------- ÉTUDIER (1,92 s ; l'idée à 1,2 s) ---------- */
var IDEE = 1.2;
var LIT = {livre:1, mainD:[14, 186, 48], relD:1, coudeD:[0.8, 0.5, -0.2], poingD:0.5, mdirD:[-0.6, -0.2, 0.8], pouceD:[0, -1, 0.2]};
var etudier = [
  [0.2, {mainD:[36, 222, 12], relD:1, coudeD:[0.9, 0.3, -0.3], poingD:0.3, hoche:10, regY:0.6, regX:0.3}],
  [0.3, {livre:1, mainD:[36, 220, 14], relD:1, coudeD:[0.9, 0.3, -0.3], poingD:0.6, hoche:10, regY:0.6, regX:0.3}],
  /* (elle l'ouvre devant elle et lit, penchée dessus) */
  [0.52, avec(LIT, {livreO:1, hoche:14, regY:0.7, regX:0.1, sourcils:0.3, ouvre:0.1, largeB:0.6, dos:[4, 0, 0]})],
  [0.86, avec(LIT, {livreO:1, mainD:[14, 184, 48], hoche:15, regY:0.75, regX:-0.1, sourcils:0.5, sourcilsAsym:0.3, plisse:0.2, dos:[5, 0, 0]})],
  [1.08, avec(LIT, {livreO:1, hoche:14, regY:0.7, regX:0.2, sourcils:0.5, plisse:0.2, dos:[5, 0, 0]})],
  /* (l'idée ! elle relève la tête, les yeux grands ouverts, elle sourit) */
  [IDEE + 0.06, avec(LIT, {livreO:1, mainD:[14, 180, 46], hoche:-8, regY:-0.6, sourcils:0.9, plisse:-0.3, ouvre:0.35, sourire:1, dos:[-2, 0, 0], cristal:0.8})],
  [1.48, avec(LIT, {livreO:1, mainD:[14, 182, 46], hoche:-4, regY:-0.3, sourcils:0.7, sourire:1, plisse:0.3, cristal:0.4})],
  /* (elle le referme et le range) */
  [1.62, avec(LIT, {livreO:0, hoche:6, regY:0.3, sourire:0.8})],
  [1.78, {livre:0, mainD:[36, 220, 14], relD:1, coudeD:[0.9, 0.3, -0.3], poingD:0.4, hoche:6, sourire:0.6}],
  [1.92, {}]];

HV.SAGE = {sort:sort, bouclier:bouclier, eclairSalle:eclairSalle, etudier:etudier, LANCE:LANCE, DOME:DOME, FLASH:FLASH, IDEE:IDEE};
HV.NOMS_SAGE = {sort:'Le sort : un éclair', bouclier:'Le bouclier sur un ami', eclairSalle:'La lumière dans toute la salle', etudier:'Elle étudie son livre'};
})(window);
