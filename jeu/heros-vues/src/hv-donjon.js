/* ==========================================================
   Les héros « en volume » — LES MOUVEMENTS DU DONJON, propositions (Romain, 23 novembre, 15 h 04 ; refaites après ses retours de
   15 h 54). Rien n'est branché dans le donjon : ce sont des essais à valider.
   - L'arc est dans SA main droite (Romain, 15 h 54 : « l'arc, il faut le mettre sur la main droite pour qu'on voie mieux l'arc ») :
     tournée vers la droite de trois quarts, c'est la main de notre côté. Pour tirer à droite, elle se met de profil, le dos un peu
     vers nous (comme une archère qui tient l'arc de la main droite).
   - HV.course(t) : la course ; HV.POSES.dGarde : en garde ; HV.DONJON : les gestes (mêmes images clés que hv-positions.js).
   Chargé après hv-positions.js.
   ========================================================== */
(function(G){
'use strict';
var HV = G.HerosVues, P = HV.POSES, TAU = Math.PI * 2, avec = HV.avec, C = HV.courbes;

/* ---------- LA COURSE (Romain, 15 h 54 : « personne ne court comme ça, à moitié penché en tapant des pieds […] une course vraiment
   naturelle ») : le buste presque droit ; les bras pliés à angle droit qui balancent d'avant en arrière, à l'opposé des jambes ; le
   pied se pose sous elle (talon puis plante), elle passe dessus, il pousse sur la pointe ; puis le talon remonte vers les fesses, le
   genou passe devant, haut, la jambe se déplie et le pied revient se poser. Entre deux appuis, elle est en l'air. ---------- */
var CYCLE = 0.62, APPUI = 0.36, AV = 26, AR = -34;
/* (le pied en l'air : [phase, avant/arrière, hauteur de la cheville, pointe]) */
var VOL = [[APPUI, AR, 386, 52], [0.5, -32, 318, 72], [0.68, 4, 330, 30], [0.86, 34, 366, -6], [1, AV, 386, -10]];
var VT = VOL.map(function(v){ return v[0]; }), VZ = VOL.map(function(v){ return v[1]; }), VY = VOL.map(function(v){ return v[2]; }), VP = VOL.map(function(v){ return v[3]; });
var MZ = C.pentes(VT, VZ), MY = C.pentes(VT, VY), MP = C.pentes(VT, VP);
function pied(u, cote){
  var z, y, pt;
  if(u < APPUI){ var a = u / APPUI; z = AV + (AR - AV) * a; y = 386; pt = a < 0.15 ? -10 + 10 * a / 0.15 : a < 0.5 ? 0 : 52 * Math.pow((a - 0.5) / 0.5, 1.5); }
  else { z = C.courbe(VT, VZ, MZ, u); y = C.courbe(VT, VY, MY, u); pt = C.courbe(VT, VP, MP, u); }
  return {p:[cote * 16, y, z], pt:pt};
}
/* un bras plié qui balance (dans les mesures du buste) : phi > 0, il part devant */
function bras(cote, phi){
  var a = phi * Math.PI / 180, b2 = a + 1.55, S = [cote * 31.5, 151, 0];
  return [S[0] + cote * (50 * 0.12 + 40 * 0.05), S[1] + 50 * Math.cos(a) + 40 * Math.cos(b2), S[2] + 50 * Math.sin(a) + 40 * Math.sin(b2)];
}
HV.COURSE = {cycle:CYCLE, avance:(AV - AR) / APPUI};      /* (de combien elle avance par cycle, dans ses mesures) */
HV.course = function(t){
  var f = (t / CYCLE) % 1, g = pied(f, -1), d = pied((f + 0.5) % 1, 1), th = TAU * f;
  /* (le bassin est au plus bas quand un pied est sous elle, au plus haut en l'air) */
  var h = (f % 0.5) / 0.5, bob = Math.cos(TAU * (h - APPUI));      /* (h = APPUI : le milieu de l'appui) */
  var yH = 7 * Math.cos(th);
  return avec(P.repos, {bas:[0, 10 + 5 * bob, 4], bang:[6, 0, yH], dos:[4, 0, -2.4 * yH], tete:1.4 * yH,
    piedG:g.p, pointeG:g.pt, genouG:[-0.12, -0.25, 1], piedD:d.p, pointeD:d.pt, genouD:[0.12, -0.25, 1], ouvG:0.12, ouvD:0.12,
    mainD:bras(1, 34 * Math.cos(th)), relD:1, coudeD:[0.3, 0, -1], poingD:0.8, mdirD:[0, -0.4, 1],
    mainG:bras(-1, -24 * Math.cos(th)), relG:1, coudeG:[-0.3, 0, -1], arcAxe:[-0.1, 0.9, -0.4], arcDir:[-0.8, 0, 0.6], poingG:0.85,
    hoche:-2, sourire:0.2, ouvre:0.2, sourcils:-0.1, rougit:0.15});
};

/* ---------- EN GARDE, au donjon : les genoux un peu pliés, l'arc prêt de notre côté, la main libre près du carquois ---------- */
P.dGarde = avec(P.repos, {bas:[0, 26, 2], bang:[8, 0, 0], dos:[10, 0, -4], piedG:[-32, 386, 18], piedD:[30, 386, -14], ouvG:0.45, ouvD:0.45,
  genouG:[-0.45, 0, 1], genouD:[0.45, 0, 1],
  mainG:[-58, 226, 30], coudeG:[-0.8, 0.3, -0.5], arcAxe:[-0.1, 0.92, -0.35], arcDir:[-0.85, 0, 0.5], poingG:0.8,
  mainD:[40, 206, 30], coudeD:[0.8, 0.3, -0.5], mdirD:[-0.2, 0.2, 1], poingD:0.45, hoche:-4,
  sourire:-0.2, largeB:0.85, sourcils:-0.55, plisse:0.15});
var b = P.dGarde;
var AIE = {plisse:1, sourcilsIn:1, sourcils:0.2, ouvre:0.55, largeB:0.9, sourire:-0.9, rougit:0.3};
var KO = {plisse:0.95, sourcilsIn:0.85, sourcils:0.1, ouvre:0.25, largeB:0.7, sourire:-0.5, bouchex:0.5};
/* (le pied de derrière recule pour encaisser : SON pied gauche, piedD) */
function recule(z, leve){ return {piedD:[32, 386 - (leve ? 16 : 0), z], pointeD:leve ? 25 : 0}; }

HV.DONJON = {
  /* EN GARDE : elle regarde à droite, à gauche — la tête d'abord, puis les épaules, les hanches, un petit pas */
  regard:HV.regardeEtRevient(b, -50, 0.8).slice(0, -1).concat(HV.regardeEtRevient(b, 40, 0.8, 0).map(function(x){ return [x[0] + 3.1, x[1]]; })),
  /* ELLE TIRE : la main derrière l'épaule, le bras levé haut, la flèche sur l'arc, deux pas pour se mettre de profil, elle bande,
     lâche (à 1,38 s, comme aujourd'hui au donjon), puis revient en garde */
  tir:HV.flecheSortie({base:b, tourne:105, lache:true}),
  /* ELLE PREND UN COUP : la tête et le buste partent en arrière, le pied de derrière recule pour encaisser, elle grimace ; puis elle
     revient */
  coup:[[0.08, avec(AIE, {bas:[0, 32, -8], bang:[-8, 0, 0], dos:[-16, 0, 8], hoche:-16, pen:-8, mainD:[52, 196, 6], mainG:[-64, 216, 14]})],
    [0.2, avec(AIE, avec(recule(-30, true), {bas:[0, 34, -16], bang:[-8, 0, 0], dos:[-14, 0, 8], hoche:-12, pen:-8, mainD:[52, 200, 6], mainG:[-64, 220, 14]}))],
    [0.32, avec(AIE, avec(recule(-42), {bas:[0, 38, -22], bang:[-2, 0, 0], dos:[-6, 0, 4], hoche:-8, pen:-4}))],
    [0.7, avec(recule(-42), {bas:[0, 36, -18], bang:[4, 0, 0], dos:[6, 0, 0], plisse:0.6, ouvre:0.2, sourcils:-0.6, sourcilsIn:0.4})],
    [1.0, avec(recule(-30, true), {bas:[0, 30, -6]})], [1.25, {}]],
  /* ELLE TOMBE (Romain, 15 h 54 : « on montre bien qu'elle tombe sur le côté […] quand tu tombes en arrière, tu as tendance à mettre
     tes mains pour te protéger ») : touchée, elle recule d'un pas, perd l'équilibre, ses mains partent en arrière pour amortir, elle
     tombe assise et roule sur le côté, sur l'avant-bras ; sonnée ; puis elle se remet sur un genou, se relève en secouant la tête */
  chute:[[0.08, avec(AIE, {bas:[0, 32, -8], bang:[-8, 0, 0], dos:[-16, 0, 8], hoche:-16, mainD:[52, 196, 6], mainG:[-64, 216, 14]})],
    [0.24, avec(AIE, avec(recule(-36, true), {bas:[0, 40, -18], bang:[-12, -4, 0], dos:[-14, -4, 0], hoche:-12, mainD:[60, 170, 10], mainG:[-72, 180, 10], coudeG:[-0.8, -0.3, -0.5]}))],
    /* (elle part en arrière : les genoux lâchent, les deux mains vont chercher le sol derrière elle) */
    [0.42, avec(AIE, avec(recule(-40), {bas:[-6, 76, -30], bang:[-22, -8, 0], dos:[-12, -6, 0], hoche:-6, piedG:[-28, 386, 30], genouG:[-0.4, -0.5, 1],
      mainD:[44, 300, -60], relD:0, coudeD:[1, 0, -0.2], mainG:[-56, 300, -66], relG:0, coudeG:[-1, 0, -0.2], mdirD:[0, 1, -0.3], mdirG:[0, 1, -0.3], poingD:0.1}))],
    /* (assise, les mains au sol derrière elle) */
    [0.58, avec(AIE, {bas:[-6, 132, -32], bang:[-30, -2, 0], dos:[-16, -2, 0], hoche:-2, piedG:[-26, 392, 52], piedD:[26, 392, 40], genouG:[-0.3, -1, 0.2], genouD:[0.3, -1, 0.2], pointeG:-15, pointeD:-15,
      mainD:[40, 388, -66], relD:0, coudeD:[1, 0, -0.3], mainG:[-46, 388, -70], relG:0, coudeG:[-1, 0, -0.3], poingD:0.1, mdirD:[0, 0.3, -1], mdirG:[0, 0.3, -1]})],
    /* (elle roule sur SON côté droit, sur l'avant-bras ; les jambes pliées de l'autre côté) */
    [0.78, avec(KO, {bas:[-12, 138, -26], bang:[-14, -30, -10], dos:[-4, -16, 0], hoche:-2, pen:10, piedG:[-6, 392, 46], piedD:[30, 392, 34], genouG:[0.4, -1, 0.3], genouD:[0.6, -1, 0.3], pointeG:-10, pointeD:-10,
      mainG:[-82, 396, -8], relG:0, coudeG:[-1, 0.2, -0.2], mdirG:[0, 0.2, 1], mainD:[0, 342, -18], relD:0, coudeD:[1, 0, -0.3], poingD:0.3})],
    [2.1, avec(KO, {bas:[-12, 138, -26], bang:[-14, -30, -10], dos:[-4, -16, 0], hoche:4, pen:14, tete:8, piedG:[-6, 392, 46], piedD:[30, 392, 34], genouG:[0.4, -1, 0.3], genouD:[0.6, -1, 0.3], pointeG:-10, pointeD:-10,
      mainG:[-82, 396, -8], relG:0, coudeG:[-1, 0.2, -0.2], mdirG:[0, 0.2, 1], mainD:[0, 342, -18], relD:0, coudeD:[1, 0, -0.3], poingD:0.3})],
    /* (elle se redresse sur sa main, ramène les jambes sous elle) */
    [2.6, avec(KO, {bas:[-4, 118, -18], bang:[30, -6, 0], dos:[20, -4, 0], hoche:10, pen:4, piedG:[-28, 386, 26], piedD:[26, 394, -10], pointeD:80, genouG:[-0.4, -0.5, 1], genouD:[0.2, 0.9, 1],
      mainG:[-58, 392, 34], relG:0, mainD:[22, 330, 40], relD:0, plisse:0.6, sourcilsIn:0.7})],
    /* (un genou à terre, la main sur le genou) */
    [3.05, {bas:[0, 86, -12], bang:[16, 0, 0], dos:[16, 0, 0], piedD:[15, 394, -60], pointeD:88, genouD:[0.1, 0.9, 1], piedG:[-27, 386, 46], genouG:[-0.3, -0.5, 1],
      mainD:[-18, 316, 50], relD:0, mdirD:[-1, 0.4, 0.3], poingD:0.2, mainG:[-62, 330, 50], relG:0, hoche:10, plisse:0.4, sourcilsIn:0.6, sourire:-0.4}],
    /* (elle se relève, encore penchée ; puis secoue la tête) */
    [3.6, {bas:[0, 40, -4], bang:[18, 0, 0], dos:[16, 0, 0], piedD:[28, 386, -20], mainD:[-8, 290, 44], relD:0, mdirD:[-1, 0.4, 0.3], hoche:6, sourcilsIn:0.4, plisse:0.2}],
    [3.85, {pen:10, sourcils:-0.4}], [4.05, {pen:-10, sourcils:-0.4}], [4.25, {pen:6, sourcils:-0.6}], [4.75, {}]],
  /* VICTOIRE : elle se ramasse, saute (le corps monte, les jambes se replient un peu, l'ombre reste au sol), lève l'arc et le poing,
     retombe en pliant les genoux */
  joie:[[0.18, {bas:[0, 50, 4], bang:[12, 0, 0], mainD:[42, 236, -16], mainG:[-60, 232, -8], hoche:6, sourire:1, ouvre:0.3, sourcils:0.6}],
    [0.32, {bas:[0, 6, 0], bang:[2, 0, 0], mainG:[-64, 130, 16], relG:1, mainD:[56, 126, 16], relD:1, poingD:1, sourire:1, ouvre:0.6, sourcils:0.9, pointeG:40, pointeD:40}],
    [0.5, {leve:64, bas:[0, 22, 0], piedG:[-20, 372, 6], piedD:[20, 372, -2], pointeG:30, pointeD:30,
      mainG:[-60, 70, 10], relG:1, coudeG:[-1, 0.3, 0], arcAxe:[-0.25, 1, 0.1], arcDir:[-0.3, 0, 1], mainD:[56, 76, 10], relD:1, coudeD:[1, 0.4, 0], poingD:1, brasDessus:1,
      sourire:1, ouvre:0.85, sourcils:0.9, plisse:0.5, rougit:0.6, hoche:-8}],
    [0.68, {leve:0, bas:[0, 46, 2], mainG:[-60, 76, 10], relG:1, coudeG:[-1, 0.3, 0], arcAxe:[-0.25, 1, 0.1], arcDir:[-0.3, 0, 1], mainD:[56, 82, 10], relD:1, coudeD:[1, 0.4, 0], poingD:1, brasDessus:1,
      sourire:1, ouvre:0.7, sourcils:0.9, plisse:0.5, rougit:0.6, hoche:-4}],
    [0.95, {bas:[0, 8, 0], mainG:[-60, 70, 10], relG:1, coudeG:[-1, 0.3, 0], arcAxe:[-0.25, 1, 0.1], arcDir:[-0.3, 0, 1], mainD:[56, 76, 10], relD:1, coudeD:[1, 0.4, 0], poingD:1, brasDessus:1,
      sourire:1, ouvre:0.7, sourcils:0.9, plisse:0.45, rougit:0.6, hoche:-6}],
    [1.7, {bas:[0, 8, 0], mainG:[-60, 74, 10], relG:1, coudeG:[-1, 0.3, 0], arcAxe:[-0.25, 1, 0.1], arcDir:[-0.3, 0, 1], mainD:[56, 70, 10], relD:1, coudeD:[1, 0.4, 0], poingD:1, brasDessus:1,
      sourire:1, ouvre:0.5, sourcils:0.9, plisse:0.45, rougit:0.6, hoche:-6}],
    /* (les bras redescendent par les côtés, pas devant elle) */
    [2.05, {bas:[0, 14, 0], mainG:[-86, 176, -4], relG:1, coudeG:[-1, 0.2, -0.2], arcAxe:[-0.2, 1, 0], arcDir:[-0.3, 0, 1], mainD:[84, 176, -4], relD:1, coudeD:[1, 0.2, -0.2], poingD:0.6, sourire:1, ouvre:0.2, sourcils:0.5}],
    [2.5, {}]]
};
/* (le donjon comme une position : pour les pages d'essai, gestes.html#donjon:tir) */
HV.POSITIONS.donjon = {titre:'En garde', base:'dGarde', attente:[99, 99], gestes:HV.DONJON};
HV.NOMS_DONJON = {course:'Elle arrive en courant', regard:'En garde, elle regarde autour', tir:'Elle tire', coup:'Elle prend un coup', chute:'Elle tombe… et se relève', joie:'Victoire !'};
})(window);
