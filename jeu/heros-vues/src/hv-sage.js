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
/* LE BÂTON POINTÉ (Romain, 23 novembre, 23 h 09 : « quand il jette le bâton en avant pour faire un sort, le bâton, il rentre à moitié
   dans sa robe ») : la main sur SON côté droit, devant elle ; le bâton vers l'avant et un peu vers le haut, un peu vers le milieu — son
   pied passe donc DEHORS, le long de sa hanche, de notre côté (avant, la main était au milieu du ventre et le bas du bâton passait
   dans son corps). Le poing est fermé par-dessus, les doigts vers le milieu (mdirG, à angle droit du bâton : sinon il penche). */
var POINTE = {mainG:[-32, 168, 54], pouceG:[0.28, -0.75, 0.6], mdirG:[0.95, 0.15, -0.24], coudeG:[-0.8, 0.4, -0.3], mainD:[30, 204, 40], relD:1, poingD:0.1, mdirD:[0, 0.4, 1]};
/* (le bâton qui remonte, après le sort, puis droit à côté d'elle : jamais devant son visage) */
var RECUL = {mainG:[-38, 178, 44], pouceG:[0.2, -0.85, 0.48], mdirG:[0.97, 0.2, -0.1]};
var RANGE = {mainG:[-62, 214, -6], pouceG:[0.05, -1, 0.02], mdirG:[0.2, -0.26, 1]};
var PAS = {piedG:[pg[0] - 6, 386, pg[2] + 34], pointeG:0};
var sort = [
  [0.12, avec(BAT, {bas:[2, 16, -4], dos:[g.dos[0] + 4, 0, g.dos[2] - 4], hoche:6, sourcils:-0.8, plisse:0.35, sourire:-0.3})],
  [0.3, tq(-34, 2, avec(avec(BAT, enlair('G', pg[0] - 2, pg[2] + 14)), {mainG:[-62, 196, 0], pouceG:[0.05, -1, 0], mdirG:[0.2, -0.26, 1], mainD:[38, 206, 32], relD:1, poingD:0.2,
    bas:[2, 8, 0], hoche:-6, regX:0.8, sourcils:-0.9, plisse:0.4, sourire:-0.3, cristal:0.7}))],
  [0.46, avec(avec(avec(BAT, POINTE), PAS), {bas:[-10, 18, 16], bang:[10, 0, 12], dos:[12, 0, 10], tete:-6, hoche:2, sourcils:-1, plisse:0.5, ouvre:0.55, largeB:0.8, cristal:1})],
  [LANCE, avec(avec(avec(BAT, POINTE), PAS), {mainG:[-30, 164, 62], bas:[-12, 20, 19], bang:[11, 0, 13], dos:[14, 0, 11], tete:-6, hoche:2, sourcils:-1, plisse:0.6, ouvre:0.6, largeB:0.8, cristal:1})],
  /* (le recul du sort) */
  [0.86, avec(avec(avec(BAT, RECUL), PAS), {bas:[-6, 14, 10], bang:[7, 0, 8], dos:[6, 0, 6],
    mainD:[32, 210, 36], relD:1, poingD:0.2, hoche:-2, sourcils:-0.7, plisse:0.4, ouvre:0.2, cristal:0.5})],
  [1.12, avec(avec(avec(BAT, RANGE), PAS), {bas:[-4, 12, 8], bang:[6, 0, 4], dos:[8, 0, 2], sourcils:-0.6, plisse:0.3, cristal:0.3})],
  /* (elle ramène son pied) */
  [1.3, avec(enlair('G', pg[0] - 3, pg[2] + 16), {bas:[0, 9, 3], sourcils:-0.5})],
  [1.44, {}]];

/* ---------- LA RUNE D'APPEL (2,1 s ; la rune part à 0,72 s ; elle TIRE à 1,52 s : HV.SAGE.TIRE) ----------
   Le même départ que le sort (Romain, 23 h 09 : « la rune d'appel, le mouvement, il est bon ») ; puis, pendant que la rune se pose sur
   le monstre et que la chaîne de lumière se tend (hv-adaptateur.js), elle TIENT, le bâton pointé, l'effort sur le visage ; et elle
   tire d'un coup sec : le bâton revient vers elle, elle se penche en arrière, le pied de devant recule — le monstre arrive. */
