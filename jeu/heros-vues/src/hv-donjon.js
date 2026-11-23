/* ==========================================================
   Les héros « en volume » — LES MOUVEMENTS DU DONJON, premières propositions (Romain, 23 novembre, 15 h 04 : « quand les héros
   arrivent dans une salle, on les voit, ils courent, et ils sont pas uniquement de profil […] une fois qu'ils sont en place, le
   pisteur, il est de 3/4 face ou alors de côté, en garde […] il peut retourner la tête à droite, à gauche […] les mouvements quand
   il va attaquer […] quand ils se prennent des coups, il faut changer les expressions du visage […] quand ils tombent au sol,
   quand ils se relèvent »). Rien n'est branché dans le donjon : ce sont des essais à valider.
   - HV.course(t, o) : la pose de la course à l'instant t (un cycle de foulées) ; o.vit : la longueur d'un cycle.
   - HV.POSES.dGarde : en garde au donjon ; HV.DONJON : des gestes (mêmes images clés que hv-positions.js) à partir de dGarde.
   Chargé après hv-positions.js.
   ========================================================== */
(function(G){
'use strict';
var HV = G.HerosVues, P = HV.POSES, TAU = Math.PI * 2;
function avec(base, plus){ var R = {}, k; for(k in base) R[k] = base[k]; for(k in plus) R[k] = plus[k]; return R; }
function doux(u){ return u * u * (3 - 2 * u); }

/* ---------- la course : un cycle (deux foulées) ----------
   Pour chaque pied, une phase u (0 → 1) : au sol pendant APPUI (il recule sous elle, à vitesse constante : il ne glisse pas), puis
   en l'air (il revient devant, en montant). Entre deux appuis, les deux pieds sont en l'air (c'est une course, pas une marche).
   Les bras balancent à l'opposé des jambes ; le bassin descend quand un pied est sous elle ; les épaules tournent un peu.
   HV.COURSE.pas : de combien elle avance (dans ses mesures) par cycle. */
var APPUI = 0.42, PAS = 40;
HV.COURSE = {appui:APPUI, pas:PAS * 4};
function pied(u, cote){
  var z, y, pt;
  if(u < APPUI){ var a = u / APPUI; z = PAS - 2 * PAS * a; y = 386; pt = a > 0.7 ? (a - 0.7) / 0.3 * 40 : 0; }
  else { var s = (u - APPUI) / (1 - APPUI); z = -PAS + 2 * PAS * doux(s); y = 386 - 44 * Math.sin(Math.PI * Math.min(1, s * 1.15)); pt = 40 * (1 - s) - 10 * Math.sin(Math.PI * s); }
  return {p:[cote * 17, y, z], pt:pt};
}
HV.course = function(t, o){
  o = o || {};
  var T = o.vit || 0.62, f = (t / T) % 1, uG = f, uD = (f + 0.5) % 1, g = pied(uG, -1), d = pied(uD, 1);
  var th = TAU * f, bob = Math.cos(2 * th);
  return avec(P.repos, {bas:[0, 16 + 5 * bob, 6], bang:[14, 0, 8 * Math.sin(th)], dos:[12, 0, -14 * Math.sin(th)],
    piedG:g.p, pointeG:g.pt, genouG:[-0.15, -0.2, 1], piedD:d.p, pointeD:d.pt, genouD:[0.15, -0.2, 1], ouvG:0.1, ouvD:0.1,
    /* (les bras : le droit — la main libre — balance fort, celui de l'arc moins) */
    mainD:[36, 196 + 8 * Math.cos(th), 34 * Math.sin(th) + 6], relD:1, coudeD:[0.6, 0.2, -0.8], poingD:0.75, mdirD:[0, -0.3, 1],
    mainG:[-44, 214 - 6 * Math.cos(th), -22 * Math.sin(th) + 10], relG:1, coudeG:[-0.6, 0.2, -0.8], arcAxe:[0, 0.4, 0.9], arcDir:[-0.9, 0.35, -0.2],
    hoche:-6, sourire:0.1, ouvre:0.25, sourcils:-0.2, rougit:0.2});
};

/* ---------- en garde, au donjon : les genoux un peu pliés, l'arc prêt, la main libre près du carquois ---------- */
P.dGarde = avec(P.repos, {bas:[0, 26, 2], bang:[10, 0, 0], dos:[12, 0, -6], piedG:[-34, 386, 16], piedD:[30, 386, -14], ouvG:0.45, ouvD:0.45,
  genouG:[-0.45, 0, 1], genouD:[0.45, 0, 1],
  mainG:[-50, 222, 36], coudeG:[-0.8, 0.3, -0.5], arcAxe:[0.2, 0.75, 0.6], arcDir:[-0.9, 0.2, -0.1], poingG:0.8,
  mainD:[40, 206, 30], coudeD:[0.8, 0.3, -0.5], mdirD:[-0.2, 0.2, 1], poingD:0.45, hoche:-4,
  sourire:-0.2, largeB:0.85, sourcils:-0.55, plisse:0.15});

/* (les poses qui servent plusieurs fois) */
var CARQ = {mainD:[38, 106, -15], relD:1, coudeD:[0.5, -1, 0.5], mdirD:[0, -0.4, -0.9], pouceD:[-0.2, -1, 0.4], poingD:0.5, tete:20};
/* (pour viser, elle se met de profil par rapport à sa cible, à droite : la flèche part droit vers elle — capA 0, capW 1) */
var VISE = {capA:0, capW:1, mainG:[-116, 151, 5], relG:1, coudeG:[0, 0.7, -0.6], pouceG:[0, -1, 0.1], arcAxe:[0, 1, 0], arcDir:[-1, 0, 0.04], poingG:0.75,
  bas:[0, 12, 0], bang:[4, 0, 0], dos:[4, 0, 0], tete:-84, brasDessus:1, sourcils:-0.8, plisse:0.5, sourire:-0.1, largeB:0.75};
var AU_SOL = {bas:[0, 132, -30], bang:[-18, 0, 0], dos:[-8, 0, 0], piedG:[-26, 392, 70], piedD:[24, 392, 84], genouG:[-0.3, -1, 0.2], genouD:[0.3, -1, 0.2],
  pointeG:-20, pointeD:-20, ouvG:0.3, ouvD:0.3, mainG:[-44, 392, -48], relG:0, coudeG:[-1, 0, -0.3], arcAxe:[0.2, 0.2, 1], arcDir:[-1, 0.2, 0], mainD:[44, 392, -48], relD:0, coudeD:[1, 0, -0.3],
  poingD:0.1, hoche:-6, tete:0};
var AIE = {plisse:1, sourcilsIn:1, sourcils:0.2, ouvre:0.55, largeB:0.9, sourire:-0.9, rougit:0.3};
var KO = {plisse:0.95, sourcilsIn:0.85, sourcils:0.1, ouvre:0.25, largeB:0.7, sourire:-0.5, bouchex:0.5};
function plus(a, b){ return avec(a, b); }

HV.DONJON = {
  /* EN GARDE : elle regarde à gauche, à droite (on voit sa tête tourner en volume), puis revient sur l'ennemi */
  regard:[[0.5, {tete:-46, regX:-0.6}], [1.4, {tete:-46, regX:-0.6}], [2.0, {tete:38, regX:0.6, tourne:8}], [2.9, {tete:38, regX:0.6, tourne:8}], [3.5, {}]],
  /* ELLE TIRE : la main au carquois, la flèche sur l'arc, elle bande l'arc, vise… lâche ; le bras suit, puis elle se remet en garde */
  tir:[[0.32, CARQ], [0.45, plus(CARQ, {poingD:0.95, flecheD:1})],
    [0.85, {mainD:[30, 190, 44], relD:1, coudeD:[1, 0.3, -0.3], mdirD:[-0.4, 0.1, 1], poingD:0.95, flecheD:1, pouceD:[-0.8, 0, 0.5],
      mainG:[-92, 200, 30], relG:1, coudeG:[-0.6, 0.6, -0.5], arcAxe:[0, 1, 0], arcDir:[-1, 0, 0.1], pouceG:[0, -1, 0.1], tete:-40, bas:[0, 16, 0], bang:[6, 0, 0], dos:[6, 0, 0], capA:0, capW:0.6}],
    [1.15, plus(VISE, {mainD:[-82, 152, 8], relD:1, coudeD:[1, -0.2, -0.4], poingD:0.9, flecheD:1, pouceD:[-1, 0, 0.1], tendu:0})],
    [1.25, plus(VISE, {mainD:[-82, 152, 8], relD:1, coudeD:[1, -0.2, -0.4], poingD:0.9, flecheD:0, pouceD:[-1, 0, 0.1], tendu:0.04})],
    [1.8, plus(VISE, {mainD:[17, 128, 12], relD:1, coudeD:[1, -0.35, -0.3], poingD:0.8, tendu:1})],
    [2.25, plus(VISE, {mainD:[17, 128, 12], relD:1, coudeD:[1, -0.35, -0.3], poingD:0.8, tendu:1})],
    /* (le lâcher : la corde part, la main recule, ouverte) */
    [2.31, plus(VISE, {mainD:[34, 122, -10], relD:1, coudeD:[1, -0.35, -0.3], poingD:0.1, tendu:0, mainG:[-112, 146, 2], plisse:0.3, ouvre:0.15})],
    [2.7, plus(VISE, {mainD:[40, 128, -14], relD:1, coudeD:[1, -0.35, -0.3], poingD:0.15, tendu:0, mainG:[-110, 150, 4], plisse:0.3, sourire:0.4})],
    [3.4, {}]],
  /* ELLE PREND UN COUP : la tête et le haut du corps partent en arrière, elle grimace, puis revient en garde */
  coup:[[0.1, plus(AIE, {bas:[0, 34, -14], bang:[-10, 0, 0], dos:[-16, 0, 8], hoche:-16, pen:-8, mainD:[52, 196, 6], mainG:[-60, 214, 14], tourne:-10})],
    [0.42, plus(AIE, {bas:[0, 36, -16], bang:[-10, 0, 0], dos:[-16, 0, 8], hoche:-14, pen:-8, mainD:[52, 200, 6], mainG:[-60, 218, 14], tourne:-10})],
    [0.75, plus(AIE, {bas:[0, 30, -6], bang:[4, 0, 0], dos:[6, 0, 0], plisse:0.6, ouvre:0.2, sourcils:-0.6, sourcilsIn:0.4})], [1.3, {}]],
  /* ELLE TOMBE : touchée, ses genoux lâchent, elle tombe assise en arrière ; sonnée ; puis elle s'appuie, se relève et se remet en garde */
  chute:[[0.1, plus(AIE, {bas:[0, 34, -14], bang:[-10, 0, 0], dos:[-16, 0, 8], hoche:-16, mainD:[52, 196, 6], mainG:[-60, 214, 14]})],
    [0.42, plus(AIE, {bas:[0, 80, -20], bang:[-6, 0, 0], dos:[-14, 0, 0], hoche:-10, piedG:[-28, 386, 40], piedD:[26, 386, 44], genouG:[-0.4, -0.4, 1], genouD:[0.4, -0.4, 1], mainD:[58, 260, -10], mainG:[-60, 270, 0]})],
    [0.62, plus(AU_SOL, plus(KO, {bang:[-26, 0, 0], dos:[-12, 0, 0], hoche:-14}))],
    [0.8, plus(AU_SOL, KO)],
    [2.4, plus(AU_SOL, plus(KO, {tete:10, pen:6}))],
    /* (elle se relève : elle ramène les pieds, se penche en avant, une main sur le genou, se redresse ; elle secoue la tête) */
    [3.0, {bas:[0, 110, -14], bang:[30, 0, 0], dos:[30, 0, 0], piedG:[-28, 386, 10], piedD:[28, 386, 14], genouG:[-0.5, -0.2, 1], genouD:[0.5, -0.2, 1], pointeG:30, pointeD:30,
      mainD:[30, 330, 58], relD:0, mdirD:[-0.2, 0.9, 0.3], poingD:0.2, mainG:[-56, 380, 60], relG:0, arcAxe:[0, 1, 0.1], arcDir:[-0.3, 0, 1], hoche:10, sourcilsIn:0.6, plisse:0.4, sourire:-0.3}],
    [3.6, {bas:[0, 40, -6], bang:[20, 0, 0], dos:[20, 0, 0], mainD:[34, 300, 40], relD:0, mdirD:[-0.2, 0.9, 0.3], poingD:0.2, hoche:6, sourcilsIn:0.4, plisse:0.2}],
    [3.85, {pen:9, sourcils:-0.4}], [4.05, {pen:-9, sourcils:-0.4}], [4.25, {pen:6, sourcils:-0.6}], [4.7, {}]],
  /* JOIE : elle lève l'arc et le poing (la petite saute est faite par le film) */
  joie:[[0.3, {bas:[0, 30, 0], mainG:[-74, 70, 4], relG:1, coudeG:[-1, 0.3, 0], arcAxe:[1, 0.1, 0], arcDir:[0, -1, 0.1], mainD:[60, 84, 8], relD:1, coudeD:[1, 0.4, 0], poingD:1, brasDessus:1,
      sourire:1, ouvre:0.7, sourcils:0.9, plisse:0.45, rougit:0.6, hoche:-6}],
    [0.55, {bas:[0, -4, 0], mainG:[-74, 64, 4], relG:1, coudeG:[-1, 0.3, 0], arcAxe:[1, 0.1, 0], arcDir:[0, -1, 0.1], mainD:[60, 76, 8], relD:1, coudeD:[1, 0.4, 0], poingD:1, brasDessus:1,
      sourire:1, ouvre:0.8, sourcils:0.9, plisse:0.5, rougit:0.6, hoche:-8, piedG:[-22, 386, 4], piedD:[22, 386, -4], pointeG:40, pointeD:40}],
    [1.5, {bas:[0, -4, 0], mainG:[-74, 70, 4], relG:1, coudeG:[-1, 0.3, 0], arcAxe:[1, 0.1, 0], arcDir:[0, -1, 0.1], mainD:[60, 84, 8], relD:1, coudeD:[1, 0.4, 0], poingD:1, brasDessus:1,
      sourire:1, ouvre:0.6, sourcils:0.9, plisse:0.45, rougit:0.6, hoche:-6}],
    [2.1, {}]]
};
HV.NOMS_DONJON = {course:'Elle arrive en courant', regard:'En garde, elle regarde autour', tir:'Elle tire', coup:'Elle prend un coup', chute:'Elle tombe… et se relève', joie:'Victoire !'};
})(window);
