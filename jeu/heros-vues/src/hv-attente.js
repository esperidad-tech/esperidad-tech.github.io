/* ==========================================================
   Les héros « en volume » — CE QU'ILS FONT EN ATTENDANT, au donjon (Romain, 23 novembre, 22 h 21 : « il me faut plus d'animation
   d'attente quand les personnages ils font rien. Il faut qu'ils fassent plus de choses, qu'ils regardent un petit peu derrière leur
   compagnon qui est derrière, le compagnon qui est devant, qu'ils fassent un petit signe de tête, qu'ils regardent s'il a toutes les
   potions, s'il regarde son arc, qu'il regarde son bâton, qu'il se gratte, qui se mettent en garde […] qui restent pas à rien faire
   et qui fassent pas les mêmes animations d'attente »). Chargé après hv-alchimiste.js.
   HV.attentes(role, base) → {nom: images clés} (pour cette garde) : les gestes de tous (regarder les ennemis, le compagnon de derrière,
   celui de devant, un signe de tête, se gratter la tête, se mettre en garde) + ceux de son rôle (la Pisteuse : son arc ;
   l'Alchimiste : compter ses fioles, en lever une vers la lumière ; le Sage : son bâton — quand il sera fait). L'adaptateur en tire un
   au hasard toutes les 4 à 7 secondes, jamais deux fois le même de suite, chacun à son rythme.
   Rappel des sens : A > 0, il se tourne vers SA gauche (vers la droite de l'écran, les ennemis) ; A < 0, vers SA droite (vers nous,
   puis vers la gauche de l'écran : les compagnons qui sont derrière lui).
   ========================================================== */