var TIRE = 1.52;
var TIENT = avec(avec(avec(BAT, POINTE), PAS), {mainG:[-30, 165, 60], bas:[-11, 20, 17], bang:[10, 0, 12], dos:[12, 0, 10], tete:-6, hoche:3, sourcils:-1, sourcilsIn:0.3, plisse:0.7, ouvre:0.3, largeB:0.9, cristal:1});
var appel = sort.slice(0, 4).concat([
  [0.9, TIENT],
  [1.12, avec(TIENT, {mainG:[-31, 166, 58], bas:[-10, 21, 16], ouvre:0.25})],
  [1.34, avec(TIENT, {mainG:[-30, 165, 60], bas:[-11, 20, 17], ouvre:0.35})],
  [1.42, avec(TIENT, {mainG:[-28, 163, 64], bas:[-12, 19, 19], ouvre:0.2})],
  /* (le coup sec : le bâton tiré vers elle, le buste en arrière) */
  [TIRE, avec(avec(avec(BAT, RECUL), PAS), {mainG:[-46, 186, 18], pouceG:[0.14, -0.8, 0.58], bas:[0, 12, -6], bang:[4, 0, -2], dos:[-8, 0, -2],
    mainD:[34, 200, 30], relD:1, poingD:0.7, tete:-4, hoche:-5, sourcils:-0.9, plisse:0.5, ouvre:0.55, largeB:0.9, cristal:1})],
  /* (elle ramène son pied de devant : il se lève, il se pose à sa place) */
  [1.7, avec(avec(BAT, RANGE), avec(enlair('G', pg[0] - 3, pg[2] + 16), {mainG:[-60, 208, -4], bas:[1, 10, -4], dos:[-4, 0, 0], tete:4, regX:0.7, sourcils:-0.8, plisse:0.4, cristal:0.6}))],
  [1.86, {bas:[0, 9, 0], regX:0.6, sourcils:-0.6}],
  [2.06, {}]]);

/* ---------- LE BOUCLIER (le dôme à 0,76 s ; × 1,5 pour le bouclier jaune : l'adaptateur étire les temps) ----------
   Elle plie les genoux ; elle se tourne vers nous en levant le bâton, son pied de derrière recule d'un pas pour bien s'ancrer ; elle
   se grandit, le bâton haut, la main gauche ouverte vers le ciel, cambrée ; le dôme ; puis elle revient. */
var DOME = 0.76;
/* DEUXIÈME VERSION (Romain, 23 novembre, 23 h 09 : « il fait un bouclier et il regarde à gauche. S'il fait un bouclier, il faudrait qu'il
   regarde vers la personne à qui il fait le bouclier […] au moins qu'il regarde l'une des deux personnes […] là, il se tourne et il
   regarde derrière et il y a le bouclier qui part devant ») : elle ne se tourne plus vers nous ; elle regarde ses amis (devant elle,
   vers la droite de l'écran), avance d'un pas vers eux, lève le bâton à côté d'elle (le cristal au-dessus de sa tête, jamais devant
   son visage) et TEND la main gauche ouverte vers eux, la paume vers eux : elle leur envoie le bouclier. */
