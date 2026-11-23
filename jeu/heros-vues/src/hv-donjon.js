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

/* ---------- LA COURSE (troisième version — Romain, 16 h 39 : « le mouvement de la course, il est encore un peu bizarre. Regarde sur
   internet des mouvements naturels de course »). Ce que disent les guides d'animation et de course à pied :
   - un pas = 4 images clés : le pied se pose (un peu devant elle, le genou à peine plié) → elle « s'enfonce » (le genou d'appui plie,
     c'est le point le plus bas) → elle pousse (la jambe d'appui s'étend derrière, sur la pointe) → elle est EN L'AIR (le point le plus
     haut, les jambes les plus écartées) ;
   - la jambe libre : le talon remonte derrière, vers les fesses ; le genou passe devant (pas trop haut : elle court, elle ne sprinte
     pas) ; la jambe se déplie et le pied revient se poser SOUS elle, pas loin devant ;
   - le corps penche un peu en avant d'un seul bloc (depuis les chevilles), la tête reste droite et regarde devant ;
   - les bras, pliés à angle droit, balancent à l'opposé des jambes, et c'est EN L'AIR qu'ils sont le plus loin (pas au moment où le
     pied se pose) ; devant, la main monte vers la poitrine et rentre un peu vers le milieu ; derrière, elle passe la hanche ;
   - les hanches et les épaules tournent un peu, en sens contraire. ---------- */
var CYCLE = 0.64, APPUI = 0.32, AV = 30, AR = -48;
/* (le pied en l'air : [phase, avant/arrière, hauteur de la cheville, pointe] ; 0 : il se pose ; APPUI : il quitte le sol) */
var VOL = [[APPUI, AR, 386, 45], [0.42, -56, 352, 70], [0.55, -40, 318, 72], [0.7, -6, 350, 30], [0.85, 36, 368, 0], [0.95, 38, 382, -10], [1, AV, 386, -8]];
var VT = VOL.map(function(v){ return v[0]; }), VZ = VOL.map(function(v){ return v[1]; }), VY = VOL.map(function(v){ return v[2]; }), VP = VOL.map(function(v){ return v[3]; });
var MZ = C.pentes(VT, VZ), MY = C.pentes(VT, VY), MP = C.pentes(VT, VP);
function pied(u, cote){
  var z, y, pt;
  /* (au sol, le pied ne glisse pas : il recule à la vitesse où elle avance) */
  if(u < APPUI){ var a = u / APPUI; z = AV + (AR - AV) * a; y = 386; pt = a < 0.2 ? -8 + 8 * a / 0.2 : a < 0.55 ? 0 : 45 * Math.pow((a - 0.55) / 0.45, 1.4); }
  else { z = C.courbe(VT, VZ, MZ, u); y = C.courbe(VT, VY, MY, u); pt = C.courbe(VT, VP, MP, u); }
  return {p:[cote * 15, y, z], pt:pt};
}
/* un bras plié qui balance (dans les mesures du buste) : phi > 0 (degrés), il part devant. Devant, le coude plie plus et la main rentre
   vers le milieu ; derrière, il s'ouvre un peu. */
function bras(cote, phi){
  var a = phi * Math.PI / 180, av = Math.max(0, phi) / 45, ar = Math.max(0, -phi) / 45, b2 = a + 1.4 + 0.35 * av - 0.2 * ar, S = [cote * 31.5, 151, 0];
  return [S[0] + cote * (8 - 16 * av), S[1] + 50 * Math.cos(a) + 41 * Math.cos(b2), S[2] + 50 * Math.sin(a) + 41 * Math.sin(b2)];
}
HV.COURSE = {cycle:CYCLE, avance:(AV - AR) / APPUI};      /* (de combien elle avance par cycle, dans ses mesures) */
HV.course = function(t){
  var f = ((t / CYCLE) % 1 + 1) % 1, g = pied(f, -1), d = pied((f + 0.5) % 1, 1);
  /* (le bassin : au plus bas au milieu de l'appui, au plus haut en l'air) */
  var hc = (f % 0.5) / 0.5, bob = Math.cos(TAU * (hc - APPUI));
  /* (les bras et les hanches : au plus loin quand elle est en l'air, juste avant que SON pied droit se pose) */
  var w = Math.cos(TAU * (f - 0.9)), yH = 7 * w;
  return avec(P.repos, {bas:[0, 7 + 6 * bob, 6], bang:[9, 0, yH], dos:[3, 0, -2.2 * yH], tete:1.2 * yH, hoche:-9,
    piedG:g.p, pointeG:g.pt, genouG:[-0.1, -0.2, 1], piedD:d.p, pointeD:d.pt, genouD:[0.1, -0.2, 1], ouvG:0.1, ouvD:0.1,
    mainD:bras(1, 44 * w), relD:1, coudeD:[0.25, 0, -1], poingD:0.7, mdirD:[0, -0.3, 1],
    mainG:bras(-1, -26 * w), relG:1, coudeG:[-0.25, 0, -1], arcAxe:[-0.05, 0.95, -0.3], arcDir:[-0.85, 0, 0.5], poingG:0.85,
    sourire:0.1, ouvre:0.3, sourcils:-0.35, plisse:0.1, rougit:0.2});
};
/* ---------- ELLE S'ARRÊTE NET (Romain, 16 h 39 : « quand ils arrivent tous, il faudrait qu'ils se stoppent net, avec peut-être même un
   petit dérapage, parce qu'il y a les bestioles qui arrivent en phase 2 […] qu'ils soient sur leur garde ») : le dernier pied se pose
   loin devant, sur le talon, le corps part en arrière pour freiner, les genoux plient, elle glisse un peu (de la poussière), l'autre
   pied revient, et elle tombe en garde, les yeux sur les ennemis.
   HV.arret(depart) : les images clés, à partir de la pose de course où elle commence à freiner (pour HV.gesteImage(depart, …)) ;
   HV.ARRET.glisse(u) : de combien elle avance encore pendant qu'elle freine (dans ses mesures) ; HV.ARRET.poussiere : quand. */
var V0 = (AV - AR) / (APPUI * CYCLE), FREIN = 0.42;
HV.ARRET = {duree:1.25, vitesse:V0, poussiere:[0.07, 0.4],
  glisse:function(u){ u = Math.max(0, Math.min(FREIN, u)); return V0 * (u - u * u / (2 * FREIN)); }};