(function(G){
'use strict';
var HV = G.HerosVues, avec = HV.avec, T = HV.tour, cache = {};

function communs(b){
  var A = {};
  /* LES ENNEMIS : il les surveille (le geste d'avant) */
  A.ennemis = HV.DONJON.regard;
  /* LE COMPAGNON DE DERRIÈRE : il se retourne (un petit pas), le regarde, sourit ; puis revient */
  A.derriere = HV.regardeEtRevient(b, -112, 1.3, 0, {visage:{sourire:0.8, sourcils:0.35, plisse:0.2, regX:-0.4}});
  /* LE COMPAGNON DE DEVANT (ou les ennemis, pour celui qui est devant) : un coup d'œil, les yeux plissés */
  A.devant = HV.regardeEtRevient(b, 26, 1.4, 0, {sansPas:true, visage:{sourcils:-0.2, plisse:0.35, regX:0.5, sourire:0.3}});
  /* UN SIGNE DE TÊTE au compagnon de derrière : il se tourne à moitié, deux petits hochements, un sourire complice */
  var S = avec(T(b, -62, 1), {sourire:0.9, sourcils:0.4, regX:-0.6});
  A.signe = [[0.3, avec(T(b, -62, 0), {regX:-0.7, sourcils:0.2})], [0.62, S],
    [0.8, avec(S, {hoche:14, plisse:0.3})], [0.95, avec(S, {hoche:-3})], [1.1, avec(S, {hoche:11, plisse:0.35})], [1.26, avec(S, {hoche:0, sourire:1.1})],
    [1.8, avec(S, {sourire:1.1})], [2.1, avec(T(b, -62, 0), {sourire:0.6, regX:-0.2})], [2.5, {}]];
  /* IL SE GRATTE LA TÊTE (derrière l'oreille, de SA main gauche), pensif, les yeux en l'air */
  var Gr = {mainD:[30, 100, -6], relD:1, coudeD:[1, 0.2, -0.3], mdirD:[-0.4, -1, -0.1], poingD:0.55, pen:-7, sourcilsAsym:0.6, bouchex:0.5, regY:-0.5, regX:0.3, sourire:0.1, tete:6};
  A.gratte = [[0.45, avec(Gr, {mainD:[32, 104, -4]})]].concat([0.55, 0.65, 0.75, 0.85, 0.95, 1.05, 1.15, 1.25].map(function(t, i){
    return [t, avec(Gr, {mainD:[30 + (i % 2) * 2, 100 + (i % 2 ? -5 : 4), -6]})]; }))
    .concat([[1.6, avec(Gr, {sourcilsAsym:0.3, bouchex:0.2, regY:-0.2})], [2.0, {pen:-2, regY:0.1}], [2.3, {}]]);
  /* IL SE MET EN GARDE : il se ramasse, les poings devant lui, l'air décidé, deux petits rebonds ; puis se détend */
  var Ga = {mainG:[-30, 188, 50], relG:1, coudeG:[-0.9, 0.3, -0.3], poingG:1, mainD:[24, 178, 48], relD:1, coudeD:[0.9, 0.3, -0.3], poingD:1, mdirD:[-0.2, 0, 1],
    sourcils:-0.95, plisse:0.45, sourire:-0.35, largeB:0.7, hoche:4, regX:0.4};
  A.garde = [[0.25, avec(Ga, {bas:[0, 22, 0], bang:[8, 0, 2]})], [0.5, avec(Ga, {bas:[0, 16, 0], bang:[8, 0, 2]})], [0.72, avec(Ga, {bas:[0, 24, 0], bang:[9, 0, 3]})],
    [0.95, avec(Ga, {bas:[0, 17, 0], bang:[8, 0, 2]})], [1.6, avec(Ga, {bas:[0, 19, 0], bang:[8, 0, 2], sourcils:-0.8})], [2.0, {sourcils:-0.3, sourire:0.1}], [2.4, {}]];
  return A;
}
function pisteur(A){
  /* SON ARC : elle le lève devant elle, regarde sa courbe, pince la corde (le geste de la position « au repos ») */
  A.arc = HV.POSITIONS.repos.gestes.arc;
}
function alchimiste(A){
  /* SES FIOLES : il baisse les yeux sur sa sangle et les compte du bout de l'index, une à une, de l'épaule à la hanche ; content,
     un petit hochement */
  var C = {relG:1, coudeG:[-0.9, 0.3, -0.3], poingG:0.6, indexG:1, pouceG:[0, -1, 0.3], mdirG:[0.3, 0.3, 1], hoche:16, regY:0.7, regX:-0.1, sourcils:0.25, largeB:0.7};
  A.fioles = [[0.4, avec(C, {mainG:[-22, 152, 34]})], [0.7, avec(C, {mainG:[-13, 160, 40]})], [1.0, avec(C, {mainG:[-3, 170, 43], regX:0})],
    [1.3, avec(C, {mainG:[10, 183, 41], regX:0.1})], [1.6, avec(C, {mainG:[20, 195, 35], regX:0.2})],
    [1.9, avec(C, {mainG:[16, 196, 36], hoche:6, regY:0.2, sourire:0.9, plisse:0.3, indexG:0})], [2.1, {hoche:12, sourire:0.9}], [2.3, {hoche:3, sourire:0.9}], [2.8, {}]];
  /* UNE FIOLE VERS LA LUMIÈRE : il en prend une, la lève devant ses yeux, la penche un peu, plisse les yeux ; la remet */
  var F = {fioleG:1, relG:1, coudeG:[-0.8, 0.4, -0.3], pouceG:[0, -1, 0], mdirG:[0.2, -0.2, 1], poingG:0.92};
  A.lumiere = [[0.3, {mainG:[-16, 162, 28], relG:1, coudeG:[-0.9, 0.3, -0.2], poingG:0.3, hoche:12, regY:0.6}],
    [0.42, {mainG:[-16, 160, 30], relG:1, coudeG:[-0.9, 0.3, -0.2], poingG:0.92, fioleG:1, hoche:12, regY:0.6}],
    /* (sur le côté, au-dessus de son épaule droite : pas devant son visage) */
    [0.85, avec(F, {mainG:[-58, 74, -2], coudeG:[-1, 0.2, -0.2], hoche:-10, regY:-0.6, regX:-0.8, tete:-10, plisse:0.6, sourcils:0.3, sourcilsAsym:0.5})],
    [1.3, avec(F, {mainG:[-60, 72, -2], coudeG:[-1, 0.2, -0.2], pouceG:[0.3, -1, 0], hoche:-10, regY:-0.6, regX:-0.8, tete:-10, plisse:0.7, sourcils:0.3, sourcilsAsym:0.5, bouchex:0.4})],
    [1.7, avec(F, {mainG:[-58, 74, -2], coudeG:[-1, 0.2, -0.2], hoche:-8, regY:-0.5, regX:-0.8, tete:-10, plisse:0.3, sourire:0.8})],
    [2.15, {mainG:[-16, 160, 30], relG:1, coudeG:[-0.9, 0.3, -0.2], poingG:0.92, fioleG:1, hoche:12, regY:0.6, sourire:0.5}],
    [2.27, {mainG:[-16, 162, 28], relG:1, coudeG:[-0.9, 0.3, -0.2], poingG:0.3, fioleG:0, hoche:10, regY:0.5}], [2.7, {}]];
}
var PROPRES = {pisteur:pisteur, alchimiste:alchimiste};
HV.attentes = function(role, base){
  var k = role + ':' + (base === HV.POSES.aGarde ? 'a' : 'd');
  if(cache[k]) return cache[k];
  var A = communs(base);
  if(PROPRES[role]) PROPRES[role](A);
  return (cache[k] = A);
};
HV.NOMS_ATTENTE = {ennemis:'Il surveille les ennemis', derriere:'Il regarde son compagnon de derrière', devant:'Un coup d’œil devant', signe:'Un signe de tête',
  gratte:'Il se gratte la tête', garde:'Il se met en garde', arc:'Elle regarde son arc', fioles:'Il compte ses fioles', lumiere:'Une fiole vers la lumière'};
})(window);