var LEVE = {mainG:[-70, 146, -10], relG:1, coudeG:[-0.9, 0.15, -0.3], pouceG:[0.05, -1, 0.02], mdirG:[0.2, -0.26, 1], poingG:0.95};
var TEND = {mainD:[42, 152, 80], relD:1, coudeD:[0.55, 0.45, -0.5], poingD:0.04, mdirD:[0.1, -0.9, 0.4], pouceD:[-1, 0, 0.1]};
var VERS = {tete:8, regX:0.9, regY:0.1};
var bouclier = [
  [0.14, avec(avec(BAT, VERS), {mainG:[-64, 222, -8], pouceG:[0.06, -1, 0], mdirG:[0.2, -0.26, 1], bas:[0, 18, 0], hoche:6, mainD:[30, 196, 34], relD:1, coudeD:[0.8, 0.4, -0.3], poingD:0.6, sourcils:-0.8, plisse:0.35})],
  [0.32, tq(-10, 2, avec(avec(avec(BAT, VERS), enlair('G', pg[0] - 2, pg[2] + 14)), {mainG:[-60, 184, 2], pouceG:[0.05, -1, 0.02], mdirG:[0.2, -0.26, 1], mainD:[38, 172, 56], relD:1, coudeD:[0.6, 0.45, -0.5], poingD:0.3, mdirD:[0.1, -0.6, 0.8], pouceD:[-1, 0, 0.1],
    bas:[0, 12, 4], hoche:0, sourcils:-0.9, plisse:0.4, ouvre:0.3, cristal:0.7}))],
  [0.5, tq(-10, 2, avec(avec(avec(avec(BAT, LEVE), TEND), PAS), avec(VERS, {bas:[-6, 9, 12], dosPlus:[8, 0, 4], bangPlus:[4, 0, 4], hoche:-2, sourcils:-1, plisse:0.45, ouvre:0.55, largeB:0.8, cristal:1})))],
  /* (le bouclier part : la main pousse vers eux) */
  [DOME, tq(-10, 2, avec(avec(avec(avec(BAT, LEVE), TEND), PAS), avec(VERS, {mainG:[-70, 140, -10], mainD:[46, 148, 90], bas:[-8, 8, 14], dosPlus:[10, 0, 5], bangPlus:[5, 0, 5], hoche:-3, sourcils:-0.7, plisse:0.5, ouvre:0.6, largeB:0.9, cristal:1})))],
  [1.0, tq(-6, 2, avec(avec(avec(avec(BAT, LEVE), TEND), PAS), avec(VERS, {mainG:[-70, 156, -10], mainD:[44, 156, 82], bas:[-6, 9, 12], dosPlus:[7, 0, 3], sourcils:-0.6, plisse:0.35, ouvre:0.15, cristal:0.6})))],
  /* (elle revient : le bâton redescend, la main aussi, le pied de devant revient) */
  [1.18, avec(avec(BAT, RANGE), avec(enlair('G', pg[0] - 3, pg[2] + 16), {mainG:[-60, 206, 4], bas:[-2, 9, 4], tete:6, regX:0.7, sourcils:-0.5, cristal:0.4}))],
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
/* LE LIVRE TENU POUR QU'ON LE VOIE (Romain, 23 h 09 : « qu'on voit mieux que c'est un livre ») : la main gauche le tient par-derrière,
   devant sa poitrine, ses pages tournées entre elle et nous (un peu vers le haut, vers ses yeux) — avant, on le voyait par la tranche.
   (mdirD : les doigts vers le bas et vers le milieu ; pouceD : à angle droit, vers SA gauche ; la paume — et les pages — vers nous) */
var LIT = {livre:1, mainD:[10, 174, 56], relD:1, coudeD:[0.8, 0.5, -0.2], poingD:0.35, mdirD:[-0.39, 0.8, 0.46], pouceD:[0.92, 0.3, 0.26]};
var etudier = [
  [0.2, {mainD:[36, 222, 12], relD:1, coudeD:[0.9, 0.3, -0.3], poingD:0.3, hoche:10, regY:0.6, regX:0.3}],
  [0.3, {livre:1, mainD:[36, 220, 14], relD:1, coudeD:[0.9, 0.3, -0.3], poingD:0.6, mdirD:[-0.39, 0.8, 0.46], pouceD:[0.92, 0.3, 0.26], hoche:10, regY:0.6, regX:0.3}],
  /* (elle l'ouvre devant elle — la couverture tourne autour du dos — et lit, penchée dessus, tournée vers nous, son poids sur une jambe) */
  [0.44, tq(-24, 2, avec(LIT, {livreO:0.15, bas:[-4, 9, 0], hoche:10, regY:0.6, regX:0.2, sourcils:0.1}))],
  [0.62, tq(-30, 2, avec(LIT, {livreO:1, bas:[-5, 10, 0], dosPlus:[4, 0, 0], hoche:14, regY:0.7, regX:0.1, sourcils:0.3, ouvre:0.1, largeB:0.6}))],
  /* (elle tourne une page) */
  [0.86, tq(-30, 2, avec(LIT, {livreO:1, livreP:0, mainD:[12, 178, 52], bas:[-5, 10, 0], dosPlus:[5, 0, 0], hoche:15, regY:0.75, regX:-0.1, sourcils:0.5, sourcilsAsym:0.3, plisse:0.2}))],
  [1.04, tq(-30, 2, avec(LIT, {livreO:1, livreP:1, bas:[-4, 10, 0], dosPlus:[5, 0, 0], hoche:14, regY:0.7, regX:0.2, sourcils:0.5, plisse:0.2}))],
  [1.08, tq(-30, 2, avec(LIT, {livreO:1, livreP:1, bas:[-4, 10, 0], dosPlus:[5, 0, 0], hoche:14, regY:0.7, regX:0.2, sourcils:0.5, plisse:0.2}))],
  /* (l'idée ! elle se redresse, relève la tête, les yeux grands ouverts) */
  [IDEE + 0.06, tq(-24, 2, avec(LIT, {livreO:1, livreP:1, mainD:[12, 174, 50], bas:[2, 4, 0], dosPlus:[-3, 0, 0], hoche:-8, regY:-0.6, sourcils:0.9, plisse:-0.3, ouvre:0.35, sourire:0.6, cristal:0.8}))],
  [1.48, tq(-20, 2, avec(LIT, {livreO:1, livreP:1, mainD:[12, 178, 50], bas:[2, 6, 0], hoche:-4, regY:-0.3, sourcils:0.4, sourire:0.4, plisse:0.3, cristal:0.4}))],
  /* (elle le referme et le range, les yeux de nouveau sur les ennemis) */
  [1.62, avec(LIT, {livreO:0, livreP:1, hoche:6, regY:0.3, regX:0.4, sourcils:-0.4})],
  [1.78, {livre:0, mainD:[36, 220, 14], relD:1, coudeD:[0.9, 0.3, -0.3], poingD:0.4, hoche:4, regX:0.5, sourcils:-0.5}],
  [1.92, {}]];

HV.SAGE = {sort:sort, appel:appel, bouclier:bouclier, eclairSalle:eclairSalle, etudier:etudier, LANCE:LANCE, TIRE:TIRE, DOME:DOME, FLASH:FLASH, IDEE:IDEE};
HV.NOMS_SAGE = {sort:'Le sort : un éclair', appel:'La rune d\'appel : elle tire le monstre', bouclier:'Le bouclier sur un ami', eclairSalle:'La lumière dans toute la salle', etudier:'Elle étudie son livre'};
})(window);