HV.arret = function(){
  var g = P.dGarde;
  return [
    /* (le pied droit se pose loin devant, sur le talon ; le corps part en arrière ; les bras s'écartent pour l'équilibre) */
    [0.08, {bas:[0, 30, -18], bang:[-17, 0, 4], dos:[-6, 0, -6], hoche:-2, tete:-6, piedG:[-18, 386, 72], pointeG:-26, genouG:[-0.15, -0.3, 1],
      piedD:[18, 380, -46], pointeD:42, genouD:[0.15, -0.3, 1], mainD:[66, 196, 36], relD:1, coudeD:[1, 0.3, -0.4], poingD:0.4,
      mainG:[-70, 206, 34], relG:1, coudeG:[-1, 0.3, -0.4], sourcils:0.35, ouvre:0.45, plisse:0.35, sourire:-0.2}],
    /* (elle glisse sur ce pied, les genoux pliés ; l'autre pied revient) */
    [0.26, {bas:[0, 54, -20], bang:[-10, 0, 4], dos:[0, 0, -4], hoche:-6, tete:-4, piedG:[-24, 386, 58], pointeG:-16, genouG:[-0.3, -0.3, 1],
      piedD:[24, 378, -12], pointeD:30, genouD:[0.3, -0.3, 1], mainD:[60, 204, 34], relD:1, coudeD:[1, 0.3, -0.4], poingD:0.4,
      mainG:[-66, 212, 34], relG:1, coudeG:[-1, 0.3, -0.4], sourcils:0.1, ouvre:0.3, plisse:0.4, sourire:-0.3}],
    /* (arrêtée : basse, les pieds écartés) */
    [0.44, avec(g, {bas:[0, 44, -2], bang:[2, 0, 0], dos:[6, 0, -4], piedG:[-30, 386, 24], piedD:[30, 386, -12], sourcils:-0.5, ouvre:0.15, plisse:0.3, sourire:-0.3})],
    /* (elle se redresse en garde, un petit rebond, le regard sur les ennemis) */
    [0.7, avec(g, {bas:[0, 22, 2], sourcils:-0.7, plisse:0.3, sourire:-0.35, regX:0.4})],
    [0.95, avec(g, {regX:0.3})],
    [HV.ARRET.duree, g]];
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
  /* EN GARDE : elle surveille — les ennemis arrivent à droite, donc son corps reste tourné vers eux ; seuls les yeux et la tête
     bougent (Romain, 16 h 39 : « ça fait bizarre que dans le en garde, il regarde comme ça face à nous ») : les yeux partent d'abord,
     la tête suit, les épaules à peine. En haut à droite (méfiante), en bas à droite, un coup d'œil rapide de l'autre côté, puis de
     nouveau sur les ennemis. Lentement, en tenant chaque regard. */
  regard:[[0.35, {regX:0.8, regY:-0.3}],
    [0.8, {tete:24, hoche:-7, dos:[10, 0, 1], regX:0.5, regY:-0.4, plisse:0.45, sourcils:-0.8, sourcilsIn:0.3}],
    [2.0, {tete:28, hoche:-8, dos:[10, 0, 1.5], regX:0.6, regY:-0.4, plisse:0.5, sourcils:-0.8, sourcilsIn:0.35}],
    [2.35, {tete:20, hoche:2, regX:0.7, regY:0.5, plisse:0.4, sourcils:-0.7}],
    [2.7, {tete:16, hoche:9, dos:[12, 0, 0], regX:0.5, regY:0.6, plisse:0.35, sourcils:-0.6}],
    [3.8, {tete:14, hoche:10, dos:[12, 0, 0], regX:0.4, regY:0.6, plisse:0.35, sourcils:-0.6, sourire:-0.4}],
    /* (un bruit derrière elle : les yeux d'abord, les sourcils montent, la tête tourne un peu — pas jusqu'à nous) */
    [4.05, {tete:6, hoche:0, regX:-0.9, regY:0, sourcils:0.3, ouvre:0.15, plisse:0}],
    [4.4, {tete:-16, hoche:-2, dos:[10, 0, -6], regX:-0.7, sourcils:0.35, ouvre:0.15, largeB:0.7, plisse:0}],
    [5.2, {tete:-18, hoche:-2, dos:[10, 0, -6], regX:-0.6, sourcils:0.25, ouvre:0.1, largeB:0.7, plisse:0.1}],
    /* (rien : elle revient vers les ennemis, plus décidée) */
    [5.6, {tete:4, regX:0.5, sourcils:-0.8, plisse:0.35, sourire:-0.3}],
    [6.4, {regX:0.3, sourcils:-0.7, plisse:0.25}], [6.9, {}]],
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
  /* ELLE TOMBE SUR LE DOS (Romain, 16 h 39 : « il faut qu'elle tombe direct sur le dos », et au sol « c'est pas naturel […] le corps
     est penché comme si elle était assise »). Comment on tombe en arrière sans se faire mal (la chute arrière des judokas) : on
     s'accroupit pour tomber de moins haut, on rentre le menton, on arrondit le dos, on s'assoit près des talons, on roule sur le dos
     rond, et les deux bras frappent le sol à plat, écartés, pour amortir ; la tête ne touche pas. Ici : touchée, elle recule d'un pas,
     les genoux lâchent, elle s'assoit, roule sur le dos (les jambes remontent), les bras claquent au sol ; puis elle reste allongée
     à plat, sonnée, la tête posée, l'arc à plat par terre à côté de sa main. Elle se redresse en se tournant sur le côté, sur sa
     main, un genou à terre, et se relève en secouant la tête (le relevé d'avant, que Romain trouvait correct). */
  chute:[[0.08, avec(AIE, {bas:[0, 32, -8], bang:[-8, 0, 0], dos:[-16, 0, 8], hoche:-16, mainD:[52, 196, 6], mainG:[-64, 216, 14]})],
    [0.22, avec(AIE, avec(recule(-36, true), {bas:[0, 40, -18], bang:[-12, -4, 0], dos:[-14, -4, 0], hoche:-12, mainD:[60, 170, 10], mainG:[-72, 180, 10], coudeG:[-0.8, -0.3, -0.5]}))],
    /* (les genoux lâchent : elle descend, le dos rond, le menton rentré, les bras devant pour l'équilibre) */
    [0.38, avec(AIE, {bas:[0, 98, -36], bang:[-18, 0, 0], dos:[18, 0, 0], hoche:16, piedG:[-24, 386, 8], piedD:[26, 386, -26], pointeD:10, genouG:[-0.3, -0.4, 1], genouD:[0.3, -0.4, 1],
      mainD:[44, 226, 52], relD:1, coudeD:[1, 0, -0.3], mainG:[-50, 226, 52], relG:1, coudeG:[-1, 0, -0.3], poingD:0.3, arcAxe:[0, 0.6, 0.8], arcDir:[-1, 0, 0.1]})],
    /* (elle s'assoit par terre, près des talons ; les bras s'écartent) */
    [0.5, avec(AIE, {bas:[0, 148, -56], bang:[-48, 0, 0], dos:[22, 0, 0], hoche:18, piedG:[-24, 392, 26], piedD:[26, 392, 12], pointeG:-20, pointeD:-20, genouG:[-0.3, -1, 0.4], genouD:[0.3, -1, 0.4],
      mainD:[72, 236, 10], relD:1, coudeD:[1, 0.2, -0.2], mainG:[-74, 330, -40], relG:0, coudeG:[-1, 0.2, -0.2], poingD:0.2,
      /* (l'arc se couche avec elle : il ne passe jamais sous le plancher) */
      arcAxe:[0, 0.45, 1], arcDir:[-1, 0, 0]})],
    /* (elle roule sur le dos rond : les jambes remontent, les bras claquent au sol, à plat, écartés ; la tête ne touche pas) */
    [0.64, avec(AIE, {bas:[0, 150, -64], bang:[-96, 0, 0], dos:[16, 0, 0], hoche:20, couche:0.4, piedG:[-24, 326, 18], piedD:[26, 316, -2], pointeG:-10, pointeD:-10, genouG:[-0.3, -1, 0.2], genouD:[0.3, -1, 0.2],
      mainG:[-96, 404, -110], relG:0, coudeG:[-1, -0.4, 0], mdirG:[-0.6, 0, -1], pouceG:[0, -1, 0], mainD:[98, 404, -104], relD:0, coudeD:[1, -0.4, 0], mdirD:[0.6, 0, -1], poingD:0.1,
      arcAxe:[0, 0, 1], arcDir:[-1, 0, 0], poingG:0.5})],
    /* (allongée à plat : la tête se pose, les jambes redescendent, genoux pliés ; l'arc à plat par terre) */
    [0.84, avec(KO, {bas:[0, 152, -66], bang:[-90, 0, 0], dos:[2, 0, 0], hoche:4, couche:1, piedG:[-26, 392, 4], piedD:[32, 396, 34], pointeG:-20, pointeD:-34, genouG:[-0.3, -1, 0.3], genouD:[0.35, -1, 0.5],
      mainG:[-92, 404, -112], relG:0, coudeG:[-1, -0.3, 0], mdirG:[-0.5, 0, -1], pouceG:[0, -1, 0], mainD:[96, 404, -100], relD:0, coudeD:[1, -0.3, 0], mdirD:[0.5, 0, -1], poingD:0.2,
      arcAxe:[0, 0, 1], arcDir:[-1, 0, 0], poingG:0.4})],
    /* (sonnée : la tête roule un peu d'un côté, elle grogne, ouvre un œil) */
    [1.3, {bas:[0, 152, -66], bang:[-90, 0, 0], dos:[2, 0, 0], hoche:4, couche:1, tete:14, piedG:[-26, 392, 4], piedD:[32, 396, 34], pointeG:-20, pointeD:-34, genouG:[-0.3, -1, 0.3], genouD:[0.35, -1, 0.5],
      mainG:[-92, 404, -112], relG:0, coudeG:[-1, -0.3, 0], mdirG:[-0.5, 0, -1], pouceG:[0, -1, 0], mainD:[96, 404, -100], relD:0, coudeD:[1, -0.3, 0], mdirD:[0.5, 0, -1], poingD:0.2,
      arcAxe:[0, 0, 1], arcDir:[-1, 0, 0], poingG:0.4, plisse:1, sourcilsIn:0.9, sourcils:0.1, ouvre:0.1, largeB:0.6, sourire:-0.6}],
    [1.9, {bas:[0, 152, -66], bang:[-90, 0, 0], dos:[2, 0, 0], hoche:2, couche:1, tete:-6, piedG:[-26, 392, 4], piedD:[30, 396, 26], pointeG:-20, pointeD:-30, genouG:[-0.3, -1, 0.3], genouD:[0.35, -1, 0.5],
      mainG:[-92, 404, -112], relG:0, coudeG:[-1, -0.3, 0], mdirG:[-0.5, 0, -1], pouceG:[0, -1, 0], mainD:[90, 404, -96], relD:0, coudeD:[1, -0.3, 0], mdirD:[0.5, 0, -1], poingD:0.4,
      arcAxe:[0, 0, 1], arcDir:[-1, 0, 0], poingG:0.6, plisse:0.6, sourcilsIn:0.8, sourcils:0.2, ouvre:0.35, largeB:0.7, sourire:-0.7, bouchex:0.4}],
    [2.25, {bas:[0, 152, -66], bang:[-90, 0, 0], dos:[2, 0, 0], hoche:-2, couche:1, tete:-4, piedG:[-26, 392, 4], piedD:[30, 396, 20], pointeG:-20, pointeD:-26, genouG:[-0.3, -1, 0.3], genouD:[0.35, -1, 0.5],
      mainG:[-88, 404, -104], relG:0, coudeG:[-1, -0.3, 0], mdirG:[-0.5, 0, -1], pouceG:[0, -1, 0], mainD:[80, 404, -92], relD:0, coudeD:[1, -0.3, 0], mdirD:[0.5, 0, -1], poingD:0.5,
      arcAxe:[0, 0, 1], arcDir:[-1, 0, 0], poingG:0.8, plisse:0.45, sourcilsIn:0.7, sourcils:-0.2, ouvre:0.1, sourire:-0.5}],
    /* (elle se redresse en se tournant sur SON côté droit, la main droite à plat par terre, l'arc repris) */
    [2.75, avec(KO, {bas:[-8, 140, -48], bang:[-38, -10, -22], dos:[18, -8, -10], hoche:8, couche:0, piedG:[-26, 392, 20], piedD:[28, 392, 14], pointeG:-15, pointeD:-15, genouG:[-0.2, -1, 0.4], genouD:[0.5, -1, 0.4],
      mainG:[-62, 396, -86], relG:0, coudeG:[-1, 0.1, -0.2], mdirG:[0, 0.3, 1], mainD:[18, 330, -12], relD:0, coudeD:[1, 0, -0.3], poingD:0.3, plisse:0.7, sourcilsIn:0.8,
      arcAxe:[0, 0.12, 1], arcDir:[-1, 0, 0]})],
    /* (elle se redresse sur sa main, ramène les jambes sous elle) */
    [3.25, avec(KO, {bas:[-4, 118, -18], bang:[30, -6, 0], dos:[20, -4, 0], hoche:10, pen:4, piedG:[-28, 386, 26], piedD:[26, 394, -10], pointeD:80, genouG:[-0.4, -0.5, 1], genouD:[0.2, 0.9, 1],
      mainG:[-58, 392, 34], relG:0, mainD:[22, 330, 40], relD:0, plisse:0.6, sourcilsIn:0.7, arcAxe:[0, 0.25, 1], arcDir:[-1, 0, 0.1]})],
    /* (un genou à terre, la main sur le genou) */
    [3.75, {bas:[0, 86, -12], bang:[16, 0, 0], dos:[16, 0, 0], piedD:[15, 394, -60], pointeD:88, genouD:[0.1, 0.9, 1], piedG:[-27, 386, 46], genouG:[-0.3, -0.5, 1],
      mainD:[-18, 316, 50], relD:0, mdirD:[-1, 0.4, 0.3], poingD:0.2, mainG:[-62, 330, 50], relG:0, hoche:10, plisse:0.4, sourcilsIn:0.6, sourire:-0.4,
      arcAxe:[0, 0.45, 0.9], arcDir:[-1, 0, 0.2]}],
    /* (elle se relève, encore penchée ; puis secoue la tête) */
    [4.35, {bas:[0, 40, -4], bang:[18, 0, 0], dos:[16, 0, 0], piedD:[28, 386, -20], mainD:[-8, 290, 44], relD:0, mdirD:[-1, 0.4, 0.3], hoche:6, sourcilsIn:0.4, plisse:0.2}],
    [4.6, {pen:10, sourcils:-0.4, plisse:0.3}], [4.8, {pen:-10, sourcils:-0.4, plisse:0.3}], [5.0, {pen:6, sourcils:-0.6}], [5.6, {}]],
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

/* ==========================================================
   LES AUTRES MOUVEMENTS DU DONJON (Romain, 23 novembre, 17 h 44 : « tu peux continuer un petit peu toutes les animations qu'il y a
   dans le donjon ») — d'après l'inventaire de LISEZ-MOI.md (ce que le donjon appelle aujourd'hui dans heros-anime.js). Les effets
   (la toile, le givre, les rats, la langue du crapaud, la main de Léo, la lueur de l'amulette) sont dessinés par le film
   (essai/film-donjon.html), pas par le héros.
   ========================================================== */
/* allongée sur le dos, à plat (la fin de la chute) */
var ALLONGEE = {bas:[0, 152, -66], bang:[-90, 0, 0], dos:[2, 0, 0], hoche:4, couche:1, piedG:[-26, 392, 4], piedD:[32, 396, 34], pointeG:-20, pointeD:-34, genouG:[-0.3, -1, 0.3], genouD:[0.35, -1, 0.5],
  mainG:[-92, 404, -112], relG:0, coudeG:[-1, -0.3, 0], mdirG:[-0.5, 0, -1], pouceG:[0, -1, 0], mainD:[96, 404, -100], relD:0, coudeD:[1, -0.3, 0], mdirD:[0.5, 0, -1], poingD:0.2,
  arcAxe:[0, 0, 1], arcDir:[-1, 0, 0], poingG:0.4};
HV.ALLONGEE = avec(P.dGarde, ALLONGEE);
/* (le relevé de la chute, que Romain a validé : à partir de 2,75 s, remis à zéro) */
var RELEVE = HV.DONJON.chute.filter(function(k){ return k[0] >= 2.75; }).map(function(k){ return [k[0] - 2.75, k[1]]; });
function decale(L, dt){ return L.map(function(k){ return [k[0] + dt, k[1]]; }); }
/* un frisson : de petits allers-retours rapides de A, de t0 à t1, autour d'une pose */
function frissons(pose, t0, t1, pas, f){
  var L = [], t, i = 0;
  for(t = t0; t < t1 - 1e-6; t += pas, i++) L.push([t, avec(pose, f(i % 2 ? 1 : -1, (t - t0) / (t1 - t0)))]);
  return L;
}

/* C'EST SON TOUR : elle se redresse, inspire, serre son arc, un petit signe de tête décidé */
HV.DONJON.choisi = [[0.25, {bas:[0, 14, 2], dos:[6, 0, -4], hoche:-8, sourcils:0.4, ouvre:0.15, plisse:-0.2, regX:0.2}],
  [0.55, {bas:[0, 10, 2], dos:[4, 0, -4], hoche:8, sourcils:-0.6, sourire:0.4, plisse:0.2, poingG:0.95, poingD:0.7}],
  [0.85, {bas:[0, 16, 2], dos:[6, 0, -4], hoche:-4, sourcils:-0.8, sourire:0.5, plisse:0.3, poingG:0.95, poingD:0.7, regX:0.4}],
  [1.8, {bas:[0, 18, 2], dos:[6, 0, -4], hoche:-4, sourcils:-0.8, sourire:0.5, plisse:0.3, poingG:0.95, poingD:0.7, regX:0.3}], [2.3, {}]];

/* LE COUP DE DAGUE : SA main gauche tire la dague de la ceinture, elle prend son élan, un grand pas en avant vers l'ennemi et un
   revers de haut en bas, le bras au bout ; elle revient en garde et range la dague */
HV.DONJON.dague = [[0.18, {mainD:[36, 236, 8], coudeD:[0.9, 0.2, -0.5], mdirD:[0, 1, 0], poingD:0.9, hoche:8, regY:0.4}],
  [0.3, {mainD:[42, 222, 10], coudeD:[0.9, 0.2, -0.5], mdirD:[0, 1, 0], poingD:1, dague:1, hoche:2}],
  [0.48, {mainD:[60, 140, -26], coudeD:[1, -0.3, -0.3], pouceD:[0, -0.5, 1], poingD:1, dague:1, dos:[-4, 0, 14], bang:[0, 0, 6], bas:[0, 30, -6], sourcils:-1, plisse:0.4, sourire:-0.3}],
  [0.62, {piedD:[30, 386, 92], genouD:[0.3, -0.1, 1], pointeD:-6, piedG:[-30, 386, -36], pointeG:30, bas:[4, 50, 40], bang:[16, 0, 6], dos:[14, 0, 8],
    mainD:[24, 150, 86], coudeD:[0.6, 0.3, -0.3], pouceD:[0, -0.6, 1], poingD:1, dague:1, ouvre:0.65, sourcils:-1, plisse:0.3, largeB:0.8}],
  [0.74, {piedD:[30, 386, 92], genouD:[0.3, -0.1, 1], pointeD:-6, piedG:[-30, 386, -36], pointeG:30, bas:[4, 52, 42], bang:[16, 0, 4], dos:[16, 0, -2],
    mainD:[8, 206, 76], coudeD:[0.6, 0.6, -0.3], pouceD:[0, 0.3, 1], poingD:1, dague:1, ouvre:0.4, sourcils:-1, plisse:0.4}],
  [1.15, {piedD:[30, 386, 92], genouD:[0.3, -0.1, 1], pointeD:-6, piedG:[-30, 386, -36], pointeG:30, bas:[4, 50, 40], bang:[14, 0, 4], dos:[14, 0, 0],
    mainD:[10, 204, 74], coudeD:[0.6, 0.6, -0.3], pouceD:[0, 0.3, 1], poingD:1, dague:1, ouvre:0.1, sourcils:-0.8, plisse:0.3}],
  /* (elle se repousse sur le pied de devant et revient) */
  [1.5, {piedD:[30, 376, 20], pointeD:20, bas:[0, 34, 10], mainD:[46, 200, 40], coudeD:[0.9, 0.3, -0.4], pouceD:[0, -0.5, 1], poingD:1, dague:1, sourcils:-0.7}],
  [1.85, {mainD:[36, 236, 8], coudeD:[0.9, 0.2, -0.5], mdirD:[0, 1, 0], poingD:1, dague:1, hoche:6, regY:0.3}],
  [1.95, {mainD:[36, 236, 8], coudeD:[0.9, 0.2, -0.5], mdirD:[0, 1, 0], poingD:0.9, dague:0, hoche:6, regY:0.3}], [2.4, {}]];

/* LE GIVRE : touchée par le froid, elle se recroqueville, les bras serrés contre elle, les genoux l'un contre l'autre ; elle grelotte
   (des frissons rapides), puis s'ébroue d'un coup et revient en garde */
var GELEE = {bas:[0, 40, -4], bang:[10, 0, 0], dos:[24, 0, 0], hoche:14, mainD:[-14, 190, 40], relD:1, coudeD:[0.6, 0.5, -0.2], mdirD:[-1, 0, 0.3], poingD:0.6,
  mainG:[-22, 204, 42], relG:1, coudeG:[-0.6, 0.5, -0.2], arcAxe:[-0.35, 1, 0.3], arcDir:[-0.6, 0, 0.8], piedG:[-14, 386, 8], piedD:[14, 386, -4], genouG:[0.2, 0, 1], genouD:[-0.2, 0, 1],
  ouvG:-0.1, ouvD:-0.1, plisse:0.8, sourcilsIn:1, sourcils:0.2, ouvre:0.12, largeB:1.25, sourire:-0.5};
HV.DONJON.froid = [[0.08, avec(AIE, {bas:[0, 30, -6], dos:[-10, 0, 4], hoche:-10})], [0.35, GELEE]]
  .concat(frissons(GELEE, 0.45, 2.0, 0.07, function(s, a){ return {bas:[s * 2.2, 40, -4], pen:s * 3, sourcilsAsym:s * 0.2}; }))
  .concat([[2.1, GELEE],
    /* (elle s'ébroue : les bras s'ouvrent, la tête secoue) */
    [2.28, {bas:[0, 30, 0], pen:-10, mainD:[64, 210, 20], relD:1, mainG:[-66, 214, 22], relG:1, sourcils:0.2, plisse:0.9, ouvre:0.3, largeB:0.8}],
    [2.42, {bas:[0, 30, 0], pen:10, mainD:[64, 210, 20], relD:1, mainG:[-66, 214, 22], relG:1, sourcils:0.2, plisse:0.9, ouvre:0.3, largeB:0.8}],
    [2.56, {bas:[0, 30, 0], pen:-6, mainD:[60, 212, 20], relD:1, mainG:[-64, 216, 22], relG:1, sourcils:-0.4, plisse:0.5}],
    [3.1, {sourcils:-0.7, plisse:0.3, sourire:-0.2}], [3.5, {}]]);

/* LES RATS (le grouillement) : ils lui grimpent dessus — elle sursaute, regarde ses pieds, dégoûtée, tape des pieds l'un après
   l'autre, chasse les rats de sa hanche du revers de la main, puis frissonne de dégoût */
var RATS_V = {hoche:20, regY:1, sourire:-0.9, bouchex:0.6, sourcilsIn:0.7, ouvre:0.3, plisse:0.4};
function tape(cote, haut){
  var R = avec(RATS_V, {bas:[cote === 'D' ? -4 : 4, 26, 2], mainD:[62, 204, 18], relD:1, coudeD:[1, 0.2, -0.3], poingD:0.2});
  if(cote === 'D') R.piedD = [30, haut ? 352 : 386, -10]; else R.piedG = [-32, haut ? 352 : 386, 18];
  R['pointe' + cote] = haut ? 25 : 0; R['genou' + cote] = cote === 'D' ? [0.5, -0.2, 1] : [-0.5, -0.2, 1];
  return R;
}
HV.DONJON.rats = [[0.12, {hoche:16, regY:0.9, sourcils:0.7, ouvre:0.5, plisse:-0.3, bas:[0, 20, -4]}],
  [0.35, tape('D', true)], [0.5, tape('D', false)], [0.68, tape('G', true)], [0.83, tape('G', false)],
  [1.0, tape('D', true)], [1.15, tape('D', false)], [1.33, tape('G', true)], [1.48, tape('G', false)],
  /* (le revers de la main sur la hanche, deux fois) */
  [1.7, avec(RATS_V, {bas:[0, 30, 0], mainD:[40, 232, 30], relD:1, coudeD:[1, 0.3, -0.3], mdirD:[0, 1, 0.4], poingD:0.1})],
  [1.85, avec(RATS_V, {bas:[0, 30, 0], mainD:[50, 222, 40], relD:1, coudeD:[1, 0.3, -0.3], mdirD:[0.3, 1, 0.6], poingD:0.1})],
  [2.0, avec(RATS_V, {bas:[0, 30, 0], mainD:[40, 232, 30], relD:1, coudeD:[1, 0.3, -0.3], mdirD:[0, 1, 0.4], poingD:0.1})],
  [2.15, avec(RATS_V, {bas:[0, 30, 0], mainD:[50, 222, 40], relD:1, coudeD:[1, 0.3, -0.3], mdirD:[0.3, 1, 0.6], poingD:0.1})],
  /* (un frisson de dégoût) */
  [2.4, {bas:[0, 20, 0], pen:-6, hoche:-6, sourire:-1, bouchex:0.7, plisse:0.9, sourcilsIn:0.8, ouvre:0.25, largeB:0.6}],
  [2.52, {bas:[0, 20, 0], pen:6, hoche:-6, sourire:-1, bouchex:0.7, plisse:0.9, sourcilsIn:0.8, ouvre:0.25, largeB:0.6}],
  [2.64, {bas:[0, 20, 0], pen:-3, hoche:-4, sourire:-0.8, bouchex:0.5, plisse:0.6, sourcilsIn:0.6}],
  [3.2, {sourire:-0.3, sourcils:-0.6}], [3.6, {}]];

/* LE GRAND COUP DE POING : bien plus fort que le coup — la tête part en arrière, elle recule de deux pas, sonnée ; elle secoue la
   tête, s'essuie la bouche du dos de la main, furieuse, et revient en garde */
HV.DONJON.poing = [[0.06, avec(AIE, {bas:[0, 30, -14], bang:[-12, 0, 0], dos:[-24, 0, 10], hoche:-22, pen:-12, mainD:[62, 186, 0], mainG:[-72, 204, 6]})],
  [0.2, avec(AIE, avec(recule(-44, true), {bas:[0, 36, -28], bang:[-16, -4, 0], dos:[-18, -6, 10], hoche:-14, pen:-10, mainD:[64, 180, 0], mainG:[-74, 196, 4]}))],
  [0.36, avec(AIE, avec(recule(-56), {piedG:[-32, 370, -18], pointeG:25, bas:[0, 40, -36], bang:[-8, -4, 0], dos:[-10, -4, 6], hoche:-8, pen:-6}))],
  [0.55, avec(KO, avec(recule(-56), {piedG:[-32, 386, -14], bas:[0, 44, -32], bang:[8, 0, 0], dos:[10, 0, 0], hoche:6, pen:4}))],
  [0.85, avec(KO, avec(recule(-56), {piedG:[-32, 386, -14], bas:[0, 44, -32], bang:[8, 0, 0], dos:[10, 0, 0], hoche:4, pen:10}))],
  [1.0, avec(KO, avec(recule(-56), {piedG:[-32, 386, -14], bas:[0, 44, -32], bang:[8, 0, 0], dos:[10, 0, 0], hoche:4, pen:-10}))],
  [1.15, avec(recule(-56), {piedG:[-32, 386, -14], bas:[0, 42, -30], bang:[8, 0, 0], dos:[10, 0, 0], hoche:4, pen:4, plisse:0.5, sourcilsIn:0.6})],
  /* (elle s'essuie la bouche du dos de la main, furieuse) */
  [1.5, avec(recule(-56), {piedG:[-32, 386, -14], bas:[0, 40, -30], bang:[6, 0, 0], dos:[8, 0, 0], hoche:6, mainD:[10, 122, 40], relD:1, coudeD:[1, 0.5, -0.2], mdirD:[-1, 0, 0.2], poingD:0.7,
    sourcils:-1, plisse:0.5, sourire:-0.6})],
  [1.7, avec(recule(-56), {piedG:[-32, 386, -14], bas:[0, 40, -30], bang:[6, 0, 0], dos:[8, 0, 0], hoche:6, mainD:[-14, 124, 44], relD:1, coudeD:[1, 0.5, -0.2], mdirD:[-1, 0, 0.2], poingD:0.7,
    sourcils:-1, plisse:0.5, sourire:-0.6})],
  /* (elle revient à sa place, un pas après l'autre) */
  [2.05, avec(recule(-30, true), {bas:[0, 34, -12], sourcils:-1, plisse:0.4, sourire:-0.5})],
  [2.35, {sourcils:-0.9, plisse:0.3, sourire:-0.4}], [2.8, {}]];

/* LA TOILE : la toile la colle — les bras plaqués contre le corps, les genoux serrés ; elle se débat (elle se tord à droite, à
   gauche, de plus en plus fort), se ramasse… et la déchire en ouvrant les bras d'un coup ; fière d'elle */
var COLLEE = {bas:[0, 30, -4], dos:[0, 0, 0], bang:[4, 0, 0], mainG:[-38, 232, 14], relG:1, coudeG:[-0.3, 0, -1], arcAxe:[-0.05, 1, 0.05], arcDir:[-0.6, 0, 0.8],
  mainD:[38, 232, 14], relD:1, coudeD:[0.3, 0, -1], poingD:0.8, piedG:[-16, 386, 6], piedD:[16, 386, -6], genouG:[-0.1, 0, 1], genouD:[0.1, 0, 1], ouvG:0.1, ouvD:0.1,
  sourcils:-0.6, sourcilsIn:0.4, bouchex:0.5, sourire:-0.4};
HV.DONJON.toile = [[0.1, {sourcils:0.6, ouvre:0.45, bas:[0, 30, -4], plisse:-0.2}], [0.35, COLLEE],
  [0.65, avec(COLLEE, {dos:[0, 0, 14], bas:[-3, 30, -4], hoche:6, plisse:0.4})], [0.9, avec(COLLEE, {dos:[0, 0, -14], bas:[3, 30, -4], hoche:6, plisse:0.4})],
  [1.15, avec(COLLEE, {dos:[6, 0, 18], bas:[-4, 32, -4], hoche:10, plisse:0.7, largeB:0.5, sourire:-0.6})], [1.4, avec(COLLEE, {dos:[6, 0, -18], bas:[4, 32, -4], hoche:10, plisse:0.7, largeB:0.5, sourire:-0.6})],
  /* (elle se ramasse, rassemble ses forces) */
  [1.75, avec(COLLEE, {bas:[0, 46, -2], dos:[14, 0, 0], hoche:14, mainD:[30, 218, 26], mainG:[-30, 218, 26], plisse:0.95, sourire:-0.7, largeB:0.4, sourcils:-1})],
  /* (et déchire la toile : les bras s'ouvrent d'un coup, elle crie) */
  [1.92, {bas:[0, 10, 0], dos:[-6, 0, 0], bang:[0, 0, 0], hoche:-10, mainD:[88, 168, 10], relD:1, coudeD:[1, -0.2, -0.3], poingD:0.9, mainG:[-88, 170, 10], relG:1, coudeG:[-1, -0.2, -0.3],
    arcAxe:[-0.3, 1, 0], arcDir:[-0.3, 0, 1], ouvre:0.75, sourcils:-1, plisse:0.3, largeB:0.9}],
  [2.15, {bas:[0, 12, 0], dos:[-4, 0, 0], hoche:-8, mainD:[84, 172, 10], relD:1, coudeD:[1, -0.2, -0.3], mainG:[-84, 174, 10], relG:1, coudeG:[-1, -0.2, -0.3], arcAxe:[-0.3, 1, 0], arcDir:[-0.3, 0, 1],
    ouvre:0.3, sourcils:-0.6, sourire:0.4}],
  [2.6, {sourire:0.7, sourcils:-0.3, plisse:0.2}], [3.1, {}]];

/* LE CRAPAUD : sa langue la colle — elle est tirée en avant, les pieds décollent, et elle disparaît (le film la tire hors de
   l'image) ; puis il la recrache : elle revient en volant, roulée en boule, retombe assise, couverte de bave ; elle s'ébroue comme
   un chien, dégoûtée, se relève et s'essuie la figure.
   HV.CRAPAUD : quand elle part (avalee), quand elle revient (recrachee), quand elle touche le sol (pose) — pour le film. */
HV.CRAPAUD = {colle:0.5, avalee:1.05, recrachee:2.2, pose:2.62};
var BOULE = {leve:40, bas:[0, 96, -10], bang:[-30, 0, 0], dos:[30, 0, 0], hoche:24, piedG:[-20, 330, 40], piedD:[20, 330, 40], pointeG:20, pointeD:20, genouG:[-0.2, -1, 0.6], genouD:[0.2, -1, 0.6],
  mainD:[24, 230, 60], relD:1, coudeD:[0.8, 0.4, -0.2], mainG:[-28, 232, 60], relG:1, coudeG:[-0.8, 0.4, -0.2], arcAxe:[-0.6, 0.8, 0.2], arcDir:[-0.4, 0, 1],
  plisse:1, sourcilsIn:0.9, ouvre:0.3, largeB:0.6, sourire:-0.6};
var ASSISE = {bas:[0, 148, -56], bang:[-40, 0, 0], dos:[18, 0, 0], hoche:10, piedG:[-24, 392, 30], piedD:[26, 392, 16], pointeG:-20, pointeD:-20, genouG:[-0.3, -1, 0.4], genouD:[0.3, -1, 0.4],
  mainD:[40, 388, -70], relD:0, coudeD:[1, 0, -0.3], mdirD:[0, 0.3, -1], poingD:0.1, mainG:[-48, 388, -74], relG:0, coudeG:[-1, 0, -0.3], arcAxe:[0, 0.3, 1], arcDir:[-1, 0, 0.1]};
var BAVE = {sourire:-1, bouchex:0.7, plisse:0.9, sourcilsIn:0.8, ouvre:0.3, largeB:0.5};
HV.DONJON.crapaud = [[0.45, {sourcils:-0.6}],
  /* (la langue la colle : surprise, elle est tirée vers l'avant, les bras partent en arrière) */
  [0.6, avec(AIE, {bas:[0, 30, 10], bang:[14, 0, 0], dos:[10, 0, 0], hoche:-6, mainD:[50, 200, -40], mainG:[-60, 206, -40], sourcils:0.7, plisse:0.2, ouvre:0.7})],
  [0.8, avec(AIE, {bas:[0, 24, 24], bang:[22, 0, 0], dos:[14, 0, 0], hoche:-10, piedG:[-30, 380, -40], pointeG:50, mainD:[54, 196, -50], mainG:[-64, 200, -50], sourcils:0.8, ouvre:0.8})],
  [1.0, avec(AIE, {leve:40, bas:[0, 20, 20], bang:[30, 0, 0], dos:[14, 0, 0], hoche:-12, piedG:[-24, 372, -40], piedD:[24, 372, -30], pointeG:60, pointeD:60, mainD:[54, 190, -56], mainG:[-64, 194, -56], sourcils:0.9, ouvre:0.9})],
  [HV.CRAPAUD.avalee, avec(AIE, {leve:50, bas:[0, 20, 20], bang:[32, 0, 0], dos:[14, 0, 0], hoche:-12, piedG:[-24, 372, -40], piedD:[24, 372, -30], pointeG:60, pointeD:60, mainD:[54, 190, -56], mainG:[-64, 194, -56], sourcils:0.9, ouvre:0.9})],
  /* (recrachée : en boule, elle vole) */
  [HV.CRAPAUD.recrachee, BOULE], [HV.CRAPAUD.pose - 0.08, avec(BOULE, {leve:6})],
  /* (elle retombe assise, couverte de bave) */
  [HV.CRAPAUD.pose, avec(BAVE, ASSISE)], [3.0, avec(BAVE, ASSISE)],
  /* (elle s'ébroue comme un chien : la tête et les épaules de droite à gauche) */
  [3.12, avec(BAVE, avec(ASSISE, {pen:-12, dos:[18, 0, -14]}))], [3.24, avec(BAVE, avec(ASSISE, {pen:12, dos:[18, 0, 14]}))],
  [3.36, avec(BAVE, avec(ASSISE, {pen:-12, dos:[18, 0, -14]}))], [3.48, avec(BAVE, avec(ASSISE, {pen:12, dos:[18, 0, 14]}))], [3.62, avec(BAVE, ASSISE)],
  /* (elle se relève : un genou, puis debout) */
  [4.1, avec(BAVE, {bas:[0, 86, -12], bang:[16, 0, 0], dos:[16, 0, 0], piedD:[15, 394, -60], pointeD:88, genouD:[0.1, 0.9, 1], piedG:[-27, 386, 46], genouG:[-0.3, -0.5, 1],
    mainD:[-18, 316, 50], relD:0, mdirD:[-1, 0.4, 0.3], poingD:0.2, mainG:[-62, 330, 50], relG:0, hoche:8, arcAxe:[0, 0.45, 0.9], arcDir:[-1, 0, 0.2]})],
  [4.6, avec(BAVE, {bas:[0, 34, -4], bang:[12, 0, 0], dos:[12, 0, 0], hoche:4})],
  /* (elle s'essuie la figure avec sa manche) */
  [5.0, avec(BAVE, {mainD:[-6, 112, 44], relD:1, coudeD:[1, 0.6, -0.1], mdirD:[-1, 0.2, 0.1], poingD:0.6, hoche:6})],
  [5.25, avec(BAVE, {mainD:[-26, 118, 40], relD:1, coudeD:[1, 0.6, -0.1], mdirD:[-1, 0.2, 0.1], poingD:0.6, hoche:6})],
  [5.7, {sourire:-0.5, bouchex:0.4, sourcils:-0.6, plisse:0.3}], [6.2, {}]];

/* LÉO L'ATTRAPE ET LA JETTE (phase 3) : sa grande main la saisit par la taille et la soulève ; elle se débat, les jambes dans le
   vide, pousse sur ses doigts ; il la secoue, prend son élan… et la jette au loin : elle vole, retombe sur le dos, et se relève
   comme après une chute.
   HV.LEO : quand la main la prend, la soulève, la lance, quand elle touche le sol — pour le film. */
HV.LEO = {prise:0.5, haut:1.2, elan:2.5, lance:2.75, sol:3.3};
var TENUE = {leve:60, bas:[0, 20, -4], bang:[6, 0, 0], dos:[6, 0, 0], hoche:-4, mainD:[30, 228, 34], relD:1, coudeD:[0.9, 0.3, -0.3], mdirD:[-0.6, 0, 1], poingD:0.2,
  mainG:[-34, 226, 34], relG:1, coudeG:[-0.9, 0.3, -0.3], mdirG:[0.6, 0, 1], arcAxe:[-0.6, 0.8, 0], arcDir:[-0.4, 0, 1], piedG:[-20, 400, 0], piedD:[20, 400, 4], pointeG:50, pointeD:50,
  genouG:[-0.1, 0, 1], genouD:[0.1, 0, 1], sourcils:0.3, sourcilsIn:0.7, ouvre:0.45, plisse:0.3, sourire:-0.5};
function gigote(i){ var s = i % 2 ? 1 : -1; return avec(TENUE, {piedG:[-20, 392 - 10 * s, 14 * s], piedD:[20, 392 + 10 * s, -14 * s], pointeG:40 + 15 * s, pointeD:40 - 15 * s, dos:[6, 0, 6 * s], sourcils:-0.2 * s, ouvre:0.3 + 0.2 * s}); }
HV.DONJON.leo = [[0.4, {sourcils:0.6, ouvre:0.3, hoche:-8, regY:-0.5}],
  [HV.LEO.prise, avec(AIE, {bas:[0, 26, 0], mainD:[36, 222, 30], relD:1, mainG:[-40, 220, 30], relG:1, sourcils:0.7, ouvre:0.6})],
  [HV.LEO.haut, avec(TENUE, {ouvre:0.7, sourcils:0.8})]]
  .concat([1.45, 1.65, 1.85, 2.05, 2.25].map(function(t, i){ return [t, gigote(i)]; }))
  .concat([[HV.LEO.elan, avec(TENUE, {leve:76, bang:[-10, 0, 0], sourcils:0.8, ouvre:0.6, plisse:0.6})],
    /* (lancée : elle vole en se tordant, les bras et les jambes en l'air) */
    [HV.LEO.lance, avec(AIE, {leve:84, bas:[0, 40, -20], bang:[-40, 0, 0], dos:[-10, 0, 0], hoche:-14, mainD:[60, 150, -30], relD:1, coudeD:[1, -0.3, -0.3], mainG:[-66, 150, -30], relG:1, coudeG:[-1, -0.3, -0.3],
      piedG:[-22, 360, 40], piedD:[22, 340, 30], pointeG:30, pointeD:30, genouG:[-0.2, -1, 0.5], genouD:[0.2, -1, 0.5], ouvre:0.8})],
    [HV.LEO.sol - 0.1, avec(AIE, {leve:30, bas:[0, 120, -50], bang:[-70, 0, 0], dos:[6, 0, 0], hoche:14, couche:0.5, piedG:[-24, 340, 18], piedD:[26, 330, -2], pointeG:-10, pointeD:-10,
      genouG:[-0.3, -1, 0.2], genouD:[0.3, -1, 0.2], mainG:[-90, 390, -100], relG:0, coudeG:[-1, -0.4, 0], mainD:[94, 390, -96], relD:0, coudeD:[1, -0.4, 0], arcAxe:[0, 0.2, 1], arcDir:[-1, 0, 0]})],
    [HV.LEO.sol, avec(KO, ALLONGEE)], [HV.LEO.sol + 1.0, avec(KO, avec(ALLONGEE, {tete:12}))], [HV.LEO.sol + 1.5, avec(KO, avec(ALLONGEE, {tete:-4, ouvre:0.3}))]])
  .concat(decale(RELEVE, HV.LEO.sol + 2.0));

/* L'AMULETTE (la relève dorée) : elle est à terre ; l'amulette sur sa poitrine s'allume, une lumière dorée la soulève d'un seul
   mouvement, les bras qui s'ouvrent ; elle est debout, étonnée ; l'amulette se brise (le film) ; elle se remet en garde, décidée.
   C'est un geste qui part d'ELLE ALLONGÉE (HV.ALLONGEE) : le film la pose à terre avant. HV.AMULETTE : quand l'amulette s'allume,
   quand elle se brise. */
HV.AMULETTE = {lueur:0.3, debout:1.5, brise:1.9};
HV.DONJON.amulette = [[0.01, avec(KO, ALLONGEE)], [0.3, avec(KO, ALLONGEE)], [0.7, avec(ALLONGEE, {hoche:-6, sourcils:0.5, ouvre:0.2, plisse:-0.2, sourire:0})],
  /* (la lumière la soulève : le dos se redresse, elle passe à genoux, les bras s'ouvrent) */
  [1.0, {leve:14, bas:[0, 90, -20], bang:[-10, 0, 0], dos:[-6, 0, 0], hoche:-12, piedG:[-24, 392, 20], piedD:[24, 392, 0], pointeG:20, pointeD:20, genouG:[-0.4, -0.4, 1], genouD:[0.4, -0.4, 1],
    mainD:[74, 220, 30], relD:1, coudeD:[1, 0.2, -0.3], poingD:0.1, mainG:[-74, 222, 30], relG:1, coudeG:[-1, 0.2, -0.3], arcAxe:[-0.4, 1, 0.1], arcDir:[-0.3, 0, 1],
    sourcils:0.9, ouvre:0.6, plisse:-0.3, sourire:0.3}],
  [HV.AMULETTE.debout, {leve:6, bas:[0, 6, 0], hoche:-14, mainD:[80, 190, 20], relD:1, coudeD:[1, 0.2, -0.3], poingD:0.1, mainG:[-80, 192, 20], relG:1, coudeG:[-1, 0.2, -0.3],
    arcAxe:[-0.4, 1, 0.1], arcDir:[-0.3, 0, 1], sourcils:1, ouvre:0.5, plisse:-0.4, sourire:0.6}],
  [HV.AMULETTE.brise + 0.1, {bas:[0, 14, 0], hoche:10, regY:0.8, mainD:[20, 190, 40], relD:1, coudeD:[0.8, 0.5, -0.3], mdirD:[-0.6, -0.2, 0.6], poingD:0.2, sourcils:0.6, ouvre:0.3, sourire:0}],
  [2.6, {bas:[0, 14, 0], hoche:8, regY:0.6, mainD:[20, 192, 40], relD:1, coudeD:[0.8, 0.5, -0.3], mdirD:[-0.6, -0.2, 0.6], poingD:0.4, sourcilsIn:0.6, sourcils:0.2, sourire:-0.2}],
  [3.1, {sourcils:-0.8, plisse:0.3, sourire:0.3, regX:0.4}], [3.6, {}]];

/* (le donjon comme une position : pour les pages d'essai, gestes.html#donjon:tir) */
HV.POSITIONS.donjon = {titre:'En garde', base:'dGarde', attente:[99, 99], gestes:HV.DONJON};
HV.NOMS_DONJON = {course:'Elle arrive en courant', regard:'En garde, elle regarde autour', tir:'Elle tire', coup:'Elle prend un coup', chute:'Elle tombe… et se relève', joie:'Victoire !',
  choisi:'C\'est son tour', dague:'Coup de dague', froid:'Le givre', rats:'Les rats !', poing:'Un grand coup de poing', toile:'Prise dans la toile', crapaud:'Avalée… et recrachée',
  leo:'Léo l\'attrape et la jette', amulette:'L\'amulette la relève'};
})(window);
